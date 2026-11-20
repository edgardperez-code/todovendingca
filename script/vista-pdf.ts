// Vista previa del PDF imprimible de las Gift Cards (server/gift-card-pdf.ts).
// Genera tres PDF de ejemplo con datos inventados; no toca la base ni envía nada.
//
//   npx tsx script/vista-pdf.ts [carpeta-de-salida]
//
// Sin carpeta, los deja en la carpeta temporal del sistema (tv-vista-pdf).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { crearPdfGiftCards, type GiftCardImprimible } from "../server/gift-card-pdf";

const salida = path.resolve(process.argv[2] ?? path.join(os.tmpdir(), "tv-vista-pdf"));

const EJEMPLOS: Array<{ archivo: string; pedido: string; tarjetas: GiftCardImprimible[] }> = [
  {
    archivo: "una-tarjeta-10.pdf",
    pedido: "TV-261120-K7M2Q",
    tarjetas: [{ codigo: "TV-H7KM-2QXP-9RWD", montoUsd: 10 }],
  },
  {
    archivo: "tres-tarjetas-10-25-50.pdf",
    pedido: "TV-261120-B4XWN",
    tarjetas: [
      { codigo: "TV-H7KM-2QXP-9RWD", montoUsd: 10 },
      { codigo: "TV-C3NV-8YLT-5GZA", montoUsd: 25 },
      { codigo: "TV-W9EJ-4FBS-6UHK", montoUsd: 50 },
    ],
  },
  {
    // Incluye casos raros: código de prueba (más largo), monto con decimales y
    // montos fuera del catálogo, para ver que todo sigue cabiendo.
    archivo: "diez-tarjetas.pdf",
    pedido: "TVP-261120-Z8D3R",
    tarjetas: [
      { codigo: "TV-A2BC-3DEF-4GHJ", montoUsd: 10 },
      { codigo: "TV-K5LM-6NPQ-7RST", montoUsd: 10 },
      { codigo: "TV-U8VW-9XYZ-2ABC", montoUsd: 25 },
      { codigo: "TV-D3EF-4GHJ-5KLM", montoUsd: 25 },
      { codigo: "TV-N6PQ-7RST-8UVW", montoUsd: 50 },
      { codigo: "TV-X9YZ-2ABC-3DEF", montoUsd: 50 },
      { codigo: "PRUEBA-TV-G4HJ-5KLM-6NPQ", montoUsd: 10 },
      { codigo: "PRUEBA-TV-R7ST-8UVW-9XYZ", montoUsd: 50 },
      { codigo: "TV-B2CD-3EFG-4HJK", montoUsd: 100 },
      { codigo: "TV-L5MN-6PQR-7STU", montoUsd: 12.5 },
    ],
  },
];

async function main() {
  fs.mkdirSync(salida, { recursive: true });
  for (const ejemplo of EJEMPLOS) {
    const inicio = performance.now();
    const pdf = await crearPdfGiftCards(ejemplo.tarjetas, ejemplo.pedido);
    const ms = Math.round(performance.now() - inicio);
    const ruta = path.join(salida, ejemplo.archivo);
    fs.writeFileSync(ruta, pdf);
    console.log(`${ruta}  ${ejemplo.tarjetas.length} hoja(s)  ${(pdf.length / 1024).toFixed(1)} KB  ${ms} ms`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
