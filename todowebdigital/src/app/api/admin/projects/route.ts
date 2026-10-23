import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/db/repo";
import { guard, handleRepoError, projectInputSchema, readJson } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return Response.json({ ok: true, projects: await getRepo().listProjects() });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const r = await readJson(req, projectInputSchema);
  if ("error" in r) return r.error;
  try {
    const project = await getRepo().createProject(r.data);
    revalidatePath("/");
    return Response.json({ ok: true, project }, { status: 201 });
  } catch (err) {
    return handleRepoError(err);
  }
}
