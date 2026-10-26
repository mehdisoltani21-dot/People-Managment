// APW panel core — restored
const SUPABASE_URL = "https://rtefjfvkjpatzitjjvwe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RK_M3waIU7Z4jLYcs5LFqQ_7dSYHDFP";

if (!window.supabase || !window.supabase.createClient) {
  alert("کتابخانه Supabase بارگذاری نشده. اتصال اینترنت/VPN را بررسی کنید.");
  throw new Error("Supabase missing");
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.supabaseClient = supabaseClient;

const peopleList = [
  { id: "7020", name: "Arash Baba" },
  { id: "7021", name: "Daryoush Kazemkhanloo" },
  { id: "7022", name: "Mehdi Afashar Vangini" },
  { id: "7023", name: "Hossein Amandiha" },
  { id: "7065", name: "Alireza Zolghadr" },
  { id: "7071", name: "Rahim Ghalandari" },
  { id: "7083", name: "Mohammad Khalkhali" },
  { id: "7085", name: "Hossein Taghiloo" },
  { id: "7088", name: "Mohsen Mirasheh" },
  { id: "7089", name: "Mohammad Qazvini" },
  { id: "7092", name: "Saeid Rezaei" },
  { id: "7111", name: "Mohammadreza Esmaili" },
  { id: "7118", name: "Alireza Soleymani" },
  { id: "7152", name: "Amin Rastegar" },
  { id: "7154", name: "Keykhosro Gurani" },
  { id: "7196", name: "Hossein Dehghan Nejad" },
  { id: "7197", name: "Esmaeil Alian" },
  { id: "7216", name: "Farzin Shali" },
  { id: "7240", name: "Dariush Hazrati" }
];

const WORKSTATIONS = [
  "ورودی", "روکش زیرین", "سنباده پنل", "روکش فوقانی",
  "اوستا باشی پنل", "اوستاباشی پروفیل", "گزارشگیر",
  "بسته بندی پنل", "برش فویل", "روکش پروفیل",
  "سنباده پروفیل", "فرزه", "سلکو", "پالت سازی"
];
const ERROR_TYPES = [
  "عدم اجرای صحیح وظایف محوله", "غیبت و تأخیر", "وضعیت ظاهری نامناسب",
  "استفاده غیر استاندارد لوازم مصرفی", "عدم استفاده از وسایل ایمنی فردی",
  "عدم استفاده از وسایل حفاظت فردی", "ماشین آلات و تجهیزات", "مشکلات فرآیندی",
  "عدم آموزش", "شرایط محیطی", "عدم رعایت مقررات ایمنی و دستورالعمل ها",
  "ازدحام و بی نظمی"
];

let currentUser = null;
let currentProfile = null;
let editingId = null;
let allRows = [];

const $ = (id) => document.getElementById(id);

function showLogin() {
  if ($("login-page")) $("login-page").style.display = "flex";
  if ($("app-page")) $("app-page").style.display = "none";
}
function showApp() {
  if ($("login-page")) $("login-page").style.display = "none";
  if ($("app-page")) $("app-page").style.display = "block";
}

function todayStr() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function lockReportDate() {
  const rd = $("reportDate");
  if (!rd) return;
  rd.value = todayStr();
  rd.readOnly = true;
  rd.setAttribute("readonly", "readonly");
  rd.style.opacity = "0.85";
  rd.style.cursor = "not-allowed";
  rd.addEventListener("keydown", function(e){ e.preventDefault(); });
  rd.addEventListener("mousedown", function(e){ e.preventDefault(); rd.blur(); });
}

function fillSelects() {
  const sel = $("personSelect");
  if (sel) {
    sel.innerHTML = '<option value="">انتخاب نفر</option>';
    peopleList.forEach((p) => {
      const o = document.createElement("option");
      o.value = String(p.id);
      o.dataset.name = p.name;
      o.textContent = p.name + " (" + p.id + ")";
      sel.appendChild(o);
    });
  }
  const ws = $("workstation");
  if (ws && ws.tagName === "SELECT") {
    ws.innerHTML = '<option value="">انتخاب ایستگاه</option>';
    WORKSTATIONS.forEach((t) => {
      const o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      ws.appendChild(o);
    });
  }
  const et = $("errorType");
  if (et && et.tagName === "SELECT") {
    et.innerHTML = '<option value="">انتخاب نوع خطا</option>';
    ERROR_TYPES.forEach((t) => {
      const o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      et.appendChild(o);
    });
  }
}

async function loadProfile(user) {
  const { data } = await supabaseClient.from("user_profiles").select("*").eq("id", user.id).maybeSingle();
  currentProfile = data;
  const label = $("current-user-name");
  if (label) label.textContent = (data && (data.full_name || data.username)) || user.email || "کاربر";
}

async function loadRecords() {
  const { data, error } = await supabaseClient
    .from("people_error_records")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error(error);
    alert("خطا در خواندن: " + error.message);
    return [];
  }
  return data || [];
}

