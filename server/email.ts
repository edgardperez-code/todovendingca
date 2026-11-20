// Resend email integration for Todo Vending CA contact form
// Using direct RESEND_API_KEY secret for simplified configuration
import { Resend } from 'resend';
import { crearPdfGiftCards } from './gift-card-pdf';
import { PRODUCTOS } from '@shared/catalogo';
import {
  COLOR,
  FUENTE,
  aviso,
  boton,
  documentoCorreo,
  enlace,
  listaCodigos,
  pantallaLed,
  parrafo,
  tablaDatos,
  tarjetaGiftCard,
  tituloSeccion,
  type AcabadoTarjeta,
  type OpcionesCorreo,
} from './correo/plantilla';

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

interface EncuestaEmailData {
  bebida: string;
  calificacion: number;
  comentario?: string | null;
  guardadaEnBd: boolean;
}

// Aviso por cada respuesta de la encuesta de vasos. Es la red de seguridad:
// aunque falle la base de datos, la respuesta queda en el correo.
export async function sendEncuestaNotification(data: EncuestaEmailData): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY no configurada');
      return false;
    }

    const client = new Resend(apiKey);
    const estrellas = '★'.repeat(data.calificacion) + '☆'.repeat(5 - data.calificacion);
    const aviso = data.guardadaEnBd
      ? ''
      : `<p style="margin:16px 0 0;padding:12px;background:#fef3c7;border-left:4px solid #f59e0b;color:#92400e;font-size:13px;">
           Esta respuesta <strong>no pudo guardarse en la base de datos</strong>. Este correo es la unica copia.
         </p>`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #E06A3B; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Cafe Oriente</h1>
          <p style="color: white; margin: 5px 0 0 0;">Nueva respuesta de la encuesta de vasos</p>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Bebida:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${data.bebida}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Calificacion:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
                ${estrellas} &nbsp; (${data.calificacion} de 5)
              </td>
            </tr>
          </table>
          ${data.comentario && data.comentario.trim() ? `
          <div style="margin-top: 20px;">
            <h3 style="color: #374151; margin-bottom: 10px;">Comentario:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="color: #1f2937; margin: 0; white-space: pre-wrap;">${data.comentario}</p>
            </div>
          </div>
          ` : '<p style="color:#6b7280;font-size:13px;margin-top:20px;">Sin comentario.</p>'}
          ${aviso}
        </div>
        <div style="background-color: #1f2937; padding: 15px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Enviado desde la encuesta en todovendingca.com/vasos
          </p>
        </div>
      </div>
    `;

    const result = await client.emails.send({
      from: 'Cafe Oriente <onboarding@resend.dev>',
      to: 'todovendingca@gmail.com',
      subject: `Encuesta: ${data.bebida} - ${data.calificacion}/5`,
      html: emailHtml,
    });

    if (result.error) {
      console.error('Resend error (encuesta):', result.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error enviando correo de encuesta:', error);
    return false;
  }
}

// HTML del aviso de contacto (diseño Vitrina). Función pura: no envía nada,
// así se puede previsualizar con script/vista-correos.ts. Todo lo que escribió
// la persona en el formulario se escapa antes de entrar al HTML.
export function htmlContacto(data: ContactEmailData, opciones?: OpcionesCorreo): string {
  const nombre = escaparHtml(data.name);
  const email = escaparHtml(data.email);
  const telefono = data.phone ? escaparHtml(data.phone) : null;

  const cuerpo = [
    tituloSeccion('Detalles del contacto', '0 0 12px'),
    tablaDatos([
      { etiqueta: 'Nombre', valorHtml: nombre },
      { etiqueta: 'Email', valorHtml: enlace(`mailto:${email}`, email) },
      telefono ? { etiqueta: 'Teléfono', valorHtml: enlace(`tel:${telefono}`, telefono) } : null,
      data.company ? { etiqueta: 'Empresa', valorHtml: escaparHtml(data.company) } : null,
    ]),
    tituloSeccion('Mensaje'),
    `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="5" bgcolor="${COLOR.naranja}" style="width:5px;font-size:0;line-height:0;background-color:${COLOR.naranja};">&nbsp;</td>
    <td bgcolor="${COLOR.blanco}" style="background-color:${COLOR.blanco};border:1px solid ${COLOR.linea};border-left:0;padding:16px 18px;font-family:${FUENTE.texto};font-size:16px;line-height:1.55;color:${COLOR.tinta};white-space:pre-wrap;word-break:break-word;">${escaparHtml(data.message)}</td>
  </tr>
