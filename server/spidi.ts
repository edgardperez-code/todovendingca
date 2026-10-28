// Cliente de la API Productos de SPIDI. Vive SOLO en el servidor: el token y la
// creacion de sesiones nunca pasan por el navegador, que solo recibe payment_url.
//
// Todo se configura por variables de entorno (spidi.env en local, Variables del
// servicio en Railway). El mismo codigo corre contra el simulador, el sandbox y
// produccion: lo unico que cambia es SPIDI_BASE_URL y las credenciales. Si los
// pagos son reales lo deciden SPIDI_ENTORNO y el host de SPIDI_BASE_URL juntos,
// fallando cerrado: modo prueba con un host de prueba conocido, y checkout
// cerrado si no se reconoce el entorno (ver entornoSpidi). Todas las variables
// estan documentadas en spidi.env.example.
//
// Fuente: base documental de SPIDI (docs.mispidi.com/agente, indice f080fb85ad0c719e)
// y su contrato OpenAPI (api-products.yaml). Nada de aqui se invento: si un campo
// no esta en esa documentacion, no se usa.
//
// Nunca se registran en logs tokens, claves ni el webhook secret.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { DatosPagoSpidi, DatosAcreditacionSpidi } from "./storage";
import { redondearUsd } from "../shared/catalogo";
import type { EntornoSpidi } from "../shared/tienda";

// === Errores ===

// Error de una llamada a SPIDI. `status` es el HTTP que respondio SPIDI (0 si
// no hubo respuesta: red caida o tiempo agotado) y `code` el codigo estable del
// sobre de error de SPIDI ({success:false, message, code}), si lo trajo.
export class SpidiError extends Error {
  status: number;
  code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "SpidiError";
    this.status = status;
    this.code = code;
  }
}

// Falta configuracion para operar (por ejemplo, SPIDI_WEBHOOK_SECRET). Es un
// error del despliegue, no del cliente ni de SPIDI.
export class SpidiNoConfigurado extends Error {
  constructor(message = "SPIDI no esta configurado") {
    super(message);
    this.name = "SpidiNoConfigurado";
  }
}

// === Presupuesto de llamadas a SPIDI ===
// SPIDI admite 100 peticiones por minuto por COMERCIO, sumando todo: crear
// sesiones, consultar estados, login y refresh. Si se pasa, responde 429 a todo,
// incluido cobrar. Por eso todas las llamadas comparten una cuenta en una
// ventana deslizante de 60 s:
// - las consultas de estado solo salen mientras el total de la ventana este por
//   debajo de 60, asi que nunca se comen el cupo de cobrar;
// - crear sesiones (cobrar) puede llegar hasta 90;
// - lo que queda hasta 100 es margen para login, refresh y reintentos por 401.
// Ademas, las consultas que nacen de la pagina publica de resultado (las pide
// el navegador del comprador) tienen su propio sub-tope de 25 por ventana,
// contado aparte y siempre dentro del de 60. Asi una sola persona con varias
// pestanas o varios pedidos no puede gastar todo el cupo de consultas y dejar
// sin consultar al barrido de conciliacion ni al aviso de acreditacion, que son
// la via principal para confirmar pagos.
// Si aun asi SPIDI responde 429, se pausan TODAS las llamadas el tiempo que pida
// (Retry-After): seguir llamando contra una puerta cerrada solo alarga el cierre.
// La cuenta vive en memoria: con una sola instancia del servidor basta.

export type TipoLlamada = "consulta" | "consulta_publica" | "cobro";

const VENTANA_LLAMADAS_MS = 60_000;
const TOPE_POR_TIPO: Record<TipoLlamada, number> = { consulta: 60, consulta_publica: 60, cobro: 90 };
// Sub-tope de las consultas de la pagina publica (ver arriba).
const TOPE_CONSULTAS_PUBLICAS = 25;
// Si SPIDI no manda Retry-After (o no se entiende), 30 s. Y como mucho 5 min,
// para que un valor absurdo no deje la tienda sin cobrar durante horas.
const PAUSA_POR_DEFECTO_MS = 30_000;
const PAUSA_MAXIMA_MS = 5 * 60_000;

// Codigo del SpidiError que se lanza SIN llamar a SPIDI: cupo local agotado o
// pausa por un 429. Su status es 429, igual que el 429 real de SPIDI.
export const CODIGO_LIMITE_LOCAL = "LIMITE_LOCAL";

// Momento (ms) de cada peticion de la ultima ventana, de la mas vieja a la mas nueva.
const llamadasRecientes: number[] = [];
// Lo mismo, solo para las consultas de la pagina publica (tambien estan en
// llamadasRecientes: este arreglo solo sirve para su sub-tope).
const consultasPublicasRecientes: number[] = [];
let pausaHasta = 0;

function podarVentana(tiempos: number[], ahora: number): void {
  while (tiempos.length > 0 && ahora - tiempos[0] >= VENTANA_LLAMADAS_MS) {
    tiempos.shift();
  }
}

function podarLlamadas(ahora: number): void {
  podarVentana(llamadasRecientes, ahora);
  podarVentana(consultasPublicasRecientes, ahora);
}

// Cuenta una peticion extra (login, refresh, reintento tras 401) que sale
// dentro de una llamada que ya tomo su cupo.
function anotarLlamada(): void {
  const ahora = Date.now();
  podarLlamadas(ahora);
  llamadasRecientes.push(ahora);
}

// Cuantas llamadas de ese tipo pueden salir ahora mismo (0 durante una pausa).
// Para "consulta_publica" es lo que quede del tope general o de su sub-tope,
// lo que sea menor.
export function cupoDisponible(tipo: TipoLlamada): number {
  const ahora = Date.now();
  if (ahora < pausaHasta) return 0;
  podarLlamadas(ahora);
  const general = Math.max(0, TOPE_POR_TIPO[tipo] - llamadasRecientes.length);
  if (tipo !== "consulta_publica") return general;
  return Math.min(general, Math.max(0, TOPE_CONSULTAS_PUBLICAS - consultasPublicasRecientes.length));
}

