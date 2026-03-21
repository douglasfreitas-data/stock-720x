'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { signout, getAdminStatus } from '@/app/actions/auth';
import { getReplenishmentDataAction } from '@/app/actions/reports';
import { ShoppingCart, Package, Inbox, Tag, BarChart2, AlertTriangle, Key, Users, Activity, MoreVertical, BookOpen } from 'lucide-react';

export default function HomeScreen() {
    const [hasCriticalItems, setHasCriticalItems] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // ... (resto do useEffect mantém igual)
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

        checkCriticalStock();
        loadAdminStatus();
    }, []);

    // Fechar menu ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="home-screen" style={{ position: 'relative' }}>
            
            {/* Top-left Menu */}
            <div ref={menuRef} style={{ position: 'absolute', top: '-110px', left: '0px', zIndex: 100 }}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px' }}
                >
                    <MoreVertical size={28} />
                </button>
                {isMenuOpen && (
                    <div className="menu-dropdown" style={{ left: 0, right: 'auto', top: '100%' }}>
                        <Link href="/guide" className="menu-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <BookOpen size={16} /> Guia de Uso
                        </Link>
                        {!isAdmin && (
                            <Link href="/update-password" className="menu-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <Key size={16} /> Alterar Senha
                            </Link>
                        )}
                    </div>
                )}
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

            {/* Admin Dashboard */}
            {isAdmin && (
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
                    
                    <Link href="/admin/audit" style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--surface)'
                    }}>
                        <AlertTriangle size={16} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Auditoria API</span>
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
