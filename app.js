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

const COMPANY_B = {
  name:    'Anamik Electric',
  display: 'ANAMIK\nElectrical Consulting & Contracting'
};

const MDZ_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" width="190" height="146">
  <ellipse cx="122" cy="88" rx="96" ry="80" fill="#dce8f5" opacity="0.5"/>
  <rect x="44" y="100" width="20" height="52" fill="#1a5ca8"/>
  <rect x="69" y="77" width="24" height="75" fill="#1a5ca8"/>
  <rect x="99" y="54" width="32" height="98" fill="#2265b8"/>
  <rect x="138" y="67" width="26" height="85" fill="#1a5ca8"/>
  <rect x="170" y="87" width="20" height="65" fill="#1a5ca8"/>
  <rect x="34" y="112" width="18" height="40" fill="#1a5ca8"/>
  <polygon points="34,112 43,97 52,112" fill="#1a5ca8"/>
  <rect x="105" y="67" width="7" height="7" fill="white" opacity="0.7"/>
  <rect x="118" y="67" width="7" height="7" fill="white" opacity="0.7"/>
  <rect x="105" y="81" width="7" height="7" fill="white" opacity="0.7"/>
  <rect x="118" y="81" width="7" height="7" fill="white" opacity="0.7"/>
  <circle cx="152" cy="82" r="58" fill="none" stroke="#1a5ca8" stroke-width="7" opacity="0.6"/>
  <line x1="198" y1="128" x2="223" y2="153" stroke="#1a5ca8" stroke-width="11" stroke-linecap="round" opacity="0.8"/>
  <text x="130" y="178" text-anchor="middle" font-size="38" font-weight="900" fill="#1a5ca8" font-family="'Arial Black',Arial,sans-serif" letter-spacing="3">MDZ</text>
  <text x="130" y="194" text-anchor="middle" font-size="9.5" fill="#555" font-family="Arial,sans-serif" letter-spacing="1.5">BUILDING INSPECTIONS &amp; CONSULTING</text>
</svg>`;

const ANAMIK_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 78" width="290" height="73">
  <rect x="0" y="2" width="72" height="72" rx="3" fill="#6B1212"/>
  <circle cx="36" cy="30" r="16" fill="none" stroke="#e8b88a" stroke-width="3.5"/>
  <line x1="36" y1="12" x2="36" y2="48" stroke="#e8b88a" stroke-width="3.5"/>
  <line x1="25" y1="56" x2="47" y2="56" stroke="#e8b88a" stroke-width="3.5"/>
  <line x1="36" y1="56" x2="36" y2="67" stroke="#e8b88a" stroke-width="3.5"/>
  <text x="88" y="37" font-size="27" font-weight="bold" fill="#1a1a1a" font-family="Georgia,'Times New Roman',serif" letter-spacing="1">ANAMIK</text>
  <text x="88" y="57" font-size="13" fill="#333" font-family="Georgia,'Times New Roman',serif">Electrical Consulting &amp; Contracting</text>
</svg>`;

const ANAMIK_GC = [
  'Anamik Electric shall not be held liable for errors or omissions in designs by others, nor inadequacies of materials and equipment specified or supplied by others.',
  'Equipment and material supplied by Anamik Electric are warranted up to one year from completion date or to the extent that the same are warranted by the manufacturer. Lamps are warranted 90 days.',
  'Anamik Electric shall not be held liable for indirect loss or damage.',
  'Unless included in this proposal, all bonding and/or special insurance requirements are supplied at additional costs.',
  'If a formal contract is required, its conditions must not deviate from this proposal without the permission of Anamik Electric.',
  'Anything (verbal or written) expressed or implied elsewhere, which is contrary to these conditions, shall be null and void.',
  'Due to market conditions all material or items set forth in this contract proposal are subject to price increase through time of contract and subject to review every 10 (thirty) days, unless this proposal expressly states that pricing for any such products or items are firm and fixed.',
  'Quoted price includes a 4% discount for the timely payment by cash or check.'
];

