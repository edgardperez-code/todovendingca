# Todo Vending CA

## Overview

Sitio web y formulario de contacto de Todo Vending CA, empresa de máquinas expendedoras con
sede en Lechería, Anzoátegui, Venezuela. Presenta los servicios (snacks, bebidas, café en grano
de la marca propia Café Oriente, vending deportivo), la instalación gratuita, las ubicaciones
actuales y capta pedidos por WhatsApp y formulario. Todo en español.

## Preferencias del dueño

Lenguaje claro y cotidiano. Nada se publica (push a `main`) sin su aprobación.

## Arquitectura

### Frontend
- React 18 + TypeScript, Vite, Wouter (router), TanStack Query, Tailwind + shadcn/ui.
- **SSR real**: `client/src/entry-server.tsx` renderiza cada ruta en el servidor;
  `client/src/entry-client.tsx` hidrata. El `<head>` (título, descripción, canonical, OG,
  JSON-LD) lo produce `server/render.ts` a partir de `useSEO()` en cada página.
- **Diseño**: tokens en `client/src/index.css` (paleta del logo real: azul marino, naranja,
  rojo, ámbar, celeste), fuentes propias en `client/public/fonts/` (Bricolage Grotesque para
  títulos, Figtree para texto; paquetes `@fontsource-variable`), animaciones de aparición
  CSS-only con `animation-timeline: view()` (sin JavaScript, el contenido siempre está en el HTML).
- **Layout**: `client/src/components/layout/` (header, footer, barra fija de WhatsApp,
  `PageShell`). Bloques reutilizables en `client/src/components/blocks/`.
- **Contenido**: `client/src/content/faqs.ts` (todas las preguntas, por tema) y
  `client/src/content/site-content.ts` (servicios, pasos, segmentos, beneficios).

### Fuente única de verdad
- `shared/site.ts`: datos del negocio (`BUSINESS`), clientes reales (`CLIENTS`), mensajes de
  WhatsApp por página (`WA_MESSAGES`) y el registro de rutas (`ROUTES`: path, título,
  descripción, resumen, lastmod, prioridad). De aquí salen el menú, el footer, el sitemap, el
  robots y el llms.txt.
- `client/src/lib/schema.ts`: bloques schema.org (Organization, LocalBusiness, WebSite, Brand
  Café Oriente, Service por página, FAQPage, BreadcrumbList, HowTo, ItemList de clientes).

### Páginas
- React (SSR): `/`, `/vending-para-empresas`, `/vending-para-clinicas`, `/vending-gimnasios`,
  `/maquinas-expendedoras-lecheria`, `/preguntas-frecuentes`, 404 en español.
- Estáticas servidas por Express (fuera de React): `/cafe-oriente`
  (`client/public/cafe-oriente/index.html`, diseño propio con hero animado por scroll) y
  `/vasos` (encuesta interna, noindex).
- `/registro` y `/api/registro-epay` se sirven por proxy desde `sistema.todovendingca.com`.

### Backend
- Express 5 (ESM), `server/routes.ts`. Rutas: formulario (`POST /api/contact`, envía correo
  con Resend e incluye el campo `origen`), listado de mensajes (`GET /api/contact`, protegido
  con `x-admin-key` = `ADMIN_KEY`), encuesta de vasos, `sitemap.xml`, `robots.txt` y
  `llms.txt` generados desde `shared/site.ts` (`server/seo-files.ts`).
- Redirecciones 301: `todovendingca.com` → `www`, `/cafeoriente` → `/cafe-oriente`,
  `/cafe-oriente/` → `/cafe-oriente`, `/vasos/` → `/vasos`.
- Almacenamiento: Drizzle + Postgres si hay `DATABASE_URL`; si no, memoria (se pierde al
  reiniciar).

### Build
- `npm run build`: Vite (cliente) → `dist/public`, Vite SSR → `dist/server/entry-server.cjs`,
  esbuild (servidor) → `dist/index.cjs`. `npm run check` = `tsc`.
- `server/static.ts`: `/assets/*` con caché inmutable de 1 año (archivos con hash o con
  sufijo `-vN`); el resto, 1 día.

## Variables de entorno
- `RESEND_API_KEY` (correos del formulario y la encuesta), `ADMIN_KEY` (endpoints internos),
  `DATABASE_URL` (opcional), `SISTEMA_URL` (proxy de registro), `PORT`.

## Documentación
- `docs/propuesta-2026/PROPUESTA.md`: propuesta de rediseño y auditoría SEO/GEO/AIO.
- `docs/cafe-oriente/CONTEXTO.md`: decisiones del dueño y trampas técnicas de Café Oriente.
