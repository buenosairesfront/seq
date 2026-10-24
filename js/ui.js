/* Seq · U-MA — interfaz: vistas en canvas, inspector, generación, árbol, banco, exportación */
'use strict';
(function () {
const Seq = window.Seq, A = Seq.audio, P = Seq.player, E = Seq.exp, I = Seq.i18n;
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const t = k => I.t(k);
const C = { mag: '#E3337E', cya: '#23B5DC', yel: '#E8C42A', sil: '#C8C9CB', ink: '#E9E9E8', dim: '#55565a', line: 'rgba(233,233,232,.13)', line2: 'rgba(233,233,232,.26)' };
const TCOL = [C.mag, C.cya, C.yel, C.sil, '#ff86b6', '#86e0f7', '#f5e08a', '#ffffff'];
const OPCOL = { root: C.ink, mutate: C.mag, random: C.yel, euclid: C.yel, edit: C.sil, track: C.sil, ab: C.cya, paste: C.cya, clear: C.sil };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const clamp = Seq.clamp;

/* ---------- estado ---------- */
let proj;
const ui = { view: 'grid', tr: 0, step: 0, tool: 'trig', layer: 'vel', plcc: 74, gen: Seq.defaultGen(), clip: null,
  head: [], flashes: [], hoverNode: null, rollRange: null, drag: null };

function load() {
  try {
    const raw = localStorage.getItem('seq.project');
    if (raw) proj = Seq.normalize(JSON.parse(raw));
  } catch (e) { proj = null; }
  if (!proj) proj = Seq.newProject();
  try { const g = JSON.parse(localStorage.getItem('seq.gen') || 'null'); if (g) Object.assign(ui.gen, g); } catch (e) {}
  try { const v = localStorage.getItem('seq.view'); if (v) ui.view = v; } catch (e) {}
  Seq.tree.ensureRoot(proj, proj.slot);
}
let saveT = 0;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    try { localStorage.setItem('seq.project', E.projectJSON(proj, true)); }
    catch (e) { try { localStorage.setItem('seq.project', E.projectJSON(proj, false)); } catch (e2) {} }
    try { localStorage.setItem('seq.gen', JSON.stringify(ui.gen)); localStorage.setItem('seq.view', ui.view); } catch (e) {}
  }, 400);
}
const data = () => Seq.curData(proj);
const track = () => data().tracks[ui.tr];
const step = () => track().steps[ui.step];
const pat = () => proj.patterns[proj.slot];

/* ---------- historial ---------- */
let editT = 0;
function commit(op) {
  clearTimeout(editT);
  pat().used = true;
  Seq.tree.commit(proj, proj.slot, op);
  save(); drawTree(); drawSlots();
}
function edited() {
  pat().used = true;
  save(); drawSlots();
  clearTimeout(editT);
  editT = setTimeout(() => { Seq.tree.commit(proj, proj.slot, 'edit'); save(); drawTree(); }, 700);
}
function flushEdit() { if (editT) { clearTimeout(editT); editT = 0; Seq.tree.commit(proj, proj.slot, 'edit'); } }
function goto(id) {
  flushEdit();
  if (Seq.tree.checkout(proj, proj.slot, id)) { fixSel(); refresh(); save(); }
}
function fixSel() {
  const d = data();
  ui.tr = clamp(ui.tr, 0, d.tracks.length - 1);
  ui.step = clamp(ui.step, 0, track().len - 1);
}

/* ---------- toast ---------- */
let toastT = 0;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1600); }

/* ---------- operaciones de un toque ---------- */
function scopeTracks() { return ui.gen.scope === 'all' ? data().tracks : [track()]; }
function applyOp(op, btn) {
  flushEdit();
  let ch = false;
  scopeTracks().forEach(tr => { if (Seq.ops[op](tr, ui.gen, proj)) ch = true; });
  if (!ch) { toast(t('msg_nochange')); return; }
  fixSel();
  commit(op);
  refresh();
  if (btn) { btn.classList.remove('ping'); void btn.offsetWidth; btn.classList.add('ping'); }
  burst(op);
}
function mutate() {
  const b = $('#bMutate'); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  applyOp('mutate');
}

/* ---------- canvas principal ---------- */
const cv = $('#cv'), cx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
function resize() {
  const r = $('#cvWrap').getBoundingClientRect();
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(10, r.width); H = Math.max(10, r.height);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ui.rollRange = null;
}

/* consumir eventos del reloj para cabezales y destellos */
function consume() {
  if (!P.on || !A.ctx) { return; }
  const now = A.ctx.currentTime;
  let k = 0;
  while (k < P.vis.length && P.vis[k].time <= now) {
    const e = P.vis[k];
    ui.head[e.tr] = e.idx;
    if (e.played) ui.flashes.push({ tr: e.tr, idx: e.idx, t0: performance.now() });
    k++;
  }
  if (k) P.vis.splice(0, k);
}

const sparks = [];
function burst(op) {
  const col = OPCOL[op] || C.cya;
  for (let i = 0; i < 40; i++) sparks.push({ x: W / 2, y: H / 2, vx: (Math.random() - .5) * 9, vy: (Math.random() - .5) * 9, life: 1, col });
}

function frame() {
  consume();
  cx.clearRect(0, 0, W, H);
  bgGrid();
  if (ui.view === 'grid') drawGrid();
  else if (ui.view === 'roll') drawRoll();
  else if (ui.view === 'lane') drawLane();
  else drawOrbit();
  const now = performance.now();
  ui.flashes = ui.flashes.filter(f => now - f.t0 < 450);
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vx *= .94; s.vy *= .94; s.life -= .025;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    cx.fillStyle = rgba(s.col, s.life * .8); cx.fillRect(s.x, s.y, 2, 2);
  }
  drawScope();
  drawTrackHeads();
  requestAnimationFrame(frame);
}
function bgGrid() {
  cx.strokeStyle = 'rgba(233,233,232,.035)'; cx.lineWidth = 1;
  cx.beginPath();
  for (let x = 0; x < W; x += 24) { cx.moveTo(x + .5, 0); cx.lineTo(x + .5, H); }
  for (let y = 0; y < H; y += 24) { cx.moveTo(0, y + .5); cx.lineTo(W, y + .5); }
  cx.stroke();
}
function glow(col, b) { cx.shadowColor = col; cx.shadowBlur = b; }
function noGlow() { cx.shadowBlur = 0; }
function flashAge(tr, idx) {
  const f = ui.flashes.find(f => f.tr === tr && f.idx === idx);
  return f ? (performance.now() - f.t0) / 450 : -1;
}
function degRange(tr) {
  if (Seq.isDrum(tr)) return [0, 7];
  let lo = 99, hi = -99;
  tr.steps.slice(0, tr.len).forEach(s => { if (s.on) Seq.noteSet(s).forEach(d => { lo = Math.min(lo, d); hi = Math.max(hi, d); }); });
  if (lo > hi) { lo = 0; hi = 7; }
  return [lo, hi];
}

