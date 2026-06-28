// OctaneFlow DSR Reviewer Logic

let allPendingData = [];
let currentMonth = 'november';

const MONTH_MAP = {
  'november': { name: 'November 2025', year: 2025, index: 11 },
  'december': { name: 'December 2025', year: 2025, index: 12 },
  'january':  { name: 'January 2026',  year: 2026, index: 1  },
  'february': { name: 'February 2026', year: 2026, index: 2  },
  'march':    { name: 'March 2026',    year: 2026, index: 3  },
  'april':    { name: 'April 2026',    year: 2026, index: 4  },
  'may':      { name: 'May 2026',      year: 2026, index: 5  },
  'june':     { name: 'June 2026',     year: 2026, index: 6  }
};

// ─── Helpers ────────────────────────────────────────────────
const ok  = v => v !== null && v !== undefined && !isNaN(Number(v));
const fmt = v => ok(v) ? Number(v).toFixed(2) : '—';
const fmtL = v => ok(v) ? Number(v).toFixed(1) + ' L' : '—';

// ─── Boot ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (typeof DSR_DRAFT_DATA !== 'undefined' && DSR_DRAFT_DATA.daily_ledger) {
    loadDSRData(DSR_DRAFT_DATA);
  } else {
    showImportScreen();
  }

  document.getElementById('json-file-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) readJSONFile(file);
  });

  document.addEventListener('dragover', e => {
    e.preventDefault();
    document.getElementById('drop-overlay').style.display = 'flex';
  });
  document.addEventListener('dragleave', e => {
    if (!e.relatedTarget) document.getElementById('drop-overlay').style.display = 'none';
  });
  document.addEventListener('drop', e => {
    e.preventDefault();
    document.getElementById('drop-overlay').style.display = 'none';
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) readJSONFile(file);
    else showImportError('Please drop a .json file.');
  });
});

