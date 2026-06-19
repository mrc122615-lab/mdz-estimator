// ============================================================
// MDZ ESTIMATOR — app.js
// ============================================================

const RATE_SOLO   = 150;
const RATE_CREW   = 225;
const RATE_OOS    = 250; // out-of-scope / additional meetings
const RATE_MIN    = 250; // minimum job fee

const COMPANY = {
  name:        'MDZ Building Inspections & Consulting',
  address:     '2200 N Commerce Parkway, Suite 200, Weston, Florida 33326',
  licenses:    'EC1305900 | CGC1532054',
  by:          'Miguel Mendez, Project Manager',
  credentials: 'Certified Commercial Inspector BN6469 · Certified Electrical Plans Examiner PX3483 · Level II Infrared Thermographer #275348'
};

const SERVICES_A = [
  'Electrical Service / Equipment Evaluation',
  'Electrical Load Calculation',
  'Infrared Thermographic Inspection',
  'Commercial / Building Inspection',
  'Electrical Plan Review',
  'Findings & Recommendations Report',
  'Board / Stakeholder Meeting Attendance & Presentation',
  'General Electrical Consulting',
  'Custom...'
];

const PHASES_B = [
  'Preliminary Drawings',
  'Permit Submittal & Coordination',
  'Mobilization & Installation',
  'Inspection Trips',
  'Utility (FPL) Coordination',
  'Custom...'
];

const EXCL_A = [
  'Electrical repairs of any kind',
  'Permit applications or permit fees',
  'Engineering services or signed and sealed engineering documents',
  'Preparation of construction drawings',
  'Infrared thermographic inspections (unless separately scoped and priced)',
  'Destructive testing or opening of walls, ceilings, or concealed spaces',
  'Replacement of electrical equipment',
  'Expert witness testimony or legal services',
  'Attendance at additional meetings beyond those specified — billed at $250.00/hr, portal-to-portal'
];

const EXCL_B = [
  'Work, materials, or circuits not expressly listed in the scope of work',
  'Signed and sealed engineering drawings, unless separately scoped and priced',
  'Utility company (FPL) charges, fees, or deposits, and any delays caused by the utility',
  'Trenching through rock, unsuitable soil, or undisclosed underground obstructions; dewatering',
  'Concrete cutting, coring, or restoration beyond what is stated; patching, painting, or finishing of any surfaces',
  'Restoration of landscaping, asphalt, or hardscape disturbed by the work',
  'Removal, disposal, or relocation of existing equipment unless stated',
  'Hazardous material (asbestos, lead, mold) testing, handling, or abatement',
  'Temporary power',
  'Permit expediting or after-hours/overtime work unless stated',
  'Repairs to pre-existing code violations or deficiencies discovered during the work',
  'Permit fees — passed through to the client at cost',
  'Additional meetings or trips beyond those specified — billed at $250.00/hr, portal-to-portal'
];

const RESP_A = [
  'Access to electrical rooms and service equipment',
  'Access to available electrical records and prior reports, if available',
  'Coordination of access to any units or areas deemed necessary for evaluation',
  'A suitable date for any board / stakeholder presentation'
];

const RESP_B = [
  'Clear, safe, and unobstructed access to the work area and equipment locations',
  'Timely setup of the utility (FPL) account and coordination of meter set / energization',
  'Location and marking of existing underground utilities prior to any excavation',
  'Approved site plan / drawings or specifications, if the client is providing them',
  'Any HOA, landlord, or property-owner approvals required for the work',
  'Timely payment per the agreed schedule so material can be ordered and the job kept on schedule'
];

// ============================================================
// STATE
// ============================================================

function freshState() {
  const lastNum = parseInt(localStorage.getItem('mdz-last-num') || '1599', 10);
  return {
    step: 'home',
    mode: null,
    num:  String(lastNum + 1),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    client:  { name: '', address: '', contact: '' },
    services: [],
    scopeText: '',
    scopeSize: '', scopeMount: '', scopeSpaces: '', scopeNotes: '',
    materials: [],
    markup: 20,
    phases: [],
    permitFee: '',
    drawType: 'inhouse',
    drawHours: '',
    drawCost: '',
    notes: '',
    removed: [],
    customExcl: [],
    history: []
  };
}

let S = freshState();

function save() {
  try { localStorage.setItem('mdz-state', JSON.stringify(S)); } catch(e) {}
}

function load() {
  try {
    const raw = localStorage.getItem('mdz-state');
    if (raw) S = JSON.parse(raw);
  } catch(e) {}
}

function confirmNew() {
  if (!confirm('Start a new estimate? Current data will be cleared.')) return;
  localStorage.removeItem('mdz-state');
  S = freshState();
  render();
}

// ============================================================
// NAVIGATION
// ============================================================

const FLOW_A = ['home','client','services','review','proposal'];
const FLOW_B = ['home','client','scope','materials','labor','permits','review','proposal'];

function flow() { return S.mode === 'B' ? FLOW_B : FLOW_A; }

function progress() {
  const f = flow(), i = f.indexOf(S.step);
  return i < 0 ? 0 : Math.round(i / (f.length - 1) * 100);
}

