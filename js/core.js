/* Maths 7 Lab — core utilities: DOM, random, maths formatting, storage, sound, speech, confetti, icons, question helpers */
(function () {
  'use strict';
  const APP = (window.APP = { units: [], unitMap: {}, viz: {}, version: '1.0' });

  /* ---------------- DOM ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(5)) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    }
    for (const c of kids.flat(5)) { if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c))); }
    return el;
  }

  /* ---------------- random ---------------- */
  let _seed = null;
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let rng = Math.random;
  function seed(n) { _seed = n; rng = n == null ? Math.random : mulberry(n); }
  const rand = () => rng();
  const R = (a, b) => Math.floor(rand() * (b - a + 1)) + a; // int in [a,b]
  const RNZ = (a, b) => { let v; do { v = R(a, b); } while (v === 0); return v; };
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const chance = (p) => rand() < p;

  /* ---------------- maths ---------------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  const round = (x, dp = 10) => { const f = Math.pow(10, dp); return Math.round((x + Number.EPSILON) * f) / f; };
  // number -> display string with true minus sign
  function N(x, dp) {
    if (typeof x === 'string') return x.replace(/-/g, '−');
    let v = dp != null ? round(x, dp).toFixed(dp) : String(round(x, 10));
    if (/e/.test(v)) v = Number(x).toLocaleString('en-US', { maximumFractionDigits: 10 }).replace(/,/g, '');
    return v.replace('-', '−');
  }
  // integer in brackets if negative, for "4 − (−3)" style when wanted
  const NB = (x) => (x < 0 ? '(' + N(x) + ')' : N(x));
  // fraction HTML
  function F(a, b) { return `<span class="frac"><span>${N(a)}</span><span>${N(b)}</span></span>`; }
  function MX(w, a, b) { return (w ? `${N(w)}` : '') + F(a, b); } // mixed number
  function fracSimp(a, b) { const g = gcd(a, b) || 1; let n = a / g, d = b / g; if (d < 0) { n = -n; d = -d; } return [n, d]; }
  function fracHTML(n, d, mixed = true) {
    [n, d] = fracSimp(n, d);
    if (d === 1) return N(n);
    if (mixed && Math.abs(n) > d) { const w = Math.trunc(n / d), r = Math.abs(n % d); return `${N(w)}${F(r, d)}`; }
    return F(n, d);
  }
  const fracStr = (n, d) => { [n, d] = fracSimp(n, d); return d === 1 ? String(n) : n + '/' + d; };
  const sum = (a) => a.reduce((p, c) => p + c, 0);
  const mean = (a) => sum(a) / a.length;
  const median = (a) => { const b = a.slice().sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
  const range = (a) => Math.max(...a) - Math.min(...a);
  function modes(a) { const c = {}; a.forEach((v) => (c[v] = (c[v] || 0) + 1)); const mx = Math.max(...Object.values(c)); return Object.keys(c).filter((k) => c[k] === mx).map(Number); }
  const factors = (n) => { const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f; };
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };

  /* ---------------- answer parsing ---------------- */
  function cleanInput(str) {
    return String(str).trim().replace(/[−–—]/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, ' ');
  }
  // parse a number typed by the learner: "−3", "1,5" (vi decimal), "1 000", "3/4", "1 1/2", "x = 5", "25%", "$12.50"
  function parseNum(str) {
    let t = cleanInput(str).toLowerCase();
    t = t.replace(/^[a-z]\s*=\s*/, '').replace(/[$€£₫%°]/g, '').replace(/(cm|mm|km|m|kg|g|ml|l|ha|s|h|min)(\^?[23]|²|³)?$/, '').trim();
    if (/^-?[1-9]\d{0,2}(,\d{3})+(\.\d+)?$/.test(t) && (/,\d{3},/.test(t) || /\./.test(t))) t = t.replace(/,/g, '');
    else if (/^-?\d*,\d+$/.test(t)) t = t.replace(',', '.');
    let m = t.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/); // mixed number
    if (m) { const v = +m[2] + +m[3] / +m[4]; return m[1] ? -v : v; }
    m = t.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
    if (m) return +m[1] / +m[2];
    t = t.replace(/\s(?=\d{3}\b)/g, '');
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return parseFloat(t);
    return NaN;
  }
  // parse a fraction string to [n,d] (exact). accepts "a/b", "w a/b", integer, decimal
  function parseFrac(str) {
    let t = cleanInput(str).replace(/^[a-z]\s*=\s*/i, '').replace(/^(-?\d*),(\d+)(\s*%)?$/, '$1.$2$3');
    let m = t.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (m) { const d = +m[4]; let n = +m[2] * d + +m[3]; if (m[1]) n = -n; return [n, d]; }
    m = t.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (m) return [+m[1], +m[2]];
    m = t.match(/^(\d+)(?:\.(\d+))?\s*%$/);
    if (m) { const d = Math.pow(10, (m[2] || '').length); return [(+m[1]) * d + +(m[2] || 0), 100 * d]; }
    m = t.match(/^-?\d+$/);
    if (m) return [+t, 1];
    m = t.match(/^(-?)(\d*)\.(\d+)$/);
    if (m) { const d = Math.pow(10, m[3].length); let n = +(m[2] || 0) * d + +m[3]; if (m[1]) n = -n; return [n, d]; }
    return null;
  }
  // ---- tiny expression evaluator with implicit multiplication ----
  function tokenize(src) {
    const t = cleanInput(src).replace(/²/g, '^2').replace(/³/g, '^3').replace(/\s+/g, '');
    const out = []; let i = 0;
    while (i < t.length) {
      const c = t[i];
      if (/\d|\./.test(c)) { let j = i; while (j < t.length && /[\d.]/.test(t[j])) j++; out.push({ k: 'n', v: parseFloat(t.slice(i, j)) }); i = j; continue; }
      if (/[a-zA-Z]/.test(c)) { out.push({ k: 'v', v: c.toLowerCase() }); i++; continue; }
      if ('+-*/^()'.includes(c)) { out.push({ k: c }); i++; continue; }
      throw new Error('bad char');
    }
    // insert implicit *
    const res = [];
    for (let j = 0; j < out.length; j++) {
      const a = res[res.length - 1], b = out[j];
      if (a && (a.k === 'n' || a.k === 'v' || a.k === ')') && (b.k === 'n' || b.k === 'v' || b.k === '(')) res.push({ k: '*' });
      res.push(b);
    }
    return res;
  }
  function evalExpr(src, vars) {
    const tk = tokenize(src); let p = 0;
    const peek = () => tk[p], eat = (k) => { if (tk[p] && tk[p].k === k) { p++; return true; } return false; };
    function prim() {
      const t = tk[p++]; if (!t) throw new Error('end');
      if (t.k === 'n') return t.v;
      if (t.k === 'v') { if (!(t.v in vars)) throw new Error('var'); return vars[t.v]; }
      if (t.k === '(') { const v = add(); if (!eat(')')) throw new Error(')'); return v; }
      if (t.k === '-') return -pow();
      if (t.k === '+') return pow();
      throw new Error('tok');
    }
    function pow() { let b = prim(); if (eat('^')) { const e = unary(); b = Math.pow(b, e); } return b; }
    function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return pow(); }
    function mul() { let v = unary(); for (;;) { if (eat('*')) v *= unary(); else if (eat('/')) v /= unary(); else return v; } }
    function add() { let v = mul(); for (;;) { if (eat('+')) v += mul(); else if (eat('-')) v -= mul(); else return v; } }
    const v = add(); if (p !== tk.length) throw new Error('trail'); return v;
  }
  function exprVars(src) { try { return [...new Set(tokenize(src).filter((t) => t.k === 'v').map((t) => t.v))]; } catch (e) { return []; } }
  function exprEqual(a, b) {
    const vs = [...new Set([...exprVars(a), ...exprVars(b)])];
    for (let k = 0; k < 6; k++) {
      const vars = {}; vs.forEach((v, i) => (vars[v] = 1.37 + k * 0.91 + i * 2.17));
      let x, y; try { x = evalExpr(a, vars); y = evalExpr(b, vars); } catch (e) { return false; }
      if (!isFinite(x) || !isFinite(y) || Math.abs(x - y) > 1e-6 * Math.max(1, Math.abs(y))) return false;
    }
    return true;
  }
  function termCount(src) { const t = cleanInput(src).replace(/\s/g, ''); let d = 0, c = 1; for (let i = 0; i < t.length; i++) { const ch = t[i]; if (ch === '(') d++; else if (ch === ')') d--; else if ((ch === '+' || ch === '-') && d === 0 && i > 0 && !'*/^('.includes(t[i - 1])) c++; } return c; }
  const normText = (s) => cleanInput(s).toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();

  /* ---------------- storage ---------------- */
  const KEY = 'm7lab:';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} },
    sget(k, d) { try { const v = sessionStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    sset(k, v) { try { sessionStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} },
    sdel(k) { try { sessionStorage.removeItem(KEY + k); } catch (e) {} },
  };
  const memStore = {};
  // progress record: { xp, streak:{day,count}, best:{key:pct}, hist:[...], done:{} }
  const P = {
    data: null,
    load() { this.data = store.get('progress', null) || memStore.p || { xp: 0, best: {}, hist: [], streak: { day: '', count: 0 }, seen: {} }; return this.data; },
    save() { memStore.p = this.data; store.set('progress', this.data); },
    addXP(n) { this.data.xp += Math.max(0, Math.round(n)); this.touch(); this.save(); APP.emit && APP.emit('xp'); },
    touch() { const d = new Date().toISOString().slice(0, 10); const st = this.data.streak; if (st.day === d) return; const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10); st.count = st.day === y ? st.count + 1 : 1; st.day = d; },
    best(k) { return this.data.best[k]; },
    record(k, pct, meta) { const b = this.data.best; const prev = b[k]; if (prev == null || pct > prev) b[k] = pct; this.data.hist.push({ k, pct, t: Date.now(), ...(meta || {}) }); if (this.data.hist.length > 400) this.data.hist.shift(); this.save(); return prev; },
    level() { const xp = this.data.xp; const lv = Math.floor(Math.sqrt(xp / 60)) + 1; const cur = 60 * (lv - 1) ** 2, nxt = 60 * lv ** 2; return { lv, pct: (xp - cur) / (nxt - cur), nxt: nxt - xp }; },
  };
  const LEVEL_NAMES = ['Tân binh', 'Người khám phá', 'Thợ số', 'Nhà giải đố', 'Kiến trúc sư số', 'Pháp sư đại số', 'Chiến lược gia', 'Nhà toán học', 'Giáo sư', 'Huyền thoại'];

  /* ---------------- events ---------------- */
  const listeners = {};
  APP.on = (e, f) => (listeners[e] = listeners[e] || []).push(f);
  APP.emit = (e, d) => (listeners[e] || []).forEach((f) => { try { f(d); } catch (err) { console.error(err); } });

  /* ---------------- sound (Web Audio synth, no files) ---------------- */
  const SFX = {
    ctx: null, on: store.get('sound', true),
    init() { if (this.ctx) return this.ctx; try { const C = window.AudioContext || window.webkitAudioContext; this.ctx = new C(); } catch (e) { this.ctx = null; } return this.ctx; },
    tone(freq, dur, type = 'sine', vol = 0.15, when = 0, slideTo) {
      const c = this.ctx; if (!c) return;
      const t0 = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    },
    noise(dur = 0.25, vol = 0.08, when = 0, f1 = 400, f2 = 3000) {
      const c = this.ctx; if (!c) return;
      const t0 = c.currentTime + when, len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
      bp.type = 'bandpass'; bp.frequency.setValueAtTime(f1, t0); bp.frequency.exponentialRampToValueAtTime(f2, t0 + dur); bp.Q.value = 1.2;
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.buffer = buf; src.connect(bp).connect(g).connect(c.destination); src.start(t0);
    },
    play(name) {
      if (!this.on) return; const c = this.init(); if (!c) return; if (c.state === 'suspended') c.resume();
      const T = (...a) => this.tone(...a);
      switch (name) {
        case 'tap': T(1400, 0.05, 'triangle', 0.06); break;
        case 'select': T(880, 0.07, 'triangle', 0.08); T(1320, 0.06, 'sine', 0.04, 0.03); break;
        case 'correct': T(784, 0.12, 'triangle', 0.14); T(1175, 0.22, 'triangle', 0.14, 0.09); T(2350, 0.18, 'sine', 0.04, 0.12); break;
        case 'wrong': T(220, 0.16, 'square', 0.06, 0, 180); T(165, 0.26, 'square', 0.05, 0.12, 130); break;
        case 'combo': [659, 784, 988, 1319].forEach((f, i) => T(f, 0.14, 'triangle', 0.1, i * 0.06)); break;
        case 'complete': [523, 659, 784, 1047].forEach((f, i) => T(f, 0.3, 'triangle', 0.12, i * 0.11)); T(1568, 0.6, 'sine', 0.06, 0.45); this.noise(0.5, 0.03, 0.4, 2000, 6000); break;
        case 'level': [392, 523, 659, 784, 1047, 1319].forEach((f, i) => T(f, 0.2, 'square', 0.05, i * 0.07)); break;
        case 'whoosh': this.noise(0.32, 0.07, 0, 300, 2600); break;
        case 'flip': this.noise(0.12, 0.06, 0, 1200, 3000); T(600, 0.08, 'sine', 0.05, 0.02, 900); break;
        case 'pop': T(600, 0.09, 'sine', 0.12, 0, 1200); break;
        case 'tick': T(2000, 0.03, 'square', 0.03); break;
        case 'drop': T(500, 0.12, 'sine', 0.1, 0, 250); break;
        case 'open': T(520, 0.08, 'sine', 0.07, 0, 780); T(1040, 0.1, 'sine', 0.05, 0.06); break;
        case 'msg': T(988, 0.07, 'sine', 0.06); T(1319, 0.09, 'sine', 0.05, 0.06); break;
        case 'star': T(1568, 0.16, 'triangle', 0.08); T(2093, 0.2, 'sine', 0.05, 0.08); break;
      }
    },
    toggle() { this.on = !this.on; store.set('sound', this.on); if (this.on) this.play('pop'); return this.on; },
  };
  document.addEventListener('pointerdown', () => SFX.init(), { once: true });

  /* ---------------- speech (Claude voice when offered, browser voice otherwise) ---------------- */
  const Speech = {
    tts: undefined, blocked: false, state: 'idle', listeners: [],
    async init() {
      if (this.tts !== undefined) return this.tts;
      this.tts = null;
      try { if (window.claude && window.claude.use) { const t = await window.claude.use('tts'); if (t) { this.tts = t; t.onState(({ state }) => this._set(state)); } } } catch (e) { this.tts = null; }
      return this.tts;
    },
    _set(st) { this.state = st; this.listeners.forEach((f) => f(st)); },
    onState(f) { this.listeners.push(f); },
    available() { return !this.blocked && (!!this.tts || 'speechSynthesis' in window); },
    voiceEN() {
      if (!('speechSynthesis' in window)) return null;
      const vs = speechSynthesis.getVoices();
      return vs.find((v) => /en-GB/i.test(v.lang) && /female|libby|sonia|serena|kate|google uk/i.test(v.name)) || vs.find((v) => /en-GB/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
    },
    async speak(text, opt = {}) {
      if (this.blocked) return;
      const lines = Array.isArray(text) ? text : [{ text }];
      if (this.tts) {
        try {
          const arg = lines.map((l) => ({ text: String(l.text).slice(0, 1990), voice: l.voice, language: 'en', id: l.id }));
          await this.tts.speak(arg.length === 1 && !arg[0].voice ? arg[0].text : arg, { rate: opt.rate || 1, language: 'en' });
          return;
        } catch (e) {
          if (e && e.code === 'not_granted') { this.blocked = true; APP.toast && APP.toast('Đọc to đã bị tắt cho trang này.'); return; }
          if (e && (e.code === 'stopped' || e.code === 'no_gesture')) return;
          if (e && e.code === 'busy') return;
          // other failure: fall through to browser voice
        }
      }
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const v = this.voiceEN();
      return new Promise((res) => {
        let i = 0;
        const next = () => {
          if (i >= lines.length) { this._set('idle'); return res(); }
          const l = lines[i++]; const u = new SpeechSynthesisUtterance(String(l.text));
          u.lang = (v && v.lang) || 'en-GB'; if (v) u.voice = v; u.rate = (opt.rate || 1) * 0.95; u.pitch = l.voice === 'airy' ? 1.25 : l.voice === 'rounded' ? 0.85 : 1;
          u.onstart = () => { this._set('speaking'); opt.onLine && opt.onLine(i - 1, l.id); };
          u.onend = next; u.onerror = () => { this._set('idle'); res(); };
          speechSynthesis.speak(u);
        };
        this._set('starting'); next();
      });
    },
    async stop() { try { if (this.tts) await this.tts.stop(); } catch (e) {} if ('speechSynthesis' in window) speechSynthesis.cancel(); this._set('idle'); },
    async pause() { try { if (this.tts) return await this.tts.pause(); } catch (e) {} if ('speechSynthesis' in window) speechSynthesis.pause(); this._set('paused'); },
    async resume() { try { if (this.tts) return await this.tts.resume(); } catch (e) {} if ('speechSynthesis' in window) speechSynthesis.resume(); this._set('speaking'); },
  };
  if ('speechSynthesis' in window) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) {} }

  /* ---------------- Claude sampling (chatbot / translation) ---------------- */
  const AI = {
    fn: undefined, denied: false,
    async get() {
      if (this.denied) return null;
      if (this.fn !== undefined) return this.fn;
      this.fn = null;
      try { if (window.claude && window.claude.use) this.fn = (await window.claude.use('sample')) || null; } catch (e) { this.fn = null; }
      return this.fn;
    },
    errText(e) {
      const c = e && e.code;
      if (c === 'not_granted' || c === 'sampling_disabled' || c === 'not_declared' || c === 'capability_disabled' || c === 'capability_removed') { this.denied = true; return 'Trợ lý AI chưa được cho phép trên trang này, mình chuyển sang chế độ trả lời ngoại tuyến.'; }
      if (c === 'rate_limited') return 'Bạn hỏi hơi nhanh rồi, đợi một chút rồi thử lại nhé.';
      if (c === 'session_expired') return 'Phiên đăng nhập Claude đã hết hạn, hãy đăng nhập lại.';
      if (c === 'refused') return 'Câu hỏi này mình không trả lời được. Hãy hỏi về nội dung toán trong chương nhé.';
      if (c === 'cancelled') return '';
      return 'Kết nối bị gián đoạn. Bấm gửi lại để thử lần nữa.';
    },
  };

  /* ---------------- confetti ---------------- */
  const FX = {
    cv: null, parts: [], raf: 0,
    burst(x, y, n = 90, colors) {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!this.cv) { this.cv = h('canvas', { id: 'fx' }); document.body.append(this.cv); }
      const cv = this.cv, dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      const cs = getComputedStyle(document.documentElement);
      colors = colors || ['--accent', '--accent-2', '--number', '--algebra', '--geometry', '--stats'].map((v) => cs.getPropertyValue(v).trim() || '#f60');
      x = x == null ? innerWidth / 2 : x; y = y == null ? innerHeight / 3 : y;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9;
        this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, r: 4 + Math.random() * 5, c: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 1, shape: i % 3 });
      }
      if (!this.raf) this.loop();
    },
    loop() {
      const cv = this.cv, ctx = cv.getContext('2d'), dpr = cv.width / innerWidth;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      this.parts = this.parts.filter((p) => p.life > 0 && p.y < innerHeight + 40);
      for (const p of this.parts) {
        p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.006;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5)); ctx.fillStyle = p.c;
        if (p.shape === 0) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.r / 1.4, 0, 7); ctx.fill(); }
        else { ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(p.r, p.r); ctx.lineTo(-p.r, p.r); ctx.fill(); }
        ctx.restore();
      }
      if (this.parts.length) this.raf = requestAnimationFrame(() => this.loop());
      else { this.raf = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    },
  };

  /* ---------------- toast & xp pop ---------------- */
  let toastBox;
  function toast(msg, ms = 2400) {
    if (!toastBox) { toastBox = h('div', { class: 'toast-box', role: 'status', 'aria-live': 'polite' }); document.body.append(toastBox); }
    const t = h('div', { class: 'toast' }, msg); toastBox.append(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms);
  }
  function xpPop(x, y, txt) { const e = h('div', { class: 'xp-pop', style: { left: x + 'px', top: y + 'px' } }, txt); document.body.append(e); setTimeout(() => e.remove(), 1000); }

  /* ---------------- animated counter ---------------- */
  function countUp(el, to, ms = 900, fmt = (v) => Math.round(v)) {
    const t0 = performance.now(), from = 0;
    const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------------- icons ---------------- */
  const IC = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M8 7h7"/>',
    pencil: '<path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 7l3 3"/>',
    rocket: '<path d="M12 15 9 12c1-5 4-8 10-9-1 6-4 9-9 10"/><path d="M9 12H5l3-4h4M12 15v4l4-3v-4"/><path d="M6 18c-1 1-1.5 2.5-1.5 2.5S6 20 7 19"/>',
    news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    head: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M9 17h6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    tr: '<path d="M4 5h8M8 3v2M5 5c0 4 3 7 6 8M11 5c0 3-3 7-7 8"/><path d="m12 21 4.5-10L21 21M13.5 18h6"/>',
    sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 9 4 6M21 9l-4 6"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
    replay: '<path d="M4 4v6h6"/><path d="M5.5 15A7.5 7.5 0 1 0 6 8.5L4 10"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    exam: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/><path d="m14 16 1.5 1.5L19 14"/>',
    words: '<path d="M4 6h7v12H4zM13 6h7v12h-7z"/><path d="M6.5 10h2M15.5 10h2M6.5 13h2"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    fire: '<path d="M12 21c4 0 7-2.7 7-6.5 0-3.5-2.5-5.5-3.5-8.5-1 2-2 3-3.5 3 .5-2.5 0-5-2-7 0 3.5-5 6-5 12.5C5 18.3 8 21 12 21z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" stroke="none"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    shuffle: '<path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c2 0 3-1.5 4-3.5M17 7h3M14 9.5C15 8 15.5 7 17 7"/><path d="m18 4 3 3-3 3M18 14l3 3-3 3"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    atom: '<circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
    robot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5"/><circle cx="12" cy="3.5" r="1.2"/>',
    hint: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"/>',
  };
  const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

  /* ---------------- question constructors ---------------- */
  // Every question: {type, q (html), a (answer), ex (explanation html), src:'book'|'new'|'app', d (difficulty 1-3), hint, fig (svg html)}
  const mk = (type, q, a, ex, o) => Object.assign({ type, q, a, ex: ex || '' }, o || {});
  const Q = {
    mcq: (q, opts, a, ex, o) => mk('mcq', q, a, ex, Object.assign({ opts }, o)),      // a = index of correct option (options shuffled at render unless o.fixed)
    multi: (q, opts, a, ex, o) => mk('multi', q, a, ex, Object.assign({ opts }, o)),  // a = array of correct indexes
    tf: (q, a, ex, o) => mk('tf', q, a, ex, o),                                       // a = true/false
    num: (q, a, ex, o) => mk('num', q, a, ex, o),                                     // a = number | number[] ; o.tol, o.unit
    frac: (q, a, ex, o) => mk('frac', q, a, ex, o),                                   // a = [n,d] ; o.simplest
    expr: (q, a, ex, o) => mk('expr', q, a, ex, o),                                   // a = expression string ; o.simplified
    txt: (q, a, ex, o) => mk('txt', q, a, ex, o),                                     // a = string | string[] accepted
    ratio: (q, a, ex, o) => mk('ratio', q, a, ex, o),                                 // a = [p,q,...] ; o.simplest
    coord: (q, a, ex, o) => mk('coord', q, a, ex, o),                                 // a = [x,y]
    fill: (q, a, ex, o) => mk('fill', q, a, ex, o),                                   // q contains [] blanks; a = array of answers (number | string | {opts:[...],a})
    order: (q, items, ex, o) => mk('order', q, items, ex, o),                         // items in correct order
    match: (q, pairs, ex, o) => mk('match', q, pairs, ex, o),                         // [[left,right],...]
    sort: (q, cats, items, ex, o) => mk('sort', q, items, ex, Object.assign({ cats }, o)), // items [[label,catIndex],...]
    gen: (f, o) => Object.assign({ gen: f }, o || {}),                                // generator; returns a question
  };

  Object.assign(APP, {
    $, $$, h, s, esc, icon, IC,
    U: { R, RNZ, pick, shuffle, sample, chance, rand, seed, gcd, lcm, round, N, NB, F, MX, fracSimp, fracHTML, fracStr, sum, mean, median, range, modes, factors, isPrime },
    parse: { parseNum, parseFrac, evalExpr, exprEqual, termCount, normText, cleanInput },
    store, P, LEVEL_NAMES, SFX, Speech, AI, FX, toast, xpPop, countUp, Q,
    addUnit(u) { APP.units.push(u); APP.unitMap[u.n] = u; },
  });
  P.load();
})();
