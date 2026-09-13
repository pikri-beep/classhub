import React, { useState } from 'react';
import { Check, Plus, Trash2, ExternalLink, Calendar, BookOpen, GraduationCap, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import WhatsAppShareModal from '../components/WhatsAppShareModal';

export default function AcademicView() {
  const { currentUser, isAdmin } = useAuth();
  const { data, addTask, deleteTask, updateTaskStatus, addExam, deleteExam } = useStore();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('tasks');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Modals
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

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
  const [examRoom, setExamRoom] = useState('');
  const [examScope, setExamScope] = useState('');

  const tasks = data.tasks || [];
  const exams = data.exams || [];
  const totalStudents = (data.members || []).length;
  const subjects = ['all', ...new Set(tasks.map(t => t.subject))];

  const filteredTasks = tasks.filter(task => {
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;

    const isDone = (task.completedStudentIds || []).includes(currentUser.id);
    const isTodo = !isDone;

    if (statusFilter === 'todo' && !isTodo) return false;
    if (statusFilter === 'done' && !isDone) return false;

    return true;
  });

  const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const handleToggleTaskDone = (task) => {
    const isDone = (task.completedStudentIds || []).includes(currentUser.id);
    const next = isDone ? 'todo' : 'done';

    updateTaskStatus(task.id, currentUser.id, next);
    if (!isDone) {
      showToast('Tugas diselesaikan! 🎉', 'success');
    } else {
      showToast('Tugas ditandai belum selesai', 'info');
    }
  };

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
      room: examRoom.trim(),
      scope: examScope.trim()
    });
    setIsAddExamOpen(false);
    setExamSubject('');
    setExamTitle('');
    setExamDate('');
    setExamRoom('');
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {activeSubTab === 'tasks' && isAdmin && (
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem', color: '#16A34A', fontWeight: 600 }}
              title="Salin dan bagikan rekap tugas aktif ke WhatsApp (Khusus Pengurus)"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Brief</span>
            </button>
          )}

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
            <div className="clean-filter-chips">
              <button
                onClick={() => setStatusFilter('all')}
                className={`clean-filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
              >
                Semua ({tasks.length})
              </button>
              <button
                onClick={() => setStatusFilter('todo')}
                className={`clean-filter-chip ${statusFilter === 'todo' ? 'active' : ''}`}
              >
                Belum Selesai ({tasks.filter(t => !(t.completedStudentIds || []).includes(currentUser.id)).length})
              </button>
              <button
                onClick={() => setStatusFilter('done')}
                className={`clean-filter-chip ${statusFilter === 'done' ? 'active' : ''}`}
              >
                Selesai ({tasks.filter(t => (t.completedStudentIds || []).includes(currentUser.id)).length})
              </button>
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

          {/* Tasks Database Table (Desktop) & Cards (Mobile) */}
          {filteredTasks.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Tidak ada tugas ditemukan</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Semua tugas sesuai kriteria filter telah selesai atau belum ditugaskan.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Database Table */}
              <div className="notion-table-wrapper desktop-only-table">
                <table className="notion-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>✓</th>
                      <th>Tugas & Deskripsi</th>
                      <th style={{ width: '150px' }}>Mata Pelajaran</th>
                      <th style={{ width: '130px' }}>Tenggat</th>
                      <th style={{ width: '140px' }}>Status Saya</th>
                      <th style={{ width: '110px' }}>Progres Kelas</th>
                      {isAdmin && <th style={{ width: '50px', textAlign: 'center' }}>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => {
                      const isDone = (task.completedStudentIds || []).includes(currentUser.id);
                      const doneCount = (task.completedStudentIds || []).length;
                      const donePercent = Math.round((doneCount / totalStudents) * 100);

                      const dObj = new Date(task.deadline);
                      const dateStr = !isNaN(dObj) ? `${dObj.getDate()} ${monthsMap[dObj.getMonth()]}` : task.deadline;
                      const isNear = !isNaN(dObj) && (dObj - new Date()) > 0 && (dObj - new Date()) < 86400000 * 3;

                      return (
                        <tr key={task.id}>
                          {/* Checkbox */}
                          <td style={{ textAlign: 'center' }}>
                            <div
                              className="notion-todo-checkbox"
                              onClick={() => handleToggleTaskDone(task)}
                              style={{
                                margin: '0 auto',
                                backgroundColor: isDone ? 'var(--primary)' : 'var(--bg-surface)',
                                borderColor: isDone ? 'var(--primary)' : 'var(--border-focus)',
                                color: '#fff',
                                cursor: 'pointer'
                              }}
                              title="Klik untuk menandai selesai/belum"
                            >
                              {isDone && <Check size={12} strokeWidth={3} />}
                            </div>
                          </td>

                          {/* Title & Desc */}
                          <td>
                            <div style={{
                              fontWeight: 600,
                              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: isDone ? 'line-through' : 'none'
                            }}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                                {task.description}
                              </div>
                            )}
                            {task.link && (
                              <a
                                href={task.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: '0.78rem',
                                  color: 'var(--primary)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  marginTop: '0.25rem'
                                }}
                              >
                                <ExternalLink size={12} />
                                <span>Tautan Pengumpulan</span>
                              </a>
                            )}
                          </td>

                          {/* Subject */}
                          <td>
                            <span className="notion-tag notion-tag-gray">{task.subject}</span>
                          </td>

                          {/* Deadline */}
                          <td>
                            <span style={{
                              color: isNear ? 'var(--danger)' : 'var(--text-secondary)',
                              fontWeight: isNear ? 700 : 'normal'
                            }}>
                              {dateStr}
                            </span>
                          </td>

                          {/* Status Button (Binary) */}
                          <td>
                            <button
                              onClick={() => handleToggleTaskDone(task)}
                              className={`notion-tag ${isDone ? 'notion-tag-green' : 'notion-tag-gray'}`}
                              style={{ border: 'none', cursor: 'pointer' }}
                              title="Klik untuk mengganti status"
                            >
                              {isDone ? '✓ Selesai' : '○ Belum'}
                            </button>
                          </td>

                          {/* Class Progress */}
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {doneCount}/{totalStudents} ({donePercent}%)
                          </td>

                          {/* Admin Action */}
                          {isAdmin && (
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  if (confirm('Hapus tugas ini?')) {
                                    deleteTask(task.id);
                                    showToast('Tugas berhasil dihapus', 'info');
                                  }
                                }}
                                className="btn-ghost"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                                title="Hapus Tugas"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (Clean with Progressive Disclosure Accordion) */}
              <div className="mobile-only-cards" style={{ marginBottom: '1.5rem' }}>
                {filteredTasks.map(task => {
                  const isDone = (task.completedStudentIds || []).includes(currentUser.id);
                  const doneCount = (task.completedStudentIds || []).length;
                  const donePercent = Math.round((doneCount / totalStudents) * 100);

                  const dObj = new Date(task.deadline);
                  const dateStr = !isNaN(dObj) ? `${dObj.getDate()} ${monthsMap[dObj.getMonth()]}` : task.deadline;
                  const isNear = !isNaN(dObj) && (dObj - new Date()) > 0 && (dObj - new Date()) < 86400000 * 3;
                  const isExpanded = expandedTaskId === task.id;
                  const hasDetails = Boolean(task.description || task.link);

                  return (
                    <div key={task.id} className={`clean-task-card ${isDone ? 'completed' : ''}`}>
                      <div className="clean-task-main">
                        {/* Checkbox */}
                        <div
                          className="clean-todo-checkbox"
                          onClick={() => handleToggleTaskDone(task)}
                          title="Tandai selesai"
                        >
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </div>

                        {/* Title & Tags */}
                        <div
                          style={{ flex: 1, minWidth: 0, cursor: hasDetails ? 'pointer' : 'default' }}
                          onClick={() => hasDetails && setExpandedTaskId(isExpanded ? null : task.id)}
                        >
                          <div className={`clean-task-title ${isDone ? 'completed' : ''}`}>
                            {task.title}
                          </div>
                          <div className="clean-task-tags">
                            <span className="clean-tag-subject">{task.subject}</span>
                            <span className={`clean-tag-deadline ${isNear ? 'urgent' : ''}`}>
                              {dateStr}
                            </span>
                          </div>
                        </div>

                        {/* Quick actions (Expand toggle & delete) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {hasDetails && (
                            <button
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
                          <div className="clean-task-progress-note">
                            Progres kelas: {doneCount}/{totalStudents} ({donePercent}% siswa sudah selesai)
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. EXAMS CONTENT */}
      {activeSubTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {exams.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, margin: 0 }}>Belum ada jadwal ujian</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Tidak ada agenda PTS, PAS, atau kuis yang akan datang.
              </p>
            </div>
          ) : (
            exams.map(exam => {
              const dateObj = new Date(exam.examDate);
              const dateFormatted = !isNaN(dateObj)
                ? `${dateObj.getDate()} ${monthsMap[dateObj.getMonth()]} ${dateObj.getFullYear()} • ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} WIB`
                : exam.examDate;

              const diffMs = !isNaN(dateObj) ? dateObj - new Date() : 0;
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

              let tagClass = 'notion-tag-blue';
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
                tagClass = 'notion-tag-blue';
              }

              return (
                <div key={exam.id} className="card" style={{ padding: '1.25rem 1.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span className="notion-tag notion-tag-gray">{exam.subject}</span>
                        <span className={`notion-tag ${tagClass}`} style={{ fontWeight: 700 }}>{urgencyText}</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                        {exam.title}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <span>📅 {dateFormatted}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('Hapus jadwal ujian ini?')) {
                            deleteExam(exam.id);
                            showToast('Jadwal ujian dihapus', 'info');
                          }
                        }}
                        className="btn-ghost"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                        title="Hapus Ujian"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {exam.scope && (
                    <div style={{
                      marginTop: '0.75rem',
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
            <label className="form-label">Ruang Ujian (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Lab Komputer 3"
              value={examRoom}
              onChange={(e) => setExamRoom(e.target.value)}
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

      {/* WHATSAPP RECAP MODAL */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        tasks={tasks}
        classInfo={data.classInfo}
        currentUser={currentUser}
      />
    </div>
  );
}
