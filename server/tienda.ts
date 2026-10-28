// Servicio de la tienda: checkout, consulta de pedidos, emision de Gift Cards,
// avisos (webhooks) de SPIDI, conciliacion periodica y correos de la compra. No
// sabe nada de Express: server/routes.ts solo traduce HTTP a estas funciones, y
// cada ErrorTienda a {ok:false, error, codigo} con su codigo HTTP.
//
// Reglas que se cumplen aqui:
// - El precio y el total los calcula SIEMPRE el servidor con shared/catalogo.ts.
// - La vuelta a success_url no prueba nada: un pedido solo pasa a "pagado" por
//   el webhook firmado de SPIDI o por el GET status que hace este servidor.
// - El webhook es el atajo, no la unica fuente: SPIDI reintenta y luego se
//   rinde, sin reenvio. Por eso un barrido periodico reconsulta con GET status
//   los pedidos que pudieron quedarse sin aviso (conciliacion).
// - Nunca se registran en logs la clave de acceso del pedido ni los codigos de
//   Gift Card (los mensajes de log solo llevan el numero de pedido).
// - Los codigos reales NO se inventan: salen del inventario que carga el dueno
//   (codigos_inventario). El checkout los reserva al crear el pedido (si no
//   alcanzan: 409 SIN_STOCK), el pago los entrega y un pago fallido o expirado
//   los devuelve a disponible.
// - Modo prueba (todo lo que no sea produccion confirmada, ver entornoSpidi en
//   server/spidi.ts): el pedido nace con numero TVP- y sus Gift Cards se emiten
//   con prefijo PRUEBA- y estado "prueba", que el canje rechaza; asi un pago
//   falso nunca vale como uno real. Lo que se emite o se rotula para un pedido
//   lo decide su numero (congelado al crearlo), no el modo actual del servidor.
//   Un pedido de prueba reserva stock como uno real (asi se puede probar el
//   "Sin stock"), pero al pagarse lo devuelve: nunca gasta codigos reales. Con
//   TIENDA_PRECIO_PRUEBA_USD se cobra ese monto por unidad (solo en prueba).
//   Si el entorno es desconocido (ni produccion confirmada ni un host de prueba
//   conocido), el checkout se cierra siempre: el pago podria ser real.
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { setTimeout as esperar } from "node:timers/promises";
import { buscarProducto, MAX_UNIDADES_POR_PEDIDO, PRODUCTOS, redondearUsd } from "@shared/catalogo";
import {
  ESTADO_GIFT_CARD_PRUEBA,
  esNumeroPedidoDePrueba,
  MAX_UNIDADES_RESERVADAS_SIMULTANEAS,
  PREFIJO_CODIGO_PRUEBA,
  PREFIJO_PEDIDO,
  PREFIJO_PEDIDO_PRUEBA,
  STOCK_MAXIMO_VISIBLE,
  type CheckoutRequest,
  type CheckoutResponse,
  type CodigoError,
  type ConfigTienda,
  type EstadoPedido,
  type PedidoPublico,
  type StockTienda,
} from "@shared/tienda";
import {
  ESTADOS_CODIGO_INVENTARIO,
  MAX_CODIGOS_POR_CARGA,
  MAX_LARGO_CODIGO,
  type AnularCodigoResponse,
  type CargaInventarioResponse,
  type CompletarCodigosResponse,
  type CodigoInventarioAdmin,
  type CodigosInventarioAdmin,
  type EstadoCodigoInventario,
  type ExpirarPedidoResponse,
  type PedidoAdmin,
  type ResumenAdmin,
  type VentasAdmin,
} from "@shared/admin";
import type { GiftCard, Pedido, PedidoItem } from "@shared/schema";
import {
  storage,
  esViolacionDeUnicidad,
  SinStockError,
  unidadesGiftCard,
  type CodigoInventarioConPedido,
  type CursorAdmin,
  type DatosPagoSpidi,
  type EntregaPago,
  type NuevaGiftCard,
  type NuevoPedido,
  type ReservaStock,
  type UnidadesPedido,
} from "./storage";
import {
  consultarSesion,
  crearSesionBoton,
  cupoDisponible,
  duracionSesionMinutos,
  entornoSpidi,
  esLimiteDeLlamadas,
  expirarSesion,
  interpretarWebhook,
  modoPrueba,
  pruebasBloqueadas,
  revisarEntornoSpidi,
  spidiConfigurado,
  SpidiError,
  SpidiNoConfigurado,
  TIEMPO_MAXIMO_CREAR_SESION_MS,
  urlPublica,
  verificarFirmaWebhook,
  type EstadoSesionSpidi,
  type EventoSpidi,
} from "./spidi";
import { sendGiftCardsComprador, sendNotificacionVenta, type DatosCorreoVenta } from "./email";

// Error con codigo HTTP: las rutas responden {ok:false, error: message, codigo}
// con ese status. El mensaje va tal cual al navegador, asi que debe ser amable
// y no llevar detalles internos. `codigo` le dice al cliente que hacer sin leer
// el mensaje (ver CodigoError en shared/tienda.ts).
export class ErrorTienda extends Error {
  readonly status: number;
  readonly codigo: CodigoError | undefined;

  constructor(status: number, mensaje: string, codigo?: CodigoError) {
    super(mensaje);
    this.name = "ErrorTienda";
    this.status = status;
    // Todo 429 lleva "LIMITE" y todo 503 "NO_DISPONIBLE" aunque quien lo lanza
    // no lo diga: asi el contrato con el cliente no depende de cada llamador.
    this.codigo =
      codigo ?? (status === 429 ? "LIMITE" : status === 503 ? "NO_DISPONIBLE" : undefined);
  }
}

// Sin letras ni numeros que se confundan al leerlos o dictarlos (I/1, O/0).
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// El primer intento mas 3 reintentos ante un choque de columna unica (numero de
// pedido o codigo de Gift Card repetido; muy improbable, pero posible).
const MAX_INTENTOS_UNICIDAD = 4;

const MENSAJE_PAGOS_NO_DISPONIBLES =
  "Pagos no disponibles por el momento. Intenta de nuevo más tarde.";
const MENSAJE_PEDIDO_EN_PROCESO =
  "Tu pedido se está procesando. Espera unos segundos e intenta de nuevo.";
const MENSAJE_MUCHA_DEMANDA =
  "Hay mucha demanda en este momento. Espera un minuto e intenta de nuevo.";

// Un pedido "pendiente" que sigue sin enlace de pago pasado este tiempo es un
// checkout que murio a mitad (por ejemplo, el proceso se reinicio mientras
// creaba la sesion en SPIDI): la peticion original ya no puede seguir viva,
// porque crear la sesion tarda como mucho TIEMPO_MAXIMO_CREAR_SESION_MS (90 s,
// contando login y reintentos). 2 minutos dejan margen para guardar en la base.
const CHECKOUT_HUERFANO_MS = Math.max(2 * 60_000, TIEMPO_MAXIMO_CREAR_SESION_MS + 30_000);
// El barrido da por muertos a los que pasan de 10 minutos sin sesion, aunque
// nadie vuelva a intentar con su clave (solo para dejarlos en "error" en vez de
// "pendiente" para siempre; no se pueden pagar, no tienen enlace).
const CHECKOUT_HUERFANO_BARRIDO_MS = Math.max(10 * 60_000, CHECKOUT_HUERFANO_MS);
const MOTIVO_CHECKOUT_INTERRUMPIDO = "Checkout interrumpido";

// Compara dos secretos en tiempo constante (no se puede adivinar caracter a
// caracter midiendo cuanto tarda la respuesta). Longitudes distintas: no
// coinciden, sin llamar a timingSafeEqual (que exige el mismo largo).
export function compararSecreto(esperado: string, recibido: string): boolean {
  const a = Buffer.from(esperado, "utf8");
  const b = Buffer.from(recibido, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

// Solo el mensaje: el objeto de error completo (por ejemplo el "detail" de
// Postgres ante un valor repetido) podria incluir un codigo de Gift Card.
function describirError(error: unknown): string {
  if (error instanceof SpidiError) {
    return `${error.message} (status ${error.status}${error.code ? `, code ${error.code}` : ""})`;
  }
  return error instanceof Error ? error.message : String(error);
}

function caracteresAleatorios(cantidad: number): string {
  let resultado = "";
  for (let i = 0; i < cantidad; i++) {
    resultado += ALFABETO[randomInt(ALFABETO.length)];
  }
  return resultado;
}

// Fecha en hora de Venezuela (UTC-4 todo el anio, sin horario de verano) para
// que un pedido hecho a las 9 p. m. no salga con la fecha del dia siguiente.
function fechaVenezuelaAAMMDD(ahora: Date = new Date()): string {
  const local = new Date(ahora.getTime() - 4 * 60 * 60 * 1000);
  const aa = String(local.getUTCFullYear() % 100).padStart(2, "0");
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(local.getUTCDate()).padStart(2, "0");
  return `${aa}${mm}${dd}`;
}

// Numero legible para el cliente y para SPIDI: TV-AAMMDD-XXXXX, o
// TVP-AAMMDD-XXXXX si el pedido se crea en modo prueba. Asi el modo queda
// congelado en el pedido sin agregar columnas a la tabla.
function generarNumeroPedido(prueba: boolean): string {
  const prefijo = prueba ? PREFIJO_PEDIDO_PRUEBA : PREFIJO_PEDIDO;
  return `${prefijo}${fechaVenezuelaAAMMDD()}-${caracteresAleatorios(5)}`;
}

// esNumeroPedidoDePrueba (numero TVP-) vive en shared/tienda.ts: tambien la usa
// server/storage.ts para la ventana de conciliacion de los pedidos reales.

// TV-XXXX-XXXX-XXXX. Con un pago de prueba lleva delante PRUEBA-, para que se
// note a simple vista (en pantalla, en el correo o dictado por WhatsApp) que
// no es una Gift Card real.
function generarCodigoGiftCard(prueba: boolean): string {
  const codigo = `TV-${caracteresAleatorios(4)}-${caracteresAleatorios(4)}-${caracteresAleatorios(4)}`;
  return prueba ? `${PREFIJO_CODIGO_PRUEBA}${codigo}` : codigo;
}

// Un pedido es de prueba si se creo en modo prueba (numero TVP-) o si sus Gift
// Cards salieron de prueba. Se decide SOLO por el pedido, nunca por modoPrueba()
// del servidor: un pago real mirado o reenviado con el servidor en modo prueba
// (por ejemplo, durante una revision en staging) sigue siendo real, y un
// pedido de prueba viejo sigue siendo de prueba con la tienda ya en produccion.
// Decide el rotulo de la pagina de resultado y el [PRUEBA] de los correos
// (incluidos el reenvio desde admin y los reintentos del barrido).
function esPedidoDePrueba(pedido: Pedido, giftCards: GiftCard[]): boolean {
  return esNumeroPedidoDePrueba(pedido.numero) || giftCards.some((g) => g.estado === ESTADO_GIFT_CARD_PRUEBA);
}

// GET /api/tienda/config: solo si los pagos son de prueba y contra que entorno
// de SPIDI. Nada de credenciales, URLs ni ids. Es el modo del servidor AHORA:
// sirve para la franja general de la tienda, no para rotular pedidos ya hechos.
export function configTienda(): ConfigTienda {
  // Se lee una sola vez para que los dos campos digan lo mismo.
  const entorno = entornoSpidi();
  return { modoPrueba: entorno !== "produccion", entorno };
}

// === Checkout ===

interface CarritoValidado {
  items: PedidoItem[];
  totalUsdCentavos: number;
}

// Precio de prueba por unidad (TIENDA_PRECIO_PRUEBA_USD), para probar en el
// sandbox sin cobrar montos grandes. null si no esta o no es un numero > 0.
// Solo se usa para pedidos de modo prueba (ver validarCarrito): con la tienda
// en produccion confirmada se ignora siempre.
function precioDePruebaUsd(): number | null {
  const crudo = (process.env.TIENDA_PRECIO_PRUEBA_USD ?? "").trim();
  if (!crudo) return null;
  const centavos = Math.round(Number(crudo) * 100);
  return Number.isFinite(centavos) && centavos > 0 ? centavos / 100 : null;
}

// Valida el carrito contra el catalogo y congela nombre y precio de cada linea.
// Lo que diga el navegador sobre precios no se usa para nada. En un pedido de
// prueba (`prueba`) con TIENDA_PRECIO_PRUEBA_USD se cobra ese monto por unidad;
// el valor de cada Gift Card (valorUsd) sigue siendo el del catalogo.
function validarCarrito(items: CheckoutRequest["items"], prueba: boolean): CarritoValidado {
  const precioPrueba = prueba ? precioDePruebaUsd() : null;
  // Une las lineas repetidas del mismo producto antes de aplicar los topes, para
  // que nadie los esquive partiendo la cantidad en varias lineas.
  const cantidades = new Map<string, number>();
  for (const { productoId, cantidad } of items) {
    cantidades.set(productoId, (cantidades.get(productoId) ?? 0) + cantidad);
  }

  const lineas: PedidoItem[] = [];
  let totalUsdCentavos = 0;
  let unidades = 0;
  for (const [productoId, cantidad] of Array.from(cantidades.entries())) {
    const producto = buscarProducto(productoId);
    if (!producto) {
      throw new ErrorTienda(
        400,
        "Uno de los productos de tu carrito ya no está disponible. Actualiza la página e intenta de nuevo.",
      );
    }
    if (cantidad > producto.maxPorPedido) {
      throw new ErrorTienda(
        400,
        `Puedes comprar como máximo ${producto.maxPorPedido} unidades de "${producto.nombre}" por pedido.`,
      );
    }
    unidades += cantidad;
    const precioUsd = precioPrueba ?? producto.precioUsd;
    // En centavos enteros para no arrastrar errores de punto flotante.
    totalUsdCentavos += Math.round(precioUsd * 100) * cantidad;
    lineas.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUsd,
      esGiftCard: producto.esGiftCard,
      valorUsd: producto.precioUsd,
    });
  }

  if (unidades > MAX_UNIDADES_POR_PEDIDO) {
    throw new ErrorTienda(
      400,
      `Puedes comprar como máximo ${MAX_UNIDADES_POR_PEDIDO} unidades por pedido.`,
    );
  }
  if (lineas.length === 0 || totalUsdCentavos <= 0) {
    throw new ErrorTienda(400, "Tu carrito está vacío.");
  }
  return { items: lineas, totalUsdCentavos };
}

