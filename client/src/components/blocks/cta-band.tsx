import { ArrowRight, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { BUSINESS, waLink, WA_MESSAGES, type WaMessageKey } from "@shared/site";

export function CTABand({
  title,
  text,
  waKey = "home",
  waLabel = "Escribir por WhatsApp",
}: {
  title: string;
  text: string;
  waKey?: WaMessageKey;
  waLabel?: string;
}) {
  return (
    <section className="py-20 md:py-24" aria-labelledby="cta-titulo">
      <div className="container">
        <div className="surface-navy reveal relative overflow-hidden rounded-3xl px-6 py-12 md:px-14 md:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow text-brand-amber">Instalación gratuita</p>
              <h2 id="cta-titulo" className="mt-3 text-display-md text-white">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">{text}</p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
              <a href={waLink(WA_MESSAGES[waKey])} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-12 px-6 text-base">
                <SiWhatsapp aria-hidden="true" className="h-5 w-5" />
                {waLabel}
              </a>
              <a href="/#contacto" className="btn-ghost-light h-12 px-6 text-base">
                Prefiero el formulario
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={`tel:${BUSINESS.phone}`} className="mt-1 inline-flex items-center gap-2 text-sm text-white/75 hover:text-white">
                <Phone className="h-4 w-4" />
                {BUSINESS.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
