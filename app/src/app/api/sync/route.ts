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
        // Recuperar credenciais do cookie para o sync (precisamos do token bruto)
        // O client já tem, mas por design da lib sync, passamos explicitamente
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('nuvemshop_token');
        const tokenData = JSON.parse(tokenCookie?.value || '{}');

        if (!tokenData.access_token) {
            throw new Error('Token inválido');
        }

        // 2. Executar Sincronização
        const count = await syncAllProducts(tokenData.store_id, tokenData.access_token);

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
