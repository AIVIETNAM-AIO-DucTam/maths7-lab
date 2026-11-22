/* Unit 10 — Percentages */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N, F, MX } = U;
  const { mcq, multi, tf, num, frac, fill, order, match, sort, txt, gen } = Q;
  const FH = (n, d) => U.fracHTML(n, d, true);
  const r6 = (x) => U.round(x, 6);
  const pctFrac = (p) => { const dp = (String(p).split('.')[1] || '').length; const k = 10 ** dp; return U.fracSimp(Math.round(p * k), 100 * k); };
  const money = (x) => '$' + (Number.isInteger(r6(x)) ? N(r6(x)) : r6(x).toFixed(2));

  /* ---------- widgets ---------- */
  APP.viz.fdp = function (el) {
    const f = VZ.frame(el, 'Phân số – Thập phân – Phần trăm trên lưới 100 ô', { icon: 'grid' });
    let p = 32; const wrap = h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } }); f.stage.append(wrap);
    function grid(fillN) { const c = 17, W = 10 * c + 4; let g = `<svg viewBox="0 0 ${W} ${W}" width="${W}" style="max-width:46vw">`; for (let i = 0; i < 100; i++) { const x = 2 + (i % 10) * c, y = 2 + Math.floor(i / 10) * c; const part = Math.max(0, Math.min(1, fillN - i)); g += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="var(--surface)" stroke="var(--ink-3)" stroke-width=".6"/>`; if (part > 0) g += `<rect x="${x}" y="${y}" width="${c * part}" height="${c}" fill="var(--number)" style="transition:width .2s"/>`; } return g + `<rect x="2" y="2" width="${10 * c}" height="${10 * c}" fill="none" stroke="var(--ink)" stroke-width="2"/></svg>`; }
    function draw() {
      wrap.innerHTML = grid(p) + (p > 100 ? grid(p - 100) : '');
      const [n, d] = pctFrac(p); const dec = r6(p / 100);
      f.out.innerHTML = `<span style="font-size:1.25rem;font-weight:800">${N(p)}% = ${F(N(p), 100)} = ${n >= d ? FH(n, d) : F(n, d)} = ${N(dec)}</span>${p > 100 ? ' &nbsp;(hơn 100%: nhiều hơn một “cái toàn bộ”)' : p < 1 ? ' &nbsp;(nhỏ hơn 1%: chưa tới một ô!)' : ''}`;
    }
    f.ctrls.append(VZ.range('Phần trăm', 0, 200, p, 0.5, (v) => { p = v; draw(); }, (v) => v + '%'), ...[0.5, 12.5, 32, 60, 75, 140].map((v) => VZ.btn(v + '%', () => { p = v; SFX.play('tick'); draw(); }, 'btn sm ghost')));
    draw();
  };
  APP.viz.percentBar = function (el) {
    const f = VZ.frame(el, 'Thanh phần trăm: tìm p% của một số', { icon: 'chart' });
    let A = 300, p = 30; const W = 620, svg = VZ.svg(W, 150); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const span = Math.max(100, Math.ceil(p / 100) * 100); const u = (W - 30) / span;
      for (let k = 0; k < span / 10; k++) { const x = 15 + k * 10 * u; const on = Math.min(10, Math.max(0, p - k * 10)) / 10; svg.append(s('rect', { x, y: 40, width: 10 * u, height: 40, fill: k >= 10 ? 'color-mix(in srgb, var(--geometry) 12%, transparent)' : 'var(--surface)', stroke: 'var(--ink-3)', 'stroke-width': 1 })); if (on > 0) svg.append(s('rect', { x, y: 40, width: 10 * u * on, height: 40, fill: k >= 10 ? 'var(--geometry)' : 'var(--number)', style: `animation:popIn .25s ${k * 0.03}s both` })); if (span <= 200 || k % 2 === 0) svg.append(s('text', { x: x + 5 * u, y: 98, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: (k + 1) * 10 + '%' })); }
      svg.append(s('rect', { x: 15, y: 40, width: 100 * u, height: 40, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5 }), s('text', { x: 15 + 50 * u, y: 30, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)', text: '100% = ' + money(A) }));
      svg.append(s('text', { x: 15 + p * u, y: 125, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: 'var(--accent)', text: '▲ ' + N(p) + '% = ' + money((A * p) / 100) }));
      f.out.innerHTML = `10% của ${money(A)} = ${money(A / 10)} · 1% = ${money(A / 100)} · <b>${N(p)}% = ${N(r6(p / 100))} × ${N(A)} = <span style="color:var(--accent)">${money((A * p) / 100)}</span></b>`;
    }
    f.ctrls.append(VZ.range('Số tiền', 20, 1000, A, 10, (v) => { A = v; draw(); }, (v) => '$' + v), VZ.range('Phần trăm', 0, 300, p, 5, (v) => { p = v; draw(); }, (v) => v + '%'));
    draw();
  };
  APP.viz.percentLadder = function (el) {
    const f = VZ.frame(el, 'Thang 100% → 10% → 1% → 0,1%', { icon: 'target' });
    const tasks = [[7000, 1.3, 'm'], [600, 3.5, 'kg'], [7500, 1.3, '$'], [450, 0.3, '$'], [2000, 0.2, 'g'], [80, 17.5, '$']]; let k = 0, step = 0;
    const st = h('div', { class: 'stack', style: { gap: '6px' } }); f.stage.append(st);
    const fmt = (x, u) => (u === '$' ? money(x) : N(r6(x)) + ' ' + u);
    function draw() {
      const [A, p, u] = tasks[k]; st.innerHTML = `<div style="font-family:var(--f-display);font-size:1.4rem;font-weight:800;color:var(--sc)">${N(p)}% of ${fmt(A, u)} = ?</div>`;
      const rows = [['100%', A], ['10%', A / 10], ['1%', A / 100], ['0.1%', A / 1000]];
      rows.forEach(([lab, v], i) => { if (i > step) return; st.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', animation: 'stepIn .35s both' } }, h('span', { class: 'pill sc', style: { minWidth: '64px', justifyContent: 'center' } }, lab), h('b', {}, fmt(v, u)), i ? h('span', { class: 'muted', style: { fontSize: '.85rem' } }, '(÷ 10)') : null)); });
      if (step >= 4) { const whole = Math.floor(p), tenth = r6(p - whole); const parts = []; if (whole) parts.push(`${whole} × 1% = ${fmt((whole * A) / 100, u)}`); if (tenth) parts.push(`${N(tenth * 10)} × 0.1% = ${fmt((tenth * A) / 100, u)}`); st.append(h('div', { style: { animation: 'stepIn .35s both', fontSize: '1.05rem' }, html: `${parts.join(' &nbsp;+&nbsp; ')} → <b style="color:var(--accent)">${N(p)}% = ${fmt((p * A) / 100, u)}</b>` })); }
      f.out.textContent = step < 4 ? 'Bấm “Bước tiếp” để chia cho 10.' : 'Ghép các phần lại với nhau. Kiểm tra: ' + N(r6(p / 100)) + ' × ' + N(A) + ' = ' + N(r6((p * A) / 100));
    }
    f.ctrls.append(VZ.btn('Bước tiếp ▶', () => { if (step < 4) { step++; SFX.play('pop'); draw(); } }, 'btn sm sc'), VZ.btn('Bài khác', () => { k = (k + 1) % tasks.length; step = 0; SFX.play('whoosh'); draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.growth = function (el) {
    const f = VZ.frame(el, 'Tăng hơn 100%: giá trị mới bằng bao nhiêu lần?', { icon: 'rocket' });
    const items = { puppy: ['🐶 Cún con', 5, 'kg', 300], ticket: ['✈️ Vé máy bay', 40, '$', 200], house: ['🏠 Ngôi nhà', 80000, '$', 75], child: ['🧒 Chiều cao', 70, 'cm', 40] }; let key = 'puppy', inc = 300;
    const W = 560, svg = VZ.svg(W, 170); f.stage.append(svg);
    const fmt = (x, u) => (u === '$' ? money(x) : N(r6(x)) + ' ' + u);
    function draw() {
      const [, base, u] = items[key]; const nw = base * (1 + inc / 100); svg.innerHTML = ''; const max = nw; const sc = (W - 160) / max;
      svg.append(s('text', { x: 10, y: 48, 'font-size': 13, 'font-weight': 800, fill: 'var(--ink-2)', text: 'Trước (100%)' }), s('rect', { x: 130, y: 30, width: base * sc, height: 30, rx: 6, fill: 'var(--number)' }), s('text', { x: 136 + base * sc, y: 50, 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)', text: fmt(base, u) }));
      svg.append(s('text', { x: 10, y: 118, 'font-size': 13, 'font-weight': 800, fill: 'var(--ink-2)', text: `Sau (${100 + inc}%)` }));
      for (let k = 0; k * 100 < 100 + inc; k++) { const w = Math.min(1, (100 + inc) / 100 - k) * base * sc; svg.append(s('rect', { x: 130 + k * base * sc, y: 100, width: Math.max(1, w - 2), height: 30, rx: 6, fill: k === 0 ? 'var(--number)' : 'var(--geometry)', style: `animation:popIn .3s ${k * 0.12}s both` })); }
      svg.append(s('text', { x: 130, y: 155, 'font-size': 13, 'font-weight': 800, fill: 'var(--accent)', text: `tăng ${inc}% = thêm ${fmt((base * inc) / 100, u)} → mới ${fmt(nw, u)}` }));
      f.out.innerHTML = `Giá trị mới = ${100 + inc}% của giá trị cũ = <b>${N(r6(1 + inc / 100))} ×</b> giá trị cũ. ${inc % 100 === 0 ? `Tăng ${inc}% nghĩa là gấp <b>${1 + inc / 100}</b> lần (không phải ${inc / 100} lần!).` : ''}`;
    }
    f.ctrls.append(VZ.seg(Object.keys(items).map((k) => [k, items[k][0]]), key, (v) => { key = v; inc = items[v][3]; draw(); }), VZ.range('Tăng', 5, 400, inc, 5, (v) => { inc = v; draw(); }, (v) => v + '%'));
    draw();
  };
  APP.viz.fdpMatch = function (el) {
    const f = VZ.frame(el, 'Lật thẻ: ghép cặp bằng nhau', { icon: 'star' });
    const pool = [[25, '¼'], [20, '⅕'], [12.5, '⅛'], [75, '¾'], [40, '0.4'], [5, '0.05'], [150, '1½'], [0.5, '0.005'], [60, '³⁄₅'], [4, '0.04'], [37.5, '⅜'], [175, '1.75'], [30, '0.3'], [3, '0.03'], [64, '¹⁶⁄₂₅']];
    let cards = [], open = [], moves = 0, found = 0, t0 = 0; const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '420px', margin: '0 auto' } }); f.stage.append(grid);
    function deal() { const pick6 = shuffle(pool).slice(0, 6); cards = shuffle(pick6.flatMap(([p, o], i) => [{ id: i, t: N(p) + '%', up: false, done: false }, { id: i, t: o, up: false, done: false }])); open = []; moves = 0; found = 0; t0 = Date.now(); draw(); f.out.textContent = 'Lật hai thẻ có cùng giá trị.'; }
    function draw() { grid.innerHTML = ''; cards.forEach((c, i) => { const b = h('button', { class: 'btn', type: 'button', style: { height: '64px', fontSize: '1.2rem', fontWeight: 800, background: c.done ? 'var(--good)' : c.up ? 'var(--surface)' : 'var(--sc)', color: c.done ? '#fff' : c.up ? 'var(--ink)' : '#fff', transition: 'transform .25s', transform: c.up || c.done ? 'rotateY(0)' : 'rotateY(180deg)' }, onclick: () => flip(i) }, c.up || c.done ? c.t : '?'); grid.append(b); }); }
    function flip(i) { const c = cards[i]; if (c.up || c.done || open.length === 2) return; c.up = true; open.push(i); SFX.play('flip'); draw(); if (open.length === 2) { moves++; const [a, b] = open.map((k) => cards[k]); if (a.id === b.id) { a.done = b.done = true; found++; open = []; SFX.play('correct'); draw(); if (found === 6) { SFX.play('complete'); f.out.innerHTML = `<b>Hoàn thành!</b> ${moves} lượt, ${Math.round((Date.now() - t0) / 1000)} giây.`; } else f.out.textContent = `Đúng! Còn ${6 - found} cặp.`; } else { setTimeout(() => { a.up = b.up = false; open = []; draw(); }, 800); SFX.play('wrong'); } } }
    f.ctrls.append(VZ.btn('Chơi lại', deal, 'btn sm sc')); deal();
  };
  APP.viz.airMix = function (el) {
    const f = VZ.frame(el, 'Không khí gồm những gì? (theo thể tích)', { icon: 'atom' });
    const gas = [['Nitrogen', 78.08, 'var(--number)'], ['Oxygen', 20.95, 'var(--stats)'], ['Argon', 0.93, 'var(--algebra)'], ['Carbon dioxide', 0.042, 'var(--bad)'], ['Others', 0.0, 'var(--geometry)']]; gas[4][1] = U.round(100 - gas.slice(0, 4).reduce((a, g) => a + g[1], 0), 3);
    let zoom = false; const W = 600, svg = VZ.svg(W, 130); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const list = zoom ? gas.slice(2) : gas; const tot = zoom ? list.reduce((a, g) => a + g[1], 0) : 100; let x = 10;
      list.forEach(([nm, v, c], i) => { const w = ((W - 20) * v) / tot; svg.append(s('rect', { x, y: 20, width: Math.max(1.5, w), height: 50, fill: c, style: `animation:popIn .35s ${i * 0.08}s both` })); if (w > 50) svg.append(s('text', { x: x + w / 2, y: 50, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#fff', text: v + '%' })); x += w; });
      list.forEach(([nm, v, c], i) => { svg.append(s('rect', { x: 10 + i * 118, y: 92, width: 14, height: 14, rx: 3, fill: c }), s('text', { x: 28 + i * 118, y: 104, 'font-size': 11.5, fill: 'var(--ink)', text: `${nm} ${v}%` })); });
      f.out.innerHTML = zoom ? 'Phóng to phần “1%” còn lại: carbon dioxide chỉ khoảng <b>0,04%</b> — tức 4 phân tử trong mỗi 10 000 — nhưng nó giữ nhiệt cho Trái Đất. Từ năm 1750 đến nay, lượng CO₂ đã tăng khoảng 50% (từ 0,028% lên 0,042%).' : 'Nitrogen và oxygen chiếm gần 99%. Bấm “Phóng to 1%” để xem các khí rất nhỏ.';
    }
    f.ctrls.append(VZ.btn('Phóng to 1% 🔍', () => { zoom = !zoom; SFX.play('whoosh'); draw(); }, 'btn sm sc'));
    draw();
  };
  APP.viz.rainChance = function (el) {
    const f = VZ.frame(el, '“70% khả năng mưa” nghĩa là gì?', { icon: 'chart' });
    let p = 70; const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '3px', maxWidth: '360px', margin: '0 auto', fontSize: 'clamp(.9rem, 3.4vw, 1.3rem)', textAlign: 'center' } }); f.stage.append(grid);
    function draw() { grid.innerHTML = ''; let wet = 0; for (let i = 0; i < 100; i++) { const r = Math.random() * 100 < p; wet += r; grid.append(h('span', { style: { animation: `popIn .2s ${i * 0.006}s both` } }, r ? '🌧️' : '☀️')); } f.out.innerHTML = `Trong 100 ngày có dự báo ${p}%, khoảng ${p} ngày sẽ mưa. Lần mô phỏng này: <b>${wet}</b> ngày mưa (${wet}%).`; }
    f.ctrls.append(VZ.range('Khả năng mưa', 0, 100, p, 5, (v) => { p = v; draw(); }, (v) => v + '%'), VZ.btn('Mô phỏng lại', () => { SFX.play('shuffle' in SFX ? 'tick' : 'tick'); draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.doubling = function (el) {
    const f = VZ.frame(el, 'Lãi kép: bao lâu thì tiền gấp đôi?', { icon: 'rocket' });
    let r = 8; const W = 520, H = 220, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const yrs = 30; const L = 40, B = 26; const X = (t) => L + (t / yrs) * (W - L - 10); const max = Math.pow(1 + r / 100, yrs) * 100; const Y = (v) => H - B - (v / max) * (H - B - 12);
      svg.append(s('line', { x1: L, y1: H - B, x2: W - 6, y2: H - B, stroke: 'var(--ink-3)' }), s('line', { x1: L, y1: 8, x2: L, y2: H - B, stroke: 'var(--ink-3)' }));
      let d = 'M'; let dbl = null; for (let t = 0; t <= yrs; t++) { const v = 100 * Math.pow(1 + r / 100, t); d += `${X(t)} ${Y(v)} ${t < yrs ? 'L' : ''}`; if (dbl == null && v >= 200) dbl = t; svg.append(s('rect', { x: X(t) - 3, y: Y(v), width: 6, height: H - B - Y(v), fill: 'color-mix(in srgb, var(--stats) 30%, transparent)' })); }
      svg.append(s('path', { d, fill: 'none', stroke: 'var(--stats)', 'stroke-width': 3 }));
      if (dbl != null) svg.append(s('line', { x1: X(dbl), y1: Y(200), x2: X(dbl), y2: H - B, stroke: 'var(--accent)', 'stroke-dasharray': '5 4', 'stroke-width': 2 }), s('text', { x: X(dbl), y: Y(200) - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: 'var(--accent)', text: '×2 sau ' + dbl + ' năm' }));
      [0, 10, 20, 30].forEach((t) => svg.append(s('text', { x: X(t), y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-2)', text: t + ' năm' })));
      f.out.innerHTML = `Mỗi năm tăng ${r}% (nhân với ${N(r6(1 + r / 100))}). $100 sau 30 năm thành <b>${money(Math.round(100 * Math.pow(1 + r / 100, 30)))}</b>. “Quy tắc 72”: 72 ÷ ${r} ≈ <b>${N(U.round(72 / r, 1))}</b> năm để gấp đôi.`;
    }
    f.ctrls.append(VZ.range('Lãi mỗi năm', 1, 15, r, 1, (v) => { r = v; draw(); }, (v) => v + '%'));
    draw();
  };
  APP.viz.heroPercent = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      const g = c.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#0b2a4a'); g.addColorStop(1, '#0e4c6e'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
      const cx = w * 0.72, cy = hh * 0.52, R0 = Math.min(w, hh) * 0.33; const pct = (Math.sin(t * 0.6) * 0.5 + 0.5) * 100; const lvl = cy + R0 - (2 * R0 * pct) / 100;
      c.save(); c.beginPath(); c.arc(cx, cy, R0, 0, 7); c.clip(); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(cx - R0, cy - R0, 2 * R0, 2 * R0);
      c.beginPath(); c.moveTo(cx - R0, cy + R0); for (let x = -R0; x <= R0; x += 4) c.lineTo(cx + x, lvl + Math.sin(x / 18 + t * 3) * 6); c.lineTo(cx + R0, cy + R0); c.closePath(); const lg = c.createLinearGradient(0, lvl, 0, cy + R0); lg.addColorStop(0, '#4cc9f0'); lg.addColorStop(1, '#4361ee'); c.fillStyle = lg; c.fill(); c.restore();
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R0, 0, 7); c.stroke();
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(R0 * 0.42)}px Lexend, sans-serif`; c.textAlign = 'center'; c.fillText(Math.round(pct) + '%', cx, cy + R0 * 0.15);
    });
  };

  /* ---------- question helpers ---------- */
  const p2f = (p, o = {}) => { const [n, d] = pctFrac(p); return frac(`Write ${N(p)}% as a fraction in its simplest form.`, [n, d], `${N(p)}% = ${F(N(p), 100)}${String(p).includes('.') ? ' = ' + F(Math.round(p * 10 ** (String(p).split('.')[1].length)), 100 * 10 ** (String(p).split('.')[1].length)) : ''} = ${n >= d ? FH(n, d) : F(n, d)}.`, Object.assign({ simplest: true }, o)); };
  const p2d = (p, o = {}) => num(`Write ${N(p)}% as a decimal.`, r6(p / 100), `Divide by 100: ${N(p)} ÷ 100 = ${N(r6(p / 100))}.`, o);
  const f2p = (n, d, o = {}) => num(`Write ${n >= d ? FH(n, d) : F(n, d)} as a percentage.`, r6((100 * n) / d), `${n >= d ? FH(n, d) : F(n, d)} = ${N(r6(n / d))} = ${N(r6((100 * n) / d))}%.`, Object.assign({ unit: '%' }, o));
  const pOf = (p, A, u, o = {}) => num(o.q || `Work out ${N(p)}% of ${u === '$' ? '$' + N(A) : N(A) + ' ' + u}.`, r6((p * A) / 100), `${N(p)}% = ${N(r6(p / 100))}, and ${N(r6(p / 100))} × ${N(A)} = ${N(r6((p * A) / 100))}.`, Object.assign(u === '$' ? { pre: '$' } : { unit: u }, o));
  const whatP = (part, whole, ctx, o = {}) => num(o.q || `What percentage of ${ctx}${N(whole)} is ${ctx}${N(part)}?`, r6((100 * part) / whole), `${F(N(part), N(whole))} = ${N(r6(part / whole))} = ${N(r6((100 * part) / whole))}%.`, Object.assign({ unit: '%' }, o));

  APP.addUnit({
    n: 10, strand: 'number', title: 'Percentages', vi: 'Phần trăm',
    blurb: 'Percentages are everywhere. You often see them in news reports. They describe price changes, test results, the chance of bad weather, the results of surveys and many other things. Percentages can be very small — less than 1% — and they can also be larger than 100%.',
    blurbVi: 'Chương này học cách nhận ra phân số, số thập phân và phần trăm bằng nhau, tính phần trăm của một lượng, và làm việc với phần trăm rất nhỏ (dưới 1%) hoặc lớn hơn 100%.',
    words: [['percentage', 'phần trăm'], ['per cent', 'phần trăm (%)'], ['fraction', 'phân số'], ['decimal', 'số thập phân'], ['equivalent', 'bằng nhau / tương đương'], ['numerator', 'tử số'], ['denominator', 'mẫu số'], ['simplest form', 'dạng tối giản'], ['common factor', 'ước chung'], ['mixed number', 'hỗn số'], ['increase', 'tăng'], ['decrease', 'giảm'], ['original price', 'giá gốc'], ['times', 'lần'], ['discount', 'giảm giá'], ['tax', 'thuế']],
    chat: ['17,5% viết thành phân số thế nào?', 'Tăng 300% là gấp mấy lần?', 'Làm sao tính 1,3% của 7500?'],
    sections: [
      {
        id: '10.1', t: 'Fractions, decimals and percentages', vi: 'Phân số, số thập phân và phần trăm',
        goals: ['learn to recognise and use the fact that fractions, decimals and percentages have the same value.'],
        body: [
          ['p', `You can write a percentage as a fraction or as a decimal: 32% = ${F(32, 100)} = 0.32; 60% = ${F(60, 100)} = 0.6; 83% = ${F(83, 100)} = 0.83. Sometimes you can simplify the fraction: ${F(32, 100)} = ${F(8, 25)} (divide by 4) and ${F(60, 100)} = ${F(3, 5)} (divide by 20). You cannot simplify ${F(83, 100)} because the only common factor of 83 and 100 is 1.`],
          ['viz', 'fdp'],
          ['ex', { t: 'Worked example 10.1', q: 'a In the circle diagram, 3 parts out of 10 are pink and the rest are blue. How much of the circle is i pink ii blue? Give decimals, fractions and percentages. b The area of the circle is 60 cm². What is the area of the pink region?', fig: FIG.pie([['pink', 3, '#ff7aa8'], ['blue', 7, '#4f8cff']], { w: 320, h: 190 }), steps: [`i: the fraction is ${F(3, 10)}, the decimal is 0.3, and ${F(3, 10)} = ${F(30, 100)} = <b>30%</b>.`, `ii: the rest is blue: ${F(7, 10)} = 0.7 = <b>70%</b>.`, `b: 30% of 60 cm²: ${F(3, 10)} × 60 = 60 ÷ 10 × 3 = <b>18 cm²</b>, or 0.3 × 60 = 18 cm².`] }],
          ['tip', 'In algebra: if r is the pink area and c is the area of the circle, then r = 0.3c.'],
          ['viz', 'percentBar'],
          ['vi', ['Phần trăm = phần trên 100: 32% = 32/100 = 0,32.', 'Đổi % → số thập phân: chia cho 100. Đổi % → phân số: viết trên 100 rồi rút gọn.', 'Đổi phân số → %: đổi sang mẫu 100, hoặc chia rồi nhân 100.', 'Tìm p% của một số: nhân số đó với p/100 (hoặc tìm 10%, 1% trước).', 'Lỗi hay gặp: 0,3 = 30% chứ không phải 3%.']],
        ],
        bank: [
          p2f(60), p2f(61), p2f(62), p2f(64), p2f(65), p2f(70),
          mcq('Joshua writes 0.3 = 3%. What is the mistake?', ['0.3 = 30%, and 3% = 0.03', '0.3 = 0.3%', '0.3 = 300%', 'There is no mistake'], 0, '0.3 = 30 hundredths = 30%. 3% = 3/100 = 0.03.'),
          fill('Write these percentages as decimals and as fractions in their simplest form.', [0.4, { expr: '2/5' }, 0.04, { expr: '1/25' }, 0.09, { expr: '9/100' }, 0.9, { expr: '9/10' }, 0.05, { expr: '1/20' }], 'Divide by 100, then simplify the fraction.', { f: '40% = [] = [] &nbsp; 4% = [] = [] &nbsp; 9% = [] = [] &nbsp; 90% = [] = [] &nbsp; 5% = [] = []', d: 2 }),
          f2p(1, 4), f2p(2, 5), f2p(4, 5), f2p(7, 50), f2p(7, 20), f2p(7, 25),
          match('Match each percentage to the equal fraction.', [['4%', '1/25'], ['6%', '3/50'], ['60%', '3/5'], ['40%', '2/5'], ['30%', '3/10']], 'Write each percentage over 100 and simplify.'),
          match('Match each percentage to the equal decimal.', [['4%', '0.04'], ['6%', '0.06'], ['60%', '0.6'], ['40%', '0.4'], ['30%', '0.3']], 'Divide by 100.'),
          multi('Which fractions with numerator 3 are equal to a whole-number percentage?', ['3/4', '3/5', '3/7', '3/20', '3/9', '3/25'], [0, 1, 3, 5], '3/4 = 75%, 3/5 = 60%, 3/20 = 15%, 3/25 = 12%. 3/7 and 3/9 give recurring decimals.', { fixed: true, d: 2 }),
          fill('Work out these fractions of 60 grams.', [5, 15, 20, 35, 55], `${F(1, 12)} of 60 = 5, so multiply by the numerator.`, { f: `${F(1, 12)} → [] g &nbsp; ${F(3, 12)} → [] g &nbsp; ${F(4, 12)} → [] g &nbsp; ${F(7, 12)} → [] g &nbsp; ${F(11, 12)} → [] g`, unit: '' }),
          fill('Work out these percentages of $300.', [150, 60, 90, 45], '10% of $300 = $30.', { f: '50% → $[] &nbsp; 20% → $[] &nbsp; 30% → $[] &nbsp; 15% → $[]' }),
          fill('100% = 40 m. Complete the diagram.', [10, 20, 8, 4], '10% = 4 m, 25% = ¼ of 40 m.', { f: '25% = [] m &nbsp; 50% = [] m &nbsp; 20% = [] m &nbsp; 10% = [] m' }),
          num('30% of $70 = $21. Use this to find 60% of $70.', 42, '60% = 2 × 30%, so 2 × $21 = $42.', { pre: '$' }),
          fill('Write these fractions as percentages.', [12.5, 37.5, 62.5, 87.5], `${F(1, 8)} = 12.5%, so ${F(3, 8)} = 3 × 12.5%.`, { f: `${F(1, 8)} = []% &nbsp; ${F(3, 8)} = []% &nbsp; ${F(5, 8)} = []% &nbsp; ${F(7, 8)} = []%`, d: 2 }),
          gen(() => { const p = pick([5, 8, 12, 15, 16, 24, 28, 35, 44, 45, 48, 55, 72, 76, 85, 92, 95]); return p2f(p); }),
          gen(() => { const [n, d] = pick([[1, 2], [3, 4], [1, 5], [3, 5], [9, 10], [3, 20], [11, 20], [9, 25], [13, 25], [21, 50], [1, 8], [5, 8]]); return f2p(n, d); }),
          gen(() => { const p = pick([10, 20, 25, 30, 40, 50, 60, 75, 80, 90, 15, 35, 45]); const A = pick([20, 40, 60, 80, 120, 160, 200, 240, 300, 360, 480]); return pOf(p, A, pick(['$', 'kg', 'cm', 'g'])); }),
          gen(() => { const tot = pick([20, 25, 40, 50]); const k = R(1, tot - 1); const nm = pick(['students', 'cars', 'apples', 'people']); return num(`In a group of ${tot} ${nm}, ${k} are red${nm === 'students' || nm === 'people' ? '-haired' : ''}. What percentage is this?`, r6((100 * k) / tot), `${F(k, tot)} = ${F(r6((100 * k) / tot), 100)} = ${N(r6((100 * k) / tot))}%.`, { unit: '%', app: true }); }, { app: true }),
          gen(() => { const A = pick([40, 45, 60, 75, 80, 90, 120]); const [n, d] = pick([[3, 10], [1, 4], [2, 5], [7, 10], [3, 5]]); return num(`The area of a shape is ${A} cm². ${F(n, d)} of it is shaded pink. What is the pink area?`, (A * n) / d, `${A} ÷ ${d} × ${n} = ${(A * n) / d} cm².`, { unit: 'cm²', app: true }); }, { app: true }),
        ],
      },
      {
        id: '10.2', t: 'Percentages large and small', vi: 'Phần trăm lớn và nhỏ',
        goals: ['recognise and use percentages, including percentages less than 1 or greater than 100.'],
        body: [
          ['p', `5% = 0.05 = ${F(5, 100)} = ${F(1, 20)} and 0.5% = 0.005. To write 0.5% as a fraction: ${F('0.5', 100)} = ${F(5, 1000)} = ${F(1, 200)} (multiply by 10, then divide by 5). 0.5% is too small to show on a diagram!`],
          ['ex', { t: 'Worked example 10.2', q: 'Write 17.5% as a a decimal b a fraction.', steps: ['a: divide 17.5 by 100 → <b>0.175</b>.', `b: ${F('17.5', 100)} = ${F(175, 1000)} (multiply by 10 to get whole numbers)`, `Divide by 5: ${F(35, 200)}; divide by 5 again: <b>${F(7, 40)}</b>.`] }],
          ['viz', 'percentLadder'],
          ['p', 'Percentages can be more than 100%. If over 20 years the price of a house increases by 75%, the new price is 100% + 75% = <b>175%</b> of the old price.'],
          ['viz', 'growth'],
          ['ex', { t: 'Worked example 10.3', q: 'The height of a young child is 140% of its height 2 years ago. Two years ago it was 70 cm. Work out the height now.', steps: ['Using decimals: 140% = 1.4, and 1.4 × 70 = <b>98 cm</b>.', `Using fractions: 140% = ${F(140, 100)} = ${F(7, 5)}; ${F(7, 5)} × 70 = 70 ÷ 5 × 7 = 14 × 7 = <b>98 cm</b>.`, 'In algebra: n = 1.4t, where t is the height 2 years ago.'] }],
          ['ex', { t: 'Worked example 10.4', q: 'Arun has $20. He gives $5 to Marcus and $13 to Sofia. a What percentage does each get? b What percentage is left?', steps: [`Marcus: ${F(5, 20)} = ${F(1, 4)} = <b>25%</b>; Sofia: ${F(13, 20)} = ${F(65, 100)} = <b>65%</b>.`, `Left: $20 − $5 − $13 = $2, and ${F(2, 20)} = ${F(1, 10)} = <b>10%</b>. Check: 25% + 65% + 10% = 100%.`] }],
          ['vi', ['Phần trăm nhỏ hơn 1: 0,5% = 0,005 = 1/200.', 'Mẹo: tìm 1% (chia 100) rồi 0,1% (chia 1000), sau đó ghép lại.', 'Tăng p% → giá trị mới = (100 + p)% giá trị cũ. Tăng 200% → gấp 3 lần; tăng 300% → gấp 4 lần.', '“A chiếm bao nhiêu % của B” = A ÷ B × 100. Có thể lớn hơn 100%.']],
          ['viz', 'fdpMatch'],
        ],
        bank: [
          fill('Write these percentages as decimals and as fractions in their simplest form.', [0.075, { expr: '3/40' }, 0.625, { expr: '5/8' }, 0.015, { expr: '3/200' }, 0.475, { expr: '19/40' }, 0.325, { expr: '13/40' }], 'Multiply numerator and denominator by 10, then simplify.', { f: '7.5% = [] = [] &nbsp; 62.5% = [] = [] &nbsp; 1.5% = [] = [] &nbsp; 47.5% = [] = [] &nbsp; 32.5% = [] = []', d: 2 }),
          p2f(2), p2f(0.2), p2f(8), p2f(0.8, { d: 2 }), p2f(7), p2f(0.7),
          fill('Complete the table (each column is a different amount).', [64, 40, 150, 32, 4, 15, 0.4, 1.5, 0.32], '5% of the third amount is $3.20, so 100% = $3.20 × 20 = $64.', { f: '100%: $80, $300, $[]<br>50%: $[] , $[] , $[]<br>5%: $[] , $[] , $3.20<br>0.5%: $[] , $[] , $[]', d: 3 }),
          fill('Work out these percentages of 600 kilograms.', [6, 9, 21, 13.2], '1% of 600 kg = 6 kg; then 1.5% = 1.5 × 6.', { f: '1% → [] kg &nbsp; 1.5% → [] kg &nbsp; 3.5% → [] kg &nbsp; 2.2% → [] kg' }),
          fill('1% of 7000 metres = 70 m. Use this to work out:', [140, 35, 7, 21], '0.1% = 70 ÷ 10 = 7 m; 0.3% = 3 × 7 = 21 m.', { f: '2% → [] m &nbsp; 0.5% → [] m &nbsp; 0.1% → [] m &nbsp; 0.3% → [] m' }),
          pOf(1.3, 7500, '$', { d: 2 }),
          mcq('Zara says ⅓ is 33%. Arun says ⅓ is 33.3%. Who is correct?', ['Both, if they are rounding: ⅓ = 33⅓% exactly', 'Only Zara', 'Only Arun', 'Neither — ⅓ = 30%'], 0, '⅓ of 100 = 33.333…, so ⅓ = 33⅓%. Zara rounded to a whole number, Arun to 1 decimal place.'),
          fill('Write these mixed numbers as percentages.', [110, 130, 175, 170, 225], `${MX(1, 1, 2)} = 150% (100% + 50%).`, { f: `${MX(1, 1, 10)} = []% &nbsp; ${MX(1, 3, 10)} = []% &nbsp; ${MX(1, 3, 4)} = []% &nbsp; ${MX(1, 7, 10)} = []% &nbsp; ${MX(2, 1, 4)} = []%` }),
          fill(`${F(1, 5)} = 20%. Write these mixed numbers as percentages.`, [120, 160, 180, 260], 'Add 100% for each whole one.', { f: `${MX(1, 1, 5)} = []% &nbsp; ${MX(1, 3, 5)} = []% &nbsp; ${MX(1, 4, 5)} = []% &nbsp; ${MX(2, 3, 5)} = []%` }),
          whatP(40, 50, '$'), whatP(50, 40, '$', { d: 2 }),
          num('30% of $60 = $18. What percentage of $60 is $102?', 170, '$102 = $60 + $42; $42 = 70% of $60 (7 × $6). So $102 = 170%.', { unit: '%', d: 3 }),
          fill('Marcus has 500 g of flour. He uses 200 g for bread and 120 g for biscuits. What percentage of the flour …', [40, 24, 36], '200/500 = 40%; 120/500 = 24%; he does not use 180 g = 36%.', { f: 'for bread: []% &nbsp; for biscuits: []% &nbsp; not used: []%', app: true }),
          fill('Sofia works 40 hours in a week: 25 hours in her office, 8 hours in the factory and the rest in a workshop.', [62.5, 20, 17.5], '25/40 = 62.5%; 8/40 = 20%; 7/40 = 17.5%.', { f: 'office: []% &nbsp; factory: []% &nbsp; workshop: []%', app: true, d: 2 }),
          fill('Zara earns $250. She pays $95 in tax and a bill of $65. What percentage of her money …', [38, 36], '95/250 = 38%; she has $90 left: 90/250 = 36%.', { f: 'does she pay in tax? []% &nbsp; does she have left? []%', app: true }),
          fill('An airline ticket costs $40. The price is increased by 200%.', [80, 120, 3], '200% of $40 = $80. New price = $120 = 3 × $40.', { f: 'Increase: $[] &nbsp; New price: $[] &nbsp; The new price is [] times the original price.', app: true }),
          fill('A puppy has a mass of 5 kg. As it grows, its mass increases by 300%.', [15, 20, 4], '300% of 5 kg = 15 kg; new mass 20 kg = 4 × 5 kg.', { f: 'Increase: [] kg &nbsp; New mass: [] kg &nbsp; The new mass is [] times the original.', app: true }),
          fill('What percentage of the original price is the new price?', [105, 180], '100% + 5% = 105%; 100% + 80% = 180%.', { f: 'A car increases in cost by 5%: []% &nbsp; Petrol increases in cost by 80%: []%' }),
          whatP(200, 125, '$', { q: 'Ruqiyah wants to know: what percentage of $125 is $200?', d: 2 }),
          pOf(135, 40, '$', { q: 'Vikram wants to work out 135% of $40. What is the answer?' }),
          num('The number of people working for a company increases by 400%. The number of people has been multiplied by …', 5, '100% + 400% = 500% = 5 times.', { d: 2 }),
          gen(() => { const p = pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.5, 2.5, 3.5, 4.5, 12.5]); const A = pick([200, 400, 600, 800, 1000, 2000, 4000, 5000]); return pOf(p, A, pick(['$', 'kg', 'm', 'g'])); }),
          gen(() => { const p = pick([105, 110, 120, 125, 130, 140, 150, 160, 175, 180, 200, 250, 300]); const A = pick([20, 40, 60, 80, 120, 200, 240]); return pOf(p, A, pick(['$', 'kg', 'cm'])); }),
          gen(() => { const p = pick([2.5, 7.5, 12.5, 22.5, 37.5, 42.5, 0.5, 1.5, 0.25, 0.4]); return Math.random() < 0.5 ? p2f(p) : p2d(p); }),
          gen(() => { const base = pick([20, 40, 50, 80, 120, 150, 200]); const inc = pick([100, 200, 300, 400, 50, 150, 25]); return num(`A price of $${base} increases by ${inc}%. What is the new price?`, (base * (100 + inc)) / 100, `New price = ${100 + inc}% of $${base} = ${N(r6(1 + inc / 100))} × ${base} = $${N((base * (100 + inc)) / 100)}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const whole = pick([40, 50, 80, 125, 200, 250]); const part = whole * pick([1.2, 1.5, 1.6, 2, 2.4, 0.35, 0.6, 1.25]); return whatP(r6(part), whole, '$'); }),
          gen(() => { const tot = pick([80, 120, 200, 250, 400]); const used = Math.round(tot * pick([0.15, 0.2, 0.25, 0.3])), gave = Math.round(tot * pick([0.4, 0.45, 0.5])); return num(`Arun has ${tot} stamps. He uses ${used} and gives ${gave} to other people. What percentage does he have left?`, r6((100 * (tot - used - gave)) / tot), `He has ${tot - used - gave} left: ${tot - used - gave} ÷ ${tot} × 100 = ${N(r6((100 * (tot - used - gave)) / tot))}%.`, { unit: '%', app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Small percentages, big effects', hero: 'heroPercent',
      lead: 'Less than half of one percent of the air is carbon dioxide — yet it controls the temperature of our planet. A few percent of interest each year can double your money. Percentages tell powerful stories.',
      leadVi: 'Carbon dioxide chỉ chiếm chưa tới 0,05% không khí nhưng điều khiển nhiệt độ Trái Đất; vài phần trăm lãi mỗi năm có thể làm tiền gấp đôi. Phần trăm kể những câu chuyện lớn.',
      cards: [
        { t: 'What is air made of?', p: 'About 78% of the air is nitrogen and 21% is oxygen. Everything else fits into the last 1% — including argon (0.93%) and carbon dioxide (about 0.04%).', viz: 'airMix' },
        { t: 'The magic of compound growth', p: 'If money grows by the same percentage every year, the increase gets bigger each time, because you get interest on your interest. Bankers use the “rule of 72” to estimate how many years it takes to double.', viz: 'doubling' },
        { t: '70% chance of rain', p: 'A weather forecast of 70% means that on 100 days like this one, it rains on about 70 of them. You can still have a dry day — it is a chance, not a promise!', viz: 'rainChance' },
        { t: 'Percentages bigger than 100%', p: 'A puppy can increase its mass by 300% as it grows. That means it ends up 4 times as heavy, not 3 times — because the new mass is 100% + 300% = 400% of the old mass.', viz: 'growth' },
      ],
      facts: [['0.04%', 'carbon dioxide', 'About 4 molecules in every 10 000 molecules of air.'], ['71%', 'ocean', 'About 71% of the Earth’s surface is covered by water.'], ['60%', 'water in you', 'An adult human body is about 60% water.'], ['72', 'rule of 72', '72 ÷ interest rate ≈ years to double.']],
      challenge: { t: 'The sale puzzle', p: 'A shop takes 20% off the price of a $50 jacket, then later takes another 10% off the new price. Is that the same as 30% off? Work out both prices.', a: '20% off $50 = $40; 10% off $40 = $36. But 30% off $50 = $35. So two discounts of 20% and 10% give 28% off in total, not 30%, because the second percentage is of a smaller amount.' },
    },
    reading: {
      title: 'The Tiny Gas That Warms the World', sub: 'Why a very small percentage matters. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D'],
      paras: [
        'If you could collect one million tiny particles of air, about 780 000 of them would be nitrogen and about 210 000 would be oxygen. In other words, nitrogen makes up about 78% of the air and oxygen about 21%. That leaves only about 1% for all the other gases together.',
        'Most of that last 1% is argon, a gas that does almost nothing. Carbon dioxide is much rarer: today it is only about 0.04% of the air, or about 420 particles in every million. Even though this is such a small percentage, carbon dioxide is very important because it traps heat near the Earth’s surface, like a blanket.',
        'Scientists can measure how much carbon dioxide there was in the past by studying bubbles of air trapped in ancient ice. Around the year 1750, before factories and cars, the air contained about 0.028% carbon dioxide. Since then the amount has risen to about 0.042%, an increase of about 50%.',
        'Because a small percentage can have a large effect, scientists watch these numbers very carefully. A measuring station on the volcano Mauna Loa in Hawaii has recorded carbon dioxide every day since 1958. Its famous graph goes up and down a little each year, as plants grow in summer and lose their leaves in winter, but the overall trend is clearly upwards.',
      ],
      gloss: [['particle', 'hạt'], ['trap', 'giữ lại / bẫy'], ['ancient', 'cổ xưa'], ['measuring station', 'trạm đo'], ['trend', 'xu hướng'], ['blanket', 'chăn']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'About what percentage of the air is oxygen?', opts: ['21%', '78%', '1%', '0.04%'], a: 0, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'Why is carbon dioxide important even though there is very little?', opts: ['It traps heat near the Earth’s surface', 'It is the gas we breathe in', 'It makes up most of the last 1%', 'It is found in ice'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'How do scientists know how much carbon dioxide there was long ago?', opts: ['They study air bubbles in ancient ice', 'They read old books', 'They ask farmers', 'They measure volcanoes'], a: 0, ex: 'Paragraph C.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'Argon is the most common gas in the last 1% of the air.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: '“Most of that last 1% is argon”.' },
          { type: 'mcq', q: 'The Mauna Loa station started measuring in 1750.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'It started in 1958.' },
          { type: 'mcq', q: 'Carbon dioxide levels are higher in summer than in winter.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'The text says the graph goes up and down but not which season is higher.' },
        ] },
        { title: 'Numbers and percentages', qs: [
          { type: 'fill', q: 'Complete.', f: 'Out of one million particles of air, about [] are nitrogen. Today there are about [] particles of carbon dioxide in every million. Since 1750 carbon dioxide has increased by about []%.', a: [780000, 420, 50], ex: 'Paragraphs A, B, C.' },
          { type: 'num', q: 'Write 0.04% as a decimal.', a: 0.0004, ex: '0.04 ÷ 100 = 0.0004.' },
        ] },
      ],
    },
    listening: {
      title: 'At the sports shop sale', intro: 'Lan is shopping with her brother Tom in a sale. Listen and answer.',
      voices: { Lan: 'glassy', Tom: 'rounded' },
      lines: [
        { spk: 'Lan', text: 'Look, Tom! These trainers usually cost eighty dollars, but today there is twenty-five percent off.' },
        { spk: 'Tom', text: 'Twenty-five percent is a quarter. A quarter of eighty is twenty, so they cost sixty dollars.' },
        { spk: 'Lan', text: 'Great. And this sports bag was forty dollars. The sign says fifty percent off.' },
        { spk: 'Tom', text: 'Half price, so twenty dollars. Together that is eighty dollars.' },
        { spk: 'Lan', text: 'I only have seventy-five dollars. Hmm, but members get an extra five percent off the total.' },
        { spk: 'Tom', text: 'Five percent of eighty is four dollars, so you would pay seventy-six dollars. Still one dollar too much!' },
        { spk: 'Lan', text: 'Then I will buy the trainers today and come back for the bag next week.' },
        { spk: 'Tom', text: 'Good idea. Last year these trainers cost only fifty dollars, so the normal price has gone up by sixty percent!' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'Trainers: normal price $[] , discount []% , sale price $[] &nbsp; Bag: sale price $[] &nbsp; Member discount: []%', a: [80, 25, 60, 20, 5], ex: '25% of $80 = $20 off; 50% of $40 = $20.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'num', q: 'How much would Lan pay for both items with the member discount (in dollars)?', a: 76, ex: '80 − 4 = 76.' },
          { type: 'mcq', q: 'What does Lan decide to do?', opts: ['buy the trainers today and the bag next week', 'buy both items today', 'buy only the bag', 'buy nothing'], a: 0, ex: 'Last line from Lan.' },
          { type: 'num', q: 'By what percentage has the normal price of the trainers gone up since last year?', a: 60, ex: '$50 → $80 is an increase of $30, and 30/50 = 60%.' },
        ] },
      ],
    },
  });
})();
