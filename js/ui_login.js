// ── Wire login form ────────────────────────────────────────
function initLoginForm() {
  const form    = document.getElementById('login-form');
  const errEl   = document.getElementById('login-error');
  const btnEl   = document.getElementById('login-btn');
  if (!form) return;

  // Pre-fill username from invite link if present
  const invitedUser = localStorage.getItem('octaneflow_invited_user');
  if (invitedUser) {
    const userInp = document.getElementById('login-username');
    if (userInp) userInp.value = invitedUser;
    localStorage.removeItem('octaneflow_invited_user'); // Clean up
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username   = document.getElementById('login-username')?.value || '';
    const credential = document.getElementById('login-password')?.value || '';
    if (errEl) errEl.textContent = '';
    if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Logging in…'; }

    const result = await loginUser(username, credential);

    if (!result.success) {
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'Log In'; }
      if (result.error === 'DEVICE_NOT_APPROVED') {
        showDeviceRequestForm();
        const reqName = document.getElementById('req-emp-name');
        const reqUser = document.getElementById('req-emp-username');
        const reqPhone = document.getElementById('req-emp-phone');
        if (reqName) reqName.value = result.user.displayName || '';
        if (reqUser) reqUser.value = result.user.username || '';
        if (reqPhone) reqPhone.value = result.user.phone || '';
        showNotification('⚠️ This device is not approved yet. Please generate a code and send it to the owner.', 'warning');
      } else {
        if (errEl) errEl.textContent = result.error;
      }
      return;
    }

    if (btnEl) { btnEl.textContent = 'Syncing latest data…'; }
    try {
      await initSync();
    } catch (err) {
      console.warn('[Sync] Failed to pull on login, loading cached database:', err);
    }

    if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'Log In'; }

    checkAuth();
    if (result.user.role === 'owner') {
      initApp();
    }
  });
}

// ── Update approvals badge count ───────────────────────────
function updateApprovalsBadge() {
  const pending = (db.pending_entries || []).filter(e => e.status === 'pending' && e.submission_type !== 'device_registration').length;
  const badge   = document.getElementById('approvals-badge');
  if (badge) {
    badge.textContent    = pending || '';
    badge.style.display  = pending > 0 ? 'inline-flex' : 'none';
  }
  const subBadge = document.getElementById('approvals-badge-sub');
  if (subBadge) {
    subBadge.textContent   = pending || '';
    subBadge.style.display = pending > 0 ? 'inline-flex' : 'none';
  }
}

