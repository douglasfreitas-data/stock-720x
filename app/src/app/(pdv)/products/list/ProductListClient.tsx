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
    const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Generate QR codes for thumbnails
    useEffect(() => {
        const generateQRCodes = async () => {
            const codes: Record<number, string> = {};
            for (const product of products) {
                try {
                    const barcode = product.variants[0]?.barcode || product.variants[0]?.sku || `${product.id}`;
                    codes[product.id] = await QRCode.toDataURL(barcode, {
                        width: 150,
                        margin: 1,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                } catch (err) {
                    console.error('Error generating QR code:', err);
                }
            }
            setQrCodes(codes);
        };
        generateQRCodes();
    }, [products]);

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
                        const variantsCount = product.variants.length;
                        const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                        const productName = product.name.pt || Object.values(product.name)[0] || 'Produto sem nome';
                        const sku = product.variants[0]?.sku || '-';
                        const barcode = product.variants[0]?.barcode || '-';

                        return (
                            <div
                                key={product.id}
                                className="product-list-item"
                                onClick={() => setSelectedProduct({ ...product, productName, barcode })}
                            >
                                <img src={mainImage} alt={productName} className="product-list-image" />
                                <div className="product-list-info">
                                    <h3 className="product-list-name">{productName}</h3>
                                    <p className="product-list-sku">SKU: {sku}</p>
                                    <p className="product-list-stock">📦 {totalStock} em estoque</p>
                                    {barcode && <p className="product-list-barcode">{barcode}</p>}
                                </div>
                                <div className="product-list-qr">
                                    {qrCodes[product.id] ? (
                                        <img src={qrCodes[product.id]} alt="QR" className="qr-thumbnail" />
                                    ) : (
                                        <div className="qr-loading">⏳</div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* QR Code Modal */}
            {selectedProduct && (
                <div className="qr-modal" onClick={() => setSelectedProduct(null)}>
                    <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="qr-modal-title">{selectedProduct.productName}</h3>
                        <p className="qr-modal-barcode">{selectedProduct.barcode}</p>
                        {qrCodes[selectedProduct.id] && (
                            <img
                                src={qrCodes[selectedProduct.id]}
                                alt="QR Large"
                                className="qr-large"
                            />
                        )}
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
