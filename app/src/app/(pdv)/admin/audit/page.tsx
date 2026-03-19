'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { getStockDifferencesAction, syncAuditItemAction, AuditItem } from '@/app/actions/audit';
import { useToast } from '@/components/providers/ToastProvider';

function AdminAuditContent() {
    const [discrepancies, setDiscrepancies] = useState<AuditItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadAuditData();
    }, []);

    const loadAuditData = async () => {
        setIsLoading(true);
        const result = await getStockDifferencesAction();
        
        if (result.success && result.data) {
            setDiscrepancies(result.data);
            if (result.data.length === 0) {
                showToast('Tudo certo! Nenhum estoque divergente encontrado.', 'success');
            } else {
                showToast(`Encontradas ${result.data.length} divergências.`, 'error');
            }
        } else {
            showToast(result.error || 'Erro ao carregar auditoria', 'error');
        }
        setIsLoading(false);
    };

    const handleSyncItem = async (variantId: string, correctStock: number) => {
        setSyncingItemId(variantId);
        
        const result = await syncAuditItemAction(variantId, correctStock);
        
        if (result.success) {
            showToast(result.message || 'Item sincronizado com sucesso', 'success');
            // Remove o item já sincronizado da tela
            setDiscrepancies(prev => prev.filter(item => item.variantId !== variantId));
        } else {
            showToast(result.error || 'Erro ao sincronizar item', 'error');
        }
        
        setSyncingItemId(null);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} /> Auditoria Nuvemshop API
                </h3>
                <button 
                    onClick={loadAuditData} 
                    disabled={isLoading}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '8px' }}
                    title="Recarregar Auditoria"
                >
                    <RefreshCw size={24} className={isLoading ? 'spin-animation' : ''} />
                </button>
            </div>

            <div className="modal-body">
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <AlertTriangle color="var(--accent)" size={24} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        <p style={{ margin: '0 0 8px 0' }}>Esta página compara o estoque atual do App com a Nuvemshop em tempo real.</p>
                        <p style={{ margin: 0 }}>Listamos apenas as variantes que possuem divergência.</p>
                    </div>
                </div>

                <div className="form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <label className="form-label" style={{ margin: 0 }}>
                            Divergências ({discrepancies.length})
                        </label>
                    </div>
                    
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                            <RefreshCw size={32} className="spin-animation" style={{ marginBottom: '16px', color: 'var(--accent)' }} />
                            <p>Consultando base inteira e comparando...</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Isso pode levar de 5 a 15 segundos.</p>
                        </div>
                    ) : discrepancies.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--success)' }}>
                            <CheckCircle size={48} style={{ marginBottom: '16px' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nenhuma divergência encontrada!</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                                Todo o seu catálogo local bate 100% com o da Nuvemshop.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {discrepancies.map(item => (
                                <div key={item.variantId} style={{ 
                                    background: 'var(--surface)', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: 'var(--radius)', 
                                    padding: '16px' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', paddingRight: '16px' }}>
                                            {item.name}
                                        </h4>
                                        <button 
                                            onClick={() => handleSyncItem(item.variantId, item.nuvemshopStock)}
                                            disabled={syncingItemId === item.variantId}
                                            style={{ 
                                                background: 'var(--accent)', 
                                                border: 'none', 
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--button-text)', 
                                                cursor: 'pointer',
                                                padding: '8px 12px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                whiteSpace: 'nowrap'
                                            }}
                                            title="Corrigir Estoque Local"
                                        >
                                            {syncingItemId === item.variantId ? (
                                                <>Sincronizando...</>
                                            ) : (
                                                <>
                                                    <RefreshCw size={14} /> Corrigir App
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gap: '8px', 
                                        fontSize: '0.85rem',
                                        background: 'var(--background)',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-sm)'
                                    }}>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Estoque App</span>
                                            <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '1.2rem' }}>{item.localStock}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Estoque Nuvemshop</span>
                                            <span style={{ fontWeight: 600, color: 'var(--success)', fontSize: '1.2rem' }}>{item.nuvemshopStock}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function AdminAuditPage() {
    return (
        <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>Carregando UI...</div>}>
            <AdminAuditContent />
        </Suspense>
    );
}
