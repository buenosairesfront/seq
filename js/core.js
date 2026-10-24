/* Seq · U-MA — core: modelo, escalas, evaluación de pasos, transformaciones, árbol de versiones */
'use strict';
const Seq = window.Seq = window.Seq || {};

/* ---------- Escalas ---------- */
Seq.SCALES = {
  ionian:     { n: 'Ionian · Major',      s: [0,2,4,5,7,9,11] },
  dorian:     { n: 'Dorian',              s: [0,2,3,5,7,9,10] },
  phrygian:   { n: 'Phrygian',            s: [0,1,3,5,7,8,10] },
  lydian:     { n: 'Lydian',              s: [0,2,4,6,7,9,11] },
  mixolydian: { n: 'Mixolydian',          s: [0,2,4,5,7,9,10] },
  aeolian:    { n: 'Aeolian · Minor',     s: [0,2,3,5,7,8,10] },
  locrian:    { n: 'Locrian',             s: [0,1,3,5,6,8,10] },
  harmMinor:  { n: 'Harmonic minor',      s: [0,2,3,5,7,8,11] },
  melMinor:   { n: 'Melodic minor',       s: [0,2,3,5,7,9,11] },
  pentMaj:    { n: 'Pentatonic major',    s: [0,2,4,7,9] },
  pentMin:    { n: 'Pentatonic minor',    s: [0,3,5,7,10] },
  blues:      { n: 'Blues',               s: [0,3,5,6,7,10] },
  hirajoshi:  { n: 'Hirajoshi',           s: [0,2,3,7,8] },
  insen:      { n: 'In sen',              s: [0,1,5,7,10] },
  wholeTone:  { n: 'Whole tone',          s: [0,2,4,6,8,10] },
  chromatic:  { n: 'Chromatic',           s: [0,1,2,3,4,5,6,7,8,9,10,11] }
};
Seq.NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
Seq.DRUMS = [
  { id: 'BD', note: 36 }, { id: 'SD', note: 38 }, { id: 'CH', note: 42 }, { id: 'OH', note: 46 },
  { id: 'CP', note: 39 }, { id: 'RM', note: 37 }, { id: 'TM', note: 45 }, { id: 'PC', note: 56 }
];
Seq.DIVS = { '1/4': 1, '1/8': 2, '1/8T': 3, '1/16': 4, '1/16T': 6, '1/32': 8 };
Seq.DIRS = ['fwd', 'rev', 'pp', 'rnd', 'drunk'];
Seq.SOUNDS = ['pluck', 'acid', 'pad', 'bell', 'sub', 'drums'];
Seq.CONDS = ['', '1:2', '2:2', '1:3', '2:3', '3:3', '1:4', '2:4', '3:4', '4:4', '1:8', '8:8', 'pre', 'npre', 'fill', 'nfill', '1st', 'n1st'];
Seq.CHORDS = {
  none: [], triad: [2,4], sus2: [1,4], sus4: [3,4], seventh: [2,4,6], sixth: [2,4,5], ninth: [2,4,6,8], power: [4,7], octave: [7]
};
Seq.ARPS = ['off', 'up', 'down', 'updown', 'rnd'];
Seq.MAXLEN = 64;
Seq.MAXTRACKS = 8;
Seq.SLOTS = 16;

/* ---------- RNG ---------- */
Seq.rng = function (seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const R = () => Math.random();
const clamp = Seq.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr, r = R) => arr[Math.floor(r() * arr.length)];
Seq.uid = () => Math.random().toString(36).slice(2, 9);
Seq.clone = o => JSON.parse(JSON.stringify(o));

