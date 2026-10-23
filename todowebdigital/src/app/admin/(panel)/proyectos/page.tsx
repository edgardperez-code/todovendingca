import Link from "next/link";
import { Plus } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { AuditButton } from "@/components/admin/project-row-actions";
import { getRepo } from "@/lib/db/repo";
import { formatDate, hostnameOf } from "@/lib/utils";

export default async function ProyectosPage() {
  const projects = await getRepo().listProjects();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Portafolio</h1>
          <p className="text-sm text-ink-500">{projects.length} proyectos. Las auditorías se renuevan solas cada 30 días; también puedes lanzarlas a mano.</p>
        </div>
        <Link href="/admin/proyectos/nuevo" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Nuevo proyecto</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr><th className="px-5 py-3">Proyecto</th><th className="px-5 py-3">Puntuación</th><th className="hidden px-5 py-3 md:table-cell">Última auditoría</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50/60">
                <td className="px-5 py-3">
                  <Link href={`/admin/proyectos/${p.id}`} className="font-medium text-ink-900 hover:text-electric-700">{p.name}</Link>
                  <p className="font-mono text-xs text-ink-400">{hostnameOf(p.url)}{p.featured ? " · destacado" : ""}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <ScoreRing score={p.auditScore} size={44} />
                    {p.audit && !p.audit.error && <span className="hidden text-xs text-ink-500 lg:inline">SEO {p.audit.scores.seo} · GEO {p.audit.scores.geo} · Vel {p.audit.scores.performance}</span>}
                    {p.audit?.error && <span className="text-xs text-red-600">Error</span>}
                  </div>
                </td>
                <td className="hidden px-5 py-3 text-ink-600 md:table-cell">{p.auditedAt ? formatDate(p.auditedAt) : "Pendiente"}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-600"}`}>{p.status === "published" ? "Publicado" : "Oculto"}</span></td>
                <td className="px-5 py-3 text-right"><AuditButton id={p.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
