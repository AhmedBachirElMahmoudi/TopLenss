import { Outlet, Navigate, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { Shield, AlertCircle, LogIn } from "lucide-react";
import styles from "../style/AdminLayout.module.css";

export default function AdminLayout() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Loading state
    if (loading) {
        return <LoadingScreen />;
    }

    // Unauthorized access
    if (!user) {
        return <UnauthorizedScreen 
            title="Authentication Required" 
            message="You need to log in to access the admin dashboard."
            buttonText="Go to Login"
            onAction={() => navigate("/login")}
        />;
    }

    if (user.role !== 'admin') {
        return <UnauthorizedScreen 
            title="Access Denied" 
            message="You don't have permission to access the admin dashboard. This area is restricted to administrators only."
            buttonText="Go to Dashboard"
            onAction={() => navigate("/dashboard")}
        />;
    }

    return (
        <DashboardLayout role="admin" title="Admin Dashboard">
            <Outlet />
        </DashboardLayout>
    );
}

// Loading Screen Component
function LoadingScreen() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <h3>Loading Admin Dashboard</h3>
            <p className={styles.loadingText}>Please wait while we verify your credentials...</p>
            <div className={styles.loadingDots}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
            </div>
        </div>
    );
}

// Enhanced Loading Screen (alternative)
function EnhancedLoadingScreen() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.enhancedLoading}>
                <div className={styles.loadingSpinner} />
                <h3>Securing Admin Portal</h3>
                <p>Verifying administrator credentials and loading secure dashboard...</p>
                <div className={styles.loadingDots}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                </div>
            </div>
        </div>
    );
}

// Unauthorized/Access Denied Screen
function UnauthorizedScreen({ title, message, buttonText, onAction }) {
    return (
        <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
                <AlertCircle size={40} />
            </div>
            <h2 className={styles.errorTitle}>{title}</h2>
            <p className={styles.errorMessage}>{message}</p>
            <button 
                onClick={onAction} 
                className={styles.loginButton}
            >
                <LogIn size={18} style={{ marginRight: '0.5rem' }} />
                {buttonText}
            </button>
        </div>
    );
}