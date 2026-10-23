// =====================================================================
// Configuración central del sitio. Fuente de verdad del negocio:
// nombre, contacto, servicios, planes, preguntas frecuentes.
// Mantener sincronizado con /llms.txt (se genera desde aquí automáticamente).
// =====================================================================

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.todowebdigital.com").replace(/\/$/, "");

export const site = {
  name: "TodoWeb Digital",
  legalName: "Todo Vending, C.A.",
  shortName: "TodoWeb",
  domain: "www.todowebdigital.com",
  url: SITE_URL,
  tagline: "Páginas web que venden y que la IA recomienda",
  description:
    "TodoWeb Digital es una agencia venezolana de diseño y desarrollo de páginas web. Creamos sitios rápidos, modernos y optimizados para SEO, GEO e IAO: posicionan en Google y aparecen en las respuestas de ChatGPT, Gemini, Claude y Perplexity.",
  foundedYear: 2024,
  locale: "es_VE",
  language: "es",
  email: "todovendingca@gmail.com",
  phone: "+584146164177",
  phoneDisplay: "+58 414-616-4177",
  whatsapp: "584146164177",
  whatsappMessage: "Hola, quiero una página web para mi negocio. ¿Me pueden ayudar?",
  address: {
    streetAddress: "Centro Comercial Venezuela, Local 11, Calle Nueva Esparta",
    addressLocality: "Lechería",
    addressRegion: "Anzoátegui",
    postalCode: "6016",
    addressCountry: "VE",
  },
  geo: { latitude: 10.1784238, longitude: -64.691242 },
  areaServed: ["Venezuela", "Lechería", "Puerto La Cruz", "Barcelona", "Caracas", "Latinoamérica"],
  social: {
    instagram: "https://instagram.com/todovendingca",
    tiktok: "https://tiktok.com/@todo.vending",
  },
  previousDomains: ["digital.todovendingca.com"],
  // Horario de atención (lunes a viernes 8-17, sábados 8-12)
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
    { days: ["Saturday"], opens: "08:00", closes: "12:00" },
  ],
} as const;

export function whatsappLink(message: string = site.whatsappMessage) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------
// Servicios (cada uno tiene su propia página /servicios/[slug])
// ---------------------------------------------------------------------
export type ServiceDef = {
  slug: string;
  name: string;
  short: string;
  headline: string;
  description: string;
  icon: "layout" | "search" | "sparkles" | "rocket" | "shopping-bag" | "wrench";
  features: string[];
  deliverables: string[];
  priceFrom: number; // USD, editable
  faq: { q: string; a: string }[];
  keywords: string[];
};