// Codigos que hay que reservar del inventario: uno por unidad de Gift Card.
function reservasDelCarrito(items: PedidoItem[]): ReservaStock[] {
  return items
    .filter((i) => i.esGiftCard)
    .map((i) => ({ productoId: i.productoId, cantidad: i.cantidad }));
}

function errorSinStock(productoId: string): ErrorTienda {
  const nombre = buscarProducto(productoId)?.nombre ?? "uno de los productos";
  return new ErrorTienda(
    409,
    `Sin stock suficiente de ${nombre}. Ajusta la cantidad o elige otro monto.`,
    "SIN_STOCK",
  );
}

// Revision previa (sin reservar) para responder SIN_STOCK sin gastar el limite
// por IP. La que cuenta es la reserva atomica de crearPedido: entre esta
// revision y esa, otro comprador pudo llevarse el ultimo codigo.
async function revisarStock(reservas: ReservaStock[]): Promise<void> {
  if (reservas.length === 0) return;
  const disponibles = await storage.contarStockDisponible();
  const pedidas = new Map<string, number>();
  for (const r of reservas) pedidas.set(r.productoId, (pedidas.get(r.productoId) ?? 0) + r.cantidad);
  for (const [productoId, cantidad] of Array.from(pedidas.entries())) {
    if ((disponibles[productoId] ?? 0) < cantidad) throw errorSinStock(productoId);
  }
}

// GET /api/tienda/stock: codigos disponibles por producto, acotados a
// STOCK_MAXIMO_VISIBLE para no revelar el inventario exacto.
export async function stockTienda(): Promise<StockTienda> {
  const disponibles = await storage.contarStockDisponible();
  const stock: Record<string, number> = {};
  for (const p of PRODUCTOS) {
    stock[p.id] = Math.max(0, Math.min(STOCK_MAXIMO_VISIBLE, disponibles[p.id] ?? 0));
  }
  return { ok: true, stock };
}

// Para saber si un reenvio con la misma clave de idempotencia es de verdad el
// mismo pedido (y no alguien probando claves ajenas).
function huellaItems(items: PedidoItem[]): string {
  return items
    .map((i) => `${i.productoId}:${i.cantidad}`)
    .sort()
    .join(",");
}

function rutaResultado(pedido: Pedido): string {
  return `/pago/resultado?pedido=${encodeURIComponent(pedido.id)}&k=${encodeURIComponent(pedido.claveAcceso)}`;
}

// Concepto corto que ve el cliente en la pagina de pago de SPIDI.
function describirPedido(items: PedidoItem[]): string {
  const texto = items.map((i) => `${i.nombre} x${i.cantidad}`).join(", ");
  // SPIDI acepta hasta 500 caracteres; se deja holgura.
  return texto.length > 200 ? `${texto.slice(0, 197)}...` : texto;
}

// Si el navegador reenvia el mismo checkout (doble clic, reintento por red),
// se devuelve el pedido ya creado en vez de abrir otro y cobrar dos veces.
// Devuelve null cuando hay que crear un pedido nuevo.
async function reutilizarPorIdempotencia(
  claveIdempotencia: string,
  email: string,
  carrito: CarritoValidado,
  pedidoDePrueba: boolean,
): Promise<{ respuesta: CheckoutResponse | null; usarClave: boolean }> {
  const previo = await storage.obtenerPedidoPorClaveIdempotencia(claveIdempotencia);
  if (!previo) return { respuesta: null, usarClave: true };

  const mismoPedido =
    previo.compradorEmail === email &&
    previo.totalUsdCentavos === carrito.totalUsdCentavos &&
    huellaItems(previo.items) === huellaItems(carrito.items);
  if (!mismoPedido) {
    throw new ErrorTienda(
      409,
      "Esta solicitud de pago ya se usó para otro pedido. Actualiza la página e intenta de nuevo.",
    );
  }

  if (previo.estado === "pendiente") {
    if (!previo.spidiPaymentUrl) {
      const edadMs = Date.now() - new Date(previo.creadoEn).getTime();
      if (edadMs < CHECKOUT_HUERFANO_MS) {
        // La primera peticion aun esta creando la sesion en SPIDI. "EN_PROCESO"
        // le dice al cliente que conserve la clave: el siguiente intento con
        // ella recibira este mismo pedido en vez de abrir otro.
        throw new ErrorTienda(409, MENSAJE_PEDIDO_EN_PROCESO, "EN_PROCESO");
      }
      // Ya paso mas de lo que puede tardar crear la sesion: la peticion
      // original murio. Sin esto, este pedido responderia EN_PROCESO para
      // siempre y el cliente, que conserva la clave, no podria volver a pagar.
      // Se da por muerto y se sigue como con uno fallido: pedido nuevo, sin la
      // clave. Si no se puede marcar, igual se sigue (el barrido lo marcara);
      // no tiene enlace, asi que nadie puede pagarlo.
      await storage
        .marcarPedidoError(previo.id, MOTIVO_CHECKOUT_INTERRUMPIDO)
        .catch((error) =>
          console.error(
            `[tienda] No se pudo marcar con error el pedido interrumpido ${previo.numero}:`,
            describirError(error),
          ),
        );
      return { respuesta: null, usarClave: false };
    }
    // Solo si el enlace de pago sigue vivo (con un minuto de margen) y es del
    // mismo modo que el servidor ahora; si no, se crea un pedido nuevo con una
    // sesion nueva. Lo segundo importa tras cambiar de entorno en un redespliegue:
    // un servidor en prueba no debe devolver el enlace de cobro real de un
    // pedido TV- (ni uno en produccion el enlace de sandbox de un TVP-).
    const mismoModo = esNumeroPedidoDePrueba(previo.numero) === pedidoDePrueba;
    const vigenteHasta =
      new Date(previo.creadoEn).getTime() + (duracionSesionMinutos() - 1) * 60_000;
    if (mismoModo && Date.now() < vigenteHasta) {
      return {
        respuesta: {
          ok: true,
          pedidoId: previo.id,
          clave: previo.claveAcceso,
          paymentUrl: previo.spidiPaymentUrl,
        },
        usarClave: false,
      };
    }
  }

  if (previo.estado === "pagado") {
    // Ya se pago: en vez de llevarlo a pagar otra vez, se le manda directo a la
    // pagina de resultado, donde estan sus Gift Cards.
    return {
      respuesta: {
        ok: true,
        pedidoId: previo.id,
        clave: previo.claveAcceso,
        paymentUrl: urlPublica(rutaResultado(previo)),
      },
      usarClave: false,
    };
  }

  // Fallido, expirado, con error o con el enlace vencido: el cliente quiere
  // intentarlo de nuevo. La clave ya esta tomada (columna unica), asi que el
  // pedido nuevo nace sin ella.
  return { respuesta: null, usarClave: false };
}

// Crea el pedido con un numero nuevo (TVP- si `prueba`) y reserva sus codigos
// en la misma operacion; si el numero ya existia (columna unica), prueba con
// otro. Sin stock suficiente lanza ErrorTienda 409 "SIN_STOCK" sin crear nada.
async function guardarPedidoNuevo(
  datos: Omit<NuevoPedido, "numero">,
  prueba: boolean,
  reservas: ReservaStock[],
): Promise<Pedido> {
  for (let intento = 1; ; intento++) {
    try {
      return await storage.crearPedido({ ...datos, numero: generarNumeroPedido(prueba) }, reservas);
    } catch (error) {
      if (error instanceof SinStockError) throw errorSinStock(error.productoId);
      if (!esViolacionDeUnicidad(error)) throw error;
      // Si choco la clave de idempotencia, otra peticion identica gano la
      // carrera y esta creando el pedido en este momento.
      if (
        datos.claveIdempotencia &&
        (await storage.obtenerPedidoPorClaveIdempotencia(datos.claveIdempotencia))
      ) {
        throw new ErrorTienda(409, MENSAJE_PEDIDO_EN_PROCESO, "EN_PROCESO");
      }
      if (intento >= MAX_INTENTOS_UNICIDAD) throw error;
    }
  }
}

