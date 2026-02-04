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
        image: "/Dedeira Avalon Tec One.webp"
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
        image: "/Flechas Avalon Hybrid.webp"
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
        image: "/BortoNock - 720x.webp"
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
        image: "/Kit Pro Dragon X8 (Preto) - Sanlida.webp"
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
        image: "/Arco Recurvo Escola (Magnésio) - Jandao.webp"
    },
    {
        id: 6,
        name: "OUTDOOR COMPOSTO - Alvo oficial WA 80cm (10 unidades)",
        sku: "ALV-OUT-006",
        barcode: "7891234567005",
        price: 89.00,
        priceDiscount: 80.10,
        costPrice: 40.00,
        stock: 25,
        minStock: 10,
        category: "Alvos",
        brand: "Avalon",
        image: "/OUTDOOR COMPOSTO - Alvo oficial WA 80cm (10 unidades) - Avalon.webp"
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
