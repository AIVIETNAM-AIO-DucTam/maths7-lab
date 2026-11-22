/* Maths 7 Lab — visual toolkit: interactive widget frame, SVG helpers, drag, static figures for questions */
(function () {
  'use strict';
  const { h, s, icon, U, SFX } = APP;
  const VZ = {};

  // frame: returns { root, stage, ctrls, out }
  VZ.frame = function (el, title, opts = {}) {
    const root = h('div', { class: 'viz' + (opts.cls ? ' ' + opts.cls : '') });
    if (title) root.append(h('div', { class: 'vz-h', html: icon(opts.icon || 'spark') + title }));
    const stage = h('div', { class: opts.scroll ? 'vz-scroll' : '' });
    const ctrls = h('div', { class: 'vz-c' });
    const out = h('div', { class: 'vz-o', 'aria-live': 'polite' });
    root.append(stage, ctrls, out);
    el.append(root);
    return { root, stage, ctrls, out };
  };
  VZ.svg = function (w, hgt, cls = 'vz') { return s('svg', { viewBox: `0 0 ${w} ${hgt}`, class: cls, role: 'img' }); };
  VZ.range = function (label, min, max, val, step, onInput, fmt) {
    const id = 'r' + Math.random().toString(36).slice(2, 8);
    const out = h('b', { class: 'mono' }, fmt ? fmt(val) : val);
    const inp = h('input', { type: 'range', id, min, max, step: step || 1, value: val });
    inp.addEventListener('input', () => { out.textContent = fmt ? fmt(+inp.value) : inp.value; onInput(+inp.value); });
    const lab = h('label', { for: id }, label, inp, out);
    lab.set = (v) => { inp.value = v; out.textContent = fmt ? fmt(+v) : v; };
    return lab;
  };
  VZ.seg = function (options, val, onPick) {
    const el = h('div', { class: 'seg', role: 'group' });
    options.forEach((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; const b = h('button', { type: 'button', class: v === val ? 'on' : '', html: String(l) }); b.onclick = () => { [...el.children].forEach((x) => x.classList.remove('on')); b.classList.add('on'); SFX.play('tap'); onPick(v); }; el.append(b); });
    return el;
  };
  VZ.btn = (label, onclick, cls = 'btn sm') => h('button', { class: cls, type: 'button', html: label, onclick: (e) => { SFX.play('tap'); onclick(e); } });
  VZ.num = function (label, val, onChange, attrs = {}) {
    const inp = h('input', Object.assign({ type: 'number', value: val, inputmode: 'numeric' }, attrs));
    inp.addEventListener('input', () => { const v = parseFloat(inp.value); if (!isNaN(v)) onChange(v); });
    return h('label', {}, label, inp);
  };
  // pointer -> svg coordinates
  VZ.pt = function (svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; };
  VZ.drag = function (svg, handle, onMove, onEnd) {
    handle.classList.add('drag');
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault(); handle.setPointerCapture(e.pointerId);
      const mv = (ev) => onMove(VZ.pt(svg, ev), ev);
      const up = (ev) => { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up); onEnd && onEnd(VZ.pt(svg, ev)); };
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    });
  };
  VZ.css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  VZ.ease = (t) => 1 - Math.pow(1 - t, 3);
  VZ.animate = function (ms, fn, done) { const t0 = performance.now(); let id; const st = (t) => { const k = Math.min(1, (t - t0) / ms); fn(VZ.ease(k), k); if (k < 1) id = requestAnimationFrame(st); else done && done(); }; id = requestAnimationFrame(st); return () => cancelAnimationFrame(id); };
  VZ.when = function (el, fn) { // run once when visible (still renders statically before)
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold: 0.25 }); io.observe(el);
  };
  // canvas with DPR + resize, calls draw(ctx, w, h, t)
  VZ.canvasLoop = function (parent, draw, opts = {}) {
    const cv = h('canvas', { class: opts.cls || '' }); parent.append(cv);
    let w = 0, hh = 0, raf = 0, running = true, t0 = performance.now();
    const fit = () => { const r = cv.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1); w = r.width; hh = r.height; cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, hh * dpr); cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); };
    let vis = true; // pause drawing while the canvas is scrolled off screen (saves battery on phones)
    const loop = (t) => { raf = 0; if (!running) return; if (!document.body.contains(cv)) { running = false; return; } if (!vis) return; draw(cv.getContext('2d'), w, hh, (t - t0) / 1000); raf = requestAnimationFrame(loop); };
    requestAnimationFrame(() => { fit(); raf = requestAnimationFrame(loop); });
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { vis = es[es.length - 1].isIntersecting; if (vis && running && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(cv);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setTimeout(() => { running = false; fit(); draw(cv.getContext('2d'), w, hh, 2); }, 50); }
    return { cv, stop: () => { running = false; cancelAnimationFrame(raf); } };
  };

  /* ---------------- static SVG figure strings (for questions & theory) ---------------- */
  const FIG = {};
  const col = { ink: 'var(--ink)', ink2: 'var(--ink-2)', line: 'var(--line)', sc: 'var(--sc)', acc: 'var(--accent)', soft: 'var(--sc-soft)' };
  FIG.col = col;
  const T = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-size="${o.fs || 14}" text-anchor="${o.a || 'middle'}" fill="${o.c || 'var(--ink)'}" font-weight="${o.w || 500}" ${o.extra || ''}>${t}</text>`;
  FIG.T = T;
  // number line from a to b, marks: [{v, label, color}], arrows: [[from,to,color]]
  FIG.numberLine = function (a, b, o = {}) {
    const W = o.w || 520, H = o.h || 90, pad = 26, n = b - a, step = o.step || 1; const x = (v) => pad + ((v - a) / n) * (W - 2 * pad); const y = o.y || 55;
    let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><line x1="${pad - 14}" y1="${y}" x2="${W - pad + 14}" y2="${y}" stroke="var(--ink-2)" stroke-width="2"/>`;
    g += `<path d="M${W - pad + 14} ${y} l-8 -5 v10z M${pad - 14} ${y} l8 -5 v10z" fill="var(--ink-2)"/>`;
    for (let v = a; v <= b + 1e-9; v += step) { const mj = o.major || 1; const big = Math.abs(Math.round(v / mj) * mj - v) < 1e-6; g += `<line x1="${x(v)}" y1="${y - (big ? 7 : 4)}" x2="${x(v)}" y2="${y + (big ? 7 : 4)}" stroke="var(--ink-2)" stroke-width="1.5"/>`; if (big && o.labels !== false) g += T(x(v), y + 24, U.N(U.round(v, 4)), { fs: 12, c: 'var(--ink-2)' }); }
    (o.arrows || []).forEach(([f, t, c]) => { const x1 = x(f), x2 = x(t), mid = (x1 + x2) / 2, hgt = Math.min(40, Math.abs(x2 - x1) / 2 + 8); g += `<path d="M${x1} ${y - 6} Q${mid} ${y - 6 - hgt} ${x2} ${y - 6}" fill="none" stroke="${c || 'var(--accent)'}" stroke-width="2.5" marker-end="url(#ah)"/>`; });
    if (o.arrows) g += `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>`;
    (o.marks || []).forEach((m) => { g += `<circle cx="${x(m.v)}" cy="${y}" r="7" fill="${m.open ? 'var(--surface)' : m.color || 'var(--accent)'}" stroke="${m.color || 'var(--accent)'}" stroke-width="2.5"/>`; if (m.label) g += T(x(m.v), y - 16, m.label, { fs: 13, w: 700, c: m.color || 'var(--accent)' }); });
    (o.rays || []).forEach((r) => { const x0 = x(r.from); const x1 = r.dir > 0 ? W - pad + 10 : pad - 10; g += `<line x1="${x0}" y1="${y - 14}" x2="${x1}" y2="${y - 14}" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/><line x1="${x0}" y1="${y - 14}" x2="${x0}" y2="${y}" stroke="var(--accent)" stroke-width="2"/><circle cx="${x0}" cy="${y}" r="7" fill="${r.open ? 'var(--surface)' : 'var(--accent)'}" stroke="var(--accent)" stroke-width="2.5"/>`; });
    return g + '</svg>';
  };
  // bar chart: data [[label, value]], o: {w,h,max,step,color,title,ylab, series:[{name,color,values}] for dual, stacked}
  FIG.bar = function (data, o = {}) {
    const W = o.w || 460, H = o.h || 260, L = 46, B = 46, Tp = o.title ? 30 : 14, Rr = 12;
    const series = o.series || [{ name: '', color: o.color || 'var(--sc)', values: data.map((d) => d[1]) }];
    const labels = o.series ? o.labels : data.map((d) => d[0]);
    const vals = o.stacked ? labels.map((_, i) => series.reduce((p, se) => p + se.values[i], 0)) : series.flatMap((se) => se.values);
    const max = o.max || Math.max(o.step || 5, Math.ceil(Math.max(0, ...vals) / (o.step || 5)) * (o.step || 5)), step = o.step || Math.max(1, Math.round(max / 5));
    const pw = W - L - Rr, ph = H - B - Tp; const y = (v) => Tp + ph - (v / max) * ph;
    let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    if (o.title) g += T(W / 2, 18, o.title, { fs: 14, w: 700 });
    for (let v = 0; v <= max + 1e-9; v += step) g += `<line x1="${L}" y1="${y(v)}" x2="${W - Rr}" y2="${y(v)}" stroke="var(--line)"/>` + T(L - 8, y(v) + 4, U.N(U.round(v, 3)), { fs: 11, a: 'end', c: 'var(--ink-2)' });
    const gw = pw / labels.length, bw = o.stacked ? gw * 0.55 : (gw * 0.7) / series.length;
    labels.forEach((lab, i) => {
      let acc = 0;
      series.forEach((se, k) => {
        const v = se.values[i]; const bx = L + i * gw + (o.stacked ? gw * 0.225 : gw * 0.15 + k * bw);
        const top = o.stacked ? y(acc + v) : y(v), bot = o.stacked ? y(acc) : y(0);
        g += `<rect x="${bx}" y="${top}" width="${bw - 2}" height="${Math.max(0, bot - top)}" fill="${se.color}" rx="3"/>`;
        if (o.values) g += T(bx + bw / 2 - 1, top - 4, U.N(v), { fs: 11, w: 700 });
        acc += v;
      });
      g += T(L + i * gw + gw / 2, H - B + 18, lab, { fs: 12, c: 'var(--ink-2)' });
    });
    g += `<line x1="${L}" y1="${Tp}" x2="${L}" y2="${Tp + ph}" stroke="var(--ink-2)" stroke-width="1.5"/><line x1="${L}" y1="${Tp + ph}" x2="${W - Rr}" y2="${Tp + ph}" stroke="var(--ink-2)" stroke-width="1.5"/>`;
    if (o.ylab) g += `<text x="12" y="${Tp + ph / 2}" font-size="11" fill="var(--ink-2)" text-anchor="middle" transform="rotate(-90 12 ${Tp + ph / 2})">${o.ylab}</text>`;
    if (o.xlab) g += T(L + pw / 2, H - 6, o.xlab, { fs: 11, c: 'var(--ink-2)' });
    if (o.series && series.length > 1) { let lx = L + 4; series.forEach((se) => { g += `<rect x="${lx}" y="${H - 14}" width="10" height="10" rx="2" fill="${se.color}"/>` + T(lx + 14, H - 5, se.name, { fs: 11, a: 'start' }); lx += 24 + se.name.length * 6.5; }); }
    return g + '</svg>';
  };
  // pie: data [[label, value, color?]]
  FIG.pie = function (data, o = {}) {
    const W = o.w || 360, H = o.h || 240, cx = o.legend === false ? W / 2 : 120, cy = H / 2, r = Math.min(100, H / 2 - 12); const tot = data.reduce((p, d) => p + d[1], 0);
    const pal = ['var(--number)', 'var(--geometry)', 'var(--stats)', 'var(--algebra)', 'var(--accent)', 'var(--accent-2)', 'var(--bad)', 'var(--ink-3)'];
    let a0 = -Math.PI / 2, g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    data.forEach((d, i) => {
      const a1 = a0 + (d[1] / tot) * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const c = d[2] || pal[i % pal.length];
      g += data.length === 1 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>` : `<path d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}Z" fill="${c}" stroke="var(--surface)" stroke-width="2"/>`;
      if (o.angles) { const am = (a0 + a1) / 2; g += T(cx + r * 0.62 * Math.cos(am), cy + r * 0.62 * Math.sin(am) + 4, Math.round((d[1] / tot) * 360) + '°', { fs: 12, w: 700, c: '#fff' }); }
      else if (o.pct) { const am = (a0 + a1) / 2; g += T(cx + r * 0.62 * Math.cos(am), cy + r * 0.62 * Math.sin(am) + 4, Math.round((d[1] / tot) * 100) + '%', { fs: 12, w: 700, c: '#fff' }); }
      if (o.legend !== false) g += `<rect x="${cx + r + 22}" y="${24 + i * 24}" width="13" height="13" rx="3" fill="${c}"/>` + T(cx + r + 42, 35 + i * 24, d[0] + (o.showVals ? ` (${d[1]})` : ''), { fs: 13, a: 'start' });
      a0 = a1;
    });
    return g + '</svg>';
  };
  // coordinate grid: o {xmin,xmax,ymin,ymax, size, points:[{x,y,label,color}], lines:[{pts:[[x,y]...], color, dash}], polys:[{pts, fill, stroke}], fns:[{f,color}]}
  FIG.grid = function (o = {}) {
    const xmin = o.xmin ?? -5, xmax = o.xmax ?? 5, ymin = o.ymin ?? -5, ymax = o.ymax ?? 5, c = o.size || 32, pad = 22;
    const W = (xmax - xmin) * c + 2 * pad, H = (ymax - ymin) * c + 2 * pad; const X = (x) => pad + (x - xmin) * c, Y = (y) => pad + (ymax - y) * c;
    let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    for (let x = xmin; x <= xmax; x++) g += `<line x1="${X(x)}" y1="${Y(ymin)}" x2="${X(x)}" y2="${Y(ymax)}" stroke="var(--line)"/>`;
    for (let y = ymin; y <= ymax; y++) g += `<line x1="${X(xmin)}" y1="${Y(y)}" x2="${X(xmax)}" y2="${Y(y)}" stroke="var(--line)"/>`;
    if (o.axes !== false) {
      if (ymin <= 0 && ymax >= 0) g += `<line x1="${X(xmin)}" y1="${Y(0)}" x2="${X(xmax)}" y2="${Y(0)}" stroke="var(--ink-2)" stroke-width="2"/>` + T(X(xmax) + 10, Y(0) + 4, 'x', { fs: 13, w: 700 });
      if (xmin <= 0 && xmax >= 0) g += `<line x1="${X(0)}" y1="${Y(ymin)}" x2="${X(0)}" y2="${Y(ymax)}" stroke="var(--ink-2)" stroke-width="2"/>` + T(X(0), Y(ymax) - 8, 'y', { fs: 13, w: 700 });
      const lx = o.every || 1;
      for (let x = xmin; x <= xmax; x++) if (x !== 0 && x % lx === 0) g += T(X(x), Y(Math.max(ymin, Math.min(0, ymax))) + 15, U.N(x), { fs: 10, c: 'var(--ink-2)' });
      for (let y = ymin; y <= ymax; y++) if (y !== 0 && y % lx === 0) g += T(X(Math.max(xmin, Math.min(0, xmax))) - 7, Y(y) + 4, U.N(y), { fs: 10, a: 'end', c: 'var(--ink-2)' });
      if (xmin <= 0 && ymin <= 0) g += T(X(0) - 7, Y(0) + 15, '0', { fs: 10, a: 'end', c: 'var(--ink-2)' });
    }
    (o.polys || []).forEach((p) => { g += `<polygon points="${p.pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="${p.fill || 'color-mix(in srgb, var(--sc) 30%, transparent)'}" stroke="${p.stroke || 'var(--sc)'}" stroke-width="2.5" ${p.dash ? 'stroke-dasharray="6 4"' : ''}/>`; if (p.label) { const cxp = p.pts.reduce((a, q) => a + q[0], 0) / p.pts.length, cyp = p.pts.reduce((a, q) => a + q[1], 0) / p.pts.length; g += T(X(cxp), Y(cyp) + 5, p.label, { fs: 14, w: 800 }); } });
    (o.fns || []).forEach((fn) => { let d = ''; for (let i = 0; i <= 100; i++) { const x = xmin + ((xmax - xmin) * i) / 100, y = fn.f(x); if (y < ymin - 1 || y > ymax + 1) continue; d += (d ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); } g += `<path d="${d}" fill="none" stroke="${fn.color || 'var(--accent)'}" stroke-width="3"/>`; if (fn.label) g += T(X(fn.lx ?? xmax - 1), Y(fn.f(fn.lx ?? xmax - 1)) - 8, fn.label, { fs: 12, w: 700, c: fn.color || 'var(--accent)' }); });
    (o.lines || []).forEach((l) => { g += `<polyline points="${l.pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="none" stroke="${l.color || 'var(--accent)'}" stroke-width="3" ${l.dash ? 'stroke-dasharray="6 4"' : ''}/>`; });
    (o.points || []).forEach((p) => { g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5" fill="${p.color || 'var(--accent)'}"/>`; if (p.label) g += T(X(p.x) + 8, Y(p.y) - 8, p.label, { fs: 13, w: 700, a: 'start', c: p.color || 'var(--accent)' }); });
    return g + '</svg>';
  };
  // simple polygon/shape drawing with labelled sides (for area / angle questions)
  FIG.shape = function (pts, o = {}) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const sc = o.scale || Math.min(260 / (maxx - minx || 1), 170 / (maxy - miny || 1)); const pad = 40; const W = (maxx - minx) * sc + 2 * pad, H = (maxy - miny) * sc + 2 * pad;
    const X = (x) => pad + (x - minx) * sc, Y = (y) => pad + (maxy - y) * sc;
    let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><polygon points="${pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="${o.fill || 'color-mix(in srgb, var(--sc) 22%, transparent)'}" stroke="var(--sc)" stroke-width="2.5" stroke-linejoin="round"/>`;
    (o.labels || []).forEach((l) => { if (l == null) return; });
    (o.sides || []).forEach((lab, i) => { if (!lab) return; const a = pts[i], b = pts[(i + 1) % pts.length]; const mx = (X(a[0]) + X(b[0])) / 2, my = (Y(a[1]) + Y(b[1])) / 2; const cx = pts.reduce((p, q) => p + X(q[0]), 0) / pts.length, cy = pts.reduce((p, q) => p + Y(q[1]), 0) / pts.length; const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1; g += T(mx + (dx / d) * 16, my + (dy / d) * 16 + 5, lab, { fs: 13, w: 700 }); });
    (o.extra || []).forEach((e) => (g += e(X, Y)));
    return g + '</svg>';
  };
  // fraction bar figure
  FIG.fracBar = function (n, d, o = {}) {
    const W = o.w || 360, H = 46, w = (W - 4) / d; let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < d; i++) g += `<rect x="${2 + i * w}" y="4" width="${w}" height="${H - 8}" fill="${i < n ? o.color || 'var(--sc)' : 'var(--surface)'}" stroke="var(--ink-2)" stroke-width="1.5"/>`;
    return g + '</svg>';
  };
  // 10x10 percentage grid
  FIG.hundred = function (n, o = {}) {
    const c = o.c || 18; let g = `<svg viewBox="0 0 ${c * 10 + 4} ${c * 10 + 4}" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < 100; i++) { const x = 2 + (i % 10) * c, y = 2 + Math.floor(i / 10) * c; g += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${i < n ? o.color || 'var(--sc)' : 'var(--surface)'}" stroke="var(--line)"/>`; }
    return g + '</svg>';
  };
  // table html
  FIG.table = function (head, rows, o = {}) {
    return `<div class="tbl"><table>${head ? '<tr>' + head.map((x) => `<th>${x}</th>`).join('') + '</tr>' : ''}${rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 && o.rowHead ? `<th>${c}</th>` : `<td>${c}</td>`)).join('') + '</tr>').join('')}</table></div>`;
  };

  APP.VZ = VZ; APP.FIG = FIG;
})();
