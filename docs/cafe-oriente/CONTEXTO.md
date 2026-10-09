# Café Oriente — contexto para continuar el trabajo

Documento de traspaso. Resume lo que un agente necesita saber para seguir mejorando
`/cafe-oriente` sin repetir errores ya cometidos. Los informes completos están en esta
misma carpeta.

## Reglas que no se negocian

- **Nada se publica sin que el dueño lo vea y lo apruebe.** Publicar = push a `main`:
  Railway (proyecto `responsible-abundance`, servicio `todovendingca`) construye y despliega
  solo con cada push a `main`. Esta rama (`cafe-oriente-mejoras`) **no despliega**.
- El dueño escribe en español y no es técnico: explicar en lenguaje claro, con datos.
- Antes de proponer algo que cambie la **sensación** de la animación, dárselo a probar en
  vivo (como se hizo con los fps). Las cifras no sustituyen a su dedo.

## Trampas técnicas del sitio

- `server/static.ts` aplica `Cache-Control: immutable, max-age=1 año` a todo lo que cuelga de
  `/assets/`. **Todo asset propio lleva versión en el nombre** (`-v1`, `-v2`). Reusar un
  nombre deja a los visitantes recurrentes con el archivo viejo un año.
- La URL canónica es `/cafe-oriente` **sin barra final**: dentro de la página las rutas de
  assets deben ser **absolutas** (`/cafe-oriente/assets/...`); una relativa da 404.
- La página estiliza como **elemento** `nav`, `h1`, `h2`, `section`, `img` y `a`, y ya existe
  un `.paso`. Por eso todo el hero usa el prefijo `.mocha-`. Un `<nav>` dentro del hero
  heredaba `position:fixed` de la barra superior (ya pasó).
- `img` necesita `height:auto` en el CSS global (ya está); sin eso las imágenes con
  atributos `width/height` salen estiradas (ya pasó en producción).
- Railway comprime con gzip en su borde: no hace falta middleware de compresión.

## Decisiones del dueño (no revertir sin preguntarle)

- Hero: video **con fondo**, **24 fps, escena de 450vh, seguimiento directo** (sin
  interpolación). Lo eligió probando en vivo después de que una optimización a 12 fps + 300vh
  "se sentía a saltos". No bajar fps ni acortar el scroll sin que lo pruebe.
- El video (`mocachino-v2.mp4`, 720x1280, H.264, **todos los cuadros clave** con `-g 1`, para
  poder saltar a cualquier instante) no se reproduce solo: el JS hace
  `video.currentTime = progreso * duracion`.
- **La leche de la máquina es en polvo**, pero el texto del paso de la leche
  ("Vaporizada a la temperatura justa…") **se deja tal cual**. No volver a plantearlo.
- **La primera pantalla del hero es para quien toma el café**: "Descubre el menú" sigue siendo
  el botón principal. Lo comercial (empresas) va en el cierre y en `#empresas`.
- **Cierre del hero**: título **"Este respiro, en tu *empresa*."** (con "instalada sin costo").
- **Durante la animación**: añadir un enlace **"Saltar animación"** (no un botón de WhatsApp).
- Instalación de Café Oriente: **gratis** para la empresa. Ya instalada en la
  **Clínica Anzoátegui**. Zona: **todo el estado Anzoátegui, pronto el resto de Venezuela**.
  Contacto: **+58 414-616-4177**, **todovendingca@gmail.com**.

## Estado de esta rama

1. **Listo, sin publicar, esperando el "publícalo" del dueño**: sección `#empresas` con
   instalación gratuita, botón principal de WhatsApp con mensaje prellenado, formulario como
   secundario (`/?origen=cafe-oriente#contacto`), teléfono y correo pulsables, línea de
   confianza (Clínica Anzoátegui + zona), FAQ visible y FAQPage alineados (7 y 7, con la
   pregunta nueva "¿En qué zonas instalan?"), `contactPoint` de ventas en Organization,
   y `llms.txt` ampliado. Verificado en 1440x900 y 375x812 sin desbordes ni errores.
