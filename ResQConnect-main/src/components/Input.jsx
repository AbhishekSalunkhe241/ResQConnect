import React from 'react';

export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helpText,
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
  options = null, // if provided, renders as select
  icon = null,
  className = '',
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-danger-main)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: multiline ? '0.85rem' : '50%',
              transform: multiline ? 'none' : 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            {icon}
          </div>
        )}

        {options ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="form-select"
            style={{ paddingLeft: icon ? '2.5rem' : '0.95rem' }}
            {...props}
          >
            {options.map((opt, i) => (
              <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                {typeof opt === 'object' ? opt.label : opt}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="form-textarea"
            style={{ paddingLeft: icon ? '2.5rem' : '0.95rem' }}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="form-input"
            style={{ paddingLeft: icon ? '2.5rem' : '0.95rem' }}
            {...props}
          />
        )}
      </div>

      {helpText && !error && <div className="form-help">{helpText}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default Input;
