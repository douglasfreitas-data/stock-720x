'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Scanner from '@/components/Scanner';
import SearchModal from '@/components/SearchModal';
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

function EntryContent() {
    const router = useRouter();
    const { showToast } = useToast();

    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedOperation, setSelectedOperation] = useState('compra');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Modal de quantidade (para scan e autocomplete)
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [quantityInput, setQuantityInput] = useState(1);
    const quantityRef = useRef<HTMLInputElement>(null);

    // Modal de edição (para itens já na lista)
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const [editQuantity, setEditQuantity] = useState(1);
    const editRef = useRef<HTMLInputElement>(null);

    // Foca no input de quantidade quando o modal abre
    useEffect(() => {
        if (pendingProduct && quantityRef.current) {
            quantityRef.current.focus();
            quantityRef.current.select();
        }
    }, [pendingProduct]);

    // Foca no input de edição quando modal de edição abre
    useEffect(() => {
        if (editingItem && editRef.current) {
            editRef.current.focus();
            editRef.current.select();
        }
    }, [editingItem]);

    // Abre o modal de quantidade para um produto
    const openQuantityModal = (product: Product) => {
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
                const updated = [...prev];
                updated[idx] = { ...updated[idx], quantity: quantityInput };
                return updated;
            }
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

    // Scan → abre modal de quantidade
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

    // SearchModal: ao selecionar, abre modal de quantidade
    const handleSearchSelect = (product: Product) => {
        openQuantityModal(product);
    };

    // Remover item da lista
    const handleRemoveItem = (productId: number) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
        setEditingItem(null);
        showToast('Item removido', 'info');
    };

    // Abrir modal de edição
    const handleEditItem = (item: CartItem) => {
        setEditingItem(item);
        setEditQuantity(item.quantity);
    };

    // Confirma edição de quantidade
    const handleConfirmEdit = () => {
        if (!editingItem || editQuantity <= 0) return;

        setItems(prev => prev.map(i =>
            i.productId === editingItem.productId
                ? { ...i, quantity: editQuantity }
                : i
        ));

        showToast(`Quantidade atualizada: ${editQuantity}x`, 'success');
        setEditingItem(null);
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

                {/* Tipo de Operação (ANTES da busca) */}
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

                {/* Busca por nome — SearchModal (popup fullscreen) */}
                <SearchModal
                    onSelect={handleSearchSelect}
                    label="Ou busque por nome:"
                    placeholder="Digite o nome do produto..."
                />

                {/* Itens na Sessão — layout compacto, clique para editar */}
                <div className="form-section">
                    <label className="form-label">Itens na Sessão ({items.length})</label>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)', opacity: 0.5 }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>📦</div>
                            <p>Nenhum item adicionado</p>
                        </div>
                    ) : (
                        <div style={{
                            background: 'var(--surface)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            overflow: 'hidden'
                        }}>
                            {items.map((item, idx) => (
                                <div
                                    key={item.productId}
                                    onClick={() => handleEditItem(item)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                                        cursor: 'pointer',
                                        gap: '8px',
                                    }}
                                >
                                    <span style={{
                                        background: 'var(--accent)',
                                        color: '#000',
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        minWidth: '36px',
                                        textAlign: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {item.quantity}x
                                    </span>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                    }}>
                                        {item.product?.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        flexShrink: 0,
                                    }}>
                                        ✏️
                                    </span>
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

            {/* Modal de Quantidade (novo produto) */}
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

            {/* Modal de Edição (item existente) */}
            {editingItem && (
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
                            {editingItem.product?.name}
                        </h4>
                        <p style={{ margin: '0 0 var(--space-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {editingItem.product?.barcode || editingItem.product?.sku || '—'}
                        </p>

                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            Alterar quantidade:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                            <button
                                onClick={() => setEditQuantity(q => Math.max(1, q - 1))}
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
                                ref={editRef}
                                type="number"
                                min="1"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit()}
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
                                onClick={() => setEditQuantity(q => q + 1)}
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
                                onClick={() => handleRemoveItem(editingItem.productId)}
                                style={{
                                    flex: 1, padding: 'var(--space-md)',
                                    background: '#dc2626',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >🗑️ Remover</button>
                            <button
                                onClick={() => setEditingItem(null)}
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
                                onClick={handleConfirmEdit}
                                className="btn-confirm"
                                style={{ flex: 1, margin: 0 }}
                            >Salvar</button>
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
