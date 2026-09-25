# 🚀 Panduan Deploy & Checklist Pra-Peluncuran — ClassHub

> Dokumen ini adalah **checklist lengkap** yang harus diverifikasi sebelum setiap deployment ClassHub ke production. Gunakan sebagai referensi wajib agar tidak ada yang terlewat.

---

## 📋 Daftar Isi

1. [Checklist Pra-Deploy](#-1-checklist-pra-deploy)
2. [Persiapan Build Produksi](#-2-persiapan-build-produksi)
3. [Panduan Deploy per Platform](#-3-panduan-deploy-per-platform)
4. [Checklist Pasca-Deploy](#-4-checklist-pasca-deploy)
5. [Validasi PWA](#-5-validasi-pwa)
6. [Troubleshooting Umum](#-6-troubleshooting-umum)
7. [Prosedur Rollback](#-7-prosedur-rollback)

---

## ✅ 1. Checklist Pra-Deploy

### A. Data & Konten

- [x] Semua data siswa di `StoreContext.jsx` sudah **data riil** (bukan dummy/placeholder)
- [x] Daftar nama siswa lengkap (35 siswa) beserta nomor absen
- [x] Struktur pengurus kelas sudah benar (ketua, wakil, sekretaris, bendahara)
- [x] Jadwal pelajaran Senin–Jumat sesuai jadwal resmi sekolah
- [x] Jam bel KBM sudah dikalibrasi di `LiveClassTracker.jsx`
- [x] Jadwal piket kebersihan harian sudah diisi lengkap
- [x] Nama kelas, tahun ajaran, dan nominal kas mingguan sudah benar
- [x] Tidak ada data sensitif (password, API key) yang ter-hardcode di source code

### B. Kode & Kualitas

- [x] `npm run build` berhasil **tanpa error** dan **tanpa warning kritis**
- [x] Tidak ada `console.log()` debugging yang tersisa di kode produksi
- [x] Tidak ada `TODO` atau `FIXME` kritis yang belum diselesaikan
- [x] Semua impor (import) merujuk ke file yang benar dan ada
- [x] Tidak ada dead code atau komponen unused yang memberatkan bundle

### C. Environment & Keamanan

- [x] File `.env` sudah diisi dengan kredensial Supabase yang benar:
  ```
  VITE_SUPABASE_URL=https://oksyweagotmzokmdsjtt.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon-key>
  ```
- [x] File `.env` sudah masuk di `.gitignore` (tidak ter-push ke repository publik)
- [x] `.env.example` tersedia sebagai referensi tanpa nilai rahasia
- [x] Supabase Row Level Security (RLS) sudah aktif di semua tabel
- [x] PIN admin (`admin123`) siap digunakan / dapat diubah mandiri via Dashboard Pengurus

### D. Branding & Aset PWA

- [x] Logo kelas (`/logo.svg`) sudah terpasang
- [x] Ikon PWA tersedia di `/public/`:
  - [x] `pwa-192x192.png` (192×192px)
  - [x] `pwa-512x512.png` (512×512px)
  - [x] `maskable-icon-512x512.png` (512×512px, maskable)
  - [x] `apple-touch-icon.png` (180×180px)
  - [x] `favicon-16x16.png` dan `favicon-32x32.png`
- [x] Nama aplikasi di `vite.config.js` manifest sudah benar:
  - `name`: `ClassHub — XI PPLG`
  - `short_name`: `XI PPLG`
- [x] `theme_color` dan `background_color` sesuai desain
- [x] Meta tag `<title>` dan `<meta description>` di `index.html` sudah tepat (termasuk Open Graph / Twitter card)

### E. Pengujian Fungsional

- [x|EditMore] Login sebagai **Siswa** — Dashboard "Today First" tampil dengan benar 
- [ ] Login sebagai **Admin** — Management Console bisa diakses penuh
- [ ] Live Class Tracker menunjukkan pelajaran yang benar sesuai hari & jam
- [ ] Checklist tugas bisa dicentang dan confetti muncul
- [ ] WhatsApp Share menghasilkan pesan yang benar dan bisa dibagikan
- [ ] Buku kas dan matriks iuran menampilkan data yang akurat
- [ ] Ganti Akun dan Reset Data berfungsi normal
- [ ] Dark mode / Light mode bekerja dengan benar

### F. Pengujian Responsif & Cross-Browser

- [ ] Tampilan rapi di HP (≤ 480px) — uji via `npm run dev -- --host`
- [ ] Tampilan rapi di tablet (768px)
- [ ] Tampilan rapi di desktop (≥ 1024px)
- [ ] Uji di Chrome (Desktop & Mobile)
- [ ] Uji di Safari (iOS)
- [ ] Uji di Samsung Internet / browser bawaan Android
- [ ] Tidak ada horizontal scroll yang tidak diinginkan
- [ ] Bottom navigation dock tidak tertutup konten

---

## 🔨 2. Persiapan Build Produksi

### Langkah Build

```bash
# 1. Pastikan dependensi terpasang dan up-to-date
npm install

# 2. Jalankan build produksi
npm run build

# 3. Preview hasil build secara lokal
npm run preview
```

### Verifikasi Hasil Build

- [ ] Folder `dist/` terbuat dan berisi:
  ```
  dist/
  ├── assets/          # JS & CSS yang sudah di-minify + hash
  │   ├── index-[hash].js
  │   └── index-[hash].css
  ├── index.html       # HTML entry point
  ├── manifest.webmanifest   # PWA manifest
  ├── sw.js            # Service Worker
  ├── registerSW.js    # SW registration script
  └── workbox-*.js     # Workbox runtime
  ```
- [ ] Ukuran total bundle JS < **500 KB** (gzipped)
- [ ] Tidak ada file source map (`.map`) yang bocor ke production (opsional)

### Preview Lokal Sebelum Deploy

```bash
npm run preview
# Buka http://localhost:4173 di browser
```

Verifikasi di preview:
- [ ] Halaman termuat tanpa error di Console
- [ ] Service Worker berhasil register (cek di DevTools → Application → Service Workers)
- [ ] Manifest terbaca (cek di DevTools → Application → Manifest)

---

## 🌐 3. Panduan Deploy per Platform

### Opsi A: Vercel ⭐ (Rekomendasi)

**Keunggulan**: Auto-detect Vite, auto-deploy via `git push`, SSL gratis, domain `.vercel.app`

#### Langkah Pertama Kali

1. **Push kode ke GitHub**:
   ```bash
   git add .
   git commit -m "chore: prepare for production deploy v2.1"
   git push origin main
   ```

2. **Hubungkan ke Vercel**:
   - Buka [vercel.com](https://vercel.com) → Sign up dengan GitHub
   - Klik **"Add New Project"** → Import repository `Web-kelas`
   - Vercel otomatis mendeteksi Vite sebagai framework

3. **Konfigurasi Environment Variables**:
   - Di dashboard Vercel → Project Settings → Environment Variables
   - Tambahkan:
     | Name | Value |
     | :--- | :--- |
     | `VITE_SUPABASE_URL` | `https://oksyweagotmzokmdsjtt.supabase.co` |
     | `VITE_SUPABASE_ANON_KEY` | *(anon key dari Supabase Dashboard)* |

4. **Deploy**: Klik **Deploy** — Vercel akan build dan publish otomatis.

5. **Custom Domain** (opsional):
   - Settings → Domains → Tambahkan domain kustom

#### Deploy Selanjutnya

```bash
git add .
git commit -m "feat: deskripsi perubahan"
git push origin main
# ✅ Vercel otomatis rebuild & deploy
```

---

### Opsi B: Netlify

**Keunggulan**: Drag-and-drop folder `dist/`, setup subdomain gratis

#### Via Drag-and-Drop (Cepat & Tanpa Git)

1. Jalankan `npm run build` di lokal
2. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
3. Seret folder `dist/` ke area drop
4. Selesai — dapatkan URL `*.netlify.app`

#### Via GitHub (Auto-Deploy)

1. Buka [netlify.com](https://www.netlify.com/) → Sign up dengan GitHub
2. **New Site from Git** → Pilih repository
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Environment Variables**: Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
5. Deploy

---

### Opsi C: Cloudflare Pages

**Keunggulan**: Bandwidth unlimited, CDN tercepat di Indonesia

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com/) → Pages
2. **Create a project** → Connect to Git → Pilih repository
3. Build settings:
   - **Framework preset**: `None` (atau pilih Vite jika tersedia)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Environment Variables**: Tambahkan variabel Supabase
5. Deploy

---

### Opsi D: GitHub Pages (Statis Saja)

> ⚠️ **Catatan**: GitHub Pages cocok untuk situs statis. Perlu konfigurasi tambahan untuk SPA routing (redirect semua path ke `index.html`).

1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Tambahkan script di `package.json`:
   ```json
   "scripts": {
     "deploy:gh": "npm run build && gh-pages -d dist"
   }
   ```

3. Tambahkan `base` di `vite.config.js` (sesuaikan nama repo):
   ```js
   base: '/Web-kelas/',
   ```

4. Buat file `dist/404.html` yang redirect ke `index.html` (untuk SPA routing):
   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <script>
         // Redirect semua path ke index.html (SPA hack untuk GitHub Pages)
         window.location.replace(
           window.location.origin + '/Web-kelas/' +
           '?redirect=' + encodeURIComponent(window.location.pathname)
         );
       </script>
     </head>
   </html>
   ```

5. Jalankan deploy:
   ```bash
   npm run deploy:gh
   ```

---

## 🔍 4. Checklist Pasca-Deploy

### Verifikasi Segera (dalam 10 menit pertama)

- [ ] URL production bisa diakses tanpa error
- [ ] Halaman login tampil dengan benar
- [ ] Login siswa & admin berhasil
- [ ] HTTPS aktif (ikon gembok hijau di address bar)
- [ ] Tidak ada **Mixed Content Warning** di Console
- [ ] Koneksi ke Supabase berhasil (data tugas/kas termuat)
- [ ] Cek Console browser: tidak ada error merah

### Verifikasi Performa

- [ ] Jalankan [Google Lighthouse](https://pagespeed.web.dev/) pada URL production
  - **Performance**: ≥ 90
  - **Accessibility**: ≥ 90
  - **Best Practices**: ≥ 90
  - **SEO**: ≥ 90
  - **PWA**: ✅ Installable
- [ ] First Contentful Paint (FCP) < 2 detik
- [ ] Largest Contentful Paint (LCP) < 2.5 detik

### Verifikasi PWA

- [ ] Buka di Chrome Android → muncul banner "Add to Home Screen"
- [ ] Install ke Home Screen → ikon dan nama benar
- [ ] Buka dari Home Screen → fullscreen, tanpa address bar
- [ ] Matikan WiFi → halaman offline cache tetap bisa dibuka
- [ ] Nyalakan WiFi kembali → data realtime kembali sinkron

### Distribusi ke Kelas

- [ ] Siapkan pesan WhatsApp berisi:
  - Link URL production
  - Cara install PWA di HP
  - PIN default siswa (`1234`)
  - Instruksi ganti PIN pertama kali
- [ ] Bagikan ke grup WhatsApp kelas
- [ ] Pantau feedback awal 24 jam pertama

---

## 📱 5. Validasi PWA

### Pengujian PWA Wajib

| Aspek | Cara Cek | ✅ Target |
| :--- | :--- | :--- |
| **Installable** | Chrome DevTools → Application → Manifest | Tidak ada warning |
| **Service Worker** | Chrome DevTools → Application → Service Workers | Status: Activated |
| **Offline** | Matikan WiFi → refresh halaman | Halaman tetap tampil |
| **Icons** | Install → cek ikon di Home Screen | Ikon sesuai dan tajam |
| **Splash Screen** | Buka dari Home Screen | Background color benar |
| **Theme Color** | Address bar / status bar | Warna biru `#2563EB` |
| **Orientation** | Putar HP ke landscape | Tetap portrait-primary |

### Cek Manifest di DevTools

Buka Chrome DevTools → **Application** → **Manifest**, pastikan:
- ✅ `name` = "ClassHub — XI PPLG"
- ✅ `short_name` = "XI PPLG"
- ✅ `display` = "standalone"
- ✅ Icons terdaftar (192px, 512px, maskable)
- ✅ `start_url` = "/"

---

## 🛠️ 6. Troubleshooting Umum

### Build Gagal

| Masalah | Solusi |
| :--- | :--- |
| `Module not found` | Jalankan `npm install` ulang |
| `FATAL ERROR: JavaScript heap out of memory` | Jalankan: `set NODE_OPTIONS=--max-old-space-size=4096` lalu build ulang |
| Vite build error karena syntax | Cek error di terminal, perbaiki file yang ditunjuk |

### Deploy Berhasil tapi Halaman Kosong

| Masalah | Solusi |
| :--- | :--- |
| Path aset salah (404 di JS/CSS) | Pastikan `base` di `vite.config.js` sesuai (`/` untuk root domain, `/repo-name/` untuk GitHub Pages) |
| Environment variable tidak terbaca | Cek apakah env var sudah diset di dashboard hosting (Vercel/Netlify) |
| CORS error ke Supabase | Cek URL Supabase benar dan tidak ada typo |

### PWA Tidak Bisa Diinstall

| Masalah | Solusi |
| :--- | :--- |
| Manifest tidak terbaca | Pastikan `manifest.webmanifest` ada di `dist/` |
| Service Worker gagal register | Cek Console untuk error SW, pastikan HTTPS aktif |
| Ikon PWA tidak muncul | Pastikan file ikon di `/public/` dan path di manifest benar |

### Data Tidak Muncul (Supabase)

| Masalah | Solusi |
| :--- | :--- |
| Tabel kosong / data lama | Cek Supabase Dashboard → Table Editor |
| `401 Unauthorized` | Anon key salah atau expired — regenerate di Supabase Dashboard |
| `PGRST301` error | RLS policy belum dikonfigurasi untuk tabel terkait |

---

## ⏪ 7. Prosedur Rollback

### Jika Deploy Bermasalah

#### Vercel
1. Buka dashboard Vercel → **Deployments**
2. Cari deployment sebelumnya yang stabil
3. Klik **"..."** → **"Promote to Production"**
4. Deployment lama langsung aktif kembali

#### Netlify
1. Buka dashboard Netlify → **Deploys**
2. Klik deployment sebelumnya
3. Klik **"Publish deploy"**

#### Cloudflare Pages
1. Buka dashboard → **Pages** → project
2. Pilih deployment sebelumnya
3. Klik **"Rollback to this deployment"**

#### Manual (Semua Platform)
```bash
# Revert ke commit sebelumnya
git log --oneline -5          # lihat 5 commit terakhir
git revert HEAD               # buat commit revert
git push origin main           # trigger auto-deploy
```

---

## 📌 Ringkasan Cepat: Alur Deploy

```
 ┌──────────────────────────────────────────────────────────────┐
 │                     ALUR DEPLOY CLASSHUB                     │
 ├──────────────────────────────────────────────────────────────┤
 │                                                              │
 │  1. ✅ Checklist Pra-Deploy          (selesaikan semua)      │
 │            │                                                 │
 │            ▼                                                 │
 │  2. 🔨 npm run build                (pastikan 0 error)      │
 │            │                                                 │
 │            ▼                                                 │
 │  3. 👀 npm run preview              (uji lokal)             │
 │            │                                                 │
 │            ▼                                                 │
 │  4. 🌐 git push / manual deploy     (ke Vercel/Netlify)     │
 │            │                                                 │
 │            ▼                                                 │
 │  5. 🔍 Checklist Pasca-Deploy       (verifikasi production) │
 │            │                                                 │
 │            ▼                                                 │
 │  6. 📱 Validasi PWA                 (install & offline)     │
 │            │                                                 │
 │            ▼                                                 │
 │  7. 📣 Bagikan ke kelas             (link + instruksi)      │
 │                                                              │
 └──────────────────────────────────────────────────────────────┘
```

---

*Terakhir diperbarui: September 2026 — ClassHub v2.1*
