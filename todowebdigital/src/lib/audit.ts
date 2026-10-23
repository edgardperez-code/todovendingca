// =====================================================================
// Motor de auditoría SEO / GEO-IAO / rendimiento.
// Descarga el HTML de una URL pública, lo analiza y devuelve una puntuación
// 0-100 por categoría junto con cada comprobación explicada en español.
// No usa servicios externos: todo se calcula aquí.
// =====================================================================
import * as cheerio from "cheerio";
import type { AuditCheck, AuditResult, CheckCategory, CheckStatus } from "@/lib/types";

const UA = "Mozilla/5.0 (compatible; TodoWebDigitalAudit/1.0; +https://www.todowebdigital.com/portafolio)";
const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot", "anthropic-ai", "CCBot"];

async function fetchWithTimeout(url: string, ms: number, init: RequestInit = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*;q=0.8", "accept-language": "es,en;q=0.8", ...(init.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

function isPrivateHost(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254)) return true;
  }
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  return false;
}

export function normalizeAuditUrl(input: string): URL {
  const trimmed = input.trim();
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProto);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Solo se admiten URLs http(s)");
  if (isPrivateHost(url.hostname) && process.env.ALLOW_LOCAL_AUDIT !== "1") {
    throw new Error("No se permiten direcciones internas o locales");
  }
  return url;
}

type Ctx = { checks: AuditCheck[] };
function add(ctx: Ctx, id: string, category: CheckCategory, label: string, status: CheckStatus, detail: string, weight = 1) {
  ctx.checks.push({ id, category, label, status, detail, weight });
}

function scoreFor(checks: AuditCheck[], category: CheckCategory): number {
  const relevant = checks.filter((c) => c.category === category && c.status !== "info");
  const total = relevant.reduce((s, c) => s + c.weight, 0);
  if (!total) return 0;
  const got = relevant.reduce((s, c) => s + c.weight * (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0), 0);
  return Math.round((got / total) * 100);
}