/* ---------- Modelo ---------- */
Seq.newStep = function () {
  return { on: false, deg: 0, vel: 100, gate: 0.5, prob: 100, ratch: 1, micro: 0, slide: false, tie: false,
    chord: [], arp: 'off', cond: '', lock: false, pl: {} };
};
Seq.newTrack = function (i, kind) {
  const presets = [
    { name: 'LEAD',  sound: 'pluck', oct: 4, len: 16 },
    { name: 'BASS',  sound: 'acid',  oct: 2, len: 13 },
    { name: 'CHORD', sound: 'pad',   oct: 3, len: 7 },
    { name: 'DRUM',  sound: 'drums', oct: 0, len: 16 },
    { name: 'BELL',  sound: 'bell',  oct: 5, len: 12 },
    { name: 'SUB',   sound: 'sub',   oct: 1, len: 16 },
    { name: 'ARP',   sound: 'pluck', oct: 4, len: 11 },
    { name: 'PERC',  sound: 'drums', oct: 0, len: 9 }
  ];
  const p = presets[i % presets.length];
  const steps = [];
  for (let k = 0; k < Seq.MAXLEN; k++) steps.push(Seq.newStep());
  return {
    id: Seq.uid(), name: p.name, sound: kind || p.sound, oct: p.oct, len: p.len, dir: 'fwd', div: '1/16',
    ch: i + 1, mute: false, solo: false, level: 0.8,
    eu: { k: 4, rot: 0 },
    mods: [ { cc: 74, on: false, pts: [ { x: 0, y: 0.3 }, { x: 0.5, y: 0.8 }, { x: 1, y: 0.3 } ] },
            { cc: 71, on: false, pts: [ { x: 0, y: 0.2 }, { x: 1, y: 0.2 } ] } ],
    steps
  };
};
Seq.isDrum = t => t.sound === 'drums';
Seq.newData = function (n = 4) {
  const tracks = [];
  for (let i = 0; i < n; i++) tracks.push(Seq.newTrack(i));
  return { tracks, bars: 1 };
};
Seq.newPattern = function () {
  return { name: '', used: false, v: { A: Seq.newData(), B: null }, cur: 'A' };
};
Seq.newProject = function () {
  const pats = [];
  for (let i = 0; i < Seq.SLOTS; i++) pats.push(Seq.newPattern());
  const p = {
    app: 'seq', version: 1, bpm: 118, swing: 0, root: 2, scale: 'dorian',
    slot: 0, patterns: pats, chain: [ { slot: 0, rep: 2 } ], mode: 'pattern', trees: {}
  };
  Seq.demo(p.patterns[0].v.A);
  p.patterns[0].used = true;
  p.patterns[0].name = 'demo';
  return p;
};

/* Pattern de demostración: polirritmo 16 / 13 / 7 + batería */
Seq.demo = function (d) {
  const [lead, bass, chord, drum] = d.tracks;
  const ld = [0, 2, 4, 7, 4, 2, 5, 4, 0, 2, 4, 9, 7, 4, 2, 1];
  const lon = [1,0,1,1, 0,1,1,0, 1,0,1,1, 0,1,0,1];
  ld.forEach((g, i) => Object.assign(lead.steps[i], { on: !!lon[i], deg: g, vel: 70 + ((i * 37) % 50), gate: 0.35 + ((i * 13) % 5) / 10, prob: i % 5 === 3 ? 60 : 100 }));
  lead.steps[7].ratch = 3; lead.steps[11].cond = '1:2'; lead.steps[15].cond = 'fill';
  lead.mods[0].on = true;
  const bd = [0, 0, 7, 0, 3, 0, 0, 5, 0, 7, 4, 0, 2];
  const bon = [1,0,1,1, 0,1,1,0, 1,1,0,1, 1];
  bd.forEach((g, i) => Object.assign(bass.steps[i], { on: !!bon[i], deg: g, vel: i % 4 === 0 ? 120 : 88, gate: 0.6, slide: i === 2 || i === 9 }));
  [0, 3, 5].forEach((g, i) => Object.assign(chord.steps[i * 2], { on: true, deg: [0, 3, 4][i], chord: [2, 4], gate: 1.8, vel: 72 }));
  chord.steps[4].arp = 'up'; chord.steps[4].ratch = 4;
  chord.div = '1/8';
  const kit = { 0: [0, 4, 8, 12, 10], 1: [4, 12], 2: [0, 2, 4, 6, 8, 10, 12, 14], 3: [7, 15] };
  for (let i = 0; i < 16; i++) {
    const set = [];
    for (const v in kit) if (kit[v].includes(i)) set.push(+v);
    if (set.length) { Seq.setNoteSet(drum.steps[i], set); drum.steps[i].on = true; drum.steps[i].vel = i % 4 === 0 ? 118 : 84; drum.steps[i].gate = 0.25; }
  }
  drum.steps[14].ratch = 2; drum.steps[13].prob = 45; drum.steps[13].on = true; Seq.setNoteSet(drum.steps[13], [2]);
};

