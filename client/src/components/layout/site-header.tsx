import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { NAV_ROUTES, BUSINESS, waLink, WA_MESSAGES, type WaMessageKey } from "@shared/site";

// React 18 no conoce fetchPriority en camelCase; en minúsculas llega al DOM.
const HIGH_PRIORITY = { fetchpriority: "high" } as Record<string, string>;

const LOGO = "/brand/logo-todovending-360-v1.webp";

type Props = {
  /** Qué mensaje de WhatsApp usa el botón del header en esta página */
  waKey?: WaMessageKey;
  /** Ruta activa para marcar el enlace en el menú */
  currentPath?: string;
};

export function SiteHeader({ waKey = "home", currentPath }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const wa = waLink(WA_MESSAGES[waKey]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color] duration-300 border-b ${
        scrolled || open
          ? "bg-background/90 backdrop-blur-md border-border shadow-soft"
          : "bg-transparent border-transparent"
      }`}
      data-testid="header"
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <a href="/" className="flex shrink-0 items-center gap-2 rounded-lg dark:bg-white dark:px-2 dark:py-1" aria-label="Todo Vending CA, inicio" data-testid="link-logo">
            <img
              src={LOGO}
              width={360}
              height={121}
              alt="Todo Vending CA"
              className="h-9 w-auto md:h-10"
              decoding="async"
              {...HIGH_PRIORITY}
            />
          </a>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
            {NAV_ROUTES.map((r) => (
              <a
                key={r.path}
                href={r.path}
                aria-current={currentPath === r.path ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  currentPath === r.path ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {r.label}
              </a>
            ))}
            <a href="/#contacto" className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
              Contacto
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <a href={`tel:${BUSINESS.phone}`} className="btn-outline-ink h-10 px-4 text-sm" aria-label={`Llamar al ${BUSINESS.phoneDisplay}`}>
              <Phone className="h-4 w-4" />
              <span className="hidden xl:inline">{BUSINESS.phoneDisplay}</span>
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-10 px-5 text-sm" data-testid="link-whatsapp-header">
              <SiWhatsapp aria-hidden="true" className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/80"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
            data-testid="button-mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-movil" className="lg:hidden border-t border-border bg-background">
          <nav className="container flex flex-col py-3" aria-label="Navegación móvil">
            {NAV_ROUTES.map((r) => (
              <a
                key={r.path}
                href={r.path}
                aria-current={currentPath === r.path ? "page" : undefined}
                className="rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {r.label}
              </a>
            ))}
            <a href="/#contacto" className="rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-muted" onClick={() => setOpen(false)}>
              Contacto
            </a>
            <div className="mt-3 flex gap-2 border-t border-border pt-4">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-12 flex-1 text-sm">
                <SiWhatsapp aria-hidden="true" className="h-4 w-4" />
                Escribir por WhatsApp
              </a>
              <a href={`tel:${BUSINESS.phone}`} className="btn-outline-ink h-12 w-12" aria-label={`Llamar al ${BUSINESS.phoneDisplay}`}>
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
