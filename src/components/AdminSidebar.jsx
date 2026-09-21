import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  Wallet, 
  Users, 
  Megaphone, 
  MessageCircle, 
  Eye, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function AdminSidebar({ activeTab, setActiveTab, onOpenWhatsApp }) {
  const { currentUser, logout, setPreviewAsStudent } = useAuth();
  const { data } = useStore();

  const tasksCount = (data.tasks || []).length;
  const annCount = (data.announcements || []).length;
  const membersCount = (data.members || []).length;

  const adminNavItems = [
    { id: 'overview', label: 'Ringkasan & Statistik', icon: LayoutDashboard },
    { id: 'tasks', label: 'Kelola Tugas', icon: BookOpen, badge: tasksCount },
    { id: 'exams', label: 'Ujian & Agenda', icon: GraduationCap },
    { id: 'schedules', label: 'Jadwal & Piket', icon: CalendarDays },
    { id: 'cash', label: 'Keuangan & Matriks Kas', icon: Wallet },
    { id: 'announcements', label: 'Pengumuman', icon: Megaphone, badge: annCount },
    { id: 'members', label: 'Data Siswa & Jabatan', icon: Users, badge: membersCount }
  ];

  return (
    <>
    <aside className="desktop-sidebar" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
      {/* Brand Header with Admin Badge */}
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
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.95rem',
          flexShrink: 0
        }}>
          <ShieldCheck size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ClassHub Admin
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
            Pusat Pengelolaan Kelas
          </div>
        </div>
      </div>

      {/* Admin Nav Items */}
      <nav style={{
        padding: '0.85rem 0.65rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        flex: 1,
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.75rem 0.4rem 0.75rem' }}>
          Menu Pengelolaan
        </div>

        {adminNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="notion-tag notion-tag-gray" style={{ padding: '0.1rem 0.4rem', fontSize: '0.68rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* WhatsApp Tool Button */}
        <button
          onClick={onOpenWhatsApp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#16A34A',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            marginTop: '0.25rem'
          }}
        >
          <MessageCircle size={16} color="#16A34A" />
          <span>WhatsApp Brief</span>
        </button>

        {/* Preview as Student Button */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setPreviewAsStudent(true)}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              fontSize: '0.78rem',
              fontWeight: 700,
              gap: '0.4rem',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-soft)',
              borderColor: 'var(--primary-border)',
              color: 'var(--primary)'
            }}
          >
            <Eye size={14} />
            <span>Lihat Tampilan Siswa</span>
          </button>
        </div>
      </nav>

      {/* Admin Profile Footer */}
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
            AD
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
              {currentUser?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Master Admin / Wali Kelas
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{
            width: '100%',
            fontSize: '0.78rem',
            padding: '0.45rem',
            color: 'var(--danger)',
            borderColor: 'var(--danger-border)',
            gap: '0.4rem',
            justifyContent: 'center',
            fontWeight: 700
          }}
          title="Keluar dari Mode Admin"
        >
          <LogOut size={14} />
          <span>Keluar dari Admin</span>
        </button>
      </div>
    </aside>

    {/* Mobile Admin Nav Strip (Visible only on mobile devices <= 768px) */}
    <div className="admin-mobile-nav">
      {adminNavItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
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
            <span>{item.label.split(' ')[0]}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="notion-tag notion-tag-gray" style={{ padding: '0.05rem 0.35rem', fontSize: '0.65rem' }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setPreviewAsStudent(true)}
        className="btn btn-sm"
        style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          backgroundColor: 'var(--primary-soft)',
          borderColor: 'var(--primary-border)',
          color: 'var(--primary)',
          padding: '0.35rem 0.65rem',
          gap: '0.35rem',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        <Eye size={14} />
        <span>Mode Siswa</span>
      </button>

      <button
        type="button"
        onClick={onOpenWhatsApp}
        className="btn btn-sm"
        style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          backgroundColor: '#DCFCE7',
          borderColor: '#BBF7D0',
          color: '#16A34A',
          padding: '0.35rem 0.65rem',
          gap: '0.35rem',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        <MessageCircle size={14} />
        <span>WhatsApp Brief</span>
      </button>
    </div>

    <style>{`
      @media (min-width: 769px) {
        .admin-mobile-nav {
          display: none !important;
        }
      }
      @media (max-width: 768px) {
        .admin-mobile-nav {
          display: flex !important;
          position: sticky;
          top: var(--header-height);
          z-index: 38;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          padding: 0.45rem 0.75rem;
          gap: 0.35rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .admin-mobile-nav::-webkit-scrollbar {
          display: none;
        }
      }
    `}</style>
    </>
  );
}
