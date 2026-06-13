# 🛡️ Jaga Bersama — Platform Anti-Bullying Gen Z Indonesia

Jaga Bersama adalah sebuah platform aduan dan edukasi anti-bullying (perundungan) yang responsif dan dirancang khusus untuk anak muda (Gen Z) Indonesia. Menggunakan arsitektur full-stack dengan perutean SPA (Single Page Application) tanpa framework yang cepat, aman, dan didukung database PostgreSQL (**Supabase**).

---

## Fitur Utama

1. **Beranda**: Halaman utama edukatif berdesain premium dengan animasi tulisan bertahap (stagger) dan statistik.
2. **Pengertian**: 4 artikel edukatif berbentuk akordion interaktif yang membahas tipe bullying, tanda bahaya, dampak psikologis, dan tips berselancar aman di dunia maya.
3. **Bentuk Bullying**: Pengenalan 4 bentuk bullying utama (Cyber, Verbal, Fisik, Sosial) beserta contoh kutipan ucapan dan tombol lapor cepat yang langsung mengisi tipe bullying di formulir laporan.
4. **Kuis Interaktif**: Uji pemahaman 5 soal pilihan ganda dengan progress bar dinamis, navigasi bolak-balik, penilaian persentase skor, badges kelulusan, tinjauan per-soal, dan tombol bagikan hasil.
5. **Galeri & Suara Korban**: Carousel testimonials dan expert quotes yang berotasi otomatis tiap 5 detik, mendukung jeda saat melayangkan kursor (pause on hover), swipe di layar sentuh ponsel, dan navigasi titik manual.
6. **Formulir Laporan 4 Langkah (Wizard)**:
   - *Langkah 1*: Pengisian data diri pelapor dengan opsi aduan anonim.
   - *Langkah 2*: Detail peristiwa (tipe, lokasi, tanggal, deskripsi kronologis, dan radio terus-menerus).
   - *Langkah 3*: Bukti pendukung (unggahan gambar screenshot dengan verifikasi file maks 5MB, atau input tautan dokumen).
   - *Langkah 4*: Tinjauan ringkasan (summary) data yang diisi beserta persetujuan kebijakan privasi sebelum dikirim.
   - *Sukses*: Menampilkan nomor tracking aduan unik (`JB-XXXXXXXX`), disusul dengan efek hujan konfeti, serta notifikasi email otomatis ke pelapor via EmailJS.
7. **Autentikasi & Dashboard Pengguna**:
   - Pendaftaran dan masuk akun yang aman dengan password hashing (bcryptjs) dan otentikasi berbasis JWT Token.
   - Halaman Dashboard khusus untuk mengubah profil akun, ganti password, serta melacak daftar seluruh laporan pribadi lengkap dengan status aduan ter-update (`Diterima` / `Diproses` / `Selesai` / `Ditolak`) dan catatan admin.

---

## Panduan Instalasi & Database Setup

### Prasyarat
- **Node.js** terinstal (versi 16 atau lebih tinggi).
- Akun dan project **Supabase** aktif.

### Langkah 1: Setup Database (Supabase SQL Editor)
1. Buka dashboard project **Supabase** Anda di browser.
2. Navigasi ke menu **SQL Editor** di sidebar kiri.
3. Klik **New Query** untuk membuka tab baru.
4. Buka file database schema di project Anda:
   [`backend/db/init.sql`](file:///c:/Users/mhdto/Desktop/UAS%20PANCASILA/jaga-bersama/backend/db/init.sql)
5. Salin (copy) seluruh konten SQL tersebut, tempel (paste) ke SQL Editor Supabase, lalu klik tombol **Run**. Ini akan otomatis membuat tabel `users`, `reports`, dan `articles`.

### Langkah 2: Setup Environment Backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Instal seluruh dependensi:
   ```bash
   npm install
   ```
3. Salin file `.env.example` menjadi `.env`:
   ```bash
   copy .env.example .env
   ```
4. Dapatkan **Connection String (URI)** Supabase Anda:
   - Di Supabase Dashboard, masuk ke **Project Settings** -> **Database**.
   - Cari kolom **Connection string**, pilih opsi **URI**, lalu salin string tersebut.
5. Tempel connection string tersebut ke variabel `DATABASE_URL` di dalam file `.env` Anda, dan pastikan mengganti teks `[PASSWORD]` dengan password database project Supabase Anda.
   *Contoh:*
   `DATABASE_URL=postgres://postgres.xxx:password_anda@aws-0-xx.pooler.supabase.com:6543/postgres?sslmode=require`

### Langkah 3: Jalankan Aplikasi
1. Jalankan server backend:
   ```bash
   # Mode Development
   npm run dev
   ```
   *Catatan: Saat server mendeteksi tabel `articles` kosong, sistem akan otomatis melakukan seeding data 4 artikel utama ke database Supabase Anda.*
2. Buka `http://localhost:5000/` di browser untuk mengakses website. Express server menyajikan file statis frontend langsung dari port ini.

---

## Indeks API Endpoints

### 1. Autentikasi (`/api/auth`)
- `POST /register`: Mendaftarkan user baru (validasi nama, email unik, nomor HP, password min 8 karakter + 1 huruf besar + 1 angka).
- `POST /login`: Masuk akun (membandingkan hash bcrypt, memperbarui `lastLogin`, mengirimkan Token JWT).
- `GET /profile` [PROTECTED]: Mengambil info data diri user saat ini.
- `PUT /profile` [PROTECTED]: Memperbarui nama lengkap, email, nomor HP, atau gender.
- `PUT /password` [PROTECTED]: Mengganti kata sandi lama ke kata sandi baru.

### 2. Laporan Aduan (`/api/reports`)
- `POST /`: Membuat laporan baru (mendukung anonim, otomatis menghasilkan nomor tracking aduan acak berawalan `JB-`, menyematkan userID jika login).
- `GET /:trackingNumber`: Mendapatkan status progres aduan publik berdasarkan nomor tracking.
- `GET /my-reports/:userId` [PROTECTED]: Mengambil riwayat seluruh laporan yang diajukan oleh pengguna terkait.

### 3. Artikel Edukasi (`/api/articles`)
- `GET /`: Mengambil seluruh artikel terdaftar.
- `GET /:id`: Mengambil detail artikel tunggal berdasarkan ID.
