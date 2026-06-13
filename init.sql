-- JAGA BERSAMA - DATABASE INITIALIZATION SCHEMA (POSTGRESQL / SUPABASE)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nomor_hp VARCHAR(20) NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    profile_photo TEXT DEFAULT '',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(15) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    nama_pelapor VARCHAR(100) NOT NULL,
    email_pelapor VARCHAR(100) NOT NULL,
    nomor_hp_pelapor VARCHAR(20) NOT NULL,
    anonim BOOLEAN DEFAULT FALSE,
    tipe_bullying VARCHAR(20) NOT NULL CHECK (tipe_bullying IN ('Cyberbullying', 'Verbal', 'Fisik', 'Sosial')),
    lokasi VARCHAR(50) NOT NULL CHECK (lokasi IN ('Sekolah', 'Kampus', 'Kerja', 'Online', 'Lainnya')),
    siapa_pelaku VARCHAR(50) NOT NULL CHECK (siapa_pelaku IN ('Teman Sekelas', 'Teman Kerja', 'Dewasa', 'Kelompok', 'Tidak Dikenal')),
    deskripsi TEXT NOT NULL,
    tanggal_terjadi DATE NOT NULL,
    berlangsung_terus BOOLEAN DEFAULT FALSE,
    bukti_tipe VARCHAR(20) DEFAULT 'Tidak Ada' CHECK (bukti_tipe IN ('Tidak Ada', 'Screenshot', 'URL')),
    bukti_url TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'Diterima' CHECK (status IN ('Diterima', 'Diproses', 'Selesai', 'Ditolak')),
    catatan TEXT DEFAULT '',
    processed_by_admin UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    date VARCHAR(20) NOT NULL,
    read_time VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for speed tracking number lookup
CREATE INDEX IF NOT EXISTS idx_reports_tracking ON reports(tracking_number);
-- Index for user reports lookup
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
