/**
 * API Route: /api/products
 * Busca produtos — via Supabase (search) ou Nuvemshop (listagem/barcode)
 */

import { NextRequest, NextResponse } from 'next/server';
import { NuvemshopAPI } from '@/lib/nuvemshop';
import { Product } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase/client';
import { cookies } from 'next/headers';
import { normalizeSearchString } from '@/lib/stringUtils';

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
            const terms = normalizeSearchString(search).split(' ').filter(Boolean);
            const searchNumber = Number(search);

            // Busca todas as variantes paginando para evitar o max limit (1000) rígido do Supabase PostgREST
            let allVariants: any[] = [];
            let hasMore = true;
            let from = 0;
            const step = 1000;

            while (hasMore) {
                const { data, error: fetchError } = await supabaseAdmin
                    .from('product_variants')
                    .select('id, sku, barcode, price, stock, stock_management, min_stock, values, image_url, products!inner(name, images)')
                    .range(from, from + step - 1);

                if (fetchError) {
                    console.error(`[API Products Search] Erro Supabase na paginacao ${from}:`, fetchError);
                    break;
                }

                if (data && data.length > 0) {
                    allVariants = [...allVariants, ...data];
                    from += step;
                    if (data.length < step) {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            }

            // Refinamento em memória com normalizeSearchString (suporta acentos e multi-termos)
            const allFiltered = (allVariants || []).filter((v: any) => {
                const name = typeof v.products?.name === 'string' 
                    ? JSON.parse(v.products.name)?.pt 
                    : v.products?.name?.pt;
                
                let fullName = name || '';
                if (v.values && Array.isArray(v.values) && v.values.length > 0) {
                    const variantTags = v.values.map((val: any) => val?.pt).filter(Boolean).join(' / ');
                    if (variantTags) {
                        fullName = `${fullName} - ${variantTags}`;
                    }
                }

                const nFullName = normalizeSearchString(fullName);
                const nSku = normalizeSearchString(v.sku || '');
                const nBarcode = normalizeSearchString(v.barcode || '');

                if (terms.length === 0) return true;

                // Todos os termos digitados devem estar presentes em algum campo (AND)
                return terms.every(term => 
                    nFullName.includes(term) ||
                    nSku.includes(term) ||
                    nBarcode.includes(term) ||
                    (!isNaN(searchNumber) && v.id === searchNumber && terms.length === 1)
                );
            });

            // Junta e remove duplicados (caso hajam, para segurança)
            const uniqueMap = new Map();
            allFiltered.forEach((row: any) => {
                if (!uniqueMap.has(row.id)) uniqueMap.set(row.id, row);
            });
            const data = Array.from(uniqueMap.values()).slice(0, 50);

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
