import { Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { BUSINESS, waLink, WA_MESSAGES, type WaMessageKey } from "@shared/site";

// Barra fija inferior solo en teléfono: en Venezuela el pedido entre empresas
// se hace por WhatsApp, así que el botón siempre está a un toque.
export function StickyCTA({ waKey = "home" }: { waKey?: WaMessageKey }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden pb-safe" data-testid="sticky-cta">
      <div className="mx-3 mb-3 flex gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-lift backdrop-blur">
        <a
          href={waLink(WA_MESSAGES[waKey])}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp h-12 flex-1 text-sm"
          data-testid="link-whatsapp-sticky"
        >
          <SiWhatsapp aria-hidden="true" className="h-5 w-5" />
          Escribir por WhatsApp
        </a>
        <a href={`tel:${BUSINESS.phone}`} className="btn-navy h-12 px-4 text-sm" aria-label={`Llamar al ${BUSINESS.phoneDisplay}`}>
          <Phone className="h-5 w-5" />
          Llamar
        </a>
      </div>
    </div>
  );
}
