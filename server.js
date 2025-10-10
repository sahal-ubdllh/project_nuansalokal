// Salin semua kode ini ke server.js Anda

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const readDb = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// [GET] Ambil semua produk
app.get('/api/products', (req, res) => {
  let products = readDb().products;
  const { category, q } = req.query;
  if (category) products = products.filter(p => p.kategori === category);
  if (q) products = products.filter(p => p.nama.toLowerCase().includes(q.toLowerCase()));
  res.json(products);
});

// [GET] Ambil SATU produk berdasarkan ID (ENDPOINT BARU)
app.get('/api/products/:id', (req, res) => {
  const products = readDb().products;
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Produk tidak ditemukan" });
  }
});

// [GET] Ambil kategori unik
app.get('/api/categories', (req, res) => {
    const products = readDb().products;
    const categories = [...new Set(products.map(p => p.kategori))];
    res.json(categories);
});

// [POST] Tambah produk baru
app.post('/api/products', upload.single('gambar'), (req, res) => {
  const db = readDb();
  const newProduct = {
    id: Date.now(),
    ...req.body,
    harga: Number(req.body.harga),
    gambar: req.file ? `uploads/${req.file.filename}` : '',
  };
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

// [DELETE] Hapus produk
app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  db.products = db.products.filter(p => p.id != req.params.id);
  writeDb(db);
  res.status(204).send();
});

// [GET] Ambil ulasan untuk produk
app.get('/api/products/:productId/reviews', (req, res) => {
    const db = readDb();
    const reviews = db.reviews[req.params.productId] || [];
    res.json(reviews);
});

// [POST] Tambah ulasan baru
app.post('/api/products/:productId/reviews', (req, res) => {
    const db = readDb();
    const { productId } = req.params;
    if (!db.reviews[productId]) db.reviews[productId] = [];
    const newReview = { ...req.body };
    db.reviews[productId].push(newReview);
    writeDb(db);
    res.status(201).json(newReview);
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});