/* Unit 4 — Decimals */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, gen } = Q;
  const C = (v) => parseFloat(Number(v).toPrecision(12));
  const dpOf = (v) => { const t = String(C(v)); return t.includes('.') ? t.split('.')[1].length : 0; };
  const rnd = (v, dp) => Number(Math.round(Number(C(v) + 'e' + dp)) + 'e-' + dp);
  const money = (v) => '$' + Number(v).toFixed(2);

  /* ---------- widgets ---------- */
  APP.viz.decOrder = function (el) {
    const f = VZ.frame(el, 'So sánh & sắp xếp số thập phân', { icon: 'chart' });
    const sets = [[2.82, 2.6, 2.816], [4.23, 4.6, 4.179], [6.8, 4.23, 7.811, 0.77], [5.212, 5.2, 5.219, 5.199], [0.71, 0.52, 0.77, 0.59], [9.08, 9.7, 9.901, 9.03, 9.99]];
    let k = 0, sorted = false; const st = h('div', { style: { display: 'grid', gap: '12px' } }); f.stage.append(st);
    function draw() {
      const xs = sets[k]; const dp = Math.max(...xs.map(dpOf)); const list = sorted ? xs.slice().sort((a, b) => a - b) : xs;
      const tbl = h('div', { style: { display: 'grid', gap: '6px' } });
      list.forEach((x, i) => { const [ip, dpart = ''] = x.toFixed(dp).split('.'); const orig = dpOf(x); tbl.append(h('div', { class: 'mono', style: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700, animation: `stepIn .4s ${i * 0.07}s both` } }, h('span', { style: { width: '2.2em', textAlign: 'right', color: 'var(--ink-3)', fontSize: '.8rem' } }, sorted ? '#' + (i + 1) : ''), h('span', { html: `${ip}.<span>${dpart.slice(0, orig)}</span><span style="color:var(--accent);opacity:.8">${dpart.slice(orig)}</span>` }), h('div', { style: { height: '14px', borderRadius: '7px', background: 'var(--sc)', width: Math.max(4, (x / Math.max(...xs)) * 55) + '%', transition: 'width .5s' } }))); });
      const lo = Math.min(...xs), hi = Math.max(...xs), span = hi - lo; const stp = span > 2 ? 1 : span > 0.25 ? 0.1 : 0.01; const a = Math.floor(lo / stp - 1e-9) * stp, b = Math.ceil(hi / stp + 1e-9) * stp;
      const nl = h('div', { html: FIG.numberLine(C(a), C(b), { w: 620, step: stp, major: stp === 0.01 ? 0.05 : stp, marks: xs.map((x, i) => ({ v: x, label: N(x), color: ['var(--bad)', 'var(--number)', 'var(--geometry)', 'var(--stats)', 'var(--algebra)', 'var(--accent)'][i] })) }) });
      st.innerHTML = ''; st.append(tbl, nl);
      f.out.innerHTML = sorted ? 'Thứ tự từ bé đến lớn: <b>' + list.map((x) => N(x)).join(' &lt; ') + '</b>' : `Cách của Ulrika: thêm chữ số 0 (màu cam) để mọi số có ${dp} chữ số thập phân, rồi so sánh như số nguyên.`;
    }
    f.ctrls.append(VZ.btn('Sắp xếp ▶', () => { sorted = true; SFX.play('whoosh'); draw(); }, 'btn sm sc'), VZ.btn('Bộ số khác', () => { k = (k + 1) % sets.length; sorted = false; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.colCalc = function (el) {
    const f = VZ.frame(el, 'Cộng / trừ theo cột (thẳng hàng dấu phẩy)', { icon: 'pencil' });
    const ex = [[27.52, 4.8, '+'], [43.6, 5.45, '−'], [38.15, 8.4, '+'], [10, 4.83, '−'], [25.81, 4.1, '−'], [4.56, 8.35, '+']];
    let k = 0, step = 0; const st = h('div', { style: { overflowX: 'auto' } }); f.stage.append(st);
    function cols(a, b, op) {
      const dp = Math.max(dpOf(a), dpOf(b)); const A = Math.round(a * Math.pow(10, dp)), B = Math.round(b * Math.pow(10, dp)); const Rr = op === '+' ? A + B : A - B;
      const len = Math.max(String(A).length, String(B).length, String(Rr).length, dp + 1);
      const da = String(A).padStart(len, ' ').split(''), db = String(B).padStart(len, ' ').split(''), dr = String(Rr).padStart(len, ' ').split('');
      // carries/borrows per column, from right
      const marks = Array(len).fill(''); if (op === '+') { let c = 0; for (let i = len - 1; i >= 0; i--) { const sm = (+da[i] || 0) + (+db[i] || 0) + c; c = sm >= 10 ? 1 : 0; if (c && i > 0) marks[i - 1] = '1'; } }
      else { const ta = da.map((x) => +x || 0); for (let i = len - 1; i >= 0; i--) { const bb = +db[i] || 0; if (ta[i] < bb) { let j = i - 1; while (j >= 0 && ta[j] === 0) { ta[j] = 9; marks[j] = '9'; j--; } if (j >= 0) { ta[j] -= 1; marks[j] = String(ta[j]); } ta[i] += 10; marks[i] = (marks[i] ? '' : '') + String(ta[i]); } } }
      return { dp, len, da, db, dr, marks };
    }
    function draw() {
      const [a, b, op] = ex[k]; const c0 = cols(a, b, op === '−' ? '-' : '+'); const { dp, len, da, db, dr, marks } = c0; const pt = len - dp; // index where decimal point is inserted before
      const cw = 34, W = (len + 2) * cw + 20, H = 190; let g = `<svg viewBox="0 0 ${W} ${H}" style="max-width:${W * 1.3}px;width:100%">`;
      const X = (i) => 20 + cw + i * cw + (i >= pt ? 10 : 0); const shown = Math.min(step, len);
      const row = (arr, y, col, pad) => arr.map((d, i) => d.trim() ? `<text x="${X(i)}" y="${y}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="26" font-weight="700" fill="${pad && i >= pt && i - pt >= dpOf(pad === 'a' ? a : b) ? 'var(--accent)' : col}">${d}</text>` : '').join('');
      g += row(da, 70, 'var(--ink)', 'a') + row(db, 110, 'var(--ink)', 'b');
      g += `<text x="${20}" y="110" font-size="26" font-weight="800" fill="var(--sc)">${op}</text><line x1="14" y1="124" x2="${W - 10}" y2="124" stroke="var(--ink-2)" stroke-width="2.5"/>`;
      [70, 110, 160].forEach((y) => { g += `<circle cx="${X(pt) - cw / 2 - 5 + 10 - 5}" cy="${y - 2}" r="3.5" fill="var(--bad)"/>`; });
      for (let t = 0; t < shown; t++) { const i = len - 1 - t; if (dr[i].trim()) g += `<text x="${X(i)}" y="160" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="26" font-weight="800" fill="var(--good)" style="animation:popIn .35s both">${dr[i]}</text>`; if (op === '+' && marks[i - 1] && t < shown) g += `<text x="${X(i - 1)}" y="30" text-anchor="middle" font-size="15" font-weight="800" fill="var(--bad)">${marks[i - 1]}</text>`; if (op === '−' && marks[i] && t < shown) g += `<text x="${X(i) + 12}" y="44" text-anchor="middle" font-size="13" font-weight="800" fill="var(--bad)">${marks[i]}</text>`; }
      g += '</svg>'; st.innerHTML = g;
      const res = op === '+' ? a + b : a - b; const done = step >= len;
      const colNames = ['hundredths', 'tenths', 'units', 'tens', 'hundreds']; const curName = colNames[step - 1 + (2 - dp)] || '';
      f.out.innerHTML = step === 0 ? `Viết ${N(a)} ${op} ${N(b)} theo cột, dấu phẩy thẳng hàng; thêm chữ số 0 (cam) cho đủ ${dp} chữ số thập phân.` : done ? `${N(a)} ${op} ${N(b)} = <b style="color:var(--good)">${N(C(res))}</b>` : `Đang tính cột thứ ${step} từ phải sang${curName ? ' (' + curName + ')' : ''}… ${op === '+' ? 'nhớ 1 nếu tổng ≥ 10' : 'mượn 1 từ cột bên trái nếu không trừ được'}.`;
    }
    f.ctrls.append(VZ.btn('Bước tiếp ▶', () => { step++; SFX.play('pop'); draw(); }, 'btn sm sc'), VZ.btn('Bài khác', () => { k = (k + 1) % ex.length; step = 0; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.decGrid = function (el) {
    const f = VZ.frame(el, 'Nhân số thập phân: bỏ dấu phẩy → nhân → đặt lại dấu phẩy', { icon: 'grid' });
    let a = 0.45, b = 372; const st = h('div'); f.stage.append(st);
    const inA = h('input', { type: 'text', inputmode: 'decimal', value: '0.45', style: { width: '90px', fontFamily: 'var(--f-mono)' }, 'aria-label': 'Số thập phân' });
    const inB = h('input', { type: 'text', inputmode: 'numeric', value: '372', style: { width: '80px', fontFamily: 'var(--f-mono)' }, 'aria-label': 'Số nguyên' });
    function parts(n) { const out = []; String(n).split('').forEach((d, i, arr) => { if (+d) out.push(+d * Math.pow(10, arr.length - 1 - i)); }); return out.length ? out : [0]; }
    function draw() {
      a = parseFloat(String(inA.value).replace(',', '.')); b = parseInt(inB.value, 10); if (isNaN(a) || isNaN(b) || b > 9999 || a > 999) return;
      const dp = dpOf(a); const A = Math.round(a * Math.pow(10, dp)); const pa = parts(A), pb = parts(b); const tot = A * b;
      let tb = '<div class="tbl"><table><tr><th>×</th>' + pb.map((x) => `<th>${x}</th>`).join('') + '<th>Total</th></tr>';
      pa.forEach((x, i) => { tb += `<tr><th>${x}</th>` + pb.map((y, j) => `<td style="animation:popIn .3s ${(i * pb.length + j) * 0.05}s both">${x * y}</td>`).join('') + `<td><b>${x * b}</b></td></tr>`; });
      tb += '</table></div>'; st.innerHTML = tb;
      f.out.innerHTML = `${A} × ${b} = ${tot}. ${N(a)} có <b>${dp}</b> chữ số sau dấu phẩy → ${N(a)} × ${b} = <b style="color:var(--accent)">${N(C(tot / Math.pow(10, dp)))}</b> · Ước lượng: ${N(rnd(a, a < 1 ? 1 : 0))} × ${N(Number(b).toPrecision(1) * 1)} = ${N(C(rnd(a, a < 1 ? 1 : 0) * Number(Number(b).toPrecision(1))))}`;
    }
    inA.oninput = draw; inB.oninput = draw;
    f.ctrls.append(h('label', {}, 'Số thập phân', inA), h('label', {}, '× số nguyên', inB));
    draw();
  };
  APP.viz.shortDiv = function (el) {
    const f = VZ.frame(el, 'Chia ngắn (short division) từng bước', { icon: 'pencil' });
    const ex = [['4.258', 2], ['41.481', 18], ['9.28', 8], ['18.25', 5], ['112.4', 16], ['145.5', 6], ['8.46', 7]];
    let k = 1, step = 0; const st = h('div', { style: { overflowX: 'auto' } }); f.stage.append(st);
    function plan(str, d) {
      const digs = str.split(''); const q = [], carry = [], info = []; let rem = 0, extra = 0;
      for (let i = 0; i < digs.length; i++) {
        const ch = digs[i]; if (ch === '.') { q.push('.'); carry.push(''); info.push('Viết dấu phẩy ở thương, thẳng hàng với dấu phẩy của số bị chia.'); continue; }
        const cin = rem; const cur = rem * 10 + +ch; const qd = Math.floor(cur / d); rem = cur % d; q.push(String(qd)); carry.push(cin ? String(cin) : ''); info.push(`${cur} ÷ ${d} = ${qd}${rem ? ' dư ' + rem + ' → nhớ ' + rem + ' sang chữ số tiếp theo' : ' (vừa hết)'}`);
        if (i === digs.length - 1 && rem && extra < (d > 9 ? 3 : 4)) { if (!digs.includes('.')) digs.push('.'); digs.push('0'); extra++; }
      }
      return { digs, q, carry, info, rem };
    }
    function draw() {
      const [str, d] = ex[k]; const p = plan(str, d); const n = p.digs.length; const cw = 30, x0 = 20 + String(d).length * 18 + 16, W = x0 + n * cw + 20, H = 130; const shown = Math.min(step, n);
      const pIdx = p.q.indexOf('.'); const intEnd = pIdx < 0 ? p.q.length : pIdx; let firstNZ = 0; while (firstNZ < intEnd - 1 && p.q[firstNZ] === '0') firstNZ++;
      let g = `<svg viewBox="0 0 ${W} ${H}" style="max-width:${W * 1.4}px;width:100%"><text x="${x0 - 14}" y="96" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="26" font-weight="700" fill="var(--sc)">${d}</text>`;
      g += `<path d="M${x0 - 6} 108 Q ${x0 + 2} 90 ${x0 - 2} 62 L ${W - 8} 62" fill="none" stroke="var(--ink-2)" stroke-width="2.5"/>`;
      p.digs.forEach((c, i) => { const x = x0 + 8 + i * cw + cw / 2; const isExtra = i >= str.length; g += `<text x="${x}" y="96" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="26" font-weight="700" fill="${isExtra ? 'var(--accent)' : 'var(--ink)'}">${c}</text>`; if (i < shown && p.carry[i]) g += `<text x="${x - 12}" y="80" text-anchor="middle" font-size="13" font-weight="800" fill="var(--bad)">${p.carry[i]}</text>`; if (i < shown) g += `<text x="${x}" y="48" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="26" font-weight="800" fill="${i < firstNZ && p.q[i] === '0' ? 'var(--ink-3)' : 'var(--good)'}" style="animation:popIn .3s both">${p.q[i]}</text>`; });
      g += '</svg>'; st.innerHTML = g;
      const ans = p.q.join('').replace(/^0+(?=\d)/, '');
      f.out.innerHTML = step === 0 ? `${str} ÷ ${d}: chia từ trái sang phải, như chia số nguyên.` : step >= n ? `${str} ÷ ${d} = <b style="color:var(--good)">${ans}</b>${p.rem ? '… (chia tiếp được nữa — làm tròn nếu cần)' : ''} · Kiểm tra ngược: ${ans} × ${d} ${p.rem ? '≈' : '='} ${str}` : p.info[step - 1];
    }
    f.ctrls.append(VZ.btn('Bước tiếp ▶', () => { step++; SFX.play('pop'); draw(); }, 'btn sm sc'), VZ.btn('Bài khác', () => { k = (k + 1) % ex.length; step = 0; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.easyCalc = function (el) {
    const f = VZ.frame(el, 'Mẹo tính nhanh với số thập phân', { icon: 'bulb' });
    const tricks = {
      pv: { name: '0.06 × 3500', steps: ['0.06 = 6 ÷ 100', '0.06 × 3500 = 6 × 3500 ÷ 100', '= 6 × 35', '= 6 × 30 + 6 × 5 = 180 + 30', '= <b>210</b>'] },
      nine: { name: '8.2 × 9', steps: ['9 = 10 − 1', '8.2 × 9 = 8.2 × 10 − 8.2 × 1', '= 82 − 8.2', '= 82 − 8 − 0.2 = 74 − 0.2', '= <b>73.8</b>'] },
      div: { name: '12.56 ÷ 40', steps: ['Chia cả hai cho 10: 12.56 ÷ 40 = 1.256 ÷ 4', '1.256 ÷ 4 bằng chia ngắn', '= <b>0.314</b>'] },
      part: { name: '7.6 × 8', steps: ['Tách 7.6 = 7 + 0.6', '7 × 8 = 56', '0.6 × 8 = 4.8', '56 + 4.8 = <b>60.8</b>'] },
      round: { name: '6.9 + 12.4', steps: ['Làm tròn 6.9 lên 7 (thêm 0.1)', '7 + 12.4 = 19.4', 'Trừ lại 0.1: 19.4 − 0.1 = <b>19.3</b>'] },
    };
    let key = 'pv', k = 0; const box = h('div', { class: 'stack', style: { gap: '6px', minHeight: '150px' } }); f.stage.append(box);
    function draw() { box.innerHTML = ''; box.append(h('div', { style: { fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--sc)' } }, tricks[key].name + ' = ?')); tricks[key].steps.slice(0, k + 1).forEach((t, i) => box.append(h('div', { class: 'mono', style: { animation: 'stepIn .35s both', fontWeight: 600 }, html: (i ? '' : '') + t }))); f.out.textContent = k < tricks[key].steps.length - 1 ? 'Bấm “Bước tiếp” để xem cách làm.' : 'Xong! Cách này dễ tính nhẩm hơn nhiều.'; }
    f.ctrls.append(VZ.seg(Object.keys(tricks).map((t) => [t, tricks[t].name]), key, (v) => { key = v; k = 0; draw(); }), VZ.btn('Bước tiếp ▶', () => { if (k < tricks[key].steps.length - 1) { k++; SFX.play('pop'); draw(); } }, 'btn sm sc'));
    draw();
  };
  // explore
  APP.viz.heroTrack = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      const g = c.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#0b1d3a'); g.addColorStop(1, '#1d3d6e'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
      const lanes = 5, top = hh * 0.42, lh = (hh * 0.5) / lanes; c.fillStyle = '#b5482d'; c.fillRect(0, top, w, lh * lanes);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; for (let i = 0; i <= lanes; i++) { c.beginPath(); c.moveTo(0, top + i * lh); c.lineTo(w, top + i * lh); c.stroke(); }
      const fin = w * 0.88; c.fillStyle = '#fff'; c.fillRect(fin, top, 4, lh * lanes);
      const T = (t % 6) / 5; const sp = [1.0, 0.985, 0.97, 0.992, 0.978];
      sp.forEach((v, i) => { const x = Math.min(fin + 20, w * 0.05 + T * v * (fin - w * 0.05) * 1.02); const y = top + i * lh + lh / 2; c.fillStyle = ['#ffd166', '#06d6a0', '#ef476f', '#8ecae6', '#c77dff'][i]; c.beginPath(); c.arc(x, y - 2 + Math.sin(t * 20 + i) * 2, lh * 0.28, 0, 7); c.fill(); });
      const secs = Math.min(10.49, T * 10.6); c.fillStyle = '#fff'; c.font = `800 ${Math.round(hh * 0.16)}px "JetBrains Mono", monospace`; c.textAlign = 'right'; c.fillText(secs.toFixed(2), w * 0.95, hh * 0.3); c.textAlign = 'left';
    });
  };
  APP.viz.sprint = function (el) {
    const f = VZ.frame(el, 'Chạy 100 m: mỗi phần trăm giây đều quan trọng', { icon: 'clock' });
    const data = [['Kerron Stewart', 10.75], ['Marion Jones', 10.65], ['Merlene Ottey', 10.74], ['Carmelita Jeter', 10.64], ['Shelly-Ann Fraser', 10.73], ['Florence Griffith-Joyner', 10.49]];
    const W = 620, lh = 34, H = data.length * lh + 30; const svg = VZ.svg(W, H); f.stage.append(svg); let raf;
    function race() {
      cancelAnimationFrame(raf); const t0 = performance.now(); const L = 150, Rr = W - 70;
      const tick = (now) => { const tt = (now - t0) / 1000 * 2.2; svg.innerHTML = ''; svg.append(s('line', { x1: Rr, y1: 0, x2: Rr, y2: H - 20, stroke: 'var(--bad)', 'stroke-width': 3, 'stroke-dasharray': '6 4' }));
        data.forEach(([n, tm], i) => { const y = 14 + i * lh; const p = Math.min(1, tt / tm); svg.append(s('rect', { x: L, y, width: Rr - L, height: lh - 8, rx: 6, fill: 'var(--surface-3)' }), s('rect', { x: L, y, width: (Rr - L) * p, height: lh - 8, rx: 6, fill: p >= 1 ? 'var(--good)' : 'var(--sc)' }), s('text', { x: L - 8, y: y + 18, 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: 'var(--ink)', text: n.split(' ').slice(-1)[0] })); if (p >= 1) svg.append(s('text', { x: Rr + 8, y: y + 18, 'font-size': 14, 'font-weight': 800, fill: 'var(--ink)', 'font-family': 'var(--f-mono)', text: tm.toFixed(2) })); });
        if (tt < 11) raf = requestAnimationFrame(tick); else { SFX.play('complete'); f.out.innerHTML = 'Thứ tự về đích: ' + data.slice().sort((a, b) => a[1] - b[1]).map((d, i) => `${i + 1}. ${d[0].split(' ').slice(-1)[0]} (${d[1].toFixed(2)})`).join(' · '); } };
      raf = requestAnimationFrame(tick); f.out.textContent = 'Đang chạy…';
    }
    f.ctrls.append(VZ.btn('Xuất phát! ▶', race, 'btn sm sc'));
    VZ.when(svg, race);
  };
  APP.viz.exchange = function (el) {
    const f = VZ.frame(el, 'Đổi tiền: nhân số thập phân ngoài đời thực', { icon: 'shuffle' });
    const rates = { 'GBP → USD': 1.29, 'USD → VND': 25400, 'EUR → USD': 1.08, 'USD → THB': 35.6 };
    let key = 'GBP → USD', amt = 275; const st = h('div', { style: { fontFamily: 'var(--f-display)', fontSize: 'clamp(1.2rem,4vw,1.8rem)', fontWeight: 800, textAlign: 'center', padding: '12px' } }); f.stage.append(st);
    function draw() { const r = rates[key]; const [a, b] = key.split(' → '); st.innerHTML = `${amt} ${a} × ${N(r)} = <span style="color:var(--accent)">${(amt * r).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, ' ')} ${b}</span>`; f.out.innerHTML = `Ước lượng: ${amt} × ${N(r < 10 ? rnd(r, 0) || 1 : Number(r.toPrecision(1)))} ≈ ${(amt * (r < 10 ? rnd(r, 0) || 1 : Number(r.toPrecision(1)))).toLocaleString('en-US').replace(/,/g, ' ')} — dùng để kiểm tra đáp án có hợp lí không.`; }
    f.ctrls.append(VZ.seg(Object.keys(rates).map((k) => [k, k]), key, (v) => { key = v; draw(); }), VZ.range('Số tiền', 10, 1000, amt, 5, (v) => { amt = v; draw(); }));
    draw();
  };
  APP.viz.stevin = function (el) {
    const f = VZ.frame(el, 'Cách viết số thập phân của Simon Stevin (1585)', { icon: 'book' });
    let v = '3.759'; const inp = h('input', { type: 'text', inputmode: 'decimal', value: v, style: { width: '120px', fontFamily: 'var(--f-mono)' }, 'aria-label': 'Số thập phân' }); const st = h('div', { style: { display: 'flex', gap: '4px', alignItems: 'flex-end', flexWrap: 'wrap', fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 800, padding: '10px 0' } }); f.stage.append(st);
    function draw() { v = String(inp.value).replace(',', '.'); if (!/^\d+(\.\d+)?$/.test(v)) return; const [i, d = ''] = v.split('.'); st.innerHTML = ''; const pieces = [[i, 0], ...d.split('').map((c, k) => [c, k + 1])]; pieces.forEach(([c, k], j) => st.append(h('span', { style: { display: 'inline-flex', alignItems: 'flex-start', animation: `popIn .3s ${j * 0.08}s both` } }, c, h('span', { style: { display: 'inline-grid', placeItems: 'center', width: '1.2em', height: '1.2em', border: '2px solid var(--sc)', borderRadius: '50%', fontSize: '.45em', color: 'var(--sc)', marginLeft: '2px' } }, String(k))))); f.out.innerHTML = `Stevin viết ${v} như trên: số trong vòng tròn cho biết vị trí (⓪ đơn vị, ① phần mười, ② phần trăm…). Ngày nay ta chỉ cần một dấu chấm/phẩy!`; }
    inp.oninput = draw; f.ctrls.append(h('label', {}, 'Số:', inp)); draw();
  };

  /* ---------- helpers ---------- */
  const twoDp = (lo, hi) => C(R(lo * 100, hi * 100) / 100);
  const oneDp = (lo, hi) => C(R(lo * 10, hi * 10) / 10);

  APP.addUnit({
    n: 4, strand: 'number', title: 'Decimals', vi: 'Số thập phân',
    blurb: 'The decimal system is a number system based on 10. You can write all the numbers using just the ten digits 0 to 9. Many countries use a decimal system for their currency: 1 dollar = 100 cents, 1 yuan = 100 fen, 1 baht = 100 satang. In this unit you order, add, subtract, multiply and divide decimals.',
    blurbVi: 'Hệ thập phân dựa trên cơ số 10. Chương này học so sánh, sắp xếp, cộng, trừ, nhân, chia số thập phân và các mẹo tính nhanh.',
    words: [['decimal', 'số thập phân'], ['decimal point', 'dấu thập phân'], ['decimal part', 'phần thập phân'], ['whole-number part', 'phần nguyên'], ['tenths', 'phần mười'], ['hundredths', 'phần trăm (hàng)'], ['thousandths', 'phần nghìn'], ['compare', 'so sánh'], ['order', 'sắp xếp thứ tự'], ['mental method', 'phương pháp tính nhẩm'], ['written method', 'phương pháp tính viết'], ['carry', 'nhớ'], ['borrow', 'mượn'], ['short division', 'chia ngắn'], ['remainder', 'số dư'], ['estimation', 'ước lượng'], ['inverse calculation', 'phép tính ngược'], ['partitioning', 'tách số'], ['equivalent fraction', 'phân số bằng nhau'], ['currency', 'tiền tệ']],
    chat: ['Vì sao 8.27 nhỏ hơn 8.4?', 'Cách tính 43.6 − 5.45 theo cột', 'Mẹo tính 12.56 ÷ 40'],
    sections: [
      {
        id: '4.1', t: 'Ordering decimals', vi: 'Sắp xếp số thập phân',
        goals: ['compare and order decimals.'],
        body: [
          ['p', 'To order decimal numbers, you write them from the smallest to the largest. First, compare the <b>whole-number part</b> of the numbers. For 8.9, 14.639 and 6.45 the whole-number parts are 8, 14 and 6, so the order is <b>6.45, 8.9, 14.639</b>.'],
          ['p', 'When numbers have the same whole-number part, you must first compare the <b>tenths</b>, then the <b>hundredths</b>, and so on. For 2.82, 2.6, 2.816: 2.6 has the fewest tenths. 2.82 and 2.816 both have 8 tenths, so compare the hundredths: 1 &lt; 2. The order is <b>2.6, 2.816, 2.82</b>.'],
          ['viz', 'decOrder'],
          ['ex', { t: 'Worked example 4.1', q: 'Write the decimal numbers in order of size: a 6.8, 4.23, 7.811, 0.77 &nbsp; b 4.66, 4.6, 4.08', steps: ['a: The whole-number parts are all different (0, 4, 6, 7): <b>0.77, 4.23, 6.8, 7.811</b>', 'b: All have 4 units. Compare tenths: 4.08 has 0 tenths, so it comes first.', '4.6 and 4.66 both have 6 tenths. 4.6 = 4.60 has 0 hundredths: <b>4.08, 4.6, 4.66</b>'] }],
          ['tip', 'Marcus thinks 8.27 &gt; 8.4 “because 27 is greater than 4”. Wrong! Compare tenths: 2 tenths &lt; 4 tenths, so 8.27 &lt; 8.4. Ulrika’s method: write 8.4 as 8.40, then compare 27 and 40.'],
          ['table', ['Symbol', 'Meaning', 'Example'], [['&lt;', 'is less than', '4.07 &lt; 4.15'], ['&gt;', 'is greater than', '2.167 &gt; 2.163'], ['=', 'is equal to', '8.9 = 8.90'], ['≠', 'is not equal to', '0.183 ≠ 0.18']]],
          ['vi', ['So sánh phần nguyên trước; nếu bằng nhau thì so sánh hàng phần mười, rồi phần trăm, phần nghìn…', 'Có thể thêm chữ số 0 vào cuối phần thập phân mà giá trị không đổi: 4.6 = 4.60 = 4.600.', 'Số có nhiều chữ số thập phân hơn KHÔNG nhất thiết lớn hơn: 8.27 < 8.4.', 'Đổi về cùng đơn vị trước khi so sánh số đo (cL, mL, L…).']],
        ],
        bank: [
          fill('For each pair, write down the smaller decimal number.', [9.99, 3.67, 12.56, 0.67, 3.21, 18.45, 0.043, 0.09], '0.043 < 0.05 because 4 hundredths < 5 hundredths.', { f: 'a 13.5, 9.99 → [] &nbsp; b 4.32, 3.67 → [] &nbsp; c 12.56, 21.652 → [] &nbsp; d 0.67, 0.72 → [] &nbsp; e 3.4, 3.21 → [] &nbsp; f 18.54, 18.45 → [] &nbsp; g 0.05, 0.043 → [] &nbsp; h 0.09, 0.1 → []' }),
          order('The table shows six of the fastest women’s 100 m times. Write the times in order of size, smallest first.', ['10.49', '10.64', '10.65', '10.73', '10.74', '10.75'], 'All have 10 seconds; compare tenths then hundredths.', { fig: FIG.table(['Name', 'Country', 'Year', 'Time (s)'], [['Kerron Stewart', 'Jamaica', '2009', '10.75'], ['Marion Jones', 'USA', '1998', '10.65'], ['Merlene Ottey', 'Jamaica', '1996', '10.74'], ['Carmelita Jeter', 'USA', '2009', '10.64'], ['Shelly-Ann Fraser', 'Jamaica', '2009', '10.73'], ['Florence Griffith-Joyner', 'USA', '1988', '10.49']]) }),
          mcq('Using the same table (10.75, 10.65, 10.74, 10.64, 10.73, 10.49), which woman has the fourth fastest time?', ['Shelly-Ann Fraser (10.73)', 'Merlene Ottey (10.74)', 'Marion Jones (10.65)', 'Carmelita Jeter (10.64)'], 0, 'Order: 10.49, 10.64, 10.65, 10.73 — the fourth is 10.73.', { d: 2 }),
          mcq('Marcus says: “8.27 is greater than 8.4 because 27 is greater than 4.” Is Marcus correct?', ['No — 8.4 = 8.40 and 40 hundredths > 27 hundredths', 'Yes — 27 is greater than 4', 'No — they are equal', 'Yes — 8.27 has more digits'], 0, 'Compare tenths: 2 < 4, so 8.27 < 8.4.'),
          fill('Write the correct sign, &lt; or &gt;, between each pair of numbers.', [{ opts: ['&lt;', '&gt;'], a: 0 }, { opts: ['&lt;', '&gt;'], a: 0 }, { opts: ['&lt;', '&gt;'], a: 1 }, { opts: ['&lt;', '&gt;'], a: 1 }, { opts: ['&lt;', '&gt;'], a: 0 }, { opts: ['&lt;', '&gt;'], a: 1 }], '2.19 < 2.205 because 19 hundredths = 190 thousandths < 205 thousandths.', { f: 'a 6.03 [] 6.24 &nbsp; b 0.49 [] 0.51 &nbsp; c 18.05 [] 18.02 &nbsp; d 9.2 [] 9.01 &nbsp; e 2.19 [] 2.205 &nbsp; f 0.072 [] 0.06' }),
          fill('Write the correct sign, = or ≠, between each pair of numbers.', [{ opts: ['=', '≠'], a: 0 }, { opts: ['=', '≠'], a: 1 }, { opts: ['=', '≠'], a: 1 }, { opts: ['=', '≠'], a: 0 }, { opts: ['=', '≠'], a: 0 }, { opts: ['=', '≠'], a: 1 }], 'Zeros at the END of the decimal part do not change the value.', { f: 'a 4.2 [] 4.20 &nbsp; b 3.75 [] 3.57 &nbsp; c 0.340 [] 0.304 &nbsp; d 9.58 [] 9.580 &nbsp; e 128.00 [] 128 &nbsp; f 0.0034 [] 0.034' }),
          order('Use Ulrika’s method to write the numbers in order of size.', ['2.009', '2.15', '2.7'], '2.700, 2.150, 2.009 → compare 700, 150, 9.'),
          order('Write the numbers in order of size.', ['3.2', '3.342', '3.45'], '3.200, 3.342, 3.450.'),
          order('Write the numbers in order of size.', ['17.05', '17.1', '17.125', '17.42'], '17.050, 17.100, 17.125, 17.420.'),
          order('Write the numbers in order of size.', ['5.199', '5.2', '5.212', '5.219'], '5.199, 5.200, 5.212, 5.219.', { d: 2 }),
          order('Write the numbers in order of size.', ['9.03', '9.08', '9.7', '9.901', '9.99'], '9.030, 9.080, 9.700, 9.901, 9.990.', { d: 2 }),
          order('Write these amounts in order of size (10 mL = 1 cL, 100 cL = 1 L).', ['300 mL', '38.1 cL', '0.385 L'], '300 mL = 30 cL; 0.385 L = 38.5 cL. So 30 < 38.1 < 38.5.', { d: 2 }),
          order('Write these lengths in order of size.', ['7.3 cm', '0.705 m', '725 mm'], '7.3 cm = 73 mm; 0.705 m = 705 mm.', { d: 2 }),
          order('Write these masses in order of size.', ['519 000 mg', '530 g', '5.12 kg', '0.0058 t'], '519 000 mg = 519 g; 0.0058 t = 5.8 kg = 5800 g; 5.12 kg = 5120 g.', { d: 3 }),
          num('Brad puts three decimal cards in order of size: 3.07 &lt; ■ &lt; 3.083. The middle card has a number with three decimal places. How many different numbers could be on the middle card?', 12, 'The middle number is 3.071, 3.072, …, 3.082 — that is 12 numbers.', { d: 3 }),
          gen(() => { const base = R(1, 20); const xs = U.sample([0.1, 0.15, 0.105, 0.5, 0.05, 0.501, 0.09, 0.9, 0.099, 0.45, 0.405], 4).map((d) => C(base + d)); return order('Write these decimals in order of size, smallest first.', xs.slice().sort((a, b) => a - b).map((x) => N(x)), 'Same whole-number part: compare tenths, then hundredths, then thousandths.'); }),
          gen(() => { const a = C(R(1, 30) + R(1, 99) / 100), b = C(Math.floor(a) + pick([R(1, 9) / 10, R(1, 999) / 1000])); if (a === b) return null; return mcq(`Which sign makes this true? ${N(a)} ☐ ${N(b)}`, ['&lt;', '&gt;', '='], a < b ? 0 : 1, `Compare place by place: ${N(Math.min(a, b))} is smaller.`, { fixed: true }); }),
          gen(() => { const t = shuffle([12.31, 12.4, 12.09, 12.35, 12.3].map((x) => C(x + pick([0, 1])))); const names = ['Lan', 'Minh', 'An', 'Bao', 'Chi']; const best = t.indexOf(Math.min(...t)); return mcq(`In a swimming race the times (seconds) are: ${names.map((n, i) => n + ' ' + t[i].toFixed(2)).join(', ')}. Who won?`, names, best, `The winner has the smallest time: ${t[best].toFixed(2)} s.`, { app: true, fixed: true }); }, { app: true }),
        ],
      },
      {
        id: '4.2', t: 'Adding and subtracting decimals', vi: 'Cộng và trừ số thập phân',
        goals: ['add and subtract decimals.'],
        body: [
          ['p', 'When you add and subtract decimal numbers <b>mentally</b>, there are different methods you can use:'],
          ['list', ['<b>Adding</b>: separate the numbers into whole-number parts and decimal parts; add them separately, then combine.', '<b>Subtracting</b>: subtract the whole-number part first and then the decimal part.', '<b>Rounding</b>: if a number is close to a whole number, round it, calculate, then adjust your answer.']],
          ['ex', { t: 'Worked example 4.2', q: 'Work these out mentally: a 2.3 + 7.8 &nbsp; b 6.9 + 12.4 &nbsp; c 13.3 − 5.8', steps: ['a: 2 + 7 + 0.3 + 0.8 = 9 + 1.1 = <b>10.1</b>', 'b: Round 6.9 up to 7: 7 + 12.4 = 19.4, then subtract 0.1 → <b>19.3</b>', 'c: Round 5.8 up to 6: 13.3 − 6 = 7.3, then add 0.2 → <b>7.5</b>'] }],
          ['p', 'When you use a <b>written method</b>, always write the calculation in columns, with the decimal points vertically in line. Then add and subtract as normal, and remember to write the decimal point in your answer.'],
          ['viz', 'colCalc'],
          ['ex', { t: 'Worked example 4.3', q: 'Work out: a 27.52 + 4.8 &nbsp; b 43.6 − 5.45', steps: ['a: Write 4.8 as 4.80. Hundredths 2 + 0 = 2; tenths 5 + 8 = 13 (write 3, carry 1); units 7 + 4 + 1 = 12 (write 2, carry 1); tens 2 + 1 = 3 → <b>32.32</b>', 'b: Write 43.6 as 43.60. Borrow to do 10 − 5 = 5; tenths 5 − 4 = 1; borrow from the tens: 13 − 5 = 8; tens 3 − 0 = 3 → <b>38.15</b>'] }],
          ['tip', 'The easiest way to subtract a decimal from 1: make pairs that add to 1. For 1 − 0.36, think “0.36 + ? = 1” → 0.64 (the tenths add to 9, the last digits add to 10).'],
          ['vi', ['Tính nhẩm: tách phần nguyên và phần thập phân, hoặc làm tròn rồi bù trừ.', 'Tính viết: đặt dấu phẩy thẳng cột, thêm chữ số 0 cho đủ, cộng/trừ từ phải sang trái.', '10 − 4.83: viết 10 thành 10.00 rồi mượn liên tiếp → 5.17.', 'Nếu số trừ lớn hơn số bị trừ (4.6 − 8.21), tính 8.21 − 4.6 = 3.61 rồi thêm dấu trừ: −3.61.']],
        ],
        bank: [
          fill('Use a mental method to work out:', [7.7, 17.2, 3.4, 8], '12.7 + 4.5 = 16 + 1.2 = 17.2.', { f: 'a 3.5 + 4.2 = [] &nbsp; b 12.7 + 4.5 = [] &nbsp; c 4.9 − 1.5 = [] &nbsp; d 14.6 − 6.6 = []' }),
          match('Match each question card with its answer card.', [['1 − 0.36', '0.64'], ['1 − 0.78', '0.22'], ['1 − 0.44', '0.56'], ['1 − 0.284', '0.716'], ['1 − 0.432', '0.568']], 'Pairs that add to 1: 0.36 + 0.64 = 1.'),
          fill('Use Zara’s method (whole-number part, then decimal part) to work out:', [4.8, 5.4, 2.7, 9.4], '7.4 − 2.6: 7 − 2 = 5; 0.4 − 0.6 = −0.2; 5 − 0.2 = 4.8.', { f: 'a 7.4 − 2.6 = [] &nbsp; b 8.3 − 2.9 = [] &nbsp; c 12.5 − 9.8 = [] &nbsp; d 15.1 − 5.7 = []' }),
          tf('Zara works out 7.5 + 4.8 by rounding 4.8 up to 5: 7.5 + 5 = 12.5, then adds the extra 0.2 to get 12.7. Is she correct?', false, 'She rounded UP by 0.2, so she must SUBTRACT 0.2: 12.5 − 0.2 = 12.3.', { d: 2 }),
          fill('Mentally work out the following by rounding one number to a whole number.', [12.2, 18.5, 26.1, 3.5, 10.5, 14.4], '4.3 + 7.9 = 4.3 + 8 − 0.1 = 12.2.', { f: 'a 4.3 + 7.9 = [] &nbsp; b 8.9 + 9.6 = [] &nbsp; c 22.8 + 3.3 = [] &nbsp; d 5.4 − 1.9 = [] &nbsp; e 14.9 − 4.4 = [] &nbsp; f 21.1 − 6.7 = []' }),
          fill('Bo records his mass (kg): start of June 95.45, end of June 91.92, start of July 91.92, end of July 88.35.', [3.53, 3.57, { opts: ['June', 'July'], a: 1 }], 'June: 95.45 − 91.92 = 3.53; July: 91.92 − 88.35 = 3.57.', { f: 'Decrease in June: [] kg &nbsp; Decrease in July: [] kg &nbsp; The bigger decrease was in []', app: true }),
          num('At the start of August Bo’s mass was 88.35 kg. During August it decreased by 1.82 kg. What was his mass at the end of August?', 86.53, '88.35 − 1.82 = 86.53.', { unit: 'kg', app: true }),
          fill('Use a written method to work out:', [21.71, 29.13, 17.28, 33.342], '4.76 − −12.52 = 4.76 + 12.52 = 17.28.', { f: 'a 25.81 − 4.1 = [] &nbsp; b 38.91 − 9.78 = [] &nbsp; c 4.76 − (−12.52) = [] &nbsp; d 32.6 − (−0.742) = []', d: 2 }),
          fill('Work out:', [3.58, 7.17, 25.45, 23.218], '10 − 6.42: write 10.00 − 6.42 = 3.58.', { f: 'a 10 − 6.42 = [] &nbsp; b 20 − 12.83 = [] &nbsp; c 30 − 4.55 = [] &nbsp; d 40 − 16.782 = []' }),
          fill('At the cinema, Priya spends $4.75 on a ticket, $1.75 on sweets and $0.85 on a drink.', [7.35, 2.65], '4.75 + 1.75 + 0.85 = 7.35; 10 − 7.35 = 2.65.', { f: 'Total spent: $[] &nbsp; Change from $10: $[]', app: true }),
          fill('Jed the plumber has pipes of length 1.8 m, 3.5 m, 2.45 m and 0.85 m.', [8.6, 1.4], '1.8 + 3.5 + 2.45 + 0.85 = 8.6 m; 10 − 8.6 = 1.4 m.', { f: 'Total length: [] m &nbsp; More pipe needed for 10 m: [] m', app: true }),
          fill('Use Zara’s method (the answer is negative) to work out:', [-4.14, -7.28, -5.88, -2.979], '5.43 − 9.57: work out 9.57 − 5.43 = 4.14, so the answer is −4.14.', { f: 'a 5.43 − 9.57 = [] &nbsp; b 8.12 − 15.4 = [] &nbsp; c −13.8 + 7.92 = [] &nbsp; d 6.582 − (4.5 + 5.061) = []', neg: true, d: 3 }),
          gen(() => { const a = twoDp(5, 60), b = pick([oneDp(1, 20), twoDp(1, 20)]); return num(`Work out ${N(a)} + ${N(b)}`, C(a + b), `Line up the decimal points: ${N(a)} + ${N(b)} = ${N(C(a + b))}.`); }),
          gen(() => { const a = pick([oneDp(20, 80), twoDp(20, 80)]), b = twoDp(1, 19); return num(`Work out ${N(a)} − ${N(b)}`, C(a - b), `Write ${N(a)} as ${a.toFixed(Math.max(dpOf(a), dpOf(b)))} and subtract column by column: ${N(C(a - b))}.`); }),
          gen(() => { const a = oneDp(1, 30), b = C(R(2, 15) - 0.1 * R(1, 2)); return num(`Work out mentally: ${N(a)} + ${N(b)}`, C(a + b), `Round ${N(b)} to ${Math.round(b)}: ${N(a)} + ${Math.round(b)} = ${N(C(a + Math.round(b)))}, then adjust by ${N(C(b - Math.round(b)))}.`); }),
          gen(() => { const items = U.sample([['notebook', twoDp(1, 4)], ['pen', twoDp(0.5, 2)], ['ruler', twoDp(0.4, 1.5)], ['bag', twoDp(5, 15)], ['juice', twoDp(0.8, 2.5)]], 3); const tot = C(U.sum(items.map((i) => i[1]))); const pay = tot < 10 ? 10 : 20; return fill(`You buy a ${items[0][0]} (${money(items[0][1])}), a ${items[1][0]} (${money(items[1][1])}) and a ${items[2][0]} (${money(items[2][1])}). You pay with a $${pay} note.`, [tot, C(pay - tot)], `Total = ${money(tot)}; change = ${pay} − ${tot.toFixed(2)} = ${money(pay - tot)}.`, { f: 'Total: $[] &nbsp; Change: $[]', app: true }); }, { app: true }),
        ],
      },
      {
        id: '4.3', t: 'Multiplying decimals', vi: 'Nhân số thập phân',
        goals: ['multiply decimals by whole numbers.'],
        body: [
          ['list', ['First, work out the multiplication <b>without</b> the decimal point.', 'Finally, put the decimal point back in the answer. There must be the <b>same number of digits after the decimal point</b> in the answer as there were in the question.']],
          ['ex', { t: 'Worked example 4.4', q: 'a Work out mentally: i 0.002 × 4 &nbsp; ii 30 × 0.06. &nbsp; b Use a written method to work out 476 × 3.7.', steps: ['a i: 2 × 4 = 8. Three digits after the point in the question → <b>0.008</b>', 'a ii: 30 × 6 = 180. Two digits after the point → 1.80 = <b>1.8</b>', 'b: 476 × 37 = 14 280 + 3332 = 17 612. One digit after the point → <b>1761.2</b>'] }],
          ['viz', 'decGrid'],
          ['tip', 'Always check with an estimate. Raj: 0.45 × 372 ≈ 0.5 × 400 = 200, which is close to 167.4 ✓. Anna wrote 47.35 × 18 = 85.23 — the estimate 50 × 20 = 1000 shows she is wrong.'],
          ['vi', ['Nhân như số nguyên (bỏ dấu phẩy), rồi đặt lại dấu phẩy: số chữ số thập phân của kết quả = số chữ số thập phân của thừa số.', 'Có thể bỏ chữ số 0 ở cuối: 1.80 = 1.8.', 'Luôn ước lượng để kiểm tra: làm tròn mỗi số đến 1 chữ số có nghĩa.', 'Nếu biết 521 × 53 = 27 613 thì 52.1 × 53 = 2761.3 và 521 × 0.53 = 276.13.']],
        ],
        bank: [
          fill('Use a mental method to work out:', [0.8, 2.5, 1.8], '0.5 × 5: 5 × 5 = 25, one decimal place → 2.5.', { f: 'a 0.1 × 8 = [] &nbsp; b 0.5 × 5 = [] &nbsp; c 0.9 × 2 = []' }),
          match('Match each calculation with its answer.', [['6 × 0.02', '0.12'], ['4 × 0.3', '1.2'], ['3 × 0.004', '0.012'], ['120 × 0.1', '12'], ['8 × 0.3', '2.4']], 'Multiply without the point, then put it back.'),
          num('Kai works out that 521 × 53 = 27 613. Use this to write down the answer to 521 × 5.3', 2761.3, 'One digit after the point in the question → one in the answer.'),
          num('Kai works out that 521 × 53 = 27 613. Use this to write down the answer to 521 × 0.53', 276.13, 'Two digits after the point.'),
          fill('162 × 34 = 5508. Use this to work out:', [550.8, 55.08, 5.508, 550.8, 55.08, 5.508], '16.2 × 34 also has one decimal place: 550.8.', { f: 'a 162 × 3.4 = [] &nbsp; b 162 × 0.34 = [] &nbsp; c 162 × 0.034 = [] &nbsp; d 16.2 × 34 = [] &nbsp; e 1.62 × 34 = [] &nbsp; f 0.162 × 34 = []', d: 2 }),
          fill('Work out these multiplications.', [166.4, 3110.4, 31.98], '0.78 × 41: 78 × 41 = 3198 → 31.98. Check: 0.8 × 40 = 32 ✓', { f: 'a 3.2 × 52 = [] &nbsp; b 8.1 × 384 = [] &nbsp; c 0.78 × 41 = []' }),
          mcq('Anna writes 47.35 × 18 = 85.23. Without working it out, how can you tell she is wrong?', ['47.35 × 18 ≈ 50 × 20 = 1000, so 85.23 is far too small', 'The answer should have one decimal place', 'The answer should be negative', 'You cannot tell without working it out'], 0, 'Estimate first! The correct answer is 852.3.'),
          num('Work out the correct answer to 47.35 × 18.', 852.3, '4735 × 18 = 85 230 → two decimal places → 852.30 = 852.3.', { d: 2 }),
          num('In 1 gram of green gold there is 0.23 g of copper. How many grams of copper are there in 36 g of green gold?', 8.28, '0.23 × 36 = 8.28.', { unit: 'g', app: true }),
          mcq('Darren exchanges British pounds to US dollars. For every £1 he receives $1.29. He says: “If I exchange £275, I should receive about $350.” Is Darren correct?', ['Yes — 275 × 1.29 = 354.75, which is about $350', 'No — he gets about $275', 'No — he gets about $213', 'No — he gets about $3500'], 0, 'Estimate: 300 × 1.3 = 390 or 275 × 1.29 = 354.75 exactly.', { app: true }),
          num('Samir buys 350 bottles of shampoo at $0.26, 425 bottles of shower gel at $0.23, 275 bottles of hand lotion at $0.32 and 600 bars of soap at $0.18. What is the total cost?', 384.75, '350 × 0.26 = 91; 425 × 0.23 = 97.75; 275 × 0.32 = 88; 600 × 0.18 = 108. Total: 91 + 97.75 + 88 + 108 = $384.75.', { pre: '$', app: true, d: 3 }),
          gen(() => { const a = pick([R(2, 9) / 10, R(2, 9) / 100, R(2, 9) / 1000]), b = R(2, 9) * pick([1, 10, 100]); const r = C(a * b); return num(`Work out mentally: ${N(C(a))} × ${b}`, r, `${Math.round(a * Math.pow(10, dpOf(a)))} × ${b} = ${Math.round(a * Math.pow(10, dpOf(a))) * b}; ${dpOf(a)} decimal place(s) → ${N(r)}.`); }),
          gen(() => { const a = pick([oneDp(1, 30), twoDp(0.1, 9)]), b = R(3, 60); const r = C(a * b); return num(`Work out ${N(a)} × ${b}`, r, `${Math.round(a * Math.pow(10, dpOf(a)))} × ${b} = ${Math.round(a * Math.pow(10, dpOf(a))) * b}. Put back ${dpOf(a)} decimal place(s): ${N(r)}.`); }),
          gen(() => { const p = twoDp(0.5, 6), n = R(3, 25); const it = pick(['bottles of water', 'cupcakes', 'bus tickets', 'pencils', 'stickers']); return num(`${it[0].toUpperCase() + it.slice(1)} cost $${p.toFixed(2)} each. How much do ${n} ${it} cost?`, C(p * n), `${p.toFixed(2)} × ${n} = ${money(p * n)}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const a = oneDp(2, 9), b = R(11, 99); const r = C(a * b); const est = Math.round(a) * Math.round(b / 10) * 10; return mcq(`Which is the best estimate for ${N(a)} × ${b}?`, [String(est), String(est * 10), String(Math.round(est / 10)), String(est + 100)], 0, `${N(a)} ≈ ${Math.round(a)}, ${b} ≈ ${Math.round(b / 10) * 10} → ${est}. (Exact: ${N(r)})`); }),
        ],
      },
      {
        id: '4.4', t: 'Dividing decimals', vi: 'Chia số thập phân',
        goals: ['divide decimals by whole numbers.'],
        body: [
          ['list', ['Use <b>short division</b> (or the method that you prefer).', 'Keep the decimal point in the question, and write the decimal point in the answer <b>above</b> the decimal point in the question.']],
          ['viz', 'shortDiv'],
          ['ex', { t: 'Worked example 4.5', q: 'Work out: a 4.258 ÷ 2 &nbsp; b 41.481 ÷ 18', steps: ['a: 4 ÷ 2 = 2; write the point; 2 ÷ 2 = 1; 5 ÷ 2 = 2 r1; 18 ÷ 2 = 9 → <b>2.129</b>', 'b: 41 ÷ 18 = 2 r5; write the point; 54 ÷ 18 = 3; 8 ÷ 18 = 0 r8; 81 ÷ 18 = 4 r9; add a zero: 90 ÷ 18 = 5 → <b>2.3045</b>'] }],
          ['tip', 'Do not write “remainder” in a decimal division (Kyle’s mistake). Add zeros after the last digit and keep dividing. To give an answer to 2 d.p., work out 3 d.p. and then round.'],
          ['p', 'Check a division with <b>estimation</b> (approximately correct?) and an <b>inverse calculation</b> (exactly correct?). For 56.322 ÷ 9 = 6.258: estimate 54 ÷ 9 = 6 ✓; inverse 6.258 × 9 = 56.322 ✓.'],
          ['vi', ['Chia như chia số nguyên, đặt dấu phẩy ở thương ngay trên dấu phẩy của số bị chia.', 'Nếu còn dư, viết thêm chữ số 0 vào sau và chia tiếp.', 'Kiểm tra bằng ước lượng và phép nhân ngược.', 'Làm tròn đến 2 d.p.: tính đến 3 d.p. rồi làm tròn.']],
        ],
        bank: [
          fill('Work out:', [4.327, 1.487, 6.585, 7.364], '58.912 ÷ 8 = 7.364.', { f: 'a 8.654 ÷ 2 = [] &nbsp; b 8.922 ÷ 6 = [] &nbsp; c 32.925 ÷ 5 = [] &nbsp; d 58.912 ÷ 8 = []' }),
          num('Maggie pays $9.28 for 8 m of ribbon. What is the cost of the ribbon, per metre?', 1.16, '9.28 ÷ 8 = 1.16.', { pre: '$', app: true }),
          num('In a supermarket, five chickens cost $18.25. What is the cost of one chicken?', 3.65, '18.25 ÷ 5 = 3.65.', { pre: '$', app: true }),
          num('Six friends share a restaurant bill of $145.50 equally. How much do they each pay?', 24.25, '145.50 ÷ 6 = 24.25.', { pre: '$', app: true }),
          fill('Copy and complete these divisions.', [2.282, 3.075, 3.133], '46.125 ÷ 15: 46 ÷ 15 = 3 r1; 11 ÷ 15 = 0 r11; 112 ÷ 15 = 7 r7; 75 ÷ 15 = 5 → 3.075.', { f: 'a 27.384 ÷ 12 = [] &nbsp; b 46.125 ÷ 15 = [] &nbsp; c 78.325 ÷ 25 = []', d: 2 }),
          mcq('Lara works out 112.4 ÷ 16 and writes 7.25. What is the correct answer?', ['7.025', '7.25', '70.25', '7.0025'], 0, '112 ÷ 16 = 7 exactly, so 0.4 ÷ 16 = 0.025: she forgot the 0 in the tenths place. 112.4 ÷ 16 = 7.025.', { d: 2 }),
          mcq('Kyle writes 251.55 ÷ 26 = 9.67 remainder 13. What should he have done?', ['Added a zero and continued: 9.675', 'Rounded to 9.7', 'Written 9.67.13', 'Nothing — it is correct'], 0, '13 remainder → 130 ÷ 26 = 5, so 251.55 ÷ 26 = 9.675.', { d: 2 }),
          num('Use the 14 times table to work out 126.392 ÷ 14.', 9.028, '126 ÷ 14 = 9; 0.392 ÷ 14 = 0.028 → 9.028. Check: 9.028 × 14 = 126.392.', { d: 2 }),
          fill('Mair works out that 235 × 47 = 11 045. Use this to work out:', [235, 23.5, 2.35, 0.235], '1104.5 ÷ 47 = 23.5 because it is 10 times smaller.', { f: 'a 11 045 ÷ 47 = [] &nbsp; b 1104.5 ÷ 47 = [] &nbsp; c 110.45 ÷ 47 = [] &nbsp; d 11.045 ÷ 47 = []', d: 2 }),
          num('Work out 7.62 ÷ 5. Give your answer to 1 d.p.', 1.5, '7.62 ÷ 5 = 1.524 → 1.5', { dp: 1 }),
          num('Work out 9.428 ÷ 7. Give your answer to 2 d.p.', 1.35, '9.428 ÷ 7 = 1.3468… → 1.35', { dp: 2 }),
          num('Work out 8.6 ÷ 13. Give your answer to 3 d.p.', 0.662, '8.6 ÷ 13 = 0.66153… → 0.662', { dp: 3, d: 2 }),
          gen(() => { const d = R(2, 9), q = C(R(101, 9999) / pick([100, 1000])); const a = C(q * d); return num(`Work out ${N(a)} ÷ ${d}`, q, `Short division: ${N(a)} ÷ ${d} = ${N(q)}. Check: ${N(q)} × ${d} = ${N(a)}.`); }),
          gen(() => { const d = R(11, 25), q = C(R(101, 999) / 100); const a = C(q * d); return num(`Work out ${N(a)} ÷ ${d}`, q, `${N(a)} ÷ ${d} = ${N(q)}. Check: ${N(q)} × ${d} = ${N(a)}.`, { d: 2 }); }),
          gen(() => { const n = R(3, 9), tot = C(R(1000, 9999) / 100); const each = tot / n; return num(`${n} friends share a taxi fare of $${tot.toFixed(2)} equally. How much does each person pay? Round to the nearest cent.`, rnd(each, 2), `${tot.toFixed(2)} ÷ ${n} = ${each.toFixed(4)}… ≈ $${rnd(each, 2).toFixed(2)}`, { pre: '$', dp: 2, app: true }); }, { app: true }),
          gen(() => { const len = C(R(20, 99) / 10), n = pick([2, 4, 5, 8]); return num(`A ribbon ${N(len)} m long is cut into ${n} equal pieces. How long is each piece?`, C(len / n), `${N(len)} ÷ ${n} = ${N(C(len / n))} m.`, { unit: 'm', app: true }); }, { app: true }),
        ],
      },
      {
        id: '4.5', t: 'Making decimal calculations easier', vi: 'Tính nhanh với số thập phân',
        goals: ['simplify calculations containing decimals.'],
        body: [
          ['p', 'When you are calculating using decimals, you can often make a calculation easier using a variety of methods, such as using the <b>place value</b> of the decimal, using <b>partitioning</b>, or using the correct order of operations.'],
          ['viz', 'easyCalc'],
          ['ex', { t: 'Worked example 4.6', q: 'Work out: a 0.06 × 3500 &nbsp; b 8.2 × 9 &nbsp; c 12.56 ÷ 40', steps: ['a: 0.06 = 6 ÷ 100, so 0.06 × 3500 = 6 × 3500 ÷ 100 = 6 × 35 = 180 + 30 = <b>210</b>', 'b: 8.2 × 9 = 8.2 × (10 − 1) = 82 − 8.2 = 74 − 0.2 = <b>73.8</b>', `c: ${APP.U.F('12.56', 40)} = ${APP.U.F('12.56 ÷ 10', '40 ÷ 10')} = 1.256 ÷ 4 = <b>0.314</b>`] }],
          ['tip', 'Pattern: 0.7 × 180 = 7 × 18 and 0.04 × 7600 = 4 × 76. Moving the point one way in one number and the other way in the other number keeps the product the same.'],
          ['vi', ['Nhân với 0.06 = nhân 6 rồi chia 100.', 'Nhân với 9 = nhân 10 rồi trừ đi chính số đó.', 'Chia cho 40 = chia cho 10 rồi chia cho 4.', 'Tách số: 7.6 × 8 = 7 × 8 + 0.6 × 8 = 56 + 4.8 = 60.8.']],
        ],
        bank: [
          fill('Use the place value method to work out:', [126, 304], '0.7 × 180 = 7 × 18 = 126; 0.04 × 7600 = 4 × 76 = 304.', { f: 'a 0.7 × 180 = [] &nbsp; b 0.04 × 7600 = []' }),
          fill('Work out the answers. Use the same method.', [246, 288, 64, 424], '0.08 × 5300 = 8 × 53 = 424.', { f: 'a 0.6 × 410 = [] &nbsp; b 0.9 × 320 = [] &nbsp; c 0.02 × 3200 = [] &nbsp; d 0.08 × 5300 = []' }),
          fill('Alek has $3450 to invest. Complete the table.', [2070, 1035, 345], '0.6 × 3450 = 6 × 345 = 2070; 0.3 × 3450 = 1035; 0.1 × 3450 = 345. Check: total = 3450 ✓', { f: 'gold: 0.6 × $3450 = $[] &nbsp; silver: 0.3 × $3450 = $[] &nbsp; precious stones: 0.1 × $3450 = $[]', app: true }),
          fill('Complete the workings using × (10 − 1).', [41.4, 65.7], '4.6 × 9 = 46 − 4.6 = 41.4.', { f: 'a 4.6 × 9 = [] &nbsp; b 7.3 × 9 = []' }),
          fill('Work out using the same method.', [61.2, 42.3, 113.4], '12.6 × 9 = 126 − 12.6 = 113.4.', { f: 'a 6.8 × 9 = [] &nbsp; b 4.7 × 9 = [] &nbsp; c 12.6 × 9 = []' }),
          fill('Use Pedro’s method (partitioning) to work out:', [25.2, 39, 50.4], '7.8 × 5 = 35 + 4 = 39.', { f: 'a 4.2 × 6 = [] &nbsp; b 7.8 × 5 = [] &nbsp; c 6.3 × 8 = []' }),
          num('A square has a side length of 8.6 m. Use P = 4L to work out its perimeter.', 34.4, '4 × 8.6 = 34.4.', { unit: 'm' }),
          fill('Make these divisions easier, then work out the answer.', [0.485, 1.347, 0.0655, 4.468], '14.55 ÷ 30 = 1.455 ÷ 3 = 0.485.', { f: 'a 14.55 ÷ 30 = [] &nbsp; b 67.35 ÷ 50 = [] &nbsp; c 45.85 ÷ 700 = [] &nbsp; d 893.6 ÷ 200 = []', d: 2 }),
          fill('Twenty members of a football club share a meal costing $564.25 equally. How much does each pay, rounded to the nearest:', [28.21, 28], '564.25 ÷ 20 = 28.2125.', { f: 'a cent: $[] &nbsp; b dollar: $[]', app: true }),
          gen(() => { const a = R(2, 9), b = R(11, 99) * 100; const r = a * b / 100; return num(`Work out 0.0${a} × ${b}`, r, `0.0${a} × ${b} = ${a} × ${b / 100} = ${r}.`); }),
          gen(() => { const a = oneDp(2, 20); return num(`Work out ${N(a)} × 9 using × (10 − 1).`, C(a * 9), `${N(a)} × 10 − ${N(a)} = ${N(C(a * 10))} − ${N(a)} = ${N(C(a * 9))}.`); }),
          gen(() => { const d = pick([20, 30, 40, 50]), q = C(R(101, 999) / 1000); const a = C(q * d); return num(`Work out ${N(a)} ÷ ${d}`, q, `Divide by 10 first: ${N(C(a / 10))} ÷ ${d / 10} = ${N(q)}.`, { d: 2 }); }),
          gen(() => { const a = R(2, 9), b = C(R(1, 9) / 10), n = R(3, 9); return num(`Work out ${N(C(a + b))} × ${n} by partitioning.`, C((a + b) * n), `${a} × ${n} + ${N(b)} × ${n} = ${a * n} + ${N(C(b * n))} = ${N(C((a + b) * n))}.`); }),
        ],
      },
    ],
    explore: {
      title: 'Every hundredth counts', hero: 'heroTrack',
      lead: 'In a 100 m race, the winner can be just one hundredth of a second ahead. Decimals decide medals, money and even the history of mathematics.',
      leadVi: 'Trong chạy 100 m, người thắng có thể chỉ nhanh hơn 0,01 giây. Số thập phân quyết định huy chương, tiền bạc và cả lịch sử toán học.',
      cards: [
        { t: 'Photo finish', p: 'Modern timing systems measure races to a thousandth of a second, but official results are given to hundredths. Watch six of the fastest women’s 100 m times race against each other.', viz: 'sprint' },
        { t: 'Simon Stevin and the art of tenths', p: 'In 1585 the Flemish engineer Simon Stevin wrote a short book called <i>De Thiende</i> (“The Tenth”). He showed how decimal fractions make calculations easier and predicted that coins, weights and measures would one day be decimal. He wrote decimals with little circles.', viz: 'stevin' },
        { t: 'Money around the world', p: 'Most currencies are decimal: 1 dollar = 100 cents, 1 yuan = 100 fen, 1 baht = 100 satang. When you exchange money you multiply by a decimal exchange rate — and estimating helps you check you are not cheated.', viz: 'exchange' },
        { t: 'Calculate like a pro', p: 'Shop assistants and engineers use clever mental methods. Multiplying by 9? Multiply by 10 and subtract. Dividing by 40? Divide by 10, then by 4.', viz: 'easyCalc' },
      ],
      facts: [['0.01 s', 'Beijing 2008', 'Michael Phelps won the 100 m butterfly by just one hundredth of a second.'], ['1585', 'De Thiende', 'Simon Stevin’s 36-page book spread decimal fractions across Europe.'], ['1792', 'first decimal currency', 'The USA adopted the dollar divided into 100 cents.'], ['1971', 'UK goes decimal', 'Before 1971, one British pound was 240 pence!']],
      challenge: { t: 'The missing digits', p: 'Fill in the boxes so that the calculation is correct: ☐.☐ × 4 = 19.6, using the digits 4 and 9.', a: '19.6 ÷ 4 = <b>4.9</b>. Check: 4.9 × 4 = 19.6 ✓' },
    },
    reading: {
      title: 'Racing Against the Clock', sub: 'How timing technology changed sport. Tap words to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'At the first modern Olympic Games in Athens in 1896, race officials used hand-held stopwatches. They pressed a button when they saw the starter’s smoke and again when the runner crossed the finish line. Times were recorded to the nearest fifth of a second, so a result of 12.2 seconds really meant “somewhere close to 12.2 seconds”.',
        'Human reactions are slow. It takes about two tenths of a second for a person to see something and press a button. Because different officials reacted at different speeds, two timekeepers could record different times for the same runner. Records were often argued about for years.',
        'In 1932, electronic timing appeared at the Olympics for the first time, and by 1972 it was fully automatic. A starting pistol now sends an electrical signal to the clock, and a special camera at the finish line takes thousands of images every second. This “photo finish” allows judges to see exactly which athlete’s body crosses the line first.',
        'Today, official sprint results are given to the nearest hundredth of a second, even though the equipment can measure thousandths. One reason is fairness: lanes in a stadium may differ in length by a few millimetres, and at top speed a sprinter travels about one centimetre in a thousandth of a second.',
        'Swimming is even closer. Touch pads at the end of each lane stop the clock when a swimmer’s hand presses them. In 2008, Michael Phelps won an Olympic gold medal by just 0.01 seconds — less time than it takes to blink.',
      ],
      gloss: [['stopwatch', 'đồng hồ bấm giờ'], ['official', 'trọng tài, quan chức'], ['reaction', 'phản xạ'], ['signal', 'tín hiệu'], ['fairness', 'sự công bằng'], ['touch pad', 'tấm chạm']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'In 1896, times were recorded to the nearest…', opts: ['fifth of a second', 'tenth of a second', 'hundredth of a second', 'second'], a: 0, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'Why could two timekeepers record different times for the same runner?', opts: ['They reacted at different speeds', 'Their stopwatches were broken', 'They watched different races', 'They used different units'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'Why are sprint results NOT given to thousandths of a second?', opts: ['Lanes may differ slightly in length', 'The equipment cannot measure thousandths', 'Athletes do not like it', 'It is too expensive'], a: 0, ex: 'Paragraph D: fairness.' },
        ] },
        { title: 'Put the events in order', qs: [
          { type: 'order', q: 'Order these events from earliest to latest.', a: ['Hand-held stopwatches at the first modern Olympics', 'Electronic timing used for the first time', 'Timing becomes fully automatic', 'Michael Phelps wins by 0.01 seconds'], ex: '1896 → 1932 → 1972 → 2008.' },
        ] },
        { title: 'Complete the summary', note: 'Write ONE word or a number.', qs: [
          { type: 'fill', q: 'Use the passage.', f: 'Human reaction time is about [] tenths of a second. A photo-finish camera takes thousands of [] every second. At top speed, a sprinter travels about one [] in a thousandth of a second.', a: [2, ['images', 'pictures'], ['centimetre', 'centimeter', 'cm']], ex: 'Paragraphs B, C and D.' },
          { type: 'tf', q: 'In swimming, the clock stops when the swimmer touches a pad.', a: true, ex: 'Paragraph E.' },
        ] },
      ],
    },
    listening: {
      title: 'At the school shop', intro: 'Nam is buying things at the school shop. Listen and answer the questions.',
      voices: { Nam: 'rounded', Assistant: 'airy' },
      lines: [
        { spk: 'Nam', text: 'Hello! How much are these notebooks, please?' },
        { spk: 'Assistant', text: 'They are one dollar and twenty-five cents each, or three for three dollars fifty.' },
        { spk: 'Nam', text: 'Three for three fifty? That is cheaper than three times one twenty-five, which is three seventy-five. I’ll take three, please.' },
        { spk: 'Assistant', text: 'Good thinking! You save twenty-five cents. Anything else?' },
        { spk: 'Nam', text: 'Yes, a calculator. The sign says eight dollars ninety-five.' },
        { spk: 'Assistant', text: 'That’s right. So the total is three fifty plus eight ninety-five, which is twelve dollars forty-five.' },
        { spk: 'Nam', text: 'Here is a twenty-dollar note.' },
        { spk: 'Assistant', text: 'Thank you. Your change is seven dollars fifty-five. Have a good day!' },
      ],
      parts: [
        { title: 'Complete the receipt', qs: [
          { type: 'fill', q: 'Write the prices you hear (in dollars).', f: 'One notebook: $[] &nbsp; Three notebooks (offer): $[] &nbsp; Calculator: $[] &nbsp; Total: $[] &nbsp; Change from $20: $[]', a: [1.25, 3.5, 8.95, 12.45, 7.55], ex: '3.50 + 8.95 = 12.45; 20 − 12.45 = 7.55.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'How much does Nam save by buying the offer?', opts: ['25 cents', '50 cents', '75 cents', '$1.25'], a: 0, ex: '3.75 − 3.50 = 0.25.' },
          { type: 'mcq', q: 'Which calculation does Nam do in his head?', opts: ['3 × 1.25 = 3.75', '3 × 3.50 = 10.50', '20 − 8.95 = 11.05', '1.25 + 3.50 = 4.75'], a: 0, ex: '“three times one twenty-five, which is three seventy-five.”' },
          { type: 'tf', q: 'Nam pays with a ten-dollar note.', a: false, ex: 'He pays with a twenty-dollar note.' },
        ] },
      ],
    },
  });
})();
