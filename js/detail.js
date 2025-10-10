// Salin semua kode ini ke js/detail.js Anda

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const container = document.querySelector(".detail-container");
  const API_URL = "";
  
  if (!productId) {
    container.innerHTML = "<p style='text-align:center;'>❌ ID Produk tidak valid.</p>";
    return;
  }

  try {
    // Memuat data produk dan ulasan secara bersamaan
    const [productRes, reviewsRes] = await Promise.all([
        fetch(`${API_URL}/api/products/${productId}`), // URL diperbaiki
        fetch(`${API_URL}/api/products/${productId}/reviews`)
    ]);

    if (!productRes.ok) throw new Error('Produk tidak ditemukan');

    const product = await productRes.json();
    const ulasanList = await reviewsRes.json();
    
    // Isi konten utama produk
    document.getElementById("mainImage").src = `${API_URL}/${product.gambar}`;
    document.getElementById("namaProduk").textContent = product.nama;
    document.getElementById("hargaProduk").textContent = `Rp ${product.harga.toLocaleString("id-ID")}`;
    document.getElementById("kategoriProduk").textContent = product.kategori;
    document.getElementById("deskripsiProduk").textContent = product.deskripsi;
    
    document.getElementById("btnKembali").addEventListener("click", () => window.history.back());

    // Render Ulasan pertama kali
    renderUlasan(ulasanList);

    // Event listener untuk form ulasan
    document.getElementById("formUlasan").addEventListener("submit", async (e) => {
      console.log("EVENT SUBMIT FORM TERPANGGIL!");
        e.preventDefault();
        const rating = Number(document.getElementById("ratingInput").value);
        const teks = document.getElementById("teksUlasan").value.trim();
        if (!teks) return alert('Ulasan tidak boleh kosong!');

        // 1. Kirim ulasan baru ke server
        await fetch(`${API_URL}/api/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, teks, nama: 'Pengguna Anonim' })
        });
        
        // 2. Ambil LAGI SEMUA ulasan yang sudah ter-update dari server
        const updatedReviewsRes = await fetch(`${API_URL}/api/products/${productId}/reviews`);
        const updatedUlasanList = await updatedReviewsRes.json();
        
        // 3. Render ulang seluruh daftar ulasan
        renderUlasan(updatedUlasanList);
        
        e.target.reset();
    });

  } catch (error) {
    console.error("Error memuat detail produk:", error);
    container.innerHTML = `<p style='text-align:center;'>❌ Gagal memuat produk. ${error.message}</p>`;
  }
});

// FUNGSI INI ADALAH KUNCI PERBAIKANNYA
function renderUlasan(ulasanList) {
    const daftarUlasan = document.getElementById("daftarUlasan");
    if (!daftarUlasan) return;

    document.getElementById("totalUlasan").textContent = `(${ulasanList.length} ulasan)`;

    if (ulasanList.length > 0) {
        const totalRating = ulasanList.reduce((sum, u) => sum + u.rating, 0);
        document.getElementById("ratingAngka").textContent = (totalRating / ulasanList.length).toFixed(1);
        
        // Menggunakan "=" untuk MENGGANTI, bukan "+=" yang MENAMBAH
        daftarUlasan.innerHTML = ulasanList.map(u => `
            <div class="ulasan-item">
              <h4>⭐ ${u.rating} - ${u.nama}</h4>
              <p>${u.teks}</p>
            </div>`
        ).join("");

    } else {
        document.getElementById("ratingAngka").textContent = "0.0";
        // Menggunakan "=" untuk MENGGANTI
        daftarUlasan.innerHTML = "<p>Belum ada ulasan.</p>";
    }
}