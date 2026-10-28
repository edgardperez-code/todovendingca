import { type User, type InsertUser, type ContactMessage, type InsertContactMessage, type EncuestaVasos, type InsertEncuestaVasos, type Pedido, type PedidoItem, type GiftCard, type CodigoInventario } from "@shared/schema";
import { users, contactMessages, encuestaVasos, pedidos, giftCards, spidiEventos, codigosInventario } from "@shared/schema";
import { esNumeroPedidoDePrueba, PREFIJO_PEDIDO_PRUEBA, type EstadoGiftCard } from "@shared/tienda";
import type { ConteoInventario, EstadoCodigoInventario } from "@shared/admin";
import { buscarProducto, PRODUCTOS } from "@shared/catalogo";
import { randomUUID } from "crypto";
import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, lte, ne, notIlike, or, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db as baseDatos } from "./db";

// === Tienda ===

// Codigo de Postgres para "valor duplicado en una columna unica".
const CODIGO_UNICIDAD = "23505";

// MemStorage lanza este mismo error cuando choca una columna unica, para que el
// llamador reintente (por ejemplo, con otro numero de pedido o de Gift Card)
// igual que con Postgres. El mensaje nunca incluye el valor repetido: podria
// ser un codigo de Gift Card y no debe acabar en los logs.
function errorDeUnicidad(restriccion: string): Error {
  const error = new Error(`Valor duplicado: viola la restriccion unica "${restriccion}"`) as Error & {
    code: string;
    constraint: string;
  };
  error.code = CODIGO_UNICIDAD;
  error.constraint = restriccion;
  return error;
}

// true si el error es un choque de columna unica, venga de Postgres o de
// MemStorage. Si se pasa `restriccion` (por ejemplo "pedidos_numero_unique"),
// solo devuelve true para esa.
export function esViolacionDeUnicidad(error: unknown, restriccion?: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: unknown; constraint?: unknown; cause?: unknown };
  if (e.code === CODIGO_UNICIDAD) {
    return restriccion === undefined || e.constraint === restriccion;
  }
  // Por si una version futura de drizzle envuelve el error de pg en `cause`.
  return e.cause !== undefined && e.cause !== error && esViolacionDeUnicidad(e.cause, restriccion);
}

// Copia profunda (incluye las fechas y el arreglo items) para que nadie mute el
// estado interno de MemStorage por referencia.
function copiar<T>(valor: T): T {
  return structuredClone(valor);
}

