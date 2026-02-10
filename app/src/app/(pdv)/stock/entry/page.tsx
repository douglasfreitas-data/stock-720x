'use client';

import React, { useState, Suspense } from 'react';
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

function EntryContent() {
    const router = useRouter();
    const { showToast } = useToast();

    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedOperation, setSelectedOperation] = useState('compra');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = async (decodedText: string) => {
        if (isScanning) return;
        setIsScanning(true);

        try {
            console.log('Scanned for Entry:', decodedText);

            const existing = items.find(i => i.product?.barcode === decodedText);
            if (existing) {
                setItems(prev => prev.map(i =>
                    i.product && i.product.barcode === decodedText
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ));
                showToast(`+1 ${existing.product?.name} (Total: ${existing.quantity + 1})`, 'success');
            } else {
                const product = await fetchProductByBarcode(decodedText);
                if (product) {
                    setItems(prev => [...prev, {
                        productId: product.id,
                        quantity: 1,
                        product: product
                    }]);
                    showToast(`${product.name} adicionado!`, 'success');
                } else {
                    showToast('Produto não encontrado', 'error');
                }
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao buscar produto', 'error');
        } finally {
            setTimeout(() => setIsScanning(false), 1000);
        }
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
                            <p>Nenhum item escaneado</p>
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