/* ---------- Notas ---------- */
Seq.scale = proj => (Seq.SCALES[proj.scale] || Seq.SCALES.ionian).s;
Seq.degToMidi = function (proj, track, deg) {
  if (Seq.isDrum(track)) { const d = Seq.DRUMS[((deg % 8) + 8) % 8]; return d.note; }
  const sc = Seq.scale(proj), n = sc.length;
  const o = Math.floor(deg / n), i = ((deg % n) + n) % n;
  return clamp(12 * (track.oct + 1) + proj.root + sc[i] + 12 * o, 0, 127);
};
Seq.midiName = m => Seq.NOTE_NAMES[m % 12] + (Math.floor(m / 12) - 1);
Seq.degName = function (proj, track, deg) {
  if (Seq.isDrum(track)) return Seq.DRUMS[((deg % 8) + 8) % 8].id;
  return Seq.midiName(Seq.degToMidi(proj, track, deg));
};
Seq.noteSet = st => [st.deg].concat((st.chord || []).map(c => st.deg + c));
Seq.setNoteSet = function (st, arr) {
  const u = Array.from(new Set(arr)).sort((a, b) => a - b);
  if (!u.length) { st.on = false; st.chord = []; return; }
  st.deg = u[0]; st.chord = u.slice(1).map(v => v - u[0]);
};

/* ---------- Evaluación (compartida entre preview y render MIDI) ---------- */
/* estado por pista */
Seq.newTrackState = () => ({ t: 0, idx: -1, iter: 0, pre: true, drunk: 0 });

Seq.nextIndex = function (track, st, rnd) {
  const len = track.len, t = st.t;
  let idx, iter;
  switch (track.dir) {
    case 'rev': idx = len - 1 - (t % len); iter = Math.floor(t / len); break;
    case 'pp': {
      const per = len > 1 ? 2 * len - 2 : 1;
      const p = t % per; idx = p < len ? p : per - p; iter = Math.floor(t / per); break;
    }
    case 'rnd': idx = Math.floor(rnd() * len); iter = Math.floor(t / len); break;
    case 'drunk': {
      if (t === 0) st.drunk = 0;
      else { const r = rnd(); st.drunk += r < 0.2 ? -1 : r < 0.35 ? 0 : 1; }
      st.drunk = ((st.drunk % len) + len) % len; idx = st.drunk; iter = Math.floor(t / len); break;
    }
    default: idx = t % len; iter = Math.floor(t / len);
  }
  st.idx = idx; st.iter = iter; st.t++;
  return idx;
};

Seq.condOk = function (cond, st, fill) {
  if (!cond) return true;
  if (cond === 'pre') return st.pre;
  if (cond === 'npre') return !st.pre;
  if (cond === 'fill') return !!fill;
  if (cond === 'nfill') return !fill;
  if (cond === '1st') return st.iter === 0;
  if (cond === 'n1st') return st.iter !== 0;
  const m = /^(\d+):(\d+)$/.exec(cond);
  if (m) { const a = +m[1], b = +m[2]; return (st.iter % b) === a - 1; }
  return true;
};

/* valor de una curva de modulación en x (0..1) — Catmull-Rom monotónica simple */
Seq.curveAt = function (pts, x) {
  if (!pts || !pts.length) return 0;
  if (x <= pts[0].x) return pts[0].y;
  const L = pts.length;
  if (x >= pts[L - 1].x) return pts[L - 1].y;
  let i = 0;
  while (i < L - 2 && x > pts[i + 1].x) i++;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(L - 1, i + 2)];
  const t = (x - p1.x) / Math.max(1e-6, p2.x - p1.x);
  const t2 = t * t, t3 = t2 * t;
  const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  return clamp(y, 0, 1);
};

