export default function SuccessScreen({ saleData, onClose }) {
    const { product, quantity, oldStock, newStock } = saleData

    return (
        <div className="success-screen">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Venda Realizada!</h2>
            <p className="success-subtitle">{quantity}x {product.name}</p>

            {/* Stock Update Display */}
            <div className="stock-update">
                <div className="stock-box">
                    <p className="stock-box-label">Anterior</p>
                    <p className="stock-box-value old">{oldStock}</p>
                </div>

                <span className="stock-operation">−{quantity}</span>

                <div className="stock-box">
                    <p className="stock-box-label">Atual</p>
                    <p className="stock-box-value new">{newStock}</p>
                </div>
            </div>

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