// `ipCliente` es para el limitador por IP (limitarCheckout), que solo se aplica
// cuando de verdad se va a crear un pedido nuevo (y con el, una sesion de pago).
export async function crearCheckout(
  datos: CheckoutRequest,
  claveIdempotencia: string | null,
  ipCliente: string,
): Promise<CheckoutResponse> {
  // Con un carrito vacio o invalido se responde 400 antes de mirar el entorno.
  // El precio definitivo (el de prueba, si toca) se calcula mas abajo, cuando
  // ya se sabe el modo.
  validarCarrito(datos.items, false);

  // Sin base de datos el pedido viviria solo en memoria: un reinicio o un
  // despliegue lo borraria con el pago ya hecho y sin forma de entregar.
  if (!storage.persistente && process.env.NODE_ENV === "production") {
    console.error("[tienda] Checkout rechazado: sin DATABASE_URL los pedidos se perderian");
    throw new ErrorTienda(503, MENSAJE_PAGOS_NO_DISPONIBLES);
  }
  if (!spidiConfigurado()) {
    console.error("[tienda] Checkout rechazado: faltan variables de entorno de SPIDI");
    throw new ErrorTienda(503, MENSAJE_PAGOS_NO_DISPONIBLES);
  }
  // Con un entorno desconocido (ni produccion confirmada ni un host de prueba
  // conocido) no se cobra NUNCA: el pago podria ser real y se trataria como de
  // prueba. En un entorno de prueba conocido se "paga" sin dinero de verdad (en
  // el simulador, con la clave 000000): el sitio publico no ofrece pagar ahi
  // salvo que se permita a proposito (un staging). Aunque se permita, lo
  // emitido sale de prueba y no se puede canjear.
  if (pruebasBloqueadas()) {
    const entorno = entornoSpidi();
    console.error(
      entorno === "desconocido"
        ? "[tienda] Checkout rechazado: entorno de SPIDI desconocido (ni produccion confirmada ni un host de prueba conocido); ver el ERROR DE CONFIGURACION del arranque"
        : `[tienda] Checkout rechazado: NODE_ENV=production y SPIDI no esta en produccion confirmada (entorno ${entorno}); SPIDI_PERMITIR_PRUEBAS=1 lo abre en un staging`,
    );
    throw new ErrorTienda(503, MENSAJE_PAGOS_NO_DISPONIBLES, "NO_DISPONIBLE");
  }
  // El modo se fija UNA vez por checkout y queda congelado en el numero del
  // pedido (TVP- = prueba): la emision de sus Gift Cards dependera de eso.
  const pedidoDePrueba = modoPrueba();
  const carrito = validarCarrito(datos.items, pedidoDePrueba);
  const reservas = reservasDelCarrito(carrito.items);

  const comprador = datos.comprador;
  let claveParaPedido: string | null = null;
  if (claveIdempotencia) {
    const { respuesta, usarClave } = await reutilizarPorIdempotencia(
      claveIdempotencia,
      comprador.email,
      carrito,
      pedidoDePrueba,
    );
    if (respuesta) return respuesta;
    claveParaPedido = usarClave ? claveIdempotencia : null;
  }

  // Sin cupo para crear sesiones (SPIDI pidio esperar con un 429, o se esta
  // cerca de su limite por minuto): se avisa antes de guardar un pedido que
  // naceria ya con error.
  if (cupoDisponible("cobro") <= 0) {
    throw new ErrorTienda(503, MENSAJE_MUCHA_DEMANDA, "NO_DISPONIBLE");
  }

  // Sin stock se avisa antes de contar el intento para el limite por IP.
  await revisarStock(reservas);

  // Tope de unidades apartadas a la vez por correo y por IP (409 "LIMITE").
  // Queda apartado aqui mismo, antes de crear el pedido, para que dos
  // checkouts simultaneos no pasen juntos el tope.
  const cupoReservas = await apartarCupoDeReservas(
    comprador.email,
    ipCliente,
    reservas.reduce((suma, r) => suma + r.cantidad, 0),
  );

  // 1) El pedido se guarda ANTES de hablar con SPIDI, para tener su id y su
  //    numero en las URLs de vuelta y en el identificador de la sesion.
  let pedido: Pedido;
  try {
    // Recien aqui se cuenta el intento para el limite por IP: los reintentos
    // con una clave que ya tiene pedido vivo (devuelven ese pedido o
    // EN_PROCESO) no abren sesion nueva y no deben gastar el limite. Si no
    // queda cupo, lanza 429 "LIMITE" sin crear nada.
    limitarCheckout(ipCliente);
    pedido = await guardarPedidoNuevo(
      {
        claveAcceso: randomBytes(24).toString("base64url"),
        claveIdempotencia: claveParaPedido,
        items: carrito.items,
        totalUsdCentavos: carrito.totalUsdCentavos,
        compradorNombre: comprador.nombre,
        compradorEmail: comprador.email,
        compradorTelefono: comprador.telefono ? comprador.telefono : null,
      },
      pedidoDePrueba,
      reservas,
    );
  } catch (error) {
    cupoReservas.cancelar();
    throw error;
  }
  // Desde aqui el cupo queda atado al pedido: deja de contar cuando el pedido
  // sale de "pendiente" (pagado, fallido, error...) o cuando vence su reserva.
  cupoReservas.confirmar(pedido.id);

  // 2) La sesion de pago (Boton) se crea solo en el servidor; el navegador
  //    unicamente recibe payment_url.
  const ruta = rutaResultado(pedido);
  let sesion: { sessionId: string; paymentUrl: string };
  try {
    sesion = await crearSesionBoton({
      montoUsd: redondearUsd(carrito.totalUsdCentavos / 100),
      identificadorEtiqueta: "Pedido",
      identificador: pedido.numero,
      descripcion: describirPedido(carrito.items),
      successUrl: urlPublica(ruta),
      failureUrl: urlPublica(`${ruta}&r=fallo`),
      webhookUrl: urlPublica("/api/webhooks/spidi"),
      duracionMinutos: duracionSesionMinutos(),
    });
  } catch (error) {
    console.error(
      `[tienda] No se pudo crear la sesion de pago del pedido ${pedido.numero}:`,
      describirError(error),
    );
    const motivo =
      error instanceof SpidiError
        ? `SPIDI respondio ${error.status}${error.code ? ` (${error.code})` : ""}`
        : "No se pudo crear la sesion de pago";
    await storage
      .marcarPedidoError(pedido.id, motivo)
      .catch((e) => console.error(`[tienda] No se pudo marcar con error el pedido ${pedido.numero}:`, describirError(e)));
    if (error instanceof SpidiNoConfigurado) {
      throw new ErrorTienda(503, MENSAJE_PAGOS_NO_DISPONIBLES, "NO_DISPONIBLE");
    }
    // Limite de peticiones (el cupo local, la pausa o un 429 de SPIDI): no es
    // una falla, es demanda. Se le pide al cliente esperar un poco.
    if (esLimiteDeLlamadas(error)) {
      throw new ErrorTienda(503, MENSAJE_MUCHA_DEMANDA, "NO_DISPONIBLE");
    }
    throw new ErrorTienda(
      502,
      "No pudimos conectar con la plataforma de pago. Intenta de nuevo en unos minutos.",
    );
  }

  // 3) Guardar session_id es obligatorio: SPIDI no permite listar sesiones, asi
  //    que sin el no habria forma de consultar ni de casar el webhook. Se
  //    intenta dos veces; si aun asi falla, el session_id queda en el log (no
  //    es un secreto) para poder recuperarlo a mano.
  let guardado: Pedido | undefined;
  let ultimoError: unknown = null;
  for (let intento = 1; intento <= 2 && !guardado; intento++) {
    try {
      guardado = await storage.asignarSesionSpidi(pedido.id, sesion.sessionId, sesion.paymentUrl);
      if (!guardado) ultimoError = new Error("el pedido no existe");
    } catch (error) {
      ultimoError = error;
    }
  }
  if (!guardado) {
    console.error(
      `[tienda] SESION SIN GUARDAR: pedido ${pedido.numero} (id ${pedido.id}), session_id ${sesion.sessionId}:`,
      describirError(ultimoError),
    );
    await storage
      .marcarPedidoError(pedido.id, "No se pudo guardar la sesion de pago")
      .catch(() => undefined);
    throw new ErrorTienda(
      500,
      "No pudimos registrar tu pedido. Intenta de nuevo en unos minutos.",
    );
  }

  return {
    ok: true,
    pedidoId: pedido.id,
    clave: pedido.claveAcceso,
    paymentUrl: sesion.paymentUrl,
  };
}

// === Pago y Gift Cards ===

// Un pago real que llega con el servidor en modo prueba (o con entorno
// desconocido) necesita que alguien lo atienda (no se puede entregar hasta
// volver a produccion). Se registra aparte del error que sube a quien llamo,
// para que se vea claro, pero como mucho una vez cada 10 minutos por pedido: la
// pagina de resultado y el barrido lo reintentan seguido. El barrido lo sigue
// revisando (y este aviso sigue saliendo) hasta 7 dias despues de creado el
// pedido: ver listarPedidosParaConciliar en server/storage.ts.
const ultimoAvisoPagoRealEnPrueba = new Map<string, number>();
const REPETIR_AVISO_PAGO_REAL_MS = 10 * 60_000;

function avisarPagoRealEnModoPrueba(pedido: Pedido): void {
  const ahora = Date.now();
  const ultimo = ultimoAvisoPagoRealEnPrueba.get(pedido.id);
  if (ultimo !== undefined && ahora - ultimo < REPETIR_AVISO_PAGO_REAL_MS) return;
  ultimoAvisoPagoRealEnPrueba.set(pedido.id, ahora);
  podarMapa(ultimoAvisoPagoRealEnPrueba, (t) => ahora - t > REPETIR_AVISO_PAGO_REAL_MS, 1000);
  console.error(
    `[tienda] PAGO REAL SIN ENTREGAR: el pedido ${pedido.numero} se creo en produccion, pero el servidor esta en modo prueba (${entornoSpidi()}). ` +
      "No se emiten codigos de prueba para un pago real: queda pendiente y se entregara cuando SPIDI_ENTORNO y SPIDI_BASE_URL vuelvan a produccion " +
      "(el barrido lo revisa hasta 7 dias despues de creado; pasado eso, hay que entregarlo a mano).",
  );
}

// Que entregar al pagarse el pedido: una Gift Card por unidad de cada linea
// que era Gift Card al comprar. Tanto si es Gift Card como su valor salen de lo
// congelado en el pedido, no del catalogo de hoy; el catalogo solo se consulta
// para pedidos viejos que no traen esGiftCard.
//
// Lanza si el pedido no cuadra (cantidad o valor invalidos, producto que no se
// sabe si es Gift Card): un pedido marcado pagado ya no se vuelve a entregar.
// Si lanza, el pedido sigue sin pagar y se reintenta con el siguiente aviso de
// SPIDI, el siguiente barrido o la pagina de resultado. El error solo lleva el
// numero de pedido y el id del producto, nunca codigos.
//
// Prueba o real lo decide el NUMERO del pedido (congelado al crearlo), no el
// entorno del momento de confirmar:
// - Pedido TV- (real): los codigos salen del INVENTARIO que cargo el dueno
//   (primero los que el pedido tenia reservados). Si no alcanzan, el pedido
//   queda pagado igual y lo que falte se entrega a mano (ver pagarPedido).
// - Pedido TVP- (creado en modo prueba): no gasta inventario real. Se generan
//   codigos con prefijo PRUEBA- en estado "prueba" (a la vista del comprador,
//   pero el canje los rechaza), aunque el servidor ya este en produccion; sus
//   reservas vuelven a disponible.
// - Pedido TV- con el servidor ahora en modo prueba (o con entorno
//   desconocido): se lanza sin entregar nada. Ese "pago" lo confirmo un SPIDI
//   de prueba; el pedido queda pendiente y el barrido lo reintenta (hasta 7
//   dias despues de creado) hasta que el servidor vuelva a produccion.
function prepararEntrega(pedido: Pedido): EntregaPago {
  const prueba = esNumeroPedidoDePrueba(pedido.numero);
  if (!prueba && modoPrueba()) {
    avisarPagoRealEnModoPrueba(pedido);
    throw new Error(
      `Pedido ${pedido.numero}: es un pedido real (creado en produccion) pero el servidor esta en modo prueba (${entornoSpidi()}); no se entregan codigos para un pago real`,
    );
  }
  const unidades = unidadesDelPedido(pedido);
  if (!prueba) return { tipo: "inventario", unidades };

  const usados = new Set<string>();
  const giftCards: NuevaGiftCard[] = [];
  for (const u of unidades) {
    for (let i = 0; i < u.cantidad; i++) {
      let codigo = generarCodigoGiftCard(true);
      while (usados.has(codigo)) codigo = generarCodigoGiftCard(true);
      usados.add(codigo);
      giftCards.push({ codigo, montoUsdCentavos: u.montoUsdCentavos, estado: ESTADO_GIFT_CARD_PRUEBA });
    }
  }
  return { tipo: "prueba", giftCards };
}

// Lineas de Gift Card del pedido: cuantas unidades de cada producto y cuanto
// vale cada codigo. La usan el pago (prepararEntrega) y el admin al completar
// codigos que faltaron. Lanza si el pedido no cuadra (ver prepararEntrega).
function unidadesDelPedido(pedido: Pedido): UnidadesPedido {
  const unidades: UnidadesPedido = [];
  for (const item of pedido.items) {
    // En pedidos anteriores a este campo viene undefined aunque el tipo diga boolean.
    const congelado: boolean | undefined = item.esGiftCard;
    const esGiftCard = congelado ?? buscarProducto(item.productoId)?.esGiftCard;
    if (esGiftCard === undefined) {
      throw new Error(
        `Pedido ${pedido.numero}: no se sabe si "${item.productoId}" es Gift Card (no lo dice el pedido ni el catalogo)`,
      );
    }
    if (!esGiftCard) continue;

    const cantidad = Number(item.cantidad);
    // Lo que vale cada codigo: valorUsd (puede diferir de lo cobrado con el
    // precio de prueba); los pedidos viejos sin ese campo, lo que se pago.
    const montoUsdCentavos = Math.round(Number(item.valorUsd ?? item.precioUsd) * 100);
    if (!Number.isInteger(cantidad) || cantidad < 1 || !Number.isInteger(montoUsdCentavos) || montoUsdCentavos <= 0) {
      throw new Error(`Pedido ${pedido.numero}: cantidad o precio invalidos en "${item.productoId}"`);
    }
    unidades.push({ productoId: item.productoId, cantidad, montoUsdCentavos });
  }
  return unidades;
}

// Gift Cards pagadas que se quedaron sin codigo (el pago llego sin stock). Solo
// cuenta en pedidos pagados; los de prueba siempre tienen todos los suyos.
function faltanCodigosDe(pedido: Pedido, giftCards: GiftCard[]): number {
  if (pedido.estado !== "pagado") return 0;
  return Math.max(0, unidadesGiftCard(pedido.items) - giftCards.length);
}

// Cuando SPIDI no da detalles del pago (solo el status), igual se entrega.
function pagoSinDetalle(): DatosPagoSpidi {
  return {
    metodo: null,
    banco: null,
    referencia: null,
    montoVes: null,
    tasaBcv: null,
    spidiTransaccionId: null,
    comprobanteUrl: null,
    pagadoEn: new Date(),
  };
}

function datosCorreo(pedido: Pedido, giftCards: GiftCard[]): DatosCorreoVenta {
  return {
    numero: pedido.numero,
    compradorNombre: pedido.compradorNombre,
    compradorEmail: pedido.compradorEmail,
    compradorTelefono: pedido.compradorTelefono,
    cantidad: pedido.items.reduce((suma, i) => suma + i.cantidad, 0),
    totalUsd: pedido.totalUsdCentavos / 100,
    montoVes: pedido.pagoMontoVes,
    referencia: pedido.pagoReferencia,
    comprobanteUrl: pedido.spidiComprobanteUrl,
    giftCards: giftCards.map((g) => ({ codigo: g.codigo, montoUsd: g.montoUsdCentavos / 100 })),
    faltanCodigos: faltanCodigosDe(pedido, giftCards),
    // Asunto con [PRUEBA] y una nota de que no es una compra real. Lo decide
    // el pedido, no el modo actual del servidor: asi tambien el reenvio desde
    // admin y los reintentos del barrido rotulan bien un pago real.
    esPrueba: esPedidoDePrueba(pedido, giftCards),
  };
}

// Pedidos con un envio de correo en marcha en este proceso. Evita que el
// barrido (o un reenvio desde admin) mande el mismo correo dos veces mientras
// el primer envio aun no termina.
const correosEnCurso = new Set<string>();

