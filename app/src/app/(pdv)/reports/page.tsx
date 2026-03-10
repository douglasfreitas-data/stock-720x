'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getStockSessionsAction } from '@/app/actions/reports';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
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
        products?: { name?: string };
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

// ── Filters UI state ──
interface Filters {
    dateFrom: string;
    dateTo: string;
    type: string;
    operation: string;
    productSearch: string;
}

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

const PIE_COLORS = ['#ff5500', '#ff8c42', '#ffba7a', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#eab308', '#6b7280'];

export default function ReportsPage() {
    const [sessions, setSessions] = useState<StockSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCharts, setShowCharts] = useState(true);
    const [filters, setFilters] = useState<Filters>({
        dateFrom: '',
        dateTo: '',
        type: '',
        operation: '',
        productSearch: '',
    });

    const loadData = useCallback(async (f?: Filters) => {
        setIsLoading(true);
        const result = await getStockSessionsAction({
            dateFrom: f?.dateFrom || undefined,
            dateTo: f?.dateTo || undefined,
            type: f?.type || undefined,
            operation: f?.operation || undefined,
        });
        if (result.success && result.data) {
            setSessions(result.data as StockSession[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Client-side product name filter ──
    const filteredSessions = useMemo(() => {
        if (!filters.productSearch.trim()) return sessions;
        const q = filters.productSearch.toLowerCase();
        return sessions.filter(s =>
            s.stock_movements?.some(m =>
                (m.product_variants?.products?.name || '').toLowerCase().includes(q) ||
                (m.product_variants?.sku || '').toLowerCase().includes(q)
            )
        );
    }, [sessions, filters.productSearch]);

    // ── Chart Data ──
    const barData = useMemo(() => {
        const byDay: Record<string, { date: string; entrada: number; saida: number }> = {};
        filteredSessions.forEach(s => {
            const day = new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!byDay[day]) byDay[day] = { date: day, entrada: 0, saida: 0 };
            const totalQty = s.stock_movements?.reduce((a, m) => a + Math.abs(m.quantity), 0) || 0;
            if (s.type === 'entrada') byDay[day].entrada += totalQty;
            else byDay[day].saida += totalQty;
        });
        return Object.values(byDay).reverse();
    }, [filteredSessions]);

    const pieData = useMemo(() => {
        const byOp: Record<string, number> = {};
        filteredSessions.forEach(s => {
            const label = OPERATION_LABELS[s.operation] || s.operation;
            byOp[label] = (byOp[label] || 0) + 1;
        });
        return Object.entries(byOp).map(([name, value]) => ({ name, value }));
    }, [filteredSessions]);

    // ── Helpers ──
    const getTypeColor = (type: string) => {
        if (type === 'entrada') return 'text-green-400 bg-green-900/30';
        if (type === 'saida') return 'text-red-400 bg-red-900/30';
        return 'text-gray-400 bg-gray-900/30';
    };

    const handleFilter = () => loadData(filters);

    const handleClearFilters = () => {
        const empty: Filters = { dateFrom: '', dateTo: '', type: '', operation: '', productSearch: '' };
        setFilters(empty);
        loadData(empty);
    };

    // ── Export CSV ──
    const exportCSV = () => {
        const rows: string[] = ['Data,Tipo,Operação,Produto,SKU,Quantidade,Estoque Anterior,Estoque Novo,Obs'];
        filteredSessions.forEach(s => {
            s.stock_movements?.forEach(m => {
                const name = (m.product_variants?.products?.name || 'N/A').replace(/,/g, ';');
                const date = new Date(s.created_at).toLocaleString('pt-BR');
                rows.push(`${date},${s.type},${OPERATION_LABELS[s.operation] || s.operation},${name},${m.product_variants?.sku || ''},${m.quantity},${m.old_stock},${m.new_stock},"${(s.notes || '').replace(/"/g, "'")}"`);
            });
        });
        const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_estoque_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Export PDF ──
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Relatório de Estoque — Stock 720x', 14, 18);
        doc.setFontSize(9);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 25);

        let y = 35;
        // Table header
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Data', 14, y);
        doc.text('Tipo', 54, y);
        doc.text('Operação', 74, y);
        doc.text('Produto', 110, y);
        doc.text('SKU', 190, y);
        doc.text('Qtd', 220, y);
        doc.text('Antes', 238, y);
        doc.text('Depois', 258, y);
        y += 6;
        doc.setFont('helvetica', 'normal');

        filteredSessions.forEach(s => {
            s.stock_movements?.forEach(m => {
                if (y > 190) { doc.addPage(); y = 20; }
                const date = new Date(s.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                doc.text(date, 14, y);
                doc.text(s.type, 54, y);
                doc.text(OPERATION_LABELS[s.operation] || s.operation, 74, y);
                doc.text((m.product_variants?.products?.name || 'N/A').substring(0, 40), 110, y);
                doc.text(m.product_variants?.sku || '-', 190, y);
                doc.text(String(m.quantity), 220, y);
                doc.text(String(m.old_stock), 238, y);
                doc.text(String(m.new_stock), 258, y);
                y += 5;
            });
        });

        doc.save(`relatorio_estoque_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // ── Unique operations for filter select ──
    const uniqueOps = useMemo(() => {
        const ops = new Set(sessions.map(s => s.operation));
        return Array.from(ops);
    }, [sessions]);

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Header */}
            <header className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-2xl">←</Link>
                    <h1 className="text-lg font-bold">📊 Relatórios</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="px-3 py-1.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] text-xs hover:border-[var(--accent)] transition-colors" title="Exportar CSV">
                        📥 CSV
                    </button>
                    <button onClick={exportPDF} className="px-3 py-1.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] text-xs hover:border-[var(--accent)] transition-colors" title="Exportar PDF">
                        📄 PDF
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">De</label>
                        <input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
                    </div>
                    <div>
                        <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">Até</label>
                        <input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
                        className="px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                        <option value="">Todos os Tipos</option>
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                    </select>
                    <select value={filters.operation} onChange={e => setFilters(p => ({ ...p, operation: e.target.value }))}
                        className="px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                        <option value="">Todas Operações</option>
                        {uniqueOps.map(op => (
                            <option key={op} value={op}>{OPERATION_LABELS[op] || op}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <input type="text" value={filters.productSearch} onChange={e => setFilters(p => ({ ...p, productSearch: e.target.value }))}
                        placeholder="🔍 Buscar por produto ou SKU..."
                        className="flex-1 px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
                    <button onClick={handleFilter}
                        className="px-4 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors">
                        Filtrar
                    </button>
                    <button onClick={handleClearFilters}
                        className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        ✕
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)] mb-4"></div>
                        <div className="opacity-50 text-sm">Carregando movimentações...</div>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="text-center py-20 opacity-50">Nenhuma movimentação encontrada.</div>
                ) : (
                    <>
                        {/* Summary stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)] text-center">
                                <div className="text-[10px] text-[var(--text-muted)]">Movimentações</div>
                                <div className="text-xl font-bold text-[var(--accent)]">{filteredSessions.length}</div>
                            </div>
                            <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)] text-center">
                                <div className="text-[10px] text-[var(--text-muted)]">Entradas</div>
                                <div className="text-xl font-bold text-green-400">{filteredSessions.filter(s => s.type === 'entrada').length}</div>
                            </div>
                            <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-color)] text-center">
                                <div className="text-[10px] text-[var(--text-muted)]">Saídas</div>
                                <div className="text-xl font-bold text-red-400">{filteredSessions.filter(s => s.type === 'saida').length}</div>
                            </div>
                        </div>

                        {/* Charts Toggle */}
                        <button onClick={() => setShowCharts(p => !p)}
                            className="w-full mb-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors">
                            {showCharts ? '▼ Ocultar Gráficos' : '▶ Mostrar Gráficos'}
                        </button>

                        {showCharts && (
                            <div className="space-y-4 mb-6">
                                {/* Bar Chart */}
                                {barData.length > 0 && (
                                    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] p-3">
                                        <h3 className="text-xs font-semibold mb-3 text-[var(--text-secondary)]">📊 Movimentações por Dia</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={barData} barGap={2}>
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} width={30} />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                                                    labelStyle={{ color: '#fff' }}
                                                />
                                                <Bar dataKey="entrada" name="Entrada" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="saida" name="Saída" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Pie Chart */}
                                {pieData.length > 0 && (
                                    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] p-3">
                                        <h3 className="text-xs font-semibold mb-3 text-[var(--text-secondary)]">🥧 Por Tipo de Operação</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3} label={(props) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                                                    {pieData.map((_, idx) => (
                                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                                <Legend wrapperStyle={{ fontSize: 10 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Session List */}
                        <h3 className="text-xs font-semibold mb-3 text-[var(--text-secondary)]">📋 Detalhamento ({filteredSessions.length} sessões)</h3>
                        <div className="space-y-3">
                            {filteredSessions.map((session) => (
                                <div key={session.id} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] overflow-hidden">
                                    {/* Session Header */}
                                    <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTypeColor(session.type)}`}>
                                                    {session.type}
                                                </span>
                                                <span className="font-bold text-sm">
                                                    {OPERATION_LABELS[session.operation] || session.operation}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-[var(--text-muted)]">
                                                {new Date(session.created_at).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-[var(--text-muted)] font-mono">ID: {session.id.slice(0, 8)}</div>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="p-2">
                                        {session.stock_movements?.map((mov) => (
                                            <div key={mov.id} className="flex justify-between items-center py-2 px-1 border-b border-[var(--border-color)] last:border-0">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="text-xs font-medium truncate">
                                                        {mov.product_variants?.products?.name || 'Produto s/ Nome'}
                                                    </div>
                                                    <div className="text-[10px] text-[var(--text-muted)]">
                                                        SKU: {mov.product_variants?.sku || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-bold text-sm ${mov.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                                                    </div>
                                                    <div className="text-[10px] text-[var(--text-muted)]">
                                                        {mov.old_stock} → {mov.new_stock}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Notes */}
                                    {session.notes && (
                                        <div className="p-2 bg-[var(--bg-primary)]/50 italic text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color)]">
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
