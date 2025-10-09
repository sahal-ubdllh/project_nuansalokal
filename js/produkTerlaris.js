document.addEventListener("DOMContentLoaded", () => {
  const terlarisContainer = document.querySelector(".produk-terlaris .produk-list");
  if (!terlarisContainer) return;

  // Ambil semua produk & referensi produk terbaru (kalau ada)
  const produkData = JSON.parse(localStorage.getItem("produkList")) || [];
  const produkTerbaruRef = JSON.parse(localStorage.getItem("produkTerbaruList")) || [];

  if (!produkData.length) {
    terlarisContainer.innerHTML = `<p style="text-align:center;color:#777;">Belum ada produk terlaris.</p>`;
    return;
  }

  // Fisher–Yates shuffle
  function acakProduk(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Hindari duplikat dengan Produk Terbaru (pakai id)
  const idsTerbaru = produkTerbaruRef.map(p => String(p.id));
  let kandidat = produkData.filter(p => !idsTerbaru.includes(String(p.id)));

  // Kalau kandidat kurang dari 8, fallback ke semua produk
  if (kandidat.length < 8) kandidat = produkData.slice();

  // Ambil 8 produk terlaris (acak)
  const produkTerlaris = acakProduk(kandidat).slice(0, 8);

  // ⬇️ SIMPAN URUTAN TERLARIS YANG TAMPIL (UNTUK DIPAKAI RESET KATEGORI)
  try {
    const ids = produkTerlaris.map(p => String(p.id));
    localStorage.setItem("terlarisSnapshot", JSON.stringify(ids));
  } catch (e) {
    // no-op
  }

  // Render kartu
  terlarisContainer.innerHTML = "";
  produkTerlaris.forEach((p) => {
    const item = document.createElement("div");
    item.classList.add("produk-item");
    item.innerHTML = `
      <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
      <h3>${p.nama}</h3>
      <p class="harga">Rp ${Number(p.harga).toLocaleString("id-ID")}</p>
      <p class="kategori">${p.kategori || ""}</p>
      <button class="beli-btn" data-id="${p.id}">Lihat Detail</button>
    `;
    terlarisContainer.appendChild(item);
  });

  // Listener "Lihat Detail" (pakai fungsi global dari produk.js)
  terlarisContainer.querySelectorAll(".beli-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (typeof window.lihatDetailById === "function") {
        window.lihatDetailById(id);
      } else {
        // fallback: simpan produk lalu pindah
        const prod = produkTerlaris.find(x => String(x.id) === String(id));
        if (prod) {
          localStorage.setItem("produkTerpilih", JSON.stringify(prod));
          window.location.href = "produk.html";
        }
      }
    });
  });
});
