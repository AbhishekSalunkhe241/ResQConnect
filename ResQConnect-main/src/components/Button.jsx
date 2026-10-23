import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  icon = null,
  iconRight = null,
  to = null,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const blockClass = block ? 'btn-block' : '';
  const combinedClasses = `btn ${variantClass} ${sizeClass} ${blockClass} ${className}`.trim();

  const content = (
    <>
      {icon && <span className="btn-icon-left">{icon}</span>}
      <span>{children}</span>
      {iconRight && <span className="btn-icon-right">{iconRight}</span>}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
