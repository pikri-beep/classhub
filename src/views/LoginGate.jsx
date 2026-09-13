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
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-soft)',
            border: '1px solid var(--primary-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '1.1rem',
            marginBottom: '0.75rem'
          }}>
            CH
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            ClassHub
          </h1>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          marginBottom: '1.25rem',
          padding: '0.25rem',
          backgroundColor: 'var(--bg-hover)',
          borderRadius: 'var(--radius-sm)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className="btn btn-sm"
            style={{
              flex: 1,
              fontWeight: activeTab === 'student' ? 700 : 500,
              backgroundColor: activeTab === 'student' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'student' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'student' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              padding: '0.45rem 0.5rem',
              fontSize: '0.82rem',
              gap: '0.4rem'
            }}
          >
            <User size={15} />
            <span>Masuk Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className="btn btn-sm"
            style={{
              flex: 1,
              fontWeight: activeTab === 'admin' ? 700 : 500,
              backgroundColor: activeTab === 'admin' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'admin' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              padding: '0.45rem 0.5rem',
              fontSize: '0.82rem',
              gap: '0.4rem'
            }}
          >
            <ShieldCheck size={15} />
            <span>Portal Admin</span>
          </button>
        </div>

        {/* Student Form */}
        {activeTab === 'student' ? (
          <form onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pilih Nama Siswa</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                {data.members.map(m => (
                  <option key={m.id} value={m.id}>
                    #{m.absentNo} · {m.name} ({m.roleTitle || 'Siswa'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>PIN Siswa</label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Default: 1234</span>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan PIN 4 angka..."
                value={studentPin}
                onChange={(e) => setStudentPin(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              <span>Buka Daily Companion</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="btn btn-ghost"
              style={{
                width: '100%',
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                border: '1px dashed var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              <Zap size={14} color="var(--primary)" />
              <span>Masuk Cepat Demo (Ahmad Fauzan)</span>
            </button>
          </form>
        ) : (
          /* Admin Form */
          <form onSubmit={handleAdminSubmit}>
            <div style={{
              padding: '0.75rem 0.85rem',
              backgroundColor: 'var(--tag-blue-bg)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              border: '1px solid var(--primary-border)'
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--tag-blue-text)', lineHeight: 1.45 }}>
                Area khusus Wali Kelas & Pengurus Inti untuk mengelola jadwal, tugas, ujian, buku kas, dan broadcast WA.
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Master PIN Pengurus</label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Default: admin123</span>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan PIN Master Admin..."
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              <span>Masuk Admin Dashboard</span>
              <ShieldCheck size={15} />
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
