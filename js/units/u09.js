/* Unit 9 — Sequences and functions */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, expr, gen } = Q;
  const list = (q, a, ex, o) => Object.assign({ type: 'list', q, a, ex: ex || '', ordered: true }, o || {});
  const sgn = (v) => (v < 0 ? '−' + Math.abs(v) : String(v));
  const seqStr = (arr, dots = true) => arr.map(sgn).join(', ') + (dots ? ', …' : '');
  const terms = (a, d, k = 5) => Array.from({ length: k }, (_, i) => a + i * d);
  const OPS = { add: ['Add', '+', (x, v) => x + v], sub: ['Subtract', '−', (x, v) => x - v], mul: ['Multiply by', '×', (x, v) => x * v], div: ['Divide by', '÷', (x, v) => x / v] };
  const ruleTxt = (steps) => steps.map(([o, v], i) => (i ? (o === 'add' || o === 'sub' ? 'then ' + OPS[o][0].toLowerCase() : 'then ' + OPS[o][0].toLowerCase()) : OPS[o][0]) + ' ' + v).join(' ');
  const apply = (x, steps) => steps.reduce((t, [o, v]) => OPS[o][2](t, v), x);
  const nthTxt = (k, b) => (k === 1 ? 'n' : k + 'n') + (b > 0 ? ' + ' + b : b < 0 ? ' − ' + -b : '');

  /* ---------- pattern figures ---------- */
  const PAT = {
    dots: { name: 'dots', unit: 'dots', f: (k) => 2 * k + 1, draw(k, x0, y0, u) { let g = ''; const n = 2 * k + 1; for (let i = 0; i < n; i++) g += `<circle cx="${x0 + i * u * 0.8}" cy="${y0}" r="${u * 0.25}" fill="var(--number)"/>`; return [g, n * u * 0.8, u]; } },
    tri: { name: 'matchstick triangles', unit: 'matchsticks', f: (k) => 3 * k, draw(k, x0, y0, u) { let g = ''; for (let i = 0; i < k; i++) { const x = x0 + i * u * 1.25; const A = [x, y0 + u], B = [x + u, y0 + u], C = [x + u / 2, y0 + u - u * 0.87]; g += stick(A, B) + stick(B, C) + stick(C, A); } return [g, k * u * 1.25, u * 1.1]; } },
    join: { name: 'matchstick squares', unit: 'matchsticks', f: (k) => 3 * k + 1, draw(k, x0, y0, u) { let g = ''; for (let i = 0; i <= k; i++) g += stick([x0 + i * u, y0], [x0 + i * u, y0 + u]); for (let i = 0; i < k; i++) g += stick([x0 + i * u, y0], [x0 + (i + 1) * u, y0]) + stick([x0 + i * u, y0 + u], [x0 + (i + 1) * u, y0 + u]); return [g, k * u + 8, u + 4]; } },
    cross: { name: 'cross of squares', unit: 'squares', f: (k) => 4 * k + 1, draw(k, x0, y0, u) { const c = u * 0.55; let g = ''; const cell = (i, j) => `<rect x="${x0 + (k + i) * c}" y="${y0 + (k + j) * c}" width="${c}" height="${c}" fill="var(--geometry)" stroke="var(--surface)" stroke-width="1.5"/>`; g += cell(0, 0); for (let t = 1; t <= k; t++) g += cell(t, 0) + cell(-t, 0) + cell(0, t) + cell(0, -t); return [g, (2 * k + 1) * c, (2 * k + 1) * c]; } },
    T: { name: 'T-shape of squares', unit: 'squares', f: (k) => 3 * k + 2, draw(k, x0, y0, u) { const c = u * 0.55; let g = ''; for (let i = 0; i < 2 * k + 1; i++) g += `<rect x="${x0 + i * c}" y="${y0}" width="${c}" height="${c}" fill="var(--stats)" stroke="var(--surface)" stroke-width="1.5"/>`; for (let j = 1; j <= k + 1; j++) g += `<rect x="${x0 + k * c}" y="${y0 + j * c}" width="${c}" height="${c}" fill="var(--stats)" stroke="var(--surface)" stroke-width="1.5"/>`; return [g, (2 * k + 1) * c, (k + 2) * c]; } },
    tris4: { name: 'triangle rows', unit: 'triangles', f: (k) => 4 * k, draw(k, x0, y0, u) { const c = u * 0.6; let g = ''; for (let i = 0; i < 4 * k; i++) { const col = i % (2 * k), row = Math.floor(i / (2 * k)); const x = x0 + col * c * 0.55, y = y0 + row * c; g += col % 2 === 0 ? `<polygon points="${x},${y + c} ${x + c * 0.55},${y} ${x + c * 1.1},${y + c}" fill="var(--algebra)" stroke="var(--surface)" stroke-width="1.5"/>` : `<polygon points="${x},${y} ${x + c * 1.1},${y} ${x + c * 0.55},${y + c}" fill="color-mix(in srgb, var(--algebra) 60%, white)" stroke="var(--surface)" stroke-width="1.5"/>`; } return [g, (2 * k + 1) * c * 0.55, 2 * c]; } },
  };
  function stick(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); const ux = dx / L, uy = dy / L; const A = [a[0] + ux * 3, a[1] + uy * 3], B = [b[0] - ux * 3, b[1] - uy * 3]; return `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="#d9a45b" stroke-width="5" stroke-linecap="round"/><circle cx="${B[0]}" cy="${B[1]}" r="3.6" fill="#e0453a"/>`; }
  const patFig = (key, ks = [1, 2, 3], o = {}) => { const P = PAT[key]; const u = o.u || 30; let x = 10, g = '', H = 0; ks.forEach((k) => { const [gg, w, hh] = P.draw(k, x, 26, u); g += gg + `<text x="${x + w / 2}" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">pattern ${k}</text>`; x += w + 34; H = Math.max(H, hh); }); return `<svg viewBox="0 0 ${x} ${H + 40}" style="width:100%;max-width:${Math.min(560, x * 1.2)}px">${g}</svg>`; };

  /* ---------- widgets ---------- */
  APP.viz.seqBuilder = function (el) {
    const f = VZ.frame(el, 'Máy tạo dãy số: số hạng đầu + quy tắc', { icon: 'spark' });
    let a = 5, steps = [['mul', 2], ['add', 1]], two = true, fin = false; const st = h('div', { style: { overflowX: 'auto' } }); f.stage.append(st);
    function draw() {
      const ss = two ? steps : [steps[0]]; const T = [a]; for (let i = 1; i < 6; i++) T.push(apply(T[i - 1], ss)); const ok = T.every((t) => Number.isFinite(t) && Math.abs(t) < 1e7);
      let g = '<div style="display:flex;align-items:center;gap:4px;padding:10px 0;min-width:max-content">';
      T.forEach((t, i) => { if (i) g += `<div style="display:flex;flex-direction:column;align-items:center;font-size:.78rem;font-weight:800;color:var(--accent);animation:stepIn .3s ${i * 0.12}s both">${ss.map(([o, v]) => OPS[o][1] + v).join(' ')}<span style="font-size:1.2rem">⟶</span></div>`; g += `<div style="min-width:52px;padding:10px 12px;border-radius:14px;text-align:center;font-weight:800;font-size:1.15rem;background:var(--sc-soft);border:2px solid var(--sc);animation:popIn .35s ${i * 0.12}s both">${ok ? N(U.round(t, 4)) : '…'}</div>`; });
      g += fin ? '</div>' : '<div style="font-size:1.4rem;font-weight:800;padding-left:6px">…</div></div>'; st.innerHTML = g;
      f.out.innerHTML = `Số hạng đầu ${a}; quy tắc: <b>${ruleTxt(ss)}</b> · ${fin ? 'Dãy <b>hữu hạn</b> (không có dấu …)' : 'Dãy <b>vô hạn</b> (dấu … nghĩa là tiếp tục mãi)'}`;
    }
    const opSel = (i) => h('select', { class: 'sel', 'aria-label': 'Phép toán ' + (i + 1), onchange: (e) => { steps[i][0] = e.target.value; draw(); } }, Object.keys(OPS).map((k) => h('option', { value: k, selected: steps[i][0] === k }, OPS[k][1] + ' ' + OPS[k][0])));
    f.ctrls.append(VZ.range('Số hạng đầu', -10, 50, a, 1, (v) => { a = v; draw(); }), opSel(0), VZ.range('Giá trị 1', 1, 10, steps[0][1], 1, (v) => { steps[0][1] = v; draw(); }), VZ.btn('Bước 2: bật/tắt', () => { two = !two; draw(); }, 'btn sm ghost'), opSel(1), VZ.range('Giá trị 2', 1, 10, steps[1][1], 1, (v) => { steps[1][1] = v; draw(); }), VZ.btn('Hữu hạn / vô hạn', () => { fin = !fin; SFX.play('flip'); draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.patternSeq = function (el) {
    const f = VZ.frame(el, 'Dãy hình: đếm, lập bảng, tìm quy tắc', { icon: 'grid' });
    let key = 'tri', k = 3; const pic = h('div', { style: { minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }), tbl = h('div', { style: { overflowX: 'auto', marginTop: '8px' } }); f.stage.append(pic, tbl);
    function draw() {
      const P = PAT[key]; pic.innerHTML = patFig(key, [k], { u: 40 });
      const d = P.f(2) - P.f(1), b = P.f(1) - d; let t = '<table class="tbl" style="min-width:max-content"><tr><th>Pattern number</th>'; for (let i = 1; i <= 8; i++) t += `<th style="${i === k ? 'background:var(--sc-soft)' : ''}">${i}</th>`; t += `</tr><tr><th>Number of ${P.unit}</th>`; for (let i = 1; i <= 8; i++) t += `<td style="${i === k ? 'background:var(--sc-soft);font-weight:800' : i > k ? 'color:var(--ink-3)' : ''}">${i <= k ? P.f(i) : '?'}</td>`; t += '</tr></table>'; tbl.innerHTML = t;
      f.out.innerHTML = `Pattern ${k}: <b>${P.f(k)}</b> ${P.unit}. Quy tắc từ số hạng này sang số hạng kế tiếp: <b>Add ${d}</b> (mỗi lần thêm ${d}). Mẹo nhanh hơn: số ${P.unit} = ${d} × số thứ tự ${b ? (b > 0 ? '+ ' + b : '− ' + -b) : ''} → pattern 20 có <b>${P.f(20)}</b>.`;
    }
    f.ctrls.append(h('select', { class: 'sel', 'aria-label': 'Chọn dãy hình', onchange: (e) => { key = e.target.value; SFX.play('whoosh'); draw(); } }, Object.keys(PAT).map((p) => h('option', { value: p, selected: p === key }, PAT[p].name))), VZ.range('Pattern', 1, 6, k, 1, (v) => { k = v; SFX.play('pop'); draw(); }));
    draw();
  };
  APP.viz.nthTerm = function (el) {
    const f = VZ.frame(el, 'Quy tắc số hạng thứ n', { icon: 'chart' });
    let kind = 'mul', v = 3, n = 8; const st = h('div'); f.stage.append(st);
    const term = (i) => (kind === 'mul' ? v * i : kind === 'add' ? i + v : i - v); const rule = () => (kind === 'mul' ? v + 'n' : kind === 'add' ? 'n + ' + v : 'n − ' + v);
    function draw() {
      let t = '<div style="overflow-x:auto"><table class="tbl" style="min-width:max-content"><tr><th>Position number (n)</th>'; for (let i = 1; i <= 6; i++) t += `<th>${i}</th>`; t += '<th>…</th><th style="background:var(--sc-soft)">' + n + '</th></tr><tr><th></th>'; for (let i = 1; i <= 6; i++) t += `<td style="color:var(--accent);font-weight:800;font-size:.85rem">${kind === 'mul' ? '×' + v : kind === 'add' ? '+' + v : '−' + v} ↓</td>`; t += '<td></td><td style="color:var(--accent);font-weight:800">↓</td></tr><tr><th>Term</th>'; for (let i = 1; i <= 6; i++) t += `<td style="font-weight:800">${sgn(term(i))}</td>`; t += `<td>…</td><td style="background:var(--sc-soft);font-weight:800">${sgn(term(n))}</td></tr></table></div>`;
      const W = 420, H = 170, L = 34, B = 24; const ys = Array.from({ length: 10 }, (_, i) => term(i + 1)); const mn = Math.min(0, ...ys), mx = Math.max(1, ...ys); const Y = (y) => H - B - ((y - mn) / (mx - mn)) * (H - B - 10); let g = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:460px;margin-top:8px"><line x1="${L}" y1="${Y(0)}" x2="${W - 6}" y2="${Y(0)}" stroke="var(--ink-3)"/><line x1="${L}" y1="6" x2="${L}" y2="${H - B}" stroke="var(--ink-3)"/>`;
      ys.forEach((y, i) => { const x = L + (i + 0.6) * ((W - L) / 10.5); g += `<circle cx="${x}" cy="${Y(y)}" r="6" fill="var(--sc)" style="animation:popIn .3s ${i * 0.05}s both"/><text x="${x}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${i + 1}</text>`; }); g += `<text x="${L - 4}" y="${Y(mx) + 4}" text-anchor="end" font-size="11" fill="var(--ink-2)">${sgn(mx)}</text><text x="${L - 4}" y="${Y(mn) + 4}" text-anchor="end" font-size="11" fill="var(--ink-2)">${sgn(mn)}</text></svg>`;
      st.innerHTML = t + g; f.out.innerHTML = `nth term = <b>${rule()}</b> → số hạng thứ ${n} = ${kind === 'mul' ? v + ' × ' + n : n + (kind === 'add' ? ' + ' : ' − ') + v} = <b style="color:var(--accent)">${sgn(term(n))}</b>. Các điểm nằm trên một đường thẳng!`;
    }
    f.ctrls.append(VZ.seg([['mul', 'an'], ['add', 'n + b'], ['sub', 'n − b']], kind, (k) => { kind = k; draw(); }), VZ.range('Giá trị', 1, 12, v, 1, (x) => { v = x; draw(); }), VZ.range('n', 7, 100, n, 1, (x) => { n = x; draw(); }));
    draw();
  };
  APP.viz.funcMachine = function (el) {
    const f = VZ.frame(el, 'Máy hàm số & sơ đồ ánh xạ', { icon: 'robot' });
    let op = 'mul', v = 2, inv = false, x = 3; const W = 520, H = 150; const svg = VZ.svg(W, H); const map = VZ.svg(W, 150); f.stage.append(svg, map);
    const fwd = (t) => OPS[op][2](t, v); const back = (t) => ({ add: t - v, sub: t + v, mul: t / v, div: t * v }[op]); const invSym = { add: '−', sub: '+', mul: '÷', div: '×' };
    function machine(tok, t) {
      svg.innerHTML = ''; const lbl = inv ? invSym[op] + ' ' + v : OPS[op][1] + ' ' + v;
      svg.append(s('rect', { x: 190, y: 35, width: 140, height: 80, rx: 18, fill: inv ? 'var(--algebra)' : 'var(--sc)' }), s('text', { x: 260, y: 86, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: '#fff', text: lbl }));
      [[60, inv ? 'output' : 'input'], [460, inv ? 'input' : 'output']].forEach(([cx, t2]) => svg.append(s('text', { x: cx, y: 22, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: 'var(--ink-2)', text: t2 })));
      svg.append(s('path', { d: 'M100 75 H185 M335 75 H420', stroke: 'var(--ink-3)', 'stroke-width': 3, 'marker-end': '' }));
      const px = 60 + (460 - 60) * t; const inside = px > 200 && px < 320; if (!inside) { svg.append(s('circle', { cx: px, cy: 75, r: 26, fill: 'var(--accent)' }), s('text', { x: px, y: 83, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#fff', text: N(U.round(tok, 3)) })); }
    }
    function mapping() {
      map.innerHTML = ''; const X = (k) => 30 + k * 46; [[30, 'input'], [120, 'output']].forEach(([y, t]) => { map.append(s('line', { x1: 20, y1: y, x2: W - 20, y2: y, stroke: 'var(--ink-2)', 'stroke-width': 2 }), s('text', { x: W - 20, y: y - 10, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink-2)', text: t })); for (let k = 0; k <= 10; k++) map.append(s('line', { x1: X(k), y1: y - 5, x2: X(k), y2: y + 5, stroke: 'var(--ink-2)' }), s('text', { x: X(k), y: y === 30 ? y - 10 : y + 20, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink)', text: k })); });
      for (let k = 0; k <= 10; k++) { const o = fwd(k); if (o < 0 || o > 10 || !Number.isInteger(o)) continue; map.append(s('line', { x1: X(k), y1: 34, x2: X(o), y2: 116, stroke: k === x ? 'var(--accent)' : 'var(--sc)', 'stroke-width': k === x ? 3.5 : 2, style: `animation:popIn .3s ${k * 0.04}s both` }), s('circle', { cx: X(o), cy: 116, r: 4, fill: k === x ? 'var(--accent)' : 'var(--sc)' })); }
    }
    function run() { const start = inv ? fwd(x) : x, end = inv ? x : fwd(x); SFX.play('whoosh'); VZ.animate(1300, (e) => { machine(e < 0.5 ? start : end, e); }, () => { SFX.play('pop'); f.out.innerHTML = inv ? `Hàm ngược: output ${N(U.round(start, 3))} ${invSym[op]} ${v} = input <b>${N(U.round(end, 3))}</b> (làm ngược lại bằng phép toán ngược)` : `${x} <b>maps to</b> ${N(U.round(end, 3))}: ${x} ${OPS[op][1]} ${v} = <b>${N(U.round(end, 3))}</b>`; }); }
    const redraw = () => { machine(inv ? fwd(x) : x, 0); mapping(); };
    f.ctrls.append(VZ.seg(Object.keys(OPS).map((k) => [k, OPS[k][1]]), op, (k) => { op = k; redraw(); }), VZ.range('Giá trị', 1, 6, v, 1, (k) => { v = k; redraw(); }), VZ.range('Input', 0, 10, x, 1, (k) => { x = k; redraw(); }), VZ.btn('Chạy ▶', run, 'btn sm sc'), VZ.btn('Đảo ngược ⇄', () => { inv = !inv; SFX.play('flip'); redraw(); f.out.textContent = inv ? 'Máy ngược: đưa output vào, nhận lại input.' : 'Máy thuận.'; }, 'btn sm ghost'));
    redraw(); f.out.textContent = 'Bấm “Chạy” để đưa input qua máy. Sơ đồ ánh xạ bên dưới vẽ mũi tên từ input sang output.';
  };
  APP.viz.moleGoose = function (el) {
    const f = VZ.frame(el, 'Ngỗng đẻ trứng & chuột chũi đào hang', { icon: 'target' });
    let g0 = 2, gs = 5, m0 = 1, ms = 3; const W = 640, H = 150; const svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const lo = -5, hi = 45; const X = (v) => 20 + ((v - lo) / (hi - lo)) * (W - 40);
      svg.append(s('rect', { x: 0, y: 70, width: W, height: 80, fill: 'color-mix(in srgb, #8b5a2b 28%, transparent)' }), s('line', { x1: 10, y1: 70, x2: W - 10, y2: 70, stroke: 'var(--ink)', 'stroke-width': 2 }));
      for (let v = lo; v <= hi; v += 5) svg.append(s('text', { x: X(v), y: 88, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-2)', text: sgn(v) }), s('line', { x1: X(v), y1: 66, x2: X(v), y2: 74, stroke: 'var(--ink)' }));
      const eggs = [], holes = []; for (let v = g0; v <= hi; v += gs) eggs.push(v); for (let v = m0; v <= hi; v += ms) holes.push(v); const both = eggs.filter((e) => holes.includes(e));
      eggs.forEach((e, i) => svg.append(s('ellipse', { cx: X(e), cy: 58, rx: 6, ry: 8, fill: both.includes(e) ? '#ffd166' : '#fff', stroke: 'var(--ink-2)', 'stroke-width': 1.5, style: `animation:popIn .3s ${i * 0.05}s both` })));
      holes.forEach((m, i) => svg.append(s('circle', { cx: X(m), cy: 104, r: 7, fill: both.includes(m) ? 'var(--accent)' : '#5b3a1e', style: `animation:popIn .3s ${i * 0.04}s both` })));
      both.forEach((b) => svg.append(s('text', { x: X(b), y: 36, 'text-anchor': 'middle', 'font-size': 18, text: '🎉' })));
      svg.append(s('text', { x: 14, y: 26, 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', text: '🪿 ' + seqStr(eggs.slice(0, 5)) }), s('text', { x: 14, y: 140, 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', text: '🐭 ' + seqStr(holes.slice(0, 6)) }));
      const L = U.lcm(gs, ms); f.out.innerHTML = both.length ? `Chuột chũi tìm thấy trứng tại <b>${both.join(', ')}</b>… Khoảng cách giữa các lần gặp = BCNN(${gs}, ${ms}) = <b>${L}</b>.` : `Không gặp nhau! (Hiệu hai số bắt đầu ${Math.abs(g0 - m0)} không chia hết cho ƯCLN(${gs}, ${ms}) = ${U.gcd(gs, ms)}.)`;
    }
    f.ctrls.append(VZ.range('🪿 bắt đầu', -5, 10, g0, 1, (v) => { g0 = v; draw(); }), VZ.range('🪿 bước', 1, 10, gs, 1, (v) => { gs = v; draw(); }), VZ.range('🐭 bắt đầu', -5, 10, m0, 1, (v) => { m0 = v; draw(); }), VZ.range('🐭 bước', 1, 10, ms, 1, (v) => { ms = v; draw(); }));
    draw();
  };
  APP.viz.sunflower = function (el) {
    const f = VZ.frame(el, 'Hoa hướng dương: góc vàng 137,5°', { icon: 'spark' });
    let ang = 137.5, cnt = 400, t0 = 0, now = 0; const box = h('div', { style: { position: 'relative', height: 'min(80vw, 340px)' } }); f.stage.append(box);
    const lp = VZ.canvasLoop(box, (c, w, hh, t) => {
      c.clearRect(0, 0, w, hh); const cx = w / 2, cy = hh / 2, sc = Math.min(w, hh) / 2 / Math.sqrt(cnt) * 0.95; now = t; const shown = Math.min(cnt, Math.floor((t - t0) * 160) + 1);
      for (let i = 0; i < shown; i++) { const r = sc * Math.sqrt(i), a = rad(i * ang); c.fillStyle = `hsl(${30 + (i % 21) * 2} 85% ${40 + (i % 13) * 2}%)`; c.beginPath(); c.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), sc * 0.48, 0, 7); c.fill(); }
    });
    lp.cv.style.width = '100%'; lp.cv.style.height = '100%';
    const out = () => (f.out.innerHTML = Math.abs(ang - 137.5) < 0.15 ? 'Góc vàng 137,5°: hạt xếp khít nhất, không có khoảng trống. Đếm các vòng xoắn: thường là 21 và 34, hoặc 34 và 55 — các số Fibonacci liền nhau!' : `Góc ${ang}°: hạt xếp thành các “tia” có khoảng trống → hoa sẽ lãng phí chỗ.`);
    f.ctrls.append(VZ.range('Góc quay (°)', 130, 145, ang, 0.1, (v) => { ang = v; out(); }), VZ.btn('137,5°', () => { ang = 137.5; out(); SFX.play('star'); }, 'btn sm sc'), VZ.btn('Trồng lại', () => { t0 = now; SFX.play('whoosh'); }, 'btn sm ghost'));
    out();
    function rad(d) { return (d * Math.PI) / 180; }
  };
  APP.viz.fibSpiral = function (el) {
    const f = VZ.frame(el, 'Hình chữ nhật vàng & xoắn ốc Fibonacci', { icon: 'atom' });
    let k = 6; const W = 420, H = 280; const svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const F = [1, 1]; while (F.length < 10) F.push(F[F.length - 1] + F[F.length - 2]);
      // place squares: directions right, up, left, down cycling
      const sq = [[0, 0, 1]]; let minx = 0, miny = 0, maxx = 1, maxy = 1;
      for (let i = 1; i < k; i++) { const sz = F[i]; let x, y; const d = i % 4; if (d === 1) { x = maxx; y = miny; } else if (d === 2) { x = minx; y = maxy; } else if (d === 3) { x = minx - sz; y = miny; } else { x = minx; y = miny - sz; } sq.push([x, y, sz]); minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x + sz); maxy = Math.max(maxy, y + sz); }
      const sc = Math.min((W - 20) / (maxx - minx), (H - 20) / (maxy - miny)); const ox = (W - (maxx - minx) * sc) / 2 - minx * sc, oy = (H - (maxy - miny) * sc) / 2 + maxy * sc; const P = (x, y) => [ox + x * sc, oy - y * sc];
      let path = '';
      sq.forEach(([x, y, sz], i) => { const [a, b] = P(x, y + sz); svg.append(s('rect', { x: a, y: b, width: sz * sc, height: sz * sc, fill: `hsl(${(i * 40) % 360} 80% 70% / .45)`, stroke: 'var(--ink)', 'stroke-width': 1.5, style: `animation:popIn .3s ${i * 0.08}s both` })); if (sz * sc > 16) svg.append(s('text', { x: a + (sz * sc) / 2, y: b + (sz * sc) / 2 + 6, 'text-anchor': 'middle', 'font-size': Math.min(26, sz * sc * 0.4), 'font-weight': 800, fill: 'var(--ink)', text: sz }));
        const d = i % 4; let c, s0; // arc centre and start corner
        if (i === 0) { c = [x + 1, y]; s0 = 180; } else if (d === 1) { c = [x, y]; s0 = 90; } else if (d === 2) { c = [x + sz, y]; s0 = 0; } else if (d === 3) { c = [x + sz, y + sz]; s0 = 270; } else { c = [x, y + sz]; s0 = 180; }
        const p1 = P(c[0] + sz * Math.cos((s0 * Math.PI) / 180), c[1] + sz * Math.sin((s0 * Math.PI) / 180)), p2 = P(c[0] + sz * Math.cos(((s0 + 90) * Math.PI) / 180), c[1] + sz * Math.sin(((s0 + 90) * Math.PI) / 180)); path += `${path ? 'L' : 'M'}${p1[0]} ${p1[1]} A${sz * sc} ${sz * sc} 0 0 0 ${p2[0]} ${p2[1]} `; });
      svg.append(s('path', { d: path, fill: 'none', stroke: 'var(--bad)', 'stroke-width': 3 }));
      f.out.innerHTML = `Cạnh các hình vuông: ${F.slice(0, k).join(', ')} · Tỉ số ${F[k - 1]} ÷ ${F[k - 2]} = <b>${U.round(F[k - 1] / F[k - 2], 4)}</b> → tiến dần tới tỉ lệ vàng 1,618…`;
    }
    f.ctrls.append(VZ.range('Số hình vuông', 2, 10, k, 1, (v) => { k = v; SFX.play('pop'); draw(); }));
    draw();
  };
  APP.viz.heroFib = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      const g = c.createLinearGradient(0, 0, w, hh); g.addColorStop(0, '#0f3d2e'); g.addColorStop(1, '#14532d'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
      const cx = w * 0.72, cy = hh * 0.5, n = Math.min(520, Math.floor(t * 90) + 60), sc = Math.min(w, hh) * 0.021;
      for (let i = 0; i < n; i++) { const r = sc * Math.sqrt(i), a = i * 2.39996 + t * 0.05; c.fillStyle = `hsl(${40 + (i % 34)} 90% ${45 + (i % 21)}%)`; c.beginPath(); c.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), sc * 0.5, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.9)'; c.font = `800 ${Math.round(Math.min(w, hh) * 0.05)}px Lexend, sans-serif`; c.textAlign = 'center'; c.fillText('1, 1, 2, 3, 5, 8, 13, 21, 34 …', cx, hh * 0.95);
    });
  };

  /* ---------- question helpers ---------- */
  const nextQ = (a, d, o = {}) => { const T = terms(a, d, 4); return fill(o.q || `Look at the sequence ${seqStr(T)}`, [{ opts: ['Add', 'Subtract'], a: d > 0 ? 0 : 1 }, Math.abs(d), T[3] + d, T[3] + 2 * d], `Each term is ${Math.abs(d)} ${d > 0 ? 'more' : 'less'} than the term before. ${sgn(T[3])} ${d > 0 ? '+' : '−'} ${Math.abs(d)} = ${sgn(T[3] + d)}, then ${sgn(T[3] + 2 * d)}.`, Object.assign({ f: 'Term-to-term rule: [] [] &nbsp; Next two terms: [] , []' }, o)); };
  const firstQ = (a, stps, o = {}) => { const T = [a]; for (let i = 1; i < 3; i++) T.push(apply(T[i - 1], stps)); return list(`The first term of a sequence is ${sgn(a)}. The term-to-term rule is: <b>${ruleTxt(stps)}</b>. Write down the first three terms.`, T, `${sgn(a)}; ${sgn(a)} → ${sgn(T[1])}; ${sgn(T[1])} → ${sgn(T[2])}.`, Object.assign({ ph: 'vd: 4, 9, 19' }, o)); };
  const nthFind = (k, b, o = {}) => { const T = Array.from({ length: 5 }, (_, i) => k * (i + 1) + b); const ans = nthTxt(k, b).replace(/ /g, ''); return expr(o.q || `Work out the nth term rule for the sequence ${seqStr(T)}`, [ans.replace('−', '-')], k !== 1 ? `The terms are the ${k} times table, so nth term = ${k}n.` : `Each term is ${Math.abs(b)} ${b > 0 ? 'more' : 'less'} than its position number, so nth term = ${nthTxt(1, b)}.`, Object.assign({ ph: 'vd: 3n hoặc n + 2', keys: ['n', '+', '−'] }, o)); };
  const fm = (op, v, ins, o = {}) => { const outs = ins.map((x) => OPS[op][2](x, v)); return fill(o.q || `Work out the missing outputs of the function machine: input → <b>${OPS[op][1]} ${v}</b> → output.`, outs, ins.map((x, i) => `${x} ${OPS[op][1]} ${v} = ${outs[i]}`).join('; ') + '.', Object.assign({ f: ins.map((x) => `${x} → []`).join(' &nbsp; ') }, o)); };
  const fmInv = (op, v, outs, o = {}) => { const invF = { add: (t) => t - v, sub: (t) => t + v, mul: (t) => t / v, div: (t) => t * v }[op]; const ins = outs.map(invF); const is = { add: '−', sub: '+', mul: '÷', div: '×' }[op]; return fill(o.q || `The function machine is: input → <b>${OPS[op][1]} ${v}</b> → output. Use inverse operations to work out the missing inputs.`, ins, `Inverse machine: output → ${is} ${v} → input. ` + outs.map((y, i) => `${y} ${is} ${v} = ${ins[i]}`).join('; ') + '.', Object.assign({ f: outs.map((y) => `[] → ${y}`).join(' &nbsp; ') }, o)); };

  APP.addUnit({
    n: 9, strand: 'algebra', title: 'Sequences and functions', vi: 'Dãy số và hàm số',
    blurb: 'Leonardo Pisano, a famous mathematician, was born around 1170 in Pisa, Italy. Later he became known as Fibonacci. In 1202 he included a number pattern in one of his books: 1, 1, 2, 3, 5, 8, 13, 21, 34, … To find the next number, you add the previous two. Fibonacci numbers appear all over nature — in petals, pine cones and sunflower seed heads.',
    blurbVi: 'Chương này học dãy số và quy tắc chuyển tiếp giữa các số hạng (term-to-term rule), dãy hình, quy tắc số hạng thứ n, và máy hàm số với sơ đồ ánh xạ.',
    words: [['sequence', 'dãy số'], ['term', 'số hạng'], ['consecutive terms', 'các số hạng liên tiếp'], ['term-to-term rule', 'quy tắc chuyển từ số hạng này sang số hạng kế tiếp'], ['finite sequence', 'dãy hữu hạn'], ['infinite sequence', 'dãy vô hạn'], ['ellipsis', 'dấu ba chấm (…)'], ['sequence of patterns', 'dãy hình'], ['position number', 'số thứ tự (vị trí)'], ['nth term', 'số hạng thứ n'], ['function', 'hàm số'], ['function machine', 'máy hàm số'], ['input', 'đầu vào'], ['output', 'đầu ra'], ['inverse operation', 'phép toán ngược'], ['mapping diagram', 'sơ đồ ánh xạ'], ['maps to', 'biến thành / ánh xạ tới'], ['one-step function', 'hàm một bước'], ['fewest', 'ít nhất']],
    chat: ['Quy tắc của dãy 4, 8, 20, 56, 164 là gì?', 'Làm sao tìm số hạng thứ n của 6, 7, 8, 9?', 'Phép toán ngược của ×3 là gì?'],
    sections: [
      {
        id: '9.1', t: 'Generating sequences (1)', vi: 'Tạo dãy số (1)',
        goals: ['find and use term-to-term rules for number sequences.'],
        body: [
          ['p', '3, 6, 9, 12, 15, … is a <b>sequence</b> of numbers. Each number is called a <b>term</b>. Terms that follow each other are <b>consecutive terms</b>. Each term is 3 more than the term before, so the <b>term-to-term rule</b> is “Add 3”.'],
          ['p', 'Three dots (an ellipsis) at the end show that the sequence continues forever: an <b>infinite sequence</b>. A sequence without the dots is a <b>finite sequence</b>.'],
          ['viz', 'seqBuilder'],
          ['ex', { t: 'Worked example 9.1', q: 'a Write down the term-to-term rule and the next two terms of 2, 6, 10, 14, … &nbsp; b The first term of a sequence is 5. The term-to-term rule is: Multiply by 2 and then add 1. Write down the first three terms.', steps: ['a: 2 + 4 = 6, 6 + 4 = 10, 10 + 4 = 14 → rule <b>Add 4</b>.', 'Next two terms: 14 + 4 = <b>18</b> and 18 + 4 = <b>22</b>.', 'b: first term 5; second term = 5 × 2 + 1 = 11; third term = 11 × 2 + 1 = 23 → <b>5, 11, 23</b>.'] }],
          ['tip', 'To find a term-to-term rule with two steps (like “× 3 − 4”), check it works for EVERY pair of consecutive terms, not just the first two. You need at least three terms to be sure.'],
          ['vi', ['Dãy số: các số xếp theo một quy luật; mỗi số là một số hạng (term).', 'Quy tắc term-to-term: cách đi từ một số hạng sang số hạng tiếp theo (cộng 3, nhân 2 rồi cộng 1, …).', 'Có dấu “…” ở cuối → dãy vô hạn; không có → dãy hữu hạn.', 'Tìm số hạng trước: dùng phép toán ngược theo thứ tự ngược lại.']],
        ],
        bank: [
          nextQ(7, 4), nextQ(40, -5), nextQ(2, 2), nextQ(1, 3), nextQ(5, 4), nextQ(3, 5), nextQ(30, -2), nextQ(17, -3),
          firstQ(1, [['add', 5]]), firstQ(6, [['mul', 2]]), firstQ(80, [['div', 2]]),
          fill('Fill in the missing terms of these finite sequences.', [8, 14, 23, 29, 41, 20, 17, 11], 'a adds 3; b adds 6; c subtracts 3.', { f: 'a 2, 5, [] , 11, [] , 17, 20 &nbsp; b 5, 11, 17, [] , [] , 35, [] &nbsp; c 26, 23, [] , [] , 14, [] , 8', d: 2 }),
          fill('Fill in the missing terms.', [74, 58, 42, 16, 24, 48, 38, 33, 18, 13], 'd subtracts 8; e adds 8; f subtracts 5.', { f: 'd 90, 82, [] , 66, [] , 50, [] &nbsp; e 8, [] , [] , 32, 40, [] &nbsp; f [] , [] , 28, 23, [] , [] , 8', d: 2 }),
          sort('Is each sequence finite or infinite?', ['Finite', 'Infinite'], [['4, 6, 8, 10, …', 1], ['3, 5, 7, 9, 11, 13, 15', 0], ['85, 75, 65, 55, 45, 35', 0], ['100, 97, 94, 91, 88, …', 1]], 'The three dots show the sequence continues forever.'),
          firstQ(4, [['mul', 2], ['add', 1]]), firstQ(10, [['sub', 8], ['mul', 6]], { d: 2 }), firstQ(24, [['div', 2], ['add', 4]], { d: 2 }),
          match('Match each sequence to its term-to-term rule.', [['11, 14, 17, 20, …', 'add 3'], ['17, 15, 13, 11, …', 'subtract 2'], ['3, 6, 12, 24, …', 'multiply by 2'], ['80, 40, 20, 10, …', 'divide by 2'], ['1, 6, 31, 156, …', 'multiply by 5 then add 1'], ['64, 36, 22, 15, …', 'divide by 2 then add 4']], 'Test each rule on at least two pairs of terms.', { d: 2 }),
          mcq('Sofia and Zara look at the sequence 4, 8, 20, 56, 164, … Sofia says the rule is “Multiply by 2”. Zara says “Add 4”. They are both wrong. What is the correct rule?', ['Multiply by 3 then subtract 4', 'Multiply by 2 then add 4', 'Add 12', 'Multiply by 4 then subtract 8'], 0, '4 × 3 − 4 = 8, 8 × 3 − 4 = 20, 20 × 3 − 4 = 56, 56 × 3 − 4 = 164. Their rules only work for the first two terms.', { d: 3 }),
          num('The second term of a sequence is 13. The term-to-term rule is: Multiply by 2 then subtract 3. What is the first term?', 8, 'Work backwards with inverse operations: 13 + 3 = 16, 16 ÷ 2 = 8. Check: 8 × 2 − 3 = 13 ✓', { d: 3 }),
          mcq('A sequence starts 3, 7, … Which of these could NOT be its term-to-term rule?', ['Multiply by 2', 'Add 4', 'Multiply by 2 then add 1', 'Multiply by 3 then subtract 2'], 0, '3 × 2 = 6, not 7. The others all turn 3 into 7 — so two terms are not enough to know the rule!'),
          gen(() => { const a = R(-10, 30), d = pick([-7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]); return nextQ(a, d); }),
          gen(() => { const a = R(1, 10); const st = pick([[['mul', 2], ['add', R(1, 5)]], [['mul', 3], ['sub', R(1, 4)]], [['add', R(2, 6)], ['mul', 2]], [['mul', 2], ['sub', 1]]]); return firstQ(a, st); }),
          gen(() => { const a = R(2, 40), d = pick([3, 4, 5, 6, 7, 8, 9, 11]) * pick([1, -1]); const T = terms(a, d, 7); const hide = shuffle([1, 2, 3, 4, 5]).slice(0, 3).sort(); return fill('Fill in the missing terms of this finite sequence.', hide.map((i) => T[i]), `The rule is ${d > 0 ? 'add' : 'subtract'} ${Math.abs(d)}.`, { f: T.map((t, i) => (hide.includes(i) ? '[]' : sgn(t))).join(', ') }); }),
          gen(() => { const start = R(10, 40), wk = R(5, 15); const w = R(5, 10); return num(`Mai has $${start} in her savings box. She adds $${wk} every week. How much will she have after ${w} weeks?`, start + wk * w, `Term-to-term rule: add ${wk}. ${start} + ${w} × ${wk} = ${start + wk * w}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const r1 = R(10, 20), d = pick([2, 3, 4]), k = R(8, 15); return num(`In a theatre, row 1 has ${r1} seats. Each row has ${d} more seats than the row in front. How many seats are in row ${k}?`, r1 + (k - 1) * d, `Row ${k} is ${k - 1} steps after row 1: ${r1} + ${k - 1} × ${d} = ${r1 + (k - 1) * d}.`, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '9.2', t: 'Generating sequences (2)', vi: 'Tạo dãy số (2) — dãy hình',
        goals: ['find and use term-to-term rules for number sequences drawn as patterns.'],
        body: [
          ['p', 'Here is a sequence of patterns made from dots. From one pattern to the next, one extra dot is added to each end. So each pattern has two more dots than the previous pattern: the term-to-term rule is “Add 2”. The numbers of dots form the sequence 3, 5, 7, …'],
          ['html', patFig('dots', [1, 2, 3])],
          ['viz', 'patternSeq'],
          ['ex', { t: 'Worked example 9.2', q: 'Here is a sequence of patterns of triangles made from matchsticks. a Draw the next pattern. b Write down the sequence of numbers of matchsticks. c Write down the term-to-term rule. d Explain how the sequence is formed.', fig: patFig('tri', [1, 2, 3]), steps: ['a: pattern 4 has another triangle added to the end — 12 matchsticks.', 'b: <b>3, 6, 9, 12</b>', 'c: <b>Add 3</b> — each term is 3 more than the previous term.', 'd: An extra triangle is added, so three more matchsticks are added from one term to the next.'] }],
          ['tip', 'To find the 20th pattern, a table works but is slow. Faster: find a rule linking the pattern number to the number of shapes, e.g. “multiply the pattern number by 2 and add 3”.'],
          ['vi', ['Đếm số hình ở mỗi bước, viết thành dãy số, rồi tìm quy tắc.', 'Mô tả bằng lời: mỗi bước thêm bao nhiêu hình, thêm ở đâu.', 'Kiểm tra một số có trong dãy không: ví dụ dãy 4, 8, 12 … luôn là bội của 4 nên không thể có 42 hay 93.', 'Lập bảng “số thứ tự — số hình” giúp nhìn ra quy luật.']],
        ],
        bank: [
          fill('This sequence of patterns is made from dots: 4 dots, 7 dots, 10 dots.', [13, 16, 3], 'Each pattern has 3 more dots.', { f: 'Pattern 4: [] dots &nbsp; Pattern 5: [] dots &nbsp; Term-to-term rule: add []' }),
          fill('This sequence of patterns is made from squares.', [14, 17, 3, 20, 26], 'Add 3 each time: 5, 8, 11, 14, 17, 20, 23, 26.', { f: 'Pattern 4: [] &nbsp; Pattern 5: [] &nbsp; Rule: add [] &nbsp; Pattern 6: [] &nbsp; Pattern 8: []', fig: patFig('T', [1, 2, 3]) }),
          num('A sequence of dot patterns has 3, 5, 7, … dots. How many dots are in the 10th pattern?', 21, 'Add 2 nine times: 3 + 9 × 2 = 21 (or 2 × 10 + 1).'),
          fill('This sequence of patterns is made from triangles.', [12, 16, 20], 'Add 4 each time.', { f: 'Pattern 3: [] &nbsp; Pattern 4: [] &nbsp; Pattern 5: []', fig: patFig('tris4', [1, 2]) }),
          mcq('In the triangle pattern (4, 8, 12, … triangles), Yusef thinks one pattern will have 42 triangles. Is he correct?', ['No — every term is a multiple of 4, and 42 is not', 'Yes — pattern 10', 'Yes — pattern 11', 'No — the patterns stop at 40'], 0, '40 is pattern 10 and 44 is pattern 11; 42 is not a multiple of 4.'),
          tf('Frances thinks one of the patterns 4, 8, 12, … will have 93 triangles. Without calculating, you can tell she is wrong because 93 is odd.', true, 'All the terms are even (multiples of 4).'),
          mcq('Jacob’s sequence of dot patterns has 5 dots in pattern 2 and 9 dots in pattern 4. The same number of dots is added each time. How many dots are in pattern 7?', ['15', '13', '17', '14'], 0, 'From pattern 2 to pattern 4 is 2 steps for 4 dots, so add 2 each time: 3, 5, 7, 9, 11, 13, 15.', { d: 2 }),
          mcq('Patterns have 5, 7, 9, 11, … squares. Sofia says pattern 20 has 20 × 2 + 3 = 43 squares. Marcus says 20 + 2 = 22 squares. Who is correct?', ['Sofia', 'Marcus', 'Both', 'Neither'], 0, 'Pattern n has 2n + 3 squares: 2 × 1 + 3 = 5 ✓, 2 × 2 + 3 = 7 ✓. Marcus only added one step of 2.', { d: 2 }),
          fill('Matchstick squares are joined in a row.', [4, 7, 10, 13, 3], 'Each new square needs 3 more matchsticks.', { f: 'Pattern 1: [] &nbsp; Pattern 2: [] &nbsp; Pattern 3: [] &nbsp; Pattern 4: [] &nbsp; Rule: add []', fig: patFig('join', [1, 2, 3]) }),
          gen(() => { const key = pick(Object.keys(PAT)); const P = PAT[key]; const d = P.f(2) - P.f(1); const k = R(5, 9); return fill(`Look at the sequence of patterns.`, [P.f(4), d, P.f(k)], `The patterns have ${P.f(1)}, ${P.f(2)}, ${P.f(3)}, … ${P.unit}: add ${d} each time.`, { f: `Number of ${P.unit} in pattern 4: [] &nbsp; Term-to-term rule: add [] &nbsp; Pattern ${k}: []`, fig: patFig(key, [1, 2, 3]) }); }),
          gen(() => { const k = R(6, 12); return num(`Square tables are pushed together in a row. 1 table seats 4 people, 2 tables seat 6, 3 tables seat 8. How many people can sit at ${k} tables?`, 2 * k + 2, `Add 2 for each extra table: 4 + ${k - 1} × 2 = ${2 * k + 2}.`, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '9.3', t: 'Using the nth term', vi: 'Số hạng thứ n',
        goals: ['use algebra to describe the nth term of a sequence.'],
        body: [
          ['p', 'Look at 3, 6, 9, 12, 15, … In a table of <b>position numbers</b> and terms you can see the 3 times table: Term = 3 × position number. If you let n represent the position number, the rule is: <b>nth term = 3n</b>. You can use it to find any term: the eighth term = 3 × 8 = 24.'],
          ['viz', 'nthTerm'],
          ['ex', { t: 'Worked example 9.3', q: 'a Work out the nth term rule for i 12, 24, 36, 48, 60, … ii 3, 4, 5, 6, 7, … &nbsp; b Work out the 20th term of each sequence.', steps: ['a i: the 12 times table → <b>nth term = 12n</b>.', 'a ii: each term is 2 more than the position number → <b>nth term = n + 2</b>.', 'b i: 12 × 20 = <b>240</b>; b ii: 20 + 2 = <b>22</b>.'] }],
          ['tip', 'To check a rule, substitute n = 1, 2, 3: Mei’s rule n − 2 gives 1 − 2 = −1, 2 − 2 = 0, 3 − 2 = 1, …'],
          ['vi', ['Số hạng thứ n: công thức tính số hạng từ vị trí n.', 'Dãy là bảng cửu chương của a → nth term = an.', 'Mỗi số hạng hơn vị trí b đơn vị → n + b; kém b đơn vị → n − b.', 'Muốn biết một số có trong dãy không: giải tìm n; n phải là số nguyên dương.']],
        ],
        bank: [
          nthFind(6, 0), nthFind(5, 0), nthFind(8, 0), nthFind(15, 0), nthFind(1, 5), nthFind(1, 9), nthFind(1, 4), nthFind(1, 21), nthFind(1, 42),
          fill('The nth term of a sequence is 6n.', [60, 90], '6 × 10 = 60, 6 × 15 = 90.', { f: '10th term: [] &nbsp; 15th term: []' }),
          fill('The sequence 6, 7, 8, 9, 10, … has nth term n + 5.', [25, 40], '20 + 5 = 25, 35 + 5 = 40.', { f: '20th term: [] &nbsp; 35th term: []' }),
          tf('Zara says the nth term of −5, −4, −3, −2, … is n − 6.', true, '1 − 6 = −5, 2 − 6 = −4, 3 − 6 = −3 ✓'),
          list('Write down the first five terms of the sequence with nth term = n − 4.', [-3, -2, -1, 0, 1], '1 − 4 = −3, 2 − 4 = −2, …', { keys: ['−', ','] }),
          list('Write down the first five terms of the sequence with nth term = 10n.', [10, 20, 30, 40, 50], '10 × 1, 10 × 2, …'),
          match('Match each sequence with its nth term rule.', [['0, 1, 2, 3, 4, …', 'n − 1'], ['2, 4, 6, 8, 10, …', '2n'], ['4, 5, 6, 7, 8, …', 'n + 3'], ['7, 14, 21, 28, 35, …', '7n'], ['−2, −1, 0, 1, 2, …', 'n − 3'], ['8, 9, 10, 11, 12, …', 'n + 7']], 'Compare each term with its position number.'),
          fill('Complete the table.', [17, 22, 32, 40, 45, 55, -10, -5, 5, 80, 160, 320], 'Substitute n = 5, 10 and 20 into each rule.', { f: 'n + 12: [] , [] , [] <br>n + 35: [] , [] , [] <br>n − 15: [] , [] , [] <br>16n: [] , [] , []', d: 2, q: 'Complete the table: 5th, 10th and 20th terms of each sequence.' }),
          mcq('Number cards: 20, 22, 36, 40, 63, 100. Which sequence uses ALL six numbers? A: 9n, B: n + 6, C: n + 20, D: 20n', ['B (n + 6)', 'A (9n)', 'C (n + 20)', 'D (20n)'], 0, 'n + 6 = 20 when n = 14, 22 (n = 16), 36 (n = 30), 40 (n = 34), 63 (n = 57), 100 (n = 94). C cannot make 20 because n = 0 is not a position.', { d: 3, fixed: true }),
          multi('Which numbers from 20, 22, 36, 40, 63, 100 can be used in three of the sequences 9n, n + 6, n + 20, 20n?', ['20', '22', '36', '40', '63', '100'], [2, 3, 4, 5], '36 and 63 are in 9n, n + 6 and n + 20; 40 and 100 are in n + 6, n + 20 and 20n.', { d: 3, fixed: true }),
          gen(() => { const k = R(2, 15); return nthFind(k, 0); }), gen(() => { const b = R(1, 30) * pick([1, -1]); return nthFind(1, b); }),
          gen(() => { const t = pick(['mul', 'add', 'sub']); const v = R(2, 25), n = R(10, 100); const rule = t === 'mul' ? v + 'n' : t === 'add' ? 'n + ' + v : 'n − ' + v; const ans = t === 'mul' ? v * n : t === 'add' ? n + v : n - v; return num(`The nth term of a sequence is ${rule}. Work out the ${n}th term.`, ans, `Substitute n = ${n}: ${t === 'mul' ? v + ' × ' + n : n + (t === 'add' ? ' + ' : ' − ') + v} = ${sgn(ans)}.`); }),
          gen(() => { const k = R(3, 9); const x = k * R(5, 30) + (Math.random() < 0.5 ? 0 : R(1, k - 1)); const ok = x % k === 0; return mcq(`Is ${x} a term of the sequence with nth term ${k}n?`, ['Yes', 'No'], ok ? 0 : 1, ok ? `${x} ÷ ${k} = ${x / k}, a whole number, so it is the ${x / k}th term.` : `${x} ÷ ${k} is not a whole number, so ${x} is not in the ${k} times table.`, { fixed: true }); }),
          gen(() => { const fee = R(3, 9); const w = R(10, 40); return num(`A taxi costs $${fee} per kilometre. The cost for n km is ${fee}n dollars. How much is a ${w} km journey?`, fee * w, `${fee} × ${w} = ${fee * w}.`, { pre: '$', app: true }); }, { app: true }),
        ],
      },
      {
        id: '9.4', t: 'Representing simple functions', vi: 'Biểu diễn hàm số đơn giản',
        goals: ['work out input and output numbers from function machines.'],
        body: [
          ['p', 'A <b>function</b> is a relationship between two sets of numbers. You can show a function as a <b>function machine</b>. The numbers you enter are the <b>input</b>; the numbers you get out are the <b>output</b>. A machine with one operation is a <b>one-step function machine</b>. You can also show a function as a <b>mapping diagram</b>: you say that 2 maps to 5, 4 maps to 7, …'],
          ['viz', 'funcMachine'],
          ['ex', { t: 'Worked example 9.4', q: 'a Find the missing inputs and outputs: input 1, 3, __ → × 2 → output __, __, 10. &nbsp; b Draw a mapping diagram.', steps: ['Outputs: multiply the inputs by 2: 1 × 2 = <b>2</b>, 3 × 2 = <b>6</b>.', 'Missing input: work backwards using the <b>inverse operation</b>: 10 ÷ 2 = <b>5</b>.', 'Mapping diagram: 1 maps to 2, 3 maps to 6, 5 maps to 10.'] }],
          ['tip', 'An inverse operation does the opposite: the inverse of + 9 is − 9, the inverse of × 6 is ÷ 6. Chang’s method: draw the inverse machine and push the outputs through it.'],
          ['vi', ['Máy hàm số: input → phép toán → output.', 'Tìm input: dùng máy ngược (phép toán ngược): +↔−, ×↔÷.', 'Sơ đồ ánh xạ: hai trục số, mũi tên nối input với output.', 'Chỉ 1 cặp input–output thì chưa đủ để biết hàm (4 → 12 có thể là +8 hoặc ×3); cần ít nhất 2 cặp.']],
        ],
        bank: [
          fm('add', 5, [2, 3, 4]), fm('mul', 3, [2, 3, 5]), fm('sub', 6, [12, 20, 40]), fm('div', 4, [12, 20, 40]),
          fmInv('add', 7, [7, 12, 16]), fmInv('mul', 5, [5, 10, 30]), fmInv('sub', 3, [15, 30, 4]), fmInv('div', 2, [6, 9, 4]),
          fmInv('add', 9, [14, 25, 39], { q: 'Chang uses the inverse machine for input → + 9 → output. Work out the inputs for the outputs 14, 25 and 39.' }),
          fmInv('sub', 6, [4, 9, 20], { q: 'Use Chang’s method for the machine input → − 6 → output.' }),
          fmInv('add', 13, [7, 12, 38], { d: 2 }), fmInv('mul', 8, [24, 56, 120], { d: 2 }),
          mcq('This mapping diagram shows 1 → 5, 3 → 7, 5 → 9. What is the function?', ['+ 4', '× 5', '+ 2', '× 2'], 0, '1 + 4 = 5, 3 + 4 = 7, 5 + 4 = 9.'),
          mcq('A function machine shows only one pair: input 4, output 12. Which functions could it be?', ['+ 8 or × 3', 'only + 8', 'only × 3', '− 8 or ÷ 3'], 0, '4 + 8 = 12 and 4 × 3 = 12. You need at least two input–output pairs to be sure.', { d: 2 }),
          mcq('What is the inverse operation of “× 6”?', ['÷ 6', '− 6', '+ 6', '× 1/6 then + 6'], 0, 'Division undoes multiplication.'),
          gen(() => { const op = pick(Object.keys(OPS)); const v = R(2, 9); const ins = op === 'div' ? shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3).map((k) => k * v) : op === 'sub' ? [R(v, 20), R(v, 20), R(v, 30)] : [R(0, 12), R(0, 12), R(0, 12)]; return fm(op, v, ins); }),
          gen(() => { const op = pick(Object.keys(OPS)); const v = R(2, 9); const outs = op === 'mul' ? [1, 2, 3, 4, 5, 6, 7, 8].map((k) => k * v).slice(R(0, 4), 8).slice(0, 3) : [R(1, 30), R(1, 30), R(1, 40)].map((y) => (op === 'add' ? y + v : y)); return fmInv(op, v, outs); }),
          gen(() => { const v = pick([2, 3, 4, 5]), w = R(1, 6); const x = R(1, 9); return num(`A two-step function machine: input → × ${v} → + ${w} → output. What is the output when the input is ${x}?`, x * v + w, `${x} × ${v} = ${x * v}, + ${w} = ${x * v + w}.`); }),
          gen(() => { const v = pick([2, 3, 4, 5]), w = R(1, 6); const x = R(1, 9); const y = x * v + w; return num(`A two-step function machine: input → × ${v} → + ${w} → output. The output is ${y}. What was the input?`, x, `Work backwards: ${y} − ${w} = ${y - w}, ÷ ${v} = ${x}.`, { d: 2 }); }),
          gen(() => { const rate = pick([12, 15, 18, 20, 25]); const fee = pick([5, 8, 10]); const hrs = R(2, 8); return num(`A bike-hire shop charges a fixed fee of $${fee} plus $${rate} per hour. Function machine: hours → × ${rate} → + ${fee} → cost. What is the cost for ${hrs} hours?`, hrs * rate + fee, `${hrs} × ${rate} + ${fee} = ${hrs * rate + fee}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const c = 5 * R(0, 20); return num(`To change °C to °F you can use the function machine: input → × 9 → ÷ 5 → + 32 → output. Change ${c}°C to °F.`, (c * 9) / 5 + 32, `${c} × 9 = ${c * 9}, ÷ 5 = ${(c * 9) / 5}, + 32 = ${(c * 9) / 5 + 32}.`, { unit: '°F', app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Fibonacci: nature’s secret counting code', hero: 'heroFib',
      lead: 'Count the spirals on a sunflower, the petals on a daisy or the scales of a pine cone and you will often find 3, 5, 8, 13, 21, 34 or 55. Why does nature love the Fibonacci sequence?',
      leadVi: 'Đếm vòng xoắn trên hoa hướng dương, cánh hoa cúc hay vảy quả thông — bạn sẽ thường gặp các số Fibonacci. Vì sao tự nhiên lại “thích” dãy số này?',
      cards: [
        { t: 'The golden angle', p: 'A sunflower adds each new seed after turning about 137.5° — the “golden angle”. This packs seeds with no gaps, and it creates spirals whose numbers are neighbouring Fibonacci numbers. Change the angle a tiny bit and see the gaps appear!', viz: 'sunflower' },
        { t: 'Golden rectangles', p: 'Put squares with sides 1, 1, 2, 3, 5, 8, … next to each other and draw quarter circles: you get the Fibonacci spiral, like a snail shell. The ratio of neighbouring Fibonacci numbers gets closer and closer to the golden ratio 1.618…', viz: 'fibSpiral' },
        { t: 'Mole and goose', p: 'A goose lays eggs at 2, 7, 12, 17, … A mole pops up at 1, 4, 7, 10, … They meet at 7. Where else? Change the sequences and discover the rule: the meetings are spaced by the lowest common multiple of the two steps.', viz: 'moleGoose' },
        { t: 'Function machines inside computers', p: 'Every computer program is a giant function machine: an input goes in, operations happen, an output comes out. A spreadsheet that turns hours into pay, or a game that turns a key press into a jump, works exactly the same way.', viz: 'funcMachine' },
      ],
      facts: [['1202', 'Liber Abaci', 'Fibonacci’s book also brought the digits 0–9 to Europe.'], ['1.618…', 'golden ratio', 'Divide any Fibonacci number by the one before it.'], ['137.5°', 'golden angle', 'The turn between neighbouring seeds in a sunflower.'], ['34 & 55', 'spirals', 'Typical spiral counts on a large sunflower head.']],
      challenge: { t: 'Where else does the mole find an egg?', p: 'The goose lays eggs at 2, 7, 12, 17, 22, … and the mole pokes out its head at 1, 4, 7, 10, 13, … They meet at 7. Find the next three meeting points and explain the pattern.', a: '7, 22, 37, 52, … — they are 15 apart, because 15 is the lowest common multiple of the steps 5 and 3. (The meeting points form a new sequence with term-to-term rule “add 15”.)' },
    },
    reading: {
      title: 'Fibonacci’s Rabbits', sub: 'The story behind the most famous sequence. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Leonardo of Pisa was born around 1170 in Italy, but he grew up in North Africa, where his father worked as a merchant. There he learned the Hindu–Arabic numerals 0 to 9, which were much easier to use than the Roman numerals that people in Europe used at that time.',
        'In 1202 Leonardo wrote a book called Liber Abaci, which means “The Book of Calculation”. It showed merchants how to use the new numerals for adding, multiplying and working with money. The book was so useful that the Hindu–Arabic numerals slowly spread across Europe.',
        'One problem in the book is about rabbits. A farmer starts with one pair of baby rabbits. After one month a pair becomes adult, and every month after that each adult pair produces a new pair of babies. Rabbits never die in this puzzle. How many pairs are there after a year? Month by month the numbers of pairs are 1, 1, 2, 3, 5, 8, 13, … and at the end of the year there are 144 pairs.',
        'Leonardo was not the first person to discover this sequence. Indian scholars had described it hundreds of years earlier when they studied the rhythms of poetry. The name “Fibonacci”, meaning “son of Bonacci”, was only given to Leonardo in the nineteenth century.',
        'Today the Fibonacci numbers appear in computer science, art and biology. Many flowers have 3, 5, 8 or 13 petals, and pine cones often show 8 spirals one way and 13 the other. Scientists think this happens because growing in this pattern helps plants pack their seeds and leaves as efficiently as possible.',
      ],
      gloss: [['merchant', 'thương nhân'], ['numerals', 'chữ số'], ['spread', 'lan rộng'], ['scholar', 'học giả'], ['rhythm', 'nhịp điệu'], ['efficiently', 'một cách hiệu quả']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Where did Leonardo learn the Hindu–Arabic numerals?', opts: ['in North Africa', 'in Pisa', 'in India', 'in Rome'], a: 0, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'What does “Liber Abaci” mean?', opts: ['The Book of Calculation', 'The Book of Rabbits', 'The Son of Bonacci', 'The Golden Ratio'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'Why do scientists think plants grow in Fibonacci patterns?', opts: ['to pack seeds and leaves efficiently', 'to attract rabbits', 'to grow faster in winter', 'to make more petals'], a: 0, ex: 'Paragraph E.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'Leonardo was the first person to discover the sequence.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'Indian scholars described it earlier (paragraph D).' },
          { type: 'mcq', q: 'Leonardo had three brothers.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'Not mentioned.' },
          { type: 'mcq', q: 'In the puzzle, the rabbits never die.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph C.' },
        ] },
        { title: 'Numbers in the text', qs: [
          { type: 'fill', q: 'Complete.', f: 'Leonardo was born around []. He wrote Liber Abaci in []. After a year there are [] pairs of rabbits. Pine cones often show 8 spirals one way and [] the other.', a: [1170, 1202, 144, 13], ex: 'Paragraphs A, B, C, E.' },
          { type: 'list', q: 'Continue the rabbit sequence: write the next three terms after 1, 1, 2, 3, 5, 8, 13.', a: [21, 34, 55], ordered: true, ex: '8 + 13 = 21, 13 + 21 = 34, 21 + 34 = 55.' },
        ] },
      ],
    },
    listening: {
      title: 'Saving for a new bike', intro: 'Minh is talking to his mum about saving money. Listen and answer.',
      voices: { Minh: 'rounded', Mum: 'airy' },
      lines: [
        { spk: 'Minh', text: 'Mum, the bike I want costs one hundred and eighty dollars. I have already saved thirty dollars.' },
        { spk: 'Mum', text: 'If you save fifteen dollars every week, how long will it take?' },
        { spk: 'Minh', text: 'Thirty, forty-five, sixty … the term-to-term rule is add fifteen. After ten weeks I will have one hundred and eighty dollars.' },
        { spk: 'Mum', text: 'Correct. And what if Grandma gives you thirty dollars for your birthday?' },
        { spk: 'Minh', text: 'Then I would start from sixty dollars, so I would only need eight weeks. That is two weeks earlier!' },
        { spk: 'Mum', text: 'Your little sister has a different plan. She starts with one dollar and wants to double her money every week.' },
        { spk: 'Minh', text: 'One, two, four, eight, sixteen … after eight weeks she would have two hundred and fifty-six dollars! But that is impossible for her — the numbers grow too fast.' },
        { spk: 'Mum', text: 'Exactly. Multiplying sequences grow much faster than adding sequences.' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'Price of the bike: $[] &nbsp; Already saved: $[] &nbsp; Saves each week: $[] &nbsp; Weeks needed: [] &nbsp; Weeks needed with the birthday money: []', a: [180, 30, 15, 10, 8], ex: '30 + 15 × 10 = 180; 60 + 15 × 8 = 180.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'What is the term-to-term rule for the sister’s plan?', opts: ['multiply by 2', 'add 2', 'add 15', 'multiply by 15'], a: 0, ex: '“double her money every week”.' },
          { type: 'num', q: 'How much would the sister have after eight weeks (in dollars)?', a: 256, ex: '1, 2, 4, 8, 16, 32, 64, 128, 256.' },
          { type: 'tf', q: 'Mum says adding sequences grow faster than multiplying sequences.', a: false, ex: 'She says multiplying sequences grow much faster.' },
        ] },
      ],
    },
  });
})();
