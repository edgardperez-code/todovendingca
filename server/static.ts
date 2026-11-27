import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { renderPage, type RenderModule } from "./render";
import { precargarDatosBlog, PrecargaFallida } from "./blog-rutas";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // index:false para que express.static nunca responda "/" con el index.html
  // crudo: ese archivo lo procesa el render SSR de más abajo, request a request.
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        // Los archivos bajo /assets/ llevan hash de contenido en el nombre
        // (index-Bn9A_vG-.js): si el contenido cambia, cambia el nombre, asi
        // que se pueden cachear "para siempre" sin riesgo de servir algo viejo.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          // Otros estaticos (og-image.jpg, logo.png, favicons, llms.txt, robots,
          // sitemap) NO llevan hash: cache de 1 dia con revalidacion.
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      },
    }),
  );

  const templatePath = path.resolve(distPath, "index.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  const ssrEntryPath = path.resolve(__dirname, "server", "entry-server.cjs");
  const mod = require(ssrEntryPath) as RenderModule;

  app.use("/{*path}", async (req, res) => {
    try {
      // Express 5 recalcula req.path como "/" dentro de una ruta comodín
      // "/{*path}" (lo trata como un mount). req.originalUrl sí conserva la
      // URL real solicitada por el navegador.
      const url = req.originalUrl.split("?")[0];
      const datos = await precargarDatosBlog(url);
      const { html: page, status } = renderPage(template, mod, url, datos);
      res.status(status).set({ "Content-Type": "text/html" }).end(page);
    } catch (err) {
      if (err instanceof PrecargaFallida) {
        // Base de datos caída un momento: 503 + Retry-After para que los
        // buscadores reintenten sin sacar el artículo del índice. El navegador
        // recibe la plantilla y carga el artículo por la API.
        res
          .status(503)
          .set({ "Content-Type": "text/html", "Retry-After": "120" })
          .end(template.replace("<!--app-html-->", ""));
        return;
      }
      console.error("SSR render error:", err);
      res
        .status(200)
        .set({ "Content-Type": "text/html" })
        .end(template.replace("<!--app-html-->", ""));
    }
  });
}
