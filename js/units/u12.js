/* Unit 12 — Ratio and proportion */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, frac, fill, order, match, sort, txt, expr, ratio, gen } = Q;
  const simp = (a, b) => { const g = U.gcd(a, b); return [a / g, b / g]; };
  const RT = (a, b) => `${N(a)} : ${N(b)}`;
  const hexMix = (c1, c2, p) => { const A = c1.match(/\w\w/g).map((x) => parseInt(x, 16)), B = c2.match(/\w\w/g).map((x) => parseInt(x, 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * p).toString(16).padStart(2, '0')).join(''); };

  /* squares figure: a blue, b other colour */
  const squares = (a, b, c2 = '#2bb673', cols) => { const n = a + b, cc = cols || Math.min(n, n % 5 === 0 ? 5 : n % 4 === 0 ? 4 : 6), rows = Math.ceil(n / cc), sz = 30; const cells = shuffle(Array.from({ length: n }, (_, i) => i < a)); let g = `<svg viewBox="0 0 ${cc * sz + 4} ${rows * sz + 4}" style="width:100%;max-width:${cc * sz + 4}px">`; cells.forEach((bl, i) => { g += `<rect x="${2 + (i % cc) * sz}" y="${2 + Math.floor(i / cc) * sz}" width="${sz}" height="${sz}" fill="${bl ? '#4f8cff' : c2}" stroke="#fff" stroke-width="2"/>`; }); return g + '</svg>'; };
  const necklace = (a, b, ca = '#2bb673', cb = '#4f8cff') => { const n = a + b, r = 52, W = 140; let g = `<svg viewBox="0 0 ${W} ${W}" style="width:100%;max-width:150px"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--ink-3)" stroke-width="1.5"/>`; const [p, q] = simp(a, b); const pat = []; for (let k = 0; k < n / (p + q); k++) { for (let i = 0; i < p; i++) pat.push(ca); for (let i = 0; i < q; i++) pat.push(cb); } pat.forEach((c, i) => { const t = (i / n) * Math.PI * 2 - Math.PI / 2; g += `<circle cx="${70 + r * Math.cos(t)}" cy="${70 + r * Math.sin(t)}" r="${Math.min(10, 140 / n)}" fill="${c}" stroke="#fff" stroke-width="1.5"/>`; }); return g + '</svg>'; };

  /* ---------- widgets ---------- */
  APP.viz.beadRatio = function (el) {
    const f = VZ.frame(el, 'Vòng hạt: rút gọn tỉ số bằng ƯCLN', { icon: 'spark' });
    let a = 2, b = 6, grouped = false; const W = 320, svg = VZ.svg(W, W); const info = h('div', { style: { textAlign: 'center', fontWeight: 800, fontSize: '1.15rem', margin: '6px 0' } }); f.stage.append(info, svg);
    function draw() {
      const n = a + b, g = U.gcd(a, b), [p, q] = simp(a, b), cx = W / 2, r = 120; svg.innerHTML = '';
      svg.append(s('circle', { cx, cy: cx, r, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 2 }));
      const beads = grouped ? Array.from({ length: n }, (_, i) => (i % (p + q) < p ? 'R' : 'Y')) : [...Array(a).fill('R'), ...Array(b).fill('Y')];
      beads.forEach((c, i) => { const t = (i / n) * Math.PI * 2 - Math.PI / 2; svg.append(s('circle', { cx: cx + r * Math.cos(t), cy: cx + r * Math.sin(t), r: Math.min(16, 300 / n), fill: c === 'R' ? '#ef476f' : '#ffd166', stroke: '#fff', 'stroke-width': 2, style: `animation:popIn .3s ${i * 0.02}s both` })); });
      if (grouped && g > 1) for (let k = 0; k < g; k++) { const t = ((k * (p + q) - 0.5) / n) * Math.PI * 2 - Math.PI / 2; svg.append(s('line', { x1: cx + (r - 24) * Math.cos(t), y1: cx + (r - 24) * Math.sin(t), x2: cx + (r + 24) * Math.cos(t), y2: cx + (r + 24) * Math.sin(t), stroke: 'var(--accent)', 'stroke-width': 3 })); }
      svg.append(s('text', { x: cx, y: cx - 6, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: 'var(--ink)', text: `${a} : ${b}` }), s('text', { x: cx, y: cx + 26, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: 'var(--accent)', text: g > 1 ? `= ${p} : ${q}` : 'tối giản' }));
      info.innerHTML = `<span style="color:#ef476f">đỏ</span> : <span style="color:#d9a400">vàng</span> = ${a} : ${b}`;
      f.out.innerHTML = g > 1 ? `ƯCLN(${a}, ${b}) = <b>${g}</b> → chia cả hai số cho ${g}: ${a} : ${b} = <b>${p} : ${q}</b>. ${grouped ? `Vòng hạt chia thành ${g} nhóm giống nhau, mỗi nhóm ${p} đỏ và ${q} vàng.` : 'Bấm “Chia nhóm” để thấy các nhóm giống nhau.'}` : `ƯCLN(${a}, ${b}) = 1 nên ${a} : ${b} đã ở dạng tối giản.`;
    }
    f.ctrls.append(VZ.range('Đỏ', 1, 12, a, 1, (v) => { a = v; draw(); }), VZ.range('Vàng', 1, 12, b, 1, (v) => { b = v; draw(); }), VZ.btn('Chia nhóm', () => { grouped = !grouped; SFX.play(grouped ? 'pop' : 'tap'); draw(); }, 'btn sm sc'));
    draw();
  };
  APP.viz.shareBar = function (el) {
    const f = VZ.frame(el, 'Chia một lượng theo tỉ số (mô hình thanh)', { icon: 'chart' });
    let tot = 9000, a = 2, b = 1; const box = h('div'); f.stage.append(box);
    function draw(anim) {
      const n = a + b, one = tot / n; const cells = Array.from({ length: n }, (_, i) => `<div style="flex:1;min-width:0;border-radius:10px;padding:12px 2px;text-align:center;font-weight:800;color:#fff;font-size:clamp(.7rem,2.6vw,.95rem);background:${i < a ? 'var(--number)' : 'var(--algebra)'};${anim ? `animation:popIn .35s ${i * 0.08}s both` : ''}">$${N(U.round(one, 2))}</div>`);
      box.innerHTML = `<div style="display:flex;gap:6px;align-items:center;margin:4px 0 2px"><b style="width:56px">Sally</b><div style="display:flex;gap:4px;flex:${a}">${cells.slice(0, a).join('')}</div><div style="flex:${b}"></div></div><div style="display:flex;gap:6px;align-items:center;margin:2px 0 10px"><b style="width:56px">Bob</b><div style="flex:${a}"></div><div style="display:flex;gap:4px;flex:${b}">${cells.slice(a).join('')}</div></div>
      <div class="stack" style="gap:4px">${[`① Tổng số phần: ${a} + ${b} = <b>${n}</b>`, `② Giá trị 1 phần: $${N(tot)} ÷ ${n} = <b>$${N(U.round(one, 2))}</b>`, `③ Sally: ${a} × $${N(U.round(one, 2))} = <b>$${N(U.round(a * one, 2))}</b> · Bob: ${b} × $${N(U.round(one, 2))} = <b>$${N(U.round(b * one, 2))}</b>`, `✔ Kiểm tra: $${N(U.round(a * one, 2))} + $${N(U.round(b * one, 2))} = $${N(tot)}`].map((t, i) => `<div style="animation:stepIn .35s ${i * 0.15}s both">${t}</div>`).join('')}</div>`;
      f.out.innerHTML = `Chia $${N(tot)} theo tỉ số ${a} : ${b}. Sally nhận ${a}/${n}, Bob nhận ${b}/${n} tổng số tiền.`;
    }
    f.ctrls.append(VZ.range('Số tiền $', 100, 12000, tot, 100, (v) => { tot = v; draw(); }), VZ.range('Sally', 1, 9, a, 1, (v) => { a = v; draw(true); SFX.play('tick'); }), VZ.range('Bob', 1, 9, b, 1, (v) => { b = v; draw(true); SFX.play('tick'); }));
    draw(true);
  };
  APP.viz.paintMixer = function (el) {
    const f = VZ.frame(el, 'Pha sơn & pha nước cam — so sánh tỉ lệ', { icon: 'target' });
    let mode = 'paint', A = [1, 2], B = [2, 3]; const box = h('div'); f.stage.append(box);
    const M = { paint: { a: 'trắng', b: 'xanh', ca: 'ffffff', cb: '1f4fd8', ask: 'Ai có sơn xanh ĐẬM hơn?', key: 1, names: ['Bryn', 'Alun'] }, juice: { a: 'nước cam', b: 'nước lọc', ca: 'ff9a1f', cb: 'e8f4ff', ask: 'Ai có nước cam ĐẬM ĐẶC hơn?', key: 0, names: ['Melania', 'Boris'] } };
    function can(r, cfg, nm) {
      const p = r[1] / (r[0] + r[1]); const col = hexMix(cfg.ca, cfg.cb, p); const tins = (k, c) => Array.from({ length: k }, () => `<span style="display:inline-block;width:22px;height:28px;border-radius:5px 5px 7px 7px;background:#${c};border:2px solid var(--ink-3);margin:1px"></span>`).join('');
      const key = r[cfg.key] / (r[0] + r[1]);
      return `<div style="flex:1;min-width:140px;text-align:center"><b>${nm}</b> · ${r[0]} : ${r[1]}<div style="margin:6px 0;min-height:32px">${tins(r[0], cfg.ca)} + ${tins(r[1], cfg.cb)}</div><div style="width:90px;height:110px;margin:6px auto;border-radius:12px 12px 26px 26px;border:3px solid var(--ink-2);background:${col};transition:background .5s;box-shadow:inset 0 -14px 0 rgba(0,0,0,.08)"></div><div>${cfg.key ? cfg.b : cfg.a}: <b>${r[cfg.key]}/${r[0] + r[1]}</b> = ${N(U.round(key, 3))}</div></div>`;
    }
    function draw() {
      const cfg = M[mode]; const ka = A[cfg.key] / (A[0] + A[1]), kb = B[cfg.key] / (B[0] + B[1]);
      box.innerHTML = `<div style="text-align:center;font-weight:800;margin-bottom:6px">${cfg.ask}</div><div class="row" style="gap:10px;flex-wrap:wrap;justify-content:center">${can(A, cfg, cfg.names[0])}${can(B, cfg, cfg.names[1])}</div>`;
      f.out.innerHTML = Math.abs(ka - kb) < 1e-9 ? 'Hai hỗn hợp có <b>cùng tỉ lệ</b> — tỉ số tương đương!' : `So sánh phân số: ${N(U.round(ka, 3))} ${ka > kb ? '>' : '<'} ${N(U.round(kb, 3))} → <b>${ka > kb ? cfg.names[0] : cfg.names[1]}</b>. Mẹo: đổi tỉ số thành phân số của TỔNG, rồi so sánh.`;
    }
    const rg = (lab, arr, i) => VZ.range(lab, 1, 8, arr[i], 1, (v) => { arr[i] = v; draw(); });
    f.ctrls.append(VZ.seg([['paint', '🎨 Sơn'], ['juice', '🍊 Nước cam']], mode, (v) => { mode = v; const nv = v === 'juice' ? [2, 5, 1, 3] : [1, 2, 2, 3]; A[0] = nv[0]; A[1] = nv[1]; B[0] = nv[2]; B[1] = nv[3]; f.ctrls.querySelectorAll('input[type=range]').forEach((r, i) => { r.value = nv[i]; r.dispatchEvent(new Event('input')); }); draw(); SFX.play('pop'); }), rg('Hỗn hợp 1 – phần đầu', A, 0), rg('Hỗn hợp 1 – phần sau', A, 1), rg('Hỗn hợp 2 – phần đầu', B, 0), rg('Hỗn hợp 2 – phần sau', B, 1));
    draw();
  };
  APP.viz.recipeScaler = function (el) {
    const f = VZ.frame(el, 'Phóng to công thức nấu ăn — phương pháp rút về đơn vị', { icon: 'bulb' });
    const base = 4, ing = [['🌾 Bột mì', 200, 'g'], ['🥚 Trứng', 2, ''], ['🥛 Sữa', 300, 'mL'], ['🍬 Đường', 40, 'g']]; let n = 10, meth = 'unit'; const box = h('div'); f.stage.append(box);
    function draw() {
      const k = n / base; const mx = Math.max(...ing.map((x) => x[1])) * 5;
      box.innerHTML = `<div style="text-align:center;margin-bottom:8px">Công thức bánh kếp cho <b>${base}</b> người → cần cho <b style="color:var(--accent);font-size:1.2em">${n}</b> người</div>` + ing.map(([nm, q, u]) => { const v = U.round((q / base) * n, 2); return `<div style="display:grid;grid-template-columns:minmax(80px,110px) 1fr minmax(64px,auto);gap:8px;align-items:center;margin:5px 0"><span>${nm}</span><div style="height:18px;border-radius:9px;background:var(--line);overflow:hidden"><div style="height:100%;width:${Math.min(100, (v / (u === '' ? 10 : mx)) * 100)}%;background:linear-gradient(90deg,var(--number),var(--accent));transition:width .45s"></div></div><b>${N(v)} ${u}</b></div>`; }).join('');
      const steps = meth === 'unit' ? [`1 người: bột mì 200 ÷ ${base} = ${N(200 / base)} g`, `${n} người: ${n} × ${N(200 / base)} = <b>${N((200 / base) * n)} g</b>`] : (n % base === 0 ? [`${n} = ${base} × ${n / base} → nhân công thức với ${n / base}`, `Bột mì: 200 × ${n / base} = <b>${N(200 * (n / base))} g</b>`] : [`${n} = ${base} × ${Math.floor(n / base)} + ${n % base}`, `${Math.floor(n / base)} lần công thức: ${N(200 * Math.floor(n / base))} g; ${n % base} người: 200 ÷ ${base} × ${n % base} = ${N((200 / base) * (n % base))} g`, `Cộng lại: <b>${N((200 / base) * n)} g</b>`]);
      f.out.innerHTML = (meth === 'unit' ? '<b>Rút về đơn vị</b> (unitary): tìm lượng cho 1 người rồi nhân. ' : '<b>Cộng dồn</b> (build-up): dùng các bội và phần nhỏ của công thức. ') + steps.join(' → ') + `. Hệ số nhân: ${N(U.round(k, 3))}.`;
    }
    f.ctrls.append(VZ.range('Số người', 1, 24, n, 1, (v) => { n = v; draw(); }), VZ.seg([['unit', 'Rút về đơn vị'], ['build', 'Cộng dồn']], meth, (v) => { meth = v; draw(); SFX.play('flip'); }));
    draw();
  };
  APP.viz.goldenSpiral = function (el) {
    const f = VZ.frame(el, 'Hình chữ nhật vàng & dãy Fibonacci', { icon: 'atom' });
    let k = 8, anim = null; const W = 340, Hh = 220, svg = VZ.svg(W, Hh); const tb = h('div', { style: { overflowX: 'auto' } }); f.stage.append(svg, tb);
    const fib = [1, 1]; for (let i = 2; i < 14; i++) fib.push(fib[i - 1] + fib[i - 2]);
    function draw(prog = 1) {
      svg.innerHTML = ''; const sizes = fib.slice(0, k); const tot = fib[k - 1] + fib[k - 2] || 2; const sc = Math.min((W - 10) / tot, (Hh - 10) / fib[k - 1]);
      // build squares by spiral placement
      let x0 = 0, y0 = 0, x1 = 1, y1 = 1; const sq = [[0, 0, 1]]; for (let i = 1; i < k; i++) { const sz = sizes[i], d = i % 4; let x, y; if (d === 1) { x = x1; y = y0; x1 += sz; y1 = Math.max(y1, y0 + sz); } else if (d === 2) { x = x0; y = y1; y1 += sz; } else if (d === 3) { x = x0 - sz; y = y1 - sz; x0 -= sz; } else { x = x0; y = y0 - sz; y0 -= sz; } sq.push([x, y, sz]); }
      const bw = x1 - x0, bh = y1 - y0; const s2 = Math.min((W - 10) / bw, (Hh - 10) / bh); void sc; const ox = (W - bw * s2) / 2 - x0 * s2, oy = (Hh - bh * s2) / 2 - y0 * s2;
      const hues = [350, 30, 50, 140, 190, 220, 260, 300];
      sq.forEach(([x, y, z], i) => { if (i / k > prog) return; svg.append(s('rect', { x: ox + x * s2, y: oy + y * s2, width: z * s2, height: z * s2, fill: `hsl(${hues[i % 8]} 80% 60% / .35)`, stroke: 'var(--ink-2)', 'stroke-width': 1.2 })); if (z * s2 > 16) svg.append(s('text', { x: ox + (x + z / 2) * s2, y: oy + (y + z / 2) * s2 + 5, 'text-anchor': 'middle', 'font-size': Math.min(18, z * s2 * 0.35), 'font-weight': 800, fill: 'var(--ink)', text: z })); });
      // spiral arcs: quarter circle in each square
      let d = ''; sq.forEach(([x, y, z], i) => { if (i / k > prog) return; const dd = i % 4; const P = (px, py) => `${(ox + px * s2).toFixed(1)} ${(oy + py * s2).toFixed(1)}`; const r = z * s2; let a, b; if (dd === 0) { a = P(x, y + z); b = P(x + z, y); } else if (dd === 1) { a = P(x, y); b = P(x + z, y + z); } else if (dd === 2) { a = P(x + z, y); b = P(x, y + z); } else { a = P(x + z, y + z); b = P(x, y); } d += `${i ? 'L' : 'M'} ${a} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${b} `; });
      svg.append(s('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3 }));
      tb.innerHTML = `<table class="tbl" style="min-width:max-content;margin:6px auto 0"><tr><th>Fibonacci</th>${fib.slice(1, k + 1).map((v) => `<td>${v}</td>`).join('')}</tr><tr><th>tỉ số</th>${fib.slice(1, k + 1).map((v, i) => `<td>${i ? N(U.round(v / fib[i], 3)) : '—'}</td>`).join('')}</tr></table>`;
      f.out.innerHTML = `Mỗi số Fibonacci = tổng hai số trước. Tỉ số hai số liên tiếp: ${fib[k]} : ${fib[k - 1]} ≈ <b>${N(U.round(fib[k] / fib[k - 1], 4))}</b>, càng lúc càng gần <b>tỉ lệ vàng φ ≈ 1,618</b>.`;
    }
    f.ctrls.append(VZ.range('Số hình vuông', 3, 12, k, 1, (v) => { k = v; draw(); SFX.play('tick'); }), VZ.btn('Vẽ xoắn ốc ▶', () => { if (anim) anim(); SFX.play('whoosh'); anim = VZ.animate(2200, (e) => draw(e), () => SFX.play('complete')); }, 'btn sm sc'));
    draw();
  };
  APP.viz.musicRatio = function (el) {
    const f = VZ.frame(el, 'Âm nhạc là tỉ số: tần số của hai nốt', { icon: 'sound' });
    const IV = [['2:1', 'Quãng 8 (octave)', 2, 1], ['3:2', 'Quãng 5 đúng', 3, 2], ['4:3', 'Quãng 4 đúng', 4, 3], ['5:4', 'Quãng 3 trưởng', 5, 4], ['45:32', 'Quãng 4 tăng (nghịch tai)', 45, 32]]; let i = 1; const W = 360, H = 160, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      const [, nm, p, q] = IV[i]; svg.innerHTML = ''; const base = 220; const path = (fr, amp, yc) => { let d = ''; for (let x = 0; x <= W; x += 2) { const t = (x / W) * 4; d += (x ? 'L' : 'M') + x + ' ' + (yc - amp * Math.sin(2 * Math.PI * fr * t / q)).toFixed(1); } return d; };
      svg.append(s('path', { d: path(q, 22, 40), fill: 'none', stroke: 'var(--number)', 'stroke-width': 2.5 }), s('path', { d: path(p, 22, 95), fill: 'none', stroke: 'var(--algebra)', 'stroke-width': 2.5 }));
      if (p < 10) for (let k = 0; k <= 4; k++) svg.append(s('line', { x1: (k * W) / 4, y1: 10, x2: (k * W) / 4, y2: 125, stroke: 'var(--accent)', 'stroke-dasharray': '4 4' }));
      svg.append(s('text', { x: W / 2, y: H - 12, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: 'var(--ink)', text: `${nm}: ${base} Hz : ${N(U.round((base * p) / q, 1))} Hz = ${q} : ${p}` }));
      f.out.innerHTML = p < 10 ? `Sau mỗi chu kì chung, hai sóng lại gặp nhau (vạch đứt). Tỉ số càng đơn giản → âm càng “êm tai”. Nốt cao rung ${p} lần trong khi nốt thấp rung ${q} lần.` : 'Tỉ số 45 : 32 rất phức tạp — hai sóng hiếm khi gặp nhau, nghe “chói” hơn.';
    }
    const play = () => { SFX.init(); if (SFX.ctx && SFX.ctx.state === 'suspended') SFX.ctx.resume(); const [, , p, q] = IV[i]; SFX.tone(220, 1.2, 'triangle', 0.16, 0); SFX.tone((220 * p) / q, 1.2, 'triangle', 0.16, 0.6); SFX.tone(220, 1.4, 'triangle', 0.12, 1.4); SFX.tone((220 * p) / q, 1.4, 'triangle', 0.12, 1.4); };
    f.ctrls.append(VZ.seg(IV.map((v, k) => [k, v[0]]), i, (v) => { i = +v; draw(); }), VZ.btn('▶ Nghe', play, 'btn sm sc'));
    draw();
  };
  APP.viz.gearRatio = function (el) {
    const f = VZ.frame(el, 'Bánh răng xe đạp: tỉ số số răng', { icon: 'atom' });
    let A = 36, B = 12, sp = 1; const box = h('div', { style: { position: 'relative', height: 'min(62vw, 260px)' } }); f.stage.append(box);
    let ang = 0;
    const gear = (c, x, y, teeth, rot, col) => { const r = teeth * 2.1, rt = r + 7; c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); for (let i = 0; i < teeth * 2; i++) { const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r : rt; c.arc(0, 0, rr, a0, a1); } c.closePath(); c.fillStyle = col; c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(0, 0, r * 0.3, 0, 7); c.fill(); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(r * 0.65, 0, 5, 0, 7); c.fill(); c.restore(); return r; };
    const lp = VZ.canvasLoop(box, (c, w, hh) => {
      c.clearRect(0, 0, w, hh); const k = Math.min(1, w / 420); c.save(); c.scale(k, k); const W2 = w / k, H2 = hh / k; ang += 0.012 * sp; const ra = A * 2.1, rb = B * 2.1; const xa = W2 * 0.33, xb = Math.min(W2 - rb - 20, xa + ra + rb + 90), y = H2 / 2;
      c.strokeStyle = '#555'; c.lineWidth = 4; c.beginPath(); c.moveTo(xa, y - ra - 4); c.lineTo(xb, y - rb - 4); c.moveTo(xa, y + ra + 4); c.lineTo(xb, y + rb + 4); c.stroke();
      gear(c, xa, y, A, ang, '#4f8cff'); gear(c, xb, y, B, ang * (A / B), '#ef476f'); c.restore();
    });
    lp.cv.style.width = '100%'; lp.cv.style.height = '100%';
    const out = () => { const [p, q] = simp(A, B); f.out.innerHTML = `Đĩa trước ${A} răng : líp sau ${B} răng = <b>${p} : ${q}</b>. Mỗi vòng đạp, bánh sau quay <b>${N(U.round(A / B, 2))}</b> vòng. Tỉ số lớn → đi nhanh nhưng đạp nặng; tỉ số nhỏ → leo dốc dễ hơn.`; };
    f.ctrls.append(VZ.range('Răng đĩa trước', 24, 52, A, 2, (v) => { A = v; out(); }), VZ.range('Răng líp sau', 10, 36, B, 2, (v) => { B = v; out(); }), VZ.range('Tốc độ đạp', 0, 3, sp, 0.5, (v) => { sp = v; }));
    out();
  };
  APP.viz.heroRatio = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#1a1030'; c.fillRect(0, 0, w, hh); const phi = 1.618034; const cx = w * 0.62, cy = hh * 0.52; const sc = Math.min(w, hh) * 0.012;
      c.save(); c.translate(cx, cy); c.rotate(t * 0.15);
      for (let i = 0; i < 260; i++) { const a = i * 2.39996, r = Math.sqrt(i) * sc * 3.2; c.fillStyle = `hsl(${(i * 1.3 + t * 30) % 360} 80% 62%)`; c.beginPath(); c.arc(r * Math.cos(a), r * Math.sin(a), 2 + Math.sqrt(i) * 0.22, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(255,209,102,.85)'; c.lineWidth = 3; c.beginPath(); for (let th = 0; th < 14; th += 0.04) { const r = 2 * Math.pow(phi, (th * 2) / Math.PI); const x = r * Math.cos(th + t * 0.5), y = r * Math.sin(th + t * 0.5); th ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(Math.min(w, hh) * 0.08)}px Lexend, sans-serif`; c.fillText('φ ≈ 1.618', w * 0.06, hh * 0.85);
    });
  };

  /* ---------- question helpers ---------- */
  const simpQ = (a, b, u = '', o = {}) => { const [p, q] = simp(a, b); return ratio(`Write ${a}${u ? ' ' + u : ''} : ${b}${u ? ' ' + u : ''} in its simplest form.`, [p, q], `HCF(${a}, ${b}) = ${U.gcd(a, b)}. Divide both numbers by ${U.gcd(a, b)}: ${p} : ${q}.${u ? ' The units are the same, so you can ignore them.' : ''}`, Object.assign({ simplest: true }, o)); };
  const shareQ = (amt, a, b, who = ['Dong', 'Chul'], unit = '$', o = {}) => { const one = amt / (a + b); const pre = unit === '$' ? '$' : ''; const suf = unit === '$' ? '' : ' ' + unit; return fill(`Share ${pre}${amt}${suf} between ${who[0]} and ${who[1]} in the ratio ${a} : ${b}.`, [a * one, b * one], `Total parts ${a} + ${b} = ${a + b}. One part = ${amt} ÷ ${a + b} = ${N(one)}. ${who[0]}: ${a} × ${N(one)} = ${N(a * one)}; ${who[1]}: ${b} × ${N(one)} = ${N(b * one)}.`, Object.assign({ f: `${who[0]} gets ${pre}[]${suf} &nbsp; ${who[1]} gets ${pre}[]${suf}` }, o)); };

  APP.addUnit({
    n: 12, strand: 'number', title: 'Ratio and proportion', vi: 'Tỉ số và tỉ lệ thức',
    blurb: 'A ratio is a way of comparing two or more numbers or quantities. You use the symbol : to show ratio. Ratios were used a long time before this symbol was invented: historians believe that Pythagoras (about 570 to 495 BCE) discovered the golden ratio. Today you use ratios in everyday life, often without knowing it — builders mix sand and cement for concrete, and chefs mix ingredients for cakes.',
    blurbVi: 'Chương này học rút gọn và so sánh tỉ số, chia một lượng theo tỉ số cho trước, và giải bài toán tỉ lệ thuận bằng phương pháp rút về đơn vị hoặc cộng dồn.',
    words: [['ratio', 'tỉ số'], ['proportion', 'tỉ lệ'], ['simplify', 'rút gọn'], ['simplest form', 'dạng tối giản'], ['highest common factor', 'ước chung lớn nhất'], ['equivalent ratio', 'tỉ số tương đương'], ['share', 'chia (phần)'], ['divide', 'chia'], ['part', 'phần'], ['twice as much', 'gấp đôi'], ['half as much', 'một nửa'], ['direct proportion', 'tỉ lệ thuận'], ['unitary method', 'phương pháp rút về đơn vị'], ['build-up method', 'phương pháp cộng dồn'], ['recipe', 'công thức nấu ăn'], ['ingredient', 'nguyên liệu'], ['golden ratio', 'tỉ lệ vàng'], ['conjecture', 'phỏng đoán'], ['scale model', 'mô hình thu nhỏ']],
    chat: ['Rút gọn tỉ số 24 : 36 thế nào?', 'Chia $50 theo tỉ số 2 : 3?', 'Phương pháp rút về đơn vị là gì?'],
    sections: [
      {
        id: '12.1', t: 'Simplifying ratios', vi: 'Rút gọn tỉ số',
        goals: ['simplify and compare ratios.'],
        body: [
          ['p', 'In this necklace there are two red beads and six yellow beads. You can write the ratio of red beads to yellow beads as <b>2 : 6</b>. You say “the ratio of red beads to yellow beads is two to six.” For every one red bead there are three yellow beads, so you can simplify the ratio 2 : 6 to <b>1 : 3</b>.'],
          ['rule', 'You write a ratio in its <b>simplest form</b> by dividing the numbers in the ratio by the <b>highest common factor</b>. A ratio written in its simplest form must not contain any decimals or fractions.', 'Simplest form'],
          ['viz', 'beadRatio'],
          ['ex', { t: 'Worked example 12.1', q: 'a The rectangle is made of blue and green squares. i Write the ratio of blue squares to green squares. ii Write the ratio in its simplest form. b A model car is 6 cm high. The real car is 160 cm high. Write the ratio model : real in its simplest form.', fig: squares(8, 12, '#2bb673', 5), steps: ['a i: blue : green = <b>8 : 12</b>.', 'a ii: HCF of 8 and 12 is 4, so 8 : 12 = <b>2 : 3</b>.', 'b: 6 cm : 160 cm → 6 : 160 (same units, so ignore them). HCF = 2 → <b>3 : 80</b>.'] }],
          ['tip', 'Order matters! “Margarine to flour” is not the same as “flour to margarine”. 50 g : 200 g = 1 : 4, but 200 g : 50 g = 4 : 1.'],
          ['viz', 'paintMixer'],
          ['p', 'To compare ratios, write each part as a <b>fraction of the total</b>. Bryn mixes white : blue = 1 : 2, so 2/3 of his paint is blue. Alun mixes 2 : 3, so 3/5 of his paint is blue. 2/3 ≈ 0.667 and 3/5 = 0.6, so Bryn has the darker blue paint.'],
          ['vi', ['Tỉ số a : b so sánh hai đại lượng cùng loại (cùng đơn vị).', 'Rút gọn: chia cả hai số cho ƯCLN. Dạng tối giản không chứa số thập phân hay phân số (4 : 6 = 2 : 3, không phải 1 : 1,5).', 'Thứ tự quan trọng: “đỏ : vàng” khác “vàng : đỏ”.', 'So sánh tỉ số: đổi mỗi phần thành phân số của tổng, rồi so sánh (đổi ra số thập phân).']],
        ],
        bank: [
          ratio('Write down the ratio of green beads to blue beads, in its simplest form.', [1, 2], '3 green and 6 blue: 3 : 6 = 1 : 2.', { simplest: true, fig: necklace(3, 6) }),
          ratio('Write down the ratio of green beads to blue beads, in its simplest form.', [2, 1], '8 green and 4 blue: 8 : 4 = 2 : 1.', { simplest: true, fig: necklace(8, 4) }),
          ratio('Write down the ratio of blue squares to green squares, in its simplest form.', [1, 3], '4 blue and 12 green: 4 : 12 = 1 : 3.', { simplest: true, fig: squares(4, 12, '#2bb673', 4) }),
          mcq('6 : 12 written in its simplest form is:', ['3 : 6', '1 : 6', '1 : 2'], 2, 'HCF = 6.', { fixed: true }),
          mcq('3 : 18 written in its simplest form is:', ['1 : 6', '1 : 5', '1 : 4'], 0, 'HCF = 3.', { fixed: true }),
          mcq('20 : 4 written in its simplest form is:', ['10 : 2', '1 : 5', '5 : 1'], 2, 'HCF = 4. Keep the order: 5 : 1.', { fixed: true }),
          mcq('24 : 6 written in its simplest form is:', ['12 : 3', '4 : 1', '8 : 2'], 1, 'HCF = 6.', { fixed: true }),
          simpQ(2, 8), simpQ(2, 12), simpQ(3, 15, 'hours'), simpQ(4, 12, 'cm'), simpQ(60, 5), simpQ(14, 7, 'days'), simpQ(54, 9, 'mL'),
          ratio('Look at this sequence: 32, 28, __, 20, 16, __, 8, 4. Write the ratio of the first missing number to the second missing number, in its simplest form.', [2, 1], 'The sequence goes down by 4: the missing numbers are 24 and 12. 24 : 12 = 2 : 1.', { simplest: true, d: 2 }),
          ratio('The Eiffel Tower is 324 metres tall. Pierre’s model is 3 metres tall. Write the ratio real : model, in its simplest form.', [108, 1], '324 : 3 = 108 : 1.', { simplest: true, app: true }),
          mcq('8 : 12 written in its simplest form is:', ['8 : 3', '2 : 3', '1 : 1.5'], 1, '1 : 1.5 contains a decimal, so it is not in its simplest form.', { fixed: true }),
          mcq('4 : 18 written in its simplest form is:', ['1 : 4.5', '9 : 2', '2 : 9'], 2, 'HCF = 2.', { fixed: true }),
          simpQ(6, 21, 'weeks'), simpQ(8, 10, 'mL'), simpQ(8, 14, 'tonnes'), simpQ(28, 12, 'km'), simpQ(21, 9, 'litres'),
          mcq('A pastry recipe uses 200 g flour, 50 g margarine and 50 g lard. Helena says, “The ratio of margarine to flour is 4 : 1.” What is her mistake?', ['She wrote the ratio the wrong way round — margarine : flour = 1 : 4', 'She did not simplify', 'She should include the lard', 'There is no mistake'], 0, '50 : 200 = 1 : 4. Flour : margarine would be 4 : 1.'),
          ratio('In a recipe, Vipul uses 45 mL of vinegar and 120 mL of oil. Write the ratio vinegar : oil in its simplest form.', [3, 8], 'HCF(45, 120) = 15: 3 : 8.', { simplest: true }),
          mcq('Bryn mixes white paint with blue paint in the ratio 1 : 2. Alun mixes white with blue in the ratio 2 : 3. Who has the darker blue paint?', ['Bryn (2/3 is blue)', 'Alun (3/5 is blue)', 'They are the same'], 0, '2/3 ≈ 0.667 > 3/5 = 0.6.', { fixed: true, d: 2 }),
          mcq('Melania mixes orange juice with water in the ratio 2 : 5. Boris uses the ratio 1 : 3. Who has the higher proportion of orange juice?', ['Melania (2/7 ≈ 0.29)', 'Boris (1/4 = 0.25)', 'They are the same'], 0, '2/7 ≈ 0.286 > 1/4 = 0.25.', { fixed: true, d: 2 }),
          fill('Borrowdale golf club has 15 women and 60 men. Avondale has 12 women and 56 men. Write each ratio women : men in its simplest form.', [{ opts: ['1 : 4', '4 : 1', '3 : 12', '1 : 3'], a: 0 }, { opts: ['3 : 14', '14 : 3', '6 : 28', '1 : 4'], a: 0 }], '15 : 60 = 1 : 4 and 12 : 56 = 3 : 14.', { f: 'Borrowdale: [] &nbsp; Avondale: []' }),
          mcq('Which club has the greater proportion of men? (Borrowdale 1 : 4, Avondale 3 : 14, women : men)', ['Avondale (14/17 ≈ 0.82)', 'Borrowdale (4/5 = 0.8)', 'They are the same'], 0, 'Men as a fraction: Borrowdale 4/5 = 0.8; Avondale 14/17 ≈ 0.824.', { fixed: true, d: 3 }),
          mcq('The next year, 7 women and 6 men join Borrowdale (now 22 : 66) and 12 women and 10 men join Avondale (now 24 : 66). Which club now has the greater proportion of men?', ['Borrowdale (3/4 = 0.75)', 'Avondale (11/15 ≈ 0.73)', 'They are the same'], 0, '22 : 66 = 1 : 3 → men 3/4 = 0.75; 24 : 66 = 4 : 11 → men 11/15 ≈ 0.733.', { fixed: true, d: 3 }),
          mcq('Is the ratio 20x : 15x written in its simplest form?', ['No — it simplifies to 4 : 3', 'Yes, because it contains x', 'No — it simplifies to 4x : 3', 'Yes, 20 and 15 have no common factor'], 0, 'HCF is 5x, so 20x : 15x = 4 : 3.', { d: 3 }),
          multi('Which ratios are equivalent to 1 : 2?', ['2 : 4', '3 : 5', '7 : 14', '6 : 3', '10 : 20', '8 : 9'], [0, 2, 4], 'The second number must be twice the first.', { fixed: true }),
          match('Match each ratio with an equivalent ratio.', [['1 : 3', '2 : 6'], ['4 : 1', '12 : 3'], ['2 : 5', '6 : 15'], ['3 : 2', '6 : 4']], 'Multiply or divide both numbers by the same value.'),
          gen(() => { const g = R(2, 9), p = R(1, 9), q = R(1, 9); if (U.gcd(p, q) !== 1 || p === q) return null; return simpQ(p * g, q * g); }),
          gen(() => { const g = pick([5, 10, 20, 25]), p = R(1, 7), q = R(1, 7); if (U.gcd(p, q) !== 1 || p === q) return null; const u = pick(['g', 'kg', 'mL', 'cm', 'minutes']); return simpQ(p * g, q * g, u); }),
          gen(() => { const a = R(1, 5), b = R(2, 7), c = R(1, 5), d = R(2, 7); const fa = a / (a + b), fc = c / (c + d); if (Math.abs(fa - fc) < 0.02 || U.gcd(a, b) !== 1 || U.gcd(c, d) !== 1) return null; return mcq(`Juice A mixes cordial with water in the ratio ${a} : ${b}. Juice B uses ${c} : ${d}. Which has the higher proportion of cordial?`, ['Juice A', 'Juice B', 'They are the same'], fa > fc ? 0 : 1, `A: ${a}/${a + b} ≈ ${N(U.round(fa, 3))}; B: ${c}/${c + d} ≈ ${N(U.round(fc, 3))}.`, { fixed: true, app: true }); }, { app: true }),
          gen(() => { const real = pick([160, 180, 240, 450, 1200]), mod = pick([4, 6, 8, 12, 15]); const [p, q] = simp(mod, real); return ratio(`A model is ${mod} cm high. The real object is ${real} cm high. Write the ratio model : real in its simplest form.`, [p, q], `HCF(${mod}, ${real}) = ${U.gcd(mod, real)}: ${p} : ${q}.`, { simplest: true, app: true }); }, { app: true }),
        ],
      },
      {
        id: '12.2', t: 'Sharing in a ratio', vi: 'Chia theo tỉ số',
        goals: ['divide an amount into two parts in a given ratio.'],
        body: [
          ['p', 'Sally and Bob buy a car for $15 000. Sally pays $10 000 and Bob pays $5000. Sally : Bob = 10 000 : 5000 = 2 : 1, so Sally paid twice as much as Bob. Five years later they sell the car for $9000. Sally should get twice as much as Bob.'],
          ['rule', '① Add the numbers in the ratio to find the total number of parts.<br>② Divide the amount by the total number of parts to find the value of one part.<br>③ Multiply to work out the value of each share. ✔ Check that the shares add up to the amount.', 'To share in a given ratio'],
          ['viz', 'shareBar'],
          ['ex', { t: 'Worked example 12.2', q: 'Share $9000 between Sally and Bob in the ratio 2 : 1.', steps: ['Total number of parts: 2 + 1 = 3.', 'Value of one part: $9000 ÷ 3 = $3000.', 'Sally gets $3000 × 2 = <b>$6000</b>; Bob gets $3000 × 1 = <b>$3000</b>.', 'Check: $6000 + $3000 = $9000 ✔'] }],
          ['tip', 'A ratio a : b gives fractions of the total: the first part is a/(a + b) and the second part is b/(a + b). Brazil nuts : walnuts = 4 : 5 means 4/9 of the bags are Brazil nuts. Simplify the ratio first to make the numbers easier (80 : 40 = 2 : 1).'],
          ['vi', ['Bước 1: cộng các số trong tỉ số → tổng số phần.', 'Bước 2: lấy tổng lượng chia cho tổng số phần → giá trị 1 phần.', 'Bước 3: nhân giá trị 1 phần với số phần của mỗi người.', 'Luôn kiểm tra: tổng các phần = lượng ban đầu.', 'Đại số: chia E theo c : d → người thứ nhất được cE/(c + d).']],
        ],
        bank: [
          fill('Share $45 between Ethan and Julie in the ratio 1 : 4. Complete the workings.', [5, 9, 9, 36], '1 + 4 = 5 parts; $45 ÷ 5 = $9; Ethan 1 × 9 = $9; Julie 4 × 9 = $36.', { f: 'Total number of parts: 1 + 4 = [] &nbsp; Value of one part: $45 ÷ 5 = $[] &nbsp; Ethan gets $[] &nbsp; Julie gets $[]' }),
          shareQ(24, 1, 2), shareQ(65, 1, 4), shareQ(48, 3, 1), shareQ(30, 5, 1), shareQ(21, 1, 6), shareQ(64, 7, 1),
          shareQ(35, 2, 3, ['Lin', 'Kuan-yin']), shareQ(49, 3, 4, ['Lin', 'Kuan-yin']), shareQ(32, 5, 3, ['Lin', 'Kuan-yin']), shareQ(90, 7, 3, ['Lin', 'Kuan-yin']),
          fill('Raine and Abella share an electricity bill of $72 in the ratio 5 : 4. Complete Lily’s solution.', [9, 8, 40, 32], '5 + 4 = 9; $72 ÷ 9 = $8; Raine 5 × 8 = $40; Abella 4 × 8 = $32. Check: 40 + 32 = 72.', { f: 'Total parts: [] &nbsp; One part: $[] &nbsp; Raine pays $[] &nbsp; Abella pays $[]', app: true }),
          frac('A shop sells bags of Brazil nuts and walnuts in the ratio 4 : 5. What fraction of the bags are walnuts?', [5, 9], '4 + 5 = 9 parts; walnuts are 5 of them: 5/9.'),
          fill('A school choir has girls and boys in the ratio 4 : 3. There are 35 students in the choir.', [15, 20], '4 + 3 = 7; 35 ÷ 7 = 5; boys 3 × 5 = 15, girls 4 × 5 = 20.', { f: 'Boys: [] &nbsp; Girls: []' }),
          frac('A choir has girls and boys in the ratio 4 : 3. What fraction of the students are boys?', [3, 7], 'Boys are 3 parts out of 7.'),
          fill('Brad pays $80 and Lola pays $40 for a painting. They sell it for $630. Simplify the ratio first, then share.', [{ opts: ['2 : 1', '80 : 40', '1 : 2', '4 : 2'], a: 0 }, 420, 210], '80 : 40 = 2 : 1. One part = 630 ÷ 3 = 210. Brad gets $420, Lola gets $210.', { f: 'Ratio in simplest form: [] &nbsp; Brad gets $[] &nbsp; Lola gets $[]', d: 2 }),
          mcq('Arun (14 years, 58 kg) and Marcus (16 years, 62 kg) share $240 either in the ratio of their ages or of their masses. Which is better for Arun?', ['masses — he gets $116 instead of $112', 'ages — he gets $116 instead of $112', 'ages — he gets $120', 'They give the same amount'], 0, 'Ages 14 : 16 = 7 : 8 → 240 ÷ 15 × 7 = $112. Masses 58 : 62 = 29 : 31 → 240 ÷ 60 × 29 = $116.', { d: 3, app: true }),
          num('Auntie Bea shares $320 between her nieces aged 3 and 7 in the ratio of their ages. In 5 years’ time (ages 8 and 12), how much MORE will the younger niece get than this year?', 32, 'This year 3 : 7 → 320 ÷ 10 × 3 = $96. In 5 years 8 : 12 = 2 : 3 → 320 ÷ 5 × 2 = $128. 128 − 96 = $32.', { pre: '$', d: 3 }),
          mcq('Carys and Damien share $E in the ratio c : d. Which expression gives the amount Carys will get?', ['cE/(c + d)', 'E/c', 'cE/d', '(c + d)E/c'], 0, 'One part is E/(c + d); Carys has c parts.', { d: 3 }),
          shareQ(15, 1, 2, ['Tao', 'Chris']), shareQ(25, 4, 1, ['Tao', 'Chris']), shareQ(45, 3, 2, ['Tao', 'Chris'], 'kg'), shareQ(24, 5, 3, ['Tao', 'Chris'], 'litres'),
          gen(() => { const a = R(1, 7), b = R(1, 7); if (U.gcd(a, b) !== 1) return null; const one = R(2, 25); return shareQ(one * (a + b), a, b, pick([['Ana', 'Ben'], ['Kim', 'Leo'], ['Mia', 'Omar'], ['Sam', 'Tia']])); }),
          gen(() => { const a = R(2, 5), b = R(1, 4); if (U.gcd(a, b) !== 1 || a === b) return null; const one = R(3, 12); const tot = one * (a + b); return num(`A bag has red and blue counters in the ratio ${a} : ${b}. There are ${tot} counters. How many are red?`, a * one, `${a} + ${b} = ${a + b} parts; ${tot} ÷ ${a + b} = ${one}; red = ${a} × ${one} = ${a * one}.`); }),
          gen(() => { const a = R(1, 4), b = R(2, 6); if (U.gcd(a, b) !== 1) return null; const one = pick([50, 100, 150, 200, 250]); return fill(`Concrete is made by mixing cement and sand in the ratio ${a} : ${b}. A builder needs ${one * (a + b)} kg of concrete mix.`, [a * one, b * one], `${a + b} parts; one part = ${one} kg.`, { f: 'Cement: [] kg &nbsp; Sand: [] kg', app: true }); }, { app: true }),
          gen(() => { const a = R(1, 5), b = R(1, 5); if (U.gcd(a, b) !== 1 || a === b) return null; return frac(`Two friends share a prize in the ratio ${a} : ${b}. What fraction of the prize does the first friend get?`, [a, a + b], `${a} parts out of ${a + b}.`); }),
        ],
      },
      {
        id: '12.3', t: 'Using direct proportion', vi: 'Tỉ lệ thuận',
        goals: ['use the unitary method to solve problems involving ratio and direct proportion.'],
        body: [
          ['p', 'Two quantities are in <b>direct proportion</b> when their ratio stays the same as the quantities increase or decrease. One packet of rice costs $3.25, so two packets cost <b>twice as much</b>: 2 × $3.25 = $6.50. Six concert tickets cost $120, so three tickets cost <b>half as much</b>: $120 ÷ 2 = $60.'],
          ['ex', { t: 'Worked example 12.3', q: 'a Three books cost $12. Work out the cost of 10 books. b A recipe uses two eggs to make 12 cupcakes. How many eggs are needed to make 36 cupcakes?', steps: ['a: one book costs $12 ÷ 3 = $4, so 10 books cost 10 × $4 = <b>$40</b>.', 'b: 36 ÷ 12 = 3, so multiply the recipe by 3: 2 × 3 = <b>6 eggs</b>.'] }],
          ['rule', 'The <b>unitary method</b>: first find the value of ONE item, then multiply to find the value of the number you need.', 'Unitary method'],
          ['viz', 'recipeScaler'],
          ['p', 'A recipe uses 450 g of rice for six people. <b>Unitary method:</b> one person needs 450 ÷ 6 = 75 g, so nine people need 9 × 75 = 675 g. <b>Build-up method:</b> three people need 450 ÷ 2 = 225 g, so nine people need 450 + 225 = 675 g. Both methods give the same answer.'],
          ['vi', ['Tỉ lệ thuận: một đại lượng tăng (giảm) bao nhiêu lần thì đại lượng kia cũng tăng (giảm) bấy nhiêu lần.', 'Rút về đơn vị: tìm giá trị của 1 đơn vị (chia), rồi nhân với số đơn vị cần.', 'Cộng dồn: dùng các bội hoặc phần nhỏ (một nửa, gấp đôi…) rồi cộng lại — tiện khi tính nhẩm.', 'Đổi tiền tệ cũng là tỉ lệ thuận: USD 100 = ZAR 1400 → USD 1 = ZAR 14.']],
        ],
        bank: [
          fill('The mass of three bananas is 375 grams. Complete the working to find the mass of eight bananas.', [125, 1000], 'One banana: 375 ÷ 3 = 125 g; eight bananas: 8 × 125 = 1000 g.', { f: 'One banana: 375 ÷ 3 = [] g &nbsp; Eight bananas: 8 × 125 = [] g' }),
          fill('Tom buys two bags of chips for $2.40. Work out the cost of:', [1.2, 6], 'One bag: $1.20; five bags: 5 × 1.20 = $6.', { f: 'one bag: $[] &nbsp; five bags: $[]', app: true }),
          fill('Joy exchanges USD 100 for ZAR 1400.', [14, 84], '1400 ÷ 100 = 14; 6 × 14 = 84.', { f: 'USD 1 = ZAR [] &nbsp; USD 6 = ZAR []', app: true }),
          num('Ivan buys four shirts for $37.80. Work out the cost of nine shirts.', 85.05, 'One shirt: 37.80 ÷ 4 = $9.45; nine shirts: 9 × 9.45 = $85.05.', { pre: '$', d: 2, app: true }),
          num('Dakri buys seven tickets to a show for $112. How much do three tickets cost?', 48, 'One ticket: 112 ÷ 7 = $16; 3 × 16 = $48.', { pre: '$', app: true }),
          num('A recipe uses 360 grams of flour for four people. How much flour is needed for three people?', 270, 'One person: 360 ÷ 4 = 90 g; 3 × 90 = 270 g.', { unit: 'g' }),
          fill('A recipe uses 450 grams of rice for six people. How much rice is needed for:', [1800, 675], 'One person: 75 g. 24 × 75 = 1800 g; 9 × 75 = 675 g.', { f: '24 people? [] g &nbsp; nine people? [] g' }),
          fill('A recipe for four people uses 800 g of potato. Use the build-up method.', [5, 4000, 400, 1200], '20 ÷ 4 = 5 → 800 × 5 = 4000 g. Two people: 400 g, so six people: 800 + 400 = 1200 g.', { f: '20 ÷ 4 = [] &nbsp; 20 people: [] g &nbsp; two people: [] g &nbsp; six people: [] g' }),
          mcq('Irene says: “A recipe for six people uses 300 g of rice. For 15 people: 6 + 9 = 15. Three people need 150 g, so nine people need 300 + 150 = 450 g. Altogether 450 g.” What is her mistake?', ['She forgot to add the 300 g for the first six people — the answer is 750 g', 'She should have multiplied 300 by 15', 'Three people need 100 g', 'There is no mistake'], 0, '6 people 300 g + 9 people 450 g = 750 g (or 50 g × 15 = 750 g).', { d: 2 }),
          mcq('A teacher pays $105 for 30 homework books. She buys two more books and says the total is now $121. Is she correct?', ['No — each book costs $3.50, so 32 books cost $112', 'Yes', 'No — 32 books cost $128', 'No — 32 books cost $107'], 0, '105 ÷ 30 = 3.50; 32 × 3.50 = $112.', { d: 2, app: true }),
          fill('Li-Ming buys two packets of chips for $1.40. Work out the cost of:', [0.7, 3.5], 'One packet: $0.70; five: $3.50.', { f: 'one packet: $[] &nbsp; five packets: $[]' }),
          fill('The mass of four tins of beans is 1.6 kilograms. Work out the mass of:', [4.8, 4], 'One tin: 0.4 kg. 12 × 0.4 = 4.8 kg; 10 × 0.4 = 4 kg.', { f: '12 tins: [] kg &nbsp; 10 tins: [] kg' }),
          num('A 5 litre tin of paint covers 20 m² of wall. How many square metres will 15 litres of the same paint cover?', 60, '15 is 3 × 5, so 3 × 20 = 60 m².', { unit: 'm²' }),
          fill('One pen costs 80 cents. How much does it cost to buy:', [1.6, 4, 16], '2 × 0.80 = $1.60; 5 × 0.80 = $4; 20 × 0.80 = $16.', { f: 'two pens: $[] &nbsp; five pens: $[] &nbsp; 20 pens: $[]' }),
          mcq('Which pair of quantities is in direct proportion?', ['the number of tickets bought and the total cost', 'a person’s age and their height', 'the number of workers and the time to build a wall', 'the temperature and the day of the week'], 0, 'Twice as many tickets cost twice as much.'),
          gen(() => { const k = R(2, 9), p = pick([1.2, 1.5, 2.5, 3.25, 4, 0.8, 12]); const m = R(2, 12); if (m === k) return null; return num(`${k} identical items cost $${(k * p).toFixed(2)}. Work out the cost of ${m} items.`, U.round(m * p, 2), `One item: ${(k * p).toFixed(2)} ÷ ${k} = $${p.toFixed(2)}; ${m} × ${p} = $${U.round(m * p, 2).toFixed(2)}.`, { pre: '$', app: true }); }, { app: true }),
          gen(() => { const ppl = pick([4, 5, 6, 8]), per = pick([25, 40, 50, 60, 75, 90]); const n = R(2, 15); if (n === ppl) return null; const ing = pick(['flour', 'rice', 'pasta', 'sugar']); return num(`A recipe for ${ppl} people uses ${ppl * per} g of ${ing}. How much ${ing} is needed for ${n} people?`, n * per, `One person: ${ppl * per} ÷ ${ppl} = ${per} g; ${n} × ${per} = ${n * per} g.`, { unit: 'g', app: true }); }, { app: true }),
          gen(() => { const eggs = R(2, 4), cakes = pick([6, 8, 10, 12]), k = R(2, 5); return num(`A recipe uses ${eggs} eggs to make ${cakes} cupcakes. How many eggs are needed to make ${cakes * k} cupcakes?`, eggs * k, `${cakes * k} ÷ ${cakes} = ${k}, so ${eggs} × ${k} = ${eggs * k} eggs.`); }),
          gen(() => { const r = pick([14, 18, 21, 25, 80, 110]); const a = pick([50, 100, 200]); const b = R(3, 30); return num(`You can exchange ${a} dollars for ${a * r} units of another currency. How many units can you get for ${b} dollars?`, b * r, `1 dollar = ${a * r} ÷ ${a} = ${r} units; ${b} × ${r} = ${b * r}.`, { app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Ratios hidden in nature, music and machines', hero: 'heroRatio',
      lead: 'The same simple idea — comparing two numbers — explains why music sounds pleasant, how a bicycle climbs a hill and why sunflowers pack their seeds so neatly.',
      leadVi: 'Cùng một ý tưởng đơn giản — so sánh hai số — giải thích vì sao âm nhạc nghe êm tai, xe đạp leo dốc thế nào và vì sao hạt hướng dương xếp khít đến thế.',
      cards: [
        { t: 'The golden rectangle', p: 'If you cut a square from a golden rectangle, the piece left over has the same shape as the original. Repeat this and a beautiful spiral appears. The ratio of the sides is about 1.618 : 1 — and the ratios of Fibonacci numbers get closer and closer to it.', viz: 'goldenSpiral' },
        { t: 'Music is made of ratios', p: 'About 2500 years ago, Pythagoras noticed that strings whose lengths are in simple ratios, such as 2 : 1 or 3 : 2, sound good together. Today we know that the frequencies of the two notes are in that ratio. Press play and listen!', viz: 'musicRatio' },
        { t: 'Bicycle gears', p: 'A chain joins the front chainring to a rear sprocket. If the front has 36 teeth and the back has 12, the ratio is 3 : 1 — the back wheel turns three times for every turn of the pedals.', viz: 'gearRatio' },
        { t: 'Mixing colours', p: 'Painters and printers must keep the same ratio of colours every time, or a new tin of paint will not match the old one. The proportion of each colour, not the amount, decides the shade.', viz: 'paintMixer' },
      ],
      facts: [['1.618…', 'golden ratio φ', 'A never-ending, never-repeating decimal.'], ['2 : 1', 'octave', 'Double the frequency — the “same” note, higher.'], ['1 : 2 : 3', 'concrete', 'Cement : sand : gravel in a common mix.'], ['√2 : 1', 'A4 paper', 'Fold it in half and the ratio stays the same.']],
      challenge: { t: 'Three-way share', p: 'Ana, Ben and Cara share $180 in the ratio 2 : 3 : 4. How much does each person get? Then Cara gives Ana $20. What is the new ratio, in its simplest form?', a: '2 + 3 + 4 = 9 parts; one part = $20. Ana $40, Ben $60, Cara $80. After the gift: Ana $60, Ben $60, Cara $60 → 1 : 1 : 1.' },
    },
    reading: {
      title: 'Is the Golden Ratio Everywhere?', sub: 'A famous number, and some famous myths. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Draw a line and divide it into two parts so that the whole line compared with the longer part is the same as the longer part compared with the shorter part. The ratio you get is about 1.618 to 1. Mathematicians call this number the golden ratio and give it the Greek letter phi (φ).',
        'The golden ratio appears in a surprising place: the Fibonacci sequence 1, 1, 2, 3, 5, 8, 13, 21, … in which each number is the sum of the two before it. If you divide each number by the one before it, the answers get closer and closer to 1.618. For example, 21 ÷ 13 is about 1.615 and 55 ÷ 34 is about 1.618.',
        'In nature, Fibonacci numbers really do appear. Count the spirals on a sunflower head or a pine cone and you will often find two neighbouring Fibonacci numbers, such as 34 and 55. Scientists think this pattern helps the plant pack in as many seeds as possible without leaving gaps.',
        'However, many other claims are less certain. You may read that the Parthenon in Athens or the shell of a nautilus is built exactly on the golden ratio. When researchers measure these objects carefully, the ratios are often not very close to 1.618. A nautilus shell does make a spiral, but it usually grows at a different rate from a “golden spiral”.',
        'So is the golden ratio everywhere? It is a beautiful number with real mathematical properties, and it really does appear in some plants. But a good mathematician always checks the measurements before believing a claim — even a claim about a famous number.',
      ],
      gloss: [['sum', 'tổng'], ['neighbouring', 'liền kề'], ['claim', 'lời khẳng định'], ['certain', 'chắc chắn'], ['researcher', 'nhà nghiên cứu'], ['measurement', 'phép đo']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'What is the approximate value of the golden ratio?', opts: ['1.618', '3.142', '0.5', '2.718'], a: 0, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'In the Fibonacci sequence, each number is…', opts: ['the sum of the two before it', 'double the one before it', 'the one before it plus 2', 'a square number'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'Why might sunflowers use Fibonacci spirals?', opts: ['to pack in as many seeds as possible', 'to look beautiful to people', 'to follow the Sun', 'to make the golden ratio exactly'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'What is the main message of the text?', opts: ['The golden ratio is real and appears in some plants, but we should check claims carefully', 'The golden ratio is a myth', 'Every shell and building uses the golden ratio', 'Fibonacci numbers are only found in books'], a: 0, ex: 'Paragraph E.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: '55 ÷ 34 is about 1.618.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'Careful measurements show the Parthenon is built exactly on the golden ratio.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'The ratios are often not very close to 1.618.' },
          { type: 'mcq', q: 'The Parthenon took 15 years to build.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'Not mentioned.' },
        ] },
        { title: 'Match the paragraph to its main idea', qs: [
          { type: 'match', q: 'Match.', a: [['A', 'what the golden ratio is'], ['B', 'a link with the Fibonacci sequence'], ['C', 'Fibonacci numbers in plants'], ['D', 'claims that may not be true']], ex: 'Skim the first sentence of each paragraph.' },
          { type: 'fill', q: 'Complete with numbers from the text.', f: 'The next Fibonacci number after 13 is []. On a sunflower you might count [] and 55 spirals.', a: [21, 34], ex: 'Paragraphs B and C.' },
        ] },
      ],
    },
    listening: {
      title: 'Pancakes for the class party', intro: 'Lan and Omar scale up a recipe and share the cost. Listen and answer.',
      voices: { Lan: 'airy', Omar: 'rounded' },
      lines: [
        { spk: 'Lan', text: 'Omar, my pancake recipe is for four people. It needs two hundred grams of flour, two eggs and three hundred millilitres of milk.' },
        { spk: 'Omar', text: 'But there are twenty people coming to the party. Twenty divided by four is five, so we need five times as much.' },
        { spk: 'Lan', text: 'That means one thousand grams of flour, which is one kilogram, and ten eggs.' },
        { spk: 'Omar', text: 'And five times three hundred millilitres of milk is one thousand five hundred millilitres, so one and a half litres.' },
        { spk: 'Lan', text: 'The shopping costs thirty-six dollars altogether. Let’s share it in the ratio two to one, because I invited twice as many friends as you.' },
        { spk: 'Omar', text: 'OK. Two plus one is three parts. Thirty-six divided by three is twelve dollars for one part.' },
        { spk: 'Lan', text: 'So I pay twenty-four dollars and you pay twelve. Let’s check: twenty-four plus twelve is thirty-six.' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'The recipe is for [] people. For 20 people they need [] g of flour, [] eggs and [] mL of milk.', a: [4, 1000, 10, 1500], ex: 'Multiply everything by 5.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why do they multiply by 5?', opts: ['20 ÷ 4 = 5', '4 + 1 = 5', 'They want 5 pancakes each', 'The milk costs $5'], a: 0, ex: 'Omar: “Twenty divided by four is five.”' },
          { type: 'mcq', q: 'Why do they share the cost in the ratio 2 : 1?', opts: ['Lan invited twice as many friends', 'Omar has less money', 'Lan ate more pancakes', 'There are two of them'], a: 0, ex: 'Lan explains the reason.' },
          { type: 'num', q: 'How much does Lan pay (in dollars)?', a: 24, ex: '2 × $12 = $24.' },
        ] },
      ],
    },
  });
})();
