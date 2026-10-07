import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Sparkles,
  Calendar,
  BookOpen,
  Wallet,
  Users,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { formatDateIndo } from '../lib/dateUtils';
import LiveClassTracker from '../components/LiveClassTracker';
import Modal from '../components/Modal';

export default function DashboardView({ onNavigate }) {
  const { currentUser, isAdmin, isEffectiveAdmin } = useAuth();
  const { data, personalDoneTasks = [], togglePersonalTask } = useStore();
  const { showToast } = useToast();

  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  const now = new Date();
  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = daysMap[now.getDay()];
  const formattedDate = formatDateIndo(now, { withDay: true, monthFormat: 'long' });

  // Schedule & Piket data
  const todaySchedule = data.schedules[currentDayName] || { subjects: [], piket: [] };
  const subjectsToday = todaySchedule.subjects || [];
  const piketToday = todaySchedule.piket || [];
  const isPiketToday = piketToday.some(name =>
    name.toLowerCase().includes(currentUser.name.toLowerCase()) ||
    currentUser.name.toLowerCase().includes(name.toLowerCase())
  );

  // Tasks data - uses personalDoneTasks for device checklist and isCompleted for admin status
  const tasks = data.tasks || [];
  const pendingTasks = tasks.filter(t => !t.isCompleted && !personalDoneTasks.includes(t.id));
  const sortedTasks = [...tasks].sort((a, b) => {
    const aDone = Boolean(a.isCompleted) || personalDoneTasks.includes(a.id);
    const bDone = Boolean(b.isCompleted) || personalDoneTasks.includes(b.id);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  // Toggle task completion (personal to this device)
  const handleToggleTask = (task, e) => {
    e?.stopPropagation();
    if (task.isCompleted) {
      showToast('Tugas ini sudah selesai untuk seluruh kelas (oleh Admin) ✨', 'info');
      return;
    }
    const isDone = personalDoneTasks.includes(task.id);
    if (togglePersonalTask) {
      togglePersonalTask(task.id);
    }
    if (!isDone) {
      showToast('Tugas selesai di perangkatmu! Kerja bagus 🎉', 'success');
      if (pendingTasks.length <= 1) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    } else {
      showToast('Tugas ditandai belum selesai di perangkat ini', 'info');
    }
  };

  // Upcoming Exams & Events
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingExams = [...(data.exams || [])]
    .filter(ex => ex.examDate && new Date(ex.examDate) >= todayStart)
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  const nearestExam = upcomingExams[0];

  const upcomingEvents = [...(data.events || [])]
    .filter(ev => ev.date && new Date(ev.date) >= todayStart)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Cash status for current student
  const duesPeriods = data.cash.duesPeriods || [];
  const myUnpaidPeriods = duesPeriods.filter(p => !(p.paidStudentIds || []).includes(currentUser.id));
  const isCashPaidAll = myUnpaidPeriods.length === 0 && duesPeriods.length > 0;
  const unpaidAmount = myUnpaidPeriods.reduce((sum, p) => sum + (Number(p.amount) || Number(data.cash.duesAmount || 10000)), 0);

  // Announcements
  const announcements = data.announcements || [];
  const pinnedAnnouncement = announcements.find(a => a.isPinned) || announcements[0];


  // Calculate days until date helper & color
  const getExamUrgency = (dateStr) => {
    if (!dateStr) return { text: '', tagClass: 'notion-tag-gray' };
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { text: 'Hari ini', tagClass: 'notion-tag-red' };
    if (diffDays === 1) return { text: 'Besok', tagClass: 'notion-tag-red' };
    if (diffDays === 2) return { text: '2 hari lagi', tagClass: 'notion-tag-red' };
    if (diffDays <= 5) return { text: `${diffDays} hari lagi`, tagClass: 'notion-tag-orange' };
    return { text: `${diffDays} hari lagi`, tagClass: 'notion-tag-gray' };
  };

  const getDaysUntil = (dateStr) => {
    return getExamUrgency(dateStr).text;
  };

  return (
    <div className="student-dashboard-container">

      {/* 1. PERSONAL GREETING & CONTEXT HEADER */}
      <div className="card" style={{
        padding: '1.25rem 1.4rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0 0 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>Selamat Datang, {currentUser?.name?.split(' ')[0] || 'Siswa'}</span>
              <Sparkles size={18} color="var(--primary)" />
            </h1>
          </div>

          {/* Contextual Status Badges */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Piket Badge */}
            <span className="clean-chip chip-neutral" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={12} color="var(--text-muted)" />
              <span>{piketToday.length} Petugas Piket</span>
            </span>

            {/* Cash Badge */}
            <button
              onClick={() => onNavigate && onNavigate('cash')}
              className="clean-chip chip-neutral"
              style={{ cursor: 'pointer', border: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Buka Halaman Kas Kelas"
            >
              <Wallet size={12} color="var(--primary)" />
              <span>Kas: Rp {Number(data?.cash?.balance || 0).toLocaleString('id-ID')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME CLASS TRACKER */}
      <LiveClassTracker schedules={data.schedules} onNavigate={onNavigate} />

      {/* 3. TODAY'S LESSONS & PIKET TEAM (INTEGRATED DAILY HUB) */}
      <div className="card" style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <BookOpen size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Jadwal {currentDayName}</h3>
          </div>
          <button
            onClick={() => onNavigate('schedule')}
            className="btn btn-ghost btn-xs"
            style={{ color: 'var(--primary)', fontWeight: 600, gap: '0.2rem' }}
          >
            <span>Jadwal Lengkap</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {subjectsToday.length === 0 ? (
          <div style={{ padding: '1.75rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--callout-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tidak ada jam KBM</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hari ini libur atau agenda bebas kegiatan sekolah.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {subjectsToday.map((sub, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '22px' }}>
                    #{idx + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.subject}
                    </div>
                  </div>
                </div>

                <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.75rem', flexShrink: 0, fontWeight: 600 }}>
                  {sub.timeStart} - {sub.timeEnd}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Piket List */}
        {piketToday.length > 0 && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.45rem',
            fontSize: '0.75rem'
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Users size={13} />
              <span>Petugas Piket:</span>
            </span>
            {piketToday.map((name, i) => (
              <span
                key={i}
                className="clean-chip chip-neutral"
                style={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 4. PERLU DIKERJAKAN (TO-DO FOCUS & DEADLINES) */}
      <div className="card" style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
              Perlu Dikerjakan ({pendingTasks.length})
            </h3>
          </div>

          <button
            onClick={() => onNavigate('academic')}
            className="btn btn-ghost btn-xs"
            style={{ color: 'var(--primary)', fontWeight: 600, gap: '0.2rem' }}
          >
            <span>Semua Tugas</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {tasks.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--tag-green-bg)', color: 'var(--tag-green-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={20} strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Semua tugas beres!</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tidak ada tanggungan tugas aktif untuk kelas saat ini.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pendingTasks.length === 0 && tasks.length > 0 && (
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--tag-green-bg)',
                color: 'var(--tag-green-text)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginBottom: '0.2rem'
              }}>
                <Sparkles size={14} />
                <span>Hebat! Semua tugas di daftar ini sudah selesai kamu tandai 🎉</span>
              </div>
            )}

            {sortedTasks.map(task => {
              const isDone = Boolean(task.isCompleted) || personalDoneTasks.includes(task.id);
              const isGloballyDone = Boolean(task.isCompleted);
              const deadlineFormatted = formatDateIndo(task.deadline, { withDay: false, monthFormat: 'short' });
              const daysLeft = getDaysUntil(task.deadline);
              const isUrgent = daysLeft === 'Hari ini' || daysLeft === 'Besok';

              return (
                <div
                  key={task.id}
                  className={`clean-todo-item ${isDone ? 'completed' : ''}`}
                  onClick={() => setSelectedTaskDetail(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <button
                    type="button"
                    className="clean-todo-checkbox-btn"
                    onClick={(e) => handleToggleTask(task, e)}
                    aria-label={`Tandai tugas ${task.title}`}
                    title={isGloballyDone ? 'Ditutup oleh Pengurus Kelas' : isDone ? 'Batal tandai selesai' : 'Tandai selesai'}
                  >
                    <div className={`clean-todo-checkbox-box ${isDone ? 'checked' : ''}`}>
                      {isDone && <Check size={13} strokeWidth={3} />}
                    </div>
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="clean-todo-text" style={{ textDecoration: isDone ? 'line-through' : 'none', fontSize: '0.9375rem' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span>{task.subject}</span>
                      {isGloballyDone && (
                        <span className="notion-tag notion-tag-green" style={{ fontSize: '0.7rem' }}>
                          Tugas Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="clean-todo-meta">
                    {!isGloballyDone && (
                      <span className={`clean-tag-deadline ${isUrgent && !isDone ? 'urgent' : ''}`}>
                        {daysLeft || deadlineFormatted}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. AKAN DATANG (UJIAN TERDEKAT & AGENDA KELAS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

        {/* Nearest Exam Card */}
        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={13} />
                <span>Ujian Terdekat</span>
              </div>
              {nearestExam && (() => {
                const urgency = getExamUrgency(nearestExam.examDate);
                return (
                  <span className={`notion-tag ${urgency.tagClass}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {urgency.text}
                  </span>
                );
              })()}
            </div>

            {nearestExam ? (
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                  {nearestExam.title}
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', fontWeight: 600 }}>
                    {formatDateIndo(nearestExam.examDate, { withDay: true, monthFormat: 'short' })}
                  </span>
                  <span>{nearestExam.subject}</span>
                </div>
                {nearestExam.scope && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg)',
                    padding: '0.4rem 0.55rem',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    Materi: {nearestExam.scope}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                Tidak ada ujian mendatang dalam waktu dekat.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('academic')}
            className="btn btn-ghost btn-xs"
            style={{ marginTop: '0.85rem', alignSelf: 'flex-start', color: 'var(--text-secondary)', gap: '0.2rem' }}
          >
            <span>Daftar Ujian ({upcomingExams.length})</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Agenda & Event Card */}
        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} />
                <span>Agenda Mendatang</span>
              </div>
            </div>

            {upcomingEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {upcomingEvents.slice(0, 2).map(ev => (
                  <div key={ev.id} style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{ev.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', fontWeight: 600 }}>
                        {formatDateIndo(ev.date, { withDay: true, monthFormat: 'short' })}
                      </span>
                      {ev.desc && <span style={{ color: 'var(--text-muted)' }}>{ev.desc}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                Belum ada agenda kegiatan kelas yang dijadwalkan.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('schedule')}
            className="btn btn-ghost btn-xs"
            style={{ marginTop: '0.85rem', alignSelf: 'flex-start', color: 'var(--text-secondary)', gap: '0.2rem' }}
          >
            <span>Buka Kalender Agenda</span>
            <ChevronRight size={12} />
          </button>
        </div>

      </div>

      {/* 5. PENGUMUMAN TERKINI */}
      {pinnedAnnouncement && (data?.pageAccess?.announcements?.isEnabled !== false || isEffectiveAdmin) && (
        <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="notion-tag notion-tag-orange" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                {pinnedAnnouncement.category || 'Info'}
              </span>
              {isEffectiveAdmin && data?.pageAccess?.announcements?.isEnabled === false && (
                <span className="notion-tag notion-tag-red" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  Nonaktif untuk Siswa
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigate('class')}
              className="btn btn-ghost btn-xs"
              style={{ color: 'var(--primary)', fontWeight: 600, gap: '0.2rem' }}
            >
              <span>Ruang Kelas</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
            {pinnedAnnouncement.title}
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {pinnedAnnouncement.content}
          </p>
        </div>
      )}

      {/* MODAL: DETAIL TUGAS SISWA (READ-ONLY) */}
      <Modal isOpen={!!selectedTaskDetail} onClose={() => setSelectedTaskDetail(null)} title="Detail Tugas">
        {selectedTaskDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <span className="clean-tag-subject" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                {selectedTaskDetail.subject}
              </span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {selectedTaskDetail.title}
              </h3>
              {selectedTaskDetail.isCompleted ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: 'var(--success)',
                  marginTop: '0.35rem',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={14} />
                  <span>Tugas ini telah ditandai selesai untuk seluruh kelas oleh pengurus.</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Tenggat Waktu: <strong style={{ color: 'var(--text-primary)' }}>{formatDateIndo(selectedTaskDetail.deadline, { withDay: true, monthFormat: 'long' })}</strong>
                </div>
              )}
            </div>

            {selectedTaskDetail.description && (
              <div style={{
                backgroundColor: 'var(--bg)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}>
                {selectedTaskDetail.description}
              </div>
            )}

            {selectedTaskDetail.link && (
              <a
                href={selectedTaskDetail.link}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start', gap: '0.35rem' }}
              >
                <span>Buka Tautan Tugas / Materi</span>
                <ExternalLink size={13} />
              </a>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedTaskDetail(null)}
                className="btn btn-secondary btn-sm"
              >
                Tutup
              </button>
              {!selectedTaskDetail.isCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleTask(selectedTaskDetail);
                    setSelectedTaskDetail(null);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Check size={14} />
                  <span>
                    {personalDoneTasks.includes(selectedTaskDetail.id)
                      ? 'Tandai Belum Selesai'
                      : 'Tandai Sudah Selesai'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
