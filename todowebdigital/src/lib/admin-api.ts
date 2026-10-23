import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

// Utilidades compartidas por las rutas /api/admin/*.
export async function guard(): Promise<Response | null> {
  return requireAdmin();
}

export async function readJson<T>(req: Request, schema: z.ZodType<T>): Promise<{ data: T } | { error: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: Response.json({ ok: false, error: "JSON inválido" }, { status: 400 }) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: Response.json({ ok: false, error: `${issue?.path.join(".") || "datos"}: ${issue?.message || "inválido"}` }, { status: 400 }) };
  }
  return { data: parsed.data };
}

export function handleRepoError(err: unknown): Response {
  const msg = (err as Error).message || "Error interno";
  if (msg === "SLUG_TAKEN") return Response.json({ ok: false, error: "Ya existe un elemento con ese slug (URL). Cambia el slug." }, { status: 409 });
  console.error("[admin-api]", err);
  return Response.json({ ok: false, error: "Error interno del servidor" }, { status: 500 });
}

const faqSchema = z.array(z.object({ q: z.string().trim().min(1), a: z.string().trim().min(1) })).max(12);
const strList = z.array(z.string().trim().min(1).max(60)).max(15);

export const postInputSchema = z.object({
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9-]+$/, "solo minúsculas, números y guiones"),
  title: z.string().trim().min(5).max(160),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().min(20),
  coverImage: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().min(1).max(60).optional(),
  tags: strList.optional(),
  metaTitle: z.string().trim().max(120).nullable().optional(),
  metaDescription: z.string().trim().max(260).nullable().optional(),
  keywords: strList.optional(),
  faq: faqSchema.optional(),
  status: z.enum(["draft", "published"]).optional(),
  generatedByAi: z.boolean().optional(),
  prompt: z.string().max(5000).nullable().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export const projectInputSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, "solo minúsculas, números y guiones"),
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().url("URL inválida").max(300),
  description: z.string().trim().max(2000).optional(),
  services: strList.optional(),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  featured: z.boolean().optional(),
  launchedAt: z.string().nullable().optional(),
  status: z.enum(["published", "hidden"]).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});
