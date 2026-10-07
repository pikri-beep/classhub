import React, { useMemo } from 'react';
import {
  Users,
  Wallet,
  BookOpen,
  Plus,
  MessageCircle,
  ArrowRight,
  Check,
  Calendar,
  Copy,
  Edit3,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import {
  MetricCard,
  EmptyState,
  StatusBadge,
  ActionMenu
} from '../../../components/admin';
import { formatCompactDateTime, formatDateIndo, getDeadlineStatus } from '../../../lib/dateUtils';
import { getSubjectTagClass } from '../../../lib/subjectColors';
import {
  handleCopyLink,
  handleCopyTaskInfo,
  handleSendTaskToWA,
  handleCopyExamInfo,
  handleSendExamToWA
} from '../utils/adminHelpers';

export default function OverviewTab({
  setActiveTab,
  onOpenAddTask,
  onOpenAddExam,
  onOpenWhatsApp,
  onEditTask,
  onEditExam
}) {
  const { data, toggleTaskCompleted, getTotalCashBalance } = useStore();
  const { showToast } = useToast();

  const tasks = data.tasks || [];
  const exams = data.exams || [];
  const members = data.members || [];
  const totalMembers = members.length;
  const cashStats = (typeof getTotalCashBalance === 'function' ? getTotalCashBalance() : null) || {
    totalIn: 0,
    totalOut: 0,
    balance: data?.cash?.balance ?? 0
  };
  const activeTasksCount = tasks.filter(t => !t.isCompleted).length;

  const upcomingExams = useMemo(() => {
    return [...exams].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  }, [exams]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // 1. Tugas belum selesai di atas, tugas selesai otomatis turun ke bawah
      if (Boolean(a.isCompleted) !== Boolean(b.isCompleted)) {
        return a.isCompleted ? 1 : -1;
      }
      // 2. Tenggat terdekat didahulukan
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      return 0;
    });
  }, [tasks]);

  const handleEditTaskInternal = (task) => {
    if (onEditTask) {
      onEditTask(task);
    } else {
      setActiveTab('tasks');
    }
  };

  const handleEditExamInternal = (exam) => {
    if (onEditExam) {
      onEditExam(exam);
    } else {
      setActiveTab('exams');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <h1 style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          Dashboard {data?.classInfo?.name || 'XI PPLG'}
        </h1>

        {/* 2 Primary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onOpenAddTask}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.transform = 'none'; }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Buat Tugas</span>
          </button>

          <button
            type="button"
            onClick={onOpenWhatsApp}
            style={{
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
              border: '1px solid var(--border-subtle)',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-soft, rgba(37, 211, 102, 0.08))'; }}
          >
            <MessageCircle size={15} color="var(--primary)" />
            <span>WhatsApp Brief</span>
          </button>
        </div>
      </div>

      {/* Kartu Statistik KPI (Minimalist Soft Surface) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem'
      }}>
        <MetricCard
          icon={Users}
          label="Total Siswa"
          value={totalMembers}
          accentColor="var(--primary)"
          onClick={() => setActiveTab('members')}
        />
        <MetricCard
          icon={Wallet}
          label="Saldo Kas"
          value={`Rp ${Number(cashStats.balance).toLocaleString('id-ID')}`}
          accentColor="var(--tag-green-text, #16A34A)"
          onClick={() => setActiveTab('cash')}
        />
        <MetricCard
          icon={BookOpen}
          label="Tugas Aktif"
          value={activeTasksCount}
          accentColor="var(--primary)"
          onClick={() => setActiveTab('tasks')}
        />
        <MetricCard
          icon={GraduationCap}
          label="Ujian Mendatang"
          value={upcomingExams.length}
          accentColor="var(--warning, #d97706)"
          onClick={() => setActiveTab('exams')}
        />
      </div>

      {/* 2-Column Responsive Layout: Tugas Mendesak & Agenda Ujian */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
        gap: '1.25rem',
        alignItems: 'start'
      }}>

      {/* Daftar Tugas Ringkas (Flat Minimalist Row List) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.4rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Daftar Tugas
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              {activeTasksCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: 'var(--radius-xs)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <span>Kelola Semua</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {sortedTasks.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada tugas aktif"
            actionLabel="Buat Tugas"
            onAction={onOpenAddTask}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sortedTasks.map((task, idx) => {
              const deadlineInfo = getDeadlineStatus(task.deadline);
              const isCompleted = Boolean(task.isCompleted);

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 0.5rem',
                    borderBottom: idx === sortedTasks.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                    gap: '0.85rem',
                    transition: 'background-color var(--transition-fast)'
                  }}
                >
                  {/* Checkbox Selesai & Info Utama */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        toggleTaskCompleted(task.id);
                        if (!isCompleted) {
                          showToast(`Tugas "${task.title}" selesai!`, 'success');
                        } else {
                          showToast(`Tugas "${task.title}" aktif kembali.`, 'info');
                        }
                      }}
                      style={{
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

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        onClick={() => handleEditTaskInternal(task)}
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          wordBreak: 'break-word',
                          lineHeight: 1.3,
                          cursor: 'pointer'
                        }}
                        title="Klik untuk mengedit tugas"
                      >
                        {task.title}
                      </div>

                      {/* Two-tier metadata */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginTop: '0.25rem',
                        flexWrap: 'wrap',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {task.subject}
                        </span>
                        {task.deadline && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            {formatCompactDateTime(task.deadline)}
                          </span>
                        )}
                        {!isCompleted && deadlineInfo.urgency === 'danger' && (
                          <StatusBadge variant="danger" size="sm" dot>
                            {deadlineInfo.label}
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ActionMenu (3-dot) */}
                  <div style={{ flexShrink: 0 }}>
                    <ActionMenu
                      align="right"
                      items={[
                        {
                          label: 'Kirim ke WhatsApp',
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
                          onClick: () => handleEditTaskInternal(task)
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
                        }
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        {/* Kolom Kanan: Agenda Ujian Mendatang */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.4rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Agenda Ujian & Ulangan
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                {upcomingExams.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {onOpenAddExam && (
                <button
                  type="button"
                  onClick={onOpenAddExam}
                  className="btn btn-secondary btn-xs"
                  style={{ gap: '0.25rem', fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                  title="Tambah Jadwal Ujian Baru"
                >
                  <Plus size={12} />
                  <span>Tambah</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('exams')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem',
                  borderRadius: 'var(--radius-xs)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <span>Kelola Semua</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {upcomingExams.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Belum ada jadwal ujian"
              description="Tidak ada agenda ulangan atau ujian terdekat."
              actionLabel="Tambah Ujian"
              onAction={() => setActiveTab('exams')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcomingExams.slice(0, 5).map((exam, idx) => {
                const tagClass = getSubjectTagClass(exam.subject);
                return (
                  <div
                    key={exam.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '0.85rem 0.5rem',
                      borderBottom: idx === Math.min(upcomingExams.length, 5) - 1 ? 'none' : '1px solid var(--border-subtle)',
                      gap: '0.75rem',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <span className={`notion-tag ${tagClass}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {exam.subject}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          {formatDateIndo(exam.examDate)}
                        </span>
                      </div>

                      <div
                        onClick={() => handleEditExamInternal(exam)}
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          lineHeight: 1.35,
                          wordBreak: 'break-word',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk mengedit jadwal ujian"
                      >
                        {exam.title}
                      </div>

                      {exam.scope && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Kisi-kisi: {exam.scope}
                        </div>
                      )}
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <ActionMenu
                        align="right"
                        items={[
                          {
                            label: 'Kirim ke WhatsApp',
                            icon: <MessageCircle size={14} color="#16A34A" />,
                            onClick: () => handleSendExamToWA(exam, data?.classInfo?.name, showToast)
                          },
                          {
                            label: 'Salin Info Ujian',
                            icon: <Copy size={14} />,
                            onClick: () => handleCopyExamInfo(exam, showToast)
                          },
                          {
                            label: 'Edit Ujian',
                            icon: <Edit3 size={14} />,
                            onClick: () => handleEditExamInternal(exam)
                          }
                        ]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
