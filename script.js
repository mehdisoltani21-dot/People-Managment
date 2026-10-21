// ========== کاربران و دسترسی‌ها ==========
const users = {
  "mehdi-soltani": {
    name: "مهدی سلطانی",
    password: "ms136810",
    role: "admin"          // دسترسی کامل
  },
  "masoud-kazemi": {
    name: "مسعود کاظمی",
    password: "mk133320",
    role: "admin"
  },
  "mehdi-afshar": {
    name: "مهدی افشار",
    password: "ma123456",
    role: "operator"       // فقط مشاهده + ثبت
  },
  "arash-baba": {
    name: "آرش بابا",
    password: "ab362541",
    role: "operator"
  }
};

// ========== لیست‌ها ==========
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
  "عدم اجرای صحیح وظایف محوله",
  "غیبت و تأخیر",
  "وضعیت ظاهری نامناسب",
  "استفاده غیر استاندارد لوازم مصرفی",
  "عدم استفاده از وسایل ایمنی فردی",
  "عدم استفاده از وسایل حفاظت فردی",
  "ماشین آلات و تجهیزات",
  "مشکلات فرآیندی",
  "عدم آموزش",
  "شرایط محیطی",
  "عدم رعایت مقررات ایمنی و دستورالعمل ها",
  "ازدحام و بی نظمی"
];

const STORAGE_KEY = "peopleErrorRecords_v3";
const SESSION_KEY = "currentUser";

// ========== عناصر DOM ==========
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
const workstationSelect = document.getElementById("workstation");
const warningTypeSelect = document.getElementById("warningType");
const errorTypeSelect = document.getElementById("errorType");
const reportDateInput = document.getElementById("reportDate");
const occurrenceDateInput = document.getElementById("occurrenceDate");
const descriptionInput = document.getElementById("description");
const recordsBody = document.getElementById("records-body");
const emptyMessage = document.getElementById("empty-message");
const searchInput = document.getElementById("search-input");

let records = [];
let editIndex = null;
let currentUser = null;

// ========== توابع کمکی ==========
function getTodayPersian() {
  return new Date().toLocaleDateString("fa-IR", {
    year: "numeric", month: "2-digit", day: "2-digit"
  });
}

function formatDisplayDate(isoDate) {
  if (!isoDate) return "-";
  try {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("fa-IR", {
      year: "numeric", month: "2-digit", day: "2-digit"
    });
  } catch {
    return isoDate;
  }
}

function isAdmin() {
  return currentUser && currentUser.role === "admin";
}

// ========== ورود و خروج ==========
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const userId = loginUser.value;
  const pass = loginPass.value;

  const user = users[userId];
  if (!user || user.password !== pass) {
    loginError.textContent = "نام کاربری یا رمز عبور اشتباه است.";
    return;
  }

  currentUser = { id: userId, ...user };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
  showApp();
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  currentUser = null;
  showLogin();
});

function showLogin() {
  loginPage.style.display = "flex";
  appPage.style.display = "none";
  loginForm.reset();
  loginError.textContent = "";
}

function showApp() {
  loginPage.style.display = "none";
  appPage.style.display = "block";
  currentUserName.textContent = currentUser.name + (isAdmin() ? " (مدیر)" : " (ثبت‌کننده)");
  loadRecords();
  setDefaultDates();
}

// بررسی ورود قبلی
function checkSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      currentUser = JSON.parse(saved);
      showApp();
      return;
    }
  } catch {}
  showLogin();
}

