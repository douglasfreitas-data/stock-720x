/**
 * Webhook LGPD - Store Redact
 * 
 * Chamado quando uma loja é desinstalada e todos os dados
 * relacionados a ela devem ser apagados.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('🗑️ LGPD Store Redact - Loja desinstalou o app:', body);

        // TODO: Implementar lógica para apagar dados da loja
        // - Remover tokens do Supabase
        // - Remover dados sincronizados
        // - Limpar cache

        const storeId = body.store_id;

        if (storeId) {
            // await supabase.from('stores').delete().eq('store_id', storeId);
            console.log(`Dados da loja ${storeId} marcados para remoção`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Erro no webhook store_redact:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
