# Propuesta de rediseño 2026 — www.todovendingca.com

Fecha: 23 de octubre de 2026. Rama: `claude/gracious-ride-gl30vp` (no despliega; publicar = unir a `main`).

- Documento para el dueño (con capturas y lista de decisiones): https://claude.ai/artifact/YHYAvEjGoJkiu1jHhaaaBS
- Vista previa navegable, privada: https://claude.ai/artifact/Nf48eTDvSMYubgN8yrjxhC

Este archivo es la copia técnica de esa propuesta, para quien siga el trabajo en el repositorio.

## 1. Resumen

Se reconstruyó el sitio con la identidad real de Todo Vending (paleta del logo: azul marino
`#182038`, naranja `#F26A1B`, rojo `#F04030`, ámbar `#F5B82E`, celeste `#2890D0`), un home
que dice en la primera línea qué hace la empresa, dónde y que la instalación es gratis, dos
páginas nuevas (clínicas y preguntas frecuentes) y una página de Café Oriente que conserva el
hero animado elegido por el dueño y rediseña todo lo demás. Se corrigieron los problemas de
SEO, GEO (local y motores generativos) e IA encontrados en el código, y una exposición de datos
personales en la API.

## 2. Diagnóstico del sitio anterior (rama `main` al 23/10/2026)

| Área | Hallazgo |
| --- | --- |
| Marca | Verde turquesa y cuadrado "TV" como logo; el logo real es azul marino con rojo, ámbar y celeste. |
| H1 del home | "Tu Solución Integral en Máquinas Vending": sin palabra clave, sin lugar, sin "gratis". |
| Texto | Contenido visible sin acentos (Lecheria, instalacion, maquinas). |
| Visibilidad | Secciones con `opacity:0` hasta hidratar (framer-motion `whileInView`): bloques vacíos en conexión lenta. |
| Café Oriente | Título 77 caracteres, descripción 297, Google Fonts bloqueando el LCP (3,5 s en producción según la auditoría previa), og-image 630×1200 (vertical), sin favicon, `<h4>` dentro de `<button>`, schema `Product` sin precio. |
| Datos estructurados | Dos identidades de empresa (`Todo Vending CA` / `TodoVending, C.A.`) con el mismo `@id`; dos `@id` distintos para la marca Café Oriente; `offers.price: "0"` en servicios. |
| Archivos SEO | `sitemap.xml`, `robots.txt` y `llms.txt` duplicados (client/public y server/routes.ts) y desincronizados. |
| Seguridad | `GET /api/contact` sin autenticación: exponía nombre, correo y teléfono de cada contacto. |
| Conversión | Mismo mensaje de WhatsApp en todo el sitio; el formulario no sabía la página de origen. |
| Medición | Sin analítica. |
| 404 | En inglés. |
| Tipos | `npm run check` fallaba (2 errores en `contact-section.tsx`). |

## 3. Qué se construyó

### Sistema de diseño
- `client/src/index.css`: tokens de color (claro y oscuro), tipografías propias (`client/public/fonts/`:
  Bricolage Grotesque para títulos, Figtree para texto, de `@fontsource-variable`, licencia OFL),
  utilidades (`.eyebrow`, `.btn-whatsapp`, `.btn-navy`, `.card-soft`, `.mark-accent`, `.surface-navy`),
  animaciones de aparición solo CSS (`animation-timeline: view()` bajo `@supports`, sin JavaScript).
- `tailwind.config.ts`: `container` centrado, colores `brand.*`, `cafe.*`, `whatsapp`, escala `text-display-*`.
- `client/public/brand/`: logo recortado de la og-image original (714×240 y 360×121), marca sola.
  Favicons regenerados (`favicon.ico`, `favicon.svg` vectorial, `apple-touch-icon.png`, `icon-192/512.png`,
  `site.webmanifest`).
- `framer-motion` eliminado; 39 componentes shadcn sin uso eliminados (CSS 83 KB → 43 KB).

### Fuente única de verdad: `shared/site.ts`
`BUSINESS` (NAP, RIF, horario, redes), `CLIENTS` (7 ubicaciones reales), `WA_MESSAGES` (mensaje de
WhatsApp por página) y `ROUTES` (path, título ≤ 66 chars, descripción ≤ 155, resumen para llms.txt,
lastmod, prioridad). De aquí salen header, footer, 404, sitemap, robots y llms.txt.

### Páginas React (SSR)
- `/` (home): hero, `KeyFacts` (resumen `speakable`), servicios, cómo funciona, Café Oriente con foto
  real, segmentos + clientes, beneficios, FAQ (7), contacto con `?origen=`.
- `/vending-para-empresas`, `/vending-gimnasios`, `/maquinas-expendedoras-lecheria`: rehechas con la
  misma estructura (`SubpageHero` con breadcrumb, `KeyFacts`, contenido propio, clientes, FAQ, `CTABand`).
