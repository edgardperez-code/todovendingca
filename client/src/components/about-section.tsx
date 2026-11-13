// "Sobre nosotros" del diseño Vitrina: la foto real de nuestras máquinas en un
// marco de gabinete con un panel de cifras LED debajo, y el texto a la derecha.
// Sin animaciones de entrada: todo sale visible desde el servidor.
import { CifraLed, Etiqueta, Icono } from "@/components/vitrina";

const ENLACE_WHATSAPP =
  "https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio";

// Foto real (client/public/assets/, con versión en el nombre por la caché de 1 año).
const FOTO = "/assets/maquinas-todovending-v1.webp";
const FOTO_800 = "/assets/maquinas-todovending-800-v1.webp";

const stats = [
  { value: "100%", label: "Satisfacción" },
  { value: "24/7", label: "Disponibilidad" },
  { value: "0", label: "Costo instalación" },
];

const sellos = ["Instalación gratuita", "Mantenimiento incluido", "Reposición garantizada"];

export function AboutSection() {
  return (
    <section id="nosotros" className="v-sec v-sec--2" data-testid="section-about">
      <div className="v-cont grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-[clamp(36px,6vw,96px)] max-[899px]:grid-cols-1">
        {/* Foto enmarcada + panel LED */}
        <div className="max-[899px]:max-w-[520px]">
          <figure
            className="m-0 rounded-3xl bg-gabinete p-2.5"
            style={{
              boxShadow: "0 0 0 1px var(--gabinete-borde), 0 40px 60px -40px rgba(var(--sombra-rgb), .55)",
            }}
          >
            <div className="aspect-square overflow-hidden rounded-[15px] bg-gabinete-2">
              <img
                src={FOTO}
                srcSet={`${FOTO_800} 800w, ${FOTO} 1600w`}
                sizes="(max-width: 899px) min(500px, calc(100vw - 60px)), 42vw"
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
                alt="Máquinas expendedoras de Todo Vending CA: una de bebidas y una de snacks con la ola naranja y azul en la columna de control"
                className="h-full w-full object-cover object-center"
                style={{
                  transform: "scale(1.07)",
                  transformOrigin: "52% 44%",
                  filter: "brightness(1.05) contrast(1.06) saturate(1.08)",
                }}
                data-testid="img-about-maquinas"
              />
            </div>
          </figure>

          <dl
            className="v-plata relative m-0 mt-3.5 grid grid-cols-3 gap-2.5 rounded-[18px] p-2.5 max-[420px]:gap-1.5 max-[420px]:p-2"
            style={{ boxShadow: "inset 0 1px 0 #fff, 0 20px 30px -24px rgba(var(--sombra-rgb), .5)" }}
            data-testid="panel-about-cifras"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="order-2 mt-2 text-center font-mono text-[11px] font-medium uppercase leading-[1.25] tracking-[.06em] max-[420px]:text-[9.5px] max-[420px]:tracking-[.02em]">
                  {stat.label}
                </dt>
                <CifraLed como="dd">{stat.value}</CifraLed>
              </div>
            ))}
          </dl>
        </div>

        {/* Texto */}
        <div>
          <Etiqueta>Sobre nosotros</Etiqueta>

          <h2 data-speakable className="v-h2">
            Quiénes somos en <em>Todo Vending CA</em>
          </h2>

          <p className="v-lead mt-6 text-tinta">
            En Todo Vending CA,{" "}
            <strong
              className="font-bold"
              style={{ background: "linear-gradient(transparent 64%, rgba(31, 111, 214, .2) 64%)" }}
            >
              no solo instalamos máquinas expendedoras, creamos experiencias
            </strong>
            . Somos un equipo apasionado por la innovación y la calidad.
          </p>

          <div className="max-w-[58ch] text-tinta-2">
            <p className="mt-4">
              Dedicados a transformar espacios con soluciones de vending personalizadas y de última generación.
              Nuestro objetivo es superar las expectativas de nuestros clientes, ofreciendo comodidad, variedad y un
              servicio excepcional.
            </p>
            <p className="mt-4">
              Nos enfocamos en complementar los servicios existentes, no en competir con ellos. Con Todo Vending CA,
              tendrás una experiencia de vending sin preocupaciones.
            </p>
          </div>

          <ul className="m-0 mt-7 flex list-none flex-wrap gap-2 p-0">
            {sellos.map((sello, indice) => (
              <li
                key={sello}
                className="flex items-center gap-2 rounded-full border border-linea-2 bg-superficie px-3.5 py-[9px] text-[14.5px] font-semibold"
              >
                <i
                  className={
                    indice % 2 === 0
                      ? "h-2 w-2 flex-none rounded-full bg-azul"
                      : "h-2 w-2 flex-none rounded-full bg-naranja"
                  }
                  aria-hidden="true"
                />
                {sello}
              </li>
            ))}
          </ul>

          <div className="mt-[34px] flex flex-wrap items-center gap-x-7 gap-y-[18px] border-t border-linea pt-7">
            <a
              className="v-btn v-btn--t"
              href={ENLACE_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Conoce más por WhatsApp"
              data-testid="link-about-whatsapp"
            >
              <Icono nombre="whatsapp" />
              Conoce más
            </a>
            <p className="m-0 flex items-center gap-3 text-[15px] text-tinta-2">
              <Icono nombre="pin" className="h-[26px] w-[26px] text-azul-t" />
              <span>
                <strong className="block text-tinta">Ubicados en Lechería</strong>
                Estado Anzoátegui, Venezuela
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