function go(step) {
  S.history.push(S.step);
  S.step = step;
  save();
  render();
  window.scrollTo(0, 0);
}

function back() {
  if (S.history.length) {
    S.step = S.history.pop();
    save();
    render();
    window.scrollTo(0, 0);
  }
}

// ============================================================
// RENDER DISPATCH
// ============================================================

function render() {
  document.getElementById('progress-fill').style.width = progress() + '%';
  document.getElementById('btn-new').style.display = S.step !== 'home' ? 'block' : 'none';

  const map = {
    home:     renderHome,
    client:   renderClient,
    services: renderServices,
    scope:    renderScope,
    materials:renderMaterials,
    labor:    renderLabor,
    permits:  renderPermits,
    review:   renderReview,
    proposal: renderProposal
  };

  document.getElementById('app').innerHTML = (map[S.step] || renderHome)();
}

// ============================================================
// HOME
// ============================================================

function renderHome() {
  const saved = localStorage.getItem('mdz-state');
  let resumeCard = '';
  if (saved) {
    try {
      const prev = JSON.parse(saved);
      if (prev.client && prev.client.name && prev.step !== 'proposal') {
        resumeCard = `
          <div class="resume-card">
            <div>
              <div class="resume-card-text">Estimate in progress</div>
              <div class="resume-card-client">${esc(prev.client.name || 'Untitled')} — #${esc(prev.num)}</div>
            </div>
            <button class="btn-resume" onclick="loadResume()">Resume</button>
          </div>`;
      }
    } catch(e) {}
  }

  return `
    <div class="step-container">
      <div class="logo-hero">
        <div class="logo-hero-mark">MDZ</div>
        <div class="logo-hero-name">Building Inspections & Consulting<br>Estimating Tool</div>
      </div>

      <h2 class="step-title">New Estimate</h2>
      <p class="step-desc">What type of work is this?</p>

      ${resumeCard}

      <div class="mode-cards">
        <button class="mode-card" onclick="pickMode('A')">
          <div class="mode-card-badge">Mode A</div>
          <div class="mode-card-title">Professional Services</div>
          <div class="mode-card-desc">Inspections, evaluations, load calculations, plan review, thermography, reports, consulting — flat fees per deliverable</div>
          <div class="mode-card-arrow">→</div>
        </button>
        <button class="mode-card" onclick="pickMode('B')">
          <div class="mode-card-badge">Mode B</div>
          <div class="mode-card-title">Construction / Installation</div>
          <div class="mode-card-desc">New services, panels, risers, feeders, equipment installs — full takeoff: materials + markup + labor + permits + drawings</div>
          <div class="mode-card-arrow">→</div>
        </button>
      </div>
    </div>`;
}

function pickMode(m) {
  S = freshState();
  S.mode = m;
  go('client');
}

function loadResume() {
  load();
  render();
}

// ============================================================
// CLIENT INFO
// ============================================================

function renderClient() {
  return `
    <div class="step-container">
      <button class="btn-back" onclick="back()">← Back</button>
      <h2 class="step-title">Client & Proposal Info</h2>

      <div class="form-group">
        <label>Proposal Number</label>
        <input type="text" value="${esc(S.num)}" placeholder="e.g. 1600"
          oninput="S.num=this.value;save()">
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="text" value="${esc(S.date)}" placeholder="e.g. June 19, 2026"
          oninput="S.date=this.value;save()">
      </div>
      <div class="form-group">
        <label>Client / Company Name</label>
        <input type="text" value="${esc(S.client.name)}" placeholder="e.g. Edgewater Condo Association"
          oninput="S.client.name=this.value;save()">
      </div>
      <div class="form-group">
        <label>Client Address</label>
        <textarea placeholder="Street&#10;City, State ZIP"
          oninput="S.client.address=this.value;save()">${esc(S.client.address)}</textarea>
      </div>
      <div class="form-group">
        <label>Contact Name <span class="label-note">(optional)</span></label>
        <input type="text" value="${esc(S.client.contact)}" placeholder="e.g. John Smith"
          oninput="S.client.contact=this.value;save()">
      </div>

      <button class="btn-primary btn-full" onclick="submitClient()">Continue →</button>
    </div>`;
}

function submitClient() {
  if (!S.client.name.trim()) { toast('Enter a client name'); return; }
  if (!S.num.trim())         { toast('Enter a proposal number'); return; }
  go(S.mode === 'A' ? 'services' : 'scope');
}

// ============================================================
// MODE A — SERVICES
// ============================================================

