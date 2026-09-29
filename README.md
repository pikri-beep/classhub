<p align="center">
  <img src="public/pwa-512x512.png" width="120" alt="ClassHub Logo" />
</p>

<h1 align="center">🎓 ClassHub — Portal Manajemen Kelas XI PPLG</h1>

<p align="center">
  <strong>Satu tempat untuk seluruh kebutuhan koordinasi kelas.</strong><br/>
  Web app modern, minimalis, dan realtime — dibangun untuk siswa & pengurus kelas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3FCF8E?logo=supabase&logoColor=white&style=flat-square" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-Installable-FF6600?logo=pwa&logoColor=white&style=flat-square" alt="PWA" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white&style=flat-square" alt="Vercel" />
</p>

---

## ✨ Apa Itu ClassHub?

ClassHub adalah **web portal kelas** yang dirancang khusus untuk kelas **XI PPLG** — menggabungkan konsep **"Today First" Daily Companion** untuk siswa dengan **Management Console** terpusat bagi pengurus kelas. Semua data tersinkronisasi secara **realtime** antar perangkat melalui Supabase.

### 🎯 Prinsip Desain

| Prinsip | Penjelasan |
| :--- | :--- |
| ⚡ **Aturan 3 Detik** | Siswa langsung paham status belajarnya saat membuka portal |
| 🚫 **Zero Instructional Copy** | Tidak ada teks panduan "cara klik" — UI cukup intuitif |
| 📦 **Progressive Disclosure** | Detail masuk ke modal/drawer, tampilan utama tetap bersih |
| 🎨 **Disiplin Warna** | Warna cerah hanya untuk status kritis (merah = deadline, hijau = tuntas) |
| 👤 **Personal-First View** | Utamakan "data saya" di atas data seluruh kelas |

---

## 🌟 Fitur Utama

### 1. 📱 Dashboard Siswa — "Today First" Daily Companion

- **Live Class Tracker** — Pelacakan mata pelajaran aktif secara *real-time*: waktu sisa KBM, deteksi cerdas jeda istirahat, jam kosong, dan hari libur.
- **Tugas Terdekat** — Checklist tugas paling mendesak dengan aksi 1-klik tuntas dan selebrasi visual (*confetti* 🎉).
- **Regu Piket Hari Ini** — Tampilan petugas piket dengan badge khusus `★ (Kamu)` jika giliran Anda.
- **Ujian & Acara Terdekat** — Countdown otomatis ujian dan event kelas dalam 7 hari ke depan.
- **Pengumuman Tersemat** — Informasi penting langsung muncul di dashboard.

### 2. 📅 Jadwal Mingguan & Kalender Interaktif

- **Tampilan Kartu Adaptif** — 100% responsif tanpa *horizontal scroll*, rapi di HP maupun desktop.
- **Dual View**: Tab **Pelajaran** (jadwal harian per hari) dan **Kalender** (kalender bulanan visual).
- **Unified Events** — Kalender menampilkan gabungan ujian, deadline tugas, dan acara kelas dalam satu tampilan.
- **Admin: Tambah Acara** — Pengurus dapat menambah acara/event langsung dari kalender.

### 3. 📝 Akademik: Tugas & Ujian

- **Checklist Tugas Per Siswa** — Setiap siswa menandai sendiri tugas yang sudah dikerjakan.
- **Filter & Pencarian** — Filter berdasarkan status (belum/selesai) dan mata pelajaran.
- **Detail Tugas Expandable** — Klik untuk lihat deskripsi, link pengumpulan, dan progress kelas.
- **Jadwal Ujian** — Countdown dinamis: 🔴 Merah (H-2 s.d. Hari H), 🟠 Oranye (H-3 s.d. H-5), 🔵 Biru (masih lama).
- **Admin: Kelola Tugas & Ujian** — Tambah, hapus, dan pantau status pengumpulan seluruh siswa.

### 4. 💰 Buku Kas & Matriks Iuran

- **Saldo Kas Real-time** — Ringkasan pemasukan, pengeluaran, dan saldo aktual.
- **Navigasi Bulan** — Berpindah antar periode iuran bulanan dengan `MonthNavigator`.
- **Matriks Transparansi** — Status pembayaran per siswa per periode iuran (✅ Lunas / ❌ Belum).
- **Pencarian Siswa** — Cari nama siswa di tabel iuran.
- **Riwayat Transaksi** — Log lengkap setiap pemasukan dan pengeluaran kas.
- **Admin: Catat & Kelola** — Tambah transaksi, buat periode iuran, dan toggle status bayar per siswa.

### 5. 👥 Kelas: Pengumuman & Direktori

