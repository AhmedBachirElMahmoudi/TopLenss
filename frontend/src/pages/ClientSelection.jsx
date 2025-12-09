import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, LogOut, ArrowRight, Phone, Mail, Search } from "lucide-react";

export default function ClientSelection() {
    const { api, logout } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        api.get("/clients")
            .then(res => setClients(res.data))
            .catch(err => console.error(err));
    }, [api]);

    const selectClient = (client) => {
        localStorage.setItem("selectedClient", JSON.stringify(client));
        navigate("/dashboard");
    };

    const filteredClients = clients.filter(c =>
        c.ct_intitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ct_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                {/* Grid */}
                {filteredClients.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {filteredClients.map(client => (
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
                ) : (
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
