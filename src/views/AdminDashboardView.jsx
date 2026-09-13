import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Wallet, 
  Users, 
  Megaphone, 
  MessageCircle, 
  Plus, 
  Trash2, 
  Pin, 
  PinOff, 
  Eye, 
  Check, 
  X, 
  Edit3, 
  Key, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import WhatsAppShareModal from '../components/WhatsAppShareModal';

export default function AdminDashboardView({ 
  activeTab: propActiveTab, 
  setActiveTab: propSetActiveTab,
  isWhatsAppOpen: propIsWhatsAppOpen,
  setIsWhatsAppOpen: propSetIsWhatsAppOpen
}) {
  const { currentUser, setPreviewAsStudent } = useAuth();
  const { 
    data, 
    addTask, 
    deleteTask, 
    addExam, 
    deleteExam, 
    addAnnouncement, 
    togglePinAnnouncement, 
    deleteAnnouncement, 
    addTransaction, 
    deleteTransaction, 
    toggleDuesPaid, 
    addEvent, 
    deleteEvent,
    updateSchedule,
    updateMemberPin,
    addDuesPeriod,
    getTotalCashBalance 
  } = useStore();
  const { showToast } = useToast();

  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setInternalActiveTab;

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddAnnOpen, setIsAddAnnOpen] = useState(false);
  
  const [internalIsWhatsAppOpen, setInternalIsWhatsAppOpen] = useState(false);
  const isWhatsAppModalOpen = propIsWhatsAppOpen !== undefined ? propIsWhatsAppOpen : internalIsWhatsAppOpen;
  const setIsWhatsAppModalOpen = propSetIsWhatsAppOpen !== undefined ? propSetIsWhatsAppOpen : setInternalIsWhatsAppOpen;
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);

  // Detail submission modal
  const [viewSubmissionsTask, setViewSubmissionsTask] = useState(null);

  // Reset PIN modal
  const [resettingStudentPin, setResettingStudentPin] = useState(null);

  // Task form state
  const [taskSubject, setTaskSubject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLink, setTaskLink] = useState('');

  // Exam form state
  const [examSubject, setExamSubject] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examScope, setExamScope] = useState('');

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('event');

  // Tx form state
  const [txType, setTxType] = useState('income');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Announcement form state
  const [annCat, setAnnCat] = useState('akademik');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Dues period form state
  const [periodName, setPeriodName] = useState('');
  const [periodAmount, setPeriodAmount] = useState('10000');

  // Schedule editor state
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubStart, setNewSubStart] = useState('07:00');
  const [newSubEnd, setNewSubEnd] = useState('08:30');

  const members = data.members || [];
  const tasks = data.tasks || [];
  const exams = data.exams || [];
  const announcements = data.announcements || [];
  const duesPeriods = data.cash.duesPeriods || [];
  const transactions = data.cash.transactions || [];
  const cashStats = getTotalCashBalance();

  // Handlers
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
    showToast('Jadwal ujian berhasil ditambahkan!', 'success');
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    addEvent({
      title: eventTitle.trim(),
      date: eventDate,
      desc: eventDesc.trim(),
      type: eventType
    });
    setIsAddEventOpen(false);
    setEventTitle('');
    setEventDate('');
    setEventDesc('');
    showToast('Agenda kelas baru berhasil disimpan!', 'success');
  };

  const handleCreateTx = (e) => {
    e.preventDefault();
    addTransaction({
      type: txType,
      amount: Number(txAmount),
      category: txCategory.trim(),
      description: txDesc.trim(),
      date: txDate,
      recordedBy: 'Administrator Kelas'
    });
    setIsAddTxOpen(false);
    setTxAmount('');
    setTxCategory('');
    setTxDesc('');
    showToast('Transaksi kas berhasil dicatat!', 'success');
  };

  const handleCreateAnn = (e) => {
    e.preventDefault();
    addAnnouncement({
      category: annCat,
      title: annTitle.trim(),
      content: annContent.trim(),
      author: 'Administrator / Pengurus Kelas'
    });
    setIsAddAnnOpen(false);
    setAnnTitle('');
    setAnnContent('');
    showToast('Pengumuman kelas dipublikasikan!', 'success');
  };

  const handleCreatePeriod = (e) => {
    e.preventDefault();
    addDuesPeriod(periodName.trim(), Number(periodAmount));
    setIsAddPeriodOpen(false);
    setPeriodName('');
    showToast(`Periode iuran ${periodName} berhasil dibuat!`, 'success');
  };

  const handleResetPin = (student) => {
    if (!student) return;
    updateMemberPin(student.id, '1234');
    setResettingStudentPin(null);
    showToast(`PIN ${student.name} berhasil di-reset ke default (1234)!`, 'success');
  };

  const handleAddSubjectToDay = (e) => {
    e.preventDefault();
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const updatedSubjects = [
      ...(currentDaySchedule.subjects || []),
      {
        subject: newSubName.trim(),
        timeStart: newSubStart,
        timeEnd: newSubEnd
      }
    ].sort((a, b) => a.timeStart.localeCompare(b.timeStart));

    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      subjects: updatedSubjects
    });
    setIsAddSubjectOpen(false);
    setNewSubName('');
    showToast(`Mata pelajaran ditambahkan ke hari ${selectedDay}!`, 'success');
  };

  const handleDeleteSubject = (idx) => {
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const updatedSubjects = currentDaySchedule.subjects.filter((_, i) => i !== idx);
    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      subjects: updatedSubjects
    });
    showToast('Mata pelajaran dihapus.', 'info');
  };

  const handleAddPiketMember = (name) => {
    if (!name) return;
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const currentList = currentDaySchedule.piket || [];
    if (currentList.includes(name)) {
      showToast(`${name} sudah terdaftar di piket hari ${selectedDay}`, 'warning');
      return;
    }
    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      piket: [...currentList, name]
    });
    showToast(`${name} ditambahkan ke piket ${selectedDay}`, 'success');
  };

  const handleRemovePiketMember = (name) => {
    const currentDaySchedule = data.schedules[selectedDay] || { subjects: [], piket: [] };
    const currentList = currentDaySchedule.piket || [];
    updateSchedule(selectedDay, {
      ...currentDaySchedule,
      piket: currentList.filter(n => n !== name)
    });
    showToast(`${name} dihapus dari piket ${selectedDay}`, 'info');
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div className="card" style={{ padding: '1rem 1.15rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Siswa Terdaftar</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {members.length} Siswa
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Semua memiliki akses login PIN
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.15rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Saldo Kas Kelas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                Rp {Number(cashStats.balance).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--tag-green-text)', marginTop: '0.25rem' }}>
                +Rp {Number(cashStats.income).toLocaleString('id-ID')} pemasukan
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.15rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tugas Aktif</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {tasks.length} Tugas
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Perlu dikerjakan pekan ini
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.15rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ujian Terdekat</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {exams[0]?.title || 'Tidak ada ujian'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {exams[0]?.examDate || '—'}
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="card" style={{ padding: '1.25rem 1.35rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.85rem 0' }}>Tindakan Cepat Pengurus</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setIsAddTaskOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Buat Tugas Baru</span>
              </button>
              <button onClick={() => setIsAddExamOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Tambah Ujian</span>
              </button>
              <button onClick={() => setIsAddTxOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Catat Kas (Masuk/Keluar)</span>
              </button>
              <button onClick={() => setIsAddAnnOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Tulis Pengumuman</span>
              </button>
              <button onClick={() => setIsWhatsAppModalOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem', color: '#16A34A' }}>
                <MessageCircle size={14} />
                <span>WhatsApp Brief</span>
              </button>
            </div>
          </div>

          {/* Quick Table: Active Tasks Progress */}
          <div className="card" style={{ padding: '1.25rem 1.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Progres Pengumpulan Tugas Siswa</h3>
              <button onClick={() => setActiveTab('tasks')} className="btn btn-ghost btn-xs">
                Lihat Semua Tugas
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {tasks.map(task => {
                const completedCount = (task.completedStudentIds || []).length;
                const percent = Math.round((completedCount / (members.length || 1)) * 100);

                return (
                  <div key={task.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{task.subject}</span>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{task.title}</div>
                      </div>
                      <button 
                        onClick={() => setViewSubmissionsTask(task)} 
                        className="btn btn-secondary btn-xs"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {completedCount} / {members.length} Selesai ({percent}%)
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: percent > 70 ? 'var(--tag-green-text)' : 'var(--primary)', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: KELOLA TUGAS */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Manajemen Tugas Kelas</h2>
            <button onClick={() => setIsAddTaskOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
              <Plus size={14} />
              <span>Tambah Tugas</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {tasks.map(task => {
              const completedCount = (task.completedStudentIds || []).length;
              const percent = Math.round((completedCount / (members.length || 1)) * 100);

              return (
                <div key={task.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                      <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>{task.subject}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deadline: {task.deadline}</span>
                    </div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{task.title}</h4>
                    {task.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{task.description}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setViewSubmissionsTask(task)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem' }}
                    >
                      {completedCount}/{members.length} Siswa ({percent}%)
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus tugas "${task.title}"?`)) {
                          deleteTask(task.id);
                          showToast('Tugas dihapus.', 'info');
                        }
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', padding: '0.4rem' }}
                      title="Hapus Tugas"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA UJIAN & AGENDA */}
      {activeTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Exams Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Jadwal Ujian / Ulangan Harian</h2>
              <button onClick={() => setIsAddExamOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Tambah Ujian</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {exams.map(exam => (
                <div key={exam.id} className="card" style={{ padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                      <span className="notion-tag notion-tag-red" style={{ fontSize: '0.7rem', fontWeight: 700 }}>{exam.subject}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.examDate}</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{exam.title}</div>
                    {exam.scope && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Materi: {exam.scope}</div>}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus jadwal ujian ${exam.title}?`)) {
                        deleteExam(exam.id);
                        showToast('Jadwal ujian dihapus', 'info');
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Events Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Agenda & Kalender Kelas</h2>
              <button onClick={() => setIsAddEventOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Tambah Agenda</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(data.events || []).map(ev => (
                <div key={ev.id} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ev.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.date} {ev.desc && `• ${ev.desc}`}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus agenda ${ev.title}?`)) {
                        deleteEvent(ev.id);
                        showToast('Agenda dihapus', 'info');
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JADWAL & PIKET */}
      {activeTab === 'schedules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Day Selector */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setPiketInput((data.schedules[day]?.piket || []).join(', '));
                }}
                className={`btn btn-sm ${selectedDay === day ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontWeight: 700, padding: '0.45rem 1rem' }}
              >
                Hari {day}
              </button>
            ))}
          </div>

          {/* Selected Day Subjects */}
          <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>
                Daftar Pelajaran — Hari {selectedDay}
              </h3>
              <button onClick={() => setIsAddSubjectOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Tambah Jam Pelajaran</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {((data.schedules[selectedDay]?.subjects) || []).map((sub, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', width: '25px' }}>#{idx + 1}</span>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{sub.subject}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      {sub.timeStart} - {sub.timeEnd}
                    </span>
                    <button
                      onClick={() => handleDeleteSubject(idx)}
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--danger)' }}
                      title="Hapus jam ini"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Piket Team Editor for Selected Day */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
                    Regu Piket Kebersihan ({selectedDay})
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    Pilih siswa dari daftar untuk ditugaskan piket pada hari {selectedDay}.
                  </p>
                </div>
                <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  {(data.schedules[selectedDay]?.piket || []).length} Siswa Bertugas
                </span>
              </div>

              {/* Active Piket Member Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem', minHeight: '34px', alignItems: 'center' }}>
                {(data.schedules[selectedDay]?.piket || []).length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Belum ada anggota piket untuk hari {selectedDay}. Pilih siswa pada menu di bawah.
                  </span>
                ) : (
                  (data.schedules[selectedDay]?.piket || []).map((name) => (
                    <span
                      key={name}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--hover-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePiketMember(name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-muted)',
                          transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title={`Hapus ${name} dari piket`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Quick Add from Dropdown */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', maxWidth: '420px' }}>
                <select
                  className="form-input"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPiketMember(e.target.value);
                    }
                  }}
                  style={{ fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  <option value="">+ Pilih Siswa untuk Menambah Piket...</option>
                  {members
                    .filter(m => !(data.schedules[selectedDay]?.piket || []).includes(m.name))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(m => (
                      <option key={m.id} value={m.name}>
                        #{m.absentNo} - {m.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: KEUANGAN & MATRIKS KAS */}
      {activeTab === 'cash' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Cash Balance Info */}
          <div className="card" style={{ padding: '1.15rem 1.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Saldo Kas Terkumpul</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Rp {Number(cashStats.balance).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Pemasukan: <strong style={{ color: 'var(--tag-green-text)' }}>+Rp {Number(cashStats.income).toLocaleString('id-ID')}</strong> • Pengeluaran: <strong style={{ color: 'var(--danger)' }}>-Rp {Number(cashStats.expense).toLocaleString('id-ID')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setIsAddPeriodOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>+ Periode Iuran</span>
              </button>
              <button onClick={() => setIsAddTxOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Catat Transaksi</span>
              </button>
            </div>
          </div>

          {/* Dues Matrix Table */}
          <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>Matriks Iuran Seluruh Siswa</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Klik kotak centang pada setiap nama siswa untuk menandai lunas / belum.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <table className="notion-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Nama Siswa</th>
                    {duesPeriods.map(p => (
                      <th key={p.id} style={{ textAlign: 'center' }}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{m.absentNo}</td>
                      <td><strong>{m.name}</strong></td>
                      {duesPeriods.map(p => {
                        const isPaid = (p.paidStudentIds || []).includes(m.id);
                        return (
                          <td key={p.id} style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                toggleDuesPaid(p.id, m.id);
                                showToast(`Status ${m.name} di ${p.name} diperbarui!`, 'success');
                              }}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '4px',
                                border: isPaid ? '1px solid var(--tag-green-text)' : '1px solid var(--border)',
                                backgroundColor: isPaid ? 'var(--tag-green-bg)' : 'transparent',
                                color: isPaid ? 'var(--tag-green-text)' : 'transparent',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={`Klik untuk ganti status ${m.name}`}
                            >
                              <Check size={14} strokeWidth={3} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 0.85rem 0' }}>Buku Kas & Riwayat Transaksi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{tx.description}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {tx.date} • Kategori: {tx.category} • Dicatat: {tx.recordedBy}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: tx.type === 'income' ? 'var(--tag-green-text)' : 'var(--danger)' }}>
                      {tx.type === 'income' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus transaksi "${tx.description}"?`)) {
                          deleteTransaction(tx.id);
                          showToast('Transaksi dihapus.', 'info');
                        }
                      }}
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: PENGUMUMAN KELAS */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Kelola Pengumuman Kelas</h2>
            <button onClick={() => setIsAddAnnOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
              <Plus size={14} />
              <span>Tulis Pengumuman</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {announcements.map(ann => (
              <div key={ann.id} className="card" style={{ padding: '1rem 1.25rem', borderLeft: ann.isPinned ? '3px solid var(--primary)' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span className="notion-tag notion-tag-blue" style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                      {ann.category}
                    </span>
                    {ann.isPinned && (
                      <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                        📌 Disematkan
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ann.author}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => {
                        togglePinAnnouncement(ann.id);
                        showToast(ann.isPinned ? 'Pin dilepas' : 'Pengumuman disematkan di atas', 'info');
                      }}
                      className="btn btn-ghost btn-xs"
                      title={ann.isPinned ? 'Lepas Pin' : 'Sematkan Pengumuman'}
                    >
                      {ann.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus pengumuman "${ann.title}"?`)) {
                          deleteAnnouncement(ann.id);
                          showToast('Pengumuman dihapus', 'info');
                        }
                      }}
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.2rem 0 0.35rem 0' }}>{ann.title}</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DATA SISWA & PIN */}
      {activeTab === 'members' && (
        <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>Daftar Siswa & Manajemen Akses Akun</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Demi privasi dan keamanan, PIN siswa dilindungi secara rahasia dan dapat di-reset ke default (1234) jika siswa lupa.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <table className="notion-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Nama Siswa</th>
                  <th>NISN</th>
                  <th>Jabatan</th>
                  <th>Status PIN</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{m.absentNo}</td>
                    <td><strong>{m.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.nisn}</td>
                    <td>
                      <span className="notion-tag notion-tag-gray">{m.roleTitle || 'Siswa'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ letterSpacing: '3px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          ••••
                        </span>
                        <span className="notion-tag notion-tag-green" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.45rem' }}>
                          <ShieldCheck size={11} />
                          <span>Tersimpan Rahasia</span>
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setResettingStudentPin(m)}
                        className="btn btn-secondary btn-xs"
                        style={{ gap: '0.25rem' }}
                        title={`Reset PIN ${m.name} ke default (1234)`}
                      >
                        <RotateCcw size={12} />
                        <span>Reset PIN</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PENGUMPULAN TUGAS SISWA */}
      <Modal isOpen={!!viewSubmissionsTask} onClose={() => setViewSubmissionsTask(null)} title="Status Pengumpulan Tugas">
        {viewSubmissionsTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <span className="clean-tag-subject" style={{ marginBottom: '0.25rem', display: 'inline-block' }}>
                {viewSubmissionsTask.subject}
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0.2rem 0' }}>{viewSubmissionsTask.title}</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tenggat: {viewSubmissionsTask.deadline}
              </div>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {members.map(m => {
                const isCompleted = (viewSubmissionsTask.completedStudentIds || []).includes(m.id);
                return (
                  <div key={m.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    backgroundColor: isCompleted ? 'var(--tag-green-bg)' : 'var(--bg)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.82rem'
                  }}>
                    <span>#{m.absentNo} · {m.name}</span>
                    <span style={{ fontWeight: 700, color: isCompleted ? 'var(--tag-green-text)' : 'var(--text-muted)' }}>
                      {isCompleted ? '✓ Selesai' : 'Belum Selesai'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: TAMBAH TUGAS */}
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

      {/* MODAL: TAMBAH UJIAN */}
      <Modal isOpen={isAddExamOpen} onClose={() => setIsAddExamOpen(false)} title="Tambah Jadwal Ujian">
        <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
            <label className="form-label">Judul Ujian</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: PTS Ganjil Matriks & Linear"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal & Waktu Ujian</label>
            <input
              type="datetime-local"
              className="form-input"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kisi-kisi / Cakupan Materi</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Bab 1 sampai Bab 3"
              value={examScope}
              onChange={(e) => setExamScope(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Jadwal Ujian
          </button>
        </form>
      </Modal>

      {/* MODAL: TAMBAH AGENDA */}
      <Modal isOpen={isAddEventOpen} onClose={() => setIsAddEventOpen(false)} title="Tambah Agenda Kelas">
        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Kegiatan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kunjungan Industri Tech"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kumpul jam 06.30 di lobi"
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Agenda
          </button>
        </form>
      </Modal>

      {/* MODAL: TAMBAH JAM PELAJARAN */}
      <Modal isOpen={isAddSubjectOpen} onClose={() => setIsAddSubjectOpen(false)} title={`Tambah Pelajaran — Hari ${selectedDay}`}>
        <form onSubmit={handleAddSubjectToDay} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Pemrograman Web"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">Jam Mulai</label>
              <input
                type="time"
                className="form-input"
                value={newSubStart}
                onChange={(e) => setNewSubStart(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jam Selesai</label>
              <input
                type="time"
                className="form-input"
                value={newSubEnd}
                onChange={(e) => setNewSubEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Jam Pelajaran
          </button>
        </form>
      </Modal>

      {/* MODAL: CATAT TRANSAKSI KAS */}
      <Modal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="Catat Transaksi Kas">
        <form onSubmit={handleCreateTx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Jenis Transaksi</label>
            <select
              className="form-select"
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
            >
              <option value="income">Pemasukan (+)</option>
              <option value="expense">Pengeluaran (-)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nominal (Rp)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Contoh: 50000"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Iuran Kas, Kebersihan, Fotokopi"
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan / Rincian</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Beli 2 spidol whiteboard & penghapus"
              value={txDesc}
              onChange={(e) => setTxDesc(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Transaksi
          </button>
        </form>
      </Modal>

      {/* MODAL: TAMBAH PERIODE IURAN */}
      <Modal isOpen={isAddPeriodOpen} onClose={() => setIsAddPeriodOpen(false)} title="Tambah Periode Iuran">
        <form onSubmit={handleCreatePeriod} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Periode</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Minggu 5 (Okt)"
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nominal Iuran (Rp)</label>
            <input
              type="number"
              className="form-input"
              value={periodAmount}
              onChange={(e) => setPeriodAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Buat Periode Baru
          </button>
        </form>
      </Modal>

      {/* MODAL: TULIS PENGUMUMAN */}
      <Modal isOpen={isAddAnnOpen} onClose={() => setIsAddAnnOpen(false)} title="Tulis Pengumuman Baru">
        <form onSubmit={handleCreateAnn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={annCat}
              onChange={(e) => setAnnCat(e.target.value)}
            >
              <option value="penting">Penting</option>
              <option value="akademik">Akademik</option>
              <option value="kegiatan">Kegiatan</option>
              <option value="keuangan">Keuangan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Judul Pengumuman</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Informasi Ujian Praktek Pekan Depan"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Isi Pengumuman</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Tuliskan pesan lengkap untuk teman-teman sekelas..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Publikasikan
          </button>
        </form>
      </Modal>

      {/* MODAL: RESET PIN SISWA KE DEFAULT */}
      <Modal isOpen={!!resettingStudentPin} onClose={() => setResettingStudentPin(null)} title="Reset PIN Siswa ke Default">
        {resettingStudentPin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              padding: '0.75rem 0.95rem',
              backgroundColor: 'var(--hover-bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'flex-start'
            }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                <strong>Privasi Terjaga:</strong> Demi keamanan akun, admin tidak dapat melihat PIN pribadi siswa.
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Apakah siswa <strong>{resettingStudentPin.name}</strong> (#{resettingStudentPin.absentNo}) lupa PIN akun mereka? 
              Anda dapat mereset PIN login siswa ini kembali ke PIN standar default: <code style={{ backgroundColor: 'var(--hover-bg)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontWeight: 800 }}>1234</code>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setResettingStudentPin(null)}
                className="btn btn-secondary btn-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleResetPin(resettingStudentPin)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <RotateCcw size={14} />
                <span>Reset ke 1234</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: WHATSAPP SMART SHARE */}
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
