// La columna plateada de control de la máquina: marca arriba, lo que le pases
// en medio (pantalla, teclado, llamada a la acción) y la ola al pie.
import type { ReactNode } from "react";
import { LogoTodoVending } from "./logo";
import { Ola } from "./ola";

function unir(...clases: Array<string | undefined | false>) {
  return clases.filter(Boolean).join(" ");
}

export interface ColumnaControlProps {
  children: ReactNode;
  /** Nombre accesible del panel. */
  etiqueta?: string;
  /** Logo a una tinta + "Todo Vending CA" arriba. */
  conMarca?: boolean;
  /** Ola de marca al pie. */
  conOla?: boolean;
  className?: string;
  "data-testid"?: string;
}

// Dentro de la columna el texto es siempre oscuro (la plata no cambia con el
// tema). Clases de apoyo para los hijos: v-columna__ayuda (nota mono centrada)
// y v-columna__cta (bloque final con <h3>, <p> y un .v-btn a todo el ancho).
// Por debajo de 1200 px se acuesta: marca arriba, hijos en dos columnas, y el
// teclado y la ayuda se ocultan (como en la maqueta).
export function ColumnaControl({
  children,
  etiqueta = "Panel de la vitrina",
  conMarca = true,
  conOla = true,
  className,
  ...resto
}: ColumnaControlProps) {
  return (
    <aside className={unir("v-columna", className)} aria-label={etiqueta} {...resto}>
      {conMarca && (
        <p className="v-columna__marca" aria-hidden="true">
          <LogoTodoVending variante="mono" />
          <span>
            Todo
            <br />
            Vending CA
          </span>
        </p>
      )}
      {children}
      {conOla && <Ola />}
    </aside>
  );
}

/** Tecla pulsada: un dígito, "borrar" (tecla C) o "siguiente" (tecla #). */
export type TeclaSeleccion = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "borrar" | "siguiente";

const TECLAS: ReadonlyArray<{ tecla: TeclaSeleccion; texto: string; etiqueta?: string }> = [
  { tecla: "1", texto: "1" },
  { tecla: "2", texto: "2" },
  { tecla: "3", texto: "3" },
  { tecla: "4", texto: "4" },
  { tecla: "5", texto: "5" },
  { tecla: "6", texto: "6" },
  { tecla: "7", texto: "7" },
  { tecla: "8", texto: "8" },
  { tecla: "9", texto: "9" },
  { tecla: "borrar", texto: "C", etiqueta: "Borrar selección" },
  { tecla: "0", texto: "0" },
  { tecla: "siguiente", texto: "#", etiqueta: "Siguiente servicio" },
];

export interface TecladoSeleccionProps {
  onTecla: (tecla: TeclaSeleccion) => void;
  /** Nombre accesible del grupo de teclas. */
  etiqueta?: string;
  className?: string;
}

// Teclado redondo de 12 teclas (1–9, C, 0, #). No guarda estado: avisa cada
// pulsación y quien lo usa decide qué mostrar en la <PantallaLed>.
export function TecladoSeleccion({
  onTecla,
  etiqueta = "Teclado de selección: marca el código de un servicio para resaltarlo",
  className,
}: TecladoSeleccionProps) {
  return (
    <div className={unir("v-teclado", className)} role="group" aria-label={etiqueta}>
      {TECLAS.map(({ tecla, texto, etiqueta: nombre }) => (
        <button key={tecla} type="button" aria-label={nombre} data-tecla={tecla} onClick={() => onTecla(tecla)}>
          {texto}
        </button>
      ))}
    </div>
  );
}
