import { useState } from "react";
import {
    Save,
    Bell,
    Shield,
    Sliders,
    Mail,
    Lock,
    ToggleLeft,
    ToggleRight,
    Check
} from "lucide-react";
import styles from "../../style/admin/AdminSettings.module.css";

export default function AdminSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Mock Settings State
    const [settings, setSettings] = useState({
        siteName: "TopLenss",
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        securityAlerts: true,
        marketingEmails: false
    });

    // Password state
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSuccessMessage("Settings saved successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        }, 1000);
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // Handle password update
        alert("Password updated! (This is a demo)");
        setPasswords({ newPassword: "", confirmPassword: "" });
    };

    const getToggleColor = (key, value) => {
        if (key === 'maintenanceMode') {
            return value ? styles.toggleWarning : '';
        }
        if (key === 'allowRegistration' || key === 'securityAlerts') {
            return value ? styles.toggleActive : '';
        }
        return value ? styles.togglePrimary : '';
    };

    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Platform Settings</h1>
                    <p className={styles.pageSubtitle}>Manage system configurations and preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={styles.saveButton}
                >
                    {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className={styles.successMessage}>
                    <Check size={18} /> {successMessage}
                </div>
            )}

            {/* General Settings Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <Sliders size={20} className={styles.iconGeneral} />
                    <h2 className={styles.cardTitle}>General Configuration</h2>
                </div>
                <div className={styles.cardContent}>
                    {/* Site Name */}
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p className={styles.settingLabel}>Site Name</p>
                            <p className={styles.settingDescription}>
                                The name displayed across the platform.
                            </p>
                        </div>
                        <input
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleInputChange}
                            className={styles.inputField}
                        />
                    </div>

                    {/* Maintenance Mode */}
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p className={styles.settingLabel}>Maintenance Mode</p>
                            <p className={styles.settingDescription}>
                                Prevent users from accessing the platform temporarily.
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('maintenanceMode')}
                            className={`${styles.toggleButton} ${getToggleColor('maintenanceMode', settings.maintenanceMode)}`}
                        >
                            {settings.maintenanceMode ? 
                                <ToggleRight size={40} /> : 
                                <ToggleLeft size={40} />
                            }
                        </button>
                    </div>

                    {/* Allow Registration */}
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p className={styles.settingLabel}>Allow User Registration</p>
                            <p className={styles.settingDescription}>
                                Enable new users to sign up via the public page.
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('allowRegistration')}
                            className={`${styles.toggleButton} ${getToggleColor('allowRegistration', settings.allowRegistration)}`}
                        >
                            {settings.allowRegistration ? 
                                <ToggleRight size={40} /> : 
                                <ToggleLeft size={40} />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <Bell size={20} className={styles.iconNotifications} />
                    <h2 className={styles.cardTitle}>Notifications</h2>
                </div>
                <div className={styles.cardContent}>
                    {/* Email Notifications */}
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p className={styles.settingLabel}>Email Notifications</p>
                            <p className={styles.settingDescription}>
                                Receive emails about new user signups and system alerts.
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('emailNotifications')}
                            className={`${styles.toggleButton} ${getToggleColor('emailNotifications', settings.emailNotifications)}`}
                        >
                            {settings.emailNotifications ? 
                                <ToggleRight size={40} /> : 
                                <ToggleLeft size={40} />
                            }
                        </button>
                    </div>

                    {/* Marketing Emails */}
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p className={styles.settingLabel}>Marketing Emails</p>
                            <p className={styles.settingDescription}>
                                Receive updates about new features and promotions.
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('marketingEmails')}
                            className={`${styles.toggleButton} ${getToggleColor('marketingEmails', settings.marketingEmails)}`}
                        >
                            {settings.marketingEmails ? 
                                <ToggleRight size={40} /> : 
                                <ToggleLeft size={40} />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <Shield size={20} className={styles.iconSecurity} />
                    <h2 className={styles.cardTitle}>Security Settings</h2>
                </div>
                <div className={styles.cardContent}>
                    {/* Security Alerts */}
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p className={styles.settingLabel}>Security Alerts</p>
                            <p className={styles.settingDescription}>
                                Get notified of suspicious login attempts.
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('securityAlerts')}
                            className={`${styles.toggleButton} ${getToggleColor('securityAlerts', settings.securityAlerts)}`}
                        >
                            {settings.securityAlerts ? 
                                <ToggleRight size={40} /> : 
                                <ToggleLeft size={40} />
                            }
                        </button>
                    </div>

                    {/* Update Password */}
                    <div className={`${styles.settingRow} ${styles.passwordSection}`}>
                        <div className={styles.passwordHeader}>
                            <Lock size={16} color="#34495e" />
                            <p className={styles.settingLabel}>Update Admin Password</p>
                        </div>
                        
                        <form onSubmit={handleUpdatePassword}>
                            <div className={styles.passwordGrid}>
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="New Password" 
                                    className={styles.passwordInput}
                                />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm Password" 
                                    className={styles.passwordInput}
                                />
                            </div>
                            <button 
                                type="submit"
                                className={styles.updatePasswordButton}
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}