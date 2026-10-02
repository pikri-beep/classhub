# 🚀 Rencana Masa Depan & Roadmap Praktis — ClassHub

> *"Fokus pada kebutuhan nyata kegiatan belajar mengajar sehari-hari di kelas — praktis, interaktif, dan langsung bermanfaat."*

Dokumen ini merangkum **status proyek terkini** dan **ide-ide fitur praktis** yang benar-benar dibutuhkan siswa, guru, dan pengurus kelas dalam aktivitas sehari-hari di sekolah tanpa fitur rumit yang tidak diperlukan.

---

## 📊 1. Status Proyek Saat Ini (v2.1.0) — ✅ SUDAH TERSEDIA

ClassHub saat ini telah berjalan stabil sebagai Progressive Web App (PWA) yang dapat dipasang di layar utama ponsel siswa:

| Fitur | Manfaat untuk Kelas | Status |
| :--- | :--- | :---: |
| **Live Class Tracker** | Mengetahui secara real-time mata pelajaran apa yang sedang berlangsung, guru pengampu, serta countdown menuju bel istirahat/pulang. | ✅ Aktif |
| **Today-First Dashboard** | Siswa langsung melihat ringkasan penting hari ini: PR deadline terdekat, jadwal pelajaran, dan siapa yang piket hari ini. | ✅ Aktif |
| **Jadwal Pelajaran & Kalender Agenda** | Jadwal mingguan lengkap dari Senin hingga Jumat beserta agenda kegiatan kelas (ulangan, peringatan hari besar, kegiatan sekolah). | ✅ Aktif |
| **Piket Kebersihan & Tim MBG** | Pembagian jadwal piket harian kelas serta regu pengambil (11.30 WIB) dan pengembali (12.30 WIB) Makan Bergizi Gratis. | ✅ Aktif |
| **Buku Kas & Matriks Iuran Siswa** | Checklist pembayaran iuran kas per minggu dan per bulan secara transparan, serta pencatatan mutasi pengeluaran kas kelas. | ✅ Aktif |
| **Daftar Tugas & Checklist Selesai** | Siswa bisa menandai tugas yang sudah dikerjakan di ponsel masing-masing agar tidak terlewat. | ✅ Aktif |
| **Generator Format WhatsApp** | Pengurus kelas dapat langsung menyalin pesan ringkasan persiapan belajar malam hari untuk dikirimkan ke grup WhatsApp kelas. | ✅ Aktif |
| **Kontrol Akses / Pemeliharaan Halaman** | Admin dapat menyalakan mode pemeliharaan pada halaman tertentu (misal saat kas sedang diaudit oleh bendahara). | ✅ Aktif |
| **Arsitektur Modular Terisolasi** | Kode dashboard admin telah dipecah rapi per tab domain sehingga performa cepat dan bebas lag. | ✅ Aktif |

---

## 🎯 2. Fokus Pengembangan: Toolkit Kegiatan Harian Kelas (Classroom Utilities)

