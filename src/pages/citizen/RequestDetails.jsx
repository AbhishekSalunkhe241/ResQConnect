import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Accessibility, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  RefreshCw, 
  PackageCheck, 
  ShieldCheck, 
  HelpCircle, 
  FileText 
} from 'lucide-react';
import { useRequests } from '../../context/RequestContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import RequestTimeline from '../../components/RequestTimeline';
import { STATUS_STEPS } from '../../data/mockRequests';

export const RequestDetails = () => {
  const { id } = useParams();
  const { getRequestById, advanceRequestStatus, updateRequestStatus } = useRequests();

  const [simulating, setSimulating] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  const request = getRequestById(id);

  if (!request) {
    return (
      <div style={{ maxWidth: '820px', margin: '2rem auto' }} className="animate-fade-in">
        <EmptyState
          icon={<HelpCircle size={48} style={{ color: 'var(--color-navy-600)' }} />}
          title={`Request ${id} Not Found`}
          description="We couldn't locate this recovery assistance ticket in the registry. It may have been archived or entered under a different reference ID."
          action={
            <Button to="/citizen/requests" variant="primary" icon={<ArrowLeft size={16} />}>
              Back to My Requests
            </Button>
          }
        />
      </div>
    );
  }

  // Next status simulation handler
  const handleSimulateNextStatus = () => {
    setSimulating(true);
    const nextStatus = advanceRequestStatus(request.id);
    setSuccessBanner(`Simulated status transition: now "${nextStatus}".`);
    setTimeout(() => {
      setSimulating(false);
    }, 400);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  const handleManualStatusChange = (newStatus) => {
    updateRequestStatus(request.id, newStatus);
    setSuccessBanner(`Directly moved request to "${newStatus}".`);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 3500);
  };

  // Determine dynamic next step card content
  const getNextStepContent = (status) => {
    switch (status) {
      case 'Submitted':
        return {
          title: 'Request Intake Queued',
          text: 'Your request has been submitted and is currently queued for intake. An on-ground community coordinator will verify the request requirements before routing to verified recovery partners.',
          actionText: 'Verification pending (est. 1-3 hrs)',
          icon: <Clock size={20} style={{ color: 'var(--color-primary-600)' }} />,
          bg: 'var(--color-primary-50)',
          border: 'var(--color-primary-200)'
        };
      case 'Under Verification':
        return {
          title: 'Under Field Review',
          text: 'Your request has been submitted and is currently being reviewed. Once verified, the system can match it with available organizations or volunteers.',
          actionText: 'Reviewing household validation & locality accessibility',
          icon: <Info size={20} style={{ color: 'var(--color-warning-main)' }} />,
          bg: 'var(--color-warning-bg)',
          border: 'var(--color-warning-border)'
        };
      case 'Verified':
        return {
          title: 'Verified & Matching Partner',
          text: 'Your request has been verified and is ready for matching. Available NGO supply depots in Panvel and Raigad district are reviewing requested item inventories.',
          actionText: 'Awaiting dispatch confirmation from partner hub',
          icon: <ShieldCheck size={20} style={{ color: 'var(--color-teal-600)' }} />,
          bg: 'var(--color-teal-50)',
          border: 'var(--color-teal-200)'
        };
      case 'Matched':
        return {
          title: 'Assistance Partner Matched',
          text: 'A recovery organization has been matched to your request. Relief supplies are allocated and field volunteers are coordinating delivery logistics.',
          actionText: 'Preparing supply packs for transit',
          icon: <Building2 size={20} style={{ color: '#7E22CE' }} />,
          bg: '#F5F3FF',
          border: '#DDD6FE'
        };
      case 'Assistance In Progress':
        return {
          title: 'Assistance In Transit & Coordination',
          text: 'Assistance is currently being coordinated. Mobile response units are en route to your recorded address. Please ensure contact phone remains reachable.',
          actionText: 'Volunteer dispatched with items',
          icon: <PackageCheck size={20} style={{ color: 'var(--color-primary-600)' }} />,
          bg: 'var(--color-primary-50)',
          border: 'var(--color-primary-200)'
        };
      case 'Completed':
        return {
          title: 'Assistance Completed',
          text: 'The requested assistance has been completed. All specified relief supplies and services have been delivered and confirmed with the household.',
          actionText: 'Dignified handover documented',
          icon: <CheckCircle2 size={20} style={{ color: 'var(--color-success-main)' }} />,
          bg: 'var(--color-success-bg)',
          border: 'var(--color-success-border)'
        };
      case 'Closed':
        return {
          title: 'Request Resolved & Archived',
          text: 'This recovery ticket has reached closure. All coordination logs have been preserved for community audit transparency.',
          actionText: 'Ticket closed in system',
          icon: <CheckCircle2 size={20} style={{ color: 'var(--text-muted)' }} />,
          bg: 'var(--bg-muted)',
          border: 'var(--border-default)'
        };
      default:
        return {
          title: 'Processing Request',
          text: 'Your request is in active workflow processing.',
          actionText: 'Status updating',
          icon: <Info size={20} />,
          bg: 'var(--bg-muted)',
          border: 'var(--border-default)'
        };
    }
  };

  const nextStepInfo = getNextStepContent(request.status);
  const isMatchedOrLater = ['Matched', 'Assistance In Progress', 'Completed', 'Closed'].includes(request.status);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }} className="animate-fade-in">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center gap-2">
          <Button to="/citizen/requests" variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Back to My Requests
          </Button>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span className="text-xs text-muted">
            Submitted on {new Date(request.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Demo Mode Action Pill */}
        <div 
          style={{ 
            backgroundColor: '#FEF3C7', 
            border: '1px solid #FCD34D', 
            padding: '0.4rem 0.85rem', 
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} />
            Demo Mode — Simulate workflow:
          </span>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSimulateNextStatus}
            disabled={simulating}
            icon={<RefreshCw size={14} className={simulating ? 'animate-spin' : ''} />}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', height: '28px' }}
          >
            Simulate Next Status
          </Button>

          <select
            value={request.status}
            onChange={(e) => handleManualStatusChange(e.target.value)}
            className="form-select text-xs"
            style={{ padding: '0.15rem 0.4rem', height: '28px', borderRadius: 'var(--radius-sm)' }}
            title="Jump directly to any status in Demo Mode"
          >
            {STATUS_STEPS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Success notification banner from simulation */}
      {successBanner && (
        <div
          style={{
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            color: 'var(--color-primary-700)',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Header Banner Card */}
      <Card style={{ marginBottom: '1.5rem', borderTop: '4px solid var(--color-primary-600)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap" style={{ marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Request #{request.id}
              </h1>
              <StatusBadge status={request.status} />
              <Badge variant={request.priority === 'Critical' ? 'red' : request.priority === 'High' ? 'amber' : 'slate'}>
                {request.priority} Priority
              </Badge>
              <Badge variant="teal">{request.category}</Badge>
            </div>

            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
              {request.title}
            </h2>

            <div className="flex items-center gap-4 flex-wrap text-xs text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{request.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                <span>{request.peopleAffected} {request.peopleAffected === 1 ? 'person' : 'people'} affected</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Logged {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout for Details */}
      <div className="grid grid-cols-3 lg-grid-cols-1 gap-6">
        {/* Left Column (2 cols): Summary, Assistance Needed, Description, Assignment */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Progress / Next Step Card (Section 17) */}
          <div
            style={{
              backgroundColor: nextStepInfo.bg,
              border: `1px solid ${nextStepInfo.border}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ marginTop: '0.2rem' }}>
              {nextStepInfo.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  What's happening now?
                </h3>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {nextStepInfo.actionText}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {nextStepInfo.text}
              </p>
            </div>
          </div>

          {/* Section: Description */}
          <Card>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <FileText size={18} style={{ color: 'var(--color-primary-600)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Description of Need
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>
              {request.description}
            </p>

            {request.additionalNotes && (
              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span className="text-xs font-bold text-muted uppercase">Additional Notes:</span>
                <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0' }}>
                  {request.additionalNotes}
                </p>
              </div>
            )}
          </Card>

          {/* Section: Assistance Required / Resource Quantity (Section 15 & 8) */}
          <Card>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <PackageCheck size={18} style={{ color: 'var(--color-teal-600)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Assistance Required
                </h3>
              </div>
              <Badge variant="slate">{request.itemsNeeded?.length || 0} items requested</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Item / Resource</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Quantity</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Unit</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {request.itemsNeeded?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.item}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--color-primary-700)' }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                        {item.unit || 'units'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <Badge variant={isMatchedOrLater ? 'green' : 'amber'} style={{ fontSize: '0.7rem' }}>
                          {isMatchedOrLater ? 'Allocated' : 'Requested'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section 16: Assistance Assignment / Matching */}
          <Card>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <Building2 size={18} style={{ color: 'var(--color-primary-600)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Assistance Assignment
                </h3>
              </div>
              <Badge variant={isMatchedOrLater ? 'teal' : 'slate'}>
                {isMatchedOrLater ? 'Partner Matched' : 'Pending Verification'}
              </Badge>
            </div>

            {isMatchedOrLater ? (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-muted)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.25rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-muted uppercase">Coordinating Organization</span>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.15rem 0' }}>
                      {request.assignedOrganization?.name || 'Helping Hands Foundation'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="teal" style={{ fontSize: '0.65rem' }}>
                        {request.assignedOrganization?.badge || 'Tier 1 Verified NGO'}
                      </Badge>
                      <span className="text-xs text-muted">
                        Phone: {request.assignedOrganization?.phone || '+91 22 2745 8890'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted uppercase">Assigned Volunteer Responder</span>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.15rem 0' }}>
                      {request.assignedVolunteer?.name || 'Priya Mehta'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="blue" style={{ fontSize: '0.65rem' }}>
                        {request.assignedVolunteer?.badge || 'Certified Volunteer'}
                      </Badge>
                      <span className="text-xs text-muted">
                        Phone: {request.assignedVolunteer?.phone || '+91 98192 33412'}
                      </span>
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2 md-span-1', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <span className="text-xs font-semibold text-muted uppercase">Estimated Assistance Delivery</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-teal-700)', margin: '0.2rem 0 0 0' }}>
                      {request.estimatedAssistance || 'Within 24 hours'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                style={{ 
                  padding: '1.5rem', 
                  textAlign: 'center', 
                  backgroundColor: 'var(--bg-muted)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-default)'
                }}
              >
                <Clock size={28} style={{ color: 'var(--text-light)', margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.25rem 0' }}>
                  Matching information will appear here once your request has been verified and matched.
                </p>
                <p className="text-xs text-muted" style={{ margin: 0 }}>
                  ResQConnect automatically notifies partnered local NGOs and certified volunteers upon verification.
                </p>
              </div>
            )}
          </Card>

          {/* Section 18: Request Activity Chronological Log */}
          <Card>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <Clock size={18} style={{ color: 'var(--color-primary-600)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Request Activity History
                </h3>
              </div>
              <span className="text-xs text-muted">Chronological transparency log</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {request.timeline?.map((step, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem',
                    paddingBottom: idx < request.timeline.length - 1 ? '0.75rem' : '0',
                    borderBottom: idx < request.timeline.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {step.step}
                      </span>
                      <span className="text-xs text-muted">{step.timestamp}</span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {step.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 col): Request Summary & Lifecycle Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section 15: Request Summary Card */}
          <Card>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              Request Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div>
                <span className="text-xs font-semibold text-muted uppercase">Request Reference</span>
                <p className="font-bold text-sm" style={{ color: 'var(--color-primary-700)', margin: '0.15rem 0 0' }}>
                  #{request.id}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Category</span>
                <p className="font-semibold text-sm" style={{ margin: '0.15rem 0 0' }}>
                  {request.category}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Priority Assessment</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <Badge variant={request.priority === 'Critical' ? 'red' : request.priority === 'High' ? 'amber' : 'slate'}>
                    {request.priority} Priority
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Submitted By</span>
                <p className="font-semibold text-sm" style={{ margin: '0.15rem 0 0' }}>
                  {request.requester?.name || 'Rahul Sharma'} ({request.requester?.phone || '+91 98201 44521'})
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Affected Household Size</span>
                <p className="font-semibold text-sm" style={{ margin: '0.15rem 0 0' }}>
                  {request.peopleAffected} individuals
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Geotagged Locality</span>
                <p className="font-medium text-sm" style={{ margin: '0.15rem 0 0', color: 'var(--text-secondary)' }}>
                  {request.location}
                </p>
              </div>

              {request.accessibility && request.accessibility !== 'None' && (
                <div>
                  <span className="text-xs font-semibold text-muted uppercase">Special Accessibility Need</span>
                  <div className="flex items-center gap-1" style={{ marginTop: '0.2rem' }}>
                    <Accessibility size={14} style={{ color: 'var(--color-teal-600)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-teal-700)' }}>
                      {request.accessibility}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Section 12 & 15: Current Status & Request Timeline */}
          <Card>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Status Lifecycle
              </h3>
              <StatusBadge status={request.status} />
            </div>

            <p className="text-xs text-muted" style={{ marginBottom: '1.25rem' }}>
              Standard 7-stage humanitarian verification and delivery workflow.
            </p>

            {/* Reusable RequestTimeline Component */}
            <RequestTimeline 
              currentStatus={request.status} 
              timeline={request.timeline || []} 
            />
          </Card>

          {/* Citizen Help Support Note */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Need urgent updates on this ticket?
            </strong>
            Contact Panvel Taluka Disaster Recovery Desk with reference ID <strong>#{request.id}</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
