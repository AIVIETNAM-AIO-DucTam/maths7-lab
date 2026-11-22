/* Unit 3 — Place value and rounding */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, gen } = Q;
  const P = (n) => `10<sup>${n}</sup>`;
  const clean = (v) => parseFloat(Number(v).toPrecision(12));
  // group digits with thin spaces (book style: 10 000, 1000)
  const G = (v) => { const str = String(clean(v)); if (/e/.test(str)) return N(v); const [i, d] = str.split('.'); const neg = i[0] === '-'; let ii = neg ? i.slice(1) : i; if (ii.length > 4) ii = ii.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return (neg ? '−' : '') + ii + (d ? '.' + d : ''); };
  const rnd = (v, dp) => Number(Math.round(Number(v + 'e' + dp)) + 'e-' + dp);
  const rs = (v, dp) => rnd(v, dp).toFixed(dp);
  const WORDS = ['one', 'ten', 'one hundred', 'one thousand', 'ten thousand', 'one hundred thousand', 'one million', 'ten million', 'one hundred million', 'one billion', 'ten billion'];

  /* ---------- widgets ---------- */
  APP.viz.pvTable = function (el, o = {}) {
    const f = VZ.frame(el, 'Bảng giá trị: chữ số dịch chuyển', { icon: 'grid' });
    const cols = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5]; const names = ['M', 'HTh', 'TTh', 'Th', 'H', 'T', 'O', 't', 'h', 'th', '', ''];
    const cw = 50, W = cols.length * cw + 20, H = 150; const svg = VZ.svg(W, H); f.stage.append(svg);
    let start = o.start || 4.56, n = 0, mode = 'x';
    const colX = (p) => 10 + cols.indexOf(p) * cw + cw / 2;
    function digitsOf(v) { const str = clean(v).toFixed(6).replace(/0+$/, '').replace(/\.$/, ''); let [i, d = ''] = str.split('.'); i = i.replace(/^0+/, ''); const out = []; i.split('').forEach((c, k) => out.push({ c, p: i.length - 1 - k })); d.split('').forEach((c, k) => out.push({ c, p: -1 - k })); return out; }
    const base = digitsOf(start);
    const g = s('g'); svg.append(g);
    function frame0() {
      svg.innerHTML = '';
      cols.forEach((p, k) => { const x = 10 + k * cw; svg.append(s('rect', { x, y: 10, width: cw, height: 30, fill: p >= 0 ? 'var(--sc-soft)' : 'var(--surface-3)', stroke: 'var(--line)' }), s('text', { x: x + cw / 2, y: 30, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink-2)', text: names[k] || P(p).replace(/<\/?sup>/g, '^') }), s('rect', { x, y: 40, width: cw, height: 60, fill: 'var(--surface)', stroke: 'var(--line)' })); });
      const dpx = colX(0) + cw / 2; svg.append(s('circle', { cx: dpx, cy: 92, r: 5, fill: 'var(--bad)' }));
      svg.append(g);
    }
    function draw(anim = true) {
      frame0(); g.innerHTML = '';
      const shift = mode === 'x' ? n : -n; const ds = base.map((d) => ({ c: d.c, p: d.p + shift }));
      const ps = ds.map((d) => d.p); const hi = Math.max(...ps, 0), lo = Math.min(...ps, 0);
      // zeros needed: between lowest digit and units place, and leading 0 before point
      const zeros = []; for (let p = 0; p < lo; p++) zeros.push(p); for (let p = hi + 1; p <= 0; p++) zeros.push(p);
      ds.forEach((d) => { if (!cols.includes(d.p)) return; const t = s('text', { x: colX(d.p - shift), y: 80, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: 'var(--sc)', 'font-family': 'var(--f-mono)', text: d.c, style: 'transition:transform .7s cubic-bezier(.34,1.56,.64,1)' }); g.append(t); requestAnimationFrame(() => requestAnimationFrame(() => { t.style.transform = `translateX(${(colX(d.p) - colX(d.p - shift))}px)`; })); });
      zeros.forEach((p) => { if (!cols.includes(p)) return; g.append(s('text', { x: colX(p), y: 80, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: 'var(--accent)', opacity: 0.85, 'font-family': 'var(--f-mono)', text: '0', style: `animation:popIn .4s ${anim ? 0.7 : 0}s both` })); });
      const res = mode === 'x' ? start * Math.pow(10, n) : start / Math.pow(10, n);
      f.out.innerHTML = `${G(start)} ${mode === 'x' ? '×' : '÷'} ${P(n)} = <b style="color:var(--accent)">${G(res)}</b> &nbsp;<span class="muted" style="font-weight:500">(${mode === 'x' ? 'sang TRÁI' : 'sang PHẢI'} ${n} cột)</span>`;
      if (n) SFX.play('whoosh');
    }
    const sel = h('select', { 'aria-label': 'Số ban đầu' }, [4.56, 23, 3.581, 45000, 2350000, 0.33, 65, 7.8].map((v) => h('option', { value: v, selected: v === start }, G(v))));
    sel.onchange = () => { start = +sel.value; base.splice(0, base.length, ...digitsOf(start)); draw(false); };
    f.ctrls.append(h('label', {}, 'Số:', sel), VZ.seg([['x', '× 10ⁿ'], ['d', '÷ 10ⁿ']], mode, (v) => { mode = v; draw(); }), VZ.range('n =', 0, 5, n, 1, (v) => { n = v; draw(); }));
    draw(false);
  };
  APP.viz.powerLadder = function (el) {
    const f = VZ.frame(el, 'Bậc thang luỹ thừa của 10', { icon: 'chart' });
    let n = 3; const st = h('div', { style: { display: 'grid', gap: '10px' } }); f.stage.append(st);
    const real = ['1 em bé', '10 ngón tay', '100 năm = 1 thế kỉ', '1000 m = 1 km', '10 000 bước đi bộ mỗi ngày', 'sân vận động 100 000 chỗ', '1 triệu giây ≈ 11,6 ngày', 'Hà Nội ≈ 8,5 × 10⁶ người', '100 triệu', '1 tỉ giây ≈ 31,7 năm'];
    function blocks(k) {
      // base-ten blocks: 10^0 unit, 10^1 rod, 10^2 flat, 10^3 cube; beyond: rows of cubes
      const W = 360, H = 130, svgS = [`<svg viewBox="0 0 ${W} ${H}" style="max-width:420px">`];
      const cube = (x, y, a, col) => `<g><path d="M${x} ${y} l${a} 0 l${a * 0.5} ${-a * 0.5} l${-a} 0 z" fill="${col}" opacity=".75"/><path d="M${x + a} ${y} l${a * 0.5} ${-a * 0.5} l0 ${a} l${-a * 0.5} ${a * 0.5} z" fill="${col}" opacity=".55"/><rect x="${x}" y="${y}" width="${a}" height="${a}" fill="${col}"/></g>`;
      if (k === 0) svgS.push(cube(170, 60, 18, 'var(--number)'));
      else if (k === 1) for (let i = 0; i < 10; i++) svgS.push(cube(80 + i * 18, 60, 18, 'var(--number)'));
      else if (k === 2) for (let r = 0; r < 10; r++) for (let i = 0; i < 10; i++) svgS.push(`<rect x="${110 + i * 10}" y="${14 + r * 10}" width="9" height="9" rx="1.5" fill="var(--number)" opacity="${0.55 + ((i + r) % 3) * 0.15}"/>`);
      else if (k === 3) svgS.push(cube(140, 50, 64, 'var(--number)'));
      else { for (let i = 0; i < 10; i++) svgS.push(cube(14 + i * 32, 88, 26, i % 2 ? 'var(--accent)' : 'var(--number)')); svgS.push(`<text x="${W / 2}" y="30" text-anchor="middle" font-size="14" fill="var(--ink-2)" font-weight="700">10 khối, mỗi khối = ${G(Math.pow(10, k - 1))}</text>`); }
      svgS.push('</svg>'); return svgS.join('');
    }
    function draw() {
      const v = Math.pow(10, n); st.innerHTML = '';
      st.append(h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' } }, h('div', { style: { fontFamily: 'var(--f-display)', fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 800, color: 'var(--sc)' }, html: P(n) }), h('div', { class: 'mono', style: { fontSize: 'clamp(1rem,3.5vw,1.5rem)', fontWeight: 700, animation: 'stepIn .4s both' } }, '= ' + (n ? Array(n).fill('10').join(' × ') + ' = ' : '') + G(v))));
      st.append(h('div', { html: blocks(n) }));
      f.out.innerHTML = `<span data-tr>${WORDS[n]}</span> · số chữ số 0 sau chữ số 1: <b>${n}</b> · ví dụ: ${real[n]}`;
    }
    f.ctrls.append(VZ.range('Luỹ thừa n', 0, 9, n, 1, (v) => { n = v; SFX.play('tick'); draw(); }));
    draw();
  };
  APP.viz.roundZoom = function (el) {
    const f = VZ.frame(el, 'Làm tròn: phóng to trục số', { icon: 'target' });
    let v = 5.376398, dp = 1; const inp = h('input', { type: 'text', inputmode: 'decimal', value: String(v), style: { width: '120px', fontFamily: 'var(--f-mono)' }, 'aria-label': 'Số cần làm tròn' });
    const st = h('div'); f.stage.append(st);
    function draw() {
      const x = parseFloat(String(inp.value).replace(',', '.')); if (isNaN(x)) return; v = x;
      const step = Math.pow(10, -dp); const lo = Math.floor(rnd(v / step, 9)) * step, hi = lo + step; const W = 640, H = 150, L = 40, Rr = W - 40;
      const X = (t) => L + (t - lo) / step * (Rr - L); const r = rnd(v, dp); const mid = lo + step / 2;
      let svgS = `<svg viewBox="0 0 ${W} ${H}" style="width:100%"><line x1="${L - 20}" y1="80" x2="${Rr + 20}" y2="80" stroke="var(--ink-2)" stroke-width="3"/>`;
      for (let i = 0; i <= 10; i++) { const t = lo + i * step / 10, xx = X(t); svgS += `<line x1="${xx}" y1="${i % 5 ? 72 : 64}" x2="${xx}" y2="${i % 5 ? 88 : 96}" stroke="var(--ink-2)" stroke-width="${i % 5 ? 1.5 : 2.5}"/>`; }
      svgS += `<text x="${X(lo)}" y="122" text-anchor="middle" font-weight="800" font-size="17" fill="var(--ink)">${rs(lo, dp)}</text><text x="${X(hi)}" y="122" text-anchor="middle" font-weight="800" font-size="17" fill="var(--ink)">${rs(hi, dp)}</text><text x="${X(mid)}" y="122" text-anchor="middle" font-size="13" fill="var(--ink-3)">${N(clean(mid))}</text>`;
      svgS += `<rect x="${X(mid)}" y="56" width="${(r > mid - 1e-12 ? Rr - X(mid) : 0)}" height="48" fill="color-mix(in srgb, var(--accent) 14%, transparent)"/><rect x="${L}" y="56" width="${r < mid ? X(mid) - L : 0}" height="48" fill="color-mix(in srgb, var(--accent) 14%, transparent)"/>`;
      svgS += `<g style="animation:popIn .4s both"><path d="M${X(v)} 70 l-8 -16 h16 z" fill="var(--bad)"/><text x="${X(v)}" y="44" text-anchor="middle" font-weight="800" font-size="15" fill="var(--bad)">${N(v)}</text></g>`;
      svgS += `<path d="M${X(v)} 100 Q ${(X(v) + X(r)) / 2} 140 ${X(r)} 100" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="5 4" marker-end=""/><circle cx="${X(r)}" cy="80" r="7" fill="var(--accent)"/></svg>`;
      st.innerHTML = svgS;
      const str = String(v); const di = str.indexOf('.'); const keep = di < 0 ? str : str.slice(0, di + 1 + dp), next = di < 0 ? '' : str.slice(di + 1 + dp, di + 2 + dp);
      f.out.innerHTML = `<span class="mono">${keep}<span style="color:var(--bad);text-decoration:underline">${next}</span>${di < 0 ? '' : str.slice(di + 2 + dp)}</span> → chữ số bên phải là <b>${next || 0}</b> ${+next >= 5 ? '≥ 5 nên làm tròn LÊN' : '< 5 nên giữ nguyên'} → <b style="color:var(--accent)">${rs(v, dp)}</b> (${dp} d.p.)`;
    }
    inp.oninput = draw;
    f.ctrls.append(h('label', {}, 'Số:', inp), VZ.seg([[0, 'số nguyên'], [1, '1 d.p.'], [2, '2 d.p.'], [3, '3 d.p.'], [4, '4 d.p.']], dp, (k) => { dp = +k; draw(); }), VZ.btn('Ngẫu nhiên', () => { inp.value = String(clean(R(1, 999) + Math.random())).slice(0, 9); draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.unitLadder = function (el) {
    const f = VZ.frame(el, 'Đổi đơn vị độ dài bằng luỹ thừa 10', { icon: 'shuffle' });
    const units = [['km', 6], ['m', 3], ['cm', 1], ['mm', 0]]; let val = 3.4, from = 'm';
    const st = h('div', { style: { display: 'grid', gap: '8px' } }); f.stage.append(st);
    const inp = h('input', { type: 'text', inputmode: 'decimal', value: '3.4', style: { width: '110px', fontFamily: 'var(--f-mono)' }, 'aria-label': 'Giá trị' });
    function draw() {
      const x = parseFloat(String(inp.value).replace(',', '.')); if (isNaN(x)) return; val = x; const e0 = units.find((u) => u[0] === from)[1];
      st.innerHTML = ''; units.forEach(([u, e], k) => { const v = val * Math.pow(10, e0 - e); const w = 30 + (6 - e) * 11; st.append(h('div', { class: 'row', style: { gap: '10px', animation: `stepIn .35s ${k * 0.06}s both` } }, h('b', { style: { width: '44px' } }, u), h('div', { style: { height: '26px', width: w + '%', maxWidth: '70%', borderRadius: '8px', background: u === from ? 'var(--accent)' : 'var(--sc)', opacity: u === from ? 1 : 0.75 } }), h('span', { class: 'mono', style: { fontWeight: 700 } }, G(v) + ' ' + u))); });
      f.out.innerHTML = 'number of mm = number of cm × 10 = number of m × 10<sup>3</sup> = number of km × 10<sup>6</sup>';
    }
    inp.oninput = draw;
    f.ctrls.append(h('label', {}, 'Giá trị:', inp), VZ.seg(units.map((u) => [u[0], u[0]]), from, (v) => { from = v; draw(); }));
    draw();
  };
  // explore
  APP.viz.heroScale = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#050816'; c.fillRect(0, 0, w, hh);
      const z = (t * 0.35) % 1; const cx = w * 0.7, cy = hh * 0.5;
      for (let i = 0; i < 7; i++) {
        const k = i + z; const sz = Math.pow(10, k / 3) * Math.min(w, hh) * 0.06; if (sz > w * 2) continue;
        c.strokeStyle = `hsla(${200 + i * 25},90%,70%,${Math.min(1, 1.4 - k / 6)})`; c.lineWidth = 2; c.strokeRect(cx - sz / 2, cy - sz / 2, sz, sz);
        c.fillStyle = c.strokeStyle; c.font = `700 ${Math.max(11, Math.min(18, sz / 10))}px "JetBrains Mono", monospace`; c.fillText('10^' + (i * 1 - 3) + ' m', cx - sz / 2 + 6, cy - sz / 2 + 18);
      }
      for (let i = 0; i < 60; i++) { const a = (i * 137.5) % 360, r = ((i * 53) % 100) / 100; const x = (Math.sin(a + t * 0.05) * 0.5 + 0.5) * w, y = (Math.cos(a * 1.3) * 0.5 + 0.5) * hh; c.fillStyle = `rgba(255,255,255,${0.2 + r * 0.5})`; c.fillRect(x, y, 1.5, 1.5); }
    });
  };
  APP.viz.cosmicScale = function (el) {
    const f = VZ.frame(el, 'Từ nguyên tử đến thiên hà', { icon: 'atom' });
    const items = [[-10, 'atom', 'nguyên tử', '⚛️'], [-7, 'virus', 'vi-rút', '🦠'], [-5, 'blood cell', 'tế bào máu', '🩸'], [-3, 'ant', 'con kiến', '🐜'], [0, 'child', 'em bé', '🧒'], [2, 'football pitch', 'sân bóng', '🏟️'], [4, 'Mount Everest', 'đỉnh Everest', '🏔️'], [7, 'Earth', 'Trái Đất', '🌍'], [9, 'Sun', 'Mặt Trời', '☀️'], [13, 'Solar System', 'Hệ Mặt Trời', '🪐'], [16, 'light-year', 'năm ánh sáng', '✨'], [21, 'Milky Way', 'Dải Ngân Hà', '🌌']];
    let k = 4; const st = h('div', { style: { display: 'grid', placeItems: 'center', gap: '6px', minHeight: '170px', textAlign: 'center' } }); f.stage.append(st);
    function draw() {
      const [e, en, vi, em] = items[k];
      st.innerHTML = ''; st.append(h('div', { style: { fontSize: 'clamp(3rem,12vw,5rem)', animation: 'popIn .45s both', lineHeight: 1 } }, em), h('div', { style: { fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--sc)' }, html: `≈ ${P(e)} m` }), h('div', { 'data-tr': '' }, h('b', {}, en), ' · ', vi));
      f.out.innerHTML = e >= 0 ? `${P(e)} m = ${G(Math.pow(10, e)).length < 22 ? G(Math.pow(10, e)) : '1 và ' + e + ' chữ số 0'} m` : `${P(e)} m = 1 ÷ ${P(-e)} m = ${(Math.pow(10, e)).toFixed(-e)} m`;
    }
    f.ctrls.append(VZ.range('Kích thước', 0, items.length - 1, k, 1, (v) => { k = v; SFX.play('tick'); draw(); }, (v) => items[v][1]));
    draw();
  };
  APP.viz.millionDots = function (el) {
    const f = VZ.frame(el, '1 triệu chấm trông thế nào?', { icon: 'spark' });
    const cv = h('canvas', { style: { width: '100%', height: '240px', borderRadius: '12px', background: 'var(--surface)' } }); f.stage.append(cv);
    let n = 3;
    function draw() {
      const dpr = Math.min(2, window.devicePixelRatio || 1); const w = cv.clientWidth || 600, hh = 240; cv.width = w * dpr; cv.height = hh * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, w, hh);
      const total = Math.pow(10, n); const cols = Math.ceil(Math.sqrt(total * w / hh)); const rows = Math.ceil(total / cols); const cell = Math.min(w / cols, hh / rows);
      c.fillStyle = getComputedStyle(el).getPropertyValue('--number') || '#3b82f6';
      if (cell >= 1) { for (let i = 0; i < total; i++) { const x = (i % cols) * cell, y = Math.floor(i / cols) * cell; if (cell > 3) { c.beginPath(); c.arc(x + cell / 2, y + cell / 2, cell * 0.38, 0, 7); c.fill(); } else c.fillRect(x, y, Math.max(0.6, cell * 0.8), Math.max(0.6, cell * 0.8)); } }
      else { const img = c.createImageData(Math.floor(w * dpr), Math.floor(hh * dpr)); const frac = Math.min(1, total / (w * dpr * hh * dpr)); for (let i = 0; i < img.data.length; i += 4) { if (Math.random() < frac * 1.6) { img.data[i] = 59; img.data[i + 1] = 130; img.data[i + 2] = 246; img.data[i + 3] = 255; } } c.putImageData(img, 0, 0); }
      f.out.innerHTML = `${P(n)} = <b>${G(total)}</b> chấm · nếu đếm 1 chấm mỗi giây sẽ mất ${n < 4 ? G(total) + ' giây' : n < 6 ? (total / 3600).toFixed(1) + ' giờ' : (total / 86400).toFixed(1) + ' ngày'}`;
    }
    f.ctrls.append(VZ.seg([[1, '10'], [2, '100'], [3, '1000'], [4, '10 000'], [5, '100 000'], [6, '1 000 000']], n, (v) => { n = +v; SFX.play('pop'); draw(); }));
    VZ.when(cv, draw);
  };
  APP.viz.billSplit = function (el) {
    const f = VZ.frame(el, 'Chia hoá đơn: nên làm tròn thế nào?', { icon: 'bulb' });
    let bill = 46.48, ppl = 3; const st = h('div'); f.stage.append(st);
    function draw() {
      const each = bill / ppl; const rows = [['Làm tròn đến số nguyên', rnd(each, 0)], ['Làm tròn 1 d.p.', rnd(each, 1)], ['Làm tròn 2 d.p.', rnd(each, 2)], ['Làm tròn LÊN tới 0.01', Math.ceil(each * 100 - 1e-9) / 100]];
      st.innerHTML = FIG.table(['Cách làm', 'Mỗi người trả', 'Tổng thu', 'Chênh lệch'], rows.map(([t, v]) => [t, '$' + v.toFixed(2), '$' + (v * ppl).toFixed(2), `<b style="color:${v * ppl >= bill - 1e-9 ? 'var(--good)' : 'var(--bad)'}">${v * ppl >= bill - 1e-9 ? '+' : '−'}$${Math.abs(v * ppl - bill).toFixed(2)}</b>`]));
      f.out.innerHTML = `$${bill.toFixed(2)} ÷ ${ppl} = ${N(clean(each))}… → làm tròn LÊN để không thiếu tiền!`;
    }
    f.ctrls.append(VZ.range('Hoá đơn ($)', 10, 120, bill, 0.01, (v) => { bill = v; draw(); }, (v) => '$' + Number(v).toFixed(2)), VZ.range('Số người', 2, 8, ppl, 1, (v) => { ppl = v; draw(); }));
    draw();
  };

  /* ---------- question helpers ---------- */
  const multQ = (a, n, op) => { const res = op === '×' ? a * Math.pow(10, n) : a / Math.pow(10, n); return num(`Work out ${G(a)} ${op} ${P(n)}`, clean(res), `${P(n)} = ${G(Math.pow(10, n))}. Move the digits ${n} places to the ${op === '×' ? 'left' : 'right'}: ${G(a)} ${op} ${G(Math.pow(10, n))} = ${G(res)}.`); };
  const roundQ = (v, dp, o = {}) => num(`Round ${v} to ${dp === 0 ? 'the nearest whole number' : dp + ' decimal place' + (dp > 1 ? 's' : '') + ` (${dp} d.p.)`}.`, rnd(v, dp), `Look at the digit after the ${dp === 0 ? 'decimal point' : dp + (['st', 'nd', 'rd'][dp - 1] || 'th') + ' decimal place'}. ${v} ≈ ${rs(v, dp)} (${dp} d.p.). Your answer must have exactly ${dp} digit${dp === 1 ? '' : 's'} after the point.`, Object.assign({ dp }, o));

  APP.addUnit({
    n: 3, strand: 'number', title: 'Place value and rounding', vi: 'Giá trị theo vị trí và làm tròn',
    blurb: 'You use numbers every day, but you do not always need the numbers to be exact. Numbers are often rounded because it is easier to work with rounded numbers and to compare them. On Saturday 74 836 football fans saw Real Madrid beat FC Barcelona — a newspaper might simply say 75 000.',
    blurbVi: 'Nhân/chia cho luỹ thừa của 10 bằng cách dịch chữ số trong bảng giá trị, và làm tròn số đến một số chữ số thập phân cho trước.',
    words: [['place value', 'giá trị theo vị trí'], ['power of 10', 'luỹ thừa của 10'], ['index', 'số mũ'], ['indices', 'các số mũ'], ['power', 'luỹ thừa'], ['classify', 'phân loại'], ['round', 'làm tròn'], ['degree of accuracy', 'độ chính xác'], ['decimal place', 'chữ số thập phân'], ['nearest whole number', 'số nguyên gần nhất'], ['million', 'triệu'], ['billion', 'tỉ'], ['approximately', 'xấp xỉ'], ['digit', 'chữ số']],
    chat: ['Vì sao nhân với 10⁴ thì dịch sang trái 4 cột?', 'Làm tròn 3.9975 đến 2 chữ số thập phân', 'Đổi 15 600 000 mm sang km'],
    sections: [
      {
        id: '3.1', t: 'Multiplying and dividing by powers of 10', vi: 'Nhân và chia cho luỹ thừa của 10',
        goals: ['multiply and divide whole numbers by powers of 10', 'multiply and divide decimals by powers of 10.'],
        body: [
          ['p', 'You can write all the numbers 10, 100, 1000, 10 000, … as <b>powers of 10</b>. The power of 10 is written as an <b>index</b>. This is the number of 10s that you multiply together to get the final number. It is also the same as the number of zeros that follow the digit 1.'],
          ['table', ['Number', 'Product of 10s', 'Power of 10', 'In words'], [['10', '10', P(1), 'ten to the power of 1'], ['100', '10 × 10', P(2), '10 squared'], ['1000', '10 × 10 × 10', P(3), '10 cubed'], ['10 000', '10 × 10 × 10 × 10', P(4), 'ten to the power of 4']]],
          ['viz', 'powerLadder'],
          ['ex', { t: 'Worked example 3.1', q: `a Write ${P(6)} in i numbers ii words. &nbsp; b Write the number 100 000 as a power of 10.`, steps: [`a i: ${P(6)} = 10 × 10 × 10 × 10 × 10 × 10 — a 1 followed by six zeros: <b>1 000 000</b>`, 'a ii: <b>one million</b>', `b: there are five zeros after the 1 in 100 000, so 100 000 = <b>${P(5)}</b>`] }],
          ['rule', `Multiply by ${P('n')}: move the digits n places to the LEFT. Divide by ${P('n')}: move the digits n places to the RIGHT. Fill empty places with zeros.`, 'Place value'],
          ['viz', 'pvTable'],
          ['ex', { t: 'Worked example 3.2', q: `Work out: a 23 × ${P(4)} &nbsp; b 3.581 × ${P(6)} &nbsp; c 45 000 ÷ ${P(5)}`, steps: [`a: ${P(4)} = 10 000. The digits 2 and 3 move four places left; fill four spaces with zeros → <b>230 000</b>`, `b: ${P(6)} = 1 000 000. The digits move six places left; three empty spaces are filled with zeros → <b>3 581 000</b>`, `c: ${P(5)} = 100 000. The digits 4 and 5 move five places right; a zero goes before the decimal point → <b>0.45</b>`] }],
          ['tip', 'Marcus’ “add zeros” method only works for <b>whole numbers</b>. For 4.56 × 10⁵ think of moving the digits (Sofia) or count decimal places (Maya): 5 − 2 = 3 zeros → 456 000.'],
          ['viz', 'unitLadder'],
          ['vi', ['10ⁿ = 1 và n chữ số 0. Ví dụ 10⁶ = 1 000 000 (một triệu).', 'Nhân với 10ⁿ: các chữ số dịch sang TRÁI n hàng (số lớn hơn).', 'Chia cho 10ⁿ: các chữ số dịch sang PHẢI n hàng (số nhỏ hơn).', 'Đổi đơn vị: mm = cm × 10 = m × 10³ = km × 10⁶; km = mm ÷ 10⁶.']],
        ],
        bank: [
          fill('Write these powers of 10 as ordinary numbers.', [1000, 100000, 10000000, 10], `${P(3)} = 1000 (one thousand).`, { f: `a ${P(3)} = [] &nbsp; b ${P(5)} = [] &nbsp; c ${P(7)} = [] &nbsp; d ${P(1)} = []` }),
          match('Match each power of 10 to its value in words.', [[P(3), 'one thousand'], [P(5), 'one hundred thousand'], [P(6), 'one million'], [P(7), 'ten million'], [P(1), 'ten']], 'Count the zeros after the 1.'),
          fill('Write each number as a power of 10. Type only the index.', [2, 8, 4, 10], '100 000 000 has eight zeros, so it is 10⁸.', { f: 'a 100 = 10^[] &nbsp; b 100 000 000 = 10^[] &nbsp; c 10 000 = 10^[] &nbsp; d 10 000 000 000 = 10^[]' }),
          fill('Copy and complete the working.', [30000, 5000000, 4500000, 291000], `3 × ${P(4)} = 3 × 10 000 = 30 000.`, { f: `a 3 × ${P(4)} = [] &nbsp; b 5 × ${P(6)} = [] &nbsp; c 45 × ${P(5)} = [] &nbsp; d 291 × ${P(3)} = []` }),
          tf(`Marcus says: “When I multiply a whole number by ${P(4)}, I just add four zeros to the end of the number.” This works for any positive whole number.`, true, 'For whole numbers, multiplying by 10ⁿ adds n zeros. It does NOT work for decimals such as 4.56.'),
          fill('Work out:', [2300, 7680000, 9000000], '768 × 10⁴ = 7 680 000.', { f: `a 23 × ${P(2)} = [] &nbsp; b 768 × ${P(4)} = [] &nbsp; c 9 × ${P(6)} = []` }),
          fill('Copy and complete the working.', [420, 65000, 12700, 2870000], `4.2 × ${P(2)} = 4.2 × 100 = 420.`, { f: `a 4.2 × ${P(2)} = [] &nbsp; b 6.5 × ${P(4)} = [] &nbsp; c 12.7 × ${P(3)} = [] &nbsp; d 2.87 × ${P(6)} = []` }),
          num(`Sofia and Maya work out 4.56 × ${P(5)}. What is the answer?`, 456000, 'Move the decimal point five places to the right and fill three empty spaces with zeros.'),
          fill('Work out:', [47000, 91500, 3300000], `0.33 × ${P(7)} = 3 300 000.`, { f: `a 4.7 × ${P(4)} = [] &nbsp; b 91.5 × ${P(3)} = [] &nbsp; c 0.33 × ${P(7)} = []` }),
          fill('Fill in the missing numbers.', [2, 6.12, 6], '32.1 × 10² = 3210; 6.12 × 10⁵ = 612 000; 124.63 × 10⁶ = 124 630 000.', { f: `a 32.1 × 10^[] = 3210 &nbsp; b [] × ${P(5)} = 612 000 &nbsp; c 124.63 × 10^[] = 124 630 000`, d: 2 }),
          fill('Copy and complete the working.', [8, 805], `80 500 000 ÷ ${P(5)} = 80 500 000 ÷ 100 000 = 805.`, { f: `a 8000 ÷ ${P(3)} = [] &nbsp; b 80 500 000 ÷ ${P(5)} = []` }),
          fill('Work out:', [8, 510, 84600], '8 460 000 000 ÷ 10⁵ = 84 600.', { f: `a 80 000 ÷ ${P(4)} = [] &nbsp; b 510 000 ÷ ${P(3)} = [] &nbsp; c 8 460 000 000 ÷ ${P(5)} = []` }),
          num(`Work out 2 350 000 ÷ ${P(5)}`, 23.5, 'Move the digits five places to the right: 23.5.'),
          fill('Work out:', [23, 2.3, 0.23, 0.023], 'Each extra power of 10 moves the digits one more place to the right.', { f: `a 230 ÷ 10 = [] &nbsp; b 230 ÷ ${P(2)} = [] &nbsp; c 230 ÷ ${P(3)} = [] &nbsp; d 230 ÷ ${P(4)} = []` }),
          fill('Work out:', [0.9, 0.09, 0.009, 0.0009], '9 ÷ 10⁴ = 0.0009.', { f: `a 9 ÷ 10 = [] &nbsp; b 9 ÷ ${P(2)} = [] &nbsp; c 9 ÷ ${P(3)} = [] &nbsp; d 9 ÷ ${P(4)} = []` }),
          mcq(`670 000 ÷ ${P(5)} = ?`, ['6.7', '670', '0.67'], 0, 'Move the digits five places right.', { fixed: true }),
          mcq(`9520 ÷ ${P(4)} = ?`, ['0.952', '9.52', '0.0952'], 0, '9520 ÷ 10 000 = 0.952.', { fixed: true }),
          mcq(`18 500 000 ÷ ${P(6)} = ?`, ['18.5', '185', '1.85'], 0, '18 500 000 ÷ 1 000 000 = 18.5.', { fixed: true }),
          fill(`Use the formulae: mm = cm × 10, mm = m × ${P(3)}, mm = km × ${P(6)}.`, [80, 150, 7000, 3400, 9000000, 600000], '9 km = 9 × 10⁶ mm = 9 000 000 mm.', { f: 'a 8 cm = [] mm &nbsp; b 15 cm = [] mm &nbsp; c 7 m = [] mm &nbsp; d 3.4 m = [] mm &nbsp; e 9 km = [] mm &nbsp; f 0.6 km = [] mm', app: true }),
          fill(`Use km = mm ÷ ${P(6)} to convert:`, [8, 90, 15.6, 0.77], '15 600 000 ÷ 1 000 000 = 15.6.', { f: 'a 8 000 000 mm = [] km &nbsp; b 90 000 000 mm = [] km &nbsp; c 15 600 000 mm = [] km &nbsp; d 770 000 mm = [] km', d: 2 }),
          sort('Classify these number cards into groups of the same value. One card is left over.', ['= 7800', '= 780', '= 78', 'left over'], [[`7.8 × ${P(3)}`, 0], ['780 × 10', 0], [`78 000 000 ÷ ${P(4)}`, 0], [`7 800 000 000 ÷ ${P(7)}`, 1], ['78 × 10', 1], [`0.00078 × ${P(6)}`, 1], [`0.0078 × ${P(4)}`, 2], ['780 ÷ 10', 2], [`78 000 ÷ ${P(3)}`, 2], [`780 × ${P(2)}`, 3]], '780 × 10² = 78 000 is the card left over.', { d: 3 }),
          fill('Work out:', [39000, 36.8], `0.39 × ${P(5)} = 39 000; 36 800 000 ÷ ${P(6)} = 36.8.`, { f: `a 0.39 × ${P(5)} = [] &nbsp; b 36 800 000 ÷ ${P(6)} = []` }),
          gen(() => { const a = pick([R(2, 99), R(10, 999) / 10, R(100, 9999) / 100, R(1, 99) / 1000]); return multQ(clean(a), R(1, 6), '×'); }),
          gen(() => { const n = R(1, 6); const a = pick([R(2, 99) * Math.pow(10, R(0, 5)), R(101, 9999)]); return multQ(a, n, '÷'); }),
          gen(() => { const n = R(2, 10); return num(`How many zeros does ${P(n)} have when written as an ordinary number?`, n, `${P(n)} is 1 followed by ${n} zeros.`); }),
          gen(() => { const a = clean(R(11, 999) / pick([10, 100])), n = R(1, 5); const res = clean(a * Math.pow(10, n)); return mcq(`${G(a)} × ${P(n)} = ?`, [G(res), G(clean(res / 10)), G(clean(res * 10)), G(clean(a + Math.pow(10, n)))].filter((x, i, arr) => arr.indexOf(x) === i), 0, `Move the digits ${n} places to the left.`); }),
          gen(() => { const km = clean(R(2, 400) / pick([1, 10, 100])); return num(`A road is ${G(km)} km long. How long is this in millimetres?`, clean(km * 1e6), `mm = km × 10⁶ = ${G(km)} × 1 000 000 = ${G(km * 1e6)} mm.`, { unit: 'mm', app: true }); }, { app: true }),
          gen(() => { const pop = R(20, 99) * 100000; return num(`A city has a population of ${G(pop)} people. Write this number divided by ${P(6)} (the population in millions).`, clean(pop / 1e6), `${G(pop)} ÷ 1 000 000 = ${G(pop / 1e6)} million.`, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '3.2', t: 'Rounding', vi: 'Làm tròn số',
        goals: ['round numbers to a given number of decimal places.'],
        body: [
          ['p', 'When you are asked to round a number, you will be told how accurate your answer should be. This is called the <b>degree of accuracy</b>. For any degree of accuracy, the method is always the same.'],
          ['list', ['Look at the digit in the position of the required degree of accuracy.', 'If the digit to its right is <b>5 or more</b>, increase the original digit by 1.', 'If the digit to its right is <b>less than 5</b>, leave the original digit as it is.']],
          ['viz', 'roundZoom'],
          ['ex', { t: 'Worked example 3.3', q: 'Round the number 5.376398 to: a one decimal place &nbsp; b three decimal places &nbsp; c five decimal places', steps: ['a: The digit in the 1st decimal place is 3; the digit to its right is 7. 7 ≥ 5, so round up: <b>5.4</b> (to 1 d.p.)', 'b: The 3rd decimal digit is 6; the next digit is 3 < 5, so the 6 stays: <b>5.376</b> (to 3 d.p.)', 'c: The 5th decimal digit is 9; the next digit is 8, so 9 rounds up to 10. This makes “39” become “40”: <b>5.37640</b> (to 5 d.p.) — you must write the zero at the end!'] }],
          ['tip', 'Fina’s method: draw a line after the last digit you need and circle the next digit: 17.8256|<b>8</b>4 → 8 ≥ 5, so 17.8257 (4 d.p.).'],
          ['viz', 'billSplit'],
          ['vi', ['“d.p.” = decimal places = số chữ số sau dấu thập phân.', 'Chữ số kế bên phải ≥ 5 → tăng 1; < 5 → giữ nguyên, bỏ các chữ số phía sau.', 'Đáp án phải có ĐÚNG số chữ số thập phân yêu cầu: 34.8972 ≈ 34.90 (2 d.p.), không viết 34.9.', 'Làm tròn 9 lên có thể “nhớ” sang chữ số trước: 99.9961 ≈ 100.0 (1 d.p.).']],
        ],
        bank: [
          fill('Round each of these numbers to two decimal places (2 d.p.).', ['8.42', '39.56', '0.49', '138.22', '0.07'], 'Look at the third decimal digit.', { f: 'a 8.421 → [] &nbsp; b 39.555 → [] &nbsp; c 0.487 → [] &nbsp; d 138.2229 → [] &nbsp; e 0.06901 → []' }),
          mcq('Arun and Sofia round 34.8972 to two decimal places. Arun says 34.9. Sofia says 34.90. Who is correct?', ['Sofia — the answer must have exactly two decimal places', 'Arun — 34.9 is the same value', 'Both are correct', 'Neither — it is 34.89'], 0, '34.89|72 → 7 ≥ 5, so 34.90. Arun forgot to write the zero.', { fixed: true }),
          mcq('Liam’s pedometer shows 9.55 km, correct to two decimal places. Which distance could Liam actually have walked?', ['9.546 km', '9.544 km', '9.556 km', '9.5 km'], 0, 'Any distance from 9.545 km up to (but not including) 9.555 km rounds to 9.55.', { d: 2 }),
          fill('Round each of these numbers to three decimal places (3 d.p.).', ['12.894', '127.997', '0.201', '9.350'], '9.349612 → 9.350 (the 9 rounds up and carries).', { f: 'a 12.8943 → [] &nbsp; b 127.99652 → [] &nbsp; c 0.20053 → [] &nbsp; d 9.349612 → []' }),
          mcq('Round 5.662198 to four decimal places.', ['5.6622', '5.6621', '5.6623'], 0, '5.6621|98 → 9 ≥ 5, round up.', { fixed: true }),
          mcq('Round 197.020549 to four decimal places.', ['197.0205', '197.0206', '197.0215'], 0, '197.0205|49 → 4 < 5, keep.', { fixed: true }),
          mcq('Round 0.0089732 to four decimal places.', ['0.0090', '0.009', '0.0089'], 0, '0.0089|732 → 7 ≥ 5: 0.0090 (keep the final zero).', { fixed: true }),
          roundQ(126.99231, 4), roundQ(0.7785, 1), roundQ(782.02972, 3), roundQ(3.141592654, 7, { d: 2 }), roundQ(3.9975, 2, { d: 2 }), roundQ(99.9961, 1, { d: 3 }),
          match('Zara’s puzzle: match each original number to its rounded number.', [['32.7819045', '32.7819 (4 d.p.)'], ['32.8729045', '32.873 (3 d.p.)'], ['32.7189045', '32.7 (1 d.p.)'], ['32.7891045', '32.789105 (6 d.p.)'], ['32.8792045', '32.88 (2 d.p.)'], ['32.8179045', '32.81790 (5 d.p.)']], 'Compare the first few digits, then check the degree of accuracy.', { d: 3 }),
          num('Work out 9 ÷ 7 on a calculator. Round your answer to 2 d.p.', 1.29, '9 ÷ 7 = 1.285714… ≈ 1.29', { dp: 2 }),
          fill('Sofia, Marcus and Arun share a bill of $46.48 equally. 46.48 ÷ 3 = 15.49333… How much does each pay if they round:', ['15', '15.5', '15.49'], 'To the nearest whole number: $15 (only $45 is collected). 1 d.p.: $15.50. 2 d.p.: $15.49 (only $46.47 is collected).', { f: 'a to the nearest whole number: $[] &nbsp; b to 1 d.p.: $[] &nbsp; c to 2 d.p.: $[]', app: true }),
          mcq('For the $46.48 bill shared by 3, which is the best rounding decision?', ['Round up to $15.50 so they do not pay too little', 'Round to $15 each', 'Round to $15.49 each', 'Round to $16 each'], 0, '$15.50 × 3 = $46.50, which covers the bill (2 cents extra). Rounding down leaves money unpaid.', { app: true, d: 2 }),
          tf('5.37640 (to 5 d.p.) can be written as 5.3764 because the final zero does not matter.', false, 'The answer must show five decimal places, so the zero must be written.'),
          gen(() => { const dp = R(1, 4); const v = clean(R(1, 999) + Math.random()); return roundQ(+v.toFixed(dp + R(2, 3)), dp); }),
          gen(() => { const dp = R(1, 3); const v = +(R(1, 99) + 1 - 4 * Math.pow(10, -(dp + 1))).toFixed(dp + 1); return roundQ(v, dp, { d: 3 }); }),
          gen(() => { const v = +(R(1, 99) + Math.random()).toFixed(4); const dp = R(1, 3); const right = rs(v, dp); const wrong1 = (Math.trunc(v * Math.pow(10, dp)) / Math.pow(10, dp)).toFixed(dp); const wrong2 = (+right + Math.pow(10, -dp)).toFixed(dp); const opts = [right, wrong1, wrong2, v.toFixed(dp + 1)].filter((x, i, a) => a.indexOf(x) === i); return mcq(`Round ${v} to ${dp} d.p.`, opts, 0, `${v} ≈ ${right} (${dp} d.p.)`); }),
          gen(() => { const tot = R(20, 150) + R(1, 99) / 100, p = pick([3, 6, 7]); const each = tot / p; return num(`${p} friends share a bill of $${tot.toFixed(2)} equally. How much should each person pay, rounded to the nearest cent (2 d.p.)?`, rnd(each, 2), `$${tot.toFixed(2)} ÷ ${p} = ${each.toFixed(5)}… ≈ $${rs(each, 2)}`, { dp: 2, pre: '$', app: true }); }, { app: true }),
          gen(() => { const pop = R(1e6, 2e8), ph = Math.round(pop * (0.4 + Math.random() * 1.6)); return num(`A country has a population of ${G(pop)} and ${G(ph)} phones. Work out the number of phones per person, rounded to 1 d.p.`, rnd(ph / pop, 1), `${G(ph)} ÷ ${G(pop)} = ${(ph / pop).toFixed(5)}… ≈ ${rs(ph / pop, 1)}`, { dp: 1, app: true, d: 2 }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Powers of Ten: a journey through scale', hero: 'heroScale',
      lead: 'Every time you multiply by 10 the world grows one step bigger. In just 31 steps you can travel from the size of an atom to the size of our galaxy.',
      leadVi: 'Mỗi lần nhân 10 là một bước phóng to. Chỉ khoảng 31 bước là đi từ kích thước nguyên tử tới cả Dải Ngân Hà.',
      cards: [
        { t: 'From atoms to galaxies', p: 'Scientists write very large and very small numbers with powers of 10. A human is about 10⁰ = 1 m tall, the Earth is about 10⁷ m wide and an atom is about 10⁻¹⁰ m. Slide to travel through the scales.', viz: 'cosmicScale' },
        { t: 'How big is a million?', p: 'A million is 10⁶. If you counted one number every second without stopping, it would take you more than 11 days to reach one million — and about 32 years to reach one billion (10⁹)!', viz: 'millionDots' },
        { t: 'Metric prefixes', p: 'The metric system is built on powers of 10. <b>kilo</b> means 10³, <b>mega</b> means 10⁶, <b>giga</b> means 10⁹ and <b>tera</b> means 10¹². A 1 TB hard drive stores about 10¹² bytes. Going the other way, <b>milli</b> means ÷10³ and <b>micro</b> means ÷10⁶.', fig: FIG.table(['Prefix', 'Symbol', 'Power', 'Example'], [['tera', 'T', '10¹²', '1 TB hard drive'], ['giga', 'G', '10⁹', '5 GHz Wi-Fi'], ['mega', 'M', '10⁶', '12 MP camera'], ['kilo', 'k', '10³', '1 km'], ['milli', 'm', '÷ 10³', '1 mm'], ['micro', 'μ', '÷ 10⁶', '1 μm bacteria']]) },
        { t: 'When rounding matters', p: 'Rounding makes numbers easy to read, but too much rounding can cause problems. In 1999 a space probe was lost partly because two teams used different units. Engineers and doctors choose a degree of accuracy that is safe for the job.', viz: 'billSplit' },
      ],
      facts: [['10¹⁰⁰', 'a googol', 'A 9-year-old boy named the number googol in 1920. The company Google was named after it.'], ['10¹¹', 'stars in the Milky Way', 'There are about 100 000 000 000 stars in our galaxy.'], ['3.7 × 10¹³', 'cells in your body', 'That is about 37 000 000 000 000 cells!'], ['1977', 'Powers of Ten film', 'A famous 9-minute film zooms out by a power of 10 every 10 seconds.']],
      challenge: { t: 'Fold to the Moon?', p: 'A sheet of paper is about 0.1 mm thick. Each time you fold it in half, the thickness doubles. After 42 folds, would the paper be thicker than the distance to the Moon (about 384 400 km)? Use 2⁴² ≈ 4.4 × 10¹².', a: '0.1 mm × 4.4 × 10¹² = 4.4 × 10¹¹ mm. Divide by 10⁶ to change mm to km: 4.4 × 10⁵ km = <b>440 000 km</b>. Yes — it is further than the Moon!' },
    },
    reading: {
      title: 'A Journey of Powers of Ten', sub: 'An article about scale. Tap any word to see its meaning.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Imagine you are lying on a picnic blanket in a park. A camera above you takes a photo of a square that is one metre wide. Now the camera moves up so that the square is ten metres wide, then one hundred metres, then one thousand metres. Each new picture is ten times wider than the one before.',
        'This simple idea was the start of a famous short film made in 1977 by the designers Charles and Ray Eames. In less than ten minutes, the film travels out to the edge of the known universe, which is about 10²⁴ metres away, and then back down into a single carbon atom inside the hand of the man on the blanket.',
        'Why do scientists use powers of ten? Writing 1 000 000 000 000 000 000 000 000 is slow, and it is very easy to miss a zero. Writing 10²⁴ is quicker and much clearer. The index tells you immediately how many places the digits have moved.',
        'Powers of ten are also part of our everyday language. When you buy a phone with 128 gigabytes of storage, “giga” means one billion, or 10⁹. A kilometre is 10³ metres, and a millimetre is one thousandth of a metre. These prefixes help people all over the world understand each other.',
        'Of course, very large numbers are often rounded. Astronomers do not know the exact distance to a galaxy, so they give an approximate value. Choosing a sensible degree of accuracy is an important skill: precise enough to be useful, but simple enough to understand.',
      ],
      gloss: [['blanket', 'tấm chăn'], ['universe', 'vũ trụ'], ['carbon atom', 'nguyên tử cacbon'], ['prefix', 'tiền tố'], ['astronomer', 'nhà thiên văn'], ['precise', 'chính xác']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'In paragraph A, each new picture is…', opts: ['ten times wider than the one before', 'twice as wide as the one before', 'one metre wider than the one before', 'the same size'], a: 0, ex: 'Paragraph A, last sentence.' },
          { type: 'mcq', q: 'What is the main purpose of paragraph C?', opts: ['to explain why powers of ten are useful', 'to describe the film', 'to give examples of prefixes', 'to talk about rounding'], a: 0, ex: 'It answers the question “Why do scientists use powers of ten?”.' },
          { type: 'mcq', q: 'The word “approximate” in paragraph E is closest in meaning to…', opts: ['close but not exact', 'very large', 'completely correct', 'secret'], a: 0, ex: 'They do not know the exact distance.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'The film was made in 1977.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'The film is more than one hour long.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'It is less than ten minutes long.' },
          { type: 'mcq', q: 'Charles and Ray Eames also made films about animals.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'The passage does not say this.' },
        ] },
        { title: 'Complete the table', note: 'Use numbers or words from the passage.', qs: [
          { type: 'fill', q: 'Complete the notes.', f: 'Prefix “giga” = one [] = 10^[] &nbsp;·&nbsp; 1 kilometre = 10^[] metres &nbsp;·&nbsp; the edge of the known universe ≈ 10^[] m', a: [['billion'], 9, 3, 24], ex: 'Paragraphs B and D.' },
          { type: 'txt', q: 'In ONE word: what is the name for the small number that shows how many 10s are multiplied (paragraph C)?', a: ['index'], ex: '“The index tells you immediately how many places the digits have moved.”' },
        ] },
      ],
    },
    listening: {
      title: 'How long is a billion seconds?', intro: 'A radio quiz show. Listen to the host and the contestant, then answer the questions.',
      voices: { Host: 'buttery', Mia: 'glassy' },
      lines: [
        { spk: 'Host', text: 'Welcome back to Number Quest! Mia, here is your next question. How long is one million seconds?' },
        { spk: 'Mia', text: 'Well, one million is ten to the power of six. There are three thousand six hundred seconds in an hour, and twenty-four hours in a day, so that is eighty-six thousand four hundred seconds in a day.' },
        { spk: 'Mia', text: 'One million divided by eighty-six thousand four hundred is about eleven point five seven. So, rounded to one decimal place, about eleven point six days.' },
        { spk: 'Host', text: 'Correct! Now for double points. How long is one billion seconds — that is ten to the power of nine?' },
        { spk: 'Mia', text: 'A billion is one thousand times bigger than a million. So it is about eleven thousand six hundred days. Dividing by three hundred and sixty-five gives about thirty-one point seven years.' },
        { spk: 'Host', text: 'Amazing! So a billion seconds ago, most of our parents were still children. Mia, you now have two hundred points!' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Write the numbers you hear.', f: 'Seconds in an hour: [] &nbsp; Seconds in a day: [] &nbsp; One million seconds ≈ [] days (1 d.p.) &nbsp; One billion seconds ≈ [] years', a: [3600, 86400, 11.6, 31.7], ex: '1 000 000 ÷ 86 400 ≈ 11.57 ≈ 11.6 days; about 31.7 years.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'How does Mia describe one billion?', opts: ['one thousand times bigger than a million', 'ten times bigger than a million', 'one million times bigger than a thousand', 'the same as a million'], a: 0, ex: '“A billion is one thousand times bigger than a million.”' },
          { type: 'mcq', q: 'One billion written as a power of ten is…', opts: ['10⁹', '10⁶', '10¹²', '10³'], a: 0, ex: '“ten to the power of nine”.' },
          { type: 'num', q: 'How many points does Mia have at the end?', a: 200, ex: '“You now have two hundred points!”' },
          { type: 'tf', q: 'Mia rounds her first answer to two decimal places.', a: false, ex: 'She rounds to one decimal place: 11.6 days.' },
        ] },
      ],
    },
  });
})();
