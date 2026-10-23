// Uso: npm run audit:url -- https://www.ejemplo.com
// Ejecuta la misma auditoría del panel desde la terminal e imprime el resultado.
import { auditUrl } from "../src/lib/audit";

const url = process.argv[2];
if (!url) {
  console.error("Indica una URL: npm run audit:url -- https://www.ejemplo.com");
  process.exit(1);
}
auditUrl(url)
  .then((r) => {
    if (r.error) {
      console.error("Error:", r.error);
      process.exit(2);
    }
    console.log(`\n${r.finalUrl}`);
    console.log(`Global ${r.scores.overall} · SEO ${r.scores.seo} · GEO/IAO ${r.scores.geo} · Rendimiento ${r.scores.performance}\n`);
    for (const c of r.checks) {
      const icon = c.status === "pass" ? "✓" : c.status === "warn" ? "!" : c.status === "fail" ? "✗" : "·";
      console.log(`${icon} [${c.category}] ${c.label}: ${c.detail}`);
    }
  })
  .catch((e) => {
    console.error(e);
    process.exit(2);
  });
