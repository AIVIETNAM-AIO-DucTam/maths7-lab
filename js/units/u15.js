/* Unit 15 — Shapes, area and volume */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, expr, gen } = Q;
  const cuboidFig = (l, w, hh, u = 'cm', o = {}) => { const sc = o.sc || Math.min(26, 150 / Math.max(l, w, hh)); const L = l * sc, W = w * sc * 0.55, H = hh * sc; const x0 = 20, y0 = 20 + W + H; const pts = (arr) => arr.map((p) => p.join(',')).join(' '); const A = [x0, y0], B = [x0 + L, y0], C = [x0 + L + W, y0 - W], D = [x0 + W, y0 - W]; const up = (p) => [p[0], p[1] - H]; const Wd = x0 + L + W + 70, Ht = y0 + 26; return `<svg viewBox="0 0 ${Wd} ${Ht}" style="width:100%;max-width:${Math.min(320, Wd)}px"><polygon points="${pts([A, B, up(B), up(A)])}" fill="color-mix(in srgb, var(--geometry) 30%, transparent)" stroke="var(--ink)" stroke-width="2"/><polygon points="${pts([B, C, up(C), up(B)])}" fill="color-mix(in srgb, var(--geometry) 45%, transparent)" stroke="var(--ink)" stroke-width="2"/><polygon points="${pts([up(A), up(B), up(C), up(D)])}" fill="color-mix(in srgb, var(--geometry) 18%, transparent)" stroke="var(--ink)" stroke-width="2"/><text x="${x0 + L / 2}" y="${y0 + 18}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">${o.ll || N(l) + ' ' + u}</text><text x="${x0 + L + W / 2 + 10}" y="${y0 - W / 2 + 10}" font-size="13" font-weight="700" fill="var(--ink)">${o.wl || N(w) + ' ' + u}</text><text x="${x0 + L + W + 6}" y="${y0 - W - H / 2 + 4}" font-size="13" font-weight="700" fill="var(--ink)">${o.hl || N(hh) + ' ' + u}</text></svg>`; };
  const triFig = (b, hh, u = 'cm', off = 0.35, o = {}) => { const sc = Math.min(22, 230 / Math.max(b, hh * 1.4)); const x0 = 24, y0 = 18 + hh * sc; const ax = x0 + b * sc * off; return `<svg viewBox="0 0 ${b * sc + 70} ${y0 + 26}" style="width:100%;max-width:${Math.min(300, b * sc + 70)}px"><polygon points="${x0},${y0} ${x0 + b * sc},${y0} ${ax},${y0 - hh * sc}" fill="color-mix(in srgb, var(--geometry) 30%, transparent)" stroke="var(--ink)" stroke-width="2"/><line x1="${ax}" y1="${y0}" x2="${ax}" y2="${y0 - hh * sc}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 4"/><rect x="${ax}" y="${y0 - 9}" width="9" height="9" fill="none" stroke="var(--accent)"/><text x="${x0 + (b * sc) / 2}" y="${y0 + 18}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">${N(b)} ${u}</text><text x="${ax + 6}" y="${y0 - (hh * sc) / 2}" font-size="13" font-weight="700" fill="var(--accent)">${N(hh)} ${u}</text>${o.slant ? `<text x="${x0 + b * sc * 0.75 + 10}" y="${y0 - (hh * sc) / 2}" font-size="13" font-weight="700" fill="var(--ink)">${o.slant}</text>` : ''}</svg>`; };

  /* ---------- widgets ---------- */
  APP.viz.areaUnits = function (el) {
    const f = VZ.frame(el, 'Đổi đơn vị diện tích: vì sao là × 100, × 10 000?', { icon: 'grid' });
    const M = { mm: ['cm²', 'mm²', 10, 100, '1 cm = 10 mm'], cm: ['m²', 'cm²', 100, 10000, '1 m = 100 cm'], ha: ['ha', 'm²', 100, 10000, '1 ha là hình vuông cạnh 100 m'] };
    let key = 'mm', v = 5, dir = 1, zoom = 0; const W = 300, svg = VZ.svg(W, W); const box = h('div', { style: { textAlign: 'center', fontSize: '1.15rem', margin: '6px 0' } }); f.stage.append(svg, box);
    function draw() {
      const [big, small, side, fac, note] = M[key]; svg.innerHTML = ''; const n = 10, c = (W - 20) / n;
      svg.append(s('rect', { x: 10, y: 10, width: W - 20, height: W - 20, fill: 'color-mix(in srgb, var(--geometry) 16%, transparent)', stroke: 'var(--geometry)', 'stroke-width': 3 }));
      for (let i = 1; i < n; i++) svg.append(s('line', { x1: 10 + i * c, y1: 10, x2: 10 + i * c, y2: W - 10, stroke: 'var(--geometry)', 'stroke-width': 1, opacity: zoom, style: 'transition:opacity .6s' }), s('line', { x1: 10, y1: 10 + i * c, x2: W - 10, y2: 10 + i * c, stroke: 'var(--geometry)', 'stroke-width': 1, opacity: zoom, style: 'transition:opacity .6s' }));
      svg.append(s('rect', { x: 10, y: 10, width: c, height: c, fill: 'var(--accent)', opacity: zoom * 0.8 }), s('text', { x: W / 2, y: W / 2 + 10, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: 'var(--ink)', text: '1 ' + big, opacity: 1 - zoom * 0.6 }));
      const res = dir > 0 ? v * fac : v / fac; box.innerHTML = dir > 0 ? `${N(v)} ${big} = ${N(v)} × ${N(fac)} = <b style="color:var(--accent)">${N(U.round(res, 6))} ${small}</b>` : `${N(v)} ${small} = ${N(v)} ÷ ${N(fac)} = <b style="color:var(--accent)">${N(U.round(res, 6))} ${big}</b>`;
      f.out.innerHTML = `${note}. Mỗi cạnh chia thành ${side} phần → ${side} × ${side} = <b>${N(fac)}</b> ô vuông nhỏ${key === 'mm' ? '' : ` (mỗi ô vẽ ở đây đại diện cho ${N(fac / 100)} ô)`}: <b>1 ${big} = ${N(fac)} ${small}</b>. Đơn vị lớn → nhỏ: NHÂN; nhỏ → lớn: CHIA.`;
    }
    f.ctrls.append(VZ.seg([['mm', 'cm² ↔ mm²'], ['cm', 'm² ↔ cm²'], ['ha', 'ha ↔ m²']], key, (k) => { key = k; zoom = 0; draw(); setTimeout(() => { zoom = 1; draw(); }, 60); }), VZ.seg([[1, 'lớn → nhỏ'], [-1, 'nhỏ → lớn']], dir, (d) => { dir = +d; draw(); }), VZ.range('Giá trị', 0.05, 100, v, 0.05, (x) => { v = x; draw(); }), VZ.btn('Chia ô ▦', () => { zoom = zoom ? 0 : 1; SFX.play('pop'); draw(); }, 'btn sm sc'));
    draw(); setTimeout(() => { zoom = 1; draw(); }, 500);
  };
  APP.viz.hectareField = function (el) {
    const f = VZ.frame(el, 'Héc-ta: mỗi ô vuông 100 m × 100 m = 1 ha', { icon: 'grid' });
    let L = 350, Wd = 280, price = 12400, pitch = true; const W = 360, H = 240, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const sc = Math.min((W - 20) / Math.max(L, 120), (H - 20) / Math.max(Wd, 80)); const x0 = 10, y0 = 10;
      svg.append(s('rect', { x: x0, y: y0, width: L * sc, height: Wd * sc, fill: 'color-mix(in srgb, #7ccf8a 45%, transparent)', stroke: '#2e7d32', 'stroke-width': 2.5, style: 'transition:all .3s' }));
      for (let x = 100; x < L; x += 100) svg.append(s('line', { x1: x0 + x * sc, y1: y0, x2: x0 + x * sc, y2: y0 + Wd * sc, stroke: '#1b5e20', 'stroke-dasharray': '4 4', opacity: 0.7 }));
      for (let y = 100; y < Wd; y += 100) svg.append(s('line', { x1: x0, y1: y0 + y * sc, x2: x0 + L * sc, y2: y0 + y * sc, stroke: '#1b5e20', 'stroke-dasharray': '4 4', opacity: 0.7 }));
      if (L >= 100 && Wd >= 100) svg.append(s('rect', { x: x0, y: y0, width: 100 * sc, height: 100 * sc, fill: 'rgba(255,209,102,.55)', stroke: '#b38b00', 'stroke-width': 2 }), s('text', { x: x0 + 50 * sc, y: y0 + 50 * sc + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#5a4500', text: '1 ha' }));
      if (pitch && L >= 105 && Wd >= 68) { const px = x0 + (L - 105) * sc - 4, py = y0 + (Wd - 68) * sc - 4; svg.append(s('rect', { x: px, y: py, width: 105 * sc, height: 68 * sc, fill: 'rgba(255,255,255,.25)', stroke: '#fff', 'stroke-width': 2 }), s('line', { x1: px + 52.5 * sc, y1: py, x2: px + 52.5 * sc, y2: py + 68 * sc, stroke: '#fff', 'stroke-width': 1.5 }), s('circle', { cx: px + 52.5 * sc, cy: py + 34 * sc, r: 9.15 * sc, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 })); }
      const m2 = L * Wd, ha = m2 / 10000; f.out.innerHTML = `${L} m × ${Wd} m = <b>${N(m2)} m²</b> = ${N(m2)} ÷ 10 000 = <b>${N(U.round(ha, 4))} ha</b>. Giá $${N(price)}/ha → tổng <b>$${N(U.round(ha * price, 2))}</b>. ${pitch ? 'Sân bóng đá (105 m × 68 m ≈ 0,71 ha) vẽ màu trắng để so sánh.' : ''}`;
    }
    f.ctrls.append(VZ.range('Chiều dài (m)', 50, 1500, L, 10, (v) => { L = v; draw(); }), VZ.range('Chiều rộng (m)', 50, 1000, Wd, 10, (v) => { Wd = v; draw(); }), VZ.range('Giá $/ha', 1000, 20000, price, 100, (v) => { price = v; draw(); }), VZ.btn('Sân bóng', () => { pitch = !pitch; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.triangleArea = function (el) {
    const f = VZ.frame(el, 'Diện tích tam giác = ½ × đáy × chiều cao', { icon: 'grid' });
    let b = 8, hh = 5, ax = 3, showRect = true; const cs = 26, W = 12 * cs + 40, H = 8 * cs + 40, svg = VZ.svg(W, H); f.stage.append(svg);
    const X = (x) => 20 + x * cs, Y = (y) => H - 20 - y * cs;
    const handle = s('circle', { r: 12, fill: 'var(--accent)', stroke: '#fff', 'stroke-width': 3 }); const layer = s('g'); svg.append(layer, handle);
    function draw() {
      layer.innerHTML = ''; for (let i = 0; i <= 12; i++) layer.append(s('line', { x1: X(i), y1: Y(0), x2: X(i), y2: Y(8), stroke: 'var(--line)' })); for (let j = 0; j <= 8; j++) layer.append(s('line', { x1: X(0), y1: Y(j), x2: X(12), y2: Y(j), stroke: 'var(--line)' }));
      const bx0 = 1, bx1 = 1 + b; if (showRect) layer.append(s('rect', { x: X(bx0), y: Y(hh), width: b * cs, height: hh * cs, fill: 'color-mix(in srgb, var(--number) 12%, transparent)', stroke: 'var(--number)', 'stroke-dasharray': '6 4', 'stroke-width': 2 }));
      layer.append(s('polygon', { points: `${X(bx0)},${Y(0)} ${X(bx1)},${Y(0)} ${X(ax)},${Y(hh)}`, fill: 'color-mix(in srgb, var(--geometry) 40%, transparent)', stroke: 'var(--geometry)', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      const fx0 = Math.min(Math.max(ax, -1), 12); layer.append(s('line', { x1: X(fx0), y1: Y(0), x2: X(ax), y2: Y(hh), stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }));
      if (ax < bx0 || ax > bx1) layer.append(s('line', { x1: X(Math.min(ax, bx0)), y1: Y(0), x2: X(Math.max(ax, bx1)), y2: Y(0), stroke: 'var(--accent)', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }));
      layer.append(s('text', { x: (X(bx0) + X(bx1)) / 2, y: Y(0) + 16, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--geometry)', text: `đáy b = ${b}` }), s('text', { x: X(ax) + 8, y: (Y(0) + Y(hh)) / 2, 'font-size': 13, 'font-weight': 800, fill: 'var(--accent)', text: `h = ${hh}` }));
      handle.setAttribute('cx', X(ax)); handle.setAttribute('cy', Y(hh));
      f.out.innerHTML = `A = ½ × ${b} × ${hh} = <b>${N((b * hh) / 2)} đơn vị²</b> — đúng một nửa hình chữ nhật ${b} × ${hh} = ${b * hh}. Kéo đỉnh sang ngang: diện tích KHÔNG đổi vì đáy và chiều cao không đổi! Chiều cao luôn vuông góc với đáy (có thể nằm ngoài tam giác).`;
    }
    VZ.drag(svg, handle, (p) => { const nx = Math.max(0, Math.min(12, Math.round((p.x - 20) / cs * 2) / 2)), ny = Math.max(1, Math.min(8, Math.round((H - 20 - p.y) / cs))); if (nx !== ax || ny !== hh) { ax = nx; hh = ny; SFX.play('tick'); draw(); } });
    f.ctrls.append(VZ.range('Đáy b', 2, 10, b, 1, (v) => { b = v; draw(); }), VZ.btn('Hình chữ nhật bao', () => { showRect = !showRect; draw(); }, 'btn sm ghost'));
    draw();
  };
  const iso = (x, y, z, sc, ox, oy) => [ox + (x - y) * sc * 0.866, oy + (x + y) * sc * 0.5 - z * sc];
  const cubeFaces = (x, y, z, sc, ox, oy) => { const P2 = (a, b2, c) => iso(a, b2, c, sc, ox, oy).map((v) => v.toFixed(1)).join(','); return { top: [P2(x, y, z + 1), P2(x + 1, y, z + 1), P2(x + 1, y + 1, z + 1), P2(x, y + 1, z + 1)].join(' '), left: [P2(x, y + 1, z), P2(x + 1, y + 1, z), P2(x + 1, y + 1, z + 1), P2(x, y + 1, z + 1)].join(' '), right: [P2(x + 1, y, z), P2(x + 1, y + 1, z), P2(x + 1, y + 1, z + 1), P2(x + 1, y, z + 1)].join(' ') }; };
  APP.viz.cuboidBuilder = function (el) {
    const f = VZ.frame(el, 'Xếp hình hộp từ các khối lập phương 1 cm³', { icon: 'atom' });
    let l = 4, w = 3, hh = 2; const W = 360, H = 280, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw(anim) {
      svg.innerHTML = ''; const sc = Math.min(30, 250 / (l + w + hh * 1.2)); const ox = W / 2 - ((l - w) * sc * 0.866) / 2, oy = H - 20 - (l + w) * sc * 0.5;
      const cubes = []; for (let z = 0; z < hh; z++) for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) cubes.push([x, y, z]); cubes.sort((a, b2) => a[0] + a[1] + a[2] - (b2[0] + b2[1] + b2[2]) || a[2] - b2[2]);
      cubes.forEach(([x, y, z]) => { const F = cubeFaces(x, y, z, sc, ox, oy); const g = s('g', { style: anim ? `animation:popIn .3s ${z * 0.35 + (x + y) * 0.03}s both` : '' }); const hue = 200 + z * 25; g.append(s('polygon', { points: F.left, fill: `hsl(${hue} 70% 48%)`, stroke: '#fff', 'stroke-width': 1 }), s('polygon', { points: F.right, fill: `hsl(${hue} 70% 38%)`, stroke: '#fff', 'stroke-width': 1 }), s('polygon', { points: F.top, fill: `hsl(${hue} 75% 64%)`, stroke: '#fff', 'stroke-width': 1 })); svg.append(g); });
      f.out.innerHTML = `Mỗi lớp có ${l} × ${w} = <b>${l * w}</b> khối; có ${hh} lớp → V = ${l} × ${w} × ${hh} = <b>${l * w * hh} cm³</b>. Công thức: <b>V = l × w × h</b>.`;
    }
    f.ctrls.append(VZ.range('Dài l', 1, 6, l, 1, (v) => { l = v; draw(); }), VZ.range('Rộng w', 1, 6, w, 1, (v) => { w = v; draw(); }), VZ.range('Cao h', 1, 5, hh, 1, (v) => { hh = v; draw(); }), VZ.btn('Xếp lại ▶', () => { SFX.play('whoosh'); draw(true); }, 'btn sm sc'));
    draw(true);
  };
  APP.viz.netUnfold = function (el) {
    const f = VZ.frame(el, 'Mở hình hộp thành lưới (net) — diện tích bề mặt', { icon: 'eye' });
    let L = 5, W = 3, H = 2, th = 90, anim = null; const box = h('div', { style: { height: 'min(90vw, 330px)', perspective: '1100px', display: 'grid', placeItems: 'center', overflow: 'hidden' } }); f.stage.append(box);
    const face = (cls, w, hh, col, lab) => h('div', { class: 'f3', style: { position: 'absolute', width: w + 'px', height: hh + 'px', background: col, border: '2px solid rgba(0,0,0,.35)', boxSizing: 'border-box', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: '12px', textShadow: '0 1px 2px rgba(0,0,0,.5)', transformStyle: 'preserve-3d', backfaceVisibility: 'visible' } }, lab);
    let root, fr, bk, tp, lf, rt;
    function build() {
      const u = Math.min(26, 230 / (W * 2 + H * 2), 280 / (L + H * 2)); box.innerHTML = '';
      const cR = 'rgba(239,71,111,.82)', cB = 'rgba(79,140,255,.82)', cG = 'rgba(6,214,160,.82)';
      root = face('b', L * u, W * u, cR, `${L}×${W}`); root.style.position = 'relative';
      fr = face('f', L * u, H * u, cB, `${L}×${H}`); fr.style.left = '-2px'; fr.style.top = W * u - 2 + 'px'; fr.style.transformOrigin = '50% 0';
      bk = face('k', L * u, H * u, cB, `${L}×${H}`); bk.style.left = '-2px'; bk.style.top = -H * u - 2 + 'px'; bk.style.transformOrigin = '50% 100%';
      tp = face('t', L * u, W * u, cR, `${L}×${W}`); tp.style.left = '-2px'; tp.style.top = -W * u + 'px'; tp.style.transformOrigin = '50% 100%'; bk.append(tp);
      lf = face('l', H * u, W * u, cG, `${H}×${W}`); lf.style.left = -H * u - 2 + 'px'; lf.style.top = '-2px'; lf.style.transformOrigin = '100% 50%';
      rt = face('r', H * u, W * u, cG, `${H}×${W}`); rt.style.left = L * u - 2 + 'px'; rt.style.top = '-2px'; rt.style.transformOrigin = '0 50%';
      root.append(fr, bk, lf, rt); box.append(root); pose();
    }
    function pose() {
      const k = th / 90; root.style.transform = `translateY(${(1 - k) * 10}px) rotateX(${20 + 38 * k}deg) rotateZ(${-32 * k}deg)`; root.style.transformStyle = 'preserve-3d';
      fr.style.transform = `rotateX(${th}deg)`; bk.style.transform = `rotateX(${-th}deg)`; tp.style.transform = `rotateX(${-th}deg)`; lf.style.transform = `rotateY(${th}deg)`; rt.style.transform = `rotateY(${-th}deg)`;
      const a = L * W, b2 = L * H, c = W * H; f.out.innerHTML = `3 cặp mặt bằng nhau: <span style="color:#ef476f">■</span> ${L}×${W} = ${a}, <span style="color:#4f8cff">■</span> ${L}×${H} = ${b2}, <span style="color:#06d6a0">■</span> ${W}×${H} = ${c}. Diện tích bề mặt = 2 × ${a} + 2 × ${b2} + 2 × ${c} = <b>${2 * (a + b2 + c)} đơn vị²</b>. Thể tích = ${L} × ${W} × ${H} = ${L * W * H} đơn vị³.`;
    }
    const go = (to) => { if (anim) anim(); const from = th; SFX.play('whoosh'); anim = VZ.animate(1400, (e) => { th = from + (to - from) * e; pose(); }, () => SFX.play('pop')); };
    f.ctrls.append(VZ.btn('Mở ra ⤢', () => go(0), 'btn sm sc'), VZ.btn('Gấp lại ⤡', () => go(90)), VZ.range('Dài', 2, 7, L, 1, (v) => { L = v; build(); }), VZ.range('Rộng', 1, 5, W, 1, (v) => { W = v; build(); }), VZ.range('Cao', 1, 5, H, 1, (v) => { H = v; build(); }));
    build(); setTimeout(() => go(0), 900);
  };
  APP.viz.cubeRemove = function (el) {
    const f = VZ.frame(el, 'Dự án: rút bớt khối lập phương — diện tích bề mặt thay đổi thế nào?', { icon: 'target' });
    let S = new Set(); const key = (x, y, z) => `${x},${y},${z}`; const reset = () => { S = new Set(); for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) S.add(key(x, y, z)); }; reset();
    const W = 320, H = 280, svg = VZ.svg(W, H); f.stage.append(svg);
    const has = (x, y, z) => S.has(key(x, y, z));
    function sa() { let c = 0; S.forEach((k) => { const [x, y, z] = k.split(',').map(Number); [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(([a, b2, d]) => { if (!has(x + a, y + b2, z + d)) c++; }); }); return c; }
    function draw() {
      svg.innerHTML = ''; const sc = 40, ox = W / 2, oy = H - 30 - 3 * sc;
      const arr = [...S].map((k) => k.split(',').map(Number)).sort((a, b2) => a[0] + a[1] + a[2] - (b2[0] + b2[1] + b2[2]) || a[2] - b2[2]);
      arr.forEach(([x, y, z]) => { const F = cubeFaces(x, y, z, sc, ox, oy); const g = s('g', { style: 'cursor:pointer' }); if (!has(x, y + 1, z)) g.append(s('polygon', { points: F.left, fill: '#4f8cff', stroke: '#fff', 'stroke-width': 1.5 })); if (!has(x + 1, y, z)) g.append(s('polygon', { points: F.right, fill: '#2f62c9', stroke: '#fff', 'stroke-width': 1.5 })); if (!has(x, y, z + 1)) g.append(s('polygon', { points: F.top, fill: '#8db5ff', stroke: '#fff', 'stroke-width': 1.5 })); g.addEventListener('click', () => { if (S.size <= 1) return; S.delete(key(x, y, z)); SFX.play('pop'); draw(); }); svg.append(g); });
      const A = sa(); f.out.innerHTML = `Thể tích: <b>${S.size} cm³</b> · Diện tích bề mặt: <b>${A} cm²</b> ${A === 54 ? '(bằng khối 3×3×3 ban đầu!)' : A > 54 ? `(tăng ${A - 54})` : `(giảm ${54 - A})`}. Chạm vào một khối để rút ra. Thử: rút khối ở góc, ở cạnh, ở giữa mặt — diện tích thay đổi khác nhau!`;
    }
    f.ctrls.append(VZ.btn('Làm lại', () => { reset(); SFX.play('tap'); draw(); }, 'btn sm sc'));
    draw();
  };
  APP.viz.saVolume = function (el) {
    const f = VZ.frame(el, 'Diện tích bề mặt so với thể tích — vì sao voi có tai to?', { icon: 'atom' });
    let n = 3; const W = 360, H = 220, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const sc = Math.min(18, 110 / n); const ox = 80, oy = 150;
      const P2 = (x, y, z) => iso(x, y, z, sc, ox, oy).join(','); svg.append(s('polygon', { points: [P2(0, n, 0), P2(n, n, 0), P2(n, n, n), P2(0, n, n)].join(' '), fill: '#4f8cff' }), s('polygon', { points: [P2(n, 0, 0), P2(n, n, 0), P2(n, n, n), P2(n, 0, n)].join(' '), fill: '#2f62c9' }), s('polygon', { points: [P2(0, 0, n), P2(n, 0, n), P2(n, n, n), P2(0, n, n)].join(' '), fill: '#8db5ff' }));
      const L = 200, B = 190, gw = 150, gh = 160; svg.append(s('line', { x1: L, y1: B, x2: L + gw, y2: B, stroke: 'var(--ink)' }), s('line', { x1: L, y1: B, x2: L, y2: B - gh, stroke: 'var(--ink)' }), s('text', { x: L + gw, y: B + 14, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: 'cạnh n' }), s('text', { x: L + 4, y: B - gh + 4, 'font-size': 10, fill: 'var(--ink-2)', text: 'SA : V = 6/n' }));
      let d = ''; for (let k = 1; k <= 10; k += 0.1) d += (k === 1 ? 'M' : 'L') + (L + ((k - 1) / 9) * gw).toFixed(1) + ' ' + (B - (6 / k / 6) * gh).toFixed(1) + ' '; svg.append(s('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5 }), s('circle', { cx: L + ((n - 1) / 9) * gw, cy: B - (1 / n) * gh, r: 6, fill: 'var(--bad)' }));
      const SA = 6 * n * n, V = n ** 3; f.out.innerHTML = `Cạnh ${n}: diện tích bề mặt 6 × ${n}² = <b>${SA}</b>, thể tích ${n}³ = <b>${V}</b>, tỉ số SA : V = <b>${N(U.round(SA / V, 2))}</b>. ${n <= 2 ? '🐭 Vật nhỏ: bề mặt lớn so với thể tích → mất nhiệt rất nhanh (chuột phải ăn liên tục).' : n >= 7 ? '🐘 Vật lớn: bề mặt nhỏ so với thể tích → khó toả nhiệt, nên voi cần đôi tai to để làm mát.' : 'Khi kích thước tăng, thể tích tăng nhanh hơn diện tích bề mặt.'}`;
    }
    f.ctrls.append(VZ.range('Cạnh n', 1, 10, n, 1, (v) => { n = v; SFX.play('tick'); draw(); }));
    draw();
  };
  APP.viz.zoomAreas = function (el) {
    const f = VZ.frame(el, 'Từ Vatican đến Thái Bình Dương — so sánh diện tích', { icon: 'eye' });
    const D = [['Vatican City', 0.44, '#ffd166'], ['Grenada', 344, '#06d6a0'], ['Lake Superior', 82100, '#4f8cff'], ['Caspian Sea', 371000, '#3ba7ff'], ['Greenland', 2166000, '#e0e0e0'], ['Arctic Ocean', 15500000, '#9bd0ff'], ['Russia', 17100000, '#ef476f'], ['Pacific Ocean', 155000000, '#1f4fd8']];
    let k = 3; const box = h('div', { style: { position: 'relative', height: 'min(80vw, 300px)', borderRadius: '12px', background: 'var(--surface)', overflow: 'hidden', border: '1px solid var(--line)' } }); f.stage.append(box);
    function draw() {
      box.innerHTML = ''; const big = D[k][1]; const S0 = box.clientWidth ? Math.min(box.clientWidth, box.clientHeight) - 20 : 260;
      D.slice(0, k + 1).reverse().forEach(([nm, a, c]) => { const side = Math.max(2, S0 * Math.sqrt(a / big)); box.append(h('div', { style: { position: 'absolute', left: '10px', bottom: '10px', width: side + 'px', height: side + 'px', background: c, opacity: 0.85, border: '1px solid rgba(0,0,0,.25)', transition: 'all .6s cubic-bezier(.3,1.2,.4,1)' } }, side > 60 ? h('span', { style: { position: 'absolute', right: '6px', top: '4px', fontSize: '.75rem', fontWeight: 800, color: '#102' } }, nm) : '')); });
      f.out.innerHTML = `<b>${D[k][0]}</b>: khoảng ${N(D[k][1])} km². ${k ? `Gấp khoảng <b>${N(U.round(D[k][1] / D[k - 1][1], 0))}</b> lần ${D[k - 1][0]}.` : ''} Mỗi hình vuông có diện tích tỉ lệ với diện tích thật (cạnh tỉ lệ với căn bậc hai).`;
    }
    f.ctrls.append(VZ.range('Phóng xa', 0, D.length - 1, k, 1, (v) => { k = v; SFX.play('whoosh'); draw(); }, (v) => D[v][0]));
    setTimeout(draw, 30); draw();
  };
  APP.viz.heroVolume = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#0f1a2e'; c.fillRect(0, 0, w, hh); const sc = Math.min(w, hh) * 0.055, ox = w * 0.62, oy = hh * 0.62;
      const n = 4; const cubes = []; for (let z = 0; z < n; z++) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (x + y + z <= (t * 2.2) % 13) cubes.push([x, y, z]);
      cubes.sort((a, b2) => a[0] + a[1] + a[2] - (b2[0] + b2[1] + b2[2]));
      cubes.forEach(([x, y, z]) => { const F = (a, b2, d) => iso(a, b2, d, sc, ox, oy); const poly = (pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p))); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.stroke(); }; const hue = 190 + z * 30; poly([F(x, y + 1, z), F(x + 1, y + 1, z), F(x + 1, y + 1, z + 1), F(x, y + 1, z + 1)], `hsl(${hue} 70% 50%)`); poly([F(x + 1, y, z), F(x + 1, y + 1, z), F(x + 1, y + 1, z + 1), F(x + 1, y, z + 1)], `hsl(${hue} 70% 38%)`); poly([F(x, y, z + 1), F(x + 1, y, z + 1), F(x + 1, y + 1, z + 1), F(x, y + 1, z + 1)], `hsl(${hue} 80% 66%)`); });
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(sc * 0.9)}px Lexend, sans-serif`; c.fillText('V = l × w × h', w * 0.05, hh * 0.88);
    });
  };

  /* ---------- question helpers ---------- */
  const conv = (v, from, to, fac, mul) => num(`Convert ${N(v)} ${from} to ${to}.`, U.round(mul ? v * fac : v / fac, 6), `${mul ? 'Larger unit → smaller unit: multiply' : 'Smaller unit → larger unit: divide'} by ${N(fac)}: ${N(v)} ${mul ? '×' : '÷'} ${N(fac)} = ${N(U.round(mul ? v * fac : v / fac, 6))} ${to}.`, { unit: to });
  const triQ = (b, hh, u, o = {}) => num(`Work out the area of a triangle with base ${N(b)} ${u} and perpendicular height ${N(hh)} ${u}.`, (b * hh) / 2, `A = ½ × ${N(b)} × ${N(hh)} = ${N((b * hh) / 2)} ${u}².`, Object.assign({ unit: u + '²', fig: triFig(b, hh, u) }, o));
  const volQ = (l, w, hh, u, o = {}) => num(o.q || `Work out the volume of the cuboid.`, l * w * hh, `V = ${N(l)} × ${N(w)} × ${N(hh)} = ${N(l * w * hh)} ${u}³.`, Object.assign({ unit: u + '³', fig: cuboidFig(l, w, hh, u) }, o));
  const saQ = (l, w, hh, u, o = {}) => { const a = l * w, b = l * hh, c = w * hh; return num(o.q || 'Work out the surface area of the cuboid.', 2 * (a + b + c), `Top ${N(a)}, front ${N(b)}, side ${N(c)}. SA = 2 × ${N(a)} + 2 × ${N(b)} + 2 × ${N(c)} = ${N(2 * (a + b + c))} ${u}².`, Object.assign({ unit: u + '²', fig: cuboidFig(l, w, hh, u) }, o)); };

  APP.addUnit({
    n: 15, strand: 'geometry', title: 'Shapes, area and volume', vi: 'Hình, diện tích và thể tích',
    blurb: 'The area of a flat shape is the amount of space covered by the shape. A square piece of land exactly 1 km long and 1 km wide has an area of 1 square kilometre (1 km²). Vatican City, the smallest country in the world, has an area of only 0.44 km², while the Pacific, the largest ocean, covers over 155 million km². The unit you use must always be suitable for what you are measuring.',
    blurbVi: 'Chương này học đổi đơn vị diện tích (mm², cm², m², héc-ta), công thức diện tích tam giác, thể tích và diện tích bề mặt của hình lập phương, hình hộp chữ nhật.',
    words: [['area', 'diện tích'], ['square centimetre (cm²)', 'xăng-ti-mét vuông'], ['square metre (m²)', 'mét vuông'], ['square millimetre (mm²)', 'mi-li-mét vuông'], ['conversion factor', 'hệ số quy đổi'], ['hectare (ha)', 'héc-ta'], ['compound shape', 'hình ghép'], ['dimensions', 'kích thước'], ['triangle', 'tam giác'], ['base', 'đáy'], ['perpendicular height', 'chiều cao (vuông góc)'], ['volume', 'thể tích'], ['cubic centimetre (cm³)', 'xăng-ti-mét khối'], ['cube', 'hình lập phương'], ['cuboid', 'hình hộp chữ nhật'], ['length', 'chiều dài'], ['width', 'chiều rộng'], ['height', 'chiều cao'], ['surface area', 'diện tích bề mặt (toàn phần)'], ['face', 'mặt'], ['net', 'hình khai triển (lưới)']],
    chat: ['Vì sao 1 m² = 10 000 cm²?', 'Công thức diện tích tam giác?', 'Tính diện tích bề mặt hình hộp thế nào?'],
    sections: [
      {
        id: '15.1', t: 'Converting between units for area', vi: 'Đổi đơn vị diện tích',
        goals: ['convert between metric units of area.'],
        body: [
          ['p', 'A square with side 1 cm has an area of 1 cm². If you divide it into squares with side 1 mm, you get 10 × 10 = 100 small squares, so <b>1 cm² = 100 mm²</b>. A square with side 1 m divided into squares of side 1 cm gives 100 × 100 = 10 000 squares, so <b>1 m² = 10 000 cm²</b>.'],
          ['viz', 'areaUnits'],
          ['rule', '1 cm² = 100 mm² &nbsp;&nbsp; 1 m² = 10 000 cm²<br>Larger unit → smaller unit: <b>multiply</b> by the conversion factor. Smaller unit → larger unit: <b>divide</b>.', 'Conversion factors'],
          ['ex', { t: 'Worked example 15.1', q: 'a What units would you use to measure the area of a football pitch? b A shape has an area of 5 cm². What is its area in mm²?', steps: ['a: you measure the length of a football pitch in metres, so the area is in <b>m²</b>.', 'b: 1 cm² = 100 mm², so 5 cm² = 5 × 100 = <b>500 mm²</b>.'] }],
          ['tip', 'Change the lengths to the same unit BEFORE you multiply. A rectangle 65 mm by 2 cm: 6.5 cm × 2 cm = 13 cm² (or 65 mm × 20 mm = 1300 mm² = 13 cm²).'],
          ['vi', ['Độ dài gấp 10 lần thì diện tích gấp 10 × 10 = 100 lần.', '1 cm² = 100 mm²; 1 m² = 10 000 cm².', 'Đổi từ đơn vị lớn sang nhỏ: nhân; từ nhỏ sang lớn: chia.', 'Chọn đơn vị phù hợp: tem thư (mm² hoặc cm²), tờ tiền (cm²), sân tennis (m²), đất nước (km²).']],
        ],
        bank: [
          sort('Which unit would you use to measure the area of each item?', ['mm²', 'cm²', 'm²', 'km²'], [['a ladybird’s wing', 0], ['a bank note', 1], ['a tennis court', 2], ['a cinema screen', 2], ['a country', 3], ['a page of a book', 1]], 'Think about which unit you would use to measure the length.'),
          conv(8, 'cm²', 'mm²', 100, true), conv(0.75, 'cm²', 'mm²', 100, true), conv(600, 'mm²', 'cm²', 100, false), conv(45, 'mm²', 'cm²', 100, false),
          conv(3, 'm²', 'cm²', 10000, true), conv(8.1, 'm²', 'cm²', 10000, true), conv(70000, 'cm²', 'm²', 10000, false), conv(780, 'cm²', 'm²', 10000, false),
          fill('Complete the area conversions.', [720, 54000, 8.65, 4.8, 12.5], '× 100 or × 10 000 when going to smaller units; ÷ when going to larger units.', { f: '7.2 cm² = [] mm² &nbsp; 5.4 m² = [] cm² &nbsp; 865 mm² = [] cm² &nbsp; 48 000 cm² = [] m² &nbsp; 125 000 cm² = [] m²' }),
          mcq('A rectangle is 65 mm by 2 cm. Suyin: 6.5 × 2 = 13 cm². Tam: 65 × 20 = 1300 mm² = 130 cm². Who is correct?', ['Suyin — Tam divided by 10 instead of 100', 'Tam', 'Both', 'Neither'], 0, '1 cm² = 100 mm², so 1300 mm² = 13 cm².', { d: 2 }),
          mcq('Zara says: “An area of 0.25 m² is the same as 25 000 mm².” Is she correct?', ['No — 0.25 m² = 2500 cm² = 250 000 mm²', 'Yes', 'No — it is 2500 mm²', 'No — it is 25 mm²'], 0, '1 m² = 10 000 cm² = 1 000 000 mm².', { d: 3 }),
          num('Sven’s bathroom floor is 2 m by 1.6 m. Each square tile is 20 cm by 20 cm. How many tiles does he need?', 80, 'Floor: 200 × 160 = 32 000 cm². Tile: 400 cm². 32 000 ÷ 400 = 80. (Or 10 tiles by 8 tiles.)', { d: 2, app: true }),
          num('A rectangle is 12 cm by 5 cm. What is its area in mm²?', 6000, '12 × 5 = 60 cm² = 6000 mm² (or 120 mm × 50 mm).', { unit: 'mm²' }),
          mcq('Marcus never knows when to multiply or divide by the conversion factor. Which strategy helps?', ['A smaller unit needs MORE of them, so multiply; a larger unit needs fewer, so divide', 'Always multiply', 'Always divide', 'Multiply when the number is small'], 0, 'e.g. 5 cm² is 500 of the tiny mm² squares.'),
          gen(() => { const [from, to, fac] = pick([['cm²', 'mm²', 100], ['m²', 'cm²', 10000]]); const v = pick([2, 3.5, 0.4, 12, 0.08, 6.25, 15]); return conv(v, from, to, fac, true); }),
          gen(() => { const [from, to, fac] = pick([['mm²', 'cm²', 100], ['cm²', 'm²', 10000]]); const v = fac === 100 ? pick([350, 1200, 45, 8, 990]) : pick([25000, 4000, 120000, 500, 37500]); return conv(v, from, to, fac, false); }),
          gen(() => { const a = R(2, 9), b = R(11, 40); return num(`A rectangle is ${a} cm by ${b} mm. What is its area in cm²?`, U.round((a * b) / 10, 4), `${b} mm = ${N(b / 10)} cm. ${a} × ${N(b / 10)} = ${N(U.round((a * b) / 10, 4))} cm².`, { unit: 'cm²', d: 2 }); }),
          gen(() => { const L = pick([2, 3, 4, 2.4, 3.6]), Wd = pick([1.2, 1.6, 2, 2.4]), t = pick([20, 30, 40]); const n = (L * 100 * Wd * 100) / (t * t); if (!Number.isInteger(n)) return null; return num(`A floor is ${N(L)} m by ${N(Wd)} m. Square tiles are ${t} cm by ${t} cm. How many tiles are needed?`, n, `${N(L * 100)} ÷ ${t} = ${N((L * 100) / t)} tiles by ${N(Wd * 100)} ÷ ${t} = ${N((Wd * 100) / t)} tiles → ${n}.`, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '15.2', t: 'Using hectares', vi: 'Héc-ta',
        goals: ['convert between hectares and m².'],
        body: [
          ['p', 'You use <b>hectares</b> to measure areas of land. A hectare is the area of a square field of side 100 metres, so <b>1 hectare (ha) = 10 000 m²</b>. A football pitch is about half a hectare.'],
          ['viz', 'hectareField'],
          ['ex', { t: 'Worked example 15.2', q: 'a i 2.4 ha = ? m² ii 125 000 m² = ? ha b A rectangular piece of land measures 850 m by 1.4 km. Work out its area in hectares.', steps: ['a i: 2.4 × 10 000 = <b>24 000 m²</b>.', 'a ii: 125 000 ÷ 10 000 = <b>12.5 ha</b>.', 'b: 1.4 km = 1400 m. Area = 850 × 1400 = 1 190 000 m². 1 190 000 ÷ 10 000 = <b>119 ha</b>.'] }],
          ['vi', ['1 ha = diện tích hình vuông cạnh 100 m = 10 000 m².', 'ha → m²: nhân 10 000; m² → ha: chia 10 000.', 'Đổi km ra m trước khi tính diện tích (1 km = 1000 m).', 'Giá đất theo ha: tổng tiền = số ha × giá mỗi ha.']],
        ],
        bank: [
          fill('Complete these conversions between hectares and m².', [60000, 112000, 6300], 'Multiply by 10 000.', { f: '6 ha = [] m² &nbsp; 11.2 ha = [] m² &nbsp; 0.63 ha = [] m²' }),
          fill('Complete these conversions between m² and hectares.', [7, 13.5, 0.8], 'Divide by 10 000.', { f: '70 000 m² = [] ha &nbsp; 135 000 m² = [] ha &nbsp; 8000 m² = [] ha' }),
          fill('Complete.', [46000, 8000, 7500, 250], '× 10 000.', { f: '4.6 ha = [] m² &nbsp; 0.8 ha = [] m² &nbsp; 0.75 ha = [] m² &nbsp; 0.025 ha = [] m²' }),
          fill('Complete.', [8.9, 24, 0.09, 126.5], '÷ 10 000.', { f: '89 000 m² = [] ha &nbsp; 240 000 m² = [] ha &nbsp; 900 m² = [] ha &nbsp; 1 265 000 m² = [] ha' }),
          fill('A rectangular piece of land measures 780 m by 550 m. Work out its area.', [429000, 42.9], '780 × 550 = 429 000 m² = 42.9 ha.', { f: '[] m² = [] ha' }),
          mcq('A builder buys land 350 m by 80 m. The land costs $12 400 per hectare. He says, “This land will cost me more than $34 000.” Is he correct?', ['Yes — 2.8 ha × $12 400 = $34 720', 'No — it costs $28 000', 'No — it costs $3472', 'Yes — it costs $347 200'], 0, '350 × 80 = 28 000 m² = 2.8 ha.', { d: 2, app: true }),
          fill('A football pitch has an area of 0.78 ha. Its length is 120 m.', [7800, 65], '0.78 × 10 000 = 7800 m²; 7800 ÷ 120 = 65 m.', { f: 'Area: [] m² &nbsp; Width: [] m', d: 2 }),
          num('Alessia and Ben share 0.087 ha of land in the ratio 1 : 2. What is the area of Ben’s piece, in m²?', 580, '0.087 ha = 870 m². 870 ÷ 3 = 290; Ben gets 2 × 290 = 580 m².', { unit: 'm²', d: 3 }),
          mcq('A company wants land shaped like an L: a 4 km by 1.5 km rectangle joined to a 2 km by 1.5 km rectangle. Land costs $5200 per hectare and they want to pay less than $5 million. Can they afford it?', ['Yes — 900 ha × $5200 = $4 680 000', 'No — it costs $5 200 000', 'No — it costs $46 800 000', 'Yes — it costs $468 000'], 0, '4000 × 1500 + 2000 × 1500 = 9 000 000 m² = 900 ha.', { d: 3, app: true }),
          mcq('Roughly how big is a football pitch?', ['about half a hectare', 'about 1 km²', 'about 50 m²', 'about 100 ha'], 0, 'About 100 m by 60 m ≈ 6000 m² ≈ 0.6 ha.'),
          gen(() => { const v = pick([3, 4.6, 0.8, 12.25, 0.05, 7.5]); return num(`Convert ${N(v)} ha to m².`, v * 10000, `${N(v)} × 10 000 = ${N(v * 10000)} m².`, { unit: 'm²' }); }),
          gen(() => { const v = pick([20000, 94000, 5600, 360000, 125000, 1500]); return num(`Convert ${N(v)} m² to hectares.`, v / 10000, `${N(v)} ÷ 10 000 = ${N(v / 10000)} ha.`, { unit: 'ha' }); }),
          gen(() => { const a = pick([200, 250, 400, 500, 800]), b = pick([150, 300, 450, 600]), pr = pick([3000, 4500, 8000, 12000]); const ha = (a * b) / 10000; return num(`A field is ${a} m by ${b} m. Land costs $${N(pr)} per hectare. How much does the field cost?`, ha * pr, `${a} × ${b} = ${N(a * b)} m² = ${N(ha)} ha. ${N(ha)} × ${N(pr)} = $${N(ha * pr)}.`, { pre: '$', app: true }); }, { app: true }),
        ],
      },
      {
        id: '15.3', t: 'The area of a triangle', vi: 'Diện tích tam giác',
        goals: ['derive and use the formula for the area of a triangle.'],
        body: [
          ['p', 'The area of a triangle is always half of the area of the rectangle that surrounds it. You find the area of a rectangle by multiplying the base by the height, so the area of a triangle is half of the base multiplied by the height.'],
          ['rule', 'Area = ½ × base × height, or <b>A = ½bh</b>. The height must be the <b>perpendicular height</b>: at right angles (90°) to the base, from the base to the opposite vertex.', 'Area of a triangle'],
          ['viz', 'triangleArea'],
          ['ex', { t: 'Worked example 15.3', q: 'a Work out the area of a triangle with base 8 cm and height 6 cm. b A compound shape is a 5 cm by 3 cm rectangle with a triangle of base 5 cm and height 4 cm on top. Work out its area.', fig: triFig(8, 6, 'cm'), steps: ['a: A = ½ × 8 × 6 = <b>24 cm²</b>.', 'b: rectangle 5 × 3 = 15 cm²; triangle ½ × 5 × 4 = 10 cm²; total = <b>25 cm²</b>.'] }],
          ['tip', '½ × b × h can be worked out in three ways: (b × h) ÷ 2, (½ of b) × h, or b × (½ of h). Choose the one that makes the numbers easiest: for b = 9, h = 16 use 9 × 8 = 72.'],
          ['vi', ['Diện tích tam giác = ½ × đáy × chiều cao.', 'Chiều cao phải VUÔNG GÓC với đáy — không dùng cạnh xiên.', 'Tam giác bằng một nửa hình chữ nhật bao quanh có cùng đáy và chiều cao.', 'Hình ghép: chia thành hình chữ nhật và tam giác, tính từng phần rồi cộng (hoặc trừ).', 'Nhân đôi cả đáy và chiều cao → diện tích gấp 4 lần.']],
        ],
        bank: [
          triQ(12, 5, 'cm'), triQ(20, 7, 'm'), triQ(10, 6, 'cm'), triQ(12, 25, 'mm'), triQ(16, 11, 'm'), triQ(9, 12, 'cm'),
          mcq('Arun: “base × height, then ÷ 2.” Sofia: “half the base, then × height.” Marcus: “half the height, then × base.” Will they all get the same answer?', ['Yes — the order of multiplying does not matter', 'Only Arun is right', 'Only Sofia is right', 'No — they all get different answers'], 0, '½ × b × h = (½b) × h = b × (½h).'),
          mcq('Which method is easiest for a triangle with base 8 cm and height 25 cm?', ['half of the base, then × height: 4 × 25 = 100', 'half of the height: 12.5 × 8', 'base × height ÷ 2 with a calculator', 'none of these work'], 0, 'Half of 8 is 4, and 4 × 25 is easy.', { d: 2 }),
          num('Budi works out the area of a triangle with base 12 cm, perpendicular height 8 cm and a sloping side of 9 cm. He writes ½ × 12 × 9 = 54 cm². What is the correct area?', 48, 'He used the sloping side. A = ½ × 12 × 8 = 48 cm².', { unit: 'cm²', fig: triFig(12, 8, 'cm', 0.3, { slant: '9 cm' }), d: 2 }),
          num('Work out the area of a triangle with base 40 mm and height 20 mm.', 400, '½ × 40 × 20 = 400 mm².', { unit: 'mm²' }),
          fill('A compound shape is a rectangle 10 cm by 6 cm with a triangle of base 10 cm and height 4 cm on top.', [20, 60, 80], 'Triangle ½ × 10 × 4 = 20; rectangle 10 × 6 = 60; total 80 cm².', { f: 'Area of triangle = [] cm² &nbsp; Area of rectangle = [] cm² &nbsp; Total area = [] cm²' }),
          fill('A triangular field has a base of 200 m and a height of 150 m. The farmer uses 180 kg of fertiliser per hectare; fertiliser costs 80 cents per kg.', [15000, 270, 216], '½ × 200 × 150 = 15 000 m² = 1.5 ha. 1.5 × 180 = 270 kg. 270 × 0.80 = $216.', { f: 'Area: [] m² &nbsp; Fertiliser: [] kg &nbsp; Cost: $[]', d: 3, app: true }),
          mcq('A rectangle 20 cm by 15 cm has a triangle with base 18 cm and height 9 cm cut out of it. Natasha says the shaded area is 219 cm². Is she correct?', ['Yes — 300 − 81 = 219', 'No — it is 162 cm²', 'No — it is 381 cm²', 'No — it is 138 cm²'], 0, 'Rectangle 300 cm²; triangle ½ × 18 × 9 = 81 cm².', { d: 2 }),
          num('A triangle has base 120 mm and height 40 mm. A rectangle 55 mm by 10 mm is cut out of it. What is the shaded area in cm²?', 18.5, 'Triangle 2400 mm² − rectangle 550 mm² = 1850 mm² = 18.5 cm².', { unit: 'cm²', d: 3 }),
          mcq('Marcus says: “If you double the base and double the height of a triangle, the area is doubled.” Is he correct?', ['No — the area is multiplied by 4', 'Yes', 'No — the area is multiplied by 8', 'No — the area stays the same'], 0, '½ × 2b × 2h = 4 × ½bh.', { d: 2 }),
          gen(() => { const b = R(3, 20), hh = R(2, 16); const u = pick(['cm', 'm', 'mm']); return triQ(b, hh, u); }),
          gen(() => { const A = pick([12, 18, 24, 30, 36, 40, 48, 60]), b = pick([4, 6, 8, 10, 12].filter((x) => (2 * A) % x === 0)); return num(`A triangle has an area of ${A} cm² and a base of ${b} cm. What is its perpendicular height?`, (2 * A) / b, `½ × ${b} × h = ${A} → ${b / 2} × h = ${A} → h = ${N((2 * A) / b)} cm.`, { unit: 'cm', d: 3 }); }),
          gen(() => { const w = R(4, 10), r = R(2, 6), t = R(2, 6); return num(`A shape is made from a rectangle ${w} cm by ${r} cm and a triangle with base ${w} cm and height ${t} cm on top. Work out the total area.`, w * r + (w * t) / 2, `${w * r} + ${N((w * t) / 2)} = ${N(w * r + (w * t) / 2)} cm².`, { unit: 'cm²', d: 2 }); }),
        ],
      },
      {
        id: '15.4', t: 'Calculating the volume of cubes and cuboids', vi: 'Thể tích hình lập phương và hình hộp chữ nhật',
        goals: ['derive and use the formula for the volume of cubes and cuboids.'],
        body: [
          ['p', 'A cube with a length, width and height of 1 cm is a centimetre cube: its volume is <b>1 cubic centimetre (1 cm³)</b>. A cuboid 4 cm long, 3 cm wide and 2 cm high can be divided into centimetre cubes: 12 cubes in each layer and two layers, so 24 cubes. Its volume is <b>24 cm³</b>.'],
          ['viz', 'cuboidBuilder'],
          ['rule', 'Volume = length × width × height, or <b>V = l × w × h</b>. Sides in mm → volume in mm³; sides in m → volume in m³. Make sure all lengths are in the same unit first!', 'Volume of a cuboid'],
          ['ex', { t: 'Worked example 15.4', q: 'a Work out the volume of a cuboid 8 cm by 5 cm by 3 cm. b A compound shape is a 4 m cube on top of a 9 m by 4 m by 7 m cuboid. Work out its volume.', fig: cuboidFig(8, 5, 3, 'cm'), steps: ['a: V = 8 × 5 × 3 = <b>120 cm³</b>.', 'b: cube 4 × 4 × 4 = 64 m³; cuboid 9 × 4 × 7 = 252 m³; total = <b>316 m³</b>.'] }],
          ['vi', ['Thể tích = số khối lập phương đơn vị xếp đầy hình.', 'V = dài × rộng × cao; hình lập phương cạnh a: V = a³.', 'Đổi tất cả kích thước về cùng đơn vị trước khi nhân.', 'Biết thể tích, tìm cạnh còn thiếu: chia thể tích cho tích hai cạnh đã biết.', 'Cạnh hình lập phương = căn bậc ba của thể tích (∛1000 = 10).']],
        ],
        bank: [
          volQ(3, 3, 3, 'cm', { q: 'Work out the volume of a cube with side 3 cm.' }), volQ(5, 5, 5, 'm', { q: 'Work out the volume of a cube with side 5 m.' }),
          volQ(10, 6, 4, 'cm'), volQ(12, 8, 5, 'mm'), volQ(7, 2, 3, 'cm'), volQ(6, 6, 1, 'cm'), volQ(9, 5, 6, 'cm'),
          num('Steph works out the volume of a cuboid 12 cm by 9 cm by 35 mm as 12 × 9 × 35 = 3780 cm³. What is the correct volume in cm³?', 378, '35 mm = 3.5 cm. 12 × 9 × 3.5 = 378 cm³.', { unit: 'cm³', d: 2 }),
          fill('Complete the volumes. Make sure the lengths are in the same units first.', [864, 16, 0.06, 64800], '12 × 6 × 12 = 864 mm³; 4 mm = 0.4 cm, so 5 × 8 × 0.4 = 16 cm³; 1.2 × 0.25 × 0.2 = 0.06 m³; 12 × 60 × 90 = 64 800 cm³.', { f: '12 mm × 6 mm × 12 mm = [] mm³ &nbsp; 5 cm × 8 cm × 4 mm = [] cm³ &nbsp; 1.2 m × 0.25 m × 0.2 m = [] m³ &nbsp; 12 cm × 60 cm × 90 cm = [] cm³', d: 3 }),
          num('A compound shape is made of a cuboid 11 cm by 4 cm by 6 cm with a cuboid 5 cm by 4 cm by 3 cm on top. Work out the total volume.', 324, '11 × 4 × 6 = 264; 5 × 4 × 3 = 60; total 324 cm³.', { unit: 'cm³', d: 2 }),
          num('A cuboid has a length of 7 cm, a width of 3 cm and a volume of 168 cm³. What is its height?', 8, '7 × 3 = 21; 168 ÷ 21 = 8 cm (dividing is quicker than trial and improvement).', { unit: 'cm', d: 2 }),
          num('A metal cuboid has a length of 75 mm, a height of 4 mm and a volume of 1500 mm³. What is its width?', 5, '75 × 4 = 300; 1500 ÷ 300 = 5 mm.', { unit: 'mm', d: 2 }),
          multi('A cuboid is 6 cm by 4 cm by 5 cm. Which of these cuboids have the same volume?', ['10 cm × 4 cm × 3 cm', '12 cm × 5 cm × 2 cm', '2 cm × 6 cm × 10 cm', '6 cm × 6 cm × 4 cm', '8 cm × 5 cm × 2 cm'], [0, 1, 2], '6 × 4 × 5 = 120 cm³.', { fixed: true, d: 2 }),
          fill('Complete the table for cubes.', [64, 125, 10, 6], '4³ = 64, 5³ = 125. Cube roots: ∛1000 = 10, ∛216 = 6.', { f: 'Side 4 cm → [] cm³ &nbsp; Side 5 cm → [] cm³ &nbsp; Volume 1000 cm³ → side [] cm &nbsp; Volume 216 cm³ → side [] cm' }),
          mcq('Sofia says: “If you know the volume of a cube, you can find the side length by working out the cube root of the volume.” Is she correct?', ['Yes — e.g. ∛27 = 3 because 3 × 3 × 3 = 27', 'No — you divide by 3', 'No — you take the square root', 'No — you divide by 6'], 0, 'V = s³, so s = ∛V.'),
          mcq('Nawaf writes: “Volume = 15 + 8 + 12 = 35 mm.” What are his mistakes?', ['He added instead of multiplied, and the unit should be mm³ — V = 1440 mm³', 'He should have divided', 'Only the units are wrong', 'There are no mistakes'], 0, '15 × 8 × 12 = 1440 mm³.'),
          gen(() => { const l = R(2, 12), w = R(2, 10), hh = R(1, 9); return volQ(l, w, hh, pick(['cm', 'm', 'mm'])); }),
          gen(() => { const l = R(2, 10), w = R(2, 8), hh = R(2, 9); const V = l * w * hh; return num(`A cuboid has volume ${V} cm³, length ${l} cm and width ${w} cm. What is its height?`, hh, `${l} × ${w} = ${l * w}; ${V} ÷ ${l * w} = ${hh} cm.`, { unit: 'cm', d: 2 }); }),
          gen(() => { const s0 = R(2, 10); return pick([num(`Work out the volume of a cube with side ${s0} cm.`, s0 ** 3, `${s0} × ${s0} × ${s0} = ${s0 ** 3} cm³.`, { unit: 'cm³' }), num(`A cube has a volume of ${s0 ** 3} cm³. What is its side length?`, s0, `∛${s0 ** 3} = ${s0} cm.`, { unit: 'cm', d: 2 })]); }),
          gen(() => { const L = R(20, 60), Wd = R(15, 40), D = R(10, 30); const lit = (L * Wd * D) / 1000; return num(`A fish tank is ${L} cm long, ${Wd} cm wide and ${D} cm deep. How many litres of water does it hold when full? (1 litre = 1000 cm³)`, lit, `${L} × ${Wd} × ${D} = ${N(L * Wd * D)} cm³ = ${N(lit)} litres.`, { unit: 'L', app: true }); }, { app: true }),
        ],
      },
      {
        id: '15.5', t: 'Calculating the surface area of cubes and cuboids', vi: 'Diện tích bề mặt hình lập phương và hình hộp chữ nhật',
        goals: ['calculate the surface area of cubes and cuboids.'],
        body: [
          ['p', 'The <b>surface area</b> of a cube or cuboid is the total area of all its faces. A cube of side 2 cm has six faces, each 2 × 2 = 4 cm², so its surface area is 6 × 4 = <b>24 cm²</b>. A cuboid has two faces of each colour in its <b>net</b>: top and bottom (l × w), front and back (l × h), two sides (w × h).'],
          ['viz', 'netUnfold'],
          ['rule', 'Surface area of a cuboid = 2 × (l × w) + 2 × (l × h) + 2 × (w × h). Surface area of a cube with side x = <b>6x²</b>. The units are square units: mm², cm² or m².', 'Surface area'],
          ['ex', { t: 'Worked example 15.5', q: 'Work out the surface area of a cuboid 8 cm by 5 cm by 3 cm.', fig: cuboidFig(8, 5, 3, 'cm'), steps: ['Top face: 8 × 5 = 40 cm²; front face: 8 × 3 = 24 cm²; side face: 5 × 3 = 15 cm².', 'Surface area = 2 × 40 + 2 × 24 + 2 × 15 = 80 + 48 + 30 = <b>158 cm²</b>.'] }],
          ['vi', ['Diện tích bề mặt = tổng diện tích tất cả các mặt.', 'Hình hộp có 3 cặp mặt bằng nhau: 2(lw + lh + wh).', 'Hình lập phương cạnh x: 6x².', 'Có thể cộng ba mặt khác nhau rồi nhân 2 (cách của Zara) — kết quả như nhau.', 'Thực tế: sơn, giấy gói quà, vật liệu làm hộp — đều cần diện tích bề mặt.']],
        ],
        bank: [
          fill('Work out the surface area of a cube with side 3 cm.', [9, 54], 'One face 3 × 3 = 9 cm²; six faces 54 cm².', { f: 'Area of one face = [] cm² &nbsp; Surface area = [] cm²' }),
          fill('Work out the surface area of a cube with side 5 cm.', [25, 150], '5 × 5 = 25; 6 × 25 = 150.', { f: 'Area of one face = [] cm² &nbsp; Surface area = [] cm²' }),
          expr('A cube has side length x. Write a formula for its surface area: SA = …', ['6x^2', '6x²', '6xx'], 'Each face is x²; there are six faces.', { keys: ['x', '²'] }),
          saQ(7, 2, 3, 'cm'), saQ(12, 6, 8, 'mm'), saQ(6, 4, 5, 'cm'), saQ(10, 2, 2, 'cm'),
          mcq('Zara says: “Instead of multiplying the top, front and side faces by 2 and then adding, you could add them first and then multiply by 2.” Is she correct?', ['Yes — 2a + 2b + 2c = 2(a + b + c)', 'No — the answer is half as big', 'No — you must multiply by 6', 'Only for cubes'], 0, 'Multiplication distributes over addition.'),
          fill('A cuboid is 15 mm by 8 mm by 3 cm. Work out its surface area.', [1620, 16.2], '3 cm = 30 mm. Top 120, front 450, side 240 → 2 × 810 = 1620 mm² = 16.2 cm².', { f: '[] mm² = [] cm²', d: 2 }),
          fill('Michiko’s container is 2.5 m by 2 m by 3 m. She paints all the outside faces with two coats. One 250 mL tin costs $8.49 and paint covers 4.5 m² per litre.', [37, 66, 560.34], 'SA = 2(5 + 7.5 + 6) = 37 m². Two coats: 74 m² ÷ 4.5 ≈ 16.44 L = 65.8 tins → 66 tins. 66 × 8.49 = $560.34.', { f: 'Surface area: [] m² &nbsp; Tins needed: [] &nbsp; Total cost: $[]', d: 3, app: true }),
          fill('The surface area of a cube is 384 m².', [64, 8], '384 ÷ 6 = 64 m²; √64 = 8 m.', { f: 'Area of one face: [] m² &nbsp; Side length: [] m', d: 2 }),
          num('The surface area of a cube is 2 cm² more than the surface area of a 3 cm × 4 cm × 5 cm cuboid. What is the side length of the cube?', 4, 'Cuboid: 2(12 + 15 + 20) = 94 cm². Cube: 96 cm² → one face 16 cm² → side 4 cm.', { unit: 'cm', d: 3 }),
          mcq('A cuboid is 10 mm by 15 mm and has a volume of 900 mm³. Marcus thinks the surface area is 600 mm². Is he correct?', ['Yes — the height is 6 mm and SA = 2(150 + 60 + 90) = 600', 'No — it is 900 mm²', 'No — it is 300 mm²', 'No — you cannot tell'], 0, 'h = 900 ÷ 150 = 6 mm.', { d: 3 }),
          fill('A cuboid is 10 mm by 8 mm by 15 mm.', [1200, 700], 'V = 10 × 8 × 15 = 1200 mm³; SA = 2(80 + 150 + 120) = 700 mm².', { f: 'Volume: [] mm³ &nbsp; Surface area: [] mm²' }),
          gen(() => { const l = R(2, 10), w = R(2, 8), hh = R(1, 7); return saQ(l, w, hh, pick(['cm', 'm', 'mm'])); }),
          gen(() => { const x = R(2, 12); return pick([num(`Work out the surface area of a cube with side ${x} cm.`, 6 * x * x, `6 × ${x}² = 6 × ${x * x} = ${6 * x * x} cm².`, { unit: 'cm²' }), num(`A cube has a surface area of ${6 * x * x} cm². What is its side length?`, x, `${6 * x * x} ÷ 6 = ${x * x}; √${x * x} = ${x} cm.`, { unit: 'cm', d: 2 })]); }),
          gen(() => { const l = R(10, 30), w = R(5, 20), hh = R(5, 20); const sa = 2 * (l * w + l * hh + w * hh); return num(`A gift box is ${l} cm by ${w} cm by ${hh} cm. What is the least area of wrapping paper needed to cover it exactly?`, sa, `SA = 2(${l * w} + ${l * hh} + ${w * hh}) = ${sa} cm².`, { unit: 'cm²', app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Size, surface and the secrets of shape', hero: 'heroVolume',
      lead: 'Why do elephants have huge ears? Why do ice cubes melt faster when crushed? Why does a 3 × 3 × 3 cube keep its surface area when you take a corner away? The answers all come from comparing area and volume.',
      leadVi: 'Vì sao voi có tai rất to? Vì sao đá bào tan nhanh hơn đá viên? Vì sao rút khối ở góc của khối 3 × 3 × 3 thì diện tích bề mặt không đổi? Câu trả lời đều đến từ việc so sánh diện tích và thể tích.',
      cards: [
        { t: 'From tiny to enormous', p: 'Vatican City covers just 0.44 km², but the Pacific Ocean covers more than 155 million km². Zoom out and compare the areas of countries, lakes and oceans.', viz: 'zoomAreas' },
        { t: 'Surface area versus volume', p: 'When a cube gets bigger, its volume grows faster than its surface area. Small animals have a lot of surface for their size, so they lose heat quickly; large animals keep heat in and need ways to cool down.', viz: 'saVolume' },
        { t: 'Project: removing cubes', p: 'Start with a 3 × 3 × 3 cube (volume 27 cm³, surface area 54 cm²). Remove cubes one at a time. Can you make a solid with a smaller volume but the same surface area?', viz: 'cubeRemove' },
        { t: 'Packaging design', p: 'Companies want boxes that hold a lot (big volume) but use little card (small surface area). For a fixed volume, a cube uses the least card of all cuboids.', viz: 'netUnfold' },
      ],
      facts: [['0.44 km²', 'Vatican City', 'The smallest country in the world.'], ['82 100 km²', 'Lake Superior', 'The largest freshwater lake.'], ['10 000 m²', '1 hectare', 'A square 100 m by 100 m.'], ['6x²', 'cube', 'Surface area of a cube with side x.']],
      challenge: { t: 'Which box uses less card?', p: 'Box A is 8 cm × 8 cm × 2 cm. Box B is 4 cm × 4 cm × 8 cm. Do they hold the same amount? Which needs less card?', a: 'Both volumes are 128 cm³. A: 2(64 + 16 + 16) = 192 cm². B: 2(16 + 32 + 32) = 160 cm². Box B uses less card (it is closer to a cube).' },
    },
    reading: {
      title: 'Why Do Elephants Have Such Big Ears?', sub: 'Surface area, volume and survival. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'An African elephant’s ears can be almost two metres long. They help the elephant to hear, but they have another important job: they keep the elephant cool. To understand why, we need to think about surface area and volume.',
        'Every animal makes heat inside its body, and the amount of heat depends roughly on its volume. The heat escapes through the skin, so the rate of cooling depends on the surface area. Imagine a cube of side 1 cm: its volume is 1 cm³ and its surface area is 6 cm². A cube of side 10 cm has a volume of 1000 cm³ but a surface area of only 600 cm². For every cubic centimetre, the big cube has much less surface.',
        'This is a problem for large animals living in hot places. An elephant has a huge volume that produces a lot of heat, but not enough skin to lose it quickly. Its large, thin ears contain many blood vessels. When the elephant flaps its ears, the blood is cooled by the air, and the cool blood flows back into its body.',
        'Tiny animals have the opposite problem. A shrew has so much surface area for its size that it loses heat very fast. To stay warm, some shrews must eat almost their own body mass in food every day. Babies lose heat faster than adults for the same reason, so they need to be wrapped up warmly.',
        'The same idea is used by engineers and cooks. Radiators have thin fins to give them a large surface area, and food cut into small pieces cooks more quickly than one big piece. Next time you see an elephant flapping its ears, remember: it is doing mathematics to keep cool!',
      ],
      gloss: [['escape', 'thoát ra'], ['rate', 'tốc độ'], ['blood vessel', 'mạch máu'], ['flap', 'vỗ, phe phẩy'], ['shrew', 'chuột chù'], ['radiator', 'bộ tản nhiệt']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'According to the text, the amount of heat an animal makes depends roughly on its…', opts: ['volume', 'surface area', 'ears', 'colour'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'How do the elephant’s ears help it to stay cool?', opts: ['Blood in the thin ears is cooled when the elephant flaps them', 'They block the Sun', 'They store water', 'They make less heat'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'Why do some shrews need to eat so much?', opts: ['They lose heat very fast because of their large surface area for their size', 'They are very big', 'They do not have ears', 'They live in hot places'], a: 0, ex: 'Paragraph D.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'A cube of side 10 cm has a surface area of 600 cm².', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: '6 × 10² = 600.' },
          { type: 'mcq', q: 'Asian elephants have bigger ears than African elephants.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'Asian elephants are not mentioned.' },
          { type: 'mcq', q: 'Small pieces of food cook more slowly than one big piece.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'They cook more quickly.' },
        ] },
        { title: 'Use the numbers', qs: [
          { type: 'fill', q: 'Complete.', f: 'A 1 cm cube has a surface area of [] cm² for each 1 cm³. A 10 cm cube has [] cm² of surface for each 1 cm³.', a: [6, 0.6], ex: '6 ÷ 1 = 6; 600 ÷ 1000 = 0.6.' },
          { type: 'match', q: 'Match the example to the idea.', a: [['elephant’s ears', 'large surface area to lose heat'], ['shrew', 'loses heat very fast'], ['radiator fins', 'designed to increase surface area'], ['baby wrapped in a blanket', 'reduces heat loss']], ex: 'Paragraphs C–E.' },
        ] },
      ],
    },
    listening: {
      title: 'Tiling the bathroom', intro: 'Dad and Linh plan how many tiles to buy. Listen and answer.',
      voices: { Dad: 'rounded', Linh: 'glassy' },
      lines: [
        { spk: 'Dad', text: 'Linh, the bathroom floor is two metres long and one point six metres wide. Can you work out the area?' },
        { spk: 'Linh', text: 'Two times one point six is three point two square metres. In square centimetres that is thirty-two thousand, because one square metre is ten thousand square centimetres.' },
        { spk: 'Dad', text: 'Each tile is a square, twenty centimetres by twenty centimetres.' },
        { spk: 'Linh', text: 'So one tile is four hundred square centimetres. Thirty-two thousand divided by four hundred is eighty tiles.' },
        { spk: 'Dad', text: 'Or think of it like this: ten tiles fit along the length and eight along the width. Ten times eight is eighty.' },
        { spk: 'Linh', text: 'We should buy ten percent extra in case some tiles break. That’s eighty-eight tiles.' },
        { spk: 'Dad', text: 'The tiles come in boxes of ten, so we need nine boxes. At twelve dollars a box, that’s one hundred and eight dollars.' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'Floor: 2 m by [] m = [] m². One tile: [] cm². Tiles needed: []. With 10% extra: [] tiles.', a: [1.6, 3.2, 400, 80, 88], ex: '32 000 ÷ 400 = 80; 80 + 8 = 88.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why do they buy extra tiles?', opts: ['in case some tiles break', 'to tile the walls', 'because they are cheap', 'because the floor is bigger'], a: 0, ex: 'Linh explains.' },
          { type: 'mcq', q: 'How many boxes do they buy?', opts: ['9', '8', '88', '10'], a: 0, ex: '88 tiles → 9 boxes of 10.' },
          { type: 'num', q: 'What is the total cost in dollars?', a: 108, ex: '9 × $12 = $108.' },
        ] },
      ],
    },
  });
})();
