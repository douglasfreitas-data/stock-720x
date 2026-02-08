import Link from 'next/link';

export default function ProductsMenu() {
    const menuItems = [
        { icon: '➕', title: 'Incluir Produto', subtitle: 'Cadastrar novo produto', disabled: true },
        { icon: '✏️', title: 'Alterar Produto', subtitle: 'Editar produto existente', disabled: true },
        { icon: '📋', title: 'Lista de Produtos', subtitle: 'Ver todos os produtos', href: '/products/list' },
        { icon: '🏷️', title: 'Imprimir QR Code', subtitle: 'Gerar PDF para impressão', href: '/products/print-qr' }
    ];

    return (
        <div className="products-screen p-4">
            <header className="flex items-center gap-3 mb-6">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Voltar</Link>
                <h1 className="text-xl font-bold text-white">Produtos</h1>
            </header>

            <div className="products-menu">
                {menuItems.map((item, i) => (
                    item.disabled ? (
                        <div key={i} className="products-menu-item disabled">
                            <div className="products-menu-icon">{item.icon}</div>
                            <div className="products-menu-content">
                                <div className="products-menu-title">{item.title}</div>
                                <div className="products-menu-subtitle">{item.subtitle}</div>
                            </div>
                            <div className="products-menu-badge">Em breve</div>
                        </div>
                    ) : (
                        <Link key={i} href={item.href!} className="products-menu-item decoration-none">
                            <div className="products-menu-icon">{item.icon}</div>
                            <div className="products-menu-content">
                                <div className="products-menu-title">{item.title}</div>
                                <div className="products-menu-subtitle">{item.subtitle}</div>
                            </div>
                            <div className="products-menu-arrow">→</div>
                        </Link>
                    )
                ))}
            </div>
        </div>
    );
}
