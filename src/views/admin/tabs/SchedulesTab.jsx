import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Utensils,
  RotateCcw
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';

export default function SchedulesTab() {
  const {
    data,
    updateSchedule,
    addMbgMember,
    removeMbgMember,
    resetMbgToDefault
  } = useStore();
  const { showToast } = useToast();

  const members = data.members || [];
  const [selectedDay, setSelectedDay] = useState('Senin');

  // Modal Add Subject state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubStart, setNewSubStart] = useState('07:30');
  const [newSubEnd, setNewSubEnd] = useState('09:00');

  const handleAddSubjectToDay = (e) => {
    e.preventDefault();
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const updatedSubjects = [
      ...(currentDaySchedule.subjects || []),
      {
        subject: newSubName.trim(),
        timeStart: newSubStart,
        timeEnd: newSubEnd
      }
    ].sort((a, b) => a.timeStart.localeCompare(b.timeStart));

    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      subjects: updatedSubjects
    });
    setIsAddSubjectOpen(false);
    setNewSubName('');
    showToast(`Mata pelajaran ditambahkan ke hari ${selectedDay}!`, 'success');
  };

  const handleDeleteSubject = (idx) => {
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const updatedSubjects = currentDaySchedule.subjects.filter((_, i) => i !== idx);
    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      subjects: updatedSubjects
    });
    showToast('Mata pelajaran dihapus.', 'info');
  };

  const handleAddPiketMember = (name) => {
    if (!name) return;
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const currentList = currentDaySchedule.piket || [];
    if (currentList.includes(name)) {
      showToast(`${name} sudah terdaftar di piket hari ${selectedDay}`, 'warning');
      return;
    }
    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      piket: [...currentList, name]
    });
    showToast(`${name} ditambahkan ke piket ${selectedDay}`, 'success');
  };

  const handleRemovePiketMember = (name) => {
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const currentList = currentDaySchedule.piket || [];
    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      piket: currentList.filter(n => n !== name)
    });
    showToast(`${name} dihapus dari piket ${selectedDay}`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`btn btn-sm ${selectedDay === day ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: 600, padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)' }}
          >
            Hari {day}
          </button>
        ))}
      </div>

      {/* Selected Day Subjects */}
      <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.65rem' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
            Daftar Pelajaran — Hari {selectedDay}
          </h3>
          <button onClick={() => setIsAddSubjectOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem', whiteSpace: 'nowrap' }}>
            <Plus size={14} />
            <span>Tambah Jam Pelajaran</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {((data.schedules?.[selectedDay]?.subjects) || []).map((sub, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              gap: '0.65rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 180px', minWidth: 0 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)', width: '24px', flexShrink: 0 }}>#{idx + 1}</span>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', wordBreak: 'break-word', minWidth: 0 }}>{sub.subject}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
                <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {sub.timeStart} - {sub.timeEnd}
                </span>
                <button
                  onClick={() => handleDeleteSubject(idx)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--danger)', padding: '0.25rem', flexShrink: 0 }}
                  title="Hapus jam ini"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Piket Team Editor for Selected Day */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
              Regu Piket Kebersihan ({selectedDay})
            </h4>
            <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
              {(data.schedules?.[selectedDay]?.piket || []).length} Siswa Bertugas
            </span>
          </div>

          {/* Active Piket Member Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem', minHeight: '34px', alignItems: 'center' }}>
            {(data.schedules?.[selectedDay]?.piket || []).length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Belum ada anggota piket untuk hari {selectedDay}.
              </span>
            ) : (
              (data.schedules?.[selectedDay]?.piket || []).map((name) => (
                <span
                  key={name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--hover-bg)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePiketMember(name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--text-muted)',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title={`Hapus ${name} dari piket`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Add from Dropdown */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', maxWidth: '420px' }}>
            <select
              className="form-input"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddPiketMember(e.target.value);
                }
              }}
              style={{ fontSize: '0.84rem', cursor: 'pointer' }}
            >
              <option value="">+ Pilih Siswa untuk Menambah Piket...</option>
              {members
                .filter(m => !(data.schedules?.[selectedDay]?.piket || []).includes(m.name))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(m => (
                  <option key={m.id} value={m.name}>
                    #{m.absentNo} - {m.name}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        {/* Piket MBG (Makan Bergizi Gratis) Team Editor for Selected Day */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Utensils size={16} color="var(--primary)" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                Regu Piket MBG — Hari {selectedDay}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan jadwal Piket MBG ke default 6 siswa per hari?')) {
                  resetMbgToDefault();
                  showToast('Jadwal Piket MBG di-reset ke default', 'info');
                }
              }}
              className="btn btn-ghost btn-xs"
              style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
            >
              Reset Default
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* 1. Pengambil */}
            <div style={{ backgroundColor: 'var(--bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Utensils size={13} />
                  <span>Tim Pengambil (11.30 WIB)</span>
                </span>
                <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  {(data.piketMbg?.[selectedDay]?.ambil || []).length} / 3 Siswa
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem', minHeight: '32px', alignItems: 'center' }}>
                {(data.piketMbg?.[selectedDay]?.ambil || []).length === 0 ? (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum ada pengambil.</span>
                ) : (
                  (data.piketMbg?.[selectedDay]?.ambil || []).map(name => (
                    <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 500, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                      <span>{name}</span>
                      <button type="button" onClick={() => removeMbgMember(selectedDay, 'ambil', name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <select
                className="form-input"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addMbgMember(selectedDay, 'ambil', e.target.value);
                    showToast(`${e.target.value} ditambahkan ke Pengambil MBG`, 'success');
                  }
                }}
                style={{ fontSize: '0.8rem', cursor: 'pointer', padding: '0.35rem 0.55rem' }}
              >
                <option value="">+ Tambah Petugas Pengambil...</option>
                {members
                  .filter(m => !(data.piketMbg?.[selectedDay]?.ambil || []).includes(m.name))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(m => (
                    <option key={m.id} value={m.name}>#{m.absentNo} - {m.name}</option>
                  ))}
              </select>
            </div>

            {/* 2. Pengembali */}
            <div style={{ backgroundColor: 'var(--bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <RotateCcw size={13} />
                  <span>Tim Pengembali (12.30 WIB)</span>
                </span>
                <span className="notion-tag notion-tag-green" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  {(data.piketMbg?.[selectedDay]?.balikin || []).length} / 3 Siswa
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem', minHeight: '32px', alignItems: 'center' }}>
                {(data.piketMbg?.[selectedDay]?.balikin || []).length === 0 ? (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum ada pengembali.</span>
                ) : (
                  (data.piketMbg?.[selectedDay]?.balikin || []).map(name => (
                    <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 500, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                      <span>{name}</span>
                      <button type="button" onClick={() => removeMbgMember(selectedDay, 'balikin', name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <select
                className="form-input"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addMbgMember(selectedDay, 'balikin', e.target.value);
                    showToast(`${e.target.value} ditambahkan ke Pengembali MBG`, 'success');
                  }
                }}
                style={{ fontSize: '0.8rem', cursor: 'pointer', padding: '0.35rem 0.55rem' }}
              >
                <option value="">+ Tambah Petugas Pengembali...</option>
                {members
                  .filter(m => !(data.piketMbg?.[selectedDay]?.balikin || []).includes(m.name))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(m => (
                    <option key={m.id} value={m.name}>#{m.absentNo} - {m.name}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH JAM PELAJARAN */}
      <Modal isOpen={isAddSubjectOpen} onClose={() => setIsAddSubjectOpen(false)} title={`Tambah Pelajaran — Hari ${selectedDay}`}>
        <form onSubmit={handleAddSubjectToDay} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Pemrograman Web"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">Jam Mulai</label>
              <input
                type="time"
                className="form-input"
                value={newSubStart}
                onChange={(e) => setNewSubStart(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jam Selesai</label>
              <input
                type="time"
                className="form-input"
                value={newSubEnd}
                onChange={(e) => setNewSubEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Jam Pelajaran
          </button>
        </form>
      </Modal>
    </div>
  );
}
