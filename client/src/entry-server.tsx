import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";
import { resetSSRSeo, ssrSEO, type SEOData } from "./lib/seo";
import { DatosInicialesProvider, type DatosIniciales } from "./lib/datos-iniciales";

export function render(url: string, datos: DatosIniciales | null = null): { html: string; seo: SEOData | null } {
  resetSSRSeo();
  const html = renderToString(
    <DatosInicialesProvider datos={datos}>
      <Router ssrPath={url}>
        <App />
      </Router>
    </DatosInicialesProvider>,
  );
  // ssrSEO fue poblado de forma sincrónica por el componente de página durante
  // el renderToString de arriba (ver client/src/lib/seo.tsx).
  return { html, seo: ssrSEO };
}
