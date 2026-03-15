'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { ArrowLeft, ShoppingCart, Camera, Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount, isInitialized } = useCart();
    const { showToast } = useToast();

    const handleCheckout = () => {
        if (cart.length === 0) {
            showToast('Carrinho vazio', 'error');
            return;
        }
        router.push('/checkout');
    };

    if (!isInitialized) return null;

    if (cart.length === 0) {
        return (
            <div className="modal-overlay">
                <div className="modal-header">
                    <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                    <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={20} /> Carrinho</h3>
                    <div style={{ width: 40 }}></div>
                </div>
                <div className="modal-body">
                    <div className="cart-empty">
                        <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><ShoppingCart size={48} /></div>
                        <p className="cart-empty-text">Carrinho vazio</p>
                        <button className="btn-scan-more" onClick={() => router.push('/scan?mode=sale')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Camera size={20} /> Escanear Produto
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={20} /> Carrinho</h3>
                <button onClick={clearCart} className="text-sm text-red-500">Limpar</button>
            </div>

            <div className="modal-body">
                {/* Cart Items */}
                <div className="cart-list">
                    {cart.map(item => {
                        const productName = item.product?.name || `Produto #${item.productId}`;
                        const productPrice = item.product?.price || 0;
                        const mainImage = item.product?.image || 'https://via.placeholder.com/100';
                        const sku = item.product?.sku || '-';

                        return (
                            <div key={item.productId} className="cart-item">
                                <img
                                    src={mainImage}
                                    alt={productName}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-info">
                                    <h4 className="cart-item-name">{productName}</h4>
                                    <p className="cart-item-sku">{sku}</p>
                                    <div className="text-sm text-[var(--accent)] font-medium mt-1">
                                        R$ {productPrice.toFixed(2)}
                                    </div>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="cart-qty-controls">
                                        <button
                                            className="cart-qty-btn"
                                            onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="cart-qty-value">{item.quantity}</span>
                                        <button
                                            className="cart-qty-btn"
                                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                            disabled={item.quantity >= (item.product?.stock ?? 9999)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <button
                                        className="cart-item-remove"
                                        onClick={() => removeFromCart(item.productId)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add More Button */}
                <button
                    className="btn-scan-more"
                    onClick={() => router.push('/scan?mode=sale')}
                    style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Plus size={20} /> Escanear Mais Produtos
                </button>

                {/* Order Summary */}
                <div className="order-summary">
                    <div className="order-summary-row">
                        <span>Total de itens</span>
                        <span>{cartCount}</span>
                    </div>
                    <div className="order-summary-row" style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                        <span className="font-bold">Subtotal</span>
                        <span className="text-xl font-bold text-[var(--accent)]">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Finalizar Venda Button */}
                <button
                    className="btn-confirm"
                    onClick={handleCheckout}
                >
                    Finalizar Venda
                </button>
            </div>
        </div>
    );
}
