// Registra una cuenta de prueba en el simulador de SPIDI y guarda sus
// credenciales en spidi.env. Lo corre la persona, no el servidor:
//
//   npm run spidi:simulador
//   npm run spidi:simulador -- --email yo@correo.test --password algo-largo
//   npm run spidi:simulador -- --forzar     (reemplaza una cuenta ya guardada)
//
// POST /console/register existe SOLO en el simulador: el sandbox y produccion
// entregan sus credenciales por soporte y se autentican con login.
//
// Nunca imprime secretos (tokens, webhook secret, claves): solo el account_id.
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import {
  ARCHIVO_ENTORNO,
  escribirEnArchivoEntorno,
  parsearEntorno,
  rutaArchivoEntorno,
} from "../server/cargar-entorno";

const SIMULADOR = "https://sim.mispidi.com";
// Cuenta bancaria de prueba que usan las guias del simulador.
const CUENTA_BANCARIA_SIMULADOR = "uuid_banco_001";

function argumento(nombre: string): string | undefined {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === `--${nombre}`) return args[i + 1];
    if (args[i].startsWith(`--${nombre}=`)) return args[i].slice(nombre.length + 3);
  }
  return undefined;
}

function salir(mensaje: string): never {
  console.error(mensaje);
  process.exit(1);
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
}

async function main() {
  const forzar = process.argv.includes("--forzar");
  const ruta = rutaArchivoEntorno();
  const actual = fs.existsSync(ruta) ? parsearEntorno(fs.readFileSync(ruta, "utf8")) : {};

  // No se pisa una configuracion que ya funciona. Un webhook secret lleno sin
  // token de API suele ser el de una cuenta real de SPIDI (sandbox/produccion),
  // y ese no se puede volver a pedir facilmente.
  const ocupadas = ["SPIDI_API_TOKEN", "SPIDI_WEBHOOK_SECRET"].filter((k) => (actual[k] ?? "") !== "");
  if (ocupadas.length > 0 && !forzar) {
    salir(
      `${ARCHIVO_ENTORNO} ya tiene ${ocupadas.join(" y ")}. No se reemplaza.\n` +
        "Si de verdad quieres una cuenta nueva del simulador, vuelve a correrlo con --forzar " +
        "(los valores anteriores quedan comentados en el archivo).",
    );
  }

  const email = argumento("email") ?? `tienda-${randomBytes(4).toString("hex")}@todovendingca.test`;
  const password = argumento("password") ?? randomBytes(18).toString("base64url");
  if (!email.includes("@")) salir("El --email no parece un correo.");
  if (password.length < 8) salir("El --password debe tener al menos 8 caracteres.");

  let res: Response;
  try {
    res = await fetch(`${SIMULADOR}/console/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    salir(`No se pudo conectar con el simulador (${SIMULADOR}). Revisa tu conexión e intenta de nuevo.`);
  }

  const cuerpo: unknown = await res.json().catch(() => null);
  const raiz = (cuerpo && typeof cuerpo === "object" ? cuerpo : {}) as Record<string, unknown>;
  if (res.status === 409) salir("Ese email ya está registrado en el simulador. Usa otro con --email.");
  if (!res.ok) {
    salir(`El simulador respondió HTTP ${res.status}: ${texto(raiz.message) ?? "sin detalle"}`);
  }

  // Respuesta 201: { developer_id, console_token, key: { account_id, token,
  // webhook_secret, short_name, password } }
  const key = (raiz.key && typeof raiz.key === "object" ? raiz.key : {}) as Record<string, unknown>;
  const accountId = texto(key.account_id);
  const tokenApi = texto(key.token);
  const webhookSecret = texto(key.webhook_secret);
  const consoleToken = texto(raiz.console_token);
  if (!accountId || !tokenApi || !webhookSecret || !consoleToken) {
    salir("La respuesta del simulador no trae las credenciales esperadas. No se escribió nada.");
  }

  const valores: Record<string, string> = {
    SPIDI_BASE_URL: SIMULADOR,
    SPIDI_ACCOUNT_ID: accountId,
    SPIDI_API_TOKEN: tokenApi,
    SPIDI_WEBHOOK_SECRET: webhookSecret,
    SPIDI_CONSOLE_TOKEN: consoleToken,
  };
  if ((actual.SPIDI_BANK_ACCOUNT_ID ?? "") === "") {
    valores.SPIDI_BANK_ACCOUNT_ID = CUENTA_BANCARIA_SIMULADOR;
  }
  // Los acuerdos son de cada cuenta: el de otra cuenta no sirve con esta. Se
  // vacia (queda comentado) para que `npm run spidi:acuerdo` cree uno nuevo.
  const habiaAcuerdo = (actual.SPIDI_AGREEMENT_ID ?? "") !== "";
  if (habiaAcuerdo) valores.SPIDI_AGREEMENT_ID = "";

  // La clave de consola y el login de la key quedan como comentario: sirven
  // para recuperar el token de consola (POST /console/login) y para probar el
  // login con usuario y clave, que es como se autentica fuera del simulador.
  const shortName = texto(key.short_name);
  const passwordKey = texto(key.password);
  const nota = [
    `# Cuenta de prueba del simulador creada el ${new Date().toISOString().slice(0, 10)} (${accountId}):`,
    `#   consola: ${email} / ${password}`,
  ];
  if (shortName && passwordKey) {
    nota.push(
      `#   login de la API: short_name=${shortName} password=${passwordKey}`,
      "#   (para probar login y refresco: vacía SPIDI_API_TOKEN y copia esos dos a SPIDI_SHORT_NAME y SPIDI_PASSWORD)",
    );
  }

  escribirEnArchivoEntorno(valores, { ruta, notaFinal: nota, respaldarAnteriores: true });

  console.log(`Cuenta del simulador creada: ${accountId}`);
  console.log(`Credenciales guardadas en ${ARCHIVO_ENTORNO}.`);
  if (habiaAcuerdo) {
    console.log("SPIDI_AGREEMENT_ID era de otra cuenta y se vació (el anterior quedó comentado).");
  }
  console.log("Siguiente paso: npm run spidi:acuerdo");
}

main().catch((err) => {
  // Sin volcar el objeto entero: podria arrastrar cabeceras o cuerpos.
  salir(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
});
