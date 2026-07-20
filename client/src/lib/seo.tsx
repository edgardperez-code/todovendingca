import { useEffect } from "react";
import { SITE_URL } from "./schema";

export type SEOData = {
  title: string;
  description: string;
  path: string; // ej: "/" o "/cafe-oriente"
  ogImage?: string;
  jsonLd?: object[];
};

// Capturado durante el renderToString en el servidor (síncrono, sin condición de
// carrera entre requests porque cada request se procesa hasta el final antes de
// que el siguiente `render()` pueda pisar esta variable — ver server/render.ts).
export let ssrSEO: SEOData | null = null;
export function resetSSRSeo() {
  ssrSEO = null;
}

const JSONLD_ATTR = "data-seo-jsonld";

export function useSEO(data: SEOData) {
  if (typeof window === "undefined") {
    // Server-side: renderToString ejecuta los componentes en orden síncrono,
    // así que esto queda listo justo cuando renderToString retorna.
    ssrSEO = data;
  }

  useEffect(() => {
    document.title = data.title;
    setMetaByName("description", data.description);
    setMetaByProperty("og:title", data.title);
    setMetaByProperty("og:description", data.description);
    setMetaByProperty("og:url", `${SITE_URL}${data.path}`);
    if (data.ogImage) setMetaByProperty("og:image", data.ogImage);
    setMetaByName("twitter:title", data.title);
    setMetaByName("twitter:description", data.description);
    setCanonical(`${SITE_URL}${data.path}`);
    setJsonLd(data.jsonLd || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.title, data.description, data.path]);
}

function setMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(blocks: object[]) {
  document.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach((el) => el.remove());
  blocks.forEach((block) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(JSONLD_ATTR, "1");
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  });
}

// Usado solo en el servidor para construir el <head> de la respuesta HTML.
export function renderHeadTags(data: SEOData): string {
  const canonical = `${SITE_URL}${data.path}`;
  const jsonLdBlocks = (data.jsonLd || [])
    .map(
      (block) =>
        `<script type="application/ld+json" ${JSONLD_ATTR}="1">${JSON.stringify(block)}</script>`,
    )
    .join("\n    ");
  return `<title>${escapeHtml(data.title)}</title>
    <meta name="description" content="${escapeAttr(data.description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeAttr(data.title)}" />
    <meta property="og:description" content="${escapeAttr(data.description)}" />
    <meta property="og:image" content="${data.ogImage || `${SITE_URL}/og-image.jpg`}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="es_VE" />
    <meta property="og:site_name" content="Todo Vending CA" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonical}" />
    <meta name="twitter:title" content="${escapeAttr(data.title)}" />
    <meta name="twitter:description" content="${escapeAttr(data.description)}" />
    <meta name="twitter:image" content="${data.ogImage || `${SITE_URL}/og-image.jpg`}" />
    ${jsonLdBlocks}`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}
function escapeAttr(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}
