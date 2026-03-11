import { NextRequest, NextResponse } from 'next/server';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { syncAllProducts } from '@/lib/sync/products';
import { supabaseAdmin } from '@/lib/supabase/client';


/**
 * POST /api/sync
 * Aciona a sincronização completa de produtos da Nuvemshop para o Supabase
 */
export async function GET(request: NextRequest) {
    // Vercel Cron Jobs usam GET por padrão
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }
    return POST(request);
}

export async function POST(_request: NextRequest) {
    // 1. Autenticação
    const client = await getNuvemshopClient();

    if (!client) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    try {
        // 2. Executar Sincronização
        const result = await syncAllProducts(client.getStoreId(), client.getAccessToken());

        // 3. Registrar Audit Log na tabela sync_logs
        let message = '';
        if (result.totalDiscrepancies > 0) {
            message = `Sincronização concluída. ${result.totalDiscrepancies} divergências de estoque corrigidas automaticamente. Sessões geradas: ${result.discrepanciesIds.join(', ')}`;
        } else {
            message = `Sincronização concluída perfeitamente. Nenhuma divergência de estoque encontrada para os ${result.totalSynced} produtos vericados.`;
        }

        await supabaseAdmin.from('sync_logs').insert({
            store_id: client.getStoreId(),
            entity: 'product',
            action: 'sync_all',
            status: 'success',
            message: message
        });

        return NextResponse.json({
            success: true,
            message: message,
            data: result
        });

    } catch (error) {
        console.error('Erro na sincronização:', error);
        
        // Log de erro caso a api falhe globalmente
        await supabaseAdmin.from('sync_logs').insert({
            entity: 'product',
            action: 'sync_all',
            status: 'error',
            message: `Falha fatal na sincronização: ${String(error)}`
        });

        return NextResponse.json(
            { error: 'Falha na sincronização', details: String(error) },
            { status: 500 }
        );
    }
}
