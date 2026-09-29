import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

/**
 * Reusable Confirmation Dialog for Destructive or Important Actions
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini? Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger', // 'danger' | 'warning'
  isLoading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const IconComponent = isDanger ? AlertTriangle : AlertCircle;
  const accentColor = isDanger ? 'var(--danger)' : 'var(--warning)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 9999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          position: 'relative',
          border: '1px solid var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Tutup dialog"
          disabled={isLoading}
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '0.25rem',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isDanger ? 'rgba(196, 85, 77, 0.12)' : 'rgba(194, 116, 41, 0.12)',
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconComponent size={22} strokeWidth={2} />
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
            <h3
              id="confirm-dialog-title"
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 0.4rem 0',
                lineHeight: 1.3
              }}
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-desc"
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.6rem',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.84rem',
              minHeight: '38px'
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            style={{
              padding: '0.5rem 1.15rem',
              fontSize: '0.84rem',
              minHeight: '38px',
              backgroundColor: isDanger ? 'var(--danger)' : undefined,
              borderColor: isDanger ? 'var(--danger)' : undefined,
              color: '#FFFFFF'
            }}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