// Orden de texto simple (por codigo de caracter), para desempatar por id igual
// que en Postgres.
function compararTexto(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function tiempo(fecha: Date | null): number {
  return fecha ? fecha.getTime() : 0;
}

// true si (creadoEn, id) va despues del cursor en el orden "del mas nuevo al
// mas viejo" (creadoEn descendente y, a igual fecha, id descendente).
function vaDespues(creadoEn: Date, id: string, cursor: CursorAdmin): boolean {
  const t = creadoEn.getTime();
  const c = cursor.creadoEn.getTime();
  return t < c || (t === c && id < cursor.id);
}

// Postgres guarda microsegundos y una fecha de JavaScript solo milisegundos:
// para que el cursor (que viaja en milisegundos) no se salte filas, el orden
// y la comparacion se hacen sobre la fecha recortada a milisegundos.
function milisegundos(columna: PgColumn): SQL {
  return sql`date_trunc('milliseconds', ${columna})`;
}

// Misma regla que vaDespues, en SQL. La fecha va como texto ISO en UTC (asi
// se guardan las fechas; ver anotarCorreosEnviados): el tipo timestamp ignora
// la "Z" del final.
function antesDelCursor(fecha: PgColumn, id: PgColumn, cursor: CursorAdmin): SQL {
  return sql`(${milisegundos(fecha)}, ${id}) < (${cursor.creadoEn.toISOString()}::timestamp, ${cursor.id})`;
}

// Los numeros de pedido se emiten en mayusculas y los emails se guardan en
// minusculas (shared/tienda.ts): asi la busqueda acepta cualquiera de los dos
// tal como lo dicte el cliente, pero solo coincidencias exactas.
function normalizarBusqueda(termino: string): { numero: string; email: string } {
  const limpio = termino.trim();
  return { numero: limpio.toUpperCase(), email: limpio.toLowerCase() };
}

export interface NuevoPedido {
  numero: string;
  claveAcceso: string;
  claveIdempotencia: string | null;
  items: PedidoItem[];
  totalUsdCentavos: number;
  compradorNombre: string;
  compradorEmail: string;
  compradorTelefono: string | null;
}

// Fase 1 (pago), tal como la reporta SPIDI (webhook payment_session.paid o
// GET status). Todo es informativo salvo pagadoEn.
export interface DatosPagoSpidi {
  metodo: string | null;
  banco: string | null;
  referencia: string | null;
  montoVes: number | null;
  tasaBcv: number | null;
  spidiTransaccionId: number | null;
  comprobanteUrl: string | null;
  pagadoEn: Date;
}

// Fase 2 (acreditacion), del credito del owner en receiver_credits.
export interface DatosAcreditacionSpidi {
  montoVes: number | null;
  comisionVes: number | null;
  referencia: string | null; // ya recortada: solo la parte izquierda del "|"
  acreditadoEn: Date;
}

// === Inventario de codigos ===

// Lo que un checkout aparta del inventario: `cantidad` codigos disponibles de
// `productoId`, en la misma operacion que crea el pedido.
export interface ReservaStock {
  productoId: string;
  cantidad: number;
}

// crearPedido lanza esto (y NO crea el pedido) si no hay codigos disponibles
// suficientes de algun producto. Solo lleva el id del producto, nunca codigos.
export class SinStockError extends Error {
  readonly productoId: string;

  constructor(productoId: string) {
    super(`Sin stock suficiente de ${productoId}`);
    this.name = "SinStockError";
    this.productoId = productoId;
  }
}

// Que entregar al marcar un pedido pagado (ver marcarPedidoPagado):
// - "inventario" (pedido real): por cada linea, `cantidad` codigos del
//   inventario de `productoId` (primero los que el pedido tenia reservados y,
//   si faltan, los disponibles en ese momento), copiados a gift_cards con
//   `montoUsdCentavos`.
// - "prueba" (pedido TVP-): las Gift Cards de prueba ya generadas. El
//   inventario real no se toca: las reservas del pedido vuelven a disponible.
export type EntregaPago =
  | {
      tipo: "inventario";
      unidades: Array<{ productoId: string; cantidad: number; montoUsdCentavos: number }>;
    }
  | { tipo: "prueba"; giftCards: NuevaGiftCard[] };

export interface ResultadoPago {
  pedido: Pedido | undefined;
  recienPagado: boolean;
  // Solo con recienPagado y entrega "inventario": unidades que se quedaron sin
  // codigo porque no habia stock (hay que entregarlas a mano).
  faltanCodigos: number;
}

// Lineas de Gift Card de un pedido (las mismas de EntregaPago "inventario"):
// cuantas unidades de cada producto y cuanto vale cada codigo.
export type UnidadesPedido = Array<{ productoId: string; cantidad: number; montoUsdCentavos: number }>;

// Resultado de completarCodigosPedido. Fuera de "completado" no se toco nada:
// - "no_existe": no hay pedido con ese id.
// - "no_pagado": el pedido no esta pagado (no se le entrega nada).
// - "prueba": es un pedido de prueba (TVP-): nunca gasta codigos reales.
// - "completo": ya tiene todos sus codigos.
export type ResultadoCompletarCodigos =
  | { resultado: "no_existe" }
  | { resultado: "no_pagado" | "prueba" | "completo"; pedido: Pedido }
  | { resultado: "completado"; pedido: Pedido; entregados: number; faltanCodigos: number };

// Cuantos codigos le faltan a cada producto de un pedido pagado y cuantos se
// pueden entregar en total. Por producto: lo comprado menos lo que ya se le
// entrego del inventario (las Gift Cards no guardan el producto; el inventario
// si). En total nunca mas que unidadesGiftCard menos las Gift Cards que ya
// tiene: asi un pedido viejo con codigos que no salieron del inventario no
// recibe codigos de mas. Misma regla en MemStorage y DbStorage.
function faltantesPorProducto(
  items: PedidoItem[],
  unidades: UnidadesPedido,
  giftCardsEmitidas: number,
  entregadosPorProducto: Map<string, number>,
): { total: number; porProducto: Array<{ productoId: string; faltan: number; montoUsdCentavos: number }> } {
  const total = Math.max(0, unidadesGiftCard(items) - giftCardsEmitidas);
  const compradas = new Map<string, { cantidad: number; montoUsdCentavos: number }>();
  for (const u of unidades) {
    const previa = compradas.get(u.productoId);
    compradas.set(u.productoId, {
      cantidad: (previa?.cantidad ?? 0) + Math.max(0, u.cantidad),
      montoUsdCentavos: previa?.montoUsdCentavos ?? u.montoUsdCentavos,
    });
  }
  const porProducto: Array<{ productoId: string; faltan: number; montoUsdCentavos: number }> = [];
  for (const [productoId, c] of Array.from(compradas.entries())) {
    const faltan = Math.max(0, c.cantidad - (entregadosPorProducto.get(productoId) ?? 0));
    if (faltan > 0) porProducto.push({ productoId, faltan, montoUsdCentavos: c.montoUsdCentavos });
  }
  return { total, porProducto };
}

// Un codigo del inventario con el numero del pedido que lo tiene (si alguno).
export type CodigoInventarioConPedido = CodigoInventario & { pedidoNumero: string | null };

// Paginacion "del mas nuevo al mas viejo": se devuelven los que van despues de
// este (creadoEn, id). El id desempata los que se crearon en el mismo instante.
export interface CursorAdmin {
  creadoEn: Date;
  id: string;
}

export interface FiltroPedidosAdmin {
  estado?: string;
  // Numero de pedido o email exacto.
  buscar?: string;
  limite: number;
  despues?: CursorAdmin;
}

export interface FiltroCodigosInventario {
  productoId?: string;
  estado?: EstadoCodigoInventario;
  limite: number;
  despues?: CursorAdmin;
}

export interface ResumenVentasStorage {
  pagadosHoy: number;
  pagadosMes: number;
  totalUsdCentavosHoy: number;
  totalUsdCentavosMes: number;
  pendientes: number;
  sinCodigos: number;
}

// Unidades de Gift Card de un pedido (las que deben tener codigo al pagarse).
// Los pedidos viejos sin esGiftCard caen al catalogo y, si el producto ya no
// existe, cuentan como Gift Card (la tienda solo vende Gift Cards). DbStorage
// lo escribe igual en SQL (ver resumenVentas).
export function unidadesGiftCard(items: PedidoItem[]): number {
  let total = 0;
  for (const item of items) {
    const congelado: boolean | undefined = item.esGiftCard;
    const esGiftCard = congelado ?? buscarProducto(item.productoId)?.esGiftCard ?? true;
    if (esGiftCard) total += Number(item.cantidad) || 0;
  }
  return total;
}

// Conteo en cero para cada producto del catalogo (todos aparecen en el panel).
function conteoInventarioVacio(): Record<string, ConteoInventario> {
  const conteo: Record<string, ConteoInventario> = {};
  for (const p of PRODUCTOS) conteo[p.id] = { disponible: 0, reservado: 0, entregado: 0, anulado: 0 };
  return conteo;
}

function esEstadoInventario(estado: string): estado is EstadoCodigoInventario {
  return estado === "disponible" || estado === "reservado" || estado === "entregado" || estado === "anulado";
}

// Suma las reservas del mismo producto: asi cada producto se revisa una vez.
function agruparReservas(reservas: ReservaStock[]): ReservaStock[] {
  const porProducto = new Map<string, number>();
  for (const r of reservas) {
    if (r.cantidad > 0) porProducto.set(r.productoId, (porProducto.get(r.productoId) ?? 0) + r.cantidad);
  }
  return Array.from(porProducto.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
}

// Estados de pedido cuyas reservas ya no sirven: vuelven a "disponible".
const ESTADOS_QUE_LIBERAN = ["fallido", "expirado", "error"];

export interface NuevaGiftCard {
  codigo: string;
  montoUsdCentavos: number;
  // "prueba" si el pedido se creo en modo prueba (numero TVP-, ver
  // prepararEntrega en server/tienda.ts): queda registrada pero canjearGiftCard
  // nunca la acepta.
  estado: Extract<EstadoGiftCard, "activa" | "prueba">;
}

// Ventanas de la conciliacion con SPIDI. Un pendiente de mas de 24 h ya no
// puede pagarse (la sesion vive como mucho 20 minutos) y SPIDI se habria rendido
// hace rato con el aviso; uno pagado sin acreditar despues de 48 h se revisa a
// mano en SPIDI Center.
// Excepcion: un pendiente REAL (cualquier numero que no sea TVP-) se sigue
// revisando 7 dias. Puede ser un pago real que no se entrego porque el servidor
// estaba en modo prueba o con entorno desconocido (prepararEntrega no entrega
// codigos de prueba para un pago real): si se dejara de revisar a las 24 h, el
// dinero quedaria cobrado y sin entregar aunque luego se corrija el entorno. Los
// TVP- se quedan en 24 h: no hay dinero real que retener.
const VENTANA_CONCILIAR_PENDIENTES_MS = 24 * 60 * 60_000;
const VENTANA_CONCILIAR_PENDIENTES_REALES_MS = 7 * 24 * 60 * 60_000;
const VENTANA_CONCILIAR_ACREDITACION_MS = 48 * 60 * 60_000;
// Patron (ILIKE, sin distinguir mayusculas) de los numeros de pedido de prueba,
// igual que esNumeroPedidoDePrueba. "TVP-" no tiene comodines de LIKE (% o _).
const PATRON_NUMERO_PRUEBA = `${PREFIJO_PEDIDO_PRUEBA}%`;

// true si un pedido pendiente, creado en `creadoEnMs`, sigue dentro de su
// ventana de conciliacion. Es la regla de MemStorage; DbStorage la escribe igual
// en SQL.
function pendienteEnVentana(numero: string, creadoEnMs: number, ahora: number): boolean {
  const ventana = esNumeroPedidoDePrueba(numero) ? VENTANA_CONCILIAR_PENDIENTES_MS : VENTANA_CONCILIAR_PENDIENTES_REALES_MS;
  return creadoEnMs >= ahora - ventana;
}
// Los correos de un pedido se reintentan durante 7 dias y como mucho 5 veces en
// total (contando el primer envio). Sin tope se reintentaria para siempre: el
// dominio de prueba de Resend rechaza siempre a los compradores.
const VENTANA_REINTENTO_CORREOS_MS = 7 * 24 * 60 * 60_000;
export const MAX_INTENTOS_CORREO = 5;
// Espera antes de reintentar los correos de un pedido, segun cuantos intentos
// lleva (contada desde su ultima actualizacion). Asi los 5 intentos se reparten
// en horas y una caida corta de Resend no los gasta todos. El primero espera un
// minuto para no pisar el envio inmediato que sale al confirmarse el pago.
// Es la UNICA tabla de esperas: la usan las dos implementaciones de
// listarPedidosConCorreoPendiente.
export const ESPERA_REINTENTO_CORREO_MS: readonly number[] = [
  60_000,
  5 * 60_000,
  30 * 60_000,
  2 * 60 * 60_000,
  6 * 60 * 60_000,
];

// Espera que le toca a un pedido con `intentos` intentos de correo (de 5 en
// adelante, la ultima de la tabla).
export function esperaReintentoCorreo(intentos: number): number {
  const indice = Math.min(Math.max(0, intentos), ESPERA_REINTENTO_CORREO_MS.length - 1);
  return ESPERA_REINTENTO_CORREO_MS[indice];
}

// Que correos salieron en un intento.
export interface CorreosEnviados {
  comprador: boolean;
  venta: boolean;
}

export interface IStorage {
  // false en MemStorage: los pedidos se perderian al reiniciar, asi que en
  // produccion no se aceptan pagos sin base de datos.
  readonly persistente: boolean;

  // Crea el pedido y, en la MISMA operacion atomica, reserva los codigos de
  // `reservas`. Si de algun producto no alcanzan, lanza SinStockError y no crea
  // nada (ni pedido ni reservas). Dos checkouts simultaneos por el ultimo
  // codigo: solo uno lo consigue.
  crearPedido(pedido: NuevoPedido, reservas?: ReservaStock[]): Promise<Pedido>;
  obtenerPedido(id: string): Promise<Pedido | undefined>;
  obtenerPedidoPorSesionSpidi(sessionId: string): Promise<Pedido | undefined>;
  obtenerPedidoPorClaveIdempotencia(clave: string): Promise<Pedido | undefined>;
  asignarSesionSpidi(pedidoId: string, sessionId: string, paymentUrl: string): Promise<Pedido | undefined>;
  // pendiente (sin sesion) -> error, cuando no se pudo crear la sesion en SPIDI
  // o el checkout se interrumpio. Si el pedido ya tiene sesion no se toca: su
  // enlace podria pagarse y la conciliacion solo revisa los "pendiente".
  // Al pasar a error, sus reservas vuelven a "disponible" (igual en
  // marcarCheckoutsInterrumpidos y marcarPedidoTerminado).
  marcarPedidoError(pedidoId: string, motivo: string): Promise<void>;
  // Checkouts que murieron a mitad (el proceso se cayo mientras creaba la
  // sesion en SPIDI): pasa a "error" todos los "pendiente" SIN sesion creados
  // antes de `creadosAntesDe`. Uno con sesion nunca se toca (ese lo resuelve la
  // conciliacion). Devuelve cuantos marco.
  marcarCheckoutsInterrumpidos(creadosAntesDe: Date, motivo: string): Promise<number>;
  // Cualquier estado distinto de "pagado" -> pagado, EXACTAMENTE una vez, y en
  // la misma operacion entrega las Gift Cards (ver EntregaPago). Si SPIDI dice
  // que se pago, se entrega aunque localmente figurara fallido/expirado: el
  // dinero ya salio del cliente (si sus reservas ya se habian liberado, se
  // toman codigos disponibles; si no hay, queda pagado con faltanCodigos > 0).
  // Si ya estaba pagado no toca nada y no entrega codigos. Un codigo del
  // inventario se entrega una sola vez: pasa a "entregado" con la fila
  // bloqueada y gift_cards.codigo es unico.
  marcarPedidoPagado(pedidoId: string, datos: DatosPagoSpidi, entrega: EntregaPago): Promise<ResultadoPago>;
  // Solo desde "pendiente": nunca pisa un pedido pagado. Libera sus reservas.
  marcarPedidoTerminado(
    pedidoId: string,
    estado: "fallido" | "expirado",
    motivo: string | null,
  ): Promise<Pedido | undefined>;
  // Una sola vez (si acreditadoEn era null). No cambia `estado`.
  marcarPedidoAcreditado(
    pedidoId: string,
    datos: DatosAcreditacionSpidi,
  ): Promise<{ pedido: Pedido | undefined; recienAcreditado: boolean }>;
  marcarAcreditacionFallida(pedidoId: string): Promise<void>;

  // Pedidos que conviene volver a consultar en SPIDI por si se perdio un aviso
  // (SPIDI reintenta y luego se rinde, sin reenvio). Primero los "pendiente" con
  // sesion: los de prueba (TVP-) creados en las ultimas 24 h y los reales (TV-)
  // en los ultimos 7 dias (pueden ser pagos reales retenidos por el modo
  // prueba). Con el cupo que sobre, los "pagado" sin acreditar pagados en las
  // ultimas 48 h. Dentro de cada grupo, del mas nuevo al mas viejo: asi uno
  // viejo que siempre falla no bloquea a los nuevos. Nunca devuelve mas de
  // `limite`.
  listarPedidosParaConciliar(limite: number): Promise<Pedido[]>;
  // Pagados en los ultimos 7 dias a los que les falta algun correo, con menos
  // de MAX_INTENTOS_CORREO intentos y a los que YA les toca reintentar (paso la
  // espera de ESPERA_REINTENTO_CORREO_MS desde actualizadoEn). Se filtra antes
  // de cortar en `limite`: si no, los que aun esperan ocuparian la lista y
  // taparian a los que ya tocan. Primero los que hace mas tiempo no se tocan
  // (actualizadoEn), para que todos tengan su turno.
  listarPedidosConCorreoPendiente(limite: number): Promise<Pedido[]>;
  // Reserva un intento de correo ANTES de enviar: suma 1 al contador solo si
  // aun no llego a MAX_INTENTOS_CORREO (sin tope si `sinTope`, para el reenvio
  // manual del admin). Devuelve el pedido ya con el contador nuevo, o undefined
  // si no se reservo (tope alcanzado o no existe): entonces no se envia nada.
  // Asi, aunque falle lo que se anota despues, los envios repetidos quedan
  // acotados por el tope.
  reservarIntentoCorreo(pedidoId: string, opciones?: { sinTope?: boolean }): Promise<Pedido | undefined>;
  // Anota la hora de cada correo que salio, sin tocar el contador (el intento
  // ya se conto al reservarlo). Una hora ya anotada no se pisa.
  anotarCorreosEnviados(pedidoId: string, enviados: CorreosEnviados): Promise<void>;
  // Para soporte: pedidos con ese numero exacto o ese email exacto, del mas
  // nuevo al mas viejo.
  buscarPedidos(termino: string, limite: number): Promise<Pedido[]>;

  eventoSpidiYaProcesado(idempotencyKey: string): Promise<boolean>;
  // Idempotente: si la clave ya existe no hace nada.
  registrarEventoSpidi(idempotencyKey: string, evento: string, sessionId: string | null): Promise<void>;

  obtenerGiftCardsDePedido(pedidoId: string): Promise<GiftCard[]>;
  // Las de varios pedidos de una vez (para las listas del admin).
  obtenerGiftCardsDePedidos(pedidoIds: string[]): Promise<GiftCard[]>;
  obtenerGiftCardPorCodigo(codigo: string): Promise<GiftCard | undefined>;
  // activa -> canjeada, una sola vez. Una de prueba, canjeada o anulada se
  // devuelve tal cual con recienCanjeada=false.
  canjearGiftCard(codigo: string): Promise<{ giftCard: GiftCard | undefined; recienCanjeada: boolean }>;

  // === Inventario de codigos ===
  // Codigos "disponible" por producto (solo los productos que tienen alguno).
  contarStockDisponible(): Promise<Record<string, number>>;
  // Todos los estados, con cada producto del catalogo aunque este en 0.
  contarInventario(): Promise<Record<string, ConteoInventario>>;
  // Agrega codigos ya validados y sin repetir entre si. Los que ya existen en
  // el inventario o como Gift Card emitida no se agregan (duplicados).
  agregarCodigosInventario(productoId: string, codigos: string[]): Promise<{ agregados: number; duplicados: number }>;
  // Del mas nuevo al mas viejo; devuelve como mucho `limite`.
  listarCodigosInventario(filtro: FiltroCodigosInventario): Promise<CodigoInventarioConPedido[]>;
  // disponible -> anulado. Si no estaba disponible, se devuelve como esta con
  // anulado=false.
  anularCodigoInventario(id: string): Promise<{ codigo: CodigoInventarioConPedido | undefined; anulado: boolean }>;
  // Barrido: vuelven a "disponible" las reservas de pedidos fallidos,
  // expirados o con error que siguieran apartadas (red de seguridad), y las de
  // pedidos "pendiente" creados antes de `pendientesCreadosAntesDe` (un enlace
  // de pago que ya murio y que SPIDI nunca cerro: cambio de entorno o de
  // credenciales, sesion abandonada sin consulta...). El pedido sigue
  // "pendiente": si ese pago llega tarde, marcarPedidoPagado toma codigos
  // disponibles o lo deja pagado con faltanCodigos. Devuelve cuantas libero.
  liberarReservasHuerfanas(pendientesCreadosAntesDe: Date): Promise<number>;
  // Unidades que tiene apartadas ese correo (exacto, ya en minusculas) en
  // pedidos "pendiente": codigos en estado "reservado" de sus pedidos. Para el
  // limite de MAX_UNIDADES_RESERVADAS_SIMULTANEAS del checkout.
  contarUnidadesReservadasPorEmail(email: string): Promise<number>;
  // Para el admin: a un pedido real pagado que se quedo sin codigos (el pago
  // llego sin stock) le entrega, en una sola operacion y con el pedido
  // bloqueado, los codigos "disponible" que le falten de cada producto (ver
  // faltantesPorProducto). Pasan a "entregado" con su pedidoId y se copian a
  // gift_cards con el valor de su linea. Si no alcanza el stock entrega los que
  // haya. `unidades` son las lineas de Gift Card del pedido.
  completarCodigosPedido(pedidoId: string, unidades: UnidadesPedido): Promise<ResultadoCompletarCodigos>;

  // === Administracion ===
  // Del mas nuevo al mas viejo (creadoEn, id); devuelve como mucho `limite`.
  listarPedidosAdmin(filtro: FiltroPedidosAdmin): Promise<Pedido[]>;
  // Pagados desde `desdeHoy` / `desdeMes` (por pagadoEn), pendientes y pagados
  // sin todos sus codigos. Sin `incluirPrueba` no cuenta los pedidos TVP-.
  resumenVentas(p: { desdeHoy: Date; desdeMes: Date; incluirPrueba: boolean }): Promise<ResumenVentasStorage>;

  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  createEncuestaVasos(data: InsertEncuestaVasos): Promise<EncuestaVasos>;
  getEncuestasVasos(): Promise<EncuestaVasos[]>;
}

export class MemStorage implements IStorage {
  readonly persistente = false;

  private users: Map<string, User>;
  private contactMessages: Map<string, ContactMessage>;
  private encuestasVasos: Map<string, EncuestaVasos>;
  private pedidos: Map<string, Pedido>;
  // Por codigo (que es unico), para buscar y canjear sin recorrer todo.
  private giftCards: Map<string, GiftCard>;
  private spidiEventos: Map<string, { evento: string; sessionId: string | null; recibidoEn: Date }>;
  // Inventario por id, y su indice por codigo (que es unico).
  private codigos: Map<string, CodigoInventario>;
  private codigoAId: Map<string, string>;

  constructor() {
    this.codigos = new Map();
    this.codigoAId = new Map();
    this.users = new Map();
    this.contactMessages = new Map();
    this.encuestasVasos = new Map();
    this.pedidos = new Map();
    this.giftCards = new Map();
    this.spidiEventos = new Map();
  }

  // Nota: los metodos de tienda no hacen ningun `await` entre revisar el estado
  // y cambiarlo. Como JavaScript corre en un solo hilo, eso los hace atomicos:
  // un webhook y una consulta simultaneos no pueden intercalarse a la mitad.

  // Los codigos de un producto en un estado, del mas viejo al mas nuevo (el
  // primero que se cargo es el primero que se entrega, igual que en Postgres).
  private codigosEn(productoId: string, estado: EstadoCodigoInventario): CodigoInventario[] {
    return Array.from(this.codigos.values())
      .filter((c) => c.productoId === productoId && c.estado === estado)
      .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime() || compararTexto(a.id, b.id));
  }

  private liberarReservasDe(pedidoId: string): number {
    let liberadas = 0;
    for (const c of Array.from(this.codigos.values())) {
      if (c.pedidoId === pedidoId && c.estado === "reservado") {
        this.codigos.set(c.id, { ...c, estado: "disponible", pedidoId: null, reservadoEn: null });
        liberadas++;
      }
    }
    return liberadas;
  }

  private conPedido(c: CodigoInventario): CodigoInventarioConPedido {
    const pedido = c.pedidoId ? this.pedidos.get(c.pedidoId) : undefined;
    return { ...copiar(c), pedidoNumero: pedido ? pedido.numero : null };
  }

  async crearPedido(nuevo: NuevoPedido, reservas: ReservaStock[] = []): Promise<Pedido> {
    // Todo o nada, como la transaccion de Postgres: primero se revisa que
    // alcance el stock de cada producto y despues se crea y se reserva.
    const elegidos: CodigoInventario[] = [];
    for (const r of agruparReservas(reservas)) {
      const disponibles = this.codigosEn(r.productoId, "disponible");
      if (disponibles.length < r.cantidad) throw new SinStockError(r.productoId);
      elegidos.push(...disponibles.slice(0, r.cantidad));
    }
    // Mismas columnas unicas que en Postgres (null no choca con null).
    for (const existente of Array.from(this.pedidos.values())) {
      if (existente.numero === nuevo.numero) throw errorDeUnicidad("pedidos_numero_unique");
      if (nuevo.claveIdempotencia !== null && existente.claveIdempotencia === nuevo.claveIdempotencia) {
        throw errorDeUnicidad("pedidos_clave_idempotencia_unique");
      }
    }
    const ahora = new Date();
    const pedido: Pedido = {
      id: randomUUID(),
      numero: nuevo.numero,
      claveAcceso: nuevo.claveAcceso,
      claveIdempotencia: nuevo.claveIdempotencia,
      estado: "pendiente",
      items: copiar(nuevo.items),
      totalUsdCentavos: nuevo.totalUsdCentavos,
      compradorNombre: nuevo.compradorNombre,
      compradorEmail: nuevo.compradorEmail,
      compradorTelefono: nuevo.compradorTelefono,
      spidiSessionId: null,
      spidiPaymentUrl: null,
      motivo: null,
      pagoMetodo: null,
      pagoBanco: null,
      pagoReferencia: null,
      pagoMontoVes: null,
      pagoTasaBcv: null,
      spidiTransaccionId: null,
      spidiComprobanteUrl: null,
      pagadoEn: null,
      acreditadoEn: null,
      acreditadoMontoVes: null,
      acreditadoComisionVes: null,
      acreditadoReferencia: null,
      acreditacionFallida: false,
      correoCompradorEnviadoEn: null,
      avisoVentaEnviadoEn: null,
      correoIntentos: 0,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };
    this.pedidos.set(pedido.id, pedido);
    for (const c of elegidos) {
      this.codigos.set(c.id, { ...c, estado: "reservado", pedidoId: pedido.id, reservadoEn: ahora });
    }
    return copiar(pedido);
  }

  async obtenerPedido(id: string): Promise<Pedido | undefined> {
    const pedido = this.pedidos.get(id);
    return pedido ? copiar(pedido) : undefined;
  }

  async obtenerPedidoPorSesionSpidi(sessionId: string): Promise<Pedido | undefined> {
    const pedido = Array.from(this.pedidos.values()).find((p) => p.spidiSessionId === sessionId);
    return pedido ? copiar(pedido) : undefined;
  }

  async obtenerPedidoPorClaveIdempotencia(clave: string): Promise<Pedido | undefined> {
    const pedido = Array.from(this.pedidos.values()).find((p) => p.claveIdempotencia === clave);
    return pedido ? copiar(pedido) : undefined;
  }

  async asignarSesionSpidi(pedidoId: string, sessionId: string, paymentUrl: string): Promise<Pedido | undefined> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual) return undefined;
    const otro = Array.from(this.pedidos.values()).find(
      (p) => p.id !== pedidoId && p.spidiSessionId === sessionId,
    );
    if (otro) throw errorDeUnicidad("pedidos_spidi_session_id_unique");
    const actualizado: Pedido = {
      ...actual,
      spidiSessionId: sessionId,
      spidiPaymentUrl: paymentUrl,
      actualizadoEn: new Date(),
    };
    this.pedidos.set(pedidoId, actualizado);
    return copiar(actualizado);
  }

  async marcarPedidoError(pedidoId: string, motivo: string): Promise<void> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual || actual.estado !== "pendiente" || actual.spidiSessionId !== null) return;
    this.pedidos.set(pedidoId, { ...actual, estado: "error", motivo, actualizadoEn: new Date() });
    this.liberarReservasDe(pedidoId);
  }

  async marcarCheckoutsInterrumpidos(creadosAntesDe: Date, motivo: string): Promise<number> {
    const limite = creadosAntesDe.getTime();
    const ahora = new Date();
    let marcados = 0;
    for (const actual of Array.from(this.pedidos.values())) {
      if (actual.estado !== "pendiente" || actual.spidiSessionId !== null) continue;
      if (actual.creadoEn.getTime() >= limite) continue;
      this.pedidos.set(actual.id, { ...actual, estado: "error", motivo, actualizadoEn: ahora });
      this.liberarReservasDe(actual.id);
      marcados++;
    }
    return marcados;
  }

  async marcarPedidoPagado(pedidoId: string, datos: DatosPagoSpidi, entrega: EntregaPago): Promise<ResultadoPago> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual) return { pedido: undefined, recienPagado: false, faltanCodigos: 0 };
    if (actual.estado === "pagado") return { pedido: copiar(actual), recienPagado: false, faltanCodigos: 0 };

    // Todo o nada, como la transaccion de Postgres: se decide que codigos
    // salen y se validan ANTES de tocar nada, para no dejar el pedido pagado
    // sin sus Gift Cards.
    const nuevas: NuevaGiftCard[] = [];
    const entregados: CodigoInventario[] = [];
    let faltanCodigos = 0;
    if (entrega.tipo === "prueba") {
      nuevas.push(...entrega.giftCards);
    } else {
      const tomados = new Set<string>();
      for (const u of entrega.unidades) {
        // Primero lo que este pedido tenia reservado; si falta (por ejemplo, se
        // pago despues de expirar y la reserva ya se libero), lo disponible.
        const candidatos = this.codigosEn(u.productoId, "reservado")
          .filter((c) => c.pedidoId === pedidoId)
          .concat(this.codigosEn(u.productoId, "disponible"))
          .filter((c) => !tomados.has(c.id))
          .slice(0, Math.max(0, u.cantidad));
        faltanCodigos += Math.max(0, u.cantidad - candidatos.length);
        for (const c of candidatos) {
          tomados.add(c.id);
          entregados.push(c);
          nuevas.push({ codigo: c.codigo, montoUsdCentavos: u.montoUsdCentavos, estado: "activa" });
        }
      }
    }
    const codigos = new Set<string>();
    for (const g of nuevas) {
      if (codigos.has(g.codigo) || this.giftCards.has(g.codigo)) {
        throw errorDeUnicidad("gift_cards_codigo_unique");
      }
      codigos.add(g.codigo);
    }

    const ahora = new Date();
    for (const c of entregados) {
      this.codigos.set(c.id, { ...c, estado: "entregado", pedidoId, entregadoEn: ahora });
    }
    // Lo que siga reservado (un pedido de prueba, o una reserva de mas) vuelve
    // al inventario: un pedido de prueba nunca gasta codigos reales.
    this.liberarReservasDe(pedidoId);
    const pagado: Pedido = {
      ...actual,
      estado: "pagado",
      // Un motivo de fallo/expiracion anterior ya no aplica: SPIDI confirmo el pago.
      motivo: null,
      pagoMetodo: datos.metodo,
      pagoBanco: datos.banco,
      pagoReferencia: datos.referencia,
      pagoMontoVes: datos.montoVes,
      pagoTasaBcv: datos.tasaBcv,
      spidiTransaccionId: datos.spidiTransaccionId,
      spidiComprobanteUrl: datos.comprobanteUrl,
      pagadoEn: new Date(datos.pagadoEn),
      actualizadoEn: ahora,
    };
    this.pedidos.set(pedidoId, pagado);
    for (const g of nuevas) {
      this.giftCards.set(g.codigo, {
        id: randomUUID(),
        codigo: g.codigo,
        pedidoId,
        montoUsdCentavos: g.montoUsdCentavos,
        estado: g.estado,
        creadoEn: ahora,
        canjeadoEn: null,
      });
    }
    return { pedido: copiar(pagado), recienPagado: true, faltanCodigos };
  }

  async marcarPedidoTerminado(
    pedidoId: string,
    estado: "fallido" | "expirado",
    motivo: string | null,
  ): Promise<Pedido | undefined> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual) return undefined;
    // Fuera de "pendiente" no cambia nada; se devuelve el pedido como esta.
    if (actual.estado !== "pendiente") return copiar(actual);
    const terminado: Pedido = { ...actual, estado, motivo, actualizadoEn: new Date() };
    this.pedidos.set(pedidoId, terminado);
    this.liberarReservasDe(pedidoId);
    return copiar(terminado);
  }

  async marcarPedidoAcreditado(
    pedidoId: string,
    datos: DatosAcreditacionSpidi,
  ): Promise<{ pedido: Pedido | undefined; recienAcreditado: boolean }> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual) return { pedido: undefined, recienAcreditado: false };
    if (actual.acreditadoEn !== null) return { pedido: copiar(actual), recienAcreditado: false };
    const acreditado: Pedido = {
      ...actual,
      acreditadoEn: new Date(datos.acreditadoEn),
      acreditadoMontoVes: datos.montoVes,
      acreditadoComisionVes: datos.comisionVes,
      acreditadoReferencia: datos.referencia,
      actualizadoEn: new Date(),
    };
    this.pedidos.set(pedidoId, acreditado);
    return { pedido: copiar(acreditado), recienAcreditado: true };
  }

  async marcarAcreditacionFallida(pedidoId: string): Promise<void> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual) return;
    this.pedidos.set(pedidoId, { ...actual, acreditacionFallida: true, actualizadoEn: new Date() });
  }

  async listarPedidosParaConciliar(limite: number): Promise<Pedido[]> {
    const ahora = Date.now();
    const todos = Array.from(this.pedidos.values());
    const pendientes = todos
      .filter(
        (p) =>
          p.estado === "pendiente" &&
          p.spidiSessionId !== null &&
          pendienteEnVentana(p.numero, p.creadoEn.getTime(), ahora),
      )
      .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime() || compararTexto(a.id, b.id));
    const sinAcreditar = todos
      .filter(
        (p) =>
          p.estado === "pagado" &&
          p.acreditadoEn === null &&
          p.pagadoEn !== null &&
          p.pagadoEn.getTime() >= ahora - VENTANA_CONCILIAR_ACREDITACION_MS,
      )
      .sort((a, b) => tiempo(b.pagadoEn) - tiempo(a.pagadoEn) || compararTexto(a.id, b.id));
    return pendientes.concat(sinAcreditar).slice(0, Math.max(0, limite)).map(copiar);
  }

  async listarPedidosConCorreoPendiente(limite: number): Promise<Pedido[]> {
    const ahora = Date.now();
    return Array.from(this.pedidos.values())
      .filter(
        (p) =>
          p.estado === "pagado" &&
          p.pagadoEn !== null &&
          p.pagadoEn.getTime() >= ahora - VENTANA_REINTENTO_CORREOS_MS &&
          (p.correoCompradorEnviadoEn === null || p.avisoVentaEnviadoEn === null) &&
          p.correoIntentos < MAX_INTENTOS_CORREO &&
          // Mismo filtro que en DbStorage: solo los que ya cumplieron su espera.
          ahora - p.actualizadoEn.getTime() >= esperaReintentoCorreo(p.correoIntentos),
      )
      .sort((a, b) => a.actualizadoEn.getTime() - b.actualizadoEn.getTime() || compararTexto(a.id, b.id))
      .slice(0, Math.max(0, limite))
      .map(copiar);
  }

  async reservarIntentoCorreo(pedidoId: string, opciones?: { sinTope?: boolean }): Promise<Pedido | undefined> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual) return undefined;
    if (!opciones?.sinTope && actual.correoIntentos >= MAX_INTENTOS_CORREO) return undefined;
    const reservado: Pedido = {
      ...actual,
      correoIntentos: actual.correoIntentos + 1,
      actualizadoEn: new Date(),
    };
    this.pedidos.set(pedidoId, reservado);
    return copiar(reservado);
  }

  async anotarCorreosEnviados(pedidoId: string, enviados: CorreosEnviados): Promise<void> {
    const actual = this.pedidos.get(pedidoId);
    if (!actual || (!enviados.comprador && !enviados.venta)) return;
    const ahora = new Date();
    this.pedidos.set(pedidoId, {
      ...actual,
      correoCompradorEnviadoEn: actual.correoCompradorEnviadoEn ?? (enviados.comprador ? ahora : null),
      avisoVentaEnviadoEn: actual.avisoVentaEnviadoEn ?? (enviados.venta ? ahora : null),
      actualizadoEn: ahora,
    });
  }

  async buscarPedidos(termino: string, limite: number): Promise<Pedido[]> {
    const { numero, email } = normalizarBusqueda(termino);
    return Array.from(this.pedidos.values())
      .filter((p) => p.numero === numero || p.compradorEmail === email)
      .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime() || compararTexto(a.id, b.id))
      .slice(0, Math.max(0, limite))
      .map(copiar);
  }

  async eventoSpidiYaProcesado(idempotencyKey: string): Promise<boolean> {
    return this.spidiEventos.has(idempotencyKey);
  }

  async registrarEventoSpidi(idempotencyKey: string, evento: string, sessionId: string | null): Promise<void> {
    if (this.spidiEventos.has(idempotencyKey)) return;
    this.spidiEventos.set(idempotencyKey, { evento, sessionId, recibidoEn: new Date() });
  }

  async obtenerGiftCardsDePedido(pedidoId: string): Promise<GiftCard[]> {
    // Mismo orden que en Postgres: por creacion y, a igual fecha (las de un
    // mismo pedido nacen juntas), por codigo, para que el orden sea estable.
    return Array.from(this.giftCards.values())
      .filter((g) => g.pedidoId === pedidoId)
      .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime() || (a.codigo < b.codigo ? -1 : a.codigo > b.codigo ? 1 : 0))
      .map(copiar);
  }

  async obtenerGiftCardsDePedidos(pedidoIds: string[]): Promise<GiftCard[]> {
    const ids = new Set(pedidoIds);
    return Array.from(this.giftCards.values())
      .filter((g) => ids.has(g.pedidoId))
      .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime() || compararTexto(a.codigo, b.codigo))
      .map(copiar);
  }

  async obtenerGiftCardPorCodigo(codigo: string): Promise<GiftCard | undefined> {
    const giftCard = this.giftCards.get(codigo);
    return giftCard ? copiar(giftCard) : undefined;
  }

  async contarStockDisponible(): Promise<Record<string, number>> {
    const stock: Record<string, number> = {};
    for (const c of Array.from(this.codigos.values())) {
      if (c.estado === "disponible") stock[c.productoId] = (stock[c.productoId] ?? 0) + 1;
    }
    return stock;
  }

  async contarInventario(): Promise<Record<string, ConteoInventario>> {
    const conteo = conteoInventarioVacio();
    for (const c of Array.from(this.codigos.values())) {
      if (!esEstadoInventario(c.estado)) continue;
      const fila = (conteo[c.productoId] ??= { disponible: 0, reservado: 0, entregado: 0, anulado: 0 });
      fila[c.estado]++;
    }
    return conteo;
  }

  async agregarCodigosInventario(productoId: string, codigos: string[]): Promise<{ agregados: number; duplicados: number }> {
    const ahora = new Date();
    let agregados = 0;
    let duplicados = 0;
    for (const codigo of codigos) {
      // Repetido en el inventario (en cualquier estado) o ya emitido como Gift Card.
      if (this.codigoAId.has(codigo) || this.giftCards.has(codigo)) {
        duplicados++;
        continue;
      }
      const id = randomUUID();
      this.codigos.set(id, {
        id,
        productoId,
        codigo,
        estado: "disponible",
        pedidoId: null,
        creadoEn: ahora,
        reservadoEn: null,
        entregadoEn: null,
      });
      this.codigoAId.set(codigo, id);
      agregados++;
    }
    return { agregados, duplicados };
  }

  async listarCodigosInventario(filtro: FiltroCodigosInventario): Promise<CodigoInventarioConPedido[]> {
    const despues = filtro.despues;
    return Array.from(this.codigos.values())
      .filter(
        (c) =>
          (!filtro.productoId || c.productoId === filtro.productoId) &&
          (!filtro.estado || c.estado === filtro.estado) &&
          (!despues || vaDespues(c.creadoEn, c.id, despues)),
      )
      .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime() || compararTexto(b.id, a.id))
      .slice(0, Math.max(0, filtro.limite))
      .map((c) => this.conPedido(c));
  }

  async anularCodigoInventario(id: string): Promise<{ codigo: CodigoInventarioConPedido | undefined; anulado: boolean }> {
    const actual = this.codigos.get(id);
    if (!actual) return { codigo: undefined, anulado: false };
    if (actual.estado !== "disponible") return { codigo: this.conPedido(actual), anulado: false };
    const anulado: CodigoInventario = { ...actual, estado: "anulado" };
    this.codigos.set(id, anulado);
    return { codigo: this.conPedido(anulado), anulado: true };
  }

  async liberarReservasHuerfanas(pendientesCreadosAntesDe: Date): Promise<number> {
    const limite = pendientesCreadosAntesDe.getTime();
    let liberadas = 0;
    for (const c of Array.from(this.codigos.values())) {
      if (c.estado !== "reservado") continue;
      const pedido = c.pedidoId ? this.pedidos.get(c.pedidoId) : undefined;
      // Sin pedido (no deberia pasar), con un pedido que ya no se va a pagar o
      // con un pendiente cuyo enlace de pago ya murio hace rato.
      const pendienteVencido =
        pedido !== undefined && pedido.estado === "pendiente" && pedido.creadoEn.getTime() < limite;
      if (!pedido || ESTADOS_QUE_LIBERAN.includes(pedido.estado) || pendienteVencido) {
        this.codigos.set(c.id, { ...c, estado: "disponible", pedidoId: null, reservadoEn: null });
        liberadas++;
      }
    }
    return liberadas;
  }

  async contarUnidadesReservadasPorEmail(email: string): Promise<number> {
    let unidades = 0;
    for (const c of Array.from(this.codigos.values())) {
      if (c.estado !== "reservado" || !c.pedidoId) continue;
      const pedido = this.pedidos.get(c.pedidoId);
      if (pedido && pedido.estado === "pendiente" && pedido.compradorEmail === email) unidades++;
    }
    return unidades;
  }

  async completarCodigosPedido(pedidoId: string, unidades: UnidadesPedido): Promise<ResultadoCompletarCodigos> {
    // Sin ningun await: revisar y entregar es atomico (ver la nota de arriba).
    const actual = this.pedidos.get(pedidoId);
    if (!actual) return { resultado: "no_existe" };
    if (actual.estado !== "pagado") return { resultado: "no_pagado", pedido: copiar(actual) };
    if (esNumeroPedidoDePrueba(actual.numero)) return { resultado: "prueba", pedido: copiar(actual) };

    const emitidas = Array.from(this.giftCards.values()).filter((g) => g.pedidoId === pedidoId).length;
    const entregadosPorProducto = new Map<string, number>();
    for (const c of Array.from(this.codigos.values())) {
      if (c.pedidoId === pedidoId && c.estado === "entregado") {
        entregadosPorProducto.set(c.productoId, (entregadosPorProducto.get(c.productoId) ?? 0) + 1);
      }
    }
    const { total, porProducto } = faltantesPorProducto(actual.items, unidades, emitidas, entregadosPorProducto);
    if (total <= 0) return { resultado: "completo", pedido: copiar(actual) };

    // Se elige todo antes de tocar nada, como la transaccion de Postgres.
    const elegidos: Array<{ codigo: CodigoInventario; montoUsdCentavos: number }> = [];
    let cupo = total;
    for (const p of porProducto) {
      if (cupo <= 0) break;
      const tomados = this.codigosEn(p.productoId, "disponible").slice(0, Math.min(p.faltan, cupo));
      for (const c of tomados) elegidos.push({ codigo: c, montoUsdCentavos: p.montoUsdCentavos });
      cupo -= tomados.length;
    }
    for (const e of elegidos) {
      if (this.giftCards.has(e.codigo.codigo)) throw errorDeUnicidad("gift_cards_codigo_unique");
    }

    const ahora = new Date();
    for (const e of elegidos) {
      this.codigos.set(e.codigo.id, { ...e.codigo, estado: "entregado", pedidoId, entregadoEn: ahora });
      this.giftCards.set(e.codigo.codigo, {
        id: randomUUID(),
        codigo: e.codigo.codigo,
        pedidoId,
        montoUsdCentavos: e.montoUsdCentavos,
        estado: "activa",
        creadoEn: ahora,
        canjeadoEn: null,
      });
    }
    const pedido: Pedido = elegidos.length > 0 ? { ...actual, actualizadoEn: ahora } : actual;
    this.pedidos.set(pedidoId, pedido);
    return {
      resultado: "completado",
      pedido: copiar(pedido),
      entregados: elegidos.length,
      faltanCodigos: total - elegidos.length,
    };
  }

  async listarPedidosAdmin(filtro: FiltroPedidosAdmin): Promise<Pedido[]> {
    const busqueda = filtro.buscar ? normalizarBusqueda(filtro.buscar) : null;
    const despues = filtro.despues;
    return Array.from(this.pedidos.values())
      .filter(
        (p) =>
          (!filtro.estado || p.estado === filtro.estado) &&
          (!busqueda || p.numero === busqueda.numero || p.compradorEmail === busqueda.email) &&
          (!despues || vaDespues(p.creadoEn, p.id, despues)),
      )
      .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime() || compararTexto(b.id, a.id))
      .slice(0, Math.max(0, filtro.limite))
      .map(copiar);
  }

  async resumenVentas(p: { desdeHoy: Date; desdeMes: Date; incluirPrueba: boolean }): Promise<ResumenVentasStorage> {
    const resumen: ResumenVentasStorage = {
      pagadosHoy: 0,
      pagadosMes: 0,
      totalUsdCentavosHoy: 0,
      totalUsdCentavosMes: 0,
      pendientes: 0,
      sinCodigos: 0,
    };
    const giftCardsPorPedido = new Map<string, number>();
    for (const g of Array.from(this.giftCards.values())) {
      giftCardsPorPedido.set(g.pedidoId, (giftCardsPorPedido.get(g.pedidoId) ?? 0) + 1);
    }
    for (const pedido of Array.from(this.pedidos.values())) {
      if (!p.incluirPrueba && esNumeroPedidoDePrueba(pedido.numero)) continue;
      if (pedido.estado === "pendiente") resumen.pendientes++;
      if (pedido.estado !== "pagado") continue;
      const pagadoEn = tiempo(pedido.pagadoEn);
      if (pagadoEn >= p.desdeMes.getTime()) {
        resumen.pagadosMes++;
        resumen.totalUsdCentavosMes += pedido.totalUsdCentavos;
      }
      if (pagadoEn >= p.desdeHoy.getTime()) {
        resumen.pagadosHoy++;
        resumen.totalUsdCentavosHoy += pedido.totalUsdCentavos;
      }
      if (unidadesGiftCard(pedido.items) > (giftCardsPorPedido.get(pedido.id) ?? 0)) resumen.sinCodigos++;
    }
    return resumen;
  }

  async canjearGiftCard(codigo: string): Promise<{ giftCard: GiftCard | undefined; recienCanjeada: boolean }> {
    const actual = this.giftCards.get(codigo);
    if (!actual) return { giftCard: undefined, recienCanjeada: false };
    // Solo una activa se canjea; una canjeada, anulada o de prueba se devuelve
    // tal cual.
    if (actual.estado !== "activa") return { giftCard: copiar(actual), recienCanjeada: false };
    const canjeada: GiftCard = { ...actual, estado: "canjeada", canjeadoEn: new Date() };
    this.giftCards.set(codigo, canjeada);
    return { giftCard: copiar(canjeada), recienCanjeada: true };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      phone: insertMessage.phone || null,
      company: insertMessage.company || null,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createEncuestaVasos(data: InsertEncuestaVasos): Promise<EncuestaVasos> {
    const id = randomUUID();
    const encuesta: EncuestaVasos = {
      id,
      bebida: data.bebida,
      calificacion: String(data.calificacion),
      comentario: data.comentario || null,
      fecha: new Date(),
    };
    this.encuestasVasos.set(id, encuesta);
    return encuesta;
  }

  async getEncuestasVasos(): Promise<EncuestaVasos[]> {
    return Array.from(this.encuestasVasos.values()).sort(
      (a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0)
    );
  }
}

