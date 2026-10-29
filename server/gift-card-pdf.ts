// PDF de las Gift Cards para imprimir, adjunto al correo del comprador.
//
// Una pagina tamano carta por codigo. Cada pagina trae la tarjeta a tamano
// real (85,6 x 54 mm, como una tarjeta bancaria) con su reverso debajo: se
// recorta por la linea continua y se dobla por la punteada, y queda una
// tarjeta con frente y dorso. El reverso va de cabeza para que, al doblar,
// se lea derecho.
//
// Solo usa las fuentes estandar del PDF (Helvetica y Courier), asi que no hay
// que cargar archivos de fuentes. El logo sale de client/public/logo.png (o de
// dist/public en produccion); si no se encuentra, la tarjeta sale sin el.
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

export interface GiftCardImprimible {
  codigo: string;
  montoUsd: number;
}

const MM = 72 / 25.4;
const ANCHO_TARJETA = 85.6 * MM;
const ALTO_TARJETA = 54 * MM;
const RADIO_ESQUINA = 3.2 * MM;

// Colores de la marca (los mismos de la pagina: primary y accent).
const VERDE = "#10BC99";
const AZUL = "#3C71DD";
const OSCURO = "#1F2937";
const GRIS = "#6B7280";

// Parte del logo.png (512 x 512) donde esta el dibujo; el resto es blanco.
const LOGO_RECORTE = { x: 40, y: 185, ancho: 435, alto: 145 };

let logoCache: Buffer | null | undefined;
function logo(): Buffer | null {
  if (logoCache !== undefined) return logoCache;
  const candidatos = [
    path.resolve(process.cwd(), "dist", "public", "logo.png"),
    path.resolve(process.cwd(), "client", "public", "logo.png"),
  ];
  logoCache = null;
  for (const ruta of candidatos) {
    try {
      logoCache = fs.readFileSync(ruta);
      break;
    } catch {
      // se prueba el siguiente
    }
  }
  return logoCache;
}

function textoMonto(montoUsd: number): string {
  return Number.isInteger(montoUsd) ? String(montoUsd) : montoUsd.toFixed(2);
}

// Logo dentro de una pastilla blanca (o "Todo Vending CA" en texto si falta).
function dibujarLogo(doc: PDFKit.PDFDocument, x: number, y: number, ancho: number, alto: number) {
  doc.save();
  doc.roundedRect(x, y, ancho, alto, alto / 2).fill("#FFFFFF");
  const imagen = logo();
  const relleno = 4;
  if (imagen) {
    const escala = Math.min((ancho - relleno * 4) / LOGO_RECORTE.ancho, (alto - relleno * 2) / LOGO_RECORTE.alto);
    const visibleAncho = LOGO_RECORTE.ancho * escala;
    const visibleAlto = LOGO_RECORTE.alto * escala;
    const vx = x + (ancho - visibleAncho) / 2;
    const vy = y + (alto - visibleAlto) / 2;
    doc.rect(vx, vy, visibleAncho, visibleAlto).clip();
    doc.image(imagen, vx - LOGO_RECORTE.x * escala, vy - LOGO_RECORTE.y * escala, { width: 512 * escala });
  } else {
    doc.fillColor(OSCURO).font("Helvetica-Bold").fontSize(9);
    doc.text("Todo Vending CA", x, y + alto / 2 - 5, { width: ancho, align: "center", lineBreak: false });
  }
  doc.restore();
}

