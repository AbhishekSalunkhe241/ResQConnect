import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  X, 
  Check, 
  Eye, 
  Flag, 
  Activity, 
  BarChart3, 
  Package, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    requests, 
    resources, 
    usersList, 
    auditLogs, 
    verifyUser, 
    rejectUser, 
    updateRequestStatus, 
    flagRequest, 
    unflagRequest,
    resetToDefaultMockData
  } = useRequests();

  // Active Tab
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'users', 'requests', 'audit', 'analytics'

  // Verification Filter
  const [verifTypeFilter, setVerifTypeFilter] = useState('all'); // 'all', 'ngo', 'volunteer', 'request'

  // User Management Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userVerifFilter, setUserVerifFilter] = useState('All');

  // Request Moderation Filter
  const [reqSearch, setReqSearch] = useState('');
  const [reqPriorityFilter, setReqPriorityFilter] = useState('All');
  const [reqStatusFilter, setReqStatusFilter] = useState('All');
  const [reqFlagFilter, setReqFlagFilter] = useState('All');

  // Audit Log Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('All');

  // Modal States
  const [viewDetailModal, setViewDetailModal] = useState(null); // { type: 'user'|'request', data }
  const [rejectModalData, setRejectModalData] = useState(null); // { type, data }
  const [rejectionReason, setRejectionReason] = useState('');

  const [flagModalRequest, setFlagModalRequest] = useState(null);
  const [flagReasonInput, setFlagReasonInput] = useState('');

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showNotification = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Derive verification queue items
  const pendingQueue = useMemo(() => {
    const pendingNGOs = usersList.filter(u => u.role === 'ngo' && u.pendingVerification).map(u => ({
      queueType: 'ngo',
      id: u.id,
      title: u.name,
      subtitle: `Registration: ${u.regNumber || 'Pending'} • ${u.location}`,
      date: u.joinedDate || 'Recently',
      raw: u
    }));

    const pendingVolunteers = usersList.filter(u => u.role === 'volunteer' && u.pendingVerification).map(u => ({
      queueType: 'volunteer',
      id: u.id,
      title: u.name,
      subtitle: `Skills: ${u.skills?.join(', ') || 'General Aid'} • ${u.location}`,
      date: u.joinedDate || 'Recently',
      raw: u
    }));

    const unverifiedRequests = requests.filter(r => r.status === 'Submitted' || r.status === 'Under Verification').map(r => ({
      queueType: 'request',
      id: r.id,
      title: r.title,
      subtitle: `${r.category} • Priority: ${r.priority} • ${r.location}`,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
      raw: r
    }));

    return [...pendingNGOs, ...pendingVolunteers, ...unverifiedRequests];
  }, [usersList, requests]);

  // Filtered verification queue
  const filteredQueue = useMemo(() => {
    if (verifTypeFilter === 'all') return pendingQueue;
    return pendingQueue.filter(item => item.queueType === verifTypeFilter);
  }, [pendingQueue, verifTypeFilter]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchSearch = 
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.location?.toLowerCase().includes(userSearch.toLowerCase());

      const matchRole = userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase();
      
      const isVerified = u.verified && !u.pendingVerification;
      const matchVerif = 
        userVerifFilter === 'All' ||
        (userVerifFilter === 'Verified' && isVerified) ||
        (userVerifFilter === 'Pending' && u.pendingVerification) ||
        (userVerifFilter === 'Unverified' && !u.verified && !u.pendingVerification);

      return matchSearch && matchRole && matchVerif;
    });
  }, [usersList, userSearch, userRoleFilter, userVerifFilter]);

  // Filtered Moderation Requests
  const filteredModerationRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = 
        r.id?.toLowerCase().includes(reqSearch.toLowerCase()) ||
        r.title?.toLowerCase().includes(reqSearch.toLowerCase()) ||
        r.location?.toLowerCase().includes(reqSearch.toLowerCase());

      const matchPri = reqPriorityFilter === 'All' || r.priority === reqPriorityFilter;
      const matchStat = reqStatusFilter === 'All' || r.status === reqStatusFilter;
      const matchFlag = 
        reqFlagFilter === 'All' || 
        (reqFlagFilter === 'Flagged' && r.isFlagged) || 
        (reqFlagFilter === 'Normal' && !r.isFlagged);

      return matchSearch && matchPri && matchStat && matchFlag;
    });
  }, [requests, reqSearch, reqPriorityFilter, reqStatusFilter, reqFlagFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = 
        log.targetId?.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.actor?.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details?.toLowerCase().includes(auditSearch.toLowerCase());

      const matchType = auditTypeFilter === 'All' || log.actionType === auditTypeFilter;
      return matchSearch && matchType;
    });
  }, [auditLogs, auditSearch, auditTypeFilter]);

  // Statistics
  const totalResourceUnits = useMemo(() => {
    return resources.reduce((acc, r) => acc + (r.quantity || 0), 0);
  }, [resources]);

  const activeCasesCount = useMemo(() => {
    return requests.filter(r => !['Completed', 'Closed', 'Rejected'].includes(r.status)).length;
  }, [requests]);

  const completedCasesCount = useMemo(() => {
    return requests.filter(r => r.status === 'Completed').length;
  }, [requests]);

  const flaggedCount = useMemo(() => {
    return requests.filter(r => r.isFlagged).length;
  }, [requests]);

  // Handlers
  const handleApproveQueueItem = (item) => {
    if (item.queueType === 'ngo' || item.queueType === 'volunteer') {
      verifyUser(item.id, 'Credential accreditation validated by administrative desk.', currentUser?.name || 'System Admin');
      showNotification(`Approved and verified ${item.title} credentials.`);
    } else if (item.queueType === 'request') {
      const nextStatus = item.raw.status === 'Submitted' ? 'Under Verification' : 'Verified';
      const result = updateRequestStatus(item.id, nextStatus, 'Request reviewed by central administrative desk.', currentUser?.name || 'System Admin');
      if (result?.success === false) showNotification(result.error, 'danger');
      else showNotification(`Request ${item.id} advanced to ${nextStatus}.`);
    }
    if (viewDetailModal?.data?.id === item.id) setViewDetailModal(null);
  };

  const handleOpenRejectModal = (item) => {
    setRejectModalData(item);
    setRejectionReason('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    if (rejectModalData.queueType === 'ngo' || rejectModalData.queueType === 'volunteer') {
      rejectUser(rejectModalData.id, rejectionReason.trim(), currentUser?.name || 'System Admin');
      showNotification(`Rejected accreditation for ${rejectModalData.title}. Reason saved.`);
    } else if (rejectModalData.queueType === 'request') {
      updateRequestStatus(rejectModalData.id, 'Rejected', rejectionReason.trim(), currentUser?.name || 'System Admin');
      showNotification(`Request ${rejectModalData.id} rejected.`);
    }

    setRejectModalData(null);
    if (viewDetailModal?.data?.id === rejectModalData.id) setViewDetailModal(null);
  };

  const handleOpenFlagModal = (req) => {
    setFlagModalRequest(req);
    setFlagReasonInput(req.flagReason || '');
  };

  const handleConfirmFlag = (e) => {
    e.preventDefault();
    if (!flagReasonInput.trim()) return;
    flagRequest(flagModalRequest.id, flagReasonInput.trim(), currentUser?.name || 'System Admin');
    showNotification(`Flagged request ${flagModalRequest.id} as suspicious/duplicate.`);
    setFlagModalRequest(null);
  };

  const handleConfirmResetData = () => {
    resetToDefaultMockData();
    setShowResetConfirmModal(false);
    showNotification('All platform demo data reset to original seed state successfully.');
  };

  return (
    <div className="admin-dashboard" style={{ padding: '0 0 3rem' }}>
      {/* Toast Feedback */}
      {feedback && (
        <div 
          className="animate-fade-in"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: feedback.type === 'danger' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
            border: `1px solid ${feedback.type === 'danger' ? 'var(--color-danger-border)' : 'var(--color-success-border)'}`,
            color: feedback.type === 'danger' ? 'var(--color-danger-text)' : 'var(--color-success-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{feedback.text}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}
      >
        <div className="flex items-start justify-between md-flex-col gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Badge variant="slate">State Coordination Bureau</Badge>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• Administrative Triage Console</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              System Administration Desk
            </h1>
            <p style={{ color: '#94A3B8', marginTop: '0.35rem', maxWidth: '650px', fontSize: '0.95rem' }}>
              Credential accreditation, user integrity management, request moderation, and macro recovery coordination across Raigad and coastal Maharashtra.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }} className="md-items-start">
            <div 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '0.8rem',
                color: '#CBD5E1'
              }}
            >
              Demo Mode: <strong>College Mini-Project Demonstration</strong>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<AlertCircle size={15} />}
              onClick={() => setShowResetConfirmModal(true)}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              Reset All Demo Data
            </Button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Users Registered"
          value={usersList.length}
          subtext="Citizens, Volunteers, NGOs, Admins"
          icon={<Users size={22} />}
          colorScheme="blue"
          onClick={() => setActiveTab('users')}
        />
        <StatCard
          title="Verification Queue"
          value={pendingQueue.length}
          subtext="Items awaiting accreditation"
          icon={<Clock size={22} />}
          colorScheme="amber"
          onClick={() => setActiveTab('verifications')}
        />
        <StatCard
          title="Total Requests Logged"
          value={requests.length}
          subtext={`${activeCasesCount} active, ${flaggedCount} flagged`}
          icon={<FileText size={22} />}
          colorScheme="teal"
          onClick={() => setActiveTab('requests')}
        />
        <StatCard
          title="Active Relief Operations"
          value={activeCasesCount}
          subtext="Underway across 5 sub-districts"
          icon={<Activity size={22} />}
          colorScheme="purple"
          onClick={() => setActiveTab('requests')}
        />
        <StatCard
          title="Completed Cases"
          value={completedCasesCount}
          subtext="Aid safely signed off"
          icon={<CheckCircle2 size={22} />}
          colorScheme="green"
          onClick={() => setActiveTab('analytics')}
        />
        <StatCard
          title="Monitored Resources"
          value={totalResourceUnits}
          subtext={`${resources.length} inventory categories`}
          icon={<Package size={22} />}
          colorScheme="teal"
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Tabs Bar */}
      <div 
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('verifications')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'verifications' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'verifications' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'verifications' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={18} />
          <span>Verification Queue</span>
          <span 
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: pendingQueue.length > 0 ? 'var(--color-warning-main)' : 'var(--bg-muted)',
              color: pendingQueue.length > 0 ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {pendingQueue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'users' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={18} />
          <span>User Management</span>
          <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{usersList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'requests' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'requests' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Flag size={18} />
          <span>Request Moderation</span>
          <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{requests.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'audit' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Activity size={18} />
          <span>Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'analytics' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <BarChart3 size={18} />
          <span>System Analytics</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: VERIFICATION QUEUE                                */}
      {/* ======================================================== */}
      {activeTab === 'verifications' && (
        <div>
          {/* Subfilter Pills */}
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '1.25rem' }}>
            <span className="text-xs text-muted font-bold uppercase">Filter Queue:</span>
            {[
              { id: 'all', label: 'All Pending' },
              { id: 'ngo', label: 'Relief NGOs' },
              { id: 'volunteer', label: 'Volunteers' },
              { id: 'request', label: 'Assistance Requests' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setVerifTypeFilter(p.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: verifTypeFilter === p.id ? 'var(--color-teal-600)' : 'var(--border-default)',
                  backgroundColor: verifTypeFilter === p.id ? 'var(--color-teal-50)' : '#FFFFFF',
                  color: verifTypeFilter === p.id ? 'var(--color-teal-700)' : 'var(--text-secondary)',
                  fontWeight: verifTypeFilter === p.id ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {filteredQueue.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck size={48} />}
              title="Verification Queue Clear"
              description="All submitted relief organizations, volunteer responders, and citizen requests have been reviewed."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredQueue.map((item) => (
                <div 
                  key={`${item.queueType}-${item.id}`}
                  className="card card-hover"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-navy-900)' }}>{item.id}</span>
                      <Badge variant={item.queueType === 'ngo' ? 'purple' : item.queueType === 'volunteer' ? 'teal' : 'blue'}>
                        {item.queueType === 'ngo' ? 'Relief NGO' : item.queueType === 'volunteer' ? 'Volunteer Applicant' : 'Assistance Request'}
                      </Badge>
                      <Badge variant="amber">Awaiting Triage</Badge>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy-950)', margin: '0 0 0.25rem' }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye size={15} />}
                      onClick={() => setViewDetailModal({ type: item.queueType, data: item.raw })}
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: 'var(--color-danger-main)' }}
                      onClick={() => handleOpenRejectModal(item)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="teal"
                      size="sm"
                      icon={<Check size={15} />}
                      onClick={() => handleApproveQueueItem(item)}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: USER MANAGEMENT DIRECTORY                         */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div>
          {/* Filters */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search users by name, email, location..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              <div style={{ flex: '0 1 160px' }}>
                <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="form-select">
                  <option value="All">All Roles</option>
                  <option value="citizen">Citizens</option>
                  <option value="volunteer">Volunteers</option>
                  <option value="ngo">Relief NGOs</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>

              <div style={{ flex: '0 1 180px' }}>
                <select value={userVerifFilter} onChange={(e) => setUserVerifFilter(e.target.value)} className="form-select">
                  <option value="All">All Statuses</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Unverified">Unverified</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>User Profile</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Role</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Contact Info</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Location</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Verification</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover-row">
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'} 
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--color-navy-950)', display: 'block' }}>
                              {user.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge variant={user.role === 'admin' ? 'slate' : user.role === 'ngo' ? 'purple' : user.role === 'volunteer' ? 'teal' : 'blue'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem' }}>
                        <div>{user.email}</div>
                        <div className="text-muted">{user.phone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        {user.location}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {user.verified ? (
                          <Badge variant="green">✓ Verified</Badge>
                        ) : user.pendingVerification ? (
                          <Badge variant="amber">Pending Review</Badge>
                        ) : (
                          <Badge variant="slate">Unverified</Badge>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setViewDetailModal({ type: 'user', data: user })}
                          >
                            Profile
                          </Button>
                          {!user.verified && (
                            <Button
                              variant="teal"
                              size="sm"
                              onClick={() => {
                                verifyUser(user.id, 'Accredited by Administrator', currentUser?.name);
                                showNotification(`Verified ${user.name}`);
                              }}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REQUEST MODERATION                                */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by ID, keyword, locality..."
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              <div style={{ flex: '0 1 160px' }}>
                <select value={reqPriorityFilter} onChange={(e) => setReqPriorityFilter(e.target.value)} className="form-select">
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div style={{ flex: '0 1 160px' }}>
                <select value={reqStatusFilter} onChange={(e) => setReqStatusFilter(e.target.value)} className="form-select">
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Verified">Verified</option>
                  <option value="Matched">Matched</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div style={{ flex: '0 1 160px' }}>
                <select value={reqFlagFilter} onChange={(e) => setReqFlagFilter(e.target.value)} className="form-select">
                  <option value="All">All Triage States</option>
                  <option value="Flagged">Flagged Suspicious Only</option>
                  <option value="Normal">Normal Tickets</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Request ID</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Title & Need</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Location</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Priority</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Integrity Flag</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModerationRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover-row">
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                        {req.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', maxWidth: '280px' }}>
                        <p style={{ fontWeight: 600, color: 'var(--color-navy-950)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {req.title}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {req.category} • Requester: {req.requester?.name}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem' }}>
                        {req.location?.split(',')[0]}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge variant={req.priority === 'High' ? 'red' : req.priority === 'Medium' ? 'amber' : 'slate'}>
                          {req.priority}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {req.isFlagged ? (
                          <div title={req.flagReason}>
                            <Badge variant="red" icon={<AlertTriangle size={12} />}>
                              Flagged
                            </Badge>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-danger-text)', marginTop: '0.2rem' }}>
                              {req.flagReason}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clean</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setViewDetailModal({ type: 'request', data: req })}
                          >
                            Inspect
                          </Button>
                          {req.isFlagged ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                unflagRequest(req.id, currentUser?.name);
                                showNotification(`Unflagged ${req.id}`);
                              }}
                            >
                              Clear Flag
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              style={{ color: 'var(--color-warning-main)' }}
                              onClick={() => handleOpenFlagModal(req)}
                            >
                              Flag
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AUDIT TRAIL                                       */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy-950)', margin: 0 }}>
                Immutable Administrative Audit Trail
              </h3>
              <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                Records every simulated status transition, accreditation decision, flag, and inventory dispatch across the platform.
              </p>
            </div>
          </div>

          {/* Audit Filters */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter logs by record ID, actor, or detail..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              <div style={{ flex: '0 1 200px' }}>
                <select value={auditTypeFilter} onChange={(e) => setAuditTypeFilter(e.target.value)} className="form-select">
                  <option value="All">All Event Types</option>
                  <option value="VERIFICATION_APPROVAL">Verification Approvals</option>
                  <option value="VERIFICATION_REJECTED">Verification Rejections</option>
                  <option value="STATUS_CHANGE">Status Changes</option>
                  <option value="RESOURCE_ALLOCATION">Resource Allocations</option>
                  <option value="VOLUNTEER_ASSIGN">Volunteer Assignments</option>
                  <option value="FLAG_REQUEST">Flags & Alerts</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredAuditLogs.map((log) => (
                <div 
                  key={log.id}
                  style={{
                    padding: '0.85rem 1.15rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                      <Badge variant="teal">{log.actionType}</Badge>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-navy-900)' }}>
                        {log.targetId} ({log.targetType})
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '160px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {log.timestamp}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Actor: {log.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: VISUAL ANALYTICS SUMMARY                          */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy-950)', margin: 0 }}>
              Macro Recovery Operations Visualizer
            </h3>
            <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
              High-level operational health metrics rendered via accessible CSS charts and responsive progress meters.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {/* Status Distribution Meter */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-navy-900)' }}>
                Assistance Ticket Status Funnel
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Submitted & In Intake', count: requests.filter(r => r.status === 'Submitted').length, color: 'var(--color-info-main)' },
                  { label: 'Under Field Verification', count: requests.filter(r => r.status === 'Under Verification').length, color: 'var(--color-warning-main)' },
                  { label: 'Verified & Queued', count: requests.filter(r => r.status === 'Verified').length, color: 'var(--color-teal-600)' },
                  { label: 'Matched & Dispatched', count: requests.filter(r => r.status === 'Matched' || r.status === 'Assistance In Progress').length, color: '#7E22CE' },
                  { label: 'Completed Deliveries', count: requests.filter(r => r.status === 'Completed').length, color: 'var(--color-success-main)' }
                ].map((s, idx) => {
                  const pct = requests.length > 0 ? Math.round((s.count / requests.length) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-semibold" style={{ marginBottom: '0.25rem' }}>
                        <span>{s.label}</span>
                        <span>{s.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: s.color, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assistance Category Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-navy-900)' }}>
                Category Demands Distribution
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Food & Water', color: 'var(--color-info-main)' },
                  { name: 'Shelter', color: '#7E22CE' },
                  { name: 'Medical Assistance', color: 'var(--color-danger-main)' },
                  { name: 'Household Supplies', color: 'var(--color-teal-600)' },
                  { name: 'Transportation', color: 'var(--color-warning-main)' }
                ].map((cat, idx) => {
                  const count = requests.filter(r => r.category === cat.name).length;
                  const pct = requests.length > 0 ? Math.round((count / requests.length) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-semibold" style={{ marginBottom: '0.25rem' }}>
                        <span>{cat.name}</span>
                        <span>{count} Requests ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: cat.color, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* Inspect Item Modal */}
      {viewDetailModal && (
        <Modal
          isOpen={!!viewDetailModal}
          onClose={() => setViewDetailModal(null)}
          title={`Administrative Inspection: ${viewDetailModal.data?.id || 'Record'}`}
          maxWidth="600px"
          footer={
            <Button variant="secondary" onClick={() => setViewDetailModal(null)}>
              Close Inspection
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy-900)', margin: 0 }}>
              {viewDetailModal.data?.name || viewDetailModal.data?.title}
            </h4>

            <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'inherit', margin: 0 }}>
                {JSON.stringify(viewDetailModal.data, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModalData && (
        <Modal
          isOpen={!!rejectModalData}
          onClose={() => setRejectModalData(null)}
          title={`Reject Accreditation: ${rejectModalData.title}`}
          maxWidth="500px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setRejectModalData(null)}>Cancel</Button>
              <Button variant="primary" style={{ backgroundColor: 'var(--color-danger-main)' }} onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmReject}>
            <p className="text-sm text-secondary" style={{ marginBottom: '1rem' }}>
              Specify the administrative justification for declining accreditation or assistance.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g., Incomplete regulatory registration docs; jurisdiction falls outside active disaster mandate."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Flag Request Modal */}
      {flagModalRequest && (
        <Modal
          isOpen={!!flagModalRequest}
          onClose={() => setFlagModalRequest(null)}
          title={`Flag Request ${flagModalRequest.id}`}
          maxWidth="500px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setFlagModalRequest(null)}>Cancel</Button>
              <Button variant="primary" style={{ backgroundColor: 'var(--color-warning-main)' }} onClick={handleConfirmFlag}>
                Flag Ticket
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmFlag}>
            <p className="text-sm text-secondary" style={{ marginBottom: '1rem' }}>
              Flag this ticket for administrative review (e.g. duplicate lodging, irregular volume).
            </p>
            <div className="form-group">
              <label className="form-label">Flag Reason *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g., Duplicate ticket logged from same address within 20 mins."
                value={flagReasonInput}
                onChange={(e) => setFlagReasonInput(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <Modal
          isOpen={showResetConfirmModal}
          onClose={() => setShowResetConfirmModal(false)}
          title="Reset All Demo Data?"
          maxWidth="460px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowResetConfirmModal(false)}>Cancel</Button>
              <Button variant="primary" style={{ backgroundColor: 'var(--color-danger-main)' }} onClick={handleConfirmResetData}>
                Reset Everything
              </Button>
            </div>
          }
        >
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '1rem', color: 'var(--color-warning-text)' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-warning-main)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                This will wipe any requests, inventory edits, or volunteer check-ins you made in localStorage and restore default seed data.
              </p>
            </div>
            <p className="text-xs text-muted">
              Use this before evaluating a new walkthrough session (e.g. Citizen lodging a request through to NGO assignment).
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
