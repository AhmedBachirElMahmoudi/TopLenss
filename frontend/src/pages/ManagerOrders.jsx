import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import { Package, CheckCircle, Clock, Database, Trash2, Eye, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManagerOrders() {
    const { api } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, validated

    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter === 'pending') params.order_status = 0;
            if (filter === 'validated') params.order_status = 1;

            const response = await api.get('/orders', { params });
            setOrders(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            showToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (action, data) => {
        setConfirmAction(action);
        setConfirmData(data);
        setShowConfirmModal(true);
    };

    const handleConfirm = async () => {
        setShowConfirmModal(false);

        if (confirmAction === 'validate') {
            await executeValidate(confirmData);
        } else if (confirmAction === 'delete') {
            await executeDelete(confirmData);
        } else if (confirmAction === 'insert') {
            await executeInsert(confirmData);
        }
    };

    const executeValidate = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/validate`);
            showToast('Order validated successfully', 'success');
            fetchOrders();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to validate order', 'error');
        }
    };

    const executeInsert = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/insert-sql-server`);
            showToast('Order inserted to SQL Server successfully', 'success');
            fetchOrders();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to insert order', 'error');
        }
    };

    const executeDelete = async (orderId) => {
        try {
            await api.delete(`/orders/${orderId}`);
            showToast('Order deleted successfully', 'success');
            fetchOrders();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete order', 'error');
        }
    };



    const getStatusBadge = (order) => {
        if (order.insert_status === 1) {
            return <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600' }}>
                <Database size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Inserted
            </span>;
        }
        if (order.order_status === 1) {
            return <span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600' }}>
                <CheckCircle size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Validated
            </span>;
        }
        return <span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600' }}>
            <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Pending
        </span>;
    };

    return (
        <DashboardLayout>
            <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package /> Orders
                    </h1>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filter === 'all' ? '#000' : 'white',
                                color: filter === 'all' ? 'white' : '#000',
                                border: '2px solid #000',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filter === 'pending' ? '#f59e0b' : 'white',
                                color: filter === 'pending' ? 'white' : '#f59e0b',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('validated')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filter === 'validated' ? '#3b82f6' : 'white',
                                color: filter === 'validated' ? 'white' : '#3b82f6',
                                border: '2px solid #3b82f6',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Validated
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px' }}>
                        <Package size={64} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: '#64748b' }}>No orders found</h2>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {orders.map(order => (
                            <div key={order.id_order} style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            {order.order_number}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            Client: {order.ct_num} | Created: {new Date(order.created_at).toLocaleString()}
                                        </p>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                                            Total: {parseFloat(order.price_total).toFixed(2)} MAD
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                        {getStatusBadge(order)}
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {order.items?.length || 0} items
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {order.order_status === 0 && (
                                        <>
                                            <button
                                                onClick={() => openConfirmModal('validate', order.id_order)}
                                                style={{
                                                    padding: '0.5rem 1rem',
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
                                                <CheckCircle size={16} /> Validate
                                            </button>
                                            <button
                                                onClick={() => openConfirmModal('delete', order.id_order)}
                                                style={{
                                                    padding: '0.5rem 1rem',
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
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </>
                                    )}

                                    {order.order_status === 1 && order.insert_status === 0 && (
                                        <button
                                            onClick={() => openConfirmModal('insert', order.id_order)}
                                            style={{
                                                padding: '0.5rem 1rem',
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
                                            <Database size={16} /> Insert to SQL Server
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate(`/dashboard/orders/${order.id_order}`)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'white',
                                            color: '#000',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Eye size={16} /> View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
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
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    display: 'flex'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                            {confirmAction === 'validate' && 'Are you sure you want to validate this order? This action will mark the order as validated.'}
                            {confirmAction === 'delete' && 'Are you sure you want to delete this order? This will restore the product stock and cannot be undone.'}
                            {confirmAction === 'insert' && 'Are you sure you want to insert this order to SQL Server? Make sure the order is validated first.'}
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
