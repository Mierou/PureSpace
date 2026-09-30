/* PureSpace demo: shared router + localStorage state */
(() => {
  const R = {login:'1._welcome_login_interactive',home:'2._customer_home_interactive',new:'3._create_request_details_interactive',
    messages:'4._messages_interactive',requests:'5._my_requests_active_completed',profile:'6._customer_profile',chat:'4b._message_reply_chat_detail',chat_elena:'4c._chat_ate_elena_quotation',chat_dodong:'4d._chat_dodong_cleaners_confirmed',chat_teresa:'4e._chat_teresa_m._completed_rebook'};
  const go = k => { location.href = '../' + R[k] + '/code.html'; };
  const DEF = {reqs:[],chat:[{me:0,t:"Ma'am, hapit na nako mahuman ang luyo nga bahin (almost done with the back area)."},{me:0,t:'I attached a photo of the drainage.'}],pay:'GCash',notif:true};
  const ps = { get(){ try { return Object.assign({}, DEF, JSON.parse(localStorage.ps || '{}')); } catch(e){ return {...DEF}; } },
    set(p){ localStorage.ps = JSON.stringify(Object.assign(ps.get(), p)); } };
  Object.assign(window, {go, ps, switchNavTab: p => go({'customer-home':'home','service-requests':'requests','customer-messages':'messages','customer-profile':'profile'}[p] || 'home')});
  const toast = m => { const t = document.createElement('div'); t.textContent = m;
    t.className = 'fixed left-1/2 -translate-x-1/2 bottom-28 z-[100] bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full text-sm shadow-lg';
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };
  window.toast = toast; if (!window.showToast) window.showToast = toast;
  const chatFor = n => /Juan/.test(n) ? 'chat' : /Elena/.test(n) ? 'chat_elena' : /Dodong/.test(n) ? 'chat_dodong' : /Teresa/.test(n) ? 'chat_teresa' : null;
  const openChat = n => { const k = chatFor(n); k ? go(k) : toast('Chat with ' + n + ' opens here (demo)'); };
  const rebook = () => { ps.set({rebook:{title:'Move-in Yard & Porch Clearing', budget:585, pay:'GCash'}}); toast('Rebooking Teresa — 10% repeat discount'); setTimeout(() => go('new'), 700); };
  Object.assign(window, {chatFor, openChat, rebook});
  const navMap = {Home:'home',Requests:'requests',Messages:'messages',Profile:'profile'};
  document.addEventListener('click', e => {
    const b = e.target.closest('button, a'); if (!b) return;
    const txt = b.textContent.replace(/\s+/g, ' ').trim();
    const stop = fn => { e.preventDefault(); e.stopImmediatePropagation(); fn(); };
    if (b.closest('nav') && navMap[txt.split(' ').pop()]) return stop(() => go(navMap[txt.split(' ').pop()]));
    if (b.dataset.path === 'messages' && !b.closest('nav')) return stop(() => history.length > 1 ? history.back() : go('messages'));
    if (document.body.dataset.new && b.closest('header')) return stop(() => /person/.test(txt) ? go('profile') : toast('No new notifications'));
    if (b.id === 'btn-create-request') return stop(() => go('new'));
    if (b.id === 'logout-btn') return stop(() => { localStorage.removeItem('ps'); go('login'); });
    const cm = (b.getAttribute('onclick') || '').match(/Chat opened with (Kuya Juan|Elena|Dodong)/); if (cm) return stop(() => openChat(cm[1]));
    if (b.id === 'hero-cleanup-btn' || /New Inquiry|New Request/.test(txt)) return stop(() => go('new'));
    if (/Review Quote/.test(txt)) return stop(() => go('chat_elena'));
    if (/Book Again/.test(txt)) return stop(() => rebook());
    if (/Track Status|^reply|Reply →|View Live Photo/i.test(txt) && !/\/4[b-e]\./.test(location.pathname)) return stop(() => go('chat'));
  }, true);
  // open the right chat from a message-row card
  document.addEventListener('click', e => { const c = e.target.closest('article, li, .cursor-pointer'); const k = c && chatFor(c.textContent);
    if (k && location.pathname.includes('4._messages') && c.textContent.length < 400 && !e.target.closest('button')) go(k); });
})();
