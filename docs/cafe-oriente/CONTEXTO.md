# Café Oriente — contexto para continuar el trabajo

Documento de traspaso. Resume lo que un agente necesita saber para seguir mejorando
`/cafe-oriente` sin repetir errores ya cometidos. Los informes completos están en esta
misma carpeta; la propuesta de rediseño completo del sitio está en
`docs/propuesta-2026/PROPUESTA.md`.

## Reglas que no se negocian

- **Nada se publica sin que el dueño lo vea y lo apruebe.** Publicar = push a `main`:
  Railway (proyecto `responsible-abundance`, servicio `todovendingca`) construye y despliega
  solo con cada push a `main`. Las ramas de trabajo **no despliegan**.
- El dueño escribe en español y no es técnico: explicar en lenguaje claro, con datos.
- Antes de proponer algo que cambie la **sensación** de la animación, dárselo a probar en
  vivo (como se hizo con los fps). Las cifras no sustituyen a su dedo.

## Trampas técnicas del sitio

- `server/static.ts` aplica `Cache-Control: immutable, max-age=1 año` a todo lo que cuelga de
  `/assets/`. **Todo asset propio lleva versión en el nombre** (`-v1`, `-v2`). Reusar un
  nombre deja a los visitantes recurrentes con el archivo viejo un año.
- La URL canónica es `/cafe-oriente` **sin barra final** (la variante con barra ya redirige
  301). Dentro de la página las rutas de assets deben ser **absolutas**
  (`/cafe-oriente/assets/...`).
- La página estiliza como **elemento** `nav`, `h1`, `h2`, `section`, `img` y `a`. Por eso todo
  el hero usa el prefijo `.mocha-`. Un `<nav>` dentro del hero heredaría `position:fixed`.
- `img` necesita `height:auto` en el CSS global (ya está); sin eso las imágenes con
  atributos `width/height` salen estiradas (ya pasó en producción).
- Railway comprime con gzip en su borde: no hace falta middleware de compresión.
- Las fuentes (Fraunces y Sora) se sirven desde `/cafe-oriente/assets/*-v1.woff2`; ya no se
  usa Google Fonts. Los archivos vienen de los paquetes `@fontsource-variable/*` (licencia OFL).
- `npm install --no-save` de herramientas (playwright-core, lighthouse) se borra con cualquier
  `npm install`/`uninstall` posterior. Instalarlas juntas en un solo comando.

## Decisiones del dueño (no revertir sin preguntarle)

- Hero: video **con fondo**, **24 fps, escena de 450vh, seguimiento directo** (sin
  interpolación). Lo eligió probando en vivo. No bajar fps ni acortar el scroll sin que lo pruebe.
- El video (`mocachino-v2.mp4`, 720x1280, H.264, todos los cuadros clave con `-g 1`) no se
  reproduce solo: el JS hace `video.currentTime = progreso * duracion`.
- **La leche de la máquina es en polvo**, pero el texto del paso de la leche se deja tal cual.
- **La primera pantalla del hero es para quien toma el café**: "Descubre el menú" sigue siendo
  el botón principal. Lo comercial (empresas) va en el cierre y en `#empresas`.
- **Cierre del hero**: título **"Este respiro, en tu *empresa*."** (con "instalada sin costo").
- Instalación de Café Oriente: **gratis** para la empresa. Ya instalada en la
  **Clínica Anzoátegui**. Zona: **todo el estado Anzoátegui, pronto el resto de Venezuela**.
  Contacto: **+58 414-616-4177**, **todovendingca@gmail.com**.

## Estado de la rama `claude/gracious-ride-gl30vp` (octubre 2026, sin publicar)

Rediseño completo del sitio (ver `docs/propuesta-2026/PROPUESTA.md`). En lo que toca a
Café Oriente:

1. **Hero intacto**: el video se descarga desde que abre la página (`preload="auto"`, como en
   el hero aprobado). Se probó esperar al primer gesto (`preload="metadata"`) y se revirtió: en
   datos móviles lentos el video quedaba congelado al empezar a bajar. Dos mejoras: con "reducir
   movimiento" se cancela la descarga del video, y si el video no llega a mostrar ningún cuadro se muestra
   `final-v1.webp` (un corte de red a mitad de descarga no cuenta). Curva, MOMENTOS, 450vh,
   textos y video: sin cambios.
2. **Todo lo demás rediseñado**: resumen con datos clave (`#resumen`, párrafo `.speakable`),
   proceso, menú en tarjetas con ficha compartida (`aria-expanded`, Escape), estación (la imagen es un
   render, no una foto de una instalación), pagos, `#empresas` con proceso de 3 pasos y tarjeta de contacto, FAQ de 10 preguntas
   (visibles y en FAQPage), footer con NAP y enlaces internos, barra fija de WhatsApp en móvil
   (solo aparece después del hero).
3. **SEO**: título de 61 caracteres, descripción de 153, sin `meta keywords`, favicons,
   fuentes propias, `og-image-v2.jpg` (1200x630), JSON-LD en un solo `@graph` con
   `Organization` (`/#organization`, mismo que el home), `Brand` (`/cafe-oriente#brand`),
   `Service` (ya no `Product`), `WebPage`, `BreadcrumbList`, `Menu` y `FAQPage`.
4. **Analítica**: `window.tvTrack(nombre, props)` ya está llamado en los clics de WhatsApp,
   teléfono, correo, apertura de bebidas y en el 50 % / 100 % del hero. Solo envía si existe
   `window.plausible`; no se carga ningún script externo hasta que el dueño elija herramienta.

## Pendientes que siguen necesitando datos del dueño

- Medidas exactas de la Bianchi LEI 400, voltaje y si usa agua de red o de garrafón.
- Plazo real de instalación (hoy la página no promete días).
- Qué clientes además de la Clínica Anzoátegui tienen ya la estación de café.
- Mínimo de personas o de tazas al día, si existe.
- Herramienta de analítica (Plausible, Umami o Cloudflare) y cuenta de Google Business Profile.

## Lo que mide el video (cuadro a cuadro, `hero-pasos.png`)

Hasta 2,67 s los tres elementos solo flotan; 2,67 s cae la primera gota; 3,7–5,0 s chorro
fijo (el tramo más quieto); 5–6,6 s la espuma y el espresso bajan al vaso; 6,75 s aparece la
paleta; **7,25 s se enciende el logo dorado**.
