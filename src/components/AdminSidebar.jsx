import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  Wallet, 
  Users, 
  Megaphone, 
  MessageCircle, 
  ShieldCheck,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenWhatsApp,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false
}) {
  const { logout } = useAuth();
  const { data } = useStore();

  const tasksCount = (data?.tasks || []).length;
  const annCount = (data?.announcements || []).length;

  // Navigation groupings as strictly requested
  // Note: Student count is intentionally NOT treated as a notification badge
  const navSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'overview', label: 'Ringkasan & Statistik', icon: LayoutDashboard }
      ]
    },
    {
      title: 'AKADEMIK',
      items: [
        { id: 'tasks', label: 'Kelola Tugas', icon: BookOpen, badge: tasksCount },
        { id: 'exams', label: 'Ujian & Agenda', icon: GraduationCap },
        { id: 'schedules', label: 'Jadwal & Piket', icon: CalendarDays }
      ]
    },
    {
      title: 'ADMINISTRASI',
      items: [
        { id: 'cash', label: 'Keuangan & Matriks Kas', icon: Wallet },
        { id: 'members', label: 'Data Siswa & Jabatan', icon: Users }, // No notification badge
        { id: 'announcements', label: 'Pengumuman', icon: Megaphone, badge: annCount }
      ]
    },
    {
      title: 'SISTEM',
      items: [
        { id: 'settings', label: 'Identitas & Pengaturan', icon: Settings }
      ]
    }
  ];

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, onCloseMobile]);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  // Shared inner content for desktop fixed, tablet collapsed, and mobile drawer
  const renderSidebarContent = (isDrawer = false) => {
    const showCompact = !isDrawer && isCollapsed;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Brand Header */}
        <div style={{
          height: 'var(--header-height)',
          padding: showCompact ? '0 0.75rem' : '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: showCompact ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {data?.classInfo?.logoUrl ? (
                <img src={data.classInfo.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ShieldCheck size={19} />
              )}
            </div>

            {!showCompact && (
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {data?.classInfo?.appName || 'ClassHub'} <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Admin</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {data?.classInfo?.name || 'XI PPLG'}
                </div>
              </div>
            )}
          </div>

          {/* Close button inside mobile drawer */}
          {isDrawer && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Tutup menu navigasi"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Grouped Admin Nav Sections */}
        <nav style={{
          padding: showCompact ? '0.75rem 0.35rem' : '0.85rem 0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: showCompact ? '0.65rem' : '0.9rem',
          flex: 1,
          overflowY: 'auto'
        }}>
          {navSections.map(section => (
            <div key={section.title} className="sidebar-nav-section">
              {!showCompact && (
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  padding: '0.15rem 0.65rem 0.35rem 0.65rem'
                }}>
                  {section.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      title={showCompact ? item.label : undefined}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: showCompact ? 'center' : 'flex-start',
                        gap: '0.65rem',
                        padding: showCompact ? '0.6rem 0' : '0.52rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        textAlign: 'left',
                        width: '100%',
                        minHeight: '38px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Left Accent Indicator for Active State */}
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '6px',
                            bottom: '6px',
                            width: '3px',
                            backgroundColor: 'var(--primary)',
                            borderRadius: '0 2px 2px 0'
                          }}
                          aria-hidden="true"
                        />
                      )}

                      <Icon 
                        size={17} 
                        color={isActive ? 'var(--primary)' : 'var(--text-muted)'} 
                        strokeWidth={isActive ? 2.25 : 1.75}
                        style={{ flexShrink: 0 }}
                      />

                      {!showCompact && (
                        <span style={{
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.label}
                        </span>
                      )}

                      {/* Standardized notification badge */}
                      {!showCompact && item.badge !== undefined && item.badge > 0 && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            fontVariantNumeric: 'tabular-nums',
                            padding: '0.08rem 0.42rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            lineHeight: 1.2
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* WhatsApp Brief: Visually styled as an Integration / Action Box, NOT a standard nav item */}
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            {!showCompact ? (
              <button
                type="button"
                onClick={() => {
                  if (onOpenWhatsApp) onOpenWhatsApp();
                  if (isMobileOpen && onCloseMobile) onCloseMobile();
                }}
                className="btn btn-sm"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(22, 163, 74, 0.08)',
                  color: '#16A34A',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(22, 163, 74, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(22, 163, 74, 0.25)';
                }}
              >
                <MessageCircle size={16} />
                <span>Buka WhatsApp Brief</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onOpenWhatsApp) onOpenWhatsApp();
                }}
                title="Buka WhatsApp Brief"
                style={{
                  width: '100%',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  backgroundColor: 'rgba(22, 163, 74, 0.08)',
                  color: '#16A34A',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle size={18} />
              </button>
            )}
          </div>
        </nav>

        {/* Minimalist Logout / Exit Admin Footer */}
        <div style={{
          padding: showCompact ? '0.75rem 0.4rem' : '0.75rem 0.85rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-sidebar)',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
            }}
            className="btn btn-secondary btn-sm"
            title="Keluar dari sesi admin"
            aria-label="Keluar dari sesi admin"
            style={{
              width: '100%',
              fontSize: '0.8rem',
              padding: showCompact ? '0.5rem 0' : '0.45rem 0.75rem',
              color: 'var(--danger)',
              borderColor: 'transparent',
              backgroundColor: 'transparent',
              gap: '0.45rem',
              justifyContent: showCompact ? 'center' : 'flex-start',
              fontWeight: 600,
              minHeight: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(196, 85, 77, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(196, 85, 77, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <LogOut size={15} />
            {!showCompact && <span>Keluar dari Admin</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Fixed / Collapsible Sidebar */}
      <aside 
        className={`desktop-sidebar ${isCollapsed ? 'collapsed' : ''}`}
        style={{ 
          backgroundColor: 'var(--bg-sidebar)', 
          borderRight: '1px solid var(--border)' 
        }}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Sidebar Drawer Overlay */}
      <div
        className={`admin-drawer-overlay ${isMobileOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden={!isMobileOpen}
      />

      {/* 3. Mobile Sidebar Drawer Canvas */}
      <aside
        className={`admin-drawer ${isMobileOpen ? 'open' : ''}`}
        aria-label="Navigasi admin drawer mobile"
        aria-hidden={!isMobileOpen}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
}
