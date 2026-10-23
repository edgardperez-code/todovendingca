import { z } from "zod";
import { getRepo } from "@/lib/db/repo";
import { sendLeadNotification } from "@/lib/email";

export const runtime = "nodejs";

const LeadSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(120),
  email: z.string().trim().email("Correo no válido").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  service: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000),
  empresa_web: z.string().max(500).optional(), // honeypot: debe venir vacío
});

// Limitador simple por IP: 5 envíos cada 10 minutos.
const hits = new Map<string, { n: number; reset: number }>();
function allowed(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + 10 * 60 * 1000 });
    return true;
  }
  h.n += 1;
  return h.n <= 5;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (!allowed(ip)) return Response.json({ ok: false, error: "Demasiados envíos. Intenta en unos minutos." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Solicitud inválida" }, { status: 400 });
  }
  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
  }
  const d = parsed.data;
  if (d.empresa_web) return Response.json({ ok: true }); // bot: fingimos éxito

  const lead = await getRepo().createLead({
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    company: d.company || null,
    website: d.website || null,
    service: d.service || null,
    budget: d.budget || null,
    message: d.message,
    source: req.headers.get("referer") || "web",
  });
  // El correo es un aviso: si falla, el contacto ya está guardado.
  sendLeadNotification(lead).catch(() => undefined);
  return Response.json({ ok: true, id: lead.id }, { status: 201 });
}