Berdasarkan dinamika nyata di ruang kelas, fitur masa depan difokuskan pada **alat bantu kegiatan belajar, pengelolaan kelas, dan interaksi langsung antar siswa di kelas**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TOOLKIT KEGIATAN KELAS HARIAN                        │
├────────────────────────────┬───────────────────────────────────────────┤
│ 🎡 INTERAKSI & BELAJAR     │ 👥 PENGELOLAAN SISWA                      │
│   • Roda Putar (Wheel)     │   • Generator Kelompok Otomatis           │
│   • Timer Presentasi Kuis  │   • Denah Tempat Duduk & Acak Meja        │
│   • Mode Tampilan Proyektor│   • Catatan Harian Presensi (S/I/A)       │
├────────────────────────────┼───────────────────────────────────────────┤
│ 📢 KOORDINASI & INFORMASI  │ 💰 TRANSPARANSI SEDERHANA                 │
│   • Voting / Polling Kelas │   • Rekap Kas Siap Cetak untuk Mading     │
│   • Papan Sticky Note Mading│  • Pengingat Barang Bawaan Praktik       │
└────────────────────────────┴───────────────────────────────────────────┘
```

---

## 🛠️ 3. Rincian Fitur Praktis yang Akan Datang

### 1. 🎡 Roda Keberuntungan / Random Student Picker (Spinning Wheel)
*Solusi saat guru meminta siswa maju ke depan atau menentukan urutan presentasi.*
- **Fitur Utama**:
  - Roda putar grafis yang memuat seluruh nama siswa di kelas.
  - Tombol **"Putar Roda"** dengan animasi putaran seru dan konfeti saat nama terpilih.
  - Opsi **"Eliminasi Siswa Terpilih"** agar siswa yang sudah maju tidak terpilih dua kali.
  - Mode **"Pengambilan Cepat"** (1 nama instan) atau **"Urutan Presentasi"** (mengacak urutan tampil seluruh siswa/kelompok dari nomor 1 sampai selesai).
  - Tampilan ramah layar proyektor kelas.

### 2. 👥 Generator Pembagi Kelompok Otomatis (Smart Group Maker)
*Menghindari perdebatan dan pilih-pilih teman saat ada tugas kelompok dari guru.*
- **Fitur Utama**:
  - Pilihan mode: **Bagi Berdasarkan Jumlah Kelompok** (misal: buat 6 kelompok) atau **Bagi Berdasarkan Jumlah Anggota** (misal: 4 orang per kelompok).
  - Opsi penyeimbang (seimbang putra/putri atau acak murni).
  - Pengecualian siswa yang sedang tidak hadir hari itu.
  - Tombol **"Salin ke WhatsApp"** yang langsung memformat daftar kelompok (Kelompok 1: A, B, C, D) sehingga ketua kelas bisa langsung membagikannya ke grup WA dalam 1 klik.

### 3. ⏱️ Timer & Stopwatch Presentasi Kelas (Layar Penuh)
*Membantu guru dan siswa menjaga kedisiplinan waktu saat sesi presentasi tugas atau kuis.*
- **Fitur Utama**:
  - Countdown timer dengan angka besar yang terlihat jelas dari bangku belakang saat ditampilkan di proyektor / laptop kelas.
  - Tombol pintas preset: 5 Menit, 10 Menit, 15 Menit, 30 Menit.
  - Bunyi lonceng atau peringatan visual saat waktu tersisa 1 menit dan saat waktu habis.
  - Mode Stopwatch untuk menghitung durasi pengerjaan praktik koding/tugas.

### 4. 🪑 Denah Tempat Duduk Interaktif & Pengacak Meja (Seating Chart)
*Membuat visualisasi tata letak meja dan mengatasi rasa bosan dengan teman sebangku.*
- **Fitur Utama**:
  - Visualisasi denah kelas: meja guru, pintu, papan tulis, dan baris meja siswa (format 2-2 atau letter U).
  - Setiap meja menampilkan nama siswa dan nomor absen.
  - Tombol **"Acak Tempat Duduk Bulanan"** untuk merotasi posisi duduk secara adil tanpa ada yang merasa dianaktirikan.
  - Kemampuan drag-and-drop sederhana bagi wali kelas/ketua kelas untuk menukar posisi duduk tertentu (misal siswa dengan kendala penglihatan dipindah ke depan).

### 5. 🗳️ Polling & Voting Keputusan Kelas Sederhana (Quick Poll)
*Mengambil keputusan kelas secara cepat dan demokratis tanpa berisik.*
- **Contoh Kasus**:
  - *"Baju apa yang dipakai untuk hari Jumat besok? (Batik / Kaos Olahraga / Baju Jurusan)"*
  - *"Mau jenguk teman yang sakit hari apa? (Kamis pulang sekolah / Sabtu sore)"*
  - *"Warna jaket/hoodie kelas yang disepakati? (Hitam / Navy / Abu-abu)"*
- **Fitur Utama**:
  - Siswa membuka portal dan langsung memilih satu opsi.
  - Hasil diagram batang persentase langsung terupdate secara real-time di layar.
  - Fitur tutup voting jika waktu pemungutan suara telah selesai.

### 6. 📋 Catatan Presensi Harian Kelas (Jurnal Cepat Sekretaris)
*Membantu sekretaris kelas merekap kehadiran sebelum dicatat di buku jurnal absensi fisik sekolah.*
- **Fitur Utama**:
  - Tombol cepat harian di admin: tandai siapa yang **Sakit (S)**, **Izin (I)**, atau **Alpa (A)** hari ini.
  - Ringkasan teks harian yang siap dibagikan ke wali kelas / grup pengurus:
    `"Laporan Absensi XI PPLG 1 (Kamis, 2 Okt): Hadir 34 siswa, Sakit: Fulan, Izin: Fulanah."`
  - Riwayat sederhana untuk memantau siapa saja yang sering tidak hadir dalam satu bulan.

### 7. 📌 Transformasi Halaman Pengumuman ➔ Mading Digital (Sticky Notes Board)
*Mengalihfungsikan halaman "Pengumuman" konvensional menjadi Majalah Dinding (Mading) digital yang interaktif dan visual.*
- **Alasan Perubahan**:
  - Format pengumuman lama yang panjang dan formal jarang dibaca siswa.
  - Siswa lebih tertarik dengan visual mading berwarna-warni dengan catatan singkat langsung pada intinya.
- **Fitur Utama**:
  - **Kertas Memo Warna-Warni**: Kuning (Catatan Umum), Hijau (Checklist Bawaan Praktik/Lab), Biru (Edaran Sekolah), Merah Muda/Oranye (Penting/Mendesak).
  - **Checklist Bawaan Pribadi**: Siswa bisa mencentang sendiri barang bawaan di HP masing-masing saat menyiapkan tas di rumah.
  - **Jarum Pin (Pinned Notes)**: Memo terpenting tetap menempel di posisi atas mading.
  - **Auto-Expire**: Memo otomatis terarsip setelah hari/jam kegiatan berakhir agar mading selalu bersih.

### 8. 🖨️ Lembar Kas Siap Cetak (Print-Friendly Sheet)
*Membantu bendahara mencetak rekap kas untuk ditempel di papan mading belakang kelas.*
- **Fitur Utama**:
  - Tombol **"Cetak Rekap Kas Mading"** yang memformat matriks pembayaran kas ke dalam format A4 rapi tanpa elemen navigasi website.
  - Dilengkapi kolom tanda tangan Bendahara dan Ketua Kelas.
  - Siswa yang belum bayar terlihat jelas dengan tanda silang merah, dan yang sudah bayar bertanda centang hijau.

### 9. 🖥️ Mode Tampilan Proyektor Kelas (Projector Screen Mode)
*Tampilan khusus ketika laptop kelas disambungkan ke proyektor / TV interaktif di depan kelas.*
- **Fitur Utama**:
  - Tombol pintas layar penuh (Fullscreen) dengan font besar dan kontras tinggi.
  - Menampilkan jam dinding digital besar, mata pelajaran saat ini, guru pengampu, dan tugas yang harus dikumpulkan hari ini.
  - Bisa dialihkan ke mode Timer atau Spinning Wheel saat jam pelajaran kosong atau sesi ice breaking.

---

## 🗓️ 4. Rencana Tahapan Rilis (Roadmap)

```
  TAHAP 1 (Prioritas Utama)          TAHAP 2 (Fitur Belajar)            TAHAP 3 (Pengelolaan Kelas)
 ┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
 │ • Spinning Wheel (Roda)   │ ───▶ │ • Timer & Stopwatch Layar │ ───▶ │ • Denah Tempat Duduk      │
 │ • Group Maker (Kelompok)  │      │ • Quick Poll (Voting)     │      │ • Lembar Kas Siap Cetak   │
 │ • Alih Fungsi Mading Note │      │ • Jurnal Presensi Harian  │      │ • Mode Proyektor Layar    │
 └───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

