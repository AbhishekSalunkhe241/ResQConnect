import React from 'react';

export const Badge = ({
  children,
  variant = 'slate',
  icon = null,
  className = '',
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
