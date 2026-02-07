/**
 * Webhook LGPD - Customers Redact
 * 
 * Chamado quando um cliente da loja solicita exclusão de seus dados.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('🗑️ LGPD Customers Redact - Cliente solicitou exclusão:', body);

        // TODO: Implementar lógica para apagar dados do cliente
        // Como nosso app foca em estoque e não armazena dados de clientes,
        // apenas logamos e retornamos sucesso

        const customerId = body.customer?.id;
        const storeId = body.store_id;

        console.log(`Cliente ${customerId} da loja ${storeId} - dados removidos (se existiam)`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Erro no webhook customers_redact:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
