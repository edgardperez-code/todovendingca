"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { services, whatsappLink } from "@/lib/site";

type State = { status: "idle" | "sending" | "ok" | "error"; message?: string };

export function ContactForm({ preselectedService = "" }: { preselectedService?: string }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "No se pudo enviar el mensaje.");
      setState({ status: "ok" });
      form.reset();
    } catch (err) {
      setState({ status: "error", message: (err as Error).message });
    }
  }

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <CheckCircle2 className="h-14 w-14 text-lime-500" aria-hidden="true" />
        <h2 className="font-display mt-4 text-2xl font-extrabold text-ink-900">¡Mensaje recibido!</h2>
        <p className="mt-2 max-w-md text-ink-600">Te responderemos en menos de 24 horas hábiles. Si tienes prisa, escríbenos por WhatsApp.</p>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6">Abrir WhatsApp</a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
      <h2 className="font-display text-xl font-bold text-ink-900 sm:col-span-2">Solicitar cotización</h2>
      <div>
        <label htmlFor="name" className="label">Nombre *</label>
        <input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" className="input" placeholder="Tu nombre" />
      </div>
      <div>
        <label htmlFor="email" className="label">Correo *</label>
        <input id="email" name="email" type="email" required maxLength={160} autoComplete="email" className="input" placeholder="tu@correo.com" />
      </div>
      <div>
        <label htmlFor="phone" className="label">WhatsApp / teléfono</label>
        <input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className="input" placeholder="+58 412 000 0000" />
      </div>
      <div>
        <label htmlFor="company" className="label">Empresa o negocio</label>
        <input id="company" name="company" maxLength={120} autoComplete="organization" className="input" placeholder="Nombre de tu negocio" />
      </div>
      <div>
        <label htmlFor="service" className="label">Servicio de interés</label>
        <select id="service" name="service" defaultValue={preselectedService} className="input">
          <option value="">Selecciona una opción</option>
          {services.map((s) => (
            <option key={s.slug} value={s.name}>{s.name}</option>
          ))}
          <option value="Plan Impulso">Plan Impulso ($249)</option>
          <option value="Plan Crecimiento">Plan Crecimiento ($499)</option>
          <option value="Plan Escala">Plan Escala (desde $899)</option>
          <option value="Otro">Otro / no estoy seguro</option>
        </select>
      </div>
      <div>
        <label htmlFor="budget" className="label">Presupuesto aproximado</label>
        <select id="budget" name="budget" className="input" defaultValue="">
          <option value="">Prefiero no decirlo</option>
          <option>Menos de $250</option>
          <option>$250 a $500</option>
          <option>$500 a $1.000</option>
          <option>Más de $1.000</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="website" className="label">Tu sitio web actual (si tienes)</label>
        <input id="website" name="website" type="url" maxLength={200} className="input" placeholder="https://" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="label">Cuéntanos qué necesitas *</label>
        <textarea id="message" name="message" required minLength={10} maxLength={3000} rows={5} className="input" placeholder="Qué vendes, a quién, qué quieres lograr con la página..." />
      </div>
      {/* Campo trampa para bots: debe quedar vacío */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="empresa_web">No llenar</label>
        <input id="empresa_web" name="empresa_web" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{state.message}</p>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={state.status === "sending"} className="btn-primary !px-7 !py-3.5 text-base">
          {state.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {state.status === "sending" ? "Enviando..." : "Enviar solicitud"}
        </button>
        <p className="text-xs text-ink-500">Al enviar aceptas nuestra <a href="/privacidad" className="underline">política de privacidad</a>. No compartimos tus datos.</p>
      </div>
    </form>
  );
}
