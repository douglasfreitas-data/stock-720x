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

        const orderId = body.id;
        if (!orderId) {
            console.warn('[Webhook Orders] Payload sem ID de pedido. Ignorando.');
            return NextResponse.json({ success: true, message: 'No order ID' });
        }

        const api = await getNuvemshopClient();
        if (!api) {
            console.error('[Webhook Orders] Nuvemshop client não disponível.');
            return NextResponse.json({ error: 'Nuvemshop client not available' }, { status: 500 });
        }

        let order;
        try {
            order = await api.getOrder(orderId);
            console.log(`📦 Pedido #${order.number} obtido da API. Status: ${order.status}`);
        } catch (fetchErr) {
            console.error(`[Webhook Orders] Falha ao buscar pedido ${orderId}:`, fetchErr);
            return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
        }

        if (!order.products || order.products.length === 0) {
            return NextResponse.json({ success: true, message: 'No products in order' });
        }

        const clientName = `Pedido Nuvemshop #${order.number}`;
        const isConfirmed = ['paid', 'packed', 'shipped', 'closed'].includes(order.status);
        const isOpen = order.status === 'open';
        const isCanceled = order.status === 'canceled';

        // 1. Procurar venda pendente existente
        const { data: existingSale } = await supabaseAdmin
            .from('pending_sales')
            .select('id, status, items')
            .eq('client_name', clientName)
            .maybeSingle();

        // ════════════════════════════════════════
        // MÁQUINA DE ESTADOS: PEDIDO ABERTO
        // ════════════════════════════════════════
        if (isOpen) {
            if (existingSale) {
                console.log(`[Webhook Orders] Pedido aberto #${order.number} já possui Reserva (${existingSale.status}). Ignorando.`);
                return NextResponse.json({ success: true, message: 'Reserva já existe' });
            }

            console.log(`✅ [Webhook Orders] Criando Reserva para Pedido Aberto #${order.number}`);
            
            // Montar CartItems (apenas IDs e quantidades para salvar a reserva)
            const cartItems = order.products.map((p: any) => ({
                productId: p.variant_id.toString(),
                quantity: p.quantity,
                customPrice: parseFloat(p.price || '0'),
                product: { name: p.name }
            }));

            // Inserir na tabela pending_sales (Vendas Abertas)
            const { data: newSale, error: insertError } = await supabaseAdmin
                .from('pending_sales')
                .insert({
                    client_name: clientName,
                    payment_method: 'Nuvemshop',
                    payment_term: 'Online',
                    operation_type: 'venda_online',
                    status: 'pending',
                    items: cartItems,
                    observations: `Aguardando Pagamento na loja online.`
                })
                .select('id')
                .single();

            if (insertError || !newSale) {
                console.error('Falha ao criar Venda Aberta:', insertError);
                return NextResponse.json({ error: 'Failed to create pending sale' }, { status: 500 });
            }

            // --- DEBITAR ESTOQUE (Reserva) ---
            const { data: session } = await supabaseAdmin
                .from('stock_sessions')
                .insert({
                    type: 'saida',
                    operation: 'reserva',
                    status: 'closed',
                    notes: `Reserva - ${clientName}`
                })
                .select('id')
                .single();

            let pushTriggered = false;
            for (const item of cartItems) {
                const { data: variant } = await supabaseAdmin
                    .from('product_variants')
                    .select('id, stock, min_stock')
                    .eq('id', item.productId)
                    .single();

                if (!variant) continue;

                const newStock = Math.max(0, (variant.stock || 0) - item.quantity);
                await supabaseAdmin.from('product_variants').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', variant.id);

                if (session) {
                    await supabaseAdmin.from('stock_movements').insert({
                        session_id: session.id,
                        variant_id: variant.id,
                        quantity: -item.quantity,
                        old_stock: variant.stock || 0,
                        new_stock: newStock,
                    });
                }

                if (variant.min_stock && newStock <= variant.min_stock && !pushTriggered) {
                    pushTriggered = true;
                    // Trigger push em background
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                    fetch(`${baseUrl}/api/push/send`, { method: 'POST', headers: { 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } }).catch(console.error);
                }
            }

            return NextResponse.json({ success: true, message: 'Reserva criada com sucesso' });
        }


        // ════════════════════════════════════════
        // MÁQUINA DE ESTADOS: PEDIDO CANCELADO
        // ════════════════════════════════════════
        if (isCanceled) {
            if (!existingSale) {
                // Nunca existiu reserva no App. Logo, nunca tiramos do estoque.
                console.log(`[Webhook Orders] Pedido cancelado #${order.number} não tinha Venda Aberta associada. Ignorando para evitar entrada a mais.`);
                return NextResponse.json({ success: true, message: 'Nenhuma reserva para estornar' });
            }

            if (existingSale.status === 'canceled') {
                return NextResponse.json({ success: true, message: 'A Reserva já está cancelada' });
            }

            console.log(`✅ [Webhook Orders] Cancelando Pedido #${order.number} e devolvendo itens da Reserva`);

            // Mudar status para canceled
            await supabaseAdmin.from('pending_sales').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('id', existingSale.id);

            // --- RESTAURAR ESTOQUE (Estorno) ---
            const { data: session } = await supabaseAdmin
                .from('stock_sessions')
                .insert({
                    type: 'entrada',
                    operation: 'estorno_reserva',
                    status: 'closed',
                    notes: `Estorno Reserva - ${clientName}`
                })
                .select('id')
                .single();

            const items: any[] = Array.isArray(existingSale.items) ? existingSale.items : [];
            for (const item of items) {
                const { data: variant } = await supabaseAdmin.from('product_variants').select('id, stock').eq('id', item.productId).single();
                if (!variant) continue;

                const qty = Number(item.quantity) || 0;
                const newStock = (variant.stock || 0) + qty;
                
                await supabaseAdmin.from('product_variants').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', variant.id);

                if (session) {
                    await supabaseAdmin.from('stock_movements').insert({
                        session_id: session.id,
                        variant_id: variant.id,
                        quantity: qty,
                        old_stock: variant.stock || 0,
                        new_stock: newStock,
                    });
                }
            }

            return NextResponse.json({ success: true, message: 'Reserva cancelada e itens devolvidos ao estoque' });
        }


        // ════════════════════════════════════════
        // MÁQUINA DE ESTADOS: PEDIDO CONFIRMADO (pago, enviado, etc)
        // ════════════════════════════════════════
        if (isConfirmed) {
            if (existingSale) {
                if (existingSale.status === 'pending') {
                    console.log(`✅ [Webhook Orders] Pedido confirmado #${order.number}. Finalizando Reserva pendente.`);
                    // Apenas atualiza o status, o estoque JÁ FOI debitado na reserva!
                    await supabaseAdmin.from('pending_sales').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', existingSale.id);
                    
                    // Modifica a operação no log de movimentações de 'reserva' para venda fechada
                    await supabaseAdmin
                        .from('stock_sessions')
                        .update({ 
                            operation: 'venda_online',
                            notes: `Venda Online - ${clientName}`
                        })
                        .eq('notes', `Reserva - ${clientName}`)
                        .eq('operation', 'reserva');

                    return NextResponse.json({ success: true, message: 'Reserva finalizada com sucesso (paga)' });
                } else {
                    console.log(`[Webhook Orders] Pedido #${order.number} já estava ${existingSale.status}. Ignorando.`);
                    return NextResponse.json({ success: true, message: `Reserva já estava ${existingSale.status}` });
                }
            } else {
                // Chegou um evento "pago" mas não tinhamos a Reserva!
                // Isso ocorre se o webhook de "open" falhou ou o pedido pago for antigo.
                console.log(`✅ [Webhook Orders] Pedido confirmado #${order.number} sem Reserva anterior. Criando venda direta.`);
                
                const cartItems = order.products.map((p: any) => ({
                    productId: p.variant_id.toString(),
                    quantity: p.quantity,
                    customPrice: parseFloat(p.price || '0'),
                    product: { name: p.name }
                }));

                await supabaseAdmin.from('pending_sales').insert({
                    client_name: clientName,
                    payment_method: 'Nuvemshop',
                    payment_term: 'Online',
                    operation_type: 'venda_online',
                    status: 'completed', // Já entra como completada!
                    items: cartItems,
                    observations: `Pedido direto: recebido status confirmado sem reserva prévia.`
                });

                // Debitar estoque diretamente via venda_online
                const { data: session } = await supabaseAdmin.from('stock_sessions').insert({
                    type: 'saida',
                    operation: 'venda_online',
                    status: 'closed',
                    notes: `Venda Direta - ${clientName}`
                }).select('id').single();

                for (const item of cartItems) {
                    const { data: variant } = await supabaseAdmin.from('product_variants').select('id, stock').eq('id', item.productId).single();
                    if (!variant) continue;
                    const newStock = Math.max(0, (variant.stock || 0) - item.quantity);
                    await supabaseAdmin.from('product_variants').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', variant.id);
                    
                    if (session) {
                        await supabaseAdmin.from('stock_movements').insert({
                            session_id: session.id,
                            variant_id: variant.id,
                            quantity: -item.quantity,
                            old_stock: variant.stock || 0,
                            new_stock: newStock,
                        });
                    }
                }

                return NextResponse.json({ success: true, message: 'Venda direta registrada e estoque debitado.' });
            }
        }

        // Status ignorados ou desconhecidos
        console.log(`[Webhook Orders] Status de pedido #${order.number} desconhecido para o fluxo: ${order.status}. Ignorando.`);
        return NextResponse.json({ success: true, message: 'Status ignorado' });


    } catch (error) {
        console.error('Erro no webhook de orders:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