// Revisa y anota en el mismo paso, sin ningun await en medio: dos llamadas
// simultaneas no pueden tomar el mismo ultimo cupo.
function tomarCupo(tipo: TipoLlamada): void {
  if (Date.now() < pausaHasta) {
    throw new SpidiError("Llamadas a SPIDI en pausa: SPIDI pidio esperar (429)", 429, CODIGO_LIMITE_LOCAL);
  }
  if (cupoDisponible(tipo) <= 0) {
    throw new SpidiError(`Cupo local de llamadas a SPIDI agotado (${tipo})`, 429, CODIGO_LIMITE_LOCAL);
  }
  const ahora = Date.now();
  llamadasRecientes.push(ahora);
  if (tipo === "consulta_publica") consultasPublicasRecientes.push(ahora);
}

// true si el error es por limite de peticiones: el cupo local, la pausa o un
// 429 de SPIDI. Quien llama debe usar lo que ya tiene guardado y no reintentar ya.
export function esLimiteDeLlamadas(error: unknown): boolean {
  return error instanceof SpidiError && error.status === 429;
}

// Retry-After trae segundos (asi lo declara el contrato); por si acaso tambien
// se acepta una fecha HTTP. Devuelve milisegundos de pausa.
function leerRetryAfter(valor: string | null): number {
  const crudo = (valor ?? "").trim();
  let ms = Number.NaN;
  if (/^\d+(\.\d+)?$/.test(crudo)) {
    ms = Number(crudo) * 1000;
  } else if (crudo !== "") {
    const fechaHttp = Date.parse(crudo);
    if (!Number.isNaN(fechaHttp)) ms = fechaHttp - Date.now();
  }
  if (!Number.isFinite(ms) || ms <= 0) return PAUSA_POR_DEFECTO_MS;
  return Math.min(PAUSA_MAXIMA_MS, Math.max(1_000, ms));
}

function pausarLlamadas(ms: number): void {
  const hasta = Date.now() + ms;
  if (hasta <= pausaHasta) return;
  pausaHasta = hasta;
  console.warn(`[spidi] SPIDI respondio 429: se pausan todas las llamadas durante ${Math.round(ms / 1000)} s`);
}

// === Configuracion (se lee en cada uso, nunca al cargar el modulo) ===

function env(nombre: string): string {
  return (process.env[nombre] ?? "").trim();
}

function baseUrl(): string {
  return env("SPIDI_BASE_URL").replace(/\/+$/, "");
}

function tieneCredenciales(): boolean {
  return env("SPIDI_API_TOKEN") !== "" || (env("SPIDI_SHORT_NAME") !== "" && env("SPIDI_PASSWORD") !== "");
}

// true si hay todo lo necesario para cobrar: a donde llamar, con que
// autenticarse, por que acuerdo liquidar, como verificar los avisos y a donde
// devolver al cliente.
export function spidiConfigurado(): boolean {
  return (
    baseUrl() !== "" &&
    tieneCredenciales() &&
    env("SPIDI_AGREEMENT_ID") !== "" &&
    env("SPIDI_WEBHOOK_SECRET") !== "" &&
    env("PUBLIC_BASE_URL") !== ""
  );
}

// URL absoluta de la app para success_url, failure_url y webhook_url. Es lo
// unico que cambia al mudar la app de servidor.
export function urlPublica(ruta: string): string {
  const base = env("PUBLIC_BASE_URL").replace(/\/+$/, "");
  return base + (ruta.startsWith("/") ? ruta : `/${ruta}`);
}

// Minutos que vive el enlace de pago. El Boton admite de 5 a 20 (es el techo de
// SPIDI y no hay forma de pedir mas); si no se envia, caduca pronto.
export function duracionSesionMinutos(): number {
  const valor = Number.parseInt(env("SPIDI_DURACION_MINUTOS"), 10);
  if (!Number.isFinite(valor)) return 15;
  return acotarDuracion(valor);
}

function acotarDuracion(minutos: number): number {
  if (!Number.isFinite(minutos)) return 15;
  return Math.min(20, Math.max(5, Math.round(minutos)));
}

// === Entorno y modo de prueba ===
// En el simulador cualquiera "paga" con la clave magica 000000 y en el sandbox
// los pagos son de prueba. Si esas credenciales llegaran al sitio publico, se
// emitirian Gift Cards canjeables por pagos que nunca ocurrieron.
//
// Por eso se FALLA CERRADO, con tres casos:
// - PRODUCCION (pagos reales): SPIDI_ENTORNO vale exactamente "produccion"
//   (alguien lo declaro a proposito) Y SPIDI_BASE_URL es https con un host que
//   no es de prueba conocido.
// - PRUEBA CONOCIDA ("simulador", "sandbox" o "prueba"): el host de
//   SPIDI_BASE_URL es de prueba conocido (ver esHostDePrueba), diga lo que diga
//   SPIDI_ENTORNO. Los pagos no son reales: pedidos TVP- y Gift Cards PRUEBA-.
//   Si la variable dice produccion, manda el host y se avisa al arrancar.
// - DESCONOCIDO: todo lo demas. Por ejemplo, la URL real de produccion con
//   SPIDI_ENTORNO vacia o mal escrita ("producción", "production"), o con
//   http://. Ahi los pagos PODRIAN ser reales: tratarlo como prueba cobraria
//   dinero de verdad y entregaria codigos de prueba con correos que dicen que
//   no entro dinero. Por eso el checkout se cierra SIEMPRE (ver
//   pruebasBloqueadas), sin importar NODE_ENV ni SPIDI_PERMITIR_PRUEBAS, y el
//   arranque lo registra como error de configuracion (ver revisarEntornoSpidi).
// No basta con el host para dar produccion: un host que no conocemos no se
// puede dar por produccion solo porque no lo reconocemos. Y no basta con la
// variable: si dice produccion pero el host es de prueba, manda el host.

