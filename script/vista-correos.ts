// Vista previa de los correos de la tienda y del formulario de contacto.
// NO envía nada: solo escribe un .html por caso (y el .txt del correo al
// comprador) con datos de ejemplo, para abrirlos en el navegador.
//
//   npx tsx script/vista-correos.ts
//   npx tsx script/vista-correos.ts --salida C:\ruta\de\salida
//   npx tsx script/vista-correos.ts --imagenes https://www.todovendingca.com/correo
//
// --salida    carpeta donde se escriben (por defecto, una en la carpeta
//             temporal del sistema). También vale VISTA_CORREOS_SALIDA.
// --imagenes  URL base de las imágenes. Por defecto apunta con file:// a
//             client/public/correo de este repositorio, así se ven sin haber
//             publicado. También vale VISTA_CORREOS_IMAGENES. Esto solo afecta
//             a la vista previa: los correos reales usan siempre la web.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  htmlContacto,
  htmlGiftCardsComprador,
  htmlNotificacionVenta,
  textoGiftCardsComprador,
  type DatosCorreoVenta,
} from "../server/email";

function argumento(nombre: string): string | undefined {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const salida = path.resolve(
  argumento("salida") ?? process.env.VISTA_CORREOS_SALIDA ?? path.join(os.tmpdir(), "todovending-vista-correos"),
);
const baseImagenes =
  argumento("imagenes") ??
  process.env.VISTA_CORREOS_IMAGENES ??
  pathToFileURL(path.join(raiz, "client", "public", "correo")).toString();
const opciones = { baseImagenes };

// Datos de ejemplo (personas y códigos ficticios).
const base: DatosCorreoVenta = {
  numero: "TV-261120-K7M2Q",
  compradorNombre: "Mariana Guevara",
  compradorEmail: "mariana.guevara@ejemplo.com",
  compradorTelefono: "+58 412-555-0142",
  cantidad: 1,
  totalUsd: 25,
  montoVes: 9187.5,
  referencia: "004512879634",
  comprobanteUrl: "https://app.spidipagos.com/comprobante/ejemplo-123",
  giftCards: [{ codigo: "TV-8KQ2-M7XD-41PN", montoUsd: 25 }],
  faltanCodigos: 0,
  esPrueba: false,
  pasarela: "spidi",
};

const tresTarjetas: DatosCorreoVenta = {
  ...base,
  numero: "TV-261120-P4W9A",
  compradorNombre: "José Gregorio Marcano",
  compradorEmail: "jg.marcano@ejemplo.com",
  cantidad: 3,
  totalUsd: 85,
  montoVes: 31237.5,
  referencia: "007781234410",
  giftCards: [
    { codigo: "TV-3HZ7-QW2L-9RNC", montoUsd: 10 },
    { codigo: "TV-8KQ2-M7XD-41PN", montoUsd: 25 },
    { codigo: "TV-V5TB-6YJA-C0E8", montoUsd: 50 },
  ],
};

const faltanCodigos: DatosCorreoVenta = {
  ...tresTarjetas,
  numero: "TV-261120-D2F6R",
  giftCards: [{ codigo: "TV-3HZ7-QW2L-9RNC", montoUsd: 10 }],
  faltanCodigos: 2,
};

const prueba: DatosCorreoVenta = {
  ...base,
  numero: "TVP-261120-X1B8N",
  compradorNombre: "Luisa Prueba",
  compradorEmail: "luisa.prueba@ejemplo.com",
  cantidad: 2,
  totalUsd: 35,
  montoVes: 12862.5,
  referencia: "SIM-000042",
  giftCards: [
    { codigo: "PRUEBA-TV-A1B2-C3D4-E5F6", montoUsd: 10 },
    { codigo: "PRUEBA-TV-G7H8-J9K0-L1M2", montoUsd: 25 },
  ],
  esPrueba: true,
};

const skylink: DatosCorreoVenta = {
  ...base,
  numero: "TV-261120-S9C3H",
  compradorNombre: "Andrés Salazar",
  compradorEmail: "andres.salazar@ejemplo.com",
  compradorTelefono: null,
  cantidad: 1,
  totalUsd: 50,
  montoVes: null,
  referencia: "SKY-7F3A91C2",
  comprobanteUrl: null,
  giftCards: [{ codigo: "TV-V5TB-6YJA-C0E8", montoUsd: 50 }],
  pasarela: "skylink",
};

const casos: Array<{ nombre: string; html: string; texto?: string }> = [
  {
    nombre: "comprador-1-tarjeta",
    html: htmlGiftCardsComprador(base, true, opciones),
    texto: textoGiftCardsComprador(base, true),
  },
  {
    nombre: "comprador-3-tarjetas",
    html: htmlGiftCardsComprador(tresTarjetas, true, opciones),
    texto: textoGiftCardsComprador(tresTarjetas, true),
  },
  {
    nombre: "comprador-faltan-codigos",
    html: htmlGiftCardsComprador(faltanCodigos, true, opciones),
    texto: textoGiftCardsComprador(faltanCodigos, true),
  },
  {
    nombre: "comprador-prueba",
    html: htmlGiftCardsComprador(prueba, true, opciones),
    texto: textoGiftCardsComprador(prueba, true),
  },
  {
    nombre: "comprador-skylink",
    html: htmlGiftCardsComprador(skylink, true, opciones),
    texto: textoGiftCardsComprador(skylink, true),
  },
  // Aviso al dueño: el caso más cargado (pago sin stock y correo al comprador
  // que no salió) y uno normal cobrado con Skylink Pay.
  { nombre: "venta-dueno", html: htmlNotificacionVenta(tresTarjetas, true, opciones) },
  { nombre: "venta-dueno-sin-stock", html: htmlNotificacionVenta(faltanCodigos, false, opciones) },
  { nombre: "venta-dueno-prueba", html: htmlNotificacionVenta(prueba, true, opciones) },
  { nombre: "venta-dueno-skylink", html: htmlNotificacionVenta(skylink, true, opciones) },
  {
    nombre: "contacto",
    html: htmlContacto(
      {
        name: "Carolina Rondón",
        email: "carolina.rondon@ejemplo.com",
        phone: "+58 424-555-0187",
        company: "Clínica Santa Elena <Sede Lechería>",
        message:
          "Buenas tardes.\n\nQueremos instalar dos máquinas (snacks & café) en la sala de espera de la clínica.\n¿Podrían visitarnos esta semana para evaluar el espacio?\n\nGracias.",
      },
      opciones,
    ),
  },
];

fs.mkdirSync(salida, { recursive: true });
for (const caso of casos) {
  fs.writeFileSync(path.join(salida, `${caso.nombre}.html`), caso.html, "utf8");
  if (caso.texto) fs.writeFileSync(path.join(salida, `${caso.nombre}.txt`), caso.texto, "utf8");
}
console.log(`${casos.length} correos de ejemplo escritos en ${salida}`);
console.log(`Imágenes desde: ${baseImagenes}`);
