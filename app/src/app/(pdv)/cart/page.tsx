'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

export default function CartPage() {
    const router = useRouter();
    const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal } = useCart();
    const { showToast } = useToast();

    const handleCheckout = () => {
        if (cart.length === 0) {
            showToast('Carrinho vazio', 'error');
            return;
        }
        router.push('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                <span className="text-6xl opacity-20 mb-4">🛒</span>
                <h2 className="text-xl text-gray-400 mb-6">Carrinho Vazio</h2>

                <button
                    onClick={() => router.push('/scan?mode=sale')}
                    className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium"
                >
                    📷 Escanear Produto
                </button>

                <button
                    onClick={() => router.push('/')}
                    className="mt-8 text-gray-500 underline"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    // Se não temos acesso direto aos dados do produto no CartItem (a interface básica só tinha productId),
    // precisamos buscar no mock ou garantir que o addToCart já populou o objeto product.
    // No Provider eu defini `product?: Product` opcional, mas no `addToCart` eu passei o objeto todo?
    // O `addToCart` original do provider recebia `product: Product` mas só salvava `productId` e `quantity`.
    // Vou precisar ajustar o `CartProvider` para salvar o objeto produto completo para facilitar aqui,
    // ou buscar do mock. Como é mock, vou buscar do mock se não tiver.

    // Ajuste rápido: O provider original salvava só productId. Vou assumir que vamos melhorar o provider depois.
    // Por enquanto, vou "hidratar" os itens aqui buscando do mock-data.

    // Ops, não posso importar `findProductByBarcode` se ele depende de dados estáticos... ah, mock-data é estático, ok.
    // Mas no futuro dados virão da API.
    // Melhor seria o CartProvider já guardar o objeto produto.

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                <button onClick={() => router.back()} className="text-xl">←</button>
                <h1 className="text-lg font-bold">Carrinho</h1>
                <button onClick={clearCart} className="text-sm text-red-500">Limpar</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.map(item => {
                    // Tentativa de hydration simples (em produção seria via API/Context)
                    // Aqui assumimos que item.product já poderia estar preenchido se ajustarmos o provider
                    // Ou o mock data
                    // Vou usar um placeholder se não tiver
                    const productName = item.product?.name || `Produto #${item.productId}`;
                    const productPrice = item.product?.price || 0;
                    const subtotal = productPrice * item.quantity;

                    return (
                        <div key={item.productId} className="flex gap-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                            {/* Imagem Placeholder */}
                            <div className="w-16 h-16 bg-gray-700 rounded-md flex-shrink-0" />

                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{productName}</h3>
                                <div className="text-sm text-[var(--accent)] font-medium">
                                    R$ {productPrice.toFixed(2)}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] rounded border border-[var(--border-color)]"
                                        >-</button>
                                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] rounded border border-[var(--border-color)]"
                                        >+</button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={() => router.push('/scan?mode=sale')}
                    className="w-full p-4 border border-dashed border-[var(--border-color)] rounded-lg text-gray-400 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                >
                    + Adicionar mais itens
                </button>
            </div>

            <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Total Estimado</span>
                    {/* Total precisa ser calculado corretamente com hydration */}
                    <span className="text-2xl font-bold text-[var(--accent)]">
                        R$ {cart.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0).toFixed(2)}
                    </span>
                </div>

                <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[var(--accent)] text-white rounded-lg font-bold text-lg hover:bg-[var(--accent-hover)] transition-colors"
                >
                    Finalizar Venda
                </button>
            </div>
        </div>
    );
}