// Frente: degradado de la marca, logo, monto y codigo.
function dibujarFrente(doc: PDFKit.PDFDocument, x: number, y: number, tarjeta: GiftCardImprimible) {
  const w = ANCHO_TARJETA;
  const h = ALTO_TARJETA;

  doc.save();
  doc.rect(x, y, w, h).clip();
  const degradado = doc.linearGradient(x, y, x + w, y + h);
  degradado.stop(0, VERDE).stop(0.55, VERDE).stop(1, AZUL);
  doc.rect(x, y, w, h).fill(degradado);
  // Brillos decorativos.
  doc.fillOpacity(0.14).circle(x + w * 0.92, y + h * 0.05, h * 0.55).fill("#FFFFFF");
  doc.fillOpacity(0.18).circle(x + w * 0.05, y + h * 1.05, h * 0.5).fill(AZUL);
  doc.fillOpacity(1);
  doc.restore();

  const margen = 4.5 * MM;
  dibujarLogo(doc, x + margen, y + margen, 31 * MM, 10 * MM);

  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(7.5);
  doc.text("GIFT CARD", x + w - margen - 40 * MM, y + margen + 3.2 * MM, {
    width: 40 * MM,
    align: "right",
    characterSpacing: 1.6,
    lineBreak: false,
  });

  // Codigo en una franja translucida.
  const franjaY = y + 20.5 * MM;
  const franjaAlto = 8.5 * MM;
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(5.5);
  doc.text("CÓDIGO", x + margen, franjaY - 3 * MM, { characterSpacing: 1, lineBreak: false });
  doc.save();
  doc.fillOpacity(0.22).roundedRect(x + margen, franjaY, w - margen * 2, franjaAlto, 1.5 * MM).fill("#FFFFFF");
  doc.restore();
  // El codigo se achica si es largo, para que quepa en una sola linea.
  const anchoCodigo = w - margen * 2 - 4 * MM;
  let tamano = 12;
  doc.font("Courier-Bold");
  while (tamano > 5 && doc.fontSize(tamano).widthOfString(tarjeta.codigo) > anchoCodigo) tamano -= 0.5;
  doc.fillColor("#FFFFFF").fontSize(tamano);
  doc.text(tarjeta.codigo, x + margen + 2 * MM, franjaY + (franjaAlto - tamano * 0.7) / 2, {
    width: anchoCodigo,
    align: "center",
    lineBreak: false,
  });

  // Monto abajo a la izquierda.
  const monto = textoMonto(tarjeta.montoUsd);
  const baseMonto = y + h - margen;
  doc.font("Helvetica-Bold").fontSize(15).fillColor("#FFFFFF");
  doc.text("$", x + margen, baseMonto - 34, { lineBreak: false });
  doc.fontSize(36);
  doc.text(monto, x + margen + 9.5, baseMonto - 33, { lineBreak: false });

  // Pie abajo a la derecha.
  doc.font("Helvetica").fontSize(6).fillColor("#FFFFFF");
  doc.text("Snacks · Bebidas · Café", x + w - margen - 40 * MM, baseMonto - 15, {
    width: 40 * MM,
    align: "right",
    lineBreak: false,
  });
  doc.text("Todo Vending y Café Oriente", x + w - margen - 40 * MM, baseMonto - 7, {
    width: 40 * MM,
    align: "right",
    lineBreak: false,
  });
}

// Reverso: fondo blanco con el logo y como usarla. Va rotado 180 grados.
function dibujarReverso(doc: PDFKit.PDFDocument, x: number, y: number, tarjeta: GiftCardImprimible, numeroPedido: string) {
  const w = ANCHO_TARJETA;
  const h = ALTO_TARJETA;
  doc.save();
  doc.rotate(180, { origin: [x + w / 2, y + h / 2] });

  doc.rect(x, y, w, h).fill("#FFFFFF");
  doc.rect(x, y, w, 2 * MM).fill(VERDE);

  const margen = 4.5 * MM;
  dibujarLogo(doc, x + margen - 2 * MM, y + 4 * MM, 31 * MM, 10 * MM);

  doc.fillColor(OSCURO).font("Helvetica-Bold").fontSize(8);
  doc.text(`Vale por $${textoMonto(tarjeta.montoUsd)}`, x + w - margen - 40 * MM, y + 7.3 * MM, {
    width: 40 * MM,
    align: "right",
    lineBreak: false,
  });

  doc.fillColor(OSCURO).font("Helvetica").fontSize(6.3);
  doc.text(
    "Úsala en las máquinas de Todo Vending CA y Café Oriente. Cada código se puede usar una sola vez: guárdala como si fuera efectivo.",
    x + margen,
    y + 17 * MM,
    { width: w - margen * 2, lineGap: 1.2 },
  );

  doc.fillColor(GRIS).fontSize(5.6);
  doc.text(`Código: ${tarjeta.codigo}`, x + margen, y + h - 15 * MM, { width: w - margen * 2, lineBreak: false });
  doc.text(`Pedido: ${numeroPedido}`, x + margen, y + h - 11.5 * MM, { width: w - margen * 2, lineBreak: false });
  doc.fillColor(OSCURO).font("Helvetica-Bold").fontSize(6);
  doc.text("WhatsApp +58 414-616-4177  ·  todovendingca.com", x + margen, y + h - 7 * MM, {
    width: w - margen * 2,
    lineBreak: false,
  });
  doc.restore();
}

