import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { Mail, Check, Trash2, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
    const { api } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'users', 'create-user', 'settings'

    // Dashboard Stats State
    const [stats, setStats] = useState({ total_users: 0, total_managers: 0, total_clients: 0 });

    // Manager List State
    const [managers, setManagers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loadingManagers, setLoadingManagers] = useState(false);

    // Create User State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [createdUser, setCreatedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Fetch based on activeTab
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
        } else if (activeTab === 'users') {
            fetchManagers();
        }
    }, [activeTab]);

    // Debounced search effect
    useEffect(() => {
        if (activeTab === 'users') {
            const delayDebounceFn = setTimeout(() => {
                fetchManagers();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [search, page]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    const fetchManagers = async () => {
        setLoadingManagers(true);
        try {
            const res = await api.get(`/users?page=${page}&search=${search}`);
            setManagers(res.data.data);
            setLastPage(res.data.last_page);
        } catch (err) {
            console.error("Failed to fetch managers", err);
        } finally {
            setLoadingManagers(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");
        try {
            const res = await api.post("/users", { name, email, role: 'manager' });
            setMessage("User created successfully!");
            setCreatedUser(res.data);
            setName("");
            setEmail("");
        } catch (err) {
            setMessage("Error creating user: " + (err.response?.data?.message || err.message));
            setCreatedUser(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this manager?")) return;
        try {
            await api.delete(`/users/${id}`);
            fetchManagers(); // Refresh list
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    // RENDER CONTENT
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Dashboard Overview</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <StatCard title="Total Users" value={stats.total_users} color="#3498db" />
                            <StatCard title="Managers" value={stats.total_managers} color="#9b59b6" />
                            <StatCard title="Clients" value={stats.total_clients} color="#2ecc71" />
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: '#2c3e50' }}>All Managers</h2>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#95a5a6' }} />
                                <input
                                    type="text"
                                    placeholder="Search managers..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ padding: '0.5rem 0.5rem 0.5rem 2.25rem', borderRadius: '20px', border: '1px solid #dfe6e9', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', color: '#7f8c8d', fontWeight: 600 }}>Name</th>
                                        <th style={{ padding: '1rem', color: '#7f8c8d', fontWeight: 600 }}>Email</th>
                                        <th style={{ padding: '1rem', color: '#7f8c8d', fontWeight: 600 }}>Role</th>
                                        <th style={{ padding: '1rem', color: '#7f8c8d', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingManagers ? (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                                    ) : managers.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No managers found.</td></tr>
                                    ) : (
                                        managers.map(user => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '1rem' }}>{user.name}</td>
                                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ padding: '0.25rem 0.5rem', background: '#d5f5e3', color: '#27ae60', borderRadius: '12px', fontSize: '0.8rem' }}>{user.role}</span>
                                                </td>
                                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                    <button title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f39c12' }}><Edit size={18} /></button>
                                                    <button title="Delete" onClick={() => handleDelete(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ background: 'white', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', opacity: page <= 1 ? 0.5 : 1 }}><ChevronLeft size={16} /></button>
                            <span>Page {page} of {lastPage}</span>
                            <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)} style={{ background: 'white', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', opacity: page >= lastPage ? 0.5 : 1 }}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                );
            case 'create-user':
                return (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {/* Reuse existing create form UI */}
                        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div style={{ background: '#3498db', padding: '1.5rem', color: 'white' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Create New Manager</h2>
                                <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>Add a new manager to the system globally.</p>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                {/* ... Form Logic ... */}
                                {message && (
                                    <div style={{
                                        padding: '1rem',
                                        background: createdUser ? '#f0f9eb' : '#fef0f0',
                                        color: createdUser ? '#67c23a' : '#f56c6c',
                                        borderRadius: '8px',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {createdUser ? <Check size={18} /> : null}
                                        {message}
                                    </div>
                                )}

                                <form onSubmit={handleCreate}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#34495e' }}>Full Name</label>
                                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" required style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#34495e' }}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#95a5a6' }} />
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="manager@example.com" required style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.75rem', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none' }} />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} style={{ padding: '1rem 2rem', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isSubmitting ? 'wait' : 'pointer' }}>
                                        {isSubmitting ? 'Creating...' : 'Create Manager Account'}
                                    </button>
                                </form>

                                {createdUser && (
                                    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                        <h4 style={{ margin: '0 0 1rem', color: '#2c3e50' }}>Creation Summary</h4>
                                        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px dashed #ced4da' }}>
                                            <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {createdUser.user.name}</p>
                                            <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {createdUser.user.email}</p>
                                            <p style={{ margin: '0.25rem 0', color: '#e67e22' }}><strong>Generated Password:</strong> {createdUser.password_preview}</p>
                                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#7f8c8d' }}>* Password has been sent to the user's email.</small>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            case 'settings':
                return <div style={{ textAlign: 'center', padding: '4rem', color: '#95a5a6' }}>Settings Page (Coming Soon)</div>
            default:
                return null;
        }
    };

    return (
        <DashboardLayout role="admin" title="Admin Overview" onNavigate={(path) => {
            // Simple internal routing mapping
            if (path === '/admin') setActiveTab('dashboard');
            else if (path.includes('create-user')) setActiveTab('create-user');
            else if (path.includes('users')) setActiveTab('users');
            else if (path.includes('settings')) setActiveTab('settings');
        }}>
            {renderContent()}
        </DashboardLayout>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: color }}>{value}</h3>
            <p style={{ margin: '0.5rem 0 0', color: '#7f8c8d', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
        </div>
    );
}
