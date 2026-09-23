import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'classhub_data_v1';
const PERSONAL_TASKS_KEY = 'classhub_personal_done_tasks_v1';

const DEFAULT_SEED_DATA = {
  classInfo: {
    name: 'Kelas',
    school: 'SMK Negeri 1',
    academicYear: '2026/2027',
    homeroomTeacher: 'Budi Santoso, S.Kom., M.T.',
    totalStudents: 10,
    adminPin: 'admin123'
  },
  members: [
    { id: 'std-1', absentNo: 1, nisn: '006819201', name: 'Ahmad Fauzan', role: 'admin', roleTitle: 'Ketua Kelas', pin: '1234', avatarText: 'AF' },
    { id: 'std-2', absentNo: 2, nisn: '006819202', name: 'Alya Rahmadani', role: 'admin', roleTitle: 'Bendahara 1', pin: '1234', avatarText: 'AR' },
    { id: 'std-3', absentNo: 3, nisn: '006819203', name: 'Bagas Pratama', role: 'member', roleTitle: 'Wakil Ketua', pin: '1234', avatarText: 'BP' },
    { id: 'std-4', absentNo: 4, nisn: '006819204', name: 'Citra Kirana', role: 'member', roleTitle: 'Sekretaris', pin: '1234', avatarText: 'CK' },
    { id: 'std-5', absentNo: 5, nisn: '006819205', name: 'Dimas Aditya', role: 'member', roleTitle: 'Seksi Kebersihan', pin: '1234', avatarText: 'DA' },
    { id: 'std-6', absentNo: 6, nisn: '006819206', name: 'Eka Lestari', role: 'member', roleTitle: 'Seksi Olahraga', pin: '1234', avatarText: 'EL' },
    { id: 'std-7', absentNo: 7, nisn: '006819207', name: 'Fikri Haikal', role: 'member', roleTitle: 'Anggota', pin: '1234', avatarText: 'FH' },
    { id: 'std-8', absentNo: 8, nisn: '006819208', name: 'Gita Permata', role: 'member', roleTitle: 'Anggota', pin: '1234', avatarText: 'GP' },
    { id: 'std-9', absentNo: 9, nisn: '006819209', name: 'Hafiz Prasetyo', role: 'member', roleTitle: 'Anggota', pin: '1234', avatarText: 'HP' },
    { id: 'std-10', absentNo: 10, nisn: '006819210', name: 'Indah Cahyani', role: 'member', roleTitle: 'Anggota', pin: '1234', avatarText: 'IC' }
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Persiapan Penilaian Tengah Semester (PTS) Ganjil',
      content: 'Halo teman-teman! PTS Ganjil akan dimulai pekan depan. Mohon cek jadwal dan kisi-kisi pada tab Ujian. Pastikan semua tugas yang belum selesai segera dikumpulkan ke guru mapel masing-masing.',
      author: 'Ahmad Fauzan (Ketua Kelas)',
      createdAt: '2026-09-08T08:30:00Z',
      isPinned: true,
      category: 'penting'
    },
    {
      id: 'ann-2',
      title: 'Iuran Kas Bulan September 2026',
      content: 'Iuran kas kelas sebesar Rp 10.000 per minggu sudah dapat diserahkan ke Bendahara (Alya). Uang kas akan dialokasikan untuk perlengkapan kebersihan kelas dan fotokopi materi.',
      author: 'Alya Rahmadani (Bendahara)',
      createdAt: '2026-09-07T10:15:00Z',
      isPinned: false,
      category: 'keuangan'
    },
    {
      id: 'ann-3',
      title: 'Pembaruan Jadwal Piket Kebersihan',
      content: 'Bagi rekan-rekan yang bertugas piket hari ini, harap hadir 15 menit lebih awal untuk menyapu dan merapikan papan tulis sebelum guru pengampu masuk kelas.',
      author: 'Dimas Aditya (Seksi Kebersihan)',
      createdAt: '2026-09-06T14:00:00Z',
      isPinned: false,
      category: 'kegiatan'
    }
  ],
  tasks: [
    {
      id: 'tsk-1',
      subject: 'Pemrograman Web (PPLG)',
      title: 'Pembuatan REST API Login & Autentikasi JWT',
      deadline: '2026-09-12T23:59:00',
      description: 'Buat endpoint POST /api/login dengan validasi token JWT. Kumpulkan repo GitHub dan file export Postman.',
      link: 'https://classroom.google.com',
      completedStudentIds: ['std-2', 'std-4'],
      inProgressStudentIds: ['std-1', 'std-3']
    },
    {
      id: 'tsk-2',
      subject: 'Basis Data',
      title: 'Normalisasi Database 1NF s.d. 3NF Sistem Akademik',
      deadline: '2026-09-14T12:00:00',
      description: 'Lakukan analisis normalisasi pada tabel siswa, kelas, guru, dan nilai. Sertakan diagram ERD terbaru.',
      link: '',
      completedStudentIds: ['std-1', 'std-2', 'std-3', 'std-4', 'std-5'],
      inProgressStudentIds: []
    },
    {
      id: 'tsk-3',
      subject: 'Bahasa Indonesia',
      title: 'Penyusunan Proposal Kegiatan Bakti Sosial',
      deadline: '2026-09-18T15:00:00',
      description: 'Buat draf bab 1 pendahuluan dan bab 2 rencana anggaran biaya kegiatan per kelompok.',
      link: '',
      completedStudentIds: [],
      inProgressStudentIds: ['std-1']
    }
  ],
  exams: [
    {
      id: 'ex-1',
      subject: 'Pemrograman Web & Perangkat Bergerak',
      title: 'Penilaian Harian: Fullstack React & Node.js',
      examDate: '2026-09-15T08:00:00',
      scope: 'State management, component lifecycle, API integration, routing, JWT middleware'
    },
    {
      id: 'ex-2',
      subject: 'Matematika Terapan',
      title: 'PTS Ganjil: Matriks & Program Linear',
      examDate: '2026-09-22T09:30:00',
      scope: 'Determinan matriks 3x3, invers matriks, sistem pertidaksamaan linear dua variabel'
    }
  ],
  schedules: {
    Senin: {
      subjects: [
        { timeStart: '07:00', timeEnd: '08:30', subject: 'Upacara Bendera' },
        { timeStart: '08:30', timeEnd: '11:45', subject: 'Pemrograman Web & Bergerak' },
        { timeStart: '12:30', timeEnd: '14:30', subject: 'Pendidikan Pancasila' }
      ],
      piket: ['Ahmad Fauzan', 'Alya Rahmadani', 'Bagas Pratama']
    },
    Selasa: {
      subjects: [
        { timeStart: '07:00', timeEnd: '09:15', subject: 'Basis Data Lanjut' },
        { timeStart: '09:30', timeEnd: '11:45', subject: 'Bahasa Indonesia' },
        { timeStart: '12:30', timeEnd: '14:30', subject: 'Matematika Terapan' }
      ],
      piket: ['Citra Kirana', 'Dimas Aditya', 'Eka Lestari']
    },
    Rabu: {
      subjects: [
        { timeStart: '07:00', timeEnd: '11:00', subject: 'Proyek Kreatif & Kewirausahaan' },
        { timeStart: '11:15', timeEnd: '14:00', subject: 'Bahasa Inggris Kejuruan' }
      ],
      piket: ['Fikri Haikal', 'Gita Permata']
    },
    Kamis: {
      subjects: [
        { timeStart: '07:00', timeEnd: '10:00', subject: 'Pemodelan Perangkat Lunak (UML)' },
        { timeStart: '10:15', timeEnd: '12:00', subject: 'Pendidikan Agama & Budi Pekerti' }
      ],
      piket: ['Hafiz Prasetyo', 'Indah Cahyani']
    },
    Jumat: {
      subjects: [
        { timeStart: '07:00', timeEnd: '08:30', subject: 'Senam Pagi & Kebersihan' },
        { timeStart: '08:45', timeEnd: '11:00', subject: 'Bimbingan Konseling / Karir' }
      ],
      piket: ['Ahmad Fauzan', 'Citra Kirana', 'Eka Lestari']
    }
  },
  events: [
    { id: 'ev-1', title: 'Tryout Ujian Sertifikasi BNSP', date: '2026-09-19', type: 'exam', desc: 'Simulasi kompetensi programmer muda' },
    { id: 'ev-2', title: 'Kunjungan Industri Tech Summit', date: '2026-09-25', type: 'event', desc: 'Kunjungan studi lapangan' },
    { id: 'ev-3', title: 'Batas Akhir Iuran Kas September', date: '2026-09-30', type: 'task', desc: 'Pelunasan 4 pekan iuran kelas' }
  ],
  cash: {
    balance: 1450000,
    duesAmount: 10000,
    duesPeriods: [
      { id: 'dp-1', name: 'Minggu 1 (Sep)', amount: 10000, paidStudentIds: ['std-1', 'std-2', 'std-3', 'std-4', 'std-5', 'std-6', 'std-7', 'std-8', 'std-9', 'std-10'] },
      { id: 'dp-2', name: 'Minggu 2 (Sep)', amount: 10000, paidStudentIds: ['std-1', 'std-2', 'std-3', 'std-4', 'std-5', 'std-6', 'std-8'] },
      { id: 'dp-3', name: 'Minggu 3 (Sep)', amount: 10000, paidStudentIds: ['std-1', 'std-2', 'std-4'] },
      { id: 'dp-4', name: 'Minggu 4 (Sep)', amount: 10000, paidStudentIds: ['std-2'] }
    ],
    transactions: [
      { id: 'tx-1', type: 'income', amount: 1000000, category: 'Iuran Kas', description: 'Penerimaan iuran kas Minggu 1 lengkap 10 siswa', date: '2026-09-02', recordedBy: 'Alya Rahmadani (Bendahara)' },
      { id: 'tx-2', type: 'expense', amount: 150000, category: 'Kebersihan', description: 'Pembelian 2 sapu lantai, 1 pel microfiber, dan karbol wangi', date: '2026-09-03', recordedBy: 'Alya Rahmadani (Bendahara)' },
      { id: 'tx-3', type: 'income', amount: 700000, category: 'Iuran Kas', description: 'Penerimaan iuran kas Minggu 2 (7 siswa)', date: '2026-09-08', recordedBy: 'Alya Rahmadani (Bendahara)' },
      { id: 'tx-4', type: 'expense', amount: 100000, category: 'Perlengkapan', description: 'Beli spidol whiteboard 4 warna & penghapus papan', date: '2026-09-09', recordedBy: 'Alya Rahmadani (Bendahara)' }
    ]
  }
};

