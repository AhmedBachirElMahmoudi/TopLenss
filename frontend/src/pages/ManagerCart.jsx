import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Trash2, Plus, Minus, ShoppingBag, Percent, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManagerCart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const { showToast } = useToast();
    const { api } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discount, setDiscount] = useState(0);

    const handleQuantityChange = (reference, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty > 0) {
            updateQuantity(reference, newQty);
        }
    };

    const openCheckoutModal = () => {
        setDiscount(0);
        setShowDiscountModal(true);
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        setShowDiscountModal(false);

        try {
            // Get selected client from localStorage
            const selectedClient = JSON.parse(localStorage.getItem('selectedClient') || '{}');

            if (!selectedClient.ct_num) {
                showToast('No client selected', 'error');
                setIsProcessing(false);
                return;
            }

            // Prepare order data
            const orderData = {
                ct_num: selectedClient.ct_num,
                items: cartItems.map(({ product, quantity }) => ({
                    reference: product.reference,
                    title: product.title,
                    quantity: quantity,
                    price: parseFloat(product.price)
                })),
                remise_global: parseFloat(discount) || 0
            };

            const response = await api.post('/orders', orderData);

            showToast('Order created successfully!', 'success');
            clearCart();
            navigate('/dashboard/orders');

        } catch (error) {
            console.error('Checkout error:', error);
            showToast(error.response?.data?.message || 'Failed to create order', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <DashboardLayout>
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBag /> My Cart
                    </h1>
                    {cartItems.length > 0 && (
                        <button
                            onClick={clearCart}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Trash2 size={16} /> Clear Cart
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <ShoppingBag size={64} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: '#64748b', marginBottom: '1rem' }}>Your cart is empty</h2>
                        <button
                            onClick={() => navigate('/dashboard/products')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#000',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        {/* Cart Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cartItems.map(({ product, quantity }) => (
                                <div key={product.reference} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        backgroundColor: '#f1f5f9'
                                    }}>
                                        {product.cover ? (
                                            <img
                                                src={`/storage/products/${product.reference}/${product.cover}`}
                                                alt={product.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{product.title}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Ref: {product.reference}</p>
                                        <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>{Number(product.price).toFixed(2)} MAD</p>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                            Stock: {product.qte_stock} units
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                                        <button
                                            onClick={() => handleQuantityChange(product.reference, quantity, -1)}
                                            style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span style={{ fontWeight: '600', minWidth: '1.5rem', textAlign: 'center' }}>{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(product.reference, quantity, 1)}
                                            disabled={quantity >= product.qte_stock}
                                            style={{
                                                border: 'none',
                                                background: quantity >= product.qte_stock ? '#e5e7eb' : 'white',
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                cursor: quantity >= product.qte_stock ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: quantity >= product.qte_stock ? 0.5 : 1
                                            }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{(product.price * quantity).toFixed(2)} MAD</p>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(product.reference)}
                                        style={{ color: '#94a3b8', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.5rem' }}
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div style={{ height: 'fit-content' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '2rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Summary</h2>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ color: '#64748b' }}>Subtotal</span>
                                    <span style={{ fontWeight: '600' }}>{cartTotal.toFixed(2)} MAD</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <span style={{ color: '#64748b' }}>Tax (Estimated)</span>
                                    <span style={{ fontWeight: '600' }}>0.00 MAD</span>
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{cartTotal.toFixed(2)} MAD</span>
                                </div>

                                <button
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: isProcessing ? '#9ca3af' : '#000',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onClick={openCheckoutModal}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Percent /> Apply Discount
                            </h2>
                            <button
                                onClick={() => setShowDiscountModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                Global Discount (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={discount}
                                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                                placeholder="0.00"
                                autoFocus
                            />
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Enter a percentage between 0 and 100
                            </p>
                        </div>

                        <div style={{
                            background: '#f8fafc',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#64748b' }}>Subtotal:</span>
                                <span style={{ fontWeight: '600' }}>{cartTotal.toFixed(2)} MAD</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#64748b' }}>Discount ({discount}%):</span>
                                <span style={{ fontWeight: '600', color: '#ef4444' }}>-{(cartTotal * (discount / 100)).toFixed(2)} MAD</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.75rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total:</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                                    {(cartTotal * (1 - discount / 100)).toFixed(2)} MAD
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowDiscountModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'white',
                                    color: '#000',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
