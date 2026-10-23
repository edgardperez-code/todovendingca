import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProjectCover } from "@/components/site/project-card";
import { AuditReport } from "@/components/site/audit-report";
import { ScoreRing } from "@/components/ui/score-ring";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/json-ld";
import { getRepo } from "@/lib/db/repo";
import { scheduleStaleAudits } from "@/lib/audit-runner";
import { buildMetadata, projectJsonLd } from "@/lib/seo";
import { formatDate, hostnameOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getRepo().getProjectBySlug(slug);
  if (!p || p.status !== "published") return { title: "Proyecto no encontrado", robots: { index: false } };
  return buildMetadata({
    title: `${p.name}: web creada${p.auditScore != null ? ` · SEO ${p.auditScore}/100` : ""}`,
    description: p.description.slice(0, 155).replace(/\s+\S*$/, "") + ".",
    path: `/portafolio/${p.slug}`,
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
  });
}

export default async function ProyectoPage({ params }: Params) {
  const { slug } = await params;
  const repo = getRepo();
  const p = await repo.getProjectBySlug(slug);
  if (!p || p.status !== "published") notFound();
  scheduleStaleAudits([p]);
  const others = (await repo.listProjects({ status: "published" })).filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <>
      <JsonLd data={projectJsonLd(p)} />
      <section className="container-x pt-10">
        <Breadcrumbs items={[{ name: "Portafolio", path: "/portafolio" }, { name: p.name, path: `/portafolio/${p.slug}` }]} />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              {p.services.map((s) => <span key={s} className="rounded-full bg-electric-500/10 px-3 py-1 text-xs font-semibold text-electric-700">{s}</span>)}
            </div>
            <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.1] text-ink-900 sm:text-5xl">{p.name}</h1>
            <p className="mt-5 text-lg leading-8 text-ink-600">{p.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-500">
              {p.launchedAt && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" /> Publicado en {formatDate(p.launchedAt, { month: "long", year: "numeric" })}</span>}
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-electric-700 hover:underline">Visitar {hostnameOf(p.url)} <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-ink-100 shadow-[var(--shadow-card)]"><ProjectCover project={p} /></div>
            <div className="absolute -bottom-6 left-6 rounded-2xl bg-white p-3 shadow-[var(--shadow-glow)]"><ScoreRing score={p.auditScore} size={88} label="Global" /></div>
          </div>
        </div>
      </section>

      <section className="container-x mt-24" aria-labelledby="auditoria">
        <span className="eyebrow">Auditoría SEO / GEO</span>
        <h2 id="auditoria" className="font-display mt-4 text-3xl font-extrabold text-ink-900">Así puntúa {p.name} en nuestra auditoría</h2>
        <p className="mt-3 max-w-2xl text-ink-600">Nuestra herramienta descarga la página pública, revisa 35 puntos y calcula una puntuación por categoría. Es la misma auditoría que aplicamos gratis a los sitios de nuestros clientes potenciales.</p>
        <div className="mt-8">
          {p.audit && !p.audit.error ? (
            <AuditReport audit={p.audit} />
          ) : (
            <div className="card p-8 text-center text-ink-600">
              <p className="font-semibold text-ink-900">Auditoría pendiente</p>
              <p className="mt-1 text-sm">{p.audit?.error ? "El último intento no pudo descargar el sitio; se reintentará automáticamente." : "Se está calculando en segundo plano. Recarga la página en unos segundos."}</p>
            </div>
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section className="container-x mt-24" aria-labelledby="mas-proyectos">
          <h2 id="mas-proyectos" className="font-display text-2xl font-extrabold text-ink-900">Más proyectos</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((o) => (
              <Link key={o.id} href={`/portafolio/${o.slug}`} className="card group flex items-center gap-4 p-5 transition-all hover:-translate-y-1">
                <ScoreRing score={o.auditScore} size={56} />
                <div className="min-w-0">
                  <p className="font-display truncate font-bold text-ink-900">{o.name}</p>
                  <p className="truncate text-sm text-ink-500">{hostnameOf(o.url)}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-ink-400 group-hover:text-electric-700" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
      <CtaBand title="¿Quieres una web con esta puntuación?" />
    </>
  );
}
