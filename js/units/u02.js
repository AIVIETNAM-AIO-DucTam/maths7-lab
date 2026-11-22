/* Unit 2 — Expressions, formulae and equations */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, RNZ, pick, shuffle, N, NB, F } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, expr, gen } = Q;
  const X = (e) => `<span class="m">${e}</span>`;

  /* ---------- widgets ---------- */
  APP.viz.exprMachine = function (el) {
    const f = VZ.frame(el, 'Máy “Think of a number”', { icon: 'robot' });
    const ops = [['×2', (e) => wrapMul(e, 2), (v) => v * 2], ['×3', (e) => wrapMul(e, 3), (v) => v * 3], ['+5', (e) => e + ' + 5', (v) => v + 5], ['−4', (e) => e + ' − 4', (v) => v - 4], ['÷2', (e) => `<span class="frac"><span>${e}</span><span>2</span></span>`, (v) => v / 2]];
    function wrapMul(e, k) { return /[+−]/.test(e) ? `${k}(${e})` : e === 'x' ? k + 'x' : k + '×' + e; }
    let chain = [0, 2]; let x = 5;
    const stage = h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minHeight: '86px' } }); f.stage.append(stage);
    function draw() {
      stage.innerHTML = ''; let e = 'x', v = x;
      stage.append(h('div', { style: { padding: '10px 14px', borderRadius: '12px', background: 'var(--surface)', fontFamily: 'var(--f-mono)', fontWeight: 800 } }, 'x = ' + x));
      chain.forEach((k, i) => { e = ops[k][1](e); v = ops[k][2](v); stage.append(h('span', { class: 'muted' }, '→'), h('div', { style: { padding: '12px 14px', borderRadius: '14px', background: 'var(--sc)', color: '#fff', fontWeight: 800, fontFamily: 'var(--f-mono)', animation: `popIn .35s ${i * 0.08}s both` } }, ops[k][0])); });
      stage.append(h('span', { class: 'muted' }, '→'), h('div', { style: { padding: '10px 14px', borderRadius: '12px', background: 'var(--accent-soft)', fontFamily: 'var(--f-mono)', fontWeight: 800 } }, U.N(U.round(v, 3))));
      f.out.innerHTML = `Expression: <span style="font-size:1.15em">${e}</span> &nbsp;·&nbsp; with x = ${x}: ${U.N(U.round(v, 3))}`;
    }
    f.ctrls.append(...ops.map((o, i) => VZ.btn('+ ' + o[0], () => { if (chain.length < 4) { chain.push(i); draw(); } }, 'btn sm')), VZ.btn('Xoá', () => { chain = []; draw(); }, 'btn sm ghost'), VZ.range('x =', 0, 20, x, 1, (v) => { x = v; draw(); }));
    draw();
  };
  APP.viz.formulaLab = function (el) {
    const f = VZ.frame(el, 'Thay số vào công thức', { icon: 'pencil' });
    const forms = {
      rect: { name: 'A = l × w (area of a rectangle)', vars: [['l', 1, 12, 5], ['w', 1, 8, 4]], calc: (v) => v.l * v.w, show: (v) => `A = ${v.l} × ${v.w} = <b>${v.l * v.w}</b> cm²`, fig: (v) => FIG.shape([[0, 0], [v.l, 0], [v.l, v.w], [0, v.w]], { sides: [v.l + ' cm', v.w + ' cm'], scale: 22 }) },
      days: { name: 'd = 7w (days in w weeks)', vars: [['w', 1, 20, 8]], show: (v) => `d = 7 × ${v.w} = <b>${7 * v.w}</b> days` },
      volt: { name: 'V = IR (voltage)', vars: [['I', 1, 10, 3], ['R', 1, 12, 7]], show: (v) => `V = ${v.I} × ${v.R} = <b>${v.I * v.R}</b> volts` },
      pay: { name: 'T = 9h (pay at $9 per hour)', vars: [['h', 1, 40, 30]], show: (v) => `T = 9 × ${v.h} = <b>$${9 * v.h}</b>` },
      left: { name: 'M = P − E (money left)', vars: [['P', 50, 300, 225], ['E', 0, 150, 72]], show: (v) => `M = ${v.P} − ${v.E} = <b>$${N(v.P - v.E)}</b>` },
    };
    let key = 'rect', vals = {};
    const ctrlBox = h('div', { class: 'vz-c' }); const figBox = h('div', { class: 'qfig' }); f.stage.append(figBox); f.root.insertBefore(ctrlBox, f.out);
    function build() { ctrlBox.innerHTML = ''; vals = {}; forms[key].vars.forEach(([n, lo, hi, d]) => { vals[n] = d; ctrlBox.append(VZ.range(n + ' =', lo, hi, d, 1, (v) => { vals[n] = v; draw(); })); }); draw(); }
    function draw() { const F0 = forms[key]; f.out.innerHTML = F0.show(vals); figBox.innerHTML = F0.fig ? F0.fig(vals) : ''; }
    f.ctrls.append(VZ.seg(Object.keys(forms).map((k) => [k, forms[k].name.split(' (')[0]]), key, (v) => { key = v; build(); }));
    build();
  };
  APP.viz.bricks = function (el) {
    const f = VZ.frame(el, 'Gạch x và y: gom hạng tử đồng dạng', { icon: 'grid' });
    let row = ['x', 'y', 'x', 'c', 'x', 'y']; const W = 640; const svg = VZ.svg(W, 110); f.stage.append(svg);
    const len = { x: 70, y: 46, c: 22 }, col = { x: 'var(--bad)', y: 'var(--number)', c: 'var(--stats)' };
    function draw(sorted) {
      svg.innerHTML = ''; const arr = sorted ? row.slice().sort((a, b) => 'xyc'.indexOf(a) - 'xyc'.indexOf(b)) : row; let xx = 6;
      const tot = U.sum(arr.map((k) => len[k])) + arr.length * 2; const sc = Math.min(1, (W - 12) / tot);
      arr.forEach((k, i) => { const w = len[k] * sc; const g = s('g', { style: `transition:transform .6s; animation:popIn .3s ${i * 0.04}s both` }); g.append(s('rect', { x: xx, y: 30, width: w - 2, height: 40, rx: 6, fill: col[k] }), s('text', { x: xx + w / 2 - 1, y: 56, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#fff', text: k === 'c' ? '1' : k })); svg.append(g); xx += w + 2 * sc; });
      const cx = row.filter((k) => k === 'x').length, cy = row.filter((k) => k === 'y').length, cc = row.filter((k) => k === 'c').length;
      const raw = row.map((k) => (k === 'c' ? '1' : k)).join(' + ');
      const simp = [cx ? (cx === 1 ? 'x' : cx + 'x') : '', cy ? (cy === 1 ? 'y' : cy + 'y') : '', cc ? String(cc) : ''].filter(Boolean).join(' + ') || '0';
      f.out.innerHTML = `${raw || '0'} &nbsp;=&nbsp; <b style="color:var(--accent)">${simp}</b>`;
    }
    f.ctrls.append(VZ.btn('+ x', () => { if (row.length < 14) row.push('x'); draw(); }, 'btn sm'), VZ.btn('+ y', () => { if (row.length < 14) row.push('y'); draw(); }, 'btn sm'), VZ.btn('+ 1', () => { if (row.length < 14) row.push('c'); draw(); }, 'btn sm'), VZ.btn('Gom nhóm', () => { draw(true); SFX.play('whoosh'); }, 'btn sm sc'), VZ.btn('Ngẫu nhiên', () => { row = Array.from({ length: R(4, 9) }, () => pick(['x', 'y', 'c', 'x'])); draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.areaModel = function (el) {
    const f = VZ.frame(el, 'Mô hình diện tích: khai triển ngoặc', { icon: 'grid' });
    let a = 4, b = 1, c = 3; const W = 560, H = 230; const svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const u = 26; const wx = 4 * u * Math.max(1, b) / Math.max(1, b) * b, wc = Math.abs(c) * u, ha = a * u * 0.7; const x0 = 70, y0 = 40;
      const bx = b === 1 ? 'x' : b + 'x';
      svg.append(s('rect', { x: x0, y: y0, width: wx, height: ha, fill: 'color-mix(in srgb, var(--algebra) 30%, transparent)', stroke: 'var(--algebra)', 'stroke-width': 2, style: 'animation:popIn .4s both' }));
      svg.append(s('rect', { x: x0 + wx, y: y0, width: wc, height: ha, fill: c < 0 ? 'color-mix(in srgb, var(--bad) 28%, transparent)' : 'color-mix(in srgb, var(--geometry) 30%, transparent)', stroke: c < 0 ? 'var(--bad)' : 'var(--geometry)', 'stroke-width': 2, style: 'animation:popIn .4s .15s both' }));
      svg.append(s('text', { x: x0 + wx / 2, y: y0 - 10, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: 'var(--algebra)', text: bx }), s('text', { x: x0 + wx + wc / 2, y: y0 - 10, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: c < 0 ? 'var(--bad)' : 'var(--geometry)', text: (c < 0 ? '−' : '+') + Math.abs(c) }));
      svg.append(s('text', { x: x0 - 14, y: y0 + ha / 2 + 6, 'text-anchor': 'end', 'font-size': 18, 'font-weight': 800, fill: 'var(--ink)', text: a }));
      svg.append(s('text', { x: x0 + wx / 2, y: y0 + ha / 2 + 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: 'var(--ink)', text: (a * b === 1 ? '' : a * b) + 'x' }), s('text', { x: x0 + wx + wc / 2, y: y0 + ha / 2 + 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: 'var(--ink)', text: N(a * c) }));
      svg.setAttribute('viewBox', `0 0 ${Math.max(W, x0 + wx + wc + 20)} ${Math.max(H, y0 + ha + 20)}`);
      f.out.innerHTML = `${a}(${bx} ${c < 0 ? '−' : '+'} ${Math.abs(c)}) = ${a} × ${bx} ${c < 0 ? '−' : '+'} ${a} × ${Math.abs(c)} = <b style="color:var(--accent)">${a * b === 1 ? '' : a * b}x ${a * c < 0 ? '−' : '+'} ${Math.abs(a * c)}</b>`;
    }
    f.ctrls.append(VZ.range('Ngoài ngoặc', 1, 6, a, 1, (v) => { a = v; draw(); }), VZ.range('Hệ số x', 1, 3, b, 1, (v) => { b = v; draw(); }), VZ.range('Hằng số', -6, 6, c, 1, (v) => { c = v || 1; draw(); }, N));
    draw();
  };
  APP.viz.balance = function (el) {
    const f = VZ.frame(el, 'Cân thăng bằng: giải phương trình', { icon: 'target' });
    let a = 2, b = 4, c = 16, steps = 0; const W = 600, H = 260; const svg = VZ.svg(W, H); f.stage.append(svg);
    function draw(tilt = 0) {
      svg.innerHTML = '';
      svg.append(s('path', { d: 'M300 230 L270 255 L330 255 Z', fill: 'var(--ink-2)' }), s('line', { x1: 300, y1: 120, x2: 300, y2: 232, stroke: 'var(--ink-2)', 'stroke-width': 6 }));
      const beam = s('g', { transform: `rotate(${tilt} 300 120)`, style: 'transition:transform .6s cubic-bezier(.34,1.56,.64,1)' }); svg.append(beam);
      beam.append(s('rect', { x: 60, y: 114, width: 480, height: 12, rx: 6, fill: 'var(--ink)' }));
      const pan = (cx) => { beam.append(s('path', { d: `M${cx - 95} 130 h190 l-18 36 h-154 z`, fill: 'var(--surface-3)', stroke: 'var(--ink-2)', 'stroke-width': 2 })); };
      pan(150); pan(450);
      // left: a boxes of x and b unit weights
      let lx = 75; for (let i = 0; i < a; i++) { beam.append(s('rect', { x: lx, y: 76, width: 34, height: 34, rx: 6, fill: 'var(--algebra)', style: `animation:popIn .3s ${i * 0.05}s both` }), s('text', { x: lx + 17, y: 99, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#fff', text: 'x' })); lx += 38; }
      for (let i = 0; i < b; i++) { const cx = lx + 10 + (i % 6) * 22, cy = 96 - Math.floor(i / 6) * 22; beam.append(s('circle', { cx, cy, r: 10, fill: 'var(--geometry)', style: `animation:popIn .3s ${i * 0.03}s both` }), s('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#fff', text: '1' })); }
      for (let i = 0; i < c; i++) { const cx = 372 + (i % 8) * 22, cy = 100 - Math.floor(i / 8) * 22; beam.append(s('circle', { cx, cy, r: 10, fill: 'var(--geometry)' }), s('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#fff', text: '1' })); }
      const lhs = (a === 1 ? 'x' : a + 'x') + (b ? ' + ' + b : '');
      svg.append(s('text', { x: 300, y: 30, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: 'var(--ink)', text: `${lhs} = ${c}` }));
      f.out.innerHTML = a === 1 && b === 0 ? `Giải xong: <b style="color:var(--good)">x = ${c}</b>. Kiểm tra lại bằng cách thay vào phương trình ban đầu.` : 'Hãy làm cùng một phép tính ở CẢ HAI bên để giữ cân bằng.';
    }
    function sub() { if (!b) return; draw(-8); SFX.play('drop'); setTimeout(() => { c -= b; b = 0; draw(0); }, 500); }
    function div() { if (b) { APP.toast('Bớt các quả cân 1 trước đã!'); return; } if (a === 1) return; if (c % a) { APP.toast('Chia không hết — thử ví dụ khác'); return; } SFX.play('whoosh'); c = c / a; a = 1; draw(0); if (true) SFX.play('correct'); }
    function newEq() { a = R(1, 4); const xx = R(1, 6); b = R(1, 8); c = a * xx + b; draw(); }
    f.ctrls.append(VZ.btn('− hằng số ở hai bên', sub, 'btn sm sc'), VZ.btn('÷ hệ số ở hai bên', div, 'btn sm sc'), VZ.btn('Phương trình mới', newEq, 'btn sm ghost'));
    draw();
  };
  APP.viz.ineqLine = function (el) {
    const f = VZ.frame(el, 'Bất phương trình trên trục số', { icon: 'spark' });
    let sym = '>', v = 4; const st = h('div'); f.stage.append(st);
    function draw() {
      const lo = Math.floor(v) - 6, hi = Math.floor(v) + 6;
      st.innerHTML = FIG.numberLine(lo, hi, { w: 620, rays: [{ from: v, dir: sym === '>' ? 1 : -1, open: true }] });
      const first = sym === '>' ? Math.floor(v) + 1 : Math.ceil(v) - 1; const lst = sym === '>' ? [0, 1, 2, 3, 4].map((k) => first + k) : [0, 1, 2, 3, 4].map((k) => first - k);
      f.out.innerHTML = `x ${sym} ${N(v)} → ${sym === '>' ? 'số nguyên nhỏ nhất' : 'số nguyên lớn nhất'} là <b>${N(first)}</b>; các giá trị nguyên: ${lst.map((k) => N(k)).join(', ')}, …<div style="font-family:var(--f-body);font-weight:500;color:var(--ink-2);font-size:.88rem">Vòng tròn rỗng: x không được bằng ${N(v)}. Mũi tên kéo dài tới ${sym === '>' ? 'dương vô cùng' : 'âm vô cùng'}.</div>`;
    }
    f.ctrls.append(VZ.seg([['>', 'x > …'], ['<', 'x < …']], sym, (k) => { sym = k; draw(); }), VZ.range('Giá trị', -8, 8, v, 0.5, (k) => { v = k; draw(); }, (k) => N(k)));
    draw();
  };
  // explore
  APP.viz.heroAlgebra = function (el) {
    const toks = ['x', 'y', '=', '+', '2x', '3(n+1)', 'a²', '½', 'πr²', 'E=mc²', 'v=u+at', 'A=lw', 'n−3', 'x>4', 'al-jabr'];
    const P = Array.from({ length: 26 }, (_, i) => ({ t: toks[i % toks.length], x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.02, vy: (Math.random() - 0.5) * 0.02, z: 0.4 + Math.random() }));
    VZ.canvasLoop(el, (c, w, hh, t) => {
      const g = c.createRadialGradient(w * 0.75, hh * 0.3, 10, w * 0.6, hh * 0.5, w * 0.8); g.addColorStop(0, '#3b1f7a'); g.addColorStop(1, '#0d0b22'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
      c.textAlign = 'center';
      P.forEach((p) => { p.x += p.vx * 0.016; p.y += p.vy * 0.016; if (p.x < -0.1) p.x = 1.1; if (p.x > 1.1) p.x = -0.1; if (p.y < -0.1) p.y = 1.1; if (p.y > 1.1) p.y = -0.1; c.globalAlpha = 0.15 + p.z * 0.35; c.fillStyle = '#d9ccff'; c.font = `600 ${Math.round(12 + p.z * 14)}px "JetBrains Mono", monospace`; c.fillText(p.t, p.x * w, p.y * hh); });
      c.globalAlpha = 1; const cx = w * 0.78, cy = hh * 0.42, sc = Math.min(w, hh) * 0.12, tilt = Math.sin(t * 1.3) * 0.12;
      c.save(); c.translate(cx, cy); c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -sc * 0.2); c.lineTo(0, sc * 1.4); c.stroke();
      c.rotate(tilt); c.beginPath(); c.moveTo(-sc * 1.6, 0); c.lineTo(sc * 1.6, 0); c.stroke();
      c.fillStyle = '#a989ff'; c.fillRect(-sc * 1.5, -sc * 0.55, sc * 0.5, sc * 0.5); c.fillStyle = '#ffa53d'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(sc * (0.9 + i * 0.25), -sc * 0.2, sc * 0.11, 0, 7); c.fill(); }
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(sc * 0.32)}px Lexend, sans-serif`; c.fillText('x', -sc * 1.25, -sc * 0.2); c.restore();
    });
  };
  APP.viz.mindTrick = function (el) {
    const f = VZ.frame(el, 'Ảo thuật “nghĩ một số”', { icon: 'bulb' });
    let n = 7, k = 0; const steps = [['Think of a number', (x) => x, 'x'], ['Double it', (x) => 2 * x, '2x'], ['Add 10', (x) => 2 * x + 10, '2x + 10'], ['Halve it', (x) => x + 5, 'x + 5'], ['Subtract your number', () => 5, '5']];
    const box = h('div', { class: 'stack', style: { gap: '6px' } }); f.stage.append(box);
    function draw() { box.innerHTML = ''; steps.slice(0, k + 1).forEach((st, i) => box.append(h('div', { class: 'row', style: { animation: 'stepIn .4s both', fontWeight: 600 } }, h('span', { class: 'pill sc' }, i + 1), h('span', { 'data-tr': '' }, st[0]), h('span', { class: 'spacer' }), h('b', { class: 'mono' }, String(st[1](n))), h('span', { class: 'mono muted' }, '  ← ' + st[2])))); f.out.innerHTML = k === steps.length - 1 ? 'Kết quả LUÔN là 5, vì (2x + 10) ÷ 2 − x = x + 5 − x = 5. Đại số giải thích ảo thuật!' : ''; }
    f.ctrls.append(VZ.range('Số bí mật', 1, 50, n, 1, (v) => { n = v; draw(); }), VZ.btn('Bước tiếp ▶', () => { if (k < steps.length - 1) { k++; SFX.play(k === steps.length - 1 ? 'correct' : 'pop'); draw(); } }, 'btn sm sc'), VZ.btn('Làm lại', () => { k = 0; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.taxiFare = function (el) {
    const f = VZ.frame(el, 'Công thức giá taxi: C = 12 + 9d (nghìn đồng)', { icon: 'chart' });
    let d = 5; const st = h('div'); f.stage.append(st);
    function draw() { st.innerHTML = FIG.grid({ xmin: 0, xmax: 12, ymin: 0, ymax: 12, size: 30, axes: true, fns: [{ f: (x) => (12 + 9 * x) / 10, color: 'var(--accent)' }], points: [{ x: d, y: (12 + 9 * d) / 10, label: `${12 + 9 * d}k` }] }).replace('<svg', '<svg style="max-width:420px"'); f.out.innerHTML = `d = ${d} km → C = 12 + 9 × ${d} = <b>${12 + 9 * d} nghìn đồng</b> (trục tung: chục nghìn đồng)`; }
    f.ctrls.append(VZ.range('Quãng đường d (km)', 0, 12, d, 1, (v) => { d = v; draw(); }));
    draw();
  };
  APP.viz.cipher = function (el) {
    const f = VZ.frame(el, 'Mật mã Caesar: chữ cái → số → n + k', { icon: 'spark' });
    let k = 3; const inp = h('input', { type: 'text', value: 'ALGEBRA', style: { width: '160px', fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }, 'aria-label': 'Từ cần mã hoá' });
    function draw() { const w = inp.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12); const enc = w.split('').map((ch) => { const n = ch.charCodeAt(0) - 65; return String.fromCharCode(((n + k) % 26) + 65); }).join(''); f.stage.innerHTML = `<div class="tbl"><table><tr><th>Letter</th>${w.split('').map((c) => `<td>${c}</td>`).join('')}</tr><tr><th>n</th>${w.split('').map((c) => `<td>${c.charCodeAt(0) - 65}</td>`).join('')}</tr><tr><th>(n + ${k}) mod 26</th>${w.split('').map((c) => `<td>${(c.charCodeAt(0) - 65 + k) % 26}</td>`).join('')}</tr><tr><th>Code</th>${enc.split('').map((c) => `<td><b>${c}</b></td>`).join('')}</tr></table></div>`; f.out.textContent = `${w} → ${enc}`; }
    inp.oninput = draw; f.ctrls.append(h('label', {}, 'Từ:', inp), VZ.range('k =', 1, 25, k, 1, (v) => { k = v; draw(); }));
    draw();
  };

  /* ---------- bank helpers ---------- */
  const vars = ['x', 'y', 'n', 'a', 'b', 'm', 'p', 't', 'k'];
  const lin = (co, v, c) => (co === 1 ? '' : co === -1 ? '−' : N(co)) + v + (c ? (c > 0 ? ' + ' + c : ' − ' + -c) : '');
  const linA = (co, v, c) => (co === 1 ? '' : co === -1 ? '-' : co) + v + (c ? (c > 0 ? '+' + c : '' + c) : '');

  APP.addUnit({
    n: 2, strand: 'algebra', title: 'Expressions, formulae and equations', vi: 'Biểu thức, công thức và phương trình',
    blurb: 'Algebra uses letters to represent numbers. Algebra is used in technology, engineering, medicine and economics. It helps you to think logically and to solve problems. In this unit you construct expressions, use formulae, collect like terms, expand brackets, solve equations and use inequalities.',
    blurbVi: 'Đại số dùng chữ cái để biểu diễn số. Chương này học lập biểu thức, dùng công thức, thu gọn hạng tử đồng dạng, khai triển ngoặc, giải phương trình và bất phương trình đơn giản.',
    words: [['expression', 'biểu thức'], ['equation', 'phương trình'], ['term', 'hạng tử'], ['coefficient', 'hệ số'], ['constant', 'hằng số'], ['variable', 'biến'], ['unknown', 'ẩn số'], ['equivalent', 'tương đương'], ['formula', 'công thức'], ['formulae', 'các công thức'], ['substitute', 'thay thế (thay số)'], ['derive', 'thiết lập, suy ra'], ['like terms', 'hạng tử đồng dạng'], ['collecting like terms', 'thu gọn hạng tử đồng dạng'], ['simplify', 'rút gọn'], ['brackets', 'dấu ngoặc'], ['expand', 'khai triển'], ['solve', 'giải'], ['solution', 'nghiệm, lời giải'], ['inequality', 'bất đẳng thức / bất phương trình'], ['open interval', 'khoảng mở'], ['positive infinity', 'dương vô cùng'], ['negative infinity', 'âm vô cùng'], ['greater than', 'lớn hơn'], ['less than', 'nhỏ hơn']],
    chat: ['Biểu thức khác phương trình thế nào?', 'Cách khai triển 3(2x − 5)', 'Giải 2x + 4 = 16 từng bước'],
    sections: [
      {
        id: '2.1', t: 'Constructing expressions', vi: 'Lập biểu thức',
        goals: ['use letters to represent numbers', 'use the correct order of operations in algebraic expressions', 'write and use expressions.'],
        body: [
          ['p', 'In algebra you can use a letter to represent an unknown number. An <b>expression</b> contains numbers and letters, but not an equals sign. An <b>equation</b> contains numbers and letters and an equals sign.'],
          ['table', ['', '5n + 4', '5n + 4 = 19'], [['Type', 'expression', 'equation'], ['Terms', '5n and 4', '—'], ['Coefficient of n', '5', '5'], ['Constant(s)', '4', '4 and 19'], ['n is…', 'the variable', 'the unknown']]],
          ['tip', '5n + 4 means 5 × n + 4. Use the correct order of operations: do the multiplication before the addition. Always write the number before the letter: 3x, not x3.'],
          ['viz', 'exprMachine'],
          ['ex', { t: 'Worked example 2.1', q: 'Mathew is x years old. David is 4 years older than Mathew. Adam is 2 years younger than Mathew. Kathryn is three times Mathew’s age. Ella is half Mathew’s age. Write down an expression for each person’s age.', steps: ['David: add 4 to x → <b>x + 4</b>', 'Adam: subtract 2 from x → <b>x − 2</b>', 'Kathryn: 3 × x → <b>3x</b>', `Ella: x ÷ 2 → <b>${F('x', 2)}</b>`] }],
          ['vi', ['Biểu thức (expression): có số và chữ, KHÔNG có dấu “=”. Phương trình (equation): có dấu “=”.', 'Trong 5n + 4: hệ số (coefficient) của n là 5, hằng số (constant) là 4.', '“Hơn 4” → + 4; “kém 2” → − 2; “gấp 3 lần” → 3x; “một nửa” → x/2.', '“x less than y” nghĩa là y − x (cẩn thận thứ tự!).']],
        ],
        bank: [
          mcq('Sofia has a bag that contains n counters. She puts in two more counters. Which expression shows the total?', ['n + 2', '2n', 'n − 2', 'n2'], 0, 'Two more → add 2.'),
          expr('Sofia has n counters. She takes out three counters. Write an expression for the number left.', 'n-3', 'Take out 3 → subtract 3.', { show: 'n − 3' }),
          fill('The temperature on Tuesday was t °C. Write an expression for the temperature when it is:', [{ expr: 't+2' }, { expr: '2t' }, { expr: 't/2' }], '“Twice” means × 2; “half” means ÷ 2.', { f: 'a 2 °C higher: [] &nbsp; b twice as warm: [] &nbsp; c half as warm: []' }),
          fill('Write an expression for the answer to each of these.', [{ expr: 'x+6' }, { expr: 'm+b' }, { expr: '3g' }], 'Total → add; three cards → 3 × g.', { f: 'a Dravid has x DVDs and buys six more: [] &nbsp; b Molly is m and Barney is b years old; total age: [] &nbsp; c Ted stores g photos on one card; on three cards: []' }),
          expr('I think of a number x. I multiply the number by 6, then add 1.', '6x+1', 'x × 6 = 6x, then + 1.', { show: '6x + 1' }),
          expr('I think of a number x. I multiply the number by 4, then subtract 9.', '4x-9', '4x − 9.', { show: '4x − 9' }),
          expr('I think of a number x. I divide the number by 6, then subtract 1.', 'x/6-1', 'x ÷ 6 = x/6, then − 1.', { show: 'x/6 − 1' }),
          expr('I think of a number x. I multiply the number by 2, then subtract the result from 25.', '25-2x', 'Subtract 2x FROM 25: 25 − 2x.', { show: '25 − 2x', d: 2 }),
          sort('Classify these expression cards into groups of equivalent expressions.', ['2n + 3', '2n − 3', '3n + 2', '3 − 2n'], [['2 × n + 3', 0], ['3 + 2n', 0], ['3 + 2 × n', 0], ['2 × n − 3', 1], ['2n − 3', 1], ['3 × n + 2', 2], ['2 + 3n', 2], ['2 + 3 × n', 2], ['3 − 2n', 3], ['3 − 2 × n', 3]], 'Addition can be done in any order, but subtraction cannot: 3 − 2n is not the same as 2n − 3.', { d: 2 }),
          fill('In a clothes shop, T-shirts cost $t and shirts cost $s. Write an expression for the total cost of:', [{ expr: 't+s' }, { expr: '4t+2s' }], 'Pedro wrote t × s and 2t + 4s — both wrong.', { f: 'a one T-shirt and one shirt: [] &nbsp; b four T-shirts and two shirts: []' }),
          fill('Write an expression for each of these.', [{ expr: 'y+x' }, { expr: 'y-x' }, { expr: '2n+m' }, { expr: '3b-a' }], '“x less than y” means start with y and take away x.', { f: 'a x more than y: [] &nbsp; b x less than y: [] &nbsp; c m more than two times n: [] &nbsp; d a less than three times b: []', d: 2 }),
          fill('Write an expression for each of these.', [{ expr: 'pq' }, { expr: '4gh' }], 'Write p × q as pq.', { f: 'a p multiplied by q: [] &nbsp; b four times g multiplied by h: []' }),
          mcq('A green rectangle has width x cm and length six times the width. A blue rectangle has width y cm and length 3 cm more than two times the width. Which expression is the difference in the lengths (green − blue)?', ['6x − 2y − 3', '6x − 2y + 3', '6x − 5y', '4x − 3'], 0, 'Green length = 6x; blue length = 2y + 3. 6x − (2y + 3) = 6x − 2y − 3.', { d: 3 }),
          mcq('In the equation 5n + 4 = 19, what is the coefficient of n?', ['5', '4', '19', 'n'], 0, 'The coefficient is the number that multiplies the variable.'),
          tf('5n + 4 is an equation.', false, 'It has no equals sign, so it is an expression.'),
          gen(() => { const v = pick(vars), a = R(2, 9), b = R(1, 15); const k = R(0, 3); const forms = [[`multiply the number by ${a}, then add ${b}`, `${a}${v}+${b}`, `${a}${v} + ${b}`], [`multiply the number by ${a}, then subtract ${b}`, `${a}${v}-${b}`, `${a}${v} − ${b}`], [`divide the number by ${a}, then add ${b}`, `${v}/${a}+${b}`, `${v}/${a} + ${b}`], [`add ${b} to the number`, `${v}+${b}`, `${v} + ${b}`]]; const fm = forms[k]; return expr(`I think of a number ${v}. I ${fm[0]}. Write an expression.`, fm[1], `The expression is ${fm[2]}.`, { show: fm[2] }); }),
          gen(() => { const it = pick([['pens', 'p'], ['apples', 'a'], ['tickets', 't'], ['notebooks', 'n']]), it2 = pick([['rulers', 'r'], ['bananas', 'b'], ['drinks', 'd'], ['erasers', 'e']]); const a = R(2, 7), b = R(2, 7); return expr(`${it[0][0].toUpperCase() + it[0].slice(1)} cost $${it[1]} each and ${it2[0]} cost $${it2[1]} each. Write an expression for the cost of ${a} ${it[0]} and ${b} ${it2[0]}.`, `${a}${it[1]}+${b}${it2[1]}`, `${a} × ${it[1]} + ${b} × ${it2[1]} = ${a}${it[1]} + ${b}${it2[1]}.`, { show: `${a}${it[1]} + ${b}${it2[1]}`, app: true }); }, { app: true }),
          gen(() => { const a = R(2, 9), c = R(1, 20), v = pick(vars); const which = R(0, 2); const qs = [[`coefficient of ${v}`, a], ['constant', c], ['number of terms', 2]]; return num(`In the expression ${a}${v} + ${c}, what is the ${qs[which][0]}?`, qs[which][1], `${a}${v} + ${c} has two terms: ${a}${v} and ${c}. The coefficient of ${v} is ${a}; the constant is ${c}.`); }),
          gen(() => { const a = R(2, 6); if (a === 4) return null; return mcq(`Mai is m years old. Her grandfather is ${a} times her age plus 4 years. Which expression is his age?`, [`${a}m + 4`, `${a}(m + 4)`, `m + ${a} + 4`, `4m + ${a}`], 0, `${a} times her age is ${a}m, then add 4.`, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '2.2', t: 'Using expressions and formulae', vi: 'Sử dụng biểu thức và công thức',
        goals: ['substitute numbers into expressions', 'write and use formulae.'],
        body: [
          ['p', 'A <b>formula</b> is a mathematical rule that shows the relationship between two or more quantities (variables). You can write a formula using words: <i>Area of rectangle = length × width</i>, or using letters: <b>A = l × w</b>.'],
          ['p', 'You can <b>substitute</b> numbers into expressions and formulae. When l = 5 cm and w = 4 cm, A = 5 × 4 = 20 cm². You can write (<b>derive</b>) your own formulae to help you solve problems.'],
          ['viz', 'formulaLab'],
          ['ex', { t: 'Worked example 2.2', q: 'a Work out the value of: i a + b when a = 2 and b = 4 &nbsp; ii 2w − 3v when w = 12 and v = 5. <br>b Write a formula for the number of days in any number of weeks. c Use it to work out the number of days in eight weeks.', steps: ['a i: a + b = 2 + 4 = <b>6</b>', 'a ii: 2w − 3v = 2 × 12 − 3 × 5 = 24 − 15 = <b>9</b> (multiplications before the subtraction)', 'b: number of days = 7 × number of weeks, or <b>d = 7w</b>', 'c: d = 7 × 8 = <b>56</b> days'] }],
          ['vi', ['Công thức (formula) cho biết mối quan hệ giữa các đại lượng, ví dụ A = l × w.', 'Thay số (substitute): thay chữ bằng số rồi tính theo đúng thứ tự phép tính.', 'Có thể dùng phép toán ngược để tìm một biến khác: V = IR ⇒ I = V ÷ R.']],
        ],
        bank: [
          fill('Work out the value of each expression.', [22, 8, 7, 20], 'x/5 means x ÷ 5.', { f: `a x + 9 when x = 13 → [] &nbsp; b ${F('x', 5)} when x = 40 → [] &nbsp; c 10 − x when x = 3 → [] &nbsp; d 2m + n when m = 7, n = 6 → []` }),
          fill('Work out the value of each expression.', [35, 40], 'ab − c = 9 × 8 − 32 = 72 − 32 = 40.', { f: 'a 7x when x = 5 → [] &nbsp; b ab − c when a = 9, b = 8, c = 32 → []' }),
          fill('Work out the value of each expression.', [8, 11, 11, 75, 15, 11], 'p + 2q = 5 + 2 × 3 = 11.', { f: 'a a + 5 (a = 3) → [] &nbsp; b x − 9 (x = 20) → [] &nbsp; c f + g (f = 7, g = 4) → [] &nbsp; d m − n (m = 100, n = 25) → [] &nbsp; e 3k (k = 5) → [] &nbsp; f p + 2q (p = 5, q = 3) → []' }),
          fill('Work out the value of each expression.', [31, 5, 30], '2h + 3t = 16 + 15 = 31.', { f: `a 2h + 3t (h = 8, t = 5) → [] &nbsp; b ${F(30, 'c')} (c = 6) → [] &nbsp; c x + y (x = 19, y = 11) → []` }),
          expr('Raul’s formula is: number of hours = 24 × number of days. Write the formula using letters (h for hours, d for days). Type the right-hand side: h = ?', '24d', 'h = 24d.', { show: '24d', ph: 'vd: 24d' }),
          num('Use h = 24d to work out the number of hours in five days.', 120, '24 × 5 = 120.'),
          num('The number of minutes in h hours is m = 60h. Work out the number of minutes in five hours.', 300, '60 × 5 = 300.'),
          num('Kristina and four friends share the cost of a meal equally between the five of them: a = c ÷ 5. How much does each pay when the total cost is $85?', 17, '85 ÷ 5 = 17.', { pre: '$', app: true }),
          num('Sanjay is paid $9 per hour: T = 9h. Work out T when h = 30.', 270, '9 × 30 = 270.', { pre: '$' }),
          num('Yim uses C = p + i, where p is the cost of petrol and i is insurance. Work out C when p = $25 and i = $7.', 32, '25 + 7 = 32.', { pre: '$' }),
          fill('Jan uses M = P − E (money left = pay − expenses). Find M when:', [153, 142], '225 − 72 = 153.', { f: 'a P = $225 and E = $72 → M = $[] &nbsp; b P = $178 and E = $36 → M = $[]' }),
          num('Jan uses M = P − E. Work out P when M = $160 and E = $45.', 205, 'P = M + E = 160 + 45 = 205 (inverse operation).', { pre: '$', d: 2 }),
          fill('A formula used in Science is V = IR. Work out:', [21, 36, 5, 8], 'I = V ÷ R = 30 ÷ 6 = 5; R = V ÷ I = 40 ÷ 5 = 8.', { f: 'a V when I = 3, R = 7 → [] &nbsp; b V when I = 4, R = 9 → [] &nbsp; c I when V = 30, R = 6 → [] &nbsp; d R when V = 40, I = 5 → []', d: 2 }),
          num('What value of k gives the same answer for k + 10, 3k and 20 − k?', 5, 'k = 5: 5 + 10 = 15, 3 × 5 = 15, 20 − 5 = 15.', { d: 3 }),
          gen(() => { const a = R(2, 9), b = R(2, 9), x = R(1, 12), y = R(1, 10); const k = R(0, 2); const f0 = [[`${a}x + ${b}y`, a * x + b * y], [`${a}x − y`, a * x - y], [`xy + ${b}`, x * y + b]][k]; return num(`Work out the value of ${f0[0]} when x = ${x} and y = ${y}.`, f0[1], `Substitute: ${f0[0].replace(/(\d)x/, '$1 × ' + x).replace(/(\d)y/, '$1 × ' + y).replace('xy', x + ' × ' + y).replace(/\bx\b/, x).replace(/\by\b/, y)} = ${f0[1]}.`); }),
          gen(() => { const base = pick([15, 20, 25]), per = pick([2, 3, 4, 5]), n = R(5, 30); return num(`A class party costs C = ${base} + ${per}n dollars, where n is the number of students. Find C when n = ${n}.`, base + per * n, `C = ${base} + ${per} × ${n} = ${base + per * n}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const l = R(3, 15), w = R(2, 10); return num(`The perimeter of a rectangle is P = 2l + 2w. Find P when l = ${l} cm and w = ${w} cm.`, 2 * l + 2 * w, `P = 2 × ${l} + 2 × ${w} = ${2 * l + 2 * w}.`, { unit: 'cm', fig: FIG.shape([[0, 0], [l, 0], [l, w], [0, w]], { sides: ['l = ' + l, 'w = ' + w], scale: 16 }) }); }),
          gen(() => { const s0 = R(30, 90), t = R(2, 6); return num(`Distance = speed × time (d = st). A car travels at ${s0} km/h for ${t} hours. How far does it go?`, s0 * t, `d = ${s0} × ${t} = ${s0 * t} km.`, { unit: 'km', app: true }); }, { app: true }),
          gen(() => { const I = R(2, 9), Rr = R(2, 12); return num(`Use V = IR. Work out I when V = ${I * Rr} and R = ${Rr}.`, I, `I = V ÷ R = ${I * Rr} ÷ ${Rr} = ${I}.`, { d: 2 }); }),
        ],
      },
      {
        id: '2.3', t: 'Collecting like terms', vi: 'Thu gọn hạng tử đồng dạng',
        goals: ['collect like terms.'],
        body: [
          ['p', 'The length of a red brick is x cm and the length of a blue brick is y cm. Three red bricks joined together have a total length of x + x + x = <b>3x</b> cm. Three red bricks and two blue bricks have a total length of <b>3x + 2y</b> cm.'],
          ['p', 'You can add, subtract or combine <b>like terms</b>. You can <b>simplify</b> an expression by collecting like terms: rewrite it in as short a way as possible. You cannot combine terms that contain different letters.'],
          ['viz', 'bricks'],
          ['table', ['Best way to write', 'Not the best way'], [['a', '1a, 1 × a, a1'], ['2a', 'a + a, 2 × a, a2'], ['a²', 'a × a'], ['ab', 'a × b, ba, b × a'], ['a³b', 'a × a × a × b']]],
          ['ex', { t: 'Worked example 2.3', q: 'Simplify: a 2x + 3x &nbsp; b 7y − 2y &nbsp; c 4p + 3q + 2p − q &nbsp; d 5t + 7 − 3t + 3', steps: ['a: 2x and 3x are like terms → <b>5x</b>', 'b: 7y − 2y = <b>5y</b>', 'c: 4p + 2p = 6p and 3q − q = 2q → <b>6p + 2q</b> (6p and 2q are not like terms)', 'd: 5t − 3t = 2t and 7 + 3 = 10 → <b>2t + 10</b>'] }],
          ['tip', 'xy and yx are like terms: 4xy + 3yx = 7xy. Write the letters in alphabetical order.'],
          ['vi', ['Hạng tử đồng dạng (like terms): có cùng phần chữ (x với x, ab với ba, x² với x²).', 'Chỉ cộng/trừ hệ số, giữ nguyên phần chữ: 5x − 2x = 3x.', 'Không gộp được x với y, hay x với x².', 'Nhớ dấu đứng TRƯỚC mỗi hạng tử khi di chuyển.']],
        ],
        bank: [
          match('Match each expression to its simplified form.', [['x + x', '2x'], ['5x + 4x', '9x'], ['x + 6x', '7x'], ['5x − 2x', '3x'], ['2x − x', 'x'], ['8x − 4x', '4x']], 'Remember that x is the same as 1x.'),
          expr('Simplify x + x + x + x + x', '5x', 'Five lots of x.', { simplified: true, show: '5x' }),
          fill('Simplify each of these expressions.', [{ expr: '6y' }, { expr: '8d' }, { expr: '13t' }, { expr: '14g' }], '8g + 5g + g = 14g.', { f: 'a 2y + 4y = [] &nbsp; b 5d + 3d = [] &nbsp; c 6t + 3t + 4t = [] &nbsp; d 8g + 5g + g = []' }),
          fill('Simplify each of these expressions.', [{ expr: '3w' }, { expr: '7n' }, { expr: '4b^2' }, { expr: 'k^3' }], '9b² − 5b² = 4b²; 8k³ − 5k³ − 2k³ = 1k³ = k³.', { f: 'a 7w − 4w = [] &nbsp; b 8n − n = [] &nbsp; c 9b² − 5b² = [] &nbsp; d 8k³ − 5k³ − 2k³ = []' }),
          expr('Simplify 2a + 3a + 5b', '5a+5b', '2a + 3a = 5a; 5b stays.', { simplified: true, show: '5a + 5b' }),
          expr('Simplify 3c + 5c + 2d + d', '8c+3d', '8c + 3d.', { simplified: true, show: '8c + 3d' }),
          expr('Simplify 4t + 1 + 3t + 9', '7t+10', '7t + 10.', { simplified: true, show: '7t + 10' }),
          expr('Simplify 9k + 5f − 3k − 2f', '6k+3f', '9k − 3k = 6k and 5f − 2f = 3f.', { simplified: true, show: '6k + 3f' }),
          expr('Simplify 10q − 5q + 17 − 9', '5q+8', '5q + 8.', { simplified: true, show: '5q + 8' }),
          expr('Simplify 7r + 2s + 3t − 2r + s + 2t', '5r+3s+5t', '5r + 3s + 5t.', { simplified: true, show: '5r + 3s + 5t', d: 2 }),
          expr('Simplify 12 + 6h + 8k − 6 − 3h − 3k', '3h+5k+6', '3h + 5k + 6.', { simplified: true, show: '3h + 5k + 6', d: 2 }),
          expr('Simplify 4xy + 3yx', '7xy', 'xy and yx are like terms.', { simplified: true, show: '7xy' }),
          expr('Simplify 8pq + 2ed − 3qp + 2de', '5pq+4de', '8pq − 3pq = 5pq; 2de + 2de = 4de.', { simplified: true, show: '5pq + 4de', d: 2 }),
          expr('Simplify 4vb + 2bv + 6ad − 4da', '6bv+2ad', '6bv + 2ad.', { simplified: true, show: '6bv + 2ad', d: 2 }),
          expr('Simplify 8xy + 12xz + 3yx − 9zx', '11xy+3xz', '11xy + 3xz.', { simplified: true, show: '11xy + 3xz', d: 2 }),
          expr('Simplify 4mn − 3nm + 7gh − 7hg', 'mn', 'mn + 0 = mn.', { simplified: true, show: 'mn', d: 3 }),
          mcq('Dai wrote: 2x + 8 + 6x − 4 = 8x + 4 = 12x. What is the correct answer?', ['8x + 4', '12x', '8x + 12', '4x + 4'], 0, '8x and 4 are not like terms, so 8x + 4 cannot be simplified further.'),
          mcq(`Simplify ${F('3a', 4)} + ${F('5a', 12)}. Write your answer as an improper fraction in its simplest form.`, [F('7a', 6), F('8a', 16), F('14a', 12), F('a', 2)], 0, `${F('3a', 4)} = ${F('9a', 12)}; ${F('9a', 12)} + ${F('5a', 12)} = ${F('14a', 12)} = ${F('7a', 6)}.`, { d: 3 }),
          gen(() => { const v = pick(vars), w = pick(vars.filter((q) => q !== v)); const a = R(2, 9), b = R(1, 9), c = R(2, 9), d = R(1, c); const res = `${a + b}${v}+${c - d}${w}`; return expr(`Simplify ${a}${v} + ${c}${w} + ${b}${v} − ${d}${w}`, (a + b) + v + (c - d ? '+' + (c - d) + w : ''), `${a}${v} + ${b}${v} = ${a + b}${v}; ${c}${w} − ${d}${w} = ${c - d}${w}.`, { simplified: true, show: (a + b) + v + (c - d ? ' + ' + (c - d === 1 ? '' : c - d) + w : '') }); }),
          gen(() => { const v = pick(vars), a = R(3, 12), b = R(1, a - 1), c = R(2, 15), d = R(1, 9); return expr(`Simplify ${a}${v} + ${c} − ${b}${v} + ${d}`, `${a - b}${v}+${c + d}`, `${a}${v} − ${b}${v} = ${a - b}${v}; ${c} + ${d} = ${c + d}.`, { simplified: true, show: `${a - b === 1 ? '' : a - b}${v} + ${c + d}` }); }),
          gen(() => { const a = R(2, 8), b = R(2, 8), c = R(2, 8); return expr(`In an algebraic pyramid, each block is the sum of the two blocks below it. The bottom row is ${a}x, ${b}x, ${c}x. Write the expression in the top block.`, `${a + 2 * b + c}x`, `Middle row: ${a + b}x and ${b + c}x. Top: ${a + 2 * b + c}x.`, { simplified: true, d: 2 }); }),
          gen(() => { const a = R(2, 6), b = R(2, 6); return expr(`A rectangle has length ${a}x cm and width ${b}y cm. Write a simplified expression for its perimeter.`, `${2 * a}x+${2 * b}y`, `${a}x + ${b}y + ${a}x + ${b}y = ${2 * a}x + ${2 * b}y.`, { simplified: true, app: true }); }, { app: true }),
        ],
      },
      {
        id: '2.4', t: 'Expanding brackets', vi: 'Khai triển dấu ngoặc',
        goals: ['expand brackets.'],
        body: [
          ['p', 'Some algebraic expressions include brackets. To <b>expand</b> a term with brackets, you multiply each term inside the brackets by the term outside the brackets. This is sometimes called “multiplying out the brackets”.'],
          ['rule', 'a(b + c) = ab + ac &nbsp;&nbsp;|&nbsp;&nbsp; a(b − c) = ab − ac', 'Expanding'],
          ['viz', 'areaModel'],
          ['ex', { t: 'Worked example 2.4', q: 'Expand the brackets: a 4(n + 3) &nbsp; b 2(x − 5) &nbsp; c 3(2g + h − 7)', steps: ['a: 4 × n + 4 × 3 = <b>4n + 12</b>', 'b: 2 × x − 2 × 5 = <b>2x − 10</b> (there is a minus sign before the 5)', 'c: 3 × 2g + 3 × h − 3 × 7 = <b>6g + 3h − 21</b>'] }],
          ['tip', 'Su uses a multiplication box (like the area model above) and Li uses arcs: 6(x + 4) → 6 × x and 6 × 4 → 6x + 24. Both methods work — choose the one that helps you not to miss a term.'],
          ['vi', ['Nhân số bên ngoài với TỪNG hạng tử trong ngoặc.', 'Giữ đúng dấu: 3(2 − 5x) = 6 − 15x (không phải 6 + 15x).', 'Sau khi khai triển, thu gọn các hạng tử đồng dạng: 5(2x + 4) − 12 = 10x + 8.']],
        ],
        bank: [
          fill('Copy and complete. Expand the brackets first.', [{ expr: '2x+18' }, { expr: '3y-3' }, { expr: '28+4p' }, { expr: '5q-15' }], '2(x + 9) = 2 × x + 2 × 9 = 2x + 18.', { f: 'a 2(x + 9) = [] &nbsp; b 3(y − 1) = [] &nbsp; c 4(7 + p) = [] &nbsp; d 5(q − 3) = []' }),
          fill('Expand the brackets.', [{ expr: '3y+18' }, { expr: '4w+8' }, { expr: '5z+25' }, { expr: '3b-3' }], 'Multiply each term inside by the number outside.', { f: 'a 3(y + 6) = [] &nbsp; b 4(w + 2) = [] &nbsp; c 5(z + 5) = [] &nbsp; d 3(b − 1) = []' }),
          fill('Expand the brackets.', [{ expr: '6d-54' }, { expr: '12-6x' }, { expr: '12+6f' }, { expr: '35-5p' }], '6(2 − x) = 12 − 6x.', { f: 'a 6(d − 9) = [] &nbsp; b 6(2 − x) = [] &nbsp; c 6(2 + f) = [] &nbsp; d 5(7 − p) = []' }),
          expr('Expand 3(2x + 1)', '6x+3', '3 × 2x = 6x; 3 × 1 = 3.', { simplified: true, show: '6x + 3' }),
          expr('Expand 4(3y + 5)', '12y+20', '12y + 20.', { simplified: true, show: '12y + 20' }),
          expr('Expand 6(4z + 7v + 9)', '24z+42v+54', '24z + 42v + 54.', { simplified: true, show: '24z + 42v + 54' }),
          expr('Expand 8(3e − 6 + 2f)', '24e-48+16f', '24e − 48 + 16f.', { simplified: true, show: '24e − 48 + 16f' }),
          expr('Expand 7(6c − 7h)', '42c-49h', '42c − 49h.', { simplified: true, show: '42c − 49h' }),
          expr('Expand 9(5 + 3h − 4i)', '45+27h-36i', '45 + 27h − 36i.', { simplified: true, show: '45 + 27h − 36i', d: 2 }),
          mcq('Bethan wrote 3(2 − 5x) = 6 + 15x. What is the correct answer?', ['6 − 15x', '6 − 5x', '5 − 15x', '6x − 15'], 0, '3 × 2 = 6 and 3 × 5x = 15x, keeping the minus sign: 6 − 15x.'),
          mcq('Bethan wrote 2(6x − 3) = 12x − 3. What mistake did she make?', ['She did not multiply the 3 by 2', 'She multiplied 6x by 3', 'She changed the sign', 'She did not multiply 6x by 2'], 0, 'Correct: 2(6x − 3) = 12x − 6.'),
          tf('2(12x + 15), 3(10 + 8x), 4(6x + 26) and 6(5 + 4x) all expand to the same expression.', false, '4(6x + 26) = 24x + 104, but the others all equal 24x + 30.', { d: 2 }),
          tf('3(4b + 5) and 3(5 + 4b) expand to the same expression.', true, 'Both equal 12b + 15 because addition can be done in any order.'),
          fill('A rectangle has width 8 cm and length (3y + 4) cm. Write simplified expressions for its:', [{ expr: '24y+32' }, { expr: '6y+24' }], 'Area = 8(3y + 4) = 24y + 32. Perimeter = 2 × 8 + 2(3y + 4) = 16 + 6y + 8 = 6y + 24.', { f: 'a area = [] cm² &nbsp; b perimeter = [] cm', d: 3, fig: FIG.shape([[0, 0], [9, 0], [9, 4], [0, 4]], { sides: ['3y + 4 cm', '8 cm'], scale: 22 }) }),
          expr('In triangle ABC the angle at A is (4k − 7m)°. The angle at B is two times the size of the angle at A. Write an expression for angle B.', '8k-14m', '2(4k − 7m) = 8k − 14m.', { simplified: true, show: '8k − 14m', d: 2 }),
          expr('Expand and simplify 4(x + 7) − 1', '4x+27', '4x + 28 − 1 = 4x + 27.', { simplified: true, show: '4x + 27', d: 2 }),
          expr('Expand and simplify 7(x + 3) + 5x', '12x+21', '7x + 21 + 5x = 12x + 21.', { simplified: true, show: '12x + 21', d: 2 }),
          expr('Expand and simplify 12 + 3(2x − 3)', '6x+3', '12 + 6x − 9 = 6x + 3.', { simplified: true, show: '6x + 3', d: 2 }),
          gen(() => { const a = R(2, 9), b = R(1, 6), c = RNZ(-12, 12), v = pick(vars); return expr(`Expand ${a}(${lin(b, v, c)})`, `${a * b}${v}${a * c > 0 ? '+' : ''}${a * c}`, `${a} × ${b === 1 ? '' : b}${v} = ${a * b}${v}; ${a} × ${NB(c)} = ${N(a * c)}.`, { simplified: true, show: `${a * b}${v} ${a * c > 0 ? '+' : '−'} ${Math.abs(a * c)}` }); }),
          gen(() => { const a = R(2, 6), b = R(1, 5), c = R(1, 9), d = R(1, 9), v = pick(vars); return expr(`Expand and simplify ${a}(${lin(b, v, c)}) + ${d}${v}`, `${a * b + d}${v}+${a * c}`, `${a * b}${v} + ${a * c} + ${d}${v} = ${a * b + d}${v} + ${a * c}.`, { simplified: true, show: `${a * b + d}${v} + ${a * c}`, d: 2 }); }),
          gen(() => { const a = R(2, 9), q = R(1, 9); let p = R(2, 9); if (a + p === a * p) p = 3; return mcq(`Which is the correct expansion of ${a}(${p}x − ${q})?`, [`${a * p}x − ${a * q}`, `${a * p}x − ${q}`, `${a + p}x − ${a * q}`, `${a * p}x + ${a * q}`], 0, `Multiply both terms by ${a}.`); }),
          gen(() => { const n = R(3, 9), p = R(2, 15); return expr(`Tickets cost $(x + ${p}) each. Write and expand an expression for the cost of ${n} tickets.`, `${n}x+${n * p}`, `${n}(x + ${p}) = ${n}x + ${n * p}.`, { simplified: true, app: true }); }, { app: true }),
        ],
      },
      {
        id: '2.5', t: 'Constructing and solving equations', vi: 'Lập và giải phương trình',
        goals: ['write and use equations.'],
        body: [
          ['p', 'To <b>solve</b> an equation, you need to find the value of the unknown letter. Consider the equation x + 5 = 12. Subtract 5 from both sides: x + 5 − 5 = 12 − 5, so x = 7. You have found the <b>solution</b> to the equation.'],
          ['rule', 'Whatever you do to one side of an equation, you must do to the other side. Use inverse operations: + ↔ −, × ↔ ÷', 'Balance'],
          ['viz', 'balance'],
          ['ex', { t: 'Worked example 2.5', q: 'Solve these equations and check your answers: a x − 3 = 12 &nbsp; b 2y + 4 = 16', steps: ['a: Add 3 to both sides: x − 3 + 3 = 12 + 3, so <b>x = 15</b>. Check: 15 − 3 = 12 ✓', 'b: Subtract 4 from both sides: 2y = 12', 'Divide both sides by 2: <b>y = 6</b>. Check: 2 × 6 + 4 = 16 ✓'] }],
          ['tip', 'When the unknown is on the right-hand side (12 = y + 3), Dayita rewrites it as y + 3 = 12 and then solves as normal.'],
          ['vi', ['Giải phương trình = tìm giá trị của ẩn làm cho hai vế bằng nhau.', 'Làm phép toán ngược ở CẢ HAI vế: trừ hằng số trước, rồi chia cho hệ số.', 'Luôn kiểm tra: thay nghiệm vào phương trình ban đầu.', 'Bài toán lời: đặt ẩn → lập phương trình → giải → trả lời câu hỏi.']],
        ],
        bank: [
          fill('Solve these equations.', [4, 16, 5], 'Use inverse operations.', { f: 'a x + 6 = 10 → x = [] &nbsp; b x − 6 = 10 → x = [] &nbsp; c 2x = 10 → x = []' }),
          fill('Solve each equation.', [7, 3, 13, 12], 'Subtract the number that is added to x.', { f: 'a x + 4 = 11 → [] &nbsp; b x + 3 = 6 → [] &nbsp; c 2 + x = 15 → [] &nbsp; d 7 + x = 19 → []' }),
          fill('Solve each equation.', [13, 10, 26, 48], 'Add the number that is subtracted from x.', { f: 'a x − 4 = 9 → [] &nbsp; b x − 2 = 8 → [] &nbsp; c x − 12 = 14 → [] &nbsp; d x − 18 = 30 → []' }),
          fill('Solve each equation.', [4, 6, 10, 6], 'Divide both sides by the coefficient.', { f: 'a 3x = 12 → [] &nbsp; b 5x = 30 → [] &nbsp; c 7x = 70 → [] &nbsp; d 12x = 72 → []' }),
          fill('Use Dayita’s method to solve these equations.', [12, 7, 18, 28, 3, 7], '15 = y + 3 → y + 3 = 15 → y = 12.', { f: 'a 15 = y + 3 → [] &nbsp; b 9 = y + 2 → [] &nbsp; c 13 = y − 5 → [] &nbsp; d 25 = y − 3 → [] &nbsp; e 24 = 8y → [] &nbsp; f 42 = 6y → []' }),
          fill('Write an equation and solve it to find the unknown number.', [15, 14, 6], 'a: n + 3 = 18 → n = 15.', { f: 'a I think of a number and add 3. The answer is 18 → [] &nbsp; b I subtract 4. The answer is 10 → [] &nbsp; c I multiply it by 4. The answer is 24 → []' }),
          fill('Steffan solved these equations wrongly. Find the correct solutions.', [-9, 4, -7], 'x + 7 = −2 → x = −2 − 7 = −9; x − 6 = −2 → x = −2 + 6 = 4; 5x = −35 → x = −7.', { f: 'a x + 7 = −2 → x = [] &nbsp; b x − 6 = −2 → x = [] &nbsp; c 5x = −35 → x = []', neg: true, d: 2 }),
          fill('Solve each of these equations.', [5, 4, 5], '2a + 3 = 13 → 2a = 10 → a = 5.', { f: 'a 2a + 3 = 13 → [] &nbsp; b 4a + 1 = 17 → [] &nbsp; c 3a − 2 = 13 → []' }),
          fill('Solve each of these equations.', [6, 4, 8], '4 = 2c − 8 → 12 = 2c → c = 6.', { f: 'a 4 = 2c − 8 → [] &nbsp; b 14 = 3c + 2 → [] &nbsp; c 29 = 4c − 3 → []', d: 2 }),
          num('Two bricks of length a cm and one brick of length 8 cm have a total length of 20 cm. Write an equation and find a.', 6, '2a + 8 = 20 → 2a = 12 → a = 6.', { unit: 'cm', fig: '<svg viewBox="0 0 360 60"><rect x="4" y="10" width="110" height="36" rx="5" fill="var(--bad)"/><rect x="118" y="10" width="110" height="36" rx="5" fill="var(--bad)"/><rect x="232" y="10" width="120" height="36" rx="5" fill="var(--number)"/><text x="59" y="34" text-anchor="middle" fill="#fff" font-weight="800">a cm</text><text x="173" y="34" text-anchor="middle" fill="#fff" font-weight="800">a cm</text><text x="292" y="34" text-anchor="middle" fill="#fff" font-weight="800">8 cm</text></svg>' }),
          num('An isosceles triangle has two equal sides of length 26 cm and (6p − 10) cm. Find p.', 6, '6p − 10 = 26 → 6p = 36 → p = 6.', { d: 2 }),
          fill('Write and solve an equation for each situation.', [29, 13, 24, 16], 'Paul: x − 3 = 26 → 29. Yaz: y + 5 = 18 → 13. Nial: 2m = 48 → 24. Jin: 2j + 3 = 35 → 16.', { f: 'a Paul sells 3 DVDs and has 26 left. He started with [] &nbsp; b Yaz buys 5 books and now has 18. She started with [] &nbsp; c Nial rides twice as far on Tuesday (48 km). Monday: [] km &nbsp; d Jana (35) is three more than twice Jin’s age. Jin is []', d: 2, app: true }),
          gen(() => { const v = pick(vars), x = R(1, 20), b = R(1, 20); const k = R(0, 2); if (k === 0) return num(`Solve ${v} + ${b} = ${x + b}`, x, `${v} = ${x + b} − ${b} = ${x}.`); if (k === 1) return num(`Solve ${v} − ${b} = ${x}`, x + b, `${v} = ${x} + ${b} = ${x + b}.`); const a = R(2, 12); return num(`Solve ${a}${v} = ${a * x}`, x, `${v} = ${a * x} ÷ ${a} = ${x}.`); }),
          gen(() => { const v = pick(vars), x = R(1, 12), a = R(2, 9), b = RNZ(-15, 20); return num(`Solve ${lin(a, v, b)} = ${a * x + b}`, x, `${b > 0 ? 'Subtract ' + b : 'Add ' + -b} on both sides: ${a}${v} = ${a * x}. Divide by ${a}: ${v} = ${x}. Check: ${a} × ${x} ${b > 0 ? '+' : '−'} ${Math.abs(b)} = ${a * x + b} ✓`, { d: 2 }); }),
          gen(() => { const x = R(-12, -1), b = R(1, 15); return num(`Solve x + ${b} = ${N(x + b)}`, x, `x = ${N(x + b)} − ${b} = ${N(x)}.`, { neg: true, d: 2 }); }),
          gen(() => { const x = R(2, 15), a = R(2, 5), b = R(1, 12); return num(`I think of a number, multiply it by ${a}, then add ${b}. The answer is ${a * x + b}. What was my number?`, x, `${a}n + ${b} = ${a * x + b} → ${a}n = ${a * x} → n = ${x}.`); }),
          gen(() => { const pr = R(3, 12), n = R(2, 8), fee = R(2, 10); return num(`A cinema ticket costs $${pr}. Lan pays a booking fee of $${fee} plus the cost of n tickets. She pays $${pr * n + fee} in total. Write an equation and find n.`, n, `${pr}n + ${fee} = ${pr * n + fee} → ${pr}n = ${pr * n} → n = ${n}.`, { app: true }); }, { app: true }),
          gen(() => { const w = R(2, 9), l = w + R(1, 8); return num(`The perimeter of a rectangle is ${2 * (l + w)} cm. Its length is ${l} cm. Write an equation and find the width w.`, w, `2 × ${l} + 2w = ${2 * (l + w)} → 2w = ${2 * w} → w = ${w}.`, { unit: 'cm', app: true, d: 2 }); }, { app: true }),
        ],
      },
      {
        id: '2.6', t: 'Inequalities', vi: 'Bất đẳng thức (khoảng mở)',
        goals: ['use letters to represent a range of numbers.'],
        body: [
          ['p', 'You can use a letter and an <b>inequality</b> to represent an <b>open interval</b>. The inequality symbols are: <b>&lt;</b> meaning “is less than” and <b>&gt;</b> meaning “is greater than”.'],
          ['p', 'The inequality x &gt; 4 means that x can be any number greater than 4 (but not equal to 4). The inequality y &lt; 7 means that y can be any number less than 7.'],
          ['viz', 'ineqLine'],
          ['tip', 'You use an <b>open circle</b> for &lt; and &gt; inequalities. The arrow shows the numbers continue towards positive infinity (→) or negative infinity (←).'],
          ['ex', { t: 'Worked example 2.6', q: 'a For x &gt; 5: ii What is the smallest integer that x could be? iii List the integer values. &nbsp; b For y &lt; 2: ii largest integer? iii list.', steps: ['a: Open circle at 5, line going right.', 'a ii: x is greater than 5, so the smallest integer is <b>6</b>. iii: 6, 7, 8, 9, 10, …', 'b: Open circle at 2, line going left.', 'b ii: the largest integer is <b>1</b>. iii: 1, 0, −1, −2, −3, …'] }],
          ['vi', ['x > 4: x lớn hơn 4 (không bằng 4) – vẽ vòng tròn rỗng tại 4, mũi tên sang phải.', 'x < 7: x nhỏ hơn 7 – mũi tên sang trái.', 'Với x > 5.2, số nguyên nhỏ nhất là 6; với n < −6, số nguyên lớn nhất là −7.', 'Không có số nguyên lớn nhất thoả x > 5 vì dãy kéo dài vô hạn.']],
        ],
        bank: [
          mcq('What does x > 10 mean?', ['x is greater than 10', 'x is less than 10', 'x is equal to 10', 'x is at most 10'], 0, '> means “is greater than”.'),
          mcq('What does x < −4 mean?', ['x is less than −4', 'x is greater than −4', 'x is less than 4', 'x is equal to −4'], 0, '< means “is less than”.'),
          fill('Write these statements as inequalities.', [['n>-1', 'n > -1'], ['p<0', 'p < 0'], ['q<-2', 'q < -2']], 'Use > for “greater than” and < for “less than”.', { f: 'a n is greater than −1: [] &nbsp; b p is less than zero: [] &nbsp; c q is less than −2: []', neg: true }),
          fill('For each inequality, write down the smallest integer that y could be.', [5, -6, 3], 'y > 2.5 → the next integer above 2.5 is 3.', { f: 'a y > 4 → [] &nbsp; b y > −7 → [] &nbsp; c y > 2.5 → []', neg: true }),
          fill('For each inequality, write down the largest integer that n could be.', [-7, 11, 4], 'n < −6 → −7 is the largest integer below −6.', { f: 'a n < −6 → [] &nbsp; b n < 12 → [] &nbsp; c n < 4.5 → []', neg: true }),
          match('Match each inequality to the correct largest or smallest integer.', [['x > 5.2', 'smallest integer 6'], ['y < 5.2', 'largest integer 5'], ['m < −3.5', 'largest integer −4'], ['p > −3.5', 'smallest integer −3'], ['k < 0.9', 'largest integer 0'], ['h > −0.9', 'smallest integer 0 ']], 'Draw each inequality on a number line first.', { d: 2 }),
          mcq('Katya says: “For x > 7, the smallest integer is 7 and x could be 7, 8, 9, 10, 11, …”. What is the correct answer?', ['8; 8, 9, 10, 11, 12, …', '7; 7, 8, 9, 10, …', '6; 6, 7, 8, 9, …', '8; 8, 7, 6, 5, …'], 0, 'x cannot equal 7, so the smallest integer is 8.'),
          tf('For y > 4 you can write down the largest integer that y could be.', false, 'The integers continue forever (towards positive infinity), so there is no largest one.'),
          mcq('Which inequality does this number line show?', ['x > −3', 'x < −3', 'x > −2', 'x < 3'], 0, 'Open circle at −3 and the arrow points right.', { fig: FIG.numberLine(-7, 2, { rays: [{ from: -3, dir: 1, open: true }] }) }),
          mcq('Which inequality does this number line show?', ['x < −1', 'x > −1', 'x < 1', 'x > 1'], 0, 'Open circle at −1, arrow to the left.', { fig: FIG.numberLine(-5, 3, { rays: [{ from: -1, dir: -1, open: true }] }) }),
          gen(() => { const v = R(-9, 9) + pick([0, 0, 0.5]); const gt = U.chance(0.5); const ans = gt ? Math.floor(v) + 1 : Math.ceil(v) - 1; return num(`For the inequality x ${gt ? '>' : '<'} ${N(v)}, write down the ${gt ? 'smallest' : 'largest'} integer that x could be.`, ans, `x cannot equal ${N(v)}. The ${gt ? 'next integer above' : 'next integer below'} ${N(v)} is ${N(ans)}.`, { neg: true }); }),
          gen(() => { const v = R(-6, 6), gt = U.chance(0.5); return mcq('Which inequality does this number line show?', [`x ${gt ? '>' : '<'} ${N(v)}`, `x ${gt ? '<' : '>'} ${N(v)}`, `x ${gt ? '>' : '<'} ${N(v + 1)}`, `x ${gt ? '<' : '>'} ${N(v - 1)}`], 0, `Open circle at ${N(v)}; the arrow points ${gt ? 'right (greater than)' : 'left (less than)'}.`, { fig: FIG.numberLine(v - 5, v + 5, { rays: [{ from: v, dir: gt ? 1 : -1, open: true }] }) }); }),
          gen(() => { const v = R(-5, 8); const items = shuffle([v - 3, v - 1, v, v + 1, v + 2.5, v + 4, v - 0.5]); return sort(`Which numbers satisfy x > ${N(v)}?`, ['satisfies x > ' + N(v), 'does not'], items.map((k) => [N(k), k > v ? 0 : 1]), `${N(v)} itself does NOT satisfy x > ${N(v)}.`); }),
          gen(() => { const h0 = R(120, 140); return mcq(`To ride a roller coaster you must be taller than ${h0} cm. Which inequality shows the allowed heights h?`, [`h > ${h0}`, `h < ${h0}`, `h = ${h0}`, `${h0} > h`], 0, '“Taller than” means greater than.', { app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Algebra: from al-jabr to computer code', hero: 'heroAlgebra',
      lead: 'Twelve centuries ago a scholar in Baghdad wrote a book about “restoring and balancing” equations. Today the same ideas run spreadsheets, games and every app on your phone.',
      leadVi: 'Từ cuốn sách “cân bằng phương trình” ở Baghdad 1200 năm trước đến các ứng dụng trên điện thoại ngày nay.',
      cards: [
        { t: 'The House of Wisdom', p: 'Around 820 AD, <b>Muhammad ibn Musa al-Khwarizmi</b> worked at the House of Wisdom in Baghdad. His book explained how to solve equations by <i>al-jabr</i> (restoring) and <i>al-muqabala</i> (balancing). The word <b>algebra</b> comes from al-jabr, and the word <b>algorithm</b> comes from his name.', viz: 'balance' },
        { t: 'A magic trick explained', p: 'Think of a number, double it, add 10, halve it, then subtract your number. The answer is always 5! Algebra shows why: (2x + 10) ÷ 2 − x = x + 5 − x = 5.', viz: 'mindTrick' },
        { t: 'Formulae run the world', p: 'Taxi apps, phone bills and electricity meters all use <b>formulae</b>. A taxi might charge a fixed fee plus an amount for every kilometre. Change the distance and watch the cost change.', viz: 'taxiFare' },
        { t: 'Secret codes are algebra', p: 'Julius Caesar hid messages by shifting every letter. If A = 0, B = 1, …, Z = 25, the code is the expression <b>n + k</b> (going back to 0 after 25). Spies and computers still use algebra to keep messages safe.', viz: 'cipher' },
      ],
      facts: [['820 AD', 'al-Khwarizmi', 'He wrote <i>The Compendious Book on Calculation by Completion and Balancing</i> in Baghdad.'], ['1557', 'the “=” sign', 'Robert Recorde invented the equals sign: two parallel lines, because “no two things can be more equal”.'], ['1637', 'x for the unknown', 'René Descartes made it popular to use x, y and z for unknown numbers.'], ['E = mc²', 'Einstein, 1905', 'One of the most famous formulae: energy equals mass times the speed of light squared.']],
      challenge: { t: 'The age puzzle', p: 'In 5 years’ time, Ana will be twice as old as she was 4 years ago. How old is Ana now? Write an equation using x for her age now.', a: 'In 5 years: x + 5. Four years ago: x − 4. So x + 5 = 2(x − 4) = 2x − 8. Then x + 13 = 2x, so <b>x = 13</b>. Check: 18 = 2 × 9 ✓.' },
    },
    reading: {
      title: 'The Man Who Balanced Equations', sub: 'A short biography. Tap words for their Vietnamese meanings.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'About 1200 years ago, the city of Baghdad was one of the most important centres of learning in the world. The ruler built a library and research centre called the House of Wisdom. Scholars from many countries travelled there to translate books from Greek, Persian and Sanskrit, and to make new discoveries.',
        'One of these scholars was Muhammad ibn Musa al-Khwarizmi. He studied astronomy, geography and mathematics. Around the year 820, he wrote a book about solving problems with unknown numbers. People in his time needed these methods for sharing land, dividing money between family members and trading goods.',
        'Al-Khwarizmi did not use letters like x or y. Instead, he wrote everything in words. He explained two main steps. The first step, <i>al-jabr</i>, means “restoring”: moving a subtracted amount to the other side so that it becomes an addition. The second step, <i>al-muqabala</i>, means “balancing”: removing equal amounts from both sides.',
        'His book was later translated into Latin, and European students used it for hundreds of years. The title word al-jabr slowly changed into “algebra”. His own name, written in Latin as “Algoritmi”, gave us the word “algorithm”, which today means a set of step-by-step instructions, like a computer program.',
        'Modern algebra uses symbols, which makes it much quicker to write. However, the main idea has not changed since al-Khwarizmi’s time: an equation is like a balance, and whatever you do to one side, you must also do to the other.',
      ],
      gloss: [['scholar', 'học giả'], ['translate', 'dịch'], ['restoring', 'khôi phục'], ['balancing', 'cân bằng'], ['algorithm', 'thuật toán'], ['trading', 'buôn bán']],
      parts: [
        { title: 'Match each paragraph with its heading', qs: [
          { type: 'match', q: 'Match the paragraphs (A–E) to the headings.', a: [['Paragraph A', 'A city of learning'], ['Paragraph B', 'Why people needed new methods'], ['Paragraph C', 'Two important steps'], ['Paragraph D', 'Words that came from a book and a name'], ['Paragraph E', 'An idea that has not changed']], ex: 'Read the first and last sentences of each paragraph.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'Scholars at the House of Wisdom translated books from other languages.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'Al-Khwarizmi used the letter x for unknown numbers.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'Paragraph C: he wrote everything in words.' },
          { type: 'mcq', q: 'Al-Khwarizmi was born in Baghdad.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'The passage does not say where he was born.' },
          { type: 'mcq', q: 'His book was translated into Latin.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph D.' },
        ] },
        { title: 'Complete the sentences', note: 'Use ONE or TWO words from the passage.', qs: [
          { type: 'fill', q: 'Fill each gap.', f: '<i>Al-jabr</i> means [] and <i>al-muqabala</i> means [] . Today, an [] is a set of step-by-step instructions.', a: [['restoring'], ['balancing'], ['algorithm']], ex: 'Paragraphs C and D.' },
          { type: 'mcq', q: 'According to paragraph B, people needed these methods for…', opts: ['sharing land and trading goods', 'building libraries', 'studying stars only', 'writing computer programs'], a: 0, ex: 'Paragraph B.' },
          { type: 'num', q: 'In approximately which year did al-Khwarizmi write his book?', a: 820, ex: 'Paragraph B: around the year 820.' },
        ] },
      ],
    },
    listening: {
      title: 'Planning the class party', intro: 'Two students, Lan and Tom, are working out the cost of a party. Listen and answer.',
      voices: { Lan: 'airy', Tom: 'rounded' },
      lines: [
        { spk: 'Lan', text: 'Tom, the hall for our class party costs fifteen dollars, plus four dollars for every student who comes.' },
        { spk: 'Tom', text: 'So we can write a formula. Let C be the total cost and n be the number of students. C equals fifteen plus four n.' },
        { spk: 'Lan', text: 'Good. If twenty students come, the cost is fifteen plus four times twenty. That’s fifteen plus eighty, so ninety-five dollars.' },
        { spk: 'Tom', text: 'But our class only has seventy-one dollars in the party fund. How many students can come?' },
        { spk: 'Lan', text: 'Let’s make an equation. Fifteen plus four n equals seventy-one. Subtract fifteen from both sides: four n equals fifty-six.' },
        { spk: 'Tom', text: 'Then divide both sides by four. n equals fourteen. So fourteen students can come.' },
        { spk: 'Lan', text: 'Let’s check. Four times fourteen is fifty-six, plus fifteen is seventy-one. Perfect!' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Write the numbers you hear.', f: 'Hall hire: $[] &nbsp; Cost per student: $[] &nbsp; Cost for 20 students: $[] &nbsp; Money in the party fund: $[]', a: [15, 4, 95, 71], ex: 'C = 15 + 4n; 15 + 80 = 95; the fund has $71.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Which formula do they write?', opts: ['C = 15 + 4n', 'C = 4 + 15n', 'C = 19n', 'n = 15 + 4C'], a: 0, ex: '“C equals fifteen plus four n.”' },
          { type: 'mcq', q: 'What is the first step they use to solve 15 + 4n = 71?', opts: ['subtract 15 from both sides', 'divide both sides by 4', 'add 15 to both sides', 'multiply both sides by 4'], a: 0, ex: '“Subtract fifteen from both sides: four n equals fifty-six.”' },
          { type: 'num', q: 'How many students can come to the party?', a: 14, ex: '4n = 56, so n = 14.' },
          { type: 'tf', q: 'Lan checks the answer by substituting it back into the equation.', a: true, ex: '“Four times fourteen is fifty-six, plus fifteen is seventy-one.”' },
        ] },
      ],
    },
  });
})();
