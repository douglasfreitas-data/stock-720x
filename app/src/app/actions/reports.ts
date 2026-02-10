'use server';

import { supabaseAdmin } from '@/lib/supabase/client';

export async function getStockSessionsAction() {
    try {
        const { data, error } = await supabaseAdmin
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
            .order('created_at', { ascending: false })
            .limit(50);

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
