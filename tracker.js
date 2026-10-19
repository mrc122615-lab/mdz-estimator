// ============================================================
// WORK EARNINGS TRACKER — tracker.js
// ============================================================
//
// Rates (for new entries — each entry saves the rate it was logged at):
//   Thermography .......... $150 fixed per job
//   Thermography Report ... $75 fixed per job
//   Drone ................. $75 fixed per job
//   Social Media Mgmt ..... $250 fixed per job
//   Other ................. $15 per hour
// ============================================================

const JOB_TYPES = {
  thermography:        { label: 'Thermography',        kind: 'fixed',  rate: 150, icon: '🔥', color: '#f97316' },
  thermography_report: { label: 'Thermography Report', kind: 'fixed',  rate: 75,  icon: '📄', color: '#8b5cf6' },
  drone:               { label: 'Drone',               kind: 'fixed',  rate: 75, icon: '🚁', color: '#0ea5e9' },
  // key kept as instagram_post so entries saved under the old name carry over
  instagram_post:      { label: 'Social Media Management', kind: 'fixed', rate: 250, icon: '📱', color: '#ec4899' },
  other:               { label: 'Other (hourly)',      kind: 'hourly', rate: 15, icon: '⏱️', color: '#10b981' }
};

const COMPANY = 'MDZ Building Inspections & Consulting';

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
const PERIOD_DAYS = 14;  // biweekly

let S = {
  worker:      '',
  periodStart: '',       // ISO date (yyyy-mm-dd) — first day of the selected two-week period
  entries:     []        // { id, date, desc, type, qty, hours, rate }
};

// Entries saved before rates were stored per entry were logged at these rates,
// so a rate change doesn't re-price work that's already been recorded.
const LEGACY_RATES = { thermography: 75, thermography_report: 35, instagram_post: 30 };

function save() {
  try { localStorage.setItem('earnings-tracker', JSON.stringify(S)); } catch (e) {}
}
function load() {
  try {
    const raw = localStorage.getItem('earnings-tracker');
    if (raw) S = Object.assign(S, JSON.parse(raw));
  } catch (e) {}
  let migrated = false;
  S.entries.forEach(e => {
    if (e.rate == null && JOB_TYPES[e.type]) {
      e.rate = LEGACY_RATES[e.type] != null ? LEGACY_RATES[e.type] : JOB_TYPES[e.type].rate;
      migrated = true;
    }
  });
  if (migrated) save();
}

