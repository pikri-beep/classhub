import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'classhub_data_v2';
const PERSONAL_TASKS_KEY = 'classhub_personal_done_tasks_v2';

const DEFAULT_SEED_DATA = {
  classInfo: {
    name: 'XI PPLG',
    school: '',
    academicYear: '2026/2027',
    homeroomTeacher: '',
    totalStudents: 35,
    adminPin: 'admin123',
    appName: 'ClassHub',
    logoUrl: '/pwa-512x512.png',
    waGreeting: "Assalamu'alaikum & selamat malam rekan-rekan! 👋",
    waBannerTitle: 'PERSIAPAN KELAS',
    waFooterNote: '🌐 *Buka ClassHub untuk detail lengkap.*',
    waClosing: 'Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨',
    waIncludeSchedule: true,
    waIncludeTasks: true,
    waIncludePiket: true,
    waIncludeExams: true
  },
  members: [
    { id: 'std-1', absentNo: 1, name: 'Ahmad Fikry Al Khair', role: 'member', roleTitle: 'Anggota', avatarText: 'AF', phone: '' },
    { id: 'std-2', absentNo: 2, name: 'Ardyansyah', role: 'member', roleTitle: 'Anggota', avatarText: 'AR', phone: '' },
    { id: 'std-3', absentNo: 3, name: 'Arvin Putra Pratama', role: 'member', roleTitle: 'Anggota', avatarText: 'AP', phone: '' },
    { id: 'std-4', absentNo: 4, name: 'Arwan Putra Nusantara', role: 'member', roleTitle: 'Anggota', avatarText: 'AN', phone: '' },
    { id: 'std-5', absentNo: 5, name: 'Ayasy Radlliyan', role: 'member', roleTitle: 'Anggota', avatarText: 'AR', phone: '' },
    { id: 'std-6', absentNo: 6, name: "Azman Rif'at Siregar", role: 'member', roleTitle: 'Anggota', avatarText: 'AS', phone: '' },
    { id: 'std-7', absentNo: 7, name: 'Bayu Havilah Dias', role: 'member', roleTitle: 'Anggota', avatarText: 'BD', phone: '' },
    { id: 'std-8', absentNo: 8, name: 'Derly Rayyan Aqly', role: 'member', roleTitle: 'Anggota', avatarText: 'DA', phone: '' },
    { id: 'std-9', absentNo: 9, name: 'Dhaffa Alhabsy', role: 'member', roleTitle: 'Anggota', avatarText: 'DH', phone: '' },
    { id: 'std-10', absentNo: 10, name: 'Faturrahman Ilhami Dema', role: 'member', roleTitle: 'Anggota', avatarText: 'FD', phone: '' },
    { id: 'std-11', absentNo: 11, name: 'Fauzan Zuhri', role: 'member', roleTitle: 'Anggota', avatarText: 'FZ', phone: '' },
    { id: 'std-12', absentNo: 12, name: 'Feyoland Obrian Aldanys', role: 'admin', roleTitle: 'Wakil Ketua', avatarText: 'FO', phone: '' },
    { id: 'std-13', absentNo: 13, name: 'Lion Aslam Maulana', role: 'member', roleTitle: 'Anggota', avatarText: 'LM', phone: '' },
    { id: 'std-14', absentNo: 14, name: 'Lutfiya Ghania Nashita', role: 'admin', roleTitle: 'Sekretaris 1', avatarText: 'LN', phone: '' },
    { id: 'std-15', absentNo: 15, name: 'Mehsa Oktarina', role: 'member', roleTitle: 'Anggota', avatarText: 'MO', phone: '' },
    { id: 'std-16', absentNo: 16, name: 'M. Aidil Fitriansyah', role: 'member', roleTitle: 'Anggota', avatarText: 'AF', phone: '' },
    { id: 'std-17', absentNo: 17, name: 'M. Fahri Fatihul Aqso', role: 'member', roleTitle: 'Anggota', avatarText: 'FA', phone: '' },
    { id: 'std-18', absentNo: 18, name: 'M. Ihsan Alldaffa', role: 'member', roleTitle: 'Anggota', avatarText: 'IA', phone: '' },
    { id: 'std-19', absentNo: 19, name: 'M. Rafa Fadhillah', role: 'member', roleTitle: 'Anggota', avatarText: 'RF', phone: '' },
    { id: 'std-20', absentNo: 20, name: 'M. Rama Sylva', role: 'member', roleTitle: 'Anggota', avatarText: 'RS', phone: '' },
    { id: 'std-21', absentNo: 21, name: 'M. Reyhan Elsirajy', role: 'member', roleTitle: 'Anggota', avatarText: 'RE', phone: '' },
    { id: 'std-22', absentNo: 22, name: 'M. Reyhan Julvianto', role: 'member', roleTitle: 'Anggota', avatarText: 'RJ', phone: '' },
    { id: 'std-23', absentNo: 23, name: 'Nadine Misya Utami', role: 'member', roleTitle: 'Anggota', avatarText: 'NU', phone: '' },
    { id: 'std-24', absentNo: 24, name: 'Nurrohmat Gilang Utama', role: 'member', roleTitle: 'Anggota', avatarText: 'NG', phone: '' },
    { id: 'std-25', absentNo: 25, name: 'Pira Aditia', role: 'member', roleTitle: 'Anggota', avatarText: 'PA', phone: '' },
    { id: 'std-26', absentNo: 26, name: 'Rani Aprilia', role: 'admin', roleTitle: 'Bendahara 1', avatarText: 'RA', phone: '' },
    { id: 'std-27', absentNo: 27, name: 'Ridho Abdillah Kalim', role: 'member', roleTitle: 'Anggota', avatarText: 'RK', phone: '' },
    { id: 'std-28', absentNo: 28, name: 'Salwa Azzahra', role: 'admin', roleTitle: 'Bendahara 2', avatarText: 'SA', phone: '' },
    { id: 'std-29', absentNo: 29, name: 'Satria Azka Pratama P.', role: 'member', roleTitle: 'Anggota', avatarText: 'SP', phone: '' },
    { id: 'std-30', absentNo: 30, name: 'Shainajwa Checilia', role: 'member', roleTitle: 'Anggota', avatarText: 'SC', phone: '' },
    { id: 'std-31', absentNo: 31, name: 'Siva Inka Pratami', role: 'member', roleTitle: 'Anggota', avatarText: 'SP', phone: '' },
    { id: 'std-32', absentNo: 32, name: 'Vania Artanti', role: 'admin', roleTitle: 'Sekretaris 2', avatarText: 'VA', phone: '' },
    { id: 'std-33', absentNo: 33, name: 'Wahyu Iscoki', role: 'admin', roleTitle: 'Ketua Kelas', avatarText: 'WI', phone: '' },
    { id: 'std-34', absentNo: 34, name: 'Widiansyah Wida S.', role: 'member', roleTitle: 'Anggota', avatarText: 'WW', phone: '' },
    { id: 'std-35', absentNo: 35, name: 'Yoga Adi Permana', role: 'member', roleTitle: 'Anggota', avatarText: 'YP', phone: '' }
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Selamat Datang di Portal Kelas XI PPLG',
      content: 'Halo rekan-rekan XI PPLG! Portal ini dirancang untuk mempermudah pemantauan jadwal harian, pelacakan live KBM, pengumpulan tugas, info piket, serta transparansi pembukuan kas kelas.',
      author: 'Wahyu Iscoki (Ketua Kelas)',
      createdAt: '2026-09-20T08:00:00Z',
      isPinned: true,
      category: 'penting'
    },
    {
      id: 'ann-2',
      title: 'Iuran Kas Mingguan Rp 5.000',
      content: 'Iuran kas kelas sebesar Rp 5.000 per minggu dapat diserahkan langsung ke Bendahara (Rani Aprilia / Salwa Azzahra). Dana kas digunakan untuk kebutuhan bersama, kebersihan, dan perlengkapan kelas.',
      author: 'Rani Aprilia & Salwa Azzahra (Bendahara)',
      createdAt: '2026-09-21T09:00:00Z',
      isPinned: false,
      category: 'keuangan'
    },
    {
      id: 'ann-3',
      title: 'Jadwal Piket Kebersihan Harian',
      content: 'Dihimbau bagi anggota regu piket hari ini untuk hadir 15 menit sebelum bel KBM (pukul 07.00 WIB) guna memastikan ruang kelas bersih dan siap digunakan belajar.',
      author: 'Lutfiya Ghania Nashita & Vania Artanti (Sekretaris)',
      createdAt: '2026-09-22T07:00:00Z',
      isPinned: false,
      category: 'kegiatan'
    }
  ],
  tasks: [
    {
      id: 'tsk-1',
      subject: 'Pemrograman Web',
      title: 'Praktikum REST API & Form Handling',
      deadline: '2026-09-28T23:59:00',
      description: 'Implementasikan form handling dan endpoint API. Unggah link repositori GitHub ke form pengumpulan.',
      link: 'https://classroom.google.com',
      completedStudentIds: ['std-12', 'std-14', 'std-26', 'std-28', 'std-32', 'std-33'],
      inProgressStudentIds: ['std-11', 'std-1']
    },
    {
      id: 'tsk-2',
      subject: 'Basis Data',
      title: 'Perancangan Skema Database & Relasi Tabel',
      deadline: '2026-09-30T15:00:00',
      description: 'Buat diagram ERD dan query DDL (CREATE TABLE) beserta relasi foreign key untuk sistem akademik.',
      link: '',
      completedStudentIds: ['std-33', 'std-11', 'std-12'],
      inProgressStudentIds: ['std-14', 'std-26']
    },
    {
      id: 'tsk-3',
      subject: 'Pemrograman Berbasis Teks dan Multimedia',
      title: 'Implementasi Antarmuka GUI & Komponen Visual',
      deadline: '2026-10-02T15:30:00',
      description: 'Rancang modul antarmuka interaktif dan integrasikan elemen multimedia sesuai spesifikasi tugas.',
      link: '',
      completedStudentIds: [],
      inProgressStudentIds: ['std-33']
    }
  ],
  exams: [
    {
      id: 'ex-1',
      subject: 'Pemrograman Web',
      title: 'Penilaian Harian: Frontend React & Component Architecture',
      examDate: '2026-10-01T08:00:00',
      scope: 'State management, props drilling vs context, component lifecycle, dan routing'
    },
    {
      id: 'ex-2',
      subject: 'Basis Data',
      title: 'Penilaian Harian: Normalisasi Database & SQL Joins',
      examDate: '2026-10-07T08:00:00',
      scope: 'Normalisasi 1NF-3NF, INNER JOIN, LEFT JOIN, agregasi GROUP BY & HAVING'
    }
  ],
  schedules: {
    Senin: {
      subjects: [
        { timeStart: '07:15', timeEnd: '10:15', subject: 'Bahasa Indonesia' },
        { timeStart: '10:30', timeEnd: '12:00', subject: 'PPKN' },
        { timeStart: '12:30', timeEnd: '15:30', subject: 'Pemrograman Berbasis Teks dan Multimedia' }
      ],
      piket: [
        'Ahmad Fikry Al Khair',
        'Ardyansyah',
        'Arvin Putra Pratama',
        'Arwan Putra Nusantara',
        'Ayasy Radlliyan',
        "Azman Rif'at Siregar",
        'Bayu Havilah Dias'
      ]
    },
    Selasa: {
      subjects: [
        { timeStart: '07:15', timeEnd: '10:15', subject: 'KIK (Kreativitas, Inovasi, dan Kewirausahaan)' },
        { timeStart: '10:30', timeEnd: '11:15', subject: 'KIK (Kreativitas, Inovasi, dan Kewirausahaan)' },
        { timeStart: '11:15', timeEnd: '12:00', subject: 'Agama' },
        { timeStart: '12:30', timeEnd: '14:00', subject: 'Agama' },
        { timeStart: '14:00', timeEnd: '15:30', subject: 'P5' }
      ],
      piket: [
        'Derly Rayyan Aqly',
        'Dhaffa Alhabsy',
        'Faturrahman Ilhami Dema',
        'Fauzan Zuhri',
        'Feyoland Obrian Aldanys',
        'Lion Aslam Maulana',
        'Lutfiya Ghania Nashita'
      ]
    },
    Rabu: {
      subjects: [
        { timeStart: '07:15', timeEnd: '10:15', subject: 'Bahasa Inggris' },
        { timeStart: '10:30', timeEnd: '12:00', subject: 'Sejarah' },
        { timeStart: '12:30', timeEnd: '15:30', subject: 'Basis Data' }
      ],
      piket: [
        'Mehsa Oktarina',
        'M. Aidil Fitriansyah',
        'M. Fahri Fatihul Aqso',
        'M. Ihsan Alldaffa',
        'M. Rafa Fadhillah',
        'M. Rama Sylva',
        'M. Reyhan Elsirajy'
      ]
    },
    Kamis: {
      subjects: [
        { timeStart: '07:15', timeEnd: '08:45', subject: 'PJOK' },
        { timeStart: '08:45', timeEnd: '10:15', subject: 'IOT' },
        { timeStart: '10:30', timeEnd: '12:00', subject: 'BK' },
        { timeStart: '12:30', timeEnd: '15:30', subject: 'Pemrograman Web' }
      ],
      piket: [
        'M. Reyhan Julvianto',
        'Nadine Misya Utami',
        'Nurrohmat Gilang Utama',
        'Pira Aditia',
        'Rani Aprilia',
        'Ridho Abdillah Kalim',
        'Salwa Azzahra'
      ]
    },
    Jumat: {
      subjects: [
        { timeStart: '07:15', timeEnd: '09:45', subject: 'Matematika Lanjutan' },
        { timeStart: '10:00', timeEnd: '12:00', subject: 'Pemrograman Perangkat Bergerak' },
        { timeStart: '13:15', timeEnd: '13:55', subject: 'Pemrograman Perangkat Bergerak' },
        { timeStart: '13:55', timeEnd: '15:55', subject: 'Matematika Umum' }
      ],
      piket: [
        'Satria Azka Pratama P.',
        'Shainajwa Checilia',
        'Siva Inka Pratami',
        'Vania Artanti',
        'Wahyu Iscoki',
        'Widiansyah Wida S.',
        'Yoga Adi Permana'
      ]
    }
  },
  events: [
    { id: 'ev-1', title: 'Tryout Simulasi Sertifikasi PPLG', date: '2026-10-05', type: 'exam', desc: 'Simulasi kompetensi software development' },
    { id: 'ev-2', title: 'Kunjungan Industri / Webinar Tech', date: '2026-10-12', type: 'event', desc: 'Sesi bersama praktisi industri teknologi' },
    { id: 'ev-3', title: 'Batas Rekap Kas Periode September', date: '2026-09-30', type: 'task', desc: 'Penutupan buku kas bulan September' }
  ],
  cash: {
    balance: 175000,
    duesAmount: 5000,
    duesPeriods: [
      { id: 'dp-1', month: '2026-09', name: 'Minggu 1', amount: 5000, paidStudentIds: ['std-1', 'std-2', 'std-3', 'std-4', 'std-5', 'std-11', 'std-12', 'std-14', 'std-26', 'std-28', 'std-32', 'std-33'] },
      { id: 'dp-2', month: '2026-09', name: 'Minggu 2', amount: 5000, paidStudentIds: ['std-12', 'std-14', 'std-26', 'std-28', 'std-32', 'std-33'] },
      { id: 'dp-3', month: '2026-09', name: 'Minggu 3', amount: 5000, paidStudentIds: ['std-26', 'std-28', 'std-33'] },
      { id: 'dp-4', month: '2026-09', name: 'Minggu 4', amount: 5000, paidStudentIds: ['std-26', 'std-28'] }
    ],
    transactions: [
      { id: 'tx-1', type: 'income', amount: 60000, category: 'Iuran Kas', description: 'Penerimaan iuran kas Minggu 1', date: '2026-09-02', recordedBy: 'Rani Aprilia (Bendahara 1)' },
      { id: 'tx-2', type: 'expense', amount: 35000, category: 'Kebersihan', description: 'Pembelian refill sabun cuci tangan & pewangi lantai', date: '2026-09-03', recordedBy: 'Salwa Azzahra (Bendahara 2)' },
      { id: 'tx-3', type: 'income', amount: 30000, category: 'Iuran Kas', description: 'Penerimaan iuran kas Minggu 2', date: '2026-09-08', recordedBy: 'Rani Aprilia (Bendahara 1)' },
      { id: 'tx-4', type: 'expense', amount: 25000, category: 'Perlengkapan', description: 'Beli spidol whiteboard hitam & biru', date: '2026-09-09', recordedBy: 'Salwa Azzahra (Bendahara 2)' }
    ]
  }
};

