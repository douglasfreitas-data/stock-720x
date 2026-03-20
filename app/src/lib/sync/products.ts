import { NuvemshopAPI, NuvemshopProduct } from '@/lib/nuvemshop/api';
import { supabaseAdmin } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sincroniza todos os produtos da loja Nuvemshop com o banco local Supabase
 * @param storeId ID da loja
 * @param accessToken Token de acesso
 */
export async function syncAllProducts(storeId: string, accessToken: string) {
    const api = new NuvemshopAPI(storeId, accessToken);
    let page = 1;
    let hasMore = true;
    let totalSynced = 0;
    let totalDiscrepancies = 0;
    const discrepanciesIds: string[] = [];

    console.log(`[Sync] Iniciando sincronização de produtos para loja ${storeId}...`);

    // 1. Drenar a fila pendente local (Local-First Priority)
    await processSyncQueue(api);

    while (hasMore) {
        try {
            // Busca página de produtos
            const products = await api.getProducts(page, 50);

            if (!products || products.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`[Sync] Processando página ${page} com ${products.length} produtos...`);

            // Processa cada produto
            for (const product of products) {
                const result = await upsertProduct(storeId, product);
                totalSynced++;
                if (result && result.discrepancies > 0) {
                    totalDiscrepancies += result.discrepancies;
                    discrepanciesIds.push(...result.sessionIds);
                }
            }

            // Se retornou menos que o per_page, é a última página
            if (products.length < 50) {
                hasMore = false;
            } else {
                page++;
            }
        } catch (_error) {
            // Nuvemshop retorna 404 quando a página não existe
            console.log(`[Sync] Página ${page} não existe, finalizando paginação.`);
            hasMore = false;
        }

        // Limite de segurança
        if (page > 100) hasMore = false;
    }

    console.log(`[Sync] Sincronização concluída! Total: ${totalSynced} produtos. Divergências: ${totalDiscrepancies}`);
    return { totalSynced, totalDiscrepancies, discrepanciesIds };
}

/**
 * Salva ou atualiza um único produto e suas variantes no Supabase.
 * Retorna se houve discrepância de estoque.
 */
export async function upsertProduct(storeId: string, product: NuvemshopProduct, ignoreStockSync: boolean = false) {
    let discrepancies = 0;
    const sessionIds: string[] = [];

    // 1. Salvar Produto
    const { error: prodError } = await supabaseAdmin
        .from('products')
        .upsert({
            id: product.id,
            store_id: storeId,
            name: product.name, // JSON { pt: "Nome" }
            handle: product.handle,
            images: product.images, // JSON array
            published: product.published,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (prodError) {
        console.error(`[Sync] Erro ao salvar produto ${product.id}:`, prodError);
        return { discrepancies, sessionIds };
    }

    // 2. Salvar Variantes e Verificar Discrepâncias
    if (product.variants && product.variants.length > 0) {
        // Obter estoque atual para comparar
        const variantIds = product.variants.map(v => v.id);
        const { data: existingVariants } = await supabaseAdmin
            .from('product_variants')
            .select('id, stock')
            .in('id', variantIds);

        const localStockMap = new Map(existingVariants?.map(v => [Number(v.id), v.stock || 0]) || []);

        for (const variant of product.variants) {
            const localStock = localStockMap.get(variant.id);
            const remoteStock = variant.stock || 0;

            // Se a variante já existe localmente E tem divergência de estoque E é gerenciada
            if (!ignoreStockSync && variant.stock_management !== false && localStock !== undefined && localStock !== remoteStock) {
                const diff = remoteStock - localStock;
                const type = diff > 0 ? 'entrada' : 'saida';
                const sessionId = uuidv4();
                
                // Grava sessão de ajuste automático (sync)
                await supabaseAdmin.from('stock_sessions').insert({
                    id: sessionId,
                    type: type,
                    operation: 'sync_auto',
                    status: 'closed',
                    notes: `Sincronização automática Nuvemshop: estoque local(${localStock}) → remoto(${remoteStock})`,
                    user_email: 'sync_nuvemshop'
                });

                // Grava movimentação
                await supabaseAdmin.from('stock_movements').insert({
                    session_id: sessionId,
                    variant_id: variant.id,
                    quantity: diff,
                    old_stock: localStock,
                    new_stock: remoteStock
                });

                discrepancies++;
                sessionIds.push(sessionId);
                console.log(`[Sync] Discrepância corrigida para Variante ${variant.id}: Local(${localStock}) -> Nuvemshop(${remoteStock})`);
            }
        }

        const variantsToUpsert = product.variants.map(variant => {
            const localStock = localStockMap.get(variant.id);
            return {
                id: variant.id,
                product_id: product.id,
                store_id: storeId,
                sku: variant.sku,
                barcode: variant.barcode,
                price: parseFloat(variant.price),
                stock: ignoreStockSync ? (localStock ?? variant.stock) : variant.stock,
                stock_management: variant.stock_management,
                values: variant.values,
                image_url: variant.image_id ? product.images.find(img => img.id === variant.image_id)?.src : null,
                // NOTA IMPORTANTE: Nós NÃO enviamos `min_stock` aqui!
                updated_at: new Date().toISOString()
            };
        });

        const { error: varError } = await supabaseAdmin
            .from('product_variants')
            .upsert(variantsToUpsert, { onConflict: 'id' });

        if (varError) {
            console.error(`[Sync] Erro ao salvar variantes do produto ${product.id}:`, varError);
        }
    }

    return { discrepancies, sessionIds };
}

/**
 * Processa a fila de atualizações pendentes (local-first).
 * Tenta enviar para a Nuvemshop; remove da fila em caso de sucesso.
 */
async function processSyncQueue(api: NuvemshopAPI) {
    console.log('[Sync Queue] Verificando fila de sincronização pendente (operações offline)...');
    
    const { data: queueItems, error: fetchError } = await supabaseAdmin
        .from('sync_queue')
        .select('*')
        .order('created_at', { ascending: true });

    if (fetchError) {
        console.error('[Sync Queue] Erro ao buscar fila:', fetchError);
        return;
    }

    if (!queueItems || queueItems.length === 0) {
        console.log('[Sync Queue] Fila vazia. Nenhum ajuste offline pendente.');
        return;
    }

    console.log(`[Sync Queue] Encontrados ${queueItems.length} itens na fila. Enviando para Nuvemshop...`);

    let successCount = 0;
    let errorCount = 0;

    for (const item of queueItems) {
        try {
            console.log(`  -> Atualizando Nuvemshop: variante ${item.variant_id} = ${item.stock}`);
            await api.updateVariantStock(Number(item.product_id), Number(item.variant_id), Number(item.stock));
            
            // Sucesso: deleta da fila
            const { error: deleteError } = await supabaseAdmin
                .from('sync_queue')
                .delete()
                .eq('id', item.id);
                
            if (deleteError) {
                console.error(`  -> Erro ao deletar item ${item.id} da fila:`, deleteError);
            } else {
                successCount++;
            }
        } catch (error) {
            console.error(`  -> Falha contínua na Nuvemshop para a variante ${item.variant_id}:`, error);
            errorCount++;
        }
    }

    console.log(`[Sync Queue] Fila processada: ${successCount} atualizados, ${errorCount} erros remanescentes.`);
}
