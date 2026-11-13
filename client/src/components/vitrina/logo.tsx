// Logo vectorial de Todo Vending CA (la maquinita con sus dos medias lunas),
// copiado de la maqueta Vitrina. Los colores salen de variables CSS para poder
// cambiarlos por contexto sin tocar el dibujo:
//   currentColor  cuerpo de la máquina y trazos
//   --l2 rojo-naranja · --l3 azul · --l4 amarillo · --l5 azul claro · --lf relleno interior
// .v-logo--mono lo deja a una tinta naranja (columna plateada) y dentro de un
// contenedor .v-oscuro pasa a blanco. Ver index.css.
import type { ReactNode, SVGProps } from "react";

// Solo los trazos (sin <svg>): sirve para anidar el logo dentro de otro SVG.
export function LogoTrazos() {
  return (
    <>
      <path d="M26.5 31.2H4.6a15.6 15.6 0 0 1 21.9-13.9z" fill="var(--l2,#F24A32)" />
      <path d="M26.5 43.6H4.6a15.6 15.6 0 0 0 21.9 13.9z" fill="var(--l3,#2D97D3)" />
      <path
        d="M13.5 37.3h13M8 65h18.5M15 71.6h11.5M32.3 84v4.3M67.8 84v4.3M28.8 88.3h7M64.3 88.3h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <rect x="26.5" y="6.5" width="46" height="77.5" fill="currentColor" />
      <path
        d="M31.2 11h36.500v23H31.2zM31.2 36.2h36.500v22.300H31.2zM31.2 60.2h36.500v4.500H31.2zM37 69.6h25.500v6H37z"
        fill="var(--lf,#fff)"
      />
      <path
        d="M38.9 16.3h4M55.900 16.3h4M55.900 38.8h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M36.3 33.5V21.8c0-2.600 2-4.300 4.600-4.300s4.600 1.700 4.600 4.300v11.700z" fill="var(--l2,#F24A32)" />
      <path d="M53.3 33.5V21.8c0-2.600 2-4.300 4.600-4.300s4.600 1.700 4.600 4.300v11.700z" fill="var(--l3,#2D97D3)" />
      <path d="M35.8 41.5h10.400v2H35.800zM36.3 45.2h9.400v12.800h-9.400z" fill="var(--l2,#F24A32)" />
      <path d="M53.3 58V44.2c0-2.600 2-4.200 4.600-4.200s4.600 1.600 4.600 4.200V58z" fill="var(--l4,#F6B21B)" />
      <path
        d="M31.8 33.5v-7.300a1.700 1.700 0 0 1 3.400 0v7.300M47.300 33.5v-7.300a1.700 1.700 0 0 1 3.400 0v7.300M64 33.5v-7.300a1.700 1.700 0 0 1 3.400 0v7.300M53.600 31.300c0-7 8.600-7 8.600 0M53.600 27.800c0-5 8.600-5 8.600 0M31.800 58v-7.300a1.700 1.700 0 0 1 3.400 0V58M47.300 58v-7.300a1.700 1.700 0 0 1 3.400 0V58M64 58v-7.300a1.700 1.700 0 0 1 3.400 0V58M36.700 56c0-7 8.600-7 8.600 0M36.700 52.500c0-5 8.600-5 8.600 0M53.600 56c0-7 8.600-7 8.600 0M53.600 52.500c0-5 8.600-5 8.600 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M31.2 34h36.500v2.200H31.200zM31.2 58.2h36.500v2H31.200z" fill="currentColor" />
      <rect x="74.5" y="6.5" width="18" height="77.5" fill="var(--l5,#7FBDE6)" />
      <rect x="74.5" y="15.5" width="18" height="36" fill="currentColor" />
      <rect x="77.5" y="17.8" width="12" height="23.6" fill="var(--lf,#fff)" />
      <path
        d="M81.3 38h.1M85.600 38h.1M79.200 55.200h2.400M84.900 55.200h2.400M79.200 59.500h2.400M84.900 59.500h2.400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path d="M92.500 67.500a8.300 8.300 0 1 0 0 16.300z" fill="var(--l2,#F24A32)" />
    </>
  );
}

export interface LogoTodoVendingProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** "color" (por defecto) o "mono": una sola tinta naranja, para fondos plateados. */
  variante?: "color" | "mono";
  /** Si se da, el logo deja de ser decorativo y se anuncia con este texto. */
  titulo?: string;
}

export function LogoTodoVending({ variante = "color", titulo, className, ...resto }: LogoTodoVendingProps) {
  const clases = ["v-logo", variante === "mono" ? "v-logo--mono" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <svg
      viewBox="0 0 96 96"
      className={clases}
      {...(titulo ? { role: "img", "aria-label": titulo } : { "aria-hidden": true })}
      focusable="false"
      {...resto}
    >
      <LogoTrazos />
    </svg>
  );
}

export interface MarcaProps {
  className?: string;
  /** Variante del logo. */
  variante?: "color" | "mono";
  /** Contenido extra a la derecha del nombre (p. ej. el monto en una gift card). */
  children?: ReactNode;
}

// Logo + "Todo / Vending CA" en dos líneas. No es un enlace: para enlazarla,
// pon la clase "v-marca" en tu <a>/<EnlaceInterno> y usa <MarcaContenido />.
export function Marca({ className, variante, children }: MarcaProps) {
  return (
    <span className={["v-marca", className ?? ""].filter(Boolean).join(" ")}>
      <MarcaContenido variante={variante} />
      {children}
    </span>
  );
}

export function MarcaContenido({ variante }: { variante?: "color" | "mono" }) {
  return (
    <>
      <LogoTodoVending variante={variante} />
      <span>
        Todo
        <br />
        Vending CA
      </span>
    </>
  );
}