// Una pagina: instrucciones, la tarjeta (frente + reverso) y una regla para
// comprobar que se imprimio a tamano real.
function dibujarPagina(doc: PDFKit.PDFDocument, tarjeta: GiftCardImprimible, numeroPedido: string) {
  const anchoPagina = doc.page.width;
  const margenPagina = 54;

  doc.fillColor(OSCURO).font("Helvetica-Bold").fontSize(18);
  doc.text(`Gift Card Todo Vending de $${textoMonto(tarjeta.montoUsd)}`, margenPagina, 54, {
    width: anchoPagina - margenPagina * 2,
    align: "center",
  });
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(10).fillColor(GRIS);
  doc.text(
    "Imprime esta hoja a tamaño real (100 %, sin \"Ajustar a la página\"). Recorta por la línea continua y dobla por la línea punteada: te queda la tarjeta con su frente y su reverso, del tamaño de una tarjeta bancaria (8,56 × 5,4 cm).",
    { width: anchoPagina - margenPagina * 2, align: "center", lineGap: 2 },
  );

  const x = (anchoPagina - ANCHO_TARJETA) / 2;
  const y = 160;
  const altoTotal = ALTO_TARJETA * 2;

  // Frente arriba y reverso abajo, recortados juntos con esquinas redondeadas.
  doc.save();
  doc.roundedRect(x, y, ANCHO_TARJETA, altoTotal, RADIO_ESQUINA).clip();
  dibujarFrente(doc, x, y, tarjeta);
  dibujarReverso(doc, x, y + ALTO_TARJETA, tarjeta, numeroPedido);
  doc.restore();

  // Linea de corte (continua) y de doblez (punteada).
  doc.save();
  doc.lineWidth(0.6).strokeColor("#9CA3AF");
  doc.roundedRect(x, y, ANCHO_TARJETA, altoTotal, RADIO_ESQUINA).stroke();
  doc.dash(3, { space: 3 }).strokeColor(GRIS);
  doc.moveTo(x - 8 * MM, y + ALTO_TARJETA).lineTo(x + ANCHO_TARJETA + 8 * MM, y + ALTO_TARJETA).stroke();
  doc.undash();
  doc.restore();
  doc.font("Helvetica").fontSize(7).fillColor(GRIS);
  doc.text("doblar", x + ANCHO_TARJETA + 9 * MM, y + ALTO_TARJETA - 3.5, { lineBreak: false });
  doc.text("recortar", x - 2, y - 12, { lineBreak: false });

  // Regla de 5 cm para comprobar la escala.
  const reglaY = y + altoTotal + 40;
  const reglaX = (anchoPagina - 50 * MM) / 2;
  doc.save();
  doc.lineWidth(0.8).strokeColor(OSCURO);
  doc.moveTo(reglaX, reglaY).lineTo(reglaX + 50 * MM, reglaY).stroke();
  for (let cm = 0; cm <= 5; cm++) {
    const tx = reglaX + cm * 10 * MM;
    doc.moveTo(tx, reglaY - 4).lineTo(tx, reglaY + 4).stroke();
  }
  doc.restore();
  doc.font("Helvetica").fontSize(8).fillColor(GRIS);
  doc.text("Esta línea debe medir 5 cm. Si mide distinto, revisa la escala de impresión.", margenPagina, reglaY + 10, {
    width: anchoPagina - margenPagina * 2,
    align: "center",
  });
}

// Devuelve el PDF con una pagina por Gift Card.
export function crearPdfGiftCards(tarjetas: GiftCardImprimible[], numeroPedido: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      autoFirstPage: false,
      info: { Title: `Gift Cards Todo Vending - Pedido ${numeroPedido}`, Author: "Todo Vending CA" },
    });
    const partes: Buffer[] = [];
    doc.on("data", (parte: Buffer) => partes.push(parte));
    doc.on("end", () => resolve(Buffer.concat(partes)));
    doc.on("error", reject);
    try {
      for (const tarjeta of tarjetas) {
        doc.addPage();
        dibujarPagina(doc, tarjeta, numeroPedido);
      }
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
