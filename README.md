# 🎓 ClassHub — Portal Manajemen Kelas Terpadu

> **"Satu tempat untuk mengatur seluruh urusan kelas."**  
> Web aplikasi modern, bersih (*clean*), minimalis, dan responsif untuk mengelola kegiatan akademik, tugas harian, jadwal piket, serta transparansi kas kelas **XII PPLG 1 (SMKN 1)**.

---

## 🌟 Fitur Utama

1. **🔒 Gerbang Akses Terproteksi (*Login Gatekeeper*)**
   - Mencegah data kelas diakses oleh pihak luar secara publik.
   - Pilihan masuk sebagai **Siswa** (dengan memilih nama & PIN) atau sebagai **Pengurus/Admin** (dengan Master PIN).
2. **📊 Dashboard Fokus Harian (*Daily Focus*)**
   - Salam pembuka dinamis dan tanggal hari ini.
   - 3 Blok Metrik Utama: Status tugas pribadi, hitung mundur ujian terdekat, serta saldo kas & status piket hari ini.
   - Checklist tugas harian yang dapat langsung dicentang selesai.
3. **📢 Papan Pengumuman (*Announcements*)**
   - Informasi resmi kelas terpusat (Penting, Akademik, Kegiatan, Keuangan).
   - Fitur *Pin to Top* untuk menyematkan warta penting di bagian atas.
4. **📝 Manajemen Tugas & Progres Kelas (*Tasks & Progress*)**
   - Status 3 tahap pribadi untuk setiap siswa: **Belum Mulai** (🔴), **Dikerjakan** (🟡), **Selesai** (🟢).
   - *Progress Bar* otomatis untuk melihat persentase penyelesaian tugas seluruh kelas.
   - Filter berdasarkan status pengerjaan dan mata pelajaran.
5. **⏳ Countdown & Jadwal Ujian (*Exams*)**
   - Hitung mundur *real-time* (hari, jam, menit, detik) menuju PTS, PAS, dan Ujian Praktik.
   - Rangkuman kisi-kisi dan ruang lingkup materi ujian.
6. **📅 Jadwal Pelajaran & Regu Piket (*Schedules & Pickets*)**
   - Timeline jam mata pelajaran per hari (Senin - Jumat) beserta nama guru pengampu.
   - Pembagian regu piket kebersihan harian dan pengingat otomatis jika hari ini giliran Anda bertugas.
7. **🗓️ Kalender & Agenda Kelas (*Calendar*)**
   - Kalender visual interaktif yang menggabungkan jadwal kegiatan, deadline tugas, dan ujian dalam satu tampilan.
8. **💰 Kas & Matrix Iuran Kelas (*Cash & Dues*)**
   - **Matrix Iuran Siswa**: Tabel transparansi status pembayaran kas per anggota (Lunas / Belum).
   - **Buku Kas Digital**: Pencatatan riwayat arus pemasukan dan pengeluaran secara transparan dengan saldo otomatis.
9. **👥 Direktori Anggota (*Members*)**
   - Struktur pengurus kelas (Ketua, Wakil, Sekretaris, Bendahara) dan daftar seluruh siswa lengkap dengan nomor absen serta NISN.
10. **🌓 Mode Terang & Gelap (*Light & Dark Mode*)**
    - Dukungan tema gelap (*Dark Mode*) dengan palet warna elegan yang nyaman di mata.
11. **📱 100% Responsif (Desktop, Tablet, Android & iOS)**
    - Navigasi laci (*drawer sidebar*) pada ponsel, *smooth touch scroll* untuk tabel dan filter, serta input ramah layar sentuh tanpa *auto-zoom*.

---

## 🔑 Akun & Kredensial Bawaan (*Default Credentials*)

Aplikasi dilengkapi dengan data *seed* pengujian yang siap digunakan:

| Tipe Akun | Cara Masuk | PIN Default | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Siswa (Member)** | Pilih nama Anda dari dropdown siswa | `1234` | Melihat seluruh info kelas & mengatur status tugas pribadi miliknya |
| **Pengurus (Admin)** | Masuk melalui tab Admin / Pengurus | `admin123` | Hak akses penuh: membuat/mengedit/menghapus tugas, pengumuman, ujian, jadwal, dan transaksi kas |

