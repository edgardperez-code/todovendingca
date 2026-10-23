import { useEffect } from "react";
import { SITE_URL, routeByPath } from "@shared/site";

export type SEOData = {
  title: string;
  description: string;
  path: string; // ej: "/" o "/vending-para-empresas"
  ogImage?: string;
  jsonLd?: object[];
  /** noindex para páginas que no deben aparecer en buscadores */
  noindex?: boolean;
  /** Imagen del hero a precargar (LCP) */
  preloadImage?: { href: string; imagesrcset?: string; imagesizes?: string };
};

// Capturado durante renderToString en el servidor. Es seguro porque cada
// request se renderiza completa antes de que empiece la siguiente.
export let ssrSEO: SEOData | null = null;
export function resetSSRSeo() {
  ssrSEO = null;
}

const JSONLD_ATTR = "data-seo-jsonld";

/** Título y descripción salen del registro de rutas (shared/site.ts). */
export function seoFor(path: string, jsonLd: object[] = [], extra: Partial<SEOData> = {}): SEOData {
  const r = routeByPath(path);
  return {
    title: r?.title ?? "Todo Vending CA",
    description: r?.description ?? "",
    path,
    jsonLd,
    ...extra,
  };
}

export function useSEO(data: SEOData) {
  if (typeof window === "undefined") {
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
