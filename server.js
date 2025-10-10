const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// --- KONFIGURASI SUPABASE ---
const supabaseUrl = 'https://pueiihojzrxuloqqiakc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZWlpaG9qenJ4dWxvcXFpYWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg1NzcsImV4cCI6MjA3NTY2NDU3N30.XvX3-BLnV_U507DGa8WhQ8y4Tz4aCmdJn0qmZBa45Ik';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- KONFIGURASI EXPRESS ---
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!require('fs').existsSync(dir)) require('fs').mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ===== API ENDPOINTS (DIPERBAIKI) =====

// [GET] ... (Semua endpoint GET tidak berubah)
app.get('/api/products', async (req, res) => { /* ... biarkan seperti semula ... */ });
app.get('/api/products/:id', async (req, res) => { /* ... biarkan seperti semula ... */ });
app.get('/api/categories', async (req, res) => { /* ... biarkan seperti semula ... */ });

// [POST] Tambah produk baru (DIPERBAIKI)
app.post('/api/products', upload.single('gambar'), async (req, res) => {
    // Multer sekarang akan membaca form-data, sehingga req.body tidak akan kosong
    const { nama, harga, kategori, deskripsi } = req.body;
    const { data, error } = await supabase.from('products').insert({
        nama,
        harga: Number(harga),
        kategori,
        deskripsi,
        gambar: req.file ? `uploads/${req.file.filename}` : 'uploads/placeholder.jpg',
    }).select();

    if (error) {
        console.log('🔥 Error dari Supabase (POST):', error);
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data[0]);
});

// [PUT] Update produk berdasarkan ID (DIPERBAIKI)
app.put('/api/products/:id', upload.single('gambar'), async (req, res) => {
    const updateData = { ...req.body, harga: Number(req.body.harga) };
    if (req.file) {
        updateData.gambar = `uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase.from('products')
        .update(updateData)
        .eq('id', req.params.id)
        .select();

    if (error) {
        console.log('🔥 Error dari Supabase (PUT):', error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data[0]);
});

// [DELETE] ... (Endpoint DELETE tidak berubah)
app.delete('/api/products/:id', async (req, res) => { /* ... biarkan seperti semula ... */ });

// [GET] & [POST] Ulasan ... (Endpoint ulasan tidak berubah)
app.get('/api/products/:productId/reviews', async (req, res) => { /* ... biarkan seperti semula ... */ });
app.post('/api/products/:productId/reviews', async (req, res) => { /* ... biarkan seperti semula ... */ });

// ===== SERVER START =====
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT} dan terhubung ke Supabase.`);
});