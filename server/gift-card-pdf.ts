// PDF de las Gift Cards para imprimir, adjunto al correo del comprador.
//
// Una página tamaño carta por código. Cada página trae la tarjeta a tamaño
// real (85,6 x 54 mm, como una tarjeta bancaria) con su reverso debajo: se
// recorta por la línea continua y se dobla por la punteada, y queda una
// tarjeta con frente y dorso. El reverso va de cabeza para que, al doblar,
// se lea derecho.
//
// Diseño "Vitrina" (ver docs/rediseno-vitrina.md): el frente copia la tarjeta
// de la Tienda (client/src/components/gift-card-visual.tsx): plateada, azul o
// tinta de gabinete según el monto, con el logo, el monto y la ola de marca.
// El logo y la ola se dibujan vectoriales aquí mismo (no dependen de imágenes).
//
// Tipografías del sitio incrustadas: Bricolage Grotesque, Instrument Sans,
// IBM Plex Mono y Doto. Los archivos están en server/fuentes/ (la compilación
// los copia a dist/fuentes/). Si alguno no aparece o no se puede leer, ese
// texto sale en Helvetica o Courier: el PDF nunca falla por una fuente.
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { PRODUCTOS } from "@shared/catalogo";

export interface GiftCardImprimible {
  codigo: string;
  montoUsd: number;
}

type Doc = PDFKit.PDFDocument;

const MM = 72 / 25.4;
const ANCHO_TARJETA = 85.6 * MM;
const ALTO_TARJETA = 54 * MM;
const RADIO_ESQUINA = 3.2 * MM;

// Colores de la Vitrina (los mismos tokens de client/src/index.css).
const TINTA = "#15171A";
const TINTA2 = "#474C52";
const TINTA3 = "#5E646B";
const NARANJA = "#F26A21";
const AZUL = "#1F6FD6";
const AZUL_TARJETA = "#1B5FC0";
const MARINO = "#1B263C";
const PLATA_A = "#F6F7F5";
const PLATA_B = "#E3E6E4";
const PLATA_C = "#CDD1CF";
const PLATA_BORDE = "#B7BCBA";
const LINEA = "#D9D8D3";
const LED = "#8FE9FF";
const LED_FONDO = "#081217";
const BLANCO = "#FFFFFF";

// ---------------------------------------------------------------------------
// Tipografías
// ---------------------------------------------------------------------------

type Rol = "titulo" | "texto" | "textoFuerte" | "mono" | "monoFuerte" | "led";

// Archivo de cada rol y la fuente estándar del PDF que lo reemplaza si falta.
const FUENTES: Record<Rol, { archivo: string; respaldo: string }> = {
  titulo: { archivo: "bricolage-grotesque-latin-700-normal.ttf", respaldo: "Helvetica-Bold" },
  texto: { archivo: "instrument-sans-latin-400-normal.ttf", respaldo: "Helvetica" },
  textoFuerte: { archivo: "instrument-sans-latin-600-normal.ttf", respaldo: "Helvetica-Bold" },
  mono: { archivo: "ibm-plex-mono-latin-500-normal.ttf", respaldo: "Courier" },
  monoFuerte: { archivo: "ibm-plex-mono-latin-600-normal.ttf", respaldo: "Courier-Bold" },
  led: { archivo: "doto-latin-900-normal.ttf", respaldo: "Courier-Bold" },
};
const ROLES = Object.keys(FUENTES) as Rol[];

// Mismo patrón de rutas que usaba el logo: primero lo compilado (dist/), luego
// la carpeta del repositorio. En Railway existen las dos.
const archivosCache = new Map<string, Buffer | null>();
function leerFuente(archivo: string): Buffer | null {
  const guardada = archivosCache.get(archivo);
  if (guardada !== undefined) return guardada;
  const candidatos = [
    path.resolve(process.cwd(), "dist", "fuentes", archivo),
    path.resolve(process.cwd(), "server", "fuentes", archivo),
  ];
  let datos: Buffer | null = null;
  for (const ruta of candidatos) {
    try {
      datos = fs.readFileSync(ruta);
      break;
    } catch {
      // se prueba el siguiente
    }
  }
  if (!datos) console.error(`PDF de Gift Cards: no se encontró la fuente ${archivo}; se usa una estándar.`);
  archivosCache.set(archivo, datos);
  return datos;
}

