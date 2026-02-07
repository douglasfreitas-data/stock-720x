'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Scanner from '@/components/Scanner';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { findProductByBarcode } from '@/lib/mock-data';

function ScanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'sale'; // 'sale' or 'inventory'
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const handleScan = (decodedText: string) => {
        console.log('Scanned:', decodedText);

        // Busca produto (mock por enquanto)
        const product = findProductByBarcode(decodedText);

        if (product) {
            if (mode === 'sale') {
                addToCart(product);
                showToast(`${product.name} adicionado!`, 'success');
                router.push('/cart');
            } else {
                // Inventory mode
                showToast(`Produto encontrado: ${product.name}`, 'info');
                // router.push(`/inventory/${product.id}`); // Futuro
            }
        } else {
            showToast('Produto não encontrado', 'error');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 h-full">
            <h1 className="text-xl font-bold mb-6">
                {mode === 'sale' ? 'Escanear para Venda' : 'Inventário'}
            </h1>

            <Scanner onScan={handleScan} />

            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Aponte a câmera para o código de barras</p>
                <p className="mt-2 text-xs opacity-50">Modo: {mode === 'sale' ? 'Venda Rápida' : 'Conferência'}</p>
            </div>

            <button
                onClick={() => router.back()}
                className="mt-auto mb-4 text-gray-400 hover:text-white underline"
            >
                Cancelar e Voltar
            </button>
        </div>
    );
}

export default function ScanPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Carregando scanner...</div>}>
            <ScanContent />
        </Suspense>
    );
}
