'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Tipagem baseada no schema
interface Product {
    name: string;
    image_url: string | null;
}

interface Variant {
    id: number;
    sku: string;
    price: number | null;
    stock: number;
    min_stock: number;
    products: Product | Product[]; // O select do Supabase pode retornar array dependo da cardinalidade
}

export default function ReplenishmentReport() {
    const [criticalItems, setCriticalItems] = useState<Variant[]>([]);
    const [attentionItems, setAttentionItems] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStockAlerts() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('product_variants')
                    .select('id, sku, price, stock, min_stock, products(name, image_url)')
                    .gt('min_stock', 0)
                    .order('stock', { ascending: true });

                if (error) {
                    throw error;
                }

                if (data) {
                    const critical: Variant[] = [];
                    const attention: Variant[] = [];

                    // Regra:
                    // Crítico: stock <= min_stock
                    // Atenção: stock > min_stock AND stock <= min_stock + max(1, min_stock * 0.20)
                    // (Garantindo que pelo menos 1 unidade seja considerada margem se o estoque mínimo for muito baixo)
                    
                    data.forEach((variant: any) => {
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

    const getProductName = (p: any) => {
        if (!p) return 'Produto sem nome';
        if (Array.isArray(p)) return p[0]?.name || 'Produto sem nome';
        return p.name || 'Produto sem nome';
    };

    const getImageUrl = (p: any) => {
        if (!p) return null;
        if (Array.isArray(p)) return p[0]?.image_url;
        return p.image_url;
    };

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
                <Link href="/reports" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>
                    ⬅️
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
                    🚨 Ação Imediata (Crítico)
                </h2>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                    Estes produtos atingiram ou ficaram abaixo do mínimo estipulado.
                </p>

                {criticalItems.length === 0 ? (
                    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                        Nenhum produto em nível crítico no momento. 🎉
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {criticalItems.map((item) => (
                            <ProductCard 
                                key={item.id} 
                                item={item} 
                                status="critical" 
                                productName={getProductName(item.products)}
                                imageUrl={getImageUrl(item.products)}
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
                    ⚠️ Em Observação (Atenção)
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
                                productName={getProductName(item.products)}
                                imageUrl={getImageUrl(item.products)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function ProductCard({ item, status, productName, imageUrl }: { item: Variant, status: 'critical' | 'attention', productName: string, imageUrl: string | null }) {
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
            {imageUrl ? (
                <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #eee' }}>
                    <img src={imageUrl} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #eee' }}>
                    📦
                </div>
            )}
            
            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {productName}
                </h3>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#666', flexWrap: 'wrap' }}>
                    <span style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>SKU: {item.sku}</span>
                    {item.price && <span>{formatCurrency(item.price)}</span>}
                </div>
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
