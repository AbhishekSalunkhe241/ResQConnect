import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-navy-950)',
        color: '#94A3B8',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-8" style={{ marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-teal-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bg-surface)'
                }}
              >
                <HeartHandshake size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bg-surface)', letterSpacing: '-0.02em' }}>
                ResQ<span style={{ color: 'var(--color-teal-500)' }}>Connect</span>
              </span>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Connect people who need help with people who can provide it. Dedicated to post-disaster recovery, humanitarian coordination, and verified relief distribution.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-teal-500)' }} />
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 500 }}>
                Transparent • Human-Verified • Non-Emergency
              </span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 style={{ color: 'var(--bg-surface)', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: '#94A3B8' }}>Home Overview</Link></li>
              <li><Link to="/how-it-works" style={{ color: '#94A3B8' }}>How It Works</Link></li>
              <li><Link to="/recovery" style={{ color: '#94A3B8' }}>Recovery Principles</Link></li>
              <li><Link to="/about" style={{ color: '#94A3B8' }}>About the Mission</Link></li>
              <li><Link to="/register" style={{ color: '#94A3B8' }}>Register as Citizen / NGO</Link></li>
            </ul>
          </div>

          {/* Coordination Hubs */}
          <div>
            <h4 style={{ color: 'var(--bg-surface)', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Stakeholders
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/citizen" style={{ color: '#94A3B8' }}>Citizen Recovery Portal</Link></li>
              <li><Link to="/volunteer" style={{ color: '#94A3B8' }}>Volunteer Mobilization (Day 2)</Link></li>
              <li><Link to="/ngo" style={{ color: '#94A3B8' }}>Verified NGO Desk (Day 2)</Link></li>
              <li><Link to="/admin" style={{ color: '#94A3B8' }}>Authority Coordination Desk (Day 3)</Link></li>
            </ul>
          </div>

          {/* Trust & Policies */}
          <div>
            <h4 style={{ color: 'var(--bg-surface)', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Trust & Transparency
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/about" style={{ color: '#94A3B8' }}>Verification Standards</Link></li>
              <li><Link to="/about" style={{ color: '#94A3B8' }}>Data Protection & Privacy</Link></li>
              <li><Link to="/recovery" style={{ color: '#94A3B8' }}>Emergency Guidelines (Dial 112)</Link></li>
              <li><Link to="/how-it-works" style={{ color: '#94A3B8' }}>Allocation Transparency</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.825rem'
          }}
        >
          <p style={{ color: '#64748B', margin: 0 }}>
            © {new Date().getFullYear()} ResQConnect. Built for post-disaster recovery and community resilience.
          </p>

          <p style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
            Frontend Mini Project Prototype • Semester 5
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
