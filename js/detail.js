let PRODUK_DETAIL = null;

document.addEventListener("DOMContentLoaded", () => {
  PRODUK_DETAIL = JSON.parse(localStorage.getItem("produkTerpilih"));
  const container = document.querySelector(".detail-container") || document.querySelector(".detail-produk");

  if (!PRODUK_DETAIL) {
    if (container) container.innerHTML = "<p style='text-align:center;'>❌ Produk tidak ditemukan.</p>";
    return;
  }

  // Isi konten utama
  const mainImage = document.getElementById("mainImage");
  const namaEl = document.getElementById("namaProduk");
  const hargaEl = document.getElementById("hargaProduk");
  const kategoriEl = document.getElementById("kategoriProduk");
  const deskEl = document.getElementById("deskripsiProduk");

  if (mainImage) mainImage.src = PRODUK_DETAIL.gambar;
  if (namaEl) namaEl.textContent = PRODUK_DETAIL.nama;
  if (hargaEl) hargaEl.textContent = `Rp ${Number(PRODUK_DETAIL.harga).toLocaleString("id-ID")}`;
  if (kategoriEl) kategoriEl.textContent = PRODUK_DETAIL.kategori || "";
  if (deskEl) deskEl.textContent = PRODUK_DETAIL.deskripsi || "Tidak ada deskripsi.";

  // Tombol kembali
  const backBtn = document.getElementById("btnKembali");
  if (backBtn) backBtn.addEventListener("click", () => window.history.back());

  // Tambah ke keranjang
  const addBtn = document.getElementById("tambahKeranjang");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const keranjang = JSON.parse(localStorage.getItem("cartList")) || [];
      keranjang.push(PRODUK_DETAIL);
      localStorage.setItem("cartList", JSON.stringify(keranjang));
      alert("🛒 Produk ditambahkan ke keranjang!");
    });
  }

  // Rekomendasi
  const semuaProduk = JSON.parse(localStorage.getItem("produkList")) || [];
  const rekomendasiContainer = document.getElementById("produkRekomendasi");
  if (rekomendasiContainer && semuaProduk.length) {
    const rekomendasi = semuaProduk
      .filter(p => p.id !== PRODUK_DETAIL.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    rekomendasiContainer.innerHTML = "";
    rekomendasi.forEach((p) => {
      const item = document.createElement("div");
      item.classList.add("produk-item");
      item.innerHTML = `
        <img src="${p.gambar}" alt="${p.nama}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">
        <h4>${p.nama}</h4>
        <p class="harga">Rp ${Number(p.harga).toLocaleString("id-ID")}</p>
      `;
      item.addEventListener("click", () => {
        localStorage.setItem("produkTerpilih", JSON.stringify(p));
        window.location.reload();
      });
      rekomendasiContainer.appendChild(item);
    });
  }

  // ==== RATING & ULASAN ====
  const produkId = PRODUK_DETAIL.id;
  const ULASAN_KEY = `ulasan_${produkId}`;

  const ambilUlasan = () => {
    try { return JSON.parse(localStorage.getItem(ULASAN_KEY)) || []; } catch { return []; }
  };
  const simpanUlasan = (list) => localStorage.setItem(ULASAN_KEY, JSON.stringify(list));

  const renderUlasan = () => {
    const ulasanList = ambilUlasan();
    const daftarUlasan = document.getElementById("daftarUlasan");
    const totalUlasan = ulasanList.length;

    const totalEl = document.getElementById("totalUlasan");
    if (totalEl) totalEl.textContent = `(${totalUlasan} ulasan)`;

    if (daftarUlasan) {
      daftarUlasan.innerHTML = ulasanList.length
        ? ulasanList.map(u => `
            <div class="ulasan-item">
              <h4>⭐ ${u.rating} - ${u.nama}</h4>
              <p>${u.teks}</p>
            </div>`).join("")
        : "<p>Belum ada ulasan.</p>";
    }

    hitungRataRating(ulasanList);
  };

  const hitungRataRating = (list) => {
    const angkaEl = document.getElementById("ratingAngka");
    if (!list.length) { if (angkaEl) angkaEl.textContent = "0.0"; return; }

    const total = list.reduce((sum, u) => sum + u.rating, 0);
    const rata = (total / list.length).toFixed(1);
    if (angkaEl) angkaEl.textContent = rata;

    const ratingBars = document.getElementById("ratingBars");
    if (ratingBars) {
      ratingBars.innerHTML = "";
      for (let i = 5; i >= 1; i--) {
        const jumlah = list.filter((u) => u.rating === i).length;
        const persen = (jumlah / list.length) * 100;
        ratingBars.innerHTML += `
          <div class="bar-item">
            <span>${i}⭐</span>
            <div class="bar"><div class="bar-fill" style="width:${persen}%;"></div></div>
            <span>${jumlah}</span>
          </div>`;
      }
    }
  };

  const form = document.getElementById("formUlasan");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const rating = Number(document.getElementById("ratingInput").value);
      const teks = (document.getElementById("teksUlasan").value || "").trim();
      const nama = "Pengguna Anonim";

      if (!teks) { alert("Tulis ulasan terlebih dahulu!"); return; }

      const ulasanBaru = { nama, rating, teks };
      const data = ambilUlasan();
      data.push(ulasanBaru);
      simpanUlasan(data);
      document.getElementById("teksUlasan").value = "";
      renderUlasan();
    });
  }

  renderUlasan();
});
