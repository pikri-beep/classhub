import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useStore } from './context/StoreContext';
import { useToast } from './context/ToastContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Modal from './components/Modal';
import { InstallBanner } from './components/InstallBanner';

import LoginGate from './views/LoginGate';
import DashboardView from './views/DashboardView';
import AcademicView from './views/AcademicView';
import ScheduleView from './views/ScheduleView';
import CashView from './views/CashView';
import ClassView from './views/ClassView';

export default function App() {
  const { isAuthenticated, currentUser, loginAsStudent, loginAsAdmin } = useAuth();
  const { data, resetToDefault } = useStore();
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState('dashboard');
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);

  // Switch user form states
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

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <InstallBanner />
        <Header
          activeView={activeView}
          onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
        />

        <main className="page-container">
          {activeView === 'dashboard' && <DashboardView onNavigate={setActiveView} />}
          {activeView === 'academic' && <AcademicView />}
          {activeView === 'schedule' && <ScheduleView />}
          {activeView === 'cash' && <CashView />}
          {activeView === 'class' && <ClassView />}
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileNav activeView={activeView} setActiveView={setActiveView} />

      {/* SWITCH USER MODAL */}
      <Modal isOpen={isSwitchUserOpen} onClose={() => setIsSwitchUserOpen(false)} title="Pengaturan Akun & Beralih Siswa">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Switch Student */}
          <form onSubmit={handleSwitchStudent} className="card" style={{ padding: '1rem 1.15rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>Beralih ke Akun Siswa Lain</h4>
            <div className="form-group">
              <label className="form-label">Pilih Siswa</label>
              <select
                className="form-select"
                value={switchStudentId}
                onChange={(e) => setSwitchStudentId(e.target.value)}
              >
                {data.members.map(m => (
                  <option key={m.id} value={m.id}>
                    Absen {m.absentNo}. {m.name} ({m.roleTitle || 'Siswa'})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">PIN (Default: 1234)</label>
              <input
                type="password"
                className="form-input"
                value={switchPin}
                onChange={(e) => setSwitchPin(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Beralih ke Akun Terpilih
            </button>
          </form>

          {/* Switch Admin */}
          <form onSubmit={handleSwitchAdmin} className="card" style={{ padding: '1rem 1.15rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>Masuk Mode Master Pengurus / Admin</h4>
            <div className="form-group">
              <label className="form-label">Master PIN (Default: admin123)</label>
              <input
                type="password"
                className="form-input"
                value={switchAdminPin}
                onChange={(e) => setSwitchAdminPin(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Masuk sebagai Master Admin
            </button>
          </form>

          {/* Reset Demo Data */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Reset semua data demo ke awal:</span>
            <button onClick={handleResetData} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
              Reset Data
            </button>
          </div>

        </div>
      </Modal>
    </div>
  );
}
