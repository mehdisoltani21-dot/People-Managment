 // نسخه: 2026-10-21-v6-supabase-fix
const SUPABASE_URL = "https://rtefjfvkjpatzitjjvwe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RK_M3waIU7Z4jLYcs5LFqQ_7dSYHDFP";

if (!window.supabase?.createClient) {
  alert("کتابخانه Supabase بارگذاری نشده است. ترتیب اسکریپت‌ها در index.html را بررسی کنید.");
  throw new Error("Supabase JS library is missing");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

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

let currentUser = null;
let currentProfile = null;
let editingId = null;

const $ = (id) => document.getElementById(id);

function showLogin() {
  if ($("login-page")) $("login-page").style.display = "";
  if ($("app-page")) $("app-page").style.display = "none";
}
function showApp() {
  if ($("login-page")) $("login-page").style.display = "none";
  if ($("app-page")) $("app-page").style.display = "";
  const home = $("home-view");
  const form = $("form-view");
  const list = $("records-panel") || $("list-view");
  if (home) home.style.display = "";
  if (form) form.style.display = "none";
  if (list) list.style.display = "none";
}

function fillPeople() {
  const sel = $("personSelect");
  if (!sel) return;
  sel.innerHTML = '<option value="">انتخاب نفر</option>';
  peopleList.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.name + " (" + p.id + ")";
    sel.appendChild(o);
  });
}

function todayStr() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
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
    .order("occurrence_date", { ascending: false })
    .limit(500);
  if (error) {
    console.error(error);
    alert("خطا در خواندن رکوردها: " + error.message);
    return [];
  }
  return data || [];
}

function renderRecords(rows) {
  const tbody = $("records-body");
  if (!tbody) return;
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
    tr.innerHTML =
      "<td>" +
      (i + 1) +
      "</td><td>" +
      (r.occurrence_date || "-") +
      "</td><td>" +
      (r.person_name || "-") +
      "</td><td>" +
      (r.error_type || "-") +
      "</td><td>" +
      (r.warning_type || "-") +
      "</td><td>" +
      (r.description || "-") +
      "</td><td>" +
      (r.created_by_name || "-") +
      "</td>" +
      (isAdmin
        ? '<td><button type="button" data-edit="' +
          r.id +
          '">ویرایش</button> <button type="button" data-del="' +
          r.id +
          '">حذف</button></td>'
        : "<td></td>");
    tbody.appendChild(tr);
  });
}

window.__apwRecords = [];

async function refreshList() {
  window.__apwRecords = await loadRecords();
  const q = (($("search-input") && $("search-input").value) || "").trim().toLowerCase();
  let rows = window.__apwRecords;
  if (q) {
    rows = rows.filter((r) =>
      [r.person_name, r.error_type, r.warning_type, r.description, r.created_by_name]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  renderRecords(rows);
}

function goHome() {
  const home = $("home-view");
  const form = $("form-view");
  const list = $("records-panel") || $("list-view");
  if (home) home.style.display = "";
  if (form) form.style.display = "none";
  if (list) list.style.display = "none";
}
function goForm() {
  const home = $("home-view");
  const form = $("form-view");
  const list = $("records-panel") || $("list-view");
  if (home) home.style.display = "none";
  if (form) form.style.display = "";
  if (list) list.style.display = "none";
  editingId = null;
  if ($("form-title")) $("form-title").textContent = "ثبت رکورد جدید";
  if ($("record-form")) $("record-form").reset();
  if ($("occurrenceDate")) $("occurrenceDate").value = todayStr();
  if ($("reportDate")) $("reportDate").value = todayStr();
  if ($("cancel-btn")) $("cancel-btn").style.display = "none";
}
function goList() {
  const home = $("home-view");
  const form = $("form-view");
  const list = $("records-panel") || $("list-view");
  if (home) home.style.display = "none";
  if (form) form.style.display = "none";
  if (list) list.style.display = "";
  refreshList();
}

document.addEventListener("DOMContentLoaded", function () {
  fillPeople();
  if ($("go-new-record")) $("go-new-record").onclick = goForm;
  if ($("go-view-records")) $("go-view-records").onclick = goList;
  if ($("back-from-form")) $("back-from-form").onclick = goHome;
  if ($("back-from-records")) $("back-from-records").onclick = goHome;
  if ($("search-input")) $("search-input").oninput = refreshList;

  if ($("personSelect")) {
    $("personSelect").onchange = function () {
      if ($("personIdDisplay")) $("personIdDisplay").value = this.value || "";
    };
  }

  if ($("record-form")) {
    $("record-form").onsubmit = async function (e) {
      e.preventDefault();
      if (!currentUser) return alert("وارد شوید");
      const personId = $("personSelect").value;
      const person = peopleList.find((p) => p.id === personId);
      const row = {
        occurrence_date: $("occurrenceDate").value,
        report_date: $("reportDate") ? $("reportDate").value : $("occurrenceDate").value,
        person_id: personId,
        person_name: person ? person.name : "",
        workstation: $("workstation") ? $("workstation").value : null,
        error_type: $("errorType").value,
        warning_type: $("warningType") ? $("warningType").value : null,
        description: $("description").value,
        created_by: currentUser.id,
        created_by_name: (currentProfile && (currentProfile.full_name || currentProfile.username)) || "",
      };
      let error;
      if (editingId) {
        ({ error } = await supabaseClient.from("people_error_records").update(row).eq("id", editingId));
      } else {
        ({ error } = await supabaseClient.from("people_error_records").insert(row));
      }
      if (error) return alert("خطا: " + error.message);
      goList();
    };
  }

  if ($("records-body")) {
    $("records-body").onclick = async function (e) {
      const ed = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (ed) {
        const id = ed.getAttribute("data-edit");
        const r = window.__apwRecords.find((x) => x.id === id);
        if (!r) return;
        editingId = id;
        goForm();
        if ($("form-title")) $("form-title").textContent = "ویرایش رکورد";
        if ($("cancel-btn")) $("cancel-btn").style.display = "";
        $("occurrenceDate").value = r.occurrence_date || "";
        if ($("reportDate")) $("reportDate").value = r.report_date || "";
        $("personSelect").value = r.person_id || "";
        if ($("personIdDisplay")) $("personIdDisplay").value = r.person_id || "";
        if ($("workstation")) $("workstation").value = r.workstation || "";
        $("errorType").value = r.error_type || "";
        if ($("warningType")) $("warningType").value = r.warning_type || "";
        $("description").value = r.description || "";
      }
      if (del) {
        if (!confirm("حذف شود؟")) return;
        const { error } = await supabaseClient.from("people_error_records").delete().eq("id", del.getAttribute("data-del"));
        if (error) alert(error.message);
        else refreshList();
      }
    };
  }

  if ($("cancel-btn")) $("cancel-btn").onclick = goForm;

  if ($("logout-btn")) {
    $("logout-btn").onclick = async function () {
      await supabaseClient.auth.signOut();
      location.replace("../");
    };
  }

  // session from landing SSO
  supabaseClient.auth.getSession().then(async function (r) {
    const s = r.data && r.data.session;
    if (s && s.user) {
      currentUser = s.user;
      await loadProfile(currentUser);
      showApp();
    } else {
      // gate.js should redirect; fallback login form
      showLogin();
    }
  });
});