// Envia los correos de la compra que le falten al pedido (al comprador con sus
// codigos y el aviso de venta al negocio). Primero RESERVA el intento en
// storage (suma 1 al contador solo si no llego a MAX_INTENTOS_CORREO); si la
// reserva no vuelve o falla, no envia nada. Despues de enviar anota solo la
// hora de cada correo que salio. Asi, aunque esa ultima escritura falle, el
// barrido repite como mucho hasta el tope, nunca sin fin.
// Devuelve null si no hizo nada (envio en curso, nada que enviar o sin intentos).
async function enviarCorreosPendientes(
  pedido: Pedido,
): Promise<{ comprador: boolean; venta: boolean } | null> {
  if ((pedido.correoCompradorEnviadoEn && pedido.avisoVentaEnviadoEn) || correosEnCurso.has(pedido.id)) {
    return null;
  }
  correosEnCurso.add(pedido.id);
  try {
    // Los codigos se leen antes de reservar: si esta lectura falla, no se
    // gasta un intento. Si algo lanza, el error sube sin haber enviado nada
    // (quien llama lo registra).
    const giftCards = await storage.obtenerGiftCardsDePedido(pedido.id);
    const reservado = await storage.reservarIntentoCorreo(pedido.id);
    if (!reservado) return null;
    // Se decide con la fila recien leida: otro envio (de otra instancia, por
    // ejemplo) pudo haberlos mandado despues de que se leyo `pedido`.
    const faltaComprador = !reservado.correoCompradorEnviadoEn;
    const faltaAviso = !reservado.avisoVentaEnviadoEn;
    if (!faltaComprador && !faltaAviso) return null;

    const datos = datosCorreo(reservado, giftCards);

    let comprador = false;
    if (faltaComprador) {
      comprador = await sendGiftCardsComprador(datos);
      if (!comprador) {
        console.warn(`[tienda] No se pudo enviar al comprador el correo del pedido ${pedido.numero}`);
      }
    }
    let venta = false;
    if (faltaAviso) {
      // El aviso dice si el comprador ya tiene su correo, para saber si hay que
      // escribirle a mano.
      venta = await sendNotificacionVenta(datos, faltaComprador ? comprador : true);
      if (!venta) {
        console.warn(`[tienda] No se pudo enviar el aviso de venta del pedido ${pedido.numero}`);
      }
    }

    if (comprador || venta) {
      // Si el correo ya salio, un fallo al anotarlo no debe parecer un fallo
      // de envio: se registra aparte. El barrido podria repetirlo, pero solo
      // hasta el tope de intentos (ya se reservo este).
      await storage
        .anotarCorreosEnviados(reservado.id, { comprador, venta })
        .catch((error) =>
          console.error(
            `[tienda] Se enviaron correos del pedido ${reservado.numero} pero no se pudo anotarlo:`,
            describirError(error),
          ),
        );
    }
    return { comprador, venta };
  } finally {
    correosEnCurso.delete(pedido.id);
  }
}

// Correos de la compra, en segundo plano: un fallo de Resend no debe frenar
// ni romper la confirmacion del pago (las Gift Cards ya se ven en la pagina de
// resultado, y el barrido reintenta lo que falte). Nunca se registran los codigos.
function avisarCompra(pedido: Pedido): void {
  enviarCorreosPendientes(pedido).catch((error) => {
    console.error(`[tienda] Error enviando los correos del pedido ${pedido.numero}:`, describirError(error));
  });
}

// Pasa el pedido a pagado y entrega sus Gift Cards en la misma operacion. Es
// idempotente: si ya estaba pagado, storage no toca nada ni entrega codigos.
// Si prepararEntrega lanza (el pedido no cuadra, o es un pago real con el
// servidor en modo prueba), no se marca nada y el error sube.
// Un pedido real sin stock suficiente SI queda pagado (el dinero ya salio del
// comprador): lo que falte queda en faltanCodigos, se registra "PAGO SIN STOCK"
// y el admin lo ve en /admin para entregarlo a mano.
async function pagarPedido(pedido: Pedido, datos: DatosPagoSpidi): Promise<Pedido> {
  for (let intento = 1; ; intento++) {
    const entrega: EntregaPago =
      pedido.estado === "pagado" ? { tipo: "prueba", giftCards: [] } : prepararEntrega(pedido);
    try {
      const { pedido: actualizado, recienPagado, faltanCodigos } = await storage.marcarPedidoPagado(
        pedido.id,
        datos,
        entrega,
      );
      if (recienPagado && actualizado) {
        const total =
          entrega.tipo === "prueba" ? entrega.giftCards.length : entrega.unidades.reduce((s, u) => s + u.cantidad, 0);
        console.log(
          `[tienda] Pedido ${pedido.numero} pagado: ${total - faltanCodigos} Gift Card(s) entregada(s)` +
            (entrega.tipo === "prueba" ? " (de prueba)" : " (del inventario)"),
        );
        if (faltanCodigos > 0) {
          // Sin el codigo ni datos del comprador: solo el numero de pedido.
          console.error(
            `[tienda] PAGO SIN STOCK: el pedido ${pedido.numero} se pago pero faltan ${faltanCodigos} codigo(s) de Gift Card en el inventario. ` +
              "Hay que entregarlos a mano (el pedido aparece en /admin con codigos pendientes).",
          );
        }
        avisarCompra(actualizado);
      }
      return actualizado ?? pedido;
    } catch (error) {
      // Codigo de Gift Card repetido (solo posible con los generados de
      // prueba): se generan otros y se reintenta.
      if (esViolacionDeUnicidad(error) && intento < MAX_INTENTOS_UNICIDAD) continue;
      throw error;
    }
  }
}

// Aplica al pedido lo que SPIDI dice de su sesion (GET status).
export async function aplicarEstadoSpidi(
  pedido: Pedido,
  estado: EstadoSesionSpidi,
): Promise<Pedido> {
  let actual = pedido;
  if (estado.status === "paid") {
    actual = await pagarPedido(actual, estado.pago ?? pagoSinDetalle());
  } else if (
    (estado.status === "failed" || estado.status === "expired") &&
    actual.estado === "pendiente"
  ) {
    actual =
      (await storage.marcarPedidoTerminado(
        actual.id,
        estado.status === "failed" ? "fallido" : "expirado",
        estado.motivo,
      )) ?? actual;
  }

  // Fase 2: no cambia el estado (sigue "pagado"), solo deja constancia.
  if (estado.acreditacion && !actual.acreditadoEn) {
    const { pedido: acreditado } = await storage.marcarPedidoAcreditado(actual.id, estado.acreditacion);
    actual = acreditado ?? actual;
  }
  return actual;
}

// Con el cupo de consultas agotado cada pagina abierta fallaria en cada
// consulta: se avisa una vez por minuto en vez de llenar el log.
let ultimoAvisoDeLimite = 0;

function avisarLimiteDeConsultas(contexto: string): void {
  const ahora = Date.now();
  if (ahora - ultimoAvisoDeLimite < 60_000) return;
  ultimoAvisoDeLimite = ahora;
  console.warn(`[tienda] Sin cupo para consultar a SPIDI (${contexto}): se usa el estado guardado`);
}

// Consulta la sesion en SPIDI y aplica el resultado. Si algo falla se registra
// y se devuelve el pedido como este guardado: la pagina volvera a preguntar.
// Para la pagina publica; el webhook usa confirmarPagoConSpidi, que no se traga
// el error. Consulta como "publica": gasta del sub-cupo de la pagina, nunca del
// que necesitan el barrido y el aviso de acreditacion.
async function refrescarDesdeSpidi(pedido: Pedido): Promise<Pedido> {
  if (!pedido.spidiSessionId || !spidiConfigurado()) return pedido;
  try {
    const estado = await consultarSesion(pedido.spidiSessionId, "publica");
    return await aplicarEstadoSpidi(pedido, estado);
  } catch (error) {
    if (esLimiteDeLlamadas(error)) {
      avisarLimiteDeConsultas("pagina de resultado");
    } else {
      console.error(`[tienda] No se pudo consultar en SPIDI el pedido ${pedido.numero}:`, describirError(error));
    }
    // Se relee por si alguna parte si se aplico antes del fallo.
    return (await storage.obtenerPedido(pedido.id).catch(() => undefined)) ?? pedido;
  }
}

// Como refrescarDesdeSpidi, pero exige que SPIDI confirme el pago y LANZA si no
// puede: la consulta falla (red, 5xx, sin cupo) o el status no es "paid". Lo
// usa el aviso de acreditacion, para que procesarWebhook responda 500 sin
// registrar la idempotency-key y SPIDI reintente.
async function confirmarPagoConSpidi(pedido: Pedido): Promise<Pedido> {
  if (!pedido.spidiSessionId) {
    throw new Error(`El pedido ${pedido.numero} no tiene sesion de SPIDI que consultar`);
  }
  const estado = await consultarSesion(pedido.spidiSessionId);
  if (estado.status !== "paid") {
    // Tras "paid" el status no cambia (la acreditacion no lo mueve), asi que
    // una sesion acreditada deberia responder "paid". Si no, se reintenta.
    throw new Error(
      `SPIDI acredito el pedido ${pedido.numero} pero GET status responde "${estado.status}"`,
    );
  }
  const actualizado = await aplicarEstadoSpidi(pedido, estado);
  if (actualizado.estado !== "pagado") {
    throw new Error(`El pedido ${pedido.numero} no quedo pagado tras confirmar con SPIDI`);
  }
  return actualizado;
}

// === Webhook de SPIDI ===

function leerCabecera(cabeceras: IncomingHttpHeaders, nombre: string): string | undefined {
  const valor = cabeceras[nombre];
  return Array.isArray(valor) ? valor[0] : valor;
}

async function aplicarEvento(evento: EventoSpidi): Promise<void> {
  if (evento.tipo === "otro") {
    // Evento que no usamos (o que SPIDI agrego despues): se ignora con 2xx.
    console.log(`[tienda] Aviso de SPIDI ignorado: ${evento.evento}`);
    return;
  }
  if (!evento.sessionId) {
    const mensaje = `[tienda] Aviso de SPIDI ${evento.evento} sin session_id: no se puede asociar a un pedido`;
    if (evento.tipo === "acreditacion_fallida") console.error(mensaje);
    else console.warn(mensaje);
    return;
  }

  const pedido = await storage.obtenerPedidoPorSesionSpidi(evento.sessionId);
  if (!pedido) {
    console.warn(
      `[tienda] Aviso de SPIDI ${evento.evento} de la sesion ${evento.sessionId}, que no corresponde a ningun pedido: ignorado`,
    );
    return;
  }

  switch (evento.tipo) {
    case "pagado":
      // El webhook firmado es prueba suficiente del pago (fase 1).
      await pagarPedido(pedido, evento.pago);
      break;
    case "acreditado": {
      const { pedido: acreditado } = await storage.marcarPedidoAcreditado(pedido.id, evento.acreditacion);
      // Si la acreditacion llego antes que el aviso de pago (o ese aviso se
      // perdio), este aviso es el respaldo: se confirma el pago con SPIDI para
      // no dejar al cliente sin sus Gift Cards. Si la consulta falla, se lanza:
      // procesarWebhook responde 500, no registra la clave y SPIDI reintenta.
      // (La acreditacion ya quedo guardada; repetirla no cambia nada.)
      const actual = acreditado ?? pedido;
      if (actual.estado !== "pagado") await confirmarPagoConSpidi(actual);
      break;
    }
    case "acreditacion_fallida":
      await storage.marcarAcreditacionFallida(pedido.id);
      console.error(
        `[tienda] SPIDI reporta acreditacion FALLIDA del pedido ${pedido.numero} (sesion ${evento.sessionId}): revisar en SPIDI Center`,
      );
      break;
  }
}

// Procesa un aviso de SPIDI. Devuelve normalmente para responder 200; lanza
// ErrorTienda con el codigo a responder (401 firma, 400 cuerpo, 503 sin
// configurar, 500 para que SPIDI reintente).
export async function procesarWebhook(
  rawBody: Buffer | undefined,
  cabeceras: IncomingHttpHeaders,
): Promise<{ duplicado: boolean }> {
  if (!rawBody || rawBody.length === 0) {
    throw new ErrorTienda(400, "Aviso sin cuerpo");
  }

  // La firma se calcula sobre el cuerpo CRUDO, byte a byte: nunca sobre el
  // JSON ya interpretado y vuelto a serializar.
  let firmaValida: boolean;
  try {
    firmaValida = verificarFirmaWebhook(
      rawBody,
      leerCabecera(cabeceras, "spidi-timestamp"),
      leerCabecera(cabeceras, "spidi-signature"),
    );
  } catch (error) {
    if (error instanceof SpidiNoConfigurado) {
      console.error("[tienda] Aviso de SPIDI rechazado: falta SPIDI_WEBHOOK_SECRET");
      throw new ErrorTienda(503, "Webhook no configurado");
    }
    throw error;
  }
  if (!firmaValida) {
    console.warn("[tienda] Aviso de SPIDI rechazado: firma invalida o sin spidi-timestamp");
    throw new ErrorTienda(401, "Firma inválida");
  }

  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new ErrorTienda(400, "JSON inválido");
  }

  const claveIdempotencia = leerCabecera(cabeceras, "idempotency-key")?.trim() || null;
  try {
    // SPIDI reintenta: el mismo aviso puede llegar varias veces.
    if (claveIdempotencia && (await storage.eventoSpidiYaProcesado(claveIdempotencia))) {
      return { duplicado: true };
    }
    const evento = interpretarWebhook(cuerpo);
    await aplicarEvento(evento);
    // Solo se registra al terminar bien: si algo falla a la mitad, el
    // reintento de SPIDI lo procesa de nuevo (las transiciones son idempotentes).
    if (claveIdempotencia) {
      await storage.registrarEventoSpidi(claveIdempotencia, evento.evento, evento.sessionId);
    }
    return { duplicado: false };
  } catch (error) {
    console.error("[tienda] Error procesando un aviso de SPIDI (se espera el reintento):", describirError(error));
    throw new ErrorTienda(500, "Error procesando el aviso");
  }
}

