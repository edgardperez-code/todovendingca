import { getRepo } from "@/lib/db/repo";
import { auditUrl } from "@/lib/audit";
import type { Project } from "@/lib/types";

const STALE_DAYS = 30;
const running = new Set<string>();

// Ejecuta la auditoría de un proyecto y guarda el resultado.
export async function runProjectAudit(projectId: string): Promise<Project | null> {
  const repo = getRepo();
  const project = await repo.getProjectById(projectId);
  if (!project) return null;
  if (running.has(projectId)) return project;
  running.add(projectId);
  try {
    const result = await auditUrl(project.url);
    return await repo.updateProject(projectId, {
      audit: result,
      auditScore: result.error ? null : result.scores.overall,
      auditedAt: result.fetchedAt,
    });
  } finally {
    running.delete(projectId);
  }
}

// Si un proyecto nunca se auditó (o hace más de 30 días), lanza la auditoría en
// segundo plano. La página actual se sirve sin esperar; la siguiente ya trae datos.
export function scheduleStaleAudits(projects: Project[]) {
  if (process.env.AUTO_AUDIT === "0") return;
  const now = Date.now();
  for (const p of projects) {
    const age = p.auditedAt ? (now - new Date(p.auditedAt).getTime()) / 86_400_000 : Infinity;
    // Una auditoría fallida (sitio caído, red) se reintenta al día siguiente.
    const limit = p.audit?.error ? 1 : STALE_DAYS;
    if (age > limit && !running.has(p.id)) {
      runProjectAudit(p.id).catch((err) => console.error("[audit] fallo en auditoría automática:", (err as Error).message));
    }
  }
}
