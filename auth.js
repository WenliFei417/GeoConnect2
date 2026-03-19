// ============================================================
// GeoConnect — Auth page mock (no backend required)
// Replace the original auth.js with this file.
// Shares the same in-memory user list with app.js via localStorage fake JWT.
// ============================================================

// --- In-memory user store (mirrors DB.users in app.js) ---
// We duplicate seed users here because auth.html loads auth.js, not app.js.
// New signups are written to localStorage so app.js can pick them up.
const AUTH_DB = {
  users: [
    { username: "kimi",    password: "$mock", gender: "female", age: 22 },
    { username: "alice",   password: "$mock", gender: "female", age: 25 },
    { username: "bob",     password: "$mock", gender: "male",   age: 28 },
    { username: "charlie", password: "$mock", gender: "male",   age: 30 },
  ],
  admins: new Set(["kimi"]),
};

// Load any extra users that were signed up in this session
try {
  const extra = JSON.parse(localStorage.getItem("gc_extra_users") || "[]");
  extra.forEach((u) => {
    if (!AUTH_DB.users.find((x) => x.username === u.username)) {
      AUTH_DB.users.push(u);
    }
  });
} catch {}

function setMsg(el, text, ok = false) {
  if (!el) return;
  el.textContent = text;
  el.style.color = ok ? "green" : "red";
}

// --- Login ---
const formLogin = document.querySelector("#form-login");
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.querySelector("#login-msg");
    const data = Object.fromEntries(new FormData(formLogin).entries());
    const username = (data.username || "").trim().toLowerCase();
    const password = data.password || "";

    const user = AUTH_DB.users.find((u) => u.username === username);
    if (!user) return setMsg(msg, "Invalid credentials");
    if (user.password !== "$mock" && user.password !== password) return setMsg(msg, "Invalid credentials");

    // Build fake JWT
    const payload = { username, is_admin: AUTH_DB.admins.has(username), exp: Math.floor(Date.now() / 1000) + 86400 };
    const token = btoa(JSON.stringify({ alg: "HS256" })) + "." + btoa(JSON.stringify(payload)) + ".mock_signature";
    localStorage.setItem("token", token);
    localStorage.setItem("gc_token", token);
    setMsg(msg, "Login success!", true);
    setTimeout(() => (window.location = "index.html"), 800);
  });
}

// --- Signup ---
const formSignup = document.querySelector("#form-signup");
if (formSignup) {
  formSignup.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.querySelector("#signup-msg");
    const data = Object.fromEntries(new FormData(formSignup).entries());
    const username = (data.username || "").trim().toLowerCase();
    const password = data.password || "";

    if (!username || !password) return setMsg(msg, "Please fill in all fields");
    if (!/^[a-z0-9_]+$/.test(username)) return setMsg(msg, "Username: lowercase letters, numbers, underscore only");
    if (AUTH_DB.users.find((u) => u.username === username)) return setMsg(msg, "Username already exists");

    const newUser = { username, password, gender: "unknown", age: 20 };
    AUTH_DB.users.push(newUser);

    // Persist new users so app.js can also find them
    try {
      const extra = JSON.parse(localStorage.getItem("gc_extra_users") || "[]");
      extra.push(newUser);
      localStorage.setItem("gc_extra_users", JSON.stringify(extra));
    } catch {}

    setMsg(msg, "Sign up success! Please login.", true);
    formSignup.reset();
  });
}