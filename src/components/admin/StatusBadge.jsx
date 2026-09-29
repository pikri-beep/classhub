import React from 'react';

/**
 * Reusable Status Badge Component
 * Variants: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 */
export const StatusBadge = ({
  variant = 'neutral',
  children,
  icon,
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
          border: '1px solid rgba(46, 124, 87, 0.2)'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--tag-orange-bg)',
          color: 'var(--tag-orange-text)',
          border: '1px solid rgba(194, 116, 41, 0.2)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--tag-red-bg)',
          color: 'var(--tag-red-text)',
          border: '1px solid rgba(196, 85, 77, 0.2)'
        };
      case 'info':
        return {
          backgroundColor: 'var(--tag-blue-bg)',
          color: 'var(--tag-blue-text)',
          border: '1px solid rgba(71, 85, 105, 0.2)'
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--tag-gray-bg)',
          color: 'var(--tag-gray-text)',
          border: '1px solid rgba(120, 119, 116, 0.2)'
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`admin-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: isSmall ? '0.12rem 0.45rem' : '0.2rem 0.6rem',
        borderRadius: 'var(--radius-full)',
        fontSize: isSmall ? '0.72rem' : '0.78rem',
        fontWeight: 600,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        ...getVariantStyles(),
        ...style
      }}
    >
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
