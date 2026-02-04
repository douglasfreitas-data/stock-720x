import { useState } from 'react'

export default function CheckoutScreen({ cart, products, onConfirm, onBack }) {
    const [customer, setCustomer] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('pix')

    const payments = [
        { id: 'pix', icon: '📱', label: 'PIX' },
        { id: 'credit', icon: '💳', label: 'Crédito' },
        { id: 'debit', icon: '💳', label: 'Débito' },
        { id: 'cash', icon: '💵', label: 'Dinheiro' },
        { id: 'boleto', icon: '📄', label: 'Boleto' },
        { id: 'other', icon: '📋', label: 'Outro' }
    ]

    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    const getProduct = (productId) => products.find(p => p.id === productId)

    const handleConfirm = () => {
        onConfirm(customer || 'Consumidor', paymentMethod)
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onBack}>←</button>
                <h3 className="modal-title">Finalizar Venda</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                {/* Cart Summary */}
                <div className="checkout-summary">
                    <h4 className="checkout-section-title">Resumo do Pedido</h4>
                    <div className="checkout-items">
                        {cart.map(item => {
                            const product = getProduct(item.productId)
                            if (!product) return null
                            return (
                                <div key={item.productId} className="checkout-item">
                                    <span className="checkout-item-qty">{item.quantity}x</span>
                                    <span className="checkout-item-name">{product.name}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="checkout-total">
                        <span>Total</span>
                        <span>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
                    </div>
                </div>

                {/* Customer Name */}
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
                        {payments.map(p => (
                            <div
                                key={p.id}
                                className={`payment-option ${paymentMethod === p.id ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod(p.id)}
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
                    onClick={handleConfirm}
                >
                    ✓ Confirmar Venda
                </button>
            </div>
        </div>
    )
}
