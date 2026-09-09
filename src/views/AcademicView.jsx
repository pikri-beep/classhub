import React, { useState } from 'react';
import { Check, Plus, Trash2, ExternalLink, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function AcademicView() {
  const { currentUser, isAdmin } = useAuth();
  const { data, addTask, deleteTask, updateTaskStatus, addExam, deleteExam } = useStore();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('tasks');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

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
  const [examRoom, setExamRoom] = useState('');
  const [examScope, setExamScope] = useState('');

  const tasks = data.tasks || [];
  const exams = data.exams || [];
  const totalStudents = (data.members || []).length;
  const subjects = ['all', ...new Set(tasks.map(t => t.subject))];

  const filteredTasks = tasks.filter(task => {
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;

    const isDone = (task.completedStudentIds || []).includes(currentUser.id);
    const isDoing = (task.inProgressStudentIds || []).includes(currentUser.id);
    const isTodo = !isDone && !isDoing;

    if (statusFilter === 'todo' && !isTodo) return false;
    if (statusFilter === 'doing' && !isDoing) return false;
    if (statusFilter === 'done' && !isDone) return false;

    return true;
  });

  const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const handleCycleStatus = (task) => {
    const isDone = (task.completedStudentIds || []).includes(currentUser.id);
    const isDoing = (task.inProgressStudentIds || []).includes(currentUser.id);

    let next = 'doing';
    if (isDoing) next = 'done';
    else if (isDone) next = 'todo';

    updateTaskStatus(task.id, currentUser.id, next);
    const label = next === 'done' ? 'Selesai 🎉' : (next === 'doing' ? 'Sedang Dikerjakan ⋯' : 'Belum Selesai ○');
    showToast(`Status tugas diubah: ${label}`, 'info');
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
      {/* 1. NOTION PAGE HEADER */}
      <div className="notion-header">
        <span className="notion-header-icon">📚</span>
        <h1 className="notion-header-title">Akademik</h1>
        <p className="notion-header-desc">
          Daftar tugas terstruktur & jadwal evaluasi ujian kelas {data.classInfo.name}
        </p>
      </div>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStatusFilter('all')}
                className={`btn ${statusFilter === 'all' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('todo')}
                className={`btn ${statusFilter === 'todo' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Belum Selesai
              </button>
              <button
                onClick={() => setStatusFilter('doing')}
                className={`btn ${statusFilter === 'doing' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Sedang Dikerjakan
              </button>
              <button
                onClick={() => setStatusFilter('done')}
                className={`btn ${statusFilter === 'done' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Selesai
              </button>
            </div>

            <select
              className="form-select"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '180px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Tasks Database Table */}
          {filteredTasks.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Tidak ada tugas ditemukan</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Semua tugas sesuai kriteria filter telah selesai atau belum ditugaskan.
              </p>
            </div>
          ) : (
            <div className="notion-table-wrapper">
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
                    const isDoing = (task.inProgressStudentIds || []).includes(currentUser.id);

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
                            onClick={() => handleCycleStatus(task)}
                            style={{
                              margin: '0 auto',
                              backgroundColor: isDone ? 'var(--primary)' : 'var(--bg-surface)',
                              borderColor: isDone ? 'var(--primary)' : 'var(--border-focus)',
                              color: '#fff'
                            }}
                            title="Klik untuk mengubah status"
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

                        {/* Status Button */}
                        <td>
                          <button
                            onClick={() => handleCycleStatus(task)}
                            className={`notion-tag ${isDone ? 'notion-tag-green' : isDoing ? 'notion-tag-blue' : 'notion-tag-gray'}`}
                            style={{ border: 'none', cursor: 'pointer' }}
                            title="Klik untuk mengganti status"
                          >
                            {isDone ? '✓ Selesai' : isDoing ? '⋯ Dikerjakan' : '○ Belum'}
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
                urgencyText = 'Hari Ini / Selesai';
                tagClass = 'notion-tag-gray';
              } else if (diffDays <= 3) {
                urgencyText = `${diffDays} hari lagi (Mendesak)`;
                tagClass = 'notion-tag-red';
              } else if (diffDays <= 7) {
                urgencyText = `${diffDays} hari lagi`;
                tagClass = 'notion-tag-orange';
              }

              return (
                <div key={exam.id} className="card" style={{ padding: '1.25rem 1.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span className="notion-tag notion-tag-gray">{exam.subject}</span>
                        <span className={`notion-tag ${tagClass}`}>{urgencyText}</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                        {exam.title}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <span>📅 {dateFormatted}</span>
                        <span>📍 {exam.room || 'Ruang Kelas XII PPLG 1'}</span>
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
    </div>
  );
}
