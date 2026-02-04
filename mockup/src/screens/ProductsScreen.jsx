export default function ProductsScreen({ products, onClose, onProductList, onPrintQR }) {
    const menuItems = [
        { icon: '➕', title: 'Incluir Produto', subtitle: 'Cadastrar novo produto', disabled: true },
        { icon: '✏️', title: 'Alterar Produto', subtitle: 'Editar produto existente', disabled: true },
        { icon: '📋', title: 'Lista de Produtos', subtitle: 'Ver todos os produtos', action: onProductList },
        { icon: '🏷️', title: 'Imprimir QR Code', subtitle: 'Gerar PDF para impressão', action: onPrintQR }
    ]

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                <div className="products-menu">
                    {menuItems.map((item, i) => (
                        <div
                            key={i}
                            className={`products-menu-item ${item.disabled ? 'disabled' : ''}`}
                            onClick={() => item.action && item.action()}
                        >
                            <div className="products-menu-icon">{item.icon}</div>
                            <div className="products-menu-content">
                                <div className="products-menu-title">{item.title}</div>
                                <div className="products-menu-subtitle">{item.subtitle}</div>
                            </div>
                            {!item.disabled && <div className="products-menu-arrow">→</div>}
                            {item.disabled && <div className="products-menu-badge">Em breve</div>}
                        </div>
                    ))}
                </div>

                <p style={{
                    marginTop: '24px',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center'
                }}>
                    Integração com Nuvemshop em breve
                </p>
            </div>
        </div>
    )
}
