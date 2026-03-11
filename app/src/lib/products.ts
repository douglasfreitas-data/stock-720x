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
    console.log(`[getProductById] Buscando id=${id}, typeof=${typeof id}`);
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
        console.error(`[getProductById] FALHA id=${id}:`, JSON.stringify(error));
        return null;
    }

    return mapVariantToProduct(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVariantToProduct(data: any): Product {
    const productData = data.products;
    const name = productData?.name?.pt || 'Produto sem nome';
    
    // Garantir que images seja array (pode vir como string do Supabase em alguns casos)
    let images = [];
    try {
        images = typeof productData?.images === 'string' 
            ? JSON.parse(productData.images) 
            : (productData?.images || []);
    } catch {
        images = [];
    }
    
    let image = images.length > 0 ? images[0].src : '';
    if (image && image.startsWith('//')) {
        image = `https:${image}`;
    }

    return {
        id: data.id,
        name: name,
        sku: data.sku || '',
        barcode: data.barcode || '',
        price: data.price || 0,
        stock: data.stock || 0,
        minStock: data.min_stock ?? 5,
        image: image,
        nuvemshopId: String(data.product_id)
    };
}
