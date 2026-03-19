import React from 'react';
import Link from 'next/link';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
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

    let products: any[] = [];
    try {
        // Busca 100% no banco de dados local para zero delays!
        const { data: dbProducts, error } = await supabaseAdmin
            .from('products')
            .select(`
                id,
                name,
                images,
                published,
                variants:product_variants(id, image_url, stock, min_stock, sku, barcode, values)
            `)
            .order('id', { ascending: false });

        if (error) {
            console.error('Erro ao buscar produtos do banco:', error);
        } else if (dbProducts) {
            products = dbProducts.map(p => ({
                id: p.id,
                name: typeof p.name === 'string' ? JSON.parse(p.name) : (p.name || {}),
                images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
                published: p.published,
                variants: (p.variants || []).map((v: any) => ({
                    id: v.id,
                    stock: v.stock,
                    min_stock: v.min_stock,
                    sku: v.sku,
                    barcode: v.barcode,
                    values: typeof v.values === 'string' ? JSON.parse(v.values) : (v.values || null),
                    image_url: v.image_url,
                }))
            }));
        }
    } catch (error) {
        console.error('Erro ao processar produtos:', error);
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/products" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Lista de Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>
            <ProductListClient products={products} />
        </div>
    );
}
