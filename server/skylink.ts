// Cliente de Skylink Pay (Pago Movil y debito inmediato con verificacion
// automatica), la segunda pasarela de la tienda junto a SPIDI. Portado del
// cliente que se probo con dinero real el 20-nov-2026 en la tienda de prueba
// aparte (giftcards-skylink-prueba). No sabe nada de pedidos ni de Express: eso
// vive en server/tienda.ts.
//
// API real (panel de Skylink Pay, "Desarrolladores API"):
//   Base:      https://dev-axis-payment.valinkgroup.com (SKYLINK_BASE_URL)
//   Cabeceras: X-Api-Key, X-Commerce-Code, X-Commerce-Id (= codigo), X-Timestamp
//              (ms) y X-Signature.
//   Firma:     hex(HMAC-SHA256(API Key, METHOD \n path \n timestamp \n body)),
//              con el body en JSON compacto y claves A-Z en todos los niveles;
//              en un GET (sin body) se firma el texto "null".
//   Crear:     POST /api/v1/merchant/transactions
//              {amount (centimos, entero), buyOrder, currency:"VES",
//               expirable:true, installments:1, sessionId} -> {token, url}
//   Consultar: GET  /api/v1/merchant/transactions/token/{token}
//   Tasa:      GET  /api/v1/merchant/rates/bcv (usar raw.tipocambio si rate="0")
//   Regreso:   el pagador vuelve a la URL de retorno FIJA del panel con
//              ?token_ws=<token>. Esa vuelta no prueba nada.
//   Aviso:     POST JSON (eventType "transaction.authorized") a la URL de
//              notificaciones del panel. Su x-signature es hex(HMAC-SHA256(API
//              Key, cuerpo con claves ordenadas)). Aun firmado, solo sirve para
//              saber que cobro reconsultar.
//
// Regla de oro: un pedido solo se da por pagado si la CONSULTA por token dice
// "authorized" y ademas coinciden el monto y el buyOrder (ver tienda.ts).
//
// Modos (SKYLINK_MODO, se lee en cada uso):
// - vacio: Skylink apagado. La tienda solo ofrece SPIDI. Asi un despliegue sin
//   las variables nunca abre un cobro a medias.
// - "simulador": pasarela falsa dentro de este mismo servidor
//   (/simulador-skylink/pay/<token>), en memoria. No mueve dinero. Los pedidos
//   salen de prueba (TVP-, codigos PRUEBA-).
// - "real": la API de verdad. Exige SKYLINK_CODIGO_COMERCIO y SKYLINK_API_KEY.
//   Con SKYLINK_MONTO_PRUEBA_VES (1 a 30 Bs) cada pedido cobra SOLO ese monto y
//   sale de prueba (TVP-, codigos PRUEBA-): es para probar con Bs. 20 como pide
//   Skylink. Sin esa variable los pagos son reales y se entregan codigos reales.
//
// Nunca se registran en logs la API Key, el codigo de comercio ni la firma.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export class SkylinkError extends Error {
  readonly status: number | null;

  constructor(mensaje: string, status: number | null = null) {
    super(mensaje);
    this.name = "SkylinkError";
    this.status = status;
  }
}

// Falta configuracion: la tienda responde "pagos no disponibles".
export class SkylinkNoConfigurado extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "SkylinkNoConfigurado";
  }
}

function env(nombre: string): string {
  return (process.env[nombre] ?? "").trim();
}

// === Modo y entorno ===

export type ModoSkylink = "apagado" | "simulador" | "real";

export function modoSkylink(): ModoSkylink {
  const modo = env("SKYLINK_MODO").toLowerCase();
  if (modo === "real") return "real";
  if (modo === "simulador") return "simulador";
  return "apagado";
}

function baseUrl(): string {
  return (env("SKYLINK_BASE_URL") || "https://dev-axis-payment.valinkgroup.com").replace(/\/+$/, "");
}

function credenciales(): { codigo: string; id: string; apiKey: string } {
  const codigo = env("SKYLINK_CODIGO_COMERCIO");
  return { codigo, id: env("SKYLINK_ID_COMERCIO") || codigo, apiKey: env("SKYLINK_API_KEY") };
}

