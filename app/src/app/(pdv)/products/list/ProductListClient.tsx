'use client';

import { useState, useMemo } from 'react';
import { Package, ArrowLeft, Search, X } from 'lucide-react';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Transform and sort products alphabetically
    const processedProducts = useMemo(() => {
        return products.map(product => {
            const mainImage = product.images[0]?.src || 'https://via.placeholder.com/100';
            const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
            const productName = product.name.pt || Object.values(product.name)[0] || 'Produto sem nome';
            const sku = product.variants[0]?.sku || '-';
            const barcode = product.variants[0]?.barcode || '-';

            return {
                ...product,
                productName,
                sku,
                barcode,
                totalStock,
                mainImage
            };
        }).sort((a, b) => a.productName.localeCompare(b.productName));
    }, [products]);

    // Filter by search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return processedProducts;
        const q = searchTerm.toLowerCase();
        return processedProducts.filter(p =>
            p.productName.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
    }, [processedProducts, searchTerm]);

    return (
        <div className="modal-body p-0">
            {/* Search Bar */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px' }} />
                    <input
                        type="text"
                        placeholder="Buscar produto por nome ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            paddingRight: searchTerm ? '40px' : '12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{
                                position: 'absolute', right: '12px', background: 'transparent',
                                border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="product-list">
                {filteredProducts.length === 0 ? (
                    <div className="text-center" style={{ color: 'var(--text-muted)', marginTop: '40px' }}>
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="product-list-item"
                            onClick={() => setSelectedProduct(product)}
                        >
                            <img src={product.mainImage} alt={product.productName} className="product-list-image" />
                            <div className="product-list-info">
                                <h3 className="product-list-name">{product.productName}</h3>
                                <p className="product-list-sku">SKU: {product.sku}</p>
                                <p className="product-list-stock" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={14} /> {product.totalStock} em estoque</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Full Product Detail Modal */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-header">
                        <button onClick={() => setSelectedProduct(null)} className="modal-close"><ArrowLeft size={24} /></button>
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
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Package size={14} /> {selectedProduct.totalStock} em estoque
                            </p>
                        </div>

                        {/* Actions */}
                        <button
                            className="btn-confirm"
                            onClick={() => setSelectedProduct(null)}
                            style={{ marginTop: '20px' }}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
