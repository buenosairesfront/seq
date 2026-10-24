-- Seq · U-MA — pattern A1 (demo)
-- D Dorian · 118 bpm
-- note = nota MIDI ya resuelta; deg = grado de escala (0 = tónica) para transponer modalmente
-- gate en pasos (0.5 = medio paso), micro en % de paso (-50..50), prob 0..100

local seq_pattern = {
  bpm = 118, swing = 0, root = 2, scale_name = "dorian",
  scale = {0, 2, 3, 5, 7, 9, 10},
  tracks = {
    { -- LEAD
      name = "LEAD", sound = "pluck", len = 16, dir = "fwd", div = 4, ch = 1, oct = 4,
      steps = {
        {on = true, deg = 0, note = 62, vel = 70, gate = 0.35, prob = 100, ratch = 1},
        {on = false},
        {on = true, deg = 4, note = 69, vel = 94, gate = 0.45, prob = 100, ratch = 1},
        {on = true, deg = 7, note = 74, vel = 81, gate = 0.75, prob = 60, ratch = 1},
        {on = false},
        {on = true, deg = 2, note = 65, vel = 105, gate = 0.35, prob = 100, ratch = 1},
        {on = true, deg = 5, note = 71, vel = 92, gate = 0.65, prob = 100, ratch = 1},
        {on = false},
        {on = true, deg = 0, note = 62, vel = 116, gate = 0.75, prob = 60, ratch = 1},
        {on = false},
        {on = true, deg = 4, note = 69, vel = 90, gate = 0.35, prob = 100, ratch = 1},
        {on = true, deg = 9, note = 77, vel = 77, gate = 0.65, prob = 100, ratch = 1, cond = "1:2"},
        {on = false},
        {on = true, deg = 4, note = 69, vel = 101, gate = 0.75, prob = 60, ratch = 1},
        {on = false},
        {on = true, deg = 1, note = 64, vel = 75, gate = 0.35, prob = 100, ratch = 1, cond = "fill"},
      },
      mod = {
        [74] = {38, 44, 52, 63, 74, 84, 93, 99, 102, 99, 93, 84, 74, 63, 52, 44},
      },
    },
    { -- BASS
      name = "BASS", sound = "acid", len = 13, dir = "fwd", div = 4, ch = 2, oct = 2,
      steps = {
        {on = true, deg = 0, note = 38, vel = 120, gate = 0.6, prob = 100, ratch = 1},
        {on = false},
        {on = true, deg = 7, note = 50, vel = 88, gate = 0.6, prob = 100, ratch = 1, slide = true},
        {on = true, deg = 0, note = 38, vel = 88, gate = 0.6, prob = 100, ratch = 1},
        {on = false},
        {on = true, deg = 0, note = 38, vel = 88, gate = 0.6, prob = 100, ratch = 1},
        {on = true, deg = 0, note = 38, vel = 88, gate = 0.6, prob = 100, ratch = 1},
        {on = false},
        {on = true, deg = 0, note = 38, vel = 120, gate = 0.6, prob = 100, ratch = 1},
        {on = true, deg = 7, note = 50, vel = 88, gate = 0.6, prob = 100, ratch = 1, slide = true},
        {on = false},
        {on = true, deg = 0, note = 38, vel = 88, gate = 0.6, prob = 100, ratch = 1},
        {on = true, deg = 2, note = 41, vel = 120, gate = 0.6, prob = 100, ratch = 1},
      },
    },
    { -- CHORD
      name = "CHORD", sound = "pad", len = 7, dir = "fwd", div = 2, ch = 3, oct = 3,
      steps = {
        {on = true, deg = 0, note = 50, vel = 72, gate = 1.8, prob = 100, ratch = 1, chord = {50, 53, 57}},
        {on = false},
        {on = true, deg = 3, note = 55, vel = 72, gate = 1.8, prob = 100, ratch = 1, chord = {55, 59, 62}},
        {on = false},
        {on = true, deg = 4, note = 57, vel = 72, gate = 1.8, prob = 100, ratch = 4, chord = {57, 60, 64}, arp = "up"},
        {on = false},
        {on = false},
      },
    },
    { -- DRUM
      name = "DRUM", sound = "drums", len = 16, dir = "fwd", div = 4, ch = 4, oct = 0,
      steps = {
        {on = true, deg = 0, note = 36, vel = 118, gate = 0.25, prob = 100, ratch = 1, chord = {36, 42}, drum = "BD+CH"},
        {on = false},
        {on = true, deg = 2, note = 42, vel = 84, gate = 0.25, prob = 100, ratch = 1, drum = "CH"},
        {on = false},
        {on = true, deg = 0, note = 36, vel = 118, gate = 0.25, prob = 100, ratch = 1, chord = {36, 38, 42}, drum = "BD+SD+CH"},
        {on = false},
        {on = true, deg = 2, note = 42, vel = 84, gate = 0.25, prob = 100, ratch = 1, drum = "CH"},
        {on = true, deg = 3, note = 46, vel = 84, gate = 0.25, prob = 100, ratch = 1, drum = "OH"},
        {on = true, deg = 0, note = 36, vel = 118, gate = 0.25, prob = 100, ratch = 1, chord = {36, 42}, drum = "BD+CH"},
        {on = false},
        {on = true, deg = 0, note = 36, vel = 84, gate = 0.25, prob = 100, ratch = 1, chord = {36, 42}, drum = "BD+CH"},
        {on = false},
        {on = true, deg = 0, note = 36, vel = 118, gate = 0.25, prob = 100, ratch = 1, chord = {36, 38, 42}, drum = "BD+SD+CH"},
        {on = true, deg = 2, note = 42, vel = 100, gate = 0.5, prob = 45, ratch = 1, drum = "CH"},
        {on = true, deg = 2, note = 42, vel = 84, gate = 0.25, prob = 100, ratch = 2, drum = "CH"},
        {on = true, deg = 3, note = 46, vel = 84, gate = 0.25, prob = 100, ratch = 1, drum = "OH"},
      },
      -- matriz por instrumento (velocidad 0..127), estilo caja16 / Druma
      grid = {
        BD = {118, 0, 0, 0, 118, 0, 0, 0, 118, 0, 84, 0, 118, 0, 0, 0},
        SD = {0, 0, 0, 0, 118, 0, 0, 0, 0, 0, 0, 0, 118, 0, 0, 0},
        CH = {118, 0, 84, 0, 118, 0, 84, 0, 118, 0, 84, 0, 118, 100, 84, 0},
        OH = {0, 0, 0, 0, 0, 0, 0, 84, 0, 0, 0, 0, 0, 0, 0, 84},
        CP = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
        RM = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
        TM = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
        PC = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
      },
    },
  },
}

--[[ reproductor mínimo para norns: pegá esto en tu script y llamá seq_play()
     usa MIDI (midi.connect()) — reemplazá note_on por engine.* si usás un engine propio
local m = midi.connect()
local function note_on(t, n, v, dur) m:note_on(n, v, t.ch); clock.run(function() clock.sleep(dur) m:note_off(n, 0, t.ch) end) end
function seq_play()
  params:set("clock_tempo", seq_pattern.bpm)
  for _, t in ipairs(seq_pattern.tracks) do
    clock.run(function()
      local i, loop = 0, 0
      while true do
        clock.sync(1 / t.div)
        local s = t.steps[(i % t.len) + 1]
        if s.on and math.random(100) <= s.prob then
          local dur = clock.get_beat_sec() / t.div * s.gate
          for _, n in ipairs(s.chord or {s.note}) do note_on(t, n, s.vel, dur) end
        end
        i = i + 1
      end
    end)
  end
end
]]

return seq_pattern