import { Icono } from "@/components/vitrina/iconos";

// Avance de Café Oriente en el inicio. Lleva la identidad propia de la marca
// (tostados, ámbar y Fraunces), no la paleta Vitrina, y enlaza a /cafe-oriente.
// Los colores son fijos: el bloque se ve igual en tema claro y oscuro.

const benefits = [
  {
    title: "Café en grano recién molido",
    description: "Molino integrado que muele al instante, nunca café instantáneo.",
  },
  {
    title: "Lista en menos de 40 segundos",
    description: "De grano a taza en tiempo récord, sin esperas.",
  },
  {
    title: "Disponible 24/7",
    description: "Autónoma y automática, opera incluso en turnos nocturnos.",
  },
  {
    title: "100% sin efectivo",
    description: "Pago Móvil, débito, crédito y débito inmediato.",
  },
];

const menu = ["Capuchino", "Café con Leche", "Mocachino", "Latte Vainilla", "Café Marrón", "+ 5 más"];

export function CafeOrienteSection() {
  return (
    <section
      id="cafe-oriente"
      className="v-sec v-sec--pegada"
      aria-labelledby="cafe-oriente-titulo"
      data-testid="section-cafe-oriente"
    >
      <div className="v-cont">
        <div
          className="v-oscuro relative grid grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] items-center gap-[clamp(32px,5vw,72px)] overflow-hidden rounded-[32px] p-[clamp(32px,6vw,80px)] text-[#FFF6EA] max-[899px]:mx-[calc(var(--pad)*-0.5)] max-[899px]:grid-cols-[minmax(0,1fr)] max-[899px]:rounded-[24px]"
          style={{ background: "linear-gradient(135deg, #1a0d04 0%, #3D2314 50%, #57301a 100%)" }}
        >
          {/* Resplandor ámbar decorativo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 80% 50%, rgba(242,183,73,.14), transparent 70%)",
            }}
          />

          {/* Texto */}
          <div className="relative">
            <p className="mb-5 flex items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[.2em] text-[#F08A5E]">
              <span aria-hidden="true" className="h-0.5 w-[26px] rounded-[2px] bg-[#E06A3B]" />
              Marca registrada
            </p>

            <h2
              id="cafe-oriente-titulo"
              className="text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-none tracking-[-.02em]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Café <em className="italic text-[#F2B749]">Oriente</em>
            </h2>

            <p className="mt-[18px] max-w-[46ch] text-[1.06rem] text-[rgba(255,246,234,.8)]">
              El respiro que tu jornada necesita. Café premium en grano recién
              molido servido por la estación automática Bianchi LEI 400, disponible
              en tu empresa o clínica.
            </p>

            <ul className="mb-[34px] mt-[30px] grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[rgba(242,183,73,.2)] bg-[rgba(242,183,73,.2)] max-[520px]:grid-cols-1">
              {benefits.map((b) => (
                <li key={b.title} className="bg-[#2a1709] px-[18px] py-4">
                  <strong className="block text-[15px] font-bold leading-[1.3]">{b.title}</strong>
                  <span className="mt-1 block text-[13.5px] leading-[1.45] text-[rgba(255,246,234,.68)]">
                    {b.description}
                  </span>
                </li>
              ))}
            </ul>

            {/* /cafe-oriente no es ruta de React: lo sirve Express, por eso <a>. */}
            <a
              href="/cafe-oriente"
              data-testid="link-cafe-oriente-cta"
              className="v-btn rounded-full border-[#E06A3B] bg-[#E06A3B] px-7 text-[#1F0F06] shadow-[0_10px_30px_rgba(224,106,59,.35)] hover:border-[#EE8256] hover:bg-[#EE8256] max-[520px]:w-full"
            >
              Conoce Café Oriente
              <Icono nombre="flecha" flecha />
            </a>
          </div>

          {/* Ficha de la estación */}
          <div
            className="relative rounded-3xl border border-[rgba(242,183,73,.25)] px-[clamp(20px,2.6vw,32px)] py-[clamp(26px,3.4vw,40px)] text-center shadow-[0_30px_60px_rgba(0,0,0,.4)]"
            style={{ background: "linear-gradient(160deg, #2e1a0c, #241208)" }}
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-[22px] h-24 w-24 rounded-full shadow-[0_0_60px_rgba(242,183,73,.35)]"
              style={{
                background:
                  "radial-gradient(circle at 50% 32%, #ffe9b0 0%, #F2B749 34%, #E06A3B 72%, rgba(224,106,59,0) 100%)",
              }}
            />
            <p className="text-[11.5px] font-semibold uppercase leading-none tracking-[.2em] text-[#F2B749]">
              Estación automática
            </p>
            <p
              className="mb-1.5 mt-2 text-[1.7rem] font-semibold leading-[1.1]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Bianchi LEI 400
            </p>
            <p className="text-[13px] text-[rgba(255,246,234,.62)]">Molino de grano integrado · Italia</p>

            <ul className="mt-[22px] flex flex-wrap justify-center gap-2" aria-label="Parte del menú">
              {menu.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[rgba(242,183,73,.3)] px-3 py-[5px] text-[13px] text-[rgba(255,246,234,.82)]"
                >
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-[22px] inline-flex items-center gap-2 rounded-full border border-[rgba(242,183,73,.22)] px-4 py-2 text-[13px] font-medium">
              <span
                aria-hidden="true"
                className="h-2 w-2 flex-none rounded-full bg-[#7ddb6f] shadow-[0_0_8px_#7ddb6f]"
              />
              Disponible 24/7
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
