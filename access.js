// لینک مستقیم با رمز واقعی هر کاربر
window.APW_ACCESS_LINKS = {
  "apw-ms-k8v2n4": { username: "mahdi-soltani", password: "Ms136810", label: "مهدی سلطانی" },
  "apw-mk-p3w9x1": { username: "masoud-kazemi", password: "Mk133320", label: "مسعود کاظمی" },
  "apw-ma-h5t7q2": { username: "mahdi-afshar", password: "Ma123456", label: "مهدی افشار" }
};

(function waitAndLogin() {
  function ready() {
    return typeof supabaseClient !== "undefined"
      && typeof normalizeUsername === "function"
      && typeof startAppForSession === "function";
  }

  async function run() {
    const links = window.APW_ACCESS_LINKS || {};
    const params = new URLSearchParams(window.location.search);
    const token = (params.get("t") || params.get("token") || "").trim();
    if (!token || !links[token]) return;

    const entry = links[token];
    if (!entry.password) return;

    const username = normalizeUsername(entry.username);
    const email = username + "@people-manager.invalid";
    const password = entry.password;
    const loginError = document.getElementById("login-error");
    if (loginError) loginError.textContent = "ورود مستقیم...";

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error || !data || !data.user) {
        if (loginError) {
          loginError.textContent = "ورود مستقیم ناموفق بود. نام کاربری یا رمز را بررسی کنید.";
        }
        return;
      }
      try {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      } catch (e) {}
      await startAppForSession(data.user);
    } catch (err) {
      console.error(err);
      if (loginError) loginError.textContent = err.message || "ورود مستقیم ناموفق بود.";
    }
  }

  let tries = 0;
  const timer = setInterval(function () {
    tries++;
    if (ready()) {
      clearInterval(timer);
      run();
    } else if (tries > 80) {
      clearInterval(timer);
    }
  }, 100);
})();
