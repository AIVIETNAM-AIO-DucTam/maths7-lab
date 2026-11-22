/* Maths 7 Lab — UI polish layer: page transitions, scroll reveal, ripples, sliding tab pill,
   card spotlight, header progress bar, back-to-top, haptics, splash, offline (service worker). */
(function () {
  'use strict';
  const { $, $$, h, icon, SFX } = APP;
  const docEl = document.documentElement;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAB_ORDER = ['learn', 'practice', 'explore', 'read', 'listen', 'test'];
  const PAGE_ORDER = ['home', 'exam', 'words', 'progress'];

  /* ---------- page transitions (View Transitions API, falls back to the CSS .view animation) ---------- */
  function rank(hash) {
    const s = (hash || '#home').replace(/^.*#/, '') || 'home';
    const m = s.match(/^u(\d+)(?:-(\w+))?$/);
    if (m) return { unit: +m[1], tab: Math.max(0, TAB_ORDER.indexOf(m[2] || 'learn')) };
    return { page: Math.max(0, PAGE_ORDER.indexOf(s)) };
  }
  function direction(oldURL, newURL) {
    const a = rank(oldURL), b = rank(newURL);
    if (a.unit && b.unit) {
      if (a.unit === b.unit) return b.tab === a.tab ? 'fade' : b.tab > a.tab ? 'fwd' : 'back';
      return b.unit > a.unit ? 'fwd' : 'back';
    }
    if (!a.unit && !b.unit) return b.page === a.page ? 'fade' : b.page > a.page ? 'fwd' : 'back';
    return b.unit ? 'up' : 'down';
  }
  APP.transition = function (fn, ev) {
    if (!document.startViewTransition || reduce() || document.hidden) return fn();
    docEl.dataset.vt = ev ? direction(ev.oldURL, ev.newURL) : 'fade';
    docEl.classList.add('vt');
    let t;
    try { t = document.startViewTransition(fn); } catch (e) { docEl.classList.remove('vt'); return fn(); }
    // a quick second navigation skips the first transition: that is fine, just keep the console clean
    [t.ready, t.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
    const my = (APP.transition.n = (APP.transition.n || 0) + 1);
    t.finished.catch(() => {}).then(() => { if (my === APP.transition.n) { docEl.classList.remove('vt'); delete docEl.dataset.vt; } });
  };

  /* ---------- after every mount into <main> ---------- */
  const RV = '.card, .ucard, .fcard, .xcard, .flip, .player, .qblock, .facts > *, .stats3 > *';
  let io = null;
  function reveal(root) {
    if (reduce() || !('IntersectionObserver' in window)) return;
    if (!io) io = new IntersectionObserver((es) => {
      let k = 0;
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target; io.unobserve(el);
        el.style.transitionDelay = Math.min(k++, 5) * 70 + 'ms';
        el.classList.add('rv-in');
        const done = () => { if (!el.classList.contains('rv')) return; if (el.dataset.rvA) { el.style.animation = 'none'; delete el.dataset.rvA; } el.classList.remove('rv', 'rv-in'); el.style.transitionDelay = ''; };
        el.addEventListener('transitionend', done, { once: true }); setTimeout(done, 1400);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    const vh = innerHeight;
    $$(RV, root).forEach((el) => {
      const anc = el.parentElement && el.parentElement.closest(RV);
      if (anc && root.contains(anc)) return;           // only the outermost card animates
      if (el.closest('[hidden]')) return;
      if (el.getBoundingClientRect().top < vh * 0.94) return; // already on screen: the view animation covers it
      if (getComputedStyle(el).animationName !== 'none') el.dataset.rvA = '1'; // its entrance animation is replaced by the reveal
      el.classList.add('rv'); io.observe(el);
    });
  }
  let lastPill = null;
  function pill() {
    const bar = $('.tabbar'); if (!bar) { lastPill = null; return; }
    const on = $('a.on', bar); if (!on) return;
    let p = $('.pill', bar); if (!p) { p = h('i', { class: 'pill', 'aria-hidden': 'true' }); bar.prepend(p); }
    const view = bar.closest('[data-n]'); const n = view ? view.dataset.n : '';
    const to = { x: on.offsetLeft, w: on.offsetWidth };
    if (lastPill && lastPill.n === n && !reduce() && (lastPill.x !== to.x)) {
      p.style.transition = 'none'; p.style.transform = `translateX(${lastPill.x}px)`; p.style.width = lastPill.w + 'px';
      void p.offsetWidth; p.style.transition = '';
      bar.classList.add('moving'); setTimeout(() => bar.classList.remove('moving'), 480);
    }
    p.style.transform = `translateX(${to.x}px)`; p.style.width = to.w + 'px';
    lastPill = Object.assign({ n }, to);
    bar.classList.add('has-pill');
  }
  function onMount() { const m = $('#main'); if (!m) return; reveal(m); pill(); onScroll(); hideSplash(); }
  function watchMain() {
    const m = $('#main'); if (!m) return false;
    new MutationObserver((recs) => { if (recs.some((r) => r.addedNodes.length)) onMount(); }).observe(m, { childList: true });
    onMount(); return true;
  }
  addEventListener('resize', () => { lastPill = null; pill(); }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { lastPill = null; pill(); });

  /* ---------- ripple on buttons ---------- */
  const RP = '.btn, .ibtn, .opt, .tabbar a, .chip, .strands button, .nav a, .bnav a, .toc a, .play';
  document.addEventListener('pointerdown', (e) => {
    if (reduce() || e.button > 0) return;
    const el = e.target.closest(RP); if (!el || el.disabled || el.classList.contains('no-rp')) return;
    const r = el.getBoundingClientRect(); const d = Math.max(r.width, r.height) * 2.1;
    const s = document.createElement('span'); s.className = 'rp';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    el.classList.add('rp-host'); el.append(s);
    setTimeout(() => s.remove(), 700);
  }, { passive: true, capture: true });

  /* ---------- spotlight that follows the mouse on cards ---------- */
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest && e.target.closest('.ucard, .fcard, .xcard'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
  }, { passive: true });

  /* ---------- header shadow, reading progress, back-to-top ---------- */
  let prog = null, top = null, ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const hdr = $('.hdr'); if (!hdr) return;
      if (!prog) { prog = h('div', { class: 'sprog', 'aria-hidden': 'true' }); hdr.append(prog); }
      if (!top) {
        top = h('button', { class: 'totop', 'aria-label': 'Lên đầu trang', title: 'Lên đầu trang', html: icon('arrowL').replace('<svg', '<svg style="transform:rotate(90deg)"') });
        top.onclick = () => { scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' }); SFX.play('whoosh'); };
        document.body.append(top);
      }
      const y = scrollY, max = docEl.scrollHeight - innerHeight;
      hdr.classList.toggle('scrolled', y > 6);
      prog.style.transform = `scaleX(${max > 300 ? Math.min(1, y / max) : 0})`;
      top.classList.toggle('show', y > innerHeight * 1.4);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- haptics on phones (Android; iOS ignores) ---------- */
  if (navigator.vibrate) {
    const orig = SFX.play.bind(SFX);
    const PAT = { correct: 12, wrong: [28, 40, 28], combo: [10, 30, 10], complete: [15, 40, 15, 40, 50], level: [20, 30, 20, 30, 60], star: 10 };
    SFX.play = function (name) { const r = orig(name); if (SFX.on && PAT[name] && navigator.userActivation && navigator.userActivation.hasBeenActive) { try { navigator.vibrate(PAT[name]); } catch (e) {} } return r; };
  }

  /* ---------- splash ---------- */
  function hideSplash() {
    const s = document.getElementById('splash'); if (!s || s.classList.contains('out')) return;
    s.classList.add('out'); setTimeout(() => s.remove(), 500);
  }

  /* ---------- offline + install (service worker) — only on the public https site ---------- */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    let framed = false; try { framed = window.top !== window.self; } catch (e) { framed = true; }
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (framed || location.protocol !== 'https:' && !local) return;
    if (local && !/[?&]sw=1/.test(location.search)) return; // keep local development uncached
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  function start() { if (!watchMain()) { setTimeout(start, 30); return; } registerSW(); setTimeout(() => { try { sessionStorage.removeItem('m7retry'); } catch (e) {} }, 4000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0)); else setTimeout(start, 0);
})();
