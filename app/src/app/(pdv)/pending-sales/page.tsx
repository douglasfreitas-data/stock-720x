'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, XCircle, Clock, Search } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { useOnlineStatus } from '@/components/providers/OnlineStatusProvider';
import { getPendingSalesAction, completePendingSaleAction, cancelPendingSaleAction } from '@/app/actions/pendingSales';
import { CartItem } from '@/lib/types';

interface PendingSale {
    id: string;
    client_name: string;
    payment_method: string;
    payment_term: string;
    operation_type: string;
    items: CartItem[];
    status: string;
    created_at: string;
}

export default function PendingSalesPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { isOnline } = useOnlineStatus();

    const [sales, setSales] = useState<PendingSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchSales = async () => {
        setLoading(true);
        const res = await getPendingSalesAction();
        if (res.success && res.data) {
            setSales(res.data as PendingSale[]);
        } else {
            showToast('Erro ao buscar vendas pendentes', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleComplete = async (id: string) => {
        if (!isOnline) {
            showToast('Sem conexão.', 'error');
            return;
        }
        if (!confirm('Deseja realmente FINALIZAR esta venda?')) return;

        setActionLoading(id);
        const res = await completePendingSaleAction(id);
        if (res.success) {
            showToast('Venda finalizada com sucesso!', 'success');
            setSales(prev => prev.filter(s => s.id !== id));
        } else {
            showToast(res.message || 'Erro ao finalizar', 'error');
        }
        setActionLoading(null);
    };

    const handleCancel = async (id: string) => {
        if (!isOnline) {
            showToast('Sem conexão.', 'error');
            return;
        }
        if (!confirm('Deseja realmente CANCELAR esta reserva e devolver os itens ao estoque?')) return;

        setActionLoading(id);
        const res = await cancelPendingSaleAction(id);
        if (res.success) {
            showToast('Reserva cancelada e estoque devolvido!', 'success');
            setSales(prev => prev.filter(s => s.id !== id));
        } else {
            showToast(res.message || 'Erro ao cancelar reserva', 'error');
        }
        setActionLoading(null);
    };

    const calculateTotal = (items: CartItem[]) => {
        return items.reduce((acc, item) => {
            const price = item.customPrice !== undefined ? item.customPrice : (item.product?.price || 0);
            return acc + (item.quantity * price);
        }, 0);
    };

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-header">
                    <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                    <h3 className="modal-title">Vendas Pendentes</h3>
                    <div style={{ width: 40 }}></div>
                </div>
                <div className="modal-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Carregando reservas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} /> Vendas Pendentes
                </h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                {sales.length === 0 ? (
                    <div className="cart-empty" style={{ marginTop: '40px' }}>
                        <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><Search size={48} /></div>
                        <p className="cart-empty-text">Nenhuma venda pendente encontrada.</p>
                        <button className="btn-scan-more" onClick={() => router.push('/cart')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Voltar ao PDV
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {sales.map(sale => (
                            <div key={sale.id} style={{ 
                                backgroundColor: 'var(--bg-secondary)', 
                                padding: '16px', 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{sale.client_name}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(sale.created_at).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.1rem' }}>
                                            R$ {calculateTotal(sale.items).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <p style={{ margin: '2px 0' }}><strong>Prazo:</strong> {sale.payment_term || 'À vista'}</p>
                                    <p style={{ margin: '2px 0' }}><strong>Pagamento:</strong> {sale.payment_method}</p>
                                    <p style={{ margin: '2px 0' }}><strong>Itens:</strong> {sale.items.reduce((acc, item) => acc + item.quantity, 0)} un.</p>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button 
                                        className="btn-secondary" 
                                        style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}
                                        onClick={() => handleCancel(sale.id)}
                                        disabled={actionLoading === sale.id}
                                    >
                                        <XCircle size={16} /> 
                                        {actionLoading === sale.id ? 'Cancelando...' : 'Cancelar / Estornar'}
                                    </button>
                                    
                                    <button 
                                        className="btn-confirm" 
                                        style={{ flex: 1, margin: 0, padding: '10px 0', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                                        onClick={() => handleComplete(sale.id)}
                                        disabled={actionLoading === sale.id}
                                    >
                                        <Check size={16} />
                                        {actionLoading === sale.id ? 'Finalizando...' : 'Finalizar Venda'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
