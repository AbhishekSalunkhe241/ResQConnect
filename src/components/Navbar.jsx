import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Badge from './Badge';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Recovery Hubs', path: '/recovery' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link 
          to="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}
          aria-label="ResQConnect Home"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-navy-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal-500)',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)'
            }}
          >
            <HeartHandshake size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              ResQ<span style={{ color: 'var(--color-teal-600)' }}>Connect</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recovery & Coordination
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="md-hidden" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: '0.925rem',
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                position: 'relative',
                padding: '0.5rem 0'
              }}
            >
              {link.name}
              {isActive(link.path) && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--color-primary-600)',
                    borderRadius: '2px'
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Action Buttons / Auth */}
        <div className="md-hidden flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                to={`/${currentUser.role}`}
                variant="outline-primary"
                size="sm"
                icon={<LayoutDashboard size={16} />}
              >
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard
              </Button>
              <div 
                className="flex items-center gap-2"
                style={{
                  padding: '0.35rem 0.65rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-navy-800)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </span>
                <button
                  onClick={logout}
                  title="Logout"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    padding: '2px'
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button to="/register" variant="primary" size="sm" iconRight={<ArrowRight size={14} />}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            color: 'var(--color-navy-900)',
            cursor: 'pointer'
          }}
          className="mobile-toggle-btn"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.5rem 0',
                  fontSize: '1rem',
                  fontWeight: isActive(link.path) ? 700 : 500,
                  color: isActive(link.path) ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                {link.name}
              </Link>
            ))}

            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-between" style={{ padding: '0.5rem 0' }}>
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="font-semibold text-sm">{currentUser.name}</span>
                    </div>
                    <Badge variant="teal">{currentUser.role}</Badge>
                  </div>
                  <Button
                    to={`/${currentUser.role}`}
                    variant="primary"
                    block
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Open Dashboard
                  </Button>
                  <Button
                    variant="secondary"
                    block
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button to="/login" variant="secondary" block onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Button>
                  <Button to="/register" variant="primary" block onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
