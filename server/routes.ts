import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertEncuestaVasosSchema } from "@shared/schema";
import { z } from "zod";
import { sendContactNotification, sendEncuestaNotification } from "./email";
import { buildSitemap, buildRobots, buildLlmsTxt } from "./seo-files";
import path from "path";

// El formulario puede decir desde qué página llegó la persona (?origen=...).
// Se envía en el correo; no se guarda en la base de datos (no hay columna).
const contactPayloadSchema = insertContactMessageSchema.extend({
  origen: z.string().max(40).optional(),
});

function requireAdminKey(req: Request, res: Response): boolean {
  const claveEsperada = process.env.ADMIN_KEY;
  if (!claveEsperada) {
    console.error("ADMIN_KEY no configurada: se rechaza el acceso");
    res.status(503).json({ ok: false, error: "Servicio no configurado" });
    return false;
  }
  const claveRecibida = req.headers["x-admin-key"];
  if (typeof claveRecibida !== "string" || claveRecibida !== claveEsperada) {
    res.status(401).json({ ok: false, error: "No autorizado" });
    return false;
  }
  return true;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const isDev = process.env.NODE_ENV !== "production";
  const staticFile = (...segments: string[]) =>
    isDev
      ? path.resolve(process.cwd(), "client", "public", ...segments)
      : path.resolve(__dirname, "public", ...segments);

  // /cafe-oriente: página estática con diseño propio, fuera de React. Debe
  // registrarse antes del catch-all SSR para que gane la ruta.
  // Una sola URL canónica (sin barra final): la variante con barra redirige.
  // Express 5 trata /ruta y /ruta/ como la misma ruta, por eso se mira la URL.
  const sinBarraFinal = (req: Request, res: Response, canonica: string) => {
    if (req.originalUrl.split("?")[0].endsWith("/")) {
      res.redirect(301, canonica);
      return true;
    }
    return false;
  };
  app.get("/cafe-oriente", (req, res) => {
    if (sinBarraFinal(req, res, "/cafe-oriente")) return;
    res.sendFile(staticFile("cafe-oriente", "index.html"));
  });
  // URL antigua sin guion.
  app.get(["/cafeoriente", "/cafeoriente/"], (_req, res) => res.redirect(301, "/cafe-oriente"));

  // /vasos: encuesta interna (noindex).
  app.get("/vasos", (req, res) => {
    if (sinBarraFinal(req, res, "/vasos")) return;
    res.sendFile(staticFile("vasos", "index.html"));
  });

  // Archivos SEO generados desde shared/site.ts (una sola fuente de verdad).
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buildSitemap());
  });
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buildRobots());
  });
  app.get("/llms.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buildLlmsTxt());
  });

  // Formulario de contacto
  app.post("/api/contact", async (req, res) => {
    try {
      const { origen, ...validatedData } = contactPayloadSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);

      const emailSent = await sendContactNotification({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
        company: validatedData.company || undefined,
        message: validatedData.message,
        origen,
      });
      if (!emailSent) {
        console.warn("Email notification failed but message was saved");
      }

      res.status(201).json({ success: true, message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Datos inválidos", details: error.errors });
      } else {
        console.error("Error creating contact message:", error);
        res.status(500).json({ success: false, error: "Error interno del servidor" });
      }
    }
  });

  // Lista de mensajes recibidos: uso interno, protegida con ADMIN_KEY.
  // Antes estaba abierta y exponía nombres, correos y teléfonos de clientes.
  app.get("/api/contact", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  });

  // === ENCUESTA DE VASOS (Café Oriente) ===

  app.post("/api/encuesta-vasos", async (req, res) => {
    let validatedData;
    try {
      validatedData = insertEncuestaVasosSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ ok: false, error: "Datos inválidos", details: error.errors });
      }
      throw error;
    }

    // Se intenta guardar, pero un fallo de la base de datos NO debe hacer que
    // se pierda la respuesta: el correo de aviso se envía igual y queda como
    // copia.
    let encuesta = null;
    let guardadaEnBd = false;
    try {
      encuesta = await storage.createEncuestaVasos(validatedData);
      guardadaEnBd = true;
    } catch (error) {
      console.error("Error guardando encuesta en el almacenamiento:", error);
    }

    const correoEnviado = await sendEncuestaNotification({
      bebida: validatedData.bebida,
      calificacion: validatedData.calificacion,
      comentario: validatedData.comentario,
      guardadaEnBd,
    });

    if (!guardadaEnBd && !correoEnviado) {
      console.error("Encuesta PERDIDA: fallaron el almacenamiento y el correo");
      return res.status(500).json({ ok: false, error: "Error interno del servidor" });
    }

    res.status(201).json({ ok: true, encuesta });
  });

  app.get("/api/encuesta-vasos/resumen", async (req, res) => {
    if (!requireAdminKey(req, res)) return;

    try {
      const encuestas = await storage.getEncuestasVasos();
      const total = encuestas.length;

      const promedioGeneral =
        total > 0 ? Number((encuestas.reduce((s, e) => s + Number(e.calificacion), 0) / total).toFixed(2)) : 0;

      const porBebida: Record<string, { cantidad: number; promedio: number }> = {};
      for (const e of encuestas) {
        if (!porBebida[e.bebida]) porBebida[e.bebida] = { cantidad: 0, promedio: 0 };
        porBebida[e.bebida].cantidad += 1;
        porBebida[e.bebida].promedio += Number(e.calificacion);
      }
      for (const key of Object.keys(porBebida)) {
        porBebida[key].promedio = Number((porBebida[key].promedio / porBebida[key].cantidad).toFixed(2));
      }

      const ultimasConComentario = encuestas
        .filter((e) => e.comentario && e.comentario.trim().length > 0)
        .slice(0, 20)
        .map((e) => ({ bebida: e.bebida, calificacion: Number(e.calificacion), comentario: e.comentario, fecha: e.fecha }));

      res.json({ ok: true, total, promedioGeneral, porBebida, ultimasConComentario });
    } catch (error) {
      console.error("Error generando resumen de encuestas:", error);
      res.status(500).json({ ok: false, error: "Error interno del servidor" });
    }
  });

  return httpServer;
}
