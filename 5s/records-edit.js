/* 5S: edit + delete in مشاهده رکوردها */
(function () {
  var editId = null;
  var editReportNo = null;

  function canManage() {
    var p = window.currentProfile || (typeof currentProfile !== "undefined" ? currentProfile : null);
    if (!p) return true;
    var role = String(p.role || "").toLowerCase();
    if (role === "admin") return true;
    var name = String(p.full_name || p.username || "").toLowerCase();
    return /سلطانی|soltani|کاظمی|kazemi/.test(name);
  }

  function stop(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
  }

  async function deleteReport(id, card) {
    if (!confirm("این گزارش 5S حذف شود؟")) return;
    try {
      var res = await supabaseClient.from("five_s_audits").delete().eq("id", id);
      if (res.error) throw res.error;
      if (card && card.parentNode) card.parentNode.removeChild(card);
      if (typeof renderReports === "function") await renderReports();
      alert("حذف شد.");
    } catch (err) {
      alert("حذف ناموفق: " + (err.message || err));
    }
  }

  function selectedName(sel) {
    if (!sel || !sel.value) return "";
    var opt = sel.options[sel.selectedIndex];
    return opt ? (opt.textContent || opt.text || "").trim() : "";
  }

  function fillFormFromReport(r) {
    editId = r.id;
    editReportNo = r.reportNo;
    var dateEl = document.getElementById("audit-date");
    var ws = document.getElementById("workstation");
    var auditor = document.getElementById("auditor");
    if (dateEl) dateEl.value = r.date || "";
    if (ws) ws.value = r.workstation || "";
    if (auditor) auditor.value = r.auditor || "";

    function setSelectByText(sel, text) {
      if (!sel || !text) return;
      for (var i = 0; i < sel.options.length; i++) {
        if ((sel.options[i].textContent || "").trim() === String(text).trim() || sel.options[i].value === text) {
          sel.selectedIndex = i;
          return;
        }
      }
    }
    setSelectByText(document.getElementById("operator"), r.operator);
    var asst = r.assistants || [];
    setSelectByText(document.getElementById("assistant1"), asst[0]);
    setSelectByText(document.getElementById("assistant2"), asst[1]);
    setSelectByText(document.getElementById("assistant3"), asst[2]);

    var sections = r.sections || [];
    var blocks = (document.getElementById("sections") || document).querySelectorAll(".s-block");
    for (var si = 0; si < blocks.length; si++) {
      var secData = sections[si] || {};
      var items = secData.items || [];
      var rows = blocks[si].querySelectorAll(".item");
      for (var ii = 0; ii < rows.length; ii++) {
        var it = items[ii] || {};
        var row = rows[ii];
        var check = row.querySelector("[data-check]");
        var score = row.querySelector("[data-score]");
        var note = row.querySelector("[data-note]");
        if (check) check.checked = !!it.done;
        if (score) score.value = it.score != null ? it.score : 0;
        if (note) note.value = it.note || "";
        if (it.fileData) {
          row._attachment = {
            name: it.fileName || "file",
            type: it.fileType || "image/jpeg",
            size: 0,
            dataUrl: it.fileData
          };
        } else {
          row._attachment = null;
        }
        if (typeof renderPreview === "function") renderPreview(row);
      }
    }
    if (typeof recalc === "function") recalc();

    var saveBtn = document.getElementById("btn-save");
    if (saveBtn) saveBtn.textContent = "ذخیره تغییرات (ویرایش)";
    var msg = document.getElementById("save-msg");
    if (msg) msg.textContent = "در حال ویرایش گزارش شماره " + (editReportNo || "") + " — پس از تغییر، ذخیره کنید.";
  }

  function clearEditMode() {
    editId = null;
    editReportNo = null;
    var saveBtn = document.getElementById("btn-save");
    if (saveBtn) saveBtn.textContent = "ذخیره آنلاین";
  }

  function patchRenderReports() {
    if (typeof renderReports !== "function") {
      if ((patchRenderReports.t = (patchRenderReports.t || 0) + 1) < 80) setTimeout(patchRenderReports, 100);
      return;
    }
    var original = renderReports;
    window.renderReports = async function () {
      await original.apply(this, arguments);
      if (!canManage()) return;
      var listEl = document.getElementById("reports-list");
      if (!listEl) return;
      var cards = listEl.querySelectorAll(".report-card");
      var list = window.auditsCache || (typeof auditsCache !== "undefined" ? auditsCache : []);
      cards.forEach(function (card, idx) {
        if (card.querySelector("[data-5s-actions]")) return;
        var r = list[idx];
        if (!r || !r.id) return;
        var bar = document.createElement("div");
        bar.setAttribute("data-5s-actions", "1");
        bar.style.cssText = "display:flex;gap:8px;margin-top:10px;flex-wrap:wrap";
        bar.innerHTML =
          '<button type="button" data-edit-5s style="font-family:inherit;font-weight:700;padding:6px 12px;border-radius:10px;border:1px solid #5a4030;background:#2a2418;color:#f5c56a;cursor:pointer">ویرایش</button>' +
          '<button type="button" data-del-5s style="font-family:inherit;font-weight:700;padding:6px 12px;border-radius:10px;border:1px solid #7f1d1d;background:#3b1a1a;color:#fca5a5;cursor:pointer">حذف</button>';
        bar.querySelector("[data-edit-5s]").onclick = function (e) {
          stop(e);
          try {
            if (typeof showForm === "function") showForm();
            fillFormFromReport(r);
            window.scrollTo(0, 0);
          } catch (err) {
            alert("خطا در باز کردن ویرایش: " + (err.message || err));
          }
        };
        bar.querySelector("[data-del-5s]").onclick = function (e) {
          stop(e);
          deleteReport(r.id, card);
        };
        card.appendChild(bar);
      });
    };
  }

  function patchSave() {
    var btn = document.getElementById("btn-save");
    if (!btn) {
      if ((patchSave.t = (patchSave.t || 0) + 1) < 80) setTimeout(patchSave, 100);
      return;
    }
    var prev = btn.onclick;
    btn.onclick = async function (e) {
      if (!editId) {
        if (typeof prev === "function") return prev.call(this, e);
        return;
      }
      if (!currentUser && !window.currentUser) {
        alert("وارد شوید");
        return;
      }
      try {
        if (typeof collect !== "function") throw new Error("collect موجود نیست");
        var data = collect();
        var saveMsg = document.getElementById("save-msg");
        if (saveMsg) saveMsg.textContent = "در حال ذخیره تغییرات...";
        var asstIds = [
          (document.getElementById("assistant1") || {}).value,
          (document.getElementById("assistant2") || {}).value,
          (document.getElementById("assistant3") || {}).value
        ];
        var row = {
          audit_date: data.date || null,
          area: data.workstation || null,
          auditor: data.auditor || null,
          operator_id: data.operatorId || null,
          operator_name: data.operator || null,
          assistant1_id: asstIds[0] || null,
          assistant1_name: selectedName(document.getElementById("assistant1")) || null,
          assistant2_id: asstIds[1] || null,
          assistant2_name: selectedName(document.getElementById("assistant2")) || null,
          assistant3_id: asstIds[2] || null,
          assistant3_name: selectedName(document.getElementById("assistant3")) || null,
          total_score: data.total || 0,
          max_score: data.max || 0,
          details: { sections: data.sections }
        };
        var res = await supabaseClient.from("five_s_audits").update(row).eq("id", editId);
        if (res.error) throw res.error;
        if (saveMsg) saveMsg.textContent = "تغییرات ذخیره شد.";
        clearEditMode();
        setTimeout(function () {
          if (typeof showHome === "function") showHome();
          if (typeof renderReports === "function") renderReports();
        }, 400);
      } catch (err) {
        alert("ذخیره ویرایش ناموفق: " + (err.message || err));
      }
    };
  }

  function patchDetail() {
    if (typeof renderDetail !== "function") {
      if ((patchDetail.t = (patchDetail.t || 0) + 1) < 80) setTimeout(patchDetail, 100);
      return;
    }
    var orig = renderDetail;
    window.renderDetail = function (idx) {
      orig.apply(this, arguments);
      if (!canManage()) return;
      var box = document.getElementById("detail-content");
      if (!box || box.querySelector("[data-5s-detail-actions]")) return;
      var list = window.auditsCache || [];
      var r = list[idx];
      if (!r || !r.id) return;
      var bar = document.createElement("div");
      bar.setAttribute("data-5s-detail-actions", "1");
      bar.style.cssText = "display:flex;gap:10px;margin:16px 0;flex-wrap:wrap";
      bar.innerHTML =
        '<button type="button" id="detail-edit-btn" style="font-family:inherit;font-weight:800;padding:10px 16px;border-radius:12px;border:none;background:linear-gradient(135deg,#f5a623,#e8910f);color:#1a1208;cursor:pointer">ویرایش این گزارش</button>' +
        '<button type="button" id="detail-del-btn" style="font-family:inherit;font-weight:800;padding:10px 16px;border-radius:12px;border:1px solid #7f1d1d;background:#3b1a1a;color:#fca5a5;cursor:pointer">حذف این گزارش</button>';
      box.insertBefore(bar, box.firstChild);
      document.getElementById("detail-edit-btn").onclick = function () {
        if (typeof showForm === "function") showForm();
        fillFormFromReport(r);
        window.scrollTo(0, 0);
      };
      document.getElementById("detail-del-btn").onclick = function () {
        deleteReport(r.id);
      };
    };
  }

  patchRenderReports();
  patchSave();
  patchDetail();
})();
