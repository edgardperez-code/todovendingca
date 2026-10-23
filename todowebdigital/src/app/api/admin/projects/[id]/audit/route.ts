import { revalidatePath } from "next/cache";
import { runProjectAudit } from "@/lib/audit-runner";
import { guard } from "@/lib/admin-api";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const project = await runProjectAudit((await params).id);
    if (!project) return Response.json({ ok: false, error: "No existe" }, { status: 404 });
    revalidatePath("/");
    return Response.json({ ok: true, project });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
