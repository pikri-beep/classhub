import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Edit3,
  Calendar,
  Copy,
  RotateCcw,
  MessageCircle
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
  ConfirmDialog
} from '../../../components/admin';
import { formatCompactDateTime, getDeadlineStatus } from '../../../lib/dateUtils';
import {
  formatForDatetimeLocal,
  handleCopyLink,
  handleCopyTaskInfo,
  handleSendTaskToWA
} from '../utils/adminHelpers';

export default function TasksTab({
  isAddTaskOpen: propIsAddTaskOpen,
  setIsAddTaskOpen: propSetIsAddTaskOpen,
  taskToEdit,
  setTaskToEdit
}) {
  const { data, addTask, updateTask, deleteTask, toggleTaskCompleted } = useStore();
  const { showToast } = useToast();

  const tasks = data.tasks || [];

  // Search & filter
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');

  // Modal controls
  const [internalIsAddTaskOpen, setInternalIsAddTaskOpen] = useState(false);
  const isAddTaskOpen = propIsAddTaskOpen !== undefined ? propIsAddTaskOpen : internalIsAddTaskOpen;
  const setIsAddTaskOpen = propSetIsAddTaskOpen !== undefined ? propSetIsAddTaskOpen : setInternalIsAddTaskOpen;

  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Form states - Create Task
  const [taskSubject, setTaskSubject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLink, setTaskLink] = useState('');

  // Form states - Edit Task
  const [editTaskSubject, setEditTaskSubject] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskLink, setEditTaskLink] = useState('');

  // If external taskToEdit changes
  React.useEffect(() => {
    if (taskToEdit) {
      handleOpenEditTask(taskToEdit);
      if (setTaskToEdit) setTaskToEdit(null);
    }
  }, [taskToEdit]);

  const activeTasksCount = useMemo(() => tasks.filter(t => !t.isCompleted).length, [tasks]);
  const completedTasksCount = useMemo(() => tasks.filter(t => t.isCompleted).length, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = taskSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        task.title.toLowerCase().includes(q) ||
        task.subject.toLowerCase().includes(q) ||
        (task.description || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (taskFilterStatus === 'all') return true;
      if (taskFilterStatus === 'active') return !task.isCompleted;
      if (taskFilterStatus === 'completed') return Boolean(task.isCompleted);
      return true;
    });
  }, [tasks, taskSearchQuery, taskFilterStatus]);

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
    showToast('Tugas baru berhasil dipublikasikan!', 'success');
  };

  const handleOpenEditTask = (task) => {
    setSelectedTaskForEdit(task);
    setEditTaskSubject(task.subject || '');
    setEditTaskTitle(task.title || '');
    setEditTaskDeadline(formatForDatetimeLocal(task.deadline));
    setEditTaskDesc(task.description || '');
    setEditTaskLink(task.link || '');
    setIsEditTaskOpen(true);
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (!selectedTaskForEdit) return;
    updateTask(selectedTaskForEdit.id, {
      subject: editTaskSubject.trim(),
      title: editTaskTitle.trim(),
      deadline: editTaskDeadline,
      description: editTaskDesc.trim(),
      link: editTaskLink.trim()
    });
    setIsEditTaskOpen(false);
    showToast(`Tugas "${editTaskTitle.trim()}" berhasil diperbarui!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1.2rem'
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Manajemen Tugas Kelas
          </h2>
          <button
            type="button"
            onClick={() => setIsAddTaskOpen(true)}
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
            <span>Tambah Tugas</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap'
          }}
        >
          <SearchInput
            value={taskSearchQuery}
            onChange={(e) => setTaskSearchQuery(e.target.value)}
            onClear={() => setTaskSearchQuery('')}
            placeholder="Cari mata pelajaran, judul tugas, deskripsi..."
            style={{ maxWidth: '320px', height: '36px' }}
          />
          <FilterPills
            options={[
              { value: 'all', label: `Semua (${tasks.length})` },
              { value: 'active', label: `Aktif (${activeTasksCount})` },
              { value: 'completed', label: `Selesai (${completedTasksCount})` }
            ]}
            activeValue={taskFilterStatus}
            onChange={setTaskFilterStatus}
          />
        </div>

        {/* Task Flat Row List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredTasks.length === 0 ? (
            <EmptyState
              title={taskSearchQuery || taskFilterStatus !== 'all' ? 'Tugas Tidak Ditemukan' : 'Belum Ada Tugas'}
              actionLabel="+ Tambah Tugas Baru"
              onAction={() => setIsAddTaskOpen(true)}
            />
          ) : (
            filteredTasks.map((task, idx) => {
              const isCompleted = Boolean(task.isCompleted);
              const deadlineStatus = getDeadlineStatus(task.deadline);

              return (
                <div
                  key={task.id}
                  style={{
                    padding: '0.95rem 0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    borderBottom: idx === filteredTasks.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                    opacity: isCompleted ? 0.75 : 1,
                    transition: 'background-color var(--transition-fast)'
                  }}
                >
                  {/* Checkbox Selesai & Two-tier Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        toggleTaskCompleted(task.id);
                        if (!isCompleted) {
                          showToast(`Tugas "${task.title}" ditandai selesai!`, 'success');
                        } else {
                          showToast(`Status tugas "${task.title}" aktif kembali.`, 'info');
                        }
                      }}
                      style={{
                        marginTop: '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isCompleted ? '1.5px solid var(--tag-green-text)' : '1.5px solid var(--border-focus)',
                        backgroundColor: isCompleted ? 'var(--tag-green-bg)' : 'transparent',
                        color: isCompleted ? 'var(--tag-green-text)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all var(--transition-fast)'
                      }}
                      title={isCompleted ? 'Batalkan status selesai' : 'Tandai selesai'}
                    >
                      <Check size={12} strokeWidth={2.5} />
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        margin: '0 0 0.25rem 0',
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                        lineHeight: 1.3
                      }}>
                        {task.title}
                      </h3>

                      {/* Two-Tier Metadata Bar */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        flexWrap: 'wrap',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <span style={{ fontWeight: 600 }}>
                          {task.subject}
                        </span>

                        {task.deadline && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            {formatCompactDateTime(task.deadline)}
                          </span>
                        )}

                        {isCompleted ? (
                          <StatusBadge variant="success" size="sm">
                            Selesai
                          </StatusBadge>
                        ) : (
                          deadlineStatus.urgency !== 'neutral' && (
                            <StatusBadge variant={deadlineStatus.urgency} size="sm" dot>
                              {deadlineStatus.label}
                            </StatusBadge>
                          )
                        )}

                        {task.link && (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.76rem',
                              color: 'var(--primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontWeight: 600
                            }}
                          >
                            Link Materi ↗
                          </a>
                        )}
                      </div>

                      {task.description && (
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          margin: '0.35rem 0 0 0',
                          lineHeight: 1.45,
                          wordBreak: 'break-word'
                        }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ActionMenu Sentris */}
                  <div style={{ flexShrink: 0 }}>
                    <ActionMenu
                      align="right"
                      items={[
                        {
                          label: 'Bagikan ke WhatsApp',
                          icon: <MessageCircle size={14} color="#16A34A" />,
                          onClick: () => handleSendTaskToWA(task, data?.classInfo?.name, showToast)
                        },
                        {
                          label: task.link ? 'Salin Link Tugas' : 'Salin Info Tugas',
                          icon: <Copy size={14} />,
                          onClick: () => (task.link ? handleCopyLink(task.link, showToast) : handleCopyTaskInfo(task, showToast))
                        },
                        {
                          label: 'Edit Tugas',
                          icon: <Edit3 size={14} />,
                          onClick: () => handleOpenEditTask(task)
                        },
                        {
                          label: isCompleted ? 'Buka Kembali Tugas' : 'Tandai Selesai',
                          icon: isCompleted ? <RotateCcw size={14} /> : <Check size={14} />,
                          onClick: () => {
                            toggleTaskCompleted(task.id);
                            if (!isCompleted) {
                              showToast(`Tugas "${task.title}" selesai!`, 'success');
                            } else {
                              showToast(`Tugas "${task.title}" aktif kembali.`, 'info');
                            }
                          }
                        },
                        {
                          label: 'Hapus Tugas',
                          icon: <Trash2 size={14} />,
                          variant: 'danger',
                          onClick: () => setTaskToDelete(task)
                        }
                      ]}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: BUAT TUGAS BARU */}
      <Modal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} title="Buat Tugas Baru">
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Pemrograman Web (PPLG)"
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
              placeholder="Contoh: Pembuatan Rest API Login"
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
            <label className="form-label">Deskripsi & Instruksi</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Jelaskan instruksi pengumpulan tugas..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Link Classroom / Materi (Opsional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://classroom.google.com/..."
              value={taskLink}
              onChange={(e) => setTaskLink(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Publikasikan Tugas
          </button>
        </form>
      </Modal>

      {/* MODAL: EDIT TUGAS */}
      <Modal isOpen={isEditTaskOpen} onClose={() => setIsEditTaskOpen(false)} title="Edit Tugas">
        <form onSubmit={handleUpdateTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Pemrograman Web (PPLG)"
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
              placeholder="Contoh: Pembuatan Rest API Login"
              value={editTaskTitle}
              onChange={(e) => setEditTaskTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tenggat Waktu (Deadline)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={editTaskDeadline}
              onChange={(e) => setEditTaskDeadline(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi & Instruksi</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Jelaskan instruksi pengumpulan tugas..."
              value={editTaskDesc}
              onChange={(e) => setEditTaskDesc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Link Classroom / Materi (Opsional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://classroom.google.com/..."
              value={editTaskLink}
              onChange={(e) => setEditTaskLink(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditTaskOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DIALOG: HAPUS TUGAS */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            showToast(`Tugas "${taskToDelete.title}" berhasil dihapus`, 'info');
            setTaskToDelete(null);
          }
        }}
        title="Hapus Tugas Kelas"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToDelete?.title}" (${taskToDelete?.subject})? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Tugas"
        variant="danger"
      />
    </div>
  );
}
