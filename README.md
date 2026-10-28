<div align="center">

  <img src="public/pwa-512x512.png" width="96" height="96" alt="ClassHub Logo" style="border-radius: 20px; margin-bottom: 12px;" />

  # 🎓 ClassHub

  **Portal Terpadu & Pendamping Harian Kelas XI PPLG**  
  *Platform web modern, cepat, dan realtime untuk menghubungkan siswa & pengurus kelas.*

  🌐 **[glitchlesspplg.vercel.app](https://glitchlesspplg.vercel.app/)**

  [![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://glitchlesspplg.vercel.app/)
  [![Version](https://img.shields.io/badge/Version-2.2.0-blue?style=for-the-badge)](package.json)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-FF6600?style=for-the-badge&logo=pwa&logoColor=white)](public/manifest.webmanifest)

</div>

---

## ✨ Tentang ClassHub

**ClassHub** adalah portal kelas berbasis web yang menggabungkan kemudahan akses siswa dengan konsol pengelolaan praktis bagi pengurus kelas. 

Dibangun dengan prinsip **Today First**, siswa dapat langsung melihat agenda hari ini dalam hitungan detik tanpa perlu login ribet (*Zero-Login Portal*), sementara pengurus memiliki dashboard terpadu untuk menjaga transparansi dan keteraturan kelas.

---

## 🚀 Fitur Unggulan

### 📱 Portal Siswa (Daily Companion)
* **Live Class Tracker** — Pelacakan jam pelajaran aktif secara *real-time* dengan penanda jeda istirahat dan jam kepulangan.
* **Tugas & Ujian** — Daftar tugas aktif dengan checklist interaktif, filter status (*Belum Selesai*, *Mendesak*, *Selesai*), dan *countdown* ujian terdekat.
* **Jadwal & Kalender Terpadu** — Tampilan kartu harian yang responsif serta kalender bulanan yang merangkum jadwal, tugas, dan acara kelas.
* **Transparansi Kas & Iuran** — Rekap saldo kas, catatan mutasi, dan matriks pembayaran iuran siswa yang terbuka dan jelas.
* **Pengumuman & Direktori Kelas** — Papan mading kelas interaktif, pin pengumuman penting, dan daftar kontak siswa.

### 🛡️ Management Console (Pengurus)
* **Kelola Seluruh Data** — Pengelolaan terpusat untuk tugas, jadwal pelajaran, regu piket, catatan kas, dan pengumuman.
* **WhatsApp Reminder Generator** — Format pengingat harian otomatis dan rapi, siap dibagikan ke grup WhatsApp hanya dengan 1 klik.
* **Sistem Keamanan Dual-PIN** — Pemisahan akses antara **PIN Pengurus Harian** (operasional rutin) dan **Master PIN Keamanan** (area sensitif & pengaturan sistem).
* **Audit Log (Riwayat Aktivitas)** — Pencatatan kronologis perubahan data untuk akuntabilitas dan jejak rekam pengurus.
* **Kontrol Pemeliharaan Modul** — Sakelar fleksibel untuk mengunci modul publik siswa saat sedang proses rekap atau pembaruan.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | [React 18](https://react.dev/) & [Vite 6](https://vitejs.dev/) |
| **Database & Realtime** | [Supabase](https://supabase.com/) (PostgreSQL + Realtime Subscriptions) |
| **Styling** | Vanilla CSS3 (Design Tokens System, Responsive, Dark/Light Mode) |
| **PWA Engine** | `vite-plugin-pwa` (Offline Caching & App Manifest) |
| **Ikonografi & Aset** | [Lucide React](https://lucide.dev/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Tipografi** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |

---

## 💻 Cara Menjalankan Proyek

### 1. Prasyarat
* [Node.js](https://nodejs.org/) (versi 18 ke atas)
* npm atau yarn

### 2. Instalasi & Menjalankan Lokal

```bash
# Clone repositori
git clone https://github.com/FauzanZuhri/glitchless.git
cd Web-kelas

# Install dependensi
npm install

# Jalankan development server
npm run dev
```

Buka peramban di **`http://localhost:3000`**.

### 3. Konfigurasi Lingkungan (Opsional)
Untuk mengaktifkan sinkronisasi cloud realtime antar perangkat, buat file `.env` di direktori utama:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Catatan:** Jika Supabase tidak dikonfigurasi, aplikasi tetap berfungsi penuh menggunakan *local storage* sebagai penyimpanan mandiri (*offline-first fallback*).

### 4. Build Produksi

```bash
npm run build
npm run preview
```

### 🌐 Live Deployment
Aplikasi telah dideploy dan dapat diakses langsung di:  
👉 **[https://glitchlesspplg.vercel.app/](https://glitchlesspplg.vercel.app/)**

---

## 🔐 Hak Akses & Kredensial Demo

| Peran | Akses | Kredensial Default | Cakupan |
| :--- | :--- | :--- | :--- |
| **Siswa** | Publik (Zero-Login) | Tanpa Login | Melihat agenda harian, jadwal, tugas, kas, dan pengumuman |
| **Pengurus** | Tombol Admin / `/admin` | `admin123` | Mengelola data harian tugas, jadwal, kas, dan agenda |
| **Master Admin** | Security Gate | `master123` | Akses Area Terlindungi (Ganti PIN, Kontrol Modul, Audit Log, Reset) |

---

## 📱 Dukungan Progressive Web App (PWA)

ClassHub dapat diinstal langsung ke layar utama (*Add to Home Screen*) pada perangkat **Android**, **iOS**, **Windows**, dan **macOS**. Aplikasi mendukung caching aset offline dan waktu muat instan.

---

## 📲 Integrasi WhatsApp Gateway & Otomasi Grup

ClassHub dilengkapi dengan integrasi WhatsApp Gateway untuk mengirimkan pesan briefing kelas harian (*Daily Brief*) langsung dan otomatis ke grup WhatsApp kelas:

* **Penyedia Gateway:** Mendukung **Fonnte** (rekomendasi untuk Indonesia), **Wablas**, dan **Custom Webhook/REST API**.
* **Otomasi Pengiriman Terjadwal:** Mengirimkan pesan pengingat jadwal, deadline tugas, dan petugas piket esok hari secara otomatis pada jam yang ditentukan (default: **19:00 WIB**, Minggu–Kamis malam).
* **1-Click Kirim Langsung:** Tombol **"Kirim ke Grup WA"** di dialog WhatsApp Brief untuk pengiriman instan ke grup kelas dengan feedback status real-time.
* **Pengaturan & Uji Coba:** Dikonfigurasi melalui **Konsol Admin &rarr; Identitas & Pengaturan &rarr; WhatsApp & Otomasi**, lengkap dengan tombol pengujian koneksi (*Test Ping*).

---

<div align="center">

  <sub>Dibuat dengan dedikasi untuk seluruh warga kelas XI PPLG.</sub><br/>
  <strong>ClassHub v2.2.0</strong>

</div>
