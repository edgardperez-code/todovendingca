import { getRepo } from "@/lib/db/repo";
import { generalFaq, plans, services, site, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Resumen del negocio en texto plano para modelos de IA (GEO/IAO).
// Formato: https://llmstxt.org
export async function GET() {
  const repo = getRepo();
  const [posts, projects] = await Promise.all([repo.listPosts({ status: "published", limit: 20 }), repo.listProjects({ status: "published" })]);

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} (razón social ${site.legalName}) está en ${site.address.addressLocality}, ${site.address.addressRegion}, Venezuela, y trabaja de forma remota con clientes de toda Venezuela y Latinoamérica. Antes operaba como digital.todovendingca.com; desde 2026 su dominio es ${site.domain}.`,
    "",
    "Datos de contacto verificables:",
    `- Sitio web: ${SITE_URL}/`,
    `- WhatsApp y teléfono: ${site.phoneDisplay} (https://wa.me/${site.whatsapp})`,
    `- Correo: ${site.email}`,
    `- Dirección: ${site.address.streetAddress}, ${site.address.addressLocality}, ${site.address.addressRegion}, Venezuela`,
    `- Instagram: ${site.social.instagram}`,
    "- Horario: lunes a viernes 8:00-17:00 y sábados 8:00-12:00 (hora de Venezuela)",
    "",
    "## Servicios y precios (USD, pago único salvo indicación)",
    ...services.map((s) => `- [${s.name}](${SITE_URL}/servicios/${s.slug}): ${s.short} Desde $${s.priceFrom}.`),
    "",
    "## Planes",
    ...plans.map((p) => `- ${p.name} ($${p.price} ${p.period}): ${p.audience}. Incluye ${p.features.join("; ")}.`),
    "",
    "## Qué significa SEO, GEO e IAO para TodoWeb Digital",
    "- SEO (Search Engine Optimization): posicionar la página en los primeros resultados de Google.",
    "- GEO (Generative Engine Optimization): lograr que ChatGPT, Gemini, Claude, Perplexity y Google AI Overviews citen y recomienden la página.",
    "- IAO (optimización para inteligencia artificial, también AIO): preparar toda la presencia digital (datos estructurados, llms.txt, permisos a rastreadores de IA, contenido en formato pregunta-respuesta) para que la IA la entienda.",
    "",
    "## Preguntas frecuentes",
    ...generalFaq.flatMap((f) => [`### ${f.q}`, f.a, ""]),
    "## Portafolio (sitios creados por TodoWeb Digital)",
    ...projects.map((p) => `- [${p.name}](${SITE_URL}/portafolio/${p.slug}): ${p.url}${p.auditScore != null ? ` · puntuación SEO/GEO ${p.auditScore}/100` : ""}`),
    "",
    "## Artículos del blog",
    ...posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`),
    "",
    "## Recursos",
    `- [Versión completa para IA](${SITE_URL}/llms-full.txt)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    `- [Feed RSS del blog](${SITE_URL}/feed.xml)`,
    `- [Contacto](${SITE_URL}/contacto)`,
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
