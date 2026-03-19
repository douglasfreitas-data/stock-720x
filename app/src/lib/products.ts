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

// ...
export async function getProductByBarcode(term: string): Promise<Product | null> {
    // Search by barcode OR sku OR id
    let query = supabaseAdmin
        .from('product_variants')
        .select(`
            *,
            products (
                name,
                images
            )
        `);
    
    // Se o termo for numérico, pode bater com o ID
    const isNum = !isNaN(Number(term));
    if (isNum) {
        query = query.or(`barcode.eq.${term},sku.eq.${term},id.eq.${term}`);
    } else {
        query = query.or(`barcode.eq.${term},sku.eq.${term}`);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error || !data) {
        console.error('Error fetching product by barcode/sku/id:', error);
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
    let name = productData?.name?.pt || 'Produto sem nome';
    
    if (data.values && Array.isArray(data.values) && data.values.length > 0) {
        const variantTags = data.values.map((v: any) => v.pt).filter(Boolean).join(' / ');
        if (variantTags) {
            name = `${name} - ${variantTags}`;
        }
    }

    // Garantir que images seja array (pode vir como string do Supabase em alguns casos)
    let images = [];
    try {
        images = typeof productData?.images === 'string' 
            ? JSON.parse(productData.images) 
            : (productData?.images || []);
    } catch {
        images = [];
    }
    
    let image = data.image_url;
    if (!image) {
        image = images.length > 0 ? images[0].src : '';
    }
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
