document.addEventListener("DOMContentLoaded", async () => {
    // 1. Ambil ID produk dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const container = document.querySelector(".produk-detail"); // Targetkan kontainer utama
    const ratingSection = document.querySelector(".rating-ulasan"); // Targetkan section ulasan
    
    const API_URL = "http://localhost:3001";
    
    // Fungsi untuk menampilkan pesan error di tengah halaman
    const showErrorMessage = (message) => {
        if (container) container.innerHTML = `<p style='text-align:center; font-size: 1.2rem; color: #555; padding: 50px 0;'>${message}</p>`;
        if (ratingSection) ratingSection.style.display = 'none'; // Sembunyikan section ulasan
    };

    if (!productId) {
        showErrorMessage("❌ ID Produk tidak valid atau tidak ditemukan di URL.");
        return;
    }

    try {
        // 2. Ambil data produk & ulasan dari API
        const [productRes, reviewsRes] = await Promise.all([
            fetch(`${API_URL}/api/products/${productId}`),
            fetch(`${API_URL}/api/products/${productId}/reviews`)
        ]);

        // [PERBAIKAN UTAMA] Jika produk tidak ditemukan (error 404), tampilkan pesan
        if (!productRes.ok) {
            showErrorMessage(`🔎 Produk yang Anda cari tidak dapat ditemukan.`);
            return;
        }

        const product = await productRes.json();
        const ulasanList = await reviewsRes.json();
        
        // 3. Jika berhasil, isi semua konten produk
        document.getElementById("mainImage").src = `${API_URL}/${product.gambar}`;
        document.getElementById("namaProduk").textContent = product.nama;
        document.getElementById("hargaProduk").textContent = `Rp ${product.harga.toLocaleString("id-ID")}`;
        document.getElementById("kategoriProduk").textContent = product.kategori;
        document.getElementById("deskripsiProduk").textContent = product.deskripsi;
        
        document.getElementById("btnKembali").addEventListener("click", () => window.history.back());

        // 4. Render ulasan (logika tidak berubah)
        renderUlasan(ulasanList);

        // 5. Event listener untuk form ulasan (logika tidak berubah)
        document.getElementById("formUlasan").addEventListener("submit", async (e) => {
            e.preventDefault();
            const rating = Number(document.getElementById("ratingInput").value);
            const teks = document.getElementById("teksUlasan").value.trim();
            if (!teks) return alert('Ulasan tidak boleh kosong!');

            const postResponse = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, teks, nama: 'Pengguna Anonim' })
            });
            
            if (!postResponse.ok) throw new Error('Gagal mengirim ulasan.');

            const updatedReviewsRes = await fetch(`${API_URL}/api/products/${productId}/reviews`);
            const updatedUlasanList = await updatedReviewsRes.json();
            
            renderUlasan(updatedUlasanList);
            e.target.reset();
        });

    } catch (error) {
        console.error("Error memuat detail produk:", error);
        showErrorMessage(`❌ Terjadi kesalahan saat memuat data. Pastikan server berjalan.`);
    }
});

// Fungsi renderUlasan (tidak berubah)
function renderUlasan(ulasanList) {
    // ... (seluruh isi fungsi renderUlasan Anda sebelumnya tetap sama di sini)
    const reviews = Array.isArray(ulasanList) ? ulasanList : [];
    const daftarUlasanEl = document.getElementById("daftarUlasan");
    const totalUlasanEl = document.getElementById("totalUlasan");
    const ratingAngkaEl = document.getElementById("ratingAngka");
    if (!daftarUlasanEl || !totalUlasanEl || !ratingAngkaEl) return;
    totalUlasanEl.textContent = `(${reviews.length} ulasan)`;
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, u) => sum + u.rating, 0);
        ratingAngkaEl.textContent = (totalRating / reviews.length).toFixed(1);
        daftarUlasanEl.innerHTML = reviews.map(u => `
            <div class="ulasan-item">
              <h4>⭐ ${u.rating} - ${u.nama || 'Pengguna Anonim'}</h4>
              <p>${u.teks}</p>
            </div>`
        ).join("");
    } else {
        ratingAngkaEl.textContent = "0.0";
        daftarUlasanEl.innerHTML = "<p>Belum ada ulasan untuk produk ini.</p>";
    }
}