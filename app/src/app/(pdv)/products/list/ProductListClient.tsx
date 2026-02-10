'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface NuvemshopProduct {
    id: number;
    name: { pt?: string;[key: string]: string | undefined };
    images: { src: string }[];
    variants: { stock?: number | null; sku?: string | null; barcode?: string | null }[];
    published: boolean;
}

interface ProductListClientProps {
    products: NuvemshopProduct[];
}

export default function ProductListClient({ products }: ProductListClientProps) {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string>('');

    // Generate QR code when product is selected
    useEffect(() => {
        if (selectedProduct) {
            const generateQR = async () => {
                try {
                    const barcode = selectedProduct.barcode || selectedProduct.sku || `${selectedProduct.id}`;
                    const qr = await QRCode.toDataURL(barcode, {
                        width: 300,
                        margin: 2,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    setQrCode(qr);
                } catch (err) {
                    console.error('Error generating QR code:', err);
                }
            };
            generateQR();
        }
    }, [selectedProduct]);

    return (
        <div className="modal-body p-0">
            <div className="product-list">
                {products.length === 0 ? (
                    <div className="text-center" style={{ color: 'var(--text-muted)', marginTop: '40px' }}>
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    products.map(product => {
                        const mainImage = product.images[0]?.src || 'https://via.placeholder.com/100';
                        const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                        const productName = product.name.pt || Object.values(product.name)[0] || 'Produto sem nome';
                        const sku = product.variants[0]?.sku || '-';
                        const barcode = product.variants[0]?.barcode || '-';

                        return (
                            <div
                                key={product.id}
                                className="product-list-item"
                                onClick={() => setSelectedProduct({ ...product, productName, barcode, sku, totalStock, mainImage })}
                            >
                                <img src={mainImage} alt={productName} className="product-list-image" />
                                <div className="product-list-info">
                                    <h3 className="product-list-name">{productName}</h3>
                                    <p className="product-list-sku">SKU: {sku}</p>
                                    <p className="product-list-stock">📦 {totalStock} em estoque</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Full Product Detail Modal */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-header">
                        <button onClick={() => setSelectedProduct(null)} className="modal-close">←</button>
                        <h3 className="modal-title">Detalhes do Produto</h3>
                        <div style={{ width: 40 }}></div>
                    </div>

                    <div className="modal-body" onClick={e => e.stopPropagation()}>
                        {/* Product Image */}
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                            <img
                                src={selectedProduct.mainImage}
                                alt={selectedProduct.productName}
                                style={{
                                    width: '200px',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-color)'
                                }}
                            />
                        </div>

                        {/* Product Info */}
                        <div className="form-section">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                                {selectedProduct.productName}
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>
                                SKU: {selectedProduct.sku}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>
                                Barcode: {selectedProduct.barcode}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                📦 {selectedProduct.totalStock} em estoque
                            </p>
                        </div>

                        {/* QR Code */}
                        {qrCode && (
                            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
                                    QR Code
                                </label>
                                <img
                                    src={qrCode}
                                    alt="QR Code"
                                    style={{
                                        width: '250px',
                                        height: '250px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)'
                                    }}
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <button
                            className="btn-confirm"
                            onClick={() => setSelectedProduct(null)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
