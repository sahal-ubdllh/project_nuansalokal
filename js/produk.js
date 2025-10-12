document.addEventListener("DOMContentLoaded", () => {
    // --- 1. DEKLARASI BERSAMA (ALAT-ALAT UNTUK SEMUA FUNGSI) ---
    const terbaruContainer = document.querySelector(".produk-terbaru .produk-list");
    const terlarisContainer = document.querySelector(".produk-terlaris .produk-list");
    const kategoriSection = document.getElementById("produk-kategori");
    const kategoriListEl = kategoriSection?.querySelector(".produk-list");
    const judulKategoriEl = document.getElementById("judulKategori");
    const resetKategoriBtn = document.getElementById("resetKategoriBtn");
    const hasilPencarianSection = document.getElementById("hasil-pencarian");
    const hasilPencarianListEl = hasilPencarianSection?.querySelector(".produk-list");
    const searchTermSpan = document.getElementById("searchTerm");
    const resetSearchBtn = document.getElementById("resetSearchBtn");

    // Satu API_URL untuk semua
    const API_URL = "http://localhost:3001";

    // --- 2. FUNGSI RENDER BERSAMA (BISA DIPAKAI SEMUA) ---
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

            let ratingInfo = '';
            if (p.review_count > 0) {
                const stars = '⭐'.repeat(Math.round(p.average_rating));
                const ratingText = `${p.average_rating.toFixed(1)} (${p.review_count} ulasan)`;
                ratingInfo = `<div class="rating-info">${stars} <span class="rating-text">${ratingText}</span></div>`;
            } else {
                ratingInfo = `<div class="rating-info"><span class="rating-text">Belum ada ulasan</span></div>`;
            }

            div.innerHTML = `
                <img src="${API_URL}/${p.gambar}" alt="${p.nama}">
                <h3>${p.nama}</h3>
                ${ratingInfo}
                <p class="harga">Rp ${p.harga.toLocaleString("id-ID")}</p>
                <button class="beli-btn">Lihat Detail</button>
            `;
            div.addEventListener('click', () => { window.location.href = `produk.html?id=${p.id}`; });
            container.appendChild(div);
        });
    };

    // --- 3. FUNGSI-FUNGSI SPESIFIK ---

    // Fungsi untuk memuat produk terbaru
    async function fetchProdukTerbaru() {
        if (!terbaruContainer) return;
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const products = await response.json();
            renderGrid(terbaruContainer, products.slice(0, 8)); // Gunakan renderGrid bersama
        } catch (error) {
            console.error("Gagal memuat produk terbaru:", error);
            terbaruContainer.innerHTML = `<p style="text-align:center;color:red;">Gagal memuat produk terbaru.</p>`;
        }
    }

    // Fungsi untuk memuat produk terlaris
    async function fetchProdukTerlaris() {
        if (!terlarisContainer) return;
        try {
            const response = await fetch(`${API_URL}/api/products/terlaris`);
            if (!response.ok) throw new Error('Gagal memuat data dari server.');
            const produkTerlaris = await response.json();
            renderGrid(terlarisContainer, produkTerlaris); // Gunakan renderGrid bersama
        } catch (error) {
            console.error("Gagal memuat produk terlaris:", error);
            terlarisContainer.innerHTML = `<p style="text-align:center;color:red;">Gagal memuat produk terlaris.</p>`;
        }
    }

    // Fungsi untuk menangani pencarian
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

    // --- 4. EVENT LISTENERS ---

    // Event listener untuk item kategori
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
                const response = await fetch(`${API_URL}/api/products?kategori=${kategori}`);
                const products = await response.json();
                renderGrid(kategoriListEl, products);
            } catch (error) {
                console.error("Gagal memuat produk kategori:", error);
                if (kategoriListEl) kategoriListEl.innerHTML = `<p style="text-align:center;color:red;">Gagal memuat produk.</p>`;
            }
        });
    });

    // Event listener untuk tombol reset kategori
    if (resetKategoriBtn) {
        resetKategoriBtn.addEventListener('click', () => {
            if (kategoriSection) kategoriSection.style.display = 'none';
            if (kategoriListEl) kategoriListEl.innerHTML = '';
        });
    }

    // Event listener untuk search bar
    document.querySelectorAll('.search-bar').forEach(bar => {
        const input = bar.querySelector('input[type="search"]');
        const button = bar.querySelector('button');
        button.addEventListener('click', () => handleSearch(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearch(input.value);
        });
    });

    // Event listener untuk tombol reset pencarian
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', () => {
            if (hasilPencarianSection) hasilPencarianSection.style.display = 'none';
            if (hasilPencarianListEl) hasilPencarianListEl.innerHTML = '';
            document.querySelectorAll('input[type="search"]').forEach(input => input.value = '');
        });
    }

    // --- 5. INISIALISASI HALAMAN (PANGGIL FUNGSI-FUNGSI AWAL) ---
    fetchProdukTerbaru();
    fetchProdukTerlaris();
});