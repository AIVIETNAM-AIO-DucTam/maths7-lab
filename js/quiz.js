/* Maths 7 Lab — question engine: rendering, checking, runner overlay (practice + test modes), results & scoring */
(function () {
  'use strict';
  const { h, icon, esc, U, parse, SFX, P, FX, toast, xpPop } = APP;
  const { parseNum, parseFrac, exprEqual, termCount, normText, cleanInput } = parse;

  /* ---------- resolve generators / build sets ---------- */
  function resolve(item, tag) {
    let q = item;
    if (item && item.gen) {
      let g = null;
      for (let k = 0; k < 25 && !g; k++) { try { g = item.gen(); } catch (e) { console.error('gen failed', e); g = null; } if (g && !g.type) g = null; }
      if (!g) return null;
      q = Object.assign({ src: 'new' }, g, { tag: item.tag || tag }); if (item.d && !q.d) q.d = item.d; if (item.app) q.src = 'app';
    }
    else q = Object.assign({ src: 'book' }, item, { tag: item.tag || tag });
    if (q.app && q.src !== 'book') q.src = 'app';
    return q;
  }
  // bank: [{item, tag}] ; pick n with a balance of sources
  function build(pool, n, opts = {}) {
    let items = pool.slice();
    if (opts.src === 'book') items = items.filter((p) => !p.item.gen);
    if (opts.src === 'new') items = items.filter((p) => !!p.item.gen);
    if (opts.diff) items = items.filter((p) => !p.item.d || p.item.d === opts.diff || (opts.diff === 1 && p.item.d < 2) || (opts.diff === 3 && p.item.d >= 2));
    if (!items.length) items = pool.slice();
    const gens = items.filter((p) => p.item.gen), stat = items.filter((p) => !p.item.gen);
    const out = [];
    let sh = U.shuffle(stat), gs = U.shuffle(gens), gi = 0;
    // alternate between book items and generated items to keep it varied
    while (out.length < n && (sh.length || gs.length)) {
      const takeGen = gs.length && (!sh.length || (out.length % 2 === 1) || opts.src === 'new');
      if (takeGen) { const p = gs[gi % gs.length]; gi++; const q = resolve(p.item, p.tag); if (q) out.push(q); if (gi >= gs.length * 3) gs = []; }
      else { const p = sh.shift(); const q = resolve(p.item, p.tag); if (q) out.push(q); }
      if (!sh.length && gs.length && gi > n * 4) break;
    }
    return U.shuffle(out).slice(0, n);
  }

  /* ---------- answer text for feedback ---------- */
  function ansText(q) {
    const a = q.a;
    switch (q.type) {
      case 'mcq': return q.opts[a];
      case 'multi': return a.map((i) => q.opts[i]).join(', ');
      case 'tf': return a ? 'True (Đúng)' : 'False (Sai)';
      case 'num': { const v = Array.isArray(a) ? a[0] : a; return (q.dp != null ? U.N(Number(v).toFixed(q.dp)) : U.N(v)) + (q.unit ? ' ' + q.unit : ''); }
      case 'list': return a.map((x) => U.N(x)).join(', ');
      case 'frac': return U.fracHTML(a[0], a[1], q.mixed !== false) + (q.mixed !== false && Math.abs(a[0]) > a[1] && a[1] !== 1 ? ` (= ${U.F(...U.fracSimp(a[0], a[1]))})` : '');
      case 'expr': return '<span class="m">' + esc(q.show || q.a).replace(/\*/g, '×').replace(/-/g, '−') + '</span>';
      case 'txt': return esc(Array.isArray(a) ? a[0] : a);
      case 'ratio': return a.join(' : ');
      case 'coord': return `(${U.N(a[0])}, ${U.N(a[1])})`;
      case 'fill': return a.map((x) => (x && x.opts ? x.opts[x.a] : Array.isArray(x) ? x[0] : U.N(x))).join(' ; ');
      case 'order': return a.join(' → ');
      case 'match': return a.map((p) => p[0] + ' ↔ ' + p[1]).join('<br>');
      case 'sort': return q.cats.map((c, i) => `<b>${c}:</b> ` + a.filter((it) => it[1] === i).map((it) => it[0]).join(', ')).join('<br>');
    }
    return '';
  }

  /* ---------- single value checks ---------- */
  function checkNum(given, a, tol) {
    const vals = [parseNum(given)]; const g = cleanInput(given).replace(/\s/g, '');
    if (/^-?\d+,\d+$/.test(g)) vals.push(parseFloat(g.replace(',', '.')), parseFloat(g.replace(',', ''))); // "5,376" may be vi decimal or thousands
    const list = Array.isArray(a) ? a : [a];
    return vals.some((v) => !isNaN(v) && list.some((x) => Math.abs(v - x) <= (tol != null ? tol : 1e-9 + Math.abs(x) * 1e-9)));
  }
  function dpCount(given) { const m = cleanInput(given).replace(/\s/g, '').match(/[.,](\d+)$/); return m ? m[1].length : 0; }
  function checkText(given, a) {
    const g = normText(given); const list = Array.isArray(a) ? a : [a];
    return list.some((x) => normText(x) === g || normText(x).replace(/\s/g, '') === g.replace(/\s/g, ''));
  }
  function checkBlank(given, spec) {
    if (spec && spec.opts) return String(given) === String(spec.a);
    if (typeof spec === 'number') return checkNum(given, spec);
    if (Array.isArray(spec) && typeof spec[0] === 'number') return checkNum(given, spec);
    if (spec && spec.expr) return given.trim() !== '' && safeExprEq(given, spec.expr);
    // strings: maybe numeric string
    if (typeof spec === 'string' && /^-?[\d.]+$/.test(spec)) return checkNum(given, parseFloat(spec));
    return checkText(given, spec);
  }
  function safeExprEq(a, b) { try { return exprEqual(a, b); } catch (e) { return false; } }

  /* ---------- keypad helper ---------- */
  function keypad(input, keys) {
    const kp = h('div', { class: 'keypad', 'aria-label': 'Bàn phím ký hiệu' });
    keys.forEach((k) => kp.append(h('button', { type: 'button', onclick: (e) => { e.preventDefault(); insertAt(input, k === '−' ? '-' : k); SFX.play('tap'); } }, k)));
    return kp;
  }
  function insertAt(inp, txt) {
    const s0 = inp.selectionStart ?? inp.value.length, s1 = inp.selectionEnd ?? inp.value.length;
    inp.value = inp.value.slice(0, s0) + txt + inp.value.slice(s1);
    inp.focus(); try { inp.setSelectionRange(s0 + txt.length, s0 + txt.length); } catch (e) {}
    inp.dispatchEvent(new Event('input'));
  }

  /* ---------- renderers: each returns controller {el, get(), check(), reveal(res), restore(v)} ---------- */
  const R = {};
  R.mcq = (q, ctx) => {
    const order = q.fixed ? q.opts.map((_, i) => i) : U.shuffle(q.opts.map((_, i) => i));
    let sel = null; const btns = [];
    const wrap = h('div', { class: 'opts' + (q.opts.every((o) => String(o).replace(/<[^>]+>/g, '').length < 22) && q.opts.length > 2 ? ' two' : '') });
    order.forEach((oi, k) => {
      const b = h('button', { class: 'opt', type: 'button', html: `<span class="k">${'ABCDEFGH'[k]}</span><span>${q.opts[oi]}</span>` });
      b.onclick = () => { if (ctx.locked) return; btns.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = oi; SFX.play('select'); ctx.changed(); if (ctx.instant) ctx.submit(); };
      btns.push(b); wrap.append(b);
    });
    return {
      el: wrap, instant: true,
      get: () => sel, filled: () => sel != null,
      check: () => ({ credit: sel === q.a ? 1 : 0 }),
      reveal(res) { btns.forEach((b, k) => { b.disabled = true; const oi = order[k]; if (oi === q.a) b.classList.add('right'); else if (oi === sel) b.classList.add('wrong'); }); },
      restore(v) { if (v == null) return; sel = v; const k = order.indexOf(v); if (btns[k]) btns[k].classList.add('sel'); },
      keys(e) { const k = parseInt(e.key, 10); if (k >= 1 && k <= btns.length) { btns[k - 1].click(); return true; } return false; },
    };
  };
  R.tf = (q, ctx) => {
    const qq = Object.assign({}, q, { type: 'mcq', opts: ['True — Đúng', 'False — Sai'], a: q.a ? 0 : 1, fixed: true });
    const c = R.mcq(qq, ctx); c.el.classList.add('two'); return c;
  };
  R.multi = (q, ctx) => {
    const order = U.shuffle(q.opts.map((_, i) => i)); const sel = new Set(); const btns = [];
    const wrap = h('div', { class: 'opts' }, h('div', { class: 'muted', style: { fontSize: '.85rem' } }, 'Chọn TẤT CẢ đáp án đúng'));
    order.forEach((oi, k) => {
      const b = h('button', { class: 'opt', type: 'button', html: `<span class="k">${'ABCDEFGH'[k]}</span><span>${q.opts[oi]}</span>` });
      b.onclick = () => { if (ctx.locked) return; if (sel.has(oi)) { sel.delete(oi); b.classList.remove('sel'); } else { sel.add(oi); b.classList.add('sel'); } SFX.play('select'); ctx.changed(); };
      btns.push(b); wrap.append(b);
    });
    return {
      el: wrap, get: () => [...sel], filled: () => sel.size > 0,
      check: () => { const A = new Set(q.a); const ok = sel.size === A.size && [...sel].every((x) => A.has(x)); return { credit: ok ? 1 : 0 }; },
      reveal() { btns.forEach((b, k) => { b.disabled = true; const oi = order[k]; if (q.a.includes(oi)) b.classList.add('right'); else if (sel.has(oi)) b.classList.add('wrong'); }); },
      restore(v) { (v || []).forEach((oi) => { sel.add(oi); const k = order.indexOf(oi); btns[k] && btns[k].classList.add('sel'); }); },
    };
  };
  function textInput(q, ctx, kind) {
    const keysByKind = { num: ['−', '.', '/'], list: ['−', ',', '.'], frac: ['/', '−', ' '], expr: ['x', 'y', 'n', '+', '−', '(', ')', '²', '/'], ratio: [':'], coord: ['(', ',', ')', '−'], txt: [] };
    const inp = h('input', { class: 'ain', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: kind === 'num' && !q.neg ? 'decimal' : 'text', 'aria-label': 'Câu trả lời', placeholder: q.ph || ({ num: 'Nhập số…', list: 'vd: 2, 4, 6', frac: 'vd: 3/4 hoặc 1 1/2', expr: 'vd: 3x + 2', ratio: 'vd: 2:3', coord: 'vd: (2, −3)', txt: 'Nhập câu trả lời…' }[kind]) });
    inp.addEventListener('input', () => ctx.changed());
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ctx.submit(); } });
    const row = h('div', { class: 'ansrow' }, q.pre ? h('span', { class: 'unit-lbl', html: q.pre }) : null, inp, q.unit ? h('span', { class: 'unit-lbl', html: q.unit }) : null);
    const kk = q.keys || keysByKind[kind];
    const el = h('div', {}, row, kk && kk.length ? keypad(inp, kk) : null);
    setTimeout(() => { if (!('ontouchstart' in window)) inp.focus(); }, 60);
    return { el, inp };
  }
  R.num = (q, ctx) => {
    const { el, inp } = textInput(q, ctx, 'num');
    return { el, get: () => inp.value, filled: () => inp.value.trim() !== '', check: () => ({ credit: checkNum(inp.value, q.a, q.tol) && (q.dp == null || dpCount(inp.value) === q.dp) ? 1 : 0 }),
      reveal(r) { inp.disabled = true; inp.classList.add(r.credit ? 'right' : 'wrong'); }, restore(v) { if (v != null) inp.value = v; } };
  };
  R.list = (q, ctx) => {
    const { el, inp } = textInput(q, ctx, 'list');
    const chk = () => {
      const vals = cleanInput(inp.value).split(/[,;]|\s+(?=[-\d])/).map((x) => x.trim()).filter(Boolean).map(parseNum);
      if (vals.some(isNaN)) return 0;
      const A = q.a.slice(); if (q.ordered) return vals.length === A.length && vals.every((v, i) => Math.abs(v - A[i]) < 1e-9) ? 1 : 0;
      const sa = A.slice().sort((x, y) => x - y), sv = vals.slice().sort((x, y) => x - y);
      return sv.length === sa.length && sv.every((v, i) => Math.abs(v - sa[i]) < 1e-9) ? 1 : 0;
    };
    return { el, get: () => inp.value, filled: () => inp.value.trim() !== '', check: () => ({ credit: chk() }), reveal(r) { inp.disabled = true; inp.classList.add(r.credit ? 'right' : 'wrong'); }, restore(v) { if (v != null) inp.value = v; } };
  };
  R.frac = (q, ctx) => {
    const { el, inp } = textInput(q, ctx, 'frac');
    const chk = () => {
      const f = parseFrac(inp.value); if (!f || f[1] === 0) return 0;
      const [n, d] = q.a; if (f[0] * d !== n * f[1]) return 0;
      if (q.simplest) { const isMixed = /\d\s+\d+\s*\//.test(cleanInput(inp.value)); let num = f[0], den = f[1]; if (isMixed) { const m = cleanInput(inp.value).match(/(\d+)\s*\/\s*(\d+)$/); num = +m[1]; den = +m[2]; } if (U.gcd(num, den) !== 1) return 0; }
      return 1;
    };
    return { el, get: () => inp.value, filled: () => inp.value.trim() !== '', check: () => ({ credit: chk() }), reveal(r) { inp.disabled = true; inp.classList.add(r.credit ? 'right' : 'wrong'); }, restore(v) { if (v != null) inp.value = v; } };
  };
  R.expr = (q, ctx) => {
    const { el, inp } = textInput(q, ctx, 'expr');
    const chk = () => {
      const v = inp.value.trim(); if (!v) return 0;
      const alts = Array.isArray(q.a) ? q.a : [q.a];
      if (!alts.some((a) => safeExprEq(v, a))) return 0;
      if (q.simplified) { const tc = termCount(v), ta = Math.min(...alts.map(termCount)); if (tc > ta) return 0; if (/\(/.test(v) && !alts.some((a) => /\(/.test(a))) return 0; }
      if (q.factorised && !/\(/.test(v)) return 0;
      return 1;
    };
    return { el, get: () => inp.value, filled: () => inp.value.trim() !== '', check: () => ({ credit: chk() }), reveal(r) { inp.disabled = true; inp.classList.add(r.credit ? 'right' : 'wrong'); }, restore(v) { if (v != null) inp.value = v; } };
  };
  R.txt = (q, ctx) => {
    const { el, inp } = textInput(q, ctx, 'txt');
    return { el, get: () => inp.value, filled: () => inp.value.trim() !== '', check: () => ({ credit: checkText(inp.value, q.a) ? 1 : 0 }), reveal(r) { inp.disabled = true; inp.classList.add(r.credit ? 'right' : 'wrong'); }, restore(v) { if (v != null) inp.value = v; } };
  };
  R.ratio = (q, ctx) => {
    const { el, inp } = textInput(q, ctx, 'ratio');
    const chk = () => {
      const parts = cleanInput(inp.value).split(':').map((x) => parseNum(x)); if (parts.length !== q.a.length || parts.some(isNaN)) return 0;
      if (q.simplest) return parts.every((p, i) => Math.abs(p - q.a[i]) < 1e-9) ? 1 : 0;
      const k = parts[0] / q.a[0]; return parts.every((p, i) => Math.abs(p - q.a[i] * k) < 1e-9) ? 1 : 0;
    };
    return { el, get: () => inp.value, filled: () => inp.value.trim() !== '', check: () => ({ credit: chk() }), reveal(r) { inp.disabled = true; inp.classList.add(r.credit ? 'right' : 'wrong'); }, restore(v) { if (v != null) inp.value = v; } };
  };
  R.coord = (q, ctx) => {
    const { el, inp } = textInput(q, ctx, 'coord');
    const chk = () => { const m = cleanInput(inp.value).replace(/[()]/g, '').split(/[,;]/).map((x) => parseNum(x)); return m.length === 2 && Math.abs(m[0] - q.a[0]) < 1e-9 && Math.abs(m[1] - q.a[1]) < 1e-9 ? 1 : 0; };
    return { el, get: () => inp.value, filled: () => inp.value.trim() !== '', check: () => ({ credit: chk() }), reveal(r) { inp.disabled = true; inp.classList.add(r.credit ? 'right' : 'wrong'); }, restore(v) { if (v != null) inp.value = v; } };
  };
  R.fill = (q, ctx) => {
    // blanks are written as [] in q.f (fill text). q.q remains the instruction.
    const parts = String(q.f || '').split('[]'); const inputs = [];
    const wrap = h('div', { class: 'fillq', html: parts.map((p, i) => p + (i < parts.length - 1 ? `<span data-blank="${i}"></span>` : '')).join('') });
    parts.forEach((p, i) => {
      if (i < parts.length - 1) {
        const spec = q.a[i]; let inp;
        if (spec && spec.opts) { inp = h('select', { 'aria-label': 'Chỗ trống ' + (i + 1) }, h('option', { value: '' }, '…'), (q.fixed || spec.fixed ? spec.opts.map((_, k) => k) : U.shuffle(spec.opts.map((_, k) => k))).map((k) => h('option', { value: k, html: spec.opts[k] }))); inp.onchange = () => { ctx.changed(); SFX.play('select'); }; }
        else { inp = h('input', { type: 'text', autocomplete: 'off', inputmode: typeof spec === 'number' ? 'decimal' : 'text', 'aria-label': 'Chỗ trống ' + (i + 1) }); inp.oninput = () => ctx.changed(); inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); const nx = inputs[i + 1]; if (nx) nx.focus(); else ctx.submit(); } }; if (typeof spec === 'number' && spec < 0 || q.neg) inp.inputMode = 'text'; }
        inputs.push(inp); const ph = wrap.querySelector(`[data-blank="${i}"]`); if (ph) ph.replaceWith(inp); else wrap.append(inp);
      }
    });
    return {
      el: wrap, get: () => inputs.map((i) => i.value), filled: () => inputs.every((i) => String(i.value).trim() !== ''),
      check: () => { const ok = inputs.map((inp, i) => checkBlank(inp.value, q.a[i])); return { credit: ok.filter(Boolean).length / ok.length, each: ok }; },
      reveal(r) { inputs.forEach((inp, i) => { inp.disabled = true; inp.classList.add(r.each[i] ? 'right' : 'wrong'); }); },
      restore(v) { (v || []).forEach((x, i) => { if (inputs[i]) inputs[i].value = x; }); },
    };
  };
  R.order = (q, ctx) => {
    const items = q.a.map((t, i) => ({ t, i })); let pool = U.shuffle(items); if (pool.every((p, k) => p.i === k) && pool.length > 1) pool.reverse();
    let chosen = [];
    const poolEl = h('div', { class: 'pool' }), tgtEl = h('div', { class: 'target' });
    const draw = () => {
      poolEl.innerHTML = ''; tgtEl.innerHTML = '';
      if (!chosen.length) tgtEl.append(h('span', { class: 'muted', style: { fontSize: '.85rem', alignSelf: 'center' } }, 'Chạm vào các thẻ bên dưới theo đúng thứ tự…'));
      chosen.forEach((it, k) => tgtEl.append(h('button', { class: 'tile', type: 'button', html: `<span class="n">${k + 1}</span>${it.t}`, onclick: () => { if (ctx.locked) return; chosen.splice(k, 1); pool.push(it); SFX.play('drop'); draw(); ctx.changed(); } })));
      pool.forEach((it, k) => poolEl.append(h('button', { class: 'tile', type: 'button', html: it.t, onclick: () => { if (ctx.locked) return; pool.splice(k, 1); chosen.push(it); SFX.play('pop'); draw(); ctx.changed(); } })));
    };
    draw();
    const el = h('div', { class: 'stack' }, h('div', { class: 'muted', style: { fontSize: '.85rem' }, text: q.hintOrder || 'Thứ tự của bạn:' }), tgtEl, poolEl);
    return {
      el, get: () => chosen.map((c) => c.i), filled: () => pool.length === 0,
      check: () => { const ok = chosen.length === items.length && chosen.every((c, k) => c.i === k || q.a[c.i] === q.a[k]); return { credit: ok ? 1 : 0 }; },
      reveal(r) { [...tgtEl.children].forEach((b, k) => { b.disabled = true; const c = chosen[k]; if (c) b.classList.add(c.i === k || q.a[c.i] === q.a[k] ? 'right' : 'wrong'); }); },
      restore(v) { if (!v) return; chosen = v.map((i) => items[i]); pool = items.filter((it) => !v.includes(it.i)); draw(); },
    };
  };
  R.match = (q, ctx) => {
    const L = q.a.map((p, i) => ({ t: p[0], i })), Rr = U.shuffle(q.a.map((p, i) => ({ t: p[1], i })));
    const pairs = {}; let active = null; const lb = [], rb = [];
    const colors = ['--number', '--algebra', '--geometry', '--stats', '--accent', '--bad', '--warn', '--good'];
    const paint = () => {
      lb.forEach((b, k) => { const li = L[k].i; const r = pairs[li]; b.classList.toggle('on', active === li); b.querySelector('.n').textContent = r != null ? Object.keys(pairs).indexOf(String(li)) + 1 : '·'; b.style.borderColor = r != null ? `var(${colors[Object.keys(pairs).indexOf(String(li)) % colors.length]})` : ''; });
      rb.forEach((b, k) => { const ri = Rr[k].i; const li = Object.keys(pairs).find((x) => pairs[x] === ri); b.querySelector('.n').textContent = li != null ? Object.keys(pairs).indexOf(li) + 1 : '·'; b.style.borderColor = li != null ? `var(${colors[Object.keys(pairs).indexOf(li) % colors.length]})` : ''; });
    };
    const left = h('div', { class: 'col' }), right = h('div', { class: 'col' });
    L.forEach((it) => { const b = h('button', { class: 'tile', type: 'button', html: `<span class="n">·</span>${it.t}` }); b.onclick = () => { if (ctx.locked) return; active = it.i; SFX.play('select'); paint(); }; lb.push(b); left.append(b); });
    Rr.forEach((it) => { const b = h('button', { class: 'tile', type: 'button', html: `<span class="n">·</span>${it.t}` }); b.onclick = () => { if (ctx.locked || active == null) { if (active == null && !ctx.locked) toast('Chọn một ô bên trái trước nhé'); return; } for (const k in pairs) if (pairs[k] === it.i) delete pairs[k]; pairs[active] = it.i; active = null; SFX.play('pop'); paint(); ctx.changed(); }; rb.push(b); right.append(b); });
    paint();
    return {
      el: h('div', {}, h('div', { class: 'muted', style: { fontSize: '.85rem', marginBottom: '8px' } }, 'Chạm một ô bên trái, rồi chạm ô tương ứng bên phải.'), h('div', { class: 'match' }, left, right)),
      get: () => Object.assign({}, pairs), filled: () => Object.keys(pairs).length === L.length,
      check: () => { let c = 0; L.forEach((it) => { const r = pairs[it.i]; if (r != null && (r === it.i || q.a[r][1] === q.a[it.i][1])) c++; }); return { credit: c / L.length }; },
      reveal() { lb.forEach((b, k) => { b.disabled = true; const li = L[k].i; const r = pairs[li]; b.classList.add(r != null && (r === li || q.a[r][1] === q.a[li][1]) ? 'right' : 'wrong'); }); rb.forEach((b) => (b.disabled = true)); },
      restore(v) { if (v) { Object.assign(pairs, v); paint(); } },
    };
  };
  R.sort = (q, ctx) => {
    const items = U.shuffle(q.a.map((it, i) => ({ t: it[0], c: it[1], i }))); const place = {}; let active = null;
    const poolEl = h('div', { class: 'pool' }); const bks = q.cats.map((c, ci) => h('div', { class: 'bucket', onclick: () => { if (ctx.locked || active == null) return; place[active] = ci; active = null; SFX.play('drop'); draw(); ctx.changed(); } }, h('h5', { html: c })));
    const draw = () => {
      poolEl.innerHTML = ''; bks.forEach((b) => { [...b.querySelectorAll('.tile')].forEach((t) => t.remove()); b.classList.toggle('hot', active != null); });
      items.forEach((it) => {
        const t = h('button', { class: 'tile' + (active === it.i ? ' on' : ''), type: 'button', html: it.t, onclick: (e) => { e.stopPropagation(); if (ctx.locked) return; active = active === it.i ? null : it.i; SFX.play('select'); draw(); } });
        if (place[it.i] != null) bks[place[it.i]].append(t); else poolEl.append(t);
      });
      if (!poolEl.children.length) poolEl.append(h('span', { class: 'muted', style: { fontSize: '.85rem' } }, 'Đã xếp hết. Chạm vào một thẻ để chuyển nhóm.'));
    };
    draw();
    return {
      el: h('div', {}, h('div', { class: 'muted', style: { fontSize: '.85rem', marginBottom: '8px' } }, 'Chạm một thẻ, rồi chạm vào nhóm phù hợp.'), poolEl, h('div', { class: 'buckets' }, bks)),
      get: () => Object.assign({}, place), filled: () => Object.keys(place).length === items.length,
      check: () => { let c = 0; items.forEach((it) => { if (place[it.i] === it.c) c++; }); return { credit: c / items.length }; },
      reveal() { bks.forEach((b) => b.querySelectorAll('.tile').forEach((t) => { const it = items.find((x) => x.t === t.innerHTML); t.disabled = true; if (it) t.classList.add(place[it.i] === it.c ? 'right' : 'wrong'); })); },
      restore(v) { if (v) { Object.assign(place, v); draw(); } },
    };
  };

  function renderQuestion(q, ctx) {
    const f = R[q.type] || R.txt; return f(q, ctx);
  }

  /* ---------- runner ---------- */
  const add = (el, ...k) => el.append(...k.filter((x) => x != null && x !== false));
  function srcPill(q) {
    if (q.src === 'book') return `<span class="pill book">${icon('book')} Sách</span>`;
    if (q.src === 'app') return `<span class="pill app">${icon('target')} Ứng dụng</span>`;
    return `<span class="pill new">${icon('spark')} Bài mới</span>`;
  }
  function fmtTime(s) { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  function run(cfg) {
    // cfg: {title, qs, mode:'practice'|'test', time (sec), key, sc (strand class), regen(), onDone(res)}
    const qs = cfg.qs.filter(Boolean); if (!qs.length) { toast('Chưa có câu hỏi cho phần này.'); return; }
    const mode = cfg.mode || 'practice';
    const st = { i: 0, ans: qs.map(() => ({ v: null, credit: null, hint: false, xp: 0 })), combo: 0, best: 0, xp: 0, t0: Date.now(), left: cfg.time || 0, done: false };
    let ctl = null, timerId = 0;
    const prev = document.activeElement;
    document.body.classList.add('lock');
    const ov = h('div', { class: 'overlay ' + (cfg.sc || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': cfg.title });
    const timerEl = h('span', { class: 'timer', hidden: !cfg.time });
    const closeBtn = h('button', { class: 'ibtn', 'aria-label': 'Đóng', html: icon('close'), onclick: () => askClose() });
    const top = h('div', { class: 'qr-top' }, closeBtn, h('div', { class: 'ttl' }, cfg.title), h('span', { class: 'spacer' }), timerEl);
    const prog = h('div', { class: 'qr-prog' }, qs.map(() => h('i')));
    const body = h('div', { class: 'qr-body' });
    const foot = h('div', { class: 'qr-foot' }); const footIn = h('div', { class: 'in' }); foot.append(footIn);
    ov.append(top, prog, body, foot); document.body.append(ov);
    SFX.play('open');

    function askClose() {
      if (st.done || st.ans.every((a) => a.v == null)) return close();
      footIn.innerHTML = '';
      add(footIn, h('div', { class: 'fb' }, h('h4', {}, 'Thoát bài làm?'), h('div', { class: 'ex' }, 'Kết quả của lượt này sẽ không được lưu.')),
        h('button', { class: 'btn', onclick: () => show(st.i) }, 'Tiếp tục làm'), h('button', { class: 'btn ink', onclick: close }, 'Thoát'));
    }
    function close() { if (ov._closed) return; ov._closed = true; clearInterval(timerId); ov.classList.add('ov-out'); setTimeout(() => { ov.remove(); if (!document.querySelector('.overlay')) document.body.classList.remove('lock'); prev && prev.focus && prev.focus(); }, 240); document.removeEventListener('keydown', onKey); window.removeEventListener('hashchange', close); }
    window.addEventListener('hashchange', close);
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); askClose(); return; }
      if (st.done) return;
      if (ctl && ctl.keys && !ctx.locked && document.activeElement.tagName !== 'INPUT' && ctl.keys(e)) e.preventDefault();
      if (e.key === 'Enter' && ctx.locked && mode === 'practice' && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); next(); }
    }
    document.addEventListener('keydown', onKey);
    if (cfg.time) {
      timerEl.textContent = fmtTime(st.left);
      timerId = setInterval(() => {
        st.left--; timerEl.textContent = fmtTime(st.left);
        if (st.left <= 30) { timerEl.classList.add('low'); if (st.left <= 10) SFX.play('tick'); }
        if (st.left <= 0) { clearInterval(timerId); toast('Hết giờ! Bài làm đã được nộp.'); finish(); }
      }, 1000);
    }

    const ctx = { locked: false, instant: mode === 'practice', changed: () => updateFoot(), submit: () => submit() };

    function paintProg() {
      [...prog.children].forEach((b, k) => {
        const a = st.ans[k]; b.className = '';
        if (mode === 'practice' && a.credit != null) b.className = a.credit >= 1 ? 'ok' : 'no';
        else if (mode === 'test' && a.v != null && (!Array.isArray(a.v) || a.v.some((x) => x !== '' && x != null))) b.className = 'ans';
        if (k === st.i && !st.done) b.className += ' cur';
      });
    }
    function show(i) {
      st.i = i; ctx.locked = false; const q = qs[i], a = st.ans[i];
      body.innerHTML = ''; body.scrollTop = 0;
      const card = h('div', { class: 'card qr-card' });
      const meta = h('div', { class: 'qr-meta', html: `<span class="pill">Câu ${i + 1}/${qs.length}</span>${srcPill(q)}${q.tag ? `<span class="pill sc">${esc(q.tag)}</span>` : ''}` });
      if (mode === 'practice' && st.combo >= 2) meta.append(h('span', { class: 'combo', html: `${icon('fire', '')} Chuỗi ×${st.combo}`.replace('<svg', '<svg style="width:16px;height:16px;vertical-align:-3px"') }));
      card.append(meta, h('div', { class: 'qtext', 'data-tr': '', html: q.q }));
      if (q.fig) card.append(h('div', { class: 'qfig', html: typeof q.fig === 'function' ? q.fig() : q.fig }));
      ctl = renderQuestion(q, ctx);
      card.append(h('div', { class: 'qin' }, ctl.el));
      if (a.hint) card.append(h('div', { class: 'hintbox', html: '<b>Gợi ý:</b> ' + hintFor(q) }));
      body.append(card);
      if (mode === 'test') {
        ctl.restore(a.v);
        body.append(h('div', { class: 'qnav' }, qs.map((_, k) => h('button', { class: (st.ans[k].v != null ? 'done' : '') + (k === i ? ' cur' : ''), onclick: () => { save(); show(k); }, 'aria-label': 'Câu ' + (k + 1) }, k + 1))));
      }
      if (mode === 'practice' && a.credit != null) { ctx.locked = true; ctl.restore(a.v); ctl.reveal(a.res); }
      paintProg(); updateFoot();
    }
    function hintFor(q) {
      if (q.hint) return q.hint;
      const t = { num: 'Viết phép tính ra từng bước, chú ý dấu âm/dương.', frac: 'Quy đồng mẫu số hoặc rút gọn bằng ƯCLN (HCF).', expr: 'Gom các hạng tử đồng dạng (like terms) lại với nhau.', mcq: 'Loại trừ các phương án chắc chắn sai trước.', tf: 'Thử với một ví dụ cụ thể để kiểm tra.', order: 'Tìm phần tử nhỏ nhất (hoặc bước đầu tiên) trước.', match: 'Ghép những cặp chắc chắn nhất trước.', sort: 'Đọc kỹ tên từng nhóm.' };
      return t[q.type] || 'Đọc lại phần lý thuyết của mục này nhé.';
    }
    function hasAny(v) { if (v == null) return false; if (typeof v === 'string') return v.trim() !== ''; if (typeof v === 'number') return true; if (Array.isArray(v)) return v.some((x) => x != null && String(x).trim() !== ''); return Object.keys(v).length > 0; }
    function save() { if (ctl && !st.done && mode === 'test') { const v = ctl.get(); st.ans[st.i].v = hasAny(v) ? v : null; } }
    function updateFoot() {
      if (st.done) return;
      footIn.innerHTML = ''; foot.className = 'qr-foot';
      const a = st.ans[st.i];
      if (mode === 'practice') {
        if (ctx.locked) return feedback();
        const hintB = h('button', { class: 'btn ghost', html: icon('hint') + 'Gợi ý', onclick: () => { if (!a.hint) { a.hint = true; SFX.play('pop'); show(st.i); } } });
        const chk = h('button', { class: 'btn pri', html: 'Kiểm tra ' + icon('arrowR'), disabled: !(ctl && ctl.filled()), onclick: submit });
        const skip = h('button', { class: 'btn ghost sm', onclick: () => { a.v = null; a.credit = 0; a.res = { credit: 0 }; a.skipped = true; st.combo = 0; ctx.locked = true; ctl.reveal({ credit: 0, each: [] }); SFX.play('wrong'); paintProg(); updateFoot(); } }, 'Bỏ qua');
        add(footIn, hintB, h('span', { class: 'spacer' }), skip, ctl && ctl.instant ? null : chk);
        if (ctl && ctl.instant) add(footIn, h('span', { class: 'muted', style: { fontSize: '.85rem' } }, 'Chọn một đáp án'));
      } else {
        const prevB = h('button', { class: 'btn ghost', html: icon('arrowL'), 'aria-label': 'Câu trước', disabled: st.i === 0, onclick: () => { save(); show(st.i - 1); } });
        const nextB = st.i < qs.length - 1 ? h('button', { class: 'btn ink', html: 'Câu tiếp ' + icon('arrowR'), onclick: () => { save(); show(st.i + 1); } }) : null;
        const sub = h('button', { class: 'btn pri', html: icon('check') + 'Nộp bài', onclick: () => { save(); confirmSubmit(); } });
        const answered = st.ans.filter((x) => x.v != null).length + (st.ans[st.i].v == null && ctl && ctl.filled() ? 1 : 0);
        add(footIn, prevB, h('span', { class: 'muted', style: { fontSize: '.85rem' } }, `Đã làm ${answered}/${qs.length}`), h('span', { class: 'spacer' }), nextB, sub);
      }
    }
    function confirmSubmit() {
      const blank = st.ans.filter((x) => x.v == null).length;
      footIn.innerHTML = '';
      add(footIn, h('div', { class: 'fb' }, h('h4', {}, 'Nộp bài ngay?'), h('div', { class: 'ex' }, blank ? `Bạn còn ${blank} câu chưa làm.` : 'Bạn đã làm tất cả các câu.')),
        h('button', { class: 'btn', onclick: () => updateFoot() }, 'Xem lại'), h('button', { class: 'btn pri', onclick: finish }, 'Nộp bài'));
    }
    function submit() {
      if (mode !== 'practice' || ctx.locked || !ctl || !ctl.filled()) return;
      const a = st.ans[st.i]; const res = ctl.check(); a.v = ctl.get(); a.credit = res.credit; a.res = res;
      ctx.locked = true; ctl.reveal(res);
      if (res.credit >= 1) {
        st.combo++; st.best = Math.max(st.best, st.combo);
        const mult = 1 + Math.min(st.combo - 1, 5) * 0.2; a.xp = Math.round(10 * mult * (a.hint ? 0.5 : 1) * (qs[st.i].d === 3 ? 1.5 : 1)); st.xp += a.xp;
        SFX.play(st.combo >= 3 && st.combo % 3 === 0 ? 'combo' : 'correct');
        const r = foot.getBoundingClientRect(); xpPop(r.left + r.width / 2 - 30, r.top - 10, '+' + a.xp + ' XP');
      } else { a.xp = Math.round(10 * res.credit * 0.5); st.xp += a.xp; st.combo = 0; SFX.play('wrong'); if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) {} }
      paintProg(); updateFoot();
    }
    function feedback() {
      const a = st.ans[st.i], q = qs[st.i]; const ok = a.credit >= 1;
      foot.className = 'qr-foot ' + (ok ? 'ok' : 'no');
      const msgs = ok ? ['Chính xác!', 'Tuyệt vời!', 'Quá đỉnh!', 'Chuẩn luôn!', 'Xuất sắc!'] : a.credit > 0 ? ['Gần đúng rồi!'] : a.skipped ? ['Đã bỏ qua'] : ['Chưa đúng rồi', 'Sai một chút thôi', 'Cố lên nào!'];
      const fb = h('div', { class: 'fb ' + (ok ? 'ok' : 'no') }, h('h4', { html: icon(ok ? 'check' : 'x').replace('<svg', '<svg style="width:22px;height:22px"') + U.pick(msgs) + (a.xp ? ` <span class="pill">+${a.xp} XP</span>` : '') }),
        h('div', { class: 'ex', 'data-tr': '', html: (ok ? '' : '<b>Đáp án:</b> ' + ansText(q) + '<br>') + (q.ex || '') }));
      const nx = h('button', { class: 'btn ' + (ok ? 'pri' : 'ink'), html: (st.i < qs.length - 1 ? 'Tiếp tục ' : 'Xem kết quả ') + icon('arrowR'), onclick: next });
      add(footIn, fb, nx); setTimeout(() => nx.focus(), 50);
    }
    function next() { if (st.i < qs.length - 1) { SFX.play('whoosh'); show(st.i + 1); } else finish(); }
    function finish() {
      if (st.done) return; st.done = true; clearInterval(timerId);
      if (mode === 'test') {
        st.ans.forEach((a, k) => {
          // re-render silently to check stored answers
          if (a.v == null) { a.credit = 0; return; }
          const tmp = renderQuestion(qs[k], { locked: false, changed() {}, submit() {} }); tmp.restore(a.v); const r = tmp.check(); a.credit = r.credit; a.res = r;
          a.xp = Math.round((r.credit >= 1 ? 12 : 12 * r.credit * 0.5) * (qs[k].d === 3 ? 1.5 : 1)); st.xp += a.xp;
        });
      }
      results();
    }
    function results() {
      const total = qs.length, score = st.ans.reduce((p, a) => p + (a.credit || 0), 0), pct = Math.round((score / total) * 100);
      const stars = pct >= 100 ? 3 : pct >= 75 ? 2 : pct >= 50 ? 1 : 0; const secs = (Date.now() - st.t0) / 1000;
      const bonus = stars * 10; st.xp += bonus;
      const lvBefore = P.level().lv; P.addXP(st.xp); const lvAfter = P.level().lv;
      const prevBest = cfg.key ? P.record(cfg.key, pct, { n: total, mode }) : null;
      foot.remove(); prog.remove(); timerEl.hidden = true;
      body.innerHTML = ''; body.style.paddingBottom = '40px';
      const msg = pct >= 90 ? 'Xuất sắc! Bạn nắm rất chắc kiến thức.' : pct >= 75 ? 'Rất tốt! Chỉ còn vài chỗ cần xem lại.' : pct >= 50 ? 'Khá ổn! Ôn lại các câu sai để tiến bộ hơn.' : 'Đừng nản! Xem lại lý thuyết rồi thử lại nhé.';
      const ringEl = ring(pct, 130, 12);
      const res = h('div', { class: 'res' },
        h('div', { class: 'card res-top' }, ringEl,
          h('div', {},
            h('div', { class: 'stars', html: [0, 1, 2].map((k) => `<span class="${k < stars ? '' : 'off'}">★</span>`).join('') }),
            h('h2', {}, msg),
            prevBest != null ? h('div', { class: 'muted', style: { fontSize: '.88rem' } }, pct > prevBest ? `Kỷ lục mới! (trước đó ${prevBest}%)` : `Kỷ lục của bạn: ${Math.max(prevBest, pct)}%`) : null,
            h('div', { class: 'res-kpis' },
              kpi(`${+score.toFixed(1)}/${total}`, 'Điểm'), kpi('+' + st.xp, 'XP nhận được'), kpi(fmtTime(secs), 'Thời gian'), kpi(mode === 'practice' ? '×' + st.best : (pct / 10).toFixed(1), mode === 'practice' ? 'Chuỗi dài nhất' : 'Thang 10')))),
        breakdown(), review(),
        h('div', { class: 'row', style: { justifyContent: 'center', paddingBottom: '20px' } },
          cfg.regen ? h('button', { class: 'btn pri', html: icon('shuffle') + 'Làm đề mới', onclick: () => { close(); setTimeout(() => run(Object.assign({}, cfg, { qs: cfg.regen() })), 260); } }) : null,
          st.ans.some((a) => a.credit < 1) ? h('button', { class: 'btn ink', html: icon('replay') + 'Làm lại câu sai', onclick: () => { const wrong = qs.filter((_, k) => st.ans[k].credit < 1); close(); setTimeout(() => run(Object.assign({}, cfg, { qs: wrong, title: cfg.title + ' · câu sai', key: null, mode: 'practice', time: 0, regen: null })), 260); } }) : null,
          h('button', { class: 'btn ghost', onclick: close }, 'Đóng')));
      body.append(res);
      SFX.play(pct >= 50 ? 'complete' : 'whoosh');
      if (pct >= 75) setTimeout(() => FX.burst(innerWidth / 2, innerHeight / 3, pct === 100 ? 160 : 90), 300);
      if (lvAfter > lvBefore) setTimeout(() => { SFX.play('level'); toast(`Lên cấp ${lvAfter}: ${APP.LEVEL_NAMES[Math.min(lvAfter - 1, APP.LEVEL_NAMES.length - 1)]}!`, 3500); FX.burst(innerWidth / 2, 80, 120); }, 1200);
      APP.emit('progress');
      cfg.onDone && cfg.onDone({ pct, score, total, xp: st.xp });
    }
    function kpi(v, l) { return h('div', { class: 'kpi' }, h('b', {}, v), h('span', {}, l)); }
    function breakdown() {
      const tags = {}; qs.forEach((q, k) => { const t = q.tag || 'Chung'; (tags[t] = tags[t] || { n: 0, c: 0 }); tags[t].n++; tags[t].c += st.ans[k].credit || 0; });
      const keys = Object.keys(tags); if (keys.length < 2) return null;
      const el = h('div', { class: 'card brk' }, h('h3', { style: { fontSize: '1rem', marginBottom: '6px' } }, 'Theo từng mục'));
      keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).forEach((t) => { const p = Math.round((tags[t].c / tags[t].n) * 100); const bar = h('i', { style: { width: '0%' } }); el.append(h('div', { class: 'r' }, h('span', {}, t), h('div', { class: 'b' }, bar), h('b', { class: 'mono' }, p + '%'))); setTimeout(() => (bar.style.width = p + '%'), 100); });
      return el;
    }
    function review() {
      const el = h('div', { class: 'stack' }, h('h3', { style: { fontSize: '1.05rem' } }, 'Xem lại bài làm'));
      qs.forEach((q, k) => {
        const a = st.ans[k]; const ok = a.credit >= 1;
        el.append(h('div', { class: 'card rev' + (ok ? '' : ' no') },
          h('div', { class: 'q', 'data-tr': '', html: `<span class="pill">${k + 1}</span> ${q.q}` }),
          q.fig ? h('div', { class: 'qfig', html: typeof q.fig === 'function' ? q.fig() : q.fig }) : null,
          h('div', { class: 'a', html: (ok ? '<b style="color:var(--good)">✓ Đúng</b>' : `<b style="color:var(--bad)">✗ ${a.v == null ? 'Chưa làm' : a.credit > 0 ? 'Đúng một phần' : 'Sai'}</b>`) + ` · Đáp án: ${ansText(q)}` }),
          q.ex ? h('div', { class: 'ex', 'data-tr': '', html: q.ex }) : null));
      });
      return el;
    }
    show(0);
    return { close };
  }

  function ring(pct, size = 120, sw = 10, label) {
    const r = (size - sw) / 2, c = 2 * Math.PI * r;
    const col = pct >= 75 ? 'var(--good)' : pct >= 50 ? 'var(--accent-2)' : 'var(--bad)';
    const el = h('div', { class: 'ring', style: { position: 'relative', width: size + 'px', height: size + 'px' } });
    el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}"/><circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><b class="rv" style="font-family:var(--f-display);font-size:${size / 4.2}px;line-height:1">0</b><b style="font-family:var(--f-display);font-size:${size / 7}px">%</b>${label ? `<div style="font-size:.72rem;opacity:.8">${label}</div>` : ''}</div></div>`;
    requestAnimationFrame(() => setTimeout(() => { el.querySelector('.fg').style.strokeDashoffset = c * (1 - pct / 100); APP.countUp(el.querySelector('.rv'), pct, 1100); }, 60));
    return el;
  }

  /* ---------- inline question block (for reading / listening pages) ---------- */
  function inlineSet(container, qs, opts = {}) {
    // renders each question inline with its own controls; one "Nộp bài" for the set
    const items = qs.map((q, k) => {
      const ctx = { locked: false, instant: false, changed() {}, submit() {} };
      const c = renderQuestion(q, ctx);
      const fb = h('div', { class: 'fbk' });
      const el = h('div', { class: 'qi' }, h('div', { class: 'qq', 'data-tr': '', html: `${k + 1}. ${q.q}` }), c.el, fb);
      container.append(el);
      return { q, c, ctx, fb };
    });
    return {
      grade() {
        let score = 0;
        items.forEach((it) => { const r = it.c.check(); it.ctx.locked = true; it.c.reveal(r); score += r.credit; it.fb.className = 'fbk ' + (r.credit >= 1 ? 'ok' : 'no'); it.fb.innerHTML = (r.credit >= 1 ? '✓ Chính xác. ' : '✗ Đáp án: ' + ansText(it.q) + '. ') + (it.q.ex || ''); });
        return { score, total: items.length };
      },
    };
  }

  APP.QZ = { build, resolve, run, ring, ansText, renderQuestion, inlineSet, fmtTime };
})();
