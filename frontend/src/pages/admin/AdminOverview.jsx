import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, AlertCircle } from "lucide-react";
import styles from "../../style/admin/AdminOverview.module.css";

export default function AdminOverview() {
    const { api } = useAuth();
    const [stats, setStats] = useState({ 
        total_users: 0, 
        total_managers: 0, 
        total_clients: 0 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
            setError("Failed to load dashboard statistics. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loader} />
                <p className={styles.loadingText}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Dashboard Overview</h2>
            
            {error && (
                <div className={styles.error}>
                    <AlertCircle size={18} />
                    <div>
                        <p>{error}</p>
                        <button 
                            onClick={fetchStats} 
                            className={styles.retryButton}
                        >
                            <RefreshCw size={14} /> Retry
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.statsGrid}>
                <StatCard 
                    title="Total Users" 
                    value={stats.total_users} 
                    color="#3498db" 
                />
                <StatCard 
                    title="Managers" 
                    value={stats.total_managers} 
                    color="#9b59b6" 
                />
                <StatCard 
                    title="Clients" 
                    value={stats.total_clients} 
                    color="#2ecc71" 
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className={styles.statCard}>
            <h3 
                className={styles.statValue} 
                style={{ color }}
            >
                {value.toLocaleString()}
            </h3>
            <p className={styles.statTitle}>{title}</p>
        </div>
    );
}