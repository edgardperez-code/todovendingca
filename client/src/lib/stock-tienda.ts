import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Stock de Gift Cards (GET /api/tienda/stock): cuantos codigos reales quedan
// disponibles de cada producto. El servidor lo acota a 99, asi que es solo para
// mostrar "Sin stock" y no dejar pedir mas de lo que hay; lo que de verdad
// decide es la reserva que hace el checkout (puede responder SIN_STOCK).
//
// SSR: igual que la config de la tienda, la consulta nunca corre en el
// servidor. El HTML del servidor y el primer render del cliente ven "sin
// datos" (cargado = false) y muestran el mismo estado neutro, asi que la
// hidratacion coincide. Los botones se habilitan cuando llega la respuesta.

export const CLAVE_STOCK = ["/api/tienda/stock"] as const;

export interface RespuestaStock {
  ok: true;
  stock: Record<string, number>;
}

function esRespuestaStock(cuerpo: unknown): cuerpo is RespuestaStock {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;
  const r = cuerpo as Record<string, unknown>;
  if (r.ok !== true || typeof r.stock !== "object" || r.stock === null) return false;
  return Object.values(r.stock as Record<string, unknown>).every(
    (v) => typeof v === "number" && Number.isFinite(v) && v >= 0,
  );
}

async function pedirStock(): Promise<RespuestaStock> {
  const respuesta = await fetch("/api/tienda/stock", { credentials: "include", cache: "no-store" });
  if (!respuesta.ok) throw new Error(`No se pudo leer el stock (HTTP ${respuesta.status})`);
  const cuerpo: unknown = await respuesta.json();
  if (!esRespuestaStock(cuerpo)) throw new Error("Stock con un formato inesperado");
  return cuerpo;
}

export interface ValorStock {
  // true cuando ya hay una respuesta del servidor.
  cargado: boolean;
  // true si no se pudo leer (sin conexion o error del servidor).
  conError: boolean;
  // Unidades disponibles del producto; null mientras no se sabe. Un producto
  // que no aparece en la respuesta cuenta como 0 (sin codigos cargados).
  stockDe: (productoId: string) => number | null;
  // Vuelve a pedir el stock (p. ej. despues de un SIN_STOCK del checkout).
  recargar: () => void;
}

export function useStock(): ValorStock {
  const queryClient = useQueryClient();
  const { data, isError } = useQuery({
    queryKey: CLAVE_STOCK,
    queryFn: pedirStock,
    // El stock cambia con cada venta: se revisa al volver a la pestana y cada
    // minuto mientras la pagina esta abierta.
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    retry: 2,
  });

  const stockDe = useCallback(
    (productoId: string): number | null => {
      if (!data) return null;
      const n = data.stock[productoId];
      return typeof n === "number" ? Math.max(0, Math.floor(n)) : 0;
    },
    [data],
  );

  const recargar = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: CLAVE_STOCK });
  }, [queryClient]);

  return { cargado: data !== undefined, conError: isError && data === undefined, stockDe, recargar };
}
