# TodoWeb Digital — www.todowebdigital.com

Sitio web de la agencia **TodoWeb Digital** (antes `digital.todovendingca.com`), construido desde cero con
Next.js 16, pensado para vender servicios de diseño web y optimizado para **SEO, GEO e IAO**.

Incluye:

- **Sitio público**: portada, servicios (6 páginas por servicio), portafolio con puntuación SEO/GEO,
  blog, nosotros, contacto, legales.
- **Blog con IA**: desde el panel `/admin` se escribe un prompt y la API de Claude redacta el artículo
  completo (título, slug, resumen, metadatos SEO, contenido Markdown y preguntas frecuentes). Se revisa y publica.
- **Portafolio con auditoría**: cada proyecto se audita automáticamente (35 comprobaciones de SEO, GEO/IAO y
  rendimiento) y muestra su puntuación 0‑100. También hay una herramienta para auditar la web de cualquier
  cliente potencial.
- **GEO / IAO**: `llms.txt`, `llms-full.txt`, `robots.txt` abierto a GPTBot, ClaudeBot, PerplexityBot y
  Google‑Extended, datos estructurados completos (Organization, ProfessionalService, Service, FAQPage,
  BlogPosting, BreadcrumbList, HowTo, ItemList), contenido en formato pregunta‑respuesta.
- **SEO técnico**: renderizado en servidor, `sitemap.xml` y `feed.xml` dinámicos, canónicas, Open Graph con
  imágenes generadas al vuelo, manifest, cabeceras de seguridad, redirecciones 301 del dominio viejo.

## Estructura

```
todowebdigital/
├─ src/app/(site)/        páginas públicas (layout con cabecera y pie)
├─ src/app/admin/         panel de administración (login + panel)
├─ src/app/api/           rutas API (contacto, admin, generación con IA, auditoría)
├─ src/app/llms.txt, llms-full.txt, feed.xml, robots.ts, sitemap.ts, manifest.ts, opengraph-image.tsx
├─ src/components/        componentes de UI (sitio, admin)
├─ src/lib/site.ts        ⚙️ configuración del negocio: contacto, servicios, planes, precios, FAQ
├─ src/lib/ai.ts          generación de artículos con el SDK de Anthropic
├─ src/lib/audit.ts       motor de auditoría SEO/GEO
├─ src/lib/db/            esquema Drizzle, cliente Postgres, repositorio (Postgres o JSON)
└─ public/portafolio/     capturas de los proyectos
```

## Variables de entorno

Copia `.env.example` a `.env` (local) o cárgalas en Railway → *Variables*.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sí | URL canónica, p. ej. `https://www.todowebdigital.com` |
| `DATABASE_URL` | Recomendada | Postgres (Neon/Railway). Sin ella los datos van a `data/store.json` y **se pierden al redesplegar** |
| `ADMIN_PASSWORD` | Sí (panel) | Contraseña de `/admin` (mínimo 8 caracteres) |
| `SESSION_SECRET` | Recomendada | Secreto para firmar la cookie de sesión (`openssl rand -hex 32`) |
| `ANTHROPIC_API_KEY` | Sí (IA) | Clave de la API de Claude para generar artículos |
| `CLAUDE_MODEL` | No | Modelo a usar. Por defecto `claude-opus-5-5` |
| `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM` | No | Aviso por correo de cada contacto |
| `AUTO_AUDIT` | No | `0` desactiva la auditoría automática del portafolio |

Las tablas se crean solas al arrancar (SQL idempotente en `src/lib/db/schema.ts`) y, si están vacías,
se cargan los proyectos iniciales (Todo Vending CA, Café Oriente, TodoWeb Digital) y un artículo de ejemplo.

## Desarrollo local

```bash
cd todowebdigital
npm install
cp .env.example .env     # y completa al menos ADMIN_PASSWORD
npm run dev              # http://localhost:3000
```

Otros comandos: `npm run build`, `npm start`, `npm run typecheck`, `npm run audit:url -- https://sitio.com`.

## Despliegue en Railway

1. **Nuevo servicio** desde este repositorio y en *Settings → Root Directory* escribe `todowebdigital`.
   El archivo `railway.json` ya define el build (`npm ci && npm run build`) y el arranque (`npm run start`).
2. **Base de datos**: añade un Postgres de Railway (o pega la URL de Neon) como `DATABASE_URL`.
3. **Variables**: `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `ANTHROPIC_API_KEY` y,
   si quieres avisos por correo, las de Resend.
4. **Dominios** (*Settings → Networking → Custom Domain*): añade `www.todowebdigital.com`,
   `todowebdigital.com` y también `digital.todovendingca.com`. En tu proveedor de DNS crea los CNAME que
   Railway indique. El servidor redirige con **301** `todowebdigital.com` → `www.todowebdigital.com` y
   `digital.todovendingca.com/*` → `www.todowebdigital.com/*`, así no se pierde el posicionamiento del
   dominio anterior.
5. Entra a `https://www.todowebdigital.com/admin`, abre **Portafolio** y pulsa **Auditar** en cada
   proyecto para calcular las puntuaciones reales (también se calculan solas la primera vez que alguien
   visita el portafolio).
6. En **Google Search Console** añade la propiedad del nuevo dominio, envía `https://www.todowebdigital.com/sitemap.xml`
   y usa *Cambio de dirección* desde la propiedad antigua si existía.

## Cómo publicar un artículo con IA

1. `/admin` → **Artículos del blog** → **Nuevo artículo**.
2. Escribe el tema e instrucciones (tono, extensión, palabras clave, público) y pulsa **Generar artículo**.
   Tarda entre 1 y 3 minutos; el modelo devuelve el artículo estructurado.
3. Revisa título, URL, resumen, metadatos SEO, contenido (hay vista previa) y preguntas frecuentes.
4. **Publicar**. El artículo aparece en `/blog`, en el `sitemap.xml`, en el `feed.xml` y en `llms.txt`,
   con schema `BlogPosting` + `FAQPage` e imagen Open Graph generada automáticamente.

La generación usa `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`): si el clasificador de
seguridad rechaza por error una petición legítima, la API reintenta en otro modelo en la misma llamada.

## Editar textos, precios y datos de contacto

Todo está en `src/lib/site.ts`: nombre, teléfono, correo, dirección, redes, servicios (con sus FAQ y
precios “desde”), planes y preguntas frecuentes generales. Los precios actuales son orientativos y
**deben revisarse** antes del lanzamiento. `llms.txt`, los datos estructurados y las páginas de servicios
se generan desde ese archivo, así que un solo cambio se refleja en todo el sitio.