// The rate an entry is paid at: its saved rate, or the current rate for the draft
function rateOf(entry) {
  return entry.rate != null ? entry.rate : JOB_TYPES[entry.type].rate;
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
// MOTION STATE
// ------------------------------------------------------------
const REDUCED_MOTION = !!(window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches);

let firstRender = true;
let lastAddedId = null;   // entry to animate in on the next render
let periodDir   = 0;      // -1 / +1 right after the period changes, for the slide animation
let shownTotal  = 0;      // what the hero currently displays — counted up/down to the real value
let shownHours  = 0;

// ------------------------------------------------------------
// EARNINGS MATH
// ------------------------------------------------------------
function earningsFor(entry) {
  const t = JOB_TYPES[entry.type];
  if (!t) return 0;
  if (t.kind === 'fixed')  return (parseFloat(entry.qty)   || 0) * rateOf(entry);
  return (parseFloat(entry.hours) || 0) * rateOf(entry);
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

// "Ends in 5 days" / "Ends today" / "Past period" / "Upcoming"
function periodStatus() {
  const t = today();
  if (t > periodEnd())     return 'Past period';
  if (t < S.periodStart)   return 'Upcoming';
  const days = Math.round((parseISO(periodEnd()) - parseISO(t)) / 86400000);
  return days === 0 ? 'Ends today' : `Ends in ${days} day${days === 1 ? '' : 's'}`;
}

function shiftPeriod(dir) {
  S.periodStart = addDays(S.periodStart, dir * PERIOD_DAYS);
  draft.date = clampToPeriod(draft.date);
  periodDir = dir;
  save();
  render();
}

function setPeriodStart(iso) {
  if (!iso || iso === S.periodStart) return;
  periodDir = iso > S.periodStart ? 1 : -1;
  S.periodStart = iso;
  draft.date = clampToPeriod(draft.date);
  save();
  render();
}

// ------------------------------------------------------------
// ICONS (inline SVG so they stay crisp at any size)
// ------------------------------------------------------------
const ICON = {
  left:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  right:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
  plus:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  x:        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14"/></svg>',
  check:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  alert:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5m0 3.5v.01"/><circle cx="12" cy="12" r="9"/></svg>'
};

// ------------------------------------------------------------
// RENDER
// ------------------------------------------------------------
// The page is built once. After that each section is updated in place, so
// nothing visibly rebuilds (no flicker, no restarted background animations).
function render() {
  if (firstRender) {
    const rise = REDUCED_MOTION ? '' : ' rise';
    document.getElementById('app').innerHTML = `
      <section class="hero${rise}" id="hero" style="--i:0">${heroHTML()}</section>
      <section class="card${rise}" id="add-card" style="--i:1">${addCardHTML()}</section>
      <section class="card${rise}" id="entries-card" style="--i:2">${entriesHTML(true)}</section>
      <section class="card${rise}" id="summary-card" style="--i:3">${summaryHTML()}</section>
      <section class="card${rise}" id="details-card" style="--i:4">${detailsHTML()}</section>`;
    firstRender = false;
  } else {
    updateHero();
    syncAddCard();
    document.getElementById('entries-card').innerHTML = entriesHTML(false);
    document.getElementById('summary-card').innerHTML = summaryHTML();
    syncDetails();
  }
  animateTotals();
  lastAddedId = null;
  periodDir   = 0;
}

function heroHTML() {
  return `
    <div class="hero-glow" aria-hidden="true"></div>
    <div class="hero-top">
      <span class="hero-label">Pay period · biweekly</span>
      <span class="hero-status" id="hero-status">${esc(periodStatus())}</span>
    </div>
    <div class="period-nav">
      <button class="period-arrow" onclick="shiftPeriod(-1)" aria-label="Previous two weeks">${ICON.left}</button>
      <div class="period-range" id="period-range">${esc(formatRange())}</div>
      <button class="period-arrow" onclick="shiftPeriod(1)" aria-label="Next two weeks">${ICON.right}</button>
    </div>
    <div class="hero-total-label">Period total</div>
    <div class="hero-total" id="hero-total">$${fmt(shownTotal)}</div>
    <div class="hero-chip"><span class="chip-dot"></span><span><span id="hero-hours">${fmtHrs(shownHours)}</span> paid hours</span></div>`;
}

function updateHero() {
  const range = document.getElementById('period-range');
  range.textContent = formatRange();
  if (periodDir && !REDUCED_MOTION) {
    range.classList.remove('slide-next', 'slide-prev');
    void range.offsetWidth;
    range.classList.add(periodDir > 0 ? 'slide-next' : 'slide-prev');
  }
  document.getElementById('hero-status').textContent = periodStatus();
}

function addCardHTML() {
  const t = JOB_TYPES[draft.type];
  const isHourly = t.kind === 'hourly';

  const chips = Object.keys(JOB_TYPES).map(k => {
    const j = JOB_TYPES[k];
    const price = j.kind === 'hourly' ? `$${j.rate}/hr` : `$${j.rate}`;
    return `
      <button type="button" class="type-chip${draft.type === k ? ' active' : ''}" data-type="${k}"
        style="--c:${j.color}" onclick="pickType('${k}', this)" aria-pressed="${draft.type === k}">
        <span class="type-icon">${j.icon}</span>
        <span class="type-text">
          <span class="type-name">${j.label}</span>
          <span class="type-price">${price}</span>
        </span>
        <span class="type-check">${ICON.check}</span>
      </button>`;
  }).join('');

  return `
    <div class="card-head"><h2 class="card-title">Add work</h2></div>

    <div class="form-group">
      <label>Job type</label>
      <div class="type-grid">${chips}</div>
    </div>

    <div class="form-group">
      <label for="amount-input" id="amount-label">${isHourly ? 'Hours worked' : 'Number of jobs'}</label>
      <div class="stepper">
        <button type="button" class="step-btn" onclick="stepAmount(-1)" aria-label="Decrease">${ICON.minus}</button>
        <input type="number" id="amount-input" inputmode="decimal" min="0" step="${isHourly ? '0.25' : '1'}"
          value="${esc(isHourly ? draft.hours : draft.qty)}" placeholder="0" oninput="setAmount(this.value)">
        <button type="button" class="step-btn" onclick="stepAmount(1)" aria-label="Increase">${ICON.plus}</button>
      </div>
    </div>

    <!-- Always present; slides open only for hourly work -->
    <div class="collapse${isHourly ? ' open' : ''}" id="desc-wrap"${isHourly ? '' : ' inert aria-hidden="true"'}>
      <div class="collapse-inner">
        <div class="form-group">
          <label for="desc-input">Work completed</label>
          <textarea id="desc-input" placeholder="Describe the work you completed…"
            oninput="draft.desc=this.value">${esc(draft.desc)}</textarea>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="date-input">Date <span class="label-note">within this pay period</span></label>
      <input type="date" id="date-input" min="${esc(S.periodStart)}" max="${esc(periodEnd())}"
        value="${esc(draft.date)}" oninput="draft.date=this.value">
    </div>

    <div class="preview" id="rate-hint" style="--c:${t.color}">${rateHintHTML()}</div>

    <button class="btn-primary btn-full btn-add" id="add-btn" onclick="addEntry()">
      ${ICON.plus}<span>Add entry</span>
    </button>`;
}

// Bring the add card in line with `draft` without rebuilding it
function syncAddCard() {
  const t = JOB_TYPES[draft.type];
  const isHourly = t.kind === 'hourly';

  document.querySelectorAll('#add-card .type-chip').forEach(chip => {
    const on = chip.dataset.type === draft.type;
    chip.classList.toggle('active', on);
    chip.setAttribute('aria-pressed', String(on));
  });

  document.getElementById('amount-label').textContent = isHourly ? 'Hours worked' : 'Number of jobs';
  const amount = document.getElementById('amount-input');
  amount.step  = isHourly ? '0.25' : '1';
  amount.value = isHourly ? draft.hours : draft.qty;

  const wrap = document.getElementById('desc-wrap');
  wrap.classList.toggle('open', isHourly);
  wrap.toggleAttribute('inert', !isHourly);   // collapsed textarea can't be tabbed into
  wrap.setAttribute('aria-hidden', String(!isHourly));
  const desc = document.getElementById('desc-input');
  if (desc.value !== draft.desc) desc.value = draft.desc;

  const date = document.getElementById('date-input');
  date.min   = S.periodStart;
  date.max   = periodEnd();
  date.value = draft.date;

  const preview = document.getElementById('rate-hint');
  preview.style.setProperty('--c', t.color);
  preview.innerHTML = rateHintHTML();
}

function rateHintHTML() {
  const t = JOB_TYPES[draft.type];
  const n = parseFloat(t.kind === 'hourly' ? draft.hours : draft.qty) || 0;
  const formula = !n
    ? (t.kind === 'hourly' ? `$${t.rate} per hour` : `$${t.rate} per job`)
    : t.kind === 'hourly'
      ? `${n} hr × $${t.rate}/hr`
      : `${n} job${n === 1 ? '' : 's'} × $${t.rate}`;
  return `<span class="preview-formula">${formula}</span>
          <span class="preview-amount">$${fmt(earningsFor(draft))}</span>`;
}

function updateRateHint() {
  const el = document.getElementById('rate-hint');
  if (!el) return;
  el.innerHTML = rateHintHTML();
  restartAnimation(el, 'bump');
}

// `intro` = first paint: rows stagger in after their card
function entriesHTML(intro) {
  const list = currentEntries();
  const rows = list.length
    ? list.map((e, idx) => {
        const t = JOB_TYPES[e.type];
        const units = t.kind === 'fixed'
          ? `${e.qty} job${(parseFloat(e.qty)||0)===1?'':'s'} × $${rateOf(e)}`
          : `${e.hours||0} hr × $${rateOf(e)}/hr`;
        const motion = e.id === lastAddedId ? ' entry-new' : (intro && !REDUCED_MOTION ? ' rise' : '');
        return `
          <div class="entry${motion}" id="entry-${e.id}"
            style="--c:${t.color};--d:${idx}">
            <div class="entry-icon">${t.icon}</div>
            <div class="entry-main">
              <div class="entry-desc">${esc(e.desc || t.label)}</div>
              <div class="entry-meta">${esc(formatDate(e.date))} · ${units}</div>
            </div>
            <div class="entry-amount">$${fmt(earningsFor(e))}</div>
            <button class="btn-remove" aria-label="Remove entry" onclick="removeEntry('${e.id}')">${ICON.x}</button>
          </div>`;
      }).join('')
    : `<div class="empty-state">
         <div class="empty-icon">✨</div>
         <div class="empty-title">No work logged yet</div>
         <div class="empty-sub">Entries for ${esc(formatRange())} will show up here.</div>
       </div>`;

  const swap = periodDir > 0 ? ' swap-next' : periodDir < 0 ? ' swap-prev' : '';
  return `
    <div class="card-head">
      <h2 class="card-title">Entries</h2>
      <span class="badge">${list.length}</span>
    </div>
    <div class="entry-list${swap}">${rows}</div>`;
}

function summaryHTML() {
  const b = breakdown();
  const total = grandTotal();
  const rows = Object.keys(b)
    .filter(k => b[k].amount > 0)
    .map(k => {
      const pct = total ? (b[k].amount / total * 100) : 0;
      const u = b[k].kind === 'fixed'
        ? `${b[k].units} job${b[k].units===1?'':'s'}`
        : `${fmtHrs(b[k].units)} hr`;
      return `
        <div class="sum-row" style="--c:${JOB_TYPES[k].color}">
          <div class="sum-line">
            <span class="sum-name"><span class="dot"></span>${b[k].label}<span class="sum-units">${u}</span></span>
            <span class="sum-amt">$${fmt(b[k].amount)}</span>
          </div>
          <div class="bar"><span style="--w:${pct.toFixed(1)}%"></span></div>
        </div>`;
    }).join('');

  return `
    <div class="card-head"><h2 class="card-title">Summary</h2></div>
    ${rows || '<div class="empty-sub">Add work to see the breakdown by job type.</div>'}
    <div class="sum-total">
      <span>Paid hours</span>
      <span>${fmtHrs(totalPaidHours())} hr</span>
    </div>
    <div class="sum-total sum-grand">
      <span>Period total</span>
      <span>$${fmt(total)}</span>
    </div>
    <div class="btn-row">
      <button class="btn-primary" onclick="downloadPDF()">${ICON.download}<span>Download PDF</span></button>
      <button class="btn-ghost" onclick="clearPeriod()">Clear period</button>
    </div>`;
}

function detailsHTML() {
  return `
    <div class="card-head"><h2 class="card-title">Details</h2></div>
    <div class="form-row">
      <div class="form-group">
        <label for="name-input">Your name <span class="label-note">shown on the PDF</span></label>
        <input type="text" id="name-input" value="${esc(S.worker)}" placeholder="e.g. Miguel Mendez"
          oninput="S.worker=this.value;save()">
      </div>
      <div class="form-group">
        <label for="period-start-input">Jump to period starting</label>
        <input type="date" id="period-start-input" value="${esc(S.periodStart)}" onchange="setPeriodStart(this.value)">
      </div>
    </div>`;
}

function syncDetails() {
  const start = document.getElementById('period-start-input');
  if (start.value !== S.periodStart) start.value = S.periodStart;
}

// ------------------------------------------------------------
// MOTION
// ------------------------------------------------------------
// Count the hero total and paid hours from what's displayed to the real values
function animateTotals() {
  const elT = document.getElementById('hero-total');
  const elH = document.getElementById('hero-hours');
  const toT = grandTotal(), toH = totalPaidHours();
  const fromT = shownTotal,  fromH = shownHours;
  shownTotal = toT;
  shownHours = toH;
  cancelAnimationFrame(animateTotals.raf);

  if (REDUCED_MOTION || (fromT === toT && fromH === toH)) {
    elT.textContent = '$' + fmt(toT);
    elH.textContent = fmtHrs(toH);
    return;
  }
  restartAnimation(elT, 'ticking');
  const start = performance.now(), dur = 750;
  const step = now => {
    const p = Math.min(1, (now - start) / dur);
    const ease = 1 - Math.pow(1 - p, 3);
    elT.textContent = '$' + fmt(fromT + (toT - fromT) * ease);
    elH.textContent = fmtHrs(fromH + (toH - fromH) * ease);
    if (p < 1) animateTotals.raf = requestAnimationFrame(step);
  };
  animateTotals.raf = requestAnimationFrame(step);
}

// Re-trigger a CSS animation class on an element
function restartAnimation(el, cls) {
  if (!el || REDUCED_MOTION) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// A "+$75.00" bubble that floats up from a point on screen
function floatBurst(text, anchor, color) {
  if (REDUCED_MOTION || !anchor) return;
  const r = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-burst';
  el.textContent = text;
  el.style.left = (r.left + r.width / 2) + 'px';
  el.style.top  = r.top + 'px';
  el.style.setProperty('--c', color);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// iOS Safari only applies :active (instant press feedback) when a touchstart listener exists
document.addEventListener('touchstart', () => {}, { passive: true });

// Material-style ripple on tappable controls
document.addEventListener('pointerdown', ev => {
  if (REDUCED_MOTION) return;
  const btn = ev.target.closest('.btn-primary, .btn-ghost, .period-arrow, .step-btn, .type-chip');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 1.6;
  const ink = document.createElement('span');
  ink.className = 'ripple';
  ink.style.width = ink.style.height = size + 'px';
  ink.style.left = (ev.clientX - r.left - size / 2) + 'px';
  ink.style.top  = (ev.clientY - r.top  - size / 2) + 'px';
  btn.appendChild(ink);
  setTimeout(() => ink.remove(), 600);
});

// ------------------------------------------------------------
// ACTIONS
// ------------------------------------------------------------
function pickType(k, chip) {
  if (draft.type === k) return;
  draft.type = k;
  syncAddCard();                       // toggles classes in place, so the border fades in
  restartAnimation(chip, 'just-picked');
  restartAnimation(document.getElementById('rate-hint'), 'bump');
}

function setAmount(v) {
  if (JOB_TYPES[draft.type].kind === 'hourly') draft.hours = v;
  else draft.qty = v;
  updateRateHint();
}

function stepAmount(dir) {
  const hourly = JOB_TYPES[draft.type].kind === 'hourly';
  const cur = parseFloat(hourly ? draft.hours : draft.qty) || 0;
  const next = hourly
    ? Math.max(0, Math.round((cur + dir * 0.5) * 100) / 100)
    : Math.max(1, Math.round(cur + dir));
  const input = document.getElementById('amount-input');
  if (input) input.value = next;
  setAmount(String(next));
}

function addEntry() {
  const t = JOB_TYPES[draft.type];
  const btn = document.getElementById('add-btn');
  const fail = msg => { toast(msg); restartAnimation(btn, 'shake'); };
  if (t.kind === 'hourly' && !draft.desc.trim())                  return fail('Describe the work completed');
  if (t.kind === 'fixed'  && (parseFloat(draft.qty)   || 0) <= 0) return fail('Enter the number of jobs');
  if (t.kind === 'hourly' && (parseFloat(draft.hours) || 0) <= 0) return fail('Enter the hours worked');

  const entry = {
    id:    'e' + Date.now(),
    date:  draft.date,
    desc:  t.kind === 'hourly' ? draft.desc.trim() : '',
    type:  draft.type,
    qty:   t.kind === 'fixed'  ? (parseFloat(draft.qty)   || 0) : 0,
    hours: t.kind === 'hourly' ? (parseFloat(draft.hours) || 0) : 0,
    rate:  t.rate
  };
  S.entries.push(entry);
  save();

  floatBurst('+$' + fmt(earningsFor(entry)), btn, t.color);

  // Keep the chosen job type and date so logging several of the same job is quick
  const keepType = draft.type, keepDate = draft.date;
  draft = newDraft();
  draft.type = keepType;
  draft.date = keepDate;

  lastAddedId = entry.id;
  render();
  toast('Entry added', true);
}

function removeEntry(id) {
  const el = document.getElementById('entry-' + id);
  const done = () => {
    S.entries = S.entries.filter(e => e.id !== id);
    save();
    render();
  };
  if (!el || REDUCED_MOTION) return done();
  if (el.classList.contains('entry-leave')) return;
  // Pin the current height so the collapse can animate down to 0
  el.style.height = el.offsetHeight + 'px';
  requestAnimationFrame(() => el.classList.add('entry-leave'));
  setTimeout(done, 340);
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
// PDF — build a real .pdf file with jsPDF and download it directly
// ------------------------------------------------------------
const PDF_LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

// Loads jsPDF + AutoTable once (in order); a failed attempt can be retried
let pdfLibPromise = null;
function loadPdfLib() {
  if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable) return Promise.resolve();
  if (!pdfLibPromise) {
    pdfLibPromise = PDF_LIBS.reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve())
      .catch(err => { pdfLibPromise = null; throw err; });
  }
  return pdfLibPromise;
}

async function downloadPDF() {
  const list = currentEntries();
  if (!list.length) { toast('Add at least one entry in this period first'); return; }

  if (!(window.jspdf && window.jspdf.jsPDF)) toast('Preparing PDF…', true);
  try {
    await loadPdfLib();
  } catch (e) {
    toast('Couldn’t load the PDF tool — check your internet and try again');
    return;
  }

  const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' });
  if (typeof doc.autoTable !== 'function') { toast('Couldn’t load the PDF tool — try again'); return; }

  buildPdf(doc, list);
  doc.save('earnings-' + (S.periodStart || 'report') + '.pdf');
  toast('PDF downloaded', true);
}

// Palette shared with the app (RGB arrays for jsPDF)
const PDF = {
  ink:    [15, 23, 42],
  muted:  [100, 116, 139],
  line:   [226, 231, 240],
  soft:   [243, 244, 250],
  accent: [79, 70, 229],
  good:   [5, 150, 105],
  grad:   [[67, 56, 202], [37, 99, 235], [8, 145, 178]]   // header gradient stops, same as the app hero
};

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function mixRgb(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }

// The built-in PDF font only covers Latin characters — drop anything else (e.g. emoji)
function pdfSafe(s) {
  return String(s || '').replace(/[^\x20-\x7E\xA0-\xFF–—‘’“”•…]/g, '').trim();
}

function buildPdf(doc, list) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;                                    // page margin
  const total = grandTotal(list);
  const hours = totalPaidHours(list);
  const worker = pdfSafe(S.worker);
  const generated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const fill    = c => doc.setFillColor(c[0], c[1], c[2]);
  const ink     = c => doc.setTextColor(c[0], c[1], c[2]);
  const opacity = o => doc.setGState(new doc.GState({ opacity: o }));
  const font    = (style, size) => doc.setFont('helvetica', style).setFontSize(size);
  // Right-aligned letter-spaced label (jsPDF's align ignores charSpace, so place it manually)
  const spacedRight = (str, x, y, cs) => doc.text(str, x - doc.getTextWidth(str) - cs * (str.length - 1), y, { charSpace: cs });

  doc.setProperties({
    title:   'Earnings Report — ' + formatRange(),
    author:  worker || COMPANY,
    creator: 'MDZ Earnings Tracker'
  });

  // ---------- Header band: 3-stop gradient, drawn as thin strips ----------
  const bandH = 158, strips = 160;
  for (let i = 0; i < strips; i++) {
    const t = i / (strips - 1);
    fill(t < .5 ? mixRgb(PDF.grad[0], PDF.grad[1], t * 2) : mixRgb(PDF.grad[1], PDF.grad[2], (t - .5) * 2));
    doc.rect(W * i / strips, 0, W / strips + 1, bandH, 'F');
  }
  // Soft glows (kept inside the band)
  opacity(.10); fill([255, 255, 255]); doc.circle(W - 40, 20, 115, 'F');
  opacity(.07);                        doc.circle(W - 230, 138, 18, 'F');
  opacity(.12); fill([236, 72, 153]);  doc.circle(28, 118, 38, 'F');
  opacity(1);

  // Left: brand, title, period, name
  ink([255, 255, 255]);
  font('bold', 12).text('MDZ', M, 42);
  const mdzW = doc.getTextWidth('MDZ');
  opacity(.85); font('normal', 8.5).text('EARNINGS REPORT', M + mdzW + 8, 42, { charSpace: 1.6 }); opacity(1);
  font('bold', 25).text('Work Earnings Report', M, 78);
  opacity(.92); font('normal', 11.5).text('Pay period  ' + formatRange(), M, 100); opacity(1);
  let metaY = 119;
  if (worker) { font('bold', 11).text(worker, M, metaY); metaY += 17; }
  opacity(.75); font('normal', 9).text('Generated ' + generated, M, metaY); opacity(1);

  // Right: period total + paid-hours pill
  opacity(.8); font('normal', 8.5); spacedRight('PERIOD TOTAL', W - M, 52, 1.6); opacity(1);
  font('bold', 32).text('$' + fmt(total), W - M, 89, { align: 'right' });
  const pill = fmtHrs(hours) + ' paid hours';
  font('bold', 10);
  const pw = doc.getTextWidth(pill) + 30, ph = 22, px = W - M - pw, py = 102;
  opacity(.2); fill([255, 255, 255]); doc.roundedRect(px, py, pw, ph, 11, 11, 'F'); opacity(1);
  fill([167, 243, 208]); doc.circle(px + 12, py + ph / 2, 3.2, 'F');
  ink([255, 255, 255]); doc.text(pill, px + 20, py + 14.6);

  // ---------- Stat tiles ----------
  const fixedJobs = list.filter(e => JOB_TYPES[e.type].kind === 'fixed')
                        .reduce((s, e) => s + (parseFloat(e.qty) || 0), 0);
  const hourlyHrs = list.filter(e => JOB_TYPES[e.type].kind === 'hourly')
                        .reduce((s, e) => s + (parseFloat(e.hours) || 0), 0);
  const tiles = [
    ['ENTRIES',        String(list.length),        PDF.ink],
    ['FIXED-FEE JOBS', String(fixedJobs),          PDF.accent],
    ['HOURLY WORK',    fmtHrs(hourlyHrs) + ' hr',  PDF.good]
  ];
  let y = bandH + 20;
  const gap = 12, tileW = (W - 2 * M - gap * (tiles.length - 1)) / tiles.length, tileH = 54;
  tiles.forEach(([label, value, color], i) => {
    const x = M + i * (tileW + gap);
    fill(PDF.soft); doc.roundedRect(x, y, tileW, tileH, 10, 10, 'F');
    ink(PDF.muted); font('bold', 7.5).text(label, x + 14, y + 20, { charSpace: .8 });
    ink(color);     font('bold', 18).text(value, x + 14, y + 42);
  });
  y += tileH + 30;

  // ---------- Breakdown by job type ----------
  const section = (title, yy) => { ink(PDF.ink); font('bold', 13).text(title, M, yy); };
  section('Breakdown by job type', y);
  y += 16;
  const b = breakdown(list);
  Object.keys(b)
    .filter(k => b[k].amount > 0)
    .sort((a, c) => b[c].amount - b[a].amount)
    .forEach(k => {
      const color = hexRgb(JOB_TYPES[k].color);
      const units = b[k].kind === 'fixed'
        ? `${b[k].units} job${b[k].units === 1 ? '' : 's'}`
        : `${fmtHrs(b[k].units)} hr`;
      fill(color); doc.circle(M + 4, y + 6, 3.5, 'F');
      ink(PDF.ink);   font('bold', 10.5).text(b[k].label, M + 14, y + 9.5);
      const lw = doc.getTextWidth(b[k].label);
      ink(PDF.muted); font('normal', 9.5).text(units, M + 14 + lw + 7, y + 9.5);
      ink(PDF.ink);   font('bold', 10.5).text('$' + fmt(b[k].amount), W - M, y + 9.5, { align: 'right' });
      const barW = W - 2 * M;
      fill(mixRgb(color, [255, 255, 255], .84)); doc.roundedRect(M, y + 15, barW, 5, 2.5, 2.5, 'F');
      fill(color); doc.roundedRect(M, y + 15, Math.max(5, barW * (total ? b[k].amount / total : 0)), 5, 2.5, 2.5, 'F');
      y += 27;
    });

  // ---------- Entries table ----------
  y += 18;
  section('Entries', y);
  y += 10;
  const TYPE_COL = 1;
  const NONE = '—';                              // fixed-fee jobs have no description
  const typePad = { top: 7, right: 8, bottom: 7, left: 22 };   // room for the colored dot
  doc.autoTable({
    startY: y,
    margin: { left: M, right: M, top: 56, bottom: 60 },
    theme: 'plain',
    rowPageBreak: 'avoid',
    head: [['Date', 'Job type', 'Work completed', 'Detail', 'Paid hrs', 'Earned']],
    body: list.map(e => {
      const t = JOB_TYPES[e.type];
      const units = t.kind === 'fixed'
        ? `${e.qty} job${(parseFloat(e.qty) || 0) === 1 ? '' : 's'} × $${rateOf(e)}`
        : `${e.hours || 0} hr × $${rateOf(e)}/hr`;
      return [formatDate(e.date), t.label, pdfSafe(e.desc) || NONE, units,
              fmtHrs(paidHoursFor(e)), '$' + fmt(earningsFor(e))];
    }),
    foot: [[{ content: 'Period total', colSpan: 4 }, fmtHrs(hours), '$' + fmt(total)]],
    showHead: 'everyPage',
    showFoot: 'lastPage',
    styles: {
      font: 'helvetica', fontSize: 9.5, textColor: PDF.ink, valign: 'middle', overflow: 'linebreak',
      cellPadding: { top: 7, right: 8, bottom: 7, left: 8 }
    },
    headStyles: { fillColor: PDF.soft, textColor: PDF.accent, fontStyle: 'bold', fontSize: 8.5 },
    footStyles: { fillColor: [238, 242, 255], textColor: PDF.ink, fontStyle: 'bold', fontSize: 11 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 144 },   // fits "Social Media Management" (112pt) + dot padding on one line
      3: { cellWidth: 88, textColor: PDF.muted },   // fits e.g. "10.25 hr × $15/hr"
      4: { cellWidth: 50 },
      5: { cellWidth: 66, fontStyle: 'bold' }
    },
    // columnStyles only reach body cells, so align head/foot here too
    didParseCell: d => {
      const i = d.column.index;
      if (i >= 4) d.cell.styles.halign = 'right';
      if (i === TYPE_COL && d.section !== 'foot') d.cell.styles.cellPadding = typePad;
      if (d.section === 'body' && i === 2 && d.cell.raw === NONE) d.cell.styles.textColor = PDF.line;
      if (d.section === 'foot') {
        if (i === 0) d.cell.styles.halign = 'right';
        if (i === 5) d.cell.styles.textColor = PDF.good;
      }
    },
    didDrawCell: d => {
      if (d.section !== 'body') return;
      const { x, y: cy, width, height } = d.cell;
      doc.setDrawColor(...PDF.line).setLineWidth(.6).line(x, cy + height, x + width, cy + height);
      if (d.column.index === TYPE_COL) {
        fill(hexRgb(JOB_TYPES[list[d.row.index].type].color));
        doc.circle(x + 11, cy + height / 2, 3.3, 'F');
      }
    },
    didDrawPage: d => {
      if (d.pageNumber > 1) {
        ink(PDF.muted); font('normal', 9).text('Work Earnings Report · ' + formatRange(), M, 36);
      }
    }
  });

  // Note explaining paid hours
  let noteY = doc.lastAutoTable.finalY + 20;
  if (noteY > H - 70) { doc.addPage(); noteY = 60; }
  ink(PDF.muted); font('normal', 8.5)
    .text('Paid hours = earnings ÷ $' + PAID_HOUR_RATE + ' base rate (fixed-fee jobs included).', M, noteY);

  // ---------- Footer on every page ----------
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...PDF.line).setLineWidth(.6).line(M, H - 42, W - M, H - 42);
    ink(PDF.muted); font('normal', 8.5);
    doc.text(COMPANY, M, H - 26);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 26, { align: 'right' });
  }
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

// ok = true shows a green check; otherwise an amber alert
function toast(msg, ok) {
  const t = document.getElementById('toast');
  t.className = 'toast ' + (ok ? 'toast-ok' : 'toast-warn');
  t.innerHTML = `<span class="toast-icon">${ok ? ICON.check : ICON.alert}</span><span>${esc(msg)}</span>`;
  void t.offsetWidth;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
load();
if (!S.periodStart) S.periodStart = mondayOf(today());
draft.date = clampToPeriod(today());
render();
// Fetch the PDF library in the background so Download PDF is instant later
setTimeout(() => loadPdfLib().catch(() => {}), 1500);
