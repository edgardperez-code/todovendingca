// Resend email integration for Todo Vending CA contact form
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export async function sendContactNotification(data: ContactEmailData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
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

    // Use Resend's default domain for sending (works without domain verification)
    // The configured fromEmail may not be verified, so we use onboarding@resend.dev
    const senderEmail = 'Todo Vending CA <onboarding@resend.dev>';
    
    const result = await client.emails.send({
      from: senderEmail,
      to: 'todovendingca@gmail.com',
      subject: `Nuevo contacto de ${data.name} - Todo Vending CA`,
      html: emailHtml,
      replyTo: data.email
    });

    console.log('Resend API response:', JSON.stringify(result, null, 2));
    console.log('From email used:', fromEmail);
    
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
