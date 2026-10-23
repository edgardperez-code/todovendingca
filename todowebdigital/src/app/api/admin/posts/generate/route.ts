import { z } from "zod";
import { AiError, aiConfigured, CLAUDE_MODEL, generateArticle } from "@/lib/ai";
import { guard, readJson } from "@/lib/admin-api";

export const runtime = "nodejs";
export const maxDuration = 300; // la generación de un artículo largo puede tardar varios minutos

const schema = z.object({
  prompt: z.string().trim().min(10, "Describe el tema con al menos 10 caracteres").max(4000),
  tone: z.enum(["profesional", "cercano", "didactico"]).optional(),
  length: z.enum(["corto", "medio", "largo"]).optional(),
  keywords: z.array(z.string().trim().min(1).max(60)).max(12).optional(),
  audience: z.string().trim().max(200).optional(),
  category: z.string().trim().max(60).optional(),
});

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return Response.json({ ok: true, configured: aiConfigured(), model: CLAUDE_MODEL });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const r = await readJson(req, schema);
  if ("error" in r) return r.error;
  try {
    const result = await generateArticle(r.data);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof AiError) return Response.json({ ok: false, error: err.message }, { status: err.status });
    console.error("[generate]", err);
    return Response.json({ ok: false, error: "Error generando el artículo" }, { status: 500 });
  }
}