// === Consulta publica del pedido ===

// Ultima vez que se pregunto a SPIDI por cada pedido (desde la pagina o desde
// el barrido). La pagina de resultado consulta cada pocos segundos; esto evita
// pasar el limite de SPIDI (100 peticiones por minuto por comercio) si hay
// varias pestanas abiertas. Ademas todas las llamadas comparten el presupuesto
// global de server/spidi.ts, y las de la pagina tienen dentro su propio sub-cupo.
const ultimaConsultaSpidi = new Map<string, number>();
// Espera progresiva para un pedido pendiente: seguido al principio (el
// comprador suele volver enseguida de pagar) y mas espaciado despues. El aviso
// de SPIDI, si llega, se ve igual en la siguiente lectura: esto solo frena las
// consultas a SPIDI, no las lecturas del pedido.
const ESPERA_PENDIENTE_INICIAL_MS = 4_000;
const ESPERA_PENDIENTE_DESPUES_MS = 15_000;
const DURACION_ESPERA_INICIAL_MS = 2 * 60_000;
const ESPERA_SI_FALTA_ACREDITACION_MS = 30_000;

function esperaSiPendiente(pedido: Pedido): number {
  const edadMs = Date.now() - new Date(pedido.creadoEn).getTime();
  return edadMs < DURACION_ESPERA_INICIAL_MS ? ESPERA_PENDIENTE_INICIAL_MS : ESPERA_PENDIENTE_DESPUES_MS;
}

// Borra las entradas viejas para que los mapas en memoria no crezcan sin fin.
function podarMapa<T>(mapa: Map<string, T>, esVieja: (valor: T) => boolean, tamanoMaximo: number): void {
  if (mapa.size <= tamanoMaximo) return;
  mapa.forEach((valor, clave) => {
    if (esVieja(valor)) mapa.delete(clave);
  });
}

function tocaConsultarSpidi(pedidoId: string, esperaMs: number): boolean {
  const ahora = Date.now();
  const ultima = ultimaConsultaSpidi.get(pedidoId);
  if (ultima !== undefined && ahora - ultima < esperaMs) return false;
  // Se marca ANTES de consultar: dos peticiones simultaneas no consultan las dos.
  ultimaConsultaSpidi.set(pedidoId, ahora);
  podarMapa(ultimaConsultaSpidi, (t) => ahora - t > 10 * 60_000, 1000);
  return true;
}

const ESTADOS: readonly EstadoPedido[] = ["pendiente", "pagado", "fallido", "expirado", "error"];

function normalizarEstado(estado: string): EstadoPedido {
  return (ESTADOS as readonly string[]).includes(estado) ? (estado as EstadoPedido) : "error";
}

function aIso(fecha: Date | string | null): string | null {
  return fecha ? new Date(fecha).toISOString() : null;
}

function aPedidoPublico(pedido: Pedido, giftCards: GiftCard[]): PedidoPublico {
  const estado = normalizarEstado(pedido.estado);
  const pagado = estado === "pagado";
  return {
    ok: true,
    id: pedido.id,
    numero: pedido.numero,
    estado,
    creadoEn: new Date(pedido.creadoEn).toISOString(),
    items: pedido.items.map((i) => ({
      productoId: i.productoId,
      nombre: i.nombre,
      cantidad: i.cantidad,
      precioUsd: i.precioUsd,
      subtotalUsd: redondearUsd(i.precioUsd * i.cantidad),
    })),
    totalUsd: pedido.totalUsdCentavos / 100,
    comprador: { nombre: pedido.compradorNombre, email: pedido.compradorEmail },
    pago: pagado
      ? {
          pagadoEn: aIso(pedido.pagadoEn),
          metodo: pedido.pagoMetodo,
          banco: pedido.pagoBanco,
          referenciaBancaria: pedido.pagoReferencia,
          montoVes: pedido.pagoMontoVes,
          tasaBcvUsdVes: pedido.pagoTasaBcv,
          spidiTransaccionId: pedido.spidiTransaccionId,
          comprobanteUrl: pedido.spidiComprobanteUrl,
        }
      : null,
    giftCards: pagado
      ? giftCards.map((g) => ({ codigo: g.codigo, montoUsd: g.montoUsdCentavos / 100, estado: g.estado }))
      : [],
    // El motivo de un pedido con "error" es interno (respuesta de SPIDI): no se muestra.
    motivo: estado === "fallido" || estado === "expirado" ? pedido.motivo : null,
    // SOLO lo que diga el pedido, en todos los estados: el numero congela el
    // modo desde que se crea. Un pedido real (TV-) pendiente no se rotula de
    // prueba porque el servidor este ahora en modo prueba: lo que pague el
    // comprador es dinero real (y se le entregara cuando vuelva a produccion).
    modoPrueba: esPedidoDePrueba(pedido, giftCards),
    faltanCodigos: faltanCodigosDe(pedido, giftCards),
  };
}

// Clave de relleno para comparar aunque el pedido no exista, y que la
// respuesta tarde lo mismo en los dos casos.
const CLAVE_RELLENO = randomBytes(24).toString("base64url");

export async function consultarPedidoPublico(id: string, clave: string): Promise<PedidoPublico> {
  const leido = id && id.length <= 64 ? await storage.obtenerPedido(id) : undefined;
  const claveCorrecta = compararSecreto(leido?.claveAcceso ?? CLAVE_RELLENO, clave);
  // Mismo 404 si no existe o si la clave no coincide: no se revela cual de los dos.
  if (!leido || !claveCorrecta) {
    throw new ErrorTienda(404, "Pedido no encontrado");
  }

  let pedido = leido;
  if (pedido.spidiSessionId) {
    const espera =
      pedido.estado === "pendiente"
        ? esperaSiPendiente(pedido)
        : pedido.estado === "pagado" && !pedido.acreditadoEn
          ? ESPERA_SI_FALTA_ACREDITACION_MS
          : null;
    if (espera !== null) {
      // Sin sub-cupo de la pagina publica se devuelve el estado guardado (el
      // aviso de SPIDI y el barrido siguen confirmando el pago). Se mira ANTES
      // de tocaConsultarSpidi para no anotar una consulta que no va a salir: el
      // barrido saltaria este pedido creyendolo recien consultado.
      if (cupoDisponible("consulta_publica") <= 0) {
        avisarLimiteDeConsultas("pagina de resultado");
      } else if (tocaConsultarSpidi(pedido.id, espera)) {
        pedido = await refrescarDesdeSpidi(pedido);
      }
    }
  }

  const giftCards = pedido.estado === "pagado" ? await storage.obtenerGiftCardsDePedido(pedido.id) : [];
  return aPedidoPublico(pedido, giftCards);
}

// === Limitadores por IP ===

// En memoria y por IP: suficiente para frenar a quien abre sesiones de pago o
// consulta pedidos en bucle. Se reinicia con el proceso, lo cual es aceptable
// para este fin. Lanzan ErrorTienda 429 (codigo "LIMITE").
function crearLimitador(ventanaMs: number, maximo: number, mensaje: string): (ip: string) => void {
  const intentos = new Map<string, number[]>();
  return (ip: string) => {
    const ahora = Date.now();
    const recientes = (intentos.get(ip) ?? []).filter((t) => ahora - t < ventanaMs);
    if (recientes.length >= maximo) {
      intentos.set(ip, recientes);
      throw new ErrorTienda(429, mensaje, "LIMITE");
    }
    recientes.push(ahora);
    intentos.set(ip, recientes);
    podarMapa(
      intentos,
      (tiempos) => tiempos.length === 0 || ahora - tiempos[tiempos.length - 1] >= ventanaMs,
      1000,
    );
  };
}

// Checkout: 8 pedidos nuevos cada 10 minutos (cada uno abre una sesion de
// pago). Lo aplica crearCheckout solo cuando va a crear un pedido: reintentar
// con una idempotency-key que ya tiene pedido vivo no cuenta.
const limitarCheckout = crearLimitador(
  10 * 60_000,
  8,
  "Demasiados intentos de pago seguidos. Espera unos minutos e intenta de nuevo.",
);

// === Tope de unidades apartadas a la vez ===
// Cada pedido sin pagar aparta sus codigos. Sin tope, alguien podria dejar la
// tienda en "Sin stock" abriendo pedidos que nunca paga. Por correo se cuenta
// en storage (sobrevive a reinicios y ve todos los pedidos); por IP, en memoria
// (la IP no se guarda en el pedido), igual que los limitadores de arriba.

// Una reserva vive como mucho lo que dura el enlace de pago mas 30 minutos: el
// Boton muere en 20 minutos como mucho, y pasado esto el barrido devuelve sus
// codigos al inventario aunque SPIDI nunca haya cerrado la sesion (ver
// liberarReservasVencidas). Si ese pago llega tarde, marcarPedidoPagado toma
// codigos disponibles o lo registra como PAGO SIN STOCK.
const MARGEN_RESERVA_MS = 30 * 60_000;

function vidaMaximaReservaMs(): number {
  return duracionSesionMinutos() * 60_000 + MARGEN_RESERVA_MS;
}

interface ReservaDeIp {
  // null mientras el pedido se esta creando.
  pedidoId: string | null;
  unidades: number;
  desde: number;
}

const reservasPorIp = new Map<string, ReservaDeIp[]>();
// Unidades de pedidos que se estan creando ahora mismo, por correo: aun no
// aparecen en storage, pero cuentan para que dos checkouts simultaneos no pasen
// juntos el tope.
const unidadesEnCursoPorEmail = new Map<string, number>();

function sumarEnCursoEmail(email: string, delta: number): void {
  const total = (unidadesEnCursoPorEmail.get(email) ?? 0) + delta;
  if (total > 0) unidadesEnCursoPorEmail.set(email, total);
  else unidadesEnCursoPorEmail.delete(email);
}

// `apartadas`: las que ya tiene ese correo o esa IP en pedidos sin pagar.
function errorLimiteReservas(porIp: boolean, apartadas: number): ErrorTienda {
  const minutos = Math.round(vidaMaximaReservaMs() / 60_000);
  const ya = apartadas === 1 ? "1 apartada" : `${apartadas} apartadas`;
  return new ErrorTienda(
    409,
    `Solo se pueden tener ${MAX_UNIDADES_RESERVADAS_SIMULTANEAS} Gift Cards apartadas a la vez en pedidos sin pagar ` +
      (porIp ? `y desde esta conexión ya hay ${ya}.` : `y con este correo ya tienes ${ya}.`) +
      ` Termina de pagar esos pedidos, pide menos unidades o espera unos ${minutos} minutos a que venzan.`,
    "LIMITE",
  );
}

// Lo que devuelve apartarCupoDeReservas: confirmar() ata el cupo al pedido ya
// creado; cancelar() lo suelta si el pedido no llego a crearse.
interface CupoReservas {
  confirmar(pedidoId: string): void;
  cancelar(): void;
}

// Revisa que el correo y la IP no pasen de MAX_UNIDADES_RESERVADAS_SIMULTANEAS
// con estas `unidades` nuevas y, si cabe, las aparta. Si no cabe, lanza 409
// "LIMITE" sin apartar nada. Solo cuentan los pedidos "pendiente" con su
// reserva aun viva: uno pagado, fallido o vencido ya no aparta nada.
async function apartarCupoDeReservas(email: string, ip: string, unidades: number): Promise<CupoReservas> {
  if (unidades <= 0) return { confirmar: () => undefined, cancelar: () => undefined };

  const enStorage = await storage.contarUnidadesReservadasPorEmail(email);
  // Pedidos de esta IP que aun pueden tener reserva (los mas viejos ya los
  // libero el barrido): se mira en storage cuales siguen pendientes.
  const vida = vidaMaximaReservaMs();
  const conPedido = (reservasPorIp.get(ip) ?? []).filter((r) => r.pedidoId !== null && Date.now() - r.desde < vida);
  const terminados = new Set<string>();
  for (const r of conPedido) {
    const pedido = await storage.obtenerPedido(r.pedidoId as string);
    if (!pedido || pedido.estado !== "pendiente") terminados.add(r.pedidoId as string);
  }

  // Desde aqui no hay ningun await: revisar y apartar es un solo paso, asi que
  // dos checkouts simultaneos ven cada uno lo que aparto el otro.
  const ahora = Date.now();
  const enEmail = enStorage + (unidadesEnCursoPorEmail.get(email) ?? 0);
  if (enEmail + unidades > MAX_UNIDADES_RESERVADAS_SIMULTANEAS) {
    throw errorLimiteReservas(false, enEmail);
  }
  const vigentes = (reservasPorIp.get(ip) ?? []).filter(
    (r) => ahora - r.desde < vida && !(r.pedidoId !== null && terminados.has(r.pedidoId)),
  );
  const enIp = vigentes.reduce((suma, r) => suma + r.unidades, 0);
  if (enIp + unidades > MAX_UNIDADES_RESERVADAS_SIMULTANEAS) {
    if (vigentes.length > 0) reservasPorIp.set(ip, vigentes);
    else reservasPorIp.delete(ip);
    throw errorLimiteReservas(true, enIp);
  }

  const entrada: ReservaDeIp = { pedidoId: null, unidades, desde: ahora };
  vigentes.push(entrada);
  reservasPorIp.set(ip, vigentes);
  sumarEnCursoEmail(email, unidades);
  podarMapa(reservasPorIp, (lista) => lista.every((r) => ahora - r.desde >= vida), 1000);

  let resuelto = false;
  return {
    confirmar(pedidoId: string) {
      if (resuelto) return;
      resuelto = true;
      // El pedido ya esta en storage con sus reservas: el correo se cuenta ahi.
      // Se resta con unos segundos de retraso: un checkout simultaneo del mismo
      // correo pudo leer storage antes de que este pedido fuera visible, y sin
      // el retraso lo dejaria pasar por encima del tope.
      setTimeout(() => sumarEnCursoEmail(email, -unidades), 15_000).unref();
      entrada.pedidoId = pedidoId;
    },
    cancelar() {
      if (resuelto) return;
      resuelto = true;
      sumarEnCursoEmail(email, -unidades);
      const lista = (reservasPorIp.get(ip) ?? []).filter((r) => r !== entrada);
      if (lista.length > 0) reservasPorIp.set(ip, lista);
      else reservasPorIp.delete(ip);
    },
  };
}

