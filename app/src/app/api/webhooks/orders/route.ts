/**
 * Webhook de Orders (Pedidos)
 * 
 * Chamado quando há eventos de pedidos na loja:
 * - order/paid: Pedido pago
 * 
 * A Nuvemshop envia apenas { store_id, event, id }.
 * Precisamos buscar o pedido completo via API para obter os produtos.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('📦 Webhook Order recebido:', {
            event: body.event,
            orderId: body.id,
            storeId: body.store_id,
        });

        // A Nuvemshop envia apenas { store_id, event, id }
        // Precisamos buscar o pedido completo via API
        const orderId = body.id;
        if (!orderId) {
            console.warn('[Webhook Orders] Payload sem ID de pedido. Ignorando.');
            return NextResponse.json({ success: true, message: 'No order ID' });
        }

        // Obter cliente da API Nuvemshop (sem cookie, usa fallback do banco)
        const api = await getNuvemshopClient();
        if (!api) {
            console.error('[Webhook Orders] Nuvemshop client não disponível. Não é possível buscar o pedido.');
            return NextResponse.json({ error: 'Nuvemshop client not available' }, { status: 500 });
        }

        // Buscar pedido completo na API
        let order;
        try {
            order = await api.getOrder(orderId);
            console.log(`📦 Pedido #${order.number} obtido da API:`, {
                status: order.status,
                products: order.products?.length || 0
            });
        } catch (fetchErr) {
            console.error(`[Webhook Orders] Falha ao buscar pedido ${orderId} na API:`, fetchErr);
            return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
        }

        // Processar produtos do pedido
        if (!order.products || order.products.length === 0) {
            console.log(`[Webhook Orders] Pedido #${order.number} sem produtos. Ignorando.`);
            return NextResponse.json({ success: true, message: 'No products in order' });
        }

        const isCanceled = order.status === 'canceled';
        const operationType = isCanceled ? 'cancelamento_venda' : 'venda_online';
        const notesText = isCanceled ? `Cancelamento Nuvemshop #${order.number}` : `Pedido Nuvemshop #${order.number}`;

        // Verificar Idempotência: Checar se ESTA operação já foi processada
        const { data: existingSession } = await supabaseAdmin
            .from('stock_sessions')
            .select('id')
            .eq('operation', operationType)
            .eq('notes', notesText)
            .maybeSingle();

        if (existingSession) {
            console.log(`[Webhook Orders] Operação ${operationType} do Pedido #${order.number} já processada. Ignorando para evitar duplicidade.`);
            return NextResponse.json({ success: true, message: 'Order operation already processed' });
        }

        console.log(`✅ Pedido #${order.number} (${operationType}) — sincronizando estoque local`);

        const sessionType = isCanceled ? 'entrada' : 'saida';

        // Criar uma sessão de estoque para registrar a venda ou cancelamento
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('stock_sessions')
            .insert({
                type: sessionType,
                operation: operationType,
                status: 'closed',
                notes: notesText
            })
            .select('id')
            .single();

        if (sessionError) {
            console.error('Falha ao criar sessão de estoque:', sessionError);
        }

        let pushTriggered = false;

        for (const product of order.products) {
            console.log(`  - Produto ${product.product_id}: ${isCanceled ? '+' : '-'}${product.quantity} unidades (variante ${product.variant_id})`);
            
            // 1. Busca estoque atual do cache local
            const { data: variant, error: getError } = await supabaseAdmin
                .from('product_variants')
                .select('id, stock, min_stock')
                .eq('id', product.variant_id.toString())
                .single();

            if (getError || !variant) {
                console.error(`    ↳ Variante ${product.variant_id} não encontrada no banco local. Error:`, getError);
                continue;
            }

            // 2. Atualiza o estoque (soma se cancelado, subtrai se venda)
            const newStock = isCanceled 
                ? (variant.stock || 0) + product.quantity 
                : Math.max(0, (variant.stock || 0) - product.quantity);
            
            const { error: updateError } = await supabaseAdmin
                .from('product_variants')
                .update({ stock: newStock, updated_at: new Date().toISOString() })
                .eq('id', variant.id);

            if (updateError) {
                console.error(`    ↳ Falha ao atualizar estoque na variante ${variant.id}:`, updateError);
            } else {
                console.log(`    ↳ Estoque atualizado no Supabase: antes ${variant.stock} -> agora ${newStock}`);

                // 3. Registrar movimentação
                if (session) {
                    const quantityDelta = isCanceled ? product.quantity : -product.quantity;
                    await supabaseAdmin
                        .from('stock_movements')
                        .insert({
                            session_id: session.id,
                            variant_id: variant.id,
                            quantity: quantityDelta,
                            old_stock: variant.stock || 0,
                            new_stock: newStock,
                        });
                }

                // 4. Verificar estoque mínimo
                if (variant.min_stock && newStock <= variant.min_stock && !pushTriggered) {
                    pushTriggered = true; // Enviar apenas 1 push por webhook (broadcast de todos os itens baixos)
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                    console.log(`    ↳ Estoque mínimo atingido! variant=${variant.id}, stock=${newStock}, min=${variant.min_stock}. Disparando push...`);
                    try {
                        const pushRes = await fetch(`${baseUrl}/api/push/send`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
                        });
                        const pushData = await pushRes.json();
                        console.log('    ↳ Push notification response:', pushData);
                    } catch (err) {
                        console.error('    ↳ Falha ao enviar push notification:', err);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            processed: orderId,
            products: order.products.length
        });

    } catch (error) {
        console.error('Erro no webhook de orders:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
