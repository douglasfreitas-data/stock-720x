'use client';

import React from 'react';
import Link from 'next/link';
import { CartProvider, useCart } from '@/components/providers/CartProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { OnlineStatusProvider } from '@/components/providers/OnlineStatusProvider';
import OfflineBanner from '@/components/OfflineBanner';
import PushNotificationPrompt from '@/components/PushNotificationPrompt';

import { ShoppingCart } from 'lucide-react';

function HeaderCartButton() {
    const { cartCount } = useCart();
    return (
        <div className="header-menu">
            <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none' }}>
                <ShoppingCart size={24} />
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

export default function PDVClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OnlineStatusProvider>
            <ToastProvider>
                <CartProvider>
                    <div className="app">
                        {/* Header Global */}
                        <header className="header">
                            <img src="/logo.png" alt="720x" className="logo" />
                            <HeaderCartButton />
                        </header>

                        {/* Offline Banner */}
                        <OfflineBanner />

                        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <PushNotificationPrompt />
                            {children}
                        </main>
                    </div>
                </CartProvider>
            </ToastProvider>
        </OnlineStatusProvider>
    );
}
