# 🚀 Future Plan & Roadmap — ClassHub (XII PPLG 1)

Dokumen ini merangkum rencana pengembangan fitur masa depan, analisis arsitektur akses pengguna, serta ide-ide inovatif untuk meningkatkan fungsi dan kenyamanan portal web kelas **XII PPLG 1**.

---

## 📌 Daftar Isi
1. [Fitur Utama 1: Ringkasan Cerdas & Generator Pesan WhatsApp](#1-fitur-utama-1-ringkasan-cerdas--generator-pesan-whatsapp)
2. [Fitur Utama 2: Pertimbangan Model Akses (Public Read-Only vs Login Admin)](#2-fitur-utama-2-pertimbangan-model-akses-public-read-only-vs-login-admin)
3. [Ide-Ide Inovatif Tambahan (Khusus Kelas PPLG)](#3-ide-ide-inovatif-tambahan-khusus-kelas-pplg)
4. [Tabel Prioritas & Tahapan Rilis (Roadmap)](#4-tabel-prioritas--tahapan-rilis-roadmap)

---

## 1. Fitur Utama 1: Ringkasan Cerdas & Generator Pesan WhatsApp

### 💡 Konsep
Seringkali siswa enggan membuka web setiap hari, namun **WhatsApp grup kelas** dibuka setiap saat. Fitur ini berfungsi sebagai **jembatan informasi otomatis**: merangkum data penting dari web menjadi format teks WhatsApp yang rapi, padat, dan langsung bisa dibagikan dengan **satu klik**.

### 🛠️ Fitur & Mekanisme
1. **Tombol "Bagikan ke WhatsApp" (One-Click Share)**:
   - Menggunakan API URL WhatsApp: `https://wa.me/?text={pesan_terenkripsi}`.
   - Tombol alternatif: **"Salin Ringkasan (Copy to Clipboard)"** dengan notifikasi toast berhasil.
2. **Pilihan Template Ringkasan**:
   - 🌅 **Briefing Harian (Pagi/Malam)**: Jadwal pelajaran besok, guru pengampu, daftar petugas piket, tugas deadline besok.
   - 📅 **Digest Mingguan**: Rekap tugas deadline minggu ini, pengumuman penting, dan agenda kelas.
   - 💰 **Pengingat Kas Khusus**: Total kas terkumpul dan daftar siswa yang belum lunas iuran minggu ini.

### 📋 Contoh Format Output Pesan WhatsApp
```text
📢 *DAILY BRIEFING XII PPLG 1* 📢
📅 *Hari/Tanggal:* Rabu, 10 September 2026

━━━━━━━━━━━━━━━━━━━━
📚 *JADWAL PELAJARAN HARI INI:*
1. Pemrograman Web & Perangkat Bergerak (Pak Budi) | 07.15 - 09.30
2. Basis Data (Bu Siti) | 09.45 - 11.45
3. Bahasa Inggris (Mr. John) | 12.30 - 14.30

🧹 *PETUGAS PIKET:*
• Fauzan, Budi, Siti, Kevin, Rina (Harap datang 15 menit lebih awal!)

⚠️ *DEADLINE TUGAS TERDEKAT:*
• [PWPB] Project Web Portfolio (Deadline: Besok, 23:59 WIB)
• [Basis Data] Laporan ERD Toko Online (Deadline: Jumat)

📢 *PENGUMUMAN TERBARU:*
• Ujian Praktik Kejuruan dimulai tgl 20 September. Persiapkan repository GitHub masing-masing!

💰 *KAS KELAS:*
• Saldo Saat Ini: Rp 450.000
• Yang belum bayar kas minggu ini harap hubungi Bendahara ya! 🙏

━━━━━━━━━━━━━━━━━━━━
🌐 *Detail lengkap & cek tugas:*
https://web-kelas-pplg.vercel.app
```

---

## 2. Fitur Utama 2: Pertimbangan Model Akses (Public Read-Only vs Login Admin)

### 🧐 Latar Belakang & Analisis Masalah
Saat ini, setiap siswa harus melewati layar **Login Gate** dengan memilih nama dan memasukkan PIN `1234`. Dalam kenyataan penggunaan di kelas:
- Siswa merasa malas membuka web jika ada hambatan (*friction*) login setiap kali buka browser / berganti tab.
- Data informasi kelas (jadwal pelajaran, tugas, piket) sebenarnya bukan rahasia negara, melainkan informasi yang seharusnya **secepat mungkin dibaca**.

### ⚖️ Perbandingan Mode

| Kriteria | Mode Sekarang (Semua Wajib Login) | Mode Rekomendasi (Public Read-Only + Login Admin) |
| :--- | :--- | :--- |
| **Kecepatan Akses Siswa** | ⏱️ Lambat (harus pilih nama + isi PIN) | ⚡ **Instan** (buka link langsung muncul jadwal & tugas) |
| **Kemudahan Pengurus** | Biasa saja | **Aman & Terkontrol** (tombol edit hanya ada di Admin) |
| **Pelacakan Tugas Pribadi** | Terikat akun sesi | Menggunakan `localStorage` di HP masing-masing siswa |
| **Keamanan Data** | Sedang | **Tinggi** untuk data sensitif kas & manajemen jadwal |

### 🎯 Solusi Terbaik yang Direkomendasikan: *Hybrid Guest & Admin Bar*
1. **Siswa / Publik (Guest Mode)**:
   - Langsung masuk ke Dashboard tanpa form login.
   - Hanya memiliki izin membaca (*Read-Only*).
   - Fitur personalisasi: Siswa cukup memilih nama mereka sekali di pojok profil untuk menandai checklist tugas pribadi di HP mereka (disimpan di `localStorage` lokal HP).
2. **Pengurus / Admin (Protected Mode)**:
   - Terdapat tombol kecil di header: **"Mode Pengurus 🔐"**.
   - Saat diklik, muncul modal popup PIN Admin (misal `admin123`).
   - Setelah PIN valid, antarmuka berubah menjadi **Admin Mode** (muncul tombol `+ Tambah Tugas`, `+ Catat Kas`, `Edit Jadwal`, `Hapus Pengumuman`).
   - Terdapat tombol **"Keluar Mode Pengurus"** untuk kembali ke tampilan baca biasa.

---

## 3. Ide-Ide Inovatif Tambahan (Khusus Kelas PPLG)

Sebagai kelas jurusan **Pengembangan Perangkat Lunak dan Gim (PPLG / Rekayasa Perangkat Lunak)**, web kelas ini bisa menjadi etalase kebanggaan sekaligus sarana belajar bersama:

### 💻 3.1. Showcase & Portofolio Karya Coding Siswa PPLG
- **Tab khusus: "Karya Kami / Hall of Fame"**:
  - Menampilkan kartu proyek aplikasi/web/game buatan siswa kelas.
  - Berisi: Judul proyek, nama pembuat, screenshot, teknologi yang dipakai (React, Flutter, Laravel, Unity), serta tombol link ke **Demo Live** dan **Repository GitHub**.
  - Bisa dijadikan portofolio kolektif saat ada pameran sekolah, promosi jurusan, atau kunjungan industri.

### 📱 3.2. PWA (Progressive Web App) & Dukungan Offline
- Menambahkan Web App Manifest & Service Worker.
- Siswa bisa menekan tombol **"Install App"** di Chrome/Safari Android & iOS agar muncul ikon aplikasi di home screen HP layaknya aplikasi Play Store.
- Jadwal pelajaran dan daftar piket tetap bisa dibuka meski kuota internet habis atau sinyal di kelas terganggu (*offline-ready*).

### ☁️ 3.3. Database Online & Real-time Sync (Supabase / Firebase Free Tier)
- *Masalah saat ini*: Data masih tersimpan di `localStorage` per browser. Jika bendahara menginput kas di laptopnya, siswa di HP belum otomatis melihat update tersebut.
- *Solusi*: Integrasi backend gratis tanpa server (seperti **Supabase** atau **Firebase Firestore**).
  - Setiap bendahara mencatat uang kas masuk, saldo di HP seluruh siswa otomatis ter-update secara real-time.

### 📄 3.4. Ekspor Laporan Kas & Jadwal ke PDF / Excel
- Tombol **"Unduh Laporan Kas (.PDF / .Excel)"** untuk Bendahara.
- Menghasilkan berkas cetak siap print bertanda tangan Wali Kelas & Bendahara untuk laporan bulanan resmi ke pihak sekolah/wali murid.

### ⏱️ 3.5. Pomodoro Focus Timer & Uji Kompetensi Kejuruan (UKK) Countdown
- Timer khusus di menu Akademik untuk latihan *Speed Coding* atau fokus ngerjain tugas bareng di lab komputer.
- Hitung mundur khusus menuju simulasi UKK (Uji Kompetensi Kejuruan) dan Ujian Sekolah.

### 🗳️ 3.6. Kotak Suara & Aspirasi Anonim Kelas
- Form singkat bagi siswa untuk mengirim pesan, kritik, saran, atau usulan kegiatan kelas ke pengurus secara anonim (bisa diteruskan via webhook Discord / Telegram pengurus kelas).

### 🏆 3.7. Badge Apresiasi & Gamifikasi Piket/Kas
- Penanda sederhana: *"Kas Terdisiplin Bulan Ini"* atau *"Regu Piket Paling Bersih"*.
- Memberikan apresiasi visual sederhana untuk meningkatkan kebersamaan dan kekompakan kelas.

---

## 4. Tabel Prioritas & Tahapan Rilis (Roadmap)

| Fase | Fitur | Tingkat Kesulitan | Estimasi Waktu |
| :--- | :--- | :--- | :--- |
| **Fase 1 (Segera)** | • **Generator Ringkasan WhatsApp** (Tombol share & salin teks)<br>• **Sistem Akses Baru**: Bebas login untuk siswa, PIN modal untuk Admin | Rendah | 1 - 2 Hari |
| **Fase 2 (Jangka Pendek)** | • **PWA Support** (Bisa diinstall di HP)<br>• **Showcase Projek Siswa PPLG** (Galeri karya & link github)<br>• **Ekspor Laporan Kas ke PDF/Cetak** | Sedang | 3 - 5 Hari |
| **Fase 3 (Jangka Menengah)** | • **Cloud Database Real-time** (Supabase / Firebase)<br>• Sinkronisasi otomatis data antar perangkat | Sedang - Tinggi | 1 Minggu |
| **Fase 4 (Penyempurnaan)** | • Kotak aspirasi anonim<br>• Pomodoro timer & Gamifikasi | Rendah | Fleksibel |

---

> 📝 *Dokumen ini dibuat untuk memandu pengembangan proyek web kelas XII PPLG 1 agar semakin fungsional, praktis, dan membanggakan.*