// GET /api/pedidos/:id: 60 por minuto. La pagina de resultado pregunta cada
// pocos segundos, asi que esto deja holgura para varias pestanas, pero frena a
// quien la llame en bucle (cada consulta puede terminar en una llamada a SPIDI).
export const limitarConsultaPedido = crearLimitador(
  60_000,
  60,
  "Demasiadas consultas seguidas. Espera un momento e intenta de nuevo.",
);

// === Conciliacion periodica con SPIDI ===
// Sin esto, un pedido solo se reconsultaria si el comprador abre
// /pago/resultado. Si SPIDI se rinde con el aviso (reintenta y luego se rinde,
// sin reenvio) y el comprador cierra la pestana, un pago debitado quedaria
// "pendiente" para siempre. El barrido consulta GET status (la fuente de
// respaldo y reconciliacion) de los pedidos que pudieron quedarse sin aviso, y
// reintenta los correos que no salieron.

const PRIMER_BARRIDO_MS = 30_000;
const INTERVALO_BARRIDO_MS = 2 * 60_000;
const MAX_PEDIDOS_POR_BARRIDO = 20;
// Al menos 1 s entre consulta y consulta: el barrido nunca hace rafagas.
const PAUSA_ENTRE_CONSULTAS_MS = 1_100;
// Cupo de consultas que el barrido deja libre para las paginas de resultado
// abiertas (hay compradores esperando). Si no queda mas que eso, sigue en el
// siguiente barrido. Nunca se reserva mas de lo que la pagina aun puede usar de
// su sub-cupo: si ya lo gasto, guardarle sitio solo frenaria al barrido.
const CUPO_RESERVADO_PARA_PAGINAS = 20;
// Si la pagina de resultado acaba de consultarlo, no hace falta repetir.
const RECIEN_CONSULTADO_MS = 60_000;
const MAX_CORREOS_POR_BARRIDO = 10;
// La espera entre reintentos de correo (ESPERA_REINTENTO_CORREO_MS) vive en
// server/storage.ts: listarPedidosConCorreoPendiente ya devuelve solo los que
// toca reintentar.

let conciliacionIniciada = false;
let barridoEnCurso = false;

// Un pedido que falla siempre (por ejemplo, una sesion de otro entorno de SPIDI
// que responde 404) se reintentaria cada 2 minutos durante horas: su error se
// registra la primera vez y luego como mucho una vez por hora.
const ultimoErrorConciliacion = new Map<string, number>();
const REPETIR_ERROR_CONCILIACION_MS = 60 * 60_000;

function registrarErrorConciliacion(pedido: Pedido, error: unknown): void {
  const ahora = Date.now();
  const ultimo = ultimoErrorConciliacion.get(pedido.id);
  if (ultimo !== undefined && ahora - ultimo < REPETIR_ERROR_CONCILIACION_MS) return;
  ultimoErrorConciliacion.set(pedido.id, ahora);
  podarMapa(ultimoErrorConciliacion, (t) => ahora - t > REPETIR_ERROR_CONCILIACION_MS, 1000);
  console.error(`[tienda] Conciliacion: no se pudo revisar el pedido ${pedido.numero}:`, describirError(error));
}

export interface ResultadoBarrido {
  // Checkouts que murieron sin sesion y se pasaron a "error".
  interrumpidos: number;
  // Codigos reservados que volvieron al inventario (pedidos vencidos o terminados).
  reservasLiberadas: number;
  consultados: number;
  actualizados: number;
  fallidos: number;
  correos: number;
}

// Pasa a "error" los pedidos "pendiente" que siguen sin sesion de SPIDI tras
// CHECKOUT_HUERFANO_BARRIDO_MS: su checkout murio a mitad y nadie volvio a
// intentar con su clave. No se pueden pagar (no tienen enlace).
async function cerrarCheckoutsInterrumpidos(resultado: ResultadoBarrido): Promise<void> {
  const marcados = await storage.marcarCheckoutsInterrumpidos(
    new Date(Date.now() - CHECKOUT_HUERFANO_BARRIDO_MS),
    MOTIVO_CHECKOUT_INTERRUMPIDO,
  );
  resultado.interrumpidos += marcados;
  if (marcados > 0) {
    console.warn(`[tienda] Conciliacion: ${marcados} pedido(s) sin sesion de pago marcados como interrumpidos`);
  }
}

// Devuelve al inventario los codigos que ya no deberian seguir apartados:
// - los de pedidos "pendiente" con mas de vidaMaximaReservaMs (su enlace de
//   pago murio hace rato). Sin esto, un pendiente que SPIDI nunca cierra (se
//   cambio de entorno o de credenciales y su sesion ya no se puede consultar,
//   o el comprador abandono y nadie consulto) retendria codigos reales para
//   siempre. El pedido sigue pendiente: si el pago llega tarde, se entrega
//   con lo disponible o queda como PAGO SIN STOCK.
// - red de seguridad: cada cambio a fallido/expirado/error ya libera sus
//   reservas en la misma operacion, pero si algo quedo apartado (por ejemplo,
//   un pedido cambiado a mano en la base), vuelve aqui al inventario.
// No depende de SPIDI: corre aunque SPIDI no este configurado o el entorno sea
// desconocido (justo cuando mas pendientes quedan sin cerrar).
async function liberarReservasVencidas(resultado: ResultadoBarrido): Promise<void> {
  const liberadas = await storage.liberarReservasHuerfanas(new Date(Date.now() - vidaMaximaReservaMs()));
  resultado.reservasLiberadas += liberadas;
  if (liberadas > 0) {
    console.warn(`[tienda] Conciliacion: ${liberadas} codigo(s) reservados por pedidos sin pagar volvieron al inventario`);
  }
}

async function conciliarPedidos(resultado: ResultadoBarrido): Promise<void> {
  const candidatos = await storage.listarPedidosParaConciliar(MAX_PEDIDOS_POR_BARRIDO);
  let consultasHechas = 0;
  for (const pedido of candidatos) {
    if (!pedido.spidiSessionId) continue;
    const ultima = ultimaConsultaSpidi.get(pedido.id);
    if (ultima !== undefined && Date.now() - ultima < RECIEN_CONSULTADO_MS) continue;

    if (consultasHechas > 0) await esperar(PAUSA_ENTRE_CONSULTAS_MS);
    const reservadoParaPaginas = Math.min(CUPO_RESERVADO_PARA_PAGINAS, cupoDisponible("consulta_publica"));
    if (cupoDisponible("consulta") <= reservadoParaPaginas) {
      avisarLimiteDeConsultas("conciliacion; sigue en el proximo barrido");
      return;
    }

    consultasHechas++;
    const ahora = Date.now();
    ultimaConsultaSpidi.set(pedido.id, ahora);
    podarMapa(ultimaConsultaSpidi, (t) => ahora - t > 10 * 60_000, 1000);
    try {
      const estado = await consultarSesion(pedido.spidiSessionId);
      resultado.consultados++;
      const actualizado = await aplicarEstadoSpidi(pedido, estado);
      const cambioEstado = actualizado.estado !== pedido.estado;
      const recienAcreditado = !pedido.acreditadoEn && Boolean(actualizado.acreditadoEn);
      if (cambioEstado || recienAcreditado) {
        resultado.actualizados++;
        console.log(
          `[tienda] Conciliacion: pedido ${pedido.numero} ${pedido.estado} -> ${actualizado.estado}` +
            (recienAcreditado ? " (acreditado)" : ""),
        );
      }
    } catch (error) {
      if (esLimiteDeLlamadas(error)) {
        // Sin cupo o SPIDI pidio esperar: seguir solo empeoraria el limite.
        avisarLimiteDeConsultas("conciliacion; sigue en el proximo barrido");
        return;
      }
      resultado.fallidos++;
      registrarErrorConciliacion(pedido, error);
    }
  }
}

async function reintentarCorreos(resultado: ResultadoBarrido): Promise<void> {
  // Ya vienen solo los que cumplieron su espera; el tope de intentos lo vuelve
  // a revisar la reserva de enviarCorreosPendientes.
  const pendientes = await storage.listarPedidosConCorreoPendiente(MAX_CORREOS_POR_BARRIDO);
  for (const pedido of pendientes) {
    try {
      const enviados = await enviarCorreosPendientes(pedido);
      if (enviados) resultado.correos++;
    } catch (error) {
      console.error(`[tienda] No se pudieron reintentar los correos del pedido ${pedido.numero}:`, describirError(error));
    }
  }
}

// Un barrido completo: cerrar checkouts interrumpidos, liberar reservas
// vencidas, conciliar pedidos con SPIDI y reintentar correos. Nunca corren dos
// a la vez (si el anterior sigue, devuelve null sin hacer nada). Solo la
// conciliacion necesita SPIDI configurado; lo demas corre siempre, para que un
// SPIDI mal configurado no deje codigos apartados para siempre. Cada paso va
// aparte: si uno falla, los siguientes corren igual.
export async function ejecutarBarrido(): Promise<ResultadoBarrido | null> {
  if (barridoEnCurso) return null;
  barridoEnCurso = true;
  const resultado: ResultadoBarrido = {
    interrumpidos: 0,
    reservasLiberadas: 0,
    consultados: 0,
    actualizados: 0,
    fallidos: 0,
    correos: 0,
  };
  try {
    try {
      await cerrarCheckoutsInterrumpidos(resultado);
    } catch (error) {
      console.error("[tienda] Conciliacion: no se pudieron cerrar los checkouts interrumpidos:", describirError(error));
    }
    try {
      await liberarReservasVencidas(resultado);
    } catch (error) {
      console.error("[tienda] Conciliacion: no se pudieron liberar las reservas vencidas:", describirError(error));
    }
    if (spidiConfigurado()) {
      try {
        await conciliarPedidos(resultado);
      } catch (error) {
        console.error("[tienda] Conciliacion: no se pudo leer la lista de pedidos:", describirError(error));
      }
    }
    try {
      await reintentarCorreos(resultado);
    } catch (error) {
      console.error("[tienda] No se pudo leer la lista de correos pendientes:", describirError(error));
    }
    return resultado;
  } finally {
    barridoEnCurso = false;
  }
}

// Arranca el barrido periodico: el primero ~30 s despues de arrancar y luego
// cada 2 minutos. Los temporizadores no mantienen vivo el proceso (unref). Se
// llama una vez desde server/index.ts cuando el servidor ya escucha.
export function iniciarConciliacion(): void {
  if (conciliacionIniciada) return;
  // Los errores de configuracion del entorno se registran aunque SPIDI aun no
  // este completo: quien configura debe verlos en el primer arranque.
  for (const { grave, mensaje } of revisarEntornoSpidi()) {
    if (grave) console.error(`[tienda] ${mensaje}`);
    else console.warn(`[tienda] ${mensaje}`);
  }
  // Que quede claro en el log del arranque contra que entorno se cobra (solo
  // el nombre del entorno, nunca la URL ni credenciales). El barrido arranca
  // igual con entorno desconocido: es el que entregara los pagos reales
  // retenidos cuando se corrija la configuracion. Y arranca aunque SPIDI no
  // este configurado: sin conciliar, pero liberando las reservas vencidas y
  // reintentando los correos.
  const entorno = entornoSpidi();
  if (!spidiConfigurado()) {
    console.warn(
      "[tienda] Conciliacion con SPIDI desactivada: SPIDI no esta configurado (el barrido solo libera reservas vencidas y reintenta correos)",
    );
  } else if (entorno === "desconocido") {
    console.error(
      "[tienda] Entorno de SPIDI DESCONOCIDO: el checkout queda cerrado siempre (503), aunque haya SPIDI_PERMITIR_PRUEBAS=1 o NODE_ENV=development",
    );
  } else if (pruebasBloqueadas()) {
    console.warn(
      `[tienda] NODE_ENV=production y SPIDI no esta en produccion confirmada (entorno ${entorno}): el checkout queda cerrado (SPIDI_PERMITIR_PRUEBAS=1 lo abre en un staging)`,
    );
  } else if (modoPrueba()) {
    console.warn(
      `[tienda] MODO PRUEBA (${entorno}): los pagos no son reales; los pedidos nuevos salen TVP- y sus Gift Cards con prefijo PRUEBA- (no se pueden canjear)`,
    );
  } else {
    console.log("[tienda] SPIDI en produccion: los pagos son reales");
  }
  conciliacionIniciada = true;
  const barrer = () => {
    ejecutarBarrido().catch((error) => {
      console.error("[tienda] Error en el barrido de conciliacion:", describirError(error));
    });
  };
  setTimeout(barrer, PRIMER_BARRIDO_MS).unref();
  setInterval(barrer, INTERVALO_BARRIDO_MS).unref();
  console.log(
    spidiConfigurado()
      ? "[tienda] Conciliacion con SPIDI activa: un barrido cada 2 minutos"
      : "[tienda] Barrido activo sin SPIDI: un barrido cada 2 minutos",
  );
}

