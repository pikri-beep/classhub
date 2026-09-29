import React from 'react';

/**
 * Reusable Horizontal Progress Bar with percentage display
 */
export const ProgressBar = ({
  current = 0,
  total = 0,
  colorVariant = 'primary', // 'primary' | 'success' | 'warning' | 'danger'
  showLabel = false,
  labelPrefix = '',
  height = 8,
  className = '',
  style = {}
}) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;

  const getColor = () => {
    switch (colorVariant) {
      case 'success':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'danger':
        return 'var(--danger)';
      case 'primary':
      default:
        return 'var(--primary)';
    }
  };

  return (
    <div className={`admin-progress-bar-container ${className}`} style={{ width: '100%', ...style }}>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '0.35rem'
        }}>
          <span>{labelPrefix ? `${labelPrefix} ` : ''}{current}/{total}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--bg-hover)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: getColor(),
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
