# Formatos de exportación

[← Volver al README](../README.md)

Todo sale desde **EXPORTAR**. Las exportaciones usan un render determinista: la **semilla** fija el resultado de las probabilidades, el random y el drunk, así que la misma semilla da el mismo archivo.

## MIDI (.mid)

Archivo MIDI estándar tipo 1, 96 PPQ, con tempo y compás 4/4.

**Opciones**

- **Origen**: el pattern actual (variación A o B activa) o la cadena del song mode.
- **Largo**: 1, 2, 4, 8, 16 o 32 compases, o el **ciclo completo del polirritmo** (el mínimo común múltiplo de los largos de pista, hasta 64 compases). Con 16 / 13 / 7 el ciclo completo es largo: así se ve cuándo vuelven a coincidir.
- **Pistas**: todas en un archivo multipista, una sola, o **un archivo por pista**.
- **Perfil de equipo** (abajo).

**Qué incluye**

- una pista MIDI por pista de Seq, con su nombre y canal;
- acordes, ratchets y arpegios como notas separadas;
- micro-timing y swing desplazando las notas;
- gate como duración; slide y tie como notas superpuestas (legato);
- probabilidades y condiciones resueltas vuelta por vuelta (`FILL` cuenta como apagado);
- parameter locks como CC justo antes de la nota;
- lanes de modulación como CC con resolución de 1/64, en cada canal;
- pistas en mute no exportan notas (si hay solo, solo exportan las que están en solo).

Si dos notas iguales se pisan en el mismo canal, la primera se corta donde empieza la segunda, así ningún note-off queda colgado.

## Perfiles de equipo

| Perfil | Qué hace |
| --- | --- |
| General / DAW | Cada pista en su canal (el CH de la tarjeta). Todo incluido. |
| Elektron Digitakt · Digitone · Syntakt | Pistas 1–8 en canales 1–8. P-locks y lanes como CC por canal. |
| Model:Cycles · Model:Samples | Pistas 1–6 en canales 1–6. |
| Roland TB-03 · clones de 303 | Solo la primera pista melódica, canal 1, mono (de un acorde queda la nota más grave). Velocity ≥ 100 pasa a 127 (acento), el resto a 72. Los slides salen como notas superpuestas. |
| Korg Monologue · minilogue | Solo la primera pista melódica, canal 1, mono, slides y ties en legato. |
| Polyend Tracker · Play | Pistas 1–8 en canales 1–8. |

### Por qué no hay .seq, patterns de Polyend ni SysEx

El formato `.seq` de Elektron, los archivos de pattern de Polyend y el SysEx de secuencia de la TB-03 y de la Monologue no tienen especificación pública. Escribirlos adivinando bytes podría dar archivos que el equipo rechaza o, peor, que carga mal. Por eso Seq no los genera: los perfiles arman el MIDI a la medida de cada máquina para importarlo en el DAW o grabarlo en el equipo (con el **MIDI en vivo** o desde el DAW), que funciona hoy con todos.

Si en algún momento querés sumar uno de esos formatos, el lugar es `js/export.js`: `E.render()` ya entrega, por pista, cada nota con su tiempo, duración, altura y velocity, y cada CC.

## MIDI en vivo

Con Web MIDI (Chrome, Edge, Firefox; **Safari no lo tiene**) podés elegir una salida y, mientras Seq suena, manda notas y CC a esa salida, cada pista en su canal. Sirve para grabar en tiempo real en una máquina que no importa archivos MIDI.

## JSON

**Pattern** (`seq-a1.json`): legible, con todas las capas de cada paso.

```json
{
  "app": "seq", "kind": "pattern", "version": 1,
  "bpm": 118, "swing": 0, "root": 2, "scale": "dorian", "scaleSteps": [0,2,3,5,7,9,10],
  "slot": "A1",
  "pattern": {
    "name": "demo", "cur": "A",
    "v": { "A": { "bars": 1, "tracks": [ {
      "name": "LEAD", "sound": "pluck", "oct": 4, "len": 16, "dir": "fwd", "div": "1/16", "ch": 1,
      "mute": false, "solo": false, "level": 0.8, "eu": { "k": 4, "rot": 0 },
      "mods": [ { "cc": 74, "on": true, "pts": [ { "x": 0, "y": 0.3 }, { "x": 0.5, "y": 0.8 }, { "x": 1, "y": 0.3 } ] } ],
      "steps": [ { "on": true, "deg": 0, "vel": 100, "gate": 0.5, "prob": 100, "ratch": 1, "micro": 0,
                   "slide": false, "tie": false, "chord": [], "arp": "off", "cond": "", "lock": false, "pl": { "74": 90 } } ]
    } ] }, "B": null }
  }
}
```

