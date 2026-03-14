import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { }
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { endpoint, keys } = body

        if (!endpoint || !keys) {
            return new NextResponse("Invalid subscription", { status: 400 })
        }

        // Check if it already exists -> Bypass RLS with supabaseAdmin so we can see other
        // users' subscriptions that hold this exact same device endpoint
        const { data: existing, error: checkError } = await supabaseAdmin
            .from('push_subscriptions')
            .select('id')
            .eq('endpoint', endpoint)
            .single()

        let data, error;
        
        if (existing) {
            // Update -> Bypass RLS to transfer ownership to the current user
            const res = await supabaseAdmin
                .from('push_subscriptions')
                .update({ user_id: user.id, p256dh: keys.p256dh, auth: keys.auth })
                .eq('id', existing.id)
            data = res.data;
            error = res.error;
        } else {
            // Insert -> Bypass RLS just in case policies are fully closed
            const res = await supabaseAdmin
                .from('push_subscriptions')
                .insert({
                    user_id: user.id,
                    endpoint: endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth
                })
            data = res.data;
            error = res.error;
        }

        if (error) {
            console.error('Error saving subscription:', error)
            return new NextResponse("Database error", { status: 500 })
        }

        return NextResponse.json({ success: true, data })

    } catch (error) {
        console.error('Subscription error:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) { }
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { endpoint } = body

        if (!endpoint) return new NextResponse("Invalid endpoint", { status: 400 })

        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .match({ user_id: user.id, endpoint: endpoint })

        if (error) return new NextResponse("Database error", { status: 500 })

        return NextResponse.json({ success: true })
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
