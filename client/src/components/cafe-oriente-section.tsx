import { Badge } from "@/components/ui/badge";
import { Coffee, Clock, CreditCard, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Coffee,
    title: "Café en grano recién molido",
    description: "Molino integrado que muele al instante, nunca café instantáneo.",
  },
  {
    icon: Zap,
    title: "Lista en menos de 40 segundos",
    description: "De grano a taza en tiempo récord, sin esperas.",
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    description: "Autónoma y automática, opera incluso en turnos nocturnos.",
  },
  {
    icon: CreditCard,
    title: "100% sin efectivo",
    description: "Pago Móvil, débito, crédito y débito inmediato.",
  },
];

export function CafeOrienteSection() {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      data-testid="section-cafe-oriente"
      style={{ background: "linear-gradient(135deg, #1a0d04 0%, #3D2314 50%, #57301a 100%)" }}
    >
      {/* Decorative glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 50%, rgba(242,183,73,0.13) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-6 h-0.5 rounded-full"
                style={{ background: "#E06A3B" }}
              />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "#E06A3B" }}
              >
                Marca registrada
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#FFF6EA" }}
            >
              Café{" "}
              <span style={{ color: "#F2B749", fontStyle: "italic" }}>Oriente</span>
            </h2>

            <p
              className="text-base md:text-lg mb-8 max-w-md font-light leading-relaxed"
              style={{ color: "rgba(255,246,234,0.75)" }}
            >
              El respiro que tu jornada necesita. Café premium en grano recién
              molido servido por la estación automática Bianchi LEI 400, disponible
              en tu empresa o clínica.
            </p>

            {/* Benefits grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{
                    background: "rgba(255,246,234,0.05)",
                    border: "1px solid rgba(242,183,73,0.18)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(224,106,59,0.25)" }}
                  >
                    <b.icon className="w-4 h-4" style={{ color: "#F2B749" }} />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm leading-snug mb-0.5"
                      style={{ color: "#FFF6EA" }}
                    >
                      {b.title}
                    </p>
                    <p
                      className="text-xs font-light leading-relaxed"
                      style={{ color: "rgba(255,246,234,0.6)" }}
                    >
                      {b.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="/cafe-oriente"
              data-testid="link-cafe-oriente-cta"
              className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200"
              style={{
                background: "#E06A3B",
                color: "#fff",
                boxShadow: "0 10px 30px rgba(224,106,59,0.35)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#c85527";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#E06A3B";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              Conoce Café Oriente
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Right: machine visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div
              className="relative w-full max-w-sm rounded-3xl flex flex-col items-center justify-center py-14 px-8"
              style={{
                background: "linear-gradient(160deg, #2e1a0c, #241208)",
                border: "1px solid rgba(242,183,73,0.22)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
                minHeight: 380,
              }}
            >
              {/* Glow top */}
              <div
                className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{
                  height: "50%",
                  background:
                    "radial-gradient(ellipse at 50% 0%, rgba(242,183,73,0.22), transparent 65%)",
                }}
              />

              {/* Sun icon */}
              <div
                className="w-28 h-28 rounded-full mb-6 relative z-10 flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 50% 32%, #ffe9b0 0%, #F2B749 34%, #E06A3B 72%, rgba(224,106,59,0) 100%)",
                  filter: "blur(1px)",
                  boxShadow: "0 0 60px rgba(242,183,73,0.4)",
                }}
              />

              {/* Machine label */}
              <div className="relative z-10 text-center">
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-1"
                  style={{ color: "#F2B749" }}
                >
                  Estación automática
                </p>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#FFF6EA" }}
                >
                  Bianchi LEI 400
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,246,234,0.5)" }}
                >
                  Molino de grano integrado · Italia
                </p>
              </div>

              {/* Menu chips */}
              <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
                {["Capuchino", "Café con Leche", "Mocachino", "Latte Vainilla", "Café Marrón", "+ 5 más"].map((item) => (
                  <span
                    key={item}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      border: "1px solid rgba(242,183,73,0.3)",
                      color: "rgba(255,246,234,0.75)",
                      background: "rgba(255,246,234,0.04)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Status pill */}
              <div
                className="relative z-10 mt-6 flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(255,246,234,0.06)",
                  border: "1px solid rgba(242,183,73,0.2)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: "#7ddb6f",
                    boxShadow: "0 0 8px #7ddb6f",
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,246,234,0.8)" }}
                >
                  Disponible 24/7
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
