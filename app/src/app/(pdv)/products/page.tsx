import Link from 'next/link';
import { Plus, Edit2, ClipboardList, Tag, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ProductsMenu() {
    const menuItems = [
        { icon: <Plus size={24} />, title: 'Incluir Produto', subtitle: 'Cadastrar novo produto', disabled: true },
        { icon: <Edit2 size={24} />, title: 'Alterar Produto', subtitle: 'Editar produto existente', disabled: true },
        { icon: <ClipboardList size={24} />, title: 'Lista de Produtos', subtitle: 'Ver todos os produtos', href: '/products/list' },
        { icon: <Tag size={24} />, title: 'Imprimir QR Code', subtitle: 'Gerar PDF para impressão', href: '/products/print-qr' }
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={20} /> Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
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
                                <div className="products-menu-arrow"><ArrowRight size={20} /></div>
                            </Link>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}