/* ===== GRID ===== */
function gridGeom() {
  const d = data(), gut = 46, pad = 8;
  const maxL = Math.max(16, ...d.tracks.map(tr => Math.min(32, tr.len)));
  const cw = (W - gut - pad) / maxL;
  const lines = d.tracks.map(tr => Math.ceil(tr.len / 32));
  const tot = lines.reduce((a, b) => a + b, 0);
  const gap = 10;
  const lh = Math.min(118, (H - pad * 2 - gap * (d.tracks.length - 1)) / tot);
  const rows = []; let y = pad;
  d.tracks.forEach((tr, i) => { rows.push({ y, h: lh * lines[i], lines: lines[i] }); y += lh * lines[i] + gap; });
  return { gut, cw, lh, rows, maxL, pad };
}
function cellRect(g, ti, i) {
  const r = g.rows[ti], ln = Math.floor(i / 32), col = i % 32;
  return { x: g.gut + col * g.cw, y: r.y + ln * g.lh, w: g.cw, h: g.lh };
}
function drawGrid() {
  const d = data(), g = gridGeom();
  d.tracks.forEach((tr, ti) => {
    const r = g.rows[ti], col = TCOL[ti % 8], sel = ti === ui.tr;
    const aud = Seq.audible(d)[ti];
    // etiqueta
    cx.fillStyle = sel ? col : rgba(col, .6);
    cx.font = '700 15px "Barlow Condensed","Arial Narrow",sans-serif'; cx.textBaseline = 'top';
    cx.fillText('T' + (ti + 1), 6, r.y + 2);
    cx.font = '9px "IBM Plex Mono",Menlo,monospace'; cx.fillStyle = aud ? C.sil : C.dim;
    cx.fillText(tr.name.slice(0, 5), 6, r.y + 20);
    cx.fillText(tr.len + ' ' + dirGlyph(tr.dir), 6, r.y + 32);
    if (sel) { cx.fillStyle = col; cx.fillRect(0, r.y, 2, r.h); }
    const [lo, hi] = degRange(tr);
    // celdas fuera de largo (huecos de polirritmo)
    for (let i = tr.len; i < Math.max(g.maxL, tr.len) && i < 32 * r.lines; i++) {
      const c = cellRect(g, ti, i);
      cx.strokeStyle = 'rgba(233,233,232,.05)'; cx.setLineDash([2, 3]);
      cx.strokeRect(c.x + 2.5, c.y + 2.5, c.w - 5, c.h - 5); cx.setLineDash([]);
    }
    for (let i = 0; i < tr.len; i++) drawCell(g, ti, tr, i, lo, hi, col, aud);
    if (!Seq.isDrum(tr)) contour(g, ti, tr, lo, hi, aud);
    // cabezal
    const h = ui.head[ti];
    if (P.on && h !== undefined && h < tr.len) {
      const c = cellRect(g, ti, h);
      const grd = cx.createLinearGradient(c.x, 0, c.x + c.w, 0);
      grd.addColorStop(0, 'rgba(35,181,220,0)'); grd.addColorStop(.5, 'rgba(35,181,220,.22)'); grd.addColorStop(1, 'rgba(35,181,220,0)');
      cx.fillStyle = grd; cx.fillRect(c.x, c.y, c.w, c.h);
      glow(C.cya, 10); cx.fillStyle = C.cya; cx.fillRect(c.x + 1, c.y + c.h - 2, c.w - 2, 2); noGlow();
    }
  });
}
/* contorno melódico: línea fina que une las notas de la pista */
function contour(g, ti, tr, lo, hi, aud) {
  cx.beginPath(); let started = false, lastLn = -1;
  for (let i = 0; i < tr.len; i++) {
    const s = tr.steps[i]; if (!s.on) continue;
    const c = cellRect(g, ti, i), top = (c.h - 4) * .62;
    const x = c.x + c.w / 2 + s.micro / 100 * c.w, y = c.y + 5 + (1 - (s.deg - lo) / Math.max(1, hi - lo)) * (top - 7);
    const ln = Math.floor(i / 32);
    if (!started || ln !== lastLn) { cx.moveTo(x, y); started = true; } else cx.lineTo(x, y);
    lastLn = ln;
  }
  glow('#fff', 6); cx.strokeStyle = aud ? 'rgba(255,255,255,.38)' : 'rgba(255,255,255,.1)'; cx.lineWidth = 1; cx.stroke(); noGlow();
}
function dirGlyph(d) { return { fwd: '→', rev: '←', pp: '↔', rnd: '⁂', drunk: '≈' }[d] || '→'; }
function drawCell(g, ti, tr, i, lo, hi, col, aud) {
  const c = cellRect(g, ti, i), s = tr.steps[i];
  const x = c.x + 2, y = c.y + 2, w = c.w - 4, h = c.h - 4;
  const beat = i % 4 === 0;
  cx.lineWidth = 1;
  cx.strokeStyle = beat ? 'rgba(233,233,232,.24)' : 'rgba(233,233,232,.11)';
  cx.strokeRect(x + .5, y + .5, w - 1, h - 1);
  const fa = flashAge(ti, i);
  if (s.on) {
    const va = .18 + (s.vel / 127) * .62;
    const top = h * .62;
    // bloque de nota (magenta)
    const grd = cx.createLinearGradient(0, y, 0, y + top);
    grd.addColorStop(0, rgba(C.mag, aud ? va : va * .3)); grd.addColorStop(1, rgba(C.mag, aud ? va * .35 : .05));
    cx.fillStyle = grd; cx.fillRect(x + 1, y + 1, w - 2, top);
    // tono: marca horizontal según grado
    const set = Seq.noteSet(s);
    set.forEach((dg, k) => {
      const ny = y + 3 + (1 - (dg - lo) / Math.max(1, hi - lo)) * (top - 7);
      cx.fillStyle = k ? 'rgba(255,255,255,.55)' : '#fff';
      cx.fillRect(x + 3, ny, w - 6, k ? 1 : 2);
    });
    // probabilidad (amarillo): barra a la derecha
    if (s.prob < 100) {
      cx.fillStyle = C.yel; const ph = (top - 4) * s.prob / 100;
      cx.fillRect(x + w - 4, y + 2 + (top - 4 - ph), 2, ph);
      cx.fillStyle = rgba(C.yel, .25); cx.fillRect(x + w - 4, y + 2, 2, top - 4 - ph);
    }
    // ratchet: ticks arriba
    if (s.ratch > 1) {
      cx.fillStyle = C.cya;
      for (let k = 0; k < s.ratch; k++) cx.fillRect(x + 3 + k * ((w - 6) / s.ratch), y + 3, Math.max(1, (w - 6) / s.ratch - 2), 2);
    }
    // gate (plata)
    const gy = y + top + 4;
    const gl = Math.min(s.tie ? Seq.stepsToNext(tr, i) : s.gate, 8) * c.w - 4;
    cx.strokeStyle = C.sil; cx.lineWidth = 1.5;
    if (s.tie) cx.setLineDash([3, 2]);
    cx.beginPath(); cx.moveTo(x + 2 + s.micro / 100 * w, gy); cx.lineTo(x + 2 + s.micro / 100 * w + gl, gy); cx.stroke(); cx.setLineDash([]);
    // micro: triángulo
    if (s.micro) {
      cx.fillStyle = C.sil; const mx = x + w / 2 + s.micro / 100 * w;
      cx.beginPath(); cx.moveTo(mx, gy - 3); cx.lineTo(mx - 3, gy + 3); cx.lineTo(mx + 3, gy + 3); cx.fill();
    }
    // velocity (cian): barra inferior
    cx.fillStyle = rgba(C.cya, .18); cx.fillRect(x + 2, y + h - 6, w - 4, 3);
    cx.fillStyle = C.cya; cx.fillRect(x + 2, y + h - 6, (w - 4) * s.vel / 127, 3);
    // slide: curva al siguiente
    if (s.slide) {
      cx.strokeStyle = C.mag; cx.lineWidth = 1.5; cx.beginPath();
      cx.moveTo(x + w - 4, y + top * .3); cx.quadraticCurveTo(x + w + 4, y + top * .3, x + w + 8, y + top * .7); cx.stroke();
    }
    // arp
    if (s.arp !== 'off') { cx.fillStyle = C.mag; cx.font = '9px "IBM Plex Mono",Menlo,monospace'; cx.textBaseline = 'top'; cx.fillText('↗', x + 3, y + top - 11); }
    if (fa >= 0) {
      glow(C.mag, 18); cx.strokeStyle = rgba('#ffffff', 1 - fa); cx.lineWidth = 2;
      const e = fa * 6; cx.strokeRect(x - e, y - e, w + e * 2, h + e * 2); noGlow();
    }
  }
  // condición (amarillo)
  if (s.cond) {
    cx.fillStyle = s.on ? C.yel : rgba(C.yel, .4); cx.font = '8px "IBM Plex Mono",Menlo,monospace'; cx.textBaseline = 'bottom';
    cx.fillText(s.cond.toUpperCase(), x + 3, y + h - 8);
  }
  // p-lock (punto cian)
  if (Object.keys(s.pl).length) { cx.fillStyle = C.cya; glow(C.cya, 6); cx.beginPath(); cx.arc(x + w - 5, y + h - 12, 2.2, 0, 7); cx.fill(); noGlow(); }
  // bloqueo
  if (s.lock) {
    cx.strokeStyle = C.ink; cx.lineWidth = 1.5; const k = Math.min(8, w / 3);
    cx.beginPath();
    cx.moveTo(x, y + k); cx.lineTo(x, y); cx.lineTo(x + k, y);
    cx.moveTo(x + w - k, y); cx.lineTo(x + w, y); cx.lineTo(x + w, y + k);
    cx.moveTo(x, y + h - k); cx.lineTo(x, y + h); cx.lineTo(x + k, y + h);
    cx.moveTo(x + w - k, y + h); cx.lineTo(x + w, y + h); cx.lineTo(x + w, y + h - k);
    cx.stroke();
  }
  if (ti === ui.tr && i === ui.step) { glow('#fff', 8); cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.strokeRect(x - 1, y - 1, w + 2, h + 2); noGlow(); }
  // número de paso
  if (beat && c.w > 18) { cx.fillStyle = 'rgba(233,233,232,.3)'; cx.font = '8px "IBM Plex Mono",Menlo,monospace'; cx.textBaseline = 'top'; cx.fillText(i + 1, x + 2, y - 0 + h - 0 > 0 ? y + 2 : y); }
}
function hitGrid(px, py) {
  const g = gridGeom(), d = data();
  for (let ti = 0; ti < d.tracks.length; ti++) {
    const r = g.rows[ti];
    if (py >= r.y && py < r.y + r.h) {
      const ln = Math.floor((py - r.y) / g.lh), col = Math.floor((px - g.gut) / g.cw);
      if (col < 0 || col >= 32) return { ti, i: -1 };
      const i = ln * 32 + col;
      return { ti, i: i < d.tracks[ti].len ? i : -1 };
    }
  }
  return null;
}

/* ===== ROLL ===== */
function rollGeom() {
  const tr = track(), gut = 50, pad = 8;
  if (!ui.rollRange) {
    const n = Seq.isDrum(tr) ? 8 : Seq.scale(proj).length;
    let [lo, hi] = degRange(tr);
    if (Seq.isDrum(tr)) { lo = 0; hi = 7; }
    else {
      lo = Math.min(lo - 2, 0); hi = Math.max(hi + 2, lo + 2 * n);
      if (hi - lo > 40) hi = lo + 40;
    }
    ui.rollRange = [lo, hi];
  }
  const [lo, hi] = ui.rollRange, rows = hi - lo + 1;
  const cw = (W - gut - pad) / tr.len, rh = (H - pad * 2) / rows;
  return { gut, pad, lo, hi, rows, cw, rh };
}
function drawRoll() {
  const tr = track(), g = rollGeom(), ti = ui.tr, col = TCOL[ti % 8];
  const n = Seq.scale(proj).length, drum = Seq.isDrum(tr);
  for (let r = 0; r < g.rows; r++) {
    const dg = g.hi - r, y = g.pad + r * g.rh;
    const root = !drum && ((dg % n) + n) % n === 0;
    cx.fillStyle = root ? 'rgba(227,51,126,.07)' : (r % 2 ? 'rgba(233,233,232,.015)' : 'transparent');
    cx.fillRect(g.gut, y, W - g.gut - g.pad, g.rh);
    cx.strokeStyle = root ? 'rgba(227,51,126,.3)' : 'rgba(233,233,232,.06)'; cx.beginPath(); cx.moveTo(g.gut, y + g.rh + .5); cx.lineTo(W - g.pad, y + g.rh + .5); cx.stroke();
    if (g.rh >= 9) {
      cx.fillStyle = root ? C.mag : C.muted || '#8C8D90'; cx.font = (g.rh > 14 ? 10 : 8) + 'px "IBM Plex Mono",Menlo,monospace'; cx.textBaseline = 'middle';
      cx.fillText(Seq.degName(proj, tr, dg) + (drum ? '' : ' ' + (((dg % n) + n) % n + 1)), 4, y + g.rh / 2);
    }
  }
  for (let i = 0; i <= tr.len; i++) {
    const x = g.gut + i * g.cw;
    cx.strokeStyle = i % 4 === 0 ? 'rgba(233,233,232,.2)' : 'rgba(233,233,232,.06)';
    cx.beginPath(); cx.moveTo(x + .5, g.pad); cx.lineTo(x + .5, H - g.pad); cx.stroke();
  }
  if (P.on && ui.head[ti] !== undefined) {
    const x = g.gut + ui.head[ti] * g.cw;
    cx.fillStyle = 'rgba(35,181,220,.1)'; cx.fillRect(x, g.pad, g.cw, H - g.pad * 2);
    glow(C.cya, 10); cx.fillStyle = C.cya; cx.fillRect(x, g.pad, 1.5, H - g.pad * 2); noGlow();
  }
  for (let i = 0; i < tr.len; i++) {
    const s = tr.steps[i]; if (!s.on) continue;
    const fa = flashAge(ti, i);
    Seq.noteSet(s).forEach((dg, k) => {
      if (dg < g.lo || dg > g.hi) return;
      const y = g.pad + (g.hi - dg) * g.rh;
      const x0 = g.gut + i * g.cw + s.micro / 100 * g.cw;
      const len = Math.max(.15, s.tie ? Seq.stepsToNext(tr, i) : s.gate) * g.cw;
      const a = .35 + .65 * s.vel / 127;
      const parts = s.ratch > 1 ? s.ratch : 1;
      for (let p = 0; p < parts; p++) {
        const px = x0 + p * g.cw / parts, pw = parts > 1 ? g.cw / parts - 2 : len - 2;
        if (fa >= 0) glow(C.mag, 20 * (1 - fa)); else glow(C.mag, 8);
        cx.fillStyle = rgba(C.mag, a * (k ? .7 : 1));
        cx.fillRect(px + 1, y + 1.5, Math.max(2, pw), g.rh - 3);
        noGlow();
      }
      cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fillRect(x0 + 1, y + 1.5, 2, g.rh - 3);
      if (s.prob < 100) { cx.fillStyle = C.yel; cx.fillRect(x0 + 1, y + g.rh - 3, (g.cw - 3) * s.prob / 100, 1.5); }
      if (s.slide && k === 0) {
        const nx = tr.steps[(i + 1) % tr.len];
        if (nx.on) {
          const y2 = g.pad + (g.hi - nx.deg) * g.rh + g.rh / 2;
          cx.strokeStyle = C.mag; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x0 + len - 2, y + g.rh / 2);
          cx.bezierCurveTo(x0 + len + g.cw * .3, y + g.rh / 2, x0 + g.cw * .7 + len - g.cw, y2, g.gut + (i + 1) * g.cw, y2); cx.stroke();
        }
      }
    });
    if (s.lock) { cx.strokeStyle = C.ink; cx.setLineDash([2, 2]); cx.strokeRect(g.gut + i * g.cw + 1.5, g.pad + .5, g.cw - 3, H - g.pad * 2 - 1); cx.setLineDash([]); }
  }
  // paso seleccionado
  const sx = g.gut + ui.step * g.cw;
  cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1; cx.strokeRect(sx + .5, g.pad + .5, g.cw - 1, H - g.pad * 2 - 1);
  hudSet(`<b style="color:${col}">T${ti + 1} ${tr.name}</b> · ${t('v_roll')}`);
}
function hitRoll(px, py) {
  const g = rollGeom();
  const i = Math.floor((px - g.gut) / g.cw), r = Math.floor((py - g.pad) / g.rh);
  if (i < 0 || i >= track().len || r < 0 || r >= g.rows) return null;
  return { i, deg: g.hi - r };
}

