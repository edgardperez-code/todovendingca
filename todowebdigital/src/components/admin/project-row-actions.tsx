"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gauge, Loader2 } from "lucide-react";
import { api } from "@/lib/client-api";

export function AuditButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function run() {
    setBusy(true);
    setErr(null);
    try {
      await api(`/api/admin/projects/${id}/audit`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={run} disabled={busy} className="btn-secondary !px-3 !py-1.5 text-xs">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Gauge className="h-3.5 w-3.5" aria-hidden="true" />} Auditar
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </span>
  );
}
