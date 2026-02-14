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
            <Link href="/stock/inventory" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">📦</span>
                    <h2 className="menu-card-title">Inventário</h2>
                </div>
                <p className="menu-card-subtitle">Conferir e ajustar estoque</p>
            </Link>

            {/* Entrada de Estoque */}
            <Link href="/stock/entry" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">📥</span>
                    <h2 className="menu-card-title">Entrada</h2>
                </div>
                <p className="menu-card-subtitle">Compra, Devolução e Ajuste</p>
            </Link>

            {/* Produtos */}
            <Link href="/products" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">🏷️</span>
                    <h2 className="menu-card-title">Produtos</h2>
                </div>
                <p className="menu-card-subtitle">Cadastro e etiquetas QR</p>
            </Link>

            {/* Relatórios */}
            <Link href="/reports" className="menu-card decoration-none">
                <div className="menu-card-row">
                    <span className="menu-card-icon">📊</span>
                    <h2 className="menu-card-title">Relatórios</h2>
                </div>
                <p className="menu-card-subtitle">Movimentação e Vendas</p>
            </Link>

            {/* Financeiro (Broken/Future) */}
            <div className="menu-card decoration-none opacity-40">
                <div className="menu-card-row">
                    <span className="menu-card-icon">💰</span>
                    <h2 className="menu-card-title">Financeiro</h2>
                </div>
                <p className="menu-card-subtitle">Em breve...</p>
            </div>


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