/* ===== LANE ===== */
const LANES = {
  vel:   { min: 1, max: 127, col: C.cya, get: s => s.vel, set: (s, v) => s.vel = Math.round(v) },
  gate:  { min: .05, max: 2, col: C.sil, get: s => s.gate, set: (s, v) => s.gate = Math.round(v * 20) / 20 },
  prob:  { min: 0, max: 100, col: C.yel, get: s => s.prob, set: (s, v) => s.prob = Math.round(v / 5) * 5 },
  ratch: { min: 1, max: 8, col: C.cya, get: s => s.ratch, set: (s, v) => s.ratch = Math.round(v), steps: true },
  micro: { min: -50, max: 50, col: C.sil, get: s => s.micro, set: (s, v) => s.micro = Math.round(v), bi: true },
  deg:   { min: -7, max: 21, col: C.mag, get: s => s.deg, set: (s, v) => s.deg = Math.round(v), steps: true, bi: true },
  pl:    { min: 0, max: 127, col: C.cya, get: s => s.pl[ui.plcc], set: (s, v) => s.pl[ui.plcc] = Math.round(v) }
};
function laneGeom() { const tr = track(), gut = 40, pad = 10; return { gut, pad, cw: (W - gut - pad) / tr.len, h: H - pad * 2 - 14 }; }
function drawLane() {
  const tr = track(), g = laneGeom(), ti = ui.tr, L = ui.layer;
  const y0 = g.pad, y1 = g.pad + g.h;
  // guías
  cx.font = '9px "IBM Plex Mono",Menlo,monospace'; cx.textBaseline = 'middle';
  for (let k = 0; k <= 4; k++) {
    const y = y0 + k * g.h / 4;
    cx.strokeStyle = 'rgba(233,233,232,.08)'; cx.beginPath(); cx.moveTo(g.gut, y + .5); cx.lineTo(W - g.pad, y + .5); cx.stroke();
  }
  for (let i = 0; i <= tr.len; i++) {
    const x = g.gut + i * g.cw;
    cx.strokeStyle = i % 4 === 0 ? 'rgba(233,233,232,.18)' : 'rgba(233,233,232,.05)';
    cx.beginPath(); cx.moveTo(x + .5, y0); cx.lineTo(x + .5, y1); cx.stroke();
    if (i < tr.len && i % 4 === 0) { cx.fillStyle = C.dim; cx.textBaseline = 'top'; cx.fillText(i + 1, x + 3, y1 + 3); }
  }
  if (P.on && ui.head[ti] !== undefined) {
    const x = g.gut + ui.head[ti] * g.cw;
    glow(C.cya, 10); cx.fillStyle = 'rgba(35,181,220,.7)'; cx.fillRect(x, y0, 1.5, g.h); noGlow();
  }
  if (L === 'mod0' || L === 'mod1') { drawCurve(tr.mods[+L[3]], g, ti); return; }
  const ln = LANES[L];
  let mn = ln.min, mx = ln.max;
  if (L === 'deg') { const r = degRange(tr); mn = Math.min(r[0] - 1, -1); mx = Math.max(r[1] + 1, Seq.scale(proj).length * 2); }
  ui.laneMin = mn; ui.laneMax = mx;
  const toY = v => y1 - (v - mn) / (mx - mn) * g.h;
  cx.fillStyle = C.dim; cx.textBaseline = 'middle';
  cx.fillText(fmtLane(L, mx), 2, y0 + 4); cx.fillText(fmtLane(L, mn), 2, y1 - 4);
  if (ln.bi) { const zy = toY(0); cx.strokeStyle = 'rgba(233,233,232,.3)'; cx.beginPath(); cx.moveTo(g.gut, zy); cx.lineTo(W - g.pad, zy); cx.stroke(); }
  if (L === 'gate') { const oy = toY(1); cx.strokeStyle = rgba(C.sil, .35); cx.setLineDash([4, 3]); cx.beginPath(); cx.moveTo(g.gut, oy); cx.lineTo(W - g.pad, oy); cx.stroke(); cx.setLineDash([]); cx.fillStyle = C.sil; cx.fillText('1.0', 6, oy); }
  for (let i = 0; i < tr.len; i++) {
    const s = tr.steps[i], v = ln.get(s);
    const x = g.gut + i * g.cw + 2, w = g.cw - 4;
    if (v === undefined) { cx.strokeStyle = 'rgba(233,233,232,.08)'; cx.setLineDash([2, 3]); cx.strokeRect(x + .5, y0 + .5, w - 1, g.h - 1); cx.setLineDash([]); continue; }
    const base = ln.bi ? toY(0) : y1, y = toY(v);
    const a = s.on ? 1 : .22, fa = flashAge(ti, i);
    const grd = cx.createLinearGradient(0, Math.min(y, base), 0, Math.max(y, base));
    grd.addColorStop(0, rgba(ln.col, .85 * a)); grd.addColorStop(1, rgba(ln.col, .15 * a));
    cx.fillStyle = grd;
    if (fa >= 0) glow(ln.col, 22 * (1 - fa));
    cx.fillRect(x, Math.min(y, base), w, Math.max(2, Math.abs(base - y)));
    noGlow();
    cx.fillStyle = s.on ? '#fff' : rgba('#ffffff', .3); cx.fillRect(x, y - 1, w, 2);
    if (ln.steps && w > 14) { cx.fillStyle = s.on ? '#000' : C.dim; cx.textBaseline = 'top'; cx.font = '9px "IBM Plex Mono",Menlo,monospace'; cx.fillText(L === 'deg' ? Seq.degName(proj, tr, v) : v, x + 2, Math.min(y, base) + 3); }
    if (s.lock) { cx.strokeStyle = C.ink; cx.setLineDash([2, 2]); cx.strokeRect(x - .5, y0 + .5, w + 1, g.h - 1); cx.setLineDash([]); }
  }
  hudSet(`<b style="color:${TCOL[ti % 8]}">T${ti + 1} ${tr.name}</b> · ${t('l_' + L)}${L === 'pl' ? ' CC ' + ui.plcc : ''}`);
}
function fmtLane(L, v) { return L === 'gate' ? v.toFixed(2) : L === 'deg' ? '' : Math.round(v); }
function drawCurve(m, g, ti) {
  const tr = track(), y0 = g.pad, y1 = g.pad + g.h, x0 = g.gut, x1 = W - g.pad;
  const X = x => x0 + x * (x1 - x0), Y = y => y1 - y * g.h;
  cx.fillStyle = C.dim; cx.textBaseline = 'middle'; cx.fillText('127', 4, y0 + 4); cx.fillText('0', 4, y1 - 4);
  // área bajo la curva
  cx.beginPath(); cx.moveTo(X(0), y1);
  for (let k = 0; k <= 240; k++) { const x = k / 240; cx.lineTo(X(x), Y(Seq.curveAt(m.pts, x))); }
  cx.lineTo(X(1), y1); cx.closePath();
  const grd = cx.createLinearGradient(0, y0, 0, y1); grd.addColorStop(0, rgba(C.yel, m.on ? .35 : .1)); grd.addColorStop(1, rgba(C.yel, 0));
  cx.fillStyle = grd; cx.fill();
  cx.beginPath();
  for (let k = 0; k <= 240; k++) { const x = k / 240; const y = Y(Seq.curveAt(m.pts, x)); k ? cx.lineTo(X(x), y) : cx.moveTo(X(x), y); }
  glow(C.yel, m.on ? 12 : 0); cx.strokeStyle = m.on ? C.yel : rgba(C.yel, .4); cx.lineWidth = 2; cx.stroke(); noGlow(); cx.lineWidth = 1;
  // escalones que efectivamente se envían por paso
  for (let i = 0; i < tr.len; i++) {
    const v = Seq.curveAt(m.pts, i / tr.len);
    cx.fillStyle = rgba(C.cya, m.on ? .8 : .25); cx.fillRect(x0 + i * (x1 - x0) / tr.len + 2, Y(v) - 1, (x1 - x0) / tr.len - 4, 2);
  }
  m.pts.forEach((p, k) => {
    cx.fillStyle = '#000'; cx.strokeStyle = k === ui.drag?.pt ? '#fff' : C.yel; cx.lineWidth = 1.5;
    cx.beginPath(); cx.arc(X(p.x), Y(p.y), 5, 0, 7); cx.fill(); cx.stroke();
  });
  if (P.on && ui.head[ti] !== undefined) {
    const x = ui.head[ti] / tr.len, y = Y(Seq.curveAt(m.pts, x));
    glow(C.cya, 14); cx.fillStyle = C.cya; cx.beginPath(); cx.arc(X(x), y, 4, 0, 7); cx.fill(); noGlow();
  }
  hudSet(`<b style="color:${TCOL[ti % 8]}">T${ti + 1} ${tr.name}</b> · MOD CC ${m.cc} · ${m.on ? 'ON' : 'OFF'}`);
}

