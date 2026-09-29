import React from 'react';
import { Wrench, ArrowLeft, ShieldAlert } from 'lucide-react';

/**
 * Reusable Maintenance Screen for Student View when a page is disabled by Admin
 * @param {Object} props
 * @param {string} props.pageName - e.g. "Kas & Keuangan Kelas"
 * @param {string} [props.reason] - e.g. "Bendahara sedang audit kas"
 * @param {Function} props.onBackHome - callback to navigate back to student home
 */
export const MaintenanceScreen = ({
  pageName = 'Halaman Ini',
  reason = 'Halaman sedang dalam pemeliharaan berkala oleh pengurus kelas.',
  onBackHome,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`maintenance-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '2rem 1rem',
        ...style
      }}
    >
      <div
        className="maintenance-card card"
        style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        {/* Animated / styled Icon Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(217, 119, 6, 0.12)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.25rem',
            border: '1px solid var(--primary-border)'
          }}
        >
          <Wrench size={30} strokeWidth={2} />
        </div>

        {/* Status Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--tag-orange-bg)',
            color: 'var(--tag-orange-text)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          <ShieldAlert size={14} />
          <span>Sedang Diperbarui</span>
        </div>

        {/* Title */}
        <div style={{ maxWidth: '420px' }}>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem 0'
            }}
          >
            {pageName} Sedang Ditutup Sementara
          </h2>

          {/* Reason Box */}
          <div
            style={{
              backgroundColor: 'var(--callout-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginTop: '0.75rem',
              textAlign: 'left'
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.25rem'
              }}
            >
              Pesan dari Pengurus:
            </div>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                margin: 0,
                fontWeight: 500
              }}
            >
              &ldquo;{reason || 'Pengurus kelas sedang melakukan pembaruan dan verifikasi data.'}&rdquo;
            </p>
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginTop: '1rem',
              marginBottom: 0,
              lineHeight: 1.45
            }}
          >
            Fitur ini akan segera dibuka kembali setelah proses pembaruan selesai. Terima kasih atas pengertiannya!
          </p>
        </div>

        {/* Action Button */}
        {onBackHome && (
          <button
            type="button"
            onClick={onBackHome}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
              padding: '0.55rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              minHeight: '42px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceScreen;
