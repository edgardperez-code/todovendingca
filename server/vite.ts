import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { renderPage, type RenderModule } from "./render";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
    // Se conservan las reglas fs de vite.config.ts (strict + deny): antes este
    // objeto reemplazaba todo `server` y Vite entregaba spidi.env por /@fs/.
    fs: viteConfig.server?.fs,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Un acceso negado por las reglas fs (alguien pidio /@fs/.../spidi.env)
        // es una peticion rechazada, no un fallo del servidor: no debe tumbarlo.
        if (msg.includes("outside of Vite serving allow list")) return;
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);

      // SSR real: renderiza el árbol de React para esta URL en el servidor
      // y lo inyecta en la plantilla, junto con el <head> propio de la ruta.
      const mod = (await vite.ssrLoadModule(
        "/src/entry-server.tsx",
      )) as RenderModule;

      const { html: page, status } = renderPage(template, mod, url.split("?")[0]);
      res.status(status).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
