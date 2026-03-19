// ============================================================
// GeoConnect — Pure Frontend Demo (no backend required)
// Replace the original app.js with this file.
// All data lives in memory; refreshing the page resets to seed data.
// ============================================================

const $ = (sel) => document.querySelector(sel);

// ===== In-Memory Data Store =====
const DB = {
  users: [
    { username: "kimi",    password: "$mock", gender: "female", age: 22 },
    { username: "alice",   password: "$mock", gender: "female", age: 25 },
    { username: "bob",     password: "$mock", gender: "male",   age: 28 },
    { username: "charlie", password: "$mock", gender: "male",   age: 30 },
  ],
  // Admin list (mirrors ADMIN_USERS env var from the original backend)
  admins: new Set(["kimi"]),
  postIdSeq: 100,
  seedPosts: [
    // ---- Syracuse area (dense cluster) ----
    { id: "1",  user: "kimi",    message: "Beautiful sunset at Onondaga Lake! 🌅",                  location: { lat: 43.0735, lon: -76.1743 }, url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop" },
    { id: "2",  user: "alice",   message: "Studying hard at Syracuse University library 📚",         location: { lat: 43.0382, lon: -76.1326 } },
    { id: "3",  user: "bob",     message: "Great coffee at Café Kubal downtown ☕",                  location: { lat: 43.0490, lon: -76.1505 }, url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop" },
    { id: "4",  user: "kimi",    message: "Hiking at Green Lakes State Park — the water is so clear!", location: { lat: 43.0500, lon: -76.0420 }, url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop" },
    { id: "5",  user: "charlie", message: "Carrier Dome game night! Go Orange! 🍊🏀",               location: { lat: 43.0362, lon: -76.1364 } },
    { id: "6",  user: "alice",   message: "Morning run around Thornden Park 🏃‍♀️",                   location: { lat: 43.0420, lon: -76.1280 } },
    { id: "7",  user: "bob",     message: "Best pizza in town at Varsity Pizza 🍕",                  location: { lat: 43.0471, lon: -76.1540 }, url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop" },
    { id: "8",  user: "kimi",    message: "Exploring the Erie Canal trail by bike 🚴",               location: { lat: 43.0830, lon: -76.1900 } },
    { id: "9",  user: "charlie", message: "Farmers market at CNY Regional Market 🥕🍎",              location: { lat: 43.0700, lon: -76.1350 }, url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" },
    { id: "10", user: "alice",   message: "Snow day vibes at Destiny USA mall ❄️🛍️",                location: { lat: 43.0725, lon: -76.1700 } },
    // ---- Other US cities ----
    { id: "11", user: "bob",     message: "Times Square never sleeps 🗽✨",                          location: { lat: 40.7580, lon: -73.9855 }, url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=300&fit=crop" },
    { id: "12", user: "charlie", message: "Golden Gate Bridge in the fog — classic SF 🌁",           location: { lat: 37.8199, lon: -122.4783 }, url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop" },
    { id: "13", user: "alice",   message: "Deep dish pizza in Chicago — absolutely worth it 🍕",     location: { lat: 41.8827, lon: -87.6233 } },
    { id: "14", user: "kimi",    message: "Cherry blossoms starting to bloom in DC 🌸",              location: { lat: 38.8853, lon: -77.0386 }, url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=300&fit=crop" },
    { id: "15", user: "bob",     message: "Live music on 6th Street in Austin 🎸🤠",                 location: { lat: 30.2672, lon: -97.7431 } },
    { id: "16", user: "charlie", message: "Miami Beach sunset is unreal 🏖️🌅",                      location: { lat: 25.7907, lon: -80.1300 }, url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop" },
    { id: "17", user: "alice",   message: "Pike Place Market — freshest seafood ever 🐟",            location: { lat: 47.6097, lon: -122.3425 } },
    { id: "18", user: "kimi",    message: "Hiking the Hollywood Hills, amazing views of LA 🌴",      location: { lat: 34.1341, lon: -118.3215 }, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" },
  ],
  
  // Runtime posts array — loaded from localStorage or initialized from seedPosts
  posts: [],
};

// --- localStorage persistence ---
function loadPosts() {
  try {
    const saved = localStorage.getItem("gc_posts");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        DB.posts = parsed;
        // Restore postIdSeq to avoid id collisions
        const maxId = Math.max(...DB.posts.map((p) => Number(p.id) || 0));
        if (maxId >= DB.postIdSeq) DB.postIdSeq = maxId + 1;
        return;
      }
    }
  } catch {}
  // First visit or corrupted data — use seed data
  DB.posts = JSON.parse(JSON.stringify(DB.seedPosts));
}
function savePosts() {
  try { localStorage.setItem("gc_posts", JSON.stringify(DB.posts)); } catch {}
}
// Initialize posts on script load
loadPosts();
const SEED_POST_IDS = new Set(DB.seedPosts.map((p) => p.id));

// ===== Mock API Layer =====
// These functions replace the original fetch() calls to the Go backend.
// They operate on the in-memory DB above and return the same data shapes
// that the real backend would return, so the rest of the code stays the same.

const MockAPI = {
  signup(username, password, age, gender) {
    username = (username || "").trim().toLowerCase();
    if (!username || !password) return { ok: false, status: 400, text: "missing fields" };
    if (!/^[a-z0-9_]+$/.test(username)) return { ok: false, status: 400, text: "invalid username" };
    if (DB.users.find((u) => u.username === username)) return { ok: false, status: 409, text: "username already exists" };
    DB.users.push({ username, password, gender: gender || "unknown", age: Number(age) || 20 });
    return { ok: true, text: '{"status":"ok"}' };
  },

  login(username, password) {
    username = (username || "").trim().toLowerCase();
    const user = DB.users.find((u) => u.username === username);
    // For seed users (password "$mock") accept any non-empty password;
    // for user-created accounts require exact match.
    if (!user) return { ok: false, status: 401, text: "invalid credentials" };
    if (user.password !== "$mock" && user.password !== password) return { ok: false, status: 401, text: "invalid credentials" };
    // Build a fake JWT (header.payload.signature) so existing decode logic works
    const payload = { username, is_admin: DB.admins.has(username), exp: Math.floor(Date.now() / 1000) + 86400 };
    const token = btoa(JSON.stringify({ alg: "HS256" })) + "." + btoa(JSON.stringify(payload)) + ".mock_signature";
    return { ok: true, json: { token } };
  },

  post(user, message, lat, lon) {
    if (!message) return { ok: false, status: 400, text: "empty message" };
    const filtered = ["spam", "advertisement", "politics"];
    if (filtered.some((w) => message.toLowerCase().includes(w))) return { ok: false, status: 400, text: "message contains forbidden words" };
    const id = String(++DB.postIdSeq);
    const p = { id, user, message, location: { lat: Number(lat), lon: Number(lon) } };
    DB.posts.unshift(p);
    savePosts();
    return { ok: true, text: '{"status":"ok"}' };
  },

  search(params) {
    const mode = (params.mode || "").toLowerCase();
    let results;
    if (mode === "viewport") {
      const n = Number(params.n), s = Number(params.s), e = Number(params.e), w = Number(params.w);
      results = DB.posts.filter((p) => {
        const lat = p.location.lat, lon = p.location.lon;
        return lat <= n && lat >= s && lon <= e && lon >= w;
      });
    } else {
      const lat = Number(params.lat), lon = Number(params.lon);
      const rangeKm = Number(params.range) || 200;
      results = DB.posts.filter((p) => haversine(lat, lon, p.location.lat, p.location.lon) <= rangeKm);
    }
    const limit = Math.min(Math.max(Number(params.limit) || 200, 1), 1000);
    return results.slice(0, limit);
  },

  deletePost(id) {
    const idx = DB.posts.findIndex((p) => p.id === id);
    if (idx === -1) return { ok: false, status: 404, text: "post not found" };
    const p = DB.posts[idx];
    if (SEED_POST_IDS.has(p.id)) {
      return { ok: false, status: 403, text: "seed data cannot be deleted" };
    }
    DB.posts.splice(idx, 1);
    savePosts();
    return { ok: true, text: '{"status":"deleted"}' };
  },
};

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===== DOM References =====
const authInfo = $("#auth-info");
const btnLogout = $("#btn-logout");
const btnLoginLink = $("#btn-login-link");
const btnJumpCompose = $("#btn-jump-compose");
const btnJumpFeed = $("#btn-jump-feed");
const formPost = $("#form-post");
const postMsg = $("#post-msg");
const btnUseLoc = $("#btn-use-location");
const btnPickOnMap = $("#btn-pick-on-map");
const postIdentity = $("#post-identity");
const postLocationStatus = $("#post-location-status");
const formSearch = $("#form-search");
const btnSearchMyLoc = $("#btn-search-my-loc");
const btnSearchMapCenter = $("#btn-search-map-center");
const searchMsg = $("#search-msg");
const results = $("#results");
const selectState = $("#select-state");
const btnStateGo = $("#btn-state-go");

// ===== Token helpers (unchanged — still uses fake JWT in localStorage) =====
function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("gc_token") || "";
}
function setToken(t) {
  if (t) {
    localStorage.setItem("token", t);
    localStorage.setItem("gc_token", t);
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("gc_token");
  }
  renderAuthState();
}
function renderAuthState() {
  const t = getToken();
  const u = getCurrentUsername();
  authInfo.textContent = t ? `Logged in as ${u}` : "Browsing as Anonymous";
  if (postIdentity) {
    postIdentity.textContent = t ? `Posting as ${u}` : "Posting as Anonymous";
  }
  if (btnLogout) btnLogout.style.display = t ? "inline-block" : "none";
  if (btnLoginLink) btnLoginLink.style.display = "inline-flex";
  if (btnLoginLink) btnLoginLink.textContent = t ? "Switch account" : "Login";
}
function getCurrentUsername() {
  const t = getToken();
  if (!t || !t.includes(".")) return "";
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload && payload.username ? String(payload.username) : "";
  } catch { return ""; }
}
function getIsAdmin() {
  const t = getToken();
  if (!t || !t.includes(".")) return false;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    return !!payload.is_admin;
  } catch { return false; }
}

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    setToken("");
    window.location.href = "auth.html";
  });
}

// ===== Map Setup (Leaflet — unchanged, same as original) =====
let map, markersLayer;
let allowFitOnce = true;
let searchSeq = 0;
let suppressNextViewport = false;
let selectedPostMarker = null;
let pendingMapPick = false;

function initMap() {
  if (map) return;
  map = L.map("map").setView([43.0481, -76.1474], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
  const debouncedViewport = debounce(viewportSearch, 400);
  map.on("moveend", () => {
    if (suppressNextViewport) { suppressNextViewport = false; return; }
    debouncedViewport();
  });
  map.on("click", (e) => {
    setPostLocation(e.latlng.lat, e.latlng.lng, "Location picked from map.");
    if (pendingMapPick) {
      setMsg(postMsg, "Location selected. You can post now.", true);
      pendingMapPick = false;
    }
  });
  viewportSearch();
}

function renderOnMap(items, fit = true) {
  if (!document.getElementById("map")) return;
  if (!map) initMap();
  markersLayer.clearLayers();
  if (!items || !items.length) return;
  const latlngs = [];
  items.forEach((p) => {
    const lat = Number(p?.location?.lat);
    const lon = Number(p?.location?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const popupHtml = `
      <div style="min-width:180px">
        <div><strong>${escapeHtml(p.user || "")}</strong></div>
        <div style="margin:4px 0">${escapeHtml(p.message || "")}</div>
        ${p.url ? `<img src="${escapeHtml(p.url)}" alt="img" style="width:100%;max-height:140px;object-fit:cover;border-radius:8px;border:1px solid #eee;" />` : ""}
        <div style="color:#666;margin-top:4px">(${fmt(lat)}, ${fmt(lon)})</div>
      </div>`;
    const marker = L.marker([lat, lon]).bindPopup(popupHtml);
    marker.addTo(markersLayer);
    latlngs.push([lat, lon]);
  });
  if (latlngs.length > 0 && fit) {
    map.fitBounds(latlngs, { padding: [30, 30] });
  }
}

function setPostLocation(lat, lon, msg = "Location selected.") {
  const latInput = formPost.querySelector('input[name="lat"]');
  const lonInput = formPost.querySelector('input[name="lon"]');
  latInput.value = Number(lat).toFixed(6);
  lonInput.value = Number(lon).toFixed(6);
  if (postLocationStatus) {
    postLocationStatus.textContent = `Selected location: ${fmt(lat)}, ${fmt(lon)}`;
  }
  if (map) {
    if (selectedPostMarker) {
      selectedPostMarker.setLatLng([lat, lon]);
    } else {
      selectedPostMarker = L.circleMarker([lat, lon], {
        radius: 8,
        weight: 2,
        color: "#1f7a8c",
        fillColor: "#1f7a8c",
        fillOpacity: 0.25,
      }).addTo(map);
    }
  }
  if (msg) setMsg(postMsg, msg, true);
}

function setSearchLocation(lat, lon) {
  formSearch.querySelector('input[name="lat"]').value = Number(lat).toFixed(6);
  formSearch.querySelector('input[name="lon"]').value = Number(lon).toFixed(6);
}

function runNearbySearch(lat, lon, rangeOverride) {
  const range = rangeOverride || formSearch.querySelector('select[name="range"]').value || 50;
  setSearchLocation(lat, lon);
  const arr = MockAPI.search({ lat, lon, range });
  renderResults(arr);
  renderOnMap(arr, true);
  setMsg(searchMsg, `Found ${arr.length} result(s).`, true);
}

// ===== Viewport search (now uses MockAPI instead of fetch) =====
function viewportSearch() {
  const seq = ++searchSeq;
  if (!map) return;
  const b = map.getBounds();
  const arr = MockAPI.search({
    mode: "viewport",
    n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest(),
    limit: 500,
  });
  if (seq !== searchSeq) return;
  renderResults(arr);
  renderOnMap(arr, allowFitOnce);
  allowFitOnce = false;
  setMsg(searchMsg, `Found ${arr.length} result(s) in view.`, true);
}

// ===== State bounds (unchanged from original) =====
const stateBounds = {
  AL:{n:35.0080,s:30.2233,e:-84.8882,w:-88.4732},
  AZ:{n:37.0043,s:31.3322,e:-109.0452,w:-114.8166},
  AR:{n:36.4996,s:33.0041,e:-89.6444,w:-94.6179},
  CA:{n:42.0095,s:32.5343,e:-114.1308,w:-124.4096},
  CO:{n:41.0034,s:36.9931,e:-102.0416,w:-109.0603},
  CT:{n:42.0506,s:41.2379,e:-71.7811,w:-73.7272},
  DE:{n:39.8395,s:38.4510,e:-75.0489,w:-75.7890},
  DC:{n:38.9955,s:38.7916,e:-76.9094,w:-77.1198},
  FL:{n:31.0000,s:24.3963,e:-80.0314,w:-87.6349},
  GA:{n:35.0007,s:30.3558,e:-80.8408,w:-85.6052},
  ID:{n:49.0011,s:41.9881,e:-111.0435,w:-117.2430},
  IL:{n:42.5083,s:36.9703,e:-87.4952,w:-91.5131},
  IN:{n:41.7606,s:37.7717,e:-84.7846,w:-88.0979},
  IA:{n:43.5012,s:40.3754,e:-90.1401,w:-96.6395},
  KS:{n:40.0032,s:36.9931,e:-94.5890,w:-102.0517},
  KY:{n:39.1474,s:36.4971,e:-81.9647,w:-89.5715},
  LA:{n:33.0195,s:28.8551,e:-89.0989,w:-94.0431},
  ME:{n:47.4597,s:43.0649,e:-66.9499,w:-71.0843},
  MD:{n:39.7220,s:37.9117,e:-75.0489,w:-79.4877},
  MA:{n:42.8866,s:41.1863,e:-69.8580,w:-73.5081},
  MI:{n:48.3061,s:41.6961,e:-82.4135,w:-90.4186},
  MN:{n:49.3845,s:43.4994,e:-89.4917,w:-97.2392},
  MS:{n:35.0059,s:30.1739,e:-88.0979,w:-91.6550},
  MO:{n:40.6136,s:35.9957,e:-89.0989,w:-95.7747},
  MT:{n:49.0011,s:44.3579,e:-104.0475,w:-116.0500},
  NE:{n:43.0017,s:39.9999,e:-95.3083,w:-104.0535},
  NV:{n:42.0022,s:35.0019,e:-114.0395,w:-120.0057},
  NH:{n:45.3055,s:42.6969,e:-70.6106,w:-72.5572},
  NJ:{n:41.3574,s:38.9286,e:-73.9024,w:-75.5636},
  NM:{n:37.0003,s:31.3323,e:-103.0020,w:-109.0502},
  NY:{n:45.0153,s:40.4961,e:-71.8562,w:-79.7624},
  NC:{n:36.5881,s:33.8423,e:-75.4563,w:-84.3219},
  ND:{n:49.0007,s:45.9351,e:-97.2287,w:-104.0489},
  OH:{n:41.9773,s:38.4034,e:-80.5187,w:-84.8203},
  OK:{n:37.0038,s:33.6158,e:-94.4311,w:-103.0026},
  OR:{n:46.2920,s:41.9918,e:-116.4635,w:-124.5662},
  PA:{n:42.5147,s:39.7199,e:-74.6895,w:-80.5199},
  RI:{n:42.0188,s:41.1463,e:-71.1206,w:-71.8628},
  SC:{n:35.2155,s:32.0335,e:-78.5408,w:-83.3533},
  SD:{n:45.9455,s:42.4797,e:-96.4366,w:-104.0577},
  TN:{n:36.6781,s:34.9829,e:-81.6469,w:-90.3103},
  TX:{n:36.5007,s:25.8371,e:-93.5083,w:-106.6456},
  UT:{n:42.0017,s:36.9980,e:-109.0415,w:-114.0530},
  VT:{n:45.0167,s:42.7303,e:-71.5102,w:-73.4397},
  VA:{n:39.4660,s:36.5408,e:-75.2423,w:-83.6753},
  WA:{n:49.0024,s:45.5435,e:-116.9156,w:-124.8489},
  WV:{n:40.6388,s:37.2015,e:-77.7190,w:-82.6447},
  WI:{n:47.3025,s:42.4919,e:-86.2496,w:-92.8894},
  WY:{n:45.0021,s:40.9948,e:-104.0522,w:-111.0569},
};

function stateSearch(code) {
  if (!code || !stateBounds[code]) return;
  if (!map) initMap();
  const b = stateBounds[code];
  const bounds = [[b.s, b.w], [b.n, b.e]];
  suppressNextViewport = true;
  const seq = ++searchSeq;
  map.fitBounds(bounds, { padding: [30, 30] });
  const arr = MockAPI.search({ mode: "viewport", n: b.n, s: b.s, e: b.e, w: b.w, limit: 500 });
  if (seq !== searchSeq) return;
  renderResults(arr);
  renderOnMap(arr, false);
  setMsg(searchMsg, `Found ${arr.length} result(s) in ${code}.`, true);
  allowFitOnce = false;
}

// ===== UI Helpers =====
function setMsg(el, text, ok = true) {
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + (ok ? "ok" : "err");
}
function fmt(v) { const n = Number(v); return Number.isFinite(n) ? n.toFixed(5) : ""; }
function escapeHtml(s) {
  return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  });
}
function debounce(fn, wait) {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
}

// ===== Event Handlers =====

// Use my location (post form)
btnUseLoc.addEventListener("click", async () => {
  setMsg(postMsg, "Getting location...");
  try {
    const pos = await getCurrentPosition();
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    setPostLocation(lat, lon, "Current location selected.");
    if (!map) initMap();
    map.flyTo([lat, lon], 13);
  } catch (e) {
    setMsg(postMsg, "Failed: " + e.message, false);
  }
});

if (btnPickOnMap) {
  btnPickOnMap.addEventListener("click", () => {
    pendingMapPick = true;
    setMsg(postMsg, "Click anywhere on the map to choose a location.", true);
    const mapCard = document.getElementById("map");
    if (mapCard) mapCard.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

formPost.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(formPost);
  const lat = fd.get("lat");
  const lon = fd.get("lon");
  if (!lat || !lon) {
    setMsg(postMsg, "Please choose a location first.", false);
    return;
  }
  const username = getCurrentUsername() || "Anonymous";
  const res = MockAPI.post(username, fd.get("message"), lat, lon);
  if (!res.ok) {
    setMsg(postMsg, "Post failed: " + res.text, false);
    return;
  }
  setMsg(postMsg, username === "Anonymous" ? "Anonymous post published." : "Post successful.", true);
  formPost.reset();
  formPost.querySelector('input[name="lat"]').value = "";
  formPost.querySelector('input[name="lon"]').value = "";
  if (postLocationStatus) postLocationStatus.textContent = "No location selected yet.";
  if (selectedPostMarker && map) {
    map.removeLayer(selectedPostMarker);
    selectedPostMarker = null;
  }
  viewportSearch();
});

// Use my location (search form)
btnSearchMyLoc.addEventListener("click", async () => {
  setMsg(searchMsg, "Getting location...");
  try {
    const pos = await getCurrentPosition();
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    setSearchLocation(lat, lon);
    setMsg(searchMsg, "Searching near your current location.", true);
    if (!map) initMap();
    map.flyTo([lat, lon], 13);
    runNearbySearch(lat, lon);
  } catch (e) {
    setMsg(searchMsg, "Failed: " + e.message, false);
  }
});

if (btnSearchMapCenter) {
  btnSearchMapCenter.addEventListener("click", () => {
    if (!map) initMap();
    const center = map.getCenter();
    setMsg(searchMsg, "Searching around the current map center.", true);
    runNearbySearch(center.lat, center.lng);
  });
}

// State selector
if (btnStateGo) btnStateGo.addEventListener("click", () => { stateSearch((selectState && selectState.value) || ""); });
if (selectState) selectState.addEventListener("change", () => { if (selectState.value) stateSearch(selectState.value); });

formSearch.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!map) initMap();
  const fd = new FormData(formSearch);
  const lat = Number(fd.get("lat"));
  const lon = Number(fd.get("lon"));
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    runNearbySearch(lat, lon, fd.get("range"));
    return;
  }
  const center = map.getCenter();
  runNearbySearch(center.lat, center.lng, fd.get("range"));
});

