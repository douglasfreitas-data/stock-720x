/**
 * Cliente da API Nuvemshop
 */

import { NUVEMSHOP_CONFIG } from './config';

export interface NuvemshopProduct {
    id: number;
    name: { pt: string };
    variants: NuvemshopVariant[];
    images: { src: string }[];
    handle: string;
    published: boolean;
}

export interface NuvemshopVariant {
    id: number;
    product_id: number;
    sku: string | null;
    barcode: string | null;
    price: string;
    stock: number | null;
    stock_management: boolean;
}

export interface NuvemshopOrder {
    id: number;
    number: string;
    status: string;
    total: string;
    products: {
        product_id: number;
        variant_id: number;
        quantity: number;
    }[];
}

/**
 * Classe cliente para API Nuvemshop
 */
export class NuvemshopAPI {
    private storeId: string;
    private accessToken: string;
    private baseUrl: string;

    constructor(storeId: string, accessToken: string) {
        this.storeId = storeId;
        this.accessToken = accessToken;
        this.baseUrl = `${NUVEMSHOP_CONFIG.API_URL}/v1/${storeId}`;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authentication': `bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Stock720x (stock720x@example.com)',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Nuvemshop API Error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    // ================================
    // PRODUTOS
    // ================================

    /**
     * Lista todos os produtos (paginado)
     */
    async getProducts(page = 1, perPage = 50): Promise<NuvemshopProduct[]> {
        return this.request<NuvemshopProduct[]>(
            `/products?page=${page}&per_page=${perPage}`
        );
    }

    /**
     * Busca produto por ID
     */
    async getProduct(productId: number): Promise<NuvemshopProduct> {
        return this.request<NuvemshopProduct>(`/products/${productId}`);
    }

    /**
     * Atualiza estoque de uma variante
     */
    async updateVariantStock(
        productId: number,
        variantId: number,
        stock: number
    ): Promise<NuvemshopVariant> {
        return this.request<NuvemshopVariant>(
            `/products/${productId}/variants/${variantId}`,
            {
                method: 'PUT',
                body: JSON.stringify({ stock }),
            }
        );
    }

    /**
     * Busca variante por código de barras
     */
    async findVariantByBarcode(barcode: string): Promise<{
        product: NuvemshopProduct;
        variant: NuvemshopVariant;
    } | null> {
        // API Nuvemshop não tem busca direta por barcode
        // Precisamos buscar todos os produtos e filtrar localmente
        // Em produção, manter um cache local sincronizado
        const products = await this.getProducts(1, 200);

        for (const product of products) {
            const variant = product.variants.find(v => v.barcode === barcode);
            if (variant) {
                return { product, variant };
            }
        }

        return null;
    }

    // ================================
    // PEDIDOS
    // ================================

    /**
     * Lista pedidos recentes
     */
    async getOrders(page = 1, perPage = 50): Promise<NuvemshopOrder[]> {
        return this.request<NuvemshopOrder[]>(
            `/orders?page=${page}&per_page=${perPage}`
        );
    }

    /**
     * Busca pedido por ID
     */
    async getOrder(orderId: number): Promise<NuvemshopOrder> {
        return this.request<NuvemshopOrder>(`/orders/${orderId}`);
    }
}