/* ===== ORBIT ===== */
function orbitGeom() {
  const d = data(), n = d.tracks.length, R = Math.min(W, H) / 2 - 18, inner = R * .3;
  const gap = (R - inner) / n;
  return { cxp: W / 2, cyp: H / 2, R, inner, gap, n, r: i => R - i * gap - gap * .3 };
}
function drawOrbit() {
  const d = data(), g = orbitGeom(), now = A.ctx ? A.ctx.currentTime : 0;
  // núcleo: osciloscopio radial
  const core = g.inner * .9;
  if (A.analyser && P.on) {
    const buf = ui.scopeBuf || (ui.scopeBuf = new Uint8Array(A.analyser.fftSize)); A.analyser.getByteTimeDomainData(buf);
    cx.beginPath();
    for (let k = 0; k <= 256; k++) {
      const v = (buf[Math.floor(k / 256 * (buf.length - 1))] - 128) / 128, a = k / 256 * Math.PI * 2 - Math.PI / 2;
      const rr = core * .55 + v * core * .45;
      const x = g.cxp + Math.cos(a) * rr, y = g.cyp + Math.sin(a) * rr;
      k ? cx.lineTo(x, y) : cx.moveTo(x, y);
    }
    glow(C.mag, 14); cx.strokeStyle = C.mag; cx.lineWidth = 1.5; cx.stroke(); noGlow(); cx.lineWidth = 1;
  }
  cx.fillStyle = C.ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.font = `800 ${Math.max(16, core * .38)}px "Barlow Condensed","Arial Narrow",sans-serif`;
  cx.fillText(Seq.NOTE_NAMES[proj.root], g.cxp, g.cyp - core * .14);
  cx.font = `${Math.max(8, core * .13)}px "IBM Plex Mono",Menlo,monospace`; cx.fillStyle = C.sil;
  cx.fillText(Seq.SCALES[proj.scale].n.split(' · ')[0].toUpperCase(), g.cxp, g.cyp + core * .2);
  cx.fillStyle = C.dim; cx.fillText(proj.bpm + ' BPM', g.cxp, g.cyp + core * .42);
  cx.textAlign = 'left';
  d.tracks.forEach((tr, ti) => {
    const r = g.r(ti), col = TCOL[ti % 8], sel = ti === ui.tr, aud = Seq.audible(d)[ti];
    cx.strokeStyle = sel ? rgba(col, .5) : 'rgba(233,233,232,.12)'; cx.lineWidth = sel ? 1.5 : 1;
    cx.beginPath(); cx.arc(g.cxp, g.cyp, r, 0, 7); cx.stroke(); cx.lineWidth = 1;
    const ang = i => -Math.PI / 2 + i / tr.len * Math.PI * 2;
    // cabezal con estela
    const h = ui.head[ti];
    if (P.on && h !== undefined) {
      const a = ang(h + .5);
      cx.beginPath(); cx.arc(g.cxp, g.cyp, r, a - Math.PI * 2 / tr.len * 2.2, a);
      glow(C.cya, 12); cx.strokeStyle = rgba(C.cya, .8); cx.lineWidth = 3; cx.stroke(); cx.lineWidth = 1; noGlow();
      cx.strokeStyle = rgba(C.cya, .18); cx.beginPath(); cx.moveTo(g.cxp + Math.cos(a) * g.inner, g.cyp + Math.sin(a) * g.inner); cx.lineTo(g.cxp + Math.cos(a) * (r + g.gap * .4), g.cyp + Math.sin(a) * (r + g.gap * .4)); cx.stroke();
    }
    const [lo, hi] = degRange(tr);
    for (let i = 0; i < tr.len; i++) {
      const s = tr.steps[i], a = ang(i), ca = Math.cos(a), sa = Math.sin(a);
      const px = g.cxp + ca * r, py = g.cyp + sa * r;
      cx.fillStyle = i % 4 === 0 ? 'rgba(233,233,232,.45)' : 'rgba(233,233,232,.18)';
      cx.fillRect(px - 1, py - 1, 2, 2);
      if (!s.on) { if (s.lock) { cx.strokeStyle = C.dim; cx.beginPath(); cx.arc(px, py, 4, 0, 7); cx.stroke(); } continue; }
      const fa = flashAge(ti, i);
      const rad = 2 + s.vel / 127 * Math.min(7, g.gap * .32);
      // altura: desplazamiento radial según grado
      Seq.noteSet(s).forEach((dg, k) => {
        const off = ((dg - lo) / Math.max(1, hi - lo) - .5) * g.gap * .55;
        const qx = g.cxp + ca * (r + off), qy = g.cyp + sa * (r + off);
        if (k) { cx.fillStyle = rgba(C.mag, .7); cx.beginPath(); cx.arc(qx, qy, rad * .55, 0, 7); cx.fill(); return; }
        if (off) { cx.strokeStyle = rgba(C.mag, .35); cx.beginPath(); cx.moveTo(px, py); cx.lineTo(qx, qy); cx.stroke(); }
        glow(C.mag, fa >= 0 ? 26 * (1 - fa) : 8);
        cx.fillStyle = aud ? C.mag : rgba(C.mag, .3); cx.beginPath(); cx.arc(qx, qy, rad * (fa >= 0 ? 1 + (1 - fa) * .8 : 1), 0, 7); cx.fill(); noGlow();
        if (fa >= 0) { cx.strokeStyle = rgba('#ffffff', 1 - fa); cx.beginPath(); cx.arc(qx, qy, rad + fa * 18, 0, 7); cx.stroke(); }
      });
      if (s.prob < 100) { cx.strokeStyle = C.yel; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(px, py, rad + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.prob / 100); cx.stroke(); cx.lineWidth = 1; }
      if (s.ratch > 1) for (let k = 1; k < s.ratch; k++) { cx.fillStyle = C.cya; const rr = r - g.gap * .38; cx.fillRect(g.cxp + Math.cos(a + k * .04) * rr - 1, g.cyp + Math.sin(a + k * .04) * rr - 1, 2, 2); }
      if (s.lock) { cx.strokeStyle = C.ink; cx.setLineDash([2, 2]); cx.beginPath(); cx.arc(px, py, rad + 7, 0, 7); cx.stroke(); cx.setLineDash([]); }
      if (ti === ui.tr && i === ui.step) { cx.strokeStyle = '#fff'; cx.beginPath(); cx.arc(px, py, rad + 9, 0, 7); cx.stroke(); }
    }
    cx.fillStyle = sel ? col : rgba(col, .55); cx.font = '700 11px "Barlow Condensed","Arial Narrow",sans-serif'; cx.textBaseline = 'middle';
    cx.fillText('T' + (ti + 1) + ' · ' + tr.len, g.cxp + 6, g.cyp - r);
  });
  hudSet(`${t('v_orbit')} · ${d.tracks.map(x => x.len).join(' / ')}`);
}
function hitOrbit(px, py) {
  const g = orbitGeom(), dx = px - g.cxp, dy = py - g.cyp, dist = Math.hypot(dx, dy);
  if (dist < g.inner * .9) return { core: true };
  let ti = -1, best = 1e9;
  data().tracks.forEach((tr, i) => { const e = Math.abs(dist - g.r(i)); if (e < best) { best = e; ti = i; } });
  if (ti < 0 || best > g.gap * .6) return null;
  const tr = data().tracks[ti];
  let a = Math.atan2(dy, dx) + Math.PI / 2; if (a < 0) a += Math.PI * 2;
  return { ti, i: Math.round(a / (Math.PI * 2) * tr.len) % tr.len };
}

let hudLast = '';
function hudSet(h) { if (h !== hudLast) { $('#hud').innerHTML = h; hudLast = h; } }

/* ---------- interacción en canvas ---------- */
function pos(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
cv.addEventListener('pointerdown', e => {
  wake();
  const p = pos(e); cv.setPointerCapture(e.pointerId);
  if (ui.view === 'grid' || ui.view === 'orbit') {
    const h = ui.view === 'grid' ? hitGrid(p.x, p.y) : hitOrbit(p.x, p.y);
    if (!h) return;
    if (h.core) { togglePlay(); return; }
    if (h.ti !== ui.tr) { ui.tr = h.ti; ui.rollRange = null; renderTracks(); }
    if (h.i < 0) return;
    const tr = data().tracks[h.ti], s = tr.steps[h.i];
    if (ui.tool === 'lock' || e.altKey) { ui.drag = { kind: 'lock', val: !s.lock, ti: h.ti }; s.lock = !s.lock; }
    else {
      let val;
      if (e.shiftKey) { ui.step = h.i; renderInspector(); return; }
      if (!s.on) val = true; else if (ui.step === h.i) val = false; else val = null;
      ui.drag = { kind: 'trig', val, ti: h.ti };
      if (val !== null) { s.on = val; if (val) audition(tr, h.ti, s); }
    }
    ui.step = h.i; renderInspector(); edited();
  } else if (ui.view === 'roll') {
    const h = hitRoll(p.x, p.y); if (!h) return;
    const tr = track(), s = tr.steps[h.i], set = s.on ? Seq.noteSet(s) : [];
    let mode;
    if (set.includes(h.deg)) mode = 'rem';
    else mode = (s.on && (e.shiftKey || tr.sound === 'pad' || Seq.isDrum(tr))) ? 'add' : 'set';
    ui.drag = { kind: 'roll', mode, deg: h.deg, last: -1 };
    rollApply(h.i, h.deg, mode);
  } else if (ui.view === 'lane') {
    if (ui.layer.startsWith('mod')) curveDown(p, e);
    else { ui.drag = { kind: 'lane', erase: e.button === 2 || e.altKey }; laneApply(p); }
  }
});
cv.addEventListener('pointermove', e => {
  if (!ui.drag) return;
  const p = pos(e);
  const dr = ui.drag;
  if (dr.kind === 'trig' || dr.kind === 'lock') {
    const h = ui.view === 'grid' ? hitGrid(p.x, p.y) : hitOrbit(p.x, p.y);
    if (!h || h.core || h.i < 0 || h.ti !== dr.ti) return;
    const s = data().tracks[h.ti].steps[h.i];
    if (dr.kind === 'lock') s.lock = dr.val;
    else if (dr.val !== null && s.on !== dr.val) { s.on = dr.val; if (dr.val) audition(data().tracks[h.ti], h.ti, s); }
    edited();
  } else if (dr.kind === 'roll') {
    const h = hitRoll(p.x, p.y); if (!h || h.i === dr.last) return;
    rollApply(h.i, dr.deg, dr.mode === 'rem' ? 'rem' : dr.mode);
  } else if (dr.kind === 'lane') laneApply(p);
  else if (dr.kind === 'curve' || dr.kind === 'draw') curveMove(p);
});
const endDrag = () => {
  if (!ui.drag) return;
  if (ui.drag.kind === 'draw') curveCommitDraw();
  if (ui.drag.kind === 'roll') ui.rollRange = null;
  ui.drag = null; renderInspector();
};
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);
cv.addEventListener('contextmenu', e => { if (ui.view === 'lane') e.preventDefault(); });
cv.addEventListener('dblclick', e => {
  if (ui.view !== 'lane' || !ui.layer.startsWith('mod')) return;
  const m = track().mods[+ui.layer[3]], k = nearPt(m, pos(e));
  if (k >= 0 && m.pts.length > 2) { m.pts.splice(k, 1); edited(); }
});

function rollApply(i, deg, mode) {
  const tr = track(), s = tr.steps[i];
  ui.drag.last = i; ui.step = i;
  let set = s.on ? Seq.noteSet(s) : [];
  if (mode === 'rem') { set = set.filter(d => d !== deg); if (!set.length) s.on = false; else Seq.setNoteSet(s, set); }
  else if (mode === 'add') { set.push(deg); s.on = true; Seq.setNoteSet(s, set); }
  else { s.on = true; s.deg = deg; s.chord = []; }
  if (mode !== 'rem') audition(tr, ui.tr, s);
  renderInspector(); edited();
}
function laneApply(p) {
  const tr = track(), g = laneGeom(), ln = LANES[ui.layer];
  const i = Math.floor((p.x - g.gut) / g.cw); if (i < 0 || i >= tr.len) return;
  const s = tr.steps[i]; if (s.lock) return;
  if (ui.layer === 'pl' && ui.drag.erase) { delete s.pl[ui.plcc]; edited(); return; }
  const mn = ui.laneMin, mx = ui.laneMax;
  const v = clamp(mn + (1 - (p.y - g.pad) / g.h) * (mx - mn), ln.min === -7 ? mn : ln.min, ln.max === 21 ? mx : ln.max);
  ln.set(s, v);
  ui.step = i; edited(); renderInspectorSoft();
}
function curveXY(p) { const g = laneGeom(); return { x: clamp((p.x - g.gut) / (W - g.pad - g.gut), 0, 1), y: clamp(1 - (p.y - g.pad) / g.h, 0, 1) }; }
function nearPt(m, p) {
  const g = laneGeom(), X = x => g.gut + x * (W - g.pad - g.gut), Y = y => g.pad + g.h - y * g.h;
  let k = -1, best = 12;
  m.pts.forEach((q, j) => { const d = Math.hypot(X(q.x) - p.x, Y(q.y) - p.y); if (d < best) { best = d; k = j; } });
  return k;
}
function curveDown(p, e) {
  const m = track().mods[+ui.layer[3]], k = nearPt(m, p);
  if (k >= 0) { ui.drag = { kind: 'curve', pt: k }; return; }
  const q = curveXY(p);
  if (e.shiftKey) { m.pts.push(q); m.pts.sort((a, b) => a.x - b.x); ui.drag = { kind: 'curve', pt: m.pts.indexOf(q) }; edited(); return; }
  ui.drag = { kind: 'draw', raw: [q] };
}
function curveMove(p) {
  const m = track().mods[+ui.layer[3]];
  if (ui.drag.kind === 'curve') {
    const q = curveXY(p), k = ui.drag.pt, pts = m.pts;
    const lo = k > 0 ? pts[k - 1].x + .005 : 0, hi = k < pts.length - 1 ? pts[k + 1].x - .005 : 1;
    pts[k].x = k === 0 ? 0 : k === pts.length - 1 ? 1 : clamp(q.x, lo, hi); pts[k].y = q.y;
    edited();
  } else {
    ui.drag.raw.push(curveXY(p));
    // vista previa: reemplazo en vivo del tramo dibujado
    curvePreview(m);
  }
}
function curvePreview(m) {
  const raw = ui.drag.raw; if (raw.length < 2) return;
  if (!ui.drag.orig) ui.drag.orig = m.pts.map(p => ({ ...p }));
  const xs = raw.map(r => r.x), a = Math.min(...xs), b = Math.max(...xs);
  const keep = ui.drag.orig.filter(p => p.x < a - .01 || p.x > b + .01);
  const sorted = raw.slice().sort((p, q) => p.x - q.x);
  const samp = [];
  const N = Math.max(2, Math.round((b - a) * 32));
  for (let k = 0; k <= N; k++) {
    const x = a + (b - a) * k / N;
    let best = sorted[0]; sorted.forEach(r => { if (Math.abs(r.x - x) < Math.abs(best.x - x)) best = r; });
    samp.push({ x, y: best.y });
  }
  m.pts = keep.concat(samp).sort((p, q) => p.x - q.x);
  if (m.pts[0].x > 0) m.pts.unshift({ x: 0, y: m.pts[0].y }); else m.pts[0].x = 0;
  if (m.pts[m.pts.length - 1].x < 1) m.pts.push({ x: 1, y: m.pts[m.pts.length - 1].y }); else m.pts[m.pts.length - 1].x = 1;
}
function curveCommitDraw() {
  const m = track().mods[+ui.layer[3]];
  if (ui.drag.raw.length < 2) {
    const q = ui.drag.raw[0]; m.pts.push(q); m.pts.sort((a, b) => a.x - b.x);
  }
  m.on = true; renderLaneOpts(); edited();
}
const SHAPES = {
  sin: () => Array.from({ length: 9 }, (_, k) => ({ x: k / 8, y: .5 + .45 * Math.sin(k / 8 * Math.PI * 2) })),
  tri: () => [{ x: 0, y: .05 }, { x: .5, y: .95 }, { x: 1, y: .05 }],
  up: () => [{ x: 0, y: .05 }, { x: .5, y: .5 }, { x: 1, y: .95 }],
  down: () => [{ x: 0, y: .95 }, { x: .5, y: .5 }, { x: 1, y: .05 }],
  exp: () => [{ x: 0, y: .02 }, { x: .6, y: .12 }, { x: .85, y: .4 }, { x: 1, y: .98 }],
  rnd: () => Array.from({ length: 7 }, (_, k) => ({ x: k / 6, y: .1 + Math.random() * .8 })),
  flat: () => [{ x: 0, y: .5 }, { x: 1, y: .5 }]
};

