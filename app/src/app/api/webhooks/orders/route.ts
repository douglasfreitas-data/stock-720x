/**
 * Webhook de Orders (Pedidos)
 * 
 * Chamado quando há eventos de pedidos na loja:
 * - order/created: Novo pedido
 * - order/updated: Pedido atualizado
 * - order/paid: Pedido pago
 * 
 * Usado para sincronizar estoque quando há vendas online.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface OrderProduct {
    product_id: number;
    variant_id: number;
    quantity: number;
    name: string;
}

interface OrderWebhookPayload {
    event: string;
    store_id: string;
    id: number;
    number: string;
    status: string;
    payment_status: string;
    products: OrderProduct[];
    created_at: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: OrderWebhookPayload = await request.json();

        console.log('📦 Webhook Order recebido:', {
            event: body.event,
            orderId: body.id,
            number: body.number,
            status: body.status,
            products: body.products?.length || 0
        });

        // Processa apenas pedidos pagos para dar baixa no estoque local
        if (body.payment_status === 'paid' || body.status === 'closed') {
            console.log(`✅ Pedido #${body.number} pago - sincronizando estoque local`);

            // TODO: Atualizar cache/banco local de estoque
            // O estoque na NS já foi decrementado automaticamente
            // Aqui precisamos atualizar nosso cache local se tivermos um

            for (const product of body.products || []) {
                console.log(`  - Produto ${product.product_id}: -${product.quantity} unidades (variante ${product.variant_id})`);
                
                // 1. Busca estoque atual e ID interno
                const { data: variant, error: getError } = await supabaseAdmin
                    .from('product_variants')
                    .select('id, stock, min_stock')
                    .eq('id', product.variant_id.toString())
                    .single();

                if (getError || !variant) {
                    console.error(`    ↳ Variante ${product.variant_id} não encontrada no banco local. Error:`, getError);
                    continue;
                }

                // 2. Decrementa
                const newStock = Math.max(0, (variant.stock || 0) - product.quantity);
                
                const { error: updateError } = await supabaseAdmin
                    .from('product_variants')
                    .update({ stock: newStock, updated_at: new Date().toISOString() })
                    .eq('id', variant.id);

                if (updateError) {
                    console.error(`    ↳ Falha ao dar baixa de estoque na variante ${variant.id}:`, updateError);
                } else {
                    console.log(`    ↳ Estoque atualizado no Supabase: antes ${variant.stock} -> agora ${newStock}`);
                    if (variant.min_stock && newStock <= variant.min_stock) {
                        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                        fetch(`${baseUrl}/api/push/send`, { method: 'POST' }).catch(console.error);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            processed: body.id
        });

    } catch (error) {
        console.error('Erro no webhook de orders:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
