import React from 'react';

export const PageHeader = ({
  title,
  description,
  badge = null,
  actions = null,
  className = ''
}) => {
  return (
    <div
      className={`page-header flex flex-wrap items-center justify-between gap-4 ${className}`.trim()}
      style={{ marginBottom: '1.75rem' }}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-muted" style={{ marginTop: '0.25rem', maxWidth: '720px' }}>
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