| Campo del paso | Valores |
| --- | --- |
| `on` | si el paso está encendido |
| `deg` | grado de escala (0 = tónica; puede ser negativo o pasar la octava). En Batería, 0–7 = BD SD CH OH CP RM TM PC |
| `vel` | 1–127 |
| `gate` | duración en pasos (0.05–4) |
| `prob` | 0–100 |
| `ratch` | 1–8 repeticiones dentro del paso |
| `micro` | −50 a 50 (% de paso) |
| `slide`, `tie` | true / false |
| `chord` | grados extra relativos a `deg` (`[2,4]` = tríada) |
| `arp` | `off`, `up`, `down`, `updown`, `rnd` |
| `cond` | `""`, `"1:2"` … `"8:8"`, `pre`, `npre`, `fill`, `nfill`, `1st`, `n1st` |
| `lock` | bloqueado para la mutación |
| `pl` | parameter locks `{ "númeroCC": valor }` |

La nota MIDI se calcula así: `12 × (oct + 1) + tónica + escala[deg mod n] + 12 × floor(deg / n)`.

**Proyecto** (`seq-project.json`): los 16 patterns, la cadena, tempo, escala y los árboles de versiones. En el proyecto los pasos vacíos se guardan como `0` y los demás solo con los campos que cambian, para que pese poco. Se vuelve a abrir con **ABRIR**.

## Tabla Lua para norns

Una tabla `seq_pattern` lista para pegar en un script:

```lua
local seq_pattern = {
  bpm = 118, swing = 0, root = 2, scale_name = "dorian",
  scale = {0, 2, 3, 5, 7, 9, 10},
  tracks = {
    { -- LEAD
      name = "LEAD", sound = "pluck", len = 16, dir = "fwd", div = 4, ch = 1, oct = 4,
      steps = {
        {on = true, deg = 0, note = 62, vel = 100, gate = 0.5, prob = 100, ratch = 1},
        {on = false},
        {on = true, deg = 4, note = 69, vel = 81, gate = 0.5, prob = 100, ratch = 3, cond = "1:2", cc = {[74] = 90}},
      },
      mod = { [74] = {38, 51, 70, ...} },   -- valor de cada lane por paso
    },
    { -- DRUM
      ...
      grid = {                                -- matriz por instrumento, estilo caja16 / Druma
        BD = {118, 0, 0, 0, 84, 0, ...},
        SD = {0, 0, 0, 0, 84, 0, ...},
      },
    },
  },
}
return seq_pattern
```

- `note` es la nota MIDI ya resuelta; `deg` es el grado, para transponer modalmente desde el script.
- `div` son pasos por negra (4 = semicorcheas), directo para `clock.sync(1 / div)`.
- `chord` trae las notas MIDI del acorde.
- La opción **reproductor mínimo** agrega, comentado, un `seq_play()` con `clock.run` y MIDI que respeta largo, división, probabilidad, gate y acordes de cada pista. Es un punto de partida: si usás un engine propio, cambiá `note_on` por la llamada a tu engine.

**Con tus scripts**

- **caja16 / Druma**: usá `grid` de la pista de batería; cada fila es un instrumento en el orden BD SD CH OH CP RM TM PC, con la velocity como valor (0 = apagado).
- **Gridstep**: cada `steps[i]` ya trae largo (`gate`), altura (`note`), volumen (`vel`) y probabilidad (`prob`), las cuatro capas por paso del tracker.
- **baldosas**: los gates y las distancias entre pasos encendidos sirven para traducir ritmo a separación entre baldosas y altura a ancho.

## Texto

Una tabla legible tipo tracker, para mirar o pegar en notas:

```
SEQ · U-MA · A1/A · 118 BPM · swing 0% · D Dorian

T1 LEAD   pluck · len 16 · fwd · 1/16 · ch 1
  st  note        deg  vel gate  prob rat micro  flags
  01  D4          0    100 0.5   100  1   0
  02  ---
  03  A4          4    81  0.5   100  3   0      IF:1:2 CC:74=90
```