- **Pengumuman Berkategori** — Filter: Semua, Penting, Akademik, Kegiatan, Keuangan.
- **Pin & Unpin** — Sematkan pengumuman prioritas agar selalu tampil di atas.
- **Direktori Teman Sekelas** — Daftar 35 siswa lengkap dengan nomor absen, jabatan, dan pencarian.
- **Profil Kelas** — Nama kelas, sekolah, tahun ajaran, wali kelas, dan logo kelas yang dapat dikustomisasi.
- **Admin: Upload Logo** — Upload dan kompres logo kelas otomatis (WebP/JPEG, maks 320px).

### 6. 📲 WhatsApp Brief Harian

- **Format Pesan Ultra-Clean & Dinamis**:
  - 📅 **Jadwal Besok** — Daftar mata pelajaran (tanpa jam/guru/ruangan)
  - 📝 **Deadline Besok** — Tugas yang jatuh tempo (*otomatis tersembunyi jika kosong*)
  - 🧹 **Piket Besok** — Daftar petugas piket (*otomatis tersembunyi jika libur*)
  - 🎯 **Ujian Terdekat** — 1–2 ujian dalam 7 hari ke depan (*otomatis tersembunyi jika tidak ada*)
- **Mode Pratinjau & Edit** — Preview teks atau edit langsung sebelum dibagikan.
- **Pemilih Tanggal Fleksibel** — Besok, Hari Ini, atau tanggal kustom.
- **1-Klik Aksi** — Tombol `Copy Message` dan `Share WhatsApp` langsung.

### 7. 🛡️ Admin Management Console

- **Dashboard Overview** — Statistik ringkas: total siswa, tugas aktif, saldo kas, dan pengumuman.
- **Navigasi Modular** — Sidebar desktop dan tab navigasi cepat di mobile.
- **Kelola Semua Data** — Tugas, ujian, jadwal, piket, kas, pengumuman, dan anggota kelas.
- **Preview as Student** — Admin dapat melihat portal dari sudut pandang siswa.
- **Manajemen Anggota** — Tambah, edit, dan hapus data siswa.
- **Pengaturan Kelas** — Edit nama app, nama kelas, sekolah, tahun ajaran, wali kelas, dan logo.
- **Reset Data** — Kembalikan seluruh data ke kondisi awal (*seed data*) untuk testing.

### 8. ☁️ Supabase Realtime Sync

- **Sinkronisasi Instan** — Perubahan data oleh admin langsung muncul di HP semua siswa.
- **WebSocket Realtime** — Menggunakan Supabase Realtime subscriptions untuk push updates.
- **Fallback localStorage** — Jika Supabase tidak dikonfigurasi, data tetap tersimpan lokal.
- **Arsitektur Hybrid** — Data statis (jadwal, roster) di kode sumber + data dinamis (tugas, kas) di cloud.

### 9. 📱 PWA (Progressive Web App)

- **Installable** — Add to Home Screen di Android, iOS, Windows, dan macOS.
- **Service Worker** — Caching aset dan Google Fonts untuk performa offline.
- **Maskable Icon** — Ikon adaptif yang tampil sempurna di semua launcher.
- **Install Banner** — Prompt instalasi otomatis muncul bagi pengguna baru.

### 10. 🔒 Keamanan

- **Akses Publik Siswa** — Portal terbuka untuk semua siswa tanpa login (Zero-Login Portal).
- **PIN Admin Tersembunyi** — Pengurus masuk via PIN terpisah yang disimpan aman.
- **Keyboard Shortcut** — `Ctrl+Shift+A` atau `Alt+A` untuk buka dialog login admin.
- **URL-based Access** — Akses `/admin` atau `#admin` untuk memicu login admin.
- **Supabase RLS** — Row Level Security aktif di tabel database.

---

## 🔑 Akses & Kredensial Demo

Portal menggunakan model **Zero-Login** — siswa langsung masuk tanpa akun:

| Tipe Akun | Cara Masuk | Kredensial | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Siswa** | Langsung terbuka saat membuka portal | — (tanpa login) | Dashboard, jadwal, tugas, kas, kelas |
| **Admin (Pengurus)** | `Ctrl+Shift+A`, `Alt+A`, atau akses `/admin` | PIN: `admin123` | Akses penuh Management Console |

> **Tips:** Setelah login admin, gunakan tombol **"Preview as Student"** untuk melihat tampilan dari sisi siswa.

---

## 💻 Menjalankan Proyek Secara Lokal

### Prasyarat

