document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Utama ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const orderContents = document.querySelectorAll('.order-content');
    
    // --- Elemen Modal Pembayaran ---
    const paymentModal = document.getElementById('payment-modal');
    const bayarSekarangBtn = document.getElementById('bayar-sekarang-btn');
    const paymentTypeBtns = paymentModal.querySelectorAll('.payment-type-btn');
    const paymentDetailSections = paymentModal.querySelectorAll('.payment-details');
    const confirmSection = document.getElementById('confirm-payment-section');
    const finalBayarBtn = document.getElementById('final-bayar-btn');
    const paymentMethodDisplay = document.getElementById('payment-method-display');
    const pinInput = document.getElementById('pin-input');
    const modalCloseBtns = paymentModal.querySelectorAll('.close-btn');

    // --- Elemen Modal Notifikasi Kustom ---
    const customAlertModal = document.getElementById('custom-alert-modal');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');
    const customAlertTitle = document.getElementById('custom-alert-title');

    // --- Elemen Lain ---
    const trackingModal = document.getElementById('tracking-modal');
    const lacakPesananBtn = document.getElementById('lacak-pesanan-btn');
    const riwayatPesananBtn = document.getElementById('riwayat-pesanan-btn');
    const lihatBuktiBtn = document.getElementById('lihat-bukti-btn');
    const buktiModal = document.getElementById('bukti-modal');
    const pengaturanPengirimanLink = document.getElementById('pengaturan-pengiriman-link');
    const chatBtn = document.getElementById('chat-btn');
    const closeTrackingBtn = document.querySelector('.tracking-close-btn');
    const closeBuktiBtn = document.querySelector('.bukti-close-btn');
    const hubungiPenjualBtns = document.querySelectorAll('.hubungi-penjual-btn');


    // ---------------------------------------------
    // FUNGSI PENGGANTI ALERT (UNTUK POSISI DI TENGAH)
    // ---------------------------------------------
    function showCustomAlert(message, title = 'Notifikasi') {
        customAlertTitle.textContent = title;
        customAlertMessage.innerHTML = message.replace(/\n/g, '<br>'); 
        customAlertModal.classList.remove('hidden');
    }

    customAlertOkBtn.addEventListener('click', () => {
        customAlertModal.classList.add('hidden');
    });
    
    // ---------------------------------------------
    // FUNGSI NAVIGASI TAB
    // ---------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.getAttribute('data-status');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            orderContents.forEach(content => content.classList.add('hidden'));
            document.getElementById(status).classList.remove('hidden');
        });
    });

    // ---------------------------------------------
    // FUNGSI MODAL PEMBAYARAN (BELUM BAYAR)
    // ---------------------------------------------
    bayarSekarangBtn.addEventListener('click', () => {
        paymentModal.classList.remove('hidden');
    });

    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
            paymentDetailSections.forEach(s => s.classList.add('hidden'));
            confirmSection.classList.add('hidden');
            paymentModal.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        });
    });

    paymentTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            
            paymentTypeBtns.forEach(b => b.classList.remove('selected'));
            paymentDetailSections.forEach(s => s.classList.add('hidden'));
            confirmSection.classList.add('hidden');
            
            btn.classList.add('selected');
            document.getElementById(`${type}-options`).classList.remove('hidden');
        });
    });

    paymentModal.querySelectorAll('.bank-select-btn, .ewallet-select-btn, .gerai-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.payment-details').querySelectorAll('button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            const method = btn.textContent;
            paymentMethodDisplay.textContent = `Metode: ${method}`;
            
            confirmSection.classList.remove('hidden');
            pinInput.value = ''; 
            
            if (btn.getAttribute('data-gerai')) {
                pinInput.placeholder = 'Kode Bayar / Nomor HP (misal: 1234 5678)';
            } else if (btn.getAttribute('data-bank')) {
                pinInput.placeholder = 'Nomor Rekening / Virtual Account';
            } else if (btn.getAttribute('data-ewallet')) {
                pinInput.placeholder = 'PIN / Nomor HP E-Wallet';
            }
        });
    });
    
    finalBayarBtn.addEventListener('click', () => {
        const input = pinInput.value;
        if (input.length < 4) {
            showCustomAlert("Mohon masukkan data yang valid untuk melanjutkan pembayaran.");
            return;
        }
        
        // SIMULASI BERHASIL
        showCustomAlert(`Pembayaran Rp 27.000 menggunakan ${paymentMethodDisplay.textContent.replace('Metode: ', '')} berhasil diproses. Pesanan akan segera dikemas.`, 'Pembayaran Berhasil!');
        paymentModal.classList.add('hidden');
        
        // Simulasikan pindah ke tab "Dikemas"
        document.querySelector('.tab-btn[data-status="dikemas"]').click();
    });


    // ---------------------------------------------
    // FUNGSI DIKEMAS
    // ---------------------------------------------
    pengaturanPengirimanLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCustomAlert('Rincian Waktu Pengaturan Pengiriman:\n\nPenjual telah mengatur pengiriman pada: 25 Oktober 2025, pukul 14:30 WIB.', 'Pengaturan Pengiriman');
    });


    // ---------------------------------------------
    // FUNGSI DIKIRIM (LACAK PESANAN)
    // ---------------------------------------------
    lacakPesananBtn.addEventListener('click', () => {
        trackingModal.classList.remove('hidden');
        
        const trackingData = [
            { time: "11:00, 12 Okt 2025", location: "Kab.Majalengka, Cikijing Hub.", status: "Pesanan telah disortir." },
            { time: "09:00, 12 Okt 2025", location: "Bandung, Pusat Sortir", status: "Paket tiba di Bandung." },
            { time: "14:30, 25 Okt 2025", location: "Toko Penjual (2GB Store)", status: "Pengirim telah mengatur pengiriman." },
        ];
        
        const detailsContainer = document.getElementById('tracking-details');
        detailsContainer.innerHTML = trackingData.map(event => `
            <div class="tracking-event">
                <p>${event.status} <strong>${event.location}</strong></p>
                <p class="time">${event.time}</p>
            </div>
        `).join('');
    });

    closeTrackingBtn.addEventListener('click', () => {
        trackingModal.classList.add('hidden');
    });


    // ---------------------------------------------
    // FUNGSI SELESAI
    // ---------------------------------------------
    riwayatPesananBtn.addEventListener('click', () => {
        const riwayatData = [
            "12:30, 13 Okt 2025: Pesanan Selesai. Diterima oleh Yang bersangkutan.",
            "11:00, 12 Okt 2025: Pesanan Dikirim. Disortir di Kab.Majalengka, Cikijing Hub.",
            "14:30, 25 Okt 2025: Pesanan Dikemas. Pengirim telah mengatur pengiriman."
        ];
        showCustomAlert(riwayatData.join('\n\n'), 'Riwayat Pengiriman Lengkap');
    });

    lihatBuktiBtn.addEventListener('click', () => {
        buktiModal.classList.remove('hidden');
    });

    closeBuktiBtn.addEventListener('click', () => {
        buktiModal.classList.add('hidden');
    });

    // ---------------------------------------------
    // FUNGSI NAVIGASI CHAT (PENTING!)
    // ---------------------------------------------
    
    // Fungsionalitas Hubungi Penjual (Navigasi ke chat spesifik)
    hubungiPenjualBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // ID toko disimulasikan sebagai '2gb-store'
            const sellerId = '2gb-store'; 
            const sellerName = '2GB Store'; // NAMA TOKO SUDAH BENAR
            
            // Arahkan ke chat.html dengan parameter ID toko
            window.location.href = `chat.html?seller_id=${sellerId}&seller_name=${sellerName}`;
        });
    });
    
    // Fungsionalitas Ikon Chat Navbar (Navigasi ke daftar chat menyeluruh)
    chatBtn.addEventListener('click', () => {
        // Mengarah ke halaman utama chat list (tanpa parameter)
        window.location.href = 'chat.html';
    });
});