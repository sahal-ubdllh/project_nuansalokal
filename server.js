const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// --- KONFIGURASI SUPABASE ---
const supabaseUrl = 'https://pueiihojzrxuloqqiakc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZWlpaG9qenJ4dWxvcXFpYWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg1NzcsImV4cCI6MjA3NTY2NDU3N30.XvX3-BLnV_U507DGa8WhQ8y4Tz4aCmdJn0qmZBa45Ik';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// =======================================================
// ===== API ENDPOINTS AUTENTIKASI =======================
// =======================================================

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Nama, email, dan password tidak boleh kosong." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase.from('users').insert({ username, email, password_hash: hashedPassword }).select().single();
        if (error) {
            if (error.code === '23505') return res.status(409).json({ error: "Email sudah terdaftar." });
            throw error;
        }
        res.status(201).json({ message: "Pendaftaran berhasil!", user: data });
    } catch (error) {
        console.error('🔥 Error saat registrasi:', error);
        res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email dan password tidak boleh kosong." });
    }
    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (error || !user) {
            return res.status(401).json({ error: "Email atau password salah." });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Email atau password salah." });
        }
        delete user.password_hash;
        res.status(200).json({ message: "Login berhasil!", user });
    } catch (error) {
        console.error('🔥 Error saat login:', error);
        res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
});

// =======================================================
// ===== API ENDPOINTS PRODUK & LAINNYA ==================
// =======================================================

app.get('/api/products', async (req, res) => {
    try {
        const { q, kategori } = req.query;
        let productQuery = supabase.from('products').select('*');
        if (q) productQuery = productQuery.or(`nama.ilike.%${q}%,deskripsi.ilike.%${q}%`);
        if (kategori) productQuery = productQuery.eq('kategori', kategori);
        const { data: products, error: productError } = await productQuery;
        if (productError) throw productError;
        const { data: allReviews, error: reviewError } = await supabase.from('reviews').select('product_id, rating');
        if (reviewError) throw reviewError;
        const ratingMap = allReviews.reduce((acc, review) => {
            if (review && review.product_id) {
                const { product_id, rating } = review;
                if (!acc[product_id]) acc[product_id] = { totalRating: 0, count: 0 };
                acc[product_id].totalRating += rating;
                acc[product_id].count += 1;
            }
            return acc;
        }, {});
        const productsWithRatings = products.map(product => {
            const ratingData = ratingMap[product.id];
            return { ...product, average_rating: ratingData ? ratingData.totalRating / ratingData.count : 0, review_count: ratingData ? ratingData.count : 0 };
        });
        res.json(productsWithRatings);
    } catch (error) {
        console.error('🔥 Error di /api/products:', error);
        res.status(500).json({ error: "Gagal memuat produk.", details: error.message });
    }
});

app.get('/api/products/terlaris', async (req, res) => {
    try {
        const { data: products, error: productError } = await supabase.from('products').select('*');
        if (productError) throw productError;
        const { data: allReviews, error: reviewError } = await supabase.from('reviews').select('product_id, rating');
        if (reviewError) throw reviewError;
        const ratingMap = allReviews.reduce((acc, review) => {
            if (review && review.product_id) {
                const { product_id, rating } = review;
                if (!acc[product_id]) acc[product_id] = { totalRating: 0, count: 0 };
                acc[product_id].totalRating += rating;
                acc[product_id].count += 1;
            }
            return acc;
        }, {});
        const productsWithRatings = products.map(product => {
            const ratingData = ratingMap[product.id];
            return { ...product, average_rating: ratingData ? ratingData.totalRating / ratingData.count : 0, review_count: ratingData ? ratingData.count : 0 };
        });
        productsWithRatings.sort((a, b) => b.review_count - a.review_count);
        const topProducts = productsWithRatings.slice(0, 8);
        res.json(topProducts);
    } catch (error) {
        console.error('🔥 Error di /api/products/terlaris:', error);
        res.status(500).json({ error: "Gagal memuat produk terlaris.", details: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
        return res.status(404).json({ message: `Produk dengan ID ${id} tidak ditemukan.`, details: error.message });
    }
    res.json(data);
});

// Sisa endpoint lainnya...
app.get('/api/categories', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('kategori');
        if (error) throw error;
        const uniqueCategories = [...new Set(data.map(item => item.kategori))];
        res.json(uniqueCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/products', upload.single('gambar'), async (req, res) => {
    const { nama, harga, kategori, deskripsi } = req.body;
    const insertData = { nama, harga: Number(harga), kategori, deskripsi, gambar: req.file ? `uploads/${req.file.filename}` : 'uploads/placeholder.jpg' };
    const { data, error } = await supabase.from('products').insert(insertData).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});
app.put('/api/products/:id', upload.single('gambar'), async (req, res) => {
    const { id } = req.params;
    const { nama, harga, kategori, deskripsi } = req.body;
    const updateData = { nama, harga: Number(harga), kategori, deskripsi };
    if (req.file) updateData.gambar = `uploads/${req.file.filename}`;
    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
});
app.get('/api/products/:productId/reviews', async (req, res) => {
    const { productId } = req.params;
    const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});
app.post('/api/products/:productId/reviews', async (req, res) => {
    const { productId } = req.params;
    const { rating, teks, nama } = req.body;
    const { data, error } = await supabase.from('reviews').insert({ product_id: productId, rating: Number(rating), teks, nama: nama || 'Pengguna Anonim' }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// ===== SERVER START =====
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT} dan terhubung ke Supabase.`);
});