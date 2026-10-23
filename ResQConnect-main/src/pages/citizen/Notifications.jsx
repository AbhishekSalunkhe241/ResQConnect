import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Clock, 
  CheckCheck, 
  ChevronRight, 
  Inbox, 
  FileText, 
  UserCheck 
} from 'lucide-react';
import { useRequests } from '../../context/RequestContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

export const Notifications = () => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useRequests();

  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'unread'

  const filtered = filterMode === 'unread'
    ? notifications.filter(n => n.unread)
    : notifications;

  // Icon mapping by type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'submitted':
        return <FileText size={18} style={{ color: 'var(--color-primary-600)' }} />;
      case 'verification':
        return <ShieldCheck size={18} style={{ color: 'var(--color-teal-600)' }} />;
      case 'match':
        return <UserCheck size={18} style={{ color: 'var(--color-purple-main)' }} />;
      case 'progress':
        return <Truck size={18} style={{ color: 'var(--color-primary-600)' }} />;
      case 'completed':
        return <CheckCircle2 size={18} style={{ color: 'var(--color-success-main)' }} />;
      default:
        return <Bell size={18} style={{ color: 'var(--color-primary-600)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Notifications & Alerts
            </h1>
            {unreadNotificationsCount > 0 && (
              <Badge variant="teal">
                {unreadNotificationsCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
            Live status alerts on request submission, field verification, and relief dispatch.
          </p>
        </div>

        {unreadNotificationsCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllNotificationsRead}
            icon={<CheckCheck size={16} />}
            id="mark-all-read-btn"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid',
            borderColor: filterMode === 'all' ? 'var(--color-primary-600)' : 'var(--border-subtle)',
            backgroundColor: filterMode === 'all' ? 'var(--color-primary-50)' : 'var(--bg-surface)',
            color: filterMode === 'all' ? 'var(--color-primary-700)' : 'var(--text-secondary)',
            fontWeight: filterMode === 'all' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('unread')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid',
            borderColor: filterMode === 'unread' ? 'var(--color-primary-600)' : 'var(--border-subtle)',
            backgroundColor: filterMode === 'unread' ? 'var(--color-primary-50)' : 'var(--bg-surface)',
            color: filterMode === 'unread' ? 'var(--color-primary-700)' : 'var(--text-secondary)',
            fontWeight: filterMode === 'unread' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Unread ({unreadNotificationsCount})
        </button>
      </div>

      {/* Notification Cards List */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map((n) => (
            <Card
              key={n.id}
              className={`notification-card ${n.unread ? 'is-unread' : 'is-read'}`}
              style={{
                borderLeft: n.unread ? '4px solid var(--color-primary-600)' : '1px solid var(--border-subtle)',
                backgroundColor: n.unread ? 'var(--color-primary-50)' : 'var(--bg-surface)',
                borderColor: n.unread ? 'var(--color-info-border)' : 'var(--border-subtle)',
                transition: 'all 0.15s ease'
              }}
              hoverable
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Circle */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: n.unread ? 'var(--bg-surface)' : 'var(--bg-muted)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-xs)',
                    flexShrink: 0,
                    marginTop: '0.1rem'
                  }}
                >
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginBottom: '0.25rem' }}>
                    <div className="flex items-center gap-2">
                      <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {n.title}
                      </h3>
                      {n.unread && (
                        <span 
                          style={{ 
                            width: '7px', 
                            height: '7px', 
                            borderRadius: '50%', 
                            backgroundColor: 'var(--color-primary-600)' 
                          }} 
                        />
                      )}
                    </div>

                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{n.time || 'Recently'}</span>
                    </span>
                  </div>

                  <p className="text-sm" style={{ lineHeight: 1.5, margin: '0 0 0.65rem 0', color: 'var(--text-secondary)' }}>
                    {n.desc}
                  </p>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.25rem', paddingTop: '0.5rem' }}>
                    {n.requestId ? (
                      <Link
                        to={`/citizen/requests/${n.requestId}`}
                        onClick={() => markNotificationRead(n.id)}
                        className="notification-link flex items-center gap-1 text-xs font-bold"
                        style={{ textDecoration: 'none', color: 'var(--color-primary-600)' }}
                      >
                        <span>View Request #{n.requestId}</span>
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <div />
                    )}

                    {n.unread && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="notification-mark-read-btn text-xs font-semibold"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                          transition: 'color 0.15s ease, background-color 0.15s ease'
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Inbox size={44} style={{ color: 'var(--text-light)' }} />}
          title={filterMode === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description={
            filterMode === 'unread'
              ? 'All alerts have been marked as read.'
              : 'As your recovery requests move through verification and matching, alerts will appear here.'
          }
          action={
            filterMode === 'unread' ? (
              <Button onClick={() => setFilterMode('all')} variant="secondary" size="sm">
                View All Notifications
              </Button>
            ) : null
          }
        />
      )}
      {/* Interactive styles */}
      <style>{`
        .notification-link:hover {
          color: var(--color-primary-700) !important;
          text-decoration: underline !important;
        }
        .notification-mark-read-btn:hover {
          color: var(--color-primary-600) !important;
          background-color: var(--bg-muted) !important;
        }
        .notification-link:focus-visible,
        .notification-mark-read-btn:focus-visible {
          outline: 2px solid var(--color-primary-600);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
