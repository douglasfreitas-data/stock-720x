'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Scanner from '@/components/Scanner';
import { processSessionAction } from '@/app/actions/session';
import { useToast } from '@/components/providers/ToastProvider';
import { Product, CartItem } from '@/lib/types';
import Link from 'next/link';

// Operações de entrada
const operations = [
    { id: 'compra', label: 'Compra / Reposição' },
    { id: 'devolucao', label: 'Devolução de Cliente' },
    { id: 'ajuste_entrada', label: 'Ajuste (Sobrou)' }
];

async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
    const res = await fetch(`/api/products/barcode?code=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
}

async function searchProducts(query: string): Promise<Product[]> {
    const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
}

function EntryContent() {
    const router = useRouter();
    const { showToast } = useToast();

    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedOperation, setSelectedOperation] = useState('compra');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // --- Mudança 1: Modal de quantidade ---
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [quantityInput, setQuantityInput] = useState(1);
    const quantityRef = useRef<HTMLInputElement>(null);

    // --- Mudança 2: Autocomplete ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Debounce search (300ms)
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchProducts(searchQuery);
                setSearchResults(results);
                setShowDropdown(results.length > 0);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Foca no input de quantidade quando o modal abre
    useEffect(() => {
        if (pendingProduct && quantityRef.current) {
            quantityRef.current.focus();
            quantityRef.current.select();
        }
    }, [pendingProduct]);

    // Abre o modal de quantidade para um produto
    const openQuantityModal = (product: Product) => {
        // Se já existe na lista, pré-preenche com qty+1
        const existing = items.find(i => i.productId === product.id);
        setPendingProduct(product);
        setQuantityInput(existing ? existing.quantity + 1 : 1);
    };

    // Confirma quantidade e adiciona ao carrinho
    const handleConfirmQuantity = () => {
        if (!pendingProduct || quantityInput <= 0) return;

        setItems(prev => {
            const idx = prev.findIndex(i => i.productId === pendingProduct.id);
            if (idx >= 0) {
                // Atualiza quantidade do item existente
                const updated = [...prev];
                updated[idx] = { ...updated[idx], quantity: quantityInput };
                return updated;
            }
            // Novo item
            return [...prev, {
                productId: pendingProduct.id!,
                quantity: quantityInput,
                product: pendingProduct
            }];
        });

        showToast(`${pendingProduct.name} — ${quantityInput}x adicionado!`, 'success');
        setPendingProduct(null);
        setQuantityInput(1);
    };

    // Scan → abre modal de quantidade (em vez de adicionar direto)
    const handleScan = async (decodedText: string) => {
        if (isScanning) return;
        setIsScanning(true);

        try {
            const product = await fetchProductByBarcode(decodedText);
            if (product && product.id) {
                openQuantityModal(product);
            } else {
                showToast('Produto não encontrado', 'error');
            }
        } catch (err) {
            console.error('Entry Scan Error:', err);
            showToast('Erro ao processar item.', 'error');
        } finally {
            setTimeout(() => setIsScanning(false), 1500);
        }
    };

    // Autocomplete: ao selecionar, abre modal de quantidade
    const handleSearchSelect = (product: Product) => {
        openQuantityModal(product);
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleRemoveItem = (productId: number) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    };

    const handleConfirmEntry = async () => {
        if (items.length === 0) return;
        setIsProcessing(true);

        try {
            const result = await processSessionAction({
                items,
                type: 'entrada',
                operation: selectedOperation,
                notes: notes
            });

            if (result.success) {
                showToast('Entrada registrada com sucesso!', 'success');
                setItems([]);
                setNotes('');
                router.push('/');
            } else {
                showToast(result.message || 'Erro ao registrar entrada', 'error');
            }
        } catch (error) {
            console.error('Erro na entrada:', error);
            showToast('Erro interno', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

    return (
        <div className="modal-overlay">
            {/* Header */}
            <div className="modal-header">
                <Link href="/" className="modal-close">←</Link>
                <h3 className="modal-title">Entrada de Estoque</h3>
                <div style={{ width: 40, textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {totalItems > 0 && totalItems}
                </div>
            </div>

            <div className="modal-body">
                {/* Scanner Area */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <Scanner onScan={handleScan} />
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'var(--space-sm)', fontSize: '0.875rem' }}>
                        Aponte a câmera para adicionar produtos
                    </p>
                </div>

                {/* Mudança 2: Campo de busca por nome */}
                <div className="form-section" style={{ position: 'relative' }}>
                    <label className="form-label">Ou busque por nome:</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        placeholder="Digite o nome do produto..."
                        className="form-input"
                    />
                    {isSearching && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-sm)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Buscando...
                        </div>
                    )}
                    {showDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 50,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            maxHeight: 200,
                            overflowY: 'auto',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                        }}>
                            {searchResults.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSearchSelect(product)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {product.barcode || product.sku || '—'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Operation Type */}
                <div className="form-section">
                    <label className="form-label">Tipo de Operação</label>
                    <div className="payment-options">
                        {operations.map(op => (
                            <button
                                key={op.id}
                                className={`payment-option ${selectedOperation === op.id ? 'selected' : ''}`}
                                onClick={() => setSelectedOperation(op.id)}
                            >
                                <div className="payment-label">{op.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scanned Items List */}
                <div className="form-section">
                    <label className="form-label">Itens na Sessão</label>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)', opacity: 0.5 }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>📦</div>
                            <p>Nenhum item adicionado</p>
                        </div>
                    ) : (
                        <div className="cart-list">
                            {items.map(item => (
                                <div key={item.productId} className="cart-item">
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.product?.name}</div>
                                        <div className="cart-item-sku">
                                            Quantidade: <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{item.quantity}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(item.productId)}
                                        className="cart-item-remove"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="form-section">
                    <label className="form-label">Observação (Fornecedor, NF...)</label>
                    <input
                        type="text"
                        placeholder="Opcional"
                        className="form-input"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirmEntry}
                    disabled={items.length === 0 || isProcessing}
                    className="btn-confirm"
                >
                    {isProcessing ? 'Processando...' : `Confirmar Entrada (${totalItems})`}
                </button>
            </div>

            {/* Mudança 1: Modal de Quantidade */}
            {pendingProduct && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.8)',
                    padding: 'var(--space-lg)'
                }}>
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg, 12px)',
                        padding: 'var(--space-xl)',
                        width: '100%',
                        maxWidth: 360,
                    }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                            {pendingProduct.name}
                        </h4>
                        <p style={{ margin: '0 0 var(--space-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {pendingProduct.barcode || pendingProduct.sku || '—'}
                        </p>

                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            Quantidade a entrar:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                            <button
                                onClick={() => setQuantityInput(q => Math.max(1, q - 1))}
                                style={{
                                    width: 48, height: 48,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--bg-secondary, #2d2d2d)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '1.25rem',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >−</button>
                            <input
                                ref={quantityRef}
                                type="number"
                                min="1"
                                value={quantityInput}
                                onChange={(e) => setQuantityInput(parseInt(e.target.value) || 1)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmQuantity()}
                                style={{
                                    flex: 1, height: 48,
                                    background: 'var(--bg-primary, #000)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    textAlign: 'center',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <button
                                onClick={() => setQuantityInput(q => q + 1)}
                                style={{
                                    width: 48, height: 48,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--bg-secondary, #2d2d2d)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '1.25rem',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >+</button>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button
                                onClick={() => setPendingProduct(null)}
                                style={{
                                    flex: 1, padding: 'var(--space-md)',
                                    background: 'var(--bg-secondary, #2d2d2d)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >Cancelar</button>
                            <button
                                onClick={handleConfirmQuantity}
                                className="btn-confirm"
                                style={{ flex: 1, margin: 0 }}
                            >Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EntryPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <EntryContent />
        </Suspense>
    );
}
