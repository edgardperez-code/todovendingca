import { AuditTool } from "@/components/admin/audit-tool";

export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Auditar una web</h1>
        <p className="text-sm text-ink-500">Analiza el sitio de un cliente potencial: 35 comprobaciones de SEO, GEO/IAO y rendimiento con puntuación 0-100. Ideal para enviar junto con la propuesta.</p>
      </div>
      <AuditTool />
    </div>
  );
}
