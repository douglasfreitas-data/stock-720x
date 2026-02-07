/**
 * API de Estoque - Atualização de estoque via Nuvemshop
 */

import { NextRequest, NextResponse } from 'next/server';
import { NuvemshopAPI } from '@/lib/nuvemshop';
import { cookies } from 'next/headers';

interface TokenData {
    access_token: string;
    store_id: string;
    scope: string;
}

interface StockUpdateRequest {
    product_id: number;
    variant_id: number;
    stock: number;
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
 * PUT /api/stock - Atualiza estoque de uma variante
 */
export async function PUT(request: NextRequest) {
    const api = await getApiClient();

    if (!api) {
        return NextResponse.json(
            { error: 'Não autenticado com Nuvemshop' },
            { status: 401 }
        );
    }

    try {
        const body: StockUpdateRequest = await request.json();

        if (!body.product_id || !body.variant_id || body.stock === undefined) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: product_id, variant_id, stock' },
                { status: 400 }
            );
        }

        const updatedVariant = await api.updateVariantStock(
            body.product_id,
            body.variant_id,
            body.stock
        );

        return NextResponse.json({
            success: true,
            variant: updatedVariant,
        });

    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar estoque' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/stock - Baixa de estoque (venda)
 */
export async function POST(request: NextRequest) {
    const api = await getApiClient();

    if (!api) {
        return NextResponse.json(
            { error: 'Não autenticado com Nuvemshop' },
            { status: 401 }
        );
    }

    try {
        const body: { barcode: string; quantity: number } = await request.json();

        if (!body.barcode || !body.quantity) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: barcode, quantity' },
                { status: 400 }
            );
        }

        // Busca produto pelo código de barras
        const result = await api.findVariantByBarcode(body.barcode);

        if (!result) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        const currentStock = result.variant.stock ?? 0;
        const newStock = Math.max(0, currentStock - body.quantity);

        // Atualiza estoque
        const updatedVariant = await api.updateVariantStock(
            result.product.id,
            result.variant.id,
            newStock
        );

        return NextResponse.json({
            success: true,
            product: result.product.name.pt,
            previous_stock: currentStock,
            sold: body.quantity,
            new_stock: newStock,
            variant: updatedVariant,
        });

    } catch (error) {
        console.error('Erro ao dar baixa no estoque:', error);
        return NextResponse.json(
            { error: 'Erro ao dar baixa no estoque' },
            { status: 500 }
        );
    }
}
