/**
 * CENTRAL DATA STORE & PERSISTENCE
 * ClassHub - State Management & Storage
 */

const STORAGE_KEY = 'classhub_data_v1';

// SEED INITIAL DATA FOR THE CLASSROOM
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
      title: 'Project Web Responsive Design & Modern UI',
      description: 'Membuat halaman web portfolio atau dashboard kelas menggunakan HTML, CSS modern, dan JavaScript. Kumpulkan source code via link GitHub repository.',
      deadline: '2026-09-15T23:59:00',
      completedStudentIds: ['std-1', 'std-2', 'std-4'],
      inProgressStudentIds: ['std-3', 'std-5', 'std-7'],
      link: 'https://github.com'
    },
    {
      id: 'tsk-2',
      subject: 'Basis Data',
      title: 'Normalisasi Database & Query DDL/DML',
      description: 'Menyelesaikan modul latihan bab 3 tentang relasi tabel 1-to-many dan query agregasi SQL. Diketik rapi dalam format PDF.',
      deadline: '2026-09-12T17:00:00',
      completedStudentIds: ['std-1', 'std-3', 'std-5', 'std-6', 'std-8'],
      inProgressStudentIds: ['std-2', 'std-4', 'std-9'],
      link: ''
    },
    {
      id: 'tsk-3',
      subject: 'Bahasa Indonesia',
      title: 'Teks Editorial & Analisis Opini Media',
      description: 'Analisis struktur dan kaidah kebahasaan dari artikel berita terkini. Dikerjakan di buku tugas dan difoto.',
      deadline: '2026-09-18T12:00:00',
      completedStudentIds: ['std-2', 'std-10'],
      inProgressStudentIds: ['std-1', 'std-3'],
      link: ''
    }
  ],
  exams: [
    {
      id: 'exm-1',
      subject: 'Pemrograman Web & Perangkat Bergerak',
      title: 'PTS Praktik: Aplikasi Web Frontend',
      examDate: '2026-09-16T08:00:00',
      room: 'Lab Komputer 3',
      scope: 'HTML5 Semantic, CSS Grid & Flexbox, DOM Manipulation & Event Handling, Fetch API'
    },
    {
      id: 'exm-2',
      subject: 'Matematika Terapan',
      title: 'PTS Teori: Matriks dan Transformasi Geometri',
      examDate: '2026-09-17T10:00:00',
      room: 'Ruang Teori 12',
      scope: 'Operasi Penjumlahan & Perkalian Matriks, Determinan, Invers Matriks 2x2 dan 3x3'
    },
    {
      id: 'exm-3',
      subject: 'Basis Data',
      title: 'PTS Praktik: Desain Schema & Query SQL',
      examDate: '2026-09-22T08:30:00',
      room: 'Lab Database',
      scope: 'Normalisasi 1NF-3NF, Inner Join, Group By, Subquery SQL'
    }
  ],
  schedules: {
    Senin: {
      subjects: [
        { timeStart: '07:00', timeEnd: '07:45', subject: 'Upacara Bendera', teacher: 'Semua Guru' },
        { timeStart: '07:45', timeEnd: '10:00', subject: 'Pemrograman Web', teacher: 'Pak Budi Santoso, S.Kom.' },
        { timeStart: '10:15', timeEnd: '12:00', subject: 'Basis Data', teacher: 'Bu Rina Wati, M.Kom.' },
        { timeStart: '12:45', timeEnd: '14:30', subject: 'Bahasa Indonesia', teacher: 'Pak Hendra, S.Pd.' }
      ],
      piket: ['Ahmad Fauzan', 'Alya Rahmadani']
    },
    Selasa: {
      subjects: [
        { timeStart: '07:00', timeEnd: '09:15', subject: 'Pemrograman Berorientasi Objek', teacher: 'Pak Budi Santoso, S.Kom.' },
        { timeStart: '09:30', timeEnd: '11:45', subject: 'Matematika', teacher: 'Bu Sri Wahyuni, M.Pd.' },
        { timeStart: '12:30', timeEnd: '14:30', subject: 'Pendidikan Agama & Budi Pekerti', teacher: 'Ust. Mahmud, S.Ag.' }
      ],
      piket: ['Bagas Pratama', 'Citra Kirana']
    },
    Rabu: {
      subjects: [
        { timeStart: '07:00', timeEnd: '09:30', subject: 'Pemodelan Perangkat Lunak', teacher: 'Pak Deni Kurniawan, M.T.' },
        { timeStart: '09:45', timeEnd: '12:00', subject: 'Bahasa Inggris Teknis', teacher: 'Miss Sarah Johnson' },
        { timeStart: '12:45', timeEnd: '14:30', subject: 'Pendidikan Pancasila (PPKn)', teacher: 'Pak Joko, S.Pd.' }
      ],
      piket: ['Dimas Aditya', 'Eka Lestari']
    },
    Kamis: {
      subjects: [
        { timeStart: '07:00', timeEnd: '10:00', subject: 'Proyek Kreatif & Kewirausahaan (PKK)', teacher: 'Bu Ratna Dewi, S.E.' },
        { timeStart: '10:15', timeEnd: '12:00', subject: 'Basis Data Lanjutan', teacher: 'Bu Rina Wati, M.Kom.' },
        { timeStart: '12:45', timeEnd: '14:30', subject: 'Sejarah Indonesia', teacher: 'Pak Anwar, S.Pd.' }
      ],
      piket: ['Fikri Haikal', 'Gita Permata']
    },
    Jumat: {
      subjects: [
        { timeStart: '07:00', timeEnd: '08:30', subject: 'Senam Pagi & Literasi', teacher: 'Kesiswaan' },
        { timeStart: '08:45', timeEnd: '11:15', subject: 'Pengembangan Aplikasi Mobile', teacher: 'Pak Budi Santoso, S.Kom.' }
      ],
      piket: ['Hafiz Prasetyo', 'Indah Cahyani']
    }
  },
  cash: {
    nominalPerDues: 10000,
    duesPeriods: [
      { id: 'dp-1', name: 'Minggu 1 (Sep 2026)', amount: 10000, paidStudentIds: ['std-1', 'std-2', 'std-3', 'std-4', 'std-5', 'std-7', 'std-8'] },
      { id: 'dp-2', name: 'Minggu 2 (Sep 2026)', amount: 10000, paidStudentIds: ['std-1', 'std-2', 'std-4'] },
      { id: 'dp-3', name: 'Minggu 3 (Sep 2026)', amount: 10000, paidStudentIds: [] },
      { id: 'dp-4', name: 'Minggu 4 (Sep 2026)', amount: 10000, paidStudentIds: [] }
    ],
    transactions: [
      { id: 'tx-1', type: 'income', amount: 70000, category: 'Iuran Kas', description: 'Pembayaran Iuran Kas Minggu 1 (7 Siswa)', date: '2026-09-02', recordedBy: 'Alya (Bendahara)' },
      { id: 'tx-2', type: 'expense', amount: 35000, category: 'Alat Kebersihan', description: 'Beli refill spidol whiteboard & penghapus papan', date: '2026-09-04', recordedBy: 'Alya (Bendahara)' },
      { id: 'tx-3', type: 'income', amount: 30000, category: 'Iuran Kas', description: 'Pembayaran Iuran Kas Minggu 2 (3 Siswa)', date: '2026-09-08', recordedBy: 'Alya (Bendahara)' },
      { id: 'tx-4', type: 'expense', amount: 20000, category: 'Fotokopi', description: 'Fotokopi kisi-kisi modul praktikum', date: '2026-09-09', recordedBy: 'Ahmad Fauzan' }
    ]
  },
  events: [
    { id: 'evt-1', title: 'Gotong Royong & Hias Kelas', date: '2026-09-11', type: 'event', desc: 'Merapikan sudut baca dan pojok mading kelas' },
    { id: 'evt-2', title: 'PTS Teori & Praktik', date: '2026-09-16', type: 'exam', desc: 'Pekan Penilaian Tengah Semester' },
    { id: 'evt-3', title: 'Deadline Project Web PPLG', date: '2026-09-15', type: 'task', desc: 'Pengumpulan repo GitHub' },
    { id: 'evt-4', title: 'Class Meeting Futsal Antar Kelas', date: '2026-09-25', type: 'event', desc: 'Pertandingan pembuka di lapangan utama' }
  ]
};

