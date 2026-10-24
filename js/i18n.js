/* Seq · U-MA — idiomas: es, en, de, ja, hi, zh */
'use strict';
(function () {
const Seq = window.Seq = window.Seq || {};
const D = {};

D.en = {
  t_play: 'Play / stop (space)', t_fill: 'FILL', t_fill_hint: 'Hold for fill: FILL steps play, !FILL steps rest (key F)', t_swing: 'Swing',
  t_root: 'Root', t_scale: 'Scale', t_new: 'NEW', t_open: 'OPEN', t_save: 'SAVE', t_export: 'EXPORT',
  t_addtrack: 'Add track', t_undo: 'Back to parent version (Z)', t_redo: 'Forward to latest child (Y)',
  p_tracks: 'Tracks', p_step: 'Step', p_tree: 'Versions',
  v_grid: 'GRID', v_roll: 'ROLL', v_lane: 'LANE', v_orbit: 'ORBIT',
  l_vel: 'VEL', l_gate: 'GATE', l_prob: 'PROB', l_ratch: 'RATCH', l_micro: 'MICRO', l_deg: 'NOTE', l_pl: 'P-LOCK',
  l_mod0: 'MOD 1', l_mod1: 'MOD 2',
  l_plhint: 'drag to lock this CC per step · right-click or Alt to erase',
  l_modhint: 'drag to draw · drag a point to move · Shift+click adds · double-click deletes',
  l_lanehint: 'drag across steps to draw values',
  tool_trig: 'TRIG', tool_lock: 'LOCK', tool_trig_h: 'Tap: step on/select/off · drag paints', tool_lock_h: 'Tap: lock steps so mutation leaves them alone (Alt+tap too)',
  g_mutate: 'MUTATE', g_mutate_h: 'Mutate unlocked steps within the scale (M)', g_amount: 'Mutation amount',
  g_random: 'RANDOM', g_random_h: 'Constrained random on unlocked steps (R)', g_density: 'Density',
  g_degrees: 'Degrees', g_octs: 'OCT', g_euclid: 'EUCLID', g_euclid_h: 'Euclidean rhythm: pulses over track length, rotation (E)',
  g_pulses: 'K', g_rot: 'ROT', g_track: 'TRACK', g_all: 'ALL',
  o_invert: 'INV', o_retro: 'RETRO', o_dup: 'DUP', o_human: 'HUMAN', o_deg: 'DEG', o_unlock: 'UNLOCK', o_clear: 'CLEAR',
  o_invert_h: 'Invert melody around the first note', o_retro_h: 'Retrograde: play backwards', o_rotl_h: 'Rotate left', o_rotr_h: 'Rotate right',
  o_dup_h: 'Duplicate: double the length copying the steps', o_half_h: 'Compress to half length', o_human_h: 'Humanize velocity and micro-timing',
  o_degdn_h: 'Transpose one scale degree down', o_degup_h: 'Transpose one scale degree up', o_octdn_h: 'Track octave down', o_octup_h: 'Track octave up',
  o_unlock_h: 'Unlock all steps', o_clear_h: 'Clear unlocked steps',
  b_pattern: 'PATTERN', b_song: 'SONG', b_abcopy: 'A→B', b_abcopy_h: 'Copy this variation onto the other', b_bars: 'Bars',
  b_copy: 'COPY', b_paste: 'PASTE', b_clear: 'CLEAR', b_chain: 'Chain', b_chainadd: 'Add current pattern to the chain', b_chainempty: 'empty — add patterns with +',
  tk_mute: 'Mute', tk_solo: 'Solo', tk_del: 'Delete track', tk_sound: 'Preview sound', tk_dir: 'Play direction', tk_div: 'Clock division', tk_len: 'Length (wheel or −/+)',
  snd_pluck: 'Pluck', snd_acid: 'Acid', snd_pad: 'Pad', snd_bell: 'Bell FM', snd_sub: 'Sub', snd_drums: 'Drums',
  dir_fwd: 'Forward', dir_rev: 'Backward', dir_pp: 'Ping-pong', dir_rnd: 'Random', dir_drunk: 'Drunk',
  i_degree: 'degree', i_oct: 'oct', i_on: '● ON', i_off: '○ OFF', i_lock: 'LOCK', i_chord: 'Chord', i_cond: 'Cond',
  i_pladd: 'Add parameter lock (CC)', i_plhint: 'No locks. + adds a CC to this step (74 = cutoff, 71 = resonance in the preview).',
  ch_none: 'single note', ch_triad: 'triad 1-3-5', ch_sus2: 'sus2', ch_sus4: 'sus4', ch_seventh: '7th', ch_sixth: '6th', ch_ninth: '9th', ch_power: 'power 1-5-8', ch_octave: 'octave', ch_custom: 'custom',
  arp_off: 'off', arp_up: 'up', arp_down: 'down', arp_updown: 'up-down', arp_rnd: 'random',
  cd_always: 'always', cd_xy: 'loop {a} of every {b}', cd_pre: 'if previous played', cd_npre: 'if previous did not play',
  cd_fill: 'only in fill', cd_nfill: 'not in fill', cd_1st: 'first loop only', cd_n1st: 'not on first loop',
  op_root: 'origin', op_mutate: 'mutate', op_random: 'random', op_euclid: 'euclid', op_edit: 'edit', op_track: 'track', op_ab: 'A/B', op_paste: 'paste', op_clear: 'clear',
  op_invert: 'transform', op_retro: 'retro', op_rotL: 'rotate', op_rotR: 'rotate', op_dup: 'duplicate', op_half: 'half', op_human: 'humanize',
  op_degUp: 'degree +', op_degDn: 'degree −', op_octUp: 'oct +', op_octDn: 'oct −', op_unlock: 'unlock',
  tr_nodes: 'versions',
  sh_sin: 'SIN', sh_tri: 'TRI', sh_up: 'RAMP ↑', sh_down: 'RAMP ↓', sh_exp: 'EXP', sh_rnd: 'RND', sh_flat: 'FLAT',
  msg_nochange: 'Nothing changed (locked or empty)', msg_maxtracks: 'Maximum 8 tracks', msg_key: 'Key:', msg_copied: 'Copied', msg_noclip: 'Copy a pattern first',
  msg_newconfirm: 'Start a new project? The current one stays only if you saved it.', msg_saved: 'Project saved', msg_loaded: 'Loaded', msg_badfile: 'Not a Seq file', msg_copiedtxt: 'Copied to clipboard',
  x_title: 'EXPORT', x_text: 'TEXT', x_live: 'LIVE MIDI', x_source: 'Source', x_pattern: 'Pattern', x_song: 'Song chain', x_len: 'Length', x_bars: 'bars',
  x_cycle: 'full polyrhythm cycle', x_tracks: 'Tracks', x_alltracks: 'All (multitrack)', x_profile: 'Device profile', x_seed: 'Seed (probabilities)',
  x_download: 'Download', x_each: 'One file per track', x_project: 'project', x_copy: 'Copy', x_notes: 'notes',
  x_native: '<b>Native formats.</b> Elektron .seq, Polyend pattern files and TB-03 / Monologue sequence SysEx are not publicly documented, so Seq does not fake them. Profiles shape the MIDI file for each device (channels, mono, accents, slides) so you can import it in a DAW or record it into the machine.',
  pr_general: 'General / DAW', pr_elektron: 'Elektron Digitakt · Digitone · Syntakt', pr_cycles: 'Model:Cycles · Model:Samples', pr_tb03: 'Roland TB-03 · 303 clones', pr_monologue: 'Korg Monologue · minilogue', pr_polyend: 'Polyend Tracker · Play',
  prn_general: 'Each track uses its own MIDI channel (CH in the track card). Chords, ratchets, micro-timing, CCs and modulation lanes included.',
  prn_elektron: 'Tracks 1–8 → channels 1–8 (the default auto-channel layout). P-locks and lanes go out as CC on each channel.',
  prn_cycles: 'Tracks 1–6 → channels 1–6, one per machine track.',
  prn_tb03: 'First melodic track only, channel 1, mono. Velocity ≥ 100 becomes accent (127), the rest 72. Slides are overlapping notes, which the TB-03 plays as slide.',
  prn_monologue: 'First melodic track only, channel 1, mono. Slides and ties as overlapping notes (legato).',
  prn_polyend: 'Tracks 1–8 → channels 1–8, one MIDI track per channel.',
  x_jsonnote: 'Readable pattern with layers per step. Pattern files can be opened again with OPEN (they load into the current slot).',
  x_player: 'include minimal player', x_grid: 'drum matrix (caja16 style)',
  x_luanote: 'A Lua table ready to paste into a norns script: resolved MIDI notes plus scale degrees, gates, probabilities, ratchets, conditions and CC locks. Fits caja16, Gridstep or baldosas.',
  x_nomidi: 'This browser has no Web MIDI (Safari does not support it). Use the .mid export, or open Seq in Firefox or Edge to play hardware live.',
  x_out: 'MIDI output', x_none: 'none', x_livenote: 'While playing, Seq sends notes and CCs to this output, each track on its channel. Useful to record into a machine that cannot import MIDI files.',
  help: `<h3>The idea</h3><p>Seq is for trying sequences, not for performing. Generate, lock what you like, mutate the rest and move through the version tree.</p>
<h3>Steps</h3><ul><li>Each step has layers: note (magenta), velocity (cyan), probability (yellow), gate (silver), ratchet, micro-timing, slide/tie, chord, arp, condition and CC locks.</li>
<li><b>GRID</b>: tap an empty step to turn it on, tap again to select, tap the selected one to turn it off. Drag to paint. Shift+tap selects only.</li>
<li><b>ROLL</b>: piano roll of the selected track by scale degree. Shift adds chord notes.</li><li><b>LANE</b>: one layer as bars, or modulation curves (MOD 1/2).</li><li><b>ORBIT</b>: every track as a ring, so polyrhythms are visible. Tap the centre to play.</li></ul>
<h3>Mutation with memory</h3><ul><li>LOCK tool (or Alt+tap, or L) protects steps.</li><li>MUTATE changes the chosen % of unlocked steps inside the scale. RANDOM uses the degree chips and density.</li>
<li>Every operation adds a node in VERSIONS. Tap any node to go back; new changes branch from there without losing the others.</li></ul>
<h3>Scales</h3><p>Notes are scale degrees. Changing key or mode (e.g. Dorian → Phrygian) re-harmonises the pattern without breaking it.</p>
<h3>Keys</h3><p><kbd>Space</kbd> play · <kbd>M</kbd> mutate · <kbd>R</kbd> random · <kbd>E</kbd> euclid · <kbd>L</kbd> lock · <kbd>F</kbd> fill · <kbd>Z</kbd>/<kbd>Y</kbd> versions · <kbd>1-4</kbd> views · arrows move · <kbd>Enter</kbd> toggle.</p>
<h3>Export</h3><p>MIDI (multitrack or per track, with device profiles), JSON, Lua table for norns, readable text and live Web MIDI.</p>`
};

D.es = {
  t_play: 'Play / stop (espacio)', t_fill: 'FILL', t_fill_hint: 'Mantené para fill: suenan los pasos FILL y callan los !FILL (tecla F)', t_swing: 'Swing',
  t_root: 'Tónica', t_scale: 'Escala', t_new: 'NUEVO', t_open: 'ABRIR', t_save: 'GUARDAR', t_export: 'EXPORTAR',
  t_addtrack: 'Agregar pista', t_undo: 'Volver a la versión madre (Z)', t_redo: 'Ir a la última hija (Y)',
  p_tracks: 'Pistas', p_step: 'Paso', p_tree: 'Versiones',
  v_grid: 'GRILLA', v_roll: 'ROLL', v_lane: 'LANE', v_orbit: 'ÓRBITA',
  l_vel: 'VEL', l_gate: 'GATE', l_prob: 'PROB', l_ratch: 'RATCH', l_micro: 'MICRO', l_deg: 'NOTA', l_pl: 'P-LOCK',
  l_mod0: 'MOD 1', l_mod1: 'MOD 2',
  l_plhint: 'arrastrá para fijar este CC por paso · clic derecho o Alt borra',
  l_modhint: 'arrastrá para dibujar · arrastrá un punto para moverlo · Shift+clic agrega · doble clic borra',
  l_lanehint: 'arrastrá sobre los pasos para dibujar valores',
  tool_trig: 'TRIG', tool_lock: 'LOCK', tool_trig_h: 'Tocar: enciende / selecciona / apaga · arrastrar pinta', tool_lock_h: 'Tocar: bloquea pasos para que la mutación no los toque (también Alt+toque)',
  g_mutate: 'MUTAR', g_mutate_h: 'Muta los pasos no bloqueados dentro de la escala (M)', g_amount: 'Cantidad de mutación',
  g_random: 'RANDOM', g_random_h: 'Random con restricciones sobre los pasos libres (R)', g_density: 'Densidad',
  g_degrees: 'Grados', g_octs: 'OCT', g_euclid: 'EUCLIDIANO', g_euclid_h: 'Ritmo euclidiano: pulsos sobre el largo de la pista y rotación (E)',
  g_pulses: 'K', g_rot: 'ROT', g_track: 'PISTA', g_all: 'TODAS',
  o_invert: 'INV', o_retro: 'RETRO', o_dup: 'DUP', o_human: 'HUMANO', o_deg: 'GRADO', o_unlock: 'LIBERAR', o_clear: 'BORRAR',
  o_invert_h: 'Invertir la melodía alrededor de la primera nota', o_retro_h: 'Retrogradar: al revés', o_rotl_h: 'Rotar a la izquierda', o_rotr_h: 'Rotar a la derecha',
  o_dup_h: 'Duplicar: dobla el largo copiando los pasos', o_half_h: 'Comprimir a la mitad de largo', o_human_h: 'Humanizar velocity y micro-timing',
  o_degdn_h: 'Transponer un grado abajo', o_degup_h: 'Transponer un grado arriba', o_octdn_h: 'Octava de la pista abajo', o_octup_h: 'Octava de la pista arriba',
  o_unlock_h: 'Desbloquear todos los pasos', o_clear_h: 'Borrar los pasos no bloqueados',
  b_pattern: 'PATTERN', b_song: 'SONG', b_abcopy: 'A→B', b_abcopy_h: 'Copiar esta variación sobre la otra', b_bars: 'Compases',
  b_copy: 'COPIAR', b_paste: 'PEGAR', b_clear: 'BORRAR', b_chain: 'Cadena', b_chainadd: 'Agregar el pattern actual a la cadena', b_chainempty: 'vacía — sumá patterns con +',
  tk_mute: 'Mute', tk_solo: 'Solo', tk_del: 'Borrar pista', tk_sound: 'Sonido de preview', tk_dir: 'Dirección de lectura', tk_div: 'División de reloj', tk_len: 'Largo (rueda o −/+)',
  snd_pluck: 'Pluck', snd_acid: 'Acid', snd_pad: 'Pad', snd_bell: 'Campana FM', snd_sub: 'Sub', snd_drums: 'Batería',
  dir_fwd: 'Adelante', dir_rev: 'Atrás', dir_pp: 'Ping-pong', dir_rnd: 'Random', dir_drunk: 'Drunk',
  i_degree: 'grado', i_oct: 'oct', i_on: '● ON', i_off: '○ OFF', i_lock: 'LOCK', i_chord: 'Acorde', i_cond: 'Cond',
  i_pladd: 'Agregar parameter lock (CC)', i_plhint: 'Sin locks. + suma un CC a este paso (74 = corte, 71 = resonancia en el preview).',
  ch_none: 'nota sola', ch_triad: 'tríada 1-3-5', ch_sus2: 'sus2', ch_sus4: 'sus4', ch_seventh: 'séptima', ch_sixth: 'sexta', ch_ninth: 'novena', ch_power: 'power 1-5-8', ch_octave: 'octava', ch_custom: 'propio',
  arp_off: 'no', arp_up: 'arriba', arp_down: 'abajo', arp_updown: 'arriba-abajo', arp_rnd: 'random',
  cd_always: 'siempre', cd_xy: 'vuelta {a} de cada {b}', cd_pre: 'si el anterior sonó', cd_npre: 'si el anterior no sonó',
  cd_fill: 'solo en el fill', cd_nfill: 'fuera del fill', cd_1st: 'solo la primera vuelta', cd_n1st: 'menos la primera vuelta',
  op_root: 'origen', op_mutate: 'mutación', op_random: 'random', op_euclid: 'euclidiano', op_edit: 'edición', op_track: 'pista', op_ab: 'A/B', op_paste: 'pegar', op_clear: 'borrar',
  op_invert: 'transformación', op_retro: 'retro', op_rotL: 'rotar', op_rotR: 'rotar', op_dup: 'duplicar', op_half: 'mitad', op_human: 'humanizar',
  op_degUp: 'grado +', op_degDn: 'grado −', op_octUp: 'oct +', op_octDn: 'oct −', op_unlock: 'liberar',
  tr_nodes: 'versiones',
  sh_sin: 'SENO', sh_tri: 'TRI', sh_up: 'RAMPA ↑', sh_down: 'RAMPA ↓', sh_exp: 'EXP', sh_rnd: 'RND', sh_flat: 'PLANA',
  msg_nochange: 'No cambió nada (bloqueado o vacío)', msg_maxtracks: 'Máximo 8 pistas', msg_key: 'Tonalidad:', msg_copied: 'Copiado', msg_noclip: 'Primero copiá un pattern',
  msg_newconfirm: '¿Empezar un proyecto nuevo? El actual solo queda si lo guardaste.', msg_saved: 'Proyecto guardado', msg_loaded: 'Cargado', msg_badfile: 'No es un archivo de Seq', msg_copiedtxt: 'Copiado al portapapeles',
  x_title: 'EXPORTAR', x_text: 'TEXTO', x_live: 'MIDI EN VIVO', x_source: 'Origen', x_pattern: 'Pattern', x_song: 'Cadena (song)', x_len: 'Largo', x_bars: 'compases',
  x_cycle: 'ciclo completo del polirritmo', x_tracks: 'Pistas', x_alltracks: 'Todas (multipista)', x_profile: 'Perfil de equipo', x_seed: 'Semilla (probabilidades)',
  x_download: 'Bajar', x_each: 'Un archivo por pista', x_project: 'proyecto', x_copy: 'Copiar', x_notes: 'notas',
  x_native: '<b>Formatos nativos.</b> El .seq de Elektron, los patterns de Polyend y el SysEx de secuencia de la TB-03 o la Monologue no están documentados públicamente, así que Seq no los inventa. Los perfiles arman el MIDI a la medida de cada equipo (canales, mono, acentos, slides) para importarlo en el DAW o grabarlo en la máquina.',
  pr_general: 'General / DAW', pr_elektron: 'Elektron Digitakt · Digitone · Syntakt', pr_cycles: 'Model:Cycles · Model:Samples', pr_tb03: 'Roland TB-03 · clones de 303', pr_monologue: 'Korg Monologue · minilogue', pr_polyend: 'Polyend Tracker · Play',
  prn_general: 'Cada pista usa su canal MIDI (CH en la tarjeta de pista). Incluye acordes, ratchets, micro-timing, CC y lanes de modulación.',
  prn_elektron: 'Pistas 1–8 → canales 1–8 (la disposición de canales por defecto). Los p-locks y lanes salen como CC en cada canal.',
  prn_cycles: 'Pistas 1–6 → canales 1–6, una por pista de la máquina.',
  prn_tb03: 'Solo la primera pista melódica, canal 1, mono. Velocity ≥ 100 es acento (127), el resto 72. Los slides son notas superpuestas, que la TB-03 toca como slide.',
  prn_monologue: 'Solo la primera pista melódica, canal 1, mono. Slides y ties como notas superpuestas (legato).',
  prn_polyend: 'Pistas 1–8 → canales 1–8, una pista MIDI por canal.',
  x_jsonnote: 'Pattern legible con todas las capas de cada paso. Los archivos de pattern se vuelven a abrir con ABRIR (cargan en el slot actual).',
  x_player: 'incluir reproductor mínimo', x_grid: 'matriz de batería (estilo caja16)',
  x_luanote: 'Tabla Lua lista para pegar en un script de norns: notas MIDI resueltas más grados de escala, gates, probabilidades, ratchets, condiciones y CC. Encaja con caja16, Gridstep o baldosas.',
  x_nomidi: 'Este navegador no tiene Web MIDI (Safari no lo soporta). Usá la exportación .mid, o abrí Seq en Firefox o Edge para tocar equipos en vivo.',
  x_out: 'Salida MIDI', x_none: 'ninguna', x_livenote: 'Mientras suena, Seq manda notas y CC a esta salida, cada pista en su canal. Sirve para grabar en una máquina que no importa archivos MIDI.',
  help: `<h3>La idea</h3><p>Seq es para probar secuencias, no para tocar. Generás, bloqueás lo que te gusta, mutás el resto y navegás el árbol de versiones.</p>
<h3>Pasos</h3><ul><li>Cada paso tiene capas: nota (magenta), velocity (cian), probabilidad (amarillo), gate (plata), ratchet, micro-timing, slide/tie, acorde, arpegio, condición y CC.</li>
<li><b>GRILLA</b>: tocá un paso vacío para encenderlo, de nuevo para seleccionarlo, y el seleccionado para apagarlo. Arrastrá para pintar. Shift+toque solo selecciona.</li>
<li><b>ROLL</b>: piano roll de la pista elegida, por grados de la escala. Shift suma notas al acorde.</li><li><b>LANE</b>: una sola capa como barras, o curvas de modulación (MOD 1/2).</li><li><b>ÓRBITA</b>: cada pista es un anillo y los polirritmos se ven. Tocá el centro para dar play.</li></ul>
<h3>Mutación con memoria</h3><ul><li>La herramienta LOCK (o Alt+toque, o L) protege pasos.</li><li>MUTAR cambia el % elegido de pasos libres dentro de la escala. RANDOM usa los grados marcados y la densidad.</li>
<li>Cada operación suma un nodo en VERSIONES. Tocá cualquiera para volver; lo nuevo sale como rama sin perder lo demás.</li></ul>
<h3>Escalas</h3><p>Las notas son grados. Cambiar la tónica o el modo (por ejemplo dórico → frigio) rearmoniza el pattern sin romperlo.</p>
<h3>Teclas</h3><p><kbd>Espacio</kbd> play · <kbd>M</kbd> mutar · <kbd>R</kbd> random · <kbd>E</kbd> euclidiano · <kbd>L</kbd> lock · <kbd>F</kbd> fill · <kbd>Z</kbd>/<kbd>Y</kbd> versiones · <kbd>1-4</kbd> vistas · flechas mueven · <kbd>Enter</kbd> enciende/apaga.</p>
<h3>Exportar</h3><p>MIDI (multipista o por pista, con perfiles de equipo), JSON, tabla Lua para norns, texto legible y Web MIDI en vivo.</p>`
};

D.de = {
  t_play: 'Start / Stopp (Leertaste)', t_fill: 'FILL', t_fill_hint: 'Halten für Fill: FILL-Schritte spielen, !FILL schweigen (Taste F)', t_swing: 'Swing',
  t_root: 'Grundton', t_scale: 'Skala', t_new: 'NEU', t_open: 'ÖFFNEN', t_save: 'SICHERN', t_export: 'EXPORT',
  t_addtrack: 'Spur hinzufügen', t_undo: 'Zur Elternversion (Z)', t_redo: 'Zum letzten Kind (Y)',
  p_tracks: 'Spuren', p_step: 'Schritt', p_tree: 'Versionen',
  v_grid: 'RASTER', v_roll: 'ROLL', v_lane: 'LANE', v_orbit: 'ORBIT',
  l_vel: 'VEL', l_gate: 'GATE', l_prob: 'PROB', l_ratch: 'RATCH', l_micro: 'MIKRO', l_deg: 'NOTE', l_pl: 'P-LOCK',
  l_mod0: 'MOD 1', l_mod1: 'MOD 2',
  l_plhint: 'ziehen, um diesen CC pro Schritt zu setzen · Rechtsklick oder Alt löscht',
  l_modhint: 'ziehen zum Zeichnen · Punkt ziehen zum Verschieben · Shift+Klick fügt hinzu · Doppelklick löscht',
  l_lanehint: 'über die Schritte ziehen, um Werte zu zeichnen',
  tool_trig: 'TRIG', tool_lock: 'LOCK', tool_trig_h: 'Tippen: an / wählen / aus · Ziehen malt', tool_lock_h: 'Tippen: Schritte sperren, damit die Mutation sie nicht ändert (auch Alt+Tippen)',
  g_mutate: 'MUTIEREN', g_mutate_h: 'Freie Schritte innerhalb der Skala mutieren (M)', g_amount: 'Mutationsmenge',
  g_random: 'ZUFALL', g_random_h: 'Zufall mit Regeln auf freien Schritten (R)', g_density: 'Dichte',
  g_degrees: 'Stufen', g_octs: 'OKT', g_euclid: 'EUKLID', g_euclid_h: 'Euklidischer Rhythmus: Impulse über die Spurlänge, Rotation (E)',
  g_pulses: 'K', g_rot: 'ROT', g_track: 'SPUR', g_all: 'ALLE',
  o_invert: 'INV', o_retro: 'RETRO', o_dup: 'DUP', o_human: 'HUMAN', o_deg: 'STUFE', o_unlock: 'FREI', o_clear: 'LÖSCHEN',
  o_invert_h: 'Melodie um die erste Note spiegeln', o_retro_h: 'Krebs: rückwärts', o_rotl_h: 'Nach links rotieren', o_rotr_h: 'Nach rechts rotieren',
  o_dup_h: 'Verdoppeln: Länge x2 mit Kopie', o_half_h: 'Auf halbe Länge stauchen', o_human_h: 'Velocity und Mikro-Timing humanisieren',
  o_degdn_h: 'Eine Skalenstufe tiefer', o_degup_h: 'Eine Skalenstufe höher', o_octdn_h: 'Spur eine Oktave tiefer', o_octup_h: 'Spur eine Oktave höher',
  o_unlock_h: 'Alle Schritte entsperren', o_clear_h: 'Freie Schritte löschen',
  b_pattern: 'PATTERN', b_song: 'SONG', b_abcopy: 'A→B', b_abcopy_h: 'Diese Variation auf die andere kopieren', b_bars: 'Takte',
  b_copy: 'KOPIE', b_paste: 'EINFÜGEN', b_clear: 'LÖSCHEN', b_chain: 'Kette', b_chainadd: 'Aktuelles Pattern zur Kette', b_chainempty: 'leer — Patterns mit + hinzufügen',
  tk_mute: 'Stumm', tk_solo: 'Solo', tk_del: 'Spur löschen', tk_sound: 'Vorschau-Klang', tk_dir: 'Laufrichtung', tk_div: 'Taktteilung', tk_len: 'Länge (Rad oder −/+)',
  snd_pluck: 'Pluck', snd_acid: 'Acid', snd_pad: 'Pad', snd_bell: 'Glocke FM', snd_sub: 'Sub', snd_drums: 'Drums',
  dir_fwd: 'Vorwärts', dir_rev: 'Rückwärts', dir_pp: 'Ping-Pong', dir_rnd: 'Zufall', dir_drunk: 'Betrunken',
  i_degree: 'Stufe', i_oct: 'Okt', i_on: '● AN', i_off: '○ AUS', i_lock: 'LOCK', i_chord: 'Akkord', i_cond: 'Bed.',
  i_pladd: 'Parameter-Lock (CC) hinzufügen', i_plhint: 'Keine Locks. + fügt diesem Schritt einen CC hinzu (74 = Cutoff, 71 = Resonanz in der Vorschau).',
  ch_none: 'Einzelnote', ch_triad: 'Dreiklang 1-3-5', ch_sus2: 'sus2', ch_sus4: 'sus4', ch_seventh: 'Septime', ch_sixth: 'Sexte', ch_ninth: 'None', ch_power: 'Power 1-5-8', ch_octave: 'Oktave', ch_custom: 'eigen',
  arp_off: 'aus', arp_up: 'auf', arp_down: 'ab', arp_updown: 'auf-ab', arp_rnd: 'zufällig',
  cd_always: 'immer', cd_xy: 'Durchlauf {a} von {b}', cd_pre: 'wenn vorheriger spielte', cd_npre: 'wenn vorheriger nicht spielte',
  cd_fill: 'nur im Fill', cd_nfill: 'nicht im Fill', cd_1st: 'nur erster Durchlauf', cd_n1st: 'nicht im ersten Durchlauf',
  op_root: 'Ursprung', op_mutate: 'Mutation', op_random: 'Zufall', op_euclid: 'Euklid', op_edit: 'Bearbeitung', op_track: 'Spur', op_ab: 'A/B', op_paste: 'Einfügen', op_clear: 'Löschen',
  op_invert: 'Transformation', op_retro: 'Krebs', op_rotL: 'Rotation', op_rotR: 'Rotation', op_dup: 'Verdoppeln', op_half: 'Halb', op_human: 'Humanisieren',
  op_degUp: 'Stufe +', op_degDn: 'Stufe −', op_octUp: 'Okt +', op_octDn: 'Okt −', op_unlock: 'Entsperren',
  tr_nodes: 'Versionen',
  sh_sin: 'SINUS', sh_tri: 'DREIECK', sh_up: 'RAMPE ↑', sh_down: 'RAMPE ↓', sh_exp: 'EXP', sh_rnd: 'ZUF', sh_flat: 'FLACH',
  msg_nochange: 'Nichts geändert (gesperrt oder leer)', msg_maxtracks: 'Maximal 8 Spuren', msg_key: 'Tonart:', msg_copied: 'Kopiert', msg_noclip: 'Zuerst ein Pattern kopieren',
  msg_newconfirm: 'Neues Projekt beginnen? Das aktuelle bleibt nur, wenn du es gesichert hast.', msg_saved: 'Projekt gesichert', msg_loaded: 'Geladen', msg_badfile: 'Keine Seq-Datei', msg_copiedtxt: 'In die Zwischenablage kopiert',
  x_title: 'EXPORT', x_text: 'TEXT', x_live: 'LIVE-MIDI', x_source: 'Quelle', x_pattern: 'Pattern', x_song: 'Kette (Song)', x_len: 'Länge', x_bars: 'Takte',
  x_cycle: 'ganzer Polyrhythmus-Zyklus', x_tracks: 'Spuren', x_alltracks: 'Alle (Mehrspur)', x_profile: 'Geräteprofil', x_seed: 'Seed (Wahrscheinlichkeiten)',
  x_download: 'Laden', x_each: 'Eine Datei pro Spur', x_project: 'Projekt', x_copy: 'Kopieren', x_notes: 'Noten',
  x_native: '<b>Native Formate.</b> Elektron .seq, Polyend-Patterns und das Sequenz-SysEx von TB-03 / Monologue sind nicht öffentlich dokumentiert, daher erfindet Seq sie nicht. Die Profile formen die MIDI-Datei für jedes Gerät (Kanäle, Mono, Akzente, Slides) zum Import in die DAW oder zum Einspielen in die Maschine.',
  pr_general: 'Allgemein / DAW', pr_elektron: 'Elektron Digitakt · Digitone · Syntakt', pr_cycles: 'Model:Cycles · Model:Samples', pr_tb03: 'Roland TB-03 · 303-Klone', pr_monologue: 'Korg Monologue · minilogue', pr_polyend: 'Polyend Tracker · Play',
  prn_general: 'Jede Spur nutzt ihren MIDI-Kanal (CH in der Spurkarte). Mit Akkorden, Ratchets, Mikro-Timing, CCs und Modulations-Lanes.',
  prn_elektron: 'Spuren 1–8 → Kanäle 1–8 (Standard-Belegung). P-Locks und Lanes gehen als CC auf jedem Kanal raus.',
  prn_cycles: 'Spuren 1–6 → Kanäle 1–6, eine pro Maschinenspur.',
  prn_tb03: 'Nur die erste melodische Spur, Kanal 1, mono. Velocity ≥ 100 wird Akzent (127), sonst 72. Slides sind überlappende Noten, die die TB-03 als Slide spielt.',
  prn_monologue: 'Nur die erste melodische Spur, Kanal 1, mono. Slides und Ties als überlappende Noten (Legato).',
  prn_polyend: 'Spuren 1–8 → Kanäle 1–8, eine MIDI-Spur pro Kanal.',
  x_jsonnote: 'Lesbares Pattern mit allen Ebenen pro Schritt. Pattern-Dateien lassen sich mit ÖFFNEN wieder laden (in den aktuellen Slot).',
  x_player: 'Mini-Player einfügen', x_grid: 'Drum-Matrix (caja16-Stil)',
  x_luanote: 'Lua-Tabelle zum Einfügen in ein norns-Skript: aufgelöste MIDI-Noten plus Skalenstufen, Gates, Wahrscheinlichkeiten, Ratchets, Bedingungen und CCs. Passt zu caja16, Gridstep oder baldosas.',
  x_nomidi: 'Dieser Browser hat kein Web MIDI (Safari unterstützt es nicht). Nutze den .mid-Export oder öffne Seq in Firefox oder Edge.',
  x_out: 'MIDI-Ausgang', x_none: 'keiner', x_livenote: 'Während der Wiedergabe sendet Seq Noten und CCs an diesen Ausgang, jede Spur auf ihrem Kanal.',
  help: `<h3>Die Idee</h3><p>Seq ist zum Ausprobieren von Sequenzen, nicht zum Spielen. Erzeugen, Gutes sperren, den Rest mutieren und durch den Versionsbaum navigieren.</p>
<h3>Schritte</h3><ul><li>Jeder Schritt hat Ebenen: Note (Magenta), Velocity (Cyan), Wahrscheinlichkeit (Gelb), Gate (Silber), Ratchet, Mikro-Timing, Slide/Tie, Akkord, Arpeggio, Bedingung und CC-Locks.</li>
<li><b>RASTER</b>: leeren Schritt antippen = an, nochmal = wählen, gewählten antippen = aus. Ziehen malt. Shift+Tippen wählt nur.</li>
<li><b>ROLL</b>: Pianoroll der Spur nach Skalenstufen. Shift fügt Akkordtöne hinzu.</li><li><b>LANE</b>: eine Ebene als Balken oder Modulationskurven (MOD 1/2).</li><li><b>ORBIT</b>: jede Spur als Ring, Polyrhythmen werden sichtbar. Mitte antippen = Start.</li></ul>
<h3>Mutation mit Gedächtnis</h3><ul><li>Das LOCK-Werkzeug (oder Alt+Tippen, oder L) schützt Schritte.</li><li>MUTIEREN ändert den gewählten Anteil freier Schritte in der Skala. ZUFALL nutzt die Stufen-Chips und die Dichte.</li>
<li>Jede Operation erzeugt einen Knoten in VERSIONEN. Antippen springt zurück; Neues verzweigt, ohne etwas zu verlieren.</li></ul>
<h3>Skalen</h3><p>Noten sind Skalenstufen. Ein Wechsel von Tonart oder Modus (z. B. Dorisch → Phrygisch) harmonisiert das Pattern neu, ohne es zu zerstören.</p>
<h3>Tasten</h3><p><kbd>Leertaste</kbd> Start · <kbd>M</kbd> mutieren · <kbd>R</kbd> Zufall · <kbd>E</kbd> Euklid · <kbd>L</kbd> Lock · <kbd>F</kbd> Fill · <kbd>Z</kbd>/<kbd>Y</kbd> Versionen · <kbd>1-4</kbd> Ansichten · Pfeile bewegen · <kbd>Enter</kbd> an/aus.</p>
<h3>Export</h3><p>MIDI (mehrspurig oder pro Spur, mit Geräteprofilen), JSON, Lua-Tabelle für norns, lesbarer Text und Live-Web-MIDI.</p>`
};

D.ja = {
  t_play: '再生 / 停止（スペース）', t_fill: 'FILL', t_fill_hint: '押している間フィル：FILLのステップが鳴り、!FILLは休む（Fキー）', t_swing: 'スウィング',
  t_root: 'ルート', t_scale: 'スケール', t_new: '新規', t_open: '開く', t_save: '保存', t_export: '書き出し',
  t_addtrack: 'トラックを追加', t_undo: '親バージョンへ（Z）', t_redo: '最新の子へ（Y）',
  p_tracks: 'トラック', p_step: 'ステップ', p_tree: 'バージョン',
  v_grid: 'グリッド', v_roll: 'ロール', v_lane: 'レーン', v_orbit: 'オービット',
  l_vel: 'ベロシティ', l_gate: 'ゲート', l_prob: '確率', l_ratch: 'ラチェット', l_micro: 'マイクロ', l_deg: 'ノート', l_pl: 'Pロック',
  l_mod0: 'MOD 1', l_mod1: 'MOD 2',
  l_plhint: 'ドラッグでステップごとにCCを固定 · 右クリックまたはAltで消去',
  l_modhint: 'ドラッグで描画 · 点をドラッグで移動 · Shift+クリックで追加 · ダブルクリックで削除',
  l_lanehint: 'ステップ上をドラッグして値を描く',
  tool_trig: 'トリガー', tool_lock: 'ロック', tool_trig_h: 'タップ：オン / 選択 / オフ · ドラッグで塗る', tool_lock_h: 'タップ：ステップをロックして変異から守る（Alt+タップも）',
  g_mutate: '変異', g_mutate_h: 'ロックされていないステップをスケール内で変異（M）', g_amount: '変異の量',
  g_random: 'ランダム', g_random_h: '条件付きランダム（空きステップ）（R）', g_density: '密度',
  g_degrees: '度数', g_octs: 'OCT', g_euclid: 'ユークリッド', g_euclid_h: 'ユークリッド・リズム：トラック長に対するパルス数と回転（E）',
  g_pulses: 'K', g_rot: '回転', g_track: 'トラック', g_all: '全部',
  o_invert: '反転', o_retro: '逆行', o_dup: '複製', o_human: '人間味', o_deg: '度', o_unlock: '解除', o_clear: '消去',
  o_invert_h: '最初の音を軸に旋律を反転', o_retro_h: '逆行：後ろから再生', o_rotl_h: '左へ回転', o_rotr_h: '右へ回転',
  o_dup_h: '複製：長さを2倍にしてコピー', o_half_h: '半分の長さに圧縮', o_human_h: 'ベロシティとマイクロタイミングを揺らす',
  o_degdn_h: 'スケール1度下へ', o_degup_h: 'スケール1度上へ', o_octdn_h: 'トラックを1オクターブ下へ', o_octup_h: 'トラックを1オクターブ上へ',
  o_unlock_h: '全ステップのロックを解除', o_clear_h: 'ロックされていないステップを消去',
  b_pattern: 'パターン', b_song: 'ソング', b_abcopy: 'A→B', b_abcopy_h: 'このバリエーションをもう一方にコピー', b_bars: '小節',
  b_copy: 'コピー', b_paste: '貼付', b_clear: '消去', b_chain: 'チェーン', b_chainadd: '現在のパターンをチェーンに追加', b_chainempty: '空 — + でパターンを追加',
  tk_mute: 'ミュート', tk_solo: 'ソロ', tk_del: 'トラック削除', tk_sound: 'プレビュー音色', tk_dir: '再生方向', tk_div: 'クロック分割', tk_len: '長さ（ホイールまたは −/+）',
  snd_pluck: 'プラック', snd_acid: 'アシッド', snd_pad: 'パッド', snd_bell: 'FMベル', snd_sub: 'サブ', snd_drums: 'ドラム',
  dir_fwd: '順方向', dir_rev: '逆方向', dir_pp: 'ピンポン', dir_rnd: 'ランダム', dir_drunk: 'ドランク',
  i_degree: '度', i_oct: 'oct', i_on: '● オン', i_off: '○ オフ', i_lock: 'ロック', i_chord: 'コード', i_cond: '条件',
  i_pladd: 'パラメーターロック（CC）を追加', i_plhint: 'ロックなし。+ でこのステップにCCを追加（プレビューでは74＝カットオフ、71＝レゾナンス）。',
  ch_none: '単音', ch_triad: '三和音 1-3-5', ch_sus2: 'sus2', ch_sus4: 'sus4', ch_seventh: '7th', ch_sixth: '6th', ch_ninth: '9th', ch_power: 'パワー 1-5-8', ch_octave: 'オクターブ', ch_custom: 'カスタム',
  arp_off: 'オフ', arp_up: '上行', arp_down: '下行', arp_updown: '上下', arp_rnd: 'ランダム',
  cd_always: '常に', cd_xy: '{b}周のうち{a}周目', cd_pre: '前が鳴ったら', cd_npre: '前が鳴らなかったら',
  cd_fill: 'フィル時のみ', cd_nfill: 'フィル以外', cd_1st: '1周目のみ', cd_n1st: '1周目以外',
  op_root: '起点', op_mutate: '変異', op_random: 'ランダム', op_euclid: 'ユークリッド', op_edit: '編集', op_track: 'トラック', op_ab: 'A/B', op_paste: '貼付', op_clear: '消去',
  op_invert: '変形', op_retro: '逆行', op_rotL: '回転', op_rotR: '回転', op_dup: '複製', op_half: '半分', op_human: '人間味',
  op_degUp: '度 +', op_degDn: '度 −', op_octUp: 'oct +', op_octDn: 'oct −', op_unlock: '解除',
  tr_nodes: 'バージョン',
  sh_sin: 'サイン', sh_tri: '三角', sh_up: '上昇', sh_down: '下降', sh_exp: 'EXP', sh_rnd: 'ランダム', sh_flat: '平坦',
  msg_nochange: '変化なし（ロック中または空）', msg_maxtracks: '最大8トラック', msg_key: 'キー：', msg_copied: 'コピーしました', msg_noclip: '先にパターンをコピーしてください',
  msg_newconfirm: '新しいプロジェクトを始めますか？ 現在のものは保存していなければ失われます。', msg_saved: 'プロジェクトを保存しました', msg_loaded: '読み込みました', msg_badfile: 'Seqのファイルではありません', msg_copiedtxt: 'クリップボードにコピーしました',
  x_title: '書き出し', x_text: 'テキスト', x_live: 'ライブMIDI', x_source: 'ソース', x_pattern: 'パターン', x_song: 'チェーン（ソング）', x_len: '長さ', x_bars: '小節',
  x_cycle: 'ポリリズムの完全な周期', x_tracks: 'トラック', x_alltracks: 'すべて（マルチトラック）', x_profile: '機材プロファイル', x_seed: 'シード（確率）',
  x_download: 'ダウンロード', x_each: 'トラックごとに1ファイル', x_project: 'プロジェクト', x_copy: 'コピー', x_notes: 'ノート',
  x_native: '<b>ネイティブ形式。</b> Elektronの.seq、Polyendのパターン、TB-03やMonologueのシーケンスSysExは公開仕様がないため、Seqは推測で作りません。プロファイルが機材ごとにMIDIファイルを整え（チャンネル、モノ、アクセント、スライド）、DAWへの読み込みや機材への録音に使えます。',
  pr_general: '汎用 / DAW', pr_elektron: 'Elektron Digitakt · Digitone · Syntakt', pr_cycles: 'Model:Cycles · Model:Samples', pr_tb03: 'Roland TB-03 · 303系', pr_monologue: 'Korg Monologue · minilogue', pr_polyend: 'Polyend Tracker · Play',
  prn_general: '各トラックは自分のMIDIチャンネル（カードのCH）を使用。コード、ラチェット、マイクロタイミング、CC、モジュレーションレーンを含みます。',
  prn_elektron: 'トラック1–8 → チャンネル1–8（初期設定の配置）。PロックとレーンはCCとして各チャンネルに出力。',
  prn_cycles: 'トラック1–6 → チャンネル1–6、機材の各トラックに対応。',
  prn_tb03: '最初のメロディートラックのみ、チャンネル1、モノ。ベロシティ100以上はアクセント（127）、それ以外は72。スライドは重なったノートで、TB-03はスライドとして演奏します。',
  prn_monologue: '最初のメロディートラックのみ、チャンネル1、モノ。スライドとタイは重なったノート（レガート）。',
  prn_polyend: 'トラック1–8 → チャンネル1–8、チャンネルごとに1つのMIDIトラック。',
  x_jsonnote: '各ステップの全レイヤーを含む読みやすいパターン。パターンファイルは「開く」で現在のスロットに読み込めます。',
  x_player: '最小プレーヤーを含める', x_grid: 'ドラム・マトリクス（caja16形式）',
  x_luanote: 'norns スクリプトに貼り付けられる Lua テーブル：MIDIノートとスケール度数、ゲート、確率、ラチェット、条件、CC。caja16、Gridstep、baldosas に対応。',
  x_nomidi: 'このブラウザはWeb MIDIに対応していません（Safariは非対応）。.midで書き出すか、FirefoxかEdgeで開いてください。',
  x_out: 'MIDI出力', x_none: 'なし', x_livenote: '再生中、Seqはこの出力にノートとCCを送ります。各トラックは自分のチャンネルで。',
  help: `<h3>コンセプト</h3><p>Seqは演奏ではなく、シーケンスを試すための道具です。生成し、気に入った部分をロックし、残りを変異させ、バージョンの木をたどります。</p>
<h3>ステップ</h3><ul><li>各ステップのレイヤー：ノート（マゼンタ）、ベロシティ（シアン）、確率（イエロー）、ゲート（シルバー）、ラチェット、マイクロタイミング、スライド/タイ、コード、アルペジオ、条件、CCロック。</li>
<li><b>グリッド</b>：空のステップをタップでオン、もう一度で選択、選択中をタップでオフ。ドラッグで塗る。Shift+タップは選択のみ。</li>
<li><b>ロール</b>：選んだトラックのピアノロール（スケール度数）。Shiftでコード音を追加。</li><li><b>レーン</b>：1つのレイヤーを棒で、またはモジュレーション曲線（MOD 1/2）。</li><li><b>オービット</b>：各トラックがリングになり、ポリリズムが見えます。中央をタップで再生。</li></ul>
<h3>記憶のある変異</h3><ul><li>ロックツール（Alt+タップ、L）でステップを守ります。</li><li>変異はロックされていないステップの指定％をスケール内で変えます。ランダムは度数チップと密度を使います。</li>
<li>操作ごとにバージョンにノードが追加されます。どのノードにも戻れ、新しい変更は枝分かれして残ります。</li></ul>
<h3>スケール</h3><p>ノートはスケール度数です。キーやモード（例：ドリアン → フリジアン）を変えても、パターンは崩れずに響きが変わります。</p>
<h3>キー</h3><p><kbd>Space</kbd> 再生 · <kbd>M</kbd> 変異 · <kbd>R</kbd> ランダム · <kbd>E</kbd> ユークリッド · <kbd>L</kbd> ロック · <kbd>F</kbd> フィル · <kbd>Z</kbd>/<kbd>Y</kbd> バージョン · <kbd>1-4</kbd> ビュー · 矢印で移動 · <kbd>Enter</kbd> オン/オフ。</p>
<h3>書き出し</h3><p>MIDI（マルチトラックまたはトラック別、機材プロファイル付き）、JSON、norns用Luaテーブル、テキスト、ライブWeb MIDI。</p>`
};

D.hi = {
  t_play: 'चलाएँ / रोकें (स्पेस)', t_fill: 'FILL', t_fill_hint: 'फ़िल के लिए दबाए रखें: FILL स्टेप बजते हैं, !FILL चुप (F कुंजी)', t_swing: 'स्विंग',
  t_root: 'मूल स्वर', t_scale: 'स्केल', t_new: 'नया', t_open: 'खोलें', t_save: 'सहेजें', t_export: 'निर्यात',
  t_addtrack: 'ट्रैक जोड़ें', t_undo: 'पैरेंट संस्करण पर लौटें (Z)', t_redo: 'नवीनतम चाइल्ड पर जाएँ (Y)',
  p_tracks: 'ट्रैक', p_step: 'स्टेप', p_tree: 'संस्करण',
  v_grid: 'ग्रिड', v_roll: 'रोल', v_lane: 'लेन', v_orbit: 'कक्षा',
  l_vel: 'वेलोसिटी', l_gate: 'गेट', l_prob: 'संभावना', l_ratch: 'रैचेट', l_micro: 'माइक्रो', l_deg: 'स्वर', l_pl: 'P-लॉक',
  l_mod0: 'MOD 1', l_mod1: 'MOD 2',
  l_plhint: 'हर स्टेप पर यह CC तय करने के लिए खींचें · राइट-क्लिक या Alt से मिटाएँ',
  l_modhint: 'खींचकर बनाएँ · बिंदु खींचकर हिलाएँ · Shift+क्लिक जोड़ता है · डबल-क्लिक हटाता है',
  l_lanehint: 'मान बनाने के लिए स्टेप्स पर खींचें',
  tool_trig: 'ट्रिग', tool_lock: 'लॉक', tool_trig_h: 'टैप: चालू / चुनें / बंद · खींचने से रंगता है', tool_lock_h: 'टैप: स्टेप लॉक करें ताकि म्यूटेशन उन्हें न बदले (Alt+टैप भी)',
  g_mutate: 'म्यूटेट', g_mutate_h: 'बिना लॉक वाले स्टेप्स को स्केल में बदलें (M)', g_amount: 'म्यूटेशन की मात्रा',
  g_random: 'रैंडम', g_random_h: 'नियमों के साथ रैंडम, खाली स्टेप्स पर (R)', g_density: 'घनत्व',
  g_degrees: 'डिग्री', g_octs: 'OCT', g_euclid: 'यूक्लिड', g_euclid_h: 'यूक्लिडियन लय: ट्रैक लंबाई पर पल्स और घुमाव (E)',
  g_pulses: 'K', g_rot: 'घुमाव', g_track: 'ट्रैक', g_all: 'सभी',
  o_invert: 'उलट', o_retro: 'रेट्रो', o_dup: 'दोहरा', o_human: 'मानवीय', o_deg: 'डिग्री', o_unlock: 'अनलॉक', o_clear: 'साफ़',
  o_invert_h: 'पहले स्वर के चारों ओर धुन उलटें', o_retro_h: 'रेट्रोग्रेड: उल्टा बजाएँ', o_rotl_h: 'बाएँ घुमाएँ', o_rotr_h: 'दाएँ घुमाएँ',
  o_dup_h: 'दोहराएँ: लंबाई दोगुनी, स्टेप्स की कॉपी', o_half_h: 'आधी लंबाई में संकुचित करें', o_human_h: 'वेलोसिटी और माइक्रो-टाइमिंग को मानवीय बनाएँ',
  o_degdn_h: 'एक स्केल डिग्री नीचे', o_degup_h: 'एक स्केल डिग्री ऊपर', o_octdn_h: 'ट्रैक एक सप्तक नीचे', o_octup_h: 'ट्रैक एक सप्तक ऊपर',
  o_unlock_h: 'सभी स्टेप्स अनलॉक करें', o_clear_h: 'बिना लॉक वाले स्टेप्स साफ़ करें',
  b_pattern: 'पैटर्न', b_song: 'सॉन्ग', b_abcopy: 'A→B', b_abcopy_h: 'इस वैरिएशन को दूसरे पर कॉपी करें', b_bars: 'बार',
  b_copy: 'कॉपी', b_paste: 'पेस्ट', b_clear: 'साफ़', b_chain: 'शृंखला', b_chainadd: 'मौजूदा पैटर्न शृंखला में जोड़ें', b_chainempty: 'खाली — + से पैटर्न जोड़ें',
  tk_mute: 'म्यूट', tk_solo: 'सोलो', tk_del: 'ट्रैक हटाएँ', tk_sound: 'प्रीव्यू ध्वनि', tk_dir: 'चलने की दिशा', tk_div: 'क्लॉक विभाजन', tk_len: 'लंबाई (व्हील या −/+)',
  snd_pluck: 'प्लक', snd_acid: 'एसिड', snd_pad: 'पैड', snd_bell: 'FM घंटी', snd_sub: 'सब', snd_drums: 'ड्रम',
  dir_fwd: 'आगे', dir_rev: 'पीछे', dir_pp: 'पिंग-पोंग', dir_rnd: 'रैंडम', dir_drunk: 'डगमग',
  i_degree: 'डिग्री', i_oct: 'oct', i_on: '● चालू', i_off: '○ बंद', i_lock: 'लॉक', i_chord: 'कॉर्ड', i_cond: 'शर्त',
  i_pladd: 'पैरामीटर लॉक (CC) जोड़ें', i_plhint: 'कोई लॉक नहीं। + इस स्टेप में CC जोड़ता है (प्रीव्यू में 74 = कटऑफ़, 71 = रेज़ोनेंस)।',
  ch_none: 'एकल स्वर', ch_triad: 'त्रिस्वर 1-3-5', ch_sus2: 'sus2', ch_sus4: 'sus4', ch_seventh: '7th', ch_sixth: '6th', ch_ninth: '9th', ch_power: 'पावर 1-5-8', ch_octave: 'सप्तक', ch_custom: 'कस्टम',
  arp_off: 'बंद', arp_up: 'ऊपर', arp_down: 'नीचे', arp_updown: 'ऊपर-नीचे', arp_rnd: 'रैंडम',
  cd_always: 'हमेशा', cd_xy: 'हर {b} में से चक्र {a}', cd_pre: 'अगर पिछला बजा', cd_npre: 'अगर पिछला नहीं बजा',
  cd_fill: 'सिर्फ़ फ़िल में', cd_nfill: 'फ़िल के बाहर', cd_1st: 'सिर्फ़ पहला चक्र', cd_n1st: 'पहले चक्र को छोड़कर',
  op_root: 'मूल', op_mutate: 'म्यूटेशन', op_random: 'रैंडम', op_euclid: 'यूक्लिड', op_edit: 'संपादन', op_track: 'ट्रैक', op_ab: 'A/B', op_paste: 'पेस्ट', op_clear: 'साफ़',
  op_invert: 'रूपांतरण', op_retro: 'रेट्रो', op_rotL: 'घुमाव', op_rotR: 'घुमाव', op_dup: 'दोहराव', op_half: 'आधा', op_human: 'मानवीय',
  op_degUp: 'डिग्री +', op_degDn: 'डिग्री −', op_octUp: 'oct +', op_octDn: 'oct −', op_unlock: 'अनलॉक',
  tr_nodes: 'संस्करण',
  sh_sin: 'साइन', sh_tri: 'त्रिकोण', sh_up: 'रैंप ↑', sh_down: 'रैंप ↓', sh_exp: 'EXP', sh_rnd: 'रैंडम', sh_flat: 'सपाट',
  msg_nochange: 'कुछ नहीं बदला (लॉक या खाली)', msg_maxtracks: 'अधिकतम 8 ट्रैक', msg_key: 'की:', msg_copied: 'कॉपी हुआ', msg_noclip: 'पहले कोई पैटर्न कॉपी करें',
  msg_newconfirm: 'नया प्रोजेक्ट शुरू करें? मौजूदा प्रोजेक्ट तभी बचेगा जब आपने उसे सहेजा हो।', msg_saved: 'प्रोजेक्ट सहेजा गया', msg_loaded: 'लोड हुआ', msg_badfile: 'यह Seq फ़ाइल नहीं है', msg_copiedtxt: 'क्लिपबोर्ड पर कॉपी हुआ',
  x_title: 'निर्यात', x_text: 'टेक्स्ट', x_live: 'लाइव MIDI', x_source: 'स्रोत', x_pattern: 'पैटर्न', x_song: 'शृंखला (सॉन्ग)', x_len: 'लंबाई', x_bars: 'बार',
  x_cycle: 'पूरा पॉलीरिद्म चक्र', x_tracks: 'ट्रैक', x_alltracks: 'सभी (मल्टीट्रैक)', x_profile: 'उपकरण प्रोफ़ाइल', x_seed: 'सीड (संभावनाएँ)',
  x_download: 'डाउनलोड', x_each: 'हर ट्रैक की अलग फ़ाइल', x_project: 'प्रोजेक्ट', x_copy: 'कॉपी', x_notes: 'स्वर',
  x_native: '<b>मूल फ़ॉर्मैट।</b> Elektron .seq, Polyend पैटर्न और TB-03 / Monologue का सीक्वेंस SysEx सार्वजनिक रूप से प्रलेखित नहीं हैं, इसलिए Seq उन्हें अनुमान से नहीं बनाता। प्रोफ़ाइल हर उपकरण के लिए MIDI फ़ाइल को ढालती हैं (चैनल, मोनो, ऐक्सेंट, स्लाइड) ताकि उसे DAW में लाया या मशीन में रिकॉर्ड किया जा सके।',
  pr_general: 'सामान्य / DAW', pr_elektron: 'Elektron Digitakt · Digitone · Syntakt', pr_cycles: 'Model:Cycles · Model:Samples', pr_tb03: 'Roland TB-03 · 303 क्लोन', pr_monologue: 'Korg Monologue · minilogue', pr_polyend: 'Polyend Tracker · Play',
  prn_general: 'हर ट्रैक अपना MIDI चैनल (कार्ड में CH) इस्तेमाल करता है। कॉर्ड, रैचेट, माइक्रो-टाइमिंग, CC और मॉड्यूलेशन लेन शामिल।',
  prn_elektron: 'ट्रैक 1–8 → चैनल 1–8 (डिफ़ॉल्ट व्यवस्था)। P-लॉक और लेन हर चैनल पर CC के रूप में जाते हैं।',
  prn_cycles: 'ट्रैक 1–6 → चैनल 1–6, मशीन के हर ट्रैक के लिए एक।',
  prn_tb03: 'सिर्फ़ पहला मेलोडिक ट्रैक, चैनल 1, मोनो। वेलोसिटी ≥ 100 ऐक्सेंट (127), बाक़ी 72। स्लाइड ओवरलैप होते स्वर हैं, जिन्हें TB-03 स्लाइड की तरह बजाता है।',
  prn_monologue: 'सिर्फ़ पहला मेलोडिक ट्रैक, चैनल 1, मोनो। स्लाइड और टाई ओवरलैप होते स्वर (लेगाटो)।',
  prn_polyend: 'ट्रैक 1–8 → चैनल 1–8, हर चैनल का एक MIDI ट्रैक।',
  x_jsonnote: 'हर स्टेप की सभी परतों वाला पठनीय पैटर्न। पैटर्न फ़ाइलें "खोलें" से मौजूदा स्लॉट में फिर लोड होती हैं।',
  x_player: 'छोटा प्लेयर शामिल करें', x_grid: 'ड्रम मैट्रिक्स (caja16 शैली)',
  x_luanote: 'norns स्क्रिप्ट में चिपकाने लायक Lua टेबल: MIDI स्वर, स्केल डिग्री, गेट, संभावना, रैचेट, शर्तें और CC। caja16, Gridstep या baldosas के साथ काम करती है।',
  x_nomidi: 'इस ब्राउज़र में Web MIDI नहीं है (Safari इसका समर्थन नहीं करता)। .mid निर्यात इस्तेमाल करें, या Seq को Firefox या Edge में खोलें।',
  x_out: 'MIDI आउटपुट', x_none: 'कोई नहीं', x_livenote: 'बजते समय Seq इस आउटपुट पर स्वर और CC भेजता है, हर ट्रैक अपने चैनल पर।',
  help: `<h3>विचार</h3><p>Seq सीक्वेंस आज़माने के लिए है, बजाने के लिए नहीं। बनाइए, जो पसंद आए उसे लॉक कीजिए, बाक़ी को म्यूटेट कीजिए और संस्करणों के पेड़ में घूमिए।</p>
<h3>स्टेप</h3><ul><li>हर स्टेप की परतें: स्वर (मैजेंटा), वेलोसिटी (सियान), संभावना (पीला), गेट (चाँदी), रैचेट, माइक्रो-टाइमिंग, स्लाइड/टाई, कॉर्ड, आर्पेजियो, शर्त और CC लॉक।</li>
<li><b>ग्रिड</b>: खाली स्टेप टैप = चालू, फिर टैप = चुनें, चुने हुए पर टैप = बंद। खींचने से रंगता है। Shift+टैप सिर्फ़ चुनता है।</li>
<li><b>रोल</b>: चुने ट्रैक का पियानो रोल, स्केल डिग्री में। Shift कॉर्ड स्वर जोड़ता है।</li><li><b>लेन</b>: एक परत बार के रूप में, या मॉड्यूलेशन वक्र (MOD 1/2)।</li><li><b>कक्षा</b>: हर ट्रैक एक वलय, पॉलीरिद्म दिखते हैं। बीच में टैप = चलाएँ।</li></ul>
<h3>स्मृति के साथ म्यूटेशन</h3><ul><li>लॉक टूल (या Alt+टैप, या L) स्टेप्स की रक्षा करता है।</li><li>म्यूटेट चुने गए % खाली स्टेप्स को स्केल में बदलता है। रैंडम डिग्री चिप्स और घनत्व का इस्तेमाल करता है।</li>
<li>हर क्रिया "संस्करण" में एक नोड जोड़ती है। किसी भी नोड पर टैप करके लौटें; नए बदलाव शाखा बनाते हैं, कुछ खोता नहीं।</li></ul>
<h3>स्केल</h3><p>स्वर स्केल डिग्री हैं। की या मोड बदलने (जैसे डोरियन → फ्रिजियन) से पैटर्न टूटे बिना नई हार्मनी पाता है।</p>
<h3>कुंजियाँ</h3><p><kbd>Space</kbd> चलाएँ · <kbd>M</kbd> म्यूटेट · <kbd>R</kbd> रैंडम · <kbd>E</kbd> यूक्लिड · <kbd>L</kbd> लॉक · <kbd>F</kbd> फ़िल · <kbd>Z</kbd>/<kbd>Y</kbd> संस्करण · <kbd>1-4</kbd> दृश्य · तीर से चलें · <kbd>Enter</kbd> चालू/बंद।</p>
<h3>निर्यात</h3><p>MIDI (मल्टीट्रैक या प्रति ट्रैक, उपकरण प्रोफ़ाइल के साथ), JSON, norns के लिए Lua टेबल, पठनीय टेक्स्ट और लाइव Web MIDI।</p>`
};

D.zh = {
  t_play: '播放 / 停止（空格）', t_fill: 'FILL', t_fill_hint: '按住进入加花：FILL 步进发声，!FILL 静音（F 键）', t_swing: '摇摆',
  t_root: '主音', t_scale: '音阶', t_new: '新建', t_open: '打开', t_save: '保存', t_export: '导出',
  t_addtrack: '添加轨道', t_undo: '回到上一级版本（Z）', t_redo: '前往最新分支（Y）',
  p_tracks: '轨道', p_step: '步进', p_tree: '版本',
  v_grid: '网格', v_roll: '卷帘', v_lane: '通道', v_orbit: '轨道环',
  l_vel: '力度', l_gate: '门限', l_prob: '概率', l_ratch: '连击', l_micro: '微调', l_deg: '音符', l_pl: '参数锁',
  l_mod0: 'MOD 1', l_mod1: 'MOD 2',
  l_plhint: '拖动为每一步锁定此 CC · 右键或 Alt 擦除',
  l_modhint: '拖动绘制 · 拖动点移动 · Shift+点击添加 · 双击删除',
  l_lanehint: '在步进上拖动以绘制数值',
  tool_trig: '触发', tool_lock: '锁定', tool_trig_h: '点按：开启 / 选择 / 关闭 · 拖动绘制', tool_lock_h: '点按：锁定步进，变异时不改动（也可 Alt+点按）',
  g_mutate: '变异', g_mutate_h: '在音阶内变异未锁定的步进（M）', g_amount: '变异量',
  g_random: '随机', g_random_h: '带约束的随机，作用于空闲步进（R）', g_density: '密度',
  g_degrees: '级数', g_octs: '八度', g_euclid: '欧几里得', g_euclid_h: '欧几里得节奏：在轨道长度上分布脉冲并旋转（E）',
  g_pulses: 'K', g_rot: '旋转', g_track: '本轨', g_all: '全部',
  o_invert: '倒影', o_retro: '逆行', o_dup: '复制', o_human: '人性化', o_deg: '级', o_unlock: '解锁', o_clear: '清除',
  o_invert_h: '以第一个音为轴倒影旋律', o_retro_h: '逆行：倒着播放', o_rotl_h: '向左旋转', o_rotr_h: '向右旋转',
  o_dup_h: '复制：长度加倍并复制步进', o_half_h: '压缩到一半长度', o_human_h: '人性化力度与微时值',
  o_degdn_h: '下移一个音阶级', o_degup_h: '上移一个音阶级', o_octdn_h: '轨道降八度', o_octup_h: '轨道升八度',
  o_unlock_h: '解锁所有步进', o_clear_h: '清除未锁定的步进',
  b_pattern: '模式', b_song: '歌曲', b_abcopy: 'A→B', b_abcopy_h: '把当前变体复制到另一个', b_bars: '小节',
  b_copy: '复制', b_paste: '粘贴', b_clear: '清除', b_chain: '链', b_chainadd: '把当前模式加入链', b_chainempty: '空 — 用 + 添加模式',
  tk_mute: '静音', tk_solo: '独奏', tk_del: '删除轨道', tk_sound: '预听音色', tk_dir: '播放方向', tk_div: '时钟分频', tk_len: '长度（滚轮或 −/+）',
  snd_pluck: '拨弦', snd_acid: '酸性', snd_pad: '铺底', snd_bell: 'FM 钟', snd_sub: '超低', snd_drums: '鼓',
  dir_fwd: '正向', dir_rev: '反向', dir_pp: '往返', dir_rnd: '随机', dir_drunk: '醉步',
  i_degree: '级', i_oct: '八度', i_on: '● 开', i_off: '○ 关', i_lock: '锁定', i_chord: '和弦', i_cond: '条件',
  i_pladd: '添加参数锁（CC）', i_plhint: '无参数锁。+ 为此步添加 CC（预听中 74 = 截止，71 = 共振）。',
  ch_none: '单音', ch_triad: '三和弦 1-3-5', ch_sus2: 'sus2', ch_sus4: 'sus4', ch_seventh: '七和弦', ch_sixth: '六和弦', ch_ninth: '九和弦', ch_power: '强力 1-5-8', ch_octave: '八度', ch_custom: '自定义',
  arp_off: '关', arp_up: '上行', arp_down: '下行', arp_updown: '上下', arp_rnd: '随机',
  cd_always: '总是', cd_xy: '每 {b} 遍的第 {a} 遍', cd_pre: '若上一个发声', cd_npre: '若上一个未发声',
  cd_fill: '仅加花时', cd_nfill: '非加花时', cd_1st: '仅第一遍', cd_n1st: '除第一遍',
  op_root: '起点', op_mutate: '变异', op_random: '随机', op_euclid: '欧几里得', op_edit: '编辑', op_track: '轨道', op_ab: 'A/B', op_paste: '粘贴', op_clear: '清除',
  op_invert: '变换', op_retro: '逆行', op_rotL: '旋转', op_rotR: '旋转', op_dup: '复制', op_half: '减半', op_human: '人性化',
  op_degUp: '级 +', op_degDn: '级 −', op_octUp: '八度 +', op_octDn: '八度 −', op_unlock: '解锁',
  tr_nodes: '个版本',
  sh_sin: '正弦', sh_tri: '三角', sh_up: '上升', sh_down: '下降', sh_exp: '指数', sh_rnd: '随机', sh_flat: '平直',
  msg_nochange: '没有变化（已锁定或为空）', msg_maxtracks: '最多 8 条轨道', msg_key: '调：', msg_copied: '已复制', msg_noclip: '请先复制一个模式',
  msg_newconfirm: '开始新项目？当前项目只有保存过才会保留。', msg_saved: '项目已保存', msg_loaded: '已载入', msg_badfile: '不是 Seq 文件', msg_copiedtxt: '已复制到剪贴板',
  x_title: '导出', x_text: '文本', x_live: '实时 MIDI', x_source: '来源', x_pattern: '模式', x_song: '链（歌曲）', x_len: '长度', x_bars: '小节',
  x_cycle: '完整复节奏周期', x_tracks: '轨道', x_alltracks: '全部（多轨）', x_profile: '设备配置', x_seed: '种子（概率）',
  x_download: '下载', x_each: '每轨一个文件', x_project: '项目', x_copy: '复制', x_notes: '个音符',
  x_native: '<b>原生格式。</b> Elektron .seq、Polyend 模式文件以及 TB-03 / Monologue 的音序 SysEx 没有公开文档，因此 Seq 不会凭空伪造。设备配置会针对每台设备调整 MIDI 文件（通道、单音、重音、滑音），便于导入 DAW 或录进机器。',
  pr_general: '通用 / DAW', pr_elektron: 'Elektron Digitakt · Digitone · Syntakt', pr_cycles: 'Model:Cycles · Model:Samples', pr_tb03: 'Roland TB-03 · 303 克隆', pr_monologue: 'Korg Monologue · minilogue', pr_polyend: 'Polyend Tracker · Play',
  prn_general: '每条轨道使用自己的 MIDI 通道（轨道卡片上的 CH）。包含和弦、连击、微时值、CC 与调制通道。',
  prn_elektron: '轨道 1–8 → 通道 1–8（默认布局）。参数锁和调制通道以 CC 形式在各通道输出。',
  prn_cycles: '轨道 1–6 → 通道 1–6，对应机器的每条轨道。',
  prn_tb03: '仅第一条旋律轨，通道 1，单音。力度 ≥ 100 为重音（127），其余为 72。滑音是重叠的音符，TB-03 会演奏为滑音。',
  prn_monologue: '仅第一条旋律轨，通道 1，单音。滑音和连音为重叠音符（连奏）。',
  prn_polyend: '轨道 1–8 → 通道 1–8，每个通道一条 MIDI 轨。',
  x_jsonnote: '可读的模式，包含每一步的所有层。模式文件可用“打开”重新载入当前槽位。',
  x_player: '包含最小播放器', x_grid: '鼓矩阵（caja16 风格）',
  x_luanote: '可直接粘贴进 norns 脚本的 Lua 表：MIDI 音符及音阶级数、门限、概率、连击、条件与 CC。适用于 caja16、Gridstep 或 baldosas。',
  x_nomidi: '此浏览器不支持 Web MIDI（Safari 不支持）。请使用 .mid 导出，或在 Firefox、Edge 中打开 Seq。',
  x_out: 'MIDI 输出', x_none: '无', x_livenote: '播放时，Seq 将音符和 CC 发送到此输出，每条轨道使用各自的通道。',
  help: `<h3>理念</h3><p>Seq 用来试验音序，而不是演奏。生成，锁定喜欢的部分，变异其余部分，并在版本树中来回浏览。</p>
<h3>步进</h3><ul><li>每一步包含多层：音符（品红）、力度（青）、概率（黄）、门限（银）、连击、微时值、滑音/连音、和弦、琶音、条件和 CC 锁。</li>
<li><b>网格</b>：点空步开启，再点选中，点已选中的关闭。拖动可绘制。Shift+点按仅选择。</li>
<li><b>卷帘</b>：所选轨道按音阶级数显示的钢琴卷帘。Shift 添加和弦音。</li><li><b>通道</b>：以柱状显示单一层，或调制曲线（MOD 1/2）。</li><li><b>轨道环</b>：每条轨道是一个圆环，复节奏一目了然。点中心播放。</li></ul>
<h3>有记忆的变异</h3><ul><li>锁定工具（或 Alt+点按，或 L）保护步进。</li><li>变异在音阶内改变所选比例的未锁定步进。随机使用级数芯片和密度。</li>
<li>每次操作都会在“版本”中添加一个节点。点任意节点即可返回；新的改动会形成分支，不会丢失其他版本。</li></ul>
<h3>音阶</h3><p>音符是音阶级数。改变主音或调式（如多利亚 → 弗里吉亚）会重新配和声而不破坏模式。</p>
<h3>按键</h3><p><kbd>空格</kbd> 播放 · <kbd>M</kbd> 变异 · <kbd>R</kbd> 随机 · <kbd>E</kbd> 欧几里得 · <kbd>L</kbd> 锁定 · <kbd>F</kbd> 加花 · <kbd>Z</kbd>/<kbd>Y</kbd> 版本 · <kbd>1-4</kbd> 视图 · 方向键移动 · <kbd>Enter</kbd> 开/关。</p>
<h3>导出</h3><p>MIDI（多轨或分轨，带设备配置）、JSON、norns 用 Lua 表、可读文本以及实时 Web MIDI。</p>`
};

const I = Seq.i18n = {
  lang: 'es', langs: Object.keys(D), dict: D,
  t(k) { return (D[I.lang] && D[I.lang][k]) ?? D.en[k] ?? ''; },
  set(l) { I.lang = D[l] ? l : 'en'; try { localStorage.setItem('seq.lang', I.lang); } catch (e) {} I.apply(); },
  init() {
    let l = null;
    try { l = localStorage.getItem('seq.lang'); } catch (e) {}
    if (!l) { const n = (navigator.language || 'es').slice(0, 2).toLowerCase(); l = D[n] ? n : 'es'; }
    I.lang = D[l] ? l : 'es';
  },
  apply() {
    document.documentElement.lang = I.lang;
    document.querySelectorAll('[data-i]').forEach(el => { const v = I.t(el.dataset.i); if (v) el.textContent = v; });
    document.querySelectorAll('[data-it]').forEach(el => { const v = I.t(el.dataset.it); if (v) { el.title = v; if (!el.textContent.trim() || el.tagName === 'INPUT') el.setAttribute('aria-label', v); } });
  }
};
})();
