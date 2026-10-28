import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertEncuestaVasosSchema, type GiftCard } from "@shared/schema";
import { checkoutRequestSchema, ESTADO_GIFT_CARD_PRUEBA, type ErrorResponse } from "@shared/tienda";
import { MAX_UNIDADES_POR_PEDIDO } from "@shared/catalogo";
import { z } from "zod";
import { sendContactNotification, sendEncuestaNotification } from "./email";
import {
  anularCodigoAdmin,
  buscarPedidosAdmin,
  cargarInventario,
  compararSecreto,
  completarCodigosAdmin,
  configTienda,
  consultarPedidoPublico,
  crearCheckout,
  ErrorTienda,
  expirarPedidoAdmin,
  limitarConsultaPedido,
  listarCodigosAdmin,
  listarVentasAdmin,
  procesarWebhook,
  reenviarCorreoComprador,
  resumenAdmin,
  stockTienda,
  type ParametrosLista,
} from "./tienda";
import path from "path";

// === Ayudantes de la tienda ===

// Traduce un ErrorTienda a {ok:false, error, codigo} con su status HTTP;
// cualquier otro error es un fallo nuestro: 500 con mensaje generico. Solo se
// registra el mensaje (el objeto completo podria traer datos del pedido).
function responderErrorTienda(res: Response, error: unknown, contexto: string) {
  if (error instanceof ErrorTienda) {
    const cuerpo: ErrorResponse = { ok: false, error: error.message };
    if (error.codigo) cuerpo.codigo = error.codigo;
    return res.status(error.status).json(cuerpo);
  }
  console.error(`Error en ${contexto}:`, error instanceof Error ? error.message : error);
  const cuerpo: ErrorResponse = { ok: false, error: "Error interno del servidor" };
  return res.status(500).json(cuerpo);
}

// Mensaje claro en espanol para el primer problema del formulario de checkout
// (los mensajes por defecto de zod estan en ingles).
function mensajeValidacionCheckout(error: z.ZodError): string {
  const problema = error.issues[0];
  if (!problema) return "Datos inválidos. Revisa el formulario e intenta de nuevo.";
  const [raiz, campo] = problema.path;
  if (raiz === "comprador") {
    if (campo === "nombre") return "Escribe tu nombre (entre 2 y 100 caracteres).";
    if (campo === "email") return "Escribe un correo electrónico válido.";
    if (campo === "telefono") {
      return "El teléfono solo puede tener números, espacios y los signos + ( ) -.";
    }
    return "Revisa tus datos e intenta de nuevo.";
  }
  if (raiz === "items") {
    if (problema.path.length === 1 && problema.code === "too_small") return "Tu carrito está vacío.";
    if (problema.code === "too_big") {
      return `Puedes comprar como máximo ${MAX_UNIDADES_POR_PEDIDO} unidades por pedido.`;
    }
    return "Tu carrito no es válido. Actualiza la página e intenta de nuevo.";
  }
  return "Datos inválidos. Revisa el formulario e intenta de nuevo.";
}

// Intentos fallidos de clave de admin por IP. Con 10 fallos en 10 minutos la
// IP queda bloqueada (429) hasta que el mas viejo de esos fallos cumpla los 10
// minutos, AUNQUE luego mande la clave correcta: asi probar claves en bucle no
// sirve. En memoria: se reinicia con el proceso, suficiente para este fin.
const VENTANA_FALLOS_ADMIN_MS = 10 * 60_000;
const MAX_FALLOS_ADMIN = 10;
const fallosAdmin = new Map<string, number[]>();

function fallosRecientesAdmin(ip: string, ahora: number): number[] {
  const recientes = (fallosAdmin.get(ip) ?? []).filter((t) => ahora - t < VENTANA_FALLOS_ADMIN_MS);
  if (recientes.length > 0) fallosAdmin.set(ip, recientes);
  else fallosAdmin.delete(ip);
  return recientes;
}

function anotarFalloAdmin(ip: string, ahora: number): void {
  fallosAdmin.set(ip, fallosRecientesAdmin(ip, ahora).concat(ahora));
  // Que el mapa no crezca sin fin con IPs que ya no vuelven.
  if (fallosAdmin.size > 1000) {
    fallosAdmin.forEach((tiempos, clave) => {
      if (tiempos.every((t) => ahora - t >= VENTANA_FALLOS_ADMIN_MS)) fallosAdmin.delete(clave);
    });
  }
}

