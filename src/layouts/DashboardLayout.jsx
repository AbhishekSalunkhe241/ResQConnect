import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import Badge from '../components/Badge';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, role, logout, switchRole } = useAuth();
  const { unreadNotificationsCount } = useRequests();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/citizen', icon: <LayoutDashboard size={18} />, exact: true },
    { name: 'Request Help', path: '/citizen/request-help', icon: <PlusCircle size={18} /> },
    { name: 'My Requests', path: '/citizen/requests', icon: <FileText size={18} /> },
    { name: 'Notifications', path: '/citizen/notifications', icon: <Bell size={18} />, count: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
    { name: 'Profile', path: '/citizen/profile', icon: <User size={18} /> },
  ];

  // Get current page title dynamically
  const getPageTitle = () => {
    if (location.pathname.startsWith('/citizen/requests/')) {
      return 'Request Details';
    }
    const current = navItems.find(item => 
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    return current ? current.name : 'Citizen Portal';
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 35
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div
          style={{
            height: '70px',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-teal-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}
            >
              <HeartHandshake size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>
                ResQ<span style={{ color: 'var(--color-teal-500)' }}>Connect</span>
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                Post-Disaster Hub
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'none'
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Quick Info */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
              alt={currentUser?.name || 'User'}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: '#FFF', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Rahul Sharma'}
              </p>
              <div className="flex items-center gap-1" style={{ marginTop: '0.15rem' }}>
                <Badge variant="teal" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                  Citizen
                </Badge>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• Panvel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
            Navigation
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                backgroundColor: isActive ? 'var(--color-navy-800)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.count && (
                <span
                  style={{
                    backgroundColor: 'var(--color-primary-600)',
                    color: '#FFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    padding: '0.1rem 0.5rem'
                  }}
                >
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', padding: '0.25rem 0.75rem 0.5rem' }}>
              Public Portals
            </p>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: '#94A3B8',
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer / Logout */}
        <div
          style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)'
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#F87171',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-navy-900)',
                cursor: 'pointer',
                display: 'none',
                padding: '0.25rem'
              }}
              className="mobile-open-btn"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-4">
            {/* Quick Role Switcher Pill for Demo */}
            <div className="flex items-center gap-2 md-hidden">
              <span className="text-xs text-muted font-medium">Demo Role:</span>
              <select
                value={role}
                onChange={(e) => {
                  switchRole(e.target.value);
                  navigate(`/${e.target.value}`);
                }}
                className="form-select text-xs"
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  borderColor: 'var(--border-default)',
                  fontWeight: 600
                }}
              >
                <option value="citizen">Citizen (Day 1 Active)</option>
                <option value="volunteer">Volunteer (Day 2)</option>
                <option value="ngo">NGO (Day 2)</option>
                <option value="admin">Admin (Day 3)</option>
              </select>
            </div>

            {/* Notification Bell */}
            <Link
              to="/citizen/notifications"
              style={{
                position: 'relative',
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--color-navy-800)',
                display: 'flex'
              }}
              title={`${unreadNotificationsCount} Unread Notifications`}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-danger-main)',
                    border: '2px solid #FFF'
                  }}
                />
              )}
            </Link>

            {/* Profile Avatar Pill */}
            <Link
              to="/citizen/profile"
              className="flex items-center gap-2"
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none'
              }}
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
                alt=""
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span className="text-xs font-semibold md-hidden" style={{ color: 'var(--color-navy-900)' }}>
                {currentUser?.name?.split(' ')[0] || 'Rahul'}
              </span>
              <Badge variant="teal" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                Citizen
              </Badge>
            </Link>
          </div>
        </header>

        {/* Dashboard Dynamic View */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-open-btn {
            display: flex !important;
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
