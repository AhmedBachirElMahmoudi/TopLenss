import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Trash2, Edit, Search, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import styles from "../../style/admin/AdminUsers.module.css";

export default function AdminUsers() {
    const { api } = useAuth();

    // Manager List State
    const [managers, setManagers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loadingManagers, setLoadingManagers] = useState(false);

    // Modal State
    const [deleteModal, setDeleteModal] = useState({ 
        show: false, 
        id: null,
        name: "",
        email: ""
    });

    // Fetch managers
    useEffect(() => {
        fetchManagers();
    }, [page]);

    // Debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (page === 1) {
                fetchManagers();
            } else {
                setPage(1); // Will trigger above effect
            }
        }, 500);
        
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const fetchManagers = async () => {
        setLoadingManagers(true);
        try {
            const res = await api.get(`/users?page=${page}&search=${search}`);
            setManagers(res.data.data);
            setLastPage(res.data.last_page);
        } catch (err) {
            console.error("Failed to fetch managers", err);
        } finally {
            setLoadingManagers(false);
        }
    };

    // Delete functions
    const confirmDelete = (user) => {
        setDeleteModal({ 
            show: true, 
            id: user.id,
            name: user.name,
            email: user.email
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        
        try {
            await api.delete(`/users/${deleteModal.id}`);
            fetchManagers();
            setDeleteModal({ show: false, id: null, name: "", email: "" });
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setPage(newPage);
        }
    };

    // Delete Modal Component
    const DeleteModal = () => (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalIcon}>
                    <Trash2 size={32} />
                </div>
                <h3 className={styles.modalTitle}>Delete Manager?</h3>
                <p className={styles.modalMessage}>
                    Are you sure you want to delete <strong>{deleteModal.name}</strong> ({deleteModal.email})? 
                    This action cannot be undone.
                </p>
                <div className={styles.modalActions}>
                    <button
                        onClick={() => setDeleteModal({ show: false, id: null, name: "", email: "" })}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className={styles.deleteConfirmButton}
                    >
                        Delete Manager
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Delete Confirmation Modal */}
            {deleteModal.show && <DeleteModal />}

            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>All Managers</h2>
                <div className={styles.searchContainer}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search managers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingManagers ? (
                            <tr>
                                <td colSpan="4" className={styles.loadingCell}>
                                    <div className={styles.loadingSpinner} />
                                </td>
                            </tr>
                        ) : managers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className={styles.emptyCell}>
                                    {search ? "No managers found for your search." : "No managers available."}
                                </td>
                            </tr>
                        ) : (
                            managers.map(user => (
                                <tr key={user.id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{user.name}</td>
                                    <td className={styles.tableCell}>{user.email}</td>
                                    <td className={styles.tableCell}>
                                        <span className={styles.roleBadge}>{user.role}</span>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.actionButtons}>
                                            <Link 
                                                to={`/admin/users/${user.id}`} 
                                                title="Edit" 
                                                className={styles.editButton}
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button 
                                                title="Delete" 
                                                onClick={() => confirmDelete(user)} 
                                                className={styles.deleteButton}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {managers.length > 0 && (
                <div className={styles.pagination}>
                    <button 
                        disabled={page <= 1} 
                        onClick={() => handlePageChange(page - 1)} 
                        className={styles.pageButton}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className={styles.pageInfo}>
                        Page {page} of {lastPage}
                    </span>
                    <button 
                        disabled={page >= lastPage} 
                        onClick={() => handlePageChange(page + 1)} 
                        className={styles.pageButton}
                        aria-label="Next page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}