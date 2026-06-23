// ============================================================
// WORK EARNINGS TRACKER — tracker.js
// ============================================================
//
// Rates:
//   Thermography .......... $75 fixed per job
//   Thermography Report ... $35 fixed per job
//   Drone ................. $75 fixed per job
//   Other ................. $15 per hour
// ============================================================

const JOB_TYPES = {
  thermography:        { label: 'Thermography',        kind: 'fixed',  rate: 75 },
  thermography_report: { label: 'Thermography Report', kind: 'fixed',  rate: 35 },
  drone:               { label: 'Drone',               kind: 'fixed',  rate: 75 },
  other:               { label: 'Other (hourly)',      kind: 'hourly', rate: 15 }
};

const COMPANY = 'MDZ Building Inspections & Consulting';

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
const PERIOD_DAYS = 14;  // biweekly

let S = {
  worker:      '',
  periodStart: '',       // ISO date (yyyy-mm-dd) — first day of the selected two-week period
  entries:     []        // { id, date, desc, type, qty, hours }
};

function save() {
  try { localStorage.setItem('earnings-tracker', JSON.stringify(S)); } catch (e) {}
}
function load() {
  try {
    const raw = localStorage.getItem('earnings-tracker');
    if (raw) S = Object.assign(S, JSON.parse(raw));
  } catch (e) {}
}

// Draft of the entry currently being entered in the form
let draft = newDraft();
function newDraft() {
  return {
    date:  today(),
    desc:  '',
    type:  'thermography',
    qty:   1,
    hours: ''
  };
}

// ------------------------------------------------------------
// EARNINGS MATH
// ------------------------------------------------------------
function earningsFor(entry) {
  const t = JOB_TYPES[entry.type];
  if (!t) return 0;
  if (t.kind === 'fixed')  return (parseFloat(entry.qty)   || 0) * t.rate;
  return (parseFloat(entry.hours) || 0) * t.rate;
}

function grandTotal(list) {
  return (list || currentEntries()).reduce((sum, e) => sum + earningsFor(e), 0);
}

// "Paid hours" = pay divided by the $15 base rate (applies to fixed-fee jobs too)
const PAID_HOUR_RATE = 15;
function paidHoursFor(entry) { return earningsFor(entry) / PAID_HOUR_RATE; }
function totalPaidHours(list) { return grandTotal(list) / PAID_HOUR_RATE; }

// Per-type breakdown: { type: { label, count/hours, amount } }
function breakdown(list) {
  const entries = list || currentEntries();
  const b = {};
  for (const key in JOB_TYPES) {
    b[key] = { label: JOB_TYPES[key].label, kind: JOB_TYPES[key].kind, units: 0, amount: 0 };
  }
  entries.forEach(e => {
    const t = JOB_TYPES[e.type];
    if (!t) return;
    b[e.type].units  += t.kind === 'fixed' ? (parseFloat(e.qty) || 0) : (parseFloat(e.hours) || 0);
    b[e.type].amount += earningsFor(e);
  });
  return b;
}

// ------------------------------------------------------------
// BIWEEKLY PERIOD
// ------------------------------------------------------------
function periodEnd() { return addDays(S.periodStart, PERIOD_DAYS - 1); }

// ISO yyyy-mm-dd strings compare correctly with <= / >=
function inPeriod(iso) {
  return !!iso && iso >= S.periodStart && iso <= periodEnd();
}

// Entries that fall inside the currently-selected two-week period, sorted by date
function currentEntries() {
  return S.entries.filter(e => inPeriod(e.date))
                  .sort((a, b) => a.date.localeCompare(b.date));
}

function clampToPeriod(iso) {
  if (!iso || iso < S.periodStart) return S.periodStart;
  const end = periodEnd();
  return iso > end ? end : iso;
}

