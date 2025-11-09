# Proyek Lomba Website - Nuansa Lokal

Disusun oleh: Tim 2GB - Mahasiswa - Nuansa Lokal

---

## Deskripsi Proyek

Nuansa Lokal adalah sebuah platform e-commerce yang dibangun untuk mempromosikan dan menjual produk-produk lokal Indonesia. Website ini dilengkapi dengan fitur admin untuk manajemen produk, sistem rating dan ulasan, serta alur autentikasi pengguna.

---

## Teknologi yang Digunakan

* **Frontend**: HTML, CSS, JavaScript (Vanilla)
* **Backend**: Node.js, Express.js
* **Database**: Supabase (PostgreSQL)
* **Library Tambahan**: `multer` (untuk upload gambar), `bcryptjs` (untuk enkripsi password), `cors`.

---

## Panduan Instalasi & Menjalankan Proyek

Untuk menjalankan proyek ini di komputer lokal, ikuti langkah-langkah berikut:

### **Prasyarat:**
Pastikan Anda sudah menginstal **Node.js** (versi 16 atau lebih baru) di komputer Anda.

### **Langkah-langkah:**

1.  **Ekstrak File ZIP**
    Ekstrak file `2GB-Mahasiswa.zip` yang telah diunduh.

2.  **Buka Terminal**
    Buka terminal atau command prompt, lalu masuk ke dalam folder proyek yang baru saja diekstrak.
    ```bash
    cd nama-folder-proyek
    ```

3.  **Instal Dependensi**
    Jalankan perintah ini untuk menginstal semua library yang dibutuhkan oleh server.
    ```bash
    npm install
    ```

4.  **Jalankan Server Backend**
    Setelah instalasi selesai, jalankan server dengan perintah:
    ```bash
    node server.js
    ```
    Jika berhasil, Anda akan melihat pesan: `🚀 Server berjalan di http://localhost:3001 ...`
    **Biarkan terminal ini tetap berjalan.**

5.  **Buka Website di Browser**
    * Buka folder proyek di editor kode seperti Visual Studio Code.
    * Gunakan ekstensi seperti **"Live Server"** untuk membuka file `index.html`.
    * Website akan terbuka di browser, dan semua fitur akan berfungsi karena sudah terhubung ke server yang berjalan di `localhost:3001`.

Terima kasih.