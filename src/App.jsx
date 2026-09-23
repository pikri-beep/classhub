import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useStore } from './context/StoreContext';
import { useToast } from './context/ToastContext';

import AdminSidebar from './components/AdminSidebar';
import StudentHeader from './components/StudentHeader';
import Header from './components/Header';
import Modal from './components/Modal';
import { InstallBanner } from './components/InstallBanner';
import WhatsAppShareModal from './components/WhatsAppShareModal';

import DashboardView from './views/DashboardView';
import AcademicView from './views/AcademicView';
import ScheduleView from './views/ScheduleView';
import ClassView from './views/ClassView';
import AdminDashboardView from './views/AdminDashboardView';
import { Eye, ArrowRight, ShieldCheck, LogOut } from 'lucide-react';

export default function App() {
  const { 
    currentUser, 
    isAdmin, 
    previewAsStudent, 
    setPreviewAsStudent, 
    loginAsAdmin,
    logout 
  } = useAuth();
  const { data, resetToDefault } = useStore();
  const { showToast } = useToast();

  // Student view state (default: 'dashboard' / Daily Companion)
  const [activeStudentView, setActiveStudentView] = useState('dashboard');

  // Admin view state (default: 'overview')
  const [adminTab, setAdminTab] = useState('overview');
  const [isAdminWhatsAppOpen, setIsAdminWhatsAppOpen] = useState(false);

  // Admin Login modal state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');

  // Detect #admin or /admin in URL and keyboard shortcuts (Ctrl+Shift+A / Alt+A)
  useEffect(() => {
    const checkAdminIntent = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) {
        if (!isAdmin) {
          setIsAdminLoginOpen(true);
        }
      }
    };
    checkAdminIntent();
    window.addEventListener('hashchange', checkAdminIntent);

    // Secret keyboard shortcut: Ctrl+Shift+A or Alt+A
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
          (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setIsAdminLoginOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminIntent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdmin]);

  // Synchronize browser tab title and favicon with class branding
  useEffect(() => {
    const appName = data?.classInfo?.appName || 'ClassHub';
    const className = data?.classInfo?.name ? ` — ${data.classInfo.name}` : '';
    document.title = `${appName}${className}`;

    if (data?.classInfo?.logoUrl) {
      const iconLink = document.querySelector("link[rel*='icon']");
      if (iconLink) {
        iconLink.href = data.classInfo.logoUrl;
      }
    }
  }, [data?.classInfo?.appName, data?.classInfo?.name, data?.classInfo?.logoUrl]);

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    const res = loginAsAdmin(adminPinInput);
    if (res.success) {
      setIsAdminLoginOpen(false);
      showToast('Selamat datang, Admin Kelas! 🛡️', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data demo ke kondisi awal?')) {
      resetToDefault();
      showToast('Data berhasil di-reset ke kondisi awal!', 'info');
    }
  };

  // =========================================================================
  // 1. ADMIN MODE: Dashboard Pengurus Kelas (Sidebar Lengkap & Kontrol Penuh)
  // =========================================================================
  if (isAdmin && !previewAsStudent) {
    return (
      <div className="app-layout">
        {/* Left Desktop Sidebar for Admin */}
        <AdminSidebar
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          onOpenWhatsApp={() => setIsAdminWhatsAppOpen(true)}
        />

        {/* Admin Main Content Wrapper */}
        <div className="main-content-wrapper">
          <Header activeView="admin" />

          <main className="page-container" style={{ padding: '1.25rem 1.75rem' }}>
            <AdminDashboardView
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              isWhatsAppOpen={isAdminWhatsAppOpen}
              setIsWhatsAppOpen={setIsAdminWhatsAppOpen}
            />
          </main>
        </div>

        {/* WhatsApp Modal for Admin */}
        <WhatsAppShareModal
          isOpen={isAdminWhatsAppOpen}
          onClose={() => setIsAdminWhatsAppOpen(false)}
          tasks={data.tasks || []}
          classInfo={data.classInfo}
          currentUser={currentUser}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. PUBLIC / STUDENT MODE: Companion Bebas Profil untuk Seluruh Siswa
  // =========================================================================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Admin Preview Floating Top Banner */}
      {isAdmin && previewAsStudent && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#2563EB',
          color: '#ffffff',
          padding: '0.5rem 1.25rem',
          fontSize: '0.82rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={16} />
            <span>Mode Pratinjau Siswa (Akun Admin Sedang Aktif)</span>
          </div>
          <button
            onClick={() => setPreviewAsStudent(false)}
            className="btn btn-sm"
            style={{
              backgroundColor: '#ffffff',
              color: '#2563EB',
              fontWeight: 800,
              padding: '0.25rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span>Kembali ke Admin Dashboard</span>
            <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
          </button>
        </div>
      )}

      {/* Clean Student Top Header */}
      <StudentHeader
        activeStudentView={activeStudentView}
        setActiveStudentView={setActiveStudentView}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      <InstallBanner />

      {/* Main Companion Canvas */}
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '860px',
        margin: '0 auto',
        padding: '1.25rem 1.15rem 3rem 1.15rem',
        boxSizing: 'border-box'
      }}>
        {activeStudentView === 'dashboard' && (
          <DashboardView onNavigate={(view) => setActiveStudentView(view)} />
        )}
        {activeStudentView === 'schedule' && <ScheduleView />}
        {activeStudentView === 'academic' && <AcademicView />}
        {activeStudentView === 'class' && <ClassView />}
      </main>

      {/* Discreet Minimalist Footer */}
      <footer style={{
        padding: '1.25rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span>ClassHub</span>
          <span>•</span>
          {/* Subtle discreet admin access trigger */}
          <span
            onClick={() => setIsAdminLoginOpen(true)}
            style={{ 
              cursor: 'pointer', 
              opacity: 0.35, 
              display: 'inline-flex', 
              alignItems: 'center',
              padding: '0.15rem 0.35rem',
              borderRadius: 'var(--radius-xs)',
              transition: 'opacity 0.2s, background-color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.35'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Akses Pengurus"
          >
            <ShieldCheck size={13} color="var(--primary)" />
          </span>
          {isAdmin && (
            <>
              <span>•</span>
              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)', fontSize: '0.75rem', padding: '0.15rem 0.45rem', gap: '0.2rem' }}
              >
                <LogOut size={13} />
                <span>Keluar Admin</span>
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Dedicated Admin Login Modal */}
      <Modal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} title="Login Pengurus / Admin">
        <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ textAlign: 'center', padding: '0.25rem 0' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Autentikasi Pengurus</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
              Masukkan Master PIN Pengurus untuk mengelola tugas, jadwal, pengumuman, dan kas kelas.
            </p>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>PIN Pengurus</label>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan Master PIN"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              autoFocus
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
              Master PIN default: <code>admin123</code>
            </span>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}>
            Masuk ke Admin Dashboard
          </button>
        </form>
      </Modal>

    </div>
  );
}
