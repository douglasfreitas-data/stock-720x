import React from 'react';
import Link from 'next/link';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { NuvemshopProduct } from '@/lib/nuvemshop/api';
import { SyncButton } from './SyncButton'; // Componente Client-Side para o botão

export default async function ProductsScreen() {
    const client = await getNuvemshopClient();

    if (!client) {
        return (
            <div className="p-6 text-center">
                <p>Você não está autenticado.</p>
                <Link href="/api/auth/login" className="text-blue-500 underline">
                    Fazer Login na Nuvemshop
                </Link>
            </div>
        );
    }

    // Busca produtos diretamente da API (Live Data)
    let products: NuvemshopProduct[] = [];
    try {
        products = await client.getProducts(1, 50);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }

    return (
        <div className="products-screen flex-1 flex flex-col h-full bg-gray-50">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-gray-500">← Voltar</Link>
                    <h1 className="text-lg font-bold">Produtos ({products.length})</h1>
                </div>

                <div className="flex gap-2">
                    <SyncButton />
                </div>
            </header>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {products.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    products.map(product => {
                        const mainImage = product.images[0]?.src || 'https://via.placeholder.com/100';
                        const variantsCount = product.variants.length;
                        const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                        // Nome seguro (tenta PT, senão pega o primeiro valor disponível)
                        const productName = product.name.pt || Object.values(product.name)[0] || 'Produto sem nome';

                        return (
                            <div key={product.id} className="bg-white p-3 rounded-lg shadow-sm flex gap-3">
                                <img
                                    src={mainImage}
                                    alt={productName}
                                    className="w-16 h-16 object-cover rounded bg-gray-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">{productName}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {variantsCount} variantes • Estoque Total: {totalStock}
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded ${product.published ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.published ? 'Publicado' : 'Rascunho'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