function formatRange() {
  const s = parseISO(S.periodStart);
  const e = parseISO(periodEnd());
  const start = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end   = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} – ${end}`;
}

function shiftPeriod(dir) {
  S.periodStart = addDays(S.periodStart, dir * PERIOD_DAYS);
  draft.date = clampToPeriod(draft.date);
  save();
  render();
}

function setPeriodStart(iso) {
  if (!iso) return;
  S.periodStart = iso;
  draft.date = clampToPeriod(draft.date);
  save();
  render();
}

// ------------------------------------------------------------
// RENDER
// ------------------------------------------------------------
function render() {
  document.getElementById('app').innerHTML = `
    ${renderPeriodCard()}
    ${renderAddCard()}
    ${renderEntriesCard()}
    ${renderTotalsCard()}
  `;
}

function renderPeriodCard() {
  return `
    <div class="card">
      <div class="card-title">Pay Period (Biweekly)</div>
      <div class="period-nav">
        <button class="period-arrow" onclick="shiftPeriod(-1)" title="Previous two weeks">←</button>
        <div class="period-range">${esc(formatRange())}</div>
        <button class="period-arrow" onclick="shiftPeriod(1)" title="Next two weeks">→</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Period start <span class="label-note">first day of the two weeks</span></label>
          <input type="date" value="${esc(S.periodStart)}" onchange="setPeriodStart(this.value)">
        </div>
        <div class="form-group">
          <label>Your Name <span class="label-note">(optional)</span></label>
          <input type="text" value="${esc(S.worker)}" placeholder="e.g. Miguel Mendez"
            oninput="S.worker=this.value;save()">
        </div>
      </div>
    </div>`;
}

function renderAddCard() {
  const t = JOB_TYPES[draft.type];
  const isHourly = t.kind === 'hourly';

  const qtyField = isHourly
    ? `<div class="form-group">
         <label>Hours Worked</label>
         <input type="number" min="0" step="0.25" value="${draft.hours}" placeholder="0"
           oninput="draft.hours=this.value;updateRateHint()">
       </div>`
    : `<div class="form-group">
         <label>Number of Jobs</label>
         <input type="number" min="1" step="1" value="${draft.qty}" placeholder="1"
           oninput="draft.qty=this.value;updateRateHint()">
       </div>`;

  const descField = isHourly
    ? `<div class="form-group">
         <label>Work Completed</label>
         <textarea placeholder="Describe the work you completed…"
           oninput="draft.desc=this.value">${esc(draft.desc)}</textarea>
       </div>`
    : '';

  return `
    <div class="card">
      <div class="card-title">Add Work</div>

      <div class="form-group">
        <label>Date <span class="label-note">within the selected pay period</span></label>
        <input type="date" min="${esc(S.periodStart)}" max="${esc(periodEnd())}"
          value="${esc(draft.date)}" oninput="draft.date=this.value;save()">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Job Type</label>
          <select onchange="draft.type=this.value;render()">
            ${Object.keys(JOB_TYPES).map(k =>
              `<option value="${k}"${draft.type===k?' selected':''}>${JOB_TYPES[k].label}</option>`).join('')}
          </select>
        </div>
        ${qtyField}
      </div>

      ${descField}

      <div class="rate-hint" id="rate-hint">${rateHintText()}</div>

      <button class="btn-primary btn-full" style="margin-top:14px" onclick="addEntry()">+ Add Entry</button>
    </div>`;
}

function rateHintText() {
  const t = JOB_TYPES[draft.type];
  const amt = earningsFor(draft);
  if (t.kind === 'hourly') {
    const h = parseFloat(draft.hours) || 0;
    return h ? `${h} hr × $${t.rate}/hr = $${fmt(amt)}`
             : `Rate: $${t.rate} per hour`;
  }
  const q = parseFloat(draft.qty) || 0;
  return q ? `${q} job${q===1?'':'s'} × $${t.rate} = $${fmt(amt)}`
           : `Rate: $${t.rate} fixed per job`;
}

function updateRateHint() {
  const el = document.getElementById('rate-hint');
  if (el) el.textContent = rateHintText();
}

function renderEntriesCard() {
  const list = currentEntries();
  const rows = list.length
    ? list.map(e => {
        const t = JOB_TYPES[e.type];
        const units = t.kind === 'fixed'
          ? `${e.qty} job${(parseFloat(e.qty)||0)===1?'':'s'} × $${t.rate}`
          : `${e.hours||0} hr × $${t.rate}/hr`;
        return `
          <div class="entry">
            <div class="entry-main">
              <div class="entry-desc">${esc(e.desc || t.label)}</div>
              <div class="entry-meta">${esc(formatDate(e.date))} · ${t.label} · ${units}</div>
            </div>
            <div class="entry-amount">$${fmt(earningsFor(e))}</div>
            <button class="btn-remove" title="Remove" onclick="removeEntry('${e.id}')">✕</button>
          </div>`;
      }).join('')
    : `<div class="empty-note">No work in this pay period yet. Add your first entry above.</div>`;

  return `
    <div class="card">
      <div class="card-title">Entries this period (${list.length})</div>
      ${rows}
    </div>`;
}

function renderTotalsCard() {
  const b = breakdown();
  const lines = Object.keys(b)
    .filter(k => b[k].amount > 0)
    .map(k => {
      const u = b[k].kind === 'fixed'
        ? `${b[k].units} job${b[k].units===1?'':'s'}`
        : `${b[k].units} hr`;
      return `<div class="totals-row"><span>${b[k].label} (${u})</span><span>$${fmt(b[k].amount)}</span></div>`;
    }).join('');

  return `
    <div class="card">
      <div class="card-title">Total Earned — ${esc(formatRange())}</div>
      ${lines || '<div class="empty-note">$0.00</div>'}
      <div class="totals-row" style="margin-top:8px"><span>Paid Hours</span><span>${fmtHrs(totalPaidHours())} hr</span></div>
      <div class="totals-grand">
        <span class="label">Period Total</span>
        <span class="amount">$${fmt(grandTotal())}</span>
      </div>
      <div class="btn-row" style="margin-top:18px">
        <button class="btn-primary btn-green" onclick="downloadPDF()">⬇ Download PDF</button>
        <button class="btn-ghost" onclick="clearPeriod()">Clear Period</button>
      </div>
    </div>`;
}

// ------------------------------------------------------------
// ACTIONS
// ------------------------------------------------------------
function addEntry() {
  const t = JOB_TYPES[draft.type];
  if (t.kind === 'hourly' && !draft.desc.trim())                  { toast('Describe the work completed'); return; }
  if (t.kind === 'fixed'  && (parseFloat(draft.qty)   || 0) <= 0) { toast('Enter the number of jobs'); return; }
  if (t.kind === 'hourly' && (parseFloat(draft.hours) || 0) <= 0) { toast('Enter the hours worked'); return; }

  S.entries.push({
    id:    'e' + Date.now(),
    date:  draft.date,
    desc:  t.kind === 'hourly' ? draft.desc.trim() : '',
    type:  draft.type,
    qty:   t.kind === 'fixed'  ? (parseFloat(draft.qty)   || 0) : 0,
    hours: t.kind === 'hourly' ? (parseFloat(draft.hours) || 0) : 0
  });
  save();
  draft = newDraft();
  render();
  toast('Entry added');
}

function removeEntry(id) {
  S.entries = S.entries.filter(e => e.id !== id);
  save();
  render();
}

function clearPeriod() {
  const list = currentEntries();
  if (!list.length) { toast('Nothing to clear in this period'); return; }
  if (!confirm(`Clear all ${list.length} entr${list.length === 1 ? 'y' : 'ies'} in ${formatRange()}? This cannot be undone.`)) return;
  const ids = new Set(list.map(e => e.id));
  S.entries = S.entries.filter(e => !ids.has(e.id));
  save();
  render();
}

// ------------------------------------------------------------
// PDF (print-to-PDF)
// ------------------------------------------------------------
function downloadPDF() {
  if (!currentEntries().length) { toast('Add at least one entry in this period first'); return; }
  buildReport();
  // Give the browser a tick to lay out the report, then open the print dialog
  setTimeout(() => window.print(), 60);
}

function buildReport() {
  const list = currentEntries();
  const b = breakdown(list);
  const rows = list.map(e => {
    const t = JOB_TYPES[e.type];
    const units = t.kind === 'fixed'
      ? `${e.qty} job${(parseFloat(e.qty)||0)===1?'':'s'} × $${t.rate}`
      : `${e.hours||0} hr × $${t.rate}/hr`;
    return `
      <tr>
        <td>${esc(formatDate(e.date))}</td>
        <td>${esc(e.desc || t.label)}</td>
        <td>${t.label}</td>
        <td class="num">${units}</td>
        <td class="num">${fmtHrs(paidHoursFor(e))}</td>
        <td class="num">$${fmt(earningsFor(e))}</td>
      </tr>`;
  }).join('');

  const summary = Object.keys(b)
    .filter(k => b[k].amount > 0)
    .map(k => {
      const u = b[k].kind === 'fixed' ? `${b[k].units} jobs` : `${b[k].units} hr`;
      return `<div class="row"><span>${b[k].label} (${u})</span><span>$${fmt(b[k].amount)}</span></div>`;
    }).join('');

  const generated = new Date().toLocaleDateString('en-US',
    { year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('report').innerHTML = `
    <div class="report-head">
      <h1>WORK EARNINGS REPORT</h1>
      <div class="sub">${esc(COMPANY)}</div>
    </div>

    <div class="report-meta">
      <div>
        ${S.worker ? `<strong>${esc(S.worker)}</strong><br>` : ''}
        <strong>Pay Period:</strong> ${esc(formatRange())}
      </div>
      <div style="text-align:right">Generated: ${esc(generated)}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Work Completed</th>
          <th>Job Type</th>
          <th class="num">Detail</th>
          <th class="num">Paid Hours</th>
          <th class="num">Earned</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="grand">
          <td colspan="4">PERIOD TOTAL</td>
          <td class="num">${fmtHrs(totalPaidHours(list))}</td>
          <td class="num">$${fmt(grandTotal(list))}</td>
        </tr>
      </tbody>
    </table>

    <div class="report-summary">
      ${summary}
      <div class="row total-hours"><span><strong>Paid Hours</strong></span><span><strong>${fmtHrs(totalPaidHours(list))} hr</strong></span></div>
    </div>

    <div class="report-foot">
      ${esc(COMPANY)} — Generated by the Work Earnings Tracker
    </div>`;
}

// ------------------------------------------------------------
// UTILITIES
// ------------------------------------------------------------
function isoOf(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function today() { return isoOf(new Date()); }

function parseISO(iso) {
  const p = String(iso || '').split('-');
  return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
}

function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return isoOf(d);
}

// Monday of the week containing the given date — a sensible default period start
function mondayOf(iso) {
  const d = parseISO(iso);
  const dow = d.getDay();                 // 0=Sun … 6=Sat
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return isoOf(d);
}

function formatDate(iso) {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmt(n) {
  return (parseFloat(n) || 0).toLocaleString('en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Hours, rounded to 2 decimals with trailing zeros trimmed (5, 2.5, 2.33)
function fmtHrs(n) {
  return String(Math.round((parseFloat(n) || 0) * 100) / 100);
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
load();
if (!S.periodStart) S.periodStart = mondayOf(today());
draft.date = clampToPeriod(today());
render();
