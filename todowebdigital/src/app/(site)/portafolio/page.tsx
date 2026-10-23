import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/site/project-card";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/json-ld";
import { getRepo } from "@/lib/db/repo";
import { scheduleStaleAudits } from "@/lib/audit-runner";
import { buildMetadata, portfolioJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Portafolio y puntuación SEO de cada web",
  description: "Sitios web diseñados por TodoWeb Digital, cada uno con su auditoría de optimización SEO, GEO/IAO y rendimiento en una escala de 0 a 100.",
  path: "/portafolio",
});

export default async function PortafolioPage() {
  const projects = await getRepo().listProjects({ status: "published" });
  scheduleStaleAudits(projects);
  const audited = projects.filter((p) => p.auditScore != null);
  const avg = audited.length ? Math.round(audited.reduce((s, p) => s + (p.auditScore ?? 0), 0) / audited.length) : null;

  return (
    <>
      <JsonLd data={portfolioJsonLd(projects)} />
      <section className="container-x pt-10">
        <Breadcrumbs items={[{ name: "Portafolio", path: "/portafolio" }]} />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <SectionHeading as="h1" eyebrow="Portafolio" title="Páginas web que hemos creado, medidas con nuestra auditoría" text="No mostramos solo capturas bonitas: cada proyecto pasa por nuestra herramienta de auditoría, que revisa 35 puntos de SEO, GEO/IAO y rendimiento y los resume en una puntuación de 0 a 100. Lo que ves es lo que medimos." />
          <dl className="card grid grid-cols-3 gap-4 p-6 text-center">
            <div><dd className="font-display text-3xl font-extrabold text-ink-900">{projects.length}</dd><dt className="text-xs text-ink-500">Proyectos</dt></div>
            <div><dd className="font-display text-3xl font-extrabold text-ink-900">{avg ?? "—"}</dd><dt className="text-xs text-ink-500">Puntuación media</dt></div>
            <div><dd className="font-display text-3xl font-extrabold text-ink-900">35</dd><dt className="text-xs text-ink-500">Puntos revisados</dt></div>
          </dl>
        </div>
      </section>
      <section className="container-x mt-12" aria-label="Proyectos">
        {projects.length === 0 ? (
          <p className="card p-10 text-center text-ink-600">Pronto publicaremos los primeros proyectos.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
        <p className="mt-6 text-sm text-ink-500">Las puntuaciones se recalculan automáticamente cada 30 días. Un proyecto marcado con “—” está pendiente de su primera auditoría.</p>
      </section>
      <CtaBand title="¿Quieres saber la puntuación de tu web actual?" text="Pásanos la dirección y te enviamos el informe completo gratis, con lo que hay que corregir primero." primary={{ label: "Pedir mi auditoría gratis", href: "/contacto" }} />
    </>
  );
}
