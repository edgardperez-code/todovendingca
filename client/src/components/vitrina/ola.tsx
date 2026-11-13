// La ola de marca (franjas naranja y azul que se desplazan despacio).
// Es puro CSS (.v-ola en index.css): se ve igual sin JavaScript y se queda
// quieta con "reducir movimiento".
import type { CSSProperties, ReactNode } from "react";

export interface OlaProps {
  /** "separador": banda entre secciones. "pie": mitad papel, mitad gabinete (antes del pie). */
  variante?: "separador" | "pie";
  /** Alto en px (56 por defecto). El ancho del patrón se ajusta en proporción. */
  alto?: number;
  /** Ancho del patrón en px, si no quieres el proporcional. */
  ancho?: number;
  /** Solo "pie": color de la mitad de arriba (el fondo de la sección anterior). */
  desde?: string;
  className?: string;
  style?: CSSProperties;
}

export function Ola({ variante = "separador", alto, ancho, desde, className, style }: OlaProps) {
  const variables: Record<string, string> = {};
  if (alto != null) {
    variables["--ola-alto"] = `${alto}px`;
    variables["--ola-ancho"] = `${ancho ?? Math.round((alto * 240) / 56)}px`;
  } else if (ancho != null) {
    variables["--ola-ancho"] = `${ancho}px`;
  }
  if (desde) variables["--ola-desde"] = desde;
  const clases = ["v-ola", variante === "pie" ? "v-ola--pie" : "", className ?? ""].filter(Boolean).join(" ");
  return <div className={clases} style={{ ...(variables as CSSProperties), ...style }} aria-hidden="true" />;
}

export interface OlaSubrayadoProps {
  children: ReactNode;
  className?: string;
}

// Palabra subrayada con la ola de dos trazos (la "vending" del título de portada).
export function OlaSubrayado({ children, className }: OlaSubrayadoProps) {
  return <span className={["v-sub-ola", className ?? ""].filter(Boolean).join(" ")}>{children}</span>;
}
