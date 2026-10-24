# Manual de Seq

[← Volver al README](../README.md)

Seq sirve para **probar secuencias**: armarlas rápido, escucharlas con un sonido básico y llevarlas a otro lado. No tiene mezcla, efectos ni audio grabado, y cada transformación está a un toque.

## Pantalla

```
┌ logo · Seq · ▶ FILL BPM SWING · tónica / escala · osciloscopio · idioma NUEVO ABRIR GUARDAR EXPORTAR ? ┐
│ PISTAS          │ GRILLA ROLL LANE ÓRBITA                 TRIG LOCK │ PASO (inspector)           │
│ tarjetas de     │                                                    │                            │
│ cada pista      │          vista del pattern (canvas)               ├────────────────────────────┤
│                 │                                                    │ VERSIONES (árbol)          │
│                 │ MUTAR · RANDOM · grados · EUCLIDIANO · PISTA/TODAS │                            │
│                 │ INV RETRO ROT DUP ½ HUMANO GRADO OCT LIBERAR BORRAR│                            │
├─────────────────┴────────────────────────────────────────────────────┴────────────────────────────┤
│ PATTERN/SONG · A/B · A→B · compases │ A1 … A16 │ COPIAR PEGAR BORRAR │ cadena                       │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

El sonido se enciende con el primer toque en la página (los navegadores lo piden así).

## Colores de las capas

| Color | Capa |
| --- | --- |
| Magenta | Nota (y slide, acorde, arpegio) |
| Cian | Velocity, ratchet, parameter locks, cabezal de reproducción |
| Amarillo | Probabilidad, condiciones, lanes de modulación, random y euclidiano |
| Plata | Gate, tie, micro-timing, bloqueo |

## Pistas

Cada tarjeta de la izquierda es una pista. Tocala para elegirla.

- **Nombre**: se edita tocando el texto (hasta 8 letras).
- **M / S**: mute y solo.
- **Sonido de preview**: Pluck, Acid (mono con slide real), Pad, Campana FM, Sub (mono) y Batería. En Batería los grados se vuelven instrumentos: BD, SD, CH, OH, CP, RM, TM, PC (el mismo orden que caja16).
- **Dirección**: adelante, atrás, ping-pong, random o drunk (avanza casi siempre, a veces se queda o retrocede).
- **División**: 1/4, 1/8, 1/8T, 1/16, 1/16T, 1/32.
- **Largo**: − / + o la rueda del mouse sobre el número (1 a 64). La barra de abajo muestra el largo y, mientras suena, el cabezal.
- **OCT**: octava base de la pista (no aparece en Batería).
- **CH**: canal MIDI para la exportación y el MIDI en vivo.
- **×** borra la pista; **+** arriba agrega una (hasta 8).

Con largos distintos (16, 13, 7) las pistas se desfasan y aparecen polirritmos sin hacer nada.

## Vistas

Teclas `1` a `4`.

### Grilla

Todas las pistas, un paso por casilla, con todas las capas dibujadas dentro:

- bloque magenta: el paso suena; más brillante cuanta más velocity;
- rayitas blancas: altura de cada nota (varias si hay acorde);
- línea blanca fina que une las notas: el contorno de la melodía;
- barra cian abajo: velocity;
- barra amarilla a la derecha: probabilidad (si es menor a 100 %);
- marcas cian arriba: ratchets;
- línea plateada: gate (punteada si es tie); el triángulo marca el micro-timing;
- curva magenta hacia el paso siguiente: slide;
- texto amarillo: condición; punto cian: tiene parameter locks; esquinas: bloqueado.

Las casillas punteadas a la derecha son pasos fuera del largo de esa pista.

**Herramienta TRIG** (por defecto): tocá un paso apagado para encenderlo; tocá uno encendido para elegirlo; tocá el elegido para apagarlo. Arrastrando se pinta. `Shift`+toque solo elige.

**Herramienta LOCK** (o `Alt`+toque, o la tecla `L`): bloquea y desbloquea pasos. Los bloqueados no los tocan Mutar, Random, Euclidiano, Humanizar, Grado ni Borrar.

### Roll

Piano roll de la pista elegida. Cada fila es un grado de la escala, con el nombre de la nota y el número de grado; las filas de la tónica están marcadas en magenta.

- Tocar una casilla vacía pone la nota (reemplaza la anterior del paso).
- Con `Shift`, o en pistas Pad y Batería, la nota se suma como acorde.
- Tocar una nota existente la saca.
- Arrastrando en horizontal se pintan o borran notas en la misma fila.

Se ven el gate (largo), los ratchets (la nota partida), la probabilidad (línea amarilla) y el slide (curva hasta la nota siguiente).

### Lane

Una sola capa de la pista elegida, como barras que se dibujan arrastrando: VEL, GATE (la línea punteada marca 1.0 = un paso entero), PROB, RATCH, MICRO (bipolar), NOTA (grado) y P-LOCK.

- **P-LOCK**: elegí el número de CC arriba y dibujá su valor paso por paso. Clic derecho o `Alt` borra el lock de ese paso.
- **MOD 1 / MOD 2**: lanes de modulación con curvas suaves, que recorren el largo de la pista. Arrastrá en el vacío para dibujar a mano; arrastrá un punto para moverlo; `Shift`+clic agrega un punto; doble clic lo borra. Los botones SENO, TRI, RAMPA ↑, RAMPA ↓, EXP, RND y PLANA cargan formas. Las marcas cian muestran el valor que se manda en cada paso. ON / OFF activa la lane y el número es el CC que controla.

En el preview, el CC 74 mueve el corte del filtro, el 71 la resonancia, el 7 el volumen y el 10 el paneo. En la exportación se mandan todos los CC que pongas.

### Órbita

Cada pista es un anillo; los pasos están repartidos alrededor y cada cabezal gira a su velocidad. Es la forma más clara de ver un 16 contra 13 contra 7. La altura de la nota desplaza el punto hacia afuera o hacia adentro, el tamaño es la velocity, el arco amarillo la probabilidad. En el centro hay un osciloscopio circular; tocalo para play / stop. Los pasos se tocan igual que en la grilla.

## Inspector de paso

A la derecha, para el paso elegido:

- **ON / OFF** y **LOCK**; ◀ ▶ cambian de paso.
- **Nota**: ▲ ▼ mueven un grado, OCT− / OCT+ una octava. Se muestran la nota, el grado y la octava relativa.
- **VEL** (1–127), **GATE** (0.05–4 pasos), **PROB** (0–100 %), **MICRO** (−50 a +50 % de un paso), **RATCH** (1 a 8 repeticiones dentro del paso).
- **SLIDE**: la nota se liga con la siguiente (en el preview, Acid y Sub hacen glide de verdad). **TIE**: la nota dura hasta el próximo paso encendido.
- **Acorde**: nota sola, tríada, sus2, sus4, séptima, sexta, novena, power u octava. Se apilan como grados, así que siguen la escala.
- **Arpegio**: arriba, abajo, arriba-abajo o random. Reparte las notas del acorde dentro del paso (cuantas notas tenga, o la cantidad de ratchets si es mayor).
- **Condición**: ver abajo.
- **P-LOCK**: + agrega un CC con su valor; se puede cambiar el número de CC, el valor, o borrarlo.

## Condiciones

| Condición | Suena cuando… |
| --- | --- |
| siempre | siempre (si pasa la probabilidad) |
| `1:2`, `2:2`, `1:3` … `8:8` | en la vuelta X de cada Y vueltas de esa pista |
| `PRE` | el último paso encendido de la pista sonó |
| `!PRE` | el último paso encendido no sonó |
| `FILL` | mantenés apretado FILL (o la tecla `F`) |
| `!FILL` | no estás en fill |
| `1ST` | es la primera vuelta desde el play |
| `!1ST` | cualquier vuelta menos la primera |

Las vueltas se cuentan por pista, así que una pista de 7 pasos cuenta sus vueltas más rápido que una de 16.

## Escalas

Arriba elegís la **tónica** y la **escala**. Las notas se guardan como grados: el grado 0 es la tónica, 7 es la tónica una octava arriba (en escalas de siete notas). Cambiar de modo deja el dibujo del pattern igual y cambia los intervalos: es la transposición modal. En escalas de cinco o seis notas los grados altos caen en otras octavas, como corresponde.

## Generación y transformación

Todo está en la franja de abajo, a un toque. El selector **PISTA / TODAS** define si actúa sobre la pista elegida o sobre todas.

- **MUTAR** (`M`): cambia el porcentaje elegido (la barrita magenta al lado) de pasos no bloqueados. Puede mover la nota dentro de la escala (si marcaste grados, elige entre esos), apagar o encender pasos, cambiar velocity, gate, ratchet o probabilidad, o intercambiar un paso con el vecino.
- **RANDOM** (`R`): rehace los pasos libres con la **densidad** elegida, usando solo los **grados** marcados (por ejemplo 1, 3 y 5) y el rango de **OCT** (1, 2 o 3 octavas). Sin grados marcados usa toda la escala.
- **EUCLIDIANO** (`E`): K pulsos repartidos en el largo de la pista, con rotación. Mover K o ROT y soltar aplica directamente. Los pasos nuevos toman un grado de los marcados.
- **INV**: invierte la melodía alrededor de la primera nota. **RETRO**: al revés. **ROT ← / →**: corre todo un paso. **DUP**: duplica el largo copiando. **½**: comprime a la mitad (toma un paso de cada dos). **HUMANO**: pequeñas variaciones de velocity y micro-timing. **GRADO ↓ / ↑**: transpone por grado. **OCT ↓ / ↑**: octava de la pista. **LIBERAR**: saca todos los bloqueos. **BORRAR**: limpia los pasos libres.

## Versiones (árbol)

Cada operación agrega un nodo al árbol del pattern; las ediciones a mano se agrupan en un nodo cuando dejás de tocar un momento. Debajo de cada nodo hay una miniatura de sus pasos.

- Tocá cualquier nodo para volver a esa versión. Si cambiás algo desde ahí, sale una **rama nueva** y las otras siguen estando.
- ↶ (o `Z`) va a la versión madre; ↷ (o `Y`) a la hija más reciente.
- Colores: magenta mutación, amarillo random / euclidiano, cian transformaciones, plata edición.
- Cada pattern tiene su árbol. Se guarda con el proyecto (hasta 240 versiones por pattern; las ramas viejas que no llevan a la actual se descartan primero).

## Banco, A/B y song

- **A1–A16**: tocá un slot para ir a ese pattern. Si está sonando, el cambio queda en espera (titila) y entra al terminar el compás.
- **COMPASES**: cuántos compases dura el pattern en la cadena y cada cuánto se puede cambiar.
- **A / B**: dos variaciones del mismo pattern. La primera vez que tocás B se crea como copia de A. **A→B** copia la variación actual sobre la otra.
- **COPIAR / PEGAR / BORRAR**: sobre el slot actual.
- **SONG**: reproduce la **cadena**. Con **+** sumás el pattern actual; en cada eslabón, − / + cambian las repeticiones, ‹ lo mueve a la izquierda y × lo saca.

## Archivo

- **GUARDAR** baja el proyecto entero (`seq-project.json`, con árboles).
- **ABRIR** carga un proyecto, o un pattern exportado en JSON (entra en el slot actual).
- **NUEVO** empieza de cero con el pattern demo.
- Todo se guarda solo en el navegador; si borrás los datos del sitio se pierde lo que no hayas bajado.

## Exportar

Ver [`FORMATOS.md`](FORMATOS.md).

## Teclas

| Tecla | Acción |
| --- | --- |
| `Espacio` | play / stop |
| `M` | mutar |
| `R` | random |
| `E` | euclidiano |
| `L` | bloquear / desbloquear el paso elegido |
| `F` (mantener) | fill |
| `Z` / `Y` | versión madre / hija (también `Cmd/Ctrl+Z` y `Shift+Cmd/Ctrl+Z`) |
| `1` `2` `3` `4` | grilla, roll, lane, órbita |
| `←` `→` | paso anterior / siguiente |
| `↑` `↓` | pista anterior / siguiente |
| `Enter` | encender / apagar el paso |
| `Supr` / `Backspace` | apagar el paso |

## Idiomas

El selector de arriba cambia entre español, English, Deutsch, 日本語, हिन्दी y 中文. La primera vez toma el idioma del navegador.