// Monto fijo de prueba en centimos de Bs (SKYLINK_MONTO_PRUEBA_VES, en Bs, de
// 1 a 30). null si no esta. "invalido" si esta pero no sirve: entonces Skylink
// queda apagado (si alguien quiso probar con Bs. 20 y escribio mal el valor,
// no se debe cobrar el total real por error).
function montoPruebaCrudo(): number | null | "invalido" {
  const crudo = env("SKYLINK_MONTO_PRUEBA_VES");
  if (!crudo) return null;
  const bs = Number(crudo.replace(",", "."));
  if (!Number.isFinite(bs) || bs < 1 || bs > 30) return "invalido";
  return Math.round(bs * 100);
}

export function montoPruebaVesCentavos(): number | null {
  const m = montoPruebaCrudo();
  return typeof m === "number" ? m : null;
}

// Lo que falta para cobrar con Skylink en el modo actual (vacio = listo). Solo
// nombra variables, nunca sus valores.
export function problemasSkylink(): string[] {
  const modo = modoSkylink();
  if (modo === "apagado") return ["SKYLINK_MODO (real o simulador)"];
  const faltan: string[] = [];
  if (env("PUBLIC_BASE_URL") === "") faltan.push("PUBLIC_BASE_URL");
  if (montoPruebaCrudo() === "invalido") faltan.push("SKYLINK_MONTO_PRUEBA_VES valido (de 1 a 30 Bs) o vacio");
  if (modo === "real") {
    if (!/^https:\/\//.test(baseUrl())) faltan.push("SKYLINK_BASE_URL (https)");
    const c = credenciales();
    if (!c.codigo) faltan.push("SKYLINK_CODIGO_COMERCIO");
    if (!c.apiKey) faltan.push("SKYLINK_API_KEY");
  }
  return faltan;
}

export function skylinkConfigurado(): boolean {
  return problemasSkylink().length === 0;
}

// "produccion": API real sin monto de prueba (pagos reales, codigos reales).
// "prueba": API real con SKYLINK_MONTO_PRUEBA_VES (cobra Bs. 20 de verdad, pero
// el pedido sale TVP- con codigos PRUEBA-). "simulador": sin dinero.
export type EntornoSkylink = "apagado" | "simulador" | "prueba" | "produccion";

export function entornoSkylink(): EntornoSkylink {
  if (!skylinkConfigurado()) return "apagado";
  if (modoSkylink() === "simulador") return "simulador";
  return montoPruebaVesCentavos() !== null ? "prueba" : "produccion";
}

// true si lo que se cobre con Skylink ahora no vale como compra real: los
// pedidos nacen TVP- y sus Gift Cards salen PRUEBA-.
export function skylinkModoPrueba(): boolean {
  return entornoSkylink() !== "produccion";
}

// true si el checkout con Skylink debe cerrarse: sin configurar, o en el sitio
// publico (NODE_ENV=production) con un modo de prueba, salvo que se permita a
// proposito con SKYLINK_PERMITIR_PRUEBAS=1 (un staging).
export function skylinkBloqueado(): boolean {
  const entorno = entornoSkylink();
  if (entorno === "apagado") return true;
  return process.env.NODE_ENV === "production" && entorno !== "produccion" && env("SKYLINK_PERMITIR_PRUEBAS") !== "1";
}

// Minutos que se considera vivo un enlace de pago de Skylink (para reutilizarlo
// ante un doble envio y para cuanto viven las reservas). Skylink no publica
// cuanto dura un cobro "expirable": 15 por defecto, de 5 a 60.
export function duracionCobroMinutos(): number {
  const valor = Number.parseInt(env("SKYLINK_DURACION_MINUTOS"), 10);
  if (!Number.isFinite(valor)) return 15;
  return Math.min(60, Math.max(5, valor));
}

// Avisos de configuracion para el log del arranque (sin valores).
export function revisarEntornoSkylink(): Array<{ grave: boolean; mensaje: string }> {
  const modo = modoSkylink();
  if (modo === "apagado") return [{ grave: false, mensaje: "Skylink Pay apagado (SKYLINK_MODO vacio): solo se cobra con SPIDI" }];
  const problemas = problemasSkylink();
  if (problemas.length > 0) {
    return [{ grave: true, mensaje: `Skylink Pay (${modo}) sin configurar; falta: ${problemas.join(", ")}. El boton de Skylink no se muestra.` }];
  }
  const entorno = entornoSkylink();
  if (skylinkBloqueado()) {
    return [{ grave: false, mensaje: `Skylink Pay en ${entorno} con NODE_ENV=production: cerrado (SKYLINK_PERMITIR_PRUEBAS=1 lo abre en un staging)` }];
  }
  if (entorno === "simulador") return [{ grave: false, mensaje: "Skylink Pay en SIMULADOR: no mueve dinero; pedidos TVP- y codigos PRUEBA-" }];
  if (entorno === "prueba") {
    return [{ grave: false, mensaje: `Skylink Pay REAL con monto de prueba (Bs. ${(montoPruebaVesCentavos()! / 100).toFixed(2)} por pedido): pedidos TVP- y codigos PRUEBA-` }];
  }
  return [{ grave: false, mensaje: "Skylink Pay en produccion: los pagos son reales" }];
}

// === Estados ===

export type EstadoCobro = "pendiente" | "pagado" | "fallido" | "expirado";

const ESTADOS_PAGADO = ["authorized"];
const ESTADOS_FALLIDO = ["rejected", "failed", "nullified", "canceled", "cancelled"];
const ESTADOS_EXPIRADO = ["expired"];

// Un estado que no conocemos deja el pedido pendiente (lo seguro): el barrido
// lo vuelve a consultar.
export function traducirEstado(estadoSkylink: unknown): EstadoCobro {
  const e = String(estadoSkylink ?? "").trim().toLowerCase();
  if (ESTADOS_PAGADO.includes(e)) return "pagado";
  if (ESTADOS_FALLIDO.includes(e)) return "fallido";
  if (ESTADOS_EXPIRADO.includes(e)) return "expirado";
  return "pendiente";
}

// Un solo criterio para leer "amount" de Skylink: numero o texto entero =
// centimos; texto con decimales ("25.00" o "25,00") = bolivares. Si falta o no
// se entiende: NaN (y entonces el monto NO coincide).
export function centavosDe(amount: unknown): number {
  if (typeof amount === "number") return Number.isInteger(amount) ? amount : Math.round(amount * 100);
  const t = String(amount ?? "").trim();
  if (/^\d+$/.test(t)) return Number(t);
  if (/^\d+[.,]\d{1,2}$/.test(t)) return Math.round(Number(t.replace(",", ".")) * 100);
  return Number.NaN;
}

// === Firma y llamadas a la API real ===

// Claves ordenadas A-Z en todos los niveles (los arrays conservan su orden).
export function ordenarClaves(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(ordenarClaves);
  if (valor && typeof valor === "object") {
    const obj = valor as Record<string, unknown>;
    const ordenado: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      if (obj[k] !== undefined) ordenado[k] = ordenarClaves(obj[k]);
    }
    return ordenado;
  }
  return valor;
}

