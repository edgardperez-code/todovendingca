// La bandeja de la máquina: el par de espirales que sostiene el producto, el
// código de selección (10, 12, 14…) y el riel plateado de precios.
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

function unir(...clases: Array<string | undefined | false>) {
  return clases.filter(Boolean).join(" ");
}

export interface EspiralProps {
  className?: string;
  style?: CSSProperties;
}

// Par de espirales (68×24 px). Decorativo. El mismo dibujo está como fondo en
// la variable CSS --espiral, por si conviene más en un ::after.
export function Espiral({ className, style }: EspiralProps) {
  return (
    <svg viewBox="0 0 62 22" className={unir("v-espiral", className)} style={style} aria-hidden="true" focusable="false">
      <g fill="none">
        <ellipse cx="18.5" cy="11" rx="11" ry="8.5" stroke="#B4B9BC" strokeWidth="1.1" />
        <ellipse cx="15" cy="11" rx="11" ry="8.5" stroke="#858B90" strokeWidth="1.5" />
        <ellipse cx="46.5" cy="11" rx="11" ry="8.5" stroke="#B4B9BC" strokeWidth="1.1" />
        <ellipse cx="43" cy="11" rx="11" ry="8.5" stroke="#858B90" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export interface CodigoSeleccionProps {
  codigo: string | number;
  /** Por defecto es decorativo (aria-hidden): el nombre ya lo dice el texto de al lado. */
  decorativo?: boolean;
  className?: string;
}

// Plaquita negra con el código de una selección.
export function CodigoSeleccion({ codigo, decorativo = true, className }: CodigoSeleccionProps) {
  return (
    <span className={unir("v-tag", className)} aria-hidden={decorativo ? true : undefined}>
      {codigo}
    </span>
  );
}

type AtributosBoton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  "data-testid"?: string;
};

export interface RielSeleccionProps {
  /** Código de la selección; si falta, el riel va sin plaquita. */
  codigo?: string | number;
  /** Nombre corto que va en el riel ("Snacks"). */
  children: ReactNode;
  /** Resalta el código en naranja y enciende el testigo azul. */
  activo?: boolean;
  /** Puntito testigo a la derecha. */
  testigo?: boolean;
  /** Si se pasa, el riel es un <button type="button"> con estos atributos (onClick, aria-pressed…). */
  boton?: AtributosBoton;
  className?: string;
}

// Riel plateado al pie de una bandeja: código + nombre + testigo.
export function RielSeleccion({ codigo, children, activo = false, testigo = true, boton, className }: RielSeleccionProps) {
  const clases = unir("v-riel", activo && "v-riel--activo", className);
  const contenido = (
    <>
      {codigo != null && <CodigoSeleccion codigo={codigo} />}
      {children}
      {testigo && <span className="v-riel__testigo" aria-hidden="true" />}
    </>
  );
  if (boton) {
    return (
      <button type="button" {...boton} className={clases}>
        {contenido}
      </button>
    );
  }
  return <div className={clases}>{contenido}</div>;
}
