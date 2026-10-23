import { ArrowRight, Coffee, Timer, Clock, CreditCard } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { waLink, WA_MESSAGES } from "@shared/site";

const points = [
  { icon: Coffee, title: "Grano recién molido", text: "Molino integrado. Nunca café instantáneo." },
  { icon: Timer, title: "Menos de 40 segundos", text: "De grano a taza, 10 bebidas en el menú." },
  { icon: Clock, title: "24 horas, 7 días", text: "Autónoma: también en guardias nocturnas." },
  { icon: CreditCard, title: "Sin efectivo", text: "Pago Móvil, débito, crédito y débito inmediato." },
];

// Bloque de la marca de café en el home: foto real de la estación y enlace
// a la página de marca (donde está la animación y el menú que convencen).
export function CafeOrienteFeature() {
  return (
    <section
      id="cafe-oriente"
      className="relative overflow-hidden py-20 text-cafe-crema md:py-28"
      style={{ background: "radial-gradient(70% 60% at 85% 40%, rgba(242,183,73,.16), transparent 60%), linear-gradient(135deg,#1a0d04 0%,#3D2314 55%,#4a2a16 100%)" }}
      aria-labelledby="cafe-titulo"
    >
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            <p className="eyebrow" style={{ color: "#F2B749" }}>
              Nuestra marca de café
            </p>
            <h2 id="cafe-titulo" className="mt-3 text-display-lg text-cafe-crema" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Café Oriente: café en grano, <span style={{ color: "#F2B749" }}>recién molido</span>, en tu empresa.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-cafe-crema/80">
              La estación automática Bianchi LEI 400 muele el grano en el momento de tu pedido y sirve capuchino, mocachino,
              café con leche, chocolate caliente y más. Para empresas y clínicas de Anzoátegui, la instalación es gratuita.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {points.map((p) => (
                <li key={p.title} className="flex items-start gap-3 rounded-2xl border border-cafe-dorado/20 bg-white/5 p-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(224,106,59,.28)" }}>
                    <p.icon className="h-4 w-4" style={{ color: "#F2B749" }} />
                  </span>
                  <div>
                    <p className="font-semibold leading-snug">{p.title}</p>
                    <p className="mt-0.5 text-sm text-cafe-crema/70">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/cafe-oriente" className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-transform hover:-translate-y-0.5" style={{ background: "#F2B749", color: "#241208", boxShadow: "0 10px 30px rgba(242,183,73,.35)" }} data-testid="link-cafe-oriente-cta">
                Conoce Café Oriente
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={waLink(WA_MESSAGES.cafeEmpresas)} target="_blank" rel="noopener noreferrer" className="btn-ghost-light h-12 px-6">
                <SiWhatsapp aria-hidden="true" className="h-4 w-4" />
                Pedir una estación
              </a>
            </div>
          </div>
          <div className="reveal lg:col-span-5">
            <div className="relative mx-auto max-w-xs lg:max-w-sm">
              <div className="absolute inset-x-6 bottom-4 top-10 rounded-[2rem]" style={{ background: "radial-gradient(circle at 50% 20%, rgba(242,183,73,.35), transparent 65%)", filter: "blur(30px)" }} aria-hidden="true" />
              <img
                src="/cafe-oriente/assets/maquina-v1.webp"
                width={713}
                height={1431}
                loading="lazy"
                decoding="async"
                alt="Estación de café Bianchi LEI 400 con la marca Café Oriente"
                className="relative mx-auto max-h-[560px] w-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