// === Administracion (soporte) ===
// Las rutas /api/admin exigen x-admin-key (server/routes.ts). El admin SI ve
// los codigos de Gift Card: los necesita para atender al comprador.

// PedidoAdmin y los demas tipos del panel viven en shared/admin.ts.

function aPedidoAdmin(pedido: Pedido, giftCards: GiftCard[]): PedidoAdmin {
  return {
    id: pedido.id,
    numero: pedido.numero,
    estado: pedido.estado,
    modoPrueba: esPedidoDePrueba(pedido, giftCards),
    creadoEn: new Date(pedido.creadoEn).toISOString(),
    pagadoEn: aIso(pedido.pagadoEn),
    totalUsd: pedido.totalUsdCentavos / 100,
    items: pedido.items.map((i) => ({
      productoId: i.productoId,
      nombre: i.nombre,
      cantidad: i.cantidad,
      precioUsd: i.precioUsd,
    })),
    comprador: {
      nombre: pedido.compradorNombre,
      email: pedido.compradorEmail,
      telefono: pedido.compradorTelefono,
    },
    pago:
      pedido.estado === "pagado"
        ? {
            metodo: pedido.pagoMetodo,
            banco: pedido.pagoBanco,
            referenciaBancaria: pedido.pagoReferencia,
            montoVes: pedido.pagoMontoVes,
          }
        : null,
    giftCards: giftCards.map((g) => ({ codigo: g.codigo, montoUsd: g.montoUsdCentavos / 100, estado: g.estado })),
    faltanCodigos: faltanCodigosDe(pedido, giftCards),
    correos: {
      compradorEnviadoEn: aIso(pedido.correoCompradorEnviadoEn),
      avisoVentaEnviadoEn: aIso(pedido.avisoVentaEnviadoEn),
      intentos: pedido.correoIntentos,
    },
  };
}

// Convierte varios pedidos leyendo sus Gift Cards en una sola consulta.
async function aPedidosAdmin(lista: Pedido[]): Promise<PedidoAdmin[]> {
  const giftCards = await storage.obtenerGiftCardsDePedidos(lista.map((p) => p.id));
  const porPedido = new Map<string, GiftCard[]>();
  for (const g of giftCards) {
    const delPedido = porPedido.get(g.pedidoId);
    if (delPedido) delPedido.push(g);
    else porPedido.set(g.pedidoId, [g]);
  }
  return lista.map((p) => aPedidoAdmin(p, porPedido.get(p.id) ?? []));
}

const MAX_RESULTADOS_ADMIN = 20;

function validarBusqueda(buscar: string): string {
  const termino = buscar.trim();
  if (termino.length < 3 || termino.length > 200) {
    throw new ErrorTienda(400, "Indica un número de pedido (TV-... o TVP-...) o un correo completo.");
  }
  return termino;
}

// Busca por numero de pedido exacto o email exacto (sin coincidencias parciales:
// no es un buscador de clientes, es para atender un caso concreto).
export async function buscarPedidosAdmin(buscar: string): Promise<PedidoAdmin[]> {
  const termino = validarBusqueda(buscar);
  return aPedidosAdmin(await storage.buscarPedidos(termino, MAX_RESULTADOS_ADMIN));
}

// === Paginacion de las listas del admin ===
// El cursor `siguiente` es opaco para el cliente: (creadoEn en ms, id) del
// ultimo elemento de la pagina, en base64url. Se pide uno de mas para saber si
// hay otra pagina sin contar toda la tabla.

const LIMITE_LISTA_POR_DEFECTO = 50;
const LIMITE_LISTA_MAXIMO = 200;

function codificarCursor(creadoEn: Date | string, id: string): string {
  return Buffer.from(`${new Date(creadoEn).getTime()}.${id}`, "utf8").toString("base64url");
}

function decodificarCursor(texto: string): CursorAdmin {
  const invalido = () => new ErrorTienda(400, "El parámetro «despues» no es válido. Vuelve a cargar la lista.");
  if (texto.length > 200) throw invalido();
  const crudo = Buffer.from(texto, "base64url").toString("utf8");
  const punto = crudo.indexOf(".");
  if (punto <= 0) throw invalido();
  const ms = Number(crudo.slice(0, punto));
  const id = crudo.slice(punto + 1);
  if (!Number.isSafeInteger(ms) || ms < 0 || !id || id.length > 64) throw invalido();
  return { creadoEn: new Date(ms), id };
}

function leerLimite(valor: string | undefined): number {
  if (valor === undefined || valor.trim() === "") return LIMITE_LISTA_POR_DEFECTO;
  const limite = Number(valor);
  if (!Number.isInteger(limite) || limite < 1) {
    throw new ErrorTienda(400, `El límite debe ser un número entre 1 y ${LIMITE_LISTA_MAXIMO}.`);
  }
  return Math.min(LIMITE_LISTA_MAXIMO, limite);
}

// Parametros de texto tal como llegan en la query (vacio = sin filtro).
export interface ParametrosLista {
  estado?: string;
  buscar?: string;
  productoId?: string;
  limite?: string;
  despues?: string;
}

function vacioAUndefined(valor: string | undefined): string | undefined {
  const limpio = valor?.trim();
  return limpio ? limpio : undefined;
}

// GET /api/admin/ventas
export async function listarVentasAdmin(p: ParametrosLista): Promise<VentasAdmin> {
  const estado = vacioAUndefined(p.estado);
  if (estado !== undefined && !(ESTADOS as readonly string[]).includes(estado)) {
    throw new ErrorTienda(400, `Estado desconocido. Usa uno de: ${ESTADOS.join(", ")}.`);
  }
  const buscarCrudo = vacioAUndefined(p.buscar);
  const buscar = buscarCrudo === undefined ? undefined : validarBusqueda(buscarCrudo);
  const limite = leerLimite(p.limite);
  const despuesCrudo = vacioAUndefined(p.despues);
  const despues = despuesCrudo === undefined ? undefined : decodificarCursor(despuesCrudo);

  const filas = await storage.listarPedidosAdmin({ estado, buscar, limite: limite + 1, despues });
  const pagina = filas.slice(0, limite);
  const ultimo = pagina[pagina.length - 1];
  return {
    ok: true,
    pedidos: await aPedidosAdmin(pagina),
    siguiente: filas.length > limite && ultimo ? codificarCursor(ultimo.creadoEn, ultimo.id) : null,
  };
}

// Inicio del dia y del mes en hora de Venezuela (UTC-4 todo el anio), como
// instante UTC, para el resumen de ventas.
function inicioDiaYMesVenezuela(ahora: Date = new Date()): { dia: Date; mes: Date } {
  const desfaseMs = 4 * 60 * 60 * 1000;
  const local = new Date(ahora.getTime() - desfaseMs);
  const anio = local.getUTCFullYear();
  const mes = local.getUTCMonth();
  return {
    dia: new Date(Date.UTC(anio, mes, local.getUTCDate()) + desfaseMs),
    mes: new Date(Date.UTC(anio, mes, 1) + desfaseMs),
  };
}

// GET /api/admin/resumen
// Con la tienda en produccion solo cuentan las ventas reales; con el servidor
// en modo prueba tambien las de prueba (si no, el dueno veria todo en cero
// mientras ensaya en el staging).
export async function resumenAdmin(): Promise<ResumenAdmin> {
  const { dia, mes } = inicioDiaYMesVenezuela();
  const ventas = await storage.resumenVentas({ desdeHoy: dia, desdeMes: mes, incluirPrueba: modoPrueba() });
  const inventario = await storage.contarInventario();
  return {
    ok: true,
    ventas: {
      pagadosHoy: ventas.pagadosHoy,
      pagadosMes: ventas.pagadosMes,
      totalUsdHoy: ventas.totalUsdCentavosHoy / 100,
      totalUsdMes: ventas.totalUsdCentavosMes / 100,
      pendientes: ventas.pendientes,
      sinCodigos: ventas.sinCodigos,
    },
    inventario,
  };
}

// === Inventario de codigos (admin) ===

function aCodigoAdmin(c: CodigoInventarioConPedido): CodigoInventarioAdmin {
  return {
    id: c.id,
    productoId: c.productoId,
    codigo: c.codigo,
    // Texto libre en la base: uno desconocido se muestra como anulado (no
    // disponible) en vez de romper el panel.
    estado: (ESTADOS_CODIGO_INVENTARIO as readonly string[]).includes(c.estado)
      ? (c.estado as EstadoCodigoInventario)
      : "anulado",
    pedidoNumero: c.pedidoNumero,
    creadoEn: new Date(c.creadoEn).toISOString(),
    entregadoEn: aIso(c.entregadoEn),
  };
}

function validarProductoId(productoId: string | undefined): string {
  const producto = productoId ? buscarProducto(productoId) : undefined;
  if (!producto || !producto.esGiftCard) {
    throw new ErrorTienda(400, `Producto desconocido. Usa uno de: ${PRODUCTOS.map((p) => p.id).join(", ")}.`);
  }
  return producto.id;
}

// GET /api/admin/inventario/codigos
export async function listarCodigosAdmin(p: ParametrosLista): Promise<CodigosInventarioAdmin> {
  const productoCrudo = vacioAUndefined(p.productoId);
  const productoId = productoCrudo === undefined ? undefined : validarProductoId(productoCrudo);
  const estadoCrudo = vacioAUndefined(p.estado);
  if (estadoCrudo !== undefined && !(ESTADOS_CODIGO_INVENTARIO as readonly string[]).includes(estadoCrudo)) {
    throw new ErrorTienda(400, `Estado desconocido. Usa uno de: ${ESTADOS_CODIGO_INVENTARIO.join(", ")}.`);
  }
  const estado = estadoCrudo as EstadoCodigoInventario | undefined;
  const limite = leerLimite(p.limite);
  const despuesCrudo = vacioAUndefined(p.despues);
  const despues = despuesCrudo === undefined ? undefined : decodificarCursor(despuesCrudo);

  const filas = await storage.listarCodigosInventario({ productoId, estado, limite: limite + 1, despues });
  const pagina = filas.slice(0, limite);
  const ultimo = pagina[pagina.length - 1];
  return {
    ok: true,
    codigos: pagina.map(aCodigoAdmin),
    siguiente: filas.length > limite && ultimo ? codificarCursor(ultimo.creadoEn, ultimo.id) : null,
  };
}

// Prefijo reservado para los codigos que se generan en modo prueba: un codigo
// real que empezara asi se confundiria con uno de prueba (y podria chocar).
const PREFIJO_RESERVADO = PREFIJO_CODIGO_PRUEBA.toUpperCase();
// Cualquier espacio en blanco (tras recortar los extremos, seria interno) o
// caracter de control.
const CARACTER_NO_PERMITIDO = /[\s\u0000-\u001f\u007f]/;
// Tope de lineas recibidas (contando las vacias), para no procesar listas
// enormes; el de codigos validos es MAX_CODIGOS_POR_CARGA.
const MAX_LINEAS_POR_CARGA = MAX_CODIGOS_POR_CARGA * 5;