const HOST_SIMULADOR = "sim.mispidi.com";
const HOST_SANDBOX = "sandbox.api.spidipagos.com";
const DOMINIO_ABIERTOLAB = "abiertolab.com";
const VALOR_ENTORNO_PRODUCCION = "produccion";

// Dominios reservados que nunca son un servicio real en internet.
const SUFIJOS_DE_PRUEBA = [".localhost", ".local", ".internal", ".test", ".example", ".invalid"];
// Palabras que delatan un entorno de prueba cuando aparecen como palabra
// suelta dentro de una etiqueta del host, separada por "." o "-" ("sim",
// "api-sim", "sim-productos", "api-pruebas", "uat.api"). Palabra suelta y no
// fragmento: "simple" o "stages" no son "sim" ni "stage".
const PALABRAS_DE_PRUEBA = new Set([
  "sim",
  "simulador",
  "test",
  "testing",
  "prueba",
  "pruebas",
  "staging",
  "stage",
  "stg",
  "preprod",
  "uat",
  "certificacion",
  "dev",
  "desarrollo",
  "qa",
  "demo",
  "local",
]);
// Y estas en cualquier parte del host ("mispidi-sandbox", "mockserver").
const FRAGMENTOS_DE_PRUEBA = ["sandbox", "mock"];

interface UrlSpidi {
  host: string;
  https: boolean;
}

// Host de SPIDI_BASE_URL en minusculas (y si es https), o null si no hay o no
// se entiende. Si viene sin esquema ("sim.mispidi.com") se prueba con https://:
// ante la duda, mejor reconocer el simulador que no entender la URL.
function urlSpidi(): UrlSpidi | null {
  const crudo = baseUrl();
  if (!crudo) return null;
  for (const candidato of [crudo, `https://${crudo}`]) {
    try {
      const url = new URL(candidato);
      if (url.protocol === "https:" || url.protocol === "http:") {
        // URL ya pasa el host a minusculas. Se quita el punto final opcional
        // de un nombre DNS ("sim.mispidi.com.") y los corchetes de una IPv6
        // ("[::1]" -> "::1").
        const host = url.hostname.replace(/\.$/, "").replace(/^\[(.*)\]$/, "$1");
        if (host === "") return null;
        return { host, https: url.protocol === "https:" };
      }
    } catch {
      // No es una URL: se prueba la siguiente forma.
    }
  }
  return null;
}

