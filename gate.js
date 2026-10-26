// APW — ورود یکپارچه
// این فایل در صفحات داخلی (پنل، 5S، گزارش تحلیلی) بارگذاری می‌شود.
// اگر کاربر در صفحه اصلی وارد نشده باشد، به صفحه اصلی برگردانده می‌شود.
// فرم ورود صفحات داخلی پنهان است و خروج از هر صفحه، کاربر را به صفحه اصلی می‌برد.
(function () {
  var SUPABASE_REF = "rtefjfvkjpatzitjjvwe";
  var STORAGE_KEY = "sb-" + SUPABASE_REF + "-auth-token";

  // مسیر صفحه اصلی نسبت به این فایل (ریشه سایت روی Cloudflare یا GitHub Pages)
  var script = document.currentScript;
  var HOME = script ? new URL("./", script.src).href : "/";

  // فرم‌های ورود صفحات داخلی هرگز نمایش داده نشوند (ورود فقط از صفحه اصلی)
  // اما اگر session باشد، اپ نشان داده می‌شود
  var st = document.createElement("style");
  st.textContent = "#login-page{display:none!important}";
  (document.head || document.documentElement).appendChild(st);

  function goHome() {
    var next = location.pathname + location.search + location.hash;
    var join = HOME.indexOf("?") >= 0 ? "&" : "?";
    location.replace(HOME + join + "next=" + encodeURIComponent(next));
  }

  var raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var q = new URLSearchParams(location.search);
  var hasToken = !!(q.get("t") || q.get("token"));
  if (!raw && !hasToken) { goHome(); return; }

  var hooked = false;
  function hook() {
    if (hooked) return;
    var client = window.supabaseClient;
    if (!client || !client.auth) return;
    hooked = true;
    client.auth.onAuthStateChange(function (event, session) {
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session && !hasToken)) {
        location.replace(HOME);
      }
    });
  }
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    try { if (typeof supabaseClient !== "undefined") window.supabaseClient = supabaseClient; } catch (e) {}
    hook();
    if (hooked || tries > 150) clearInterval(timer);
  }, 100);

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY && !e.newValue) location.replace(HOME);
  });
})();
