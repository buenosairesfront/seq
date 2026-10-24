/* Seq · U-MA — preview de sonido interno + reloj de secuencia (Web Audio) */
'use strict';
(function () {
const Seq = window.Seq;
const A = Seq.audio = { ctx: null, master: null, strips: [], mono: [], noise: null, vol: 0.8 };

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const ccCut = v => 120 * Math.pow(2, (v / 127) * 7); // 120 Hz .. 15 kHz

A.init = function () {
  if (A.ctx) return A.ctx.resume();
  const C = window.AudioContext || window.webkitAudioContext;
  const ctx = A.ctx = new C({ latencyHint: 'interactive' });
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10; comp.knee.value = 6; comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.12;
  A.master = ctx.createGain(); A.master.gain.value = A.vol;
  A.analyser = ctx.createAnalyser(); A.analyser.fftSize = 1024;
  A.master.connect(comp); comp.connect(A.analyser); A.analyser.connect(ctx.destination);
  const len = ctx.sampleRate;
  const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  A.noise = b;
  return ctx.resume();
};
A.setVol = v => { A.vol = v; if (A.master) A.master.gain.setTargetAtTime(v, A.ctx.currentTime, 0.02); };

function strip(i) {
  if (A.strips[i]) return A.strips[i];
  const ctx = A.ctx, g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (p) { g.connect(p); p.connect(A.master); } else g.connect(A.master);
  return (A.strips[i] = { g, p });
}

function env(param, t, a, peak, d, sus, rel, end) {
  param.cancelScheduledValues(t);
  param.setValueAtTime(0.0001, t);
  param.linearRampToValueAtTime(peak, t + a);
  param.setTargetAtTime(peak * sus, t + a, d / 3);
  param.setTargetAtTime(0.0001, Math.max(end, t + a), rel / 4);
}

function noiseSrc(t) { const s = A.ctx.createBufferSource(); s.buffer = A.noise; s.loop = true; s.loopStart = Math.random() * 0.5; s.start(t); return s; }

const DRUM = {
  0(t, v, out) { // BD
    const c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(v * 1.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.45);
  },
  1(t, v, out) { // SD
    const c = A.ctx, n = noiseSrc(t), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.8;
    g.gain.setValueAtTime(v * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    n.connect(f); f.connect(g); g.connect(out); n.stop(t + 0.22);
    const o = c.createOscillator(), og = c.createGain(); o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.05);
    og.gain.setValueAtTime(v * 0.6, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1); o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.12);
  },
  2(t, v, out, open) { // CH / OH
    const c = A.ctx, n = noiseSrc(t), f = c.createBiquadFilter(), g = c.createGain(), d = open ? 0.32 : 0.05;
    f.type = 'highpass'; f.frequency.value = 7200;
    g.gain.setValueAtTime(v * 0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    n.connect(f); f.connect(g); g.connect(out); n.stop(t + d + 0.02);
  },
  3(t, v, out) { DRUM[2](t, v, out, true); },
  4(t, v, out) { // CP
    const c = A.ctx, n = noiseSrc(t), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = 1.4;
    g.gain.setValueAtTime(0.0001, t);
    [0, 0.011, 0.022].forEach(k => { g.gain.setValueAtTime(v * 0.9, t + k); g.gain.exponentialRampToValueAtTime(0.05, t + k + 0.009); });
    g.gain.setValueAtTime(v * 0.7, t + 0.033); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    n.connect(f); f.connect(g); g.connect(out); n.stop(t + 0.25);
  },
  5(t, v, out) { // RM
    const c = A.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'square'; o.frequency.value = 1700; f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 4;
    g.gain.setValueAtTime(v * 0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 0.06);
  },
  6(t, v, out) { // TM
    const c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(110, t + 0.2);
    g.gain.setValueAtTime(v * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.32);
  },
  7(t, v, out) { // PC (cencerro)
    const c = A.ctx, f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 2;
    [540, 800].forEach(fr => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + 0.3); });
    g.gain.setValueAtTime(v * 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    f.connect(g); g.connect(out);
  }
};
const DRUM_BY_NOTE = {}; Seq.DRUMS.forEach((d, i) => DRUM_BY_NOTE[d.note] = i);

/* voz monofónica persistente (acid / sub) con slide real */
function monoVoice(i, sound) {
  const m = A.mono[i];
  if (m && m.sound === sound) return m;
  if (m) { try { m.o.stop(); m.o2.stop(); } catch (e) {} }
  const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
  o.type = sound === 'sub' ? 'triangle' : 'sawtooth'; o2.type = sound === 'sub' ? 'sine' : 'square';
  const mix2 = c.createGain(); mix2.gain.value = sound === 'sub' ? 0.6 : 0.25; o2.detune.value = sound === 'sub' ? -1200 : 0;
  f.type = 'lowpass'; f.frequency.value = 400; f.Q.value = sound === 'sub' ? 0.5 : 12;
  g.gain.value = 0;
  o.connect(f); o2.connect(mix2); mix2.connect(f); f.connect(g); g.connect(strip(i).g);
  o.start(); o2.start();
  return (A.mono[i] = { sound, o, o2, f, g, slid: false, end: 0 });
}

A.play = function (ti, track, n, t, dur, cc) {
  if (!A.ctx) return;
  const c = A.ctx, s = strip(ti), v = Math.pow(n.vel / 127, 1.3) * track.level;
  if (cc[7] !== undefined) s.g.gain.setTargetAtTime(cc[7] / 127, t, 0.01); else s.g.gain.setTargetAtTime(1, t, 0.01);
  if (s.p) s.p.pan.setTargetAtTime(cc[10] !== undefined ? (cc[10] - 64) / 64 : 0, t, 0.01);
  const cut = cc[74] !== undefined ? ccCut(cc[74]) : null;
  const res = cc[71] !== undefined ? cc[71] / 127 : null;
  const sound = track.sound;
  if (sound === 'drums') { const k = DRUM_BY_NOTE[n.midi]; if (k !== undefined) DRUM[k](t, v, s.g); return; }
  if (sound === 'acid' || sound === 'sub') {
    const m = monoVoice(ti, sound), f = mtof(n.midi);
    const legato = m.slid && t < m.end + 0.005;
    [m.o, m.o2].forEach(o => { o.frequency.cancelScheduledValues(t); if (legato) o.frequency.setTargetAtTime(f, t, 0.035); else o.frequency.setValueAtTime(f, t); });
    const base = cut || (sound === 'sub' ? 900 : 380);
    m.f.Q.setValueAtTime(res !== null ? res * 24 : (sound === 'sub' ? 0.5 : 13), t);
    m.f.frequency.cancelScheduledValues(t);
    if (!legato) { m.f.frequency.setValueAtTime(base * (sound === 'sub' ? 1 : 1 + 6 * (n.vel / 127)), t); m.f.frequency.setTargetAtTime(base, t + 0.005, 0.09); }
    else m.f.frequency.setTargetAtTime(base, t, 0.05);
    m.g.gain.cancelScheduledValues(t);
    if (!legato) { m.g.gain.setValueAtTime(0.0001, t); m.g.gain.linearRampToValueAtTime(v * 0.5, t + 0.004); }
    else m.g.gain.setTargetAtTime(v * 0.5, t, 0.01);
    m.g.gain.setTargetAtTime(0.0001, t + dur, 0.015);
    m.slid = n.slide; m.end = t + dur;
    return;
  }
  // voces polifónicas
  const g = c.createGain(), f = c.createBiquadFilter();
  f.type = 'lowpass'; g.connect(s.g); f.connect(g);
  const fr = mtof(n.midi), oscs = [];
  const end = t + dur;
  if (sound === 'pluck') {
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; oscs.push(o);
    const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = fr * 1.005; oscs.push(o2);
    const b = cut || 2400; f.Q.value = res !== null ? res * 18 : 3;
    f.frequency.setValueAtTime(b * 2.2, t); f.frequency.setTargetAtTime(b * 0.35, t, 0.08);
    env(g.gain, t, 0.003, v * 0.22, 0.2, 0.3, 0.12, end);
  } else if (sound === 'pad') {
    [-8, 0, 7].forEach(dt => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = dt; oscs.push(o); });
    f.frequency.value = cut || 1400; f.Q.value = res !== null ? res * 10 : 0.7;
    env(g.gain, t, 0.08, v * 0.09, 0.4, 0.8, 0.5, end);
  } else if (sound === 'bell') {
    const o = c.createOscillator(), mo = c.createOscillator(), mg = c.createGain();
    o.frequency.value = fr; mo.frequency.value = fr * 3.5; mg.gain.setValueAtTime(fr * 2.5, t); mg.gain.setTargetAtTime(fr * 0.2, t, 0.25);
    mo.connect(mg); mg.connect(o.frequency); oscs.push(o, mo);
    f.frequency.value = cut || 9000; f.Q.value = res !== null ? res * 8 : 0.5;
    env(g.gain, t, 0.002, v * 0.25, 0.6, 0.15, 0.8, end);
  }
  oscs.forEach((o, k) => { if (!(sound === 'bell' && k === 1)) o.connect(f); o.start(t); o.stop(end + 1.2); });
};

