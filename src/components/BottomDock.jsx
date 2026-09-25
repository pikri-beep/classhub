import React from 'react';
import { Sparkles, CalendarDays, BookOpen, Wallet, Users } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export default function BottomDock({ activeView, onViewChange }) {
  const { data } = useStore();
  const { currentUser } = useAuth();

  // Count unfinished tasks for badge
  const pendingTasksCount = (data?.tasks || []).filter(task => {
    return !(task.completedStudentIds || []).includes(currentUser?.id);
  }).length;

  const dockItems = [
    { id: 'dashboard', label: 'Hari Ini', icon: Sparkles },
    { id: 'schedule', label: 'Jadwal', icon: CalendarDays },
    { id: 'academic', label: 'Akademik', icon: BookOpen, badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'cash', label: 'Kas', icon: Wallet },
    { id: 'class', label: 'Kelas', icon: Users }
  ];

  return (
    <>
      <nav 
        className="bottom-dock" 
        aria-label="Navigasi Bawah Siswa"
      >
        <div className="bottom-dock-container">
          {dockItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`bottom-dock-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="bottom-dock-icon-wrapper">
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                  {item.badge && (
                    <span className="bottom-dock-badge">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="bottom-dock-label">{item.label}</span>
                {isActive && <span className="bottom-dock-indicator" />}
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        /* Bottom Dock styles - ONLY visible on mobile (<768px) */
        .bottom-dock {
          display: none;
        }

        @media (max-width: 767px) {
          .bottom-dock {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 80;
            background-color: var(--bg-surface);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid var(--border);
            padding-bottom: env(safe-area-inset-bottom, 0px);
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
          }

          .bottom-dock-container {
            display: flex;
            align-items: center;
            justify-content: space-around;
            height: 60px;
            max-width: 500px;
            margin: 0 auto;
            padding: 0 0.5rem;
          }

          .bottom-dock-item {
            position: relative;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            padding: 0.35rem 0.2rem;
            color: var(--text-secondary);
            cursor: pointer;
            text-decoration: none;
            transition: color var(--transition-fast), transform var(--transition-fast);
            -webkit-tap-highlight-color: transparent;
            min-height: 48px;
          }

          .bottom-dock-item:active {
            transform: scale(0.92);
          }

          .bottom-dock-item.active {
            color: var(--primary);
          }

          .bottom-dock-icon-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
          }

          .bottom-dock-badge {
            position: absolute;
            top: -3px;
            right: -6px;
            background-color: var(--danger);
            color: #ffffff;
            font-size: 0.62rem;
            font-weight: 800;
            line-height: 1;
            padding: 2px 5px;
            border-radius: var(--radius-full);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            border: 1.5px solid var(--bg-surface);
          }

          .bottom-dock-label {
            font-size: 0.68rem;
            font-weight: 500;
            margin-top: 2px;
            letter-spacing: -0.01em;
            line-height: 1;
          }

          .bottom-dock-item.active .bottom-dock-label {
            font-weight: 700;
          }

          .bottom-dock-indicator {
            position: absolute;
            top: 2px;
            width: 18px;
            height: 3px;
            border-radius: var(--radius-full);
            background-color: var(--primary);
            box-shadow: 0 0 8px var(--primary);
          }
        }
      `}</style>
    </>
  );
}
