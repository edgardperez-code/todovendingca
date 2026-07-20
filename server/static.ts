import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { renderPage, type RenderModule } from "./render";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // index:false para que express.static nunca responda "/" con el index.html
  // crudo: ese archivo lo procesa el render SSR de más abajo, request a request.
  app.use(express.static(distPath, { index: false }));

  const templatePath = path.resolve(distPath, "index.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  const ssrEntryPath = path.resolve(__dirname, "server", "entry-server.cjs");
  const mod = require(ssrEntryPath) as RenderModule;

  app.use("/{*path}", (req, res) => {
    try {
      // Express 5 recalcula req.path como "/" dentro de una ruta comodín
      // "/{*path}" (lo trata como un mount). req.originalUrl sí conserva la
      // URL real solicitada por el navegador.
      const url = req.originalUrl.split("?")[0];
      const { html: page, status } = renderPage(template, mod, url);
      res.status(status).set({ "Content-Type": "text/html" }).end(page);
    } catch (err) {
      console.error("SSR render error:", err);
      res
        .status(200)
        .set({ "Content-Type": "text/html" })
        .end(template.replace("<!--app-html-->", ""));
    }
  });
}
