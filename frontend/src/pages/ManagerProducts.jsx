import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function ManagerProducts() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { api } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const brandId = searchParams.get('brand_id');

    useEffect(() => {
        fetchProducts();
    }, [currentPage, search]);

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
        setCurrentPage(1); // Reset to first page on search
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD'
        }).format(price);
    };

    return (
        <DashboardLayout>
            <div className="products-container">
                <div className="products-header">
                    <h1>Products Management</h1>
                    <p className="products-subtitle">
                        {total} product{total !== 1 ? 's' : ''} total
                    </p>
                </div>

                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by reference, title, barcode, or brand..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or sync products from the database</p>
                    </div>
                ) : (
                    <>
                        <div className="products-grid">
                            {products.map((product) => (
                                <div
                                    key={product.reference}
                                    className="product-card"
                                    onClick={() => navigate(`/dashboard/products/${product.reference}`)}
                                >
                                    <div className="product-image">
                                        <img
                                            src={product.cover && product.cover !== 'defaultcover'
                                                ? `/images/products/${product.cover}`
                                                : '/images/default-product.png'
                                            }
                                            alt={product.title}
                                            onError={(e) => e.target.src = '/images/default-product.png'}
                                        />
                                        {product.qte_stock <= 5 && (
                                            <div className="stock-badge low">
                                                Low Stock
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <div className="product-brand">{product.brand?.name || 'N/A'}</div>
                                        <h3 className="product-title">{product.title}</h3>
                                        <div className="product-reference">Ref: {product.reference}</div>
                                        <div className="product-footer">
                                            <div className="product-price">{formatPrice(product.price)}</div>
                                            <div className={`product-stock ${product.qte_stock <= 5 ? 'low' : ''}`}>
                                                Stock: {product.qte_stock || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            <div className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </div>

                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                <style jsx>{`
        .products-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .products-header {
          margin-bottom: 2rem;
        }

        .products-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .products-subtitle {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .search-container {
          position: relative;
          margin-bottom: 2rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .product-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 220px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stock-badge.low {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .product-info {
          padding: 1.25rem;
        }

        .product-brand {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #3498db;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .product-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          min-height: 2.8em;
        }

        .product-reference {
          font-size: 0.8rem;
          color: #6b7280;
          font-family: 'Courier New', monospace;
          margin-bottom: 1rem;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .product-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #3498db;
        }

        .product-stock {
          font-size: 0.85rem;
          font-weight: 600;
          color: #059669;
        }

        .product-stock.low {
          color: #dc2626;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination-btn {
          padding: 0.5rem 1.5rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-1px);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border-radius: 8px;
          font-weight: 500;
          color: #6b7280;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          margin-top: 1rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          color: #d1d5db;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .products-container {
            padding: 1rem;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }

          .product-image {
            height: 180px;
          }
        }

        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
            </div>
        </DashboardLayout>
    );
}