function loadDSRData(data) {
  allPendingData = data.daily_ledger || [];
  document.getElementById('import-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  document.getElementById('loaded-filename').textContent = allPendingData.length + ' records loaded';
  selectMonth('november');
}

function showImportScreen() {
  document.getElementById('import-screen').style.display = 'flex';
  document.getElementById('main-app').style.display = 'none';
}

function showImportError(msg) {
  const el = document.getElementById('import-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function readJSONFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.daily_ledger) throw new Error('Missing daily_ledger key');
      loadDSRData(data);
    } catch (err) {
      showImportError('Invalid JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ─── Navigation ─────────────────────────────────────────────
function selectMonth(monthKey) {
  currentMonth = monthKey;
  document.querySelectorAll('.sidebar .nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.querySelector('.sidebar [data-month="' + monthKey + '"]');
  if (activeNav) activeNav.classList.add('active');
  renderMonth();
}

function getMonthData(monthKey) {
  const meta = MONTH_MAP[monthKey];
  if (!meta) return [];
  const prefix = meta.year + '-' + String(meta.index).padStart(2, '0');
  return allPendingData.filter(row => row.date && row.date.startsWith(prefix));
}

// ─── Render ──────────────────────────────────────────────────
function renderMonth() {
  const meta = MONTH_MAP[currentMonth];
  const data = getMonthData(currentMonth).slice().sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById('summary-month-name').textContent  = meta.name;
  document.getElementById('summary-total-days').textContent  = data.length + ' days loaded';

  const tbody = document.getElementById('review-table-body');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:var(--text-dim);padding:3rem;">No DSR data for this month.</td></tr>';
    updateSummaryCards(0, 0, []);
    return;
  }

  const issues = validateData(data);
  let petrolTotal = 0;
  let dieselTotal = 0;

  data.forEach((row, idx) => {
    const prev = idx > 0 ? data[idx - 1] : null;

    // ── Petrol ──
    const p1o = row.du1_p.open,      p1c = row.du1_p.close_day;
    const p2o = row.du2_p.open,      p2c = row.du2_p.close_day;
    const pt  = ((row.du1_p.tests_day || 0) + (row.du2_p.tests_day || 0)) * 5;
    const pOK = ok(p1o) && ok(p1c) && ok(p2o) && ok(p2c);
    const pSales = pOK ? Math.max(0, (p1c - p1o) + (p2c - p2o) - pt) : null;
    if (pSales !== null) petrolTotal += pSales;

    // ── Diesel ──
    const d1o = row.du1_d.open,      d1c = row.du1_d.close_day;
    const d2o = row.du2_d.open,      d2c = row.du2_d.close_day;
    const dt  = ((row.du1_d.tests_day || 0) + (row.du2_d.tests_day || 0)) * 5;
    const dOK = ok(d1o) && ok(d1c) && ok(d2o) && ok(d2c);
    const dSales = dOK ? Math.max(0, (d1c - d1o) + (d2c - d2o) - dt) : null;
    if (dSales !== null) dieselTotal += dSales;

    // ── Continuity ──
    const p1Err = prev && ok(p1o) && ok(prev.du1_p.close_day) && Math.abs(p1o - prev.du1_p.close_day) > 0.01;
    const p2Err = prev && ok(p2o) && ok(prev.du2_p.close_day) && Math.abs(p2o - prev.du2_p.close_day) > 0.01;
    const d1Err = prev && ok(d1o) && ok(prev.du1_d.close_day) && Math.abs(d1o - prev.du1_d.close_day) > 0.01;
    const d2Err = prev && ok(d2o) && ok(prev.du2_d.close_day) && Math.abs(d2o - prev.du2_d.close_day) > 0.01;

    const missing = !pOK || !dOK;
    const hasErr  = !missing && (p1Err || p2Err || d1Err || d2Err ||
      (ok(p1c) && ok(p1o) && p1c < p1o) || (ok(p2c) && ok(p2o) && p2c < p2o) ||
      (ok(d1c) && ok(d1o) && d1c < d1o) || (ok(d2c) && ok(d2o) && d2c < d2o));

    // ── Status badge ──
    let badge;
    if (missing)      badge = '<span class="validation-badge" style="background:rgba(100,116,139,.15);color:#94a3b8;border:1px solid rgba(100,116,139,.3);">📋 Missing</span>';
    else if (hasErr)  badge = '<span class="validation-badge warning">⚠️ Warning</span>';
    else              badge = '<span class="validation-badge success">✅ Clean</span>';

    const tr = document.createElement('tr');
    if (hasErr)   tr.style.background = 'rgba(239,68,68,.04)';
    if (missing)  tr.style.background = 'rgba(100,116,139,.06)';
    tr.style.transition = 'background .15s';
    tr.addEventListener('mouseenter', () => { if (!tr.dataset.bg) tr.dataset.bg = tr.style.background; tr.style.background = 'rgba(255,255,255,.04)'; });
    tr.addEventListener('mouseleave', () => { tr.style.background = tr.dataset.bg || ''; });

    const d = row.date;
    tr.innerHTML =
      '<td class="sticky-col-left" style="font-weight:700;font-size:.82rem;white-space:nowrap;color:#e2e8f0;letter-spacing:.3px;">' + d + '</td>' +

      // Petrol
      '<td class="col-petrol"><span class="editable-cell ' + (p1Err ? 'diff-highlight' : '') + '" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du1_p\',\'open\',this.textContent)">'      + fmt(p1o) + '</span></td>' +
      '<td class="col-petrol"><span class="editable-cell" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du1_p\',\'close_day\',this.textContent)">'                                            + fmt(p1c) + '</span></td>' +
      '<td class="col-petrol"><span class="editable-cell ' + (p2Err ? 'diff-highlight' : '') + '" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du2_p\',\'open\',this.textContent)">'      + fmt(p2o) + '</span></td>' +
      '<td class="col-petrol"><span class="editable-cell" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du2_p\',\'close_day\',this.textContent)">'                                            + fmt(p2c) + '</span></td>' +
      '<td class="col-petrol" style="font-size:.75rem;color:var(--text-dim);text-align:right;">'                                                                                                          + pt + ' L</td>' +
      '<td class="col-petrol bg-petrol-group" style="text-align:right;font-weight:700;">'                                                                                                                 + fmtL(pSales) + '</td>' +

      // Diesel
      '<td class="col-diesel"><span class="editable-cell ' + (d1Err ? 'diff-highlight' : '') + '" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du1_d\',\'open\',this.textContent)">'      + fmt(d1o) + '</span></td>' +
      '<td class="col-diesel"><span class="editable-cell" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du1_d\',\'close_day\',this.textContent)">'                                            + fmt(d1c) + '</span></td>' +
      '<td class="col-diesel"><span class="editable-cell ' + (d2Err ? 'diff-highlight' : '') + '" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du2_d\',\'open\',this.textContent)">'      + fmt(d2o) + '</span></td>' +
      '<td class="col-diesel"><span class="editable-cell" contenteditable="true" onblur="updateCell(\'' + d + '\',\'du2_d\',\'close_day\',this.textContent)">'                                            + fmt(d2c) + '</span></td>' +
      '<td class="col-diesel" style="font-size:.75rem;color:var(--text-dim);text-align:right;">'                                                                                                          + dt + ' L</td>' +
      '<td class="col-diesel bg-diesel-group" style="text-align:right;font-weight:700;">'                                                                                                                 + fmtL(dSales) + '</td>' +

      // Status
      '<td class="sticky-col-right" style="text-align:center;">' + badge + '</td>';

    tbody.appendChild(tr);
  });

  updateSummaryCards(petrolTotal, dieselTotal, issues);
}

// ─── Cell edit ──────────────────────────────────────────────
function updateCell(date, unitKey, fieldKey, rawValue) {
  const num = parseFloat(rawValue.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) { renderMonth(); return; }
  const row = allPendingData.find(r => r.date === date);
  if (row && row[unitKey]) {
    if (row[unitKey][fieldKey] !== num) {
      row[unitKey][fieldKey] = num;
      if (fieldKey === 'close_day') row[unitKey]['close_night'] = num;
      propagateOpeningTotalizers();
      renderMonth();
    }
  }
}

function propagateOpeningTotalizers() {
  allPendingData.sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < allPendingData.length; i++) {
    const prev = allPendingData[i - 1];
    const curr = allPendingData[i];
    if (ok(prev.du1_p.close_day)) curr.du1_p.open = prev.du1_p.close_day;
    if (ok(prev.du2_p.close_day)) curr.du2_p.open = prev.du2_p.close_day;
    if (ok(prev.du1_d.close_day)) curr.du1_d.open = prev.du1_d.close_day;
    if (ok(prev.du2_d.close_day)) curr.du2_d.open = prev.du2_d.close_day;
  }
}

// ─── Validation ─────────────────────────────────────────────
function validateData(data) {
  const issues = [];
  for (let i = 0; i < data.length; i++) {
    const row  = data[i];
    const prev = i > 0 ? data[i - 1] : null;

    const check = (closeV, openV, label) => {
      if (ok(closeV) && ok(openV) && closeV < openV)
        issues.push('[' + row.date + '] ' + label + ' closing (' + fmt(closeV) + ') < opening (' + fmt(openV) + ')');
    };
    check(row.du1_p.close_day, row.du1_p.open, 'Petrol DU1');
    check(row.du2_p.close_day, row.du2_p.open, 'Petrol DU2');
    check(row.du1_d.close_day, row.du1_d.open, 'Diesel DU1');
    check(row.du2_d.close_day, row.du2_d.open, 'Diesel DU2');

    if (prev) {
      const cont = (openV, prevClose, label) => {
        if (ok(openV) && ok(prevClose) && Math.abs(openV - prevClose) > 0.01)
          issues.push('[' + row.date + '] ' + label + ' open (' + fmt(openV) + ') ≠ prev close (' + fmt(prevClose) + ')');
      };
      cont(row.du1_p.open, prev.du1_p.close_day, 'Petrol DU1');
      cont(row.du2_p.open, prev.du2_p.close_day, 'Petrol DU2');
      cont(row.du1_d.open, prev.du1_d.close_day, 'Diesel DU1');
      cont(row.du2_d.open, prev.du2_d.close_day, 'Diesel DU2');
    }
  }
  return issues;
}

// ─── Summary cards ──────────────────────────────────────────
function updateSummaryCards(petrolSales, dieselSales, issues) {
  document.getElementById('summary-petrol-sales').textContent = petrolSales.toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1}) + ' L';
  document.getElementById('summary-diesel-sales').textContent = dieselSales.toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1}) + ' L';

  const statusBadge  = document.getElementById('summary-status-badge');
  const issueCountEl = document.getElementById('summary-issue-count');
  const errorLog     = document.getElementById('validation-error-log');
  const errorList    = document.getElementById('validation-error-list');

  if (issues.length === 0) {
    statusBadge.innerHTML    = '<span class="validation-badge success">✅ All Clean</span>';
    issueCountEl.textContent = '0 mathematical discrepancies';
    errorLog.style.display   = 'none';
  } else {
    statusBadge.innerHTML    = '<span class="validation-badge warning">⚠️ ' + issues.length + ' issues</span>';
    issueCountEl.textContent = issues.length + ' discrepancy errors detected';
    errorList.innerHTML      = '';
    issues.forEach(issue => {
      const li = document.createElement('li');
      li.textContent = issue;
      errorList.appendChild(li);
    });
    errorLog.style.display = 'block';
  }
}

