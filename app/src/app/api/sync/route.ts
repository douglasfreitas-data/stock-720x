import { NextRequest, NextResponse } from 'next/server';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { syncAllProducts } from '@/lib/sync/products';
import { cookies } from 'next/headers';

/**
 * POST /api/sync
 * Aciona a sincronização completa de produtos da Nuvemshop para o Supabase
 */
export async function POST(request: NextRequest) {
    // 1. Autenticação
    const client = await getNuvemshopClient();

    if (!client) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    try {
        // 2. Executar Sincronização
        // Usa as credenciais diretamente do cliente autenticado (seja via cookie ou DB fallback)
        const count = await syncAllProducts(client.getStoreId(), client.getAccessToken());

        return NextResponse.json({
            success: true,
            message: `Sincronização concluída com sucesso!`,
            count
        });

    } catch (error) {
        console.error('Erro na sincronização:', error);
        return NextResponse.json(
            { error: 'Falha na sincronização', details: String(error) },
            { status: 500 }
        );
    }
}
