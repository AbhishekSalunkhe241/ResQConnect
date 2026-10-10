import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

export const NotFound = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1rem', textAlign: 'center' }} className="animate-fade-in">
      <Card>
        <div style={{ padding: '2rem 1rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Compass size={28} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Page Not Found (404)
          </h1>

          <p className="text-muted" style={{ maxWidth: '440px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            The coordination link you followed does not exist or has been shifted in the relief registry.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button to="/" variant="primary" icon={<ArrowLeft size={16} />}>
              Return to Home
            </Button>
            <Button to="/citizen" variant="secondary">
              Citizen Portal
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
