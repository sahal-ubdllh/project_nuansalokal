document.addEventListener('DOMContentLoaded', () => {
    // Fungsi untuk menampilkan/menyembunyikan section di halaman 'Tentang'
    window.showSection = (sectionId, button) => {
        // Sembunyikan semua sections
        document.querySelectorAll('.about-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Hapus kelas 'active' dari semua tombol navigasi
        document.querySelectorAll('.nav-card').forEach(btn => {
            btn.classList.remove('active');
        });

        // Tampilkan section yang dipilih
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
        }

        // Tambahkan kelas 'active' ke tombol yang diklik
        if (button) {
            button.classList.add('active');
        }
    }

    // --- Logika Keranjang (Contoh untuk cart.html) ---

    // Fungsi untuk menghitung total belanja
    const calculateCartTotal = () => {
        const itemRows = document.querySelectorAll('.product-item');
        let subTotal = 0;

        itemRows.forEach(row => {
            // Ambil data dari row
            const priceText = row.querySelector('.product-details').textContent;
            const quantityInput = row.querySelector('input[type="number"]');

            // Asumsi format harga: "Harga: 35,3rb"
            const priceMatch = priceText.match(/Harga: ([\d,]+)rb/);
            const priceValue = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) * 1000 : 0;
            const quantity = parseInt(quantityInput.value) || 0;
            
            subTotal += priceValue * quantity;
        });

        // Terapkan biaya pengiriman dan promo di sisi klien (jika ada)
        const shippingCost = 20000; // Contoh biaya kirim
        const finalTotal = subTotal + shippingCost;

        // Update tampilan
        const subTotalElement = document.getElementById('subTotal');
        const shippingCostElement = document.getElementById('shippingCost');
        const finalTotalElement = document.getElementById('finalTotal');

        if (subTotalElement) subTotalElement.textContent = formatCurrency(subTotal);
        if (shippingCostElement) shippingCostElement.textContent = formatCurrency(shippingCost);
        if (finalTotalElement) finalTotalElement.textContent = formatCurrency(finalTotal);
    }
    
    // Fungsi pembantu format mata uang
    const formatCurrency = (amount) => {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    // Panggil perhitungan saat halaman keranjang dimuat
    if (document.querySelector('.cart-page')) {
        calculateCartTotal();
        // Tambahkan event listener untuk input jumlah
        document.querySelectorAll('.product-item input[type="number"]').forEach(input => {
            input.addEventListener('change', calculateCartTotal);
        });
    }

    // Inisialisasi: Pastikan Panduan yang aktif saat pertama kali dibuka (jika menggunakan about.html)
    const panduanBtn = document.querySelector('.about-navigation .nav-card:first-child');
    if (panduanBtn) {
        panduanBtn.click();
    }
});

// File: script.js (Tambahan untuk LoginForm)

document.addEventListener('DOMContentLoaded', () => {
    // ... [Kode showSection & calculateCartTotal yang sudah ada] ...

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;

            try {
                const response = await fetch('auth.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        action: 'login',
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Login Berhasil! Selamat datang, ' + data.user);
                    // Arahkan ke halaman beranda atau profil
                    window.location.href = 'index.html'; 
                } else {
                    alert('Login Gagal: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan koneksi.');
            }
        });
    }

    // ... [Kode untuk registerForm (form_daftar) juga perlu diubah agar menggunakan async/fetch] ...
});

// File: script.js (Memodifikasi logika keranjang)

const fetchCartItems = async () => {
    try {
        const response = await fetch('cart_api.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ action: 'get_cart' })
        });
        const result = await response.json();

        if (result.success) {
            renderCart(result.cart_items); // Fungsi baru untuk merender HTML
        } else {
            alert('Gagal memuat keranjang: ' + result.message);
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}

const renderCart = (items) => {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let subTotal = 0;

    items.forEach(item => {
        const itemPrice = item.price; 
        const itemTotal = itemPrice * item.quantity;
        subTotal += itemTotal;

        const itemHtml = `
            <div class="product-item" data-item-id="${item.id}">
                <div class="product-info">
                    <div class="product-name">${item.name}</div>
                    <div class="product-details">
                        Warna: ${item.color} | Ukuran: ${item.size} | 
                        Jumlah: <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)"> | 
                        Harga: ${formatCurrency(itemPrice)}
                    </div>
                </div>
                <button onclick="removeItem(${item.id})">Hapus</button>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHtml;
    });

    // Panggil fungsi perhitungan total setelah semua item dirender
    calculateCartTotal(subTotal); 
}

// Panggil saat halaman dimuat
if (document.querySelector('.cart-page')) {
    fetchCartItems();
}

// Fungsi dummy untuk aksi keranjang yang harus memanggil PHP
window.updateQuantity = (itemId, newQuantity) => {
    // Di sini, Anda akan memanggil cart_api.php dengan action: 'update_quantity'
    console.log(`Update item ${itemId} ke jumlah ${newQuantity}`);
    // Setelah update PHP berhasil, panggil fetchCartItems() lagi untuk refresh
}

window.removeItem = (itemId) => {
    // Di sini, Anda akan memanggil cart_api.php dengan action: 'remove_item'
    if (confirm('Yakin ingin menghapus item ini?')) {
        console.log(`Hapus item ${itemId}`);
        // Setelah delete PHP berhasil, panggil fetchCartItems() lagi untuk refresh
    }
}