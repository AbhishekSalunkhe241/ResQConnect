import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Building2, 
  Sparkles, 
  Truck, 
  ClipboardCheck, 
  Compass, 
  AlertCircle,
  HelpCircle,
  FileText,
  UserCheck,
  Package,
  Activity,
  PhoneCall
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import StatusBadge from '../components/StatusBadge';
import { mockDisasters } from '../data/mockDisasters';

export const Landing = () => {
  const activeDisaster = mockDisasters[0];

  const processSteps = [
    {
      step: '01',
      title: 'Request Help',
      icon: <FileText size={20} />,
      desc: 'Displaced families and neighborhood leaders log verified recovery needs (rations, shelter kits, medical prescriptions).'
    },
    {
      step: '02',
      title: 'Human Verification',
      icon: <ShieldCheck size={20} />,
      desc: 'Local field coordinators or district desks validate urgency, location accessibility, and household count.'
    },
    {
      step: '03',
      title: 'Smart Matching',
      icon: <Compass size={20} />,
      desc: 'Needs are mapped directly to registered NGOs and volunteer teams equipped with corresponding supplies.'
    },
    {
      step: '04',
      title: 'Resource Allocation',
      icon: <Package size={20} />,
      desc: 'Relief inventory is assigned without duplication, ensuring adjacent unaffected regions distribute fairly.'
    },
    {
      step: '05',
      title: 'Assistance Delivery',
      icon: <Truck size={20} />,
      desc: 'On-ground teams dispatch supplies or mobilize specialized personnel with milestone timestamp updates.'
    },
    {
      step: '06',
      title: 'Community Recovery',
      icon: <CheckCircle2 size={20} />,
      desc: 'Requests are fulfilled with digital handover receipts, restoring dignity, health, and family shelter.'
    }
  ];

  const stakeholderCards = [
    {
      title: 'Citizens & Families',
      badge: 'Immediate Dignity',
      icon: <Users size={24} style={{ color: 'var(--color-primary-600)' }} />,
      desc: 'Submit specific recovery requirements, track real-time fulfillment status, and know exactly who is arriving to assist.',
      cta: 'Request Assistance',
      link: '/citizen'
    },
    {
      title: 'Field Volunteers',
      badge: 'Targeted Action',
      icon: <HeartHandshake size={24} style={{ color: 'var(--color-teal-600)' }} />,
      desc: 'Channel your time and skills into organized relief tasks—from medical triage and clean water distribution to elder care.',
      cta: 'Join as Volunteer',
      link: '/register?role=volunteer'
    },
    {
      title: 'Verified Relief NGOs',
      badge: 'Zero Duplication',
      icon: <Building2 size={24} style={{ color: '#7E22CE' }} />,
      desc: 'Gain real-time visibility into verified field needs, coordinate warehouse inventory, and eliminate overlapping drops.',
      cta: 'Register NGO Desk',
      link: '/register?role=ngo'
    },
    {
      title: 'Donors & CSR Partners',
      badge: 'Accountable Impact',
      icon: <Package size={24} style={{ color: 'var(--color-warning-main)' }} />,
      desc: 'Direct corporate social responsibility funds and bulk in-kind material to verified recovery clusters with audit trails.',
      cta: 'Explore Programs',
      link: '/about'
    },
    {
      title: 'Verified Authorities',
      badge: 'Unified Recovery Desk',
      icon: <ShieldCheck size={24} style={{ color: 'var(--color-navy-700)' }} />,
      desc: 'District Disaster Management Authorities (DDMA) monitor macro recovery metrics, road access, and inter-agency operations.',
      cta: 'Authority Access',
      link: '/admin'
    }
  ];

  return (
    <div className="landing-page">
      {/* Active Disaster Coordination Notice Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-navy-900)',
          color: '#F8FAFC',
          padding: '0.65rem 1rem',
          fontSize: '0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="container flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-teal-500)',
                boxShadow: '0 0 8px var(--color-teal-500)'
              }}
            />
            <span className="font-semibold" style={{ color: 'var(--color-teal-400)' }}>
              Active Recovery Operation:
            </span>
            <span>{activeDisaster.name} ({activeDisaster.severity})</span>
          </div>

          <Link
            to="/recovery"
            style={{
              color: 'var(--color-primary-500)',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>Learn About Recovery Coordination</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SECTION A: HERO
          ========================================================================= */}
      <section
        style={{
          paddingTop: '4.5rem',
          paddingBottom: '4.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
              <Badge variant="teal" icon={<HeartHandshake size={14} />}>
                Humanitarian Post-Disaster Coordination Platform
              </Badge>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.75rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem'
              }}
            >
              Recovery Starts With{' '}
              <span style={{ color: 'var(--color-primary-600)', position: 'relative' }}>
                Connection.
              </span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
                maxWidth: '720px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              ResQConnect connects people who need help with verified NGOs, volunteers, and available resources during post-disaster recovery.
            </p>

            <div
              className="flex items-center justify-center gap-4 flex-wrap"
              style={{ marginBottom: '3.5rem' }}
            >
              <Button
                to="/citizen"
                variant="primary"
                size="lg"
                iconRight={<ArrowRight size={18} />}
                id="hero-get-help-btn"
              >
                Get Help
              </Button>
              <Button
                to="/register?role=volunteer"
                variant="secondary"
                size="lg"
                icon={<HeartHandshake size={18} />}
                id="hero-volunteer-btn"
              >
                Join as Volunteer
              </Button>
            </div>
          </div>

          {/* Recovery Coordination Process Visualization */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '2.5rem 1.75rem',
              boxShadow: 'var(--shadow-sm)',
              maxWidth: '1060px',
              margin: '0 auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <p className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                The ResQConnect Recovery Journey
              </p>
              <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                How verified assistance reaches families after a disaster
              </h3>
            </div>

            {/* Step-by-step connection flow cards */}
            <div className="grid grid-cols-6 lg-grid-cols-3 md-grid-cols-1 gap-3">
              {[
                { title: 'Citizen', tag: 'Affected Need', icon: <Users size={18} />, color: 'var(--color-primary-600)' },
                { title: 'Request', tag: 'Logged Spec', icon: <FileText size={18} />, color: '#0284C7' },
                { title: 'Verification', tag: 'Human Vetted', icon: <ShieldCheck size={18} />, color: 'var(--color-teal-600)' },
                { title: 'Matching', tag: 'Direct Link', icon: <Compass size={18} />, color: '#7E22CE' },
                { title: 'Assistance', tag: 'Supplies In Field', icon: <Truck size={18} />, color: '#D97706' },
                { title: 'Recovery', tag: 'Safe Household', icon: <CheckCircle2 size={18} />, color: 'var(--color-success-main)' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1rem 0.85rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-app)',
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.5rem',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: HOW RESQCONNECT WORKS
          ========================================================================= */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-app)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <Badge variant="blue" style={{ marginBottom: '0.75rem' }}>
              Structured Coordination
            </Badge>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              How ResQConnect Works
            </h2>
            <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1.05rem' }}>
              A 6-step humanitarian framework designed to turn chaotic post-disaster goodwill into transparent, dignified support.
            </p>
          </div>

          <div className="grid grid-cols-3 lg-grid-cols-2 md-grid-cols-1 gap-6">
            {processSteps.map((step) => (
              <Card key={step.step} hoverable className="process-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {step.step}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {step.title}
                    </h3>
                    <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: WHO IT HELPS
          ========================================================================= */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <Badge variant="teal" style={{ marginBottom: '0.75rem' }}>
              Multi-Stakeholder Network
            </Badge>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Built for Everyone Involved in Recovery
            </h2>
            <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1.05rem' }}>
              Seamlessly interconnecting impacted residents, grassroots volunteers, certified NGOs, and district disaster officers.
            </p>
          </div>

          <div className="grid grid-cols-3 lg-grid-cols-2 md-grid-cols-1 gap-6">
            {stakeholderCards.map((card, i) => (
              <Card key={i} hoverable>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {card.icon}
                      </div>
                      <Badge variant="slate">{card.badge}</Badge>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {card.title}
                    </h3>

                    <p className="text-muted text-sm" style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {card.desc}
                    </p>
                  </div>

                  <Link
                    to={card.link}
                    className="flex items-center gap-1 text-sm font-semibold"
                    style={{ color: 'var(--color-primary-600)' }}
                  >
                    <span>{card.cta}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: RECOVERY, NOT EMERGENCY RESPONSE
          ========================================================================= */}
      <section
        style={{
          padding: '4.5rem 0',
          backgroundColor: '#FFFBEB',
          borderTop: '1px solid #FDE68A',
          borderBottom: '1px solid #FDE68A'
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: '920px',
              margin: '0 auto',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #FCD34D',
              padding: '2.5rem',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)'
            }}
          >
            <div className="flex items-start gap-4 md-flex-col">
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: 'var(--color-warning-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={30} />
              </div>

              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#92400E' }}>
                    Recovery, Not Emergency Response
                  </h3>
                  <Badge variant="amber">Important Clarity</Badge>
                </div>

                <p style={{ color: '#78350F', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  ResQConnect coordinates <strong>medium and long-term community recovery</strong> after the immediate hazard has passed. We organize drinking water restoration, prescription continuation, waterproof tarpaulins, and rehabilitation kits.
                </p>

                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    border: '1px dashed #F59E0B',
                    marginBottom: '1.25rem'
                  }}
                >
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#78350F', marginBottom: '0.25rem' }}>
                    🚨 Are you in immediate life-threatening danger?
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#92400E' }}>
                    If you are trapped in floodwaters, facing structural building collapse, or require urgent golden-hour rescue, call government emergency response immediately at <strong>112</strong> or the <strong>NDRF Helpline</strong>.
                  </p>
                </div>

                <Link
                  to="/recovery"
                  className="inline-flex items-center gap-1 text-sm font-bold"
                  style={{ color: '#B45309' }}
                >
                  <span>Read our complete Recovery Protocol vs. Emergency guidelines</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E: TRUST & VERIFICATION
          ========================================================================= */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <Badge variant="green" icon={<ShieldCheck size={14} />} style={{ marginBottom: '0.75rem' }}>
              Integrity & Accountability
            </Badge>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Trust Through Human Verification
            </h2>
            <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1.05rem' }}>
              In post-disaster chaos, rumors and duplicate claims exhaust resources. ResQConnect enforces rigorous integrity checkpoints.
            </p>
          </div>

          <div className="grid grid-cols-3 lg-grid-cols-2 md-grid-cols-1 gap-6">
            <Card hoverable>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Verified Organizations
              </h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                Every participating NGO, medical corps, and CSR partner must submit registered 80G/12A/FCRA credentials before dispatching teams.
              </p>
            </Card>

            <Card hoverable>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <UserCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Human Field Oversight
              </h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                High-priority requests are cross-checked by certified community volunteers or local civil coordinators prior to resource allocation.
              </p>
            </Card>

            <Card hoverable>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#F3E8FF', color: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Activity size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Transparent Status Tracking
              </h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                No opaque black boxes. Every request passes through publicly viewable milestones: Submitted → Verified → Matched → In Progress → Completed.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F: FINAL CTA
          ========================================================================= */}
      <section
        style={{
          padding: '4.5rem 0',
          backgroundColor: 'var(--color-navy-900)',
          color: 'var(--bg-surface)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--bg-surface)', marginBottom: '1rem' }}>
            Ready to help communities recover?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Whether you are coordinating localized relief in your neighborhood or mobilizing volunteer resources, ResQConnect provides the structure.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button to="/citizen" variant="primary" size="lg" icon={<FileText size={18} />}>
              Request Help (Citizen Demo)
            </Button>
            <Button to="/register?role=volunteer" variant="secondary" size="lg" icon={<HeartHandshake size={18} />}>
              Become a Volunteer
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
