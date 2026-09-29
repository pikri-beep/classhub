import React, { useState } from 'react';
import { Check, Plus, Trash2, ExternalLink, Calendar, BookOpen, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { formatDateIndo } from '../lib/dateUtils';

export default function AcademicView() {
  const { currentUser, isAdmin } = useAuth();
  const { data, addTask, deleteTask, updateTaskStatus, addExam, deleteExam } = useStore();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('tasks');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [expandedExamId, setExpandedExamId] = useState(null);

  // Modals
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // New task form state
  const [taskSubject, setTaskSubject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLink, setTaskLink] = useState('');

  // New exam form state
  const [examSubject, setExamSubject] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examScope, setExamScope] = useState('');

  const tasks = data.tasks || [];
  const exams = data.exams || [];
  const subjects = ['all', ...new Set(tasks.map(t => t.subject))];

  const filteredTasks = tasks.filter(task => {
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;
    return true;
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    addTask({
      subject: taskSubject.trim(),
      title: taskTitle.trim(),
      deadline: taskDeadline,
      description: taskDesc.trim(),
      link: taskLink.trim()
    });
    setIsAddTaskOpen(false);
    setTaskSubject('');
    setTaskTitle('');
    setTaskDeadline('');
    setTaskDesc('');
    setTaskLink('');
    showToast('Tugas baru berhasil ditambahkan!', 'success');
  };

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
    showToast('Jadwal ujian berhasil disimpan!', 'success');
  };

  return (
    <div>

      {/* 2. SUB-TAB BAR & ACTIONS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`btn ${activeSubTab === 'tasks' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ fontWeight: activeSubTab === 'tasks' ? 700 : 500 }}
          >
            <BookOpen size={15} />
            <span>Daftar Tugas ({tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('exams')}
            className={`btn ${activeSubTab === 'exams' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ fontWeight: activeSubTab === 'exams' ? 700 : 500 }}
          >
            <GraduationCap size={15} />
            <span>Jadwal Ujian ({exams.length})</span>
          </button>
        </div>

        {isAdmin && (
          <div>
            {activeSubTab === 'tasks' ? (
              <button onClick={() => setIsAddTaskOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={15} />
                <span>+ Tambah Tugas</span>
              </button>
            ) : (
              <button onClick={() => setIsAddExamOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={15} />
                <span>+ Jadwalkan Ujian</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. TASKS CONTENT */}
      {activeSubTab === 'tasks' && (
        <div>
          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Daftar Tugas
              </span>
              <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem' }}>
                {filteredTasks.length} Tugas
              </span>
            </div>

            <select
              className="form-select"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Tasks List View (Clean Cards with Dropdown Accordion) */}
          {filteredTasks.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Tidak ada tugas ditemukan</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Semua tugas sesuai kriteria filter telah selesai atau belum ditugaskan.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.5rem' }}>
              {filteredTasks.map(task => {
                const dObj = new Date(task.deadline);
                const dateStr = formatDateIndo(task.deadline, { withDay: false, monthFormat: 'short' });
                const isNear = !isNaN(dObj) && (dObj - new Date()) > 0 && (dObj - new Date()) < 86400000 * 3;
                const isExpanded = expandedTaskId === task.id;
                const hasDetails = Boolean(task.description || task.link);

                return (
                  <div key={task.id} className="clean-task-card">
                    <div className="clean-task-main">
                      {/* Title & Tags */}
                      <div
                        style={{ flex: 1, minWidth: 0, cursor: hasDetails ? 'pointer' : 'default' }}
                        onClick={() => hasDetails && setExpandedTaskId(isExpanded ? null : task.id)}
                      >
                        <div className="clean-task-title">
                          {task.title}
                        </div>
                        <div className="clean-task-tags">
                          <span className="clean-tag-subject">{task.subject}</span>
                          <span className={`clean-tag-deadline ${isNear ? 'urgent' : ''}`}>
                            <Calendar size={11} style={{ marginRight: '0.2rem' }} />
                            {dateStr}
                          </span>
                        </div>
                      </div>

                      {/* Quick actions (Chevron toggle & delete) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {hasDetails && (
                          <button
                            type="button"
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className="btn btn-ghost btn-xs"
                            style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                            title={isExpanded ? 'Tutup rincian' : 'Lihat rincian'}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Hapus tugas ini?')) {
                                deleteTask(task.id);
                                showToast('Tugas berhasil dihapus', 'info');
                              }
                            }}
                            className="btn-ghost btn-xs"
                            style={{ color: 'var(--danger)', padding: '0.25rem' }}
                            title="Hapus Tugas"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progressive Disclosure Body (Accordion) */}
                    {isExpanded && hasDetails && (
                      <div className="clean-task-details">
                        {task.description && (
                          <p className="clean-task-desc">{task.description}</p>
                        )}
                        {task.link && (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="clean-task-link"
                          >
                            <ExternalLink size={12} />
                            <span>Buka Tautan Pengumpulan</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. EXAMS CONTENT */}
      {activeSubTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {exams.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, margin: 0 }}>Belum ada jadwal ujian</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Tidak ada agenda PTS, PAS, atau kuis yang akan datang.
              </p>
            </div>
          ) : (
            exams.map(exam => {
              const dateFormatted = formatDateIndo(exam.examDate, { withDay: true, monthFormat: 'short' });
              const dateObj = new Date(exam.examDate);
              const diffMs = !isNaN(dateObj) ? dateObj - new Date() : 0;
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const isExamExpanded = expandedExamId === exam.id;
              const hasScope = Boolean(exam.scope);

              let tagClass = 'notion-tag-gray';
              let urgencyText = `${diffDays} hari lagi`;
              if (diffDays <= 0) {
                urgencyText = 'Hari Ini';
                tagClass = 'notion-tag-red';
              } else if (diffDays === 1) {
                urgencyText = 'Besok';
                tagClass = 'notion-tag-red';
              } else if (diffDays === 2) {
                urgencyText = '2 hari lagi';
                tagClass = 'notion-tag-red';
              } else if (diffDays <= 5) {
                urgencyText = `${diffDays} hari lagi`;
                tagClass = 'notion-tag-orange';
              } else {
                urgencyText = `${diffDays} hari lagi`;
                tagClass = 'notion-tag-gray';
              }

              return (
                <div key={exam.id} className="clean-task-card" style={{ padding: '0.85rem 1rem' }}>
                  <div className="clean-task-main">
                    <div
                      style={{ flex: 1, minWidth: 0, cursor: hasScope ? 'pointer' : 'default' }}
                      onClick={() => hasScope && setExpandedExamId(isExamExpanded ? null : exam.id)}
                    >
                      <div className="clean-task-title">
                        {exam.title}
                      </div>
                      <div className="clean-task-tags">
                        <span className="clean-tag-subject">{exam.subject}</span>
                        <span className={`clean-tag-deadline ${diffDays <= 2 ? 'urgent' : ''}`}>
                          {urgencyText}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.25rem' }}>
                          <Calendar size={12} />
                          <span>{dateFormatted}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quick actions (Expand toggle & delete) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {hasScope && (
                        <button
                          type="button"
                          onClick={() => setExpandedExamId(isExamExpanded ? null : exam.id)}
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                          title={isExamExpanded ? 'Tutup kisi-kisi' : 'Lihat kisi-kisi'}
                        >
                          {isExamExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Hapus jadwal ujian ini?')) {
                              deleteExam(exam.id);
                              showToast('Jadwal ujian dihapus', 'info');
                            }
                          }}
                          className="btn-ghost btn-xs"
                          style={{ color: 'var(--danger)', padding: '0.25rem' }}
                          title="Hapus Ujian"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accordion Body for Exam Scope */}
                  {isExamExpanded && hasScope && (
                    <div className="clean-task-details">
                      <div style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--callout-bg)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Kisi-kisi & Cakupan:</strong> {exam.scope}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: ADD TASK */}
      <Modal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} title="Tambah Tugas Baru">
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Pemrograman Web"
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Judul Tugas</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Modul 4 REST API"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tenggat Waktu (Deadline)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi / Format Pengumpulan (Opsional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detail tugas atau instruksi guru..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Link Pengumpulan / GCR (Opsional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://classroom.google.com/..."
              value={taskLink}
              onChange={(e) => setTaskLink(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setIsAddTaskOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Tugas
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD EXAM */}
      <Modal isOpen={isAddExamOpen} onClose={() => setIsAddExamOpen(false)} title="Jadwalkan Ujian / Evaluasi">
        <form onSubmit={handleCreateExam}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Matematika Terapan"
              value={examSubject}
              onChange={(e) => setExamSubject(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Jenis / Judul Ujian</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Penilaian Tengah Semester (PTS)"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal & Jam Pelaksanaan</label>
            <input
              type="datetime-local"
              className="form-input"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kisi-kisi & Cakupan Materi</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Materi yang diujikan..."
              value={examScope}
              onChange={(e) => setExamScope(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setIsAddExamOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Jadwal Ujian
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