</table>`,
  ].join('');

  return documentoCorreo(
    {
      tituloDocumento: `Nuevo contacto de ${nombre} - Todo Vending CA`,
      preheader: `Nuevo contacto de ${nombre}`,
      rotulo: 'Contacto',
      encabezado: 'Nuevo mensaje de contacto',
      cuerpoHtml: cuerpo,
      pieHtml: 'Este mensaje fue enviado desde el formulario de contacto de todovendingca.com',
    },
    opciones,
  );
}

export async function sendContactNotification(data: ContactEmailData): Promise<boolean> {
  try {
    // Use the RESEND_API_KEY secret directly
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }
    
    const client = new Resend(apiKey);
    
    const emailHtml = htmlContacto(data);

    // Use Resend's default onboarding domain - this allows sending to any email
    // without needing to verify a custom domain
    const result = await client.emails.send({
      from: 'Todo Vending CA <onboarding@resend.dev>',
      to: 'todovendingca@gmail.com',
      subject: `Nuevo contacto de ${data.name} - Todo Vending CA`,
      html: emailHtml,
      replyTo: data.email
    });

    console.log('Resend API response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('Resend error:', result.error);
      return false;
    }
    
    console.log('Contact email sent successfully to todovendingca@gmail.com, ID:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Error sending contact email:', error);
    return false;
  }
}

// === TIENDA: correos de la compra de Gift Cards ===
//
// OJO con el remitente: el dominio de prueba de Resend (onboarding@resend.dev)
// SOLO entrega al correo duenio de la cuenta de Resend. Para escribirle a los
// compradores hay que verificar el dominio (por ejemplo todovendingca.com) en
// Resend y poner EMAIL_FROM, por ejemplo:
//   EMAIL_FROM="Todo Vending CA <pedidos@todovendingca.com>"
// Mientras tanto el comprador igual ve sus codigos en la pagina de resultado.
//
// Nunca se registran en logs los codigos de Gift Card: solo el numero de pedido.

export interface DatosCorreoVenta {
  numero: string;
  compradorNombre: string;
  compradorEmail: string;
  compradorTelefono: string | null;
  cantidad: number;
  totalUsd: number;
  montoVes: number | null;
  referencia: string | null;
  comprobanteUrl: string | null;
  // Cada codigo con su monto (un pedido puede traer varios, de $10, $25 y $50).
  giftCards: Array<{ codigo: string; montoUsd: number }>;
  // Gift Cards pagadas que aun no tienen codigo (el pago llego sin stock en el
  // inventario): el correo al comprador le avisa que se las enviaremos y el
  // aviso de venta pide entregarlas a mano. 0 en casi todos los pedidos.
  faltanCodigos: number;
  // Pedido de prueba (creado en modo prueba: numero TVP- o Gift Cards de
  // prueba): el asunto lleva [PRUEBA] y el cuerpo avisa que no es una compra
  // real, para que nadie lo confunda con una venta ni intente canjear esos
  // codigos. Lo decide el pedido (esPedidoDePrueba en server/tienda.ts), nunca
  // el modo actual del servidor: un pago real reenviado desde un servidor en
  // modo prueba no debe llegar rotulado como prueba.
  esPrueba: boolean;
  // Con que pasarela se cobro ("spidi" | "skylink"). Solo cambia textos.
  pasarela: 'spidi' | 'skylink';
}

function nombrePasarela(pasarela: DatosCorreoVenta['pasarela']): string {
  return pasarela === 'skylink' ? 'Skylink Pay' : 'SPIDI';
}

const CORREO_NEGOCIO = 'todovendingca@gmail.com';

function asuntoConPrueba(asunto: string, esPrueba: boolean): string {
  return esPrueba ? `[PRUEBA] ${asunto}` : asunto;
}

// Recuadro de aviso para los pedidos de prueba (vacio si no lo es).
function notaPruebaHtml(esPrueba: boolean, texto: string): string {
  if (!esPrueba) return '';
  return aviso('aviso', `<strong>Modo de prueba:</strong> ${texto}`);
}

const NOTA_PRUEBA_COMPRADOR =
  'esta no es una compra real. El pago no es real y los códigos de abajo no sirven para canjear.';
function notaPruebaVenta(pasarela: DatosCorreoVenta['pasarela']): string {
  return pasarela === 'skylink'
    ? 'esta venta se hizo con Skylink Pay en modo de prueba (simulador o monto de prueba). No es una compra real: sus códigos no se pueden canjear.'
    : 'esta venta se hizo contra un entorno de prueba de SPIDI (simulador, sandbox u otro). No es una compra real: no entró dinero y sus códigos no se pueden canjear.';
}

function remitenteTienda(): string {
  return process.env.EMAIL_FROM?.trim() || 'Todo Vending CA <onboarding@resend.dev>';
}

// Todo dato que escribio el comprador (o que vino de SPIDI) se escapa antes de
// meterlo en el HTML, para que no pueda inyectar etiquetas ni enlaces.
function escaparHtml(valor: unknown): string {
  const mapa: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(valor ?? '').replace(/[&<>"']/g, (c) => mapa[c]);
}

// Solo enlaces http(s): un "javascript:" u otro esquema no entra al correo.
function urlSegura(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

function formatoUsd(monto: number): string {
  return `$${monto.toFixed(2)}`;
}

function formatoBs(monto: number): string {
  return `Bs. ${new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto)}`;
}

// Recuadro para el comprador cuando falta algun codigo (vacio si no falta).
function notaFaltanHtml(faltan: number): string {
  if (faltan <= 0) return '';
  return aviso('aviso', escaparHtml(textoFaltanComprador(faltan)));
}

// Acabado de la tarjeta segun su monto, igual que en la Tienda
// (client/src/components/gift-card-visual.tsx): la primera Gift Card del
// catalogo es plateada, la segunda azul y la tercera tinta de gabinete.
const ACABADOS_TARJETA: AcabadoTarjeta[] = ['plata', 'azul', 'tinta'];
const MONTOS_CATALOGO: number[] = PRODUCTOS.filter((p) => p.esGiftCard).map((p) => p.precioUsd);

function acabadoDe(montoUsd: number): AcabadoTarjeta {
  const posicion = MONTOS_CATALOGO.indexOf(montoUsd);
  return posicion === -1 ? 'tinta' : ACABADOS_TARJETA[posicion % ACABADOS_TARJETA.length];
}

function textoFaltanComprador(faltan: number): string {
  return faltan === 1
    ? 'Tu pago está confirmado, pero una de tus Gift Cards aún no tiene código disponible. Nuestro equipo te la enviará a este correo a la brevedad; no tienes que hacer nada.'
    : `Tu pago está confirmado, pero ${faltan} de tus Gift Cards aún no tienen código disponible. Nuestro equipo te las enviará a este correo a la brevedad; no tienes que hacer nada.`;
}

// HTML del correo al comprador (diseño Vitrina). Funcion pura: no envia nada,
// asi se puede previsualizar con script/vista-correos.ts. `tienePdf` dice si el
// correo lleva adjunto el PDF de las tarjetas (solo cambia una frase).
export function htmlGiftCardsComprador(
  data: DatosCorreoVenta,
  tienePdf: boolean,
  opciones?: OpcionesCorreo,
): string {
  const comprobante = urlSegura(data.comprobanteUrl);
  const numero = escaparHtml(data.numero);
  const una = data.giftCards.length === 1;

  // Cada Gift Card es una tarjeta con el color de su monto y el codigo en
  // grande, como texto corrido para poder copiarlo.
  const tarjetas = data.giftCards
    .map((g) => {
      const [entero, decimales = ''] = formatoUsd(g.montoUsd).split('.');
      return tarjetaGiftCard(
        {
          acabado: acabadoDe(g.montoUsd),
          montoEntero: escaparHtml(entero),
          montoDecimales: decimales ? `.${escaparHtml(decimales)}` : '',
          codigoHtml: escaparHtml(g.codigo),
        },
        opciones,
      );
    })
    .join('');

  const resumen = tablaDatos([
    { etiqueta: 'Número de pedido', valorHtml: numero },
    { etiqueta: 'Total', valorHtml: escaparHtml(formatoUsd(data.totalUsd)) },
    data.montoVes !== null ? { etiqueta: 'Monto pagado', valorHtml: escaparHtml(formatoBs(data.montoVes)) } : null,
    data.referencia ? { etiqueta: 'Referencia bancaria', valorHtml: escaparHtml(data.referencia) } : null,
  ]);

  const introduccion = data.giftCards.length > 0
    ? `Recibimos tu pago. Aquí tienes ${una ? 'tu Gift Card' : 'tus Gift Cards'} del pedido <strong style="white-space:nowrap;">${numero}</strong>:`
    : `Recibimos tu pago del pedido <strong style="white-space:nowrap;">${numero}</strong>.`;

  const cuerpo = [
    notaPruebaHtml(data.esPrueba, NOTA_PRUEBA_COMPRADOR),
    parrafo(`Hola ${escaparHtml(data.compradorNombre)},`, '0 0 10px'),
    parrafo(introduccion, '0 0 20px'),
    notaFaltanHtml(data.faltanCodigos),
    tarjetas,
    data.giftCards.length > 0 && tienePdf
      ? parrafo(
          `Te adjuntamos ${una ? 'tu Gift Card' : 'tus Gift Cards'} en PDF, lista${una ? '' : 's'} para imprimir a tamaño real.`,
          '4px 0 0',
        )
      : '',
    tituloSeccion('Resumen del pago'),
    resumen,
    comprobante ? boton(escaparHtml(comprobante), 'Ver comprobante de SPIDI') : '',
    tituloSeccion('Cómo usar tu Gift Card'),
    listaCodigos([
      'Cada código vale por el monto indicado para consumir en las máquinas de Todo Vending CA y Café Oriente.',
      'Si tienes dudas sobre cómo usarlo, escríbenos por WhatsApp al <span style="white-space:nowrap;">+58 414-616-4177</span> y te ayudamos.',
      'Cada código se puede usar una sola vez. Guárdalo como si fuera efectivo y compártelo solo con quien lo vaya a usar.',
    ]),
  ].join('');

  // El texto de vista previa nunca lleva los codigos.
  const preheader = data.esPrueba
    ? `Modo de prueba: ${NOTA_PRUEBA_COMPRADOR}`
    : data.giftCards.length > 0
      ? `Recibimos tu pago. Aquí tienes ${una ? 'tu Gift Card' : 'tus Gift Cards'} del pedido ${numero}.`
      : `Recibimos tu pago del pedido ${numero}.`;

  return documentoCorreo(
    {
      tituloDocumento: `Tus Gift Cards Todo Vending - Pedido ${numero}`,
      preheader,
      rotulo: 'Gift&nbsp;Cards',
      encabezado: '¡Gracias por tu compra!',
      cuerpoHtml: cuerpo,
      pieHtml: 'Compra realizada en todovendingca.com. Si tienes alguna duda, responde a este correo.',
    },
    opciones,
  );
}

// Version en texto plano del correo al comprador: algunos clientes de correo
// no muestran HTML.
export function textoGiftCardsComprador(data: DatosCorreoVenta, tienePdf: boolean): string {
  const comprobante = urlSegura(data.comprobanteUrl);
  return [
    data.esPrueba ? `MODO DE PRUEBA: ${NOTA_PRUEBA_COMPRADOR}` : null,
    data.esPrueba ? '' : null,
    `Hola ${data.compradorNombre},`,
    '',
    data.giftCards.length > 0
      ? `Recibimos tu pago. Estas son tus Gift Cards del pedido ${data.numero}:`
      : `Recibimos tu pago del pedido ${data.numero}.`,
    ...data.giftCards.map((g) => `  ${g.codigo}  (${formatoUsd(g.montoUsd)})`),
    tienePdf ? 'Te adjuntamos tus Gift Cards en PDF, listas para imprimir a tamaño real.' : null,
    data.faltanCodigos > 0 ? '' : null,
    data.faltanCodigos > 0 ? textoFaltanComprador(data.faltanCodigos) : null,
    '',
    `Total: ${formatoUsd(data.totalUsd)}`,
    data.montoVes !== null ? `Monto pagado: ${formatoBs(data.montoVes)}` : null,
    data.referencia ? `Referencia bancaria: ${data.referencia}` : null,
    comprobante ? `Comprobante de SPIDI: ${comprobante}` : null,
    '',
    'Cómo usar tu Gift Card: cada código vale por su monto en las máquinas de Todo Vending CA y Café Oriente.',
    'Si tienes dudas, escríbenos por WhatsApp al +58 414-616-4177.',
    'Cada código se puede usar una sola vez. Guárdalo como si fuera efectivo.',
  ]
    .filter((linea): linea is string => linea !== null)
    .join('\n');
}

// Al comprador: sus codigos (cada uno con su monto), el resumen del pago y
// como usarlos.
export async function sendGiftCardsComprador(data: DatosCorreoVenta): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY no configurada');
      return false;
    }

    const client = new Resend(apiKey);

    // PDF con las tarjetas a tamano real para imprimir. Si no se puede generar,
    // el correo sale igual sin el adjunto: los codigos van tambien en el texto.
    let pdf: Buffer | null = null;
    if (data.giftCards.length > 0) {
      try {
        pdf = await crearPdfGiftCards(data.giftCards, data.numero);
      } catch (error) {
        console.error(`No se pudo generar el PDF de Gift Cards (pedido ${data.numero}):`, (error as Error).message);
      }
    }

    const emailHtml = htmlGiftCardsComprador(data, pdf !== null);
    const emailTexto = textoGiftCardsComprador(data, pdf !== null);

    const result = await client.emails.send({
      from: remitenteTienda(),
      to: data.compradorEmail,
      subject: asuntoConPrueba(`Tus Gift Cards Todo Vending - Pedido ${data.numero}`, data.esPrueba),
      html: emailHtml,
      text: emailTexto,
      replyTo: CORREO_NEGOCIO,
      attachments: pdf ? [{ filename: `GiftCard-TodoVending-${data.numero}.pdf`, content: pdf }] : undefined,
    });

    if (result.error) {
      // Solo el nombre y el mensaje del error de Resend: nada del contenido.
      console.error(`Resend error (gift cards, pedido ${data.numero}):`, result.error.name, result.error.message);
      return false;
    }
    console.log(`Correo de Gift Cards enviado (pedido ${data.numero}), ID:`, result.data?.id);
    return true;
  } catch (error) {
    console.error(
      `Error enviando el correo de Gift Cards (pedido ${data.numero}):`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

// HTML del aviso interno de venta (diseño Vitrina). Funcion pura: no envia
// nada, asi se puede previsualizar con script/vista-correos.ts. No lleva los
// codigos de Gift Card.
export function htmlNotificacionVenta(
  data: DatosCorreoVenta,
  correoCompradorEnviado?: boolean,
  opciones?: OpcionesCorreo,
): string {
  const comprobante = urlSegura(data.comprobanteUrl);
  const numero = escaparHtml(data.numero);
  const email = escaparHtml(data.compradorEmail);
  const telefono = data.compradorTelefono ? escaparHtml(data.compradorTelefono) : null;
  const total = escaparHtml(formatoUsd(data.totalUsd));
  const cantidad = escaparHtml(String(data.cantidad));

  const filas = tablaDatos([
    { etiqueta: 'Pedido', valorHtml: numero },
    { etiqueta: 'Comprador', valorHtml: escaparHtml(data.compradorNombre) },
    { etiqueta: 'Email', valorHtml: enlace(`mailto:${email}`, email) },
    telefono ? { etiqueta: 'Teléfono', valorHtml: enlace(`tel:${telefono}`, telefono) } : null,
    { etiqueta: 'Cantidad', valorHtml: cantidad },
    { etiqueta: 'Total', valorHtml: total },
    data.montoVes !== null ? { etiqueta: 'Monto pagado', valorHtml: escaparHtml(formatoBs(data.montoVes)) } : null,
    { etiqueta: 'Referencia bancaria', valorHtml: data.referencia ? escaparHtml(data.referencia) : 'Sin referencia' },
    comprobante ? { etiqueta: 'Comprobante', valorHtml: enlace(escaparHtml(comprobante), 'Ver en SPIDI') } : null,
  ]);

  // Pago sin stock: el comprador pago y le faltan codigos. Es lo primero que
  // debe ver quien lee el aviso.
  const avisoSinStock = data.faltanCodigos > 0
    ? aviso(
        'alerta',
        `<strong>PAGO SIN STOCK:</strong> faltan ${escaparHtml(String(data.faltanCodigos))} código(s) de Gift Card para este pedido
           porque el inventario estaba vacío. Carga stock y entrégaselos a mano al comprador (el pedido aparece en /admin).`,
      )
    : '';

  const avisoCorreo = correoCompradorEnviado !== false
    ? ''
    : aviso(
        'aviso',
        `El correo con los códigos <strong>no pudo enviarse al comprador</strong>. Los ve en la página de resultado del pago;
           si te escribe, puedes confirmarle el pedido con su número.`,
        '20px 0 0',
      );

  // Pantalla de la maquina con lo esencial de la venta (los mismos datos de la
  // tabla de abajo): pedido, total y cantidad.
  const pantalla = pantallaLed({
    lineaSuperior: `Pedido ${numero}`,
    cifra: total,
    lineaInferior: `${cantidad} Gift&nbsp;Card${data.cantidad === 1 ? '' : 's'}`,
  });

  const cuerpo = [
    notaPruebaHtml(data.esPrueba, notaPruebaVenta(data.pasarela)),
    avisoSinStock,
    pantalla,
    filas,
    avisoCorreo,
  ].join('');

  return documentoCorreo(
    {
      tituloDocumento: `Venta ${numero}: ${cantidad} Gift Card${data.cantidad === 1 ? '' : 's'} - ${total}`,
      preheader: `${data.faltanCodigos > 0 ? 'PAGO SIN STOCK - ' : ''}${escaparHtml(data.compradorNombre)} · ${cantidad} Gift Card${data.cantidad === 1 ? '' : 's'} · ${total}`,
      rotulo: 'Venta',
      encabezado: 'Nueva venta de Gift Cards',
      cuerpoHtml: cuerpo,
      pieHtml: `Pago confirmado por ${nombrePasarela(data.pasarela)}. Enviado desde la tienda de todovendingca.com`,
    },
    opciones,
  );
}

// Aviso interno de cada venta. No lleva los codigos (no hacen falta para el
// aviso y asi circulan por menos sitios). Dice si el correo al comprador salio,
// para saber si hay que escribirle a mano.
export async function sendNotificacionVenta(
  data: DatosCorreoVenta,
  correoCompradorEnviado?: boolean,
): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY no configurada');
      return false;
    }

    const client = new Resend(apiKey);
    const emailHtml = htmlNotificacionVenta(data, correoCompradorEnviado);

    const result = await client.emails.send({
      from: remitenteTienda(),
      to: CORREO_NEGOCIO,
      subject: asuntoConPrueba(
        `${data.faltanCodigos > 0 ? 'PAGO SIN STOCK - ' : ''}Venta ${data.numero}: ${data.cantidad} Gift Card${data.cantidad === 1 ? '' : 's'} - ${formatoUsd(data.totalUsd)}`,
        data.esPrueba,
      ),
      html: emailHtml,
      replyTo: data.compradorEmail,
    });

    if (result.error) {
      console.error(`Resend error (aviso de venta, pedido ${data.numero}):`, result.error.name, result.error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      `Error enviando el aviso de venta (pedido ${data.numero}):`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
