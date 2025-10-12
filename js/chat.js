document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Utama ---
    const chatListContainer = document.getElementById('chat-list');
    const chatWindow = document.getElementById('chat-window');
    const mainChatNavbar = document.getElementById('main-chat-navbar');
    const messagesContainer = document.getElementById('messages-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const sellerNameTitle = document.getElementById('seller-name-title');
    const closeChatWindowBtn = document.getElementById('close-chat-window');

    // --- Elemen Modal Delete ---
    const deleteModal = document.getElementById('delete-modal');
    const deleteForMeBtn = document.getElementById('delete-for-me-btn');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    let messageToDelete = null; // Bisa berupa elemen pesan tunggal atau elemen chat-item
    
    // --- Elemen Tombol Hapus Riwayat ---
    // Menggunakan event delegation di bagian bawah karena elemen ini sudah dimuat saat DOMContentLoaded
    const deleteHistoryBtns = document.querySelectorAll('.delete-history-btn');

    
    const chatHistory = {
        '2gb-store': [
            { id: 1, text: 'Halo! Terima Kasih atas pembelian Anda dari 2GB Store. Jika ada pertanyaan, jangan ragu hubungi kami!', sender: 'seller', time: '09:00' },
            { id: 2, text: 'Apakah Kebaya Songket Modern masih ready untuk dikirim besok?', sender: 'user', time: '09:05' },
        ],
        'bibaw-store': [
            { id: 1, text: 'Selamat datang di Bibaw Fashion. Ada yang bisa kami bantu?', sender: 'seller', time: '10:00' },
        ]
    };

    let currentSellerId = null;

    // --- FUNGSI UTAMA ---

    // 1. Memuat Pesan ke Jendela Chat
    function loadMessages(sellerId) {
        messagesContainer.innerHTML = ''; 
        const messages = chatHistory[sellerId] || [];
        
        messages.forEach(msg => {
            appendMessageToDOM(msg);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 2. Menambahkan Pesan ke DOM
    function appendMessageToDOM(msg) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.sender);
        messageDiv.dataset.messageId = msg.id;

        const time = msg.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        let deleteButtonHtml = '';
        if (msg.sender === 'user') {
            // Hanya pesan pengguna yang memiliki tombol hapus
            deleteButtonHtml = `<button class="delete-btn"><i class="fas fa-times"></i></button>`;
        }

        messageDiv.innerHTML = `
            <div class="message-bubble">${msg.text}</div>
            <span class="message-time">${time}</span>
            ${deleteButtonHtml}
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Tambahkan listener untuk tombol hapus pesan tunggal
        if (msg.sender === 'user') {
            messageDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Mencegah klik menyebar
                messageToDelete = messageDiv;
                
                // Atur teks modal untuk Hapus Pesan Tunggal
                deleteForMeBtn.textContent = "Hapus untuk Saya";
                deleteModal.querySelector('h3').textContent = "Hapus Pesan?";
                deleteModal.querySelector('p').textContent = "Pilih opsi penghapusan:";
                deleteModal.classList.remove('hidden');
            });
        }
    }
    
    // 3. Mengirim Pesan
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || !currentSellerId) return;

        const sellerName = sellerNameTitle.textContent;
        const newId = (chatHistory[currentSellerId]?.length || 0) + 1;
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const newMessage = { id: newId, text: text, sender: 'user', time: time };
        
        // Simpan & Tampilkan
        if (!chatHistory[currentSellerId]) chatHistory[currentSellerId] = [];
        chatHistory[currentSellerId].push(newMessage);
        appendMessageToDOM(newMessage);

        chatInput.value = ''; 

        // SIMULASI BALASAN OTOMATIS
        setTimeout(() => {
            const autoReplyText = `Terima kasih atas pesan Anda. Kami dari ${sellerName} sedang mengecek ketersediaan produk Anda. Mohon tunggu sebentar.`;
            const replyId = chatHistory[currentSellerId].length + 1;
            const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            const replyMessage = { id: replyId, text: autoReplyText, sender: 'seller', time: replyTime };
            chatHistory[currentSellerId].push(replyMessage);
            appendMessageToDOM(replyMessage);
        }, 1500); 
    }

    // 4. Buka Jendela Chat Spesifik
    function openChatWindow(sellerId, sellerName) {
        currentSellerId = sellerId;
        sellerNameTitle.textContent = sellerName;
        
        loadMessages(sellerId);

        mainChatNavbar.classList.add('hidden');
        chatListContainer.classList.add('hidden');
        chatWindow.classList.remove('hidden');
    }

    // 5. Tutup Jendela Chat Spesifik
    closeChatWindowBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        mainChatNavbar.classList.remove('hidden');
        chatListContainer.classList.remove('hidden');
        currentSellerId = null;
    });

    // 6. FUNGSI UTAMA HAPUS (untuk pesan tunggal atau riwayat)
    deleteForMeBtn.addEventListener('click', () => {
        // Cek apakah yang dihapus adalah pesan tunggal
        if (messageToDelete && messageToDelete.classList.contains('message')) {
            const messageId = parseInt(messageToDelete.dataset.messageId);
            const sellerId = currentSellerId;
            
            if (sellerId) {
                // Hapus dari riwayat
                chatHistory[sellerId] = chatHistory[sellerId].filter(msg => msg.id !== messageId);
            }
            // Hapus dari DOM
            messageToDelete.remove();
            
        // Cek apakah yang dihapus adalah item riwayat chat
        } else if (messageToDelete && messageToDelete.classList.contains('chat-item')) {
            const sellerId = messageToDelete.dataset.sellerId;
            delete chatHistory[sellerId]; // Hapus seluruh riwayat
            messageToDelete.remove(); // Hapus item dari daftar chat
        }
        
        messageToDelete = null; 
        deleteModal.classList.add('hidden');
    });

    // 7. Batal Hapus
    deleteCancelBtn.addEventListener('click', () => {
        messageToDelete = null;
        deleteModal.classList.add('hidden');
    });
    
    // 8. Fungsionalitas Hapus Riwayat Chat dari Daftar Chat (Ikon Sampah)
    deleteHistoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            e.preventDefault();
            
            const chatItem = btn.closest('.chat-item');
            const sellerName = chatItem.dataset.sellerName;
            
            messageToDelete = chatItem; // Tandai item riwayat chat yang akan dihapus
            
            // Atur teks modal untuk Hapus Riwayat Chat
            deleteForMeBtn.textContent = `Hapus Riwayat`;
            deleteModal.querySelector('h3').textContent = `Hapus Chat dengan ${sellerName}?`;
            deleteModal.querySelector('p').textContent = "Semua pesan di chat ini akan dihapus dari perangkat Anda.";
            deleteModal.classList.remove('hidden');
        });
    });

    // --- EVENT LISTENERS LAINNYA ---

    // Klik Item Daftar Chat
    document.querySelectorAll('.chat-item').forEach(item => {
        // Hanya tambahkan listener jika tidak ada tombol hapus yang diklik
        item.addEventListener('click', (e) => {
            // Cek jika yang diklik bukan tombol hapus
            if (!e.target.closest('.delete-history-btn')) {
                const sellerId = item.dataset.sellerId;
                const sellerName = item.dataset.sellerName;
                openChatWindow(sellerId, sellerName);
            }
        });
    });

    // Tombol Kirim
    sendBtn.addEventListener('click', sendMessage);
    
    // Kirim dengan Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- INIT: Menerima Parameter dari orders.html ---
    const urlParams = new URLSearchParams(window.location.search);
    const targetSellerId = urlParams.get('seller_id');
    const targetSellerName = urlParams.get('seller_name');

    if (targetSellerId && targetSellerName) {
        openChatWindow(targetSellerId, targetSellerName);
    }
});