# 🎓 ClassHub — Portal Manajemen Kelas Terpadu

> **"Satu tempat untuk mengatur seluruh kebutuhan dan koordinasi kelas."**  
> Web aplikasi modern, ultra-clean, minimalis, dan responsif dengan konsep **Today First / Daily Companion** untuk siswa, serta **Management Console** terpusat bagi pengurus kelas.

---

## 🌟 Fitur Utama

### 1. 📱 Tampilan Siswa: "Today First" (Daily Companion)
- **Ringkasan Cepat Hari Ini**: Siswa langsung disambut oleh informasi yang paling relevan saat ini:
  - **Live Class Tracker**: Pelacakan mata pelajaran aktif *real-time*, waktu sisa menit KBM, serta deteksi pintar jeda istirahat dan jam kosong.
  - **Tugas Terdekat**: Checklist tugas hari ini atau yang paling mendesak dengan aksi 1-klik tuntas dan selebrasi visual (*confetti*).
  - **Regu Piket Hari Ini**: Tampilan siapa saja yang bertugas piket hari ini, lengkap dengan penanda lencana khusus `★ (Kamu)` jika giliran Anda bertugas.
- **Navigasi Mobile Ramah Satu Tangan**: *Student Header* responsif dengan bilah navigasi horizontal (*smooth horizontal scroll*) tanpa menghilangkan akses menu di layar ponsel.

### 2. 📅 Jadwal Mingguan: Bebas Geser Samping (Zero Horizontal Scroll)
- Tampilan kartu adaptif 100% lebar layar yang rapi di layar HP maupun desktop.
- Mengurutkan mata pelajaran harian secara vertikal lengkap dengan nomor jam dan tag waktu tanpa menyebabkan *overflow-x* atau scroll samping yang membingungkan.

### 3. 📲 WhatsApp Brief Harian (Ultra-Clean & Dinamis)
- **Format Pesan Ringkas, Bersih, dan Berbobot**:
  1. 📅 **Jadwal Besok**: Daftar nomor urut mata pelajaran (`1. Upacara Bendera`, `2. Pemrograman Web`) tanpa jam, nama guru, atau ruangan.
  2. 📝 **Deadline Besok**: Daftar nomor urut tugas yang jatuh tempo esok hari tanpa jam. *Otomatis disembunyikan jika tidak ada tugas*.
  3. 🧹 **Piket Besok**: Daftar nomor urut petugas piket tanpa catatan panjang. *Otomatis disembunyikan jika hari libur atau tidak ada piket*.
  4. 🎯 **Ujian Terdekat**: Daftar ringkas 1–2 ujian paling dekat dalam rentang 7 hari ke depan beserta tanggalnya. *Otomatis disembunyikan jika tidak ada ujian terdekat*.
- **Emoji Terkendali**: Emoticon hanya disematkan pada subjudul utama (`📅`, `📝`, `🧹`, `🎯`) sehingga isi pesan tampak sangat rapi dan formal.
- **Mode Pratinjau & Edit Teks Langsung**: Pengurus dapat melihat preview teks atau langsung mengedit isi pesan di textarea jika ingin menambah instruksi khusus sebelum dibagikan.
- **Pemilih Tanggal Fleksibel**: Pilihan cepat `Besok`, `Hari Ini`, atau pemilih tanggal kustom.
- **1-Klik Aksi**: Tombol `Copy Message` dan tombol langsung `Share WhatsApp`.

### 4. 🛡️ Admin Management Console (Pusat Kendali Pengurus)
- **Desain Khusus Admin**: Sidebar navigasi modular desktop & bilah navigasi cepat di mobile.
- **Kelola Tugas Akademik**: Publikasi tugas baru, pemantauan status pengumpulan siswa secara terperinci, dan hapus tugas.
- **Jadwal Ujian & Ulangan Harian**: Manajemen jadwal ujian dengan hitung mundur otomatis berdasarkan kedekatan hari H (warna dinamis: Merah untuk H-2 s.d. Hari H, Oranye untuk H-3 s.d. H-5, Biru untuk waktu luang).
- **Pengelolaan Jadwal & Piket Interaktif**:
  - Penambahan jam pelajaran harian per hari (Senin–Jumat).
  - **Piket Bebas Salah Ketik (Typo-Free)**: Memilih anggota piket langsung dari dropdown data siswa terdaftar (`members`) dengan tampilan chip badge dan tombol silang (`✕`) sekali klik.
- **Buku Kas & Matriks Iuran**:
  - Saldo kas real-time, pencatatan transaksi pemasukan dan pengeluaran.
  - Matriks transparansi status pembayaran per siswa per periode iuran.
- **Pengumuman Tersemat (Pinned Announcements)**: Buat dan sematkan pengumuman prioritas untuk ditampilkan di dashboard.

### 5. 🔒 Keamanan & Privasi PIN Siswa
- **Perlindungan Akses**: PIN pribadi siswa dilindungi secara rahasia (`•••• Tersimpan Rahasia`).
- **Tanpa Plaintext di Admin**: Administrator tidak dapat mengintip PIN pribadi milik siswa.
- **Reset PIN ke Default**: Jika siswa lupa PIN, admin dapat menggunakan opsi **Reset PIN** untuk mengembalikan PIN akun siswa tersebut ke default (`1234`). Siswa dapat login kembali dan mengganti PIN secara mandiri.

