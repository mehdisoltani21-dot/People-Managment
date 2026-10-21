
// نسخه: 2026-10-21-v5-supabase
// از کلید Publishable استفاده شده؛ هرگز service_role را در مرورگر قرار ندهید.
const SUPABASE_URL = "https://rtefjfvkjpatzitjjvwe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RK_M3waIU7Z4jLYcs5LFqQ_7dSYHDFP";

if (!window.supabase?.createClient) {
  alert("کتابخانه Supabase بارگذاری نشده است. ترتیب اسکریپت‌ها در index.html را بررسی کنید.");
  throw new Error("Supabase JS library is missing");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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

const workstations = [
  "ورودی", "روکش زیرین", "سنباده پنل", "روکش فوقانی",
  "اوستا باشی پنل", "اوستاباشی پروفیل", "گزارشگیر",
  "بسته بندی پنل", "برش فویل", "روکش پروفیل",
  "سنباده پروفیل", "فرزه", "سلکو", "پالت سازی"
];

const errorTypes = [
  "عدم اجرای صحیح وظایف محوله", "غیبت و تأخیر", "وضعیت ظاهری نامناسب",
  "استفاده غیر استاندارد لوازم مصرفی", "عدم استفاده از وسایل ایمنی فردی",
  "عدم استفاده از وسایل حفاظت فردی", "ماشین آلات و تجهیزات", "مشکلات فرآیندی",
  "عدم آموزش", "شرایط محیطی", "عدم رعایت مقررات ایمنی و دستورالعمل ها",
  "ازدحام و بی نظمی"
];

const loginPage = document.getElementById("login-page");
const appPage = document.getElementById("app-page");
const loginForm = document.getElementById("login-form");
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const loginError = document.getElementById("login-error");
const currentUserName = document.getElementById("current-user-name");
const logoutBtn = document.getElementById("logout-btn");

const form = document.getElementById("record-form");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const personSelect = document.getElementById("personSelect");
const personIdDisplay = document.getElementById("personIdDisplay");
const workstationSelect = document.getElementById("workstation");
const warningTypeSelect = document.getElementById("warningType");
const errorTypeSelect = document.getElementById("errorType");
const reportDateInput = document.getElementById("reportDate");
const occurrenceDateInput = document.getElementById("occurrenceDate");
const descriptionInput = document.getElementById("description");
const recordsBody = document.getElementById("records-body");
const emptyMessage = document.getElementById("empty-message");
const searchInput = document.getElementById("search-input");
const filterSummary = document.getElementById("filter-summary");

let records = [];
let editIndex = null;
let currentUser = null;
let busy = false;

function getTodayPersian() {
  return new Date().toLocaleDateString("fa-IR", {
    year: "numeric", month: "2-digit", day: "2-digit"
  });
}

function formatDisplayDate(isoDate) {
  if (!isoDate) return "-";
  try {
    return new Date(isoDate + "T00:00:00").toLocaleDateString("fa-IR", {
      year: "numeric", month: "2-digit", day: "2-digit"
    });
  } catch {
    return isoDate;
  }
}

function isAdmin() {
  return Boolean(currentUser && currentUser.role === "admin");
}

// سازگاری با نام‌های قدیمی موجود در فرم ورود
function normalizeUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  const aliases = {
    "mehdi-soltani": "mahdi-soltani",
    "mehdi-afshar": "mahdi-afshar"
  };
  return aliases[username] || username;
}

function showLogin() {
  loginPage.style.display = "flex";
  appPage.style.display = "none";
  loginError.textContent = "";
  loginPass.value = "";
}

function showApp() {
  loginPage.style.display = "none";
  appPage.style.display = "block";
  currentUserName.textContent =
    `${currentUser.full_name || currentUser.name || "کاربر"}${isAdmin() ? " (مدیر)" : " (ثبت‌کننده)"}`;
  setDefaultDates();
}

async function loadCurrentProfile(authUser) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, username, full_name, role")
    .eq("id", authUser.id)
    .single();

  if (error || !data) {
    await supabase.auth.signOut();
    currentUser = null;
    showLogin();
    throw new Error(
      "پروفایل این کاربر در user_profiles پیدا نشد. نام کاربری و پروفایل Supabase را بررسی کنید."
    );
  }

  if (!["admin", "operator"].includes(data.role)) {
    await supabase.auth.signOut();
    currentUser = null;
    showLogin();
    throw new Error("نقش این کاربر معتبر نیست.");
  }

  currentUser = {
    id: authUser.id,
    username: data.username,
    name: data.full_name,
    full_name: data.full_name,
    role: data.role
  };
}

async function startAppForSession(authUser) {
  await loadCurrentProfile(authUser);
  showApp();
  await loadRecords();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (busy) return;

  busy = true;
  loginError.textContent = "در حال بررسی اطلاعات ورود...";

  const username = normalizeUsername(loginUser.value);
  const password = loginPass.value || "";

  try {
    const email = `${username}@people-manager.invalid`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.user) {
      loginError.textContent = "نام کاربری یا رمز عبور اشتباه است.";
      return;
    }

    await startAppForSession(data.user);
  } catch (err) {
    console.error(err);
    loginError.textContent =
      err.message || "ورود انجام نشد. تنظیمات Supabase را بررسی کنید.";
  } finally {
    busy = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    alert("خروج کامل نشد: " + (err.message || "خطای نامشخص"));
  }

  currentUser = null;
  records = [];
  showLogin();
});

