# 🎓 ClassHub — Portal Manajemen Kelas Terpadu (v2.0)

> **"Satu tempat untuk mengatur seluruh urusan kelas."**  
> Web aplikasi modern, ultra-clean, minimalis, dan responsif untuk mengelola kegiatan akademik, tugas harian, jadwal pelajaran real-time, serta transparansi kas kelas **XII PPLG 1 (SMKN 1)**.

---

## 🌟 Fitur Unggulan

### 1. ⚡ Live Class Status & Tracker Real-Time (P1)
- **Status KBM Aktif**: Menampilkan nama mata pelajaran yang sedang berlangsung, guru pengampu, dan ruang/lab komputer.
- **Hitung Mundur Presisi**: Jam digital WIB terintegrasi dengan progress bar durasi KBM dan countdown sisa menit secara real-time.
- **Deteksi Cerdas Jeda & Jam Kosong**:
  - ☕ **Waktu Istirahat & Ishoma**: Otomatis mendeteksi waktu istirahat (jam 10:00 dan 12:30) serta menghitung mundur waktu istirahat berakhir.
  - 📖 **Jam Kosong Kondisional**: Mendeteksi jeda waktu bebas/mandiri antar jam pelajaran.
  - 🌅 **Sebelum KBM** & 🎒 **KBM Selesai**: Menampilkan salam pembuka pagi atau ucapan selesai KBM serta preview jadwal pelajaran esok hari.
  - 🏖️ **Akhir Pekan**: Mode santai akhir pekan dengan ringkasan jadwal hari Senin.

### 2. 📲 Generator Rekap Tugas ke WhatsApp (P1)
- **1-Klik Salin Format WA**: Sekretaris atau siswa dapat mengekspor seluruh tugas aktif ke format pesan WhatsApp yang rapi, lengkap dengan emoji, tebal (*bold*), tenggat waktu, dan link tugas.
- **Cakupan Fleksibel**: Pilihan ekspor *"Semua Tugas Kelas"* (cocok untuk broadcast grup kelas) atau *"Tugas Belum Selesai (Saya)"*.
- **Direct WhatsApp Share**: Tombol langsung untuk membuka WhatsApp (`api.whatsapp.com`) di smartphone atau WhatsApp Web di desktop.

### 3. 📝 Manajemen Tugas & Progres Siswa
- **Status 3 Tahap**: Tandai progres tugas pribadi: **Belum Mulai** (🔴), **Dikerjakan** (🟡), **Selesai** (🟢).
- **Efek Selebrasi (Confetti)**: Animasi kembang api visual saat seluruh tugas harian tuntas diselesaikan.
- **Progress Bar Kelas**: Melihat persentase penyelesaian tugas oleh seluruh siswa di kelas.

### 4. 📅 Jadwal Pelajaran & Regu Piket Harian
- Jadwal lengkap mata pelajaran Senin s.d. Jumat lengkap dengan jam, guru, dan ruangan.
- Pembagian regu piket harian dengan badge khusus pengingat jika hari ini giliran Anda bertugas.

### 5. 💰 Transparansi Kas & Matrix Iuran
- **Matrix Iuran Siswa**: Tabel transparansi status pembayaran kas per anggota per pekan (Lunas / Belum).
- **Buku Kas Digital**: Pencatatan riwayat arus pemasukan dan pengeluaran secara transparan dengan kalkulasi saldo otomatis.

### 6. ⏳ Countdown & Jadwal Ujian
- Hitung mundur *real-time* menuju PTS, PAS, dan Ujian Sertifikasi Kompetensi (BNSP/Ujikom).
- Rangkuman kisi-kisi dan ruang lingkup materi ujian.

### 7. 🗓️ Kalender & Agenda Terpadu
- Kalender visual bulanan interaktif yang menggabungkan agenda kegiatan, deadline tugas, dan jadwal ujian dalam satu tampilan.

### 8. 👥 Direktori Anggota Kelas
- Struktur pengurus kelas (Ketua, Wakil, Sekretaris, Bendahara, Seksi-seksi) dan direktori siswa lengkap dengan nomor absen serta NISN.

### 9. 🌓 Tema Gelap & Terang (*Dark & Light Mode*)
- Palet warna hangat minimalis bergaya Notion/Linear yang nyaman di mata untuk penggunaan jangka panjang.

### 10. 📱 PWA & 100% Responsif di HP
- Dapat diinstal langsung ke Layar Utama (*Add to Home Screen*) pada Android & iOS seperti aplikasi native.

---

## 🔑 Akun & Kredensial Pengujian (*Default Credentials*)

Aplikasi dilengkapi data bawaan (*seed data*) yang siap langsung digunakan:

