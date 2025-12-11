import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    TrendingUp,
    Heart,
    FileText,
    Loader
} from "lucide-react";
import styles from "../style/ManagerDashboard.module.css";

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const { api } = useAuth();
    const [client, setClient] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        validatedOrders: 0,
        wishlistCount: 0,
        totalRevenue: 0,
        totalOrderItems: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("selectedClient");
        if (!stored) {
            navigate("/clients");
        } else {
            setClient(JSON.parse(stored));
            fetchStats();
        }
    }, [navigate]);

    const fetchStats = async () => {
        try {
            setLoading(true);

            const stored = localStorage.getItem("selectedClient");
            const currentClient = JSON.parse(stored);

            console.log('Current Client:', currentClient);
            console.log('Client ct_num:', currentClient.ct_num);

            // Fetch all data in parallel
            const [productsRes, ordersRes, wishlistRes] = await Promise.all([
                api.get('/products'),
                api.get('/orders', { params: { ct_num: currentClient.ct_num } }),
                api.get(`/wishlist/${currentClient.ct_num}`)
            ]);

            const allOrders = ordersRes.data.data || ordersRes.data || [];
            const products = productsRes.data.data || productsRes.data || [];
            const wishlist = wishlistRes.data.data || wishlistRes.data || [];

            console.log('All Orders from API:', allOrders);
            console.log('Orders count:', allOrders.length);

            // Filter orders by current client (in case backend doesn't filter)
            const orders = allOrders.filter(o => o.ct_num === currentClient.ct_num);

            console.log('Filtered Orders:', orders);
            console.log('Filtered Orders count:', orders.length);

            // Calculate stats
            const pendingOrders = orders.filter(o => o.order_status === 0).length;
            const validatedOrders = orders.filter(o => o.order_status === 1).length;
            const totalRevenue = orders
                .filter(o => o.order_status === 1) // Only validated orders
                .reduce((sum, order) => sum + parseFloat(order.price_total || 0), 0);

            // Count total quantity of all items in all orders
            const totalOrderItems = orders.reduce((sum, order) => {
                const items = order.items || [];
                const orderQty = items.reduce((itemSum, item) => itemSum + (parseInt(item.qte) || 0), 0);
                return sum + orderQty;
            }, 0);

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                pendingOrders,
                validatedOrders,
                wishlistCount: wishlist.length,
                totalRevenue,
                totalOrderItems
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="manager" title="Dashboard Overview">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Loader size={40} color="#3498db" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            </DashboardLayout>
        );
    }

    if (!client) return null;

    return (
        <DashboardLayout role="manager" title="Dashboard Overview">
            <div className={styles.dashboard}>
                {/* Stats Row */}
                <div className={styles.statsGrid}>
                    <StatCard
                        icon={<Package size={24} color="#3498db" />}
                        bgColor="#ebf5fb"
                        value={stats.totalOrderItems}
                        label="Items Ordered"
                    />
                    <StatCard
                        icon={<FileText size={24} color="#9b59b6" />}
                        bgColor="#f4ecf7"
                        value={stats.totalOrders}
                        label="Total Orders"
                    />
                    <StatCard
                        icon={<ShoppingCart size={24} color="#f39c12" />}
                        bgColor="#fef9e7"
                        value={stats.pendingOrders}
                        label="Pending Orders"
                    />
                    <StatCard
                        icon={<TrendingUp size={24} color="#27ae60" />}
                        bgColor="#eafaf1"
                        value={`${stats.totalRevenue.toFixed(2)} MAD`}
                        label="Total Revenue"
                    />
                </div>

                {/* Second Row Stats */}
                <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
                    <StatCard
                        icon={<Heart size={24} color="#e74c3c" />}
                        bgColor="#fdedec"
                        value={stats.wishlistCount}
                        label="Wishlist Items"
                    />
                    <StatCard
                        icon={<LayoutDashboard size={24} color="#16a085" />}
                        bgColor="#e8f8f5"
                        value={stats.validatedOrders}
                        label="Validated Orders"
                    />
                    <StatCard
                        icon={<LayoutDashboard size={24} color="#34495e" />}
                        bgColor="#ecf0f1"
                        value={client.ct_num}
                        label="Client Number"
                    />
                    <StatCard
                        icon={<TrendingUp size={24} color="#e67e22" />}
                        bgColor="#fef5e7"
                        value={stats.validatedOrders > 0 ? (stats.totalRevenue / stats.validatedOrders).toFixed(2) + ' MAD' : '0 MAD'}
                        label="Avg Order Value"
                    />
                </div>

                {/* Charts & Content Area */}
                <div className={styles.contentGrid}>
                    {/* Quick Stats Summary */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.sectionTitle}>Quick Summary</h3>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <SummaryItem
                                    label="Order Completion Rate"
                                    value={stats.totalOrders > 0 ? `${((stats.validatedOrders / stats.totalOrders) * 100).toFixed(1)}%` : '0%'}
                                    color="#27ae60"
                                />
                                <SummaryItem
                                    label="Average Order Value"
                                    value={stats.validatedOrders > 0 ? `${(stats.totalRevenue / stats.validatedOrders).toFixed(2)} MAD` : '0 MAD'}
                                    color="#3498db"
                                />
                                <SummaryItem
                                    label="Pending vs Validated"
                                    value={`${stats.pendingOrders} / ${stats.validatedOrders}`}
                                    color="#f39c12"
                                />
                                <SummaryItem
                                    label="Wishlist Conversion"
                                    value={stats.wishlistCount > 0 && stats.totalOrders > 0 ? `${((stats.totalOrders / stats.wishlistCount) * 100).toFixed(1)}%` : 'N/A'}
                                    color="#9b59b6"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Client Profile Card */}
                    <div className={styles.card}>
                        <div className={styles.clientHeader}>
                            <h3 className={styles.sectionTitle}>Client Details</h3>
                        </div>

                        {/* Client Avatar & Info */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div className={styles.clientAvatar}>
                                {client.ct_intitule?.charAt(0).toUpperCase()}
                            </div>
                            <h4 className={styles.clientName}>{client.ct_intitule}</h4>
                            <p className={styles.clientEmail}>{client.ct_email}</p>
                        </div>

                        {/* Contact Information */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem' }}>
                            <InfoRow label="Client Number" value={client.ct_num} />
                            <InfoRow label="Phone" value={client.ct_telephone || 'N/A'} />
                            <InfoRow label="Email" value={client.ct_email} />
                            <InfoRow label="Address" value={client.ct_adresse || 'N/A'} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// StatCard Component
function StatCard({ icon, bgColor, value, label }) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: bgColor }}>
                {icon}
            </div>
            <div>
                <h4 className={styles.statValue}>{value}</h4>
                <p className={styles.statLabel}>{label}</p>
            </div>
        </div>
    );
}

// SummaryItem Component
function SummaryItem({ label, value, color }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #ecf0f1' }}>
            <span style={{ color: '#7f8c8d', fontSize: '0.95rem' }}>{label}</span>
            <span style={{ color: color, fontWeight: 'bold', fontSize: '1.1rem' }}>{value}</span>
        </div>
    );
}

// InfoRow Component
function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #ecf0f1' }}>
            <span style={{ color: '#95a5a6', fontSize: '0.9rem' }}>{label}</span>
            <span style={{ color: '#2c3e50', fontWeight: '600', fontSize: '0.9rem' }}>{value}</span>
        </div>
    );
}