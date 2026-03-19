'use server';

import { supabaseAdmin } from '@/lib/supabase/client';
import { createSupabaseServer } from '@/lib/supabase/server';
import { updateStockAction } from '@/app/actions/stock';
import { CartItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

interface PendingSaleParams {
    client_name: string;
    payment_method: string;
    payment_term: string;
    operation_type: string;
    items: CartItem[];
    observations?: string;
}

export async function createPendingSaleAction(params: PendingSaleParams) {
    const { client_name, payment_method, payment_term, operation_type, items, observations } = params;

    if (!items || items.length === 0) {
        return { success: false, message: 'Lista de itens vazia.' };
    }

    try {
        const supabase = await createSupabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || null;

        // 1. Criar Venda Pendente
        const { data: pendingSale, error: insertError } = await supabaseAdmin
            .from('pending_sales')
            .insert({
                client_name,
                payment_method,
                payment_term,
                operation_type,
                items, // JSONB armazena o id, quantity, customPrice
                status: 'pending',
                observations,
                user_email: userEmail,
            })
            .select('id')
            .single();

        if (insertError || !pendingSale) {
            console.error('Erro ao criar venda pendente:', insertError);
            return { success: false, message: 'Erro ao criar venda pendente.' };
        }

        // 2. Abater estoque provisoriamente (Reserva)
        const errors: string[] = [];
        let successCount = 0;

        for (const item of items) {
            if (!item.product) continue;

            const { data: variantData, error: fetchError } = await supabaseAdmin
                .from('product_variants')
                .select('stock')
                .eq('id', item.productId)
                .single();

            if (fetchError || !variantData) {
                errors.push(`${item.product.name} (Erro ao buscar estoque)`);
                continue;
            }

            const currentStock = variantData.stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);

            try {
                const result = await updateStockAction({
                    variantId: item.productId,
                    newStock,
                    sessionType: 'saida',
                    operation: 'reserva', // Operação indicando que é reserva
                    quantity: item.quantity,
                    observation: `Reserva - Cliente: ${client_name}`
                });

                if (!result.success) {
                    errors.push(`${item.product.name} (${result.message})`);
                } else {
                    successCount++;
                }
            } catch (actionErr) {
                console.error(`Erro reserva estoque para ${item.product.name}:`, actionErr);
                errors.push(`${item.product.name} (Erro interno)`);
            }
        }

        revalidatePath('/products');
        revalidatePath('/scan');

        if (errors.length > 0) {
            return {
                success: false,
                message: `Reserva criada, mas com erros no estoque: ${errors.join(', ')}`
            };
        }

        return { success: true, message: 'Venda salva como pendente com sucesso!' };

    } catch (error) {
        console.error('Erro ao salvar venda pendente:', error);
        return { success: false, message: 'Erro interno ao salvar venda pendente.' };
    }
}

export async function completePendingSaleAction(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('pending_sales')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Erro ao finalizar venda pendente:', error);
            return { success: false, message: 'Erro ao finalizar venda pendente.' };
        }

        return { success: true, message: 'Venda finalizada com sucesso!' };
    } catch (error) {
        console.error('Erro interno ao finalizar venda:', error);
        return { success: false, message: 'Erro ao finalizar venda.' };
    }
}

export async function cancelPendingSaleAction(id: string) {
    try {
        // 1. Obter a venda pendente
        const { data: sale, error: fetchError } = await supabaseAdmin
            .from('pending_sales')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !sale) {
            return { success: false, message: 'Venda pendente não encontrada.' };
        }

        if (sale.status !== 'pending') {
            return { success: false, message: 'Venda não está pendente.' };
        }

        // 2. Voltar o status para canceled
        const { error: updateError } = await supabaseAdmin
            .from('pending_sales')
            .update({ status: 'canceled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (updateError) {
            return { success: false, message: 'Erro ao cancelar venda.' };
        }

        // 3. Estornar o estoque
        const items = sale.items as CartItem[];
        const errors: string[] = [];

        for (const item of items) {
            if (!item.productId) continue;

            const { data: variantData, error: stockFetchError } = await supabaseAdmin
                .from('product_variants')
                .select('stock, products(name)')
                .eq('id', item.productId)
                .single();

            const productName = item.product?.name || (variantData as any)?.products?.name || `Produto #${item.productId}`;

            if (stockFetchError || !variantData) {
                errors.push(`${productName} (Erro ao buscar)`);
                continue;
            }

            const currentStock = variantData.stock || 0;
            const newStock = currentStock + item.quantity; // Estorno (soma)

            try {
                const result = await updateStockAction({
                    variantId: item.productId,
                    newStock,
                    sessionType: 'entrada',
                    operation: 'estorno_reserva',
                    quantity: item.quantity,
                    observation: `Estorno Reserva - Venda #${id.substring(0, 8)}`
                });

                if (!result.success) {
                    errors.push(`${productName} (${result.message})`);
                }
            } catch (err) {
                errors.push(`${productName} (Erro interno)`);
            }
        }

        revalidatePath('/products');
        revalidatePath('/scan');

        if (errors.length > 0) {
            return { success: false, message: `Cancelado, porém erros ao repor estoque: ${errors.join(', ')}` };
        }

        return { success: true, message: 'Venda cancelada e estoque estornado com sucesso!' };

    } catch (error) {
        console.error('Erro ao cancelar venda:', error);
        return { success: false, message: 'Erro interno ao cancelar venda.' };
    }
}

export async function getPendingSalesCountAction() {
    try {
        const { count, error } = await supabaseAdmin
            .from('pending_sales')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (error) {
            console.error('Erro ao contar vendas pendentes:', error);
            return { success: false, count: 0 };
        }

        return { success: true, count: count ?? 0 };
    } catch (error) {
        console.error('Erro interno ao contar vendas pendentes:', error);
        return { success: false, count: 0 };
    }
}

export async function getPendingSalesAction() {
    try {
        const { data, error } = await supabaseAdmin
            .from('pending_sales')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar vendas pendentes:', error);
            return { success: false, data: [] };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Erro interno:', error);
        return { success: false, data: [] };
    }
}