/* distancia en pasos hasta el próximo paso activo (para tie) */
Seq.stepsToNext = function (track, idx) {
  for (let k = 1; k <= track.len; k++) { const j = (idx + k) % track.len; if (track.steps[j].on) return k; }
  return track.len;
};

/*
 * Evalúa un tick de pista. Devuelve { idx, played, notes:[{off,dur,midi,vel,slide}], cc:{num:val} }
 * off/dur en unidades de paso. Avanza el estado.
 */
Seq.evalTick = function (proj, track, st, rnd, fill) {
  const idx = Seq.nextIndex(track, st, rnd);
  const s = track.steps[idx];
  const out = { idx, played: false, notes: [], cc: {} };
  // lanes de modulación: siempre envían (CC continuo por paso)
  const x = track.len > 1 ? idx / track.len : 0;
  track.mods.forEach(m => { if (m.on) out.cc[m.cc] = Math.round(Seq.curveAt(m.pts, x) * 127); });
  if (!s.on) return out;
  if (!Seq.condOk(s.cond, st, fill)) { st.pre = false; return out; }
  if (s.prob < 100 && rnd() * 100 >= s.prob) { st.pre = false; return out; }
  st.pre = true;
  out.played = true;
  for (const k in s.pl) out.cc[k] = s.pl[k];
  const micro = s.micro / 100;
  const set = Seq.noteSet(s).map(d => Seq.degToMidi(proj, track, d));
  let gate = s.gate;
  if (s.tie) gate = Seq.stepsToNext(track, idx) + 0.02;
  if (s.slide) gate = Math.max(gate, 1.08);
  if (s.arp !== 'off' && set.length > 1) {
    let order = set.slice();
    if (s.arp === 'down') order.reverse();
    if (s.arp === 'updown') order = order.concat(order.slice(1, -1).reverse());
    const n = Math.max(s.ratch, order.length);
    const sub = 1 / n;
    for (let r = 0; r < n; r++) {
      const m = s.arp === 'rnd' ? pick(order, rnd) : order[r % order.length];
      out.notes.push({ off: micro + r * sub, dur: Math.min(gate, 1) * sub * 0.95, midi: m, vel: s.vel, slide: false });
    }
  } else if (s.ratch > 1) {
    const sub = 1 / s.ratch;
    for (let r = 0; r < s.ratch; r++)
      set.forEach(m => out.notes.push({ off: micro + r * sub, dur: Math.min(1, gate) * sub * 0.9, midi: m, vel: clamp(Math.round(s.vel * (1 - r * 0.08)), 1, 127), slide: false }));
  } else {
    set.forEach(m => out.notes.push({ off: micro, dur: gate, midi: m, vel: s.vel, slide: s.slide }));
  }
  return out;
};

Seq.audible = function (data) {
  const any = data.tracks.some(t => t.solo);
  return data.tracks.map(t => any ? t.solo : !t.mute);
};

/* ---------- Transformaciones (todas devuelven true si cambiaron algo) ---------- */
Seq.ops = {};
const act = t => t.steps.slice(0, t.len);

