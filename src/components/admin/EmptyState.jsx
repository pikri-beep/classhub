import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Minimalist Clean Empty State Component
 */
export const EmptyState = ({
  icon: IconComponent = Inbox,
  title = 'Belum ada data',
  description,
  actionLabel,
  onAction,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`admin-empty-state ${className}`}
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.65rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        minHeight: '170px',
        ...style
      }}
    >
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-hover)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : (
          <IconComponent size={20} strokeWidth={1.8} />
        )}
      </div>

      <div style={{ maxWidth: '340px' }}>
        <h4 style={{
          fontSize: '0.92rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.3
        }}>
          {title}
        </h4>
        {description && (
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
            marginBottom: 0,
            lineHeight: 1.45
          }}>
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary btn-sm"
          style={{
            marginTop: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '0.4rem 0.95rem'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
