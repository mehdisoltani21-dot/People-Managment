// لینک مستقیم — رمزها طبق اعلام کاربر
window.APW_ACCESS_LINKS = {
  "apw-ms-k8v2n4": {
    usernames: ["mahdi-soltani", "mehdi-soltani"],
    password: "Ms136810",
    label: "مهدی سلطانی"
  },
  "apw-mk-p3w9x1": {
    usernames: ["masoud-kazemi"],
    password: "Mk133320",
    label: "مسعود کاظمی"
  },
  "apw-ma-h5t7q2": {
    usernames: ["mahdi-afshar", "mehdi-afshar"],
    password: "Ma123456",
    label: "مهدی افشار"
  },
  "apw-ab-r6y4m8": {
    usernames: ["arash-baba"],
    password: "Ab144420",
    label: "آرش بابا"
  }
};

(function waitAndLogin() {
  function ready() {
    return typeof supabaseClient !== "undefined"
      && typeof startAppForSession === "function";
  }

  async function tryLogin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error || !data || !data.user) return null;
    return data.user;
  }

  async function run() {
    const links = window.APW_ACCESS_LINKS || {};
    const params = new URLSearchParams(window.location.search);
    const token = (params.get("t") || params.get("token") || "").trim();
    if (!token || !links[token]) return;

    const entry = links[token];
    const password = String(entry.password || "").trim();
    if (!password) return;

    const loginError = document.getElementById("login-error");
    if (loginError) loginError.textContent = "ورود مستقیم...";

    const names = entry.usernames || [entry.username];
    let user = null;
    let lastError = null;

    for (let i = 0; i < names.length; i++) {
      const email = String(names[i]).trim().toLowerCase() + "@people-manager.invalid";
      try {
        user = await tryLogin(email, password);
        if (user) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!user) {
      if (loginError) {
        loginError.textContent = "ورود مستقیم ناموفق بود. رمز یا نام کاربری را دوباره چک کنید.";
      }
      if (lastError) console.error(lastError);
      return;
    }

    try {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    } catch (e) {}

    await startAppForSession(user);
  }

  let tries = 0;
  const timer = setInterval(function () {
    tries++;
    if (ready()) {
      clearInterval(timer);
      run();
    } else if (tries > 100) {
      clearInterval(timer);
    }
  }, 100);
})();
