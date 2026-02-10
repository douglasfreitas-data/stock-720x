'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Scanner from '@/components/Scanner';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Product } from '@/lib/types';

/**
 * Busca produto via API server-side (que usa supabaseAdmin)
 * Nunca acessa o Supabase diretamente do client-side
 */
async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
    const res = await fetch(`/api/products/barcode?code=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
}

function ScanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'sale';
    const { addToCart, cartCount } = useCart();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const title = mode === 'sale' ? 'Escanear para Venda' : 'Escanear para Inventário';

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
                    router.push(`/inventory/${product.id}`);
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
                            Ou digite manualmente:
                        </p>

                        {/* Botões de teste com barcodes reais da loja */}
                        <div className="quick-codes">
                            <p className="quick-codes-label">Teste rápido:</p>
                            <div className="quick-codes-list">
                                <button
                                    type="button"
                                    className="quick-code"
                                    onClick={() => handleScan('6426010922905')}
                                >
                                    🏷️ Dedeira Avalon
                                </button>
                                <button
                                    type="button"
                                    className="quick-code"
                                    onClick={() => handleScan('7891234567001')}
                                >
                                    🏹 Flechas Hybrid
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {mode === 'sale' && cartCount > 0 && !isLoading && (
                    <Link href="/cart" className="btn-view-cart">
                        🛒 Ver Carrinho ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
                    </Link>
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
