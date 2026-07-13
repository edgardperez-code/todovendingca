import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import { sendContactNotification } from "./email";
import path from "path";

// Sitemap XML content
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Pagina principal -->
  <url>
    <loc>https://www.todovendingca.com/</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Seccion: Sobre Nosotros -->
  <url>
    <loc>https://www.todovendingca.com/#nosotros</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Seccion: Servicios — Maquinas de Snacks, Bebidas, Cafe, Instalacion, Reposicion, Mantenimiento -->
  <url>
    <loc>https://www.todovendingca.com/#servicios</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Seccion: Beneficios y Propuesta de Valor -->
  <url>
    <loc>https://www.todovendingca.com/#beneficios</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Seccion: Ubicaciones Actuales (Clinica Anzoategui, Centro Colon, Oleus, Colegio Manglar, Clinica Zambrano, Lion Gym) -->
  <url>
    <loc>https://www.todovendingca.com/#ubicaciones</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Seccion: Preguntas Frecuentes (FAQ) -->
  <url>
    <loc>https://www.todovendingca.com/#faq</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- Seccion: Formulario de Contacto -->
  <url>
    <loc>https://www.todovendingca.com/#contacto</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Pagina: Café Oriente -->
  <url>
    <loc>https://www.todovendingca.com/cafeoriente</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

// Robots.txt content
const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

# GPTBot (ChatGPT)
User-agent: GPTBot
Allow: /

# Google-Extended (Gemini/Bard)
User-agent: Google-Extended
Allow: /

# PerplexityBot
User-agent: PerplexityBot
Allow: /

# ClaudeBot (Anthropic)
User-agent: ClaudeBot
Allow: /

# CCBot (Common Crawl - used by many AI models)
User-agent: CCBot
Allow: /

Sitemap: https://www.todovendingca.com/sitemap.xml`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve /cafeoriente static HTML page (must be before Vite catch-all)
  const cafeOrienteHandler = (req: any, res: any) => {
    const isDev = process.env.NODE_ENV !== "production";
    const filePath = isDev
      ? path.resolve(__dirname, "..", "client", "public", "cafeoriente", "index.html")
      : path.resolve(__dirname, "public", "cafeoriente", "index.html");
    res.sendFile(filePath);
  };
  app.get("/cafeoriente", cafeOrienteHandler);
  app.get("/cafeoriente/", cafeOrienteHandler);

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

  return httpServer;
}
