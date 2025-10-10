document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("produkForm");
    const previewImage = document.getElementById("previewImage");
    const gambarUpload = document.getElementById("gambarUpload");
    const produkListContainer = document.getElementById("adminProdukList");
    const filterSelect = document.getElementById("filterKategori");
    const kategoriDataList = document.getElementById("kategoriList");
    const submitButton = form.querySelector('button[type="submit"]');
    const API_URL = "";

    let editId = null;

    gambarUpload.addEventListener("change", (e) => {
        const file = e.target.files[0]; // Ambil file yang dipilih

        if (file) {
          // Jika ada file yang dipilih
          const reader = new FileReader(); // Buat objek FileReader

          // Tentukan apa yang harus dilakukan setelah file selesai dibaca
          reader.onload = (event) => {
            previewImage.src = event.target.result; // Set sumber gambar ke hasil bacaan
            previewImage.style.display = 'block';    // Tampilkan elemen gambar
          };

          // Baca file sebagai Data URL (format base64)
          reader.readAsDataURL(file);
        } else {
          // Jika tidak ada file yang dipilih (misalnya, user klik cancel)
          previewImage.src = '';
          previewImage.style.display = 'none';
        }
      });

    async function fetchCategories() {
        try {
            const response = await fetch(`${API_URL}/api/categories`);
            if (!response.ok) throw new Error('Gagal mengambil data kategori.');
            const kategoriList = await response.json();
            filterSelect.innerHTML = `<option value="Semua">Semua</option>`;
            kategoriList.forEach(k => { filterSelect.innerHTML += `<option value="${k}">${k}</option>`; });
            kategoriDataList.innerHTML = '';
            kategoriList.forEach(k => { kategoriDataList.innerHTML += `<option value="${k}"></option>`; });
        } catch (error) {
            console.error("❌ Gagal mengambil kategori:", error);
        }
    }

    async function renderProduk() {
        try {
            const selectedKategori = filterSelect.value;
            const url = selectedKategori === 'Semua' ? `${API_URL}/api/products` : `${API_URL}/api/products?category=${selectedKategori}`;
            const response = await fetch(url);
            const dataTampil = await response.json();
            produkListContainer.innerHTML = "";

            if (dataTampil.length === 0) {
                produkListContainer.innerHTML = `<p style="text-align:center;color:#777;">Belum ada produk.</p>`;
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
                    <div class="actions" style="display:flex; gap:10px; margin-top:10px;">
                        <button class="edit-btn" data-id="${p.id}" style="padding:5px 10px; cursor:pointer;">✏️ Edit</button>
                        <button class="hapus-btn" data-id="${p.id}" style="padding:5px 10px; cursor:pointer;">🗑️ Hapus</button>
                    </div>
                `;
                produkListContainer.appendChild(card);
            });

            document.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", () => handleEditClick(btn.dataset.id)));
            document.querySelectorAll(".hapus-btn").forEach(btn => btn.addEventListener("click", () => hapusProduk(btn.dataset.id)));
        } catch (error) {
            console.error("❌ Gagal mengambil produk:", error);
        }
    }

    async function handleEditClick(id) {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil data produk.');
            const product = await response.json();
            
            editId = id;
            form.nama.value = product.nama;
            form.harga.value = product.harga;
            form.kategori.value = product.kategori;
            form.deskripsi.value = product.deskripsi || '';
            previewImage.src = `${API_URL}/${product.gambar}`;
            previewImage.style.display = 'block';
            submitButton.textContent = 'Update Produk';
            form.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            alert(`⚠️ Terjadi kesalahan: ${error.message}`);
        }
    }
    
    function resetFormAndState() {
        form.reset();
        previewImage.style.display = 'none';
        submitButton.textContent = 'Simpan Produk';
        editId = null;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const isEditMode = editId !== null;
        const url = isEditMode ? `${API_URL}/api/products/${editId}` : `${API_URL}/api/products`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, body: formData });
            if (!response.ok) throw new Error(`Gagal ${isEditMode ? 'memperbarui' : 'menyimpan'} produk.`);
            alert(`✅ Produk berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
            resetFormAndState();
            await fetchCategories();
            await renderProduk();
        } catch (error) {
            alert(`⚠️ Terjadi kesalahan: ${error.message}`);
        }
    });

    async function hapusProduk(id) {
        if (confirm("Yakin ingin menghapus produk ini?")) {
            try {
                await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
                await fetchCategories();
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