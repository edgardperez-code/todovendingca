// Crea el acuerdo de liquidacion de la tienda en SPIDI (POST /api/v1/ext/agreements)
// con las credenciales del entorno, y guarda su agreement_id en spidi.env.
// Lo corre la persona, una vez por entorno (simulador, sandbox, produccion):
//
//   npm run spidi:acuerdo
//   npm run spidi:acuerdo -- --titulo "Tienda web Todo Vending CA"
//
// El agreement_id no se puede consultar despues: por eso se escribe en el
// archivo en cuanto llega y se imprime (no es secreto) para copiarlo a Railway.
import "../server/cargar-entorno";
import fs from "node:fs";
import { ARCHIVO_ENTORNO, escribirEnArchivoEntorno, parsearEntorno, rutaArchivoEntorno } from "../server/cargar-entorno";
import { crearAcuerdo, SpidiError, SpidiNoConfigurado } from "../server/spidi";

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

function env(nombre: string): string {
  return (process.env[nombre] ?? "").trim();
}

async function main() {
  const baseUrl = env("SPIDI_BASE_URL");
  if (!baseUrl) salir("Falta SPIDI_BASE_URL (en spidi.env o en el entorno).");
  if (!env("SPIDI_API_TOKEN") && !(env("SPIDI_SHORT_NAME") && env("SPIDI_PASSWORD"))) {
    salir("Faltan credenciales: SPIDI_API_TOKEN (simulador) o SPIDI_SHORT_NAME + SPIDI_PASSWORD (sandbox/producción).");
  }
  const bankAccountId = env("SPIDI_BANK_ACCOUNT_ID");
  if (!bankAccountId) {
    salir(
      "Falta SPIDI_BANK_ACCOUNT_ID: el UUID de la cuenta bancaria donde se liquida. " +
        "Lo entrega SPIDI con tus credenciales (en el simulador es uuid_banco_001).",
    );
  }

  const titulo = argumento("titulo")?.trim() || "Tienda web Todo Vending CA";
  console.log(`Creando acuerdo en ${baseUrl} ...`);

  let agreementId: string;
  try {
    ({ agreementId } = await crearAcuerdo({ titulo, bankAccountId }));
  } catch (err) {
    if (err instanceof SpidiError) {
      salir(`SPIDI rechazó la creación del acuerdo (HTTP ${err.status}${err.code ? `, ${err.code}` : ""}): ${err.message}`);
    }
    if (err instanceof SpidiNoConfigurado) salir(err.message);
    throw err;
  }

  console.log(`Acuerdo creado. SPIDI_AGREEMENT_ID=${agreementId}`);

  const ruta = rutaArchivoEntorno();
  if (fs.existsSync(ruta)) {
    const actual = parsearEntorno(fs.readFileSync(ruta, "utf8"));
    const previo = (actual.SPIDI_AGREEMENT_ID ?? "").trim();
    if (previo === "") {
      escribirEnArchivoEntorno({ SPIDI_AGREEMENT_ID: agreementId }, { ruta });
      console.log(`Guardado en ${ARCHIVO_ENTORNO}.`);
    } else if (previo === agreementId) {
      console.log(`${ARCHIVO_ENTORNO} ya tenía ese mismo SPIDI_AGREEMENT_ID.`);
    } else {
      console.log(
        `${ARCHIVO_ENTORNO} ya tiene otro SPIDI_AGREEMENT_ID (${previo}) y no se cambió. ` +
          "Si quieres usar el nuevo, reemplázalo a mano; anótalo antes, porque SPIDI no deja consultarlo después.",
      );
    }
  } else {
    console.log(`No hay ${ARCHIVO_ENTORNO} en esta carpeta: guarda el agreement_id donde corresponda.`);
  }

  console.log(
    "Recuerda ponerlo también en Railway > Variables del servicio como SPIDI_AGREEMENT_ID " +
      "(el acuerdo es de las credenciales con que se creó: uno por entorno).",
  );
}

main().catch((err) => {
  // Sin volcar el objeto entero: podria arrastrar cabeceras o cuerpos.
  salir(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
});
