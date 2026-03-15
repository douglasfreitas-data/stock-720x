'use client';

import React from 'react';
import Link from 'next/link';
import { signout } from '@/app/actions/auth';
import { ShoppingCart, Package, Inbox, Tag, BarChart2, AlertTriangle, Key } from 'lucide-react';

export default function HomeScreen() {
    return (
        <div className="home-screen">
            <div className="menu-grid">
                {/* Venda */}
                <Link href="/scan?mode=sale" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <ShoppingCart className="menu-card-icon" size={32} />
                        <h2 className="menu-card-title">Venda</h2>
                    </div>
                    <p className="menu-card-subtitle">Registrar venda e dar baixa</p>
                </Link>

                {/* Inventário */}
                <Link href="/stock/inventory" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <Package className="menu-card-icon" size={32} />
                        <h2 className="menu-card-title">Inventário</h2>
                    </div>
                    <p className="menu-card-subtitle">Conferir e ajustar estoque</p>
                </Link>

                {/* Entrada de Estoque */}
                <Link href="/stock/entry" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <Inbox className="menu-card-icon" size={32} />
                        <h2 className="menu-card-title">Entrada</h2>
                    </div>
                    <p className="menu-card-subtitle">Compras e Devoluções</p>
                </Link>

                {/* Produtos */}
                <Link href="/products" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <Tag className="menu-card-icon" size={32} />
                        <h2 className="menu-card-title">Produtos</h2>
                    </div>
                    <p className="menu-card-subtitle">Cadastro e etiquetas</p>
                </Link>

                {/* Relatórios */}
                <Link href="/reports" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <BarChart2 className="menu-card-icon" size={32} />
                        <h2 className="menu-card-title">Relatórios</h2>
                    </div>
                    <p className="menu-card-subtitle">Movimentação/Vendas</p>
                </Link>

                {/* Reposição */}
                <Link href="/reports/replenishment" className="menu-card decoration-none" style={{ borderBottom: '4px solid #ed6c02' }}>
                    <div className="menu-card-row">
                        <AlertTriangle className="menu-card-icon" size={32} color="#ed6c02" />
                        <h2 className="menu-card-title">Reposição</h2>
                    </div>
                    <p className="menu-card-subtitle">Estoque crítico</p>
                </Link>
            </div>

            {/* Alterar Senha */}
            <Link href="/update-password" className="menu-card menu-card-small decoration-none" style={{ background: 'transparent', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                <div className="menu-card-row">
                    <Key className="menu-card-icon" size={24} />
                    <h2 className="menu-card-title">Alterar Senha</h2>
                </div>
                <p className="menu-card-subtitle">Trocar sua senha de acesso</p>
            </Link>

            {/* Sair */}
            <form action={signout}>
                <button
                    type="submit"
                    className="exit-link"
                    style={{ marginTop: '0' }}
                >
                    <span className="exit-text">Sair</span>
                    <span className="exit-arrow">→</span>
                </button>
            </form>
        </div>
    );
}
