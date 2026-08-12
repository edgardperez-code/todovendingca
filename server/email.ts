// Resend email integration for Todo Vending CA contact form
// Using direct RESEND_API_KEY secret for simplified configuration
import { Resend } from 'resend';

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
