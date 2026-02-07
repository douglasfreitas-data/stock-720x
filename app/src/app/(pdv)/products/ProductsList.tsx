'use client';

import { useState } from 'react';
import PrintQRModal from '@/components/PrintQRModal';

interface NuvemshopProduct {
    id: number;
    name: { pt?: string;[key: string]: string | undefined };
    images: { src: string }[];
    variants: { stock?: number | null; sku?: string | null; barcode?: string | null }[];
    published: boolean;
}

interface ProductsListProps {
    products: NuvemshopProduct[];
}

export default function ProductsList({ products }: ProductsListProps) {
    const [showPrintModal, setShowPrintModal] = useState(false);

    // Transform products for QR modal
    const productsForQR = products.map(p => ({
        id: p.id,
        name: p.name.pt || Object.values(p.name)[0] || 'Produto sem nome',
        sku: p.variants[0]?.sku || `SKU-${p.id}`,
        barcode: p.variants[0]?.barcode || p.variants[0]?.sku || `${p.id}`,
        image: p.images[0]?.src || 'https://via.placeholder.com/100',
        category: '',
        brand: ''
    }));

    return (
        <>
            {/* Print QR Button */}
            <button
                className="btn-confirm"
                onClick={() => setShowPrintModal(true)}
                style={{ margin: '16px', marginTop: 0 }}
            >
                🏷️ Gerar QR Codes
            </button>

            {/* Product List */}
            <div className="product-list">
                {products.length === 0 ? (
                    <div className="text-center" style={{ color: 'var(--text-muted)', marginTop: '40px' }}>
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    products.map(product => {
                        const mainImage = product.images[0]?.src || 'https://via.placeholder.com/100';
                        const variantsCount = product.variants.length;
                        const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                        const productName = product.name.pt || Object.values(product.name)[0] || 'Produto sem nome';
                        const sku = product.variants[0]?.sku || '-';
                        const barcode = product.variants[0]?.barcode || '-';

                        return (
                            <div key={product.id} className="product-list-item">
                                <img src={mainImage} alt={productName} className="product-list-image" />
                                <div className="product-list-info">
                                    <h3 className="product-list-name">{productName}</h3>
                                    <p className="product-list-sku">SKU: {sku}</p>
                                    <p className="product-list-stock">{variantsCount} variantes • Estoque: {totalStock}</p>
                                    {barcode && <p className="product-list-barcode">{barcode}</p>}
                                </div>
                                <div style={{ alignSelf: 'center' }}>
                                    <span className={`products-menu-badge`}>
                                        {product.published ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Print QR Modal */}
            {showPrintModal && (
                <PrintQRModal
                    products={productsForQR}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </>
    );
}
