'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Scanner from '@/components/Scanner';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { findProductByBarcode } from '@/lib/mock-data';

function ScanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'sale';
    const { addToCart, cartCount } = useCart();
    const { showToast } = useToast();

    const title = mode === 'sale' ? 'Escanear para Venda' : 'Escanear para Inventário';

    const handleScan = (decodedText: string) => {
        console.log('Scanned:', decodedText);

        // Busca produto (mock por enquanto)
        const product = findProductByBarcode(decodedText);

        if (product) {
            if (mode === 'sale') {
                addToCart(product);
                showToast(`${product.name} adicionado!`, 'success');
                router.push('/cart');
            } else {
                // Inventory mode
                showToast(`Produto encontrado: ${product.name}`, 'info');
                // router.push(`/inventory/${product.id}`); // Futuro
            }
        } else {
            showToast('Produto não encontrado', 'error');
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
                <Scanner onScan={handleScan} />

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '16px 0 8px', fontSize: '0.875rem' }}>
                    Ou digite manualmente:
                </p>

                {/* Quick Test Buttons */}
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
                    </div>
                </div>

                {mode === 'sale' && cartCount > 0 && (
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
