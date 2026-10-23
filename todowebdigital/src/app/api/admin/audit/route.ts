import { z } from "zod";
import { auditUrl } from "@/lib/audit";
import { guard, readJson } from "@/lib/admin-api";

export const runtime = "nodejs";
export const maxDuration = 120;

// Auditoría puntual de cualquier URL (para evaluar sitios de clientes potenciales).
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const r = await readJson(req, z.object({ url: z.string().trim().min(4).max(300) }));
  if ("error" in r) return r.error;
  try {
    const audit = await auditUrl(r.data.url);
    return Response.json({ ok: true, audit });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