- [Node.js](https://nodejs.org/) versi 18 ke atas
- (Opsional) Akun [Supabase](https://supabase.com/) untuk sinkronisasi realtime

### Langkah Cepat

```bash
# 1. Clone repository
git clone https://github.com/FauzanZuhri/glitchless.git
cd Web-kelas

# 2. Install dependensi
npm install

# 3. (Opsional) Konfigurasi Supabase
#    Salin .env.example menjadi .env dan isi kredensial Supabase
cp .env.example .env

# 4. Jalankan server development
npm run dev
```

Buka di browser: **`http://localhost:3000`**

### 🌐 Berbagi ke Jaringan Lokal (HP / Teman Sekelas)

```bash
npm run dev -- --host
```

Teman yang berada di WiFi/Hotspot yang sama dapat mengakses via IP lokal yang ditampilkan di terminal.

### 📦 Build Produksi

```bash
npm run build     # Build ke folder dist/
npm run preview   # Preview hasil build secara lokal
```

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root proyek (atau set di Vercel Dashboard):

```env
# Supabase Configuration
# Dapatkan dari: Supabase Dashboard → Project Settings → API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Tanpa Supabase?** Aplikasi tetap berjalan penuh menggunakan `localStorage` sebagai fallback. Fitur realtime sync antar perangkat saja yang tidak aktif.

---

## 📁 Struktur Proyek

```
Web-kelas/
├── index.html                    # SPA root, PWA meta tags, Open Graph
├── package.json                  # Dependensi & scripts (v2.0.0)
├── vite.config.js                # Konfigurasi Vite, PWA plugin, Supabase env
├── vercel.json                   # Konfigurasi deploy Vercel (SPA rewrites, headers)
├── .env.example                  # Template environment variables
│
├── public/                       # Aset statis & ikon PWA
│   ├── pwa-192x192.png           # Ikon PWA 192×192
│   ├── pwa-512x512.png           # Ikon PWA 512×512
│   ├── maskable-icon-512x512.png # Ikon maskable untuk launcher
│   ├── apple-touch-icon.png      # Ikon untuk iOS
│   ├── Logo-Kelas.jpeg           # Logo kelas XI PPLG
│   └── ...                       # Favicon, logo SVG, dll.
│
├── supabase/
│   └── schema.sql                # Skema database PostgreSQL (class_store + RLS)
│
├── src/
│   ├── main.jsx                  # Entry point React
│   ├── App.jsx                   # Root component, routing Student ↔ Admin
│   ├── index.css                 # Design system, tokens, utilitas CSS
│   │
│   ├── components/
│   │   ├── AdminSidebar.jsx      # Sidebar desktop & mobile nav bar (Admin)
│   │   ├── BottomDock.jsx        # Bottom navigation dock (Siswa, mobile)
│   │   ├── StudentHeader.jsx     # Header atas minimalis (Siswa)
│   │   ├── Header.jsx            # Header utilitas & info kelas
│   │   ├── LiveClassTracker.jsx  # Widget jam KBM real-time & deteksi istirahat
│   │   ├── WhatsAppShareModal.jsx# Generator pesan WhatsApp harian
│   │   ├── MonthNavigator.jsx    # Navigasi antar bulan (periode iuran kas)
│   │   ├── Modal.jsx             # Komponen modal dialog serbaguna
│   │   └── InstallBanner.jsx     # Banner ajakan instalasi PWA
│   │
│   ├── context/
│   │   ├── AuthContext.jsx       # Autentikasi: Zero-Login siswa + PIN admin
│   │   ├── StoreContext.jsx      # State management + Supabase realtime sync
│   │   ├── ThemeContext.jsx      # Pengatur tema (Dark / Light mode)
│   │   └── ToastContext.jsx      # Sistem notifikasi toast interaktif
│   │
│   ├── views/
│   │   ├── DashboardView.jsx     # Dashboard siswa "Today First"
│   │   ├── ScheduleView.jsx      # Jadwal pelajaran + kalender interaktif
│   │   ├── AcademicView.jsx      # Tugas & ujian (checklist per siswa)
│   │   ├── CashStudentView.jsx   # Buku kas, matriks iuran, & riwayat transaksi
│   │   ├── ClassView.jsx         # Pengumuman, direktori siswa, & profil kelas
│   │   └── AdminDashboardView.jsx# Management Console terpadu (1900+ baris)
│   │
│   ├── hooks/
│   │   └── usePWAInstall.js      # Custom hook untuk PWA install prompt
│   │
│   └── lib/
│       ├── supabase.js           # Supabase client dengan auto-sanitize URL
│       ├── dateUtils.js          # Format tanggal Indonesia & label relatif
│       ├── duesUtils.js          # Utilitas periode iuran bulanan
│       └── imageUtils.js         # Kompresi & resize gambar untuk logo upload
│
├── dist/                         # Output build produksi (siap deploy)
├── DEPLOY_CHECKLIST.md           # Panduan & checklist pra-peluncuran
└── FUTURE_PLAN.md                # Roadmap fitur v3.0
```

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend** | [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Backend / BaaS** | [Supabase](https://supabase.com/) (PostgreSQL + Realtime WebSocket) |
| **Styling** | Vanilla CSS3 — Design Tokens Architecture |
| **PWA** | `vite-plugin-pwa` (Service Worker, Workbox, Maskable Icons) |
| **Ikon** | [Lucide React](https://lucide.dev/) |
| **Animasi** | `canvas-confetti` (selebrasi tugas selesai) |
| **Tipografi** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts) |
| **Deploy** | [Vercel](https://vercel.com/) (SPA rewrites, header caching) |
| **Database** | Supabase PostgreSQL + JSONB store + RLS |

---

## 🏗️ Arsitektur Data: Hybrid

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ARSITEKTUR HYBRID CLASSHUB                      │
├──────────────────────────────┬──────────────────────────────────────┤
│   DATA STATIS (di kode)      │   DATA DINAMIS (di Supabase)         │
│                              │                                      │
│   • Jadwal mapel Senin-Jumat │   • Tugas harian              🔄    │
│   • Daftar nama siswa        │   • Pengumuman kelas           🔄    │
│   • Info kelas & wali kelas  │   • Transaksi kas              🔄    │
│   • Jadwal piket harian      │   • Status iuran per siswa     🔄    │
│   • Jam bel KBM              │   • Jadwal ujian               🔄    │
│                              │   • Status checklist tugas     🔄    │
│   Ubah: edit kode → build    │   Ubah: admin UI → sync semua HP    │
└──────────────────────────────┴──────────────────────────────────────┘
```

**Tanpa Supabase:** Semua data tersimpan di `localStorage` browser — cocok untuk development dan demo.  
**Dengan Supabase:** Data tersinkronisasi realtime antar seluruh perangkat — cocok untuk penggunaan kelas nyata.

---

## 🗄️ Database Schema

ClassHub menggunakan **satu tabel JSONB** di Supabase PostgreSQL:

```sql
CREATE TABLE public.class_store (
    id          TEXT PRIMARY KEY,
    data        JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- **RLS (Row Level Security)** aktif — `SELECT`, `INSERT`, `UPDATE` terbuka untuk `anon` & `authenticated`.
- **Realtime** — Tabel terpublish ke `supabase_realtime` untuk WebSocket subscriptions.
- **Full file:** [`supabase/schema.sql`](supabase/schema.sql)

---

## 🚀 Deploy ke Vercel

1. **Push** repository ke GitHub.
2. **Import** project di [Vercel Dashboard](https://vercel.com/new).
3. **Set Environment Variables** di Vercel:
   - `VITE_SUPABASE_URL` → URL project Supabase
   - `VITE_SUPABASE_ANON_KEY` → Anon public key Supabase
4. **Deploy** — Vercel otomatis mendeteksi Vite dan menjalankan `npm run build`.

> Konfigurasi `vercel.json` sudah menyertakan SPA rewrites dan header caching untuk Service Worker & manifest PWA.

---

## 🔄 Reset Data Demo

Jika data ingin dikembalikan ke kondisi awal (*seed data*):

1. Login sebagai **Admin** (`Ctrl+Shift+A`, PIN: `admin123`)
2. Buka tab **Pengaturan** di Admin Console
3. Klik tombol **"Reset Semua Data"**
4. Konfirmasi — seluruh data kembali ke default

---

## 📱 Tampilan & Navigasi

### Siswa (Mobile)
| Navigasi | Tampilan |
| :--- | :--- |
| **Bottom Dock** 5 tab | Hari Ini · Jadwal · Akademik · Kas · Kelas |
| **Badge** notifikasi | Jumlah tugas belum selesai di tab Akademik |

### Admin (Desktop & Mobile)
| Navigasi | Menu |
| :--- | :--- |
| **Sidebar** (desktop) / **Tab Bar** (mobile) | Overview · Akademik · Jadwal · Kas · Kelas · WhatsApp · Pengaturan |
| **Floating Action** | Preview as Student · Logout |

---

## 👨‍💻 Tim Pengembang

Dibuat oleh siswa **XI PPLG** untuk mempermudah koordinasi, transparansi, dan produktivitas seluruh anggota kelas.

| Peran | Nama |
| :--- | :--- |
| Lead Developer | Fauzan Zuhri |
| Kontributor | Seluruh pengurus kelas XI PPLG |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan internal kelas XI PPLG. Silakan fork dan adaptasi untuk kelas Anda sendiri.

---

<p align="center">
  <em>Dibuat dengan ❤️ untuk kelas XI PPLG</em><br/>
  <strong>ClassHub v2.0.0</strong> — Portal Manajemen Kelas Terpadu
</p>
