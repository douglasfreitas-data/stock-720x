'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getStockSessionsAction } from '@/app/actions/reports';
import jsPDF from 'jspdf';
import { ArrowLeft, BarChart2, FileDown, ArrowDownToLine, ArrowUpFromLine, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';

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
    user_email?: string | null;
    stock_movements: StockMovement[];
}

// ── Labels ──
const OPERATION_LABELS: Record<string, string> = {
    venda: 'Venda (App)',
    venda_online: 'Venda (Loja Online)',
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
    reserva: 'Reserva',
    estorno_reserva: 'Estorno Reserva',
    sync_auto: '🔄 Sync Nuvemshop',
    outro: 'Outro',
};

// ── Helpers ──
function getProductName(m: StockMovement): string {
    return m.product_variants?.products?.name?.pt || 'Produto s/ Nome';
}

function getProductPrice(m: StockMovement): number {
    return m.product_variants?.price || 0;
}

function shortUser(email: string | null | undefined): string {
    if (!email) return 'Sistema';
    const atIndex = email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : email;
}

function getDateKey(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function extractClient(session: { notes: string | null; operation?: string }): string {
    if (session.operation === 'venda_online') return 'Site';
    if (!session.notes) return '';
    const match = session.notes.match(/Cliente:\s*([^|]+)/i);
    return match ? match[1].trim() : '';
}

// ── Movement Row (no SKU, user before @) ──
function MovementRow({ mov, session, activeTab }: { mov: StockMovement, session: StockSession, activeTab: string }) {
    const [expanded, setExpanded] = useState(false);

    const dateStr = new Date(session.created_at).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const client = extractClient(session);
    const price = getProductPrice(mov);

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
        }}>
            <div 
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '8px'
                }}
            >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-muted)', 
                        whiteSpace: 'nowrap',
                        background: 'var(--bg-secondary)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600
                    }}>
                        {dateStr}
                    </div>
                    <div style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 500, 
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {getProductName(mov)}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        fontFamily: 'monospace',
                        color: activeTab === 'entrada' ? 'var(--success)' : 'var(--danger)',
                    }}>
                        {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                    </div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>
            </div>

            {expanded && (
                <div style={{
                    padding: '12px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><strong style={{color: 'var(--text-primary)'}}>Operação:</strong> {OPERATION_LABELS[session.operation] || session.operation}</div>
                        {activeTab !== 'entrada' && (
                            <div><strong style={{color: 'var(--text-primary)'}}>Valor:</strong> R$ {price.toFixed(2).replace('.', ',')}</div>
                        )}
                        <div><strong style={{color: 'var(--text-primary)'}}>Saldo:</strong> {mov.new_stock}</div>
                        <div><strong style={{color: 'var(--text-primary)'}}>Usuário:</strong> {shortUser(session.user_email)}</div>
                    </div>
                    {client && (
                        <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                            <strong style={{color: 'var(--text-primary)'}}>{activeTab === 'entrada' ? 'Fornecedor' : 'Cliente'}:</strong> {client}
                        </div>
                    )}
                    {session.notes && (
                        <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                            <strong style={{color: 'var(--text-primary)'}}>Obs:</strong> <span style={{ fontStyle: 'italic' }}>{session.notes}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Autocomplete Dropdown ──
function AutocompleteInput({ value, onChange, suggestions, placeholder, style }: {
    value: string;
    onChange: (val: string) => void;
    suggestions: string[];
    placeholder: string;
    style?: React.CSSProperties;
}) {
    const [open, setOpen] = useState(false);
    const filtered = value.trim()
        ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
        : [];

    return (
        <div style={{ position: 'relative', ...style }}>
            <input
                type="text"
                value={value}
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder={placeholder}
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
            {open && filtered.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                    zIndex: 50,
                    maxHeight: '150px',
                    overflowY: 'auto',
                }}>
                    {filtered.map((s, i) => (
                        <div key={i}
                            onMouseDown={() => { onChange(s); setOpen(false); }}
                            style={{
                                padding: '8px 10px',
                                fontSize: '0.85rem',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none',
                            }}
                        >{s}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Day Separator ──
function DaySeparator({ dateLabel }: { dateLabel: string }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 0',
        }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {dateLabel}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>
    );
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
    const [clientSearch, setClientSearch] = useState('');

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

    // ── Client-side filters (product + client + vendedor) ──
    const filteredSessions = useMemo(() => {
        let result = sessions;
        if (productSearch.trim()) {
            const q = productSearch.toLowerCase();
            result = result.filter(s =>
                s.stock_movements?.some(m =>
                    getProductName(m).toLowerCase().includes(q)
                )
            );
        }
        if (clientSearch.trim()) {
            const q = clientSearch.toLowerCase();
            
            if (activeTab === 'entrada') {
                result = result.filter(s => s.operation === 'compra');
            }

            if (q !== 'todos') {
                result = result.filter(s => {
                    const client = extractClient(s);
                    return client.toLowerCase().includes(q);
                });
            }
        }
        return result;
    }, [sessions, productSearch, clientSearch, activeTab]);

    // ── Unique values for autocomplete ──
    const uniqueProducts = useMemo(() => {
        const names = new Set<string>();
        sessions.forEach(s => s.stock_movements?.forEach(m => {
            const n = getProductName(m);
            if (n !== 'Produto s/ Nome') names.add(n);
        }));
        return Array.from(names).sort();
    }, [sessions]);

    const uniqueClients = useMemo(() => {
        const clients = new Set<string>();
        sessions.forEach(s => {
            const c = extractClient(s);
            if (c) clients.add(c);
        });
        return ['Todos', ...Array.from(clients).sort()];
    }, [sessions]);



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
        setClientSearch('');
    };

    // ── Group by day or client for rendering ──
    const isGroupedByClient = clientSearch.trim() !== '';

    const renderGroups = useMemo(() => {
        if (!isGroupedByClient) {
            const groups: { label: string; isClient: boolean; items: { session: StockSession; mov: StockMovement }[] }[] = [];
            let currentDate = '';
            filteredSessions.forEach(session => {
                (session.stock_movements || []).forEach(mov => {
                    const dayKey = getDateKey(session.created_at);
                    if (dayKey !== currentDate) {
                        currentDate = dayKey;
                        groups.push({ label: dayKey, isClient: false, items: [] });
                    }
                    groups[groups.length - 1].items.push({ session, mov });
                });
            });
            return groups;
        } else {
            const groupsMap = new Map<string, { session: StockSession; mov: StockMovement }[]>();
            filteredSessions.forEach(session => {
                (session.stock_movements || []).forEach(mov => {
                    const cli = extractClient(session) || (activeTab === 'entrada' ? 'Sem Fornecedor' : 'Sem Cliente');
                    if (!groupsMap.has(cli)) groupsMap.set(cli, []);
                    groupsMap.get(cli)!.push({ session, mov });
                });
            });
            const groups: { label: string; isClient: boolean; items: { session: StockSession; mov: StockMovement }[] }[] = [];
            Array.from(groupsMap.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .forEach(([cli, items]) => {
                    groups.push({ label: cli, isClient: true, items });
                });
            return groups;
        }
    }, [filteredSessions, isGroupedByClient]);

    // ── Export PDF ──
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const title = activeTab === 'entrada' ? 'Relatório de Entradas' : 'Relatório de Saídas';

        doc.setFontSize(16);
        doc.text(`${title} — Stock 720x`, 14, 18);
        doc.setFontSize(9);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 25);

        let y = 34;
        let currentPdfDay = '';

        // Group by client in PDF if 'Todos' is explicitly selected
        // We already have isGroupedByClient from above

        // Table header function
        const drawHeader = (grouped: boolean) => {
            const clientLabel = activeTab === 'entrada' ? 'Fornecedor' : 'Cliente';

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            if (grouped) {
                doc.text('Data', 14, y);
                doc.text('Operação', 55, y);
                doc.text('Produto', 100, y);
                doc.text('Qtd', 195, y);
                if (activeTab !== 'entrada') doc.text('Valor', 212, y);
                doc.text('Saldo', 235, y);
                doc.text('Usuário', 255, y);
            } else {
                doc.text('Data', 14, y);
                doc.text(clientLabel, 35, y);
                doc.text('Operação', 75, y);
                doc.text('Produto', 110, y);
                doc.text('Qtd', 195, y);
                if (activeTab !== 'entrada') doc.text('Valor', 212, y);
                doc.text('Saldo', 235, y);
                doc.text('Usuário', 255, y);
            }
            y += 6;
            doc.setFont('helvetica', 'normal');
        };
        
        let grandTotalUnits = 0;
        let grandTotalValue = 0;
        let grandTotalMovements = 0;

        renderGroups.forEach((group) => {
            let groupTotalUnits = 0;
            let groupTotalValue = 0;

            const groupPrefix = group.isClient ? (activeTab === 'entrada' ? 'Fornecedor' : 'Cliente') : 'Data';
            
            if (y > 170) { doc.addPage(); y = 20; }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${groupPrefix}: ${group.label}`, 14, y);
            y += 6;

            drawHeader(group.isClient);

            group.items.forEach(({ session: s, mov: m }) => {
                if (y > 185) { doc.addPage(); y = 20; drawHeader(group.isClient); }
                
                const date = new Date(s.created_at).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                });
                const price = getProductPrice(m);
                const qty = Math.abs(m.quantity);
                
                if (group.isClient) {
                    doc.text(date, 14, y);
                    doc.text((OPERATION_LABELS[s.operation] || s.operation).substring(0, 22), 55, y);
                    doc.text(getProductName(m).substring(0, 42), 100, y);
                    doc.text(String(m.quantity), 195, y);
                    if (activeTab !== 'entrada') doc.text(`R$ ${price.toFixed(2)}`, 212, y);
                    doc.text(String(m.new_stock), 235, y);
                    doc.text(shortUser(s.user_email).substring(0, 20), 255, y);
                } else {
                    doc.text(date, 14, y);
                    doc.text(extractClient(s).substring(0, 25) || '-', 35, y);
                    doc.text((OPERATION_LABELS[s.operation] || s.operation).substring(0, 20), 75, y);
                    doc.text(getProductName(m).substring(0, 35), 110, y);
                    doc.text(String(m.quantity), 195, y);
                    if (activeTab !== 'entrada') doc.text(`R$ ${price.toFixed(2)}`, 212, y);
                    doc.text(String(m.new_stock), 235, y);
                    doc.text(shortUser(s.user_email).substring(0, 20), 255, y);
                }
                
                groupTotalUnits += qty;
                groupTotalValue += (price * qty);
                grandTotalUnits += qty;
                grandTotalValue += (price * qty);
                grandTotalMovements++;
                y += 5;
            });

            // Total line for this group
            y += 2;
            doc.setDrawColor(100, 100, 100);
            doc.line(14, y, 285, y);
            y += 5;
            doc.setFont('helvetica', 'bold');
            let totalStr = `Total ${group.label}: ${group.items.length} movimentações | ${groupTotalUnits} un`;
            if (activeTab !== 'entrada') totalStr += ` | Valor Total: R$ ${groupTotalValue.toFixed(2)}`;
            doc.text(totalStr, 14, y);
            doc.setFont('helvetica', 'normal');
            y += 10;
        });

        // Grand Total
        y += 2;
        doc.setDrawColor(0, 0, 0);
        doc.line(14, y, 285, y);
        y += 5;
        doc.setFont('helvetica', 'bold');
        let grandTotalStr = `Total Geral: ${grandTotalMovements} movimentações | ${grandTotalUnits} un`;
        if (activeTab !== 'entrada') grandTotalStr += ` | Valor Total: R$ ${grandTotalValue.toFixed(2)}`;
        doc.text(grandTotalStr, 14, y);

        doc.save(`relatorio_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const inputStyle: React.CSSProperties = {
        padding: '8px 10px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        outline: 'none',
    };

    return (
        <div className="modal-overlay">
            {/* ── Header ── */}
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={20} /> Relatórios</h3>
                <div style={{ paddingRight: '0px' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileDown size={14} /> PDF</div>
                    </button>
                </div>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>

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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ArrowDownToLine size={16} /> Entradas</div>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ArrowUpFromLine size={16} /> Saídas</div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {showFilters ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {showFilters ? 'Ocultar Filtros' : 'Filtros & Busca'}
                    {(dateFrom || dateTo || operation || productSearch || clientSearch) && (
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
                </div>
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
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Até</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                        </div>
                    </div>

                    {/* Operation filter */}
                    <select value={operation} onChange={e => setOperation(e.target.value)} style={inputStyle}>
                        <option value="">Todas as Operações</option>
                        {uniqueOps.map(op => (
                            <option key={op} value={op}>{OPERATION_LABELS[op] || op}</option>
                        ))}
                    </select>



                    {/* Product search with autocomplete */}
                    <AutocompleteInput
                        value={productSearch}
                        onChange={setProductSearch}
                        suggestions={uniqueProducts}
                        placeholder="Buscar por produto..."
                    />

                    {/* Client search with autocomplete */}
                    <AutocompleteInput
                        value={clientSearch}
                        onChange={setClientSearch}
                        suggestions={uniqueClients}
                        placeholder={activeTab === 'entrada' ? 'Buscar por fornecedor...' : 'Buscar por cliente...'}
                    />

                    {/* Clear */}
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
                            {activeTab === 'entrada' ? <ArrowDownToLine size={48} /> : <ArrowUpFromLine size={48} />}
                        </div>
                        <div style={{ fontSize: '0.95rem' }}>
                            Nenhuma {activeTab === 'entrada' ? 'entrada' : 'saída'} encontrada
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: 8, color: 'var(--text-muted)' }}>
                            Tente alterar os filtros ou período
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {renderGroups.map((group, gi) => {
                            let groupTotalQty = 0;
                            let groupTotalValue = 0;
                            group.items.forEach(i => {
                                const qty = Math.abs(i.mov.quantity);
                                groupTotalQty += qty;
                                groupTotalValue += getProductPrice(i.mov) * qty;
                            });

                            return (
                                <React.Fragment key={gi}>
                                    {group.isClient && gi > 0 && <div style={{ height: 12 }} />}
                                    <DaySeparator dateLabel={group.isClient ? `${activeTab === 'entrada' ? 'Fornecedor' : 'Cliente'}: ${group.label}` : group.label} />
                                    {group.items.map(({ session, mov }, mi) => (
                                        <MovementRow 
                                            key={`${mov.id}-${mi}`} 
                                            mov={mov} 
                                            session={session} 
                                            activeTab={activeTab} 
                                        />
                                    ))}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '12px 14px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        marginTop: '4px',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        color: 'var(--text-primary)'
                                    }}>
                                        <div>Total {group.isClient ? group.label : "do dia"}</div>
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <span>{groupTotalQty} un</span>
                                            {activeTab !== 'entrada' && (
                                                <span style={{ color: 'var(--danger)' }}>
                                                    R$ {groupTotalValue.toFixed(2).replace('.', ',')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
