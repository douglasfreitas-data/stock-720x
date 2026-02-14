'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/types';

interface SearchModalProps {
    onSelect: (product: Product) => void;
    placeholder?: string;
    label?: string;
}

async function searchProducts(query: string): Promise<Product[]> {
    const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
}

export default function SearchModal({ onSelect, placeholder = 'Digite o nome do produto...', label = 'Buscar por nome' }: SearchModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search (300ms)
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchProducts(searchQuery);
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = (product: Product) => {
        onSelect(product);
        setIsOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <>
            {/* Trigger button */}
            <div className="form-section">
                <label className="form-label">{label}</label>
                <button
                    onClick={() => setIsOpen(true)}
                    className="form-input"
                    style={{
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>🔍</span>
                    {placeholder}
                </button>
            </div>

            {/* Fullscreen modal */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 70,
                    background: 'var(--bg-primary, #000)',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Modal header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--surface)',
                    }}>
                        <button
                            onClick={handleClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '1.25rem',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                flexShrink: 0,
                            }}
                        >←</button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={placeholder}
                            className="form-input"
                            style={{ margin: 0, flex: 1 }}
                            autoFocus
                        />
                    </div>

                    {/* Results */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {isSearching && (
                            <div style={{
                                textAlign: 'center',
                                padding: '24px',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                Buscando...
                            </div>
                        )}

                        {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '24px',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                Nenhum produto encontrado
                            </div>
                        )}

                        {searchQuery.length < 2 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 24px',
                                color: 'var(--text-muted)',
                                opacity: 0.5
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔍</div>
                                <p>Digite pelo menos 2 caracteres</p>
                            </div>
                        )}

                        {searchResults.map(product => (
                            <button
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    gap: '12px',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>
                                        {product.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {product.barcode || product.sku || '—'}
                                    </div>
                                </div>
                                <div style={{
                                    textAlign: 'right',
                                    flexShrink: 0,
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <div>Est: <strong style={{ color: 'var(--accent)' }}>{product.stock}</strong></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
