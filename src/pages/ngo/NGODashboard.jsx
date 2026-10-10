import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Users, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Plus, 
  UserCheck, 
  Sparkles, 
  FileText, 
  MapPin, 
  Truck, 
  Activity, 
  Phone 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

export const NGODashboard = () => {
  const { currentUser } = useAuth();
  const { 
    requests, 
    resources, 
    usersList, 
    auditLogs,
    updateRequestStatus, 
    assignVolunteerToRequest, 
    rejectRequest, 
    addResource, 
    updateResourceQuantity, 
    markResourceUnavailable, 
    allocateResource 
  } = useRequests();

  // Active Tab
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'volunteers', 'inventory', 'matching', 'activity'

  // Request Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  // Modals & Action States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignModalData, setAssignModalData] = useState(null); // request to assign
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  
  const [rejectModalData, setRejectModalData] = useState(null); // request to reject
  const [rejectReason, setRejectReason] = useState('');

  const [allocateModalData, setAllocateModalData] = useState(null); // { request, resourceId, quantity }
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [allocateQty, setAllocateQty] = useState(1);

  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [newResourceForm, setNewResourceForm] = useState({
    name: '',
    category: 'Food & Water',
    quantity: 50,
    unit: 'kits',
    minThreshold: 15,
    location: 'Panvel Central Depot',
    notes: ''
  });

  const [editQtyModal, setEditQtyModal] = useState(null);
  const [customQtyValue, setCustomQtyValue] = useState(0);

  const [feedback, setFeedback] = useState(null);

  const showNotification = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Derive volunteers
  const volunteers = useMemo(() => {
    return usersList.filter(u => u.role === 'volunteer');
  }, [usersList]);

  // Derive counts for stat cards
  const incomingRequestsCount = useMemo(() => {
    return requests.filter(r => r.status === 'Submitted' || r.status === 'Under Verification').length;
  }, [requests]);

  const activeAssistanceCount = useMemo(() => {
    return requests.filter(r => r.status === 'Matched' || r.status === 'Assistance In Progress').length;
  }, [requests]);

  const completedCount = useMemo(() => {
    return requests.filter(r => r.status === 'Completed').length;
  }, [requests]);

  const availableVolunteersCount = useMemo(() => {
    return volunteers.filter(v => v.status === 'Available').length;
  }, [volunteers]);

  const totalInventoryUnits = useMemo(() => {
    return resources.reduce((acc, r) => acc + (r.quantity || 0), 0);
  }, [resources]);

  const lowStockCount = useMemo(() => {
    return resources.filter(r => r.status === 'Low Stock' || r.status === 'Critical').length;
  }, [resources]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = 
        req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = categoryFilter === 'All' || req.category === categoryFilter;
      const matchPri = priorityFilter === 'All' || req.priority === priorityFilter;
      const matchStat = statusFilter === 'All' || req.status === statusFilter;
      const matchLoc = locationFilter === 'All' || (req.location && req.location.includes(locationFilter));

      return matchSearch && matchCat && matchPri && matchStat && matchLoc;
    });
  }, [requests, searchQuery, categoryFilter, priorityFilter, statusFilter, locationFilter]);

  // ==========================================
  // Rule-Based Smart Matching Engine (Section 6)
  // ==========================================
  const recommendations = useMemo(() => {
    // Only analyze requests needing assistance
    const eligibleRequests = requests.filter(r => 
      !['Completed', 'Closed', 'Rejected'].includes(r.status)
    );

    return eligibleRequests.map(req => {
      // Find matching resources
      const candidateResources = resources.map(res => {
        let score = 0;
        const reasons = [];

        // Category match
        if (res.category.toLowerCase() === req.category.toLowerCase()) {
          score += 45;
          reasons.push(`Direct category match: ${res.category}`);
        } else {
          reasons.push(`Category mismatch: ${res.category} vs ${req.category}`);
        }

        // Location compatibility (substring match in location string)
        const reqCity = req.location?.toLowerCase() || '';
        const resCity = res.location?.toLowerCase() || '';
        if (
          (reqCity.includes('panvel') && resCity.includes('panvel')) ||
          (reqCity.includes('karjat') && resCity.includes('karjat')) ||
          (reqCity.includes('alibag') && resCity.includes('alibag')) ||
          (reqCity.includes('pen') && resCity.includes('pen'))
        ) {
          score += 30;
          reasons.push(`Proximity: Same sub-district hub (< 8 km)`);
        } else if (resCity.includes('navi mumbai') || reqCity.includes('navi mumbai')) {
          score += 15;
          reasons.push(`Regional transit route available (~20 km)`);
        }

        // Stock availability
        if (res.quantity > 20) {
          score += 15;
          reasons.push(`High available stock (${res.quantity} ${res.unit})`);
        } else if (res.quantity > 0) {
          score += 5;
          reasons.push(`Limited stock available (${res.quantity} ${res.unit})`);
        } else {
          score = 0;
          reasons.push(`Out of stock / 0 units available`);
        }

        // Priority boost
        if (req.priority === 'High') {
          score += 10;
        }

        const matchPercent = Math.min(98, score);
        return {
          resource: res,
          score: matchPercent,
          reasons
        };
      }).sort((a, b) => b.score - a.score);

      // Find candidate volunteers
      const candidateVolunteers = volunteers.map(vol => {
        let vScore = 0;
        const vReasons = [];

        // Availability
        if (vol.status === 'Available') {
          vScore += 40;
          vReasons.push('Volunteer currently available for immediate dispatch');
        } else {
          vScore += 10;
          vReasons.push('Currently assigned to field task');
        }

        // Location match
        const volLoc = vol.location?.toLowerCase() || '';
        const reqLoc = req.location?.toLowerCase() || '';
        if (
          (volLoc.includes('panvel') && reqLoc.includes('panvel')) ||
          (volLoc.includes('karjat') && reqLoc.includes('karjat')) ||
          (volLoc.includes('alibag') && reqLoc.includes('alibag')) ||
          (volLoc.includes('pen') && reqLoc.includes('pen'))
        ) {
          vScore += 35;
          vReasons.push(`Based locally in ${vol.location.split(',')[0]}`);
        } else {
          vScore += 15;
          vReasons.push(`Regional responder: ${vol.location}`);
        }

        // Skill alignment
        const skillMatch = vol.skills?.some(s => 
          s.toLowerCase().includes(req.category.toLowerCase().split(' ')[0]) ||
          (req.category === 'Food & Water' && s.toLowerCase().includes('water')) ||
          (req.category === 'Medical Assistance' && s.toLowerCase().includes('aid')) ||
          (req.category === 'Transportation' && s.toLowerCase().includes('transit'))
        );
        if (skillMatch) {
          vScore += 25;
          vReasons.push('Verified specialized skill badge matching request');
        }

        return {
          volunteer: vol,
          score: Math.min(96, vScore),
          reasons: vReasons
        };
      }).sort((a, b) => b.score - a.score);

      const topResourceMatch = candidateResources[0] || null;
      const topVolunteerMatch = candidateVolunteers[0] || null;

      return {
        request: req,
        topResourceMatch,
        topVolunteerMatch
      };
    });
  }, [requests, resources, volunteers]);

  // Handlers
  const handleAcceptRequest = (req) => {
    updateRequestStatus(req.id, 'Matched', 'Relief request accepted by NGO operations desk. Resources being marshaled.', currentUser?.name || 'Helping Hands Foundation');
    showNotification(`Request ${req.id} accepted! Status advanced to Matched.`);
  };

  const handleOpenAssignModal = (req) => {
    setAssignModalData(req);
    setSelectedVolunteerId(volunteers[0]?.id || '');
  };

  const handleConfirmAssign = () => {
    if (!selectedVolunteerId) return;
    const vol = volunteers.find(v => v.id === selectedVolunteerId);
    assignVolunteerToRequest(assignModalData.id, selectedVolunteerId, vol?.name, currentUser?.name || 'Helping Hands Foundation');
    showNotification(`Assigned ${vol?.name} to ${assignModalData.id}`);
    setAssignModalData(null);
  };

  const handleOpenRejectModal = (req) => {
    setRejectModalData(req);
    setRejectReason('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    rejectRequest(rejectModalData.id, rejectReason.trim(), currentUser?.name || 'Helping Hands Foundation');
    showNotification(`Request ${rejectModalData.id} rejected. Reason recorded in timeline.`, 'info');
    setRejectModalData(null);
  };

  const handleOpenAllocateModal = (req, preselectedResourceId = '') => {
    setAllocateModalData(req);
    setSelectedResourceId(preselectedResourceId || resources[0]?.id || '');
    setAllocateQty(1);
  };

  const handleConfirmAllocate = (e) => {
    e.preventDefault();
    if (!selectedResourceId || allocateQty <= 0) return;
    const res = allocateResource(allocateModalData.id, selectedResourceId, allocateQty, currentUser?.name || 'Helping Hands Foundation');
    if (res.success) {
      showNotification(`Allocated ${allocateQty} units to ${allocateModalData.id}. Inventory updated.`);
      setAllocateModalData(null);
    } else {
      showNotification(res.error, 'danger');
    }
  };

  const handleCreateResource = (e) => {
    e.preventDefault();
    if (!newResourceForm.name.trim()) return;
    addResource(newResourceForm, currentUser?.name || 'Helping Hands Foundation');
    showNotification(`Added new inventory item: ${newResourceForm.name}`);
    setShowAddResourceModal(false);
    setNewResourceForm({
      name: '',
      category: 'Food & Water',
      quantity: 50,
      unit: 'kits',
      minThreshold: 15,
      location: 'Panvel Central Depot',
      notes: ''
    });
  };

  return (
    <div className="ngo-dashboard" style={{ padding: '0 0 3rem' }}>
      {/* Toast Feedback */}
      {feedback && (
        <div 
          className="animate-fade-in"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: feedback.type === 'danger' ? 'var(--color-danger-bg)' : feedback.type === 'info' ? 'var(--color-info-bg)' : 'var(--color-success-bg)',
            border: `1px solid ${feedback.type === 'danger' ? 'var(--color-danger-border)' : feedback.type === 'info' ? 'var(--color-info-border)' : 'var(--color-success-border)'}`,
            color: feedback.type === 'danger' ? 'var(--color-danger-text)' : feedback.type === 'info' ? 'var(--color-info-text)' : 'var(--color-success-text)',
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
              <Badge variant="teal">Operations Center</Badge>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• Tier 1 Verified NGO Partner</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {currentUser?.name || 'Helping Hands Foundation'}
            </h1>
            <p style={{ color: '#94A3B8', marginTop: '0.35rem', maxWidth: '650px', fontSize: '0.95rem' }}>
              Coordinating relief dispatches, field volunteer assignments, and warehouse inventory allocation across active disaster sectors.
            </p>
          </div>

          <div 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.08)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem 1.25rem',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              minWidth: '220px'
            }}
          >
            <div className="flex items-center gap-2" style={{ color: 'var(--color-teal-500)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Building2 size={16} />
              <span>Reg: MAH-2018-NGO-4491</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
              Sector HQ: <strong>Raigad District Relief Depot</strong>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.15rem' }}>
              Contact: <strong>+91 22 2745 8890</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Incoming Requests"
          value={incomingRequestsCount}
          subtext="Submitted or under review"
          icon={<Clock size={22} />}
          colorScheme="amber"
          onClick={() => setActiveTab('requests')}
        />
        <StatCard
          title="Active Missions"
          value={activeAssistanceCount}
          subtext="Matched & field dispatched"
          icon={<Truck size={22} />}
          colorScheme="blue"
          onClick={() => setActiveTab('requests')}
        />
        <StatCard
          title="Available Volunteers"
          value={availableVolunteersCount}
          subtext={`Out of ${volunteers.length} registered responders`}
          icon={<Users size={22} />}
          colorScheme="teal"
          onClick={() => setActiveTab('volunteers')}
        />
        <StatCard
          title="Warehouse Inventory"
          value={totalInventoryUnits}
          subtext="Total tracked aid units"
          icon={<Package size={22} />}
          colorScheme="purple"
          onClick={() => setActiveTab('inventory')}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtext="Items requiring restock"
          icon={<AlertTriangle size={22} />}
          colorScheme="amber"
          onClick={() => setActiveTab('inventory')}
        />
        <StatCard
          title="Cases Completed"
          value={completedCount}
          subtext="Relief handed over"
          icon={<CheckCircle2 size={22} />}
          colorScheme="green"
          onClick={() => setActiveTab('requests')}
        />
      </div>

      {/* Low stock warning banner if any items are low or critical */}
      {lowStockCount > 0 && (
        <div 
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#92400E'
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} style={{ color: '#D97706' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Warehouse Alert: <strong>{lowStockCount} inventory items</strong> are currently below minimum safety thresholds (e.g. Tarpaulins, Infant formula).
            </span>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setActiveTab('inventory')}
          >
            Review Inventory
          </Button>
        </div>
      )}

      {/* Main Tabs Navigation */}
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
          <FileText size={18} />
          <span>Request Dispatch</span>
          <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{requests.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('matching')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'matching' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'matching' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'matching' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Sparkles size={18} style={{ color: 'var(--color-teal-600)' }} />
          <span>Smart Matching</span>
          <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>Rule-Based</span>
        </button>

        <button
          onClick={() => setActiveTab('volunteers')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'volunteers' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'volunteers' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'volunteers' ? 700 : 500,
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
          <span>Volunteer Roster</span>
          <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{volunteers.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'inventory' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'inventory' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'inventory' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={18} />
          <span>Relief Inventory</span>
          <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{resources.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'activity' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'activity' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'activity' ? 700 : 500,
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
          <span>Operational History</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: REQUEST MANAGEMENT                                */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ flex: '1 1 220px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search requests by ID, title, locality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              <div style={{ flex: '0 1 160px' }}>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select">
                  <option value="All">All Categories</option>
                  <option value="Food & Water">Food & Water</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Household Supplies">Household Supplies</option>
                </select>
              </div>

              <div style={{ flex: '0 1 140px' }}>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="form-select">
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div style={{ flex: '0 1 160px' }}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Verified">Verified</option>
                  <option value="Matched">Matched</option>
                  <option value="Assistance In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div style={{ flex: '0 1 150px' }}>
                <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="form-select">
                  <option value="All">All Locations</option>
                  <option value="Panvel">Panvel</option>
                  <option value="Karjat">Karjat</option>
                  <option value="Alibag">Alibag</option>
                  <option value="Pen">Pen</option>
                  <option value="Revdanda">Revdanda</option>
                </select>
              </div>

              {(searchQuery || categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All' || locationFilter !== 'All') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setPriorityFilter('All');
                    setStatusFilter('All');
                    setLocationFilter('All');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Requests Table / Cards */}
          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={<FileText size={48} />}
              title="No Requests Match Filter"
              description="Try adjusting your category, priority, or status filter to view available requests."
            />
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Request ID</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Need & Category</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Location</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Priority</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Assigned Volunteer</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr 
                        key={req.id} 
                        style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}
                        className="hover-row"
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                          {req.id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', maxWidth: '260px' }}>
                          <p style={{ fontWeight: 600, color: 'var(--color-navy-950)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {req.title}
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {req.category} • {req.peopleAffected || 1} persons affected
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-1">
                            <MapPin size={13} style={{ color: 'var(--color-teal-600)', flexShrink: 0 }} />
                            <span>{req.location?.split(',')[0]}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <Badge variant={req.priority === 'High' ? 'red' : req.priority === 'Medium' ? 'amber' : 'slate'} style={{ fontSize: '0.75rem' }}>
                            {req.priority}
                          </Badge>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <StatusBadge status={req.status} />
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                          {req.assignedVolunteer ? (
                            <span style={{ fontWeight: 600, color: 'var(--color-teal-700)' }}>
                              ✓ {req.assignedVolunteer.name}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                            >
                              Review
                            </Button>

                            {req.status !== 'Completed' && req.status !== 'Rejected' && (
                              <>
                                {(!req.assignedVolunteer) && (
                                  <Button 
                                    variant="teal" 
                                    size="sm"
                                    onClick={() => handleOpenAssignModal(req)}
                                  >
                                    Assign
                                  </Button>
                                )}
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleOpenAllocateModal(req)}
                                >
                                  Stock
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SMART RULE-BASED MATCHING (Section 6)             */}
      {/* ======================================================== */}
      {activeTab === 'matching' && (
        <div>
          {/* Explanatory Banner */}
          <div 
            style={{
              backgroundColor: 'var(--color-teal-50)',
              border: '1px solid #99F6E4',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              color: 'var(--color-teal-900)'
            }}
          >
            <div className="flex items-start gap-3">
              <Sparkles size={24} style={{ color: 'var(--color-teal-700)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-teal-900)' }}>
                  Transparent Rule-Based Disaster Assistance Matcher
                </h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', lineHeight: 1.5, color: 'var(--color-teal-800)' }}>
                  This heuristic algorithm cross-analyzes active assistance requests against available warehouse inventory and accredited field volunteer readiness. Recommendations score category compatibility (45%), regional proximity (30%), priority urgency (10%), and current inventory availability (15%).
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recommendations.map(({ request: req, topResourceMatch, topVolunteerMatch }) => (
              <div 
                key={req.id} 
                className="card"
                style={{
                  padding: '1.5rem',
                  borderLeft: req.priority === 'High' ? '4px solid var(--color-danger-main)' : '4px solid var(--color-teal-600)'
                }}
              >
                {/* Request Header */}
                <div className="flex items-center justify-between md-flex-col md-items-start gap-2" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-navy-900)' }}>{req.id}</span>
                    <Badge variant="teal">{req.category}</Badge>
                    <Badge variant={req.priority === 'High' ? 'red' : 'amber'}>{req.priority} Priority</Badge>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="text-xs text-muted">
                    Location: <strong>{req.location}</strong> ({req.peopleAffected || 1} people)
                  </div>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy-950)', marginBottom: '0.5rem' }}>
                  {req.title}
                </h4>

                {/* Match Recommendations Grid */}
                <div className="grid-2" style={{ gap: '1.25rem', marginTop: '1rem' }}>
                  {/* Left: Recommended Resource */}
                  <div 
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                      <span className="text-xs font-bold uppercase text-muted">Recommended Warehouse Supply</span>
                      {topResourceMatch && (
                        <Badge variant={topResourceMatch.score >= 80 ? 'green' : 'amber'}>
                          {topResourceMatch.score}% Match Score
                        </Badge>
                      )}
                    </div>

                    {topResourceMatch ? (
                      <div>
                        <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy-900)', margin: '0.2rem 0' }}>
                          {topResourceMatch.resource.name}
                        </h5>
                        <p className="text-xs text-muted" style={{ marginBottom: '0.75rem' }}>
                          Available: <strong>{topResourceMatch.resource.quantity} {topResourceMatch.resource.unit}</strong> at {topResourceMatch.resource.location}
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                          <p className="text-xs font-semibold text-muted" style={{ marginBottom: '0.25rem' }}>Matching Heuristic Factors:</p>
                          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {topResourceMatch.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          variant="teal"
                          size="sm"
                          icon={<Package size={15} />}
                          onClick={() => handleOpenAllocateModal(req, topResourceMatch.resource.id)}
                          disabled={topResourceMatch.resource.quantity <= 0}
                        >
                          Allocate This Supply
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted">No inventory item currently matches this category.</p>
                    )}
                  </div>

                  {/* Right: Recommended Volunteer */}
                  <div 
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                      <span className="text-xs font-bold uppercase text-muted">Recommended Field Volunteer</span>
                      {topVolunteerMatch && (
                        <Badge variant={topVolunteerMatch.score >= 80 ? 'green' : 'amber'}>
                          {topVolunteerMatch.score}% Readiness
                        </Badge>
                      )}
                    </div>

                    {topVolunteerMatch ? (
                      <div>
                        <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy-900)', margin: '0.2rem 0' }}>
                          {topVolunteerMatch.volunteer.name}
                        </h5>
                        <p className="text-xs text-muted" style={{ marginBottom: '0.75rem' }}>
                          Status: <strong style={{ color: topVolunteerMatch.volunteer.status === 'Available' ? 'var(--color-success-text)' : 'var(--color-warning-text)' }}>{topVolunteerMatch.volunteer.status}</strong> • Based in {topVolunteerMatch.volunteer.location}
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                          <p className="text-xs font-semibold text-muted" style={{ marginBottom: '0.25rem' }}>Heuristic Match Rationale:</p>
                          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {topVolunteerMatch.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          icon={<UserCheck size={15} />}
                          onClick={() => {
                            setAssignModalData(req);
                            setSelectedVolunteerId(topVolunteerMatch.volunteer.id);
                          }}
                        >
                          Dispatch {topVolunteerMatch.volunteer.name.split(' ')[0]}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted">No field volunteer available for assignment.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: VOLUNTEER ROSTER MANAGEMENT                       */}
      {/* ======================================================== */}
      {activeTab === 'volunteers' && (
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy-950)', margin: 0 }}>
                Accredited Volunteer Responders Roster
              </h3>
              <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                Monitors real-time responder mobilization, current field mission loads, and specialized skill credentials.
              </p>
            </div>
          </div>

          <div className="grid-3" style={{ gap: '1.25rem' }}>
            {volunteers.map((vol) => (
              <div 
                key={vol.id} 
                className="card"
                style={{ padding: '1.25rem' }}
              >
                <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                  <img 
                    src={vol.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'} 
                    alt={vol.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy-900)', margin: 0 }}>
                      {vol.name}
                    </h4>
                    <span className="text-xs text-muted">{vol.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                  <Badge variant={vol.status === 'Available' ? 'green' : 'amber'}>
                    {vol.status || 'Available'}
                  </Badge>
                  {vol.badge && <Badge variant="teal">{vol.badge}</Badge>}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                  {vol.bio || 'Accredited field responder mobilized for regional flood rehabilitation.'}
                </p>

                <div style={{ marginBottom: '0.75rem' }}>
                  <p className="text-xs font-semibold text-muted" style={{ marginBottom: '0.35rem' }}>Verified Skills:</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {(vol.skills || ['Relief Distribution']).map((s, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.45rem',
                          backgroundColor: 'var(--bg-muted)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div 
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>Missions: <strong>{vol.completedTasksCount || 10} completed</strong></span>
                  <div className="flex items-center gap-1 text-teal font-semibold">
                    <Phone size={12} />
                    <span>{vol.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RELIEF INVENTORY MANAGEMENT                       */}
      {/* ======================================================== */}
      {activeTab === 'inventory' && (
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy-950)', margin: 0 }}>
                Relief Supplies & Warehouse Stock
              </h3>
              <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                Manage physical humanitarian items across depots in Panvel, Karjat, Alibag, and Pen.
              </p>
            </div>
            <Button 
              variant="teal" 
              icon={<Plus size={16} />}
              onClick={() => setShowAddResourceModal(true)}
            >
              Add New Resource
            </Button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Item Name</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Available Quantity</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Depot Location</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Stock Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Last Updated</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((item) => (
                    <tr 
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      className="hover-row"
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-navy-900)' }}>
                          {item.name}
                        </span>
                        {item.notes && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge variant={item.category === 'Food & Water' ? 'blue' : item.category === 'Medical Assistance' ? 'red' : 'purple'}>
                          {item.category}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: item.quantity <= item.minThreshold ? 'var(--color-danger-main)' : 'var(--color-navy-900)' }}>
                          {item.quantity} {item.unit}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Min Threshold: {item.minThreshold} {item.unit}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem' }}>
                        <div className="flex items-center gap-1">
                          <MapPin size={13} style={{ color: 'var(--color-teal-600)' }} />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge variant={item.status === 'In Stock' ? 'green' : item.status === 'Low Stock' ? 'amber' : 'red'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.lastUpdated || 'Today'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setEditQtyModal(item);
                              setCustomQtyValue(item.quantity);
                            }}
                          >
                            Adjust Qty
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            style={{ color: 'var(--color-danger-main)' }}
                            onClick={() => markResourceUnavailable(item.id)}
                            title="Mark Zero Stock"
                          >
                            Deplete
                          </Button>
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
      {/* TAB 5: OPERATIONAL ACTIVITY HISTORY                      */}
      {/* ======================================================== */}
      {activeTab === 'activity' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy-950)', margin: 0 }}>
              Recent NGO Operations Trail
            </h3>
            <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
              Chronological log of dispatches, inventory movements, and status transitions recorded in the shared recovery state.
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.map((log) => (
                <div 
                  key={log.id}
                  style={{
                    padding: '0.85rem 1rem',
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
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                      <Badge variant="teal" style={{ fontSize: '0.7rem' }}>{log.actionType}</Badge>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-navy-900)' }}>
                        Target: {log.targetId} ({log.targetType})
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '140px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {log.timestamp}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      By: {log.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* Review Request Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Review Request: ${selectedRequest.id}`}
          maxWidth="640px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              {selectedRequest.status !== 'Completed' && selectedRequest.status !== 'Rejected' && (
                <>
                  <Button 
                    variant="ghost" 
                    style={{ color: 'var(--color-danger-main)' }}
                    onClick={() => {
                      const r = selectedRequest;
                      setSelectedRequest(null);
                      handleOpenRejectModal(r);
                    }}
                  >
                    Reject with Reason
                  </Button>
                  <Button 
                    variant="teal" 
                    onClick={() => {
                      handleAcceptRequest(selectedRequest);
                      setSelectedRequest(null);
                    }}
                  >
                    Accept Request
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex items-center gap-2">
              <Badge variant="teal">{selectedRequest.category}</Badge>
              <Badge variant={selectedRequest.priority === 'High' ? 'red' : 'amber'}>{selectedRequest.priority} Priority</Badge>
              <StatusBadge status={selectedRequest.status} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                {selectedRequest.title}
              </h4>
              <p style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {selectedRequest.description}
              </p>
            </div>

            <div 
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <span className="text-xs text-muted uppercase font-bold">Requester</span>
                <p style={{ fontWeight: 700, margin: '0.1rem 0' }}>{selectedRequest.requester?.name}</p>
                <span className="text-muted">{selectedRequest.requester?.phone}</span>
              </div>
              <div>
                <span className="text-xs text-muted uppercase font-bold">Location</span>
                <p style={{ fontWeight: 600, margin: '0.1rem 0' }}>{selectedRequest.location}</p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Operational History & Timeline
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(selectedRequest.timeline || []).map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={13} style={{ color: 'var(--color-teal-600)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong>{t.step}</strong> <span className="text-muted">({t.timestamp})</span>: {t.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Volunteer Modal */}
      {assignModalData && (
        <Modal
          isOpen={!!assignModalData}
          onClose={() => setAssignModalData(null)}
          title={`Assign Volunteer to ${assignModalData.id}`}
          maxWidth="500px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setAssignModalData(null)}>Cancel</Button>
              <Button variant="teal" onClick={handleConfirmAssign}>Confirm Assignment</Button>
            </div>
          }
        >
          <div>
            <p className="text-sm text-secondary" style={{ marginBottom: '1rem' }}>
              Select an accredited responder from the roster to dispatch for request: <strong>{assignModalData.title}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Available Field Volunteers</label>
              <select
                className="form-select"
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
              >
                {volunteers.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.status}) — {v.location.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Request Modal */}
      {rejectModalData && (
        <Modal
          isOpen={!!rejectModalData}
          onClose={() => setRejectModalData(null)}
          title={`Reject Request ${rejectModalData.id}`}
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
              Please provide an explanatory reason for declining this request. The reason will be recorded on the citizen timeline.
            </p>
            <div className="form-group">
              <label className="form-label">Reason for Rejection *</label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g., Outside active operations sector; duplicate ticket identified; already supported by local civil defense."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Allocate Resource Modal */}
      {allocateModalData && (
        <Modal
          isOpen={!!allocateModalData}
          onClose={() => setAllocateModalData(null)}
          title={`Allocate Warehouse Inventory: ${allocateModalData.id}`}
          maxWidth="520px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setAllocateModalData(null)}>Cancel</Button>
              <Button variant="teal" onClick={handleConfirmAllocate}>Confirm Allocation</Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmAllocate}>
            <p className="text-sm text-secondary" style={{ marginBottom: '1rem' }}>
              Deduct inventory from central relief depot and assign to request: <strong>{allocateModalData.title}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Select Warehouse Resource Item</label>
              <select
                className="form-select"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
              >
                {resources.map(res => (
                  <option key={res.id} value={res.id} disabled={res.quantity <= 0}>
                    {res.name} ({res.quantity} {res.unit} available) — {res.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity to Allocate</label>
              <input
                type="number"
                min="1"
                max={resources.find(r => r.id === selectedResourceId)?.quantity || 100}
                className="form-input"
                value={allocateQty}
                onChange={(e) => setAllocateQty(Number(e.target.value))}
              />
              <span className="form-help">Inventory balance will be updated automatically in real time.</span>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Resource Modal */}
      {showAddResourceModal && (
        <Modal
          isOpen={showAddResourceModal}
          onClose={() => setShowAddResourceModal(false)}
          title="Add New Relief Resource"
          maxWidth="540px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowAddResourceModal(false)}>Cancel</Button>
              <Button variant="teal" onClick={handleCreateResource}>Save Inventory Item</Button>
            </div>
          }
        >
          <form onSubmit={handleCreateResource}>
            <div className="form-group">
              <label className="form-label">Resource Item Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g., Heavy-Duty Chlorine Disinfection Tablets"
                value={newResourceForm.name}
                onChange={(e) => setNewResourceForm({ ...newResourceForm, name: e.target.value })}
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newResourceForm.category}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, category: e.target.value })}
                >
                  <option value="Food & Water">Food & Water</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Household Supplies">Household Supplies</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity Unit</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., cans, kits, sheets"
                  value={newResourceForm.unit}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, unit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Available Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newResourceForm.quantity}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, quantity: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Low Stock Threshold</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={newResourceForm.minThreshold}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, minThreshold: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Depot / Warehouse Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Panvel Central Depot"
                value={newResourceForm.location}
                onChange={(e) => setNewResourceForm({ ...newResourceForm, location: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Adjust Quantity Modal */}
      {editQtyModal && (
        <Modal
          isOpen={!!editQtyModal}
          onClose={() => setEditQtyModal(null)}
          title={`Adjust Inventory: ${editQtyModal.name}`}
          maxWidth="440px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setEditQtyModal(null)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  updateResourceQuantity(editQtyModal.id, customQtyValue);
                  showNotification(`Updated ${editQtyModal.name} stock to ${customQtyValue} ${editQtyModal.unit}`);
                  setEditQtyModal(null);
                }}
              >
                Save Quantity
              </Button>
            </div>
          }
        >
          <div>
            <p className="text-sm text-secondary" style={{ marginBottom: '1rem' }}>
              Set new available stock count in <strong>{editQtyModal.location}</strong>:
            </p>
            <div className="form-group">
              <label className="form-label">Available Quantity ({editQtyModal.unit})</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={customQtyValue}
                onChange={(e) => setCustomQtyValue(Number(e.target.value))}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NGODashboard;
