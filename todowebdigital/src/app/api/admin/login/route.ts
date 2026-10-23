import { z } from "zod";
import { adminConfigured, checkPassword, clearAttempts, createSessionToken, loginAllowed, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return Response.json({ ok: false, error: "El panel no está configurado: define ADMIN_PASSWORD (mínimo 8 caracteres) en las variables de entorno." }, { status: 503 });
  }
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (!loginAllowed(ip)) return Response.json({ ok: false, error: "Demasiados intentos. Espera 15 minutos." }, { status: 429 });

  const parsed = z.object({ password: z.string().min(1).max(200) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, error: "Contraseña requerida" }, { status: 400 });
  if (!checkPassword(parsed.data.password)) return Response.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 });

  clearAttempts(ip);
  const { value, maxAge } = createSessionToken();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
    },
  });
}