// true si el host es una IP escrita tal cual (IPv4 o IPv6). La API de SPIDI se
// llama por su nombre (con su certificado): una IP suelta es un mock, una
// maquina propia o una red privada (127.x, 10.x, 192.168.x, 172.16-31.x,
// 0.0.0.0, ::1...). Por eso cualquier IP cuenta como prueba, no solo las privadas.
function esIpLiteral(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

// true si el host es de prueba conocido: el simulador o el sandbox de SPIDI,
// cualquier dominio de abiertolab.com (donde vive el simulador alterno),
// localhost, una IP, un dominio reservado (.test, .local...), un host que lleve
// "sandbox" o "mock" en cualquier parte del nombre, o uno con alguna de estas
// palabras sueltas en una etiqueta (separadas por ".", "-" o "_", con o sin
// un numero al final: "qa1", "uat2"): sim, simulador,
// test, testing, prueba, pruebas, staging, stage, stg, preprod, uat,
// certificacion, dev, desarrollo, qa, demo, local.
function esHostDePrueba(host: string): boolean {
  if (host === HOST_SIMULADOR || host === HOST_SANDBOX) return true;
  if (host === DOMINIO_ABIERTOLAB || host.endsWith(`.${DOMINIO_ABIERTOLAB}`)) return true;
  if (host === "localhost" || SUFIJOS_DE_PRUEBA.some((sufijo) => host.endsWith(sufijo))) return true;
  if (esIpLiteral(host)) return true;
  if (FRAGMENTOS_DE_PRUEBA.some((fragmento) => host.includes(fragmento))) return true;
  // Se le quitan los digitos del final a cada palabra: "qa1", "uat2", "dev2" o
  // "test01" son tan de prueba como "qa" o "dev" ("simple" sigue sin ser "sim").
  return host
    .split(".")
    .some((etiqueta) =>
      etiqueta.split(/[-_]/).some((palabra) => PALABRAS_DE_PRUEBA.has(palabra.replace(/\d+$/, ""))),
    );
}

// Entornos de prueba conocidos (los que tienen nombre propio en EntornoSpidi).
type EntornoDePrueba = Extract<EntornoSpidi, "simulador" | "sandbox" | "prueba">;

// Si el host es de prueba conocido, el nombre de ese entorno para mostrar y
// registrar: el simulador (por su host oficial o un dominio alterno de
// abiertolab.com que empiece con "sim"), el sandbox oficial, o "prueba" para
// los demas hosts de prueba (mocks, localhost, una IP...). Si no hay URL, no se
// entiende o el host no es de prueba conocido, null.
function entornoDePruebaConocido(url: UrlSpidi | null): EntornoDePrueba | null {
  if (!url || !esHostDePrueba(url.host)) return null;
  const { host } = url;
  if (host === HOST_SIMULADOR) return "simulador";
  if (host.endsWith(`.${DOMINIO_ABIERTOLAB}`) && /^sim(-|\.)/.test(host)) return "simulador";
  if (host === HOST_SANDBOX) return "sandbox";
  return "prueba";
}

// true si SPIDI_ENTORNO vale exactamente "produccion".
function produccionDeclarada(): boolean {
  return env("SPIDI_ENTORNO") === VALOR_ENTORNO_PRODUCCION;
}

// Primero el host: si es de prueba conocido, manda el ("simulador", "sandbox"
// o "prueba"), diga lo que diga SPIDI_ENTORNO. Si no, "produccion" solo con
// SPIDI_ENTORNO=produccion y una URL https (SPIDI produccion siempre lo es).
// Cualquier otra cosa es "desconocido" (ver arriba): checkout cerrado siempre.
export function entornoSpidi(): EntornoSpidi {
  const url = urlSpidi();
  const deprueba = entornoDePruebaConocido(url);
  if (deprueba) return deprueba;
  if (produccionDeclarada() && url && url.https) return "produccion";
  return "desconocido";
}

// true si los pagos no son reales o no se sabe si lo son (todo lo que no sea
// produccion confirmada, incluido "desconocido", donde ademas el checkout esta
// cerrado). Entonces los pedidos nuevos nacen con numero TVP- (sus Gift Cards
// salen con prefijo PRUEBA- y estado "prueba", que no se pueden canjear) y la
// tienda muestra la franja de aviso. Ojo: lo que se muestra o se emite para un
// pedido YA creado lo decide su numero, no esto (ver emitirGiftCards y
// esPedidoDePrueba en server/tienda.ts).
export function modoPrueba(): boolean {
  return entornoSpidi() !== "produccion";
}

// true si el servidor permite a proposito cobrar en un entorno de prueba
// CONOCIDO con NODE_ENV=production (un staging en Railway). Nunca abre un
// entorno desconocido. SPIDI_PERMITIR_SIMULADOR es el nombre viejo y se sigue
// aceptando para no romper un staging ya configurado.
function pruebasPermitidas(): boolean {
  return env("SPIDI_PERMITIR_PRUEBAS") === "1" || env("SPIDI_PERMITIR_SIMULADOR") === "1";
}

// true si el checkout debe cerrarse por el entorno:
// - SIEMPRE con entorno "desconocido", sin importar NODE_ENV ni
//   SPIDI_PERMITIR_PRUEBAS: los pagos podrian ser reales y la tienda los
//   trataria como de prueba (codigos que no sirven y correos que dicen que no
//   entro dinero).
// - Con un entorno de prueba conocido en el sitio publico (NODE_ENV=production):
//   cualquiera podria "pagar" sin dinero de verdad, y aunque sus Gift Cards
//   salgan de prueba, el comprador creeria que compro algo. Un staging lo abre
//   con SPIDI_PERMITIR_PRUEBAS=1.
export function pruebasBloqueadas(): boolean {
  const entorno = entornoSpidi();
  if (entorno === "desconocido") return true;
  return process.env.NODE_ENV === "production" && entorno !== "produccion" && !pruebasPermitidas();
}

// Por que el entorno es "desconocido", para el error de configuracion. Solo
// nombra variables, nunca la URL.
function motivoEntornoDesconocido(url: UrlSpidi | null): string {
  const declarado = env("SPIDI_ENTORNO");
  if (!url) return "no se entiende SPIDI_BASE_URL";
  if (declarado === "") return "SPIDI_ENTORNO esta vacia y el host de SPIDI_BASE_URL no es uno de prueba conocido";
  if (declarado !== VALOR_ENTORNO_PRODUCCION) {
    return `SPIDI_ENTORNO no vale exactamente "${VALOR_ENTORNO_PRODUCCION}" y el host de SPIDI_BASE_URL no es uno de prueba conocido`;
  }
  return "SPIDI_BASE_URL no es https";
}

// Problemas de configuracion del entorno para registrarlos al arrancar. Solo
// nombran variables y el entorno detectado, nunca la URL ni credenciales.
// `grave` = error de configuracion (la tienda queda en un modo que quien
// configuro no esperaba); si no, es solo un aviso.
export function revisarEntornoSpidi(): Array<{ grave: boolean; mensaje: string }> {
  const problemas: Array<{ grave: boolean; mensaje: string }> = [];
  const declarado = env("SPIDI_ENTORNO");
  const url = urlSpidi();
  const entorno = entornoSpidi();

  // Sin SPIDI_BASE_URL no hay nada que cobrar (spidiConfigurado ya lo avisa);
  // el entorno "desconocido" solo es un error cuando hay una URL.
  if (entorno === "desconocido" && baseUrl() !== "") {
    problemas.push({
      grave: true,
      mensaje:
        `ERROR DE CONFIGURACION: entorno de SPIDI DESCONOCIDO (${motivoEntornoDesconocido(url)}). ` +
        "Los pagos podrian ser reales, asi que el checkout queda CERRADO (503) siempre, aunque haya SPIDI_PERMITIR_PRUEBAS=1 o NODE_ENV=development. " +
        `Si es la URL de produccion, pon SPIDI_ENTORNO=${VALOR_ENTORNO_PRODUCCION} (exacto) y usala con https; si es un entorno de prueba, usa el simulador, el sandbox oficial u otro host de prueba reconocible (ver spidi.env.example).`,
    });
  } else {
    if (declarado !== "" && declarado !== VALOR_ENTORNO_PRODUCCION) {
      problemas.push({
        grave: true,
        mensaje:
          `ERROR DE CONFIGURACION: SPIDI_ENTORNO no vale exactamente "${VALOR_ENTORNO_PRODUCCION}": la tienda queda en MODO PRUEBA (${entorno}). ` +
          `En produccion real debe valer "${VALOR_ENTORNO_PRODUCCION}"; en cualquier otro caso, dejala vacia.`,
      });
    }
    // Aqui, si hay URL y el entorno no es produccion, el host es de prueba conocido.
    if (declarado === VALOR_ENTORNO_PRODUCCION && baseUrl() !== "" && entorno !== "produccion") {
      problemas.push({
        grave: true,
        mensaje:
          `ERROR DE CONFIGURACION: SPIDI_ENTORNO=${VALOR_ENTORNO_PRODUCCION} pero SPIDI_BASE_URL no es la de produccion (es de prueba: ${entorno}). ` +
          "Se ignora SPIDI_ENTORNO y la tienda queda en MODO PRUEBA: Gift Cards de prueba y, con NODE_ENV=production, checkout cerrado. " +
          "Corrige SPIDI_BASE_URL o deja SPIDI_ENTORNO vacia.",
      });
    }
  }
  if (env("SPIDI_PERMITIR_SIMULADOR") !== "") {
    problemas.push({
      grave: false,
      mensaje: "SPIDI_PERMITIR_SIMULADOR es el nombre viejo: se acepta igual, pero cambialo por SPIDI_PERMITIR_PRUEBAS.",
    });
  }
  return problemas;
}

// === Lectura defensiva de JSON ajeno ===
// Las respuestas y los avisos de SPIDI se tratan como `unknown`: un campo que
// falta o viene con otro tipo se vuelve null en vez de romper.

type Objeto = Record<string, unknown>;

function obj(valor: unknown): Objeto {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor) ? (valor as Objeto) : {};
}