function ipDe(req: Request): string {
  return req.ip || req.socket.remoteAddress || "desconocida";
}

// Mismo criterio que /api/encuesta-vasos/resumen: sin ADMIN_KEY en el entorno
// el acceso queda CERRADO (503), nunca abierto. La comparacion es en tiempo
// constante para no filtrar la clave por lo que tarda la respuesta. Todas las
// rutas /api/admin pasan por aqui (tambien el limite de intentos fallidos).
function verificarAdmin(req: Request, res: Response): boolean {
  res.setHeader("Cache-Control", "no-store");
  const claveEsperada = process.env.ADMIN_KEY;
  if (!claveEsperada) {
    console.error("ADMIN_KEY no configurada: se rechaza el acceso a la administracion de la tienda");
    res.status(503).json({ ok: false, error: "Servicio no configurado" });
    return false;
  }
  const ip = ipDe(req);
  const ahora = Date.now();
  if (fallosRecientesAdmin(ip, ahora).length >= MAX_FALLOS_ADMIN) {
    const cuerpo: ErrorResponse = {
      ok: false,
      error: "Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.",
      codigo: "LIMITE",
    };
    res.status(429).json(cuerpo);
    return false;
  }
  const claveRecibida = req.headers["x-admin-key"];
  if (typeof claveRecibida !== "string" || !compararSecreto(claveEsperada, claveRecibida)) {
    anotarFalloAdmin(ip, ahora);
    // Sin la IP ni la clave recibida en el log: solo que hubo un intento fallido.
    console.warn("[tienda] Intento de acceso a la administracion con una clave incorrecta");
    res.status(401).json({ ok: false, error: "No autorizado" });
    return false;
  }
  return true;
}

// Un parametro de la query como texto (el primero si viene repetido).
function textoQuery(valor: unknown): string | undefined {
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor) && typeof valor[0] === "string") return valor[0];
  return undefined;
}

function parametrosLista(req: Request): ParametrosLista {
  return {
    estado: textoQuery(req.query.estado),
    buscar: textoQuery(req.query.buscar),
    productoId: textoQuery(req.query.productoId),
    limite: textoQuery(req.query.limite),
    despues: textoQuery(req.query.despues),
  };
}

// `estado` tal cual (activa | canjeada | anulada | prueba) y `canjeable` para
// no tener que interpretarlo: solo una "activa" se puede canjear.
function giftCardParaAdmin(giftCard: GiftCard) {
  return {
    codigo: giftCard.codigo,
    estado: giftCard.estado,
    canjeable: giftCard.estado === "activa",
    montoUsd: giftCard.montoUsdCentavos / 100,
    creadoEn: giftCard.creadoEn,
    canjeadoEn: giftCard.canjeadoEn,
  };
}

// Los codigos del inventario se guardan tal cual los cargo el dueno (pueden
// tener minusculas) y los de prueba en mayusculas. Primero se busca el codigo
// exacto (sin espacios alrededor) y, si no existe, en mayusculas, para aceptar
// un codigo de prueba escrito en minusculas.
function variantesCodigo(codigo: string): string[] {
  const exacto = codigo.trim();
  const mayusculas = exacto.toUpperCase();
  return mayusculas === exacto ? [exacto] : [exacto, mayusculas];
}

async function buscarGiftCard(codigo: string): Promise<GiftCard | undefined> {
  for (const variante of variantesCodigo(codigo)) {
    const giftCard = await storage.obtenerGiftCardPorCodigo(variante);
    if (giftCard) return giftCard;
  }
  return undefined;
}

