import { NextRequest, NextResponse } from 'next/server';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { upsertProduct } from '@/lib/sync/products';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const event = body.event;
        const productId = body.id;
        const storeId = body.store_id;

        console.log(`📦 Webhook Product [${event}] recebido:`, { productId, storeId });

        if (!productId) {
            return NextResponse.json({ success: true, message: 'Nenhum ID de produto presente.' });
        }

        // Deletar o produto se evento for product/deleted
        if (event === 'product/deleted' || event === 'app/uninstalled') {
            console.log(`❌ Deletando produto ${productId} do cache local...`);
            const { error: delError } = await supabaseAdmin
                .from('products')
                .delete()
                .eq('id', productId);

            if (delError) {
                console.error(`Falha ao deletar produto ${productId}:`, delError);
            }
            return NextResponse.json({ success: true, processed: productId });
        }

        // Caso contrário, (created, updated), buscar os dados fresquinhos do produto na Nuvemshop
        const api = await getNuvemshopClient();

        if (!api) {
            console.error('Nuvemshop client não configurado/autenticado. Falha no Webhook.');
            return NextResponse.json({ error: 'Tenant ou loja não configurada.' }, { status: 500 });
        }

        // Opcional: checar se o `storeId` do webhook bate com nossa loja
        const currentStoreId = api.getStoreId();
        if (storeId && storeId.toString() !== currentStoreId.toString()) {
            console.warn(`Webhook ignorado. O evento pertence à loja ${storeId}, mas a configuração local é da loja ${currentStoreId}`);
            return NextResponse.json({ success: true, ignored: true });
        }

        console.log(`🔄 Sincronizando dados atualizados do produto ${productId}...`);

        try {
            const productData = await api.getProduct(productId);
            // Salva/Substitui o produto e variantes no Supabase
            await upsertProduct(currentStoreId, productData);

            console.log(`✅ Produto ${productId} sincronizado via Webhook.`);
        } catch (fetchErr) {
            console.error(`Falha ao buscar produto ${productId} na API Nuvemshop (apagado ou inválido?):`, fetchErr);
            // Ignorar para o webhook retries não ficar infinito caso o produto já tenha sido deletado
        }

        return NextResponse.json({
            success: true,
            processed: productId
        });

    } catch (error) {
        console.error('Erro no processamento do webhook de products:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
