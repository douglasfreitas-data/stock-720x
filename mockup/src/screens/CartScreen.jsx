import { useState } from 'react'

export default function CartScreen({ cart, products, onUpdateQuantity, onRemoveItem, onScanMore, onCheckout, onClose }) {
    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    const getProduct = (productId) => products.find(p => p.id === productId)

    const handleQuantityChange = (productId, delta) => {
        const item = cart.find(i => i.productId === productId)
        const product = getProduct(productId)
        if (!item || !product) return

        const newQty = item.quantity + delta
        if (newQty < 1) return
        if (newQty > product.stock) return

        onUpdateQuantity(productId, newQty)
    }

    // Check if stock will be at or below minimum after sale
    const isStockCritical = (product, quantity) => {
        const remainingStock = product.stock - quantity
        return remainingStock <= product.minStock
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">🛒 Carrinho</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                {cart.length === 0 ? (
                    <div className="cart-empty">
                        <div className="cart-empty-icon">🛒</div>
                        <p className="cart-empty-text">Carrinho vazio</p>
                        <button className="btn-scan-more" onClick={onScanMore}>
                            📷 Escanear Produto
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="cart-list">
                            {cart.map(item => {
                                const product = getProduct(item.productId)
                                if (!product) return null

                                const remainingStock = product.stock - item.quantity
                                const isCritical = isStockCritical(product, item.quantity)

                                return (
                                    <div key={item.productId} className={`cart-item ${isCritical ? 'cart-item-warning' : ''}`}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="cart-item-image"
                                        />
                                        <div className="cart-item-info">
                                            <h4 className="cart-item-name">{product.name}</h4>
                                            <p className="cart-item-sku">{product.sku}</p>
                                            <p className="cart-item-stock">
                                                📦 {product.stock} em estoque
                                            </p>
                                            {isCritical && (
                                                <p className="cart-item-alert">
                                                    ⚠️ Estoque ficará baixo!
                                                </p>
                                            )}
                                        </div>
                                        <div className="cart-item-actions">
                                            <div className="cart-qty-controls">
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => handleQuantityChange(item.productId, -1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <span className="cart-qty-value">{item.quantity}</span>
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => handleQuantityChange(item.productId, 1)}
                                                    disabled={item.quantity >= product.stock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className="cart-item-remove"
                                                onClick={() => onRemoveItem(item.productId)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Add More Button */}
                        <button className="btn-scan-more" onClick={onScanMore}>
                            ➕ Escanear Mais Produtos
                        </button>

                        {/* Order Summary */}
                        <div className="order-summary">
                            <div className="order-summary-row">
                                <span>Total de itens</span>
                                <span>{totalItems}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                            className="btn-confirm"
                            onClick={onCheckout}
                            disabled={cart.length === 0}
                        >
                            Finalizar Venda
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
