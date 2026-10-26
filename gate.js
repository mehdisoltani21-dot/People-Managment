// APW — ورود یکپارچه + مسیر ریشه صحیح (Cloudflare و GitHub Pages)
(function () {
  var SUPABASE_REF = "rtefjfvkjpatzitjjvwe";
  var STORAGE_KEY = "sb-" + SUPABASE_REF + "-auth-token";

  // ریشه سایت: روی GitHub Pages زیر People-Managment است، روی Cloudflare ریشه دامنه
  function siteBase() {
    var p = location.pathname || "/";
    if (p.indexOf("/People-Managment") === 0) {
      return location.origin + "/People-Managment/";
    }
    return location.origin + "/";
  }
  var HOME = siteBase();
  window.APW_BASE = HOME;

  // اگر مسیر اشتباه تو در تو شد (مثل /5s/5s/) اصلاح کن
  var path = location.pathname || "";
  if (/\/5s\/5s/.test(path) || /\/panel\/panel/.test(path) || /\/process\/process/.test(path)) {
    var fixed = HOME;
    if (path.indexOf("/5s") >= 0) fixed = HOME + "5s/";
    else if (path.indexOf("/panel") >= 0) fixed = HOME + "panel/";
    else if (path.indexOf("/process") >= 0) fixed = HOME + "process/";
    location.replace(fixed + location.search + location.hash);
    return;
  }

  // فرم ورود صفحات داخلی پنهان
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
