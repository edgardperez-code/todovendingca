// Inyecta el HTML renderizado por React (SSR) y el <head> propio de la ruta
// dentro de la plantilla client/index.html (dev) o dist/public/index.html (prod).
// Compartido entre server/vite.ts (dev, vía ssrLoadModule) y server/static.ts (prod).

export type SEOData = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  jsonLd?: object[];
  // Paginas privadas o de paso (carrito, resultado del pago): que los
  // buscadores no las indexen ni sigan sus enlaces.
  noindex?: boolean;
};

export type RenderModule = {
  render: (url: string) => { html: string; seo: SEOData | null };
};

const SITE_URL = "https://www.todovendingca.com";

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
  const ogImage = seo.ogImage || `${SITE_URL}/og-image.jpg`;
  const jsonLdBlocks = (seo.jsonLd || [])
    .map((block) => `<script type="application/ld+json" data-seo-jsonld="1">${JSON.stringify(block)}</script>`)
    .join("\n    ");
  // data-seo-robots="1" igual que renderHeadTags de client/src/lib/seo.tsx: asi
  // el cliente reconoce este meta como suyo y lo quita al navegar a una pagina
  // indexable (si no, la siguiente pagina quedaria con noindex).
  const robots = seo.noindex
    ? `\n    <meta name="robots" content="noindex, nofollow" data-seo-robots="1" />`
    : "";
  return `<title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeAttr(seo.description)}" />${robots}
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeAttr(seo.title)}" />
    <meta property="og:description" content="${escapeAttr(seo.description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="es_VE" />
    <meta property="og:site_name" content="Todo Vending CA" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonical}" />
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
    if (seo.noindex) {
      // La plantilla trae un robots "index, follow" para todo el sitio; aqui se
      // quita para no dejar dos instrucciones contradictorias (se hace antes de
      // insertar el <head> propio, que trae el noindex).
      page = page.replace(/<meta\s+name="robots"[^>]*>\s*/i, "");
    }
    page = page.replace("<!--app-head-->", renderHeadTags(seo));
    return { html: page, status: 200 };
  }
  // Sin seo => la ruta cayó en NotFound (ninguna página real llamó useSEO).
  // Igual que arriba: fuera el robots "index, follow" de la plantilla y el
  // noindex marcado con data-seo-robots para que el cliente lo quite al navegar
  // desde aquí a una página real.
  page = page.replace(/<meta\s+name="robots"[^>]*>\s*/i, "");
  page = page.replace(
    "<!--app-head-->",
    `<title>Página no encontrada | Todo Vending CA</title>
    <meta name="robots" content="noindex, follow" data-seo-robots="1" />`,
  );
  return { html: page, status: 404 };
}