function displayName(r) {
  return r.full_name || r.person_name || "";
}

function renderTable(filter) {
  const tbody = $("records-body");
  if (!tbody) return;
  const q = (filter || "").trim().toLowerCase();
  let rows = allRows;
  if (q) {
    rows = rows.filter((r) =>
      [displayName(r), r.person_id, r.error_type, r.warning_type, r.description, r.created_by_name, r.workstation]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  tbody.innerHTML = "";
  const empty = $("empty-message");
  if (!rows.length) {
    if (empty) empty.style.display = "";
    return;
  }
  if (empty) empty.style.display = "none";
  const isAdmin = currentProfile && currentProfile.role === "admin";
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    const acts = isAdmin
      ? `<button type="button" class="btn-edit" data-edit="${r.id}">ویرایش</button> <button type="button" class="btn-del" data-del="${r.id}">حذف</button>`
      : "";
    tr.innerHTML = `<td>${i + 1}</td><td>${r.person_id || ""}</td><td>${displayName(r)}</td><td>${r.workstation || ""}</td><td>${r.warning_type || ""}</td><td>${r.error_type || ""}</td><td>${r.report_date || ""}</td><td>${r.occurrence_date || ""}</td><td>${r.description || ""}</td><td>${r.created_by_name || ""}</td><td>${acts}</td>`;
    tbody.appendChild(tr);
  });
}

async function refresh() {
  allRows = await loadRecords();
  renderTable($("search-input") ? $("search-input").value : "");
}

function resetForm() {
  editingId = null;
  if ($("record-form")) $("record-form").reset();
  if ($("occurrenceDate")) $("occurrenceDate").value = todayStr();
  if ($("form-title")) $("form-title").textContent = "ثبت رکورد جدید";
  if ($("cancel-btn")) $("cancel-btn").style.display = "none";
  lockReportDate();
}

function editRecord(id) {
  const r = allRows.find((x) => String(x.id) === String(id));
  if (!r) return;
  editingId = r.id;
  if ($("form-title")) $("form-title").textContent = "ویرایش رکورد";
  if ($("cancel-btn")) $("cancel-btn").style.display = "inline-block";
  if ($("occurrenceDate")) $("occurrenceDate").value = r.occurrence_date || "";
  if ($("reportDate")) { $("reportDate").value = r.report_date || todayStr(); $("reportDate").readOnly = true; }

  const pid = String(r.person_id || "");
  const pname = displayName(r);
  const sel = $("personSelect");
  if (sel) {
    let found = false;
    for (let i = 0; i < sel.options.length; i++) {
      if (String(sel.options[i].value) === pid) { found = true; break; }
    }
    if (!found && pid) {
      const o = document.createElement("option");
      o.value = pid;
      o.dataset.name = pname;
      o.textContent = (pname || pid) + " (" + pid + ")";
      sel.appendChild(o);
    }
    sel.value = pid;
  }
  if ($("personIdDisplay")) $("personIdDisplay").value = pid;

  const ws = $("workstation");
  if (ws) {
    const w = r.workstation || "";
    if (w && ws.tagName === "SELECT") {
      let ok = false;
      for (let i = 0; i < ws.options.length; i++) if (ws.options[i].value === w) ok = true;
      if (!ok) {
        const o = document.createElement("option");
        o.value = w; o.textContent = w + " (قبلی)";
        ws.appendChild(o);
      }
    }
    ws.value = w;
  }
  const et = $("errorType");
  if (et) {
    const e = r.error_type || "";
    if (e && et.tagName === "SELECT") {
      let ok = false;
      for (let i = 0; i < et.options.length; i++) if (et.options[i].value === e) ok = true;
      if (!ok) {
        const o = document.createElement("option");
        o.value = e; o.textContent = e + " (قبلی)";
        et.appendChild(o);
      }
    }
    et.value = e;
  }
  if ($("warningType")) $("warningType").value = r.warning_type || "";
  if ($("description")) $("description").value = r.description || "";

  const home = $("home-view");
  const form = $("form-view");
  const list = $("records-panel");
  if (home) home.hidden = true;
  if (form) form.hidden = false;
  if (list) list.hidden = true;
}

