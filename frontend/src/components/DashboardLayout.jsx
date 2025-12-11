import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
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
    RefreshCw,
    X,
    Tag,
    Heart,
    FileText
} from "lucide-react";
import styles from "../style/components/DashboardLayout.module.css";

export default function DashboardLayout({ children, role, title }) {
    const { logout, user } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Menu items based on role
    const MenuItems = role === 'admin' ? [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
        { icon: <UserPlus size={20} />, label: 'Create Manager', path: '/admin/create-user' },
        { icon: <Users size={20} />, label: 'All Users', path: '/admin/users' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
    ] : [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <ShoppingCart size={20} />, label: 'My Cart', path: '/dashboard/cart', badge: cartCount > 0 ? cartCount : null },
        { icon: <FileText size={20} />, label: 'Orders', path: '/dashboard/orders' },
        { icon: <Tag size={20} />, label: 'Brands', path: '/dashboard/brands' },
        { icon: <Package size={20} />, label: 'Products', path: '/dashboard/products' },
        { icon: <Heart size={20} />, label: 'Wishlist', path: '/dashboard/wishlist' },
        { icon: <Package size={20} />, label: 'Images', path: '/dashboard/images/:reference' },
        { icon: <RefreshCw size={20} />, label: 'Synchronization', path: '/dashboard/sync' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
        { icon: <Users size={20} />, label: 'Switch Client', path: '/clients' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile && sidebarOpen) {
                const sidebar = document.querySelector(`.${styles.sidebar}`);
                if (sidebar && !sidebar.contains(event.target)) {
                    setSidebarOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobile, sidebarOpen]);

    return (
        <div className={styles.container}>
            {/* SIDEBAR */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed} ${isMobile && sidebarOpen ? styles.sidebarMobileOpen : ''}`}>
                {/* Logo */}
                <div className={styles.logoContainer}>
                    <div className={styles.logoIcon}>
                        TL
                    </div>
                    <h2 className={`${styles.logoText} ${!sidebarOpen && styles.logoHidden}`}>
                        TopLenss
                    </h2>
                </div>

                {/* Menu */}
                <nav className={styles.menuContainer}>
                    <p className={`${styles.menuTitle} ${!sidebarOpen && styles.menuTitleHidden}`}>
                        Menu
                    </p>

                    <ul className={styles.menuList}>
                        {MenuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={index}>
                                    <a
                                        onClick={() => handleNavigation(item.path)}
                                        className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                                    >
                                        <span className={styles.menuItemContent}>
                                            <span className={styles.menuIcon}>
                                                {item.icon}
                                            </span>
                                            <span className={`${styles.menuItemLabel} ${!sidebarOpen && styles.menuItemLabelHidden}`}>
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span style={{
                                                    marginLeft: 'auto',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    borderRadius: '999px',
                                                    padding: '0 6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    minWidth: '1.25rem',
                                                    textAlign: 'center',
                                                    display: !sidebarOpen ? 'none' : 'block'
                                                }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className={styles.logoutContainer}>
                    <button
                        onClick={logout}
                        className={styles.logoutButton}
                    >
                        <LogOut size={18} />
                        <span className={`${styles.logoutText} ${!sidebarOpen && styles.logoutTextHidden} `}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Overlay for Mobile */}
            {isMobile && sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 99
                    }}
                />
            )}

            {/* MAIN CONTENT */}
            <main className={`${styles.mainContent} ${sidebarOpen ? styles.mainContentExpanded : styles.mainContentCollapsed} `}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            onClick={toggleSidebar}
                            className={styles.menuToggle}
                            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h3 className={styles.pageTitle}>
                            {title || 'Dashboard'}
                        </h3>
                    </div>

                    <div className={styles.headerRight}>
                        <Search
                            size={20}
                            className={styles.headerIcon}
                            onClick={() => console.log('Search clicked')}
                        />

                        <div className={`${styles.headerIcon} ${styles.notificationIcon} `}>
                            <Bell size={20} />
                            <span className={styles.notificationBadge}></span>
                        </div>

                        <div className={styles.userProfile}>
                            <div className={styles.userAvatar}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {!isMobile && (
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>
                                        {user?.name || 'User'}
                                    </span>
                                    <span className={styles.userRole}>
                                        {role === 'admin' ? 'Administrator' : 'Manager'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className={styles.contentArea}>
                    {children}
                </div>
            </main>
        </div>
    );
}