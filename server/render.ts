// Inyecta el HTML renderizado por React (SSR) y el <head> propio de la ruta
// dentro de la plantilla client/index.html (dev) o dist/public/index.html (prod).
// Compartido entre server/vite.ts (dev, vía ssrLoadModule) y server/static.ts (prod).

export type SEOData = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  jsonLd?: object[];
  noindex?: boolean;
  preloadImage?: { href: string; imagesrcset?: string; imagesizes?: string };
};

export type RenderModule = {
  render: (url: string) => { html: string; seo: SEOData | null };
};

const SITE_URL = "https://www.todovendingca.com";
const DEFAULT_OG = `${SITE_URL}/og-image-v2.jpg`;

function escapeHtml(s: string) {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
  return s.replace(/[&<>]/g, (c) => map[c]);
}
function escapeAttr(s: string) {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  return s.replace(/[&<>"]/g, (c) => map[c]);
}

function renderHeadTags(seo: SEOData): string {
  const canonical = `${SITE_URL}${seo.path}`;
  const ogImage = seo.ogImage || DEFAULT_OG;
  const robots = seo.noindex ? `<meta name="robots" content="noindex, follow" />` : "";
  const preload = seo.preloadImage
    ? `<link rel="preload" as="image" href="${escapeAttr(seo.preloadImage.href)}"${
        seo.preloadImage.imagesrcset ? ` imagesrcset="${escapeAttr(seo.preloadImage.imagesrcset)}"` : ""
      }${seo.preloadImage.imagesizes ? ` imagesizes="${escapeAttr(seo.preloadImage.imagesizes)}"` : ""} fetchpriority="high" />`
    : "";
  const jsonLdBlocks = (seo.jsonLd || [])
    // "</script" dentro de un texto rompería la página; se escapa por seguridad.
    .map((block) => `<script type="application/ld+json" data-seo-jsonld="1">${JSON.stringify(block).replace(/</g, "\\u003c")}</script>`)
    .join("\n    ");
  return `<title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeAttr(seo.description)}" />
    <link rel="canonical" href="${canonical}" />
    ${robots}
    ${preload}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeAttr(seo.title)}" />
    <meta property="og:description" content="${escapeAttr(seo.description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content="Todo Vending CA, máquinas expendedoras en Venezuela" />
    <meta property="og:locale" content="es_VE" />
    <meta property="og:site_name" content="Todo Vending CA" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(seo.title)}" />
    <meta name="twitter:description" content="${escapeAttr(seo.description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${jsonLdBlocks}`;
}

export function renderPage(
  template: string,
  mod: RenderModule,
  url: string,
): { html: string; status: 200 | 404 } {
  const { html: appHtml, seo } = mod.render(url);
  let page = template.replace("<!--app-html-->", appHtml);
  if (seo) {
    page = page.replace("<!--app-head-->", renderHeadTags(seo));
    return { html: page, status: 200 };
  }
  // Sin seo => la ruta cayó en NotFound (ninguna página real llamó useSEO).
  page = page.replace(
    "<!--app-head-->",
    `<title>Página no encontrada | Todo Vending CA</title>
    <meta name="robots" content="noindex, follow" />`,
  );
  return { html: page, status: 404 };
}
