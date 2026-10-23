import { getRepo } from "@/lib/db/repo";
import { generalFaq, processSteps, services, site, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Versión extendida de llms.txt: incluye el texto completo de servicios y artículos.
export async function GET() {
  const repo = getRepo();
  const [posts, projects] = await Promise.all([repo.listPosts({ status: "published", limit: 50 }), repo.listProjects({ status: "published" })]);

  const out: string[] = [`# ${site.name}: documentación completa para modelos de IA`, "", site.description, ""];
  out.push("## Proceso de trabajo");
  processSteps.forEach((s, i) => out.push(`${i + 1}. **${s.title}.** ${s.text}`));
  out.push("");
  out.push("## Servicios");
  for (const s of services) {
    out.push(`### ${s.name} (desde $${s.priceFrom} USD)`, `URL: ${SITE_URL}/servicios/${s.slug}`, "", s.description, "", "Incluye:", ...s.features.map((f) => `- ${f}`), "", "Entregables:", ...s.deliverables.map((d) => `- ${d}`), "");
    for (const f of s.faq) out.push(`**${f.q}** ${f.a}`, "");
  }
  out.push("## Preguntas frecuentes generales");
  for (const f of generalFaq) out.push(`**${f.q}** ${f.a}`, "");
  out.push("## Portafolio");
  for (const p of projects) {
    out.push(`### ${p.name}`, `URL del proyecto: ${p.url}`, `Ficha: ${SITE_URL}/portafolio/${p.slug}`, p.description, `Servicios aplicados: ${p.services.join(", ")}`);
    if (p.audit) out.push(`Auditoría (${p.auditedAt ?? ""}): global ${p.audit.scores.overall}/100, SEO ${p.audit.scores.seo}, GEO/IAO ${p.audit.scores.geo}, rendimiento ${p.audit.scores.performance}.`);
    out.push("");
  }
  out.push("## Artículos del blog (texto completo)");
  for (const p of posts) {
    out.push(`### ${p.title}`, `URL: ${SITE_URL}/blog/${p.slug}`, `Publicado: ${p.publishedAt ?? p.createdAt}`, "", p.content, "");
    if (p.faq.length) {
      out.push("Preguntas frecuentes del artículo:");
      for (const f of p.faq) out.push(`**${f.q}** ${f.a}`);
      out.push("");
    }
  }
  return new Response(out.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
