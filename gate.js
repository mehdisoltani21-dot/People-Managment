// APW — ورود یکپارچه
// این فایل در صفحات داخلی (پنل، 5S، گزارش تحلیلی) بارگذاری می‌شود.
// اگر کاربر در صفحه اصلی وارد نشده باشد، به صفحه اصلی برگردانده می‌شود.
// فرم ورود صفحات داخلی پنهان است و خروج از هر صفحه، کاربر را به صفحه اصلی می‌برد.
(function () {
  var SUPABASE_REF = "rtefjfvkjpatzitjjvwe";
  var STORAGE_KEY = "sb-" + SUPABASE_REF + "-auth-token";

  // مسیر صفحه اصلی نسبت به این فایل
  var script = document.currentScript;
  var HOME = script ? new URL("./", script.src).href : "/People-Managment/";

  // فرم‌های ورود صفحات داخلی هرگز نمایش داده نشوند
  var st = document.createElement("style");
  st.textContent = "#login-page{display:none!important}";
  (document.head || document.documentElement).appendChild(st);

  function goHome() {
    var next = location.pathname + location.search + location.hash;
    location.replace(HOME + "?next=" + encodeURIComponent(next));
  }

  // بررسی سریع نشست ذخیره‌شده (بدون انتظار برای بارگذاری کتابخانه)
  var raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  // لینک‌های ورود مستقیم (?t=...) خودشان وارد می‌کنند
  var q = new URLSearchParams(location.search);
  var hasToken = !!(q.get("t") || q.get("token"));
  if (!raw && !hasToken) { goHome(); return; }

  // اگر نشست منقضی/باطل شد یا کاربر خارج شد → صفحه اصلی
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

  // پشتیبان: اگر localStorage پاک شد (مثلاً خروج در تب دیگر)
  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY && !e.newValue) location.replace(HOME);
  });
})();
