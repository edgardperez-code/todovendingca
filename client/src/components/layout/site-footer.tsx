import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiTiktok } from "react-icons/si";
import { BUSINESS, ROUTES, waLink, WA_MESSAGES } from "@shared/site";
import { ThemeToggle } from "@/components/theme-toggle";

const LOGO = "/brand/logo-todovending-360-v1.webp";

const pages = ROUTES.filter((r) => !r.hidden && r.path !== "/");

export function SiteFooter() {
  return (
    <footer className="surface-navy mt-auto" data-testid="footer">
      <div className="container py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="/" className="inline-flex rounded-2xl bg-white px-4 py-3" aria-label="Todo Vending CA, inicio">
              <img src={LOGO} width={360} height={121} alt="Todo Vending CA" className="h-9 w-auto" loading="lazy" decoding="async" />
            </a>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
              Empresa venezolana de máquinas expendedoras con sede en Lechería, Anzoátegui. Instalamos, reponemos y
              mantenemos las máquinas sin costo para tu negocio.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={waLink(WA_MESSAGES.home)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-11 px-5 text-sm">
                <SiWhatsapp aria-hidden="true" className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost-light h-11 w-11" aria-label="Instagram de Todo Vending CA">
                <SiInstagram aria-hidden="true" className="h-4 w-4" />
              </a>
              <a href={BUSINESS.tiktok} target="_blank" rel="noopener noreferrer" className="btn-ghost-light h-11 w-11" aria-label="TikTok de Todo Vending CA">
                <SiTiktok aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-[.18em] text-brand-amber">Páginas</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {pages.map((r) => (
                <li key={r.path}>
                  <a href={r.path} className="text-white/80 transition-colors hover:text-white">
                    {r.path === "/cafe-oriente" ? "Café Oriente, nuestra marca de café" : r.title.split(" | ")[0]}
                  </a>
                </li>
              ))}
              <li>
                <a href="/#contacto" className="text-white/80 transition-colors hover:text-white">Contacto</a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold uppercase tracking-[.18em] text-brand-amber">Contacto</h2>
            <address className="mt-4 space-y-3 not-italic text-sm text-white/80">
              <a href={`tel:${BUSINESS.phone}`} className="flex items-start gap-3 hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
                {BUSINESS.phoneDisplay}
              </a>
              <a href={`mailto:${BUSINESS.email}`} className="flex items-start gap-3 hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
                {BUSINESS.email}
              </a>
              <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-white">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
                <span>
                  {BUSINESS.address.streetAddress}
                  <br />
                  {BUSINESS.address.addressLocality}, {BUSINESS.address.addressRegion}, Venezuela
                </span>
              </a>
              <p className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
                <span>{BUSINESS.hours}</span>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.legalName} · RIF {BUSINESS.rif} · Lechería, Anzoátegui, Venezuela.
            Café Oriente® es una marca registrada de {BUSINESS.legalName}.
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://digital.todovendingca.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-3 py-1.5 text-white/70 transition-colors hover:text-white"
            >
              Web por Digital.TodoVendingca.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
