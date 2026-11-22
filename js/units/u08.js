/* Unit 8 — Shapes and symmetry */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, gen } = Q;
  const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;

  /* ---------- symmetry engine ---------- */
  function symOf(pts) {
    const n = pts.length; const cx = U.sum(pts.map((p) => p[0])) / n, cy = U.sum(pts.map((p) => p[1])) / n;
    const P = pts.map(([x, y]) => [x - cx, y - cy]); const sc = Math.max(...P.map((p) => Math.hypot(p[0], p[1]))) || 1; const tol = sc * 1e-4;
    const idx = (q) => P.findIndex((p) => Math.hypot(p[0] - q[0], p[1] - q[1]) < tol);
    const ok = (T) => { const m = P.map((p) => idx(T(p))); if (m.some((j) => j < 0) || new Set(m).size !== n) return false; for (let i = 0; i < n; i++) { const d = Math.abs(m[i] - m[(i + 1) % n]); if (d !== 1 && d !== n - 1) return false; } return true; };
    const cand = []; P.forEach((p, i) => { cand.push(Math.atan2(p[1], p[0])); const q = P[(i + 1) % n]; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; cand.push(Math.hypot(mx, my) > tol ? Math.atan2(my, mx) : Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2); });
    const lines = []; cand.forEach((t) => { let a = ((t % Math.PI) + Math.PI) % Math.PI; if (a > Math.PI - 1e-6) a = 0; if (lines.some((b) => Math.abs(b - a) < 1e-6)) return; const c2 = Math.cos(2 * a), s2 = Math.sin(2 * a); if (ok(([x, y]) => [x * c2 + y * s2, x * s2 - y * c2])) lines.push(a); });
    const rots = []; const r0 = Math.hypot(P[0][0], P[0][1]); const a0 = Math.atan2(P[0][1], P[0][0]);
    P.forEach((p) => { if (Math.abs(Math.hypot(p[0], p[1]) - r0) > tol) return; let phi = Math.atan2(p[1], p[0]) - a0; phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); if (phi > 2 * Math.PI - 1e-6) phi = 0; if (rots.some((b) => Math.abs(b - phi) < 1e-6)) return; const c = Math.cos(phi), sn = Math.sin(phi); if (ok(([x, y]) => [x * c - y * sn, x * sn + y * c])) rots.push(phi); });
    return { lines, order: Math.max(1, rots.length), c: [cx, cy] };
  }
  function symCells(cells) { // cells: {"x,y": color}
    const ks = Object.keys(cells); if (!ks.length) return { lines: [], order: 0, c: [0, 0] };
    const pts = ks.map((k) => k.split(',').map(Number)); const cx = U.mean(pts.map((p) => p[0])), cy = U.mean(pts.map((p) => p[1]));
    const test = (T) => pts.every(([x, y]) => { const [u, v] = T(x, y); const ru = Math.round(u), rv = Math.round(v); return Math.abs(u - ru) < 1e-6 && Math.abs(v - rv) < 1e-6 && cells[ru + ',' + rv] === cells[x + ',' + y]; });
    const L = []; if (test((x, y) => [2 * cx - x, y])) L.push('v'); if (test((x, y) => [x, 2 * cy - y])) L.push('h'); if (test((x, y) => [cx + (y - cy), cy + (x - cx)])) L.push('d'); if (test((x, y) => [cx - (y - cy), cy - (x - cx)])) L.push('a');
    const r90 = test((x, y) => [cx - (y - cy), cy + (x - cx)]), r180 = test((x, y) => [2 * cx - x, 2 * cy - y]);
    return { lines: L, order: r90 ? 4 : r180 ? 2 : 1, c: [cx, cy] };
  }
  APP.sym = { symOf, symCells };

  /* ---------- shape catalogue & figures ---------- */
  const regular = (n, r = 3, ph = 90) => Array.from({ length: n }, (_, i) => [r * Math.cos(rad(ph + (i * 360) / n)), r * Math.sin(rad(ph + (i * 360) / n))]);
  const star = (k = 5) => Array.from({ length: 2 * k }, (_, i) => { const r = i % 2 ? 1.3 : 3.2; const a = rad(90 + (i * 180) / k); return [r * Math.cos(a), r * Math.sin(a)]; });
  const CAT = {
    square: ['square', 'hình vuông', [[-2, -2], [2, -2], [2, 2], [-2, 2]]],
    rectangle: ['rectangle', 'hình chữ nhật', [[-3, -2], [3, -2], [3, 2], [-3, 2]]],
    rhombus: ['rhombus', 'hình thoi', [[0, -3], [2, 0], [0, 3], [-2, 0]]],
    parallelogram: ['parallelogram', 'hình bình hành', [[-3, -2], [1, -2], [3, 2], [-1, 2]]],
    kite: ['kite', 'hình cánh diều', [[0, -4], [2, 0], [0, 2], [-2, 0]]],
    trapezium: ['trapezium', 'hình thang', [[-3, -2], [3, -2], [1, 2], [-2, 2]]],
    isoTrap: ['isosceles trapezium', 'hình thang cân', [[-3, -2], [3, -2], [1, 2], [-1, 2]]],
    isoTri: ['isosceles triangle', 'tam giác cân', [[-2, -2], [2, -2], [0, 3]]],
    scalene: ['scalene triangle', 'tam giác thường', [[-3, -2], [3, -2], [-1, 2]]],
    rightIso: ['right-angled isosceles triangle', 'tam giác vuông cân', [[-2, -2], [2, -2], [-2, 2]]],
    arrow: ['arrow', 'mũi tên', [[-4, -1], [0, -1], [0, -3], [4, 0], [0, 3], [0, 1], [-4, 1]]],
    plus: ['cross', 'chữ thập', [[-1, -3], [1, -3], [1, -1], [3, -1], [3, 1], [1, 1], [1, 3], [-1, 3], [-1, 1], [-3, 1], [-3, -1], [-1, -1]]],
    sShape: ['S-shape', 'hình chữ S', [[-1, -2], [3, -2], [3, 0], [1, 0], [1, 2], [-3, 2], [-3, 0], [-1, 0]]],
    lShape: ['L-shape', 'hình chữ L', [[0, 0], [4, 0], [4, 1], [1, 1], [1, 3], [0, 3]]],
    lEqual: ['L-shape with equal arms', 'chữ L hai cánh bằng nhau', [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]]],
    tShape: ['T-shape', 'hình chữ T', [[-3, 3], [3, 3], [3, 1], [1, 1], [1, -3], [-1, -3], [-1, 1], [-3, 1]]],
    equi: ['equilateral triangle', 'tam giác đều', regular(3)],
    pent: ['regular pentagon', 'ngũ giác đều', regular(5)],
    hex: ['regular hexagon', 'lục giác đều', regular(6, 3, 0)],
    oct: ['regular octagon', 'bát giác đều', regular(8, 3, 22.5)],
    star5: ['five-pointed star', 'ngôi sao 5 cánh', star(5)],
  };
  const shapeFig = (pts, o = {}) => {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
    const W = o.W || 200, H = o.H || 150, pad = 14; const sc = Math.min((W - 2 * pad) / (mxx - mnx || 1), (H - 2 * pad) / (mxy - mny || 1)); const ox = (W - (mxx - mnx) * sc) / 2, oy = (H - (mxy - mny) * sc) / 2;
    const P = pts.map(([x, y]) => [ox + (x - mnx) * sc, H - oy - (y - mny) * sc]);
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:100%"><polygon points="${P.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${o.fill || 'color-mix(in srgb, var(--geometry) 28%, transparent)'}" stroke="var(--geometry)" stroke-width="3" stroke-linejoin="round"/>${o.label ? `<text x="10" y="20" font-weight="800" font-size="16" fill="var(--ink)">${o.label}</text>` : ''}</svg>`;
  };
  const cellsFig = (cells, n, o = {}) => { const cs = o.cs || 30, W = n * cs + 8; let g = `<svg viewBox="0 0 ${W} ${W}" width="${W}" style="max-width:100%">`; for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) { const c = cells[x + ',' + y]; g += `<rect x="${4 + x * cs}" y="${4 + y * cs}" width="${cs}" height="${cs}" fill="${c === 1 ? 'var(--number)' : c === 2 ? '#F6C343' : 'var(--surface)'}" stroke="var(--ink-3)" stroke-width="1"/>`; } return g + '</svg>'; };
  const COLS = ['var(--bad)', 'var(--number)', 'var(--stats)', 'var(--algebra)', 'var(--geometry)'];

  /* ---------- widgets ---------- */
  APP.viz.symLab = function (el) {
    const f = VZ.frame(el, 'Phòng thí nghiệm đối xứng — kéo các đỉnh', { icon: 'target' });
    const W = 360, u = 30, C = W / 2; const svg = VZ.svg(W, W); f.stage.append(svg);
    let key = 'kite', pts = CAT[key][2].map((p) => p.slice()); let ghost = null;
    const X = (x) => C + x * u, Y = (y) => C - y * u;
    function draw() {
      svg.innerHTML = ''; for (let i = -5; i <= 5; i++) { svg.append(s('line', { x1: X(i), y1: Y(-5.5), x2: X(i), y2: Y(5.5), stroke: 'var(--line)', 'stroke-width': i ? 0.6 : 1.2 })); svg.append(s('line', { x1: X(-5.5), y1: Y(i), x2: X(5.5), y2: Y(i), stroke: 'var(--line)', 'stroke-width': i ? 0.6 : 1.2 })); }
      const sy = symOf(pts); const [cx, cy] = sy.c;
      svg.append(s('polygon', { points: pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' '), fill: 'color-mix(in srgb, var(--geometry) 30%, transparent)', stroke: 'var(--geometry)', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      sy.lines.forEach((a, i) => { const L = 7; svg.append(s('line', { x1: X(cx - L * Math.cos(a)), y1: Y(cy - L * Math.sin(a)), x2: X(cx + L * Math.cos(a)), y2: Y(cy + L * Math.sin(a)), stroke: COLS[i % COLS.length], 'stroke-width': 2.5, 'stroke-dasharray': '8 6', style: `animation:popIn .3s ${i * 0.06}s both` })); });
      if (ghost) svg.append(ghost);
      if (sy.order > 1) svg.append(s('circle', { cx: X(cx), cy: Y(cy), r: 5, fill: 'var(--accent)' }));
      pts.forEach((p, i) => { const hd = s('circle', { cx: X(p[0]), cy: Y(p[1]), r: 11, fill: 'var(--accent)', stroke: '#fff', 'stroke-width': 3, style: 'cursor:grab;touch-action:none' }); svg.append(hd); VZ.drag(svg, hd, (q) => { const nx = Math.max(-5, Math.min(5, Math.round((q.x - C) / u))), ny = Math.max(-5, Math.min(5, Math.round((C - q.y) / u))); if (nx !== p[0] || ny !== p[1]) { p[0] = nx; p[1] = ny; SFX.play('tick'); draw(); } }); });
      f.out.innerHTML = `Số trục đối xứng: <b style="color:var(--accent)">${sy.lines.length}</b> &nbsp;·&nbsp; Bậc đối xứng quay: <b style="color:var(--accent)">${sy.order}</b>${sy.order === 1 ? ' (chỉ trùng khi quay đủ 1 vòng)' : ''}`;
    }
    function spin() {
      const sy = symOf(pts); const [cx, cy] = sy.c; let hits = 0, lastHit = -1;
      VZ.animate(3200, (_, k) => { const a = k * 2 * Math.PI; const q = pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]); const step = Math.floor((k + 1e-9) * sy.order); const near = Math.abs(k * sy.order - Math.round(k * sy.order)) < 0.012 && k > 0.02; if (near && Math.round(k * sy.order) !== lastHit) { lastHit = Math.round(k * sy.order); hits++; SFX.play('pop'); } ghost = s('polygon', { points: q.map(([x, y]) => X(x) + ',' + Y(y)).join(' '), fill: near ? 'color-mix(in srgb, var(--good) 35%, transparent)' : 'none', stroke: near ? 'var(--good)' : 'var(--ink-2)', 'stroke-width': 2.5, 'stroke-dasharray': near ? '' : '5 4' }); draw(); f.out.innerHTML = `Đang quay ${Math.round(k * 360)}° · số lần trùng khớp: <b>${hits}</b>`; }, () => { ghost = null; draw(); f.out.innerHTML += ` &nbsp;→ bậc đối xứng quay = <b style="color:var(--accent)">${sy.order}</b>`; SFX.play('correct'); });
      void lastHit;
    }
    const quads = ['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium', 'isoTrap', 'isoTri', 'scalene', 'rightIso', 'arrow', 'plus', 'sShape', 'tShape'];
    const sel = h('select', { class: 'sel', 'aria-label': 'Chọn hình', onchange: (e) => { key = e.target.value; pts = CAT[key][2].map((p) => p.slice()); SFX.play('whoosh'); draw(); } }, quads.map((k) => h('option', { value: k, selected: k === key }, CAT[k][1] + ' — ' + CAT[k][0])));
    f.ctrls.append(sel, VZ.btn('Quay 360° ⟳', spin, 'btn sm sc'));
    draw();
  };
  APP.viz.tilePattern = function (el) {
    const f = VZ.frame(el, 'Ghép gạch tạo hoa văn đối xứng', { icon: 'grid' });
    const n = 6, cs = 52, W = n * cs + 10; const svg = VZ.svg(W, W); f.stage.append(svg);
    let cells = { '2,2': 1, '3,3': 1, '2,3': 2, '3,2': 2 }; let col = 1;
    const goals = [['Đúng 1 trục', (L, o) => L === 1], ['Đúng 2 trục', (L, o) => L === 2], ['4 trục', (L) => L === 4], ['Quay bậc 2, không có trục', (L, o) => o === 2 && L === 0], ['Quay bậc 4, không có trục', (L, o) => o === 4 && L === 0]];
    const done = new Set(); const gl = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px', marginTop: '8px' } }); f.stage.append(gl);
    function draw() {
      svg.innerHTML = '';
      for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) { const c = cells[x + ',' + y]; const r = s('rect', { x: 5 + x * cs, y: 5 + y * cs, width: cs - 2, height: cs - 2, rx: 6, fill: c === 1 ? 'var(--number)' : c === 2 ? '#F6C343' : 'var(--surface)', stroke: 'var(--ink-3)', 'stroke-width': 1, style: 'cursor:pointer;transition:fill .2s' }); r.addEventListener('click', () => { const k = x + ',' + y; if (cells[k] === col) delete cells[k]; else cells[k] = col; SFX.play('pop'); draw(); }); svg.append(r); }
      const sy = symCells(cells); const P = (v) => 5 + (v + 0.5) * cs - 1; const [cx, cy] = sy.c; const E = n * cs;
      sy.lines.forEach((t, i) => { let a; if (t === 'v') a = [P(cx), 0, P(cx), E + 10]; else if (t === 'h') a = [0, P(cy), E + 10, P(cy)]; else if (t === 'd') a = [P(cx) - E, P(cy) - E, P(cx) + E, P(cy) + E]; else a = [P(cx) - E, P(cy) + E, P(cx) + E, P(cy) - E]; svg.append(s('line', { x1: a[0], y1: a[1], x2: a[2], y2: a[3], stroke: COLS[i], 'stroke-width': 3, 'stroke-dasharray': '9 6', 'pointer-events': 'none' })); });
      if (sy.order > 1) svg.append(s('circle', { cx: P(cx), cy: P(cy), r: 6, fill: 'var(--accent)', 'pointer-events': 'none' }));
      const L = sy.lines.length; gl.innerHTML = ''; goals.forEach(([t, fn], i) => { const ok = Object.keys(cells).length > 0 && fn(L, sy.order); if (ok && !done.has(i)) { done.add(i); SFX.play('star'); } gl.append(h('span', { class: 'pill' + (done.has(i) ? ' sc' : ''), style: { opacity: done.has(i) ? 1 : 0.7 } }, (done.has(i) ? '✓ ' : '○ ') + t)); });
      f.out.innerHTML = Object.keys(cells).length ? `Trục đối xứng: <b>${L}</b> ${L ? '(' + sy.lines.map((t) => ({ v: 'dọc', h: 'ngang', d: 'chéo', a: 'chéo' }[t])).join(', ') + ')' : ''} · Bậc đối xứng quay: <b>${sy.order}</b>` : 'Chạm vào ô để đặt gạch.';
    }
    f.ctrls.append(VZ.seg([[1, '🟦 Xanh'], [2, '🟨 Vàng']], col, (v) => (col = v)), VZ.btn('Xoá hết', () => { cells = {}; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.circleLab = function (el) {
    const f = VZ.frame(el, 'Các phần của đường tròn — kéo các điểm', { icon: 'target' });
    const W = 380, H = 330, O = [190, 165], r = 115; const svg = VZ.svg(W, H); f.stage.append(svg);
    let A = 200, B = 330, T = 60, hi = 'chord';
    const defs = { centre: 'Centre (tâm): điểm chính giữa, cách đều mọi điểm trên đường tròn.', radius: 'Radius (bán kính): đoạn thẳng từ tâm đến đường tròn.', diameter: 'Diameter (đường kính): dây cung đi qua tâm; dài gấp đôi bán kính và là dây cung dài nhất.', chord: 'Chord (dây cung): đoạn thẳng có hai đầu nằm trên đường tròn.', circumference: 'Circumference (đường tròn / chu vi): đường bao quanh hình tròn.', tangent: 'Tangent (tiếp tuyến): đường thẳng chạm đường tròn tại đúng MỘT điểm, luôn vuông góc với bán kính tại điểm đó.' };
    const P = (a) => [O[0] + r * Math.cos(rad(a)), O[1] - r * Math.sin(rad(a))];
    function draw() {
      svg.innerHTML = ''; const glow = (k) => (hi === k ? 5 : 2.5);
      svg.append(s('circle', { cx: O[0], cy: O[1], r, fill: 'color-mix(in srgb, var(--sc) 7%, transparent)', stroke: hi === 'circumference' ? 'var(--accent)' : 'var(--ink-2)', 'stroke-width': glow('circumference') }));
      let d = Math.abs(((A - B) % 360 + 360) % 360 - 180); const isDia = d < 4; const pa = P(A), pb = isDia ? P(A + 180) : P(B);
      svg.append(s('line', { x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1], stroke: isDia ? 'var(--algebra)' : 'var(--number)', 'stroke-width': hi === 'chord' || hi === 'diameter' ? 5 : 3 }));
      const pt = P(T); const tx = Math.sin(rad(T)), ty = Math.cos(rad(T));
      svg.append(s('line', { x1: pt[0] - 150 * tx, y1: pt[1] - 150 * ty, x2: pt[0] + 150 * tx, y2: pt[1] + 150 * ty, stroke: 'var(--stats)', 'stroke-width': glow('tangent') }));
      svg.append(s('line', { x1: O[0], y1: O[1], x2: pt[0], y2: pt[1], stroke: 'var(--bad)', 'stroke-width': glow('radius'), 'stroke-dasharray': hi === 'radius' ? '' : '7 5' }));
      const ux = (O[0] - pt[0]) / r, uy = (O[1] - pt[1]) / r, q = 13; svg.append(s('path', { d: `M${pt[0] + ux * q} ${pt[1] + uy * q} L${pt[0] + ux * q + tx * q} ${pt[1] + uy * q + ty * q} L${pt[0] + tx * q} ${pt[1] + ty * q}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.6 }));
      svg.append(s('text', { x: pt[0] + ux * 30 + tx * 26, y: pt[1] + uy * 30 + ty * 26 + 4, 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', 'text-anchor': 'middle', text: '90°' }));
      svg.append(s('circle', { cx: O[0], cy: O[1], r: hi === 'centre' ? 7 : 4.5, fill: 'var(--ink)' }));
      const lab = (p, t, c, dx = 0, dy = 0) => svg.append(s('text', { x: p[0] + dx, y: p[1] + dy, 'font-size': 13, 'font-weight': 800, fill: c, 'text-anchor': 'middle', text: t }));
      lab([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2], isDia ? 'diameter' : 'chord', isDia ? 'var(--algebra)' : 'var(--number)', 0, -8);
      lab(pt, 'tangent', 'var(--stats)', tx * 110, ty * 110 - 8); lab([(O[0] + pt[0]) / 2, (O[1] + pt[1]) / 2], 'radius', 'var(--bad)', 0, -8);
      [[A, 0], [isDia ? A + 180 : B, 1], [T, 2]].forEach(([ang, k]) => { const p = P(ang); const hd = s('circle', { cx: p[0], cy: p[1], r: 11, fill: k === 2 ? 'var(--stats)' : 'var(--number)', stroke: '#fff', 'stroke-width': 3, style: 'cursor:grab;touch-action:none' }); svg.append(hd); VZ.drag(svg, hd, (m) => { let a = deg(Math.atan2(O[1] - m.y, m.x - O[0])); if (a < 0) a += 360; if (k === 0) A = a; else if (k === 1) B = a; else T = a; draw(); }); });
      f.out.innerHTML = (isDia ? '<b>Dây cung đi qua tâm → đó là đường kính!</b> ' : '') + defs[hi];
    }
    f.ctrls.append(VZ.seg(Object.keys(defs).map((k) => [k, k]), hi, (v) => { hi = v; SFX.play('select'); draw(); }));
    draw();
  };
  APP.viz.regPoly = function (el) {
    const f = VZ.frame(el, 'Đa giác đều: trục đối xứng và tam giác bằng nhau', { icon: 'spark' });
    const W = 340, C = 170, r = 128; const svg = VZ.svg(W, W); f.stage.append(svg);
    const names = { 3: 'equilateral triangle', 4: 'square', 5: 'regular pentagon', 6: 'regular hexagon', 7: 'regular heptagon', 8: 'regular octagon', 9: 'regular nonagon', 10: 'regular decagon', 11: 'regular hendecagon', 12: 'regular dodecagon' };
    let n = 5, showL = true, showT = false, rot = 0;
    function draw() {
      svg.innerHTML = ''; const V = Array.from({ length: n }, (_, i) => { const a = rad(-90 + rot + (i * 360) / n); return [C + r * Math.cos(a), C + r * Math.sin(a)]; });
      if (showT) V.forEach((p, i) => { const q = V[(i + 1) % n]; svg.append(s('polygon', { points: `${C},${C} ${p.join(',')} ${q.join(',')}`, fill: `hsl(${(i * 360) / n} 75% 60% / .55)`, stroke: '#fff', 'stroke-width': 1.5, style: `animation:popIn .3s ${i * 0.05}s both` })); });
      svg.append(s('polygon', { points: V.map((p) => p.join(',')).join(' '), fill: showT ? 'none' : 'color-mix(in srgb, var(--geometry) 25%, transparent)', stroke: 'var(--geometry)', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
      if (showL) for (let k = 0; k < n; k++) { const a = rad(-90 + rot + (k * 180) / n); svg.append(s('line', { x1: C - 160 * Math.cos(a), y1: C - 160 * Math.sin(a), x2: C + 160 * Math.cos(a), y2: C + 160 * Math.sin(a), stroke: COLS[k % COLS.length], 'stroke-width': 1.8, 'stroke-dasharray': '7 5' })); }
      svg.append(s('circle', { cx: C, cy: C, r: 4, fill: 'var(--ink)' }));
      f.out.innerHTML = `<b>${names[n]}</b>: ${n} cạnh bằng nhau · ${n} góc bằng nhau · <b>${n}</b> trục đối xứng · đối xứng quay bậc <b>${n}</b> · chia thành ${n} tam giác cân bằng nhau${n === 6 ? ' (ở lục giác đều chúng là tam giác đều!)' : ''}`;
    }
    f.ctrls.append(VZ.range('Số cạnh', 3, 12, n, 1, (v) => { n = v; rot = 0; draw(); }), VZ.btn('Trục đối xứng', () => { showL = !showL; draw(); }, 'btn sm ghost'), VZ.btn('Tam giác', () => { showT = !showT; SFX.play('pop'); draw(); }, 'btn sm ghost'), VZ.btn('Quay 1 nấc ⟳', () => { const st = rot; VZ.animate(700, (e) => { rot = st + (e * 360) / n; draw(); }, () => { rot = 0; draw(); SFX.play('correct'); f.out.innerHTML = `Sau khi quay ${N(U.round(360 / n, 1))}° hình trông y hệt ban đầu → trong một vòng nó trùng ${n} lần.`; }); }, 'btn sm sc'));
    draw();
  };
  APP.viz.congruent = function (el) {
    const f = VZ.frame(el, 'Hình bằng nhau: xoay, lật rồi chồng khít', { icon: 'shuffle' });
    const W = 460, H = 300, u = 30; const svg = VZ.svg(W, H); f.stage.append(svg);
    let tri, tr, same = true, prog = 0;
    function fresh() { const a = [0, 0], b = [R(40, 60) / 10, 0], c = [R(5, 35) / 10, R(25, 38) / 10]; tri = [a, b, c]; tr = { th: pick([70, 110, 160, 200, 250]), flip: Math.random() < 0.5, k: same ? 1 : pick([0.8, 1.2]) }; prog = 0; }
    const cen = (P) => [U.mean(P.map((p) => p[0])), U.mean(P.map((p) => p[1]))];
    const pos1 = [110, 170], pos2 = [335, 150];
    function place(t) {
      const G = cen(tri); const th = rad(tr.th * (1 - t)); const sx = tr.flip ? -1 + 2 * t : 1; const k = tr.k + (1 - tr.k) * t; const px = pos2[0] + (pos1[0] - pos2[0]) * t, py = pos2[1] + (pos1[1] - pos2[1]) * t;
      return tri.map(([x, y]) => { let X = (x - G[0]) * sx * k, Y = (y - G[1]) * k; const rx = X * Math.cos(th) - Y * Math.sin(th), ry = X * Math.sin(th) + Y * Math.cos(th); return [px + rx * u, py - ry * u]; });
    }
    const base = () => { const G = cen(tri); return tri.map(([x, y]) => [pos1[0] + (x - G[0]) * u, pos1[1] - (y - G[1]) * u]); };
    function polyG(P, names, alpha) {
      const g = s('g', {}); const cols = ['var(--bad)', 'var(--number)', 'var(--stats)'];
      g.append(s('polygon', { points: P.map((p) => p.join(',')).join(' '), fill: `color-mix(in srgb, var(--geometry) ${alpha}%, transparent)`, stroke: 'none' }));
      P.forEach((p, i) => { const q = P[(i + 1) % 3]; g.append(s('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: cols[i], 'stroke-width': 4, 'stroke-linecap': 'round' })); });
      const G = cen(P); P.forEach((p, i) => { const dx = p[0] - G[0], dy = p[1] - G[1], L = Math.hypot(dx, dy) || 1; g.append(s('text', { x: p[0] + (dx / L) * 16, y: p[1] + (dy / L) * 16 + 5, 'text-anchor': 'middle', 'font-weight': 800, 'font-size': 15, fill: 'var(--ink)', text: names[i] })); });
      return g;
    }
    function draw() { svg.innerHTML = ''; svg.append(polyG(base(), ['A', 'B', 'C'], 22)); svg.append(polyG(place(prog), ['P', 'Q', 'R'], 12)); }
    function overlay() {
      if (prog > 0.99) { prog = 0; draw(); return; } SFX.play('whoosh');
      VZ.animate(1400, (e) => { prog = e; draw(); }, () => { if (same) { SFX.play('correct'); f.out.innerHTML = '<b style="color:var(--good)">Khớp hoàn toàn!</b> AB = PQ, BC = QR, CA = RP và các góc tương ứng bằng nhau → hai tam giác <b>bằng nhau (congruent)</b>.'; } else { SFX.play('wrong'); f.out.innerHTML = '<b style="color:var(--bad)">Không khớp!</b> Hình dạng giống nhau nhưng KÍCH THƯỚC khác → không bằng nhau.'; } });
    }
    f.ctrls.append(VZ.btn('Chồng lên kiểm tra ▶', overlay, 'btn sm sc'), VZ.btn('Cặp mới', () => { fresh(); draw(); f.out.textContent = 'Cùng màu = cạnh tương ứng. Hình PQR đã bị xoay' + (tr.flip ? ' và lật.' : '.'); }, 'btn sm'), VZ.seg([[true, 'Bằng nhau'], [false, 'Khác cỡ']], same, (v) => { same = v; fresh(); draw(); f.out.textContent = 'Bấm “Chồng lên kiểm tra”.'; }));
    fresh(); draw(); f.out.textContent = 'Cùng màu = cạnh tương ứng. Bấm để xoay/lật PQR chồng lên ABC.';
  };
  /* 3D solids */
  const ring = (n, r, y, ph = 0) => Array.from({ length: n }, (_, i) => { const a = ph + (i * 2 * Math.PI) / n; return [r * Math.cos(a), y, r * Math.sin(a)]; });
  function prismZ(base, d) { const n = base.length; const V = [...base.map(([x, y]) => [x, y, d]), ...base.map(([x, y]) => [x, y, -d])]; return { V, F: [base.map((_, i) => i), base.map((_, i) => n + i), ...base.map((_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i])] }; }
  function prismY(n, r, hh, smooth) { const V = [...ring(n, r, hh), ...ring(n, r, -hh)]; const F = [Array.from({ length: n }, (_, i) => i), Array.from({ length: n }, (_, i) => n + i)]; const S = []; for (let i = 0; i < n; i++) { F.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]); if (smooth) S.push(F.length - 1); } return { V, F, S }; }
  function pyrY(n, r, hb, apex, ph, smooth) { const V = [...ring(n, r, -hb, ph), [0, apex, 0]]; const F = [Array.from({ length: n }, (_, i) => i)]; const S = []; for (let i = 0; i < n; i++) { F.push([i, (i + 1) % n, n]); if (smooth) S.push(F.length - 1); } return { V, F, S }; }
  function sphere(la = 12, lo = 24) { const V = [], F = [], S = []; for (let i = 0; i <= la; i++) { const t = (i / la) * Math.PI; for (let j = 0; j < lo; j++) { const p = (j / lo) * 2 * Math.PI; V.push([1.3 * Math.sin(t) * Math.cos(p), 1.3 * Math.cos(t), 1.3 * Math.sin(t) * Math.sin(p)]); } } for (let i = 0; i < la; i++) for (let j = 0; j < lo; j++) { const a = i * lo + j, b = i * lo + ((j + 1) % lo); F.push([a, b, b + lo, a + lo]); S.push(F.length - 1); } return { V, F, S }; }
  const reg2 = (n, r, ph) => Array.from({ length: n }, (_, i) => [r * Math.cos(ph + (i * 2 * Math.PI) / n), r * Math.sin(ph + (i * 2 * Math.PI) / n)]);
  const SOLIDS = {
    cube: ['Cube', 'Hình lập phương', () => prismZ([[-1, -1], [1, -1], [1, 1], [-1, 1]], 1), [6, 8, 12], '6 mặt là hình vuông bằng nhau; mọi góc đều vuông'],
    cuboid: ['Cuboid', 'Hình hộp chữ nhật', () => prismZ([[-1.5, -0.8], [1.5, -0.8], [1.5, 0.8], [-1.5, 0.8]], 0.9), [6, 8, 12], '6 mặt hình chữ nhật; mọi góc đều vuông'],
    tri: ['Triangular prism', 'Lăng trụ tam giác đều', () => prismZ(reg2(3, 1.15, Math.PI / 2), 1.3), [5, 6, 9], '2 tam giác đều bằng nhau + 3 hình chữ nhật'],
    rtri: ['Right-angled triangular prism', 'Lăng trụ tam giác vuông', () => prismZ([[-1, -0.9], [1.2, -0.9], [-1, 1]], 1.2), [5, 6, 9], '2 tam giác vuông bằng nhau + 3 hình chữ nhật'],
    trap: ['Trapezoidal prism', 'Lăng trụ đáy hình thang', () => prismZ([[-1.3, -0.8], [1.3, -0.8], [0.7, 0.8], [-0.7, 0.8]], 1.1), [6, 8, 12], '2 hình thang bằng nhau + 4 hình chữ nhật'],
    pent: ['Pentagonal prism', 'Lăng trụ ngũ giác', () => prismZ(reg2(5, 1.15, Math.PI / 2), 1), [7, 10, 15], '2 ngũ giác bằng nhau + 5 hình chữ nhật'],
    hex: ['Hexagonal prism', 'Lăng trụ lục giác', () => prismZ(reg2(6, 1.15, 0), 1), [8, 12, 18], '2 lục giác bằng nhau + 6 hình chữ nhật'],
    tet: ['Tetrahedron', 'Tứ diện (chóp đáy tam giác)', () => ({ V: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], F: [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]] }), [4, 4, 6], '4 mặt là tam giác đều bằng nhau'],
    pyr: ['Square-based pyramid', 'Hình chóp tứ giác đều', () => pyrY(4, 1.35, 0.9, 1.1, Math.PI / 4), [5, 5, 8], '1 hình vuông + 4 tam giác bằng nhau'],
    oct: ['Octahedron', 'Bát diện đều', () => ({ V: [[1.3, 0, 0], [-1.3, 0, 0], [0, 1.3, 0], [0, -1.3, 0], [0, 0, 1.3], [0, 0, -1.3]], F: [[0, 2, 4], [0, 2, 5], [0, 3, 4], [0, 3, 5], [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5]] }), [8, 6, 12], '8 mặt là tam giác đều bằng nhau'],
    cyl: ['Cylinder', 'Hình trụ', () => prismY(40, 1, 1.1, true), null, '2 mặt phẳng hình tròn + 1 mặt cong · 2 cạnh · 0 đỉnh'],
    cone: ['Cone', 'Hình nón', () => pyrY(40, 1.15, 1, 1.25, 0, true), null, '1 mặt phẳng hình tròn + 1 mặt cong · 1 cạnh · 1 đỉnh'],
    sph: ['Sphere', 'Hình cầu', () => sphere(), null, '1 mặt cong · 0 cạnh · 0 đỉnh'],
  };
  APP.viz.solids = function (el, opts = {}) {
    const f = VZ.frame(el, 'Khối 3D — kéo để xoay, bấm để xem hình chiếu', { icon: 'atom' });
    const box = h('div', { style: { position: 'relative', height: 'min(72vw, 330px)', touchAction: 'none', borderRadius: '14px', overflow: 'hidden', background: 'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--sc) 14%, transparent), transparent 70%)' } }); f.stage.append(box);
    let key = opts.key || 'hex', mesh = SOLIDS[key][2](); let yaw = 0.6, pitch = 0.45, auto = true, drag = null, viewName = '';
    const hue = { cube: 210, cuboid: 190, tri: 30, rtri: 15, trap: 280, pent: 140, hex: 260, tet: 0, pyr: 45, oct: 320, cyl: 175, cone: 350, sph: 225 };
    const lp = VZ.canvasLoop(box, (c, w, hh) => {
      if (auto && !drag) yaw += 0.008;
      c.clearRect(0, 0, w, hh); const sc = Math.min(w, hh) * 0.26; const cb = Math.cos(yaw), sb = Math.sin(yaw), ca = Math.cos(pitch), sa = Math.sin(pitch);
      const P = mesh.V.map(([x, y, z]) => { const x1 = x * cb + z * sb, z1 = -x * sb + z * cb; const y2 = y * ca - z1 * sa, z2 = y * sa + z1 * ca; return [x1, y2, z2]; });
      const L = [-0.35, 0.6, 0.72]; const S = new Set(mesh.S || []); const ink = VZ.css('--ink') || '#222';
      const order = mesh.F.map((fc, i) => [i, U.mean(fc.map((k) => P[k][2]))]).sort((a, b) => a[1] - b[1]);
      order.forEach(([i]) => { const fc = mesh.F[i]; const a = P[fc[0]], b = P[fc[1]], d = P[fc[2]]; const u1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v1 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]]; let nx = u1[1] * v1[2] - u1[2] * v1[1], ny = u1[2] * v1[0] - u1[0] * v1[2], nz = u1[0] * v1[1] - u1[1] * v1[0]; const nl = Math.hypot(nx, ny, nz) || 1; const br = 0.3 + 0.65 * Math.abs((nx * L[0] + ny * L[1] + nz * L[2]) / nl);
        c.beginPath(); fc.forEach((k, j) => { const X = w / 2 + P[k][0] * sc, Y = hh / 2 - P[k][1] * sc; j ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); const fill = `hsl(${hue[key]} 70% ${22 + 50 * br}%)`; c.fillStyle = fill; c.fill(); if (S.has(i)) { c.strokeStyle = fill; c.lineWidth = 1; } else { c.strokeStyle = ink; c.lineWidth = 2; c.lineJoin = 'round'; } c.stroke(); });
      if (viewName) { c.fillStyle = ink; c.font = '800 15px Lexend, sans-serif'; c.textAlign = 'left'; c.fillText(viewName, 12, 24); }
    });
    const cv = lp.cv; cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); drag = [e.clientX, e.clientY]; auto = false; viewName = ''; });
    cv.addEventListener('pointermove', (e) => { if (!drag) return; yaw += (e.clientX - drag[0]) * 0.01; pitch = Math.max(-1.57, Math.min(1.57, pitch + (e.clientY - drag[1]) * 0.01)); drag = [e.clientX, e.clientY]; });
    const up = () => (drag = null); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    function goView(ty, tp, name) { auto = false; const y0 = ((yaw % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI, p0 = pitch; yaw = y0; viewName = name; SFX.play('whoosh'); VZ.animate(700, (e) => { yaw = y0 + (ty - y0) * e; pitch = p0 + (tp - p0) * e; }); }
    function info() { const [en, vi, , fve, txt] = SOLIDS[key]; f.out.innerHTML = `<b>${en}</b> (${vi}): ${txt}${fve ? ` · <b>${fve[0]}</b> mặt (faces), <b>${fve[1]}</b> đỉnh (vertices), <b>${fve[2]}</b> cạnh (edges) · Euler: ${fve[1]} − ${fve[2]} + ${fve[0]} = <b>${fve[1] - fve[2] + fve[0]}</b>` : ''}`; }
    const keys = opts.keys || Object.keys(SOLIDS);
    const sel = h('select', { class: 'sel', 'aria-label': 'Chọn khối', onchange: (e) => { key = e.target.value; mesh = SOLIDS[key][2](); auto = true; viewName = ''; pitch = 0.45; SFX.play('pop'); info(); } }, keys.map((k) => h('option', { value: k, selected: k === key }, SOLIDS[k][1] + ' — ' + SOLIDS[k][0])));
    f.ctrls.append(sel, VZ.btn('Trên (top)', () => goView(0, Math.PI / 2, 'Top view'), 'btn sm'), VZ.btn('Trước (front)', () => goView(0, 0, 'Front view'), 'btn sm'), VZ.btn('Bên (side)', () => goView(-Math.PI / 2, 0, 'Side view'), 'btn sm'), VZ.btn('Tự xoay', () => { auto = true; viewName = ''; pitch = 0.45; }, 'btn sm ghost'));
    info();
  };
  APP.viz.cubeViews = function (el) {
    const f = VZ.frame(el, 'Xếp khối lập phương và vẽ 3 hình chiếu', { icon: 'grid' });
    const n = 3; let H = [[1, 0, 0], [2, 1, 0], [3, 2, 1]]; // H[x][y], y = 2 is front
    const wrap = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', alignItems: 'center' } }); f.stage.append(wrap);
    const c30 = Math.cos(rad(30)), su = 30;
    function iso() {
      const W = 260, Hh = 230, ox = W / 2, oy = 80; const P = (x, y, z) => [ox + (x - y) * c30 * su, oy + (x + y) * 0.5 * su - z * su]; let g = `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;max-width:280px">`;
      const cubes = []; for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < H[x][y]; z++) cubes.push([x, y, z]); cubes.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2]);
      const poly = (pts, fill) => `<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="var(--ink)" stroke-width="1.3" stroke-linejoin="round"/>`;
      cubes.forEach(([x, y, z]) => { g += poly([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], 'hsl(205 85% 78%)'); g += poly([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], 'hsl(205 70% 50%)'); g += poly([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], 'hsl(205 75% 62%)'); });
      const a = P(0, 3, 0), b = P(3, 3, 0); g += `<text x="${(a[0] + b[0]) / 2 - 18}" y="${(a[1] + b[1]) / 2 + 26}" font-size="12" font-weight="800" fill="var(--ink-2)">FRONT ↗</text>`; const c = P(3, 0, 0), d = P(3, 3, 0); g += `<text x="${(c[0] + d[0]) / 2 + 14}" y="${(c[1] + d[1]) / 2 + 24}" font-size="12" font-weight="800" fill="var(--ink-2)">↖ SIDE</text>`;
      return g + '</svg>';
    }
    const view = (title, cellsOn, cols, rows) => { const cs = 26, W = cols * cs + 8, Hh = rows * cs + 30; let g = `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;max-width:120px"><text x="${W / 2}" y="14" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink-2)">${title}</text>`; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const on = cellsOn(i, j); g += `<rect x="${4 + i * cs}" y="${22 + j * cs}" width="${cs}" height="${cs}" fill="${on ? 'var(--sc)' : 'none'}" stroke="${on ? 'var(--ink)' : 'var(--line)'}" stroke-width="${on ? 1.5 : 0.8}" ${on ? 'style="animation:popIn .3s both"' : ''}/>`; } return g + '</svg>'; };
    const editor = h('div', { class: 'stack', style: { alignItems: 'center', gap: '4px' } });
    function draw() {
      wrap.innerHTML = ''; editor.innerHTML = '';
      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '4px' } });
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) grid.append(h('button', { class: 'btn sm' + (H[x][y] ? ' sc' : ''), style: { width: '40px', height: '40px', padding: 0, fontWeight: 800 }, onclick: () => { H[x][y] = (H[x][y] + 1) % 4; SFX.play(H[x][y] ? 'pop' : 'drop'); draw(); } }, String(H[x][y])));
      editor.append(h('div', { class: 'muted', style: { fontSize: '.8rem', fontWeight: 700 } }, 'Bấm ô = thêm khối (nhìn từ trên)'), grid, h('div', { class: 'muted', style: { fontSize: '.75rem' } }, '↓ phía trước'));
      const views = h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' } });
      const mxF = (x) => Math.max(...H[x]); const mxS = (y) => Math.max(...H.map((c) => c[y]));
      views.innerHTML = view('TOP', (i, j) => H[i][j] > 0, 3, 3) + view('FRONT', (i, j) => mxF(i) > 2 - j, 3, 3) + view('SIDE', (i, j) => mxS(2 - i) > 2 - j, 3, 3);
      wrap.append(editor, h('div', { html: iso(), style: { textAlign: 'center' } }), views);
      f.out.innerHTML = `Tổng số khối: <b>${U.sum(H.flat())}</b>. Hình chiếu từ trước lấy chiều cao lớn nhất của mỗi cột; hình chiếu cạnh nhìn từ bên phải.`;
    }
    f.ctrls.append(VZ.btn('Ngẫu nhiên', () => { H = H.map((c) => c.map(() => R(0, 3))); SFX.play('shuffle' in SFX ? 'whoosh' : 'whoosh'); draw(); }, 'btn sm'), VZ.btn('Xoá', () => { H = H.map((c) => c.map(() => 0)); draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.kaleido = function (el) {
    const f = VZ.frame(el, 'Kính vạn hoa: vẽ một nét — đối xứng vẽ phần còn lại', { icon: 'spark' });
    const S = 640; const cv = h('canvas', { width: S, height: S, style: { width: '100%', maxWidth: '440px', aspectRatio: '1', display: 'block', margin: '0 auto', borderRadius: '18px', background: '#0b1020', touchAction: 'none', cursor: 'crosshair' } }); f.stage.append(cv);
    const c = cv.getContext('2d'); let n = 6, mirror = true, hue = 0, last = null;
    const loc = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * S - S / 2, ((e.clientY - r.top) / r.height) * S - S / 2]; };
    function seg(a, b) { hue = (hue + 1.5) % 360; c.strokeStyle = `hsl(${hue} 95% 64%)`; c.lineWidth = 4; c.lineCap = 'round'; c.shadowColor = c.strokeStyle; c.shadowBlur = 8; for (let k = 0; k < n; k++) for (const m of mirror ? [1, -1] : [1]) { c.save(); c.translate(S / 2, S / 2); c.rotate((k * 2 * Math.PI) / n); c.scale(1, m); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.restore(); } }
    function clear() { c.shadowBlur = 0; c.fillStyle = '#0b1020'; c.fillRect(0, 0, S, S); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; for (let k = 0; k < n * (mirror ? 2 : 1); k++) { const a = (k * Math.PI) / (mirror ? n : n / 2); c.beginPath(); c.moveTo(S / 2, S / 2); c.lineTo(S / 2 + S * Math.cos(a), S / 2 + S * Math.sin(a)); c.stroke(); } out(); }
    function out() { f.out.innerHTML = mirror ? `Hình có <b>${n}</b> trục đối xứng và đối xứng quay bậc <b>${n}</b>.` : `Không có trục đối xứng (tắt gương) nhưng vẫn đối xứng quay bậc <b>${n}</b>.`; }
    function auto() { clear(); let p = [R(20, 60), R(-10, 10)]; let ang = Math.random() * 6; for (let i = 0; i < 160; i++) { ang += (Math.random() - 0.5) * 0.9; const q = [p[0] + Math.cos(ang) * 9, p[1] + Math.sin(ang) * 9]; if (Math.hypot(q[0], q[1]) > 290) ang += Math.PI; else { seg(p, q); p = q; } } SFX.play('whoosh'); }
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); last = loc(e); });
    cv.addEventListener('pointermove', (e) => { if (!last) return; const p = loc(e); seg(last, p); last = p; });
    const end = () => (last = null); cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    const mb = VZ.btn('Gương: BẬT', () => { mirror = !mirror; mb.textContent = 'Gương: ' + (mirror ? 'BẬT' : 'TẮT'); clear(); }, 'btn sm ghost');
    f.ctrls.append(VZ.range('Số phần', 2, 12, n, 1, (v) => { n = v; clear(); }), mb, VZ.btn('Vẽ ngẫu nhiên ✨', auto, 'btn sm sc'), VZ.btn('Xoá', clear, 'btn sm ghost'));
    clear(); auto();
  };
  APP.viz.heroSymmetry = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      const g = c.createRadialGradient(w * 0.7, hh * 0.5, 10, w * 0.7, hh * 0.5, Math.max(w, hh)); g.addColorStop(0, '#2a1b5e'); g.addColorStop(1, '#0a0f24'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
      const cx = w * 0.72, cy = hh * 0.5, R0 = Math.min(w, hh) * 0.42; const n = 8;
      for (let layer = 0; layer < 4; layer++) { const r = R0 * (1 - layer * 0.22); for (let k = 0; k < n; k++) for (const m of [1, -1]) { c.save(); c.translate(cx, cy); c.rotate((k * 2 * Math.PI) / n + t * 0.12 * (layer % 2 ? -1 : 1)); c.scale(1, m); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(r * 0.5, r * (0.25 + 0.08 * Math.sin(t + layer)), r, 0); c.strokeStyle = `hsla(${(layer * 70 + t * 30) % 360} 90% 65% / .85)`; c.lineWidth = 2.5; c.stroke(); c.restore(); } }
      c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill();
    });
  };

  /* ---------- question helpers ---------- */
  const symQ = (key, what) => { const [en, , pts] = CAT[key]; const sy = symOf(pts); return what === 'lines' ? num(`How many lines of symmetry does this ${en} have?`, sy.lines.length, `The ${en} has ${sy.lines.length} line${sy.lines.length === 1 ? '' : 's'} of symmetry (order of rotational symmetry ${sy.order}).`, { fig: shapeFig(pts) }) : num(`What is the order of rotational symmetry of this ${en}?`, sy.order, `In one full turn, the ${en} looks exactly the same ${sy.order} time${sy.order === 1 ? '' : 's'}.`, { fig: shapeFig(pts) }); };
  function patternGen(n) {
    const c0 = (n - 1) / 2; const groups = { D4: [(x, y) => [x, y], (x, y) => [2 * c0 - x, y], (x, y) => [x, 2 * c0 - y], (x, y) => [y, x], (x, y) => [2 * c0 - y, 2 * c0 - x], (x, y) => [2 * c0 - y, x], (x, y) => [y, 2 * c0 - x], (x, y) => [2 * c0 - x, 2 * c0 - y]], V: [(x, y) => [x, y], (x, y) => [2 * c0 - x, y]], D2: [(x, y) => [x, y], (x, y) => [2 * c0 - x, y], (x, y) => [x, 2 * c0 - y], (x, y) => [2 * c0 - x, 2 * c0 - y]], C2: [(x, y) => [x, y], (x, y) => [2 * c0 - x, 2 * c0 - y]], C4: [(x, y) => [x, y], (x, y) => [2 * c0 - y, x], (x, y) => [2 * c0 - x, 2 * c0 - y], (x, y) => [y, 2 * c0 - x]], Dg: [(x, y) => [x, y], (x, y) => [y, x]] };
    const G = groups[pick(Object.keys(groups))]; const cells = {}; const k = R(2, 3);
    for (let i = 0; i < k; i++) { const x = R(0, n - 1), y = R(0, n - 1), col = pick([1, 2]); G.forEach((T) => { const [u, v] = T(x, y); cells[u + ',' + v] = col; }); }
    return cells;
  }
  const svgCircleLines = () => { const O = [150, 115], r = 78; let g = `<svg viewBox="0 0 300 230" width="300" style="max-width:100%"><circle cx="${O[0]}" cy="${O[1]}" r="${r}" fill="none" stroke="var(--ink)" stroke-width="2.5"/><circle cx="${O[0]}" cy="${O[1]}" r="3" fill="var(--ink)"/>`; const P = (a) => [O[0] + r * Math.cos(rad(a)), O[1] - r * Math.sin(rad(a))];
    const tan = (a, L, lab) => { const p = P(a), t = [Math.sin(rad(a)), Math.cos(rad(a))]; g += `<line x1="${p[0] - 60 * t[0]}" y1="${p[1] - 60 * t[1]}" x2="${p[0] + 60 * t[0]}" y2="${p[1] + 60 * t[1]}" stroke="var(--stats)" stroke-width="2.5"/><text x="${p[0] + 66 * t[0]}" y="${p[1] + 66 * t[1] + 5}" font-weight="800" font-size="15" text-anchor="middle" fill="var(--ink)">${lab}</text>`; };
    const ch = (a, b, lab) => { const p = P(a), q = P(b); g += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="var(--number)" stroke-width="2.5"/><text x="${(p[0] + q[0]) / 2}" y="${(p[1] + q[1]) / 2 - 6}" font-weight="800" font-size="15" text-anchor="middle" fill="var(--ink)">${lab}</text>`; };
    tan(130, 60, 'A'); ch(160, 30, 'B'); ch(200, 300, 'C'); tan(0, 60, 'D'); ch(240, 60, 'E'); tan(270, 60, 'F'); return g + '</svg>'; };
  const viewsFig = (top, front, side) => { const cell = (t, inner) => `<g><rect x="0" y="0" width="90" height="90" rx="8" fill="var(--surface)" stroke="var(--line)"/>${inner}<text x="45" y="106" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink-2)">${t}</text></g>`; return `<svg viewBox="0 0 300 112" width="300" style="max-width:100%"><g transform="translate(2,0)">${cell('Top', top)}</g><g transform="translate(105,0)">${cell('Front', front)}</g><g transform="translate(208,0)">${cell('Side', side)}</g></svg>`; };
  const V = { circle: '<circle cx="45" cy="45" r="30" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/>', circleDot: '<circle cx="45" cy="45" r="30" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/><circle cx="45" cy="45" r="3" fill="var(--ink)"/>', tri: '<polygon points="45,14 76,76 14,76" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/>', rect: '<rect x="20" y="16" width="50" height="60" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/>', wide: '<rect x="12" y="28" width="66" height="36" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/>', sqX: '<rect x="16" y="16" width="58" height="58" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/><path d="M16 16L74 74M74 16L16 74" stroke="var(--ink)" stroke-width="1.5"/>', rectMid: '<rect x="12" y="20" width="66" height="50" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/><line x1="12" y1="45" x2="78" y2="45" stroke="var(--ink)" stroke-width="1.5"/>', square: '<rect x="16" y="16" width="58" height="58" fill="var(--sc-soft)" stroke="var(--ink)" stroke-width="2"/>' };
  const prismQ = (n, nm) => fill(`Complete the facts for a ${nm} (the cross-section has ${n} sides).`, [n + 2, 2 * n, 3 * n], `Faces = ${n} rectangles + 2 ends = ${n + 2}; vertices = 2 × ${n} = ${2 * n}; edges = 3 × ${n} = ${3 * n}.`, { f: 'Faces: [] &nbsp; Vertices: [] &nbsp; Edges: []' });
  function congruentSet() {
    const base = pick([[[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2]], [[0, 0], [4, 0], [3, 2], [1, 3]], [[0, 0], [3, 0], [4, 2], [0, 1]], [[0, 0], [2, 0], [2, 1], [4, 1], [4, 2], [0, 2]]]);
    const rot = (P, a) => P.map(([x, y]) => [x * Math.cos(rad(a)) - y * Math.sin(rad(a)), x * Math.sin(rad(a)) + y * Math.cos(rad(a))]);
    const cands = [[rot(base, 90), true], [base.map(([x, y]) => [-x, y]), true], [rot(base, 180), true], [base.map(([x, y]) => [x * 1.4, y * 1.4]), false], [base.map(([x, y]) => [x * 1.35, y]), false], [rot(base.map(([x, y]) => [x, y * 0.6]), 90), false]];
    const pickC = shuffle(cands).slice(0, 4); const labs = ['B', 'C', 'D', 'E'];
    const fig = `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">${shapeFig(base, { W: 120, H: 100, label: 'A', fill: 'color-mix(in srgb, var(--number) 30%, transparent)' })}${pickC.map((c, i) => shapeFig(c[0], { W: 120, H: 100, label: labs[i] })).join('')}</div>`;
    const ans = pickC.map((c, i) => (c[1] ? i : -1)).filter((i) => i >= 0); if (!ans.length) return null;
    return multi('Which of the shapes B, C, D and E are congruent to shape A?', labs, ans, 'Congruent shapes are identical in shape and size — they may be rotated or flipped. Shapes that are bigger, stretched or squashed are not congruent.', { fig, fixed: true });
  }

  APP.addUnit({
    n: 8, strand: 'geometry', title: 'Shapes and symmetry', vi: 'Hình dạng và tính đối xứng',
    blurb: 'Throughout history, symmetry has been an important part of the design of everyday objects. The Alhambra Palace in Granada, Spain, built in the thirteenth century, is full of symmetrical designs — from the gardens and buildings to the tile patterns on the walls.',
    blurbVi: 'Chương này học đối xứng trục và đối xứng quay của hình phẳng, các phần của đường tròn, đa giác đều, hình bằng nhau (congruent) và các khối 3D cùng hình chiếu của chúng.',
    words: [['line symmetry', 'đối xứng trục'], ['line of symmetry', 'trục đối xứng'], ['rotational symmetry', 'đối xứng quay'], ['order of rotational symmetry', 'bậc đối xứng quay'], ['full turn', 'một vòng quay (360°)'], ['horizontal', 'nằm ngang'], ['vertical', 'thẳng đứng'], ['diagonal', 'đường chéo'], ['centre', 'tâm'], ['radius', 'bán kính'], ['diameter', 'đường kính'], ['chord', 'dây cung'], ['tangent', 'tiếp tuyến'], ['circumference', 'đường tròn / chu vi hình tròn'], ['regular polygon', 'đa giác đều'], ['irregular polygon', 'đa giác không đều'], ['congruent', 'bằng nhau (cùng hình dạng và kích thước)'], ['corresponding sides', 'các cạnh tương ứng'], ['corresponding angles', 'các góc tương ứng'], ['orientation', 'hướng đặt'], ['face', 'mặt'], ['edge', 'cạnh'], ['vertex', 'đỉnh'], ['vertices', 'các đỉnh'], ['prism', 'hình lăng trụ'], ['pyramid', 'hình chóp'], ['top view', 'hình chiếu từ trên'], ['front view', 'hình chiếu từ trước'], ['side view', 'hình chiếu từ bên'], ['sketch', 'vẽ phác'], ['visualise', 'hình dung']],
    chat: ['Hình bình hành có trục đối xứng không?', 'Tiếp tuyến khác dây cung thế nào?', 'Lăng trụ lục giác có bao nhiêu cạnh?'],
    sections: [
      {
        id: '8.1', t: 'Identifying the symmetry of 2D shapes', vi: 'Nhận biết tính đối xứng của hình phẳng',
        goals: ['identify the reflective symmetry of 2D shapes and patterns', 'identify the order of rotational symmetry of 2D shapes and patterns.'],
        body: [
          ['p', 'A 2-dimensional (2D) shape might have <b>line symmetry</b> and it might have <b>rotational symmetry</b>. When you fold a shape along a line of symmetry, one half fits exactly on top of the other half. You can use dashed lines to show lines of symmetry.'],
          ['p', 'The <b>order of rotational symmetry</b> is the number of times a shape looks the same as it is rotated through one full turn. A rectangle has two lines of symmetry (one horizontal, one vertical) and rotational symmetry of order 2.'],
          ['viz', 'symLab'],
          ['ex', { t: 'Worked example 8.1', q: 'For each shape write down i the number of lines of symmetry ii the order of rotational symmetry. a a rhombus &nbsp; b a parallelogram', fig: `<div style="display:flex;gap:8px;justify-content:center">${shapeFig(CAT.rhombus[2], { W: 140, H: 120, label: 'a' })}${shapeFig(CAT.parallelogram[2], { W: 160, H: 120, label: 'b' })}</div>`, steps: ['a i: <b>two</b> lines of symmetry — the two diagonals.', 'a ii: <b>order 2</b> — in one full turn it looks the same twice: after 180° and again after 360°.', 'b i: <b>no</b> lines of symmetry — it is not possible to fold a parallelogram onto itself.', 'b ii: <b>order 2</b> — the same after 180° and after 360°.'] }],
          ['table', ['Shape', 'Lines of symmetry', 'Order of rotational symmetry'], [['square', '4', '4'], ['rectangle', '2', '2'], ['rhombus', '2', '2'], ['parallelogram', '0', '2'], ['kite', '1', '1'], ['trapezium', '0', '1'], ['isosceles trapezium', '1', '1'], ['equilateral triangle', '3', '3'], ['isosceles triangle', '1', '1'], ['scalene triangle', '0', '1'], ['circle', 'infinitely many', 'infinite']]],
          ['viz', 'tilePattern'],
          ['vi', ['Trục đối xứng: gấp hình theo trục thì hai nửa trùng khít nhau.', 'Bậc đối xứng quay: số lần hình trông y hệt ban đầu khi quay đủ một vòng 360°. Mọi hình đều có bậc ít nhất là 1.', 'Hình bình hành: 0 trục nhưng bậc quay 2. Hình cánh diều: 1 trục, bậc 1.', 'Đa giác đều n cạnh: n trục đối xứng, bậc quay n.']],
        ],
        bank: [
          fill('Complete the table of symmetry properties of quadrilaterals (lines of symmetry, then order of rotational symmetry).', [4, 4, 2, 2, 2, 2, 0, 2, 1, 1, 0, 1, 1, 1], 'Parallelogram: no lines but order 2. Kite and isosceles trapezium: one line, order 1.', { f: 'square [] , [] &nbsp; rectangle [] , [] &nbsp; rhombus [] , [] &nbsp; parallelogram [] , [] &nbsp; kite [] , [] &nbsp; trapezium [] , [] &nbsp; isosceles trapezium [] , []', d: 2 }),
          fill('For each triangle write the number of lines of symmetry and the order of rotational symmetry.', [3, 3, 1, 1, 0, 1, 1, 1], 'Only the equilateral triangle has rotational symmetry of order more than 1.', { f: 'equilateral [] , [] &nbsp; isosceles [] , [] &nbsp; scalene [] , [] &nbsp; right-angled isosceles [] , []' }),
          mcq('How many lines of symmetry does a circle have?', ['Infinitely many', '1', '2', '360'], 0, 'Every diameter is a line of symmetry — and there are infinitely many diameters.', { fixed: true }),
          mcq('What is the order of rotational symmetry of a circle?', ['Infinite — it looks the same at every angle', '1', '2', '360'], 0, 'However much you rotate a circle about its centre, it looks the same.'),
          symQ('kite', 'lines'), symQ('parallelogram', 'order'), symQ('arrow', 'lines'), symQ('plus', 'order'), symQ('sShape', 'lines'), symQ('star5', 'lines'),
          sort('Sort the capital letters by their symmetry.', ['Line symmetry only', 'Rotational symmetry only', 'Both', 'Neither'], [['A', 0], ['M', 0], ['T', 0], ['E', 0], ['N', 1], ['S', 1], ['Z', 1], ['H', 2], ['O', 2], ['X', 2], ['F', 3], ['G', 3], ['R', 3]], 'N, S and Z look the same after a half turn but cannot be folded onto themselves. H, O and X have both.', { d: 2 }),
          tf('A parallelogram has two lines of symmetry.', false, 'A parallelogram has no lines of symmetry, but it has rotational symmetry of order 2.'),
          tf('Every shape has rotational symmetry of at least order 1.', true, 'Every shape looks the same after a full turn of 360°.'),
          mcq('Song has five red tiles and four white tiles. He makes a 3 by 3 square with rotational symmetry of order 4. Where must one red tile go?', ['In the centre', 'In a corner', 'In the middle of an edge', 'It does not matter'], 0, 'The centre tile stays in place when you rotate. The other 8 tiles move in groups of 4, so the 4 white tiles fill one group (e.g. the corners) and 4 red tiles fill the other group.', { d: 3 }),
          mcq('A designer wants a logo with exactly 3 lines of symmetry and rotational symmetry of order 3. Which shape should she use?', ['Equilateral triangle', 'Square', 'Isosceles triangle', 'Rectangle'], 0, 'An equilateral triangle has 3 lines and order 3.', { app: true }),
          gen(() => symQ(pick(Object.keys(CAT)), pick(['lines', 'order']))),
          gen(() => { const n = pick([4, 5]); const cells = patternGen(n); const sy = symCells(cells); return fill('Look at the tile pattern.', [sy.lines.length, sy.order], `The pattern has ${sy.lines.length} line${sy.lines.length === 1 ? '' : 's'} of symmetry and rotational symmetry of order ${sy.order}.`, { f: 'Number of lines of symmetry: [] &nbsp; Order of rotational symmetry: []', fig: cellsFig(cells, n), d: 2 }); }),
          gen(() => { const n = R(3, 12); return fill(`A regular polygon has ${n} sides.`, [n, n], `A regular polygon with ${n} sides has ${n} lines of symmetry and rotational symmetry of order ${n}.`, { f: 'Lines of symmetry: [] &nbsp; Order of rotational symmetry: []' }); }),
        ],
      },
      {
        id: '8.2', t: 'Circles and polygons', vi: 'Đường tròn và đa giác',
        goals: ['name the parts of a circle', 'identify, describe and sketch regular polygons.'],
        body: [
          ['p', 'You already know the <b>centre</b>, <b>radius</b>, <b>diameter</b> and <b>circumference</b> of a circle. A <b>chord</b> is a straight line that starts and finishes on the circumference. If the chord passes through the centre, it is a diameter. A <b>tangent</b> is a straight line that touches the circumference at only one point.'],
          ['viz', 'circleLab'],
          ['ex', { t: 'Worked example 8.2', q: 'For the diagram, write down the letters of the lines that are a tangents b chords.', fig: svgCircleLines(), steps: ['a <b>A, D, F</b> — these touch the circumference at only one point.', 'b <b>B, C, E</b> — these start and finish on the circumference.'] }],
          ['p', 'A <b>regular polygon</b> has all sides the same length and all angles the same size. For example, a regular pentagon has five equal sides, five equal angles, five lines of symmetry and rotational symmetry of order 5.'],
          ['viz', 'regPoly'],
          ['ex', { t: 'Worked example 8.3', q: 'a Sketch a regular octagon. b Describe its properties.', fig: shapeFig(CAT.oct[2], { W: 150, H: 150 }), steps: ['A regular octagon has: eight sides the same length', 'eight angles the same size', 'eight lines of symmetry', 'rotational symmetry of order 8.'] }],
          ['tip', 'The angle between a tangent and the radius at the point where they meet is always 90°.'],
          ['vi', ['Dây cung (chord): nối hai điểm trên đường tròn. Đường kính là dây cung dài nhất, đi qua tâm.', 'Tiếp tuyến (tangent): chạm đường tròn tại đúng 1 điểm; vuông góc với bán kính tại điểm đó.', 'Đường kính không bao giờ là tiếp tuyến vì nó cắt đường tròn tại 2 điểm.', 'Đa giác đều n cạnh: n cạnh bằng nhau, n góc bằng nhau, n trục, bậc quay n; chia được thành n tam giác cân bằng nhau từ tâm.']],
        ],
        bank: [
          multi('Which lines are tangents to the circle?', ['A', 'B', 'C', 'D', 'E', 'F'], [0, 3, 5], 'Tangents touch the circle at exactly one point: A, D and F.', { fig: svgCircleLines(), fixed: true }),
          multi('Which lines are chords of the circle?', ['A', 'B', 'C', 'D', 'E', 'F'], [1, 2, 4], 'Chords start and finish on the circumference: B, C and E.', { fig: svgCircleLines(), fixed: true }),
          match('Match each part of a circle to its description.', [['radius', 'from the centre to the circumference'], ['diameter', 'a chord through the centre'], ['chord', 'joins two points on the circumference'], ['tangent', 'touches the circle at one point'], ['circumference', 'the distance around the circle']], 'Learn these five words — they appear in many exam questions.'),
          num('Draw a tangent and a radius that meet on the circumference. What is the angle between them?', 90, 'The angle between a tangent and a radius is always 90°.', { unit: '°' }),
          tf('The diameter of a circle is also a chord of the circle.', true, 'It starts and finishes on the circumference, so it is a chord (the longest one).'),
          tf('A diameter can be a tangent to the circle.', false, 'A diameter meets the circle at two points, but a tangent touches at only one point.'),
          mcq('What is the longest chord in a circle?', ['The diameter', 'The radius', 'A tangent', 'The circumference'], 0, 'The diameter passes through the centre and is the longest chord.'),
          fill('Complete the properties of a regular decagon.', [10, 10, 10, 10], 'A decagon has 10 sides.', { f: 'A regular decagon has: [] sides the same length; [] angles the same size; [] lines of symmetry; rotational symmetry of order [].' }),
          fill('Zara divides regular polygons into identical triangles from the centre. Complete the table.', [5, 6, 7, 8, 9, 10], 'The number of identical triangles equals the number of sides.', { f: 'pentagon [] &nbsp; hexagon [] &nbsp; heptagon [] &nbsp; octagon [] &nbsp; nonagon [] &nbsp; decagon []' }),
          mcq('Zara says: “It is possible to draw four tangents to a circle that make a trapezium.” Is she correct?', ['Yes — an isosceles trapezium can have all four sides touching the circle', 'No — four tangents always make a square', 'No — tangents can never be parallel', 'No — only three tangents fit around a circle'], 0, 'Draw two parallel tangents (top and bottom), then two sloping tangents — they make an isosceles trapezium.', { d: 3 }),
          tf('If the three corners of a triangle lie on a circle and one side is a diameter, the triangle is right-angled.', true, 'This is a famous fact (Thales’ theorem). Try it with the chord tool!', { d: 3 }),
          mcq('A bicycle wheel has metal spokes from the hub (centre) to the rim. Each spoke is like a …', ['radius', 'diameter', 'tangent', 'chord'], 0, 'From the centre to the circumference = radius.', { app: true }),
          mcq('A straight road just touches a circular roundabout at one point. The road is like a …', ['tangent', 'chord', 'radius', 'diameter'], 0, 'It touches the circle at one point only.', { app: true }),
          gen(() => { const n = R(3, 12); const nm = { 3: 'equilateral triangle', 4: 'square', 5: 'regular pentagon', 6: 'regular hexagon', 7: 'regular heptagon', 8: 'regular octagon', 9: 'regular nonagon', 10: 'regular decagon', 11: 'regular 11-sided polygon', 12: 'regular dodecagon' }[n]; return fill(`Describe the properties of a ${nm}.`, [n, n, n, n], `A ${nm} has ${n} equal sides, ${n} equal angles, ${n} lines of symmetry and rotational symmetry of order ${n}.`, { f: '[] equal sides &nbsp; [] equal angles &nbsp; [] lines of symmetry &nbsp; order of rotational symmetry []', fig: shapeFig(regular(n), { W: 140, H: 130 }) }); }),
          gen(() => { const r = R(3, 25); return num(`A circle has radius ${r} cm. What is the length of the longest chord?`, 2 * r, `The longest chord is the diameter = 2 × ${r} = ${2 * r} cm.`, { unit: 'cm' }); }),
        ],
      },
      {
        id: '8.3', t: 'Recognising congruent shapes', vi: 'Nhận biết hình bằng nhau',
        goals: ['identify congruent shapes.'],
        body: [
          ['p', 'Shapes that are identical in shape and size are <b>congruent</b>. In congruent shapes, <b>corresponding sides</b> are equal and <b>corresponding angles</b> are equal. Congruent shapes may be in a different <b>orientation</b> — rotated or flipped over.'],
          ['tip', 'When an angle is described using three letters, the middle letter tells you the angle: ∠LMN is the angle at vertex M.'],
          ['viz', 'congruent'],
          ['ex', { t: 'Worked example 8.4', q: 'Triangles ABC and JKL are congruent. AB = 5.1 cm, BC = 10.9 cm, ∠BAC = 108°, ∠ABC = 45°, ∠ACB = 27°. In triangle JKL, ∠K = 27° and ∠L = 45°. i Write down the lengths of BC and JL. ii What are the sizes of ∠BAC and ∠KLJ?', fig: FIG.geo.polyPts([[0, 0], [10.9, 0], [10.9 - 8.2 * Math.cos(rad(27)), 8.2 * Math.sin(rad(27))]], { labels: ['45°', '27°', '108°'], names: ['B', 'C', 'A'], sides: ['10.9 cm', '', '5.1 cm'], W: 340, H: 200 }), steps: ['The triangles are congruent but in a different orientation. Match the equal angles: A ↔ J (108°), B ↔ L (45°), C ↔ K (27°).', 'BC and LK are corresponding sides, so <b>BC = 10.9 cm</b>; JL corresponds to AB, so <b>JL = 5.1 cm</b>.', '<b>∠BAC = 108°</b>; ∠KLJ corresponds to ∠CBA, so <b>∠KLJ = 45°</b>.'] }],
          ['vi', ['Hai hình bằng nhau (congruent): cùng hình dạng VÀ cùng kích thước; có thể bị xoay hoặc lật.', 'Cạnh tương ứng bằng nhau, góc tương ứng bằng nhau.', 'Ghép các góc bằng nhau trước để tìm đỉnh tương ứng.', 'Hai hình bằng nhau thì có cùng chu vi và cùng diện tích.', 'Cùng góc nhưng khác cỡ (ví dụ hai tam giác đều to nhỏ) thì KHÔNG bằng nhau.']],
        ],
        bank: [
          fill('Triangles ABC and JKL are congruent (see Worked example 8.4: AB = 5.1 cm, BC = 10.9 cm, ∠A = 108°, ∠B = 45°, ∠C = 27°; in JKL, ∠K = 27°, ∠L = 45°).', [10.9, 5.1, 108, 45], 'A ↔ J, B ↔ L, C ↔ K.', { f: 'LK = [] cm &nbsp; JL = [] cm &nbsp; ∠LJK = []° &nbsp; ∠KLJ = []°', d: 2 }),
          fill('Rectangle ABCD is congruent to rectangle EFGH. AB = 8 cm and BC = 3 cm.', [8, 3], 'EF corresponds to AB and FG corresponds to BC.', { f: 'EF = [] cm &nbsp; FG = [] cm' }),
          fill('Triangle ABC is congruent to triangle DEF. AB = 5 cm, BC = 12 cm, AC = 13 cm, ∠ABC = 90° and ∠ACB = 23°.', [5, 12, 67, 67, 23], '∠BAC = 180° − 90° − 23° = 67°. A ↔ D, B ↔ E, C ↔ F.', { f: 'DE = [] cm &nbsp; EF = [] cm &nbsp; ∠BAC = []° &nbsp; ∠EDF = []° &nbsp; ∠DFE = []°', fig: FIG.geo.polyPts([[0, 0], [12, 0], [0, 5]], { labels: ['90°', '23°', ''], names: ['B', 'C', 'A'], sides: ['12 cm', '13 cm', '5 cm'], W: 320, H: 170 }), d: 2 }),
          match('Triangle PQR is congruent to triangle XYZ (P ↔ X, Q ↔ Y, R ↔ Z). Match the corresponding parts.', [['side PQ', 'side XY'], ['side QR', 'side YZ'], ['side PR', 'side XZ'], ['∠PQR', '∠XYZ']], 'Keep the letters in the same order.'),
          mcq('Sofia draws two triangles with angles 95°, 62°, 23° and 57°, 42°, 81°. She says they are congruent. Without knowing any side lengths, how do you know she is wrong?', ['The angles are different, so the shapes are different', 'Triangles can never be congruent', 'The side lengths must be different', 'She cannot be wrong'], 0, 'Congruent shapes have equal corresponding angles. These angles are different.'),
          tf('All equilateral triangles are congruent, because all their angles are 60°.', false, 'Equilateral triangles can be different sizes — same shape but not the same size.'),
          mcq('Two triangles both have sides 7.1 cm, 9.5 cm and 5.3 cm. Sofia says they are congruent. Zara says you can’t tell because you don’t know the angles. Who is correct?', ['Sofia — three equal sides fix the triangle', 'Zara — you need the angles', 'Neither', 'Both'], 0, 'If all three sides are equal, the triangles must be identical (you can only make one triangle with three given sides).', { d: 2 }),
          tf('Congruent shapes always have the same perimeter and the same area.', true, 'They are identical in size, so their perimeters and areas are equal.'),
          gen(congruentSet), gen(congruentSet),
          mcq('A floor is covered with tiles that are all congruent. What does this tell you?', ['Every tile is identical in shape and size', 'The tiles are all squares', 'The tiles are all the same colour', 'The tiles have the same perimeter but different areas'], 0, 'Congruent = identical in shape and size.', { app: true }),
        ],
      },
      {
        id: '8.4', t: '3D shapes', vi: 'Các khối 3D',
        goals: ['identify and describe 3D shapes', 'draw front, side and top views of 3D shapes.'],
        body: [
          ['p', 'You must be able to identify and describe the properties of a 3D shape. For example, a cuboid has six faces, eight vertices, twelve edges and all angles are right angles. Remember that the <b>vertices</b> are the corners of a shape.'],
          ['viz', 'solids'],
          ['p', 'You must also be able to visualise and draw a 3D shape from different directions. The <b>top view</b> (plan) is the view from above; the <b>front view</b> is from the front; the <b>side view</b> is from the side. A cylinder looks like a circle from above, but like a rectangle from the front and the side.'],
          ['ex', { t: 'Worked example 8.5', q: 'I have eight faces: two are congruent regular hexagons and six are congruent rectangles. I have twelve vertices and eighteen edges. What shape am I? Describe the three views.', steps: ['Two hexagon faces are the front and back; six rectangles join them → <b>hexagonal prism</b>.', '6 vertices at the front + 6 at the back = 12; 6 + 6 + 6 joining edges = 18.', 'Front view: a hexagon. Top view: one complete rectangle with two narrower rectangles either side. Side view: two rectangles.'] }],
          ['viz', 'cubeViews'],
          ['table', ['Prism', 'Faces', 'Vertices', 'Edges'], [['triangular', '5', '6', '9'], ['rectangular (cuboid)', '6', '8', '12'], ['pentagonal', '7', '10', '15'], ['hexagonal', '8', '12', '18'], ['n-sided base', 'n + 2', '2n', '3n']]],
          ['vi', ['Mặt (face), cạnh (edge), đỉnh (vertex — số nhiều vertices).', 'Lăng trụ có đáy n cạnh: n + 2 mặt, 2n đỉnh, 3n cạnh (luôn là bội của 3).', 'Hình chiếu: từ trên (top/plan), từ trước (front), từ bên (side).', 'Hình lập phương và hình cầu có ba hình chiếu giống nhau.', 'Công thức Euler cho khối đa diện: Đỉnh − Cạnh + Mặt = 2.']],
        ],
        bank: [
          match('Match each description with the name of the 3D shape.', [['2 congruent circle faces, 1 curved surface, 2 edges', 'cylinder'], ['4 congruent equilateral triangle faces, 6 edges', 'tetrahedron'], ['only one curved surface, no edges or vertices', 'sphere'], ['7 faces: 2 pentagons and 5 rectangles', 'pentagonal prism']], 'Count faces, edges and vertices carefully.'),
          fill('Write down the properties of a cube.', [6, 8, 12], 'A cube has 6 square faces, 8 vertices and 12 edges.', { f: 'Faces: [] &nbsp; Vertices: [] &nbsp; Edges: []' }),
          prismQ(7, 'heptagonal prism'), prismQ(8, 'octagonal prism'),
          mcq('Marcus says: “The number of faces of a prism is two more than the number of sides of the original shape.” Is this true for every prism?', ['Yes — one rectangle for each side, plus the front and back', 'No — only for triangular prisms', 'No — it is three more', 'Only for even numbers of sides'], 0, 'An n-sided base gives n rectangles + 2 end faces = n + 2.'),
          fill('Write the general rules for a prism whose cross-section has n sides.', [{ expr: '2n' }, { expr: '3n' }, 3], 'Vertices: n at the front + n at the back. Edges: n + n + n joining edges.', { f: 'number of vertices = [] &nbsp; number of edges = [] &nbsp; The number of edges of a prism is always a multiple of [].', d: 2 }),
          mcq('Which 3D shape has these views?', ['Cone', 'Cylinder', 'Square-based pyramid', 'Sphere'], 0, 'A circle from above (with the point in the middle) and triangles from the front and side.', { fig: viewsFig(V.circleDot, V.tri, V.tri), fixed: true }),
          mcq('Which 3D shape has these views?', ['Cylinder', 'Cone', 'Cuboid', 'Sphere'], 0, 'A circle from above, rectangles from the front and side.', { fig: viewsFig(V.circle, V.rect, V.rect), fixed: true }),
          mcq('Which 3D shape has these views?', ['Square-based pyramid', 'Cube', 'Tetrahedron', 'Triangular prism'], 0, 'A square with diagonals from above, triangles from the front and side.', { fig: viewsFig(V.sqX, V.tri, V.tri), fixed: true }),
          mcq('Which 3D shape has these views?', ['Triangular prism', 'Square-based pyramid', 'Cone', 'Cuboid'], 0, 'Lying on a rectangular face: a triangle from the front, rectangles from above and the side.', { fig: viewsFig(V.rectMid, V.tri, V.wide), fixed: true, d: 2 }),
          multi('Which 3D shapes have the same top view, front view and side view?', ['cube', 'sphere', 'cylinder', 'cone', 'cuboid'], [0, 1], 'Cube: three squares. Sphere: three circles.', { d: 2 }),
          mcq('I have eight faces: two congruent regular hexagons and six congruent rectangles. What shape am I?', ['hexagonal prism', 'octahedron', 'hexagonal pyramid', 'octagonal prism'], 0, 'Two hexagons joined by six rectangles.'),
          tf('A cone has one vertex.', true, 'The apex (point) of the cone is its only vertex.'),
          tf('A cylinder has two vertices.', false, 'A cylinder has 2 edges (the circles) but no vertices.'),
          num('Check Euler’s formula for a square-based pyramid: work out vertices − edges + faces.', 2, '5 − 8 + 5 = 2. This works for every polyhedron without holes!', { d: 3 }),
          num('A chocolate box is shaped like a triangular prism. How many separate faces of card are needed to make it?', 5, '2 triangles + 3 rectangles = 5 faces.', { app: true }),
          gen(() => { const n = R(3, 12); const nm = { 3: 'triangular', 4: 'rectangular', 5: 'pentagonal', 6: 'hexagonal', 7: 'heptagonal', 8: 'octagonal', 9: 'nonagonal', 10: 'decagonal', 11: '11-sided', 12: 'dodecagonal' }[n] + ' prism'; return prismQ(n, nm); }),
          gen(() => { const k = pick(['cube', 'cuboid', 'tri', 'pent', 'hex', 'tet', 'pyr', 'oct']); const [en, , , fve] = SOLIDS[k]; const w = R(0, 2); return num(`How many ${['faces', 'vertices', 'edges'][w]} does a ${en.toLowerCase()} have?`, fve[w], `A ${en.toLowerCase()} has ${fve[0]} faces, ${fve[1]} vertices and ${fve[2]} edges.`); }),
        ],
      },
    ],
    explore: {
      title: 'Symmetry: nature’s favourite pattern', hero: 'heroSymmetry',
      lead: 'Snowflakes, starfish, flowers, footballs, palace walls and the logos on your phone — symmetry is everywhere. Scientists even use it to predict new particles in physics.',
      leadVi: 'Bông tuyết, sao biển, bông hoa, quả bóng và hoa văn cung điện Alhambra — đối xứng có mặt khắp nơi trong tự nhiên, nghệ thuật và khoa học.',
      cards: [
        { t: 'Make a kaleidoscope', p: 'A kaleidoscope uses mirrors to copy one small picture around a centre. With n mirror sections you get n lines of symmetry and rotational symmetry of order n. Draw on the dark circle!', viz: 'kaleido' },
        { t: 'The Alhambra tile challenge', p: 'Artists in the Alhambra built amazing patterns from simple tiles. Mathematicians later proved that there are exactly 17 different kinds of repeating wallpaper pattern — and many of them appear on the palace walls. Can you complete all five challenges?', viz: 'tilePattern' },
        { t: 'The five perfect solids', p: 'Only five 3D shapes have faces that are all the same regular polygon, with the same number meeting at every vertex: the tetrahedron, cube, octahedron, dodecahedron and icosahedron. Turn them and count: vertices − edges + faces = 2 every time (Euler’s formula).', viz: 'solids' },
        { t: 'Why are snowflakes six-sided?', p: 'Water molecules join together in a hexagon pattern when they freeze. That is why almost every snowflake has six arms and rotational symmetry of order 6 — even though no two snowflakes are exactly alike.', viz: 'regPoly' },
      ],
      facts: [['6', 'arms on a snowflake', 'Ice crystals grow in a hexagonal pattern.'], ['5', 'Platonic solids', 'Euclid proved there are only five perfect solids.'], ['17', 'wallpaper groups', 'There are exactly 17 kinds of repeating pattern on a flat surface.'], ['V − E + F = 2', 'Euler’s formula', 'True for every convex polyhedron.']],
      challenge: { t: 'The football puzzle', p: 'A classic football is made from 12 regular pentagons and 20 regular hexagons. Every edge is shared by two faces and three faces meet at every vertex. How many edges and vertices does it have? Check with Euler’s formula.', a: 'Faces = 32. Edges = (12 × 5 + 20 × 6) ÷ 2 = 180 ÷ 2 = 90. Vertices = 180 ÷ 3 = 60. Check: 60 − 90 + 32 = 2 ✓' },
    },
    reading: {
      title: 'The Five Perfect Solids', sub: 'A short history of the Platonic solids. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'More than 2000 years ago, Greek thinkers were fascinated by shapes that were perfectly regular. A solid is called a Platonic solid if all of its faces are the same regular polygon and the same number of faces meet at every vertex. There are only five of them: the tetrahedron, the cube, the octahedron, the dodecahedron and the icosahedron.',
        'The solids are named after the philosopher Plato, who lived in Athens around 400 BCE. Plato believed that everything in the world was made from four elements. He linked the tetrahedron with fire, the cube with earth, the octahedron with air and the icosahedron with water. The fifth solid, the dodecahedron, was linked with the whole universe.',
        'About a hundred years later, the mathematician Euclid wrote a famous book called the Elements. At the very end of the book, he proved that there cannot be a sixth Platonic solid. The reason is simple: at each vertex the angles of the faces must add up to less than 360 degrees, and this only works for five combinations.',
        'Much later, in 1596, the astronomer Johannes Kepler tried to explain the distances between the planets using the five solids placed one inside another. His idea was wrong, but his careful measurements later helped him discover the true laws of planetary motion.',
        'Today, Platonic solids are all around us. Many board games use dice shaped like all five solids, with 4, 6, 8, 12 or 20 faces. Scientists have also found that some viruses and tiny sea creatures have the shape of an icosahedron, because it is a strong way to build a closed shell from identical pieces.',
      ],
      gloss: [['fascinated', 'say mê'], ['philosopher', 'nhà triết học'], ['element', 'nguyên tố'], ['astronomer', 'nhà thiên văn học'], ['planetary motion', 'chuyển động của các hành tinh'], ['shell', 'lớp vỏ']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Which solid did Plato link with water?', opts: ['icosahedron', 'cube', 'tetrahedron', 'octahedron'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'What did Euclid prove?', opts: ['There are only five Platonic solids', 'The Earth goes round the Sun', 'A cube has six faces', 'Viruses are icosahedrons'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'Why are some viruses shaped like an icosahedron?', opts: ['It is a strong way to build a closed shell from identical pieces', 'It is the smallest solid', 'It has the most vertices', 'It looks like a dice'], a: 0, ex: 'Paragraph E.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'Plato lived in Athens.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'Kepler’s idea about the solids and the planets was correct.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: '“His idea was wrong”.' },
          { type: 'mcq', q: 'Euclid also wrote books about music.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'Not mentioned.' },
        ] },
        { title: 'Match and order', qs: [
          { type: 'match', q: 'Match each solid with the element Plato linked it to.', a: [['tetrahedron', 'fire'], ['cube', 'earth'], ['octahedron', 'air'], ['dodecahedron', 'the universe']], ex: 'Paragraph B.' },
          { type: 'order', q: 'Put the events in time order (earliest first).', a: ['Plato links the solids with the elements', 'Euclid proves there are only five', 'Kepler uses the solids to model the planets', 'Scientists find icosahedral viruses'], ex: '400 BCE → about 300 BCE → 1596 → modern times.' },
          { type: 'fill', q: 'Complete.', f: 'The angles at each vertex must add up to less than [] degrees. Kepler’s planet model was in the year []. The dice in board games have 4, 6, 8, 12 or [] faces.', a: [360, 1596, 20], ex: 'Paragraphs C, D, E.' },
        ] },
      ],
    },
    listening: {
      title: 'Designing a club badge', intro: 'Linh and Sam are designing a badge for their maths club. Listen and answer.',
      voices: { Linh: 'glassy', Sam: 'rounded' },
      lines: [
        { spk: 'Linh', text: 'Sam, the art teacher wants our new maths club badge to have lots of symmetry. Any ideas?' },
        { spk: 'Sam', text: 'What about a five-pointed star? It has five lines of symmetry and rotational symmetry of order five.' },
        { spk: 'Linh', text: 'Nice, but our club has six members. Maybe a regular hexagon, with one side for each of us.' },
        { spk: 'Sam', text: 'Good idea. A regular hexagon has six lines of symmetry and rotational symmetry of order six. We could put a circle in the middle.' },
        { spk: 'Linh', text: 'A circle has infinitely many lines of symmetry, so it won’t spoil the design.' },
        { spk: 'Sam', text: 'But if we write the word MATHS across the badge, we lose most of the symmetry.' },
        { spk: 'Linh', text: 'True. The letter M only has one vertical line of symmetry, and the letter S has none at all.' },
        { spk: 'Sam', text: 'Then let’s write the word on a ribbon below the badge. The badge can be eight centimetres wide.' },
        { spk: 'Linh', text: 'Perfect. I’ll draw it on isometric paper tonight and we can show the teacher on Friday.' },
      ],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Which shape do they choose for the badge?', opts: ['a regular hexagon', 'a five-pointed star', 'a circle', 'a square'], a: 0, ex: '“Maybe a regular hexagon … Good idea.”' },
          { type: 'mcq', q: 'Why did Linh suggest a hexagon?', opts: ['The club has six members', 'It is easy to draw', 'The teacher likes hexagons', 'It has no symmetry'], a: 0, ex: '“our club has six members”.' },
          { type: 'mcq', q: 'Where will they write the word MATHS?', opts: ['on a ribbon below the badge', 'across the middle', 'inside the circle', 'on the back'], a: 0, ex: '“write the word on a ribbon below the badge”.' },
        ] },
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'A five-pointed star has [] lines of symmetry. A regular hexagon has rotational symmetry of order []. The badge will be [] cm wide. They will show the teacher on [].', a: [5, 6, 8, ['Friday']], ex: 'Lines 2, 4, 8 and 9.' },
          { type: 'tf', q: 'The letter S has one line of symmetry.', a: false, ex: '“the letter S has none at all”.' },
        ] },
      ],
    },
  });
})();