type Fuentes = Record<Rol, string>;

const MUESTRA = "Código ÁÉÍÓÚ áéíóú Ññ ü $0123456789 · × % / + - : , . ( ) \"";

// Registra las fuentes en el documento. Cada una se abre aquí dentro de un
// try: si el archivo falta o está dañado, ese rol cae a su fuente estándar.
function prepararFuentes(doc: Doc, incrustar: boolean): Fuentes {
  const fuentes = {} as Fuentes;
  for (const rol of ROLES) {
    const { archivo, respaldo } = FUENTES[rol];
    fuentes[rol] = respaldo;
    if (!incrustar) continue;
    const datos = leerFuente(archivo);
    if (!datos) continue;
    try {
      const nombre = `tv-${rol}`;
      doc.registerFont(nombre, datos);
      // Abrirla y medir un texto de muestra destapa aquí un archivo dañado.
      doc.font(nombre).fontSize(10).widthOfString(MUESTRA);
      fuentes[rol] = nombre;
    } catch (error) {
      if (archivosCache.get(archivo)) {
        console.error(`PDF de Gift Cards: la fuente ${archivo} no se pudo abrir (${(error as Error).message}); se usa una estándar.`);
      }
      archivosCache.set(archivo, null);
    }
  }
  doc.font("Helvetica");
  return fuentes;
}

interface OpcionesTexto {
  // Separación entre letras, en puntos.
  espaciado?: number;
  // "izquierda" (por defecto): x es el borde izquierdo. "derecha": x es el
  // borde derecho. "centro": x es el centro.
  alinear?: "izquierda" | "derecha" | "centro";
  // Espacio extra entre palabras, en puntos.
  entrePalabras?: number;
}

function anchoTexto(doc: Doc, fuente: string, tamano: number, texto: string, espaciado = 0, entrePalabras = 0): number {
  doc.font(fuente).fontSize(tamano);
  // pdfkit suma el espaciado también después de la última letra: se descuenta.
  return doc.widthOfString(texto, { characterSpacing: espaciado, wordSpacing: entrePalabras }) - espaciado;
}

// Escribe una línea con la línea base en `base` (más preciso que la caja de
// línea de pdfkit, que cambia con cada fuente).
function escribir(
  doc: Doc,
  fuente: string,
  tamano: number,
  color: string,
  texto: string,
  x: number,
  base: number,
  opciones: OpcionesTexto = {},
) {
  const espaciado = opciones.espaciado ?? 0;
  const entrePalabras = opciones.entrePalabras ?? 0;
  let inicio = x;
  if (opciones.alinear === "derecha") inicio = x - anchoTexto(doc, fuente, tamano, texto, espaciado, entrePalabras);
  else if (opciones.alinear === "centro") inicio = x - anchoTexto(doc, fuente, tamano, texto, espaciado, entrePalabras) / 2;
  doc.font(fuente).fontSize(tamano).fillColor(color);
  const ascendente = ((doc as unknown as { _font: { ascender: number } })._font.ascender / 1000) * tamano;
  doc.text(texto, inicio, base - ascendente, { lineBreak: false, characterSpacing: espaciado, wordSpacing: entrePalabras });
}

// Mayor tamaño (entre `maximo` y `minimo`) con el que el texto cabe en `ancho`.
function tamanoQueCabe(
  doc: Doc,
  fuente: string,
  texto: string,
  ancho: number,
  maximo: number,
  minimo: number,
  espaciadoPorTamano = 0,
): number {
  let tamano = maximo;
  while (tamano > minimo && anchoTexto(doc, fuente, tamano, texto, tamano * espaciadoPorTamano) > ancho) tamano -= 0.25;
  return tamano;
}

