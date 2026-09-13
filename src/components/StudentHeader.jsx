import React from 'react';
import { Sun, Moon, Sparkles, CalendarDays, BookOpen, Users, LogOut, ArrowLeftRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function StudentHeader({ activeStudentView, setActiveStudentView, onOpenSwitchUser }) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const { data } = useStore();

  const myPendingTasks = (data.tasks || []).filter(
    t => !(t.completedStudentIds || []).includes(currentUser?.id)
  );

  const studentNavItems = [
    { id: 'dashboard', label: 'Hari Ini', icon: Sparkles },
    { id: 'schedule', label: 'Jadwal Mingguan', icon: CalendarDays },
    { id: 'academic', label: 'Semua Tugas', icon: BookOpen, badge: myPendingTasks.length > 0 ? myPendingTasks.length : null },
    { id: 'class', label: 'Teman & Kelas', icon: Users }
  ];

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
      gap: '1rem'
    }}>
      {/* Brand & Class Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--primary-soft)',
          border: '1px solid var(--primary-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: '0.85rem'
        }}>
          CH
        </div>
        <div>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ClassHub
          </span>
        </div>
      </div>

      {/* Center Nav Pills (Always visible on mobile & desktop with horizontal scroll) */}
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
                fontSize: '0.8rem',
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
              {item.badge && (
                <span className="notion-tag notion-tag-orange" style={{ padding: '0.05rem 0.35rem', fontSize: '0.65rem', borderRadius: 'var(--radius-full)' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} />}
        </button>

        {/* Student Avatar / Switch User */}
        <button
          onClick={onOpenSwitchUser}
          className="btn btn-secondary btn-sm"
          style={{
            gap: '0.4rem',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
          title="Klik untuk ganti akun siswa / masuk admin"
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
            {currentUser?.name?.substring(0, 1) || 'S'}
          </div>
          <span style={{ maxWidth: '75px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name?.split(' ')[0] || 'Siswa'}
          </span>
        </button>

        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.4rem', color: 'var(--danger)' }}
          title="Keluar"
        >
          <LogOut size={15} />
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
