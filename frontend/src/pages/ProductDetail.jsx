import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { ArrowLeft, Package, DollarSign, Hash, Barcode, Image as ImageIcon, Settings } from 'lucide-react';

export default function ProductDetail() {
  const [activeImage, setActiveImage] = useState(null);
  const { reference } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [reference]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const decodedReference = decodeURIComponent(reference);
      const response = await api.get(`/products/${decodedReference}`);
      setProduct(response.data);

      // Set initial active image
      if (response.data.cover && response.data.cover !== 'defaultcover') {
        setActiveImage(`/storage/products/${response.data.reference}/${response.data.cover}`);
      } else if (response.data.images && response.data.images.length > 0) {
        setActiveImage(`/storage/products/${response.data.reference}/${response.data.images[0].image_name}`);
      } else {
        setActiveImage('/images/default-product.png');
      }

    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  };

  const handleThumbnailClick = (imageName) => {
    setActiveImage(`/storage/products/${product.reference}/${imageName}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="error-container">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/dashboard/products')} className="back-button">
            Back to Products
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="product-detail-container">
        {/* Back Button */}
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard/products')} className="back-btn">
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </button>

          <button
            onClick={() => navigate(`/dashboard/products/${encodeURIComponent(product.reference)}/edit`)}
            className="manage-images-btn" // Reuse style for now or create generic 'action-btn'
            style={{ marginRight: '1rem', background: '#f59e0b' }} // Orange/Yellow distinct color
          >
            <Settings size={20} />
            <span>Edit / Delete Product</span>
          </button>

          <button
            onClick={() => navigate(`/dashboard/images/${encodeURIComponent(product.reference)}`)}
            className="manage-images-btn"
          >
            <ImageIcon size={20} />
            <span>Manage Images</span>
          </button>
        </div>

        {/* Product Detail */}
        <div className="product-detail-content">
          {/* Left: Image */}
          {/* Left: Image Gallery */}
          <div className="product-image-section">
            <div className="main-image-container">
              <img
                src={activeImage}
                alt={product.title}
                onError={(e) => e.target.src = '/images/default-product.png'}
                className="main-image"
              />
              {product.qte_stock <= 5 && (
                <div className="stock-badge low">
                  Low Stock
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="thumbnails-grid">
                {/* Add cover if it exists separately, but typically cover is in images list if synced */}
                {product.images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`thumbnail-item ${activeImage.includes(img.image_name) ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(img.image_name)}
                  >
                    <img
                      src={`/storage/products/${product.reference}/${img.image_name}`}
                      alt={`View ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="product-info-section">
            <div className="product-brand-tag">{product.brand?.name || 'N/A'}</div>
            <h1 className="product-title">{product.title}</h1>
            <div className="product-price-large">{formatPrice(product.price)}</div>

            <div className="product-specs">
              <div className="spec-item">
                <Hash size={20} />
                <div>
                  <div className="spec-label">Reference</div>
                  <div className="spec-value">{product.reference}</div>
                </div>
              </div>

              <div className="spec-item">
                <Barcode size={20} />
                <div>
                  <div className="spec-label">Barcode</div>
                  <div className="spec-value">{product.code_bar || 'N/A'}</div>
                </div>
              </div>

              <div className="spec-item">
                <Package size={20} />
                <div>
                  <div className="spec-label">Stock Quantity</div>
                  <div className={`spec-value ${product.qte_stock <= 5 ? 'low-stock' : ''}`}>
                    {product.qte_stock || 0} units
                  </div>
                </div>
              </div>

              <div className="spec-item">
                <DollarSign size={20} />
                <div>
                  <div className="spec-label">Family Code</div>
                  <div className="spec-value">{product.FA_CodeFamille || 'N/A'}</div>
                </div>
              </div>
            </div>

            {product.description && product.description !== 'z' && (
              <div className="product-description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-row">
                <span className="info-label">Category 1:</span>
                <span className="info-value">{product.CL_No1}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Category 2:</span>
                <span className="info-value">{product.CL_No2}</span>
              </div>
              {product.CL_No3 && (
                <div className="info-row">
                  <span className="info-label">Category 3:</span>
                  <span className="info-value">{product.CL_No3}</span>
                </div>
              )}
              {product.CL_No4 && (
                <div className="info-row">
                  <span className="info-label">Category 4:</span>
                  <span className="info-value">{product.CL_No4}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .product-detail-container {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          .back-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 2rem;
          }

          .back-btn:hover {
            border-color: #3498db;
            color: #3498db;
            transform: translateX(-4px);
          }

          .header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .manage-images-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px -1px rgba(52, 152, 219, 0.4);
          }

          .manage-images-btn:hover {
            background: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px -1px rgba(52, 152, 219, 0.5);
          }

          .product-detail-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .product-image-section {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .main-image-container {
             position: relative;
             width: 100%;
             height: 450px;
             border-radius: 12px;
             overflow: hidden;
             background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          }

          .main-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .thumbnails-grid {
             display: grid;
             grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
             gap: 12px;
          }

          .thumbnail-item {
             height: 70px;
             border-radius: 8px;
             overflow: hidden;
             cursor: pointer;
             border: 2px solid transparent;
             transition: all 0.2s;
             background: #f9fafb;
          }

          .thumbnail-item.active {
             border-color: #3498db;
             box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
          }

          .thumbnail-item:hover {
             transform: translateY(-2px);
             box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }

          .thumbnail-item img {
             width: 100%;
             height: 100%;
             object-fit: contain;
             padding: 4px;
          }

          .stock-badge {
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            z-index: 10;
          }

          .stock-badge.low {
            background: #fef2f2;
            color: #dc2626;
            border: 2px solid #fecaca;
          }

          .product-info-section {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .product-brand-tag {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #eff6ff;
            color: #3498db;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            align-self: flex-start;
          }

          .product-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
            line-height: 1.3;
          }

          .product-price-large {
            font-size: 2.5rem;
            font-weight: 700;
            color: #3498db;
            margin: 1rem 0;
          }

          .product-specs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-top: 1rem;
          }

          .spec-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 10px;
            align-items: center;
          }

          .spec-item svg {
            color: #3498db;
            flex-shrink: 0;
          }

          .spec-label {
            font-size: 0.75rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .spec-value {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
          }

          .spec-value.low-stock {
            color: #dc2626;
          }

          .product-description {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 10px;
          }

          .product-description h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.75rem;
          }

          .product-description p {
            color: #4b5563;
            line-height: 1.6;
          }

          .additional-info {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 10px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .info-row:last-child {
            border-bottom: none;
          }

          .info-label {
            font-weight: 500;
            color: #6b7280;
          }

          .info-value {
            font-weight: 600;
            color: #1f2937;
          }

          .loading-container, .error-container {
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

          @media (max-width: 768px) {
            .product-detail-container {
              padding: 1rem;
            }

            .product-detail-content {
              grid-template-columns: 1fr;
              gap: 2rem;
              padding: 1.5rem;
            }

            .product-image-section img {
              height: 300px;
            }

            .product-title {
              font-size: 1.5rem;
            }

            .product-price-large {
              font-size: 2rem;
            }

            .product-specs {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
