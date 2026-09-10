import React from 'react';
import { Sparkles, BookOpen, CalendarDays, Wallet, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function MobileNav({ activeView, setActiveView }) {
  const { currentUser } = useAuth();
  const { data } = useStore();

  const myPendingTasks = (data.tasks || []).filter(
    t => !(t.completedStudentIds || []).includes(currentUser?.id)
  );

  const items = [
    { id: 'dashboard', label: 'Hari Ini', icon: Sparkles },
    { id: 'academic', label: 'Akademik', icon: BookOpen, badge: myPendingTasks.length > 0 ? myPendingTasks.length : null },
    { id: 'schedule', label: 'Jadwal', icon: CalendarDays },
    { id: 'cash', label: 'Kas', icon: Wallet },
    { id: 'class', label: 'Kelas', icon: Users }
  ];

  return (
    <nav className="mobile-nav-dock" aria-label="Navigasi Bawah">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              {item.badge && (
                <span className="mobile-nav-badge">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
