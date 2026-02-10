'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { updateStockAction } from '@/app/actions/stock';
import { useToast } from '@/components/providers/ToastProvider';

export default function InventoryClient({ initialProduct }: { initialProduct: Product }) {
    const [product, setProduct] = useState(initialProduct);
    const [mode, setMode] = useState<'entry' | 'adjust'>('entry');
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('compra');
    const [observation, setObservation] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    const currentStock = product.stock;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const value = parseInt(amount);
        if (isNaN(value) || value <= 0) {
            showToast('Digite uma quantidade válida', 'error');
            return;
        }

        let newStock: number;
        let sessionType: string;
        let quantity: number;

        if (mode === 'entry') {
            // Entrada: adiciona ao estoque atual
            newStock = currentStock + value;
            sessionType = 'entrada';
            quantity = value;
        } else {
            // Ajuste: valor informado é o novo total (contagem física)
            newStock = value;
            sessionType = 'ajuste';
            quantity = Math.abs(value - currentStock);
        }

        startTransition(async () => {
            const result = await updateStockAction({
                variantId: product.id,
                newStock,
                sessionType,
                operation: reason,
                quantity,
                observation: observation || undefined,
            });

            if (result.success) {
                showToast(result.message || 'Sucesso', 'success');
                setProduct(prev => ({ ...prev, stock: newStock }));
                setAmount('');
                setObservation('');
            } else {
                showToast(result.message || 'Erro', 'error');
            }
        });
    };

    return (
        <div className="inventory-screen p-4 min-h-screen bg-gray-900 text-white">
            <header className="flex items-center gap-3 mb-6">
                <Link href="/scan?mode=inventory" className="text-gray-400 hover:text-white transition-colors">← Voltar</Link>
                <h1 className="text-xl font-bold">Gerenciar Estoque</h1>
            </header>

            <div className="product-card bg-gray-800 p-4 rounded-lg mb-6 flex gap-4">
                <img
                    src={product.image || 'https://via.placeholder.com/80'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded bg-white"
                />
                <div>
                    <h2 className="font-bold text-lg">{product.name}</h2>
                    <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-400">Barcode: {product.barcode}</p>
                    <div className="mt-2 text-xl font-mono">
                        Estoque Atual: <span className="font-bold text-green-400">{currentStock}</span>
                    </div>
                </div>
            </div>

            <div className="tabs flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
                <button
                    className={`flex-1 py-2 rounded-md transition-colors ${mode === 'entry' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    onClick={() => { setMode('entry'); setReason('compra'); }}
                >
                    📥 Entrada
                </button>
                <button
                    className={`flex-1 py-2 rounded-md transition-colors ${mode === 'adjust' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    onClick={() => { setMode('adjust'); setReason('contagem'); }}
                >
                    📝 Ajuste / Balanço
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        {mode === 'entry' ? 'Quantidade a Adicionar' : 'Quantidade Real (Contagem)'}
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:border-blue-500 outline-none text-lg font-mono"
                        placeholder="0"
                        min="0"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Código de Operação</label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white outline-none"
                    >
                        {mode === 'entry' ? (
                            <>
                                <option value="compra">Compra / Entrada de Nota</option>
                                <option value="devolucao">Devolução de Cliente</option>
                            </>
                        ) : (
                            <>
                                <option value="contagem">Correção de Contagem (Balanço)</option>
                                <option value="perda">Perda / Quebra</option>
                                <option value="roubo">Roubo / Extravio</option>
                                <option value="consumo">Uso Interno / Consumo</option>
                            </>
                        )}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Observação (Opcional)</label>
                    <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white outline-none h-20"
                        placeholder="Detalhes sobre a movimentação..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending || !amount}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${isPending ? 'bg-gray-600 cursor-not-allowed' :
                            mode === 'entry' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                >
                    {isPending ? 'Salvando...' : mode === 'entry' ? 'Confirmar Entrada' : 'Confirmar Ajuste'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>O histórico de movimentações será exibido aqui em breve.</p>
            </div>
        </div>
    );
}
