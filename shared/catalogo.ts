// Catalogo de la tienda. Es la UNICA fuente de precios: el cliente lo usa para
// mostrar, pero el servidor recalcula el total con estos mismos datos y nunca
// confia en un precio que venga del navegador.
//
// Los precios se fijan en dolares (USD = dolar BCV para SPIDI). SPIDI convierte
// a bolivares con la tasa oficial del BCV vigente en el momento de crear la
// sesion de pago, y la pagina de pago le muestra al cliente el monto en Bs.

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioUsd: number;
  // Tope de unidades de este producto en un mismo pedido.
  maxPorPedido: number;
  // Si es true, al pagarse se emite un codigo de Gift Card por unidad.
  esGiftCard: boolean;
}

// Los codigos que se entregan NO se inventan: el dueno los carga en el
// inventario (tabla codigos_inventario, panel /admin) y la tienda entrega esos,
// uno por unidad. Si un producto no tiene codigos disponibles, la pagina dice
// "Sin stock" y el checkout lo rechaza.
export const PRODUCTOS: readonly Producto[] = [
  {
    id: "gift-card-10",
    nombre: "Gift Card Todo Vending $10",
    descripcion:
      "Tarjeta de regalo por $10 para consumir en las máquinas de Todo Vending CA y Café Oriente. Se paga en bolívares a tasa BCV del día.",
    precioUsd: 10,
    maxPorPedido: 10,
    esGiftCard: true,
  },
  {
    id: "gift-card-25",
    nombre: "Gift Card Todo Vending $25",
    descripcion:
      "Tarjeta de regalo por $25 para consumir en las máquinas de Todo Vending CA y Café Oriente. Se paga en bolívares a tasa BCV del día.",
    precioUsd: 25,
    maxPorPedido: 10,
    esGiftCard: true,
  },
  {
    id: "gift-card-50",
    nombre: "Gift Card Todo Vending $50",
    descripcion:
      "Tarjeta de regalo por $50 para consumir en las máquinas de Todo Vending CA y Café Oriente. Se paga en bolívares a tasa BCV del día.",
    precioUsd: 50,
    maxPorPedido: 10,
    esGiftCard: true,
  },
] as const;

// Tope de unidades sumando todos los productos de un pedido.
export const MAX_UNIDADES_POR_PEDIDO = 10;

export function buscarProducto(id: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.id === id);
}

// Redondeo a 2 decimales para montos en USD (SPIDI pide amount_reference con
// 2 decimales).
export function redondearUsd(monto: number): number {
  return Math.round(monto * 100) / 100;
}
