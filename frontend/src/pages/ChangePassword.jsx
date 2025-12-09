import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, AlertCircle } from "lucide-react";

export default function ChangePassword() {
    const { api, user } = useAuth();
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({ password: "", password_confirmation: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (passwords.password !== passwords.password_confirmation) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await api.post("/change-password", passwords);
            // Navigate based on role OR just reload to let auth context re-fetch user status
            window.location.href = user.role === 'admin' ? '/admin' : '/clients';
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f6f7fb 0%, #e2e8f0 100%)'
        }}>
            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: '#e0f2fe', color: '#0ea5e9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }}>
                        <Lock size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>Change Password</h2>
                    <p style={{ color: '#6b7280' }}>For your security, you must change your password before continuing.</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c',
                        padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>New Password</label>
                        <input
                            type="password"
                            value={passwords.password}
                            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                            required
                            placeholder="Min. 8 characters"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>Confirm Password</label>
                        <input
                            type="password"
                            value={passwords.password_confirmation}
                            onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                            required
                            placeholder="Re-enter password"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#4facfe',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'wait' : 'pointer'
                        }}
                    >
                        {loading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
