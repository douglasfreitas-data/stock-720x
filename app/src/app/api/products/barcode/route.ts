import { NextRequest, NextResponse } from 'next/server';
import { getProductByBarcode } from '@/lib/products';

/**
 * GET /api/products/barcode?code=XXXXX
 * Busca produto no Supabase (cache local sincronizado da Nuvemshop)
 */
export async function GET(request: NextRequest) {
    const barcode = request.nextUrl.searchParams.get('code');

    if (!barcode) {
        return NextResponse.json(
            { error: 'Parâmetro "code" é obrigatório' },
            { status: 400 }
        );
    }

    try {
        const product = await getProductByBarcode(barcode);

        if (!product) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Erro ao buscar produto por barcode:', error);
        return NextResponse.json(
            { error: 'Erro interno ao buscar produto' },
            { status: 500 }
        );
    }
}
