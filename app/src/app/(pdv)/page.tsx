'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signout, getAdminStatus } from '@/app/actions/auth';
import { getReplenishmentDataAction } from '@/app/actions/reports';
import { getPendingSalesCountAction } from '@/app/actions/pendingSales';
import { useCart } from '@/components/providers/CartProvider';
import { ShoppingCart, Package, Inbox, Tag, BarChart2, AlertTriangle, Key, Users, Activity, Clock } from 'lucide-react';

export default function HomeScreen() {
    const [hasCriticalItems, setHasCriticalItems] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const { cartCount } = useCart();

    useEffect(() => {
        async function checkCriticalStock() {
            try {
                const result = await getReplenishmentDataAction();
                if (result.success && result.data) {
                    const criticalCount = result.data.filter((variant: any) => variant.stock <= variant.min_stock).length;
                    setHasCriticalItems(criticalCount > 0);
                }
            } catch (err) {
                console.error("Erro ao verificar estoque crítico na home:", err);
            }
        }
        
        async function loadAdminStatus() {
            try {
                const status = await getAdminStatus();
                setIsAdmin(status);
            } catch (err) {
                console.error("Erro ao verificar status de admin:", err);
            }
        }

        async function loadPendingCount() {
            try {
                const result = await getPendingSalesCountAction();
                if (result.success) {
                    setPendingCount(result.count);
                }
            } catch (err) {
                console.error("Erro ao contar vendas pendentes:", err);
            }
        }

        checkCriticalStock();
        loadAdminStatus();
        loadPendingCount();
    }, []);

    return (
        <div className="home-screen">
            {/* Floating icons - Cart & Pending Sales */}
            <div className="floating-icons">
                <Link href="/cart" className="floating-icon-btn" title="Carrinho">
                    <ShoppingCart size={22} />
                    {cartCount > 0 && (
                        <span className="floating-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                </Link>
                <Link href="/pending-sales" className="floating-icon-btn" title="Vendas Pendentes">
                    <Clock size={22} />
                    {pendingCount > 0 && (
                        <span className="floating-badge">{pendingCount > 99 ? '99+' : pendingCount}</span>
                    )}
                </Link>
            </div>

            <div className="menu-grid">
                {/* Venda */}
                <Link href="/scan?mode=sale" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <ShoppingCart className="menu-card-icon" size={36} />
                        <h2 className="menu-card-title">Venda</h2>
                    </div>
                    <p className="menu-card-subtitle">Registrar venda e dar baixa</p>
                </Link>

                {/* Inventário */}
                <Link href="/stock/inventory" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <Package className="menu-card-icon" size={36} />
                        <h2 className="menu-card-title">Inventário</h2>
                    </div>
                    <p className="menu-card-subtitle">Conferir e ajustar estoque</p>
                </Link>

                {/* Entrada de Estoque */}
                <Link href="/stock/entry" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <Inbox className="menu-card-icon" size={36} />
                        <h2 className="menu-card-title">Entrada</h2>
                    </div>
                    <p className="menu-card-subtitle">Compras e Devoluções</p>
                </Link>

                {/* Produtos */}
                <Link href="/products" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <Tag className="menu-card-icon" size={36} />
                        <h2 className="menu-card-title">Produtos</h2>
                    </div>
                    <p className="menu-card-subtitle">Cadastro e etiquetas</p>
                </Link>

                {/* Relatórios */}
                <Link href="/reports" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <BarChart2 className="menu-card-icon" size={36} />
                        <h2 className="menu-card-title">Relatórios</h2>
                    </div>
                    <p className="menu-card-subtitle">Movimentação/Vendas</p>
                </Link>

                {/* Reposição */}
                <Link href="/reports/replenishment" className="menu-card decoration-none" style={{ borderBottom: hasCriticalItems ? '4px solid #ed6c02' : '1px solid var(--border-color)' }}>
                    <div className="menu-card-row">
                        <AlertTriangle className="menu-card-icon" size={36} color={hasCriticalItems ? "#ed6c02" : "var(--accent)"} />
                        <h2 className="menu-card-title">Reposição</h2>
                    </div>
                    <p className="menu-card-subtitle">Estoque crítico</p>
                </Link>
            </div>

            {/* Alterar Senha ou Admin */}
            {isAdmin ? (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: 'var(--space-lg) auto 0' }}>
                    <Link href="/admin/users" style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--surface)'
                    }}>
                        <Users size={16} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Gestão de Usuários</span>
                    </Link>
                    
                    <Link href="/admin/logs" style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--surface)'
                    }}>
                        <Activity size={16} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Logs do Sistema</span>
                    </Link>
                </div>
            ) : (
                <Link href="/update-password" style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    width: 'fit-content', margin: 'var(--space-lg) auto 0', 
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', textDecoration: 'none'
                }}>
                    <Key size={16} />
                    <span style={{ fontSize: '0.85rem' }}>Alterar Senha</span>
                </Link>
            )}

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
