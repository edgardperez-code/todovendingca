import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { waLink, WA_MESSAGES, type WaMessageKey } from "@shared/site";

// React 18 no conoce fetchPriority en camelCase; en minúsculas llega al DOM.
const HIGH_PRIORITY = { fetchpriority: "high" } as Record<string, string>;

export function SubpageHero({
  eyebrow,
  title,
  lead,
  waKey,
  waLabel = "Pedir una máquina por WhatsApp",
  breadcrumb,
  image,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  waKey: WaMessageKey;
  waLabel?: string;
  breadcrumb: { name: string; path: string }[];
  image?: { src: string; alt: string; width: number; height: number; srcSet?: string; sizes?: string };
}) {
  return (
    <section className="relative overflow-hidden bg-grid pt-28 pb-12 md:pt-36 md:pb-16">
      <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand-amber/20 blur-3xl" aria-hidden="true" />
      <div className="container relative">
        <nav aria-label="Ruta de navegación" className="animate-fade-up mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumb.map((b, i) => (
              <li key={b.path} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i < breadcrumb.length - 1 ? (
                  <a href={b.path} className="hover:text-foreground">
                    {b.name}
                  </a>
                ) : (
                  <span aria-current="page" className="text-foreground">
                    {b.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className={`grid items-center gap-10 ${image ? "lg:grid-cols-12" : ""}`}>
          <div className={`animate-fade-up ${image ? "lg:col-span-7" : "max-w-3xl"}`}>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 text-display-lg">{title}</h1>
            <p className="speakable mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={waLink(WA_MESSAGES[waKey])} target="_blank" rel="noopener noreferrer" className="btn-whatsapp min-h-[3.25rem] px-7 text-base">
                <SiWhatsapp aria-hidden="true" className="h-5 w-5" />
                {waLabel}
              </a>
              <a href="/#contacto" className="btn-outline-ink min-h-[3.25rem] px-7 text-base">
                Formulario de contacto
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          {image && (
            <div className="lg:col-span-5">
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={image.sizes ?? "(min-width: 1024px) 380px, 80vw"}
                width={image.width}
                height={image.height}
                alt={image.alt}
                className="mx-auto h-auto w-full max-w-[380px] drop-shadow-2xl"
                loading="eager"
                decoding="async"
                {...HIGH_PRIORITY}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
