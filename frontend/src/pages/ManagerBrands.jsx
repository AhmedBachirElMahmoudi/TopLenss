import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function ManagerBrands() {
    const navigate = useNavigate();
    const { api } = useAuth();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await api.get('/brands');
            setBrands(response.data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleBrandClick = (brandId) => {
        navigate(`/dashboard/products?brand_id=${brandId}`);
    };

    return (
        <DashboardLayout>
            <div className="brands-container">
                <div className="brands-header">
                    <h1>Brands</h1>
                    <p className="brands-subtitle">
                        {brands.length} brand{brands.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search brands..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Brands Grid */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading brands...</p>
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="empty-state">
                        <h3>No brands found</h3>
                        <p>Try adjusting your search or sync brands from the database</p>
                    </div>
                ) : (
                    <div className="brands-grid">
                        {filteredBrands.map((brand) => (
                            <div
                                key={brand.brand_id}
                                className="brand-card"
                                onClick={() => handleBrandClick(brand.brand_id)}
                            >
                                <div className="brand-image">
                                    <img
                                        src={brand.cover && brand.cover !== 'defaultcover'
                                            ? `/images/brands/${brand.cover}`
                                            : '/images/default-brand.png'
                                        }
                                        alt={brand.name}
                                        onError={(e) => e.target.src = '/images/default-brand.png'}
                                    />
                                </div>
                                <div className="brand-info">
                                    <h3 className="brand-name">{brand.name}</h3>
                                    {brand.description && (
                                        <p className="brand-description">{brand.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <style jsx>{`
          .brands-container {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
          }

          .brands-header {
            margin-bottom: 2rem;
          }

          .brands-header h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }

          .brands-subtitle {
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
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
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

          .brands-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
          }

          .brand-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .brand-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          }

          .brand-image {
            width: 100%;
            height: 180px;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .brand-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          .brand-card:hover .brand-image img {
            transform: scale(1.05);
          }

          .brand-info {
            padding: 1.25rem;
          }

          .brand-name {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }

          .brand-description {
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .loading-container, .empty-state {
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
            border-top: 4px solid #3498db;
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
            background: white;
            border-radius: 12px;
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
            .brands-container {
              padding: 1rem;
            }

            .brands-grid {
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 1rem;
            }

            .brand-image {
              height: 150px;
            }
          }

          @media (max-width: 480px) {
            .brands-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
            </div>
        </DashboardLayout>
    );
}
