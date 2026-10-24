// Loader: working core from known-good commit
(function () {
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/gh/mehdisoltani21-dot/People-Managment@8ddff45afd10a2d33bddb91ec4abfb8b431bf48b/script.js";
  s.onload = function () { console.log("APW core script loaded"); };
  s.onerror = function () { alert("بارگذاری اسکریپت اصلی ناموفق بود."); };
  document.head.appendChild(s);
})();
