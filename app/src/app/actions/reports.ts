'use server';

import { supabaseAdmin } from '@/lib/supabase/client';

interface ReportFilters {
    dateFrom?: string;
    dateTo?: string;
    type?: string;       // 'entrada' | 'saida' | ''
    operation?: string;  // 'venda' | 'compra' | 'doacao' | etc.
}

export async function getReplenishmentDataAction() {
    try {
        const { data, error } = await supabaseAdmin
            .from('product_variants')
            .select('id, sku, price, stock, min_stock, products(name, images)')
            .gt('min_stock', 0)
            .order('stock', { ascending: true });

        if (error) {
            console.error('Erro ao buscar dados de reposição:', error);
            return { success: false, message: 'Erro ao buscar dados de reposição.' };
        }

        // Processar os dados para extrair nome e imagem corretamente
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processed = (data || []).map((variant: any) => {
            const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
            
            let productName = 'Produto sem nome';
            if (product?.name) {
                if (typeof product.name === 'string') {
                    try {
                        const parsed = JSON.parse(product.name);
                        productName = parsed.pt || parsed.es || parsed.en || product.name;
                    } catch {
                        productName = product.name;
                    }
                } else if (typeof product.name === 'object') {
                    productName = product.name.pt || product.name.es || product.name.en || 'Produto sem nome';
                }
            }
            // images é JSONB array: [{ src: "//url..." }, ...]
            let imageUrl: string | null = null;
            try {
                const images = typeof product?.images === 'string'
                    ? JSON.parse(product.images)
                    : (product?.images || []);
                if (images.length > 0) {
                    imageUrl = images[0].src;
                    if (imageUrl && imageUrl.startsWith('//')) {
                        imageUrl = `https:${imageUrl}`;
                    }
                }
            } catch {
                imageUrl = null;
            }

            return {
                id: variant.id,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                min_stock: variant.min_stock,
                productName,
                imageUrl,
            };
        });

        return { success: true, data: processed };
    } catch (error) {
        console.error('Erro geral no relatório de reposição:', error);
        return { success: false, message: 'Erro interno no servidor.' };
    }
}

export async function getStockSessionsAction(filters?: ReportFilters) {
    try {
        let query = supabaseAdmin
            .from('stock_sessions')
            .select(`
                id,
                created_at,
                type,
                operation,
                status,
                notes,
                user_email,
                stock_movements (
                    id,
                    quantity,
                    old_stock,
                    new_stock,
                    variant_id,
                    product_variants (
                        sku,
                        barcode,
                        price,
                        values,
                        products (
                            name
                        )
                    )
                )
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters?.dateFrom) {
            query = query.gte('created_at', `${filters.dateFrom}T00:00:00`);
        }
        if (filters?.dateTo) {
            query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
        }
        if (filters?.type) {
            query = query.eq('type', filters.type);
        }
        if (filters?.operation) {
            query = query.eq('operation', filters.operation);
        }

        query = query.limit(200);

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar sessões:', error);
            return { success: false, message: 'Erro ao buscar dados de estoque.' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Erro geral no relatório:', error);
        return { success: false, message: 'Erro interno no servidor.' };
    }
}
