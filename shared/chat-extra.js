/* Chat detail pages: persistence, Teresa's interactions, Elena quote -> booking */
(() => {
  const P = location.pathname, K = /4b\./.test(P) ? 'juan' : /4c\./.test(P) ? 'elena' : /4d\./.test(P) ? 'dodong' : 'teresa';
  const $ = id => document.getElementById(id), mk = h => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstElementChild; };
  const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const th = () => ps.get().threads || {};
  const put = h => ps.set({threads:{...th(), [K]:[...(th()[K] || []), h.replace(/\b(translate-y-2|opacity-0)\b/g, '')]}});
  const anchor = $('dynamic-message-anchor');
  let box = $('dynamicRepliesContainer') || $('chatThread') || (anchor && anchor.parentNode);
  if (K === 'teresa') {
    const w = [...document.querySelectorAll('.self-start')].filter(x => /Salamat kaayo Ma/.test(x.textContent)).pop();
    w.insertAdjacentHTML('afterend', '<div id="dyn" class="flex flex-col gap-space-sm w-full px-margin"></div>'); box = $('dyn');
  }
  (th()[K] || []).forEach(h => { const n = mk(h); anchor ? box.insertBefore(n, anchor) : box.appendChild(n); });
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType == 1 && put(n.outerHTML)))).observe(box, {childList:true});
  const down = () => setTimeout(() => scrollTo({top:document.body.scrollHeight, behavior:'smooth'}), 50);

  document.addEventListener('click', e => {   // harmless demo toasts for header/toolbar icons
    const l = (e.target.closest('button') || {getAttribute:() => ''}).getAttribute('aria-label') || '';
    if (/Voice Call/.test(l)) toast('Calling… (demo)'); else if (/More options/.test(l)) toast('Chat options (demo)');
    else if (/Take Photo|Attach File|Voice Message|Voice Note/.test(l)) toast('Attachments and voice notes are disabled in the demo');
  });

  if (K === 'elena') {
    const done = () => { $('quote-action-group').classList.add('hidden'); const b = $('quote-accepted-badge'); b.classList.remove('hidden'); b.classList.add('flex'); };
    if (ps.get().reqs.some(r => r.seedId == 'PS-4091')) done();
    $('accept-btn').addEventListener('click', () => {
      if (ps.get().reqs.some(r => r.seedId == 'PS-4091')) return;
      ps.set({reqs:[{title:'Storefront Sweep & Glass', street:'C. Padilla St.', brgy:'San Nicolas', when:'Tomorrow, 9:00 AM', budget:550, pay:ps.get().pay, offers:1, acc:{who:'Ate Elena S.', amt:550}, seedId:'PS-4091', at:Date.now()}, ...ps.get().reqs]});
      toast('Quote accepted — booked for tomorrow 9:00 AM');
    });
  }

  if (K === 'teresa') {
    const inp = document.querySelector('input[placeholder^="Message Teresa"]');
    const mine = t => `<div class="flex flex-col items-end gap-1 max-w-[85%] self-end"><div class="bg-secondary text-on-secondary rounded-xl rounded-tr-xs p-space-sm shadow-sm"><p class="font-body-md text-body-md">${esc(t)}</p></div><div class="flex items-center gap-1 pr-1 text-on-surface-variant font-label-sm text-label-sm"><span>Just now</span><span class="material-symbols-outlined text-[14px] text-secondary">done</span></div></div>`;
    const hers = t => `<div class="flex flex-col max-w-[85%] self-start"><span class="font-label-sm text-label-sm text-on-surface-variant mb-0.5">Teresa M. • Just now</span><div class="bg-surface-container-lowest text-on-surface p-space-sm rounded-xl rounded-tl-sm shadow-sm font-body-md text-body-md">${t}</div></div>`;
    const say = t => { t = t.trim(); if (!t) return; box.appendChild(mk(mine(t))); down();
      setTimeout(() => { box.appendChild(mk(hers(/friday|free|slot/i.test(t) ? "Yes Ma'am Maria, I'm free Friday morning! Tap “Book Teresa Again” to lock it in." : "Sige Ma'am, salamat! Message lang ko anytime.")));  down(); }, 1200); };
    inp.addEventListener('keydown', e => { if (e.key == 'Enter') { say(inp.value); inp.value = ''; } });
    const receipt = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['PURESPACE OFFICIAL E-RECEIPT\nRef: PS-98214\nJob: Move-in Yard & Porch Clearing\nCleaner: Teresa M.\nDate: Oct 12, 2023\nPaid via GCash: PHP 650.00\n'], {type:'text/plain'})); a.download = 'PureSpace-Receipt-PS-98214.txt'; a.click(); toast('Receipt downloaded'); };
    document.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const t = b.textContent.replace(/\s+/g, ' ').trim();
      const stop = f => { e.preventDefault(); e.stopImmediatePropagation(); f(); };
      if (/Send Message/.test(b.getAttribute('aria-label') || '')) return stop(() => { say(inp.value); inp.value = ''; });
      if (/Book Teresa Again|View Slot/.test(t)) return stop(rebook);
      if (/Download Official Receipt/.test(t)) return stop(receipt);
      if (b.className.includes('rounded-full') && b.className.includes('px-3') && t.length > 8) return stop(() => say(t));
    }, true);
  }
})();
