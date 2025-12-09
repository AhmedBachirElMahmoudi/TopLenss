import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, X, Eye, Check, AlertCircle, FolderOpen, Image as ImageIcon, Loader } from 'lucide-react';
import styles from '../style/ManagerImagesProducts.module.css';
import DashboardLayout from '../components/DashboardLayout';

export default function ManagerImagesProducts() {
    const { reference } = useParams();
    const { api } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderUploadModal, setShowFolderUploadModal] = useState(false);
    const [imageType, setImageType] = useState('cover');
    const [makePrimary, setMakePrimary] = useState(false);
    const [folderFiles, setFolderFiles] = useState([]); // Fichiers du dossier sélectionné
    const [referencePattern, setReferencePattern] = useState('{reference}-cat-m');
    const [uploadResults, setUploadResults] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchImages();
    }, [reference]);

    const fetchImages = async () => {
        if (!reference) return;
        try {
            setLoading(true);
            const response = await api.get(`/products/${encodeURIComponent(reference)}/images`);
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sélectionner des fichiers individuels
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    // Sélectionner un dossier COMPLET
    const handleFolderSelect = (e) => {
        const files = Array.from(e.target.files);
        setFolderFiles(files);

        // Essayer de deviner le pattern automatiquement
        if (files.length > 0) {
            const firstFileName = files[0].name;

            // Détecter automatiquement le pattern
            // Exemple: "889652002606-cat-m.jpg" -> "{reference}-cat-m"
            // Exemple: "889652002606-front-m.jpg" -> "{reference}-front-m"

            // Pattern 1: {reference}-cat-m.jpg
            const catPatternMatch = firstFileName.match(/^([a-zA-Z0-9_]+)-cat-([a-z])\./i);
            if (catPatternMatch) {
                setReferencePattern(`{reference}-cat-${catPatternMatch[2]}`);
            }
            // Pattern 2: {reference}-front-m.jpg
            const frontPatternMatch = firstFileName.match(/^([a-zA-Z0-9_]+)-front-([a-z])\./i);
            if (frontPatternMatch) {
                setReferencePattern(`{reference}-front-${frontPatternMatch[2]}`);
            }
            // Pattern 3: {reference}_cat_m.jpg
            const underscorePatternMatch = firstFileName.match(/^([a-zA-Z0-9_]+)_cat_([a-z])\./i);
            if (underscorePatternMatch) {
                setReferencePattern(`{reference}_cat_${underscorePatternMatch[2]}`);
            }
        }
    };

    // Upload de fichiers individuels
    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            setUploading(true);
            const formData = new FormData();

            selectedFiles.forEach(file => {
                formData.append('images[]', file);
            });

            formData.append('image_type', imageType);
            if (makePrimary) {
                formData.append('is_primary', '1');
            }

            const response = await api.post(`/products/${reference}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Rafraîchir la liste
            fetchImages();
            setSelectedFiles([]);
            setShowUploadModal(false);
            setImageType('cover');
            setMakePrimary(false);

            console.log(`✅ Successfully uploaded ${response.data.images.length} image(s)`);
        } catch (error) {
            console.error('Upload error:', error);
            // Consider adding a UI toast/error message here instead of alert
        } finally {
            setUploading(false);
        }
    };

    // Upload d'un dossier COMPLET avec Chunking pour éviter l'erreur 413 Payload Too Large
    const handleFolderUpload = async () => {
        if (folderFiles.length === 0) {
            setUploadResults({
                error_count: 0,
                success_count: 0,
                results: [{
                    status: 'error',
                    file: 'Validation',
                    message: 'Please select a folder first before clicking Upload.'
                }]
            });
            return;
        }

        const CHUNK_SIZE = 10; // Nombre de fichiers par requête
        const totalFiles = folderFiles.length;
        const totalChunks = Math.ceil(totalFiles / CHUNK_SIZE);

        let combinedResults = {
            success_count: 0,
            error_count: 0,
            results: []
        };

        try {
            setUploading(true);
            setUploadProgress(0);

            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, totalFiles);
                const chunk = folderFiles.slice(start, end);

                const formData = new FormData();
                chunk.forEach(file => {
                    formData.append('images[]', file);
                });
                formData.append('reference_pattern', referencePattern);
                formData.append('batch_mode', 'true');

                try {
                    const response = await api.post('/products/images/batch-upload-folder', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        // On ne peut pas facilement suivre la progression globale exacte par octet avec Axios en séquentiel
                        // donc on met à jour la progression par "nombre de chunks complétés"
                    });

                    // Aggregate results
                    combinedResults.success_count += response.data.success_count || 0;
                    combinedResults.error_count += response.data.error_count || 0;
                    if (response.data.results) {
                        combinedResults.results = [...combinedResults.results, ...response.data.results];
                    }

                } catch (chunkError) {
                    console.error(`Error uploading chunk ${i + 1}:`, chunkError);
                    combinedResults.error_count += chunk.length;
                    combinedResults.results.push({
                        status: 'error',
                        file: `Batch Chunk ${i + 1}`,
                        message: `Failed to upload files ${start + 1} to ${end}: ` + (chunkError.response?.data?.message || chunkError.message)
                    });
                }

                // Update Progress by chunk
                const percent = Math.round(((i + 1) / totalChunks) * 100);
                setUploadProgress(percent);
            }

            setUploadResults(combinedResults);

            // Rafraîchir la liste des images si on est sur une page produit
            if (reference && reference !== ':reference') {
                fetchImages();
            }

        } catch (error) {
            console.error('Folder upload fatal error:', error);
            setUploadResults({
                error_count: 1,
                success_count: 0,
                results: [{
                    status: 'error',
                    file: 'Critical Error',
                    message: error.message
                }]
            });
        } finally {
            setUploading(false);
            // setUploadProgress(0); // Keep 100% visible
        }
    };

    const handleSetPrimary = async (imageId) => {
        try {
            await api.put(`/products/images/${imageId}`, {
                is_primary: true
            });
            fetchImages();
        } catch (error) {
            console.error('Error setting primary image:', error);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUploadConfirmOpen, setIsUploadConfirmOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    const handleDeleteClick = (image) => {
        setImageToDelete(image);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        try {
            await api.delete(`/products/images/${imageToDelete.id}`);
            fetchImages();
            setIsDeleteModalOpen(false);
            setImageToDelete(null);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    // Kept for compatibility if called directly, but UI should use handleDeleteClick
    const handleDeleteImage = (id) => {
        // Find image object if we only have ID (optional, but better to pass object)
        const img = images.find(i => i.id === id);
        if (img) handleDeleteClick(img);
    };

    const handleImageTypeChange = async (imageId, newType) => {
        try {
            await api.put(`/products/images/${imageId}`, {
                image_type: newType
            });
            fetchImages();
        } catch (error) {
            console.error('Error updating image type:', error);
        }
    };

    const getImageUrl = (imageName) => {
        return `/storage/products/${reference}/${imageName}`;
    };

    const getImageTypeColor = (type) => {
        const colors = {
            cover: '#10b981',
            front: '#3b82f6',
            side: '#8b5cf6',
            perspective: '#f59e0b',
            detail: '#ef4444',
            other: '#6b7280'
        };
        return colors[type] || colors.other;
    };

    // Fonction pour extraire la référence du nom de fichier
    const extractReferenceFromFileName = (fileName) => {
        // Selon le pattern, extraire la référence
        const pattern = referencePattern;

        if (pattern.includes('{reference}-cat-')) {
            const match = fileName.match(/^([a-zA-Z0-9_]+)-cat-/);
            return match ? match[1] : null;
        } else if (pattern.includes('{reference}-front-')) {
            const match = fileName.match(/^([a-zA-Z0-9_]+)-front-/);
            return match ? match[1] : null;
        } else if (pattern.includes('{reference}_cat_')) {
            const match = fileName.match(/^([a-zA-Z0-9_]+)_cat_/);
            return match ? match[1] : null;
        }

        return null;
    };

    return (
        <DashboardLayout>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Product Images</h1>
                        <p className={styles.subtitle}>Reference: {reference}</p>
                    </div>
                </div>

                {/* Images Grid */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading images...</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ImageIcon size={64} className={styles.emptyIcon} />
                        <h3>No images found</h3>
                        <p>Upload images to get started</p>
                        <div className={styles.emptyActions}>
                            <button
                                className={styles.buttonPrimary}
                                onClick={() => setShowUploadModal(true)}
                            >
                                <Upload size={18} />
                                Upload Images
                            </button>
                            <button
                                className={styles.buttonSecondary}
                                onClick={() => setShowFolderUploadModal(true)}
                            >
                                <FolderOpen size={18} />
                                Upload Complete Folder
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {images.map((image) => (
                            <div key={image.id} className={styles.imageCard}>
                                <div className={styles.imageContainer}>
                                    <img
                                        src={getImageUrl(image.image_name)}
                                        alt={image.file_name}
                                        className={styles.image}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-product.png';
                                        }}
                                    />
                                    {image.is_primary && (
                                        <div className={styles.primaryBadge}>
                                            <Check size={14} />
                                            Primary
                                        </div>
                                    )}
                                    <div
                                        className={styles.typeBadge}
                                        style={{ backgroundColor: getImageTypeColor(image.image_type) }}
                                    >
                                        {image.image_type}
                                    </div>
                                </div>

                                <div className={styles.imageInfo}>
                                    <p className={styles.fileName}>{image.file_name}</p>
                                    <div className={styles.fileDetails}>
                                        <span>{(image.file_size / 1024).toFixed(1)} KB</span>
                                        <span>{new Date(image.uploaded_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className={styles.actions}>
                                        <select
                                            value={image.image_type}
                                            onChange={(e) => handleImageTypeChange(image.id, e.target.value)}
                                            className={styles.typeSelect}
                                        >
                                            <option value="cover">Cover</option>
                                            <option value="front">Front</option>
                                            <option value="side">Side</option>
                                            <option value="perspective">Perspective</option>
                                            <option value="detail">Detail</option>
                                            <option value="other">Other</option>
                                        </select>

                                        {!image.is_primary && (
                                            <button
                                                className={styles.setPrimaryBtn}
                                                onClick={() => handleSetPrimary(image.id)}
                                            >
                                                Set as Primary
                                            </button>
                                        )}

                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteImage(image.id)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal pour upload de fichiers individuels */}
                {showUploadModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h3>Upload Individual Images</h3>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFiles([]);
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.uploadArea}>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className={styles.fileInput}
                                    />
                                    <label htmlFor="imageUpload" className={styles.uploadLabel}>
                                        <Upload size={48} />
                                        <p>Click to select images</p>
                                        <p className={styles.uploadHint}>PNG, JPG, GIF, WEBP up to 10MB each</p>
                                    </label>

                                    {selectedFiles.length > 0 && (
                                        <div className={styles.selectedFiles}>
                                            <h4>Selected Files ({selectedFiles.length})</h4>
                                            <ul>
                                                {selectedFiles.map((file, index) => (
                                                    <li key={index} title={file.name}>
                                                        {file.name.length > 40
                                                            ? file.name.substring(0, 40) + '...'
                                                            : file.name
                                                        } ({(file.size / 1024).toFixed(0)} KB)
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.uploadOptions}>
                                    <div className={styles.formGroup}>
                                        <label>Image Type</label>
                                        <select
                                            value={imageType}
                                            onChange={(e) => setImageType(e.target.value)}
                                            className={styles.select}
                                        >
                                            <option value="cover">Cover (Principal)</option>
                                            <option value="front">Front View</option>
                                            <option value="side">Side View</option>
                                            <option value="perspective">Perspective</option>
                                            <option value="detail">Detail</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            id="makePrimary"
                                            checked={makePrimary}
                                            onChange={(e) => setMakePrimary(e.target.checked)}
                                        />
                                        <label htmlFor="makePrimary">
                                            <Check size={14} />
                                            Set as primary image (cover)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.buttonSecondary}
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFiles([]);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={styles.buttonPrimary}
                                    onClick={handleUpload}
                                    disabled={selectedFiles.length === 0 || uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader size={16} className={styles.spinnerIcon} />
                                            Uploading...
                                        </>
                                    ) : 'Upload Images'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal pour upload d'un dossier COMPLET */}
                {showFolderUploadModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h3>Upload Complete Folder</h3>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => {
                                        setShowFolderUploadModal(false);
                                        setFolderFiles([]);
                                        setUploadResults(null);
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                {!uploadResults ? (
                                    <>
                                        <div className={styles.uploadArea}>
                                            <input
                                                type="file"
                                                id="folderUpload"
                                                webkitdirectory="true"
                                                directory="true"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFolderSelect}
                                                className={styles.fileInput}
                                            />
                                            <label htmlFor="folderUpload" className={styles.uploadLabel}>
                                                <FolderOpen size={48} />
                                                <p>Click to select a FOLDER</p>
                                                <p className={styles.uploadHint}>
                                                    Will upload images and automatically match them to products by <strong>Barcode</strong> or <strong>Reference</strong> in the filename.<br />
                                                    Existing images with the same name will be <strong>updated</strong>. New ones will be <strong>inserted</strong>.
                                                </p>
                                            </label>

                                            {folderFiles.length > 0 && (
                                                <div className={styles.selectedFiles}>
                                                    <h4>
                                                        Selected Folder
                                                        <span className={styles.fileCount}> ({folderFiles.length} files)</span>
                                                    </h4>
                                                    <div className={styles.folderInfo}>
                                                        {/* Info details */}
                                                        <p>
                                                            <strong>Total size:</strong>
                                                            {(folderFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.patternSection}>
                                            <div className={styles.formGroup}>
                                                <label>File Name Pattern Details</label>
                                                <div className={styles.infoBox}>
                                                    <p>The system automatically detects product identity and image type.</p>
                                                    <ul>
                                                        <li><strong>Format:</strong> <code>IDENTIFIER-TYPE-xb.jpg</code></li>
                                                        <li><strong>Identifier:</strong> Product Reference OR Barcode</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {uploading && (
                                            <div className={styles.progressContainer}>
                                                <div className={styles.progressLabel}>
                                                    Uploading & Processing... {uploadProgress}%
                                                </div>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={styles.progressFill}
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.successState}>
                                        <div className={styles.successIcon}>
                                            <Check size={48} />
                                        </div>
                                        <h3>Upload Completed!</h3>
                                        <div className={styles.resultStatsLarge}>
                                            <div className={styles.statBox}>
                                                <span className={styles.statValue}>{uploadResults.success_count || 0}</span>
                                                <span className={styles.statLabel}>Processed</span>
                                            </div>
                                            <div className={styles.statBox}>
                                                <span className={styles.statValue}>{uploadResults.error_count || 0}</span>
                                                <span className={styles.statLabel}>Errors</span>
                                            </div>
                                        </div>

                                        {uploadResults.results && uploadResults.results.length > 0 && (
                                            <div className={styles.resultList}>
                                                <h5>Log Details:</h5>
                                                {uploadResults.results.slice(0, 50).map((result, index) => (
                                                    <div key={index} className={styles.resultItem}>
                                                        <span className={styles.resultFileName}>
                                                            {result.file}
                                                        </span>
                                                        <span className={
                                                            result.status === 'success'
                                                                ? styles.resultSuccess
                                                                : styles.resultError
                                                        }>
                                                            {result.status === 'success' ? (
                                                                <>
                                                                    <span className={styles.badge}>
                                                                        {result.action === 'updated' ? 'UPDATED' : 'CREATED'}
                                                                    </span>
                                                                    {result.reference}
                                                                </>
                                                            ) : (
                                                                result.message || 'Error'
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className={styles.modalActions}>
                                            <button
                                                className={styles.buttonSecondary}
                                                onClick={() => {
                                                    setUploadResults(null);
                                                    setFolderFiles([]);
                                                }}
                                            >
                                                Upload Another Folder
                                            </button>
                                            <button
                                                className={styles.buttonPrimary}
                                                onClick={() => {
                                                    setShowFolderUploadModal(false);
                                                    setUploadResults(null);
                                                    setFolderFiles([]);
                                                }}
                                            >
                                                Done & Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.buttonSecondary}
                                    onClick={() => {
                                        setShowFolderUploadModal(false);
                                        setFolderFiles([]);
                                        setUploadResults(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={styles.buttonPrimary}
                                    onClick={() => {
                                        if (folderFiles.length > 0) setIsUploadConfirmOpen(true);
                                    }}
                                    disabled={uploading || folderFiles.length === 0}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader size={16} className={styles.spinnerIcon} />
                                            Uploading Folder...
                                        </>
                                    ) : 'Upload Complete Folder'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}