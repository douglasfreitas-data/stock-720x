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
            // O Supabase não suporta .or() cruzando tabelas facilmente.
            // Para resolver isso de forma eficiente e buscar por CÓDIGO e NOME, fazemos duas queries e juntamos.
            
            // 1. Busca por NOME
            const nameQuery = supabaseAdmin
                .from('product_variants')
                .select('id, sku, barcode, price, stock, stock_management, min_stock, values, image_url, products!inner(name, images)')
                .ilike('products.name->>pt', `%${search}%`)
                .limit(20);

            // 2. Busca por REFERÊNCIA (sku, barcode, id)
            const searchNumber = Number(search);
            let codeOrString = `sku.ilike.%${search}%,barcode.ilike.%${search}%`;
            if (!isNaN(searchNumber)) {
                codeOrString += `,id.eq.${searchNumber}`;
            }
            const codeQuery = supabaseAdmin
                .from('product_variants')
                .select('id, sku, barcode, price, stock, stock_management, min_stock, values, image_url, products!inner(name, images)')
                .or(codeOrString)
                .limit(20);

            const [nameRes, codeRes] = await Promise.all([nameQuery, codeQuery]);

            if (nameRes.error) console.error('[API Products Search] Erro Supabase NOME:', nameRes.error);
            if (codeRes.error) console.error('[API Products Search] Erro Supabase CODIGO:', codeRes.error);

            // Junta e remove duplicados
            const merged = [...(nameRes.data || []), ...(codeRes.data || [])];
            const uniqueMap = new Map();
            merged.forEach(row => {
                if (!uniqueMap.has(row.id)) uniqueMap.set(row.id, row);
            });
            const data = Array.from(uniqueMap.values()).slice(0, 20);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const products: Product[] = (data || []).map((row: any) => {
                let images = [];
                try {
                    images = typeof row.products?.images === 'string' 
                        ? JSON.parse(row.products.images) 
                        : (row.products?.images || []);
                } catch {
                    images = [];
                }
                let image = row.image_url;
                if (!image) {
                    image = images.length > 0 ? images[0].src : '';
                }
                if (image && image.startsWith('//')) {
                    image = `https:${image}`;
                }

                let baseName = row.products?.name?.pt || 'Sem nome';
                if (row.values && Array.isArray(row.values) && row.values.length > 0) {
                    const variantTags = row.values.map((v: any) => v.pt).filter(Boolean).join(' / ');
                    if (variantTags) {
                        baseName = `${baseName} - ${variantTags}`;
                    }
                }

                return {
                    id: row.id,
                    name: baseName,
                    sku: row.sku || '',
                    barcode: row.barcode || '',
                    price: parseFloat(row.price) || 0,
                    stock: row.stock || 0,
                    minStock: row.min_stock ?? 5,
                    stock_management: row.stock_management,
                    image: image,
                    nuvemshopId: '',
                };
            });

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
