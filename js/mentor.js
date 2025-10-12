const materiData = {
    // Materi untuk Sahal Ubaidillah (Mentor 1)
    'materi-1-1': { 
        title: "Pengembangan Usaha: Mendapatkan Peminat", 
        desc: "Pelajari langkah-langkah terstruktur untuk merumuskan ide bisnis yang kuat dan strategi awal untuk menarik pelanggan pertama Anda, termasuk riset pasar dan identifikasi target audiens.",
        youtube: "https://youtu.be/qbHjrQdccKY?si=KUb0QUYqWUMb8e5R" 
    },
    'materi-1-2': { 
        title: "Strategi Pemasaran Efektif", 
        desc: "Kembangkan strategi pemasaran yang teruji untuk menjangkau audiens lebih luas, membangun *brand awareness*, dan meningkatkan konversi penjualan Anda melalui berbagai saluran digital.",
        youtube: "https://www.youtube.com/watch?v=sa_pemasaran_efektif" 
    },
    'materi-1-3': { 
        title: "Optimasi Akun Bisnis Digital", 
        desc: "Cara ampuh mengembangkan akun bisnis Anda di platform media sosial dan e-commerce. Pelajari trik SEO, penggunaan hashtag, dan interaksi yang efektif dengan pengikut.",
        youtube: "https://www.youtube.com/watch?v=sa_optimasi_akun" 
    },
    'materi-1-4': { 
        title: "Membangun Personal Branding", 
        desc: "Tutorial lengkap membuat *branding* produk yang kuat dan menarik. Pelajari elemen-elemen kunci *branding*, seperti logo, *storytelling*, dan konsistensi visual di semua *touchpoint*.",
        youtube: "https://www.youtube.com/watch?v=sa_personal_branding" 
    },

    // Materi untuk Angga Prasetya (Mentor 2)
    'materi-2-1': { 
        title: "Pemasaran Digital Terkini", 
        desc: "Selami strategi terbaru dalam dunia pemasaran online, termasuk *content marketing*, *influencer marketing*, dan periklanan berbayar yang efektif untuk UMKM Anda.",
        youtube: "https://www.youtube.com/watch?v=ap_pemasaran_digital" 
    },
    'materi-2-2': { 
        title: "Mengoptimalkan SEO Produk", 
        desc: "Panduan praktis untuk meningkatkan visibilitas produk Anda di hasil pencarian Google. Pelajari riset kata kunci, optimasi on-page, dan backlink dasar.",
        youtube: "https://www.youtube.com/watch?v=ap_optimasi_seo" 
    },
    'materi-2-3': { 
        title: "Manajemen Keuangan Bisnis", 
        desc: "Tips penting mengelola keuangan bisnis agar tetap sehat dan berkelanjutan. Bahas pencatatan, budgeting, dan analisis laporan keuangan sederhana.",
        youtube: "https://www.youtube.com/watch?v=ap_manajemen_keuangan" 
    },
    'materi-2-4': { 
        title: "Inovasi Produk Berbasis Riset", 
        desc: "Pelajari bagaimana menciptakan produk yang diminati pasar dengan melakukan riset kebutuhan konsumen, analisis kompetitor, dan siklus pengembangan produk yang efisien.",
        youtube: "https://www.youtube.com/watch?v=ap_inovasi_produk" 
    }
};

// --- Logic Slider dan Filter Materi ---
let currentMentor = 1;
const totalMentors = 2; 

function updateMentorView(mentorId) {
    // 1. Update tampilan slide mentor di header
    document.querySelectorAll('.mentor-slide').forEach(slide => {
        slide.classList.remove('active');
    });
    document.querySelector(`.mentor-slide[data-id="${mentorId}"]`).classList.add('active');

    // 2. Update tampilan kolom materi di grid bawah
    document.querySelectorAll('.materi-column').forEach(column => {
        column.style.display = 'none'; // Sembunyikan semua kolom
    });

    // Tampilkan hanya kolom materi yang sesuai dengan mentorId
    // Menggunakan querySelectorAll dan forEach untuk menampilkan yang aktif
    document.querySelectorAll(`.materi-column[data-mentor-target="${mentorId}"]`).forEach(column => {
        column.style.display = 'flex'; 
    });
}

function changeMentor(direction) {
    currentMentor += direction;

    if (currentMentor > totalMentors) {
        currentMentor = 1;
    } else if (currentMentor < 1) {
        currentMentor = totalMentors;
    }

    updateMentorView(currentMentor);
}

// --- Logic Modal Materi ---
function showMateriDetail(materiId) {
    const modal = document.getElementById('materiModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    const youtubeLink = document.getElementById('youtubeLink');
    
    const data = materiData[materiId];

    if (data) {
        title.textContent = data.title;
        content.textContent = data.desc;
        youtubeLink.href = data.youtube;
    } else {
        title.textContent = "Materi Tidak Ditemukan";
        content.textContent = "Silakan pilih materi lain atau materi ini belum tersedia.";
        youtubeLink.href = "#"; // Atur link ke placeholder atau kosongkan
    }

    modal.style.display = "flex"; // Menggunakan flex untuk menengahkan modal
}

const modal = document.getElementById('materiModal');
const closeBtn = document.querySelector('.close-btn');

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

// Inisialisasi tampilan awal saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateMentorView(currentMentor);
});