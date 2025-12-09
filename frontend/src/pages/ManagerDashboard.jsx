import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
    LayoutDashboard,
    ShoppingCart,
    ClipboardCheck,
    TrendingUp,
    ChevronDown,
    Phone,
    MapPin
} from "lucide-react";
import styles from "../style/ManagerDashboard.module.css";

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("selectedClient");
        if (!stored) {
            navigate("/clients");
        } else {
            setClient(JSON.parse(stored));
            setLoading(false);
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
            </div>
        );
    }

    if (!client) return null;

    // Chart data
    const chartData = [45, 65, 35, 85, 55, 95, 50];
    const monthLabels = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'];

    return (
        <DashboardLayout role="manager" title="Dashboard Overview">
            <div className={styles.dashboard}>
                {/* Stats Row */}
                <div className={styles.statsGrid}>
                    <StatCard
                        icon={<LayoutDashboard size={24} color="#3498db" />}
                        bgColor="#ebf5fb"
                        value={client.ct_intitule}
                        label="Active Client"
                    />
                    <StatCard
                        icon={<ShoppingCart size={24} color="#e74c3c" />}
                        bgColor="#fdedec"
                        value="24"
                        label="Pending Orders"
                    />
                    <StatCard
                        icon={<TrendingUp size={24} color="#27ae60" />}
                        bgColor="#eafaf1"
                        value="$12,450"
                        label="Total Revenue"
                    />
                    <StatCard
                        icon={<ClipboardCheck size={24} color="#f39c12" />}
                        bgColor="#fef9e7"
                        value="5"
                        label="To Validate"
                    />
                </div>

                {/* Charts & Content Area */}
                <div className={styles.contentGrid}>
                    {/* Main Chart Section */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.sectionTitle}>Sales Performance</h3>
                            <div className={styles.timeFilter}>
                                <span>Last 6 Months</span>
                                <ChevronDown size={14} />
                            </div>
                        </div>

                        {/* Chart Visualization */}
                        <div className={styles.chartContainer}>
                            {chartData.map((height, index) => (
                                <div key={index} className={styles.chartBar}>
                                    <div 
                                        className={`${styles.bar} ${
                                            index % 2 === 0 ? styles.barPrimary : styles.barSecondary
                                        }`}
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className={styles.chartLabels}>
                            {monthLabels.map((month, index) => (
                                <span key={index}>{month}</span>
                            ))}
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
                        <div className={styles.contactGrid}>
                            <div className={styles.contactItem}>
                                <Phone size={18} className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <p className={styles.contactLabel}>Phone</p>
                                    <p className={styles.contactValue}>{client.ct_telephone}</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <MapPin size={18} className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <p className={styles.contactLabel}>Address</p>
                                    <p className={styles.contactValue}>{client.ct_adresse}</p>
                                </div>
                            </div>
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