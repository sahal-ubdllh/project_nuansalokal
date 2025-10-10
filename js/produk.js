document.addEventListener("DOMContentLoaded", () => {
  // === 1. Deklarasi Elemen & Variabel ===
  const terbaruContainer = document.querySelector(".produk-terbaru .produk-list");
  
  // Elemen untuk Kategori
  const kategoriSection = document.getElementById("produk-kategori");
  const kategoriListEl = kategoriSection?.querySelector(".produk-list");
  const judulKategoriEl = document.getElementById("judulKategori");
  const resetKategoriBtn = document.getElementById("resetKategoriBtn");

  // BARU: Elemen untuk Hasil Pencarian
  const hasilPencarianSection = document.getElementById("hasil-pencarian");
  const hasilPencarianListEl = hasilPencarianSection?.querySelector(".produk-list");
  const searchTermSpan = document.getElementById("searchTerm");
  const resetSearchBtn = document.getElementById("resetSearchBtn");

  const API_URL = "http://localhost:3001";

  // === 2. Fungsi Helper untuk Merender Kartu Produk ===
  const renderGrid = (container, list) => { /* ... (fungsi ini tidak berubah) ... */ };
  
  // === 3. Fungsi untuk Memuat Produk Terbaru ===
  async function fetchProdukTerbaru() { /* ... (fungsi ini tidak berubah) ... */ };

  // === 4. Event Listener untuk Item Kategori ===
  document.querySelectorAll('.kategori-item').forEach(item => { /* ... (logika ini tidak berubah) ... */ });

  // === 5. Event Listener untuk Tombol Reset Kategori ===
  if (resetKategoriBtn) { /* ... (logika ini tidak berubah) ... */ };

  // =======================================================
  // === 6. LOGIKA SEARCH BAR (DIPERBARUI) ===
  // =======================================================
  async function handleSearch(query) {
    const searchTerm = query.trim();
    if (!searchTerm) return; // Jangan lakukan apa-apa jika pencarian kosong

    // Sembunyikan section lain yang mungkin aktif
    if (kategoriSection) kategoriSection.style.display = 'none';

    // Tampilkan section hasil pencarian
    if (hasilPencarianSection) hasilPencarianSection.style.display = 'block';
    if (searchTermSpan) searchTermSpan.textContent = searchTerm;
    if (hasilPencarianListEl) hasilPencarianListEl.innerHTML = `<p style="text-align:center;">Mencari produk...</p>`;
    
    try {
      const response = await fetch(`${API_URL}/api/products?q=${searchTerm}`);
      const products = await response.json();
      renderGrid(hasilPencarianListEl, products);
    } catch (error) {
      console.error("Gagal melakukan pencarian:", error);
      if (hasilPencarianListEl) hasilPencarianListEl.innerHTML = `<p style="text-align:center;color:red;">Gagal melakukan pencarian.</p>`;
    }
  }

  // Pasang event listener ke kedua search bar
  document.querySelectorAll('.search-bar').forEach(bar => { /* ... (logika ini tidak berubah) ... */ });

  // BARU: Event listener untuk tombol "Tutup Pencarian"
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      // Sembunyikan section hasil pencarian
      if (hasilPencarianSection) hasilPencarianSection.style.display = 'none';
      // Kosongkan isinya
      if (hasilPencarianListEl) hasilPencarianListEl.innerHTML = '';
      // Kosongkan juga input field pencarian
      document.querySelectorAll('input[type="search"]').forEach(input => input.value = '');
    });
  }

  // === 7. Panggil Fungsi Awal ===
  fetchProdukTerbaru();
});


// ❗ UNTUK KEMUDAHAN, salin dan tempel SELURUH kode di bawah ini ke js/produk.js

