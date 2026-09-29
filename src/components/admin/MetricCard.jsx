import React from 'react';

/**
 * Reusable Metric KPI Card for Dashboard Overview
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
      className={`admin-metric-card card ${isClickable ? 'card-hover' : ''} ${className}`}
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
        padding: '1.2rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        cursor: isClickable ? 'pointer' : 'default',
        minHeight: '120px',
        ...style
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '0.6rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          {IconComponent && (
            <div style={{
              width: '36px',
              height: '36px',
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
                <IconComponent size={20} strokeWidth={2} />
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
          fontSize: '1.65rem',
          fontWeight: 800,
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