personSelect.addEventListener("change", () => {
  const selected = personSelect.options[personSelect.selectedIndex];
  personIdDisplay.value = selected && selected.value ? selected.value : "";
});

function populatePeopleSelect() {
  personSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- انتخاب نفر --";
  personSelect.appendChild(placeholder);

  peopleList.forEach((person) => {
    const option = document.createElement("option");
    option.value = person.id;
    option.textContent = person.name;
    option.dataset.name = person.name;
    personSelect.appendChild(option);
  });
}

function populateSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = "";

  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = placeholder;
  selectEl.appendChild(ph);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectEl.appendChild(option);
  });
}

function setDefaultDates() {
  reportDateInput.value = getTodayPersian();
  occurrenceDateInput.value = "";
}

function mapDbRecord(r) {
  return {
    id: r.id,
    personId: String(r.person_id ?? ""),
    fullName: r.full_name ?? "",
    workstation: r.workstation ?? "",
    warningType: r.warning_type ?? "",
    errorType: r.error_type ?? "",
    reportDate: r.report_date ?? "",
    occurrenceDate: r.occurrence_date ?? "",
    description: r.description ?? "",
    createdBy: r.created_by_name ?? "-",
    createdById: r.created_by ?? null
  };
}

async function loadRecords() {
  recordsBody.innerHTML = "";
  emptyMessage.classList.add("show");
  emptyMessage.textContent = "در حال دریافت اطلاعات...";

  const { data, error } = await supabase
    .from("people_error_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    records = [];
    renderTable(searchInput.value);
    alert("دریافت گزارش‌ها انجام نشد: " + error.message);
    return;
  }

  records = (data || []).map(mapDbRecord);
  renderTable(searchInput.value);
}

function renderTable(filter = "") {
  const search = filter.trim().toLowerCase();

  const filtered = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => {
      if (!search) return true;

      return [
        record.personId, record.fullName, record.workstation,
        record.warningType, record.errorType, record.reportDate,
        record.occurrenceDate, record.description, record.createdBy
      ].some((v) => String(v ?? "").toLowerCase().includes(search));
    });

  recordsBody.innerHTML = "";

  if (search && filtered.length > 0) {
    const byPerson = {};

    filtered.forEach(({ record }) => {
      const key = record.personId + "|" + record.fullName;

      if (!byPerson[key]) {
        byPerson[key] = {
          id: record.personId,
          name: record.fullName,
          count: 0
        };
      }

      byPerson[key].count++;
    });

    filterSummary.innerHTML = "";

    const summaryBox = document.createElement("div");
    summaryBox.className = "summary-box";

    const total = document.createElement("span");
    total.textContent = `نتیجه فیلتر: ${filtered.length} مورد`;
    summaryBox.appendChild(total);

    const counts = document.createElement("div");
    counts.className = "person-counts";

    Object.values(byPerson).forEach((p, i) => {
      if (i) counts.append(" | ");

      const line = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = p.name;

      const count = document.createElement("span");
      count.className = "count-badge";
      count.textContent = String(p.count);

      line.append(
        name,
        document.createTextNode(` (کد ${p.id}): `),
        count,
        document.createTextNode(" اخطار")
      );

      counts.appendChild(line);
    });

    summaryBox.appendChild(counts);
    filterSummary.appendChild(summaryBox);
    filterSummary.style.display = "block";
  } else if (search && filtered.length === 0) {
    filterSummary.textContent = "نتیجه‌ای یافت نشد.";
    filterSummary.className = "summary-box";
    filterSummary.style.display = "block";
  } else {
    filterSummary.style.display = "none";
    filterSummary.innerHTML = "";
  }

  if (filtered.length === 0) {
    emptyMessage.classList.add("show");
    emptyMessage.textContent = search
      ? "نتیجه‌ای یافت نشد."
      : "هنوز هیچ رکوردی ثبت نشده است.";
    return;
  }

  emptyMessage.classList.remove("show");

  filtered.forEach(({ record, index }, rowIndex) => {
    const tr = document.createElement("tr");

    const cells = [
      rowIndex + 1,
      record.personId,
      record.fullName,
      record.workstation,
      record.warningType || "-",
      record.errorType,
      record.reportDate || "-",
      formatDisplayDate(record.occurrenceDate),
      record.description || "-",
      record.createdBy || "-"
    ];

    cells.forEach((val) => {
      const td = document.createElement("td");
      td.textContent = String(val);
      tr.appendChild(td);
    });

    const actions = document.createElement("td");
    actions.className = "actions";

    if (isAdmin()) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-edit";
      editBtn.textContent = "ویرایش";
      editBtn.addEventListener("click", () => editRecord(index));

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-delete";
      delBtn.textContent = "حذف";
      delBtn.addEventListener("click", () => deleteRecord(index));

      actions.append(editBtn, delBtn);
    } else {
      actions.textContent = "-";
    }

    tr.appendChild(actions);
    recordsBody.appendChild(tr);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser || busy) return;

  const selected = personSelect.options[personSelect.selectedIndex];

  if (!selected || !selected.value) {
    alert("لطفاً نام نفر را انتخاب کنید.");
    return;
  }

  if (!workstationSelect.value) {
    alert("لطفاً ایستگاه کاری را انتخاب کنید.");
    return;
  }

  if (!errorTypeSelect.value) {
    alert("لطفاً نوع خطا را انتخاب کنید.");
    return;
  }

  if (editIndex !== null && !isAdmin()) {
    alert("شما اجازه ویرایش ندارید.");
    return;
  }

  const existing = editIndex !== null ? records[editIndex] : null;

  const payload = {
    person_id: selected.value,
    full_name: selected.dataset.name || selected.textContent,
    workstation: workstationSelect.value,
    warning_type: warningTypeSelect.value || null,
    error_type: errorTypeSelect.value,
    report_date: reportDateInput.value || getTodayPersian(),
    occurrence_date: occurrenceDateInput.value || null,
    description: descriptionInput.value.trim() || null
  };

  busy = true;
  submitBtn.disabled = true;

  try {
    let result;

    if (existing) {
      result = await supabase
        .from("people_error_records")
        .update(payload)
        .eq("id", existing.id);
    } else {
      result = await supabase
        .from("people_error_records")
        .insert({
          ...payload,
          created_by: currentUser.id,
          created_by_name: currentUser.full_name
        });
    }

    if (result.error) throw result.error;

    await loadRecords();
    resetForm();
  } catch (err) {
    console.error(err);
    alert("ذخیره اطلاعات انجام نشد: " + (err.message || "خطای نامشخص"));
  } finally {
    busy = false;
    submitBtn.disabled = false;
  }
});

