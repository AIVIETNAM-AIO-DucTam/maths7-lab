/* Maths 7 Lab — recorded audio (natural AI voices, generated offline) with a browser-voice fallback.
   APP.AUDIO (js/audio-data.js) maps unit number -> { listen:{src,t,d}, read:{src,t,d}, words:{src,w:{word:[start,end]}}, cast:{speaker:'m'|'f'} } */
(function () {
  'use strict';
  const { store, Speech, toast } = APP;
  APP.AUDIO = APP.AUDIO || {};
  let current = null;
  const blobs = {};
  function getBlob(src) {
    if (!blobs[src]) blobs[src] = (window.fetch && location.protocol !== 'file:' ? fetch(src).then((r) => (r.ok ? r.blob() : null)).then((b) => (b && b.size ? URL.createObjectURL(b) : null)) : Promise.resolve(null)).catch(() => null);
    return blobs[src];
  }
  const ready = {};
  /* Analyser for the live waveform. Only attached to blob: sources (always same-origin, so never silenced),
     and only once the shared AudioContext is running, so the voice can never be muted by a suspended context. */
  function attachAnalyser(el) {
    try {
      const ctx = APP.SFX && APP.SFX.init(); if (!ctx || !ctx.createMediaElementSource) return null;
      if (ctx.state !== 'running') { ctx.resume && ctx.resume(); return null; }
      const src = ctx.createMediaElementSource(el), an = ctx.createAnalyser();
      an.fftSize = 256; an.smoothingTimeConstant = 0.72; an.minDecibels = -95; an.maxDecibels = -22;
      src.connect(an); an.connect(ctx.destination);
      return an;
    } catch (e) { return null; }
  }

  /* One controller per recording. lines = [{text, who, g}] are used only for the browser-voice fallback. */
  APP.makeAudio = function ({ spec, lines = [], cast = {}, onLine, onState, onTime }) {
    const C = { mode: spec && spec.src ? 'file' : 'tts', state: 'idle', rate: store.get('rate', 1), line: -1 };
    let a = null, tok = 0, castMap = null, an = null, fbuf = null;
    const set = (st) => { if (C.state === st) return; C.state = st; onState && onState(st); if (APP.Music) APP.Music.duck(st === 'playing'); };
    const hl = (i) => { if (i !== C.line) { C.line = i; onLine && onLine(i); } };
    const claim = () => { if (current && current !== C) current.stop(); current = C; };
    const idx = (t) => { let k = -1; const T = spec.t || []; for (let i = 0; i < T.length; i++) if (t >= T[i] - 0.05) k = i; return k; };

    let started = false;
    if (C.mode === 'file') {
      a = new Audio(); a.preload = 'metadata'; a.src = spec.src;
      /* Prefetch into a blob: blob URLs are always seekable, even on hosts without byte-range support. */
      getBlob(spec.src).then((u) => { if (u && a && !started && a.paused) { const t = a.currentTime; a.src = u; if (t) a.addEventListener('loadedmetadata', () => { a.currentTime = t; }, { once: true }); } });
      a.addEventListener('playing', () => set('playing'));
      a.addEventListener('waiting', () => { if (!a.paused) set('loading'); });
      a.addEventListener('pause', () => { if (!a.ended && C.state !== 'idle') set('paused'); });
      a.addEventListener('ended', () => { set('ended'); hl(-1); });
      a.addEventListener('timeupdate', () => { onTime && onTime(a.currentTime, a.duration || spec.d); if (!a.paused) hl(idx(a.currentTime)); });
      a.addEventListener('loadedmetadata', () => { onTime && onTime(a.currentTime, a.duration || spec.d); });
      a.addEventListener('error', () => {
        if (C.mode !== 'file') return;
        C.mode = 'tts'; a = null; set('idle');
        if (lines.length) toast('Không tải được file âm thanh — chuyển sang giọng đọc của trình duyệt.');
      });
    }
    async function speakFrom(i) {
      if (!lines.length) return;
      const my = ++tok; claim(); set('playing');
      if (!castMap) castMap = Speech.cast(Object.keys(cast).length ? Object.entries(cast) : [['_', 'f']]);
      const ok = await Speech.speak(lines.slice(i).map((l, k) => ({ text: l.text, who: l.who || '_', g: l.g, id: i + k })), { rate: C.rate, cast: castMap, onLine: (k) => { if (my === tok) hl(i + k); } });
      if (my !== tok) return;
      if (ok) { set('ended'); hl(-1); } else set('paused');
    }
    C.play = () => {
      claim();
      if (C.mode === 'file') {
        if (a.ended) a.currentTime = 0;
        if (!an && /^blob:/.test(a.src)) an = attachAnalyser(a);
        else if (an && an.context.state !== 'running') an.context.resume();
        started = true; a.playbackRate = C.rate; set('loading');
        const p = a.play(); if (p && p.catch) p.catch((e) => { if (e && e.name === 'NotAllowedError') { set('paused'); toast('Chạm ▶ lần nữa để phát.'); } });
      } else speakFrom(C.state === 'ended' ? 0 : Math.max(0, C.line));
    };
    C.pause = () => { if (C.mode === 'file') a.pause(); else { tok++; Speech.stop(); set('paused'); } };
    C.toggle = () => (C.state === 'playing' || C.state === 'loading' ? C.pause() : C.play());
    C.replay = () => {
      if (C.mode === 'file') { a.pause(); a.currentTime = 0; hl(-1); C.play(); }
      else { tok++; C.line = -1; Speech.stop().then(() => speakFrom(0)); }
    };
    C.seekLine = (i) => {
      if (C.mode === 'file') { if (spec.t && spec.t[i] != null) { a.currentTime = spec.t[i] + 0.01; hl(i); } C.play(); }
      else { tok++; Speech.stop().then(() => speakFrom(i)); }
    };
    C.seek = (sec) => { if (a) { a.currentTime = sec; hl(idx(sec)); } };
    C.setRate = (r) => { C.rate = r; store.set('rate', r); if (a) a.playbackRate = r; };
    C.stop = () => { tok++; if (a) a.pause(); else Speech.stop(); set('idle'); hl(-1); if (current === C) current = null; };
    C.duration = () => (a && isFinite(a.duration) ? a.duration : (spec && spec.d) || 0);
    C.time = () => (a ? a.currentTime : 0);
    /* fill out[0..n) with 0..1 levels, mirrored so the middle bars carry the voice's low frequencies */
    C.levels = (out) => {
      if (!an || C.state !== 'playing') return false;
      fbuf = fbuf || new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(fbuf);
      const n = out.length, mid = (n - 1) / 2;
      for (let i = 0; i < n; i++) { const d = Math.abs(i - mid) / (mid + 1); const b = 2 + Math.floor(d * d * 44 + d * 6); out[i] = Math.min(1, Math.pow(fbuf[b] / 255, 1.4) * 1.25); }
      return true;
    };
    return C;
  };
  APP.stopAudio = function () { if (current) current.stop(); stopWord(); Speech.stop(); };

  /* ---------- single words (dictionary popup, vocabulary cards) ---------- */
  const sprites = {}; let wordTimer = null, wordEl = null, wordTok = 0;
  function stopWord() { wordTok++; clearTimeout(wordTimer); if (wordEl) { try { wordEl.pause(); } catch (e) {} } }
  function findWord(w) {
    const k = String(w).toLowerCase().replace(/[’]/g, "'").trim();
    for (const n in APP.AUDIO) { const W = APP.AUDIO[n].words; if (W && W.w && W.w[k]) return { src: W.src, seg: W.w[k] }; }
    return null;
  }
  APP.sayWord = function (w, opt = {}) {
    const hit = findWord(w);
    if (!hit) return Speech.speak(w, { rate: opt.rate || 0.85, g: 'f' });
    if (current) current.pause && current.state === 'playing' && current.pause();
    stopWord();
    const el = sprites[hit.src] || (sprites[hit.src] = Object.assign(new Audio(), { preload: 'auto' }));
    wordEl = el; const [s, e] = hit.seg; const my = ++wordTok;
    const go = () => {
      if (my !== wordTok) return;
      try { el.currentTime = s; } catch (er) {}
      const p = el.play(); if (p && p.catch) p.catch(() => Speech.speak(w, { rate: 0.85, g: 'f' }));
      wordTimer = setTimeout(() => el.pause(), (e - s) * 1000 / (el.playbackRate || 1) + 120);
    };
    const start = () => { if (el.readyState >= 1) go(); else { el.addEventListener('loadedmetadata', go, { once: true }); el.load(); } };
    if (ready[hit.src]) start();
    else getBlob(hit.src).then((u) => { if (!ready[hit.src]) { el.src = u || hit.src; ready[hit.src] = true; } start(); });
    return Promise.resolve(true);
  };
})();
