'use client';

import React from 'react';
import { CartProvider } from '@/components/providers/CartProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

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
                        <div className="header-menu">
                            {/* Menu dropdown logic here if needed */}
                            <button className="menu-dots">⋮</button>
                        </div>
                    </header>

                    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {children}
                    </main>
                </div>
            </CartProvider>
        </ToastProvider>
    );
}
