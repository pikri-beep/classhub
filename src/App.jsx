import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useStore } from './context/StoreContext';
import { useToast } from './context/ToastContext';

import AdminSidebar from './components/AdminSidebar';
import StudentHeader from './components/StudentHeader';
import Header from './components/Header';
import Modal from './components/Modal';
import { InstallBanner } from './components/InstallBanner';
import WhatsAppShareModal from './components/WhatsAppShareModal';

import LoginGate from './views/LoginGate';
import DashboardView from './views/DashboardView';
import AcademicView from './views/AcademicView';
import ScheduleView from './views/ScheduleView';
import ClassView from './views/ClassView';
import AdminDashboardView from './views/AdminDashboardView';
import { Eye, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  const { 
    isAuthenticated, 
    currentUser, 
    isAdmin, 
    previewAsStudent, 
    setPreviewAsStudent, 
    loginAsStudent, 
    loginAsAdmin 
  } = useAuth();
  const { data, resetToDefault } = useStore();
  const { showToast } = useToast();

  // Student view state (default: 'dashboard' / Daily Companion)
  const [activeStudentView, setActiveStudentView] = useState('dashboard');

  // Admin view state (default: 'overview')
  const [adminTab, setAdminTab] = useState('overview');
  const [isAdminWhatsAppOpen, setIsAdminWhatsAppOpen] = useState(false);

  // Switch user modal state
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  const [switchStudentId, setSwitchStudentId] = useState(currentUser?.id || 'std-1');
  const [switchPin, setSwitchPin] = useState('1234');
  const [switchAdminPin, setSwitchAdminPin] = useState('admin123');

  if (!isAuthenticated) {
    return <LoginGate />;
  }

  const handleSwitchStudent = (e) => {
    e.preventDefault();
    const res = loginAsStudent(switchStudentId, switchPin);
    if (res.success) {
      setIsSwitchUserOpen(false);
      showToast(`Beralih ke akun ${res.user.name}! 👋`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSwitchAdmin = (e) => {
    e.preventDefault();
    const res = loginAsAdmin(switchAdminPin);
    if (res.success) {
      setIsSwitchUserOpen(false);
      showToast('Masuk Mode Pengurus / Admin! 🛡️', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data demo ke kondisi awal?')) {
      resetToDefault();
      setIsSwitchUserOpen(false);
      showToast('Data berhasil di-reset ke kondisi awal!', 'info');
    }
  };

  // =========================================================================
  // 1. ADMIN MODE: "Dashboard Pada Umumnya" (Sidebar Lengkap & Kontrol Penuh)
  // =========================================================================
  if (isAdmin && !previewAsStudent) {
    return (
      <div className="app-layout">
        {/* Left Desktop Sidebar for Admin */}
        <AdminSidebar
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
          onOpenWhatsApp={() => setIsAdminWhatsAppOpen(true)}
        />

        {/* Admin Main Content Wrapper */}
        <div className="main-content-wrapper">
          <Header
            activeView="admin"
            onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
          />

          <main className="page-container" style={{ padding: '1.25rem 1.75rem' }}>
            <AdminDashboardView
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              isWhatsAppOpen={isAdminWhatsAppOpen}
              setIsWhatsAppOpen={setIsAdminWhatsAppOpen}
            />
          </main>
        </div>

        {/* Switch User Modal in Admin */}
        <Modal isOpen={isSwitchUserOpen} onClose={() => setIsSwitchUserOpen(false)} title="Ganti Akun">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <form onSubmit={handleSwitchStudent} className="card" style={{ padding: '1rem 1.15rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem' }}>Beralih ke Akun Siswa</h4>
              <div className="form-group">
                <label className="form-label">Pilih Siswa</label>
                <select
                  className="form-select"
                  value={switchStudentId}
                  onChange={(e) => setSwitchStudentId(e.target.value)}
                >
                  {data.members.map(m => (
                    <option key={m.id} value={m.id}>
                      #{m.absentNo} · {m.name} ({m.roleTitle || 'Siswa'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">PIN</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="1234"
                  value={switchPin}
                  onChange={(e) => setSwitchPin(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Buka Mode Siswa
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reset data demo:</span>
              <button onClick={handleResetData} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
                Reset Data
              </button>
            </div>
          </div>
        </Modal>

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
  // 2. STUDENT / USER MODE: "Today First / Daily Companion" (Simpel & Bersih)
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
            <span>Mode Pratinjau: Tampilan Siswa (Akun Admin Sedang Aktif)</span>
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

      {/* Clean Student Top Header (No bulky left sidebar) */}
      <StudentHeader
        activeStudentView={activeStudentView}
        setActiveStudentView={setActiveStudentView}
        onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
      />

      <InstallBanner />

      {/* Main Companion Canvas (Centered, high-signal, zero clutter) */}
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
        {activeStudentView === 'schedule' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <button 
                onClick={() => setActiveStudentView('dashboard')}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--primary)', fontWeight: 600, paddingLeft: 0, gap: '0.25rem' }}
              >
                ← Kembali ke Hari Ini
              </button>
            </div>
            <ScheduleView />
          </div>
        )}
        {activeStudentView === 'academic' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <button 
                onClick={() => setActiveStudentView('dashboard')}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--primary)', fontWeight: 600, paddingLeft: 0, gap: '0.25rem' }}
              >
                ← Kembali ke Hari Ini
              </button>
            </div>
            <AcademicView />
          </div>
        )}
        {activeStudentView === 'class' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <button 
                onClick={() => setActiveStudentView('dashboard')}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--primary)', fontWeight: 600, paddingLeft: 0, gap: '0.25rem' }}
              >
                ← Kembali ke Hari Ini
              </button>
            </div>
            <ClassView />
          </div>
        )}
      </main>

      {/* Switch User Modal for Students */}
      <Modal isOpen={isSwitchUserOpen} onClose={() => setIsSwitchUserOpen(false)} title="Ganti Akun">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Switch to Another Student */}
          <form onSubmit={handleSwitchStudent} className="card" style={{ padding: '1rem 1.15rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pilih Akun Siswa</h4>
            <div className="form-group">
              <label className="form-label">Nama Siswa</label>
              <select
                className="form-select"
                value={switchStudentId}
                onChange={(e) => setSwitchStudentId(e.target.value)}
              >
                {data.members.map(m => (
                  <option key={m.id} value={m.id}>
                    #{m.absentNo} · {m.name} ({m.roleTitle || 'Siswa'})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">PIN Siswa</label>
              <input
                type="password"
                className="form-input"
                placeholder="1234"
                value={switchPin}
                onChange={(e) => setSwitchPin(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Buka Akun Siswa Ini
            </button>
          </form>

          {/* Switch to Admin */}
          <form onSubmit={handleSwitchAdmin} className="card" style={{ padding: '1rem 1.15rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Masuk Portal Pengurus / Admin</span>
            </h4>
            <div className="form-group">
              <label className="form-label">PIN Master Admin</label>
              <input
                type="password"
                className="form-input"
                placeholder="admin123"
                value={switchAdminPin}
                onChange={(e) => setSwitchAdminPin(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Masuk Admin Dashboard
            </button>
          </form>

          {/* Reset Demo Data */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reset data demo:</span>
            <button onClick={handleResetData} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
              Reset Data
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}
