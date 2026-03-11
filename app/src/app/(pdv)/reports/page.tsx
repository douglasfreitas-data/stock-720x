'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getStockSessionsAction } from '@/app/actions/reports';
import jsPDF from 'jspdf';

// ── Types ──
interface StockMovement {
    id: string;
    quantity: number;
    old_stock: number;
    new_stock: number;
    variant_id: number;
    product_variants?: {
        sku?: string;
        barcode?: string;
        price?: number;
        products?: { name?: { pt?: string; [key: string]: string | undefined } };
    };
}
interface StockSession {
    id: string;
    created_at: string;
    type: string;
    operation: string;
    status: string;
    notes: string | null;
    stock_movements: StockMovement[];
}

// ── Labels ──
const OPERATION_LABELS: Record<string, string> = {
    venda: 'Venda',
    compra: 'Compra',
    devolucao: 'Devolução',
    consumo: 'Uso Interno',
    doacao: 'Doação',
    pregao: 'Saída Pregão',
    contagem: 'Balanço/Ajuste',
    perda: 'Sobra/Perda',
    roubo: 'Extravio',
    quebra: 'Quebra',
    vencido: 'Prazo Vencido',
    ajuste: 'Ajuste',
    outro: 'Outro',
};

// ── Helpers ──
function getProductName(m: StockMovement): string {
    return m.product_variants?.products?.name?.pt || 'Produto s/ Nome';
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

function formatDateShort(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit',
    });
}

