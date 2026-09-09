import React from 'react';
import { Sun, Moon, Sparkles, BookOpen, CalendarDays, Wallet, Users } from 'lucide-react';
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
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>ClassHub</span>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{data.classInfo.name}</span>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <strong style={{ color: 'var(--text-primary)' }}>{viewTitles[activeView] || 'Hari Ini'}</strong>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} />}
        </button>

        {/* User Pill Button */}
        <button
          onClick={onOpenSwitchUser}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.5rem', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem' }}
          title="Klik untuk ganti akun"
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
            fontWeight: 800
          }}>
            {currentUser?.name?.substring(0, 1) || 'U'}
          </div>
          <span style={{ fontSize: '0.8125rem' }}>{currentUser?.name?.split(' ')[0] || 'Akun'}</span>
        </button>
      </div>
    </header>
  );
}
