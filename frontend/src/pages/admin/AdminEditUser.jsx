import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, User as UserIcon, Mail, CheckCircle } from "lucide-react";
import styles from "../../style/admin/AdminEditUser.module.css";

export default function AdminEditUser() {
    const { id } = useParams();
    const { api } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "manager"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get(`/users/${id}`);
                setFormData({
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role
                });
            } catch (err) {
                console.error("Failed to fetch user", err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, api]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await api.put(`/users/${id}`, formData);
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.message || "Failed to update user.");
        } finally {
            setSaving(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigate("/admin/users");
    };

    if (loading) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader} />
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <Link to="/admin/users" className={styles.backLink}>
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Success Modal */}
            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcon}>
                            <CheckCircle size={32} />
                        </div>
                        <h3 className={styles.modalTitle}>Update Successful!</h3>
                        <p className={styles.modalMessage}>
                            The user details have been successfully updated.
                        </p>
                        <button
                            onClick={handleSuccessClose}
                            className={styles.modalButton}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={styles.header}>
                <Link to="/admin/users" className={styles.backNav}>
                    <ArrowLeft size={18} /> Back to Managers
                </Link>
                <h1 className={styles.title}>Edit User: {formData.name}</h1>
            </div>

            {/* Form Card */}
            <div className={styles.card}>
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <div className={styles.inputWrapper}>
                            <UserIcon size={18} className={styles.icon} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.icon} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Role Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Role</label>
                        <select
                            disabled
                            value={formData.role}
                            className={`${styles.select} ${styles.selectDisabled}`}
                        >
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                        <p className={styles.hint}>Role cannot be changed here.</p>
                    </div>

                    {/* Buttons */}
                    <div className={styles.buttonGroup}>
                        <Link to="/admin/users" className={styles.cancelButton}>
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className={styles.submitButton}
                        >
                            {saving ? 'Saving...' : (
                                <>
                                    <Save size={18} /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}