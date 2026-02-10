'use server';

import { supabaseAdmin } from '@/lib/supabase/client';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { revalidatePath } from 'next/cache';

interface StockUpdateParams {
    variantId: number;    // ID da variante no Supabase/Nuvemshop
    newStock: number;     // Novo estoque
    sessionType: string;  // 'entrada' | 'saida' | 'ajuste'
    operation: string;    // 'compra','devolucao','venda','pregao','doacao','consumo','contagem','perda','roubo'
    quantity: number;     // Quantidade movimentada (sempre positivo)
    observation?: string;
    sessionId?: string;   // Opcional: ID de uma sessão existente (para vendas em lote)
}

export async function updateStockAction(params: StockUpdateParams) {
    const { variantId, newStock, sessionType, operation, quantity, observation, sessionId } = params;

    if (newStock < 0) {
        return { success: false, message: 'O estoque não pode ser negativo.' };
    }

    try {
        // 1. Buscar dados atuais da variante (estoque atual + product_id para Nuvemshop)
        const { data: variantData, error: fetchError } = await supabaseAdmin
            .from('product_variants')
            .select('stock, product_id')
            .eq('id', variantId)
            .single();

        if (fetchError || !variantData) {
            throw new Error('Variante não encontrada');
        }

        const oldStock = variantData.stock || 0;
        const productId = variantData.product_id;

        // 2. DUAL WRITE: Atualizar na Nuvemshop PRIMEIRO (fonte de verdade)
        const nuvemshop = await getNuvemshopClient();
        let nuvemshopUpdated = false;

        if (nuvemshop) {
            try {
                await nuvemshop.updateVariantStock(productId, variantId, newStock);
                nuvemshopUpdated = true;
                console.log(`[Stock] Nuvemshop atualizado: variant ${variantId} → ${newStock}`);
            } catch (nsError) {
                console.error('[Stock] Erro ao atualizar Nuvemshop:', nsError);
                // Continua mesmo se falhar — registra no log para reconciliação
            }
        } else {
            console.warn('[Stock] Nuvemshop client não disponível. Atualizando apenas Supabase.');
        }

        // 3. Atualizar estoque no Supabase (cache local)
        const { error: updateError } = await supabaseAdmin
            .from('product_variants')
            .update({
                stock: newStock,
                updated_at: new Date().toISOString()
            })
            .eq('id', variantId);

        if (updateError) throw updateError;

        // 4. Gerenciar Sessão (Usar existente ou criar nova)
        let targetSessionId = sessionId;

        if (!targetSessionId) {
            const { data: session, error: sessionError } = await supabaseAdmin
                .from('stock_sessions')
                .insert({
                    type: sessionType,
                    operation: operation,
                    status: 'closed', // Sessão unitária, já fecha
                    notes: observation || null,
                })
                .select('id')
                .single();

            if (sessionError) {
                console.error('[Stock] Erro ao criar sessão:', sessionError);
            } else {
                targetSessionId = session.id;
            }
        }

        // 5. Registrar movimentação
        if (targetSessionId) {
            const { error: movError } = await supabaseAdmin
                .from('stock_movements')
                .insert({
                    session_id: targetSessionId,

                    variant_id: variantId,
                    quantity: sessionType === 'saida' ? -quantity : quantity,
                    old_stock: oldStock,
                    new_stock: newStock,
                });

            if (movError) {
                console.error('[Stock] Erro ao registrar movimentação:', movError);
            }
        }

        // 6. Revalidar caches
        revalidatePath('/products');
        revalidatePath('/scan');

        const syncStatus = nuvemshopUpdated
            ? 'Estoque atualizado (Nuvemshop + Supabase)'
            : 'Estoque atualizado (apenas Supabase — sincronize com Nuvemshop)';

        return { success: true, message: syncStatus };
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        return { success: false, message: 'Erro ao atualizar no banco de dados.' };
    }
}
