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
  Phone,
  Calendar,
  Utensils,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { processImageFile } from '../lib/imageUtils';
import Modal from '../components/Modal';
import WhatsAppShareModal from '../components/WhatsAppShareModal';
import { getPeriodMonth, formatMonthLabel, getAvailableMonths, getCurrentMonthKey } from '../lib/duesUtils';
import MonthNavigator from '../components/MonthNavigator';
import { formatDateIndo, formatDateTimeIndo, formatCompactDateTime, getDeadlineStatus } from '../lib/dateUtils';
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

const DEFAULT_WA_GREETING = "Assalamu'alaikum & selamat malam rekan-rekan! 👋";
const DEFAULT_WA_BANNER_TITLE = "PERSIAPAN KELAS";
const DEFAULT_WA_FOOTER_NOTE = "🌐 *Buka ClassHub untuk detail lengkap.*";
const DEFAULT_WA_CLOSING = "Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨";

const formatForDatetimeLocal = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 16);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

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
    updateTask,
    deleteTask,
    addExam,
    updateExam,
    deleteExam,
    addAnnouncement,
    updateAnnouncement,
    togglePinAnnouncement,
    deleteAnnouncement,
    addTransaction,
    deleteTransaction,
    toggleDuesPaid,
    markAllDuesPaid,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleTaskCompleted,
    updateSchedule,
    updateMbgSchedule,
    addMbgMember,
    removeMbgMember,
    resetMbgToDefault,
    updatePageAccess,
    updateBulkPageAccess,
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

  // Task edit state
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [editTaskSubject, setEditTaskSubject] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskLink, setEditTaskLink] = useState('');

  // Task search & delete state (Phase 6)
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskFilterStatus, setTaskFilterStatus] = useState('all'); // 'all' | 'active' | 'completed'
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Exam form state
  const [examSubject, setExamSubject] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examScope, setExamScope] = useState('');

  // Exam edit state
  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [selectedExamForEdit, setSelectedExamForEdit] = useState(null);
  const [editExamSubject, setEditExamSubject] = useState('');
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editExamScope, setEditExamScope] = useState('');

  // Exam sub-tab & search/filter state
  const [examSubTab, setExamSubTab] = useState('exams'); // 'exams' | 'events'
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examFilterStatus, setExamFilterStatus] = useState('all'); // 'all' | 'upcoming' | 'passed'
  const [examToDelete, setExamToDelete] = useState(null);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('event');

  // Event search/filter & edit state
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventFilterStatus, setEventFilterStatus] = useState('all'); // 'all' | 'upcoming' | 'passed'
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventDesc, setEditEventDesc] = useState('');
  const [editEventType, setEditEventType] = useState('event');
  const [eventToDelete, setEventToDelete] = useState(null);

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

  // Announcement edit state
  const [isEditAnnOpen, setIsEditAnnOpen] = useState(false);
  const [selectedAnnForEdit, setSelectedAnnForEdit] = useState(null);
  const [editAnnCat, setEditAnnCat] = useState('akademik');
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');

  // Announcement search & delete state (Phase 6)
  const [annSearchQuery, setAnnSearchQuery] = useState('');
  const [annFilterCat, setAnnFilterCat] = useState('all');
  const [annToDelete, setAnnToDelete] = useState(null);

  // WhatsApp Brief default settings state
  const [waGreeting, setWaGreeting] = useState(data.classInfo?.waGreeting !== undefined ? data.classInfo.waGreeting : DEFAULT_WA_GREETING);
  const [waBannerTitle, setWaBannerTitle] = useState(data.classInfo?.waBannerTitle || DEFAULT_WA_BANNER_TITLE);
  const [waFooterNote, setWaFooterNote] = useState(data.classInfo?.waFooterNote !== undefined ? data.classInfo.waFooterNote : DEFAULT_WA_FOOTER_NOTE);
  const [waClosing, setWaClosing] = useState(data.classInfo?.waClosing !== undefined ? data.classInfo.waClosing : DEFAULT_WA_CLOSING);
  const [waIncludeSchedule, setWaIncludeSchedule] = useState(data.classInfo?.waIncludeSchedule !== false);
  const [waIncludeTasks, setWaIncludeTasks] = useState(data.classInfo?.waIncludeTasks !== false);
  const [waIncludePiket, setWaIncludePiket] = useState(data.classInfo?.waIncludePiket !== false);
  const [waIncludeExams, setWaIncludeExams] = useState(data.classInfo?.waIncludeExams !== false);

  // Page Access (Maintenance Mode) state (Phase 7)
  const defaultPageAccess = useMemo(() => ({
    cash: { isEnabled: true, reason: '' },
    tasks: { isEnabled: true, reason: '' },
    exams: { isEnabled: true, reason: '' },
    schedules: { isEnabled: true, reason: '' },
    announcements: { isEnabled: true, reason: '' }
  }), []);

  const [pageAccessDraft, setPageAccessDraft] = useState(() => ({
    ...defaultPageAccess,
    ...(data?.pageAccess || {})
  }));

  useEffect(() => {
    if (data?.pageAccess) {
      setPageAccessDraft(prev => ({
        ...defaultPageAccess,
        ...data.pageAccess
      }));
    }
  }, [data?.pageAccess, defaultPageAccess]);

  const handleTogglePageAccess = (pageKey) => {
    setPageAccessDraft(prev => {
      const current = prev[pageKey] || { isEnabled: true, reason: '' };
      return {
        ...prev,
        [pageKey]: {
          ...current,
          isEnabled: !current.isEnabled
        }
      };
    });
  };

  const handleReasonPageAccessChange = (pageKey, reason) => {
    setPageAccessDraft(prev => {
      const current = prev[pageKey] || { isEnabled: true, reason: '' };
      return {
        ...prev,
        [pageKey]: {
          ...current,
          reason
        }
      };
    });
  };

  const handleSavePageAccess = (e) => {
    e.preventDefault();
    if (updateBulkPageAccess) {
      updateBulkPageAccess(pageAccessDraft);
    }
    showToast('Status akses halaman siswa berhasil disimpan!', 'success');
  };

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

      setWaGreeting(data.classInfo.waGreeting !== undefined ? data.classInfo.waGreeting : DEFAULT_WA_GREETING);
      setWaBannerTitle(data.classInfo.waBannerTitle || DEFAULT_WA_BANNER_TITLE);
      setWaFooterNote(data.classInfo.waFooterNote !== undefined ? data.classInfo.waFooterNote : DEFAULT_WA_FOOTER_NOTE);
      setWaClosing(data.classInfo.waClosing !== undefined ? data.classInfo.waClosing : DEFAULT_WA_CLOSING);
      setWaIncludeSchedule(data.classInfo.waIncludeSchedule !== false);
      setWaIncludeTasks(data.classInfo.waIncludeTasks !== false);
      setWaIncludePiket(data.classInfo.waIncludePiket !== false);
      setWaIncludeExams(data.classInfo.waIncludeExams !== false);
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

  // Filtered exams and events for Ujian & Agenda (Phase 5)
  const todayDateStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingExamsCount = useMemo(() => {
    return exams.filter(ex => {
      if (!ex.examDate) return false;
      const d = new Date(ex.examDate);
      return !isNaN(d.getTime()) && d >= todayDateStart;
    }).length;
  }, [exams, todayDateStart]);

  const passedExamsCount = useMemo(() => {
    return exams.length - upcomingExamsCount;
  }, [exams, upcomingExamsCount]);

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const q = examSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (exam.title || '').toLowerCase().includes(q) ||
        (exam.subject || '').toLowerCase().includes(q) ||
        (exam.scope || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (examFilterStatus === 'all') return true;
      const d = new Date(exam.examDate);
      const isUpcoming = !isNaN(d.getTime()) && d >= todayDateStart;
      return examFilterStatus === 'upcoming' ? isUpcoming : !isUpcoming;
    });
  }, [exams, examSearchQuery, examFilterStatus, todayDateStart]);

  const eventsList = data.events || [];
  const upcomingEventsCount = useMemo(() => {
    return eventsList.filter(ev => {
      if (!ev.date) return false;
      const d = new Date(ev.date);
      return !isNaN(d.getTime()) && d >= todayDateStart;
    }).length;
  }, [eventsList, todayDateStart]);

  const passedEventsCount = useMemo(() => {
    return eventsList.length - upcomingEventsCount;
  }, [eventsList, upcomingEventsCount]);

  const filteredEvents = useMemo(() => {
    return eventsList.filter(ev => {
      const q = eventSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (ev.title || '').toLowerCase().includes(q) ||
        (ev.desc || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (eventFilterStatus === 'all') return true;
      const d = new Date(ev.date);
      const isUpcoming = !isNaN(d.getTime()) && d >= todayDateStart;
      return eventFilterStatus === 'upcoming' ? isUpcoming : !isUpcoming;
    });
  }, [eventsList, eventSearchQuery, eventFilterStatus, todayDateStart]);

  // Filtered tasks & counts (Admin-only checklist & 7-day auto-purge)
  const activeTasksCount = useMemo(() => {
    return tasks.filter(t => !t.isCompleted).length;
  }, [tasks]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter(t => t.isCompleted).length;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = taskSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (task.title || '').toLowerCase().includes(q) ||
        (task.subject || '').toLowerCase().includes(q) ||
        (task.description || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (taskFilterStatus === 'all') return true;
      return taskFilterStatus === 'completed' ? Boolean(task.isCompleted) : !task.isCompleted;
    });
  }, [tasks, taskSearchQuery, taskFilterStatus]);

  // Filtered announcements (Phase 6)
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const q = annSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (ann.title || '').toLowerCase().includes(q) ||
        (ann.content || '').toLowerCase().includes(q) ||
        (ann.category || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (annFilterCat === 'all') return true;
      return (ann.category || '').toLowerCase() === annFilterCat.toLowerCase();
    });
  }, [announcements, annSearchQuery, annFilterCat]);

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

  // Edit Task handlers
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

  // Edit Exam handlers
  const handleOpenEditExam = (exam) => {
    setSelectedExamForEdit(exam);
    setEditExamSubject(exam.subject || '');
    setEditExamTitle(exam.title || '');
    setEditExamDate(formatForDatetimeLocal(exam.examDate));
    setEditExamScope(exam.scope || '');
    setIsEditExamOpen(true);
  };

  const handleUpdateExam = (e) => {
    e.preventDefault();
    if (!selectedExamForEdit) return;
    updateExam(selectedExamForEdit.id, {
      subject: editExamSubject.trim(),
      title: editExamTitle.trim(),
      examDate: editExamDate,
      scope: editExamScope.trim()
    });
    setIsEditExamOpen(false);
    showToast(`Jadwal ujian "${editExamTitle.trim()}" berhasil diperbarui!`, 'success');
  };

  // Edit Event handlers
  const handleOpenEditEvent = (ev) => {
    setSelectedEventForEdit(ev);
    setEditEventTitle(ev.title || '');
    setEditEventDate(ev.date || '');
    setEditEventDesc(ev.desc || '');
    setEditEventType(ev.type || 'event');
    setIsEditEventOpen(true);
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    if (!selectedEventForEdit) return;
    if (!editEventTitle.trim() || !editEventDate) {
      showToast('Mohon lengkapi nama kegiatan dan tanggal agenda.', 'warning');
      return;
    }
    updateEvent(selectedEventForEdit.id, {
      title: editEventTitle.trim(),
      date: editEventDate,
      desc: editEventDesc.trim(),
      type: editEventType
    });
    setIsEditEventOpen(false);
    showToast(`Agenda "${editEventTitle.trim()}" berhasil diperbarui!`, 'success');
  };

  // Edit Announcement handlers
  const handleOpenEditAnn = (ann) => {
    setSelectedAnnForEdit(ann);
    setEditAnnCat(ann.category || 'akademik');
    setEditAnnTitle(ann.title || '');
    setEditAnnContent(ann.content || '');
    setIsEditAnnOpen(true);
  };

  const handleUpdateAnn = (e) => {
    e.preventDefault();
    if (!selectedAnnForEdit) return;
    updateAnnouncement(selectedAnnForEdit.id, {
      category: editAnnCat,
      title: editAnnTitle.trim(),
      content: editAnnContent.trim()
    });
    setIsEditAnnOpen(false);
    showToast(`Pengumuman "${editAnnTitle.trim()}" berhasil diperbarui!`, 'success');
  };

  // WhatsApp Brief default settings handlers
  const handleSaveWaBriefSettings = (e) => {
    e.preventDefault();
    updateClassInfo({
      waGreeting: waGreeting.trim(),
      waBannerTitle: waBannerTitle.trim() || DEFAULT_WA_BANNER_TITLE,
      waFooterNote: waFooterNote.trim(),
      waClosing: waClosing.trim(),
      waIncludeSchedule,
      waIncludeTasks,
      waIncludePiket,
      waIncludeExams
    });
    showToast('Format default WhatsApp Brief berhasil disimpan! 📲', 'success');
  };

  const handleResetWaBriefSettings = () => {
    setWaGreeting(DEFAULT_WA_GREETING);
    setWaBannerTitle(DEFAULT_WA_BANNER_TITLE);
    setWaFooterNote(DEFAULT_WA_FOOTER_NOTE);
    setWaClosing(DEFAULT_WA_CLOSING);
    setWaIncludeSchedule(true);
    setWaIncludeTasks(true);
    setWaIncludePiket(true);
    setWaIncludeExams(true);

    updateClassInfo({
      waGreeting: DEFAULT_WA_GREETING,
      waBannerTitle: DEFAULT_WA_BANNER_TITLE,
      waFooterNote: DEFAULT_WA_FOOTER_NOTE,
      waClosing: DEFAULT_WA_CLOSING,
      waIncludeSchedule: true,
      waIncludeTasks: true,
      waIncludePiket: true,
      waIncludeExams: true
    });
    showToast('Format WhatsApp Brief dikembalikan ke bawaan.', 'info');
  };

  // Dynamic preview text for WhatsApp Brief settings
  const previewBriefText = useMemo(() => {
    const lines = [];
    if (waGreeting.trim()) {
      lines.push(waGreeting.trim());
      lines.push('');
    }
    lines.push(`📚 *${(waBannerTitle.trim() || DEFAULT_WA_BANNER_TITLE)} — BESOK*`);
    lines.push(`🗓️ ${formatDateIndo(new Date(Date.now() + 86400000).toISOString().split('T')[0])}`);
    lines.push(`━━━━━━━━━━━━━━━━━━`);

    if (waIncludeSchedule) {
      lines.push('');
      lines.push(`📅 *JADWAL BESOK*`);
      lines.push(`1. Bahasa Indonesia`);
      lines.push(`2. Pemrograman Web`);
    }

    if (waIncludeTasks) {
      lines.push('');
      lines.push(`📝 *DEADLINE BESOK*`);
      lines.push(`1. Pemrograman Web — Praktikum REST API`);
    }

    if (waIncludePiket) {
      lines.push('');
      lines.push(`🧹 *PIKET BESOK*`);
      lines.push(`1. Ahmad Fikry Al Khair`);
      lines.push(`2. Ardyansyah`);
    }

    if (waIncludeExams) {
      lines.push('');
      lines.push(`🎯 *UJIAN TERDEKAT*`);
      lines.push(`1. Basis Data (Jumat, 2 Okt)`);
    }

    lines.push('');
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    if (waFooterNote.trim()) {
      lines.push(waFooterNote.trim());
      lines.push('');
    }
    if (waClosing.trim()) {
      lines.push(waClosing.trim());
    }
    return lines.join('\n');
  }, [waGreeting, waBannerTitle, waFooterNote, waClosing, waIncludeSchedule, waIncludeTasks, waIncludePiket, waIncludeExams]);

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

      {/* TAB 1: OVERVIEW & STATS (FLAT MINIMALIST & TO-THE-POINT) */}
      {activeTab === 'overview' && (
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
                onClick={() => setIsAddTaskOpen(true)}
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
                onClick={() => (propSetIsWhatsAppOpen ? propSetIsWhatsAppOpen(true) : setIsWhatsAppModalOpen(true))}
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
                onAction={() => setIsAddTaskOpen(true)}
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
                      {/* Checkbox Selesai & Info Utama (Two-Tier Clean) */}
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

                      {/* ActionMenu Sentris (Hanya 1 tombol 3-dot) */}
                      <div style={{ flexShrink: 0 }}>
                        <ActionMenu
                          align="right"
                          items={[
                            {
                              label: 'Kirim ke WhatsApp',
                              icon: <MessageCircle size={14} color="#16A34A" />,
                              onClick: () => handleSendTaskToWA(task)
                            },
                            {
                              label: task.link ? 'Salin Link Tugas' : 'Salin Info Tugas',
                              icon: <Copy size={14} />,
                              onClick: () => (task.link ? handleCopyLink(task.link) : handleCopyTaskInfo(task))
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
      )}


      {/* TAB 2: KELOLA TUGAS (FLAT MINIMALIST ROW LIST) */}
      {activeTab === 'tasks' && (
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

                      {/* ActionMenu Sentris (Hanya 1 Tombol Titik Tiga) */}
                      <div style={{ flexShrink: 0 }}>
                        <ActionMenu
                          align="right"
                          items={[
                            {
                              label: 'Bagikan ke WhatsApp',
                              icon: <MessageCircle size={14} color="#16A34A" />,
                              onClick: () => handleSendTaskToWA(task)
                            },
                            {
                              label: task.link ? 'Salin Link Tugas' : 'Salin Info Tugas',
                              icon: <Copy size={14} />,
                              onClick: () => (task.link ? handleCopyLink(task.link) : handleCopyTaskInfo(task))
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
        </div>
      )}

      {/* TAB 3: KELOLA UJIAN & AGENDA (FLAT MINIMALIST ROW LIST) */}
      {activeTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Card with Sub-tabs, Controls and Lists */}
          <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.2rem'
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {examSubTab === 'exams' ? 'Jadwal Ujian & Ulangan Harian' : 'Agenda & Kalender Kelas'}
              </h2>

              {/* Action Button */}
              {examSubTab === 'exams' ? (
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(true)}
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
                  <span>Tambah Ujian</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(true)}
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
                  <span>Tambah Agenda</span>
                </button>
              )}
            </div>

            {/* Sub-tab Navigation (Ujian vs Agenda) */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setExamSubTab('exams')}
                className={`btn btn-sm ${examSubTab === 'exams' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  gap: '0.4rem',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <BookOpen size={14} />
                <span>Jadwal Ujian ({exams.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setExamSubTab('events')}
                className={`btn btn-sm ${examSubTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  gap: '0.4rem',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <Calendar size={14} />
                <span>Agenda Kelas ({eventsList.length})</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            {examSubTab === 'exams' ? (
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
                  value={examSearchQuery}
                  onChange={(e) => setExamSearchQuery(e.target.value)}
                  onClear={() => setExamSearchQuery('')}
                  placeholder="Cari mata pelajaran, judul ujian, materi..."
                  style={{ maxWidth: '320px', height: '36px' }}
                />
                <FilterPills
                  options={[
                    { value: 'all', label: `Semua (${exams.length})` },
                    { value: 'upcoming', label: `Mendatang (${upcomingExamsCount})` },
                    { value: 'passed', label: `Sudah Lewat (${passedExamsCount})` }
                  ]}
                  activeValue={examFilterStatus}
                  onChange={setExamFilterStatus}
                />
              </div>
            ) : (
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
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  onClear={() => setEventSearchQuery('')}
                  placeholder="Cari judul kegiatan, keterangan..."
                  style={{ maxWidth: '320px', height: '36px' }}
                />
                <FilterPills
                  options={[
                    { value: 'all', label: `Semua (${eventsList.length})` },
                    { value: 'upcoming', label: `Mendatang (${upcomingEventsCount})` },
                    { value: 'passed', label: `Sudah Lewat (${passedEventsCount})` }
                  ]}
                  activeValue={eventFilterStatus}
                  onChange={setEventFilterStatus}
                />
              </div>
            )}

            {/* Content Lists */}
            {examSubTab === 'exams' ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredExams.length === 0 ? (
                  <EmptyState
                    title={examSearchQuery || examFilterStatus !== 'all' ? 'Jadwal Ujian Tidak Ditemukan' : 'Belum Ada Jadwal Ujian'}
                    actionLabel="+ Tambah Ujian"
                    onAction={() => setIsAddExamOpen(true)}
                  />
                ) : (
                  filteredExams.map((exam, idx) => {
                    const deadlineStatus = getDeadlineStatus(exam.examDate);
                    return (
                      <div
                        key={exam.id}
                        style={{
                          padding: '0.95rem 0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.85rem',
                          borderBottom: idx === filteredExams.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                          transition: 'background-color var(--transition-fast)'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                            {exam.title}
                          </h3>

                          {/* Two-Tier Metadata */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: 600 }}>
                              {exam.subject}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                              <Calendar size={12} />
                              {formatDateTimeIndo(exam.examDate)}
                            </span>
                            {deadlineStatus.urgency !== 'neutral' && (
                              <StatusBadge variant={deadlineStatus.urgency} size="sm" dot>
                                {deadlineStatus.label}
                              </StatusBadge>
                            )}
                          </div>

                          {exam.scope && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.25rem' }}>
                              <span style={{ fontWeight: 500, flexShrink: 0 }}>Materi:</span>
                              <span style={{ wordBreak: 'break-word' }}>{exam.scope}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          <ActionMenu
                            align="right"
                            items={[
                              {
                                label: 'Edit Ujian',
                                icon: <Edit3 size={14} />,
                                onClick: () => handleOpenEditExam(exam)
                              },
                              {
                                label: 'Hapus Ujian',
                                icon: <Trash2 size={14} />,
                                variant: 'danger',
                                onClick: () => setExamToDelete(exam)
                              }
                            ]}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredEvents.length === 0 ? (
                  <EmptyState
                    title={eventSearchQuery || eventFilterStatus !== 'all' ? 'Agenda Tidak Ditemukan' : 'Belum Ada Agenda Kelas'}
                    actionLabel="+ Tambah Agenda"
                    onAction={() => setIsAddEventOpen(true)}
                  />
                ) : (
                  filteredEvents.map((ev, idx) => {
                    const evDeadline = getDeadlineStatus(ev.date);
                    return (
                      <div
                        key={ev.id}
                        style={{
                          padding: '0.95rem 0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.85rem',
                          borderBottom: idx === filteredEvents.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                          transition: 'background-color var(--transition-fast)'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                            {ev.title}
                          </h3>

                          {/* Two-Tier Metadata */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                              <Calendar size={12} />
                              {formatDateIndo(ev.date, { withDay: true, monthFormat: 'long' })}
                            </span>
                            {evDeadline.urgency !== 'neutral' && (
                              <StatusBadge variant={evDeadline.urgency} size="sm" dot>
                                {evDeadline.label}
                              </StatusBadge>
                            )}
                          </div>

                          {ev.desc && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', lineHeight: 1.45, wordBreak: 'break-word' }}>
                              {ev.desc}
                            </p>
                          )}
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          <ActionMenu
                            align="right"
                            items={[
                              {
                                label: 'Edit Agenda',
                                icon: <Edit3 size={14} />,
                                onClick: () => handleOpenEditEvent(ev)
                              },
                              {
                                label: 'Hapus Agenda',
                                icon: <Trash2 size={14} />,
                                variant: 'danger',
                                onClick: () => setEventToDelete(ev)
                              }
                            ]}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
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
                style={{ fontWeight: 600, padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)' }}
              >
                Hari {day}
              </button>
            ))}
          </div>

          {/* Selected Day Subjects */}
          <div className="card" style={{ padding: '1.25rem 1.4rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.65rem' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
                Daftar Pelajaran — Hari {selectedDay}
              </h3>
              <button onClick={() => setIsAddSubjectOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem', whiteSpace: 'nowrap' }}>
                <Plus size={14} />
                <span>Tambah Jam Pelajaran</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {((data.schedules[selectedDay]?.subjects) || []).map((sub, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  gap: '0.65rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 180px', minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', width: '24px', flexShrink: 0 }}>#{idx + 1}</span>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', wordBreak: 'break-word', minWidth: 0 }}>{sub.subject}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
                    <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {sub.timeStart} - {sub.timeEnd}
                    </span>
                    <button
                      onClick={() => handleDeleteSubject(idx)}
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--danger)', padding: '0.25rem', flexShrink: 0 }}
                      title="Hapus jam ini"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Piket Team Editor for Selected Day */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
                  Regu Piket Kebersihan ({selectedDay})
                </h4>
                <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  {(data.schedules[selectedDay]?.piket || []).length} Siswa Bertugas
                </span>
              </div>

              {/* Active Piket Member Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem', minHeight: '34px', alignItems: 'center' }}>
                {(data.schedules[selectedDay]?.piket || []).length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Belum ada anggota piket untuk hari {selectedDay}.
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
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--hover-bg)',
                        border: '1px solid var(--border-subtle)',
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

            {/* Piket MBG (Makan Bergizi Gratis) Team Editor for Selected Day */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Utensils size={16} color="var(--primary)" />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                    Regu Piket MBG — Hari {selectedDay}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kembalikan jadwal Piket MBG ke default 6 siswa per hari?')) {
                      resetMbgToDefault();
                      showToast('Jadwal Piket MBG di-reset ke default', 'info');
                    }
                  }}
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
                >
                  Reset Default
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* 1. Pengambil */}
                <div style={{ backgroundColor: 'var(--bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Utensils size={13} />
                      <span>Tim Pengambil (11.30 WIB)</span>
                    </span>
                    <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                      {(data.piketMbg?.[selectedDay]?.ambil || []).length} / 3 Siswa
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem', minHeight: '32px', alignItems: 'center' }}>
                    {(data.piketMbg?.[selectedDay]?.ambil || []).length === 0 ? (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum ada pengambil.</span>
                    ) : (
                      (data.piketMbg?.[selectedDay]?.ambil || []).map(name => (
                        <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 500, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                          <span>{name}</span>
                          <button type="button" onClick={() => removeMbgMember(selectedDay, 'ambil', name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}>
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <select
                    className="form-input"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addMbgMember(selectedDay, 'ambil', e.target.value);
                        showToast(`${e.target.value} ditambahkan ke Pengambil MBG`, 'success');
                      }
                    }}
                    style={{ fontSize: '0.8rem', cursor: 'pointer', padding: '0.35rem 0.55rem' }}
                  >
                    <option value="">+ Tambah Petugas Pengambil...</option>
                    {members
                      .filter(m => !(data.piketMbg?.[selectedDay]?.ambil || []).includes(m.name))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(m => (
                        <option key={m.id} value={m.name}>#{m.absentNo} - {m.name}</option>
                      ))}
                  </select>
                </div>

                {/* 2. Pengembali */}
                <div style={{ backgroundColor: 'var(--bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RotateCcw size={13} />
                      <span>Tim Pengembali (12.30 WIB)</span>
                    </span>
                    <span className="notion-tag notion-tag-green" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                      {(data.piketMbg?.[selectedDay]?.balikin || []).length} / 3 Siswa
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem', minHeight: '32px', alignItems: 'center' }}>
                    {(data.piketMbg?.[selectedDay]?.balikin || []).length === 0 ? (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum ada pengembali.</span>
                    ) : (
                      (data.piketMbg?.[selectedDay]?.balikin || []).map(name => (
                        <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 500, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                          <span>{name}</span>
                          <button type="button" onClick={() => removeMbgMember(selectedDay, 'balikin', name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}>
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <select
                    className="form-input"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addMbgMember(selectedDay, 'balikin', e.target.value);
                        showToast(`${e.target.value} ditambahkan ke Pengembali MBG`, 'success');
                      }
                    }}
                    style={{ fontSize: '0.8rem', cursor: 'pointer', padding: '0.35rem 0.55rem' }}
                  >
                    <option value="">+ Tambah Petugas Pengembali...</option>
                    {members
                      .filter(m => !(data.piketMbg?.[selectedDay]?.balikin || []).includes(m.name))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(m => (
                        <option key={m.id} value={m.name}>#{m.absentNo} - {m.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: KEUANGAN & MATRIKS KAS */}
      {activeTab === 'cash' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Top Cash Balance Info */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Saldo Kas</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.15rem 0', letterSpacing: '-0.02em' }}>
                Rp {Number(cashStats.balance).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Pemasukan <strong style={{ color: 'var(--tag-green-text)' }}>+Rp {Number(cashStats.income).toLocaleString('id-ID')}</strong> &nbsp;·&nbsp; Pengeluaran <strong style={{ color: 'var(--danger)' }}>-Rp {Number(cashStats.expense).toLocaleString('id-ID')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setPeriodMonth(selectedDuesMonth || getCurrentMonthKey());
                  setIsAddPeriodOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} />
                <span>Periode Iuran</span>
              </button>
              <button onClick={() => setIsAddTxOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}>
                <Plus size={14} />
                <span>Catat Transaksi</span>
              </button>
            </div>
          </div>

          {/* Dues Matrix Table */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Matriks Iuran Kas
                </h3>
                {/* Mini Recap */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.2rem 0.6rem',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--tag-green-text)' }}>
                    {selectedMonthPaidAllCount} Lunas
                  </span>
                  <span>·</span>
                  <span style={{ fontWeight: 600, color: selectedMonthUnpaidCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
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

            {/* Matrix Table with Zebra Striping & Sticky Weeks Header */}
            <div style={{
              overflowX: 'auto',
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              maxHeight: 'min(560px, 70vh)',
              position: 'relative',
              WebkitOverflowScrolling: 'touch'
            }}>
              <table
                className="notion-table zebra-kas-table"
                style={{
                  width: `${Math.max(700, 56 + 190 + monthlyDuesPeriods.length * 130)}px`,
                  minWidth: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}
              >
                <thead style={{ position: 'sticky', top: 0, zIndex: 25 }}>
                  <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <th style={{ width: '56px', minWidth: '56px', maxWidth: '56px', textAlign: 'center', padding: '0.85rem 0.65rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg-surface)' }}>#</th>
                    <th style={{ width: '190px', minWidth: '190px', maxWidth: '190px', textAlign: 'left', padding: '0.85rem 1rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg-surface)' }}>Nama Siswa</th>
                    {monthlyDuesPeriods.map(p => {
                      const periodPaidCount = (p.paidStudentIds || []).length;
                      const isAllPaid = totalMembers > 0 && periodPaidCount === totalMembers;

                      return (
                        <th key={p.id} style={{ width: '130px', minWidth: '130px', maxWidth: '130px', textAlign: 'center', padding: '0.85rem 0.75rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg-surface)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
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
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0.3rem 0', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            Rp {Number(p.amount || 0).toLocaleString('id-ID')}
                          </div>
                          <button
                            type="button"
                            disabled={isAllPaid}
                            onClick={() => setPeriodToMarkAllPaid(p)}
                            style={{
                              background: isAllPaid ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-hover)',
                              border: `1px solid ${isAllPaid ? 'rgba(22, 163, 74, 0.2)' : 'var(--border-subtle)'}`,
                              borderRadius: 'var(--radius-xs)',
                              padding: '0.18rem 0.45rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: isAllPaid ? '#16A34A' : 'var(--text-secondary)',
                              cursor: isAllPaid ? 'default' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              whiteSpace: 'nowrap'
                            }}
                            title={isAllPaid ? 'Seluruh siswa telah lunas' : `Tandai seluruh siswa lunas pada ${p.name}`}
                          >
                            <CheckCircle2 size={11} />
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
                      <td colSpan={2} style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                        <EmptyState
                          title="Belum Ada Periode Kas"
                        />
                      </td>
                    </tr>
                  ) : filteredDuesMembers.length === 0 ? (
                    <tr>
                      <td colSpan={2 + monthlyDuesPeriods.length} style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                        <EmptyState
                          title="Siswa Tidak Ditemukan"
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredDuesMembers.map((m, idx) => {
                      const isOdd = idx % 2 === 1;
                      return (
                        <tr
                          key={m.id}
                          className={isOdd ? 'zebra-kas-row-odd' : 'zebra-kas-row-even'}
                          style={{
                            backgroundColor: isOdd ? 'var(--zebra-kas-odd)' : 'var(--zebra-kas-even)',
                            borderBottom: '1px solid var(--border-subtle)'
                          }}
                        >
                          <td style={{ width: '56px', minWidth: '56px', maxWidth: '56px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', textAlign: 'center', padding: '0.85rem 0.65rem' }}>
                            {String(m.absentNo || 0).padStart(2, '0')}
                          </td>
                          <td style={{ width: '190px', minWidth: '190px', maxWidth: '190px', padding: '0.85rem 1rem' }}>
                            <strong
                              className="kas-student-name"
                              title={m.name}
                              style={{
                                display: 'block',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: 'var(--text-primary)',
                                fontSize: '0.88rem',
                                fontWeight: 600
                              }}
                            >
                              {m.name}
                            </strong>
                          </td>
                          {monthlyDuesPeriods.map(p => {
                            const isPaid = (p.paidStudentIds || []).includes(m.id);
                            return (
                              <td key={p.id} style={{ width: '130px', minWidth: '130px', maxWidth: '130px', textAlign: 'center', padding: '0.85rem 0.75rem' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleDuesPaid(p.id, m.id);
                                    showToast(`${m.name} di ${p.name} diperbarui!`, 'success');
                                  }}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '4px',
                                    border: isPaid ? '1px solid var(--tag-green-text)' : '1px solid var(--border)',
                                    backgroundColor: isPaid ? 'var(--tag-green-bg)' : 'transparent',
                                    color: isPaid ? 'var(--tag-green-text)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title={`Klik untuk ganti status ${m.name} (${isPaid ? 'Lunas' : 'Belum'})`}
                                >
                                  <Check size={14} strokeWidth={2.2} />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.85rem 0', color: 'var(--text-primary)' }}>
              Buku Kas & Riwayat Transaksi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {transactions.length === 0 ? (
                <EmptyState
                  title="Belum Ada Transaksi"
                />
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.75rem'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {formatDateIndo(tx.date)} &nbsp;·&nbsp; {tx.category} &nbsp;·&nbsp; {tx.recordedBy}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: tx.type === 'income' ? 'var(--tag-green-text)' : 'var(--danger)' }}>
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

      {/* TAB 6: PENGUMUMAN KELAS (FASE 6) */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1rem'
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Pengumuman Kelas
              </h2>
              <button
                type="button"
                onClick={() => setIsAddAnnOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem', fontWeight: 600 }}
              >
                <Plus size={15} />
                <span>Tulis Pengumuman</span>
              </button>
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
                value={annSearchQuery}
                onChange={(e) => setAnnSearchQuery(e.target.value)}
                onClear={() => setAnnSearchQuery('')}
                placeholder="Cari judul atau isi pengumuman..."
                style={{ maxWidth: '300px', height: '36px' }}
              />
              <FilterPills
                options={[
                  { value: 'all', label: `Semua (${announcements.length})` },
                  { value: 'penting', label: 'Penting' },
                  { value: 'akademik', label: 'Akademik' },
                  { value: 'kegiatan', label: 'Kegiatan' },
                  { value: 'keuangan', label: 'Keuangan' }
                ]}
                activeValue={annFilterCat}
                onChange={setAnnFilterCat}
              />
            </div>

            {/* Announcement Card List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredAnnouncements.length === 0 ? (
                <EmptyState
                  title={annSearchQuery || annFilterCat !== 'all' ? 'Pengumuman Tidak Ditemukan' : 'Belum Ada Pengumuman'}
                  actionLabel="+ Tulis Pengumuman"
                  onAction={() => setIsAddAnnOpen(true)}
                />
              ) : (
                filteredAnnouncements.map(ann => {
                  const getCategoryClass = (cat) => {
                    switch ((cat || '').toLowerCase()) {
                      case 'penting': return 'notion-tag-red';
                      case 'akademik': return 'notion-tag-blue';
                      case 'kegiatan': return 'notion-tag-green';
                      case 'keuangan': return 'notion-tag-yellow';
                      default: return 'notion-tag-gray';
                    }
                  };

                  return (
                    <div
                      key={ann.id}
                      style={{
                        padding: '1rem 1.15rem',
                        backgroundColor: ann.isPinned ? 'var(--bg-hover)' : 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span
                            className={`notion-tag ${getCategoryClass(ann.category)}`}
                            style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            {ann.category}
                          </span>
                          {ann.isPinned && (
                            <span
                              className="notion-tag notion-tag-orange"
                              style={{ fontSize: '0.7rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <Pin size={11} />
                              <span>Disematkan</span>
                            </span>
                          )}
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {ann.createdAt ? formatCompactDateTime(ann.createdAt) : ''}
                            {ann.author ? ` · Oleh ${ann.author}` : ''}
                          </span>
                        </div>

                        <ActionMenu
                          items={[
                            {
                              label: 'Edit Pengumuman',
                              icon: <Edit3 size={14} />,
                              onClick: () => handleOpenEditAnn(ann)
                            },
                            {
                              label: ann.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas',
                              icon: ann.isPinned ? <PinOff size={14} /> : <Pin size={14} />,
                              onClick: () => {
                                togglePinAnnouncement(ann.id);
                                showToast(ann.isPinned ? 'Pin dilepas' : 'Pengumuman disematkan di atas', 'info');
                              }
                            },
                            {
                              label: 'Hapus Pengumuman',
                              icon: <Trash2 size={14} />,
                              variant: 'danger',
                              onClick: () => setAnnToDelete(ann)
                            }
                          ]}
                        />
                      </div>

                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        {ann.title}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {ann.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DATA SISWA & JABATAN */}
      {activeTab === 'members' && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
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
              style={{ fontWeight: 600, gap: '0.35rem' }}
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
          <div className="admin-members-desktop-view" style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <table className="notion-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                  <th style={{ width: '45px', textAlign: 'center', padding: '0.75rem 0.85rem' }}>#</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Nama Siswa</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>WhatsApp</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Jabatan</th>
                  <th style={{ width: '50px', textAlign: 'center', padding: '0.75rem 0.85rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2.5rem 1rem' }}>
                      <EmptyState
                        title={memberSearchQuery || memberRoleFilter !== 'all' ? "Siswa Tidak Ditemukan" : "Belum Ada Siswa"}
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
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', padding: '0.75rem 0.85rem', fontSize: '0.82rem' }}>
                          {String(m.absentNo || 0).padStart(2, '0')}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600 }}>{m.name}</strong>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          {m.phone ? (
                            <a
                              href={`https://wa.me/${waFormatted}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: '#16a34a',
                                fontWeight: 500,
                                fontSize: '0.8rem',
                                textDecoration: 'none',
                                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid rgba(22, 163, 74, 0.2)'
                              }}
                              title={`Chat WhatsApp dengan ${m.name}`}
                            >
                              <Phone size={11} strokeWidth={2.2} />
                              <span>{m.phone}</span>
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          {hasSpecialRole ? (
                            <span className="notion-tag notion-tag-orange" style={{ fontWeight: 600, fontSize: '0.74rem' }}>
                              {m.roleTitle}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '0.75rem 0.85rem' }}>
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
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        #{String(m.absentNo || 0).padStart(2, '0')}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {m.name}
                        </div>

                        {hasSpecialRole && (
                          <div style={{ marginTop: '0.15rem' }}>
                            <span
                              className="notion-tag notion-tag-orange"
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '0.1rem 0.4rem'
                              }}
                            >
                              {m.roleTitle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      {m.phone && (
                        <a
                          href={`https://wa.me/${waFormatted}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Chat WhatsApp dengan ${m.name}`}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'rgba(22, 163, 74, 0.08)',
                            border: '1px solid rgba(22, 163, 74, 0.2)',
                            color: '#16A34A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none'
                          }}
                          title={`Chat WhatsApp dengan ${m.name}`}
                        >
                          <Phone size={13} strokeWidth={2.2} />
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
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Identitas & Branding Kelas</h3>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Logo / Foto Kelas Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-soft)',
                  border: '1px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {settingsLogoUrl ? (
                    <img src={settingsLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Camera size={26} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Logo / Foto Kelas
                  </label>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', gap: '0.35rem', fontWeight: 600 }}>
                      <Upload size={14} />
                      <span>{isProcessingSettingsImg ? 'Memproses...' : 'Pilih Foto'}</span>
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
                  Atau URL Gambar Eksternal
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
                  <label className="form-label" style={{ fontWeight: 600 }}>Nama Web / Aplikasi</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ClassHub"
                    value={settingsAppName}
                    onChange={(e) => setSettingsAppName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Nama Kelas</label>
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
                <label className="form-label" style={{ fontWeight: 600 }}>Nama Sekolah</label>
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
                  <label className="form-label" style={{ fontWeight: 600 }}>Tahun Ajaran</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="2026/2027"
                    value={settingsAcademicYear}
                    onChange={(e) => setSettingsAcademicYear(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Wali Kelas</label>
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
              <div className="form-group" style={{ marginBottom: 0, paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Master PIN Pengurus</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masukkan PIN"
                  value={settingsAdminPin}
                  onChange={(e) => setSettingsAdminPin(e.target.value)}
                  style={{ maxWidth: '280px', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 600, padding: '0.55rem 1.25rem' }}>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          {/* CARD 2: KONTROL STATUS & MAINTENANCE HALAMAN SISWA (FASE 7) */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Kontrol Akses & Pemeliharaan Modul</h3>
              </div>
              <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                Akses Siswa
              </span>
            </div>

            <form onSubmit={handleSavePageAccess} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  {
                    key: 'cash',
                    name: 'Kas & Keuangan Kelas',
                    icon: Wallet,
                    defaultReason: 'Bendahara sedang melakukan audit dan rekonsiliasi buku kas.'
                  },
                  {
                    key: 'tasks',
                    name: 'Daftar Tugas Kelas',
                    icon: BookOpen,
                    defaultReason: 'Pengurus kelas sedang memperbarui tenggat waktu dan daftar tugas.'
                  },
                  {
                    key: 'exams',
                    name: 'Jadwal Ujian',
                    icon: CalendarDays,
                    defaultReason: 'Jadwal ujian sedang direvisi oleh kurikulum sekolah.'
                  },
                  {
                    key: 'schedules',
                    name: 'Jadwal Pelajaran & Piket',
                    icon: Calendar,
                    defaultReason: 'Jadwal pelajaran sedang disesuaikan untuk semester berjalan.'
                  },
                  {
                    key: 'announcements',
                    name: 'Pengumuman Kelas',
                    icon: Megaphone,
                    defaultReason: 'Pengumuman kelas sedang dipersiapkan oleh wali kelas.'
                  }
                ].map(mod => {
                  const Icon = mod.icon;
                  const modStatus = pageAccessDraft[mod.key] || { isEnabled: true, reason: '' };
                  const isEnabled = modStatus.isEnabled !== false;

                  return (
                    <div
                      key={mod.key}
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: isEnabled ? 'var(--bg-surface)' : 'rgba(239, 68, 68, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                        border: isEnabled ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '200px', flex: 1 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: isEnabled ? 'var(--bg-hover)' : 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isEnabled ? 'var(--text-secondary)' : 'var(--danger)',
                            flexShrink: 0
                          }}>
                            <Icon size={16} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                              {mod.name}
                            </h4>
                            {isEnabled ? (
                              <StatusBadge variant="success" size="sm">Aktif</StatusBadge>
                            ) : (
                              <StatusBadge variant="danger" size="sm">Pemeliharaan</StatusBadge>
                            )}
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePageAccess(mod.key)}
                          className={`btn ${isEnabled ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.3rem 0.75rem',
                            backgroundColor: isEnabled ? 'transparent' : 'var(--danger)',
                            borderColor: isEnabled ? 'var(--border-subtle)' : 'var(--danger)',
                            color: isEnabled ? 'var(--text-secondary)' : '#FFFFFF'
                          }}
                        >
                          {isEnabled ? 'Matikan Akses' : 'Aktifkan'}
                        </button>
                      </div>

                      {/* Expanded reason textarea when disabled */}
                      {!isEnabled && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed rgba(239, 68, 68, 0.2)' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                            <ShieldAlert size={12} />
                            <span>Pesan untuk Siswa:</span>
                          </label>
                          <textarea
                            className="form-textarea"
                            rows={2}
                            placeholder={mod.defaultReason}
                            value={modStatus.reason || ''}
                            onChange={(e) => handleReasonPageAccessChange(mod.key, e.target.value)}
                            style={{ fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}
                >
                  Simpan Status Modul
                </button>
              </div>
            </form>
          </div>

          {/* CARD 3: PENGATURAN DEFAULT WHATSAPP BRIEF */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Template WhatsApp Brief</h3>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', gap: '0.35rem', color: '#16A34A', fontWeight: 600 }}
              >
                <MessageCircle size={14} />
                <span>Pratinjau WA</span>
              </button>
            </div>

            <form onSubmit={handleSaveWaBriefSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Salam Pembuka */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Salam Pembuka</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Assalamu'alaikum & selamat malam rekan-rekan! 👋"
                  value={waGreeting}
                  onChange={(e) => setWaGreeting(e.target.value)}
                />
              </div>

              {/* Judul Banner & Tautan Info Web */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Judul Banner</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: PERSIAPAN KELAS"
                    value={waBannerTitle}
                    onChange={(e) => setWaBannerTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Catatan / Tautan Portal</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 🌐 *Buka ClassHub untuk detail lengkap.*"
                    value={waFooterNote}
                    onChange={(e) => setWaFooterNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Kalimat Penutup */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Pesan Penutup</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Contoh: Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨"
                  value={waClosing}
                  onChange={(e) => setWaClosing(e.target.value)}
                />
              </div>

              {/* Opsi Toggle Seksi Default */}
              <div style={{ backgroundColor: 'var(--bg)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Seksi yang Disertakan Secara Default:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={waIncludeSchedule}
                      onChange={(e) => setWaIncludeSchedule(e.target.checked)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span>📅 Jadwal Pembelajaran</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={waIncludeTasks}
                      onChange={(e) => setWaIncludeTasks(e.target.checked)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span>📝 Deadline Tugas</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={waIncludePiket}
                      onChange={(e) => setWaIncludePiket(e.target.checked)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span>🧹 Petugas Piket Harian</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={waIncludeExams}
                      onChange={(e) => setWaIncludeExams(e.target.checked)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span>🎯 Pengingat Ujian</span>
                  </label>
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Pratinjau Hasil Format:
                  </span>
                  <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                    Preview
                  </span>
                </div>
                <div style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  <pre style={{
                    margin: 0,
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--text-primary)'
                  }}>
                    {previewBriefText}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handleResetWaBriefSettings}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--text-muted)', fontSize: '0.78rem', gap: '0.3rem' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset ke Bawaan</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}
                >
                  Simpan Format
                </button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE: RESET DATA CARD */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--danger-border, #FCA5A5)', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--tag-red-bg)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertCircle size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)', margin: 0 }}>
                  Zona Berbahaya: Reset Data Kelas
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem 0', lineHeight: 1.4 }}>
                  Tindakan ini akan mengembalikan seluruh jadwal, tugas, pengumuman, dan kas ke data bawaan demo awal.
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
                    fontWeight: 600,
                    gap: '0.35rem',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.78rem'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset Seluruh Data</span>
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

      {/* MODAL: EDIT UJIAN */}
      <Modal isOpen={isEditExamOpen} onClose={() => setIsEditExamOpen(false)} title="Edit Jadwal Ujian">
        <form onSubmit={handleUpdateExam} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Matematika Terapan"
              value={editExamSubject}
              onChange={(e) => setEditExamSubject(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Judul Ujian</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: PTS Ganjil Matriks & Linear"
              value={editExamTitle}
              onChange={(e) => setEditExamTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal & Waktu Ujian</label>
            <input
              type="datetime-local"
              className="form-input"
              value={editExamDate}
              onChange={(e) => setEditExamDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kisi-kisi / Cakupan Materi</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Bab 1 sampai Bab 3"
              value={editExamScope}
              onChange={(e) => setEditExamScope(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditExamOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Perubahan
            </button>
          </div>
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

      {/* MODAL: EDIT AGENDA */}
      <Modal isOpen={isEditEventOpen} onClose={() => setIsEditEventOpen(false)} title="Edit Agenda Kelas">
        <form onSubmit={handleUpdateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Kegiatan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kunjungan Industri Tech"
              value={editEventTitle}
              onChange={(e) => setEditEventTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={editEventDate}
              onChange={(e) => setEditEventDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kumpul jam 06.30 di lobi"
              value={editEventDesc}
              onChange={(e) => setEditEventDesc(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditEventOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Perubahan
            </button>
          </div>
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

      {/* MODAL: EDIT PENGUMUMAN */}
      <Modal isOpen={isEditAnnOpen} onClose={() => setIsEditAnnOpen(false)} title="Edit Pengumuman">
        <form onSubmit={handleUpdateAnn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={editAnnCat}
              onChange={(e) => setEditAnnCat(e.target.value)}
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
              value={editAnnTitle}
              onChange={(e) => setEditAnnTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Isi Pengumuman</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Tuliskan pesan lengkap untuk teman-teman sekelas..."
              value={editAnnContent}
              onChange={(e) => setEditAnnContent(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditAnnOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Perubahan
            </button>
          </div>
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

      {/* CONFIRM DIALOG: HAPUS JADWAL UJIAN */}
      <ConfirmDialog
        isOpen={Boolean(examToDelete)}
        onClose={() => setExamToDelete(null)}
        onConfirm={() => {
          if (examToDelete) {
            deleteExam(examToDelete.id);
            showToast(`Jadwal ujian "${examToDelete.title}" berhasil dihapus`, 'info');
            setExamToDelete(null);
          }
        }}
        title="Hapus Jadwal Ujian"
        message={`Apakah Anda yakin ingin menghapus jadwal ujian "${examToDelete?.title}" (${examToDelete?.subject})? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Ujian"
        variant="danger"
      />

      {/* CONFIRM DIALOG: HAPUS AGENDA KELAS */}
      <ConfirmDialog
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={() => {
          if (eventToDelete) {
            deleteEvent(eventToDelete.id);
            showToast(`Agenda "${eventToDelete.title}" berhasil dihapus`, 'info');
            setEventToDelete(null);
          }
        }}
        title="Hapus Agenda Kelas"
        message={`Apakah Anda yakin ingin menghapus agenda "${eventToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Agenda"
        variant="danger"
      />

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

      {/* CONFIRM DIALOG: HAPUS PENGUMUMAN */}
      <ConfirmDialog
        isOpen={Boolean(annToDelete)}
        onClose={() => setAnnToDelete(null)}
        onConfirm={() => {
          if (annToDelete) {
            deleteAnnouncement(annToDelete.id);
            showToast(`Pengumuman "${annToDelete.title}" berhasil dihapus`, 'info');
            setAnnToDelete(null);
          }
        }}
        title="Hapus Pengumuman Kelas"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${annToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Pengumuman"
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
