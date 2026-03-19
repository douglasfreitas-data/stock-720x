'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Scanner from '@/components/Scanner';
import SearchModal from '@/components/SearchModal';
import { updateStockAction } from '@/app/actions/stock';
import { useToast } from '@/components/providers/ToastProvider';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Check } from 'lucide-react';

// Motivos de ajuste de inventário
const adjustReasons = [
    { id: 'contagem', label: 'Erro de Contagem' },
    { id: 'perda', label: 'Perda' },
    { id: 'quebra', label: 'Quebra / Avaria' },
    { id: 'roubo', label: 'Roubo / Extravio' },
    { id: 'vencido', label: 'Prazo Vencido' },
    { id: 'outro', label: 'Outro' }
];

async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
    const res = await fetch(`/api/products/barcode?code=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
}

function InventoryContent() {
    const { showToast } = useToast();

    // Estado do scanner
    const [isScanning, setIsScanning] = useState(false);

    // Modal de ajuste
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [newStockInput, setNewStockInput] = useState('');
    const [newMinStockInput, setNewMinStockInput] = useState('');
    const [selectedReason, setSelectedReason] = useState('contagem');
    const [observation, setObservation] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Histórico da sessão (produtos ajustados nesta sessão)
    const [adjustedItems, setAdjustedItems] = useState<Array<{
        product: Product;
        oldStock: number;
        newStock: number;
        reason: string;
    }>>([]);

    // Foca no input quando modal abre
    useEffect(() => {
        if (selectedProduct && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selectedProduct]);

    // Abre modal de ajuste para um produto
    const openAdjustModal = (product: Product) => {
        setSelectedProduct(product);
        setNewStockInput('');
        setNewMinStockInput(product.minStock?.toString() || '0');
        setSelectedReason('contagem');
        setObservation('');
    };

    // Scanner handler
    const handleScan = async (decodedText: string) => {
        if (isScanning) return;
        setIsScanning(true);

        try {
            const product = await fetchProductByBarcode(decodedText);
            if (product && product.id) {
                showToast(`Produto encontrado: ${product.name}`, 'info');
                openAdjustModal(product);
            } else {
                showToast('Produto não encontrado no sistema', 'error');
            }
        } catch (err) {
            console.error('Inventory Scan Error:', err);
            showToast('Erro ao buscar produto.', 'error');
        } finally {
            setTimeout(() => setIsScanning(false), 1500);
        }
    };

    // SearchModal select handler
    const handleSearchSelect = (product: Product) => {
        openAdjustModal(product);
    };

    // Confirmar ajuste de estoque
    const handleConfirmAdjust = async () => {
        if (!selectedProduct) return;

        // Se o input de estoque estiver vazio, assumimos que não houve mudança no estoque físico
        const currentStockValue = selectedProduct.stock;
        const newStockValue = newStockInput.trim() === '' ? currentStockValue : parseInt(newStockInput);
        const newMinStockValue = newMinStockInput.trim() === '' ? (selectedProduct.minStock || 0) : parseInt(newMinStockInput);

        if (newStockInput.trim() !== '' && (isNaN(newStockValue) || newStockValue < 0)) {
            showToast('Digite uma quantidade válida (≥ 0)', 'error');
            return;
        }

        if (isNaN(newMinStockValue) || newMinStockValue < 0) {
            showToast('Estoque mínimo inválido (≥ 0)', 'error');
            return;
        }

        const delta = newStockValue - currentStockValue;
        const minStockChanged = newMinStockValue !== selectedProduct.minStock;

        if (delta === 0 && !minStockChanged) {
            showToast('Nenhuma alteração detectada', 'info');
            setSelectedProduct(null);
            return;
        }

        setIsProcessing(true);

        try {
            const result = await updateStockAction({
                variantId: selectedProduct.id,
                newStock: newStockValue,
                minStock: newMinStockValue,
                sessionType: delta > 0 ? 'entrada' : delta < 0 ? 'saida' : 'ajuste', // trata caso onde delta === 0 mas minStock mudou
                operation: delta !== 0 ? selectedReason : 'ajuste', // se apenas o minStock mudou, não é contagem/perda necessariamente
                quantity: Math.abs(delta),
                observation: observation || (delta !== 0 ? `Ajuste de inventário: ${adjustReasons.find(r => r.id === selectedReason)?.label}` : 'Atualização de Estoque Mínimo'),
            });

            if (result.success) {
                showToast(`Estoque atualizado: ${currentStockValue} → ${newStockValue} (${delta > 0 ? '+' : ''}${delta})`, 'success');

                // Adicionar ao histórico da sessão
                setAdjustedItems(prev => [{
                    product: selectedProduct,
                    oldStock: currentStockValue,
                    newStock: newStockValue,
                    reason: delta !== 0 ? (adjustReasons.find(r => r.id === selectedReason)?.label || selectedReason) : 'Ajuste de Mínimo Ideal',
                }, ...prev]);

                setSelectedProduct(null);
            } else {
                showToast(result.message || 'Erro ao atualizar estoque', 'error');
            }
        } catch (error) {
            console.error('Erro no ajuste:', error);
            showToast('Erro ao processar ajuste', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Inventário</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                {/* Modal de Ajuste (sobrepõe quando produto selecionado) */}
                {selectedProduct ? (
                    <div className="p-4">
                        {/* Produto info */}
                        <div style={{
                            background: 'var(--surface)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '20px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}>
                            {selectedProduct.image && (
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, background: '#fff' }}
                                />
                            )}
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{selectedProduct.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    Código: {selectedProduct.id}
                                </div>
                                <div style={{ marginTop: 4, fontSize: '1.1rem' }}>
                                    {(() => {
                                        const margin = Math.ceil((selectedProduct.minStock || 0) * 0.2); // 20% margin
                                        let color = '#4ade80'; // Green

                                        if (selectedProduct.stock <= (selectedProduct.minStock || 0)) {
                                            color = '#f87171'; // Red
                                        } else if (selectedProduct.stock <= (selectedProduct.minStock || 0) + margin) {
                                            color = '#facc15'; // Yellow
                                        }

                                        return (
                                            <>Estoque atual: <strong style={{ color }}>{selectedProduct.stock}</strong></>
                                        );
                                    })()}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 2 }}>
                                    Mín. Ideal: {selectedProduct.minStock || 0}
                                </div>
                            </div>
                        </div>

                        {/* Formulário de ajuste */}
                        <div className="form-section">
                            <label className="form-label">Quantidade Real (Contagem Física)</label>
                            <input
                                ref={inputRef}
                                type="number"
                                className="form-input"
                                value={newStockInput}
                                onChange={(e) => setNewStockInput(e.target.value)}
                                placeholder="Ex: 15"
                                min="0"
                                style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}
                            />
                            {newStockInput && !isNaN(parseInt(newStockInput)) && (
                                <div style={{
                                    marginTop: 8,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: 'var(--surface)',
                                    fontSize: '0.9rem',
                                    color: parseInt(newStockInput) - selectedProduct.stock === 0
                                        ? 'var(--text-muted)'
                                        : parseInt(newStockInput) - selectedProduct.stock > 0
                                            ? '#4ade80'
                                            : '#f87171'
                                }}>
                                    {(() => {
                                        const delta = parseInt(newStockInput) - selectedProduct.stock;
                                        if (delta === 0) return '→ Sem alteração';
                                        return `→ ${delta > 0 ? '+' : ''}${delta} unidades`;
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Estoque Mínimo Input */}
                        <div className="form-section">
                            <label className="form-label">Estoque Mínimo Ideal</label>
                            <input
                                type="number"
                                className="form-input"
                                value={newMinStockInput}
                                onChange={(e) => setNewMinStockInput(e.target.value)}
                                placeholder="Ex: 5"
                                min="0"
                                style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}
                            />
                        </div>

                        <div className="form-section">
                            <label className="form-label">Motivo do Ajuste</label>
                            <div className="payment-options">
                                {adjustReasons.map(r => (
                                    <div
                                        key={r.id}
                                        className={`payment-option ${selectedReason === r.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedReason(r.id)}
                                    >
                                        <div className="payment-label">{r.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-section">
                            <label className="form-label">Observação (Opcional)</label>
                            <textarea
                                className="form-input"
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                placeholder="Detalhes sobre o ajuste..."
                                rows={2}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="btn-back"
                                style={{ flex: 1, marginTop: 0 }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmAdjust}
                                className="btn-confirm"
                                disabled={isProcessing}
                                style={{ flex: 2, marginTop: 0 }}
                            >
                                {isProcessing ? 'Salvando...' : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Check size={20} /> Confirmar Ajuste
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Scanner */}
                        {isScanning ? (
                            <div className="flex flex-col items-center justify-center p-8 text-white">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-4"></div>
                                <p>Buscando produto...</p>
                            </div>
                        ) : (
                            <Scanner onScan={handleScan} />
                        )}

                        {/* Busca por nome — SearchModal (popup fullscreen) */}
                        <div style={{ padding: '0 16px', marginTop: '12px' }}>
                            <SearchModal
                                onSelect={handleSearchSelect}
                                label="Ou busque por nome:"
                                placeholder="Digite o nome do produto..."
                            />
                        </div>

                        {/* Histórico da sessão */}
                        {adjustedItems.length > 0 && (
                            <div style={{ padding: '0 16px', marginTop: 8 }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                                    Ajustes nesta sessão ({adjustedItems.length})
                                </h4>
                                {adjustedItems.map((item, idx) => (
                                    <div key={idx} style={{
                                        background: 'var(--surface)',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        marginBottom: 8,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.product.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.reason}</div>
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontFamily: 'monospace',
                                            color: item.newStock - item.oldStock >= 0 ? '#4ade80' : '#f87171'
                                        }}>
                                            {item.oldStock} → {item.newStock}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function InventoryPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Carregando inventário...</div>}>
            <InventoryContent />
        </Suspense>
    );
}
