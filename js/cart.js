document.addEventListener("DOMContentLoaded", () => {
  // Jalankan hanya di halaman keranjang
  if (!document.querySelector(".cart-page")) return;

  fetchCartItems();
});

/* =======================================================
   FETCH & RENDER CART
======================================================= */
async function fetchCartItems() {
  try {
    const response = await fetch("cart_api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_cart" }),
    });

    const result = await response.json();

    if (result.success) {
      renderCart(result.cart_items);
    } else {
      alert("Gagal memuat keranjang: " + result.message);
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
  }
}

/* =======================================================
   RENDER CART
======================================================= */
function renderCart(items = []) {
  const cartContainer = document.querySelector(".cart-items");
  if (!cartContainer) return;

  cartContainer.innerHTML = "";
  let subTotal = 0;

  items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subTotal += itemTotal;

    const itemHtml = `
      <div class="product-item" data-id="${item.id}">
        <div class="product-info">
          <div class="product-name">${item.name}</div>
          <div class="product-details">
            Warna: ${item.color} | Ukuran: ${item.size} | 
            Jumlah: <input 
              type="number" 
              value="${item.quantity}" 
              min="1" 
              onchange="updateQuantity(${item.id}, this.value)"
            > | 
            Harga: ${formatCurrency(item.price)}
          </div>
        </div>
        <button onclick="removeItem(${item.id})">Hapus</button>
      </div>
    `;
    cartContainer.insertAdjacentHTML("beforeend", itemHtml);
  });

  calculateCartTotal(subTotal);
}

/* =======================================================
   HITUNG TOTAL CART
======================================================= */
function calculateCartTotal(subTotal) {
  const shippingCost = 20000; // contoh biaya kirim
  const finalTotal = subTotal + shippingCost;

  const subTotalEl = document.getElementById("subTotal");
  const shippingEl = document.getElementById("shippingCost");
  const finalTotalEl = document.getElementById("finalTotal");

  if (subTotalEl) subTotalEl.textContent = formatCurrency(subTotal);
  if (shippingEl) shippingEl.textContent = formatCurrency(shippingCost);
  if (finalTotalEl) finalTotalEl.textContent = formatCurrency(finalTotal);
}

/* =======================================================
   HELPER
======================================================= */
function formatCurrency(amount) {
  return "Rp " + Number(amount).toLocaleString("id-ID");
}

/* =======================================================
   UPDATE / REMOVE ITEM
======================================================= */
window.updateQuantity = async (itemId, newQty) => {
  console.log(`Update item ${itemId} ke jumlah ${newQty}`);
  // TODO: panggil API update_quantity ke PHP
  // await fetch("cart_api.php", {...});
  fetchCartItems(); // refresh data
};

window.removeItem = async (itemId) => {
  if (confirm("Yakin ingin menghapus item ini?")) {
    console.log(`Hapus item ${itemId}`);
    // TODO: panggil API remove_item ke PHP
    // await fetch("cart_api.php", {...});
    fetchCartItems();
  }
};
