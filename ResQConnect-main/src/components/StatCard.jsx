import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon,
  colorScheme = 'blue', // 'blue', 'amber', 'green', 'teal', 'purple'
  className = '',
  onClick = null
}) => {
  const colorMap = {
    blue: {
      bg: 'var(--color-info-bg)',
      iconColor: 'var(--color-info-main)',
      border: 'var(--color-info-border)'
    },
    amber: {
      bg: 'var(--color-warning-bg)',
      iconColor: 'var(--color-warning-main)',
      border: 'var(--color-warning-border)'
    },
    green: {
      bg: 'var(--color-success-bg)',
      iconColor: 'var(--color-success-main)',
      border: 'var(--color-success-border)'
    },
    teal: {
      bg: 'var(--color-teal-50)',
      iconColor: 'var(--color-teal-600)',
      border: 'var(--color-teal-border)'
    },
    purple: {
      bg: 'var(--color-purple-bg)',
      iconColor: 'var(--color-purple-main)',
      border: 'var(--color-purple-border)'
    }
  };

  const scheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      <div
        className="stat-icon-wrapper"
        style={{
          backgroundColor: scheme.bg,
          color: scheme.iconColor,
          border: `1px solid ${scheme.border}`
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <p className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.15rem', color: 'var(--text-primary)' }}>
          {value}
        </h3>
        {subtext && (
          <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
