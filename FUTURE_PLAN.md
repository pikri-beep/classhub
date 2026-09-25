# 🚀 Future Plan & Roadmap — ClassHub v3.0

Dokumen ini merangkum **rencana pengembangan**, **arsitektur data**, dan **roadmap fitur** untuk evolusi ClassHub dari portal statis menjadi platform kelas kolaboratif.

---

## 📊 1. Status Proyek Saat Ini (v2.1)

### Fitur yang Sudah Selesai

| Fitur | File Utama |
| :--- | :--- |
| PWA + Offline + Install Prompt | `vite.config.js`, `InstallBanner.jsx` |
| Live Class Tracker & Countdown | `LiveClassTracker.jsx` |
| Akademik: Tugas & Ujian (Checklist) | `AcademicView.jsx` |
| Buku Kas & Matriks Iuran | `CashView.jsx` |
| Generator Pesan WhatsApp | `WhatsAppShareModal.jsx` |
| Notion-Style UI & Bottom Nav Dock | `index.css`, `App.jsx` |
| Clean UI & Diet Teks | Semua komponen |
| Zero-Login Portal (Bypass Login) | `App.jsx` |

### Prinsip Desain yang Dianut

1. **Aturan 3 Detik** — Siswa memahami status belajarnya seketika
2. **Zero Instructional Copy** — Tidak ada teks panduan "cara klik"
3. **Progressive Disclosure** — Detail masuk ke modal/drawer
4. **Disiplin Warna** — Warna cerah hanya untuk status kritis (merah = deadline, hijau = tuntas)
5. **Personal-First View** — Utamakan "data saya" di atas data seluruh kelas

---

## 🏗️ 2. Arsitektur Data: Hybrid (Statis + Database)

### Keputusan Arsitektur

ClassHub menggunakan pendekatan **hybrid**: data yang jarang berubah tetap di-hardcode dalam kode sumber, sementara data yang sering berubah disinkronkan melalui database cloud.

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
│   • Jam bel KBM              │   • Jadwal ujian mendadak      🔄    │
│                              │   • Status checklist tugas     🔄    │
│   Ubah: edit kode → build    │   Ubah: admin UI → sync semua HP    │
│         → deploy ulang       │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

### Mengapa Hybrid?

| Jenis Data | Frekuensi Berubah | Contoh | Penyimpanan |
| :--- | :--- | :--- | :--- |
| **Statis** | 1× per semester | Jadwal mapel, daftar siswa, piket | Hardcode di `StoreContext.jsx` |
| **Dinamis** | Harian / mingguan | Tugas baru, pengumuman, kas | Supabase (PostgreSQL) |

**Alasan**: Data statis (jadwal, siswa) hanya berubah saat pergantian semester — tidak perlu overhead database. Data dinamis (tugas, kas) berubah tiap hari dan harus terlihat oleh semua siswa secara realtime.

### Pilihan Database: Supabase (Rekomendasi)

| Aspek | Detail |
| :--- | :--- |
| **Tipe** | PostgreSQL (relasional) — cocok untuk relasi siswa ↔ tugas ↔ kas |
| **Auth** | Bawaan (email, PIN, anonymous) |
| **Storage** | Bawaan (untuk upload bukti bayar kas) |
| **Realtime** | Bawaan (data update langsung ke semua device) |
| **Harga** | Gratis (500MB DB, 1GB storage, 50K MAU) |
| **Dashboard** | Admin panel web otomatis |

---

## 📋 3. Checklist Pra-Peluncuran (Go-Live v2.1)

Pekerjaan yang harus selesai sebelum web dibagikan ke seluruh anggota kelas:

### A. Data Riil Kelas (`StoreContext.jsx`)
- [x] Nama kelas resmi (XI PPLG), tahun ajaran (2026/2027), kas (Rp 5.000/minggu)
- [x] Daftar siswa asli lengkap 35 siswa beserta nomor absen & struktur pengurus
- [x] Jadwal pelajaran riil Senin–Jumat sesuai jam bel KBM
- [x] Kalibrasi jam bel KBM di `LiveClassTracker.jsx` & deteksi istirahat
- [x] Jadwal piket kebersihan aktif (7 siswa/hari, Senin–Jumat)

### B. Branding & PWA
- [x] Nama dan deskripsi aplikasi di `vite.config.js` (`ClassHub — XI PPLG`)
- [ ] Ikon PWA (`pwa-192x192.png`, `pwa-512x512.png`)
- [x] Meta tag judul & deskripsi di `index.html`

### C. Aset Identitas Kelas
- [x] Logo kelas SVG modern (`/logo.svg`) bertema coding & identitas XI PPLG
- [ ] Ikon/badge visual per mata pelajaran di jadwal & Live Tracker
- [ ] Easter egg developer di footer & secret tap konfeti pada logo

### D. Build & Deploy
- [ ] Uji lokal di HP via WiFi: `npm run dev -- --host`
- [x] Build produksi bebas error: `npm run build`
- [ ] Deploy ke hosting (Vercel / Netlify / Cloudflare Pages)
- [ ] Uji instalasi PWA di Android & iOS
- [ ] Bagikan link ke grup WhatsApp kelas

---

## 🗓️ 4. Roadmap Pengembangan

```
  FASE SAAT INI                    FASE BERIKUTNYA
 ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────┐
 │  v2.1       │    │  v2.2           │    │  v3.0                │
 │  Go-Live    │ ──▶│  Quick Wins     │ ──▶│  Supabase Database   │
 │  Data Riil  │    │  Fitur Ringan   │    │  Sync & Multi-User   │
 │  + Branding │    │  Tanpa Database │    │  Admin Dashboard     │
 └─────────────┘    └─────────────────┘    └──────────────────────┘
```

