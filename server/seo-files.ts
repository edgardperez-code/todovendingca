// sitemap.xml, robots.txt y llms.txt generados desde shared/site.ts.
// Antes había dos copias (client/public y server/routes.ts) que se
// desincronizaban; ahora hay una sola fuente: el registro de rutas.
import { SITE_URL, SITEMAP_ROUTES, BUSINESS, CLIENTS } from "@shared/site";

export function buildSitemap(): string {
  const urls = SITEMAP_ROUTES.map((r) => {
    const images =
      r.path === "/"
        ? `
    <image:image>
      <image:loc>${SITE_URL}/og-image-v2.jpg</image:loc>
      <image:title>Todo Vending CA — Máquinas expendedoras en Venezuela</image:title>
    </image:image>
    <image:image>
      <image:loc>${SITE_URL}/assets/maquina_vending_hero.webp</image:loc>
      <image:title>Máquinas expendedoras de Todo Vending CA en Lechería, Anzoátegui</image:title>
    </image:image>`
        : r.path === "/cafe-oriente"
          ? `
    <image:image>
      <image:loc>${SITE_URL}/cafe-oriente/assets/maquina-v1.webp</image:loc>
      <image:title>Estación de café Bianchi LEI 400 con la marca Café Oriente</image:title>
    </image:image>`
          : "";
    return `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>${images}
  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;
}

// Abierto a buscadores y a los rastreadores de los asistentes de IA (GEO/AIO).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "CCBot",
  "Meta-ExternalAgent",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "Bingbot",
  "DuckAssistBot",
  "YouBot",
  "MistralAI-User",
];

export function buildRobots(): string {
  const bots = AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n");
  return `# Todo Vending CA — ${SITE_URL}
# Sitio abierto a buscadores y a rastreadores de motores de IA (SEO + GEO/AIO)

User-agent: *
Allow: /
Disallow: /api/
Disallow: /registro
Disallow: /vasos

${bots}

# Resumen del negocio para modelos de IA: ${SITE_URL}/llms.txt

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export function buildLlmsTxt(): string {
  const pages = SITEMAP_ROUTES.map((r) => `- [${r.title.split(" | ")[0]}](${SITE_URL}${r.path}): ${r.summary}`).join("\n");
  const clients = CLIENTS.map((c) => `- ${c.name} (${c.type.toLowerCase()}): ${c.note}`).join("\n");
  return `# Todo Vending CA

> Empresa venezolana de máquinas expendedoras (vending) con sede en Lechería, estado Anzoátegui. Instala máquinas de snacks, bebidas frías, café en grano (marca propia Café Oriente), bebidas energéticas y barras de proteínas en empresas, clínicas, colegios, gimnasios y espacios públicos de Lechería, Puerto La Cruz y Barcelona. La instalación, la reposición de productos y el mantenimiento técnico son gratuitos para el establecimiento anfitrión.

## Datos clave

- **Nombre comercial:** ${BUSINESS.name}
- **Nombre legal:** ${BUSINESS.legalName} (RIF ${BUSINESS.rif})
- **Sitio web:** ${SITE_URL}
- **Teléfono / WhatsApp:** ${BUSINESS.phoneDisplay} (https://wa.me/${BUSINESS.whatsapp})
- **Correo:** ${BUSINESS.email}
- **Dirección:** ${BUSINESS.address.streetAddress}, ${BUSINESS.address.addressLocality}, estado ${BUSINESS.address.addressRegion}, Venezuela (mapa: ${BUSINESS.mapUrl})
- **Horario de atención comercial:** ${BUSINESS.hours}. Las máquinas instaladas funcionan 24/7.
- **Zona de servicio:** Lechería, Puerto La Cruz, Barcelona y el resto del estado Anzoátegui (Café Oriente: todo Anzoátegui, pronto el resto de Venezuela).
- **Instagram:** ${BUSINESS.instagram}
- **TikTok:** ${BUSINESS.tiktok}

## Qué ofrece

- **Máquinas de snacks:** galletas, chocolates, snacks salados y opciones saludables.
- **Máquinas de bebidas frías:** refrescos, jugos, agua y bebidas energéticas, 24 horas.
- **Café Oriente (café en grano):** estación automática Bianchi LEI 400 con molino integrado; muele el grano en el momento del pedido y sirve 10 bebidas en menos de 40 segundos, 100 % sin efectivo.
- **Vending deportivo:** bebidas energéticas, barras de proteínas e hidratación para gimnasios.
- **Instalación gratuita, reposición y mantenimiento incluidos:** el negocio anfitrión no compra, no alquila ni paga cuotas.
- **Pagos:** Pago Móvil, tarjetas de débito y crédito y, según el modelo, efectivo.

## Cómo funciona (para un negocio)

1. El negocio escribe por WhatsApp (${BUSINESS.phoneDisplay}), correo o formulario web.
2. Todo Vending CA visita el espacio sin compromiso: necesita aproximadamente 1,5 m × 1 m y una toma eléctrica.
3. Instala la máquina sin costo en la fecha acordada.
4. Repone los productos, limpia y da mantenimiento; el negocio no gestiona nada.

## Ubicaciones actuales (clientes reales)

${clients}

## Preguntas frecuentes (respuestas cortas)

- **¿Cuánto cuesta la instalación?** Nada. Sin compra, alquiler ni cuota mensual.
- **¿Quién abastece y repara?** Todo Vending CA, sin costo adicional.
- **¿Puedo elegir los productos?** Sí, la selección se adapta a cada ubicación.
- **¿Dónde instalan?** Lechería, Puerto La Cruz, Barcelona y el resto de Anzoátegui.
- **¿Qué es Café Oriente?** La marca de café en grano de Todo Vending CA, servida por una estación Bianchi LEI 400, 24/7 y sin efectivo. Instalación gratuita para empresas y clínicas; ya está en la Clínica Anzoátegui.

## Menú de Café Oriente

Bebidas con café (espresso de grano recién molido): Capuchino (espresso, leche y espuma a partes casi iguales); Mocachino (espresso, chocolate, leche, espuma y cacao); Café con Leche (más leche que café); Latte Vainilla (espresso, leche, vainilla y espuma); Capuchino Vainilla (como el latte, con más espuma); Café Marrón (mitad espresso, mitad leche); Café Largo Negro (espresso y agua).
Bebidas sin café: Chocolate Caliente (chocolate y agua); Chocolate con Leche (chocolate y leche); Té con Limón (té negro, limón y agua).

## Páginas

${pages}
`;
}
