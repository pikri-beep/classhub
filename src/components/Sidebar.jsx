import React from 'react';
import { Sparkles, BookOpen, CalendarDays, Wallet, Users, LogOut, ArrowLeftRight, Shield, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function Sidebar({ activeView, setActiveView, onOpenSwitchUser }) {
  const { currentUser, logout, isAdmin } = useAuth();
  const { data } = useStore();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const myPendingTasks = data.tasks.filter(
    t => !(t.completedStudentIds || []).includes(currentUser?.id)
  );

  const navItems = [
    { id: 'dashboard', label: 'Hari Ini', icon: Sparkles },
    { id: 'academic', label: 'Akademik', icon: BookOpen, badge: myPendingTasks.length > 0 ? myPendingTasks.length : null },
    { id: 'schedule', label: 'Jadwal & Agenda', icon: CalendarDays },
    { id: 'cash', label: 'Kas & Iuran', icon: Wallet },
    { id: 'class', label: 'Ruang Kelas', icon: Users }
  ];

  return (
    <aside className="desktop-sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--primary-soft)',
          border: '1px solid var(--primary-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: '0.95rem',
          flexShrink: 0
        }}>
          CH
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ClassHub
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {data.classInfo.name}
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{
        padding: '0.85rem 0.65rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        flex: 1,
        overflowY: 'auto'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Icon size={17} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="notion-tag notion-tag-orange" style={{ padding: '0.1rem 0.45rem', fontSize: '0.7rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* PWA Install Button (Desktop) */}
      {isInstallable && !isInstalled && (
        <div style={{ padding: '0 0.85rem 0.65rem 0.85rem' }}>
          <button
            onClick={promptInstall}
            id="btn-pwa-install-sidebar"
            className="btn btn-secondary"
            style={{
              width: '100%',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--primary-soft)',
              borderColor: 'var(--primary-border)',
              color: 'var(--primary)'
            }}
          >
            <Download size={14} />
            <span>Install Aplikasi</span>
          </button>
        </div>
      )}

      {/* User Mini-Profile Card */}
      <div style={{
        padding: '0.85rem',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg-sidebar)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.5rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.78rem',
            flexShrink: 0
          }}>
            {currentUser?.avatarText || currentUser?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentUser?.name || 'Siswa'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {currentUser?.roleTitle || (isAdmin ? 'Pengurus / Admin' : 'Siswa')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={onOpenSwitchUser}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.45rem' }}
            title="Ganti Siswa / Admin"
          >
            <ArrowLeftRight size={13} />
            <span>Ganti Akun</span>
          </button>
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem 0.55rem', color: 'var(--danger)' }}
            title="Keluar / Kunci Akses"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