class Store {
  constructor() {
    this.listeners = [];
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse localStorage data, resetting to default', e);
    }
    this.saveData(DEFAULT_SEED_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
  }

  saveData(dataToSave = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    this.saveData();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.data);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }

  // --- CRUD HELPERS ---

  // Announcements
  addAnnouncement(announcement) {
    const newAnn = {
      id: 'ann-' + Date.now(),
      createdAt: new Date().toISOString(),
      isPinned: false,
      ...announcement
    };
    this.data.announcements.unshift(newAnn);
    this.saveData();
    return newAnn;
  }

  deleteAnnouncement(id) {
    this.data.announcements = this.data.announcements.filter(a => a.id !== id);
    this.saveData();
  }

  togglePinAnnouncement(id) {
    const ann = this.data.announcements.find(a => a.id === id);
    if (ann) {
      ann.isPinned = !ann.isPinned;
      this.saveData();
    }
  }

  // Tasks
  addTask(task) {
    const newTask = {
      id: 'tsk-' + Date.now(),
      completedStudentIds: [],
      inProgressStudentIds: [],
      ...task
    };
    this.data.tasks.unshift(newTask);
    this.saveData();
    return newTask;
  }

  getTaskById(taskId) {
    return this.data.tasks.find(t => t.id === taskId);
  }

  updateTaskStatus(taskId, studentId, status) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completedStudentIds = (task.completedStudentIds || []).filter(id => id !== studentId);
    task.inProgressStudentIds = (task.inProgressStudentIds || []).filter(id => id !== studentId);

    if (status === 'done') {
      task.completedStudentIds.push(studentId);
    } else if (status === 'doing') {
      task.inProgressStudentIds.push(studentId);
    }

    this.saveData();
  }

  updateStudentTaskStatus(taskId, studentId, status) {
    this.updateTaskStatus(taskId, studentId, status);
  }

  deleteTask(taskId) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
    this.saveData();
  }

  // Exams
  addExam(exam) {
    const newExam = {
      id: 'exm-' + Date.now(),
      ...exam
    };
    this.data.exams.push(newExam);
    this.saveData();
    return newExam;
  }

  deleteExam(examId) {
    this.data.exams = this.data.exams.filter(e => e.id !== examId);
    this.saveData();
  }

  // Cash & Dues
  toggleDuesPayment(periodId, studentId) {
    const period = this.data.cash.duesPeriods.find(p => p.id === periodId);
    if (!period) return;

    const isPaid = period.paidStudentIds.includes(studentId);
    if (isPaid) {
      period.paidStudentIds = period.paidStudentIds.filter(id => id !== studentId);
    } else {
      period.paidStudentIds.push(studentId);
    }

    this.saveData();
  }

  addCashTransaction(tx) {
    const newTx = {
      id: 'tx-' + Date.now(),
      date: tx.date || new Date().toISOString().split('T')[0],
      ...tx
    };
    this.data.cash.transactions.unshift(newTx);
    this.saveData();
    return newTx;
  }

  deleteCashTransaction(txId) {
    this.data.cash.transactions = this.data.cash.transactions.filter(t => t.id !== txId);
    this.saveData();
  }

  getTotalCashBalance() {
    let income = 0;
    let expense = 0;
    (this.data.cash.transactions || []).forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else if (tx.type === 'expense') expense += amt;
    });
    return {
      income,
      expense,
      balance: income - expense
    };
  }

  // Events / Calendar
  addEvent(event) {
    const newEvent = {
      id: 'evt-' + Date.now(),
      ...event
    };
    this.data.events.push(newEvent);
    this.saveData();
    return newEvent;
  }

  deleteEvent(eventId) {
    this.data.events = this.data.events.filter(e => e.id !== eventId);
    this.saveData();
  }
}

export const store = new Store();
window.resetClassHubData = () => {
  store.resetToDefault();
  localStorage.removeItem('classhub_session_v2');
  localStorage.removeItem('classhub_guide_dismissed');
  location.reload();
};
