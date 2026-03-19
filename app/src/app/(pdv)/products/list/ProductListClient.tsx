'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Package, ArrowLeft, Search, X } from 'lucide-react';

interface LocalVariant {
    id: number;
    image_url?: string | null;
    stock?: number | null;
    min_stock?: number | null;
    sku?: string | null;
    barcode?: string | null;
    values?: { pt: string }[] | null;
}

interface LocalProduct {
    id: number;
    name: { pt?: string; [key: string]: string | undefined };
    images: { id?: number; src: string }[];
    variants: LocalVariant[];
    published: boolean;
}

// Define a type for the processed product, as it's used for selectedProduct
interface ProcessedProduct {
    id: number;
    productId: number;
    productName: string;
    sku: string;
    barcode: string;
    totalStock: number;
    minStock: number;
    mainImage: string;
    // Add other properties from LocalProduct if needed for selectedProduct details
    // For example, if you want to show original product name or other details
    name: { pt?: string; [key: string]: string | undefined };
    images: { id?: number; src: string }[];
    variants: LocalVariant[];
    published: boolean;
}


interface ProductListClientProps {
    products: LocalProduct[];
}

export default function ProductListClient({ products }: { products: LocalProduct[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProcessedProduct | null>(null);
    const [visibleCount, setVisibleCount] = useState(10);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Reset visible count when searching
    useEffect(() => {
        setVisibleCount(10);
    }, [searchTerm]);

    // Transform and sort products alphabetically
    const processedProducts = useMemo(() => {
        return products.flatMap(product =>
            product.variants.map((v, index) => {
                const mainImage = v.image_url || product.images?.[0]?.src || 'https://via.placeholder.com/100';
                let productName = product.name?.pt || (product.name ? Object.values(product.name)[0] : null) || 'Produto sem nome';
                
                if (v.values && Array.isArray(v.values) && v.values.length > 0) {
                    const tags = v.values.map(val => val?.pt).filter(Boolean).join(' / ');
                    if (tags) {
                        productName = `${productName} - ${tags}`;
                    }
                } else if (product.variants.length > 1) {
                    productName = `${productName} - Var ${index + 1}`;
                }

                const sku = v.sku || '-';
                const barcode = v.barcode || '-';

                return {
                    ...product,
                    id: v.id,
                    productId: product.id,
                    productName,
                    sku,
                    barcode,
                    totalStock: v.stock || 0,
                    minStock: v.min_stock || 0,
                    mainImage
                };
            })
        ).sort((a, b) => a.productName.localeCompare(b.productName));
    }, [products]);

    // Filter by search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return processedProducts;
        const q = searchTerm.toLowerCase();
        return processedProducts.filter(p =>
            p.productName.toLowerCase().includes(q)
        );
    }, [processedProducts, searchTerm]);

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev < filteredProducts.length ? prev + 10 : prev);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [filteredProducts.length]);

    return (
        <div className="modal-body p-0">
            {/* Search Bar */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px' }} />
                    <input
                        placeholder="Buscar produto por nome..."
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
                    <>
                        {visibleProducts.map((product, index) => (
                            <div 
                                key={`prod-${product.id}-${index}`} 
                                className="product-list-item"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <img 
                                    src={`/_next/image?url=${encodeURIComponent(product.mainImage)}&w=128&q=75`} 
                                    alt={product.productName} 
                                    className="product-list-image" 
                                    loading="lazy"
                                />
                                <div className="product-list-info">
                                    <h3 className="product-list-name">{product.productName}</h3>
                                    <p className="product-list-stock" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Package size={14} /> {product.totalStock} em estoque
                                    </p>
                                    {product.minStock > 0 && (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            Mín. Ideal: {product.minStock}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {visibleCount < filteredProducts.length && (
                            <div ref={observerTarget} className="loading-spinner-container">
                                <div className="loading-spinner" />
                                <span className="loading-spinner-text">Carregando...</span>
                            </div>
                        )}
                    </>
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
                                Código: {selectedProduct.id}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Package size={14} /> {selectedProduct.totalStock} em estoque
                            </p>
                            {selectedProduct.minStock > 0 && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    Mín. Ideal: {selectedProduct.minStock}
                                </p>
                            )}
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
