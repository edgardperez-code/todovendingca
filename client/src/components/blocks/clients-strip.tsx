import { MapPin } from "lucide-react";
import { CLIENTS } from "@shared/site";

// Prueba social con los clientes reales. Son nombres en texto, no logos:
// no tenemos permiso de uso de marca de cada uno.
export function ClientsStrip({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="reveal text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Ya confían en Todo Vending CA: </span>
        {CLIENTS.map((c) => c.name).join(" · ")}.
      </p>
    );
  }
  return (
    <ul className="reveal grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CLIENTS.map((c) => (
        <li key={c.name} className="card-soft flex items-start gap-3 p-4">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold leading-tight">{c.name}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-brand-orange">{c.type}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
