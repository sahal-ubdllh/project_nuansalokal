document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3001";

    // --- DEKLARASI ELEMEN ---
    const form = document.getElementById("produkForm");
    const previewImage = document.getElementById("previewImage");
    const gambarUpload = document.getElementById("gambarUpload");
    const produkListContainer = document.getElementById("adminProdukList");
    const filterSelect = document.getElementById("filterKategori");
    const kategoriDataList = document.getElementById("kategoriList");
    const submitButton = form.querySelector('button[type="submit"]');

    let editId = null; // State untuk menandai mode edit

    // --- FUNGSI-FUNGSI UNTUK BERINTERAKSI DENGAN API ---

    // Fungsi untuk mengambil daftar kategori dari API
    async function fetchCategories() {
        try {
            const response = await fetch(`${API_URL}/api/categories`);
            if (!response.ok) throw new Error('Gagal mengambil data kategori.');
            
            const kategoriList = await response.json();

            // Isi dropdown filter
            filterSelect.innerHTML = `<option value="Semua">Semua</option>`;
            kategoriList.forEach(k => {
                filterSelect.innerHTML += `<option value="${k}">${k}</option>`;
            });

            // Isi datalist untuk input form
            kategoriDataList.innerHTML = '';
            kategoriList.forEach(k => {
                kategoriDataList.innerHTML += `<option value="${k}"></option>`;
            });

        } catch (error) {
            console.error("❌ Gagal mengambil kategori:", error);
            alert("Tidak bisa memuat daftar kategori dari server.");
        }
    }

    // Fungsi untuk merender daftar produk dari API
    async function renderProduk() {
        try {
            const selectedKategori = filterSelect.value;
            let fetchUrl = `${API_URL}/api/products`;

            // Jika ada filter kategori yang dipilih, tambahkan sebagai query parameter
            if (selectedKategori !== 'Semua') {
                fetchUrl += `?kategori=${encodeURIComponent(selectedKategori)}`;
            }

            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error('Gagal mengambil data produk.');
            
            const dataTampil = await response.json();
            
            produkListContainer.innerHTML = ""; // Kosongkan kontainer

            if (dataTampil.length === 0) {
                produkListContainer.innerHTML = `<p style="text-align:center;color:#777;">Belum ada produk untuk kategori ini.</p>`;
                return;
            }

            // Tampilkan setiap produk sebagai card
            dataTampil.forEach((p) => {
                const card = document.createElement("div");
                // Perbaiki class agar sesuai dengan style.css
                card.className = "produk-item-admin"; 
                card.innerHTML = `
                    <img src="${API_URL}/${p.gambar}" alt="${p.nama}">
                    <div class="info">
                        <h3>${p.nama}</h3>
                        <p><strong>Kategori:</strong> ${p.kategori}</p>
                        <p><strong>Harga:</strong> Rp ${p.harga.toLocaleString("id-ID")}</p>
                    </div>
                    <div class="actions">
                        <button class="edit-btn" data-id="${p.id}"><i class="fas fa-edit"></i>Edit</button>
                        <button class="hapus-btn" data-id="${p.id}"><i class="fas fa-trash"></i>Hapus</button>
                    </div>
                `;
                produkListContainer.appendChild(card);
            });
        } catch (error) {
            console.error("❌ Gagal mengambil produk:", error);
            produkListContainer.innerHTML = `<p style="text-align:center;color:red;">Gagal memuat produk dari server.</p>`;
        }
    }

    // --- EVENT HANDLERS ---

    // Handler untuk tombol edit
    async function handleEditClick(id) {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil data produk untuk diedit.');
            
            const product = await response.json();
            
            editId = id; // Masuk ke mode edit
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
    
    // Handler untuk tombol hapus
    async function hapusProduk(id) {
        if (confirm("Yakin ingin menghapus produk ini?")) {
            try {
                const response = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
                if (!response.ok) throw new Error('Gagal menghapus produk di server.');
                
                // Muat ulang daftar produk dan kategori setelah berhasil
                await fetchCategories();
                await renderProduk();

            } catch (error) {
                alert(`⚠️ Terjadi kesalahan: ${error.message}`);
            }
        }
    }

    // Fungsi untuk mereset form
    function resetFormAndState() {
        form.reset();
        previewImage.style.display = 'none';
        previewImage.src = '';
        submitButton.textContent = 'Simpan Produk';
        editId = null; // Keluar dari mode edit
    }
    
    // Event listener untuk submit form (bisa untuk create atau update)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const isEditMode = editId !== null;
        
        const url = isEditMode ? `${API_URL}/api/products/${editId}` : `${API_URL}/api/products`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, body: formData });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Gagal ${isEditMode ? 'memperbarui' : 'menyimpan'} produk.`);
            }
            
            alert(`✅ Produk berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
            resetFormAndState();
            await fetchCategories();
            await renderProduk();

        } catch (error) {
            alert(`⚠️ Terjadi kesalahan: ${error.message}`);
        }
    });

    // Event listener untuk preview gambar
    gambarUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
          };
          reader.readAsDataURL(file);
        } else {
          previewImage.src = '';
          previewImage.style.display = 'none';
        }
    });

    // Event delegation untuk tombol edit dan hapus
    produkListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            handleEditClick(e.target.dataset.id);
        }
        if (e.target.classList.contains('hapus-btn')) {
            hapusProduk(e.target.dataset.id);
        }
    });
    
    // Event listener untuk filter
    filterSelect.addEventListener("change", renderProduk);

    // --- INISIALISASI SAAT HALAMAN DIBUKA ---
    fetchCategories();
    renderProduk();
});