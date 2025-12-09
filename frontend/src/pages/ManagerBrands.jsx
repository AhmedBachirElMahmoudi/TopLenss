import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Search, ChevronLeft, ChevronRight, Package, RefreshCw } from 'lucide-react';
import styles from '../style/ManagerBrands.module.css';

export default function ManagerBrands() {
    const navigate = useNavigate();
    const { api } = useAuth();
    
    // États
    const [brandsData, setBrandsData] = useState({
        data: [],           // Les brands de la page courante
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
        from: 0,
        to: 0
    });
    
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Récupérer les brands avec pagination
    useEffect(() => {
        fetchBrands();
    }, [currentPage, search]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: 12,
                search: search || '' // Inclure la recherche même si vide
            };
            
            const response = await api.get('/brands', { params });
            
            // Mettre à jour avec les données de l'API
            setBrandsData({
                data: response.data.data || [],
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                per_page: response.data.per_page || 12,
                total: response.data.total || 0,
                from: response.data.from || 0,
                to: response.data.to || 0
            });
            
        } catch (error) {
            console.error('Error fetching brands:', error);
            console.error('Error response:', error.response?.data);
            
            // En cas d'erreur, réinitialiser les données
            setBrandsData({
                data: [],
                current_page: 1,
                last_page: 1,
                per_page: 12,
                total: 0,
                from: 0,
                to: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBrandClick = (brandId) => {
        if (brandId) {
            navigate(`/dashboard/products?brand_id=${brandId}`);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Réinitialiser à la première page
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= brandsData.last_page) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleRefresh = () => {
        fetchBrands();
    };

    const handleImageError = (e) => {
        if (e.target) {
            e.target.onerror = null;
            e.target.src = '/images/default-brand.png';
        }
    };

    // Calculer l'affichage des résultats
    const getDisplayRange = () => {
        const { from, to, total } = brandsData;
        if (total === 0) return '0 results';
        return `${from}-${to} of ${total}`;
    };

    return (
        <DashboardLayout>
            <div className={styles.container}>
                {/* Header avec bouton refresh */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Brands</h1>
                        <p className={styles.subtitle}>
                            {brandsData.total} brand{brandsData.total !== 1 ? 's' : ''} total
                            {brandsData.total > 0 && ` • Showing ${getDisplayRange()}`}
                        </p>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        className={styles.refreshButton}
                        title="Refresh brands"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search brands by name..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <Search className={styles.searchIcon} />
                </div>

                {/* Brands Content */}
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>Loading brands...</p>
                    </div>
                ) : brandsData.data.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Package className={styles.emptyIcon} size={64} />
                        <h3 className={styles.emptyTitle}>
                            {search ? "No brands found" : "No brands available"}
                        </h3>
                        <p className={styles.emptyText}>
                            {search ? "Try a different search term" : "Add brands to get started"}
                        </p>
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className={styles.clearButton}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Info sur la recherche */}
                        {search && (
                            <div className={styles.searchInfo}>
                                <span>
                                    Showing results for "{search}" • {brandsData.total} found
                                </span>
                                <button 
                                    onClick={() => setSearch('')}
                                    className={styles.clearSearchButton}
                                >
                                    Clear search
                                </button>
                            </div>
                        )}

                        {/* Brands Grid */}
                        <div className={styles.grid}>
                            {brandsData.data.map((brand) => (
                                <div
                                    key={brand.brand_id}
                                    className={styles.card}
                                    onClick={() => handleBrandClick(brand.brand_id)}
                                >
                                    {/* Brand Image */}
                                    <div className={styles.imageContainer}>
                                        <div className={styles.imagePlaceholder}>
                                            {brand.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Si vous avez des images plus tard :
                                        <img
                                            src={brand.cover ? `/images/brands/${brand.cover}` : '/images/default-brand.png'}
                                            alt={brand.name}
                                            className={styles.image}
                                            onError={handleImageError}
                                        />
                                        */}
                                    </div>

                                    {/* Brand Info */}
                                    <div className={styles.info}>
                                        <h3 className={styles.name}>{brand.name}</h3>
                                        {brand.description ? (
                                            <p className={styles.description}>{brand.description}</p>
                                        ) : (
                                            <p className={styles.noDescription}>No description</p>
                                        )}
                                        <div className={styles.brandId}>
                                            ID: {brand.brand_id}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {brandsData.last_page > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.paginationButton}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>

                                <div className={styles.paginationInfo}>
                                    Page {currentPage} of {brandsData.last_page}
                                </div>

                                <button
                                    className={styles.paginationButton}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === brandsData.last_page}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}