import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertEncuestaVasosSchema } from "@shared/schema";
import { z } from "zod";
import { sendContactNotification } from "./email";
import path from "path";

// Sitemap XML content
// Nota: los buscadores ignoran fragmentos (#seccion), por eso solo se listan URLs reales.
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Pagina principal -->
  <url>
    <loc>https://www.todovendingca.com/</loc>
    <lastmod>2026-07-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://www.todovendingca.com/og-image.jpg</image:loc>
      <image:title>Todo Vending CA — Maquinas Expendedoras en Venezuela</image:title>
    </image:image>
    <image:image>
      <image:loc>https://www.todovendingca.com/assets/maquina_vending_hero.webp</image:loc>
      <image:title>Maquina expendedora Todo Vending CA en Lecheria, Anzoategui</image:title>
    </image:image>
  </url>
  <!-- Pagina: Cafe Oriente (marca de cafe) -->
  <url>
    <loc>https://www.todovendingca.com/cafeoriente</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Pagina: Encuesta de Vasos Cafe Oriente -->
  <url>
    <loc>https://www.todovendingca.com/vasos</loc>
    <lastmod>2026-07-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

// Robots.txt content — abierto a buscadores y crawlers de IA (SEO + GEO/AIO)
const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

# Resumen del negocio para modelos de IA
# https://www.todovendingca.com/llms.txt

Sitemap: https://www.todovendingca.com/sitemap.xml`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve /cafeoriente static HTML page (must be before Vite catch-all).
  // Dev: process.cwd() = workspace root (safe in ESM/tsx without __dirname shim).
  // Prod: __dirname = dist/ (CJS bundle dir, same pattern as server/static.ts).
  const cafeOrienteHandler = (req: any, res: any) => {
    const isDev = process.env.NODE_ENV !== "production";
    const filePath = isDev
      ? path.resolve(process.cwd(), "client", "public", "cafeoriente", "index.html")
      : path.resolve(__dirname, "public", "cafeoriente", "index.html");
    res.sendFile(filePath);
  };
  app.get("/cafeoriente", cafeOrienteHandler);
  app.get("/cafeoriente/", cafeOrienteHandler);

  // Serve /vasos static HTML page
  const vasosHandler = (req: any, res: any) => {
    const isDev = process.env.NODE_ENV !== "production";
    const filePath = isDev
      ? path.resolve(process.cwd(), "client", "public", "vasos", "index.html")
      : path.resolve(__dirname, "public", "vasos", "index.html");
    res.sendFile(filePath);
  };
  app.get("/vasos", vasosHandler);
  app.get("/vasos/", vasosHandler);

  // Serve sitemap.xml directly
  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(sitemapXml);
  });

  // Serve robots.txt directly
  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(robotsTxt);
  });
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
      // Send email notification to todovendingca@gmail.com
      const emailSent = await sendContactNotification({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
        company: validatedData.company || undefined,
        message: validatedData.message
      });
      
      if (!emailSent) {
        console.warn("Email notification failed but message was saved");
      }
      
      res.status(201).json({ success: true, message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Datos invalidos", 
          details: error.errors 
        });
      } else {
        console.error("Error creating contact message:", error);
        res.status(500).json({ 
          success: false, 
          error: "Error interno del servidor" 
        });
      }
    }
  });

  // Get all contact messages (for admin purposes)
  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor"
      });
    }
  });

  // === ENCUESTA DE VASOS (Café Oriente feedback) ===

  app.post("/api/encuesta-vasos", async (req, res) => {
    try {
      const validatedData = insertEncuestaVasosSchema.parse(req.body);
      const encuesta = await storage.createEncuestaVasos(validatedData);
      res.status(201).json({ ok: true, encuesta });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          ok: false,
          error: "Datos invalidos",
          details: error.errors,
        });
      } else {
        console.error("Error guardando encuesta:", error);
        res.status(500).json({
          ok: false,
          error: "Error interno del servidor",
        });
      }
    }
  });

  app.get("/api/encuesta-vasos/resumen", async (req, res) => {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: "No autorizado" });
    }

    try {
      const encuestas = await storage.getEncuestasVasos();
      const total = encuestas.length;

      // Promedio general
      const promedioGeneral = total > 0
        ? Number((encuestas.reduce((s, e) => s + Number(e.calificacion), 0) / total).toFixed(2))
        : 0;

      // Desglose por bebida
      const porBebida: Record<string, { cantidad: number; promedio: number }> = {};
      for (const e of encuestas) {
        if (!porBebida[e.bebida]) {
          porBebida[e.bebida] = { cantidad: 0, promedio: 0 };
        }
        porBebida[e.bebida].cantidad += 1;
        porBebida[e.bebida].promedio += Number(e.calificacion);
      }
      for (const key of Object.keys(porBebida)) {
        porBebida[key].promedio = Number(
          (porBebida[key].promedio / porBebida[key].cantidad).toFixed(2)
        );
      }

      // Últimas 20 con comentario
      const ultimasConComentario = encuestas
        .filter((e) => e.comentario && e.comentario.trim().length > 0)
        .slice(0, 20)
        .map((e) => ({
          bebida: e.bebida,
          calificacion: Number(e.calificacion),
          comentario: e.comentario,
          fecha: e.fecha,
        }));

      res.json({
        ok: true,
        total,
        promedioGeneral,
        porBebida,
        ultimasConComentario,
      });
    } catch (error) {
      console.error("Error generando resumen de encuestas:", error);
      res.status(500).json({
        ok: false,
        error: "Error interno del servidor",
      });
    }
  });

  return httpServer;
}