### Tahap 1 — Alat Bantu Paling Sering Dipakai (2 Minggu ke depan)
1. **Roda Putar (Spinning Wheel)**: Pemilihan acak siswa untuk menjawab pertanyaan dan giliran presentasi.
2. **Generator Kelompok Otomatis (Group Maker)**: Pembagi tim tugas kelompok dengan tombol salin format ke WhatsApp (Admin only).
3. **Transformasi Pengumuman ➔ Mading Sticky Notes**: Mengubah halaman pengumuman menjadi papan mading interaktif dengan kartu memo warna-warni dan checklist bawaan praktik.

### Tahap 2 — Pengatur Waktu & Partisipasi (Bulan Berikutnya)
1. **Timer Presentasi Kelas**: Pengatur waktu layar penuh dengan bel penanda waktu habis.
2. **Voting Keputusan Kelas (Quick Poll)**: Wadah musyawarah keputusan kelas secara digital dan transparan.
3. **Jurnal Presensi Harian**: Form cepat sekretaris mencatat siswa sakit/izin untuk laporan wali kelas (Admin only).

### Tahap 3 — Penataan Kelas & Fisik (Fase Lanjutan)
1. **Denah Meja Interaktif**: Denah tempat duduk kelas dengan fitur acak teman sebangku berkala.
2. **Rekap Kas Siap Cetak**: Format cetak laporan kas untuk ditempel di dinding kelas.
3. **Mode Proyektor Layar Penuh**: Standby screen saat jam pelajaran berlangsung di proyektor kelas.

---

## 🎯 5. Prinsip Desain Fitur Baru

1. **Buka → Pakai (No Configuration Needed)**:
   Guru atau ketua kelas tidak perlu mengatur akun atau database rumit. Buka tab Spinning Wheel, nama siswa otomatis sudah terisi dari data kelas yang ada, langsung tekan tombol Putar.
2. **Fitur "Salin / Bagikan ke WhatsApp" EKSKLUSIF di Halaman Admin**:
   Tombol generator pesan WhatsApp (rekap tugas, kelompok, memo mading, dan absensi) **HANYA tersedia di Dashboard Admin / Pengurus Kelas**. Tampilan siswa umum sengaja bersih tanpa tombol share WA untuk mencegah spam dan memastikan informasi resmi disebarkan secara tertib oleh pengurus.
3. **Ringan dan Tahan Banting**:
   Dapat berjalan lancar di HP siswa berspesifikasi menengah-ke-bawah tanpa menguras kuota internet.

---

<p align="center">
  <em>ClassHub: Dibuat untuk menyelesaikan urusan nyata di dalam ruang kelas.</em><br/>
  <strong>Terakhir diperbarui:</strong> Oktober 2026<br/><br/>
  <code>// Simpel, Bermanfaat, dan Langsung Pakai 🚀</code>
</p>
