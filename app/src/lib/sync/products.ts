import { NuvemshopAPI, NuvemshopProduct } from '@/lib/nuvemshop/api';
import { supabaseAdmin } from '@/lib/supabase/client';

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

    console.log(`[Sync] Iniciando sincronização de produtos para loja ${storeId}...`);

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
                await upsertProduct(storeId, product);
                totalSynced++;
            }

            // Se retornou menos que o per_page, é a última página
            if (products.length < 50) {
                hasMore = false;
            } else {
                page++;
            }
        } catch (error) {
            // Nuvemshop retorna 404 quando a página não existe
            console.log(`[Sync] Página ${page} não existe, finalizando paginação.`);
            hasMore = false;
        }

        // Limite de segurança
        if (page > 100) hasMore = false;
    }

    console.log(`[Sync] Sincronização concluída! Total: ${totalSynced} produtos.`);
    return totalSynced;
}

/**
 * Salva ou atualiza um único produto e suas variantes no Supabase
 */
async function upsertProduct(storeId: string, product: NuvemshopProduct) {
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
        return;
    }

    // 2. Salvar Variantes
    if (product.variants && product.variants.length > 0) {
        const variantsToUpsert = product.variants.map(variant => ({
            id: variant.id,
            product_id: product.id,
            store_id: storeId,
            sku: variant.sku,
            barcode: variant.barcode,
            price: parseFloat(variant.price),
            stock: variant.stock,
            stock_management: variant.stock_management,
            updated_at: new Date().toISOString()
        }));

        const { error: varError } = await supabaseAdmin
            .from('product_variants')
            .upsert(variantsToUpsert, { onConflict: 'id' });

        if (varError) {
            console.error(`[Sync] Erro ao salvar variantes do produto ${product.id}:`, varError);
        }
    }
}
