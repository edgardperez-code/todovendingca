import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import type { AuditCheck, AuditResult, CheckCategory } from "@/lib/types";
import { formatDate, scoreLabel } from "@/lib/utils";

const CATEGORY_LABEL: Record<CheckCategory, { title: string; text: string }> = {
  seo: { title: "SEO", text: "Lo que Google necesita para posicionar la página." },
  geo: { title: "GEO / IAO", text: "Lo que ChatGPT, Gemini, Claude y Perplexity necesitan para citarla." },
  performance: { title: "Rendimiento", text: "Velocidad y peso de la página tal como la recibe el visitante." },
};

function StatusIcon({ status }: { status: AuditCheck["status"] }) {
  if (status === "pass") return <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Correcto" />;
  if (status === "warn") return <AlertTriangle className="h-5 w-5 text-amber-500" aria-label="Mejorable" />;
  if (status === "fail") return <XCircle className="h-5 w-5 text-red-500" aria-label="Falla" />;
  return <Info className="h-5 w-5 text-ink-400" aria-label="Informativo" />;
}

export function AuditSummary({ audit, compact = false }: { audit: AuditResult; compact?: boolean }) {
  const s = audit.scores;
  return (
    <div className={`grid gap-6 ${compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-4"}`}>
      <ScoreRing score={s.overall} size={compact ? 72 : 112} label="Global" />
      <ScoreRing score={s.seo} size={compact ? 72 : 112} label="SEO" />
      <ScoreRing score={s.geo} size={compact ? 72 : 112} label="GEO / IAO" />
      <ScoreRing score={s.performance} size={compact ? 72 : 112} label="Rendimiento" />
    </div>
  );
}

export function AuditReport({ audit }: { audit: AuditResult }) {
  if (audit.error) {
    return <p className="rounded-2xl bg-red-50 p-5 text-red-700">{audit.error}</p>;
  }
  const { label, tone } = scoreLabel(audit.scores.overall);
  const toneClass = tone === "good" ? "text-green-600" : tone === "ok" ? "text-amber-600" : "text-red-600";
  return (
    <div className="space-y-10">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Resultado de la auditoría</p>
            <p className={`font-display mt-1 text-3xl font-extrabold ${toneClass}`}>{label}</p>
            <p className="mt-2 text-sm text-ink-500">
              Analizada el {formatDate(audit.fetchedAt)} · {audit.responseMs} ms de respuesta · {(audit.htmlBytes / 1024).toFixed(0)} KB de HTML · {audit.checks.filter((c) => c.status === "pass").length} de {audit.checks.filter((c) => c.status !== "info").length} comprobaciones superadas
            </p>
          </div>
          <AuditSummary audit={audit} />
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Título", audit.meta.title ?? "—"],
          ["Palabras visibles", String(audit.meta.wordCount)],
          ["Datos estructurados", audit.meta.jsonLdTypes.length ? audit.meta.jsonLdTypes.join(", ") : "Ninguno"],
          ["Archivos para IA", `${audit.meta.hasLlmsTxt ? "llms.txt ✓" : "sin llms.txt"} · ${audit.meta.hasSitemap ? "sitemap ✓" : "sin sitemap"}`],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">{k}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-ink-900">{v}</dd>
          </div>
        ))}
      </dl>

      {(["seo", "geo", "performance"] as CheckCategory[]).map((cat) => {
        const checks = audit.checks.filter((c) => c.category === cat);
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 id={`cat-${cat}`} className="font-display text-2xl font-extrabold text-ink-900">{CATEGORY_LABEL[cat].title}</h3>
                <p className="text-sm text-ink-500">{CATEGORY_LABEL[cat].text}</p>
              </div>
              <span className="font-display text-3xl font-extrabold text-ink-900">{audit.scores[cat]}<span className="text-base text-ink-400">/100</span></span>
            </div>
            <ul className="mt-4 divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white">
              {checks.map((c) => (
                <li key={c.id} className="flex gap-3 px-5 py-4">
                  <StatusIcon status={c.status} />
                  <div>
                    <p className="font-medium text-ink-900">{c.label}</p>
                    <p className="mt-0.5 text-sm text-ink-600">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