function audition(tr, ti, s) { if (!P.on && A.ctx) Seq.audition(proj, tr, ti, s); }

/* ---------- osciloscopio de cabecera ---------- */
const sc = $('#scope'), scx = sc.getContext('2d');
function drawScope() {
  const r = sc.getBoundingClientRect(), w = Math.round(r.width * DPR), h = Math.round(r.height * DPR);
  if (sc.width !== w || sc.height !== h) { sc.width = w; sc.height = h; }
  scx.clearRect(0, 0, w, h);
  scx.strokeStyle = 'rgba(233,233,232,.08)'; scx.beginPath(); scx.moveTo(0, h / 2); scx.lineTo(w, h / 2); scx.stroke();
  if (!A.analyser) return;
  const buf = ui.scopeBuf2 || (ui.scopeBuf2 = new Uint8Array(A.analyser.fftSize)); A.analyser.getByteTimeDomainData(buf);
  scx.beginPath();
  for (let k = 0; k < buf.length; k += 2) { const x = k / buf.length * w, y = h / 2 + (buf[k] - 128) / 128 * h * .9; k ? scx.lineTo(x, y) : scx.moveTo(x, y); }
  scx.shadowColor = C.cya; scx.shadowBlur = 8; scx.strokeStyle = C.cya; scx.lineWidth = 1.2 * DPR; scx.stroke(); scx.shadowBlur = 0;
}
function drawTrackHeads() {
  // marcador de cabezal en las barras de largo de las tarjetas
  $$('.trk').forEach((el, i) => {
    const b = el.querySelector('.lenbar b'), tr = data().tracks[i];
    if (!b || !tr) return;
    if (P.on && ui.head[i] !== undefined) { b.style.display = 'block'; b.style.left = (ui.head[i] / Seq.MAXLEN * 100) + '%'; }
    else b.style.display = 'none';
  });
  $$('.slot').forEach((el, i) => el.classList.toggle('playing', P.on && i === proj.slot));
  $$('.ck').forEach((el, k) => el.classList.toggle('now', P.on && proj.mode === 'song' && k === P.songPos));
}

/* ---------- pistas ---------- */
function renderTracks() {
  const d = data(), box = $('#trackList');
  box.innerHTML = d.tracks.map((tr, i) => `
  <div class="trk${i === ui.tr ? ' sel' : ''}" data-ti="${i}" style="--tc:${TCOL[i % 8]}">
    <div class="r1"><input type="text" data-k="name" value="${tr.name}" maxlength="8" aria-label="name">
      <button class="m${tr.mute ? ' on' : ''}" data-k="mute" title="${t('tk_mute')}">M</button>
      <button class="s${tr.solo ? ' on' : ''}" data-k="solo" title="${t('tk_solo')}">S</button>
      ${d.tracks.length > 1 ? `<button class="del" data-k="del" title="${t('tk_del')}">×</button>` : ''}</div>
    <div class="r2">
      <select data-k="sound" title="${t('tk_sound')}">${Seq.SOUNDS.map(s => `<option value="${s}"${s === tr.sound ? ' selected' : ''}>${t('snd_' + s)}</option>`).join('')}</select>
      <select data-k="dir" title="${t('tk_dir')}">${Seq.DIRS.map(s => `<option value="${s}"${s === tr.dir ? ' selected' : ''}>${dirGlyph(s)} ${t('dir_' + s)}</option>`).join('')}</select>
      <select data-k="div" title="${t('tk_div')}">${Object.keys(Seq.DIVS).map(s => `<option${s === tr.div ? ' selected' : ''}>${s}</option>`).join('')}</select>
    </div>
    <div class="r3">
      <button data-k="len-">−</button><span class="lenv" title="${t('tk_len')}">${tr.len}</span><button data-k="len+">+</button>
      ${Seq.isDrum(tr) ? '' : `<span class="chn" style="margin-left:4px">OCT <button data-k="oct-">−</button>${tr.oct}<button data-k="oct+">+</button></span>`}
      <span class="chn" style="margin-left:auto">CH <input type="number" min="1" max="16" data-k="ch" value="${tr.ch}"></span>
    </div>
    <div class="lenbar"><i style="width:${tr.len / Seq.MAXLEN * 100}%"></i><b></b></div>
  </div>`).join('');
}
$('#trackList').addEventListener('click', e => {
  const card = e.target.closest('.trk'); if (!card) return;
  const ti = +card.dataset.ti, tr = data().tracks[ti], k = e.target.dataset.k;
  if (ti !== ui.tr) { ui.tr = ti; ui.rollRange = null; fixSel(); }
  if (!k || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') { renderTracks(); renderInspector(); syncEu(); return; }
  if (k === 'mute') tr.mute = !tr.mute;
  else if (k === 'solo') tr.solo = !tr.solo;
  else if (k === 'len-' || k === 'len+') { tr.len = clamp(tr.len + (k === 'len+' ? 1 : -1), 1, Seq.MAXLEN); fixSel(); ui.rollRange = null; }
  else if (k === 'oct-' || k === 'oct+') tr.oct = clamp(tr.oct + (k === 'oct+' ? 1 : -1), 0, 8);
  else if (k === 'del') { if (!confirmDel()) return; data().tracks.splice(ti, 1); if (P.st) P.st.splice(ti, 1); ui.head.splice(ti, 1); fixSel(); commit('track'); renderAll(); return; }
  renderTracks(); renderInspector(); syncEu(); edited();
});
function confirmDel() { return true; }
$('#trackList').addEventListener('change', e => {
  const card = e.target.closest('.trk'); if (!card) return;
  const tr = data().tracks[+card.dataset.ti], k = e.target.dataset.k, v = e.target.value;
  if (k === 'name') tr.name = v.toUpperCase().slice(0, 8) || 'T';
  if (k === 'sound') { const wasDrum = Seq.isDrum(tr); tr.sound = v; if (wasDrum !== Seq.isDrum(tr)) ui.rollRange = null; }
  if (k === 'dir') tr.dir = v;
  if (k === 'div') tr.div = v;
  if (k === 'ch') tr.ch = clamp(+v || 1, 1, 16);
  renderTracks(); edited();
});
$('#trackList').addEventListener('wheel', e => {
  const lv = e.target.closest('.lenv'); if (!lv) return;
  e.preventDefault();
  const tr = data().tracks[+lv.closest('.trk').dataset.ti];
  tr.len = clamp(tr.len + (e.deltaY < 0 ? 1 : -1), 1, Seq.MAXLEN); fixSel(); renderTracks(); edited();
}, { passive: false });
$('#bAddTrack').onclick = () => {
  const d = data(); if (d.tracks.length >= Seq.MAXTRACKS) { toast(t('msg_maxtracks')); return; }
  d.tracks.push(Seq.newTrack(d.tracks.length)); ui.tr = d.tracks.length - 1; commit('track'); renderAll();
};

/* ---------- inspector ---------- */
function rng(k, label, min, max, st, val, cls, shown) {
  return `<label class="f ${cls}"><span>${label}</span><input type="range" class="r-${cls.slice(2)}" data-k="${k}" min="${min}" max="${max}" step="${st}" value="${val}"><em data-o="${k}">${shown}</em></label>`;
}
function renderInspector() {
  const tr = track(), s = step(), body = $('#inspBody');
  $('#inspTitle').innerHTML = `<span style="color:${TCOL[ui.tr % 8]}">T${ui.tr + 1}</span> · ${String(ui.step + 1).padStart(2, '0')}/${tr.len}`;
  const drum = Seq.isDrum(tr), n = Seq.scale(proj).length;
  const names = Seq.noteSet(s).map(d => Seq.degName(proj, tr, d)).join(' ');
  const degTxt = drum ? '' : `${t('i_degree')} ${((s.deg % n) + n) % n + 1} · ${t('i_oct')} ${Math.floor(s.deg / n) >= 0 ? '+' : ''}${Math.floor(s.deg / n)}`;
  const ccs = Object.keys(s.pl);
  body.innerHTML = `
    <div class="row">
      <button class="tg c-mag${s.on ? ' on' : ''}" data-k="on">${s.on ? t('i_on') : t('i_off')}</button>
      <button class="tg c-sil${s.lock ? ' on' : ''}" data-k="lock">${t('i_lock')}</button>
      <span class="grow"></span>
      <button data-k="prev">◀</button><button data-k="next">▶</button>
    </div>
    <div class="notebig">
      <div class="stk"><button data-k="deg+">▲</button><button data-k="deg-">▼</button></div>
      <b class="${names.length > 5 ? 'long' : ''}">${names}</b>
      <div class="stk"><small>${degTxt}</small>${drum ? '' : `<span class="row"><button data-k="oct-">${t('i_oct')}−</button><button data-k="oct+">${t('i_oct')}+</button></span>`}</div>
    </div>
    ${rng('vel', t('l_vel'), 1, 127, 1, s.vel, 'c-cya', s.vel)}
    ${rng('gate', t('l_gate'), .05, 4, .05, s.gate, 'c-sil', s.gate.toFixed(2))}
    ${rng('prob', t('l_prob'), 0, 100, 5, s.prob, 'c-yel', s.prob + '%')}
    ${rng('micro', t('l_micro'), -50, 50, 1, s.micro, 'c-sil', s.micro)}
    <div class="f c-cya"><span>${t('l_ratch')}</span><div class="rat">${[1, 2, 3, 4, 5, 6, 7, 8].map(r => `<button data-k="ratch" data-v="${r}" class="${r === s.ratch ? 'on' : ''}">${r}</button>`).join('')}</div><em></em></div>
    <div class="row">
      <button class="tg c-mag${s.slide ? ' on' : ''}" data-k="slide">SLIDE</button>
      <button class="tg c-sil${s.tie ? ' on' : ''}" data-k="tie">TIE</button>
    </div>
    <div class="sep"></div>
    <label class="f c-mag"><span>${t('i_chord')}</span><select data-k="chord">${Object.keys(Seq.CHORDS).map(c => `<option value="${c}"${chordName(s) === c ? ' selected' : ''}>${t('ch_' + c)}</option>`).join('')}${chordName(s) === 'custom' ? `<option value="custom" selected>${t('ch_custom')}</option>` : ''}</select><em></em></label>
    <label class="f c-mag"><span>ARP</span><select data-k="arp">${Seq.ARPS.map(a => `<option value="${a}"${a === s.arp ? ' selected' : ''}>${t('arp_' + a)}</option>`).join('')}</select><em></em></label>
    <label class="f c-yel"><span>${t('i_cond')}</span><select data-k="cond">${Seq.CONDS.map(c => `<option value="${c}"${c === s.cond ? ' selected' : ''}>${condLabel(c)}</option>`).join('')}</select><em></em></label>
    <div class="sep"></div>
    <div class="f c-cya"><span>P-LOCK</span><span></span><button class="ic sm" data-k="pladd" title="${t('i_pladd')}">+</button></div>
    <div class="pls">${ccs.map(c => `<div class="pl" data-cc="${c}"><input type="number" min="0" max="127" value="${c}" data-k="plcc" aria-label="CC"><input type="range" class="r-cya" min="0" max="127" value="${s.pl[c]}" data-k="plv"><em>${s.pl[c]}</em><button class="ic sm" data-k="pldel">×</button></div>`).join('') || `<div class="empty">${t('i_plhint')}</div>`}</div>
  `;
}
function renderInspectorSoft() {
  const s = step();
  ['vel', 'gate', 'prob', 'micro'].forEach(k => {
    const inp = $(`#inspBody input[data-k="${k}"]`), o = $(`#inspBody em[data-o="${k}"]`);
    if (inp && document.activeElement !== inp) inp.value = s[k];
    if (o) o.textContent = k === 'gate' ? s.gate.toFixed(2) : k === 'prob' ? s.prob + '%' : s[k];
  });
}
function chordName(s) {
  const j = JSON.stringify(s.chord);
  for (const k in Seq.CHORDS) if (JSON.stringify(Seq.CHORDS[k]) === j) return k;
  return 'custom';
}
function condLabel(c) {
  if (!c) return t('cd_always');
  if (/^\d+:\d+$/.test(c)) return c + ' · ' + t('cd_xy').replace('{a}', c.split(':')[0]).replace('{b}', c.split(':')[1]);
  return c.toUpperCase() + ' · ' + t('cd_' + c);
}
$('#inspBody').addEventListener('input', e => {
  const k = e.target.dataset.k, s = step(), v = +e.target.value;
  if (['vel', 'gate', 'prob', 'micro'].includes(k)) { s[k] = v; renderInspectorSoft(); edited(); }
  if (k === 'plv') { const cc = e.target.closest('.pl').dataset.cc; s.pl[cc] = v; e.target.nextElementSibling.textContent = v; edited(); }
});
$('#inspBody').addEventListener('change', e => {
  const k = e.target.dataset.k, s = step(), v = e.target.value;
  if (k === 'chord' && v !== 'custom') { s.chord = Seq.CHORDS[v].slice(); if (!s.on) s.on = true; audition(track(), ui.tr, s); }
  else if (k === 'arp') s.arp = v;
  else if (k === 'cond') s.cond = v;
  else if (k === 'plcc') { const old = e.target.closest('.pl').dataset.cc, nv = clamp(+v | 0, 0, 127); const val = s.pl[old]; delete s.pl[old]; s.pl[nv] = val; }
  else return;
  renderInspector(); edited();
});
$('#inspBody').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const k = b.dataset.k, tr = track(), s = step(), n = Seq.scale(proj).length;
  if (k === 'on') { s.on = !s.on; if (s.on) audition(tr, ui.tr, s); }
  else if (k === 'lock') s.lock = !s.lock;
  else if (k === 'prev') ui.step = (ui.step - 1 + tr.len) % tr.len;
  else if (k === 'next') ui.step = (ui.step + 1) % tr.len;
  else if (k === 'deg+' || k === 'deg-') { s.deg += k === 'deg+' ? 1 : -1; if (Seq.isDrum(tr)) s.deg = ((s.deg % 8) + 8) % 8; s.on = true; audition(tr, ui.tr, s); ui.rollRange = null; }
  else if (k === 'oct+' || k === 'oct-') { s.deg += (k === 'oct+' ? n : -n); s.on = true; audition(tr, ui.tr, s); ui.rollRange = null; }
  else if (k === 'ratch') s.ratch = +b.dataset.v;
  else if (k === 'slide') s.slide = !s.slide;
  else if (k === 'tie') s.tie = !s.tie;
  else if (k === 'pladd') { let c = 74; while (s.pl[c] !== undefined && c < 127) c++; s.pl[c] = 64; }
  else if (k === 'pldel') delete s.pl[b.closest('.pl').dataset.cc];
  else return;
  renderInspector(); if (!['prev', 'next'].includes(k)) edited();
});

