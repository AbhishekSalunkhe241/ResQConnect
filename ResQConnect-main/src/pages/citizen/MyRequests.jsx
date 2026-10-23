import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  MapPin, 
  ChevronRight, 
  PlusCircle 
} from 'lucide-react';
import { useRequests } from '../../context/RequestContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export const MyRequests = () => {
  const navigate = useNavigate();
  const { requests, loading } = useRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter tabs per Section 13: All, Active, Under Verification, In Progress, Completed
  const filterTabs = [
    { key: 'All', label: 'All' },
    { key: 'Active', label: 'Active' },
    { key: 'Under Verification', label: 'Under Verification' },
    { key: 'Assistance In Progress', label: 'In Progress' },
    { key: 'Completed', label: 'Completed' }
  ];

  const filteredRequests = requests.filter((req) => {
    // Search query matches ID, Category, or Location
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (req.id && req.id.toLowerCase().includes(term)) ||
      (req.category && req.category.toLowerCase().includes(term)) ||
      (req.location && req.location.toLowerCase().includes(term)) ||
      (req.title && req.title.toLowerCase().includes(term));

    // Status filter matches
    let matchesStatus = true;
    if (statusFilter === 'Active') {
      matchesStatus = !['Completed', 'Closed'].includes(req.status);
    } else if (statusFilter === 'In Progress') {
      matchesStatus = req.status === 'Assistance In Progress';
    } else if (statusFilter !== 'All') {
      matchesStatus = req.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header (Section 13) */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            My Requests
          </h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            View and track the recovery assistance requests you have submitted.
          </p>
        </div>

        <Button
          to="/citizen/request-help"
          variant="primary"
          icon={<PlusCircle size={18} />}
          id="new-request-btn"
        >
          Request Help
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Status Filter Tabs (Section 13) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {filterTabs.map((tab) => {
              const isSelected = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary-600)' : 'transparent',
                    backgroundColor: isSelected ? 'var(--color-primary-50)' : 'transparent',
                    color: isSelected ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search by Request ID, Category, Location (Section 13) */}
          <div style={{ minWidth: '280px', flex: 1, maxWidth: '420px', position: 'relative' }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '0.85rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-light)' 
              }} 
            />
            <input
              type="text"
              placeholder="Search by ID, Category, Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input text-sm"
              style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)' }}
              id="request-search-input"
            />
          </div>
        </div>
      </div>

      {/* SECTION 14: REQUESTS TABLE / CARDS */}
      {loading && requests.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <p className="text-muted text-sm" style={{ margin: 0, fontWeight: 500 }}>
              Loading your recovery requests...
            </p>
          </div>
        </Card>
      ) : filteredRequests.length > 0 ? (
        <div>
          {/* DESKTOP TABLE VIEW */}
          <div className="desktop-table-container">
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr 
                      style={{ 
                        backgroundColor: 'var(--bg-muted)', 
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Request ID</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Location</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Priority</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Submitted</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr 
                        key={req.id} 
                        style={{ 
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background-color 0.15s ease',
                          cursor: 'pointer'
                        }}
                        className="table-row-hover"
                        onClick={() => navigate(`/citizen/requests/${req.id}`)}
                      >
                        {/* Request ID */}
                        <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--color-primary-700)' }}>
                          #{req.id}
                        </td>

                        {/* Category */}
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                            {req.category}
                          </span>
                          <span className="text-xs text-muted" style={{ display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.title}
                          </span>
                        </td>

                        {/* Location */}
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-1.5 text-xs">
                            <MapPin size={13} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {req.addressDetails?.city || req.location}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '1rem' }}>
                          <Badge variant={req.priority === 'Critical' ? 'red' : req.priority === 'High' ? 'amber' : 'slate'} style={{ fontSize: '0.7rem' }}>
                            {req.priority}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          <StatusBadge status={req.status} />
                        </td>

                        {/* Submitted */}
                        <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>

                        {/* Action */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <Button
                            to={`/citizen/requests/${req.id}`}
                            variant="secondary"
                            size="sm"
                            iconRight={<ChevronRight size={14} />}
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* MOBILE CARDS VIEW (Section 14) */}
          <div className="mobile-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredRequests.map((req) => (
              <Card 
                key={req.id} 
                hoverable 
                onClick={() => navigate(`/citizen/requests/${req.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-start justify-between gap-2" style={{ marginBottom: '0.5rem' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary-700)' }}>
                      #{req.id}
                    </span>
                    <Badge variant="slate">{req.category}</Badge>
                    <Badge variant={req.priority === 'Critical' ? 'red' : req.priority === 'High' ? 'amber' : 'slate'} style={{ fontSize: '0.65rem' }}>
                      {req.priority}
                    </Badge>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0 0.4rem 0' }}>
                  {req.title}
                </h3>

                <p className="text-muted text-xs" style={{ lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
                  {req.description?.substring(0, 110)}...
                </p>

                <div className="flex items-center justify-between pt-2 border-t text-xs text-muted" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    <span>{req.addressDetails?.city || req.location}</span>
                  </span>
                  <Button
                    to={`/citizen/requests/${req.id}`}
                    variant="ghost"
                    size="sm"
                    iconRight={<ChevronRight size={14} />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* EMPTY STATE (Section 27) */
        <EmptyState
          icon={<FileText size={48} style={{ color: 'var(--text-light)' }} />}
          title="No requests found"
          description="Your submitted recovery requests will appear here. Submit a new request to connect with local relief partners."
          action={
            <Button to="/citizen/request-help" variant="primary" icon={<PlusCircle size={18} />}>
              Request Help
            </Button>
          }
        />
      )}

      <style>{`
        .table-row-hover:hover {
          background-color: var(--color-primary-50) !important;
        }
        .desktop-table-container {
          display: block;
        }
        .mobile-cards-container {
          display: none;
        }
        @media (max-width: 820px) {
          .desktop-table-container {
            display: none !important;
          }
          .mobile-cards-container {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyRequests;
