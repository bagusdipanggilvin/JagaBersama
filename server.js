const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

// Disable TLS verification to allow Supabase self-signed certificates out-of-the-box
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Express setup
const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disables CSP to easily load external fonts & scripts in frontend
}));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://127.0.0.1:5500', 
      'http://localhost:5500', 
      'http://127.0.0.1:8080', 
      'http://localhost:8080', 
      'http://localhost:3000',
      'http://127.0.0.1:5000',
      'http://localhost:5000'
    ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow any local development origin (localhost or 127.0.0.1) dynamically
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (e) {
      // Fail-safe for invalid URLs
    }

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS Policy: Origin not allowed.'), false);
    }
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti." }
});
app.use('/api/', limiter);

// PostgreSQL / Supabase Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/jaga_bersama',
  ssl: {
    rejectUnauthorized: false
  }
});

// Default educational articles data
const defaultArticles = [
  {
    title: "Apa Itu Bullying & Jenis-Jenisnya",
    excerpt: "Bullying bukan cuma fisik. Ketahui 4 tipe utama.",
    content: "Bullying (perundungan) adalah perilaku agresif yang dilakukan secara berulang oleh seseorang atau sekelompok orang yang memiliki kekuatan atau kekuasaan lebih, terhadap orang lain dengan tujuan menyakiti. KPAI mencatat ribuan kasus perundungan terjadi setiap tahunnya di Indonesia. Secara umum, bullying terbagi menjadi 4 jenis utama: Cyberbullying (di dunia digital), Verbal Bullying (hinaan dan ejekan lisan), Physical Bullying (kontak fisik keras seperti pukulan atau dorongan), dan Social Bullying (pengucilan sosial atau penyebaran rumor).",
    author: "Tim Jaga Bersama",
    date: "2026-06-13",
    read_time: "5 menit"
  },
  {
    title: "Dampak Psikologis Bullying",
    excerpt: "Meninggalkan trauma bertahun-tahun.",
    content: "Perundungan bukan sekadar lelucon masa kecil. Penelitian menunjukkan bahwa bullying dapat meninggalkan bekas luka emosional yang mendalam dan memicu trauma bertahun-tahun. Sekitar 68% korban mengalami kecemasan berlebih (anxiety), depresi klinis, insomnia, hingga risiko menyakiti diri sendiri (self-harm). Menurut Pakar Psikologi Klinis UI, 'Bullying merusak konsep diri korban secara perlahan, membuat mereka merasa tidak berharga. Dukungan psikologis awal sangat penting untuk pemulihan jangka panjang.'",
    author: "Psikolog Klinis",
    date: "2026-06-12",
    read_time: "4 menit"
  },
  {
    title: "Cara Identifikasi Bullying",
    excerpt: "Warning signs apa yang perlu diperhatikan?",
    content: "Seringkali korban bullying memilih diam karena takut atau malu. Oleh karena itu, penting bagi kita untuk mengenali tanda-tanda peringatan (warning signs) pada teman atau kerabat kita: 1) Tiba-tiba takut atau malas pergi sekolah/kerja, 2) Luka fisik atau lebam misterius yang tidak bisa dijelaskan, 3) Menjadi tertutup, murung, atau menarik diri dari pergaulan, 4) Kehilangan barang-barang pribadi secara mencurigakan, 5) Penurunan prestasi akademik atau performa kerja, dan 6) Perubahan drastis pada pola makan atau pola tidur.",
    author: "Konselor BK",
    date: "2026-06-10",
    read_time: "3 menit"
  },
  {
    title: "Tips Aman Online Gen Z",
    excerpt: "Media sosial nyaman tapi rawan bullying.",
    content: "Dunia digital menawarkan koneksi tanpa batas, tetapi juga menjadi tempat subur bagi cyberbullying. Berikut adalah tips aman berselancar di media sosial untuk Gen Z: 1) Atur akun media sosial menjadi privat dan selektif menerima pertemanan, 2) Jangan membagikan informasi pribadi seperti alamat rumah, nomor telepon, atau jadwal harian, 3) Gunakan fitur block dan report jika ada akun yang mengganggu, 4) Pikirkan matang-matang sebelum mengunggah foto atau status, 5) Jangan membalas komentar negatif dengan kebencian serupa, dan 6) Laporkan konten perundungan ke platform aduan seperti Jaga Bersama.",
    author: "Sosiolog Pendidikan",
    date: "2026-06-08",
    read_time: "6 menit"
  }
];

// Helper to seed database table articles if empty
const seedArticlesIfEmpty = async () => {
  try {
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'articles'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      const countRes = await pool.query('SELECT COUNT(*) FROM articles');
      const count = parseInt(countRes.rows[0].count);
      
      if (count === 0) {
        for (const art of defaultArticles) {
          const insertQuery = `
            INSERT INTO articles (title, excerpt, content, author, date, read_time)
            VALUES ($1, $2, $3, $4, $5, $6)
          `;
          await pool.query(insertQuery, [art.title, art.excerpt, art.content, art.author, art.date, art.read_time]);
        }
        console.log("Database seeded with default articles successfully.");
      }
    } else {
      console.log("Articles table does not exist. Make sure to run database init.sql schema first.");
    }
  } catch (error) {
    console.error("Seeding Articles Error:", error);
  }
};