/* ---------- árbol de versiones ---------- */
const tc = $('#tree'), tcx = tc.getContext('2d');
const thumbs = {};
function thumbOf(n) {
  if (thumbs[n.id]) return thumbs[n.id];
  try {
    const p = Seq.unpackPattern(JSON.parse(n.snap)), d = (p.cur === 'B' && p.v.B) ? p.v.B : p.v.A;
    thumbs[n.id] = d.tracks.map(tr => tr.steps.slice(0, Math.min(16, tr.len)).map(s => s.on ? 1 : 0));
  } catch (e) { thumbs[n.id] = []; }
  return thumbs[n.id];
}
const TX = 40, TY = 34, TP = 16;
function drawTree() {
  const tr = Seq.tree.ensureRoot(proj, proj.slot), L = Seq.tree.layout(tr), wrap = $('#treeWrap');
  const r = wrap.getBoundingClientRect();
  const w = Math.max(r.width, TP * 2 + L.cols * TX), h = Math.max(r.height - 2, TP * 2 + L.rows * TY);
  tc.style.width = w + 'px'; tc.style.height = h + 'px';
  tc.width = Math.round(w * DPR); tc.height = Math.round(h * DPR);
  tcx.setTransform(DPR, 0, 0, DPR, 0, 0);
  tcx.clearRect(0, 0, w, h);
  const P2 = id => { const p = L.pos[id]; return p ? { x: TP + p.x * TX, y: TP + p.y * TY } : null; };
  const path = new Set(); let c = tr.cur;
  while (c) { path.add(c); const n = tr.nodes.find(x => x.id === c); c = n && n.p; }
  tr.nodes.forEach(n => {
    if (!n.p) return; const a = P2(n.p), b = P2(n.id); if (!a || !b) return;
    const on = path.has(n.id);
    tcx.strokeStyle = on ? C.mag : 'rgba(233,233,232,.25)'; tcx.lineWidth = on ? 1.6 : 1;
    if (on) { tcx.shadowColor = C.mag; tcx.shadowBlur = 6; }
    tcx.beginPath(); tcx.moveTo(a.x, a.y); tcx.bezierCurveTo(a.x + TX * .5, a.y, b.x - TX * .5, b.y, b.x, b.y); tcx.stroke();
    tcx.shadowBlur = 0;
  });
  tr.nodes.forEach(n => {
    const p = P2(n.id); if (!p) return;
    const col = OPCOL[n.op] || C.cya, cur = n.id === tr.cur;
    // miniatura
    const th = thumbOf(n), tw = 22, rows = Math.min(th.length, 4);
    for (let ti = 0; ti < rows; ti++) th[ti].forEach((v, i) => {
      if (!v) return; tcx.fillStyle = rgba(TCOL[ti], cur || path.has(n.id) ? .9 : .45);
      tcx.fillRect(p.x - tw / 2 + i * (tw / 16), p.y + 9 + ti * 2.5, Math.max(1, tw / 16 - .4), 2);
    });
    if (cur) { tcx.shadowColor = C.mag; tcx.shadowBlur = 14; tcx.strokeStyle = C.mag; tcx.lineWidth = 2; tcx.beginPath(); tcx.arc(p.x, p.y, 8, 0, 7); tcx.stroke(); tcx.shadowBlur = 0; }
    if (n.id === ui.hoverNode) { tcx.strokeStyle = '#fff'; tcx.lineWidth = 1; tcx.beginPath(); tcx.arc(p.x, p.y, 10, 0, 7); tcx.stroke(); }
    tcx.fillStyle = col; tcx.beginPath(); tcx.arc(p.x, p.y, n.op === 'root' ? 4 : 4.5, 0, 7); tcx.fill();
    if (n.op === 'root') { tcx.fillStyle = '#000'; tcx.beginPath(); tcx.arc(p.x, p.y, 1.8, 0, 7); tcx.fill(); }
  });
  ui.treeL = { L, P2 };
  treeInfo();
  const cp = P2(tr.cur);
  if (cp && !ui.treeNoScroll) { if (cp.x > wrap.scrollLeft + r.width - 30 || cp.x < wrap.scrollLeft) wrap.scrollLeft = cp.x - r.width / 2; if (cp.y > wrap.scrollTop + r.height - 30 || cp.y < wrap.scrollTop) wrap.scrollTop = cp.y - r.height / 2; }
  ui.treeNoScroll = false;
}
function treeHit(e) {
  const r = tc.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  const tr = Seq.tree.get(proj, proj.slot); let best = null, bd = 14;
  tr.nodes.forEach(n => { const p = ui.treeL.P2(n.id); if (!p) return; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = n; } });
  return best;
}
tc.addEventListener('click', e => { const n = treeHit(e); if (n) { ui.treeNoScroll = true; goto(n.id); burst(n.op); } });
tc.addEventListener('pointermove', e => { const n = treeHit(e); const id = n ? n.id : null; if (id !== ui.hoverNode) { ui.hoverNode = id; ui.treeNoScroll = true; drawTree(); } });
tc.addEventListener('pointerleave', () => { ui.hoverNode = null; ui.treeNoScroll = true; drawTree(); });
function treeInfo() {
  const tr = Seq.tree.get(proj, proj.slot);
  const n = tr.nodes.find(x => x.id === (ui.hoverNode || tr.cur));
  const legend = ['mutate', 'random', 'invert', 'edit'].map(o => `<i style="--c:${OPCOL[o] || C.cya}">${t('op_' + o)}</i>`).join('');
  $('#treeInfo').innerHTML = n ? `<b style="color:${OPCOL[n.op] || C.cya}">${t('op_' + n.op) || n.op}</b> <span>${new Date(n.t).toLocaleTimeString()}</span> <span>· ${tr.nodes.length} ${t('tr_nodes')}</span> ${legend}` : legend;
}
$('#bUndo').onclick = () => { flushEdit(); const p = Seq.tree.parent(proj, proj.slot); if (p) goto(p); };
$('#bRedo').onclick = () => { const c = Seq.tree.child(proj, proj.slot); if (c) goto(c); };

