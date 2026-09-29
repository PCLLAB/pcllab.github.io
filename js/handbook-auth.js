(function () {
  const handbookPath = "/handbook/";
  const authKey = "pcllab_handbook_auth";

  // This gets replaced during GitHub Actions deployment.
  const passwordHash = "6976f7482d38a52d32894054b20242aeadc9d3eb1261614e7d7f68d70deee447";

  if (!window.location.pathname.startsWith(handbookPath)) {
    return;
  }


  if (sessionStorage.getItem(authKey) === passwordHash) {
    return;
  }

  const path = window.location.pathname;

  const isHandbookHome =
    path === "/handbook/" ||
    path === "/handbook/index.html";

  // If someone tries to access another handbook page directly,
  // send them to the handbook login first.
  if (!isHandbookHome) {
    const destination =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    window.location.replace(
      "/handbook/?next=" + encodeURIComponent(destination)
    );

    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    showLogin();
  });

  function showLogin() {
    document.body.classList.add("handbook-locked");

    const login = document.createElement("div");
    login.id = "handbook-login";

    login.innerHTML = `
      <div class="handbook-login-box">
        <h1>Lab Handbook</h1>

        <p>
          This handbook is intended for members of the
          Cognition and Learning Laboratory.
        </p>

        <form id="handbook-login-form">
          <input
            id="handbook-password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            required
          >

          <button type="submit">
            Continue
          </button>

          <p id="handbook-login-error"></p>
        </form>
      </div>
    `;

    document.body.appendChild(login);

    const form = document.getElementById("handbook-login-form");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const enteredPassword =
        document.getElementById("handbook-password").value;

      const enteredHash = await sha256(enteredPassword);

      if (enteredHash === passwordHash) {
        sessionStorage.setItem(authKey, passwordHash);

        const params = new URLSearchParams(window.location.search);
        const destination = params.get("next");

        if (destination) {
          window.location.replace(destination);
        } else {
          window.location.reload();
        }
      } else {
        document.getElementById("handbook-login-error").textContent =
          "Incorrect password.";

        document.getElementById("handbook-password").value = "";
        document.getElementById("handbook-password").focus();
      }
    });
  }

  async function sha256(value) {
    const data = new TextEncoder().encode(value);

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      data
    );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    return hashArray
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }
})();