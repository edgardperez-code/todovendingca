// Datos que el servidor precarga para el SSR de algunas paginas (por ahora el
// blog). En el servidor llegan por props a entry-server; en el navegador se leen
// de window.__DATOS_INICIALES__, que el servidor deja en el HTML. Asi el primer
// render del cliente es identico al del servidor y la hidratacion coincide.
import { createContext, useContext, type ReactNode } from "react";
import type { ArticuloPublico, ArticuloResumen } from "@shared/blog";

export interface DatosIniciales {
  lista?: ArticuloResumen[];
  articulo?: { slug: string; datos: ArticuloPublico | null };
}

const Contexto = createContext<DatosIniciales | null>(null);

export function DatosInicialesProvider({ datos, children }: { datos: DatosIniciales | null; children: ReactNode }) {
  return <Contexto.Provider value={datos}>{children}</Contexto.Provider>;
}

export function useDatosIniciales(): DatosIniciales | null {
  return useContext(Contexto);
}

export function leerDatosDelNavegador(): DatosIniciales | null {
  if (typeof window === "undefined") return null;
  const datos = (window as unknown as { __DATOS_INICIALES__?: DatosIniciales }).__DATOS_INICIALES__;
  return datos ?? null;
}