const sanitizeData = (raw) => {
  if (!raw || typeof raw !== 'object') return DEFAULT_SEED_DATA;
  return {
    ...DEFAULT_SEED_DATA,
    ...raw,
    classInfo: { 
      ...DEFAULT_SEED_DATA.classInfo, 
      ...(raw.classInfo || {}),
      logoUrl: raw.classInfo?.logoUrl || DEFAULT_SEED_DATA.classInfo.logoUrl
    },
    members: (Array.isArray(raw.members) ? raw.members : DEFAULT_SEED_DATA.members).map(m => {
      if (m && typeof m === 'object') {
        const { pin, nisn, ...cleaned } = m;
        return {
          ...cleaned,
          phone: cleaned.phone || ''
        };
      }
      return m;
    }),
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

        if (row && row.data && Array.isArray(row.data.members) && row.data.members.length > 0) {
          // Cloud has valid populated data, load it safely!
          if (isMounted) {
            setData(sanitizeData(row.data));
            setSyncStatus('connected');
          }
        } else {
          // Empty or uninitialized cloud table, seed it with current local state or default data!
          const dataToSeed = (dataRef.current && Array.isArray(dataRef.current.members) && dataRef.current.members.length > 0)
            ? dataRef.current
            : DEFAULT_SEED_DATA;

          const { error: seedErr } = await supabase.from('class_store').upsert({
            id: 'main_class',
            data: dataToSeed,
            updated_at: new Date().toISOString()
          });
          if (seedErr) {
            console.warn('[Supabase] Seed upsert error:', seedErr.message);
          }
          if (isMounted) {
            setData(sanitizeData(dataToSeed));
            setSyncStatus('connected');
          }
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
      const safePrev = sanitizeData(prev);
      const next = sanitizeData(typeof updater === 'function' ? updater(safePrev) : updater);
      
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
      tasks: [newTask, ...(prev.tasks || [])]
    }));
  };

  const deleteTask = (id) => {
    commitData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).filter(t => t.id !== id)
    }));
  };

  const updateTask = (id, updatedFields) => {
    commitData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => 
        t.id === id ? { ...t, ...updatedFields } : t
      )
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
      tasks: (prev.tasks || []).map(t => {
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
      exams: [...(prev.exams || []), newExam]
    }));
  };

  const deleteExam = (id) => {
    commitData(prev => ({
      ...prev,
      exams: (prev.exams || []).filter(e => e.id !== id)
    }));
  };

  const updateExam = (id, updatedFields) => {
    commitData(prev => ({
      ...prev,
      exams: (prev.exams || []).map(e => 
        e.id === id ? { ...e, ...updatedFields } : e
      )
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
      announcements: [newAnn, ...(prev.announcements || [])]
    }));
  };

  const togglePinAnnouncement = (id) => {
    commitData(prev => ({
      ...prev,
      announcements: (prev.announcements || []).map(a => 
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      )
    }));
  };

  const deleteAnnouncement = (id) => {
    commitData(prev => ({
      ...prev,
      announcements: (prev.announcements || []).filter(a => a.id !== id)
    }));
  };

  const updateAnnouncement = (id, updatedFields) => {
    commitData(prev => ({
      ...prev,
      announcements: (prev.announcements || []).map(a => 
        a.id === id ? { ...a, ...updatedFields } : a
      )
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

  const markAllDuesPaid = (periodId) => {
    commitData(prev => {
      const allStudentIds = (prev.members || []).map(m => m.id);
      let newlyPaidCount = 0;
      const period = (prev.cash.duesPeriods || []).find(p => p.id === periodId);
      if (!period) return prev;

      const previouslyPaidSet = new Set(period.paidStudentIds || []);
      allStudentIds.forEach(id => {
        if (!previouslyPaidSet.has(id)) {
          newlyPaidCount++;
        }
      });

      const updatedPeriods = (prev.cash.duesPeriods || []).map(p => {
        if (p.id !== periodId) return p;
        return { ...p, paidStudentIds: allStudentIds };
      });

      const duesAmt = Number(period.amount || prev.cash.duesAmount || 10000);
      const updatedBalance = prev.cash.balance + (newlyPaidCount * duesAmt);

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

  const addMember = (member) => {
    const newMember = {
      id: `std-${Date.now()}`,
      absentNo: Number(member.absentNo) || (data.members.length + 1),
      name: member.name.trim(),
      phone: (member.phone || '').trim(),
      role: member.roleTitle && ['Ketua Kelas', 'Wakil Ketua', 'Bendahara', 'Sekretaris'].some(r => member.roleTitle.includes(r)) ? 'admin' : 'member',
      roleTitle: member.roleTitle || 'Anggota',
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

  const addDuesPeriod = (name, amount = 10000, month = '') => {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const newPeriod = {
      id: `dp-${Date.now()}`,
      name,
      month: targetMonth,
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

  const deleteDuesPeriod = (periodId) => {
    commitData(prev => {
      // Find period being deleted to optionally revert balance
      const periodToDelete = (prev.cash.duesPeriods || []).find(p => p.id === periodId);
      const remainingPeriods = (prev.cash.duesPeriods || []).filter(p => p.id !== periodId);
      
      let newBalance = prev.cash.balance;
      if (periodToDelete) {
        const paidCount = (periodToDelete.paidStudentIds || []).length;
        const totalDeducted = paidCount * (Number(periodToDelete.amount) || 0);
        newBalance = Math.max(0, newBalance - totalDeducted);
      }

      return {
        ...prev,
        cash: {
          ...prev.cash,
          balance: newBalance,
          duesPeriods: remainingPeriods
        }
      };
    });
  };

  const resetToDefault = () => {
    commitData(DEFAULT_SEED_DATA);
  };

  // Derived financial stats
  const getTotalCashBalance = () => {
    const txs = data?.cash?.transactions || [];
    const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      balance: data?.cash?.balance ?? 0,
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
      updateTask,
      deleteTask,
      updateTaskStatus,
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
      deleteEvent,
      updateSchedule,
      addMember,
      updateMember,
      deleteMember,
      updateClassInfo,
      addDuesPeriod,
      deleteDuesPeriod,
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
