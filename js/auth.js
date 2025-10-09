document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

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
        const response = await fetch("auth.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            email,
            password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("Login berhasil! Selamat datang, " + data.user);
          window.location.href = "index.html";
        } else {
          alert("Login gagal: " + data.message);
        }
      } catch (error) {
        console.error("Error login:", error);
        alert("Terjadi kesalahan koneksi ke server.");
      }
    });
  }

  /* =======================================================
     REGISTER FORM
  ======================================================= */
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nama = registerForm.querySelector('input[name="nama"]').value.trim();
      const email = registerForm.querySelector('input[type="email"]').value.trim();
      const password = registerForm.querySelector('input[type="password"]').value.trim();
      const confirm = registerForm.querySelector('input[name="konfirmasi"]').value.trim();

      if (!nama || !email || !password || !confirm) {
        alert("Harap isi semua kolom pendaftaran!");
        return;
      }

      if (password !== confirm) {
        alert("Password dan konfirmasi tidak cocok!");
        return;
      }

      try {
        const response = await fetch("auth.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            nama,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("Pendaftaran berhasil! Silakan login.");
          window.location.href = "login.html";
        } else {
          alert("Pendaftaran gagal: " + data.message);
        }
      } catch (error) {
        console.error("Error register:", error);
        alert("Terjadi kesalahan koneksi ke server.");
      }
    });
  }
});
