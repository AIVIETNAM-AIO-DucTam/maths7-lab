/* Unit 6 — Collecting data */
(function () {
  const { h, s, U, Q, VZ, FIG, SFX } = APP; const { R, pick, shuffle, N } = U;
  const { mcq, multi, tf, num, fill, order, match, sort, txt, gen } = Q;
  const BOOK_DICE = '10 7 5 2 10 5 10 9 10 4 7 4 3 7 6 8 7 8 11 9 6 4 10 9 8 6 6 11 8 10 7 7 4 4 5 7 7 7 11 9 9 10 9 9 7 3 8 4 5 10 5 10 8 5 5 6 8 9 3 5 9 5 7 6 8 9 10 7 7 6 9 8 8 3 3 2 4 6 10 9 8 10 5 7 7 9 10 7 10 4 4 2 10 5 4 4 8 9 5 7'.split(' ').map(Number);

  /* ---------- widgets ---------- */
  APP.viz.dataTypes = function (el) {
    const f = VZ.frame(el, 'Phân loại dữ liệu: rời rạc, liên tục hay định tính?', { icon: 'grid' });
    const items = shuffle([['number of brothers', 0], ['mass of a baby', 1], ['favourite sport', 2], ['shoe size', 0], ['height', 1], ['colour of a car', 2], ['number of pages in a book', 0], ['time to run 50 m', 1], ['type of pet', 2], ['number of goals scored', 0], ['temperature at noon', 1], ['country of birth', 2]]);
    const names = ['Discrete (rời rạc)', 'Continuous (liên tục)', 'Categorical (định tính)']; const tips = ['đếm được: 0, 1, 2, …', 'đo được: có thể nhận mọi giá trị', 'là chữ/nhóm, không phải số'];
    let k = 0, score = 0; const card = h('div', { style: { textAlign: 'center', padding: '14px', minHeight: '64px' } }); const bins = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px' } }); f.stage.append(card, bins);
    const boxes = names.map((nm, i) => { const b = h('button', { type: 'button', class: 'btn', style: { flexDirection: 'column', minHeight: '82px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' } }, h('b', {}, nm), h('small', { class: 'muted' }, tips[i]), h('span', { class: 'mono', style: { fontSize: '.8rem' } }, '')); b.onclick = () => pickBin(i); bins.append(b); return b; });
    function show() { if (k >= items.length) { card.innerHTML = `<div style="font-size:1.4rem;font-weight:800">🎉 ${score}/${items.length} đúng!</div>`; f.out.textContent = 'Bấm “Chơi lại” để thử lại với thứ tự mới.'; return; } card.innerHTML = `<div class="muted" style="font-size:.85rem">${k + 1}/${items.length}</div><div data-tr style="font-family:var(--f-display);font-size:1.5rem;font-weight:800;animation:popIn .35s both">${items[k][0]}</div>`; }
    function pickBin(i) { if (k >= items.length) return; const ok = items[k][1] === i; if (ok) { score++; SFX.play('correct'); } else SFX.play('wrong'); boxes[i].animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 250 }); const sp = boxes[items[k][1]].lastChild; sp.textContent = (+sp.textContent || 0) + 1; f.out.innerHTML = ok ? `✓ <b>${items[k][0]}</b> là dữ liệu ${names[i].split(' ')[0].toLowerCase()}.` : `✗ <b>${items[k][0]}</b> là dữ liệu <b>${names[items[k][1]]}</b>.`; k++; show(); }
    f.ctrls.append(VZ.btn('Chơi lại', () => { shuffle(items); items.sort(() => Math.random() - 0.5); k = 0; score = 0; boxes.forEach((b) => (b.lastChild.textContent = '')); show(); f.out.textContent = ''; }, 'btn sm ghost'));
    show();
  };
  APP.viz.diceTotals = function (el) {
    const f = VZ.frame(el, 'Tung 2 xúc xắc: tổng nào hay xuất hiện nhất?', { icon: 'chart' });
    let counts = Array(13).fill(0), n = 0; const st = h('div'); f.stage.append(st);
    function draw() { const data = []; for (let t = 2; t <= 12; t++) data.push([t, counts[t]]); st.innerHTML = FIG.bar(data, { w: 560, h: 260, xlab: 'Total', ylab: 'Frequency', values: true, color: 'var(--stats)' }); const mx = Math.max(...counts); f.out.innerHTML = `Số lần tung: <b>${n}</b> · Mốt (mode): <b>${n ? counts.map((c, i) => (c === mx ? i : null)).filter((x) => x != null).join(', ') : '—'}</b> · Sofia dự đoán 7 hay gặp nhất; Zara dự đoán mọi tổng như nhau.`; }
    function roll(k) { for (let i = 0; i < k; i++) { counts[R(1, 6) + R(1, 6)]++; n++; } SFX.play('pop'); draw(); }
    f.ctrls.append(VZ.btn('Dữ liệu sách (100 lần)', () => { counts = Array(13).fill(0); BOOK_DICE.forEach((t) => counts[t]++); n = 100; draw(); }, 'btn sm sc'), VZ.btn('+1', () => roll(1), 'btn sm'), VZ.btn('+100', () => roll(100), 'btn sm'), VZ.btn('+1000', () => roll(1000), 'btn sm'), VZ.btn('Xoá', () => { counts = Array(13).fill(0); n = 0; draw(); }, 'btn sm ghost'));
    BOOK_DICE.forEach((t) => counts[t]++); n = 100; draw();
  };
  APP.viz.fairDice = function (el) {
    const f = VZ.frame(el, 'Cỡ mẫu càng lớn, kết luận càng tin cậy', { icon: 'target' });
    let biased = false, n = 20, freq = Array(7).fill(0); const st = h('div'); f.stage.append(st);
    const w = () => (biased ? [0, 0.17, 0.17, 0.16, 0.15, 0.1, 0.25] : [0, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6]);
    function throwN() { freq = Array(7).fill(0); const p = w(); for (let i = 0; i < n; i++) { let r = Math.random(), k = 1; while (r > p[k] && k < 6) { r -= p[k]; k++; } freq[k]++; } draw(); SFX.play('pop'); }
    function draw() { const data = [1, 2, 3, 4, 5, 6].map((k) => [k, U.round((freq[k] / n) * 100, 1)]); st.innerHTML = FIG.bar(data, { w: 520, h: 240, max: 40, step: 10, values: true, ylab: '% of throws', xlab: 'Score', color: biased ? 'var(--bad)' : 'var(--number)' }).replace('</svg>', `<line x1="46" x2="508" y1="${14 + (240 - 46 - 14) * (1 - 16.67 / 40)}" y2="${14 + (240 - 46 - 14) * (1 - 16.67 / 40)}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 5"/></svg>`); f.out.innerHTML = `Tần số: ${[1, 2, 3, 4, 5, 6].map((k) => k + '→' + freq[k]).join(' · ')}. Đường nét đứt = 16.7% (xúc xắc công bằng). ${n <= 20 ? 'Mẫu nhỏ: kết quả dao động mạnh, khó kết luận.' : n >= 500 ? 'Mẫu lớn: tỉ lệ ổn định — có thể kết luận tin cậy hơn.' : ''}`; }
    f.ctrls.append(VZ.seg([[20, '20 lần'], [100, '100'], [500, '500'], [5000, '5000']], n, (v) => { n = +v; throwN(); }), VZ.seg([[false, 'Xúc xắc công bằng'], [true, 'Xúc xắc lệch']], biased, (v) => { biased = v === true || v === 'true'; throwN(); }), VZ.btn('Tung lại', throwN, 'btn sm sc'));
    throwN();
  };
  APP.viz.popSample = function (el) {
    const f = VZ.frame(el, 'Quần thể và mẫu: chọn ngẫu nhiên', { icon: 'eye' });
    const Nn = 400, cols = 25; let pop = [], chosen = new Set(), size = 20, hist = [];
    const realP = 0.62; const W = 500, H = 340; const svg = VZ.svg(W, H); f.stage.append(svg);
    function make() { pop = Array.from({ length: Nn }, () => Math.random() < realP); }
    function sample() { chosen = new Set(); while (chosen.size < size) chosen.add(R(0, Nn - 1)); const yes = [...chosen].filter((i) => pop[i]).length; const est = (yes / size) * 100; hist.push([size, est]); if (hist.length > 30) hist.shift(); draw(est); SFX.play('pop'); }
    function draw(est) {
      svg.innerHTML = ''; const cs = 13; pop.forEach((v, i) => { const x = 12 + (i % cols) * cs * 1.05, y = 14 + Math.floor(i / cols) * cs * 1.05; const on = chosen.has(i); svg.append(s('circle', { cx: x + cs / 2, cy: y + cs / 2, r: on ? cs / 2 : cs / 2 - 2.5, fill: v ? 'var(--stats)' : 'var(--number)', opacity: chosen.size && !on ? 0.22 : 1, stroke: on ? 'var(--ink)' : 'none', 'stroke-width': 1.5 })); });
      // estimates strip
      const x0 = 380; svg.append(s('text', { x: x0 + 55, y: 20, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink-2)', text: 'Ước lượng (%)' }));
      for (let v = 0; v <= 100; v += 25) { const y = 300 - v * 2.6; svg.append(s('line', { x1: x0, x2: x0 + 110, y1: y, y2: y, stroke: 'var(--line)' }), s('text', { x: x0 - 4, y: y + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-3)', text: v })); }
      svg.append(s('line', { x1: x0, x2: x0 + 110, y1: 300 - realP * 100 * 2.6, y2: 300 - realP * 100 * 2.6, stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
      hist.forEach(([sz, e]) => svg.append(s('circle', { cx: x0 + 12 + ({ 5: 0, 20: 1, 50: 2, 100: 3 }[sz] || 0) * 28, cy: 300 - e * 2.6, r: 4, fill: 'var(--stats)', opacity: 0.7 })));
      [5, 20, 50, 100].forEach((sz, i) => svg.append(s('text', { x: x0 + 12 + i * 28, y: 318, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)', text: 'n=' + sz })));
      f.out.innerHTML = est == null ? 'Quần thể: 400 học sinh (cam = thích bóng đá, xanh = không). Chọn mẫu để ước lượng tỉ lệ thích bóng đá.' : `Mẫu ${size} học sinh → ước lượng <b>${U.round(est, 1)}%</b> thích bóng đá (thực tế ${realP * 100}%). Mẫu lớn hơn → các ước lượng tụm sát đường thật hơn.`;
    }
    f.ctrls.append(VZ.seg([[5, 'n = 5'], [20, '20'], [50, '50'], [100, '100']], size, (v) => { size = +v; }), VZ.btn('Lấy mẫu ▶', sample, 'btn sm sc'), VZ.btn('Lấy 10 mẫu', () => { for (let i = 0; i < 10; i++) setTimeout(sample, i * 120); }, 'btn sm'));
    make(); draw();
  };
  APP.viz.questionFix = function (el) {
    const f = VZ.frame(el, 'Sửa câu hỏi khảo sát chưa tốt', { icon: 'pencil' });
    const bad = { q: 'How many hours of homework do you do?', opts: ['Between 1 and 2 hours', 'Between 2 and 3 hours', 'More than 3 hours'], notes: ['Không có lựa chọn cho “ít hơn 1 giờ”', 'Đúng 2 giờ thì chọn ô nào? (các khoảng chồng lên nhau)', 'Không rõ khoảng thời gian: mỗi tối? mỗi tuần?'] };
    const good = { q: 'How many hours of homework did you do last night?', opts: ['Less than 1 hour', 'At least 1 hour but less than 2 hours', 'At least 2 hours but less than 3 hours', '3 hours or more'] };
    let fixed = false; const box = h('div', { style: { display: 'grid', gap: '8px', padding: '6px' } }); f.stage.append(box);
    function draw() { const d = fixed ? good : bad; box.innerHTML = ''; box.append(h('div', { 'data-tr': '', style: { fontWeight: 800, fontSize: '1.1rem' } }, d.q)); d.opts.forEach((o, i) => box.append(h('label', { 'data-tr': '', style: { display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface)', animation: `stepIn .35s ${i * 0.06}s both` } }, h('span', { style: { width: '18px', height: '18px', border: '2px solid var(--ink-2)', borderRadius: '4px' } }), o))); f.out.innerHTML = fixed ? '✓ Các lựa chọn không chồng nhau và phủ hết mọi khả năng; câu hỏi nêu rõ thời gian (“last night”).' : '<b>Lỗi:</b><br>' + bad.notes.map((n) => '• ' + n).join('<br>'); }
    f.ctrls.append(VZ.seg([[false, 'Câu hỏi gốc'], [true, 'Câu hỏi đã sửa']], fixed, (v) => { fixed = v === true || v === 'true'; SFX.play('flip'); draw(); }));
    draw();
  };
  // explore
  APP.viz.heroGalton = function (el) {
    const bins = Array(13).fill(0); let balls = [];
    VZ.canvasLoop(el, (c, w, hh, t) => {
      c.fillStyle = '#0e1726'; c.fillRect(0, 0, w, hh); const rows = 10, top = hh * 0.12, gap = Math.min(w * 0.045, hh * 0.05), cx = w * 0.68;
      c.fillStyle = 'rgba(255,255,255,.5)'; for (let r = 0; r < rows; r++) for (let k = 0; k <= r; k++) { c.beginPath(); c.arc(cx + (k - r / 2) * gap * 1.6, top + r * gap, 2.4, 0, 7); c.fill(); }
      if (Math.random() < 0.35 && balls.length < 40) balls.push({ r: 0, k: 0, p: 0 });
      balls.forEach((b) => { b.p += 0.12; if (b.p >= 1) { b.p = 0; b.r++; if (Math.random() < 0.5) b.k++; } }); balls = balls.filter((b) => { if (b.r >= rows) { bins[b.k + 1]++; return false; } return true; });
      c.fillStyle = '#ffb703'; balls.forEach((b) => { const x = cx + (b.k - b.r / 2 + (Math.random() - 0.5) * 0.05) * gap * 1.6, y = top + (b.r + b.p) * gap; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
      const mx = Math.max(10, ...bins); const by = top + rows * gap + 10, bh = hh - by - 12; for (let i = 1; i <= rows + 1; i++) { const x = cx + (i - 1 - rows / 2) * gap * 1.6; const hgt = (bins[i] / mx) * bh; c.fillStyle = 'rgba(255,183,3,.85)'; c.fillRect(x - gap * 0.7, by + bh - hgt, gap * 1.4, hgt); }
      if (Math.max(...bins) > 160) bins.fill(0);
    });
  };
  APP.viz.wisdomCrowd = function (el) {
    const f = VZ.frame(el, 'Trí tuệ đám đông: đoán số kẹo trong lọ', { icon: 'spark' });
    const truth = 480; let guesses = []; const st = h('div'); f.stage.append(st);
    function add(k) { for (let i = 0; i < k; i++) { const g = Math.round(truth * Math.exp((Math.random() + Math.random() + Math.random() - 1.5) * 0.7)); guesses.push(g); } draw(); SFX.play('pop'); }
    function draw() {
      const sorted = guesses.slice().sort((a, b) => a - b); const med = guesses.length ? U.median(guesses) : 0; const mean = guesses.length ? U.mean(guesses) : 0;
      const bins = [0, 200, 300, 400, 450, 500, 550, 650, 800, 1200, 5000]; const data = bins.slice(0, -1).map((b, i) => [`${b}–${bins[i + 1]}`, guesses.filter((g) => g >= b && g < bins[i + 1]).length]);
      st.innerHTML = FIG.bar(data, { w: 600, h: 240, color: 'var(--stats)', values: true });
      f.out.innerHTML = guesses.length ? `${guesses.length} lần đoán · nhỏ nhất ${sorted[0]}, lớn nhất ${sorted[sorted.length - 1]} · trung vị <b>${Math.round(med)}</b> · trung bình <b>${Math.round(mean)}</b> · số thật: <b style="color:var(--accent)">${truth}</b>` : 'Thêm người đoán để xem trung vị gần số thật tới mức nào.';
    }
    f.ctrls.append(VZ.btn('+10 người đoán', () => add(10), 'btn sm sc'), VZ.btn('+100', () => add(100), 'btn sm'), VZ.btn('Xoá', () => { guesses = []; draw(); }, 'btn sm ghost'));
    draw();
  };
  APP.viz.biasPoll = function (el) {
    const f = VZ.frame(el, 'Mẫu lớn nhưng thiên lệch vẫn sai!', { icon: 'chart' });
    const st = h('div'); f.stage.append(st); let k = 0;
    const frames = [['Dự đoán của tạp chí (2.4 triệu phiếu)', [['Landon', 57], ['Roosevelt', 43]]], ['Dự đoán của Gallup (khoảng 50 000 người)', [['Landon', 44], ['Roosevelt', 56]]], ['Kết quả bầu cử thật 1936', [['Landon', 37], ['Roosevelt', 61]]]];
    function draw() { const [t, d] = frames[k]; st.innerHTML = FIG.bar(d, { w: 420, h: 220, max: 70, step: 10, title: t, values: true, color: k === 2 ? 'var(--good)' : k === 0 ? 'var(--bad)' : 'var(--number)' }); f.out.innerHTML = ['Tạp chí gửi phiếu cho người có điện thoại và ô tô — năm 1936 đó là nhóm giàu hơn, không đại diện cho toàn dân.', 'Gallup hỏi ít người hơn nhiều nhưng chọn mẫu đại diện cho mọi nhóm.', 'Roosevelt thắng áp đảo. Chất lượng mẫu quan trọng hơn kích thước!'][k]; }
    f.ctrls.append(VZ.btn('Tiếp ▶', () => { k = (k + 1) % 3; SFX.play('flip'); draw(); }, 'btn sm sc'));
    draw();
  };

  /* ---------- banks ---------- */
  const TYPES = ['discrete', 'continuous', 'categorical'];
  const typeQ = (thing, k) => mcq(`What type of data is “${thing}”?`, TYPES, k, ['Discrete data can take particular values only (you count it).', 'Continuous data is measured and can take any value.', 'Categorical data is words or groups, not numbers.'][k], { fixed: true });

  APP.addUnit({
    n: 6, strand: 'stats', title: 'Collecting data', vi: 'Thu thập dữ liệu',
    blurb: 'A website company wants to know if people find its site easy to use. A drug company wants to know if a new drug is better. Teachers think drivers are speeding past their school. In all three cases you have statistical questions, and you need to collect data to answer them. You must decide what sort of data to collect and how to collect it.',
    blurbVi: 'Câu hỏi thống kê cần dữ liệu để trả lời. Chương này phân biệt dữ liệu rời rạc, liên tục, định tính; lập kế hoạch điều tra; chọn mẫu và hiểu ảnh hưởng của cỡ mẫu.',
    words: [['data', 'dữ liệu'], ['statistical question', 'câu hỏi thống kê'], ['prediction', 'dự đoán'], ['discrete data', 'dữ liệu rời rạc'], ['continuous data', 'dữ liệu liên tục'], ['categorical data', 'dữ liệu định tính (phân loại)'], ['questionnaire', 'bảng hỏi'], ['survey', 'khảo sát'], ['interview', 'phỏng vấn'], ['observation', 'quan sát'], ['experiment', 'thí nghiệm'], ['population', 'tổng thể (quần thể)'], ['sample', 'mẫu'], ['sample size', 'cỡ mẫu'], ['frequency', 'tần số'], ['mode', 'mốt'], ['median', 'trung vị'], ['mean', 'trung bình cộng'], ['biased', 'thiên lệch'], ['analyse', 'phân tích']],
    chat: ['Dữ liệu rời rạc và liên tục khác nhau thế nào?', 'Vì sao phải chọn mẫu thay vì hỏi tất cả?', 'Một câu hỏi khảo sát tốt cần gì?'],
    sections: [
      {
        id: '6.1', t: 'Conducting an investigation', vi: 'Tiến hành điều tra',
        goals: ['learn how to collect data to investigate statistical questions.'],
        body: [
          ['p', 'Look at these <b>statistical questions</b>: 1 How many brothers do the learners in your class have? 2 What is the average mass of a baby born in your country? 3 What sports do learners in your school like to watch? To answer a statistical question you need to collect <b>data</b>.'],
          ['table', ['Type of data', 'Meaning', 'Examples'], [['<b>Discrete</b>', 'can take particular values only (0, 1, 2, …)', 'number of brothers, shoe size, goals'], ['<b>Continuous</b>', 'measurements that can take any value', 'mass, length, time, temperature'], ['<b>Categorical</b>', 'words, not numbers', 'favourite sport, colour, type of car']]],
          ['viz', 'dataTypes'],
          ['p', 'There are several ways to collect data. You can use a <b>questionnaire</b>, carry out <b>measurements</b>, make <b>observations</b> or <b>interview</b> people.'],
          ['ex', { t: 'Worked example 6.1', q: 'Explain what method you would use to test each prediction, and what type of data it is. a 11-year-old girls can run 50 m faster than 11-year-old boys. b Most teachers in my school wear glasses. c Plants in the sun grow taller than plants in the shade.', steps: ['a: Choose some girls and boys to run 50 m and time each one. <b>Continuous data.</b>', 'b: Observe each teacher; you could also interview them (some wear glasses only for reading or driving). <b>Categorical data.</b>', 'c: Do an experiment: plant seeds of the same type in the sun and in the shade, then measure the height of each plant. <b>Continuous data.</b>'] }],
          ['viz', 'questionFix'],
          ['viz', 'diceTotals'],
          ['vi', ['Dữ liệu rời rạc: đếm được, chỉ nhận một số giá trị (số anh em, cỡ giày).', 'Dữ liệu liên tục: đo được, nhận mọi giá trị (khối lượng, chiều cao, thời gian).', 'Dữ liệu định tính: là chữ/nhóm (môn học yêu thích, màu sắc).', 'Câu hỏi khảo sát tốt: rõ ràng, các lựa chọn không chồng lên nhau và bao phủ mọi khả năng.', 'Ghi dữ liệu bằng bảng tần số/kiểm đếm thay vì một danh sách dài.']],
        ],
        bank: [
          typeQ('the mass of a book', 1), typeQ('the colour of a book', 2), typeQ('the number of pages in a book', 0),
          sort('Write down the type of data for each fact about a person.', ['discrete', 'continuous', 'categorical'], [['shoe size', 0], ['age in whole years', 0], ['height', 1], ['time taken to travel to school', 1], ['favourite subject', 2], ['eye colour', 2]], 'Counted values → discrete; measurements → continuous; words → categorical.'),
          sort('Liling is collecting data about cars. Sort the examples.', ['categorical', 'discrete', 'continuous'], [['colour', 0], ['make (brand)', 0], ['number of doors', 1], ['number of seats', 1], ['length', 2], ['top speed', 2], ['mass', 2]], 'Number of doors is counted; length is measured.'),
          fill('A hotel questionnaire asks: “How clean was your room? Circle one number 1 2 3 4 5.” The replies were: score 1: 2, score 2: 4, score 3: 9, score 4: 17, score 5: 21.', [53, 5], 'Total = 2 + 4 + 9 + 17 + 21 = 53. The modal score has the highest frequency (21).', { f: 'How many people replied? [] &nbsp; What was the modal score? []', fig: FIG.table(['Score', '1', '2', '3', '4', '5'], [['Frequency', '2', '4', '9', '17', '21']]) }),
          mcq('What is missing from the question “How clean was your room? Circle one number. 1 2 3 4 5”?', ['It does not say whether 1 or 5 means very clean', 'It needs more numbers', 'It should ask for a word', 'Nothing is missing'], 0, 'You need labels such as “1 = very dirty, 5 = very clean”.'),
          multi('“How many hours of homework do you do? ☐ Between 1 and 2 hours ☐ Between 2 and 3 hours ☐ More than 3 hours.” What is wrong with this question? Select all that apply.', ['There is no box for less than 1 hour', 'Someone who does exactly 2 hours could tick two boxes', 'It does not say when (each night? each week?)', 'The question is too short to understand', 'It should use a scale of 1 to 10'], [0, 1, 2], 'Good questions have boxes that do not overlap and cover every possible answer.'),
          mcq('A teacher predicts: “The boys’ estimates of the number of sweets in a jar will be too big.” What type of data does she need to collect?', ['Discrete — each estimate is a whole number of sweets (plus whether it is a boy or a girl)', 'Continuous — the mass of the jar', 'Categorical only — boy or girl', 'No data is needed'], 0, 'She records each learner’s estimate and whether they are a boy or a girl, then compares with the true number.'),
          mcq('Adekunle predicts: “People get more emails on Mondays than on Fridays.” Which is the best way to collect data?', ['Ask a sample of workers to record how many emails they receive each Monday and Friday for several weeks', 'Ask one person how many emails they get', 'Count the emails he gets on one Monday', 'Ask people which day they like best'], 0, 'Collect data for many people and several weeks, then compare averages.'),
          fill('Sofia and Zara throw two dice 100 times and record the totals. The frequencies are shown.', [17, 7], 'The highest frequency is 17, for a total of 7.', { f: 'Highest frequency: [] &nbsp; Modal total: []', fig: FIG.table(['Total', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], [['Freq.', '3', '5', '11', '12', '8', '17', '12', '14', '15', '3', '0']]) }),
          mcq('Sofia predicts “7 is the most likely total”; Zara predicts “All totals are equally likely”. Using the 100 results (2:3, 3:5, 4:11, 5:12, 6:8, 7:17, 8:12, 9:14, 10:15, 11:3, 12:0), which statement is best?', ['Sofia’s prediction is supported; Zara’s is not', 'Zara’s prediction is supported; Sofia’s is not', 'Both are supported', 'Neither can be tested'], 0, '7 has the highest frequency (17) and the totals are clearly not equal (12 never appears).', { d: 2 }),
          mcq('Why is writing the 100 dice totals in a long list not a good way to record the results?', ['It is hard to count how many times each total appears', 'It uses too many numbers', 'Lists cannot be used in statistics', 'The dice might be unfair'], 0, 'A tally chart or frequency table is better.'),
          gen(() => { const pool = [['the number of cars in a car park', 0], ['the speed of a car', 1], ['the colour of a car', 2], ['the number of students in a class', 0], ['the time taken to finish a race', 1], ['the type of fruit someone likes', 2], ['the amount of rain in a day', 1], ['the number of goals in a match', 0], ['the language someone speaks', 2], ['the length of a river', 1], ['the number of pets someone has', 0], ['a person’s blood group', 2]]; const [t, k] = pick(pool); return typeQ(t, k); }),
          gen(() => { const sc = [R(1, 6), R(2, 8), R(3, 12), R(5, 15), R(4, 20)]; const tot = U.sum(sc); const mode = sc.indexOf(Math.max(...sc)) + 1; if (sc.filter((x) => x === Math.max(...sc)).length > 1) return null; return fill('A café asks customers to rate the service from 1 (poor) to 5 (excellent). The table shows the results.', [tot, mode], `Total = ${sc.join(' + ')} = ${tot}; the modal score is ${mode}.`, { f: 'Number of replies: [] &nbsp; Modal score: []', fig: FIG.table(['Score', '1', '2', '3', '4', '5'], [['Frequency', ...sc.map(String)]]), app: true }); }, { app: true }),
        ],
      },
      {
        id: '6.2', t: 'Taking a sample', vi: 'Chọn mẫu',
        goals: ['learn about taking a sample', 'learn about the effect of sample size.'],
        body: [
          ['p', 'Prediction: <i>Newborn baby boys are heavier than newborn baby girls.</i> It would be very difficult to find the masses of all the babies born. You could find the masses of some of the babies. This would be a <b>sample</b> of the whole <b>population</b>. The population is all newborn babies; the sample is the group of babies you choose.'],
          ['p', 'If you can, it is best to get information from the whole population. However, this may take too long or cost too much. In such cases you can choose a sample. The sample should not be too small or it will not represent the whole population.'],
          ['viz', 'popSample'],
          ['ex', { t: 'Worked example 6.2', q: 'Arun predicts: “Boys can hold their breath longer than girls.” a What is the population? b Why use a sample? c How can he choose the sample? d What data must he collect? e How can he analyse the results?', steps: ['a: All the learners in the school.', 'b: Testing the whole school would take a long time and may not be practical.', 'c: Put names in a hat and select 40 learners; or choose names from each class list; or test all learners in one or two classes.', 'd: Time how long each learner holds their breath, and record whether each is a boy or a girl.', 'e: Analyse boys’ and girls’ data separately: draw a chart and find an average for each group, then compare the averages.'] }],
          ['viz', 'fairDice'],
          ['vi', ['Tổng thể (population): toàn bộ đối tượng cần nghiên cứu. Mẫu (sample): nhóm được chọn ra.', 'Dùng mẫu khi hỏi cả tổng thể quá tốn thời gian/chi phí hoặc không thể.', 'Mẫu quá nhỏ thì không đại diện; mẫu lớn tin cậy hơn nhưng tốn công hơn.', 'Chọn ngẫu nhiên (bốc thăm) để mẫu không thiên lệch.']],
        ],
        bank: [
          fill('Wei asks 25 learners: “How many hours of homework did you do last night?”', [16, 25], '2–3 hours: 11, more than 3 hours: 5 → 16 of 25 learners do more than 2 hours.', { f: 'Learners who did more than 2 hours: [] out of []', fig: FIG.table(['Homework', 'Less than 1 h', '1–2 h', '2–3 h', 'More than 3 h'], [['Frequency', '3', '6', '11', '5']]) }),
          mcq('Wei predicted that most learners do more than 2 hours of homework each evening. 16 out of 25 learners did. What can you say?', ['The results support her prediction', 'The results do not support her prediction', 'The sample is the whole population', 'The data is continuous so nothing can be said'], 0, '16 out of 25 is 64%, which is more than half.'),
          mcq('Sofia investigates birthdays of young people. Why is it not possible to collect data from the whole population?', ['There are far too many young people in the world', 'Birthdays are categorical data', 'Young people do not know their birthdays', 'It is against the law'], 0, 'The population is huge, so she uses a sample.'),
          fill('Sofia’s results: spring 200, summer 170, autumn 230, winter 220.', [820, { opts: ['spring', 'summer', 'autumn', 'winter'], a: 2 }], '200 + 170 + 230 + 220 = 820. Autumn is highest, but only a little more than winter.', { f: 'Sample size: [] &nbsp; The most common season was []' }),
          mcq('A helpline survey asks: “Was the service helpful? Circle 1 (not helpful at all) to 5 (very helpful).” The frequencies for scores 1–5 are 10, 12, 6, 1, 8. What can you say?', ['Most callers did not find it helpful — 22 out of 37 chose 1 or 2', 'Most callers found it very helpful', 'Everyone gave the same score', 'There is not enough information'], 0, '10 + 12 = 22 scores were low, out of a total of 37.', { d: 2 }),
          fill('Suki throws a dice 500 times. Frequencies for scores 1 to 6: 93, 92, 83, 74, 48, 110.', [500, 6, 5], 'Expected for a fair dice ≈ 500 ÷ 6 ≈ 83 each. 6 appears far more often and 5 far less.', { f: 'Total throws: [] &nbsp; Most frequent score: [] &nbsp; Least frequent score: []', d: 2 }),
          mcq('After 20 throws Suki’s frequencies were 4, 3, 1, 4, 5, 3. Can she say the dice is not fair?', ['No — 20 throws is too small a sample to decide', 'Yes — 3 appeared only once', 'Yes — 5 appeared most', 'No — dice are always fair'], 0, 'With small samples results vary a lot by chance.'),
          mcq('After 500 throws (93, 92, 83, 74, 48, 110), what is the best conclusion?', ['The dice is probably biased: 5 is much less likely and 6 is much more likely', 'The dice is definitely fair', 'More throws can never help', 'The dice is biased towards 1'], 0, 'With a large sample the differences from about 83 are too big to be chance.', { d: 2 }),
          multi('Why is a large sample better than a small sample? Select all correct reasons.', ['It is more likely to represent the population', 'Results are less affected by chance', 'It is always cheaper', 'It is always quicker'], [0, 1], 'Large samples are more reliable but take more time and money.'),
          mcq('A gym manager interviews only 10 members to investigate how members use the gym. What is the problem?', ['The sample is too small to represent all members', 'The sample is too big', 'Interviews cannot be used', 'Gym members are not a population'], 0, '10 people may not represent the different types of members.'),
          mcq('Dakarai compares the lengths of words in two books using one page from each book. What is the best average to find the typical word length?', ['the mode or the median — word lengths are whole numbers and there may be a few very long words', 'the range', 'the total', 'the largest value'], 0, 'Averages: mode, median, mean. The range is not an average.', { d: 2 }),
          order('Put the stages of a statistical investigation in order.', ['Write a statistical question and make a prediction', 'Decide what data to collect and how', 'Choose a sample and collect the data', 'Record the data in a table and draw charts', 'Analyse the results and decide if the prediction is correct'], 'Plan → collect → present → analyse → conclude.'),
          gen(() => { const pop = pick([['all the learners in a school', 'learners'], ['all the trees in a forest', 'trees'], ['all the customers of a supermarket', 'customers'], ['all the fish in a lake', 'fish']]); return mcq(`A researcher studies ${pop[0]}. She chooses 50 ${pop[1]} at random. What is the population?`, [pop[0], `the 50 ${pop[1]} she chose`, 'the researcher', 'the data she collects'], 0, `The population is the whole group: ${pop[0]}. The 50 chosen are the sample.`); }),
          gen(() => { const n = pick([20, 30, 40, 50]); const yes = R(Math.round(n * 0.2), Math.round(n * 0.8)); return num(`In a sample of ${n} learners, ${yes} said they walk to school. What percentage of the sample walk to school?`, U.round((yes / n) * 100, 1), `${yes} ÷ ${n} × 100 = ${U.round((yes / n) * 100, 1)}%.`, { unit: '%', app: true }); }, { app: true }),
        ],
      },
    ],
    explore: {
      title: 'The science of asking questions', hero: 'heroGalton',
      lead: 'Governments count millions of people, scientists test medicines and TV stations predict elections. Statistics is how we learn the truth about a big population from a small, well-chosen sample.',
      leadVi: 'Thống kê giúp ta biết sự thật về cả tổng thể lớn chỉ từ một mẫu nhỏ được chọn khéo.',
      cards: [
        { t: 'The wisdom of the crowd', p: 'In 1906, the scientist Francis Galton watched 787 people guess the weight of an ox at a country fair. Individual guesses were often wrong, but the <b>median</b> guess was within 1% of the true weight! Try it with a jar of sweets.', viz: 'wisdomCrowd' },
        { t: 'Big but biased', p: 'In 1936 a magazine posted 10 million voting forms and received 2.4 million replies — a huge sample. It predicted the wrong winner. A smaller but fairer sample got it right. A sample must <b>represent</b> the population.', viz: 'biasPoll' },
        { t: 'Small samples jump around', p: 'Throw a fair dice 20 times and the results can look very unfair. Throw it 5000 times and the frequencies settle down. This is why scientists use large samples to test new medicines.', viz: 'fairDice' },
        { t: 'Counting a whole country', p: 'A <b>census</b> collects data from the whole population. Viet Nam holds a census every ten years; in 2019 it counted about 96.2 million people. Because a census is so expensive, most surveys use samples instead.', fig: FIG.bar([['1979', 52.7], ['1989', 64.4], ['1999', 76.3], ['2009', 85.8], ['2019', 96.2]], { w: 420, h: 220, title: 'Viet Nam population (millions)', values: true, color: 'var(--stats)' }) },
      ],
      facts: [['787', 'guesses', 'Galton’s ox: the median guess was 1207 lb; the true weight was 1198 lb.'], ['1936', 'poll disaster', '2.4 million replies, but the sample was biased.'], ['10 years', 'census cycle', 'Many countries count their whole population every ten years.'], ['1 in 6', 'fair dice', 'Each score should appear about once in every six throws in the long run.']],
      challenge: { t: 'Design your own survey', p: 'You want to know whether learners in your school get enough sleep. Write a prediction, a question with tick boxes that do not overlap, and say how you would choose a sample of 50 learners fairly.', a: 'Example: Prediction: “Most learners sleep less than 8 hours on school nights.” Question: “How many hours did you sleep last night? ☐ less than 6 ☐ 6 to less than 7 ☐ 7 to less than 8 ☐ 8 to less than 9 ☐ 9 or more.” Sample: put every learner’s name in a hat (or use a random number generator) and choose 10 from each year group.' },
    },
    reading: {
      title: 'When a Huge Sample Got It Wrong', sub: 'A true story from the history of statistics. Tap words to translate.',
      labels: ['A', 'B', 'C', 'D', 'E'],
      paras: [
        'In 1936, the United States held a presidential election between Franklin Roosevelt and Alf Landon. A popular magazine called the Literary Digest decided to predict the winner. It had correctly predicted several earlier elections, so many people trusted it.',
        'The magazine posted voting forms to about ten million people. It found their names and addresses in telephone books, lists of car owners and lists of its own readers. Around 2.4 million people sent the forms back. This was one of the largest samples ever collected. The magazine predicted that Landon would win easily, with about 57% of the vote.',
        'However, when the real election took place, Roosevelt won with about 61% of the vote — one of the biggest victories in American history. How could such a huge sample be so wrong?',
        'The problem was bias. In 1936, during a time of economic difficulty, people who owned telephones and cars were usually richer than average, and richer people were more likely to vote for Landon. Also, the people who chose to send the form back were not typical of all voters. The sample was big, but it did not represent the whole population.',
        'At the same time, a young researcher named George Gallup asked only about 50 000 people, but he chose them carefully so that every group in society was included. He correctly predicted that Roosevelt would win. The lesson is still important today: a small, fair sample is better than a large, biased one.',
      ],
      gloss: [['election', 'cuộc bầu cử'], ['predict', 'dự đoán'], ['bias', 'sự thiên lệch'], ['economic', 'kinh tế'], ['typical', 'điển hình'], ['represent', 'đại diện']],
      parts: [
        { title: 'True, False or Not Given?', qs: [
          { type: 'mcq', q: 'The Literary Digest had predicted earlier elections correctly.', opts: ['True', 'False', 'Not Given'], a: 0, fixed: true, ex: 'Paragraph A.' },
          { type: 'mcq', q: 'Every person who received a form sent it back.', opts: ['True', 'False', 'Not Given'], a: 1, fixed: true, ex: 'About 2.4 million of 10 million replied.' },
          { type: 'mcq', q: 'The magazine stopped publishing after the election.', opts: ['True', 'False', 'Not Given'], a: 2, fixed: true, ex: 'The passage does not say.' },
        ] },
        { title: 'Complete the table', note: 'Use numbers from the passage.', qs: [
          { type: 'fill', q: 'Fill in the numbers.', f: 'Forms posted: about [] million &nbsp; Forms returned: about [] million &nbsp; Gallup’s sample: about [] people &nbsp; Roosevelt’s real share of the vote: about []%', a: [10, 2.4, 50000, 61], ex: 'Paragraphs B, C and E.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'Why was the magazine’s sample biased?', opts: ['Names came from lists of telephone and car owners, who were usually richer', 'The sample was too small', 'The forms were in the wrong language', 'Gallup changed the results'], a: 0, ex: 'Paragraph D.' },
          { type: 'mcq', q: 'What is the main lesson of the passage?', opts: ['A small, fair sample is better than a large, biased one', 'Larger samples are always better', 'Magazines cannot predict elections', 'Telephones are important'], a: 0, ex: 'Last sentence.' },
          { type: 'txt', q: 'In ONE word, what was “the problem” (paragraph D)?', a: ['bias'], ex: '“The problem was bias.”' },
        ] },
      ],
    },
    listening: {
      title: 'Planning a screen-time survey', intro: 'Two classmates plan an investigation for their maths project. Listen and answer.',
      voices: { Ana: 'airy', Ben: 'rounded' },
      lines: [
        { spk: 'Ana', text: 'For our project, I want to test this prediction: learners in Year 7 spend more time on screens at the weekend than on school days.' },
        { spk: 'Ben', text: 'Good idea. There are one hundred and eighty learners in Year 7. We can’t ask everyone, so let’s take a sample.' },
        { spk: 'Ana', text: 'How about thirty learners? We could put all the names in a hat and pick them at random, so the sample is fair.' },
        { spk: 'Ben', text: 'Yes. And our question must be clear. Not just “Do you use screens a lot?” — that’s too vague.' },
        { spk: 'Ana', text: 'Right. We’ll ask: how many hours did you spend on screens yesterday? With boxes: less than one hour, one to less than two hours, two to less than four hours, and four hours or more.' },
        { spk: 'Ben', text: 'We should ask on a Wednesday and again on a Sunday. Then we can draw a dual bar chart and compare the medians.' },
      ],
      parts: [
        { title: 'Complete the plan', qs: [
          { type: 'fill', q: 'Write numbers or words you hear.', f: 'Learners in Year 7: [] &nbsp; Sample size: [] &nbsp; Days to ask: Wednesday and [] &nbsp; Average to compare: the []', a: [180, 30, ['sunday'], ['median', 'medians']], ex: '180 learners; sample of 30; Wednesday and Sunday; compare the medians.' },
        ] },
        { title: 'Choose the correct answer', qs: [
          { type: 'mcq', q: 'How will they choose the sample?', opts: ['put names in a hat and pick at random', 'ask their friends', 'ask the first 30 people they meet', 'ask only one class'], a: 0, ex: '“put all the names in a hat and pick them at random”.' },
          { type: 'mcq', q: 'Why does Ben reject “Do you use screens a lot?”', opts: ['It is too vague', 'It is too long', 'It is too personal', 'It has too many boxes'], a: 0, ex: '“that’s too vague.”' },
          { type: 'mcq', q: 'What type of data is “hours spent on screens”?', opts: ['continuous', 'categorical', 'discrete'], a: 0, ex: 'Time is measured, so it is continuous (grouped into classes).' },
        ] },
      ],
    },
  });
})();
