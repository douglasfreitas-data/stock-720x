/**
 * API Route: /api/products
 * Busca produtos — via Supabase (search) ou Nuvemshop (listagem/barcode)
 */

import { NextRequest, NextResponse } from 'next/server';
import { NuvemshopAPI } from '@/lib/nuvemshop';
import { Product } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

interface TokenData {
    access_token: string;
    store_id: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    // ===== Busca por nome — usa Supabase direto (não precisa autenticação Nuvemshop) =====
    if (search) {
        try {
            const { data, error } = await supabaseAdmin
                .from('product_variants')
                .select(`
                    id,
                    sku,
                    barcode,
                    price,
                    stock,
                    stock_management,
                    products (name, images)
                `)
                .ilike('products.name->>pt', `%${search}%`)
                .not('products', 'is', null)
                .limit(20);

            if (error) {
                console.error('[API Products Search] Erro Supabase:', error);
                return NextResponse.json({ products: [], page: 1 });
            }

            const products: Product[] = (data || []).map((row: any) => ({
                id: row.id,
                name: row.products?.name?.pt || 'Sem nome',
                sku: row.sku || '',
                barcode: row.barcode || '',
                price: parseFloat(row.price) || 0,
                stock: row.stock || 0,
                minStock: 5,
                image: row.products?.images?.[0]?.src || '',
                nuvemshopId: '',
            }));

            return NextResponse.json({ products, page: 1 });
        } catch (error) {
            console.error('[API Products Search] Erro:', error);
            return NextResponse.json({ products: [], page: 1 });
        }
    }

    // ===== Para operações com Nuvemshop (listagem, barcode), precisa autenticação =====
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('nuvemshop_token');

    if (!tokenCookie?.value) {
        return NextResponse.json(
            { error: 'Não autenticado com Nuvemshop' },
            { status: 401 }
        );
    }

    const tokenData: TokenData = JSON.parse(tokenCookie.value);
    const api = new NuvemshopAPI(tokenData.store_id, tokenData.access_token);

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
