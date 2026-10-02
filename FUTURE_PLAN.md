# 🚀 Rencana Pengembangan Utama — ClassHub Toolkit Kelas

> *"Fokus pada 3 kebutuhan nyata dan paling sering digunakan dalam kegiatan belajar mengajar sehari-hari di kelas — praktis, interaktif, tanpa AI, dan siap tampil di proyektor."*

Dokumen ini mendokumentasikan spesifikasi rinci untuk **3 fitur utama** yang akan dikembangkan, mencakup penempatan halaman (**Users vs Admin**), mode **Full Screen proyektor**, serta aturan keamanan dan alur komunikasi kelas.

---

## 📊 1. Status Proyek Saat Ini (v2.1.0) — ✅ SUDAH BERJALAN STABIL

ClassHub telah beroperasi dengan baik dengan modul-modul berikut:
- **Live Class Tracker**: Pelacakan jam mapel aktif, guru pengampu, dan hitung mundur bel istirahat/pulang.
- **Today-First Dashboard**: Ringkasan tugas terdekat, jadwal hari ini, dan regu piket harian.
- **Buku Kas & Matriks Iuran**: Pencatatan uang kas transparan per minggu dan per bulan.
- **Daftar Tugas & Checklist**: Checklist penyelesaian PR mandiri per siswa.
- **Arsitektur Dashboard Admin Modular**: Kode tab admin terisolasi rapi (`OverviewTab`, `TasksTab`, `ExamsTab`, `SchedulesTab`, `CashTab`, `AnnouncementsTab`, `MembersTab`, `SettingsTab`).

---

## 🎯 2. Tiga Fitur Prioritas Utama

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TIGA PILAR ALAT BANTU HARIAN KELAS                              │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│ 1. 🎡 SPINNING WHEEL       │ 2. 👥 GROUP MAKER           │ 3. 📌 MADING DIGITAL        │
│   • Roda Acak Nama Siswa   │   • Pembagi Kelompok Cepat  │   • Transformasi Pengumuman │
│   • Mode Full Screen Layar │   • Full Screen Proyektor   │   • Sticky Notes Pastel     │
│   • Eliminasi & Urutan     │   • WA Share (Admin Only)   │   • Checklist Barang Tas    │
└────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

---

## 🎡 Fitur 1: Roda Keberuntungan / Random Student Picker (Spinning Wheel)

Fitur pengacak nama siswa interaktif untuk menentukan giliran maju ke depan, menjawab pertanyaan guru, atau menentukan giliran presentasi secara adil dan seru tanpa tunjuk-menunjuk.

### A. Penempatan Fitur (Di Mana Ditaruh?)
- **Di Sisi Siswa / Publik (Users)**:
  - Ditaruh di menu navigasi utama dengan label **"Alat Kelas"** atau **"Roda Acak"** (dapat diakses oleh siapa saja: guru mapel yang sedang mengajar di kelas, ketua kelas, maupun murid tanpa perlu login admin).
  - Alasan: Saat jam pelajaran berlangsung, laptop kelas yang tersambung ke proyektor sering dioperasikan guru mapel tamu. Guru harus bisa langsung membuka dan memutar roda tanpa harus meminta password admin kelas.
- **Di Sisi Admin**:
  - Disediakan pintasan cepat di Admin Dashboard untuk memfilter daftar nama (misal: hanya mengacak siswa putra, siswa putri, atau mengecualikan siswa yang sedang sakit/izin hari ini).

### B. Mode Full Screen (Layar Penuh Proyektor)
- Dilengkapi tombol ikon **Full Screen (Layar Penuh)** di sudut atas.
- Menggunakan standar browser `document.documentElement.requestFullscreen()`.
- **Perilaku Tampilan Layar Penuh**:
  1. Navbar, sidebar, dan footer otomatis tersembunyi sepenuhnya.
  2. Roda putar grafis (Canvas/SVG) membesar proporsional mengisi tengah layar proyektor.
  3. Panel nama siswa di sisi samping tersusun rapi dengan ukuran teks besar yang terbaca jelas dari meja baris belakang kelas (jarak 8-10 meter).
  4. **Kontrol Keyboard Cepat**:
     - Tekan tombol `Spacebar` di keyboard laptop kelas untuk langsung memutar roda.
     - Tekan `Esc` untuk keluar dari layar penuh.
  5. **Pop-up Pemenang Spektakuler**:
     - Begitu roda berhenti, nama siswa yang terpilih muncul di tengah layar dalam kartu raksasa dengan animasi konfeti perayaan.
     - Ada tombol cepat: **"Putar Lagi"** atau **"Eliminasi Siswa Ini"**.

### C. Logika & Aturan Putaran
1. **Otomatis Mengambil Data Siswa**: Nama otomatis bersumber dari data anggota kelas (`data.members`), tidak perlu mengetik nama siswa satu per satu.
2. **Opsi "Eliminasi Siswa Terpilih"**: Siswa yang namanya sudah keluar otomatis dicoret sementara dari roda agar tidak terpilih dua kali dalam sesi yang sama.
3. **Mode Urutan Presentasi**: Sekali klik untuk mengacak urutan tampil seluruh siswa (nomor 1 sampai selesai) dan menampilkan daftar urutannya di layar.

