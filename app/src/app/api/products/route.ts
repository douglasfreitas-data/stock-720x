/**
 * API de Produtos - Sincronização com Nuvemshop
 */

import { NextRequest, NextResponse } from 'next/server';
import { NuvemshopAPI } from '@/lib/nuvemshop';
import { cookies } from 'next/headers';

interface TokenData {
    access_token: string;
    store_id: string;
    scope: string;
}

async function getApiClient(): Promise<NuvemshopAPI | null> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('nuvemshop_token');

    if (!tokenCookie) {
        return null;
    }

    try {
        const tokenData: TokenData = JSON.parse(tokenCookie.value);
        return new NuvemshopAPI(tokenData.store_id, tokenData.access_token);
    } catch {
        return null;
    }
}

/**
 * GET /api/products - Lista produtos sincronizados
 */
export async function GET(request: NextRequest) {
    const api = await getApiClient();

    if (!api) {
        return NextResponse.json(
            { error: 'Não autenticado com Nuvemshop' },
            { status: 401 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const barcode = searchParams.get('barcode');

    try {
        // Busca por código de barras
        if (barcode) {
            const result = await api.findVariantByBarcode(barcode);
            if (!result) {
                return NextResponse.json(
                    { error: 'Produto não encontrado' },
                    { status: 404 }
                );
            }
            return NextResponse.json(result);
        }

        // Lista paginada
        const products = await api.getProducts(page);
        return NextResponse.json({ products, page });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar produtos' },
            { status: 500 }
        );
    }
}
