// Resend email integration for Todo Vending CA contact form
// Using direct RESEND_API_KEY secret for simplified configuration
import { Resend } from 'resend';
import { crearPdfGiftCards } from './gift-card-pdf';

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

export async function sendContactNotification(data: ContactEmailData): Promise<boolean> {
  try {
    // Use the RESEND_API_KEY secret directly
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }
    
    const client = new Resend(apiKey);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10B981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Todo Vending CA</h1>
          <p style="color: white; margin: 5px 0 0 0;">Nuevo mensaje de contacto</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Detalles del contacto:</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nombre:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
                <a href="mailto:${data.email}" style="color: #10B981;">${data.email}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Telefono:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
                <a href="tel:${data.phone}" style="color: #10B981;">${data.phone}</a>
              </td>
            </tr>
            ` : ''}
            ${data.company ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Empresa:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${data.company}</td>
            </tr>
            ` : ''}
          </table>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #374151; margin-bottom: 10px;">Mensaje:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="color: #1f2937; margin: 0; white-space: pre-wrap;">${data.message}</p>
            </div>
          </div>
        </div>
        
        <div style="background-color: #1f2937; padding: 15px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de contacto de todovendingca.com
          </p>
        </div>
      </div>
    `;

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
}

const CORREO_NEGOCIO = 'todovendingca@gmail.com';

function asuntoConPrueba(asunto: string, esPrueba: boolean): string {
  return esPrueba ? `[PRUEBA] ${asunto}` : asunto;
}

// Recuadro de aviso para los pedidos de prueba (vacio si no lo es).
function notaPruebaHtml(esPrueba: boolean, texto: string): string {
  if (!esPrueba) return '';
  return `
          <p style="margin: 0 0 20px; padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e; font-size: 14px;">
            <strong>Modo de prueba:</strong> ${texto}
          </p>`;
}

const NOTA_PRUEBA_COMPRADOR =
  'esta no es una compra real. El pago no es real y los códigos de abajo no sirven para canjear.';
const NOTA_PRUEBA_VENTA =
  'esta venta se hizo contra un entorno de prueba de SPIDI (simulador, sandbox u otro). No es una compra real: no entró dinero y sus códigos no se pueden canjear.';

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

// Fila "etiqueta: valor" de las tablas de resumen (el valor ya viene escapado).
function filaResumen(etiqueta: string, valorHtml: string): string {
  return `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">${etiqueta}</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${valorHtml}</td>
            </tr>`;
}

// Recuadro para el comprador cuando falta algun codigo (vacio si no falta).
function notaFaltanHtml(faltan: number): string {
  if (faltan <= 0) return '';
  return `
          <p style="margin: 0 0 20px; padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e; font-size: 14px;">
            ${escaparHtml(textoFaltanComprador(faltan))}
          </p>`;
}

function textoFaltanComprador(faltan: number): string {
  return faltan === 1
    ? 'Tu pago está confirmado, pero una de tus Gift Cards aún no tiene código disponible. Nuestro equipo te la enviará a este correo a la brevedad; no tienes que hacer nada.'
    : `Tu pago está confirmado, pero ${faltan} de tus Gift Cards aún no tienen código disponible. Nuestro equipo te las enviará a este correo a la brevedad; no tienes que hacer nada.`;
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
    const comprobante = urlSegura(data.comprobanteUrl);

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

    const filasCodigos = data.giftCards
      .map(
        (g) => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; letter-spacing: 1px; color: #111827;">${escaparHtml(g.codigo)}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${escaparHtml(formatoUsd(g.montoUsd))}</td>
            </tr>`,
      )
      .join('');

    const resumen = [
      filaResumen('Número de pedido:', escaparHtml(data.numero)),
      filaResumen('Total:', escaparHtml(formatoUsd(data.totalUsd))),
      data.montoVes !== null ? filaResumen('Monto pagado:', escaparHtml(formatoBs(data.montoVes))) : '',
      data.referencia ? filaResumen('Referencia bancaria:', escaparHtml(data.referencia)) : '',
    ].join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10B981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Todo Vending CA</h1>
          <p style="color: white; margin: 5px 0 0 0;">¡Gracias por tu compra!</p>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          ${notaPruebaHtml(data.esPrueba, NOTA_PRUEBA_COMPRADOR)}
          <p style="color: #1f2937; margin-top: 0;">Hola ${escaparHtml(data.compradorNombre)},</p>
          ${data.giftCards.length > 0 ? `
          <p style="color: #1f2937;">
            Recibimos tu pago. Aquí tienes ${data.giftCards.length === 1 ? 'tu Gift Card' : 'tus Gift Cards'} del pedido
            <strong>${escaparHtml(data.numero)}</strong>:
          </p>
          ${notaFaltanHtml(data.faltanCodigos)}
          <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #e5e7eb;">
            <tr>
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; color: #374151;">Código</th>
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">Monto</th>
            </tr>
            ${filasCodigos}
          </table>
          ${pdf ? `
          <p style="color: #1f2937;">
            Te adjuntamos ${data.giftCards.length === 1 ? 'tu Gift Card' : 'tus Gift Cards'} en PDF, lista${data.giftCards.length === 1 ? '' : 's'} para imprimir a tamaño real.
          </p>
          ` : ''}
          ` : `
          <p style="color: #1f2937;">Recibimos tu pago del pedido <strong>${escaparHtml(data.numero)}</strong>.</p>
          ${notaFaltanHtml(data.faltanCodigos)}
          `}

          <h2 style="color: #1f2937; font-size: 18px; margin-top: 30px;">Resumen del pago</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${resumen}
          </table>
          ${comprobante ? `
          <p style="margin-top: 20px;">
            <a href="${escaparHtml(comprobante)}" style="display: inline-block; background-color: #10B981; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none;">Ver comprobante de SPIDI</a>
          </p>
          ` : ''}

          <h2 style="color: #1f2937; font-size: 18px; margin-top: 30px;">Cómo usar tu Gift Card</h2>
          <ul style="color: #1f2937; padding-left: 20px; line-height: 1.6;">
            <li>Cada código vale por el monto indicado para consumir en las máquinas de Todo Vending CA y Café Oriente.</li>
            <li>Si tienes dudas sobre cómo usarlo, escríbenos por WhatsApp al +58 414-616-4177 y te ayudamos.</li>
            <li>Cada código se puede usar una sola vez. Guárdalo como si fuera efectivo y compártelo solo con quien lo vaya a usar.</li>
          </ul>
        </div>

        <div style="background-color: #1f2937; padding: 15px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Compra realizada en todovendingca.com. Si tienes alguna duda, responde a este correo.
          </p>
        </div>
      </div>
    `;

    // Version en texto plano: algunos clientes de correo no muestran HTML.
    const emailTexto = [
      data.esPrueba ? `MODO DE PRUEBA: ${NOTA_PRUEBA_COMPRADOR}` : null,
      data.esPrueba ? '' : null,
      `Hola ${data.compradorNombre},`,
      '',
      data.giftCards.length > 0
        ? `Recibimos tu pago. Estas son tus Gift Cards del pedido ${data.numero}:`
        : `Recibimos tu pago del pedido ${data.numero}.`,
      ...data.giftCards.map((g) => `  ${g.codigo}  (${formatoUsd(g.montoUsd)})`),
      pdf ? 'Te adjuntamos tus Gift Cards en PDF, listas para imprimir a tamaño real.' : null,
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
    const comprobante = urlSegura(data.comprobanteUrl);
    const email = escaparHtml(data.compradorEmail);
    const telefono = data.compradorTelefono ? escaparHtml(data.compradorTelefono) : null;

    const filas = [
      filaResumen('Pedido:', escaparHtml(data.numero)),
      filaResumen('Comprador:', escaparHtml(data.compradorNombre)),
      filaResumen('Email:', `<a href="mailto:${email}" style="color: #10B981;">${email}</a>`),
      telefono ? filaResumen('Teléfono:', `<a href="tel:${telefono}" style="color: #10B981;">${telefono}</a>`) : '',
      filaResumen('Cantidad:', escaparHtml(String(data.cantidad))),
      filaResumen('Total:', escaparHtml(formatoUsd(data.totalUsd))),
      data.montoVes !== null ? filaResumen('Monto pagado:', escaparHtml(formatoBs(data.montoVes))) : '',
      filaResumen('Referencia bancaria:', data.referencia ? escaparHtml(data.referencia) : 'Sin referencia'),
      comprobante
        ? filaResumen('Comprobante:', `<a href="${escaparHtml(comprobante)}" style="color: #10B981;">Ver en SPIDI</a>`)
        : '',
    ].join('');

    // Pago sin stock: el comprador pago y le faltan codigos. Es lo primero que
    // debe ver quien lee el aviso.
    const avisoSinStock = data.faltanCodigos > 0
      ? `<p style="margin:0 0 20px;padding:12px;background:#fee2e2;border-left:4px solid #dc2626;color:#991b1b;font-size:14px;">
           <strong>PAGO SIN STOCK:</strong> faltan ${escaparHtml(String(data.faltanCodigos))} código(s) de Gift Card para este pedido
           porque el inventario estaba vacío. Carga stock y entrégaselos a mano al comprador (el pedido aparece en /admin).
         </p>`
      : '';

    const avisoCorreo = correoCompradorEnviado !== false
      ? ''
      : `<p style="margin:16px 0 0;padding:12px;background:#fef3c7;border-left:4px solid #f59e0b;color:#92400e;font-size:13px;">
           El correo con los códigos <strong>no pudo enviarse al comprador</strong>. Los ve en la página de resultado del pago;
           si te escribe, puedes confirmarle el pedido con su número.
         </p>`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10B981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Todo Vending CA</h1>
          <p style="color: white; margin: 5px 0 0 0;">Nueva venta de Gift Cards</p>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          ${notaPruebaHtml(data.esPrueba, NOTA_PRUEBA_VENTA)}
          ${avisoSinStock}
          <table style="width: 100%; border-collapse: collapse;">
            ${filas}
          </table>
          ${avisoCorreo}
        </div>
        <div style="background-color: #1f2937; padding: 15px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Pago confirmado por SPIDI. Enviado desde la tienda de todovendingca.com
          </p>
        </div>
      </div>
    `;

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
