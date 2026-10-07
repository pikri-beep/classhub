import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Utensils,
  RotateCcw,
  Clock,
  BookOpen,
  Sparkles,
  MessageCircle,
  Edit3
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import {
  ConfirmDialog,
  EmptyState,
  SubjectPicker
} from '../../../components/admin';
import { getSubjectTagClass } from '../../../lib/subjectColors';
import {
  handleSendScheduleToWA,
  handleSendPiketToWA
} from '../utils/adminHelpers';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const TIME_PRESETS = [
  { label: '07:15 - 08:35', start: '07:15', end: '08:35' },
  { label: '08:35 - 10:15', start: '08:35', end: '10:15' },
  { label: '10:30 - 12:00', start: '10:30', end: '12:00' },
  { label: '12:45 - 14:15', start: '12:45', end: '14:15' },
  { label: '14:15 - 15:35', start: '14:15', end: '15:35' }
];

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
  const className = data?.classInfo?.name || 'XI PPLG';

  // Sub-tab: 'lessons' (Jadwal Pelajaran) | 'duties' (Piket Kebersihan & MBG)
  const [activeSubTab, setActiveSubTab] = useState('lessons');
  const [selectedDay, setSelectedDay] = useState('Senin');

  // Modal Add Subject state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubStart, setNewSubStart] = useState('07:15');
  const [newSubEnd, setNewSubEnd] = useState('08:35');

  // Modal Edit Subject state
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubStart, setEditSubStart] = useState('07:15');
  const [editSubEnd, setEditSubEnd] = useState('08:35');

  // Confirmation dialog states
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [piketToDelete, setPiketToDelete] = useState(null);
  const [mbgMemberToDelete, setMbgMemberToDelete] = useState(null);
  const [isResetMbgConfirmOpen, setIsResetMbgConfirmOpen] = useState(false);

  const currentDaySchedule = data.schedules?.[selectedDay] || { subjects: [], piket: [] };
  const currentDaySubjects = currentDaySchedule.subjects || [];
  const currentDayPiket = currentDaySchedule.piket || [];
  const currentDayMbg = data.piketMbg?.[selectedDay] || { ambil: [], balikin: [] };

  // ==========================================
  // HANDLERS: JADWAL PELAJARAN
  // ==========================================
  const handleAddSubjectToDay = (e) => {
    e.preventDefault();
    if (!newSubName.trim()) {
      showToast('Pilih atau masukkan nama mata pelajaran!', 'warning');
      return;
    }

    const updatedSubjects = [
      ...currentDaySubjects,
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

  const handleOpenEditSubject = (sub, idx) => {
    setSubjectToEdit({ index: idx, ...sub });
    setEditSubName(sub.subject || '');
    setEditSubStart(sub.timeStart || '07:15');
    setEditSubEnd(sub.timeEnd || '08:35');
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    if (!subjectToEdit || !editSubName.trim()) return;

    const updatedSubjects = currentDaySubjects.map((sub, i) =>
      i === subjectToEdit.index
        ? { subject: editSubName.trim(), timeStart: editSubStart, timeEnd: editSubEnd }
        : sub
    ).sort((a, b) => a.timeStart.localeCompare(b.timeStart));

    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      subjects: updatedSubjects
    });
    setSubjectToEdit(null);
    showToast(`Mata pelajaran "${editSubName.trim()}" berhasil diperbarui!`, 'success');
  };

  const executeDeleteSubject = () => {
    if (!subjectToDelete) return;
    const day = selectedDay;
    const deletedSub = { ...subjectToDelete };
    const updatedSubjects = currentDaySubjects.filter((_, i) => i !== subjectToDelete.index);

    updateSchedule(day, {
      ...currentDaySchedule,
      subjects: updatedSubjects
    });

    showToast(`Mata pelajaran "${deletedSub.subject}" berhasil dihapus.`, 'info', {
      action: {
        label: 'Urungkan',
        onClick: () => {
          const freshSchedule = data.schedules?.[day] || { subjects: [], piket: [] };
          const restored = [
            ...(freshSchedule.subjects || []),
            { subject: deletedSub.subject, timeStart: deletedSub.timeStart, timeEnd: deletedSub.timeEnd }
          ].sort((a, b) => a.timeStart.localeCompare(b.timeStart));
          updateSchedule(day, {
            ...freshSchedule,
            subjects: restored
          });
          showToast(`Mata pelajaran "${deletedSub.subject}" dipulihkan! ✨`, 'success');
        }
      }
    });

    setSubjectToDelete(null);
  };

  // ==========================================
  // HANDLERS: PIKET KEBERSIHAN
  // ==========================================
  const handleAddPiketMember = (name) => {
    if (!name) return;
    if (currentDayPiket.includes(name)) {
      showToast(`${name} sudah terdaftar di piket hari ${selectedDay}`, 'warning');
      return;
    }
    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      piket: [...currentDayPiket, name]
    });
    showToast(`${name} ditambahkan ke piket ${selectedDay}`, 'success');
  };

  const executeRemovePiketMember = () => {
    if (!piketToDelete) return;
    const { name, day } = piketToDelete;
    const freshSchedule = data.schedules?.[day] || { subjects: [], piket: [] };
    const currentList = freshSchedule.piket || [];

    updateSchedule(day, {
      ...freshSchedule,
      piket: currentList.filter(n => n !== name)
    });

    showToast(`${name} dihapus dari piket ${day}`, 'info', {
      action: {
        label: 'Urungkan',
        onClick: () => {
          const reFresh = data.schedules?.[day] || { subjects: [], piket: [] };
          updateSchedule(day, {
            ...reFresh,
            piket: [...(reFresh.piket || []), name]
          });
          showToast(`${name} dikembalikan ke piket ${day}! ✨`, 'success');
        }
      }
    });

    setPiketToDelete(null);
  };

  // ==========================================
  // HANDLERS: PIKET MBG
  // ==========================================
  const executeRemoveMbgMember = () => {
    if (!mbgMemberToDelete) return;
    const { day, type, typeLabel, name } = mbgMemberToDelete;
    removeMbgMember(day, type, name);

    showToast(`${name} dihapus dari ${typeLabel} MBG`, 'info', {
      action: {
        label: 'Urungkan',
        onClick: () => {
          addMbgMember(day, type, name);
          showToast(`${name} dikembalikan ke ${typeLabel} MBG! ✨`, 'success');
        }
      }
    });

    setMbgMemberToDelete(null);
  };

  const executeResetMbg = () => {
    resetMbgToDefault();
    showToast('Jadwal Piket MBG berhasil di-reset ke susunan default.', 'info');
    setIsResetMbgConfirmOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Control: Sub-Tab Switcher (Segmented Control) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          backgroundColor: 'var(--bg)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          width: 'fit-content'
        }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('lessons')}
            className={`btn btn-sm ${activeSubTab === 'lessons' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              gap: '0.45rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <BookOpen size={15} />
            <span>Jadwal Pelajaran</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('duties')}
            className={`btn btn-sm ${activeSubTab === 'duties' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              gap: '0.45rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Sparkles size={15} />
            <span>Regu Piket & MBG</span>
          </button>
        </div>

        {/* Action Header Button: Kirim WA Cepat */}
        {activeSubTab === 'lessons' ? (
          <button
            type="button"
            onClick={() => handleSendScheduleToWA(selectedDay, currentDaySubjects, className, showToast)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem', fontSize: '0.875rem' }}
            title={`Bagikan jadwal ${selectedDay} ke WhatsApp`}
          >
            <MessageCircle size={15} color="var(--tag-green-text)" />
            <span>Kirim Jadwal ke WA</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSendPiketToWA(selectedDay, currentDayPiket, currentDayMbg, className, showToast)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem', fontSize: '0.875rem' }}
            title={`Bagikan daftar piket ${selectedDay} ke WhatsApp`}
          >
            <MessageCircle size={15} color="var(--tag-green-text)" />
            <span>Kirim Piket ke WA</span>
          </button>
        )}
      </div>

      {/* 2. Day Selector Tabs (Senin - Jumat) */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        {DAYS.map(day => {
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Hari {day}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          PILIHAN 1: JADWAL PELAJARAN (TAB LESSONS)
          ======================================================== */}
      {activeSubTab === 'lessons' && (
        <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Jadwal Pelajaran — Hari {selectedDay}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {currentDaySubjects.length} jam mata pelajaran terdaftar
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewSubName('');
                setNewSubStart('07:15');
                setNewSubEnd('08:35');
                setIsAddSubjectOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={14} />
              <span>Tambah Jam Pelajaran</span>
            </button>
          </div>

          {currentDaySubjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={`Belum ada pelajaran hari ${selectedDay}`}
              description="Tambahkan mata pelajaran dan alokasi jam belajar untuk hari ini."
              actionLabel="Tambah Pelajaran"
              onAction={() => setIsAddSubjectOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentDaySubjects.map((sub, idx) => {
                const tagClass = getSubjectTagClass(sub.subject);
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Urutan Jam & Tag Nama Mata Pelajaran */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 220px', minWidth: 0 }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-surface)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0
                      }}>
                        #{idx + 1}
                      </span>
                      <span
                        className={`notion-tag ${tagClass}`}
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          wordBreak: 'break-word',
                          maxWidth: '100%'
                        }}
                      >
                        {sub.subject}
                      </span>
                    </div>

                    {/* Alokasi Waktu & Aksi Edit/Hapus */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0, marginLeft: 'auto' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-surface)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <Clock size={13} color="var(--primary)" />
                        <span>{sub.timeStart} – {sub.timeEnd}</span>
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditSubject(sub, idx)}
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                          title="Edit jam pelajaran"
                          aria-label={`Edit ${sub.subject}`}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubjectToDelete({
                            index: idx,
                            subject: sub.subject,
                            timeStart: sub.timeStart,
                            timeEnd: sub.timeEnd,
                            time: `${sub.timeStart} – ${sub.timeEnd}`
                          })}
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '0.35rem', color: 'var(--danger)' }}
                          title="Hapus jam pelajaran"
                          aria-label={`Hapus ${sub.subject}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PILIHAN 2: REGU PIKET & MBG (TAB DUTIES)
          ======================================================== */}
      {activeSubTab === 'duties' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card A: Piket Kebersihan Kelas */}
          <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Piket Kebersihan Kelas — Hari {selectedDay}
                  </h3>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Petugas kebersihan ruang kelas XI PPLG
                </p>
              </div>

              <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {currentDayPiket.length} Siswa Bertugas
              </span>
            </div>

            {/* Chips Petugas Kebersihan */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1rem',
              minHeight: '38px',
              alignItems: 'center',
              padding: '0.5rem',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              {currentDayPiket.length === 0 ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.35rem' }}>
                  Belum ada siswa yang ditugaskan piket kebersihan hari {selectedDay}.
                </span>
              ) : (
                currentDayPiket.map((name) => {
                  const student = members.find(m => m.name === name);
                  return (
                    <span
                      key={name}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {student?.absentNo && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          backgroundColor: 'var(--primary-soft)',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.05rem 0.35rem'
                        }}>
                          #{student.absentNo}
                        </span>
                      )}
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => setPiketToDelete({ name, day: selectedDay })}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-muted)',
                          borderRadius: 'var(--radius-full)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        title={`Hapus ${name} dari piket`}
                        aria-label={`Hapus ${name} dari piket`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  );
                })
              )}
            </div>

            {/* Quick Add Dropdown */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', maxWidth: '420px' }}>
              <select
                className="form-input"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddPiketMember(e.target.value);
                  }
                }}
                style={{ fontSize: '0.875rem', cursor: 'pointer' }}
              >
                <option value="">+ Tambah Siswa ke Piket Kebersihan...</option>
                {members
                  .filter(m => !currentDayPiket.includes(m.name))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(m => (
                    <option key={m.id} value={m.name}>
                      #{m.absentNo} — {m.name}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Card B: Piket MBG (Makan Bergizi Gratis) */}
          <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Utensils size={16} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Piket MBG (Makan Bergizi Gratis) — Hari {selectedDay}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Alokasi petugas pengambil dan pengembali wadah makanan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsResetMbgConfirmOpen(true)}
                className="btn btn-ghost btn-xs"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', gap: '0.3rem' }}
                title="Kembalikan susunan piket MBG ke default"
              >
                <RotateCcw size={13} />
                <span>Reset Default</span>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1rem'
            }}>
              {/* Kolom 1: Tim Pengambil */}
              <div style={{
                backgroundColor: 'var(--bg)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tag-orange-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Utensils size={14} />
                    <span>Tim Pengambil (11.30 WIB)</span>
                  </span>
                  <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {(currentDayMbg.ambil || []).length} / 3 Siswa
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  minHeight: '36px',
                  alignItems: 'center'
                }}>
                  {(currentDayMbg.ambil || []).length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Belum ada petugas pengambil.
                    </span>
                  ) : (
                    (currentDayMbg.ambil || []).map(name => (
                      <span
                        key={name}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => setMbgMemberToDelete({ day: selectedDay, type: 'ambil', typeLabel: 'Pengambil', name })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}
                          title={`Hapus ${name} dari Pengambil`}
                          aria-label={`Hapus ${name} dari Pengambil`}
                        >
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
                  style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <option value="">+ Tambah Petugas Pengambil...</option>
                  {members
                    .filter(m => !(currentDayMbg.ambil || []).includes(m.name))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(m => (
                      <option key={m.id} value={m.name}>#{m.absentNo} — {m.name}</option>
                    ))}
                </select>
              </div>

              {/* Kolom 2: Tim Pengembali */}
              <div style={{
                backgroundColor: 'var(--bg)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tag-green-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <RotateCcw size={14} />
                    <span>Tim Pengembali (12.30 WIB)</span>
                  </span>
                  <span className="notion-tag notion-tag-green" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {(currentDayMbg.balikin || []).length} / 3 Siswa
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  minHeight: '36px',
                  alignItems: 'center'
                }}>
                  {(currentDayMbg.balikin || []).length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Belum ada petugas pengembali.
                    </span>
                  ) : (
                    (currentDayMbg.balikin || []).map(name => (
                      <span
                        key={name}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => setMbgMemberToDelete({ day: selectedDay, type: 'balikin', typeLabel: 'Pengembali', name })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}
                          title={`Hapus ${name} dari Pengembali`}
                          aria-label={`Hapus ${name} dari Pengembali`}
                        >
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
                  style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <option value="">+ Tambah Petugas Pengembali...</option>
                  {members
                    .filter(m => !(currentDayMbg.balikin || []).includes(m.name))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(m => (
                      <option key={m.id} value={m.name}>#{m.absentNo} — {m.name}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: TAMBAH JAM PELAJARAN
          ======================================================== */}
      <Modal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        title={`Tambah Pelajaran — Hari ${selectedDay}`}
      >
        <form onSubmit={handleAddSubjectToDay} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <SubjectPicker
              value={newSubName}
              onChange={setNewSubName}
              placeholder="Pilih atau cari mata pelajaran..."
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="form-label">Preset Jam Pelajaran</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setNewSubStart(preset.start);
                    setNewSubEnd(preset.end);
                  }}
                  className="btn btn-secondary btn-xs"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
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

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.4rem' }}>
            Simpan Jam Pelajaran
          </button>
        </form>
      </Modal>

      {/* ========================================================
          MODAL: EDIT JAM PELAJARAN
          ======================================================== */}
      <Modal
        isOpen={Boolean(subjectToEdit)}
        onClose={() => setSubjectToEdit(null)}
        title={`Edit Pelajaran — Hari ${selectedDay}`}
      >
        <form onSubmit={handleUpdateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <SubjectPicker
              value={editSubName}
              onChange={setEditSubName}
              placeholder="Pilih atau cari mata pelajaran..."
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="form-label">Preset Jam Pelajaran</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setEditSubStart(preset.start);
                    setEditSubEnd(preset.end);
                  }}
                  className="btn btn-secondary btn-xs"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div className="form-group">
              <label className="form-label">Jam Mulai</label>
              <input
                type="time"
                className="form-input"
                value={editSubStart}
                onChange={(e) => setEditSubStart(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jam Selesai</label>
              <input
                type="time"
                className="form-input"
                value={editSubEnd}
                onChange={(e) => setEditSubEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.4rem' }}>
            Simpan Perubahan
          </button>
        </form>
      </Modal>

      {/* ========================================================
          CONFIRM DIALOGS
          ======================================================== */}
      {/* 1. HAPUS JAM PELAJARAN */}
      <ConfirmDialog
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={executeDeleteSubject}
        title="Hapus Jam Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${subjectToDelete?.subject}" (${subjectToDelete?.time}) pada hari ${selectedDay}?`}
        confirmLabel="Hapus Pelajaran"
        variant="danger"
      />

      {/* 2. HAPUS ANGGOTA PIKET */}
      <ConfirmDialog
        isOpen={Boolean(piketToDelete)}
        onClose={() => setPiketToDelete(null)}
        onConfirm={executeRemovePiketMember}
        title="Hapus Petugas Piket"
        message={`Apakah Anda yakin ingin menghapus "${piketToDelete?.name}" dari regu piket hari ${selectedDay}?`}
        confirmLabel="Hapus Petugas"
        variant="danger"
      />

      {/* 3. HAPUS ANGGOTA MBG */}
      <ConfirmDialog
        isOpen={Boolean(mbgMemberToDelete)}
        onClose={() => setMbgMemberToDelete(null)}
        onConfirm={executeRemoveMbgMember}
        title={`Hapus Petugas ${mbgMemberToDelete?.typeLabel || 'MBG'}`}
        message={`Apakah Anda yakin ingin menghapus "${mbgMemberToDelete?.name}" dari tim ${mbgMemberToDelete?.typeLabel?.toLowerCase()} MBG hari ${selectedDay}?`}
        confirmLabel="Hapus Petugas"
        variant="danger"
      />

      {/* 4. RESET MBG KE DEFAULT */}
      <ConfirmDialog
        isOpen={isResetMbgConfirmOpen}
        onClose={() => setIsResetMbgConfirmOpen(false)}
        onConfirm={executeResetMbg}
        title="Reset Jadwal Piket MBG"
        message="Kembalikan konfigurasi regu Piket Makan Bergizi Gratis (MBG) ke susunan default 6 siswa per hari? Perubahan kustom saat ini akan digantikan."
        confirmLabel="Reset ke Default"
        variant="danger"
      />
    </div>
  );
}
