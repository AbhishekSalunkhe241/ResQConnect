import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon = <Inbox size={42} style={{ color: 'var(--text-muted)' }} />,
  title = 'No items found',
  description = 'There are no active records in this view right now.',
  action = null,
  className = ''
}) => {
  return (
    <div
      className={`text-center flex flex-col items-center justify-center ${className}`.trim()}
      style={{
        padding: '3.5rem 1.5rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-default)',
        maxWidth: '560px',
        margin: '1.5rem auto'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h3>
      <p className="text-muted text-sm" style={{ maxWidth: '400px', marginBottom: action ? '1.25rem' : 0 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
