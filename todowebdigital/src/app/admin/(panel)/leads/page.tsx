import { DeleteLeadButton } from "@/components/admin/lead-actions";
import { getRepo } from "@/lib/db/repo";
import { formatDate } from "@/lib/utils";

export default async function LeadsPage() {
  const leads = await getRepo().listLeads(500);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Contactos recibidos</h1>
        <p className="text-sm text-ink-500">{leads.length} solicitudes desde el formulario de la web. Responde desde tu correo o WhatsApp.</p>
      </div>
      {leads.length === 0 ? (
        <p className="card p-10 text-center text-ink-500">Aún no hay contactos.</p>
      ) : (
        <ul className="space-y-4">
          {leads.map((l) => (
            <li key={l.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-ink-900">{l.name} {l.company && <span className="text-base font-normal text-ink-500">· {l.company}</span>}</p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
                    <a href={`mailto:${l.email}`} className="text-electric-700 hover:underline">{l.email}</a>
                    {l.phone && <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-electric-700 hover:underline">{l.phone}</a>}
                    {l.website && <a href={l.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{l.website}</a>}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span>{formatDate(l.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <DeleteLeadButton id={l.id} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {l.service && <span className="rounded-full bg-electric-500/10 px-2.5 py-1 font-semibold text-electric-700">{l.service}</span>}
                {l.budget && <span className="rounded-full bg-ink-100 px-2.5 py-1 font-medium text-ink-700">Presupuesto: {l.budget}</span>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{l.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