export function firmarPeticion(apiKey: string, metodo: string, ruta: string, timestamp: string, cuerpo: string | undefined): string {
  return createHmac("sha256", apiKey)
    .update([metodo, ruta, timestamp, cuerpo ?? "null"].join("\n"))
    .digest("hex");
}

const TIEMPO_ESPERA_MS = 15_000;

type Objeto = Record<string, unknown>;

function obj(valor: unknown): Objeto {
  return valor && typeof valor === "object" && !Array.isArray(valor) ? (valor as Objeto) : {};
}

function texto(valor: unknown): string | null {
  if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
}

async function llamarReal(metodo: "GET" | "POST", ruta: string, cuerpo?: unknown): Promise<Objeto> {
  const { codigo, id, apiKey } = credenciales();
  if (!codigo || !apiKey) throw new SkylinkNoConfigurado("Faltan SKYLINK_CODIGO_COMERCIO o SKYLINK_API_KEY");
  const textoCuerpo = cuerpo === undefined ? undefined : JSON.stringify(ordenarClaves(cuerpo));
  const timestamp = Date.now().toString();
  let resp: Response;
  try {
    resp = await fetch(baseUrl() + ruta, {
      method: metodo,
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "x-api-key": apiKey,
        "x-commerce-code": codigo,
        "x-commerce-id": id,
        "x-timestamp": timestamp,
        "x-signature": firmarPeticion(apiKey, metodo, ruta, timestamp, textoCuerpo),
      },
      body: textoCuerpo,
      signal: AbortSignal.timeout(TIEMPO_ESPERA_MS),
    });
  } catch (error) {
    throw new SkylinkError(`No se pudo conectar con Skylink: ${error instanceof Error ? error.message : String(error)}`);
  }
  let json: unknown = null;
  try {
    json = await resp.json();
  } catch {
    json = null;
  }
  const r = obj(json);
  if (!resp.ok || json === null || r.success === false) {
    // Solo el mensaje que da Skylink (nunca las cabeceras enviadas).
    const detalle = texto(r.message) ?? texto(r.error) ?? `HTTP ${resp.status}`;
    throw new SkylinkError(`Skylink respondio con error: ${detalle}`, resp.status);
  }
  return r.data !== undefined ? obj(r.data) : r;
}