export const services: ServiceDef[] = [
  {
    slug: "diseno-de-paginas-web",
    name: "Diseño de páginas web",
    short: "Sitios corporativos modernos, rápidos y hechos para convertir.",
    headline: "Diseño de páginas web profesionales para empresas",
    description:
      "Diseñamos y desarrollamos páginas web corporativas a medida: modernas, rápidas (Core Web Vitals en verde), adaptadas a celulares y preparadas para posicionar en Google desde el primer día. Cada página incluye textos persuasivos, formulario de contacto, botón de WhatsApp y datos estructurados para buscadores e inteligencia artificial.",
    icon: "layout",
    features: [
      "Diseño a medida, sin plantillas genéricas",
      "100% adaptable a celulares y tablets",
      "Carga en menos de 2 segundos",
      "Textos orientados a vender",
      "Integración con WhatsApp y redes sociales",
      "Panel para editar contenido",
    ],
    deliverables: ["Sitio web publicado en tu dominio", "Certificado SSL (https)", "Google Business Profile vinculado", "Capacitación de 1 hora"],
    priceFrom: 499,
    faq: [
      { q: "¿Cuánto tarda el diseño de una página web?", a: "Una página corporativa de 5 a 8 secciones se entrega en 10 a 15 días hábiles desde que recibimos el contenido (logo, textos base y fotos). Una landing page puede estar lista en 5 días." },
      { q: "¿Puedo editar la página yo mismo después?", a: "Sí. Entregamos un panel de administración sencillo y una capacitación para que actualices textos, fotos y artículos sin depender de nadie." },
      { q: "¿El precio incluye dominio y hosting?", a: "El primer año de hosting está incluido en todos los planes. El dominio (.com, .com.ve) lo compramos a tu nombre y queda como propiedad tuya; su costo anual se cobra aparte." },
    ],
    keywords: ["diseño de páginas web", "diseño web Venezuela", "páginas web para empresas", "agencia de diseño web Lechería"],
  },
  {
    slug: "landing-pages",
    name: "Landing pages",
    short: "Una sola página enfocada en una meta: captar clientes.",
    headline: "Landing pages de alta conversión para campañas y lanzamientos",
    description:
      "Una landing page es una página de una sola pantalla larga con un único objetivo: que el visitante te escriba, se registre o compre. Las diseñamos con estructura probada (propuesta de valor, beneficios, prueba social, preguntas frecuentes y llamado a la acción) y las conectamos con WhatsApp, Meta Ads y Google Ads para medir cada contacto.",
    icon: "rocket",
    features: [
      "Entrega en 5 días hábiles",
      "Copywriting persuasivo incluido",
      "Formulario + WhatsApp + llamada directa",
      "Píxel de Meta y Google Tag listos",
      "Pruebas A/B de titulares",
    ],
    deliverables: ["Landing publicada", "Medición de conversiones configurada", "Versión para anuncios"],
    priceFrom: 249,
    faq: [
      { q: "¿Qué diferencia hay entre una landing page y una página web?", a: "La página web presenta todo tu negocio en varias secciones y páginas; la landing page se concentra en una sola oferta y en una sola acción (escribir por WhatsApp, agendar, comprar). Por eso convierte mejor en campañas de anuncios." },
      { q: "¿Sirve para campañas de Instagram y Google Ads?", a: "Sí, es su uso principal. Instalamos el píxel de Meta y la etiqueta de Google para que puedas medir cuántos contactos genera cada anuncio." },
    ],
    keywords: ["landing page", "página de aterrizaje", "landing page Venezuela", "página para campañas"],
  },
  {
    slug: "tiendas-online",
    name: "Tiendas online",
    short: "Vende las 24 horas con catálogo, carrito y pagos.",
    headline: "Tiendas online y catálogos digitales con pagos integrados",
    description:
      "Creamos tiendas en línea con catálogo de productos, carrito, cálculo de envío y pagos por Pago Móvil, Zelle, tarjetas o PayPal. También catálogos digitales que cierran la venta por WhatsApp, ideales para negocios que ya venden por redes sociales y quieren profesionalizar su operación.",
    icon: "shopping-bag",
    features: [
      "Catálogo ilimitado de productos",
      "Carrito y checkout por WhatsApp o pasarela",
      "Pago Móvil, Zelle, tarjetas y PayPal",
      "Inventario y pedidos desde un panel",
      "Fichas de producto optimizadas para Google Shopping",
    ],
    deliverables: ["Tienda publicada", "Carga inicial de hasta 50 productos", "Capacitación del panel"],
    priceFrom: 899,
    faq: [
      { q: "¿Qué métodos de pago puedo aceptar en Venezuela?", a: "Pago Móvil, transferencias, Zelle, Binance Pay, tarjetas internacionales (Stripe o PayPal) y pago contra entrega. Configuramos los que uses en tu negocio." },
      { q: "¿Puedo manejar el inventario yo mismo?", a: "Sí. El panel permite agregar productos, cambiar precios, marcar agotados y ver pedidos desde el celular." },
    ],
    keywords: ["tienda online", "tienda virtual Venezuela", "catálogo digital", "ecommerce Venezuela"],
  },
  {
    slug: "seo",
    name: "Posicionamiento SEO",
    short: "Aparece primero en Google cuando buscan lo que vendes.",
    headline: "Posicionamiento SEO: más visitas que compran, sin pagar anuncios",
    description:
      "El SEO (Search Engine Optimization) es el conjunto de mejoras técnicas y de contenido que hacen que tu página aparezca en los primeros resultados de Google. Auditamos tu sitio, corregimos lo técnico (velocidad, indexación, datos estructurados), investigamos las palabras clave que usan tus clientes y creamos contenido que responde a esas búsquedas. Reportamos resultados cada mes con datos de Google Search Console.",
    icon: "search",
    features: [
      "Auditoría técnica con puntuación 0-100",
      "Investigación de palabras clave",
      "SEO local: Google Maps y Business Profile",
      "Datos estructurados (schema.org)",
      "Artículos de blog mensuales",
      "Reporte mensual claro, sin tecnicismos",
    ],
    deliverables: ["Informe de auditoría", "Plan de palabras clave", "Optimización on-page", "Reporte mensual"],
    priceFrom: 199,
    faq: [
      { q: "¿Cuánto tarda el SEO en dar resultados?", a: "Las mejoras técnicas se notan en 2 a 4 semanas; el posicionamiento en palabras clave competidas toma de 3 a 6 meses. El SEO es acumulativo: cada mes construye sobre el anterior." },
      { q: "¿Qué es el SEO local?", a: "Es optimizar tu presencia para búsquedas con intención de cercanía, como 'diseño web en Lechería' o 'cerca de mí'. Incluye Google Business Profile, reseñas, datos de contacto consistentes y páginas por ciudad." },
    ],
    keywords: ["SEO Venezuela", "posicionamiento web", "agencia SEO", "SEO local Lechería", "aparecer en Google"],
  },
  {
    slug: "geo-iao-optimizacion-para-ia",
    name: "GEO e IAO: optimización para IA",
    short: "Que ChatGPT, Gemini y Claude recomienden tu negocio.",
    headline: "GEO e IAO: optimización para que la inteligencia artificial recomiende tu negocio",
    description:
      "Cada vez más personas preguntan a ChatGPT, Gemini, Claude o Perplexity en lugar de buscar en Google. GEO (Generative Engine Optimization) e IAO (optimización para inteligencia artificial) es preparar tu sitio para que esos asistentes lo entiendan, lo citen y lo recomienden: contenido claro y verificable, datos estructurados completos, archivo llms.txt, permisos correctos para los rastreadores de IA y respuestas directas a las preguntas de tus clientes.",
    icon: "sparkles",
    features: [
      "Archivo llms.txt y llms-full.txt",
      "Datos estructurados completos (Organization, Service, FAQ)",
      "Robots.txt abierto a GPTBot, ClaudeBot, PerplexityBot y Google-Extended",
      "Contenido en formato pregunta-respuesta",
      "Menciones y citas verificables de tu marca",
      "Monitoreo de cómo te describe la IA",
    ],
    deliverables: ["Auditoría GEO/IAO", "Implementación técnica", "Guía de contenido para IA", "Informe de visibilidad en IA"],
    priceFrom: 299,
    faq: [
      { q: "¿Qué es GEO (Generative Engine Optimization)?", a: "GEO es optimizar un sitio web para que los motores de respuesta basados en inteligencia artificial, como ChatGPT, Gemini, Perplexity o Claude, lo usen como fuente y lo citen en sus respuestas. Se centra en claridad, estructura, datos verificables y autoridad." },
      { q: "¿Qué es IAO (optimización para inteligencia artificial)?", a: "IAO, también llamado AIO (AI Optimization), es el término general para preparar tu presencia digital de modo que los sistemas de IA puedan leerla, entenderla y recomendarla. Incluye GEO y además la optimización de datos estructurados, fichas de negocio y archivos como llms.txt." },
      { q: "¿GEO reemplaza al SEO?", a: "No. Se complementan. El SEO te posiciona en los resultados tradicionales de Google; el GEO te hace aparecer en las respuestas generadas por IA. Un sitio bien construido trabaja para ambos a la vez." },
    ],
    keywords: ["GEO", "Generative Engine Optimization", "IAO", "AIO", "optimización para ChatGPT", "aparecer en ChatGPT", "SEO para inteligencia artificial"],
  },
  {
    slug: "mantenimiento-web",
    name: "Mantenimiento web",
    short: "Tu sitio siempre actualizado, seguro y en línea.",
    headline: "Mantenimiento y soporte web mensual",
    description:
      "Nos encargamos de que tu página siga funcionando: actualizaciones de seguridad, respaldos, monitoreo de caída, cambios de contenido y mejoras continuas. Para negocios que quieren un equipo técnico de respaldo sin contratar personal.",
    icon: "wrench",
    features: [
      "Monitoreo 24/7 y aviso de caídas",
      "Respaldos semanales",
      "Hasta 4 cambios de contenido al mes",
      "Actualizaciones de seguridad",
      "Soporte por WhatsApp en horario laboral",
    ],
    deliverables: ["Reporte mensual de estado", "Respaldos", "Cambios solicitados aplicados"],
    priceFrom: 49,
    faq: [
      { q: "¿Qué pasa si mi página se cae un fin de semana?", a: "El monitoreo nos avisa en minutos y el servicio se restablece normalmente en menos de una hora. El plan incluye la gestión con el proveedor de hosting." },
    ],
    keywords: ["mantenimiento web", "soporte web", "hosting Venezuela", "actualizar página web"],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

// ---------------------------------------------------------------------
// Planes (precios en USD, editables)
// ---------------------------------------------------------------------
export const plans = [
  {
    id: "impulso",
    name: "Impulso",
    audience: "Para lanzar una oferta o campaña",
    price: 249,
    period: "pago único",
    highlight: false,
    features: [
      "Landing page de 1 página",
      "Diseño a medida y textos persuasivos",
      "Botón de WhatsApp y formulario",
      "SEO básico + datos estructurados",
      "Hosting 1 año incluido",
      "Entrega en 5 días hábiles",
    ],
    cta: "Quiero mi landing",
  },
  {
    id: "crecimiento",
    name: "Crecimiento",
    audience: "Para empresas que quieren clientes de Google",
    price: 499,
    period: "pago único",
    highlight: true,
    features: [
      "Sitio web de hasta 8 secciones/páginas",
      "Blog con panel de administración",
      "SEO completo + GEO/IAO (llms.txt, schema)",
      "Google Business Profile vinculado",
      "Hosting 1 año + SSL incluido",
      "Capacitación y soporte 30 días",
    ],
    cta: "Quiero mi sitio web",
  },
  {
    id: "escala",
    name: "Escala",
    audience: "Para vender en línea o proyectos a medida",
    price: 899,
    period: "desde",
    highlight: false,
    features: [
      "Tienda online o aplicación web a medida",
      "Catálogo, carrito y pagos (Pago Móvil, Zelle, tarjetas)",
      "Integraciones (CRM, WhatsApp API, facturación)",
      "SEO + GEO/IAO avanzado",
      "Hosting 1 año + SSL incluido",
      "Soporte prioritario 60 días",
    ],
    cta: "Quiero cotizar",
  },
] as const;

// ---------------------------------------------------------------------
// Preguntas frecuentes generales (schema FAQPage en la página principal)
// ---------------------------------------------------------------------
export const generalFaq = [
  {
    q: "¿Cuánto cuesta una página web en Venezuela?",
    a: "En TodoWeb Digital una landing page profesional parte de $249, un sitio web corporativo completo de $499 y una tienda online de $899 (pago único). Todos incluyen diseño a medida, hosting por un año, certificado SSL y optimización SEO, GEO e IAO.",
  },
  {
    q: "¿Qué significa que una página esté optimizada para SEO, GEO e IAO?",
    a: "SEO es aparecer en los primeros resultados de Google. GEO (Generative Engine Optimization) es aparecer en las respuestas de asistentes como ChatGPT, Gemini o Perplexity. IAO (optimización para inteligencia artificial) es el conjunto de prácticas técnicas y de contenido que permiten que la IA entienda y recomiende tu negocio. Nuestras páginas se construyen con las tres desde el primer día.",
  },
  {
    q: "¿Cuánto tiempo toma tener mi página web lista?",
    a: "Una landing page se entrega en 5 días hábiles; un sitio corporativo en 10 a 15 días hábiles; una tienda online en 3 a 4 semanas. El tiempo empieza a contar cuando recibimos tu logo, textos base y fotos.",
  },
  {
    q: "¿Trabajan con clientes fuera de Lechería o fuera de Venezuela?",
    a: "Sí. Estamos en Lechería, Anzoátegui, y trabajamos 100% en remoto con clientes de toda Venezuela y Latinoamérica. Las reuniones son por videollamada o WhatsApp y los pagos pueden hacerse en bolívares, dólares o USDT.",
  },
  {
    q: "¿Puedo ver ejemplos de páginas que hayan creado?",
    a: "Sí. En la sección Portafolio mostramos los sitios que hemos desarrollado junto con su puntuación de optimización SEO y GEO, medida con nuestra propia herramienta de auditoría.",
  },
  {
    q: "¿La página será mía o de ustedes?",
    a: "Es tuya. El dominio se registra a tu nombre y recibes acceso completo al panel y al código. Si algún día decides cambiar de proveedor, te llevas todo.",
  },
];

// Proceso de trabajo (schema HowTo / ItemList)
export const processSteps = [
  { title: "Diagnóstico gratis", text: "Conversamos 20 minutos sobre tu negocio, tus clientes y tu competencia. Auditamos tu web actual si la tienes." },
  { title: "Propuesta y diseño", text: "Te enviamos propuesta con alcance, precio y fecha de entrega. Diseñamos la estructura y el estilo visual para tu aprobación." },
  { title: "Desarrollo optimizado", text: "Construimos el sitio con velocidad, SEO, GEO e IAO integrados: datos estructurados, llms.txt, textos claros y medición." },
  { title: "Lanzamiento y crecimiento", text: "Publicamos en tu dominio, lo conectamos a Google y te capacitamos. Luego medimos y mejoramos cada mes." },
];

export const stats = [
  { value: "< 2 s", label: "Tiempo de carga objetivo" },
  { value: "90+", label: "Puntuación SEO en nuestros sitios" },
  { value: "100%", label: "Sitios legibles por IA (llms.txt + schema)" },
  { value: "5 días", label: "Para una landing page" },
];
