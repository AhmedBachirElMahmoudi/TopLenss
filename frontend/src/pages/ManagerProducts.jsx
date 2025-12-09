import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Package, Filter, X, Heart } from 'lucide-react';
import styles from '../style/ManagerProducts.module.css';

export default function ManagerProducts() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { api } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [wishlistRefs, setWishlistRefs] = useState([]);
    const brandId = searchParams.get('brand_id');

    // Get client from storage
    const getClient = () => {
        const stored = localStorage.getItem('selectedClient');
        return stored ? JSON.parse(stored) : null;
    };
    const client = getClient();

    useEffect(() => {
        fetchProducts();
        if (client) fetchWishlist();
    }, [currentPage, search, brandId]);

    const fetchWishlist = async () => {
        if (!client) return;
        try {
            const res = await api.get(`/wishlist/${client.ct_num}/refs`);
            setWishlistRefs(res.data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        }
    };

    const toggleWishlist = async (e, productRef) => {
        e.stopPropagation();
        if (!client) {
            alert("No client selected");
            return;
        }

        // Optimistic update
        const isWished = wishlistRefs.includes(productRef);
        let newRefs;
        if (isWished) {
            newRefs = wishlistRefs.filter(r => r !== productRef);
        } else {
            newRefs = [...wishlistRefs, productRef];
        }
        setWishlistRefs(newRefs);

        try {
            await api.post('/wishlist/toggle', {
                client_id: client.ct_num,
                product_reference: productRef
            });
        } catch (error) {
            console.error("Error toggling wishlist", error);
            // Revert on error
            if (isWished) {
                setWishlistRefs([...newRefs, productRef]);
            } else {
                setWishlistRefs(newRefs.filter(r => r !== productRef));
            }
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                search: search,
                per_page: 20
            };

            if (brandId) {
                params.brand_id = brandId;
            }

            const response = await api.get('/products', { params });

            setProducts(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotal(response.data.total);

            // Fetch brand name if filtering
            if (brandId && response.data.data.length > 0) {
                setSelectedBrand(response.data.data[0].brand);
            } else if (!brandId) {
                setSelectedBrand(null);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleClearBrandFilter = () => {
        // Méthode 1: Nettoyer tous les paramètres d'URL
        setSearchParams({});

        // Méthode 2: Réinitialiser l'état
        setSelectedBrand(null);
        setCurrentPage(1);
        setSearch('');

        // Méthode 3: Naviguer sans paramètres (optionnel)
        navigate('/dashboard/products', { replace: true });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD'
        }).format(price);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/images/default-product.png';
    };

    return (
        <DashboardLayout>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Products Management</h1>
                    <p className={styles.subtitle}>
                        {total} product{total !== 1 ? 's' : ''} total
                        {brandId && ` • Filtered by brand`}
                    </p>
                </div>

                {/* Brand Filter Badge */}
                {selectedBrand && (
                    <div className={styles.brandBadge}>
                        <Filter size={16} />
                        <span>
                            Filtered by: <strong>{selectedBrand.name}</strong>
                        </span>
                        <button
                            onClick={handleClearBrandFilter}
                            title="Clear filter"
                            className={styles.clearFilterButton}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by reference, title, barcode, or brand..."
                        value={search}
                        onChange={handleSearchChange}
                        disabled={loading}
                    />
                    <Search className={styles.searchIcon} />
                </div>

                {/* Products Content */}
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Package className={styles.emptyIcon} size={64} />
                        <h3 className={styles.emptyTitle}>
                            {brandId ? `No products found for this brand` : "No products found"}
                        </h3>
                        <p className={styles.emptyText}>
                            {brandId
                                ? "Try another brand or clear the filter"
                                : "Try adjusting your search or sync products from the database"
                            }
                        </p>
                        {brandId && (
                            <button
                                onClick={handleClearBrandFilter}
                                className={styles.clearFilterButtonLarge}
                            >
                                <X size={18} />
                                Clear Brand Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Products Grid */}
                        <div className={styles.grid}>
                            {products.map((product) => (
                                <div
                                    key={product.reference}
                                    className={styles.card}
                                    onClick={() => navigate(`/dashboard/products/${encodeURIComponent(product.reference)}`)}
                                >
                                    {/* Product Image */}
                                    <div className={styles.imageContainer}>
                                        <button
                                            className={styles.wishlistBtn}
                                            onClick={(e) => toggleWishlist(e, product.reference)}
                                        >
                                            <Heart
                                                size={20}
                                                color={wishlistRefs.includes(product.reference) ? "#ef4444" : "#94a3b8"}
                                                fill={wishlistRefs.includes(product.reference) ? "#ef4444" : "none"}
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
                                        {product.qte_stock <= 5 && (
                                            <div className={`${styles.stockBadge} ${styles.lowStock}`}>
                                                Low Stock
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
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
                                            <div className={`${styles.stock} ${product.qte_stock <= 5 ? styles.lowStockText : ''
                                                }`}>
                                                Stock: {product.qte_stock || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.paginationButton}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                >
                                    Previous
                                </button>

                                <div className={styles.paginationInfo}>
                                    Page {currentPage} of {totalPages}
                                    {brandId && (
                                        <span className={styles.filteredInfo}>
                                            • Filtered
                                        </span>
                                    )}
                                </div>

                                <button
                                    className={styles.paginationButton}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}