import React from 'react';

/**
 * Reusable Status Badge Component
 * Variants: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 */
export const StatusBadge = ({
  variant = 'neutral',
  children,
  icon,
  dot = false,
  size = 'md', // 'sm' | 'md'
  className = '',
  style = {}
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'var(--tag-green-bg)',
          color: 'var(--tag-green-text)',
          border: '1px solid rgba(46, 124, 87, 0.16)',
          dotColor: 'var(--tag-green-text)'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--tag-orange-bg)',
          color: 'var(--tag-orange-text)',
          border: '1px solid rgba(194, 116, 41, 0.16)',
          dotColor: 'var(--tag-orange-text)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--tag-red-bg)',
          color: 'var(--tag-red-text)',
          border: '1px solid rgba(196, 85, 77, 0.16)',
          dotColor: 'var(--tag-red-text)'
        };
      case 'info':
        return {
          backgroundColor: 'var(--tag-blue-bg)',
          color: 'var(--tag-blue-text)',
          border: '1px solid rgba(71, 85, 105, 0.16)',
          dotColor: 'var(--tag-blue-text)'
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--tag-gray-bg)',
          color: 'var(--tag-gray-text)',
          border: '1px solid rgba(120, 119, 116, 0.16)',
          dotColor: 'var(--tag-gray-text)'
        };
    }
  };

  const isSmall = size === 'sm';
  const styles = getVariantStyles();

  return (
    <span
      className={`admin-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: isSmall ? '0.12rem 0.45rem' : '0.18rem 0.55rem',
        borderRadius: 'var(--radius-full)',
        fontSize: isSmall ? '0.72rem' : '0.76rem',
        fontWeight: 500,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        ...style
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: styles.dotColor,
            flexShrink: 0
          }}
        />
      )}
      {icon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default StatusBadge;