function renderServices() {
  if (!S.services.length) addService();

  const cards = S.services.map((sv, i) => {
    const rate = sv.crew === 'crew' ? RATE_CREW : RATE_SOLO;
    const base = (sv.hours || 0) * rate;
    const low  = Math.max(base, RATE_MIN);
    const high = Math.max(Math.ceil(base * 1.15 / 50) * 50, RATE_MIN);
    const calcHtml = sv.hours
      ? `<div class="calc-row">${sv.hours} hrs × $${rate}/hr = <strong>$${fmt(base)}</strong></div>
         <div class="calc-row">Starting range: <strong>$${fmt(low)} – $${fmt(high)}</strong>
           ${base < RATE_MIN ? '<span class="flag"> ⚠ Below $250 minimum</span>' : ''}</div>`
      : `<span class="calc-hint">Enter hours to see calculated range</span>`;

    const nameField = sv.name === 'Custom...' ? `
      <div class="form-group">
        <label>Custom Service Name</label>
        <input type="text" value="${esc(sv.custom||'')}" placeholder="Describe the service"
          oninput="svcSet('${sv.id}','custom',this.value)">
      </div>` : '';

    return `
      <div class="item-card">
        <div class="item-card-header">
          <span class="item-num">${i+1}</span>
          <button class="btn-remove" onclick="svcRemove('${sv.id}')">✕</button>
        </div>
        <div class="form-group">
          <label>Service</label>
          <select onchange="svcSet('${sv.id}','name',this.value);render()">
            ${SERVICES_A.map(s => `<option value="${esc(s)}"${sv.name===s?' selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        ${nameField}
        <div class="form-row">
          <div class="form-group">
            <label>Est. Hours</label>
            <input type="number" min="0" step="0.5" value="${sv.hours||''}" placeholder="0"
              oninput="svcSet('${sv.id}','hours',parseFloat(this.value)||0);svcCalc('${sv.id}')">
          </div>
          <div class="form-group">
            <label>Crew</label>
            <select onchange="svcSet('${sv.id}','crew',this.value);svcCalc('${sv.id}')">
              <option value="solo"${sv.crew==='solo'?' selected':''}>Solo ($150/hr)</option>
              <option value="crew"${sv.crew==='crew'?' selected':''}>+ Apprentice ($225/hr)</option>
            </select>
          </div>
        </div>
        <div class="calc-band" id="calc-${sv.id}">${calcHtml}</div>
        <div class="form-group">
          <label>Your Confirmed Fee <span class="label-note">you set this</span></label>
          <div class="input-prefix">
            <span>$</span>
            <input type="number" min="0" step="0.01" value="${sv.fee||''}" placeholder="0.00"
              oninput="svcSet('${sv.id}','fee',parseFloat(this.value)||0);save()">
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="step-container">
      <button class="btn-back" onclick="back()">← Back</button>
      <h2 class="step-title">Services</h2>
      <p class="step-desc">Add each service. The app shows the math — you set the confirmed fee.</p>
      ${cards}
      <button class="btn-add" onclick="addService();render()">+ Add Service</button>
      <div class="form-group" style="margin-top:20px">
        <label>Scope Notes <span class="label-note">optional</span></label>
        <textarea placeholder="Any additional scope details for the proposal..."
          oninput="S.notes=this.value;save()">${esc(S.notes)}</textarea>
      </div>
      <button class="btn-primary btn-full btn-mt" onclick="submitServices()">Review Estimate →</button>
    </div>`;
}

function addService() {
  S.services.push({ id:'sv'+Date.now(), name:SERVICES_A[0], custom:'', hours:0, crew:'solo', fee:0 });
  save();
}
function svcRemove(id) { S.services=S.services.filter(s=>s.id!==id); save(); render(); }
function svcSet(id,k,v)  { const s=S.services.find(s=>s.id===id); if(s){s[k]=v;save();} }
function svcCalc(id) {
  const sv=S.services.find(s=>s.id===id); if(!sv) return;
  const rate=sv.crew==='crew'?RATE_CREW:RATE_SOLO, base=(sv.hours||0)*rate;
  const low=Math.max(base,RATE_MIN), high=Math.max(Math.ceil(base*1.15/50)*50,RATE_MIN);
  const el=document.getElementById('calc-'+id); if(!el) return;
  el.innerHTML = sv.hours
    ? `<div class="calc-row">${sv.hours} hrs × $${rate}/hr = <strong>$${fmt(base)}</strong></div>
       <div class="calc-row">Starting range: <strong>$${fmt(low)} – $${fmt(high)}</strong>
         ${base<RATE_MIN?'<span class="flag"> ⚠ Below $250 minimum</span>':''}</div>`
    : `<span class="calc-hint">Enter hours to see calculated range</span>`;
}
function submitServices() {
  if (!S.services.length)                              { toast('Add at least one service'); return; }
  if (S.services.some(s=>!s.fee||s.fee<RATE_MIN))     { toast('Set a fee (min $250) for every service'); return; }
  go('review');
}

// ============================================================
// MODE B — SCOPE
// ============================================================

function renderScope() {
  return `
    <div class="step-container">
      <button class="btn-back" onclick="back()">← Back</button>
      <h2 class="step-title">Scope of Work</h2>
      <p class="step-desc">Describe what you're furnishing and installing.</p>

      <div class="form-row">
        <div class="form-group">
          <label>Service Size</label>
          <select onchange="S.scopeSize=this.value;save()">
            <option value=""${!S.scopeSize?' selected':''}>Select…</option>
            ${['100A','200A','400A','600A','800A','Other'].map(v=>`<option value="${v}"${S.scopeSize===v?' selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Panel Spaces</label>
          <input type="text" value="${esc(S.scopeSpaces)}" placeholder="e.g. 20 spaces"
            oninput="S.scopeSpaces=this.value;save()">
        </div>
      </div>

      <div class="form-group">
        <label>Installation Type</label>
        <select onchange="S.scopeMount=this.value;save()">
          <option value=""${!S.scopeMount?' selected':''}>Select…</option>
          ${['Overhead / Weatherhead','Underground','Free-Standing / Self-Standing','Building-Mounted'].map(v=>`<option value="${v}"${S.scopeMount===v?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Scope Description</label>
        <textarea rows="5" placeholder="Describe all work to be furnished and installed…"
          oninput="S.scopeText=this.value;save()">${esc(S.scopeText)}</textarea>
      </div>

      <div class="form-group">
        <label>Site / Access Notes <span class="label-note">optional</span></label>
        <textarea rows="3" placeholder="Site conditions, FPL coordination, access requirements…"
          oninput="S.scopeNotes=this.value;save()">${esc(S.scopeNotes)}</textarea>
      </div>

      <button class="btn-primary btn-full" onclick="submitScope()">Add Materials →</button>
    </div>`;
}

function submitScope() {
  if (!S.scopeText.trim()) { toast('Describe the scope of work'); return; }
  go('materials');
}

// ============================================================
// MODE B — MATERIALS
// ============================================================

function renderMaterials() {
  const rows = S.materials.map((m,i)=>{
    const markup = m.markup!=null ? m.markup : S.markup;
    const billed = (m.cost||0)*(1+markup/100);
    const calcHtml = m.cost
      ? `<div class="calc-row">$${fmt(m.cost)} + ${markup}% markup = <strong>$${fmt(billed)} billed</strong></div>`
      : `<span class="calc-hint">Enter cost to see billed amount</span>`;

    return `
      <div class="item-card">
        <div class="item-card-header">
          <span class="item-num">${i+1}</span>
          <button class="btn-remove" onclick="matRemove('${m.id}')">✕</button>
        </div>
        <div class="form-group">
          <label>Item</label>
          <input type="text" value="${esc(m.item)}" placeholder="e.g. 200A Main Panel, 24-space"
            oninput="matSet('${m.id}','item',this.value)">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>My Cost</label>
            <div class="input-prefix">
              <span>$</span>
              <input type="number" min="0" step="0.01" value="${m.cost||''}" placeholder="0.00"
                oninput="matSet('${m.id}','cost',parseFloat(this.value)||0);matCalc('${m.id}')">
            </div>
          </div>
          <div class="form-group">
            <label>Markup %</label>
            <div class="input-suffix">
              <input type="number" min="0" step="1" value="${markup}" placeholder="${S.markup}"
                oninput="matSet('${m.id}','markup',parseFloat(this.value)||0);matCalc('${m.id}')">
              <span>%</span>
            </div>
          </div>
        </div>
        <div class="calc-band" id="mc-${m.id}">${calcHtml}</div>
      </div>`;
  }).join('');

  return `
    <div class="step-container">
      <button class="btn-back" onclick="back()">← Back</button>
      <h2 class="step-title">Materials</h2>
      <p class="step-desc">List major equipment. App calculates billed amount from your cost + markup.</p>

      <div class="form-inline form-group">
        <label>Default Markup</label>
        <div class="input-suffix" style="max-width:90px">
          <input type="number" min="0" step="1" value="${S.markup}"
            oninput="S.markup=parseFloat(this.value)||0;save();render()">
          <span>%</span>
        </div>
      </div>

      ${rows}
      <button class="btn-add" onclick="addMat();render()">+ Add Material</button>
      <button class="btn-primary btn-full btn-mt" onclick="go('labor')">Add Labor →</button>
    </div>`;
}

function addMat() { S.materials.push({id:'m'+Date.now(),item:'',cost:0,markup:S.markup}); save(); }
function matRemove(id) { S.materials=S.materials.filter(m=>m.id!==id); save(); render(); }
function matSet(id,k,v) { const m=S.materials.find(m=>m.id===id); if(m){m[k]=v;save();} }
function matCalc(id) {
  const m=S.materials.find(m=>m.id===id); if(!m) return;
  const markup=m.markup!=null?m.markup:S.markup, billed=(m.cost||0)*(1+markup/100);
  const el=document.getElementById('mc-'+id); if(!el) return;
  el.innerHTML = m.cost
    ? `<div class="calc-row">$${fmt(m.cost)} + ${markup}% = <strong>$${fmt(billed)} billed</strong></div>`
    : `<span class="calc-hint">Enter cost to see billed amount</span>`;
}

// ============================================================
// MODE B — LABOR
// ============================================================

function renderLabor() {
  if (!S.phases.length) addPhase();

  const cards = S.phases.map((p,i)=>{
    const rate=p.crew==='solo'?RATE_SOLO:RATE_CREW, base=(p.hours||0)*rate;
    const calcHtml = p.hours
      ? `<div class="calc-row">${p.hours} hrs × $${rate}/hr = <strong>$${fmt(base)}</strong>
           ${base<RATE_MIN?'<span class="flag"> ⚠ Below $250 minimum</span>':''}</div>`
      : `<span class="calc-hint">Enter hours to see calculated amount</span>`;

    const customField = p.phase==='Custom...' ? `
      <div class="form-group">
        <label>Phase Name</label>
        <input type="text" value="${esc(p.custom||'')}" placeholder="Describe this phase"
          oninput="phSet('${p.id}','custom',this.value)">
      </div>` : '';

    return `
      <div class="item-card">
        <div class="item-card-header">
          <span class="item-num">${i+1}</span>
          <button class="btn-remove" onclick="phRemove('${p.id}')">✕</button>
        </div>
        <div class="form-group">
          <label>Phase</label>
          <select onchange="phSet('${p.id}','phase',this.value);render()">
            ${PHASES_B.map(ph=>`<option value="${esc(ph)}"${p.phase===ph?' selected':''}>${ph}</option>`).join('')}
          </select>
        </div>
        ${customField}
        <div class="form-row">
          <div class="form-group">
            <label>Hours</label>
            <input type="number" min="0" step="0.5" value="${p.hours||''}" placeholder="0"
              oninput="phSet('${p.id}','hours',parseFloat(this.value)||0);phCalc('${p.id}')">
          </div>
          <div class="form-group">
            <label>Crew</label>
            <select onchange="phSet('${p.id}','crew',this.value);phCalc('${p.id}')">
              <option value="crew"${p.crew==='crew'?' selected':''}>+ Apprentice ($225/hr)</option>
              <option value="solo"${p.crew==='solo'?' selected':''}>Solo ($150/hr)</option>
            </select>
          </div>
        </div>
        <div class="calc-band" id="pc-${p.id}">${calcHtml}</div>
        <div class="form-group">
          <label>Confirmed Amount <span class="label-note">you set this</span></label>
          <div class="input-prefix">
            <span>$</span>
            <input type="number" min="0" step="0.01" value="${p.amount||''}" placeholder="0.00"
              oninput="phSet('${p.id}','amount',parseFloat(this.value)||0);save()">
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="step-container">
      <button class="btn-back" onclick="back()">← Back</button>
      <h2 class="step-title">Labor</h2>
      <p class="step-desc">Break down labor by phase. App shows the math — you set the confirmed amounts.</p>
      ${cards}
      <button class="btn-add" onclick="addPhase();render()">+ Add Phase</button>
      <button class="btn-primary btn-full btn-mt" onclick="submitLabor()">Permits & Drawings →</button>
    </div>`;
}

function addPhase() { S.phases.push({id:'p'+Date.now(),phase:PHASES_B[0],custom:'',hours:0,crew:'crew',amount:0}); save(); }
function phRemove(id) { S.phases=S.phases.filter(p=>p.id!==id); save(); render(); }
function phSet(id,k,v) { const p=S.phases.find(p=>p.id===id); if(p){p[k]=v;save();} }
function phCalc(id) {
  const p=S.phases.find(p=>p.id===id); if(!p) return;
  const rate=p.crew==='solo'?RATE_SOLO:RATE_CREW, base=(p.hours||0)*rate;
  const el=document.getElementById('pc-'+id); if(!el) return;
  el.innerHTML = p.hours
    ? `<div class="calc-row">${p.hours} hrs × $${rate}/hr = <strong>$${fmt(base)}</strong>
         ${base<RATE_MIN?'<span class="flag"> ⚠ Below $250 minimum</span>':''}</div>`
    : `<span class="calc-hint">Enter hours to see calculated amount</span>`;
}
function submitLabor() {
  if (S.phases.some(p=>!p.amount||p.amount<=0)) { toast('Set a confirmed amount for every phase'); return; }
  go('permits');
}

// ============================================================
// MODE B — PERMITS & DRAWINGS
// ============================================================

function renderPermits() {
  const drawCalc = S.drawType==='inhouse' && S.drawHours
    ? `<div class="calc-band"><div class="calc-row">${S.drawHours} hrs × $${RATE_SOLO}/hr = <strong>$${fmt(S.drawHours*RATE_SOLO)}</strong></div></div>` : '';

  return `
    <div class="step-container">
      <button class="btn-back" onclick="back()">← Back</button>
      <h2 class="step-title">Permits & Drawings</h2>

      <div class="form-group">
        <label>County Permit Fee <span class="label-note">pass-through</span></label>
        <div class="input-prefix">
          <span>$</span>
          <input type="number" min="0" step="0.01" value="${S.permitFee||''}" placeholder="Leave blank for placeholder"
            oninput="S.permitFee=this.value;save()">
        </div>
        <div class="field-note">Passed through to client at cost. Leave blank and the proposal will show [GET PERMIT FEE].</div>
      </div>

      <div class="form-group">
        <label>Drawings</label>
        <div class="toggle-group">
          ${['inhouse','subcontracted','none'].map(t=>`
            <button class="toggle-btn${S.drawType===t?' active':''}"
              onclick="S.drawType='${t}';save();render()">
              ${{inhouse:'In-House (hourly)',subcontracted:'Subcontracted',none:'Not Included'}[t]}
            </button>`).join('')}
        </div>
      </div>

      ${S.drawType==='inhouse' ? `
        <div class="form-group">
          <label>Drawing Hours</label>
          <input type="number" min="0" step="0.5" value="${S.drawHours||''}" placeholder="0"
            oninput="S.drawHours=parseFloat(this.value)||0;save();render()">
          <div class="field-note">Billed at $${RATE_SOLO}/hr (solo working rate)</div>
        </div>
        ${drawCalc}` : ''}

      ${S.drawType==='subcontracted' ? `
        <div class="form-group">
          <label>Subcontracted Cost <span class="label-note">pass-through</span></label>
          <div class="input-prefix">
            <span>$</span>
            <input type="number" min="0" step="0.01" value="${S.drawCost||''}" placeholder="0.00"
              oninput="S.drawCost=parseFloat(this.value)||0;save()">
          </div>
        </div>` : ''}

      <div class="form-group" style="margin-top:20px">
        <label>Additional Notes <span class="label-note">optional</span></label>
        <textarea placeholder="Anything else to include in the proposal…"
          oninput="S.notes=this.value;save()">${esc(S.notes)}</textarea>
      </div>

      <button class="btn-primary btn-full btn-mt" onclick="go('review')">Review Estimate →</button>
    </div>`;
}

// ============================================================
// REVIEW
// ============================================================

function renderReview() {
  const isA = S.mode==='A';
  const excl = isA ? EXCL_A : EXCL_B;
  const total = isA ? totalA() : totalB();

  const lineItems = isA ? `
    <div class="line-items">
      ${S.services.map(sv=>`
        <div class="line-item">
          <span class="li-name">${esc(sv.name==='Custom...'?sv.custom:sv.name)}</span>
          <span class="li-detail">${sv.hours}h @ $${sv.crew==='crew'?RATE_CREW:RATE_SOLO}/hr</span>
          <span class="li-amount">$${fmt(sv.fee)}</span>
        </div>`).join('')}
    </div>` : renderReviewB();

  return `
    <div class="step-container">
      <button class="btn-back" onclick="back()">← Back</button>
      <h2 class="step-title">Review Estimate</h2>
      <p class="step-desc">Confirm everything, then generate the proposal.</p>

      <div class="review-card">
        <div class="review-card-header">
          <span>Mode ${S.mode} — ${isA?'Professional Services':'Construction / Installation'}</span>
          <span>Proposal #${esc(S.num)}</span>
        </div>
        <div class="review-client">
          <strong>${esc(S.client.name)}</strong>
          ${S.client.address?`<br><span style="color:var(--gray-600)">${esc(S.client.address)}</span>`:''}
          ${S.client.contact?`<br><span style="color:var(--gray-600)">${esc(S.client.contact)}</span>`:''}
        </div>
      </div>

      <div class="review-card">
        <div class="section-title">Line Items</div>
        ${lineItems}
      </div>

      <div class="total-box">
        <span>Total ${isA?'Professional Fee':'Project Price'}</span>
        <span class="total-amount">$${fmt(total)}</span>
      </div>

      <div class="review-card">
        <div class="section-title">Exclusions</div>
        <p class="field-note" style="margin-bottom:10px">Uncheck any that don't apply. Add custom exclusions below.</p>
        <div class="exclusion-list">
          ${excl.map((e,i)=>`
            <label class="excl-label">
              <input type="checkbox" ${!S.removed.includes(i)?'checked':''} onchange="toggleExcl(${i})">
              <span>${e}</span>
            </label>`).join('')}
          ${S.customExcl.map((e,i)=>`
            <div class="excl-label excl-custom">
              <span style="flex:1">${esc(e)}</span>
              <button class="btn-remove" style="margin-left:8px" onclick="removeCustomExcl(${i})">✕</button>
            </div>`).join('')}
        </div>
        <div class="excl-add-row">
          <input type="text" id="excl-input" placeholder="Type a custom exclusion…" style="flex:1"
            onkeydown="if(event.key==='Enter')addCustomExcl()">
          <button class="btn-primary" style="white-space:nowrap;padding:12px 16px" onclick="addCustomExcl()">+ Add</button>
        </div>
      </div>

      <button class="btn-primary btn-full" onclick="finalize()">Generate Proposal →</button>
    </div>`;
}

function renderReviewB() {
  const matTotal  = totalMat();
  const labTotal  = totalLab();
  const drawTotal = totalDraw();
  const permit    = parseFloat(S.permitFee)||0;

  return `
    <div class="line-items">
      ${S.materials.length ? `
        <div class="group-label">Materials</div>
        ${S.materials.map(m=>{
          const mk=m.markup!=null?m.markup:S.markup, billed=(m.cost||0)*(1+mk/100);
          return `<div class="line-item">
            <span class="li-name">${esc(m.item||'[Item]')}</span>
            <span class="li-detail">$${fmt(m.cost)} +${mk}%</span>
            <span class="li-amount">$${fmt(billed)}</span>
          </div>`;
        }).join('')}
        <div class="subtotal-row"><span>Materials Subtotal</span><span>$${fmt(matTotal)}</span></div>` : ''}

      ${S.phases.length ? `
        <div class="group-label">Labor</div>
        ${S.phases.map(p=>`
          <div class="line-item">
            <span class="li-name">${esc(p.phase==='Custom...'?p.custom:p.phase)}</span>
            <span class="li-detail">${p.hours}h @ $${p.crew==='solo'?RATE_SOLO:RATE_CREW}/hr</span>
            <span class="li-amount">$${fmt(p.amount)}</span>
          </div>`).join('')}
        <div class="subtotal-row"><span>Labor Subtotal</span><span>$${fmt(labTotal)}</span></div>` : ''}

      ${drawTotal>0 ? `
        <div class="group-label">Drawings</div>
        <div class="line-item">
          <span class="li-name">Drawings / Design</span>
          <span class="li-detail">${S.drawType==='inhouse'?`${S.drawHours}h @ $${RATE_SOLO}/hr`:'Subcontracted'}</span>
          <span class="li-amount">$${fmt(drawTotal)}</span>
        </div>` : ''}

      <div class="group-label">Permits</div>
      <div class="line-item">
        <span class="li-name">Permit Fees (pass-through)</span>
        <span class="${permit?'li-amount':'li-amount li-placeholder'}">${permit?'$'+fmt(permit):'[GET PERMIT FEE]'}</span>
      </div>
    </div>`;
}

function toggleExcl(i) {
  const idx = S.removed.indexOf(i);
  idx>=0 ? S.removed.splice(idx,1) : S.removed.push(i);
  save();
}

function addCustomExcl() {
  const input = document.getElementById('excl-input');
  const val = (input?.value || '').trim();
  if (!val) { toast('Type an exclusion first'); return; }
  S.customExcl.push(val);
  save();
  render();
}

function removeCustomExcl(i) {
  S.customExcl.splice(i, 1);
  save();
  render();
}

function finalize() {
  localStorage.setItem('mdz-last-num', S.num);
  go('proposal');
}

// ============================================================
// TOTALS
// ============================================================

function totalA()    { return S.services.reduce((s,sv)=>s+(parseFloat(sv.fee)||0),0); }
function totalMat()  { return S.materials.reduce((s,m)=>{const mk=m.markup!=null?m.markup:S.markup;return s+(m.cost||0)*(1+mk/100);},0); }
function totalLab()  { return S.phases.reduce((s,p)=>s+(parseFloat(p.amount)||0),0); }
function totalDraw() { return S.drawType==='inhouse'?(parseFloat(S.drawHours)||0)*RATE_SOLO:S.drawType==='subcontracted'?parseFloat(S.drawCost)||0:0; }
function totalB()    { return totalMat()+totalLab()+totalDraw()+(parseFloat(S.permitFee)||0); }

// ============================================================
// PROPOSAL
// ============================================================

function renderProposal() {
  const isA  = S.mode==='A';
  const excl = [...(isA?EXCL_A:EXCL_B).filter((_,i)=>!S.removed.includes(i)), ...S.customExcl];
  const resp = isA?RESP_A:RESP_B;
  const total= isA?totalA():totalB();
  const title= isA?'Professional Services Proposal':'Electrical Service Installation Proposal';

  const scopeContent = isA ? `
    <p>${COMPANY.name} will provide the following professional services:</p>
    <ul class="prop-list">
      ${S.services.map(sv=>`<li>${esc(sv.name==='Custom...'?sv.custom:sv.name)}</li>`).join('')}
    </ul>
    ${S.notes?`<p style="margin-top:8px">${esc(S.notes)}</p>`:''}
  ` : `
    <p>${esc(S.scopeText)}</p>
    ${(S.scopeSize||S.scopeMount||S.scopeSpaces)?`
      <ul class="prop-list">
        ${S.scopeSize?`<li>Service Size: ${esc(S.scopeSize)}</li>`:''}
        ${S.scopeMount?`<li>Installation Type: ${esc(S.scopeMount)}</li>`:''}
        ${S.scopeSpaces?`<li>Panel Spaces: ${esc(S.scopeSpaces)}</li>`:''}
      </ul>`:''}
    ${S.scopeNotes?`<p style="margin-top:8px">${esc(S.scopeNotes)}</p>`:''}
    ${S.notes?`<p style="margin-top:8px">${esc(S.notes)}</p>`:''}
  `;

  const tableRows = isA
    ? S.services.map(sv=>`
        <tr>
          <td>${esc(sv.name==='Custom...'?sv.custom:sv.name)}</td>
          <td class="td-basis">${sv.hours} hrs @ $${sv.crew==='crew'?RATE_CREW:RATE_SOLO}/hr</td>
          <td class="td-amount">$${fmt(sv.fee)}</td>
        </tr>`).join('')
    : `
        ${S.materials.map(m=>{const mk=m.markup!=null?m.markup:S.markup,b=(m.cost||0)*(1+mk/100);return`
          <tr><td>${esc(m.item||'Material')}</td>
          <td class="td-basis">$${fmt(m.cost)} cost + ${mk}% markup</td>
          <td class="td-amount">$${fmt(b)}</td></tr>`;}).join('')}
        ${S.phases.map(p=>`
          <tr><td>${esc(p.phase==='Custom...'?p.custom:p.phase)}</td>
          <td class="td-basis">${p.hours} hrs @ $${p.crew==='solo'?RATE_SOLO:RATE_CREW}/hr</td>
          <td class="td-amount">$${fmt(p.amount)}</td></tr>`).join('')}
        ${totalDraw()>0?`
          <tr><td>Drawings / Design</td>
          <td class="td-basis">${S.drawType==='inhouse'?`${S.drawHours} hrs @ $${RATE_SOLO}/hr`:'Subcontracted — pass-through'}</td>
          <td class="td-amount">$${fmt(totalDraw())}</td></tr>`:''}
        <tr><td>Permit Fees (pass-through to client)</td>
          <td class="td-basis">Per applicable jurisdiction</td>
          <td class="td-amount">${S.permitFee?'$'+fmt(parseFloat(S.permitFee)):'[GET PERMIT FEE]'}</td></tr>`;

  const paymentTerms = isA
    ? `50% deposit due upon acceptance of this proposal. Balance of 50% due upon delivery of the completed report. Additional meetings or out-of-scope requests are billed at $${RATE_OOS}.00/hr, portal-to-portal.`
    : `A deposit equal to material cost and mobilization expenses is due upon acceptance of this proposal to allow materials to be ordered and the job scheduled. Progress payments and final balance are due at milestones agreed upon at time of acceptance. Additional meetings or out-of-scope requests are billed at $${RATE_OOS}.00/hr, portal-to-portal.`;

  return `
    <div class="proposal-wrapper">
      <div class="proposal-toolbar no-print">
        <button class="btn-back" style="padding-bottom:0" onclick="back()">← Back</button>
        <button class="btn-primary" onclick="window.print()">⬇ Save as PDF</button>
      </div>

      <div class="proposal-doc">
        <!-- COVER -->
        <div class="prop-cover">
          <div class="prop-cover-eyebrow">MDZ Building Inspections & Consulting</div>
          <div class="prop-cover-title">${title}</div>
          <div class="prop-cover-for">Prepared For</div>
          <div class="prop-cover-client">${esc(S.client.name)}</div>
          ${S.client.address?`<div class="prop-cover-address">${esc(S.client.address)}</div>`:''}
          <div class="prop-cover-meta">
            <span><strong>Proposal #</strong>${esc(S.num)}</span>
            <span><strong>Date</strong>${esc(S.date)}</span>
          </div>
        </div>

        <!-- 1. COMPANY INFO -->
        <div class="prop-sec">
          <div class="prop-sec-title">Company Information</div>
          <div class="prop-company-name">${COMPANY.name}</div>
          <div class="prop-company-detail">
            ${COMPANY.address}<br>
            Licenses: ${COMPANY.licenses}<br>
            Submitted by: ${COMPANY.by}<br>
            ${COMPANY.credentials}
          </div>
        </div>

        <!-- 2. CLIENT INFO -->
        <div class="prop-sec">
          <div class="prop-sec-title">Owner / Client Information</div>
          <strong>${esc(S.client.name)}</strong><br>
          ${S.client.address?`<span style="white-space:pre-line">${esc(S.client.address)}</span><br>`:''}
          ${S.client.contact?`${esc(S.client.contact)}`:''}
        </div>

        <!-- 3. SCOPE -->
        <div class="prop-sec">
          <div class="prop-sec-title">${isA?'Scope of Professional Services':'Scope of Work'}</div>
          ${scopeContent}
        </div>

        <!-- 4. EXCLUSIONS -->
        <div class="prop-sec">
          <div class="prop-sec-title">Exclusions</div>
          <p>The following are expressly excluded from this ${isA?'proposal':'contract'} unless separately agreed in writing:</p>
          <ul class="prop-list">${excl.map(e=>`<li>${e}</li>`).join('')}</ul>
        </div>

        <!-- 5. CLIENT RESPONSIBILITIES -->
        <div class="prop-sec">
          <div class="prop-sec-title">Client Responsibilities</div>
          <ul class="prop-list">${resp.map(r=>`<li>${r}</li>`).join('')}</ul>
        </div>

        <!-- 6. INVESTMENT -->
        <div class="prop-sec">
          <div class="prop-sec-title">Investment</div>
          <table class="prop-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Basis</th>
                <th style="text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total ${isA?'Professional Fee':'Project Price'}</td>
                <td>$${fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- 7. PAYMENT TERMS -->
        <div class="prop-sec">
          <div class="prop-sec-title">Payment Terms</div>
          <p>${paymentTerms}</p>
        </div>

        <!-- 8. ACCEPTANCE -->
        <div class="prop-sec">
          <div class="prop-sec-title">Acceptance</div>
          <p>This proposal is valid for 30 days from the date above. Authorization to proceed constitutes acceptance of all terms and conditions herein.</p>
          <div class="sig-block">
            <div>
              <div class="sig-line"></div>
              <div class="sig-meta">
                Respectfully Submitted<br>
                <strong>Miguel Mendez</strong>, Project Manager<br>
                ${COMPANY.name}<br>
                ${COMPANY.licenses}
              </div>
            </div>
            <div>
              <div class="sig-line"></div>
              <div class="sig-meta">Authorized Signature / Date</div>
              <div class="sig-name-line"></div>
              <div class="sig-meta">Printed Name / Title</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ============================================================
// UTILITIES
// ============================================================

function fmt(n) {
  return (parseFloat(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function esc(s) {
  return String(s||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

// ============================================================
// INIT
// ============================================================
load();
if (!S.step) S.step = 'home';
render();
