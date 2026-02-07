/**
 * Webhook LGPD - Customers Data Request
 * 
 * Chamado quando um cliente solicita exportação de seus dados.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('📤 LGPD Customers Data Request - Cliente solicitou dados:', body);

        // TODO: Implementar lógica para exportar dados do cliente
        // Como nosso app foca em estoque e não armazena dados pessoais de clientes,
        // retornamos que não há dados a exportar

        const customerId = body.customer?.id;
        const storeId = body.store_id;

        console.log(`Cliente ${customerId} da loja ${storeId} - sem dados armazenados`);

        // Retorna resposta indicando que não há dados
        return NextResponse.json({
            success: true,
            message: 'Nenhum dado pessoal armazenado por este aplicativo',
            data: null
        });

    } catch (error) {
        console.error('Erro no webhook customers_data_request:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
