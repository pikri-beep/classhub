import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
  Upload,
  Camera,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Copy,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { processImageFile } from '../lib/imageUtils';
import Modal from '../components/Modal';
import WhatsAppShareModal from '../components/WhatsAppShareModal';
import { getPeriodMonth, formatMonthLabel, getAvailableMonths, getCurrentMonthKey } from '../lib/duesUtils';
import MonthNavigator from '../components/MonthNavigator';
import { formatDateIndo, formatCompactDateTime, getDeadlineStatus } from '../lib/dateUtils';
import {
  MetricCard,
  ProgressBar,
  EmptyState,
  StatusBadge,
  SearchInput,
  FilterPills,
  ActionMenu,
  ConfirmDialog
} from '../components/admin';
import { getSubjectTagClass } from '../lib/subjectColors';

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
    markAllDuesPaid,
    addEvent,
    deleteEvent,
    updateSchedule,
    addDuesPeriod,
    deleteDuesPeriod,
    getTotalCashBalance,
    updateClassInfo,
    resetToDefault,
    addMember,
    updateMember,
    deleteMember
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
  const [periodName, setPeriodName] = useState('Minggu 1');
  const [periodAmount, setPeriodAmount] = useState('5000');
  const [periodMonth, setPeriodMonth] = useState(getCurrentMonthKey());
  const [selectedDuesMonth, setSelectedDuesMonth] = useState(getCurrentMonthKey());

  // Phase 4: Dues Matrix search, filter & confirmation states
  const [duesSearchQuery, setDuesSearchQuery] = useState('');
  const [duesStatusFilter, setDuesStatusFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [periodToMarkAllPaid, setPeriodToMarkAllPaid] = useState(null);
  const [periodToDelete, setPeriodToDelete] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);

  // Schedule editor state
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubStart, setNewSubStart] = useState('07:00');
  const [newSubEnd, setNewSubEnd] = useState('08:30');

  // Settings form state
  const [settingsAppName, setSettingsAppName] = useState(data.classInfo?.appName || 'ClassHub');
  const [settingsName, setSettingsName] = useState(data.classInfo?.name || 'XI PPLG');
  const [settingsSchool, setSettingsSchool] = useState(data.classInfo?.school || '');
  const [settingsAcademicYear, setSettingsAcademicYear] = useState(data.classInfo?.academicYear || '2026/2027');
  const [settingsHomeroomTeacher, setSettingsHomeroomTeacher] = useState(data.classInfo?.homeroomTeacher || '');
  const [settingsAdminPin, setSettingsAdminPin] = useState(data.classInfo?.adminPin || 'admin123');
  const [settingsLogoUrl, setSettingsLogoUrl] = useState(data.classInfo?.logoUrl || '');
  const [isProcessingSettingsImg, setIsProcessingSettingsImg] = useState(false);

  useEffect(() => {
    if (data.classInfo) {
      setSettingsAppName(data.classInfo.appName || 'ClassHub');
      setSettingsName(data.classInfo.name || 'XI PPLG');
      setSettingsSchool(data.classInfo.school || '');
      setSettingsAcademicYear(data.classInfo.academicYear || '2026/2027');
      setSettingsHomeroomTeacher(data.classInfo.homeroomTeacher || '');
      setSettingsAdminPin(data.classInfo.adminPin || 'admin123');
      setSettingsLogoUrl(data.classInfo.logoUrl || '');
    }
  }, [data.classInfo]);

  const handleSettingsLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingSettingsImg(true);
      const dataUrl = await processImageFile(file, 320, 0.85);
      setSettingsLogoUrl(dataUrl);
      showToast('Gambar berhasil dimuat dan dikompresi!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal memproses gambar', 'error');
    } finally {
      setIsProcessingSettingsImg(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateClassInfo({
      appName: settingsAppName.trim() || 'ClassHub',
      name: settingsName.trim() || 'Kelas',
      school: settingsSchool.trim(),
      academicYear: settingsAcademicYear.trim(),
      homeroomTeacher: settingsHomeroomTeacher.trim(),
      adminPin: settingsAdminPin.trim() || 'admin123',
      logoUrl: settingsLogoUrl.trim()
    });
    showToast('Identitas dan pengaturan kelas berhasil disimpan! 🎉', 'success');
  };

  // Member form state (Phase 3: Clean NISN, WhatsApp support, Search & Filter)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all'); // 'all' | 'admin' | 'member'

  const [studentAbsentNo, setStudentAbsentNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentRoleTitle, setStudentRoleTitle] = useState('Anggota');

  const [editMemberAbsentNo, setEditMemberAbsentNo] = useState('');
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberPhone, setEditMemberPhone] = useState('');
  const [editMemberRoleTitle, setEditMemberRoleTitle] = useState('Anggota');

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    addMember({
      absentNo: Number(studentAbsentNo) || (members.length + 1),
      name: studentName.trim(),
      phone: studentPhone.trim(),
      roleTitle: studentRoleTitle.trim() || 'Anggota'
    });
    setIsAddMemberOpen(false);
    setStudentName('');
    setStudentPhone('');
    showToast(`Siswa "${studentName.trim()}" berhasil ditambahkan! 🎉`, 'success');
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (!selectedMemberForEdit || !editMemberName.trim()) return;
    updateMember(selectedMemberForEdit.id, {
      absentNo: Number(editMemberAbsentNo),
      name: editMemberName.trim(),
      phone: editMemberPhone.trim(),
      roleTitle: editMemberRoleTitle.trim() || 'Anggota'
    });
    setIsEditMemberOpen(false);
    showToast(`Data siswa "${editMemberName.trim()}" diperbarui!`, 'success');
  };

  const members = data?.members || [];
  const tasks = data?.tasks || [];
  const exams = data?.exams || [];
  const announcements = data?.announcements || [];
  const duesPeriods = data?.cash?.duesPeriods || [];
  const transactions = data?.cash?.transactions || [];
  const cashStats = (typeof getTotalCashBalance === 'function' ? getTotalCashBalance() : null) || {
    balance: data?.cash?.balance || 0,
    income: 0,
    expense: 0
  };

  // Overview Phase 2 calculations from real store data
  const totalMembers = members.length;
  const adminMembersCount = members.filter(m => m.role === 'admin' || (m.roleTitle && m.roleTitle !== 'Anggota')).length;
  const regularMembersCount = totalMembers - adminMembersCount;

  // Filtered members for Member Management (Phase 3)
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = memberSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        String(m.absentNo || '').includes(q) ||
        (m.roleTitle || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q);

      const isAdminRole = m.role === 'admin' || (m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa');
      const matchesFilter = memberRoleFilter === 'all'
        ? true
        : memberRoleFilter === 'admin'
          ? isAdminRole
          : !isAdminRole;

      return matchesSearch && matchesFilter;
    });
  }, [members, memberSearchQuery, memberRoleFilter]);

  // Active month dues calculation
  const currentMonthKey = getCurrentMonthKey();
  const currentMonthPeriods = useMemo(() => {
    return duesPeriods.filter(p => getPeriodMonth(p) === currentMonthKey);
  }, [duesPeriods, currentMonthKey]);

  const paidAllCount = useMemo(() => {
    if (currentMonthPeriods.length === 0 || totalMembers === 0) return 0;
    return members.filter(m => currentMonthPeriods.every(p => (p.paidStudentIds || []).includes(m.id))).length;
  }, [members, currentMonthPeriods, totalMembers]);

  const paidPercentage = totalMembers > 0 ? Math.round((paidAllCount / totalMembers) * 100) : 0;

  // Tasks with deadline <= 48h
  const urgentTasksCount = useMemo(() => {
    const now = Date.now();
    return tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline).getTime();
      const diffHours = (d - now) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 48;
    }).length;
  }, [tasks]);

  // Today's schedule & piket
  const DAYS_INDONESIAN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = DAYS_INDONESIAN[new Date().getDay()];
  const isWeekendToday = todayDayName === 'Minggu' || todayDayName === 'Sabtu';
  const todaySchedule = data.schedules?.[todayDayName] || { subjects: [], piket: [] };
  const todaySubjectsCount = (todaySchedule.subjects || []).length;
  const todayPiketCount = (todaySchedule.piket || []).length;

  const handleCopyLink = (link) => {
    if (!link) return;
    navigator.clipboard.writeText(link)
      .then(() => showToast('Tautan tugas berhasil disalin! 📋', 'success'))
      .catch(() => showToast('Gagal menyalin tautan tugas', 'error'));
  };

  const handleCopyTaskInfo = (task) => {
    if (!task) return;
    const deadlineLabel = task.deadline ? formatDateIndo(task.deadline, { withDay: true, monthFormat: 'short' }) : 'Segera';
    const text = `📌 *${task.subject} — ${task.title}*\nTenggat: ${deadlineLabel}${task.description ? `\n\n${task.description}` : ''}`;
    navigator.clipboard.writeText(text)
      .then(() => showToast('Informasi tugas berhasil disalin! 📋', 'success'))
      .catch(() => showToast('Gagal menyalin informasi tugas', 'error'));
  };

  const handleSendTaskToWA = (task) => {
    if (!task) return;
    const deadlineLabel = task.deadline ? formatDateIndo(task.deadline, { withDay: true, monthFormat: 'short' }) : 'Segera';
    const msg = `*📢 TUGAS KELAS — ${data?.classInfo?.name || 'XI PPLG'}*
----------------------------------------
*Mata Pelajaran:* ${task.subject}
*Judul Tugas:* ${task.title}
*Tenggat Waktu:* ${deadlineLabel}
${task.description ? `\n*Petunjuk:*\n${task.description}\n` : ''}${task.link ? `\n*Link Pengumpulan:*\n${task.link}\n` : ''}
Mohon untuk dikerjakan tepat waktu. Semangat rekan-rekan! 🙏`;

    navigator.clipboard.writeText(msg)
      .then(() => {
        showToast('Format tugas WA disalin ke clipboard! 📋', 'success');
        const encoded = encodeURIComponent(msg);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
      })
      .catch(() => {
        showToast('Gagal menyalin format tugas', 'error');
      });
  };

  const availableDuesMonths = useMemo(() => {
    return getAvailableMonths(duesPeriods);
  }, [duesPeriods]);

  useEffect(() => {
    if (availableDuesMonths.length > 0 && !availableDuesMonths.includes(selectedDuesMonth)) {
      setSelectedDuesMonth(availableDuesMonths[availableDuesMonths.length - 1]);
    }
  }, [availableDuesMonths, selectedDuesMonth]);

  const monthlyDuesPeriods = useMemo(() => {
    return duesPeriods.filter(p => getPeriodMonth(p) === selectedDuesMonth);
  }, [duesPeriods, selectedDuesMonth]);

  // Phase 4: Filtered members based on search and dues payment status
  const filteredDuesMembers = useMemo(() => {
    return members.filter(m => {
      const q = duesSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        String(m.absentNo || '').includes(q);

      if (!matchesSearch) return false;

      if (duesStatusFilter === 'all' || monthlyDuesPeriods.length === 0) {
        return true;
      }

      const isPaidAllPeriods = monthlyDuesPeriods.length > 0 &&
        monthlyDuesPeriods.every(p => (p.paidStudentIds || []).includes(m.id));

      if (duesStatusFilter === 'paid') {
        return isPaidAllPeriods;
      } else if (duesStatusFilter === 'unpaid') {
        return !isPaidAllPeriods;
      }

      return true;
    });
  }, [members, duesSearchQuery, duesStatusFilter, monthlyDuesPeriods]);

  // Phase 4: Real recap stats for selected month
  const selectedMonthPaidAllCount = useMemo(() => {
    if (monthlyDuesPeriods.length === 0 || totalMembers === 0) return 0;
    return members.filter(m => monthlyDuesPeriods.every(p => (p.paidStudentIds || []).includes(m.id))).length;
  }, [members, monthlyDuesPeriods, totalMembers]);

  const selectedMonthUnpaidCount = totalMembers - selectedMonthPaidAllCount;

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
    const finalMonth = periodMonth || selectedDuesMonth || getCurrentMonthKey();
    addDuesPeriod(periodName.trim(), Number(periodAmount), finalMonth);
    setSelectedDuesMonth(finalMonth);
    setIsAddPeriodOpen(false);
    setPeriodName('Minggu 1');
    showToast(`Periode ${periodName} (${formatMonthLabel(finalMonth)}) berhasil dibuat!`, 'success');
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

      {/* TAB 1: OVERVIEW & STATS (ULTRA-MINIMALIS & TO-THE-POINT) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Header Action Bar: Title + 2 Main Actions ONLY */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                margin: 0
              }}>
                Dashboard {data?.classInfo?.name || 'XI PPLG'}
              </h1>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                margin: '0.2rem 0 0 0'
              }}>
                Pusat manajemen tugas cepat & ringkasan kelas.
              </p>
            </div>

            {/* 2 Primary Actions: Buat Tugas (Solid Oranye) + WhatsApp Brief (Aksen Hijau WA) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(true)}
                style={{
                  backgroundColor: '#EA580C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.6rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C2410C'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EA580C'; e.currentTarget.style.transform = 'none'; }}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Buat Tugas</span>
              </button>

              <button
                type="button"
                onClick={() => (propSetIsWhatsAppOpen ? propSetIsWhatsAppOpen(true) : setIsWhatsAppModalOpen(true))}
                style={{
                  backgroundColor: 'rgba(37, 211, 102, 0.1)',
                  color: '#15803D',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  padding: '0.6rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.18)'; e.currentTarget.style.borderColor = '#22C55E'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.1)'; e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.35)'; }}
              >
                <MessageCircle size={16} color="#16A34A" />
                <span>WhatsApp Brief</span>
              </button>
            </div>
          </div>

          {/* Kartu Statistik: Clean & Ringkas (3 Metrik Esensial, Tanpa Subteks Panjang) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {/* Metrik 1: Total Siswa */}
            <div
              onClick={() => setActiveTab('members')}
              style={{
                padding: '1.25rem 1.4rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total Siswa
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <Users size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {totalMembers}
              </div>
            </div>

            {/* Metrik 2: Saldo Kas */}
            <div
              onClick={() => setActiveTab('cash')}
              style={{
                padding: '1.25rem 1.4rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Saldo Kas
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(37, 211, 102, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A'
                }}>
                  <Wallet size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Rp {Number(cashStats.balance).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Metrik 3: Tugas Aktif */}
            <div
              onClick={() => setActiveTab('tasks')}
              style={{
                padding: '1.25rem 1.4rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Tugas Aktif
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(234, 88, 12, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EA580C'
                }}>
                  <BookOpen size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {tasks.length}
              </div>
            </div>
          </div>

          {/* Daftar Tugas (Padat, Jelas, & Aksi Cepat) */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
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
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Daftar Tugas
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.12rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}>
                  {tasks.length}
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
                description="Buat tugas baru untuk dibagikan ke siswa atau dikirimkan via WhatsApp."
                actionLabel="Buat Tugas"
                onAction={() => setIsAddTaskOpen(true)}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {tasks.map(task => {
                  const deadlineInfo = getDeadlineStatus(task.deadline);
                  const tagClass = getSubjectTagClass(task.subject);

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        transition: 'border-color var(--transition-fast)'
                      }}
                    >
                      {/* Info Utama: Mapel, Judul, Deadline */}
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span className={`notion-tag ${tagClass}`} style={{ fontSize: '0.74rem' }}>
                            {task.subject}
                          </span>
                          <StatusBadge variant={deadlineInfo.urgency} size="sm">
                            {deadlineInfo.label}
                          </StatusBadge>
                          {task.deadline && (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              • {formatDateIndo(task.deadline, { withDay: false, monthFormat: 'short' })}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.01em'
                        }}>
                          {task.title}
                        </div>
                      </div>

                      {/* Aksi Cepat: Salin Link / Info & Kirim ke WA */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                        {task.link ? (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(task.link)}
                            className="btn btn-secondary btn-sm"
                            title="Salin tautan tugas"
                            style={{ fontSize: '0.76rem', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                          >
                            <Copy size={13} />
                            <span>Salin Link</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCopyTaskInfo(task)}
                            className="btn btn-secondary btn-sm"
                            title="Salin informasi tugas"
                            style={{ fontSize: '0.76rem', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                          >
                            <Copy size={13} />
                            <span>Salin Info</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSendTaskToWA(task)}
                          className="btn btn-sm"
                          title="Kirim atau salin format tugas untuk WhatsApp"
                          style={{
                            fontSize: '0.76rem',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            backgroundColor: 'rgba(37, 211, 102, 0.1)',
                            color: '#15803D',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            fontWeight: 600
                          }}
                        >
                          <MessageCircle size={13} color="#16A34A" />
                          <span>Kirim ke WA</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}


      {/* TAB 2: KELOLA TUGAS */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Manajemen Tugas Kelas</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Tugas yang dibuat akan otomatis muncul pada dashboard dan checklist mandiri setiap siswa.
              </p>
            </div>
            <button onClick={() => setIsAddTaskOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
              <Plus size={14} />
              <span>Tambah Tugas</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {tasks.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Belum ada tugas yang dibuat. Klik "Tambah Tugas" untuk membuat tugas baru.
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 700 }}>{task.subject}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenggat: {task.deadline}</span>
                      {task.link && (
                        <a href={task.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 600 }}>
                          Link Materi ↗
                        </a>
                      )}
                    </div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{task.title}</h4>
                    {task.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>{task.description}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => setIsWhatsAppModalOpen(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', color: '#16A34A', gap: '0.35rem' }}
                      title="Kirim info tugas ke WhatsApp Kelas"
                    >
                      <MessageCircle size={14} />
                      <span>Bagikan WA</span>
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
              ))
            )}
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDateIndo(ev.date, { withDay: true, monthFormat: 'short' })} {ev.desc && `• ${ev.desc}`}
                    </div>
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
                    <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
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
                <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
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
              <button
                onClick={() => {
                  setPeriodMonth(selectedDuesMonth || getCurrentMonthKey());
                  setIsAddPeriodOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.3rem' }}
              >
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Matriks Iuran Kas
                </h3>
                {/* Mini Recap Banner (Data Real) */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.25rem 0.65rem',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--tag-green-text)' }}>
                    {selectedMonthPaidAllCount} Siswa Lunas
                  </span>
                  <span>•</span>
                  <span style={{ fontWeight: 700, color: selectedMonthUnpaidCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {selectedMonthUnpaidCount} Belum Lunas
                  </span>
                </div>
              </div>

              {/* Month Navigator */}
              <MonthNavigator
                availableMonths={availableDuesMonths}
                selectedMonth={selectedDuesMonth}
                onMonthChange={setSelectedDuesMonth}
              />
            </div>

            {/* Search & Filter Bar */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '0.75rem', 
                marginBottom: '1rem', 
                flexWrap: 'wrap' 
              }}
            >
              <SearchInput
                value={duesSearchQuery}
                onChange={(e) => setDuesSearchQuery(e.target.value)}
                onClear={() => setDuesSearchQuery('')}
                placeholder="Cari siswa di matriks..."
                style={{ maxWidth: '280px', height: '36px' }}
              />
              <FilterPills
                options={[
                  { value: 'all', label: 'Semua' },
                  { value: 'unpaid', label: 'Belum Lunas' },
                  { value: 'paid', label: 'Sudah Lunas' }
                ]}
                activeValue={duesStatusFilter}
                onChange={setDuesStatusFilter}
              />
            </div>

            {/* Matrix Table with Sticky Columns */}
            <div style={{ 
              overflowX: 'auto', 
              overflowY: 'auto',
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-sm)',
              maxHeight: '520px',
              position: 'relative'
            }}>
              <table className="notion-table sticky-table-header" style={{ minWidth: '640px', borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
                <thead>
                  <tr>
                    <th className="sticky-col-left-1" style={{ width: '48px', minWidth: '48px', textAlign: 'center', zIndex: 30 }}>#</th>
                    <th className="sticky-col-left-2" style={{ minWidth: '150px', zIndex: 30 }}>Nama Siswa</th>
                    {monthlyDuesPeriods.map(p => {
                      const periodPaidCount = (p.paidStudentIds || []).length;
                      const isAllPaid = totalMembers > 0 && periodPaidCount === totalMembers;

                      return (
                        <th key={p.id} style={{ textAlign: 'center', minWidth: '110px', padding: '0.65rem 0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{p.name}</span>
                            <button
                              type="button"
                              onClick={() => setPeriodToDelete(p)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '2px',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                opacity: 0.5
                              }}
                              title={`Hapus periode ${p.name}`}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--danger)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0.1rem 0' }}>
                            Rp {Number(p.amount || 0).toLocaleString('id-ID')}
                          </div>
                          {/* Aksi Cepat: Tandai Semua Lunas */}
                          <button
                            type="button"
                            disabled={isAllPaid}
                            onClick={() => setPeriodToMarkAllPaid(p)}
                            style={{
                              background: isAllPaid ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-hover)',
                              border: `1px solid ${isAllPaid ? 'rgba(22, 163, 74, 0.25)' : 'var(--border)'}`,
                              borderRadius: 'var(--radius-xs)',
                              padding: '0.15rem 0.4rem',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              color: isAllPaid ? '#16A34A' : 'var(--text-secondary)',
                              cursor: isAllPaid ? 'default' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              marginTop: '0.15rem'
                            }}
                            title={isAllPaid ? 'Seluruh siswa telah lunas' : `Tandai seluruh siswa lunas pada ${p.name}`}
                          >
                            <CheckCircle2 size={10} />
                            <span>{isAllPaid ? 'Lunas Semua' : 'Tandai Semua'}</span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {monthlyDuesPeriods.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                        <EmptyState
                          title="Belum Ada Periode Kas"
                          description={`Belum ada periode kas pada bulan ${formatMonthLabel(selectedDuesMonth)}. Klik '+ Periode Iuran' untuk menambahkan periode baru.`}
                        />
                      </td>
                    </tr>
                  ) : filteredDuesMembers.length === 0 ? (
                    <tr>
                      <td colSpan={2 + monthlyDuesPeriods.length} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                        <EmptyState
                          title="Siswa Tidak Ditemukan"
                          description={duesSearchQuery || duesStatusFilter !== 'all' ? "Tidak ada siswa yang sesuai dengan filter atau kata kunci pencarian." : "Belum ada siswa terdaftar."}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredDuesMembers.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td className="sticky-col-left-1" style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center' }}>
                          {String(m.absentNo || 0).padStart(2, '0')}
                        </td>
                        <td className="sticky-col-left-2">
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{m.name}</strong>
                        </td>
                        {monthlyDuesPeriods.map(p => {
                          const isPaid = (p.paidStudentIds || []).includes(m.id);
                          return (
                            <td key={p.id} style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  toggleDuesPaid(p.id, m.id);
                                  showToast(`${m.name} di ${p.name} diperbarui!`, 'success');
                                }}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: 'var(--radius-xs)',
                                  border: isPaid ? '1px solid var(--tag-green-text)' : '1px solid var(--border)',
                                  backgroundColor: isPaid ? 'var(--tag-green-bg)' : 'transparent',
                                  color: isPaid ? 'var(--tag-green-text)' : 'transparent',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all var(--transition-fast)'
                                }}
                                title={`Klik untuk ganti status ${m.name} (${isPaid ? 'Lunas' : 'Belum'})`}
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: 'var(--text-primary)' }}>
              Buku Kas & Riwayat Transaksi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {transactions.length === 0 ? (
                <EmptyState
                  title="Belum Ada Transaksi"
                  description="Klik 'Catat Transaksi' untuk menambahkan pemasukan atau pengeluaran kas."
                />
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.75rem'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {formatDateIndo(tx.date)} • {tx.category} • Dicatat: {tx.recordedBy}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: tx.type === 'income' ? 'var(--tag-green-text)' : 'var(--danger)' }}>
                        {tx.type === 'income' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                      </span>
                      <ActionMenu
                        align="right"
                        items={[
                          {
                            label: 'Hapus Transaksi',
                            icon: <Trash2 size={14} />,
                            variant: 'danger',
                            onClick: () => setTxToDelete(tx)
                          }
                        ]}
                      />
                    </div>
                  </div>
                ))
              )}
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
                    <span className="notion-tag notion-tag-gray" style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
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

      {/* TAB 7: DATA SISWA & JABATAN */}
      {activeTab === 'members' && (
        <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Data Siswa & Jabatan
            </h3>
            <button
              type="button"
              onClick={() => {
                setStudentAbsentNo(members.length + 1);
                setStudentName('');
                setStudentPhone('');
                setStudentRoleTitle('Anggota');
                setIsAddMemberOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{
                fontWeight: 700,
                gap: '0.35rem',
                backgroundColor: '#EA580C',
                borderColor: '#EA580C',
                color: '#FFFFFF'
              }}
            >
              <Plus size={15} />
              <span>Tambah Siswa</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div
            className="admin-members-filter-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <SearchInput
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              onClear={() => setMemberSearchQuery('')}
              placeholder="Cari nama, absen, jabatan..."
              style={{ maxWidth: '280px', height: '36px' }}
            />
            <FilterPills
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'admin', label: 'Pengurus' },
                { value: 'member', label: 'Siswa' }
              ]}
              activeValue={memberRoleFilter}
              onChange={setMemberRoleFilter}
            />
          </div>

          {/* 1. Desktop View: Spacious, refined table */}
          <div className="admin-members-desktop-view" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <table className="notion-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ width: '45px', textAlign: 'center', padding: '0.75rem 0.85rem' }}>#</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Nama Siswa</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>WhatsApp</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Jabatan</th>
                  <th style={{ width: '60px', textAlign: 'center', padding: '0.75rem 0.85rem' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2.5rem 1rem' }}>
                      <EmptyState
                        title={memberSearchQuery || memberRoleFilter !== 'all' ? "Siswa Tidak Ditemukan" : "Belum Ada Siswa"}
                        description={memberSearchQuery || memberRoleFilter !== 'all' ? `Tidak ada siswa yang cocok dengan filter atau kata kunci "${memberSearchQuery}".` : "Belum ada siswa terdaftar. Klik '+ Input Siswa' untuk menambahkan."}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(m => {
                    const hasSpecialRole = m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa';
                    const cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
                    const waFormatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', padding: '0.85rem' }}>
                          {String(m.absentNo || 0).padStart(2, '0')}
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{m.name}</strong>
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          {m.phone ? (
                            <a
                              href={`https://wa.me/${waFormatted}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: '#16a34a',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                textDecoration: 'none',
                                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(22, 163, 74, 0.2)'
                              }}
                              title={`Chat WhatsApp dengan ${m.name}`}
                            >
                              <Phone size={12} strokeWidth={2.5} />
                              <span>{m.phone}</span>
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          {hasSpecialRole ? (
                            <span className="notion-tag notion-tag-orange" style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                              {m.roleTitle}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '0.85rem' }}>
                          <ActionMenu
                            align="right"
                            items={[
                              {
                                label: 'Edit Data',
                                icon: <Edit3 size={14} />,
                                onClick: () => {
                                  setSelectedMemberForEdit(m);
                                  setEditMemberAbsentNo(m.absentNo || '');
                                  setEditMemberName(m.name || '');
                                  setEditMemberPhone(m.phone || '');
                                  setEditMemberRoleTitle(m.roleTitle || 'Anggota');
                                  setIsEditMemberOpen(true);
                                }
                              },
                              {
                                label: 'Hapus Siswa',
                                icon: <Trash2 size={14} />,
                                variant: 'danger',
                                onClick: () => setMemberToDelete(m)
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile View: Responsive vertical Card List */}
          <div className="admin-members-mobile-view">
            {filteredMembers.length === 0 ? (
              <EmptyState
                title={memberSearchQuery || memberRoleFilter !== 'all' ? "Siswa Tidak Ditemukan" : "Belum Ada Siswa"}
                description={memberSearchQuery || memberRoleFilter !== 'all' ? `Tidak ada siswa yang cocok dengan filter atau kata kunci "${memberSearchQuery}".` : "Belum ada siswa terdaftar. Klik '+ Input Siswa' untuk menambahkan."}
              />
            ) : (
              filteredMembers.map(m => {
                const hasSpecialRole = m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa';
                const cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
                const waFormatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                return (
                  <div
                    key={m.id}
                    className="card admin-student-mobile-card"
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      {/* Nomor Absen kecil di sudut/badge */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        #{String(m.absentNo || 0).padStart(2, '0')}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        {/* Nama Siswa tebal */}
                        <div style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.3
                        }}>
                          {m.name}
                        </div>

                        {/* Badge Jabatan (jika pengurus) */}
                        {hasSpecialRole && (
                          <div style={{ marginTop: '0.2rem' }}>
                            <span
                              className="notion-tag notion-tag-orange"
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.12rem 0.45rem'
                              }}
                            >
                              {m.roleTitle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tombol cepat WhatsApp & Menu opsi tiga titik */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                      {m.phone && (
                        <a
                          href={`https://wa.me/${waFormatted}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Chat WhatsApp dengan ${m.name}`}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                            border: '1px solid rgba(22, 163, 74, 0.25)',
                            color: '#16A34A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            transition: 'all var(--transition-fast)'
                          }}
                          title={`Chat WhatsApp dengan ${m.name}`}
                        >
                          <Phone size={15} strokeWidth={2.2} />
                        </a>
                      )}
                      <ActionMenu
                        align="right"
                        items={[
                          {
                            label: 'Edit Data',
                            icon: <Edit3 size={14} />,
                            onClick: () => {
                              setSelectedMemberForEdit(m);
                              setEditMemberAbsentNo(m.absentNo || '');
                              setEditMemberName(m.name || '');
                              setEditMemberPhone(m.phone || '');
                              setEditMemberRoleTitle(m.roleTitle || 'Anggota');
                              setIsEditMemberOpen(true);
                            }
                          },
                          {
                            label: 'Hapus Siswa',
                            icon: <Trash2 size={14} />,
                            variant: 'danger',
                            onClick: () => setMemberToDelete(m)
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
      )}

      {/* TAB 8: IDENTITAS KELAS & PENGATURAN */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Class Identity & Logo Form Card */}
          <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Identitas & Branding Kelas</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Atur nama web, nama kelas, sekolah, wali kelas, serta logo/foto resmi yang tampil di header aplikasi.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Logo / Foto Kelas Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-soft)',
                  border: '2px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {settingsLogoUrl ? (
                    <img src={settingsLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Camera size={28} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Logo / Foto Kelas (Ikon Web & Header)
                  </label>

                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', gap: '0.35rem' }}>
                      <Upload size={14} />
                      <span>{isProcessingSettingsImg ? 'Memproses...' : 'Pilih Foto dari Perangkat'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSettingsLogoFileChange}
                        style={{ display: 'none' }}
                        disabled={isProcessingSettingsImg}
                      />
                    </label>

                    {settingsLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setSettingsLogoUrl('')}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', fontSize: '0.78rem' }}
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* URL alternatif */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Atau Link URL Gambar (Eksternal)
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://contoh.com/logo.png"
                  value={settingsLogoUrl.startsWith('data:') ? '' : settingsLogoUrl}
                  onChange={(e) => setSettingsLogoUrl(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Nama Web / Aplikasi</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ClassHub"
                    value={settingsAppName}
                    onChange={(e) => setSettingsAppName(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Mengganti judul brand "ClassHub" di navbar atas
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Nama Kelas</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: XII PPLG 1"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Nama Sekolah</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: SMK Negeri 1 Cibinong"
                  value={settingsSchool}
                  onChange={(e) => setSettingsSchool(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Tahun Ajaran</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="2026/2027"
                    value={settingsAcademicYear}
                    onChange={(e) => setSettingsAcademicYear(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Wali Kelas</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nama Guru Pengampu"
                    value={settingsHomeroomTeacher}
                    onChange={(e) => setSettingsHomeroomTeacher(e.target.value)}
                  />
                </div>
              </div>

              {/* Master PIN Pengurus */}
              <div className="form-group" style={{ marginBottom: 0, paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Master PIN Pengurus</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masukkan PIN"
                  value={settingsAdminPin}
                  onChange={(e) => setSettingsAdminPin(e.target.value)}
                  style={{ maxWidth: '280px', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  PIN ini digunakan pengurus untuk login ke dashboard admin.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, padding: '0.6rem 1.25rem' }}>
                  Simpan Perubahan Pengaturan
                </button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE: RESET DATA CARD */}
          <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--danger-border, #FCA5A5)', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--tag-red-bg)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertCircle size={22} />
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--danger)', margin: 0 }}>
                  Zona Berbahaya: Reset Seluruh Data Kelas
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.35rem 0 0.85rem 0', lineHeight: 1.5 }}>
                  Tindakan ini akan mengembalikan seluruh jadwal, tugas, pengumuman, dan kas ke data bawaan demo awal. Data di Supabase Cloud juga akan di-reset.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('PERINGATAN: Apakah Anda benar-benar yakin ingin mereset seluruh data kelas ke kondisi awal? Tindakan ini tidak dapat dibatalkan.')) {
                      resetToDefault();
                      showToast('Seluruh data berhasil di-reset ke bawaan demo awal.', 'info');
                    }
                  }}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'var(--tag-red-bg)',
                    borderColor: 'var(--danger)',
                    color: 'var(--danger)',
                    fontWeight: 700,
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset Seluruh Data ke Bawaan</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

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
        <form onSubmit={handleCreatePeriod} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Bulan Periode</label>
            <input
              type="month"
              className="form-input"
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Bulan terpilih: <strong>{formatMonthLabel(periodMonth)}</strong>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Periode</label>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              {['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPeriodName(preset)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-sm)',
                    border: periodName === preset ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                    backgroundColor: periodName === preset ? 'var(--text-primary)' : 'var(--bg)',
                    color: periodName === preset ? 'var(--bg)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Minggu 1"
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

      {/* MODAL: INPUT SISWA BARU */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Input Siswa Baru">
        <form onSubmit={handleCreateMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. Absen</label>
              <input
                type="number"
                className="form-input"
                placeholder="1"
                value={studentAbsentNo}
                onChange={(e) => setStudentAbsentNo(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Lengkap Siswa</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Muhammad Rizki"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. WhatsApp (Opsional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Contoh: 08123456789"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jabatan / Peran Kelas</label>
              <select
                className="form-select"
                value={studentRoleTitle}
                onChange={(e) => setStudentRoleTitle(e.target.value)}
              >
                <option value="Anggota">Anggota</option>
                <option value="Ketua Kelas">Ketua Kelas</option>
                <option value="Wakil Ketua">Wakil Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
                <option value="Seksi Kebersihan">Seksi Kebersihan</option>
                <option value="Seksi Keamanan">Seksi Keamanan</option>
                <option value="Seksi Olahraga">Seksi Olahraga</option>
                <option value="Seksi Rohani">Seksi Rohani</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddMemberOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Siswa
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT DATA SISWA */}
      <Modal isOpen={isEditMemberOpen} onClose={() => setIsEditMemberOpen(false)} title="Edit Data Siswa">
        <form onSubmit={handleUpdateMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. Absen</label>
              <input
                type="number"
                className="form-input"
                value={editMemberAbsentNo}
                onChange={(e) => setEditMemberAbsentNo(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Lengkap Siswa</label>
              <input
                type="text"
                className="form-input"
                value={editMemberName}
                onChange={(e) => setEditMemberName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. WhatsApp (Opsional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Contoh: 08123456789"
                value={editMemberPhone}
                onChange={(e) => setEditMemberPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jabatan / Peran Kelas</label>
              <select
                className="form-select"
                value={editMemberRoleTitle}
                onChange={(e) => setEditMemberRoleTitle(e.target.value)}
              >
                <option value="Anggota">Anggota</option>
                <option value="Ketua Kelas">Ketua Kelas</option>
                <option value="Wakil Ketua">Wakil Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
                <option value="Seksi Kebersihan">Seksi Kebersihan</option>
                <option value="Seksi Keamanan">Seksi Keamanan</option>
                <option value="Seksi Olahraga">Seksi Olahraga</option>
                <option value="Seksi Rohani">Seksi Rohani</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditMemberOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Perbarui Data
            </button>
          </div>
        </form>
      </Modal>



      {/* CONFIRM DIALOG: HAPUS SISWA */}
      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) {
            deleteMember(memberToDelete.id);
            showToast(`Siswa "${memberToDelete.name}" telah dihapus dari kelas.`, 'info');
            setMemberToDelete(null);
          }
        }}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus "${memberToDelete?.name}" (No. Absen ${memberToDelete?.absentNo}) dari daftar kelas?`}
        confirmLabel="Hapus Siswa"
        variant="danger"
      />

      {/* CONFIRM DIALOG: TANDAI SEMUA LUNAS PERIODE */}
      <ConfirmDialog
        isOpen={Boolean(periodToMarkAllPaid)}
        onClose={() => setPeriodToMarkAllPaid(null)}
        onConfirm={() => {
          if (periodToMarkAllPaid) {
            markAllDuesPaid(periodToMarkAllPaid.id);
            showToast(`Seluruh siswa berhasil ditandai lunas pada ${periodToMarkAllPaid.name}.`, 'success');
            setPeriodToMarkAllPaid(null);
          }
        }}
        title="Tandai Semua Lunas"
        message={`Apakah Anda yakin ingin menandai seluruh ${members.length} siswa lunas untuk periode "${periodToMarkAllPaid?.name}"?`}
        confirmLabel="Tandai Lunas Semua"
        variant="warning"
      />

      {/* CONFIRM DIALOG: HAPUS PERIODE IURAN */}
      <ConfirmDialog
        isOpen={Boolean(periodToDelete)}
        onClose={() => setPeriodToDelete(null)}
        onConfirm={() => {
          if (periodToDelete) {
            deleteDuesPeriod(periodToDelete.id);
            showToast(`Periode "${periodToDelete.name}" telah dihapus.`, 'info');
            setPeriodToDelete(null);
          }
        }}
        title="Hapus Periode Iuran"
        message={`Apakah Anda yakin ingin menghapus periode "${periodToDelete?.name}"? Riwayat centang iuran pada periode ini akan ikut terhapus.`}
        confirmLabel="Hapus Periode"
        variant="danger"
      />

      {/* CONFIRM DIALOG: HAPUS TRANSAKSI KAS */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            showToast(`Transaksi "${txToDelete.description}" telah dihapus.`, 'info');
            setTxToDelete(null);
          }
        }}
        title="Hapus Catatan Transaksi"
        message={`Apakah Anda yakin ingin menghapus catatan transaksi "${txToDelete?.description}" senilai Rp ${Number(txToDelete?.amount || 0).toLocaleString('id-ID')}?`}
        confirmLabel="Hapus Transaksi"
        variant="danger"
      />

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
