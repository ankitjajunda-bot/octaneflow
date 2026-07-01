// ── OTP Password Reset Logic ───────────────────────────────
let otpTimerInterval = null;

window.showForgotPasswordModal = function(e) {
  if (e) e.preventDefault();
  const overlay = document.getElementById('otp-reset-overlay');
  if (overlay) overlay.style.display = 'flex';
  
  // Reset elements
  const step1 = document.getElementById('otp-step-1');
  const step2 = document.getElementById('otp-step-2');
  const step3 = document.getElementById('otp-step-3');
  
  if (!step1 || !step2 || !step3) {
    alert("Update Required: Please completely close and reopen the app, or do a Hard Refresh, to use the Password Reset feature.");
    return;
  }
  
  step1.style.display = 'flex';
  step2.style.display = 'none';
  step3.style.display = 'none';
  
  // Clear inputs
  document.getElementById('otp-reset-username').value = '';
  document.getElementById('otp-reset-phone').value = '';
  document.getElementById('otp-input-code').value = '';
  document.getElementById('otp-new-password').value = '';
  document.getElementById('otp-confirm-password').value = '';
  
  // Clear errors
  document.getElementById('otp-error-step1').textContent = '';
  document.getElementById('otp-error-step2').textContent = '';
  document.getElementById('otp-error-step3').textContent = '';
  
  if (otpTimerInterval) clearInterval(otpTimerInterval);
};

window.closeForgotPasswordModal = function() {
  const overlay = document.getElementById('otp-reset-overlay');
  if (overlay) overlay.style.display = 'none';
  if (otpTimerInterval) clearInterval(otpTimerInterval);
};

window.backToStep1 = function() {
  const step1 = document.getElementById('otp-step-1');
  const step2 = document.getElementById('otp-step-2');
  if (step1) step1.style.display = 'flex';
  if (step2) step2.style.display = 'none';
  if (otpTimerInterval) clearInterval(otpTimerInterval);
};

window.sendOtpRequest = function() {
  const username = document.getElementById('otp-reset-username').value.trim();
  const rawPhone = document.getElementById('otp-reset-phone').value.trim();
  const errEl = document.getElementById('otp-error-step1');
  if (errEl) errEl.textContent = '';
  
  if (!username) {
    if (errEl) errEl.textContent = 'Please enter a username.';
    return;
  }
  
  const phone = rawPhone.replace(/[^0-9]/g, '');
  if (phone.length !== 10) {
    if (errEl) errEl.textContent = 'Please enter a valid 10-digit mobile number.';
    return;
  }
  
  const users = getUsers();
  const uname = username.toLowerCase();
  
  // Verification check:
  // If owner, we can send to any phone (since owner might not have registered phone yet in DB)
  // If employee, phone number MUST match the registered phone in db.employees
  if (uname !== 'owner') {
    const emp = (db.employees || []).find(e => e.id === uname || e.name.toLowerCase().includes(uname));
    if (!emp) {
      if (errEl) errEl.textContent = 'Username not found. Contact administrator.';
      return;
    }
    const cleanEmpPhone = emp.phone.replace(/[^0-9]/g, '');
    if (!cleanEmpPhone.endsWith(phone)) {
      if (errEl) errEl.textContent = 'Mobile number does not match registered employee records.';
      return;
    }
  }
  
  // Generate random 6-digit OTP
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = Date.now() + 5 * 60 * 1000; // 5 min expiry
  
  sessionStorage.setItem('reset_otp_code', otpCode);
  sessionStorage.setItem('reset_otp_expiry', expiry);
  sessionStorage.setItem('reset_username', uname);
  
  // Open WhatsApp link to send OTP
  const message = encodeURIComponent(`🚨 RKSK Chandaroon Password Reset Verification OTP: ${otpCode}. Valid for 5 minutes.`);
  window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${message}`, '_blank');
  
  // Switch to Step 2
  const step1 = document.getElementById('otp-step-1');
  const step2 = document.getElementById('otp-step-2');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'flex';
  
  // Start countdown timer
  let secondsLeft = 300;
  const timerEl = document.getElementById('otp-timer');
  if (timerEl) timerEl.textContent = `Time remaining: 05:00`;
  
  if (otpTimerInterval) clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) {
      clearInterval(otpTimerInterval);
      if (timerEl) timerEl.textContent = 'OTP has expired. Please try again.';
      sessionStorage.removeItem('reset_otp_code');
    } else {
      const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
      const secs = String(secondsLeft % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `Time remaining: ${mins}:${secs}`;
    }
  }, 1000);
  
  showNotification('📤 OTP sent via WhatsApp! Check your window/tab.', 'success');
};

window.verifyOtpRequest = function() {
  const enteredCode = document.getElementById('otp-input-code').value.trim();
  const errEl = document.getElementById('otp-error-step2');
  if (errEl) errEl.textContent = '';
  
  const savedCode = sessionStorage.getItem('reset_otp_code');
  const savedExpiry = parseInt(sessionStorage.getItem('reset_otp_expiry') || '0');
  
  if (!savedCode || Date.now() > savedExpiry) {
    if (errEl) errEl.textContent = 'OTP has expired. Please request a new one.';
    return;
  }
  
  if (enteredCode !== savedCode) {
    if (errEl) errEl.textContent = 'Invalid OTP. Please check the code and try again.';
    return;
  }
  
  // Clear OTP from memory after successful check
  if (otpTimerInterval) clearInterval(otpTimerInterval);
  
  // Switch to Step 3
  const step2 = document.getElementById('otp-step-2');
  const step3 = document.getElementById('otp-step-3');
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'flex';
};

window.submitNewPassword = async function() {
  const newPass = document.getElementById('otp-new-password').value;
  const confPass = document.getElementById('otp-confirm-password').value;
  const errEl = document.getElementById('otp-error-step3');
  if (errEl) errEl.textContent = '';
  
  if (newPass.length < 4) {
    if (errEl) errEl.textContent = 'Password must be at least 4 characters.';
    return;
  }
  if (newPass !== confPass) {
    if (errEl) errEl.textContent = 'Passwords do not match.';
    return;
  }
  
  const username = sessionStorage.getItem('reset_username');
  if (!username) {
    if (errEl) errEl.textContent = 'Session error. Please restart.';
    return;
  }
  
  const newHash = await hashString(newPass.trim());
  const users = getUsers();
  
  if (users[username]) {
    users[username].passwordHash = newHash;
    saveUsers(users);
  } else if (username === 'owner') {
    users['owner'] = {
      username: 'owner', displayName: 'Owner', role: 'owner',
      passwordHash: newHash, active: true,
      createdAt: new Date().toISOString()
    };
    saveUsers(users);
  }
  
  showNotification('🔑 Password updated successfully! Log in using your new credentials.', 'success');
  closeForgotPasswordModal();
};