// === Simulador (en memoria; se pierde al reiniciar) ===

interface CobroSimulado {
  token: string;
  buyOrder: string;
  sessionId: string;
  amount: number; // centimos
  status: string;
  venceEn: number;
  aprobarEn: number | null;
  pago: { metodo?: string; banco?: string; referencia?: string };
}

const cobrosSimulados = new Map<string, CobroSimulado>();

export function simuladorActivo(): boolean {
  return modoSkylink() === "simulador";
}

export function cobroSimulado(token: string): CobroSimulado | null {
  const c = cobrosSimulados.get(token);
  if (!c) return null;
  if (c.status === "created" && c.aprobarEn !== null && Date.now() >= c.aprobarEn) c.status = "authorized";
  if (c.status === "created" && Date.now() > c.venceEn) c.status = "expired";
  return c;
}

export type DecisionSimulador = "aprobar" | "aprobar-tarde" | "rechazar" | "volver";

export function resolverCobroSimulado(
  token: string,
  decision: string,
  pago: CobroSimulado["pago"],
): { ok: boolean; error?: string } {
  const c = cobroSimulado(token);
  if (!c) return { ok: false, error: "Cobro inexistente" };
  if (c.status !== "created" || c.aprobarEn !== null) return { ok: true };
  if (decision === "aprobar") c.status = "authorized";
  else if (decision === "aprobar-tarde") c.aprobarEn = Date.now() + 10_000;
  else if (decision === "rechazar") c.status = "rejected";
  else if (decision !== "volver") return { ok: false, error: "Decision invalida" };
  if (decision !== "volver") c.pago = pago;
  return { ok: true };
}

function crearCobroSimulado(p: { buyOrder: string; sessionId: string; montoVesCentavos: number }, urlBase: string) {
  const token = randomBytes(24).toString("hex");
  cobrosSimulados.set(token, {
    token,
    buyOrder: p.buyOrder,
    sessionId: p.sessionId,
    amount: p.montoVesCentavos,
    status: "created",
    venceEn: Date.now() + duracionCobroMinutos() * 60_000,
    aprobarEn: null,
    pago: {},
  });
  // Poda: el simulador nunca guarda mas de 500 cobros.
  if (cobrosSimulados.size > 500) {
    const primero = cobrosSimulados.keys().next().value;
    if (primero !== undefined) cobrosSimulados.delete(primero);
  }
  return { token, url: `${urlBase}/simulador-skylink/pay/${token}`, amount: p.montoVesCentavos, status: "created" };
}

// === API comun ===

export interface CobroCreado {
  token: string;
  paymentUrl: string;
  // NaN si Skylink no devolvio el monto.
  montoCentavos: number;
}

