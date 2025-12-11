import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import {
    ArrowLeft, Package, User, Calendar, DollarSign,
    CheckCircle, Clock, Database, Trash2, AlertTriangle, X, Percent
} from 'lucide-react';

export default function OrderDetail() {
    const { id } = useParams();
    const { api } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            showToast('Failed to load order details', 'error');
            navigate('/dashboard/orders');
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (action) => {
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    const handleConfirm = async () => {
        setShowConfirmModal(false);

        if (confirmAction === 'validate') {
            await executeValidate();
        } else if (confirmAction === 'delete') {
            await executeDelete();
        } else if (confirmAction === 'insert') {
            await executeInsert();
        }
    };

    const executeValidate = async () => {
        try {
            await api.post(`/orders/${id}/validate`);
            showToast('Order validated successfully', 'success');
            fetchOrder();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to validate order', 'error');
        }
    };

    const executeInsert = async () => {
        try {
            await api.post(`/orders/${id}/insert-sql-server`);
            showToast('Order inserted to SQL Server successfully', 'success');
            fetchOrder();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to insert order', 'error');
        }
    };

    const executeDelete = async () => {
        try {
            await api.delete(`/orders/${id}`);
            showToast('Order deleted successfully', 'success');
            navigate('/dashboard/orders');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete order', 'error');
        }
    };

    const getStatusBadge = () => {
        if (!order) return null;

        if (order.insert_status === 1) {
            return (
                <span style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={16} /> Inserted to SQL Server
                </span>
            );
        }
        if (order.order_status === 1) {
            return (
                <span style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Validated
                </span>
            );
        }
        return (
            <span style={{ background: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} /> Pending
            </span>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading order details...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!order) {
        return (
            <DashboardLayout>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Order not found</div>
                </div>
            </DashboardLayout>
        );
    }

    const subtotal = parseFloat(order.price_total) / (1 - (order.remise_global / 100));
    const discountAmount = subtotal * (order.remise_global / 100);

    return (
        <DashboardLayout>
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/dashboard/orders')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <ArrowLeft size={20} /> Back to Orders
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {order.order_number}
                            </h1>
                            {getStatusBadge()}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {order.order_status === 0 && (
                                <>
                                    <button
                                        onClick={() => openConfirmModal('validate')}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <CheckCircle size={18} /> Validate Order
                                    </button>
                                    <button
                                        onClick={() => openConfirmModal('delete')}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Trash2 size={18} /> Delete Order
                                    </button>
                                </>
                            )}

                            {order.order_status === 1 && order.insert_status === 0 && (
                                <button
                                    onClick={() => openConfirmModal('insert')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Database size={18} /> Insert to SQL Server
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
                    {/* Left Column - Order Items */}
                    <div>
                        {/* Order Info Card */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Order Information</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        <User size={16} /> Client
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{order.ct_num}</div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        <Calendar size={16} /> Created
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{new Date(order.created_at).toLocaleString()}</div>
                                </div>
                                {order.validated_at && (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                            <CheckCircle size={16} /> Validated
                                        </div>
                                        <div style={{ fontWeight: '600' }}>{new Date(order.validated_at).toLocaleString()}</div>
                                    </div>
                                )}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        <User size={16} /> Created By
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{order.creator?.name || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                                Order Items ({order.items?.length || 0})
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {order.items?.map((item, index) => (
                                    <div key={index} style={{
                                        padding: '1rem',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.product_title}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Ref: {item.reference_gl}</div>
                                            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                <span style={{ color: '#64748b' }}>Unit Price:</span> <span style={{ fontWeight: '600' }}>{parseFloat(item.price_unit).toFixed(2)} MAD</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Quantity</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.qte}</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                                                {parseFloat(item.price_total).toFixed(2)} MAD
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Summary</h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#64748b' }}>Subtotal</span>
                                    <span style={{ fontWeight: '600' }}>{subtotal.toFixed(2)} MAD</span>
                                </div>

                                {order.remise_global > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Percent size={14} /> Discount ({order.remise_global}%)
                                        </span>
                                        <span style={{ fontWeight: '600', color: '#ef4444' }}>-{discountAmount.toFixed(2)} MAD</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ color: '#64748b' }}>Tax</span>
                                    <span style={{ fontWeight: '600' }}>0.00 MAD</span>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: '1.5rem 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Total</span>
                                <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>
                                    {parseFloat(order.price_total).toFixed(2)} MAD
                                </span>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Order Status</div>
                                <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                                    {order.insert_status === 1 ? 'Inserted to SQL Server' :
                                        order.order_status === 1 ? 'Validated' : 'Pending Validation'}
                                </div>
                                {order.order_status === 0 && (
                                    <div style={{ fontSize: '0.85rem', color: '#f59e0b' }}>
                                        ⚠️ This order needs to be validated
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
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
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: confirmAction === 'delete' ? '#fee2e2' : '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <AlertTriangle size={24} color={confirmAction === 'delete' ? '#ef4444' : '#3b82f6'} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    {confirmAction === 'validate' && 'Validate Order?'}
                                    {confirmAction === 'delete' && 'Delete Order?'}
                                    {confirmAction === 'insert' && 'Insert to SQL Server?'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                            {confirmAction === 'validate' && 'Are you sure you want to validate this order?'}
                            {confirmAction === 'delete' && 'This will restore product stock and cannot be undone.'}
                            {confirmAction === 'insert' && 'This will insert the order to SQL Server.'}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowConfirmModal(false)}
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
                                onClick={handleConfirm}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: confirmAction === 'delete' ? '#ef4444' :
                                        confirmAction === 'validate' ? '#3b82f6' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {confirmAction === 'validate' && 'Validate'}
                                {confirmAction === 'delete' && 'Delete'}
                                {confirmAction === 'insert' && 'Insert'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
