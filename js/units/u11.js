/* Unit 11 — Graphs */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, expr, coord, gen } = Q;
  const sg = (v) => U.N(v);
  const lineName = (ax, v) => [`${ax}=${v}`, `${ax} = ${v}`, `${ax}=${String(v).replace('-', '−')}`, `${ax} = ${String(v).replace('-', '−')}`];
  const fnTxt = (m, c) => (m === 0 ? sg(c) : (m === 1 ? 'x' : m === -1 ? '−x' : sg(m) + 'x') + (c > 0 ? ' + ' + c : c < 0 ? ' − ' + -c : ''));

  /* real-life graph (static SVG string) */
  function rlGraph(o) {
    const W = o.W || 380, H = o.H || 250, L = 52, B = 44, T = 14, Rr = 16; const xmax = o.xmax, ymax = o.ymax;
    const X = (x) => L + (x / xmax) * (W - L - Rr), Y = (y) => H - B - (y / ymax) * (H - B - T);
    let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px">`;
    for (let x = 0; x <= xmax + 1e-9; x += o.xstep) g += `<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${Y(ymax)}" stroke="var(--line)"/><text x="${X(x)}" y="${H - B + 16}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${sg(U.round(x, 4))}</text>`;
    for (let y = 0; y <= ymax + 1e-9; y += o.ystep) g += `<line x1="${X(0)}" y1="${Y(y)}" x2="${X(xmax)}" y2="${Y(y)}" stroke="var(--line)"/><text x="${L - 6}" y="${Y(y) + 4}" text-anchor="end" font-size="11" fill="var(--ink-2)">${sg(U.round(y, 4))}</text>`;
    g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(xmax)}" y2="${Y(0)}" stroke="var(--ink)" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(ymax)}" stroke="var(--ink)" stroke-width="2"/>`;
    g += `<text x="${(L + W - Rr) / 2}" y="${H - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">${o.xlab}</text><text x="14" y="${(T + H - B) / 2}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)" transform="rotate(-90 14 ${(T + H - B) / 2})">${o.ylab}</text>`;
    (o.series || []).forEach((se) => { const pts = se.pts || Array.from({ length: 61 }, (_, i) => { const x = (se.x0 ?? 0) + (((se.x1 ?? xmax) - (se.x0 ?? 0)) * i) / 60; return [x, se.f(x)]; }); g += `<polyline points="${pts.map(([x, y]) => X(x).toFixed(1) + ',' + Y(y).toFixed(1)).join(' ')}" fill="none" stroke="${se.color || 'var(--accent)'}" stroke-width="3" stroke-linejoin="round"/>`; });
    return g + '</svg>';
  }
  const SCEN = {
    phone: { t: '📞 Phone call', xlab: 'Time (min)', ylab: 'Cost ($)', xmax: 10, ymax: 4, xstep: 1, ystep: 0.5, f: (t) => 0.4 * t, rate: '$0.40 per minute', fn: 'c = 0.4t', unitY: '$' },
    walk: { t: '🚶 Walking', xlab: 'Time (min)', ylab: 'Distance (m)', xmax: 10, ymax: 800, xstep: 1, ystep: 100, f: (t) => 80 * t, rate: '80 m per minute', fn: 'd = 80t', unitY: 'm' },
    taxi: { t: '🚕 Taxi', xlab: 'Time (min)', ylab: 'Cost ($)', xmax: 40, ymax: 20, xstep: 5, ystep: 5, f: (t) => 4 + 0.4 * t, rate: '$4 initial charge + $0.40 per minute', fn: 'c = 4 + 0.4t', unitY: '$' },
    candle: { t: '🕯️ Candle', xlab: 'Time (min)', ylab: 'Length (cm)', xmax: 50, ymax: 10, xstep: 10, ystep: 2, f: (t) => 10 - 0.2 * t, rate: 'decreases by 0.2 cm per minute', fn: 'L = 10 − 0.2t', unitY: 'cm' },
    petrol: { t: '⛽ Petrol', xlab: 'Time (h)', ylab: 'Petrol (L)', xmax: 5, ymax: 30, xstep: 1, ystep: 5, f: (t) => 30 - 6 * t, rate: 'uses 6 litres per hour', fn: 'P = 30 − 6t', unitY: 'L' },
  };

  /* ---------- widgets ---------- */
  APP.viz.funcStory = function (el) {
    const f = VZ.frame(el, 'Từ câu chuyện đến hàm số — mỗi cặp số là một điểm', { icon: 'robot' });
    const st = { ages: ['👧 Maryam hơn Jamal 6 tuổi', 'j', 'm', (x) => x + 6, 'm = j + 6', 0, 12, 1], twice: ['👦 Angelo gấp đôi tuổi Sabrina', 's', 'a', (x) => 2 * x, 'a = 2s', 0, 12, 1], money: ['💱 HK$1 = ₹9', 'd', 'r', (x) => 9 * x, 'r = 9d', 0, 10, 1], tri: ['🔺 Chu vi tam giác đều', 's', 'p', (x) => 3 * x, 'p = 3s', 0, 10, 1], book: ['📚 Sách đắt hơn sổ $10', 'x', 'y', (x) => x + 10, 'y = x + 10', 0, 15, 1] };
    let key = 'ages', x = 2, trail = []; const W = 360, H = 260, svg = VZ.svg(W, H); const info = h('div', { style: { fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', margin: '6px 0' } }); f.stage.append(info, svg);
    function draw() {
      const [lab, xi, yi, fn, rule, x0, x1] = st[key]; const ymax = Math.max(...Array.from({ length: x1 + 1 }, (_, i) => fn(i))); const L = 40, B = 30; const X = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - 12), Y = (v) => H - B - (v / ymax) * (H - B - 12);
      svg.innerHTML = ''; for (let i = x0; i <= x1; i++) svg.append(s('line', { x1: X(i), y1: Y(0), x2: X(i), y2: Y(ymax), stroke: 'var(--line)' }), s('text', { x: X(i), y: H - 12, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: i }));
      const ys = ymax > 60 ? 20 : ymax > 30 ? 10 : 5; for (let v = 0; v <= ymax; v += ys) svg.append(s('line', { x1: L, y1: Y(v), x2: W - 12, y2: Y(v), stroke: 'var(--line)' }), s('text', { x: L - 5, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: v }));
      svg.append(s('line', { x1: L, y1: Y(0), x2: W - 12, y2: Y(0), stroke: 'var(--ink)', 'stroke-width': 2 }), s('line', { x1: L, y1: Y(0), x2: L, y2: 8, stroke: 'var(--ink)', 'stroke-width': 2 }), s('text', { x: W - 14, y: Y(0) - 6, 'text-anchor': 'end', 'font-weight': 800, 'font-size': 13, fill: 'var(--ink)', text: xi }), s('text', { x: L + 8, y: 18, 'font-weight': 800, 'font-size': 13, fill: 'var(--ink)', text: yi }));
      if (trail.length > 2) svg.append(s('line', { x1: X(x0), y1: Y(fn(x0)), x2: X(x1), y2: Y(fn(x1)), stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0.7 }));
      trail.forEach((v) => svg.append(s('circle', { cx: X(v), cy: Y(fn(v)), r: 5, fill: 'var(--sc)' })));
      svg.append(s('circle', { cx: X(x), cy: Y(fn(x)), r: 9, fill: 'var(--accent)', stroke: '#fff', 'stroke-width': 3 }));
      info.innerHTML = `${lab}: ${xi} = ${x} → ${yi} = <span style="color:var(--accent)">${fn(x)}</span>`;
      f.out.innerHTML = `Hàm số: <b>${rule}</b>. Điểm (${x}, ${fn(x)}). ${trail.length > 2 ? 'Các điểm nằm trên một đường thẳng!' : 'Di chuyển thanh trượt để thêm điểm.'}`;
    }
    f.ctrls.append(h('select', { class: 'sel', 'aria-label': 'Tình huống', onchange: (e) => { key = e.target.value; trail = []; x = 2; draw(); } }, Object.keys(st).map((k) => h('option', { value: k }, st[k][0]))), VZ.range('Đầu vào', 0, 15, x, 1, (v) => { const x1 = st[key][6]; x = Math.min(v, x1); if (!trail.includes(x)) { trail.push(x); SFX.play('tick'); } draw(); }));
    draw();
  };
  APP.viz.linePlotter = function (el) {
    const f = VZ.frame(el, 'Vẽ đồ thị y = x + c và y = mx', { icon: 'chart' });
    let kind = 'c', c = 3, m = 2, fam = false, pt = null, shown = 7; const lo = -6, hi = 6, cs = 26, pad = 20; const W = (hi - lo) * cs + 2 * pad; const svg = VZ.svg(W, W); const tbl = h('div', { style: { overflowX: 'auto' } }); f.stage.append(tbl, svg);
    const X = (x) => pad + (x - lo) * cs, Y = (y) => pad + (hi - y) * cs; const fn = (x) => (kind === 'c' ? x + c : m * x);
    function draw() {
      const xs = [-3, -2, -1, 0, 1, 2, 3]; tbl.innerHTML = `<table class="tbl" style="min-width:max-content;margin:0 auto"><tr><th>x</th>${xs.map((x) => `<td>${sg(x)}</td>`).join('')}</tr><tr><th>y</th>${xs.map((x, i) => `<td style="font-weight:800;color:var(--accent)">${i < shown ? sg(fn(x)) : '?'}</td>`).join('')}</tr></table>`;
      svg.innerHTML = ''; for (let i = lo; i <= hi; i++) { svg.append(s('line', { x1: X(i), y1: Y(lo), x2: X(i), y2: Y(hi), stroke: 'var(--line)', 'stroke-width': i ? 0.7 : 2, ...(i ? {} : { stroke: 'var(--ink-2)' }) }), s('line', { x1: X(lo), y1: Y(i), x2: X(hi), y2: Y(i), stroke: i ? 'var(--line)' : 'var(--ink-2)', 'stroke-width': i ? 0.7 : 2 })); if (i && i % 2 === 0) svg.append(s('text', { x: X(i), y: Y(0) + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: sg(i) }), s('text', { x: X(0) - 5, y: Y(i) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: sg(i) })); }
      const seg = (g, col, w, op) => { const xa = lo, xb = hi; svg.append(s('line', { x1: X(xa), y1: Y(g(xa)), x2: X(xb), y2: Y(g(xb)), stroke: col, 'stroke-width': w, opacity: op })); };
      const clip = s('clipPath', { id: 'lpclip' }); clip.append(s('rect', { x: X(lo), y: Y(hi), width: (hi - lo) * cs, height: (hi - lo) * cs })); svg.append(clip); const gL = s('g', { 'clip-path': 'url(#lpclip)' }); svg.append(gL);
      const segG = (g, col, w, op) => gL.append(s('line', { x1: X(lo), y1: Y(g(lo)), x2: X(hi), y2: Y(g(hi)), stroke: col, 'stroke-width': w, opacity: op })); void seg;
      if (fam) (kind === 'c' ? [-4, -2, 0, 2, 4] : [0.5, 1, 3, -1]).forEach((v) => segG((x) => (kind === 'c' ? x + v : v * x), 'var(--ink-3)', 1.5, 0.6));
      if (shown >= 7) segG(fn, 'var(--accent)', 3.5, 1);
      [-3, -2, -1, 0, 1, 2, 3].slice(0, shown).forEach((x, i) => { const y = fn(x); if (y >= lo && y <= hi) svg.append(s('circle', { cx: X(x), cy: Y(y), r: 5.5, fill: 'var(--sc)', stroke: '#fff', 'stroke-width': 2, style: `animation:popIn .3s ${i * 0.05}s both` })); });
      if (pt) { const yl = fn(pt[0]); const rel = Math.abs(pt[1] - yl) < 1e-9 ? 'nằm TRÊN đường thẳng (on the line)' : pt[1] > yl ? 'ở PHÍA TRÊN đường thẳng (above)' : 'ở PHÍA DƯỚI đường thẳng (below)'; svg.append(s('circle', { cx: X(pt[0]), cy: Y(pt[1]), r: 7, fill: 'var(--bad)' }), s('text', { x: X(pt[0]) + 9, y: Y(pt[1]) - 8, 'font-size': 12, 'font-weight': 800, fill: 'var(--bad)', text: `(${sg(pt[0])}, ${sg(pt[1])})` })); f.out.innerHTML = `Điểm (${sg(pt[0])}, ${sg(pt[1])}): khi x = ${sg(pt[0])} thì y = ${kind === 'c' ? sg(pt[0]) + ' + ' + c : m + ' × ' + sg(pt[0])} = ${sg(yl)} → điểm ${rel}.`; }
      else f.out.innerHTML = `Đường <b>y = ${kind === 'c' ? fnTxt(1, c) : fnTxt(m, 0)}</b>. ${kind === 'c' ? 'Mọi đường y = x + c song song với nhau; c là điểm cắt trục y.' : 'Mọi đường y = mx đi qua gốc toạ độ (0, 0); m càng lớn đường càng dốc.'} Chạm vào lưới để kiểm tra một điểm.`;
    }
    svg.addEventListener('click', (e) => { const p = VZ.pt(svg, e); const x = Math.round(((p.x - pad) / cs + lo) * 2) / 2, y = Math.round((hi - (p.y - pad) / cs) * 2) / 2; if (x < lo || x > hi || y < lo || y > hi) return; pt = [x, y]; SFX.play('pop'); draw(); });
    const plot = () => { pt = null; shown = 0; const step = () => { shown++; SFX.play('tick'); draw(); if (shown < 7) setTimeout(step, 220); else SFX.play('whoosh'); }; step(); };
    f.ctrls.append(VZ.seg([['c', 'y = x + c'], ['m', 'y = mx']], kind, (v) => { kind = v; pt = null; draw(); }), VZ.range('c', -5, 5, c, 1, (v) => { c = v; kind = 'c'; draw(); }), VZ.range('m', -2, 3, m, 0.5, (v) => { m = v; kind = 'm'; draw(); }), VZ.btn('Vẽ từng điểm ▶', plot, 'btn sm sc'), VZ.btn('Họ đường thẳng', () => { fam = !fam; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.axisLines = function (el) {
    const f = VZ.frame(el, 'Đường thẳng song song với trục: x = a và y = b', { icon: 'grid' });
    let a1 = 4, a2 = -2, b1 = 2, b2 = -3; const lo = -6, hi = 6, cs = 26, pad = 20; const W = (hi - lo) * cs + 2 * pad; const svg = VZ.svg(W, W); f.stage.append(svg);
    const X = (x) => pad + (x - lo) * cs, Y = (y) => pad + (hi - y) * cs;
    function draw() {
      svg.innerHTML = ''; for (let i = lo; i <= hi; i++) { svg.append(s('line', { x1: X(i), y1: Y(lo), x2: X(i), y2: Y(hi), stroke: i ? 'var(--line)' : 'var(--ink-2)', 'stroke-width': i ? 0.7 : 2 }), s('line', { x1: X(lo), y1: Y(i), x2: X(hi), y2: Y(i), stroke: i ? 'var(--line)' : 'var(--ink-2)', 'stroke-width': i ? 0.7 : 2 })); if (i && i % 2 === 0) svg.append(s('text', { x: X(i), y: Y(0) + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: sg(i) }), s('text', { x: X(0) - 5, y: Y(i) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: sg(i) })); }
      const xl = Math.min(a1, a2), xr = Math.max(a1, a2), yb = Math.min(b1, b2), yt = Math.max(b1, b2);
      svg.append(s('rect', { x: X(xl), y: Y(yt), width: (xr - xl) * cs, height: (yt - yb) * cs, fill: 'color-mix(in srgb, var(--sc) 18%, transparent)' }));
      [[a1, 'var(--number)'], [a2, 'var(--algebra)']].forEach(([a, col]) => svg.append(s('line', { x1: X(a), y1: Y(lo), x2: X(a), y2: Y(hi), stroke: col, 'stroke-width': 3 }), s('text', { x: X(a) + 4, y: Y(hi) + 14, 'font-size': 13, 'font-weight': 800, fill: col, text: 'x = ' + sg(a) })));
      [[b1, 'var(--stats)'], [b2, 'var(--geometry)']].forEach(([b, col]) => svg.append(s('line', { x1: X(lo), y1: Y(b), x2: X(hi), y2: Y(b), stroke: col, 'stroke-width': 3 }), s('text', { x: X(lo) + 4, y: Y(b) - 5, 'font-size': 13, 'font-weight': 800, fill: col, text: 'y = ' + sg(b) })));
      [[xl, yb], [xl, yt], [xr, yb], [xr, yt]].forEach(([x, y]) => svg.append(s('circle', { cx: X(x), cy: Y(y), r: 5, fill: 'var(--accent)' })));
      f.out.innerHTML = `Các đỉnh: (${sg(xl)}, ${sg(yt)}), (${sg(xr)}, ${sg(yt)}), (${sg(xr)}, ${sg(yb)}), (${sg(xl)}, ${sg(yb)}) · Kích thước ${xr - xl} × ${yt - yb} → diện tích = <b>${(xr - xl) * (yt - yb)}</b> đơn vị vuông. Trên đường x = a mọi điểm có hoành độ a; trục y là x = 0, trục x là y = 0.`;
    }
    f.ctrls.append(VZ.range('x = a₁', -6, 6, a1, 0.5, (v) => { a1 = v; draw(); }), VZ.range('x = a₂', -6, 6, a2, 0.5, (v) => { a2 = v; draw(); }), VZ.range('y = b₁', -6, 6, b1, 0.5, (v) => { b1 = v; draw(); }), VZ.range('y = b₂', -6, 6, b2, 0.5, (v) => { b2 = v; draw(); }));
    draw();
  };
  APP.viz.graphReader = function (el) {
    const f = VZ.frame(el, 'Đọc đồ thị thực tế & tốc độ thay đổi', { icon: 'eye' });
    let key = 'phone', t = 4; const box = h('div'); f.stage.append(box);
    function draw() {
      const S = SCEN[key]; const W = 400, H = 260, L = 52, B = 44, T = 14, Rr = 16; const X = (x) => L + (x / S.xmax) * (W - L - Rr), Y = (y) => H - B - (y / S.ymax) * (H - B - T); t = Math.min(t, S.xmax);
      let g = rlGraph({ ...S, W, H, series: [{ f: S.f, x1: key === 'candle' ? 50 : key === 'petrol' ? 5 : S.xmax }] }).replace('</svg>', '');
      const y = U.round(S.f(t), 4); g += `<line x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(y)}" stroke="var(--bad)" stroke-width="2" stroke-dasharray="5 4"/><line x1="${X(0)}" y1="${Y(y)}" x2="${X(t)}" y2="${Y(y)}" stroke="var(--bad)" stroke-width="2" stroke-dasharray="5 4"/><circle cx="${X(t)}" cy="${Y(y)}" r="7" fill="var(--bad)"/></svg>`;
      box.innerHTML = g; const grad = S.f(1) > S.f(0) ? 'dương (positive) — đồ thị đi lên' : 'âm (negative) — đồ thị đi xuống';
      f.out.innerHTML = `${S.t}: tại ${sg(t)} → <b>${sg(y)} ${S.unitY}</b>. Tốc độ: ${S.rate}. Hàm số: <b>${S.fn}</b>. Hệ số góc (gradient) ${grad}.`;
    }
    f.ctrls.append(VZ.seg(Object.keys(SCEN).map((k) => [k, SCEN[k].t]), key, (v) => { key = v; t = SCEN[v].xmax / 2; SFX.play('select'); draw(); }), VZ.range('Thời gian', 0, 50, t, 0.5, (v) => { t = v; draw(); }));
    draw();
  };
  APP.viz.vaseFill = function (el) {
    const f = VZ.frame(el, 'Đổ nước đều vào bình — đồ thị độ sâu theo thời gian', { icon: 'play' });
    const shapes = { cyl: ['Hình trụ', (u) => 1], cone: ['Miệng rộng', (u) => 0.35 + 0.75 * u], inv: ['Đáy rộng', (u) => 1.1 - 0.75 * u], bottle: ['Chai', (u) => (u < 0.6 ? 1 : u < 0.75 ? 1 - ((u - 0.6) / 0.15) * 0.65 : 0.35)], flask: ['Bình cầu', (u) => 0.25 + Math.sin(Math.PI * Math.min(u, 0.999)) * 0.85] };
    let key = 'cone', anim = null; const W = 560, H = 240; const svg = VZ.svg(W, H); f.stage.append(svg);
    const VH = 180, cx = 100, base = 215, scR = 70;
    function table(rf) { const n = 200, V = [0]; for (let i = 1; i <= n; i++) { const u = (i - 0.5) / n; V.push(V[i - 1] + rf(u) ** 2 / n); } return V; }
    function depthAt(V, frac) { const tgt = frac * V[V.length - 1]; let i = 0; while (i < V.length - 1 && V[i + 1] < tgt) i++; const a = V[i], b = V[i + 1] ?? a; return (i + (b > a ? (tgt - a) / (b - a) : 0)) / (V.length - 1); }
    function draw(frac, path) {
      const rf = shapes[key][1]; svg.innerHTML = ''; const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([u, rf(u)]); }
      const d = depthAt(table(rf), frac); const wpts = pts.filter(([u]) => u <= d).concat([[d, rf(d)]]);
      const poly = (arr) => [...arr.map(([u, r]) => [cx + r * scR, base - u * VH]), ...arr.slice().reverse().map(([u, r]) => [cx - r * scR, base - u * VH])].map((p) => p.join(',')).join(' ');
      svg.append(s('polygon', { points: poly(wpts), fill: 'color-mix(in srgb, #3ba7ff 65%, transparent)' }), s('polyline', { points: pts.map(([u, r]) => `${cx + r * scR},${base - u * VH}`).join(' '), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }), s('polyline', { points: pts.map(([u, r]) => `${cx - r * scR},${base - u * VH}`).join(' '), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }), s('line', { x1: cx - rf(0) * scR, y1: base, x2: cx + rf(0) * scR, y2: base, stroke: 'var(--ink)', 'stroke-width': 3 }));
      if (frac > 0 && frac < 1) svg.append(s('line', { x1: cx, y1: 6, x2: cx, y2: base - d * VH, stroke: '#3ba7ff', 'stroke-width': 4, opacity: 0.8 }));
      const gx = 250, gw = 290, gy = 20, gh = 195; svg.append(s('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: 'var(--ink)', 'stroke-width': 2 }), s('line', { x1: gx, y1: gy, x2: gx, y2: gy + gh, stroke: 'var(--ink)', 'stroke-width': 2 }), s('text', { x: gx + gw, y: gy + gh + 16, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink-2)', text: 'time' }), s('text', { x: gx + 6, y: gy + 10, 'font-size': 12, 'font-weight': 700, fill: 'var(--ink-2)', text: 'depth' }));
      if (path.length > 1) svg.append(s('polyline', { points: path.map(([t, dd]) => `${gx + t * gw},${gy + gh - dd * gh}`).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3.5 }));
    }
    function run() { if (anim) anim(); const path = [[0, 0]]; const rf = shapes[key][1]; const V = table(rf); SFX.play('whoosh'); anim = VZ.animate(3600, (_, k) => { path.push([k, depthAt(V, k)]); draw(k, path); }, () => { SFX.play('complete'); f.out.innerHTML = { cyl: 'Hình trụ: mặt cắt không đổi → độ sâu tăng ĐỀU → đồ thị là <b>đường thẳng</b>.', cone: 'Miệng rộng dần: lúc đầu nước dâng nhanh, sau đó chậm dần → đồ thị cong, dốc dần ít đi.', inv: 'Đáy rộng, miệng hẹp: lúc đầu dâng chậm, càng lên càng nhanh → đồ thị càng lúc càng dốc.', bottle: 'Chai: phần thân dâng đều (thẳng), phần cổ hẹp dâng rất nhanh (dốc hơn).', flask: 'Bình cầu: nhanh – chậm – nhanh, vì bình phình ra ở giữa.' }[key]; }); }
    f.ctrls.append(VZ.seg(Object.keys(shapes).map((k) => [k, shapes[k][0]]), key, (v) => { key = v; if (anim) anim(); draw(0, []); f.out.textContent = 'Bấm “Đổ nước”.'; }), VZ.btn('Đổ nước 💧', run, 'btn sm sc'));
    draw(0, []); f.out.textContent = 'Chọn hình bình rồi bấm “Đổ nước”. Đoán trước hình dạng đồ thị!';
  };
  APP.viz.boltRun = function (el) {
    const f = VZ.frame(el, 'Kỉ lục 100 m của Usain Bolt (9,58 s, Berlin 2009)', { icon: 'rocket' });
    const sp = [[0, 0], [1.89, 10], [2.88, 20], [3.78, 30], [4.64, 40], [5.47, 50], [6.29, 60], [7.1, 70], [7.92, 80], [8.75, 90], [9.58, 100]];
    let t = 6; const box = h('div'); f.stage.append(box);
    const pos = (tt) => { for (let i = 1; i < sp.length; i++) if (tt <= sp[i][0]) { const [t0, d0] = sp[i - 1], [t1, d1] = sp[i]; return [d0 + ((tt - t0) / (t1 - t0)) * (d1 - d0), (d1 - d0) / (t1 - t0)]; } return [100, 10 / (9.58 - 8.75)]; };
    function draw() {
      const [d, v] = pos(t); const W = 400, H = 250, L = 52, B = 44, T = 14, Rr = 16; const X = (x) => L + (x / 10) * (W - L - Rr), Y = (y) => H - B - (y / 100) * (H - B - T);
      let g = rlGraph({ W, H, xmax: 10, ymax: 100, xstep: 1, ystep: 20, xlab: 'Time (s)', ylab: 'Distance (m)', series: [{ pts: sp }] }).replace('</svg>', '');
      g += sp.map(([a, b]) => `<circle cx="${X(a)}" cy="${Y(b)}" r="3.5" fill="var(--sc)"/>`).join('') + `<circle cx="${X(t)}" cy="${Y(d)}" r="8" fill="var(--bad)"/></svg>`;
      const track = `<div style="position:relative;height:34px;border-radius:10px;background:linear-gradient(90deg,#c0392b,#e05a47);margin:6px 0 0"><div style="position:absolute;left:calc(${d}% - 14px);top:2px;font-size:24px;transform:scaleX(-1)">🏃</div>${[25, 50, 75].map((m) => `<div style="position:absolute;left:${m}%;top:0;bottom:0;border-left:2px dashed rgba(255,255,255,.6)"></div>`).join('')}</div>`;
      box.innerHTML = g + track; f.out.innerHTML = `Sau ${N(t)} s: khoảng <b>${N(U.round(d, 1))} m</b>. Tốc độ lúc này ≈ <b>${N(U.round(v, 2))} m/s</b> (≈ ${N(U.round(v * 3.6, 1))} km/h). Đồ thị dốc nhất ở khoảng 60–80 m — khi anh chạy nhanh nhất. Lúc xuất phát đồ thị thoải vì anh đang tăng tốc.`;
    }
    f.ctrls.append(VZ.range('Thời gian (s)', 0, 9.58, t, 0.02, (v) => { t = v; draw(); }), VZ.btn('Chạy ▶', () => { SFX.play('whoosh'); VZ.animate(9580 / 2, (_, k) => { t = k * 9.58; draw(); }, () => SFX.play('complete')); }, 'btn sm sc'));
    draw();
  };
  APP.viz.heroGraphs = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#0c1630'; c.fillRect(0, 0, w, hh); const cx = w * 0.68, cy = hh * 0.55, u = Math.min(w, hh) / 12;
      c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; for (let x = cx % u; x < w; x += u) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, hh); c.stroke(); } for (let y = cy % u; y < hh; y += u) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.moveTo(cx, 0); c.lineTo(cx, hh); c.stroke();
      const cols = ['#ffd166', '#06d6a0', '#ef476f', '#4cc9f0']; [0.5, 1, 2, -1].forEach((m, i) => { const mm = m + Math.sin(t * 0.7 + i) * 0.25; c.strokeStyle = cols[i]; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 8 * u, cy + 8 * u * mm); c.lineTo(cx + 8 * u, cy - 8 * u * mm); c.stroke(); const px = ((t * 1.2 + i * 2) % 10) - 5; c.fillStyle = cols[i]; c.beginPath(); c.arc(cx + px * u, cy - px * u * mm, 6, 0, 7); c.fill(); });
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(u * 0.7)}px Lexend, sans-serif`; c.fillText('y = mx', cx + u * 0.4, cy - u * 4.2);
    });
  };

  /* ---------- question helpers ---------- */
  const tableQ = (m, c, xs, o = {}) => { const f0 = (x) => m * x + c; return fill(o.q || `Complete the table of values for y = ${fnTxt(m, c)}.`, xs.map(f0), xs.map((x) => `x = ${sg(x)}: y = ${sg(f0(x))}`).join('; ') + '.', Object.assign({ f: `<table class="tbl"><tr><th>x</th>${xs.map((x) => `<td>${sg(x)}</td>`).join('')}</tr><tr><th>y</th>${xs.map(() => '<td>[]</td>').join('')}</tr></table>` }, o)); };
  const posQ = (m, c, x, y, o = {}) => { const yl = m * x + c; const k = Math.abs(y - yl) < 1e-9 ? 0 : y > yl ? 1 : 2; return mcq(`Is the point (${sg(x)}, ${sg(y)}) on, above or below the line y = ${fnTxt(m, c)}?`, ['on the line', 'above the line', 'below the line'], k, `When x = ${sg(x)}, y = ${fnTxt(m, c).replace('x', '× ' + sg(x)).replace(/^× /, '')} → ${sg(yl)}. The point has y = ${sg(y)}, so it is ${['on', 'above', 'below'][k]} the line.`, Object.assign({ fixed: true }, o)); };
  const gridFig = (o) => `<div style="max-width:300px;margin:0 auto">${FIG.grid(Object.assign({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, size: 20, every: 2 }, o))}</div>`;

  APP.addUnit({
    n: 11, strand: 'algebra', title: 'Graphs', vi: 'Đồ thị',
    blurb: 'You can use a graph to show the connection between two variables. Graphs show information as images that are easy to understand — how the mass of a baby increases with age, how the cost of a taxi varies with distance, or how much you get when you change one currency to another. In this unit you will look at the simplest type of graph: a straight-line graph.',
    blurbVi: 'Chương này học biểu diễn tình huống bằng hàm số, vẽ đồ thị hàm số y = x + c và y = mx, đường thẳng song song với trục toạ độ, và đọc hiểu đồ thị thực tế (tốc độ thay đổi, hệ số góc dương/âm/bằng 0).',
    words: [['graph', 'đồ thị'], ['variable', 'biến số'], ['function', 'hàm số'], ['axes', 'các trục toạ độ'], ['x-axis', 'trục hoành (trục x)'], ['y-axis', 'trục tung (trục y)'], ['coordinates', 'toạ độ'], ['origin', 'gốc toạ độ'], ['table of values', 'bảng giá trị'], ['straight line', 'đường thẳng'], ['parallel', 'song song'], ['perpendicular', 'vuông góc'], ['equation of a line', 'phương trình đường thẳng'], ['rate', 'tốc độ / tỉ lệ'], ['gradient', 'hệ số góc / độ dốc'], ['positive gradient', 'hệ số góc dương'], ['negative gradient', 'hệ số góc âm'], ['zero gradient', 'hệ số góc bằng 0'], ['steep', 'dốc'], ['exchange rate', 'tỉ giá'], ['initial charge', 'phí ban đầu']],
    chat: ['Đường y = 2x có đi qua (3, 6) không?', 'Đường x = 4 trông như thế nào?', 'Đồ thị dốc hơn nghĩa là gì?'],
    sections: [
      {
        id: '11.1', t: 'Functions', vi: 'Hàm số',
        goals: ['represent situations in words or as linear functions.'],
        body: [
          ['p', 'A <b>function</b> shows the relationship between two <b>variables</b>. Maryam is 6 years older than her brother Jamal. When Jamal is 2, Maryam is 8; when Jamal is 11, Maryam is 17. If Maryam is m years old and Jamal is j years old, then <b>m = j + 6</b>. The function m = j + 6 shows the relationship between the variables m and j.'],
          ['viz', 'funcStory'],
          ['ex', { t: 'Worked example 11.1', q: 'a You can exchange HK$1 for 9 Indian rupees. i How many rupees can you get for HK$20? ii Write a function for d Hong Kong dollars and r Indian rupees. b You can exchange x US dollars for y Indian rupees: y = 70x. Describe this in words.', steps: ['a i: 20 × 9 = <b>180 rupees</b>.', 'a ii: <b>r = 9d</b>.', 'b: you can exchange <b>US$1 for 70 Indian rupees</b>.'] }],
          ['vi', ['Hàm số mô tả mối liên hệ giữa hai biến (thường gọi là x và y).', '“Hơn 6” → + 6; “gấp đôi” → 2 ×; “3/4 của” → 0,75 ×.', 'Tỉ giá: 1 đơn vị tiền A = k đơn vị tiền B → y = kx.', 'Từ một vài cặp số, hãy tìm quy luật rồi viết công thức tổng quát.']],
        ],
        bank: [
          fill('Angelo is twice as old as Sabrina. How old is Angelo when Sabrina is:', [8, 12, 20, 24], '“Twice” means two times.', { f: '4 years old? [] &nbsp; 6? [] &nbsp; 10? [] &nbsp; 12? []' }),
          expr('Sabrina is s years old and Angelo is a years old. Complete the function a = …', ['2s'], 'Angelo is twice as old: a = 2s.', { ph: 'a = …', keys: ['s'] }),
          num('Lilah’s mass is ¾ of the mass of Abdul. If Abdul’s mass is 40 kg, what is Lilah’s mass?', 30, '¾ × 40 = 30.', { unit: 'kg' }),
          mcq('Abdul’s mass is x kg and Lilah’s mass is y kg, where Lilah’s mass is ¾ of Abdul’s. Which function is correct?', ['y = 0.75x', 'x = 0.75y', 'y = x + 0.75', 'y = 4x ÷ 3'], 0, '¾ = 0.75, so y = 0.75x.'),
          fill('A book costs $10 more than a diary. How much is the book if the diary costs:', [16, 20, 23, 18.5, 24.95], 'Add $10 each time.', { f: '$6 → $[] &nbsp; $10 → $[] &nbsp; $13 → $[] &nbsp; $8.50 → $[] &nbsp; $14.95 → $[]' }),
          expr('The diary costs $x and the book costs $y (the book costs $10 more). Write y = …', ['x+10'], 'y = x + 10.', { keys: ['x', '+'] }),
          fill('Each side of an equilateral triangle is s cm and the perimeter is p cm.', [15, 60], 'The perimeter is 3 times the side.', { f: 'Side 5 cm → perimeter [] cm &nbsp; Side 20 cm → perimeter [] cm' }),
          expr('Write a function for the perimeter p of an equilateral triangle with side s: p = …', ['3s'], 'Three equal sides: p = 3s.', { keys: ['s'] }),
          mcq('The length of a rectangle is 3 cm more than its width. Which function connects the length l and the width w?', ['l = w + 3', 'l = 3w', 'w = l + 3', 'l = w − 3'], 0, 'Length is 3 more than width.'),
          mcq('The length of a rectangle is three times its width w. Which function gives the perimeter P?', ['P = 8w', 'P = 6w', 'P = 4w', 'P = 3w + 2'], 0, 'Length 3w: P = 3w + w + 3w + w = 8w.', { d: 2 }),
          num('A litre of petrol costs US$1.50. What is the cost of 10 litres?', 15, '10 × 1.5 = 15.', { pre: 'US$', app: true }),
          num('You can exchange €10 for 210 pesos. How many pesos do you get for €1?', 21, '210 ÷ 10 = 21. Function: y = 21x.', { app: true }),
          fill('The relationship between US dollars (x) and Libyan dinars (y) is y = 1.5x.', [855, 380], 'Multiply by 1.5 to change dollars to dinars; divide by 1.5 to change dinars to dollars.', { f: 'US$570 = [] dinars &nbsp; 570 dinars = US$[]', d: 2, app: true }),
          gen(() => { const k = R(2, 9), d = R(3, 30); return num(`Tom is ${k} years older than his sister. When his sister is ${d}, how old is Tom?`, d + k, `${d} + ${k} = ${d + k}. Function: t = s + ${k}.`); }),
          gen(() => { const k = pick([4, 5, 8, 12, 18, 21, 25, 70]); const nm = pick([['euros', 'pesos'], ['pounds', 'baht'], ['dollars', 'yuan'], ['francs', 'zloty']]); const a = R(2, 20); return num(`You can exchange 1 ${nm[0].slice(0, -1)} for ${k} ${nm[1]}. A function is y = ${k}x. How many ${nm[1]} do you get for ${a} ${nm[0]}?`, a * k, `y = ${k} × ${a} = ${a * k}.`, { app: true }); }, { app: true }),
          gen(() => { const k = pick([2, 3, 4, 5]); const x = R(2, 12); return expr(`A box of pens has ${k} times as many pens as a box of pencils. A box of pencils has x pencils. Write an expression for the number of pens, y.`, [`${k}x`], `${k} times x = ${k}x.`, { keys: ['x'] }); }),
        ],
      },
      {
        id: '11.2', t: 'Graphs of functions', vi: 'Đồ thị của hàm số',
        goals: ['plot graphs of linear functions.'],
        body: [
          ['p', 'Here is the function y = x + 3. When x = 2, y = 2 + 3 = 5. When x = −4, y = −4 + 3 = −1. You can show the values in a <b>table of values</b> and use them as <b>coordinates</b> to plot the points (−4, −1), (−3, 0), (−2, 1), … The points are in a straight line: this is the graph of y = x + 3.'],
          ['table', ['x', '−4', '−3', '−2', '−1', '0', '1', '2', '3', '4'], [['y', '−1', '0', '1', '2', '3', '4', '5', '6', '7']]],
          ['viz', 'linePlotter'],
          ['ex', { t: 'Worked example 11.2', q: 'For y = 0.5x: a complete the table for x = −6, −3, 0, 3, 6; b draw the graph; c show that (−24, −12) is on the line, but (15, 30) is not.', fig: gridFig({ fns: [{ f: (x) => 0.5 * x }], points: [{ x: -6, y: -3 }, { x: -3, y: -1.5 }, { x: 0, y: 0 }, { x: 3, y: 1.5 }, { x: 6, y: 3 }] }), steps: ['a: y is half of x: −3, −1.5, 0, 1.5, 3.', 'b: plot the points and join them with a straight line (the line continues forever).', 'c: when x = −24, y = 0.5 × −24 = −12 ✓. When x = 15, y = 7.5, so (15, 30) is <b>above</b> the line.'] }],
          ['ex', { t: 'Worked example 11.3', q: 'You can exchange 5 Turkish lira for 90 Japanese yen. a How many yen for 1 lira? b Write a function. c Draw the graph.', fig: rlGraph({ xmax: 6, ymax: 100, xstep: 1, ystep: 20, xlab: 'Turkish lira', ylab: 'Japanese yen', series: [{ f: (x) => 18 * x, x1: 5.5 }], W: 320, H: 220 }), steps: ['a: 90 ÷ 5 = <b>18 yen</b>.', 'b: <b>y = 18x</b>.', 'c: a straight line through (0, 0) and (5, 90). There is a different scale on each axis.'] }],
          ['tip', 'Lines y = x + c are all parallel; c tells you where the line crosses the y-axis. Lines y = mx all pass through (0, 0); the bigger m is, the steeper the line.'],
          ['vi', ['Lập bảng giá trị: chọn vài giá trị x, tính y.', 'Vẽ các điểm (x, y) rồi nối thành đường thẳng.', 'Kiểm tra một điểm có thuộc đường thẳng: thay x vào, so sánh y. Lớn hơn → điểm ở trên; nhỏ hơn → ở dưới.', 'Đồ thị đổi tiền tệ y = kx là đường thẳng qua gốc toạ độ.']],
        ],
        bank: [
          tableQ(1, 1, [-3, -2, -1, 0, 1, 2, 3]), tableQ(1, -2, [-4, -2, 0, 2, 4]), tableQ(1, 8, [-3, -2, -1, 0, 1, 2, 3, 4]), tableQ(2, 0, [-3, -2, -1, 0, 1, 2, 3]), tableQ(5, 0, [-2, -1, 0, 1, 2, 3, 4]),
          posQ(1, 1, -20, -19), posQ(1, 1, 20, 19), posQ(1, -2, 25, 23),
          fill('The points (20, ?) and (−20, ?) are on the line y = x + 8.', [28, -12], '20 + 8 = 28; −20 + 8 = −12.', { f: '(20, []) &nbsp; (−20, [])' }),
          fill('Complete the coordinates of these points on the line y = 2x.', [9, -10, 17, -16], 'Double the x-coordinate.', { f: '(4.5, []) &nbsp; (−5, []) &nbsp; (8.5, []) &nbsp; (−8, [])' }),
          posQ(2, 0, 2.5, 8.5), posQ(2, 0, -9, -15), posQ(2, 0, 25, 65), posQ(2, 0, -20, -70),
          fill('A graph converts US dollars (x) to Hong Kong dollars (y). US$5 = HK$40.', [8, 400], 'HK$40 ÷ 5 = HK$8 for each US$1, so y = 8x.', { f: 'US$1 = HK$[] &nbsp; US$50 = HK$[]', app: true }),
          mcq('What do all lines of the form y = x + c have in common?', ['They are parallel', 'They all pass through (0, 0)', 'They all cross at (1, 1)', 'They are all horizontal'], 0, 'They have the same steepness; c moves the line up or down.'),
          mcq('When m is a positive number, what does the line y = mx look like?', ['A straight line through the origin, sloping upwards; steeper for bigger m', 'A horizontal line', 'A line that never passes through the origin', 'A curve'], 0, 'When x = 0, y = 0. Bigger m → steeper.'),
          mcq('Sangeeta is 30 years younger than her mother. Sangeeta is y years old and her mother is x years old. Which function is correct?', ['y = x − 30', 'y = x + 30', 'x = y − 30', 'y = 30x'], 0, 'Sangeeta’s age is her mother’s age minus 30.'),
          coord('Where do the lines y = 2x and y = x + 1 cross?', [1, 2], 'When x = 1: 2x = 2 and x + 1 = 2. So they cross at (1, 2).', { d: 3 }),
          expr('You can exchange 10 Swiss francs for 40 Polish zloty. Write a function for z zloty and s francs: z = …', ['4s'], '40 ÷ 10 = 4 zloty per franc.', { keys: ['s'], app: true }),
          gen(() => { const m = pick([1, 1, 2, 3, 0.5, 4]); const c = m === 1 ? R(-6, 6) : 0; return tableQ(m, c, [-2, -1, 0, 1, 2, 3]); }),
          gen(() => { const m = pick([1, 2, 3, 0.5, 5]); const c = m === 1 ? R(-5, 6) : 0; const x = R(-12, 15); const d = pick([0, 0, 1, -1, 2, -3, 5]); return posQ(m, c, x, m * x + c + d); }),
          gen(() => { const m = pick([1, 2, 3, 4]); const c = m === 1 ? R(-9, 9) : 0; const x = R(-30, 40); return num(`The point (${sg(x)}, ?) is on the line y = ${fnTxt(m, c)}. What is the missing y-coordinate?`, m * x + c, `Substitute x = ${sg(x)}: y = ${sg(m * x + c)}.`); }),
          gen(() => { const k = pick([3, 4, 6, 8, 12, 15, 18]); const a = pick([5, 10, 2, 4]); return expr(`You can exchange ${a} units of currency A for ${a * k} units of currency B. Write a function for y units of B and x units of A: y = …`, [`${k}x`], `${a * k} ÷ ${a} = ${k} per unit, so y = ${k}x.`, { keys: ['x'], app: true }); }, { app: true }),
        ],
      },
      {
        id: '11.3', t: 'Lines parallel to the axes', vi: 'Đường thẳng song song với trục toạ độ',
        goals: ['learn how to recognise lines parallel to the x-axis or y-axis.'],
        body: [
          ['p', 'A rectangle has vertices A(4, 2), B(4, −3), C(−2, −3) and D(−2, 2). A and B are on a line parallel to the y-axis through 4 on the x-axis: its name is <b>x = 4</b>. C and D are on <b>x = −2</b>. A and D are on a line parallel to the x-axis through 2 on the y-axis: <b>y = 2</b>. B and C are on <b>y = −3</b>.'],
          ['html', gridFig({ polys: [{ pts: [[4, 2], [4, -3], [-2, -3], [-2, 2]] }], points: [{ x: 4, y: 2, label: 'A' }, { x: 4, y: -3, label: 'B' }, { x: -2, y: -3, label: 'C' }, { x: -2, y: 2, label: 'D' }] })],
          ['viz', 'axisLines'],
          ['ex', { t: 'Worked example 11.4', q: 'a Plot P(2, −5) and Q(−6, −5). b Draw the line through P and Q. c Write two more points on the line. d Name the line.', steps: ['c: e.g. (4, −5), (0, −5) or (−2.5, −5) — any point with y-coordinate −5.', 'd: the name of the line is <b>y = −5</b>.'] }],
          ['tip', 'The x-axis has the name y = 0. The y-axis has the name x = 0. The “name of a line” is also called the <b>equation</b> of the line.'],
          ['vi', ['Đường thẳng đứng (song song trục y): x = a — mọi điểm có hoành độ bằng a.', 'Đường nằm ngang (song song trục x): y = b — mọi điểm có tung độ bằng b.', 'Trục x là y = 0; trục y là x = 0.', 'Bốn đường x = a₁, x = a₂, y = b₁, y = b₂ tạo hình chữ nhật có diện tích |a₁ − a₂| × |b₁ − b₂|.']],
        ],
        bank: [
          txt('A rectangle has vertices A(−1, 3), B(2, 3), C(2, −3) and D(−1, −3). Write down the name of the line through A and B.', lineName('y', 3), 'A and B both have y-coordinate 3.', { ph: 'vd: y = 3' }),
          txt('For the same rectangle, write down the name of the line through A and D.', lineName('x', -1), 'A and D both have x-coordinate −1.', { ph: 'vd: x = −1' }),
          txt('For the same rectangle, write down the equation of the line through C and D.', lineName('y', -3), 'C and D both have y-coordinate −3.'),
          multi('The lines x = 5, x = −4, y = 1 and y = −3 form a rectangle. Which points are its vertices?', ['(5, 1)', '(5, −3)', '(−4, 1)', '(−4, −3)', '(1, 5)', '(−3, −4)'], [0, 1, 2, 3], 'Each vertex is where an x-line meets a y-line.', { fixed: true }),
          num('Draw the lines x = 3, y = 5, x = −3 and y = −1. What is the area of the square inside them?', 36, 'Width 3 − (−3) = 6; height 5 − (−1) = 6; area 36.', { unit: 'units²', d: 2 }),
          multi('The line L is x = 1. Which lines are parallel to L and 3.5 units away from it?', ['x = 4.5', 'x = −2.5', 'y = 4.5', 'x = 3.5'], [0, 1], '1 + 3.5 = 4.5 and 1 − 3.5 = −2.5.', { fixed: true, d: 2 }),
          txt('Write down the equation of the line perpendicular to x = 1 that passes through (1, 4.5).', lineName('y', 4.5), 'A line perpendicular to a vertical line is horizontal: y = 4.5.', { d: 2 }),
          fill('Points: A(10, 10), B(−10, 15), C(10, −15), D(−15, 15), E(−10, −10), F(15, −15). Which points are on each line?', [['A'], ['B, E', 'B,E', 'E, B', 'BE', 'B and E'], ['F'], ['C, F', 'C,F', 'F, C', 'CF', 'C and F']], 'Look at the x-coordinate for x = …, and the y-coordinate for y = ….', { f: 'y = 10: [] &nbsp; x = −10: [] &nbsp; x = 15: [] &nbsp; y = −15: []', d: 2 }),
          multi('A square has its centre at the origin and each side is 8 units. Which are the equations of its four sides?', ['x = 4', 'x = −4', 'y = 4', 'y = −4', 'x = 8', 'y = 8'], [0, 1, 2, 3], 'Half of 8 is 4 on each side of the centre.', { fixed: true, d: 2 }),
          mcq('Two lines parallel to the axes cross at (−9.5, 7.5). What are their equations?', ['x = −9.5 and y = 7.5', 'x = 7.5 and y = −9.5', 'y = −9.5x + 7.5', 'x = 0 and y = 0'], 0, 'The vertical line has x = −9.5 and the horizontal line has y = 7.5.'),
          mcq('What is the name of the x-axis?', ['y = 0', 'x = 0', 'y = x', 'x = 1'], 0, 'Every point on the x-axis has y-coordinate 0.'),
          gen(() => { const v = R(-6, 6) + pick([0, 0.5]); const ax = pick(['x', 'y']); const pts = [R(-8, 8), R(-8, 8)].map((k) => (ax === 'x' ? `(${sg(v)}, ${sg(k)})` : `(${sg(k)}, ${sg(v)})`)); if (pts[0] === pts[1]) return null; return txt(`A straight line passes through ${pts[0]} and ${pts[1]}. Write down the name of the line.`, lineName(ax, v), `Both points have the same ${ax}-coordinate, ${sg(v)}.`, { ph: `vd: ${ax} = …` }); }),
          gen(() => { const a = R(-5, 2), b = a + R(2, 6), c = R(-5, 1), d = c + R(2, 6); return num(`The lines x = ${sg(a)}, x = ${sg(b)}, y = ${sg(c)} and y = ${sg(d)} enclose a rectangle. Work out its area.`, (b - a) * (d - c), `Width ${sg(b)} − ${sg(a)} = ${b - a}; height ${sg(d)} − ${sg(c)} = ${d - c}; area = ${(b - a) * (d - c)}.`, { unit: 'units²' }); }),
          gen(() => { const v = R(-6, 6), k = U.RNZ(-9, 9); const P = (a, b) => `(${sg(a)}, ${sg(b)})`; const opts = ax => (ax === 'x' ? [P(v, v + k), P(v + k, v), P(v + 1, v + k + 1), P(v - k, v - k)] : [P(v + k, v), P(v, v + k), P(v + k + 1, v + 1), P(v - k, v - k)]); const ax = pick(['x', 'y']); const o = opts(ax); if (new Set(o).size < 4) return null; return mcq(`Which point is on the line ${ax} = ${sg(v)}?`, o, 0, `On ${ax} = ${sg(v)} every point has ${ax}-coordinate ${sg(v)}.`); }),
        ],
      },
      {
        id: '11.4', t: 'Interpreting graphs', vi: 'Đọc hiểu đồ thị',
        goals: ['interpret graphs related to rates of change.'],
        body: [
          ['p', 'Graphs can show how the value of a variable changes with time. This graph shows the cost of a phone call. The graph is a straight line, so the cost increases by the same amount each minute: the <b>rate</b> is $0.40 per minute.'],
          ['ex', { t: 'Worked example 11.5', q: 'Use the graph. a What is the cost of a 4-minute call? b Complete a table for 1 to 7 minutes. c What is the charge per minute? d Write a function for the cost c of a call of t minutes. e Work out the cost of a 10-minute call.', fig: rlGraph({ xmax: 7, ymax: 3, xstep: 1, ystep: 0.5, xlab: 'Time (min)', ylab: 'Cost ($)', series: [{ f: (t) => 0.4 * t }], W: 340, H: 220 }), steps: ['a: <b>$1.60</b>', 'b: 0.4, 0.8, 1.2, 1.6, 2, 2.4, 2.8', 'c: <b>$0.40</b> per minute; d: <b>c = 0.4t</b>', 'e: c = 0.4 × 10 = <b>$4</b>'] }],
          ['viz', 'graphReader'],
          ['ex', { t: 'Worked example 11.6', q: 'The graph shows the distance travelled by a runner in a 5 km race. a How long does the race take? b How far has the runner gone after 5 minutes? c When is the runner fastest?', fig: rlGraph({ xmax: 20, ymax: 5, xstep: 5, ystep: 1, xlab: 'Time (min)', ylab: 'Distance (km)', series: [{ pts: [[0, 0], [3, 1], [5, 1.6], [10, 2.6], [15, 3.6], [17, 4.2], [20, 5]] }], W: 340, H: 220 }), steps: ['a: <b>20 minutes</b>.', 'b: <b>1.6 km</b>.', 'c: the runner is fastest where the graph is <b>steepest</b> — near the beginning and near the end.'] }],
          ['p', 'When a graph slopes upwards from left to right it has a <b>positive gradient</b>. When it slopes downwards it has a <b>negative gradient</b>. A horizontal graph, such as y = 5, has <b>zero gradient</b>.'],
          ['viz', 'vaseFill'],
          ['vi', ['Đường thẳng → tốc độ thay đổi không đổi (đều).', 'Tốc độ = lượng thay đổi theo trục y ÷ thời gian.', 'Đồ thị càng dốc → thay đổi càng nhanh.', 'Đi lên: gradient dương; đi xuống: gradient âm; nằm ngang: gradient 0.', 'Đồ thị có “phí ban đầu” không đi qua gốc toạ độ (ví dụ taxi bắt đầu từ $4).']],
        ],
        bank: [
          fill('A boy walks at a steady rate. The graph shows he walks 400 m in 5 minutes.', [80, 800], 'Rate = 400 ÷ 5 = 80 m per minute.', { f: 'Rate: [] m per minute &nbsp; Distance in 10 minutes: [] m', fig: rlGraph({ xmax: 8, ymax: 700, xstep: 1, ystep: 100, xlab: 'Time (min)', ylab: 'Distance (m)', series: [{ f: (t) => 80 * t }], W: 320, H: 220 }) }),
          expr('The boy walks 80 m per minute. Write a function for the distance d metres walked in t minutes: d = …', ['80t'], 'd = 80t.', { keys: ['t'] }),
          mcq('Show that the boy (80 m per minute) takes more than 12 minutes to walk 1 kilometre. How long does he take?', ['12.5 minutes', '12 minutes', '10 minutes', '8 minutes'], 0, '1000 ÷ 80 = 12.5 minutes.'),
          fill('The graph shows the litres of petrol in a car during a journey.', [30, 21, 6, 5], 'The line falls by 6 litres each hour; 30 ÷ 6 = 5 hours.', { f: 'At the start: [] L &nbsp; After 1.5 hours: [] L &nbsp; Rate of use: [] L per hour &nbsp; Time until empty: [] hours', fig: rlGraph({ xmax: 5, ymax: 30, xstep: 1, ystep: 5, xlab: 'Time (h)', ylab: 'Petrol (L)', series: [{ f: (t) => 30 - 6 * t }], W: 320, H: 220 }), d: 2 }),
          mcq('Is the gradient of the petrol graph positive, negative or zero?', ['negative', 'positive', 'zero'], 0, 'The amount of petrol goes down as time goes on.', { fixed: true }),
          fill('The electricity for a machine costs $6 for 24 hours. The graph is a straight line.', [0.25, 42], '$6 ÷ 24 = $0.25 per hour. A week is 168 hours: 168 × 0.25 = $42.', { f: 'Cost per hour: $[] &nbsp; Cost for one week: $[]', d: 2, app: true }),
          fill('A candle is 10 cm long. It burns at a steady rate of 0.2 cm per minute.', [8, 6, 50], 'After 10 min: 10 − 2 = 8 cm. It burns completely after 10 ÷ 0.2 = 50 minutes.', { f: 'Length after 10 min: [] cm &nbsp; after 20 min: [] cm &nbsp; Time to burn completely: [] min', fig: rlGraph({ xmax: 50, ymax: 10, xstep: 10, ystep: 2, xlab: 'Time (min)', ylab: 'Length (cm)', series: [{ f: (t) => 10 - 0.2 * t }], W: 320, H: 220 }) }),
          fill('A taxi has an initial charge of $4 and then charges $0.40 for each minute.', [8, 12, 16, 0.4], 'Cost = 4 + 0.4 × time.', { f: '10 min: $[] &nbsp; 20 min: $[] &nbsp; 30 min: $[] &nbsp; extra cost per minute: $[]', fig: rlGraph({ xmax: 40, ymax: 20, xstep: 5, ystep: 5, xlab: 'Time (min)', ylab: 'Cost ($)', series: [{ f: (t) => 4 + 0.4 * t }], W: 320, H: 220 }), app: true }),
          mcq('Sofia says: “The cost of a 1-hour taxi journey is twice the cost of a 30-minute journey.” ($4 initial charge, $0.40 per minute.) Is she correct?', ['No — 60 min costs $28 but 30 min costs $16, and 2 × 16 = 32', 'Yes — 2 × $16 = $32', 'Yes — both cost $0.40 per minute', 'No — 60 min costs $24'], 0, 'The initial charge is only paid once, so doubling the time does not double the cost.', { d: 2 }),
          mcq('Water is cooling down. How does the graph show this?', ['The graph slopes downwards (negative gradient)', 'The graph slopes upwards', 'The graph is horizontal', 'The graph goes through (0, 0)'], 0, 'The temperature decreases as time increases.'),
          mcq('A cylindrical vase is filled from a tap at a constant rate. What does the graph of depth against time look like?', ['A straight line sloping upwards', 'A curve that gets steeper', 'A horizontal line', 'A curve that gets less steep'], 0, 'The cross-section is the same all the way up, so the depth increases by the same amount each second.'),
          mcq('A vase is narrow at the bottom and wide at the top. It is filled at a constant rate. How does the depth change?', ['It rises quickly at first, then more slowly', 'It rises slowly at first, then more quickly', 'It rises at a constant rate', 'It does not change'], 0, 'Near the top the vase is wider, so the same volume of water makes the depth rise less.', { d: 2 }),
          sort('Is the gradient of each graph positive, negative or zero?', ['positive', 'negative', 'zero'], [['distance walked against time', 0], ['petrol left in a tank against time', 1], ['the line y = 5', 2], ['cost of a phone call against time', 0], ['length of a burning candle against time', 1], ['height of a parked car against time', 2]], 'Upwards = positive, downwards = negative, horizontal = zero.'),
          gen(() => { const r = pick([0.2, 0.25, 0.3, 0.5, 0.6, 0.8]); const t = R(5, 30); return num(`A phone company charges $${r.toFixed(2)} per minute. The graph of cost against time is a straight line through (0, 0). What is the cost of a ${t}-minute call?`, U.round(r * t, 2), `${r} × ${t} = ${U.round(r * t, 2)}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const v = pick([40, 50, 60, 70, 80, 90]); const t = R(3, 15); return num(`A walker travels ${v * 4} m in 4 minutes at a steady rate. How far does she travel in ${t} minutes?`, v * t, `Rate = ${v * 4} ÷ 4 = ${v} m/min; ${v} × ${t} = ${v * t} m.`, { unit: 'm' }); }),
          gen(() => { const fee = pick([2, 3, 4, 5]), r = pick([0.5, 1, 1.5, 2]); const t = pick([10, 20, 30]); return num(`A taxi charges $${fee} plus $${r} per km. What is the cost of a ${t} km journey?`, fee + r * t, `${fee} + ${r} × ${t} = ${fee + r * t}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const h0 = R(2, 8), g = pick([0.5, 1, 1.5, 2]); const d = pick([10, 20, 30]); return num(`A plant is ${h0} cm tall and grows ${g} cm each day. Its height-time graph is a straight line. How tall is it after ${d} days?`, h0 + g * d, `${h0} + ${g} × ${d} = ${h0 + g * d} cm.`, { unit: 'cm' }); }),
        ],
      },
    ],
    explore: {
      title: 'Graphs that tell stories', hero: 'heroGraphs',
      lead: 'A graph is a picture of change. Scientists, sports coaches, doctors and engineers read graphs every day to see how fast things happen — and to predict what will happen next.',
      leadVi: 'Đồ thị là bức tranh của sự thay đổi. Nhà khoa học, huấn luyện viên, bác sĩ và kĩ sư đọc đồ thị hằng ngày để biết mọi thứ thay đổi nhanh hay chậm và dự đoán tương lai.',
      cards: [
        { t: 'The fastest run in history', p: 'In 2009 Usain Bolt ran 100 m in 9.58 seconds. Timers recorded each 10 m. On the distance–time graph, the steepest part shows his top speed — more than 12 metres every second!', viz: 'boltRun' },
        { t: 'Fill the vase', p: 'Water flows from the tap at a constant rate, but the depth does not always rise at a constant rate. The shape of the vase changes the shape of the graph. Predict each graph before you press the button.', viz: 'vaseFill' },
        { t: 'A fly on the ceiling', p: 'A famous story says that René Descartes, lying in bed, watched a fly crawl on the ceiling and realised he could describe its position with two numbers. In 1637 he published the idea of coordinates, which joined algebra and geometry together.', viz: 'axisLines' },
        { t: 'Families of lines', p: 'Change one number in the equation and the whole line moves. In y = x + c the line slides up and down; in y = mx it turns around the origin. Engineers use this idea to design ramps, roads and roller coasters.', viz: 'linePlotter' },
      ],
      facts: [['1637', 'coordinates', 'René Descartes published La Géométrie.'], ['1786', 'first line graphs', 'William Playfair drew trade over time.'], ['12.3 m/s', 'Bolt’s top speed', 'About 44 km/h between 60 m and 80 m.'], ['(0, 0)', 'y = mx', 'Every line y = mx passes through the origin.']],
      challenge: { t: 'Which phone plan?', p: 'Plan A costs $0.40 per minute. Plan B costs $6 per month plus $0.10 per minute. Draw both graphs (cost against minutes). For how many minutes do the plans cost the same? Which plan is cheaper for 30 minutes?', a: '0.4t = 6 + 0.1t → 0.3t = 6 → t = 20 minutes (both cost $8). For 30 minutes: A = $12, B = $9, so Plan B is cheaper. The graphs cross at (20, 8).' },
    },
    reading: {
      title: 'The Man Who Drew Time', sub: 'How the line graph was invented. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Today graphs are everywhere, but for most of history people did not use them. Numbers were written in long tables, and readers had to study the rows carefully to see a pattern. If prices went up and down over many years, it was very hard to notice.',
        'The idea of describing a position with two numbers comes from the French thinker René Descartes, who published it in 1637. His coordinates allowed mathematicians to draw equations as lines and curves. However, for more than a hundred years, coordinates were used mainly for mathematics, not for real-world data.',
        'In 1786 a Scottish engineer called William Playfair published a book called The Commercial and Political Atlas. In it he drew lines to show how the trade between England and other countries changed over time. The horizontal axis showed the years and the vertical axis showed the amount of money. For the first time, readers could see at a glance when trade was growing and when it was falling.',
        'Playfair also invented the bar chart, and in 1801 he drew some of the first pie charts. At first, many people in Britain were not impressed by his pictures. Some thought that serious information should only be written in tables. Slowly, however, scientists and governments realised how useful his ideas were.',
        'Now, more than two hundred years later, graphs help doctors to follow a patient’s temperature, help scientists to track climate change and help athletes to study their training. Every time you read a graph, you are using an invention that began with a few lines drawn by hand.',
      ],
      gloss: [['trade', 'thương mại'], ['at a glance', 'chỉ cần nhìn qua'], ['impressed', 'ấn tượng'], ['government', 'chính phủ'], ['track', 'theo dõi'], ['invention', 'phát minh']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why was it hard to see patterns before graphs?', opts: ['Numbers were written in long tables', 'There were no numbers', 'Paper was too expensive', 'People could not count'], a: 0, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'What did Playfair’s 1786 graphs show?', opts: ['trade between England and other countries over time', 'the positions of planets', 'the temperature of patients', 'a fly on a ceiling'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'What did the horizontal axis show on Playfair’s graphs?', opts: ['the years', 'the amount of money', 'the countries', 'the prices of bread'], a: 0, ex: 'Paragraph C.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'Descartes used coordinates mainly for real-world data.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'They were used mainly for mathematics.' },
          { type: 'mcq', q: 'Playfair also invented the bar chart.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph D.' },
          { type: 'mcq', q: 'Playfair became rich from selling his book.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'Not mentioned.' },
        ] },
        { title: 'Dates and order', qs: [
          { type: 'order', q: 'Put these events in time order (earliest first).', a: ['Descartes publishes coordinates', 'Playfair draws the first line graphs of trade', 'Playfair draws some of the first pie charts', 'Doctors use graphs to follow patients'], ex: '1637 → 1786 → 1801 → today.' },
          { type: 'fill', q: 'Complete.', f: 'Descartes published his idea in []. Playfair’s Atlas was published in []. Playfair came from [].', a: [1637, 1786, ['Scotland', 'scotland']], ex: 'Paragraphs B and C.' },
        ] },
      ],
    },
    listening: {
      title: 'Hiring bikes for the day', intro: 'Mai and Ben compare two bike-hire shops. Listen and answer.',
      voices: { Mai: 'glassy', Ben: 'rounded' },
      lines: [
        { spk: 'Mai', text: 'Ben, there are two bike-hire shops near the beach. Speedy Bikes charges five dollars for every hour.' },
        { spk: 'Ben', text: 'And Easy Ride charges eight dollars when you collect the bike, and then three dollars for every hour.' },
        { spk: 'Mai', text: 'Let’s draw a graph. For Speedy Bikes the line goes through the origin, because zero hours costs zero dollars.' },
        { spk: 'Ben', text: 'Easy Ride’s line starts at eight dollars on the cost axis, but it is less steep, because it only goes up three dollars each hour.' },
        { spk: 'Mai', text: 'For three hours, Speedy Bikes costs fifteen dollars and Easy Ride costs seventeen dollars.' },
        { spk: 'Ben', text: 'But for six hours, Speedy Bikes costs thirty dollars and Easy Ride only twenty-six.' },
        { spk: 'Mai', text: 'So the lines must cross somewhere. At four hours they both cost twenty dollars!' },
        { spk: 'Ben', text: 'We want to ride all afternoon, about five hours, so Easy Ride is cheaper for us.' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'Speedy Bikes: $[] per hour. Easy Ride: $[] when you collect the bike, then $[] per hour. The graphs cross at [] hours, when both cost $[].', a: [5, 8, 3, 4, 20], ex: '5 × 4 = 20 and 8 + 3 × 4 = 20.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Which line passes through the origin?', opts: ['Speedy Bikes', 'Easy Ride', 'both', 'neither'], a: 0, ex: '“zero hours costs zero dollars”.' },
          { type: 'mcq', q: 'Why is Easy Ride’s line less steep?', opts: ['It only goes up $3 each hour', 'It starts at $8', 'It is more expensive', 'It goes through the origin'], a: 0, ex: 'Line 4.' },
          { type: 'num', q: 'How much would Easy Ride cost for 5 hours (in dollars)?', a: 23, ex: '8 + 3 × 5 = 23 (Speedy Bikes would cost $25).' },
        ] },
      ],
    },
  });
})();
