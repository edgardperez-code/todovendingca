import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { LogoTrazos } from "@/components/vitrina/logo";
import { PRODUCTOS } from "@shared/catalogo";

type Tamano = "sm" | "md" | "lg";
type Acabado = "plata" | "azul" | "tinta";

// Acabados de la maqueta Vitrina, en el orden del abanico del inicio: la
// primera Gift Card del catálogo es plateada, la segunda azul y la tercera
// tinta de gabinete. Así cada monto se ve igual en el inicio y en la Tienda.
const ACABADOS: Acabado[] = ["plata", "azul", "tinta"];
const MONTOS_CATALOGO: number[] = PRODUCTOS.filter((p) => p.esGiftCard).map((p) => p.precioUsd);

function acabadoDe(montoUsd: number): Acabado {
  const posicion = MONTOS_CATALOGO.indexOf(montoUsd);
  return posicion === -1 ? "tinta" : ACABADOS[posicion % ACABADOS.length];
}

// Colores fijos de "máquina": no cambian con el tema (sobre plata el texto es
// siempre marino). --lf / --l3 / --l5 son los rellenos del logo (ver vitrina/logo).
const caras: Record<Acabado, CSSProperties> = {
  plata: {
    background: "linear-gradient(120deg, var(--plata-b), var(--plata-a) 40%, var(--plata-c))",
    color: "#1B263C",
    border: "1px solid var(--plata-borde)",
    ["--lf" as string]: "#fff",
  },
  azul: {
    background: "#1B5FC0",
    color: "#fff",
    ["--lf" as string]: "#1B5FC0",
    ["--l3" as string]: "#A9CCFF",
    ["--l5" as string]: "#A9CCFF",
  },
  tinta: {
    background: "var(--gabinete)",
    color: "#fff",
    border: "1px solid var(--gabinete-borde)",
    ["--lf" as string]: "var(--gabinete)",
  },
};

// Dibujo de la Gift Card (maqueta Vitrina): marca arriba, monto grande y la ola
// de marca al pie. Es solo decorativo: el precio que vale siempre sale del
// catálogo. Todo se mide en cqw (ancho de la propia tarjeta), así que mantiene
// la proporción de una tarjeta física (85,6 x 54 mm) a cualquier tamaño.
export function GiftCardVisual({
  montoUsd,
  tamano = "md",
  className,
}: {
  montoUsd: number;
  tamano?: Tamano;
  className?: string;
}) {
  const monto = Number.isInteger(montoUsd) ? String(montoUsd) : montoUsd.toFixed(2);
  // En miniatura (carrito) solo caben el logo y el monto.
  const mini = tamano === "sm";

  return (
    <div
      role="img"
      aria-label={`Gift Card Todo Vending de $${monto}`}
      className={cn("relative aspect-[1.586/1] w-full select-none", className)}
      style={{ containerType: "inline-size" }}
    >
      <div
        className="absolute inset-0 flex flex-col justify-between overflow-hidden"
        style={{
          ...caras[acabadoDe(montoUsd)],
          borderRadius: "5.26cqw",
          padding: "6.84cqw 7.37cqw",
          boxShadow: mini
            ? "0 6px 12px -8px rgba(var(--sombra-rgb), .6)"
            : "0 30px 50px -28px rgba(var(--sombra-rgb), .6)",
        }}
      >
        {/* Marca y monto pequeño */}
        <div
          className="flex items-center whitespace-nowrap font-display font-bold uppercase"
          style={{ gap: "2.63cqw", fontSize: "3.29cqw", lineHeight: 1.12, letterSpacing: ".1em" }}
        >
          <svg
            viewBox="0 0 96 96"
            aria-hidden="true"
            focusable="false"
            className="flex-none"
            style={{ width: mini ? "14cqw" : "11.05cqw", height: mini ? "14cqw" : "11.05cqw" }}
          >
            <LogoTrazos />
          </svg>
          {!mini && (
            <>
              <span>
                Todo
                <br />
                Vending CA
              </span>
              <span
                className="ml-auto font-mono font-semibold"
                style={{ fontSize: "4.74cqw", lineHeight: 1, letterSpacing: ".02em" }}
              >
                ${monto}
              </span>
            </>
          )}
        </div>

        {/* Monto grande. data-gc-monto permite ocultarlo en las tarjetas
            traseras del abanico del inicio, como en la maqueta. */}
        <div
          data-gc-monto=""
          className="font-display font-bold"
          style={{
            fontSize: mini ? "22cqw" : "17.76cqw",
            lineHeight: 1,
            letterSpacing: "-.04em",
            marginBottom: mini ? "9cqw" : "11.08cqw",
          }}
        >
          {!mini && (
            <span
              className="block font-mono font-normal uppercase"
              style={{ fontSize: "3.03cqw", lineHeight: 1, letterSpacing: ".22em", marginBottom: "2.1cqw" }}
            >
              Gift Card
            </span>
          )}
          ${monto}
        </div>

        {/* Ola de marca al pie */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{ height: "23%", background: "var(--ola) 0 50% / 55.3cqw 100% repeat-x" }}
        />
      </div>
    </div>
  );
}
