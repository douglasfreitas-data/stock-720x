'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStockSessionsAction } from '@/app/actions/reports';
export default function ReportsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const result = await getStockSessionsAction();
            if (result.success && result.data) {
                setSessions(result.data);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const getTypeColor = (type: string) => {
        if (type === 'entrada') return 'text-green-400 bg-green-900/30';
        if (type === 'saida') return 'text-red-400 bg-red-900/30';
        return 'text-gray-400 bg-gray-900/30';
    };

    const getOperationLabel = (op: string) => {
        const labels: Record<string, string> = {
            venda: 'Venda',
            compra: 'Compra',
            devolucao: 'Devolução',
            consumo: 'Uso Interno',
            doacao: 'Doação',
            pregao: 'Saída Pregão',
            contagem: 'Balanço/Ajuste',
            perda: 'Sobra/Perda',
            roubo: 'Extravio'
        };
        return labels[op] || op;
    };

    return (
        <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Header */}
            <header className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-2xl">←</Link>
                    <h1 className="text-lg font-bold">Relatórios de Estoque</h1>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="p-2 bg-[var(--background)] rounded border border-[var(--border)] text-sm"
                >
                    🔄
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center py-20 opacity-50">Carregando movimentações...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 opacity-50">Nenhuma movimentação encontrada.</div>
                ) : (
                    <div className="space-y-6">
                        {sessions.map((session: any) => (
                            <div key={session.id} className="bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden shadow-sm">
                                {/* Session Header */}
                                <div className="p-3 border-b border-[var(--border)] flex justify-between items-start bg-[var(--surface-active)]/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTypeColor(session.type)}`}>
                                                {session.type}
                                            </span>
                                            <span className="font-bold text-sm">
                                                {getOperationLabel(session.operation)}
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
                                    {session.stock_movements?.map((mov: any) => (
                                        <div key={mov.id} className="flex justify-between items-center py-2 px-1 border-b border-[var(--border)] last:border-0">
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

                                {/* Notes if any */}
                                {session.notes && (
                                    <div className="p-2 bg-[var(--background)]/50 italic text-[10px] text-[var(--text-muted)] border-t border-[var(--border)]">
                                        Obs: {session.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Float Action? No, just keep it clean */}
        </div>
    );
}