- `/vending-para-clinicas` (nueva), `/preguntas-frecuentes` (nueva, 17 preguntas con `FAQPage`).
- 404 en español con enlaces (sin `useSEO`, así el servidor sigue devolviendo 404).
- Contenido en `client/src/content/` (`faqs.ts` por tema, `site-content.ts`).
- Schema en `client/src/lib/schema.ts`: `Organization` única (`/#organization`), `LocalBusiness`,
  `WebSite`, `Brand` Café Oriente (`/cafe-oriente#brand`), `Service` por página con `areaServed` por
  ciudad y oferta sin precio, `FAQPage`, `BreadcrumbList`, `HowTo`, `ItemList` de clientes, `WebPage` con
  `speakable`.

### Café Oriente (`client/public/cafe-oriente/index.html`)
- Hero `.mocha` intacto (curva, MOMENTOS, 450vh, 24 fps, textos, video). Solo: `preload="metadata"` +
  descarga completa al primer gesto; sin descarga con "reducir movimiento"; `error` → `final-v1.webp`.
- Rediseño del resto: `#resumen`, `#proceso`, `#menu` (tarjetas con ficha compartida, `aria-expanded`,
  Escape), `#maquina`, `#pagos`, `#empresas` (instalación gratuita, 3 pasos, CTA con WhatsApp/formulario/
  tel/mail, clientes), `#faq` (10 = FAQPage 10), footer con NAP y enlaces internos, barra fija de
  WhatsApp en móvil después del hero.
- Head: título 61, descripción 153, fuentes propias (`/cafe-oriente/assets/*-v1.woff2`), favicons,
  `og-image-v2.jpg` 1200×630, JSON-LD `@graph` (Organization, Brand, Service, WebPage, BreadcrumbList,
  Menu, FAQPage). `window.tvTrack` con eventos listos para analítica.

### Servidor
- `server/seo-files.ts`: `sitemap.xml`, `robots.txt` (con bots de IA) y `llms.txt` generados desde
  `shared/site.ts`. Copias en `client/public` eliminadas.
- `server/routes.ts`: 301 de `/cafe-oriente/` y `/vasos/` (sin barra), `GET /api/contact` protegido
  con `ADMIN_KEY`, `POST /api/contact` acepta `origen` (va al correo; no se guarda en BD).
- `server/render.ts`: `og:image` 1200×630 (`/og-image-v2.jpg`, nueva, con el logo real), `og:image:alt`,
  `noindex` opcional, `preloadImage` por página (`imagesrcset`/`imagesizes`).
- `server/email.ts`: el correo de contacto incluye "Llegó desde".

## 4. Mediciones (Lighthouse móvil, servidor local, mismas condiciones)

| Página | Versión | Perf | A11y | BP | SEO | LCP | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Inicio | main | 50 | 85 | 100 | 100 | 6,4 s | 975 KB |
| Inicio | propuesta | 75 | 100 | 100 | 100 | 4,4 s | 675 KB |
| Café Oriente | main | 84 | 94 | 96 | 100 | 3,2 s | 3.745 KB |
| Café Oriente | propuesta | 94 | 98 | 100 | 100 | 2,9 s | 336 KB |
| Clínicas (nueva) | propuesta | 74 | 99 | 100 | 100 | 4,8 s | 729 KB |

JS del cliente: 592 KB → 413 KB (126 KB gzip). CSS: 83 KB → 43 KB (8 KB gzip). Las cifras locales
no son comparables con producción (Railway comprime en el borde y la red es real); sirven para
comparar las dos versiones.

Verificado además en cada ruta: estado HTTP, título/descripción/canonical, un solo H1, `alt` en todas
las imágenes, JSON-LD parseable, sin desbordes a 390 y 1440 px, sin errores de consola, modo oscuro.

## 5. Pendiente (necesita al dueño)

- Aprobar dirección visual, hero de Café Oriente intacto, páginas nuevas.
- Confirmar horario, lista de clientes, clientes con estación de café, ficha técnica de la Bianchi,
  plazo de instalación, mínimos.
- Elegir analítica sin cookies (Plausible / Umami / Cloudflare) y pegar su script en `client/index.html`
  y en `cafe-oriente/index.html` (los eventos ya están: `click_whatsapp`, `click_tel`, `click_mailto`,
  `abrir_bebida`, `hero_50`, `hero_100`).
- Google Business Profile (crear/reclamar y añadir a `sameAs`), dominio verificado en Resend.
- Probar el hero de Café Oriente en iPhone y Android reales antes de publicar.
- Tras publicar: enviar sitemap en Search Console, refrescar previews de WhatsApp/Facebook
  (Sharing Debugger), vigilar clics por página.

## 6. Fase 2 (sugerida)

Páginas locales para Puerto La Cruz y Barcelona, página para colegios, reseñas reales de clientes,
fotos reales de máquinas instaladas, reducción adicional del JavaScript (React + Radix + react-hook-form).

## 7. Cómo verificar en local

```bash
npm ci && npm run check && npm run build
PORT=5101 NODE_ENV=production ADMIN_KEY=clave node dist/index.cjs
curl -s http://127.0.0.1:5101/sitemap.xml
```
