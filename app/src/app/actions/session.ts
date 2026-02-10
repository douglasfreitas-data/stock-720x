'use server';

import { supabaseAdmin } from '@/lib/supabase/client';
import { updateStockAction } from '@/app/actions/stock';
import { CartItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

interface SessionParams {
    items: CartItem[];
    type: 'entrada' | 'saida';
    operation: string; // 'venda', 'doacao', 'consumo', 'pregao', 'compra', 'devolucao'
    notes?: string;
}

export async function processSessionAction(params: SessionParams) {
    const { items, type, operation, notes } = params;

    if (!items || items.length === 0) {
        return { success: false, message: 'Lista de itens vazia.' };
    }

    try {
        // 1. Criar Sessão "Mestra"
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('stock_sessions')
            .insert({
                type: type,
                operation: operation,
                status: 'closed',
                notes: notes,
            })
            .select('id')
            .single();

        if (sessionError || !session) {
            console.error('Erro ao criar sessão:', sessionError);
            return { success: false, message: 'Erro ao iniciar sessão.' };
        }

        const errors: string[] = [];
        let successCount = 0;

        // 2. Processar cada item
        for (const item of items) {
            if (!item.product) continue;

            // Busca estoque FRESH para garantir cálculo correto
            const { data: variantData, error: fetchError } = await supabaseAdmin
                .from('product_variants')
                .select('stock')
                .eq('id', item.product.id)
                .single();

            if (fetchError || !variantData) {
                errors.push(`${item.product.name} (Erro ao buscar estoque)`);
                continue;
            }

            const currentStock = variantData.stock || 0;

            // Se for entrada, soma. Se for saída, subtrai.
            // Mas o createStockAction espera "newStock".
            // Para entrada: newStock = old + qtd
            // Para saída: newStock = old - qtd
            let newStock = currentStock;
            if (type === 'entrada') {
                newStock = currentStock + item.quantity;
            } else {
                newStock = Math.max(0, currentStock - item.quantity);
            }

            // Chama a action de update (que faz dual-write na Nuvemshop)
            const result = await updateStockAction({
                variantId: item.product.id,
                newStock: newStock,
                sessionType: type,
                operation: operation,
                quantity: item.quantity, // Quantidade absoluta movimentada
                sessionId: session.id,   // Linka com a sessão criada acima
                observation: `Movimentação via App - ${operation}`
            });

            if (!result.success) {
                errors.push(`${item.product.name} (${result.message})`);
            } else {
                successCount++;
            }
        }

        revalidatePath('/products');
        revalidatePath('/scan');

        if (errors.length > 0) {
            return {
                success: false, // Partial success is still "false" for UX generally, or maybe true with warnings
                message: `Processado com erros. Sucesso: ${successCount}. Falhas: ${errors.join(', ')}`
            };
        }

        return { success: true, message: 'Operação realizada com sucesso!' };

    } catch (error) {
        console.error('Erro processando checkout:', error);
        return { success: false, message: 'Erro interno ao processar venda.' };
    }
}
