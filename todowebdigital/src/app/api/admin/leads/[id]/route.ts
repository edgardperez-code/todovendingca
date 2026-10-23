import { getRepo } from "@/lib/db/repo";
import { guard } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const ok = await getRepo().deleteLead((await params).id);
  return Response.json({ ok });
}
