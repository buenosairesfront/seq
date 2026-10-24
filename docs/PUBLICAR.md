# Publicación

[← Volver al README](../README.md)

## Dónde está publicada

La app se sirve con **GitHub Pages** desde la rama `main`, carpeta raíz (`/`):

**https://buenosairesfront.github.io/seq/**

El archivo `.nojekyll` hace que Pages sirva los archivos tal cual.

Para activar Pages (o si alguna vez queda apagado): en el repo, **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**. La primera publicación tarda uno o dos minutos.

## Actualizar la app

1. Editá los archivos (`index.html`, `css/`, `js/`).
2. Probala local (abajo).
3. Si cambiaste algo de `js/`, subí el número de versión en `sw.js` (`const V = 'seq-v1'` → `'seq-v2'`) para que la versión instalada se renueve.
4. Commit y push a `main`. Pages se actualiza solo.

Si cambia el aspecto, regenerá las capturas de `docs/`.

## Probar local

Doble clic en `index.html` alcanza. Para probar como en la web (incluido instalar como app):

```sh
python3 -m http.server 8000
# abrí http://localhost:8000
```

## Instalar como app

En el celular, desde el navegador: **Compartir → Agregar a inicio** (iPhone) o **Instalar app** (Android). Funciona sin conexión después de la primera carga.

## Dependencias

Ninguna para correr. Solo carga tipografías de Google Fonts (Barlow Condensed, IBM Plex Mono y Noto Sans JP para el logo); sin conexión usa tipografías del sistema y funciona igual.

## Datos

Todo se guarda en el `localStorage` del navegador (`seq.project`, `seq.lang`, `seq.gen`, `seq.view`). No hay servidor ni cuentas.
