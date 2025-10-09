document.addEventListener("DOMContentLoaded", () => {
  const kategoriItems = document.querySelectorAll(".kategori-item");

  kategoriItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const kategori = item.dataset.kategori;
      localStorage.setItem("selectedCategory", kategori);

      // Bila sudah di index, render tanpa reload
      if (location.pathname.endsWith("index.html") || location.pathname === "/") {
        if (typeof window.renderKategoriTerpilih === "function") window.renderKategoriTerpilih();
        const sec = document.getElementById("produk-kategori");
        if (sec) sec.scrollIntoView({ behavior: "smooth" });
      } else {
        // dari halaman lain → beranda (fokus ke section kategori)
        window.location.href = "index.html#produk-kategori";
      }
    });
  });
});
