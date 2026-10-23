import { ArrowRight, BadgeCheck, Wrench, Clock } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { waLink, WA_MESSAGES } from "@shared/site";

// React 18 no conoce fetchPriority en camelCase; en minúsculas llega al DOM.
const HIGH_PRIORITY = { fetchpriority: "high" } as Record<string, string>;

// Ruta pública estable: debe coincidir con el <link rel="preload"> de la página.
export const HERO_IMAGE = "/assets/maquina-vending-hero-720w-v1.webp";
export const HERO_SRCSET =
  "/assets/maquina-vending-hero-480w-v1.webp 480w, /assets/maquina-vending-hero-720w-v1.webp 720w, /assets/maquina-vending-hero-960w-v1.webp 960w";
export const HERO_SIZES = "(min-width: 1024px) 460px, (min-width: 640px) 420px, 90vw";

const pills = [
  { icon: BadgeCheck, text: "Instalación gratuita" },
  { icon: Wrench, text: "Reposición y mantenimiento incluidos" },
  { icon: Clock, text: "Máquinas 24/7" },
];

export function HeroHome() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-grid pt-28 pb-12 md:pt-36 md:pb-20" data-testid="section-hero">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-amber/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[22rem] w-[22rem] rounded-full bg-brand-sky/15 blur-3xl" aria-hidden="true" />

      <div className="container relative">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="animate-fade-up lg:col-span-7">
            <p className="eyebrow">Lechería · Puerto La Cruz · Barcelona</p>
            <h1 className="mt-4 text-display-xl">
              Máquinas expendedoras para tu negocio, <span className="mark-accent">instaladas gratis</span>.
            </h1>
            <p className="speakable mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Todo Vending CA instala máquinas de snacks, bebidas frías y café en grano en empresas, clínicas, colegios y
              gimnasios de Anzoátegui. Nosotros reponemos los productos y damos mantenimiento; tu negocio solo pone el espacio.
            </p>

            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Lo que incluye el servicio">
              {pills.map((p) => (
                <li key={p.text} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-2 text-sm font-medium backdrop-blur">
                  <p.icon className="h-4 w-4 text-brand-orange" />
                  {p.text}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={waLink(WA_MESSAGES.home)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-13 min-h-[3.25rem] px-7 text-base" data-testid="link-hero-whatsapp">
                <SiWhatsapp aria-hidden="true" className="h-5 w-5" />
                Pedir una máquina por WhatsApp
              </a>
              <a href="#servicios" className="btn-outline-ink min-h-[3.25rem] px-7 text-base" data-testid="link-hero-services">
                Ver servicios
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Ya en Clínica Anzoátegui, Clínica Zambrano, Centro Empresarial Colón, Centro Empresarial Oleus, Colegio El Manglar y Lion Gym.
            </p>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="absolute inset-x-8 bottom-6 top-16 rounded-[3rem] bg-gradient-to-b from-brand-sky/20 via-brand-amber/10 to-transparent blur-2xl" aria-hidden="true" />
              <img
                src={HERO_IMAGE}
                srcSet={HERO_SRCSET}
                sizes={HERO_SIZES}
                width={720}
                height={935}
                alt="Máquinas expendedoras de bebidas y snacks de Todo Vending CA"
                className="relative mx-auto h-auto w-full max-w-[420px] animate-float drop-shadow-2xl lg:max-w-[460px]"
                loading="eager"
                decoding="async"
                {...HIGH_PRIORITY}
                data-testid="img-hero-vending"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
