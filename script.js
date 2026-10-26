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

const ERROR_TYPES = ["تأخیر","غیبت","کم‌کاری","عدم رعایت ایمنی","خرابی محصول","سایر"];

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

function fillSelects() {
  const sel = $("personSelect");
  if (sel) {
    sel.innerHTML = '<option value="">انتخاب نفر</option>';
    peopleList.forEach((p) => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.name + " (" + p.id + ")";
      sel.appendChild(o);
    });
  }
  const et = $("errorType");
  if (et && et.tagName === "SELECT") {
    et.innerHTML = '<option value="">انتخاب</option>';
    ERROR_TYPES.forEach((t) => {
      const o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      et.appendChild(o);
    });
  }
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
    alert("خطا در خواندن: " + error.message);
    return [];
  }
  return data || [];
}

function renderTable(filter) {
  const tbody = $("records-body");
  if (!tbody) return;
  const q = (filter || "").trim().toLowerCase();
  let rows = allRows;
  if (q) {
    rows = rows.filter((r) =>
      [r.person_name, r.error_type, r.warning_type, r.description, r.created_by_name, r.workstation]
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
    tr.innerHTML = `<td>${i + 1}</td><td>${r.person_id || ""}</td><td>${r.person_name || ""}</td><td>${r.workstation || ""}</td><td>${r.warning_type || ""}</td><td>${r.error_type || ""}</td><td>${r.report_date || ""}</td><td>${r.occurrence_date || ""}</td><td>${r.description || ""}</td><td>${r.created_by_name || ""}</td><td>${acts}</td>`;
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
  if ($("reportDate")) $("reportDate").value = todayStr();
  if ($("form-title")) $("form-title").textContent = "ثبت رکورد جدید";
  if ($("cancel-btn")) $("cancel-btn").style.display = "none";
}

function editRecord(id) {
  const r = allRows.find((x) => x.id === id);
  if (!r) return;
  editingId = id;
  if ($("form-title")) $("form-title").textContent = "ویرایش رکورد";
  if ($("cancel-btn")) $("cancel-btn").style.display = "inline-block";
  if ($("occurrenceDate")) $("occurrenceDate").value = r.occurrence_date || "";
  if ($("reportDate")) $("reportDate").value = r.report_date || "";
  if ($("personSelect")) $("personSelect").value = r.person_id || "";
  if ($("personIdDisplay")) $("personIdDisplay").value = r.person_id || "";
  if ($("workstation")) $("workstation").value = r.workstation || "";
  if ($("errorType")) $("errorType").value = r.error_type || "";
  if ($("warningType")) $("warningType").value = r.warning_type || "";
  if ($("description")) $("description").value = r.description || "";
  // show form view if home menu exists
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
  if ($("reportDate")) $("reportDate").value = todayStr();

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
        description: $("description") ? $("description").value : "",
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
      resetForm();
      await refresh();
      // go list
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

  // session
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