---

## 👥 Fitur 2: Generator Pembagi Kelompok Otomatis (Smart Group Maker)

Fitur pembuat kelompok belajar otomatis dalam hitungan detik untuk menghindari perdebatan dan pilih-pilih teman saat guru memberi tugas kelompok mendadak.

### A. Penempatan Fitur & Pembagian Hak Akses
- **Di Sisi Siswa / Publik (Users)**:
  - Diletakkan bersebelahan dengan Spinning Wheel di menu **"Alat Kelas"**.
  - Siapa pun (guru atau perwakilan kelompok) bisa mengatur jumlah kelompok dan menekan tombol **"Acak Kelompok"**.
  - Bisa dialihkan ke mode **Full Screen** proyektor agar seluruh kelas bisa melihat pembagian kelompoknya di layar depan.
  - ❌ **TIDAK ADA tombol "Kirim ke WhatsApp" di sisi Users** (untuk mencegah spam klik oleh siswa).
- **Di Sisi Admin (Pengurus Kelas)**:
  - Terintegrasi di Admin Dashboard.
  - Memiliki fitur yang sama dengan Users, **DITAMBAH tombol eksklusif**:
    - 📲 **"Salin Format ke WhatsApp"**: Otomatis menghasilkan teks rapi berisi daftar kelompok dengan penomoran emoji siap kirim ke grup kelas dalam 1 klik.

### B. Mode Full Screen (Layar Penuh Proyektor)
- Saat tombol **Full Screen** ditekan:
  1. Tampilan berubah menjadi **Grid Kartu Kelompok Presentasi**.
  2. Kelompok 1, Kelompok 2, Kelompok 3, dst. ditampilkan dalam bentuk kartu-kartu besar dengan warna aksen berbeda.
  3. Nama setiap anggota tertulis tebal dan kontras tinggi.
  4. Dilengkapi tombol melayang di pojok layar: **"Acak Ulang"** (jika kelas ingin mengocok ulang secara transparan di depan guru) dan **"Tutup Layar Penuh"**.

### C. Opsi Pengacakan yang Tersedia
1. **Mode Pembagian**:
   - Berdasarkan **Jumlah Kelompok** (contoh: *"Bagi kelas menjadi 6 kelompok"*).
   - Berdasarkan **Jumlah Anggota per Kelompok** (contoh: *"Bagi menjadi 4 orang per kelompok"*).
2. **Filter Pengecualian Kehadiran**:
   - Terdapat checklist cepat untuk menghapus centang siswa yang sedang tidak masuk sekolah hari itu (Sakit/Izin/Alpa), sehingga tidak ada kelompok yang kekurangan orang akibat anggotanya absen.
3. **Keseimbangan Gender (Opsional)**:
   - Opsi pembagian seimbang antara siswa laki-laki dan perempuan di setiap kelompok.

---

## 📌 Fitur 3: Transformasi Halaman Pengumuman ➔ Mading Digital (Sticky Notes Board)

Mengalihfungsikan halaman "Pengumuman" konvensional yang kaku dan jarang dibaca menjadi **Majalah Dinding (Mading) Digital Kelas** yang interaktif, visual, dan memuat catatan barang bawaan praktik.

### A. Penempatan Fitur & Hak Akses
- **Di Sisi Siswa / Publik (Users)**:
  - Menggantikan halaman `Pengumuman` lama menjadi tab **"Mading Kelas"** (dengan ikon pin 📌).
  - Berisi papan memo warna-warni yang disusun rapi otomatis.
  - **Interaksi Siswa**: Siswa dapat **mencentang checklist barang bawaan** di HP masing-masing saat menyiapkan tas di malam hari. Centang ini tersimpan di memori ponsel mereka (*LocalStorage*) sehingga aman dan personal.
  - ❌ **TIDAK ADA tombol share WhatsApp di sisi Users**.
- **Di Sisi Admin**:
  - Tab di Admin Dashboard diubah dari `Pengumuman` menjadi `Mading & Sticky Notes`.
  - Formulir pembuatan memo dirancang sangat cepat:
    1. Pilih warna kertas memo: 🟡 Kuning (Umum), 🟢 Hijau (Barang Bawaan Praktik/Lab), 🔵 Biru (Info Sekolah), 🔴 Pink/Oranye (Penting/Mendesak).
    2. Pilih tipe memo: **Checklist Barang** (bisa tambah poin checklist) atau **Memo Teks Biasa**.
    3. Toggle **📌 Sematkan di Paling Atas (Pin)**.
    4. Atur **Masa Aktif (Auto-Expire)**: Memo otomatis hilang setelah tanggal tertentu agar mading tidak menumpuk.
    5. 📲 **Eksklusif Admin**: Tombol **"Kirim ke WhatsApp"** yang menyalin seluruh teks memo dan daftar checklist ke format pesan WA.