function textoMonto(montoUsd: number): string {
  return Number.isInteger(montoUsd) ? String(montoUsd) : montoUsd.toFixed(2);
}

// ---------------------------------------------------------------------------
// Piezas de marca: logo y ola (vectoriales)
// ---------------------------------------------------------------------------

interface ColoresLogo {
  // Cuerpo de la máquina y trazos (currentColor en la web).
  tinta: string;
  // Relleno interior (--lf).
  fondo: string;
  rojo?: string; // --l2
  azul?: string; // --l3
  amarillo?: string; // --l4
  azulClaro?: string; // --l5
}

// Logo de Todo Vending CA: los mismos trazos de
// client/src/components/vitrina/logo.tsx (lienzo de 96 x 96).
function dibujarLogo(doc: Doc, x: number, y: number, tamano: number, colores: ColoresLogo) {
  const { tinta, fondo } = colores;
  const rojo = colores.rojo ?? "#F24A32";
  const azul = colores.azul ?? "#2D97D3";
  const amarillo = colores.amarillo ?? "#F6B21B";
  const azulClaro = colores.azulClaro ?? "#7FBDE6";
  const trazo = (d: string, grosor: number) => doc.path(d).lineWidth(grosor).lineCap("round").stroke(tinta);

  doc.save();
  doc.translate(x, y).scale(tamano / 96);
  doc.path("M26.5 31.2H4.6a15.6 15.6 0 0 1 21.9-13.9z").fill(rojo);
  doc.path("M26.5 43.6H4.6a15.6 15.6 0 0 0 21.9 13.9z").fill(azul);
  trazo("M13.5 37.3h13M8 65h18.5M15 71.6h11.5M32.3 84v4.3M67.8 84v4.3M28.8 88.3h7M64.3 88.3h7", 2.3);
  doc.rect(26.5, 6.5, 46, 77.5).fill(tinta);
  doc.path("M31.2 11h36.5v23H31.2zM31.2 36.2h36.5v22.3H31.2zM31.2 60.2h36.5v4.5H31.2zM37 69.6h25.5v6H37z").fill(fondo);
  trazo("M38.9 16.3h4M55.9 16.3h4M55.9 38.8h4", 1.7);
  doc.path("M36.3 33.5V21.8c0-2.6 2-4.3 4.6-4.3s4.6 1.7 4.6 4.3v11.7z").fill(rojo);
  doc.path("M53.3 33.5V21.8c0-2.6 2-4.3 4.6-4.3s4.6 1.7 4.6 4.3v11.7z").fill(azul);
  doc.path("M35.8 41.5h10.4v2H35.8zM36.3 45.2h9.4v12.8h-9.4z").fill(rojo);
  doc.path("M53.3 58V44.2c0-2.6 2-4.2 4.6-4.2s4.6 1.6 4.6 4.2V58z").fill(amarillo);
  trazo(
    "M31.8 33.5v-7.3a1.7 1.7 0 0 1 3.4 0v7.3M47.3 33.5v-7.3a1.7 1.7 0 0 1 3.4 0v7.3M64 33.5v-7.3a1.7 1.7 0 0 1 3.4 0v7.3" +
      "M53.6 31.3c0-7 8.6-7 8.6 0M53.6 27.8c0-5 8.6-5 8.6 0" +
      "M31.8 58v-7.3a1.7 1.7 0 0 1 3.4 0V58M47.3 58v-7.3a1.7 1.7 0 0 1 3.4 0V58M64 58v-7.3a1.7 1.7 0 0 1 3.4 0V58" +
      "M36.7 56c0-7 8.6-7 8.6 0M36.7 52.5c0-5 8.6-5 8.6 0M53.6 56c0-7 8.6-7 8.6 0M53.6 52.5c0-5 8.6-5 8.6 0",
    1.25,
  );
  doc.path("M31.2 34h36.5v2.2H31.2zM31.2 58.2h36.5v2H31.2z").fill(tinta);
  doc.rect(74.5, 6.5, 18, 77.5).fill(azulClaro);
  doc.rect(74.5, 15.5, 18, 36).fill(tinta);
  doc.rect(77.5, 17.8, 12, 23.6).fill(fondo);
  trazo("M81.3 38h.1M85.6 38h.1M79.2 55.2h2.4M84.9 55.2h2.4M79.2 59.5h2.4M84.9 59.5h2.4", 1.9);
  doc.path("M92.5 67.5a8.300 8.300 0 1 0 0 16.300z").fill(rojo);
  doc.restore();
}

