/* ═══════════════════════════════════════════
   Y2KSt0re — app.js
   All JavaScript extracted from index.html
═══════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   EmailJS Init
────────────────────────────────────────── */
(function () {
  if (typeof emailjs !== 'undefined') {
    emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
  }
})();

/* ──────────────────────────────────────────
   Local Storage Helpers
────────────────────────────────────────── */
function getUsers() {
  const users = localStorage.getItem('y2k_users');
  return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
  localStorage.setItem('y2k_users', JSON.stringify(users));
}

/* ──────────────────────────────────────────
   Email
────────────────────────────────────────── */
async function sendWelcomeEmail(username, email) {
  try {
    const templateParams = {
      to_email:  email,
      to_name:   username,
      from_name: 'Y2K Store Team',
      message:   `Hi ${username}!\n\nThanks for signing up on Y2K Store!`,
    };
    await emailjs.send('service_4pepgpf', 'YOUR_TEMPLATE_ID', templateParams);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

/* ──────────────────────────────────────────
   Toast Notifications
────────────────────────────────────────── */
function showError(message) {
  const el = document.getElementById('errorMsg');
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function showSuccess(message) {
  const el = document.getElementById('successMsg');
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

/* ──────────────────────────────────────────
   Auth Form Switching
────────────────────────────────────────── */
function switchToSignup() {
  document.getElementById('loginForm').style.display  = 'none';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('authTitle').textContent    = 'Create Account';
  document.getElementById('authSubtitle').textContent = 'Join Y2KSt0re community';
}

function switchToLogin() {
  document.getElementById('loginForm').style.display  = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('authTitle').textContent    = 'Welcome Back';
  document.getElementById('authSubtitle').textContent = 'Sign in to your account';
}

/* ──────────────────────────────────────────
   Sign Up
────────────────────────────────────────── */
async function handleSignup() {
  const username        = document.getElementById('signupUsername').value.trim();
  const email           = document.getElementById('signupEmail').value.trim();
  const password        = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const signupBtn       = document.getElementById('signupBtn');

  if (!username || !email || !password || !confirmPassword) { showError('Please fill in all fields'); return; }
  if (username.length < 3)                                  { showError('Username must be at least 3 characters'); return; }
  if (!/^[a-zA-Z0-9_]+$/.test(username))                   { showError('Username can only contain letters, numbers, and underscores'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))           { showError('Please enter a valid email address'); return; }
  if (password.length < 6)                                  { showError('Password must be at least 6 characters'); return; }
  if (password !== confirmPassword)                         { showError('Passwords do not match'); return; }

  const users = getUsers();
  if (users[username])                                      { showError('Username already taken'); return; }
  for (const user in users) {
    if (users[user].email === email) { showError('Email already registered'); return; }
  }

  signupBtn.disabled     = true;
  signupBtn.textContent  = 'Creating Account...';

  users[username] = { password, email, createdAt: new Date().toISOString() };
  saveUsers(users);
  showSuccess('Account created! Sending welcome email...');

  const emailSent = await sendWelcomeEmail(username, email);
  showSuccess(emailSent ? 'Welcome email sent! Check your inbox 📧' : 'Account created successfully!');

  setTimeout(() => {
    loginUser(username);
    signupBtn.disabled    = false;
    signupBtn.textContent = 'Create Account';
  }, 2000);
}

/* ──────────────────────────────────────────
   Sign In
────────────────────────────────────────── */
function handleLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!username || !password) { showError('Please enter username and password'); return; }
  const users = getUsers();
  if (users[username] && users[username].password === password) {
    loginUser(username);
  } else {
    showError('Invalid username or password');
  }
}

/* ──────────────────────────────────────────
   Session Management
────────────────────────────────────────── */
function loginUser(username) {
  localStorage.setItem('y2k_logged_in', 'true');
  localStorage.setItem('y2k_username',  username);
  localStorage.setItem('y2k_login_time', new Date().toISOString());
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display   = 'block';
  updateUserDisplay(username);
  checkHome();
}

function updateUserDisplay(username) {
  document.getElementById('usernameDisplay').textContent = username;
  document.getElementById('userIcon').textContent        = username.charAt(0).toUpperCase();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) {
    document.getElementById('userInfoSection').style.display = 'flex';
    document.getElementById('logoutButton').style.display    = 'block';
  }
}

function confirmLogout() {
  if (confirm('Are you sure you want to logout?')) handleLogout();
}

function handleLogout() {
  localStorage.removeItem('y2k_logged_in');
  localStorage.removeItem('y2k_username');
  localStorage.removeItem('y2k_login_time');
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('appScreen').style.display   = 'none';
  switchToLogin();
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

function checkLoginState() {
  const isLoggedIn   = localStorage.getItem('y2k_logged_in');
  const username     = localStorage.getItem('y2k_username');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isStandalone) {
    if (isLoggedIn === 'true' && username) {
      const users = getUsers();
      if (users[username]) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display   = 'block';
        updateUserDisplay(username);
        checkHome();
      } else {
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('appScreen').style.display   = 'none';
      }
    } else {
      document.getElementById('loginScreen').style.display = 'block';
      document.getElementById('appScreen').style.display   = 'none';
    }
  } else {
    // Browser (non-PWA): hide login, show app but show "Add to Home Screen" prompt
    document.getElementById('userInfoSection').style.display = 'none';
    document.getElementById('logoutButton').style.display    = 'none';
    document.getElementById('loginScreen').style.display     = 'none';
    document.getElementById('appScreen').style.display       = 'block';
    document.getElementById('msg').style.display             = 'block';
    document.getElementById('content').style.display         = 'none';
    document.getElementById('nav').style.display             = 'none';
  }
}

