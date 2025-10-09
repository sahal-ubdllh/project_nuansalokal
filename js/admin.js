document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("produkForm");
  const previewImage = document.getElementById("previewImage");
  const gambarUpload = document.getElementById("gambarUpload");
  const produkListContainer = document.getElementById("adminProdukList");
  const filterSelect = document.getElementById("filterKategori");
  const kategoriSelect = document.getElementById("kategoriSelect");

  let editId = null; // untuk mendeteksi mode edit

  /* =======================================================
     1️⃣ AMBIL DAFTAR KATEGORI DARI HALAMAN UTAMA (index.html)
  ======================================================= */
  function ambilKategoriDariIndex() {
    // Coba ambil dari localStorage dulu (kalau sudah disimpan sebelumnya)
    let kategoriList = localStorage.getItem("kategoriList");
    if (kategoriList) {
      kategoriList = JSON.parse(kategoriList);
    } else {
      // fallback default
      kategoriList = [
        "Aksesoris",
        "Kerajinan",
        "Pakaian",
        "Tas",
        "Batik",
        "Hijab",
        "Kecantikan",
        "Sandal",
        "Makanan Lokal",
        "Parfum",
      ];
      localStorage.setItem("kategoriList", JSON.stringify(kategoriList));
    }

    // isi dropdown tambah & filter kategori
    kategoriSelect.innerHTML = `<option value="" disabled selected>Pilih kategori...</option>`;
    filterSelect.innerHTML = `<option value="Semua">Semua</option>`;

    kategoriList.forEach((kategori) => {
      kategoriSelect.innerHTML += `<option value="${kategori}">${kategori}</option>`;
      filterSelect.innerHTML += `<option value="${kategori}">${kategori}</option>`;
    });
  }

  /* =======================================================
     2️⃣ PREVIEW GAMBAR
  ======================================================= */
  gambarUpload.addEventListener("change", () => {
    const file = gambarUpload.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.style.display = "none";
    }
  });

  /* =======================================================
     3️⃣ AMBIL & SIMPAN PRODUK
  ======================================================= */
  function ambilProduk() {
    const data = localStorage.getItem("produkList");
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("❌ Gagal parsing produkList:", e);
      return [];
    }
  }

  function simpanProduk(list) {
    localStorage.setItem("produkList", JSON.stringify(list));
  }

  /* =======================================================
     4️⃣ RENDER PRODUK
  ======================================================= */
  function renderProduk() {
    const semuaProduk = ambilProduk();
    const selectedKategori = filterSelect.value;
    produkListContainer.innerHTML = "";

    const dataTampil =
      selectedKategori === "Semua"
        ? semuaProduk
        : semuaProduk.filter((p) => p.kategori === selectedKategori);

    if (dataTampil.length === 0) {
      produkListContainer.innerHTML = `<p style="text-align:center;color:#777;">Belum ada produk di kategori ini.</p>`;
      return;
    }

    dataTampil.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("produk-item");
      card.innerHTML = `
        <img src="${p.gambar}" alt="${p.nama}" style="width:150px;height:150px;object-fit:cover;border-radius:10px;">
        <h3>${p.nama}</h3>
        <p><strong>Kategori:</strong> ${p.kategori}</p>
        <p><strong>Harga:</strong> Rp ${Number(p.harga).toLocaleString("id-ID")}</p>
        <p>${p.deskripsi || "-"}</p>
        <button class="edit-btn" data-id="${p.id}">✏️ Edit</button>
        <button class="hapus-btn" data-id="${p.id}">🗑️ Hapus</button>
      `;
      produkListContainer.appendChild(card);
    });

    // Tombol Edit
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        editProduk(id);
      });
    });

    // Tombol Hapus
    document.querySelectorAll(".hapus-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        hapusProduk(id);
      });
    });
  }

  /* =======================================================
     5️⃣ TAMBAH / EDIT PRODUK
  ======================================================= */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = form.nama.value.trim();
    const harga = form.harga.value.trim();
    const kategori = form.kategori.value;
    const deskripsi = form.deskripsi.value.trim();
    const gambarFile = form.gambar.files[0];

    if (!nama || !harga || !kategori) {
      alert("⚠️ Lengkapi semua data produk!");
      return;
    }

    const produkList = ambilProduk();

    if (editId) {
      // ✏️ UPDATE PRODUK
      const index = produkList.findIndex((p) => p.id === editId);
      if (index !== -1) {
        if (gambarFile) {
          const reader = new FileReader();
          reader.onload = () => {
            produkList[index] = {
              ...produkList[index],
              nama,
              harga: Number(harga),
              kategori,
              deskripsi,
              gambar: reader.result,
            };
            simpanProduk(produkList);
            selesaiEdit();
          };
          reader.readAsDataURL(gambarFile);
        } else {
          produkList[index] = {
            ...produkList[index],
            nama,
            harga: Number(harga),
            kategori,
            deskripsi,
          };
          simpanProduk(produkList);
          selesaiEdit();
        }
      }
    } else {
      // ➕ TAMBAH PRODUK BARU
      const reader = new FileReader();
      reader.onload = () => {
        const produkBaru = {
          id: Date.now().toString(),
          nama,
          harga: Number(harga),
          kategori,
          deskripsi,
          gambar: reader.result,
        };

        produkList.push(produkBaru);
        simpanProduk(produkList);
        alert("✅ Produk berhasil ditambahkan!");
        form.reset();
        previewImage.style.display = "none";
        renderProduk();
      };
      reader.readAsDataURL(gambarFile);
    }
  });

  function selesaiEdit() {
    alert("✅ Produk berhasil diperbarui!");
    form.reset();
    previewImage.style.display = "none";
    editId = null;
    form.querySelector("button[type='submit']").textContent = "Simpan Produk";
    renderProduk();
  }

  function editProduk(id) {
    const data = ambilProduk();
    const produk = data.find((p) => p.id === id);
    if (!produk) return;

    editId = id;
    form.nama.value = produk.nama;
    form.harga.value = produk.harga;
    form.kategori.value = produk.kategori;
    form.deskripsi.value = produk.deskripsi || "";
    previewImage.src = produk.gambar;
    previewImage.style.display = "block";
    form.querySelector("button[type='submit']").textContent = "Update Produk";
  }

  function hapusProduk(id) {
    const data = ambilProduk().filter((p) => p.id !== id);
    simpanProduk(data);
    renderProduk();
  }

  /* =======================================================
     6️⃣ FILTER KATEGORI
  ======================================================= */
  filterSelect.addEventListener("change", renderProduk);

  /* =======================================================
     7️⃣ INISIALISASI SAAT PERTAMA
  ======================================================= */
  ambilKategoriDariIndex();
  renderProduk();
});
