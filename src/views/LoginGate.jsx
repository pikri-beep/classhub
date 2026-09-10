import React, { useState } from 'react';
import { ShieldCheck, User, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { InstallBanner } from '../components/InstallBanner';

export default function LoginGate() {
  const { data } = useStore();
  const { loginAsStudent, loginAsAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('student');
  const [selectedStudentId, setSelectedStudentId] = useState('std-1');
  const [studentPin, setStudentPin] = useState('1234');
  const [adminPin, setAdminPin] = useState('admin123');

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Pilih nama siswa terlebih dahulu', 'error');
      return;
    }
    const res = loginAsStudent(selectedStudentId, studentPin);
    if (res.success) {
      showToast(`Selamat datang, ${res.user.name}! 👋`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const res = loginAsAdmin(adminPin);
    if (res.success) {
      showToast('Berhasil masuk Mode Pengurus / Admin! 🛡️', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleQuickDemoLogin = () => {
    const res = loginAsStudent('std-1', '1234');
    if (res.success) {
      showToast(`Selamat datang, ${res.user.name}! (Demo) ⚡`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg)'
    }}>
      <InstallBanner />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2rem 1.35rem',
          boxShadow: 'var(--shadow-md)'
        }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            ClassHub
          </h1>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`btn ${activeTab === 'student' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ flex: 1, fontWeight: activeTab === 'student' ? 700 : 500 }}
          >
            <User size={14} />
            <span>Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`btn ${activeTab === 'admin' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ flex: 1, fontWeight: activeTab === 'admin' ? 700 : 500 }}
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
          </button>
        </div>

        {/* Student Form */}
        {activeTab === 'student' ? (
          <form onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label className="form-label">Nama</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                {data.members.map(m => (
                  <option key={m.id} value={m.id}>
                    #{m.absentNo} · {m.name}
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
                value={studentPin}
                onChange={(e) => setStudentPin(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.88rem', marginTop: '0.4rem' }}>
              <span>Masuk</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="btn btn-ghost"
              style={{
                width: '100%',
                marginTop: '0.65rem',
                fontSize: '0.8rem',
                border: '1px dashed var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              <Zap size={13} color="var(--primary)" />
              <span>Masuk Demo (Ahmad Fauzan)</span>
            </button>
          </form>
        ) : (
          /* Admin Form */
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label className="form-label">PIN Admin</label>
              <input
                type="password"
                className="form-input"
                placeholder="admin123"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.88rem', marginTop: '0.4rem' }}>
              <span>Masuk Admin</span>
              <ShieldCheck size={15} />
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
