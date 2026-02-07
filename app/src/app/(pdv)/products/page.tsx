import React from 'react';
import Link from 'next/link';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { NuvemshopProduct } from '@/lib/nuvemshop/api';
import { SyncButton } from './SyncButton';
import ProductsList from './ProductsList';

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

    let products: NuvemshopProduct[] = [];
    try {
        products = await client.getProducts(1, 50);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }

    return (
        <div className="products-screen p-4">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Voltar</Link>
                    <h1 className="text-xl font-bold text-white">Produtos ({products.length})</h1>
                </div>

                <div className="flex gap-2">
                    <SyncButton />
                </div>
            </header>

            {/* Pass products to client component */}
            <ProductsList products={products} />
        </div>
    );
}
