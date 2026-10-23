import React from 'react';

export const Card = ({
  children,
  header = null,
  footer = null,
  hoverable = false,
  className = '',
  onClick = null,
  ...props
}) => {
  const hoverClass = hoverable ? 'card-hover cursor-pointer' : '';
  const combined = `card ${hoverClass} ${className}`.trim();

  return (
    <div className={combined} onClick={onClick} {...props}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
