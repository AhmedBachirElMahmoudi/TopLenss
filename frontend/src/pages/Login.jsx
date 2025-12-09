import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
    AlertCircle, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff,
    Shield,
    LogIn
} from "lucide-react";
import styles from "../style/Login.module.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            const user = await login(email, password);
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            }
            
            // Redirect based on role
            if (user.role === 'admin') {
                navigate("/admin");
            } else {
                navigate("/clients");
            }
        } catch (err) {
            setError("Incorrect email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Ripple effect for button
    const createRipple = (event) => {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add(styles.ripple);
        
        button.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    };

    return (
        <div className={styles.container}>
            {/* Left Side - Hero / Gradient */}
            <div className={styles.heroSection}>
                {/* Abstract Shapes with animation */}
                <div className={styles.shape1}></div>
                <div className={styles.shape2}></div>
                <div className={styles.shape3}></div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Welcome Back<br />
                        <span style={{ fontSize: '1.2rem', display: 'block', marginTop: '0.5rem' }}>
                            to TopLenss Admin
                        </span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Access your management dashboard to handle orders,<br />
                        clients, and system configurations.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className={styles.formSection}>
                {/* Brand */}
                <div className={styles.brand}>
                    <Shield size={20} />
                    <span>TopLenss</span>
                </div>

                <div className={styles.formContainer}>
                    {/* Form Header */}
                    <div className={styles.formHeader}>
                        <h2 className={styles.formTitle}>Sign In</h2>
                        <p className={styles.formSubtitle}>
                            Enter your credentials to continue
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@toplenss.com"
                                    className={styles.input}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className={`${styles.input} ${styles.passwordInput}`}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.passwordToggle}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className={styles.optionsRow}>
                            <label className={styles.rememberMe}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                                Remember me
                            </label>
                            <a href="#" className={styles.forgotPassword}>
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.submitButton}
                            onClick={createRipple}
                        >
                            <span className={styles.buttonContent}>
                                {isLoading ? (
                                    <>
                                        <div className={styles.loadingSpinner}></div>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        Sign In
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Security Note */}
                    <div className={styles.securityNote}>
                        <span className={styles.securityIcon}>
                            <Shield size={12} />
                        </span>
                        Your credentials are securely encrypted
                    </div>
                </div>
            </div>
        </div>
    );
}