/* ---------- Reloj ---------- */
const P = Seq.player = { on: false, timer: null, vis: [], fill: false, queue: null, onSwitch: null, onTick: null, midiOut: null };

P.stepDur = (proj, track) => 60 / proj.bpm / (Seq.DIVS[track.div] || 4);

P.start = function (getProj) {
  A.init();
  P.get = getProj;
  const proj = getProj(), now = A.ctx.currentTime + 0.06;
  P.on = true; P.t0 = now;
  P.songPos = 0; P.songRep = 0;
  if (proj.mode === 'song' && proj.chain.length) { proj.slot = proj.chain[0].slot; if (P.onSwitch) P.onSwitch(proj.slot); }
  P.reset(now);
  P.master = { next: now, tick: 0 };
  clearInterval(P.timer);
  P.timer = setInterval(P.pump, 22);
  P.pump();
};
P.reset = function (time) {
  const proj = P.get(), d = Seq.curData(proj);
  P.st = d.tracks.map(() => Object.assign(Seq.newTrackState(), { base: time, n: 0 }));
};
P.stop = function () {
  P.on = false; clearInterval(P.timer); P.vis = [];
  A.mono.forEach(m => { if (m && A.ctx) { m.g.gain.cancelScheduledValues(0); m.g.gain.setTargetAtTime(0, A.ctx.currentTime, 0.02); m.slid = false; } });
  if (P.midiOut) for (let ch = 0; ch < 16; ch++) P.midiOut.send([0xB0 + ch, 123, 0]);
};

