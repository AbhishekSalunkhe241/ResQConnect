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
  ShieldCheck,
  Building2,
  Users,
  MapPin,
  BarChart3,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { ThemeToggle } from '../context/ThemeContext';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const { currentUser, role, logout, switchRole } = useAuth();
  const { unreadNotificationsCount, resetToDefaultMockData } = useRequests();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine active view role
  const activeRole = (() => {
    if (location.pathname.startsWith('/volunteer')) return 'volunteer';
    if (location.pathname.startsWith('/ngo')) return 'ngo';
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/citizen')) return 'citizen';
    return role || 'citizen';
  })();

  // Role-specific navigation items
  const getNavItems = () => {
    switch (activeRole) {
      case 'volunteer':
        return [
          { name: 'Task Mobilization', path: '/volunteer', icon: <LayoutDashboard size={18} />, exact: true },
          { name: 'Recovery Hubs', path: '/recovery', icon: <MapPin size={18} /> },
          { name: 'Impact Analytics', path: '/analytics', icon: <BarChart3 size={18} /> },
          { name: 'Notifications', path: '/citizen/notifications', icon: <Bell size={18} />, count: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
          { name: 'Profile & Skills', path: '/citizen/profile', icon: <User size={18} /> },
        ];
      case 'ngo':
        return [
          { name: 'Operations Center', path: '/ngo', icon: <Building2 size={18} />, exact: true },
          { name: 'Recovery Hubs', path: '/recovery', icon: <MapPin size={18} /> },
          { name: 'Relief Analytics', path: '/analytics', icon: <BarChart3 size={18} /> },
          { name: 'Notifications', path: '/citizen/notifications', icon: <Bell size={18} />, count: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
          { name: 'Organization Profile', path: '/citizen/profile', icon: <User size={18} /> },
        ];
      case 'admin':
        return [
          { name: 'Administration Desk', path: '/admin', icon: <ShieldCheck size={18} />, exact: true },
          { name: 'Recovery Hubs', path: '/recovery', icon: <MapPin size={18} /> },
          { name: 'Macro Analytics', path: '/analytics', icon: <BarChart3 size={18} /> },
          { name: 'Notifications', path: '/citizen/notifications', icon: <Bell size={18} />, count: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
          { name: 'Console Profile', path: '/citizen/profile', icon: <User size={18} /> },
        ];
      case 'citizen':
      default:
        return [
          { name: 'Dashboard', path: '/citizen', icon: <LayoutDashboard size={18} />, exact: true },
          { name: 'Request Help', path: '/citizen/request-help', icon: <PlusCircle size={18} /> },
          { name: 'My Requests', path: '/citizen/requests', icon: <FileText size={18} /> },
          { name: 'Recovery Hubs', path: '/recovery', icon: <MapPin size={18} /> },
          { name: 'Notifications', path: '/citizen/notifications', icon: <Bell size={18} />, count: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
          { name: 'Profile', path: '/citizen/profile', icon: <User size={18} /> },
        ];
    }
  };

  const navItems = getNavItems();

  // Get current page title dynamically
  const getPageTitle = () => {
    if (location.pathname.startsWith('/citizen/requests/')) {
      return 'Request Details';
    }
    if (location.pathname === '/volunteer') return 'Volunteer Task Mobilization';
    if (location.pathname === '/ngo') return 'NGO Operations Center';
    if (location.pathname === '/admin') return 'System Administration';
    if (location.pathname === '/analytics') return 'Recovery Analytics';
    if (location.pathname === '/recovery') return 'Recovery Hubs & Map';

    const current = navItems.find(item => 
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    return current ? current.name : 'ResQConnect Portal';
  };

  const roleLabelMap = {
    citizen: 'Citizen Portal',
    volunteer: 'Volunteer Responder',
    ngo: 'Relief NGO Partner',
    admin: 'System Administration'
  };

  const roleBadgeMap = {
    citizen: 'teal',
    volunteer: 'amber',
    ngo: 'purple',
    admin: 'slate'
  };

  const handleRoleSwitch = (newRole) => {
    switchRole(newRole);
    navigate(`/${newRole}`);
  };

  const handleConfirmReset = () => {
    resetToDefaultMockData();
    setShowResetModal(false);
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
                {currentUser?.name || 'Demo User'}
              </p>
              <div className="flex items-center gap-1" style={{ marginTop: '0.15rem' }}>
                <Badge variant={roleBadgeMap[activeRole] || 'teal'} style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                  {activeRole.toUpperCase()}
                </Badge>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• Panvel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
            {roleLabelMap[activeRole]} Navigation
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
                <span className="nav-count-badge">
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
              to="/recovery"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: '#94A3B8',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <MapPin size={16} />
              <span>Recovery Hubs & Map</span>
            </Link>
            <Link
              to="/analytics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: '#94A3B8',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <BarChart3 size={16} />
              <span>Disaster Analytics</span>
            </Link>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: '#94A3B8',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer / Reset & Logout */}
        <div
          style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <button
            onClick={() => setShowResetModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.825rem',
              textAlign: 'left'
            }}
          >
            <RotateCcw size={15} />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#F87171',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              textAlign: 'left'
            }}
          >
            <LogOut size={16} />
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
                color: 'var(--text-primary)',
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
              <span className="text-xs text-muted font-bold uppercase">Role Console:</span>
              <select
                value={activeRole}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="form-select text-xs"
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  borderColor: 'var(--border-default)',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="citizen">Citizen Portal</option>
                <option value="volunteer">Volunteer Mobilization</option>
                <option value="ngo">Relief NGO Operations</option>
                <option value="admin">System Administration</option>
              </select>
            </div>

            <ThemeToggle />

            {/* Notification Bell */}
            <Link
              to="/citizen/notifications"
              className="notification-bell-btn"
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease'
              }}
              title={`${unreadNotificationsCount} Unread Notifications`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-danger-main)',
                    boxShadow: '0 0 0 2px var(--bg-surface)'
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
              <span className="text-xs font-semibold md-hidden" style={{ color: 'var(--text-primary)' }}>
                {currentUser?.name?.split(' ')[0] || 'User'}
              </span>
              <Badge variant={roleBadgeMap[activeRole] || 'teal'} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              </Badge>
            </Link>
          </div>
        </header>

        {/* Dashboard Dynamic View */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      {/* Demo Reset Confirmation Modal */}
      {showResetModal && (
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title="Reset All Demo Data?"
          maxWidth="460px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
              <Button variant="primary" style={{ backgroundColor: 'var(--color-danger-main)' }} onClick={handleConfirmReset}>
                Reset Everything
              </Button>
            </div>
          }
        >
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '1rem', color: 'var(--color-warning-text)' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-warning-main)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                This action will restore all requests, relief inventory, audit logs, and volunteer tasks to their initial seed state.
              </p>
            </div>
            <p className="text-xs text-muted">
              Useful for presenting fresh demonstrations of the citizen-to-volunteer workflow.
            </p>
          </div>
        </Modal>
      )}

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
