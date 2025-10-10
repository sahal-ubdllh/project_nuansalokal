document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEKSI SEMUA ELEMEN YANG DIBUTUHKAN ---
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const shippingCostDisplay = document.getElementById('shipping-cost-display'); 
    const finalTotalDisplay = document.getElementById('final-total-display');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Checkbox Utama
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    // const itemCheckboxes = document.querySelectorAll('.item-checkbox'); // Akan diseleksi dinamis

    // Elemen Alamat
    const editAddressBtn = document.getElementById('edit-address-btn');
    const currentAddressDiv = document.getElementById('current-address');
    const editAddressForm = document.getElementById('edit-address-form');
    const addressInput = document.getElementById('address-input');
    
    // Elemen Promo
    const promoLink = document.getElementById('promo-link');
    const promoForm = document.getElementById('promo-form');
    const promoCodeInput = document.getElementById('promo-code-input');
    
    // Elemen Notifikasi Kustom
    const customAlertModal = document.getElementById('custom-alert-modal');
    const alertMessage = document.getElementById('alert-message');
    const closeAlertBtn = document.getElementById('close-alert-btn');

    // Elemen Modal Pembayaran
    const paymentModal = document.getElementById('payment-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTotalDisplay = document.getElementById('modal-total-display');
    const mainPaymentOptions = document.getElementById('main-payment-options');
    const detailPaymentOptions = document.getElementById('detail-payment-options');
    const detailOptionTitle = document.getElementById('detail-option-title');
    const backToMainBtn = detailPaymentOptions.querySelector('#back-to-main-options'); // Selektor disesuaikan
    const finalPaymentInfo = document.getElementById('final-payment-info');
    const finalPaymentMethod = document.getElementById('final-payment-method');
    const finalAmountDisplay = finalPaymentInfo.querySelector('.final-amount');
    const paymentCodeDisplay = document.getElementById('payment-code');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const backToDetailBtn = finalPaymentInfo.querySelector('#back-to-detail-options'); // Selektor disesuaikan

    // Variabel state global
    let currentShippingCost = 0;
    
    // Data Opsi Pembayaran Detail (TIDAK BERUBAH)
    const paymentOptionsData = {
        bank: [
            { name: "Bank BRI", code: "1029384756", logo: "BRI" },
            { name: "Bank BCA", code: "9876543210", logo: "BCA" },
            { name: "Bank Mandiri", code: "1234567890", logo: "MANDIRI" }
        ],
        ewallet: [
            { name: "Dana", code: "0812-3456-7890 (Dana)", logo: "DANA" },
            { name: "Gopay", code: "0857-6789-0123 (Gopay)", logo: "GOPAY" }
        ],
        minimarket: [
             { name: "Alfamart", code: "ALFA12345678 (Tunjukkan kode ini ke kasir)", logo: "ALFA" },
             { name: "Indomaret", code: "INDO98765432 (Tunjukkan kode ini ke kasir)", logo: "INDO" }
        ]
    };
    
    // --- FUNGSI NOTIFIKASI KUSTOM DI TENGAH LAYAR ---
    const showCustomAlert = (message) => {
        alertMessage.textContent = message;
        customAlertModal.classList.remove('hidden');
    };

    closeAlertBtn.addEventListener('click', () => {
        customAlertModal.classList.add('hidden');
    });

    // --- 2. FUNGSI UTAMA PERHITUNGAN TOTAL KERANJANG ---
    const updateCartTotal = () => {
        let totalSubtotal = 0;
        const productItems = document.querySelectorAll('.product-item');
        let checkedItemCount = 0;

        productItems.forEach(item => {
            const isChecked = item.querySelector('.item-checkbox').checked;
            const itemPriceElement = item.querySelector('.price-value'); // Selektor disesuaikan

            if (!isChecked) {
                itemPriceElement.textContent = '0,0rb'; // Tampilkan 0,0rb jika tidak dicentang
                return;
            }
            
            checkedItemCount++;
            const pricePerUnit = parseInt(item.dataset.price);
            const quantity = parseInt(item.querySelector('.product-qty').value);

            const itemSubtotal = pricePerUnit * quantity;
            totalSubtotal += itemSubtotal;

            const formattedItemPrice = (itemSubtotal / 1000).toLocaleString('id-ID', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }) + 'rb';
            itemPriceElement.textContent = formattedItemPrice;
        });

        // Update teks "Pilih Semua Item (X)"
        const totalItemsInCart = productItems.length;
        document.querySelector('.select-all-container label').textContent = `Pilih Semua Item (${checkedItemCount})`;

        // Set status Pilih Semua
        selectAllCheckbox.checked = totalItemsInCart > 0 && checkedItemCount === totalItemsInCart;

        const finalTotal = totalSubtotal + currentShippingCost;
        
        // Nonaktifkan checkout jika tidak ada item yang dipilih
        checkoutBtn.disabled = checkedItemCount === 0;
        checkoutBtn.textContent = checkedItemCount === 0 ? 'Pilih Item Dulu' : 'Checkout';

        const formattedTotal = finalTotal.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).replace('IDR', 'Rp');

        subtotalDisplay.textContent = formattedTotal;
        finalTotalDisplay.textContent = formattedTotal;
        modalTotalDisplay.textContent = formattedTotal;
        finalAmountDisplay.textContent = formattedTotal;
        
        shippingCostDisplay.textContent = currentShippingCost === 0 ? 'Gratis' : finalTotal.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).replace('IDR', 'Rp');
    };
    
    // --- 3. EVENT LISTENERS UTAMA ---
    
    // Aksi: Checkbox Pilih Semua
    selectAllCheckbox.addEventListener('change', () => {
        document.querySelectorAll('.item-checkbox').forEach(cb => {
            cb.checked = selectAllCheckbox.checked;
        });
        updateCartTotal();
    });

    // Aksi: Perubahan pada Item (Qty, Size, Checkbox)
    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('product-size') || 
            e.target.classList.contains('product-qty') ||
            e.target.classList.contains('item-checkbox')) 
        {
            updateCartTotal();
        }
    });

    // Aksi: Klik Tombol Hapus, Plus, Minus
    cartItemsContainer.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.product-item');
        if (!itemElement) return;

        const qtyInput = itemElement.querySelector('.product-qty');
        let currentQty = parseInt(qtyInput.value);

        // Kontrol Tombol Plus dan Minus
        if (e.target.classList.contains('qty-plus')) {
            qtyInput.value = currentQty + 1;
            updateCartTotal();
        } else if (e.target.classList.contains('qty-minus') && currentQty > 1) {
            qtyInput.value = currentQty - 1;
            updateCartTotal();
        }

        // Hapus Item
        if (e.target.classList.contains('hapus-item')) {
            if (confirm("Yakin ingin menghapus item ini dari keranjang?")) {
                itemElement.remove();
                updateCartTotal();
            }
        }
    });

    // --- 4. LOGIKA ALAMAT (TIDAK BERUBAH) ---
    editAddressBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isEditing = editAddressForm.classList.contains('hidden');
        
        if (isEditing) {
            const currentText = currentAddressDiv.querySelector('.address-text').textContent;
            addressInput.value = currentText; 
            
            currentAddressDiv.classList.add('hidden');
            editAddressForm.classList.remove('hidden');
            editAddressBtn.textContent = 'Batal';
        } else {
            currentAddressDiv.classList.remove('hidden');
            editAddressForm.classList.add('hidden');
            editAddressBtn.textContent = 'Edit';
        }
    });

    editAddressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAddress = addressInput.value.trim();
        
        if (newAddress === "") {
             showCustomAlert('Alamat tidak boleh kosong!');
             return;
        }

        currentAddressDiv.querySelector('.address-text').textContent = newAddress;
        currentAddressDiv.classList.remove('hidden');
        editAddressForm.classList.add('hidden');
        editAddressBtn.textContent = 'Edit';

        showCustomAlert('Alamat berhasil disimpan!');
    });
    
    // --- 5. LOGIKA KODE PROMO ---
    promoLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Toggle promo form
        promoForm.classList.toggle('hidden'); 
        if (!promoForm.classList.contains('hidden')) {
            promoCodeInput.focus();
            promoLink.textContent = 'Tutup kode promo'; // Ganti teks link saat form terbuka
        } else {
            promoLink.textContent = 'Tambahkan kode promo'; // Kembalikan teks
        }
    });

    promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const promoCode = promoCodeInput.value.toUpperCase();

        if (promoCode === '3D1CGY' || promoCode === 'GRATISONGKIR') {
            currentShippingCost = 0;
            shippingCostDisplay.style.color = 'green';
            showCustomAlert(`Kode promo "${promoCode}" berhasil diterapkan! Anda mendapatkan GRATIS ONGKIR.`);
        } else {
            currentShippingCost = 15000; // Kembalikan biaya kirim default
            shippingCostDisplay.style.color = '#555555'; // Warna teks normal
            showCustomAlert(`Kode promo "${promoCode}" tidak valid. Biaya kirim kembali 15.000.`);
        }
        
        promoCodeInput.value = '';
        promoForm.classList.add('hidden'); // Sembunyikan form setelah apply
        promoLink.textContent = 'Tambahkan kode promo'; // Kembalikan teks link
        updateCartTotal();
    });

    // --- 6. LOGIKA CHECKOUT DAN PEMBAYARAN BERLAPIS ---
    
    // Tampilkan Modal Checkout
    checkoutBtn.addEventListener('click', () => {
        if (document.querySelectorAll('.product-item .item-checkbox:checked').length === 0) {
            showCustomAlert('Silakan centang minimal satu produk untuk melanjutkan Checkout.');
            return;
        }
        // Reset tampilan modal ke level 1
        mainPaymentOptions.classList.remove('hidden');
        detailPaymentOptions.classList.add('hidden');
        finalPaymentInfo.classList.add('hidden');
        
        // Kosongkan dan reset detailPaymentOptions (penting agar tidak menumpuk)
        detailPaymentOptions.innerHTML = `<p class="back-nav-link action-link" id="back-to-main-options">&lt; Kembali</p><h4 class="detail-option-title" id="detail-option-title">Pilih Bank</h4>`; 
        
        paymentModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
    });
    
    // Aksi Klik Opsi Pembayaran Utama (Level 1)
    mainPaymentOptions.addEventListener('click', (e) => {
        const button = e.target.closest('.payment-option-btn'); // Selektor disesuaikan
        if (!button) return;
        
        const method = button.dataset.method;
        
        if (method === 'cod') {
            // Langsung ke konfirmasi final COD
            goToFinalPayment(`Cash On Delivery (COD)`, `Bayar Tunai saat barang diterima. Total harus dibayar: ${finalTotalDisplay.textContent}`, 'KONFIRMASI PEMBAYARAN COD');
        } else {
            // Tampilkan opsi detail (Level 2)
            mainPaymentOptions.classList.add('hidden');
            detailPaymentOptions.classList.remove('hidden');
            
            const title = method === 'bank' ? 'Pilih Bank Tujuan' : (method === 'ewallet' ? 'Pilih E-Wallet' : 'Pilih Minimarket');
            detailOptionTitle.textContent = title;
            
            // Render opsi detail dari data
            const detailOptions = paymentOptionsData[method];
            const detailOptionsHtml = detailOptions.map(option => 
                `<button class="payment-option-btn detail-option" data-code="${option.code}" data-name="${option.name}">${option.name}</button>`
            ).join('');
            
            // Tambahkan tombol kembali jika belum ada, atau pastikan itu di paling atas
            const existingBackLink = detailPaymentOptions.querySelector('#back-to-main-options');
            if (existingBackLink) {
                existingBackLink.nextElementSibling.insertAdjacentHTML('afterend', detailOptionsHtml);
            } else {
                 detailPaymentOptions.insertAdjacentHTML('beforeend', detailOptionsHtml);
            }
        }
    });

    // Aksi Klik Opsi Pembayaran Detail (Level 2)
    detailPaymentOptions.addEventListener('click', (e) => {
        const button = e.target.closest('.detail-option'); // Selektor disesuaikan
        if (!button) return;
        
        const name = button.dataset.name;
        const code = button.dataset.code;
        
        goToFinalPayment(name, code, 'KONFIRMASI PEMBAYARAN');
    });

    // Aksi Kembali dari Detail ke Utama (Level 2 ke 1)
    detailPaymentOptions.addEventListener('click', (e) => {
         if (e.target.id === 'back-to-main-options') {
            mainPaymentOptions.classList.remove('hidden');
            detailPaymentOptions.classList.add('hidden');
            // Reset detailPaymentOptions (penting)
            detailPaymentOptions.innerHTML = `<p class="back-nav-link action-link" id="back-to-main-options">&lt; Kembali</p><h4 class="detail-option-title" id="detail-option-title">Pilih Bank</h4>`; 
        }
    });

    // Fungsi untuk menampilkan Konfirmasi Pembayaran (Level 3)
    const goToFinalPayment = (methodName, codeOrMessage, buttonText) => {
        detailPaymentOptions.classList.add('hidden');
        mainPaymentOptions.classList.add('hidden');
        finalPaymentInfo.classList.remove('hidden');
        
        finalPaymentMethod.textContent = methodName;
        paymentCodeDisplay.textContent = codeOrMessage;
        confirmPaymentBtn.textContent = buttonText;
    };
    
    // Aksi Selesai Pembayaran (Level 3)
    confirmPaymentBtn.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
        showCustomAlert(`✅ Pembayaran untuk ${finalTotalDisplay.textContent} berhasil (Simulasi)! Barang siap dikirim. Terima kasih!`);
        // Di sini Anda bisa menambahkan logika untuk mengosongkan keranjang atau mengarahkan ke halaman sukses.
    });
    
    // Aksi Kembali dari Final ke Detail (Level 3 ke 2)
    backToDetailBtn.addEventListener('click', () => {
        finalPaymentInfo.classList.add('hidden');
        // Tentukan apakah kembali ke main options atau detail options sebelumnya
        // Untuk saat ini, kembali ke main options untuk kesederhanaan
        mainPaymentOptions.classList.remove('hidden'); 
        // Anda bisa menyimpan state method sebelumnya (bank/ewallet/minimarket) 
        // untuk kembali ke detailPaymentOptions yang spesifik jika diinginkan.
    });


    // Panggil fungsi ini saat halaman pertama kali dimuat
    updateCartTotal();
});