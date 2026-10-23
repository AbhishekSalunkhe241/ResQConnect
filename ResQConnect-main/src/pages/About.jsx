import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Users, 
  Building2, 
  Award, 
  Lock, 
  CheckCircle2, 
  Compass,
  ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { mockOrganizations } from '../data/mockOrganizations';

export const About = () => {
  return (
    <div className="about-page">
      {/* Hero */}
      <section style={{ padding: '4.5rem 0 3rem', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <Badge variant="teal" icon={<HeartHandshake size={14} />} style={{ marginBottom: '1rem' }}>
            Our Mission & Standards
          </Badge>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            About ResQConnect
          </h1>
          <p className="text-muted" style={{ fontSize: '1.15rem', lineHeight: 1.6 }}>
            "Connect people who need help with people who can provide it."
          </p>
          <p className="text-muted" style={{ marginTop: '0.75rem', fontSize: '1rem', lineHeight: 1.6 }}>
            Built as an accessible, open-standard post-disaster humanitarian framework to bridge the gap between verified community needs, grassroots relief actors, and district coordination authorities.
          </p>
        </div>
      </section>

      {/* Trust & Verification Pillar */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-app)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Our 4 Pillars of Operational Trust
            </h2>
            <p className="text-muted" style={{ marginTop: '0.35rem' }}>
              Why communities and non-governmental organizations rely on ResQConnect.
            </p>
          </div>

          <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
            <Card hoverable>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-teal-50)', color: 'var(--color-teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mandatory NGO Vetting</h3>
              </div>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                Every non-profit organization is authenticated through registrar certificates, district affiliations, and past mission audits before receiving access to sensitive family distress logs.
              </p>
            </Card>

            <Card hoverable>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dignified Data Privacy</h3>
              </div>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                Personal citizen phone numbers and exact geotags are shared exclusively with the verified field coordinator assigned to that specific household's relief kit.
              </p>
            </Card>

            <Card hoverable>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-purple-bg)', color: 'var(--color-purple-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Transparent Traceability</h3>
              </div>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                Every relief ticket maintains an immutable timeline: when it was submitted, who confirmed it, what NGO truck took responsibility, and recipient handover acknowledgment.
              </p>
            </Card>

            <Card hoverable>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Zero Waste & No Overlap</h3>
              </div>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                Shared geographical mapping ensures adjacent relief teams do not flood one accessible colony while nearby rural or uphill settlements go unattended for days.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Partner Organizations Sample */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Badge variant="teal" style={{ marginBottom: '0.5rem' }}>
              Relief Network
            </Badge>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Accredited Partner Organizations
            </h2>
            <p className="text-muted" style={{ marginTop: '0.35rem' }}>
              Sample of verified humanitarian institutions collaborating through the coordination framework.
            </p>
          </div>

          <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
            {mockOrganizations.map((org) => (
              <Card key={org.id} hoverable>
                <div className="flex items-start justify-between gap-3" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {org.name}
                    </h3>
                    <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                      {org.location} • Reg: {org.regNumber}
                    </p>
                  </div>
                  <Badge variant="teal" icon={<CheckCircle2 size={12} />}>
                    {org.verificationLevel}
                  </Badge>
                </div>

                <p className="text-muted text-sm" style={{ lineHeight: 1.5, marginBottom: '1rem' }}>
                  {org.description}
                </p>

                <div className="flex items-center gap-1 flex-wrap">
                  {org.specializations.map((spec, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.55rem',
                        backgroundColor: 'var(--bg-muted)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Button to="/citizen" variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
              Explore Citizen Recovery Portal
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
