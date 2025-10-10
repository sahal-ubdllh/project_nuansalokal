document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("produkForm");
  const previewImage = document.getElementById("previewImage");
  const gambarUpload = document.getElementById("gambarUpload");
  const produkListContainer = document.getElementById("adminProdukList");
  const filterSelect = document.getElementById("filterKategori");
  const kategoriDataList = document.getElementById("kategoriList"); // Disesuaikan untuk datalist
  const API_URL = "http://localhost:3000";

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) throw new Error('Gagal mengambil data kategori.');
      const kategoriList = await response.json();

      filterSelect.innerHTML = `<option value="Semua">Semua</option>`;
      kategoriList.forEach((kategori) => {
        filterSelect.innerHTML += `<option value="${kategori}">${kategori}</option>`;
      });

      kategoriDataList.innerHTML = '';
      kategoriList.forEach((kategori) => {
        kategoriDataList.innerHTML += `<option value="${kategori}"></option>`;
      });

    } catch (error) {
      console.error("❌ Gagal mengambil kategori:", error);
    }
  }

  gambarUpload.addEventListener("change", () => {
    const file = gambarUpload.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  async function renderProduk() {
    try {
      const selectedKategori = filterSelect.value;
      const url = selectedKategori === 'Semua' 
        ? `${API_URL}/api/products`
        : `${API_URL}/api/products?category=${selectedKategori}`;
        
      const response = await fetch(url);
      const dataTampil = await response.json();
      
      produkListContainer.innerHTML = "";

      if (dataTampil.length === 0) {
        produkListContainer.innerHTML = `<p style="text-align:center;color:#777;">Belum ada produk di kategori ini.</p>`;
        return;
      }

      dataTampil.forEach((p) => {
        const card = document.createElement("div");
        card.classList.add("produk-item");
        card.innerHTML = `
          <img src="${API_URL}/${p.gambar}" alt="${p.nama}" style="width:150px;height:150px;object-fit:cover;border-radius:8px;">
          <h3>${p.nama}</h3>
          <p><strong>Kategori:</strong> ${p.kategori}</p>
          <p><strong>Harga:</strong> Rp ${p.harga.toLocaleString("id-ID")}</p>
          <button class="hapus-btn" data-id="${p.id}">🗑️ Hapus</button>
        `;
        produkListContainer.appendChild(card);
      });

      document.querySelectorAll(".hapus-btn").forEach((btn) => {
        btn.addEventListener("click", () => hapusProduk(btn.dataset.id));
      });
    } catch (error) {
      console.error("❌ Gagal mengambil produk:", error);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal menyimpan produk.");

      alert("✅ Produk berhasil ditambahkan!");
      form.reset();
      previewImage.style.display = "none";
      
      // 🔄 SINKRONISASI DATA SETELAH MENAMBAH PRODUK
      await fetchCategories(); // 1. Ambil ulang daftar kategori terbaru
      await renderProduk();    // 2. Tampilkan ulang daftar produk terbaru
      
    } catch (error) {
      alert(`⚠️ Terjadi kesalahan: ${error.message}`);
    }
  });

  async function hapusProduk(id) {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      try {
        const response = await fetch(`${API_URL}/api/products/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Gagal menghapus produk.");
        
        // 🔄 SINKRONISASI DATA SETELAH MENGHAPUS PRODUK
        await fetchCategories(); // Update kategori (jika produk terakhir dari kategori itu dihapus)
        await renderProduk();
      } catch (error) {
        alert(`⚠️ Terjadi kesalahan: ${error.message}`);
      }
    }
  }

  filterSelect.addEventListener("change", renderProduk);

  fetchCategories();
  renderProduk();
});