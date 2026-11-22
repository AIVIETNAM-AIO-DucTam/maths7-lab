/* Unit 16 — Interpreting results */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, frac, fill, order, match, sort, txt, gen } = Q;
  const COLS = ['#4f8cff', '#ef476f', '#06d6a0', '#ffd166', '#9b5de5', '#ff8c42'];
  const twt = (head, rows) => `<div style="overflow-x:auto"><table class="tbl" style="min-width:max-content;margin:6px auto"><tr>${head.map((x) => `<th>${x}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th>${c}</th>`)).join('')}</tr>`).join('')}</table></div>`;
  const pieFig = (data, o = {}) => { const tot = data.reduce((a, d) => a + d[1], 0); let a0 = -Math.PI / 2, g = `<svg viewBox="0 0 ${o.W || 300} 180" style="width:100%;max-width:${o.W || 300}px">`; data.forEach(([l, v], i) => { const a1 = a0 + (v / tot) * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0, r = 80, cx = 90, cy = 90; g += `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z" fill="${COLS[i % 6]}" stroke="#fff" stroke-width="2"/>`; if (o.deg) { const am = (a0 + a1) / 2; g += `<text x="${cx + 52 * Math.cos(am)}" y="${cy + 52 * Math.sin(am) + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${o.deg[i]}</text>`; } g += `<rect x="186" y="${18 + i * 22}" width="12" height="12" fill="${COLS[i % 6]}"/><text x="204" y="${28 + i * 22}" font-size="12" fill="var(--ink)">${l}</text>`; a0 = a1; }); return g + '</svg>'; };
  const barsFig = (groups, series, data, o = {}) => { const W = 340, H = 200, L = 34, B = 40, gw = (W - L - 10) / groups.length; const mx = o.compound ? Math.max(...groups.map((_, gi) => series.reduce((a, _2, si) => a + data[si][gi], 0))) : Math.max(...data.flat()); const top = Math.ceil(mx / (o.step || 2)) * (o.step || 2); const Y = (v) => H - B - (v / top) * (H - B - 12); let g = `<svg viewBox="0 0 ${W} ${H + 20}" style="width:100%;max-width:${W}px">`; for (let v = 0; v <= top; v += o.step || 2) g += `<line x1="${L}" y1="${Y(v)}" x2="${W - 6}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L - 4}" y="${Y(v) + 4}" text-anchor="end" font-size="10" fill="var(--ink-2)">${v}</text>`; groups.forEach((gn, gi) => { const x0 = L + gi * gw + gw * 0.15, bw = o.compound ? gw * 0.7 : (gw * 0.7) / series.length; let acc = 0; series.forEach((_, si) => { const v = data[si][gi]; const x = o.compound ? x0 : x0 + si * bw, y1 = o.compound ? Y(acc + v) : Y(v), hgt = o.compound ? Y(acc) - Y(acc + v) : H - B - Y(v); g += `<rect x="${x}" y="${y1}" width="${bw - 2}" height="${hgt}" fill="${COLS[si]}"/>`; acc += v; }); g += `<text x="${L + gi * gw + gw / 2}" y="${H - B + 15}" text-anchor="middle" font-size="11" fill="var(--ink)">${gn}</text>`; }); series.forEach((sn, si) => (g += `<rect x="${L + si * 86}" y="${H - 8}" width="11" height="11" fill="${COLS[si]}"/><text x="${L + 15 + si * 86}" y="${H + 2}" font-size="11" fill="var(--ink)">${sn}</text>`)); return g + '</svg>'; };

  /* ---------- widgets ---------- */
  APP.viz.twoWayTable = function (el) {
    const f = VZ.frame(el, 'Giải bảng hai chiều — tìm ô trống từ các tổng', { icon: 'grid' });
    const PZ = { teach: ['42 giáo viên đi làm', ['Male', 'Female', 'Total'], ['Car', 'Bus', 'Bicycle', 'Total'], [[7, 8, 5, 20], [10, 9, 3, 22], [17, 17, 8, 42]], ['0,2', '1,2', '0,3', '2,3', '2,1', '1,0']], cine: ['Vé xem phim', ['Adult', 'Child', 'Total'], ['2 p.m.', '6 p.m.', 'Total'], [[110, 240, 350], [325, 125, 450], [435, 365, 800]], ['0,2', '0,0', '2,0', '1,1']], hockey: ['Đội khúc côn cầu', ['Home', 'Away', 'Total'], ['Win', 'Draw', 'Lose', 'Total'], [[7, 3, 2, 12], [3, 4, 5, 12], [10, 7, 7, 24]], ['0,0', '0,1', '0,3', '1,0', '1,1', '1,3', '2,2']], hair: ['Màu tóc lớp cô Jebson', ['Girls', 'Boys', 'Total'], ['Brown', 'Black', 'Other', 'Total'], [[6, 5, 3, 14], [10, 4, 2, 16], [16, 9, 5, 30]], ['0,0', '0,1', '0,2', '1,0', '1,2', '1,3', '2,1', '2,3']] };
    let key = 'teach', known = new Set(), inputs = {}; const box = h('div'); f.stage.append(box);
    function build() {
      const [, rows, cols, D, giv] = PZ[key]; known = new Set(giv); inputs = {}; box.innerHTML = '';
      const tb = h('table', { class: 'tbl', style: { margin: '6px auto', minWidth: 'max-content' } }); tb.append(h('tr', {}, h('th', {}, ''), ...cols.map((c) => h('th', {}, c))));
      rows.forEach((r, ri) => tb.append(h('tr', {}, h('th', {}, r), ...cols.map((_, ci) => { const k = `${ri},${ci}`; if (known.has(k)) return h('td', { style: { fontWeight: 800 } }, String(D[ri][ci])); const inp = h('input', { type: 'text', inputmode: 'numeric', 'aria-label': `${r} ${cols[ci]}`, style: { width: '58px', textAlign: 'center', fontWeight: 800 } }); inputs[k] = inp; return h('td', {}, inp); }))));
      box.append(h('div', { style: { overflowX: 'auto' } }, tb)); f.out.innerHTML = 'Mỗi hàng: các ô cộng lại = ô “Total” cuối hàng. Mỗi cột: các ô cộng lại = ô “Total” cuối cột. Tìm hàng/cột chỉ còn MỘT ô trống!';
    }
    function hint() {
      const [, rows, cols, D] = PZ[key]; const R0 = rows.length - 1, C0 = cols.length - 1; const isK = (r, c) => known.has(`${r},${c}`);
      for (let r = 0; r <= R0; r++) { const un = []; for (let c = 0; c <= C0; c++) if (!isK(r, c)) un.push(c); if (un.length === 1) { const c = un[0]; known.add(`${r},${c}`); const inp = inputs[`${r},${c}`]; inp.value = D[r][c]; inp.disabled = true; inp.classList.add('right'); f.out.innerHTML = `Hàng <b>${rows[r]}</b> chỉ còn một ô trống: ${c === C0 ? `cộng các ô: ${D[r].slice(0, C0).join(' + ')}` : `${D[r][C0]} − (${D[r].slice(0, C0).filter((_, j) => j !== c).join(' + ')})`} = <b>${D[r][c]}</b>.`; SFX.play('pop'); return; } }
      for (let c = 0; c <= C0; c++) { const un = []; for (let r = 0; r <= R0; r++) if (!isK(r, c)) un.push(r); if (un.length === 1) { const r = un[0]; known.add(`${r},${c}`); const inp = inputs[`${r},${c}`]; inp.value = D[r][c]; inp.disabled = true; inp.classList.add('right'); const colv = D.map((row) => row[c]); f.out.innerHTML = `Cột <b>${cols[c]}</b> chỉ còn một ô trống: ${r === R0 ? `cộng các ô: ${colv.slice(0, R0).join(' + ')}` : `${colv[R0]} − (${colv.slice(0, R0).filter((_, j) => j !== r).join(' + ')})`} = <b>${D[r][c]}</b>.`; SFX.play('pop'); return; } }
      f.out.innerHTML = '🎉 Bảng đã hoàn thành!'; SFX.play('complete');
    }
    function check() { const D = PZ[key][3]; let ok = 0, n = 0; Object.entries(inputs).forEach(([k, inp]) => { if (inp.disabled) return; n++; const [r, c] = k.split(',').map(Number); const good = +inp.value === D[r][c]; inp.classList.toggle('right', good); inp.classList.toggle('wrong', !good); if (good) ok++; }); SFX.play(ok === n ? 'correct' : 'wrong'); f.out.innerHTML = n ? `Đúng ${ok}/${n} ô.${ok === n ? ' Xuất sắc!' : ' Dùng “Gợi ý” nếu cần.'}` : 'Không còn ô nào để kiểm tra.'; }
    f.ctrls.append(VZ.seg(Object.keys(PZ).map((k) => [k, PZ[k][0]]), key, (v) => { key = v; build(); }), VZ.btn('Gợi ý 💡', hint, 'btn sm'), VZ.btn('Kiểm tra ✓', check, 'btn sm sc'));
    build();
  };
  APP.viz.barCharts = function (el) {
    const f = VZ.frame(el, 'Biểu đồ cột kép ↔ biểu đồ cột chồng', { icon: 'chart' });
    const DS = { cd: ['CD & DVD', ['Amber', 'Wenkai', 'Karl'], ['CDs', 'DVDs'], [[8, 9, 2], [2, 4, 7]]], cake: ['Bánh ở quán', ['Saturday', 'Sunday'], ['chocolate', 'vanilla'], [[18, 9], [7, 14]]], hol: ['Kì nghỉ bán ra', ['Week 1', 'Week 2'], ['beach', 'sport', 'city', 'safari'], [[10, 5], [5, 1], [4, 8], [1, 2]]] };
    let key = 'cd', mode = 0, k = 0, anim = null; const W = 360, H = 230, svg = VZ.svg(W, H); f.stage.append(svg);
    const L = 34, B = 44, T = 12;
    function layout(md) { const [, G, S, D] = DS[key]; const gw = (W - L - 10) / G.length; const top = md ? Math.max(...G.map((_, gi) => S.reduce((a, _2, si) => a + D[si][gi], 0))) : Math.max(...D.flat()); const tp = Math.ceil(top / 4) * 4; const rects = []; G.forEach((_, gi) => { const x0 = L + gi * gw + gw * 0.14; let acc = 0; S.forEach((_2, si) => { const v = D[si][gi]; const bw = md ? gw * 0.72 : (gw * 0.72) / S.length; rects.push({ x: md ? x0 : x0 + si * bw, w: bw - 2, lo: md ? acc : 0, hi: md ? acc + v : v }); acc += v; }); }); return { rects, tp }; }
    function draw(t) {
      const [, G, S] = DS[key]; const A = layout(0), Bl = layout(1); const lerp = (a, b) => a + (b - a) * t; const tp = lerp(A.tp, Bl.tp); const Y = (v) => H - B - (v / tp) * (H - B - T);
      svg.innerHTML = ''; const step = tp > 20 ? 5 : tp > 10 ? 2 : 1; for (let v = 0; v <= tp + 0.01; v += step) svg.append(s('line', { x1: L, y1: Y(v), x2: W - 6, y2: Y(v), stroke: 'var(--line)' }), s('text', { x: L - 4, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: Math.round(v) }));
      A.rects.forEach((ra, i) => { const rb = Bl.rects[i]; const si = i % S.length; const x = lerp(ra.x, rb.x), w = lerp(ra.w, rb.w), lo = lerp(ra.lo, rb.lo), hi = lerp(ra.hi, rb.hi); svg.append(s('rect', { x, y: Y(hi), width: w, height: Math.max(0, Y(lo) - Y(hi)), fill: COLS[si], rx: 2 })); if (t > 0.98 && hi - lo >= 2) svg.append(s('text', { x: x + w / 2, y: Y(hi) + 13, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#fff', text: Math.round(hi - lo) })); if (t < 0.02 && hi > 0) svg.append(s('text', { x: x + w / 2, y: Y(hi) - 3, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: 'var(--ink)', text: Math.round(hi) })); });
      const gw = (W - L - 10) / G.length; G.forEach((g, gi) => svg.append(s('text', { x: L + gi * gw + gw / 2, y: H - B + 15, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink)', text: g })));
      S.forEach((sn, si) => svg.append(s('rect', { x: L + si * 80, y: H - 16, width: 11, height: 11, fill: COLS[si] }), s('text', { x: L + 15 + si * 80, y: H - 7, 'font-size': 11, fill: 'var(--ink)', text: sn })));
      f.out.innerHTML = mode ? '<b>Cột chồng (compound)</b>: các nhóm ghép thành một cột → dễ so sánh <b>TỔNG</b>, đọc từng phần bằng cách lấy đỉnh trừ đáy của đoạn.' : '<b>Cột kép (dual)</b>: các cột đứng cạnh nhau → dễ so sánh <b>TỪNG LOẠI</b> giữa các nhóm.';
    }
    const go = (to) => { if (anim) anim(); const from = k; SFX.play('whoosh'); anim = VZ.animate(900, (e) => { k = from + (to - from) * e; draw(k); }, () => { k = to; draw(k); }); };
    f.ctrls.append(VZ.seg(Object.keys(DS).map((x) => [x, DS[x][0]]), key, (v) => { key = v; draw(k); }), VZ.seg([[0, 'Cột kép'], [1, 'Cột chồng']], mode, (v) => { mode = +v; go(mode); }));
    draw(0);
  };
  APP.viz.pieMaker = function (el) {
    const f = VZ.frame(el, 'Vẽ biểu đồ tròn & biểu đồ ô vuông (waffle)', { icon: 'chart' });
    const DS = { hol: ['Kì nghỉ (90 người)', [['activity', 32], ['beach', 27], ['city break', 24], ['other', 7]]], mus: ['Âm nhạc (40 người)', [['soul', 5], ['classical', 20], ['pop', 8], ['other', 7]]], car: ['Xe trong bãi (60)', [['Ford', 12], ['Vauxhall', 18], ['Toyota', 10], ['Nissan', 20]]], tr: ['Phương tiện (60)', [['car', 15], ['bus', 22], ['train', 5], ['bicycle', 18]]] };
    let key = 'hol', view = 'pie', data = DS.hol[1].map((d) => d.slice()), anim = null, sweep = 1; const W = 360, H = 220, svg = VZ.svg(W, H); svg.style.maxWidth = '520px'; svg.style.margin = '0 auto'; svg.style.display = 'block'; const tb = h('div', { style: { overflowX: 'auto' } }); f.stage.append(svg, tb); const sl = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }); f.ctrls.append(sl);
    function draw() {
      const tot = data.reduce((a, d) => a + d[1], 0) || 1; const per = 360 / tot; svg.innerHTML = '';
      if (view === 'pie') { const cx = 110, cy = 110, r = 96; let a0 = -90; data.forEach(([l, v], i) => { const sw = v * per * sweep; if (sw <= 0) return; const a1 = a0 + sw; const rad = (d) => (d * Math.PI) / 180; const big = sw > 180 ? 1 : 0; const path = sw >= 359.99 ? `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0` : `M${cx} ${cy} L${cx + r * Math.cos(rad(a0))} ${cy + r * Math.sin(rad(a0))} A${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(rad(a1))} ${cy + r * Math.sin(rad(a1))} Z`; svg.append(s('path', { d: path, fill: COLS[i], stroke: '#fff', 'stroke-width': 2 })); const am = rad((a0 + a1) / 2); if (sweep === 1 && sw > 18) svg.append(s('text', { x: cx + r * 0.62 * Math.cos(am), y: cy + r * 0.62 * Math.sin(am) + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#fff', text: `${N(U.round(v * per, 1))}°` })); a0 = a1; }); }
      else { let cells = []; let acc = 0; const pcs = data.map(([, v]) => (v / tot) * 100); const rounded = pcs.map(Math.floor); let rem = 100 - rounded.reduce((a, b) => a + b, 0); pcs.map((p, i) => [p - Math.floor(p), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rem > 0) { rounded[i]++; rem--; } }); rounded.forEach((c, i) => { for (let j = 0; j < c; j++) cells.push(i); }); void acc; cells.forEach((ci, j) => svg.append(s('rect', { x: 14 + (j % 10) * 19.5, y: 14 + Math.floor(j / 10) * 19.5, width: 17, height: 17, rx: 3, fill: COLS[ci], style: `animation:popIn .25s ${j * 0.008}s both` }))); }
      data.forEach(([l], i) => svg.append(s('rect', { x: 236, y: 30 + i * 26, width: 14, height: 14, rx: 3, fill: COLS[i] }), s('text', { x: 256, y: 42 + i * 26, 'font-size': 12, 'font-weight': 700, fill: 'var(--ink)', text: l })));
      tb.innerHTML = `<table class="tbl" style="min-width:max-content;margin:6px auto 0"><tr><th></th>${data.map(([l]) => `<th>${l}</th>`).join('')}<th>Total</th></tr><tr><th>Tần số</th>${data.map(([, v]) => `<td>${v}</td>`).join('')}<td>${tot}</td></tr><tr><th>Số đo góc</th>${data.map(([, v]) => `<td>${N(U.round(v * per, 1))}°</td>`).join('')}<td>360°</td></tr><tr><th>%</th>${data.map(([, v]) => `<td>${N(U.round((v / tot) * 100, 1))}%</td>`).join('')}<td>100%</td></tr></table>`;
      f.out.innerHTML = `Mỗi đơn vị ứng với 360° ÷ ${tot} = <b>${N(U.round(per, 3))}°</b>. Góc mỗi phần = tần số × ${N(U.round(per, 3))}°. ${view === 'pie' ? 'Biểu đồ tròn cho thấy TỈ LỆ, không cho biết số lượng thật nếu không có tổng.' : 'Biểu đồ waffle: 100 ô, mỗi ô = 1%.'}`;
    }
    function sliders() { sl.innerHTML = ''; data.forEach((d, i) => sl.append(VZ.range(d[0], 0, 40, d[1], 1, (v) => { d[1] = v; draw(); }))); }
    const grow = () => { if (anim) anim(); anim = VZ.animate(900, (e) => { sweep = e; draw(); }, () => { sweep = 1; draw(); SFX.play('pop'); }); };
    f.ctrls.prepend(VZ.seg(Object.keys(DS).map((x) => [x, DS[x][0]]), key, (v) => { key = v; data = DS[v][1].map((d) => d.slice()); sliders(); grow(); }), VZ.seg([['pie', 'Tròn'], ['waffle', 'Waffle']], view, (v) => { view = v; SFX.play('flip'); grow(); }));
    sliders(); grow();
  };
  APP.viz.infoVillage = function (el) {
    const f = VZ.frame(el, 'Infographic: người lớn trong một ngôi làng', { icon: 'eye' });
    let tot = 650, sel = 1; const AG = [['18–34', 31], ['35–44', 20], ['45–54', 23], ['55+', 26]]; const box = h('div'); f.stage.append(box);
    function draw() {
      const ppl = Array.from({ length: 100 }, (_, i) => (i < 58 ? '👩' : '👨'));
      box.innerHTML = `<div class="row" style="gap:12px;flex-wrap:wrap;justify-content:center;align-items:flex-start"><div style="flex:1;min-width:150px;max-width:220px"><div style="display:grid;grid-template-columns:repeat(10,1fr);gap:1px;font-size:clamp(.7rem,2.6vw,1rem);line-height:1.15">${ppl.map((p, i) => `<span style="animation:popIn .2s ${i * 0.006}s both;filter:${p === '👩' ? 'none' : 'grayscale(.2)'}">${p}</span>`).join('')}</div><div style="text-align:center;font-weight:800;margin-top:4px"><span style="color:var(--stats)">58% phụ nữ</span> · <span style="color:var(--number)">42% nam giới</span></div><div style="text-align:center;font-size:.85rem;margin-top:4px">🚶 đi bộ mỗi ngày: phụ nữ 54%, nam giới 45%</div></div>
      <div style="flex:1;min-width:170px">${AG.map(([a, p], i) => `<div data-i="${i}" style="cursor:pointer;margin:6px 0"><div style="display:flex;justify-content:space-between;font-weight:700"><span>${a}</span><span>${p}%</span></div><div style="height:22px;border-radius:11px;background:var(--line);overflow:hidden"><div style="height:100%;width:${p * 2.6}%;background:${i === sel ? 'var(--warn)' : 'var(--stats)'};transition:width .6s"></div></div></div>`).join('')}</div></div>`;
      box.querySelectorAll('[data-i]').forEach((d) => d.addEventListener('click', () => { sel = +d.dataset.i; SFX.play('tap'); draw(); }));
      const p = AG[sel][1]; f.out.innerHTML = `Có ${tot} người lớn. Nhóm <b>${AG[sel][0]}</b> chiếm ${p}% → ${p}% × ${tot} = ${tot} ÷ 100 × ${p} = <b>${N(U.round((tot * p) / 100, 2))} người</b>. (Mẹo: 10% của ${tot} là ${N(tot / 10)}.)`;
    }
    f.ctrls.append(VZ.range('Tổng số người lớn', 100, 2000, tot, 50, (v) => { tot = v; draw(); }));
    draw();
  };
  APP.viz.chartGallery = function (el) {
    const f = VZ.frame(el, 'Chọn biểu đồ phù hợp cho dữ liệu', { icon: 'chart' });
    const G = {
      bar: ['Cột', 'So sánh dữ liệu rời rạc (discrete) giữa các nhóm.', () => barsFig(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['ice creams'], [[12, 18, 9, 15, 22]], { step: 5 })],
      dual: ['Cột kép', 'So sánh TỪNG loại giữa hai (hoặc nhiều) tập dữ liệu.', () => barsFig(['gold', 'silver', 'bronze'], ['Country A', 'Country B'], [[8, 5, 9], [6, 9, 4]], { step: 2 })],
      comp: ['Cột chồng', 'Xem từng phần VÀ tổng của mỗi nhóm.', () => barsFig(['Day 1', 'Day 2'], ['cakes', 'sandwiches', 'drinks'], [[12, 9], [8, 14], [20, 16]], { compound: true, step: 5 })],
      pie: ['Tròn', 'So sánh mỗi phần với TỔNG THỂ (tỉ lệ).', () => pieFig([['car', 8], ['bus', 12], ['bicycle', 5], ['on foot', 11]])],
      line: ['Đường', 'Xem dữ liệu THAY ĐỔI THEO THỜI GIAN.', () => { const v = [15, 14, 12, 8, 7, 4]; let g = '<svg viewBox="0 0 340 200" style="width:100%;max-width:340px">'; for (let i = 0; i <= 4; i++) g += `<line x1="34" y1="${170 - i * 38}" x2="330" y2="${170 - i * 38}" stroke="var(--line)"/><text x="30" y="${174 - i * 38}" text-anchor="end" font-size="10" fill="var(--ink-2)">${i * 4}</text>`; g += `<polyline points="${v.map((y, i) => `${40 + i * 56},${170 - (y / 16) * 152}`).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="3"/>` + v.map((y, i) => `<circle cx="${40 + i * 56}" cy="${170 - (y / 16) * 152}" r="4" fill="var(--accent)"/><text x="${40 + i * 56}" y="188" text-anchor="middle" font-size="10" fill="var(--ink-2)">${i * 10}</text>`).join('') + '<text x="186" y="200" text-anchor="middle" font-size="10" fill="var(--ink)">Time (min) — air in a scuba tank (litres)</text></svg>'; return g; }],
      scatter: ['Phân tán', 'Tìm MỐI LIÊN HỆ (tương quan) giữa hai đại lượng.', () => { const L2 = [26, 31, 34, 32, 22, 31, 30, 24, 33, 27], M = [625, 800, 975, 875, 525, 850, 750, 550, 950, 700]; let g = '<svg viewBox="0 0 340 200" style="width:100%;max-width:340px"><line x1="34" y1="170" x2="330" y2="170" stroke="var(--ink)"/><line x1="34" y1="10" x2="34" y2="170" stroke="var(--ink)"/>'; L2.forEach((x, i) => (g += `<circle cx="${34 + ((x - 20) / 16) * 290}" cy="${170 - ((M[i] - 500) / 500) * 155}" r="5" fill="var(--stats)"/>`)); return g + '<text x="186" y="192" text-anchor="middle" font-size="10" fill="var(--ink)">length (cm) → mass (g) of 10 hedgehogs</text></svg>'; }],
      freq: ['Tần số (ghép nhóm)', 'Dữ liệu LIÊN TỤC (continuous) chia thành các khoảng: các cột sát nhau.', () => { const v = [4, 7, 14, 6]; let g = '<svg viewBox="0 0 340 200" style="width:100%;max-width:340px">'; v.forEach((y, i) => (g += `<rect x="${40 + i * 70}" y="${170 - y * 10}" width="70" height="${y * 10}" fill="var(--number)" stroke="#fff" stroke-width="2"/><text x="${40 + i * 70}" y="186" text-anchor="middle" font-size="10" fill="var(--ink-2)">${i * 5}</text>`)); return g + '<text x="320" y="186" font-size="10" fill="var(--ink-2)">20</text><text x="186" y="200" text-anchor="middle" font-size="10" fill="var(--ink)">distance cycled (km)</text></svg>'; }],
      venn: ['Venn / Carroll', 'PHÂN LOẠI đối tượng vào các nhóm có đặc điểm chung.', () => '<svg viewBox="0 0 340 200" style="width:100%;max-width:340px"><circle cx="135" cy="100" r="78" fill="rgba(79,140,255,.25)" stroke="#4f8cff" stroke-width="2"/><circle cx="205" cy="100" r="78" fill="rgba(239,71,111,.25)" stroke="#ef476f" stroke-width="2"/><text x="100" y="105" font-size="22" font-weight="800" fill="var(--ink)" text-anchor="middle">7</text><text x="170" y="105" font-size="22" font-weight="800" fill="var(--ink)" text-anchor="middle">12</text><text x="240" y="105" font-size="22" font-weight="800" fill="var(--ink)" text-anchor="middle">9</text><text x="90" y="22" font-size="12" fill="var(--ink)">Biology</text><text x="215" y="22" font-size="12" fill="var(--ink)">Chemistry</text></svg>'],
      info: ['Infographic', 'Truyền đạt thông tin NHANH, dễ hiểu, thu hút.', () => '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;font-weight:800"><div style="padding:14px;border-radius:14px;background:var(--good-soft);text-align:center"><div style="font-size:2rem">⏱️ 40%</div>delivered on time</div><div style="padding:14px;border-radius:14px;background:var(--bad-soft,rgba(239,71,111,.15));text-align:center"><div style="font-size:2rem">🐢 60%</div>delivered late</div></div>'],
    };
    let key = 'bar'; const box = h('div', { style: { minHeight: '210px', display: 'grid', placeItems: 'center' } }); f.stage.append(box);
    const draw = () => { box.innerHTML = `<div style="width:100%;animation:popIn .35s both">${G[key][2]()}</div>`; f.out.innerHTML = `<b>Biểu đồ ${G[key][0]}</b>: ${G[key][1]}`; };
    f.ctrls.append(VZ.seg(Object.keys(G).map((k) => [k, G[k][0]]), key, (v) => { key = v; draw(); }));
    draw();
  };
  APP.viz.scatterFit = function (el) {
    const f = VZ.frame(el, 'Biểu đồ phân tán & đường xu hướng (line of best fit)', { icon: 'chart' });
    const DS = { hog: ['Nhím', 'Length (cm)', 'Mass (g)', [26, 31, 34, 32, 22, 31, 30, 24, 33, 27], [625, 800, 975, 875, 525, 850, 750, 550, 950, 700], [20, 36], [500, 1000], 725], run: ['Chạy & đánh vần', 'Time to run 100 m (s)', 'Spelling score', [16, 18, 20, 22, 19, 23, 24, 17], [7, 10, 6, 4, 3, 9, 7, 2], [15, 25], [0, 10], 5], ice: ['Kem & nhiệt độ*', 'Temperature (°C)', 'Ice creams sold', [14, 16, 18, 20, 22, 24, 26, 28, 30, 32], [22, 30, 34, 45, 48, 60, 62, 75, 80, 92], [12, 34], [0, 100], 50] };
    let key = 'hog', yq = 725, l0, l1; const W = 360, H = 260, Lm = 46, B = 40, T = 12, Rm = 14, svg = VZ.svg(W, H); f.stage.append(svg);
    const XA = (d) => d[5][0] + 0.2 * (d[5][1] - d[5][0]), XB = (d) => d[5][0] + 0.8 * (d[5][1] - d[5][0]);
    const cp = s('clipPath', { id: 'sfclip' }, s('rect', { x: Lm, y: T, width: W - Lm - Rm, height: H - B - T })); svg.append(cp);
    const geo = () => { const d = DS[key]; const X = (x) => Lm + ((x - d[5][0]) / (d[5][1] - d[5][0])) * (W - Lm - Rm), Y = (y) => H - B - ((y - d[6][0]) / (d[6][1] - d[6][0])) * (H - B - T); return { d, X, Y, IX: (px) => d[5][0] + ((px - Lm) / (W - Lm - Rm)) * (d[5][1] - d[5][0]), IY: (py) => d[6][0] + ((H - B - py) / (H - B - T)) * (d[6][1] - d[6][0]) }; };
    const fit = () => { const d = DS[key], xs = d[3], ys = d[4], n = xs.length; const mx = U.mean(xs), my = U.mean(ys); let a = 0, b = 0; xs.forEach((x, i) => { a += (x - mx) * (ys[i] - my); b += (x - mx) ** 2; }); const m = a / b; l0 = my + m * (XA(d) - mx); l1 = my + m * (XB(d) - mx); void n; };
    const layer = s('g'), h0 = s('circle', { r: 10, fill: 'var(--accent)', stroke: '#fff', 'stroke-width': 3 }), h1 = s('circle', { r: 10, fill: 'var(--accent)', stroke: '#fff', 'stroke-width': 3 }); svg.append(layer, h0, h1);
    function draw() {
      const { d, X, Y } = geo(); layer.innerHTML = '';
      const ys = (d[6][1] - d[6][0]) / 5, xs2 = (d[5][1] - d[5][0]) > 12 ? 4 : 2; for (let v = d[6][0]; v <= d[6][1] + 1e-9; v += ys) layer.append(s('line', { x1: Lm, y1: Y(v), x2: W - Rm, y2: Y(v), stroke: 'var(--line)' }), s('text', { x: Lm - 4, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-2)', text: N(v) }));
      for (let v = d[5][0]; v <= d[5][1] + 1e-9; v += xs2) layer.append(s('text', { x: X(v), y: H - B + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: v }));
      layer.append(s('line', { x1: Lm, y1: H - B, x2: W - Rm, y2: H - B, stroke: 'var(--ink)', 'stroke-width': 1.5 }), s('line', { x1: Lm, y1: T, x2: Lm, y2: H - B, stroke: 'var(--ink)', 'stroke-width': 1.5 }), s('text', { x: (Lm + W) / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink)', text: d[1] }), s('text', { x: 12, y: (T + H - B) / 2, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink)', transform: `rotate(-90 12 ${(T + H - B) / 2})`, text: d[2] }));
      d[3].forEach((x, i) => layer.append(s('circle', { cx: X(x), cy: Y(d[4][i]), r: 5.5, fill: 'var(--stats)', stroke: '#fff', 'stroke-width': 1.5 })));
      const m = (l1 - l0) / (XB(d) - XA(d)), yAt = (x) => l0 + m * (x - XA(d));
      layer.append(s('line', { x1: X(d[5][0]), y1: Y(yAt(d[5][0])), x2: X(d[5][1]), y2: Y(yAt(d[5][1])), stroke: 'var(--accent)', 'stroke-width': 3, 'clip-path': 'url(#sfclip)' }));
      const xq = Math.abs(m) > 1e-9 ? XA(d) + (yq - l0) / m : NaN;
      if (isFinite(xq) && xq >= d[5][0] && xq <= d[5][1]) layer.append(s('polyline', { points: `${Lm},${Y(yq)} ${X(xq)},${Y(yq)} ${X(xq)},${H - B}`, fill: 'none', stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
      h0.setAttribute('cx', X(XA(d))); h0.setAttribute('cy', Y(l0)); h1.setAttribute('cx', X(XB(d))); h1.setAttribute('cy', Y(l1));
      const r = (() => { const xs = d[3], yv = d[4]; const mx = U.mean(xs), my = U.mean(yv); let a = 0, b = 0, c = 0; xs.forEach((x, i) => { a += (x - mx) * (yv[i] - my); b += (x - mx) ** 2; c += (yv[i] - my) ** 2; }); return a / Math.sqrt(b * c); })();
      const corr = r > 0.7 ? 'tương quan <b>dương mạnh</b> (positive): x tăng thì y cũng tăng' : r < -0.7 ? 'tương quan <b>âm</b> (negative)' : Math.abs(r) < 0.35 ? '<b>không có tương quan</b> rõ ràng (no correlation)' : 'tương quan yếu';
      f.out.innerHTML = `Dữ liệu cho thấy ${corr}. ${isFinite(xq) && xq >= d[5][0] && xq <= d[5][1] ? `Đọc từ đường xu hướng: ${d[2]} = ${N(yq)} → ${d[1]} ≈ <b>${N(U.round(xq, 1))}</b>.` : 'Đường xu hướng không giúp ước lượng ở đây.'} ${key === 'ice' ? '(*dữ liệu minh hoạ)' : ''} Kéo hai đầu mút để tự vẽ đường xu hướng.`;
    }
    [h0, h1].forEach((hd, i) => VZ.drag(svg, hd, (p) => { const { d, IY } = geo(); const v = Math.max(d[6][0], Math.min(d[6][1], IY(p.y))); if (i) l1 = v; else l0 = v; draw(); }));
    const rgBox = h('span'); const mkRg = () => { const d = DS[key]; rgBox.innerHTML = ''; yq = d[7]; rgBox.append(VZ.range('Đọc tại ' + d[2], d[6][0], d[6][1], yq, (d[6][1] - d[6][0]) / 100, (v) => { yq = v; draw(); })); };
    f.ctrls.append(VZ.seg(Object.keys(DS).map((k) => [k, DS[k][0]]), key, (v) => { key = v; fit(); mkRg(); draw(); SFX.play('select'); }), VZ.btn('Đường tốt nhất', () => { fit(); SFX.play('pop'); draw(); }, 'btn sm sc'), rgBox);
    mkRg(); fit(); draw();
  };
  APP.viz.averagesLab = function (el) {
    const f = VZ.frame(el, 'Mốt, trung vị, trung bình, khoảng biến thiên — kéo các điểm!', { icon: 'target' });
    const PR = { foot: ['Tuổi đội bóng', [16, 17, 18, 18, 19, 20, 20, 21, 21, 32, 41], 10, 45], wait: ['Thời gian chờ (phút)', [2, 5, 3, 8, 5, 2, 10, 7, 8, 8, 4, 7, 2, 2, 3, 6, 10, 3, 4, 7], 0, 12], pocket: ['Tiền tiêu vặt ($)', [5, 6, 6, 7, 8, 8, 8, 9, 10, 60], 0, 65] };
    let key = 'foot', vals = PR.foot[1].slice(); const W = 360, H = 200, Lm = 16, Rm = 16, base = 150; const svg = VZ.svg(W, H); f.stage.append(svg);
    const axis = s('g'), marks = s('g'), dots = s('g'); svg.append(axis, marks, dots); let hs = [];
    const X = (v) => Lm + ((v - PR[key][2]) / (PR[key][3] - PR[key][2])) * (W - Lm - Rm), IX = (px) => PR[key][2] + ((px - Lm) / (W - Lm - Rm)) * (PR[key][3] - PR[key][2]);
    function build() { axis.innerHTML = ''; dots.innerHTML = ''; const [, , lo, hi] = PR[key]; const step = hi - lo > 30 ? 5 : hi - lo > 15 ? 2 : 1; axis.append(s('line', { x1: Lm, y1: base, x2: W - Rm, y2: base, stroke: 'var(--ink)', 'stroke-width': 2 })); for (let v = lo; v <= hi; v += step) axis.append(s('line', { x1: X(v), y1: base, x2: X(v), y2: base + 5, stroke: 'var(--ink)' }), s('text', { x: X(v), y: base + 18, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: v })); hs = vals.map((_, i) => { const c = s('circle', { r: 7, fill: 'var(--stats)', stroke: '#fff', 'stroke-width': 2 }); dots.append(c); VZ.drag(svg, c, (p) => { const v = Math.max(lo, Math.min(hi, Math.round(IX(p.x)))); if (v !== vals[i]) { vals[i] = v; SFX.play('tick'); draw(); } }); return c; }); draw(); }
    function draw() {
      const cnt = {}; const order2 = vals.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); order2.forEach(([v, i]) => { cnt[v] = (cnt[v] || 0) + 1; hs[i].setAttribute('cx', X(v)); hs[i].setAttribute('cy', base - 8 - (cnt[v] - 1) * 15); });
      const sorted = vals.slice().sort((a, b) => a - b), n = vals.length, mean = U.mean(vals), med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2, mx = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter((k) => cnt[k] === mx).map(Number), rng = sorted[n - 1] - sorted[0];
      marks.innerHTML = ''; marks.append(s('path', { d: `M${X(mean)} ${base + 4} l-8 14 h16 z`, fill: 'var(--bad)' }), s('text', { x: X(mean), y: base + 44, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: 'var(--bad)', text: `mean ${N(U.round(mean, 1))}` }), s('line', { x1: X(med), y1: 20, x2: X(med), y2: base, stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }), s('text', { x: X(med), y: 14, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: 'var(--accent)', text: `median ${N(med)}` }), s('line', { x1: X(sorted[0]), y1: base + 28, x2: X(sorted[n - 1]), y2: base + 28, stroke: 'var(--ink-3)', 'stroke-width': 2 }));
      hs.forEach((c, i) => c.setAttribute('fill', modes.includes(vals[i]) && mx > 1 ? 'var(--warn)' : 'var(--stats)'));
      f.out.innerHTML = `Mốt (mode): <b>${mx > 1 ? modes.join(', ') : 'không có'}</b>${modes.length === 2 && mx > 1 ? ' (bimodal)' : ''} · Trung vị (median): <b>${N(med)}</b> · Trung bình (mean): <b>${N(U.round(mean, 2))}</b> · Khoảng biến thiên (range): ${sorted[n - 1]} − ${sorted[0]} = <b>${rng}</b>. ${Math.abs(mean - med) >= 1 && vals.filter((v) => (mean > med ? v > mean : v < mean)).length <= n / 4 ? '⚠️ Giá trị ngoại lai (outlier) kéo mean lệch khỏi phần lớn dữ liệu → nên dùng <b>median</b>.' : 'Mean và median khá gần nhau.'} Kéo các chấm để xem số liệu thay đổi!`;
    }
    f.ctrls.append(VZ.seg(Object.keys(PR).map((k) => [k, PR[k][0]]), key, (v) => { key = v; vals = PR[v][1].slice(); build(); SFX.play('select'); }), VZ.btn('Đặt lại', () => { vals = PR[key][1].slice(); build(); }, 'btn sm ghost'));
    build();
  };
  APP.viz.vennSports = function (el) {
    const f = VZ.frame(el, 'Sơ đồ Venn: ai chơi môn thể thao nào?', { icon: 'grid' });
    const F = ['Aaron', 'Chloe', 'Eralia', 'Irine', 'Jengo'], Hk = ['Brad', 'Chloe', 'Eralia', 'Fayard', 'Harper'], C = ['Chloe', 'Guang', 'Harper', 'Jengo']; const all = ['Aaron', 'Brad', 'Chloe', 'Dian', 'Eralia', 'Fayard', 'Guang', 'Harper', 'Irine', 'Jengo'];
    let hi = null; const W = 360, H = 270, svg = VZ.svg(W, H); f.stage.append(svg);
    const pos = { Aaron: [82, 92], Irine: [92, 118], Brad: [268, 92], Fayard: [278, 118], Guang: [180, 222], Chloe: [180, 132], Eralia: [180, 84], Jengo: [128, 168], Harper: [232, 168], Dian: [330, 252] };
    function draw() {
      svg.innerHTML = ''; svg.append(s('rect', { x: 4, y: 4, width: W - 8, height: H - 8, rx: 12, fill: 'none', stroke: 'var(--ink-3)' }));
      [[140, 110, 'Football', F, '#4f8cff'], [220, 110, 'Hockey', Hk, '#ef476f'], [180, 175, 'Cricket', C, '#06d6a0']].forEach(([cx, cy, nm, set, col]) => { const c = s('circle', { cx, cy, r: 82, fill: col, 'fill-opacity': hi === nm ? 0.4 : 0.15, stroke: col, 'stroke-width': 2.5, style: 'cursor:pointer' }); c.addEventListener('click', () => { hi = hi === nm ? null : nm; SFX.play('tap'); draw(); }); svg.append(c, s('text', { x: nm === 'Cricket' ? cx : cx + (nm === 'Football' ? -70 : 70), y: nm === 'Cricket' ? cy + 96 : 20, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: col, text: nm })); });
      all.forEach((nm) => { const on = !hi || ({ Football: F, Hockey: Hk, Cricket: C }[hi]).includes(nm); svg.append(s('text', { x: pos[nm][0], y: pos[nm][1], 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink)', opacity: on ? 1 : 0.25, text: nm, 'pointer-events': 'none' })); });
      f.out.innerHTML = hi ? `<b>${hi}</b>: ${({ Football: F, Hockey: Hk, Cricket: C }[hi]).join(', ')} (${({ Football: F, Hockey: Hk, Cricket: C }[hi]).length} người).` : 'Chloe chơi cả ba môn (nằm ở giữa). Dian không chơi môn nào nên nằm ngoài các vòng tròn. Chạm vào một vòng tròn để xem danh sách.';
    }
    draw();
  };
  APP.viz.misleadingGraph = function (el) {
    const f = VZ.frame(el, 'Biểu đồ gây hiểu lầm — hãy là người đọc tinh ý!', { icon: 'eye' });
    let mode = 'cut'; const box = h('div'); f.stage.append(box); const A = 52, B = 48;
    function draw() {
      let g = '<svg viewBox="0 0 340 220" style="width:100%;max-width:340px">'; const base = 190;
      if (mode === 'cut' || mode === 'fair') { const lo = mode === 'cut' ? 46 : 0, hi = 54 + (mode === 'fair' ? 6 : 0); const Y = (v) => base - ((v - lo) / (hi - lo)) * 170; for (let v = lo; v <= hi; v += mode === 'cut' ? 2 : 10) g += `<line x1="40" y1="${Y(v)}" x2="320" y2="${Y(v)}" stroke="var(--line)"/><text x="36" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--ink-2)">${v}%</text>`; [[A, 'Brand A', '#ef476f'], [B, 'Brand B', '#4f8cff']].forEach(([v, l, c], i) => (g += `<rect x="${80 + i * 130}" y="${Y(v)}" width="90" height="${base - Y(v)}" fill="${c}" style="transition:all .5s"/><text x="${125 + i * 130}" y="${base + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">${l}</text>`)); }
      else { const sA = 140, sB = sA * (B / A); g += `<text x="${90}" y="${base - sA - 4}" font-size="12" fill="var(--ink)">Brand A: 52%</text><text x="${230}" y="${base - sB - 4}" font-size="12" fill="var(--ink)">Brand B: 48%</text><text x="${90}" y="${base}" font-size="${sA}" >🥤</text><text x="${230}" y="${base}" font-size="${mode === 'pict' ? sB * (B / A) * 0.55 : sB}">🥤</text>`; }
      box.innerHTML = g + '</svg>';
      f.out.innerHTML = { cut: '⚠️ Trục dọc bắt đầu từ 46% chứ không phải 0 → cột A trông cao gấp <b>3 lần</b> cột B, trong khi thực ra chỉ hơn 4 điểm phần trăm!', fair: '✅ Trục bắt đầu từ 0: hai thương hiệu gần như ngang nhau (52% và 48%).', pict: '⚠️ Hình minh hoạ bị thu nhỏ cả chiều cao LẪN chiều rộng → diện tích nhỏ đi nhiều hơn tỉ lệ thật. Mắt ta so sánh diện tích, nên B trông bé hơn hẳn.' }[mode];
    }
    f.ctrls.append(VZ.seg([['cut', 'Trục bị cắt'], ['fair', 'Trung thực'], ['pict', 'Hình phóng sai']], mode, (v) => { mode = v; SFX.play('flip'); draw(); }));
    draw();
  };
  APP.viz.nightingaleRose = function (el) {
    const f = VZ.frame(el, 'Biểu đồ hoa hồng của Florence Nightingale (số liệu minh hoạ)', { icon: 'spark' });
    const dis = [35, 60, 90, 120, 160, 210, 260, 230, 170, 120, 80, 50], wnd = [10, 12, 30, 25, 18, 40, 35, 22, 15, 12, 10, 8]; const mo = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    let view = 'rose', g0 = 0, anim = null; const W = 340, H = 260, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const mx = Math.max(...dis);
      if (view === 'rose') { const cx = 170, cy = 130, R0 = 115; dis.forEach((d, i) => { const a0 = (i / 12) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2; [[d, '#4f8cff'], [wnd[i], '#ef476f']].forEach(([v, c]) => { const r = R0 * Math.sqrt(v / mx) * g0; svg.append(s('path', { d: `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`, fill: c, 'fill-opacity': 0.75, stroke: '#fff', 'stroke-width': 1 })); }); const am = (a0 + a1) / 2; svg.append(s('text', { x: cx + (R0 + 10) * Math.cos(am), y: cy + (R0 + 10) * Math.sin(am) + 4, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--ink-2)', text: mo[i] })); }); }
      else { const Y = (v) => 220 - (v / mx) * 190 * g0; dis.forEach((d, i) => svg.append(s('rect', { x: 20 + i * 26, y: Y(d), width: 11, height: 220 - Y(d), fill: '#4f8cff' }), s('rect', { x: 31 + i * 26, y: Y(wnd[i]), width: 11, height: 220 - Y(wnd[i]), fill: '#ef476f' }), s('text', { x: 31 + i * 26, y: 236, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--ink-2)', text: mo[i] }))); }
      svg.append(s('rect', { x: 10, y: H - 16, width: 10, height: 10, fill: '#4f8cff' }), s('text', { x: 24, y: H - 7, 'font-size': 11, fill: 'var(--ink)', text: 'bệnh có thể phòng tránh' }), s('rect', { x: 190, y: H - 16, width: 10, height: 10, fill: '#ef476f' }), s('text', { x: 204, y: H - 7, 'font-size': 11, fill: 'var(--ink)', text: 'vết thương chiến trận' }));
      f.out.innerHTML = 'Mỗi múi là một tháng; DIỆN TÍCH múi tỉ lệ với số ca tử vong. Phần xanh khổng lồ cho thấy bệnh tật (do vệ sinh kém) giết nhiều binh sĩ hơn hẳn vết thương — hình ảnh này đã thuyết phục chính phủ Anh cải thiện bệnh viện.';
    }
    const grow = () => { if (anim) anim(); anim = VZ.animate(1500, (e) => { g0 = e; draw(); }); SFX.play('whoosh'); };
    f.ctrls.append(VZ.seg([['rose', 'Hoa hồng'], ['bar', 'Cột kép']], view, (v) => { view = v; grow(); }), VZ.btn('Vẽ lại ▶', grow, 'btn sm sc'));
    grow();
  };
  APP.viz.snowMap = function (el) {
    const f = VZ.frame(el, 'Bản đồ dịch tả London 1854 của John Snow (mô phỏng)', { icon: 'eye' });
    const pumps = [[170, 130, 'Broad St'], [70, 60, 'A'], [290, 70, 'B'], [80, 210, 'C'], [280, 215, 'D']]; let showP = false, showV = false;
    let sd = 1854; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; const cases = []; for (let i = 0; i < 160; i++) { const r = Math.abs((rnd() + rnd() + rnd() - 1.5) * 70), a = rnd() * Math.PI * 2; cases.push([170 + r * Math.cos(a), 130 + r * Math.sin(a) * 0.85]); } for (let i = 0; i < 18; i++) cases.push([20 + rnd() * 300, 20 + rnd() * 220]);
    const W = 340, H = 260, svg = VZ.svg(W, H); f.stage.append(svg);
    const near = (x, y) => { let b = 0, bd = 1e9; pumps.forEach(([px, py], i) => { const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; b = i; } }); return b; };
    function draw() {
      svg.innerHTML = ''; const pc = ['rgba(239,71,111,.22)', 'rgba(79,140,255,.18)', 'rgba(6,214,160,.18)', 'rgba(255,209,102,.25)', 'rgba(155,93,229,.18)'];
      svg.append(s('rect', { x: 0, y: 0, width: W, height: H, fill: 'var(--surface)' })); if (showV) for (let x = 0; x < W; x += 10) for (let y = 0; y < H; y += 10) svg.append(s('rect', { x, y, width: 10, height: 10, fill: pc[near(x + 5, y + 5)] }));
      for (let x = 30; x < W; x += 55) svg.append(s('line', { x1: x, y1: 0, x2: x + 18, y2: H, stroke: 'var(--line)', 'stroke-width': 6 })); for (let y = 25; y < H; y += 50) svg.append(s('line', { x1: 0, y1: y, x2: W, y2: y - 10, stroke: 'var(--line)', 'stroke-width': 6 }));
      cases.forEach(([x, y]) => svg.append(s('rect', { x: x - 2.5, y: y - 2.5, width: 5, height: 5, fill: '#222', opacity: 0.8 })));
      if (showP) pumps.forEach(([x, y, n], i) => svg.append(s('circle', { cx: x, cy: y, r: 8, fill: i ? '#4f8cff' : '#ef476f', stroke: '#fff', 'stroke-width': 2, style: 'animation:popIn .4s both' }), s('text', { x: x + 11, y: y - 9, 'font-size': 11, 'font-weight': 800, fill: 'var(--ink)', text: n })));
      const cnt = pumps.map(() => 0); cases.forEach(([x, y]) => cnt[near(x, y)]++);
      f.out.innerHTML = showV ? `Đếm số ca gần mỗi máy bơm nhất: ${pumps.map((p, i) => `${p[2]}: <b>${cnt[i]}</b>`).join(', ')}. Bằng chứng rõ ràng: nguồn bệnh là máy bơm Broad Street — Snow thuyết phục chính quyền tháo tay cầm máy bơm.` : showP ? 'Các ca bệnh (ô đen) tập trung quanh máy bơm nước nào? Bật “Vùng gần nhất” để đếm.' : 'Mỗi ô đen là một ca tử vong vì dịch tả. Hồi đó người ta tin bệnh lây qua “khí độc”. Bấm “Hiện máy bơm”.';
    }
    f.ctrls.append(VZ.btn('Hiện máy bơm', () => { showP = !showP; SFX.play('pop'); draw(); }, 'btn sm sc'), VZ.btn('Vùng gần nhất', () => { showV = !showV; showP = true; SFX.play('whoosh'); draw(); }));
    draw();
  };
  APP.viz.diceSums = function (el) {
    const f = VZ.frame(el, 'Tổng hai con xúc xắc: mốt, trung vị, trung bình', { icon: 'shuffle' });
    let rolls = []; const W = 360, H = 200, svg = VZ.svg(W, H); f.stage.append(svg);
    function draw() {
      svg.innerHTML = ''; const c = Array(13).fill(0); rolls.forEach((r) => c[r]++); const n = rolls.length, mx = Math.max(6, ...c), bw = (W - 40) / 11; const Y = (v) => 170 - (v / mx) * 150;
      for (let t = 2; t <= 12; t++) { const th = n * (6 - Math.abs(7 - t)) / 36; svg.append(s('rect', { x: 30 + (t - 2) * bw + 2, y: Y(c[t]), width: bw - 4, height: 170 - Y(c[t]), rx: 3, fill: 'var(--stats)' }), s('line', { x1: 30 + (t - 2) * bw, y1: Y(th), x2: 30 + (t - 1) * bw, y2: Y(th), stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-dasharray': '4 3' }), s('text', { x: 30 + (t - 1.5) * bw, y: 186, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-2)', text: t })); }
      if (!n) { f.out.innerHTML = 'Tổng nhỏ nhất là 2, lớn nhất là 12. Đoán xem tổng nào hay xuất hiện nhất? Bấm gieo!'; return; }
      const sorted = rolls.slice().sort((a, b) => a - b); const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2; const mo = c.indexOf(Math.max(...c));
      f.out.innerHTML = `${n} lần gieo · mốt <b>${mo}</b> · trung vị <b>${N(med)}</b> · trung bình <b>${N(U.round(U.mean(rolls), 2))}</b>. Vạch đứt: số lần kì vọng (lí thuyết) — tổng 7 có 6 cách tạo ra trong 36 cách, nhiều nhất!`;
    }
    const roll = (m) => { for (let i = 0; i < m; i++) rolls.push(R(1, 6) + R(1, 6)); SFX.play(m > 1 ? 'whoosh' : 'drop'); draw(); };
    f.ctrls.append(VZ.btn('Gieo 1', () => roll(1), 'btn sm sc'), VZ.btn('Gieo 40', () => roll(40)), VZ.btn('+400', () => roll(400)), VZ.btn('Xoá', () => { rolls = []; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.heroStats = function (el) {
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#121a2c'; c.fillRect(0, 0, w, hh); const n = 9, bw = (w * 0.55) / n, x0 = w * 0.4;
      for (let i = 0; i < n; i++) { const v = (Math.sin(t * 1.3 + i * 0.7) * 0.5 + 0.6) * hh * 0.6; c.fillStyle = COLS[i % 6]; c.fillRect(x0 + i * bw + 3, hh * 0.85 - v, bw - 6, v); }
      const cx = w * 0.2, cy = hh * 0.42, r = Math.min(w, hh) * 0.2; let a0 = t * 0.4; [0.3, 0.25, 0.2, 0.15, 0.1].forEach((p, i) => { c.fillStyle = COLS[i]; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, a0 + p * Math.PI * 2); c.closePath(); c.fill(); a0 += p * Math.PI * 2; });
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(Math.min(w, hh) * 0.07)}px Lexend, sans-serif`; c.fillText('data → picture → insight', w * 0.05, hh * 0.95);
    });
  };

  /* ---------- question helpers ---------- */
  const pieQ = (items, o = {}) => { const tot = items.reduce((a, d) => a + d[1], 0); const per = 360 / tot; return fill(o.q || `${tot} people were asked. Work out the angle of each sector of a pie chart.`, items.map((d) => U.round(d[1] * per, 4)), `360° ÷ ${tot} = ${N(U.round(per, 4))}° per person. ${items.map(([l, v]) => `${l}: ${v} × ${N(U.round(per, 4))} = ${N(U.round(v * per, 4))}°`).join('; ')}.`, Object.assign({ f: twt(['', ...items.map((d) => d[0])], [['Frequency', ...items.map((d) => d[1])], ['Angle', ...items.map(() => '[]°')]]) }, o.o || {})); };
  const avgQ = (arr, o = {}) => { const s2 = arr.slice().sort((a, b) => a - b), n = arr.length; const med = n % 2 ? s2[(n - 1) / 2] : (s2[n / 2 - 1] + s2[n / 2]) / 2; const mean = U.round(U.mean(arr), 2); return fill(o.q || `Here is a set of data: ${arr.join(', ')}. Work out the median, mean (to 2 d.p. if needed) and range.`, [med, mean, s2[n - 1] - s2[0]], `In order: ${s2.join(', ')}. Median ${N(med)}; mean ${U.sum(arr)} ÷ ${n} = ${N(mean)}; range ${s2[n - 1]} − ${s2[0]} = ${s2[n - 1] - s2[0]}.`, Object.assign({ f: 'Median: [] &nbsp; Mean: [] &nbsp; Range: []' }, o.o || {})); };

  APP.addUnit({
    n: 16, strand: 'stats', title: 'Interpreting results', vi: 'Diễn giải kết quả thống kê',
    blurb: 'Why do you draw charts or diagrams when you can just look at the data? Looking at a “picture” of the data makes it easier to see what the data are showing you. Imagine you are booking a holiday to Rome: a bar chart of the average monthly temperatures shows at a glance that June to September are hotter than 20 °C. Charts like this help you plan your perfect holiday.',
    blurbVi: 'Chương này học đọc và lập bảng hai chiều, biểu đồ cột kép và cột chồng, biểu đồ tròn và biểu đồ ô vuông (waffle), infographic, cách chọn biểu đồ phù hợp, và dùng mốt, trung vị, trung bình, khoảng biến thiên để mô tả dữ liệu.',
    words: [['two-way table', 'bảng hai chiều'], ['frequency table', 'bảng tần số'], ['discrete data', 'dữ liệu rời rạc'], ['continuous data', 'dữ liệu liên tục'], ['dual bar chart', 'biểu đồ cột kép'], ['compound bar chart', 'biểu đồ cột chồng'], ['pie chart', 'biểu đồ hình quạt tròn'], ['sector', 'hình quạt'], ['proportion', 'tỉ lệ'], ['waffle diagram', 'biểu đồ ô vuông'], ['infographic', 'đồ hoạ thông tin'], ['scatter graph', 'biểu đồ phân tán'], ['line of best fit', 'đường xu hướng'], ['correlation', 'tương quan'], ['line graph', 'biểu đồ đoạn thẳng'], ['Venn diagram', 'sơ đồ Venn'], ['mode', 'mốt'], ['bimodal', 'hai mốt'], ['median', 'số trung vị'], ['mean', 'số trung bình'], ['range', 'khoảng biến thiên'], ['justify', 'giải thích, biện luận']],
    chat: ['Khi nào dùng biểu đồ cột chồng?', 'Tính góc biểu đồ tròn thế nào?', 'Khi nào nên dùng trung vị thay cho trung bình?'],
    sections: [
      {
        id: '16.1', t: 'Two-way tables', vi: 'Bảng hai chiều',
        goals: ['draw and interpret two-way tables.'],
        body: [
          ['p', 'A frequency table shows one piece of information, such as the number of text messages sent by 30 people in one day. If you want to show more than one piece of information you can use a <b>two-way table</b>. You record different information in the rows and columns so that it is easy to read.'],
          ['table', ['', 'Win', 'Draw', 'Lose', 'Total'], [['Home games', '7', '3', '2', '12'], ['Away games', '3', '4', '5', '12'], ['Total', '10', '7', '7', '24']]],
          ['ex', { t: 'Worked example 16.1', q: 'The two-way table shows the results of a hockey team’s games. a How many home games did they lose? b How many away games did they win? c How many games did they draw altogether? d What is the total number of games?', steps: ['a: where “Home games” meets “Lose”: <b>2</b>.', 'b: where “Away games” meets “Win”: <b>3</b>.', 'c: where “Total” meets “Draw”: <b>7</b>.', 'd: where “Total” meets “Total”: <b>24</b>.'] }],
          ['viz', 'twoWayTable'],
          ['vi', ['Bảng hai chiều ghi hai loại thông tin cùng lúc: hàng (vd: nam/nữ) và cột (vd: phương tiện).', 'Ô ở giao của hàng và cột cho số lượng thoả cả hai điều kiện.', 'Hàng “Total” và cột “Total” giúp tìm ô còn thiếu: tổng − các ô đã biết.', 'Tìm hàng hoặc cột chỉ còn một ô trống để bắt đầu.']],
        ],
        bank: [
          fill('The two-way table shows the hair colour of the students in Miss Jebson’s class.', [4, 6, 30, 14], 'Boys/black 4; girls/brown 6; total 30; not brown: 30 − 16 = 14.', { f: twt(['', 'Brown', 'Black', 'Other', 'Total'], [['Girls', 6, 5, 3, 14], ['Boys', 10, 4, 2, 16], ['Total', 16, 9, 5, 30]]) + 'Boys with black hair: [] &nbsp; Girls with brown hair: [] &nbsp; Students altogether: [] &nbsp; Students without brown hair: []' }),
          fill('Complete the two-way table for 42 teachers. 20 are male. 5 male and 3 female teachers cycle. 17 travel by bus. 10 female teachers travel by car.', [7, 8, 9, 22, 17, 8], 'Female total 42 − 20 = 22; female bus 22 − 10 − 3 = 9; male bus 17 − 9 = 8; male car 20 − 8 − 5 = 7; car total 17; bicycle total 8.', { f: twt(['', 'Car', 'Bus', 'Bicycle', 'Total'], [['Male', '[]', '[]', 5, 20], ['Female', 10, '[]', 3, '[]'], ['Total', '[]', 17, '[]', 42]]), d: 3 }),
          fill('A cinema: 350 adult tickets were sold; 110 were for 2 p.m. A total of 435 tickets were sold for 2 p.m. 125 child tickets were sold for 6 p.m.', [240, 325, 450, 365, 800], 'Adult 6 p.m. 350 − 110 = 240; child 2 p.m. 435 − 110 = 325; child total 450; 6 p.m. total 365; grand total 800.', { f: twt(['', '2 p.m.', '6 p.m.', 'Total'], [['Adult', 110, '[]', 350], ['Child', '[]', 125, '[]'], ['Total', 435, '[]', '[]']]), d: 3 }),
          mcq('Sofia records the number of books she reads each month. She says she will put the data in a two-way table. Zara says she can’t, because there is only one set of data. Who is right?', ['Zara — use a frequency table or bar chart (or a line graph) instead', 'Sofia', 'Both', 'Neither'], 0, 'A two-way table needs two different pieces of information.', { d: 2 }),
          fill('The table shows students’ favourite subjects. Complete it.', [5, 7, 3, 14, 15, 7], 'Girls other = 18 − 8 − 4 − 1 = 5; boys total 32 − 18 = 14; boys English 4 − 1 = 3; boys maths 14 − 3 − 3 − 1 = 7; maths total 8 + 7 = 15; science total 4 + 3 = 7.', { f: twt(['', 'Maths', 'Science', 'English', 'Other', 'Total'], [['Girls', 8, 4, 1, '[]', 18], ['Boys', '[]', 3, '[]', 1, '[]'], ['Total', '[]', '[]', 4, 6, 32]]), d: 3 }),
          gen(() => { const a = R(3, 15), b = R(3, 15), c = R(3, 15), d = R(3, 15); const rows = [['Girls', a, b, a + b], ['Boys', c, d, c + d], ['Total', a + c, b + d, a + b + c + d]]; const q = pick([['How many boys said yes?', c], ['How many girls were asked?', a + b], ['How many students said no?', b + d], ['How many students were asked altogether?', a + b + c + d]]); return num(`Students were asked if they like reading. ${q[0]}`, q[1], `Read the cell where the row and the column meet.`, { fig: twt(['', 'Yes', 'No', 'Total'], rows) }); }),
          gen(() => { const a = R(2, 12), b = R(2, 12), c = R(2, 12), d = R(2, 12); return fill('Complete the two-way table.', [b, c + d, a + c, a + b + c + d], 'Use the totals: missing cell = total − known cells.', { f: twt(['', 'Bus', 'Walk', 'Total'], [['Year 7', a, '[]', a + b], ['Year 8', c, d, '[]'], ['Total', '[]', b + d, '[]']]) }); }),
        ],
      },
      {
        id: '16.2', t: 'Dual and compound bar charts', vi: 'Biểu đồ cột kép và cột chồng',
        goals: ['draw and interpret dual bar charts', 'draw and interpret compound bar charts.'],
        body: [
          ['p', 'You use a bar chart to show one set of data. To show more than one set of data you can use a <b>dual bar chart</b>, with the sets of data presented side by side, or a <b>compound bar chart</b>, with the sets of data combined into one bar.'],
          ['viz', 'barCharts'],
          ['ex', { t: 'Worked example 16.2', q: 'Use the charts showing how many CDs and DVDs Amber, Wenkai and Karl have. a i Who has the most DVDs? ii How many more CDs than DVDs does Amber have? b i Who has the most CDs and DVDs in total? ii How many does Karl have in total?', fig: barsFig(['Amber', 'Wenkai', 'Karl'], ['CDs', 'DVDs'], [[8, 9, 2], [2, 4, 7]], { step: 2 }), steps: ['a i: <b>Karl</b> — he has the tallest DVD bar.', 'a ii: 8 − 2 = <b>6</b> more.', 'b i: <b>Wenkai</b> has the tallest combined bar.', 'b ii: Karl’s combined bar reaches <b>9</b>.'] }],
          ['tip', 'In a compound bar chart, read the amount for one section as (top of the section) − (bottom of the section). Vinegar from 16 mL to 30 mL means 30 − 16 = 14 mL.'],
          ['vi', ['Cột kép: các cột đặt cạnh nhau → so sánh từng loại giữa các nhóm.', 'Cột chồng: các phần chồng lên nhau trong một cột → thấy được tổng và từng phần.', 'Đọc một đoạn trong cột chồng: lấy giá trị đỉnh trừ giá trị đáy của đoạn.', 'Luôn có chú giải (key) cho biết màu nào là loại nào.']],
        ],
        bank: [
          fill('The dual bar chart shows CDs and DVDs.', [{ opts: ['Karl', 'Amber', 'Wenkai'], a: 0 }, 6, { opts: ['Wenkai', 'Amber', 'Karl'], a: 0 }, 9], 'Karl has the tallest DVD bar; Amber 8 − 2 = 6; Wenkai’s total is 13; Karl 2 + 7 = 9.', { f: 'Most DVDs: [] &nbsp; Amber has [] more CDs than DVDs &nbsp; Most in total: [] &nbsp; Karl’s total: []', fig: barsFig(['Amber', 'Wenkai', 'Karl'], ['CDs', 'DVDs'], [[8, 9, 2], [2, 4, 7]], { step: 2 }) }),
          fill('The compound bar chart shows holidays sold by a travel agency.', [20, 16, 12, 15], 'Week 1: 10 + 5 + 4 + 1 = 20; week 2: 5 + 1 + 8 + 2 = 16; city 4 + 8 = 12; beach 10 + 5 = 15. Read each section as top − bottom.', { f: 'Holidays in week 1: [] &nbsp; in week 2: [] &nbsp; City holidays altogether: [] &nbsp; Beach holidays altogether: []', fig: barsFig(['week 1', 'week 2'], ['beach', 'sport', 'city', 'safari'], [[10, 5], [5, 1], [4, 8], [1, 2]], { compound: true, step: 5 }) }),
          mcq('The café sold chocolate cakes (Sat 18, Sun 9) and vanilla cakes (Sat 7, Sun 14). Which chart makes it easiest to compare the TOTAL cakes sold each day?', ['compound bar chart', 'dual bar chart', 'pie chart', 'scatter graph'], 0, 'A compound bar shows each day’s total as one bar: 25 and 23.'),
          mcq('Which chart makes it easiest to compare chocolate with vanilla on each day?', ['dual bar chart', 'compound bar chart', 'line graph', 'Venn diagram'], 0, 'Bars side by side are easy to compare.'),
          num('A compound bar for 50 mL of salad dressing: oil from 0 to 16 mL, vinegar from 16 to 30 mL. How much vinegar is there?', 14, '30 − 16 = 14 mL (Sofia’s method: 7 sections × 2 mL also works).', { unit: 'mL' }),
          fill('Using the café data (chocolate: Sat 18, Sun 9; vanilla: Sat 7, Sun 14):', [25, 23, 9], 'Sat 18 + 7 = 25; Sun 9 + 14 = 23; 18 − 9 = 9.', { f: 'Cakes on Saturday: [] &nbsp; Cakes on Sunday: [] &nbsp; How many more chocolate cakes on Saturday than Sunday: []', fig: barsFig(['Saturday', 'Sunday'], ['chocolate', 'vanilla'], [[18, 9], [7, 14]], { step: 5 }) }),
          gen(() => { const G = ['Ahu', 'Beth', 'Cho', 'Duyen']; const won = G.map(() => R(1, 9)), lost = G.map(() => R(0, 6)); const i = R(0, 3), j = (i + R(1, 3)) % 4; return fill('The dual bar chart shows matches won and lost at a tennis tournament.', [won[i], lost[j], won[i] + lost[i]], `${G[i]} won ${won[i]}; ${G[j]} lost ${lost[j]}; ${G[i]} played ${won[i]} + ${lost[i]} = ${won[i] + lost[i]}.`, { f: `${G[i]} won [] matches &nbsp; ${G[j]} lost [] matches &nbsp; ${G[i]} played [] matches`, fig: barsFig(G, ['won', 'lost'], [won, lost], { step: 2 }) }); }),
          gen(() => { const a = R(2, 9), b = R(2, 9), c = R(2, 9); return num('A compound bar shows the hours of training in one week: swim, cycle and run. How many hours of training are there in total?', a + b + c, `${a} + ${b} + ${c} = ${a + b + c}.`, { unit: 'hours', fig: barsFig(['Luiz'], ['swim', 'cycle', 'run'], [[a], [b], [c]], { compound: true, step: 2 }) }); }),
        ],
      },
      {
        id: '16.3', t: 'Pie charts and waffle diagrams', vi: 'Biểu đồ tròn và biểu đồ ô vuông',
        goals: ['draw and interpret pie charts and waffle diagrams.'],
        body: [
          ['p', 'You use a <b>pie chart</b> to show how an amount is divided or shared. It shows <b>proportions</b>, not actual amounts. A pie chart is a circle divided into <b>sectors</b>; the angles at the centre add up to 360°. Label each sector and draw the angles accurately. A <b>waffle diagram</b> uses a grid of 100 squares, so each square is 1%.'],
          ['viz', 'pieMaker'],
          ['ex', { t: 'Worked example 16.3', q: 'a Ninety people were asked what type of holiday they had: activity 32, beach 27, city break 24, other 7. i Work out the angles. ii What percentage went on a beach holiday? b A pie chart of destinations has Spain 30°, USA 133°, Greece 72°, Thailand 45° and other countries. i What fraction went to Spain? ii What percentage went to Greece? iii How many went to other countries?', fig: pieFig([['activity', 32], ['beach', 27], ['city break', 24], ['other', 7]], { deg: ['128°', '108°', '96°', '28°'] }), steps: ['a i: 360° ÷ 90 = 4° per person: activity 128°, beach 108°, city 96°, other 28° (total 360° ✔).', 'a ii: 27/90 × 100 = <b>30%</b>.', 'b i: 30/360 = <b>1/12</b>. ii: 72/360 = 1/5 = <b>20%</b>.', 'b iii: 360 − (30 + 133 + 72 + 45) = 80°; 80/360 × 90 = <b>20 people</b>.'] }],
          ['vi', ['Biểu đồ tròn biểu diễn tỉ lệ các phần so với tổng thể.', 'Góc mỗi đơn vị = 360° ÷ tổng tần số; góc một phần = tần số × góc mỗi đơn vị.', 'Từ góc tìm số lượng: (góc ÷ 360°) × tổng.', 'Biểu đồ waffle: 100 ô, mỗi ô 1%; đổi % sang góc: % × 3,6°.']],
        ],
        bank: [
          pieQ([['Ford', 12], ['Vauxhall', 18], ['Toyota', 10], ['Nissan', 20]], { q: 'The table shows the makes of 60 cars in a car park. Work out the angle of each sector.' }),
          pieQ([['soul', 5], ['classical', 20], ['pop', 8], ['other', 7]], { q: '40 people were asked which type of music they prefer. Work out the angles for a pie chart.' }),
          pieQ([['car', 15], ['bus', 22], ['train', 5], ['bicycle', 18]], { q: '60 people were asked which transport they prefer. Work out the angles for a pie chart.' }),
          fill('A pie chart of destinations: Spain 30°, USA 133°, Greece 72°, Thailand 45°, other countries for the rest. 90 people were asked.', [{ opts: ['1/12', '1/10', '1/3', '1/30'], a: 0 }, 20, 20], 'Spain 30/360 = 1/12; Greece 72/360 = 20%; other 80°/360° × 90 = 20 people.', { f: 'Fraction that went to Spain: [] &nbsp; Percentage that went to Greece: []% &nbsp; People who went to other countries: []', d: 2 }),
          fill('Alexi’s pie chart: action has frequency 2 and 40°. Romantic has frequency 7. Science fiction has 100°. Comedy is the rest.', [140, 5, 80, 4, 18], '40° ÷ 2 = 20° per person. Romantic 7 × 20 = 140°; sci-fi 100 ÷ 20 = 5 people; comedy 360 − 280 = 80° → 4 people; total 18 people.', { f: 'Romantic: []° &nbsp; Science fiction frequency: [] &nbsp; Comedy: []° and [] people &nbsp; People asked: []', d: 3 }),
          fill('A café sold 150 hot drinks: 45 tea, 75 coffee and 30 hot chocolate.', [30, 108, 50, 180, 20, 72], 'Tea 45/150 = 30% → 108°; coffee 50% → 180°; hot chocolate 20% → 72°.', { f: twt(['', 'Number', '%', 'Angle'], [['tea', 45, '[]%', '[]°'], ['coffee', 75, '[]%', '[]°'], ['hot chocolate', 30, '[]%', '[]°']]) }),
          mcq('Sofia says: “Instead of working out the percentage then the degrees, I work out the degrees straight away: 45/150 × 360° = 108°.” Is her method correct?', ['Yes — it gives the same answer in one step', 'No — you must find the percentage first', 'No — it gives 30°', 'Only for 100 people'], 0, '45/150 × 360 = 0.3 × 360 = 108°.'),
          num('180 students chose Maths, shown by a 120° sector. The “other” sector is 70°. How many students chose “other”?', 105, '180 ÷ 120 = 1.5 students per degree; 70 × 1.5 = 105.', { d: 3 }),
          mcq('A pie chart shows how Preety’s emails were spread over a week. Can you tell how many emails she received on Friday?', ['No — a pie chart shows proportions, not actual amounts (unless you know the total)', 'Yes, always', 'Yes, by measuring the radius', 'Only if the sector is the biggest'], 0, 'You need the total to find the actual number.'),
          num('In a waffle diagram of 100 squares, 23 squares are red. What angle would red have on a pie chart?', 82.8, '23% of 360° = 0.23 × 360 = 82.8°.', { unit: '°', d: 2 }),
          gen(() => { const per = pick([2, 3, 4, 5, 6, 8, 9, 10, 12]); const tot = 360 / per; let a = R(1, tot / 2), b = R(1, tot - a - 2), c = tot - a - b; if (c < 1) return null; return pieQ([['A', a], ['B', b], ['C', c]], { q: `${tot} people chose A, B or C. Work out the angle of each sector of a pie chart.` }); }),
          gen(() => { const tot = pick([30, 36, 40, 45, 60, 72, 90, 120]); const ang = pick([30, 45, 60, 72, 90, 120, 150, 180].filter((g) => (g * tot) % 360 === 0)); return num(`A pie chart represents ${tot} people. One sector has an angle of ${ang}°. How many people does it represent?`, (ang / 360) * tot, `${ang}/360 × ${tot} = ${N((ang / 360) * tot)}.`); }),
          gen(() => { const ang = pick([36, 54, 72, 90, 108, 126, 144, 180, 198]); return num(`A sector of a pie chart has an angle of ${ang}°. What percentage of the data is it?`, (ang / 360) * 100, `${ang} ÷ 360 × 100 = ${N((ang / 360) * 100)}%.`, { unit: '%' }); }),
        ],
      },
      {
        id: '16.4', t: 'Infographics', vi: 'Đồ hoạ thông tin',
        goals: ['draw and interpret infographics.'],
        body: [
          ['p', 'The word <b>infographic</b> is short for “information graphic”. An infographic is a visual representation of information or data that shows information quickly and clearly. For example, an infographic can clearly show that over half (54%) of women in a village go for a walk every day, whereas less than half (45%) of men do.'],
          ['viz', 'infoVillage'],
          ['ex', { t: 'Worked example 16.4', q: 'The infographic shows the adults in a village: 58% women, 42% men; ages 18–34: 31%, 35–44: 20%, 45–54: 23%, 55+: 26%. a What percentage are women? b What percentage are 55 or older? c Which age group has the highest percentage? d There are 650 adults. How many are 35–44?', steps: ['a: <b>58%</b>. b: <b>26%</b>. c: <b>18–34</b> (31%).', 'd: 10% of 650 = 65, so 20% = 2 × 65 = <b>130 adults</b>.'] }],
          ['tip', 'Be a critical reader! In a good infographic the sizes of pictures match the numbers. If speech bubbles or icons are sized wrongly, the infographic can mislead you.'],
          ['vi', ['Infographic kết hợp hình ảnh, biểu tượng, số liệu để truyền đạt nhanh.', 'Đọc kĩ phần trăm và tổng để tính số lượng thật.', 'Kiểm tra: kích thước hình có tương ứng với số liệu không?', 'Infographic tốt: rõ ràng, chính xác, không gây hiểu lầm.']],
        ],
        bank: [
          fill('Bananas produced each year: India 11 million tonnes, China 4.8 million, Brazil 6.3 million, Ecuador 5 million.', [{ opts: ['India', 'China', 'Brazil', 'Ecuador'], a: 0 }, 4.8, 4.7], 'India produces the most; China 4.8; 11 − 6.3 = 4.7.', { f: 'Most bananas: [] &nbsp; China: [] million tonnes &nbsp; India produces [] million tonnes more than Brazil' }),
          fill('The number of people killed by animals in one year (from an infographic): shark 10, wolf 10, lion 120, elephant 150, hippopotamus 450, crocodile 950.', [120, 140, { opts: ['crocodile', 'hippopotamus', 'lion', 'shark'], a: 0 }], 'Lion 120; 150 − 10 = 140; crocodile.', { f: 'Killed by a lion: [] &nbsp; How many more by an elephant than by a wolf: [] &nbsp; Most deadly of these: []' }),
          mcq('A train station infographic shows: early 15%, on time 35%, late 45%, cancelled 5%. The manager says: “Over half of our trains arrive on time.” Is the manager correct?', ['No — only 35% arrive on time', 'Yes — 50% arrive on time', 'Yes — 15% + 35% = 50%', 'No — 45% arrive on time'], 0, '35% is less than half.'),
          fill('An infographic about online questions: relationships 33%, health 29%, mass (weight) 19%, stress 15%, other 4%.', [29, { opts: ['relationships', 'health', 'stress', 'mass'], a: 0 }, 100], 'Health 29%; relationships is the largest; 33 + 29 + 19 + 15 + 4 = 100.', { f: 'Health: []% &nbsp; Most asked about: [] &nbsp; Total of all the percentages: []%' }),
          mcq('In an infographic the speech bubble for 33% is drawn much larger than the bubble for 4%. Why is this a good idea?', ['The size shows the size of the percentage at a glance', 'It makes the infographic colourful only', 'It is not a good idea in any case', 'Large bubbles are easier to draw'], 0, 'Picture size should match the data — but it must be accurate!'),
          num('In a village of 650 adults, 26% are 55 or older. How many adults is that?', 169, '10% = 65, 20% = 130, 1% = 6.5, 6% = 39 → 130 + 39 = 169.', { d: 2 }),
          gen(() => { const tot = pick([200, 400, 500, 650, 800, 1200]), p = pick([12, 15, 20, 25, 30, 35, 40, 45]); return num(`An infographic says ${p}% of the ${tot} people in a town cycle to work. How many people is that?`, (tot * p) / 100, `${p}% of ${tot} = ${tot} ÷ 100 × ${p} = ${N((tot * p) / 100)}.`, { app: true }); }, { app: true }),
        ],
      },
      {
        id: '16.5', t: 'Representing data', vi: 'Biểu diễn dữ liệu',
        goals: ['choose how to represent data.'],
        body: [
          ['p', 'When you represent data using a diagram, graph or chart, you must decide which type is best to use — and <b>justify</b> your choice.'],
          ['table', ['Chart', 'When to use it'], [['Venn or Carroll diagram', 'to sort data or objects into groups with common features'], ['bar chart', 'to compare discrete data'], ['dual bar chart', 'to compare two sets of discrete data'], ['compound bar chart', 'to see individual amounts and total amounts'], ['frequency diagram', 'to compare continuous data'], ['line graph', 'to see how data changes over time'], ['scatter graph', 'to compare two sets of data points (is there a connection?)'], ['pie chart', 'to compare each sector with the whole amount'], ['infographic', 'to show information quickly in a way that is easy to understand']]],
          ['viz', 'chartGallery'],
          ['ex', { t: 'Worked example 16.5', q: 'Which chart is best for: a the depth of snow at a ski resort every week b the maths and science test scores of 20 students c gold, silver and bronze medals won by two countries?', steps: ['a: <b>line graph</b> — see how the depth changes over time.', 'b: <b>scatter graph</b> — plot maths against science and look for a connection (correlation).', 'c: <b>dual bar chart</b> — bars side by side are easy to compare.'] }],
          ['viz', 'scatterFit'],
          ['viz', 'vennSports'],
          ['vi', ['Thay đổi theo thời gian → biểu đồ đoạn thẳng (line graph).', 'Mối liên hệ giữa hai đại lượng → biểu đồ phân tán (scatter graph) + đường xu hướng.', 'Tỉ lệ so với tổng thể → biểu đồ tròn.', 'Dữ liệu liên tục chia khoảng → biểu đồ tần số (cột sát nhau).', 'Phân loại → sơ đồ Venn / Carroll.']],
        ],
        bank: [
          sort('Which chart is best for each set of data?', ['line graph', 'scatter graph', 'pie chart', 'dual bar chart'], [['the depth of snow at the end of every week', 0], ['height and shoe size of 20 students', 1], ['the proportion of students that travel by car, bus, bicycle or on foot', 2], ['gold, silver and bronze medals won by two countries', 3], ['the air in a scuba tank during a dive', 0], ['time to run 100 m and spelling test score', 1]], 'Think about what you want to see: change over time, a connection, a proportion or a comparison.'),
          mcq('Which chart is best to show the sales of DVDs each month for a year?', ['line graph', 'pie chart', 'Venn diagram', 'scatter graph'], 0, 'You want to see how sales change over time.'),
          mcq('Which chart is best to show the heights of 100 trees in a forest?', ['frequency diagram', 'Venn diagram', 'line graph', 'pie chart'], 0, 'Height is continuous data, grouped into intervals.'),
          mcq('Which chart is best to show the proportion of different flavour ice creams sold in a shop one day?', ['pie chart', 'scatter graph', 'line graph', 'frequency diagram'], 0, 'Each flavour compared with the whole.'),
          fill('Ten students play football (Aaron, Chloe, Eralia, Irine, Jengo), hockey (Brad, Chloe, Eralia, Fayard, Harper) and cricket (Chloe, Guang, Harper, Jengo).', [{ opts: ['Chloe', 'Eralia', 'Harper', 'Jengo'], a: 0 }, { opts: ['Dian', 'Guang', 'Brad', 'Irine'], a: 0 }, 2], 'Chloe is in all three lists; Dian is in none; Eralia plays football and hockey, Jengo football and cricket… Football only: Aaron and Irine.', { f: 'Plays all three sports: [] &nbsp; Plays none: [] &nbsp; Number who play only football: []', d: 2 }),
          mcq('A scuba tank: air 15, 14, 12, 8, 7, 4 litres at 0, 10, 20, 30, 40, 50 minutes. Which comment is correct?', ['The amount of air decreases during the dive', 'The air increases', 'The air stays the same', 'There is no connection with time'], 0, 'A line graph would slope downwards.'),
          num('Use the hedgehog data (line of best fit ≈ length = 10 + 0.025 × mass) to estimate the length of a hedgehog with a mass of 725 g.', 28, 'Reading across from 725 g to the line and down gives about 28 cm.', { unit: 'cm', tol: 1.5, d: 2 }),
          mcq('The scatter graph of hedgehog length and mass shows that…', ['longer hedgehogs tend to be heavier (positive correlation)', 'longer hedgehogs tend to be lighter', 'there is no connection', 'all hedgehogs have the same mass'], 0, 'The points go up from left to right.'),
          mcq('Eight people ran 100 m and did a spelling test. The scatter graph shows no clear pattern. What can you say?', ['There is no correlation between running time and spelling score', 'Faster runners spell better', 'Slower runners spell better', 'The data is wrong'], 0, 'Running speed and spelling are not connected.'),
          mcq('To compare TOTAL amounts it is best to use a …; to compare INDIVIDUAL amounts it is best to use a … .', ['compound bar chart; dual bar chart', 'dual bar chart; compound bar chart', 'pie chart; line graph', 'scatter graph; Venn diagram'], 0, 'Stacked bars show totals; side-by-side bars compare parts.'),
        ],
      },
      {
        id: '16.6', t: 'Using statistics', vi: 'Sử dụng các số đặc trưng',
        goals: ['use mode, median, mean and range to describe sets of data.'],
        body: [
          ['p', 'The <b>mode</b> is the most common value (two modes: <b>bimodal</b>). The <b>median</b> is the middle value when the values are in order. The <b>mean</b> is the sum of all the values divided by the number of values. The <b>range</b> is the largest value minus the smallest value. In a real situation you must decide which measure to use.'],
          ['list', ['To measure how spread out the data is, use the <b>range</b>.', 'Choose the <b>mode</b> when you want the most common value.', 'The <b>median</b> has half the values above it and half below — it is not affected by a few very large or small values.', 'The <b>mean</b> depends on every value: change one number and the mean changes.']],
          ['viz', 'averagesLab'],
          ['ex', { t: 'Worked example 16.6', q: 'Ages of a football team: 16, 17, 18, 18, 19, 20, 20, 21, 21, 32, 41. a Work out the mode, median and mean. b Which average best represents the data? c Work out the range. d Another team has a range of 14 years. Which team has more variation?', steps: ['a: modes 18, 20 and 21; median 20; mean 243 ÷ 11 = 22.1.', 'b: the <b>median</b> — there are three modes, and the mean is pulled up by the two older players (only two players are older than the mean).', 'c: 41 − 16 = <b>25 years</b>.', 'd: 25 > 14, so the <b>first team</b> has more variation.'] }],
          ['vi', ['Mốt: giá trị xuất hiện nhiều nhất (có thể có nhiều mốt).', 'Trung vị: giá trị ở giữa khi sắp xếp; với n giá trị, vị trí (n + 1) ÷ 2.', 'Trung bình: tổng ÷ số giá trị; bị ảnh hưởng mạnh bởi giá trị ngoại lai.', 'Khoảng biến thiên: lớn nhất − nhỏ nhất; càng lớn → dữ liệu càng phân tán.', 'Bảng tần số: mốt là giá trị có tần số lớn nhất (không phải chính tần số!).']],
        ],
        bank: [
          fill('Zaralia’s waiting times (minutes) for 20 days: 2, 5, 3, 8, 5, 2, 10, 7, 8, 8, 4, 7, 2, 2, 3, 6, 10, 3, 4, 7.', [2, 5, 5.3, 8], 'In order: 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 7, 7, 8, 8, 8, 10, 10. Mode 2; median (5 + 5) ÷ 2 = 5; mean 106 ÷ 20 = 5.3; range 10 − 2 = 8.', { f: 'Mode: [] &nbsp; Median: [] &nbsp; Mean: [] &nbsp; Range: []', d: 2 }),
          mcq('In June, Zaralia’s range of waiting times is 3 minutes (May: 8 minutes). In which month is there more variation?', ['May', 'June', 'They are the same'], 0, 'The larger range shows more variation.', { fixed: true }),
          fill('Days of rain in the first week of May over 35 years: 0 days 13 times, 1 day 7, 2 days 5, 3 days 2, 4 days 0, 5 days 3, 6 days 2, 7 days 3.', [0, 1, 2.03], 'Mode 0 (frequency 13). Median: the 18th value is 1. Mean: (0 + 7 + 10 + 6 + 0 + 15 + 12 + 21) ÷ 35 = 71 ÷ 35 ≈ 2.03.', { f: 'Mode: [] &nbsp; Median: [] &nbsp; Mean (2 d.p.): []', d: 3 }),
          mcq('Men’s belts sold: 80 cm (6), 85 (16), 90 (28), 95 (41), 100 (17), 105 (18), 110 (10), 115 (13). Which size should the store always keep in stock?', ['95 cm — the mode, the most popular size', '97.5 cm — the mean', '100 cm — the middle size', '115 cm — the largest'], 0, 'The mode tells you the most common size sold.', { d: 2, app: true }),
          mcq('In a table of people per car, the largest frequency is 28 (for 1 person). Arun says the modal number of people per car is 28. What is his mistake?', ['The mode is the VALUE with the largest frequency — 1 person — not the frequency itself', 'The mode should be the mean', 'The mode is 60', 'There is no mistake'], 0, 'Mode = the value that occurs most often.'),
          fill('120 students took a 10-question test. Scores 4, 5, 6, 7, 8, 9, 10 had frequencies 3, 5, 12, 13, 17, 30, 40.', [9, 10, 8.38], 'Median: the 60th and 61st scores are both 9. Mode 10. Mean 1006 ÷ 120 ≈ 8.38.', { f: 'Median: [] &nbsp; Mode: [] &nbsp; Mean (2 d.p.): []', d: 3 }),
          num('Same test data: how many students scored more than the mean (8.38)?', 70, 'Scores of 9 or 10: 30 + 40 = 70.', { d: 3 }),
          fill('You roll two dice and add the scores.', [2, 12, 7], 'Smallest 1 + 1 = 2; largest 6 + 6 = 12; 7 can be made in 6 ways.', { f: 'Smallest score: [] &nbsp; Largest score: [] &nbsp; Most likely score: []' }),
          mcq('The pocket money of ten friends is $5, $6, $6, $7, $8, $8, $8, $9, $10 and $60. Which average best represents the data?', ['the median ($8) — the mean ($12.70) is pulled up by $60', 'the mean ($12.70)', 'the range ($55)', 'the largest value'], 0, 'One very large value (an outlier) affects the mean.', { d: 2 }),
          avgQ([16, 17, 18, 18, 19, 20, 20, 21, 21, 32, 41], { q: 'Ages of a football team: 16, 17, 18, 18, 19, 20, 20, 21, 21, 32, 41. Work out the median, the mean (1 d.p. is fine — give 2 d.p.) and the range.' }),
          gen(() => { const n = pick([5, 6, 7, 8, 9]); const arr = Array.from({ length: n }, () => R(1, 20)); return avgQ(arr); }),
          gen(() => { const base = R(3, 9); const arr = Array.from({ length: R(6, 10) }, () => base + R(-2, 3)); const cnt = {}; arr.forEach((v) => (cnt[v] = (cnt[v] || 0) + 1)); const mx = Math.max(...Object.values(cnt)); const modes = Object.keys(cnt).filter((k) => cnt[k] === mx); if (modes.length > 1) return null; return num(`Find the mode of: ${arr.join(', ')}.`, +modes[0], `${modes[0]} appears ${mx} times.`); }),
          gen(() => { const r1 = R(5, 30), r2 = R(5, 30); if (r1 === r2) return null; return mcq(`Class A’s test scores have a range of ${r1}. Class B’s have a range of ${r2}. Which class has less variation in scores?`, ['Class A', 'Class B'], r1 < r2 ? 0 : 1, 'The smaller range shows less variation.', { fixed: true }); }),
        ],
      },
    ],
    explore: {
      title: 'Data that changed the world', hero: 'heroStats',
      lead: 'A good chart can save lives, win arguments and reveal the truth. A bad one can fool millions of people. Learn to read data like a detective.',
      leadVi: 'Một biểu đồ tốt có thể cứu sống con người và làm sáng tỏ sự thật; một biểu đồ tồi có thể đánh lừa hàng triệu người. Hãy đọc dữ liệu như một thám tử!',
      cards: [
        { t: 'The map that stopped cholera', p: 'In 1854, a terrible cholera outbreak hit Soho in London. Doctor John Snow marked every death on a street map and saw that the deaths were clustered around one water pump on Broad Street. When the pump handle was removed, the outbreak soon ended.', viz: 'snowMap' },
        { t: 'Florence Nightingale’s rose', p: 'During the Crimean War, nurse Florence Nightingale collected data showing that most soldiers died from diseases caused by dirty hospitals, not from battle wounds. Her “rose” diagram made the message impossible to ignore. (The numbers here are only illustrative.)', viz: 'nightingaleRose' },
        { t: 'Spot the misleading graph', p: 'Advertisers sometimes start the vertical axis above zero or scale pictures in two directions so that small differences look huge. Always check the axes!', viz: 'misleadingGraph' },
        { t: 'Experiment: two dice', p: 'Roll two dice 40 times and record the totals. Which average describes your results best? Roll 400 times and watch the shape become a perfect triangle.', viz: 'diceSums' },
      ],
      facts: [['1854', 'John Snow', 'Mapped cholera deaths in London.'], ['1858', 'Nightingale', 'Elected to the Royal Statistical Society.'], ['1786', 'William Playfair', 'Invented the bar chart and line graph.'], ['360°', 'pie chart', 'All the sector angles add up to 360°.']],
      challenge: { t: 'Make the mean, median and mode different', p: 'Write a set of five whole numbers where the mode is 3, the median is 4 and the mean is 5.', a: 'One answer: 3, 3, 4, 7, 8. Mode 3; median 4; sum 25 ÷ 5 = 5. (Other answers are possible: the two largest numbers must add up to 15 and both be more than 4.)' },
    },
    reading: {
      title: 'The Lady with the Lamp — and the Chart', sub: 'Florence Nightingale, nurse and statistician. Tap any word to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'Florence Nightingale was born in 1820 into a rich British family. At that time, women from rich families were not expected to have careers, but Florence loved mathematics and wanted to help people. Against her parents’ wishes, she trained as a nurse.',
        'In 1854 she travelled with a team of nurses to a British army hospital in Scutari, in what is now Turkey, during the Crimean War. The hospital was dirty and crowded, and there was not enough clean water or fresh air. Florence walked around the wards at night with a lamp, which is why soldiers called her “the Lady with the Lamp”.',
        'Florence did not only care for the soldiers; she also counted. She kept careful records of how many soldiers died each month and why. Her data showed something shocking: many more soldiers were dying from diseases such as cholera and typhus, caused by dirty conditions, than from wounds received in battle.',
        'Florence knew that politicians would not read long tables of numbers, so she drew a new kind of diagram. It looked like a flower, with one coloured section for each month. The area of each section showed the number of deaths. The large blue areas for disease made the problem clear at a glance, and the government agreed to improve hospitals.',
        'In 1858 Florence became the first woman to be elected a member of the Royal Statistical Society. She showed that statistics are not just numbers — they can be a powerful way to change the world.',
      ],
      gloss: [['career', 'sự nghiệp'], ['ward', 'phòng bệnh'], ['record', 'hồ sơ, ghi chép'], ['wound', 'vết thương'], ['politician', 'chính trị gia'], ['elect', 'bầu chọn']],
      parts: [
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why did soldiers call her “the Lady with the Lamp”?', opts: ['She walked around the wards at night with a lamp', 'She sold lamps', 'She invented a lamp', 'Her house was full of lamps'], a: 0, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'What did her data show?', opts: ['More soldiers died from disease than from battle wounds', 'More soldiers died from wounds', 'Nobody died in the hospital', 'The hospital was very clean'], a: 0, ex: 'Paragraph C.' },
          { type: 'mcq', q: 'Why did she draw a diagram instead of using tables?', opts: ['Politicians would not read long tables of numbers', 'She did not like numbers', 'Tables were not invented yet', 'Diagrams are cheaper'], a: 0, ex: 'Paragraph D.' },
          { type: 'mcq', q: 'In her diagram, what showed the number of deaths?', opts: ['the area of each section', 'the colour of the lamp', 'the length of the title', 'the number of flowers'], a: 0, ex: 'Paragraph D.' },
        ] },
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'Florence’s parents wanted her to become a nurse.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: '“Against her parents’ wishes”.' },
          { type: 'mcq', q: 'The hospital in Scutari did not have enough clean water.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph B.' },
          { type: 'mcq', q: 'Florence spoke five languages.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'Not mentioned.' },
        ] },
        { title: 'Timeline', qs: [
          { type: 'order', q: 'Put these events in order.', a: ['Florence is born', 'She travels to Scutari', 'She draws her diagram of deaths', 'She joins the Royal Statistical Society'], ex: '1820 → 1854 → (after collecting data) → 1858.' },
          { type: 'fill', q: 'Complete.', f: 'Florence was born in []. She went to Scutari in [] and joined the Royal Statistical Society in [].', a: [1820, 1854, 1858], ex: 'Paragraphs A, B and E.' },
        ] },
      ],
    },
    listening: {
      title: 'Which average should we use?', intro: 'Leo and Asha look at a pocket-money survey. Listen and answer.',
      voices: { Leo: 'rounded', Asha: 'airy' },
      lines: [
        { spk: 'Leo', text: 'Asha, I asked ten friends how much pocket money they get each week. Here are the amounts: five, six, six, seven, eight, eight, eight, nine, ten and sixty dollars.' },
        { spk: 'Asha', text: 'Sixty dollars? Wow! That must be Max. Let’s work out the mean. The total is one hundred and twenty-seven dollars, so the mean is twelve dollars and seventy cents.' },
        { spk: 'Leo', text: 'But nine out of ten people get less than that. The mean doesn’t represent the group very well.' },
        { spk: 'Asha', text: 'Right. The sixty dollars is an outlier. The median is better. The middle two values are both eight, so the median is eight dollars.' },
        { spk: 'Leo', text: 'And the mode is also eight dollars, because three people get that amount.' },
        { spk: 'Asha', text: 'The range is sixty minus five, which is fifty-five dollars. That shows the data is very spread out.' },
        { spk: 'Leo', text: 'So in our report we will say that a typical student gets about eight dollars a week.' },
      ],
      parts: [
        { title: 'Complete the notes', qs: [
          { type: 'fill', q: 'Complete.', f: 'Number of friends asked: []. Total: $[]. Mean: $[]. Median: $[]. Range: $[].', a: [10, 127, 12.7, 8, 55], ex: '127 ÷ 10 = 12.7; 60 − 5 = 55.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why doesn’t the mean represent the group well?', opts: ['One very large value pulls it up', 'It is too small', 'There are two modes', 'They made a mistake adding'], a: 0, ex: 'The $60 is an outlier.' },
          { type: 'mcq', q: 'Why is the mode $8?', opts: ['Three people get $8', '$8 is in the middle', '$8 is the mean', 'Nobody gets $8'], a: 0, ex: 'Leo explains.' },
          { type: 'mcq', q: 'What will they write in their report?', opts: ['A typical student gets about $8 a week', 'A typical student gets $12.70', 'A typical student gets $60', 'Everyone gets the same'], a: 0, ex: 'Last line.' },
        ] },
      ],
    },
  });
})();
