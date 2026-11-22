/* Unit 1 — Integers */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, RNZ, pick, shuffle, N, NB, F } = U;
  const { mcq, multi, tf, num, list, frac, fill, order, match, sort, txt, gen } = Object.assign({ list: (q, a, ex, o) => Object.assign({ type: 'list', q, a, ex }, o) }, Q);

  /* ---------- widgets ---------- */
  // number line with animated hops for a ± b
  APP.viz.intLine = function (el) {
    const f = VZ.frame(el, 'Number line: cộng & trừ số nguyên', { icon: 'spark' });
    const W = 640, H = 150, lo = -12, hi = 12, pad = 24, X = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad), Y = 100;
    const svg = VZ.svg(W, H); f.stage.append(svg);
    let a = -4, b = 6, op = '+';
    const base = s('g'); svg.append(base);
    base.append(s('line', { x1: 8, y1: Y, x2: W - 8, y2: Y, stroke: 'var(--ink-2)', 'stroke-width': 2 }));
    for (let v = lo; v <= hi; v++) { base.append(s('line', { x1: X(v), y1: Y - 6, x2: X(v), y2: Y + 6, stroke: 'var(--ink-2)', 'stroke-width': v === 0 ? 3 : 1.4 })); base.append(s('text', { x: X(v), y: Y + 24, 'text-anchor': 'middle', 'font-size': 12, fill: v < 0 ? 'var(--bad)' : v > 0 ? 'var(--number)' : 'var(--ink)', 'font-weight': v === 0 ? 800 : 500, text: N(v) })); }
    base.append(s('text', { x: X(-6), y: Y + 44, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--bad)', text: '← negative integers' }), s('text', { x: X(6), y: Y + 44, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--number)', text: 'positive integers →' }));
    svg.setAttribute('viewBox', `0 0 ${W} ${H + 10}`);
    const arcs = s('g'); svg.append(arcs);
    const dot = s('circle', { r: 9, cy: Y, cx: X(a), fill: 'var(--accent)', stroke: 'var(--surface)', 'stroke-width': 3 }); svg.append(dot);
    const lbl = s('text', { y: Y - 52, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: 'var(--accent)' }); svg.append(lbl);
    let stop = null;
    function draw(animate) {
      stop && stop(); arcs.innerHTML = '';
      const move = op === '+' ? b : -b, end = a + move;
      const txt = op === '+' ? `${N(a)} + ${N(b)} = ${N(end)}` : `${N(a)} − ${N(b)} = ${N(a)} + ${N(-b)} = ${N(end)}`;
      f.out.innerHTML = `${txt}<div style="font-family:var(--f-body);font-weight:500;font-size:.88rem;color:var(--ink-2)">Bắt đầu tại ${N(a)}, đi ${Math.abs(move)} bước sang ${move >= 0 ? 'PHẢI (→)' : 'TRÁI (←)'}${op === '−' ? ' vì trừ ' + N(b) + ' là cộng số đối ' + N(-b) : ''}.</div>`;
      if (end < lo || end > hi) { f.out.innerHTML += '<div class="muted">(kết quả nằm ngoài trục)</div>'; }
      const steps = Math.abs(move), dir = Math.sign(move);
      const paths = [];
      for (let k = 0; k < steps; k++) { const x1 = X(a + dir * k), x2 = X(a + dir * (k + 1)); const p = s('path', { d: `M${x1} ${Y - 8} Q${(x1 + x2) / 2} ${Y - 38} ${x2} ${Y - 8}`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5, opacity: animate ? 0 : 1, 'stroke-linecap': 'round' }); arcs.append(p); paths.push(p); }
      lbl.textContent = (move >= 0 ? '+' : '−') + steps;
      lbl.setAttribute('x', X(a + move / 2));
      if (!animate || !steps) { dot.setAttribute('cx', X(Math.max(lo, Math.min(hi, end)))); return; }
      dot.setAttribute('cx', X(a)); let last = -1;
      stop = VZ.animate(Math.min(2600, 260 * steps), (e, k) => {
        const pos = a + move * k; dot.setAttribute('cx', X(Math.max(lo, Math.min(hi, pos))));
        dot.setAttribute('cy', Y - Math.sin(((k * steps) % 1) * Math.PI) * 30);
        const idx = Math.floor(k * steps); if (idx > last && idx < steps) { paths[idx].setAttribute('opacity', 1); last = idx; SFX.play('tick'); }
      }, () => { dot.setAttribute('cy', Y); paths.forEach((p) => p.setAttribute('opacity', 1)); SFX.play('pop'); });
    }
    f.ctrls.append(VZ.range('Bắt đầu', -10, 10, a, 1, (v) => { a = v; draw(false); }, N), VZ.seg([['+', '+'], ['−', '−']], op, (v) => { op = v; draw(false); }), VZ.range('Số', -10, 10, b, 1, (v) => { b = v; draw(false); }, N), VZ.btn('▶ Chạy', () => draw(true), 'btn sm sc'));
    draw(false);
  };
  // zero pairs with counters
  APP.viz.zeroPairs = function (el) {
    const f = VZ.frame(el, 'Zero pairs: +1 và −1 triệt tiêu nhau', { icon: 'atom' });
    const W = 560, H = 150; const svg = VZ.svg(W, H); f.stage.append(svg);
    let pos = 5, neg = 3;
    function draw(pairing) {
      svg.innerHTML = '';
      const tot = pos + neg; const per = 12;
      const place = (i, isPos) => { const r = Math.floor(i / per), c = i % per; return [26 + c * 44, (isPos ? 30 : 100) + r * 0]; };
      for (let i = 0; i < pos; i++) { const [x, y] = place(i, true); const g = s('g', { transform: `translate(${x} ${y})` }); g.append(s('circle', { r: 17, fill: 'var(--number)' }), s('text', { y: 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: '#fff', text: '+' })); if (pairing && i < Math.min(pos, neg)) g.style.cssText = 'transition:transform .6s, opacity .6s;'; svg.append(g); }
      for (let i = 0; i < neg; i++) { const [x, y] = place(i, false); const g = s('g', { transform: `translate(${x} ${y})` }); g.append(s('circle', { r: 17, fill: 'var(--bad)' }), s('text', { y: 6, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#fff', text: '−' })); svg.append(g); }
      for (let i = 0; i < Math.min(pos, neg); i++) svg.append(s('line', { x1: 26 + i * 44, y1: 50, x2: 26 + i * 44, y2: 80, stroke: 'var(--ink-3)', 'stroke-dasharray': '3 3' }));
      f.out.innerHTML = `(+${pos}) + (−${neg}) = <b>${N(pos - neg)}</b> <span style="font-family:var(--f-body);font-weight:500;color:var(--ink-2)">· ${Math.min(pos, neg)} cặp số 0 bị loại bỏ</span>`;
    }
    function cancel() {
      const k = Math.min(pos, neg); if (!k) return; const gs = [...svg.querySelectorAll('g')];
      gs.forEach((g, i) => { const isPair = (i < pos && i < k) || (i >= pos && i - pos < k); if (isPair) { g.style.transition = 'opacity .5s, transform .5s'; g.style.opacity = 0; } });
      SFX.play('whoosh'); setTimeout(() => { pos -= k; neg -= k; draw(); }, 520);
    }
    f.ctrls.append(VZ.btn('+1', () => { if (pos < 12) pos++; draw(); }, 'btn sm'), VZ.btn('−1', () => { if (neg < 12) neg++; draw(); }, 'btn sm'), VZ.btn('Ghép cặp số 0', cancel, 'btn sm sc'), VZ.btn('Ví dụ ngẫu nhiên', () => { pos = R(0, 9); neg = R(0, 9); draw(); }, 'btn sm ghost'));
    draw();
  };
  // pattern ladder for multiplying by negatives
  APP.viz.signLadder = function (el) {
    const f = VZ.frame(el, 'Quy luật: nhân với số âm', { icon: 'spark' });
    let a = 3; const box = h('div', { class: 'tbl', 'data-tr': '' }); f.stage.append(box);
    const line = h('div'); f.stage.append(line);
    function draw(anim) {
      const rows = []; for (let k = 3; k >= -3; k--) rows.push([`${a} × ${NB(k)}`, N(a * k)]);
      box.innerHTML = `<table><tr><th>Calculation</th><th>Answer</th><th></th></tr>${rows.map((r, i) => `<tr style="${anim ? `animation:stepIn .4s ${i * 0.18}s both` : ''}"><td class="m">${r[0]}</td><td class="m" style="color:${a * (3 - i) < 0 ? 'var(--bad)' : 'var(--number)'};font-weight:800">${r[1]}</td><td style="font-size:.8rem;color:var(--ink-3)">${i ? '−' + a : ''}</td></tr>`).join('')}</table>`;
      line.innerHTML = FIG.numberLine(-3 * a - 1, 3 * a + 1, { w: 600, step: 1, major: a, marks: [3, 2, 1, 0, -1, -2, -3].map((k) => ({ v: a * k, color: k < 0 ? 'var(--bad)' : 'var(--number)' })) });
      f.out.innerHTML = `Mỗi lần thừa số thứ hai giảm 1, kết quả giảm ${a}. Vậy ${a} × (−3) = −${3 * a}.`;
    }
    f.ctrls.append(VZ.range('Thừa số thứ nhất', 2, 9, a, 1, (v) => { a = v; draw(true); }), VZ.btn('▶ Phát lại', () => { draw(true); SFX.play('whoosh'); }, 'btn sm sc'));
    draw(true);
  };
  // 1..100 grid of multiples
  APP.viz.multGrid = function (el) {
    const f = VZ.frame(el, 'Bảng 1–100: tìm bội chung', { icon: 'grid' });
    let a = 4, b = 6; const W = 420, c = 40; const svg = VZ.svg(W + 4, W + 4); svg.style.maxWidth = '440px'; f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const L = U.lcm(a, b);
      for (let i = 1; i <= 100; i++) {
        const x = 2 + ((i - 1) % 10) * c * 1.05, y = 2 + Math.floor((i - 1) / 10) * c * 1.05; const ma = i % a === 0, mb = i % b === 0;
        const g = s('g', { style: `animation:popIn .35s ${(i % 10) * 0.02 + Math.floor((i - 1) / 10) * 0.03}s both` });
        g.append(s('rect', { x, y, width: c, height: c, rx: 8, fill: ma && mb ? 'var(--accent)' : ma ? 'var(--number-soft)' : mb ? 'var(--geometry-soft)' : 'var(--surface)', stroke: i === L ? 'var(--ink)' : 'var(--line)', 'stroke-width': i === L ? 3 : 1 }));
        if (ma && !mb) g.append(s('circle', { cx: x + 8, cy: y + 8, r: 3.5, fill: 'var(--number)' }));
        if (mb && !ma) g.append(s('circle', { cx: x + c - 8, cy: y + 8, r: 3.5, fill: 'var(--geometry)' }));
        g.append(s('text', { x: x + c / 2, y: y + c / 2 + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': ma && mb ? 800 : 500, fill: ma && mb ? '#fff' : 'var(--ink)', text: i }));
        svg.append(g);
      }
      svg.setAttribute('viewBox', `0 0 ${10 * c * 1.05} ${10 * c * 1.05}`);
      const com = []; for (let i = 1; i <= 100; i++) if (i % a === 0 && i % b === 0) com.push(i);
      f.out.innerHTML = `<span style="color:var(--number)">● bội của ${a}</span> &nbsp; <span style="color:var(--geometry)">● bội của ${b}</span> &nbsp; <span style="color:var(--accent)">■ bội chung: ${com.join(', ') || '(không có ≤ 100)'}</span><br>LCM(${a}, ${b}) = <b>${L}</b>`;
    }
    f.ctrls.append(VZ.range('Số A', 2, 15, a, 1, (v) => { a = v; draw(); }), VZ.range('Số B', 2, 15, b, 1, (v) => { b = v; draw(); }));
    draw();
  };
  // Venn diagram of factors
  APP.viz.factorVenn = function (el) {
    const f = VZ.frame(el, 'Biểu đồ Venn: ước chung & ƯCLN', { icon: 'target' });
    let a = 18, b = 27; const W = 560, H = 270; const svg = VZ.svg(W, H); f.stage.append(svg);
    function place(arr, cx, cy, rw, rh) { return arr.map((v, i) => { const n = arr.length; const ang = (i / Math.max(1, n)) * Math.PI * 2 + 0.4; const rr = n === 1 ? 0 : 0.55 + 0.35 * (i % 2); return [v, cx + Math.cos(ang) * rw * rr, cy + Math.sin(ang) * rh * rr]; }); }
    function draw() {
      svg.innerHTML = ''; const fa = U.factors(a), fb = U.factors(b); const com = fa.filter((x) => fb.includes(x)), oa = fa.filter((x) => !com.includes(x)), ob = fb.filter((x) => !com.includes(x)); const H_ = Math.max(...com);
      svg.append(s('ellipse', { cx: 200, cy: 140, rx: 170, ry: 115, fill: 'color-mix(in srgb, var(--number) 16%, transparent)', stroke: 'var(--number)', 'stroke-width': 2.5 }));
      svg.append(s('ellipse', { cx: 360, cy: 140, rx: 170, ry: 115, fill: 'color-mix(in srgb, var(--geometry) 16%, transparent)', stroke: 'var(--geometry)', 'stroke-width': 2.5 }));
      svg.append(s('text', { x: 90, y: 24, 'font-size': 15, 'font-weight': 800, fill: 'var(--number)', text: 'Factors of ' + a }), s('text', { x: 470, y: 24, 'font-size': 15, 'font-weight': 800, fill: 'var(--geometry)', 'text-anchor': 'middle', text: 'Factors of ' + b }));
      const drawSet = (arr, cx, rw, cls) => place(arr, cx, 140, rw, 70).forEach(([v, x, y], i) => { const big = v === H_; const g = s('g', { style: `animation:popIn .4s ${i * 0.06}s both` }); if (big) g.append(s('circle', { cx: x, cy: y - 5, r: 20, fill: 'var(--accent)' })); g.append(s('text', { x, y, 'text-anchor': 'middle', 'font-size': big ? 18 : 15, 'font-weight': big ? 800 : 600, fill: big ? '#fff' : 'var(--ink)', text: v })); svg.append(g); });
      drawSet(oa, 120, 70); drawSet(ob, 440, 70); drawSet(com, 280, 48);
      const [sn, sd] = U.fracSimp(a, b);
      f.out.innerHTML = `Common factors: ${com.join(', ')} → HCF(${a}, ${b}) = <b>${H_}</b><br>Rút gọn phân số: ${F(a, b)} = ${F(a / H_ + '<small style="opacity:.6">×' + H_ + '</small>', b / H_ + '<small style="opacity:.6">×' + H_ + '</small>')} = ${F(sn, sd)}`;
    }
    f.ctrls.append(VZ.num('A =', a, (v) => { if (v >= 2 && v <= 120) { a = Math.round(v); draw(); } }, { min: 2, max: 120 }), VZ.num('B =', b, (v) => { if (v >= 2 && v <= 120) { b = Math.round(v); draw(); } }, { min: 2, max: 120 }), VZ.btn('Ngẫu nhiên', () => { const g = pick([2, 3, 4, 5, 6, 8, 9, 12]); a = g * R(2, 7); b = g * R(2, 9); if (a === b) b += g; f.ctrls.querySelectorAll('input')[0].value = a; f.ctrls.querySelectorAll('input')[1].value = b; draw(); }, 'btn sm ghost'));
    draw();
  };
  // divisibility tester
  APP.viz.divTester = function (el) {
    const f = VZ.frame(el, 'Máy kiểm tra chia hết', { icon: 'check' });
    const inp = h('input', { type: 'text', inputmode: 'numeric', value: '87654', style: { width: '150px', fontSize: '18px', fontFamily: 'var(--f-mono)' }, 'aria-label': 'Số cần kiểm tra' });
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '8px' } }); f.stage.append(grid);
    function reasons(nStr) {
      const n = BigInt(nStr); const d = nStr.split('').map(Number); const sum = U.sum(d); const last = d[d.length - 1]; const l2 = +nStr.slice(-2), l3 = +nStr.slice(-3);
      const rev = d.slice().reverse(); const odd = U.sum(rev.filter((_, i) => i % 2 === 0)), even = U.sum(rev.filter((_, i) => i % 2 === 1));
      const t7 = nStr.length > 1 ? BigInt(nStr.slice(0, -1)) - 2n * BigInt(last) : n;
      return [
        [2, n % 2n === 0n, `chữ số cuối là ${last}`], [3, sum % 3 === 0, `tổng chữ số = ${sum}`], [4, l2 % 4 === 0, `2 chữ số cuối: ${String(l2).padStart(2, '0')}`],
        [5, last === 0 || last === 5, `chữ số cuối là ${last}`], [6, n % 2n === 0n && sum % 3 === 0, 'chia hết cho cả 2 và 3?'], [7, n % 7n === 0n, `${nStr.slice(0, -1) || 0} − 2×${last} = ${t7}`],
        [8, l3 % 8 === 0, `3 chữ số cuối: ${String(l3).padStart(3, '0')}`], [9, sum % 9 === 0, `tổng chữ số = ${sum}`], [10, last === 0, `chữ số cuối là ${last}`], [11, (odd - even) % 11 === 0, `${odd} − ${even} = ${odd - even}`],
      ];
    }
    function draw() {
      const v = inp.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''); if (!v) return; grid.innerHTML = '';
      reasons(v).forEach(([k, ok, why], i) => grid.append(h('div', { style: { padding: '10px', borderRadius: '12px', background: ok ? 'var(--good-soft)' : 'var(--surface)', border: '2px solid ' + (ok ? 'var(--good)' : 'var(--line)'), animation: `popIn .35s ${i * 0.05}s both` } }, h('b', { style: { fontFamily: 'var(--f-display)', fontSize: '1.1rem', color: ok ? 'var(--good)' : 'var(--ink-3)' } }, (ok ? '✓ ' : '✗ ') + '÷ ' + k), h('div', { style: { fontSize: '.78rem', color: 'var(--ink-2)' } }, why))));
      const okList = reasons(v).filter((r) => r[1]).map((r) => r[0]); f.out.textContent = okList.length ? `${v} chia hết cho: ${okList.join(', ')}` : `${v} không chia hết cho số nào từ 2 đến 11`;
      SFX.play('pop');
    }
    inp.addEventListener('input', () => { clearTimeout(inp._t); inp._t = setTimeout(draw, 350); });
    f.ctrls.append(h('label', {}, 'Số:', inp), VZ.btn('Số ngẫu nhiên', () => { inp.value = String(R(1000, 99999)); draw(); }, 'btn sm ghost'), VZ.btn('Thử 2520', () => { inp.value = '2520'; draw(); }, 'btn sm ghost'));
    draw();
  };
  // squares and cubes
  APP.viz.squareCube = function (el) {
    const f = VZ.frame(el, 'Số chính phương & số lập phương', { icon: 'grid' });
    let n = 3; const W = 600, H = 260; const svg = VZ.svg(W, H); f.stage.append(svg);
    function cubeAt(g, x, y, sz) { // isometric unit cube at screen pos (top vertex)
      const dx = sz * 0.866, dy = sz * 0.5;
      g.append(s('path', { d: `M${x} ${y} l${dx} ${dy} l${-dx} ${dy} l${-dx} ${-dy}z`, fill: 'var(--accent-2)', stroke: 'var(--ink)', 'stroke-width': 0.8 }));
      g.append(s('path', { d: `M${x - dx} ${y + dy} l${dx} ${dy} v${sz} l${-dx} ${-dy}z`, fill: 'var(--accent)', stroke: 'var(--ink)', 'stroke-width': 0.8 }));
      g.append(s('path', { d: `M${x} ${y + 2 * dy} l${dx} ${-dy} v${sz} l${-dx} ${dy}z`, fill: 'color-mix(in srgb, var(--accent) 70%, #000)', stroke: 'var(--ink)', 'stroke-width': 0.8 }));
    }
    function draw() {
      svg.innerHTML = ''; const c = Math.min(22, 200 / n);
      const g1 = s('g'); svg.append(g1);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g1.append(s('rect', { x: 20 + j * c, y: 30 + i * c, width: c - 1.5, height: c - 1.5, rx: 2, fill: 'var(--number)', opacity: 0.85, style: `animation:popIn .3s ${(i + j) * 0.03}s both` }));
      svg.append(s('text', { x: 20 + (n * c) / 2, y: 20, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--ink)', text: `${n} × ${n} = ${n * n}` }));
      const g2 = s('g'); svg.append(g2); const sz = Math.min(26, 120 / n), ox = 430, oy = 30;
      for (let z = 0; z < n; z++) for (let yy = n - 1; yy >= 0; yy--) for (let x = n - 1; x >= 0; x--) { const px = ox + (x - yy) * sz * 0.866, py = oy + (x + yy) * sz * 0.5 + (n - 1 - z) * sz; cubeAt(g2, px, py, sz); }
      svg.append(s('text', { x: ox, y: H - 6, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--ink)', text: `${n} × ${n} × ${n} = ${n ** 3}` }));
      f.out.innerHTML = `${n}² = ${n * n} ⇔ √${n * n} = ${n} &nbsp;&nbsp;|&nbsp;&nbsp; ${n}³ = ${n ** 3} ⇔ ∛${n ** 3} = ${n}`;
    }
    f.ctrls.append(VZ.range('n =', 1, 6, n, 1, (v) => { n = v; draw(); SFX.play('tick'); }));
    draw();
  };
  // estimating square roots
  APP.viz.sqrtLine = function (el) {
    const f = VZ.frame(el, 'Ước lượng căn bậc hai', { icon: 'target' });
    let N0 = 79; const st = h('div'); f.stage.append(st);
    function draw() {
      const a = Math.floor(Math.sqrt(N0)), b = a + 1, lo = a * a, hi = b * b; const exact = a * a === N0;
      st.innerHTML = FIG.numberLine(lo, hi, { w: 600, step: 1, major: hi - lo, marks: [{ v: N0, label: String(N0) }] }).replace('</svg>', `<text x="26" y="20" font-size="13" fill="var(--number)" font-weight="700">${a}² = ${lo}</text><text x="574" y="20" font-size="13" text-anchor="end" fill="var(--number)" font-weight="700">${b}² = ${hi}</text></svg>`);
      const near = N0 - lo <= hi - N0 ? a : b;
      f.out.innerHTML = exact ? `${N0} là số chính phương: √${N0} = ${a}` : `${lo} < ${N0} < ${hi} ⇒ ${a} < √${N0} < ${b}. Số nguyên gần nhất: <b>${near}</b> (√${N0} ≈ ${Math.sqrt(N0).toFixed(2)})`;
    }
    f.ctrls.append(VZ.range('N =', 2, 400, N0, 1, (v) => { N0 = v; draw(); }));
    draw();
  };

  /* ---------- explore widgets ---------- */
  APP.viz.heroDepth = function (el) {
    const marks = [[8849, 'Everest  +8849 m'], [0, 'Sea level  0 m'], [-430, 'Dead Sea shore  −430 m'], [-3800, 'Titanic wreck  −3800 m'], [-10935, 'Challenger Deep  −10 935 m']];
    const bubbles = Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 3, v: 0.02 + Math.random() * 0.05 }));
    VZ.canvasLoop(el, (c, w, hh, t) => {
      const top = 9500, bot = -11500, Y = (v) => ((top - v) / (top - bot)) * hh, sea = Y(0);
      let g = c.createLinearGradient(0, 0, 0, sea); g.addColorStop(0, '#0b1a3a'); g.addColorStop(1, '#2b5aa8'); c.fillStyle = g; c.fillRect(0, 0, w, sea);
      g = c.createLinearGradient(0, sea, 0, hh); g.addColorStop(0, '#0e6e8c'); g.addColorStop(1, '#020812'); c.fillStyle = g; c.fillRect(0, sea, w, hh - sea);
      c.fillStyle = '#e9eef7'; c.beginPath(); c.moveTo(w * 0.52, sea); c.lineTo(w * 0.66, Y(4000)); c.lineTo(w * 0.72, Y(6200)); c.lineTo(w * 0.78, Y(8849)); c.lineTo(w * 0.86, Y(5200)); c.lineTo(w * 0.98, sea); c.closePath(); c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1;
      c.fillStyle = '#06111f'; c.beginPath(); c.moveTo(w * 0.5, hh); c.lineTo(w * 0.62, Y(-6000)); c.lineTo(w * 0.7, Y(-10935)); c.lineTo(w * 0.76, Y(-7000)); c.lineTo(w * 0.9, Y(-4000)); c.lineTo(w, Y(-3000)); c.lineTo(w, hh); c.fill();
      for (let i = 0; i < 3; i++) { const x = ((t * 8 + i * 200) % (w + 200)) - 100; c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x, sea * (0.2 + i * 0.12), 60, 14, 0, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.beginPath(); for (let x = 0; x < w; x += 6) c.lineTo(x, sea + Math.sin(x / 30 + t * 2) * 2); c.stroke();
      bubbles.forEach((b) => { b.y -= b.v * 0.01; if (b.y < 0) b.y = 1; const y = sea + b.y * (hh - sea); c.fillStyle = 'rgba(180,230,255,.35)'; c.beginPath(); c.arc(b.x * w * 0.5 + Math.sin(t + b.x * 9) * 4, y, b.r, 0, 7); c.fill(); });
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(36, 8); c.lineTo(36, hh - 8); c.stroke();
      c.font = '600 12px "JetBrains Mono", monospace'; c.textAlign = 'left';
      marks.forEach(([v, l], i) => { const y = Y(v); c.fillStyle = v === 0 ? '#ffd25a' : '#fff'; c.fillRect(30, y - 1, 12, 2); const pulse = 0.6 + 0.4 * Math.sin(t * 2 + i); c.globalAlpha = pulse; c.beginPath(); c.arc(36, y, 4, 0, 7); c.fill(); c.globalAlpha = 1; c.fillText(l, 50, y + 4); });
    });
  };
  APP.viz.thermo = function (el) {
    const f = VZ.frame(el, 'Nhiệt kế: chênh lệch nhiệt độ', { icon: 'chart' });
    let A = -12, B = 7; const W = 420, H = 260; const svg = VZ.svg(W, H); svg.style.maxWidth = '440px'; f.stage.append(svg);
    const Y = (v) => 230 - ((v + 40) / 90) * 200;
    function th(x, v, name, col) {
      const g = s('g'); g.append(s('rect', { x: x - 10, y: 20, width: 20, height: 215, rx: 10, fill: 'var(--surface)', stroke: 'var(--ink-2)', 'stroke-width': 2 }), s('circle', { cx: x, cy: 240, r: 15, fill: col }), s('rect', { x: x - 5, y: Y(v), width: 10, height: 240 - Y(v), fill: col, rx: 5 }));
      g.append(s('text', { x, y: 14, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: col, text: name + ': ' + N(v) + '°C' })); return g;
    }
    function draw() {
      svg.innerHTML = '';
      for (let v = -40; v <= 50; v += 10) svg.append(s('line', { x1: 150, x2: 270, y1: Y(v), y2: Y(v), stroke: v === 0 ? 'var(--ink-2)' : 'var(--line)', 'stroke-dasharray': v === 0 ? '' : '3 4' }), s('text', { x: 210, y: Y(v) - 3, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-3)', text: N(v) }));
      svg.append(th(120, A, 'A', 'var(--number)'), th(300, B, 'B', 'var(--bad)'));
      svg.append(s('line', { x1: 210, x2: 210, y1: Y(A), y2: Y(B), stroke: 'var(--accent)', 'stroke-width': 4, 'marker-end': 'url(#tha)' }));
      svg.append(s('defs', {}, s('marker', { id: 'tha', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, s('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--accent)' }))));
      f.out.innerHTML = `Chênh lệch B − A = ${N(B)} − ${NB(A)} = ${N(B)} + ${N(-A)} = <b>${N(B - A)}°C</b>`;
    }
    f.ctrls.append(VZ.range('A', -40, 50, A, 1, (v) => { A = v; draw(); }, N), VZ.range('B', -40, 50, B, 1, (v) => { B = v; draw(); }, N));
    draw();
  };
  APP.viz.cicada = function (el) {
    const f = VZ.frame(el, 'Ve sầu chu kỳ & kẻ săn mồi', { icon: 'clock', scroll: true });
    let cy = 13, py = 4; const W = 720, H = 140; const svg = VZ.svg(W, H); svg.style.minWidth = '560px'; f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const X = (y) => 30 + (y / 100) * (W - 50);
      svg.append(s('line', { x1: 30, x2: W - 20, y1: 70, y2: 70, stroke: 'var(--ink-2)', 'stroke-width': 2 }));
      for (let y = 0; y <= 100; y += 10) svg.append(s('text', { x: X(y), y: 132, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)', text: y }));
      for (let y = py; y <= 100; y += py) svg.append(s('circle', { cx: X(y), cy: 92, r: 5, fill: 'var(--bad)', style: `animation:popIn .3s ${y * 0.01}s both` }));
      for (let y = cy; y <= 100; y += cy) { const both = y % py === 0; svg.append(s('circle', { cx: X(y), cy: 48, r: both ? 10 : 7, fill: both ? 'var(--accent)' : 'var(--stats)', style: `animation:popIn .3s ${y * 0.012}s both` })); if (both) svg.append(s('text', { x: X(y), y: 26, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: 'var(--accent)', text: 'năm ' + y })); }
      svg.append(s('text', { x: 30, y: 14, 'font-size': 12, fill: 'var(--stats)', 'font-weight': 700, text: `● ve sầu xuất hiện mỗi ${cy} năm` }), s('text', { x: 300, y: 14, 'font-size': 12, fill: 'var(--bad)', 'font-weight': 700, text: `● kẻ săn mồi bùng phát mỗi ${py} năm` }));
      const L = U.lcm(cy, py); f.out.innerHTML = `Gặp nhau mỗi LCM(${cy}, ${py}) = <b>${L}</b> năm ${L === cy * py ? '— hiếm gặp vì ' + cy + ' là số nguyên tố!' : '— gặp khá thường xuyên.'}`;
    }
    f.ctrls.append(h('span', {}, 'Ve sầu:'), VZ.seg([12, 13, 14, 15, 16, 17], cy, (v) => { cy = v; draw(); }), h('span', {}, 'Kẻ săn:'), VZ.seg([2, 3, 4, 5, 6], py, (v) => { py = v; draw(); }));
    draw();
  };
  APP.viz.gears = function (el) {
    const f = VZ.frame(el, 'Bánh răng & bội chung nhỏ nhất', { icon: 'atom' });
    let A = 12, B = 18; const W = 560, H = 270; const svg = VZ.svg(W, H); f.stage.append(svg);
    let ang = 0, raf = 0, teeth = 0, running = false;
    const gearPath = (n, r) => { let d = ''; const tw = (Math.PI * 2) / n; for (let i = 0; i < n; i++) { const a0 = i * tw; [[a0, r - 7], [a0 + tw * 0.15, r + 7], [a0 + tw * 0.5, r + 7], [a0 + tw * 0.65, r - 7]].forEach(([a, rr], k) => (d += (i === 0 && k === 0 ? 'M' : 'L') + (Math.cos(a) * rr).toFixed(1) + ' ' + (Math.sin(a) * rr).toFixed(1))); } return d + 'Z'; };
    let gA, gB, rA, rB, cntEl;
    function build() {
      svg.innerHTML = ''; rA = A * 4.2; rB = B * 4.2; const cxA = 150, cxB = cxA + rA + rB + 4;
      const mk = (n, r, cx, col) => { const g = s('g', { transform: `translate(${cx} 135)` }); const inner = s('g'); inner.append(s('path', { d: gearPath(n, r), fill: col, stroke: 'var(--ink)', 'stroke-width': 1.5 }), s('circle', { r: 8, fill: 'var(--surface)' }), s('circle', { cx: r - 14, cy: 0, r: 6, fill: 'var(--surface)', stroke: 'var(--ink)' })); g.append(inner); svg.append(g); return inner; };
      gA = mk(A, rA, cxA, 'var(--number)'); gB = mk(B, rB, cxB, 'var(--geometry)');
      svg.setAttribute('viewBox', `0 0 ${Math.max(W, cxB + rB + 20)} ${H}`);
      cntEl = s('text', { x: 10, y: 22, 'font-size': 14, 'font-weight': 700, fill: 'var(--ink)' }); svg.append(cntEl);
      ang = 0; teeth = 0; paint();
    }
    function paint() { gA.setAttribute('transform', `rotate(${(ang * 180) / Math.PI})`); gB.setAttribute('transform', `rotate(${(180 / B) + (-ang * A / B) * 180 / Math.PI + 180})`); cntEl.textContent = `Số răng đã ăn khớp: ${Math.floor(teeth)}`; }
    function loop() {
      if (!document.body.contains(svg)) return; const sp = (Math.PI * 2) / A / 30; ang += sp; teeth += 1 / 30;
      const L = U.lcm(A, B); if (Math.abs(teeth - L) < 1 / 60 || teeth >= L) { teeth = L; ang = (Math.PI * 2 * L) / A; paint(); running = false; SFX.play('correct'); f.out.innerHTML = `Sau <b>${L}</b> răng (LCM(${A}, ${B})), cả hai dấu chấm trở về vị trí ban đầu: bánh A quay ${L / A} vòng, bánh B quay ${L / B} vòng.`; return; }
      paint(); raf = requestAnimationFrame(loop);
    }
    function go() { cancelAnimationFrame(raf); build(); running = true; f.out.textContent = 'Đang quay…'; loop(); }
    f.ctrls.append(h('span', {}, 'Răng A'), VZ.seg([8, 10, 12, 15], A, (v) => { A = v; build(); }), h('span', {}, 'Răng B'), VZ.seg([12, 16, 18, 20], B, (v) => { B = v; build(); }), VZ.btn('▶ Quay', go, 'btn sm sc'));
    build(); f.out.textContent = 'Nhấn Quay để xem khi nào hai dấu chấm cùng trở về vị trí ban đầu.';
  };

  /* ---------- question helpers ---------- */
  const sgn = (x) => N(x);
  const nl = (lo, hi, o) => FIG.numberLine(lo, hi, o);

  APP.addUnit({
    n: 1, strand: 'number', title: 'Integers', vi: 'Số nguyên',
    blurb: 'Positive and negative whole numbers, together with zero, are called <b>integers</b>. In this unit you add, subtract, multiply and divide integers, find lowest common multiples and highest common factors, use tests for divisibility, and work with square roots and cube roots.',
    blurbVi: 'Số nguyên gồm các số nguyên dương, số nguyên âm và số 0. Chương này học cộng/trừ/nhân/chia số nguyên, bội chung nhỏ nhất (BCNN – LCM), ước chung lớn nhất (ƯCLN – HCF), dấu hiệu chia hết, căn bậc hai và căn bậc ba.',
    words: [['integer', 'số nguyên'], ['positive integer', 'số nguyên dương'], ['negative integer', 'số nguyên âm'], ['number line', 'trục số'], ['inverse', 'số đối / nghịch đảo'], ['inverse operation', 'phép toán ngược'], ['product', 'tích'], ['multiple', 'bội'], ['common multiple', 'bội chung'], ['lowest common multiple', 'bội chung nhỏ nhất (BCNN)'], ['factor', 'ước, thừa số'], ['common factor', 'ước chung'], ['highest common factor', 'ước chung lớn nhất (ƯCLN)'], ['divisible', 'chia hết'], ['tests for divisibility', 'dấu hiệu chia hết'], ['digit', 'chữ số'], ['square number', 'số chính phương'], ['square root', 'căn bậc hai'], ['cube number', 'số lập phương'], ['cube root', 'căn bậc ba'], ['index', 'số mũ'], ['consecutive', 'liên tiếp'], ['equivalent', 'tương đương'], ['remainder', 'số dư'], ['prime number', 'số nguyên tố']],
    chat: ['Vì sao trừ một số âm lại thành cộng?', 'Cách tìm LCM nhanh', 'Dấu hiệu chia hết cho 11'],
    sections: [
      {
        id: '1.1', t: 'Adding and subtracting integers', vi: 'Cộng và trừ số nguyên',
        goals: ['add and subtract with positive and negative integers.'],
        body: [
          ['p', 'Integers are positive and negative whole numbers, together with zero. You can show integers on a <b>number line</b>. Integers greater than zero are <b>positive integers</b>: 1, 2, 3, 4, … Integers less than zero are <b>negative integers</b>: −1, −2, −3, −4, …'],
          ['tip', 'The “…” (called an ellipsis) shows that the lists continue forever.'],
          ['viz', 'intLine'],
          ['rule', 'To <b>add</b> a positive integer, move to the <b>right</b>. To add a negative integer, move to the <b>left</b>.', 'Adding'],
          ['ex', { t: 'Worked example 1.1', q: 'Work out: &nbsp; a&nbsp; −4 + 6 &nbsp;&nbsp; b&nbsp; 8 + −3 &nbsp;&nbsp; c&nbsp; −3 + −5', steps: ['a: Start at −4. Move 6 to the right → <b>−4 + 6 = 2</b>', 'b: Start at 8. Move 3 to the left (because it is −3) → <b>8 + −3 = 5</b>', 'c: Start at −3. Move 5 to the left → <b>−3 + −5 = −8</b>'] }],
          ['p', '<b>Subtraction is the inverse operation of addition.</b> The inverse of 3 is −3. The inverse of −5 is 5. To subtract an integer, you add the inverse.'],
          ['rule', 'a − b = a + (inverse of b) &nbsp;&nbsp;→&nbsp;&nbsp; 2 − 6 = 2 + −6 = −4 &nbsp;&nbsp;|&nbsp;&nbsp; 2 − −4 = 2 + 4 = 6', 'Subtracting'],
          ['viz', 'zeroPairs'],
          ['ex', { t: 'Worked example 1.2', q: 'Work out: &nbsp; a&nbsp; 2 − 6 &nbsp;&nbsp; b&nbsp; −4 − −3 &nbsp;&nbsp; c&nbsp; 2 − −4', steps: ['a: Add the inverse of 6, which is −6: 2 − 6 = 2 + −6 = <b>−4</b>', 'b: Add the inverse of −3, which is 3: −4 − −3 = −4 + 3 = <b>−1</b>', 'c: 2 − −4 = 2 + 4 = <b>6</b>'] }],
          ['ex', { t: 'Worked example 1.3 — estimating', q: 'Estimate the answers by rounding: a −48 + −73 &nbsp; b 123 − 393 &nbsp; c 6.15 − −4.87', steps: ['a: Round to the nearest 10: −50 + −70 = <b>−120</b>', 'b: Round to the nearest hundred: 100 − 400 = <b>−300</b>', 'c: Round to the nearest whole number: 6 − −5 = 6 + 5 = <b>11</b>'] }],
          ['vi', ['Cộng số dương: đi sang phải; cộng số âm: đi sang trái trên trục số.', 'Trừ một số = cộng với số đối của nó: a − b = a + (−b). Vì vậy <b>trừ số âm = cộng số dương</b>: 5 − (−2) = 7.', 'Một cặp (+1) và (−1) có tổng bằng 0 (cặp số 0).', 'Ước lượng: làm tròn các số trước rồi tính.']],
        ],
        bank: [
          fill('Do these additions.', [1, -4, -8, 4], 'Use the number line: adding a negative integer means moving left.', { f: 'a −3 + 4 = [] &nbsp; b 3 + −7 = [] &nbsp; c −4 + −4 = [] &nbsp; d 9 + −5 = []' }),
          fill('Do these subtractions.', [-6, 8, -10, 2], 'Subtracting is the same as adding the inverse: 3 − −5 = 3 + 5.', { f: 'a −1 − 5 = [] &nbsp; b 3 − −5 = [] &nbsp; c −3 − 7 = [] &nbsp; d −4 − −6 = []' }),
          fill('Work out the missing integers.', [4, -2, -10, -6], '6 + ? = −4 → ? = −4 − 6 = −10.', { f: 'a 6 + [] = 10 &nbsp; b 6 + [] = 4 &nbsp; c 6 + [] = −4 &nbsp; d 6 + [] = 0' }),
          num('Two integers add up to −4. One of the integers is 5. Work out the other integer.', -9, '5 + ? = −4 → ? = −4 − 5 = −9.'),
          num('Estimate −3.14 + 8.26 by rounding each number to the nearest whole number.', 5, '−3 + 8 = 5.'),
          num('Estimate −67 + 29 by rounding each number to the nearest 10.', -40, '−70 + 30 = −40.'),
          num('Estimate 688 − −512 by rounding each number to the nearest hundred.', 1200, '700 − −500 = 700 + 500 = 1200.'),
          multi('Three integers are equally spaced on a number line. Two of the integers are −3 and 7. Which could be the third integer?', ['2', '17', '−13', '12', '−8'], [0, 1, 2], 'The gap between −3 and 7 is 10. The third integer could be in the middle (2), or 10 beyond either end (17 or −13).', { d: 3 }),
          num('In an addition pyramid each brick is the sum of the two bricks below it. The bottom row is 3, −5, 1. What is the top brick?', -6, '3 + −5 = −2 and −5 + 1 = −4. Top: −2 + −4 = −6.', { d: 2 }),
          tf('−3 + 4 + −5 has the same value as −5 + 4 + −3.', true, 'Both equal −4. You can add integers in any order.'),
          gen(() => { const a = RNZ(-15, 15), b = RNZ(-15, 15); return num(`Work out ${N(a)} + ${N(b)}`, a + b, `Start at ${N(a)} and move ${Math.abs(b)} to the ${b > 0 ? 'right' : 'left'}: ${N(a + b)}.`, { fig: Math.abs(a) <= 15 && Math.abs(a + b) <= 20 ? nl(Math.min(a, a + b, 0) - 2, Math.max(a, a + b, 0) + 2, { arrows: [[a, a + b]], marks: [{ v: a, label: 'start' }], step: 1, major: Math.max(1, Math.round((Math.max(a, a + b, 0) - Math.min(a, a + b, 0)) / 10)) }) : '' }); }),
          gen(() => { const a = RNZ(-15, 15), b = RNZ(-15, 15); return num(`Work out ${N(a)} − ${N(b)}`, a - b, `Add the inverse: ${N(a)} − ${N(b)} = ${N(a)} + ${N(-b)} = ${N(a - b)}.`); }),
          gen(() => { const a = RNZ(-12, 12), c = RNZ(-15, 15); return num(`Find the missing integer: ${N(a)} + ☐ = ${N(c)}`, c - a, `☐ = ${N(c)} − ${N(a)} = ${N(c - a)}.`); }),
          gen(() => { const a = RNZ(-12, 12), c = RNZ(-15, 15); return num(`Find the missing integer: ${N(a)} − ☐ = ${N(c)}`, a - c, `☐ = ${N(a)} − ${N(c)} = ${N(a - c)}.`); }),
          gen(() => { const t = R(-15, -2), r = R(5, 18); return num(`At 6 a.m. the temperature in Ulaanbaatar was ${N(t)} °C. By noon it had risen by ${r} °C. What was the temperature at noon?`, t + r, `${N(t)} + ${r} = ${N(t + r)} °C.`, { unit: '°C', app: true }); }, { app: true }),
          gen(() => { const c = pick([['Moscow', R(-18, -3)], ['Oslo', R(-12, -1)], ['Montreal', R(-20, -5)]]), v = R(18, 33); return num(`One January day it was ${N(c[1])} °C in ${c[0]} and ${v} °C in Hanoi. How many degrees warmer was Hanoi?`, v - c[1], `${v} − ${NB(c[1])} = ${v} + ${-c[1]} = ${v - c[1]} °C.`, { unit: '°C', app: true }); }, { app: true }),
          gen(() => { const d = R(20, 60), up = R(5, 18); return num(`A diver is ${d} m below sea level (−${d} m). She swims up ${up} m. What is her new position?`, -d + up, `−${d} + ${up} = ${N(-d + up)} m.`, { unit: 'm', app: true }); }, { app: true }),
          gen(() => { const xs = shuffle([RNZ(-9, -1), RNZ(-9, -1), 0, R(1, 9), R(1, 9), RNZ(-15, 15)]).filter((v, i, a) => a.indexOf(v) === i); return order('Put these integers in order, from smallest to largest.', xs.slice().sort((a, b) => a - b).map((k) => N(k)), 'Negative integers are to the left of zero on the number line; −9 is smaller than −1.'); }),
          gen(() => { const a = R(10, 99) + R(1, 9) / 10, b = R(10, 99) + R(1, 9) / 10; const sa = -Math.round(a), sb = Math.round(b); return num(`Estimate −${a.toFixed(1)} + ${b.toFixed(1)} by rounding to the nearest whole number.`, sa + sb, `−${Math.round(a)} + ${sb} = ${N(sa + sb)}.`); }),
          gen(() => { const a = RNZ(-9, 9), b = RNZ(-9, 9), c = RNZ(-9, 9); return num(`Work out ${N(a)} + ${N(b)} − ${N(c)}`, a + b - c, `${N(a)} + ${N(b)} = ${N(a + b)}; then ${N(a + b)} − ${N(c)} = ${N(a + b - c)}.`, { d: 2 }); }),
          gen(() => { const st = pick([[true, 'Subtracting a negative integer makes a number bigger.'], [false, 'Adding a negative integer makes a number bigger.'], [true, 'The inverse of −7 is 7.'], [false, '−8 is greater than −3.'], [true, '−2 − −2 = 0']]); return tf(st[1], st[0], st[0] ? 'This statement is correct.' : 'This statement is false — test it on a number line.'); }),
        ],
      },
      {
        id: '1.2', t: 'Multiplying and dividing integers', vi: 'Nhân và chia số nguyên',
        goals: ['multiply and divide with positive and negative integers.'],
        body: [
          ['p', 'Multiplication is repeated addition: 3 × 4 = 3 + 3 + 3 + 3 = 12. In a similar way, −3 × 4 = −3 + −3 + −3 + −3 = −12.'],
          ['p', '5 × 2 = 2 + 2 + 2 + 2 + 2 = 10. In a similar way, 5 × −2 = −2 + −2 + −2 + −2 + −2 = −10. You say that “−12 is the <b>product</b> of −3 and 4”.'],
          ['viz', 'signLadder'],
          ['rule', 'negative × positive = <b>negative</b> &nbsp;&nbsp;|&nbsp;&nbsp; positive × negative = <b>negative</b> &nbsp;&nbsp;|&nbsp;&nbsp; negative ÷ positive = <b>negative</b>', 'Signs'],
          ['ex', { t: 'Worked example 1.4', q: 'Work out: a 6 × −4 &nbsp;&nbsp; b −9 × 3', steps: ['a: 6 × 4 = 24, so 6 × −4 = <b>−24</b>', 'b: 9 × 3 = 27, so −9 × 3 = <b>−27</b>'] }],
          ['p', 'Division is the inverse operation of multiplication. 3 × 4 = 12 so 12 ÷ 4 = 3. In the same way, −3 × 4 = −12 so −12 ÷ 4 = −3.'],
          ['ex', { t: 'Worked example 1.5', q: 'Work out: a −20 ÷ 5 &nbsp;&nbsp; b −20 ÷ 10 &nbsp;&nbsp; c 5 × (1 + −4)', steps: ['a: 20 ÷ 5 = 4, so −20 ÷ 5 = <b>−4</b>', 'b: 20 ÷ 10 = 2, so −20 ÷ 10 = <b>−2</b>', 'c: First do the addition in the brackets: 1 + −4 = −3', 'Then multiply: 5 × −3 = <b>−15</b>'] }],
          ['vi', ['Tích (product) của một số âm và một số dương là số âm: −3 × 4 = −12.', 'Thương của số âm chia cho số dương là số âm: −20 ÷ 5 = −4.', 'Luôn làm phép tính trong ngoặc trước.']],
        ],
        bank: [
          fill('Work out:', [-6, -35, -40, -36], 'positive × negative = negative.', { f: 'a 3 × −2 = [] &nbsp; b 5 × −7 = [] &nbsp; c 10 × −4 = [] &nbsp; d 6 × −6 = []' }),
          fill('Work out:', [-5, -5, -6, -3], 'negative ÷ positive = negative.', { f: 'a −15 ÷ 3 = [] &nbsp; b −30 ÷ 6 = [] &nbsp; c −24 ÷ 4 = [] &nbsp; d −27 ÷ 9 = []' }),
          fill('Work out the missing numbers.', [-2, -6, 7, 5], '9 × ? = −18 → ? = −18 ÷ 9 = −2.', { f: 'a 9 × [] = −18 &nbsp; b 5 × [] = −30 &nbsp; c −2 × [] = −14 &nbsp; d −8 × [] = −40' }),
          fill('Work out the missing numbers.', [4, 2, -16, -20], '−12 ÷ ? = −3 → ? = 4.', { f: 'a −12 ÷ [] = −3 &nbsp; b −18 ÷ [] = −9 &nbsp; c [] ÷ 4 = −4 &nbsp; d [] ÷ 10 = −2' }),
          multi('The product of two integers is −10. Which pairs are possible?', ['2 and −5', '−2 and 5', '1 and −10', '−1 and 10', '2 and 5', '−20 and 2'], [0, 1, 2, 3], 'The factors of 10 are 1, 2, 5, 10. One number must be negative and the other positive.', { d: 2 }),
          fill('Do the calculation in the brackets first.', [-12, -24, -30, -20], '3 × (−6 + 2) = 3 × −4 = −12.', { f: 'a 3 × (−6 + 2) = [] &nbsp; b −4 × (−1 + 7) = [] &nbsp; c 5 × (−2 − 4) = [] &nbsp; d −2 × (3 − −7) = []' }),
          num('Estimate −53 × 39 by rounding each number to the nearest 10.', -2000, '−50 × 40 = −2000.'),
          num('Estimate 9.8 × −5.35 by rounding to the nearest whole number.', -50, '10 × −5 = −50.'),
          mcq('In the diagram, the integer in a square is the product of the integers in the circles next to it. The circles are −3 and 4. What goes in the square?', ['−12', '12', '1', '−7'], 0, '−3 × 4 = −12.'),
          gen(() => { const a = RNZ(-12, -2), b = R(2, 12); return pick([num(`Work out ${N(a)} × ${b}`, a * b, `${-a} × ${b} = ${-a * b}, so ${N(a)} × ${b} = ${N(a * b)}.`), num(`Work out ${b} × ${N(a)}`, a * b, `${b} × ${-a} = ${-a * b}, so the answer is ${N(a * b)}.`)]); }),
          gen(() => { const q = RNZ(-12, -2), b = R(2, 12); return num(`Work out ${N(q * b)} ÷ ${b}`, q, `${-q * b} ÷ ${b} = ${-q}, so ${N(q * b)} ÷ ${b} = ${N(q)}.`); }),
          gen(() => { const a = R(2, 9), x = RNZ(-9, -1); return num(`Find the missing number: ${a} × ☐ = ${N(a * x)}`, x, `☐ = ${N(a * x)} ÷ ${a} = ${N(x)}.`); }),
          gen(() => { const a = R(2, 6), b = RNZ(-9, 9), c = RNZ(-9, 9); return num(`Work out ${a} × (${N(b)} + ${N(c)})`, a * (b + c), `Brackets first: ${N(b)} + ${N(c)} = ${N(b + c)}. Then ${a} × ${NB(b + c)} = ${N(a * (b + c))}.`, { d: 2 }); }),
          gen(() => { const r = R(5, 20), t = R(3, 9); return num(`A submarine dives ${r} m every minute. What is the change in its depth after ${t} minutes? (Use a negative number for going down.)`, -r * t, `${t} × −${r} = ${-r * t} m.`, { unit: 'm', app: true }); }, { app: true }),
          gen(() => { const d = R(2, 5), hrs = R(3, 8), st = R(-4, 6); return num(`At 8 p.m. the temperature is ${N(st)} °C. It falls by ${d} °C every hour for ${hrs} hours. What is the temperature at the end?`, st - d * hrs, `Change = ${hrs} × −${d} = ${-d * hrs}. ${N(st)} + ${NB(-d * hrs)} = ${N(st - d * hrs)} °C.`, { unit: '°C', app: true, d: 2 }); }, { app: true }),
          gen(() => { const debt = R(3, 9) * 6, k = pick([2, 3, 6]); return num(`Mai has a bank balance of −$${debt}. She shares this debt equally between ${k} months of payments. What is the balance change for each month, as an integer?`, -debt / k, `−${debt} ÷ ${k} = ${-debt / k}.`, { app: true }); }, { app: true }),
          gen(() => { const a = R(2, 9), b = R(2, 9); if (a === b || a * b === a + b) return null; const opts = [N(-a * b), N(a * b), N(-(a + b)), N(a - b)]; return mcq(`Which is the value of −${a} × ${b}?`, opts, 0, `${a} × ${b} = ${a * b} and a negative × positive is negative.`); }),
          gen(() => { const st = pick([[true, 'A negative integer divided by a positive integer is negative.'], [false, '−4 × 5 = 20'], [true, '−36 ÷ 9 = −4'], [false, 'The product of −6 and 3 is −9.']]); return tf(st[1], st[0], st[0] ? 'Correct.' : 'False — check the sign and the size of the answer.'); }),
        ],
      },
      {
        id: '1.3', t: 'Lowest common multiples', vi: 'Bội chung nhỏ nhất',
        goals: ['find out about lowest common multiples.'],
        body: [
          ['p', 'The <b>multiples</b> of 4 are 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, … (4 × 1, 4 × 2, 4 × 3, and so on). The multiples of 6 are 6, 12, 18, 24, 30, 36, 42, …'],
          ['p', 'The <b>common multiples</b> of 4 and 6 are 12, 24, 36, … The <b>lowest common multiple (LCM)</b> of 4 and 6 is 12. It is the smallest number that is a multiple of both 4 and 6.'],
          ['viz', 'multGrid'],
          ['ex', { t: 'Worked example 1.6', q: 'Find the lowest common multiple of 6 and 10.', steps: ['List the multiples of 6: 6, 12, 18, 24, 30, 36, …', 'The last digit of a multiple of 10 is 0, so 30 is a multiple of 10.', 'The LCM of 6 and 10 is <b>30</b>.'] }],
          ['tip', 'A × B is always a common multiple of A and B, but it is not always the <i>lowest</i> one. For 4 and 6: 4 × 6 = 24, but the LCM is 12.'],
          ['vi', ['Bội (multiple) của 4: 4, 8, 12, 16, … (lấy 4 nhân với 1, 2, 3, …).', 'Bội chung nhỏ nhất (LCM) = số nhỏ nhất (khác 0) chia hết cho cả hai số.', 'Cách tìm: liệt kê bội của số lớn hơn cho đến khi gặp số chia hết cho số kia.', 'Ứng dụng: hai sự kiện lặp lại theo chu kỳ sẽ trùng nhau sau LCM đơn vị thời gian.']],
        ],
        bank: [
          list('Write the first five multiples of 7.', [7, 14, 21, 28, 35], '7 × 1, 7 × 2, 7 × 3, 7 × 4, 7 × 5.'),
          list('Write the first five multiples of 12.', [12, 24, 36, 48, 60], '12 × 1 … 12 × 5.'),
          list('Find the common multiples of 3 and 5 that are less than 40.', [15, 30], 'Multiples of 5: 5, 10, 15, 20, 25, 30, 35. The ones divisible by 3 are 15 and 30.'),
          list('Find the common multiples of 4 and 3 that are less than 50.', [12, 24, 36, 48], 'They are the multiples of 12.'),
          num('Find the LCM of 8 and 12.', 24, 'Multiples of 12: 12, 24 … 24 is a multiple of 8.'),
          num('Find the LCM of 10 and 15.', 30, 'Multiples of 15: 15, 30 … 30 is a multiple of 10.'),
          num('Find the LCM of 7 and 8.', 56, '7 and 8 have no common factor except 1, so the LCM is 7 × 8 = 56.'),
          num('Find the LCM of 3, 4 and 6.', 12, '12 is the smallest number in all three lists of multiples.'),
          num('Find the LCM of 18, 9 and 4.', 36, 'Multiples of 18: 18, 36 … 36 is divisible by 9 and 4.', { d: 2 }),
          tf('If A and B are two whole numbers, then A × B is always the <i>lowest</i> common multiple of A and B.', false, 'For A = 4 and B = 6, A × B = 24 but the LCM is 12.'),
          multi('21 is the LCM of two numbers. Which pairs could the numbers be?', ['3 and 7', '7 and 21', '6 and 7', '3 and 14', '1 and 21'], [0, 1, 4], 'The LCM of 3 and 7 is 21; of 7 and 21 is 21; of 1 and 21 is 21. 6 and 7 give 42.', { d: 2 }),
          gen(() => { const a = R(2, 12), b = R(2, 15); if (a === b) return null; const L = U.lcm(a, b); return num(`Find the lowest common multiple of ${a} and ${b}.`, L, `Multiples of ${Math.max(a, b)}: ${Array.from({ length: L / Math.max(a, b) }, (_, i) => Math.max(a, b) * (i + 1)).join(', ')}. The first one divisible by ${Math.min(a, b)} is ${L}.`); }),
          gen(() => { const a = pick([4, 6, 8, 10, 12, 15, 20]), b = pick([6, 9, 12, 14, 18, 25, 30]); if (a === b) return null; const L = U.lcm(a, b); const hh = 8 + Math.floor(L / 60), mm = L % 60; return txt(`Bus A leaves the station every ${a} minutes. Bus B leaves every ${b} minutes. Both leave at 08:00. At what time do they next leave together? (write hh:mm)`, [`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, `${hh}:${String(mm).padStart(2, '0')}`], `LCM(${a}, ${b}) = ${L} minutes after 08:00.`, { app: true }); }, { app: true }),
          gen(() => { const a = pick([6, 8, 10, 12]), b = pick([4, 6, 8, 9, 15]); if (a === b) return null; const L = U.lcm(a, b); return num(`Bread rolls come in packs of ${a}. Sausages come in packs of ${b}. What is the smallest number of each you can buy so that there is exactly one sausage for every roll?`, L, `You need a common multiple of ${a} and ${b}: LCM = ${L}.`, { app: true }); }, { app: true }),
          gen(() => { const a = R(3, 9), b = R(3, 9); if (a === b) return null; const L = U.lcm(a, b); return num(`Two lights flash together. One flashes every ${a} seconds and the other every ${b} seconds. After how many seconds do they next flash together?`, L, `LCM(${a}, ${b}) = ${L}.`, { app: true }); }, { app: true }),
          gen(() => { const a = R(2, 6), b = R(3, 8), c = R(4, 10); const L = U.lcm(U.lcm(a, b), c); return num(`Find the LCM of ${a}, ${b} and ${c}.`, L, `${L} is the smallest number that is a multiple of all three.`, { d: 2 }); }),
          gen(() => { const a = R(3, 9), m = R(2, 6); const opts = [a * m, a * m + 1, a * m + 2, a * m - 1]; return mcq(`Which of these is a multiple of ${a}?`, opts.map(String), 0, `${a * m} = ${a} × ${m}.`); }),
        ],
      },
      {
        id: '1.4', t: 'Highest common factors', vi: 'Ước chung lớn nhất',
        goals: ['find out about highest common factors.'],
        body: [
          ['p', 'The <b>factors</b> of 18 are 1, 2, 3, 6, 9 and 18 (18 = 1 × 18 or 2 × 9 or 3 × 6). The factors of 27 are 1, 3, 9 and 27.'],
          ['p', 'The <b>common factors</b> of 18 and 27 are 1, 3 and 9. The <b>highest common factor (HCF)</b> of 18 and 27 is 9.'],
          ['viz', 'factorVenn'],
          ['ex', { t: 'Worked example 1.7', q: 'Find the highest common factor of 28 and 42.', steps: ['Pairs with a product of 28: 1 × 28, 2 × 14, 4 × 7. Factors of 28: 1, 2, 4, 7, 14, 28.', 'Pairs with a product of 42: 1 × 42, 2 × 21, 3 × 14, 6 × 7. Factors of 42: 1, 2, 3, 6, 7, 14, 21, 42.', 'Common factors: 1, 2, 7, 14.', 'The HCF of 28 and 42 is <b>14</b>.'] }],
          ['p', 'You can use a highest common factor to simplify a fraction as much as possible.'],
          ['ex', { t: 'Worked example 1.8', q: `a Find the HCF of 16 and 40. &nbsp; b Use your answer to write ${F(16, 40)} as simply as possible.`, steps: ['a: The factors of 16 are 1, 2, 4, 8 and 16. The largest that is a factor of 40 is 8 (8 × 5 = 40). HCF = 8.', `b: Divide 16 and 40 by 8: ${F(16, 40)} = <b>${F(2, 5)}</b>`] }],
          ['vi', ['Ước (factor) của 18: 1, 2, 3, 6, 9, 18 – tìm theo từng cặp nhân.', 'ƯCLN (HCF) = số lớn nhất là ước của cả hai số.', 'Rút gọn phân số tối giản: chia cả tử và mẫu cho ƯCLN.', 'Tính chất hay: ƯCLN × BCNN = tích của hai số.']],
        ],
        bank: [
          list('Find the factors of 24.', [1, 2, 3, 4, 6, 8, 12, 24], '1 × 24, 2 × 12, 3 × 8, 4 × 6.'),
          list('Find the factors of 36.', [1, 2, 3, 4, 6, 9, 12, 18, 36], '1 × 36, 2 × 18, 3 × 12, 4 × 9, 6 × 6.'),
          list('Find the factors of 45.', [1, 3, 5, 9, 15, 45], '1 × 45, 3 × 15, 5 × 9.'),
          list('Find the common factors of 18 and 48.', [1, 2, 3, 6], 'Factors of 18: 1, 2, 3, 6, 9, 18. Those that divide 48: 1, 2, 3, 6.'),
          fill('Find the highest common factor of:', [4, 6, 12], '12 = 4 × 3 and 28 = 4 × 7.', { f: 'a 12 and 28 → [] &nbsp; b 12 and 30 → [] &nbsp; c 12 and 36 → []' }),
          fill('Find the highest common factor of:', [6, 1, 2, 7], '19 and 25 have no common factor other than 1.', { f: 'a 18 and 24 → [] &nbsp; b 19 and 25 → [] &nbsp; c 20 and 26 → [] &nbsp; d 21 and 28 → []' }),
          fill('Find the highest common factor of:', [10, 20, 30], '60 = 30 × 2 and 90 = 30 × 3.', { f: 'a 60 and 70 → [] &nbsp; b 60 and 80 → [] &nbsp; c 60 and 90 → []' }),
          frac(`Find the HCF of 35 and 56, then simplify ${F(35, 56)} as much as possible.`, [5, 8], 'HCF(35, 56) = 7. 35 ÷ 7 = 5 and 56 ÷ 7 = 8.', { simplest: true }),
          num('Find the highest common factor of 54, 72 and 90.', 18, '54 = 18 × 3, 72 = 18 × 4, 90 = 18 × 5.', { d: 2 }),
          tf(`The fraction ${F(25, 36)} cannot be simplified because the HCF of 25 and 36 is 1.`, true, 'Factors of 25: 1, 5, 25. Factors of 36 do not include 5, so the HCF is 1.'),
          mcq('The HCF of two numbers is 3. The LCM of the two numbers is 45. Which pair could the two numbers be?', ['9 and 15', '5 and 9', '15 and 45', '3 and 15'], 0, 'Each number is a multiple of 3 and a factor of 45. 9 and 15: HCF = 3 and LCM = 45 ✓. (The pair 3 and 45 also works.)', { d: 3 }),
          tf('For 8 and 12: HCF × LCM = 8 × 12.', true, 'HCF = 4, LCM = 24 and 4 × 24 = 96 = 8 × 12.', { d: 2 }),
          gen(() => { const g = pick([2, 3, 4, 5, 6, 7, 8, 9, 12]), p = R(1, 7), q = R(2, 9); if (U.gcd(p, q) !== 1 || p === q) return null; return num(`Find the highest common factor of ${g * p} and ${g * q}.`, g, `Factors of ${g * p}: ${U.factors(g * p).join(', ')}. Factors of ${g * q}: ${U.factors(g * q).join(', ')}. HCF = ${g}.`); }),
          gen(() => { const g = pick([2, 3, 4, 5, 6, 7, 8, 9]), p = R(1, 8), q = R(2, 11); if (U.gcd(p, q) !== 1 || p >= q) return null; return frac(`Simplify ${F(g * p, g * q)} as much as possible.`, [p, q], `HCF(${g * p}, ${g * q}) = ${g}. Divide both by ${g}: ${F(p, q)}.`, { simplest: true }); }),
          gen(() => { const g = pick([6, 8, 10, 12, 15]), a = g * R(2, 4), b = g * R(5, 7); return num(`Two ribbons are ${a} cm and ${b} cm long. They are cut into pieces of equal length with nothing left over. What is the longest possible length of each piece?`, g, `HCF(${a}, ${b}) = ${g} cm.`, { unit: 'cm', app: true }); }, { app: true }),
          gen(() => { const g = pick([4, 6, 8, 12]), a = g * R(3, 6), b = g * R(7, 9); return num(`A teacher has ${a} pencils and ${b} erasers. She makes identical packs using all of them. What is the greatest number of packs she can make?`, g, `HCF(${a}, ${b}) = ${g} packs.`, { app: true }); }, { app: true }),
          gen(() => { const n = pick([20, 28, 30, 32, 40, 42, 48, 50]); return list(`Find all the factors of ${n}.`, U.factors(n), `Factor pairs: ${U.factors(n).filter((x) => x * x <= n).map((x) => x + ' × ' + n / x).join(', ')}.`); }),
        ],
      },
      {
        id: '1.5', t: 'Tests for divisibility', vi: 'Dấu hiệu chia hết',
        goals: ['learn tests of divisibility to find factors of large numbers.'],
        body: [
          ['p', '2, 3 and 5 are all factors of 30. You say that “30 is <b>divisible</b> by 2” because 30 ÷ 2 does not have a remainder. 30 is not divisible by 4 because 30 ÷ 4 = 7 with remainder 2 (7 r 2).'],
          ['table', ['Divisible by', 'Test', 'Check 87654'], [['2', 'last digit is 0, 2, 4, 6 or 8', '✓ last digit 4'], ['3', 'sum of digits is a multiple of 3', '✓ 8+7+6+5+4 = 30'], ['4', 'last two digits form a number divisible by 4', '✗ 54 ÷ 4 = 13 r 2'], ['5', 'last digit is 0 or 5', '✗'], ['6', 'divisible by 2 and by 3', '✓'], ['7', 'remove the last digit, subtract twice it; is the result divisible by 7?', '✓ 8765 − 8 = 8757 = 7 × 1251'], ['8', 'last three digits form a number divisible by 8', '✗ 654 ÷ 8 = 81 r 6'], ['9', 'sum of digits is divisible by 9', '✗ 30'], ['10', 'last digit is 0', '✗'], ['11', 'difference between the sum of the odd-place digits and the even-place digits is 0 or a multiple of 11', '✗ 18 − 12 = 6']]],
          ['viz', 'divTester'],
          ['ex', { t: 'Worked example 1.9', q: 'The number *7258 has one digit missing. a Find the missing digit when i the number is divisible by 6, ii the number is divisible by 11. b Could *7258 be divisible by 66?', steps: ['a i: The last digit is 8, so it is divisible by 2. Digit sum = * + 22. This is a multiple of 3 when * = 2, 5 or 8.', 'a ii: Odd-place digits (from the right): 8 + 2 + * = 10 + *. Even-place digits: 5 + 7 = 12. The difference is 0 when * = 2.', 'b: 66 = 6 × 11. Only * = 2 works for both, so <b>27258</b> is divisible by 66.'] }],
          ['vi', ['Chia hết cho 2: chữ số tận cùng chẵn; cho 5: tận cùng 0 hoặc 5; cho 10: tận cùng 0.', 'Chia hết cho 3 (hoặc 9): tổng các chữ số chia hết cho 3 (hoặc 9).', 'Chia hết cho 4: hai chữ số cuối chia hết cho 4; cho 8: ba chữ số cuối chia hết cho 8.', 'Chia hết cho 6: chia hết cho cả 2 và 3.', 'Chia hết cho 11: hiệu (tổng chữ số hàng lẻ − tổng chữ số hàng chẵn) là 0 hoặc bội của 11.', 'Chia hết cho 7: bỏ chữ số cuối, lấy phần còn lại trừ 2 lần chữ số đó.']],
        ],
        bank: [
          tf('28 572 is divisible by 9.', false, 'Digit sum = 2+8+5+7+2 = 24. 24 is a multiple of 3 but not of 9.'),
          tf('57 423 is divisible by 6.', false, '57 423 is odd, so it is not divisible by 2 (or 6), even though its digit sum 21 is a multiple of 3.'),
          list('The number 5742* is divisible by 6. Find all the possible values of the digit *.', [0, 6], 'The number must be even and the digit sum 18 + * must be a multiple of 3: * = 0 or 6.', { d: 2 }),
          mcq('Is 25 764 divisible by 8?', ['No, because 764 ÷ 8 = 95.5', 'Yes, because it is divisible by 2 and 4', 'Yes, because 64 ÷ 8 = 8', 'No, because the digit sum is 24'], 0, 'Test the last three digits: 764 ÷ 8 = 95 r 4.'),
          tf('924 is divisible by 11.', true, '9 − 2 + 4 = 11: (9 + 4) − 2 = 11, a multiple of 11.'),
          tf('161 084 is divisible by 11.', true, 'Odd places (from the right) 4 + 0 + 6 = 10, even places 8 + 1 + 1 = 10; the difference is 0.', { d: 2 }),
          tf('2583 is divisible by 7.', true, '258 − 2 × 3 = 252 and 252 = 7 × 36.', { d: 2 }),
          list('The number 96*32 has a digit missing. Find the possible values of * if the number is divisible by 3.', [1, 4, 7], 'Digit sum = 20 + *. This is a multiple of 3 when * = 1, 4 or 7.', { d: 2 }),
          num('The number 96*32 is divisible by 11. Find the missing digit.', 9, 'Odd places from the right: 2 + * + 9 = 11 + *; even places: 3 + 6 = 9. Difference = 2 + *, which is 11 when * = 9.', { d: 3 }),
          num('Find the smallest integer larger than 2521 that is divisible by 6.', 2526, '2522 and 2524 have digit sums 11 and 13. 2526 is even with digit sum 15.', { d: 2 }),
          num('Find the smallest integer larger than 2521 that is divisible by 11.', 2530, '2521 ÷ 11 = 229.2… The next multiple is 230 × 11 = 2530.', { d: 2 }),
          tf('A number is divisible by 8 when it is divisible by 2 and by 4.', false, '12 is divisible by 2 and by 4 but not by 8.', { d: 2 }),
          tf('A number is divisible by 10 when it is divisible by 2 and by 5.', true, '2 and 5 have no common factor other than 1, and 2 × 5 = 10.', { d: 2 }),
          gen(() => { const k = pick([2, 3, 4, 5, 6, 8, 9, 10, 11]); let n = R(1000, 99999); if (U.chance(0.5)) n = n - (n % k) || k * 1000; const ok = n % k === 0; return tf(`${n} is divisible by ${k}.`, ok, ok ? `Yes: ${n} ÷ ${k} = ${n / k}.` : `No: ${n} ÷ ${k} = ${Math.floor(n / k)} r ${n % k}.`); }),
          gen(() => { const n = R(50, 4999) * 2 * pick([1, 3, 5, 9]); const ks = [2, 3, 4, 5, 6, 9, 10]; return multi(`Which of these numbers are factors of ${n}?`, ks.map(String), ks.map((k, i) => (n % k === 0 ? i : -1)).filter((i) => i >= 0), `Use the tests: digit sum of ${n} is ${U.sum(String(n).split('').map(Number))}, last digit ${n % 10}, last two digits ${String(n % 100).padStart(2, '0')}.`); }),
          gen(() => { const pre = R(10, 99), post = R(10, 99); const base = String(pre) + '*' + String(post); const s0 = U.sum((String(pre) + String(post)).split('').map(Number)); const ans = []; for (let d = 0; d <= 9; d++) if ((s0 + d) % 3 === 0) ans.push(d); return list(`The number ${base} is divisible by 3. Find all possible values of the missing digit *.`, ans, `Digit sum = ${s0} + *. It must be a multiple of 3.`); }),
          gen(() => { const pre = R(1, 9) * 10 + R(0, 9), post = R(100, 999); const s0 = U.sum((String(pre) + String(post)).split('').map(Number)); let d = (9 - (s0 % 9)) % 9; return num(`The number ${pre}*${post} is divisible by 9. Find the missing digit * (0–9). If two digits work, give the smaller one.`, d, `Digit sum = ${s0} + * must be a multiple of 9, so * = ${d}${d === 0 ? ' (or 9)' : ''}.`); }),
          gen(() => { const items = shuffle([R(10, 300) * 3, R(10, 300) * 3, R(10, 300) * 3 + 1, R(10, 300) * 3 + 2, R(10, 300) * 3, R(10, 300) * 3 + 1]); return sort('Sort these numbers.', ['Divisible by 3', 'Not divisible by 3'], items.map((n) => [String(n), n % 3 === 0 ? 0 : 1]), 'Add the digits: if the sum is a multiple of 3, the number is divisible by 3.'); }),
        ],
      },
      {
        id: '1.6', t: 'Square roots and cube roots', vi: 'Căn bậc hai và căn bậc ba',
        goals: ['find out how square numbers and cube numbers are related to square roots and cube roots.'],
        body: [
          ['p', '1 × 1 = 1, 2 × 2 = 4, 3 × 3 = 9, 4 × 4 = 16, 5 × 5 = 25. The <b>square numbers</b> are 1, 4, 9, 16, 25, … You use an <b>index</b> of 2 to show square numbers: 1² = 1, 2² = 4, 3² = 9. You read 2² as “2 squared”.'],
          ['p', '4² = 16 is <b>equivalent</b> to √16 = 4, which is read as “4 is the square root of 16”. The symbol for square root is √.'],
          ['viz', 'squareCube'],
          ['p', '1 × 1 × 1 = 1, 2 × 2 × 2 = 8, 3 × 3 × 3 = 27. The <b>cube numbers</b> are 1, 8, 27, … You write 1³ = 1, 2³ = 8, 3³ = 27 and read 2³ as “2 cubed”. You say “2 is the cube root of 8”, written ∛8 = 2.'],
          ['ex', { t: 'Worked example 1.10', q: 'Work out √100 − √81.', steps: ['10² = 100 and 9² = 81, so √100 = 10 and √81 = 9.', '√100 − √81 = 10 − 9 = <b>1</b>'] }],
          ['ex', { t: 'Worked example 1.11', q: 'Work out √64 ÷ ∛64.', steps: ['8² = 64, so √64 = 8.', '4³ = 64, so ∛64 = 4.', '√64 ÷ ∛64 = 8 ÷ 4 = <b>2</b>'] }],
          ['p', 'You can estimate the square roots of integers that are not square numbers.'],
          ['viz', 'sqrtLine'],
          ['ex', { t: 'Worked example 1.12', q: 'a Show that 9 is the closest integer to √79. &nbsp; b Show that √215 is between 14 and 15.', steps: ['a: 9² = 81 and 8² = 64. 79 is between 64 and 81, so √79 is between 8 and 9.', '79 is much closer to 81 than to 64, so <b>9</b> is the closest integer to √79.', 'b: 14² = 196 and 15² = 225. 215 is between 196 and 225, so √215 is between <b>14 and 15</b>.'] }],
          ['vi', ['Số chính phương (square number) = n²: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, …', 'Căn bậc hai: √49 = 7 vì 7² = 49.', 'Số lập phương (cube number) = n³: 1, 8, 27, 64, 125, …; căn bậc ba: ∛125 = 5.', 'Ước lượng √N: tìm hai số chính phương liên tiếp kẹp N.']],
        ],
        bank: [
          fill('Copy and complete the following.', [9, 25, 64, 100, 225], '15² = 15 × 15 = 225.', { f: 'a 3² = [] &nbsp; b 5² = [] &nbsp; c 8² = [] &nbsp; d 10² = [] &nbsp; e 15² = []' }),
          fill('Find:', [6, 9, 11, 12], '11² = 121 so √121 = 11.', { f: 'a √36 = [] &nbsp; b √81 = [] &nbsp; c √121 = [] &nbsp; d √144 = []' }),
          fill('Copy and complete the following.', [1, 8, 27, 64, 125], '5³ = 5 × 5 × 5 = 125.', { f: 'a 1³ = [] &nbsp; b 2³ = [] &nbsp; c 3³ = [] &nbsp; d 4³ = [] &nbsp; e 5³ = []' }),
          fill('Work out the integer that is closest to:', [4, 8, 12], '√150: 12² = 144 and 13² = 169; 150 is closer to 144.', { f: 'a √15 → [] &nbsp; b √66 → [] &nbsp; c √150 → []' }),
          fill('Find two consecutive integers to complete this sentence:', [13, 14], '13² = 169 and 14² = 196.', { f: '√180 is between [] and []' }),
          fill('Find two consecutive integers to complete this sentence:', [4, 5], '4³ = 64 and 5³ = 125.', { f: '∛90 is between [] and []' }),
          fill('Complete the statements.', [324, 400, 529, 676], '√? = 18 means ? = 18² = 324.', { f: 'a √[] = 18 &nbsp; b √[] = 20 &nbsp; c √[] = 23 &nbsp; d √[] = 26' }),
          fill('Complete the statements.', [343, 729, 1000, 1728], '∛? = 7 means ? = 7³ = 343.', { f: 'a ∛[] = 7 &nbsp; b ∛[] = 9 &nbsp; c ∛[] = 10 &nbsp; d ∛[] = 12' }),
          num('Work out √100 − √81.', 1, '10 − 9 = 1.'),
          num('Work out √64 ÷ ∛64.', 2, '8 ÷ 4 = 2.'),
          tf('Every square number has an odd number of factors.', true, 'Factors come in pairs, except the square root, which pairs with itself. E.g. 36: 1, 2, 3, 4, 6, 9, 12, 18, 36.', { d: 2 }),
          num('The integer N is less than 100 and greater than 1. √N and ∛N are both integers. Find N.', 64, '√64 = 8 and ∛64 = 4.', { d: 3 }),
          fill('Copy and complete the following.', [3, 6, 10], '1³ + 2³ = 9 = 3², 1³ + 2³ + 3³ = 36 = 6², 1³ + 2³ + 3³ + 4³ = 100 = 10².', { f: '1³ = 1² &nbsp; 1³ + 2³ = []² &nbsp; 1³ + 2³ + 3³ = []² &nbsp; 1³ + 2³ + 3³ + 4³ = []²', d: 3 }),
          num('Add up the first four odd numbers and find the square root of the answer.', 4, '1 + 3 + 5 + 7 = 16 and √16 = 4.', { d: 2 }),
          gen(() => { const n = R(2, 15); return pick([num(`Work out ${n}²`, n * n, `${n} × ${n} = ${n * n}.`), num(`Work out √${n * n}`, n, `${n}² = ${n * n}.`)]); }),
          gen(() => { const n = R(1, 10); return pick([num(`Work out ${n}³`, n ** 3, `${n} × ${n} × ${n} = ${n ** 3}.`), num(`Work out ∛${n ** 3}`, n, `${n}³ = ${n ** 3}.`)]); }),
          gen(() => { const a = R(3, 19); const N0 = a * a + R(1, 2 * a); return fill('Find two consecutive integers to complete the sentence.', [a, a + 1], `${a}² = ${a * a} and ${a + 1}² = ${(a + 1) ** 2}.`, { f: `√${N0} is between [] and []` }); }),
          gen(() => { const a = R(3, 19); const N0 = a * a + R(1, 2 * a); const near = N0 - a * a <= (a + 1) ** 2 - N0 ? a : a + 1; return num(`Work out the integer that is closest to √${N0}.`, near, `${a}² = ${a * a}, ${a + 1}² = ${(a + 1) ** 2}; ${N0} is closer to ${near * near}.`); }),
          gen(() => { const s0 = R(6, 25); return num(`A square vegetable garden has an area of ${s0 * s0} m². How long is each side?`, s0, `√${s0 * s0} = ${s0} m.`, { unit: 'm', app: true }); }, { app: true }),
          gen(() => { const e = R(2, 10); return num(`A cube-shaped box has a volume of ${e ** 3} cm³. How long is each edge?`, e, `∛${e ** 3} = ${e} cm.`, { unit: 'cm', app: true }); }, { app: true }),
          gen(() => { const a = R(2, 9), b = R(2, 5); return num(`Work out √${a * a} + ∛${b ** 3}`, a + b, `${a} + ${b} = ${a + b}.`, { d: 2 }); }),
          gen(() => { const xs = shuffle([R(2, 12) ** 2, R(2, 12) ** 2, R(2, 5) ** 3, R(10, 99), R(10, 99), 64]); const uniq = [...new Set(xs)]; return sort('Sort these numbers.', ['Square number', 'Cube number', 'Both', 'Neither'], uniq.map((n) => { const sq = Number.isInteger(Math.sqrt(n)), cb = Number.isInteger(Math.round(Math.cbrt(n) * 1e6) / 1e6); return [String(n), sq && cb ? 2 : sq ? 0 : cb ? 1 : 3]; }), '64 = 8² = 4³ is both a square and a cube.', { d: 2 }); }),
        ],
      },
    ],
    explore: {
      title: 'Life below zero', hero: 'heroDepth',
      lead: 'From the top of Mount Everest to the bottom of the Mariana Trench, from Antarctic winters to the dance of cicadas and gears — integers, multiples and factors describe the real world.',
      leadVi: 'Từ đỉnh Everest đến đáy rãnh Mariana, từ mùa đông Nam Cực đến chu kỳ của loài ve sầu và bánh răng — số nguyên, bội và ước có mặt khắp nơi.',
      cards: [
        { t: 'Red and black rods', p: 'More than 2000 years ago, Chinese mathematicians calculated with <b>counting rods</b>: red rods for positive numbers and black rods for negative numbers. When a red rod and a black rod met, they cancelled each other out — exactly the idea of a <b>zero pair</b>.', vi: 'Người Trung Quốc cổ dùng que đỏ (dương) và que đen (âm); một que đỏ gặp một que đen thì triệt tiêu.', viz: 'zeroPairs' },
        { t: 'Fortunes and debts', p: 'In 628 AD, the Indian mathematician <b>Brahmagupta</b> wrote rules for calculating with zero and negative numbers. He called positive numbers “fortunes” and negative numbers “debts”. A debt minus zero is a debt; a fortune minus zero is a fortune.', vi: 'Năm 628, Brahmagupta (Ấn Độ) gọi số dương là “tài sản”, số âm là “món nợ”.' },
        { t: 'The coldest place on Earth', p: 'In 1983, scientists at Vostok Station in Antarctica recorded <b>−89.2 °C</b>. The hottest air temperature ever recorded is about <b>56.7 °C</b> in Death Valley, USA. The difference is 56.7 − (−89.2) = 145.9 °C.', viz: 'thermo' },
        { t: 'Cicadas that count in primes', p: 'Some cicadas stay underground for <b>13 or 17 years</b> before they all come out together. Scientists think prime-number cycles help them avoid predators: a predator with a 4-year cycle only meets 13-year cicadas every LCM(13, 4) = 52 years.', viz: 'cicada' },
        { t: 'Gears and the LCM', p: 'Bicycle gears, clocks and machines use wheels with different numbers of teeth. Two gears return to their starting position after a number of teeth equal to the <b>lowest common multiple</b> of their tooth counts.', viz: 'gears' },
      ],
      facts: [['−89.2 °C', 'Vostok Station, 1983', 'The lowest natural air temperature ever measured on Earth, in Antarctica.'], ['628 AD', 'Brahmagupta', 'The year Brahmagupta wrote rules for zero and negative numbers in his book <i>Brāhmasphuṭasiddhānta</i>.'], ['1729', 'A famous taxi number', '1729 = 1³ + 12³ = 9³ + 10³. It is the smallest number that is the sum of two cubes in two different ways (Ramanujan).'], ['41 024 320', 'digits', 'The number of digits in the largest known prime (found in 2024): 2<sup>136 279 841</sup> − 1.']],
      challenge: { t: 'The locker puzzle', p: 'A school has 100 closed lockers numbered 1 to 100. Student 1 opens every locker. Student 2 changes every 2nd locker (closes it if open, opens it if closed). Student 3 changes every 3rd locker, and so on until student 100. <b>Which lockers are open at the end?</b>', a: 'Locker n is changed once for each <b>factor</b> of n. It ends open only if it is changed an odd number of times. Only <b>square numbers</b> have an odd number of factors, so lockers 1, 4, 9, 16, 25, 36, 49, 64, 81 and 100 are open (10 lockers).' },
    },
    reading: {
      title: 'The Long Road to Negative Numbers', sub: 'Read the passage, then answer the questions. Tap any word to see its meaning.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Today, children learn about negative numbers at school, and we use them every day for temperatures, bank accounts and floors below ground in a building. However, for most of history, people did not accept that a number could be less than nothing.',
        'The earliest known use of negative numbers comes from China. A book called <i>The Nine Chapters on the Mathematical Art</i>, written around 2000 years ago, explains how to calculate with counting rods. Red rods stood for positive numbers and black rods stood for negative numbers. Mathematicians placed the rods on a board to solve problems about buying and selling.',
        'In India in 628 AD, Brahmagupta wrote clear rules for calculating with zero and negative numbers. He described positive numbers as “fortunes” and negative numbers as “debts”. For example, he explained that a debt subtracted from zero becomes a fortune. Not all of his rules were the same as the rules we use today, but they were an important step forward.',
        'European mathematicians were much slower to accept negative numbers. Even in the 1500s, some writers called them “absurd” or “false” numbers. They used them in calculations but did not believe that the answers were real. It was only in the 1700s and 1800s, when mathematicians started to draw numbers on a line, that negative numbers were fully accepted.',
        'The number line made the idea simple: positive numbers go to the right of zero and negative numbers go to the left. Moving along the line shows addition and subtraction. Today, scientists use negative numbers to describe the charge of an electron, the depth of the ocean and temperatures colder than freezing.',
      ],
      gloss: [['accept', 'chấp nhận'], ['counting rods', 'que tính'], ['debt', 'món nợ'], ['fortune', 'tài sản'], ['absurd', 'vô lý'], ['charge', 'điện tích']],
      parts: [
        { title: 'True, False or Not Given?', note: 'Choose TRUE if the statement agrees with the passage, FALSE if it disagrees, NOT GIVEN if there is no information.', qs: [
          { type: 'mcq', q: 'The first known use of negative numbers was in China.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph B: “The earliest known use of negative numbers comes from China.”' },
          { type: 'mcq', q: 'In Chinese counting rods, black rods showed positive numbers.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'Red rods were positive; black rods were negative.' },
          { type: 'mcq', q: 'Brahmagupta’s rules were exactly the same as the rules we use today.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'Paragraph C: “Not all of his rules were the same as the rules we use today.”' },
          { type: 'mcq', q: 'Brahmagupta also invented the number line.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'The passage does not say who invented the number line.' },
        ] },
        { title: 'Multiple choice', qs: [
          { type: 'mcq', q: 'What did Chinese mathematicians use counting rods for?', opts: ['problems about buying and selling', 'measuring temperature', 'drawing number lines', 'counting electrons'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'How did many European writers in the 1500s describe negative numbers?', opts: ['as absurd or false', 'as fortunes', 'as very useful', 'as easy to understand'], a: 0, ex: 'Paragraph D.' },
          { type: 'mcq', q: 'According to the passage, what finally helped people accept negative numbers?', opts: ['drawing numbers on a line', 'using red and black rods', 'measuring the depth of the ocean', 'bank accounts'], a: 0, ex: 'Paragraph D–E: the number line.' },
        ] },
        { title: 'Complete the summary', note: 'Use ONE word from the box for each gap.', bank: ['right', 'debts', 'line', 'China', 'left', 'rods'], qs: [
          { type: 'fill', q: 'Complete the sentences.', f: 'Negative numbers were first used in [], where mathematicians used coloured [] . Brahmagupta called negative numbers [] . On a number [], negative numbers are to the [] of zero.', a: [['China'], ['rods'], ['debts'], ['line'], ['left']], ex: 'Paragraphs B, C and E.' },
        ] },
        { title: 'Short answers', qs: [
          { type: 'num', q: 'In which year did Brahmagupta write his rules? ', a: 628, ex: 'Paragraph C: 628 AD.' },
          { type: 'txt', q: 'Give ONE example of how scientists use negative numbers today (one or two words).', a: ['charge', 'electron', 'electron charge', 'depth', 'ocean depth', 'temperature', 'temperatures', 'the charge of an electron', 'the depth of the ocean'], ex: 'Paragraph E: the charge of an electron, the depth of the ocean, temperatures below freezing.' },
        ] },
      ],
    },
    listening: {
      title: 'Number Talk: The Prime Cicadas', intro: 'A short radio interview. Listen and answer the questions.',
      voices: { Host: 'buttery', 'Dr Lin': 'airy' },
      lines: [
        { spk: 'Host', text: 'Welcome back to Number Talk. Today I’m with Dr Lin, a biologist who studies insects. Dr Lin, what are periodical cicadas?' },
        { spk: 'Dr Lin', text: 'They are insects that live underground for many years. Then, in one spring, millions of them come out at the same time. Some groups appear every thirteen years and others every seventeen years.' },
        { spk: 'Host', text: 'Thirteen and seventeen. Those are both prime numbers, aren’t they?' },
        { spk: 'Dr Lin', text: 'Exactly. And we think that is not an accident. Imagine a predator, like a bird or a wasp, whose numbers grow every four years. If the cicadas came out every twelve years, they would meet the predators every twelve years, because twelve is a multiple of four.' },
        { spk: 'Host', text: 'But with a thirteen-year cycle?' },
        { spk: 'Dr Lin', text: 'Then the lowest common multiple of thirteen and four is fifty-two. The cicadas would only meet the predators once every fifty-two years. That gives them a much better chance to survive.' },
        { spk: 'Host', text: 'So the cicadas use maths without knowing it! Thank you, Dr Lin. Next week we’ll talk about square numbers in sunflowers.' },
      ],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'What is Dr Lin’s job?', opts: ['biologist', 'mathematician', 'radio host', 'teacher'], a: 0, ex: '“a biologist who studies insects”' },
          { type: 'mcq', q: 'Where do periodical cicadas live for most of their lives?', opts: ['underground', 'in trees', 'in water', 'in the air'], a: 0, ex: '“They are insects that live underground for many years.”' },
          { type: 'mcq', q: 'What will next week’s programme be about?', opts: ['square numbers in sunflowers', 'prime numbers in bees', 'cube numbers in crystals', 'cicadas in Asia'], a: 0, ex: 'Last line of the interview.' },
        ] },
        { title: 'Complete the notes (numbers)', qs: [
          { type: 'fill', q: 'Fill in the numbers you hear.', f: 'Cicada cycles: [] years or [] years. Example predator cycle: [] years. LCM of 13 and 4 = [] years.', a: [13, 17, 4, 52], ex: 'Cycles 13 and 17; predator 4; LCM(13, 4) = 52.' },
        ] },
        { title: 'True or False?', qs: [
          { type: 'tf', q: 'A 12-year cycle would be safe from a 4-year predator.', a: false, ex: '12 is a multiple of 4, so they would meet every 12 years.' },
          { type: 'tf', q: 'Dr Lin thinks the prime-number cycles are probably not an accident.', a: true, ex: '“we think that is not an accident”' },
        ] },
      ],
    },
  });
})();
