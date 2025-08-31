let token = null;

const $ = (s) => document.querySelector(s);
const authMsg = $("#authMsg");
const addMsg  = $("#addMsg");
const results = $("#results");

async function api(path, opts = {}) {
  const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }

  if (!res.ok) {
    const msg =
      (data && (Array.isArray(data.messages) ? data.messages.join(" • ") : data.error)) ||
      text ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}


$("#signupBtn").addEventListener("click", async () => {
  try {
    const email = $("#email").value.trim();
    const password = $("#password").value;
    await api("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
    authMsg.textContent = "Signup successful. Now log in.";
    authMsg.className = "ok";
  } catch (e) {
    authMsg.textContent = "Signup failed: " + e.message;
    authMsg.className = "err";
  }
});

$("#loginBtn").addEventListener("click", async () => {
  try {
    const email = $("#email").value.trim();
    const password = $("#password").value;
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    token = data.token;
    authMsg.textContent = "Logged in as " + email;
    authMsg.className = "ok";
  } catch (e) {
    authMsg.textContent = "Login failed: " + e.message;
    authMsg.className = "err";
  }
});

$("#addBtn").addEventListener("click", async () => {
  if (!token) {
    addMsg.textContent = "Please log in first.";
    addMsg.className = "err";
    return;
  }
  try {
    const courseCode = $("#courseCode").value.trim();
    const title = $("#title").value.trim();
    const link = $("#link").value.trim();
    await api("/resources", { method: "POST", body: JSON.stringify({ courseCode, title, link }) });
    addMsg.textContent = "Added!";
    addMsg.className = "ok";
    $("#title").value = ""; $("#link").value = "";
  } catch (e) {
    addMsg.textContent = "Add failed: " + e.message;
    addMsg.className = "err";
  }
});

$("#searchBtn").addEventListener("click", () => {
  const code = $("#qCourse").value.trim();
  loadResources(code);
});
$("#allBtn").addEventListener("click", () => loadResources(""));

async function loadResources(courseCode) {
  results.innerHTML = "";
  try {
    const url = "/resources" + (courseCode ? `?course=${encodeURIComponent(courseCode)}` : "");
    const rows = await api(url);
    for (const r of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(r.title)}</td>
        <td><a href="${escapeAttr(r.link)}" target="_blank" rel="noopener">open</a></td>
        <td>${escapeHtml(r.course?.code || "")}</td>
        <td>${escapeHtml(r.user?.email || "")}</td>
      `;
      results.appendChild(tr);
    }
  } catch (e) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Load failed: " + e.message;
    td.className = "err";
    tr.appendChild(td);
    results.appendChild(tr);
  }
}

// helpers
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(s){return escapeHtml(s)}

// auto-load all
fetch("/healthz").catch(()=>{});
loadResources("");