// Logo + "TODO / VENDING CA" en dos líneas (la .v-marca de la web).
function dibujarMarca(doc: Doc, f: Fuentes, x: number, y: number, tamanoLogo: number, colorTexto: string, logo: ColoresLogo) {
  dibujarLogo(doc, x, y, tamanoLogo, logo);
  const tamano = tamanoLogo * 0.3;
  const centro = y + tamanoLogo * 0.49;
  const tx = x + tamanoLogo * 1.2;
  escribir(doc, f.titulo, tamano, colorTexto, "TODO", tx, centro - tamano * 0.16, { espaciado: tamano * 0.1 });
  escribir(doc, f.titulo, tamano, colorTexto, "VENDING CA", tx, centro + tamano * 0.96, { espaciado: tamano * 0.1 });
}

// Las franjas de la ola de marca (--ola en index.css; patrón de 240 x 56).
const OLA_FRANJAS: Array<{ d: string; color: string }> = [
  { d: "M0,7 Q60,1 120,7 T240,7 L240,17.9 Q180,23.9 120,17.9 T0,17.9Z", color: NARANJA },
  { d: "M0,17.5 Q60,11.5 120,17.5 T240,17.5 L240,28.4 Q180,34.4 120,28.4 T0,28.4Z", color: AZUL },
  { d: "M0,28 Q60,22 120,28 T240,28 L240,38.9 Q180,44.9 120,38.9 T0,38.9Z", color: NARANJA },
  { d: "M0,38.5 Q60,32.5 120,38.5 T240,38.5 L240,49 Q180,55 120,49 T0,49Z", color: AZUL },
];

// Pinta la ola repetida a lo ancho dentro del rectángulo dado. `franjas` es
// cuántas de las 4 franjas se dibujan (4 = la ola completa; 2 = una naranja y
// una azul). `desfase` corre el patrón, en fracción de su ancho.
function dibujarOla(
  doc: Doc,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  anchoPatron: number,
  franjas = 4,
  desfase = 0,
) {
  const altoLienzo = franjas >= 4 ? 56 : 14 + franjas * 10.5;
  doc.save();
  doc.rect(x, y, ancho, alto).clip();
  for (let tx = x - anchoPatron * desfase; tx < x + ancho; tx += anchoPatron) {
    doc.save();
    // Un pelo más ancho que el paso, para que no se vea la unión entre repeticiones.
    doc.translate(tx, y).scale((anchoPatron + 0.4) / 240, alto / altoLienzo);
    for (const franja of OLA_FRANJAS.slice(0, franjas)) doc.path(franja.d).fill(franja.color);
    doc.restore();
  }
  doc.restore();
}

// Ola corta de dos trazos que acompaña a las etiquetas (--ola-etiqueta, 30 x 12).
function dibujarOlaEtiqueta(doc: Doc, x: number, y: number, ancho: number) {
  doc.save();
  doc.translate(x, y).scale(ancho / 30);
  doc.path("M1,4 Q8,0 15,4 T29,4").lineWidth(2.4).lineCap("round").stroke(NARANJA);
  doc.path("M1,9 Q8,5 15,9 T29,9").lineWidth(2.4).lineCap("round").stroke(AZUL);
  doc.restore();
}

// ---------------------------------------------------------------------------
// La tarjeta
// ---------------------------------------------------------------------------

type Acabado = "plata" | "azul" | "tinta";

// Igual que en la Tienda: la primera Gift Card del catálogo es plateada, la
// segunda azul y la tercera tinta de gabinete; un monto fuera del catálogo, tinta.
const ACABADOS: Acabado[] = ["plata", "azul", "tinta"];
const MONTOS_CATALOGO: number[] = PRODUCTOS.filter((p) => p.esGiftCard).map((p) => p.precioUsd);

