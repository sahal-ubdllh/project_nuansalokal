document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEKSI ELEMEN ---
    const profileView = document.getElementById('profile-view');
    const authView = document.getElementById('auth-view');
    const logoutBtn = document.getElementById('logout-btn');
    const mainActionBtn = document.getElementById('main-action-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const photoUpload = document.getElementById('photo-upload');
    const profileImg = document.getElementById('profile-img');
    const editPhotoIcon = document.getElementById('edit-photo-icon');
    
    let isEditing = false;
    let loggedInUser = null;

    // --- 2. LOGIKA UTAMA: PERIKSA STATUS LOGIN ---
    function checkLoginStatus() {
        const userDataString = localStorage.getItem('loggedInUser');
        if (userDataString) {
            loggedInUser = JSON.parse(userDataString);
            profileView.classList.remove('hidden');
            authView.classList.add('hidden');
            populateProfileData(); // Panggil fungsi untuk mengisi data
        } else {
            profileView.classList.add('hidden');
            authView.classList.remove('hidden');
        }
    }

    // --- 3. FUNGSI-FUNGSI PEMBANTU ---

    // Mengisi data tampilan dan form dari data yang tersimpan
    function populateProfileData() {
        if (!loggedInUser) return;
        
        // Mengisi Tampilan Display (yang terlihat saat tidak edit)
        document.getElementById('display-info-pribadi').textContent = loggedInUser.username || 'Nama Pengguna';
        document.getElementById('display-email').textContent = loggedInUser.email || 'user@example.com';
        document.getElementById('display-info-bank').textContent = loggedInUser.bank || 'Pilih Bank...';
        const alamat = loggedInUser.alamat || 'Alamat belum diatur';
        document.getElementById('display-info-alamat').textContent = alamat.substring(0, 20) + (alamat.length > 20 ? '...' : '');

        // Mengisi Form Edit (yang tersembunyi)
        document.getElementById('edit-nama').value = loggedInUser.username || '';
        document.getElementById('edit-email').value = loggedInUser.email || '';
        document.getElementById('edit-telp').value = loggedInUser.telp || '';
        document.getElementById('edit-bank-select').value = loggedInUser.bank || '';
        document.getElementById('edit-norek').value = loggedInUser.norek || '';
        document.getElementById('edit-alamat').value = loggedInUser.alamat || '';
        
        // Memuat foto profil jika ada
        if(loggedInUser.profilePicture) {
            profileImg.src = loggedInUser.profilePicture;
        }
    }

    // Mengaktifkan atau menonaktifkan mode edit
    function setEditMode(editing) {
        isEditing = editing;
        document.body.classList.toggle('edit-mode', editing);

        if (editing) {
            mainActionBtn.textContent = 'Simpan';
            mainActionBtn.classList.replace('blue-btn', 'green-btn');
            alert('Mode edit aktif. Klik setiap baris untuk mengubah data.');
        } else {
            saveData(); // Simpan data saat keluar dari mode edit
            mainActionBtn.textContent = 'Edit';
            mainActionBtn.classList.replace('green-btn', 'blue-btn');
            // Tutup semua form yang mungkin terbuka
            menuItems.forEach(item => {
                item.classList.remove('expanded');
                item.querySelector('.edit-mode-form')?.classList.add('hidden');
            });
        }
    }

    // Menyimpan data dari form ke localStorage
    function saveData() {
        if (!loggedInUser) return;
        
        // Ambil semua data dari form input
        loggedInUser.username = document.getElementById('edit-nama').value;
        loggedInUser.email = document.getElementById('edit-email').value;
        loggedInUser.telp = document.getElementById('edit-telp').value;
        loggedInUser.bank = document.getElementById('edit-bank-select').value;
        loggedInUser.norek = document.getElementById('edit-norek').value;
        loggedInUser.alamat = document.getElementById('edit-alamat').value;
        // Foto profil sudah disimpan secara terpisah saat di-upload

        // Simpan objek user yang sudah diperbarui ke localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        
        // Perbarui tampilan display setelah menyimpan
        populateProfileData(); 
        alert("Profil berhasil disimpan!");
    }

    // --- 4. EVENT LISTENERS ---

    // Tombol Aksi Utama (Edit/Simpan)
    mainActionBtn.addEventListener('click', () => setEditMode(!isEditing));

    // Tombol Keluar
    logoutBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        }
    });

    // Tombol Pesanan Saya
    document.getElementById('pesanan-btn').addEventListener('click', () => {
        window.location.href = 'orders.html';
    });

    // Klik header item untuk membuka form HANYA saat mode edit
    menuItems.forEach(item => {
        item.querySelector('.item-header').addEventListener('click', () => {
            if (isEditing) {
                const form = item.querySelector('.edit-mode-form');
                if (form) {
                    document.querySelectorAll('.edit-mode-form').forEach(f => {
                        if (f !== form) {
                            f.classList.add('hidden');
                            f.closest('.menu-item').classList.remove('expanded');
                        }
                    });
                    form.classList.toggle('hidden');
                    item.classList.toggle('expanded');
                }
            }
        });
    });

    // Klik ikon kamera untuk upload foto HANYA saat mode edit
    editPhotoIcon.addEventListener('click', () => {
        if(isEditing) {
            photoUpload.click();
        } else {
            alert('Klik tombol "Edit" terlebih dahulu untuk mengubah foto profil.');
        }
    });

    // Preview dan simpan foto profil ke localStorage
    photoUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file && loggedInUser) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newProfilePic = e.target.result;
                profileImg.src = newProfilePic;
                loggedInUser.profilePicture = newProfilePic;
                localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            }
            reader.readAsDataURL(file);
        }
    });

    // --- 5. INISIALISASI ---
    checkLoginStatus();
});