import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import Badge from './Badge';

export const ComingSoon = ({
  title = 'Module Coming Soon',
  day = 'Day 2',
  role = '',
  description = 'This coordination module is currently being finalized in the ResQConnect development roadmap.',
  plannedFeatures = []
}) => {
  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '1rem' }} className="animate-fade-in">
      <Card>
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Calendar size={30} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Badge variant="teal" icon={<CheckCircle2 size={12} />}>
              Day 1 Foundation Ready
            </Badge>
            <Badge variant="amber">
              Dashboard coming in {day}
            </Badge>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {title}
          </h2>

          <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto 1.75rem' }}>
            {description}
          </p>

          {plannedFeatures.length > 0 && (
            <div
              style={{
                textAlign: 'left',
                backgroundColor: 'var(--bg-muted)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <p className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Planned Deliverables for {day}:
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {plannedFeatures.map((feat, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span style={{ color: 'var(--color-teal-600)', fontWeight: 'bold' }}>•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button to="/citizen" variant="primary" icon={<ArrowLeft size={16} />}>
              View Citizen Dashboard (Day 1 Active)
            </Button>
            <Button to="/" variant="secondary">
              Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComingSoon;
