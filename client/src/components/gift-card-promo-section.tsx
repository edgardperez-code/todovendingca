import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Smartphone, UserX } from "lucide-react";
// motion propio: el contenido sale visible desde el servidor (ver lib/movimiento).
import { motion } from "@/lib/movimiento";
import { EnlaceInterno } from "@/lib/navegacion";
import { GiftCardVisual } from "@/components/gift-card-visual";
import { PRODUCTOS } from "@shared/catalogo";

// Montos desde el catalogo para que la promocion nunca muestre otros.
const giftCards = PRODUCTOS.filter((p) => p.esGiftCard);

function montoCorto(monto: number): string {
  return Number.isInteger(monto) ? `$${monto}` : `$${monto.toFixed(2)}`;
}

// "$10, $25 y $50"
const MONTOS = (() => {
  const montos = giftCards.map((p) => montoCorto(p.precioUsd));
  if (montos.length <= 1) return montos.join("");
  return `${montos.slice(0, -1).join(", ")} y ${montos[montos.length - 1]}`;
})();

const puntos = [
  { icon: Smartphone, texto: "Pagas en bolívares con Débito Inmediato o Pago Móvil" },
  { icon: UserX, texto: "Sin registrarte: solo tu nombre y correo" },
  { icon: Gift, texto: "Recibes tus códigos en pantalla al confirmar el pago" },
];

// Seccion breve del home que lleva a la pagina de la Gift Card.
export function GiftCardPromoSection() {
  if (giftCards.length === 0) return null;
  // En el abanico: la mas baja atras a la izquierda y la mas alta al frente.
  const abanico = giftCards.slice(0, 3);

  return (
    <section className="py-20 md:py-28 overflow-hidden" data-testid="section-gift-card-promo">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4" variant="secondary">
              Nuevo · Tarjeta de regalo
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground">Regala</span>{" "}
              <span className="text-primary">Todo Vending</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-xl">
              Gift Cards de {MONTOS}, el detalle perfecto para tu equipo, tus clientes o alguien
              especial: snacks, bebidas y café en nuestras máquinas y en Café Oriente. Se pagan en
              bolívares a tasa BCV del día.
            </p>
            <ul className="space-y-3 mb-8">
              {puntos.map((p) => (
                <li key={p.texto} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-4 h-4 text-primary" />
                  </span>
                  {p.texto}
                </li>
              ))}
            </ul>
            <EnlaceInterno href="/gift-card" data-testid="link-gift-card-promo">
              <Button size="lg" className="gap-2 glow-primary">
                Comprar Gift Cards
                <ArrowRight className="h-4 w-4" />
              </Button>
            </EnlaceInterno>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <EnlaceInterno
              href="/gift-card"
              aria-label="Ver las Gift Cards Todo Vending"
              className="group relative block w-full max-w-md aspect-[1.3/1]"
            >
              {abanico.map((producto, i) => {
                // Posiciones del abanico segun cuantas tarjetas haya (1 a 3).
                const giros =
                  abanico.length === 1
                    ? ["-rotate-3"]
                    : abanico.length === 2
                      ? ["-rotate-6", "rotate-3"]
                      : ["-rotate-12", "-rotate-2", "rotate-6"];
                const desplazamientos =
                  abanico.length === 1
                    ? ["left-0 top-[10%]"]
                    : abanico.length === 2
                      ? ["left-0 top-0", "left-[12%] top-[22%]"]
                      : ["left-0 top-0", "left-[10%] top-[14%]", "left-[20%] top-[28%]"];
                return (
                  <div
                    key={producto.id}
                    className={`absolute w-[80%] transition-transform duration-300 group-hover:rotate-0 ${giros[i]} ${desplazamientos[i]}`}
                    style={{ zIndex: i + 1 }}
                  >
                    <GiftCardVisual montoUsd={producto.precioUsd} tamano="md" />
                  </div>
                );
              })}
            </EnlaceInterno>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
