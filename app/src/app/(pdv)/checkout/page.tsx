'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

    // Redirect if cart is empty
    if (cart.length === 0) {
        if (typeof window !== 'undefined') router.push('/cart');
        return null;
    }

    const handleConfirmSale = async () => {
        setIsProcessing(true);
        try {
            // Processing logic...
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
                    if (!response.ok) errors.push(item.product.name);
                } catch (err) {
                    errors.push(item.product.name);
                }
            }

            if (errors.length > 0) {
                showToast(`Erro ao baixar estoque de: ${errors.join(', ')}`, 'error');
            } else {
                showToast('Venda realizada com sucesso!', 'success');
            }

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
        <div className="modal-overlay">
            <div className="modal-header">
                <button onClick={() => router.back()} className="modal-close">←</button>
                <h3 className="modal-title">Finalizar Venda</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                {/* Order Summary */}
                <div className="checkout-summary">
                    <h4 className="checkout-section-title">Resumo do Pedido</h4>
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

                {/* Customer name */}
                <div className="form-section">
                    <label className="form-label">Nome do cliente (opcional)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ex: Maria Silva"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                    />
                </div>

                {/* Payment Method */}
                <div className="form-section">
                    <label className="form-label">Forma de pagamento</label>
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

                {/* Confirm Button */}
                <button
                    className="btn-confirm"
                    onClick={handleConfirmSale}
                    disabled={isProcessing}
                >
                    {isProcessing ? '✓ Processando...' : '✓ Confirmar Venda'}
                </button>
            </div>
        </div>
    );
}
