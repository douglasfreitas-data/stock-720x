'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

const paymentMethods = [
    { id: 'pix', icon: '📱', label: 'PIX' },
    { id: 'credit', icon: '💳', label: 'Crédito' },
    { id: 'debit', icon: '💳', label: 'Débito' },
    { id: 'cash', icon: '💵', label: 'Dinheiro' },
    { id: 'boleto', icon: '📄', label: 'Boleto' },
    { id: 'other', icon: '📋', label: 'Outro' }
];

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart, cartTotal, cartCount } = useCart();
    const { showToast } = useToast();

    const [customer, setCustomer] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('pix');
    const [isProcessing, setIsProcessing] = useState(false);

    // Redireciona se carrinho vazio
    if (cart.length === 0) {
        // router.push('/cart'); // Retorna erro hydration se renderizar diferente no server
        // Melhor retornar null e useEffect redirecionar
        if (typeof window !== 'undefined') router.push('/cart');
        return null;
    }

    const handleConfirmSale = async () => {
        setIsProcessing(true);

        try {
            // Loop para dar baixa item a item (devido à limitação da API atual stock V1)
            // Idealmente, endpoint suportaria batch
            const errors = [];

            for (const item of cart) {
                if (!item.product?.barcode) continue;

                try {
                    const response = await fetch('/api/stock', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            barcode: item.product.barcode,
                            quantity: item.quantity
                        })
                    });

                    if (!response.ok) {
                        console.error(`Falha ao baixar estoque do item ${item.productId}`);
                        errors.push(item.product.name);
                    }
                } catch (err) {
                    console.error('Erro de rede:', err);
                    errors.push(item.product.name);
                }
            }

            if (errors.length > 0) {
                showToast(`Erro ao baixar estoque de: ${errors.join(', ')}`, 'error');
            } else {
                showToast('Venda realizada com sucesso!', 'success');
            }

            // Limpa carrinho e vai para sucesso
            // Passar dados da venda via query ou state management global seria melhor
            // Ex: setLastSale({ ... }) no context

            // Simples redirect
            clearCart();
            router.push('/success');

        } catch (error) {
            console.error('Erro geral na venda:', error);
            showToast('Erro ao processar venda', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            <div className="flex items-center p-4 border-b border-[var(--border-color)]">
                <button onClick={() => router.back()} className="text-xl mr-4">←</button>
                <h1 className="text-lg font-bold">Finalizar Venda</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Resumo */}
                <div className="bg-[var(--bg-card)] rounded-lg p-4 mb-6 border border-[var(--border-color)]">
                    <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Resumo do Pedido</h2>
                    <div className="space-y-2 mb-4">
                        {cart.map(item => (
                            <div key={item.productId} className="flex justify-between text-sm">
                                <span className="text-gray-300">
                                    <span className="text-gray-500 mr-2">{item.quantity}x</span>
                                    {item.product?.name}
                                </span>
                                <span className="font-medium text-[var(--accent)]">
                                    R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
                        <span className="font-bold">Total</span>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">{cartCount} itens</div>
                            <div className="text-xl font-bold text-[var(--accent)]">
                                R$ {cartTotal.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cliente */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Cliente (Opcional)</label>
                    <input
                        type="text"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        placeholder="Ex: Maria Silva"
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 text-white focus:border-[var(--accent)] outline-none"
                    />
                </div>

                {/* Pagamento */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Forma de Pagamento</label>
                    <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map(method => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedPayment(method.id)}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all
                     ${selectedPayment === method.id
                                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)]'
                                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-gray-400 hover:border-gray-500'
                                    }
                   `}
                            >
                                <span className="text-xl">{method.icon}</span>
                                <span className="text-xs font-medium">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Botão Finalizar */}
            <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
                <button
                    onClick={handleConfirmSale}
                    disabled={isProcessing}
                    className="w-full py-4 bg-[var(--accent)] text-white rounded-lg font-bold text-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <span className="animate-spin">⏳</span> Processando...
                        </>
                    ) : (
                        '✓ Confirmar Venda'
                    )}
                </button>
            </div>
        </div>
    );
}
