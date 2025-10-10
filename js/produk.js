document.addEventListener("DOMContentLoaded", () => {
  // === 1. Deklarasi Elemen & Variabel ===
  const terbaruContainer = document.querySelector(".produk-terbaru .produk-list");
  const kategoriSection = document.getElementById("produk-kategori");
  const kategoriListEl = kategoriSection?.querySelector(".produk-list");
  const judulKategoriEl = document.getElementById("judulKategori");
  const resetBtn = document.getElementById("resetKategoriBtn");
  const API_URL = "http://localhost:3000";

  // === 2. Fungsi Helper untuk Merender Kartu Produk ===
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
      // Menambahkan event listener agar seluruh kartu bisa diklik
      div.addEventListener('click', () => {
        window.location.href = `produk.html?id=${p.id}`;
      });
      container.appendChild(div);
    });
  };
  
  // === 3. Fungsi untuk Memuat Produk Terbaru (Saat Halaman Pertama Kali Dibuka) ===
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

  // === 4. LOGIKA UTAMA: Event Listener untuk Setiap Item Kategori ===
  document.querySelectorAll('.kategori-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault(); // Mencegah link berpindah halaman!

      const kategori = item.dataset.kategori;
      if (!kategori) return;

      // Tampilkan section kategori dan set judulnya
      if (judulKategoriEl) judulKategoriEl.textContent = kategori;
      if (kategoriSection) kategoriSection.style.display = 'block';
      
      // Tampilkan pesan loading selagi mengambil data
      if (kategoriListEl) kategoriListEl.innerHTML = '<p style="text-align:center;">Memuat produk...</p>';

      // Ambil data produk yang sudah difilter dari backend
      try {
        const response = await fetch(`${API_URL}/api/products?category=${kategori}`);
        const products = await response.json();
        renderGrid(kategoriListEl, products); // Render hasilnya
      } catch (error) {
        console.error("Gagal memuat produk kategori:", error);
        if (kategoriListEl) kategoriListEl.innerHTML = '<p style="text-align:center;color:red;">Gagal memuat produk.</p>';
      }
    });
  });

  // === 5. Event Listener untuk Tombol Reset Kategori ===
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Sembunyikan kembali section kategori
      if (kategoriSection) kategoriSection.style.display = 'none';
      // Kosongkan isinya
      if (kategoriListEl) kategoriListEl.innerHTML = '';
    });
  }

  // === 6. Panggil Fungsi Awal ===
  // Memuat produk terbaru saat halaman pertama kali dibuka
  fetchProdukTerbaru();
});