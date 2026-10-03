import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('[PWA] Service Worker terdaftar.');
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Gagal mendaftarkan Service Worker:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div 
      className="pwa-update-toast"
      role="alert"
      style={{
        position: 'fixed',
        bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 2rem)',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--primary-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Sparkles size={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Pembaruan Tersedia (v2.2.0)
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Fitur baru siap digunakan!
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={handleUpdate}
          className="btn btn-primary btn-sm"
          style={{
            fontSize: '0.78rem',
            padding: '0.4rem 0.75rem',
            gap: '0.35rem',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <RefreshCw size={13} className="spin-on-hover" />
          <span>Muat Ulang</span>
        </button>
        <button
          onClick={handleClose}
          className="btn btn-ghost btn-sm btn-icon"
          aria-label="Tutup pemberitahuan pembaruan"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
