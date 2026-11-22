/* Unit 14 — Position and transformation */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, coord, gen } = Q;
  const sg = (v) => U.N(v);
  const P = (p) => `(${sg(p[0])}, ${sg(p[1])})`;
  const fx = (v) => { const r = Math.round(v * 1e6) / 1e6; return r === 0 ? 0 : r; };
  const LET = 'ABCDEFGHIJ';
  const gridFig = (o) => `<div style="max-width:${o.max || 300}px;margin:0 auto">${FIG.grid(Object.assign({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, size: 22, every: 1 }, o))}</div>`;
  const T = {
    tr: (dx, dy) => (p) => [p[0] + dx, p[1] + dy],
    rx: () => (p) => [p[0], fx(-p[1])], ry: () => (p) => [fx(-p[0]), p[1]],
    rot: (deg, cx = 0, cy = 0) => (p) => { const a = (deg * Math.PI) / 180, ux = p[0] - cx, uy = p[1] - cy; return [fx(cx + ux * Math.cos(a) - uy * Math.sin(a)), fx(cy + ux * Math.sin(a) + uy * Math.cos(a))]; },
  };
  const vertFill = (pts, tf2, o = {}) => { const im = pts.map(tf2), L = o.L || LET; return fill(o.q, im.flat(), o.ex || im.map((p, i) => `${L[i]}′${P(p)}`).join(', ') + '.', Object.assign({ f: im.map((_, i) => `${L[i]}′([], [])`).join(' &nbsp; ') }, o.o || {})); };
  const scaleTxt = (k) => '1 : ' + k.toLocaleString('en-US').replace(/,/g, ' ');

  /* ---------- widgets ---------- */
  APP.viz.scaleMap = function (el) {
    const f = VZ.frame(el, 'Bản đồ tỉ lệ — đo khoảng cách & đổi đơn vị', { icon: 'eye' });
    const TW = [['Riverton', 1.2, 6.6], ['Hillside', 6.2, 6.6], ['Lakeview', 10.4, 5.2], ['Oakford', 3.1, 2.4], ['Seabay', 9.6, 1.2], ['Mill Town', 6.4, 3.6]];
    const SC = [[25000, '1 : 25 000'], [50000, '1 : 50 000'], [80000, '1 : 80 000'], [4000000, '1 cm : 40 km']];
    let a = 0, b = 1, sc = 50000; const px = 30, W = 12 * px + 20, H = 8 * px + 20, svg = VZ.svg(W, H); f.stage.append(svg);
    const X = (x) => 10 + x * px, Y = (y) => H - 10 - y * px;
    function draw() {
      svg.innerHTML = '';
      svg.append(s('rect', { x: 10, y: 10, width: 12 * px, height: 8 * px, rx: 10, fill: 'color-mix(in srgb, #7ccf8a 30%, var(--surface))', stroke: 'var(--ink-3)' }), s('path', { d: `M ${X(0)} ${Y(4.6)} C ${X(3)} ${Y(5.4)}, ${X(5)} ${Y(3.2)}, ${X(7.6)} ${Y(4.4)} S ${X(11)} ${Y(3)}, ${X(12)} ${Y(3.4)}`, fill: 'none', stroke: '#3ba7ff', 'stroke-width': 6, opacity: 0.75 }), s('ellipse', { cx: X(10.6), cy: Y(6.6), rx: 30, ry: 16, fill: '#3ba7ff', opacity: 0.55 }));
      [[2.2, 4], [4.6, 5.6], [8.4, 6.8]].forEach(([x, y]) => svg.append(s('path', { d: `M ${X(x) - 14} ${Y(y) + 8} L ${X(x)} ${Y(y) - 10} L ${X(x) + 14} ${Y(y) + 8} Z`, fill: '#8d6e63', opacity: 0.55 })));
      for (let i = 0; i < TW.length; i++) for (let j = i + 1; j < TW.length; j++) if ((i + j) % 3 === 0) svg.append(s('line', { x1: X(TW[i][1]), y1: Y(TW[i][2]), x2: X(TW[j][1]), y2: Y(TW[j][2]), stroke: 'var(--ink-3)', 'stroke-width': 1.5, 'stroke-dasharray': '2 3' }));
      const A = TW[a], B = TW[b]; const d = Math.hypot(A[1] - B[1], A[2] - B[2]); const dm = U.round(d, 1); const ang = Math.atan2(-(B[2] - A[2]), B[1] - A[1]);
      const rul = s('g', { transform: `translate(${X(A[1])},${Y(A[2])}) rotate(${(ang * 180) / Math.PI})` }); rul.append(s('rect', { x: 0, y: -6, width: d * px, height: 12, fill: 'rgba(255,209,102,.85)', stroke: '#b38b00' })); for (let k = 0; k <= Math.floor(d * 2); k++) rul.append(s('line', { x1: k * px / 2, y1: -6, x2: k * px / 2, y2: k % 2 ? -1 : 3, stroke: '#5a4500', 'stroke-width': 1 })); svg.append(rul);
      TW.forEach(([nm, x, y], i) => svg.append(s('circle', { cx: X(x), cy: Y(y), r: i === a || i === b ? 7 : 5, fill: i === a || i === b ? 'var(--bad)' : 'var(--ink)' }), s('text', { x: X(x) + (x > 10 ? -8 : 8), y: Y(y) - 8, 'text-anchor': x > 10 ? 'end' : 'start', 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', text: nm })));
      svg.append(s('text', { x: W - 16, y: H - 16, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', text: SC.find((x) => x[0] === sc)[1] }));
      const realCm = dm * sc; const km = realCm / 100000;
      f.out.innerHTML = `Trên bản đồ: <b>${N(dm)} cm</b> → ${N(dm)} × ${N(sc)} = ${N(U.round(realCm, 0))} cm = ${N(U.round(realCm / 100, 2))} m = <b>${N(U.round(km, 3))} km</b> ngoài thực tế. (Bản đồ → thực tế: NHÂN với tỉ lệ; thực tế → bản đồ: CHIA.)`;
    }
    const sel = (cur, set) => h('select', { class: 'sel', onchange: (e) => { set(+e.target.value); SFX.play('select'); draw(); } }, TW.map((t, i) => h('option', { value: i, selected: i === cur ? '' : null }, t[0])));
    f.ctrls.append(h('label', {}, 'Từ ', sel(a, (v) => (a = v))), h('label', {}, 'đến ', sel(b, (v) => (b = v))), VZ.seg(SC.map((x) => [x[0], x[1]]), sc, (v) => { sc = v; draw(); }));
    draw();
  };
  APP.viz.distPoints = function (el) {
    const f = VZ.frame(el, 'Khoảng cách giữa hai điểm trên lưới toạ độ', { icon: 'grid' });
    const lo = -6, hi = 6, cs = 24, pad = 18, W = (hi - lo) * cs + 2 * pad; const svg = VZ.svg(W, W); f.stage.append(svg);
    const X = (x) => pad + (x - lo) * cs, Y = (y) => pad + (hi - y) * cs, IX = (p) => Math.max(lo, Math.min(hi, Math.round((p.x - pad) / cs + lo))), IY = (p) => Math.max(lo, Math.min(hi, Math.round(hi - (p.y - pad) / cs)));
    const base = s('g'); for (let i = lo; i <= hi; i++) { base.append(s('line', { x1: X(i), y1: Y(lo), x2: X(i), y2: Y(hi), stroke: i ? 'var(--line)' : 'var(--ink-2)', 'stroke-width': i ? 0.8 : 2 }), s('line', { x1: X(lo), y1: Y(i), x2: X(hi), y2: Y(i), stroke: i ? 'var(--line)' : 'var(--ink-2)', 'stroke-width': i ? 0.8 : 2 })); if (i && i % 2 === 0) base.append(s('text', { x: X(i), y: Y(0) + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: sg(i) }), s('text', { x: X(0) - 5, y: Y(i) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: sg(i) })); }
    const dyn = s('g'); const pts = [[-4, 3], [3, 3]]; const hs = pts.map((_, i) => s('circle', { r: 11, fill: i ? 'var(--algebra)' : 'var(--number)', stroke: '#fff', 'stroke-width': 3 })); svg.append(base, dyn, ...hs);
    function draw() {
      dyn.innerHTML = ''; const [A, B] = pts; hs.forEach((c, i) => { c.setAttribute('cx', X(pts[i][0])); c.setAttribute('cy', Y(pts[i][1])); });
      const sameY = A[1] === B[1], sameX = A[0] === B[0];
      if (sameY || sameX) dyn.append(s('line', { x1: X(A[0]), y1: Y(A[1]), x2: X(B[0]), y2: Y(B[1]), stroke: 'var(--accent)', 'stroke-width': 4 }));
      else dyn.append(s('polyline', { points: `${X(A[0])},${Y(A[1])} ${X(B[0])},${Y(A[1])} ${X(B[0])},${Y(B[1])}`, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }));
      ['A', 'B'].forEach((l, i) => dyn.append(s('text', { x: X(pts[i][0]) + 12, y: Y(pts[i][1]) - 12, 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)', text: `${l}${P(pts[i])}` })));
      const dx = Math.abs(A[0] - B[0]), dy = Math.abs(A[1] - B[1]);
      f.out.innerHTML = sameY && sameX ? 'Hai điểm trùng nhau: khoảng cách 0.' : sameY ? `Cùng tung độ y = ${sg(A[1])} → nằm trên đường nằm ngang. Khoảng cách = hiệu hoành độ: ${sg(Math.max(A[0], B[0]))} − ${sg(Math.min(A[0], B[0])).replace(/^−/, '(−') + (Math.min(A[0], B[0]) < 0 ? ')' : '')} = <b>${dx} đơn vị</b>.` : sameX ? `Cùng hoành độ x = ${sg(A[0])} → nằm trên đường thẳng đứng. Khoảng cách = hiệu tung độ: ${sg(Math.max(A[1], B[1]))} − ${sg(Math.min(A[1], B[1])).replace(/^−/, '(−') + (Math.min(A[1], B[1]) < 0 ? ')' : '')} = <b>${dy} đơn vị</b>.` : `Hai điểm không cùng hàng/cột: đi ngang ${dx} đơn vị và đi dọc ${dy} đơn vị. Kéo một điểm để chúng cùng x hoặc cùng y.`;
    }
    hs.forEach((c, i) => VZ.drag(svg, c, (p) => { const nx = IX(p), ny = IY(p); if (nx !== pts[i][0] || ny !== pts[i][1]) { pts[i] = [nx, ny]; SFX.play('tick'); draw(); } }));
    f.ctrls.append(VZ.btn('Ngẫu nhiên', () => { const v = R(-5, 5); const hor = U.chance ? U.chance(0.5) : Math.random() < 0.5; pts[0] = hor ? [R(-6, 0), v] : [v, R(-6, 0)]; pts[1] = hor ? [R(1, 6), v] : [v, R(1, 6)]; SFX.play('pop'); draw(); }, 'btn sm sc'));
    draw();
  };
  const SH = { tri: ['Tam giác', [[1, 1], [2, 3], [4, 1]]], L: ['Chữ L', [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]]], flag: ['Lá cờ', [[1, 1], [1, 5], [3, 4], [1, 3]]], arrow: ['Mũi tên', [[1, 1], [3, 1], [3, 0], [5, 2], [3, 4], [3, 3], [1, 3]]] };
  function tLab(el, kind) {
    const ttl = { tr: 'Phép tịnh tiến — cộng vào toạ độ', rf: 'Phép đối xứng trục — đường gương là trục x hoặc trục y', ro: 'Phép quay 90° và 180° quanh tâm quay' };
    const f = VZ.frame(el, ttl[kind], { icon: kind === 'ro' ? 'replay' : kind === 'rf' ? 'eye' : 'arrowR' });
    const lo = -7, hi = 7, cs = 21, pad = 16, W = (hi - lo) * cs + 2 * pad; const svg = VZ.svg(W, W); const tb = h('div', { style: { overflowX: 'auto' } }); f.stage.append(svg, tb);
    const X = (x) => pad + (x - lo) * cs, Y = (y) => pad + (hi - y) * cs;
    let shp = 'tri', dx = 3, dy = 2, mir = 'x', ang = -90, cx = 0, cy = 0, t = 1, anim = null;
    const mapT = (p, k) => { if (kind === 'tr') return [p[0] + dx * k, p[1] + dy * k]; if (kind === 'rf') { const m = 1 - 2 * k; return mir === 'x' ? [p[0], p[1] * m] : [p[0] * m, p[1]]; } return T.rot(ang * k, cx, cy)(p); };
    const fin = (p) => mapT(p, 1).map(fx);
    function draw() {
      svg.innerHTML = ''; for (let i = lo; i <= hi; i++) { svg.append(s('line', { x1: X(i), y1: Y(lo), x2: X(i), y2: Y(hi), stroke: i ? 'var(--line)' : 'var(--ink-2)', 'stroke-width': i ? 0.7 : 2 }), s('line', { x1: X(lo), y1: Y(i), x2: X(hi), y2: Y(i), stroke: i ? 'var(--line)' : 'var(--ink-2)', 'stroke-width': i ? 0.7 : 2 })); if (i && i % 2 === 0) svg.append(s('text', { x: X(i), y: Y(0) + 13, 'text-anchor': 'middle', 'font-size': 9.5, fill: 'var(--ink-2)', text: sg(i) }), s('text', { x: X(0) - 4, y: Y(i) + 3, 'text-anchor': 'end', 'font-size': 9.5, fill: 'var(--ink-2)', text: sg(i) })); }
      if (kind === 'rf') svg.append(mir === 'x' ? s('line', { x1: X(lo), y1: Y(0), x2: X(hi), y2: Y(0), stroke: 'var(--bad)', 'stroke-width': 4, opacity: 0.8 }) : s('line', { x1: X(0), y1: Y(lo), x2: X(0), y2: Y(hi), stroke: 'var(--bad)', 'stroke-width': 4, opacity: 0.8 }));
      const pts = SH[shp][1]; const cur = pts.map((p) => mapT(p, t)); const im = pts.map(fin);
      const poly = (arr, fill, stroke, dash) => s('polygon', { points: arr.map((p) => `${X(p[0])},${Y(p[1])}`).join(' '), fill, stroke, 'stroke-width': 2.5, 'stroke-dasharray': dash || '', 'stroke-linejoin': 'round' });
      svg.append(poly(pts, 'color-mix(in srgb, var(--number) 35%, transparent)', 'var(--number)'));
      if (t > 0) pts.forEach((p, i) => { const q = cur[i]; if (kind === 'ro') return; svg.append(s('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(q[0]), y2: Y(q[1]), stroke: 'var(--ink-3)', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' })); });
      if (kind === 'ro') { svg.append(s('line', { x1: X(cx), y1: Y(cy), x2: X(pts[0][0]), y2: Y(pts[0][1]), stroke: 'var(--ink-3)', 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }), s('line', { x1: X(cx), y1: Y(cy), x2: X(cur[0][0]), y2: Y(cur[0][1]), stroke: 'var(--ink-3)', 'stroke-dasharray': '4 3', 'stroke-width': 1.5 })); }
      svg.append(poly(cur, 'color-mix(in srgb, var(--algebra) 35%, transparent)', 'var(--algebra)', t < 1 ? '5 4' : ''));
      pts.forEach((p, i) => svg.append(s('text', { x: X(p[0]) - 4, y: Y(p[1]) - 5, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 800, fill: 'var(--number)', text: LET[i] })));
      if (t === 1) im.forEach((p, i) => svg.append(s('text', { x: X(p[0]) + 4, y: Y(p[1]) - 5, 'font-size': 11, 'font-weight': 800, fill: 'var(--algebra)', text: LET[i] + '′' })));
      if (kind === 'ro') svg.append(s('circle', { cx: X(cx), cy: Y(cy), r: 6, fill: 'var(--bad)', stroke: '#fff', 'stroke-width': 2 }));
      const rule = kind === 'tr' ? `(x ${dx < 0 ? '−' : '+'} ${Math.abs(dx)}, y ${dy < 0 ? '−' : '+'} ${Math.abs(dy)})` : kind === 'rf' ? (mir === 'x' ? '(x, −y)' : '(−x, y)') : cx === 0 && cy === 0 ? { '-90': '(y, −x)', 90: '(−y, x)', 180: '(−x, −y)' }[ang] : 'quay quanh tâm ' + P([cx, cy]);
      tb.innerHTML = `<table class="tbl" style="min-width:max-content;margin:6px auto 0"><tr><th>Vật</th>${pts.map((p, i) => `<td>${LET[i]}${P(p)}</td>`).join('')}</tr><tr><th>Ảnh</th>${im.map((p, i) => `<td style="color:var(--algebra);font-weight:800">${LET[i]}′${P(p)}</td>`).join('')}</tr></table>`;
      const desc = kind === 'tr' ? `Tịnh tiến ${Math.abs(dx)} ô sang ${dx < 0 ? 'trái' : 'phải'} và ${Math.abs(dy)} ô ${dy < 0 ? 'xuống' : 'lên'}: cộng ${sg(dx)} vào mọi hoành độ, cộng ${sg(dy)} vào mọi tung độ.` : kind === 'rf' ? (mir === 'x' ? 'Đối xứng qua trục x: hoành độ giữ nguyên, tung độ đổi dấu.' : 'Đối xứng qua trục y: tung độ giữ nguyên, hoành độ đổi dấu.') + ' Mỗi đỉnh ảnh cách đường gương bằng đỉnh vật.' : `Quay ${ang === 180 ? '180°' : '90° ' + (ang < 0 ? 'cùng chiều kim đồng hồ' : 'ngược chiều kim đồng hồ')} quanh ${P([cx, cy])}. Chạm vào lưới để đổi tâm quay.`;
      f.out.innerHTML = `${desc} Quy tắc: <b>${rule}</b>. Vật và ảnh luôn <b>bằng nhau</b> (congruent).`;
    }
    const play = () => { if (anim) anim(); SFX.play('whoosh'); anim = VZ.animate(1100, (e) => { t = e; draw(); }, () => { t = 1; SFX.play('pop'); draw(); }); };
    if (kind === 'ro') svg.addEventListener('click', (e) => { const p = VZ.pt(svg, e); const x = Math.round((p.x - pad) / cs + lo), y = Math.round(hi - (p.y - pad) / cs); if (x < lo || x > hi || y < lo || y > hi) return; cx = x; cy = y; SFX.play('tap'); play(); });
    f.ctrls.append(VZ.seg(Object.keys(SH).map((k) => [k, SH[k][0]]), shp, (v) => { shp = v; play(); }));
    if (kind === 'tr') f.ctrls.append(VZ.range('Sang phải (+) / trái (−)', -6, 6, dx, 1, (v) => { dx = v; t = 1; draw(); }), VZ.range('Lên (+) / xuống (−)', -6, 6, dy, 1, (v) => { dy = v; t = 1; draw(); }));
    if (kind === 'rf') f.ctrls.append(VZ.seg([['x', 'Gương: trục x'], ['y', 'Gương: trục y']], mir, (v) => { mir = v; play(); }));
    if (kind === 'ro') f.ctrls.append(VZ.seg([[-90, '90° ↻'], [90, '90° ↺'], [180, '180°']], ang, (v) => { ang = +v; play(); }));
    f.ctrls.append(VZ.btn('Biến hình ▶', play, 'btn sm sc'));
    t = 0; draw(); setTimeout(play, 400);
  }
  APP.viz.translateLab = (el) => tLab(el, 'tr');
  APP.viz.reflectLab = (el) => tLab(el, 'rf');
  APP.viz.rotateLab = (el) => tLab(el, 'ro');
  APP.viz.enlargeLab = function (el) {
    const f = VZ.frame(el, 'Phóng to hình với hệ số k', { icon: 'target' });
    const SHP = { rect: ['Chữ nhật', [[0, 0], [3, 0], [3, 2], [0, 2]]], tri: ['Tam giác', [[0, 0], [2, 0], [0, 1]]], L: ['Chữ L', [[0, 0], [2, 0], [2, 1], [1, 1], [1, 3], [0, 3]]], trap: ['Hình thang', [[0, 0], [3, 0], [2, 2], [1, 2]]] };
    let key = 'rect', k = 2; const box = h('div'); f.stage.append(box);
    function draw() {
      const pts = SHP[key][1]; const w0 = Math.max(...pts.map((p) => p[0])), h0 = Math.max(...pts.map((p) => p[1]));
      const cols = w0 * (1 + k) + 3, rows = Math.max(h0 * k, 4) + 2; const cs = Math.min(360 / cols, 26); const W = cols * cs, H = rows * cs;
      const X = (x) => x * cs, Y = (y) => H - y * cs; let g = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${Math.max(W, 280)}px;display:block;margin:0 auto">`;
      for (let i = 0; i <= cols; i++) g += `<line x1="${X(i)}" y1="0" x2="${X(i)}" y2="${H}" stroke="var(--line)"/>`; for (let j = 0; j <= rows; j++) g += `<line x1="0" y1="${Y(j)}" x2="${W}" y2="${Y(j)}" stroke="var(--line)"/>`;
      const draw1 = (off, sc, fillc, strokec) => { const P2 = pts.map(([x, y]) => [off + x * sc, 1 + y * sc]); let s2 = `<polygon points="${P2.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="${fillc}" stroke="${strokec}" stroke-width="2.5" stroke-linejoin="round" style="animation:popIn .4s both"/>`; P2.forEach((p, i) => { const q = P2[(i + 1) % P2.length]; const L = Math.hypot(q[0] - p[0], q[1] - p[1]); if (p[0] === q[0] || p[1] === q[1]) s2 += `<text x="${(X(p[0]) + X(q[0])) / 2 + (p[0] === q[0] ? (q[1] > p[1] ? 11 : -11) : 0)}" y="${(Y(p[1]) + Y(q[1])) / 2 + (p[1] === q[1] ? (q[0] > p[0] ? 13 : -5) : 4)}" text-anchor="middle" font-size="11" font-weight="800" fill="${strokec}">${N(L)}</text>`; }); return s2; };
      g += draw1(1, 1, 'color-mix(in srgb, var(--number) 35%, transparent)', 'var(--number)') + draw1(w0 + 2, k, 'color-mix(in srgb, var(--geometry) 30%, transparent)', 'var(--geometry)') + '</svg>';
      const per = pts.reduce((a2, p, i) => { const q = pts[(i + 1) % pts.length]; return a2 + Math.hypot(q[0] - p[0], q[1] - p[1]); }, 0); const area = Math.abs(pts.reduce((a2, p, i) => { const q = pts[(i + 1) % pts.length]; return a2 + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
      box.innerHTML = g; f.out.innerHTML = `Hệ số phóng to <b>k = ${k}</b>: mọi cạnh dài gấp ${k} lần, các góc giữ nguyên → hai hình <b>đồng dạng</b> (similar). Chu vi: ${N(U.round(per, 2))} → ${N(U.round(per * k, 2))} (tỉ số 1 : ${k}). Mở rộng: diện tích ${N(area)} → ${N(area * k * k)} (gấp k² = ${k * k} lần!).`;
    }
    f.ctrls.append(VZ.seg(Object.keys(SHP).map((x) => [x, SHP[x][0]]), key, (v) => { key = v; draw(); }), VZ.range('Hệ số k', 1, 4, k, 1, (v) => { k = v; SFX.play('pop'); draw(); }));
    draw();
  };
  APP.viz.ferrisWheel = function (el) {
    const f = VZ.frame(el, 'Vòng quay Singapore Flyer — phép quay trong đời thực', { icon: 'replay' });
    let tmin = 0, auto = true; const box = h('div', { style: { position: 'relative', height: 'min(80vw, 330px)' } }); f.stage.append(box);
    const lp = VZ.canvasLoop(box, (c, w, hh) => {
      if (auto) tmin = (tmin + 0.03) % 32; c.clearRect(0, 0, w, hh); const cx = w / 2, cy = hh * 0.46, r = Math.min(w, hh) * 0.36; const th = (tmin / 32) * Math.PI * 2;
      c.strokeStyle = 'rgba(128,128,128,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - r * 0.6, hh - 8); c.moveTo(cx, cy); c.lineTo(cx + r * 0.6, hh - 8); c.stroke();
      c.lineWidth = 4; c.strokeStyle = '#4f8cff'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); c.lineWidth = 1; c.strokeStyle = 'rgba(79,140,255,.45)';
      for (let i = 0; i < 28; i++) { const a = th + (i / 28) * Math.PI * 2; const x = cx + r * Math.sin(a), y = cy + r * Math.cos(a); c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke(); c.fillStyle = i === 0 ? '#ef476f' : '#ffd166'; c.beginPath(); c.ellipse(x, y + 7, 7, 9, 0, 0, 7); c.fill(); }
      c.fillStyle = '#ef476f'; c.font = '700 12px sans-serif'; c.textAlign = 'left'; const hgt = 90 - 75 * Math.cos(th); c.fillText(`${N(U.round(tmin, 1))} phút · ${Math.round((tmin / 32) * 360)}° · cabin đỏ cao ≈ ${Math.round(hgt)} m`, 8, 18);
    });
    lp.cv.style.width = '100%'; lp.cv.style.height = '100%';
    f.out.innerHTML = 'Bánh xe cao 165 m, có 28 cabin, quay một vòng (360°) mất khoảng 32 phút: mỗi phút quay 360 ÷ 32 = 11,25°. Để ý: cabin luôn thẳng đứng — cả bánh xe QUAY, nhưng mỗi cabin chỉ được TỊNH TIẾN dọc theo đường tròn!';
    f.ctrls.append(VZ.btn('Dừng / chạy', () => { auto = !auto; SFX.play('tap'); }, 'btn sm sc'), VZ.range('Thời gian (phút)', 0, 32, 0, 1, (v) => { auto = false; tmin = v; }));
  };
  APP.viz.kaleidoscope = function (el) {
    const f = VZ.frame(el, 'Kính vạn hoa — vẽ một nét, gương nhân lên thành hoa văn', { icon: 'spark' });
    let n = 6, strokes = [], curS = null, hue = 200; const box = h('div', { style: { position: 'relative', height: 'min(86vw, 360px)', touchAction: 'none', borderRadius: '14px', overflow: 'hidden', background: '#0e1324' } }); f.stage.append(box);
    const lp = VZ.canvasLoop(box, (c, w, hh, t) => {
      c.fillStyle = '#0e1324'; c.fillRect(0, 0, w, hh); const cx = w / 2, cy = hh / 2;
      c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w); c.stroke(); }
      c.lineCap = 'round'; c.lineJoin = 'round';
      [...strokes, ...(curS ? [curS] : [])].forEach((st) => { c.strokeStyle = `hsl(${st.h} 90% 62%)`; c.lineWidth = 3.5; for (let k = 0; k < n; k++) for (const m of [1, -1]) { c.save(); c.translate(cx, cy); c.rotate((k / n) * Math.PI * 2); c.scale(1, m); c.beginPath(); st.p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore(); } });
      if (!strokes.length && !curS) { c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '600 14px sans-serif'; c.textAlign = 'center'; c.fillText('Kéo ngón tay / chuột để vẽ ✍️', cx, cy + 4 + Math.sin(t * 3) * 3); }
    });
    lp.cv.style.width = '100%'; lp.cv.style.height = '100%';
    const loc = (e) => { const r = lp.cv.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };
    lp.cv.addEventListener('pointerdown', (e) => { e.preventDefault(); lp.cv.setPointerCapture(e.pointerId); hue = (hue + 37) % 360; curS = { h: hue, p: [loc(e)] }; SFX.play('tap'); });
    lp.cv.addEventListener('pointermove', (e) => { if (curS) curS.p.push(loc(e)); });
    const end = () => { if (curS && curS.p.length > 1) strokes.push(curS); curS = null; if (strokes.length > 40) strokes.shift(); };
    lp.cv.addEventListener('pointerup', end); lp.cv.addEventListener('pointercancel', end);
    f.ctrls.append(VZ.range('Số gương', 2, 10, n, 1, (v) => { n = v; }), VZ.btn('Xoá', () => { strokes = []; SFX.play('whoosh'); }, 'btn sm ghost'));
    f.out.innerHTML = 'Mỗi nét vẽ được <b>phản chiếu</b> qua các gương và <b>quay</b> quanh tâm. Với n gương, hoa văn có đối xứng quay bậc n.';
  };
  APP.viz.heroTransform = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#121a33'; c.fillRect(0, 0, w, hh); const u = Math.min(w, hh) / 9;
      for (let i = -1; i < w / u + 1; i++) for (let j = -1; j < hh / u + 1; j++) { const x = i * u + ((t * 18) % u), y = j * u; c.save(); c.translate(x + u / 2, y + u / 2); const kind = (i + j + 40) % 3; if (kind === 1) c.rotate(Math.sin(t + i * 0.4) * Math.PI / 2); if (kind === 2) c.scale(Math.cos(t * 1.3 + j), 1); c.fillStyle = ['rgba(79,140,255,.55)', 'rgba(239,71,111,.5)', 'rgba(6,214,160,.5)'][kind]; c.beginPath(); c.moveTo(-u * 0.35, -u * 0.3); c.lineTo(u * 0.35, -u * 0.3); c.lineTo(-u * 0.35, u * 0.35); c.closePath(); c.fill(); c.restore(); }
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(u * 0.55)}px Lexend, sans-serif`; c.fillText('translate · reflect · rotate · enlarge', w * 0.05, hh * 0.9);
    });
  };

  /* ---------- question helpers ---------- */
  const distQ = (A, B, o) => { const d = A[0] === B[0] ? Math.abs(A[1] - B[1]) : Math.abs(A[0] - B[0]); const same = A[0] === B[0] ? 'x' : 'y'; return num(`Work out the distance between the points ${P(A)} and ${P(B)}.`, d, `Same ${same}-coordinate, so find the difference between the ${same === 'x' ? 'y' : 'x'}-coordinates: ${d} units.`, Object.assign({ unit: 'units' }, o)); };
  const mapQ = (cm, scale, o) => { const km = (cm * scale) / 100000; return num(`A map has a scale of ${scaleTxt(scale)}. On the map the distance between two places is ${N(cm)} cm. What is the real distance in km?`, U.round(km, 4), `${N(cm)} × ${N(scale)} = ${N(cm * scale)} cm = ${N(cm * scale / 100)} m = ${N(U.round(km, 4))} km.`, Object.assign({ unit: 'km' }, o)); };
  const realQ = (km, scale, o) => { const cm = (km * 100000) / scale; return num(`A map has a scale of ${scaleTxt(scale)}. The real distance between two places is ${N(km)} km. What is the distance on the map in cm?`, U.round(cm, 4), `${N(km)} km = ${N(km * 1000)} m = ${N(km * 100000)} cm. ${N(km * 100000)} ÷ ${N(scale)} = ${N(U.round(cm, 4))} cm.`, Object.assign({ unit: 'cm' }, o)); };

  APP.addUnit({
    n: 14, strand: 'geometry', title: 'Position and transformation', vi: 'Vị trí và phép biến hình',
    blurb: 'A transformation is when you move a shape by reflecting, translating or rotating it. The shape you start with is the object; the shape you finish with is the image. You see transformations every day: mountains reflected in a calm lake, an arrow translated to its target, and the Singapore Flyer — 165 metres tall with 28 capsules — rotating about its centre. During a reflection, translation or rotation a shape changes only its position, so an object and its image are always congruent.',
    blurbVi: 'Chương này học dùng tỉ lệ trên bản đồ và bản vẽ, tính khoảng cách giữa hai điểm trên lưới toạ độ, và bốn phép biến hình: tịnh tiến, đối xứng trục (qua trục x, trục y), quay 90°/180°, phóng to với hệ số k.',
    words: [['transformation', 'phép biến hình'], ['object', 'vật (hình ban đầu)'], ['image', 'ảnh'], ['congruent', 'bằng nhau'], ['scale drawing', 'bản vẽ tỉ lệ'], ['scale', 'tỉ lệ (xích)'], ['represents', 'biểu thị'], ['map', 'bản đồ'], ['distance', 'khoảng cách'], ['translate', 'tịnh tiến'], ['corresponds', 'tương ứng'], ['reflect', 'phản chiếu / lấy đối xứng'], ['mirror line', 'trục đối xứng (đường gương)'], ['rotate', 'quay'], ['centre of rotation', 'tâm quay'], ['clockwise', 'cùng chiều kim đồng hồ'], ['anticlockwise', 'ngược chiều kim đồng hồ'], ['enlargement', 'phép phóng to'], ['scale factor', 'hệ số tỉ lệ'], ['similar', 'đồng dạng'], ['vertex (vertices)', 'đỉnh']],
    chat: ['Tỉ lệ 1 : 50 000 nghĩa là gì?', 'Đối xứng qua trục y thì toạ độ đổi thế nào?', 'Quay 90° cùng chiều kim đồng hồ làm sao?'],
    sections: [
      {
        id: '14.1', t: 'Maps and plans', vi: 'Bản đồ và bản vẽ',
        goals: ['use scales on maps and plans.'],
        body: [
          ['p', 'A <b>scale drawing</b> represents an object in real life. The <b>scale</b> gives the relationship between lengths on the drawing and real-life lengths. You can write a scale in three ways: using the word “represents” (1 cm represents 100 cm), using the word “to” (1 to 100) or using a ratio sign (1 : 100). With “to” or the ratio sign, both numbers must be in the same units: “1 cm represents 10 m” is “1 : 1000”.'],
          ['rule', 'Drawing → real life: <b>multiply</b> by the scale.<br>Real life → drawing: <b>divide</b> by the scale.<br>Remember: 1 m = 100 cm, 1 km = 1000 m = 100 000 cm.', 'Using a scale'],
          ['viz', 'scaleMap'],
          ['ex', { t: 'Worked example 14.1', q: 'a Razaan uses a scale of 1 cm represents 5 m. i On her drawing a building is 12 cm long. How long is it in real life? ii The building is 120 m tall. How tall is it on the drawing? b A map has a scale of 1 : 50 000. i Two villages are 8 cm apart on the map. What is the real distance? ii Two towns are 18 km apart. What is the distance on the map?', steps: ['a i: 12 × 5 = <b>60 m</b>.', 'a ii: 120 ÷ 5 = <b>24 cm</b>.', 'b i: 8 × 50 000 = 400 000 cm = 4000 m = <b>4 km</b>.', 'b ii: 18 km = 18 000 m = 1 800 000 cm; 1 800 000 ÷ 50 000 = <b>36 cm</b>.'] }],
          ['tip', 'Shortcut for 1 : 50 000: 1 cm represents 50 000 cm = 500 m = 0.5 km. So 8 cm represents 8 × 0.5 = 4 km.'],
          ['vi', ['Tỉ lệ 1 : n: 1 đơn vị trên bản vẽ ứng với n đơn vị (cùng loại) ngoài thực tế.', 'Bản vẽ → thực tế: nhân với n. Thực tế → bản vẽ: chia cho n.', 'Chú ý đổi đơn vị: cm → m (÷100) → km (÷1000).', 'Mẹo: 1 : 25 000 → 1 cm ứng với 250 m = 0,25 km.']],
        ],
        bank: [
          fill('A scale drawing uses a scale of 1 cm represents 3 m. Complete.', [6, 15, 24], 'Multiply by 3.', { f: '2 cm → [] m &nbsp; 5 cm → [] m &nbsp; 8 cm → [] m' }),
          fill('A scale drawing uses a scale of 1 cm represents 4 m. Complete.', [2, 3, 5], 'Divide by 4.', { f: '8 m → [] cm &nbsp; 12 m → [] cm &nbsp; 20 m → [] cm' }),
          fill('Marsile draws a playing field using 1 cm represents 10 m.', [180, 8], '18 × 10 = 180 m; 80 ÷ 10 = 8 cm.', { f: '18 cm on the drawing = [] m in real life &nbsp; 80 m wide in real life = [] cm on the drawing' }),
          multi('The scale is 1 to 20. Which statements are correct?', ['1 cm on the drawing represents 20 cm in real life', '1 mm on the drawing represents 20 mm in real life', '1 cm on the drawing represents 20 m in real life'], [0, 1], 'Both numbers in “1 to 20” are in the same units.', { fixed: true, d: 2 }),
          num('Visuri’s bedroom plan has a scale of 1 to 25. Her wardrobe is 50 cm deep. What is this on the plan?', 2, '50 ÷ 25 = 2 cm.', { unit: 'cm' }),
          num('Visuri’s plan has a scale of 1 to 25. Her bed is 1.75 m long. What is this on the plan, in cm?', 7, '1.75 m = 175 cm; 175 ÷ 25 = 7 cm.', { unit: 'cm', d: 2 }),
          mapQ(12, 25000), realQ(12, 25000), realQ(12, 80000, { d: 2 }), mapQ(8, 50000),
          mcq('Faisal writes: “Scale 1 : 50 000, distance 8.5 cm. 8.5 ÷ 50 000 = 0.00017 cm … = 17 km.” What is the correct real distance?', ['4.25 km', '17 km', '42.5 km', '0.425 km'], 0, 'He should multiply: 8.5 × 50 000 = 425 000 cm = 4250 m = 4.25 km.', { d: 2 }),
          mcq('Babra runs 18 km. The route is 24 cm on the map. Which is the map scale?', ['1 : 75 000', '1 : 70 000', '1 : 65 000'], 0, '18 km = 1 800 000 cm; 1 800 000 ÷ 24 = 75 000.', { fixed: true, d: 3 }),
          fill('Priyanka uses a scale of 1 cm represents 40 cm.', [4.8, 14], '12 × 40 = 480 cm = 4.8 m; 5.6 m = 560 cm, 560 ÷ 40 = 14 cm.', { f: 'Room 12 cm on the drawing = [] m in real life &nbsp; Room 5.6 m wide = [] cm on the drawing', d: 2 }),
          mcq('Write the scale “1 cm represents 10 m” as a ratio.', ['1 : 1000', '1 : 10', '1 : 100', '10 : 1'], 0, '10 m = 1000 cm.'),
          mcq('Aika and Hinata both find 12 cm at 1 : 25 000. Hinata first changes 1 cm → 250 m = 0.25 km. What is an advantage of Hinata’s method?', ['She can then use it for any map distance by multiplying by 0.25', 'It gives a different answer', 'It does not need any conversions', 'It works for every map scale without changes'], 0, 'Once you know 1 cm = 0.25 km, every distance is a quick multiplication.', { d: 2 }),
          gen(() => { const cm = pick([3, 6, 7.5, 10, 12.8]), sc = pick([12000, 15000, 30000, 200000]); return mapQ(cm, sc); }),
          gen(() => { const km = pick([4.5, 6, 7.5, 9, 15]), sc = pick([12000, 15000, 30000, 200000]); const cm = (km * 100000) / sc; if (Math.abs(cm * 100 - Math.round(cm * 100)) > 1e-6) return null; return realQ(km, sc); }),
          gen(() => { const k = pick([2, 3, 4, 5, 10, 20, 25]), c = R(2, 15); const real = c * k; return pick([num(`A plan uses the scale 1 cm represents ${k} m. A wall is ${c} cm on the plan. How long is it in real life?`, real, `${c} × ${k} = ${real} m.`, { unit: 'm' }), num(`A plan uses the scale 1 cm represents ${k} m. A path is ${real} m long in real life. How long is it on the plan?`, c, `${real} ÷ ${k} = ${c} cm.`, { unit: 'cm' })]); }),
          gen(() => { const sc = pick([10000, 20000, 25000, 40000, 50000, 100000]), cm = R(2, 20); return mapQ(cm, sc, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '14.2', t: 'The distance between two points', vi: 'Khoảng cách giữa hai điểm',
        goals: ['work out the distance between two points on a coordinate grid.'],
        body: [
          ['p', 'A(1, 2) and B(4, 2) have the same y-coordinate, so they lie on the same horizontal line. The distance between them is the difference between the x-coordinates: 4 − 1 = <b>3 units</b>.'],
          ['html', gridFig({ xmin: 0, xmax: 5, ymin: 0, ymax: 3, size: 34, lines: [{ pts: [[1, 2], [4, 2]], color: 'var(--accent)' }], points: [{ x: 1, y: 2, label: 'A' }, { x: 4, y: 2, label: 'B' }], max: 260 })],
          ['rule', 'Same y-coordinate (horizontal line): distance = difference between the x-coordinates.<br>Same x-coordinate (vertical line): distance = difference between the y-coordinates.<br>A distance is never negative: (3, 4) to (3, −2) is 4 − (−2) = 6 units.', 'Distance on a grid'],
          ['viz', 'distPoints'],
          ['ex', { t: 'Worked example 14.2', q: 'Without drawing a grid, work out the distance between a C(9, 3) and D(5, 3) b E(2, 4) and F(2, 7).', steps: ['a: same y-coordinate → 9 − 5 = <b>4 units</b>.', 'b: same x-coordinate → 7 − 4 = <b>3 units</b>.'] }],
          ['vi', ['Cùng tung độ → đường nằm ngang → lấy hiệu hai hoành độ.', 'Cùng hoành độ → đường thẳng đứng → lấy hiệu hai tung độ.', 'Lấy số lớn trừ số nhỏ; khoảng cách luôn dương. Với số âm: 3 − (−5) = 3 + 5 = 8.', 'Nếu 1 đơn vị lưới = 2 m thì nhân khoảng cách với 2.']],
        ],
        bank: [
          distQ([9, 5], [3, 5]), distQ([12, 4], [5, 4]), distQ([1, 11], [1, 5]), distQ([8, 16], [8, 7]),
          mcq('Work out the distance between (7, 1) and (7, 6).', ['−5 units', '5 units', '1 unit'], 1, '6 − 1 = 5. A distance is never negative.', { fixed: true }),
          mcq('Work out the distance between (8, 2) and (4, 2).', ['6 units', '2 units', '4 units'], 2, '8 − 4 = 4.', { fixed: true }),
          mcq('Work out the distance between (8, 15) and (15, 15).', ['−7 units', '0 units', '7 units'], 2, '15 − 8 = 7.', { fixed: true }),
          mcq('Zara says: “It doesn’t matter if you do 4 − 12 = −8 or 12 − 4 = 8, as long as you give the distance as 8 units and not −8 units.” Do you agree?', ['Yes — a distance is always positive', 'No — the distance is −8 units', 'No — you must always subtract the first point', 'No — the distance is 16 units'], 0, 'The size of the difference is what matters.'),
          fill('Points: A(2, 9), B(6, 12), C(11, 10), D(2, 15), E(0, 18), F(6, 17), G(6, 1), H(3, 18), I(6, 8), J(19, 10). Write the pairs of points that are these distances apart.', [['G, I', 'GI', 'G and I', 'I, G', 'IG', 'I and G'], ['E, H', 'EH', 'E and H', 'H, E', 'HE', 'H and E'], ['C, J', 'CJ', 'C and J', 'J, C', 'JC', 'J and C'], ['A, D', 'AD', 'A and D', 'D, A', 'DA', 'D and A']], 'G(6, 1)–I(6, 8): 7; E(0, 18)–H(3, 18): 3; C(11, 10)–J(19, 10): 8; A(2, 9)–D(2, 15): 6.', { f: '7 units: [] &nbsp; 3 units: [] &nbsp; 8 units: [] &nbsp; 6 units: []', d: 3 }),
          distQ([3, 4], [3, -2]), distQ([4, 3], [4, -5]), distQ([-1, 7], [5, 7]), distQ([-3, 8], [-3, -6], { d: 2 }), distQ([2, 0], [-8, 0]), distQ([-4, 2], [-9, 2]),
          match('Match each pair of points to the distance between them.', [['(−4, 3) and (−7, 3)', '3'], ['(9, −1) and (9, −9)', '8'], ['(−10, 0) and (−15, 0)', '5'], ['(−2, −6) and (−2, −15)', '9'], ['(1, −7) and (1, −14)', '7']], 'Find the difference between the coordinates that change.', { d: 2 }),
          fill('Amelia draws a square ABCD with A(3, 5), B(7, 5) and C(7, 9).', [4, 3, 9], 'AB = 7 − 3 = 4. D has the x-coordinate of A and the y-coordinate of C: D(3, 9).', { f: 'Side length: [] units &nbsp; D([], [])', d: 2 }),
          fill('A netball court grid: 1 unit represents 2 m. GS(−5, 2), GA(−5, −2), WA(−3, 2). Find the distance on the court between:', [8, 4], 'GS–GA: 4 units = 8 m. GS–WA: 2 units = 4 m.', { f: 'GS and GA: [] m &nbsp; GS and WA: [] m', app: true, d: 2 }),
          mcq('Netball positions (1 unit = 2 m): C(−1, 0), GK(6, 0), GA(−5, −2), WD(1, −2), GD(4, −2). Which two players are 14 m apart?', ['C and GK', 'GA and GD', 'WD and GD', 'GA and WD'], 0, '14 m = 7 units: C(−1, 0) to GK(6, 0) is 6 − (−1) = 7 units.', { d: 3, app: true }),
          fill('GA(−5, −2), WD(1, −2) and GD(4, −2) are in a straight line (1 unit = 2 m). Find the distances on the court.', [12, 6, 18], 'GA–WD 6 units = 12 m; WD–GD 3 units = 6 m; GA–GD 9 units = 18 m.', { f: 'GA–WD: [] m &nbsp; WD–GD: [] m &nbsp; GA–GD: [] m', d: 3, app: true }),
          distQ([8, 2], [8, 11]), distQ([4, 7], [1, 7]),
          gen(() => { const v = R(-9, 9), a = R(-12, 12), b = R(-12, 12); if (a === b) return null; return pick([distQ([a, v], [b, v]), distQ([v, a], [v, b])]); }),
          gen(() => { const x = R(-6, 6), y = R(-6, 6), d = R(2, 9); const dir = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); const B = [x + dir[0] * d, y + dir[1] * d]; return coord(`Point A is at ${P([x, y])}. Point B is ${d} units ${dir[0] > 0 ? 'to the right of' : dir[0] < 0 ? 'to the left of' : dir[1] > 0 ? 'above' : 'below'} A. What are the coordinates of B?`, B, `B = ${P(B)}.`); }),
          gen(() => { const k = pick([2, 3, 5, 10]), d = R(2, 9); return num(`On a plan, 1 grid unit represents ${k} m. Two points are ${d} units apart on the same horizontal line. What is the real distance?`, k * d, `${d} × ${k} = ${k * d} m.`, { unit: 'm', app: true }); }, { app: true }),
        ],
      },
      {
        id: '14.3', t: 'Translating 2D shapes', vi: 'Phép tịnh tiến hình phẳng',
        goals: ['work out the coordinates of shapes after a translation.'],
        body: [
          ['p', 'When you translate a 2D shape you move it right or left and up or down. Triangle ABC has vertices A(1, 1), B(2, 3) and C(4, 1). After a translation of 3 squares right and 2 squares up, the vertices are A′(4, 3), B′(5, 5) and C′(7, 3). You say A′ as “A dash”; the point A′ <b>corresponds</b> to A. Triangle ABC is the <b>object</b> and A′B′C′ is the <b>image</b>.'],
          ['html', gridFig({ xmin: 0, xmax: 8, ymin: 0, ymax: 6, size: 28, polys: [{ pts: [[1, 1], [2, 3], [4, 1]] }, { pts: [[4, 3], [5, 5], [7, 3]], dash: true }], max: 320 })],
          ['rule', 'Right: add to the x-coordinates. Left: subtract from the x-coordinates.<br>Up: add to the y-coordinates. Down: subtract from the y-coordinates.', 'Translation without a grid'],
          ['viz', 'translateLab'],
          ['ex', { t: 'Worked example 14.3', q: 'A square ABCD has vertices A(2, 1), B(5, 2), C(4, 5) and D(1, 4). It is translated 2 squares right and 1 square down. Work out the vertices of A′B′C′D′.', steps: ['Add 2 to every x-coordinate and subtract 1 from every y-coordinate.', 'A′(4, 0), B′(7, 1), C′(6, 4), D′(3, 3).'] }],
          ['vi', ['Tịnh tiến: mọi điểm dịch chuyển cùng một khoảng, cùng một hướng.', 'Sang phải +, sang trái − (cộng/trừ vào hoành độ x).', 'Lên trên +, xuống dưới − (cộng/trừ vào tung độ y).', 'Ảnh và vật bằng nhau, cùng hướng (không bị lật hay xoay).', 'Kiểm tra: vẽ lên lưới hoặc so sánh hiệu toạ độ của các cặp đỉnh tương ứng.']],
        ],
        bank: [
          vertFill([[2, 1], [7, 1], [2, 5]], T.tr(4, 5), { q: 'Triangle ABC has vertices A(2, 1), B(7, 1) and C(2, 5). It is translated 4 squares right and 5 squares up. Work out the coordinates of A′, B′ and C′.' }),
          match('Match each translation to what you must add or subtract.', [['4 squares left and 1 square up', 'x − 4, y + 1'], ['4 squares right and 1 square down', 'x + 4, y − 1'], ['4 squares left and 1 square down', 'x − 4, y − 1'], ['4 squares right and 1 square up', 'x + 4, y + 1']], 'Right/left changes x; up/down changes y.'),
          vertFill([[3, 1], [8, 1], [10, 4], [5, 4]], T.tr(-1, 3), { q: 'Parallelogram PQRS has vertices P(3, 1), Q(8, 1), R(10, 4) and S(5, 4). It is translated 1 square left and 3 squares up. Work out the coordinates of P′Q′R′S′.', L: 'PQRS' }),
          mcq('Dan translates A(1, 4), B(2, 7), C(5, 6) by 6 squares right and 4 squares down. He writes A′(7, 0), B′(8, 11), C′(1, 12). Which vertex is correct?', ['A′', 'B′', 'C′'], 0, 'Correct image: A′(7, 0), B′(8, 3), C′(11, 2). For B′ he added 4 instead of subtracting; for C′ he subtracted 4 from x and added 6 to y.', { fixed: true, d: 2 }),
          vertFill([[1, 3], [3, 3], [3, 5], [2, 7], [1, 5]], T.tr(3, -2), { q: 'Pentagon JKLMN has vertices J(1, 3), K(3, 3), L(3, 5), M(2, 7) and N(1, 5). It is translated 3 squares right and 2 squares down. Work out the coordinates of J′K′L′M′N′.', L: 'JKLMN', o: { d: 2 } }),
          mcq('Chaow translates J(4, 2), K(5, 5), L(3, 3) and gets J′(1, 7), K′(10, 2), L′(0, 8). Two are correct. What is the correct translation?', ['3 squares left and 5 squares up', '5 squares right and 3 squares down', '3 squares right and 5 squares up', '1 square left and 7 squares up'], 0, 'J → J′: x − 3, y + 5 and L → L′: x − 3, y + 5. So K′ should be (2, 10).', { d: 3 }),
          vertFill([[-3, -3], [2, -3], [2, -8], [-3, -8]], T.tr(-4, 6), { q: 'Square ABCD has vertices A(−3, −3), B(2, −3), C(2, −8) and D(−3, −8). It is translated 4 squares left and 6 squares up. Work out A′B′C′D′.', o: { d: 2 } }),
          vertFill([[3, 1], [4, 3], [3, 5], [2, 3]], T.tr(2, 5), { q: 'Rhombus PQRS has vertices P(3, 1), Q(4, 3), R(3, 5) and S(2, 3). It is translated 2 squares right and 5 squares up. Work out the coordinates of P′Q′R′S′.', L: 'PQRS' }),
          mcq('A shape is translated. Which of these stays the same?', ['its size, shape and the direction it faces', 'its position', 'the coordinates of every vertex', 'nothing'], 0, 'A translation only moves the position.'),
          gen(() => { const dx = U.RNZ(-6, 6), dy = U.RNZ(-6, 6); const A = [R(-5, 5), R(-5, 5)]; const B = [A[0] + dx, A[1] + dy]; const w = (v, p, n) => `${Math.abs(v)} square${Math.abs(v) > 1 ? 's' : ''} ${v > 0 ? p : n}`; return coord(`The point ${P(A)} is translated ${w(dx, 'right', 'left')} and ${w(dy, 'up', 'down')}. What are the coordinates of its image?`, B, `(${sg(A[0])} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)}, ${sg(A[1])} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)}) = ${P(B)}.`); }),
          gen(() => { const A = [R(-5, 5), R(-5, 5)], B = [R(-5, 5), R(-5, 5)]; const dx = B[0] - A[0], dy = B[1] - A[1]; if (!dx || !dy) return null; const ok = `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}, ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}`; const opts = [ok, `${Math.abs(dx)} ${dx > 0 ? 'left' : 'right'}, ${Math.abs(dy)} ${dy > 0 ? 'down' : 'up'}`, `${Math.abs(dy)} ${dy > 0 ? 'right' : 'left'}, ${Math.abs(dx)} ${dx > 0 ? 'up' : 'down'}`, `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}, ${Math.abs(dy)} ${dy > 0 ? 'down' : 'up'}`]; if (new Set(opts).size < 4) return null; return mcq(`A point moves from ${P(A)} to ${P(B)}. Describe the translation (squares).`, opts, 0, `x changes by ${sg(dx)}, y changes by ${sg(dy)}.`); }),
          gen(() => { const pts = pick([[[1, 1], [4, 1], [1, 3]], [[0, 0], [2, 0], [2, 2], [0, 2]], [[-1, 2], [1, 4], [3, 2]]]); const dx = U.RNZ(-5, 5), dy = U.RNZ(-5, 5); const w = (v, p, n) => `${Math.abs(v)} ${v > 0 ? p : n}`; return vertFill(pts, T.tr(dx, dy), { q: `A shape has vertices ${pts.map((p, i) => LET[i] + P(p)).join(', ')}. It is translated ${w(dx, 'right', 'left')} and ${w(dy, 'up', 'down')}. Work out the coordinates of the image.` }); }),
        ],
      },
      {
        id: '14.4', t: 'Reflecting shapes', vi: 'Phép đối xứng trục',
        goals: ['reflect shapes in the x-axis or y-axis on a coordinate grid.'],
        body: [
          ['p', 'To reflect a shape, take each vertex of the object one at a time and plot its reflection in the <b>mirror line</b>: the image vertex is the same distance from the mirror line, on the other side. Then join the reflected vertices. The x-axis is the horizontal axis; the y-axis is the vertical axis. The object and image are <b>congruent</b>.'],
          ['html', gridFig({ xmin: -4, xmax: 4, ymin: -4, ymax: 4, size: 26, polys: [{ pts: [[1, -1], [3, -1], [1, -3]], label: 'A' }, { pts: [[1, 1], [3, 1], [1, 3]], dash: true, label: 'B' }], max: 280 })],
          ['viz', 'reflectLab'],
          ['rule', 'Reflection in the x-axis: (x, y) → (x, −y). The x-coordinates stay the same.<br>Reflection in the y-axis: (x, y) → (−x, y). The y-coordinates stay the same.', 'Reflections on a grid'],
          ['vi', ['Đối xứng qua trục x: giữ nguyên x, đổi dấu y.', 'Đối xứng qua trục y: giữ nguyên y, đổi dấu x.', 'Mỗi đỉnh ảnh cách đường gương một khoảng bằng đỉnh vật, nằm phía bên kia.', 'Ảnh bằng vật nhưng bị “lật” (như soi gương).', 'Mẹo: lấy đối xứng từng đỉnh, chấm điểm, rồi nối lại.']],
        ],
        bank: [
          vertFill([[1, 2], [2, 4], [4, 4], [5, 2]], T.rx(), { q: 'Zara reflects trapezium ABCD, with A(1, 2), B(2, 4), C(4, 4) and D(5, 2), in the x-axis. Work out the vertices of the image.' }),
          multi('When you reflect a shape in the x-axis, which statements are true?', ['The x-coordinates of the object and image are the same', 'The y-coordinates change sign', 'The y-coordinates stay the same', 'The object and image are congruent'], [0, 1, 3], 'Reflection in the x-axis: (x, y) → (x, −y).', { fixed: true }),
          vertFill([[-4, 3], [-1, 3], [-1, 1], [-3, -2], [-4, 1]], T.ry(), { q: 'Kurt reflects pentagon ABCDE with A(−4, 3), B(−1, 3), C(−1, 1), D(−3, −2) and E(−4, 1) in the y-axis. Work out the image.', o: { d: 2 } }),
          mcq('When you reflect a shape in the y-axis, what happens to the coordinates?', ['The y-coordinates stay the same and the x-coordinates change sign', 'The x-coordinates stay the same and the y-coordinates change sign', 'Both coordinates change sign', 'Nothing changes'], 0, '(x, y) → (−x, y).'),
          coord('The point (3, 5) is reflected in the x-axis. What are the coordinates of its image?', [3, -5], '(x, y) → (x, −y).'),
          coord('The point (−2, 4) is reflected in the y-axis. What are the coordinates of its image?', [2, 4], '(x, y) → (−x, y).'),
          coord('The point (−3, −1) is reflected in the x-axis. Where is its image?', [-3, 1], 'Keep x, change the sign of y.'),
          mcq('Triangle A has vertices (1, 1), (3, 1), (1, 3). Which triangle is its reflection in the y-axis?', ['(−1, 1), (−3, 1), (−1, 3)', '(1, −1), (3, −1), (1, −3)', '(−1, −1), (−3, −1), (−1, −3)', '(1, 1), (−3, 1), (1, −3)'], 0, 'Change the sign of every x-coordinate.', { fig: gridFig({ xmin: -4, xmax: 4, ymin: -4, ymax: 4, size: 24, polys: [{ pts: [[1, 1], [3, 1], [1, 3]], label: 'A' }], max: 240 }) }),
          mcq('A point lies ON the mirror line. Where is its image?', ['in the same place', 'twice as far away', 'on the opposite axis', 'at the origin'], 0, 'Its distance from the mirror line is 0.'),
          mcq('Triangle A has vertices (1, 1), (3, 1), (1, 2). Triangle B has vertices (1, −1), (3, −1), (1, −2). Describe the transformation from A to B.', ['reflection in the x-axis', 'reflection in the y-axis', 'translation 2 squares down', 'rotation 90° clockwise about (0, 0)'], 0, 'x stays the same; y changes sign.', { d: 2 }),
          gen(() => { const p = [U.RNZ(-6, 6), U.RNZ(-6, 6)]; const ax = pick(['x', 'y']); const im = ax === 'x' ? T.rx()(p) : T.ry()(p); return coord(`The point ${P(p)} is reflected in the ${ax}-axis. What are the coordinates of its image?`, im, ax === 'x' ? 'Keep x, change the sign of y.' : 'Keep y, change the sign of x.'); }),
          gen(() => { const pts = pick([[[1, 1], [4, 1], [1, 3]], [[-3, 1], [-1, 1], [-1, 4]], [[2, -1], [4, -1], [4, -3], [2, -3]], [[1, 2], [3, 4], [5, 2]]]); const ax = pick(['x', 'y']); return vertFill(pts, ax === 'x' ? T.rx() : T.ry(), { q: `A shape has vertices ${pts.map((p, i) => LET[i] + P(p)).join(', ')}. Reflect it in the ${ax}-axis. Write the coordinates of the image.` }); }),
        ],
      },
      {
        id: '14.5', t: 'Rotating shapes', vi: 'Phép quay',
        goals: ['rotate shapes 90° and 180° around a centre of rotation on a coordinate grid.'],
        body: [
          ['p', 'When you rotate a shape, you turn it about a fixed point called the <b>centre of rotation</b>. You can rotate a shape <b>clockwise</b> or <b>anticlockwise</b>, and you must give the number of degrees — most often 90° or 180°. The object and image are always <b>congruent</b>.'],
          ['tip', 'Use tracing paper: trace the shape, put your pencil point on the centre of rotation, turn the paper 90° or 180°, then mark where the image is. A rotation of 180° gives the same image clockwise or anticlockwise.'],
          ['viz', 'rotateLab'],
          ['rule', 'About the origin (0, 0):<br>90° clockwise: (x, y) → (y, −x)<br>90° anticlockwise: (x, y) → (−y, x)<br>180°: (x, y) → (−x, −y)', 'Rotation rules (extension)'],
          ['ex', { t: 'Worked example 14.5', q: 'Draw the image of a shape after a rotation of 180° about the centre (4, 3).', steps: ['Trace the shape and put your pencil on (4, 3).', 'Turn the tracing paper 180° and mark the image.', 'Each image vertex is the same distance from (4, 3) as the object vertex, but on the opposite side: e.g. (5, 4) → (3, 2).'] }],
          ['vi', ['Phép quay cần: tâm quay, góc quay, chiều quay (cùng/ngược chiều kim đồng hồ).', 'Quay 180°: chiều nào cũng cho cùng một ảnh.', 'Quanh gốc O: 90° cùng chiều kim đồng hồ (x, y) → (y, −x); ngược chiều (x, y) → (−y, x); 180°: (x, y) → (−x, −y).', 'Ảnh và vật bằng nhau.']],
        ],
        bank: [
          mcq('Arun says: “When you rotate a shape through 180°, it doesn’t matter whether you turn it clockwise or anticlockwise.” Is he right?', ['Yes — half a turn either way ends in the same place', 'No — clockwise gives a different image', 'Only if the centre is the origin', 'Only for squares'], 0, 'Turning 180° one way is the same as 180° the other way.'),
          coord('The point (3, 1) is rotated 180° about the origin. Where is its image?', [-3, -1], '(x, y) → (−x, −y).'),
          coord('The point (2, 5) is rotated 90° clockwise about the origin. Where is its image?', [5, -2], '(x, y) → (y, −x).', { d: 2 }),
          coord('The point (4, 1) is rotated 90° anticlockwise about the origin. Where is its image?', [-1, 4], '(x, y) → (−y, x).', { d: 2 }),
          coord('The point (5, 4) is rotated 180° about the centre (4, 3). Where is its image?', [3, 2], '(5, 4) is 1 right and 1 up from (4, 3), so the image is 1 left and 1 down: (3, 2).', { d: 2 }),
          fill('A rectangle has vertices (1, 1), (5, 1), (5, 3) and (1, 3).', [8, 12], 'Area 4 × 2 = 8. After 180° about (4, 2) the image is (3, 1)–(7, 3); together they cover x = 1 to 7, y = 1 to 3: 6 × 2 = 12.', { f: 'Area of the rectangle: [] units² &nbsp; Rotate it 180° about (4, 2). The object and image together make one rectangle of area [] units²', d: 3 }),
          mcq('Arun says: “Whatever centre of rotation I use, the area of my combined shape will always be the total area of my two rectangles.” Is he correct?', ['No — if the object and image overlap, the combined area is less', 'Yes, always', 'Yes, but only for 90° rotations', 'No — it is always double'], 0, 'Overlapping parts are only counted once.', { d: 3 }),
          mcq('Maksim rotates a kite 90° anticlockwise, but his image is turned the wrong way. What has he probably done?', ['He rotated it 90° clockwise instead', 'He rotated it 180°', 'He reflected it in the x-axis', 'He translated it'], 0, 'Clockwise and anticlockwise images are on opposite sides.', { d: 2 }),
          multi('Which of these stay the same after a rotation?', ['side lengths', 'angles', 'area', 'the position of every vertex (except the centre)'], [0, 1, 2], 'A rotation gives a congruent image.', { fixed: true }),
          gen(() => { const p = [U.RNZ(-6, 6), U.RNZ(-6, 6)]; const [a, nm] = pick([[-90, '90° clockwise'], [90, '90° anticlockwise'], [180, '180°']]); const im = T.rot(a)(p); return coord(`The point ${P(p)} is rotated ${nm} about the origin. Where is its image?`, im, { '-90': '(x, y) → (y, −x)', 90: '(x, y) → (−y, x)', 180: '(x, y) → (−x, −y)' }[a] + ` → ${P(im)}.`, { d: a === 180 ? 1 : 2 }); }),
          gen(() => { const c = [R(1, 5), R(1, 4)]; const p = [c[0] + U.RNZ(-3, 3), c[1] + U.RNZ(-3, 3)]; const im = T.rot(180, c[0], c[1])(p); return coord(`The point ${P(p)} is rotated 180° about the centre ${P(c)}. Where is its image?`, im, `From the centre, ${P(p)} is ${sg(p[0] - c[0])} across and ${sg(p[1] - c[1])} up; the image is the opposite: ${P(im)}.`, { d: 2 }); }),
          gen(() => { const pts = pick([[[1, 1], [3, 1], [1, 2]], [[1, 0], [3, 0], [3, 2]], [[0, 1], [2, 1], [2, 3], [0, 3]]]); const [a, nm] = pick([[-90, '90° clockwise'], [90, '90° anticlockwise'], [180, '180°']]); return vertFill(pts, T.rot(a), { q: `A shape has vertices ${pts.map((p, i) => LET[i] + P(p)).join(', ')}. It is rotated ${nm} about the origin. Write the coordinates of the image.`, o: { d: 3 } }); }),
        ],
      },
      {
        id: '14.6', t: 'Enlarging shapes', vi: 'Phép phóng to',
        goals: ['enlarge shapes, using a positive whole number scale factor.'],
        body: [
          ['p', 'An <b>enlargement</b> of a shape is a copy that changes the lengths but keeps the same proportions. A 4 cm by 3 cm rectangle enlarged to 8 cm by 6 cm: every length on the image is twice as long, so the <b>scale factor</b> is 2. In an enlargement all the angles stay the same size. The object and image are <b>similar</b> shapes.'],
          ['viz', 'enlargeLab'],
          ['ex', { t: 'Worked example 14.6', q: 'Enlarge a right-angled triangle with base 2 squares and height 1 square using a scale factor of 3.', steps: ['Height of image: 3 × 1 = 3 squares.', 'Base of image: 3 × 2 = 6 squares.', 'Draw these two sides, then join them to complete the triangle.'] }],
          ['tip', 'Check that the scale factor works for EVERY side. Flag B (2 cm by 5 cm) is not an enlargement of flag A (1 cm by 2 cm): the height is doubled but the base is multiplied by 2.5.'],
          ['vi', ['Phóng to với hệ số k: mọi cạnh nhân với k, các góc giữ nguyên.', 'Vật và ảnh đồng dạng (cùng hình dạng, khác kích thước).', 'Tìm hệ số: chia độ dài cạnh ảnh cho cạnh tương ứng của vật — phải giống nhau với MỌI cạnh.', 'Chu vi cũng nhân với k (tỉ số chu vi = tỉ số độ dài).', 'Mở rộng: diện tích nhân với k².']],
        ],
        bank: [
          fill('A rectangle 3 cm by 2 cm is enlarged by scale factor 4.', [12, 8], '3 × 4 = 12; 2 × 4 = 8.', { f: 'Image: [] cm by [] cm' }),
          num('A triangle has sides 3 cm, 4 cm and 5 cm. It is enlarged by scale factor 3. What is the length of the longest side of the image?', 15, '5 × 3 = 15 cm.', { unit: 'cm' }),
          num('A shape has a side of 4 cm. The corresponding side of its enlargement is 12 cm. What is the scale factor?', 3, '12 ÷ 4 = 3.'),
          mcq('Flag A is 1 cm by 2 cm. Which flag is an enlargement of A?', ['Flag D: 4 cm by 8 cm', 'Flag B: 2 cm by 5 cm', 'Flag C: 3 cm by 5 cm'], 0, 'D: 4 ÷ 1 = 4 and 8 ÷ 2 = 4. B and C do not use the same factor for both sides.', { fixed: true }),
          mcq('Why is flag C (3 cm by 5 cm) not an enlargement of flag A (1 cm by 2 cm)?', ['The height is multiplied by 3 but the base by 2.5', 'It is too big', 'It has different angles', 'A flag cannot be enlarged'], 0, 'The scale factor must be the same for all lengths.'),
          multi('A shape is enlarged by scale factor 2. Which statements are true?', ['All the lengths are doubled', 'All the angles stay the same', 'The perimeter is doubled', 'All the angles are doubled'], [0, 1, 2], 'Lengths and perimeter × 2; angles unchanged.', { fixed: true }),
          fill('Rectangle A is 2 cm by 1 cm. Rectangle B is an enlargement with scale factor 3.', [6, 18, { opts: ['1 : 3', '1 : 9', '3 : 1', '1 : 6'], a: 0 }], 'Perimeter of A = 6 cm; B is 6 cm by 3 cm, perimeter 18 cm. Ratio 6 : 18 = 1 : 3.', { f: 'Perimeter of A: [] cm &nbsp; Perimeter of B: [] cm &nbsp; Ratio of perimeters: []', d: 2 }),
          mcq('Rafael enlarges a shape by scale factor 3, but he adds 3 squares to every side instead. What is his mistake?', ['He should MULTIPLY every length by 3, not add 3', 'He should divide by 3', 'He should multiply only the horizontal sides', 'There is no mistake'], 0, 'An enlargement multiplies lengths by the scale factor.'),
          mcq('Extension: a square of side 2 cm is enlarged by scale factor 3. What happens to its area?', ['It is multiplied by 9 (4 cm² → 36 cm²)', 'It is multiplied by 3', 'It is multiplied by 6', 'It stays the same'], 0, 'Side 6 cm → area 36 cm² = 9 × 4 cm². Areas multiply by k².', { d: 3 }),
          gen(() => { const a = R(1, 6), b = R(1, 6), k = R(2, 5); return fill(`A rectangle ${a} cm by ${b} cm is enlarged by scale factor ${k}. What are the dimensions and the perimeter of the image?`, [a * k, b * k, 2 * (a + b) * k], `${a} × ${k} = ${a * k}; ${b} × ${k} = ${b * k}; perimeter ${2 * (a + b) * k} cm.`, { f: '[] cm by [] cm, perimeter [] cm' }); }),
          gen(() => { const s0 = R(2, 9), k = R(2, 6); return num(`A side of length ${s0} cm becomes ${s0 * k} cm after an enlargement. What is the scale factor?`, k, `${s0 * k} ÷ ${s0} = ${k}.`); }),
          gen(() => { const a = R(1, 5), b = R(2, 6), k = R(2, 4), w = R(1, 2); const B2 = b * k + (w === 1 ? 0 : 1); const yes = B2 === b * k; return mcq(`Shape P is ${a} cm by ${b} cm. Shape Q is ${a * k} cm by ${B2} cm. Is Q an enlargement of P?`, [`Yes, scale factor ${k}`, 'No'], yes ? 0 : 1, yes ? `Both sides are multiplied by ${k}.` : `${a * k} ÷ ${a} = ${k} but ${B2} ÷ ${b} = ${N(U.round(B2 / b, 2))}.`, { fixed: true }); }),
        ],
      },
    ],
    explore: {
      title: 'Transformations in art, games and giant wheels', hero: 'heroTransform',
      lead: 'Artists build patterns with reflections, video games move characters with translations and rotations, and maps shrink the whole world with an enlargement in reverse.',
      leadVi: 'Hoạ sĩ tạo hoa văn bằng phép đối xứng, trò chơi điện tử di chuyển nhân vật bằng tịnh tiến và quay, còn bản đồ thu nhỏ cả thế giới bằng một “phép phóng to ngược”.',
      cards: [
        { t: 'Make a kaleidoscope', p: 'A kaleidoscope uses mirrors to reflect a few coloured pieces again and again. Draw a single line and watch the mirrors turn it into a symmetrical pattern.', viz: 'kaleidoscope' },
        { t: 'A giant rotation', p: 'The Singapore Flyer takes about 32 minutes to make one complete turn. The wheel rotates, yet every capsule stays upright — each capsule is really being translated around a circle.', viz: 'ferrisWheel' },
        { t: 'Moving a game character', p: 'In a video game, the computer stores the coordinates of every corner of a character. To move it right, it adds to every x-coordinate — exactly the translation rule you learned. Rotations and reflections are just more coordinate rules.', viz: 'translateLab' },
        { t: 'Bigger and bigger', p: 'Photographers, architects and model-makers use enlargements. When lengths are multiplied by k, the area is multiplied by k × k. That is why a pizza 2 times as wide has 4 times as much to eat!', viz: 'enlargeLab' },
      ],
      facts: [['165 m', 'Singapore Flyer', 'Height of the wheel, with 28 capsules.'], ['11.25°', 'per minute', '360° ÷ 32 minutes.'], ['17', 'wallpaper patterns', 'Every repeating pattern on a flat wall uses one of 17 types of symmetry.'], ['1 : 50 000', 'walking maps', '2 cm on the map is 1 km.']],
      challenge: { t: 'Two reflections make…?', p: 'Reflect the point (3, 2) in the x-axis, then reflect the image in the y-axis. Where does it end up? Which single transformation does the same thing?', a: '(3, 2) → (3, −2) → (−3, −2). The same as a rotation of 180° about the origin: (x, y) → (−x, −y).' },
    },
    reading: {
      title: 'The Artist Who Tiled the Plane', sub: 'M. C. Escher and the mathematics of patterns. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Maurits Cornelis Escher was born in the Netherlands in 1898. At school he was not good at mathematics, and he later studied to become an artist. Yet today his pictures are loved by mathematicians all over the world.',
        'In 1936 Escher visited the Alhambra, a palace in Granada, Spain. Its walls are covered with colourful tiles that fit together without any gaps or overlaps. Escher spent days copying the patterns. He realised that each pattern was made from one shape repeated again and again by translating, rotating and reflecting it.',
        'A pattern of shapes that covers a flat surface with no gaps is called a tessellation. Squares, equilateral triangles and regular hexagons tessellate easily. Escher wanted to do something more exciting: he changed the edges of simple shapes so that the tiles became birds, fish, lizards and horses — and they still fitted together perfectly.',
        'To check his ideas, Escher read articles by mathematicians about the different types of repeating pattern. Mathematicians had proved that there are exactly 17 types of symmetry for patterns that repeat across a flat wall. Escher used many of them, often without knowing their mathematical names.',
        'Escher died in 1972, but his work still inspires artists, game designers and scientists. When you translate or rotate a shape on a grid, you are using the same ideas that Escher used to create his famous impossible worlds.',
      ],
      gloss: [['palace', 'cung điện'], ['tile', 'viên gạch lát'], ['gap', 'khoảng hở'], ['overlap', 'chồng lên nhau'], ['tessellation', 'phép lát phẳng'], ['inspire', 'truyền cảm hứng']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'What did Escher notice about the tiles in the Alhambra?', opts: ['Each pattern was one shape repeated by transformations', 'They were all square', 'They had gaps between them', 'They were painted by mathematicians'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'What is a tessellation?', opts: ['a pattern of shapes covering a surface with no gaps', 'a type of palace', 'a reflection in a mirror', 'a shape with 17 sides'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'How did Escher make his tiles more exciting?', opts: ['He changed the edges so they became animals', 'He used more colours', 'He made them bigger', 'He left gaps between them'], a: 0, ex: 'Paragraph C.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'Escher was very good at mathematics at school.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'There are exactly 17 types of symmetry for patterns repeating across a flat wall.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph D.' },
          { type: 'mcq', q: 'Escher visited the Alhambra with his brother.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'The text does not say who went with him.' },
        ] },
        { title: 'Details', qs: [
          { type: 'fill', q: 'Complete with numbers from the text.', f: 'Escher was born in [] and visited the Alhambra in []. He died in [].', a: [1898, 1936, 1972], ex: 'Paragraphs A, B and E.' },
          { type: 'mcq', q: 'Which shapes tessellate easily, according to the text?', opts: ['squares, equilateral triangles and regular hexagons', 'circles and ovals', 'pentagons and octagons', 'only squares'], a: 0, ex: 'Paragraph C.' },
        ] },
      ],
    },
    listening: {
      title: 'Orienteering in the forest', intro: 'Ella and Sam use a map during an orienteering race. Listen and answer.',
      voices: { Ella: 'airy', Sam: 'rounded' },
      lines: [
        { spk: 'Ella', text: 'Sam, the scale of our map is one to twenty-five thousand. So one centimetre on the map is twenty-five thousand centimetres in real life.' },
        { spk: 'Sam', text: 'That’s two hundred and fifty metres, or a quarter of a kilometre.' },
        { spk: 'Ella', text: 'The next checkpoint is six centimetres away on the map. Six times two hundred and fifty metres is one thousand five hundred metres.' },
        { spk: 'Sam', text: 'One and a half kilometres. If we walk at four kilometres an hour, it will take us about twenty-two minutes.' },
        { spk: 'Ella', text: 'There’s a lake in the way. It’s two centimetres wide on the map, so it is five hundred metres across.' },
        { spk: 'Sam', text: 'Then let’s go around it. The path goes three centimetres north and then four centimetres east.' },
        { spk: 'Ella', text: 'That’s seven centimetres altogether, so one point seven five kilometres. It’s a bit longer, but our feet will stay dry!' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'Map scale 1 : []. 1 cm on the map = [] m. Next checkpoint: [] cm on the map = [] m. The lake is [] m across.', a: [25000, 250, 6, 1500, 500], ex: '6 × 250 = 1500; 2 × 250 = 500.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why do they not walk straight to the checkpoint?', opts: ['There is a lake in the way', 'It is too far', 'The path is closed', 'They are lost'], a: 0, ex: 'Ella mentions the lake.' },
          { type: 'mcq', q: 'How long is the path around the lake?', opts: ['1.75 km', '1.5 km', '0.5 km', '7 km'], a: 0, ex: '7 cm × 250 m = 1750 m.' },
          { type: 'num', q: 'About how many minutes will 1.5 km take at 4 km per hour?', a: [22, 22.5, 23], ex: '1.5 ÷ 4 = 0.375 hours = 22.5 minutes.' },
        ] },
      ],
    },
  });
})();
