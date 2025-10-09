// Render Kategori Terpilih (section terpisah) + Produk Terbaru + global detail
document.addEventListener("DOMContentLoaded", () => {
  // ====== Ambil/siapkan kontainer Kategori Terpilih ======
  const kategoriSection = document.querySelector(".produk-kategori, #produk-kategori");
  const kategoriListEl =
    (kategoriSection && kategoriSection.querySelector(".produk-list")) || null;
  const judulKategoriEl = document.getElementById("judulKategori");
  const resetKategoriBtn = document.getElementById("resetKategoriBtn");

  // ====== Ambil/siapkan kontainer Produk Terbaru (robust selector) ======
  let terbaruSection =
    document.querySelector(".produk-terbaru, #produk") || null;

  if (!terbaruSection) {
    console.warn("[produk.js] Section Produk Terbaru tidak ditemukan. Pastikan ada .produk-terbaru atau #produk.");
  }

  // cari elemen list di dalam section
  let terbaruContainer =
    (terbaruSection && terbaruSection.querySelector(".produk-list")) ||
    (terbaruSection && terbaruSection.querySelector(".grid")) ||
    null;

  // kalau belum ada, bikin .produk-list baru agar tetap bisa render
  if (terbaruSection && !terbaruContainer) {
    terbaruContainer = document.createElement("div");
    terbaruContainer.className = "produk-list";
    terbaruSection.appendChild(terbaruContainer);
  }

  const isHome = !!terbaruContainer;

  // Ambil semua produk
  const ambilProduk = () => {
    const data = localStorage.getItem("produkList");
    try { return data ? JSON.parse(data) : []; } catch { return []; }
  };
  const allProducts = ambilProduk();

  if (!Array.isArray(allProducts)) {
    console.error("[produk.js] produkList bukan array / rusak:", allProducts);
  }

  // Global: buka detail produk
  window.lihatDetailById = (id) => {
    const p = (allProducts || []).find(x => String(x.id) === String(id));
    if (!p) { alert("Produk tidak ditemukan."); return; }
    localStorage.setItem("produkTerpilih", JSON.stringify(p));
    window.location.href = "produk.html";
  };

  // ===== Helper render kartu =====
  const renderGrid = (container, list) => {
    container.innerHTML = "";
    if (!list.length) {
      container.innerHTML = `<p style="text-align:center;color:#777;">Produk tidak ditemukan.</p>`;
      return;
    }
    list.forEach(p => {
      const div = document.createElement("div");
      div.className = "produk-item";
      div.innerHTML = `
        <img src="${p.gambar}" alt="${p.nama}">
        <h3>${p.nama}</h3>
        <p class="harga">Rp ${Number(p.harga).toLocaleString("id-ID")}</p>
        <button class="beli-btn" data-id="${p.id}">Lihat Detail</button>
      `;
      container.appendChild(div);
    });
    container.querySelectorAll(".beli-btn").forEach(btn => {
      btn.addEventListener("click", () => window.lihatDetailById(btn.dataset.id));
    });
  };

  // Urut berdasarkan tanggal/createdAt (desc) → id numerik (desc)
  const urutTerbaru = (arr) => {
    const out = [...arr];
    const adaTanggal = out.some(p => p && (p.tanggal || p.createdAt));
    if (adaTanggal) {
      out.sort((a, b) => new Date(b?.tanggal || b?.createdAt) - new Date(a?.tanggal || a?.createdAt));
    } else if (out.every(p => p && !isNaN(Number(p.id)))) {
      out.sort((a, b) => Number(b.id) - Number(a.id));
    }
    return out;
  };

  const byIdOrder = (ids, pool) => {
    const map = new Map((pool || []).map(p => [String(p.id), p]));
    return (ids || []).map(id => map.get(String(id))).filter(Boolean);
  };

  // ===== Search bar (desktop & mobile) — hanya mempengaruhi Produk Terbaru =====
  const submitSearch = (q) => {
    const query = (q || "").trim();
    localStorage.setItem("searchQuery", query);
    if (location.pathname.endsWith("index.html") || location.pathname === "/" ) {
      location.hash = "#produk";
      if (typeof window.renderProdukTerbaru === "function") window.renderProdukTerbaru();
    } else {
      window.location.href = "index.html#produk";
    }
  };
  document.querySelectorAll(".search-bar").forEach(bar => {
    const input = bar.querySelector('input[type="search"]');
    const btn = bar.querySelector('button');
    if (!input || !btn) return;
    btn.addEventListener("click", () => submitSearch(input.value));
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitSearch(input.value); });
  });

  if (!isHome) return;

  // ===== Section: Kategori Terpilih (TERPISAH dari Produk Terbaru) =====
  window.renderKategoriTerpilih = () => {
    const selectedCategory = localStorage.getItem("selectedCategory") || "";
    if (!kategoriSection) return;

    if (!selectedCategory) {
      kategoriSection.style.display = "none";
      return;
    }

    const list = (allProducts || []).filter(
      p => (p?.kategori || "").toLowerCase() === selectedCategory.toLowerCase()
    );

    if (judulKategoriEl) judulKategoriEl.textContent = selectedCategory;
    kategoriSection.style.display = "block";
    if (kategoriListEl) renderGrid(kategoriListEl, list);
  };

  if (resetKategoriBtn) {
    resetKategoriBtn.addEventListener("click", () => {
      // bersihkan kategori + pencarian supaya tidak kosong
      localStorage.removeItem("selectedCategory");
      localStorage.removeItem("searchQuery");

      // kosongkan field input search di UI
      document.querySelectorAll(".search-bar input[type='search']").forEach(inp => inp.value = "");

      // Produk Terbaru = urutan “Produk Terlaris” (jika snapshot tersedia)
      const snap = localStorage.getItem("terlarisSnapshot");
      if (snap) localStorage.setItem("forceListIds", snap);
      else localStorage.removeItem("forceListIds");

      // Sembunyikan section kategori terpilih & scroll ke produk terbaru
      window.renderKategoriTerpilih();
      if (location.hash !== "#produk") location.hash = "#produk";
      if (typeof window.renderProdukTerbaru === "function") window.renderProdukTerbaru();
      const target = document.getElementById("produk") || terbaruSection;
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ===== Section: Produk Terbaru (mandiri, tidak ikut kategori) =====
  window.renderProdukTerbaru = () => {
    // safety: jika kontainer tidak ketemu, jangan error
    if (!terbaruContainer) {
      console.warn("[produk.js] Kontainer Produk Terbaru belum ada, skip render.");
      return;
    }

    const searchQuery = (localStorage.getItem("searchQuery") || "").toLowerCase();

    // Jika reset kategori meng-set urutan (snapshot terlaris), hormati sekali pakai
    const forceIdsRaw = localStorage.getItem("forceListIds");
    let forceIds = [];
    try { forceIds = forceIdsRaw ? JSON.parse(forceIdsRaw) : []; } catch {}

    let list;
    if (Array.isArray(forceIds) && forceIds.length) {
      const forced = byIdOrder(forceIds, allProducts);
      list = (forced.length ? forced : urutTerbaru(allProducts));
      // sekali pakai
      localStorage.removeItem("forceListIds");
      console.log("[produk.js] Render Produk Terbaru berdasarkan snapshot Terlaris:", forceIds);
    } else {
      list = urutTerbaru(allProducts);
      console.log("[produk.js] Render Produk Terbaru urut waktu penambahan. Total:", list.length);
    }

    // Terapkan pencarian (khusus Produk Terbaru)
    if (searchQuery) {
      const before = list.length;
      list = list.filter(p => {
        const text = [p?.nama, p?.kategori, p?.deskripsi].filter(Boolean).join(" ").toLowerCase();
        return text.includes(searchQuery);
      });
      console.log(`[produk.js] Filter search "${searchQuery}": ${before} -> ${list.length}`);
    }

    // Simpan referensi (optional) supaya Terlaris bisa menghindari duplikat
    try {
      localStorage.setItem("produkTerbaruList", JSON.stringify(list.slice(0, 8)));
    } catch (e) {}

    renderGrid(terbaruContainer, list.slice(0, 8));
  };

  // ===== Render awal dan saat hash ke #produk =====
  window.renderKategoriTerpilih();
  window.renderProdukTerbaru();

  window.addEventListener("hashchange", () => {
    if (location.hash === "#produk") {
      window.renderProdukTerbaru();
    }
  });
});
