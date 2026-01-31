// Dados de produtos reais da loja 720x.com.br (arco e flecha)
export const products = [
    {
        id: 1,
        name: "Dedeira Avalon Tec One",
        sku: "DED-TEC-001",
        barcode: "6426010922905",
        price: 189.00,
        priceDiscount: 170.10,
        costPrice: 85.00,
        stock: 12,
        minStock: 5,
        category: "Dedeiras",
        brand: "Avalon",
        image: "/dedeira-avalon.webp"
    },
    {
        id: 2,
        name: "Flechas Avalon Hybrid",
        sku: "FLE-AVL-002",
        barcode: "7891234567001",
        price: 48.00,
        priceDiscount: 43.20,
        costPrice: 25.00,
        stock: 45,
        minStock: 15,
        category: "Flechas montadas",
        brand: "Avalon",
        image: "https://d2r9epyceweg5n.cloudfront.net/stores/001/513/699/products/avalon-hybrid-arrow-2-7c2c61a0a3fb7c77e716719693754730-1024-1024.webp"
    },
    {
        id: 3,
        name: "BortoNock - 720x",
        sku: "NOC-720-003",
        barcode: "7891234567002",
        price: 47.00,
        priceDiscount: 42.30,
        costPrice: 20.00,
        stock: 120,
        minStock: 30,
        category: "Nocks",
        brand: "720x",
        image: "https://d2r9epyceweg5n.cloudfront.net/stores/001/513/699/products/bortonock-campadrao21-43467f3ad19d7e1ad816719742012970-480-0.webp"
    },
    {
        id: 4,
        name: "Kit Pro Dragon X8 (Preto) - Sanlida",
        sku: "KIT-DRG-004",
        barcode: "7891234567003",
        price: 3150.00,
        priceDiscount: 2835.00,
        costPrice: 1500.00,
        stock: 3,
        minStock: 2,
        category: "Dragon 8",
        brand: "Sanlida",
        image: "https://d2r9epyceweg5n.cloudfront.net/stores/001/513/699/products/fotodragonx81-4aa8ecc3dd2dab99a816716089232959-480-0.webp"
    },
    {
        id: 5,
        name: "Arco Recurvo Escola (Magnésio) - Jandao",
        sku: "ARC-ESC-005",
        barcode: "7891234567004",
        price: 1010.00,
        priceDiscount: 909.00,
        costPrice: 450.00,
        stock: 8,
        minStock: 3,
        category: "Kits",
        brand: "Jandao",
        image: "https://d2r9epyceweg5n.cloudfront.net/stores/001/513/699/products/fotomagnesio-eb3acb5e0e16f4f12016703015161011-480-0.webp"
    },
    {
        id: 6,
        name: "Riser ILF Astral V2 - Core",
        sku: "RIS-AST-006",
        barcode: "7891234567005",
        price: 1150.00,
        priceDiscount: 1035.00,
        costPrice: 550.00,
        stock: 5,
        minStock: 2,
        category: "Punhos",
        brand: "Core",
        image: "https://d2r9epyceweg5n.cloudfront.net/stores/001/513/699/products/fotoastralv2-1-ed4e67a59b25c0dd7b16715933259892-480-0.webp"
    }
];

// Clientes mockados
export const customers = [
    { id: 1, name: "Carlos Arqueiro", phone: "(11) 99999-1111" },
    { id: 2, name: "Ana Tiro Esportivo", phone: "(11) 99999-2222" },
    { id: 3, name: "Clube de Arqueria SP", phone: "(11) 99999-3333" },
    { id: 4, name: "Pedro Alvo Certo", phone: "(11) 99999-4444" },
    { id: 5, name: "Marina Flecheira", phone: "(11) 99999-5555" }
];

// Helper para buscar produto por código de barras
export const findProductByBarcode = (barcode) => {
    return products.find(p => p.barcode === barcode);
};

// Helper para buscar produtos
export const searchProducts = (query) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        p.barcode.includes(query) ||
        p.brand.toLowerCase().includes(lowerQuery)
    );
};

// Helper para status do estoque
export const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { status: 'empty', color: '#ef4444', label: 'Esgotado' };
    if (stock <= minStock) return { status: 'critical', color: '#ef4444', label: 'Crítico' };
    if (stock <= minStock * 2) return { status: 'warning', color: '#eab308', label: 'Baixo' };
    return { status: 'ok', color: '#22c55e', label: 'OK' };
};
