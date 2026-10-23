import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import type { Project } from "@/lib/types";
import { hostnameOf } from "@/lib/utils";

export function ProjectCover({ project, className = "" }: { project: Project; className?: string }) {
  if (project.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={project.imageUrl} alt={`Captura de ${project.name}`} className={`h-full w-full object-cover object-top ${className}`} loading="lazy" decoding="async" />
    );
  }
  return (
    <div className={`relative flex h-full w-full items-end bg-gradient-to-br from-ink-900 via-electric-700 to-cyan-500 p-5 ${className}`}>
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative w-full rounded-t-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/60" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/30" />
        </div>
        <p className="mt-2 truncate font-mono text-xs text-white/90">{hostnameOf(project.url)}</p>
      </div>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-glow)]">
      <Link href={`/portafolio/${project.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-ink-100" tabIndex={-1} aria-hidden="true">
        <ProjectCover project={project} className="transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 shadow backdrop-blur">
          <ScoreRing score={project.auditScore} size={56} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-1.5">
          {project.services.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">{s}</span>
          ))}
        </div>
        <h3 className="font-display mt-3 text-xl font-bold text-ink-900">
          <Link href={`/portafolio/${project.slug}`} className="hover:text-electric-700">{project.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-7 text-ink-600">{project.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <Link href={`/portafolio/${project.slug}`} className="font-semibold text-electric-700 hover:underline">Ver auditoría</Link>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink-500 hover:text-ink-900">
            {hostnameOf(project.url)} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
