'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InventoryClient from './InventoryClient';
import Link from 'next/link';
import { Product } from '@/lib/types';

export default function InventoryPage() {
    const params = useParams();
    const id = params?.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchProduct() {
            try {
                // Buscar o produto via API (mesmo endpoint que o scanner usa)
                const res = await fetch(`/api/products/barcode?id=${encodeURIComponent(id)}`);
                if (!res.ok) {
                    setError(`Produto com ID ${id} não encontrado.`);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setProduct(data.product || null);
                if (!data.product) {
                    setError(`Produto com ID ${id} não encontrado.`);
                }
            } catch (err) {
                console.error('[InventoryPage] Erro ao buscar produto:', err);
                setError('Erro ao buscar produto.');
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 text-center text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p>Carregando produto...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="p-6 text-center text-white">
                <h1 className="text-xl font-bold mb-4">Produto não encontrado</h1>
                <p className="mb-4">{error || `O produto com ID ${id} não foi localizado.`}</p>
                <Link href="/scan?mode=inventory" className="text-blue-400">
                    Voltar para Scanner
                </Link>
            </div>
        );
    }

    return <InventoryClient initialProduct={product} />;
}
