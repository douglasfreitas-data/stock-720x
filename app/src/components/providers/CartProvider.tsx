'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => boolean;
    removeFromCart: (productId: number) => void;
    updateCartQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    // Inicializa o state de forms síncrona se rodando no browser
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedCart = localStorage.getItem('cart');
                return savedCart ? JSON.parse(savedCart) : [];
            } catch (e) {
                console.error('Erro ao ler carrinho do storage:', e);
                return [];
            }
        }
        return [];
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    // Salvar no localStorage sempre que mudar
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    const addToCart = (product: Product, quantity = 1): boolean => {
        // Validação de estoque Síncrona baseada no state mais recente disponível
        const existingItem = cart.find(item => item.productId === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const maxStock = product.stock ?? 9999;

        if (currentQty + quantity > maxStock || maxStock <= 0) {
            return false; // Indicativo de falha para a UI exibir o erro
        }

        setCart(prev => {
            const prevItem = prev.find(item => item.productId === product.id);
            if (prevItem) {
                const newQty = Math.min(prevItem.quantity + quantity, maxStock);
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: newQty, product }
                        : item
                );
            } else {
                return [...prev, {
                    productId: product.id,
                    quantity: Math.min(quantity, maxStock),
                    product
                }];
            }
        });

        return true;
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: number, quantity: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const maxStock = item.product?.stock ?? 9999;
                return { ...item, quantity: Math.min(Math.max(1, quantity), maxStock) };
            }
            return item;
        }));
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
            cartTotal,
            isInitialized
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
