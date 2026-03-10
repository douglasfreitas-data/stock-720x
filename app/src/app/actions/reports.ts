'use server';

import { supabaseAdmin } from '@/lib/supabase/client';

interface ReportFilters {
    dateFrom?: string;
    dateTo?: string;
    type?: string;       // 'entrada' | 'saida' | ''
    operation?: string;  // 'venda' | 'compra' | 'doacao' | etc.
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
