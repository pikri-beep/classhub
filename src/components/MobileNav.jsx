import React from 'react';
import { Sparkles, BookOpen, CalendarDays, Wallet, Users } from 'lucide-react';

export default function MobileNav({ activeView, setActiveView }) {
  const items = [
    { id: 'dashboard', label: 'Hari Ini', icon: Sparkles },
    { id: 'academic', label: 'Akademik', icon: BookOpen },
    { id: 'schedule', label: 'Jadwal', icon: CalendarDays },
    { id: 'cash', label: 'Kas', icon: Wallet },
    { id: 'class', label: 'Kelas', icon: Users }
  ];

  return (
    <nav style={{
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--bottom-nav-height)',
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      zIndex: 100,
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 0.5rem'
    }} className="mobile-only-dock">
      <style>{`
        @media (max-width: 768px) {
          .mobile-only-dock { display: flex !important; }
        }
      `}</style>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.15rem',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: isActive ? 700 : 500,
              padding: '0.35rem 0',
              flex: 1,
              cursor: 'pointer'
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
