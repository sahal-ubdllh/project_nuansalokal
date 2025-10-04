<?php
// ... [Sertakan KODE KONEKSI PDO (seperti di auth.php)] ...
session_start();
header('Content-Type: application/json');

// Cek apakah pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Anda harus login.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

if ($action === 'add_to_cart') {
    $product_id = $data['product_id'] ?? 0;
    $quantity = $data['quantity'] ?? 1;
    $color = $data['color'] ?? NULL;
    $size = $data['size'] ?? NULL;

    // 1. Ambil/Buat Keranjang Aktif untuk user
    // (Logika ini akan mencari cart_id user, atau membuat yang baru jika belum ada)
    
    // 2. Cek harga produk saat ini dari tabel products
    $stmt_price = $pdo->prepare("SELECT price FROM products WHERE id = ?");
    $stmt_price->execute([$product_id]);
    $product_price = $stmt_price->fetchColumn();

    if (!$product_price) {
        echo json_encode(['success' => false, 'message' => 'Produk tidak ditemukan.']);
        exit;
    }

    // 3. Masukkan atau Update cart_items
    // (Untuk menyederhanakan, ini adalah contoh INSERT/UPDATE logika)
    $sql = "INSERT INTO cart_items (cart_id, product_id, quantity, color, size, price_at_addition) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)";

    // Asumsi $cart_id sudah didapatkan dari langkah 1.
    // $pdo->prepare($sql)->execute([$cart_id, $product_id, $quantity, $color, $size, $product_price]);

    echo json_encode(['success' => true, 'message' => 'Produk berhasil ditambahkan ke keranjang.']);

} elseif ($action === 'get_cart') {
    // 1. Ambil detail keranjang pengguna
    // 2. Gabungkan data dari cart_items dan products
    
    // Contoh dummy data:
    $cart_data = [
        ['name' => 'Baju kelelawar', 'price' => 35300, 'quantity' => 3, 'color' => 'Coklat Muda', 'size' => 'XL'],
        ['name' => 'Baju blonde', 'price' => 50500, 'quantity' => 1, 'color' => 'Biru tua', 'size' => 'L'],
    ];

    echo json_encode(['success' => true, 'cart_items' => $cart_data]);

} elseif ($action === 'remove_item') {
    // Logika untuk menghapus item dari tabel cart_items
    echo json_encode(['success' => true, 'message' => 'Item berhasil dihapus.']);
}
// ... Aksi lain seperti 'update_quantity', 'checkout'
?>

<?php
// File: cart_api.php (Logika Tambahan)
// ... [Koneksi PDO & session_start() & cek login] ...

function getOrCreateCartId($pdo, $user_id) {
    // Cek apakah user sudah punya keranjang aktif
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $cart_id = $stmt->fetchColumn();

    if ($cart_id) {
        return $cart_id;
    } else {
        // Jika belum ada, buat keranjang baru
        $stmt = $pdo->prepare("INSERT INTO carts (user_id) VALUES (?)");
        $stmt->execute([$user_id]);
        return $pdo->lastInsertId();
    }
}

if ($action === 'add_to_cart') {
    // ... [Ambil product_id, quantity, color, size] ...
    $cart_id = getOrCreateCartId($pdo, $user_id);
    // ... [Cek harga produk] ...
    
    // 3. Masukkan atau Update cart_items
    $sql = "INSERT INTO cart_items (cart_id, product_id, quantity, color, size, price_at_addition) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $pdo->prepare($sql)->execute([$cart_id, $product_id, $quantity, $color, $size, $product_price]);

    echo json_encode(['success' => true, 'message' => 'Produk berhasil ditambahkan.']);

} elseif ($action === 'get_cart') {
    $cart_id = getOrCreateCartId($pdo, $user_id);

    // SQL JOIN untuk mengambil detail item dan produk
    $sql = "SELECT ci.id, ci.quantity, ci.color, ci.size, p.name, p.price, p.image_url 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$cart_id]);
    $cart_items = $stmt->fetchAll();

    echo json_encode(['success' => true, 'cart_items' => $cart_items]);
}

// ... [Logika untuk 'update_quantity' dan 'remove_item' dengan menggunakan ID item] ...