document.addEventListener("DOMContentLoaded", () => {
  fillSelects();
  if ($("occurrenceDate")) $("occurrenceDate").value = todayStr();
  lockReportDate();

  if ($("personSelect")) {
    $("personSelect").addEventListener("change", function () {
      if ($("personIdDisplay")) $("personIdDisplay").value = this.value || "";
    });
  }

  if ($("search-input")) {
    $("search-input").addEventListener("input", function () {
      renderTable(this.value);
    });
  }

  if ($("cancel-btn")) {
    $("cancel-btn").addEventListener("click", resetForm);
  }

  if ($("record-form")) {
    $("record-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentUser) return alert("وارد شوید");
      const selected = $("personSelect");
      const personId = selected ? String(selected.value) : "";
      const person = peopleList.find((p) => String(p.id) === personId);
      const fullName = person
        ? person.name
        : (selected && selected.selectedOptions[0] && (selected.selectedOptions[0].dataset.name || selected.selectedOptions[0].textContent)) || "";
      const row = {
        occurrence_date: $("occurrenceDate").value,
        report_date: todayStr(),
        person_id: personId,
        full_name: fullName,
        workstation: $("workstation") ? $("workstation").value : null,
        error_type: $("errorType").value,
        warning_type: $("warningType") ? $("warningType").value : null,
        description: $("description") ? $("description").value : "",
        created_by: currentUser.id,
        created_by_name: (currentProfile && (currentProfile.full_name || currentProfile.username)) || "",
      };
      if (!row.workstation) return alert("لطفاً ایستگاه کاری را انتخاب کنید.");
      if (!row.error_type) return alert("لطفاً نوع خطا را انتخاب کنید.");
      if (!row.person_id) return alert("لطفاً نفر را انتخاب کنید.");
      let error;
      if (editingId) {
        ({ error } = await supabaseClient.from("people_error_records").update(row).eq("id", editingId));
      } else {
        ({ error } = await supabaseClient.from("people_error_records").insert(row));
      }
      if (error) return alert("خطا: " + error.message);
      resetForm();
      await refresh();
      const home = $("home-view");
      const form = $("form-view");
      const list = $("records-panel");
      if (home) home.hidden = true;
      if (form) form.hidden = true;
      if (list) list.hidden = false;
    });
  }

  if ($("records-body")) {
    $("records-body").addEventListener("click", async (e) => {
      const ed = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (ed) editRecord(ed.getAttribute("data-edit"));
      if (del) {
        if (!confirm("حذف شود؟")) return;
        const { error } = await supabaseClient.from("people_error_records").delete().eq("id", del.getAttribute("data-del"));
        if (error) alert(error.message);
        else refresh();
      }
    });
  }

  if ($("logout-btn")) {
    $("logout-btn").addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      location.replace("../");
    });
  }

  supabaseClient.auth.getSession().then(async (r) => {
    const s = r.data && r.data.session;
    if (s && s.user) {
      currentUser = s.user;
      await loadProfile(currentUser);
      showApp();
      await refresh();
    } else {
      showLogin();
    }
  }).catch(() => showLogin());
});
