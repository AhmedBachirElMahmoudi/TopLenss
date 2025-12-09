import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Heart, Package } from 'lucide-react';
import styles from '../style/ManagerProducts.module.css'; // Reuse styles

export default function ManagerWishlist() {
    const navigate = useNavigate();
    const { api } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getClient = () => {
        const stored = localStorage.getItem('selectedClient');
        return stored ? JSON.parse(stored) : null;
    };
    const client = getClient();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        if (!client) return;
        try {
            setLoading(true);
            const res = await api.get(`/wishlist/${client.ct_num}`);
            // Map wishlist items to products
            const prods = res.data.map(item => item.product).filter(p => p !== null);
            setProducts(prods);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (e, productRef) => {
        e.stopPropagation();
        // Optimistic
        setProducts(products.filter(p => p.reference !== productRef));

        try {
            await api.post('/wishlist/toggle', {
                client_id: client.ct_num,
                product_reference: productRef
            });
        } catch (error) {
            console.error("Failed from remove", error);
            fetchWishlist(); // Revert
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD'
        }).format(price);
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/images/default-product.png';
    };

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>My Wishlist</h1>
                    <p className={styles.subtitle}>
                        {products.length} items saved
                    </p>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>Loading wishlist...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Heart className={styles.emptyIcon} size={64} color="#e2e8f0" />
                        <h3 className={styles.emptyTitle}>Your wishlist is empty</h3>
                        <p className={styles.emptyText}>
                            Go to Products and click the heart icon to save items here.
                        </p>
                        <button
                            className={styles.browseButton}
                            onClick={() => navigate('/dashboard/products')}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {products.map((product) => (
                            <div
                                key={product.reference}
                                className={styles.card}
                                onClick={() => navigate(`/dashboard/products/${encodeURIComponent(product.reference)}`)}
                            >
                                <div className={styles.imageContainer}>
                                    <button
                                        className={styles.wishlistBtn}
                                        onClick={(e) => removeFromWishlist(e, product.reference)}
                                        title="Remove from wishlist"
                                    >
                                        <Heart
                                            size={20}
                                            color="#ef4444"
                                            fill="#ef4444"
                                        />
                                    </button>

                                    <img
                                        src={product.cover && product.cover !== 'defaultcover'
                                            ? `/storage/products/${product.reference}/${product.cover}`
                                            : '/images/default-product.png'
                                        }
                                        alt={product.title}
                                        className={styles.image}
                                        onError={handleImageError}
                                    />
                                </div>

                                <div className={styles.info}>
                                    <div className={styles.brand}>
                                        {product.brand?.name || 'N/A'}
                                    </div>
                                    <h3 className={styles.productTitle}>{product.title}</h3>
                                    <div className={styles.reference}>
                                        Ref: {product.reference}
                                    </div>
                                    <div className={styles.footer}>
                                        <div className={styles.price}>
                                            {formatPrice(product.price)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
