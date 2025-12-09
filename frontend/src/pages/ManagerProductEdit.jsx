import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { ArrowLeft, Save, Trash2, AlertCircle, X } from 'lucide-react';
import styles from '../style/ManagerProductEdit.module.css';

export default function ManagerProductEdit() {
    const { reference } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [images, setImages] = useState([]); // Added images state

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState(null); // 'product' or 'image'
    const [itemToDelete, setItemToDelete] = useState(null); // imageId or null

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        qte_stock: '',
        code_bar: '',
        FA_CodeFamille: '',
        CL_No1: '',
        CL_No2: '',
        CL_No3: '',
        CL_No4: ''
    });

    useEffect(() => {
        if (reference) fetchProduct();
    }, [reference]);

    const fetchProduct = async () => {
        try {
            const decodedRef = decodeURIComponent(reference);
            const res = await api.get(`/products/${encodeURIComponent(decodedRef)}`);
            const p = res.data;
            setFormData({
                title: p.title || '',
                description: p.description || '',
                price: p.price || '',
                qte_stock: p.qte_stock || '',
                code_bar: p.code_bar || '',
                FA_CodeFamille: p.FA_CodeFamille || '',
                CL_No1: p.CL_No1 || '',
                CL_No2: p.CL_No2 || '',
                CL_No3: p.CL_No3 || '',
                CL_No4: p.CL_No4 || ''
            });
            setImages(p.images || []); // Set images
        } catch (error) {
            console.error("Failed to fetch product", error);
            // navigate('/dashboard/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Pending: Implement Update endpoint if user wants full update capability. 
            // Currently backend might not support PUT /products/{ref} fully yet, 
            // but we are creating the UI structure first as requested.
            // Assuming endpoint exists or will exist:
            // await api.put(`/products/${reference}`, formData);
            alert("Update feature currently requires backend implementation step.");
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteImage = (imageId) => {
        setDeleteType('image');
        setItemToDelete(imageId);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        setDeleteType('product');
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (deleteType === 'image') {
            try {
                await api.delete(`/products/images/${itemToDelete}`);
                setImages(prev => prev.filter(img => img.id !== itemToDelete));
                setShowDeleteModal(false);
            } catch (error) {
                console.error("Failed to delete image", error);
                alert("Failed to delete image");
            }
        } else if (deleteType === 'product') {
            setDeleting(true);
            try {
                await api.delete(`/products/${encodeURIComponent(reference)}`);
                navigate('/dashboard/products');
            } catch (error) {
                console.error("Delete failed", error);
                alert("Delete failed");
                setDeleting(false);
                setShowDeleteModal(false);
            }
        }
    };

    if (loading) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => navigate('/dashboard/products')} className={styles.backButton}>
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 className={styles.title}>Edit Product: {reference}</h1>
                </div>

                <div className={styles.content}>
                    <form onSubmit={handleSave} className={styles.form}>
                        {/* Basic Info */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Basic Information</h2>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input name="title" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Price</label>
                                    <input name="price" type="number" value={formData.price} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Stock</label>
                                    <input name="qte_stock" type="number" value={formData.qte_stock} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.actions}>
                            <button type="submit" className={styles.saveButton} disabled={saving}>
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>

                    {/* Image Management */}
                    <div className={styles.section} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h2 className={styles.sectionTitle}>Manage Images</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {images.map(img => (
                                <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <img
                                        src={`/storage/products/${reference}/${img.image_name}`}
                                        alt={img.image_name}
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                    />
                                    <button
                                        onClick={() => handleDeleteImage(img.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px',
                                            cursor: 'pointer'
                                        }}
                                        title="Delete Image"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {img.is_primary && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '5px',
                                            left: '5px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            Cover
                                        </div>
                                    )}
                                </div>
                            ))}
                            {images.length === 0 && <p style={{ color: '#64748b' }}>No images found.</p>}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className={styles.dangerZone}>
                        <h2 className={styles.dangerTitle}>Danger Zone</h2>
                        <p className={styles.dangerText}>
                            Deleting this product will permanently remove it from the database and delete all associated images from storage.
                        </p>
                        <button onClick={handleDelete} className={styles.deleteButton} disabled={deleting}>
                            <Trash2 size={18} /> {deleting ? 'Deleting...' : 'Delete Product'}
                        </button>
                    </div>
                </div>

                {/* Modal */}
                {showDeleteModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h3>Confirm Deletion</h3>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                {deleteType === 'product' ? (
                                    <p>
                                        Are you sure you want to delete this product?
                                        <br />
                                        <strong>This action cannot be undone.</strong>
                                        <br />
                                        It will delete the product record and all {images.length} associated images.
                                    </p>
                                ) : (
                                    <p>
                                        Are you sure you want to delete this image?
                                        <br />
                                        This will remove it from the server immediately.
                                    </p>
                                )}
                            </div>
                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.buttonSecondary}
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={styles.buttonDanger}
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
