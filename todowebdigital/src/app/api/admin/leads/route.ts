import { getRepo } from "@/lib/db/repo";
import { guard } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return Response.json({ ok: true, leads: await getRepo().listLeads(500) });
}
