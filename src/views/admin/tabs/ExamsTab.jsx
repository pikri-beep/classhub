import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import {
  SearchInput,
  FilterPills,
  EmptyState,
  StatusBadge,
  ActionMenu,
  ConfirmDialog,
  SubjectPicker
} from '../../../components/admin';
import { formatDateIndo, formatDateTimeIndo, getDeadlineStatus } from '../../../lib/dateUtils';
import { formatForDatetimeLocal } from '../utils/adminHelpers';

export default function ExamsTab({
  isAddExamOpen: propIsAddExamOpen,
  setIsAddExamOpen: propSetIsAddExamOpen,
  examToEdit,
  setExamToEdit
} = {}) {
  const { data, addExam, updateExam, deleteExam, addEvent, updateEvent, deleteEvent } = useStore();
  const { showToast } = useToast();

  const exams = data.exams || [];
  const eventsList = data.events || [];

  // Sub-tab: 'exams' | 'events'
  const [examSubTab, setExamSubTab] = useState('exams');

  // Search & Filter state
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examFilterStatus, setExamFilterStatus] = useState('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventFilterStatus, setEventFilterStatus] = useState('all');

  // Modals state
  const [internalIsAddExamOpen, setInternalIsAddExamOpen] = useState(false);
  const isAddExamOpen = propIsAddExamOpen !== undefined ? propIsAddExamOpen : internalIsAddExamOpen;
  const setIsAddExamOpen = propSetIsAddExamOpen !== undefined ? propSetIsAddExamOpen : setInternalIsAddExamOpen;

  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [selectedExamForEdit, setSelectedExamForEdit] = useState(null);
  const [examToDelete, setExamToDelete] = useState(null);

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Form states - Add Exam
  const [examSubject, setExamSubject] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examScope, setExamScope] = useState('');

  // Form states - Edit Exam
  const [editExamSubject, setEditExamSubject] = useState('');
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editExamScope, setEditExamScope] = useState('');

  // Form states - Add Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType] = useState('event');

  // Form states - Edit Event
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventDesc, setEditEventDesc] = useState('');
  const [editEventType, setEditEventType] = useState('event');

  const todayDateStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingExamsCount = useMemo(() => {
    return exams.filter(ex => {
      if (!ex.examDate) return false;
      const d = new Date(ex.examDate);
      return !isNaN(d.getTime()) && d >= todayDateStart;
    }).length;
  }, [exams, todayDateStart]);

  const passedExamsCount = useMemo(() => {
    return exams.length - upcomingExamsCount;
  }, [exams, upcomingExamsCount]);

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const q = examSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (exam.title || '').toLowerCase().includes(q) ||
        (exam.subject || '').toLowerCase().includes(q) ||
        (exam.scope || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (examFilterStatus === 'all') return true;
      const d = new Date(exam.examDate);
      const isUpcoming = !isNaN(d.getTime()) && d >= todayDateStart;
      return examFilterStatus === 'upcoming' ? isUpcoming : !isUpcoming;
    });
  }, [exams, examSearchQuery, examFilterStatus, todayDateStart]);

  const upcomingEventsCount = useMemo(() => {
    return eventsList.filter(ev => {
      if (!ev.date) return false;
      const d = new Date(ev.date);
      return !isNaN(d.getTime()) && d >= todayDateStart;
    }).length;
  }, [eventsList, todayDateStart]);

  const passedEventsCount = useMemo(() => {
    return eventsList.length - upcomingEventsCount;
  }, [eventsList, upcomingEventsCount]);

  const filteredEvents = useMemo(() => {
    return eventsList.filter(ev => {
      const q = eventSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (ev.title || '').toLowerCase().includes(q) ||
        (ev.desc || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (eventFilterStatus === 'all') return true;
      const d = new Date(ev.date);
      const isUpcoming = !isNaN(d.getTime()) && d >= todayDateStart;
      return eventFilterStatus === 'upcoming' ? isUpcoming : !isUpcoming;
    });
  }, [eventsList, eventSearchQuery, eventFilterStatus, todayDateStart]);

  // Handlers - Exam
  const handleCreateExam = (e) => {
    e.preventDefault();
    addExam({
      subject: examSubject.trim(),
      title: examTitle.trim(),
      examDate: examDate,
      scope: examScope.trim()
    });
    setIsAddExamOpen(false);
    setExamSubject('');
    setExamTitle('');
    setExamDate('');
    setExamScope('');
    showToast('Jadwal ujian berhasil ditambahkan!', 'success');
  };

  const handleOpenEditExam = (exam) => {
    setSelectedExamForEdit(exam);
    setEditExamSubject(exam.subject || '');
    setEditExamTitle(exam.title || '');
    setEditExamDate(formatForDatetimeLocal(exam.examDate));
    setEditExamScope(exam.scope || '');
    setIsEditExamOpen(true);
  };

  useEffect(() => {
    if (examToEdit) {
      setExamSubTab('exams');
      handleOpenEditExam(examToEdit);
      setExamToEdit?.(null);
    }
  }, [examToEdit]);

  const handleUpdateExam = (e) => {
    e.preventDefault();
    if (!selectedExamForEdit) return;
    updateExam(selectedExamForEdit.id, {
      subject: editExamSubject.trim(),
      title: editExamTitle.trim(),
      examDate: editExamDate,
      scope: editExamScope.trim()
    });
    setIsEditExamOpen(false);
    showToast(`Jadwal ujian "${editExamTitle.trim()}" berhasil diperbarui!`, 'success');
  };

  // Handlers - Event
  const handleCreateEvent = (e) => {
    e.preventDefault();
    addEvent({
      title: eventTitle.trim(),
      date: eventDate,
      desc: eventDesc.trim(),
      type: eventType
    });
    setIsAddEventOpen(false);
    setEventTitle('');
    setEventDate('');
    setEventDesc('');
    showToast('Agenda kelas baru berhasil disimpan!', 'success');
  };

  const handleOpenEditEvent = (ev) => {
    setSelectedEventForEdit(ev);
    setEditEventTitle(ev.title || '');
    setEditEventDate(ev.date || '');
    setEditEventDesc(ev.desc || '');
    setEditEventType(ev.type || 'event');
    setIsEditEventOpen(true);
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    if (!selectedEventForEdit) return;
    if (!editEventTitle.trim() || !editEventDate) {
      showToast('Mohon lengkapi nama kegiatan dan tanggal agenda.', 'warning');
      return;
    }
    updateEvent(selectedEventForEdit.id, {
      title: editEventTitle.trim(),
      date: editEventDate,
      desc: editEventDesc.trim(),
      type: editEventType
    });
    setIsEditEventOpen(false);
    showToast(`Agenda "${editEventTitle.trim()}" berhasil diperbarui!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1.2rem'
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {examSubTab === 'exams' ? 'Jadwal Ujian & Ulangan Harian' : 'Agenda & Kalender Kelas'}
          </h2>

          {/* Action Button */}
          {examSubTab === 'exams' ? (
            <button
              type="button"
              onClick={() => setIsAddExamOpen(true)}
              className="btn btn-primary btn-sm"
              style={{
                gap: '0.4rem',
                fontWeight: 600,
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
                color: '#FFFFFF'
              }}
            >
              <Plus size={15} />
              <span>Tambah Ujian</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddEventOpen(true)}
              className="btn btn-primary btn-sm"
              style={{
                gap: '0.4rem',
                fontWeight: 600,
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
                color: '#FFFFFF'
              }}
            >
              <Plus size={15} />
              <span>Tambah Agenda</span>
            </button>
          )}
        </div>

        {/* Sub-tab Navigation (Ujian vs Agenda) */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setExamSubTab('exams')}
            className={`btn btn-sm ${examSubTab === 'exams' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <BookOpen size={14} />
            <span>Jadwal Ujian ({exams.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setExamSubTab('events')}
            className={`btn btn-sm ${examSubTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <Calendar size={14} />
            <span>Agenda Kelas ({eventsList.length})</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        {examSubTab === 'exams' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <SearchInput
              value={examSearchQuery}
              onChange={(e) => setExamSearchQuery(e.target.value)}
              onClear={() => setExamSearchQuery('')}
              placeholder="Cari mata pelajaran, judul ujian, materi..."
              style={{ maxWidth: '320px', height: '36px' }}
            />
            <FilterPills
              options={[
                { value: 'all', label: `Semua (${exams.length})` },
                { value: 'upcoming', label: `Mendatang (${upcomingExamsCount})` },
                { value: 'passed', label: `Sudah Lewat (${passedExamsCount})` }
              ]}
              activeValue={examFilterStatus}
              onChange={setExamFilterStatus}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <SearchInput
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
              onClear={() => setEventSearchQuery('')}
              placeholder="Cari judul kegiatan, keterangan..."
              style={{ maxWidth: '320px', height: '36px' }}
            />
            <FilterPills
              options={[
                { value: 'all', label: `Semua (${eventsList.length})` },
                { value: 'upcoming', label: `Mendatang (${upcomingEventsCount})` },
                { value: 'passed', label: `Sudah Lewat (${passedEventsCount})` }
              ]}
              activeValue={eventFilterStatus}
              onChange={setEventFilterStatus}
            />
          </div>
        )}

        {/* Content Lists */}
        {examSubTab === 'exams' ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredExams.length === 0 ? (
              <EmptyState
                title={examSearchQuery || examFilterStatus !== 'all' ? 'Jadwal Ujian Tidak Ditemukan' : 'Belum Ada Jadwal Ujian'}
                actionLabel="+ Tambah Ujian"
                onAction={() => setIsAddExamOpen(true)}
              />
            ) : (
              filteredExams.map((exam, idx) => {
                const deadlineStatus = getDeadlineStatus(exam.examDate);
                return (
                  <div
                    key={exam.id}
                    style={{
                      padding: '0.95rem 0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      borderBottom: idx === filteredExams.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                        {exam.title}
                      </h3>

                      {/* Two-Tier Metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600 }}>
                          {exam.subject}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                          <Calendar size={12} />
                          {formatDateTimeIndo(exam.examDate)}
                        </span>
                        {deadlineStatus.urgency !== 'neutral' && (
                          <StatusBadge variant={deadlineStatus.urgency} size="sm" dot>
                            {deadlineStatus.label}
                          </StatusBadge>
                        )}
                      </div>

                      {exam.scope && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.25rem' }}>
                          <span style={{ fontWeight: 500, flexShrink: 0 }}>Materi:</span>
                          <span style={{ wordBreak: 'break-word' }}>{exam.scope}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <ActionMenu
                        align="right"
                        items={[
                          {
                            label: 'Edit Ujian',
                            icon: <Edit3 size={14} />,
                            onClick: () => handleOpenEditExam(exam)
                          },
                          {
                            label: 'Hapus Ujian',
                            icon: <Trash2 size={14} />,
                            variant: 'danger',
                            onClick: () => setExamToDelete(exam)
                          }
                        ]}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredEvents.length === 0 ? (
              <EmptyState
                title={eventSearchQuery || eventFilterStatus !== 'all' ? 'Agenda Tidak Ditemukan' : 'Belum Ada Agenda Kelas'}
                actionLabel="+ Tambah Agenda"
                onAction={() => setIsAddEventOpen(true)}
              />
            ) : (
              filteredEvents.map((ev, idx) => {
                const evDeadline = getDeadlineStatus(ev.date);
                return (
                  <div
                    key={ev.id}
                    style={{
                      padding: '0.95rem 0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      borderBottom: idx === filteredEvents.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                        {ev.title}
                      </h3>

                      {/* Two-Tier Metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                          <Calendar size={12} />
                          {formatDateIndo(ev.date, { withDay: true, monthFormat: 'long' })}
                        </span>
                        {evDeadline.urgency !== 'neutral' && (
                          <StatusBadge variant={evDeadline.urgency} size="sm" dot>
                            {evDeadline.label}
                          </StatusBadge>
                        )}
                      </div>

                      {ev.desc && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', lineHeight: 1.45, wordBreak: 'break-word' }}>
                          {ev.desc}
                        </p>
                      )}
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <ActionMenu
                        align="right"
                        items={[
                          {
                            label: 'Edit Agenda',
                            icon: <Edit3 size={14} />,
                            onClick: () => handleOpenEditEvent(ev)
                          },
                          {
                            label: 'Hapus Agenda',
                            icon: <Trash2 size={14} />,
                            variant: 'danger',
                            onClick: () => setEventToDelete(ev)
                          }
                        ]}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH UJIAN */}
      <Modal isOpen={isAddExamOpen} onClose={() => setIsAddExamOpen(false)} title="Tambah Jadwal Ujian">
        <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <SubjectPicker
              value={examSubject}
              onChange={setExamSubject}
              placeholder="Pilih Mata Pelajaran"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Judul Ujian</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: PTS Ganjil Matriks & Linear"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Pelaksanaan Ujian</label>
            <input
              type="date"
              className="form-input"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kisi-kisi / Cakupan Materi</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Bab 1 sampai Bab 3"
              value={examScope}
              onChange={(e) => setExamScope(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Jadwal Ujian
          </button>
        </form>
      </Modal>

      {/* MODAL: EDIT UJIAN */}
      <Modal isOpen={isEditExamOpen} onClose={() => setIsEditExamOpen(false)} title="Edit Jadwal Ujian">
        <form onSubmit={handleUpdateExam} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <SubjectPicker
              value={editExamSubject}
              onChange={setEditExamSubject}
              placeholder="Pilih Mata Pelajaran"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Judul Ujian</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: PTS Ganjil Matriks & Linear"
              value={editExamTitle}
              onChange={(e) => setEditExamTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Pelaksanaan Ujian</label>
            <input
              type="date"
              className="form-input"
              value={editExamDate}
              onChange={(e) => setEditExamDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kisi-kisi / Cakupan Materi</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Bab 1 sampai Bab 3"
              value={editExamScope}
              onChange={(e) => setEditExamScope(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditExamOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TAMBAH AGENDA */}
      <Modal isOpen={isAddEventOpen} onClose={() => setIsAddEventOpen(false)} title="Tambah Agenda Kelas">
        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Kegiatan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kunjungan Industri Tech"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kumpul jam 06.30 di lobi"
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Agenda
          </button>
        </form>
      </Modal>

      {/* MODAL: EDIT AGENDA */}
      <Modal isOpen={isEditEventOpen} onClose={() => setIsEditEventOpen(false)} title="Edit Agenda Kelas">
        <form onSubmit={handleUpdateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Kegiatan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kunjungan Industri Tech"
              value={editEventTitle}
              onChange={(e) => setEditEventTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={editEventDate}
              onChange={(e) => setEditEventDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kumpul jam 06.30 di lobi"
              value={editEventDesc}
              onChange={(e) => setEditEventDesc(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditEventOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DIALOG: HAPUS JADWAL UJIAN */}
      <ConfirmDialog
        isOpen={Boolean(examToDelete)}
        onClose={() => setExamToDelete(null)}
        onConfirm={() => {
          if (examToDelete) {
            const backupExam = { ...examToDelete };
            deleteExam(examToDelete.id);
            showToast(`Jadwal ujian "${backupExam.title}" berhasil dihapus`, 'info', {
              action: {
                label: 'Urungkan',
                onClick: () => {
                  addExam(backupExam);
                  showToast(`Jadwal ujian "${backupExam.title}" dipulihkan! ✨`, 'success');
                }
              }
            });
            setExamToDelete(null);
          }
        }}
        title="Hapus Jadwal Ujian"
        message={`Apakah Anda yakin ingin menghapus jadwal ujian "${examToDelete?.title}" (${examToDelete?.subject})?`}
        confirmLabel="Hapus Ujian"
        variant="danger"
      />

      {/* CONFIRM DIALOG: HAPUS AGENDA KELAS */}
      <ConfirmDialog
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={() => {
          if (eventToDelete) {
            const backupEvent = { ...eventToDelete };
            deleteEvent(eventToDelete.id);
            showToast(`Agenda "${backupEvent.title}" berhasil dihapus`, 'info', {
              action: {
                label: 'Urungkan',
                onClick: () => {
                  addEvent(backupEvent);
                  showToast(`Agenda "${backupEvent.title}" dipulihkan! ✨`, 'success');
                }
              }
            });
            setEventToDelete(null);
          }
        }}
        title="Hapus Agenda Kelas"
        message={`Apakah Anda yakin ingin menghapus agenda "${eventToDelete?.title}"?`}
        confirmLabel="Hapus Agenda"
        variant="danger"
      />
    </div>
  );
}
