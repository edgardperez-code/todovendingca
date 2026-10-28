// Contrato del panel /admin con el servidor: ventas, resumen e inventario de
// codigos de Gift Card. Lo importan los dos lados.
//
// Todas las rutas /api/admin/* exigen la cabecera x-admin-key (la ADMIN_KEY del
// servidor). Sin ella responden 401; tras 10 intentos fallidos desde la misma
// IP en 10 minutos responden 429 (codigo "LIMITE") durante un rato, aunque la
// clave sea la correcta: asi nadie puede probar claves en bucle.
//
// El admin SI ve los codigos completos: los necesita para cargar el stock y
// atender a los compradores. Por eso estas respuestas nunca se cachean.

// disponible -> reservado (un checkout lo aparta mientras se paga)
//   -> entregado (el pedido se pago y el codigo ya es del comprador).
// reservado -> disponible si el pago falla, expira o el pedido era de prueba.
// disponible -> anulado lo hace el admin (por ejemplo, un codigo mal cargado).
// Un codigo entregado o anulado no vuelve nunca a disponible.
export type EstadoCodigoInventario = "disponible" | "reservado" | "entregado" | "anulado";

export const ESTADOS_CODIGO_INVENTARIO: readonly EstadoCodigoInventario[] = [
  "disponible",
  "reservado",
  "entregado",
  "anulado",
];

// Reglas de carga (POST /api/admin/inventario). El servidor las aplica; el
// cliente puede usarlas para avisar antes de enviar.
export const MAX_CODIGOS_POR_CARGA = 1000;
export const MAX_LARGO_CODIGO = 64;

// GET /api/admin/sesion -> { ok: true } si la clave es valida (login del panel).
export interface SesionAdmin {
  ok: true;
}

// Un pedido tal como lo ve el admin (ventas y busqueda).
export interface PedidoAdmin {
  id: string;
  numero: string;
  // pendiente | pagado | fallido | expirado | error (EstadoPedido); como texto
  // para tolerar un estado nuevo sin romper el panel.
  estado: string;
  // true si es un pedido de prueba (numero TVP-): no entro dinero real.
  modoPrueba: boolean;
  creadoEn: string; // ISO 8601
  pagadoEn: string | null;
  totalUsd: number;
  items: Array<{ productoId: string; nombre: string; cantidad: number; precioUsd: number }>;
  comprador: { nombre: string; email: string; telefono: string | null };
  // null mientras el pedido no esta pagado.
  pago: {
    metodo: string | null;
    banco: string | null;
    referenciaBancaria: string | null;
    montoVes: number | null;
  } | null;
  // estado: activa | canjeada | anulada | prueba (EstadoGiftCard).
  giftCards: Array<{ codigo: string; montoUsd: number; estado: string }>;
  // Gift Cards pagadas que se quedaron sin codigo (el pago llego sin stock):
  // hay que entregarlas a mano. 0 si no falta nada.
  faltanCodigos: number;
  correos: {
    compradorEnviadoEn: string | null;
    avisoVentaEnviadoEn: string | null;
    intentos: number;
  };
}

// GET /api/admin/ventas?estado=&buscar=&limite=&despues=
// Del mas nuevo al mas viejo. `buscar` es un numero de pedido o un email
// EXACTO. `limite` por defecto 50 (maximo 200). Para la pagina siguiente se
// manda `despues=<siguiente>`; `siguiente` es null cuando no hay mas.
export interface VentasAdmin {
  ok: true;
  pedidos: PedidoAdmin[];
  siguiente: string | null;
}

export interface ConteoInventario {
  disponible: number;
  reservado: number;
  entregado: number;
  anulado: number;
}

