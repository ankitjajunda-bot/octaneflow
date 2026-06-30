// ── User Store ─────────────────────────────────────────────
function getUsers() {
  let localUsers = {};
  try { localUsers = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '{}'); } catch {}
  
  if (db && db.users) {
    if (Object.keys(db.users).length === 0 && Object.keys(localUsers).length > 0) {
      db.users = localUsers;
      saveDB();
    } else {
      let modified = false;
      for (const k in localUsers) {
        if (!db.users[k]) {
          db.users[k] = localUsers[k];
          modified = true;
        }
      }
      if (modified) saveDB();
    }
    return db.users;
  }
  return localUsers;
}
function saveUsers(u) {
  if (db) {
    db.users = u;
    saveDB();
  }
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(u));
}

// ── Session (sessionStorage — clears on browser close) ─────
function getSession() {
  try { return JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) || 'null'); }
  catch { return null; }
}
function setSession(user) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    username: user.username, displayName: user.displayName,
    role: user.role, loginAt: new Date().toISOString()
  }));
}
function clearSession() { sessionStorage.removeItem(AUTH_SESSION_KEY); }

// ── Create default owner account on first load ─────────────
async function initAuth() {
  const users = getUsers();
  if (!users['owner']) {
    const hash = await hashString('OctaneFlow@2026');
    users['owner'] = {
      username: 'owner', displayName: 'Owner', role: 'owner',
      passwordHash: hash, active: true,
      createdAt: new Date().toISOString()
    };
    saveUsers(users);
  }
}

async function loginUser(username, credential) {
  const users = getUsers();
  const uname = username.toLowerCase().trim();
  let user = users[uname];

  if (!user && uname === 'owner') {
    // Default Owner fallback if not found in db
    const defaultHash = await hashString('OctaneFlow@2026');
    user = {
      username: 'owner',
      displayName: 'Owner',
      role: 'owner',
      passwordHash: defaultHash,
      active: true
    };
  }

  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  if (!user.active) {
    return { success: false, error: 'This account has been deactivated by the administrator.' };
  }

  // Hash the incoming password/PIN to compare
  const incomingHash = await hashString(credential);

  if (user.role === 'owner') {
    const targetHash = user.passwordHash || user.pinHash; // Fallback support
    if (incomingHash !== targetHash) {
      return { success: false, error: 'Incorrect administrator password.' };
    }
  } else {
    // Employee credential check (PIN)
    if (incomingHash !== user.pinHash) {
      return { success: false, error: 'Incorrect employee PIN.' };
    }

    // Strict Device ID check
    const currentDeviceId = getDeviceId();
    if (!user.deviceId || user.deviceId !== currentDeviceId) {
      return { success: false, error: 'DEVICE_NOT_APPROVED', user };
    }
  }

  setSession(user);
  return { success: true, user };
}

// ── Logout ─────────────────────────────────────────────────
function logoutUser() { clearSession(); location.reload(); }

// ── Auth Gate — show login or app shell ────────────────────
function checkAuth() {
  const session   = getSession();
  const loginEl   = document.getElementById('login-overlay');
  const appEl     = document.getElementById('app-container-shell');
  const empEl     = document.getElementById('employee-shell');

  if (!session) {
    if (loginEl) loginEl.style.display = 'flex';
    if (appEl)   appEl.style.display   = 'none';
    if (empEl)   empEl.style.display   = 'none';
    return null;
  }

  if (loginEl) loginEl.style.display = 'none';

  if (session.role === 'owner') {
    if (appEl)  appEl.style.display  = 'flex';
    if (empEl)  empEl.style.display  = 'none';
    const nameEl = document.getElementById('session-user-name');
    if (nameEl) nameEl.textContent = '👑 ' + session.displayName;
    updateApprovalsBadge();
  } else {
    if (appEl)  appEl.style.display  = 'none';
    if (empEl)  empEl.style.display  = 'flex';
    renderEmployeeView(session);
  }
  return session;
}

