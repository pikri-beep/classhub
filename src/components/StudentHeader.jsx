import React, { useState } from 'react';
import { Sun, Moon, Sparkles, CalendarDays, BookOpen, Users, LogOut, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function StudentHeader({ activeStudentView, setActiveStudentView, onOpenAdminLogin }) {
  const { theme, toggleTheme } = useTheme();
  const { logout, isAdmin } = useAuth();
  const { data, syncStatus } = useStore();
  const [logoTaps, setLogoTaps] = useState(0);

  const studentNavItems = [
    { id: 'dashboard', label: 'Hari Ini', icon: Sparkles },
    { id: 'schedule', label: 'Jadwal Mingguan', icon: CalendarDays },
    { id: 'academic', label: 'Semua Tugas', icon: BookOpen },
    { id: 'class', label: 'Kelas', icon: Users }
  ];

  // Secret 3x tap on CH logo to trigger Admin Login
  const handleLogoTap = () => {
    const nextTaps = logoTaps + 1;
    setLogoTaps(nextTaps);
    if (nextTaps >= 3) {
      setLogoTaps(0);
      onOpenAdminLogin();
    }
  };

  return (
    <header style={{
      height: '60px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem'
    }}>
      {/* Brand Icon & Name (Secret 3-Tap on Logo) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
        <div 
          onClick={handleLogoTap}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-soft)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'transform 0.15s ease',
            overflow: 'hidden'
          }}
          title={data?.classInfo?.appName || 'ClassHub'}
        >
          {data?.classInfo?.logoUrl ? (
            <img 
              src={data.classInfo.logoUrl} 
              alt="Logo Kelas" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            (data?.classInfo?.appName || 'CH').slice(0, 2).toUpperCase()
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            {data?.classInfo?.appName || 'ClassHub'}
          </span>
          {data?.classInfo?.name && (
            <span style={{ 
              fontSize: '0.68rem', 
              color: 'var(--primary)', 
              fontWeight: 700,
              lineHeight: 1
            }}>
              {data.classInfo.name}
            </span>
          )}
        </div>
      </div>

      {/* Center Nav Pills */}
      <div className="student-center-nav" style={{ 
        display: 'flex', 
        gap: '0.3rem', 
        alignItems: 'center',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {studentNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeStudentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveStudentView(item.id)}
              className="btn btn-sm"
              style={{
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
                borderColor: isActive ? 'var(--primary-border)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '0.35rem 0.65rem',
                gap: '0.35rem',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
        {/* Active Admin Badge & Exit (Only shown when Admin is logged in) */}
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
              Admin
            </span>
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.35rem 0.5rem', color: 'var(--danger)', fontSize: '0.75rem', gap: '0.2rem' }}
              title="Keluar dari Mode Admin"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* Cloud Sync Status Indicator */}
        {syncStatus === 'connected' && (
          <span 
            className="notion-tag notion-tag-green"
            style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', gap: '0.3rem', display: 'inline-flex', alignItems: 'center' }}
            title="Tersinkronisasi Realtime dengan Cloud (Supabase)"
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
            <span>Cloud Live</span>
          </span>
        )}
        {syncStatus === 'connecting' && (
          <span 
            className="notion-tag notion-tag-orange"
            style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem' }}
            title="Menghubungkan ke Supabase..."
          >
            Menghubungkan...
          </span>
        )}

        {/* Clean Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} />}
        </button>
      </div>

      <style>{`
        .student-center-nav::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </header>
  );
}