### 6. 📱 PWA (Progressive Web App) & Offline Capable
- Mendukung instalasi langsung ke layar utama (*Add to Home Screen*) di perangkat Android, iOS, Windows, dan macOS.
- Bekerja secara responsif dan cepat didukung oleh Service Worker dan manifest PWA.

---

## 🔑 Akun & Kredensial Pengujian (Demo)

Aplikasi dilengkapi data bawaan (*seed data*) yang siap langsung digunakan:

| Tipe Akun | Cara Masuk | Kredensial Default | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Siswa (Member)** | Pilih nama dari daftar siswa (cth: *Ahmad Fauzan*) | PIN: `1234` | Akses penuh dashboard harian, jadwal mingguan, checklist tugas, dan kas |
| **Pengurus (Admin)** | Masuk melalui tab Pengurus / Admin | PIN: `admin123` | Akses penuh Management Console untuk mengelola seluruh data kelas |

> **Catatan:** Anda dapat beralih akun kapan saja melalui tombol **"Ganti Akun"** di header atas atau menu di mobile.

---

## 💻 Panduan Menjalankan Proyek Secara Lokal

Proyek ini dibangun menggunakan **React 18**, **Vite**, dan **Vanilla CSS**:

### 1. Prasyarat
Pastikan komputer Anda sudah terpasang [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan).

### 2. Langkah Menjalankan Aplikasi
```bash
# 1. Masuk ke direktori proyek
cd Web-kelas

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban di: **`http://localhost:5173`** (atau port yang ditampilkan di terminal Anda).

---

### 🌐 Berbagi Tampilan ke Jaringan Lokal (HP / Teman Sekelas)

Jalankan perintah berikut agar teman yang berada di WiFi/Hotspot yang sama dapat mengakses web dari perangkat mereka:
```bash
npm run dev -- --host
```

---

### 📦 Build Bundle Produksi

```bash
# Melakukan build bundle produksi
npm run build

# Menjalankan preview lokal dari hasil build dist/
npm run preview
```

---

## 📁 Struktur Folder Proyek

```
Web-kelas/
├── index.html               # Halaman utama aplikasi (SPA root & PWA meta)
├── package.json             # Konfigurasi dependensi & skrip Vite
├── vite.config.js           # Konfigurasi bundler Vite & plugin PWA
├── public/                  # Aset statis, ikon, & manifest PWA
├── src/
│   ├── main.jsx             # Entry point React
│   ├── App.jsx              # Komponen root & pemisahan alur Student / Admin
│   ├── index.css            # Desain sistem, token warna, & utilitas CSS
│   ├── components/
│   │   ├── AdminSidebar.jsx      # Navigasi desktop & mobile bar untuk Admin
│   │   ├── StudentHeader.jsx     # Navigasi atas minimalis untuk Siswa
│   │   ├── Header.jsx            # Header utilitas umum & switcher akun
│   │   ├── Modal.jsx             # Komponen modal dialog serbaguna
│   │   ├── InstallBanner.jsx     # Banner ajakan instalasi PWA
│   │   ├── LiveClassTracker.jsx  # Widget jam KBM real-time & jeda istirahat
│   │   └── WhatsAppShareModal.jsx# Fitur WhatsApp Brief (Pratinjau, Edit, & Share)
│   ├── context/
│   │   ├── AuthContext.jsx       # State manajemen sesi & login pengguna
│   │   ├── StoreContext.jsx      # State manajemen data kelas (tugas, kas, jadwal)
│   │   ├── ThemeContext.jsx      # Pengatur tema (Dark / Light mode)
│   │   └── ToastContext.jsx      # Sistem notifikasi toast interaktif
│   └── views/
│       ├── LoginGate.jsx         # Layar gerbang masuk siswa / admin
│       ├── DashboardView.jsx     # Dashboard siswa bertema "Today First"
│       ├── AdminDashboardView.jsx# Management Console terpadu untuk pengurus
│       ├── AcademicView.jsx      # Halaman daftar tugas & ujian siswa
│       ├── ScheduleView.jsx      # Halaman jadwal pelajaran mingguan (Card-based)
│       ├── CashView.jsx          # Halaman matrix kas & riwayat transaksi
│       └── ClassView.jsx         # Halaman pengumuman & direktori teman sekelas
└── dist/                    # Output build produksi siap deploy
```

---

## 🛠️ Tumpukan Teknologi (*Tech Stack*)

- **Frontend Core**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS3 dengan Arsitektur Design Tokens (High Signal, Zero Fluff)
- **PWA**: `vite-plugin-pwa` (Mendukung instalasi di Android, iOS, Windows, macOS)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Animasi Mikro**: `canvas-confetti`
- **Tipografi**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)

---

## 🔄 Reset Data Testing / Demo

Jika data lokal ingin dikembalikan ke kondisi awal pengujian:
1. Klik tombol **"Ganti Akun"** di header atas.
2. Klik tombol **"Reset Data"**.
3. Seluruh data tugas, kas, jadwal, dan pengumuman akan kembali ke data bawaan awal.

---
*Dibuat untuk mempermudah koordinasi, transparansi, dan produktivitas seluruh anggota kelas.* 🚀
