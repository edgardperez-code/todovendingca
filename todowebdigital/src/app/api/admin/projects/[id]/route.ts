import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/db/repo";
import { guard, handleRepoError, projectInputSchema, readJson } from "@/lib/admin-api";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const project = await getRepo().getProjectById((await params).id);
  if (!project) return Response.json({ ok: false, error: "No existe" }, { status: 404 });
  return Response.json({ ok: true, project });
}

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const r = await readJson(req, projectInputSchema.partial());
  if ("error" in r) return r.error;
  try {
    const project = await getRepo().updateProject((await params).id, r.data);
    if (!project) return Response.json({ ok: false, error: "No existe" }, { status: 404 });
    revalidatePath("/");
    return Response.json({ ok: true, project });
  } catch (err) {
    return handleRepoError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const ok = await getRepo().deleteProject((await params).id);
  revalidatePath("/");
  return Response.json({ ok });
}