document.addEventListener("DOMContentLoaded", () => {
    const terbaruContainer = document.querySelector(".produk-terbaru .produk-list");
    const kategoriSection = document.getElementById("produk-kategori");
    const kategoriListEl = kategoriSection?.querySelector(".produk-list");
    const judulKategoriEl = document.getElementById("judulKategori");
    const resetKategoriBtn = document.getElementById("resetKategoriBtn");
    const hasilPencarianSection = document.getElementById("hasil-pencarian");
    const hasilPencarianListEl = hasilPencarianSection?.querySelector(".produk-list");
    const searchTermSpan = document.getElementById("searchTerm");
    const resetSearchBtn = document.getElementById("resetSearchBtn");
    const API_URL = "http://localhost:3000";

    const renderGrid = (container, list) => {
        if (!container) return;
        container.innerHTML = "";
        if (!list || list.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#777;">Produk tidak ditemukan.</p>`;
            return;
        }
        list.forEach(p => {
            const div = document.createElement("div");
            div.className = "produk-item";
            div.innerHTML = `
                <img src="${API_URL}/${p.gambar}" alt="${p.nama}">
                <h3>${p.nama}</h3>
                <p class="harga">Rp ${p.harga.toLocaleString("id-ID")}</p>
                <button class="beli-btn">Lihat Detail</button>
            `;
            div.addEventListener('click', () => { window.location.href = `produk.html?id=${p.id}`; });
            container.appendChild(div);
        });
    };

    async function fetchProdukTerbaru() {
        if (!terbaruContainer) return;
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const products = await response.json();
            renderGrid(terbaruContainer, products.slice(0, 8));
        } catch (error) {
            console.error("Gagal memuat produk terbaru:", error);
        }
    }

    document.querySelectorAll('.kategori-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const kategori = item.dataset.kategori;
            if (!kategori) return;
            if (hasilPencarianSection) hasilPencarianSection.style.display = 'none';
            if (judulKategoriEl) judulKategoriEl.textContent = kategori;
            if (kategoriSection) kategoriSection.style.display = 'block';
            if (kategoriListEl) kategoriListEl.innerHTML = `<p style="text-align:center;">Memuat produk...</p>`;
            try {
                const response = await fetch(`${API_URL}/api/products?category=${kategori}`);
                const products = await response.json();
                renderGrid(kategoriListEl, products);
            } catch (error) {
                console.error("Gagal memuat produk kategori:", error);
                if (kategoriListEl) kategoriListEl.innerHTML = `<p style="text-align:center;color:red;">Gagal memuat produk.</p>`;
            }
        });
    });

    if (resetKategoriBtn) {
        resetKategoriBtn.addEventListener('click', () => {
            if (kategoriSection) kategoriSection.style.display = 'none';
            if (kategoriListEl) kategoriListEl.innerHTML = '';
        });
    }

    async function handleSearch(query) {
        const searchTerm = query.trim();
        if (!searchTerm) return;
        if (kategoriSection) kategoriSection.style.display = 'none';
        if (hasilPencarianSection) hasilPencarianSection.style.display = 'block';
        if (searchTermSpan) searchTermSpan.textContent = searchTerm;
        if (hasilPencarianListEl) hasilPencarianListEl.innerHTML = `<p style="text-align:center;">Mencari produk...</p>`;
        try {
            const response = await fetch(`${API_URL}/api/products?q=${searchTerm}`);
            const products = await response.json();
            renderGrid(hasilPencarianListEl, products);
        } catch (error) {
            console.error("Gagal melakukan pencarian:", error);
            if (hasilPencarianListEl) hasilPencarianListEl.innerHTML = `<p style="text-align:center;color:red;">Gagal melakukan pencarian.</p>`;
        }
    }

    document.querySelectorAll('.search-bar').forEach(bar => {
        const input = bar.querySelector('input[type="search"]');
        const button = bar.querySelector('button');
        button.addEventListener('click', () => handleSearch(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearch(input.value);
        });
    });

    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', () => {
            if (hasilPencarianSection) hasilPencarianSection.style.display = 'none';
            if (hasilPencarianListEl) hasilPencarianListEl.innerHTML = '';
            document.querySelectorAll('input[type="search"]').forEach(input => input.value = '');
        });
    }

    fetchProdukTerbaru();
});