### Fase v2.1 — Go-Live (Prioritas Sekarang)
| Tugas | Estimasi |
| :--- | :--- |
| Input data riil kelas ke `StoreContext.jsx` | 1 hari |
| Pasang logo & ikon PWA kelas | 1 hari |
| Build, deploy, & distribusi ke siswa | 1 hari |

### Fase v2.2 — Quick Wins (Tanpa Database)
Fitur ringan yang bisa ditambahkan tanpa integrasi database:

| Fitur | Kompleksitas | Dampak |
| :--- | :---: | :---: |
| Pintasan folder Google Drive per mapel | 🟢 Rendah | 🟡 Tinggi |
| Banner pengumuman darurat (manual di kode) | 🟢 Rendah | 🟡 Tinggi |
| Ekspor laporan kas PDF A4 (kop surat resmi) | 🟡 Sedang | 🟢 Sangat Tinggi |
| Ikon/badge mata pelajaran di jadwal & tracker | 🟢 Rendah | 🟡 Tinggi |
| Easter egg & secret tap konfeti | 🟢 Rendah | 🟡 Fun |

### Fase v3.0 — Integrasi Supabase (Database Cloud)
Upgrade arsitektur agar data dinamis bisa dikelola admin dan langsung sinkron ke semua HP siswa:

| Fitur | Keterangan |
| :--- | :--- |
| **Tugas & Ujian Realtime** | Admin tambah tugas → langsung muncul di HP semua siswa |
| **Pengumuman Kelas Realtime** | Ketua kelas posting → semua siswa terima |
| **Kas & Iuran Sinkron** | Bendahara catat kas → status iuran update di semua device |
| **Login Multi-Role (RBAC)** | Bendahara hanya akses kas, sekretaris hanya akses tugas, ketua akses semua |
| **Upload Bukti Bayar Kas** | Siswa upload screenshot transfer → bendahara approve |
| **Checklist Tugas Tersinkron** | Siswa centang tugas → guru/admin bisa pantau progress |

---

## 💡 5. Ide Fitur Eksplorasi (Backlog Masa Depan)

Fitur-fitur berikut disimpan sebagai referensi eksplorasi setelah v3.0 stabil:

### Otomasi & Notifikasi
| Fitur | Nilai Tambah |
| :--- | :--- |
| PWA Push Notification | Pengingat deadline tugas H-1 & piket pagi otomatis |
| Automated WA Cron Bot | Pesan briefing kelas otomatis tiap pukul 19:00 WIB ke grup |
| Discord Webhook | Rich embed reminder tugas mendesak ke channel kelas |

### Koordinasi Kelas
| Fitur | Nilai Tambah |
| :--- | :--- |
| Quick Polls / Voting | Voting keputusan kelas (desain hoodie, waktu kegiatan) |
| Kotak Aspirasi Anonim | Feedback siswa ke wali kelas tanpa rasa sungkan |
| QR Check-in Piket | Konfirmasi kehadiran piket via scan QR |

### Akademik
| Fitur | Nilai Tambah |
| :--- | :--- |
| Buku Nilai Pribadi | Catatan nilai per mapel (privat, hanya bisa dilihat pemilik) |
| Lampiran Kisi-Kisi Ujian | Admin sematkan PDF kisi-kisi di kartu ujian |

### Keuangan Lanjutan
| Fitur | Nilai Tambah |
| :--- | :--- |
| Analitik Pengeluaran Kas | Diagram kategori pengeluaran (kebersihan, fotokopi, dll) |
| Kalkulator Patungan Kegiatan | Hitung iuran per orang untuk kegiatan bersama |

---

## 📡 6. Hosting & Deployment

Hasil build `npm run build` (folder `dist/`) siap di-host gratis:

| Penyedia | Keunggulan | Metode Deploy |
| :--- | :--- | :--- |
| **Vercel** *(Rekomendasi)* | Auto-detect Vite, auto-deploy via `git push`, SSL gratis | GitHub push |
| **Cloudflare Pages** | Bandwidth unlimited, CDN tercepat di Indonesia | GitHub push |
| **Netlify** | Drag-and-drop folder `dist/`, setup subdomain gratis | Manual upload / GitHub |
| **GitHub Pages** | Terintegrasi langsung di ekosistem GitHub | GitHub Actions |

---

## 🎨 7. Spesifikasi Aset Visual Kelas

### Logo & App Icon PWA
- Konsep: Inisial kelas + aksen kode (`{ }`, `< / >`, kursor terminal `_`)
- Palet: Deep Indigo / Royal Blue + Emerald Green / Neon Cyan
- Penerapan: Header web (SVG) + ikon PWA homescreen (squircle)

### Badge Mata Pelajaran

| Kategori | Contoh Mapel | Ikon | Warna |
| :--- | :--- | :---: | :--- |
| Pemrograman Web | Web & Bergerak | `< / >` | Biru / Indigo |
| Basis Data | SQL | `🗄️` | Ungu / Violet |
| Game Dev | Pemodelan PL & Gim | `🎮` | Hijau Neon |
| Mobile Dev | Android & Flutter | `📱` | Biru Langit |
| Umum / Bahasa | B. Indo, B. Inggris | `📖` | Amber |
| Eksakta | Matematika | `📐` | Biru Cyan |
| Karakter | PAI, PPKn, BK | `🛡️` | Hijau Zamrud |

### Easter Egg
- **Footer**: `// Compiled with ☕, React & Vite for ClassHub`
- **Secret Tap**: Ketuk logo kelas 5× → konfeti + toast: *"🚀 Easter Egg Unlocked!"*
