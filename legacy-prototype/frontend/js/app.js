const tok = () => localStorage.getItem('token');
const me = () => JSON.parse(localStorage.getItem('user') || 'null');
async function api(path, opts = {}) {
  const h = opts.headers || {};
  if (tok()) h.Authorization = 'Bearer ' + tok();
  if (opts.body && !(opts.body instanceof FormData)) { h['Content-Type'] = 'application/json'; opts.body = JSON.stringify(opts.body); }
  const r = await fetch('/api' + path, { ...opts, headers: h });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.detail || 'Request failed');
  return d;
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = d => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
function guard(role) { const u = me(); if (!u || (role && u.role !== role)) location = '/login.html'; return u; }
function logout() { localStorage.clear(); location = '/'; }
function showMsg(id, text, ok) { const el = document.getElementById(id); el.className = 'msg' + (ok ? ' ok' : ''); el.textContent = text; }
async function downloadDoc(id, name) {
  const r = await fetch('/api/documents/' + id + '/download', { headers: { Authorization: 'Bearer ' + tok() } });
  const a = document.createElement('a'); a.href = URL.createObjectURL(await r.blob()); a.download = name; a.click();
}
function eventCard(e) {
  const left = e.capacity - e.registered;
  return `<div class="card"><span class="tag">${esc(e.category)}</span><h3>${esc(e.title)}</h3>
    <div class="muted">📅 ${fmt(e.event_date)}<br>📍 ${esc(e.venue)}<br>🎟 ${left > 0 ? left + ' seats left' : 'Full'}</div>
    <p><a class="btn sm" href="/event.html?id=${e.id}">View details</a></p></div>`;
}
function initLayout() {
  const u = me();
  document.body.insertAdjacentHTML('afterbegin', `<div class="nav"><a class="brand" href="/">College Events</a><div class="links">
    <a href="/">Home</a><a href="/events.html">Events</a>
    ${u ? `<a href="${u.role === 'admin' ? '/admin.html' : '/dashboard.html'}">${u.role === 'admin' ? 'Admin' : 'Dashboard'}</a><a href="#" onclick="logout()">Logout (${esc(u.name.split(' ')[0])})</a>`
        : `<a href="/login.html">Login</a><a href="/register.html">Register</a>`}</div></div>`);
  document.body.insertAdjacentHTML('beforeend', `<footer>© College Event Management System · Final Year Project</footer>
    <button id="chat-btn" title="Event assistant">💬</button>
    <div id="chat-box"><header>Event Assistant</header><div id="chat-log"><div class="b bot">Hi! Ask me about upcoming events, registration or documents.</div></div>
    <form id="chat-form"><input id="chat-in" placeholder="Type your question..." autocomplete="off"><button class="btn sm">Send</button></form></div>`);
  const box = document.getElementById('chat-box'), log = document.getElementById('chat-log');
  document.getElementById('chat-btn').onclick = () => box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
  document.getElementById('chat-form').onsubmit = async ev => {
    ev.preventDefault();
    const i = document.getElementById('chat-in'), text = i.value.trim(); if (!text) return;
    log.insertAdjacentHTML('beforeend', `<div class="b me">${esc(text)}</div>`); i.value = '';
    try { const r = await api('/chat', { method: 'POST', body: { message: text } }); log.insertAdjacentHTML('beforeend', `<div class="b bot">${esc(r.reply)}</div>`); }
    catch (e) { log.insertAdjacentHTML('beforeend', `<div class="b bot">Sorry, something went wrong.</div>`); }
    log.scrollTop = log.scrollHeight;
  };
}
async function authSubmit(ev, path) {
  ev.preventDefault();
  const body = Object.fromEntries(new FormData(ev.target));
  try {
    const r = await api(path, { method: 'POST', body });
    localStorage.setItem('token', r.token); localStorage.setItem('user', JSON.stringify(r.user));
    location = r.user.role === 'admin' ? '/admin.html' : '/dashboard.html';
  } catch (e) { showMsg('err', e.message); }
}
