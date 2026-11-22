/* Unit 5 — Angles and constructions  (+ shared geometry figure helpers FIG.geo) */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, gen } = Q;
  const T = FIG.T; const rad = (d) => (d * Math.PI) / 180; const deg = (r) => (r * 180) / Math.PI;
  const COLS = ['var(--bad)', 'var(--number)', 'var(--geometry)', 'var(--stats)', 'var(--algebra)', 'var(--accent)'];

  /* ================= shared geometry figures (math coords: y up; mapped to SVG) ================= */
  const geo = {};
  const u = (d) => [Math.cos(rad(d)), Math.sin(rad(d))];
  function arcPts(cx, cy, r, a1, a2, n = 16) { const out = []; for (let i = 0; i <= n; i++) { const a = a1 + ((a2 - a1) * i) / n; out.push([cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))]); } return out; }
  // map helper: build an svg string from primitives defined in math coords
  function canvas(W, H, prims, o = {}) {
    let xs = [], ys = []; prims.forEach((p) => (p.pts || []).forEach(([x, y]) => { xs.push(x); ys.push(y); }));
    const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const pad = o.pad || 34; const sc = Math.min((W - 2 * pad) / (maxx - minx || 1), (H - 2 * pad) / (maxy - miny || 1));
    const ox = (W - (maxx - minx) * sc) / 2, oy = (H - (maxy - miny) * sc) / 2;
    const X = (x) => ox + (x - minx) * sc, Y = (y) => oy + (maxy - y) * sc;
    let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:${o.max || W}px">`;
    prims.forEach((p) => {
      if (p.k === 'poly') g += `<polygon points="${p.pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="${p.fill || 'color-mix(in srgb, var(--sc) 16%, transparent)'}" stroke="${p.stroke || 'var(--sc)'}" stroke-width="${p.w || 2.5}" stroke-linejoin="round"/>`;
      else if (p.k === 'line') g += `<polyline points="${p.pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'var(--ink-2)'}" stroke-width="${p.w || 2.5}" ${p.dash ? 'stroke-dasharray="6 5"' : ''} stroke-linecap="round" stroke-linejoin="round"/>`;
      else if (p.k === 'sector') g += `<polygon points="${p.pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="${p.fill}" stroke="none"/>`;
      else if (p.k === 'text') g += T(X(p.pts[0][0]), Y(p.pts[0][1]) + 5, p.t, { fs: p.fs || 15, w: p.bold === false ? 500 : 800, c: p.c || 'var(--ink)' });
      else if (p.k === 'dot') g += `<circle cx="${X(p.pts[0][0])}" cy="${Y(p.pts[0][1])}" r="${p.r || 4}" fill="${p.c || 'var(--ink)'}"/>`;
      else if (p.k === 'arrow') { const [[x1, y1], [x2, y2]] = p.pts; const a = Math.atan2(Y(y2) - Y(y1), X(x2) - X(x1)); const mx = (X(x1) + X(x2)) / 2, my = (Y(y1) + Y(y2)) / 2; for (let i = 0; i < (p.n || 1); i++) { const ex = mx + Math.cos(a) * (i * 9), ey = my + Math.sin(a) * (i * 9); g += `<path d="M${ex - 9 * Math.cos(a - 0.5)} ${ey - 9 * Math.sin(a - 0.5)} L${ex} ${ey} L${ex - 9 * Math.cos(a + 0.5)} ${ey - 9 * Math.sin(a + 0.5)}" fill="none" stroke="${p.c || 'var(--ink-2)'}" stroke-width="2.2"/>`; } }
    });
    return g + '</svg>';
  }
  function angleMark(V, d1, size, r, label, col, prims, lr) {
    if (Math.abs(size - 90) < 0.01 && !lr) { const a = [V[0] + r * 0.55 * u(d1)[0], V[1] + r * 0.55 * u(d1)[1]]; const b = [a[0] + r * 0.55 * u(d1 + 90)[0], a[1] + r * 0.55 * u(d1 + 90)[1]]; const c = [V[0] + r * 0.55 * u(d1 + 90)[0], V[1] + r * 0.55 * u(d1 + 90)[1]]; prims.push({ k: 'line', pts: [a, b, c], stroke: col, w: 2 }); }
    else { const pts = arcPts(V[0], V[1], r, d1, d1 + size); prims.push({ k: 'sector', pts: [V, ...pts], fill: `color-mix(in srgb, ${col} 22%, transparent)` }, { k: 'line', pts, stroke: col, w: 2 }); }
    if (label != null && label !== '') { const m = d1 + size / 2; const rr = r * (size < 40 ? 2.15 : 1.6) + r * 0.08 * String(label).length; prims.push({ k: 'text', pts: [[V[0] + rr * Math.cos(rad(m)), V[1] + rr * Math.sin(rad(m))]], t: label, c: col }); }
  }
  // angles around a point / on a straight line. o.start (deg), o.line (draw a full straight line), o.R
  geo.around = function (angles, labels = [], o = {}) {
    const prims = []; const V = [0, 0], L = 10; let d = o.start != null ? o.start : 90; const sumA = U.sum(angles);
    const isLine = Math.abs(sumA - 180) < 0.01;
    if (isLine) prims.push({ k: 'line', pts: [[-L, 0], [L, 0]], w: 3 }), (d = 0);
    angles.forEach((a, i) => { const r0 = 2.6 + (a < 35 ? 1.2 : 0); angleMark(V, d, a, r0, labels[i] != null ? labels[i] : a + '°', COLS[i % COLS.length], prims); if (!(isLine && (i === 0))) prims.push({ k: 'line', pts: [V, [L * u(d)[0], L * u(d)[1]]], w: 3 }); d += a; });
    if (!isLine) prims.push({ k: 'line', pts: [V, [L * u(d)[0], L * u(d)[1]]], w: 3 });
    prims.push({ k: 'dot', pts: [V] });
    if (isLine) prims.push({ k: 'line', pts: [[-L, 0], [L, 0]], w: 3 });
    return canvas(o.W || 360, isLine ? (o.H || 200) : (o.H || 300), prims, { max: o.max || 360 });
  };
  // two intersecting lines; theta = angle a (between dir 0 and theta). labels [a,b,c,d] anticlockwise from first
  geo.cross = function (theta, labels = [], o = {}) {
    const prims = []; const V = [0, 0], L = 10, r0 = o.rot || 0; const dirs = [r0, r0 + theta, r0 + 180, r0 + 180 + theta]; const sizes = [theta, 180 - theta, theta, 180 - theta];
    dirs.forEach((d, i) => { if (labels[i] !== null && labels[i] !== undefined) angleMark(V, d, sizes[i], 2.4, labels[i], COLS[i], prims); });
    prims.push({ k: 'line', pts: [[L * u(r0)[0], L * u(r0)[1]], [-L * u(r0)[0], -L * u(r0)[1]]], w: 3 }, { k: 'line', pts: [[L * u(r0 + theta)[0], L * u(r0 + theta)[1]], [-L * u(r0 + theta)[0], -L * u(r0 + theta)[1]]], w: 3 }, { k: 'dot', pts: [V] });
    return canvas(o.W || 340, o.H || 230, prims, { max: o.max || 320 });
  };
  // two parallel lines + transversal at angle theta (0<theta<180). labels: 8 entries [top TR, TL, BL, BR, bottom TR, TL, BL, BR]
  geo.parallel = function (theta, labels = [], o = {}) {
    const prims = []; const gap = 6, L = 12; const P1 = [gap / Math.tan(rad(theta)) / 2, gap / 2], P2 = [-gap / Math.tan(rad(theta)) / 2, -gap / 2];
    prims.push({ k: 'line', pts: [[-L, gap / 2], [L, gap / 2]], w: 3 }, { k: 'line', pts: [[-L, -gap / 2], [L, -gap / 2]], w: 3 });
    prims.push({ k: 'arrow', pts: [[-L, gap / 2], [-L * 0.45, gap / 2]], n: 2 }, { k: 'arrow', pts: [[-L, -gap / 2], [-L * 0.45, -gap / 2]], n: 2 });
    const ext = 5; prims.push({ k: 'line', pts: [[P2[0] - ext * u(theta)[0], P2[1] - ext * u(theta)[1]], [P1[0] + ext * u(theta)[0], P1[1] + ext * u(theta)[1]]], w: 3 });
    const sizes = [theta, 180 - theta, theta, 180 - theta], dirs = [0, theta, 180, 180 + theta];
    [P1, P2].forEach((P, k) => dirs.forEach((d, i) => { const lb = labels[k * 4 + i]; if (lb !== null && lb !== undefined) angleMark(P, d, sizes[i], 1.6, lb, i % 2 ? 'var(--number)' : 'var(--bad)', prims, true); }));
    if (o.names) { prims.push({ k: 'text', pts: [[-L - 0.8, gap / 2]], t: o.names[0], bold: false }, { k: 'text', pts: [[L + 0.8, gap / 2]], t: o.names[1], bold: false }, { k: 'text', pts: [[-L - 0.8, -gap / 2]], t: o.names[2], bold: false }, { k: 'text', pts: [[L + 0.8, -gap / 2]], t: o.names[3], bold: false }); }
    return canvas(o.W || 400, o.H || 270, prims, { max: o.max || 420 });
  };
  // polygon with given interior angles (anticlockwise). o.lens = first n-2 side lengths; o.labels = angle labels; o.names; o.sides
  geo.poly = function (angles, o = {}) {
    const n = angles.length; const tries = o.lens ? [o.lens] : [[6, 4, 5], [5, 5, 5], [6, 3, 4], [4, 6, 3], [7, 3, 5], [3, 5, 6], [5, 2.5, 6], [4, 4, 7]];
    let pts = null;
    for (const lens of tries) {
      const P = [[0, 0]]; let d = 0; const dirs = [0];
      for (let i = 1; i < n; i++) { d += 180 - angles[i]; dirs.push(d); }
      for (let i = 0; i < n - 2; i++) { const L = lens[i % lens.length]; const p = P[i]; P.push([p[0] + L * u(dirs[i])[0], p[1] + L * u(dirs[i])[1]]); }
      const A = P[n - 2], u1 = u(dirs[n - 2]), u2 = u(dirs[n - 1]); const det = u1[0] * u2[1] - u1[1] * u2[0]; if (Math.abs(det) < 1e-9) continue;
      const bx = -A[0], by = -A[1]; const t = (bx * u2[1] - by * u2[0]) / det, s2 = (u1[0] * by - u1[1] * bx) / det;
      if (t > 0.8 && s2 > 0.8) { P.push([A[0] + t * u1[0], A[1] + t * u1[1]]); pts = P; break; }
    }
    if (!pts) return '';
    return drawPoly(pts, angles, o);
  };
  geo.polyPts = function (pts, o = {}) {
    const n = pts.length; const angles = pts.map((V, i) => { const a = pts[(i + 1) % n], b = pts[(i - 1 + n) % n]; let d = deg(Math.atan2(b[1] - V[1], b[0] - V[0]) - Math.atan2(a[1] - V[1], a[0] - V[0])); if (d < 0) d += 360; return d; });
    return drawPoly(pts, angles, o);
  };
  function drawPoly(pts, angles, o) {
    const n = pts.length;
    const prims = [{ k: 'poly', pts, fill: o.fill }];
    const labels = o.labels || angles.map((a) => Math.round(a) + '°');
    pts.forEach((V, i) => { const prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n]; const dn = deg(Math.atan2(next[1] - V[1], next[0] - V[0])); const lb = labels[i]; if (lb !== null && lb !== undefined && lb !== '') angleMark(V, dn, angles[i], 0.9, lb, COLS[i % COLS.length], prims, o.noRight); if (o.names) { const dp = deg(Math.atan2(prev[1] - V[1], prev[0] - V[0])); const m = dn + angles[i] / 2 + 180; prims.push({ k: 'text', pts: [[V[0] + 0.7 * Math.cos(rad(m)), V[1] + 0.7 * Math.sin(rad(m))]], t: o.names[i], bold: false, c: 'var(--ink-2)' }); } });
    (o.sides || []).forEach((lb, i) => { if (!lb) return; const a = pts[i], b = pts[(i + 1) % n]; const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; const nx = (b[1] - a[1]), ny = -(b[0] - a[0]); const L = Math.hypot(nx, ny) || 1; prims.push({ k: 'text', pts: [[m[0] + (nx / L) * 0.7, m[1] + (ny / L) * 0.7]], t: lb, fs: 13, bold: false, c: 'var(--ink-2)' }); });
    if (o.parallelMarks) o.parallelMarks.forEach(([i, k]) => prims.push({ k: 'arrow', pts: [pts[i], pts[(i + 1) % n]], n: k }));
    return canvas(o.W || 360, o.H || 250, prims, { max: o.max || 360, pad: 40 });
  }
  FIG.geo = geo;

  /* ================= widgets ================= */
  APP.viz.angleSum = function (el) {
    const f = VZ.frame(el, 'Kéo các tia: tổng góc quanh một điểm', { icon: 'target' });
    const W = 420, H = 320, C = [W / 2, H / 2], Rr = 120; const svg = VZ.svg(W, H); f.stage.append(svg);
    let dirs = [20, 130, 215, 300]; let mode = 'point';
    function draw() {
      svg.innerHTML = ''; const ds = mode === 'line' ? [0, dirs[1] % 180 || 60, 180] : dirs.slice().sort((a, b) => a - b);
      const n = mode === 'line' ? 2 : ds.length; const sizes = []; for (let i = 0; i < n; i++) { const a = ds[i], b = mode === 'line' ? ds[i + 1] : (i === n - 1 ? ds[0] + 360 : ds[i + 1]); sizes.push(b - a); }
      sizes.forEach((sz, i) => { const a = ds[i]; const pts = arcPts(0, 0, 48 + i * 6, a, a + sz, 24).map(([x, y]) => [C[0] + x, C[1] - y]); svg.append(s('polygon', { points: [C, ...pts].map((p) => p.join(',')).join(' '), fill: `color-mix(in srgb, ${COLS[i]} 25%, transparent)`, stroke: COLS[i], 'stroke-width': 2 })); const m = a + sz / 2; svg.append(s('text', { x: C[0] + (82 + i * 6) * Math.cos(rad(m)), y: C[1] - (82 + i * 6) * Math.sin(rad(m)) + 5, 'text-anchor': 'middle', 'font-weight': 800, 'font-size': 16, fill: COLS[i], text: Math.round(sz) + '°' })); });
      if (mode === 'line') svg.append(s('line', { x1: C[0] - Rr - 20, y1: C[1], x2: C[0] + Rr + 20, y2: C[1], stroke: 'var(--ink)', 'stroke-width': 3 }));
      ds.forEach((d, i) => { if (mode === 'line' && i !== 1) return; const x = C[0] + Rr * Math.cos(rad(d)), y = C[1] - Rr * Math.sin(rad(d)); svg.append(s('line', { x1: C[0], y1: C[1], x2: x, y2: y, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-linecap': 'round' })); const hd = s('circle', { cx: x, cy: y, r: 13, fill: 'var(--accent)', stroke: '#fff', 'stroke-width': 3, style: 'cursor:grab;touch-action:none' }); svg.append(hd); const idx = mode === 'line' ? 1 : dirs.indexOf(d); VZ.drag(svg, hd, (p) => { let a = deg(Math.atan2(C[1] - p.y, p.x - C[0])); if (a < 0) a += 360; if (mode === 'line') a = Math.max(5, Math.min(175, a)); dirs[idx] = Math.round(a); draw(); }); });
      svg.append(s('circle', { cx: C[0], cy: C[1], r: 5, fill: 'var(--ink)' }));
      const rs = sizes.map((x) => Math.round(x)); f.out.innerHTML = rs.join('° + ') + '° = <b style="color:var(--accent)">' + U.sum(rs) + '°</b> ' + (mode === 'line' ? '(góc trên một đường thẳng)' : '(góc quanh một điểm)');
    }
    f.ctrls.append(VZ.seg([['point', 'Quanh một điểm'], ['line', 'Trên đường thẳng']], mode, (v) => { mode = v; draw(); }), VZ.btn('+ Thêm tia', () => { if (dirs.length < 6 && mode === 'point') { dirs.push(R(0, 359)); draw(); } }, 'btn sm'), VZ.btn('− Bớt tia', () => { if (dirs.length > 2) { dirs.pop(); draw(); } }, 'btn sm ghost'));
    draw();
  };
  APP.viz.quadAngles = function (el) {
    const f = VZ.frame(el, 'Tứ giác: kéo đỉnh, tổng các góc luôn 360°', { icon: 'grid' });
    const W = 460, H = 300; const svg = VZ.svg(W, H); f.stage.append(svg);
    let P = [[90, 240], [380, 250], [330, 70], [130, 90]]; let split = false;
    const ang = (i) => { const a = P[i], b = P[(i + 1) % 4], c = P[(i + 3) % 4]; const v1 = [b[0] - a[0], b[1] - a[1]], v2 = [c[0] - a[0], c[1] - a[1]]; return deg(Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2)))); };
    const convex = () => { let sg = 0; for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4], c = P[(i + 2) % 4]; const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (sg && Math.sign(cr) !== sg) return false; sg = Math.sign(cr); } return true; };
    function draw() {
      svg.innerHTML = ''; svg.append(s('polygon', { points: P.map((p) => p.join(',')).join(' '), fill: 'color-mix(in srgb, var(--geometry) 14%, transparent)', stroke: 'var(--geometry)', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      if (split) { svg.append(s('polygon', { points: [P[0], P[1], P[2]].map((p) => p.join(',')).join(' '), fill: 'color-mix(in srgb, var(--number) 22%, transparent)' }), s('line', { x1: P[0][0], y1: P[0][1], x2: P[2][0], y2: P[2][1], stroke: 'var(--ink-2)', 'stroke-width': 2, 'stroke-dasharray': '7 5' })); }
      const as = [0, 1, 2, 3].map(ang);
      P.forEach((p, i) => { const b = P[(i + 1) % 4], c = P[(i + 3) % 4]; const a1 = Math.atan2(b[1] - p[1], b[0] - p[0]), a2 = Math.atan2(c[1] - p[1], c[0] - p[0]); let m = (a1 + a2) / 2; if (Math.abs(a1 - a2) > Math.PI) m += Math.PI; svg.append(s('text', { x: p[0] + 40 * Math.cos(m), y: p[1] + 40 * Math.sin(m) + 5, 'text-anchor': 'middle', 'font-weight': 800, 'font-size': 15, fill: COLS[i], text: Math.round(as[i]) + '°' })); const hd = s('circle', { cx: p[0], cy: p[1], r: 12, fill: COLS[i], stroke: '#fff', 'stroke-width': 3, style: 'cursor:grab;touch-action:none' }); svg.append(hd); VZ.drag(svg, hd, (q) => { const old = P[i]; P[i] = [Math.max(15, Math.min(W - 15, q.x)), Math.max(15, Math.min(H - 15, q.y))]; if (!convex()) P[i] = old; draw(); }); });
      const r = as.map(Math.round); let tot = U.sum(r); if (tot !== 360) r[3] += 360 - tot; // rounding display fix
      f.out.innerHTML = r.join('° + ') + '° = <b style="color:var(--accent)">360°</b>' + (split ? ' = 2 tam giác × 180°' : '');
    }
    f.ctrls.append(VZ.btn('Chia thành 2 tam giác', () => { split = !split; SFX.play('whoosh'); draw(); }, 'btn sm sc'));
    draw();
  };
  APP.viz.crossLines = function (el) {
    const f = VZ.frame(el, 'Hai đường thẳng cắt nhau: góc đối đỉnh', { icon: 'shuffle' });
    let th = 53; const st = h('div'); f.stage.append(st);
    function draw() { st.innerHTML = geo.cross(th, [th + '°', 180 - th + '°', th + '°', 180 - th + '°'], { max: 380 }); f.out.innerHTML = th === 90 ? 'Bốn góc vuông: hai đường thẳng <b>vuông góc</b> (perpendicular).' : `Góc đối đỉnh bằng nhau: <b>${th}° = ${th}°</b> và <b>${180 - th}° = ${180 - th}°</b>; hai góc kề bù: ${th}° + ${180 - th}° = 180°.`; }
    f.ctrls.append(VZ.range('Góc', 10, 170, th, 1, (v) => { th = v; draw(); }, (v) => v + '°'), VZ.btn('Vuông góc', () => { th = 90; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.parallelT = function (el) {
    const f = VZ.frame(el, 'Hai đường song song và một cát tuyến', { icon: 'chart' });
    let th = 70, show = 'all'; const st = h('div'); f.stage.append(st);
    function draw() {
      const a = th + '°', b = 180 - th + '°'; let lb = [a, b, a, b, a, b, a, b];
      if (show === 'corr') lb = [a, null, null, null, a, null, null, null]; if (show === 'alt') lb = [null, null, a, null, a, null, null, null]; if (show === 'co') lb = [null, null, null, b, a, null, null, null];
      st.innerHTML = geo.parallel(th, lb, { max: 440 });
      f.out.innerHTML = { all: `Chỉ có hai cỡ góc: <b>${a}</b> và <b>${b}</b> (tổng 180°). Bốn góc ở trên giống hệt bốn góc ở dưới.`, corr: 'Góc đồng vị (corresponding): cùng vị trí ở hai giao điểm → bằng nhau.', alt: 'Góc so le trong (alternate): nằm hai bên cát tuyến, giữa hai đường song song → bằng nhau.', co: `Góc trong cùng phía (co-interior): ${a} + ${b} = 180°.` }[show];
    }
    f.ctrls.append(VZ.range('Góc', 25, 155, th, 1, (v) => { th = v; draw(); }, (v) => v + '°'), VZ.seg([['all', 'Tất cả'], ['corr', 'Đồng vị'], ['alt', 'So le'], ['co', 'Cùng phía']], show, (v) => { show = v; draw(); }));
    draw();
  };
  APP.viz.construct = function (el) {
    const f = VZ.frame(el, 'Dựng tứ giác bằng thước và thước đo góc', { icon: 'pencil' });
    const W = 480, H = 300, sc = 42; const A = [150, 270]; const D = [A[0] + 4 * sc, A[1]];
    const Bp = [A[0] + 3 * sc * Math.cos(rad(130)), A[1] - 3 * sc * Math.sin(rad(130))]; const Cp = [D[0] + 6 * sc * Math.cos(rad(180 - 110)), D[1] - 6 * sc * Math.sin(rad(180 - 110))];
    const svg = VZ.svg(W, H); f.stage.append(svg); let k = 0;
    const steps = ['Phác hoạ: AD = 4 cm, AB = 3 cm, DC = 6 cm, góc A = 130°, góc D = 110°.', 'Vẽ đoạn AD dài 4 cm bằng thước kẻ.', 'Đặt tâm thước đo góc tại A, đánh dấu 130°, kẻ tia.', 'Đo 3 cm trên tia, đặt điểm B.', 'Đặt thước đo góc tại D, đánh dấu 110°, kẻ tia; đo 6 cm, đặt điểm C.', 'Nối B với C. Xong! Không cần biết góc B, C hay độ dài BC.'];
    const prot = (P, from, ang) => { const g = s('g', { style: 'animation:popIn .4s both' }); g.append(s('path', { d: `M${P[0] - 70} ${P[1]} A70 70 0 0 1 ${P[0] + 70} ${P[1]} Z`, fill: 'color-mix(in srgb, var(--number) 12%, transparent)', stroke: 'var(--number)', 'stroke-width': 1.5 })); for (let t = 0; t <= 180; t += 10) { const x1 = P[0] + 70 * Math.cos(rad(t)), y1 = P[1] - 70 * Math.sin(rad(t)), x2 = P[0] + (t % 30 ? 63 : 56) * Math.cos(rad(t)), y2 = P[1] - (t % 30 ? 63 : 56) * Math.sin(rad(t)); g.append(s('line', { x1, y1, x2, y2, stroke: 'var(--number)', 'stroke-width': 1.2 })); } const tx = P[0] + 84 * Math.cos(rad(ang)), ty = P[1] - 84 * Math.sin(rad(ang)); g.append(s('circle', { cx: tx, cy: ty, r: 4, fill: 'var(--bad)' }), s('text', { x: tx, y: ty - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: 'var(--bad)', text: from + '°' })); return g; };
    const L = (p, q, col = 'var(--ink)', dash) => s('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': dash ? '6 5' : 'none', style: 'animation:popIn .4s both' });
    const lab = (p, t, dx = 0, dy = 0) => s('text', { x: p[0] + dx, y: p[1] + dy, 'font-weight': 800, 'font-size': 16, fill: 'var(--sc)', text: t });
    function draw() {
      svg.innerHTML = '';
      if (k === 0) { const sk = geo.polyPts([[0, 0], [4, 0], [4 + 6 * Math.cos(rad(70)), 6 * Math.sin(rad(70))], [3 * Math.cos(rad(130)), 3 * Math.sin(rad(130))]], { labels: ['130°', '110°', '', ''], names: ['A', 'D', 'C', 'B'], sides: ['4 cm', '6 cm', '', '3 cm'] }); f.stage.innerHTML = ''; f.stage.append(h('div', { html: sk })); f.out.textContent = steps[0]; return; }
      if (!svg.isConnected) { f.stage.innerHTML = ''; f.stage.append(svg); }
      if (k >= 1) svg.append(L(A, D), lab(A, 'A', -18, 6), lab(D, 'D', 8, 6), s('text', { x: (A[0] + D[0]) / 2, y: A[1] + 22, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--ink-2)', text: '4 cm' }));
      if (k === 2) svg.append(prot(A, 130, 130));
      if (k >= 2) svg.append(L(A, [A[0] + 4.3 * sc * Math.cos(rad(130)), A[1] - 4.3 * sc * Math.sin(rad(130))], 'var(--ink-3)', true));
      if (k >= 3) svg.append(s('circle', { cx: Bp[0], cy: Bp[1], r: 5, fill: 'var(--bad)' }), lab(Bp, 'B', -22, 0), s('text', { x: (A[0] + Bp[0]) / 2 - 26, y: (A[1] + Bp[1]) / 2, 'font-size': 13, fill: 'var(--ink-2)', text: '3 cm' }));
      if (k === 4) svg.append(prot(D, 110, 180 - 110));
      if (k >= 4) svg.append(L(D, Cp, 'var(--ink)'), s('circle', { cx: Cp[0], cy: Cp[1], r: 5, fill: 'var(--bad)' }), lab(Cp, 'C', 8, -4), s('text', { x: (D[0] + Cp[0]) / 2 + 10, y: (D[1] + Cp[1]) / 2, 'font-size': 13, fill: 'var(--ink-2)', text: '6 cm' }));
      if (k >= 5) svg.append(L(Bp, Cp, 'var(--accent)'), s('polygon', { points: [A, D, Cp, Bp].map((p) => p.join(',')).join(' '), fill: 'color-mix(in srgb, var(--geometry) 15%, transparent)' }));
      f.out.textContent = `Bước ${k}: ${steps[k]}`;
    }
    f.ctrls.append(VZ.btn('Bước tiếp ▶', () => { if (k < steps.length - 1) { k++; SFX.play('pop'); draw(); } }, 'btn sm sc'), VZ.btn('Làm lại', () => { k = 0; draw(); }, 'btn sm ghost'));
    draw();
  };
  // explore
  APP.viz.heroAngles = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#0f1a14'; c.fillRect(0, 0, w, hh);
      const r = Math.min(w, hh) / 9; const hx = r * Math.sqrt(3);
      for (let row = -1; row < hh / (r * 1.5) + 1; row++) for (let col = -1; col < w / hx + 1; col++) {
        const cx = col * hx + (row % 2 ? hx / 2 : 0), cy = row * r * 1.5; const ph = Math.sin(t * 1.2 + col * 0.5 + row * 0.7);
        c.beginPath(); for (let i = 0; i < 6; i++) { const a = rad(60 * i + 30); c.lineTo(cx + r * 0.94 * Math.cos(a), cy + r * 0.94 * Math.sin(a)); } c.closePath();
        c.fillStyle = `hsla(${38 + ph * 10},90%,${45 + ph * 12}%,${0.35 + 0.3 * (ph + 1) / 2})`; c.fill(); c.strokeStyle = 'rgba(255,220,120,.5)'; c.lineWidth = 1.5; c.stroke();
      }
      const cx = w * 0.72, cy = hh * 0.5, R0 = Math.min(w, hh) * 0.28; c.lineWidth = 3; ['#ff6b6b', '#4dabf7', '#51cf66'].forEach((col, i) => { const a0 = rad(i * 120 + t * 20); c.fillStyle = col + '55'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R0 * 0.5, a0, a0 + rad(120)); c.closePath(); c.fill(); c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + R0 * Math.cos(a0), cy + R0 * Math.sin(a0)); c.stroke(); });
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(R0 * 0.25)}px Lexend, sans-serif`; c.textAlign = 'center'; c.fillText('3 × 120° = 360°', cx, cy + R0 * 1.25);
    });
  };
  APP.viz.tiling = function (el) {
    const f = VZ.frame(el, 'Ghép đa giác đều quanh một điểm', { icon: 'grid' });
    const polys = { 3: 60, 4: 90, 6: 120, 8: 135, 12: 150, 5: 108 }; const names = { 3: 'tam giác đều', 4: 'hình vuông', 5: 'ngũ giác đều', 6: 'lục giác đều', 8: 'bát giác đều', 12: 'thập nhị giác đều' };
    let set = [6, 6, 6]; const st = h('div'); f.stage.append(st);
    function draw() {
      const W = 360, H = 300, C = [W / 2, H / 2], side = 70; let a0 = 0; let g = `<svg viewBox="0 0 ${W} ${H}" style="max-width:380px">`; const tot = U.sum(set.map((n) => polys[n]));
      set.forEach((n, i) => { const ia = polys[n]; const pts = [C]; let d = a0; let p = C; for (let k = 0; k < n - 1; k++) { p = [p[0] + side * Math.cos(rad(d)), p[1] - side * Math.sin(rad(d))]; pts.push(p); d += 180 - ia; } g += `<polygon points="${pts.map((q) => q.join(',')).join(' ')}" fill="color-mix(in srgb, ${COLS[i % 6]} 35%, transparent)" stroke="${COLS[i % 6]}" stroke-width="2.5" style="animation:popIn .4s ${i * 0.08}s both;transform-origin:${C[0]}px ${C[1]}px"/>`; const m = a0 + ia / 2; g += `<text x="${C[0] + 24 * Math.cos(rad(m))}" y="${C[1] - 24 * Math.sin(rad(m)) + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--ink)">${ia}°</text>`; a0 += ia; });
      g += `<circle cx="${C[0]}" cy="${C[1]}" r="4" fill="var(--ink)"/></svg>`; st.innerHTML = g;
      f.out.innerHTML = set.map((n) => polys[n] + '°').join(' + ') + ` = <b style="color:${tot === 360 ? 'var(--good)' : 'var(--bad)'}">${tot}°</b> ` + (tot === 360 ? '✓ Khít hoàn hảo — lát kín được!' : tot < 360 ? '(còn hở ' + (360 - tot) + '°)' : '(chồng lên nhau!)');
      if (tot === 360) SFX.play('correct');
    }
    f.ctrls.append(...Object.keys(polys).map((n) => VZ.btn('+ ' + names[n], () => { if (set.length < 8) { set.push(+n); draw(); } }, 'btn sm')), VZ.btn('Xoá', () => { set = []; draw(); }, 'btn sm ghost'), VZ.btn('Gợi ý', () => { set = pick([[3, 3, 3, 3, 3, 3], [4, 4, 4, 4], [3, 3, 4, 4, 3], [3, 12, 12], [4, 8, 8], [3, 4, 6, 4], [3, 3, 3, 3, 6]]); draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.billiard = function (el) {
    const f = VZ.frame(el, 'Bi-a: góc tới bằng góc phản xạ', { icon: 'target' });
    const W = 520, H = 280; const svg = VZ.svg(W, H); f.stage.append(svg); let ang = 35, raf;
    function shoot() {
      cancelAnimationFrame(raf); let x = 40, y = 240, vx = Math.cos(rad(ang)), vy = -Math.sin(rad(ang)); const trail = [[x, y]]; let bounces = 0; const t0 = performance.now();
      const tick = () => { for (let k = 0; k < 6; k++) { x += vx * 2.2; y += vy * 2.2; if (x < 20 || x > W - 20) { vx = -vx; trail.push([x, y]); bounces++; SFX.play('tick'); } if (y < 20 || y > H - 20) { vy = -vy; trail.push([x, y]); bounces++; SFX.play('tick'); } }
        svg.innerHTML = `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="16" fill="#1c6b3a" stroke="#5a3a1a" stroke-width="10"/>` + `<polyline points="${[...trail, [x, y]].map((p) => p.join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-dasharray="5 5"/>` + `<circle cx="${x}" cy="${y}" r="9" fill="#fff"/>`;
        if (bounces < 7 && performance.now() - t0 < 9000) raf = requestAnimationFrame(tick); };
      tick(); f.out.innerHTML = `Bắn với góc ${ang}° so với thành bàn. Ở mỗi lần nảy, góc tới = góc phản xạ — các thành đối diện song song nên các góc lặp lại như với cát tuyến.`;
    }
    f.ctrls.append(VZ.range('Góc bắn', 10, 80, ang, 1, (v) => { ang = v; }, (v) => v + '°'), VZ.btn('Bắn! ▶', shoot, 'btn sm sc'));
    VZ.when(svg, shoot);
  };
  APP.viz.divisors360 = function (el) {
    const f = VZ.frame(el, 'Vì sao 360? Chia được cho rất nhiều số!', { icon: 'bulb' });
    const st = h('div'); f.stage.append(st); let n = 6;
    function draw() { const W = 300, C = 150, Rr = 120; let g = `<svg viewBox="0 0 ${W} ${W}" style="max-width:300px">`; for (let i = 0; i < n; i++) { const a1 = (360 / n) * i, a2 = a1 + 360 / n; const pts = arcPts(0, 0, Rr, a1, a2, 20).map(([x, y]) => [C + x, C - y]); g += `<polygon points="${[[C, C], ...pts].map((p) => p.join(',')).join(' ')}" fill="${i % 2 ? 'color-mix(in srgb, var(--geometry) 40%, transparent)' : 'color-mix(in srgb, var(--accent) 40%, transparent)'}" stroke="var(--surface)" stroke-width="2"/>`; } g += '</svg>'; st.innerHTML = g; const divs = U.factors(360); f.out.innerHTML = `360° ÷ ${n} = <b>${N(U.round(360 / n, 2))}°</b> ${360 % n ? '(không nguyên)' : '✓'} · 360 có <b>${divs.length}</b> ước: ${divs.join(', ')}`; }
    f.ctrls.append(VZ.range('Chia thành', 2, 24, n, 1, (v) => { n = v; draw(); }, (v) => v + ' phần'));
    draw();
  };

  /* ================= banks ================= */
  function aroundFig(known, x, line) { const arr = [...known]; const pos = R(0, arr.length); arr.splice(pos, 0, x); const labels = arr.map((v, i) => (i === pos ? 'a' : v + '°')); return geo.around(arr, labels, line ? {} : { start: R(0, 90) }); }
  const aroundQ2 = (known, o = {}) => { const tot = o.line ? 180 : 360; const x = tot - U.sum(known); return num(`Work out the size of the angle marked a.`, x, `${o.line ? 'Angles on a straight line add up to 180°' : 'Angles around a point add up to 360°'}: ${known.join('° + ')}° = ${U.sum(known)}°, so a = ${tot}° − ${U.sum(known)}° = ${x}°.`, Object.assign({ unit: '°', fig: aroundFig(known, x, o.line) }, o)); };
  const quadQ = (angles, miss, o = {}) => { const labels = angles.map((a, i) => (i === miss ? (o.letter || 'x') : a + '°')); const known = angles.filter((_, i) => i !== miss); return num(`Calculate the angle marked ${o.letter || 'x'}.`, angles[miss], `The angles of a quadrilateral add up to 360°. ${known.join('° + ')}° = ${U.sum(known)}°, so ${o.letter || 'x'} = 360° − ${U.sum(known)}° = ${angles[miss]}°.`, Object.assign({ unit: '°', fig: geo.poly(angles, { labels }) }, o)); };
  const triQ = (angles, miss) => { const labels = angles.map((a, i) => (i === miss ? 'B' : a + '°')); const known = angles.filter((_, i) => i !== miss); return num('Calculate the size of angle B in this triangle.', angles[miss], `Angles in a triangle add up to 180°: 180° − ${known.join('° − ')}° = ${angles[miss]}°.`, { unit: '°', fig: geo.poly(angles, { labels }) }); };
  function randQuad() { for (let k = 0; k < 50; k++) { const a = R(50, 140), b = R(50, 140), c = R(50, 140); const d = 360 - a - b - c; if (d > 45 && d < 170) return [a, b, c, d]; } return [90, 100, 80, 90]; }

  APP.addUnit({
    n: 5, strand: 'geometry', title: 'Angles and constructions', vi: 'Góc và dựng hình',
    blurb: 'When you change direction, you turn through an angle. You measure angles in degrees, and a whole turn is 360°. The Babylonians and ancient Egyptians divided a whole turn into 360 parts as long ago as 1500 BCE — perhaps because some calendars had 360 days, and because 360 has so many factors.',
    blurbVi: 'Một vòng quay đầy đủ là 360°. Chương này dùng các tính chất: tổng góc quanh một điểm, tổng góc của tứ giác, góc đối đỉnh, góc tạo bởi đường song song; và dựng đường vuông góc, song song, tứ giác.',
    words: [['angle', 'góc'], ['degree', 'độ'], ['whole turn', 'một vòng đầy đủ'], ['straight line', 'đường thẳng'], ['around a point', 'quanh một điểm'], ['quadrilateral', 'tứ giác'], ['triangle', 'tam giác'], ['intersect', 'cắt nhau'], ['opposite angles', 'góc đối đỉnh'], ['perpendicular', 'vuông góc'], ['parallel', 'song song'], ['transversal', 'đường cắt ngang (cát tuyến)'], ['protractor', 'thước đo góc'], ['set square', 'ê-ke'], ['vertex', 'đỉnh'], ['kite', 'hình diều'], ['parallelogram', 'hình bình hành'], ['trapezium', 'hình thang'], ['rhombus', 'hình thoi'], ['acute', 'nhọn'], ['obtuse', 'tù'], ['reflex', 'góc phản (lớn hơn 180°)']],
    chat: ['Vì sao tổng các góc của tứ giác là 360°?', 'Góc đồng vị và góc so le khác nhau thế nào?', 'Cách dựng đường thẳng song song cách 5 cm'],
    sections: [
      {
        id: '5.1', t: 'A sum of 360°', vi: 'Tổng bằng 360°',
        goals: ['use the fact that the sum of the angles around a point is 360°', 'show and use the fact that the angles of any quadrilateral add up to 360°.'],
        body: [
          ['p', 'You already know that the sum of the angles on a <b>straight line</b> is 180° and the sum of the angles of a <b>triangle</b> is 180°. A whole turn is 360°, so the sum of the angles <b>around a point</b> is 360°.'],
          ['html', `<div class="grid2">${geo.around([45, 72, 63], ['45°', '72°', '63°'])}${geo.around([65, 53, 107, 135], ['65°', '53°', '107°', '135°'])}</div><p class="muted" style="text-align:center">45° + 72° + 63° = 180° &nbsp;·&nbsp; 65° + 53° + 107° + 135° = 360°</p>`],
          ['viz', 'angleSum'],
          ['ex', { t: 'Worked example 5.1', q: 'Here are three angles around a point: 142°, 77° and a. Work out the value of a.', fig: geo.around([142, 77, 141], ['142°', '77°', 'a']), steps: ['142° + 77° = 219°', 'The sum of the three angles is 360°, so a = 360° − 219° = <b>141°</b>'] }],
          ['p', 'A <b>quadrilateral</b> has four straight sides and four angles. You can draw a straight line to divide the quadrilateral into two triangles. The six angles of the two triangles make the angles of the quadrilateral, so the sum is 2 × 180° = <b>360°</b>. This is true for any quadrilateral.'],
          ['viz', 'quadAngles'],
          ['ex', { t: 'Worked example 5.2', q: 'Three of the angles of a quadrilateral are each equal to 85°. Work out the fourth angle.', steps: ['3 × 85° = 255°', 'All four angles add up to 360°, so the fourth angle is 360° − 255° = <b>105°</b>'] }],
          ['ex', { t: 'Worked example 5.3', q: 'This shape is a kite. Calculate the missing angles a and b.', fig: geo.poly([135, 80, 65, 80], { labels: ['135°', '80°', 'b', 'a'], lens: [3, 5] }), steps: ['There is a line of symmetry, so angle a = <b>80°</b>', '135° + 80° + 80° = 295°, so b = 360° − 295° = <b>65°</b>'] }],
          ['vi', ['Tổng các góc trên một đường thẳng = 180°; trong tam giác = 180°.', 'Tổng các góc quanh một điểm = 360°.', 'Tổng các góc trong tứ giác = 360° (chia thành 2 tam giác).', 'Dùng đại số: đặt ẩn cho góc chưa biết, lập phương trình rồi giải.']],
        ],
        bank: [
          aroundQ2([142, 77]), aroundQ2([116, 90]), aroundQ2([55, 130, 90]), aroundQ2([68, 52, 155]),
          aroundQ2([37, 98], { line: true }), aroundQ2([60, 24, 42], { line: true }),
          fill('The angles in each diagram are all the same size. What is the size of each angle?', [72, 45, 60], '360 ÷ 5 = 72; 360 ÷ 8 = 45; 360 ÷ 6 = 60.', { f: 'a 5 equal angles around a point: []° &nbsp; b 8 equal angles around a point: []° &nbsp; c 3 equal angles on a straight line: []°' }),
          num('Three angles of a quadrilateral are 60°, 80° and 110°. Work out the fourth angle.', 110, '60 + 80 + 110 = 250; 360 − 250 = 110.', { unit: '°' }),
          triQ([28, 104, 48], 1), triQ([38, 97, 45], 1),
          quadQ([110, 63, 95, 92], 3), quadQ([100, 40, 120, 100], 2, { letter: 'c' }),
          mcq('Sofia measures three of the angles of a quadrilateral. She says: “The angles are 125°, 160° and 90°.” Why must she have made a mistake?', ['125 + 160 + 90 = 375, which is more than 360', 'A quadrilateral cannot have a right angle', 'The angles must all be acute', 'The angles must be equal'], 0, 'Three angles of a quadrilateral cannot add up to more than 360°.'),
          mcq('All the angles of a quadrilateral are equal. What can you say about the quadrilateral?', ['Each angle is 90°, so it is a rectangle (or a square)', 'It must be a rhombus', 'Each angle is 60°', 'It must be a kite'], 0, '360 ÷ 4 = 90°.'),
          num('One angle of a quadrilateral is 160°. The other angles are all the same size. Work out the size of each of the other angles (to 1 d.p.).', 200 / 3, '(360 − 160) ÷ 3 = 200 ÷ 3 = 66.7°', { unit: '°', tol: 0.06, d: 2 }),
          fill('This shape is a parallelogram with one angle of 68°. Work out angles x, y and z.', [112, 68, 112], 'Opposite angles of a parallelogram are equal; adjacent angles add up to 180°.', { f: 'x = []° &nbsp; y = []° &nbsp; z = []°', fig: geo.poly([68, 112, 68, 112], { labels: ['68°', 'x', 'y', 'z'], lens: [6, 3.5] }), d: 2 }),
          mcq('All the angles of a quadrilateral are multiples of 30° and all the angles are different. Which is the only possible set?', ['30°, 60°, 120°, 150°', '30°, 90°, 90°, 150°', '60°, 90°, 120°, 90°', '30°, 60°, 90°, 180°'], 0, 'The angles must be different multiples of 30° less than 180°: 30 + 60 + 120 + 150 = 360.', { d: 3 }),
          gen(() => { const k = R(2, 3); const known = Array.from({ length: k }, () => R(25, 120)); if (U.sum(known) > 320) return null; return aroundQ2(known); }),
          gen(() => { const known = [R(20, 80), R(20, 70)]; if (U.sum(known) > 160) return null; return aroundQ2(known, { line: true }); }),
          gen(() => { const q = randQuad(); return quadQ(q, R(0, 3)); }),
          gen(() => { const a = R(30, 80), b = R(30, 90); if (a + b > 160) return null; const arr = shuffle([a, b, 180 - a - b]); const miss = R(0, 2); return triQ(arr, miss); }),
          gen(() => { const x = R(15, 40); const k = pick([[2, 3, 4], [1, 2, 3], [2, 2, 5]]); const tot = U.sum(k) * x; if (tot >= 360) return null; const rest = 360 - tot; return num(`Angles around a point are ${k.map((c) => (c === 1 ? 'x' : c + 'x')).join(', ')} and ${rest}°. Find x.`, x, `${U.sum(k)}x + ${rest} = 360 → ${U.sum(k)}x = ${tot} → x = ${x}°.`, { unit: '°', d: 3, fig: geo.around([...k.map((c) => c * x), rest], [...k.map((c) => (c === 1 ? 'x' : c + 'x')), rest + '°']) }); }),
          gen(() => { const k = pick([5, 6, 8, 9, 10, 12]); return num(`A pizza is cut into ${k} equal slices from the centre. What is the angle at the centre of each slice?`, 360 / k, `360° ÷ ${k} = ${360 / k}°.`, { unit: '°', app: true }); }, { app: true }),
        ],
      },
      {
        id: '5.2', t: 'Intersecting lines', vi: 'Các đường thẳng cắt nhau',
        goals: ['recognise the properties of angles on perpendicular lines and intersecting lines', 'recognise the properties of angles on parallel lines.'],
        body: [
          ['p', 'When two lines <b>intersect</b>, <b>opposite angles</b> are equal. In the diagram below, a and c are opposite angles, so a = c. Also b and d are opposite angles, so b = d.'],
          ['viz', 'crossLines'],
          ['ex', { t: 'Worked example 5.4', q: 'Work out angles p, q and r.', fig: geo.cross(53, ['53°', 'p', 'q', 'r']), steps: ['53° and p are angles on a straight line: p = 180° − 53° = <b>127°</b>', '53° and q are opposite angles, so q = <b>53°</b>', 'p and r are opposite angles, so r = <b>127°</b>'] }],
          ['p', 'If the angle between two lines is a right angle, they are <b>perpendicular</b> lines. Two lines that never intersect are <b>parallel</b>; arrows show that lines are parallel. A line that crosses parallel lines is called a <b>transversal</b>. There are only two different sizes of angle: the four angles at the top are the same as the four angles at the bottom.'],
          ['viz', 'parallelT'],
          ['ex', { t: 'Worked example 5.5', q: 'Work out the unknown angles a, b, c and d.', fig: geo.parallel(82, ['82°', 'a', 'd', null, null, 'b', null, 'c']), steps: ['82° and a are angles on a straight line: a = 180° − 82° = <b>98°</b>', '82° and d are opposite angles: d = <b>82°</b>', 'a and b are in the same position at the two crossing points: b = <b>98°</b>', 'c and b are opposite angles: c = <b>98°</b>'] }],
          ['vi', ['Hai đường thẳng cắt nhau: các góc đối đỉnh bằng nhau; hai góc kề bù có tổng 180°.', 'Vuông góc: góc giữa hai đường là 90°.', 'Song song + cát tuyến: góc đồng vị bằng nhau, góc so le trong bằng nhau, hai góc trong cùng phía bù nhau (tổng 180°).', 'Nếu hai góc trong cùng phía không có tổng 180° thì hai đường KHÔNG song song.']],
        ],
        bank: [
          fill('Two straight lines intersect. One of the four angles is 87°. Work out the other three angles (anticlockwise).', [93, 87, 93], 'Opposite angles are equal; angles on a straight line add to 180°.', { f: 'b = []° &nbsp; c = []° &nbsp; d = []°', fig: geo.cross(87, ['87°', 'b', 'c', 'd']) }),
          fill('Work out angles p, q and r.', [66, 66, 114], '180 − 114 = 66.', { f: 'p = []° &nbsp; q = []° &nbsp; r = []°', fig: geo.cross(66, ['p', '114°', 'q', 'r']) }),
          fill('There are two parallel lines in this diagram. One angle is 42°. Work out the angles a, b and c.', [138, 42, 138], 'The angles are either 42° or 180° − 42° = 138°.', { f: 'a = []° &nbsp; b = []° &nbsp; c = []°', fig: geo.parallel(42, ['42°', 'a', null, null, null, 'c', 'b', null]) }),
          fill('Work out the unknown angles a, b and c.', [67, 113, 113], 'Angles at the two crossing points are the same.', { f: 'a = []° &nbsp; b = []° &nbsp; c = []°', fig: geo.parallel(67, [null, '113°', 'a', null, null, 'b', null, 'c']) }),
          fill('Lines WX and YZ are parallel. One angle is 77°. Find a, b and c.', [103, 77, 103], '180 − 77 = 103.', { f: 'a = []° &nbsp; b = []° &nbsp; c = []°', fig: geo.parallel(77, ['77°', 'a', null, null, 'b', null, null, 'c'], { names: ['W', 'X', 'Y', 'Z'] }) }),
          fill('AB and CD are parallel lines. Calculate s and t.', [105, 75], 'Co-interior angles add to 180°: s = 105°; t is in the same position as 75°.', { f: 's = []° &nbsp; t = []°', fig: geo.parallel(75, [null, null, null, 's', '75°', null, null, null].map((x, i) => (i === 0 ? 't' : x)), { names: ['A', 'B', 'C', 'D'] }), d: 2 }),
          mcq('A transversal crosses two lines. The co-interior angles are 56° and 126°. What can you say?', ['The lines are not parallel, because 56° + 126° ≠ 180°', 'The lines are parallel', 'The lines are perpendicular', 'It is impossible to have these angles'], 0, 'For parallel lines, co-interior angles add up to 180°. 56 + 126 = 182.', { d: 2 }),
          fill('This trapezium has a pair of parallel sides. One angle is 45° and another is 110°. Calculate the missing angles.', [135, 70], 'Angles between the parallel sides add to 180°: 180 − 45 = 135, 180 − 110 = 70.', { f: 'x = []° &nbsp; y = []°', fig: geo.poly([45, 135, 70, 110], { labels: ['45°', 'x', 'y', '110°'], lens: [7, 3.5] }), d: 2 }),
          tf('An equilateral triangle (60°), two squares and two more equilateral triangles can fit exactly around a point.', true, '60 + 60 + 60 + 90 + 90 = 360°.'),
          tf('When two lines intersect, opposite angles add up to 180°.', false, 'Opposite angles are EQUAL. Adjacent angles (on a straight line) add up to 180°.'),
          match('Match each angle pair to its rule (parallel lines and a transversal).', [['corresponding angles', 'are equal'], ['co-interior angles', 'add up to 180°'], ['opposite angles', 'are equal (lines cross)'], ['angles on a straight line', 'add up to 180° (any line)']], 'Use the parallel-lines widget to check.'),
          gen(() => { const t = R(25, 155); if (t === 90) return null; const lb = Array(8).fill(null); const known = R(0, 7); const ask = shuffle([0, 1, 2, 3, 4, 5, 6, 7].filter((x) => x !== known)).slice(0, 2); lb[known] = (known % 2 ? 180 - t : t) + '°'; lb[ask[0]] = 'a'; lb[ask[1]] = 'b'; const va = ask[0] % 2 ? 180 - t : t, vb = ask[1] % 2 ? 180 - t : t; return fill('The two lines with arrows are parallel. Work out a and b.', [va, vb], `There are only two sizes of angle here: ${t}° and ${180 - t}° (they add to 180°).`, { f: 'a = []° &nbsp; b = []°', fig: geo.parallel(t, lb) }); }),
          gen(() => { const t = R(20, 160); if (t === 90) return null; const lb = [null, null, null, null]; const k = R(0, 3), q = (k + R(1, 3)) % 4; lb[k] = (k % 2 ? 180 - t : t) + '°'; lb[q] = 'x'; return num('Two straight lines intersect. Find x.', q % 2 ? 180 - t : t, (k - q) % 2 === 0 ? 'Opposite angles are equal.' : 'Angles on a straight line add up to 180°.', { unit: '°', fig: geo.cross(t, lb, { rot: R(-20, 20) }) }); }),
          gen(() => { const x = R(10, 30), k = pick([2, 3, 4]); const a = k * x + 10; if (a >= 180) return null; return num(`Two lines intersect. Opposite angles are (${k}x + 10)° and ${a}°. Find x.`, x, `Opposite angles are equal: ${k}x + 10 = ${a} → ${k}x = ${a - 10} → x = ${x}.`, { d: 3 }); }),
        ],
      },
      {
        id: '5.3', t: 'Drawing lines and quadrilaterals', vi: 'Vẽ đường thẳng và tứ giác',
        goals: ['draw quadrilaterals, perpendicular lines and parallel lines.'],
        body: [
          ['p', 'You can use a ruler and a <b>protractor</b> or a <b>set square</b> to make accurate drawings.'],
          ['list', ['<b>Perpendicular line at a point A</b>: put one edge of the set square on the line and draw along the other edge — or put the centre of the protractor at A with the 90° mark on the line.', '<b>Perpendicular line through a point B</b> (not on the line): slide the set square along the line until its other edge passes through B.', '<b>Parallel line 5 cm away</b>: draw a perpendicular line, measure 5 cm, then draw another perpendicular at that point.']],
          ['p', 'If you want to draw a quadrilateral, you need to know some of the sides and angles. You don’t need to know all of them.'],
          ['viz', 'construct'],
          ['tip', 'Try to draw a quadrilateral with three angles of 120°. What happens? 3 × 120° = 360°, so the fourth angle would be 0° — impossible!'],
          ['vi', ['Dùng ê-ke hoặc thước đo góc (vạch 90°) để kẻ đường vuông góc.', 'Kẻ song song: dựng hai đường vuông góc với đường ban đầu, đo cùng khoảng cách, nối lại.', 'Dựng tứ giác: vẽ cạnh biết độ dài trước, dùng thước đo góc ở hai đầu, đo các cạnh còn lại, nối điểm cuối.', 'Thông thường cần 5 số đo (cạnh/góc) để dựng chính xác một tứ giác.']],
        ],
        bank: [
          order('Put the steps for drawing the quadrilateral in Worked example 5.6 in the correct order.', ['Draw the line AD, 4 cm long', 'Put the protractor at A and draw a line at 130°', 'Measure 3 cm along this line and label the point B', 'Put the protractor at D, draw a line at 110°, measure 6 cm and label C', 'Join points B and C'], 'Start with a line whose length you know.'),
          order('Put the steps for drawing a line parallel to a given line, 5 cm away, in order.', ['Draw a line perpendicular to the given line', 'Measure 5 cm along the perpendicular line and mark a point', 'Draw a line through the point, perpendicular to the second line'], 'A line perpendicular to a perpendicular is parallel to the original line.'),
          mcq('Which instrument do you use to draw an angle of exactly 130°?', ['protractor', 'set square', 'compasses', 'ruler only'], 0, 'A protractor measures and draws angles.'),
          mcq('A set square is most useful for drawing…', ['perpendicular and parallel lines', 'circles', 'angles of 130°', 'curves'], 0, 'A set square has a right angle.'),
          num('Three angles of a quadrilateral are 60°, 75° and 130°. Calculate the fourth angle.', 95, '360 − 60 − 75 − 130 = 95.', { unit: '°' }),
          mcq('Can you draw a quadrilateral where three of the angles are 120°?', ['No — the fourth angle would be 0°', 'Yes — it is a rectangle', 'Yes — the fourth angle is 120°', 'Yes — the fourth angle is 60°'], 0, '3 × 120 = 360, leaving 0° for the fourth angle.'),
          fill('This diagram has two pairs of parallel lines (a parallelogram). One angle is 70°. Find the other three angles, going round from that angle.', [110, 70, 110], 'Co-interior angles add to 180°; opposite angles are equal.', { f: '[]°, []°, []°' }),
          mcq('Which measurements are enough to draw the quadrilateral in Worked example 5.6?', ['AD, AB, DC, angle A and angle D', 'All four sides only', 'All four angles only', 'AD and angle A only'], 0, 'Five measurements: you do not need angles B, C or the length BC.', { d: 2 }),
          tf('Two lines that are both perpendicular to the same line are parallel to each other.', true, 'They both make 90° with the same line, so corresponding angles are equal.'),
          gen(() => { const q = randQuad(); const miss = 3; return num(`Three angles of a quadrilateral are ${q[0]}°, ${q[1]}° and ${q[2]}°. Calculate the fourth angle.`, q[3], `360 − ${q[0]} − ${q[1]} − ${q[2]} = ${q[3]}.`, { unit: '°' }); }),
        ],
      },
    ],
    explore: {
      title: 'Angles that build the world', hero: 'heroAngles',
      lead: 'Bees, tile makers, snooker players and engineers all rely on the same simple facts: angles around a point make 360° and parallel lines repeat their angles.',
      leadVi: 'Ong, thợ lát gạch, người chơi bi-a và kĩ sư đều dùng chung vài sự thật đơn giản về góc.',
      cards: [
        { t: 'Why do bees build hexagons?', p: 'Three regular hexagons meet at every corner of a honeycomb, because 3 × 120° = 360°. Hexagons tile the plane with no gaps and use the least wax for the space they enclose. Try fitting other regular polygons around a point.', viz: 'tiling' },
        { t: 'Why 360 degrees?', p: 'The Babylonians counted in 60s. The number 360 can be divided exactly by 24 different numbers, including 2, 3, 4, 5, 6, 8, 9, 10 and 12. That makes fractions of a turn easy to work with.', viz: 'divisors360' },
        { t: 'Snooker geometry', p: 'When a ball hits a cushion, it bounces off at the same angle. Opposite cushions are parallel, so the path makes the same angles again and again — just like a transversal crossing parallel lines.', viz: 'billiard' },
        { t: 'Roads and railways', p: 'Engineers design crossings using intersecting lines and parallel tracks. Opposite angles at a crossroads are always equal, which helps them plan safe turning lanes.', viz: 'parallelT' },
      ],
      facts: [['1500 BCE', 'Babylon', 'Clay tablets show a whole turn divided into 360 parts.'], ['120°', 'honeycomb', 'Every angle in a bee’s hexagonal cell is 120°.'], ['3', 'regular tilings', 'Only triangles, squares and hexagons can tile a floor on their own.'], ['90°', 'set square', 'A set square always has one right angle, plus 45° or 30° and 60°.']],
      challenge: { t: 'The star puzzle', p: 'A regular five-pointed star is drawn without lifting your pencil. As you draw, you turn the same angle at each of the 5 points and you turn through 720° (two whole turns) in total. What angle do you turn at each point? What is the angle at each tip of the star?', a: 'Turn at each point = 720° ÷ 5 = <b>144°</b>. The angle at each tip is 180° − 144° = <b>36°</b>.' },
    },
    reading: {
      title: 'Why Is a Full Turn 360 Degrees?', sub: 'A history article. Tap any word for a translation.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Have you ever wondered why a full turn is divided into 360 degrees and not 100 or 1000? The answer takes us back more than 3500 years, to the ancient city of Babylon in the land that is now Iraq.',
        'The Babylonians did not count in tens like we usually do. Their number system was based on sixty. We still use their system today when we divide an hour into 60 minutes and a minute into 60 seconds. Sixty is a convenient number because it can be divided exactly by 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30 and 60.',
        'Astronomers in Babylon watched the Sun carefully. They noticed that it seemed to move around the sky in a large circle, and that it took about 360 days to return to the same position among the stars. Some historians believe that this is why they divided the circle into 360 equal parts, so that the Sun moved about one degree each day.',
        'There is also a practical reason. The number 360 has 24 factors, which is unusually many for a number of its size. This means that a half, a third, a quarter, a fifth, a sixth, an eighth, a ninth and a tenth of a turn are all whole numbers of degrees. Builders and navigators found this extremely useful.',
        'Other systems have been tried. During the French Revolution, people suggested dividing a right angle into 100 “grads”, making a full turn 400 grads. Some calculators still have a “grad” setting, but it never became popular. The Babylonian degree has lasted for thousands of years.',
      ],
      gloss: [['ancient', 'cổ đại'], ['convenient', 'tiện lợi'], ['astronomer', 'nhà thiên văn'], ['historian', 'nhà sử học'], ['navigator', 'hoa tiêu'], ['revolution', 'cách mạng']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'The Babylonian number system was based on…', opts: ['sixty', 'ten', 'one hundred', 'twelve'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'According to some historians, the Sun appeared to move about … each day.', opts: ['one degree', 'ten degrees', 'sixty degrees', 'one grad'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'Which of these is NOT given as a reason for using 360?', opts: ['It is easy to write in Roman numerals', 'It has many factors', 'The year was about 360 days', 'Fractions of a turn are whole numbers'], a: 0, ex: 'Roman numerals are not mentioned.' },
        ] },
        { title: 'Match the paragraph to its main idea', qs: [
          { type: 'match', q: 'Match.', a: [['Paragraph B', 'counting in sixties'], ['Paragraph C', 'watching the Sun'], ['Paragraph D', 'the usefulness of factors'], ['Paragraph E', 'an alternative system']], ex: 'Skim each paragraph.' },
        ] },
        { title: 'Short answers', note: 'Use numbers or ONE word.', qs: [
          { type: 'fill', q: 'Complete.', f: 'One hour has [] minutes. 360 has [] factors. A full turn is [] grads. A quarter of a turn is []°.', a: [60, 24, 400, 90], ex: 'Paragraphs B, D and E; 360 ÷ 4 = 90.' },
          { type: 'tf', q: 'The grad system became more popular than degrees.', a: false, ex: '“It never became popular.”' },
        ] },
      ],
    },
    listening: {
      title: 'The orienteering course', intro: 'A coach explains an orienteering route to two students. Listen and answer.',
      voices: { Coach: 'buttery', Kim: 'glassy', Leo: 'rounded' },
      lines: [
        { spk: 'Coach', text: 'Today’s course has four checkpoints, and the path between them makes a quadrilateral. You finish where you started.' },
        { spk: 'Kim', text: 'So the four corners of the course are the four angles of a quadrilateral?' },
        { spk: 'Coach', text: 'Exactly. At the first checkpoint the angle is ninety degrees. At the second it is seventy-five degrees, and at the third it is one hundred and five degrees.' },
        { spk: 'Leo', text: 'Then the last angle must be three hundred and sixty minus two hundred and seventy. That’s ninety degrees.' },
        { spk: 'Coach', text: 'Well done, Leo. One more thing: the path from checkpoint one to checkpoint two is parallel to the river.' },
        { spk: 'Kim', text: 'And the bridge crosses the river at sixty degrees, so the bridge makes the same sixty degree angle with our path too.' },
        { spk: 'Coach', text: 'That’s right — corresponding angles. Off you go, and be back in forty-five minutes!' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Write the angles you hear.', f: 'Checkpoint 1: []° &nbsp; Checkpoint 2: []° &nbsp; Checkpoint 3: []° &nbsp; Checkpoint 4: []°', a: [90, 75, 105, 90], ex: '360 − (90 + 75 + 105) = 90.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'What shape does the route make?', opts: ['a quadrilateral', 'a triangle', 'a pentagon', 'a circle'], a: 0, ex: '“the path between them makes a quadrilateral.”' },
          { type: 'mcq', q: 'Which angle fact does Kim use for the bridge?', opts: ['corresponding angles are equal', 'opposite angles are equal', 'angles on a line add to 180°', 'angles in a triangle add to 180°'], a: 0, ex: 'The coach says “corresponding angles”.' },
          { type: 'num', q: 'How many minutes do the students have?', a: 45, ex: '“be back in forty-five minutes”.' },
        ] },
      ],
    },
  });
})();