function acabadoDe(montoUsd: number): Acabado {
  const posicion = MONTOS_CATALOGO.indexOf(montoUsd);
  return posicion === -1 ? "tinta" : ACABADOS[posicion % ACABADOS.length];
}

const CARAS: Record<Acabado, { texto: string; logo: ColoresLogo }> = {
  plata: { texto: MARINO, logo: { tinta: MARINO, fondo: BLANCO } },
  azul: { texto: BLANCO, logo: { tinta: BLANCO, fondo: AZUL_TARJETA, azul: "#A9CCFF", azulClaro: "#A9CCFF" } },
  tinta: { texto: BLANCO, logo: { tinta: BLANCO, fondo: TINTA } },
};

// Placa blanca con el código en tinta: se lee igual impresa a color o en
// blanco y negro, sobre cualquiera de los tres acabados.
function dibujarPlacaCodigo(
  doc: Doc,
  f: Fuentes,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  codigo: string,
  tamanoMaximo: number,
  borde: string | null,
) {
  const radio = 1.1 * MM;
  doc.roundedRect(x, y, ancho, alto, radio).fill(BLANCO);
  if (borde) doc.roundedRect(x, y, ancho, alto, radio).lineWidth(0.6).stroke(borde);

  // Rótulo a la izquierda, separado por una línea, como una etiqueta de selección.
  const anchoRotulo = 12.5 * MM;
  const base = y + alto / 2;
  escribir(doc, f.mono, 5, TINTA3, "CÓDIGO", x + anchoRotulo / 2 + 0.3, base + 1.8, { espaciado: 0.9, alinear: "centro" });
  doc
    .moveTo(x + anchoRotulo, y + alto * 0.22)
    .lineTo(x + anchoRotulo, y + alto * 0.78)
    .lineWidth(0.5)
    .stroke(PLATA_BORDE);

  // El código se achica si es largo, para que quepa en una sola línea (el
  // mínimo de 3,5 pt alcanza para los 64 caracteres que admite el inventario).
  const hueco = ancho - anchoRotulo - 3 * MM;
  const tamano = tamanoQueCabe(doc, f.monoFuerte, codigo, hueco, tamanoMaximo, 3.5, 0.04);
  escribir(doc, f.monoFuerte, tamano, TINTA, codigo, x + anchoRotulo + (ancho - anchoRotulo) / 2, base + tamano * 0.34, {
    espaciado: tamano * 0.04,
    alinear: "centro",
  });
}

