/* Unit 13 — Probability */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, frac, fill, order, match, sort, txt, gen } = Q;
  const PH = { ph: 'vd: 2/5, 0.4 hoặc 40%' };
  const pf = (q, n, d, ex, o) => frac(q, [n, d], ex, Object.assign({}, PH, o));
  const FS = (n, d) => { if (n === 0) return '0'; if (n === d) return '1'; const g = U.gcd(n, d); return `${n / g}/${d / g}`; };
  const word = (p) => (p <= 0 ? 'impossible — không thể' : p < 0.2 ? 'very unlikely — rất khó xảy ra' : p < 0.5 ? 'unlikely — khó xảy ra' : p === 0.5 ? 'even chance — khả năng ngang nhau' : p < 0.8 ? 'likely — có thể xảy ra' : p < 1 ? 'very likely — rất có thể xảy ra' : 'certain — chắc chắn');
  const COLS = ['#ef476f', '#4f8cff', '#06d6a0', '#ffd166', '#9b5de5', '#ff8c42'];
  const cardsFig = (arr) => `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0">${arr.map((c) => `<span style="display:inline-grid;place-items:center;width:34px;height:44px;border-radius:7px;border:2px solid var(--ink-3);background:var(--surface);font-weight:800;font-size:1.05rem">${c}</span>`).join('')}</div>`;
  const spinFig = (secs) => { const n = secs.length, r = 70; let g = `<svg viewBox="0 0 160 160" style="width:100%;max-width:170px">`; secs.forEach((c, i) => { const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2; g += `<path d="M80 80 L${80 + r * Math.cos(a0)} ${80 + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${80 + r * Math.cos(a1)} ${80 + r * Math.sin(a1)} Z" fill="${c}" stroke="#fff" stroke-width="2"/>`; }); return g + `<circle cx="80" cy="80" r="6" fill="var(--ink)"/><line x1="80" y1="80" x2="80" y2="28" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></svg>`; };

  const scaleFig = (marks) => { const X = (v) => 20 + v * 300; let g = `<svg viewBox="0 0 340 90" style="width:100%;max-width:360px"><rect x="20" y="40" width="300" height="10" rx="5" fill="var(--line)"/>`; for (let i = 0; i <= 10; i++) g += `<line x1="${X(i / 10)}" y1="36" x2="${X(i / 10)}" y2="54" stroke="var(--ink-2)" stroke-width="${i % 5 ? 1 : 2}"/>`; g += ['0', '0.5', '1'].map((t, i) => `<text x="${X(i / 2)}" y="70" text-anchor="middle" font-size="12" fill="var(--ink)">${t}</text>`).join(''); marks.forEach(([v, l], i) => { g += `<path d="M${X(v)} 36 l-6 -10 h12 z" fill="${COLS[i]}"/><text x="${X(v)}" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="${COLS[i]}">${l}</text>`; }); return g + '</svg>'; };

  /* ---------- widgets ---------- */
  APP.viz.probScale = function (el) {
    const f = VZ.frame(el, 'Thang xác suất từ 0 đến 1', { icon: 'target' });
    const EV = [['🪙 Tung đồng xu ra mặt ngửa', 0.5], ['📅 Ngày sau thứ Hai là thứ Ba', 1], ['🎲 Gieo xúc xắc được số 7', 0], ['🎲 Gieo được số 6', 1 / 6], ['🎲 Gieo được số ≥ 3', 4 / 6], ['⚽ Tigers thắng (45%)', 0.45], ['⚽ Lions thắng (4/5)', 0.8], ['🚆 Tàu đến muộn (0,05)', 0.05], ['🌧️ Mưa ngày mai (25%)', 0.25]];
    let p = 0.5, cur = null; const W = 360, H = 130, L = 20, Rr = 340; const svg = VZ.svg(W, H); f.stage.append(svg);
    const defs = s('defs'); const lg = s('linearGradient', { id: 'pgrad' }); [['0', '#ef476f'], ['0.5', '#ffd166'], ['1', '#06d6a0']].forEach(([o, c]) => lg.append(s('stop', { offset: o, 'stop-color': c }))); defs.append(lg);
    function draw() {
      svg.innerHTML = ''; svg.append(defs); const X = (v) => L + v * (Rr - L);
      svg.append(s('rect', { x: L, y: 58, width: Rr - L, height: 14, rx: 7, fill: 'url(#pgrad)' }));
      for (let i = 0; i <= 10; i++) svg.append(s('line', { x1: X(i / 10), y1: 54, x2: X(i / 10), y2: 76, stroke: 'var(--ink-2)', 'stroke-width': i % 5 ? 1 : 2.5 }));
      [['0', 0, 'impossible'], ['0.5', 0.5, 'even chance'], ['1', 1, 'certain']].forEach(([t, v, w]) => svg.append(s('text', { x: X(v), y: 94, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)', text: t }), s('text', { x: X(v), y: 110, 'text-anchor': v ? (v === 1 ? 'end' : 'middle') : 'start', 'font-size': 11, fill: 'var(--ink-2)', text: w })));
      svg.append(s('text', { x: X(0.25), y: 110, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)', text: 'unlikely' }), s('text', { x: X(0.75), y: 110, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)', text: 'likely' }));
      const g = s('g', { style: 'transition:transform .5s cubic-bezier(.3,1.4,.5,1)', transform: `translate(${X(p)},0)` }); g.append(s('path', { d: 'M0 52 L-9 36 L9 36 Z', fill: 'var(--accent)' }), s('text', { x: 0, y: 28, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--accent)', text: N(U.round(p, 3)) })); svg.append(g);
      const pc = U.round(p * 100, 1); const fr = Math.abs(p * 6 - Math.round(p * 6)) < 1e-9 && p !== 0.5 && p % 0.25 ? FS(Math.round(p * 6), 6) : FS(Math.round(p * 100), 100);
      f.out.innerHTML = `${cur ? `<b>${cur}</b>: ` : ''}xác suất = <b>${fr}</b> = ${N(U.round(p, 3))} = ${N(pc)}% → <b>${word(p)}</b>.`;
    }
    const sel = h('select', { class: 'sel', 'aria-label': 'Sự kiện', onchange: (e) => { const k = +e.target.value; if (k < 0) return; cur = EV[k][0]; p = EV[k][1]; const ri = rg.querySelector('input'); ri.value = p; rg.querySelector('b').textContent = ri.value; SFX.play('pop'); draw(); } }, [h('option', { value: -1 }, 'Chọn một sự kiện…'), ...EV.map((e, i) => h('option', { value: i }, e[0]))]);
    const rg = VZ.range('Xác suất', 0, 1, p, 0.01, (v) => { p = v; cur = null; draw(); });
    f.ctrls.append(sel, rg); draw();
  };
  APP.viz.cardDraw = function (el) {
    const f = VZ.frame(el, 'Rút thẻ ngẫu nhiên — kết quả đồng khả năng', { icon: 'shuffle' });
    const SETS = { nums: ['Thẻ số', [2, 5, 8, 5, 9, 8, 5, 3, 8, 5]], math: ['MATHEMATICS', 'MATHEMATICS'.split('')], banana: ['BANANA', 'BANANA'.split('')], arith: ['ARITHMETIC', 'ARITHMETIC'.split('')], primes: ['Số nguyên tố', [2, 3, 5, 7, 11, 13, 17, 19]] };
    let key = 'nums', ev = 0, draws = 0, hits = 0, last = -1; const box = h('div'); f.stage.append(box); const evSel = h('select', { class: 'sel', 'aria-label': 'Biến cố' });
    const events = () => { const arr = SETS[key][1]; const isNum = typeof arr[0] === 'number'; const uniq = [...new Set(arr)].sort((a, b) => (isNum ? a - b : a < b ? -1 : 1)); const E = uniq.map((u) => [`= ${u}`, (c) => c === u]); if (isNum) E.push(['số lẻ (odd)', (c) => c % 2 === 1], ['không phải 2 (not 2)', (c) => c !== 2], ['= 1', (c) => c === 1], ['≤ 5', (c) => c <= 5], ['≥ 5', (c) => c >= 5]); else E.push(['nguyên âm (vowel)', (c) => 'AEIOU'.includes(c)], ['chữ B', (c) => c === 'B']); return E; };
    function fillEv() { evSel.innerHTML = ''; events().forEach(([t], i) => evSel.append(h('option', { value: i }, t))); evSel.value = ev; }
    evSel.onchange = (e) => { ev = +e.target.value; draws = hits = 0; last = -1; draw(); };
    function draw(flip) {
      const arr = SETS[key][1], [lab, pr] = events()[ev] || events()[0]; const k = arr.filter(pr).length, n = arr.length;
      box.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:6px 0 10px">${arr.map((c, i) => `<div style="width:46px;height:62px;border-radius:9px;display:grid;place-items:center;font-weight:800;font-size:1.3rem;border:3px solid ${pr(c) ? 'var(--good)' : 'var(--line)'};background:${pr(c) ? 'var(--good-soft)' : 'var(--surface)'};${i === last ? `outline:4px solid var(--accent);${flip ? 'animation:popIn .45s both' : ''}` : ''}">${c}</div>`).join('')}</div>
      <div style="text-align:center;font-size:1.1rem">P(${lab}) = <b>${k}</b> thẻ thuận lợi / <b>${n}</b> thẻ = <b style="color:var(--accent)">${FS(k, n)}</b> = ${N(U.round((k / n) * 100, 1))}%</div>`;
      f.out.innerHTML = draws ? `Đã rút ${draws} lần (có hoàn lại), trúng ${hits} lần → tần suất tương đối ${N(U.round(hits / draws, 3))} so với xác suất lí thuyết ${N(U.round(k / n, 3))}.` : 'Mỗi thẻ có khả năng được chọn như nhau. Bấm “Rút thẻ” để thử nghiệm.';
    }
    const drawCards = (m) => { const arr = SETS[key][1], pr = events()[ev][1]; for (let i = 0; i < m; i++) { last = R(0, arr.length - 1); draws++; if (pr(arr[last])) hits++; } SFX.play(m > 1 ? 'whoosh' : 'flip'); draw(true); };
    f.ctrls.append(VZ.seg(Object.keys(SETS).map((k) => [k, SETS[k][0]]), key, (v) => { key = v; ev = 0; draws = hits = 0; last = -1; fillEv(); draw(); }), evSel, VZ.btn('Rút thẻ 🂠', () => drawCards(1), 'btn sm sc'), VZ.btn('×100', () => drawCards(100)));
    fillEv(); draw();
  };
  APP.viz.exclusiveVenn = function (el) {
    const f = VZ.frame(el, 'Biến cố xung khắc? Xem trên sơ đồ Venn', { icon: 'grid' });
    const EV = { odd: ['số lẻ', (x) => x % 2 === 1], even: ['số chẵn', (x) => x % 2 === 0], m3: ['bội của 3', (x) => x % 3 === 0], f30: ['ước của 30', (x) => 30 % x === 0], prime: ['số nguyên tố', U.isPrime], lt6: ['nhỏ hơn 6', (x) => x < 6], gt6: ['lớn hơn 6', (x) => x > 6], six: ['số 6', (x) => x === 6] };
    let nmax = 20, A = 'odd', B = 'm3'; const W = 360, H = 250, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const nums = Array.from({ length: nmax }, (_, i) => i + 1); const pa = EV[A][1], pb = EV[B][1];
      svg.append(s('rect', { x: 4, y: 4, width: W - 8, height: H - 8, rx: 12, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 1.5 }), s('circle', { cx: 130, cy: 110, r: 92, fill: 'color-mix(in srgb, var(--number) 18%, transparent)', stroke: 'var(--number)', 'stroke-width': 2.5 }), s('circle', { cx: 230, cy: 110, r: 92, fill: 'color-mix(in srgb, var(--algebra) 18%, transparent)', stroke: 'var(--algebra)', 'stroke-width': 2.5 }), s('text', { x: 60, y: 26, 'font-size': 13, 'font-weight': 800, fill: 'var(--number)', text: 'A: ' + EV[A][0] }), s('text', { x: 300, y: 26, 'text-anchor': 'end', 'font-size': 13, 'font-weight': 800, fill: 'var(--algebra)', text: 'B: ' + EV[B][0] }));
      const reg = { a: [], ab: [], b: [], n: [] }; nums.forEach((x) => reg[pa(x) && pb(x) ? 'ab' : pa(x) ? 'a' : pb(x) ? 'b' : 'n'].push(x));
      const place = (arr, x0, cols, y0, dx = 24, dy = 24) => arr.forEach((v, i) => svg.append(s('text', { x: x0 + (i % cols) * dx, y: y0 + Math.floor(i / cols) * dy, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--ink)', text: v, style: `animation:popIn .3s ${i * 0.03}s both` })));
      place(reg.a, 66, 3, 74); place(reg.ab, 168, 2, 84); place(reg.b, 246, 3, 74); place(reg.n, 26, 13, 228, 26);
      const n = nmax, ex = reg.ab.length === 0; const u = reg.a.length + reg.ab.length + reg.b.length;
      f.out.innerHTML = `P(A) = ${FS(reg.a.length + reg.ab.length, n)}, P(B) = ${FS(reg.b.length + reg.ab.length, n)}. ${ex ? '<b>Không có số chung → A và B XUNG KHẮC</b> (mutually exclusive): P(A hoặc B) = P(A) + P(B) = ' + FS(u, n) + '.' : `Các số ${reg.ab.join(', ')} thuộc cả A và B → <b>KHÔNG xung khắc</b>. P(A hoặc B) = ${FS(u, n)}, khác P(A) + P(B) vì phần chung bị đếm hai lần.`}`;
    }
    const mk = (cur, set) => h('select', { class: 'sel', onchange: (e) => { set(e.target.value); SFX.play('select'); draw(); } }, Object.keys(EV).map((k) => h('option', { value: k, selected: k === cur ? '' : null }, EV[k][0])));
    f.ctrls.append(VZ.seg([[6, 'Xúc xắc 6 mặt'], [20, 'Xúc xắc 20 mặt']], nmax, (v) => { nmax = +v; draw(); }), h('label', {}, 'A: ', mk(A, (v) => (A = v))), h('label', {}, 'B: ', mk(B, (v) => (B = v))));
    draw();
  };
  APP.viz.hundredGrid = function (el) {
    const f = VZ.frame(el, 'Số ngẫu nhiên từ 00 đến 99', { icon: 'grid' });
    let d = 6, mode = 'one'; const box = h('div'); f.stage.append(box);
    const M = { both: ['cả hai chữ số là d', (a, b) => a === d && b === d], one: ['đúng một chữ số là d', (a, b) => (a === d) !== (b === d)], none: ['không chữ số nào là d', (a, b) => a !== d && b !== d], same: ['hai chữ số giống nhau', (a, b) => a === b], sum9: ['tổng hai chữ số = 9', (a, b) => a + b === 9] };
    function draw() {
      const pr = M[mode][1]; let k = 0; let g = '<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:3px;max-width:380px;margin:0 auto">'; for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) { const on = pr(a, b); if (on) k++; g += `<div style="aspect-ratio:1;display:grid;place-items:center;border-radius:5px;font-size:clamp(.55rem,2.4vw,.8rem);font-weight:700;font-family:var(--f-mono);background:${on ? 'var(--accent)' : 'var(--surface)'};color:${on ? '#fff' : 'var(--ink-2)'};border:1px solid var(--line);transition:background .3s">${a}${b}</div>`; }
      box.innerHTML = g + '</div>'; f.out.innerHTML = `P(${M[mode][0].replace('d', d)}) = <b>${k}/100</b> = ${N(k / 100)} = ${k}%.`;
    }
    f.ctrls.append(VZ.seg(Object.keys(M).map((k) => [k, M[k][0]]), mode, (v) => { mode = v; SFX.play('select'); draw(); }), VZ.range('d', 0, 9, d, 1, (v) => { d = v; draw(); }));
    draw();
  };
  APP.viz.spinnerSim = function (el) {
    const f = VZ.frame(el, 'Vòng quay: xác suất lí thuyết và thực nghiệm', { icon: 'replay' });
    const cnt = [5, 4, 2, 1], names = ['đỏ', 'xanh', 'lục', 'vàng']; let tally = [0, 0, 0, 0], rot = 0, busy = false; const W = 360, H = 200, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const n = cnt.reduce((a, b) => a + b, 0), r = 80, cx = 95, cy = 100; let k = 0; const g = s('g', { transform: `rotate(${rot} ${cx} ${cy})` });
      cnt.forEach((c, ci) => { for (let j = 0; j < c; j++, k++) { const a0 = (k / n) * 2 * Math.PI - Math.PI / 2, a1 = ((k + 1) / n) * 2 * Math.PI - Math.PI / 2; g.append(s('path', { d: `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`, fill: COLS[ci], stroke: '#fff', 'stroke-width': 2 })); } });
      svg.append(g, s('path', { d: `M${cx - 8} ${cy - r - 14} L${cx + 8} ${cy - r - 14} L${cx} ${cy - r + 6} Z`, fill: 'var(--ink)' }), s('circle', { cx, cy, r: 7, fill: 'var(--ink)' }));
      const T = tally.reduce((a, b) => a + b, 0), bx = 205, bw = 32, base = 170, hh = 140;
      cnt.forEach((c, i) => { const th = c / n, ex = T ? tally[i] / T : 0, x = bx + i * (bw + 6); svg.append(s('rect', { x, y: base - ex * hh, width: bw, height: ex * hh, rx: 4, fill: COLS[i], style: 'transition:all .3s' }), s('line', { x1: x - 3, y1: base - th * hh, x2: x + bw + 3, y2: base - th * hh, stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }), s('text', { x: x + bw / 2, y: base + 15, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-2)', text: names[i] })); });
      svg.append(s('line', { x1: bx - 4, y1: base, x2: W - 4, y2: base, stroke: 'var(--ink)', 'stroke-width': 1.5 }));
      f.out.innerHTML = `Lí thuyết (vạch đứt): ${cnt.map((c, i) => `${names[i]} ${c}/${n}`).join(', ')}. ${T ? `Thực nghiệm sau <b>${T}</b> lần quay: ${tally.map((t, i) => `${names[i]} ${N(U.round(t / T, 3))}`).join(', ')}. Càng quay nhiều, cột càng gần vạch đứt.` : 'Bấm quay để làm thí nghiệm.'}`;
    }
    const pickSec = () => { const n = cnt.reduce((a, b) => a + b, 0); let u = R(0, n - 1); for (let i = 0; i < 4; i++) { if (u < cnt[i]) return [i, u]; u -= cnt[i]; } return [3, 0]; };
    const spin = () => { if (busy) return; busy = true; const n = cnt.reduce((a, b) => a + b, 0); const [ci] = pickSec(); let start = 0; for (let i = 0; i < ci; i++) start += cnt[i]; const sec = start + R(0, cnt[ci] - 1); const target = 360 * 4 + (360 - ((sec + 0.5) / n) * 360); const r0 = rot % 360; SFX.play('whoosh'); VZ.animate(1400, (e) => { rot = r0 + (target - r0 + 360 * 0) * e; draw(); }, () => { tally[ci]++; rot = rot % 360; busy = false; SFX.play('pop'); draw(); }); };
    const many = (m) => { for (let i = 0; i < m; i++) tally[pickSec()[0]]++; SFX.play('tick'); draw(); };
    f.ctrls.append(VZ.btn('Quay 1 lần', spin, 'btn sm sc'), VZ.btn('×10', () => many(10)), VZ.btn('×100', () => many(100)), VZ.btn('×1000', () => many(1000)), VZ.btn('Xoá', () => { tally = [0, 0, 0, 0]; draw(); }, 'btn sm ghost'));
    names.forEach((nm, i) => f.ctrls.append(VZ.range(nm, 0, 8, cnt[i], 1, (v) => { cnt[i] = v; if (cnt.every((c) => !c)) cnt[i] = 1; tally = [0, 0, 0, 0]; draw(); })));
    draw();
  };
  APP.viz.pinExperiment = function (el) {
    const f = VZ.frame(el, 'Thả đinh ghim: tần suất tương đối ổn định dần', { icon: 'chart' });
    const SC = { pin: ['📌 Đinh ghim mũi lên', 0.39], six: ['🎲 Xúc xắc lệch ra 6', 0.3], cap: ['🧴 Nắp chai ngửa', 0.62], toast: ['🍞 Bánh mì rơi mặt bơ', 0.55] };
    let key = 'pin', n = 0, k = 0, hist = [], show = false; const W = 360, H = 200, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const L = 36, B = 30, T = 10, Rr = 10; const nmax = Math.max(50, n); const X = (i) => L + (i / nmax) * (W - L - Rr), Y = (v) => H - B - v * (H - B - T);
      for (let v = 0; v <= 1.001; v += 0.25) svg.append(s('line', { x1: L, y1: Y(v), x2: W - Rr, y2: Y(v), stroke: 'var(--line)' }), s('text', { x: L - 5, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: N(v) }));
      svg.append(s('line', { x1: L, y1: Y(0), x2: W - Rr, y2: Y(0), stroke: 'var(--ink)', 'stroke-width': 1.5 }), s('text', { x: W - Rr, y: H - 8, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-2)', text: `số lần thử (${nmax})` }));
      if (show) svg.append(s('line', { x1: L, y1: Y(SC[key][1]), x2: W - Rr, y2: Y(SC[key][1]), stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
      if (hist.length > 1) svg.append(s('polyline', { points: hist.map(([i, v]) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5 }));
      f.out.innerHTML = n ? `${SC[key][0]}: ${k} lần / ${n} lần thử → tần suất tương đối = ${k}/${n} ≈ <b>${N(U.round(k / n, 3))}</b> (${N(U.round((k / n) * 100, 1))}%). ${n < 100 ? 'Với ít lần thử, kết quả dao động mạnh.' : 'Với nhiều lần thử, đường đồ thị gần như nằm ngang → ước lượng đáng tin hơn.'}` : 'Các kết quả KHÔNG đồng khả năng, nên phải làm thí nghiệm để ước lượng xác suất.';
    }
    const run = (m) => { const p = SC[key][1]; for (let i = 0; i < m; i++) { n++; if (Math.random() < p) k++; if (n <= 60 || n % Math.ceil(n / 300) === 0) hist.push([n, k / n]); } SFX.play(m > 10 ? 'whoosh' : 'drop'); draw(); };
    f.ctrls.append(VZ.seg(Object.keys(SC).map((x) => [x, SC[x][0]]), key, (v) => { key = v; n = k = 0; hist = []; show = false; draw(); }), VZ.btn('Thả 10', () => run(10), 'btn sm sc'), VZ.btn('+100', () => run(100)), VZ.btn('+1000', () => run(1000)), VZ.btn('Xác suất thật?', () => { show = !show; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.galton = function (el) {
    const f = VZ.frame(el, 'Bảng Galton: mỗi chốt là một lần tung đồng xu', { icon: 'atom' });
    const rows = 9; let bins = Array(rows + 1).fill(0), balls = [], rate = 3, tot = 0; const box = h('div', { style: { position: 'relative', height: 'min(86vw, 360px)' } }); f.stage.append(box);
    const lp = VZ.canvasLoop(box, (c, w, hh) => {
      c.clearRect(0, 0, w, hh); const gap = Math.min(w / (rows + 3), hh / (rows + 8)), cx = w / 2, top = gap;
      c.fillStyle = 'rgba(128,128,128,.7)'; for (let r = 0; r < rows; r++) for (let j = 0; j <= r; j++) { c.beginPath(); c.arc(cx + (j - r / 2) * gap, top + (r + 1) * gap, 3, 0, 7); c.fill(); }
      if (Math.random() < rate / 6 && balls.length < 60) balls.push({ r: 0, j: 0, t: 0, x: cx, y: top, hue: R(0, 360) });
      const by = top + (rows + 1) * gap, mx = Math.max(8, ...bins);
      balls = balls.filter((b) => { b.t += 0.09; if (b.t >= 1) { b.t = 0; if (b.r === rows) { bins[b.j]++; tot++; return false; } if (Math.random() < 0.5) b.j++; b.r++; } const x0 = cx + (b.j - b.r / 2) * gap; c.fillStyle = `hsl(${b.hue} 80% 58%)`; c.beginPath(); c.arc(x0, top + (b.r + b.t) * gap - gap * 0.35, gap * 0.22, 0, 7); c.fill(); return true; });
      bins.forEach((v, i) => { const x = cx + (i - rows / 2) * gap; const bh = (v / mx) * (hh - by - 18); c.fillStyle = 'rgba(255,122,168,.85)'; c.fillRect(x - gap * 0.4, hh - 16 - bh, gap * 0.8, bh); c.fillStyle = 'rgba(128,128,128,.9)'; c.font = '10px sans-serif'; c.textAlign = 'center'; c.fillText(v, x, hh - 4); });
      if (tot % 10 === 0) f.out.innerHTML = `${tot} viên bi. Mỗi viên đi qua ${rows} chốt, mỗi chốt 50% trái – 50% phải. Rất ít viên rơi vào hai bên mép (cần ${rows} lần liền cùng một phía), còn ở giữa thì nhiều nhất — hình “quả chuông” hiện ra!`;
    });
    lp.cv.style.width = '100%'; lp.cv.style.height = '100%';
    f.ctrls.append(VZ.range('Tốc độ thả', 0, 6, rate, 1, (v) => { rate = v; }), VZ.btn('Làm lại', () => { bins = Array(rows + 1).fill(0); tot = 0; SFX.play('tap'); }, 'btn sm ghost'));
  };
  APP.viz.birthday = function (el) {
    const f = VZ.frame(el, 'Nghịch lí ngày sinh: cần bao nhiêu người?', { icon: 'spark' });
    let n = 23, sample = null, sim = null; const box = h('div'); f.stage.append(box);
    const P = (m) => { let q = 1; for (let i = 0; i < m; i++) q *= (365 - i) / 365; return 1 - q; };
    function draw() {
      const p = P(n); let g = `<div style="text-align:center;font-size:1.2rem;margin:4px 0 8px">Với <b>${n}</b> người: P(có ít nhất 2 người trùng ngày sinh) ≈ <b style="color:var(--accent);font-size:1.4em">${N(U.round(p * 100, 1))}%</b></div><div style="height:16px;border-radius:8px;background:var(--line);overflow:hidden;margin:0 0 10px"><div style="height:100%;width:${p * 100}%;background:linear-gradient(90deg,var(--stats),var(--accent));transition:width .4s"></div></div>`;
      if (sample) { const cntD = {}; sample.forEach((d) => (cntD[d] = (cntD[d] || 0) + 1)); g += `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">${sample.map((d) => `<span title="ngày ${d + 1}" style="font-size:1.25rem;filter:${cntD[d] > 1 ? 'none' : 'grayscale(1) opacity(.45)'}">${cntD[d] > 1 ? '🎂' : '🙂'}</span>`).join('')}</div>`; }
      box.innerHTML = g; const dup = sample && new Set(sample).size < sample.length;
      f.out.innerHTML = (sample ? (dup ? '🎂 Lớp này CÓ người trùng ngày sinh! ' : 'Lớp này không ai trùng. ') : '') + (sim ? `Mô phỏng 1000 lớp: ${sim} lớp có người trùng → ${N(sim / 10)}%. ` : '') + 'Chỉ cần 23 người là khả năng đã hơn 50% — vì có tới 253 cặp người để so sánh!';
    }
    f.ctrls.append(VZ.range('Số người', 2, 70, n, 1, (v) => { n = v; sample = null; sim = null; draw(); }), VZ.btn('Tạo 1 lớp', () => { sample = Array.from({ length: n }, () => R(0, 364)); SFX.play('pop'); draw(); }, 'btn sm sc'), VZ.btn('Mô phỏng 1000 lớp', () => { let c = 0; for (let t = 0; t < 1000; t++) { const S = new Set(); for (let i = 0; i < n; i++) { const d = R(0, 364); if (S.has(d)) { c++; break; } S.add(d); } } sim = c; SFX.play('whoosh'); draw(); }));
    draw();
  };
  APP.viz.piDigits = function (el) {
    const f = VZ.frame(el, 'Các chữ số của π có xuất hiện đều nhau không?', { icon: 'chart' });
    const PI = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491';
    let m = 250; const W = 360, H = 190, svg = VZ.svg(W, H); const strip = h('div', { class: 'mono', style: { fontSize: '.8rem', wordBreak: 'break-all', maxHeight: '64px', overflow: 'auto', color: 'var(--ink-2)', margin: '4px 0' } }); f.stage.append(svg, strip);
    function draw() {
      const ds = PI.slice(0, m), c = Array(10).fill(0); [...ds].forEach((d) => c[+d]++); svg.innerHTML = ''; const L = 30, B = 26, bw = (W - L - 10) / 10, mx = Math.max(...c, m / 10) * 1.15; const Y = (v) => H - B - (v / mx) * (H - B - 10);
      c.forEach((v, i) => svg.append(s('rect', { x: L + i * bw + 3, y: Y(v), width: bw - 6, height: H - B - Y(v), rx: 4, fill: COLS[i % 6], style: 'transition:all .3s' }), s('text', { x: L + i * bw + bw / 2, y: H - 9, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink)', text: i }), s('text', { x: L + i * bw + bw / 2, y: Y(v) - 4, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: v })));
      svg.append(s('line', { x1: L, y1: Y(m / 10), x2: W - 8, y2: Y(m / 10), stroke: 'var(--ink)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }));
      strip.textContent = '3.' + ds.slice(1);
      f.out.innerHTML = `${m} chữ số đầu tiên. Nếu mỗi chữ số đồng khả năng, mỗi số xuất hiện khoảng ${N(m / 10)} lần (vạch đứt). Với ít chữ số, chênh lệch khá lớn; nhà toán học đã kiểm tra hàng nghìn tỉ chữ số và thấy mỗi chữ số xuất hiện gần đúng 10%.`;
    }
    f.ctrls.append(VZ.range('Số chữ số', 10, 500, m, 10, (v) => { m = v; draw(); }));
    draw();
  };
  APP.viz.heroChance = function (el) {
    const items = Array.from({ length: 18 }, (_, i) => ({ x: Math.random(), y: Math.random(), v: 0.04 + Math.random() * 0.06, r: Math.random() * 6, s: 0.6 + Math.random() * 0.8, k: i % 3, face: R(1, 6) }));
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#10202a'; c.fillRect(0, 0, w, hh); const u = Math.min(w, hh) * 0.07;
      items.forEach((it) => { it.y += it.v * 0.03; if (it.y > 1.15) { it.y = -0.1; it.x = Math.random(); it.face = R(1, 6); } const x = it.x * w, y = it.y * hh, sz = u * it.s; c.save(); c.translate(x, y); c.rotate(it.r + t * (it.k ? 0.8 : -0.6));
        if (it.k === 2) { c.fillStyle = '#ffd166'; c.beginPath(); c.ellipse(0, 0, sz * 0.6 * Math.abs(Math.cos(t * 2 + it.r)) + 2, sz * 0.6, 0, 0, 7); c.fill(); }
        else { c.fillStyle = it.k ? '#ef476f' : '#f8f9fa'; c.beginPath(); c.roundRect ? c.roundRect(-sz / 2, -sz / 2, sz, sz, sz * 0.18) : c.rect(-sz / 2, -sz / 2, sz, sz); c.fill(); c.fillStyle = it.k ? '#fff' : '#222'; const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[it.face]; P.forEach(([a, b]) => { c.beginPath(); c.arc(a * sz * 0.27, b * sz * 0.27, sz * 0.08, 0, 7); c.fill(); }); }
        c.restore(); });
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(u * 0.9)}px Lexend, sans-serif`; c.fillText('0 ≤ P ≤ 1', w * 0.06, hh * 0.86);
    });
  };

  /* ---------- question helpers ---------- */
  const NC = [2, 5, 8, 5, 9, 8, 5, 3, 8, 5];
  const letterQ = (word, lt, o) => { const L = word.split(''); const k = L.filter((c) => c === lt).length; return pf(`Each letter of the word ${word} is written on a separate card. One card is chosen without looking. What is the probability that the card is ${lt}?`, k, L.length, `${k} of the ${L.length} cards ${k === 1 ? 'is' : 'are'} ${lt}: ${FS(k, L.length)}.`, o); };

  APP.addUnit({
    n: 13, strand: 'stats', title: 'Probability', vi: 'Xác suất',
    blurb: 'Uncertainty and chance exist in many situations in real life. Will it be sunny tomorrow? Will my team win their next match? Will my train be late? You cannot be certain, but you can measure how likely something is. The branch of maths that deals with uncertainty is called probability. In this unit you will learn how to calculate and use probabilities in simple situations.',
    blurbVi: 'Chương này học ngôn ngữ xác suất và thang xác suất 0–1, các kết quả xung khắc và đồng khả năng để tính xác suất lí thuyết, và làm thí nghiệm để tìm xác suất thực nghiệm (tần suất tương đối).',
    words: [['probability', 'xác suất'], ['event', 'biến cố / sự kiện'], ['outcome', 'kết quả'], ['likelihood', 'khả năng xảy ra'], ['certain', 'chắc chắn'], ['impossible', 'không thể'], ['likely', 'có thể xảy ra'], ['unlikely', 'khó xảy ra'], ['even chance', 'khả năng ngang nhau'], ['probability scale', 'thang xác suất'], ['mutually exclusive', 'xung khắc'], ['equally likely', 'đồng khả năng'], ['theoretical probability', 'xác suất lí thuyết'], ['experimental probability', 'xác suất thực nghiệm'], ['relative frequency', 'tần suất tương đối'], ['trial', 'lần thử'], ['experiment', 'thí nghiệm'], ['fair / unbiased', 'cân đối / không thiên lệch'], ['at random', 'ngẫu nhiên'], ['spinner', 'vòng quay'], ['dice', 'xúc xắc']],
    chat: ['Xác suất 0,7 nghĩa là gì?', 'Biến cố xung khắc là gì?', 'Xác suất thực nghiệm khác lí thuyết thế nào?'],
    sections: [
      {
        id: '13.1', t: 'The probability scale', vi: 'Thang xác suất',
        goals: ['use the language associated with probability', 'understand how probabilities range from 0 to 1.'],
        body: [
          ['p', 'Rolling an odd number on a dice or winning a football match are examples of <b>events</b>. Events can have a number of different <b>outcomes</b>: the outcomes that give an odd number on a dice are 1, 3 and 5. You can use words such as <b>certain, likely, unlikely</b> and <b>impossible</b> to describe the likelihood that an event will happen.'],
          ['rule', 'A <b>probability</b> is a number from 0 to 1. An event that is certain has probability 1; an impossible event has probability 0. You can write a probability as a fraction, a decimal or a percentage: an even chance is ½ = 0.5 = 50%.', 'Probability'],
          ['viz', 'probScale'],
          ['ex', { t: 'Worked example 13.1', q: 'The probability that Tigers will win their next match is 45%. The probability that Lions will win their next match is 4/5. a Which team is more likely to win? b Show each probability on a probability scale.', fig: scaleFig([[0.45, 'Tigers'], [0.8, 'Lions']]), steps: ['a: 4/5 = 0.8 = 80%. <b>Lions</b> are more likely to win because 80% > 45%.', 'b: mark the line in tenths: Tigers at 0.45, Lions at 0.8.'] }],
          ['tip', 'A coin has no memory! If you flip a fair coin five times and get heads every time, the probability of heads on the next flip is still 50%.'],
          ['vi', ['Xác suất là một số từ 0 đến 1 (0% đến 100%).', '0: không thể xảy ra; 0,5: khả năng ngang nhau; 1: chắc chắn.', 'Viết được dưới dạng phân số, số thập phân hoặc phần trăm: 4/5 = 0,8 = 80%.', 'Để so sánh, đổi tất cả về cùng một dạng (thường là phần trăm).']],
        ],
        bank: [
          sort('Choose the best word to describe each event.', ['impossible', 'unlikely', 'even chance', 'likely', 'certain'], [['A flipped coin lands showing heads.', 2], ['The day after Monday will be Tuesday.', 4], ['You throw a 7 on an ordinary dice.', 0], ['You have the same birthday as your teacher.', 1], ['You throw a number less than 6 on a dice.', 3]], 'Think about how many outcomes give the event.'),
          order('You throw a dice. Put these events in order of likelihood, least likely first.', ['You throw a number less than 1.', 'You throw the number 3.', 'You throw a number less than 3.', 'You throw an odd number.', 'You throw the number 3 or more.'], 'Probabilities: 0, 1/6, 2/6, 3/6, 4/6.'),
          mcq('City has a 5/8 chance of winning, Rovers 60% and United 0.7. Which team is most likely to win?', ['United (70%)', 'City (62.5%)', 'Rovers (60%)'], 0, '5/8 = 62.5%, 0.7 = 70%.', { fixed: true }),
          mcq('City 5/8, Rovers 60%, United 0.7. Which team is least likely to win?', ['Rovers (60%)', 'City (62.5%)', 'United (70%)'], 0, '60% < 62.5% < 70%.', { fixed: true }),
          fill('The probability of rain tomorrow is 25%. The probability of sunny weather is 60%. Write both probabilities as fractions in their simplest form.', [{ opts: ['1/4', '1/25', '25/10', '2/5'], a: 0 }, { opts: ['3/5', '6/100', '3/50', '2/3'], a: 0 }], '25% = 25/100 = 1/4; 60% = 60/100 = 3/5.', { f: 'Rain: [] &nbsp; Sunny: []' }),
          mcq('Lions’ probability of winning is 4/5. Write this as a percentage.', ['80%', '45%', '4.5%', '20%'], 0, '4/5 = 0.8 = 80%.'),
          mcq('Sogand flips a fair coin five times and gets heads every time. Which statement is correct?', ['The probability that the next flip is heads is 50%.', 'The probability that the next flip is heads is more than 50%.', 'The probability that the next flip is heads is less than 50%.'], 0, 'Each flip is independent — the coin does not remember the earlier flips.', { fixed: true, d: 2 }),
          multi('Which of these could NOT be probabilities?', ['1.2', '−0.3', '0.99', '3/2', '0', '100%'], [0, 1, 3], 'A probability must be from 0 to 1 (0% to 100%).', { fixed: true }),
          mcq('Which event has a probability of about 0.05?', ['The train will be very late (rarely happens)', 'A coin lands on heads', 'The Sun will rise tomorrow', 'A dice shows an even number'], 0, '0.05 = 5% — very unlikely.'),
          fill('Write each probability in the other two forms.', [0.3, { opts: ['3/10', '1/3', '30/10', '3/100'], a: 0 }, 0.8, 80], '30% = 0.3 = 3/10; 4/5 = 0.8 = 80%.', { f: '30% = [] (decimal) = [] (fraction) &nbsp; 4/5 = [] (decimal) = []%' }),
          mcq('A weather forecast says: “The probability of rain tomorrow is 80%.” How do you think this was worked out?', ['From past weather records and computer models of similar conditions', 'By guessing', 'Because it rained today', 'Because there are only two outcomes: rain or no rain'], 0, 'Forecasters use data from many similar days and many computer simulations.'),
          gen(() => { const a = pick([[1, 4], [2, 5], [3, 8], [7, 10], [3, 4], [1, 5], [5, 8], [9, 20]]), pc = R(10, 90), dc = R(5, 95) / 100; const v = [a[0] / a[1], pc / 100, dc]; if (new Set(v).size < 3) return null; const best = v.indexOf(Math.max(...v)); return mcq(`Three events have probabilities ${a[0]}/${a[1]}, ${pc}% and ${N(dc)}. Which is most likely?`, [`${a[0]}/${a[1]}`, `${pc}%`, `${N(dc)}`], best, `As percentages: ${N(U.round(v[0] * 100, 1))}%, ${pc}%, ${N(U.round(dc * 100, 1))}%.`, { fixed: true }); }),
          gen(() => { const [n, d] = pick([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [1, 8], [3, 8]]); return num(`Write the probability ${n}/${d} as a percentage.`, U.round((n / d) * 100, 1), `${n} ÷ ${d} = ${N(n / d)} = ${N(U.round((n / d) * 100, 1))}%.`, { unit: '%' }); }),
        ],
      },
      {
        id: '13.2', t: 'Mutually exclusive outcomes', vi: 'Kết quả xung khắc',
        goals: ['learn how to identify mutually exclusive outcomes', 'use equally likely outcomes to find theoretical probabilities.'],
        body: [
          ['p', 'When two outcomes cannot happen at the same time they are <b>mutually exclusive</b>: if you get a 1 when you throw a dice, you cannot also get a 3. When you roll a fair dice, the numbers 1 to 6 are <b>equally likely</b> outcomes. When outcomes are equally likely you can calculate <b>theoretical probabilities</b> without doing an experiment.'],
          ['rule', 'Probability of an event = (number of outcomes in the event) ÷ (total number of equally likely outcomes). The probabilities of all the mutually exclusive outcomes add up to 1.', 'Theoretical probability'],
          ['ex', { t: 'Worked example 13.2', q: 'Here are 10 number cards, placed face down. One card is taken without looking. What is the probability that the number is: a 3 b 5 c 8 d 1 e odd f not 2?', fig: cardsFig(NC), steps: ['a: one card has 3 → <b>1/10</b> = 10%.', 'b: four cards have 5 → 4/10 = <b>2/5</b> = 40%.', 'c: three cards have 8 → <b>3/10</b> = 30%.', 'd: no card has 1 → <b>0</b> (impossible).', 'e: six cards are odd → 6/10 = <b>3/5</b> = 60%.', 'f: nine cards are not 2 → <b>9/10</b> = 90%.', 'Check: 10% + 10% + 40% + 30% + 10% = 100% = 1 for the outcomes 2, 3, 5, 8, 9.'] }],
          ['viz', 'cardDraw'],
          ['viz', 'exclusiveVenn'],
          ['viz', 'hundredGrid'],
          ['vi', ['Xung khắc: hai kết quả không thể cùng xảy ra (gieo được 1 thì không thể được 3).', 'Đồng khả năng: mỗi kết quả có cùng cơ hội (xúc xắc cân đối, rút thẻ không nhìn).', 'P(biến cố) = số kết quả thuận lợi ÷ tổng số kết quả.', 'Tổng xác suất của tất cả các kết quả xung khắc bằng 1. Vì vậy P(không A) = 1 − P(A).', 'Thắng/hoà/thua là 3 kết quả nhưng KHÔNG đồng khả năng, nên P(thắng) không nhất thiết bằng 1/3.']],
        ],
        bank: [
          mcq('Chen throws a fair coin. Which statement is true?', ['The outcomes heads and tails are mutually exclusive and equally likely', 'The outcomes are mutually exclusive but not equally likely', 'The outcomes are equally likely but not mutually exclusive', 'There are three possible outcomes'], 0, 'A coin cannot show both, and each side has a 50% chance.'),
          mcq('The probability of rain tomorrow is 20% and of strong winds is 30%. Why are rain and strong winds NOT mutually exclusive?', ['They can both happen on the same day', 'They have different probabilities', 'Their probabilities do not add up to 1', 'Rain is less likely'], 0, 'Mutually exclusive outcomes cannot happen at the same time.'),
          fill('Balsem throws an unbiased dice. Work out the probability that she throws:', [{ opts: ['1/6', '1/4', '5/6', '1/3'], a: 0 }, { opts: ['1/2', '1/3', '1/6', '2/3'], a: 0 }, { opts: ['2/3', '1/2', '1/3', '3/4'], a: 0 }, 0], 'Number 4: 1/6. Odd: 3/6 = 1/2. 3 or more: 4/6 = 2/3. More than 6: impossible, 0.', { f: 'the number 4: [] &nbsp; an odd number: [] &nbsp; 3 or more: [] &nbsp; a number more than 6: []' }),
          letterQ('MATHEMATICS', 'H'), letterQ('MATHEMATICS', 'A'), letterQ('MATHEMATICS', 'M'),
          pf('MATHEMATICS cards: what is the probability that the card is B?', 0, 11, 'There is no B — impossible.'),
          pf('MATHEMATICS cards: what is the probability that the card is a letter in the word SCIENCE?', 4, 11, 'E, I, C and S are in SCIENCE: 4 cards out of 11.', { d: 2 }),
          fill('The letters of BANANA are printed on cards. One card is chosen without looking. Find the probability of each letter.', [{ opts: ['1/6', '1/3', '1/2', '2/3'], a: 0 }, { opts: ['1/2', '1/3', '1/6', '3/5'], a: 0 }, { opts: ['1/3', '1/2', '1/6', '2/5'], a: 0 }], 'B: 1/6, A: 3/6 = 1/2, N: 2/6 = 1/3. They add up to 1 because the outcomes are mutually exclusive and one must happen.', { f: 'B: [] &nbsp; A: [] &nbsp; N: []', fig: cardsFig('BANANA'.split('')) }),
          fill('The names of six boys and four girls are put in a bag. One of the boys is Blake and one of the girls is Crystal. One name is chosen.', [{ opts: ['1/10', '1/6', '6/10', '1/4'], a: 0 }, { opts: ['3/5', '2/5', '6/4', '1/6'], a: 0 }, { opts: ['2/5', '3/5', '4/6', '1/4'], a: 0 }, { opts: ['9/10', '1/10', '3/4', '1'], a: 0 }, { opts: ['1', '1/2', '0', '9/10'], a: 0 }], 'Blake 1/10; boy 6/10; girl 4/10; not Crystal 9/10; a boy or a girl: certain.', { f: 'Blake: [] &nbsp; a boy: [] &nbsp; a girl: [] &nbsp; not Crystal: [] &nbsp; a boy or a girl: []', d: 2 }),
          mcq('Six boys and four girls: why is the chosen name 50% more likely to be a boy’s than a girl’s?', ['6 is 50% more than 4 (0.6 is 1.5 times 0.4)', 'Because 60% − 40% = 20%', 'Because there are 10 names', 'Because boys are 50% of the names'], 0, '6 ÷ 4 = 1.5, which is 50% more.', { d: 3 }),
          mcq('Marcus says: “My football team can win, draw or lose. Winning is one of these three outcomes, so the probability that my team wins is 1/3.” What is wrong?', ['The three outcomes are not equally likely', 'There are more than three outcomes', 'The probabilities do not add up to 1', 'Nothing is wrong'], 0, 'You can only divide by the number of outcomes when they are equally likely.', { d: 2 }),
          fill('An unbiased dice with 20 faces has the numbers 1 to 20. Work out the probability of throwing:', [{ opts: ['1/20', '1/10', '3/20', '1/3'], a: 0 }, { opts: ['3/10', '1/3', '1/6', '1/4'], a: 0 }, { opts: ['1/2', '1/3', '2/5', '11/20'], a: 0 }, { opts: ['7/20', '1/4', '3/10', '2/5'], a: 0 }], '3: 1/20. Multiples of 3: 3, 6, 9, 12, 15, 18 → 6/20 = 3/10. Odd: 10/20 = 1/2. Factors of 30: 1, 2, 3, 5, 6, 10, 15 → 7/20.', { f: 'the number 3: [] &nbsp; a multiple of 3: [] &nbsp; an odd number: [] &nbsp; a factor of 30: []', d: 2 }),
          pf('A 20-sided dice (1 to 20) is thrown. What is the probability of a number more than 6?', 7, 10, '7, 8, …, 20 is 14 numbers: 14/20 = 7/10.'),
          fill('Eight cards show 2, 3, 5, 7, 11, 13, 17, 19. One is chosen without looking. Work out the probability that it is:', [{ opts: ['7/8', '1/2', '1', '3/4'], a: 0 }, { opts: ['1', '7/8', '0', '1/2'], a: 0 }, { opts: ['1/4', '1/8', '3/8', '1/2'], a: 0 }], 'Odd: all except 2 → 7/8. Prime: all of them → 1. Factor of 100: 2 and 5 → 2/8 = 1/4.', { f: 'an odd number: [] &nbsp; a prime number: [] &nbsp; a factor of 100: []', fig: cardsFig([2, 3, 5, 7, 11, 13, 17, 19]), d: 2 }),
          mcq('For the cards 2, 3, 5, 7, 11, 13, 17, 19: P(5) = 1/8, P(5 or less) = 3/8, P(5 or more) = 6/8. Zara says these must add up to 1. Why is she incorrect?', ['The outcomes are not mutually exclusive — 5 is counted in all three', 'One of the probabilities is wrong', 'Probabilities never add up to 1', 'There are not enough cards'], 0, '1/8 + 3/8 + 6/8 = 10/8. Only mutually exclusive outcomes that cover everything add up to 1.', { d: 3 }),
          fill('A computer produces a two-digit random number from 00 to 99. Work out the probability that:', [{ opts: ['1/100', '1/10', '1/50', '2/100'], a: 0 }, { opts: ['9/50', '1/5', '1/10', '19/100'], a: 0 }, { opts: ['81/100', '9/10', '4/5', '72/100'], a: 0 }], 'Both 6: only 66 → 1/100. Exactly one 6: 06, 16, …, 96 and 60–69 except 66 → 18/100 = 9/50. Neither: 9 × 9 = 81 → 81/100.', { f: 'both digits are 6: [] &nbsp; exactly one digit is 6: [] &nbsp; neither digit is 6: []', d: 3 }),
          fill('Here is a spinner with 12 equal sections. Work out the probability of each colour.', [{ opts: ['5/12', '1/2', '1/5', '5/7'], a: 0 }, { opts: ['1/3', '1/4', '4/8', '1/12'], a: 0 }, { opts: ['1/6', '1/2', '2/10', '1/12'], a: 0 }, { opts: ['1/12', '1/11', '1/6', '0'], a: 0 }], 'Red 5/12, blue 4/12 = 1/3, green 2/12 = 1/6, yellow 1/12. Sum: 5 + 4 + 2 + 1 = 12 twelfths = 1.', { f: 'red: [] &nbsp; blue: [] &nbsp; green: [] &nbsp; yellow: []', fig: spinFig([...Array(5).fill(COLS[0]), ...Array(4).fill(COLS[1]), ...Array(2).fill(COLS[2]), COLS[3]]) }),
          letterQ('ARITHMETIC', 'A'), letterQ('ARITHMETIC', 'I'),
          pf('ARITHMETIC cards: what is the probability that the letter is in the word SUBTRACT?', 1, 2, 'A, R, T, T, C are in SUBTRACT: 5 of 10 = 1/2.', { d: 2 }),
          multi('You throw a dice. Which pairs of outcomes are mutually exclusive?', ['throw a 6 / throw less than 5', 'throw an even number / throw a 6', 'throw an odd number / throw an even number', 'throw less than 5 / throw an even number'], [0, 2], 'Mutually exclusive outcomes share no numbers.', { fixed: true }),
          gen(() => { const n = pick([6, 8, 10, 12, 20]); const evs = [['an even number', (x) => x % 2 === 0], ['an odd number', (x) => x % 2 === 1], ['a multiple of 3', (x) => x % 3 === 0], ['a prime number', U.isPrime], ['a square number', (x) => [1, 4, 9, 16].includes(x)], ['more than 4', (x) => x > 4], ['a factor of 12', (x) => 12 % x === 0]]; const [nm, pr] = pick(evs); const all = Array.from({ length: n }, (_, i) => i + 1); const fav = all.filter(pr); return pf(`A fair ${n}-sided dice has the numbers 1 to ${n}. What is the probability of throwing ${nm}?`, fav.length, n, `${nm[0].toUpperCase() + nm.slice(1)}: ${fav.join(', ') || 'none'} → ${fav.length}/${n} = ${FS(fav.length, n)}.`); }),
          gen(() => { const w = pick(['PROBABILITY', 'STATISTICS', 'GEOMETRY', 'ALGEBRA', 'PERCENTAGE', 'CAMBRIDGE', 'MISSISSIPPI', 'COMMITTEE']); const lt = pick(w.split('')); return letterQ(w, lt); }),
          gen(() => { const r = R(1, 6), b = R(1, 6), g = R(0, 5); const T = r + b + g; const c = pick([['red', r], ['blue', b], ['not red', T - r]]); return pf(`A bag has ${r} red, ${b} blue and ${g} green counters. One counter is taken without looking. What is the probability that it is ${c[0]}?`, c[1], T, `${c[1]} out of ${T} counters: ${FS(c[1], T)}.`); }),
          gen(() => { const [n, d] = pick([[1, 4], [2, 5], [3, 10], [7, 20], [5, 8], [1, 6], [4, 9]]); return pf(`The probability that an event happens is ${n}/${d}. What is the probability that it does NOT happen?`, d - n, d, `1 − ${n}/${d} = ${d - n}/${d}.`); }),
        ],
      },
      {
        id: '13.3', t: 'Experimental probabilities', vi: 'Xác suất thực nghiệm',
        goals: ['use experiments to calculate experimental probabilities.'],
        body: [
          ['p', 'When outcomes are not equally likely, you can use an <b>experiment</b> to estimate probabilities. If you drop a drawing pin, it can land point up or point down — you cannot assume these are equally likely. Each drop is a <b>trial</b>.'],
          ['rule', 'Relative frequency = (frequency of the outcome) ÷ (total number of trials). The relative frequency gives an <b>experimental probability</b>. A large number of trials gives a more reliable answer than a small number.', 'Experimental probability'],
          ['ex', { t: 'Worked example 13.3', q: '124 drawing pins are dropped. 48 land point up and 76 land point down. Find the experimental probability of a drawing pin landing a point up b point down.', steps: ['a: 48 ÷ 124 = 0.39 (2 d.p.) → <b>39%</b>.', 'b: 76 ÷ 124 = 0.61 (2 d.p.) → <b>61%</b>. You can also find 100% − 39% = 61%.'] }],
          ['viz', 'pinExperiment'],
          ['viz', 'spinnerSim'],
          ['vi', ['Khi các kết quả không đồng khả năng, làm thí nghiệm nhiều lần để ước lượng xác suất.', 'Tần suất tương đối = số lần xảy ra ÷ tổng số lần thử.', 'Mỗi lần làm thí nghiệm, kết quả có thể khác nhau một chút.', 'Số lần thử càng lớn → ước lượng càng đáng tin cậy.', 'Dữ liệu quá khứ (thời tiết, đi muộn…) cũng dùng để ước lượng xác suất.']],
        ],
        bank: [
          num('A survey of 400 cars finds that 140 were travelling faster than 60 km/h. Find the experimental probability that the next car will be travelling faster than 60 km/h (as a decimal).', 0.35, '140 ÷ 400 = 0.35.', { dp: 2 }),
          num('400 cars: 140 faster than 60 km/h. What is the experimental probability that the next car travels at 60 km/h or less (as a decimal)?', 0.65, '260 ÷ 400 = 0.65, or 1 − 0.35.', { dp: 2 }),
          fill('There are 320 students in a school. 16 travel by car and 96 walk. Find the experimental probability (as a decimal) that a particular student:', [0.05, 0.3, 0.7, 0.65], '16 ÷ 320 = 0.05; 96 ÷ 320 = 0.3; 1 − 0.3 = 0.7; (320 − 16 − 96) ÷ 320 = 208 ÷ 320 = 0.65.', { f: 'travels by car: [] &nbsp; walks: [] &nbsp; does not walk: [] &nbsp; does not walk or travel by car: []', d: 2 }),
          fill('Mrs Patel stopped at a set of traffic lights on 32 of the past 50 working days.', [0.64, 0.36], '32 ÷ 50 = 0.64; 1 − 0.64 = 0.36.', { f: 'P(stop tomorrow) = [] &nbsp; P(not stop next Wednesday) = []', app: true }),
          fill('Jasmine goes to school five days a week. In the past eight weeks she has been late on three days. Give your answers as percentages.', [7.5, 92.5], '8 × 5 = 40 days. 3 ÷ 40 = 7.5%; 37 ÷ 40 = 92.5%.', { f: 'late: []% &nbsp; on time: []%', d: 2 }),
          fill('In the past five Novembers (150 days) there has been rain on 36 days. Estimate, as percentages, the probability that:', [24, 76], '36 ÷ 150 = 0.24 = 24%; 100% − 24% = 76%.', { f: 'it will rain on 1 November next year: []% &nbsp; it will not rain on 30 November: []%', app: true }),
          mcq('Arun says: “My team has won 15 of our past 20 matches. The probability we will win our next match is 75%.” Why is this not a good estimate?', ['20 matches is a small sample, and the next opponent may be stronger or weaker', 'He should divide 20 by 15', 'Winning is not an outcome', 'The probability must be 50%'], 0, '15 ÷ 20 = 75%, but conditions change from match to match and 20 trials is not many.', { d: 2 }),
          fill('A survey of 240 college students: 232 have a mobile phone, 167 have a computer in their bedroom, 68 are members of a sports team. Give percentages to the nearest whole number.', [97, 70, 72], '232 ÷ 240 ≈ 96.7%; 167 ÷ 240 ≈ 69.6%; (240 − 68) ÷ 240 = 172 ÷ 240 ≈ 71.7%.', { f: 'has a mobile phone: []% &nbsp; has a computer: []% &nbsp; is NOT in a sports team: []%', d: 2 }),
          mcq('92 of the 240 students want to be in a band and 68 are in a sports team. Why is (92 + 68)/240 NOT a good estimate of the probability that a student wants to be in a band or is in a sports team?', ['The outcomes are not mutually exclusive — some students may do both', '92 + 68 is not 240', 'The survey is too small', 'The answer is more than 1'], 0, 'Students who are in both groups would be counted twice.', { d: 3 }),
          fill('Varun flips a coin 40 times: 24 heads and 16 tails. Find the relative frequency of each outcome.', [0.6, 0.4], '24 ÷ 40 = 0.6; 16 ÷ 40 = 0.4.', { f: 'heads: [] &nbsp; tails: []' }),
          mcq('Toby says Varun (24 heads, 16 tails) is not flipping the coin fairly because the probabilities should be 0.5. Is Toby correct?', ['Not necessarily — with only 40 flips the results can easily differ from 0.5', 'Yes — the results must be exactly 20 and 20', 'Yes — the coin must be biased', 'No — the probability of heads is 0.6'], 0, 'Experimental results vary; you need many more trials to judge.', { d: 2 }),
          fill('A bag contains one white ball, one black ball and three red balls. Find the theoretical probability of each colour.', [{ opts: ['1/5', '1/3', '3/5', '1/2'], a: 0 }, { opts: ['1/5', '1/3', '2/5', '1/2'], a: 0 }, { opts: ['3/5', '1/3', '3/4', '2/5'], a: 0 }], '5 balls: white 1/5, black 1/5, red 3/5.', { f: 'white: [] &nbsp; black: [] &nbsp; red: []' }),
          fill('Daniella takes a ball and replaces it, 50 times: white 6, black 8, red 36. Find the experimental probabilities (decimals).', [0.12, 0.16, 0.72], '6 ÷ 50, 8 ÷ 50, 36 ÷ 50.', { f: 'white: [] &nbsp; black: [] &nbsp; red: []' }),
          num('Daniella knows there is 1 white, 1 black and an odd number of red balls. Her experiment gave P(red) ≈ 0.72. What is the most likely number of red balls?', 5, '3 red → 3/5 = 0.6; 5 red → 5/7 ≈ 0.71; 7 red → 7/9 ≈ 0.78. 0.72 is closest to 5/7.', { d: 3 }),
          mcq('Seeds are sown in two soils. Soil A: 83 of 120 grow. Soil B: 62 of 75 grow. Which soil has the better success rate?', ['Soil B (≈ 83%)', 'Soil A (≈ 69%)', 'They are the same', 'Soil A, because more seeds grew'], 0, '83 ÷ 120 ≈ 0.69; 62 ÷ 75 ≈ 0.83. Compare rates, not totals.', { d: 2, app: true }),
          fill('A spinner is spun 200 times by a computer: green 18, pink 54, blue 128. Then another 300 times: green 36, pink 66, blue 198. Find the experimental probabilities based on all 500 trials (decimals).', [0.108, 0.24, 0.652], 'Green 54, pink 120, blue 326 out of 500.', { f: 'green: [] &nbsp; pink: [] &nbsp; blue: []', d: 3 }),
          num('In a table of 200 random digits, 25 of the digits are 0. What is the experimental probability that a digit is 0 (decimal)?', 0.125, '25 ÷ 200 = 0.125 (theoretical: 0.1).'),
          mcq('Why does a large number of trials give a better estimate of a probability?', ['Random variations even out over many trials', 'Each trial becomes more accurate', 'The theoretical probability changes', 'It does not make any difference'], 0, 'With more trials the relative frequency settles down.'),
          gen(() => { const n = pick([50, 80, 100, 120, 200, 250, 400, 500]), k = R(Math.round(n * 0.1), Math.round(n * 0.9)); return num(`An experiment is repeated ${n} times. The outcome happens ${k} times. Find the experimental probability as a decimal (2 d.p.).`, U.round(k / n, 2), `${k} ÷ ${n} = ${N(k / n)} ≈ ${N(U.round(k / n, 2))}.`, { tol: 0.006 }); }),
          gen(() => { const n = pick([40, 50, 60, 80, 100]), k = R(Math.round(n * 0.2), Math.round(n * 0.8)); const ev = pick(['the bus was late', 'it rained', 'the shop was busy', 'the toast landed butter side down']); return num(`Over ${n} days, ${ev} on ${k} days. Estimate the probability as a percentage.`, U.round((k / n) * 100, 1), `${k} ÷ ${n} × 100 = ${N(U.round((k / n) * 100, 1))}%.`, { unit: '%', app: true }); }, { app: true }),
          gen(() => { const p = pick([0.2, 0.25, 0.3, 0.4, 0.45, 0.6, 0.65]), n = pick([100, 200, 300, 500, 1000]); return num(`The experimental probability that a drawing pin lands point up is ${p}. Estimate how many of ${n} pins will land point up.`, p * n, `${p} × ${n} = ${N(p * n)}.`, { app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Chance, surprises and the shape of luck', hero: 'heroChance',
      lead: 'Probability helps scientists forecast the weather, doctors test new medicines and engineers design safe bridges. It also produces some results that surprise almost everyone!',
      leadVi: 'Xác suất giúp dự báo thời tiết, thử nghiệm thuốc mới, thiết kế cầu an toàn — và tạo ra những kết quả khiến hầu như ai cũng bất ngờ!',
      cards: [
        { t: 'The birthday surprise', p: 'How many people must be in a room for there to be a better-than-even chance that two share a birthday? Most people guess about 180. The real answer is only 23! Try it below.', viz: 'birthday' },
        { t: 'The bean machine', p: 'In 1876 Francis Galton built a board where balls bounce left or right off pins. Each bounce is like flipping a coin, yet together the balls always pile up in a bell shape. This pattern, the normal distribution, appears in heights, test scores and measurement errors.', viz: 'galton' },
        { t: 'Are the digits of π random?', p: 'The digits of π go on forever without repeating. Nobody has proved that every digit is equally likely, but computers have checked trillions of digits and each digit appears very close to 10% of the time.', viz: 'piDigits' },
        { t: 'Law of large numbers', p: 'A small experiment can be misleading. As the number of trials grows, the relative frequency settles down close to the true probability. This is why casinos always win in the long run.', viz: 'pinExperiment' },
      ],
      facts: [['23', 'people', '> 50% chance two share a birthday.'], ['1/36', 'double six', 'when you throw two dice.'], ['≈ 1 in 14 million', 'lottery', 'Choosing 6 numbers from 49.'], ['80%', 'rain forecast', '8 of 10 similar computer forecasts gave rain.']],
      challenge: { t: 'Two dice totals', p: 'Throw two fair dice and add the scores. Which total is most likely? What is its probability? Which totals are least likely?', a: 'There are 36 equally likely pairs. Total 7 can be made in 6 ways (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), so P(7) = 6/36 = 1/6 — the most likely. Totals 2 and 12 can each be made in only one way: probability 1/36.' },
    },
    reading: {
      title: 'What Does “80% Chance of Rain” Mean?', sub: 'How weather forecasters use probability. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Every evening, millions of people check the weather forecast. Many forecasts now give a number, such as “80% chance of rain”. But what does this number really mean, and where does it come from?',
        'Modern forecasts are made by powerful computers. The computer starts with measurements of the atmosphere — temperature, pressure, wind and humidity — collected by weather stations, balloons and satellites. It then uses the laws of physics to calculate how the weather will change over the next hours and days.',
        'The problem is that our measurements are never perfect. A tiny error at the start can grow into a big difference a few days later. So instead of running the computer model once, forecasters run it many times, perhaps 50 times, each with slightly different starting values. This set of forecasts is called an ensemble.',
        'If 40 of the 50 forecasts show rain in your town tomorrow, the forecasters say there is a 40 ÷ 50 = 80% chance of rain. This is like an experimental probability: the computer has done 50 trials. An 80% chance does not mean that it will rain for 80% of the day, or over 80% of the town.',
        'Forecasters check how good their probabilities are. Over a long time, on all the days when they said “80%”, it should have rained on about 8 out of every 10 of those days. If it did, the forecasts are well calibrated. Even then, a 20% chance of staying dry is not zero — so sometimes you will carry your umbrella for nothing!',
      ],
      gloss: [['atmosphere', 'khí quyển'], ['humidity', 'độ ẩm'], ['satellite', 'vệ tinh'], ['ensemble', 'tập hợp dự báo'], ['calibrated', 'được hiệu chỉnh chính xác'], ['umbrella', 'cái ô']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why do forecasters run the computer model many times?', opts: ['Because the starting measurements are never perfect', 'Because computers often break', 'To make the forecast longer', 'To use more electricity'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'What is an ensemble?', opts: ['a set of forecasts with slightly different starting values', 'a type of weather balloon', 'a law of physics', 'a group of weather stations'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: '“80% chance of rain” means…', opts: ['on days like this, it rains about 8 times out of 10', 'it will rain for 80% of the day', 'it will rain over 80% of the town', 'it will definitely rain'], a: 0, ex: 'Paragraphs D and E.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'A small error at the start can grow into a big difference later.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'Weather forecasts were first given as probabilities in 1965.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'The text gives no date.' },
          { type: 'mcq', q: 'A 20% chance of staying dry means it will certainly rain.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: '“a 20% chance of staying dry is not zero”.' },
        ] },
        { title: 'Numbers in the text', qs: [
          { type: 'fill', q: 'Complete.', f: 'If [] of the 50 forecasts show rain, the chance of rain is 80%. If only 10 of 50 forecasts show rain, the chance is []%.', a: [40, 20], ex: '40 ÷ 50 = 80%; 10 ÷ 50 = 20%.' },
          { type: 'order', q: 'Put the steps of making a forecast in order.', a: ['Collect measurements from stations, balloons and satellites', 'Run the computer model many times with slightly different starting values', 'Count how many forecasts show rain', 'Give the chance of rain as a percentage'], ex: 'Paragraphs B–D.' },
        ] },
      ],
    },
    listening: {
      title: 'Is this dice fair?', intro: 'Kofi and Anna test a dice for a board game. Listen and answer.',
      voices: { Kofi: 'rounded', Anna: 'glassy' },
      lines: [
        { spk: 'Kofi', text: 'Anna, I think this dice is not fair. I keep getting sixes!' },
        { spk: 'Anna', text: 'Let’s do an experiment. If the dice is fair, the probability of a six is one sixth, so in sixty throws we should get about ten sixes.' },
        { spk: 'Kofi', text: 'OK, I’ve thrown it sixty times. I got twenty-one sixes.' },
        { spk: 'Anna', text: 'That’s a relative frequency of twenty-one out of sixty, which is zero point three five. That’s much more than one sixth, which is about zero point one seven.' },
        { spk: 'Kofi', text: 'So the dice is definitely biased?' },
        { spk: 'Anna', text: 'Not definitely. Sixty throws is not very many. Let’s throw it three hundred times to get a more reliable result.' },
        { spk: 'Kofi', text: 'Three hundred throws later… ninety-six sixes. That’s about thirty-two percent.' },
        { spk: 'Anna', text: 'Now I’m more confident. The dice is probably biased. We should use a different one for the game.' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'First experiment: [] throws, [] sixes. Expected number of sixes for a fair dice: about []. Second experiment: 300 throws, [] sixes.', a: [60, 21, 10, 96], ex: '60 ÷ 6 = 10.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why does Anna want to throw the dice 300 times?', opts: ['to get a more reliable result', 'because 60 is an odd number', 'to make the game longer', 'because Kofi made a mistake'], a: 0, ex: '“Sixty throws is not very many.”' },
          { type: 'mcq', q: 'What do they decide at the end?', opts: ['The dice is probably biased, so they will use a different one', 'The dice is fair', 'They need 1000 more throws', 'Sixes are impossible'], a: 0, ex: 'Last line.' },
          { type: 'num', q: 'What is the relative frequency of a six in the first experiment (as a decimal)?', a: 0.35, ex: '21 ÷ 60 = 0.35.' },
        ] },
      ],
    },
  });
})();