Seq.ops.invert = function (t) {
  const on = act(t).filter(s => s.on);
  if (!on.length) return false;
  const pivot = on[0].deg;
  act(t).forEach(s => { if (s.on && !s.lock) { s.deg = 2 * pivot - s.deg; s.chord = s.chord.map(c => -c).reverse(); const set = Seq.noteSet(s); Seq.setNoteSet(s, set); } });
  return true;
};
Seq.ops.retro = function (t) {
  const a = act(t).reverse();
  for (let i = 0; i < t.len; i++) t.steps[i] = a[i];
  return true;
};
Seq.ops.rotR = function (t) { const a = act(t); a.unshift(a.pop()); a.forEach((s, i) => t.steps[i] = s); return true; };
Seq.ops.rotL = function (t) { const a = act(t); a.push(a.shift()); a.forEach((s, i) => t.steps[i] = s); return true; };
Seq.ops.dup = function (t) {
  if (t.len * 2 > Seq.MAXLEN) return false;
  for (let i = 0; i < t.len; i++) t.steps[t.len + i] = Seq.clone(t.steps[i]);
  t.len *= 2; return true;
};
Seq.ops.half = function (t) {
  if (t.len < 2) return false;
  const n = Math.ceil(t.len / 2), out = [];
  for (let i = 0; i < n; i++) {
    const a = t.steps[i * 2], b = t.steps[i * 2 + 1];
    out.push(Seq.clone(a.on || !b || i * 2 + 1 >= t.len ? a : b));
  }
  out.forEach((s, i) => t.steps[i] = s);
  for (let i = n; i < Seq.MAXLEN; i++) t.steps[i] = Seq.newStep();
  t.len = n; return true;
};
Seq.ops.human = function (t) {
  act(t).forEach(s => { if (s.on && !s.lock) { s.vel = clamp(Math.round(s.vel + (R() - 0.5) * 26), 1, 127); s.micro = clamp(Math.round(s.micro + (R() - 0.5) * 16), -50, 50); } });
  return true;
};
Seq.ops.degUp = function (t) { act(t).forEach(s => { if (!s.lock) s.deg += 1; }); return true; };
Seq.ops.degDn = function (t) { act(t).forEach(s => { if (!s.lock) s.deg -= 1; }); return true; };
Seq.ops.octUp = function (t) { if (Seq.isDrum(t)) return false; t.oct = clamp(t.oct + 1, 0, 8); return true; };
Seq.ops.octDn = function (t) { if (Seq.isDrum(t)) return false; t.oct = clamp(t.oct - 1, 0, 8); return true; };
Seq.ops.clear = function (t) { for (let i = 0; i < Seq.MAXLEN; i++) if (!t.steps[i].lock) t.steps[i] = Seq.newStep(); return true; };
Seq.ops.unlock = function (t) { t.steps.forEach(s => s.lock = false); return true; };

/* Euclidiano (Bresenham) */
Seq.euclid = function (k, n, rot) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(k > 0 && Math.floor(((i) * k) / n) !== Math.floor(((i - 1) * k) / n) ? 1 : 0);
  if (k >= n) out.fill(1);
  const r = ((rot % n) + n) % n;
  return out.slice(n - r).concat(out.slice(0, n - r));
};
Seq.ops.euclid = function (t, opt) {
  const pat = Seq.euclid(clamp(t.eu.k, 0, t.len), t.len, t.eu.rot);
  pat.forEach((v, i) => {
    const s = t.steps[i]; if (s.lock) return;
    if (v && !s.on) { s.on = true; s.deg = Seq.isDrum(t) ? (s.deg || 0) : (opt && opt.degs.length ? pick(opt.degs) : s.deg); }
    if (!v) s.on = false;
  });
  return true;
};

/* opciones de generación: grados permitidos (índices de escala 0..), densidad, rango de vel, octavas */
Seq.defaultGen = () => ({ degs: [0, 2, 4], density: 40, octs: 1, velMin: 70, velMax: 120, ratch: 10, prob: 10, amount: 30, scope: 'track' });

