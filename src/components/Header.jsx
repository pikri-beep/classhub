import React from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function Header({ activeView }) {
  const { theme, toggleTheme } = useTheme();
  const { setPreviewAsStudent } = useAuth();
  const { data } = useStore();

  const viewTitles = {
    dashboard: 'Hari Ini',
    academic: 'Akademik',
    schedule: 'Jadwal & Agenda',
    cash: 'Kas & Iuran',
    class: 'Ruang Kelas',
    admin: 'Pusat Pengelolaan Admin'
  };

  return (
    <header
      className="app-header"
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '0 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'background-color var(--transition-fast)'
      }}
    >
      {/* Left: Mobile Brand + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        {/* Mobile brand icon visible when sidebar is hidden */}
        <div
          className="mobile-brand-icon"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-soft)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '0.75rem',
            flexShrink: 0
          }}
        >
          CH
        </div>

        {/* Dynamic Breadcrumbs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.85rem',
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <strong style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {viewTitles[activeView] || 'Hari Ini'}
          </strong>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', minWidth: '34px', minHeight: '34px' }}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle tema tampilan"
        >
          {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} />}
        </button>

        {/* Preview As Student Button */}
        <button
          onClick={() => setPreviewAsStudent(true)}
          className="btn btn-secondary btn-sm"
          style={{
            gap: '0.45rem',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.75rem',
            minHeight: '34px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            backgroundColor: 'var(--primary-soft)',
            borderColor: 'var(--primary-border)',
            color: 'var(--primary)'
          }}
          title="Buka pratinjau portal siswa"
        >
          <Eye size={15} />
          <span>Lihat Tampilan Siswa</span>
        </button>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .mobile-brand-icon { display: none !important; }
          .desktop-breadcrumb { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
