import React, { useState, useMemo } from 'react';
import {
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Search,
  X,
  AlertTriangle,
  Clock,
  Edit3,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { MaintenanceScreen } from '../components/admin/MaintenanceScreen';
import { formatDateIndo, formatDateTimeIndo, getDeadlineStatus } from '../lib/dateUtils';
import { formatForDatetimeLocal } from './admin/utils/adminHelpers';

export default function AcademicView() {
  const { isAdmin, isEffectiveAdmin } = useAuth();
  const {
    data,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    addExam,
    updateExam,
    deleteExam,
    personalDoneTasks = [],
    togglePersonalTask
  } = useStore();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'urgent' | 'completed'
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [expandedExamId, setExpandedExamId] = useState(null);

  // Modals state - Create
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // Modals state - Edit
  const [editingTask, setEditingTask] = useState(null);
  const [editingExam, setEditingExam] = useState(null);

  // New task form state
  const [taskSubject, setTaskSubject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLink, setTaskLink] = useState('');

  // Edit task form state
  const [editTaskSubject, setEditTaskSubject] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskLink, setEditTaskLink] = useState('');

  // New exam form state
  const [examSubject, setExamSubject] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examScope, setExamScope] = useState('');

  // Edit exam form state
  const [editExamSubject, setEditExamSubject] = useState('');
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editExamScope, setEditExamScope] = useState('');

  const tasks = data.tasks || [];
  const exams = data.exams || [];

  // Distinct subjects
  const taskSubjects = useMemo(() => ['all', ...new Set(tasks.map(t => t.subject).filter(Boolean))], [tasks]);
  const examSubjects = useMemo(() => ['all', ...new Set(exams.map(e => e.subject).filter(Boolean))], [exams]);

  // Personal task calculation
  const taskStats = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let urgent = 0;

    tasks.forEach(task => {
      const isDone = Boolean(task.isCompleted) || personalDoneTasks.includes(task.id);
      if (isDone) {
        completed++;
      } else {
        pending++;
        const dl = getDeadlineStatus(task.deadline);
        if (dl.urgency === 'danger' || dl.urgency === 'warning') {
          urgent++;
        }
      }
    });

    return { completed, pending, urgent };
  }, [tasks, personalDoneTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (task.title || '').toLowerCase().includes(q);
          const matchSubject = (task.subject || '').toLowerCase().includes(q);
          const matchDesc = (task.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchDesc) return false;
        }

        // Subject
        if (subjectFilter !== 'all' && task.subject !== subjectFilter) {
          return false;
        }

        const isDone = Boolean(task.isCompleted) || personalDoneTasks.includes(task.id);
        const dl = getDeadlineStatus(task.deadline);

        // Status
        if (statusFilter === 'pending') return !isDone;
        if (statusFilter === 'completed') return isDone;
        if (statusFilter === 'urgent') return !isDone && (dl.urgency === 'danger' || dl.urgency === 'warning');

        return true;
      })
      .sort((a, b) => {
        const aDone = Boolean(a.isCompleted) || personalDoneTasks.includes(a.id);
        const bDone = Boolean(b.isCompleted) || personalDoneTasks.includes(b.id);
        // Put pending first
        if (aDone !== bDone) return aDone ? 1 : -1;
        // Then sort by nearest deadline
        const aDate = new Date(a.deadline).getTime() || 0;
        const bDate = new Date(b.deadline).getTime() || 0;
        return aDate - bDate;
      });
  }, [tasks, searchQuery, subjectFilter, statusFilter, personalDoneTasks]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams
      .filter(exam => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (exam.title || '').toLowerCase().includes(q);
          const matchSubject = (exam.subject || '').toLowerCase().includes(q);
          const matchScope = (exam.scope || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchScope) return false;
        }

        if (subjectFilter !== 'all' && exam.subject !== subjectFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aDate = new Date(a.examDate).getTime() || 0;
        const bDate = new Date(b.examDate).getTime() || 0;
        return aDate - bDate;
      });
  }, [exams, searchQuery, subjectFilter]);

  // Toggle personal done
  const handleToggleTaskCheck = (task, e) => {
    e.stopPropagation();
    if (togglePersonalTask) {
      togglePersonalTask(task.id);
      const isNowDone = !personalDoneTasks.includes(task.id) && !task.isCompleted;
      if (isNowDone) {
        showToast('Tugas ditandai selesai! 🎉', 'success');
      } else {
        showToast('Tugas ditandai belum selesai', 'info');
      }
    }
  };

  // Form Handlers - Tasks
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

  const handleOpenEditTask = (task, e) => {
    e?.stopPropagation();
    setEditingTask(task);
    setEditTaskSubject(task.subject || '');
    setEditTaskTitle(task.title || '');
    setEditTaskDeadline(formatForDatetimeLocal(task.deadline));
    setEditTaskDesc(task.description || '');
    setEditTaskLink(task.link || '');
  };

  const handleSaveEditTask = (e) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask.id, {
      subject: editTaskSubject.trim(),
      title: editTaskTitle.trim(),
      deadline: editTaskDeadline,
      description: editTaskDesc.trim(),
      link: editTaskLink.trim()
    });
    setEditingTask(null);
    showToast('Perubahan tugas berhasil disimpan!', 'success');
  };

  // Form Handlers - Exams
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

  const handleOpenEditExam = (exam, e) => {
    e?.stopPropagation();
    setEditingExam(exam);
    setEditExamSubject(exam.subject || '');
    setEditExamTitle(exam.title || '');
    setEditExamDate(formatForDatetimeLocal(exam.examDate));
    setEditExamScope(exam.scope || '');
  };

  const handleSaveEditExam = (e) => {
    e.preventDefault();
    if (!editingExam) return;
    updateExam(editingExam.id, {
      subject: editExamSubject.trim(),
      title: editExamTitle.trim(),
      examDate: editExamDate,
      scope: editExamScope.trim()
    });
    setEditingExam(null);
    showToast('Perubahan ujian berhasil disimpan!', 'success');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSubjectFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="academic-container">
      {/* 1. SUB-TAB SWITCHER & ADMIN ACTION */}
      <div className="academic-subtabs" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('tasks');
              setSubjectFilter('all');
            }}
            className={`academic-subtab-btn ${activeSubTab === 'tasks' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>Daftar Tugas</span>
            <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('exams');
              setSubjectFilter('all');
            }}
            className={`academic-subtab-btn ${activeSubTab === 'exams' ? 'active' : ''}`}
          >
            <GraduationCap size={16} />
            <span>Jadwal Ujian</span>
            <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
              {exams.length}
            </span>
          </button>
        </div>

        {(isAdmin || isEffectiveAdmin) && (
          <div>
            {activeSubTab === 'tasks' ? (
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} />
                <span>Tambah Tugas</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddExamOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} />
                <span>Jadwalkan Ujian</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. TASKS VIEW */}
      {activeSubTab === 'tasks' && (
        !data?.pageAccess?.tasks?.isEnabled && !isEffectiveAdmin ? (
          <MaintenanceScreen
            pageName="Daftar Tugas Kelas"
            reason={data?.pageAccess?.tasks?.reason}
            onBackHome={() => setActiveSubTab('exams')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Admin Bypass Warning */}
            {isEffectiveAdmin && !data?.pageAccess?.tasks?.isEnabled && (
              <div style={{
                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.45)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontSize: '0.8rem',
                color: '#854D0E'
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, color: '#D97706' }} />
                <span>
                  <strong>Bypass Admin:</strong> Modul Tugas sedang dinonaktifkan untuk siswa {data?.pageAccess?.tasks?.reason ? `(Alasan: "${data.pageAccess.tasks.reason}")` : ''}.
                </span>
              </div>
            )}

            {/* Filter & Search Toolbar */}
            <div className="academic-toolbar">
              <div className="academic-toolbar-top">
                <div className="academic-search-box">
                  <Search size={15} className="academic-search-icon" />
                  <input
                    type="text"
                    placeholder="Cari judul tugas, mapel, atau petunjuk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="academic-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="academic-search-clear"
                      title="Hapus pencarian"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  className="form-select"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  style={{ width: 'auto', minWidth: '170px', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                >
                  <option value="all">Semua Mata Pelajaran</option>
                  {taskSubjects.filter(s => s !== 'all').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter Chips */}
              <div className="academic-filter-chips">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`academic-chip-btn ${statusFilter === 'all' ? 'active' : ''}`}
                >
                  <span>Semua</span>
                  <span style={{ opacity: 0.75 }}>({tasks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`academic-chip-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                >
                  <span>Belum Selesai</span>
                  <span style={{ opacity: 0.75 }}>({taskStats.pending})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('urgent')}
                  className={`academic-chip-btn ${statusFilter === 'urgent' ? 'active' : ''}`}
                >
                  <AlertTriangle size={12} color="var(--danger)" />
                  <span>Mendesak</span>
                  <span style={{ opacity: 0.75 }}>({taskStats.urgent})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`academic-chip-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                >
                  <Check size={12} color="var(--success)" />
                  <span>Selesai</span>
                  <span style={{ opacity: 0.75 }}>({taskStats.completed})</span>
                </button>
              </div>
            </div>

            {/* Task Items List */}
            {filteredTasks.length === 0 ? (
              <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  color: 'var(--text-muted)'
                }}>
                  {statusFilter === 'completed' ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}
                </div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tasks.length === 0
                    ? 'Belum ada tugas kelas'
                    : statusFilter === 'pending'
                      ? 'Semua tugas telah selesai!'
                      : 'Tidak ada tugas yang sesuai filter'}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
                  {tasks.length === 0
                    ? 'Belum ada tugas yang ditugaskan oleh guru untuk saat ini.'
                    : statusFilter === 'pending'
                      ? 'Semua tugas aktif sudah kamu tandai beres di perangkat ini 🎉'
                      : 'Coba ubah kata kunci pencarian atau bersihkan filter mata pelajaran.'}
                </p>
                {(searchQuery || subjectFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filteredTasks.map(task => {
                  const isPersonalDone = personalDoneTasks.includes(task.id);
                  const isGloballyDone = Boolean(task.isCompleted);
                  const isDone = isGloballyDone || isPersonalDone;
                  const isExpanded = expandedTaskId === task.id;
                  const dlStatus = getDeadlineStatus(task.deadline);
                  const dateStr = formatDateIndo(task.deadline, { withDay: false, monthFormat: 'short' });

                  return (
                    <div
                      key={task.id}
                      className={`academic-task-card ${isExpanded ? 'expanded' : ''} ${isDone ? 'is-completed' : ''}`}
                    >
                      <div className="academic-task-main">
                        {/* Checkbox Button */}
                        <button
                          type="button"
                          className="clean-todo-checkbox-btn"
                          onClick={(e) => handleToggleTaskCheck(task, e)}
                          aria-label={`Tandai selesai tugas ${task.title}`}
                          title={isGloballyDone ? 'Ditutup oleh Pengurus Kelas' : isDone ? 'Batal tandai selesai' : 'Tandai selesai di perangkat ini'}
                        >
                          <div className={`clean-todo-checkbox-box ${isDone ? 'checked' : ''}`}>
                            {isDone && <Check size={13} strokeWidth={3} />}
                          </div>
                        </button>

                        {/* Title & Metadata */}
                        <div
                          className="academic-task-content"
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        >
                          <div className={`academic-task-title ${isDone ? 'done' : ''}`}>
                            {task.title}
                          </div>

                          <div className="academic-task-meta">
                            <span className="clean-tag-subject">{task.subject}</span>

                            {/* Clean Status: If admin closed globally, show small subtle green tag. If personal, checkbox is already green! */}
                            {isGloballyDone ? (
                              <span className="notion-tag notion-tag-green" style={{ fontSize: '0.7rem' }}>
                                Tugas Selesai
                              </span>
                            ) : !isDone ? (
                              <span className={`clean-tag-deadline ${dlStatus.urgency === 'danger' || dlStatus.urgency === 'warning' ? 'urgent' : ''}`}>
                                <Clock size={11} style={{ marginRight: '0.2rem' }} />
                                <span>{dlStatus.label} • {dateStr}</span>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="academic-task-actions">
                          {(isAdmin || isEffectiveAdmin) && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditTask(task, e)}
                                className="btn btn-ghost btn-xs"
                                style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                                title="Edit tugas"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Hapus tugas ini?')) {
                                    deleteTask(task.id);
                                    showToast('Tugas berhasil dihapus', 'info');
                                  }
                                }}
                                className="btn btn-ghost btn-xs"
                                style={{ padding: '0.3rem', color: 'var(--danger)' }}
                                title="Hapus tugas"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className="btn btn-ghost btn-xs"
                            style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                            title={isExpanded ? 'Tutup rincian' : 'Lihat rincian'}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Progressive Disclosure Body */}
                      {isExpanded && (
                        <div className="academic-task-details">
                          {isGloballyDone && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.78rem',
                              color: 'var(--success)',
                              fontWeight: 500
                            }}>
                              <CheckCircle2 size={14} />
                              <span>Tugas ini telah selesai.</span>
                            </div>
                          )}

                          {task.description ? (
                            <p className="academic-task-desc-text">{task.description}</p>
                          ) : (
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Tidak ada petunjuk tambahan dari guru.
                            </p>
                          )}

                          {task.link && (
                            <a
                              href={task.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="academic-task-link-btn"
                            >
                              <ExternalLink size={13} />
                              <span>Buka Tautan Pengumpulan / GCR</span>
                            </a>
                          )}

                          {(isAdmin || isEffectiveAdmin) && (
                            <div className="academic-detail-actions" style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskCompleted(task.id);
                                  showToast(
                                    task.isCompleted ? 'Status tuntas kelas dibatalkan' : 'Tugas ditandai tuntas untuk seluruh kelas',
                                    'success'
                                  );
                                }}
                                className="btn btn-secondary btn-xs"
                                style={{ color: task.isCompleted ? 'var(--text-muted)' : 'var(--success)' }}
                              >
                                {task.isCompleted ? 'Batal Tuntas Kelas' : 'Tandai Tuntas Seluruh Kelas'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}

      {/* 4. EXAMS VIEW */}
      {activeSubTab === 'exams' && (
        !data?.pageAccess?.exams?.isEnabled && !isEffectiveAdmin ? (
          <MaintenanceScreen
            pageName="Jadwal Ujian"
            reason={data?.pageAccess?.exams?.reason}
            onBackHome={() => setActiveSubTab('tasks')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Admin Bypass Warning */}
            {isEffectiveAdmin && !data?.pageAccess?.exams?.isEnabled && (
              <div style={{
                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.45)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontSize: '0.8rem',
                color: '#854D0E'
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, color: '#D97706' }} />
                <span>
                  <strong>Bypass Admin:</strong> Modul Ujian sedang dinonaktifkan untuk siswa {data?.pageAccess?.exams?.reason ? `(Alasan: "${data.pageAccess.exams.reason}")` : ''}.
                </span>
              </div>
            )}

            {/* Exam Toolbar */}
            <div className="academic-toolbar">
              <div className="academic-toolbar-top">
                <div className="academic-search-box">
                  <Search size={15} className="academic-search-icon" />
                  <input
                    type="text"
                    placeholder="Cari ujian, mata pelajaran, atau kisi-kisi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="academic-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="academic-search-clear"
                      title="Hapus pencarian"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  className="form-select"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  style={{ width: 'auto', minWidth: '170px', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                >
                  <option value="all">Semua Mata Pelajaran</option>
                  {examSubjects.filter(s => s !== 'all').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Items List */}
            {filteredExams.length === 0 ? (
              <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  color: 'var(--text-muted)'
                }}>
                  <GraduationCap size={22} />
                </div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {exams.length === 0 ? 'Belum ada agenda ujian' : 'Tidak ada ujian yang sesuai filter'}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
                  {exams.length === 0
                    ? 'Tidak ada agenda PTS, PAS, atau kuis yang dijadwalkan saat ini.'
                    : 'Coba ubah kata kunci pencarian atau pilih semua mata pelajaran.'}
                </p>
                {(searchQuery || subjectFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filteredExams.map(exam => {
                  const dObj = new Date(exam.examDate);
                  const isValidDate = !isNaN(dObj.getTime());
                  const dayNum = isValidDate ? dObj.getDate() : '-';
                  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                  const monthShort = isValidDate ? monthsShort[dObj.getMonth()] : '-';
                  const dateFormatted = formatDateTimeIndo(exam.examDate);
                  const isExpanded = expandedExamId === exam.id;
                  const dlStatus = getDeadlineStatus(exam.examDate);

                  return (
                    <div
                      key={exam.id}
                      className={`academic-exam-card ${isExpanded ? 'expanded' : ''}`}
                    >
                      <div className="academic-exam-main">
                        {/* Date Block */}
                        <div className="academic-exam-datebox">
                          <span className="academic-exam-datebox-month">{monthShort}</span>
                          <span className="academic-exam-datebox-day">{dayNum}</span>
                        </div>

                        {/* Title, Subject, Urgency */}
                        <div
                          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                          onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                        >
                          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                            {exam.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                            <span className="clean-tag-subject">{exam.subject}</span>
                            <span className={`clean-tag-deadline ${dlStatus.urgency === 'danger' || dlStatus.urgency === 'warning' ? 'urgent' : ''}`}>
                              <Calendar size={11} style={{ marginRight: '0.2rem' }} />
                              <span>{dlStatus.label} • {dateFormatted}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {(isAdmin || isEffectiveAdmin) && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditExam(exam, e)}
                                className="btn btn-ghost btn-xs"
                                style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                                title="Edit jadwal ujian"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Hapus jadwal ujian ini?')) {
                                    deleteExam(exam.id);
                                    showToast('Jadwal ujian berhasil dihapus', 'info');
                                  }
                                }}
                                className="btn btn-ghost btn-xs"
                                style={{ padding: '0.3rem', color: 'var(--danger)' }}
                                title="Hapus jadwal ujian"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                            className="btn btn-ghost btn-xs"
                            style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                            title={isExpanded ? 'Tutup kisi-kisi' : 'Lihat kisi-kisi'}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Kisi-kisi */}
                      {isExpanded && (
                        <div className="academic-task-details">
                          <div style={{
                            padding: '0.75rem 0.95rem',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            fontSize: '0.84rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6
                          }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              Kisi-kisi & Cakupan Materi:
                            </div>
                            {exam.scope ? (
                              <div style={{ whiteSpace: 'pre-line' }}>{exam.scope}</div>
                            ) : (
                              <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                Belum ada kisi-kisi atau instruksi khusus dari guru mata pelajaran.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
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
              type="date"
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

      {/* MODAL: EDIT TASK */}
      <Modal isOpen={Boolean(editingTask)} onClose={() => setEditingTask(null)} title="Edit Rincian Tugas">
        <form onSubmit={handleSaveEditTask}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              value={editTaskSubject}
              onChange={(e) => setEditTaskSubject(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Judul Tugas</label>
            <input
              type="text"
              className="form-input"
              value={editTaskTitle}
              onChange={(e) => setEditTaskTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tenggat Waktu (Deadline)</label>
            <input
              type="date"
              className="form-input"
              value={editTaskDeadline}
              onChange={(e) => setEditTaskDeadline(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi / Format Pengumpulan (Opsional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={editTaskDesc}
              onChange={(e) => setEditTaskDesc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Link Pengumpulan / GCR (Opsional)</label>
            <input
              type="url"
              className="form-input"
              value={editTaskLink}
              onChange={(e) => setEditTaskLink(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setEditingTask(null)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Perubahan
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
            <label className="form-label">Kisi-kisi & Cakupan Materi (Opsional)</label>
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

      {/* MODAL: EDIT EXAM */}
      <Modal isOpen={Boolean(editingExam)} onClose={() => setEditingExam(null)} title="Edit Jadwal Ujian">
        <form onSubmit={handleSaveEditExam}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              value={editExamSubject}
              onChange={(e) => setEditExamSubject(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Jenis / Judul Ujian</label>
            <input
              type="text"
              className="form-input"
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
            <label className="form-label">Kisi-kisi & Cakupan Materi (Opsional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={editExamScope}
              onChange={(e) => setEditExamScope(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setEditingExam(null)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