function esObjeto(valor: unknown): boolean {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

function texto(valor: unknown): string | null {
  if (typeof valor === "string") {
    const limpio = valor.trim();
    return limpio === "" ? null : limpio;
  }
  if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  return null;
}

// El contrato a veces muestra montos como texto ("100.01"): se aceptan ambos.
function numero(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor === "string" && valor.trim() !== "") {
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function entero(valor: unknown): number | null {
  const n = numero(valor);
  if (n === null) return null;
  const e = Math.trunc(n);
  return Number.isSafeInteger(e) ? e : null;
}

function fecha(valor: unknown): Date | null {
  if (typeof valor !== "string" || valor.trim() === "") return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

// bank_reference_id viene compuesto "<referencia>|<comision>" (ej. "8852|0.50").
// Solo la parte izquierda es la referencia que aparece en el estado de cuenta.
export function referenciaBancaria(valor: unknown): string | null {
  const crudo = texto(valor);
  if (crudo === null) return null;
  const izquierda = crudo.split("|")[0].trim();
  return izquierda === "" ? null : izquierda;
}

// === Autenticacion ===
// Con SPIDI_API_TOKEN (simulador) se usa tal cual. Si no, login con short_name
// y password; el token del login dura poco a proposito, asi que se refresca
// antes de que venza con el refreshToken, que ROTA en cada uso.

interface TokenEnCache {
  token: string;
  refreshToken: string | null;
  obtenidoEn: number; // ms
  expiraEn: number | null; // ms, del campo exp del JWT si lo trae
}

let tokenEnCache: TokenEnCache | null = null;
// Una sola obtencion de token a la vez: si llegan varias peticiones juntas con
// el token vencido, todas esperan el mismo login en vez de hacer uno cada una.
let obtencionEnCurso: Promise<string> | null = null;

const MARGEN_REFRESCO_MS = 60_000;
const TIEMPO_ESPERA_MS = 15_000;
// Lo mas que puede tardar crearSesionBoton en el peor caso: refresh y login
// para tener token, la creacion, y tras un 401 otra vez refresh, login y
// creacion. Cada peticion espera como mucho TIEMPO_ESPERA_MS. La tienda lo usa
// para saber cuando un checkout que sigue sin sesion ya no puede estar vivo.
export const TIEMPO_MAXIMO_CREAR_SESION_MS = 6 * TIEMPO_ESPERA_MS;

// Lee el campo exp (segundos) de un JWT sin verificarlo: solo sirve para saber
// cuando refrescar. Si no es un JWT o no trae exp, devuelve null.
function expiracionJwt(token: string): number | null {
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  try {
    const carga = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8"));
    const exp = numero(obj(carga).exp);
    return exp === null ? null : exp * 1000;
  } catch {
    return null;
  }
}

function tokenVigente(t: TokenEnCache): boolean {
  if (t.expiraEn === null) return true;
  // Si el token viviera menos de 2 minutos, el margen se achica para no
  // refrescar en cada llamada.
  const margen = Math.min(MARGEN_REFRESCO_MS, Math.max(0, (t.expiraEn - t.obtenidoEn) / 2));
  return Date.now() < t.expiraEn - margen;
}

function guardarToken(cuerpo: unknown): string {
  const raiz = obj(cuerpo);
  // El contrato devuelve el token en la raiz; se mira tambien dentro de `data`
  // por si el entorno lo envuelve como al resto de respuestas.
  const datos = obj(raiz.data);
  const token = texto(raiz.token) ?? texto(datos.token);
  if (!token) throw new SpidiError("SPIDI no devolvio token al autenticar", 502, null);
  const refreshToken = texto(raiz.refreshToken) ?? texto(datos.refreshToken);
  tokenEnCache = {
    token,
    refreshToken,
    obtenidoEn: Date.now(),
    expiraEn: expiracionJwt(token),
  };
  return token;
}

async function iniciarSesion(): Promise<string> {
  const shortName = env("SPIDI_SHORT_NAME");
  const password = env("SPIDI_PASSWORD");
  if (!shortName || !password) {
    throw new SpidiNoConfigurado("Faltan SPIDI_API_TOKEN o SPIDI_SHORT_NAME + SPIDI_PASSWORD");
  }
  anotarLlamada();
  const r = await enviar("POST", "/api/spidipagos/login", { short_name: shortName, password }, null);
  return guardarToken(exigirExito(r));
}

async function refrescar(refreshToken: string): Promise<string> {
  anotarLlamada();
  const r = await enviar("POST", "/api/spidipagos/refresh-token", { refreshToken }, null);
  return guardarToken(exigirExito(r));
}

async function renovarToken(): Promise<string> {
  const refreshToken = tokenEnCache?.refreshToken ?? null;
  tokenEnCache = null;
  if (refreshToken) {
    try {
      return await refrescar(refreshToken);
    } catch (err) {
      // Refresh vencido o rechazado: el login con usuario y clave queda como
      // ultimo recurso.
      const detalle = err instanceof SpidiError ? `HTTP ${err.status}` : "error de red";
      console.warn(`[spidi] no se pudo refrescar el token (${detalle}); se inicia sesion de nuevo`);
    }
  }
  return iniciarSesion();
}

// Devuelve un token valido. `rechazado` es el token que acaba de recibir un 401:
// si otra peticion ya lo renovo, se usa el nuevo sin volver a renovar.
async function obtenerToken(rechazado?: string): Promise<string> {
  const tokenApi = env("SPIDI_API_TOKEN");
  if (tokenApi) return tokenApi;

  if (tokenEnCache) {
    if (rechazado !== undefined && tokenEnCache.token !== rechazado) return tokenEnCache.token;
    if (rechazado === undefined && tokenVigente(tokenEnCache)) return tokenEnCache.token;
  }

  if (!obtencionEnCurso) {
    obtencionEnCurso = renovarToken().finally(() => {
      obtencionEnCurso = null;
    });
  }
  return obtencionEnCurso;
}

// === Peticiones HTTP ===

interface RespuestaSpidi {
  status: number;
  cuerpo: unknown; // null si no era JSON
}

async function enviar(
  metodo: "GET" | "POST",
  ruta: string,
  cuerpo: unknown,
  token: string | null,
): Promise<RespuestaSpidi> {
  const base = baseUrl();
  if (!base) throw new SpidiNoConfigurado("Falta SPIDI_BASE_URL");

  const cabeceras: Record<string, string> = { Accept: "application/json" };
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(base + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(TIEMPO_ESPERA_MS),
    });
  } catch (err) {
    const agotado = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    throw new SpidiError(
      agotado ? "SPIDI no respondio a tiempo" : "No se pudo conectar con SPIDI",
      0,
      null,
    );
  }

  // Cualquier 429 (tambien del login o el refresh) pausa todas las llamadas.
  if (res.status === 429) pausarLlamadas(leerRetryAfter(res.headers.get("retry-after")));

  const crudo = await res.text().catch(() => "");
  let json: unknown = null;
  if (crudo) {
    try {
      json = JSON.parse(crudo);
    } catch {
      json = null;
    }
  }
  return { status: res.status, cuerpo: json };
}

// Convierte una respuesta no exitosa en SpidiError con el sobre de error de
// SPIDI ({success:false, message, code}). Devuelve el cuerpo si todo fue bien.
function exigirExito(r: RespuestaSpidi): Objeto {
  const cuerpo = obj(r.cuerpo);
  const ok = r.status >= 200 && r.status < 300;
  if (!ok || cuerpo.success === false) {
    const mensaje = texto(cuerpo.message) ?? `SPIDI respondio HTTP ${r.status}`;
    throw new SpidiError(mensaje, r.status, texto(cuerpo.code));
  }
  if (r.cuerpo === null || !esObjeto(r.cuerpo)) {
    throw new SpidiError("SPIDI respondio algo que no es JSON", 502, null);
  }
  return cuerpo;
}

// Llamada autenticada a la API. Primero toma su cupo del presupuesto (si no
// hay, lanza SpidiError 429 LIMITE_LOCAL sin llamar a SPIDI). Ante un 401
// renueva el token (refresh o, si falla, login) y reintenta UNA sola vez.
async function llamarApi(
  tipo: TipoLlamada,
  metodo: "GET" | "POST",
  ruta: string,
  cuerpo?: unknown,
): Promise<Objeto> {
  tomarCupo(tipo);
  const token = await obtenerToken();
  let r = await enviar(metodo, ruta, cuerpo, token);
  // Con SPIDI_API_TOKEN fijo no hay nada que renovar: reintentar daria lo mismo.
  if (r.status === 401 && !env("SPIDI_API_TOKEN")) {
    const nuevo = await obtenerToken(token);
    anotarLlamada();
    r = await enviar(metodo, ruta, cuerpo, nuevo);
  }
  return exigirExito(r);
}

// === Sesion de pago tipo Boton ===

export async function crearSesionBoton(p: {
  montoUsd: number;
  identificadorEtiqueta: string;
  identificador: string;
  descripcion: string;
  successUrl: string;
  failureUrl: string;
  webhookUrl: string;
  duracionMinutos: number;
}): Promise<{ sessionId: string; paymentUrl: string }> {
  const agreementId = env("SPIDI_AGREEMENT_ID");
  if (!agreementId) throw new SpidiNoConfigurado("Falta SPIDI_AGREEMENT_ID");
  if (!Number.isFinite(p.montoUsd) || p.montoUsd <= 0) {
    throw new Error("Monto invalido para la sesion de pago");
  }

  const cuerpo = await llamarApi("cobro", "POST", "/api/v1/ext/payment-sessions/buttons", {
    agreement_id: agreementId,
    // USD = dolar BCV: SPIDI convierte a bolivares con la tasa vigente al crear
    // la sesion, y su pagina le muestra al cliente el monto en Bs.
    amount_reference: redondearUsd(p.montoUsd),
    currency_reference: "USD",
    identifier_label: p.identificadorEtiqueta,
    identifier: p.identificador,
    description: p.descripcion.slice(0, 500),
    success_url: p.successUrl,
    failure_url: p.failureUrl,
    webhook_url: p.webhookUrl,
    duration_minutes: acotarDuracion(p.duracionMinutos),
  });

  // La respuesta trae ademas campos que el contrato no declara (data.config,
  // data.payment_qr): se ignoran sin romper.
  const datos = obj(cuerpo.data);
  const sessionId = texto(datos.session_id);
  const paymentUrl = texto(datos.payment_url);
  if (!sessionId || !paymentUrl) {
    throw new SpidiError("SPIDI no devolvio session_id o payment_url", 502, null);
  }
  // La URL se usa tal cual la da SPIDI; nunca se construye. Solo se exige que
  // sea http(s) para no mandar al cliente a un enlace mal formado.
  if (!/^https?:\/\//i.test(paymentUrl)) {
    throw new SpidiError("SPIDI devolvio un payment_url invalido", 502, null);
  }
  return { sessionId, paymentUrl };
}

// === Consulta de estado (fuente oficial para confirmar un pago) ===

export interface EstadoSesionSpidi {
  // Fase 1. NUNCA vale "accredited": tras paid se queda en paid.
  status: "pending" | "paid" | "failed" | "expired";
  // Solo cuando status es "paid".
  pago: DatosPagoSpidi | null;
  // Fase 2: solo cuando receiver_credits ya no viene null.
  acreditacion: DatosAcreditacionSpidi | null;
  // Mensaje de SPIDI para el pagador (user_message) o el motivo tecnico.
  motivo: string | null;
}

function normalizarStatus(valor: unknown): EstadoSesionSpidi["status"] {
  // Cualquier otro valor (por ejemplo "paid_pending" de un pago cripto aun sin
  // confirmar) se trata como pendiente: no se entrega nada que no sea "paid".
  if (valor === "paid") return "paid";
  if (valor === "failed") return "failed";
  if (valor === "expired") return "expired";
  return "pending";
}

// Credito del owner en receiver_credits (no hay split en esta tienda).
function acreditacionDeOwner(owner: Objeto): DatosAcreditacionSpidi {
  return {
    montoVes: numero(owner.amount_ves_credited),
    comisionVes: numero(owner.bank_commissions_ves),
    referencia: referenciaBancaria(owner.bank_reference_id),
    acreditadoEn: fecha(owner.receive_date) ?? new Date(),
  };
}

// Quien pide la consulta: "publica" si nace de la pagina de resultado (la pide
// el navegador del comprador); "interna" si la pide el propio servidor (barrido
// de conciliacion, aviso de acreditacion).
export type OrigenConsulta = "interna" | "publica";

// Consulta de estado. Usa el cupo de "consulta" (tope ~60/min) y, si es
// "publica", ademas su sub-tope (25/min): si se agoto o hay pausa por 429, lanza
// SpidiError 429 LIMITE_LOCAL sin llamar a SPIDI, y quien llama debe quedarse
// con el estado que ya tiene guardado.
export async function consultarSesion(
  sessionId: string,
  origen: OrigenConsulta = "interna",
): Promise<EstadoSesionSpidi> {
  const cuerpo = await llamarApi(
    origen === "publica" ? "consulta_publica" : "consulta",
    "GET",
    `/api/v1/ext/payment-sessions/status/${encodeURIComponent(sessionId)}`,
  );
  const datos = obj(cuerpo.data);
  const status = normalizarStatus(datos.status);
  const sesionPago = obj(datos.session_payment);
  const detalles = obj(sesionPago.payment_details);
  // En pagos cripto payment_details viene null y los datos estan aqui.
  const cripto = obj(sesionPago.crypto_details);

  const pago: DatosPagoSpidi | null =
    status === "paid"
      ? {
          metodo: texto(sesionPago.payment_method),
          banco: texto(detalles.bank_name),
          referencia: referenciaBancaria(detalles.bank_reference_id),
          montoVes: numero(detalles.amount_ves) ?? numero(cripto.amount_transaction_ves),
          tasaBcv: numero(detalles.bcv_rate_usd_ves),
          spidiTransaccionId: entero(sesionPago.spidi_transaction_id),
          comprobanteUrl: texto(sesionPago.spidi_transaction_url),
          pagadoEn: fecha(detalles.action_date) ?? fecha(cripto.paid_at) ?? new Date(),
        }
      : null;

  // OJO a la ruta: en GET status los creditos cuelgan de session_payment (en el
  // webhook van en data.receiver_credits). Es un OBJETO {owner, partners[]} y
  // viene null hasta que ocurre la fase 2.
  const creditos = sesionPago.receiver_credits;
  const owner = obj(obj(creditos).owner);
  const acreditacion =
    status === "paid" && esObjeto(creditos) && esObjeto(obj(creditos).owner)
      ? acreditacionDeOwner(owner)
      : null;

  const motivoCrudo = texto(sesionPago.user_message) ?? texto(sesionPago.reason);
  return {
    status,
    pago,
    acreditacion,
    motivo: motivoCrudo ? motivoCrudo.slice(0, 300) : null,
  };
}

// === Expiracion forzada (operacion expirePaymentSession) ===

// Cierra una sesion de pago "pending": pasa a "expired" y su enlace deja de
// servir. Si ya estaba expirada, SPIDI responde 200 sin cambiar nada. Si ya
// estaba pagada, SPIDI responde 422 (regla de negocio): sale como SpidiError
// con status 422 y quien llama debe consultar el estado y aplicarlo. Usa el
// cupo de "consulta" (no el de cobrar): es una accion manual y poco frecuente.
// `motivoAuditoria` va a message_audit (solo lo ve el comercio, no el cliente).
export async function expirarSesion(sessionId: string, motivoAuditoria: string): Promise<{ status: string | null }> {
  const cuerpo = await llamarApi(
    "consulta",
    "POST",
    `/api/v1/payment-session/${encodeURIComponent(sessionId)}/expiration`,
    { category: "OTHER", message_audit: motivoAuditoria.slice(0, 500) },
  );
  return { status: texto(obj(cuerpo.data).status) };
}

// === Webhooks ===

export type EventoSpidi =
  | { tipo: "pagado"; evento: string; sessionId: string; pago: DatosPagoSpidi }
  | { tipo: "acreditado"; evento: string; sessionId: string; acreditacion: DatosAcreditacionSpidi }
  | { tipo: "acreditacion_fallida"; evento: string; sessionId: string | null }
  | { tipo: "otro"; evento: string; sessionId: string | null };

// Interpreta el cuerpo (ya verificado) de un aviso. Se distingue por el campo
// `event` del cuerpo, NO por los titulos del OpenAPI: lo que viaja es
// "payment_session.paid" y "payment_session.accredited" (el contrato los titula
// payment_completed / accreditations_completed). Un evento desconocido se
// devuelve como "otro" para ignorarlo y responder 2xx.
export function interpretarWebhook(cuerpo: unknown): EventoSpidi {
  const raiz = obj(cuerpo);
  const evento = texto(raiz.event) ?? "";
  const datos = obj(raiz.data);
  const sesionPago = obj(datos.session_payment);
  const sessionId = texto(sesionPago.id);

  switch (evento) {
    case "payment_session.paid": {
      if (!sessionId) return { tipo: "otro", evento, sessionId: null };
      const detalles = obj(datos.payment_details);
      // En el webhook crypto_details va al mismo nivel que session_payment.
      const cripto = obj(datos.crypto_details);
      const transaccion = obj(sesionPago.spidi_transaction);
      return {
        tipo: "pagado",
        evento,
        sessionId,
        pago: {
          metodo: texto(sesionPago.payment_method),
          banco: texto(detalles.bank_name),
          referencia: referenciaBancaria(detalles.bank_reference_id),
          montoVes: numero(detalles.amount_ves) ?? numero(cripto.amount_transaction_ves),
          tasaBcv: numero(detalles.bcv_rate_usd_ves),
          spidiTransaccionId: entero(transaccion.id),
          comprobanteUrl: texto(transaccion.url),
          pagadoEn: fecha(detalles.action_date) ?? fecha(cripto.paid_at) ?? new Date(),
        },
      };
    }
    case "payment_session.accredited": {
      if (!sessionId) return { tipo: "otro", evento, sessionId: null };
      // En el webhook la ruta es data.receiver_credits (en GET status es
      // data.session_payment.receiver_credits).
      const owner = obj(obj(datos.receiver_credits).owner);
      return { tipo: "acreditado", evento, sessionId, acreditacion: acreditacionDeOwner(owner) };
    }
    case "payment_session.accreditation_to_recipient_failed":
      // El unico aviso de que el dinero NO llego; no tiene equivalente en GET status.
      return { tipo: "acreditacion_fallida", evento, sessionId };
    default:
      return { tipo: "otro", evento, sessionId };
  }
}

// spidi-signature = hex(HMAC-SHA256(secreto, spidi-timestamp + "." + cuerpo CRUDO)).
// Se firma sobre los bytes tal como llegaron: re-serializar el JSON cambia el
// orden o los espacios y la firma deja de coincidir. Sin timestamp no hay nada
// que verificar y se rechaza. No se impone ventana de tiempo: SPIDI reintenta
// el mismo aviso con la misma marca, y los repetidos se descartan por
// idempotency-key.
export function verificarFirmaWebhook(
  rawBody: Buffer,
  timestamp: string | undefined,
  firma: string | undefined,
): boolean {
  const secreto = env("SPIDI_WEBHOOK_SECRET");
  if (!secreto) throw new SpidiNoConfigurado("Falta SPIDI_WEBHOOK_SECRET");
  if (!timestamp || !firma || !Buffer.isBuffer(rawBody)) return false;

  const esperada = createHmac("sha256", secreto)
    .update(Buffer.concat([Buffer.from(`${timestamp}.`, "utf8"), rawBody]))
    .digest("hex");
  const a = Buffer.from(esperada, "utf8");
  const b = Buffer.from(firma.trim().toLowerCase(), "utf8");
  // timingSafeEqual exige el mismo largo; comparar largos antes no filtra nada
  // util (el largo de un hex de SHA-256 es publico).
  return a.length === b.length && timingSafeEqual(a, b);
}

// === Acuerdo de liquidacion ===

// Crea el acuerdo por el que se liquidan los pagos: sin split, debito inmediato
// y pago movil, sin cripto. El agreement_id no se puede recuperar despues:
// quien llama debe guardarlo.
export async function crearAcuerdo(p: { titulo: string; bankAccountId: string }): Promise<{ agreementId: string }> {
  const cuerpo = await llamarApi("cobro", "POST", "/api/v1/ext/agreements", {
    title: p.titulo,
    description: "Pagos de la tienda web de Todo Vending CA",
    split: false,
    // Las tres claves son obligatorias por contrato.
    payment_methods: {
      immediate_debit: true,
      mobile_payment: true,
      crypto: false,
    },
    default_bank_account_id: p.bankAccountId,
  });
  // No se valida data.status contra el enum del contrato: SPIDI devuelve
  // "active", que el contrato no declara.
  const agreementId = texto(obj(cuerpo.data).agreement_id);
  if (!agreementId) throw new SpidiError("SPIDI no devolvio agreement_id", 502, null);
  return { agreementId };
}
