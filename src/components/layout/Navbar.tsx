import { Link, useNavigate } from 'react-router-dom';
import { Map, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar" style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '1rem 0',
            boxShadow: 'var(--shadow-md)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Brand */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    color: 'white'
                }}>
                    <div style={{
                        background: 'var(--color-secondary)',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex'
                    }}>
                        <Map size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Ovacık</h1>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Belediyesi</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" className="nav-link">Ana Sayfa</Link>
                    <Link to="/map" className="nav-link">Harita Platformu</Link>
                    <Link to="/announcements" className="nav-link">Duyurular</Link>

                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                                <User size={16} style={{ display: 'inline', marginRight: '5px' }} />
                                {user?.username}
                            </span>
                            {user?.role === 'ADMIN' && (
                                <Link to="/dashboard" className="nav-link">Panel</Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                Çıkış
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                            Personel Girişi
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        display: 'none'
                    }}
                    className="mobile-toggle"
                >
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div style={{
                    background: 'var(--color-primary-light)',
                    padding: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Ana Sayfa</Link>
                        <Link to="/map" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Harita Platformu</Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Yönetim Paneli</Link>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>Çıkış Yap</button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--color-secondary)' }}>Personel Girişi</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
