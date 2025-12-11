import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const { showToast } = useToast();
    const [cart, setCart] = useState({}); // { clientId: [items] }
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); // Track if cart loaded from storage

    // Get current client ID from localStorage
    const getCurrentClientId = () => {
        const stored = localStorage.getItem('selectedClient');
        if (stored) {
            try {
                const client = JSON.parse(stored);
                return client.id;
            } catch (e) {
                return 'guest';
            }
        }
        return 'guest';
    };

    // Load cart from local storage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('toplens_cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true); // Mark as loaded
    }, []);

    // Save cart to local storage whenever it changes (but only after initial load)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('toplens_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const getClientCart = () => {
        const clientId = getCurrentClientId();
        return cart[clientId] || [];
    };

    const addToCart = (product, quantity = 1) => {
        const clientId = getCurrentClientId();

        // Check stock availability
        if (!product.qte_stock || product.qte_stock === 0) {
            showToast('This product is out of stock', 'error');
            return;
        }

        setCart(prev => {
            const clientCart = prev[clientId] || [];
            const existingItemIndex = clientCart.findIndex(item => item.product.reference === product.reference);

            let newQuantity = quantity;
            if (existingItemIndex > -1) {
                // Calculate new total quantity
                newQuantity = clientCart[existingItemIndex].quantity + quantity;
            }

            // Check if new quantity exceeds stock
            if (newQuantity > product.qte_stock) {
                showToast(`Only ${product.qte_stock} units available in stock. You already have ${existingItemIndex > -1 ? clientCart[existingItemIndex].quantity : 0} in cart.`, 'warning');
                return prev; // Don't update cart
            }

            let newClientCart;
            if (existingItemIndex > -1) {
                // Update quantity
                newClientCart = [...clientCart];
                newClientCart[existingItemIndex].quantity = newQuantity;
            } else {
                // Add new item
                newClientCart = [...clientCart, { product, quantity }];
            }

            return { ...prev, [clientId]: newClientCart };
        });
        setIsCartOpen(true); // Open cart when item added
    };

    const removeFromCart = (productId) => {
        const clientId = getCurrentClientId();
        setCart(prev => {
            const clientCart = prev[clientId] || [];
            const newClientCart = clientCart.filter(item => item.product.reference !== productId);
            return { ...prev, [clientId]: newClientCart };
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        const clientId = getCurrentClientId();
        if (newQuantity < 1) return;

        setCart(prev => {
            const clientCart = prev[clientId] || [];
            const item = clientCart.find(item => item.product.reference === productId);

            // Check stock availability
            if (item && newQuantity > item.product.qte_stock) {
                showToast(`Only ${item.product.qte_stock} units available in stock`, 'warning');
                return prev; // Don't update
            }

            const newClientCart = clientCart.map(item =>
                item.product.reference === productId ? { ...item, quantity: newQuantity } : item
            );
            return { ...prev, [clientId]: newClientCart };
        });
    };

    const clearCart = () => {
        const clientId = getCurrentClientId();
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[clientId];
            return newCart;
        });
    };

    const cartItems = getClientCart();
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}