// POST /api/admin/inventario { productoId, codigos }
// Los codigos se guardan tal cual (solo sin los espacios de los extremos): son
// los que aceptan las maquinas y no se les cambia ni una mayuscula.
export async function cargarInventario(cuerpo: unknown): Promise<CargaInventarioResponse> {
  // Sin base de datos los codigos vivirian en memoria y el proximo despliegue
  // los borraria: se rechaza la carga para que no se pierdan sin aviso.
  if (!storage.persistente && process.env.NODE_ENV === "production") {
    throw new ErrorTienda(503, "Falta la base de datos (DATABASE_URL): los códigos se perderían al reiniciar el sitio.");
  }
  const datos = (typeof cuerpo === "object" && cuerpo !== null ? cuerpo : {}) as {
    productoId?: unknown;
    codigos?: unknown;
  };
  const productoId = validarProductoId(typeof datos.productoId === "string" ? datos.productoId : undefined);
  if (!Array.isArray(datos.codigos) || datos.codigos.some((c) => typeof c !== "string")) {
    throw new ErrorTienda(400, "Envía los códigos como una lista de textos.");
  }
  if (datos.codigos.length > MAX_LINEAS_POR_CARGA) {
    throw new ErrorTienda(400, `Máximo ${MAX_CODIGOS_POR_CARGA} códigos por carga.`);
  }

  let invalidos = 0;
  let duplicados = 0;
  const vistos = new Set<string>();
  const validos: string[] = [];
  for (const crudo of datos.codigos as string[]) {
    const codigo = crudo.trim();
    if (!codigo) continue; // linea vacia: se ignora
    if (
      codigo.length > MAX_LARGO_CODIGO ||
      CARACTER_NO_PERMITIDO.test(codigo) ||
      codigo.toUpperCase().startsWith(PREFIJO_RESERVADO)
    ) {
      invalidos++;
      continue;
    }
    if (vistos.has(codigo)) {
      duplicados++;
      continue;
    }
    vistos.add(codigo);
    validos.push(codigo);
  }
  if (validos.length + duplicados + invalidos > MAX_CODIGOS_POR_CARGA) {
    throw new ErrorTienda(400, `Máximo ${MAX_CODIGOS_POR_CARGA} códigos por carga. Divide la lista en partes.`);
  }

  const resultado = await storage.agregarCodigosInventario(productoId, validos);
  // Solo cantidades: nunca los codigos.
  console.log(
    `[tienda] Inventario ${productoId}: ${resultado.agregados} codigo(s) agregado(s), ` +
      `${duplicados + resultado.duplicados} duplicado(s), ${invalidos} invalido(s)`,
  );
  return {
    ok: true,
    agregados: resultado.agregados,
    duplicados: duplicados + resultado.duplicados,
    invalidos,
  };
}

// POST /api/admin/inventario/:id/anular — solo un codigo "disponible".
export async function anularCodigoAdmin(id: string): Promise<AnularCodigoResponse> {
  if (!id || id.length > 64) throw new ErrorTienda(404, "Código no encontrado");
  const { codigo, anulado } = await storage.anularCodigoInventario(id);
  if (!codigo) throw new ErrorTienda(404, "Código no encontrado");
  if (!anulado) {
    const motivo =
      codigo.estado === "reservado"
        ? "está reservado por un pedido en curso"
        : codigo.estado === "entregado"
          ? "ya se entregó a un comprador"
          : "ya estaba anulado";
    throw new ErrorTienda(409, `No se puede anular: el código ${motivo}. Solo se anulan códigos disponibles.`);
  }
  console.log(`[tienda] Inventario ${codigo.productoId}: un codigo anulado desde admin`);
  return { ok: true, codigo: aCodigoAdmin(codigo) };
}

// Reenvia al comprador el correo con sus codigos (por ejemplo, si lo borro o si
// los envios automaticos se agotaron). Como el envio automatico, reserva el
// intento ANTES de enviar (aqui sin tope: lo pide una persona) y, si sale,
// anota la hora del correo del comprador.
export async function reenviarCorreoComprador(
  pedidoId: string,
): Promise<{ enviado: boolean; numero: string; email: string }> {
  const pedido = pedidoId && pedidoId.length <= 64 ? await storage.obtenerPedido(pedidoId) : undefined;
  if (!pedido) throw new ErrorTienda(404, "Pedido no encontrado");
  if (pedido.estado !== "pagado") {
    throw new ErrorTienda(409, "El pedido no está pagado: no hay códigos que reenviar.");
  }
  if (correosEnCurso.has(pedido.id)) {
    throw new ErrorTienda(409, "Ya se está enviando un correo de este pedido. Intenta de nuevo en unos segundos.");
  }
  correosEnCurso.add(pedido.id);
  try {
    const giftCards = await storage.obtenerGiftCardsDePedido(pedido.id);
    // Si la reserva falla, el error sube (500) sin haber enviado nada.
    const reservado = await storage.reservarIntentoCorreo(pedido.id, { sinTope: true });
    if (!reservado) throw new ErrorTienda(404, "Pedido no encontrado");
    const enviado = await sendGiftCardsComprador(datosCorreo(reservado, giftCards));
    // Si el correo ya salio, un fallo al anotarlo no debe responder error.
    if (enviado) {
      await storage
        .anotarCorreosEnviados(pedido.id, { comprador: true, venta: false })
        .catch((error) =>
          console.error(`[tienda] No se pudo anotar el reenvio del pedido ${pedido.numero}:`, describirError(error)),
        );
    }
    console.log(`[tienda] Reenvio del correo del pedido ${pedido.numero} desde admin: ${enviado ? "enviado" : "fallo"}`);
    return { enviado, numero: pedido.numero, email: pedido.compradorEmail };
  } finally {
    correosEnCurso.delete(pedido.id);
  }
}

// Lee un pedido para una accion del admin (404 si el id no es valido o no existe).
async function pedidoParaAdmin(pedidoId: string): Promise<Pedido> {
  const pedido = pedidoId && pedidoId.length <= 64 ? await storage.obtenerPedido(pedidoId) : undefined;
  if (!pedido) throw new ErrorTienda(404, "Pedido no encontrado");
  return pedido;
}

// El pedido como lo ve el panel, con sus Gift Cards al dia.
async function pedidoAdminActual(pedido: Pedido): Promise<PedidoAdmin> {
  return aPedidoAdmin(pedido, await storage.obtenerGiftCardsDePedido(pedido.id));
}

// POST /api/admin/pedidos/:id/completar-codigos
// Para un pago real que llego sin stock (PAGO SIN STOCK): despues de cargar
// codigos nuevos, el admin entrega desde aqui los que faltan y el comprador
// recibe de nuevo el correo, ya con todos sus codigos. Se puede repetir hasta
// que no falte ninguno.
export async function completarCodigosAdmin(pedidoId: string): Promise<CompletarCodigosResponse> {
  const pedido = await pedidoParaAdmin(pedidoId);
  // Las mismas reglas las vuelve a revisar storage con el pedido bloqueado;
  // aqui solo se responde antes y con un mensaje claro.
  if (esNumeroPedidoDePrueba(pedido.numero)) {
    throw new ErrorTienda(409, "Es un pedido de prueba: sus Gift Cards no salen del inventario real.");
  }
  if (pedido.estado !== "pagado") {
    throw new ErrorTienda(409, "El pedido no está pagado: no se le pueden entregar códigos.");
  }

  let unidades: UnidadesPedido;
  try {
    unidades = unidadesDelPedido(pedido);
  } catch (error) {
    console.error(`[tienda] No se pueden completar los codigos del pedido ${pedido.numero}:`, describirError(error));
    throw new ErrorTienda(409, "Las líneas de este pedido no cuadran con el catálogo: hay que entregarlo a mano.");
  }

  const r = await storage.completarCodigosPedido(pedido.id, unidades);
  switch (r.resultado) {
    case "no_existe":
      throw new ErrorTienda(404, "Pedido no encontrado");
    case "no_pagado":
      throw new ErrorTienda(409, "El pedido no está pagado: no se le pueden entregar códigos.");
    case "prueba":
      throw new ErrorTienda(409, "Es un pedido de prueba: sus Gift Cards no salen del inventario real.");
    case "completo":
      throw new ErrorTienda(409, "A este pedido no le falta ningún código.");
  }

  // Solo cantidades y el numero de pedido: nunca los codigos.
  console.log(
    `[tienda] Pedido ${r.pedido.numero}: ${r.entregados} codigo(s) completados desde admin, faltan ${r.faltanCodigos}`,
  );

  // Con codigos nuevos, el comprador recibe otra vez el correo, ya con todos.
  // Si falla, los codigos ya son suyos: se avisa y el admin puede reenviarlo.
  let correoEnviado = false;
  if (r.entregados > 0) {
    try {
      correoEnviado = (await reenviarCorreoComprador(r.pedido.id)).enviado;
    } catch (error) {
      console.error(
        `[tienda] Se completaron codigos del pedido ${r.pedido.numero} pero no se pudo reenviar el correo:`,
        describirError(error),
      );
    }
  }

  const partes: string[] = [];
  if (r.entregados === 0) {
    partes.push("No se entregó ningún código: no hay stock disponible de lo que falta.");
  } else {
    partes.push(
      r.entregados === 1 ? "Se entregó 1 código." : `Se entregaron ${r.entregados} códigos.`,
      correoEnviado
        ? "El comprador ya recibió el correo con todos sus códigos."
        : "No se pudo enviar el correo al comprador: usa «Reenviar correo».",
    );
  }
  if (r.faltanCodigos > 0) {
    partes.push(
      (r.faltanCodigos === 1 ? "Aún falta 1 código" : `Aún faltan ${r.faltanCodigos} códigos`) +
        " por falta de stock: carga más códigos en el inventario y vuelve a completar.",
    );
  }

  const releido = (await storage.obtenerPedido(r.pedido.id)) ?? r.pedido;
  return {
    ok: true,
    entregados: r.entregados,
    faltanCodigos: r.faltanCodigos,
    correoEnviado,
    mensaje: partes.join(" "),
    pedido: await pedidoAdminActual(releido),
  };
}

const MOTIVO_EXPIRADO_POR_ADMIN = "Expirado por el administrador";

// POST /api/admin/pedidos/:id/expirar
// Cierra en SPIDI el enlace de pago de un pedido pendiente (por ejemplo, el
// comprador avisa que no va a pagar) y devuelve sus codigos al inventario sin
// esperar a que venza. Primero SPIDI y despues el pedido: si se marcara
// expirado sin cerrar el enlace, el comprador aun podria pagarlo. Si SPIDI no
// lo deja expirar porque ya se pago (422), se consulta y se aplica el pago.
export async function expirarPedidoAdmin(pedidoId: string): Promise<ExpirarPedidoResponse> {
  const pedido = await pedidoParaAdmin(pedidoId);
  if (pedido.estado !== "pendiente") {
    throw new ErrorTienda(409, `Solo se puede expirar un pedido pendiente (este está ${pedido.estado}).`);
  }
  if (!pedido.spidiSessionId) {
    throw new ErrorTienda(409, "El pedido no tiene enlace de pago que expirar.");
  }
  if (!spidiConfigurado()) {
    throw new ErrorTienda(503, "SPIDI no está configurado en el servidor: no se puede expirar el enlace.");
  }
  const sessionId = pedido.spidiSessionId;

  let actualizado: Pedido;
  try {
    await expirarSesion(sessionId, MOTIVO_EXPIRADO_POR_ADMIN);
    // La sesion ya no se puede pagar: el pedido pasa a expirado y sus reservas
    // vuelven al inventario en la misma operacion. Si entretanto otro camino lo
    // cerro (un aviso de SPIDI), se devuelve como quedo.
    actualizado = (await storage.marcarPedidoTerminado(pedido.id, "expirado", MOTIVO_EXPIRADO_POR_ADMIN)) ?? pedido;
  } catch (error) {
    if (!(error instanceof SpidiError) || error.status !== 422) {
      console.error(`[tienda] No se pudo expirar en SPIDI el pedido ${pedido.numero}:`, describirError(error));
      if (error instanceof SpidiNoConfigurado) {
        throw new ErrorTienda(503, "SPIDI no está configurado en el servidor: no se puede expirar el enlace.");
      }
      if (esLimiteDeLlamadas(error)) {
        throw new ErrorTienda(503, "SPIDI pidió esperar un momento. Intenta de nuevo en un minuto.", "NO_DISPONIBLE");
      }
      throw new ErrorTienda(
        502,
        "SPIDI no aceptó expirar el enlace de pago. El pedido sigue pendiente; sus códigos se liberan solos cuando vence.",
      );
    }
    // 422: SPIDI no lo deja expirar (lo normal: ya estaba pagado). Se pregunta
    // el estado real y se aplica, igual que la conciliacion.
    try {
      actualizado = await aplicarEstadoSpidi(pedido, await consultarSesion(sessionId));
    } catch (errorConsulta) {
      console.error(
        `[tienda] SPIDI no dejo expirar el pedido ${pedido.numero} y no se pudo aplicar su estado:`,
        describirError(errorConsulta),
      );
      throw new ErrorTienda(
        502,
        "SPIDI no dejó expirar el enlace (puede que ya esté pagado), pero no se pudo confirmar su estado. Revisa el pedido en unos minutos.",
      );
    }
  }

  const estado = actualizado.estado;
  if (estado !== "expirado" && estado !== "pagado" && estado !== "fallido") {
    throw new ErrorTienda(409, "SPIDI no permitió expirar el enlace y la sesión sigue abierta. Intenta de nuevo más tarde.");
  }
  console.log(`[tienda] Pedido ${pedido.numero} desde admin: pendiente -> ${estado}`);
  const vista = await pedidoAdminActual(actualizado);
  const mensaje =
    estado === "expirado"
      ? "Enlace de pago expirado: sus códigos volvieron al inventario."
      : estado === "pagado"
        ? "No se expiró: el pedido ya estaba pagado en SPIDI y se aplicó el pago." +
          (vista.faltanCodigos > 0
            ? ` Le faltan ${vista.faltanCodigos} código(s) por falta de stock: usa «Completar códigos».`
            : " Sus códigos ya se entregaron.")
        : "SPIDI ya tenía el pago como fallido: el pedido quedó fallido y sus códigos volvieron al inventario.";
  return { ok: true, resultado: estado, mensaje, pedido: vista };
}
