# Ejemplos

[← Volver al README](../README.md)

El pattern demo con el que arranca Seq (D dórico, 118 BPM), exportado en todos los formatos:

| Archivo | Qué es |
| --- | --- |
| `demo-polirritmo.json` | Pattern en JSON legible. Se abre en Seq con **ABRIR** y entra en el slot actual. |
| `demo-polirritmo.lua` | Tabla Lua para norns, con matriz de batería y reproductor mínimo comentado. |
| `demo-polirritmo.txt` | Texto legible tipo tracker. |
| `demo-polirritmo-4-compases.mid` | MIDI multipista, 4 compases, perfil General. |
| `demo-polirritmo-ciclo.mid` | MIDI multipista del ciclo completo del polirritmo 16 / 13 / 7 (64 compases), con la lane de corte (CC 74) de la melodía. |

Las pistas del demo:

- **LEAD** (16 pasos, pluck): melodía con probabilidades, un ratchet triple, un paso `1:2` y uno `FILL`.
- **BASS** (13 pasos, acid): con dos slides.
- **CHORD** (7 pasos a 1/8, pad): tríadas por grado, una arpegiada.
- **DRUM** (16 pasos): BD, SD, CH y OH, con un ratchet y un hat al 45 %.