/* ──────────────────────────────────────────
   PWA Home-Screen Detection
────────────────────────────────────────── */
function checkHome() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) {
    document.getElementById('msg').style.display     = 'none';
    document.getElementById('content').style.display = 'block';
    document.getElementById('nav').style.display     = 'flex';
  } else {
    document.getElementById('msg').style.display     = 'block';
    document.getElementById('content').style.display = 'none';
    document.getElementById('nav').style.display     = 'none';
  }
}

document.addEventListener('visibilitychange', checkHome);

/* ──────────────────────────────────────────
   Installs Tab Switcher
────────────────────────────────────────── */
function sw(i) {
  document.querySelectorAll('.tab').forEach((t, x) => t.className = x === i ? 'tab active' : 'tab');
  document.querySelectorAll('.cnt').forEach((c, x) => c.className = x === i ? 'cnt active' : 'cnt');
}

/* ──────────────────────────────────────────
   Bottom Nav Page Switcher
────────────────────────────────────────── */
function showNav(page) {
  event.preventDefault();
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const pages = ['installs', 'certs', 'signer', 'ipainstaller', 'generator'];
  const ids   = {
    installs:    'installsPage',
    certs:       'certsPage',
    signer:      'signerPage',
    ipainstaller:'ipaInstallerPage',
    generator:   'generatorPage',
  };

  pages.forEach(p => {
    const el = document.getElementById(ids[p]);
    if (el) el.style.display = p === page ? 'block' : 'none';
  });
}

/* ──────────────────────────────────────────
   Obfuscator — Status Helper
────────────────────────────────────────── */
function setStatus(msg, color) {
  const el = document.getElementById('obfStatus');
  if (!el) return;
  el.style.display     = 'block';
  el.style.color       = color || '#667eea';
  el.style.borderColor = (color || '#667eea') + '55';
  el.textContent       = msg;
}

