import React from 'react';
import Link from 'next/link';
import { getNuvemshopClient } from '@/lib/nuvemshop/server';
import { NuvemshopProduct } from '@/lib/nuvemshop/api';
import PrintQRClient from './PrintQRClient';
import { ArrowLeft, QrCode } from 'lucide-react';

export default async function PrintQRPage() {
    const client = await getNuvemshopClient();

    if (!client) {
        return (
            <div className="p-6 text-center">
                <p>Você não está autenticado.</p>
                <Link href="/api/auth/login" className="text-blue-500 underline">
                    Fazer Login na Nuvemshop
                </Link>
            </div>
        );
    }

    let products: NuvemshopProduct[] = [];
    try {
        products = await client.getProducts(1, 100);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/products" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><QrCode size={20} /> Imprimir QR Code</h3>
                <div style={{ width: 40 }}></div>
            </div>
            <PrintQRClient products={products} />
        </div>
    );
}
