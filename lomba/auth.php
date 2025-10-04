<?php
// Konfigurasi Database
$host = 'localhost';
$db   = 'nuansa_lokal_db';
$user = 'root'; // Ganti dengan user database Anda
$pass = '';     // Ganti dengan password database Anda
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Aksi tidak ditentukan.']);
    exit;
}

$action = $data['action'];

if ($action === 'register') {
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Semua field harus diisi.']);
        exit;
    }

    // 1. Hash Password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 2. Insert ke Database
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    try {
        $stmt->execute([$username, $email, $password_hash]);
        echo json_encode(['success' => true, 'message' => 'Pendaftaran berhasil!']);
    } catch (\PDOException $e) {
        if ($e->getCode() == '23000') { // Error duplikat entry (email sudah ada)
            echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar.']);
        } else {
            // Error lainnya
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan database: ' . $e->getMessage()]);
        }
    }

} elseif ($action === 'login') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email dan password harus diisi.']);
        exit;
    }

    // 1. Cari Pengguna
    $stmt = $pdo->prepare("SELECT id, password_hash, username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // 2. Verifikasi Password
        if (password_verify($password, $user['password_hash'])) {
            // Berhasil login!
            // *** Di sini Anda akan memulai SESSION PHP ***
            // session_start();
            // $_SESSION['user_id'] = $user['id'];
            // $_SESSION['username'] = $user['username'];

            echo json_encode(['success' => true, 'message' => 'Login berhasil!', 'user' => $user['username']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Password salah.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Email tidak ditemukan.']);
    }
}
// ... Tambahkan aksi lain seperti 'update_profile', 'add_to_cart', dll.
?>


<?php
session_start();

// ... [Logika Register] ...

// Logika Login
} elseif ($action === 'login') {
    // ... [Ambil email dan password] ...
    
    // Cari Pengguna
    $stmt = $pdo->prepare("SELECT id, password_hash, username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // BERHASIL LOGIN: Set SESSION
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        
        echo json_encode(['success' => true, 'message' => 'Login berhasil!', 'user' => $user['username']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email atau Password salah.']);
    }
}
?>
