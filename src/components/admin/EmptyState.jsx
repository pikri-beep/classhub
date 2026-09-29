import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable Empty State Component
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.actionLabel]
 * @param {Function} [props.onAction]
 */
export const EmptyState = ({
  icon: IconComponent = Inbox,
  title = 'Belum ada data',
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`admin-empty-state card ${className}`} style={{
      padding: '3rem 1.5rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px dashed var(--border)',
      borderRadius: 'var(--radius-md)',
      minHeight: '200px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-hover)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        marginBottom: '0.25rem'
      }}>
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : (
          <IconComponent size={24} strokeWidth={1.75} />
        )}
      </div>

      <div style={{ maxWidth: '380px' }}>
        <h4 style={{
          fontSize: '0.98rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.3
        }}>
          {title}
        </h4>
        {description && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginTop: '0.35rem',
            marginBottom: 0,
            lineHeight: 1.5
          }}>
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary"
          style={{
            marginTop: '0.5rem',
            fontSize: '0.82rem',
            padding: '0.45rem 1rem',
            minHeight: '38px'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
