import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Compass, 
  Package, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import StatusBadge from '../components/StatusBadge';
import { requestStatusList } from '../data/mockRequests';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Request Submission',
      badge: 'Step 1: Intake',
      icon: <FileText size={24} />,
      color: 'var(--color-primary-600)',
      summary: 'Impacted residents or local representatives file structured recovery requests.',
      details: [
        'Select categories: Drinking water, dry rations, medicine refills, tarpaulins, sanitation lime.',
        'State precise neighborhood locality, road landmark, and affected household count.',
        'Upload damage indicators or representative contact to enable rapid phone verification.'
      ]
    },
    {
      num: '02',
      title: 'Human-Led Field Verification',
      badge: 'Step 2: Validation',
      icon: <ShieldCheck size={24} />,
      color: 'var(--color-teal-600)',
      summary: 'Civil coordinators and accredited field agents cross-check details to prevent duplication.',
      details: [
        'Phone triage checks urgent vulnerability (infants, chronic illnesses, damaged roofs).',
        'Physical cross-referencing with Taluka revenue assistants or local municipal ward desks.',
        'Status upgrades to "Verified" with authorized validation timestamps.'
      ]
    },
    {
      num: '03',
      title: 'Smart Matching & Assignment',
      badge: 'Step 3: Pairing',
      icon: <Compass size={24} />,
      color: '#7E22CE',
      summary: 'Verified requests are matched to registered NGOs and specialized relief bodies.',
      details: [
        'Medical requests route directly to mobile dispensary partners (e.g., Seva Medical Relief).',
        'Bulk food and water requirements route to regional warehouse distribution networks.',
        'Specialized logistics volunteers alerted for last-mile porterage if roads remain cut off.'
      ]
    },
    {
      num: '04',
      title: 'Resource Allocation & Tracking',
      badge: 'Step 4: Dispatch',
      icon: <Package size={24} />,
      color: 'var(--color-warning-main)',
      summary: 'Relief kits are earmarked and marked as "Assistance In Progress".',
      details: [
        'Warehouse stocks are deducted in real-time, preventing double-distribution in one lane.',
        'Vehicle dispatch manifests and expected delivery windows sent to citizen portal.',
        'Volunteers receive route safety alerts and local road accessibility updates.'
      ]
    },
    {
      num: '05',
      title: 'Field Handover & Delivery',
      badge: 'Step 5: Handover',
      icon: <Truck size={24} />,
      color: 'var(--color-primary-600)',
      summary: 'Dignified handover of resources directly to the impacted household.',
      details: [
        'Recipient acknowledges receipt with digital signature or verified representative sign-off.',
        'Remaining supplementary needs (e.g. secondary health checks) logged for follow-up.',
        'Status transitions to "Completed" with photo verification.'
      ]
    },
    {
      num: '06',
      title: 'Post-Relief Rehabilitation',
      badge: 'Step 6: Resilience',
      icon: <CheckCircle2 size={24} />,
      color: 'var(--color-success-main)',
      summary: 'Connecting families into permanent government rehabilitation schemes and livelihoods.',
      details: [
        'Post-recovery assessments ensure water sources remain disinfected and disease-free.',
        'Data compiled for district authority compensation and public works prioritization.',
        'Ticket officially moved to "Closed" with complete audit trails.'
      ]
    }
  ];

  return (
    <div className="how-it-works-page">
      {/* Header */}
      <section style={{ padding: '4rem 0 3rem', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <Badge variant="teal" style={{ marginBottom: '1rem' }}>
            Coordination Blueprint
          </Badge>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            How ResQConnect Coordinates Post-Disaster Recovery
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Post-disaster environments are often characterized by information chaos, fragmented charity, and duplicate aid drops. Here is how our transparent system brings clarity.
          </p>
        </div>
      </section>

      {/* 6 Step Deep Dive */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-app)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {steps.map((st) => (
              <Card key={st.num}>
                <div className="flex items-start gap-5 md-flex-col">
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-app)',
                      color: st.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {st.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.4rem' }}>
                      <Badge variant="slate">{st.badge}</Badge>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {st.title}
                      </h3>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '1rem' }}>
                      {st.summary}
                    </p>

                    <div
                      style={{
                        backgroundColor: 'var(--bg-muted)',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {st.details.map((d, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span style={{ color: st.color, fontWeight: 'bold' }}>✓</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Status Lifecycle Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Badge variant="blue" style={{ marginBottom: '0.75rem' }}>
              Standardized Status Registry
            </Badge>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Standardized Request Status Lifecycles
            </h2>
            <p className="text-muted" style={{ marginTop: '0.4rem' }}>
              Every citizen and partner can see exactly what state an assistance ticket is in.
            </p>
          </div>

          <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
            {requestStatusList.map((item) => (
              <div
                key={item.key}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ marginBottom: '0.35rem' }}>
                    <StatusBadge status={item.key} />
                  </div>
                  <p className="text-xs text-muted" style={{ margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
                <Clock size={16} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Button to="/citizen" variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
              Try Citizen Request Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
