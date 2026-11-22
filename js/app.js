/* Maths 7 Lab — app shell: header, router, home, unit tabs (learn / practice / explore / read / listen / test), exam generator, words, progress */
(function () {
  'use strict';
  const { $, $$, h, icon, esc, U, P, SFX, Speech, FX, toast, store, QZ, VZ, FIG, TR, CHAT } = APP;
  const STRANDS = { number: ['Số học', 'Number'], algebra: ['Đại số', 'Algebra'], geometry: ['Hình học & đo lường', 'Geometry and measures'], stats: ['Thống kê & xác suất', 'Statistics and probability'] };
  const TABS = [['learn', 'Lý thuyết', 'book'], ['practice', 'Luyện tập', 'pencil'], ['explore', 'Mở rộng', 'rocket'], ['read', 'Đọc hiểu', 'news'], ['listen', 'Nghe', 'head'], ['test', 'Kiểm tra chương', 'trophy']];
  let main;

  /* ---------- glyphs ---------- */
  const GLYPH = {
    number: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M8 16h12M14 10v12M28 16h12M8 34h12M28 30l12 8M40 30l-12 8"/></svg>',
    algebra: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M8 12l12 14M20 12 8 26M26 36c4 0 4-12 8-12s4 12 8 12"/><path d="M28 12h12" /></svg>',
    geometry: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 40 24 10l16 30z"/><path d="M15 40a9 9 0 0 1 4-8"/><circle cx="34" cy="16" r="6"/></svg>',
    stats: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M8 40h32M12 40V26M20 40V14M28 40V22M36 40V8"/></svg>',
  };
  const LOGO = '<svg class="logo" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="var(--ink)"/><path d="M8 13h24" stroke="var(--surface)" stroke-width="1" opacity=".25"/><path d="M8 20h24M8 27h24M13 8v24M20 8v24M27 8v24" stroke="var(--surface)" stroke-width="1" opacity=".18"/><path d="M12 12h16l-9 18" fill="none" stroke="var(--accent)" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="29" cy="28" r="3" fill="var(--accent-2)"/></svg>';

  /* ---------- mastery ---------- */
  function unitStats(u) {
    const secs = u.sections.map((s) => P.best('q:u' + u.n + ':' + s.id) || 0);
    const prac = u.sections.map((s) => P.best('p:u' + u.n + ':' + s.id) || 0);
    const learn = U.mean(secs), practice = Math.max(U.mean(prac), P.best('p:u' + u.n + ':all') || 0);
    const test = P.best('test:u' + u.n) || 0, read = P.best('read:u' + u.n) || 0, listen = P.best('listen:u' + u.n) || 0;
    const mastery = Math.round(learn * 0.35 + practice * 0.15 + test * 0.3 + read * 0.1 + listen * 0.1);
    return { learn: Math.round(learn), practice: Math.round(practice), test, read, listen, mastery };
  }
  const starsHTML = (pct) => { if (pct == null) return '<span class="stars"><span class="off">★★★</span></span>'; const n = pct >= 100 ? 3 : pct >= 75 ? 2 : pct >= 50 ? 1 : 0; return '<span class="stars">' + [0, 1, 2].map((k) => `<span class="${k < n ? '' : 'off'}">★</span>`).join('') + '</span>'; };

  /* ---------- header ---------- */
  function header() {
    const theme = store.get('theme', null); if (theme) document.documentElement.setAttribute('data-theme', theme);
    const xp = h('div', { class: 'chip-xp', title: 'Cấp độ & XP' });
    const trB = h('button', { class: 'ibtn' + (TR.on ? ' on' : ''), 'aria-label': 'Bật/tắt dịch khi chạm vào từ', title: 'Dịch từ (chạm vào chữ tiếng Anh)', html: icon('tr'), onclick: () => { const on = TR.toggle(); trB.classList.toggle('on', on); SFX.play('tap'); } });
    const sB = h('button', { class: 'ibtn' + (SFX.on ? '' : ' off'), 'aria-label': 'Bật/tắt âm thanh', title: 'Âm thanh', html: icon(SFX.on ? 'sound' : 'mute'), onclick: () => { const on = SFX.toggle(); sB.innerHTML = icon(on ? 'sound' : 'mute'); sB.classList.toggle('off', !on); } });
    const isDark = () => { const t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
    const thB = h('button', { class: 'ibtn', 'aria-label': 'Đổi giao diện sáng/tối', title: 'Sáng / tối', html: icon(isDark() ? 'sun' : 'moon') });
    thB.onclick = () => { const nt = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nt); store.set('theme', nt); thB.innerHTML = icon(nt === 'dark' ? 'sun' : 'moon'); SFX.play('flip'); };
    const nav = h('nav', { class: 'nav', 'aria-label': 'Điều hướng chính' },
      h('a', { href: '#home', 'data-r': 'home', html: icon('home') + 'Trang chủ' }), h('a', { href: '#exam', 'data-r': 'exam', html: icon('exam') + 'Tạo đề' }),
      h('a', { href: '#words', 'data-r': 'words', html: icon('words') + 'Từ vựng' }), h('a', { href: '#progress', 'data-r': 'progress', html: icon('chart') + 'Tiến độ' }));
    const hdr = h('header', { class: 'hdr' }, h('div', { class: 'wrap' },
      h('a', { class: 'brand', href: '#home', html: LOGO + '<div><span>Maths 7</span> <span class="long">Lab</span><small>Ôn tập Toán 7 · Stage 7</small></div>' }), nav,
      h('div', { class: 'hdr-r' }, xp, trB, sB, thB)));
    const bnav = h('nav', { class: 'bnav', 'aria-label': 'Điều hướng' },
      h('a', { href: '#home', 'data-r': 'home', html: icon('home') + 'Trang chủ' }), h('a', { href: '#exam', 'data-r': 'exam', html: icon('exam') + 'Tạo đề' }),
      h('a', { href: '#words', 'data-r': 'words', html: icon('words') + 'Từ vựng' }), h('a', { href: '#progress', 'data-r': 'progress', html: icon('chart') + 'Tiến độ' }));
    const paintXP = () => { const L = P.level(); const st = P.data.streak.count || 0; xp.innerHTML = `<span class="lv">${L.lv}</span><span class="txt">${P.data.xp} XP</span>${st ? `<span class="fire" title="Chuỗi ngày học">${icon('fire').replace('<svg', '<svg style="width:15px;height:15px;vertical-align:-2px"')}${st}</span>` : ''}`; };
    paintXP(); APP.on('xp', paintXP);
    document.body.prepend(hdr); document.body.append(bnav);
  }

  /* ---------- router ---------- */
  function route() {
    const hs = (location.hash || '#home').slice(1);
    TR.close(); Speech.stop();
    let m;
    $$('[data-r]').forEach((a) => a.classList.toggle('on', a.dataset.r === hs || (hs.startsWith('u') && false)));
    if ((m = hs.match(/^u(\d+)(?:-(\w+))?$/)) && APP.unitMap[+m[1]]) { unitView(APP.unitMap[+m[1]], m[2] || 'learn'); }
    else if (hs === 'exam') examView();
    else if (hs === 'words') wordsView();
    else if (hs === 'progress') progressView();
    else homeView();
  }
  function mount(el, keepScroll) { main.innerHTML = ''; main.append(el); if (!keepScroll) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); }

  /* ---------- home ---------- */
  function homeView() {
    CHAT.setUnit(null);
    const last = store.get('lastUnit', 1);
    const totals = APP.units.map(unitStats); const mastered = totals.filter((t) => t.mastery >= 75).length;
    const board = h('div', { class: 'board' });
    const statsEl = h('div', { class: 'stats3' }, stat(P.data.xp, 'XP tích luỹ'), stat(mastered + '/16', 'Chương thành thạo'), stat(P.data.streak.count || 0, 'Ngày liên tiếp'));
    board.append(h('div', { class: 'bd-in' }, h('h3', {}, 'Bảng tiến độ của bạn'), h('div', { style: { fontFamily: 'var(--f-display)', fontSize: '1.3rem', fontWeight: 700 } }, `Cấp ${P.level().lv} · ${APP.LEVEL_NAMES[Math.min(P.level().lv - 1, 9)]}`), statsEl));
    heroCanvas(board);
    const hero = h('section', { class: 'hero wrap' }, h('div', { class: 'hero-grid' },
      h('div', {},
        h('div', { class: 'eyebrow', style: { color: 'var(--accent)' } }, 'Ôn tập theo sách Cambridge Lower Secondary Maths · Stage 7'),
        h('h1', { html: 'Ôn Toán 7 bằng tiếng Anh, <span class="hl">hiểu tới gốc</span>' }),
        h('p', { class: 'lead' }, '16 chương lý thuyết có hình minh hoạ tương tác, hàng trăm bài tập (bài trong sách và bài mới sinh ngẫu nhiên), bài đọc & bài nghe tiếng Anh, chatbot hỏi đáp và máy tạo đề tổng hợp.'),
        h('div', { class: 'row' }, h('a', { class: 'btn pri', href: `#u${last}-learn`, html: icon('book') + (P.data.hist.length ? `Học tiếp Chương ${last}` : 'Bắt đầu từ Chương 1') }), h('a', { class: 'btn ink', href: '#exam', html: icon('exam') + 'Tạo đề tổng hợp' })),
        h('p', { class: 'muted', style: { fontSize: '.85rem', marginTop: '14px' }, html: `${icon('tr').replace('<svg', '<svg style="width:15px;height:15px;vertical-align:-3px"')} Mẹo: chạm vào bất kỳ từ tiếng Anh nào trong bài để xem nghĩa tiếng Việt.` })),
      board));
    const feats = h('div', { class: 'feature-row wrap' },
      fcard('#exam', 'exam', 'Máy tạo đề', 'Chọn chương, số câu, thời gian, độ khó. Mỗi đề có mã để làm lại y hệt.'),
      fcard('#words', 'words', 'Từ vựng & flashcard', 'Toàn bộ thuật ngữ toán Anh–Việt, nghe phát âm, lật thẻ và trò chơi ghép từ.'),
      fcard('#progress', 'chart', 'Tiến độ & thành tích', 'Điểm từng chương, kỷ lục, XP, cấp độ và biểu đồ kết quả gần đây.'));
    let filter = store.get('strand', 'all');
    const grid = h('div', { class: 'units wrap' });
    const drawGrid = () => {
      grid.innerHTML = '';
      APP.units.filter((u) => filter === 'all' || u.strand === filter).forEach((u, k) => {
        const st = unitStats(u); const bar = h('i', { style: { width: '0%' } });
        const c = h('a', { class: 'ucard s-' + u.strand, href: `#u${u.n}-learn`, style: { animation: `viewIn .5s ${k * 0.035}s var(--ease) both` } },
          h('span', { class: 'glyph', html: GLYPH[u.strand] }), h('div', { class: 'num' }, String(u.n).padStart(2, '0')),
          h('h3', {}, u.title), h('div', { class: 'vi' }, u.vi), h('div', { class: 'secs' }, u.sections.map((s) => s.id).join(' · ')),
          h('div', { class: 'bar' }, bar), h('div', { class: 'meta' }, h('span', {}, STRANDS[u.strand][0]), h('span', {}, st.mastery + '% thành thạo')));
        grid.append(c); setTimeout(() => (bar.style.width = st.mastery + '%'), 200 + k * 30);
      });
    };
    const chips = h('div', { class: 'strands' });
    [['all', 'Tất cả', 'number'], ...Object.keys(STRANDS).map((k) => [k, STRANDS[k][0], k])].forEach(([k, l, sc]) => {
      const b = h('button', { class: (filter === k ? 'on ' : '') + 's-' + sc, type: 'button', html: (k === 'all' ? '' : '<i></i>') + l });
      b.onclick = () => { filter = k; store.set('strand', k); [...chips.children].forEach((x) => x.classList.remove('on')); b.classList.add('on'); SFX.play('tap'); drawGrid(); };
      chips.append(b);
    });
    drawGrid();
    mount(h('div', { class: 'view' }, hero, feats, h('div', { class: 'wrap' }, h('div', { class: 'sec-title' }, h('h2', {}, '16 chương của sách'), h('span', { class: 'muted' }, 'Learner\'s Book 7')), chips), grid,
      h('div', { class: 'foot wrap' }, 'Nội dung bám theo Cambridge Lower Secondary Mathematics Learner\'s Book 7 (2nd edition). Đây là trang ôn tập cá nhân, không phải sản phẩm chính thức của Cambridge. Tiến độ được lưu trên thiết bị này.')));
  }
  function stat(v, l) { const b = h('b', {}, '0'); setTimeout(() => (typeof v === 'number' ? APP.countUp(b, v) : (b.textContent = v)), 200); return h('div', { class: 'stat' }, b, h('span', {}, l)); }
  function fcard(href, ic, t, p) { return h('a', { class: 'fcard', href }, h('div', { class: 'ic', html: icon(ic) }), h('div', {}, h('h3', {}, t), h('p', {}, p))); }
  function heroCanvas(board) {
    const syms = ['π', '√', '∑', '÷', '×', '%', 'x²', '∠', '½', '−7', '3:4', 'n', '∞', '≥', '360°'];
    const pts = Array.from({ length: 18 }, (_, i) => ({ x: Math.random(), y: Math.random(), v: 0.02 + Math.random() * 0.04, s: syms[i % syms.length], z: 0.5 + Math.random() }));
    const c = VZ.canvasLoop(board, (ctx, w, hh, t) => {
      ctx.clearRect(0, 0, w, hh);
      ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, hh); ctx.stroke(); }
      for (let y = 0; y < hh; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const acc = VZ.css('--accent') || '#ff6'; ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.globalAlpha = 0.85; ctx.beginPath();
      const len = ((t * 0.25) % 1.4);
      for (let i = 0; i <= 200; i++) { const k = i / 200; if (k > len) break; const x = k * w, y = hh * 0.55 + Math.sin(k * 9 + t * 0.6) * hh * 0.16 * Math.cos(k * 2.2); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.globalAlpha = 1;
      ctx.font = '600 16px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      pts.forEach((p) => { p.y -= p.v * 0.016; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); } ctx.globalAlpha = 0.16 + 0.22 * p.z; ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.round(12 + p.z * 10)}px "JetBrains Mono", monospace`; ctx.fillText(p.s, p.x * w, p.y * hh); });
      ctx.globalAlpha = 1;
    });
    c.cv.style.opacity = '.9';
  }

  /* ---------- unit ---------- */
  function unitView(u, tab) {
    store.set('lastUnit', u.n); CHAT.setUnit(u);
    const st = unitStats(u);
    const existing = $('.unitview'); const same = existing && existing.dataset.n == u.n;
    const pattern = patternSVG(u.strand);
    const hero = h('section', { class: 'uhero' }, h('div', { class: 'pattern', html: pattern }), h('div', { class: 'wrap' },
      h('div', { class: 'big' }, String(u.n).padStart(2, '0')),
      h('div', { style: { minWidth: 0 } }, h('a', { class: 'crumb', href: '#home', html: icon('arrowL').replace('<svg', '<svg style="width:14px;height:14px"') + 'Unit ' + u.n + ' · ' + STRANDS[u.strand][1] }), h('h1', { 'data-tr': '' }, u.title), h('div', { class: 'sub' }, u.vi)),
      h('div', { class: 'ring' }, QZ.ring(st.mastery, 96, 9, 'thành thạo'))));
    hero.querySelector('.ring .bg') && (hero.querySelector('.ring .bg').style.stroke = 'rgba(255,255,255,.25)');
    const tabs = h('div', { class: 'tabs' }, h('div', { class: 'wrap' }, h('div', { class: 'tabbar', role: 'tablist' }, TABS.map(([k, l, ic]) => h('a', { href: `#u${u.n}-${k}`, class: k === tab ? 'on' : '', role: 'tab', 'aria-selected': k === tab ? 'true' : 'false', html: icon(ic) + l })))));
    const body = h('div', { class: 'ubody wrap' });
    const root = h('div', { class: 'view unitview s-' + u.strand, 'data-n': u.n }, hero, tabs, body);
    ({ learn: learnTab, practice: practiceTab, explore: exploreTab, read: readTab, listen: listenTab, test: testTab }[tab] || learnTab)(u, body);
    if (same) { root.classList.remove('view'); body.classList.add('view'); }
    mount(root, same);
    if (same) { const tb = $('.tabs', root); if (tb && window.scrollY > tb.offsetTop) window.scrollTo({ top: Math.max(0, hero.offsetHeight - 30) }); }
    const on = $('.tabbar a.on', root); on && on.scrollIntoView({ block: 'nearest', inline: 'center' });
    SFX.play('whoosh');
  }
  function patternSVG(strand) {
    const sy = { number: ['+', '−', '×', '÷', '7', '−3', '√', '%'], algebra: ['x', 'y', 'n', '=', '<', '2x', '()', '+'], geometry: ['△', '∠', '○', '□', '°', '⊥', '∥', '⬡'], stats: ['%', '∑', '½', '▮', '◔', 'P', '≈', '#'] }[strand];
    let g = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="pt-' + strand + '" width="160" height="120" patternUnits="userSpaceOnUse">';
    sy.forEach((c, i) => { g += `<text x="${(i % 4) * 40 + 10}" y="${Math.floor(i / 4) * 60 + 34}" font-size="${22 + (i % 3) * 6}" fill="#fff" font-family="JetBrains Mono, monospace" transform="rotate(${(i * 23) % 40 - 20} ${(i % 4) * 40 + 10} ${Math.floor(i / 4) * 60 + 34})">${c}</text>`; });
    return g + `</pattern></defs><rect width="100%" height="100%" fill="url(#pt-${strand})"/></svg>`;
  }
  function sectionPool(u, sec) { return (sec.bank || []).map((item) => ({ item, tag: sec.id })); }
  function unitPool(u) { return u.sections.flatMap((s) => sectionPool(u, s)); }

  // ---- learn tab ----
  function learnTab(u, body) {
    const toc = h('nav', { class: 'toc', 'aria-label': 'Các mục' });
    const content = h('div', { style: { minWidth: 0 } });
    // unit intro
    content.append(h('div', { class: 'card sect' },
      h('div', { class: 'eyebrow' }, 'Giới thiệu chương'),
      h('p', { class: 'prose', 'data-tr': '', style: { marginTop: '6px', fontSize: '1.05rem' }, html: u.blurb }),
      u.blurbVi ? h('div', { class: 'vibox', style: { marginTop: '12px' }, html: `<div class="lbl">${icon('tr').replace('<svg', '<svg style="width:15px;height:15px"')} Tiếng Việt</div>${u.blurbVi}` }) : null,
      u.words ? h('div', { style: { marginTop: '14px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '6px' } }, 'Từ khoá (Key words)'), h('div', { class: 'kw', 'data-tr': '' }, u.words.map(([en, vi]) => h('span', { title: vi }, en)))) : null));
    u.sections.forEach((sec) => {
      const best = P.best('q:u' + u.n + ':' + sec.id);
      const a = h('a', { href: 'javascript:void 0', html: `<span class="id">${sec.id}</span><span>${esc(sec.t)}</span><span class="st">${best != null ? '★'.repeat(best >= 100 ? 3 : best >= 75 ? 2 : best >= 50 ? 1 : 0) : ''}</span>`, onclick: (e) => { e.preventDefault(); const t = document.getElementById('s-' + sec.id); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
      toc.append(a);
      content.append(sectionCard(u, sec));
    });
    // scrollspy
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const id = e.target.id.slice(2); [...toc.children].forEach((a) => a.classList.toggle('on', a.querySelector('.id').textContent === id)); } }), { rootMargin: '-40% 0px -55% 0px' });
      setTimeout(() => $$('.sect[id]', content).forEach((s) => io.observe(s)), 100);
    }
    body.append(h('div', { class: 'learn-grid' }, toc, content));
  }
  function sectionCard(u, sec) {
    const card = h('section', { class: 'card sect', id: 's-' + sec.id });
    card.append(h('div', { class: 'sect-h' }, h('span', { class: 'id' }, sec.id), h('div', {}, h('h2', { 'data-tr': '' }, sec.t), h('div', { class: 'vi' }, sec.vi))));
    if (sec.goals) card.append(h('div', { class: 'goals', 'data-tr': '', html: `<b>In this section you will…</b><ul>${sec.goals.map((g) => `<li>${g}</li>`).join('')}</ul>` }));
    (sec.body || []).forEach((b) => card.append(block(b, u)));
    const best = P.best('q:u' + u.n + ':' + sec.id);
    const n = (sec.bank || []).length;
    const qbar = h('div', { class: 'quick' },
      h('div', {}, h('div', { class: 'q-t', html: `Kiểm tra nhanh mục ${sec.id} ${starsHTML(best)}` }), h('div', { class: 'q-s' }, best != null ? `Kỷ lục: ${best}% · 5 câu, chấm điểm ngay` : `5 câu trộn từ ${n} dạng bài · chấm điểm ngay`)),
      h('span', { class: 'spacer' }),
      h('button', { class: 'btn sc', html: icon('target') + 'Làm ngay', onclick: () => startQuick(u, sec) }));
    card.append(qbar);
    return card;
  }
  function startQuick(u, sec) {
    const pool = sectionPool(u, sec);
    QZ.run({ title: `Kiểm tra nhanh · ${sec.id} ${sec.t}`, qs: QZ.build(pool, 5), key: 'q:u' + u.n + ':' + sec.id, sc: 's-' + u.strand, regen: () => QZ.build(pool, 5), onDone: () => { const v = $('.unitview'); if (v && /learn/.test(location.hash || 'learn')) { const old = document.getElementById('s-' + sec.id); if (old) { const q = old.querySelector('.quick .q-t'); const best = P.best('q:u' + u.n + ':' + sec.id); if (q) q.innerHTML = `Kiểm tra nhanh mục ${sec.id} ${starsHTML(best)}`; } } } });
  }
  function block(b, u) {
    const [type, a, c] = b;
    switch (type) {
      case 'h': return h('h3', { class: 'blk', 'data-tr': '', style: { fontSize: '1.08rem', marginTop: '18px' }, html: a });
      case 'p': return h('div', { class: 'blk prose', 'data-tr': '', html: Array.isArray(a) ? a.map((x) => `<p>${x}</p>`).join('') : `<p>${a}</p>` });
      case 'rule': return h('div', { class: 'blk rule', 'data-tr': '', html: `<span class="lbl">${c || 'Remember'}</span>${a}` });
      case 'tip': return h('div', { class: 'blk tipbox', 'data-tr': '', html: icon('bulb') + `<div>${a}</div>` });
      case 'vi': return h('div', { class: 'blk vibox', html: `<div class="lbl">${icon('tr').replace('<svg', '<svg style="width:15px;height:15px"')} Ghi nhớ</div>${Array.isArray(a) ? '<ul>' + a.map((x) => `<li>${x}</li>`).join('') + '</ul>' : a}` });
      case 'list': return h('ul', { class: 'blk prose', 'data-tr': '', html: a.map((x) => `<li>${x}</li>`).join('') });
      case 'kw': return h('div', { class: 'blk kw', 'data-tr': '' }, a.map(([en, vi]) => h('span', { title: vi }, en)));
      case 'fig': return h('div', { class: 'blk qfig', html: a });
      case 'table': return h('div', { class: 'blk', 'data-tr': '', html: FIG.table(a, c) });
      case 'ex': return example(a);
      case 'viz': { const el = h('div', { class: 'blk' }); const f = APP.viz[a]; if (f) { try { f(el, c || {}, u); } catch (e) { console.error('viz ' + a, e); el.textContent = ''; } } else console.warn('missing viz', a); return el; }
      case 'html': return h('div', { class: 'blk', 'data-tr': '', html: a });
    }
    return h('div');
  }
  function example(ex) {
    const steps = ex.steps.map((s, i) => h('li', { class: i === ex.steps.length - 1 && ex.ansLast !== false ? 'ans' : '', hidden: true, html: s }));
    let shown = 0;
    const nextB = h('button', { class: 'btn sm sc', html: icon('eye') + 'Xem bước tiếp', onclick: () => { if (shown < steps.length) { steps[shown].hidden = false; shown++; SFX.play(shown === steps.length ? 'correct' : 'pop'); } if (shown >= steps.length) { nextB.disabled = true; allB.disabled = true; } } });
    const allB = h('button', { class: 'btn sm ghost', onclick: () => { steps.forEach((s) => (s.hidden = false)); shown = steps.length; nextB.disabled = true; allB.disabled = true; SFX.play('correct'); } }, 'Hiện toàn bộ lời giải');
    return h('div', { class: 'blk example' }, h('div', { class: 'ex-h', html: icon('pencil').replace('<svg', '<svg style="width:16px;height:16px"') + (ex.t || 'Worked example') }),
      h('div', { class: 'ex-q', 'data-tr': '', html: ex.q }), ex.fig ? h('div', { class: 'qfig', html: ex.fig }) : null,
      h('ol', { 'data-tr': '' }, steps), h('div', { class: 'ex-f' }, nextB, allB));
  }

  // ---- practice tab ----
  function practiceTab(u, body) {
    let src = 'all', count = 10;
    const head = h('div', { class: 'card panel', style: { marginBottom: '16px' } },
      h('div', { class: 'row' }, h('div', { style: { minWidth: 0, flex: '1 1 260px' } }, h('h2', { style: { fontSize: '1.3rem' } }, 'Luyện tập theo mục'), h('p', { class: 'muted', style: { fontSize: '.92rem' } }, 'Mỗi lượt gồm bài trong sách và bài mới sinh ngẫu nhiên (số liệu đổi mỗi lần). Trả lời xong là biết đúng/sai ngay, có lời giải.')),
        h('div', { class: 'stack', style: { gap: '8px' } },
          h('div', { class: 'row' }, h('span', { class: 'muted', style: { fontSize: '.8rem', fontWeight: 700 } }, 'NGUỒN'), VZ.seg([['all', 'Trộn'], ['book', 'Bài sách'], ['new', 'Bài mới']], src, (v) => (src = v))),
          h('div', { class: 'row' }, h('span', { class: 'muted', style: { fontSize: '.8rem', fontWeight: 700 } }, 'SỐ CÂU'), VZ.seg([5, 10, 15, 20], count, (v) => (count = v))))));
    const all = h('div', { class: 'card panel', style: { marginBottom: '16px', background: 'linear-gradient(135deg,var(--sc-soft),var(--surface) 70%)' } },
      h('div', { class: 'row' }, h('div', { style: { flex: '1 1 240px' } }, h('h3', {}, 'Luyện cả chương ' + u.n), h('p', { class: 'muted', style: { fontSize: '.9rem' }, html: `Trộn câu hỏi từ tất cả ${u.sections.length} mục ${starsHTML(P.best('p:u' + u.n + ':all'))}` })),
        h('button', { class: 'btn pri', html: icon('shuffle') + 'Bắt đầu', onclick: () => { const pool = unitPool(u); QZ.run({ title: `Luyện tập · Chương ${u.n}`, qs: QZ.build(pool, count, { src }), key: 'p:u' + u.n + ':all', sc: 's-' + u.strand, regen: () => QZ.build(pool, count, { src }) }); } })));
    const list = h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))' } });
    u.sections.forEach((sec) => {
      const nb = (sec.bank || []).filter((x) => !x.gen).length, ng = (sec.bank || []).filter((x) => x.gen).length;
      const best = P.best('p:u' + u.n + ':' + sec.id);
      list.append(h('div', { class: 'card panel stack' },
        h('div', { class: 'row' }, h('span', { class: 'pill sc' }, sec.id), h('span', { class: 'spacer' }), h('span', { html: starsHTML(best) })),
        h('h3', { 'data-tr': '' }, sec.t), h('div', { class: 'muted', style: { fontSize: '.88rem', marginTop: '-6px' } }, sec.vi),
        h('div', { class: 'row', style: { gap: '6px' }, html: `<span class="pill book">${icon('book')} ${nb} bài sách</span><span class="pill new">${icon('spark')} ${ng} dạng bài mới</span>` }),
        h('button', { class: 'btn sc', html: icon('pencil') + 'Luyện mục này', onclick: () => { const pool = sectionPool(u, sec); QZ.run({ title: `Luyện tập · ${sec.id} ${sec.t}`, qs: QZ.build(pool, count, { src }), key: 'p:u' + u.n + ':' + sec.id, sc: 's-' + u.strand, regen: () => QZ.build(pool, count, { src }) }); } })));
    });
    body.append(head, all, list);
  }

  // ---- explore tab ----
  function exploreTab(u, body) {
    const x = u.explore; if (!x) { body.append(h('div', { class: 'empty' }, 'Đang cập nhật.')); return; }
    const hero = h('div', { class: 'xhero' });
    if (x.hero && APP.viz[x.hero]) { const an = h('div', { class: 'anim' }); hero.append(an); try { APP.viz[x.hero](an, x.heroOpts || {}, u); } catch (e) { console.error(e); } }
    hero.append(h('div', { class: 'in' }, h('div', { class: 'eyebrow', style: { color: 'var(--accent-2)' } }, 'Beyond the textbook · Mở rộng'), h('h2', { 'data-tr': '' }, x.title), h('p', { 'data-tr': '', html: x.lead }), x.leadVi ? h('p', { style: { fontSize: '.9rem', opacity: '.8' } }, x.leadVi) : null));
    const cards = h('div', { class: 'xcards' });
    (x.cards || []).forEach((c, i) => {
      const card = h('article', { class: 'card xcard reveal' }, h('h3', { 'data-tr': '', html: `<span class="dot">${String(i + 1).padStart(2, '0')}</span>${c.t}` }), h('p', { 'data-tr': '', html: c.p }), c.vi ? h('p', { class: 'muted', style: { fontSize: '.88rem', marginTop: '6px' } }, c.vi) : null);
      if (c.viz && APP.viz[c.viz]) { const el = h('div'); card.append(el); try { APP.viz[c.viz](el, c.opts || {}, u); } catch (e) { console.error(e); } }
      if (c.fig) card.append(h('div', { class: 'qfig', html: c.fig }));
      cards.append(card);
    });
    const facts = h('div', { class: 'facts' });
    (x.facts || []).forEach((f) => { const fl = h('div', { class: 'flip reveal', tabindex: 0, role: 'button', 'aria-label': 'Lật thẻ' }, h('div', { class: 'fi' }, h('div', { class: 'fa' }, h('b', {}, f[0]), h('small', { 'data-tr': '' }, f[1]), h('small', { style: { marginTop: 'auto', opacity: '.7' } }, 'Chạm để lật ↻')), h('div', { class: 'fb2', 'data-tr': '', html: f[2] }))); const flip = () => { fl.classList.toggle('on'); SFX.play('flip'); }; fl.onclick = (e) => { if (!e.target.closest('.fb2') || !TR.on) flip(); }; fl.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } }; facts.append(fl); });
    body.append(hero, cards);
    if (x.facts) body.append(h('div', { class: 'sec-title', style: { marginTop: '28px' } }, h('h2', {}, 'Bạn có biết?'), h('span', { class: 'muted' }, 'Did you know? · chạm để lật')), facts);
    if (x.challenge) body.append(h('div', { class: 'card panel reveal', style: { marginTop: '24px', borderColor: 'var(--sc)' } }, h('div', { class: 'eyebrow' }, 'Thử thách tư duy · Challenge'), h('h3', { 'data-tr': '', style: { margin: '6px 0' } }, x.challenge.t), h('div', { class: 'prose', 'data-tr': '', html: x.challenge.p }),
      x.challenge.a ? (() => { const ans = h('div', { class: 'vibox', hidden: true, style: { marginTop: '10px' }, html: x.challenge.a }); return h('div', {}, h('button', { class: 'btn sm sc', style: { marginTop: '10px' }, onclick: (e) => { ans.hidden = !ans.hidden; SFX.play('pop'); } }, 'Xem lời giải'), ans); })() : null));
    body.append(h('div', { class: 'row', style: { marginTop: '24px', justifyContent: 'center' } }, h('a', { class: 'btn sc', href: `#u${u.n}-read`, html: icon('news') + 'Bài đọc tiếng Anh' }), h('a', { class: 'btn ink', href: `#u${u.n}-listen`, html: icon('head') + 'Bài nghe tiếng Anh' })));
  }

  // ---- reading tab ----
  function readTab(u, body) {
    const r = u.reading; if (!r) { body.append(h('div', { class: 'empty' }, 'Đang cập nhật.')); return; }
    const passage = h('article', { class: 'card passage', 'data-tr': '' },
      h('div', { class: 'eyebrow' }, 'Reading · Bài đọc'), h('h2', {}, r.title), r.sub ? h('div', { class: 'muted', style: { fontSize: '.92rem' } }, r.sub) : null,
      r.fig ? h('div', { class: 'qfig', html: r.fig }) : null,
      r.paras.map((p, i) => h('p', { html: (r.labels ? `<span class="pn">${r.labels[i] || String.fromCharCode(65 + i)}</span>` : '') + p })));
    const listenB = h('button', { class: 'btn sm ghost no-tr', html: icon('speaker') + 'Nghe bài đọc', onclick: () => { if (Speech.state !== 'idle') { Speech.stop(); listenB.innerHTML = icon('speaker') + 'Nghe bài đọc'; return; } listenB.innerHTML = icon('stop') + 'Dừng'; Speech.speak(r.paras.map((p, i) => ({ text: APP.plain(p), id: 'p' + i })), { rate: 0.95 }).then(() => (listenB.innerHTML = icon('speaker') + 'Nghe bài đọc')); } });
    passage.insertBefore(h('div', { class: 'row', style: { marginTop: '8px' } }, Speech.available() ? listenB : null, h('span', { class: 'muted', style: { fontSize: '.8rem' } }, 'Chạm vào từ để xem nghĩa · bôi đen cụm từ để dịch')), passage.children[3] || null);
    const qcol = h('div', {});
    const sets = [];
    (r.parts || [{ title: 'Questions', qs: r.qs }]).forEach((part) => {
      const blk = h('div', { class: 'card qblock' }, h('h4', { 'data-tr': '', html: icon('pencil').replace('<svg', '<svg style="width:17px;height:17px;color:var(--sc)"') + part.title }));
      if (part.note) blk.append(h('div', { class: 'muted', style: { fontSize: '.88rem', marginBottom: '8px' }, html: part.note }));
      if (part.bank) blk.append(h('div', { class: 'wordbank', html: part.bank.map((w) => `<span>${w}</span>`).join('') }));
      qcol.append(blk); sets.push(QZ.inlineSet(blk, part.qs.map((q) => Object.assign({ src: 'book' }, q))));
    });
    const best = P.best('read:u' + u.n);
    const res = h('div');
    const sub = h('button', { class: 'btn pri', html: icon('check') + 'Nộp bài & chấm điểm', onclick: () => {
      let s = 0, t = 0; sets.forEach((st) => { const g = st.grade(); s += g.score; t += g.total; });
      const pct = Math.round((s / t) * 100); P.record('read:u' + u.n, pct); P.addXP(s * 8 + (pct >= 80 ? 20 : 0));
      sub.disabled = true; SFX.play(pct >= 50 ? 'complete' : 'wrong'); if (pct >= 80) FX.burst();
      res.innerHTML = ''; res.append(h('div', { class: 'card panel row' }, QZ.ring(pct, 90, 9), h('div', {}, h('h3', {}, `Bạn đúng ${+s.toFixed(1)}/${t} câu`), h('p', { class: 'muted' }, pct >= 80 ? 'Đọc hiểu rất tốt!' : 'Đọc lại đoạn văn và xem các giải thích bên dưới mỗi câu.'), h('button', { class: 'btn sm', style: { marginTop: '8px' }, onclick: () => route() }, 'Làm lại'))));
      res.scrollIntoView({ behavior: 'smooth', block: 'center' }); APP.emit('progress');
    } });
    qcol.append(h('div', { class: 'row', style: { marginBottom: '12px' } }, sub, best != null ? h('span', { class: 'muted', html: 'Kỷ lục: ' + best + '% ' + starsHTML(best) }) : null), res);
    if (r.gloss) qcol.append(h('div', { class: 'card qblock' }, h('h4', {}, 'Từ vựng trong bài'), h('div', { class: 'kw', 'data-tr': '' }, r.gloss.map(([en, vi]) => h('span', { title: vi }, en + ' — ' + vi)))));
    body.append(h('div', { class: 'rd-grid' }, passage, qcol));
  }

  // ---- listening tab ----
  function listenTab(u, body) {
    const L = u.listening; if (!L) { body.append(h('div', { class: 'empty' }, 'Đang cập nhật.')); return; }
    let rate = store.get('rate', 1), playing = false;
    const bars = h('div', { class: 'wave' }, Array.from({ length: 36 }, (_, i) => h('i', { style: { '--h': 25 + ((i * 37) % 70) + '%', animationDelay: (i % 9) * 0.08 + 's' } })));
    const info = h('div', { class: 'lineinfo' }, 'Nhấn ▶ để nghe. Bạn có thể nghe lại nhiều lần.');
    const playB = h('button', { class: 'play', 'aria-label': 'Phát', html: icon('play') });
    const player = h('div', { class: 'player' }, h('div', { class: 'eyebrow', style: { color: 'var(--accent-2)' } }, 'Listening · Bài nghe'), h('h2', { style: { fontSize: '1.4rem' } }, L.title), h('div', { style: { opacity: '.8', fontSize: '.92rem' } }, L.intro || ''), bars,
      h('div', { class: 'ctrls' }, playB, h('button', { class: 'btn sm ghost', style: { color: 'var(--surface)', borderColor: 'rgba(255,255,255,.25)' }, html: icon('replay') + 'Nghe lại từ đầu', onclick: () => { Speech.stop().then(() => start()); } }),
        h('span', { class: 'spacer' }), h('span', { style: { fontSize: '.8rem', opacity: '.8' } }, 'Tốc độ'), VZ.seg([[0.8, '0.8×'], [1, '1×'], [1.2, '1.2×']], rate, (v) => { rate = v; store.set('rate', v); })), info);
    const tr = h('div', { class: 'card transcript', 'data-tr': '', hidden: true }, h('div', { class: 'eyebrow' }, 'Transcript'), L.lines.map((l) => h('p', { html: (l.spk ? `<span class="spk">${l.spk}:</span>` : '') + l.text })));
    const trB = h('button', { class: 'btn sm ghost', html: icon('eye') + 'Hiện transcript', onclick: () => { tr.hidden = !tr.hidden; trB.innerHTML = icon('eye') + (tr.hidden ? 'Hiện transcript' : 'Ẩn transcript'); } });
    const setUI = (on) => { playing = on; player.classList.toggle('playing', on); playB.innerHTML = icon(on ? 'pause' : 'play'); };
    const voices = L.voices || {};
    function start() {
      if (!Speech.available()) { toast('Thiết bị này không hỗ trợ đọc to. Hãy mở transcript.'); tr.hidden = false; return; }
      setUI(true); info.textContent = 'Đang phát…';
      Speech.speak(L.lines.map((l, i) => ({ text: (l.spk && L.sayNames ? l.spk + ': ' : '') + APP.plain(l.text), voice: voices[l.spk] || l.voice, id: 'l' + i })), { rate, onLine: (i) => { $$('p', tr).forEach((p, k) => p.classList.toggle('now', k === i)); info.textContent = `Đoạn ${i + 1}/${L.lines.length}`; } })
        .then(() => { setUI(false); info.textContent = 'Đã nghe xong. Trả lời câu hỏi bên dưới.'; $$('p', tr).forEach((p) => p.classList.remove('now')); });
    }
    Speech.init().then((t) => { if (t) t.onLine && t.onLine(({ line }) => { $$('p', tr).forEach((p, k) => p.classList.toggle('now', k === line)); info.textContent = `Đoạn ${line + 1}/${L.lines.length}`; }); });
    playB.onclick = () => { SFX.init(); if (!playing && Speech.state === 'paused') { Speech.resume(); setUI(true); return; } if (playing) { Speech.pause(); setUI(false); info.textContent = 'Tạm dừng'; return; } start(); };
    const qcol = h('div', {}); const sets = [];
    (L.parts || [{ title: 'Questions', qs: L.qs }]).forEach((part) => {
      const blk = h('div', { class: 'card qblock' }, h('h4', { 'data-tr': '', html: icon('head').replace('<svg', '<svg style="width:17px;height:17px;color:var(--sc)"') + part.title }));
      if (part.note) blk.append(h('div', { class: 'muted', style: { fontSize: '.88rem', marginBottom: '8px' }, html: part.note }));
      qcol.append(blk); sets.push(QZ.inlineSet(blk, part.qs.map((q) => Object.assign({ src: 'book' }, q))));
    });
    const res = h('div'); const best = P.best('listen:u' + u.n);
    const sub = h('button', { class: 'btn pri', html: icon('check') + 'Nộp bài & chấm điểm', onclick: () => {
      let s = 0, t = 0; sets.forEach((st) => { const g = st.grade(); s += g.score; t += g.total; });
      const pct = Math.round((s / t) * 100); P.record('listen:u' + u.n, pct); P.addXP(s * 8 + (pct >= 80 ? 20 : 0)); sub.disabled = true; tr.hidden = false;
      SFX.play(pct >= 50 ? 'complete' : 'wrong'); if (pct >= 80) FX.burst();
      res.innerHTML = ''; res.append(h('div', { class: 'card panel row' }, QZ.ring(pct, 90, 9), h('div', {}, h('h3', {}, `Bạn đúng ${+s.toFixed(1)}/${t} câu`), h('p', { class: 'muted' }, 'Transcript đã hiện để bạn đối chiếu.'), h('button', { class: 'btn sm', style: { marginTop: '8px' }, onclick: () => route() }, 'Làm lại'))));
      APP.emit('progress');
    } });
    qcol.append(h('div', { class: 'row', style: { margin: '4px 0 12px' } }, sub, trB, best != null ? h('span', { class: 'muted', html: 'Kỷ lục: ' + best + '% ' + starsHTML(best) }) : null), res);
    body.append(h('div', { class: 'rd-grid' }, h('div', { class: 'stack' }, player, tr), qcol));
  }

  // ---- unit test tab ----
  function testTab(u, body) {
    const best = P.best('test:u' + u.n); const hist = P.data.hist.filter((x) => x.k === 'test:u' + u.n).slice(-8);
    const n = Math.min(20, Math.max(12, u.sections.length * 4)), mins = Math.round(n * 1.25);
    const build = () => { // balanced: per section quota
      const per = Math.max(2, Math.floor(n / u.sections.length)); let qs = [];
      u.sections.forEach((s) => (qs = qs.concat(QZ.build(sectionPool(u, s), per))));
      const extra = QZ.build(unitPool(u), n * 2).filter((q) => !qs.includes(q));
      while (qs.length < n && extra.length) qs.push(extra.shift());
      return U.shuffle(qs).slice(0, n).sort((a, b) => parseFloat(a.tag) - parseFloat(b.tag));
    };
    body.append(h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))' } },
      h('div', { class: 'card panel stack' }, h('div', { class: 'eyebrow' }, 'Unit test'), h('h2', { style: { fontSize: '1.5rem' } }, `Bài kiểm tra tổng hợp Chương ${u.n}`),
        h('p', { class: 'muted' }, `${n} câu phủ đủ ${u.sections.length} mục (${u.sections.map((s) => s.id).join(', ')}), thời gian ${mins} phút. Bạn có thể chuyển qua lại giữa các câu; đáp án và lời giải hiện sau khi nộp bài.`),
        h('div', { class: 'row' }, h('span', { class: 'pill', html: icon('clock') + mins + ' phút' }), h('span', { class: 'pill', html: icon('exam') + n + ' câu' }), h('span', { class: 'pill', html: icon('star') + 'Thang điểm 10' })),
        h('div', { class: 'row' }, h('button', { class: 'btn pri', html: icon('trophy') + 'Bắt đầu làm bài', onclick: () => QZ.run({ title: `Kiểm tra Chương ${u.n} · ${u.title}`, qs: build(), mode: 'test', time: mins * 60, key: 'test:u' + u.n, sc: 's-' + u.strand, regen: build, onDone: () => setTimeout(() => route(), 50) }) }),
          h('button', { class: 'btn ghost', html: icon('pencil') + 'Làm kiểu luyện tập', onclick: () => QZ.run({ title: `Ôn tập Chương ${u.n}`, qs: build(), mode: 'practice', sc: 's-' + u.strand, regen: build }) }))),
      h('div', { class: 'card panel' }, h('h3', {}, 'Kết quả của bạn'), best != null ? h('div', { class: 'row' }, QZ.ring(best, 100, 10, 'cao nhất'), h('div', { class: 'stack', style: { gap: '4px' } }, hist.reverse().map((x) => h('div', { class: 'mono', style: { fontSize: '.85rem' } }, new Date(x.t).toLocaleDateString('vi-VN') + ' — ' + x.pct + '%')))) : h('p', { class: 'muted' }, 'Chưa làm bài kiểm tra nào. Hãy học xong lý thuyết rồi thử sức nhé!'))));
  }

  /* ---------- exam generator ---------- */
  function examView() {
    CHAT.setUnit(null);
    const sel = new Set(store.get('examUnits', APP.units.map((u) => u.n)));
    let count = store.get('examN', 20), mins = store.get('examT', 30), diff = 0, src = 'all', mode = 'test';
    const codeIn = h('input', { class: 'ain sm', placeholder: 'vd: 48213', inputmode: 'numeric', 'aria-label': 'Mã đề' });
    const checks = h('div', { class: 'uchecks' });
    APP.units.forEach((u) => { const cb = h('input', { type: 'checkbox', checked: sel.has(u.n) }); const lab = h('label', { class: 'ucheck s-' + u.strand + (sel.has(u.n) ? ' on' : '') }, cb, h('span', { class: 'n' }, u.n), h('span', {}, u.title)); cb.onchange = () => { cb.checked ? sel.add(u.n) : sel.delete(u.n); lab.classList.toggle('on', cb.checked); store.set('examUnits', [...sel]); SFX.play('tap'); }; checks.append(lab); });
    const strandBtns = h('div', { class: 'row', style: { marginBottom: '10px' } }, VZ.btn('Chọn tất cả', () => setAll(APP.units.map((u) => u.n))), VZ.btn('Bỏ chọn', () => setAll([])), ...Object.keys(STRANDS).map((k) => VZ.btn(STRANDS[k][0], () => setAll(APP.units.filter((u) => u.strand === k).map((u) => u.n)))));
    function setAll(arr) { sel.clear(); arr.forEach((x) => sel.add(x)); store.set('examUnits', arr); [...checks.children].forEach((lab, i) => { const on = sel.has(APP.units[i].n); lab.querySelector('input').checked = on; lab.classList.toggle('on', on); }); }
    const paper = h('div');
    function generate(code) {
      if (!sel.size) { toast('Hãy chọn ít nhất một chương.'); return; }
      code = code || String(U.R(10000, 99999));
      // encode settings into deterministic generation through seed
      U.seed(+code + [...sel].reduce((a, b) => a * 31 + b, 7) + count * 1000 + diff * 7 + (src === 'book' ? 1 : src === 'new' ? 2 : 0));
      const units = APP.units.filter((u) => sel.has(u.n));
      let qs = []; const per = Math.max(1, Math.floor(count / units.length)); let rest = count - per * units.length;
      units.forEach((u) => { let k = per + (rest-- > 0 ? 1 : 0); qs = qs.concat(QZ.build(unitPool(u).map((p) => Object.assign({}, p, { tag: 'U' + u.n + ' · ' + p.tag })), k, { src, diff: diff || null })); });
      qs = qs.slice(0, count);
      U.seed(null);
      const tags = {}; qs.forEach((q) => { const t = q.tag.split(' · ')[0]; tags[t] = (tags[t] || 0) + 1; });
      paper.innerHTML = '';
      paper.append(h('div', { class: 'card paper view' },
        h('div', { class: 'ph' }, h('div', { class: 'eyebrow' }, 'Maths 7 Lab · Đề tổng hợp'), h('h2', {}, `Mã đề ${code}`), h('div', { class: 'muted', style: { fontSize: '.88rem' } }, `${qs.length} câu · ${mins ? mins + ' phút' : 'không giới hạn thời gian'} · Chương ${[...sel].sort((a, b) => a - b).join(', ')}`)),
        h('div', { class: 'row', style: { justifyContent: 'center', marginBottom: '12px' } },
          h('button', { class: 'btn pri', html: icon('trophy') + (mode === 'test' ? 'Bắt đầu làm bài' : 'Luyện với đáp án'), onclick: () => QZ.run({ title: 'Đề tổng hợp · mã ' + code, qs, mode, time: mode === 'test' ? mins * 60 : 0, key: 'exam', sc: 's-number', regen: () => { generate(); return lastQs; } }) }),
          h('button', { class: 'btn ghost', html: icon('shuffle') + 'Đổi đề khác', onclick: () => generate() })),
        h('ol', { 'data-tr': '' }, qs.map((q) => h('li', { html: `${q.q} <span class="pill sc">${esc(q.tag)}</span>` + (q.fig ? `<div class="qfig">${typeof q.fig === 'function' ? q.fig() : q.fig}</div>` : '') })))));
      lastQs = qs; store.set('examN', count); store.set('examT', mins); SFX.play('whoosh');
      paper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    let lastQs = [];
    const opts = h('div', { class: 'card panel', style: { position: 'sticky', top: 'calc(var(--hdr) + 16px)' } },
      h('h3', {}, 'Tuỳ chọn đề'),
      optRow('Số câu', VZ.seg([10, 20, 30, 40], count, (v) => (count = v))),
      optRow('Thời gian', VZ.seg([[0, 'Không'], [15, '15′'], [30, '30′'], [45, '45′'], [60, '60′']], mins, (v) => (mins = v))),
      optRow('Độ khó', VZ.seg([[0, 'Trộn'], [1, 'Cơ bản'], [3, 'Nâng cao']], diff, (v) => (diff = v))),
      optRow('Nguồn câu hỏi', VZ.seg([['all', 'Trộn'], ['book', 'Theo sách'], ['new', 'Bài mới']], src, (v) => (src = v))),
      optRow('Chế độ', VZ.seg([['test', 'Thi thử'], ['practice', 'Luyện tập']], mode, (v) => (mode = v))),
      h('button', { class: 'btn pri', style: { width: '100%', marginTop: '6px' }, html: icon('spark') + 'Tạo đề', onclick: () => generate() }),
      h('div', { class: 'row', style: { marginTop: '12px' } }, codeIn, h('button', { class: 'btn sm', onclick: () => { const c = codeIn.value.trim(); if (!/^\d{3,6}$/.test(c)) return toast('Mã đề gồm 3–6 chữ số.'); generate(c); } }, 'Mở lại theo mã')),
      h('p', { class: 'muted', style: { fontSize: '.8rem', marginTop: '8px' } }, 'Cùng mã đề + cùng tuỳ chọn sẽ tạo lại đúng đề đó.'));
    mount(h('div', { class: 'view' }, h('div', { class: 'page-h wrap' }, h('div', { class: 'eyebrow', style: { color: 'var(--accent)' } }, 'Exam generator'), h('h1', {}, 'Tạo đề tổng hợp'), h('p', {}, 'Sinh đề từ toàn bộ kiến thức trong sách: chọn chương, số câu, thời gian và độ khó. Câu hỏi lấy từ bài tập sách và bài mới có số liệu ngẫu nhiên.')),
      h('div', { class: 'ex-grid wrap' }, h('div', { class: 'stack' }, h('div', { class: 'card panel' }, h('h3', {}, 'Chọn chương'), strandBtns, checks), paper), opts)));
  }
  function optRow(label, ctl) { return h('div', { class: 'opt-row' }, h('span', {}, label), ctl); }

  /* ---------- words ---------- */
  function wordsView() {
    CHAT.setUnit(null);
    const all = APP.units.flatMap((u) => (u.words || []).map(([en, vi]) => ({ en, vi, u })));
    let unit = 0, q = '', mode = 'list';
    const area = h('div');
    const search = h('input', { class: 'ain', style: { width: 'min(100%,320px)', fontFamily: 'var(--f-body)' }, placeholder: 'Tìm từ (Anh hoặc Việt)…', 'aria-label': 'Tìm từ' });
    search.oninput = () => { q = search.value.toLowerCase(); draw(); };
    const usel = h('select', { class: 'ain', style: { width: 'auto', fontFamily: 'var(--f-body)' }, 'aria-label': 'Chương' }, h('option', { value: 0 }, 'Tất cả chương'), APP.units.map((u) => h('option', { value: u.n }, `Chương ${u.n}: ${u.title}`)));
    usel.onchange = () => { unit = +usel.value; draw(); };
    const list = () => all.filter((w) => (!unit || w.u.n === unit) && (!q || w.en.toLowerCase().includes(q) || w.vi.toLowerCase().includes(q)));
    function draw() {
      area.innerHTML = ''; const L = list();
      if (mode === 'list') {
        if (!L.length) return area.append(h('div', { class: 'empty' }, 'Không tìm thấy từ nào.'));
        area.append(h('div', { class: 'words-grid' }, L.map((w) => h('div', { class: 'card wcard s-' + w.u.strand }, h('div', { style: { minWidth: 0 } }, h('b', { 'data-tr': '' }, w.en), h('span', {}, w.vi), h('div', { class: 'muted', style: { fontSize: '.72rem' } }, 'Chương ' + w.u.n)), Speech.available() ? h('button', { class: 'ibtn', 'aria-label': 'Phát âm ' + w.en, html: icon('speaker'), onclick: () => Speech.speak(w.en, { rate: 0.85 }) }) : null))));
      } else if (mode === 'cards') {
        if (!L.length) return;
        let i = 0; const deck = U.shuffle(L);
        const fc = h('div', { class: 'fc', tabindex: 0, role: 'button', 'aria-label': 'Lật thẻ' }); const cnt = h('div', { class: 'muted mono' });
        const paint = () => { const w = deck[i]; fc.className = 'fc s-' + w.u.strand; fc.innerHTML = `<div class="fi"><div class="s s1"><b>${esc(w.en)}</b><small style="opacity:.8;margin-top:6px">Chạm để lật</small></div><div class="s s2"><b>${esc(w.vi)}</b><span class="muted" style="margin-top:6px">Chương ${w.u.n} · ${esc(w.u.title)}</span></div></div>`; cnt.textContent = `${i + 1} / ${deck.length}`; };
        fc.onclick = () => { fc.classList.toggle('on'); SFX.play('flip'); }; fc.onkeydown = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fc.click(); } };
        paint();
        area.append(h('div', { class: 'fc-stage' }, fc, cnt, h('div', { class: 'row', style: { justifyContent: 'center' } },
          h('button', { class: 'btn', html: icon('arrowL'), 'aria-label': 'Thẻ trước', onclick: () => { i = (i - 1 + deck.length) % deck.length; paint(); SFX.play('whoosh'); } }),
          Speech.available() ? h('button', { class: 'btn', html: icon('speaker') + 'Nghe', onclick: () => Speech.speak(deck[i].en, { rate: 0.85 }) }) : null,
          h('button', { class: 'btn pri', html: 'Thẻ tiếp ' + icon('arrowR'), onclick: () => { i = (i + 1) % deck.length; paint(); SFX.play('whoosh'); } }))));
      }
    }
    const quizB = h('button', { class: 'btn pri', html: icon('target') + 'Trò chơi từ vựng', onclick: () => {
      const L = list(); if (L.length < 4) return toast('Cần ít nhất 4 từ để chơi.');
      const qs = U.sample(L, Math.min(12, L.length)).map((w, k) => {
        if (k % 3 === 2) { const others = U.sample(L.filter((x) => x !== w), 3); const grp = U.shuffle([w, ...others]); return { type: 'match', q: 'Ghép từ tiếng Anh với nghĩa tiếng Việt', a: grp.map((x) => [x.en, x.vi]), src: 'new', tag: 'Từ vựng' }; }
        const wrong = U.sample(L.filter((x) => x.vi !== w.vi), 3);
        return k % 2 ? { type: 'mcq', q: `Từ nào có nghĩa là <b>“${esc(w.vi)}”</b>?`, opts: [w.en, ...wrong.map((x) => x.en)], a: 0, src: 'new', tag: 'Từ vựng' } : { type: 'mcq', q: `<b>${esc(w.en)}</b> nghĩa là gì?`, opts: [w.vi, ...wrong.map((x) => x.vi)], a: 0, src: 'new', tag: 'Từ vựng' };
      });
      QZ.run({ title: 'Trò chơi từ vựng', qs, key: 'words', sc: 's-algebra' });
    } });
    mount(h('div', { class: 'view' }, h('div', { class: 'page-h wrap' }, h('div', { class: 'eyebrow', style: { color: 'var(--accent)' } }, 'Glossary'), h('h1', {}, 'Từ vựng toán Anh–Việt'), h('p', {}, `${all.length} thuật ngữ từ 16 chương. Nghe phát âm, lật flashcard hoặc chơi trò ghép từ để nhớ lâu.`)),
      h('div', { class: 'wrap stack', style: { paddingBottom: '30px' } }, h('div', { class: 'row' }, search, usel, VZ.seg([['list', 'Danh sách'], ['cards', 'Flashcard']], mode, (v) => { mode = v; draw(); }), h('span', { class: 'spacer' }), quizB), area)));
    draw();
  }

  /* ---------- progress ---------- */
  function progressView() {
    CHAT.setUnit(null);
    const L = P.level();
    const lvCard = h('div', { class: 'card panel row', style: { gap: '20px' } }, QZ.ring(Math.round(L.pct * 100), 110, 11, 'tới cấp sau'),
      h('div', { style: { flex: '1 1 220px' } }, h('div', { class: 'eyebrow' }, 'Cấp ' + L.lv), h('h2', { style: { fontSize: '1.6rem' } }, APP.LEVEL_NAMES[Math.min(L.lv - 1, 9)]), h('p', { class: 'muted' }, `${P.data.xp} XP · còn ${L.nxt} XP để lên cấp ${L.lv + 1} · chuỗi ${P.data.streak.count || 0} ngày học`)));
    const rows = h('div', { class: 'prog-list' }, APP.units.map((u) => { const s = unitStats(u); return h('a', { class: 'card prow s-' + u.strand, href: `#u${u.n}-learn`, style: { textDecoration: 'none' } }, h('span', { class: 'n' }, u.n), h('div', { style: { minWidth: 0 } }, h('b', {}, u.title), h('div', { class: 'bars' }, h('span', {}, 'Lý thuyết ' + s.learn + '%'), h('span', {}, 'Luyện ' + s.practice + '%'), h('span', {}, 'Đọc ' + s.read + '%'), h('span', {}, 'Nghe ' + s.listen + '%'), h('span', {}, 'Kiểm tra ' + s.test + '%'))), h('div', { class: 'r' }, h('div', { class: 'bar', style: { height: '8px', borderRadius: '9px', background: 'var(--surface-2)', overflow: 'hidden' }, html: `<i style="display:block;height:100%;width:${s.mastery}%;background:var(--sc);border-radius:9px"></i>` }), h('div', { class: 'mono', style: { fontSize: '.8rem', textAlign: 'right' } }, s.mastery + '%'))); }));
    const recent = P.data.hist.slice(-20);
    const chart = h('div', { class: 'card chart-card' }, h('h3', { style: { fontSize: '1rem', marginBottom: '8px' } }, 'Kết quả 20 lượt gần nhất'), recent.length ? h('div', { html: lineChart(recent.map((x) => x.pct)) }) : h('p', { class: 'muted' }, 'Chưa có dữ liệu. Hãy làm một bài kiểm tra nhanh!'));
    const reset = h('div', { class: 'card panel' }, h('h3', {}, 'Dữ liệu'), h('p', { class: 'muted', style: { fontSize: '.9rem' } }, 'Tiến độ được lưu trong trình duyệt của thiết bị này.'));
    const rb = h('button', { class: 'btn ghost sm', style: { marginTop: '8px' }, html: icon('trash') + 'Xoá toàn bộ tiến độ', onclick: () => { rb.hidden = true; reset.append(h('div', { class: 'row', style: { marginTop: '8px' } }, h('span', {}, 'Chắc chắn xoá? Không thể hoàn tác.'), h('button', { class: 'btn sm', onclick: () => route() }, 'Huỷ'), h('button', { class: 'btn sm ink', onclick: () => { P.data = { xp: 0, best: {}, hist: [], streak: { day: '', count: 0 }, seen: {} }; P.save(); APP.emit('xp'); toast('Đã xoá tiến độ.'); route(); } }, 'Xoá'))); } });
    reset.append(rb);
    mount(h('div', { class: 'view' }, h('div', { class: 'page-h wrap' }, h('div', { class: 'eyebrow', style: { color: 'var(--accent)' } }, 'Progress'), h('h1', {}, 'Tiến độ học tập')),
      h('div', { class: 'wrap stack', style: { paddingBottom: '30px', gap: '16px' } }, lvCard, chart, rows, reset)));
  }
  function lineChart(vals) {
    const W = 640, H = 200, L = 34, B = 24, T = 10, R = 10; const x = (i) => L + (i / Math.max(1, vals.length - 1)) * (W - L - R), y = (v) => T + (1 - v / 100) * (H - T - B);
    let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    [0, 25, 50, 75, 100].forEach((v) => (g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="var(--ink-3)">${v}</text>`));
    const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    g += `<polygon points="${L},${y(0)} ${pts} ${x(vals.length - 1)},${y(0)}" fill="color-mix(in srgb, var(--accent) 14%, transparent)"/><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>`;
    vals.forEach((v, i) => (g += `<circle cx="${x(i)}" cy="${y(v)}" r="${i === vals.length - 1 ? 6 : 3.5}" fill="${i === vals.length - 1 ? 'var(--accent)' : 'var(--surface)'}" stroke="var(--accent)" stroke-width="2"/>`));
    return g + '</svg>';
  }

  /* ---------- boot ---------- */
  function boot() {
    APP.units.sort((a, b) => a.n - b.n);
    header();
    main = h('main', { id: 'main' }); document.body.insertBefore(main, $('.bnav'));
    CHAT.init();
    window.addEventListener('hashchange', route);
    route();
    Speech.init(); APP.AI.get();
    APP.on('progress', () => {});
  }
  APP.route = route; APP.boot = boot;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})();
