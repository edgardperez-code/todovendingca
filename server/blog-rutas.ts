// Rutas del blog: API publica (/api/blog), panel (/api/admin/articulos), feed
// RSS, y lo que el blog aporta al sitemap, a llms.txt y al SSR de /blog.
import type { Express, Request, Response } from "express";
import { z } from "zod";
import {
  aPublico,
  aResumen,
  articuloEntradaSchema,
  generarArticuloSchema,
  type ArticuloPublico,
  type ArticuloResumen,
} from "@shared/blog";
import { blogStorage, SlugRepetidoError } from "./blog-storage";
import { ErrorIa, generarArticulo, iaConfigurada } from "./blog-ia";

const SITE_URL = "https://www.todovendingca.com";
const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Datos que el servidor precarga para pintar /blog y /blog/:slug con SSR (los
// buscadores y las IAs leen el articulo completo sin ejecutar JavaScript). El
// cliente los recibe en window.__DATOS_INICIALES__ para hidratar igual.
export interface DatosBlog {
  lista?: ArticuloResumen[];
  articulo?: { slug: string; datos: ArticuloPublico | null };
}

export async function precargarDatosBlog(url: string): Promise<DatosBlog | null> {
  const ruta = url.split("?")[0].replace(/\/+$/, "") || "/";
  try {
    if (ruta === "/blog") {
      return { lista: (await blogStorage.listar({ soloPublicados: true })).map(aResumen) };
    }
    const m = /^\/blog\/([^/]+)$/.exec(ruta);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      const a = SLUG_VALIDO.test(slug) ? await blogStorage.obtenerPorSlug(slug) : undefined;
      return { articulo: { slug, datos: a && a.estado === "publicado" ? aPublico(a) : null } };
    }
  } catch (error) {
    console.error("[blog] No se pudieron precargar los datos del SSR:", error instanceof Error ? error.message : error);
  }
  return null;
}

function escaparXml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] as string);
}