// ========== پر کردن لیست‌ها ==========
function populatePeopleSelect() {
  peopleList.forEach(person => {
    const option = document.createElement("option");
    option.value = person.id;
    option.textContent = `${person.id} - ${person.name}`;
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
  items.forEach(item => {
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

// ========== ذخیره‌سازی ==========
function loadRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    records = Array.isArray(parsed) ? parsed : [];
  } catch {
    records = [];
  }

  records = records.map(r => ({
    id: r.id ?? Date.now() + Math.random(),
    personId: String(r.personId ?? ""),
    fullName: r.fullName ?? "",
    workstation: r.workstation ?? "",
    warningType: r.warningType ?? "",
    errorType: r.errorType ?? "",
    reportDate: r.reportDate ?? "",
    occurrenceDate: r.occurrenceDate ?? "",
    description: r.description ?? "",
    createdBy: r.createdBy ?? "-"
  }));

  renderTable();
}

function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    alert("ذخیره اطلاعات انجام نشد.");
    return false;
  }
}

// ========== جدول ==========
function renderTable(filter = "") {
  const search = filter.trim().toLowerCase();

  const filtered = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => {
      return [
        record.personId, record.fullName, record.workstation,
        record.warningType, record.errorType, record.reportDate,
        record.occurrenceDate, record.description, record.createdBy
      ].some(v => String(v ?? "").toLowerCase().includes(search));
    });

  recordsBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyMessage.classList.add("show");
    emptyMessage.textContent = search ? "نتیجه‌ای یافت نشد." : "هنوز هیچ رکوردی ثبت نشده است.";
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

    cells.forEach(val => {
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

// ========== فرم ==========
form.addEventListener("submit", e => {
  e.preventDefault();

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

  // فقط ادمین می‌تونه ویرایش کنه
  if (editIndex !== null && !isAdmin()) {
    alert("شما اجازه ویرایش ندارید.");
    return;
  }

  const newRecord = {
    id: editIndex !== null ? records[editIndex].id : Date.now(),
    personId: selected.value,
    fullName: selected.dataset.name,
    workstation: workstationSelect.value,
    warningType: warningTypeSelect.value,
    errorType: errorTypeSelect.value,
    reportDate: reportDateInput.value || getTodayPersian(),
    occurrenceDate: occurrenceDateInput.value,
    description: descriptionInput.value.trim(),
    createdBy: editIndex !== null ? records[editIndex].createdBy : currentUser.name
  };

  const prev = editIndex !== null ? records[editIndex] : null;

  if (editIndex !== null) {
    records[editIndex] = newRecord;
  } else {
    records.unshift(newRecord);
  }

  if (!saveRecords()) {
    if (editIndex !== null) records[editIndex] = prev;
    else records.shift();
    return;
  }

  renderTable(searchInput.value);
  resetForm();
});

function editRecord(index) {
  if (!isAdmin()) {
    alert("شما اجازه ویرایش ندارید.");
    return;
  }

  const r = records[index];
  if (!r) return;

  personSelect.value = r.personId;

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

  document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
}

function deleteRecord(index) {
  if (!isAdmin()) {
    alert("شما اجازه حذف ندارید.");
    return;
  }

  if (!records[index]) return;
  if (!confirm("آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟")) return;

  const deleted = records[index];
  records.splice(index, 1);

  if (!saveRecords()) {
    records.splice(index, 0, deleted);
    return;
  }

  renderTable(searchInput.value);
  if (editIndex === index) resetForm();
  else if (editIndex !== null && editIndex > index) editIndex--;
}

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  editIndex = null;
  formTitle.textContent = "افزودن رکورد جدید";
  submitBtn.textContent = "ذخیره";
  cancelBtn.style.display = "none";
  setDefaultDates();

  Array.from(workstationSelect.options).forEach(o => {
    if (o.textContent.endsWith(" (قبلی)")) o.remove();
  });
  Array.from(errorTypeSelect.options).forEach(o => {
    if (o.textContent.endsWith(" (قبلی)")) o.remove();
  });
}

searchInput.addEventListener("input", () => renderTable(searchInput.value));

// ========== راه‌اندازی ==========
populatePeopleSelect();
populateSelect(workstationSelect, workstations, "-- انتخاب ایستگاه کاری --");
populateSelect(errorTypeSelect, errorTypes, "-- انتخاب نوع خطا --");
checkSession();
