/* APW: compress attached images to ~200KB */
(function(){
  var TARGET = 200 * 1024;
  var MAX_OTHER = 1.5 * 1024 * 1024;
  function dataUrlBytes(dataUrl){
    var i = dataUrl.indexOf(",");
    if (i < 0) return dataUrl.length;
    return Math.floor(dataUrl.slice(i + 1).length * 0.75);
  }
  function compressImageFile(file){
    return new Promise(function(resolve, reject){
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function(){
        URL.revokeObjectURL(url);
        var maxDim = 1600, w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          var s = maxDim / Math.max(w, h);
          w = Math.round(w * s); h = Math.round(h * s);
        }
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var quality = 0.82;
        function draw(){
          canvas.width = w; canvas.height = h;
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          return canvas.toDataURL("image/jpeg", quality);
        }
        var dataUrl = draw(), guard = 0;
        while (dataUrlBytes(dataUrl) > TARGET && guard < 12) {
          guard++;
          if (quality > 0.45) { quality = Math.max(0.45, quality - 0.12); dataUrl = draw(); }
          else if (w > 480) { w = Math.round(w * 0.75); h = Math.round(h * 0.75); dataUrl = draw(); }
          else break;
        }
        var outName = (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg";
        resolve({ name: outName, type: "image/jpeg", size: dataUrlBytes(dataUrl), dataUrl: dataUrl });
      };
      img.onerror = function(){ URL.revokeObjectURL(url); reject(new Error("خواندن تصویر ناموفق")); };
      img.src = url;
    });
  }
  function patch(){
    if (typeof handleFile !== "function" && typeof window.handleFile !== "function") {
      if ((patch.tries = (patch.tries || 0) + 1) < 80) setTimeout(patch, 100);
      return;
    }
    window.handleFile = function(row, input){
      var file = input.files && input.files[0];
      var preview = row.querySelector("[data-preview]");
      if (!file) { row._attachment = null; if (preview) preview.innerHTML = ""; return; }
      var isImage = (file.type && file.type.indexOf("image/") === 0) || /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(file.name || "");
      if (!isImage) {
        if (file.size > MAX_OTHER) { alert("حجم فایل بیشتر از ۱٫۵ مگابایت است."); input.value = ""; return; }
        var reader = new FileReader();
        reader.onload = function(){
          row._attachment = { name: file.name, type: file.type || "application/octet-stream", size: file.size, dataUrl: reader.result };
          if (typeof renderPreview === "function") renderPreview(row);
        };
        reader.readAsDataURL(file);
        return;
      }
      if (preview) preview.innerHTML = '<span style="color:#a89a86;font-size:.8rem">در حال فشرده‌سازی تصویر تا حدود ۲۰۰ کیلوبایت...</span>';
      compressImageFile(file).then(function(att){
        row._attachment = att;
        if (typeof renderPreview === "function") renderPreview(row);
      }).catch(function(err){
        alert("فشرده‌سازی عکس ناموفق: " + (err.message || err));
        input.value = "";
        row._attachment = null;
        if (preview) preview.innerHTML = "";
      });
    };
  }
  patch();
})();
