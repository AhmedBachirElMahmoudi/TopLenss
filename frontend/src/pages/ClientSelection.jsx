import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, LogOut, ArrowRight, Phone, Mail, Search, Loader, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function ClientSelection() {
    const { api, logout } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // 3x3 grid

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.get("/clients")
            .then(res => {
                setClients(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load clients. Please try again.");
                setLoading(false);
            });
    }, [api]);

    const selectClient = (client) => {
        localStorage.setItem("selectedClient", JSON.stringify(client));
        navigate("/dashboard");
    };

    const filteredClients = clients.filter(c =>
        c.ct_intitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ct_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClients = filteredClients.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f4f6f9',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Poppins, sans-serif'
        }}>

            {/* Header */}
            <header style={{ background: 'white', padding: '1rem 0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#3498db', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>TL</div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50', letterSpacing: '-0.5px' }}>TopLenss <span style={{ fontWeight: 400, color: '#7f8c8d', fontSize: '1.25rem' }}>/ Select Client</span></h1>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            padding: '0.6rem 1.25rem',
                            background: 'white',
                            color: '#e74c3c',
                            border: '1px solid #fab1a0',
                            borderRadius: '8px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#e74c3c'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#e74c3c'; }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            {/* Content */}
            <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                {/* Search / Filter */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontSize: '1.75rem' }}>Your Clients</h2>
                        <p style={{ margin: 0, color: '#7f8c8d' }}>Select a client context to manage orders and view reports.</p>
                    </div>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={20} color="#bdc3c7" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 2.75rem',
                                borderRadius: '10px',
                                border: '1px solid #dfe6e9',
                                outline: 'none',
                                fontSize: '0.95rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#ebf5fb',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#3498db',
                            animation: 'spin 1s linear infinite'
                        }}>
                            <Loader size={30} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50' }}>Loading clients...</h3>
                        <p style={{ margin: 0, color: '#95a5a6' }}>Please wait while we fetch your clients.</p>
                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : error ? (
                    /* Error State */
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        background: 'white',
                        borderRadius: '16px',
                        border: '2px solid #fee2e2',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#ef4444'
                        }}>
                            <AlertCircle size={30} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', color: '#ef4444' }}>Error Loading Clients</h3>
                        <p style={{ margin: '0 0 1.5rem', color: '#64748b' }}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                            onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredClients.length > 0 ? (
                    /* Grid */
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                            {currentClients.map(client => (
                                <div
                                    key={client.ct_num}
                                    onClick={() => selectClient(client)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.03)',
                                        cursor: 'pointer',
                                        border: '1px solid transparent',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.borderColor = '#3498db';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.03)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            background: '#ebf5fb',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#3498db'
                                        }}>
                                            <Building2 size={24} />
                                        </div>
                                        <div style={{
                                            padding: '0.5rem',
                                            borderRadius: '50%',
                                            background: '#f8f9fa',
                                            color: '#bdc3c7',
                                            transition: 'all 0.2s'
                                        }}>
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', color: '#2c3e50', fontWeight: 600 }}>{client.ct_intitule}</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#95a5a6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} /> {client.ct_email}
                                        </p>
                                    </div>

                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f2f6', marginTop: 'auto' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={14} /> {client.ct_telephone || 'No phone'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '2.5rem',
                                padding: '1.5rem',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: currentPage === 1 ? '#f1f2f6' : 'white',
                                        color: currentPage === 1 ? '#bdc3c7' : '#2c3e50',
                                        border: '1px solid #dfe6e9',
                                        borderRadius: '8px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {/* First page */}
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        style={{
                                            padding: '0.5rem 0.875rem',
                                            background: currentPage === 1 ? '#3498db' : 'white',
                                            color: currentPage === 1 ? 'white' : '#2c3e50',
                                            border: currentPage === 1 ? 'none' : '1px solid #dfe6e9',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: currentPage === 1 ? 600 : 400,
                                            transition: 'all 0.2s',
                                            minWidth: '40px'
                                        }}
                                        onMouseOver={e => {
                                            if (currentPage !== 1) {
                                                e.currentTarget.style.background = '#ebf5fb';
                                                e.currentTarget.style.borderColor = '#3498db';
                                            }
                                        }}
                                        onMouseOut={e => {
                                            if (currentPage !== 1) {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.borderColor = '#dfe6e9';
                                            }
                                        }}
                                    >
                                        1
                                    </button>

                                    {/* Ellipsis before current page */}
                                    {currentPage > 3 && (
                                        <span style={{ color: '#bdc3c7', padding: '0 0.25rem' }}>...</span>
                                    )}

                                    {/* Pages around current page */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Show pages near current page (not first or last)
                                            return page !== 1 && page !== totalPages && Math.abs(page - currentPage) <= 1;
                                        })
                                        .map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                style={{
                                                    padding: '0.5rem 0.875rem',
                                                    background: currentPage === page ? '#3498db' : 'white',
                                                    color: currentPage === page ? 'white' : '#2c3e50',
                                                    border: currentPage === page ? 'none' : '1px solid #dfe6e9',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: currentPage === page ? 600 : 400,
                                                    transition: 'all 0.2s',
                                                    minWidth: '40px'
                                                }}
                                                onMouseOver={e => {
                                                    if (currentPage !== page) {
                                                        e.currentTarget.style.background = '#ebf5fb';
                                                        e.currentTarget.style.borderColor = '#3498db';
                                                    }
                                                }}
                                                onMouseOut={e => {
                                                    if (currentPage !== page) {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#dfe6e9';
                                                    }
                                                }}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                    {/* Ellipsis after current page */}
                                    {currentPage < totalPages - 2 && (
                                        <span style={{ color: '#bdc3c7', padding: '0 0.25rem' }}>...</span>
                                    )}

                                    {/* Last page */}
                                    {totalPages > 1 && (
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            style={{
                                                padding: '0.5rem 0.875rem',
                                                background: currentPage === totalPages ? '#3498db' : 'white',
                                                color: currentPage === totalPages ? 'white' : '#2c3e50',
                                                border: currentPage === totalPages ? 'none' : '1px solid #dfe6e9',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: currentPage === totalPages ? 600 : 400,
                                                transition: 'all 0.2s',
                                                minWidth: '40px'
                                            }}
                                            onMouseOver={e => {
                                                if (currentPage !== totalPages) {
                                                    e.currentTarget.style.background = '#ebf5fb';
                                                    e.currentTarget.style.borderColor = '#3498db';
                                                }
                                            }}
                                            onMouseOut={e => {
                                                if (currentPage !== totalPages) {
                                                    e.currentTarget.style.background = 'white';
                                                    e.currentTarget.style.borderColor = '#dfe6e9';
                                                }
                                            }}
                                        >
                                            {totalPages}
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: currentPage === totalPages ? '#f1f2f6' : 'white',
                                        color: currentPage === totalPages ? '#bdc3c7' : '#2c3e50',
                                        border: '1px solid #dfe6e9',
                                        borderRadius: '8px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </button>

                                <div style={{
                                    marginLeft: '1rem',
                                    padding: '0.5rem 1rem',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    color: '#7f8c8d'
                                }}>
                                    Page {currentPage} of {totalPages}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* No Results */
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: '16px',
                        border: '2px dashed #e0e0e0'
                    }}>
                        <div style={{ width: '60px', height: '60px', background: '#f9f9f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#bdc3c7' }}>
                            <Search size={30} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', color: '#7f8c8d' }}>No clients found</h3>
                        <p style={{ margin: 0, color: '#95a5a6' }}>Try adjusting your search terms or contact support.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
