import React from 'react';
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
  RotateCcw
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import {
  MetricCard,
  EmptyState,
  StatusBadge,
  ActionMenu
} from '../../../components/admin';
import { formatCompactDateTime, getDeadlineStatus } from '../../../lib/dateUtils';
import {
  handleCopyLink,
  handleCopyTaskInfo,
  handleSendTaskToWA
} from '../utils/adminHelpers';

export default function OverviewTab({
  setActiveTab,
  onOpenAddTask,
  onOpenWhatsApp,
  onEditTask
}) {
  const { data, toggleTaskCompleted, getTotalCashBalance } = useStore();
  const { showToast } = useToast();

  const tasks = data.tasks || [];
  const members = data.members || [];
  const totalMembers = members.length;
  const cashStats = (typeof getTotalCashBalance === 'function' ? getTotalCashBalance() : null) || {
    totalIn: 0,
    totalOut: 0,
    balance: data?.cash?.balance ?? 0
  };
  const activeTasksCount = tasks.filter(t => !t.isCompleted).length;

  const handleEditTaskInternal = (task) => {
    if (onEditTask) {
      onEditTask(task);
    } else {
      setActiveTab('tasks');
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
              fontSize: '0.84rem',
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
              backgroundColor: 'rgba(37, 211, 102, 0.08)',
              color: '#15803D',
              border: '1px solid rgba(34, 197, 94, 0.28)',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.15)'; e.currentTarget.style.borderColor = '#22C55E'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.08)'; e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.28)'; }}
          >
            <MessageCircle size={15} color="#16A34A" />
            <span>WhatsApp Brief</span>
          </button>
        </div>
      </div>

      {/* Kartu Statistik KPI (Minimalist Soft Surface) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
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
          accentColor="#16A34A"
          onClick={() => setActiveTab('cash')}
        />
        <MetricCard
          icon={BookOpen}
          label="Tugas Aktif"
          value={activeTasksCount}
          accentColor="var(--primary)"
          onClick={() => setActiveTab('tasks')}
        />
      </div>

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
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
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

        {tasks.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada tugas aktif"
            actionLabel="Buat Tugas"
            onAction={onOpenAddTask}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tasks.map((task, idx) => {
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
                    borderBottom: idx === tasks.length - 1 ? 'none' : '1px solid var(--border-subtle)',
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
                      <div style={{
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                        lineHeight: 1.3
                      }}>
                        {task.title}
                      </div>

                      {/* Two-tier metadata */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginTop: '0.25rem',
                        flexWrap: 'wrap',
                        fontSize: '0.76rem',
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

                  {/* ActionMenu Sentris (1 tombol 3-dot) */}
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
    </div>
  );
}