2. **Hero nuevo aplicado a `index.html` en esta rama, sin publicar.** El dueño eligió
   "Todo lo nuevo" con "Cae el chocolate"; no eligió video, así que se quedó el actual
   (`mocachino-v2.mp4`, sin cambiar de archivo). Combinación: curva suave, textos anclados
   (`MOMENTOS = [0, 0.95, 2.45, 3.5, 4.85, 6.9]`), paso "Listo. Tu respiro." (cierre a 0,95),
   encuadre móvil continuo, pista + rayitas + "Saltar animación", cierre "Este respiro, en tu
   empresa." con velo. Verificado en 1440x900, 375x812 y 360x640.

   **Página de prueba del hero (usada para elegir):**
   Enlace privado (artifact): https://claude.ai/artifact/7Y7Yr6to4EWLq3GEP7Nh89
   Fuente en `docs/cafe-oriente/prueba-hero/` (`hero.html`, `hero.css`, `hero.js` sustituyen
   el hero de una copia de `index.html`; `python3 build.py salida.html` la arma, y hay que
   poner al lado `assets/` con los videos e imágenes). Panel "Ajustes" con: reparto del scroll
   (hoy / curva suave = media entre la curva completa y una recta que acaba en 0,90 / curva
   completa), textos (hoy / anclados con "Cae el chocolate" / con "Un solo chorro"), paso final
   "Listo. Tu respiro.", encuadre móvil continuo (sube hasta -22 % entre 2,6 y 5,6 s, baja a
   -13 % con el vaso listo), ayudas móviles (pista, 4 rayitas, "Saltar animación" con salto
   instantáneo), cierre nuevo "Este respiro, en tu empresa." con/sin velo en escritorio, y
   video actual / liviano (`mocachino-v3.mp4`, CRF 30, 3,03 MB, 190 cuadros, todos clave).
   En la prueba el video se descarga entero y se sirve como blob (el alojamiento del artifact
   puede no aceptar rangos y Safari los exige); en la página real no hace falta.
   Verificada en Chromium a 1440x900, 375x812 y 360x640 (con un VP9 de sustituto, porque el
   Chromium de pruebas no trae H.264): sin errores ni desbordes. Falta verla en un teléfono real.
   Cuando el dueño elija, se pasa su combinación a `client/public/cafe-oriente/index.html`.

   Detalle original de la tarea: (ver `MEJORAS-ANIMACION-HERO.md`,
   sección "Por dónde empezaría", y el código de partida en `IMPLEMENTACIONES-PROPUESTAS.txt`).
   Una copia de la página con un panel de interruptores:
   - Reparto del scroll: como hoy (lineal) / curva suave / curva completa. La curva por puntos
     clave medidos está en `IMPLEMENTACIONES-PROPUESTAS.txt` (ritmo #1). Para la versión suave,
     acercar los puntos a la diagonal (por ejemplo `K[6]` 0.80 → 0.78).
   - Textos: como hoy / anclados al segundo del video (`MOMENTOS = [0, 0.95, 2.45, 3.5, 4.85, 6.9]`),
     con las dos variantes del paso 2 ("Cae el chocolate" / "Un solo chorro").
   - Paso final con el vaso limpio: "Tu mocachino / Listo. Tu *respiro*." antes del cierre,
     que hoy tapa el logo dorado que se enciende a los 7,25 s.
   - En móvil: encuadre que sube con la bebida **de forma continua, atado al scroll** (no por
     pasos con transición, porque eso mueve la imagen sin el dedo), pista táctil que no pise
     el botón, 4 rayitas de progreso y "Saltar animación" (salto instantáneo, sin scroll suave,
     para no recorrer el hero con cientos de seeks).
   - Cierre con el texto nuevo; composición (a) que quepa en pantallas bajas; en escritorio,
     interruptor "con velo (hoy)" / "sin velo, vaso al centro".
   - Opcional: video a CRF 30 (~3,0 MB, mismo 24 fps y todos cuadros clave) para comparar la
     espuma en el teléfono. Comando base:
     `ffmpeg -i FUENTE -t 7.9 -an -vf "delogo=x=572:y=1125:w=60:h=68" -c:v libx264 -crf 30 -preset veryslow -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart mocachino-v3.mp4`
     (la fuente original no está en el repo; derivar de `mocachino-v2.mp4` también sirve).
   - **El dueño quiere probarla en su teléfono.** Hay que darle una URL que abra desde el
     móvil sin publicar en producción (no tocar `main`).
3. Pendientes del informe de auditoría (ver `INFORME-AUDITORIA.md`, "Orden sugerido"):
   fuentes auto-hospedadas (el LCP móvil es el `h1` esperando a Google Fonts, 3,5 s), favicon
   404, título y descripción largos, contrastes, og-image de 443 KB, `preload="metadata"` del
   video con carga al primer gesto (probar en iPhone), manejo de error del video, analítica sin
   cookies, bloque Café Oriente del home.

## Lo que mide el video (cuadro a cuadro, `hero-pasos.png`)

Hasta 2,67 s los tres elementos solo flotan; 2,67 s cae la primera gota; 3,7–5,0 s chorro
fijo (el tramo más quieto); 5–6,6 s la espuma y el espresso bajan al vaso; 6,75 s aparece la
paleta; **7,25 s se enciende el logo dorado** (el mejor momento; el cierre entra a p 0.91 =
7,20 s y lo tapa). En móvil el vaso nunca se ve porque el texto ocupa la parte de abajo.
