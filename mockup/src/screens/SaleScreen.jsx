import { useState } from 'react'

export default function SaleScreen({ product, onClose, onConfirm }) {
    const [quantity, setQuantity] = useState(1)
    const [customer, setCustomer] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('pix')

    const canSell = product.stock >= quantity && quantity > 0

    const payments = [
        { id: 'pix', icon: '📱', label: 'PIX' },
        { id: 'credit', icon: '💳', label: 'Crédito' },
        { id: 'debit', icon: '💳', label: 'Débito' },
        { id: 'cash', icon: '💵', label: 'Dinheiro' },
        { id: 'boleto', icon: '📄', label: 'Boleto' },
        { id: 'other', icon: '📋', label: 'Outro' }
    ]

    const handleConfirm = () => {
        if (canSell) {
            onConfirm(product, quantity, customer || 'Consumidor', paymentMethod)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">Nova Venda</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                <div className="product-display">
                    {/* Product Info */}
                    <div className="product-header">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="product-image"
                        />
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-sku">{product.sku}</p>
                            <span className="product-stock">
                                📦 {product.stock} em estoque
                            </span>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="form-section">
                        <label className="form-label">Quantidade da venda</label>
                        <div className="quantity-row">
                            <button
                                className="qty-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                −
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                                className="qty-btn"
                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                disabled={quantity >= product.stock}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Customer */}
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
                        disabled={!canSell}
                    >
                        Confirmar Venda
                    </button>
                </div>
            </div>
        </div>
    )
}