// Verify Database Connection
pool.query('SELECT NOW()')
  .then((res) => {
    console.log('Successfully connected to PostgreSQL (Supabase). Server time:', res.rows[0].now);
    seedArticlesIfEmpty();
  })
  .catch((err) => {
    console.error('PostgreSQL Connection Error:', err.message);
  });

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. GET /api/articles - Get all articles
app.get('/api/articles', async (req, res) => {
  try {
    const articlesQuery = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    const mappedArticles = articlesQuery.rows.map(row => ({
      _id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      author: row.author,
      date: row.date,
      readTime: row.read_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    return res.status(200).json(mappedArticles);
  } catch (error) {
    console.error("Get Articles Error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server saat mengambil artikel." });
  }
});

// Helper: Generate unique random tracking number
const generateTrackingNumber = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let trackingNumber = '';
  
  while (!isUnique) {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    trackingNumber = `JB-${result}`;
    
    // Check in database
    const checkRes = await pool.query('SELECT id FROM reports WHERE tracking_number = $1', [trackingNumber]);
    if (checkRes.rows.length === 0) {
      isUnique = true;
    }
  }
  return trackingNumber;
};

// 2. POST /api/reports - Create new report
app.post('/api/reports', async (req, res) => {
  try {
    const {
      namaPelapor,
      emailPelapor,
      nomorHPPelapor,
      anonim,
      tipeBullying,
      lokasi,
      siapaPelaku,
      deskripsi,
      tanggalTerjadi,
      berlangsungTerus,
      bukti
    } = req.body;

    // Required fields check
    if (!namaPelapor || !emailPelapor || !nomorHPPelapor || !tipeBullying || !lokasi || !siapaPelaku || !deskripsi || !tanggalTerjadi) {
      return res.status(400).json({ message: "Field utama laporan wajib diisi." });
    }

    if (deskripsi.length < 20 || deskripsi.length > 1000) {
      return res.status(400).json({ message: "Deskripsi harus berisi antara 20 dan 1000 karakter." });
    }

    // Optional user mapping (stale token check to prevent constraint crash)
    let linkedUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_jagabersama_2026');
        linkedUserId = decoded.userId;
        
        if (linkedUserId) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(linkedUserId)) {
            linkedUserId = null;
          } else {
            const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [linkedUserId]);
            if (userCheck.rows.length === 0) {
              linkedUserId = null;
            }
          }
        }
      } catch (err) {
        linkedUserId = null; // Ensure it's reset on any token or DB error
      }
    }

    const trackingNumber = await generateTrackingNumber();

    let buktiTipe = "Tidak Ada";
    let buktiURL = "";
    if (bukti) {
      if (bukti.URL && bukti.URL.trim() !== "") {
        buktiURL = bukti.URL;
        buktiTipe = "URL";
      }
    }

    const finalNamaPelapor = anonim ? "Pelapor Anonim" : namaPelapor;

    const insertQuery = `
      INSERT INTO reports (
        tracking_number, user_id, nama_pelapor, email_pelapor, nomor_hp_pelapor,
        anonim, tipe_bullying, lokasi, siapa_pelaku, deskripsi, tanggal_terjadi,
        berlangsung_terus, bukti_tipe, bukti_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const insertRes = await pool.query(insertQuery, [
      trackingNumber,
      linkedUserId,
      finalNamaPelapor,
      emailPelapor,
      nomorHPPelapor,
      anonim || false,
      tipeBullying,
      lokasi,
      siapaPelaku,
      deskripsi,
      new Date(tanggalTerjadi),
      berlangsungTerus || false,
      buktiTipe,
      buktiURL,
      "Diterima"
    ]);

    const newReport = insertRes.rows[0];

    return res.status(201).json({
      message: "Laporan berhasil dikirim.",
      trackingNumber,
      status: "Diterima",
      report: {
        _id: newReport.id,
        trackingNumber: newReport.tracking_number,
        userID: newReport.user_id,
        namaPelapor: newReport.nama_pelapor,
        emailPelapor: newReport.email_pelapor,
        nomorHPPelapor: newReport.nomor_hp_pelapor,
        anonim: newReport.anonim,
        tipeBullying: newReport.tipe_bullying,
        lokasi: newReport.lokasi,
        siapaPelaku: newReport.siapa_pelaku,
        deskripsi: newReport.deskripsi,
        tanggalTerjadi: newReport.tanggal_terjadi,
        berlangsungTerus: newReport.berlangsung_terus,
        bukti: {
          tipe: newReport.bukti_tipe || "Tidak Ada",
          URL: newReport.bukti_url || ""
        },
        status: newReport.status,
        catatan: newReport.catatan || "",
        createdAt: newReport.created_at,
        updatedAt: newReport.updated_at
      }
    });

  } catch (error) {
    console.error("Create Report Error:", error);
    return res.status(500).json({ 
      message: "Terjadi kesalahan server saat membuat laporan.",
      error: error.message
    });
  }
});

// 3. GET /api/reports/:trackingNumber - Check report status
app.get('/api/reports/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const reportQuery = await pool.query(
      `SELECT tracking_number, tipe_bullying, lokasi, status, catatan, created_at, updated_at, anonim 
       FROM reports WHERE tracking_number = $1`,
      [trackingNumber]
    );

    if (reportQuery.rows.length === 0) {
      return res.status(404).json({ message: "Laporan dengan nomor tracking tersebut tidak ditemukan." });
    }

    const row = reportQuery.rows[0];
    return res.status(200).json({
      trackingNumber: row.tracking_number,
      tipeBullying: row.tipe_bullying,
      lokasi: row.lokasi,
      status: row.status,
      catatan: row.catatan || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      anonim: row.anonim
    });
  } catch (error) {
    console.error("Get Report by Tracking Error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server saat mengambil status laporan." });
  }
});

// Serve Static Frontend files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Catch-all route to serve SPA entrypoint
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ message: "API endpoint tidak ditemukan." });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
