'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CartProvider, useCart } from '@/components/providers/CartProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { OnlineStatusProvider } from '@/components/providers/OnlineStatusProvider';
import OfflineBanner from '@/components/OfflineBanner';
import PushNotificationPrompt from '@/components/PushNotificationPrompt';
import { getPendingSalesCountAction } from '@/app/actions/pendingSales';

import { ShoppingCart, Clock } from 'lucide-react';

const badgeStyle: React.CSSProperties = {
    position: 'absolute', top: '-6px', right: '-10px',
    background: 'var(--accent)', color: 'white',
    borderRadius: '50%', width: '18px', height: '18px',
    fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold'
};

const iconLinkStyle: React.CSSProperties = {
    position: 'relative', display: 'flex', alignItems: 'center',
    color: 'white', textDecoration: 'none'
};

function HeaderCartButton() {
    const { cartCount } = useCart();
    return (
        <Link href="/cart" style={iconLinkStyle} title="Carrinho">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
                <span style={badgeStyle}>
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}
        </Link>
    );
}

function HeaderPendingButton() {
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        async function loadCount() {
            try {
                const result = await getPendingSalesCountAction();
                if (result.success) {
                    setPendingCount(result.count);
                }
            } catch (err) {
                console.error("Erro ao contar vendas pendentes:", err);
            }
        }
        loadCount();
    }, []);

    return (
        <Link href="/pending-sales" style={iconLinkStyle} title="Vendas Pendentes">
            <Clock size={24} />
            {pendingCount > 0 && (
                <span style={badgeStyle}>
                    {pendingCount > 99 ? '99+' : pendingCount}
                </span>
            )}
        </Link>
    );
}

function HeaderIcons() {
    return (
        <div className="header-menu" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <HeaderCartButton />
            <HeaderPendingButton />
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
                            <HeaderIcons />
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
