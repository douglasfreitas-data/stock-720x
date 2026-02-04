export default function SuccessScreen({ saleData, onClose }) {
    const { items, customer, paymentMethod, totalItems, totalValue } = saleData

    // Handle both old format (single product) and new format (multiple items)
    const saleItems = items || [{
        product: saleData.product,
        quantity: saleData.quantity,
        oldStock: saleData.oldStock,
        newStock: saleData.newStock
    }]

    const displayTotalItems = totalItems || saleData.quantity
    const displayTotalValue = totalValue || (saleData.product?.price * saleData.quantity)

    return (
        <div className="success-screen">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Venda Realizada!</h2>

            {saleItems.length === 1 ? (
                // Single product display (original style)
                <p className="success-subtitle">
                    {saleItems[0].quantity}x {saleItems[0].product.name}
                </p>
            ) : (
                // Multiple products summary
                <p className="success-subtitle">
                    {displayTotalItems} itens vendidos
                </p>
            )}

            {/* Items List (for multiple products) */}
            {saleItems.length > 1 && (
                <div className="success-items-list">
                    {saleItems.map((item, index) => (
                        <div key={index} className="success-item">
                            <span className="success-item-qty">{item.quantity}x</span>
                            <span className="success-item-name">{item.product.name}</span>
                            <span className="success-item-stock">
                                {item.oldStock} → {item.newStock}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Stock Update Display */}
            {saleItems.length === 1 ? (
                <div className="stock-update">
                    <div className="stock-box">
                        <p className="stock-box-label">Anterior</p>
                        <p className="stock-box-value old">{saleItems[0].oldStock}</p>
                    </div>

                    <span className="stock-operation">−{saleItems[0].quantity}</span>

                    <div className="stock-box">
                        <p className="stock-box-label">Atual</p>
                        <p className="stock-box-value new">{saleItems[0].newStock}</p>
                    </div>
                </div>
            ) : (
                <div className="success-total">
                    <span className="success-total-label">Total</span>
                    <span className="success-total-value">{displayTotalItems} itens</span>
                </div>
            )}

            {/* Customer and Payment (if available) */}
            {customer && (
                <div className="success-details">
                    <p className="success-detail">
                        <span className="success-detail-icon">👤</span>
                        {customer}
                    </p>
                    {paymentMethod && (
                        <p className="success-detail">
                            <span className="success-detail-icon">💳</span>
                            {paymentMethod.toUpperCase()}
                        </p>
                    )}
                </div>
            )}

            {/* Sync Status */}
            <div className="sync-status">
                <div className="sync-item">
                    ✔ Estoque Local
                </div>
                <div className="sync-item">
                    ✔ Nuvemshop
                </div>
            </div>

            <button className="btn-back" onClick={onClose}>
                ← Voltar ao Início
            </button>
        </div>
    )
}