// Mismo contrato que MemStorage, pero contra Postgres: los datos sobreviven a
// los reinicios y despliegues.
export class DbStorage implements IStorage {
  readonly persistente = true;

  constructor(private db: NonNullable<typeof baseDatos>) {
    // Se crean las tablas al arrancar; si falla (base caida), se reintenta en
    // la siguiente llamada que las necesite.
    this.asegurarInventario().catch((error) => console.error("[tienda] No se pudieron crear las tablas:", error));
  }

  // Las transiciones de estado se hacen con UPDATE ... WHERE <condicion>
  // RETURNING: Postgres bloquea la fila y revalida la condicion, asi que de dos
  // llamadas simultaneas solo una ve la fila "sin cambiar" y la modifica. Si no
  // vuelve fila, nada cambio y se lee el pedido como esta para devolverlo.

  private async pedidoPorId(id: string): Promise<Pedido | undefined> {
    const filas = await this.db.select().from(pedidos).where(eq(pedidos.id, id)).limit(1);
    return filas[0];
  }

  // Las tablas de la tienda (pedidos, gift_cards, spidi_eventos y
  // codigos_inventario) se crean solas al arrancar o la primera vez que hacen
  // falta, si aun no existen: asi el despliegue no depende de que alguien corra
  // db:push.
  // El SQL es el mismo que generaria drizzle-kit para shared/schema.ts (mismos
  // nombres de restricciones e indices), de modo que un db:push posterior no
  // ve diferencias. El candado consultivo evita que dos instancias la creen a
  // la vez. Si falla, se reintenta en la siguiente llamada.
  private inventarioListo: Promise<void> | null = null;