/* ---------- banco de patterns ---------- */
function renderSlots() {
  const box = $('#slots');
  if (!box.children.length) {
    box.innerHTML = Array.from({ length: Seq.SLOTS }, (_, i) => `<button class="slot" data-slot="${i}"><canvas></canvas><span>A${i + 1}</span></button>`).join('');
  }
  drawSlots();
}
function drawSlots() {
  $$('.slot').forEach((el, i) => {
    const pt = proj.patterns[i];
    el.classList.toggle('used', !!pt.used);
    el.classList.toggle('cur', i === proj.slot);
    el.classList.toggle('q', P.on && P.queue === i);
    const cvs = el.querySelector('canvas'), r = el.getBoundingClientRect();
    const w = Math.round(r.width * DPR), h = Math.round(r.height * DPR);
    cvs.width = w; cvs.height = h;
    const g = cvs.getContext('2d'); g.clearRect(0, 0, w, h);
    if (!pt.used) return;
    const d = (pt.cur === 'B' && pt.v.B) ? pt.v.B : pt.v.A;
    const n = d.tracks.length, top = 16 * DPR, rh = (h - top - 3 * DPR) / n;
    d.tracks.forEach((tr, ti) => {
      const L = Math.min(tr.len, 32), cw = (w - 6 * DPR) / 32;
      for (let k = 0; k < L; k++) {
        g.fillStyle = tr.steps[k].on ? TCOL[ti % 8] : 'rgba(233,233,232,.08)';
        g.fillRect(3 * DPR + k * cw, top + ti * rh, Math.max(1, cw - DPR), Math.max(1, rh - DPR));
      }
    });
  });
  $$('#segAB button').forEach(b => b.classList.toggle('on', pat().cur === b.dataset.ab));
  $('#sBars').value = data().bars || 1;
}
$('#slots').addEventListener('click', e => {
  const b = e.target.closest('.slot'); if (!b) return;
  const i = +b.dataset.slot;
  flushEdit();
  if (P.on && proj.mode === 'pattern') { P.queue = i === proj.slot ? null : i; drawSlots(); return; }
  setSlot(i);
});
function setSlot(i) {
  proj.slot = i; Seq.tree.ensureRoot(proj, i); fixSel(); ui.rollRange = null; renderAll(); save();
}
$('#segAB').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const pt = pat(), v = b.dataset.ab;
  if (v === 'B' && !pt.v.B) pt.v.B = Seq.clone(pt.v.A);
  pt.cur = v; fixSel(); commit('ab'); renderAll();
});
$('#bAB').onclick = () => {
  const pt = pat(), src = pt.cur, dst = src === 'A' ? 'B' : 'A';
  pt.v[dst] = Seq.clone(pt.v[src]); commit('ab'); toast(src + ' → ' + dst); renderAll();
};
$('#sBars').onchange = e => { data().bars = +e.target.value; edited(); };
$('#bCopy').onclick = () => { ui.clip = Seq.clone(pat()); toast(t('msg_copied') + ' A' + (proj.slot + 1)); };
$('#bPaste').onclick = () => { if (!ui.clip) { toast(t('msg_noclip')); return; } flushEdit(); proj.patterns[proj.slot] = Seq.clone(ui.clip); proj.patterns[proj.slot].used = true; fixSel(); commit('paste'); renderAll(); };
$('#bClrSlot').onclick = () => { flushEdit(); const n = Seq.newPattern(); proj.patterns[proj.slot] = n; n.used = true; fixSel(); commit('clear'); renderAll(); };

$('#segMode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; proj.mode = b.dataset.m; P.queue = null; renderMode(); save(); });
function renderMode() {
  $$('#segMode button').forEach(b => b.classList.toggle('on', b.dataset.m === proj.mode));
  $('.bank').classList.toggle('song', proj.mode === 'song');
  renderChain();
}
function renderChain() {
  $('#chain').innerHTML = proj.chain.map((c, k) => `<span class="ck" data-k="${k}"><b>A${c.slot + 1}</b>×${c.rep}<button data-a="rep-">−</button><button data-a="rep+">+</button><button data-a="left">‹</button><button data-a="del">×</button></span>`).join('')
    || `<span class="lbl">${t('b_chainempty')}</span>`;
}
$('#chain').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const k = +b.closest('.ck').dataset.k, c = proj.chain[k], a = b.dataset.a;
  if (a === 'rep-') c.rep = Math.max(1, c.rep - 1);
  if (a === 'rep+') c.rep = Math.min(16, c.rep + 1);
  if (a === 'left' && k > 0) { proj.chain.splice(k, 1); proj.chain.splice(k - 1, 0, c); }
  if (a === 'del') proj.chain.splice(k, 1);
  renderChain(); save();
});
$('#bChainAdd').onclick = () => { if (proj.chain.length >= 64) return; proj.chain.push({ slot: proj.slot, rep: 1 }); renderChain(); save(); };

/* ---------- cabecera ---------- */
function syncHeader() {
  $('#iBpm').value = proj.bpm; $('#iSwing').value = proj.swing; $('#oSwing').textContent = proj.swing;
  $('#sRoot').value = proj.root; $('#sScale').value = proj.scale;
  $('#bPlay').classList.toggle('on', P.on);
}
function fillKeySelects() {
  $('#sRoot').innerHTML = Seq.NOTE_NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join('');
  $('#sScale').innerHTML = Object.keys(Seq.SCALES).map(k => `<option value="${k}">${Seq.SCALES[k].n}</option>`).join('');
}
$('#iBpm').addEventListener('change', e => { proj.bpm = clamp(+e.target.value || 120, 40, 240); e.target.value = proj.bpm; save(); });
$('#iBpm').addEventListener('wheel', e => { e.preventDefault(); proj.bpm = clamp(proj.bpm + (e.deltaY < 0 ? 1 : -1), 40, 240); e.target.value = proj.bpm; save(); }, { passive: false });
$('#iSwing').addEventListener('input', e => { proj.swing = +e.target.value; $('#oSwing').textContent = proj.swing; save(); });
$('#sRoot').onchange = e => { proj.root = +e.target.value; ui.rollRange = null; renderInspector(); save(); toast(t('msg_key') + ' ' + Seq.NOTE_NAMES[proj.root] + ' ' + Seq.SCALES[proj.scale].n); };
$('#sScale').onchange = e => { proj.scale = e.target.value; ui.rollRange = null; renderInspector(); renderChips(); save(); toast(t('msg_key') + ' ' + Seq.NOTE_NAMES[proj.root] + ' ' + Seq.SCALES[proj.scale].n); };

function togglePlay() {
  wake();
  if (P.on) { P.stop(); ui.head = []; }
  else { flushEdit(); P.start(() => proj); }
  syncHeader(); drawSlots();
}
$('#bPlay').onclick = togglePlay;
const fillOn = v => { P.fill = v; $('#bFill').classList.toggle('on', v); };
$('#bFill').addEventListener('pointerdown', e => { e.preventDefault(); fillOn(true); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => $('#bFill').addEventListener(ev, () => fillOn(false)));
P.onSwitch = slot => requestAnimationFrame(() => { Seq.tree.ensureRoot(proj, slot); fixSel(); renderAll(); });

/* ---------- generación ---------- */
function renderChips() {
  const n = Seq.scale(proj).length;
  ui.gen.degs = ui.gen.degs.filter(d => d < n);
  $('#degChips').innerHTML = Array.from({ length: n }, (_, k) => `<button data-d="${k}" class="${ui.gen.degs.includes(k) ? 'on' : ''}">${k + 1}</button>`).join('');
  $$('.octr button').forEach(b => b.classList.toggle('on', +b.dataset.o === ui.gen.octs));
  $$('#segScope button').forEach(b => b.classList.toggle('on', b.dataset.s === ui.gen.scope));
  $('#iAmt').value = ui.gen.amount; $('#oAmt').textContent = ui.gen.amount + '%';
  $('#iDen').value = ui.gen.density; $('#oDen').textContent = ui.gen.density + '%';
}
$('#degChips').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const d = +b.dataset.d;
  ui.gen.degs = ui.gen.degs.includes(d) ? ui.gen.degs.filter(x => x !== d) : ui.gen.degs.concat(d).sort();
  renderChips(); save();
});
$$('.octr button').forEach(b => b.onclick = () => { ui.gen.octs = +b.dataset.o; renderChips(); save(); });
$('#segScope').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ui.gen.scope = b.dataset.s; renderChips(); save(); });
$('#iAmt').oninput = e => { ui.gen.amount = +e.target.value; $('#oAmt').textContent = ui.gen.amount + '%'; save(); };
$('#iDen').oninput = e => { ui.gen.density = +e.target.value; $('#oDen').textContent = ui.gen.density + '%'; save(); };
$('#bMutate').onclick = mutate;
$('#bRandom').onclick = () => applyOp('random');
$('#bEuclid').onclick = () => applyOp('euclid');
function syncEu() {
  const tr = track();
  $('#iEuK').max = tr.len; $('#iEuR').max = Math.max(0, tr.len - 1);
  $('#iEuK').value = tr.eu.k; $('#iEuR').value = tr.eu.rot;
  $('#oEu').textContent = tr.eu.k + '/' + tr.len + (tr.eu.rot ? ' ↻' + tr.eu.rot : '');
}
const euLive = () => { const tr = track(); tr.eu.k = +$('#iEuK').value; tr.eu.rot = +$('#iEuR').value; syncEu(); };
$('#iEuK').oninput = euLive; $('#iEuR').oninput = euLive;
$('#iEuK').onchange = () => applyOp('euclid'); $('#iEuR').onchange = () => applyOp('euclid');
$('#gops').addEventListener('click', e => { const b = e.target.closest('button'); if (b) applyOp(b.dataset.op, b); });

/* ---------- vistas ---------- */
function setView(v) {
  ui.view = v; ui.rollRange = null;
  $$('#segView button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  $('.stage').classList.toggle('lane', v === 'lane');
  $('#segTool').style.display = (v === 'grid' || v === 'orbit') ? '' : 'none';
  renderLaneOpts(); hudSet(''); save();
}
$('#segView').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setView(b.dataset.v); });
$('#segLayer').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ui.layer = b.dataset.l; renderLaneOpts(); });
$('#segTool').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ui.tool = b.dataset.t; renderTool(); });
function renderTool() { $$('#segTool button').forEach(b => b.classList.toggle('on', b.dataset.t === ui.tool)); }
function renderLaneOpts() {
  $$('#segLayer button').forEach(b => b.classList.toggle('on', b.dataset.l === ui.layer));
  const box = $('#laneOpts');
  if (ui.view !== 'lane') { box.innerHTML = ''; return; }
  if (ui.layer === 'pl') box.innerHTML = `<span class="lbl">CC</span><input type="number" id="iPlcc" min="0" max="127" value="${ui.plcc}"><span class="lbl">${t('l_plhint')}</span>`;
  else if (ui.layer.startsWith('mod')) {
    const m = track().mods[+ui.layer[3]];
    box.innerHTML = `<button id="bModOn" class="${m.on ? 'on' : ''}">${m.on ? 'ON' : 'OFF'}</button><span class="lbl">CC</span><input type="number" id="iModcc" min="0" max="127" value="${m.cc}">` +
      Object.keys(SHAPES).map(k => `<button data-shape="${k}">${t('sh_' + k)}</button>`).join('') + `<span class="lbl">${t('l_modhint')}</span>`;
  } else box.innerHTML = `<span class="lbl">${t('l_lanehint')}</span>`;
}
$('#laneOpts').addEventListener('change', e => {
  if (e.target.id === 'iPlcc') ui.plcc = clamp(+e.target.value | 0, 0, 127);
  if (e.target.id === 'iModcc') { track().mods[+ui.layer[3]].cc = clamp(+e.target.value | 0, 0, 127); edited(); }
});
$('#laneOpts').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const m = track().mods[+ui.layer[3]];
  if (b.id === 'bModOn') { m.on = !m.on; renderLaneOpts(); edited(); }
  if (b.dataset.shape) { m.pts = SHAPES[b.dataset.shape](); m.on = true; renderLaneOpts(); commit('edit'); }
});

/* ---------- archivo ---------- */
$('#bNew').onclick = () => {
  if (!confirm(t('msg_newconfirm'))) return;
  if (P.on) togglePlay();
  proj = Seq.newProject(); Seq.tree.ensureRoot(proj, 0); ui.tr = 0; ui.step = 0; renderAll(); syncHeader(); save();
};
$('#bSave').onclick = () => {
  E.download('seq-project.json', E.projectJSON(proj, true), 'application/json');
  toast(t('msg_saved'));
};
$('#bOpen').onclick = () => $('#fOpen').click();
$('#fOpen').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    if (j.kind === 'pattern' && j.pattern) {
      flushEdit();
      ['A', 'B'].forEach(v => { if (j.pattern.v[v]) Seq.normData(j.pattern.v[v]); });
      proj.patterns[proj.slot] = j.pattern; j.pattern.used = true; commit('paste');
      toast(t('msg_loaded'));
    } else { if (P.on) togglePlay(); proj = Seq.normalize(j); Seq.tree.ensureRoot(proj, proj.slot); toast(t('msg_loaded')); }
    fixSel(); renderAll(); syncHeader(); save();
  } catch (err) { toast(t('msg_badfile')); }
  e.target.value = '';
};

