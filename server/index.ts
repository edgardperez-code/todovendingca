import "./cargar-entorno";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { iniciarConciliacion } from "./tienda";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Detras del proxy de Railway (un salto): asi req.ip es la IP real del cliente
// y no la del proxy.
app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Canonical único: todovendingca.com (sin www) -> www.todovendingca.com, 301.
// Evita que buscadores indexen dos dominios distintos para el mismo sitio.
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host === "todovendingca.com") {
    return res.redirect(301, `https://www.todovendingca.com${req.originalUrl}`);
  }
  next();
});

// El registro de representantes para PagoQR (Colegio Manglar) vive en el sistema
// interno, pero los padres lo abren desde www.todovendingca.com/registro. En vez
// de duplicar el formulario en este repo, se sirve por proxy: lo que se ve aquí
// es siempre lo que está desplegado allá, y se actualiza solo.
//
// Va ANTES de express.json a propósito: así el cuerpo del POST llega crudo y se
// reenvía tal cual, sin volver a serializarlo.
const SISTEMA_URL = process.env.SISTEMA_URL || "https://sistema.todovendingca.com";
const RUTAS_REGISTRO = new Set(["/registro", "/api/registro-epay"]);

function leerCuerpo(req: Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const trozos: Buffer[] = [];
    req.on("data", (t) => trozos.push(t as Buffer));
    req.on("end", () => resolve(Buffer.concat(trozos)));
    req.on("error", reject);
  });
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!RUTAS_REGISTRO.has(req.path)) return next();

  try {
    const esGet = req.method === "GET" || req.method === "HEAD";
    const respuesta = await fetch(`${SISTEMA_URL}${req.originalUrl}`, {
      method: req.method,
      headers: {
        "content-type": (req.headers["content-type"] as string) || "application/json",
        // El sistema limita registros por IP. Sin esto vería siempre la de este
        // servidor y bloquearía al sexto padre que se registre.
        "x-forwarded-for":
          (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "",
      },
      body: esGet ? undefined : await leerCuerpo(req),
      redirect: "manual",
    });

    const tipo = respuesta.headers.get("content-type");
    if (tipo) res.type(tipo);
    res.status(respuesta.status).send(Buffer.from(await respuesta.arrayBuffer()));
  } catch (error) {
    log(`proxy de /registro falló: ${(error as Error).message}`);
    res
      .status(502)
      .send("El registro no está disponible en este momento. Intenta de nuevo en unos minutos.");
  }
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const RUTAS_SIN_CUERPO_EN_LOG = ["/api/checkout", "/api/pedidos", "/api/webhooks", "/api/admin"];

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Solo se registra req.path, que NO incluye la query: la clave del pedido
      // (?k=) y la busqueda del admin (?buscar=, que puede ser un email) nunca
      // llegan al log. El codigo de Gift Card, en cambio, viaja en la ruta de
      // los endpoints admin: se enmascara para que nunca quede escrito.
      const rutaLog = path.replace(/^(\/api\/admin\/gift-cards\/)[^/]+/, "$1***");
      let logLine = `${req.method} ${rutaLog} ${res.statusCode} in ${duration}ms`;
      // En estas rutas viajan emails y codigos de Gift Card: solo se registra
      // metodo, ruta, status y duracion, nunca el cuerpo.
      const rutaSensible = RUTAS_SIN_CUERPO_EN_LOG.some((prefijo) => path.startsWith(prefijo));
      if (capturedJsonResponse && !rutaSensible) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      // reusePort no esta soportado en Windows (ENOTSUP); solo se habilita en
      // plataformas tipo Unix (Railway/Linux), donde ayuda al balanceo.
      reusePort: process.platform !== "win32",
    },
    () => {
      log(`serving on port ${port}`);
      // Con el servidor ya escuchando: reconsulta en SPIDI los pedidos que
      // pudieron quedarse sin aviso y reintenta los correos que no salieron.
      iniciarConciliacion();
    },
  );
})();
