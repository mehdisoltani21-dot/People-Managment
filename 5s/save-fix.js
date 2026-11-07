/* Fix collect() when section blocks and SECTIONS length mismatch */
(function () {
  function install() {
    if (typeof SECTIONS === "undefined" || !SECTIONS || !SECTIONS.length) {
      if ((install.t = (install.t || 0) + 1) < 100) setTimeout(install, 80);
      return;
    }
    window.collect = function collect() {
      var totalEl = document.getElementById("total-score");
      var maxEl = document.getElementById("max-score");
      function selectedName(sel) {
        if (!sel || !sel.value) return "";
        var opt = sel.options[sel.selectedIndex];
        return opt ? (opt.textContent || opt.text || "").trim() : "";
      }
      var data = {
        date: (document.getElementById("audit-date") || {}).value || "",
        workstation: (document.getElementById("workstation") || {}).value || "",
        auditor: (document.getElementById("auditor") || {}).value || "",
        operator: selectedName(document.getElementById("operator")),
        operatorId: (document.getElementById("operator") || {}).value || "",
        assistants: [
          selectedName(document.getElementById("assistant1")),
          selectedName(document.getElementById("assistant2")),
          selectedName(document.getElementById("assistant3"))
        ].filter(Boolean),
        total: Number((totalEl && totalEl.textContent) || 0),
        max: Number((maxEl && maxEl.textContent) || 0),
        sections: []
      };
      var root = document.getElementById("sections") || document;
      var blocks = root.querySelectorAll(".s-block");
      for (var si = 0; si < blocks.length; si++) {
        var sec = SECTIONS[si];
        if (!sec || !sec.items) continue;
        var block = blocks[si];
        var items = [];
        var rows = block.querySelectorAll(".item");
        for (var ii = 0; ii < rows.length; ii++) {
          var row = rows[ii];
          var att = row._attachment || null;
          var check = row.querySelector("[data-check]");
          var score = row.querySelector("[data-score]");
          var note = row.querySelector("[data-note]");
          items.push({
            question: sec.items[ii] || ("آیتم " + (ii + 1)),
            done: !!(check && check.checked),
            score: Number(score && score.value) || 0,
            note: (note && note.value) || "",
            fileName: att ? att.name : "",
            fileType: att ? att.type : "",
            fileData: att ? att.dataUrl : ""
          });
        }
        data.sections.push({ key: sec.key, title: sec.title, items: items });
      }
      return data;
    };
  }
  install();
})();