// Frente: la tarjeta de la Tienda (marca, monto y ola al pie) más el código.
function dibujarFrente(doc: Doc, f: Fuentes, x: number, y: number, tarjeta: GiftCardImprimible) {
  const w = ANCHO_TARJETA;
  const h = ALTO_TARJETA;
  const acabado = acabadoDe(tarjeta.montoUsd);
  const cara = CARAS[acabado];
  const monto = `$${textoMonto(tarjeta.montoUsd)}`;

  // Fondo del acabado.
  if (acabado === "plata") {
    const degradado = doc.linearGradient(x, y + h * 0.1, x + w, y + h * 0.9);
    degradado.stop(0, PLATA_B).stop(0.4, PLATA_A).stop(1, PLATA_C);
    doc.rect(x, y, w, h).fill(degradado);
  } else {
    doc.rect(x, y, w, h).fill(acabado === "azul" ? AZUL_TARJETA : TINTA);
  }

  // Ola de marca al pie (23 % del alto, patrón de 55,3 % del ancho, como en la web).
  const altoOla = h * 0.23;
  dibujarOla(doc, x, y + h - altoOla, w, altoOla, w * 0.553);

  const margenX = 6.2 * MM;
  const derecha = x + w - margenX;

  // Marca arriba a la izquierda y monto pequeño a la derecha.
  const tamanoLogo = 8.6 * MM;
  const arriba = y + 4.3 * MM;
  dibujarMarca(doc, f, x + margenX, arriba, tamanoLogo, cara.texto, cara.logo);
  escribir(doc, f.monoFuerte, 11, cara.texto, monto, derecha, arriba + tamanoLogo / 2 + 3.9, { alinear: "derecha", espaciado: 0.2 });

  // Etiqueta y monto grande.
  escribir(doc, f.mono, 6.6, cara.texto, "GIFT CARD", x + margenX, y + 17.4 * MM, { espaciado: 1.45 });
  const baseMonto = y + 29.1 * MM;
  const tamanoMonto = tamanoQueCabe(doc, f.titulo, monto, w * 0.5, 36, 16, -0.04);
  escribir(doc, f.titulo, tamanoMonto, cara.texto, monto, x + margenX - tamanoMonto * 0.03, baseMonto, {
    espaciado: -tamanoMonto * 0.04,
  });

  // Lema a la derecha del monto.
  escribir(doc, f.textoFuerte, 5.8, cara.texto, "Snacks · Bebidas · Café", derecha, baseMonto - 8.2, { alinear: "derecha", entrePalabras: 0.9 });
  doc.save();
  doc.fillOpacity(acabado === "plata" ? 0.75 : 0.8);
  escribir(doc, f.texto, 5.8, cara.texto, "Todo Vending y Café Oriente", derecha, baseMonto - 0.6, { alinear: "derecha" });
  doc.restore();

  // Código.
  dibujarPlacaCodigo(
    doc,
    f,
    x + margenX,
    y + 32.6 * MM,
    w - margenX * 2,
    7.6 * MM,
    tarjeta.codigo,
    12,
    acabado === "plata" ? PLATA_BORDE : null,
  );
}

// Reverso: fondo blanco con la marca y cómo usarla. Va rotado 180 grados.
function dibujarReverso(doc: Doc, f: Fuentes, x: number, y: number, tarjeta: GiftCardImprimible, numeroPedido: string) {
  const w = ANCHO_TARJETA;
  const h = ALTO_TARJETA;
  doc.save();
  doc.rotate(180, { origin: [x + w / 2, y + h / 2] });

  doc.rect(x, y, w, h).fill(BLANCO);

  const margen = 5.2 * MM;
  const derecha = x + w - margen;
  const anchoUtil = w - margen * 2;

  // Marca y valor.
  const tamanoLogo = 7.6 * MM;
  const arriba = y + 4.2 * MM;
  dibujarMarca(doc, f, x + margen, arriba, tamanoLogo, TINTA, { tinta: TINTA, fondo: BLANCO });
  escribir(doc, f.titulo, 10.5, TINTA, `Vale por $${textoMonto(tarjeta.montoUsd)}`, derecha, arriba + tamanoLogo / 2 + 3.6, {
    alinear: "derecha",
    espaciado: -0.1,
  });

  doc.moveTo(x + margen, y + 14.1 * MM).lineTo(derecha, y + 14.1 * MM).lineWidth(0.5).stroke(LINEA);

  // Cómo usarla.
  doc.font(f.texto).fontSize(6.3).fillColor(TINTA);
  doc.text(
    "Úsala en las máquinas de Todo Vending CA y Café Oriente. Cada código se puede usar una sola vez: guárdala como si fuera efectivo.",
    x + margen,
    y + 16 * MM,
    { width: anchoUtil, lineGap: 1.1 },
  );

  // Código, otra vez en placa (con borde, porque el fondo es blanco).
  dibujarPlacaCodigo(doc, f, x + margen, y + 27.6 * MM, anchoUtil, 7.2 * MM, tarjeta.codigo, 11, TINTA);

  // Pedido y contacto.
  const basePie = y + 40.3 * MM;
  escribir(doc, f.mono, 5.6, TINTA2, `Pedido: ${numeroPedido}`, x + margen, basePie, { espaciado: 0.15 });
  const contacto = "WhatsApp +58 414-616-4177  ·  todovendingca.com";
  const tamanoContacto = tamanoQueCabe(doc, f.textoFuerte, contacto, anchoUtil, 6.2, 4.5);
  escribir(doc, f.textoFuerte, tamanoContacto, TINTA, contacto, x + margen, basePie + 9.6);

  // Ola fina al pie (una franja naranja y una azul).
  const altoOla = 5.2 * MM;
  dibujarOla(doc, x, y + h - altoOla, w, altoOla, w * 0.553, 2, 0.25);

  doc.restore();
}

