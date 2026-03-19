import React from 'react';
import Link from 'next/link';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { NuvemshopProduct } from '@/lib/nuvemshop/api';
import ProductListClient from './ProductListClient';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/client';

export default async function ProductList() {
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
        products = await client.getProducts(1, 100, { next: { revalidate: 60, tags: ['products'] } });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }

    let minStockMap: Record<number, number> = {};
    if (products && products.length > 0) {
        try {
            const variantIds = products.flatMap(p => p.variants.map(v => v.id));
            const { data, error } = await supabaseAdmin
                .from('product_variants')
                .select('id, min_stock')
                .in('id', variantIds);

            if (!error && data) {
                minStockMap = data.reduce((acc, curr) => {
                    acc[curr.id] = curr.min_stock || 0;
                    return acc;
                }, {} as Record<number, number>);
            }
        } catch (e) {
            console.error('Erro ao buscar min_stock:', e);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/products" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Lista de Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>
            <ProductListClient products={products} minStockMap={minStockMap} />
        </div>
    );
}
