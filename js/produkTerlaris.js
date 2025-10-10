document.addEventListener("DOMContentLoaded", async () => {
  const terlarisContainer = document.querySelector(".produk-terlaris .produk-list");
  if (!terlarisContainer) return;
  const API_URL = "http://localhost:3000";

  try {
    // Minta server untuk mengacak dan membatasi produk
    const response = await fetch(`${API_URL}/api/products?sortBy=terlaris&limit=8`);
    const produkTerlaris = await response.json();

    if (!produkTerlaris.length) {
      terlarisContainer.innerHTML = `<p style="text-align:center;color:#777;">Belum ada produk.</p>`;
      return;
    }

    terlarisContainer.innerHTML = "";
    produkTerlaris.forEach((p) => {
      const item = document.createElement("div");
      item.classList.add("produk-item");
      item.innerHTML = `
        <img src="${API_URL}/${p.gambar}" alt="${p.nama}" loading="lazy">
        <h3>${p.nama}</h3>
        <p class="harga">Rp ${p.harga.toLocaleString("id-ID")}</p>
        <button class="beli-btn" data-id="${p.id}">Lihat Detail</button>
      `;
      item.addEventListener('click', () => {
        window.location.href = `produk.html?id=${p.id}`;
      });
      terlarisContainer.appendChild(item);
    });
  } catch (error) {
    console.error("Gagal memuat produk terlaris:", error);
    terlarisContainer.innerHTML = `<p style="text-align:center;color:red;">Gagal memuat produk.</p>`;
  }
});