'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export interface AuditItem {
    productId: string;
    variantId: string;
    name: string;
    localStock: number;
    nuvemshopStock: number;
    difference: number;
    status: 'divergent' | 'synced';
}

// Verifica se o usuário logado é o administrador configurado
async function verifyAdminAccess() {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Acesso negado. Apenas o administrador pode realizar esta ação.');
    }
    return user;
}

export async function getStockDifferencesAction() {
    try {
        await verifyAdminAccess();

        // 1. Buscar todos os produtos locais que estão habilitados
        const { data: localVariants, error: localError } = await supabaseAdmin
            .from('product_variants')
            .select(`
                id, 
                stock, 
                price,
                product_id,
                products:product_id (name, published, nuvemshop_id)
            `)
            .eq('products.published', true);

        if (localError) {
            console.error('Erro ao buscar produtos locais:', localError);
            return { error: 'Falha ao buscar produtos locais.' };
        }

        // 2. Buscar produtos da Nuvemshop (paginação)
        const api = await getNuvemshopClient();
        if (!api) {
            return { error: 'Cliente da Nuvemshop não configurado.' };
        }

        let page = 1;
        let hasMore = true;
        const allNuvemshopProducts: any[] = [];

        while (hasMore) {
            try {
                const productsPage = await api.getProducts(page, 50);
                if (!productsPage || productsPage.length === 0) {
                    hasMore = false;
                } else {
                    allNuvemshopProducts.push(...productsPage);
                    if (productsPage.length < 50) hasMore = false;
                    else page++;
                }
            } catch (pageError) {
                console.error(`Erro ao buscar página ${page} da Nuvemshop:`, pageError);
                hasMore = false;
            }
        }

        // Criar um mapa rápido das variantes da Nuvemshop
        const nuvemshopVariantMap = new Map<string, any>();
        for (const np of allNuvemshopProducts) {
            for (const nv of np.variants) {
                nuvemshopVariantMap.set(nv.id.toString(), {
                    name: np.name.pt || np.name,
                    stock: nv.stock || 0
                });
            }
        }

        // 3. Comparar e gerar a lista de diferenças
        const differences: AuditItem[] = [];

        for (const lv of localVariants || []) {
            const product = Array.isArray(lv.products) ? lv.products[0] : lv.products;
            if (!product || product.published === false) continue; // Pular se não publicado
            
            // Aqui nosso ID interno (lv.id) corresponde ao variant_id da nuvemshop
            const nv = nuvemshopVariantMap.get(lv.id);
            
            if (nv) {
                const diff = (lv.stock || 0) - nv.stock;
                if (diff !== 0) {
                    differences.push({
                        productId: lv.product_id,
                        variantId: lv.id,
                        name: product.name,
                        localStock: lv.stock || 0,
                        nuvemshopStock: nv.stock,
                        difference: diff,
                        status: 'divergent'
                    });
                }
            }
        }

        return { success: true, count: differences.length, data: differences };

    } catch (error: any) {
        console.error('Erro na auditoria de estoque:', error);
        return { error: error.message || 'Erro interno.' };
    }
}

export async function syncAuditItemAction(variantId: string, correctStock: number) {
    try {
        await verifyAdminAccess();

        // Buscar estoque antigo
        const { data: variant } = await supabaseAdmin
            .from('product_variants')
            .select('id, stock')
            .eq('id', variantId)
            .single();

        if (!variant) {
            return { error: 'Variante não encontrada localmente.' };
        }

        const oldStock = variant.stock || 0;
        const diff = correctStock - oldStock;

        if (diff === 0) {
            return { success: true, message: 'O estoque já estava correto.' };
        }

        const sessionOperation = diff > 0 ? 'entrada' : 'saida';

        // 1. Criar sessão de correção
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('stock_sessions')
            .insert({
                type: sessionOperation,
                operation: 'auditoria_admin',
                notes: 'Sincronização manual pela Auditoria',
                status: 'closed'
            })
            .select('id')
            .single();

        if (sessionError || !session) {
            return { error: 'Falha ao criar sessão de estoque.' };
        }

        // 2. Atualizar estoque na variante
        const { error: updateError } = await supabaseAdmin
            .from('product_variants')
            .update({ stock: correctStock, updated_at: new Date().toISOString() })
            .eq('id', variantId);

        if (updateError) {
            return { error: 'Falha ao atualizar estoque da variante.' };
        }

        // 3. Registrar o movimento
        const { error: moveError } = await supabaseAdmin
            .from('stock_movements')
            .insert({
                session_id: session.id,
                variant_id: variantId,
                quantity: diff,
                old_stock: oldStock,
                new_stock: correctStock
            });

        if (moveError) {
            console.error('Falha ao registrar movimento de estoque (auditoria):', moveError);
        }

        return { success: true, message: 'Estoque ajustado com sucesso no App.' };

    } catch (error: any) {
        console.error('Erro ao sincronizar item da auditoria:', error);
        return { error: error.message || 'Erro interno.' };
    }
}
