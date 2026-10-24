/* Seq · U-MA — render determinista y exportaciones: MIDI, JSON, Lua (norns), texto */
'use strict';
(function () {
const Seq = window.Seq;
const E = Seq.exp = {};

/* Perfiles de equipo: ajustan canales, monofonía y acentos del MIDI */
E.PROFILES = {
  general:   { ch: t => t.ch },
  elektron:  { ch: (t, i) => i + 1, max: 8 },
  cycles:    { ch: (t, i) => i + 1, max: 6 },
  tb03:      { ch: () => 1, mono: true, max: 1, accent: true, melodic: true },
  monologue: { ch: () => 1, mono: true, max: 1, melodic: true },
  polyend:   { ch: (t, i) => i + 1, max: 8 }
};

/*
 * render(proj, {mode:'pattern'|'song', bars:n|'cycle', seed, profile, only})
 * Devuelve { tracks:[{name, ch, notes:[{t,d,midi,vel}], cc:[{t,cc,v}]}], len } con tiempos en semicorcheas.
 */
E.render = function (proj, opt) {
  opt = Object.assign({ mode: 'pattern', bars: 4, seed: 1234, profile: 'general', only: null }, opt);
  const prof = E.PROFILES[opt.profile] || E.PROFILES.general;
  const rnd = Seq.rng(opt.seed);
  const segs = [];
  if (opt.mode === 'song' && proj.chain.length) {
    proj.chain.forEach(e => { const d = Seq.curData(proj, e.slot); segs.push({ d, len: 16 * (d.bars || 1) * (e.rep || 1) }); });
  } else {
    const d = Seq.curData(proj);
    let bars = opt.bars;
    if (bars === 'cycle') bars = Math.min(64, Math.ceil(Seq.cycleSixteenths(d) / 16));
    segs.push({ d, len: 16 * bars });
  }
  const base = segs[0].d;
  let sel = base.tracks.map((t, i) => i);
  if (opt.only !== null && opt.only !== undefined) sel = [opt.only];
  if (prof.melodic) sel = sel.filter(i => !Seq.isDrum(base.tracks[i]));
  if (prof.max) sel = sel.slice(0, prof.max);
  const out = sel.map((i, k) => ({ i, name: base.tracks[i].name, ch: prof.ch(base.tracks[i], k), notes: [], cc: [] }));
  let off = 0;
  segs.forEach(sg => {
    const d = sg.d, aud = Seq.audible(d);
    out.forEach(o => {
      const tr = d.tracks[o.i]; if (!tr) return;
      const st = Seq.newTrackState(), spb = Seq.DIVS[tr.div] || 4, sl = 4 / spb; // largo de paso en semicorcheas
      const lastCC = {}, laneCC = {};
      tr.mods.forEach(m => { if (m.on) laneCC[m.cc] = true; });
      for (let n = 0; n * sl < sg.len - 1e-6; n++) {
        let t = off + n * sl;
        if (proj.swing && n % 2 && spb % 2 === 0) t += (proj.swing / 100) * sl * 0.5;
        const ev = Seq.evalTick(proj, tr, st, rnd, false);
        const st0 = tr.steps[ev.idx];
        for (const k in ev.cc) {
          if (laneCC[k] && !(ev.played && st0.pl[k] !== undefined)) continue;
          if (lastCC[k] !== ev.cc[k]) { o.cc.push({ t, cc: +k, v: ev.cc[k] }); lastCC[k] = ev.cc[k]; }
        }
        if (!aud[o.i]) continue;
        let notes = ev.notes;
        if (prof.mono && notes.length) {
          const byOff = {}; notes.forEach(x => { const key = x.off.toFixed(4); if (!byOff[key] || x.midi < byOff[key].midi) byOff[key] = x; });
          notes = Object.values(byOff);
        }
        notes.forEach(x => {
          let vel = x.vel;
          if (prof.accent) vel = vel >= 100 ? 127 : 72;
          o.notes.push({ t: Math.max(0, t + x.off * sl), d: Math.max(0.05, x.dur * sl), midi: x.midi, vel });
        });
      }
      // modulación continua: resolución 1/64 en lanes
      tr.mods.forEach(m => {
        if (!m.on) return;
        const cyc = tr.len * sl;
        let prev = -1;
        for (let x = 0; x < sg.len; x += 0.25) {
          const v = Math.round(Seq.curveAt(m.pts, (x % cyc) / cyc) * 127);
          if (v !== prev) o.cc.push({ t: off + x, cc: m.cc, v });
          prev = v;
        }
      });
    });
    off += sg.len;
  });
  out.forEach(o => {
    o.cc.sort((a, b) => a.t - b.t);
    // en mono, recortar superposiciones salvo slides (que ya vienen solapadas a propósito)
    if (prof.mono) { o.notes.sort((a, b) => a.t - b.t); }
  });
  return { tracks: out, len: off };
};

/* ---------- Escritor SMF ---------- */
const PPQ = 96, T16 = PPQ / 4;
function vlq(n) { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; }
function str(s) { return Array.from(new TextEncoder().encode(s)); }
function chunk(id, data) { const l = data.length; return str(id).concat([(l >>> 24) & 255, (l >>> 16) & 255, (l >>> 8) & 255, l & 255], data); }
function meta(type, bytes) { return [0xff, type].concat(vlq(bytes.length), bytes); }

function trackBytes(name, evs) {
  evs.sort((a, b) => a.tk - b.tk || a.o - b.o);
  let last = 0, data = [0].concat(meta(0x03, str(name)));
  evs.forEach(e => { data = data.concat(vlq(e.tk - last), e.b); last = e.tk; });
  return chunk('MTrk', data.concat([0], meta(0x2f, [])));
}

E.midi = function (proj, opt) {
  const r = E.render(proj, opt);
  const tempo = Math.round(60000000 / proj.bpm);
  const t0 = [0].concat(meta(0x03, str('Seq · U-MA')), [0], meta(0x51, [(tempo >> 16) & 255, (tempo >> 8) & 255, tempo & 255]), [0], meta(0x58, [4, 2, 24, 8]),
    vlq(Math.round(r.len * T16)), meta(0x2f, []));
  const chunks = [chunk('MTrk', t0)];
  r.tracks.forEach(o => {
    const ch = (o.ch - 1) & 15, evs = [];
    o.cc.forEach(c => evs.push({ tk: Math.round(c.t * T16), o: 1, b: [0xb0 | ch, c.cc & 127, c.v & 127] }));
    // gestionar notas superpuestas del mismo tono
    const byPitch = {};
    o.notes.forEach(n => (byPitch[n.midi] = byPitch[n.midi] || []).push(n));
    for (const p in byPitch) {
      const L = byPitch[p].sort((a, b) => a.t - b.t);
      L.forEach((n, k) => {
        const on = Math.round(n.t * T16);
        let off = Math.round((n.t + n.d) * T16);
        if (L[k + 1]) off = Math.min(off, Math.round(L[k + 1].t * T16));
        if (off <= on) off = on + 1;
        evs.push({ tk: on, o: 2, b: [0x90 | ch, +p, Math.max(1, Math.min(127, n.vel))] });
        evs.push({ tk: off, o: 0, b: [0x80 | ch, +p, 0] });
      });
    }
    chunks.push(trackBytes(o.name + ' · ch' + o.ch, evs));
  });
  const hdr = chunk('MThd', [0, 1, 0, chunks.length, (PPQ >> 8) & 255, PPQ & 255]);
  return new Uint8Array(hdr.concat(...chunks));
};

/* ---------- JSON ---------- */
E.patternJSON = function (proj) {
  const pt = proj.patterns[proj.slot], trimmed = Seq.clone(pt);
  ['A', 'B'].forEach(v => { if (trimmed.v[v]) trimmed.v[v].tracks.forEach(t => t.steps = t.steps.slice(0, t.len)); });
  return JSON.stringify({ app: 'seq', kind: 'pattern', version: 1, bpm: proj.bpm, swing: proj.swing, root: proj.root, scale: proj.scale,
    scaleSteps: Seq.scale(proj), slot: E.slotName(proj.slot), pattern: trimmed }, null, 2);
};
E.projectJSON = function (proj, withTree) {
  const p = Seq.clone(proj);
  p.patterns = p.patterns.map(Seq.packPattern);
  if (!withTree) p.trees = {};
  return JSON.stringify(p);
};
E.slotName = i => 'A' + (i + 1);

/* ---------- Lua (norns) ---------- */
const lv = v => typeof v === 'string' ? JSON.stringify(v) : typeof v === 'boolean' ? (v ? 'true' : 'false') : String(Math.round(v * 1000) / 1000);
E.lua = function (proj, opt) {
  opt = Object.assign({ player: true, drumGrid: true }, opt);
  const d = Seq.curData(proj), sc = Seq.scale(proj);
  const L = [];
  L.push('-- Seq · U-MA — pattern ' + E.slotName(proj.slot) + (proj.patterns[proj.slot].name ? ' (' + proj.patterns[proj.slot].name + ')' : ''));
  L.push('-- ' + Seq.NOTE_NAMES[proj.root] + ' ' + Seq.SCALES[proj.scale].n + ' · ' + proj.bpm + ' bpm');
  L.push('-- note = nota MIDI ya resuelta; deg = grado de escala (0 = tónica) para transponer modalmente');
  L.push('-- gate en pasos (0.5 = medio paso), micro en % de paso (-50..50), prob 0..100');
  L.push('');
  L.push('local seq_pattern = {');
  L.push('  bpm = ' + proj.bpm + ', swing = ' + proj.swing + ', root = ' + proj.root + ', scale_name = "' + proj.scale + '",');
  L.push('  scale = {' + sc.join(', ') + '},');
  L.push('  tracks = {');
  d.tracks.forEach(t => {
    const drum = Seq.isDrum(t);
    L.push('    { -- ' + t.name);
    L.push('      name = "' + t.name + '", sound = "' + t.sound + '", len = ' + t.len + ', dir = "' + t.dir + '", div = ' + (Seq.DIVS[t.div] || 4) + ', ch = ' + t.ch + ', oct = ' + t.oct + ',');
    L.push('      steps = {');
    for (let i = 0; i < t.len; i++) {
      const s = t.steps[i];
      if (!s.on) { L.push('        {on = false},'); continue; }
      const notes = Seq.noteSet(s).map(g => Seq.degToMidi(proj, t, g));
      const f = ['on = true', 'deg = ' + s.deg, 'note = ' + notes[0], 'vel = ' + s.vel, 'gate = ' + lv(s.gate), 'prob = ' + s.prob, 'ratch = ' + s.ratch];
      if (s.micro) f.push('micro = ' + s.micro);
      if (s.slide) f.push('slide = true');
      if (s.tie) f.push('tie = true');
      if (notes.length > 1) f.push('chord = {' + notes.join(', ') + '}');
      if (s.arp !== 'off') f.push('arp = "' + s.arp + '"');
      if (s.cond) f.push('cond = "' + s.cond + '"');
      if (drum) f.push('drum = "' + Seq.noteSet(s).map(g => Seq.DRUMS[((g % 8) + 8) % 8].id).join('+') + '"');
      const pl = Object.keys(s.pl); if (pl.length) f.push('cc = {' + pl.map(k => '[' + k + '] = ' + s.pl[k]).join(', ') + '}');
      L.push('        {' + f.join(', ') + '},');
    }
    L.push('      },');
    const mods = t.mods.filter(m => m.on);
    if (mods.length) {
      L.push('      mod = {');
      mods.forEach(m => {
        const vals = []; for (let i = 0; i < t.len; i++) vals.push(Math.round(Seq.curveAt(m.pts, i / t.len) * 127));
        L.push('        [' + m.cc + '] = {' + vals.join(', ') + '},');
      });
      L.push('      },');
    }
    if (drum && opt.drumGrid) {
      L.push('      -- matriz por instrumento (velocidad 0..127), estilo caja16 / Druma');
      L.push('      grid = {');
      Seq.DRUMS.forEach((dr, k) => {
        const row = []; for (let i = 0; i < t.len; i++) { const s = t.steps[i]; row.push(s.on && Seq.noteSet(s).some(g => ((g % 8) + 8) % 8 === k) ? s.vel : 0); }
        L.push('        ' + dr.id + ' = {' + row.join(', ') + '},');
      });
      L.push('      },');
    }
    L.push('    },');
  });
  L.push('  },');
  L.push('}');
  L.push('');
  if (opt.player) {
    L.push('--[[ reproductor mínimo para norns: pegá esto en tu script y llamá seq_play()');
    L.push('     usa MIDI (midi.connect()) — reemplazá note_on por engine.* si usás un engine propio');
    L.push('local m = midi.connect()');
    L.push('local function note_on(t, n, v, dur) m:note_on(n, v, t.ch); clock.run(function() clock.sleep(dur) m:note_off(n, 0, t.ch) end) end');
    L.push('function seq_play()');
    L.push('  params:set("clock_tempo", seq_pattern.bpm)');
    L.push('  for _, t in ipairs(seq_pattern.tracks) do');
    L.push('    clock.run(function()');
    L.push('      local i, loop = 0, 0');
    L.push('      while true do');
    L.push('        clock.sync(1 / t.div)');
    L.push('        local s = t.steps[(i % t.len) + 1]');
    L.push('        if s.on and math.random(100) <= s.prob then');
    L.push('          local dur = clock.get_beat_sec() / t.div * s.gate');
    L.push('          for _, n in ipairs(s.chord or {s.note}) do note_on(t, n, s.vel, dur) end');
    L.push('        end');
    L.push('        i = i + 1');
    L.push('      end');
    L.push('    end)');
    L.push('  end');
    L.push('end');
    L.push(']]');
    L.push('');
  }
  L.push('return seq_pattern');
  return L.join('\n');
};

/* ---------- Texto legible ---------- */
E.text = function (proj) {
  const d = Seq.curData(proj), L = [];
  const pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, n);
  L.push('SEQ · U-MA · ' + E.slotName(proj.slot) + (proj.patterns[proj.slot].cur === 'B' ? '/B' : '/A') + ' · ' + proj.bpm + ' BPM · swing ' + proj.swing + '% · ' + Seq.NOTE_NAMES[proj.root] + ' ' + Seq.SCALES[proj.scale].n);
  L.push('');
  d.tracks.forEach((t, ti) => {
    L.push('T' + (ti + 1) + ' ' + pad(t.name, 6) + ' ' + t.sound + ' · len ' + t.len + ' · ' + t.dir + ' · ' + t.div + ' · ch ' + t.ch + (t.mute ? ' · MUTE' : ''));
    L.push('  st  note        deg  vel gate  prob rat micro  flags');
    for (let i = 0; i < t.len; i++) {
      const s = t.steps[i];
      if (!s.on) { L.push('  ' + pad(String(i + 1).padStart(2, '0'), 3) + ' ---'); continue; }
      const names = Seq.noteSet(s).map(g => Seq.degName(proj, t, g)).join('+');
      const fl = [s.slide && 'SLIDE', s.tie && 'TIE', s.arp !== 'off' && 'ARP:' + s.arp, s.cond && 'IF:' + s.cond, s.lock && 'LOCK',
        Object.keys(s.pl).length && 'CC:' + Object.keys(s.pl).map(k => k + '=' + s.pl[k]).join(',')].filter(Boolean).join(' ');
      L.push('  ' + pad(String(i + 1).padStart(2, '0'), 3) + ' ' + pad(names, 11) + ' ' + pad(s.deg, 4) + ' ' + pad(s.vel, 4) + pad(s.gate, 5) + ' ' + pad(s.prob, 4) + ' ' + pad(s.ratch, 3) + ' ' + pad(s.micro, 6) + ' ' + fl);
    }
    L.push('');
  });
  return L.join('\n');
};

/* ---------- Descargas ---------- */
E.download = function (name, data, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
};
})();
