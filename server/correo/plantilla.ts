// Plantilla base de los correos de Todo Vending CA con el diseño "Vitrina":
// cabecera negra de gabinete con el logo y la ola naranja/azul, cuerpo claro
// cálido y pie de gabinete.
//
// Es HTML de CORREO, no de web: todo va en tablas con estilos en línea, ancho
// máximo de 600 px, sin flex/grid/position ni SVG. Las fuentes web se declaran
// con respaldo seguro (se ven donde el cliente de correo las admite) y las
// imágenes son PNG servidos por la web (client/public/correo/, con la versión
// en el nombre). Cada pieza lleva su color de fondo y de texto explícito para
// que el correo se lea igual con las imágenes bloqueadas o si el cliente
// invierte colores.
//
// IMPORTANTE: estas funciones NO escapan nada. Todo texto que venga de fuera
// (comprador, pasarela, formulario) debe llegar ya escapado por quien llama
// (escaparHtml en server/email.ts).

// De dónde salen las imágenes en producción. Solo la vista previa local
// (script/vista-correos.ts) la sustituye, pasando `baseImagenes`.
export const BASE_IMAGENES_CORREO = 'https://www.todovendingca.com/correo';

export interface OpcionesCorreo {
  // URL base de las imágenes, sin barra final. Por defecto, la de producción.
  baseImagenes?: string;
}

export function baseImagenesDe(opciones?: OpcionesCorreo): string {
  return (opciones?.baseImagenes ?? BASE_IMAGENES_CORREO).replace(/\/+$/, '');
}

// Colores de la maqueta Vitrina (client/src/index.css), fijos en modo claro.
export const COLOR = {
  fondo: '#ECE9E1',
  papel: '#FAF9F5',
  blanco: '#FFFFFF',
  linea: '#DDD9CE',
  tinta: '#15171A',
  tinta2: '#474C52',
  tinta3: '#5E646B',
  naranja: '#F26A21',
  naranjaTexto: '#B4420A',
  azul: '#1F6FD6',
  azulTexto: '#1A57B8',
  gabinete: '#15171A',
  gabineteBorde: '#2B3036',
  sobreGabinete: '#FFFFFF',
  sobreGabinete2: '#B8BDC3',
  led: '#8FE9FF',
  ledTenue: '#6FB4C6',
  ledFondo: '#081217',
} as const;

export const FUENTE = {
  titular: "'Bricolage Grotesque','Segoe UI',Helvetica,Arial,sans-serif",
  texto: "'Instrument Sans','Segoe UI',Helvetica,Arial,sans-serif",
  mono: "'IBM Plex Mono',Consolas,'Courier New',monospace",
} as const;

const FUENTES_WEB =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap';

// --- Piezas del cuerpo ---

export function parrafo(html: string, margen = '0 0 16px'): string {
  return `<p style="margin:${margen};font-family:${FUENTE.texto};font-size:16px;line-height:1.55;color:${COLOR.tinta};word-break:break-word;overflow-wrap:anywhere;">${html}</p>`;
}

// Título de sección: etiqueta mono con la doble raya naranja/azul de la ola.
export function tituloSeccion(texto: string, margen = '32px 0 12px'): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${margen};">
  <tr>
    <td valign="middle" style="padding:0 10px 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td width="22" height="3" bgcolor="${COLOR.naranja}" style="width:22px;height:3px;font-size:3px;line-height:3px;mso-line-height-rule:exactly;background-color:${COLOR.naranja};">&nbsp;</td></tr>
        <tr><td width="22" height="3" style="width:22px;height:3px;font-size:3px;line-height:3px;mso-line-height-rule:exactly;">&nbsp;</td></tr>
        <tr><td width="22" height="3" bgcolor="${COLOR.azul}" style="width:22px;height:3px;font-size:3px;line-height:3px;mso-line-height-rule:exactly;background-color:${COLOR.azul};">&nbsp;</td></tr>
      </table>
    </td>
    <td valign="middle">
      <h2 style="margin:0;font-family:${FUENTE.titular};font-size:20px;line-height:1.2;font-weight:700;letter-spacing:-0.2px;color:${COLOR.tinta};">${texto}</h2>
    </td>
  </tr>