const ANAMIK_TERMS = [
  'After goods are delivered and signed for, our responsibility ceases. The title to ownership of this material remains with Anamik Electric until bill is paid in full. There will be additional charges for any returned check.',
  'In the event that Anamik Electric conducts trenching, Anamik Electric cannot be held responsible for any damage to underground systems (e.g. sprinklers, water pipes, phone, television or electrical cables, etc.)',
  'Any costs incurred as a result of nonpayment of invoice including court costs and attorney\'s fees, plus legal rate of interest charged from date of billing, will be sustained by the customer.',
  'The terms of this contract do not authorize overtime or change orders unless approved and signed by the general contractor or owner. Anamik Electric reserves the right to assess the cumulative impact of any changes to its work. Anamik Electric will not be responsible for job stoppage or disputes caused by other contractors.',
  'The work described in this contract will be installed in a neat workmanlike manner in accordance with city and county codes. Any work to be performed not herein described including corrections of code violations is not part of this proposal and shall be performed on a time and material basis unless otherwise specified.',
  'Whenever applicable, this contract shall serve as a waiver of notice or intention to claim a lien under the Florida statutes.',
  'Either this contract proposal or the AIA Document A401-1997 is the only acceptable contract.',
  'All payments shall be progressive payments during the course of the job based on work completed and/or time tickets. Payments must be made upon completion of the job. This proposal shall be deemed accepted only if signed and returned within five (5) days from the date of contract. After the expiration of said five (5) days, the acceptance of the proposal shall be optional with Anamik Electric.',
  'We thank you for the opportunity to submit this quote, and hope we may have the privilege of completing this work for you. If accepted, please sign one copy of this proposal, noting the terms and conditions on the back, and return it to our office. This proposal is based upon our entering into a contract with you in a form that is mutually satisfactory. Permit fees and sales tax, if applicable, must be added to the above amount.'
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
    proposalTitle: '',
    projectOverview: '',
    opinionText: '',
    projectAddress: '',
    pay1: '',
    pay2: '',
    pay3: '',
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

      ${S.mode==='A'?`
      <div class="form-group">
        <label>Proposal Title</label>
        <input type="text" value="${esc(S.proposalTitle)}" placeholder="e.g. Electrical Service Equipment Evaluation Proposal"
          oninput="S.proposalTitle=this.value;save()">
      </div>`:''}
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
          <label>Scope Details <span class="label-note">one item per line → becomes bullet points in proposal</span></label>
          <textarea rows="3" placeholder="* Perform a field inspection of the electrical service equipment&#10;* Review accessible panels, feeders, and related equipment&#10;* Document existing service characteristics…"
            oninput="svcSet('${sv.id}','details',this.value)">${esc(sv.details||'')}</textarea>
        </div>
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
        <label>Project Overview <span class="label-note">appears as PROJECT OVERVIEW paragraph in proposal</span></label>
        <textarea rows="4" placeholder="Describe the situation and why this evaluation is needed…"
          oninput="S.projectOverview=this.value;save()">${esc(S.projectOverview)}</textarea>
      </div>
      <div class="form-group">
        <label>Professional Opinion Discussion <span class="label-note">optional — appears as a section in the proposal</span></label>
        <textarea rows="3" placeholder="Professional opinion on the findings or concerns…"
          oninput="S.opinionText=this.value;save()">${esc(S.opinionText)}</textarea>
      </div>
      <button class="btn-primary btn-full btn-mt" onclick="submitServices()">Review Estimate →</button>
    </div>`;
}

function addService() {
  S.services.push({ id:'sv'+Date.now(), name:SERVICES_A[0], custom:'', details:'', hours:0, crew:'solo', fee:0 });
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
        <label>Project / Site Address <span class="label-note">where the work is performed</span></label>
        <textarea rows="2" placeholder="Street, City, State ZIP"
          oninput="S.projectAddress=this.value;save()">${esc(S.projectAddress)}</textarea>
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

      ${S.mode==='B' ? renderPaySchedule() : ''}

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

function renderPaySchedule() {
  const total = totalB();
  const matT  = totalMat();
  const drawT = totalDraw();
  const p1def = Math.round(matT + drawT);
  const p3def = Math.round((total - p1def) * 0.10);
  const p2def = total - p1def - p3def;
  if (!S.pay1) { S.pay1 = p1def > 0 ? String(p1def) : ''; S.pay2 = p2def > 0 ? String(p2def) : ''; S.pay3 = p3def > 0 ? String(p3def) : ''; save(); }
  return `
    <div class="review-card">
      <div class="section-title">Payment Schedule (Anamik Format)</div>
      <p class="field-note" style="margin-bottom:12px">These appear in the contract proposal. Auto-calculated — edit as needed.</p>
      <div class="form-group">
        <label>Payment 1 — Up front (materials + plans)</label>
        <div class="input-prefix"><span>$</span>
          <input type="number" min="0" step="0.01" value="${S.pay1||''}" placeholder="0.00"
            oninput="S.pay1=this.value;save()"></div>
      </div>
      <div class="form-group">
        <label>Payment 2 — After installation</label>
        <div class="input-prefix"><span>$</span>
          <input type="number" min="0" step="0.01" value="${S.pay2||''}" placeholder="0.00"
            oninput="S.pay2=this.value;save()"></div>
      </div>
      <div class="form-group">
        <label>Payment 3 — 10% after Final Inspection</label>
        <div class="input-prefix"><span>$</span>
          <input type="number" min="0" step="0.01" value="${S.pay3||''}" placeholder="0.00"
            oninput="S.pay3=this.value;save()"></div>
      </div>
    </div>`;
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
  return S.mode === 'A' ? renderProposalMDZ() : renderProposalAnamik();
}

// ---------- NUMBER TO WORDS (for Anamik opening paragraph) ----------
function numToWords(n) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                 'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                 'Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function h(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num/10)] + (num%10?' '+ones[num%10]+' ':' ');
    return ones[Math.floor(num/100)] + ' Hundred ' + h(num%100);
  }
  const dollars = Math.floor(n);
  const cents   = Math.round((n - dollars) * 100);
  let words = '';
  if (dollars >= 1000000) { words += h(Math.floor(dollars/1000000)) + 'Million '; }
  if (dollars >= 1000)    { words += h(Math.floor((dollars%1000000)/1000)) + 'Thousand '; }
  words += h(dollars % 1000);
  words = words.trim();
  return (words || 'Zero') + ' Dollars and ' + String(cents).padStart(2,'0') + '/100';
}

// ---------- MDZ TEMPLATE (Mode A) ----------
function renderProposalMDZ() {
  const excl  = [...EXCL_A.filter((_,i)=>!S.removed.includes(i)), ...S.customExcl];
  const total = totalA();
  const half  = total / 2;
  const title = S.proposalTitle ||
    (S.services.map(sv=>sv.name==='Custom...'?sv.custom:sv.name).join(' & ') + ' Proposal');
  const footer = `MDZ Building Inspections &amp; Consulting &nbsp;|&nbsp; 2200 N Commerce Parkway, Suite 200, Weston FL 33326 &nbsp;|&nbsp; Lic# EC1305900 &nbsp;|&nbsp; Lic# CGC1532054`;

  const scopeServices = S.services.map(sv => {
    const name    = sv.name==='Custom...' ? sv.custom : sv.name;
    const bullets = (sv.details||'').split('\n').filter(l=>l.trim())
      .map(l=>`<p class="mdz-bullet">* ${esc(l.replace(/^\*\s*/,'').trim())}</p>`).join('');
    return `<h3 class="mdz-sub-blue">${esc(name)}</h3>${bullets}`;
  }).join('');

  return `
<div class="proposal-wrapper">
  <div class="proposal-toolbar no-print">
    <button class="btn-back" onclick="back()">&#8592; Back</button>
    <button class="btn-primary" onclick="window.print()">&#8659; Save as PDF</button>
  </div>
  <div class="mdz-doc">
    <div class="mdz-page-footer">${footer}</div>

    <!-- COVER PAGE -->
    <div class="mdz-cover mdz-page-break-after">
      <div class="mdz-logo-wrap">${MDZ_LOGO}</div>
      <h1 class="mdz-cover-title">${esc(title.toUpperCase())}</h1>
      <div class="mdz-cover-prepared">
        <p><strong>Prepared For:</strong></p>
        <p>${esc(S.client.name)}</p>
        ${S.client.address ? `<p>${esc(S.client.address)}</p>` : ''}
        <br>
        <p>Proposal Number: ${esc(S.num)}</p>
        <p>Date: ${esc(S.date.toUpperCase())}</p>
      </div>
    </div>

    <!-- COMPANY INFO -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Company Information</h2>
      <p class="mdz-body"><strong>MDZ BUILDING INSPECTIONS &amp; CONSULTING</strong><br>
      2200 N Commerce Parkway, Suite 200<br>
      Weston, Florida 33326<br>
      Lic# EC1305900 | Lic# CGC1532054</p>
    </div>

    <!-- OWNER INFO -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Owner Information</h2>
      <p class="mdz-body">
        ${esc(S.client.name)}<br>
        ${S.client.address ? esc(S.client.address)+'<br>' : ''}
        ${S.client.contact ? 'Contact: '+esc(S.client.contact) : ''}
      </p>
    </div>

    <!-- SCOPE -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Scope of Professional Services</h2>
      ${S.projectOverview ? `
        <h3 class="mdz-sub-blue">PROJECT OVERVIEW</h3>
        <p class="mdz-body">${esc(S.projectOverview)}</p>` : ''}
      <h3 class="mdz-sub-blue">SCOPE OF SERVICES</h3>
      <p class="mdz-body">${COMPANY.name} will provide the following services:</p>
      ${scopeServices}
      ${S.opinionText ? `
        <h3 class="mdz-sub-blue">PROFESSIONAL OPINION DISCUSSION</h3>
        <p class="mdz-body">${esc(S.opinionText)}</p>` : ''}
    </div>

    <!-- EXCLUSIONS -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Exclusions</h2>
      <p class="mdz-body">This proposal does not include:</p>
      ${excl.map(e=>`<p class="mdz-bullet">* ${esc(e)}</p>`).join('')}
      <p class="mdz-body" style="margin-top:8px">Additional meetings requested shall be billed at $${RATE_OOS}.00 per hour, portal-to-portal.</p>
    </div>

    <!-- CLIENT RESPONSIBILITIES -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Client Responsibilities</h2>
      <p class="mdz-body">The client shall provide:</p>
      ${RESP_A.map(r=>`<p class="mdz-bullet">* ${esc(r)}</p>`).join('')}
    </div>

    <!-- INVESTMENT -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Investment</h2>
      <table class="mdz-table">
        <tr class="mdz-table-head">
          <td class="mdz-td-label">Description</td>
          <td class="mdz-td-amount">Amount</td>
        </tr>
        ${S.services.map(sv=>`
        <tr>
          <td class="mdz-td-label">${esc(sv.name==='Custom...'?sv.custom:sv.name)}</td>
          <td class="mdz-td-amount">$${fmt(sv.fee)}</td>
        </tr>`).join('')}
        <tr class="mdz-total-row">
          <td class="mdz-td-label"><strong>Total Professional Fee</strong></td>
          <td class="mdz-td-amount"><strong>$${fmt(total)}</strong></td>
        </tr>
      </table>
    </div>

    <!-- PAYMENT TERMS -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Payment Terms</h2>
      <p class="mdz-bullet">* 50% Deposit Due Upon Acceptance: $${fmt(half)}</p>
      <p class="mdz-bullet">* 50% Balance Due Upon Delivery of Report: $${fmt(half)}</p>
    </div>

    <!-- ACCEPTANCE -->
    <div class="mdz-section">
      <h2 class="mdz-section-head">Acceptance</h2>
      <p class="mdz-body">Respectfully Submitted,</p>
      <br>
      <p class="mdz-body">
        Miguel Mendez<br>
        Project Manager<br>
        MDZ Building Inspections &amp; Consulting<br><br>
        Lic. EC1305900 | Lic. CGC1532054<br><br>
        Certified Commercial Inspector BN6469<br><br>
        Certified Electrical Plans Examiner PX3483<br><br>
        Level II Infrared Thermographer #275348
      </p>
      <br><br>
      <div class="mdz-sig-line"></div>
      <p class="mdz-body" style="margin-top:6px">Authorized Signature / Date</p>
      <br>
      <div class="mdz-sig-line"></div>
      <p class="mdz-body" style="margin-top:6px">Printed Name / Title</p>
    </div>
  </div>
</div>`;
}

