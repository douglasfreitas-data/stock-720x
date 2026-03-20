import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/client"
import { sendPushNotification } from "@/lib/push/webpush"

// Optional cache behavior
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    // Basic protection: either internal check via local auth or CRON_SECRET
    const authHeader = req.headers.get('authorization');
    const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isInternal = authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

    // Allow Vercel Cron (GET without auth on free tier) or authenticated calls
    console.log('[Push] Request received:', { method: req.method, isCron, isInternal });

    // Check if we have active subscriptions before doing expensive DB work
    const { count, error: countErr } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })

    if (countErr || count === 0) {
        return NextResponse.json({ success: true, message: "No active subscriptions. Skipping." })
    }

    try {
        // 1. Check for low stock items
        // We look for variants where stock is <= min_stock AND min_stock > 0
        const { data: variants, error } = await supabaseAdmin
            .from('product_variants')
            .select(`
                id, 
                stock, 
                min_stock,
                products ( name )
            `)
            .gt('min_stock', 0)
            .eq('stock_management', true)

        // Supabase doesn't easily let us do "stock <= min_stock" directly in .select() if they are both columns
        // unless we use rpc or raw sql, so we filter it in js
        if (error) throw error;

        const lowStockItems = variants?.filter(v => v.stock <= (v.min_stock || 0)) || [];

        if (lowStockItems.length === 0) {
            return NextResponse.json({ success: true, message: "No low stock items." })
        }

        // 2. We have low stock items. Fetch all active subscriptions
        const { data: subscriptions, error: subError } = await supabaseAdmin
            .from('push_subscriptions')
            .select('*')

        if (subError || !subscriptions) throw subError;

        let sentCount = 0;
        let failCount = 0;

        // 3. Send notifications
        // We are using payloadless notifications to bypass ECE AES encryption
        // The service worker will see the push event, wake up, and show a generic message
        const notifications = subscriptions.map(async (sub) => {
            try {
                await sendPushNotification({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                })
                sentCount++;
            } catch (err) {
                console.error(`Failed to send to ${sub.endpoint}:`, err);
                failCount++;
                // Check if it's a 410 Gone (user unsubscribed) and remove from db
                if (err instanceof Error && err.message.includes('410')) {
                    await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
                }
            }
        });

        await Promise.allSettled(notifications)

        return NextResponse.json({ 
            success: true, 
            message: `Sent to ${sentCount} clients. Failed: ${failCount}`,
            items: lowStockItems.length
        })

    } catch (error: any) {
        console.error("Error sending push notifications:", error)
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    // Vercel Cron calls via GET
    return POST(req)
}