Seq.randDeg = function (proj, t, g) {
  if (Seq.isDrum(t)) return pick([0, 0, 1, 2, 2, 2, 3, 4, 5, 6, 7]);
  const n = Seq.scale(proj).length;
  const base = g.degs.length ? pick(g.degs) : Math.floor(R() * n);
  const o = Math.floor(R() * g.octs);
  return base + o * n;
};
Seq.ops.random = function (t, g, proj) {
  act(t).forEach(s => {
    if (s.lock) return;
    const on = R() * 100 < g.density;
    Object.assign(s, Seq.newStep(), { on });
    if (on) {
      s.deg = Seq.randDeg(proj, t, g);
      s.vel = Math.round(g.velMin + R() * (g.velMax - g.velMin));
      s.gate = pick([0.25, 0.5, 0.5, 0.75, 1]);
      if (R() * 100 < g.ratch) s.ratch = pick([2, 2, 3, 4]);
      if (R() * 100 < g.prob) s.prob = pick([25, 50, 75]);
      if (!Seq.isDrum(t) && t.sound === 'acid' && R() < 0.2) s.slide = true;
    }
  });
  return true;
};
/* Mutar: varía amount% de los pasos no bloqueados, dentro de la escala */
Seq.ops.mutate = function (t, g, proj) {
  const n = Seq.scale(proj).length;
  let changed = false;
  act(t).forEach((s, i) => {
    if (s.lock || R() * 100 >= g.amount) return;
    changed = true;
    const r = R();
    if (!s.on) {
      if (r < 0.5) { s.on = true; s.deg = Seq.randDeg(proj, t, g); s.vel = Math.round(g.velMin + R() * (g.velMax - g.velMin)); }
      return;
    }
    if (r < 0.38) {
      if (Seq.isDrum(t)) s.deg = Seq.randDeg(proj, t, g);
      else if (g.degs.length) s.deg = pick(g.degs) + Math.floor(s.deg / n) * n;
      else s.deg += pick([-2, -1, 1, 2]);
    } else if (r < 0.52) s.on = false;
    else if (r < 0.66) s.vel = clamp(Math.round(s.vel + (R() - 0.5) * 50), 1, 127);
    else if (r < 0.76) s.gate = pick([0.15, 0.3, 0.5, 0.8, 1, 1.5]);
    else if (r < 0.84) s.ratch = s.ratch > 1 ? 1 : pick([2, 3, 4]);
    else if (r < 0.92) s.prob = s.prob < 100 ? 100 : pick([30, 50, 70]);
    else { const j = (i + 1) % t.len; const o = t.steps[j]; if (!o.lock) { t.steps[j] = s; t.steps[i] = o; } }
  });
  return changed;
};

/* ---------- Árbol de versiones ---------- */
Seq.tree = {
  get(proj, slot) {
    if (!proj.trees[slot]) proj.trees[slot] = { nodes: [], cur: null };
    return proj.trees[slot];
  },
  ensureRoot(proj, slot) {
    const tr = this.get(proj, slot);
    if (!tr.nodes.length) {
      const id = Seq.uid();
      tr.nodes.push({ id, p: null, op: 'root', t: Date.now(), snap: JSON.stringify(Seq.packPattern(proj.patterns[slot])) });
      tr.cur = id;
    }
    return tr;
  },
  commit(proj, slot, op) {
    const tr = this.ensureRoot(proj, slot);
    const snap = JSON.stringify(Seq.packPattern(proj.patterns[slot]));
    const cur = tr.nodes.find(n => n.id === tr.cur);
    if (cur && cur.snap === snap) return null;
    const id = Seq.uid();
    tr.nodes.push({ id, p: tr.cur, op, t: Date.now(), snap });
    tr.cur = id;
    this.prune(tr);
    return id;
  },
  checkout(proj, slot, id) {
    const tr = this.get(proj, slot);
    const n = tr.nodes.find(x => x.id === id);
    if (!n) return false;
    proj.patterns[slot] = Seq.unpackPattern(JSON.parse(n.snap));
    tr.cur = id;
    return true;
  },
  parent(proj, slot) {
    const tr = this.get(proj, slot); const n = tr.nodes.find(x => x.id === tr.cur);
    return n && n.p;
  },
  child(proj, slot) {
    const tr = this.get(proj, slot);
    const kids = tr.nodes.filter(x => x.p === tr.cur);
    return kids.length ? kids[kids.length - 1].id : null;
  },
  prune(tr, max = 240) {
    while (tr.nodes.length > max) {
      const path = new Set(); let c = tr.cur;
      while (c) { path.add(c); const n = tr.nodes.find(x => x.id === c); c = n && n.p; }
      const parents = new Set(tr.nodes.map(n => n.p));
      const victim = tr.nodes.find(n => !path.has(n.id) && !parents.has(n.id) && n.p);
      if (!victim) break;
      tr.nodes.splice(tr.nodes.indexOf(victim), 1);
    }
  },
  /* layout: x = profundidad, y = orden de hojas */
  layout(tr) {
    const kids = {}; tr.nodes.forEach(n => { (kids[n.p] = kids[n.p] || []).push(n); });
    const pos = {}; let leaf = 0, maxD = 0;
    const root = tr.nodes.find(n => !n.p);
    if (!root) return { pos, rows: 0, cols: 0 };
    const walk = (n, d) => {
      maxD = Math.max(maxD, d);
      const ch = kids[n.id] || [];
      if (!ch.length) { pos[n.id] = { x: d, y: leaf++ }; return pos[n.id].y; }
      const ys = ch.map(c => walk(c, d + 1));
      pos[n.id] = { x: d, y: ys[0] };
      return ys[0];
    };
    walk(root, 0);
    return { pos, rows: leaf, cols: maxD + 1, kids };
  }
};

