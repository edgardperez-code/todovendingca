import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";
import { resetSSRSeo, ssrSEO, type SEOData } from "./lib/seo";

export function render(url: string): { html: string; seo: SEOData | null } {
  resetSSRSeo();
  const html = renderToString(
    <Router ssrPath={url}>
      <App />
    </Router>,
  );
  // ssrSEO fue poblado de forma sincrónica por el componente de página durante
  // el renderToString de arriba (ver client/src/lib/seo.tsx).
  return { html, seo: ssrSEO };
}
