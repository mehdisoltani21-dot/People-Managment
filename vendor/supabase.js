/* APW: load Supabase from first available mirror */
(function (w) {
  if (w.supabase && w.supabase.createClient) return;
  var mirrors = [
    "./supabase.umd.js",
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js",
    "https://unpkg.com/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js",
    "https://fastly.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js"
  ];
  var i = 0;
  function next() {
    if (i >= mirrors.length) {
      console.error("Supabase library failed to load from all mirrors");
      return;
    }
    var s = document.createElement("script");
    s.src = mirrors[i++];
    s.async = false;
    s.onload = function () {
      if (!(w.supabase && w.supabase.createClient)) next();
    };
    s.onerror = next;
    document.head.appendChild(s);
  }
  next();
})(window);
