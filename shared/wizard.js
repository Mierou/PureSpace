/* Steps 2-4 of the request wizard */
const W = {brgy:'Mambaling', street:'Sitio Lawis', note:'', day:0, slot:'Morning · 8–11 AM', budget:500, pay:ps.get().pay};
{ const rb = ps.get().rebook; if (rb) { formState.title = rb.title; const t = document.getElementById('cleaningTitle'); if (t) t.value = rb.title; W.budget = rb.budget; W.pay = rb.pay; ps.set({rebook:null}); setTimeout(() => toast('Rebooking with 10% repeat discount'), 300); } }
document.getElementById('cleaningRequestForm').insertAdjacentHTML('afterend','<div id="wz" class="hidden pb-28"></div>');
const chip = (l,on,fn) => `<button type="button" onclick="${fn}" class="h-9 px-4 rounded-full font-label-md text-label-md border ${on?'bg-secondary text-on-secondary border-secondary':'bg-surface-container-lowest text-on-surface-variant border-surface-container'}">${l}</button>`;
const H = t => `<h3 class="font-headline-sm text-headline-sm mt-5 mb-2">${t}</h3>`;
const inp = (v,ph,k,type='text') => `<input type="${type}" value="${v}" placeholder="${ph}" oninput="W.${k}=this.value" class="w-full h-[52px] rounded-lg px-4 bg-surface-container-lowest border border-surface-container focus:border-secondary outline-none">`;
const days = [...Array(5)].map((_,i) => { const d = new Date(Date.now()+i*864e5); return i ? d.toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'}) : 'Today'; });
const dayLabel = () => days[W.day] + ', ' + W.slot.split(' · ')[1];
function render(n) {
  const f = formState;
  if (n == 2) return H('Barangay') + `<div class="flex flex-wrap gap-2">${['Mambaling','Basak San Nicolas','Pardo','Labangon','Guadalupe','Lahug'].map(b=>chip(b,W.brgy==b,`W.brgy='${b}';show(2)`)).join('')}</div>`
    + H('Street / Sitio') + inp(W.street,'e.g. Sitio Lawis, Rizal St.','street') + H('Landmark or notes for the cleaner') + inp(W.note,'Near the blue sari-sari store','note')
    + `<button type="button" onclick="toast('Location pinned (demo)')" class="mt-4 w-full h-12 rounded-lg bg-secondary-container/40 text-secondary font-label-lg flex items-center justify-center gap-2"><span class="material-symbols-outlined text-[20px]">my_location</span>Use my current location</button>`;
  if (n == 3) return H('Date') + `<div class="flex flex-wrap gap-2">${days.map((d,i)=>chip(d,W.day==i,`W.day=${i};show(3)`)).join('')}</div>`
    + H('Time window') + `<div class="flex flex-wrap gap-2">${['Morning · 8–11 AM','Midday · 11 AM–2 PM','Afternoon · 2–5 PM'].map(s=>chip(s,W.slot==s,`W.slot='${s}';show(3)`)).join('')}</div>`
    + `<p class="mt-4 text-on-surface-variant text-sm">Cleaners will confirm an exact arrival time in chat.</p>`;
  const row = (a,b) => `<div class="flex justify-between gap-4 py-1.5"><span class="text-on-surface-variant">${a}</span><span class="font-label-lg text-right">${b}</span></div>`;
  return H('Your budget (₱)') + `<div class="flex flex-wrap gap-2">${[300,500,800,1200].map(b=>chip('₱'+b,W.budget==b,`W.budget=${b};show(4)`)).join('')}</div><div class="mt-3">${inp(W.budget,'Custom amount','budget','number')}</div>`
    + H('Pay with') + `<div class="flex gap-2">${['GCash','Maya','Cash'].map(p=>chip(p,W.pay==p,`W.pay='${p}';show(4)`)).join('')}</div>`
    + H('Summary') + `<div class="bg-surface-container-lowest rounded-xl p-4 border border-surface-container">${row('Job',f.title)}${row('Category',f.category)}${row('Size',f.areaSize)}${row('Where',W.street+', '+W.brgy)}${row('When',dayLabel())}${row('Photos',f.photos.length)}${row('Hauling',f.wasteDisposal?'Yes':'No')}</div>`;
}
function show(n) { document.getElementById('cleaningRequestForm').style.display = n == 1 ? '' : 'none'; const w = document.getElementById('wz'); w.classList.toggle('hidden', n == 1); if (n > 1) w.innerHTML = render(n); scrollTo(0,0); }
const _set = setStep; setStep = n => { _set(n); show(n); };
document.addEventListener('click', e => {
  const b = e.target.closest('#continueBtn, #backNavBtn'); if (!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const n = formState.currentStep;
  if (b.id == 'backNavBtn') return n > 1 ? setStep(n-1) : go('home');
  if (n == 2 && !W.street.trim()) return toast('Please add your street or sitio');
  if (n == 4 && !(+W.budget > 0)) return toast('Enter a budget');
  if (n < 4) return setStep(n+1);
  const f = formState;
  ps.set({pay:W.pay, reqs:[{id:'PS-'+(1000+Math.floor(Math.random()*9000)),title:f.title,cat:f.category,size:f.areaSize,photos:f.photos.length,haul:f.wasteDisposal,brgy:W.brgy,street:W.street,when:dayLabel(),budget:+W.budget,pay:W.pay,at:Date.now()}, ...ps.get().reqs]});
  toast('Request posted! Cleaners will send offers.'); setTimeout(() => go('requests'), 900);
}, true);
