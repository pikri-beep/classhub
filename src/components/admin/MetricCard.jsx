import React from 'react';

/**
 * Minimalist Soft Surface KPI Card for Dashboard Overview
 */
export const MetricCard = ({
  icon: IconComponent,
  label,
  value,
  subLabel,
  accentColor = 'var(--primary)',
  onClick,
  badge,
  className = '',
  style = {}
}) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`admin-metric-card ${className}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      style={{
        padding: '1.35rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        cursor: isClickable ? 'pointer' : 'default',
        minHeight: '124px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        ...style
      }}
      onMouseEnter={isClickable ? (e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      } : undefined}
      onMouseLeave={isClickable ? (e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      } : undefined}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          {IconComponent && (
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-hover)',
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {React.isValidElement(IconComponent) ? (
                IconComponent
              ) : (
                <IconComponent size={18} strokeWidth={2} />
              )}
            </div>
          )}
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em'
          }}>
            {label}
          </span>
        </div>

        {badge && (
          <div>{badge}</div>
        )}
      </div>

      <div>
        <div style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15
        }}>
          {value}
        </div>
        {subLabel && (
          <div style={{
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            marginTop: '0.35rem',
            lineHeight: 1.3
          }}>
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
