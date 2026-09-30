/* PureSpace cleaner (partner) dashboard: router, shared state and page behaviours */
(() => {
  const P = location.pathname;
  const PAGE = /cleaner_1/.test(P) ? 'board' : /cleaner_2/.test(P) ? 'active' : /cleaner_3/.test(P) ? 'wallet' : 'profile';
  const DIR = {board:'cleaner_1_job_board_leads', active:'cleaner_2_active_job_proof_of_work', wallet:'cleaner_3_partner_earnings_wallet', profile:'cleaner_4_partner_profile_verification'};
  const go = k => { location.href = k === 'customer' ? '../../customer/2._customer_home_interactive/code.html' : k === 'login' ? '../../customer/1._welcome_login_interactive/code.html' : '../' + DIR[k] + '/code.html'; };
  const ps = { get() { let r = {}; try { r = JSON.parse(localStorage.ps || '{}'); } catch (e) {} return Object.assign({reqs:[], cn:[], bids:[]}, r); },
               set(p) { localStorage.ps = JSON.stringify(Object.assign(this.get(), p)); } };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => '₱' + Number(n).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2});
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sub = (from, to) => { const el = $$('body *').find(e => !e.children.length && e.textContent.trim() === from); if (el) el.textContent = to; return el; };
  let tt; const toast = (m, ms) => { let t = $('#cl-toast'); if (!t) { t = document.createElement('div'); t.id = 'cl-toast'; t.className = 'fixed left-1/2 -translate-x-1/2 top-20 z-[100] max-w-[90%] bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-2xl text-sm shadow-lg text-center transition-opacity'; document.body.appendChild(t); }
    t.textContent = m; t.style.opacity = 1; clearTimeout(tt); tt = setTimeout(() => { t.style.opacity = 0; }, ms || Math.max(2200, m.length * 45)); };
  window.alert = m => toast(String(m));
  const job = () => ps.get().job1 || null, jstatus = () => (job() || {}).status || 'active';

  /* ---- shell: nav, online pill, bell, avatar ---- */
  const NAV = {'job-board':'board', 'active-dispatches':'active', 'earnings-wallet':'wallet', 'partner-profile':'profile'};
  document.addEventListener('click', e => {
    const a = e.target.closest('nav a[data-path]'); if (a) { e.preventDefault(); e.stopImmediatePropagation(); return go(NAV[a.dataset.path] || 'board'); }
    if (e.target.closest('a[href="#"]')) e.preventDefault();
  }, true);
  const isOn = () => ps.get().online !== false;
  const lab = $$('header span').find(s => /^(online|offline)$/i.test(s.textContent.trim()));
  function paint() { if (!lab) return; const on = isOn(); lab.textContent = on ? 'Online' : 'Offline'; lab.classList.toggle('text-secondary', on); lab.classList.toggle('text-outline', !on);
    const dot = lab.previousElementSibling; if (dot) { dot.classList.toggle('bg-secondary', on); dot.classList.toggle('bg-outline', !on); dot.classList.toggle('animate-pulse', on); } }
  function setOnline(v) { ps.set({online:v}); paint(); const t = $('#dispatchToggle'); if (t) t.checked = v; if (PAGE === 'board') applyFilters(); }
  if (lab) lab.parentElement.addEventListener('click', () => { setOnline(!isOn()); toast(isOn() ? 'You are Online: ready for direct customer matches!' : 'You are Offline: dispatches paused.'); });
  const bell = $('button[aria-label="Notifications"]');
  if (bell) bell.addEventListener('click', () => { const n = ps.get().cn.filter(x => x.to === 'cleaner')[0]; toast(n ? n.t : 'No new notifications'); });
  const av = $('header img[alt="Profile"]'); if (av) { av.style.cursor = 'pointer'; av.addEventListener('click', () => go('profile')); }
  paint();

  /* ---- Job board ---- */
  let list, applyFilters = () => {}, bidCtx = null, drawerCtx = null;
  if (PAGE === 'board') {
    const first = $$('h3').find(h => /Backyard & Drainage Declogging/.test(h.textContent)); const card0 = first.closest('div.rounded-xl'); list = card0.parentElement;
    const slider = $('#radiusSlider'), search = $('input[placeholder^="Search by barangay"]'), tgl = $('#dispatchToggle');
    const meta = c => { const t = $('h3', c).textContent.trim(), oc = ($('button[onclick^="openBidModal"]', c) || {getAttribute: () => ''}).getAttribute('onclick') || '';
      Object.assign(c.dataset, {lead:1, km:parseFloat((c.textContent.match(/([\d.]+) km away/) || [0, 0])[1]), amt:+(oc.match(/,\s*(\d+)\)/) || [0, 0])[1],
        urgent:/URGENT|Today|ASAP/i.test(c.textContent) ? 1 : 0, yard:/Backyard|Yard|Garden|Drain/i.test(t) ? 1 : 0, store:/Storefront|Glass|Shop/i.test(t) ? 1 : 0}); };
    $$('div.rounded-xl', list).filter(c => c.parentElement === list).forEach(meta);
    const km = id => (0.5 + (parseInt(String(id).replace(/\D/g, '')) % 25) / 10).toFixed(1);
    const live = r => `<div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden transition-all duration-200 hover:shadow-md" data-live="${esc(r.id)}" data-lead="1" data-km="${km(r.id)}" data-amt="${r.budget || 450}" data-urgent="${/today|asap/i.test(r.when || '') ? 1 : 0}" data-yard="${/yard/i.test(r.cat || '') ? 1 : 0}" data-store="${/store/i.test(r.cat || '') ? 1 : 0}">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-tertiary-fixed-dim"></div>
      <div class="flex items-start justify-between gap-space-sm pt-1"><div class="flex flex-col min-w-0"><div class="flex items-center gap-1.5 flex-wrap"><span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">fiber_new</span> New request</span><span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">${esc(r.when || 'Flexible')}</span></div>
        <h3 class="font-headline-sm text-headline-sm text-primary font-bold mt-1 tracking-tight">${esc(r.title)}</h3>
        <div class="flex items-center gap-1 text-on-surface-variant mt-0.5"><span class="material-symbols-outlined text-[16px] text-secondary">location_on</span><span class="font-label-md text-label-md font-medium truncate">${esc(r.street || '')}${r.brgy ? ', ' + esc(r.brgy) : ''}</span><span class="text-outline-variant">•</span><span class="font-label-md text-label-md text-secondary font-bold">${km(r.id)} km away</span></div></div>
        <div class="flex flex-col items-end shrink-0 text-right"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Client budget</span><span class="font-headline-sm text-headline-sm text-on-secondary-container font-bold">₱${r.budget || 450}</span><span class="font-label-sm text-label-sm text-tertiary-container font-medium">${esc(r.pay || 'GCash')}</span></div></div>
      <div class="flex items-center gap-2 py-1"><div class="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed font-label-md text-label-md">MS</div><div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface font-semibold">Maria S.</span><span class="font-body-sm text-body-sm text-on-surface-variant">Verified Resident • ★ 5.0</span></div></div>
      <div class="flex flex-wrap gap-1.5"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">${esc(r.cat || 'Custom')} • ${esc(String(r.size || '').split(' ')[0])}</span>${r.haul ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">Hauling needed</span>' : ''}</div>
      <div class="grid grid-cols-2 gap-2"><button data-act="bid" class="h-11 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-transform"><span class="material-symbols-outlined text-[18px]">bolt</span> Quick Bid ₱${r.budget || 450}</button><button data-act="view" class="h-11 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-1 active:scale-[0.98] transition-transform">View Details</button></div></div>`;
    ps.get().reqs.filter(r => r.id && !r.acc).reverse().forEach(r => list.insertAdjacentHTML('afterbegin', live(r)));
    list.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const c = b.closest('[data-live]'), r = ps.get().reqs.find(x => x.id === c.dataset.live); if (!r) return;
      if (b.dataset.act === 'bid') { bidCtx = {reqId:r.id, title:r.title}; openBidModal(r.title, r.budget || 450); }
      else openDrawer(r.title, 'Maria S.', `${r.street || ''}, ${r.brgy || ''} (${c.dataset.km} km)`, '₱' + (r.budget || 450), `${r.cat} • ${r.size} area${r.haul ? ' • waste hauling requested' : ''}. Posted by Maria S. (${r.id}).`, r.when || 'Flexible', (r.photos || 0) + ' Photos'); });
    list.insertAdjacentHTML('beforeend', '<div id="emptyMsg" class="hidden rounded-xl bg-surface-container-low p-space-md text-center text-on-surface-variant">No dispatches match right now. Try a wider radius or another filter.</div><div id="offlineMsg" class="hidden rounded-xl bg-surface-container-low p-space-md text-center text-on-surface-variant">You\'re offline, so new dispatches are paused. Tap the status pill to go Online.</div>');
    applyFilters = () => { const f = typeof currentActiveFilter !== 'undefined' ? currentActiveFilter : 'all', rad = parseFloat(slider.value), q = (search.value || '').toLowerCase(), on = isOn(); let n = 0;
      $$('[data-lead]', list).forEach(c => { const d = c.dataset, ok = on && +d.km <= rad && (f === 'all' || (f === 'immediate' && +d.urgent) || (f === 'yard' && +d.yard) || (f === 'storefront' && +d.store) || (f === 'budget' && +d.amt >= 500)) && (!q || c.textContent.toLowerCase().includes(q)); c.style.display = ok ? '' : 'none'; if (ok) n++; });
      $('#emptyMsg').classList.toggle('hidden', !on || n > 0); $('#offlineMsg').classList.toggle('hidden', on); };
    const wrap = (name, fn) => { const o = window[name]; window[name] = (...a) => fn(o, ...a); };
    wrap('setFilter', (o, ...a) => { o(...a); applyFilters(); }); wrap('updateRadius', (o, ...a) => { o(...a); applyFilters(); });
    wrap('openBidModal', (o, t, a) => { if (!bidCtx || bidCtx.title !== t) bidCtx = {title:t}; o(t, a); });
    wrap('closeBidModal', o => { o(); bidCtx = null; });
    wrap('openDrawer', (o, t, c, l, p, d, tm, ph) => { drawerCtx = {title:t, amt:+((String(p).match(/\d[\d,]*/) || ['450'])[0].replace(/,/g, ''))}; o(t, c, l, p, d, tm, ph); });
    const dbtn = $('#jobDetailDrawer button[onclick*="drawerCustomer"]'); if (dbtn) dbtn.onclick = () => { closeDrawer(); if (!bidCtx || bidCtx.title !== drawerCtx.title) bidCtx = null; setTimeout(() => openBidModal(drawerCtx.title, drawerCtx.amt), 280); };
    function markBids() { const bids = ps.get().bids; $$('[data-lead]', list).forEach(c => { const t = $('h3', c).textContent.trim(), b = bids.find(x => x.title === t), btn = $('button[onclick^="openBidModal"], button[data-act="bid"]', c);
      if (b && btn) { btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">check_circle</span> Bid ₱${b.amt} sent`; btn.className = (btn.classList.contains('w-full') ? 'w-full ' : '') + 'h-11 px-4 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg flex items-center justify-center gap-1.5'; btn.style.pointerEvents = 'none'; } }); }
    wrap('confirmBidSubmission', o => { const amt = +$('#bidAmountInput').value || 0, ctx = bidCtx || {title:$('#bidModalJobTitle').textContent.trim()}; o();
      ps.set({bids:[...ps.get().bids.filter(b => b.title !== ctx.title), {title:ctx.title, amt, reqId:ctx.reqId, at:Date.now()}]});
      if (ctx.reqId) ps.set({reqs:ps.get().reqs.map(r => r.id === ctx.reqId ? {...r, cleanerBid:{amt, at:Date.now()}} : r)}); markBids(); });
    if (tgl) { tgl.checked = isOn(); tgl.addEventListener('change', () => setOnline(tgl.checked)); }
    if (search) search.addEventListener('input', applyFilters);
    markBids(); applyFilters();
    const unseen = ps.get().cn.filter(n => n.to === 'cleaner' && !n.seen)[0];
    if (unseen) { setTimeout(() => toast(unseen.t), 600); ps.set({cn:ps.get().cn.map(n => n.to === 'cleaner' ? {...n, seen:true} : n)}); }
  }

  /* ---- Active job ---- */
  if (PAGE === 'active') {
    const cbs = $$('.task-checkbox'), btn = $('#submitJobBtn');
    const save = patch => { const o = job() || {}; ps.set({job1:{status:'active', ...o, checks:cbs.map(c => c.checked), photo:!$('#afterPreview').classList.contains('hidden'), ...patch}}); };
    function paintStatus() { const s = jstatus(); if (s !== 'review' && s !== 'paid') return; btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-[22px]">check_circle</span><span>${s === 'paid' ? 'Escrow Released ₱382.50 ✓' : 'Submitted! Waiting for Maria to approve'}</span>`;
      btn.classList.replace('bg-primary', 'bg-secondary'); $$('.grid-cols-5 > div').forEach((d, i) => { d.classList.remove('animate-pulse', 'bg-surface-container-highest'); d.classList.add(s === 'review' && i === 4 ? 'bg-surface-container-highest' : 'bg-secondary'); });
      sub('Step 3 of 5', s === 'paid' ? 'Step 5 of 5' : 'Step 4 of 5'); sub('Step 4 of 5', s === 'paid' ? 'Step 5 of 5' : 'Step 4 of 5'); sub('In Progress (Active Job)', s === 'paid' ? 'Completed & Paid' : 'Awaiting Client Approval'); if (s === 'paid') sub('Escrow Secured', 'Escrow Released'); }
    const j = job(); if (j) { cbs.forEach((c, i) => { c.checked = !!(j.checks || [])[i]; }); updateChecklistStats(); if (j.photo) triggerMockCamera(); }
    paintStatus();
    cbs.forEach(c => c.addEventListener('change', () => save()));
    ['captureLiveBtn', 'afterPlaceholder'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('click', () => setTimeout(() => save(), 0)); });
    new MutationObserver(() => { if (btn.disabled && jstatus() === 'active') { save({status:'review'}); ps.set({cn:[{to:'customer', t:'Kuya Juan marked Backyard & Drainage Cleanup complete. Review and release ₱450.', at:Date.now()}, ...ps.get().cn]}); paintStatus(); setTimeout(paintStatus, 1700); } }).observe(btn, {attributes:true, attributeFilter:['disabled']});
    const sendBtn = $('#sendMsgBtn'); if (sendBtn) sendBtn.addEventListener('click', () => toast('Update sent to Maria'));
    const up = ps.get().reqs.filter(r => r.acc && /Juan/.test(r.acc.who)), anchor = $$('section').find(s => /Service Checklist/.test(s.textContent));
    if (up.length && anchor) { const sec = document.createElement('section'); sec.className = 'px-margin mt-space-sm';
      sec.innerHTML = `<div class="bg-secondary-container/30 rounded-xl p-space-md flex flex-col gap-2"><span class="font-label-sm text-label-sm uppercase font-bold text-secondary">Upcoming • accepted by client</span>${up.map(r => `<div class="flex items-center justify-between gap-2"><div class="min-w-0"><p class="font-label-lg text-label-lg text-primary font-bold truncate">${esc(r.title)}</p><p class="font-body-sm text-body-sm text-on-surface-variant truncate">${esc(r.street || '')}${r.brgy ? ', ' + esc(r.brgy) : ''} • ${esc(r.when || '')}</p></div><span class="font-headline-sm text-headline-sm text-secondary font-bold">₱${r.acc.amt}</span></div>`).join('')}</div>`; anchor.before(sec); }
  }

  /* ---- Wallet ---- */
  if (PAGE === 'wallet') {
    const W = () => Object.assign({avail:1450, hist:[]}, ps.get().wallet || {}), paid = () => jstatus() === 'paid';
    const escLab = $$('span').find(s => /In Escrow \(Pending Approval\)/.test(s.textContent)), escRow = escLab.closest('.justify-between');
    const rowTitle = $$('span').find(s => s.textContent.trim() === 'Backyard & Drainage Cleanup'), row = rowTitle.closest('.justify-between');
    function render() { const w = W(); const big = $$('span').find(s => /^₱[\d,]+\.\d{2}$/.test(s.textContent.trim()) && s.className.includes('font-display')); if (big) big.textContent = money(w.avail);
      if (paid()) { escRow.lastElementChild.textContent = '₱0.00'; escLab.nextElementSibling.textContent = 'No jobs under review'; const pill = $$('span', row).find(s => /In Escrow/i.test(s.textContent)); if (pill) { pill.textContent = 'Released'; pill.className = pill.className.replace(/bg-\S+|text-\S+/g, '') + ' bg-secondary-container text-on-secondary-container'; }
        sub('₱4,850', '₱5,232.50'); sub('11', '12'); sub('Progress: 2 of 5 completed', 'Progress: 3 of 5 completed'); sub('40%', '60%'); $$('[style*="width: 40%"]').forEach(e => { e.style.width = '60%'; }); }
      $$('[data-hist]').forEach(e => e.remove());
      row.insertAdjacentHTML('beforebegin', w.hist.map(h => `<div data-hist="1" class="${row.className}"><div class="flex items-center gap-space-sm min-w-0"><div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary shrink-0"><span class="material-symbols-outlined text-[20px]">account_balance_wallet</span></div><div class="flex flex-col min-w-0"><span class="font-label-lg text-label-lg text-primary truncate">${esc(h.t)}</span><span class="font-body-sm text-body-sm text-on-surface-variant truncate">GCash 0917 • • • 442 • ${new Date(h.at).toLocaleTimeString('en-PH', {hour:'numeric', minute:'2-digit'})}</span></div></div><div class="flex flex-col items-end shrink-0"><span class="font-label-lg text-label-lg text-on-surface font-bold">−${money(h.amt)}</span><span class="font-label-sm text-label-sm text-secondary">Sent</span></div></div>`).join('')); }
    render();
    document.addEventListener('click', e => {
      if (e.target.closest('#cashoutBtn')) { e.stopImmediatePropagation(); const cb = $('#cashoutBtn'), w = W(); if (w.avail <= 0) return toast('Nothing to cash out yet. Finish a job first.'); if (cb.disabled) return; const orig = cb.innerHTML; cb.disabled = true;
        cb.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span><span class="font-label-lg text-label-lg font-bold">Connecting to GCash...</span>';
        setTimeout(() => { ps.set({wallet:{...w, avail:0, hist:[{t:'Instant cashout to GCash', amt:w.avail, at:Date.now()}, ...w.hist]}}); render(); cb.innerHTML = `<span class="material-symbols-outlined text-[20px] text-secondary">check_circle</span><span class="font-label-lg text-label-lg font-bold">${money(w.avail)} sent to 0917•••442!</span>`; setTimeout(() => { cb.innerHTML = orig; cb.disabled = false; }, 2500); }, 1000); return; }
      const t = e.target.closest('button'); if (t && /Transfer to Maya/.test(t.textContent)) { e.stopImmediatePropagation(); toast('Maya / bank transfers are not enabled in the demo.'); }
    }, true);
  }

  /* ---- Partner profile ---- */
  if (PAGE === 'profile') {
    if (jstatus() === 'paid') sub('₱42,500', '₱42,882.50');
    function sheet() { if ($('#cl-sheet')) return; const s = document.createElement('div'); s.id = 'cl-sheet'; s.className = 'fixed inset-0 z-[90] bg-black/40 flex items-end';
      const row = (a, ic, t) => `<button data-a="${a}" class="w-full h-12 rounded-xl bg-surface-container flex items-center gap-3 px-4 font-label-lg text-label-lg text-on-surface"><span class="material-symbols-outlined">${ic}</span>${t}</button>`;
      s.innerHTML = `<div class="w-full bg-surface-container-lowest rounded-t-3xl p-space-md flex flex-col gap-2"><div class="flex items-center justify-between mb-1"><h3 class="font-headline-sm text-headline-sm text-primary font-bold">Partner settings</h3><button data-x class="material-symbols-outlined">close</button></div>${row('online', 'power_settings_new', isOn() ? 'Go Offline' : 'Go Online')}${row('customer', 'swap_horiz', 'Switch to Customer mode')}${row('logout', 'logout', 'Log out &amp; reset demo')}</div>`;
      document.body.appendChild(s);
      s.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (e.target === s || e.target.closest('[data-x]')) return s.remove(); if (!a) return;
        if (a.dataset.a === 'online') { setOnline(!isOn()); s.remove(); toast(isOn() ? 'You are Online' : 'You are Offline'); } else if (a.dataset.a === 'customer') go('customer'); else { localStorage.removeItem('ps'); go('login'); } }); }
    const gear = $('[aria-label="Partner Settings"]'); if (gear) gear.addEventListener('click', sheet);
    document.addEventListener('click', e => { const t = e.target.closest('a, button'); if (!t) return;
      if (/^View All/.test(t.textContent.trim())) toast('All 62 testimonials load here in the full app.');
      if (/Share Verified Credentials/.test(t.textContent)) { try { navigator.clipboard.writeText(location.href); } catch (x) {} toast('Verified credentials card link copied'); } });
  }
})();
