import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function Header({ activeView, onOpenSwitchUser }) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { data } = useStore();

  const viewTitles = {
    dashboard: 'Hari Ini',
    academic: 'Akademik',
    schedule: 'Jadwal & Agenda',
    cash: 'Kas & Iuran',
    class: 'Ruang Kelas'
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

        {/* User Pill Button */}
        <button
          onClick={onOpenSwitchUser}
          className="btn btn-secondary btn-sm"
          style={{
            gap: '0.45rem',
            borderRadius: 'var(--radius-full)',
            padding: '0.3rem 0.65rem',
            minHeight: '34px'
          }}
          title="Klik untuk ganti akun siswa/admin"
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 800,
            flexShrink: 0
          }}>
            {currentUser?.name?.substring(0, 1) || 'U'}
          </div>
          <span style={{
            fontSize: '0.8125rem',
            maxWidth: '90px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {currentUser?.name?.split(' ')[0] || 'Akun'}
          </span>
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