export default function ReportsPage() {
    const [sessions, setSessions] = useState<StockSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'entrada' | 'saida'>('saida');
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [operation, setOperation] = useState('');
    const [productSearch, setProductSearch] = useState('');

    // ── Data Loading ──
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const result = await getStockSessionsAction({
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            type: activeTab,
            operation: operation || undefined,
        });
        if (result.success && result.data) {
            setSessions(result.data as StockSession[]);
        }
        setIsLoading(false);
    }, [activeTab, dateFrom, dateTo, operation]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Client-side product filter ──
    const filteredSessions = useMemo(() => {
        if (!productSearch.trim()) return sessions;
        const q = productSearch.toLowerCase();
        return sessions.filter(s =>
            s.stock_movements?.some(m =>
                getProductName(m).toLowerCase().includes(q) ||
                (m.product_variants?.sku || '').toLowerCase().includes(q)
            )
        );
    }, [sessions, productSearch]);

    // ── Stats ──
    const totalMovements = filteredSessions.length;
    const totalUnits = useMemo(() => {
        return filteredSessions.reduce((acc, s) => {
            return acc + (s.stock_movements?.reduce((a, m) => a + Math.abs(m.quantity), 0) || 0);
        }, 0);
    }, [filteredSessions]);

    // ── Unique operations for filter ──
    const uniqueOps = useMemo(() => {
        const ops = new Set(sessions.map(s => s.operation));
        return Array.from(ops);
    }, [sessions]);

    // ── Clear filters ──
    const handleClearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setOperation('');
        setProductSearch('');
    };

    // ── Export PDF ──
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const title = activeTab === 'entrada' ? 'Relatório de Entradas' : 'Relatório de Saídas';

        doc.setFontSize(16);
        doc.text(`${title} — Stock 720x`, 14, 18);
        doc.setFontSize(9);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 25);
        doc.text(`Total: ${filteredSessions.length} movimentações | ${totalUnits} unidades`, 14, 31);

        let y = 40;
        // Table header
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Data', 14, y);
        doc.text('Operação', 60, y);
        doc.text('Produto', 100, y);
        doc.text('SKU', 195, y);
        doc.text('Qtd', 225, y);
        doc.text('Antes', 242, y);
        doc.text('Depois', 260, y);
        y += 6;
        doc.setFont('helvetica', 'normal');

        filteredSessions.forEach(s => {
            s.stock_movements?.forEach(m => {
                if (y > 190) { doc.addPage(); y = 20; }
                const date = new Date(s.created_at).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                });
                doc.text(date, 14, y);
                doc.text(OPERATION_LABELS[s.operation] || s.operation, 60, y);
                doc.text(getProductName(m).substring(0, 45), 100, y);
                doc.text(m.product_variants?.sku || '-', 195, y);
                doc.text(String(m.quantity), 225, y);
                doc.text(String(m.old_stock), 242, y);
                doc.text(String(m.new_stock), 260, y);
                y += 5;
            });
        });

        doc.save(`relatorio_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
        }}>
            {/* ── Header ── */}
            <header style={{
                padding: 'var(--space-md)',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📊 Relatórios</h1>
                </div>
                <button
                    onClick={exportPDF}
                    style={{
                        padding: '6px 14px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                    }}
                >
                    📄 PDF
                </button>
            </header>

            {/* ── Tabs ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: 'var(--space-md)',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <button
                    onClick={() => setActiveTab('entrada')}
                    style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: activeTab === 'entrada'
                            ? '2px solid var(--success)'
                            : '1px solid var(--border-color)',
                        background: activeTab === 'entrada'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'var(--bg-card)',
                        color: activeTab === 'entrada' ? 'var(--success)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                    }}
                >
                    📥 Entradas
                </button>
                <button
                    onClick={() => setActiveTab('saida')}
                    style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: activeTab === 'saida'
                            ? '2px solid var(--danger)'
                            : '1px solid var(--border-color)',
                        background: activeTab === 'saida'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'var(--bg-card)',
                        color: activeTab === 'saida' ? 'var(--danger)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                    }}
                >
                    📤 Saídas
                </button>
            </div>

            {/* ── Filters Toggle ── */}
            <button
                onClick={() => setShowFilters(p => !p)}
                style={{
                    padding: '10px var(--space-md)',
                    background: 'var(--bg-secondary)',
                    border: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                }}
            >
                {showFilters ? '▼ Ocultar Filtros' : '▶ Filtros & Busca'}
                {(dateFrom || dateTo || operation || productSearch) && (
                    <span style={{
                        marginLeft: 8,
                        padding: '2px 8px',
                        background: 'var(--accent-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent)',
                        fontSize: '0.7rem',
                    }}>
                        Ativo
                    </span>
                )}
            </button>

            {/* ── Filters Panel ── */}
            {showFilters && (
                <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}>
                    {/* Date range */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>De</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Até</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* Operation filter */}
                    <select
                        value={operation}
                        onChange={e => setOperation(e.target.value)}
                        style={{
                            padding: '8px 10px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                        }}
                    >
                        <option value="">Todas as Operações</option>
                        {uniqueOps.map(op => (
                            <option key={op} value={op}>{OPERATION_LABELS[op] || op}</option>
                        ))}
                    </select>

                    {/* Product search */}
                    <input
                        type="text"
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        placeholder="🔍 Buscar por produto ou SKU..."
                        style={{
                            padding: '8px 10px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                        }}
                    />

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleClearFilters}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            )}

            {/* ── Content ── */}
            <div style={{ flex: 1, padding: 'var(--space-md)', overflowY: 'auto' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
                        <div style={{
                            width: 32, height: 32,
                            border: '2px solid transparent',
                            borderTop: '2px solid var(--accent)',
                            borderBottom: '2px solid var(--accent)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginBottom: 16,
                        }} />
                        <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>Carregando...</div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: '80px', opacity: 0.5 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
                            {activeTab === 'entrada' ? '📥' : '📤'}
                        </div>
                        <div style={{ fontSize: '0.95rem' }}>
                            Nenhuma {activeTab === 'entrada' ? 'entrada' : 'saída'} encontrada
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: 8, color: 'var(--text-muted)' }}>
                            Tente alterar os filtros ou período
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Summary ── */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            marginBottom: 'var(--space-md)',
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Movimentações</div>
                                <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    color: activeTab === 'entrada' ? 'var(--success)' : 'var(--danger)',
                                }}>{totalMovements}</div>
                            </div>
                            <div style={{
                                width: 1,
                                height: 30,
                                background: 'var(--border-color)',
                            }} />
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Unidades</div>
                                <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    color: activeTab === 'entrada' ? 'var(--success)' : 'var(--danger)',
                                    fontFamily: 'monospace',
                                }}>{totalUnits}</div>
                            </div>
                        </div>

                        {/* ── Session List ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredSessions.map(session => (
                                <div key={session.id} style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden',
                                }}>
                                    {/* Session header */}
                                    <div style={{
                                        padding: '10px 14px',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase' as const,
                                                background: activeTab === 'entrada' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                                color: activeTab === 'entrada' ? 'var(--success)' : 'var(--danger)',
                                            }}>
                                                {OPERATION_LABELS[session.operation] || session.operation}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {formatDate(session.created_at)}
                                        </div>
                                    </div>

                                    {/* Movement items */}
                                    <div style={{ padding: '6px 10px' }}>
                                        {session.stock_movements?.map(mov => (
                                            <div key={mov.id} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '8px 4px',
                                                borderBottom: '1px solid var(--border-color)',
                                            }}>
                                                <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap' as const,
                                                    }}>
                                                        {getProductName(mov)}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                        SKU: {mov.product_variants?.sku || 'N/A'}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{
                                                        fontWeight: 700,
                                                        fontSize: '0.95rem',
                                                        fontFamily: 'monospace',
                                                        color: activeTab === 'entrada' ? 'var(--success)' : 'var(--danger)',
                                                    }}>
                                                        {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-muted)',
                                                        fontFamily: 'monospace',
                                                    }}>
                                                        {mov.old_stock} → {mov.new_stock}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Notes */}
                                    {session.notes && (
                                        <div style={{
                                            padding: '8px 14px',
                                            borderTop: '1px solid var(--border-color)',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            fontStyle: 'italic',
                                        }}>
                                            Obs: {session.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
