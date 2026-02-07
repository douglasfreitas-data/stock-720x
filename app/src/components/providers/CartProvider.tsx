'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos básicos (adaptados do mockup)
export interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string;
    price: number;
    stock: number;
    minStock: number;
    image: string;
}

export interface CartItem {
    productId: number;
    quantity: number;
    product?: Product;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateCartQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product, quantity = 1) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.productId === product.id);
            if (existingItem) {
                const newQty = Math.min(existingItem.quantity + quantity, product.stock);
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: newQty, product } // Atualiza produto se tiver mudado
                        : item
                );
            } else {
                return [...prev, {
                    productId: product.id,
                    quantity: Math.min(quantity, product.stock),
                    product
                }];
            }
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: number, quantity: number) => {
        setCart(prev => prev.map(item =>
            item.productId === productId
                ? { ...item, quantity }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    // O cálculo do total precisaria dos produtos populados, ou passar o product no cartItem
    // Simplificação: vamos assumir que o cálculo é feito onde tem acesso aos produtos por enquanto
    const cartTotal = cart.reduce((acc, item) => {
        return acc + (item.quantity * (item.product?.price || 0));
    }, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