| Tipe Akun | Cara Masuk | PIN Default | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Siswa (Member)** | Pilih nama dari dropdown siswa (cth: *Ahmad Fauzan*) | `1234` | Akses penuh informasi kelas & kelola checklist tugas pribadi |
| **Pengurus (Admin)** | Masuk melalui tab Admin / Pengurus | `admin123` | Hak kelola: buat/edit/hapus tugas, pengumuman, ujian, jadwal, dan kas |

> **Catatan:** Anda dapat beralih akun kapan saja melalui tombol **"Ganti Akun"** di header atas atau menu di mobile.

---

## 💻 Panduan Menjalankan Proyek Secara Lokal

Proyek ini dibangun menggunakan **React 18**, **Vite**, dan **PWA**:

### 1. Prasyarat
Pastikan komputer Anda sudah terpasang [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan).

### 2. Langkah Instalasi & Menjalankan Dev Server

```bash
# 1. Masuk ke folder proyek
cd glitchless

# 2. Install dependencies (hanya perlu sekali di awal)
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban di: **`http://localhost:5173`**

---

### 🌐 Berbagi Tampilan ke Teman Sekelas (WiFi / Hotspot yang Sama)

Jika Anda ingin teman di kelas atau lab bisa langsung membuka dan mencoba web ini dari HP atau laptop mereka tanpa perlu clone Git:

```bash
npm run dev -- --host
```

Vite akan menampilkan alamat IP lokal jaringan Anda, misalnya:
`➜ Network: http://192.168.1.45:5173/`

Teman Anda cukup mengetikkan alamat tersebut di peramban mereka!

---

### 📦 Perintah Build & Preview Produksi

```bash
# Melakukan build bundle produksi yang dioptimalkan
npm run build

# Menjalankan preview lokal dari hasil build dist/
npm run preview
```

---

## 📁 Struktur Folder Proyek (v2.0)

```
glitchless/
├── index.html               # Halaman utama aplikasi (SPA root & PWA meta)
├── package.json             # Konfigurasi dependensi & skrip Vite
├── vite.config.js           # Konfigurasi bundler Vite & plugin PWA
├── public/                  # Aset statis & manifest PWA
├── src/
│   ├── main.jsx             # Entry point React
│   ├── App.jsx              # Komponen root & routing tampilan
│   ├── index.css            # Desain sistem, token warna, & animasi
│   ├── components/
│   │   ├── Header.jsx            # Bar navigasi atas & switcher akun
│   │   ├── Sidebar.jsx           # Navigasi desktop bergaya Notion
│   │   ├── MobileNav.jsx         # Bottom nav & drawer mobile
│   │   ├── Modal.jsx             # Komponen modal dialog serbaguna
│   │   ├── InstallBanner.jsx     # Banner ajakan instalasi PWA
│   │   ├── LiveClassTracker.jsx  # Widget jam KBM real-time & jeda istirahat
│   │   └── WhatsAppShareModal.jsx# Generator & pratinjau rekap tugas WhatsApp
│   ├── context/
│   │   ├── AuthContext.jsx       # State manajemen sesi & login pengguna
│   │   ├── StoreContext.jsx      # State manajemen data kelas (tugas, kas, dll.)
│   │   ├── ThemeContext.jsx      # Pengatur tema (Dark / Light mode)
│   │   └── ToastContext.jsx      # Sistem notifikasi toast
│   └── views/
│       ├── LoginGate.jsx         # Layar gerbang masuk siswa / admin
│       ├── DashboardView.jsx     # Halaman ringkasan fokus harian
│       ├── AcademicView.jsx      # Halaman tugas & jadwal ujian
│       ├── ScheduleView.jsx      # Halaman jadwal pelajaran & kalender
│       ├── CashView.jsx          # Halaman matrix kas & riwayat transaksi
│       └── ClassView.jsx         # Halaman pengumuman & direktori siswa
└── dist/                    # Output build produksi siap deploy
```

---

## 🛠️ Tumpukan Teknologi (*Tech Stack*)

- **Frontend Core**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Pure CSS3 dengan Arsitektur Design Tokens (Notion & Linear UI Style)
- **PWA**: `vite-plugin-pwa` (Mendukung instalasi di Android/iOS)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Efek Mikro**: `canvas-confetti`
- **Tipografi**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)

---

## 🔄 Reset Data Testing / Demo
Jika data lokal ingin dikembalikan ke kondisi awal pengujian:
1. Klik tombol **"Ganti Akun"** di header atas.
2. Klik tombol merah **"Reset Data Testing"**.
3. Seluruh data tugas, kas, dan pengumuman akan kembali ke data bawaan awal.

---
*Dibuat dengan ❤️ untuk kemudahan koordinasi dan transparansi kelas XII PPLG 1.* 🚀