// ===== Render search results =====
function renderResults(items) {
  results.innerHTML = "";
  items.forEach((p) => {
    const div = document.createElement("div");
    div.className = "card-result";
    const imgHtml = p.url ? `<img src="${escapeHtml(p.url)}" alt="image" />` : "";
    div.innerHTML = `${imgHtml}
      <div class="result-meta">
        <div class="result-top">
          <strong class="result-user">${escapeHtml(p.user || "")}</strong>
          <span class="result-id">${p.id ? `#${escapeHtml(p.id)}` : ""}</span>
        </div>
        <div class="result-message">${escapeHtml(p.message || "")}</div>
        <div class="result-location">${fmt(p.location?.lat)}, ${fmt(p.location?.lon)}</div>
        <div class="actions result-actions"></div>
      </div>`;
    results.appendChild(div);

    const isSeedPost = p.id && SEED_POST_IDS.has(p.id);
    const actions = div.querySelector(".actions");

    if (p.id && !isSeedPost) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.marginTop = "6px";
      delBtn.addEventListener("click", () => {
        const res = MockAPI.deletePost(p.id);
        if (!res.ok) { alert("Delete failed: " + res.text); return; }
        if (div.parentNode) div.parentNode.removeChild(div);
        viewportSearch();
      });
      actions.appendChild(delBtn);
    } else if (isSeedPost) {
      const lockText = document.createElement("span");
      lockText.textContent = "Seed data";
      lockText.style.fontSize = "12px";
      lockText.style.color = "#8a97a8";
      actions.appendChild(lockText);
    }
  });
}

// ===== Init =====
renderAuthState();

if (btnJumpCompose) {
  btnJumpCompose.addEventListener("click", () => {
    const composeCard = document.getElementById("compose-card");
    if (composeCard) composeCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (btnJumpFeed) {
  btnJumpFeed.addEventListener("click", () => {
    const feedCard = document.getElementById("feed-card");
    if (feedCard) feedCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("map") && typeof initMap === "function") {
    try {
      initMap();
      renderResults(DB.posts.slice(0, 12));
      renderOnMap(DB.posts, true);
    } catch (e) {
      console.error("Map init error:", e);
    }
  }
});