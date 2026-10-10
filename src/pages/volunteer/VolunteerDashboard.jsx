import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  AlertTriangle, 
  Search, 
  HeartHandshake, 
  UserCheck, 
  FileText, 
  Truck, 
  CheckCircle, 
  X, 
  MessageSquare, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

export const VolunteerDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    requests, 
    acceptVolunteerTask, 
    addVolunteerCheckIn, 
    completeVolunteerTask 
  } = useRequests();

  // Active Tab
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'pool', 'history'

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  // Modal States
  const [selectedTask, setSelectedTask] = useState(null);
  const [checkInModalTask, setCheckInModalTask] = useState(null);
  const [checkInNote, setCheckInNote] = useState('');
  const [completeModalTask, setCompleteModalTask] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Helper to show brief feedback
  const showFeedback = (text, type = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Check if a request is assigned to current volunteer
  const isAssignedToMe = (req) => {
    if (!req.assignedVolunteer) return false;
    if (req.assignedVolunteer.id && currentUser?.id && req.assignedVolunteer.id === currentUser.id) return true;
    if (req.assignedVolunteer.name && currentUser?.name && req.assignedVolunteer.name.toLowerCase() === currentUser.name.toLowerCase()) return true;
    // Default fallback for demo user 'Priya Mehta'
    if (currentUser?.role === 'volunteer' && (req.assignedVolunteer.name === 'Priya Mehta' || req.assignedVolunteer.id === 'vol-1')) return true;
    return false;
  };

  // Derive task collections
  const myAssignedTasks = useMemo(() => {
    return requests.filter(r => isAssignedToMe(r) && r.status !== 'Completed' && r.status !== 'Closed');
  }, [requests, currentUser]);

  const availableTasksPool = useMemo(() => {
    // Tasks that are Verified or Matched without active volunteer assignment, or all verified needs
    return requests.filter(r => 
      !isAssignedToMe(r) && 
      r.status !== 'Completed' && 
      r.status !== 'Closed' &&
      r.status !== 'Rejected' &&
      (r.status === 'Verified' || (r.status === 'Matched' && !r.assignedVolunteer))
    );
  }, [requests, currentUser]);

  const completedTasks = useMemo(() => {
    return requests.filter(r => (isAssignedToMe(r) && (r.status === 'Completed' || r.status === 'Closed')) || r.status === 'Completed');
  }, [requests, currentUser]);

  // Tab Dataset selector
  const currentTabDataset = useMemo(() => {
    if (activeTab === 'assigned') return myAssignedTasks;
    if (activeTab === 'pool') return availableTasksPool;
    if (activeTab === 'history') return completedTasks;
    return [];
  }, [activeTab, myAssignedTasks, availableTasksPool, completedTasks]);

  // Filtered dataset
  const filteredTasks = useMemo(() => {
    return currentTabDataset.filter(task => {
      const matchesSearch = 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesLocation = locationFilter === 'All' || (task.location && task.location.includes(locationFilter));

      return matchesSearch && matchesCategory && matchesPriority && matchesLocation;
    });
  }, [currentTabDataset, searchQuery, categoryFilter, priorityFilter, locationFilter]);

  // Statistics
  const inProgressCount = myAssignedTasks.filter(t => t.status === 'Assistance In Progress').length;
  const pendingCount = myAssignedTasks.filter(t => t.status !== 'Assistance In Progress').length;

  // Handlers
  const handleAcceptTask = (task) => {
    const result = acceptVolunteerTask(task.id, currentUser || { name: 'Priya Mehta', id: 'user-v1', phone: '+91 98192 33412', badge: 'Certified Responder' });
    if (result?.success === false) {
      showFeedback(result.error, 'danger');
      return;
    }
    showFeedback(`Task ${task.id} accepted! Status moved to In Progress.`, 'success');
    if (selectedTask?.id === task.id) setSelectedTask(null);
  };

  const handleOpenCheckIn = (task) => {
    setCheckInModalTask(task);
    setCheckInNote('');
  };

  const handleSubmitCheckIn = (e) => {
    e.preventDefault();
    if (!checkInNote.trim()) return;
    addVolunteerCheckIn(checkInModalTask.id, checkInNote.trim(), currentUser?.name || 'Priya Mehta');
    showFeedback(`Check-in note logged for ${checkInModalTask.id}.`, 'info');
    setCheckInModalTask(null);
    setCheckInNote('');
    if (selectedTask?.id === checkInModalTask.id) {
      // Refresh selected modal
      const updated = requests.find(r => r.id === checkInModalTask.id);
      setSelectedTask(updated);
    }
  };

  const handleOpenComplete = (task) => {
    setCompleteModalTask(task);
    setCompletionNote('');
    setProofDescription('');
  };

  const handleSubmitComplete = (e) => {
    e.preventDefault();
    if (!completionNote.trim()) return;
    completeVolunteerTask(
      completeModalTask.id, 
      completionNote.trim(), 
      proofDescription.trim() || 'In-person relief handover confirmed.', 
      currentUser || { name: 'Priya Mehta', id: 'user-v1' }
    );
    showFeedback(`Task ${completeModalTask.id} marked Completed! Notification sent to requester.`, 'success');
    setCompleteModalTask(null);
    setCompletionNote('');
    setProofDescription('');
    if (selectedTask?.id === completeModalTask.id) setSelectedTask(null);
  };

  return (
    <div className="volunteer-dashboard" style={{ padding: '0 0 3rem' }}>
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div 
          className="animate-fade-in"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: feedbackMessage.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-info-bg)',
            border: `1px solid ${feedbackMessage.type === 'success' ? 'var(--color-success-border)' : 'var(--color-info-border)'}`,
            color: feedbackMessage.type === 'success' ? 'var(--color-success-text)' : 'var(--color-info-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hero / Header Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          color: 'var(--bg-surface)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="flex items-start justify-between md-flex-col gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Badge variant="teal">Volunteer Mobilization Desk</Badge>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• Verified Field Responder</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--bg-surface)', margin: 0 }}>
              Welcome back, {currentUser?.name || 'Priya Mehta'}
            </h1>
            <p style={{ color: '#94A3B8', marginTop: '0.35rem', maxWidth: '650px', fontSize: '0.95rem' }}>
              Your accredited field station for receiving relief requests, logging check-ins in disaster hamlets, and delivering verified aid packages.
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
              <ShieldCheck size={16} />
              <span>Accreditation Active</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
              Skills: <strong>First Aid, Water Purification, Cargo</strong>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.15rem' }}>
              District Sector: <strong>Panvel & Revdanda</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Assigned To Me"
          value={myAssignedTasks.length}
          subtext="Active field assignments"
          icon={<UserCheck size={22} />}
          colorScheme="teal"
          onClick={() => setActiveTab('assigned')}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtext="Active transit or dispatch"
          icon={<Truck size={22} />}
          colorScheme="blue"
          onClick={() => setActiveTab('assigned')}
        />
        <StatCard
          title="Available In Pool"
          value={availableTasksPool.length}
          subtext="Verified needs awaiting help"
          icon={<HeartHandshake size={22} />}
          colorScheme="amber"
          onClick={() => setActiveTab('pool')}
        />
        <StatCard
          title="Tasks Completed"
          value={completedTasks.length}
          subtext="Handed over & signed off"
          icon={<CheckCircle size={22} />}
          colorScheme="green"
          onClick={() => setActiveTab('history')}
        />
      </div>

      {/* Tabs Bar */}
      <div 
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          gap: '0.5rem'
        }}
      >
        <button
          onClick={() => setActiveTab('assigned')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'assigned' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'assigned' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'assigned' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px'
          }}
        >
          <UserCheck size={18} />
          <span>My Assigned Tasks</span>
          <span 
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeTab === 'assigned' ? 'var(--color-teal-600)' : 'var(--bg-muted)',
              color: activeTab === 'assigned' ? 'var(--bg-surface)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {myAssignedTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pool')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pool' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'pool' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'pool' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px'
          }}
        >
          <HeartHandshake size={18} />
          <span>Available Assistance Pool</span>
          <span 
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeTab === 'pool' ? 'var(--color-teal-600)' : 'var(--bg-muted)',
              color: activeTab === 'pool' ? 'var(--bg-surface)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {availableTasksPool.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--color-teal-600)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--color-teal-700)' : 'var(--text-muted)',
            fontWeight: activeTab === 'history' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px'
          }}
        >
          <CheckCircle size={18} />
          <span>Completed Task History</span>
          <span 
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeTab === 'history' ? 'var(--color-teal-600)' : 'var(--bg-muted)',
              color: activeTab === 'history' ? 'var(--bg-surface)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, keyword, address, requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Categories</option>
              <option value="Food & Water">Food & Water</option>
              <option value="Medical Assistance">Medical Assistance</option>
              <option value="Shelter">Shelter</option>
              <option value="Transportation">Transportation</option>
              <option value="Household Supplies">Household Supplies</option>
              <option value="Clothing">Clothing</option>
            </select>
          </div>

          <div style={{ flex: '0 1 140px' }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div style={{ flex: '0 1 160px' }}>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Locations</option>
              <option value="Panvel">Panvel</option>
              <option value="Karjat">Karjat</option>
              <option value="Alibag">Alibag</option>
              <option value="Pen">Pen</option>
              <option value="Revdanda">Revdanda</option>
              <option value="Navi Mumbai">Navi Mumbai</option>
            </select>
          </div>

          {(searchQuery || categoryFilter !== 'All' || priorityFilter !== 'All' || locationFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setPriorityFilter('All');
                setLocationFilter('All');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Task List / Grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title={activeTab === 'assigned' ? 'No Assigned Tasks Matching Filters' : activeTab === 'pool' ? 'No Open Pool Tasks Available' : 'No Completed Tasks Found'}
          description="Try adjusting your search criteria or switch to another view tab."
          actionText={activeTab === 'assigned' ? 'Browse Available Pool' : null}
          onAction={activeTab === 'assigned' ? () => setActiveTab('pool') : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.map((task) => {
            const isAssigned = isAssignedToMe(task);
            const isCompleted = task.status === 'Completed' || task.status === 'Closed';

            return (
              <div 
                key={task.id}
                className="card card-hover"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  borderLeft: task.priority === 'High' ? '4px solid var(--color-danger-main)' : task.priority === 'Medium' ? '4px solid var(--color-warning-main)' : '4px solid var(--color-teal-600)'
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Top Meta */}
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.45rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {task.id}
                    </span>
                    <Badge variant={task.category === 'Medical Assistance' ? 'red' : task.category === 'Food & Water' ? 'blue' : task.category === 'Shelter' ? 'purple' : 'teal'}>
                      {task.category}
                    </Badge>
                    <Badge variant={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'amber' : 'slate'}>
                      {task.priority} Priority
                    </Badge>
                    <StatusBadge status={task.status} />
                    {task.isFlagged && (
                      <Badge variant="amber" icon={<AlertTriangle size={12} />}>
                        Flagged Review
                      </Badge>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {task.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.75rem', maxWidth: '850px' }}>
                    {task.description}
                  </p>

                  {/* Meta details */}
                  <div className="flex items-center gap-4 flex-wrap text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} style={{ color: 'var(--color-teal-600)' }} />
                      <span>{task.location}</span>
                    </div>
                    <div>
                      People Affected: <strong style={{ color: 'var(--text-primary)' }}>{task.peopleAffected || 1}</strong>
                    </div>
                    {task.requester && (
                      <div>
                        Requester: <strong style={{ color: 'var(--text-primary)' }}>{task.requester.name}</strong> ({task.requester.type || 'Citizen'})
                      </div>
                    )}
                    {task.checkInNotes && task.checkInNotes.length > 0 && (
                      <div className="flex items-center gap-1" style={{ color: 'var(--color-info-text)' }}>
                        <MessageSquare size={13} />
                        <span>{task.checkInNotes.length} Field Update{task.checkInNotes.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* If completed, show completion note preview */}
                  {task.completionNote && (
                    <div 
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 0.85rem',
                        backgroundColor: 'var(--color-success-bg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.825rem',
                        color: 'var(--color-success-text)'
                      }}
                    >
                      <strong>Delivery Handover Note:</strong> {task.completionNote}
                    </div>
                  )}
                </div>

                {/* Action Buttons Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px', alignItems: 'stretch' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedTask(task)}
                  >
                    View Details
                  </Button>

                  {/* Tab-dependent primary actions */}
                  {activeTab === 'pool' && (
                    <Button
                      variant="teal"
                      size="sm"
                      icon={<CheckCircle2 size={16} />}
                      onClick={() => handleAcceptTask(task)}
                    >
                      Accept Task
                    </Button>
                  )}

                  {activeTab === 'assigned' && !isCompleted && (
                    <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        icon={<MessageSquare size={15} />}
                        onClick={() => handleOpenCheckIn(task)}
                      >
                        Field Check-in
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle size={15} />}
                        onClick={() => handleOpenComplete(task)}
                      >
                        Mark Completed
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Task Details: ${selectedTask.id}`}
          maxWidth="680px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
              {!isAssignedToMe(selectedTask) && selectedTask.status !== 'Completed' && (
                <Button 
                  variant="teal" 
                  icon={<CheckCircle2 size={16} />}
                  onClick={() => handleAcceptTask(selectedTask)}
                >
                  Accept Task
                </Button>
              )}
              {isAssignedToMe(selectedTask) && selectedTask.status !== 'Completed' && (
                <>
                  <Button 
                    variant="outline-primary" 
                    icon={<MessageSquare size={16} />}
                    onClick={() => {
                      const t = selectedTask;
                      setSelectedTask(null);
                      handleOpenCheckIn(t);
                    }}
                  >
                    Check-in Note
                  </Button>
                  <Button 
                    variant="primary" 
                    icon={<CheckCircle size={16} />}
                    onClick={() => {
                      const t = selectedTask;
                      setSelectedTask(null);
                      handleOpenComplete(t);
                    }}
                  >
                    Mark Completed
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="teal">{selectedTask.category}</Badge>
              <Badge variant={selectedTask.priority === 'High' ? 'red' : 'amber'}>{selectedTask.priority} Priority</Badge>
              <StatusBadge status={selectedTask.status} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedTask.title}
              </h4>
              <p style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem' }}>
                {selectedTask.description}
              </p>
            </div>

            {/* Requester & Location Info Box */}
            <div 
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}
            >
              <div>
                <p className="text-xs text-muted font-semibold uppercase">Requester Info (Demo)</p>
                <p style={{ fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-primary)' }}>
                  {selectedTask.requester?.name || 'Rahul Sharma'}
                </p>
                <p className="text-xs text-muted">{selectedTask.requester?.phone || '+91 98201 44521'}</p>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  Households affected: <strong>{selectedTask.peopleAffected || 1} persons</strong>
                </p>
              </div>

              <div>
                <p className="text-xs text-muted font-semibold uppercase">Geographic Location</p>
                <p style={{ fontWeight: 600, marginTop: '0.2rem', fontSize: '0.875rem' }}>
                  {selectedTask.location}
                </p>
                {selectedTask.accessibility && (
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                    Special need: <span style={{ color: 'var(--color-warning-text)', fontWeight: 600 }}>{selectedTask.accessibility}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Items Needed */}
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Assistance Supplies Required
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(selectedTask.itemsNeeded || [{ item: `${selectedTask.category} package`, qty: 1, unit: 'units' }]).map((it, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span>{it.item}</span>
                    <strong style={{ color: 'var(--color-teal-700)' }}>{it.qty} {it.unit}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-In History if any */}
            {selectedTask.checkInNotes && selectedTask.checkInNotes.length > 0 && (
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Field Check-in History
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedTask.checkInNotes.map((ci, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--color-info-bg)',
                        border: '1px solid var(--color-info-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.2rem', color: 'var(--color-info-text)', fontWeight: 600 }}>
                        <span>{ci.author}</span>
                        <span style={{ fontSize: '0.75rem' }}>{ci.timestamp}</span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', margin: 0 }}>{ci.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Request Activity Milestones
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(selectedTask.timeline || []).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={14} style={{ color: 'var(--color-teal-600)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{step.step}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({step.timestamp})</span>
                      <p style={{ color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Field Check-In Modal */}
      {checkInModalTask && (
        <Modal
          isOpen={!!checkInModalTask}
          onClose={() => setCheckInModalTask(null)}
          title={`Log Field Progress Check-in (${checkInModalTask.id})`}
          maxWidth="520px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setCheckInModalTask(null)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmitCheckIn}
                disabled={!checkInNote.trim()}
              >
                Save Progress Note
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitCheckIn}>
            <p className="text-sm text-secondary" style={{ marginBottom: '1rem' }}>
              Record a field transit note or operational checkpoint. This will be appended to the request timeline and visible to coordinating NGOs and the citizen.
            </p>
            <div className="form-group">
              <label className="form-label">Progress Note / Check-in Details *</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                placeholder="e.g., Arrived at Sector 12 community hall with 40 cans of water. Handing over to ground coordinator."
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
              />
              <span className="form-help">Include route accessibility or ETA updates if applicable.</span>
            </div>
          </form>
        </Modal>
      )}

      {/* Complete Task Modal */}
      {completeModalTask && (
        <Modal
          isOpen={!!completeModalTask}
          onClose={() => setCompleteModalTask(null)}
          title={`Mark Task Completed: ${completeModalTask.id}`}
          maxWidth="520px"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setCompleteModalTask(null)}>
                Cancel
              </Button>
              <Button 
                variant="teal" 
                onClick={handleSubmitComplete}
                disabled={!completionNote.trim()}
              >
                Confirm Completion
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitComplete}>
            <div 
              style={{
                backgroundColor: 'var(--color-teal-50)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: '1px solid #99F6E4',
                fontSize: '0.85rem',
                color: 'var(--color-teal-700)'
              }}
            >
              <strong>Completion Notice:</strong> Marking this task completed updates the central recovery registry, sends a completion notification to the citizen, and logs your successful contribution.
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Note & Citizen Acknowledgment *</label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g., 20L clean water canisters safely unloaded and handed over to household representative Rahul Sharma."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Proof / Verification Description (Demo)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Physical signature receipt signed by recipient; photo logged on tally sheet."
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
              />
              <span className="form-help">Enter delivery confirmation or receipt reference for audit integrity.</span>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default VolunteerDashboard;
