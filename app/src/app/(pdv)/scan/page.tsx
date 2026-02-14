'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Scanner from '@/components/Scanner';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Product } from '@/lib/types';

async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
    const res = await fetch(`/api/products/barcode?code=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
}

async function searchProducts(query: string): Promise<Product[]> {
    const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
}

function ScanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'sale';
    const { addToCart, cartCount } = useCart();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Autocomplete
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const title = mode === 'sale' ? 'Escanear para Venda' : 'Escanear para Inventário';

    // Debounce search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchProducts(searchQuery);
                setSearchResults(results);
                setShowDropdown(results.length > 0);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Ao selecionar produto do autocomplete
    const handleSearchSelect = (product: Product) => {
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);

        if (mode === 'sale') {
            addToCart(product);
            showToast(`${product.name} adicionado!`, 'success');
            router.push('/cart');
        } else {
            showToast(`Produto encontrado: ${product.name}`, 'info');
            router.push('/stock/inventory');
        }
    };

    const handleScan = async (decodedText: string) => {
        if (isLoading) return;

        console.log('Scanned:', decodedText);
        setIsLoading(true);

        try {
            const product = await fetchProductByBarcode(decodedText);

            if (product) {
                if (mode === 'sale') {
                    addToCart(product);
                    showToast(`${product.name} adicionado!`, 'success');
                    router.push('/cart');
                } else {
                    showToast(`Produto encontrado: ${product.name}`, 'info');
                    router.push('/stock/inventory');
                }
            } else {
                showToast('Produto não encontrado no sistema', 'error');
            }
        } catch (error) {
            console.error('Scan error:', error);
            showToast('Erro ao buscar produto', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close">←</Link>
                <h3 className="modal-title">{title}</h3>
                {mode === 'sale' && cartCount > 0 ? (
                    <Link href="/cart" className="cart-header-btn">
                        🛒
                        <span className="cart-badge">{cartCount}</span>
                    </Link>
                ) : (
                    <div style={{ width: 40 }}></div>
                )}
            </div>

            <div className="modal-body">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-white">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-4"></div>
                        <p>Buscando produto...</p>
                    </div>
                ) : (
                    <>
                        <Scanner onScan={handleScan} />

                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '16px 0 8px', fontSize: '0.875rem' }}>
                            Ou busque por nome:
                        </p>

                        {/* Autocomplete funcional */}
                        <div style={{ padding: '0 16px', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Digite o nome do produto..."
                                className="form-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                style={{ marginBottom: showDropdown ? 0 : '16px' }}
                            />
                            {isSearching && (
                                <div style={{ textAlign: 'center', padding: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    Buscando...
                                </div>
                            )}
                            {showDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 16,
                                    right: 16,
                                    zIndex: 50,
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0 0 8px 8px',
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                    marginBottom: 16,
                                }}>
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSearchSelect(p)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '10px 12px',
                                                background: 'none',
                                                border: 'none',
                                                borderBottom: '1px solid var(--border)',
                                                color: 'var(--text-primary)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                Est: {p.stock} | {p.barcode || p.sku || '—'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {mode === 'sale' && cartCount > 0 && !isLoading && (
                    <div style={{ padding: '24px 16px', marginTop: 'auto', textAlign: 'center' }}>
                        <Link href="/cart" className="btn-view-cart" style={{ margin: '0 auto', maxWidth: '320px' }}>
                            🛒 Ver Carrinho ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ScanPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Carregando scanner...</div>}>
            <ScanContent />
        </Suspense>
    );
}
