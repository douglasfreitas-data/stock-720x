export interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string;
    price: number;
    stock: number;
    minStock: number;
    image: string;
    nuvemshopId?: string;
    stock_management?: boolean;
}

export interface CartItem {
    productId: number;
    quantity: number;
    product?: Product;
    customPrice?: number;
}
