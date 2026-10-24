# Enlace desde la landing de Buenos Aires Front

[← Volver al README](../README.md)

Seq está lista para ser una de las opciones de la landing de **Buenos Aires Front**, igual que las otras herramientas U-MA.

## Datos de la tarjeta

Están en [`landing.json`](../landing.json), en la raíz del repo:

| Campo | Valor |
| --- | --- |
| Título | Seq |
| Serie | U-MA / Tool 04 |
| Descripción | Secuenciador para probar secuencias: mutación con memoria, árbol de versiones, polirritmos y exportación a MIDI, JSON y Lua para norns. |
| Enlace | https://buenosairesfront.github.io/seq/ |
| Imagen | https://buenosairesfront.github.io/seq/docs/captura.png (1280 × 900) |
| Ícono | https://buenosairesfront.github.io/seq/favicon.svg |

La app tiene metadatos Open Graph, así que al compartir el enlace aparece con título, descripción y captura.

## Ejemplo de tarjeta

```html
<a class="tool" href="https://buenosairesfront.github.io/seq/">
  <img src="https://buenosairesfront.github.io/seq/docs/captura.png"
       alt="Seq U-MA" loading="lazy" width="1280" height="900">
  <small>U-MA / Tool 04</small>
  <h3>Seq</h3>
  <p>Secuenciador para probar secuencias: mutación con memoria, árbol de versiones,
     polirritmos y exportación a MIDI, JSON y Lua para norns.</p>
</a>
```

Si la landing arma la lista leyendo los `landing.json` de cada herramienta:

```js
const tool = await fetch('https://buenosairesfront.github.io/seq/landing.json').then(r => r.json());
```

`landing.json` trae además `titulos` (el texto en los seis idiomas de la app) por si la landing es multilingüe.

## Si la landing usa un dominio propio

Si Buenos Aires Front publica con un dominio propio (un repo `buenosairesfront.github.io` o un `CNAME`), Seq queda en `/seq/` y el enlace puede ser relativo: `href="/seq/"`. En ese caso hay que actualizar las URL de `landing.json` y las etiquetas `og:url` y `og:image` de `index.html`.

## Volver a la landing desde la app

El logo U-MA de arriba a la izquierda es el lugar natural para un enlace de vuelta. Cuando la landing esté publicada, cambiá en `index.html` el `<div class="logo">` por `<a class="logo" href="https://…">` (y el cierre `</div>` por `</a>`).
