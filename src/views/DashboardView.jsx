import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, ArrowRight, Sparkles, Clock, Calendar, AlertCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import LiveClassTracker from '../components/LiveClassTracker';
import WhatsAppShareModal from '../components/WhatsAppShareModal';

export default function DashboardView({ onNavigate }) {
  const { currentUser, isAdmin } = useAuth();
  const { data, updateTaskStatus } = useStore();
  const { showToast } = useToast();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const now = new Date();
  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentDayName = daysMap[now.getDay()];
  const formattedDate = `${currentDayName}, ${now.getDate()} ${monthsMap[now.getMonth()]} ${now.getFullYear()}`;

  const tasks = data.tasks || [];
  const myPendingTasks = tasks.filter(t => !(t.completedStudentIds || []).includes(currentUser.id));
  const myDoneTasks = tasks.filter(t => (t.completedStudentIds || []).includes(currentUser.id));

  const todaySchedule = data.schedules[currentDayName] || data.schedules['Senin'] || { subjects: [], piket: [] };
  const isPiketToday = (todaySchedule.piket || []).includes(currentUser.name);

  const sortedExams = [...(data.exams || [])].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  const nearestExam = sortedExams[0];
  const latestAnnouncement = (data.announcements || [])[0];

  const handleToggleTask = (task) => {
    const isDone = (task.completedStudentIds || []).includes(currentUser.id);
    const newStatus = isDone ? 'todo' : 'done';
    updateTaskStatus(task.id, currentUser.id, newStatus);

    if (!isDone) {
      showToast('Hebat! Tugas telah diselesaikan 🎉', 'success');
      // If this was the last pending task, shoot celebratory confetti!
      if (myPendingTasks.length === 1) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      showToast('Tugas ditandai belum selesai', 'info');
    }
  };

  return (
    <div>
      {/* TOP DATE & STATUS BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {formattedDate}
        </div>
        <div className="clean-status-chips">
          <span className={`clean-chip ${isPiketToday ? 'chip-amber' : 'chip-neutral'}`}>
            {isPiketToday ? '⚡ Piket Hari Ini' : 'Bebas Piket'}
          </span>
          <span className="clean-chip chip-neutral">
            Kas: Rp {Number(data.cash.balance || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* 2. COMPACT LIVE CLASS TRACKER */}
      <LiveClassTracker schedules={data.schedules} onNavigate={onNavigate} />

      {/* 3. TO-DO FOCUS (MAX 3 ITEMS, ZERO FLUFF) */}
      <div className="notion-section-title" style={{ marginTop: '1.5rem' }}>
        <span>Tugas Mendesak</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isAdmin && (
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="btn btn-secondary btn-xs"
              style={{ gap: '0.3rem', fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}
              title="Bagikan rekap tugas ke WhatsApp (Khusus Pengurus)"
            >
              <MessageCircle size={13} />
              <span>Rekap WA</span>
            </button>
          )}
          <button onClick={() => onNavigate('academic')} className="btn btn-ghost btn-xs" style={{ gap: '0.2rem', fontSize: '0.75rem' }}>
            <span>Semua ({tasks.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="clean-todo-list">
        {tasks.length === 0 ? (
          <div className="clean-empty-state">
            Tidak ada tugas aktif di kelas ini.
          </div>
        ) : (
          tasks.slice(0, 3).map(task => {
            const isDone = (task.completedStudentIds || []).includes(currentUser.id);
            const dObj = new Date(task.deadline);
            const deadlineFormatted = !isNaN(dObj) ? `${dObj.getDate()} ${monthsMap[dObj.getMonth()]}` : task.deadline;
            const isNear = !isNaN(dObj) && (dObj - new Date()) > 0 && (dObj - new Date()) < 86400000 * 2;

            return (
              <div
                key={task.id}
                className={`clean-todo-item ${isDone ? 'completed' : ''}`}
                onClick={() => handleToggleTask(task)}
              >
                <div className="clean-todo-checkbox">
                  {isDone && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="clean-todo-text">{task.title}</div>
                </div>
                <div className="clean-todo-meta">
                  <span className="clean-tag-subject">{task.subject}</span>
                  <span className={`clean-tag-deadline ${isNear ? 'urgent' : ''}`}>
                    {deadlineFormatted}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. TODAY'S LESSONS */}
      <div className="notion-section-title">
        <span>Jadwal Pelajaran Hari {currentDayName}</span>
        <button onClick={() => onNavigate('schedule')} className="btn btn-ghost btn-sm" style={{ gap: '0.25rem' }}>
          <span>Jadwal Mingguan</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="notion-table-wrapper desktop-only-table">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Jam</th>
              <th>Mata Pelajaran</th>
              <th>Guru Pengampu</th>
              <th style={{ width: '130px' }}>Waktu</th>
              <th style={{ width: '100px' }}>Ruang</th>
            </tr>
          </thead>
          <tbody>
            {(todaySchedule.subjects || []).length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Tidak ada jam pelajaran hari ini (Libur / Kegiatan Sekolah).
                </td>
              </tr>
            ) : (
              todaySchedule.subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{idx + 1}</td>
                  <td><strong>{sub.subject}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{sub.teacher || '—'}</td>
                  <td><span className="notion-tag notion-tag-blue">{sub.timeStart} - {sub.timeEnd}</span></td>
                  <td><span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{sub.room || 'Kelas'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="mobile-only-cards" style={{ marginBottom: '1.5rem' }}>
        {(todaySchedule.subjects || []).length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Tidak ada jam pelajaran hari ini (Libur / Kegiatan Sekolah).
          </div>
        ) : (
          todaySchedule.subjects.map((sub, idx) => (
            <div key={idx} className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{sub.subject}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {sub.teacher || 'Guru Pengampu'} • <span style={{ color: 'var(--text-muted)' }}>{sub.room || 'Ruang Kelas'}</span>
                </div>
              </div>
              <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                {sub.timeStart} - {sub.timeEnd}
              </span>
            </div>
          ))
        )}
      </div>

      {/* 6. LATEST ANNOUNCEMENT */}
      {latestAnnouncement && (
        <div style={{ marginTop: '2rem' }}>
          <div className="notion-section-title">
            <span>Pengumuman Kelas Terkini</span>
            <button onClick={() => onNavigate('class')} className="btn btn-ghost btn-sm" style={{ gap: '0.25rem' }}>
              <span>Buka Ruang Kelas</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <span className="notion-tag notion-tag-orange" style={{ textTransform: 'uppercase' }}>
                {latestAnnouncement.category}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {latestAnnouncement.author}
              </span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
              {latestAnnouncement.title}
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
              {latestAnnouncement.content}
            </p>
          </div>
        </div>
      )}

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
