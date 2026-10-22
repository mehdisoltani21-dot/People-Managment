// Direct access tokens - password in Supabase must equal token
window.APW_ACCESS_LINKS = {
  "apw-ms-k8v2n4": { username: "mahdi-soltani", label: "مهدی سلطانی" },
  "apw-mk-p3w9x1": { username: "masoud-kazemi", label: "مسعود کاظمی" },
  "apw-ma-h5t7q2": { username: "mahdi-afshar", label: "مهدی افشار" },
  "apw-ab-r6y4m8": { username: "arash-baba", label: "آرش بابا" }
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
    const username = normalizeUsername(entry.username);
    const email = username + "@people-manager.invalid";
    const password = token;
    const loginError = document.getElementById("login-error");
    if (loginError) loginError.textContent = "ورود مستقیم...";

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error || !data || !data.user) {
        if (loginError) {
          loginError.textContent = "لینک مستقیم فعال نیست. در Supabase رمز این کاربر را برابر توکن بگذارید.";
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
    } else if (tries > 50) {
      clearInterval(timer);
    }
  }, 100);
})();
