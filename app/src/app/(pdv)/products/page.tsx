import Link from 'next/link';
import { ClipboardList, Tag, ArrowLeft, Package } from 'lucide-react';
export default function ProductsMenu() {
    return (
        <div className="home-screen">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} /> Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={20} /> Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="menu-grid" style={{ padding: '0 20px', marginTop: '20px' }}>
                <Link href="/products/list" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <ClipboardList className="menu-card-icon" size={36} color="var(--accent)" />
                        <h2 className="menu-card-title">Lista</h2>
                    </div>
                </Link>

                <Link href="/products/print-qr" className="menu-card decoration-none">
                    <div className="menu-card-row">
                        <Tag className="menu-card-icon" size={36} color="var(--accent)" />
                        <h2 className="menu-card-title">QR Code</h2>
                    </div>
                </Link>
            </div>
        </div>
    );
}
