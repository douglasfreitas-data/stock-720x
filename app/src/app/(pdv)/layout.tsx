'use client';

import React from 'react';
import Link from 'next/link';
import { CartProvider, useCart } from '@/components/providers/CartProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

function HeaderCartButton() {
    const { cartCount } = useCart();

    return (
        <div className="header-menu">
            <Link href="/cart" className="cart-header-btn">
                🛒
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
        </div>
    );
}

export default function PDVLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <CartProvider>
                <div className="app">
                    {/* Header Global */}
                    <header className="header">
                        {/* Logo corrigido para path absoluto do public */}
                        <img src="/logo.png" alt="720x" className="logo" />
                        <HeaderCartButton />
                    </header>

                    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {children}
                    </main>
                </div>
            </CartProvider>
        </ToastProvider>
    );
}
