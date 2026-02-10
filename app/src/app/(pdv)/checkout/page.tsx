'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { processSessionAction } from '@/app/actions/session';
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

const operations = [
    { id: 'venda', label: 'Venda ao Consumidor' },
    { id: 'consumo', label: 'Consumo Interno' },
    { id: 'doacao', label: 'Doação' },
    { id: 'pregao', label: 'Saída para Pregão' }
];

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart, cartTotal, cartCount } = useCart();
    const { showToast } = useToast();

    const [customer, setCustomer] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('pix');
    const [selectedOperation, setSelectedOperation] = useState('venda');
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if cart is empty
    if (cart.length === 0) {
        if (typeof window !== 'undefined') router.push('/cart');
        return null;
    }

    const handleConfirmSale = async () => {
        setIsProcessing(true);
        try {
            const result = await processSessionAction({
                items: cart,
                type: 'saida',
                operation: selectedOperation,
                notes: `Cliente: ${customer} | Pagamento: ${selectedPayment}`
            });

            if (result.success) {
                showToast('Operação realizada com sucesso!', 'success');
                clearCart();
                router.push('/success');
            } else {
                showToast(result.message || 'Erro ao processar operação', 'error');
            }
        } catch (error) {
            console.error('Erro geral na venda:', error);
            showToast('Erro ao processar venda', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button onClick={() => router.back()} className="modal-close">←</button>
                <h3 className="modal-title">Finalizar Operação</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                {/* Order Summary */}
                <div className="checkout-summary">
                    <h4 className="checkout-section-title">Resumo</h4>
                    <div className="checkout-items">
                        {cart.map(item => (
                            <div key={item.productId} className="checkout-item">
                                <span className="checkout-item-qty">{item.quantity}x</span>
                                <span className="checkout-item-name">{item.product?.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="checkout-total">
                        <span>Total</span>
                        <span>{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
                    </div>
                    <div className="text-right mt-2">
                        <span className="text-xl font-bold text-[var(--accent)]">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Operation Type */}
                <div className="form-section">
                    <label className="form-label">Tipo de Operação</label>
                    <div className="grid grid-cols-2 gap-2">
                        {operations.map(op => (
                            <div
                                key={op.id}
                                className={`p-3 border rounded cursor-pointer text-center text-sm transition-colors ${selectedOperation === op.id
                                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                    : 'bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]'
                                    }`}
                                onClick={() => setSelectedOperation(op.id)}
                            >
                                {op.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer name */}
                <div className="form-section">
                    <label className="form-label">Nome / Observação (Opcional)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ex: Maria Silva"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                    />
                </div>

                {/* Payment Method */}
                {selectedOperation === 'venda' && (
                    <div className="form-section">
                        <label className="form-label">Forma de Pagamento</label>
                        <div className="payment-options">
                            {paymentMethods.map(p => (
                                <div
                                    key={p.id}
                                    className={`payment-option ${selectedPayment === p.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPayment(p.id)}
                                >
                                    <div className="payment-icon">{p.icon}</div>
                                    <div className="payment-label">{p.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                <button
                    className="btn-confirm"
                    onClick={handleConfirmSale}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processando...' : '✓ Confirmar'}
                </button>
            </div>
        </div>
    );
}