// <url> del blog para el sitemap (la portada del blog y cada articulo publicado).
export async function entradasSitemapBlog(): Promise<string> {
  let publicados: Awaited<ReturnType<typeof blogStorage.listar>> = [];
  try {
    publicados = await blogStorage.listar({ soloPublicados: true });
  } catch (error) {
    console.error("[blog] Sitemap sin articulos:", error instanceof Error ? error.message : error);
  }
  const ultima = publicados[0]?.actualizadoEn.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  const partes = [
    `  <url>\n    <loc>${SITE_URL}/blog</loc>\n    <lastmod>${ultima}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
  ];
  for (const a of publicados) {
    const imagen = a.imagenPortada
      ? `\n    <image:image>\n      <image:loc>${escaparXml(a.imagenPortada.startsWith("/") ? SITE_URL + a.imagenPortada : a.imagenPortada)}</image:loc>\n      <image:title>${escaparXml(a.titulo)}</image:title>\n    </image:image>`
      : "";
    partes.push(
      `  <url>\n    <loc>${SITE_URL}/blog/${a.slug}</loc>\n    <lastmod>${a.actualizadoEn.slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${imagen}\n  </url>`,
    );
  }
  return partes.join("\n");
}

// Seccion "Blog" que se agrega al final de llms.txt.
export async function seccionLlmsBlog(): Promise<string> {
  try {
    const publicados = await blogStorage.listar({ soloPublicados: true });
    if (publicados.length === 0) return "";
    const lineas = publicados.map((a) => `- [${a.titulo}](${SITE_URL}/blog/${a.slug}): ${a.resumen}`);
    return `\n\n## Blog\n\nArtículos y guías de Todo Vending CA (${SITE_URL}/blog):\n\n${lineas.join("\n")}\n`;
  } catch (error) {
    console.error("[blog] llms.txt sin articulos:", error instanceof Error ? error.message : error);
    return "";
  }
}

async function feedRss(): Promise<string> {
  const publicados = (await blogStorage.listar({ soloPublicados: true })).slice(0, 30);
  const items = publicados
    .map(
      (a) => `    <item>
      <title>${escaparXml(a.titulo)}</title>
      <link>${SITE_URL}/blog/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${a.slug}</guid>
      <description>${escaparXml(a.resumen)}</description>
      <category>${escaparXml(a.categoria)}</category>
      <pubDate>${new Date(a.publicadoEn ?? a.creadoEn).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog de Todo Vending CA</title>
    <link>${SITE_URL}/blog</link>
    <description>Guías sobre máquinas expendedoras, café y vending para empresas en Venezuela.</description>
    <language>es-VE</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

function responderError(res: Response, error: unknown, contexto: string) {
  if (error instanceof ErrorIa) return res.status(error.status).json({ ok: false, error: error.message });
  if (error instanceof SlugRepetidoError) return res.status(409).json({ ok: false, error: error.message });
  if (error instanceof z.ZodError) {
    const p = error.issues[0];
    return res.status(400).json({ ok: false, error: p ? `${p.path.join(".") || "datos"}: ${p.message}` : "Datos inválidos" });
  }
  console.error(`[blog] Error en ${contexto}:`, error instanceof Error ? error.message : error);
  return res.status(500).json({ ok: false, error: "Error interno del servidor" });
}

// Solo una generacion a la vez: cada una cuesta dinero y tarda minutos, y un
// doble clic no debe pagar dos articulos.
let generando = false;

export function registrarRutasBlog(app: Express, verificarAdmin: (req: Request, res: Response) => boolean) {
  // === Publico ===
  app.get("/api/blog", async (_req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=60");
      res.json({ ok: true, articulos: (await blogStorage.listar({ soloPublicados: true })).map(aResumen) });
    } catch (error) {
      responderError(res, error, "GET /api/blog");
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const a = SLUG_VALIDO.test(slug) ? await blogStorage.obtenerPorSlug(slug) : undefined;
      if (!a || a.estado !== "publicado") return res.status(404).json({ ok: false, error: "Artículo no encontrado" });
      res.setHeader("Cache-Control", "public, max-age=60");
      res.json({ ok: true, articulo: aPublico(a) });
    } catch (error) {
      responderError(res, error, "GET /api/blog/:slug");
    }
  });

  app.get("/feed.xml", async (_req, res) => {
    try {
      res.type("application/rss+xml").set("Cache-Control", "public, max-age=3600").send(await feedRss());
    } catch (error) {
      console.error("[blog] Error en /feed.xml:", error instanceof Error ? error.message : error);
      res.status(500).send("Error");
    }
  });

  // === Panel (x-admin-key, igual que el resto de /api/admin) ===
  app.get("/api/admin/articulos", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json({ ok: true, iaConfigurada: iaConfigurada(), articulos: await blogStorage.listar() });
    } catch (error) {
      responderError(res, error, "GET /api/admin/articulos");
    }
  });

  app.get("/api/admin/articulos/:id", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      const a = await blogStorage.obtener(req.params.id);
      if (!a) return res.status(404).json({ ok: false, error: "Artículo no encontrado" });
      res.json({ ok: true, articulo: a });
    } catch (error) {
      responderError(res, error, "GET /api/admin/articulos/:id");
    }
  });

  app.post("/api/admin/articulos", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      const articulo = await blogStorage.crear(articuloEntradaSchema.parse(req.body));
      console.log(`[blog] Artículo creado: ${articulo.slug} (${articulo.estado})`);
      res.status(201).json({ ok: true, articulo });
    } catch (error) {
      responderError(res, error, "POST /api/admin/articulos");
    }
  });

  app.put("/api/admin/articulos/:id", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      const articulo = await blogStorage.actualizar(req.params.id, articuloEntradaSchema.parse(req.body));
      if (!articulo) return res.status(404).json({ ok: false, error: "Artículo no encontrado" });
      console.log(`[blog] Artículo guardado: ${articulo.slug} (${articulo.estado})`);
      res.json({ ok: true, articulo });
    } catch (error) {
      responderError(res, error, "PUT /api/admin/articulos/:id");
    }
  });

  app.delete("/api/admin/articulos/:id", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      if (!(await blogStorage.borrar(req.params.id))) return res.status(404).json({ ok: false, error: "Artículo no encontrado" });
      console.log("[blog] Artículo borrado");
      res.json({ ok: true });
    } catch (error) {
      responderError(res, error, "DELETE /api/admin/articulos/:id");
    }
  });

  app.post("/api/admin/articulos/generar", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    if (generando) {
      return res.status(429).json({ ok: false, error: "Ya se está generando un artículo. Espera a que termine." });
    }
    generando = true;
    try {
      const pedido = generarArticuloSchema.parse(req.body);
      const { articulo, modelo } = await generarArticulo(pedido);
      res.json({ ok: true, articulo, modelo });
    } catch (error) {
      responderError(res, error, "POST /api/admin/articulos/generar");
    } finally {
      generando = false;
    }
  });
}