### B. Konsep Desain Visual Papan & Kartu Memo (CSS Murni Modern)
1. **Papan Latar Belakang (Board Background)**:
   - Menggunakan konsep **Papan Felt Akustik Modern (Dark Dot-Grid)**:
     - Warna dasar abu-abu arang gelap (*slate-900*) dengan pola titik-titik halus (*subtle dot-matrix*).
     - Bingkai lis lembut di sekeliling area mading layaknya papan gantung fisik di kelas.
     - Dibuat 100% menggunakan kode CSS murni (ringan, tidak memerlukan gambar latar berat, langsung terbuka instan).
2. **Kartu Sticky Notes di Atas Papan**:
   - Kertas memo berwarna pastel yang tampak sangat menyala (*pop out*) di atas latar papan gelap.
   - Dilengkapi aksen fisik: jarum pin bundar di bagian atas tengah kertas dan bayangan lembut (*soft drop-shadow*) yang memberi kesan kertas terangkat.
   - Kemiringan acak sangat halus (`-0.8°` s.d. `+0.8°`) untuk kesan mading santai namun tetap rapi dan tidak mengganggu keterbacaan teks.
3. **Tata Letak (Layout)**:
   - Menggunakan **Smart Responsive Masonry Grid**:
     - Di layar laptop: Tampil 3–4 kolom memo berdampingan.
     - Di layar HP: Otomatis tersusun vertikal 1 kolom yang pas di lebar layar tanpa perlu zoom-in.

---

## 🔒 3. Matriks Perbandingan Akses: Users vs Admin

| Fitur | Sisi Users (Siswa / Guru di Kelas) | Sisi Admin (Pengurus Kelas / Wali Kelas) |
| :--- | :--- | :--- |
| **🎡 Spinning Wheel** | ✅ Bisa putar roda, pilih mode, dan **Full Screen Proyektor** tanpa perlu login. | ✅ Bisa putar roda + akses filter nama khusus. |
| **👥 Group Maker** | ✅ Bisa generate kelompok dan buka **Full Screen Proyektor** di depan kelas. | ✅ Bisa generate kelompok, Full Screen, **DAN tombol eksklusif Salin Format WhatsApp**. |
| **📌 Mading Digital** | ✅ Membaca memo, filter kategori, dan **mencentang checklist barang tas pribadi**. | ✅ Buat memo baru, pilih warna, atur checklist, atur auto-expire, **DAN tombol kirim ke WhatsApp**. |
| **📲 Fitur Share WA** | ❌ **DITIADAKAN** (bebas dari tombol kirim WA untuk mencegah spam). | ✅ **EKSKLUSIF** (semua generator pesan WhatsApp hanya ada di Admin). |

---

## 🖥️ 4. Spesifikasi Mode Full Screen (Layar Proyektor)

Mode Full Screen pada **Spinning Wheel** dan **Group Maker** dirancang khusus untuk memenuhi standar penggunaan di proyektor kelas:

1. **Aktivasi Standar Web API**:
   ```javascript
   // Menggunakan native Fullscreen API browser
   const toggleFullscreen = () => {
     if (!document.fullscreenElement) {
       containerRef.current.requestFullscreen().catch(err => console.error(err));
     } else {
       document.exitFullscreen();
     }
   };
   ```
2. **Tipografi & Kontras Tinggi**:
   - Ukuran font minimum nama siswa pada layar penuh adalah `24px` hingga `36px` dengan ketebalan *bold/semi-bold*.
   - Menggunakan palet warna dengan rasio kontras tinggi agar tetap terbaca jelas meskipun proyektor kelas memiliki lumens yang redup atau kondisi ruangan terang benderang.
3. **Dukungan Pintasan Keyboard**:
   - `Spacebar`: Mulai / Berhenti putar roda pada Spinning Wheel.
   - `Escape`: Keluar dari tampilan Full Screen.

---

## 🗓️ 5. Tahapan Eksekusi Pembangunan

```
 ┌──────────────────────────────────┐
 │ LANGKAH 1: RODA PUTAR SISWA      │ ➔ Halaman/Modal Toolkit, Grafis Roda Canvas/SVG,
 │ (Spinning Wheel + Fullscreen)    │   Animasi Spin, Konfeti, Mode Full Screen Proyektor.
 ├──────────────────────────────────┤
 │ LANGKAH 2: GENERATOR KELOMPOK    │ ➔ Logika pembagian kelompok, filter kehadiran,
 │ (Group Maker + Fullscreen + WA)  │   tampilan kartu proyektor, tombol WA di Admin.
 ├──────────────────────────────────┤
 │ LANGKAH 3: TRANSFORMASI MADING   │ ➔ Refactor Announcements ➔ Mading Digital,
 │ (Sticky Notes + Checklist Bawaan)│   desain papan felt dot-grid, checklist lokal HP.
 └──────────────────────────────────┘
```

---

<p align="center">
  <em>ClassHub: Sederhana, Bermanfaat Nyata, Siap Tampil di Proyektor Kelas.</em><br/>
  <strong>Dokumen Spesifikasi Teknis:</strong> Oktober 2026
</p>
