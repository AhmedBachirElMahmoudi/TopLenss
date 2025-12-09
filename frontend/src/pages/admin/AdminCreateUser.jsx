import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, Check } from "lucide-react";
import styles from "../../style/admin/AdminCreateUser.module.css";

export default function AdminCreateUser() {
    const { api } = useAuth();

    // Create User State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [createdUser, setCreatedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Create New Manager</h2>
                    <p className={styles.subtitle}>Add a new manager to the system globally.</p>
                </div>

                <div className={styles.content}>
                    {message && (
                        <div className={createdUser ? styles.messageSuccess : styles.messageError}>
                            {createdUser && <Check size={18} />}
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleCreate}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="e.g. John Doe" 
                                required 
                                className={styles.input}
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.icon} />
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="manager@example.com" 
                                    required 
                                    className={styles.inputWithIcon}
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className={styles.button}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Manager Account'}
                        </button>
                    </form>

                    {createdUser && (
                        <div className={styles.summary}>
                            <h4 className={styles.summaryTitle}>Creation Summary</h4>
                            <div className={styles.summaryContent}>
                                <p className={styles.summaryText}>
                                    <strong>Name:</strong> {createdUser.user.name}
                                </p>
                                <p className={styles.summaryText}>
                                    <strong>Email:</strong> {createdUser.user.email}
                                </p>
                                <p className={`${styles.summaryText} ${styles.highlight}`}>
                                    <strong>Generated Password:</strong> {createdUser.password_preview}
                                </p>
                                <small className={styles.note}>
                                    * Password has been sent to the user's email.
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}