import { NextRequest, NextResponse } from 'next/server';
import { getProductByBarcode, getProductById } from '@/lib/products';

/**
 * GET /api/products/barcode?code=XXXXX  — Busca por código de barras
 * GET /api/products/barcode?id=XXXXX   — Busca por ID da variante
 * 
 * Busca produto no Supabase (cache local sincronizado da Nuvemshop)
 */
export async function GET(request: NextRequest) {
    const barcode = request.nextUrl.searchParams.get('code');
    const id = request.nextUrl.searchParams.get('id');

    if (!barcode && !id) {
        return NextResponse.json(
            { error: 'Parâmetro "code" ou "id" é obrigatório' },
            { status: 400 }
        );
    }

    try {
        let product = null;

        if (id) {
            const numId = parseInt(id);
            if (!isNaN(numId)) {
                product = await getProductById(numId);
            }
        } else if (barcode) {
            product = await getProductByBarcode(barcode);
        }

        if (!product) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return NextResponse.json(
            { error: 'Erro interno ao buscar produto' },
            { status: 500 }
        );
    }
}