/* ──────────────────────────────────────────
   Obfuscator — Random Variable Name Generator
────────────────────────────────────────── */
function rv(n) {
  const L = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const A = L + '0123456789_';
  let s   = L[Math.floor(Math.random() * L.length)];
  for (let i = 1; i < n; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

/* ──────────────────────────────────────────
   Obfuscator — Core Logic
   Method: base64-encode the script, embed a
   pure Lua 5.1 base64 decoder, then loadstring
   the decoded result. Zero encoding issues on
   any Roblox executor.
────────────────────────────────────────── */
function obfuscateLua() {
  const input = document.getElementById('luaInput').value.trim();
  if (!input) { setStatus('❌ Paste a Lua script first', '#f87171'); return; }

  const btn = document.getElementById('obfBtn');
  btn.disabled    = true;
  btn.textContent = '⏳ Obfuscating...';
  document.getElementById('outputCard').style.display = 'none';
  setStatus('🔒 Obfuscating...', '#667eea');

  setTimeout(() => {
    try {
      // Base64-encode the raw script
      const b64 = btoa(unescape(encodeURIComponent(input)));

      // Randomise variable names so every output is unique
      const vData = rv(12), vAlph = rv(11), vRes = rv(11), vBuf = rv(10);
      const vI    = rv(7),  vB    = rv(7),  vC1  = rv(7),  vC2  = rv(7);
      const vC3   = rv(7),  vC4   = rv(7),  vN   = rv(8),  vFn  = rv(11);
      const vErr  = rv(11);

      // Pure Lua 5.1 base64 decoder
      const decoder = [
        `local ${vData}="${b64}"`,
        `local ${vAlph}="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"`,
        `local ${vRes}=""`,
        `local ${vBuf}=0`,
        `local ${vN}=0`,
        `for ${vI}=1,#${vData} do`,
        `  local ${vB}=string.byte(${vData},${vI})`,
        `  local ${vC1}`,
        `  if ${vB}>=65 and ${vB}<=90 then ${vC1}=${vB}-65`,
        `  elseif ${vB}>=97 and ${vB}<=122 then ${vC1}=${vB}-71`,
        `  elseif ${vB}>=48 and ${vB}<=57 then ${vC1}=${vB}+4`,
        `  elseif ${vB}==43 then ${vC1}=62`,
        `  elseif ${vB}==47 then ${vC1}=63`,
        `  else ${vC1}=nil end`,
        `  if ${vC1} then`,
        `    ${vBuf}=${vBuf}*64+${vC1}`,
        `    ${vN}=${vN}+1`,
        `    if ${vN}==4 then`,
        `      local ${vC2}=math.floor(${vBuf}/65536)%256`,
        `      local ${vC3}=math.floor(${vBuf}/256)%256`,
        `      local ${vC4}=${vBuf}%256`,
        `      ${vRes}=${vRes}..string.char(${vC2},${vC3},${vC4})`,
        `      ${vBuf}=0 ${vN}=0`,
        `    end`,
        `  end`,
        `end`,
        `if ${vN}==3 then`,
        `  local ${vC2}=math.floor(${vBuf}/1024)%256`,
        `  local ${vC3}=math.floor(${vBuf}/4)%256`,
        `  ${vRes}=${vRes}..string.char(${vC2},${vC3})`,
        `elseif ${vN}==2 then`,
        `  ${vRes}=${vRes}..string.char(math.floor(${vBuf}/16)%256)`,
        `end`,
        `local ${vFn},${vErr}=loadstring(${vRes})`,
        `if ${vFn} then ${vFn}()`,
        `else warn("[Y2K] "..tostring(${vErr})) end`,
      ].join('\n');

      const output = `-- Y2K Obfuscator | discord.gg/Y4CEpSqTYb\ndo\n${decoder}\nend`;

      document.getElementById('luaOutput').value       = output;
      document.getElementById('outputCard').style.display = 'block';
      document.getElementById('origSize').textContent  = input.length;
      document.getElementById('obfSize').textContent   = output.length;
      document.getElementById('sizeIncrease').textContent =
        '(+' + (((output.length - input.length) / input.length) * 100).toFixed(0) + '%)';
      document.getElementById('outputCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setStatus('✅ Done — paste into your executor', '#4ade80');

    } catch (err) {
      console.error(err);
      setStatus('❌ ' + err.message, '#f87171');
    } finally {
      btn.disabled    = false;
      btn.textContent = '🔒 Obfuscate';
    }
  }, 20);
}

/* ──────────────────────────────────────────
   Clipboard Helpers
────────────────────────────────────────── */
function copyObfuscated() {
  const output = document.getElementById('luaOutput');
  output.select();
  document.execCommand('copy');

  const btn          = event.target;
  const originalText = btn.textContent;
  btn.textContent    = '✅ Copied!';
  btn.style.background   = 'rgba(34,197,94,0.2)';
  btn.style.borderColor  = 'rgba(34,197,94,0.3)';
  btn.style.color        = '#4ade80';
  setTimeout(() => {
    btn.textContent       = originalText;
    btn.style.background  = '';
    btn.style.borderColor = '';
    btn.style.color       = '';
  }, 2000);
}

function copySource(url, btn) {
  navigator.clipboard.writeText(url).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
  const orig = btn.textContent;
  btn.textContent = '✅';
  btn.style.color = '#4ade80';
  setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000);
}

function copyModalScript() {
  const content = document.getElementById('modalScriptContent').textContent;
  navigator.clipboard.writeText(content).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = content;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
  const btn = event.target;
  const orig = btn.textContent;
  btn.textContent = '✅ Copied!';
  setTimeout(() => { btn.textContent = orig; }, 2000);
}

/* ──────────────────────────────────────────
   Script Search (ScriptBlox API)
────────────────────────────────────────── */
let currentScripts = [];
let currentFilter  = 'all';

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  displayScripts();
}

function handleSearchKeyPress(e) {
  if (e.key === 'Enter') searchScripts();
}

async function searchScripts() {
  const query      = document.getElementById('searchInput').value.trim();
  const resultsDiv = document.getElementById('scriptsResults');

  if (!query) {
    resultsDiv.innerHTML = `<div class="no-results"><div class="no-results-icon">⚠️</div><h3 style="color:#667eea;margin-bottom:8px">Enter a search query</h3><p>Please type a game name or script type</p></div>`;
    return;
  }

  resultsDiv.innerHTML = '<div class="loading-spinner">🔍 Searching ScriptBlox...</div>';

  try {
    const response = await fetch(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&max=50`);
    if (!response.ok) throw new Error('Failed to fetch scripts');
    const data = await response.json();

    if (data.result && data.result.scripts && data.result.scripts.length > 0) {
      currentScripts = data.result.scripts;
      displayScripts();
    } else {
      resultsDiv.innerHTML = `<div class="no-results"><div class="no-results-icon">😔</div><h3 style="color:#667eea;margin-bottom:8px">No scripts found</h3><p>Try searching for a different game or script type</p></div>`;
    }
  } catch (error) {
    resultsDiv.innerHTML = `<div class="no-results"><div class="no-results-icon">❌</div><h3 style="color:#f87171;margin-bottom:8px">Error</h3><p>Failed to search scripts. Please try again.</p></div>`;
  }
}

function displayScripts() {
  const resultsDiv = document.getElementById('scriptsResults');
  let filtered = currentScripts;

  if (currentFilter === 'free')      filtered = currentScripts.filter(s => !s.key && !s.keyLink);
  else if (currentFilter === 'paid') filtered = currentScripts.filter(s => s.key || s.keyLink);
  else if (currentFilter === 'universal') filtered = currentScripts.filter(s =>
    s.isUniversal || s.game?.name?.toLowerCase().includes('universal')
  );

  if (filtered.length === 0) {
    resultsDiv.innerHTML = `<div class="no-results"><div class="no-results-icon">📭</div><h3 style="color:#667eea;margin-bottom:8px">No scripts match filter</h3><p>Try changing the filter or search term</p></div>`;
    return;
  }

  let html = '';
  filtered.forEach(script => {
    const title      = script.title || 'Untitled Script';
    const game       = script.game?.name || 'Unknown Game';
    const views      = script.views || 0;
    const verified   = script.verified ? '✓' : '';
    const scriptSlug = script.slug || '';
    html += `
      <div class="script-card">
        <div class="script-header">
          <div>
            <div class="script-title">${escapeHtml(title)} ${verified}</div>
            <div class="script-game">🎮 ${escapeHtml(game)}</div>
          </div>
        </div>
        <div class="script-stats">
          <div class="script-stat">👁️ ${formatNumber(views)}</div>
          ${script.key || script.keyLink ? '<div class="script-stat">🔑 Key Required</div>' : '<div class="script-stat">✅ Free</div>'}
          ${script.isUniversal ? '<div class="script-stat">🌍 Universal</div>' : ''}
        </div>
        <button class="script-btn copy-script-btn" onclick="viewScript('${scriptSlug}')">👁️ View Script</button>
      </div>`;
  });

  resultsDiv.innerHTML = html;
}

async function viewScript(slug) {
  const script = currentScripts.find(s => s.slug === slug);
  if (!script) { alert('Script not found'); return; }

  const modal = document.getElementById('scriptModal');
  document.getElementById('modalScriptTitle').textContent   = script.title || 'Untitled Script';
  document.getElementById('modalScriptGame').textContent    = '🎮 ' + (script.game?.name || 'Unknown Game');
  document.getElementById('modalScriptContent').textContent = 'Loading script...';
  modal.style.display = 'block';

  try {
    const response = await fetch(`https://scriptblox.com/api/script/${slug}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    document.getElementById('modalScriptContent').textContent = data.script?.script || 'Script content not available.';
  } catch (error) {
    document.getElementById('modalScriptContent').textContent = `Failed to load script.\n\nError: ${error.message}`;
  }
}

function closeScriptModal()            { document.getElementById('scriptModal').style.display = 'none'; }
function closeModalOnOutsideClick(e)   { if (e.target.id === 'scriptModal') closeScriptModal(); }

/* ──────────────────────────────────────────
   Utility Formatters
────────────────────────────────────────── */
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000)    return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ──────────────────────────────────────────
   IPA Installer (ipa.s0n1c.ca)
────────────────────────────────────────── */
const IPA_BASE    = 'https://ipa.s0n1c.ca';
let currentIpaId  = null;

function ipaSetStatus(msg, color) {
  const el = document.getElementById('ipaStatus');
  if (!el) return;
  el.style.display     = 'block';
  el.style.color       = color || '#667eea';
  el.style.borderColor = (color || '#667eea') + '55';
  el.textContent       = msg;
}

async function ipaLookup() {
  const url = document.getElementById('ipaUrlInput').value.trim();
  if (!url)                    { ipaSetStatus('❌ Please enter an IPA URL', '#f87171'); return; }
  if (!url.startsWith('http')) { ipaSetStatus('❌ URL must start with https://', '#f87171'); return; }

  const btn = document.getElementById('ipaLookupBtn');
  btn.disabled    = true;
  btn.textContent = '⏳ Loading...';
  document.getElementById('ipaInfoCard').style.display = 'none';
  ipaSetStatus('🔍 Fetching IPA info...', '#667eea');

  try {
    const res = await fetch(IPA_BASE + '/preflight', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error('Server error ' + res.status + ': ' + await res.text());
    const data = await res.json();
    if (!data.id) throw new Error('No ID returned from server');
    currentIpaId = data.id;

    ipaSetStatus('📦 Getting app details...', '#667eea');
    const infoRes = await fetch(IPA_BASE + '/' + currentIpaId + '/info');
    if (!infoRes.ok) throw new Error('Info fetch failed: ' + infoRes.status);
    const info = await infoRes.json();

    document.getElementById('ipaAppName').textContent    = info.name    || info.CFBundleName    || 'Unknown App';
    document.getElementById('ipaAppVersion').textContent = 'v' + (info.version || info.CFBundleShortVersionString || '?') + ' (' + (info.build || info.CFBundleVersion || '?') + ')';
    document.getElementById('ipaAppBundle').textContent  = info.bundleId || info.CFBundleIdentifier || '';

    if (info.size) {
      document.getElementById('ipaAppSize').textContent = '📁 Size: ' + (info.size / 1024 / 1024).toFixed(1) + ' MB';
    }

    const iconUrl     = IPA_BASE + '/' + currentIpaId + '/icon.png';
    const icon        = document.getElementById('ipaIcon');
    const placeholder = document.getElementById('ipaIconPlaceholder');
    icon.onload  = () => { icon.style.display = 'block'; placeholder.style.display = 'none'; };
    icon.onerror = () => { icon.style.display = 'none';  placeholder.style.display = 'flex'; };
    icon.src     = iconUrl;

    document.getElementById('ipaInfoCard').style.display = 'block';
    ipaSetStatus('✅ App loaded! Tap Install to continue.', '#4ade80');

  } catch (err) {
    console.error(err);
    ipaSetStatus('❌ ' + err.message, '#f87171');
  } finally {
    btn.disabled    = false;
    btn.textContent = '🔍 Look Up IPA';
  }
}

function ipaInstall() {
  if (!currentIpaId) { ipaSetStatus('❌ No IPA loaded', '#f87171'); return; }
  window.location.href = IPA_BASE + '/' + currentIpaId + '/install';
}

/* ──────────────────────────────────────────
   DOMContentLoaded — Bootstrap
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  // Check auth / PWA state
  checkLoginState();

  // Enter-key shortcuts
  document.getElementById('loginPassword')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('signupConfirmPassword')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSignup();
  });

  // ── Mobile textarea fix ──────────────────
  // Minimal, targeted approach:
  //   • Set safe attributes (autocorrect off, no spellcheck)
  //   • stopPropagation on touch events so parent cards don't steal focus
  //   • Explicit .focus() on touchend — critical for iOS Safari PWA
  const luaInput  = document.getElementById('luaInput');
  const luaOutput = document.getElementById('luaOutput');

  [luaInput, luaOutput].forEach(function (el) {
    if (!el) return;
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'none');
    el.setAttribute('spellcheck', 'false');

    el.addEventListener('touchstart', function (e) {
      e.stopPropagation();
    }, { passive: true });

    el.addEventListener('touchend', function (e) {
      e.stopPropagation();
      this.focus();
    }, { passive: true });
  });
});
