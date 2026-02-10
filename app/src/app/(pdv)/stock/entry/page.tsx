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
    const [isScanning, setIsScanning] = useState(false); // To prevent double scans

    const handleScan = async (decodedText: string) => {
        if (isScanning) return;
        setIsScanning(true);

        try {
            console.log('Scanned for Entry:', decodedText);

            // Check if already in list
            const existing = items.find(i => i.product?.barcode === decodedText);
            if (existing) {
                // Increment
                setItems(prev => prev.map(i =>
                    i.product && i.product.barcode === decodedText
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ));
                showToast(`+1 ${existing.product?.name} (Total: ${existing.quantity + 1})`, 'success');
            } else {
                // Fetch
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
            // Add delay to prevent instant re-scan
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
                // Maybe redirect or stay?
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
        <div className="flex flex-col h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-2xl">←</Link>
                    <h1 className="text-lg font-bold">Entrada de Estoque</h1>
                </div>
                <div className="font-mono text-sm bg-[var(--background)] px-2 py-1 rounded border border-[var(--border)]">
                    {totalItems} itens
                </div>
            </header>

            {/* Scanner Area */}
            <div className="p-4 bg-[var(--background)]">
                <div className="bg-black rounded-lg overflow-hidden relative" style={{ height: '200px' }}>
                    <Scanner onScan={handleScan} />
                </div>
                <p className="text-center text-xs text-[var(--text-muted)] mt-2">
                    Aponte a câmera para adicionar produtos
                </p>
            </div>

            {/* Operation Type */}
            <div className="px-4 py-2">
                <label className="text-xs text-[var(--text-muted)] uppercase font-bold">Tipo de Operação</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                    {operations.map(op => (
                        <button
                            key={op.id}
                            className={`p-2 rounded text-xs border transition-colors ${selectedOperation === op.id
                                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                : 'bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]'
                                }`}
                            onClick={() => setSelectedOperation(op.id)}
                        >
                            {op.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scanned Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
                <label className="text-xs text-[var(--text-muted)] uppercase font-bold mb-2 block">Itens na Sessão</label>

                {items.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)] opacity-50">
                        <div className="text-4xl mb-2">📦</div>
                        <p>Nenhum item escaneado</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map(item => (
                            <div key={item.productId} className="flex justify-between items-center bg-[var(--surface)] p-3 rounded shadow-sm border border-[var(--border)]">
                                <div>
                                    <div className="font-medium text-sm">{item.product?.name}</div>
                                    <div className="text-xs text-[var(--text-muted)] mt-1">
                                        Qtd: <span className="font-bold text-[var(--foreground)] text-base">{item.quantity}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item.productId)}
                                    className="text-red-500 p-2"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes/Supplier */}
            <div className="px-4 pb-2">
                <input
                    type="text"
                    placeholder="Observação (Fornecedor, NF...)"
                    className="w-full p-3 bg-[var(--surface)] border border-[var(--border)] rounded text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] sticky bottom-0">
                <button
                    onClick={handleConfirmEntry}
                    disabled={items.length === 0 || isProcessing}
                    className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all ${items.length === 0 || isProcessing
                        ? 'bg-[var(--surface-active)] text-[var(--text-muted)] cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]'
                        }`}
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