const sanitizeData = (raw) => {
  if (!raw || typeof raw !== 'object') return DEFAULT_SEED_DATA;
  return {
    ...DEFAULT_SEED_DATA,
    ...raw,
    classInfo: { ...DEFAULT_SEED_DATA.classInfo, ...(raw.classInfo || {}) },
    members: Array.isArray(raw.members) ? raw.members : DEFAULT_SEED_DATA.members,
    tasks: Array.isArray(raw.tasks) ? raw.tasks : DEFAULT_SEED_DATA.tasks,
    announcements: Array.isArray(raw.announcements) ? raw.announcements : DEFAULT_SEED_DATA.announcements,
    exams: Array.isArray(raw.exams) ? raw.exams : DEFAULT_SEED_DATA.exams,
    events: Array.isArray(raw.events) ? raw.events : DEFAULT_SEED_DATA.events,
    schedules: raw.schedules && typeof raw.schedules === 'object' ? raw.schedules : DEFAULT_SEED_DATA.schedules,
    cash: {
      ...DEFAULT_SEED_DATA.cash,
      ...(raw.cash || {}),
      duesPeriods: Array.isArray(raw.cash?.duesPeriods) ? raw.cash.duesPeriods : DEFAULT_SEED_DATA.cash.duesPeriods,
      transactions: Array.isArray(raw.cash?.transactions) ? raw.cash.transactions : DEFAULT_SEED_DATA.cash.transactions
    }
  };
};

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // Sync status: 'local' | 'connecting' | 'connected' | 'error'
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'connecting' : 'local');
  const [personalDoneTasks, setPersonalDoneTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(PERSONAL_TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          return sanitizeData(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
    return DEFAULT_SEED_DATA;
  });

  // Keep a ref to data to avoid stale closures in realtime handlers
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Save personal checklist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(PERSONAL_TASKS_KEY, JSON.stringify(personalDoneTasks));
    } catch (e) {}
  }, [personalDoneTasks]);

  // Always backup data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [data]);

  // 1. Initial Cloud Sync and Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('local');
      return;
    }

    let isMounted = true;

    const initCloud = async () => {
      try {
        setSyncStatus('connecting');
        const { data: row, error } = await supabase
          .from('class_store')
          .select('data')
          .eq('id', 'main_class')
          .maybeSingle();

        if (error) {
          console.warn('[Supabase] Initial fetch error:', error.message);
          if (isMounted) setSyncStatus('local');
          return;
        }

        if (row && row.data) {
          // Cloud has valid data, load it safely!
          if (isMounted) {
            setData(sanitizeData(row.data));
            setSyncStatus('connected');
          }
        } else {
          // Empty cloud table, seed it with initial data so it's ready!
          const { error: insertErr } = await supabase.from('class_store').insert({
            id: 'main_class',
            data: dataRef.current || DEFAULT_SEED_DATA,
            updated_at: new Date().toISOString()
          });
          if (insertErr) {
            console.warn('[Supabase] Seed insert error:', insertErr.message);
          }
          if (isMounted) setSyncStatus('connected');
        }
      } catch (err) {
        console.warn('[Supabase] Cloud connection failed:', err);
        if (isMounted) setSyncStatus('local');
      }
    };

    initCloud();

    // Setup Realtime WebSocket Listener
    const channel = supabase
      .channel('class_store_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_store', filter: 'id=eq.main_class' },
        (payload) => {
          if (payload.new && payload.new.data) {
            setData(sanitizeData(payload.new.data));
            setSyncStatus('connected');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isMounted) {
          setSyncStatus('connected');
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper to commit state changes locally and push to Supabase Cloud
  const commitData = (updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      
      // Push to Supabase if online
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('class_store')
          .upsert({
            id: 'main_class',
            data: next,
            updated_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) {
              console.error('[Supabase] Upsert error:', error.message);
            }
          })
          .catch(e => console.error('[Supabase] Network error:', e));
      }

      return next;
    });
  };

  // Actions
  const addTask = (task) => {
    const newTask = {
      id: `tsk-${Date.now()}`,
      completedStudentIds: [],
      inProgressStudentIds: [],
      ...task
    };
    commitData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  const deleteTask = (id) => {
    commitData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  // Update task completion (supports personal toggle for student or specific studentId)
  const updateTaskStatus = (taskId, studentId, status) => {
    // If it's a student (public-student or specific student), track in personal storage too
    if (status === 'done') {
      setPersonalDoneTasks(prev => Array.from(new Set([...prev, taskId])));
    } else {
      setPersonalDoneTasks(prev => prev.filter(id => id !== taskId));
    }

    commitData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        const completed = new Set(t.completedStudentIds || []);
        const inProgress = new Set(t.inProgressStudentIds || []);

        if (status === 'done') {
          completed.add(studentId);
          inProgress.delete(studentId);
        } else if (status === 'doing') {
          inProgress.add(studentId);
          completed.delete(studentId);
        } else {
          completed.delete(studentId);
          inProgress.delete(studentId);
        }

        return {
          ...t,
          completedStudentIds: Array.from(completed),
          inProgressStudentIds: Array.from(inProgress)
        };
      })
    }));
  };

  const addExam = (exam) => {
    const newExam = {
      id: `ex-${Date.now()}`,
      ...exam
    };
    commitData(prev => ({
      ...prev,
      exams: [...prev.exams, newExam]
    }));
  };

  const deleteExam = (id) => {
    commitData(prev => ({
      ...prev,
      exams: prev.exams.filter(e => e.id !== id)
    }));
  };

  const addAnnouncement = (ann) => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isPinned: false,
      ...ann
    };
    commitData(prev => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements]
    }));
  };

  const togglePinAnnouncement = (id) => {
    commitData(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => 
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      )
    }));
  };

  const deleteAnnouncement = (id) => {
    commitData(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    }));
  };

  const addTransaction = (tx) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...tx
    };
    commitData(prev => {
      const isIncome = newTx.type === 'income';
      const updatedBalance = isIncome 
        ? prev.cash.balance + Number(newTx.amount) 
        : prev.cash.balance - Number(newTx.amount);

      return {
        ...prev,
        cash: {
          ...prev.cash,
          balance: Math.max(0, updatedBalance),
          transactions: [newTx, ...(prev.cash.transactions || [])]
        }
      };
    });
  };

  const deleteTransaction = (id) => {
    commitData(prev => {
      const tx = (prev.cash.transactions || []).find(t => t.id === id);
      if (!tx) return prev;

      const isIncome = tx.type === 'income';
      const updatedBalance = isIncome 
        ? prev.cash.balance - Number(tx.amount) 
        : prev.cash.balance + Number(tx.amount);

      return {
        ...prev,
        cash: {
          ...prev.cash,
          balance: Math.max(0, updatedBalance),
          transactions: prev.cash.transactions.filter(t => t.id !== id)
        }
      };
    });
  };

  const toggleDuesPaid = (periodId, studentId) => {
    commitData(prev => {
      let isNowPaid = false;
      const updatedPeriods = (prev.cash.duesPeriods || []).map(p => {
        if (p.id !== periodId) return p;
        const set = new Set(p.paidStudentIds || []);
        if (set.has(studentId)) {
          set.delete(studentId);
          isNowPaid = false;
        } else {
          set.add(studentId);
          isNowPaid = true;
        }
        return { ...p, paidStudentIds: Array.from(set) };
      });

      const period = (prev.cash.duesPeriods || []).find(p => p.id === periodId);
      const duesAmt = period ? Number(period.amount) : Number(prev.cash.duesAmount || 10000);
      const updatedBalance = isNowPaid 
        ? prev.cash.balance + duesAmt 
        : Math.max(0, prev.cash.balance - duesAmt);

      return {
        ...prev,
        cash: {
          ...prev.cash,
          balance: updatedBalance,
          duesPeriods: updatedPeriods
        }
      };
    });
  };

  const addEvent = (event) => {
    const newEvent = {
      id: `ev-${Date.now()}`,
      ...event
    };
    commitData(prev => ({
      ...prev,
      events: [...(prev.events || []), newEvent]
    }));
  };

  const deleteEvent = (id) => {
    commitData(prev => ({
      ...prev,
      events: (prev.events || []).filter(e => e.id !== id)
    }));
  };

  const updateSchedule = (day, newScheduleData) => {
    commitData(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: newScheduleData
      }
    }));
  };

  const updateMemberPin = (memberId, newPin) => {
    commitData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, pin: newPin } : m)
    }));
  };

  const addMember = (member) => {
    const newMember = {
      id: `std-${Date.now()}`,
      absentNo: Number(member.absentNo) || (data.members.length + 1),
      nisn: (member.nisn || '').trim(),
      name: member.name.trim(),
      role: member.roleTitle && ['Ketua Kelas', 'Wakil Ketua', 'Bendahara', 'Sekretaris'].some(r => member.roleTitle.includes(r)) ? 'admin' : 'member',
      roleTitle: member.roleTitle || 'Anggota',
      pin: '1234',
      avatarText: (member.name || 'S').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      ...member
    };
    commitData(prev => {
      const updated = [...(prev.members || []), newMember].sort((a, b) => (Number(a.absentNo) || 0) - (Number(b.absentNo) || 0));
      return {
        ...prev,
        members: updated,
        classInfo: {
          ...(prev.classInfo || {}),
          totalStudents: updated.length
        }
      };
    });
  };

  const updateMember = (id, updatedFields) => {
    commitData(prev => {
      const updated = (prev.members || []).map(m => {
        if (m.id !== id) return m;
        return {
          ...m,
          ...updatedFields,
          absentNo: Number(updatedFields.absentNo !== undefined ? updatedFields.absentNo : m.absentNo)
        };
      }).sort((a, b) => (Number(a.absentNo) || 0) - (Number(b.absentNo) || 0));
      return {
        ...prev,
        members: updated
      };
    });
  };

  const deleteMember = (id) => {
    commitData(prev => {
      const updated = (prev.members || []).filter(m => m.id !== id);
      return {
        ...prev,
        members: updated,
        classInfo: {
          ...(prev.classInfo || {}),
          totalStudents: updated.length
        }
      };
    });
  };

  const updateClassInfo = (newInfo) => {
    commitData(prev => ({
      ...prev,
      classInfo: {
        ...(prev.classInfo || {}),
        ...newInfo
      }
    }));
  };

  const addDuesPeriod = (name, amount = 10000) => {
    const newPeriod = {
      id: `dp-${Date.now()}`,
      name,
      amount: Number(amount),
      paidStudentIds: []
    };
    commitData(prev => ({
      ...prev,
      cash: {
        ...prev.cash,
        duesPeriods: [...(prev.cash.duesPeriods || []), newPeriod]
      }
    }));
  };

  const resetToDefault = () => {
    commitData(DEFAULT_SEED_DATA);
  };

  // Derived financial stats
  const getTotalCashBalance = () => {
    const txs = data.cash.transactions || [];
    const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      balance: data.cash.balance,
      income,
      expense
    };
  };

  return (
    <StoreContext.Provider value={{
      data,
      syncStatus,
      personalDoneTasks,
      addTask,
      deleteTask,
      updateTaskStatus,
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
      addMember,
      updateMember,
      deleteMember,
      updateClassInfo,
      addDuesPeriod,
      resetToDefault,
      getTotalCashBalance
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
