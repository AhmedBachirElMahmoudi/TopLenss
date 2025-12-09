import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Mail, Bell, Shield, Save, CheckCircle, AlertCircle } from "lucide-react";

export default function ManagerSettings() {
    const { user, api } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [passwords, setPasswords] = useState({
        current_password: "",
        password: "",
        password_confirmation: ""
    });

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        securityAlerts: true
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (passwords.password !== passwords.password_confirmation) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            // Note: We might need a dedicated endpoint that verifies current password first
            // For now, reusing the change-password endpoint layout or a custom one
            await api.post("/change-password", passwords);
            setSuccess("Password updated successfully.");
            setPasswords({ current_password: "", password: "", password_confirmation: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Shared Styles
    const cardStyle = {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        padding: '1.5rem',
        marginBottom: '2rem'
    };

    const sectionHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #f1f2f6'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        outline: 'none',
        fontSize: '0.95rem'
    };

    return (
        <DashboardLayout role="manager" title="Settings">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Profile Summary */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <User size={20} color="#3498db" />
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>Profile Information</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#7f8c8d', fontSize: '0.9rem' }}>Full Name</label>
                            <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', color: '#2c3e50', fontWeight: 500 }}>
                                {user?.name}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#7f8c8d', fontSize: '0.9rem' }}>Email Address</label>
                            <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', color: '#2c3e50', fontWeight: 500 }}>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Update */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <Shield size={20} color="#e74c3c" />
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>Security</h3>
                    </div>

                    {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} /> {success}</div>}
                    {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={18} /> {error}</div>}

                    <form onSubmit={handlePasswordChange}>
                        {/* <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>Current Password</label>
                            <input
                                type="password"
                                style={inputStyle}
                                value={passwords.current_password}
                                onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                            />
                        </div> */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>New Password</label>
                                <input
                                    type="password"
                                    required
                                    style={inputStyle}
                                    value={passwords.password}
                                    onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    style={inputStyle}
                                    value={passwords.password_confirmation}
                                    onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: loading ? 'wait' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {loading ? 'Updating...' : <><Save size={18} /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preferences */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <Bell size={20} color="#f1c40f" />
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>Notifications</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: '0 0 0.25rem', fontWeight: 500, color: '#374151' }}>Email Notifications</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Receive daily summaries and alerts.</p>
                            </div>
                            <div
                                onClick={() => togglePreference('emailNotifications')}
                                style={{
                                    width: '44px', height: '24px', background: preferences.emailNotifications ? '#3498db' : '#e5e7eb',
                                    borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '2px', left: preferences.emailNotifications ? '22px' : '2px', transition: 'left 0.2s'
                                }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: '0 0 0.25rem', fontWeight: 500, color: '#374151' }}>Security Alerts</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Get notified about logins from new devices.</p>
                            </div>
                            <div
                                onClick={() => togglePreference('securityAlerts')}
                                style={{
                                    width: '44px', height: '24px', background: preferences.securityAlerts ? '#2ecc71' : '#e5e7eb',
                                    borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '2px', left: preferences.securityAlerts ? '22px' : '2px', transition: 'left 0.2s'
                                }}></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
