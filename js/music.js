/* Maths 7 Lab — background music.
   Royalty-free: every track is synthesised live with the Web Audio API (no audio files).
   Starts after the first tap (browser autoplay rules), ducks while a listening/reading recording plays,
   pauses when the tab is hidden. Preferences are remembered on this device. */
(function () {
  'use strict';
  const { h, icon, store, SFX } = APP;

  const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // chords as MIDI notes; bass is the first entry (played an octave lower)
  const TRACKS = {
    lofi: {
      name: 'Lo-fi học bài', bpm: 74, swing: 0.2, lp: 2600, drums: 'lofi', keys: 'ep', mel: 0.32,
      prog: [[53, 57, 60, 64, 67], [52, 55, 59, 62, 64], [50, 53, 57, 60, 64], [48, 52, 55, 59, 62]], // Fmaj9 Em9 Dm9 Cmaj9
      scale: [72, 74, 76, 79, 81, 84],
    },
    calm: {
      name: 'Thư giãn', bpm: 62, swing: 0, lp: 1900, drums: null, keys: 'pad', mel: 0.5,
      prog: [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 59, 64, 67], [55, 59, 62, 64, 69]], // Am9 Fmaj7 Cmaj7 G6
      scale: [69, 72, 74, 76, 79, 81],
    },
    bright: {
      name: 'Tươi vui', bpm: 96, swing: 0.08, lp: 4200, drums: 'pop', keys: 'pluck', mel: 0.22,
      prog: [[48, 55, 60, 64, 67], [55, 59, 62, 67, 71], [57, 60, 64, 69, 72], [53, 57, 60, 65, 69]], // C G Am F
      scale: [72, 74, 76, 79, 81, 84, 86],
    },
  };

  const M = {
    on: store.get('music', true), vol: store.get('musicVol', 0.5), track: store.get('musicTrack', 'lofi'),
    playing: false, tracks: TRACKS, _duck: 1,
  };
  APP.Music = M;
  if (!TRACKS[M.track]) M.track = 'lofi';

  let ctx = null, out = null, duckG = null, bus = null, filt = null, rev = null, echo = null, noise = null;
  let timer = null, nextT = 0, step = 0, bar = 0, melLast = 2;

  function graph() {
    ctx = SFX.init(); if (!ctx) return false;
    if (out) return true;
    out = ctx.createGain(); out.gain.value = 0.0001;
    duckG = ctx.createGain(); duckG.gain.value = M._duck;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = TRACKS[M.track].lp; filt.Q.value = 0.4;
    bus = ctx.createGain(); bus.gain.value = 1;
    // reverb: generated impulse response
    rev = ctx.createConvolver(); const len = Math.floor(ctx.sampleRate * 2.4), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    rev.buffer = ir; const revG = ctx.createGain(); revG.gain.value = 0.32;
    // echo for melody
    echo = ctx.createDelay(1.5); const fb = ctx.createGain(); fb.gain.value = 0.32; const echoG = ctx.createGain(); echoG.gain.value = 0.35;
    echo.connect(fb).connect(echo); echo.connect(echoG).connect(bus);
    // white noise buffer for drums / vinyl
    const nl = ctx.sampleRate; noise = ctx.createBuffer(1, nl, ctx.sampleRate); const nd = noise.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
    bus.connect(filt); rev.connect(revG).connect(filt);
    filt.connect(comp).connect(duckG).connect(out).connect(ctx.destination);
    M._rev = rev;
    return true;
  }
  const level = () => 0.0001 + Math.pow(M.vol, 1.6) * 0.32;

  /* ---------- instruments ---------- */
  function env(g, t, a, peak, d, sus, rel, end) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), t + a + d);
    g.gain.setValueAtTime(Math.max(0.0001, peak * sus), end); g.gain.exponentialRampToValueAtTime(0.0001, end + rel);
  }
  function osc(type, f, t, stop, dest, detune = 0) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune; o.connect(dest); o.start(t); o.stop(stop); return o; }
  function ep(m, t, dur, v) { // electric piano
    const g = ctx.createGain(); env(g, t, 0.006, v, 1.1, 0.25, 0.5, t + dur); g.connect(bus); const s = ctx.createGain(); s.gain.value = 0.5; g.connect(s).connect(rev);
    const f = NOTE(m); osc('sine', f, t, t + dur + 0.6, g); osc('triangle', f, t, t + dur + 0.6, g, 4);
    const g2 = ctx.createGain(); env(g2, t, 0.004, v * 0.35, 0.25, 0.05, 0.2, t + 0.3); g2.connect(bus); osc('sine', f * 4, t, t + 0.6, g2);
  }
  function pad(m, t, dur, v) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(600, t); lp.frequency.linearRampToValueAtTime(1300, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(700, t + dur);
    const g = ctx.createGain(); env(g, t, 0.9, v, 0.5, 0.85, 1.4, t + dur); lp.connect(g); g.connect(bus); const s = ctx.createGain(); s.gain.value = 0.9; g.connect(s).connect(rev);
    const f = NOTE(m); osc('sawtooth', f, t, t + dur + 1.5, lp, -7); osc('sawtooth', f, t, t + dur + 1.5, lp, 7); osc('sine', f / 2, t, t + dur + 1.5, lp);
  }
  function pluck(m, t, v) {
    const g = ctx.createGain(); env(g, t, 0.003, v, 0.18, 0.08, 0.15, t + 0.2); g.connect(bus); const s = ctx.createGain(); s.gain.value = 0.35; g.connect(s).connect(rev);
    const f = NOTE(m); osc('triangle', f, t, t + 0.5, g); osc('square', f * 2, t, t + 0.06, g, 3);
  }
  function piano(m, t, v) { // soft bell-piano for melodies
    const g = ctx.createGain(); env(g, t, 0.004, v, 1.4, 0.12, 0.6, t + 1.2); g.connect(bus); g.connect(echo); const s = ctx.createGain(); s.gain.value = 0.6; g.connect(s).connect(rev);
    const f = NOTE(m); osc('sine', f, t, t + 2, g); const g2 = ctx.createGain(); g2.gain.value = 0.18; g2.connect(g); osc('sine', f * 3, t, t + 0.4, g2);
  }
  function bass(m, t, dur, v) {
    const g = ctx.createGain(); env(g, t, 0.012, v, 0.35, 0.6, 0.15, t + dur); g.connect(bus);
    const f = NOTE(m - 12); osc('sine', f, t, t + dur + 0.2, g); const g2 = ctx.createGain(); g2.gain.value = 0.25; g2.connect(g); osc('triangle', f * 2, t, t + dur + 0.2, g2);
  }
  function nz(t, dur, v, type, f, q = 0.7, dest = bus) {
    const s = ctx.createBufferSource(); s.buffer = noise; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl).connect(g).connect(dest); s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.02);
  }
  function kick(t, v) { const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38); g.connect(bus); const o = ctx.createOscillator(); o.frequency.setValueAtTime(118, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); o.connect(g); o.start(t); o.stop(t + 0.4); }
  function snare(t, v) { nz(t, 0.2, v, 'bandpass', 1900, 0.7); const g = ctx.createGain(); g.gain.setValueAtTime(v * 0.6, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09); g.connect(bus); osc('triangle', 196, t, t + 0.1, g); const s = ctx.createGain(); s.gain.value = 0.4; nz(t, 0.25, v * 0.5, 'bandpass', 1500, 0.6, s); s.connect(rev); }
  const hat = (t, v) => nz(t, 0.045, v, 'highpass', 7500, 0.5);
  const crackle = (t) => nz(t, 0.004 + Math.random() * 0.006, 0.02 + Math.random() * 0.05, 'highpass', 2500, 0.5);

  /* ---------- sequencer (16th-note steps) ---------- */
  function playStep(T, s, t) {
    const spb = 60 / T.bpm, six = spb / 4, ch = T.prog[bar % T.prog.length], barDur = spb * 4;
    if (s === 0) {
      if (T.keys === 'ep') { ch.slice(1).forEach((m, i) => ep(m, t + i * 0.012, barDur * 0.55, 0.045)); bass(ch[0], t, spb * 1.6, 0.16); }
      if (T.keys === 'pad') { ch.slice(1).forEach((m) => pad(m, t, barDur, 0.022)); bass(ch[0], t, barDur * 0.95, 0.12); }
      if (T.keys === 'pluck') bass(ch[0], t, spb * 0.9, 0.15);
    }
    if (T.keys === 'ep') {
      if (s === 10 && bar % 2 === 1) ch.slice(2).forEach((m) => ep(m, t, spb * 1.2, 0.025));
      if (s === 8) bass(ch[0] + (bar % 4 === 3 ? 7 : 0), t, spb * 1.2, 0.13);
    }
    if (T.keys === 'pad' && s % 4 === 0) { const arp = ch.slice(1); piano(arp[(s / 4 + bar) % arp.length] + 12, t, 0.03); }
    if (T.keys === 'pluck') {
      if (s % 2 === 0) { const arp = ch.slice(1).concat(ch.slice(1).map((m) => m + 12)); const order = [0, 2, 1, 3, 2, 4, 3, 5]; pluck(arp[order[(s / 2) % 8]], t, 0.05); }
      if (s === 8) bass(ch[0], t, spb * 0.9, 0.14); if (s === 14) bass(ch[0] + 12, t, spb * 0.4, 0.08);
    }
    // melody: gentle random walk on a pentatonic scale
    if (s % 2 === 0 && Math.random() < T.mel * (s % 4 === 0 ? 1 : 0.5) && bar % 8 < 6) {
      melLast = Math.max(0, Math.min(T.scale.length - 1, melLast + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
      piano(T.scale[melLast], t, T.keys === 'pad' ? 0.035 : 0.03);
    }
    if (T.drums === 'lofi') {
      if (s === 0 || s === 10 || (s === 7 && Math.random() < 0.3)) kick(t, s === 0 ? 0.5 : 0.35);
      if (s === 4 || s === 12) snare(t, 0.09);
      if (s % 2 === 0) hat(t, s % 4 === 2 ? 0.03 : 0.018);
      if (Math.random() < 0.35) crackle(t + Math.random() * six);
    }
    if (T.drums === 'pop') {
      if (s % 4 === 0) kick(t, 0.38);
      if (s === 4 || s === 12) { snare(t, 0.07); nz(t + 0.012, 0.12, 0.05, 'bandpass', 1200, 1); }
      hat(t, s % 2 ? 0.012 : 0.022);
    }
  }
  function tick() {
    const T = TRACKS[M.track], six = 60 / T.bpm / 4;
    if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
    while (nextT < ctx.currentTime + 0.3) {
      playStep(T, step, nextT + (step % 2 ? T.swing * six : 0));
      nextT += six; step = (step + 1) % 16; if (step === 0) bar++;
    }
  }

  /* ---------- public API ---------- */
  M.start = function () {
    if (M.playing || !graph()) return;
    if (ctx.state === 'suspended') ctx.resume();
    filt.frequency.setValueAtTime(TRACKS[M.track].lp, ctx.currentTime);
    nextT = ctx.currentTime + 0.1; step = 0; bar = 0; M.playing = true;
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), ctx.currentTime); out.gain.exponentialRampToValueAtTime(level(), ctx.currentTime + 2.5);
    timer = setInterval(tick, 40); tick(); paint();
  };
  M.stop = function (fade = 0.6) {
    if (!M.playing) return; M.playing = false; clearInterval(timer); timer = null;
    const t = ctx.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t); out.gain.exponentialRampToValueAtTime(0.0001, t + fade);
    paint();
  };
  M.toggle = function () { M.on = !M.on; store.set('music', M.on); if (M.on) M.start(); else M.stop(); return M.on; };
  M.setVol = function (v) { M.vol = v; store.set('musicVol', v); if (M.playing) { const t = ctx.currentTime; out.gain.cancelScheduledValues(t); out.gain.setTargetAtTime(level(), t, 0.1); } };
  M.setTrack = function (k) { if (!TRACKS[k]) return; M.track = k; store.set('musicTrack', k); if (M.playing) { M.stop(0.3); setTimeout(() => { if (M.on) M.start(); }, 350); } };
  // lower the music while speech / recordings play
  M.duck = function (on) { M._duck = on ? 0.18 : 1; if (duckG && ctx) { const t = ctx.currentTime; duckG.gain.cancelScheduledValues(t); duckG.gain.setTargetAtTime(M._duck, t, on ? 0.12 : 0.6); } };

  // start on first interaction (autoplay policy), pause while the tab is hidden
  const kick0 = () => { if (M.on && !M.playing) M.start(); };
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, kick0, { once: true, capture: true }));
  let wasPlaying = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { wasPlaying = M.playing; if (M.playing) M.stop(0.2); }
    else if (wasPlaying && M.on) M.start();
  });

  /* ---------- header button + panel ---------- */
  let btn = null, panel = null;
  function paint() { if (!btn) return; btn.classList.toggle('on', M.on && M.playing); btn.classList.toggle('off', !M.on); btn.title = M.on ? 'Nhạc nền đang bật' : 'Nhạc nền đang tắt'; }
  function closePanel() { if (panel) { panel.remove(); panel = null; document.removeEventListener('pointerdown', outside, true); } }
  function outside(e) { if (panel && !panel.contains(e.target) && !btn.contains(e.target)) closePanel(); }
  function openPanel() {
    if (panel) { closePanel(); return; }
    const sw = h('button', { class: 'btn sm ' + (M.on ? 'sc' : 'ghost'), html: icon(M.on ? 'pause' : 'play') + (M.on ? 'Tắt nhạc' : 'Bật nhạc') });
    sw.onclick = () => { const on = M.toggle(); sw.className = 'btn sm ' + (on ? 'sc' : 'ghost'); sw.innerHTML = icon(on ? 'pause' : 'play') + (on ? 'Tắt nhạc' : 'Bật nhạc'); paint(); };
    const vol = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: M.vol, 'aria-label': 'Âm lượng nhạc nền' }); vol.oninput = () => M.setVol(+vol.value);
    const tr = h('div', { class: 'mus-tracks' }, Object.keys(TRACKS).map((k) => { const b = h('button', { class: 'chip' + (k === M.track ? ' on' : ''), onclick: () => { M.setTrack(k); if (!M.on) { M.on = true; store.set('music', true); M.start(); sw.className = 'btn sm sc'; sw.innerHTML = icon('pause') + 'Tắt nhạc'; } [...tr.children].forEach((x) => x.classList.toggle('on', x === b)); paint(); } }, TRACKS[k].name); return b; }));
    panel = h('div', { class: 'mus-panel', role: 'dialog', 'aria-label': 'Nhạc nền' },
      h('div', { class: 'mus-h', html: icon('music') + '<b>Nhạc nền</b>' }), tr,
      h('label', { class: 'mus-vol' }, h('span', {}, 'Âm lượng'), vol), sw,
      h('div', { class: 'mus-note' }, 'Nhạc được tạo trực tiếp trong trình duyệt, tự nhỏ lại khi phát bài nghe.'));
    document.body.append(panel);
    const r = btn.getBoundingClientRect(); const pw = Math.min(300, innerWidth - 24);
    panel.style.width = pw + 'px'; panel.style.top = r.bottom + 8 + 'px'; panel.style.left = Math.max(12, Math.min(r.right - pw, innerWidth - pw - 12)) + 'px';
    setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
  }
  M.button = function () {
    btn = h('button', { class: 'ibtn mus-btn', 'aria-label': 'Nhạc nền', html: icon('music'), onclick: openPanel });
    paint(); return btn;
  };
})();
