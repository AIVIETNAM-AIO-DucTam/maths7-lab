/* Maths 7 Lab — tap a word to see Vietnamese: built-in dictionary + phrase lookup, sentence translation via Claude when available */
(function () {
  'use strict';
  const { h, icon, esc, store, SFX, Speech, AI, toast } = APP;
  const TR = { on: store.get('tr', true), dict: {}, phrases: {}, cache: {} };
  APP.TR = TR;
  TR.add = function (obj) { for (const k in obj) { const key = k.toLowerCase(); if (key.includes(' ')) TR.phrases[key] = obj[k]; else TR.dict[key] = obj[k]; } };

  // simple English lemmatiser for dictionary lookup
  function lemmas(w) {
    const out = [w];
    const add = (x) => { if (x && x.length > 1 && !out.includes(x)) out.push(x); };
    if (w.endsWith("'s")) add(w.slice(0, -2));
    if (w.endsWith('ies')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('ves')) { add(w.slice(0, -3) + 'f'); add(w.slice(0, -3) + 'fe'); }
    if (w.endsWith('es')) add(w.slice(0, -2));
    if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1));
    if (w.endsWith('ied')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('ed')) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/(.)\1ed$/.test(w)) add(w.slice(0, -3)); }
    if (w.endsWith('ing')) { add(w.slice(0, -3)); add(w.slice(0, -3) + 'e'); if (/(.)\1ing$/.test(w)) add(w.slice(0, -4)); }
    if (w.endsWith('ly')) { add(w.slice(0, -2)); if (w.endsWith('ily')) add(w.slice(0, -3) + 'y'); }
    if (w.endsWith('er')) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
    if (w.endsWith('est')) { add(w.slice(0, -3)); add(w.slice(0, -2)); }
    if (w.endsWith('ier')) add(w.slice(0, -3) + 'y');
    return out;
  }
  TR.lookup = function (word) {
    const w = word.toLowerCase().replace(/[’]/g, "'");
    for (const l of lemmas(w)) if (TR.dict[l]) return { w: l, v: TR.dict[l] };
    return null;
  };

  // get word at a point using caret APIs (no DOM wrapping needed)
  function rangeAt(x, y) {
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (!p) return null; const r = document.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); return r; }
    return null;
  }
  function wordAt(x, y) {
    const r = rangeAt(x, y); if (!r) return null;
    const node = r.startContainer; if (!node || node.nodeType !== 3) return null;
    const text = node.textContent; let i = r.startOffset; const isW = (c) => /[A-Za-z'’\-]/.test(c);
    if (i >= text.length || !isW(text[i])) { if (i > 0 && isW(text[i - 1])) i--; else return null; }
    let a = i, b = i; while (a > 0 && isW(text[a - 1])) a--; while (b < text.length && isW(text[b])) b++;
    let word = text.slice(a, b).replace(/^['’\-]+|['’\-]+$/g, ''); if (!word || !/[A-Za-z]/.test(word)) return null;
    const wr = document.createRange(); wr.setStart(node, a); wr.setEnd(node, b);
    // verify the point is actually over the word box
    const rect = wr.getBoundingClientRect(); if (x < rect.left - 4 || x > rect.right + 4 || y < rect.top - 6 || y > rect.bottom + 6) return null;
    return { word, range: wr, node, a, b, rect };
  }
  // the sentence around the clicked word: nearest block's text
  function sentenceAround(node, word) {
    let el = node.parentElement; while (el && !/^(P|LI|TD|DIV|H\d|SPAN|BUTTON|LABEL)$/.test(el.tagName)) el = el.parentElement;
    while (el && el.tagName === 'SPAN' && el.parentElement && (el.textContent || '').length < 40) el = el.parentElement;
    const t = (el ? el.innerText || el.textContent : node.textContent).replace(/\s+/g, ' ').trim();
    const parts = (t.match(/[^.!?]+[.!?]*/g) || [t]).map((p) => p.trim()); return parts.find((p) => p.toLowerCase().includes(word.toLowerCase())) || t.slice(0, 300);
  }
  function phraseAround(text, a, b) {
    // look for known multi-word phrases covering [a,b)
    const lower = text.toLowerCase(); let best = null;
    for (const ph in TR.phrases) {
      let idx = lower.indexOf(ph);
      while (idx !== -1) { if (idx <= a && idx + ph.length >= b && (!best || ph.length > best.length)) best = ph; idx = lower.indexOf(ph, idx + 1); }
    }
    return best;
  }

  let pop = null, hl = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } if (hl) { hl.remove(); hl = null; } }
  TR.close = closePop;
  function highlight(rect) { hl = h('div', { class: 'tr-hl', style: { position: 'fixed', left: rect.left - 2 + 'px', top: rect.top - 1 + 'px', width: rect.width + 4 + 'px', height: rect.height + 2 + 'px', zIndex: 399, pointerEvents: 'none' } }); document.body.append(hl); }

  TR.show = function (word, rect, ctx = {}) {
    closePop();
    const hit = TR.lookup(word); const ph = ctx.phrase ? { p: ctx.phrase, v: TR.phrases[ctx.phrase] } : null;
    const vi = h('div', { class: 'vi' });
    const sentBox = h('div', { class: 'sent', hidden: true });
    pop = h('div', { class: 'trpop', role: 'dialog', 'aria-label': 'Dịch từ ' + word },
      h('button', { class: 'x', 'aria-label': 'Đóng', html: icon('close'), onclick: closePop }),
      h('div', { class: 'w' }, word, Speech.available() ? h('button', { class: 'ibtn', style: { width: '32px', height: '32px' }, 'aria-label': 'Phát âm', html: icon('speaker'), onclick: () => Speech.speak(word, { rate: 0.85 }) }) : null),
      hit && hit.w !== word.toLowerCase() ? h('div', { class: 'pos' }, 'từ gốc: ' + hit.w) : null,
      vi,
      ph && ph.v ? h('div', { class: 'ph', html: `Cụm từ: <b>${esc(ph.p)}</b> = ${esc(ph.v)}` }) : null,
      sentBox,
      ctx.sentence ? h('div', { class: 'row' }, h('button', { class: 'btn sm', html: icon('tr') + 'Dịch cả câu', onclick: () => translateSentence(ctx.sentence, sentBox) })) : null
    );
    if (hit) vi.textContent = hit.v;
    else { vi.innerHTML = '<span class="muted">Đang tra…</span>'; onlineWord(word).then((v) => { if (vi.isConnected) vi.innerHTML = v ? esc(v) : '<span class="muted">Chưa có trong từ điển. Thử "Dịch cả câu".</span>'; }); }
    document.body.append(pop);
    const pw = pop.offsetWidth, phh = pop.offsetHeight;
    let left = Math.min(Math.max(12, rect.left + rect.width / 2 - pw / 2), innerWidth - pw - 12);
    let top = rect.bottom + 10; if (top + phh > innerHeight - 12) top = Math.max(12, rect.top - phh - 10);
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    SFX.play('pop');
  };

  async function onlineWord(word) {
    const k = 'w:' + word.toLowerCase(); if (TR.cache[k]) return TR.cache[k];
    const v = await viaClaude(`Translate the English word "${word}" (used in a Grade 7 maths / science textbook) into Vietnamese. Reply with only the Vietnamese meaning in 2-8 words, no quotes.`) || (await viaWeb(word));
    if (v) TR.cache[k] = v; return v;
  }
  async function translateSentence(sentence, box) {
    box.hidden = false; box.innerHTML = '<span class="muted">Đang dịch…</span>';
    const k = 's:' + sentence; if (TR.cache[k]) { box.textContent = TR.cache[k]; return; }
    const v = (await viaClaude(`Dịch câu tiếng Anh sau sang tiếng Việt tự nhiên, dễ hiểu cho học sinh lớp 7 (giữ nguyên số và ký hiệu toán). Chỉ trả về bản dịch.\n\n${sentence}`)) || (await viaWeb(sentence));
    if (v) { TR.cache[k] = v; box.textContent = v; }
    else box.innerHTML = '<span class="muted">Không dịch được câu này lúc này (cần kết nối Claude hoặc Internet).</span>';
  }
  async function viaClaude(prompt) {
    const fn = await AI.get(); if (!fn) return null;
    try { const { text } = await fn(prompt, { modelTier: 'quick', cache: { gcTime: 86400000 } }); return text.trim(); }
    catch (e) { if (['not_granted', 'sampling_disabled'].includes(e && e.code)) AI.denied = true; return null; }
  }
  async function viaWeb(q) {
    // works when the site is hosted outside the Claude viewer (network is blocked inside it)
    if (window.claude) return null;
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 5000);
      const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(q), { signal: ctl.signal }); clearTimeout(t);
      const j = await r.json(); return j[0].map((x) => x[0]).join('');
    } catch (e) { return null; }
  }
  TR.sentence = translateSentence;

  // global tap handler
  document.addEventListener('click', (e) => {
    if (pop && pop.contains(e.target)) return;
    if (!TR.on) { closePop(); return; }
    const zone = e.target.closest && e.target.closest('[data-tr]');
    if (!zone || e.target.closest('button,input,select,textarea,a,.opt,.tile,svg,.no-tr')) { closePop(); return; }
    const sel = window.getSelection && window.getSelection(); if (sel && String(sel).trim().length > 1) return; // user is selecting text
    const hit = wordAt(e.clientX, e.clientY); if (!hit) { closePop(); return; }
    const phrase = phraseAround(hit.node.textContent, hit.a, hit.b);
    highlight(hit.rect);
    TR.show(hit.word, hit.rect, { sentence: sentenceAround(hit.node, hit.word), phrase });
  });
  // selected phrase -> translate (desktop & mobile long-press selection)
  document.addEventListener('mouseup', () => {
    if (!TR.on) return; const sel = window.getSelection(); const t = String(sel || '').trim();
    if (t.length < 3 || t.split(/\s+/).length < 2 || !sel.rangeCount) return;
    const zone = sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest('[data-tr]'); if (!zone) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    closePop();
    const box = h('div', { class: 'sent' });
    pop = h('div', { class: 'trpop' }, h('button', { class: 'x', 'aria-label': 'Đóng', html: icon('close'), onclick: closePop }), h('div', { class: 'w', style: { fontSize: '1rem' } }, t.length > 90 ? t.slice(0, 90) + '…' : t), box);
    const known = TR.phrases[t.toLowerCase()]; document.body.append(pop);
    pop.style.left = Math.min(Math.max(12, rect.left), innerWidth - pop.offsetWidth - 12) + 'px'; pop.style.top = Math.min(rect.bottom + 10, innerHeight - pop.offsetHeight - 12) + 'px';
    if (known) box.textContent = known; else translateSentence(t, box);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop) { e.preventDefault(); closePop(); } });
  window.addEventListener('scroll', () => { if (hl) closePop(); }, { passive: true });

  TR.toggle = function () { TR.on = !TR.on; store.set('tr', TR.on); document.documentElement.classList.toggle('tr-on', TR.on); if (!TR.on) closePop(); toast(TR.on ? 'Bật dịch: chạm vào từ tiếng Anh để xem nghĩa' : 'Đã tắt chế độ dịch'); return TR.on; };
  document.documentElement.classList.toggle('tr-on', TR.on);
})();