  private asegurarInventario(): Promise<void> {
    if (!this.inventarioListo) {
      this.inventarioListo = this.db
        .transaction(async (tx) => {
          await tx.execute(sql`select pg_advisory_xact_lock(hashtext('todovending_codigos_inventario'))`);
          await tx.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS "pedidos" (
              "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
              "numero" text NOT NULL,
              "clave_acceso" text NOT NULL,
              "clave_idempotencia" text,
              "estado" text DEFAULT 'pendiente' NOT NULL,
              "items" jsonb NOT NULL,
              "total_usd_centavos" integer NOT NULL,
              "comprador_nombre" text NOT NULL,
              "comprador_email" text NOT NULL,
              "comprador_telefono" text,
              "spidi_session_id" text,
              "spidi_payment_url" text,
              "motivo" text,
              "pago_metodo" text,
              "pago_banco" text,
              "pago_referencia" text,
              "pago_monto_ves" double precision,
              "pago_tasa_bcv" double precision,
              "spidi_transaccion_id" integer,
              "spidi_comprobante_url" text,
              "pagado_en" timestamp,
              "acreditado_en" timestamp,
              "acreditado_monto_ves" double precision,
              "acreditado_comision_ves" double precision,
              "acreditado_referencia" text,
              "acreditacion_fallida" boolean DEFAULT false NOT NULL,
              "correo_comprador_enviado_en" timestamp,
              "aviso_venta_enviado_en" timestamp,
              "correo_intentos" integer DEFAULT 0 NOT NULL,
              "creado_en" timestamp DEFAULT now() NOT NULL,
              "actualizado_en" timestamp DEFAULT now() NOT NULL,
              CONSTRAINT "pedidos_numero_unique" UNIQUE("numero"),
              CONSTRAINT "pedidos_clave_idempotencia_unique" UNIQUE("clave_idempotencia"),
              CONSTRAINT "pedidos_spidi_session_id_unique" UNIQUE("spidi_session_id")
            )`));
          await tx.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS "gift_cards" (
              "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
              "codigo" text NOT NULL,
              "pedido_id" varchar NOT NULL,
              "monto_usd_centavos" integer NOT NULL,
              "estado" text DEFAULT 'activa' NOT NULL,
              "creado_en" timestamp DEFAULT now() NOT NULL,
              "canjeado_en" timestamp,
              CONSTRAINT "gift_cards_codigo_unique" UNIQUE("codigo"),
              CONSTRAINT "gift_cards_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action
            )`));
          await tx.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS "spidi_eventos" (
              "idempotency_key" text PRIMARY KEY NOT NULL,
              "evento" text NOT NULL,
              "session_id" text,
              "recibido_en" timestamp DEFAULT now() NOT NULL
            )`));
          await tx.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS "codigos_inventario" (
              "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
              "producto_id" text NOT NULL,
              "codigo" text NOT NULL,
              "estado" text DEFAULT 'disponible' NOT NULL,
              "pedido_id" varchar,
              "creado_en" timestamp DEFAULT now() NOT NULL,
              "reservado_en" timestamp,
              "entregado_en" timestamp,
              CONSTRAINT "codigos_inventario_codigo_unique" UNIQUE("codigo"),
              CONSTRAINT "codigos_inventario_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action
            )`));
          await tx.execute(
            sql.raw(
              `CREATE INDEX IF NOT EXISTS "codigos_inventario_producto_estado_idx" ON "codigos_inventario" USING btree ("producto_id","estado")`,
            ),
          );
          await tx.execute(
            sql.raw(`CREATE INDEX IF NOT EXISTS "codigos_inventario_pedido_idx" ON "codigos_inventario" USING btree ("pedido_id")`),
          );
        })
        .catch((error) => {
          this.inventarioListo = null;
          throw error;
        });
    }
    return this.inventarioListo;
  }

  // Reservas de un pedido que vuelven a "disponible", solo si el pedido ya no
  // se va a pagar (fallido, expirado o error). Va en una sola sentencia: si a la
  // vez se esta pagando ese pedido, la fila del codigo esta bloqueada y, al
  // soltarse, Postgres revalida estado = 'reservado' (ya sera "entregado").
  private async liberarReservasDe(ejecutor: Pick<NonNullable<typeof baseDatos>, "update">, pedidoId: string): Promise<void> {
    await ejecutor
      .update(codigosInventario)
      .set({ estado: "disponible", pedidoId: null, reservadoEn: null })
      .where(
        and(
          eq(codigosInventario.estado, "reservado"),
          eq(codigosInventario.pedidoId, pedidoId),
          sql`exists (select 1 from ${pedidos} where ${pedidos.id} = ${pedidoId} and ${inArray(pedidos.estado, ESTADOS_QUE_LIBERAN)})`,
        ),
      );
  }

  async crearPedido(nuevo: NuevoPedido, reservas: ReservaStock[] = []): Promise<Pedido> {
    const porProducto = agruparReservas(reservas);
    if (porProducto.length > 0) await this.asegurarInventario();
    // Una sola transaccion: el pedido nace con sus codigos reservados o no nace.
    // Si numero o claveIdempotencia ya existen, Postgres lanza el error 23505
    // (ver esViolacionDeUnicidad) y el llamador decide si reintenta.
    return this.db.transaction(async (tx) => {
      const filas = await tx
        .insert(pedidos)
        .values({
          numero: nuevo.numero,
          claveAcceso: nuevo.claveAcceso,
          claveIdempotencia: nuevo.claveIdempotencia,
          estado: "pendiente",
          items: nuevo.items,
          totalUsdCentavos: nuevo.totalUsdCentavos,
          compradorNombre: nuevo.compradorNombre,
          compradorEmail: nuevo.compradorEmail,
          compradorTelefono: nuevo.compradorTelefono,
        })
        .returning();
      const pedido = filas[0];
      const ahora = new Date();
      for (const r of porProducto) {
        // FOR UPDATE SKIP LOCKED: dos checkouts simultaneos nunca toman el mismo
        // codigo; el que no alcanza a bloquear suficientes recibe SIN_STOCK.
        const elegidos = await tx
          .select({ id: codigosInventario.id })
          .from(codigosInventario)
          .where(and(eq(codigosInventario.productoId, r.productoId), eq(codigosInventario.estado, "disponible")))
          .orderBy(asc(codigosInventario.creadoEn), asc(codigosInventario.id))
          .limit(r.cantidad)
          .for("update", { skipLocked: true });
        // Lanzar dentro de la transaccion la revierte entera (tambien el pedido).
        if (elegidos.length < r.cantidad) throw new SinStockError(r.productoId);
        await tx
          .update(codigosInventario)
          .set({ estado: "reservado", pedidoId: pedido.id, reservadoEn: ahora })
          .where(inArray(codigosInventario.id, elegidos.map((e) => e.id)));
      }
      return pedido;
    });
  }

  async obtenerPedido(id: string): Promise<Pedido | undefined> {
    return this.pedidoPorId(id);
  }

  async obtenerPedidoPorSesionSpidi(sessionId: string): Promise<Pedido | undefined> {
    const filas = await this.db.select().from(pedidos).where(eq(pedidos.spidiSessionId, sessionId)).limit(1);
    return filas[0];
  }

  async obtenerPedidoPorClaveIdempotencia(clave: string): Promise<Pedido | undefined> {
    const filas = await this.db.select().from(pedidos).where(eq(pedidos.claveIdempotencia, clave)).limit(1);
    return filas[0];
  }

  async asignarSesionSpidi(pedidoId: string, sessionId: string, paymentUrl: string): Promise<Pedido | undefined> {
    const filas = await this.db
      .update(pedidos)
      .set({ spidiSessionId: sessionId, spidiPaymentUrl: paymentUrl, actualizadoEn: new Date() })
      .where(eq(pedidos.id, pedidoId))
      .returning();
    return filas[0];
  }

  async marcarPedidoError(pedidoId: string, motivo: string): Promise<void> {
    await this.asegurarInventario();
    // En una transaccion: el pedido pasa a error y sus reservas vuelven al
    // inventario juntos.
    await this.db.transaction(async (tx) => {
      await tx
        .update(pedidos)
        .set({ estado: "error", motivo, actualizadoEn: new Date() })
        .where(and(eq(pedidos.id, pedidoId), eq(pedidos.estado, "pendiente"), isNull(pedidos.spidiSessionId)));
      await this.liberarReservasDe(tx, pedidoId);
    });
  }

  async marcarCheckoutsInterrumpidos(creadosAntesDe: Date, motivo: string): Promise<number> {
    await this.asegurarInventario();
    return this.db.transaction(async (tx) => {
      // La condicion completa va en el WHERE: si otra peticion asigno la sesion
      // o cambio el estado un instante antes, esa fila ya no cumple y no se toca.
      const filas = await tx
        .update(pedidos)
        .set({ estado: "error", motivo, actualizadoEn: new Date() })
        .where(
          and(
            eq(pedidos.estado, "pendiente"),
            isNull(pedidos.spidiSessionId),
            lt(pedidos.creadoEn, creadosAntesDe),
          ),
        )
        .returning({ id: pedidos.id });
      for (const { id } of filas) await this.liberarReservasDe(tx, id);
      return filas.length;
    });
  }

  async marcarPedidoPagado(pedidoId: string, datos: DatosPagoSpidi, entrega: EntregaPago): Promise<ResultadoPago> {
    await this.asegurarInventario();
    // Una sola transaccion: o el pedido queda pagado CON sus Gift Cards (y sus
    // codigos del inventario entregados), o no cambia nada (por ejemplo, si
    // choca un codigo, se revierte todo y el llamador puede reintentar).
    return this.db.transaction(async (tx): Promise<ResultadoPago> => {
      const filas = await tx
        .update(pedidos)
        .set({
          estado: "pagado",
          // Un motivo de fallo/expiracion anterior ya no aplica: SPIDI confirmo el pago.
          motivo: null,
          pagoMetodo: datos.metodo,
          pagoBanco: datos.banco,
          pagoReferencia: datos.referencia,
          pagoMontoVes: datos.montoVes,
          pagoTasaBcv: datos.tasaBcv,
          spidiTransaccionId: datos.spidiTransaccionId,
          spidiComprobanteUrl: datos.comprobanteUrl,
          pagadoEn: datos.pagadoEn,
          actualizadoEn: new Date(),
        })
        .where(and(eq(pedidos.id, pedidoId), ne(pedidos.estado, "pagado")))
        .returning();

      if (filas.length === 0) {
        // Ya estaba pagado (lo marco otra llamada) o no existe: no se emiten codigos.
        const actual = await tx.select().from(pedidos).where(eq(pedidos.id, pedidoId)).limit(1);
        return { pedido: actual[0], recienPagado: false, faltanCodigos: 0 };
      }
      // Desde aqui la fila del pedido esta bloqueada hasta el final de la
      // transaccion: otra llamada que intente pagarlo espera y luego ve
      // "pagado" (sin entregar nada).

      const nuevas: NuevaGiftCard[] = [];
      let faltanCodigos = 0;
      if (entrega.tipo === "prueba") {
        nuevas.push(...entrega.giftCards);
      } else {
        const ahora = new Date();
        for (const u of entrega.unidades) {
          if (u.cantidad <= 0) continue;
          // Primero lo que este pedido tenia reservado (bloqueado para que nadie
          // lo libere mientras tanto).
          let tomados = await tx
            .select({ id: codigosInventario.id, codigo: codigosInventario.codigo })
            .from(codigosInventario)
            .where(
              and(
                eq(codigosInventario.pedidoId, pedidoId),
                eq(codigosInventario.estado, "reservado"),
                eq(codigosInventario.productoId, u.productoId),
              ),
            )
            .orderBy(asc(codigosInventario.creadoEn), asc(codigosInventario.id))
            .limit(u.cantidad)
            .for("update");
          // Si falta (se pago despues de expirar y la reserva ya se libero), lo
          // que haya disponible en este momento.
          if (tomados.length < u.cantidad) {
            const extra = await tx
              .select({ id: codigosInventario.id, codigo: codigosInventario.codigo })
              .from(codigosInventario)
              .where(and(eq(codigosInventario.productoId, u.productoId), eq(codigosInventario.estado, "disponible")))
              .orderBy(asc(codigosInventario.creadoEn), asc(codigosInventario.id))
              .limit(u.cantidad - tomados.length)
              .for("update", { skipLocked: true });
            tomados = tomados.concat(extra);
          }
          faltanCodigos += u.cantidad - tomados.length;
          if (tomados.length === 0) continue;
          // Ya "entregado": una segunda linea del mismo producto no los vuelve
          // a ver, y nada los devuelve al inventario.
          await tx
            .update(codigosInventario)
            .set({ estado: "entregado", pedidoId, entregadoEn: ahora })
            .where(inArray(codigosInventario.id, tomados.map((t) => t.id)));
          for (const t of tomados) {
            nuevas.push({ codigo: t.codigo, montoUsdCentavos: u.montoUsdCentavos, estado: "activa" });
          }
        }
      }
      // Lo que siga reservado (todo, en un pedido de prueba: nunca gasta
      // codigos reales) vuelve al inventario. El pedido ya esta "pagado", asi
      // que aqui no sirve liberarReservasDe (que exige un pedido fallido).
      await tx
        .update(codigosInventario)
        .set({ estado: "disponible", pedidoId: null, reservadoEn: null })
        .where(and(eq(codigosInventario.pedidoId, pedidoId), eq(codigosInventario.estado, "reservado")));

      if (nuevas.length > 0) {
        await tx.insert(giftCards).values(
          nuevas.map((g) => ({
            codigo: g.codigo,
            pedidoId,
            montoUsdCentavos: g.montoUsdCentavos,
            // Siempre explicito: el default de la columna es "activa", y una
            // Gift Card de prueba nunca debe quedar canjeable por omision.
            estado: g.estado,
          })),
        );
      }
      return { pedido: filas[0], recienPagado: true, faltanCodigos };
    });
  }

  async marcarPedidoTerminado(
    pedidoId: string,
    estado: "fallido" | "expirado",
    motivo: string | null,
  ): Promise<Pedido | undefined> {
    await this.asegurarInventario();
    const filas = await this.db.transaction(async (tx) => {
      const cambiadas = await tx
        .update(pedidos)
        .set({ estado, motivo, actualizadoEn: new Date() })
        .where(and(eq(pedidos.id, pedidoId), eq(pedidos.estado, "pendiente")))
        .returning();
      // Con el pedido ya fallido/expirado, sus reservas vuelven al inventario.
      await this.liberarReservasDe(tx, pedidoId);
      return cambiadas;
    });
    // Fuera de "pendiente" no cambia nada; se devuelve el pedido como esta.
    return filas[0] ?? (await this.pedidoPorId(pedidoId));
  }

  async marcarPedidoAcreditado(
    pedidoId: string,
    datos: DatosAcreditacionSpidi,
  ): Promise<{ pedido: Pedido | undefined; recienAcreditado: boolean }> {
    const filas = await this.db
      .update(pedidos)
      .set({
        acreditadoEn: datos.acreditadoEn,
        acreditadoMontoVes: datos.montoVes,
        acreditadoComisionVes: datos.comisionVes,
        acreditadoReferencia: datos.referencia,
        actualizadoEn: new Date(),
      })
      .where(and(eq(pedidos.id, pedidoId), isNull(pedidos.acreditadoEn)))
      .returning();
    if (filas.length > 0) return { pedido: filas[0], recienAcreditado: true };
    return { pedido: await this.pedidoPorId(pedidoId), recienAcreditado: false };
  }

  async marcarAcreditacionFallida(pedidoId: string): Promise<void> {
    await this.db
      .update(pedidos)
      .set({ acreditacionFallida: true, actualizadoEn: new Date() })
      .where(eq(pedidos.id, pedidoId));
  }

  async listarPedidosParaConciliar(limite: number): Promise<Pedido[]> {
    if (limite <= 0) return [];
    const ahora = Date.now();
    // Misma regla que pendienteEnVentana: cualquier pendiente de las ultimas
    // 24 h, y ademas los reales (numero que no empieza con TVP-, sin distinguir
    // mayusculas) de los ultimos 7 dias.
    const pendientes = await this.db
      .select()
      .from(pedidos)
      .where(
        and(
          eq(pedidos.estado, "pendiente"),
          isNotNull(pedidos.spidiSessionId),
          or(
            gte(pedidos.creadoEn, new Date(ahora - VENTANA_CONCILIAR_PENDIENTES_MS)),
            and(
              notIlike(pedidos.numero, PATRON_NUMERO_PRUEBA),
              gte(pedidos.creadoEn, new Date(ahora - VENTANA_CONCILIAR_PENDIENTES_REALES_MS)),
            ),
          ),
        ),
      )
      .orderBy(desc(pedidos.creadoEn), asc(pedidos.id))
      .limit(limite);
    const restantes = limite - pendientes.length;
    if (restantes <= 0) return pendientes;
    // gte deja fuera los pagadoEn null (null nunca cumple una comparacion).
    const sinAcreditar = await this.db
      .select()
      .from(pedidos)
      .where(
        and(
          eq(pedidos.estado, "pagado"),
          isNull(pedidos.acreditadoEn),
          gte(pedidos.pagadoEn, new Date(ahora - VENTANA_CONCILIAR_ACREDITACION_MS)),
        ),
      )
      .orderBy(desc(pedidos.pagadoEn), asc(pedidos.id))
      .limit(restantes);
    return pendientes.concat(sinAcreditar);
  }

  async listarPedidosConCorreoPendiente(limite: number): Promise<Pedido[]> {
    if (limite <= 0) return [];
    const ahora = Date.now();
    // "Ya le toca": una condicion por fila de ESPERA_REINTENTO_CORREO_MS
    // (0 intentos -> primera espera, 1 -> segunda, ...; la ultima vale para
    // todos los que llevan mas). Las fechas limite se calculan aqui con el
    // reloj del servidor, igual que MemStorage, y drizzle las convierte con la
    // columna como en cualquier otra comparacion.
    const ultimo = ESPERA_REINTENTO_CORREO_MS.length - 1;
    const yaToca = or(
      ...ESPERA_REINTENTO_CORREO_MS.map((espera, i) =>
        and(
          i === 0
            ? lte(pedidos.correoIntentos, 0)
            : i === ultimo
              ? gte(pedidos.correoIntentos, i)
              : eq(pedidos.correoIntentos, i),
          lte(pedidos.actualizadoEn, new Date(ahora - espera)),
        ),
      ),
    );
    return this.db
      .select()
      .from(pedidos)
      .where(
        and(
          eq(pedidos.estado, "pagado"),
          gte(pedidos.pagadoEn, new Date(ahora - VENTANA_REINTENTO_CORREOS_MS)),
          or(isNull(pedidos.correoCompradorEnviadoEn), isNull(pedidos.avisoVentaEnviadoEn)),
          lt(pedidos.correoIntentos, MAX_INTENTOS_CORREO),
          yaToca,
        ),
      )
      .orderBy(asc(pedidos.actualizadoEn), asc(pedidos.id))
      .limit(limite);
  }

  async reservarIntentoCorreo(pedidoId: string, opciones?: { sinTope?: boolean }): Promise<Pedido | undefined> {
    // UPDATE condicional: el contador sube dentro de la base y Postgres revalida
    // el tope con la fila bloqueada, asi que dos envios simultaneos (o dos
    // instancias) nunca pasan juntos del tope. Sin fila de vuelta, no se envia.
    const filas = await this.db
      .update(pedidos)
      .set({ correoIntentos: sql`${pedidos.correoIntentos} + 1`, actualizadoEn: new Date() })
      .where(
        opciones?.sinTope
          ? eq(pedidos.id, pedidoId)
          : and(eq(pedidos.id, pedidoId), lt(pedidos.correoIntentos, MAX_INTENTOS_CORREO)),
      )
      .returning();
    return filas[0];
  }

  async anotarCorreosEnviados(pedidoId: string, enviados: CorreosEnviados): Promise<void> {
    if (!enviados.comprador && !enviados.venta) return;
    const ahora = new Date();
    // Solo las horas: el intento ya se conto al reservarlo. coalesce conserva
    // la primera hora de envio si ya habia una. sql.param con la columna
    // convierte la fecha igual que un set() normal de drizzle (texto ISO en UTC).
    await this.db
      .update(pedidos)
      .set({
        ...(enviados.comprador
          ? {
              correoCompradorEnviadoEn: sql`coalesce(${pedidos.correoCompradorEnviadoEn}, ${sql.param(ahora, pedidos.correoCompradorEnviadoEn)})`,
            }
          : {}),
        ...(enviados.venta
          ? {
              avisoVentaEnviadoEn: sql`coalesce(${pedidos.avisoVentaEnviadoEn}, ${sql.param(ahora, pedidos.avisoVentaEnviadoEn)})`,
            }
          : {}),
        actualizadoEn: ahora,
      })
      .where(eq(pedidos.id, pedidoId));
  }

  async buscarPedidos(termino: string, limite: number): Promise<Pedido[]> {
    if (limite <= 0) return [];
    const { numero, email } = normalizarBusqueda(termino);
    return this.db
      .select()
      .from(pedidos)
      .where(or(eq(pedidos.numero, numero), eq(pedidos.compradorEmail, email)))
      .orderBy(desc(pedidos.creadoEn), asc(pedidos.id))
      .limit(limite);
  }

  async eventoSpidiYaProcesado(idempotencyKey: string): Promise<boolean> {
    const filas = await this.db
      .select({ idempotencyKey: spidiEventos.idempotencyKey })
      .from(spidiEventos)
      .where(eq(spidiEventos.idempotencyKey, idempotencyKey))
      .limit(1);
    return filas.length > 0;
  }

  async registrarEventoSpidi(idempotencyKey: string, evento: string, sessionId: string | null): Promise<void> {
    // SPIDI reintenta los avisos: si la clave ya existe no es un error.
    await this.db.insert(spidiEventos).values({ idempotencyKey, evento, sessionId }).onConflictDoNothing();
  }

  async obtenerGiftCardsDePedido(pedidoId: string): Promise<GiftCard[]> {
    // Las de un mismo pedido nacen en la misma transaccion (misma fecha), asi
    // que el codigo desempata para que el orden sea siempre el mismo.
    return this.db
      .select()
      .from(giftCards)
      .where(eq(giftCards.pedidoId, pedidoId))
      .orderBy(asc(giftCards.creadoEn), asc(giftCards.codigo));
  }

  async obtenerGiftCardsDePedidos(pedidoIds: string[]): Promise<GiftCard[]> {
    if (pedidoIds.length === 0) return [];
    return this.db
      .select()
      .from(giftCards)
      .where(inArray(giftCards.pedidoId, pedidoIds))
      .orderBy(asc(giftCards.creadoEn), asc(giftCards.codigo));
  }

  async obtenerGiftCardPorCodigo(codigo: string): Promise<GiftCard | undefined> {
    const filas = await this.db.select().from(giftCards).where(eq(giftCards.codigo, codigo)).limit(1);
    return filas[0];
  }

  // === Inventario ===

  // Columnas del codigo mas el numero del pedido que lo tiene (left join).
  private selectCodigoConPedido() {
    return this.db
      .select({
        id: codigosInventario.id,
        productoId: codigosInventario.productoId,
        codigo: codigosInventario.codigo,
        estado: codigosInventario.estado,
        pedidoId: codigosInventario.pedidoId,
        creadoEn: codigosInventario.creadoEn,
        reservadoEn: codigosInventario.reservadoEn,
        entregadoEn: codigosInventario.entregadoEn,
        pedidoNumero: pedidos.numero,
      })
      .from(codigosInventario)
      .leftJoin(pedidos, eq(pedidos.id, codigosInventario.pedidoId));
  }

  async contarStockDisponible(): Promise<Record<string, number>> {
    await this.asegurarInventario();
    const filas = await this.db
      .select({ productoId: codigosInventario.productoId, cantidad: sql<number>`count(*)::int` })
      .from(codigosInventario)
      .where(eq(codigosInventario.estado, "disponible"))
      .groupBy(codigosInventario.productoId);
    const stock: Record<string, number> = {};
    for (const f of filas) stock[f.productoId] = Number(f.cantidad);
    return stock;
  }

  async contarInventario(): Promise<Record<string, ConteoInventario>> {
    await this.asegurarInventario();
    const filas = await this.db
      .select({
        productoId: codigosInventario.productoId,
        estado: codigosInventario.estado,
        cantidad: sql<number>`count(*)::int`,
      })
      .from(codigosInventario)
      .groupBy(codigosInventario.productoId, codigosInventario.estado);
    const conteo = conteoInventarioVacio();
    for (const f of filas) {
      if (!esEstadoInventario(f.estado)) continue;
      const fila = (conteo[f.productoId] ??= { disponible: 0, reservado: 0, entregado: 0, anulado: 0 });
      fila[f.estado] = Number(f.cantidad);
    }
    return conteo;
  }

  async agregarCodigosInventario(productoId: string, codigos: string[]): Promise<{ agregados: number; duplicados: number }> {
    if (codigos.length === 0) return { agregados: 0, duplicados: 0 };
    await this.asegurarInventario();
    return this.db.transaction(async (tx) => {
      // Un codigo que ya se emitio como Gift Card tampoco se acepta: chocaria
      // con gift_cards.codigo al entregarlo.
      const emitidos = await tx
        .select({ codigo: giftCards.codigo })
        .from(giftCards)
        .where(inArray(giftCards.codigo, codigos));
      const yaEmitidos = new Set(emitidos.map((e) => e.codigo));
      const nuevos = codigos.filter((c) => !yaEmitidos.has(c));
      if (nuevos.length === 0) return { agregados: 0, duplicados: codigos.length };
      // Los que ya estan en el inventario los descarta la columna unica, sin
      // error (tambien si otra carga simultanea los agrega primero).
      const insertados = await tx
        .insert(codigosInventario)
        .values(nuevos.map((codigo) => ({ productoId, codigo, estado: "disponible" })))
        .onConflictDoNothing({ target: codigosInventario.codigo })
        .returning({ id: codigosInventario.id });
      return { agregados: insertados.length, duplicados: codigos.length - insertados.length };
    });
  }

  async listarCodigosInventario(filtro: FiltroCodigosInventario): Promise<CodigoInventarioConPedido[]> {
    if (filtro.limite <= 0) return [];
    await this.asegurarInventario();
    const condiciones: SQL[] = [];
    if (filtro.productoId) condiciones.push(eq(codigosInventario.productoId, filtro.productoId));
    if (filtro.estado) condiciones.push(eq(codigosInventario.estado, filtro.estado));
    if (filtro.despues) condiciones.push(antesDelCursor(codigosInventario.creadoEn, codigosInventario.id, filtro.despues));
    return this.selectCodigoConPedido()
      .where(condiciones.length > 0 ? and(...condiciones) : undefined)
      .orderBy(desc(milisegundos(codigosInventario.creadoEn)), desc(codigosInventario.id))
      .limit(filtro.limite);
  }

  async anularCodigoInventario(id: string): Promise<{ codigo: CodigoInventarioConPedido | undefined; anulado: boolean }> {
    await this.asegurarInventario();
    // Condicional: si un checkout lo reservo un instante antes, ya no esta
    // "disponible" y no se toca.
    const filas = await this.db
      .update(codigosInventario)
      .set({ estado: "anulado" })
      .where(and(eq(codigosInventario.id, id), eq(codigosInventario.estado, "disponible")))
      .returning({ id: codigosInventario.id });
    const leido = await this.selectCodigoConPedido().where(eq(codigosInventario.id, id)).limit(1);
    return { codigo: leido[0], anulado: filas.length > 0 };
  }

  async liberarReservasHuerfanas(pendientesCreadosAntesDe: Date): Promise<number> {
    await this.asegurarInventario();
    // Misma regla que MemStorage: se libera salvo que el pedido exista y siga
    // pudiendo pagarse con su reserva, es decir, que no este fallido, expirado
    // ni con error y que no sea un "pendiente" creado antes del limite. Si a la
    // vez se esta pagando ese pedido, la fila del codigo esta bloqueada y, al
    // soltarse, Postgres revalida estado = 'reservado' (ya sera "entregado").
    // Y si se libera justo antes, marcarPedidoPagado toma otro disponible.
    const pendienteVencido = and(eq(pedidos.estado, "pendiente"), lt(pedidos.creadoEn, pendientesCreadosAntesDe));
    const filas = await this.db
      .update(codigosInventario)
      .set({ estado: "disponible", pedidoId: null, reservadoEn: null })
      .where(
        and(
          eq(codigosInventario.estado, "reservado"),
          sql`not exists (select 1 from ${pedidos} where ${pedidos.id} = ${codigosInventario.pedidoId} and ${pedidos.estado} not in ('fallido', 'expirado', 'error') and not (${pendienteVencido}))`,
        ),
      )
      .returning({ id: codigosInventario.id });
    return filas.length;
  }

  async contarUnidadesReservadasPorEmail(email: string): Promise<number> {
    await this.asegurarInventario();
    const filas = await this.db
      .select({ cantidad: sql<number>`count(*)::int` })
      .from(codigosInventario)
      .innerJoin(pedidos, eq(pedidos.id, codigosInventario.pedidoId))
      .where(
        and(
          eq(codigosInventario.estado, "reservado"),
          eq(pedidos.estado, "pendiente"),
          eq(pedidos.compradorEmail, email),
        ),
      );
    return Number(filas[0]?.cantidad ?? 0);
  }

  async completarCodigosPedido(pedidoId: string, unidades: UnidadesPedido): Promise<ResultadoCompletarCodigos> {
    await this.asegurarInventario();
    // Una sola transaccion con el pedido bloqueado (FOR UPDATE): dos admins que
    // completen el mismo pedido a la vez no le entregan codigos de mas; el
    // segundo espera y ya ve lo que entrego el primero.
    return this.db.transaction(async (tx): Promise<ResultadoCompletarCodigos> => {
      const bloqueado = await tx.select().from(pedidos).where(eq(pedidos.id, pedidoId)).limit(1).for("update");
      const actual = bloqueado[0];
      if (!actual) return { resultado: "no_existe" };
      if (actual.estado !== "pagado") return { resultado: "no_pagado", pedido: actual };
      if (esNumeroPedidoDePrueba(actual.numero)) return { resultado: "prueba", pedido: actual };

      const emitidas = await tx
        .select({ cantidad: sql<number>`count(*)::int` })
        .from(giftCards)
        .where(eq(giftCards.pedidoId, pedidoId));
      const entregados = await tx
        .select({ productoId: codigosInventario.productoId, cantidad: sql<number>`count(*)::int` })
        .from(codigosInventario)
        .where(and(eq(codigosInventario.pedidoId, pedidoId), eq(codigosInventario.estado, "entregado")))
        .groupBy(codigosInventario.productoId);
      const entregadosPorProducto = new Map<string, number>();
      for (const e of entregados) entregadosPorProducto.set(e.productoId, Number(e.cantidad));
      const { total, porProducto } = faltantesPorProducto(
        actual.items,
        unidades,
        Number(emitidas[0]?.cantidad ?? 0),
        entregadosPorProducto,
      );
      if (total <= 0) return { resultado: "completo", pedido: actual };

      const ahora = new Date();
      const nuevas: Array<{ codigo: string; pedidoId: string; montoUsdCentavos: number; estado: string }> = [];
      let cupo = total;
      for (const p of porProducto) {
        if (cupo <= 0) break;
        // SKIP LOCKED: un checkout que este reservando a la vez se queda con
        // los suyos y aqui se toman otros (o ninguno, si no queda stock).
        const tomados = await tx
          .select({ id: codigosInventario.id, codigo: codigosInventario.codigo })
          .from(codigosInventario)
          .where(and(eq(codigosInventario.productoId, p.productoId), eq(codigosInventario.estado, "disponible")))
          .orderBy(asc(codigosInventario.creadoEn), asc(codigosInventario.id))
          .limit(Math.min(p.faltan, cupo))
          .for("update", { skipLocked: true });
        if (tomados.length === 0) continue;
        await tx
          .update(codigosInventario)
          .set({ estado: "entregado", pedidoId, entregadoEn: ahora })
          .where(inArray(codigosInventario.id, tomados.map((t) => t.id)));
        for (const t of tomados) {
          nuevas.push({ codigo: t.codigo, pedidoId, montoUsdCentavos: p.montoUsdCentavos, estado: "activa" });
        }
        cupo -= tomados.length;
      }

      let pedido = actual;
      if (nuevas.length > 0) {
        // Si un codigo chocara con gift_cards.codigo (no deberia: la carga los
        // descarta), Postgres lanza y se revierte todo.
        await tx.insert(giftCards).values(nuevas);
        const actualizadas = await tx
          .update(pedidos)
          .set({ actualizadoEn: ahora })
          .where(eq(pedidos.id, pedidoId))
          .returning();
        pedido = actualizadas[0] ?? actual;
      }
      return { resultado: "completado", pedido, entregados: nuevas.length, faltanCodigos: total - nuevas.length };
    });
  }

  // === Administracion ===

  async listarPedidosAdmin(filtro: FiltroPedidosAdmin): Promise<Pedido[]> {
    if (filtro.limite <= 0) return [];
    const condiciones: SQL[] = [];
    if (filtro.estado) condiciones.push(eq(pedidos.estado, filtro.estado));
    if (filtro.buscar) {
      const { numero, email } = normalizarBusqueda(filtro.buscar);
      condiciones.push(or(eq(pedidos.numero, numero), eq(pedidos.compradorEmail, email)) as SQL);
    }
    if (filtro.despues) condiciones.push(antesDelCursor(pedidos.creadoEn, pedidos.id, filtro.despues));
    return this.db
      .select()
      .from(pedidos)
      .where(condiciones.length > 0 ? and(...condiciones) : undefined)
      .orderBy(desc(milisegundos(pedidos.creadoEn)), desc(pedidos.id))
      .limit(filtro.limite);
  }

  async resumenVentas(p: { desdeHoy: Date; desdeMes: Date; incluirPrueba: boolean }): Promise<ResumenVentasStorage> {
    const soloReales = p.incluirPrueba ? undefined : notIlike(pedidos.numero, PATRON_NUMERO_PRUEBA);
    const pagadosDesde = async (desde: Date) => {
      const filas = await this.db
        .select({
          cantidad: sql<number>`count(*)::int`,
          centavos: sql<number>`coalesce(sum(${pedidos.totalUsdCentavos}), 0)::bigint`,
        })
        .from(pedidos)
        .where(and(eq(pedidos.estado, "pagado"), gte(pedidos.pagadoEn, desde), soloReales));
      return { cantidad: Number(filas[0]?.cantidad ?? 0), centavos: Number(filas[0]?.centavos ?? 0) };
    };
    const hoy = await pagadosDesde(p.desdeHoy);
    const mes = await pagadosDesde(p.desdeMes);
    const pendientes = await this.db
      .select({ cantidad: sql<number>`count(*)::int` })
      .from(pedidos)
      .where(and(eq(pedidos.estado, "pendiente"), soloReales));
    // Misma regla que unidadesGiftCard: una linea sin esGiftCard cuenta como
    // Gift Card (la tienda solo vende Gift Cards).
    const sinCodigos = await this.db
      .select({ cantidad: sql<number>`count(*)::int` })
      .from(pedidos)
      .where(
        and(
          eq(pedidos.estado, "pagado"),
          soloReales,
          sql`(select coalesce(sum((i->>'cantidad')::int), 0) from jsonb_array_elements(${pedidos.items}) as i where coalesce((i->>'esGiftCard')::boolean, true)) > (select count(*) from ${giftCards} where ${giftCards.pedidoId} = ${pedidos.id})`,
        ),
      );
    return {
      pagadosHoy: hoy.cantidad,
      pagadosMes: mes.cantidad,
      totalUsdCentavosHoy: hoy.centavos,
      totalUsdCentavosMes: mes.centavos,
      pendientes: Number(pendientes[0]?.cantidad ?? 0),
      sinCodigos: Number(sinCodigos[0]?.cantidad ?? 0),
    };
  }

  async canjearGiftCard(codigo: string): Promise<{ giftCard: GiftCard | undefined; recienCanjeada: boolean }> {
    const filas = await this.db
      .update(giftCards)
      .set({ estado: "canjeada", canjeadoEn: new Date() })
      .where(and(eq(giftCards.codigo, codigo), eq(giftCards.estado, "activa")))
      .returning();
    if (filas.length > 0) return { giftCard: filas[0], recienCanjeada: true };
    // Canjeada, anulada, de prueba o inexistente: se devuelve como esta, sin cambios.
    return { giftCard: await this.obtenerGiftCardPorCodigo(codigo), recienCanjeada: false };
  }

  async getUser(id: string): Promise<User | undefined> {
    const filas = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return filas[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const filas = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return filas[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const filas = await this.db.insert(users).values(insertUser).returning();
    return filas[0];
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const filas = await this.db.insert(contactMessages).values(insertMessage).returning();
    return filas[0];
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return this.db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createEncuestaVasos(data: InsertEncuestaVasos): Promise<EncuestaVasos> {
    // calificacion llega como numero validado (1-5) pero la columna es texto,
    // igual que en MemStorage.
    const filas = await this.db
      .insert(encuestaVasos)
      .values({
        bebida: data.bebida,
        calificacion: String(data.calificacion),
        comentario: data.comentario || null,
      })
      .returning();
    return filas[0];
  }

  async getEncuestasVasos(): Promise<EncuestaVasos[]> {
    return this.db.select().from(encuestaVasos).orderBy(desc(encuestaVasos.fecha));
  }
}

// Si hay base de datos configurada se usa; si no, memoria (y el arranque avisa).
export const storage: IStorage = baseDatos
  ? new DbStorage(baseDatos)
  : new MemStorage();
