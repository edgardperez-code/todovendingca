// Pantallas LED de la máquina: letras cian (fuente Doto) sobre negro.
import type { ReactNode } from "react";

function unir(...clases: Array<string | undefined | false>) {
  return clases.filter(Boolean).join(" ");
}

export interface PantallaLedProps {
  /** Rótulo pequeño de arriba ("Selección"). */
  rotulo?: ReactNode;
  /** Valor grande ("--", "14", "07"). */
  valor: ReactNode;
  /** Línea de texto de abajo ("Elige un servicio"). */
  texto?: ReactNode;
  /** Anuncia los cambios a lectores de pantalla (aria-live="polite"). */
  vivo?: boolean;
  className?: string;
  "data-testid"?: string;
}

// Pantalla de la columna de control: rótulo, valor grande y una línea de texto.
export function PantallaLed({ rotulo, valor, texto, vivo = false, className, ...resto }: PantallaLedProps) {
  return (
    <div className={unir("v-pant", className)} aria-live={vivo ? "polite" : undefined} {...resto}>
      {rotulo != null && <small className="v-pant__rotulo">{rotulo}</small>}
      <output className="v-pant__valor">{valor}</output>
      <span className="v-pant__texto">{texto}</span>
    </div>
  );
}

export interface CifraLedProps {
  children: ReactNode;
  /** Etiqueta HTML; "span" por defecto ("dd" dentro de una <dl>). */
  como?: "span" | "dd" | "div" | "strong";
  className?: string;
  "data-testid"?: string;
}

// Cifra LED suelta ("100%", "24/7", "0", "07"). Va bien dentro de un .v-plata.
export function CifraLed({ children, como: Como = "span", className, ...resto }: CifraLedProps) {
  return (
    <Como className={unir("v-led", className)} {...resto}>
      {children}
    </Como>
  );
}

export interface ChipLedProps {
  children: ReactNode;
  /** Punto que late a la izquierda. */
  punto?: boolean;
  className?: string;
}

// Etiqueta LED pequeña con marco plateado (el "24/7" de la portada).
export function ChipLed({ children, punto = true, className }: ChipLedProps) {
  return (
    <span className={unir("v-ledchip", className)}>
      {punto && <i className="v-ledchip__punto" aria-hidden="true" />}
      {children}
    </span>
  );
}
