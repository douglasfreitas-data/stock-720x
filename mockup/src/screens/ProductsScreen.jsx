export default function ProductsScreen({ products, onClose }) {
    const menuItems = [
        { icon: '➕', title: 'Incluir Produto', subtitle: 'Cadastrar novo produto' },
        { icon: '✏️', title: 'Alterar Produto', subtitle: 'Editar produto existente' },
        { icon: '📋', title: 'Lista de Produtos', subtitle: 'Ver todos os produtos' },
        { icon: '🏷️', title: 'Imprimir QR Code', subtitle: 'Gerar etiquetas para prateleira' }
    ]

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                <div className="under-construction">
                    <div className="construction-icon">🚧</div>
                    <p className="construction-text">Em construção</p>

                    <div className="finance-cards">
                        {menuItems.map((item, i) => (
                            <div key={i} className="finance-card">
                                <div className="finance-card-icon">{item.icon}</div>
                                <div className="finance-card-title">{item.title}</div>
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
        </div>
    )
}