> **Catatan:** Anda dapat beralih akun kapan saja melalui tombol **"Ganti Akun"** di header atas atau pada kartu nama di footer sidebar.

---

## 🖼️ Panduan Kustomisasi Foto / Logo Kelas

Aplikasi sudah memiliki slot khusus untuk logo atau foto kelas:

1. Masuk ke folder **`assets/`**.
2. Masukkan file foto atau logo kelas Anda dengan nama **`logo.svg`** atau **`logo.png`**.
3. Muat ulang (*refresh*) halaman peramban. Logo baru akan otomatis muncul di:
   - Pojok kiri atas **Sidebar Navigation**.
   - Kartu identitas pada **Layar Login**.
   - Header kartu profil pada halaman **Daftar Anggota**.

*Jika file gambar belum ada atau terjadi kesalahan memuat, aplikasi otomatis menampilkan emblem fallback `"CH"` yang rapi.*

---

## 💻 Cara Menjalankan Aplikasi Secara Lokal

Aplikasi ini dibuat menggunakan standar web murni (*Vanilla JavaScript, HTML5, CSS3*) tanpa perlu instalasi build tool yang rumit:

### Opsi 1: Menggunakan Python (Direkomendasikan)
Buka terminal / PowerShell di folder proyek dan jalankan:
```bash
python -m http.server 8080
```
Buka peramban dan akses: **`http://localhost:8080`**

### Opsi 2: Menggunakan VS Code Live Server
1. Buka folder proyek di Visual Studio Code.
2. Klik kanan pada file `index.html` dan pilih **"Open with Live Server"**.

### Opsi 3: Membuka Langsung di Peramban
Anda juga dapat langsung membuka file `index.html` menggunakan browser pilihan Anda (Google Chrome, Microsoft Edge, Safari, Firefox).

---

## 📁 Struktur Folder Proyek

```
Web-kelas/
├── index.html               # Halaman utama SPA & container layout
├── README.md                # Dokumentasi lengkap proyek
├── assets/
│   └── logo.svg             # File foto / logo kelas
├── css/
│   ├── tokens.css           # Variabel token warna (Light & Dark Mode)
│   ├── main.css             # Tata letak utama, sidebar, header & responsivitas
│   ├── components.css       # Komponen UI (Buttons, Badges, Modals, Forms, Pills)
│   └── views.css            # Desain spesifik per halaman / modul aplikasi
└── js/
    ├── app.js               # Router SPA, Controller Modal, Toast, & Auth Gate
    ├── auth.js              # Manajemen session & autentikasi pengguna
    ├── store.js             # State management reaktif (Local Storage & Seed Data)
    └── views/
        ├── loginGate.js     # Tampilan halaman gerbang login
        ├── dashboard.js     # Tampilan ringkasan dashboard fokus harian
        ├── announcements.js # Tampilan papan pengumuman kelas
        ├── tasks.js         # Tampilan daftar tugas & progres siswa
        ├── exams.js         # Tampilan hitung mundur ujian
        ├── schedules.js     # Tampilan jadwal mapel & regu piket
        ├── calendar.js      # Tampilan kalender & agenda terpadu
        ├── cash.js          # Tampilan kas, iuran, & buku transaksi
        └── members.js       # Tampilan struktur pengurus & direktori anggota
```

---

## 🛠️ Teknologi yang Digunakan

- **Struktur**: Semantic HTML5
- **Gaya Tampilan**: Pure Vanilla CSS3 dengan arsitektur Design Tokens (Notion / Linear Style)
- **Logika & State**: Modular JavaScript (ES6 Modules) dengan Reactive LocalStorage Store
- **Ikonografi**: [Lucide Icons](https://lucide.dev/)
- **Tipografi**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)

---

## 🔄 Reset Data Testing
Untuk mengembalikan seluruh data simulasi ke kondisi awal:
1. Klik tombol **"Ganti Akun"** di header atas.
2. Klik tombol merah **"Reset Data Testing / Demo"**.
3. Data akan langsung di-reset ke nilai default bawaan.

---
*Dibuat untuk mempermudah koordinasi dan transparansi kelas XII PPLG 1.* 🚀
