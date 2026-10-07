import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', options = null) => {
    const id = Date.now() + Math.random();
    const action = options?.action || (typeof options === 'function' ? { label: 'Urungkan', onClick: options } : null);
    const duration = options?.duration || (action ? 5500 : 3500);

    setToasts(prev => [...prev, { id, message, type, action }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 9999,
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 2rem)'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              border: `1px solid ${t.type === 'error' ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              animation: 'toastFade 0.2s ease'
            }}
          >
            {t.type === 'success' && <CheckCircle2 size={16} color="var(--success)" />}
            {t.type === 'error' && <AlertCircle size={16} color="var(--danger)" />}
            {t.type === 'info' && <Info size={16} color="var(--primary)" />}
            <span style={{ flex: 1 }}>{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  try {
                    t.action.onClick?.();
                  } finally {
                    removeToast(t.id);
                  }
                }}
                style={{
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: '0.35rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.action.label || 'Urungkan'}
              </button>
            )}
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px',
                display: 'flex'
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