/* ---------- Normalización de proyectos importados ---------- */
Seq.normalize = function (p) {
  const base = Seq.newProject();
  if (!p || p.app !== 'seq') throw new Error('not a seq project');
  const out = Object.assign(base, p);
  out.patterns = (p.patterns || []).slice(0, Seq.SLOTS);
  while (out.patterns.length < Seq.SLOTS) out.patterns.push(Seq.newPattern());
  out.patterns.forEach(pt => ['A', 'B'].forEach(v => { if (pt.v[v]) Seq.normData(pt.v[v]); }));
  out.trees = p.trees || {};
  if (!Seq.SCALES[out.scale]) out.scale = 'ionian';
  return out;
};
Seq.normData = function (d) {
  d.tracks.forEach((t, i) => {
    const nt = Seq.newTrack(i);
    for (const k in nt) if (t[k] === undefined) t[k] = nt[k];
    while (t.steps.length < Seq.MAXLEN) t.steps.push(Seq.newStep());
    t.steps = t.steps.map(s => (s && typeof s === 'object') ? Seq.unpackStep(s) : Seq.newStep());
    while (t.steps.length < Seq.MAXLEN) t.steps.push(Seq.newStep());
  });
  if (!d.bars) d.bars = 1;
  return d;
};

/* LCM de los largos (en semicorcheas) para un ciclo completo de polirritmo */
Seq.cycleSixteenths = function (data) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  let l = 1;
  data.tracks.forEach(t => {
    const spb = Seq.DIVS[t.div] || 4;
    // largo en "cuartos de 1/48" para contemplar tresillos
    const units = t.len * (48 / spb);
    l = l * units / gcd(l, units);
  });
  return l / 12; // semicorcheas
};

/* datos activos (variación A/B) del slot actual */
Seq.curData = function (proj, slot) {
  const p = proj.patterns[slot === undefined ? proj.slot : slot];
  return (p.cur === 'B' && p.v.B) ? p.v.B : p.v.A;
};

/* ---------- empaquetado compacto (pasos por defecto → 0, solo campos distintos) ---------- */
const DEF = JSON.stringify(Seq.newStep());
Seq.packStep = function (s) {
  if (JSON.stringify(s) === DEF) return 0;
  const d = Seq.newStep(), o = {};
  for (const k in s) if (JSON.stringify(s[k]) !== JSON.stringify(d[k])) o[k] = s[k];
  return o;
};
Seq.unpackStep = s => Object.assign(Seq.newStep(), s || {});
Seq.packPattern = function (pt) {
  const c = Seq.clone(pt);
  ['A', 'B'].forEach(v => { if (c.v[v]) c.v[v].tracks.forEach(t => {
    t.steps = t.steps.map(Seq.packStep);
    while (t.steps.length && t.steps[t.steps.length - 1] === 0) t.steps.pop();
  }); });
  return c;
};
Seq.unpackPattern = function (pt) {
  ['A', 'B'].forEach(v => { if (pt.v[v]) Seq.normData(pt.v[v]); });
  return pt;
};