// Por que no se pudo canjear una Gift Card que existe (va tal cual al admin).
function motivoNoCanjeable(giftCard: GiftCard): string {
  if (giftCard.estado === "canjeada") return "Esta Gift Card ya fue canjeada.";
  if (giftCard.estado === ESTADO_GIFT_CARD_PRUEBA) {
    return "Esta Gift Card es de prueba: se emitió con un pago no real (un entorno de prueba de SPIDI) y no se puede canjear.";
  }
  return "Esta Gift Card no está activa.";
}

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
  <!-- Pagina: Cafe Oriente (marca de cafe, SSR) -->
  <url>
    <loc>https://www.todovendingca.com/cafe-oriente</loc>
    <lastmod>2026-07-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Pagina: Maquinas Expendedoras en Lecheria -->
  <url>
    <loc>https://www.todovendingca.com/maquinas-expendedoras-lecheria</loc>
    <lastmod>2026-07-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Pagina: Vending para Empresas -->
  <url>
    <loc>https://www.todovendingca.com/vending-para-empresas</loc>
    <lastmod>2026-07-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Pagina: Vending para Gimnasios -->
  <url>
    <loc>https://www.todovendingca.com/vending-gimnasios</loc>
    <lastmod>2026-07-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Pagina: Gift Card Todo Vending (tienda) -->
  <url>
    <loc>https://www.todovendingca.com/gift-card</loc>
    <lastmod>2026-10-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- /vasos NO se lista: es una encuesta interna (noindex), no una pagina comercial. -->
  <!-- /carrito y /pago/resultado NO se listan: son pasos de compra privados (noindex). -->
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
  // Serve /cafe-oriente static HTML page (diseno original, mismo archivo,
  // solo con URLs internas actualizadas a /cafe-oriente). Debe registrarse
  // antes del catch-all SSR para que gane la ruta.
  const cafeOrienteHandler = (req: any, res: any) => {
    const isDev = process.env.NODE_ENV !== "production";
    const filePath = isDev
      ? path.resolve(process.cwd(), "client", "public", "cafe-oriente", "index.html")
      : path.resolve(__dirname, "public", "cafe-oriente", "index.html");
    res.sendFile(filePath);
  };
  app.get("/cafe-oriente", cafeOrienteHandler);
  app.get("/cafe-oriente/", cafeOrienteHandler);

  // /cafeoriente (URL antigua, sin guion) -> 301 a /cafe-oriente. Consolida
  // el canonical en una sola URL y evita contenido duplicado.
  app.get(["/cafeoriente", "/cafeoriente/"], (_req, res) => {
    res.redirect(301, "/cafe-oriente");
  });

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
    let validatedData;
    try {
      validatedData = insertEncuestaVasosSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          ok: false,
          error: "Datos invalidos",
          details: error.errors,
        });
      }
      throw error;
    }

    // Se intenta guardar, pero un fallo de la base de datos NO debe hacer que
    // se pierda la respuesta: el correo de aviso se envia igual y queda como
    // copia. Al visitante nunca se le devuelve un error si su respuesta pudo
    // conservarse por alguna via.
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
    // Si ADMIN_KEY no esta configurada, la comparacion "undefined !== undefined"
    // daba falso y dejaba el endpoint ABIERTO a cualquiera sin cabecera. Hay que
    // exigir que la clave exista en el entorno antes de comparar nada.
    const claveEsperada = process.env.ADMIN_KEY;
    if (!claveEsperada) {
      console.error("ADMIN_KEY no configurada: se rechaza el acceso al resumen");
      return res.status(503).json({ ok: false, error: "Servicio no configurado" });
    }
    const claveRecibida = req.headers["x-admin-key"];
    if (typeof claveRecibida !== "string" || claveRecibida !== claveEsperada) {
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

  // === TIENDA: Gift Cards pagadas con SPIDI (compra sin registro) ===
  // La logica vive en server/tienda.ts; aqui solo se traduce HTTP.

  // Para el aviso de modo de prueba en /gift-card, /carrito y /pago/resultado:
  // { modoPrueba, entorno } y nada mas (sin credenciales ni URLs). no-store para
  // que el aviso desaparezca en cuanto la tienda pase a produccion.
  app.get("/api/tienda/config", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(configTienda());
  });

  // Codigos disponibles por producto (acotados a 99) para mostrar "Sin stock".
  // no-store: el stock cambia con cada venta y con cada carga del admin.
  app.get("/api/tienda/stock", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      res.json(await stockTienda());
    } catch (error) {
      responderErrorTienda(res, error, "GET /api/tienda/stock");
    }
  });

  app.post("/api/checkout", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const validacion = checkoutRequestSchema.safeParse(req.body);
    if (!validacion.success) {
      const cuerpo: ErrorResponse = { ok: false, error: mensajeValidacionCheckout(validacion.error) };
      return res.status(400).json(cuerpo);
    }

    // Opcional: la manda el navegador para que un doble envio del mismo
    // checkout no cree dos pedidos.
    const cabeceraIdempotencia = req.headers["idempotency-key"];
    let claveIdempotencia: string | null = null;
    if (cabeceraIdempotencia !== undefined) {
      const valor = typeof cabeceraIdempotencia === "string" ? cabeceraIdempotencia.trim() : "";
      if (!valor || valor.length > 100) {
        const cuerpo: ErrorResponse = { ok: false, error: "Cabecera idempotency-key inválida" };
        return res.status(400).json(cuerpo);
      }
      claveIdempotencia = valor;
    }

    try {
      // req.ip es la IP real del cliente porque server/index.ts confia en el
      // proxy de Railway (trust proxy). El limite por IP lo aplica crearCheckout
      // solo cuando va a crear un pedido nuevo: los reintentos con una
      // idempotency-key que ya tiene pedido no lo gastan.
      const ip = req.ip || req.socket.remoteAddress || "desconocida";
      const respuesta = await crearCheckout(validacion.data, claveIdempotencia, ip);
      res.status(201).json(respuesta);
    } catch (error) {
      responderErrorTienda(res, error, "POST /api/checkout");
    }
  });

  // Vista publica de un pedido para /pago/resultado. Sin la clave correcta
  // responde 404. Aqui es donde el servidor confirma el pago con SPIDI: la sola
  // vuelta del cliente desde la pagina de pago no prueba nada.
  app.get("/api/pedidos/:id", async (req, res) => {
    // Puede llevar codigos de Gift Card: que ningun cache lo guarde.
    res.setHeader("Cache-Control", "no-store");
    const clave = typeof req.query.k === "string" ? req.query.k : "";
    try {
      // Por IP, antes de tocar nada: cada consulta puede terminar en una
      // llamada a SPIDI, que tiene un limite por minuto para todo el comercio.
      limitarConsultaPedido(req.ip || req.socket.remoteAddress || "desconocida");
      const pedido = await consultarPedidoPublico(req.params.id, clave);
      res.status(200).json(pedido);
    } catch (error) {
      responderErrorTienda(res, error, "GET /api/pedidos/:id");
    }
  });

  // Avisos de SPIDI (firmados). La firma se verifica sobre el cuerpo CRUDO que
  // express.json guarda en req.rawBody (server/index.ts). Si el aviso llegara
  // con otro Content-Type, express.json no lo toca y express.raw lo recoge
  // aqui como Buffer; si express.json ya leyo el cuerpo, express.raw no hace nada.
  app.post(
    "/api/webhooks/spidi",
    express.raw({ type: () => true, limit: "1mb" }),
    async (req, res) => {
      const crudo = Buffer.isBuffer(req.rawBody)
        ? req.rawBody
        : Buffer.isBuffer(req.body)
          ? req.body
          : undefined;
      try {
        const { duplicado } = await procesarWebhook(crudo, req.headers);
        res.status(200).json({ ok: true, duplicado });
      } catch (error) {
        responderErrorTienda(res, error, "POST /api/webhooks/spidi");
      }
    },
  );

  // Consulta de una Gift Card (para validarla antes de canjearla).
  app.get("/api/admin/gift-cards/:codigo", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!verificarAdmin(req, res)) return;
    try {
      const giftCard = await buscarGiftCard(req.params.codigo);
      if (!giftCard) {
        return res.status(404).json({ ok: false, error: "Gift Card no encontrada" });
      }
      res.json({ ok: true, giftCard: giftCardParaAdmin(giftCard) });
    } catch (error) {
      responderErrorTienda(res, error, "GET /api/admin/gift-cards/:codigo");
    }
  });

  // Canje: activa -> canjeada, una sola vez. Un segundo intento responde 409
  // con el estado actual (por ejemplo, la fecha en que ya se canjeo). Una Gift
  // Card de prueba (de un pedido TVP-, creado en modo prueba) tambien responde 409:
  // storage solo canjea las "activa", asi que nunca cambia de estado.
  app.post("/api/admin/gift-cards/:codigo/canjear", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!verificarAdmin(req, res)) return;
    try {
      // Se canjea con el codigo tal como esta guardado.
      const encontrada = await buscarGiftCard(req.params.codigo);
      const { giftCard, recienCanjeada } = encontrada
        ? await storage.canjearGiftCard(encontrada.codigo)
        : { giftCard: undefined, recienCanjeada: false };
      if (!giftCard) {
        return res.status(404).json({ ok: false, error: "Gift Card no encontrada" });
      }
      if (!recienCanjeada) {
        return res.status(409).json({
          ok: false,
          error: motivoNoCanjeable(giftCard),
          giftCard: giftCardParaAdmin(giftCard),
        });
      }
      res.json({ ok: true, giftCard: giftCardParaAdmin(giftCard) });
    } catch (error) {
      responderErrorTienda(res, error, "POST /api/admin/gift-cards/:codigo/canjear");
    }
  });

  // Soporte: busca pedidos por numero exacto o email exacto (hasta 20), con el
  // estado de sus correos y sus Gift Cards (codigo y estado). El valor de
  // ?buscar= puede ser un email: server/index.ts solo registra la ruta sin la
  // query, asi que nunca queda en los logs.
  app.get("/api/admin/pedidos", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!verificarAdmin(req, res)) return;
    try {
      const buscar = typeof req.query.buscar === "string" ? req.query.buscar : "";
      const pedidos = await buscarPedidosAdmin(buscar);
      res.json({ ok: true, pedidos });
    } catch (error) {
      responderErrorTienda(res, error, "GET /api/admin/pedidos");
    }
  });

  // === Panel /admin ===
  // Las respuestas llevan codigos y emails: verificarAdmin pone no-store y
  // server/index.ts nunca registra el cuerpo ni la query de /api/admin.

  // Login del panel: solo confirma que la clave es valida.
  app.get("/api/admin/sesion", (req, res) => {
    if (!verificarAdmin(req, res)) return;
    res.json({ ok: true });
  });

  // Ventas (pedidos) del mas nuevo al mas viejo, con filtros y paginacion.
  app.get("/api/admin/ventas", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json(await listarVentasAdmin(parametrosLista(req)));
    } catch (error) {
      responderErrorTienda(res, error, "GET /api/admin/ventas");
    }
  });

  // Ventas de hoy y del mes, pendientes, pagados sin codigos e inventario.
  app.get("/api/admin/resumen", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json(await resumenAdmin());
    } catch (error) {
      responderErrorTienda(res, error, "GET /api/admin/resumen");
    }
  });

  // Codigos del inventario, con filtros por producto y estado.
  app.get("/api/admin/inventario/codigos", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json(await listarCodigosAdmin(parametrosLista(req)));
    } catch (error) {
      responderErrorTienda(res, error, "GET /api/admin/inventario/codigos");
    }
  });

  // Carga de codigos: { productoId, codigos: string[] }.
  app.post("/api/admin/inventario", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json(await cargarInventario(req.body));
    } catch (error) {
      responderErrorTienda(res, error, "POST /api/admin/inventario");
    }
  });

  // disponible -> anulado.
  app.post("/api/admin/inventario/:id/anular", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json(await anularCodigoAdmin(req.params.id));
    } catch (error) {
      responderErrorTienda(res, error, "POST /api/admin/inventario/:id/anular");
    }
  });

  // Reenvia al comprador el correo con sus codigos (solo si el pedido esta pagado).
  app.post("/api/admin/pedidos/:id/reenviar-correo", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!verificarAdmin(req, res)) return;
    try {
      const { enviado, numero, email } = await reenviarCorreoComprador(req.params.id);
      if (!enviado) {
        return res.status(502).json({
          ok: false,
          error:
            "No se pudo enviar el correo al comprador. Revisa RESEND_API_KEY y EMAIL_FROM (el dominio de prueba de Resend solo entrega al dueño de la cuenta).",
        });
      }
      res.json({ ok: true, numero, enviadoA: email });
    } catch (error) {
      responderErrorTienda(res, error, "POST /api/admin/pedidos/:id/reenviar-correo");
    }
  });

  // Pedido real pagado sin todos sus codigos (PAGO SIN STOCK): entrega los que
  // falten del inventario y reenvia el correo al comprador.
  app.post("/api/admin/pedidos/:id/completar-codigos", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json(await completarCodigosAdmin(req.params.id));
    } catch (error) {
      responderErrorTienda(res, error, "POST /api/admin/pedidos/:id/completar-codigos");
    }
  });

  // Pedido pendiente: expira su enlace en SPIDI y libera sus codigos (o aplica
  // el pago si SPIDI dice que ya estaba pagado).
  app.post("/api/admin/pedidos/:id/expirar", async (req, res) => {
    if (!verificarAdmin(req, res)) return;
    try {
      res.json(await expirarPedidoAdmin(req.params.id));
    } catch (error) {
      responderErrorTienda(res, error, "POST /api/admin/pedidos/:id/expirar");
    }
  });

  return httpServer;
}
