// Portada del diseño "Vitrina": mensaje y llamadas a la acción a la izquierda,
// dibujo a línea de la Wittern 3535 con sus anotaciones a la derecha.
// Sin animaciones de entrada: es lo primero que se ve y sale pintado desde el
// servidor. Los cortes (1099, 999 y 560 px) son los de la maqueta aprobada.
import { ChipLed, Icono, MaquinaWittern, OlaSubrayado } from "@/components/vitrina";

const ENLACE_WHATSAPP =
  "https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio";

// Lo que nos distingue, presentado como un riel de precios con sus códigos.
const features = [
  { text: "Tecnología de punta" },
  { text: "Servicio garantizado" },
  { text: "Disponible 24/7" },
];

// Códigos de selección como en la bandeja de la máquina: 10, 12, 14…
const codigoDe = (indice: number) => String(10 + indice * 2);

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-clip pt-[clamp(36px,6vw,80px)] pb-[clamp(56px,7vw,104px)] max-[560px]:pt-7"
      data-testid="section-hero"
    >
      <div className="v-cont grid grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] items-center gap-[clamp(32px,4vw,64px)] max-[999px]:grid-cols-1 max-[560px]:gap-[26px]">
        <div>
          <p className="mb-[26px] flex flex-wrap items-center gap-3 font-mono text-[12.5px] font-medium uppercase leading-[1.3] tracking-[.12em] text-tinta-2 max-[560px]:mb-5">
            <ChipLed>24/7</ChipLed> Lechería, Anzoátegui
          </p>

          <h1 data-speakable className="v-h1">
            Tu solución integral en máquinas <OlaSubrayado>vending</OlaSubrayado>
          </h1>

          <p className="v-lead mt-[26px] text-[clamp(1.08rem,1.45vw,1.28rem)] max-[560px]:mt-5">
            Tecnología, servicio y conveniencia. Transformamos tus espacios con soluciones de vending
            personalizadas y de última generación.
          </p>

          <div className="mt-[34px] flex flex-wrap gap-3.5 max-[560px]:mt-[26px] max-[560px]:gap-3">
            <a
              className="v-btn v-btn--p max-[560px]:w-full"
              href={ENLACE_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contáctanos ahora por WhatsApp"
              data-testid="link-hero-whatsapp"
            >
              <Icono nombre="whatsapp" />
              <span data-testid="button-hero-contact">Contáctanos ahora</span>
            </a>
            <a className="v-btn v-btn--s max-[560px]:w-full" href="#servicios" data-testid="link-hero-services">
              <span data-testid="button-hero-services">Ver servicios</span>
              <Icono nombre="flecha" flecha />
            </a>
          </div>

          <ul
            className="v-plata m-0 mt-11 grid max-w-[620px] list-none grid-cols-3 overflow-hidden rounded-xl p-0 max-[560px]:mt-6"
            aria-label="Lo que nos distingue"
            data-testid="list-hero-features"
          >
            {features.map((feature, indice) => (
              <li
                key={feature.text}
                className="flex items-center gap-2.5 border-r border-[rgba(21,23,26,.16)] px-3.5 py-[13px] text-[14.5px] font-semibold leading-[1.2] last:border-r-0 max-[1099px]:flex-col max-[1099px]:items-start max-[1099px]:gap-2 max-[999px]:flex-row max-[999px]:items-center max-[999px]:gap-2.5 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-[7px] max-[560px]:px-2.5 max-[560px]:pb-3 max-[560px]:pt-[11px] max-[560px]:text-[13px] max-[560px]:[overflow-wrap:anywhere] max-[339px]:px-2 max-[339px]:text-[12px]"
              >
                <span className="v-tag" aria-hidden="true">
                  {codigoDe(indice)}
                </span>
                {feature.text}
              </li>
            ))}
          </ul>
        </div>

        {/* El dibujo lleva su propio título y descripción accesibles (SVG). */}
        <div className="min-w-0" data-testid="img-hero-vending">
          <MaquinaWittern />
        </div>
      </div>
    </section>
  );
}