// ─── Export / Merge ─────────────────────────────────────────
function exportJSON() {
  const blob = new Blob([JSON.stringify(allPendingData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'octaneflow_digitized_dsr_' + currentMonth + '.json';
  a.click();
}

function approveAndMerge() {
  const issues = validateData(allPendingData);
  if (issues.length > 0 && !confirm('⚠️ ' + issues.length + ' validation errors remain. Merge anyway?')) return;

  let activeDb = {};
  try { activeDb = JSON.parse(localStorage.getItem('octaneflow_db') || '{}'); } catch {}
  if (!activeDb.daily_ledger) activeDb.daily_ledger = [];

  const newLedger = activeDb.daily_ledger.filter(r => r.date < '2025-11-11');
  allPendingData.forEach(row => {
    const entry = JSON.parse(JSON.stringify(row));
    entry._approved_at = new Date().toISOString();
    newLedger.push(entry);
  });
  newLedger.sort((a, b) => b.date.localeCompare(a.date));
  activeDb.daily_ledger = newLedger;
  localStorage.setItem('octaneflow_db', JSON.stringify(activeDb));

  alert('🎉 Merged ' + allPendingData.length + ' records.\n\nOpen OctaneFlow and click "Restart & Sync".');
  window.location.href = 'index.html';
}
