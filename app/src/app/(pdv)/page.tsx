'use client';

import React from 'react';
import Link from 'next/link';
import { signout } from '@/app/actions/auth';
import OnboardingTour from '@/components/OnboardingTour';

export default function HomeScreen() {
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

            {/* Alterar Senha */}
            <Link href="/update-password" className="menu-card decoration-none" style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>
                <div className="menu-card-row">
                    <span className="menu-card-icon">🔑</span>
                    <h2 className="menu-card-title">Alterar Senha</h2>
                </div>
                <p className="menu-card-subtitle">Trocar sua senha de acesso</p>
            </Link>

            {/* Ajuda / Tutorial */}
            <button 
                className="menu-card decoration-none" 
                style={{ background: 'var(--surface)', border: '1px solid var(--primary)', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => (window as any).startStock720xTour?.()}
            >
                <div className="menu-card-row">
                    <span className="menu-card-icon">💡</span>
                    <h2 className="menu-card-title">Ajuda / Tutorial</h2>
                </div>
                <p className="menu-card-subtitle">Rever apresentação do sistema</p>
            </button>

            {/* Sair */}
            <form action={signout}>
                <button
                    type="submit"
                    className="exit-link"
                >
                    <span className="exit-text">Sair</span>
                    <span className="exit-arrow">→</span>
                </button>
            </form>
            
            {/* Componente do Tour Interativo */}
            <OnboardingTour />
        </div>
    );
}