// Crea el cobro. `urlBase` es PUBLIC_BASE_URL (el simulador arma ahi su pagina).
export async function crearCobro(p: {
  buyOrder: string;
  sessionId: string;
  montoVesCentavos: number;
  urlBase: string;
}): Promise<CobroCreado> {
  if (!Number.isInteger(p.montoVesCentavos) || p.montoVesCentavos <= 0) {
    throw new SkylinkError(`Monto invalido para Skylink: ${p.montoVesCentavos}`);
  }
  const modo = modoSkylink();
  let data: Objeto;
  if (modo === "real") {
    data = await llamarReal("POST", "/api/v1/merchant/transactions", {
      amount: p.montoVesCentavos,
      buyOrder: p.buyOrder,
      currency: "VES",
      expirable: true,
      installments: 1,
      sessionId: p.sessionId,
    });
  } else if (modo === "simulador") {
    data = crearCobroSimulado(p, p.urlBase.replace(/\/+$/, ""));
  } else {
    throw new SkylinkNoConfigurado("Skylink apagado (SKYLINK_MODO vacio)");
  }
  const token = texto(data.token);
  const url = texto(data.url);
  if (!token || !url || !/^https?:\/\//.test(url)) throw new SkylinkError("Skylink no devolvio token y url de pago");
  return { token, paymentUrl: url, montoCentavos: centavosDe(data.amount) };
}

export interface ConsultaCobro {
  estado: EstadoCobro;
  estadoSkylink: string;
  montoCentavos: number; // NaN si no vino
  buyOrder: string | null;
  // Solo lo que se muestra en el comprobante (nada de cedula ni telefono).
  pago: { metodo: string | null; banco: string | null; referencia: string | null };
}

function metodoLegible(valor: unknown): string | null {
  const m = texto(valor);
  if (!m) return null;
  const minus = m.toLowerCase();
  // Mismos valores que usa SPIDI, para que la pagina y el admin los rotulen.
  if (minus.includes("pago_movil") || minus.includes("mobile")) return "mobile_payment";
  if (minus.includes("debit") || minus.includes("debito")) return "immediate_debit";
  return m;
}

// Consulta el estado del cobro (fuente de verdad).
export async function consultarCobro(token: string): Promise<ConsultaCobro> {
  const modo = modoSkylink();
  if (modo === "real") {
    const d = await llamarReal("GET", `/api/v1/merchant/transactions/token/${encodeURIComponent(token)}`);
    return {
      estado: traducirEstado(d.status),
      estadoSkylink: String(d.status ?? ""),
      montoCentavos: centavosDe(d.amount),
      buyOrder: texto(d.buyOrder),
      pago: {
        metodo: metodoLegible(d.paymentMethod),
        banco: texto(d.bankName) ?? texto(d.bankCode),
        referencia: texto(d.bankReference),
      },
    };
  }
  if (modo === "simulador") {
    const c = cobroSimulado(token);
    if (!c) throw new SkylinkError("Cobro inexistente en el simulador (se reinicio el servidor?)", 404);
    return {
      estado: traducirEstado(c.status),
      estadoSkylink: c.status,
      montoCentavos: c.amount,
      buyOrder: c.buyOrder,
      pago: {
        metodo: c.pago.metodo ?? null,
        banco: c.pago.banco ?? null,
        referencia: c.pago.referencia ?? null,
      },
    };
  }
  throw new SkylinkNoConfigurado("Skylink apagado (SKYLINK_MODO vacio)");
}

// === Tasa BCV ===

let tasaEnCache: { tasa: number; hasta: number } | null = null;
let tasaEnCurso: Promise<number | null> | null = null;
const VIDA_TASA_MS = 10 * 60_000;

// Bs por US$ 1. Real: la tasa oficial que publica Skylink (10 min en memoria).
// Simulador: SKYLINK_TASA_PRUEBA o 250 ficticia. null si no hay tasa: entonces
// no se cobra (no se puede adivinar el monto en Bs).
export async function tasaBcv(): Promise<number | null> {
  if (modoSkylink() !== "real") {
    const t = Number(env("SKYLINK_TASA_PRUEBA").replace(",", "."));
    return Number.isFinite(t) && t > 0 ? t : 250;
  }
  if (tasaEnCache && Date.now() < tasaEnCache.hasta) return tasaEnCache.tasa;
  if (!tasaEnCurso) {
    tasaEnCurso = (async () => {
      try {
        const d = await llamarReal("GET", "/api/v1/merchant/rates/bcv");
        const directa = Number(d.rate);
        const t = directa > 0 ? directa : Number(obj(d.raw).tipocambio);
        if (Number.isFinite(t) && t > 0) {
          tasaEnCache = { tasa: t, hasta: Date.now() + VIDA_TASA_MS };
          return t;
        }
        console.error("[skylink] La tasa BCV de Skylink vino sin un valor usable");
        return null;
      } catch (error) {
        console.error("[skylink] No se pudo leer la tasa BCV:", error instanceof Error ? error.message : String(error));
        return null;
      } finally {
        tasaEnCurso = null;
      }
    })();
  }
  return tasaEnCurso;
}

// === Aviso (webhook) ===

function igualesHex(esperada: string, recibida: string): boolean {
  const a = Buffer.from(esperada, "utf8");
  const b = Buffer.from(recibida.trim().toLowerCase(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

// x-signature = hex(HMAC-SHA256(API Key, JSON con claves ordenadas)). Se acepta
// tambien la firma sobre los bytes crudos (por si Skylink ya los manda
// ordenados y con otro espaciado). En simulador no hay avisos: siempre false.
export function verificarFirmaAviso(rawBody: Buffer, firma: string | undefined): boolean {
  if (modoSkylink() !== "real") return false;
  const { apiKey } = credenciales();
  if (!apiKey) throw new SkylinkNoConfigurado("Falta SKYLINK_API_KEY");
  if (!firma || !Buffer.isBuffer(rawBody) || rawBody.length === 0) return false;
  const hmac = (datos: string | Buffer) => createHmac("sha256", apiKey).update(datos).digest("hex");
  if (igualesHex(hmac(rawBody), firma)) return true;
  try {
    const canonico = JSON.stringify(ordenarClaves(JSON.parse(rawBody.toString("utf8"))));
    return igualesHex(hmac(canonico), firma);
  } catch {
    return false;
  }
}

// Todos los textos de un JSON (hasta 5 niveles y 200 valores), para hallar el
// token o el numero de pedido sin depender de como se llame el campo.
export function textosDelAviso(valor: unknown, nivel = 0, salida: string[] = []): string[] {
  if (salida.length >= 200 || nivel > 5) return salida;
  if (typeof valor === "string" || typeof valor === "number") {
    const t = String(valor).trim();
    if (t.length >= 6 && t.length <= 200) salida.push(t);
  } else if (valor && typeof valor === "object") {
    for (const v of Object.values(valor as Objeto)) textosDelAviso(v, nivel + 1, salida);
  }
  return salida;
}

// === Pagina del simulador (imita el checkout de Skylink) ===

const BANCOS_SIMULADOR = ["Banesco", "Mercantil", "Banco de Venezuela", "BBVA Provincial", "Bancamiga", "BNC"];

function escapar(valor: unknown): string {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function paginaSimulador(token: string, urlRegreso: string): string | null {
  const c = cobroSimulado(token);
  if (!c) return null;
  const bs = (c.amount / 100).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cerrado = c.status !== "created" || c.aprobarEn !== null;
  const estado = c.aprobarEn !== null && c.status === "created" ? "aprobándose…" : c.status;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Simulador de Skylink Pay</title><meta name="robots" content="noindex">
<style>
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#eef1f6;color:#1d2433}
.franja{background:#fde68a;color:#78350f;text-align:center;padding:10px 16px;font-size:14px;font-weight:600}
main{max-width:460px;margin:24px auto;padding:0 16px}
.caja{background:#fff;border:1px solid #dfe3ea;border-radius:16px;padding:22px}
.monto{font-size:34px;font-weight:800;margin:4px 0}.muted{color:#5b6475;font-size:14px}
label{display:block;font-size:14px;font-weight:600;margin:12px 0 4px}
input,select{width:100%;height:44px;border:1px solid #c9cfd9;border-radius:10px;padding:0 12px;font:inherit}
button{width:100%;min-height:48px;border:0;border-radius:12px;font:600 16px system-ui;cursor:pointer;margin-top:10px}
.ok{background:#15803d;color:#fff}.tarde{background:#e0e7ff;color:#1e3a8a}.no{background:#fee2e2;color:#b91c1c}.vol{background:transparent;color:#5b6475;text-decoration:underline}
</style></head><body>
<div class="franja">SIMULADOR LOCAL — esto NO es Skylink Pay y no mueve dinero</div>
<main><div class="caja">
<div class="muted">Todo Vending CA · Pedido ${escapar(c.buyOrder)}</div>
<div class="monto">Bs. ${escapar(bs)}</div>
<div class="muted">Pago Móvil · estado: <strong>${escapar(estado)}</strong></div>
${
  cerrado
    ? `<p class="muted">Este cobro ya no acepta acciones.</p><a href="${escapar(urlRegreso)}">Volver a la tienda</a>`
    : `<form method="post">
<label for="banco">Banco desde el que pagas</label>
<select id="banco" name="banco">${BANCOS_SIMULADOR.map((b) => `<option>${escapar(b)}</option>`).join("")}</select>
<label for="referencia">Referencia (inventada)</label><input id="referencia" name="referencia" inputmode="numeric" value="${String(Date.now()).slice(-8)}">
<button class="ok" name="decision" value="aprobar">Simular pago aprobado</button>
<button class="tarde" name="decision" value="aprobar-tarde">Aprobar en 10 s (probar la espera)</button>
<button class="no" name="decision" value="rechazar">Simular pago rechazado</button>
<button class="vol" name="decision" value="volver">Volver a la tienda sin pagar</button>
</form>`
}
</div></main></body></html>`;
}
