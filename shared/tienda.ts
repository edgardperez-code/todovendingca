// Contrato entre el cliente y el servidor para el carrito, el checkout y la
// consulta de un pedido. Lo importan los dos lados.
import { z } from "zod";
import { MAX_UNIDADES_POR_PEDIDO } from "./catalogo";

export const itemCarritoSchema = z.object({
  productoId: z.string().min(1).max(64),
  cantidad: z.number().int().min(1).max(MAX_UNIDADES_POR_PEDIDO),
});
export type ItemCarrito = z.infer<typeof itemCarritoSchema>;

// Compra sin registro: solo lo minimo para entregar la Gift Card y el
// comprobante. No se crea ninguna cuenta.
export const compradorSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre").max(100),
  email: z.string().trim().toLowerCase().email("Correo invalido").max(200),
  telefono: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\-\s]*$/, "Telefono invalido")
    .optional()
    .or(z.literal("")),
});
export type Comprador = z.infer<typeof compradorSchema>;

// POST /api/checkout
export const checkoutRequestSchema = z.object({
  items: z.array(itemCarritoSchema).min(1).max(20),
  comprador: compradorSchema,
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export interface CheckoutResponse {
  ok: true;
  pedidoId: string;
  // Clave de acceso al pedido: sin ella no se puede consultar (las Gift Cards
  // pagadas se muestran en esa consulta).
  clave: string;
  paymentUrl: string;
}

// Codigo estable para que el cliente decida que hacer sin leer el mensaje:
// - "EN_PROCESO" (409): el pedido de esa idempotency-key existe pero aun no
//   tiene sesion de pago. El cliente CONSERVA la clave para el siguiente intento.
// - "LIMITE" (429): demasiadas peticiones seguidas desde ese navegador o red.
//   Tambien (409) si ese correo o esa red ya tienen apartadas
//   MAX_UNIDADES_RESERVADAS_SIMULTANEAS Gift Cards en pedidos sin pagar: hay
//   que pagar esos pedidos o esperar a que venzan.
// - "NO_DISPONIBLE" (503): pagos apagados o mucha demanda; reintentar mas tarde.
// - "SIN_STOCK" (409): no quedan codigos suficientes de algun producto del
//   carrito. No se creo el pedido: el cliente debe refrescar el stock
//   (GET /api/tienda/stock) y ajustar la cantidad.
export type CodigoError = "EN_PROCESO" | "LIMITE" | "NO_DISPONIBLE" | "SIN_STOCK";

export interface ErrorResponse {
  ok: false;
  error: string;
  codigo?: CodigoError;
}

export type EstadoPedido = "pendiente" | "pagado" | "fallido" | "expirado" | "error";

// === Modo de prueba ===
// En el simulador de SPIDI cualquiera "paga" con la clave magica 000000 y en el
// sandbox los pagos son de prueba. Lo que se emita contra esos entornos no puede
// valer como una Gift Card real: sale con prefijo PRUEBA- y estado "prueba", y
// el canje lo rechaza.

// Contra que entorno de SPIDI cobra el servidor (entornoSpidi en
// server/spidi.ts):
// - "produccion": SPIDI_ENTORNO=produccion y una SPIDI_BASE_URL https cuyo host
//   no es de prueba. Pagos reales.
// - "simulador", "sandbox" y "prueba": el host de SPIDI_BASE_URL es de prueba
//   conocido. "prueba" es cualquiera que no sea el simulador ni el sandbox
//   oficiales (un mock, localhost, una IP, un host con "pruebas" o "uat" en el
//   nombre...). Pagos no reales.
// - "desconocido": ni lo uno ni lo otro. Por ejemplo, la URL de produccion con
//   SPIDI_ENTORNO vacia o mal escrita, o con http://. No se sabe si los pagos
//   serian reales, asi que el checkout queda cerrado siempre.
export type EntornoSpidi = "simulador" | "sandbox" | "prueba" | "desconocido" | "produccion";

// Numero de pedido: TV-AAMMDD-XXXXX si se creo en produccion confirmada y
// TVP-AAMMDD-XXXXX si se creo en modo prueba. Queda congelado en el pedido: lo
// que se emita o se muestre para ese pedido depende de su numero, no del modo
// en que este el servidor despues.
export const PREFIJO_PEDIDO = "TV-";
export const PREFIJO_PEDIDO_PRUEBA = "TVP-";

// true si el pedido se creo en modo prueba (numero TVP-). Mayusculas por si un
// numero se escribio a mano: el servidor siempre los genera en mayusculas.
// Cualquier otro numero cuenta como pedido real (fallar hacia "real" aqui es lo
// seguro: a un pedido real nunca se le emiten codigos de prueba).
export function esNumeroPedidoDePrueba(numero: string): boolean {
  return numero.toUpperCase().startsWith(PREFIJO_PEDIDO_PRUEBA);
}

// activa -> canjeada (una sola vez). "anulada" la pone soporte a mano. "prueba"
// es una Gift Card emitida con un pago no real: se ve y se consulta, pero nunca
// se canjea.
export type EstadoGiftCard = "activa" | "canjeada" | "anulada" | "prueba";

export const ESTADO_GIFT_CARD_PRUEBA = "prueba" satisfies EstadoGiftCard;
export const PREFIJO_CODIGO_PRUEBA = "PRUEBA-";

// GET /api/tienda/config — lo que el navegador necesita saber del servidor para
// avisar del modo de prueba. Nunca lleva secretos, credenciales ni URLs internas.
export interface ConfigTienda {
  // true en todo lo que no sea "produccion", incluido "desconocido" (ahi
  // ademas el checkout esta cerrado): nada de lo que se emita vale como real.
  modoPrueba: boolean;
  entorno: EntornoSpidi;
}

// GET /api/pedidos/:id?k=<clave>  — vista publica del pedido para la pagina de
// resultado. Nunca incluye datos internos (tokens, ids de acuerdo, etc.).
export interface PedidoPublico {
  ok: true;
  id: string;
  numero: string;
  estado: EstadoPedido;
  creadoEn: string; // ISO 8601
  items: Array<{
    productoId: string;
    nombre: string;
    cantidad: number;
    precioUsd: number;
    subtotalUsd: number;
  }>;
  totalUsd: number;
  comprador: { nombre: string; email: string };
  // Solo cuando estado === "pagado": la identificacion del pago que pide SPIDI
  // para la certificacion (quien, cuanto y con que referencia bancaria).
  pago: {
    pagadoEn: string | null;
    metodo: string | null; // immediate_debit | mobile_payment | crypto
    banco: string | null;
    referenciaBancaria: string | null;
    montoVes: number | null;
    tasaBcvUsdVes: number | null;
    spidiTransaccionId: number | null;
    comprobanteUrl: string | null; // comprobante oficial de SPIDI
  } | null;
  // Codigos emitidos; vacio hasta que el pedido esta pagado. `estado` es un
  // EstadoGiftCard ("prueba" = no sirve para canjear); se tipa como string para
  // tolerar un estado nuevo sin romper la pagina.
  giftCards: Array<{ codigo: string; montoUsd: number; estado: string }>;
  // true si el pedido es de prueba: se creo en modo prueba (numero TVP-) o
  // tiene Gift Cards de prueba. Se decide SOLO por el pedido y en todos los
  // estados (pendiente, pagado, fallido...): el numero congela el modo desde
  // que se crea el pedido. Nunca por el modo actual del servidor: un pedido
  // real (TV-) pendiente no se rotula de prueba aunque el servidor este ahora
  // en modo prueba, porque lo que pague el comprador es dinero real. La pagina
  // de resultado lo usa para el aviso.
  modoPrueba: boolean;
  // Motivo legible cuando estado es fallido/expirado (si SPIDI lo dio).
  motivo: string | null;
  // Gift Cards pagadas que aun no tienen codigo: el pago llego cuando ya no
  // quedaba stock y el equipo las entrega a mano. 0 en casi todos los pedidos.
  faltanCodigos: number;
}

// === Stock ===

// GET /api/tienda/stock — cuantos codigos DISPONIBLES (ni reservados ni
// entregados) tiene cada producto del catalogo. Se acota a STOCK_MAXIMO_VISIBLE
// para no revelar el inventario exacto: "99" quiere decir "99 o mas". Un
// producto con 0 se muestra "Sin stock" y no se puede comprar.
export const STOCK_MAXIMO_VISIBLE = 99;

// Cada pedido sin pagar aparta sus codigos hasta que se paga, falla o vence.
// Para que nadie acapare el stock abriendo pedidos que no paga, un mismo
// correo y una misma IP pueden tener a la vez como mucho estas unidades
// apartadas en pedidos "pendiente" (el checkout responde 409 "LIMITE").
export const MAX_UNIDADES_RESERVADAS_SIMULTANEAS = 10;

export interface StockTienda {
  ok: true;
  stock: Record<string, number>;
}
