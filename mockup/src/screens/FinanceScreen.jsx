export default function FinanceScreen({ onClose }) {
    const cards = [
        { icon: '📊', title: 'Em Aberto' },
        { icon: '✅', title: 'Baixar Pagamento' },
        { icon: '📈', title: 'Relatórios' },
        { icon: '💳', title: 'Formas de Pagamento' }
    ]

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">Financeiro</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                <div className="under-construction">
                    <div className="construction-icon">🚧</div>
                    <p className="construction-text">Em construção</p>

                    <div className="finance-cards">
                        {cards.map((card, i) => (
                            <div key={i} className="finance-card">
                                <div className="finance-card-icon">{card.icon}</div>
                                <div className="finance-card-title">{card.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
