import React from 'react';
import Link from 'next/link';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { NuvemshopProduct } from '@/lib/nuvemshop/api';
import PrintQRClient from './PrintQRClient';

export default async function PrintQRPage() {
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
        products = await client.getProducts(1, 100);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }

    return (
        <div className="products-screen p-4">
            <header className="flex items-center gap-3 mb-6">
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">← Voltar</Link>
                <h1 className="text-xl font-bold text-white">🏷️ Imprimir QR Code</h1>
            </header>

            <PrintQRClient products={products} />
        </div>
    );
}