function editRecord(index) {
  if (!isAdmin()) {
    alert("شما اجازه ویرایش ندارید.");
    return;
  }

  const r = records[index];
  if (!r) return;

  personSelect.value = r.personId;
  personIdDisplay.value = r.personId;

  if (r.workstation && !workstations.includes(r.workstation)) {
    const opt = document.createElement("option");
    opt.value = r.workstation;
    opt.textContent = r.workstation + " (قبلی)";
    workstationSelect.appendChild(opt);
  }

  workstationSelect.value = r.workstation;
  warningTypeSelect.value = r.warningType || "";

  if (r.errorType && !errorTypes.includes(r.errorType)) {
    const opt = document.createElement("option");
    opt.value = r.errorType;
    opt.textContent = r.errorType + " (قبلی)";
    errorTypeSelect.appendChild(opt);
  }

  errorTypeSelect.value = r.errorType;
  reportDateInput.value = r.reportDate || getTodayPersian();
  occurrenceDateInput.value = r.occurrenceDate || "";
  descriptionInput.value = r.description || "";

  editIndex = index;
  formTitle.textContent = "ویرایش رکورد";
  submitBtn.textContent = "به‌روزرسانی";
  cancelBtn.style.display = "inline-block";

  document.querySelector(".form-section")?.scrollIntoView({
    behavior: "smooth"
  });
}

async function deleteRecord(index) {
  if (!isAdmin()) {
    alert("شما اجازه حذف ندارید.");
    return;
  }

  const record = records[index];
  if (!record) return;

  if (!confirm("آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟")) {
    return;
  }

  try {
    const { error } = await supabase
      .from("people_error_records")
      .delete()
      .eq("id", record.id);

    if (error) throw error;

    if (editIndex === index) resetForm();
    await loadRecords();
  } catch (err) {
    console.error(err);
    alert("حذف انجام نشد: " + (err.message || "خطای نامشخص"));
  }
}

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  personIdDisplay.value = "";
  editIndex = null;
  formTitle.textContent = "افزودن رکورد جدید";
  submitBtn.textContent = "ذخیره";
  cancelBtn.style.display = "none";
  setDefaultDates();

  Array.from(workstationSelect.options).forEach((o) => {
    if (o.textContent.endsWith(" (قبلی)")) o.remove();
  });

  Array.from(errorTypeSelect.options).forEach((o) => {
    if (o.textContent.endsWith(" (قبلی)")) o.remove();
  });
}

searchInput.addEventListener("input", () => renderTable(searchInput.value));

populatePeopleSelect();
populateSelect(workstationSelect, workstations, "-- انتخاب ایستگاه کاری --");
populateSelect(errorTypeSelect, errorTypes, "-- انتخاب نوع خطا --");
showLogin();

(async function initializeAuth() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
    showLogin();
    return;
  }

  if (data.session?.user) {
    try {
      await startAppForSession(data.session.user);
    } catch (err) {
      console.error(err);
      alert(err.message || "بازیابی نشست کاربر انجام نشد.");
      showLogin();
    }
  }
})();
