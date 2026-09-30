/* Requests page: user-posted requests -> awaiting offers -> offers received -> scheduled */
const B = {awaiting:['schedule','AWAITING OFFERS','bg-surface-container-high text-on-surface-variant'], offers:['sell','3 OFFERS RECEIVED','bg-tertiary-fixed text-on-tertiary-fixed-variant'], scheduled:['event_available','SCHEDULED','bg-secondary-container text-on-secondary-container']};
const mine = () => ps.get().reqs;
const save = r => { ps.set({reqs:r}); draw(); };
function card(r, i) {
  const st = r.acc ? 'scheduled' : r.offers ? 'offers' : 'awaiting', [ic, lb, cl] = B[st];
  const act = st == 'offers' ? `<button onclick="__req=${i};openOffersSheet()" class="flex-1 h-12 rounded-xl bg-secondary text-on-secondary font-label-lg">Compare 3 Offers →</button>`
    : st == 'scheduled' ? `<button onclick="openChat('${r.acc.who}')" class="flex-1 h-12 rounded-xl bg-primary text-on-primary font-label-lg">Message ${r.acc.who}</button>`
    : `<div class="flex-1 h-12 rounded-xl bg-surface-container-low text-on-surface-variant text-sm flex items-center justify-center gap-2"><span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Cleaners are reviewing</div>`;
  return `<article class="request-card w-full rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden" data-mine="1" data-card-type="${st == 'scheduled' ? 'scheduled' : 'awaiting'}"><div class="p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm ${cl}"><span class="material-symbols-outlined text-[14px]">${ic}</span>${lb}</span>
      <div class="text-right"><p class="font-headline-md text-headline-md">₱${r.acc ? r.acc.amt : r.budget}</p><p class="font-label-sm text-label-sm text-on-surface-variant uppercase">${r.acc ? 'Agreed Rate' : 'Your Budget'}</p></div></div>
    <div><h3 class="font-headline-sm text-headline-sm">${r.title}</h3><p class="text-on-surface-variant text-sm mt-1">${r.street || ''}${r.brgy ? ', ' + r.brgy : ''} • ${r.when || 'Flexible'}</p></div>
    ${r.acc ? `<div class="bg-surface-container-low rounded-xl p-3 text-sm"><span class="font-label-lg">${r.acc.who}</span> accepted • pay via ${r.pay || 'GCash'}</div>` : ''}
    <div class="flex gap-2">${act}<button onclick="cancelMine(${i})" aria-label="Cancel" class="w-12 h-12 rounded-xl bg-surface-container-low text-on-surface-variant flex items-center justify-center"><span class="material-symbols-outlined">delete</span></button></div></div></article>`;
}
function draw() {
  const list = document.getElementById('active-list'), r = mine();
  list.querySelectorAll('[data-mine]').forEach(e => e.remove());
  list.insertAdjacentHTML('afterbegin', r.map(card).join(''));
  if (r.some(x => x.seedId)) list.querySelectorAll('article').forEach(a => { if (!a.dataset.mine && /PS-4091/.test(a.textContent)) a.remove(); });
  const n = 2 + r.length - r.filter(x => x.seedId).length;
  document.querySelector('#tab-active-btn span:last-child').textContent = `Active (${n})`;
  const p = document.querySelector('.sub-filter-pill[data-filter="all"]'); if (p) p.lastChild.textContent = p.lastChild.textContent.replace(/\(\d+\)/, `(${n})`);
}
function cancelMine(i) { if (confirm('Cancel this request? Verified cleaners will be notified.')) { save(mine().filter((_, j) => j != i)); toast('Request cancelled'); } }
window.__req = null;
const _close = closeOffersSheet; closeOffersSheet = () => { _close(); __req = null; };
acceptOffer = (who, amt) => {
  const i = __req; closeOffersSheet();
  if (i == null) return toast(`Offer from ${who} (₱${amt}) accepted!`);
  save(mine().map((r, j) => j == i ? {...r, offers:1, acc:{who, amt}} : r)); toast(`${who} accepted — job scheduled!`);
};
draw();
mine().forEach((r, i) => { if (!r.offers && !r.acc) setTimeout(() => { save(mine().map((x, j) => j == i ? {...x, offers:1} : x)); toast('New offers received!'); }, 3500 + i * 1500); });