P.pump = function () {
  if (!P.on) return;
  const proj = P.get(), horizon = A.ctx.currentTime + 0.12;
  let guard = 0;
  while (guard++ < 400) {
    const d = Seq.curData(proj);
    while (P.st.length < d.tracks.length) P.st.push(Object.assign(Seq.newTrackState(), { base: P.master.next, n: 0 }));
    // próximo evento: reloj maestro o alguna pista
    let best = P.master.next, who = -1;
    d.tracks.forEach((tr, i) => { const s = P.st[i]; const tt = s.base + swing(proj, tr, s.n); if (tt < best) { best = tt; who = i; } });
    if (best >= horizon) break;
    if (who === -1) { masterTick(proj, d); continue; }
    const tr = d.tracks[who], s = P.st[who];
    const sd = P.stepDur(proj, tr), t = s.base + swing(proj, tr, s.n);
    const ev = Seq.evalTick(proj, tr, s, Math.random, P.fill);
    const aud = Seq.audible(d)[who];
    P.vis.push({ time: t, tr: who, idx: ev.idx, played: ev.played && aud });
    if (aud) ev.notes.forEach(n => {
      const nt = Math.max(A.ctx.currentTime, t + n.off * sd), dur = Math.max(0.01, n.dur * sd);
      A.play(who, tr, n, nt, dur, ev.cc);
      if (P.midiOut) midiSend(tr, n, nt, dur, ev.cc);
    });
    s.base += sd; s.n++;
  }
  if (P.vis.length > 400) P.vis.splice(0, P.vis.length - 400);
};
function swing(proj, tr, n) {
  if (!proj.swing || n % 2 === 0) return 0;
  const spb = Seq.DIVS[tr.div] || 4;
  if (spb % 2) return 0;
  return (proj.swing / 100) * P.stepDur(proj, tr) * 0.5;
}
function masterTick(proj, d) {
  const sixteenth = 60 / proj.bpm / 4;
  P.master.tick++;
  P.master.next += sixteenth;
  const barLen = 16 * (d.bars || 1);
  if (P.master.tick % barLen !== 0) return;
  let target = null;
  if (proj.mode === 'song' && proj.chain.length) {
    P.songRep++;
    const e = proj.chain[P.songPos % proj.chain.length];
    if (P.songRep >= (e.rep || 1)) { P.songRep = 0; P.songPos = (P.songPos + 1) % proj.chain.length; target = proj.chain[P.songPos].slot; if (target === proj.slot) target = -2; }
  } else if (P.queue !== null) { target = P.queue; P.queue = null; }
  if (target === -2) { P.reset(P.master.next); return; }
  if (target !== null) {
    proj.slot = target;
    P.reset(P.master.next);
    if (P.onSwitch) P.onSwitch(target);
  }
}

/* ---------- Web MIDI (no disponible en Safari) ---------- */
P.midiAvailable = () => !!navigator.requestMIDIAccess;
P.midiList = async function () {
  if (!P.midiAvailable()) return [];
  P.access = P.access || await navigator.requestMIDIAccess({ sysex: false });
  return Array.from(P.access.outputs.values());
};
function midiSend(tr, n, t, dur, cc) {
  const ch = (tr.ch - 1) & 15, o = P.midiOut;
  const ms = x => performance.now() + (x - A.ctx.currentTime) * 1000;
  for (const k in cc) o.send([0xB0 + ch, +k & 127, cc[k] & 127], ms(t) - 1);
  o.send([0x90 + ch, n.midi, Math.max(1, n.vel)], ms(t));
  o.send([0x80 + ch, n.midi, 0], ms(t + dur));
}

/* audición de un paso (al editar) */
Seq.audition = function (proj, track, ti, step) {
  if (!A.ctx) return;
  const t = A.ctx.currentTime + 0.01, sd = P.stepDur(proj, track);
  Seq.noteSet(step).forEach(d => A.play(ti, track, { midi: Seq.degToMidi(proj, track, d), vel: step.vel, slide: false }, t, Math.min(step.gate, 2) * sd, step.pl || {}));
};
})();
