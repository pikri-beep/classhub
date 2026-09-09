import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'classhub_data_v1';

const DEFAULT_SEED_DATA = {
  classInfo: {
    name: 'XII PPLG 1',
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
      room: 'Lab Komputer 3',
      scope: 'State management, component lifecycle, API integration, routing, JWT middleware'
    },
    {
      id: 'ex-2',
      subject: 'Matematika Terapan',
      title: 'PTS Ganjil: Matriks & Program Linear',
      examDate: '2026-09-22T09:30:00',
      room: 'Ruang Teori XII PPLG 1',
      scope: 'Determinan matriks 3x3, invers matriks, sistem pertidaksamaan linear dua variabel'
    }
  ],
  schedules: {
    Senin: {
      subjects: [
        { timeStart: '07:00', timeEnd: '08:30', subject: 'Upacara Bendera', teacher: 'Semua Guru', room: 'Lapangan' },
        { timeStart: '08:30', timeEnd: '11:45', subject: 'Pemrograman Web & Bergerak', teacher: 'Pak Aris, S.T.', room: 'Lab 3' },
        { timeStart: '12:30', timeEnd: '14:30', subject: 'Pendidikan Pancasila', teacher: 'Ibu Ratna, M.Pd.', room: 'R. 12' }
      ],
      piket: ['Ahmad Fauzan', 'Alya Rahmadani', 'Bagas Pratama']
    },
    Selasa: {
      subjects: [
        { timeStart: '07:00', timeEnd: '09:15', subject: 'Basis Data Lanjut', teacher: 'Pak Hendra, M.Kom.', room: 'Lab 2' },
        { timeStart: '09:30', timeEnd: '11:45', subject: 'Bahasa Indonesia', teacher: 'Ibu Sri, S.Pd.', room: 'R. 12' },
        { timeStart: '12:30', timeEnd: '14:30', subject: 'Matematika Terapan', teacher: 'Pak Joko, M.Si.', room: 'R. 12' }
      ],
      piket: ['Citra Kirana', 'Dimas Aditya', 'Eka Lestari']
    },
    Rabu: {
      subjects: [
        { timeStart: '07:00', timeEnd: '11:00', subject: 'Proyek Kreatif & Kewirausahaan', teacher: 'Ibu Dewi, S.E.', room: 'Bengkel Kreatif' },
        { timeStart: '11:15', timeEnd: '14:00', subject: 'Bahasa Inggris Kejuruan', teacher: 'Mr. David, M.A.', room: 'R. 12' }
      ],
      piket: ['Fikri Haikal', 'Gita Permata']
    },
    Kamis: {
      subjects: [
        { timeStart: '07:00', timeEnd: '10:00', subject: 'Pemodelan Perangkat Lunak (UML)', teacher: 'Pak Aris, S.T.', room: 'Lab 3' },
        { timeStart: '10:15', timeEnd: '12:00', subject: 'Pendidikan Agama & Budi Pekerti', teacher: 'Ust. Mansur, S.Ag.', room: 'Masjid / R. 12' }
      ],
      piket: ['Hafiz Prasetyo', 'Indah Cahyani']
    },
    Jumat: {
      subjects: [
        { timeStart: '07:00', timeEnd: '08:30', subject: 'Senam Pagi & Kebersihan', teacher: 'Pembina OSIS', room: 'Lapangan' },
        { timeStart: '08:45', timeEnd: '11:00', subject: 'Bimbingan Konseling / Karir', teacher: 'Ibu Maya, S.Psi.', room: 'R. 12' }
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

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.members && parsed.tasks) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
    return DEFAULT_SEED_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [data]);

  // Actions
  const addTask = (task) => {
    const newTask = {
      id: `tsk-${Date.now()}`,
      completedStudentIds: [],
      inProgressStudentIds: [],
      ...task
    };
    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  const deleteTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const updateTaskStatus = (taskId, studentId, status) => {
    setData(prev => ({
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
    setData(prev => ({
      ...prev,
      exams: [...prev.exams, newExam]
    }));
  };

  const deleteExam = (id) => {
    setData(prev => ({
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
    setData(prev => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements]
    }));
  };

  const togglePinAnnouncement = (id) => {
    setData(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => 
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      )
    }));
  };

  const deleteAnnouncement = (id) => {
    setData(prev => ({
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
    setData(prev => {
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
    setData(prev => {
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
    setData(prev => {
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
    setData(prev => ({
      ...prev,
      events: [...(prev.events || []), newEvent]
    }));
  };

  const resetToDefault = () => {
    setData(DEFAULT_SEED_DATA);
    localStorage.removeItem(STORAGE_KEY);
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
