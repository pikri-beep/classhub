import React, { useState } from 'react';
import { Sun, Moon, Sparkles, CalendarDays, BookOpen, Users, Wallet, LogOut, ShieldCheck } from 'lucide-react';
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
    { id: 'cash', label: 'Kas Kelas', icon: Wallet },
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
    <header className="student-header-bar">
      {/* Left: Brand Icon & Name */}
      <div className="student-header-left">
        <div 
          onClick={handleLogoTap}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'transform 0.15s ease, border-color 0.15s ease',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={data?.classInfo?.appName || 'ClassHub'}
        >
          {data?.classInfo?.logoUrl ? (
            <img 
              src={data.classInfo.logoUrl} 
              alt="Logo Kelas" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
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

      {/* Center: Navigation Buttons (Absolute True Center) */}
      <div className="student-center-nav">
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

      {/* Right: Controls (Theme Toggle & Admin) */}
      <div className="student-header-right">
        {/* Active Admin Badge & Exit */}
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span 
              className="notion-tag" 
              style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700,
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)'
              }}
            >
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
        .student-header-bar {
          height: 60px;
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
        }

        .student-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          z-index: 2;
        }

        .student-center-nav {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.3rem;
          align-items: center;
          z-index: 1;
        }

        .student-header-right {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          z-index: 2;
        }

        @media (max-width: 860px) {
          .student-center-nav {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
