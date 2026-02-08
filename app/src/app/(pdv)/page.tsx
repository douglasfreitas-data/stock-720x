'use client';

import React from 'react';
import Link from 'next/link';
import { useToast } from '@/components/providers/ToastProvider';

export default function HomeScreen() {
    const { showToast } = useToast();

    return (
        <div className="home-screen">
            {/* Venda */}
            <Link href="/scan?mode=sale" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">🛒</span>
                    <h2 className="menu-card-title">Venda</h2>
                </div>
                <p className="menu-card-subtitle">Registrar venda e baixar estoque</p>
            </Link>

            {/* Inventário */}
            <Link href="/scan?mode=inventory" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">📦</span>
                    <h2 className="menu-card-title">Inventário</h2>
                </div>
                <p className="menu-card-subtitle">Conferir e ajustar estoque</p>
            </Link>

            {/* Produtos */}
            <Link href="/products" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">🏷️</span>
                    <h2 className="menu-card-title">Produtos</h2>
                </div>
                <p className="menu-card-subtitle">Cadastro e etiquetas QR</p>
            </Link>

            {/* Financeiro */}
            <Link href="/finance" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">💰</span>
                    <h2 className="menu-card-title">Financeiro</h2>
                </div>
                <p className="menu-card-subtitle">Controle de pagamentos</p>
            </Link>

            {/* Link Sair (mock) */}
            <button
                className="exit-link"
                onClick={() => showToast('Funcionalidade de logout em breve', 'info')}
            >
                <span className="exit-text">Sair</span>
                <span className="exit-arrow">→</span>
            </button>
        </div>
    );
}
