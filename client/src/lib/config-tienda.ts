import { useQuery } from "@tanstack/react-query";
import type { ConfigTienda, EntornoSpidi } from "@shared/tienda";

// Config publica de la tienda (GET /api/tienda/config): si los pagos son de
// prueba (todo lo que no sea produccion confirmada) y contra que entorno de
// SPIDI se cobra. Es el modo del servidor AHORA: sirve para la franja general;
// un pedido ya hecho se rotula con su propio modoPrueba (PedidoPublico).
//
// SSR: la consulta nunca corre en el servidor (react-query solo pide datos
// despues de montar), asi que el HTML del servidor y el primer render del
// cliente ven "sin datos" y no muestran el aviso: coinciden y la hidratacion no
// falla. El aviso aparece en cuanto llega la respuesta. Al navegar entre las
// paginas de la tienda la respuesta ya esta en cache y el aviso sale de una vez.

// Un Record (y no una lista) para que TypeScript avise si se agrega un entorno
// en shared/tienda.ts y no se suma aqui: una config con un entorno que no este
// en la lista se descartaria y la franja no apareceria. "desconocido" es un
// entorno mas (el servidor no sabe si los pagos serian reales y cierra el
// checkout): llega con modoPrueba true, asi que tambien muestra la franja.
const ENTORNOS: Record<EntornoSpidi, true> = {
  simulador: true,
  sandbox: true,
  prueba: true,
  desconocido: true,
  produccion: true,
};

function esConfigTienda(cuerpo: unknown): cuerpo is ConfigTienda {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;
  const r = cuerpo as Record<string, unknown>;
  return (
    typeof r.modoPrueba === "boolean" &&
    typeof r.entorno === "string" &&
    Object.prototype.hasOwnProperty.call(ENTORNOS, r.entorno)
  );
}

async function pedirConfigTienda(): Promise<ConfigTienda> {
  const respuesta = await fetch("/api/tienda/config", { credentials: "include", cache: "no-store" });
  if (!respuesta.ok) throw new Error(`No se pudo leer la configuración de la tienda (HTTP ${respuesta.status})`);
  const cuerpo: unknown = await respuesta.json();
  if (!esConfigTienda(cuerpo)) throw new Error("Configuración de la tienda con un formato inesperado");
  return cuerpo;
}

// true solo cuando el servidor confirmo que esta en modo prueba contra un
// entorno de prueba CONOCIDO. Mientras carga (y en el SSR) devuelve false: el
// aviso es informativo, lo que de verdad protege es que el servidor emite esas
// Gift Cards como "prueba" y el canje las rechaza. Con entorno "desconocido"
// tampoco se muestra: ahi el checkout esta cerrado y no se sabe si los pagos
// serian reales, asi que decir "los pagos no son reales" seria falso.
export function useModoPrueba(): boolean {
  const { data } = useQuery({
    queryKey: ["/api/tienda/config"],
    queryFn: pedirConfigTienda,
    // Cambia solo con un despliegue: basta con revisarlo cada pocos minutos.
    staleTime: 5 * 60_000,
    retry: 2,
  });
  return data?.modoPrueba === true && data.entorno !== "desconocido";
}
