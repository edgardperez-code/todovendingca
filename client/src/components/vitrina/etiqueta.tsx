// Cómo se titula una sección en el diseño Vitrina:
//   etiqueta (ola corta + texto mono en mayúsculas)  →  <h2 class="v-h2">  →  lead opcional
import type { ReactNode } from "react";

export interface EtiquetaProps {
  children: ReactNode;
  className?: string;
  /** Etiqueta HTML; "p" por defecto. */
  como?: "p" | "span" | "div";
}

// Rótulo que va encima del título ("Sobre nosotros", "Nuestros servicios"…).
export function Etiqueta({ children, className, como: Como = "p" }: EtiquetaProps) {
  return (
    <Como className={["v-etq", className ?? ""].filter(Boolean).join(" ")}>
      <i className="v-etq__o" aria-hidden="true" />
      {children}
    </Como>
  );
}

export interface CabeceraSeccionProps {
  /** Texto de la etiqueta. */
  etiqueta: ReactNode;
  /** Contenido del <h2>. Usa <em> para el azul y <em className="n"> para el naranja. */
  titulo: ReactNode;
  /** Párrafo de apoyo a la derecha (debajo en móvil). */
  lead?: ReactNode;
  /** id del <h2> (para aria-labelledby de la sección). */
  idTitulo?: string;
  /** data-testid del <h2>, si la sección ya tenía uno. */
  testIdTitulo?: string;
  className?: string;
}

// Cabecera a dos columnas: etiqueta + título a la izquierda, lead a la derecha.
// Las secciones con otra composición (Nosotros, FAQ, Contacto) usan <Etiqueta>
// y <h2 className="v-h2"> sueltos.
export function CabeceraSeccion({ etiqueta, titulo, lead, idTitulo, testIdTitulo, className }: CabeceraSeccionProps) {
  return (
    <div className={["v-cab-sec", className ?? ""].filter(Boolean).join(" ")}>
      <div>
        <Etiqueta>{etiqueta}</Etiqueta>
        <h2 className="v-h2" id={idTitulo} data-testid={testIdTitulo}>
          {titulo}
        </h2>
      </div>
      {lead != null && <p className="v-lead">{lead}</p>}
    </div>
  );
}
