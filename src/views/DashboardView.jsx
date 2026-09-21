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
import LiveClassTracker from '../components/LiveClassTracker';
import Modal from '../components/Modal';

export default function DashboardView({ onNavigate }) {
  const { currentUser } = useAuth();
  const { data, updateTaskStatus } = useStore();
  const { showToast } = useToast();

  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [isCashDetailOpen, setIsCashDetailOpen] = useState(false);

  const now = new Date();
  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentDayName = daysMap[now.getDay()];
  const formattedDate = `${currentDayName}, ${now.getDate()} ${monthsMap[now.getMonth()]} ${now.getFullYear()}`;

  // Schedule & Piket data
  const todaySchedule = data.schedules[currentDayName] || { subjects: [], piket: [] };
  const subjectsToday = todaySchedule.subjects || [];
  const piketToday = todaySchedule.piket || [];
  const isPiketToday = piketToday.some(name => 
    name.toLowerCase().includes(currentUser.name.toLowerCase()) || 
    currentUser.name.toLowerCase().includes(name.toLowerCase())
  );

  // Tasks data
  const tasks = data.tasks || [];
  const myPendingTasks = tasks.filter(t => !(t.completedStudentIds || []).includes(currentUser.id));

  // Upcoming Exams & Events
  const upcomingExams = [...(data.exams || [])]
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    .filter(ex => new Date(ex.examDate) >= new Date(now.setHours(0, 0, 0, 0)));
  const nearestExam = upcomingExams[0];

  const upcomingEvents = (data.events || []).filter(ev => new Date(ev.date) >= new Date(now.setHours(0, 0, 0, 0)));

  // Cash status for current student
  const duesPeriods = data.cash.duesPeriods || [];
  const myUnpaidPeriods = duesPeriods.filter(p => !(p.paidStudentIds || []).includes(currentUser.id));
  const isCashPaidAll = myUnpaidPeriods.length === 0 && duesPeriods.length > 0;
  const unpaidAmount = myUnpaidPeriods.reduce((sum, p) => sum + (Number(p.amount) || Number(data.cash.duesAmount || 10000)), 0);

  // Announcements
  const announcements = data.announcements || [];
  const pinnedAnnouncement = announcements.find(a => a.isPinned) || announcements[0];

  // Toggle task completion
  const handleToggleTask = (task, e) => {
    e?.stopPropagation();
    const isDone = (task.completedStudentIds || []).includes(currentUser.id);
    const newStatus = isDone ? 'todo' : 'done';
    updateTaskStatus(task.id, currentUser.id, newStatus);

    if (!isDone) {
      showToast('Tugas selesai! Kerja bagus 🎉', 'success');
      if (myPendingTasks.length === 1) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    } else {
      showToast('Tugas ditandai belum selesai', 'info');
    }
  };

  // Calculate days until date helper & color
  const getExamUrgency = (dateStr) => {
    if (!dateStr) return { text: '', tagClass: 'notion-tag-blue' };
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
    return { text: `${diffDays} hari lagi`, tagClass: 'notion-tag-blue' };
  };

  const getDaysUntil = (dateStr) => {
    return getExamUrgency(dateStr).text;
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. PERSONAL GREETING & CONTEXT HEADER */}
      <div className="card" style={{
        padding: '1.25rem 1.4rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-soft) 100%)',
        borderColor: 'var(--primary-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0 0', letterSpacing: '-0.02em' }}>
              Selamat Datang! 👋
            </h1>
          </div>

          {/* Contextual Status Badges */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Piket Badge */}
            <span className="clean-chip chip-neutral" style={{ fontWeight: 600 }}>
              🧹 {piketToday.length} Petugas Piket
            </span>

            {/* Cash Badge */}
            <button 
              onClick={() => setIsCashDetailOpen(true)}
              className="clean-chip chip-neutral"
              style={{ cursor: 'pointer', border: 'none', fontWeight: 600 }}
              title="Lihat rincian kas kelas"
            >
              <Wallet size={12} style={{ marginRight: '0.25rem' }} />
              Kas: Rp {Number(data?.cash?.balance || 0).toLocaleString('id-ID')}
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME CLASS TRACKER */}
      <LiveClassTracker schedules={data.schedules} onNavigate={onNavigate} />

      {/* 3. TODAY'S LESSONS & PIKET TEAM (INTEGRATED DAILY HUB) */}
      <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <BookOpen size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Jadwal Hari {currentDayName}</h3>
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
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Tidak ada jam pelajaran hari ini (Libur / Kegiatan Sekolah).
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {subjectsToday.map((sub, idx) => (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                    #{idx + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.subject}
                    </div>
                  </div>
                </div>

                <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.72rem', flexShrink: 0, fontWeight: 600 }}>
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
            fontSize: '0.8rem'
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
      <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Perlu Dikerjakan ({myPendingTasks.length})
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button 
              onClick={() => onNavigate('academic')}
              className="btn btn-ghost btn-xs"
              style={{ color: 'var(--primary)', fontWeight: 600, gap: '0.2rem' }}
            >
              <span>Semua Tugas</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Belum ada tugas aktif untuk kelas ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {tasks.map(task => {
              const isDone = (task.completedStudentIds || []).includes(currentUser?.id);
              const dObj = new Date(task.deadline);
              const deadlineFormatted = !isNaN(dObj) ? `${dObj.getDate()} ${monthsMap[dObj.getMonth()]}` : task.deadline;
              const daysLeft = getDaysUntil(task.deadline);
              const isUrgent = daysLeft === 'Hari ini!' || daysLeft === 'Besok';

              return (
                <div
                  key={task.id}
                  className={`clean-todo-item ${isDone ? 'completed' : ''}`}
                  onClick={() => setSelectedTaskDetail(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <button 
                    type="button"
                    className="clean-todo-checkbox"
                    onClick={(e) => handleToggleTask(task, e)}
                    aria-label={`Tandai tugas ${task.title}`}
                  >
                    {isDone && <Check size={12} strokeWidth={3} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="clean-todo-text">{task.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {task.subject}
                    </div>
                  </div>

                  <div className="clean-todo-meta">
                    <span className={`clean-tag-deadline ${isUrgent && !isDone ? 'urgent' : ''}`}>
                      {daysLeft || deadlineFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. AKAN DATANG (UJIAN TERDEKAT & AGENDA KELAS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        
        {/* Nearest Exam Card */}
        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={13} />
                <span>Ujian Terdekat</span>
              </div>
              {nearestExam && (() => {
                const urgency = getExamUrgency(nearestExam.examDate);
                return (
                  <span className={`notion-tag ${urgency.tagClass}`} style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                    {urgency.text}
                  </span>
                );
              })()}
            </div>

            {nearestExam ? (
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                  {nearestExam.title}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {nearestExam.subject}
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
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                Tidak ada ujian mendatang dalam waktu dekat.
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('academic')}
            className="btn btn-ghost btn-xs"
            style={{ marginTop: '0.75rem', alignSelf: 'flex-start', color: 'var(--text-secondary)', gap: '0.2rem' }}
          >
            <span>Daftar Ujian ({upcomingExams.length})</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Agenda & Event Card */}
        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} />
                <span>Agenda Mendatang</span>
              </div>
            </div>

            {upcomingEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {upcomingEvents.slice(0, 2).map(ev => (
                  <div key={ev.id} style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ev.date} {ev.desc && `• ${ev.desc}`}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                Belum ada agenda kegiatan kelas yang dijadwalkan.
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('schedule')}
            className="btn btn-ghost btn-xs"
            style={{ marginTop: '0.75rem', alignSelf: 'flex-start', color: 'var(--text-secondary)', gap: '0.2rem' }}
          >
            <span>Buka Kalender Agenda</span>
            <ChevronRight size={12} />
          </button>
        </div>

      </div>

      {/* 6. PENGUMUMAN TERKINI */}
      {pinnedAnnouncement && (
        <div className="card" style={{ padding: '1.25rem 1.4rem', borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="notion-tag notion-tag-blue" style={{ textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 700 }}>
                {pinnedAnnouncement.category || 'Info'}
              </span>
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

          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
            {pinnedAnnouncement.title}
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.25rem 0' }}>
                {selectedTaskDetail.title}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tenggat Waktu: <strong>{selectedTaskDetail.deadline}</strong>
              </div>
            </div>

            {selectedTaskDetail.description && (
              <div style={{
                backgroundColor: 'var(--bg)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55
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

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
                  {(selectedTaskDetail.completedStudentIds || []).includes(currentUser?.id) 
                    ? 'Tandai Belum Selesai' 
                    : 'Tandai Sudah Selesai'}
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: RINCIAN KAS SAYA & KELAS (PERSONAL TRANSPARENCY) */}
      <Modal isOpen={isCashDetailOpen} onClose={() => setIsCashDetailOpen(false)} title="Status Kas & Iuran">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Summary Box */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saldo Kas Kelas Saat Ini</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Rp {Number(data.cash.balance || 0).toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Iuran Wajib</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                Rp {Number(data.cash.duesAmount || 10000).toLocaleString('id-ID')} / pekan
              </div>
            </div>
          </div>

          {/* Dues Periods Checklist for Current Student */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.45rem' }}>
              Riwayat Iuran Saya ({currentUser?.name})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {duesPeriods.map(p => {
                const isPaid = (p.paidStudentIds || []).includes(currentUser?.id);
                return (
                  <div 
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: isPaid ? 'var(--tag-green-bg)' : 'var(--tag-orange-bg)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: isPaid ? 'var(--tag-green-text)' : 'var(--tag-orange-text)' }}>
                      {p.name}
                    </span>
                    <span style={{ fontWeight: 700, color: isPaid ? 'var(--tag-green-text)' : 'var(--tag-orange-text)' }}>
                      {isPaid ? 'Lunas ✓' : `Belum Dibayar (Rp ${Number(p.amount || 10000).toLocaleString('id-ID')})`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Class Expenses */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.45rem' }}>
              Pengeluaran Kelas Terakhir
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {(data.cash.transactions || []).filter(t => t.type === 'expense').slice(0, 3).map(tx => (
                <div 
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.description}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.date} • {tx.category}</div>
                  </div>
                  <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                    -Rp {Number(tx.amount).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Modal>

    </div>
  );
}
