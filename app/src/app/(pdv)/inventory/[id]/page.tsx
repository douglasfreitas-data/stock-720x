import React from 'react';
import InventoryClient from './InventoryClient';
import { getProductById } from '@/lib/products';
import Link from 'next/link';

export default async function InventoryPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const product = await getProductById(id);

    if (!product) {
        return (
            <div className="p-6 text-center text-white">
                <h1 className="text-xl font-bold mb-4">Produto não encontrado</h1>
                <p className="mb-4">O produto com ID {id} não foi localizado.</p>
                <Link href="/scan?mode=inventory" className="text-blue-400 underline">
                    Voltar para Scanner
                </Link>
            </div>
        );
    }

    return <InventoryClient initialProduct={product} />;
}