// GET /api/admin/resumen
// Las ventas cuentan pedidos PAGADOS por su fecha de pago en hora de Venezuela
// ("hoy" y "este mes"). Con la tienda en produccion solo cuentan los pedidos
// reales; con el servidor en modo prueba cuentan tambien los de prueba (para
// que el dueno vea su ensayo). `pendientes` son pedidos esperando pago y
// `sinCodigos` pedidos pagados a los que les falta algun codigo.
export interface ResumenAdmin {
  ok: true;
  ventas: {
    pagadosHoy: number;
    pagadosMes: number;
    totalUsdHoy: number;
    totalUsdMes: number;
    pendientes: number;
    sinCodigos: number;
  };
  // Por id de producto del catalogo (todos aparecen, aunque esten en 0).
  inventario: Record<string, ConteoInventario>;
}

export interface CodigoInventarioAdmin {
  id: string;
  productoId: string;
  codigo: string;
  estado: EstadoCodigoInventario;
  // Numero del pedido que lo tiene reservado o al que se entrego.
  pedidoNumero: string | null;
  creadoEn: string; // ISO 8601
  entregadoEn: string | null;
}

// GET /api/admin/inventario/codigos?productoId=&estado=&limite=&despues=
// Del mas nuevo al mas viejo, con la misma paginacion que /ventas.
export interface CodigosInventarioAdmin {
  ok: true;
  codigos: CodigoInventarioAdmin[];
  siguiente: string | null;
}

// POST /api/admin/inventario { productoId, codigos: string[] }
// Recorta espacios e ignora las lineas vacias. `invalidos`: mas de 64
// caracteres, con espacios internos o caracteres de control, o que empiezan
// con PRUEBA- (reservado para los codigos de prueba). `duplicados`: repetidos
// dentro del mismo lote o que ya existian (en el inventario o como Gift Card
// emitida). Maximo 1000 codigos por llamada.
export interface CargaInventarioRequest {
  productoId: string;
  codigos: string[];
}

export interface CargaInventarioResponse {
  ok: true;
  agregados: number;
  duplicados: number;
  invalidos: number;
}

// POST /api/admin/inventario/:id/anular -> solo si esta "disponible".
// 404 si no existe; 409 si ya esta reservado, entregado o anulado.
export interface AnularCodigoResponse {
  ok: true;
  codigo: CodigoInventarioAdmin;
}

// POST /api/admin/pedidos/:id/completar-codigos
// Para un pedido REAL (TV-) pagado al que le faltan codigos (el pago llego sin
// stock): toma del inventario los codigos "disponible" que falten de cada
// producto, se los entrega al pedido y reenvia al comprador el correo con
// todos sus codigos. Si aun no hay stock suficiente entrega los que haya y
// `faltanCodigos` dice cuantos siguen pendientes (se puede repetir despues de
// cargar mas codigos). 404 si el pedido no existe; 409 si no esta pagado, es
// de prueba (TVP-) o no le falta ningun codigo.
export interface CompletarCodigosResponse {
  ok: true;
  // Codigos entregados en esta llamada (0 si no habia stock de lo que falta).
  entregados: number;
  // Los que siguen faltando despues de esta llamada (0 = pedido completo).
  faltanCodigos: number;
  // true si salio el correo al comprador. Solo se intenta si se entrego algo.
  correoEnviado: boolean;
  // Resumen legible para mostrar tal cual (dice si aun faltan por falta de stock).
  mensaje: string;
  // El pedido ya actualizado, para refrescar la fila del panel.
  pedido: PedidoAdmin;
}

// POST /api/admin/pedidos/:id/expirar
// Cierra en SPIDI el enlace de pago de un pedido "pendiente" y libera sus
// codigos reservados. Si SPIDI no lo deja expirar porque ya estaba pagado, se
// consulta su estado y se aplica (el pedido queda pagado y se entregan sus
// codigos). 404 si no existe; 409 si no esta pendiente o no tiene enlace de
// pago; 502/503 si SPIDI no responde o no esta configurado.
export interface ExpirarPedidoResponse {
  ok: true;
  // "expirado": se cerro el enlace y sus reservas volvieron al inventario.
  // "pagado": ya estaba pagado en SPIDI; se aplico el pago en vez de expirar.
  // "fallido": SPIDI ya lo tenia como fallido; se aplico eso.
  resultado: "expirado" | "pagado" | "fallido";
  mensaje: string;
  pedido: PedidoAdmin;
}