// ---------- ANAMIK TEMPLATE (Mode B) ----------
function renderProposalAnamik() {
  const excl  = [...EXCL_B.filter((_,i)=>!S.removed.includes(i)), ...S.customExcl];
  const total = totalB();
  const p1    = parseFloat(S.pay1)||0;
  const p2    = parseFloat(S.pay2)||0;
  const p3    = parseFloat(S.pay3)||0;

  const scopeLines = S.scopeText.split('\n').filter(l=>l.trim() && !l.trim().startsWith('*')).map(l=>esc(l.trim()));
  const matLines   = S.materials.filter(m=>m.item).map(m=>`Furnish and install ${esc(m.item)}.`);
  const drawLine   = (S.drawType!=='none' && totalDraw()>0) ? ['Electrical plans required to be processed and approved by City.'] : [];

  const includedWork = [
    'Standard insurance coverage.',
    'Electrical fees not to exceed 3% of the contract cost.',
    ...drawLine,
    ...matLines,
    ...scopeLines
  ];

  return `
<div class="proposal-wrapper">
  <div class="proposal-toolbar no-print">
    <button class="btn-back" onclick="back()">&#8592; Back</button>
    <button class="btn-primary" onclick="window.print()">&#8659; Save as PDF</button>
  </div>
  <div class="anamik-doc">

    <!-- HEADER -->
    <div class="anamik-header">
      ${ANAMIK_LOGO}
    </div>
    <div class="anamik-divider"></div>

    <p class="anamik-doc-title">CONTRACT PROPOSAL</p>

    <!-- CUSTOMER + PROJECT -->
    <div class="anamik-two-col">
      <div>
        <p class="anamik-label">Customer:</p>
        <p class="anamik-addr">
          ${esc(S.client.name)}<br>
          ${S.client.address ? esc(S.client.address)+'<br>' : ''}
          ${S.client.contact ? esc(S.client.contact) : ''}
        </p>
      </div>
      <div>
        <p class="anamik-label">Project address:</p>
        <p class="anamik-addr">${S.projectAddress ? esc(S.projectAddress) : esc(S.client.address||'')}</p>
      </div>
    </div>

    <!-- OPENING PARAGRAPH -->
    <p class="anamik-opening">We are pleased to submit a Contract proposal to perform the electrical work for the above referenced project in the amount of <strong>$${fmt(total)} (${numToWords(total)})</strong>. This proposal is based upon performance of the work as detailed in the plans and specifications listed above using the most practical and economical practices of the industry with the addition of the terms and qualifications listed below.</p>

    <!-- PAYMENT SCHEDULE -->
    ${(p1||p2||p3) ? `
    <p class="anamik-pay-head">Payment schedule is as the following</p>
    ${p1 ? `<p class="anamik-pay-item">($${fmt(p1)}) up front to order and purchase materials and submit plans to city</p>` : ''}
    ${p2 ? `<p class="anamik-pay-item">($${fmt(p2)}) after the installation of materials</p>` : ''}
    ${p3 ? `<p class="anamik-pay-item">($${fmt(p3)}) 10% after the Final Inspection.</p>` : ''}
    ` : ''}

    <!-- INCLUDED WORK -->
    <p class="anamik-list-head">The following work is included in this proposal:</p>
    <ol class="anamik-list">
      ${includedWork.map(w=>`<li>${w}</li>`).join('')}
    </ol>

    <!-- NOT INCLUDED -->
    <p class="anamik-list-head">The following work is NOT included in this proposal:</p>
    <ol class="anamik-list">
      ${excl.map(e=>`<li>${esc(e)}</li>`).join('')}
    </ol>

    <p class="anamik-body">Proposal is only for the above mentioned. Any other work will be done under new proposal.<br>
    Price of materials may be subject to change based on inflation.</p>

    <!-- GENERAL CONDITIONS -->
    <p class="anamik-list-head">General Conditions:</p>
    <ol class="anamik-list">
      ${ANAMIK_GC.map(c=>`<li>${c}</li>`).join('')}
    </ol>

    <!-- TERMS & CONDITIONS -->
    <p class="anamik-list-head">Terms and Conditions:</p>
    ${ANAMIK_TERMS.map(t=>`<p class="anamik-terms-para">${t}</p>`).join('')}

    <!-- SIGNATURE BLOCK -->
    <p class="anamik-accepted">APPROVED AND ACCEPTED</p>
    <div class="anamik-sig-block">
      <div>
        <p class="anamik-sig-by">By:</p>
        <div class="anamik-sig-line"></div>
        <p class="anamik-sig-name">Miguel Mendez &nbsp;&nbsp;&nbsp; President</p>
      </div>
      <div>
        <p class="anamik-sig-by">By:</p>
        <div class="anamik-sig-line"></div>
        <p class="anamik-sig-name">Owner or Agent for Owner</p>
        <p class="anamik-sig-name">Accepted _____ day of _____________, _______</p>
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
