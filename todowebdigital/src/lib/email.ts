import { Resend } from "resend";
import type { Lead } from "@/lib/types";
import { site } from "@/lib/site";

function esc(s: string | null | undefined) {
  return (s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

// Aviso por correo de cada contacto nuevo. Si Resend no está configurado,
// no falla: el contacto ya quedó guardado en la base de datos.
export async function sendLeadNotification(lead: Lead): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO || site.email;
  const from = process.env.CONTACT_EMAIL_FROM || "TodoWeb Digital <onboarding@resend.dev>";
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY no configurada: no se envió aviso del contacto", lead.id);
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    const rows: Array<[string, string | null]> = [
      ["Nombre", lead.name],
      ["Email", lead.email],
      ["Teléfono / WhatsApp", lead.phone],
      ["Empresa", lead.company],
      ["Sitio web actual", lead.website],
      ["Servicio de interés", lead.service],
      ["Presupuesto", lead.budget],
      ["Origen", lead.source],
    ];
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
        <div style="background:linear-gradient(135deg,#2563eb,#06b6d4);padding:22px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:20px">TodoWeb Digital</h1>
          <p style="margin:6px 0 0">Nuevo contacto desde ${esc(site.domain)}</p>
        </div>
        <div style="padding:24px;background:#f8fafc">
          <table style="width:100%;border-collapse:collapse">
            ${rows
              .filter(([, v]) => v)
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:bold;width:40%">${k}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">${esc(v)}</td></tr>`,
              )
              .join("")}
          </table>
          <h3 style="margin:20px 0 8px">Mensaje</h3>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;white-space:pre-wrap">${esc(lead.message)}</div>
        </div>
        <div style="background:#0f172a;color:#94a3b8;padding:12px;text-align:center;font-size:12px">
          Responde a este correo para contactar al cliente.
        </div>
      </div>`;
    const result = await resend.emails.send({
      from,
      to,
      replyTo: lead.email,
      subject: `Nuevo contacto web: ${lead.name}${lead.service ? ` · ${lead.service}` : ""}`,
      html,
    });
    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] error enviando aviso:", (err as Error).message);
    return false;
  }
}
