'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReplenishmentDataAction } from '@/app/actions/reports';
import { ArrowLeft, Package } from 'lucide-react';

function formatCurrency(value: number | null | undefined) {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

interface ProcessedVariant {
    id: number;
    sku: string;
    price: number | null;
    stock: number;
    min_stock: number;
    productName: string;
    imageUrl: string | null;
}

export default function ReplenishmentReport() {
    const [criticalItems, setCriticalItems] = useState<ProcessedVariant[]>([]);
    const [attentionItems, setAttentionItems] = useState<ProcessedVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStockAlerts() {
            setLoading(true);
            try {
                const result = await getReplenishmentDataAction();

                if (!result.success) {
                    throw new Error(result.message || 'Erro ao carregar dados.');
                }

                if (result.data) {
                    const critical: ProcessedVariant[] = [];
                    const attention: ProcessedVariant[] = [];

                    // Regra:
                    // Crítico: stock <= min_stock
                    // Atenção: stock > min_stock AND stock <= min_stock + max(1, min_stock * 0.20)
                    result.data.forEach((variant: ProcessedVariant) => {
                        const min = variant.min_stock;
                        const margin = Math.max(1, Math.ceil(min * 0.20));
                        const threshold = min + margin;

                        if (variant.stock <= min) {
                            critical.push(variant);
                        } else if (variant.stock <= threshold) {
                            attention.push(variant);
                        }
                    });

                    setCriticalItems(critical);
                    setAttentionItems(attention);
                }
            } catch (err: any) {
                console.error("Erro ao carregar dados de estoque:", err);
                setError(err.message || "Não foi possível carregar o relatório de reposição.");
            } finally {
                setLoading(false);
            }
        }

        fetchStockAlerts();
    }, []);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (loading) {
        return (
            <div className="home-screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p>Carregando dados de estoque...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: 'red' }}>{error}</p>
                <Link href="/reports" className="btn-primary" style={{ marginTop: '20px' }}>
                    Voltar aos Relatórios
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <Link href="/reports" style={{ textDecoration: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Relatório de Reposição</h1>
            </div>

            <p style={{ color: 'var(--text-color)', opacity: 0.8, marginBottom: '20px' }}>
                Acompanhe os produtos que atingiram o estoque mínimo ou que estão próximos a ele.
            </p>

            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ 
                    color: '#d32f2f', 
                    borderBottom: '2px solid #d32f2f', 
                    paddingBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    Ação Imediata (Crítico)
                </h2>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                    Estes produtos atingiram ou ficaram abaixo do mínimo estipulado.
                </p>

                {criticalItems.length === 0 ? (
                    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                        Nenhum produto em nível crítico no momento.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {criticalItems.map((item) => (
                            <ProductCard 
                                key={item.id} 
                                item={item} 
                                status="critical" 
                                isMounted={isMounted}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 style={{ 
                    color: '#ed6c02', 
                    borderBottom: '2px solid #ed6c02', 
                    paddingBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    Em Observação (Atenção)
                </h2>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                    Estes produtos estão na margem de 20% acima do mínimo estipulado.
                </p>

                {attentionItems.length === 0 ? (
                    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                        Nenhum produto na área de atenção.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {attentionItems.map((item) => (
                            <ProductCard 
                                key={item.id} 
                                item={item} 
                                status="attention" 
                                isMounted={isMounted}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function ProductCard({ item, status, isMounted }: { item: ProcessedVariant, status: 'critical' | 'attention', isMounted: boolean }) {
    const bg = status === 'critical' ? '#ffebee' : '#fff3e0';
    const borderColor = status === 'critical' ? '#ffcdd2' : '#ffe0b2';
    const textColor = status === 'critical' ? '#c62828' : '#e65100';

    return (
        <div style={{ 
            display: 'flex', 
            background: 'white', 
            border: `1px solid ${borderColor}`,
            borderLeft: `5px solid ${textColor}`,
            borderRadius: '8px',
            padding: '15px',
            alignItems: 'center',
            gap: '15px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
            {item.imageUrl ? (
                <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #eee' }}>
                    <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #eee', color: '#999' }}>
                    <Package size={24} />
                </div>
            )}
            
            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.productName}
                </h3>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '2px' }}>Estoque</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: textColor }}>
                    {item.stock}
                </div>
                <div style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: bg, color: textColor, marginTop: '4px' }}>
                    Mínimo: {item.min_stock}
                </div>
            </div>
        </div>
    );
}
