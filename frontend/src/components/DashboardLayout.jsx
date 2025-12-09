import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    UserPlus,
    Settings,
    LogOut,
    Users,
    Search,
    Bell,
    ShoppingCart,
    Package,
    ClipboardCheck,
    Menu,
    RefreshCw
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children, role, title }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Common styles
    const activeColor = "#3498db";
    const sidebarBg = "#2c3e50";
    const sidebarText = "#ecf0f1";

    const MenuItems = role === 'admin' ? [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
        { icon: <UserPlus size={20} />, label: 'Create Manager', path: '/admin/create-user' }, // We might need to handle internal tabs or routes
        { icon: <Users size={20} />, label: 'All Users', path: '/admin/users' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
    ] : [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <ShoppingCart size={20} />, label: 'Orders', path: '/dashboard/orders' },
        { icon: <Package size={20} />, label: 'Products', path: '/dashboard/products' },
        { icon: <ClipboardCheck size={20} />, label: 'Validation', path: '/dashboard/validation' },
        { icon: <RefreshCw size={20} />, label: 'Synchronization', path: '/dashboard/sync' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
        { icon: <Users size={20} />, label: 'Switch Client', path: '/clients', isAction: true },
    ];

    const handleNavigation = (item) => {
        // For now, if path matches current location, do nothing or simple navigation
        // If it is 'create-user' but we are using tabs in Admin... we might need to adjust.
        // To keep it simple for this unifying step, we will assume standard navigation or pass a callback if needed.
        // BUT, since AdminDashboard was tab-based, we should probably keep utilizing the parent's state OR move to route-based.
        // For this step, let's keep it visually consistent.
        if (item.path) navigate(item.path);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9', fontFamily: 'Poppins, sans-serif' }}>

            {/* SIDEBAR */}
            <div style={{
                width: sidebarOpen ? '260px' : '80px',
                background: sidebarBg,
                color: sidebarText,
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100%',
                zIndex: 10,
                transition: 'width 0.3s'
            }}>
                {/* Logo */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ width: '35px', height: '35px', background: activeColor, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>TL</div>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '1px', whiteSpace: 'nowrap', opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s' }}>TopLenss</h2>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, padding: '1.5rem 1rem' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#7f8c8d', marginBottom: '1rem', paddingLeft: '0.5rem', opacity: sidebarOpen ? 1 : 0 }}>Menu</p>

                    {MenuItems.map((item, idx) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={idx}
                                onClick={() => handleNavigation(item)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: isActive ? 'white' : '#bdc3c7',
                                    background: isActive ? '#34495e' : 'transparent',
                                    transition: 'all 0.2s',
                                    marginBottom: '0.5rem',
                                    justifyContent: sidebarOpen ? 'flex-start' : 'center'
                                }}
                                onMouseOver={(e) => !isActive && (e.currentTarget.style.color = 'white')}
                                onMouseOut={(e) => !isActive && (e.currentTarget.style.color = '#bdc3c7')}
                            >
                                {item.icon}
                                {sidebarOpen && <span style={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{item.label}</span>}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        <LogOut size={18} /> {sidebarOpen && "Logout"}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, marginLeft: sidebarOpen ? '260px' : '80px', display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s' }}>

                {/* Header */}
                <header style={{
                    background: 'white',
                    padding: '1rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 5
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Menu size={24} style={{ cursor: 'pointer', color: '#2c3e50' }} onClick={() => setSidebarOpen(!sidebarOpen)} />
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>{title}</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Search size={20} color="#7f8c8d" />
                        <div style={{ position: 'relative' }}>
                            <Bell size={20} color="#7f8c8d" />
                            <span style={{ position: 'absolute', top: -5, right: -5, width: '8px', height: '8px', background: '#e74c3c', borderRadius: '50%' }}></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '35px', height: '35px', background: activeColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div style={{ padding: '2rem', flex: 1 }}>
                    {children}
                </div>

            </div>
        </div>
    );
}
