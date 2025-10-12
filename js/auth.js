document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const API_URL = "http://localhost:3001"; // Arahkan ke server Node.js Anda

  /* =======================================================
     LOGIN FORM
  ======================================================= */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm.querySelector('input[type="email"]').value.trim();
      const password = loginForm.querySelector('input[type="password"]').value.trim();

      if (!email || !password) {
        alert("Harap isi semua kolom login!");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/login`, { // Panggil endpoint login
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Login berhasil! Selamat datang, " + data.user.username);
          // Simpan info pengguna di localStorage untuk menandakan sudah login
          localStorage.setItem('loggedInUser', JSON.stringify(data.user));
          window.location.href = "../index.html"; // Arahkan ke halaman utama
        } else {
          alert("Login gagal: " + data.error);
        }
      } catch (error) {
        console.error("Error login:", error);
        alert("Tidak dapat terhubung ke server. Pastikan server sudah berjalan.");
      }
    });
  }

  /* =======================================================
     REGISTER FORM
  ======================================================= */
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = registerForm.querySelector('#username').value.trim();
      const email = registerForm.querySelector('#email').value.trim();
      const password = registerForm.querySelector('#password').value.trim();
      const confirm = registerForm.querySelector('#confirmPassword').value.trim();

      if (!username || !email || !password || !confirm) {
        alert("Harap isi semua kolom pendaftaran!");
        return;
      }

      if (password !== confirm) {
        alert("Password dan konfirmasi tidak cocok!");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/register`, { // Panggil endpoint register
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Pendaftaran berhasil! Silakan masuk dengan akun Anda.");
          window.location.href = "login.html"; // Arahkan ke halaman login
        } else {
          alert("Pendaftaran gagal: " + data.error);
        }
      } catch (error) {
        console.error("Error register:", error);
        alert("Tidak dapat terhubung ke server. Pastikan server sudah berjalan.");
      }
    });
  }
});