/* ---------- exportar ---------- */
const X = { tab: 'midi', mode: 'pattern', bars: '4', profile: 'general', only: 'all', seed: 1234, player: true, grid: true };
$('#bExport').onclick = () => { flushEdit(); $('#mExport').hidden = false; renderX(); };
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.hidden = true; }));
$('#segX').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; X.tab = b.dataset.x; renderX(); });
function renderX() {
  $$('#segX button').forEach(b => b.classList.toggle('on', b.dataset.x === X.tab));
  const body = $('#xBody'), d = data();
  if (X.tab === 'midi') {
    const cyc = Math.ceil(Seq.cycleSixteenths(d) / 16);
    body.innerHTML = `
      <div class="xgrid">
        <label>${t('x_source')}<select id="xMode"><option value="pattern">${t('x_pattern')} A${proj.slot + 1}</option><option value="song">${t('x_song')} (${proj.chain.length})</option></select></label>
        <label>${t('x_len')}<select id="xBars">${['1', '2', '4', '8', '16', '32'].map(b => `<option value="${b}">${b} ${t('x_bars')}</option>`).join('')}<option value="cycle">${t('x_cycle')} (${Math.min(64, cyc)} ${t('x_bars')})</option></select></label>
        <label>${t('x_tracks')}<select id="xOnly"><option value="all">${t('x_alltracks')}</option>${d.tracks.map((tr, i) => `<option value="${i}">T${i + 1} ${tr.name}</option>`).join('')}</select></label>
        <label>${t('x_profile')}<select id="xProf">${Object.keys(E.PROFILES).map(p => `<option value="${p}">${t('pr_' + p)}</option>`).join('')}</select></label>
        <label>${t('x_seed')}<input type="number" id="xSeed" value="${X.seed}" min="0" max="99999"></label>
      </div>
      <canvas class="xprev" id="xPrev"></canvas>
      <div class="acts"><button class="hot" id="xDl">${t('x_download')} .mid</button><button id="xDlEach">${t('x_each')}</button></div>
      <div class="note" id="xProfNote"></div>
      <div class="note">${t('x_native')}</div>`;
    $('#xMode').value = X.mode; $('#xBars').value = X.bars; $('#xOnly').value = X.only; $('#xProf').value = X.profile;
    const upd = () => {
      X.mode = $('#xMode').value; X.bars = $('#xBars').value; X.only = $('#xOnly').value; X.profile = $('#xProf').value; X.seed = +$('#xSeed').value || 0;
      $('#xProfNote').innerHTML = t('prn_' + X.profile); drawXPrev();
    };
    ['xMode', 'xBars', 'xOnly', 'xProf', 'xSeed'].forEach(id => $('#' + id).onchange = upd);
    upd();
    $('#xDl').onclick = () => { E.download(fileBase() + (X.only !== 'all' ? '-t' + (+X.only + 1) : '') + '.mid', E.midi(proj, xopt()), 'audio/midi'); toast('MIDI ✓'); };
    $('#xDlEach').onclick = () => { d.tracks.forEach((tr, i) => setTimeout(() => E.download(fileBase() + '-t' + (i + 1) + '-' + tr.name.toLowerCase() + '.mid', E.midi(proj, Object.assign(xopt(), { only: i })), 'audio/midi'), i * 350)); };
  } else if (X.tab === 'json') {
    const txt = E.patternJSON(proj);
    body.innerHTML = `<div class="acts"><button class="hot" id="xDl">${t('x_download')} pattern .json</button><button id="xDlP">${t('x_download')} ${t('x_project')} .json</button><button id="xCp">${t('x_copy')}</button></div><textarea readonly id="xTxt"></textarea><div class="note">${t('x_jsonnote')}</div>`;
    $('#xTxt').value = txt;
    $('#xDl').onclick = () => E.download(fileBase() + '.json', txt, 'application/json');
    $('#xDlP').onclick = () => E.download('seq-project.json', E.projectJSON(proj, true), 'application/json');
    $('#xCp').onclick = () => copy(txt);
  } else if (X.tab === 'lua') {
    body.innerHTML = `<div class="acts"><button class="hot" id="xDl">${t('x_download')} .lua</button><button id="xCp">${t('x_copy')}</button>
      <label class="mini"><input type="checkbox" id="xPl" ${X.player ? 'checked' : ''}> ${t('x_player')}</label>
      <label class="mini"><input type="checkbox" id="xGr" ${X.grid ? 'checked' : ''}> ${t('x_grid')}</label></div><textarea readonly id="xTxt"></textarea><div class="note">${t('x_luanote')}</div>`;
    const upd = () => { X.player = $('#xPl').checked; X.grid = $('#xGr').checked; $('#xTxt').value = E.lua(proj, { player: X.player, drumGrid: X.grid }); };
    $('#xPl').onchange = upd; $('#xGr').onchange = upd; upd();
    $('#xDl').onclick = () => E.download(fileBase() + '.lua', $('#xTxt').value, 'text/x-lua');
    $('#xCp').onclick = () => copy($('#xTxt').value);
  } else if (X.tab === 'text') {
    const txt = E.text(proj);
    body.innerHTML = `<div class="acts"><button class="hot" id="xDl">${t('x_download')} .txt</button><button id="xCp">${t('x_copy')}</button></div><textarea readonly id="xTxt"></textarea>`;
    $('#xTxt').value = txt;
    $('#xDl').onclick = () => E.download(fileBase() + '.txt', txt, 'text/plain');
    $('#xCp').onclick = () => copy(txt);
  } else {
    if (!P.midiAvailable()) { body.innerHTML = `<div class="note">${t('x_nomidi')}</div>`; return; }
    body.innerHTML = `<div class="xgrid"><label>${t('x_out')}<select id="xOut"><option value="">— ${t('x_none')} —</option></select></label></div><div class="note">${t('x_livenote')}</div>`;
    P.midiList().then(outs => {
      $('#xOut').innerHTML += outs.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
      if (P.midiOut) $('#xOut').value = P.midiOut.id;
      $('#xOut').onchange = e => { P.midiOut = outs.find(o => o.id === e.target.value) || null; toast(P.midiOut ? 'MIDI → ' + P.midiOut.name : 'MIDI off'); };
    }).catch(() => { body.innerHTML = `<div class="note">${t('x_nomidi')}</div>`; });
  }
}
function xopt() { return { mode: X.mode, bars: X.bars === 'cycle' ? 'cycle' : +X.bars, profile: X.profile, only: X.only === 'all' ? null : +X.only, seed: X.seed }; }
function fileBase() { const n = pat().name; return 'seq-a' + (proj.slot + 1) + (pat().cur === 'B' ? 'b' : '') + (n ? '-' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''); }
function drawXPrev() {
  const c = $('#xPrev'); if (!c) return;
  const r = c.getBoundingClientRect(), w = Math.round(r.width * DPR), h = Math.round(r.height * DPR);
  c.width = w; c.height = h; const g = c.getContext('2d');
  const rd = E.render(proj, xopt());
  let lo = 127, hi = 0; rd.tracks.forEach(o => o.notes.forEach(n => { lo = Math.min(lo, n.midi); hi = Math.max(hi, n.midi); }));
  if (lo > hi) { lo = 40; hi = 80; }
  const sx = w / Math.max(1, rd.len), sy = h / (hi - lo + 3);
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  for (let b = 0; b <= rd.len; b += 16) { g.fillStyle = 'rgba(233,233,232,.15)'; g.fillRect(b * sx, 0, 1, h); }
  rd.tracks.forEach((o, k) => {
    g.fillStyle = TCOL[o.i % 8];
    o.notes.forEach(n => g.fillRect(n.t * sx, h - (n.midi - lo + 2) * sy, Math.max(1, n.d * sx - 1), Math.max(1.5, sy * .8)));
  });
  const nn = rd.tracks.reduce((a, o) => a + o.notes.length, 0), ncc = rd.tracks.reduce((a, o) => a + o.cc.length, 0);
  g.fillStyle = C.sil; g.font = (10 * DPR) + 'px "IBM Plex Mono",Menlo,monospace';
  g.fillText(`${Math.round(rd.len / 16)} ${t('x_bars')} · ${nn} ${t('x_notes')} · ${ncc} CC · ${rd.tracks.map(o => 'ch' + o.ch).join(' ')}`, 6 * DPR, 14 * DPR);
}
function copy(txt) {
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(t('msg_copiedtxt')), () => {
    const ta = $('#xTxt'); if (ta) { ta.select(); document.execCommand('copy'); toast(t('msg_copiedtxt')); }
  });
}

/* ---------- ayuda ---------- */
$('#bHelp').onclick = () => { $('#helpBody').innerHTML = t('help'); $('#mHelp').hidden = false; };

/* ---------- idioma ---------- */
$('#sLang').onchange = e => { I.set(e.target.value); renderAll(); };

/* ---------- teclado ---------- */
document.addEventListener('keydown', e => {
  if (e.target.matches('input[type=text],input[type=number],textarea,select')) return;
  if (!$('#mExport').hidden || !$('#mHelp').hidden) { if (e.key === 'Escape') $$('.modal').forEach(m => m.hidden = true); return; }
  const k = e.key.toLowerCase(), tr = track();
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  else if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); e.shiftKey ? $('#bRedo').click() : $('#bUndo').click(); }
  else if (e.metaKey || e.ctrlKey) return;
  else if (k === 'm') mutate();
  else if (k === 'r') applyOp('random');
  else if (k === 'e') applyOp('euclid');
  else if (k === 'f') fillOn(true);
  else if (k === 'l') { step().lock = !step().lock; renderInspector(); edited(); }
  else if (k === 'z') $('#bUndo').click();
  else if (k === 'y') $('#bRedo').click();
  else if (['1', '2', '3', '4'].includes(k)) setView(['grid', 'roll', 'lane', 'orbit'][+k - 1]);
  else if (k === 'arrowright') { ui.step = (ui.step + 1) % tr.len; renderInspector(); }
  else if (k === 'arrowleft') { ui.step = (ui.step - 1 + tr.len) % tr.len; renderInspector(); }
  else if (k === 'arrowup' || k === 'arrowdown') { e.preventDefault(); ui.tr = clamp(ui.tr + (k === 'arrowup' ? -1 : 1), 0, data().tracks.length - 1); fixSel(); renderTracks(); renderInspector(); syncEu(); }
  else if (k === 'enter' || k === 'backspace' || k === 'delete') { const s = step(); s.on = k === 'enter' ? !s.on : false; if (s.on) audition(tr, ui.tr, s); renderInspector(); edited(); }
  else return;
});
document.addEventListener('keyup', e => { if (e.key.toLowerCase() === 'f') fillOn(false); });

/* audio se enciende con el primer gesto */
function wake() { if (!A.ctx) A.init(); else if (A.ctx.state !== 'running') A.ctx.resume(); }
document.addEventListener('pointerdown', wake, { once: true });

/* ---------- render global ---------- */
function renderAll() {
  I.apply();
  fillKeySelects(); syncHeader();
  renderTracks(); renderInspector(); renderSlots(); renderMode(); renderChips(); syncEu(); renderTool();
  setView(ui.view); drawTree();
  $('#sLang').value = I.lang;
}
function refresh() { renderTracks(); renderInspector(); drawSlots(); drawTree(); syncEu(); }

load();
I.init();
renderAll();
resize();
new ResizeObserver(() => { resize(); drawTree(); drawSlots(); }).observe($('#cvWrap'));
requestAnimationFrame(frame);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.SeqUI = { ui, get proj() { return proj; }, renderAll };
})();
