import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Eye, 
  Menu, 
  Bell, 
  Search, 
  X, 
  Settings, 
  PanelLeftClose, 
  PanelLeftOpen,
  CheckCircle2,
  Calendar,
  BookOpen,
  LogOut
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const ADMIN_TAB_TITLES = {
  overview: 'Ringkasan & Statistik',
  tasks: 'Kelola Tugas',
  exams: 'Ujian & Agenda',
  schedules: 'Jadwal & Piket',
  cash: 'Keuangan & Matriks Kas',
  announcements: 'Pengumuman',
  members: 'Data Siswa & Jabatan',
  settings: 'Identitas & Pengaturan'
};

export default function Header({ 
  activeView = 'admin', 
  activeTab = 'overview',
  setActiveTab,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse
}) {
  const { theme, toggleTheme } = useTheme();
  const { setPreviewAsStudent, logout } = useAuth();
  const { data } = useStore();

  // Dropdown states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentTabTitle = ADMIN_TAB_TITLES[activeTab] || 'Dashboard Admin';

  // Click outside and escape key handling
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (searchInputRef.current && !searchInputRef.current.contains(e.target) && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false);
        setIsSearchExpanded(false);
      }
      // Quick search shortcut (Ctrl+K or /)
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
        e.preventDefault();
        setIsSearchExpanded(true);
        setTimeout(() => {
          const input = document.getElementById('admin-header-search-input');
          if (input) input.focus();
        }, 50);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchExpanded]);

  // Notifications data from store
  const tasks = data?.tasks || [];
  const announcements = data?.announcements || [];
  const totalNotifications = tasks.length + announcements.length;

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
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'background-color var(--transition-fast)'
      }}
    >
      {/* -------------------------------------------------------------
          LEFT: Mobile Hamburger / Collapse Toggle + Subtle Breadcrumbs
          ------------------------------------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        {/* Mobile Hamburger Button (≤768px only) */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="admin-hamburger-btn"
          aria-label="Buka menu navigasi"
          aria-expanded={isMobileSidebarOpen}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Menu size={19} />
        </button>

        {/* Desktop/Tablet Sidebar Collapse Toggle */}
        {onToggleSidebarCollapse && (
          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            className="admin-collapse-toggle-btn"
            aria-label={isSidebarCollapsed ? 'Perluas bilah samping' : 'Ciutkan bilah samping'}
            title={isSidebarCollapsed ? 'Perluas bilah samping' : 'Ciutkan bilah samping'}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        )}

        {/* Subtle & Secondary Breadcrumb */}
        <nav
          aria-label="Breadcrumb navigasi"
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.82rem',
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <span
            className="header-breadcrumb-root"
            style={{
              color: 'var(--text-muted)',
              fontWeight: 500
            }}
          >
            Admin
          </span>
          <span
            className="header-breadcrumb-sep"
            style={{
              color: 'var(--text-muted)',
              margin: '0 0.35rem',
              opacity: 0.6
            }}
          >
            /
          </span>
          <span
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {currentTabTitle}
          </span>
        </nav>
      </div>

      {/* -------------------------------------------------------------
          RIGHT: Search + Secondary Student View + Cohesive Control Group
          ------------------------------------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
        
        {/* Global Search Control (Collapses to icon on small screens) */}
        <div
          ref={searchInputRef}
          className={`admin-header-search ${isSearchExpanded ? 'expanded' : ''}`}
          style={{ position: 'relative' }}
        >
          {/* Desktop Search Input */}
          <div className="search-desktop-input-wrap">
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              id="admin-header-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modul (Ctrl+K)..."
              style={{
                width: '190px',
                height: '34px',
                padding: '0 0.75rem 0 2.2rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'width var(--transition-fast), border-color var(--transition-fast)'
              }}
              onFocus={(e) => { e.target.style.width = '240px'; e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.target.style.width = '190px'; e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Mobile Compact Search Trigger */}
          <button
            type="button"
            className="search-mobile-btn"
            onClick={() => setIsSearchExpanded(prev => !prev)}
            aria-label="Cari modul"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Search size={16} />
          </button>
        </div>

        {/* 1. Student View Access (Single Location, Secondary Contextual Action) */}
        <button
          type="button"
          onClick={() => setPreviewAsStudent(true)}
          className="btn btn-secondary btn-sm header-student-secondary-btn"
          title="Pratinjau tampilan portal siswa"
          aria-label="Buka pratinjau tampilan siswa"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            height: '36px',
            padding: '0 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Eye size={15} style={{ flexShrink: 0 }} />
          <span className="btn-label-desktop">Tampilan Siswa</span>
          <span className="btn-label-mobile">Siswa</span>
        </button>

        {/* -------------------------------------------------------------
            2. Cohesive Right-Side Control Group: 
               [ Notification | Dark Mode | Profile Dropdown ]
            ------------------------------------------------------------- */}
        <div
          className="admin-cohesive-controls"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '3px',
            gap: '2px'
          }}
        >
          {/* Notification Control with Popover */}
          <div ref={notificationRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(prev => !prev);
                setIsProfileOpen(false);
              }}
              className="control-icon-btn"
              title="Notifikasi sistem"
              aria-label="Buka notifikasi"
              aria-expanded={isNotificationsOpen}
              style={{
                position: 'relative',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: isNotificationsOpen ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <Bell size={16} />
              {totalNotifications > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '7px',
                    height: '7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary)',
                    boxShadow: '0 0 0 1.5px var(--bg-surface)'
                  }}
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotificationsOpen && (
              <div
                className="card action-menu-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: '-40px',
                  width: '300px',
                  maxWidth: '85vw',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Pemberitahuan
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)'
                  }}>
                    {totalNotifications} item
                  </span>
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '0.35rem 0' }}>
                  {tasks.length > 0 ? (
                    tasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        style={{
                          padding: '0.55rem 0.85rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'flex-start'
                        }}
                      >
                        <BookOpen size={14} color="var(--primary)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {task.subject}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Tidak ada notifikasi baru
                    </div>
                  )}
                </div>

                <div style={{
                  padding: '0.45rem',
                  backgroundColor: 'var(--bg-hover)',
                  borderTop: '1px solid var(--border)',
                  textAlign: 'center'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (setActiveTab) setActiveTab('tasks');
                      setIsNotificationsOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Buka Semua Tugas & Agenda →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thin Hairline Divider */}
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />

          {/* Dark / Light Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="control-icon-btn"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle mode gelap"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} />}
          </button>

          {/* Thin Hairline Divider */}
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />

          {/* Quick Logout / Exit Admin Button */}
          <button
            type="button"
            onClick={logout}
            className="control-icon-btn"
            title="Keluar dari Admin"
            aria-label="Keluar dari Admin"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(196, 85, 77, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .admin-hamburger-btn {
          display: none;
        }
        .admin-collapse-toggle-btn {
          display: flex;
        }
        .search-mobile-btn {
          display: none;
        }
        .search-desktop-input-wrap {
          display: block;
        }
        .btn-label-mobile {
          display: none;
        }
        .btn-label-desktop {
          display: inline;
        }

        @media (max-width: 860px) {
          .search-desktop-input-wrap {
            display: none;
          }
          .search-mobile-btn {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .admin-hamburger-btn {
            display: inline-flex !important;
          }
          .admin-collapse-toggle-btn {
            display: none !important;
          }
          .header-breadcrumb-root,
          .header-breadcrumb-sep {
            display: none !important;
          }
          .app-header {
            padding: 0 0.85rem !important;
          }
          .btn-label-desktop {
            display: none !important;
          }
          .btn-label-mobile {
            display: inline !important;
          }
          .header-admin-name {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .header-student-secondary-btn span {
            display: none !important;
          }
          .header-student-secondary-btn {
            padding: 0 0.5rem !important;
          }
        }
      `}</style>
    </header>
  );
}
