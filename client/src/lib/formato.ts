// Formatos de dinero, tasas y fechas para la tienda. Se usan solo para
// mostrar: los montos que valen son los que calcula el servidor.

const formatoDolares = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Separadores venezolanos: punto para miles y coma para decimales (1.234,56).
const formatoBolivares = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// La tasa BCV suele publicarse con mas de 2 decimales.
const formatoTasaBcv = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

// "$10.00"
export function formatoUsd(monto: number): string {
  return formatoDolares.format(monto);
}

// "Bs. 1.234,56"
export function formatoBs(monto: number): string {
  return `Bs. ${formatoBolivares.format(monto)}`;
}

// "Bs. 36,5123 por US$ 1"
export function formatoTasa(tasa: number): string {
  return `Bs. ${formatoTasaBcv.format(tasa)} por US$ 1`;
}

// Fecha y hora en horario de Venezuela, sin depender de la zona del navegador.
export function formatoFechaHora(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Caracas",
  });
}

// SPIDI reporta el metodo como "immediate_debit", "mobile_payment" o "crypto".
// Si llega otro valor se muestra tal cual en vez de esconderlo.
export function metodoPagoLegible(metodo: string | null): string | null {
  if (!metodo) return null;
  switch (metodo) {
    case "mobile_payment":
      return "Pago Móvil";
    case "immediate_debit":
      return "Débito Inmediato";
    case "crypto":
      return "Cripto";
    default:
      return metodo;
  }
}

// "1 Gift Card" / "3 Gift Cards"
export function textoUnidades(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}
