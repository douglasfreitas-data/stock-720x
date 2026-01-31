export default function HomeScreen({ onVenda, onInventario, onProdutos, onFinanceiro }) {
    return (
        <div className="home-screen">
            {/* Venda */}
            <div className="menu-card" onClick={onVenda}>
                <div className="menu-card-row">
                    <span className="menu-card-icon">🛒</span>
                    <h2 className="menu-card-title">Venda</h2>
                </div>
                <p className="menu-card-subtitle">Registrar venda e baixar estoque</p>
            </div>

            {/* Inventário */}
            <div className="menu-card" onClick={onInventario}>
                <div className="menu-card-row">
                    <span className="menu-card-icon">📦</span>
                    <h2 className="menu-card-title">Inventário</h2>
                </div>
                <p className="menu-card-subtitle">Conferir e ajustar estoque</p>
            </div>

            {/* Produtos */}
            <div className="menu-card" onClick={onProdutos}>
                <div className="menu-card-row">
                    <span className="menu-card-icon">🏷️</span>
                    <h2 className="menu-card-title">Produtos</h2>
                </div>
                <p className="menu-card-subtitle">Cadastro e etiquetas QR</p>
            </div>

            {/* Financeiro */}
            <div className="menu-card" onClick={onFinanceiro}>
                <div className="menu-card-row">
                    <span className="menu-card-icon">💰</span>
                    <h2 className="menu-card-title">Financeiro</h2>
                </div>
                <p className="menu-card-subtitle">Controle de pagamentos</p>
            </div>
        </div>
    )
}
