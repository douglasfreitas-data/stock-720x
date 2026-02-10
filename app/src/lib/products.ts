import { supabaseAdmin } from '@/lib/supabase/client';
import { Product } from '@/lib/types';

/**
 * ATENÇÃO: Este arquivo usa supabaseAdmin (service_role).
 * Ele deve ser importado APENAS em contextos server-side:
 * - Server Components (page.tsx sem 'use client')
 * - API Routes (route.ts)
 * - Server Actions (actions/*.ts)
 * 
 * Para uso em Client Components, use a API /api/products?barcode=xxx
 */

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
        .from('product_variants')
        .select(`
            *,
            products (
                name,
                images
            )
        `)
        .eq('barcode', barcode)
        .single();

    if (error || !data) {
        console.error('Error fetching product by barcode:', error);
        return null;
    }

    return mapVariantToProduct(data);
}

export async function getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
        .from('product_variants')
        .select(`
            *,
            products (
                name,
                images
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error fetching product by id:', error);
        return null;
    }

    return mapVariantToProduct(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVariantToProduct(data: any): Product {
    const productData = data.products;
    const name = productData?.name?.pt || 'Produto sem nome';
    const images = productData?.images || [];
    const image = images.length > 0 ? images[0].src : '';

    return {
        id: data.id,
        name: name,
        sku: data.sku || '',
        barcode: data.barcode || '',
        price: data.price || 0,
        stock: data.stock || 0,
        minStock: 5,
        image: image,
        nuvemshopId: String(data.product_id)
    };
}
