import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { RefreshCw, CheckCircle, Database, Tag, Layers, ArrowRight, Users } from "lucide-react";

export default function ManagerSync() {
    const { api } = useAuth();

    // State for each sync type
    const [status, setStatus] = useState({
        clients: { loading: false, lastSync: null, message: "" },
        brands: { loading: false, lastSync: null, message: "" },
        catalogs: { loading: false, lastSync: null, message: "" },
        products: { loading: false, lastSync: null, message: "" },
    });

    const handleSync = async (type) => {
        setStatus(prev => ({
            ...prev,
            [type]: { ...prev[type], loading: true, message: "" }
        }));

        try {
            const res = await api.post(`/sync/${type}`);
            setStatus(prev => ({
                ...prev,
                [type]: {
                    loading: false,
                    lastSync: res.data.timestamp,
                    message: res.data.message
                }
            }));
        } catch (err) {
            console.error(err);
            setStatus(prev => ({
                ...prev,
                [type]: {
                    loading: false,
                    message: "Sync failed. Please try again.",
                    error: true
                }
            }));
        }
    };

    const SyncCard = ({ type, title, icon, description }) => {
        const currentStatus = status[type];

        return (
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{
                        width: '50px', height: '50px', background: '#e0f2fe', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7',
                        marginBottom: '1.5rem'
                    }}>
                        {icon}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>{title}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>{description}</p>

                    {currentStatus.lastSync && (
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#059669' }}>
                            <CheckCircle size={14} /> Last synced: {currentStatus.lastSync}
                        </div>
                    )}
                    {currentStatus.message && !currentStatus.lastSync && currentStatus.error && (
                        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#dc2626' }}>
                            {currentStatus.message}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => handleSync(type)}
                    disabled={currentStatus.loading}
                    style={{
                        marginTop: '2rem',
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: currentStatus.loading ? '#94a3b8' : '#0ea5e9',
                        color: 'white',
                        fontWeight: 600,
                        cursor: currentStatus.loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'background 0.2s'
                    }}
                >
                    <RefreshCw size={18} className={currentStatus.loading ? "spin" : ""} />
                    {currentStatus.loading ? "Synchronizing..." : "Sync Now"}
                </button>
                <style>{`
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    };

    return (
        <DashboardLayout role="manager" title="Data Synchronization">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#1f2937', fontWeight: 700 }}>External Data Sync</h2>
                    <p style={{ color: '#6b7280' }}>Manually trigger updates from the central database.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    <SyncCard
                        type="clients"
                        title="Clients Database"
                        icon={<Users size={24} />}
                        description="Import and update client records from the central SQL Server database."
                    />
                    <SyncCard
                        type="brands"
                        title="Brands Information"
                        icon={<Tag size={24} />}
                        description="Update brand details, logos, and manufacturer information from the global registry."
                    />
                    <SyncCard
                        type="catalogs"
                        title="Lens Catalogs"
                        icon={<Layers size={24} />}
                        description="Fetch the latest lens catalogs, including new additions and discontinued items."
                    />
                    <SyncCard
                        type="products"
                        title="Product Inventory"
                        icon={<Database size={24} />}
                        description="Synchronize stock levels, pricing, and availability for all linked products."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