</table>`;
}

const AVISOS = {
  // Ámbar: compra de prueba y avisos al comprador.
  aviso: { barra: '#E09A00', fondo: '#FFF3CF', texto: '#5A3A00' },
  // Rojo: algo que el negocio debe atender ya (pago sin stock).
  alerta: { barra: '#D92D20', fondo: '#FDE4E0', texto: '#7A1A12' },
} as const;

// Recuadro de aviso con barra de color a la izquierda.
export function aviso(tipo: keyof typeof AVISOS, html: string, margen = '0 0 20px'): string {
  const c = AVISOS[tipo];
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margen};">
  <tr>
    <td width="5" bgcolor="${c.barra}" style="width:5px;font-size:0;line-height:0;background-color:${c.barra};">&nbsp;</td>
    <td bgcolor="${c.fondo}" style="padding:13px 15px;background-color:${c.fondo};font-family:${FUENTE.texto};font-size:14px;line-height:1.5;color:${c.texto};">${html}</td>
  </tr>
</table>`;
}

// Tabla "etiqueta / valor". En pantallas anchas van lado a lado; en un celular
// el valor baja debajo de su etiqueta (bloques en línea, sin media queries).
// Las filas vacías ('' o null) se saltan.
export function tablaDatos(filas: Array<{ etiqueta: string; valorHtml: string } | null>): string {
  const validas = filas.filter((f): f is { etiqueta: string; valorHtml: string } => f !== null);
  const html = validas
    .map((f, i) => {
      const borde = i === validas.length - 1 ? '' : `border-bottom:1px solid ${COLOR.linea};`;
      return `
  <tr>
    <td style="padding:11px 16px 10px;${borde}font-size:0;line-height:0;">
      <!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="190" valign="top"><![endif]-->
      <div style="display:inline-block;width:190px;max-width:100%;vertical-align:top;padding:2px 0;font-family:${FUENTE.mono};font-size:11px;line-height:20px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:${COLOR.tinta3};">${f.etiqueta}</div>
      <!--[if mso]></td><td valign="top"><![endif]-->
      <div style="display:inline-block;min-width:200px;max-width:100%;vertical-align:top;padding:2px 0;font-family:${FUENTE.texto};font-size:16px;line-height:20px;font-weight:600;color:${COLOR.tinta};word-break:break-word;overflow-wrap:anywhere;">${f.valorHtml}</div>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>`;
    })
    .join('');
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.blanco}" style="background-color:${COLOR.blanco};border:1px solid ${COLOR.linea};border-radius:12px;border-collapse:separate;">${html}
</table>`;
}

export function enlace(href: string, textoHtml: string): string {
  return `<a href="${href}" style="color:${COLOR.azulTexto};text-decoration:underline;">${textoHtml}</a>`;
}

// Botón principal (naranja con canto de tinta). En Outlook de escritorio se
// dibuja con VML, que necesita un ancho fijo: de ahí `ancho`.
export function boton(href: string, texto: string, ancho = 260): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
  <tr>
    <td>
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:46px;v-text-anchor:middle;width:${ancho}px;" arcsize="20%" strokecolor="${COLOR.tinta}" strokeweight="1.5pt" fillcolor="${COLOR.naranja}">
        <w:anchorlock/>
        <center style="color:${COLOR.tinta};font-family:'Segoe UI',Arial,sans-serif;font-size:15px;font-weight:bold;">${texto}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${href}" style="display:inline-block;background-color:${COLOR.naranja};border:2px solid ${COLOR.tinta};border-bottom:5px solid ${COLOR.tinta};border-radius:10px;padding:11px 22px;font-family:${FUENTE.texto};font-size:15px;line-height:20px;font-weight:700;color:${COLOR.tinta};text-decoration:none;">${texto}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

// Lista de pasos con códigos de selección de la máquina (A1, A2…).
export function listaCodigos(itemsHtml: string[]): string {
  const filas = itemsHtml
    .map(
      (item, i) => `
  <tr>
    <td width="46" valign="top" style="width:46px;padding:0 0 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td bgcolor="${COLOR.gabinete}" style="background-color:${COLOR.gabinete};border-radius:6px;padding:3px 8px;font-family:${FUENTE.mono};font-size:12px;line-height:18px;font-weight:600;letter-spacing:.5px;color:${COLOR.sobreGabinete};">A${i + 1}</td>
      </tr></table>
    </td>
    <td valign="top" style="padding:1px 0 12px;font-family:${FUENTE.texto};font-size:15px;line-height:1.55;color:${COLOR.tinta};">${item}</td>
  </tr>`,
    )
    .join('');
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${filas}
</table>`;
}

