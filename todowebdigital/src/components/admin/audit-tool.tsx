"use client";

import { useState } from "react";
import { Gauge, Loader2 } from "lucide-react";
import { AuditReport } from "@/components/site/audit-report";
import { api } from "@/lib/client-api";
import type { AuditResult } from "@/lib/types";

export function AuditTool() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await api<{ audit: AuditResult }>("/api/admin/audit", { method: "POST", json: { url } });
      setResult(res.audit);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={run} className="card flex flex-col gap-3 p-6 sm:flex-row">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="input flex-1 font-mono text-sm" placeholder="https://www.sitio-del-cliente.com" required aria-label="URL a auditar" />
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Gauge className="h-4 w-4" aria-hidden="true" />} {busy ? "Analizando..." : "Auditar"}
        </button>
      </form>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {result && (
        <div>
          <p className="mb-4 text-sm text-ink-500">Resultado para <a href={result.finalUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-electric-700">{result.finalUrl}</a></p>
          <AuditReport audit={result} />
        </div>
      )}
    </div>
  );
}
