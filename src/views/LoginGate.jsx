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
          <div style={{ fontSize: '2.25rem', lineHeight: 1, marginBottom: '0.5rem' }}>🏫</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            ClassHub
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Portal Terpadu Kelas <strong>{data.classInfo.name}</strong> • {data.classInfo.school}
          </p>
          <div style={{ marginTop: '0.65rem' }}>
            <span className="notion-tag notion-tag-gray">Akses Terproteksi Anggota Kelas</span>
          </div>
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
            <User size={15} />
            <span>Masuk Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`btn ${activeTab === 'admin' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ flex: 1, fontWeight: activeTab === 'admin' ? 700 : 500 }}
          >
            <ShieldCheck size={15} />
            <span>Pengurus / Admin</span>
          </button>
        </div>

        {/* Student Form */}
        {activeTab === 'student' ? (
          <form onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label className="form-label">Pilih Nama Anda</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                {data.members.map(m => (
                  <option key={m.id} value={m.id}>
                    Absen {m.absentNo}. {m.name} ({m.roleTitle || 'Siswa'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ margin: 0 }}>PIN Siswa</label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bawaan: 1234</span>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="4 digit PIN"
                value={studentPin}
                onChange={(e) => setStudentPin(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <span>Masuk ke Kelas Saya</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="btn btn-ghost"
              style={{
                width: '100%',
                marginTop: '0.65rem',
                fontSize: '0.8125rem',
                border: '1px dashed var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <Zap size={14} color="var(--primary)" />
              <span>Masuk Instan (Ahmad Fauzan - Demo)</span>
            </button>
          </form>
        ) : (
          /* Admin Form */
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label className="form-label">Master PIN Pengurus / Wali Kelas</label>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan Master PIN"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Master PIN Bawaan: <strong>admin123</strong>
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <span>Buka Akses Pengurus</span>
              <ShieldCheck size={16} />
            </button>
          </form>
        )}

        {/* Homeroom teacher footer */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          Wali Kelas: <strong style={{ color: 'var(--text-primary)' }}>{data.classInfo.homeroomTeacher}</strong>
        </div>
      </div>
      </div>
    </div>
  );
}