// Pantalla LED de la máquina: fondo casi negro y cifras celestes.
// `lineaSuperior` e `lineaInferior` son etiquetas pequeñas; `cifra` es lo grande.
export function pantallaLed(partes: { lineaSuperior?: string; cifra: string; lineaInferior?: string }): string {
  // Cada línea va en su propia celda: Outlook de escritorio solo respeta el
  // relleno (padding) en las celdas. La cifra va en IBM Plex Mono (no en Doto)
  // para que el punto decimal no se confunda con una coma.
  const etiqueta = (html: string, relleno: string) =>
    `<tr><td style="padding:${relleno};font-family:${FUENTE.mono};font-size:12px;line-height:18px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.ledTenue};">${html}</td></tr>`;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td bgcolor="${COLOR.ledFondo}" style="background-color:${COLOR.ledFondo};border:1px solid ${COLOR.gabineteBorde};border-radius:12px;padding:18px 20px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${partes.lineaSuperior ? etiqueta(partes.lineaSuperior, '0 0 6px') : ''}
        <tr><td style="font-family:${FUENTE.mono};font-size:40px;line-height:46px;font-weight:600;letter-spacing:.5px;color:${COLOR.led};word-break:break-word;overflow-wrap:anywhere;">${partes.cifra}</td></tr>
        ${partes.lineaInferior ? etiqueta(partes.lineaInferior, '6px 0 0') : ''}
      </table>
    </td>
  </tr>
</table>
<!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="20" style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr></table><![endif]-->`;
}

// --- Tarjeta de Gift Card ---
//
// Mismos acabados que la tarjeta de la Tienda (gift-card-visual.tsx): plata,
// azul o tinta de gabinete. Fondos planos a propósito: si un cliente de correo
// invierte colores, cambia fondo y texto a la vez y se sigue leyendo.
export type AcabadoTarjeta = 'plata' | 'azul' | 'tinta';

const ACABADOS: Record<AcabadoTarjeta, { fondo: string; borde: string; texto: string; tenue: string; logo: string }> = {
  plata: { fondo: '#E3E6E4', borde: '#B7BCBA', texto: '#1B263C', tenue: '#47526A', logo: 'logo-plata-v1.png' },
  azul: { fondo: '#1B5FC0', borde: '#1B5FC0', texto: '#FFFFFF', tenue: '#D5E5FF', logo: 'logo-azul-v1.png' },
  tinta: { fondo: '#15171A', borde: '#15171A', texto: '#FFFFFF', tenue: '#B8BDC3', logo: 'logo-tinta-v1.png' },
};

export function tarjetaGiftCard(
  tarjeta: {
    acabado: AcabadoTarjeta;
    // Parte entera y decimales del monto, ya formateados y escapados ("$25" y ".00").
    montoEntero: string;
    montoDecimales: string;
    // Código ya escapado. Va como texto corrido para poder copiarlo.
    codigoHtml: string;
  },
  opciones?: OpcionesCorreo,
): string {
  const a = ACABADOS[tarjeta.acabado];
  const base = baseImagenesDe(opciones);
  // La tabla "fantasma" de 440 px es para Outlook de escritorio, que ignora
  // max-width; su última fila hace de separación entre tarjetas.
  return `
<!--[if mso]><table role="presentation" width="440" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;margin:0 auto 16px;">
  <tr>
    <td bgcolor="${a.fondo}" style="background-color:${a.fondo};border:1px solid ${a.borde};border-radius:16px;padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:18px 18px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="36" valign="middle" style="width:36px;">
                  <img src="${base}/${a.logo}" width="36" height="36" alt="" style="display:block;width:36px;height:36px;border:0;">
                </td>
                <td valign="middle" style="padding:0 0 0 10px;font-family:${FUENTE.titular};font-size:11px;line-height:13px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;white-space:nowrap;color:${a.texto};">Todo<br>Vending CA</td>
                <td valign="middle" align="right" style="font-family:${FUENTE.mono};font-size:11px;line-height:13px;font-weight:500;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;color:${a.tenue};">Gift&nbsp;Card</td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:18px 0 0;font-family:${FUENTE.titular};font-size:46px;line-height:46px;font-weight:700;letter-spacing:-1.5px;color:${a.texto};">${tarjeta.montoEntero}<span style="font-size:22px;letter-spacing:-0.5px;color:${a.tenue};">${tarjeta.montoDecimales}</span></td>
              </tr>
              <tr>
                <td style="padding:16px 0 6px;font-family:${FUENTE.mono};font-size:10px;line-height:14px;font-weight:500;letter-spacing:2.2px;text-transform:uppercase;color:${a.tenue};">Código</td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="tv-codigo" align="center" bgcolor="${COLOR.ledFondo}" style="background-color:${COLOR.ledFondo};border:1px solid ${COLOR.gabineteBorde};border-radius:10px;padding:13px 4px;font-family:${FUENTE.mono};font-size:18px;line-height:26px;font-weight:600;letter-spacing:0;color:${COLOR.led};word-break:break-word;overflow-wrap:anywhere;">${tarjeta.codigoHtml}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0;font-size:0;line-height:0;">
            <img src="${base}/ola-tarjeta-v1.png" width="438" height="42" alt="" style="display:block;width:100%;max-width:440px;height:auto;border:0;border-radius:0 0 15px 15px;">
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[if mso]></td></tr><tr><td height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr></table><![endif]-->`;
}

// --- Documento completo ---

export interface PartesCorreo {
  // Todo ya escapado.
  tituloDocumento: string;
  // Texto que el cliente de correo muestra junto al asunto (oculto en el cuerpo).
  preheader: string;
  // Rótulo de pantalla LED en la cabecera ("GIFT CARDS", "VENTA", "CONTACTO").
  rotulo: string;
  encabezado: string;
  cuerpoHtml: string;
  pieHtml: string;
}

export function documentoCorreo(partes: PartesCorreo, opciones?: OpcionesCorreo): string {
  const base = baseImagenesDe(opciones);
  // Relleno tras el preheader para que el cliente no arrastre texto del cuerpo.
  const relleno = '&#847;&zwnj;&nbsp;'.repeat(60);
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${partes.tituloDocumento}</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<style>
  table { border-collapse: collapse; }
  td, th, div, p, a, h1, h2, span { font-family: 'Segoe UI', Arial, sans-serif !important; }
  .tv-codigo { font-family: Consolas, 'Courier New', monospace !important; }
</style>
<![endif]-->
<!--[if !mso]><!-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${FUENTES_WEB}" rel="stylesheet">
<!--<![endif]-->
<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
  body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  /* Solo mejoras: el correo ya se ve bien sin estas reglas. */
  @media (min-width: 400px) {
    .tv-codigo { font-size: 22px !important; line-height: 28px !important; letter-spacing: .5px !important; }
  }
  @media (min-width: 480px) {
    .tv-codigo { font-size: 24px !important; line-height: 30px !important; letter-spacing: 1px !important; padding: 15px 8px !important; }
    .tv-encabezado { font-size: 32px !important; line-height: 36px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.fondo};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${COLOR.fondo};">${partes.preheader}${relleno}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.fondo}" style="background-color:${COLOR.fondo};">
  <tr>
    <td align="center" style="padding:20px 10px 28px;">
      <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
        <tr>
          <td bgcolor="${COLOR.gabinete}" style="background-color:${COLOR.gabinete};border-radius:16px 16px 0 0;padding:22px 24px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="44" valign="middle" style="width:44px;">
                  <img src="${base}/logo-tinta-v1.png" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border:0;">
                </td>
                <td valign="middle" style="padding:0 8px 0 12px;font-family:${FUENTE.titular};font-size:13px;line-height:15px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;white-space:nowrap;color:${COLOR.sobreGabinete};">Todo<br>Vending CA</td>
                <td valign="middle" align="right">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right">
                    <tr>
                      <td bgcolor="${COLOR.ledFondo}" style="background-color:${COLOR.ledFondo};border:1px solid ${COLOR.gabineteBorde};border-radius:7px;padding:5px 8px;font-family:${FUENTE.mono};font-size:11px;line-height:16px;font-weight:500;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;color:${COLOR.led};">${partes.rotulo}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:26px 0 0;">
                  <h1 class="tv-encabezado" style="margin:0;padding:0;font-family:${FUENTE.titular};font-size:27px;line-height:31px;font-weight:700;letter-spacing:-0.6px;color:${COLOR.sobreGabinete};">${partes.encabezado}</h1>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td bgcolor="${COLOR.gabinete}" style="background-color:${COLOR.gabinete};padding:0 0 4px;font-size:0;line-height:0;">
            <img src="${base}/ola-v1.png" width="600" height="28" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;">
          </td>
        </tr>
        <tr>
          <td bgcolor="${COLOR.papel}" style="background-color:${COLOR.papel};padding:30px 24px 32px;">
            ${partes.cuerpoHtml}
          </td>
        </tr>
        <tr>
          <td bgcolor="${COLOR.gabinete}" style="background-color:${COLOR.gabinete};border-radius:0 0 16px 16px;padding:20px 24px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
              <tr>
                <td width="28" height="3" bgcolor="${COLOR.naranja}" style="width:28px;height:3px;font-size:3px;line-height:3px;mso-line-height-rule:exactly;background-color:${COLOR.naranja};">&nbsp;</td>
                <td width="28" height="3" bgcolor="${COLOR.azul}" style="width:28px;height:3px;font-size:3px;line-height:3px;mso-line-height-rule:exactly;background-color:${COLOR.azul};">&nbsp;</td>
              </tr>
            </table>
            <p style="margin:0;font-family:${FUENTE.texto};font-size:13px;line-height:1.55;color:${COLOR.sobreGabinete2};">${partes.pieHtml}</p>
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}
