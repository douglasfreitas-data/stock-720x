'use client';

import React from 'react';
import Link from 'next/link';
import { CartProvider, useCart } from '@/components/providers/CartProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

function HeaderCartButton() {
    const { cartCount } = useCart();
    return (
        <div className="header-menu">
            <Link href="/cart" style={{ position: 'relative', fontSize: '1.5rem', color: 'white', textDecoration: 'none' }}>
                🛒
                {cartCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-6px', right: '-10px',
                        background: 'var(--accent)', color: 'white',
                        borderRadius: '50%', width: '18px', height: '18px',
                        fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {cartCount}
                    </span>
                )}
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
