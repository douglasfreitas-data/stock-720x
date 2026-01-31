import { useState } from 'react'

export default function InventoryScreen({ product, onClose, onSave }) {
    const [stock, setStock] = useState(product.stock)
    const [minStock, setMinStock] = useState(product.minStock)

    const handleSave = () => {
        onSave(product, stock, minStock)
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">Conferir Estoque</h3>
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

                    {/* Current Stock */}
                    <div className="form-section">
                        <label className="form-label">Quantidade em estoque</label>
                        <div className="quantity-row">
                            <button
                                className="qty-btn"
                                onClick={() => setStock(s => Math.max(0, s - 1))}
                                disabled={stock <= 0}
                            >
                                −
                            </button>
                            <span className="qty-value">{stock}</span>
                            <button
                                className="qty-btn"
                                onClick={() => setStock(s => s + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Min Stock */}
                    <div className="form-section">
                        <label className="form-label">Estoque mínimo (alerta de reposição)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={minStock}
                            onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                            min="0"
                            style={{ textAlign: 'center', fontSize: '1.25rem' }}
                        />
                    </div>

                    {/* Status Preview */}
                    <div className="form-section">
                        <label className="form-label">Status</label>
                        <div style={{
                            padding: '16px',
                            background: 'var(--bg-card)',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            {stock === 0 ? (
                                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                                    ⚫ Esgotado
                                </span>
                            ) : stock <= minStock ? (
                                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                                    🔴 Estoque Crítico - Reabastecer!
                                </span>
                            ) : stock <= minStock * 2 ? (
                                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                                    🟡 Estoque Baixo
                                </span>
                            ) : (
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                                    🟢 Estoque OK
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        className="btn-confirm"
                        onClick={handleSave}
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    )
}
