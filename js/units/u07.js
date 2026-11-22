/* Unit 7 — Fractions */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N, F, MX } = U;
  const { mcq, multi, tf, num, frac, fill, order, match, sort, txt, gen } = Q;
  const simp = (n, d) => U.fracSimp(n, d);
  const FH = (n, d) => U.fracHTML(n, d, true); // mixed html
  const IMP = (n, d) => F(n, d);
  const mixedStr = (n, d) => { const [a, b] = simp(n, d); const w = Math.floor(a / b), r = a - w * b; return r ? (w ? `${w} ${r}/${b}` : `${r}/${b}`) : String(w); };

  /* ---------- widgets ---------- */
  APP.viz.fracCompare = function (el) {
    const f = VZ.frame(el, 'So sánh hai phân số', { icon: 'chart' });
    let A = [2, 3], B = [3, 5]; const st = h('div', { style: { display: 'grid', gap: '10px' } }); f.stage.append(st);
    function bar(n, d, col, lcm) { const W = 560, Hh = 38; let g = `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%">`; const k = lcm ? lcm / d : 1; const parts = d * k; for (let i = 0; i < parts; i++) { const w = (W - 4) / parts; g += `<rect x="${2 + i * w}" y="2" width="${w}" height="${Hh - 4}" fill="${i < n * k ? col : 'var(--surface)'}" stroke="var(--ink-2)" stroke-width="${i % k === 0 ? 2 : 0.6}" style="transition:fill .3s"/>`; } return g + '</svg>'; }
    let common = false;
    function draw() {
      const L = U.lcm(A[1], B[1]); st.innerHTML = '';
      const row = (fr, col) => h('div', { style: { display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '10px' } }, h('div', { style: { fontSize: '1.4rem', fontWeight: 800, textAlign: 'center' }, html: common ? F(fr[0] * L / fr[1], L) : F(fr[0], fr[1]) }), h('div', { html: bar(fr[0], fr[1], col, common ? L : 0) }));
      st.append(row(A, 'var(--bad)'), row(B, 'var(--number)'));
      const a = A[0] / A[1], b = B[0] / B[1]; const sym = Math.abs(a - b) < 1e-12 ? '=' : a < b ? '&lt;' : '&gt;';
      f.out.innerHTML = `${F(A[0], A[1])} = ${common ? F(A[0] * L / A[1], L) : U.round(a, 4)} &nbsp; ${sym} &nbsp; ${F(B[0], B[1])} = ${common ? F(B[0] * L / B[1], L) : U.round(b, 4)} ${common ? `(mẫu số chung ${L})` : '(dạng thập phân)'}`;
    }
    const mk = (lab, get, set, max) => VZ.range(lab, 1, max, get(), 1, (v) => { set(v); draw(); });
    f.ctrls.append(mk('Tử A', () => A[0], (v) => (A[0] = Math.min(v, 20)), 12), mk('Mẫu A', () => A[1], (v) => (A[1] = v), 12), mk('Tử B', () => B[0], (v) => (B[0] = v), 12), mk('Mẫu B', () => B[1], (v) => (B[1] = v), 12), VZ.btn('Quy đồng mẫu số', () => { common = !common; SFX.play('whoosh'); draw(); }, 'btn sm sc'));
    draw();
  };
  APP.viz.recurring = function (el) {
    const f = VZ.frame(el, 'Số thập phân vô hạn tuần hoàn', { icon: 'shuffle' });
    let n = 1, d = 7; const st = h('div', { style: { overflowX: 'auto' } }); f.stage.append(st);
    function decimal(n, d) { const whole = Math.floor(n / d); let r = n % d; const digits = [], seen = {}; let start = -1; while (r && digits.length < 40) { if (seen[r] != null) { start = seen[r]; break; } seen[r] = digits.length; r *= 10; digits.push(Math.floor(r / d)); r %= d; } return { whole, digits, start }; }
    function draw() {
      const { whole, digits, start } = decimal(n, d); let html = `<div class="mono" style="font-size:clamp(1.3rem,5vw,2rem);font-weight:800;white-space:nowrap">${F(n, d)} = ${whole}${digits.length ? '.' : ''}`;
      digits.forEach((g, i) => { const rep = start >= 0 && i >= start; html += `<span style="display:inline-block;animation:popIn .3s ${i * 0.05}s both;${rep ? 'color:var(--accent);' : ''}position:relative">${g}${rep && (i === start || i === digits.length - 1) ? '<span style="position:absolute;left:50%;top:-.35em;transform:translateX(-50%);font-size:.6em">•</span>' : ''}</span>`; });
      if (start >= 0) html += '<span class="muted">…</span>'; html += '</div>'; st.innerHTML = html;
      f.out.innerHTML = start < 0 ? 'Phép chia kết thúc: số thập phân hữu hạn.' : `Các chữ số <b style="color:var(--accent)">${digits.slice(start).join('')}</b> lặp lại mãi. Viết gọn bằng dấu chấm trên chữ số đầu và cuối của chu kì. (Số dư lặp lại → chữ số lặp lại.)`;
    }
    f.ctrls.append(VZ.range('Tử số', 1, 30, n, 1, (v) => { n = v; draw(); }), VZ.range('Mẫu số', 2, 41, d, 1, (v) => { d = v; draw(); }), VZ.btn('21/37', () => { n = 21; d = 37; draw(); }, 'btn sm ghost'), VZ.btn('2/3', () => { n = 2; d = 3; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.mixedAdd = function (el) {
    const f = VZ.frame(el, 'Cộng hỗn số theo 3 bước', { icon: 'spark' });
    const ex = [[2, 1, 4, 3, 5, 6], [3, 1, 7, 5, 3, 7], [12, 3, 4, 5, 2, 3], [5, 3, 8, 7, 5, 6], [1, 2, 3, 4, 3, 4]]; let k = 0, step = 0;
    const st = h('div', { style: { display: 'grid', gap: '8px' } }); f.stage.append(st);
    function pies(w, a, b, col) { let g = ''; const r = 22; for (let i = 0; i < w; i++) g += `<svg viewBox="0 0 50 50" width="44" height="44"><circle cx="25" cy="25" r="${r}" fill="${col}"/></svg>`; let p = `<svg viewBox="0 0 50 50" width="44" height="44"><circle cx="25" cy="25" r="${r}" fill="var(--surface)" stroke="var(--ink-3)"/>`; for (let i = 0; i < b; i++) { const a1 = (i / b) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / b) * 2 * Math.PI - Math.PI / 2; p += `<path d="M25 25 L${25 + r * Math.cos(a1)} ${25 + r * Math.sin(a1)} A${r} ${r} 0 0 1 ${25 + r * Math.cos(a2)} ${25 + r * Math.sin(a2)} Z" fill="${i < a ? col : 'none'}" stroke="var(--ink-3)" stroke-width="1"/>`; } return g + p + '</svg>'; }
    function draw() {
      const [w1, a1, b1, w2, a2, b2] = ex[k]; const L = U.lcm(b1, b2); const fa = a1 * L / b1 + a2 * L / b2; const [sn, sd] = simp(fa, L); const W = w1 + w2;
      st.innerHTML = `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${pies(w1, a1, b1, 'var(--bad)')} <b style="font-size:1.4rem">+</b> ${pies(w2, a2, b2, 'var(--number)')}</div>`;
      const lines = [`${MX(w1, a1, b1)} + ${MX(w2, a2, b2)} = ?`, `<b>Bước 1</b> — cộng phần nguyên: ${w1} + ${w2} = <b>${W}</b> (ước lượng: hơn ${W} một chút)`, `<b>Bước 2</b> — cộng phần phân số: ${F(a1, b1)} + ${F(a2, b2)} = ${F(a1 * L / b1, L)} + ${F(a2 * L / b2, L)} = ${F(fa, L)}${fa !== sn || L !== sd ? ' = ' + F(sn, sd) : ''}${sn >= sd ? ' = ' + FH(sn, sd) : ''}`, `<b>Bước 3</b> — gộp lại: ${W} + ${FH(sn, sd)} = <b style="color:var(--accent)">${FH(W * sd + sn, sd)}</b>`];
      lines.slice(0, step + 1).forEach((t, i) => st.append(h('div', { style: { animation: 'stepIn .35s both', fontSize: '1.05rem' }, html: t })));
      f.out.textContent = step < 3 ? 'Bấm “Bước tiếp”.' : 'Xong! So sánh với ước lượng ở Bước 1.';
    }
    f.ctrls.append(VZ.btn('Bước tiếp ▶', () => { if (step < 3) { step++; SFX.play('pop'); draw(); } }, 'btn sm sc'), VZ.btn('Ví dụ khác', () => { k = (k + 1) % ex.length; step = 0; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.fracArea = function (el) {
    const f = VZ.frame(el, 'Nhân phân số bằng mô hình diện tích', { icon: 'grid' });
    let a = 2, b = 5, c = 7, d = 8; const W = 360, H = 260; const svg = VZ.svg(W + 40, H + 40); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const cw = W / b, ch = H / d;
      for (let i = 0; i < b; i++) for (let j = 0; j < d; j++) { const inA = i < a, inC = j < c; svg.append(s('rect', { x: 20 + i * cw, y: 20 + j * ch, width: cw, height: ch, fill: inA && inC ? 'var(--accent)' : inA ? 'color-mix(in srgb, var(--number) 35%, transparent)' : inC ? 'color-mix(in srgb, var(--bad) 25%, transparent)' : 'var(--surface)', stroke: 'var(--ink-3)', 'stroke-width': 1, style: 'transition:fill .3s' })); }
      svg.append(s('rect', { x: 20, y: 20, width: W, height: H, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5 }));
      const p = a * c, q = b * d; const [sn, sd] = simp(p, q);
      f.out.innerHTML = `${F(a, b)} × ${F(c, d)} = ${F(a + ' × ' + c, b + ' × ' + d)} = ${F(p, q)}${sn !== p ? ' = <b style="color:var(--accent)">' + F(sn, sd) + '</b>' : ''} &nbsp;·&nbsp; ô cam = ${p} trên tổng ${q} ô`;
    }
    f.ctrls.append(VZ.range('a', 1, 6, a, 1, (v) => { a = Math.min(v, b); draw(); }), VZ.range('b', 2, 6, b, 1, (v) => { b = v; a = Math.min(a, b); draw(); }), VZ.range('c', 1, 8, c, 1, (v) => { c = Math.min(v, d); draw(); }), VZ.range('d', 2, 8, d, 1, (v) => { d = v; c = Math.min(c, d); draw(); }));
    draw();
  };
  APP.viz.fracDivide = function (el) {
    const f = VZ.frame(el, 'Chia phân số: có bao nhiêu phần … trong …?', { icon: 'target' });
    let A = [2, 3], B = [1, 6]; const st = h('div'); f.stage.append(st);
    function draw() {
      const L = U.lcm(A[1], B[1]); const an = A[0] * L / A[1], bn = B[0] * L / B[1]; const W = 600, Hh = 120; const uw = (W - 20) / L; let g = `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%">`;
      for (let i = 0; i < L; i++) g += `<rect x="${10 + i * uw}" y="14" width="${uw}" height="34" fill="${i < an ? 'color-mix(in srgb, var(--geometry) 45%, transparent)' : 'var(--surface)'}" stroke="var(--ink-3)" stroke-width=".8"/>`;
      g += `<rect x="10" y="14" width="${W - 20}" height="34" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
      const cnt = an / bn; for (let k = 0; k < Math.ceil(cnt); k++) { const x = 10 + k * bn * uw, w = Math.min(bn, an - k * bn) * uw; g += `<rect x="${x + 2}" y="60" width="${w - 4}" height="30" rx="7" fill="${k < Math.floor(cnt) ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 45%, transparent)'}" style="animation:popIn .3s ${k * 0.1}s both"/><text x="${x + w / 2}" y="80" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${k + 1}</text>`; }
      g += '</svg>'; st.innerHTML = g;
      const p = A[0] * B[1], q = A[1] * B[0]; const [sn, sd] = simp(p, q);
      f.out.innerHTML = `${F(A[0], A[1])} ÷ ${F(B[0], B[1])} = ${F(A[0], A[1])} × ${F(B[1], B[0])} = ${F(p, q)} = <b style="color:var(--accent)">${FH(sn, sd)}</b> &nbsp;(có ${N(U.round(cnt, 3))} phần ${F(B[0], B[1])} trong ${F(A[0], A[1])})`;
    }
    f.ctrls.append(VZ.range('Tử 1', 1, 11, A[0], 1, (v) => { A[0] = Math.min(v, A[1] - 1) || 1; draw(); }), VZ.range('Mẫu 1', 2, 12, A[1], 1, (v) => { A[1] = v; A[0] = Math.min(A[0], v - 1); draw(); }), VZ.range('Tử 2', 1, 11, B[0], 1, (v) => { B[0] = Math.min(v, B[1] - 1) || 1; draw(); }), VZ.range('Mẫu 2', 2, 12, B[1], 1, (v) => { B[1] = v; B[0] = Math.min(B[0], v - 1); draw(); }));
    draw();
  };
  APP.viz.fracEasy = function (el) {
    const f = VZ.frame(el, 'Mẹo tính nhanh với phân số', { icon: 'bulb' });
    const tricks = {
      q: { name: '¼ × 600', steps: ['¼ = ½ × ½', '½ của 600 = 300', '½ của 300 = <b>150</b>'] },
      e: { name: '³⁄₅ × 120', steps: ['³⁄₅ = ⁶⁄₁₀ (phân số bằng nhau)', '¹⁄₁₀ của 120 = 12', '⁶⁄₁₀ của 120 = 12 × 6 = <b>72</b>'] },
      c: { name: '⁷⁄₈ × ⁴⁄₅', steps: ['= (7 × 4) ÷ (8 × 5)', '8 = 2 × 4 → (7 × 4) ÷ (2 × 5 × 4)', 'Rút gọn ÷4 với ×4 → 7 ÷ 10 = <b>⁷⁄₁₀</b>'] },
      s: { name: '⁵⁄₆ × 180', steps: ['Cách Arun: 180 ÷ 6 = 30, 30 × 5 = 150', 'Cách Sofia: ⅙ của 180 = 30, 180 − 30 = <b>150</b>', 'Cách Sofia rất nhanh khi phân số gần 1 (như ¹⁹⁄₂₀).'] },
    };
    let key = 'q', k = 0; const box = h('div', { class: 'stack', style: { gap: '6px', minHeight: '140px' } }); f.stage.append(box);
    function draw() { box.innerHTML = ''; box.append(h('div', { style: { fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--sc)' } }, tricks[key].name + ' = ?')); tricks[key].steps.slice(0, k + 1).forEach((t) => box.append(h('div', { style: { animation: 'stepIn .35s both', fontWeight: 600 }, html: t }))); }
    f.ctrls.append(VZ.seg(Object.keys(tricks).map((t) => [t, tricks[t].name]), key, (v) => { key = v; k = 0; draw(); }), VZ.btn('Bước tiếp ▶', () => { if (k < tricks[key].steps.length - 1) { k++; SFX.play('pop'); draw(); } }, 'btn sm sc'));
    draw();
  };
  // explore
  APP.viz.heroFractions = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      const g = c.createLinearGradient(0, 0, w, hh); g.addColorStop(0, '#2b1055'); g.addColorStop(1, '#7597de'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
      const cx = w * 0.72, cy = hh * 0.52, r = Math.min(w, hh) * 0.3; const parts = [1 / 2, 1 / 4, 1 / 8, 1 / 16, 1 / 32, 1 / 64]; let a = -Math.PI / 2 + t * 0.15; const cols = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#f78c6b', '#c77dff'];
      parts.forEach((p, i) => { const sp = Math.sin(t * 2 + i) * 4; const a2 = a + p * 2 * Math.PI; const mid = (a + a2) / 2; c.fillStyle = cols[i]; c.beginPath(); c.moveTo(cx + Math.cos(mid) * sp, cy + Math.sin(mid) * sp); c.arc(cx + Math.cos(mid) * sp, cy + Math.sin(mid) * sp, r, a, a2); c.closePath(); c.fill(); a = a2; });
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a, -Math.PI / 2 + t * 0.15 + 2 * Math.PI); c.closePath(); c.fill();
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(r * 0.16)}px Lexend, sans-serif`; c.textAlign = 'center'; c.fillText('½ + ¼ + ⅛ + … → 1', cx, cy + r * 1.3);
    });
  };
  APP.viz.egyptian = function (el) {
    const f = VZ.frame(el, 'Phân số Ai Cập: tổng các phân số có tử số 1', { icon: 'atom' });
    let n = 3, d = 4; const st = h('div'); f.stage.append(st);
    function greedy(n, d) { const out = []; let a = n, b = d; let guard = 0; while (a > 0 && guard++ < 8) { const k = Math.ceil(b / a); out.push(k); [a, b] = simp(a * k - b, b * k); if (b > 1e7) break; } return out; }
    function glyph(k) { return `<span style="display:inline-flex;flex-direction:column;align-items:center;margin:0 6px;animation:popIn .4s both"><svg viewBox="0 0 40 16" width="40" height="16"><ellipse cx="20" cy="8" rx="17" ry="6" fill="none" stroke="var(--accent)" stroke-width="3"/></svg><b style="font-size:1.3rem">${k}</b></span>`; }
    function draw() { const [a, b] = simp(n, d); const ks = a >= b ? [] : greedy(a, b); st.innerHTML = `<div style="font-size:1.5rem;font-weight:800;display:flex;align-items:center;flex-wrap:wrap;gap:6px">${F(a, b)} = ${ks.map((k) => F(1, k)).join(' + ')}</div><div style="margin-top:10px">${ks.map(glyph).join('<b>+</b>')}</div>`; f.out.innerHTML = 'Người Ai Cập vẽ hình “cái miệng” (nghĩa là “một phần”) phía trên một số để viết phân số 1/số đó.'; }
    f.ctrls.append(VZ.range('Tử', 1, 11, n, 1, (v) => { n = Math.min(v, d - 1); draw(); }), VZ.range('Mẫu', 2, 12, d, 1, (v) => { d = v; n = Math.min(n, d - 1); draw(); }));
    draw();
  };
  APP.viz.rhythm = function (el) {
    const f = VZ.frame(el, 'Âm nhạc là phân số: lấp đầy một ô nhịp 4/4', { icon: 'sound' });
    const notes = [['𝅝 tròn', 1, 1], ['𝅗𝅥 trắng', 1, 2], ['♩ đen', 1, 4], ['♪ móc đơn', 1, 8], ['𝅘𝅥𝅯 móc kép', 1, 16]];
    let bar = [[1, 4], [1, 4], [1, 2]]; const st = h('div'); f.stage.append(st);
    const total = () => bar.reduce(([p, q], [a, b]) => simp(p * b + a * q, q * b), [0, 1]);
    function draw() {
      const W = 600; let x = 10; let g = `<svg viewBox="0 0 ${W} 90" style="width:100%"><rect x="8" y="20" width="${W - 16}" height="44" rx="8" fill="var(--surface)" stroke="var(--ink-2)" stroke-width="2"/>`;
      bar.forEach(([a, b], i) => { const w = (W - 20) * (a / b); g += `<rect x="${x + 1}" y="22" width="${Math.max(2, w - 2)}" height="40" rx="6" fill="${['var(--bad)', 'var(--number)', 'var(--geometry)', 'var(--stats)', 'var(--algebra)'][Math.log2(b) % 5]}" style="animation:popIn .3s both"/><text x="${x + w / 2}" y="48" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${a}/${b}</text>`; x += w; });
      g += '</svg>'; st.innerHTML = g; const [p, q] = total();
      f.out.innerHTML = `Tổng: ${bar.map(([a, b]) => F(a, b)).join(' + ')} = <b style="color:${p === q ? 'var(--good)' : p > q ? 'var(--bad)' : 'var(--ink)'}">${FH(p, q)}</b> ${p === q ? '✓ Đủ một ô nhịp! Bấm Phát.' : p > q ? '— quá 1 ô nhịp!' : '— còn thiếu ' + F(...simp(q - p, q))}`;
    }
    function play() { if (!SFX.on || !SFX.init()) { APP.toast('Bật âm thanh để nghe'); return; } let t = 0; const beat = 1.8; const sc = [523, 587, 659, 698, 784, 659, 587]; bar.forEach(([a, b], i) => { const dur = beat * (a / b); SFX.tone(sc[i % sc.length], Math.max(0.08, dur * 0.85), 'triangle', 0.18, t); t += dur; }); }
    f.ctrls.append(...notes.map(([nm, a, b]) => VZ.btn(nm, () => { bar.push([a, b]); draw(); }, 'btn sm')), VZ.btn('Phát ▶', play, 'btn sm sc'), VZ.btn('Xoá', () => { bar = []; draw(); }, 'btn sm ghost'));
    draw();
  };

  /* ---------- bank helpers ---------- */
  const addMixedQ = (w1, a1, b1, w2, a2, b2, o = {}) => { const L = U.lcm(b1, b2); const fn = (w1 * b1 + a1) * (L / b1) + (w2 * b2 + a2) * (L / b2); const [n, d] = simp(fn, L); const fa = a1 * L / b1 + a2 * L / b2; return frac(o.q || `Work out ${MX(w1, a1, b1)} + ${MX(w2, a2, b2)}. Give your answer as a mixed number in its simplest form.`, [n, d], `Whole numbers: ${w1} + ${w2} = ${w1 + w2}. Fractions: ${F(a1 * L / b1, L)} + ${F(a2 * L / b2, L)} = ${F(fa, L)}${fa >= L ? ' = ' + FH(...simp(fa, L)) : ''}. Total: ${FH(n, d)}.`, Object.assign({ simplest: true }, o)); };
  const mulQ = (a, b, c, d, o = {}) => { const [n, m] = simp(a * c, b * d); return frac(o.q || `Work out ${F(a, b)} × ${F(c, d)}. Give your answer in its simplest form.`, [n, m], `Multiply the numerators and the denominators: ${F(a * c, b * d)}${a * c !== n ? ' = ' + F(n, m) : ''}.`, Object.assign({ simplest: true }, o)); };
  const divQ = (a, b, c, d, o = {}) => { const [n, m] = simp(a * d, b * c); return frac(o.q || `Work out ${F(a, b)} ÷ ${F(c, d)}. Give your answer in its simplest form.`, [n, m], `Turn the second fraction upside down and multiply: ${F(a, b)} × ${F(d, c)} = ${F(a * d, b * c)}${n !== a * d ? ' = ' + F(n, m) : ''}${n > m ? ' = ' + FH(n, m) : ''}.`, Object.assign({ simplest: true }, o)); };
  const properPair = () => { const b = R(2, 12), d = R(2, 12); return [R(1, b - 1), b, R(1, d - 1), d]; };

  APP.addUnit({
    n: 7, strand: 'number', title: 'Fractions', vi: 'Phân số',
    blurb: 'The word “fraction” comes from the Latin word fractio, which means “breaking into pieces”. From as early as 1800 BCE, the ancient Egyptians were writing fractions using pictures called hieroglyphs. You see fractions every day — on road signs, in shop sales and in recipes.',
    blurbVi: 'Chương này học so sánh và sắp xếp phân số, cộng hỗn số, nhân và chia hai phân số, và các mẹo tính nhanh với phân số.',
    words: [['fraction', 'phân số'], ['numerator', 'tử số'], ['denominator', 'mẫu số'], ['common denominator', 'mẫu số chung'], ['equivalent fraction', 'phân số bằng nhau'], ['improper fraction', 'phân số lớn hơn 1 (phân số không thực sự)'], ['proper fraction', 'phân số nhỏ hơn 1'], ['mixed number', 'hỗn số'], ['simplest form', 'dạng tối giản'], ['cancel', 'rút gọn'], ['recurring decimal', 'số thập phân vô hạn tuần hoàn'], ['order of size', 'thứ tự độ lớn'], ['reciprocal', 'số nghịch đảo'], ['upside down', 'lộn ngược'], ['factor', 'thừa số / ước'], ['estimate', 'ước lượng']],
    chat: ['Làm sao so sánh 25/4 và 63/10?', 'Vì sao chia phân số lại nhân với nghịch đảo?', 'Cộng 2¼ + 3⅚ từng bước'],
    sections: [
      {
        id: '7.1', t: 'Ordering fractions', vi: 'Sắp xếp phân số',
        goals: ['compare and order fractions.'],
        body: [
          ['p', 'When you write fractions in order of size, you must first compare them. You can compare fractions in two ways: 1 write them as fractions that have the <b>same denominator</b>; 2 write them as <b>decimals</b>.'],
          ['viz', 'fracCompare'],
          ['p', `Sometimes when you change a fraction to a decimal, you get a decimal that goes on forever, for example ${F(1, 7)} = 0.142 857… Sometimes there are repeating numbers: ${F(2, 3)} = 0.6666… and ${F(21, 37)} = 0.567 567 567… These are called <b>recurring decimals</b>. You write 0.6666… as 0.6̇ and 0.567567… as 0.5̇67̇ (dots above the first and last repeating digits).`],
          ['viz', 'recurring'],
          ['ex', { t: 'Worked example 7.1', q: `a Write ${F(3, 2)}, ${F(2, 3)} and ${F(8, 5)} in order of size, smallest first. &nbsp; b Use decimals to decide which is larger: ${MX(2, 6, 11)} or ${F(23, 9)}?`, steps: [`a: ${F(3, 2)} = ${MX(1, 1, 2)} and ${F(8, 5)} = ${MX(1, 3, 5)}. ${F(2, 3)} is less than 1, so it comes first.`, `Compare ${MX(1, 1, 2)} = ${MX(1, 5, 10)} and ${MX(1, 3, 5)} = ${MX(1, 6, 10)}: <b>${F(2, 3)}, ${F(3, 2)}, ${F(8, 5)}</b>`, `b: ${F(23, 9)} = ${MX(2, 5, 9)}. The whole-number parts are the same, so compare ${F(6, 11)} = 0.5454… and ${F(5, 9)} = 0.5555…`, `0.5555… > 0.5454…, so <b>${F(23, 9)} &gt; ${MX(2, 6, 11)}</b>`] }],
          ['vi', ['Cách 1: quy đồng mẫu số rồi so sánh tử số.', 'Cách 2: đổi ra số thập phân (chia tử cho mẫu).', 'Phân số lớn hơn 1 nên đổi ra hỗn số trước; phần nguyên lớn hơn thì số lớn hơn.', 'Số thập phân vô hạn tuần hoàn: một nhóm chữ số lặp lại mãi, ví dụ 2/3 = 0,666…']],
        ],
        bank: [
          fill('Write the correct symbol, = or ≠, between each pair of fractions.', [{ opts: ['=', '≠'], a: 0 }, { opts: ['=', '≠'], a: 1 }, { opts: ['=', '≠'], a: 0 }, { opts: ['=', '≠'], a: 1 }], `${F(3, 5)} = ${F(12, 20)} ≠ ${F(13, 20)}; ${F(2, 7)} = ${F(10, 35)} ≠ ${F(9, 35)}.`, { f: `a ${F(2, 3)} [] ${F(10, 15)} &nbsp; b ${F(3, 5)} [] ${F(13, 20)} &nbsp; c ${F(3, 4)} [] ${F(12, 16)} &nbsp; d ${F(2, 7)} [] ${F(9, 35)}` }),
          fill('Write the correct symbol, &lt; or &gt;, between each pair of fractions.', [{ opts: ['&lt;', '&gt;'], a: 1 }, { opts: ['&lt;', '&gt;'], a: 0 }, { opts: ['&lt;', '&gt;'], a: 1 }], `${F(21, 5)} = ${MX(4, 1, 5)} &gt; ${MX(3, 4, 5)}; ${F(17, 6)} = ${MX(2, 5, 6)} &lt; ${MX(5, 5, 6)}.`, { f: `a ${F(21, 5)} [] ${MX(3, 4, 5)} &nbsp; b ${F(17, 6)} [] ${MX(5, 5, 6)} &nbsp; c ${F(25, 12)} [] ${MX(2, 1, 21)}` }),
          mcq(`Which fraction is larger: ${F(25, 4)} or ${F(63, 10)}?`, [F(63, 10), F(25, 4), 'They are equal'], 0, `${F(25, 4)} = ${MX(6, 1, 4)} = ${MX(6, 10, 40)} and ${F(63, 10)} = ${MX(6, 3, 10)} = ${MX(6, 12, 40)}.`, { fixed: true }),
          fill('Work out which fraction is larger in each pair.', [{ opts: [F(47, 6), F(31, 4)], a: 0 }, { opts: [F(33, 4), F(42, 5)], a: 1 }, { opts: [F(49, 15), F(33, 10)], a: 1 }], `${F(47, 6)} = ${MX(7, 10, 12)} &gt; ${MX(7, 9, 12)}; ${F(42, 5)} = ${MX(8, 8, 20)} &gt; ${MX(8, 5, 20)}; ${F(33, 10)} = ${MX(3, 9, 30)} &gt; ${MX(3, 8, 30)}.`, { f: `a [] &nbsp; b [] &nbsp; c []`, d: 2 }),
          order('Put these fraction cards in order of size, starting with the smallest.', [F(1, 4), F(7, 12), F(13, 10), F(7, 5)], `${F(1, 4)} = 0.25, ${F(7, 12)} ≈ 0.583, ${F(13, 10)} = 1.3, ${F(7, 5)} = 1.4.`),
          fill('Write each improper fraction as a decimal (to 4 d.p.).', [[1.8333], [1.7273, 1.7272], [1.8889, 1.8888]], `${F(11, 6)} = 1.8333…, ${F(19, 11)} = 1.7272…, ${F(17, 9)} = 1.8888…`, { f: `a ${F(11, 6)} ≈ [] &nbsp; b ${F(19, 11)} ≈ [] &nbsp; c ${F(17, 9)} ≈ []`, d: 2 }),
          order('Write the fractions in order of size, starting with the smallest.', [F(19, 11), F(11, 6), F(17, 9)], '1.7272… < 1.8333… < 1.8888…'),
          match('Match each fraction to its decimal.', [[F(9, 4), '2.25'], [F(16, 7), '2.2857…'], [F(7, 3), '2.333…'], [F(58, 25), '2.32']], 'Divide the numerator by the denominator.'),
          order('Write the fractions in order of size, starting with the smallest.', [F(9, 4), F(16, 7), F(58, 25), F(7, 3)], '2.25 < 2.2857… < 2.32 < 2.333…', { d: 2 }),
          mcq(`How do you write ${F(21, 37)} = 0.567 567 567… using recurring-decimal notation?`, ['0.5̇67̇ (dots above the 5 and the 7)', '0.56̇7', '0.567…7', '0.5̇6̇7̇'], 0, 'Put a dot above the first and the last digits of the repeating block.'),
          tf(`${F(1, 3)} = 0.333… is a recurring decimal.`, true, 'The 3 repeats forever: 0.3̇.'),
          gen(() => { const fs = []; while (fs.length < 4) { const d = R(3, 12), n = R(1, d * 2); const v = n / d; if (!fs.some((x) => Math.abs(x[0] / x[1] - v) < 1e-9) && n % d) fs.push([n, d]); } return order('Write these fractions in order of size, smallest first.', fs.slice().sort((a, b) => a[0] / a[1] - b[0] / b[1]).map(([n, d]) => F(n, d)), 'Write each as a decimal or use a common denominator.'); }),
          gen(() => { const d1 = R(3, 12), d2 = R(3, 12); const n1 = R(1, d1 - 1), n2 = R(1, d2 - 1); if (n1 * d2 === n2 * d1) return null; return mcq(`Which is larger: ${F(n1, d1)} or ${F(n2, d2)}?`, [F(n1, d1), F(n2, d2)], n1 / d1 > n2 / d2 ? 0 : 1, `Common denominator ${U.lcm(d1, d2)}: ${F(n1 * U.lcm(d1, d2) / d1, U.lcm(d1, d2))} and ${F(n2 * U.lcm(d1, d2) / d2, U.lcm(d1, d2))}.`, { fixed: true }); }),
          gen(() => { const d = pick([3, 6, 7, 9, 11, 12, 13]), n = R(1, d - 1); if (U.gcd(n, d) > 1) return null; const v = n / d; return num(`Write ${F(n, d)} as a decimal, correct to 3 decimal places.`, U.round(v, 3), `${n} ÷ ${d} = ${v.toFixed(6)}…`, { dp: 3 }); }),
          gen(() => { const names = shuffle(['Ana', 'Ben', 'Chi', 'Dan']); const fr = [[3, 4], [5, 8], [7, 10], [2, 3]]; const best = 0; return mcq(`In a test ${names[0]} scored ${F(3, 4)}, ${names[1]} scored ${F(5, 8)}, ${names[2]} scored ${F(7, 10)} and ${names[3]} scored ${F(2, 3)} of the marks. Who did best?`, names, best, '3/4 = 0.75, 7/10 = 0.7, 2/3 ≈ 0.667, 5/8 = 0.625.', { fixed: true, app: true }); }, { app: true }),
        ],
      },
      {
        id: '7.2', t: 'Adding mixed numbers', vi: 'Cộng hỗn số',
        goals: ['add mixed numbers.'],
        body: [
          ['p', 'You can only add fractions when the denominators are the same. When the denominators are different, write the fractions as equivalent fractions with a common denominator, then add the numerators.'],
          ['list', ['<b>Step 1</b>: Add the whole-number parts. Use this answer as your estimate.', '<b>Step 2</b>: Add the fractional parts and cancel the answer to its simplest form. If it is an improper fraction, write it as a mixed number.', '<b>Step 3</b>: Add your answers to steps 1 and 2.']],
          ['viz', 'mixedAdd'],
          ['ex', { t: 'Worked example 7.2', q: `Work out: a ${MX(3, 1, 7)} + ${MX(5, 3, 7)} &nbsp; b ${MX(2, 1, 4)} + ${MX(3, 5, 6)}`, steps: [`a: 3 + 5 = 8 (estimate just over 8); ${F(1, 7)} + ${F(3, 7)} = ${F(4, 7)}; answer <b>${MX(8, 4, 7)}</b>`, `b: 2 + 3 = 5; ${F(1, 4)} + ${F(5, 6)} = ${F(3, 12)} + ${F(10, 12)} = ${F(13, 12)} = ${MX(1, 1, 12)}`, `5 + ${MX(1, 1, 12)} = <b>${MX(6, 1, 12)}</b>`] }],
          ['tip', `Zara: “Without adding the fractions, I know ${MX(5, 2, 3)} + ${MX(7, 7, 8)} is between 12 and 14.” Each fraction is less than 1, so the total is more than 5 + 7 = 12 but less than 12 + 2 = 14.`],
          ['vi', ['Bước 1: cộng phần nguyên (dùng làm ước lượng).', 'Bước 2: quy đồng rồi cộng phần phân số; rút gọn; nếu lớn hơn 1 thì đổi ra hỗn số.', 'Bước 3: cộng kết quả hai bước.', 'Có thể dùng để thu gọn biểu thức đại số: 3⅞x + 4⅚x = 8 17/24 x.']],
        ],
        bank: [
          addMixedQ(2, 1, 4, 1, 1, 4), addMixedQ(7, 1, 3, 3, 1, 2), addMixedQ(1, 5, 6, 6, 1, 4),
          addMixedQ(3, 2, 9, 5, 5, 9, { q: `The sides of a triangle are ${MX(3, 2, 9)} m, ${MX(5, 5, 9)} m and 7 m. Work out the perimeter as a mixed number in its simplest form.`, d: 2 }),
          addMixedQ(12, 3, 4, 5, 2, 3, { q: `Hoa drives ${MX(12, 3, 4)} km to the doctor’s clinic, then ${MX(5, 2, 3)} km to work. What is the total distance?`, app: true }),
          addMixedQ(5, 3, 8, 7, 5, 6, { q: `Kia works out ${MX(5, 3, 8)} + ${MX(7, 5, 6)} and gets ${MX(13, 1, 6)}. Work out the correct answer.`, d: 2 }),
          addMixedQ(2, 1, 2, 1, 4, 5, { q: `Andrew uses two pieces of wood, ${MX(2, 1, 2)} m and ${MX(1, 4, 5)} m long, to make a shelf. What is the total length?`, app: true }),
          mcq(`Andrew’s shelf is ${MX(4, 3, 10)} m long. He has a wall that is ${MX(4, 1, 2)} m long. Will the shelf fit?`, ['Yes — 4 3/10 < 4 5/10', 'No — 4 3/10 > 4 1/2', 'They are exactly equal', 'It is impossible to tell'], 0, `${F(1, 2)} = ${F(5, 10)}, which is bigger than ${F(3, 10)}.`, { app: true }),
          mcq(`Zara looks at ${MX(5, 2, 3)} + ${MX(7, 7, 8)} and says the answer will be between 12 and 14. Is she correct?`, ['Yes — each fraction is less than 1, so the total is between 12 and 14', 'No — it is between 13 and 14 exactly', 'No — it is more than 14', 'No — it is less than 12'], 0, `The exact answer is ${MX(13, 13, 24)}.`),
          frac(`Simplify by collecting like terms: ${MX(3, 7, 8)}x + ${MX(4, 5, 6)}x. Type the coefficient of x as a mixed number.`, [209, 24], `${MX(3, 7, 8)} + ${MX(4, 5, 6)} = 7 + ${F(21, 24)} + ${F(20, 24)} = 7 + ${MX(1, 17, 24)} = ${MX(8, 17, 24)}.`, { simplest: true, d: 3 }),
          gen(() => { const b1 = R(2, 9), b2 = R(2, 9); return addMixedQ(R(1, 9), R(1, b1 - 1), b1, R(1, 9), R(1, b2 - 1), b2); }),
          gen(() => { const b = pick([4, 6, 8, 10, 12]); const w1 = R(1, 5), w2 = R(1, 5); return addMixedQ(w1, R(1, b - 1), b, w2, R(1, b - 1), b); }),
          gen(() => { const b1 = pick([2, 3, 4]), b2 = pick([4, 6, 8]); const w1 = R(1, 4), w2 = R(1, 4), a1 = R(1, b1 - 1), a2 = R(1, b2 - 1); return addMixedQ(w1, a1, b1, w2, a2, b2, { q: `A recipe needs ${MX(w1, a1, b1)} cups of flour for the cake and ${MX(w2, a2, b2)} cups for the icing. How many cups of flour are needed altogether?`, app: true }); }, { app: true }),
        ],
      },
      {
        id: '7.3', t: 'Multiplying fractions', vi: 'Nhân phân số',
        goals: ['multiply two proper fractions.'],
        body: [
          ['p', `To find a fraction of a fraction, you multiply the fractions together. In a rectangle split into 6 equal parts, ${F(1, 2)} of ${F(1, 3)} = ${F(1, 6)}. So ${F(1, 2)} × ${F(1, 3)} = ${F('1 × 1', '2 × 3')} = ${F(1, 6)}.`],
          ['rule', 'Multiply the numerators together and multiply the denominators together. Then cancel to the simplest form.', 'Multiplying'],
          ['viz', 'fracArea'],
          ['ex', { t: 'Worked example 7.3', q: `a Work out ${F(2, 5)} × ${F(7, 8)} in its simplest form. &nbsp; b In a swimming club, ${F(4, 5)} of the members are children. ${F(1, 3)} of the children are boys. What fraction of the members are boys?`, steps: [`a: ${F('2 × 7', '5 × 8')} = ${F(14, 40)} = <b>${F(7, 20)}</b> (divide both by 2)`, `b: ${F(1, 3)} of ${F(4, 5)} = ${F(1, 3)} × ${F(4, 5)} = <b>${F(4, 15)}</b>`] }],
          ['tip', `When you multiply two proper fractions, the answer is always smaller than both of them. Simplify first if you can: ${F(6, 9)} × ${F(3, 12)} = ${F(2, 3)} × ${F(1, 4)} = ${F(2, 12)} = ${F(1, 6)}.`],
          ['vi', ['“… của …” nghĩa là nhân: ½ của ⅓ = ½ × ⅓ = ⅙.', 'Tử nhân tử, mẫu nhân mẫu, rồi rút gọn.', 'Có thể rút gọn chéo trước khi nhân để số nhỏ hơn.', 'Bình phương phân số: (3/5)² = 3/5 × 3/5 = 9/25.']],
        ],
        bank: [
          mulQ(1, 2, 1, 3), mulQ(3, 4, 1, 5), mulQ(2, 3, 1, 7), mulQ(4, 5, 2, 3),
          mulQ(3, 4, 2, 9), mulQ(2, 5, 3, 8), mulQ(4, 7, 3, 4),
          fill('Benji’s sauce recipe serves 4 people. He makes it for 2 people, so he multiplies every amount by ½.', [{ expr: '1/3' }, { expr: '1/4' }, { expr: '3/8' }, 1, { expr: '1/2' }], '½ × ⅔ = ⅓; ½ × ½ = ¼; ½ × ¾ = ⅜; ½ × 2 = 1; ½ × 1 = ½.', { f: `cashew nuts ${F(2, 3)} cup → [] cup &nbsp; water ${F(1, 2)} cup → [] cup &nbsp; vinegar ${F(3, 4)} cup → [] cup &nbsp; honey 2 tbsp → [] tbsp &nbsp; salt 1 tsp → [] tsp`, app: true }),
          mulQ(3, 4, 2, 3, { q: `Find the area of a rectangle with length ${F(3, 4)} m and width ${F(2, 3)} m.`, unit: 'm²' }),
          mulQ(3, 5, 3, 5, { q: `Work out the area of a square with side ${F(3, 5)} m. (Hint: (${F(3, 5)})²)`, unit: 'm²' }),
          fill(`At a hotel, ${F(5, 9)} of the staff are part-time. Of the part-time staff, ${F(3, 5)} are men.`, [{ expr: '4/9' }, { expr: '2/5' }, { expr: '1/3' }, { expr: '2/9' }], `Not part-time: 1 − ${F(5, 9)} = ${F(4, 9)}. Part-time women: ${F(2, 5)} of the part-timers. Men part-time: ${F(3, 5)} × ${F(5, 9)} = ${F(15, 45)} = ${F(1, 3)}. Women part-time: ${F(2, 5)} × ${F(5, 9)} = ${F(2, 9)}.`, { f: 'a staff NOT part-time: [] &nbsp; b part-time staff who are women: [] &nbsp; c staff who are men employed part-time: [] &nbsp; d staff who are women employed part-time: []', d: 3, app: true }),
          fill(`In a cinema, ${F(3, 5)} of the people are children. ${F(3, 4)} of the children are girls.`, [{ expr: '9/20' }, { expr: '3/20' }], `Girls: ${F(3, 4)} × ${F(3, 5)} = ${F(9, 20)}. Boys: ${F(1, 4)} × ${F(3, 5)} = ${F(3, 20)}.`, { f: 'a fraction of the people who are girls: [] &nbsp; b fraction who are boys: []', d: 2, app: true }),
          tf('When you multiply two proper fractions together, you will never get an answer bigger than 1.', true, 'Each fraction is less than 1, so the product is less than each of them.'),
          mulQ(6, 9, 3, 12, { q: `Arun says: “You can simplify ${F(6, 9)} × ${F(3, 12)} before you multiply.” Work out the answer in its simplest form.`, d: 2 }),
          gen(() => { const [a, b, c, d] = properPair(); return mulQ(a, b, c, d); }),
          gen(() => { const a = R(1, 4), b = a + R(1, 5), c = R(1, 4), d = c + R(1, 6); const thing = pick([['a garden', 'is grass', 'has flowers'], ['a class', 'are girls', 'wear glasses'], ['a bag of sweets', 'are red', 'are strawberry flavour']]); const [n, m] = simp(a * c, b * d); return frac(`In ${thing[0]}, ${F(a, b)} ${thing[1]}. ${F(c, d)} of those ${thing[2]}. What fraction of ${thing[0]} ${thing[1].replace(/^(is|are) /, '$1 ')} and ${thing[2]}?`, [n, m], `${F(c, d)} × ${F(a, b)} = ${F(a * c, b * d)}${n !== a * c ? ' = ' + F(n, m) : ''}.`, { simplest: true, app: true }); }, { app: true }),
        ],
      },
      {
        id: '7.4', t: 'Dividing fractions', vi: 'Chia phân số',
        goals: ['divide two proper fractions.'],
        body: [
          ['p', `Solving ${F(2, 3)} ÷ ${F(1, 6)} is the same as asking “How many ${F(1, 6)} are there in ${F(2, 3)}?”. From the diagram, ${F(2, 3)} = ${F(4, 6)}, so there are 4 sixths: ${F(2, 3)} ÷ ${F(1, 6)} = ${F(2, 3)} × ${F(6, 1)} = ${F(12, 3)} = 4.`],
          ['list', ['Turn the second fraction <b>upside down</b> (find its <b>reciprocal</b>).', 'Change the ÷ sign to a × sign.', 'Multiply the fractions, then cancel and write as a mixed number if needed.']],
          ['viz', 'fracDivide'],
          ['ex', { t: 'Worked example 7.4', q: `Work out ${F(3, 4)} ÷ ${F(2, 5)}.`, steps: [`Turn ${F(2, 5)} upside down and multiply: ${F(3, 4)} × ${F(5, 2)}`, `= ${F(15, 8)} = <b>${MX(1, 7, 8)}</b>`] }],
          ['tip', 'When you divide by a fraction smaller than 1, the answer is BIGGER than the number you started with — because many small pieces fit into it.'],
          ['vi', ['Chia cho một phân số = nhân với phân số nghịch đảo (lộn ngược).', 'a/b ÷ c/d = a/b × d/c.', 'Nếu phân số thứ nhất lớn hơn phân số thứ hai thì kết quả lớn hơn 1, và ngược lại.', 'Kiểm tra: kết quả × số chia = số bị chia.']],
        ],
        bank: [
          divQ(3, 4, 1, 2), divQ(4, 5, 3, 10), divQ(5, 6, 2, 3), divQ(4, 9, 1, 3), divQ(6, 7, 3, 7), divQ(7, 8, 3, 4),
          divQ(8, 9, 4, 5, { q: `Isaac works out ${F(8, 9)} ÷ ${F(4, 5)} = ${F(8, 9)} × ${F(4, 5)}. Explain his mistake and work out the correct answer.`, d: 2 }),
          divQ(2, 5, 3, 10, { q: `The area of a rectangle is ${F(2, 5)} m². The width is ${F(3, 10)} m. Work out the length (length = area ÷ width).`, unit: 'm', app: true }),
          mcq(`Cheng needs a fraction card to make ${F(3, 4)} ÷ ? = ${F(15, 8)}... Which card is correct?`, [F(2, 5), F(3, 10), F(4, 5), F(5, 6)], 0, `${F(3, 4)} ÷ ${F(2, 5)} = ${F(3, 4)} × ${F(5, 2)} = ${F(15, 8)}.`, { d: 3 }),
          tf('Arun says: “When you divide two proper fractions, if the first fraction is bigger than the second, the answer will be smaller than 1.”', false, 'The opposite is true: e.g. ¾ ÷ ½ = 1½, which is bigger than 1.', { d: 2 }),
          gen(() => { const [a, b, c, d] = properPair(); return divQ(a, b, c, d); }),
          gen(() => { const b = pick([2, 3, 4, 5]), k = pick([2, 3, 4]); const a = R(1, b - 1), d = b * k; return num(`A jug holds ${F(a, b)} litre of juice. How many glasses of ${F(1, d)} litre can be filled?`, a * k, `${F(a, b)} ÷ ${F(1, d)} = ${F(a, b)} × ${d} = ${a * k}.`, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '7.5', t: 'Making fraction calculations easier', vi: 'Tính nhanh với phân số',
        goals: ['simplify calculations containing fractions.'],
        body: [
          ['list', ['Break a fraction into parts using <b>factors</b>: ¼ = ½ × ½.', 'Use <b>equivalent fractions</b>: ³⁄₅ = ⁶⁄₁₀ (dividing by 10 is easy).', 'Find factors that are the same in the numerator and the denominator, then cancel.', 'Instead of working out a large fraction of a number, work out the small fraction and subtract it: ⁵⁄₆ of 180 = 180 − 30.']],
          ['viz', 'fracEasy'],
          ['ex', { t: 'Worked example 7.5', q: `Work out: a ${F(1, 4)} × 600 &nbsp; b ${F(3, 5)} × 120 &nbsp; c ${F(7, 8)} × ${F(4, 5)}`, steps: ['a: ¼ = ½ × ½; half of 600 = 300; half of 300 = <b>150</b>', 'b: ³⁄₅ = ⁶⁄₁₀; ¹⁄₁₀ of 120 = 12; 12 × 6 = <b>72</b>', `c: ${F('7 × 4', '8 × 5')} = ${F('7 × 4', '2 × 4 × 5')} = ${F(7, 10)} × ${F(4, 4)} = <b>${F(7, 10)}</b>`] }],
          ['tip', 'Remember the order of operations: ½ + ⅔ × ¾ — multiply first! ⅔ × ¾ = ½, then ½ + ½ = 1.'],
          ['vi', ['¼ của một số = chia đôi hai lần; ⅛ = chia đôi ba lần.', 'Đổi sang phân số có mẫu 10, 100 để tính nhẩm dễ hơn.', 'Phân số gần 1 (như 19/20): lấy số đó trừ đi phần nhỏ (1/20).', 'Luôn tuân theo thứ tự phép tính: nhân/chia trước, cộng/trừ sau.']],
        ],
        bank: [
          fill('Use factors to make these calculations easier.', [7, 130, 15, 50], '⅛ × 120: 120 ÷ 2 ÷ 2 ÷ 2 = 15. 1/14 × 700: 700 ÷ 7 = 100, ÷ 2 = 50.', { f: `a ${F(1, 4)} × 28 = [] &nbsp; b ${F(1, 4)} × 520 = [] &nbsp; c ${F(1, 8)} × 120 = [] &nbsp; d ${F(1, 14)} × 700 = []` }),
          fill('Work out using factors.', [18, 10, 35, 15], '1/15 × 150 = 150 ÷ 3 ÷ 5 = 10.', { f: `a ${F(1, 6)} × 108 = [] &nbsp; b ${F(1, 15)} × 150 = [] &nbsp; c ${F(1, 8)} × 280 = [] &nbsp; d ${F(1, 12)} × 180 = []` }),
          fill('Use equivalent fractions (tenths) to work out:', [54, 64, 126, 128], '⅕ = ²⁄₁₀: 270 ÷ 10 × 2 = 54.', { f: `a ${F(1, 5)} × 270 = [] &nbsp; b ${F(4, 5)} × 80 = [] &nbsp; c ${F(3, 5)} × 210 = [] &nbsp; d ${F(2, 5)} × 320 = []` }),
          fill('Emyr knows that 3/20 = 15/100, so 3/20 × 4500 = 15 × 45 = 675. Use his method to work out:', [55, 285, 315, 3850], '¹⁄₂₀ = ⁵⁄₁₀₀: 1100 ÷ 100 × 5 = 55.', { f: `a ${F(1, 20)} × 1100 = [] &nbsp; b ${F(3, 20)} × 1900 = [] &nbsp; c ${F(7, 20)} × 900 = [] &nbsp; d ${F(11, 20)} × 7000 = []`, d: 2 }),
          frac(`Work out ${F(5, 6)} × ${F(2, 3)} by finding common factors.`, [5, 9], `${F('5 × 2', '2 × 3 × 3')} = ${F(5, 9)}.`, { simplest: true }),
          frac(`Iqra works out ${F(5, 24)} × ${F(8, 11)}. What is the correct answer in its simplest form?`, [5, 33], `24 = 8 × 3, so ${F('5 × 8', '8 × 3 × 11')} = ${F(5, 33)}.`, { simplest: true, d: 2 }),
          fill('Use Sofia’s method (work out the small fraction and subtract) to work out:', [240, 840, 1710, 768, 2080], `${F(6, 7)} × 280 = 280 − 40 = 240; ${F(13, 14)} × 2240 = 2240 − 160 = 2080.`, { f: `a ${F(6, 7)} × 280 = [] &nbsp; b ${F(14, 15)} × 900 = [] &nbsp; c ${F(19, 20)} × 1800 = [] &nbsp; d ${F(24, 25)} × 800 = [] &nbsp; e ${F(13, 14)} × 2240 = []`, d: 2 }),
          mcq(`Sofia and Zara work out ${F(1, 2)} + ${F(2, 3)} × ${F(3, 4)}. Sofia gets ${F(9, 20)}; Zara gets 1. Who is correct?`, ['Zara — multiply first: ⅔ × ¾ = ½, then ½ + ½ = 1', 'Sofia — add first', 'Both', 'Neither'], 0, 'Sofia added first (and added the fractions incorrectly: ½ + ⅔ ≠ ³⁄₅).'),
          gen(() => { const d = pick([4, 5, 8, 10, 20, 25]), n = R(1, d - 1); const x = d * R(3, 40); return num(`Work out ${F(n, d)} × ${x}.`, (x / d) * n, `${x} ÷ ${d} = ${x / d}; × ${n} = ${(x / d) * n}.`); }),
          gen(() => { const d = pick([6, 8, 10, 12, 20]); const x = d * R(5, 60); return num(`Work out ${F(d - 1, d)} of ${x} using Sofia’s method.`, x - x / d, `${F(1, d)} of ${x} = ${x / d}; ${x} − ${x / d} = ${x - x / d}.`); }),
          gen(() => { const price = pick([120, 240, 360, 480, 600]); const d = pick([3, 4, 5, 6]); const n = R(1, d - 1); return num(`A jacket costs $${price}. In a sale it costs ${F(n, d)} of the original price. What is the sale price?`, (price / d) * n, `${price} ÷ ${d} × ${n} = ${(price / d) * n}.`, { pre: '$', app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'Fractions from the Nile to your playlist', hero: 'heroFractions',
      lead: 'Four thousand years ago Egyptian scribes split bread among workers using only unit fractions. Today every song you hear is built from halves, quarters and eighths of a beat.',
      leadVi: 'Từ người Ai Cập chia bánh bằng phân số đơn vị đến từng nốt nhạc trong bài hát bạn nghe — tất cả đều là phân số.',
      cards: [
        { t: 'Egyptian unit fractions', p: 'The ancient Egyptians wrote every fraction as a sum of <b>different unit fractions</b> (numerator 1). For example ¾ = ½ + ¼. A clever way to find them is to take the biggest unit fraction you can, again and again.', viz: 'egyptian' },
        { t: 'Rhythm is maths', p: 'In music, a whole note lasts a full bar of 4 beats. A half note lasts ½ of a bar, a quarter note ¼ and an eighth note ⅛. Every bar must add up to exactly 1. Build a bar and play it!', viz: 'rhythm' },
        { t: 'Never-ending decimals', p: 'Some fractions turn into decimals that repeat forever. When you divide, the remainders must eventually repeat — so the digits repeat too. ¹⁄₇ repeats the six digits 142857, and 142857 × 2, × 3, × 4, × 5, × 6 all use the same six digits!', viz: 'recurring' },
        { t: 'Sharing like a scribe', p: 'The Rhind Papyrus (about 1550 BCE) asks how to share 9 loaves among 10 workers. The answer: each gets ⅔ + ⅕ + ¹⁄₃₀ of a loaf. Check: ⅔ + ⅕ + ¹⁄₃₀ = ²⁰⁄₃₀ + ⁶⁄₃₀ + ¹⁄₃₀ = ²⁷⁄₃₀ = ⁹⁄₁₀ ✓', viz: 'fracArea' },
      ],
      facts: [['1800 BCE', 'Egyptian fractions', 'Scribes wrote fractions with a “mouth” symbol meaning “part”.'], ['63/64', 'Eye of Horus', 'Its six parts are ½, ¼, ⅛, ¹⁄₁₆, ¹⁄₃₂, ¹⁄₆₄ — together they make ⁶³⁄₆₄.'], ['142857', 'cyclic number', '¹⁄₇ = 0.142857… and 142857 × 7 = 999999.'], ['fractio', 'Latin', 'The word fraction means “breaking into pieces”.']],
      challenge: { t: 'The camel puzzle', p: 'An old story: a father leaves 17 camels to his three children: ½ to the eldest, ⅓ to the middle and ¹⁄₉ to the youngest. They cannot split 17 camels! A wise woman lends them one camel. How does this solve the problem?', a: 'With 18 camels: ½ → 9, ⅓ → 6, ¹⁄₉ → 2. Total 9 + 6 + 2 = 17, so the borrowed camel goes back! It works because ½ + ⅓ + ¹⁄₉ = ¹⁷⁄₁₈, not 1.' },
    },
    reading: {
      title: 'The Scribe’s Puzzle', sub: 'How ancient Egyptians worked with fractions. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'In 1858, a Scottish lawyer named Alexander Rhind bought an old papyrus scroll in Egypt. It was about five metres long and was written around 1550 BCE by a scribe called Ahmes. Today it is known as the Rhind Mathematical Papyrus, and it is kept in the British Museum in London.',
        'The papyrus contains 84 mathematical problems with their solutions. Many of them are practical: how to share loaves of bread among workers, how much grain is needed to feed animals, and how to calculate the area of a field. It was probably used to train young scribes.',
        'The Egyptians had an unusual way of writing fractions. Apart from two-thirds, they only used unit fractions — fractions with a numerator of 1. To write three-quarters, for example, they wrote one-half plus one-quarter. They never repeated the same unit fraction, so two-fifths was written as one-third plus one-fifteenth.',
        'This system may seem difficult, but it was useful for sharing. Imagine sharing 9 loaves among 10 workers. Each worker could receive two-thirds of a loaf, then one-fifth, then one-thirtieth. Everybody gets exactly the same, and the pieces are easy to cut.',
        'The papyrus begins with a long table showing how to write two divided by every odd number from 3 to 101 as unit fractions. Mathematicians still study this table today, because it shows that Ahmes and his teachers understood fractions very deeply.',
      ],
      gloss: [['papyrus', 'giấy cói'], ['scroll', 'cuộn'], ['scribe', 'người chép sách'], ['loaves', 'những ổ bánh mì'], ['grain', 'ngũ cốc'], ['unit fraction', 'phân số đơn vị (tử số 1)']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Who wrote the papyrus?', opts: ['a scribe called Ahmes', 'Alexander Rhind', 'a museum worker', 'a young student'], a: 0, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'What was the papyrus probably used for?', opts: ['training young scribes', 'telling stories', 'recording laws', 'selling bread'], a: 0, ex: 'Paragraph B, last sentence.' },
          { type: 'mcq', q: 'How did the Egyptians write two-fifths?', opts: ['one-third plus one-fifteenth', 'one-fifth plus one-fifth', 'two over five', 'one-half minus one-tenth'], a: 0, ex: 'Paragraph C: they never repeated the same unit fraction.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'The papyrus contains more than 80 problems.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: '84 problems.' },
          { type: 'mcq', q: 'Ahmes was a famous king.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'He was a scribe.' },
          { type: 'mcq', q: 'The papyrus was damaged when Rhind bought it.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'Not mentioned.' },
        ] },
        { title: 'Complete the notes', note: 'Use numbers or ONE word.', qs: [
          { type: 'fill', q: 'Complete.', f: 'Length of the scroll: about [] metres. Year it was bought: []. The opening table divides [] by odd numbers from 3 to 101. A fraction with numerator 1 is called a [] fraction.', a: [5, 1858, 2, ['unit']], ex: 'Paragraphs A, C and E.' },
        ] },
      ],
    },
    listening: {
      title: 'Baking with Grandma', intro: 'Mai is baking cookies with her grandmother. Listen and answer.',
      voices: { Mai: 'glassy', Grandma: 'airy' },
      lines: [
        { spk: 'Grandma', text: 'Mai, this cookie recipe makes twenty-four cookies, but we only need twelve. So we must use half of every ingredient.' },
        { spk: 'Mai', text: 'OK. The recipe says three-quarters of a cup of sugar. Half of three-quarters is three-eighths of a cup.' },
        { spk: 'Grandma', text: 'Very good. And it needs two and a half cups of flour.' },
        { spk: 'Mai', text: 'Half of two and a half is one and a quarter cups.' },
        { spk: 'Grandma', text: 'Perfect. We also need two-thirds of a cup of milk.' },
        { spk: 'Mai', text: 'Half of two-thirds is one-third of a cup. That’s easy! And instead of two eggs, we use one egg.' },
        { spk: 'Grandma', text: 'The cookies bake for twelve minutes. Let’s share them: you can have one quarter of them.' },
        { spk: 'Mai', text: 'One quarter of twelve is three cookies. Yummy!' },
      ],
      parts: [
        { title: 'Complete the recipe for 12 cookies', qs: [
          { type: 'fill', q: 'Write the amounts as fractions (e.g. 3/8).', f: 'Sugar: [] cup &nbsp; Flour: [] cups &nbsp; Milk: [] cup &nbsp; Eggs: []', a: [{ expr: '3/8' }, { expr: '5/4' }, { expr: '1/3' }, 1], ex: 'Half of ¾ = ⅜; half of 2½ = 1¼; half of ⅔ = ⅓; 1 egg.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'How many cookies does the original recipe make?', opts: ['24', '12', '36', '48'], a: 0, ex: '“this cookie recipe makes twenty-four cookies”.' },
          { type: 'num', q: 'How many cookies does Mai get?', a: 3, ex: '¼ of 12 = 3.' },
          { type: 'num', q: 'How many minutes do the cookies bake for?', a: 12, ex: '“twelve minutes”.' },
        ] },
      ],
    },
  });
})();