// ---------------------------------------------------------------------------
// La página
// ---------------------------------------------------------------------------

// Pantalla LED pequeña (la de la columna de la máquina) con el número de hoja.
function dibujarChipLed(doc: Doc, f: Fuentes, derecha: number, y: number, texto: string) {
  const tamano = 11;
  const relleno = 7;
  const ancho = anchoTexto(doc, f.led, tamano, texto, 0.6) + relleno * 2;
  const alto = 17;
  doc.roundedRect(derecha - ancho, y, ancho, alto, 3).fill(LED_FONDO);
  escribir(doc, f.led, tamano, LED, texto, derecha - ancho + relleno, y + alto / 2 + tamano * 0.33, { espaciado: 0.6 });
}

// Una página: instrucciones, la tarjeta (frente + reverso) y una regla para
// comprobar que se imprimió a tamaño real.
function dibujarPagina(
  doc: Doc,
  f: Fuentes,
  tarjeta: GiftCardImprimible,
  numeroPedido: string,
  numeroHoja: number,
  totalHojas: number,
) {
  const anchoPagina = doc.page.width;
  const altoPagina = doc.page.height;
  const margenPagina = 54;
  const derechaPagina = anchoPagina - margenPagina;
  const anchoUtil = anchoPagina - margenPagina * 2;
  const centro = anchoPagina / 2;

  // Cabecera: marca a la izquierda; pedido y número de hoja a la derecha.
  dibujarMarca(doc, f, margenPagina, 30, 26, TINTA, { tinta: TINTA, fondo: BLANCO });
  const hoja = `${String(numeroHoja).padStart(2, "0")}/${String(totalHojas).padStart(2, "0")}`;
  dibujarChipLed(doc, f, derechaPagina, 34.5, hoja);
  const anchoChip = anchoTexto(doc, f.led, 11, hoja, 0.6) + 14;
  escribir(doc, f.mono, 7, TINTA3, `PEDIDO ${numeroPedido}`, derechaPagina - anchoChip - 9, 45.6, {
    alinear: "derecha",
    espaciado: 0.7,
  });
  doc.moveTo(margenPagina, 64).lineTo(derechaPagina, 64).lineWidth(0.6).stroke(LINEA);

  // Título e instrucciones.
  const titulo = `Gift Card Todo Vending de $${textoMonto(tarjeta.montoUsd)}`;
  const tamanoTitulo = tamanoQueCabe(doc, f.titulo, titulo, anchoUtil, 21, 12, -0.02);
  escribir(doc, f.titulo, tamanoTitulo, TINTA, titulo, centro, 93, { alinear: "centro", espaciado: -tamanoTitulo * 0.02 });
  doc.font(f.texto).fontSize(9.2).fillColor(TINTA2);
  doc.text(
    "Imprime esta hoja a tamaño real (100 %, sin \"Ajustar a la página\"). Recorta por la línea continua y dobla por la línea punteada: te queda la tarjeta con su frente y su reverso, del tamaño de una tarjeta bancaria (8,56 × 5,4 cm).",
    margenPagina + 48,
    103,
    { width: anchoUtil - 96, align: "center", lineGap: 2.2 },
  );

  const x = (anchoPagina - ANCHO_TARJETA) / 2;
  const y = 160;
  const altoTotal = ALTO_TARJETA * 2;

  // Frente arriba y reverso abajo, recortados juntos con esquinas redondeadas.
  doc.save();
  doc.roundedRect(x, y, ANCHO_TARJETA, altoTotal, RADIO_ESQUINA).clip();
  dibujarFrente(doc, f, x, y, tarjeta);
  dibujarReverso(doc, f, x, y + ALTO_TARJETA, tarjeta, numeroPedido);
  doc.restore();

  // Línea de corte (continua) y de doblez (punteada).
  doc.save();
  doc.lineWidth(0.6).strokeColor("#8E9493");
  doc.roundedRect(x, y, ANCHO_TARJETA, altoTotal, RADIO_ESQUINA).stroke();
  doc.dash(3, { space: 3 }).strokeColor(TINTA3);
  // Solo en los márgenes: así no queda impresa sobre el canto de la tarjeta
  // doblada (dentro, el cambio de color entre frente y reverso marca el doblez).
  doc.moveTo(x - 8 * MM, y + ALTO_TARJETA).lineTo(x - 1, y + ALTO_TARJETA).stroke();
  doc.moveTo(x + ANCHO_TARJETA + 1, y + ALTO_TARJETA).lineTo(x + ANCHO_TARJETA + 8 * MM, y + ALTO_TARJETA).stroke();
  doc.undash();
  doc.restore();
  escribir(doc, f.mono, 6, TINTA3, "DOBLAR", x + ANCHO_TARJETA + 9.5 * MM, y + ALTO_TARJETA + 2.1, { espaciado: 0.9 });
  escribir(doc, f.mono, 6, TINTA3, "RECORTAR", x + RADIO_ESQUINA, y - 5, { espaciado: 0.9 });

  // Regla de 5 cm para comprobar la escala.
  const reglaY = y + altoTotal + 40;
  const reglaX = (anchoPagina - 50 * MM) / 2;
  doc.save();
  doc.lineWidth(0.8).strokeColor(TINTA);
  doc.moveTo(reglaX, reglaY).lineTo(reglaX + 50 * MM, reglaY).stroke();
  for (let cm = 0; cm <= 5; cm++) {
    const tx = reglaX + cm * 10 * MM;
    doc.moveTo(tx, reglaY - 4).lineTo(tx, reglaY + 4).stroke();
  }
  doc.restore();
  for (let cm = 0; cm <= 5; cm++) {
    escribir(doc, f.mono, 5.5, TINTA3, String(cm), reglaX + cm * 10 * MM, reglaY - 7, { alinear: "centro" });
  }
  escribir(
    doc,
    f.texto,
    8,
    TINTA3,
    "Esta línea debe medir 5 cm. Si mide distinto, revisa la escala de impresión.",
    centro,
    reglaY + 17,
    { alinear: "centro" },
  );

  // Pie: la ola de marca y la dirección de la web.
  const pieY = altoPagina - 76;
  dibujarOla(doc, margenPagina, pieY, anchoUtil, 22, 94);
  dibujarOlaEtiqueta(doc, margenPagina, pieY + 30.5, 15);
  escribir(doc, f.mono, 6.5, TINTA3, "GIFT CARD", margenPagina + 20, pieY + 36, { espaciado: 1.2 });
  escribir(doc, f.mono, 6.5, TINTA3, "TODOVENDINGCA.COM", derechaPagina, pieY + 36, { alinear: "derecha", espaciado: 1.2 });
}

function generar(tarjetas: GiftCardImprimible[], numeroPedido: string, incrustarFuentes: boolean): Promise<Buffer> {
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
      const fuentes = prepararFuentes(doc, incrustarFuentes);
      tarjetas.forEach((tarjeta, i) => {
        doc.addPage();
        dibujarPagina(doc, fuentes, tarjeta, numeroPedido, i + 1, tarjetas.length);
      });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Devuelve el PDF con una página por Gift Card. Si algo falla al usar las
// tipografías incrustadas, se genera de nuevo solo con las estándar del PDF.
export function crearPdfGiftCards(tarjetas: GiftCardImprimible[], numeroPedido: string): Promise<Buffer> {
  return generar(tarjetas, numeroPedido, true).catch((error) => {
    console.error(`PDF de Gift Cards: falló con las tipografías incrustadas (${(error as Error).message}); se usan las estándar.`);
    return generar(tarjetas, numeroPedido, false);
  });
}
