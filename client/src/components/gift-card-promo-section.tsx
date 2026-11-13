import { EnlaceInterno } from "@/lib/navegacion";
import { GiftCardVisual } from "@/components/gift-card-visual";
import { Etiqueta } from "@/components/vitrina/etiqueta";
import { Icono, type NombreIcono } from "@/components/vitrina/iconos";
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

const puntos: { icono: NombreIcono; texto: string }[] = [
  { icono: "movil", texto: "Pagas en bolívares con Débito Inmediato o Pago Móvil" },
  { icono: "sinreg", texto: "Sin registrarte: solo tu nombre y correo" },
  { icono: "regalo", texto: "Recibes tus códigos en pantalla al confirmar el pago" },
];

// Colocación de cada tarjeta del abanico según cuántas haya (1 a 3). Con tres
// son las medidas de la maqueta Vitrina. Las clases van escritas completas
// para que Tailwind las encuentre.
const ABANICOS: Record<number, string[]> = {
  1: ["left-[12%] top-[19%] [transform:rotate(-3deg)]"],
  2: [
    "left-[4%] top-[6%] [transform:rotate(-7deg)] group-hover:[transform:rotate(-10deg)_translate(-3%,-4%)] group-focus-visible:[transform:rotate(-10deg)_translate(-3%,-4%)]",
    "left-[20%] top-[32%] [transform:rotate(4deg)] group-hover:[transform:rotate(6deg)_translate(2%,3%)] group-focus-visible:[transform:rotate(6deg)_translate(2%,3%)]",
  ],
  3: [
    "left-0 top-0 [transform:rotate(-9deg)] group-hover:[transform:rotate(-12deg)_translate(-3%,-4%)] group-focus-visible:[transform:rotate(-12deg)_translate(-3%,-4%)]",
    "left-[11%] top-[19%] [transform:rotate(-2deg)]",
    "left-[23%] top-[38%] [transform:rotate(6deg)] group-hover:[transform:rotate(8deg)_translate(2%,3%)] group-focus-visible:[transform:rotate(8deg)_translate(2%,3%)]",
  ],
};

// Seccion breve del home que lleva a la pagina de la Gift Card.
export function GiftCardPromoSection() {
  if (giftCards.length === 0) return null;
  // En el abanico: la mas baja atras a la izquierda y la mas alta al frente.
  const abanico = giftCards.slice(0, 3);
  const colocacion = ABANICOS[abanico.length];

  return (
    <section
      id="gift-cards"
      className="v-sec v-sec--2"
      aria-labelledby="gift-cards-titulo"
      data-testid="section-gift-card-promo"
    >
      <div className="v-cont grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-[clamp(40px,6vw,96px)] max-[899px]:grid-cols-[minmax(0,1fr)]">
        <div>
          <Etiqueta>Nuevo · Tarjeta de regalo</Etiqueta>
          <h2 className="v-h2" id="gift-cards-titulo">
            Regala <em>Todo Vending</em>
          </h2>
          <p className="v-lead mt-5">
            Gift Cards de {MONTOS}, el detalle perfecto para tu equipo, tus clientes o alguien
            especial: snacks, bebidas y café en nuestras máquinas y en Café Oriente. Se pagan en
            bolívares a tasa BCV del día.
          </p>
          <ul className="mb-[34px] mt-7 border-t border-linea">
            {puntos.map((p, i) => (
              <li
                key={p.texto}
                className="flex items-center gap-3.5 border-b border-linea py-3.5 text-[15.5px] font-medium leading-[1.6] text-tinta"
              >
                <Icono
                  nombre={p.icono}
                  className={i === 1 ? "h-6 w-6 text-naranja-h" : "h-6 w-6 text-azul-t"}
                />
                {p.texto}
              </li>
            ))}
          </ul>
          <EnlaceInterno
            href="/gift-card"
            data-testid="link-gift-card-promo"
            className="v-btn v-btn--p max-[899px]:w-full max-[899px]:max-w-[420px]"
          >
            Comprar Gift Cards
            <Icono nombre="flecha" flecha />
          </EnlaceInterno>
        </div>

        <EnlaceInterno
          href="/gift-card"
          aria-label={`Ver las Gift Cards Todo Vending de ${MONTOS}`}
          className="group relative mx-auto block aspect-[1.16/1] w-full max-w-[500px] rounded-2xl no-underline max-[899px]:max-w-[440px]"
        >
          {abanico.map((producto, i) => {
            // Solo la tarjeta del frente enseña el monto grande; en las de
            // atrás quedaría cortado por la que tienen encima.
            const alFrente = i === abanico.length - 1;
            return (
              <span
                key={producto.id}
                aria-hidden="true"
                className={`absolute block w-[76%] transition-transform [transition-duration:450ms] [transition-timing-function:cubic-bezier(.2,.9,.3,1)] motion-reduce:transition-none ${colocacion[i]} ${alFrente ? "" : "[&_[data-gc-monto]]:invisible"}`}
                style={{ zIndex: i + 1 }}
              >
                <GiftCardVisual montoUsd={producto.precioUsd} tamano="md" />
              </span>
            );
          })}
        </EnlaceInterno>
      </div>
    </section>
  );
}
