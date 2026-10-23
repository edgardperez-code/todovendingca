import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/db/repo";
import { guard, handleRepoError, postInputSchema, readJson } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const posts = await getRepo().listPosts();
  return Response.json({ ok: true, posts });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const r = await readJson(req, postInputSchema);
  if ("error" in r) return r.error;
  try {
    const post = await getRepo().createPost(r.data);
    revalidatePath("/");
    return Response.json({ ok: true, post }, { status: 201 });
  } catch (err) {
    return handleRepoError(err);
  }
}
