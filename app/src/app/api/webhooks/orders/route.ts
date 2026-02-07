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
                console.log(`  - Produto ${product.product_id}: -${product.quantity} unidades`);
                // await syncLocalStock(product.product_id, product.variant_id);
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
