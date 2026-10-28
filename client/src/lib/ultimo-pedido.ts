// Recuerda el ultimo pedido que este navegador mando a pagar, para:
// - saber en /pago/resultado que ese pedido salio de ESTE carrito (y vaciarlo
//   una sola vez cuando se confirme el pago);
// - poder volver a consultar el estado si el cliente regresa sin la URL de
//   resultado (por ejemplo, con el boton "atras" desde la pagina de SPIDI);
// - no perder el acceso a un pedido ya pagado: al confirmarse el pago NO se
//   borra, se marca pagado. Asi, si el comprador cierra la pestana, puede
//   volver a sus codigos desde /carrito o /pago/resultado.
// Solo se usa en el navegador (efectos y manejadores), nunca durante el render.

const CLAVE_STORAGE = "tv-ultimo-pedido";

// Pasado este tiempo, un pago iniciado y sin confirmar ya no se anuncia en
// /carrito: la sesion de SPIDI vencio hace mucho y el aviso solo confundiria.
const VIGENCIA_AVISO_PENDIENTE_MS = 24 * 60 * 60 * 1000;

// Lo minimo para abrir la pagina de resultado de un pedido.
export interface ReferenciaPedido {
  pedidoId: string;
  clave: string;
}

export interface UltimoPedido extends ReferenciaPedido {
  // true cuando /pago/resultado ya vio el pedido pagado (y vacio el carrito).
  pagado: boolean;
  // Cuando se mando a pagar (ISO 8601). null si no se sabe (dato viejo o
  // editado a mano): se trata como antiguo.
  guardadoEn: string | null;
}

export type AvisoUltimoPedido = "pagado" | "pendiente";

export function leerUltimoPedido(): UltimoPedido | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return null;
    const datos: unknown = JSON.parse(crudo);
    if (typeof datos !== "object" || datos === null) return null;
    const { pedidoId, clave, pagado, guardadoEn } = datos as Record<string, unknown>;
    if (typeof pedidoId !== "string" || typeof clave !== "string") return null;
    if (pedidoId.length === 0 || clave.length === 0) return null;
    return {
      pedidoId,
      clave,
      // Lo guardado pudo editarlo cualquiera: solo true literal cuenta como pagado.
      pagado: pagado === true,
      guardadoEn:
        typeof guardadoEn === "string" && !Number.isNaN(Date.parse(guardadoEn)) ? guardadoEn : null,
    };
  } catch {
    // localStorage bloqueado (modo privado estricto) o JSON corrupto.
    return null;
  }
}

function escribir(pedido: UltimoPedido): void {
  try {
    window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(pedido));
  } catch {
    // Sin almacenamiento la compra sigue: la URL de resultado ya trae los datos.
  }
}

// Se llama al recibir la paymentUrl: el pedido nuevo reemplaza al anterior.
export function guardarUltimoPedido(pedido: ReferenciaPedido): void {
  escribir({
    pedidoId: pedido.pedidoId,
    clave: pedido.clave,
    pagado: false,
    guardadoEn: new Date().toISOString(),
  });
}

// Marca como pagado el ultimo pedido, solo si es el mismo que se indica (un
// enlace viejo de otro pedido no debe tocar el pedido en curso).
export function marcarUltimoPedidoPagado(pedidoId: string): void {
  const actual = leerUltimoPedido();
  if (!actual || actual.pedidoId !== pedidoId || actual.pagado) return;
  escribir({ ...actual, pagado: true });
}

export function borrarUltimoPedido(): void {
  try {
    window.localStorage.removeItem(CLAVE_STORAGE);
  } catch {
    // Nada que hacer.
  }
}

// Que aviso mostrar en /carrito sobre el ultimo pedido:
// - "pagado": siempre, para que pueda volver a sus Gift Cards;
// - "pendiente": solo si se inicio hace menos de 24 h;
// - null: nada que avisar.
export function avisoUltimoPedido(
  pedido: UltimoPedido | null,
  ahoraMs: number = Date.now(),
): AvisoUltimoPedido | null {
  if (!pedido) return null;
  if (pedido.pagado) return "pagado";
  if (pedido.guardadoEn === null) return null;
  const edad = ahoraMs - Date.parse(pedido.guardadoEn);
  // Una fecha "en el futuro" (reloj del equipo cambiado) se toma como reciente.
  return edad < VIGENCIA_AVISO_PENDIENTE_MS ? "pendiente" : null;
}

// URL de la pagina de resultado de un pedido.
export function urlResultadoPedido(pedido: ReferenciaPedido): string {
  const params = new URLSearchParams({ pedido: pedido.pedidoId, k: pedido.clave });
  return `/pago/resultado?${params.toString()}`;
}