export async function auditUrl(input: string): Promise<AuditResult> {
  const url = normalizeAuditUrl(input);
  const ctx: Ctx = { checks: [] };
  const fetchedAt = new Date().toISOString();

  const started = Date.now();
  let res: Response;
  let html = "";
  try {
    res = await fetchWithTimeout(url.toString(), 20_000);
    html = await res.text();
  } catch (err) {
    return {
      url: url.toString(),
      finalUrl: url.toString(),
      fetchedAt,
      httpStatus: 0,
      responseMs: Date.now() - started,
      htmlBytes: 0,
      scores: { overall: 0, seo: 0, geo: 0, performance: 0 },
      checks: [],
      meta: emptyMeta(),
      error: `No se pudo descargar la página: ${(err as Error).message}`,
    };
  }
  const responseMs = Date.now() - started;
  const htmlBytes = Buffer.byteLength(html, "utf8");
  const finalUrl = res.url || url.toString();
  const origin = new URL(finalUrl).origin;

  const $ = cheerio.load(html);
  // Texto visible: se excluyen scripts, estilos y SVG para no inflar el conteo
  // (los sitios modernos incrustan datos de la aplicación dentro de <script>).
  const $visible = cheerio.load(html);
  $visible("script, style, noscript, template, svg").remove();
  const text = $visible("body").text().replace(/\s+/g, " ").trim();
  const wordCount = text ? text.split(" ").length : 0;

  // ---------- Metadatos básicos ----------
  const title = $("head > title").first().text().trim() || null;
  const description = $('meta[name="description"]').attr("content")?.trim() || null;
  const h1 = $("h1").map((_, el) => $(el).text().replace(/\s+/g, " ").trim()).get().filter(Boolean);
  const h2Count = $("h2").length;
  const h3Count = $("h3").length;
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || null;
  const lang = $("html").attr("lang")?.trim() || null;
  const viewport = $('meta[name="viewport"]').attr("content") || null;
  const robotsMeta = ($('meta[name="robots"]').attr("content") || "").toLowerCase();
  const ogTitle = $('meta[property="og:title"]').attr("content") || null;
  const ogDesc = $('meta[property="og:description"]').attr("content") || null;
  const ogImage = $('meta[property="og:image"]').attr("content") || null;
  const twitterCard = $('meta[name="twitter:card"]').attr("content") || null;
  const favicon = $('link[rel~="icon"]').attr("href") || null;
  const images = $("img");
  const imagesWithoutAlt = images.filter((_, el) => !($(el).attr("alt") ?? "").trim() && $(el).attr("role") !== "presentation").length;
  const imagesLazy = images.filter((_, el) => $(el).attr("loading") === "lazy" || Boolean($(el).attr("width") && $(el).attr("height"))).length;
  const scripts = $("script[src]").length;
  const inlineScriptBytes = $("script:not([src])").map((_, el) => $(el).html()?.length ?? 0).get().reduce((a, b) => a + b, 0);
  const anchors = $("a[href]");
  let internalLinks = 0;
  let externalLinks = 0;
  anchors.each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
    try {
      const u = new URL(href, finalUrl);
      if (u.origin === origin) internalLinks += 1;
      else externalLinks += 1;
    } catch {
      /* ignorar */
    }
  });
  const semanticTags = ["main", "nav", "header", "footer", "article", "section"].filter((tag) => $(tag).length > 0);
  const hasFaqMarkup = $("details, [itemtype*='FAQPage']").length > 0 || /preguntas frecuentes|faq/i.test(text);

  // JSON-LD
  const jsonLdTypes: string[] = [];
  let jsonLdHasOrg = false;
  let jsonLdHasContact = false;
  let jsonLdHasFaq = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || "null");
      const nodes: unknown[] = [];
      const walk = (n: unknown) => {
        if (!n) return;
        if (Array.isArray(n)) return n.forEach(walk);
        if (typeof n === "object") {
          const o = n as Record<string, unknown>;
          if (o["@graph"]) walk(o["@graph"]);
          if (o["@type"]) nodes.push(o);
        }
      };
      walk(parsed);
      for (const n of nodes) {
        const o = n as Record<string, unknown>;
        const types = Array.isArray(o["@type"]) ? (o["@type"] as string[]) : [String(o["@type"])];
        for (const ty of types) {
          if (!jsonLdTypes.includes(ty)) jsonLdTypes.push(ty);
          if (/Organization|LocalBusiness|ProfessionalService|Store|Restaurant|Corporation/.test(ty)) {
            jsonLdHasOrg = true;
            if (o.telephone || o.address || o.email || o.contactPoint) jsonLdHasContact = true;
          }
          if (ty === "FAQPage") jsonLdHasFaq = true;
        }
      }
    } catch {
      add(ctx, "jsonld-invalid", "geo", "JSON-LD válido", "fail", "Hay un bloque de datos estructurados con JSON inválido: los buscadores y la IA lo ignoran.", 2);
    }
  });

  // ---------- Archivos auxiliares (en paralelo) ----------
  const [robotsTxt, sitemapOk, llmsOk] = await Promise.all([
    fetchWithTimeout(`${origin}/robots.txt`, 8000).then(async (r) => (r.ok ? await r.text() : null)).catch(() => null),
    fetchWithTimeout(`${origin}/sitemap.xml`, 8000).then((r) => r.ok).catch(() => false),
    fetchWithTimeout(`${origin}/llms.txt`, 8000).then(async (r) => r.ok && /\S/.test(await r.text())).catch(() => false),
  ]);
  let hasSitemap = sitemapOk;
  const aiBotsBlocked: string[] = [];
  if (robotsTxt) {
    if (/sitemap:\s*\S+/i.test(robotsTxt)) hasSitemap = true;
    // Analiza bloques User-agent → Disallow: / para los bots de IA.
    const blocks = robotsTxt.split(/\n(?=user-agent:)/i);
    for (const block of blocks) {
      const agents = [...block.matchAll(/user-agent:\s*(\S+)/gi)].map((m) => m[1]);
      const disallowAll = /disallow:\s*\/\s*$/im.test(block);
      for (const bot of AI_BOTS) {
        if (agents.some((a) => a.toLowerCase() === bot.toLowerCase()) && disallowAll) aiBotsBlocked.push(bot);
      }
      if (agents.includes("*") && disallowAll) aiBotsBlocked.push("* (todos)");
    }
  }

  // =============================== SEO ===============================
  add(ctx, "https", "seo", "Conexión segura (HTTPS)", finalUrl.startsWith("https://") ? "pass" : "fail", finalUrl.startsWith("https://") ? "La página se sirve por HTTPS." : "La página no usa HTTPS. Google penaliza los sitios no seguros.", 2);
  add(ctx, "status", "seo", "Respuesta del servidor", res.ok ? "pass" : "fail", `El servidor respondió con código ${res.status}.`, 2);

  if (!title) add(ctx, "title", "seo", "Etiqueta <title>", "fail", "La página no tiene título. Es el factor on-page más importante.", 3);
  else if (title.length < 30 || title.length > 65) add(ctx, "title", "seo", "Etiqueta <title>", "warn", `El título tiene ${title.length} caracteres; lo ideal es entre 30 y 60.`, 3);
  else add(ctx, "title", "seo", "Etiqueta <title>", "pass", `Título de ${title.length} caracteres: "${title}".`, 3);

  if (!description) add(ctx, "description", "seo", "Meta descripción", "fail", "Falta la meta descripción. Google y la IA la usan como resumen.", 3);
  else if (description.length < 70 || description.length > 165) add(ctx, "description", "seo", "Meta descripción", "warn", `La descripción tiene ${description.length} caracteres; lo ideal es entre 70 y 160.`, 3);
  else add(ctx, "description", "seo", "Meta descripción", "pass", `Descripción de ${description.length} caracteres.`, 3);

  if (h1.length === 1) add(ctx, "h1", "seo", "Encabezado H1 único", "pass", `H1: "${h1[0]}".`, 2);
  else if (h1.length === 0) add(ctx, "h1", "seo", "Encabezado H1 único", "fail", "No hay H1. Cada página debe tener un título principal.", 2);
  else add(ctx, "h1", "seo", "Encabezado H1 único", "warn", `Hay ${h1.length} H1. Lo recomendable es uno solo.`, 2);

  if (h2Count >= 2) add(ctx, "headings", "seo", "Estructura de encabezados", "pass", `${h2Count} H2 y ${h3Count} H3 organizan el contenido.`, 1);
  else add(ctx, "headings", "seo", "Estructura de encabezados", "warn", `Solo ${h2Count} H2. Los subtítulos ayudan a buscadores y lectores.`, 1);

  if (canonical) {
    let self = false;
    try {
      self = new URL(canonical, finalUrl).href.replace(/\/$/, "") === finalUrl.replace(/\/$/, "");
    } catch {
      /* ignorar */
    }
    add(ctx, "canonical", "seo", "URL canónica", self ? "pass" : "warn", self ? "La canónica apunta a esta misma URL." : `La canónica apunta a ${canonical}.`, 2);
  } else add(ctx, "canonical", "seo", "URL canónica", "warn", "No hay etiqueta canonical. Ayuda a evitar contenido duplicado.", 2);

  add(ctx, "viewport", "seo", "Adaptable a móviles (viewport)", viewport ? "pass" : "fail", viewport ? "Tiene meta viewport." : "Falta la meta viewport: la página no está preparada para celulares.", 2);
  add(ctx, "lang", "seo", "Idioma declarado", lang ? "pass" : "warn", lang ? `El HTML declara idioma "${lang}".` : "Falta el atributo lang en <html>.", 1);

  if (robotsMeta.includes("noindex")) add(ctx, "noindex", "seo", "Indexable", "fail", "La página tiene noindex: Google no la mostrará.", 3);
  else add(ctx, "noindex", "seo", "Indexable", "pass", "La página permite ser indexada.", 3);

  add(ctx, "robots", "seo", "Archivo robots.txt", robotsTxt ? "pass" : "warn", robotsTxt ? "robots.txt disponible." : "No se encontró robots.txt.", 1);
  add(ctx, "sitemap", "seo", "Sitemap XML", hasSitemap ? "pass" : "warn", hasSitemap ? "Sitemap disponible." : "No se encontró sitemap.xml ni referencia en robots.txt.", 2);

  const ogOk = Boolean(ogTitle && ogDesc && ogImage);
  add(ctx, "og", "seo", "Open Graph (redes sociales)", ogOk ? "pass" : ogTitle || ogImage ? "warn" : "fail", ogOk ? "og:title, og:description y og:image presentes." : "Faltan etiquetas Open Graph: al compartir en WhatsApp o redes no se verá bien.", 2);
  add(ctx, "twitter", "seo", "Twitter Card", twitterCard ? "pass" : "warn", twitterCard ? `twitter:card = ${twitterCard}.` : "Falta twitter:card.", 1);

  const imgTotal = images.length;
  if (imgTotal === 0) add(ctx, "alt", "seo", "Textos alternativos en imágenes", "info", "La página no tiene imágenes <img>.", 0);
  else {
    const ratio = (imgTotal - imagesWithoutAlt) / imgTotal;
    add(ctx, "alt", "seo", "Textos alternativos en imágenes", ratio >= 0.9 ? "pass" : ratio >= 0.6 ? "warn" : "fail", `${imgTotal - imagesWithoutAlt} de ${imgTotal} imágenes tienen texto alternativo.`, 2);
  }
  add(ctx, "internal-links", "seo", "Enlaces internos", internalLinks >= 5 ? "pass" : internalLinks >= 2 ? "warn" : "fail", `${internalLinks} enlaces internos y ${externalLinks} externos.`, 1);
  add(ctx, "favicon", "seo", "Favicon", favicon ? "pass" : "warn", favicon ? "Favicon declarado." : "No se declara favicon.", 1);
  add(ctx, "content-length", "seo", "Cantidad de contenido", wordCount >= 300 ? "pass" : wordCount >= 120 ? "warn" : "fail", `${wordCount} palabras visibles.`, 2);

  // =============================== GEO / IAO ===============================
  if (jsonLdTypes.length === 0) add(ctx, "jsonld", "geo", "Datos estructurados (schema.org)", "fail", "No hay JSON-LD. Sin datos estructurados la IA tiene que adivinar qué es tu negocio.", 3);
  else add(ctx, "jsonld", "geo", "Datos estructurados (schema.org)", "pass", `Tipos detectados: ${jsonLdTypes.join(", ")}.`, 3);
  add(ctx, "jsonld-org", "geo", "Identidad del negocio (Organization/LocalBusiness)", jsonLdHasOrg ? (jsonLdHasContact ? "pass" : "warn") : "fail", jsonLdHasOrg ? (jsonLdHasContact ? "La organización incluye datos de contacto verificables." : "Hay Organization pero sin teléfono, dirección o correo.") : "No se declara la organización en datos estructurados.", 3);
  add(ctx, "faq", "geo", "Preguntas frecuentes", jsonLdHasFaq ? "pass" : hasFaqMarkup ? "warn" : "fail", jsonLdHasFaq ? "Hay schema FAQPage: formato ideal para respuestas de IA." : hasFaqMarkup ? "Hay sección de preguntas pero sin schema FAQPage." : "No hay preguntas frecuentes. La IA las usa para responder consultas directas.", 2);
  add(ctx, "llms", "geo", "Archivo llms.txt", llmsOk ? "pass" : "fail", llmsOk ? "llms.txt disponible: resumen del negocio para modelos de IA." : "No existe /llms.txt. Es la forma más directa de explicarle tu negocio a la IA.", 2);
  if (!robotsTxt) add(ctx, "ai-bots", "geo", "Acceso de rastreadores de IA", "warn", "Sin robots.txt no se puede confirmar el acceso de los bots de IA (por defecto está permitido).", 3);
  else if (aiBotsBlocked.length) add(ctx, "ai-bots", "geo", "Acceso de rastreadores de IA", "fail", `robots.txt bloquea a: ${aiBotsBlocked.join(", ")}. Así no puedes aparecer en sus respuestas.`, 3);
  else add(ctx, "ai-bots", "geo", "Acceso de rastreadores de IA", "pass", "GPTBot, ClaudeBot, PerplexityBot y Google-Extended pueden leer el sitio.", 3);
  add(ctx, "answer-first", "geo", "Resumen claro (title + descripción coherentes)", title && description ? "pass" : "fail", title && description ? "Título y descripción permiten a la IA resumir la página." : "Falta título o descripción; la IA no tiene un resumen fiable.", 2);
  add(ctx, "semantic", "geo", "HTML semántico", semanticTags.length >= 3 ? "pass" : semanticTags.length >= 1 ? "warn" : "fail", semanticTags.length ? `Etiquetas semánticas: ${semanticTags.join(", ")}.` : "No se usan main, nav, header, footer, article ni section.", 1);
  add(ctx, "geo-content", "geo", "Contenido suficiente para citar", wordCount >= 500 ? "pass" : wordCount >= 250 ? "warn" : "fail", `${wordCount} palabras. La IA cita páginas con contenido sustancial y específico.`, 2);
  const ssrOk = wordCount >= 100;
  add(ctx, "ssr", "geo", "Contenido visible sin JavaScript", ssrOk ? "pass" : "fail", ssrOk ? "El HTML ya trae el contenido (renderizado en servidor)." : "El HTML llega casi vacío: los rastreadores de IA no ejecutan JavaScript pesado.", 3);

  // =============================== Rendimiento ===============================
  add(ctx, "ttfb", "performance", "Tiempo de respuesta del servidor", responseMs < 800 ? "pass" : responseMs < 2000 ? "warn" : "fail", `${responseMs} ms hasta recibir el HTML completo.`, 3);
  add(ctx, "html-size", "performance", "Tamaño del HTML", htmlBytes < 150_000 ? "pass" : htmlBytes < 400_000 ? "warn" : "fail", `${(htmlBytes / 1024).toFixed(0)} KB de HTML.`, 2);
  add(ctx, "scripts", "performance", "Cantidad de scripts externos", scripts <= 10 ? "pass" : scripts <= 20 ? "warn" : "fail", `${scripts} scripts externos y ${(inlineScriptBytes / 1024).toFixed(0)} KB de scripts en línea.`, 2);
  const enc = res.headers.get("content-encoding");
  add(ctx, "compression", "performance", "Compresión (gzip/brotli)", enc ? "pass" : "warn", enc ? `El servidor comprime con ${enc}.` : "No se detectó compresión en la respuesta.", 1);
  const hints = $('link[rel="preconnect"], link[rel="preload"], link[rel="dns-prefetch"]').length;
  add(ctx, "hints", "performance", "Pistas de carga (preconnect/preload)", hints > 0 ? "pass" : "warn", hints ? `${hints} pistas de recursos.` : "Sin preconnect ni preload: fuentes e imágenes clave cargan más tarde.", 1);
  if (imgTotal === 0) add(ctx, "img-perf", "performance", "Imágenes optimizadas", "info", "Sin imágenes <img>.", 0);
  else add(ctx, "img-perf", "performance", "Imágenes optimizadas", imagesLazy / imgTotal >= 0.7 ? "pass" : imagesLazy / imgTotal >= 0.3 ? "warn" : "fail", `${imagesLazy} de ${imgTotal} imágenes con carga diferida o dimensiones declaradas.`, 2);
  const cache = res.headers.get("cache-control");
  add(ctx, "cache", "performance", "Cabecera Cache-Control", cache ? "pass" : "warn", cache ? `Cache-Control: ${cache}.` : "Sin Cache-Control en el HTML.", 1);

  const seo = scoreFor(ctx.checks, "seo");
  const geo = scoreFor(ctx.checks, "geo");
  const performance = scoreFor(ctx.checks, "performance");
  const overall = Math.round(seo * 0.45 + geo * 0.35 + performance * 0.2);

  return {
    url: url.toString(),
    finalUrl,
    fetchedAt,
    httpStatus: res.status,
    responseMs,
    htmlBytes,
    scores: { overall, seo, geo, performance },
    checks: ctx.checks,
    meta: {
      title,
      description,
      h1,
      canonical,
      lang,
      ogImage,
      jsonLdTypes,
      wordCount,
      images: imgTotal,
      imagesWithoutAlt,
      internalLinks,
      externalLinks,
      scripts,
      hasRobotsTxt: Boolean(robotsTxt),
      hasSitemap,
      hasLlmsTxt: llmsOk,
      aiBotsBlocked,
    },
  };
}

function emptyMeta(): AuditResult["meta"] {
  return {
    title: null,
    description: null,
    h1: [],
    canonical: null,
    lang: null,
    ogImage: null,
    jsonLdTypes: [],
    wordCount: 0,
    images: 0,
    imagesWithoutAlt: 0,
    internalLinks: 0,
    externalLinks: 0,
    scripts: 0,
    hasRobotsTxt: false,
    hasSitemap: false,
    hasLlmsTxt: false,
    aiBotsBlocked: [],
  };
}
