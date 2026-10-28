// Carga spidi.env (si existe en la carpeta desde donde se arranca) en
// process.env. Se importa como PRIMERA linea de server/index.ts para que corra
// antes de que server/db.ts lea DATABASE_URL o server/spidi.ts lea sus
// variables.
//
// NUNCA pisa una variable que ya exista: en Railway mandan las Variables del
// servicio, y alli spidi.env ni siquiera existe (esta en .gitignore).
//
// Parser minimo propio a proposito (sin dependencias): KEY=VALOR por linea,
// ignora lineas vacias y comentarios (#), quita comillas opcionales. Los
// comentarios van en su propia linea: un "#" dentro de un valor es parte del
// valor (una clave puede tenerlo).
import fs from "node:fs";
import path from "node:path";

export const ARCHIVO_ENTORNO = "spidi.env";

export function rutaArchivoEntorno(): string {
  return path.resolve(process.cwd(), ARCHIVO_ENTORNO);
}

const CLAVE_VALIDA = /^[A-Za-z_][A-Za-z0-9_]*$/;
// Marca de orden de bytes que agregan algunos editores de Windows al inicio.
const BOM = new RegExp("^" + String.fromCharCode(0xfeff));

// Separa una linea en clave y valor, o null si no es una asignacion.
function leerLinea(linea: string): { clave: string; valor: string } | null {
  let l = linea.trim();
  if (l === "" || l.startsWith("#")) return null;
  if (l.startsWith("export ")) l = l.slice(7).trim();
  const igual = l.indexOf("=");
  if (igual <= 0) return null;
  const clave = l.slice(0, igual).trim();
  if (!CLAVE_VALIDA.test(clave)) return null;
  let valor = l.slice(igual + 1).trim();
  if (
    valor.length >= 2 &&
    ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'")))
  ) {
    valor = valor.slice(1, -1);
  }
  return { clave, valor };
}

export function parsearEntorno(contenido: string): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const linea of contenido.replace(BOM, "").split(/\r?\n/)) {
    const par = leerLinea(linea);
    if (par) resultado[par.clave] = par.valor;
  }
  return resultado;
}

// Devuelve cuantas variables se aplicaron, o null si no hay archivo.
export function cargarArchivoEntorno(ruta = rutaArchivoEntorno()): number | null {
  let contenido: string;
  try {
    contenido = fs.readFileSync(ruta, "utf8");
  } catch {
    return null;
  }
  let aplicadas = 0;
  for (const [clave, valor] of Object.entries(parsearEntorno(contenido))) {
    // Las vacias se saltan: una variable vacia no aporta nada y solo
    // confundiria a quien pregunte "si existe".
    if (valor === "" || process.env[clave] !== undefined) continue;
    process.env[clave] = valor;
    aplicadas++;
  }
  return aplicadas;
}

// Escribe valores en spidi.env conservando el resto del archivo (comentarios,
// orden y demas variables). Reemplaza la primera linea KEY=... de cada clave y
// agrega al final las que no esten; crea el archivo si no existia. Lo usan los
// scripts de script/, no el servidor.
//
// Con `respaldarAnteriores`, si una clave tenia otro valor no vacio, se deja
// ese valor en un comentario justo encima: un webhook secret o un agreement_id
// que entrego SPIDI no se pueden recuperar despues, y este archivo es el unico
// sitio donde estan.
export function escribirEnArchivoEntorno(
  valores: Record<string, string>,
  opciones: { ruta?: string; notaFinal?: string[]; respaldarAnteriores?: boolean } = {},
): void {
  const ruta = opciones.ruta ?? rutaArchivoEntorno();
  let contenido = "";
  try {
    contenido = fs.readFileSync(ruta, "utf8").replace(BOM, "");
  } catch {
    contenido = "";
  }
  const salto = contenido.includes("\r\n") ? "\r\n" : "\n";
  const lineas = contenido === "" ? [] : contenido.split(/\r?\n/);
  // Si el archivo terminaba en salto de linea, split deja un "" al final.
  const terminabaEnSalto = lineas.length > 0 && lineas[lineas.length - 1] === "";
  if (terminabaEnSalto) lineas.pop();

  const pendientes = new Map(Object.entries(valores));
  const hoy = new Date().toISOString().slice(0, 10);
  const resultado: string[] = [];
  for (const linea of lineas) {
    const par = leerLinea(linea);
    if (!par || !pendientes.has(par.clave)) {
      resultado.push(linea);
      continue;
    }
    const nuevo = pendientes.get(par.clave)!;
    if (opciones.respaldarAnteriores && par.valor !== "" && par.valor !== nuevo) {
      resultado.push(`# ${par.clave} anterior (reemplazado el ${hoy}): ${par.valor}`);
    }
    resultado.push(`${par.clave}=${formatearValor(nuevo)}`);
    pendientes.delete(par.clave);
  }
  for (const [clave, valor] of Array.from(pendientes.entries())) {
    resultado.push(`${clave}=${formatearValor(valor)}`);
  }
  if (opciones.notaFinal && opciones.notaFinal.length > 0) {
    resultado.push("", ...opciones.notaFinal);
  }
  fs.writeFileSync(ruta, resultado.join(salto) + salto, "utf8");
}

// Comillas solo si hacen falta (espacios o comillas en el valor), para que el
// parser de arriba lo lea igual.
function formatearValor(valor: string): string {
  if (/[\r\n]/.test(valor)) throw new Error("Un valor de spidi.env no puede tener saltos de linea");
  if (!/[\s"']/.test(valor)) return valor;
  if (!valor.includes('"')) return `"${valor}"`;
  if (!valor.includes("'")) return `'${valor}'`;
  throw new Error("Un valor de spidi.env no puede tener comillas simples y dobles a la vez");
}

const aplicadas = cargarArchivoEntorno();
if (aplicadas) {
  // Solo el conteo: nunca nombres con valores.
  console.log(`[entorno] ${ARCHIVO_ENTORNO}: ${aplicadas} variables cargadas`);
}
