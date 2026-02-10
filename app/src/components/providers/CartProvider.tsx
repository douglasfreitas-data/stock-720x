'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';

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
    const [isInitialized, setIsInitialized] = useState(false);

    // Carregar do localStorage ao iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Erro ao carregar carrinho:', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Salvar no localStorage sempre que mudar
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    const addToCart = (product: Product, quantity = 1) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.productId === product.id);
            if (existingItem) {
                // Ensure we don't exceed stock if stock information is available
                const maxStock = product.stock || 9999;
                const newQty = Math.min(existingItem.quantity + quantity, maxStock);
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: newQty, product } // Atualiza produto se tiver mudado
                        : item
                );
            } else {
                return [...prev, {
                    productId: product.id,
                    quantity: Math.min(quantity, product.stock || 9999),
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

    // Prevent hydration mismatch by not rendering until initialized
    // or just return empty/initial state until then. 
    // However, for context providers, it's better to just provide the state as is.
    // The components consuming it might need to handle loading state if critical.

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
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
