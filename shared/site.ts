// Fuente única de verdad del negocio y del mapa del sitio.
// La usan el cliente (header, footer, schema.org) y el servidor (sitemap.xml,
// robots.txt, llms.txt). Si un dato cambia, cambia aquí y en ningún otro lado.

export const SITE_URL = "https://www.todovendingca.com";

export const BUSINESS = {
  name: "Todo Vending CA",
  legalName: "Todo Vending, C.A.",
  rif: "J-50669921-4",
  email: "todovendingca@gmail.com",
  phone: "+584146164177",
  phoneDisplay: "+58 414-616-4177",
  whatsapp: "584146164177",
  address: {
    streetAddress: "Centro Comercial Venezuela, Local 11, Calle Nueva Esparta",
    addressLocality: "Lechería",
    addressRegion: "Anzoátegui",
    postalCode: "6016",
    addressCountry: "VE",
  },
  // Derivadas de https://maps.app.goo.gl/JuHxKWCBBZS8tYwS9
  geo: { latitude: 10.1784238, longitude: -64.691242 },
  mapUrl: "https://maps.app.goo.gl/JuHxKWCBBZS8tYwS9",
  instagram: "https://instagram.com/todovendingca",
  tiktok: "https://tiktok.com/@todo.vending",
  hours: "Lunes a viernes 8:00–17:00 · Sábados 8:00–12:00",
  serviceArea: ["Lechería", "Puerto La Cruz", "Barcelona", "Anzoátegui"],
} as const;

// Clientes reales (publicados ya en el sitio). No inventar ninguno.
export const CLIENTS = [
  { name: "Clínica Anzoátegui", type: "Clínica", note: "Snacks, bebidas y estación Café Oriente" },
  { name: "Clínica Zambrano", type: "Clínica", note: "Snacks y bebidas 24 horas" },
  { name: "Centro Empresarial Colón", type: "Oficinas", note: "Snacks y bebidas para profesionales" },
  { name: "Centro Empresarial Oleus", type: "Oficinas", note: "Vending para oficinas y visitantes" },
  { name: "Colegio El Manglar", type: "Educación", note: "Snacks y bebidas para estudiantes y personal" },
  { name: "Lion Gym", type: "Gimnasio", note: "Bebidas energéticas y barras de proteínas" },
  { name: "Cancha 3x3 Parque Caribe", type: "Deportes", note: "Playa Cangrejo, Lechería" },
] as const;

// Mensajes de WhatsApp distintos por página: la primera línea de cada chat
// dice desde dónde escribió la persona. Es la única atribución que no depende
// de analítica.
export const WA_MESSAGES = {
  home: "Hola, vi www.todovendingca.com y quiero una máquina expendedora para mi negocio",
  empresas: "Hola, quiero vending para mi empresa u oficina (vi la web)",
  clinicas: "Hola, quiero una máquina expendedora para mi clínica (vi la web)",
  gimnasios: "Hola, quiero vending deportivo para mi gimnasio (vi la web)",
  lecheria: "Hola, tengo un espacio en Lechería y quiero una máquina expendedora (vi la web)",
  faq: "Hola, tengo una pregunta sobre las máquinas expendedoras (vi la web)",
  cafeHero: "Hola, vi Café Oriente en la web y quiero la estación en mi empresa",
  cafeCierre: "Hola, quiero pedir una estación Café Oriente para mi empresa",
  cafeEmpresas: "Hola, quiero instalar una estación Café Oriente en mi empresa",
  cafeSticky: "Hola, quiero información de Café Oriente para mi empresa",
} as const;

export type WaMessageKey = keyof typeof WA_MESSAGES;

export function waLink(message: string = WA_MESSAGES.home): string {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}

export type RouteDef = {
  path: string;
  /** Texto corto para menús */
  label: string;
  /** <title> de la página (≤ 60 caracteres) */
  title: string;
  /** meta description (≤ 155 caracteres) */
  description: string;
  /** Qué encuentra un modelo de IA en la página (para llms.txt) */
  summary: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  /** Aparece en el menú principal */
  nav?: boolean;
  /** Página estática servida por Express, fuera de React */
  static?: boolean;
  /** No listar en sitemap ni llms.txt (noindex) */
  hidden?: boolean;
};

const LASTMOD = "2026-10-23";

export const ROUTES: RouteDef[] = [
  {
    path: "/",
    label: "Inicio",
    title: "Máquinas Expendedoras en Venezuela | Todo Vending CA",
    description:
      "Máquinas expendedoras de snacks, bebidas y café en grano, instaladas gratis en Lechería, Puerto La Cruz y Barcelona. Reposición y mantenimiento incluidos.",
    summary:
      "Presentación de Todo Vending CA, servicios, cómo funciona la instalación gratuita, ubicaciones actuales, preguntas frecuentes y formulario de contacto.",
    lastmod: LASTMOD,
    changefreq: "weekly",
    priority: 1.0,
  },
  {
    path: "/cafe-oriente",
    label: "Café Oriente",
    title: "Café Oriente: Máquina de Café en Grano 24/7 | Todo Vending CA",
    description:
      "Café en grano recién molido por una estación Bianchi LEI 400, para empresas y clínicas de Anzoátegui. 10 bebidas, sin efectivo, instalación gratis.",
    summary:
      "Página de la marca de café Café Oriente: estación Bianchi LEI 400, las diez bebidas del menú con sus ingredientes, medios de pago digitales, instalación gratuita para empresas y preguntas frecuentes.",
    lastmod: LASTMOD,
    changefreq: "monthly",
    priority: 0.9,
    nav: true,
    static: true,
  },
  {
    path: "/vending-para-empresas",
    label: "Empresas",
    title: "Vending para Empresas y Oficinas en Anzoátegui | Todo Vending CA",
    description:
      "Máquinas expendedoras para empresas y oficinas en Anzoátegui. Sin costo de instalación ni cuotas, con reposición y mantenimiento incluidos.",
    summary:
      "Vending para oficinas y centros empresariales: beneficios para la empresa, qué incluye el servicio, clientes actuales y preguntas frecuentes.",
    lastmod: LASTMOD,
    changefreq: "monthly",
    priority: 0.8,
    nav: true,
  },
  {
    path: "/vending-para-clinicas",
    label: "Clínicas",
    title: "Máquinas Expendedoras para Clínicas y Hospitales | Todo Vending CA",
    description:
      "Vending 24 horas para clínicas y hospitales en Anzoátegui: snacks, bebidas y café en grano para pacientes y personal de guardia. Instalación gratuita.",
    summary:
      "Vending para clínicas y hospitales: disponibilidad 24 horas, higiene y pagos sin efectivo, café en grano para el personal de guardia, clientes actuales (Clínica Anzoátegui, Clínica Zambrano) y preguntas frecuentes.",
    lastmod: LASTMOD,
    changefreq: "monthly",
    priority: 0.8,
    nav: true,
  },
  {
    path: "/vending-gimnasios",
    label: "Gimnasios",
    title: "Vending para Gimnasios: Energéticas y Proteínas | Todo Vending CA",
    description:
      "Máquinas expendedoras para gimnasios en Anzoátegui: bebidas energéticas, barras de proteínas y snacks deportivos. Instalación gratis y reposición incluida.",
    summary:
      "Vending deportivo para gimnasios y centros deportivos: productos (energéticas, proteínas, hidratación), gimnasios donde ya opera y preguntas frecuentes.",
    lastmod: LASTMOD,
    changefreq: "monthly",
    priority: 0.8,
    nav: true,
  },
  {
    path: "/maquinas-expendedoras-lecheria",
    label: "Lechería",
    title: "Máquinas Expendedoras en Lechería, Anzoátegui | Todo Vending CA",
    description:
      "Empresa local de máquinas expendedoras en Lechería: instalación gratuita, reposición y mantenimiento 24/7 para oficinas, clínicas, colegios y gimnasios.",
    summary:
      "Vending local en Lechería: sede en el Centro Comercial Venezuela, zona de servicio (Lechería, Puerto La Cruz, Barcelona), clientes actuales y preguntas frecuentes.",
    lastmod: LASTMOD,
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/preguntas-frecuentes",
    label: "Preguntas",
    title: "Preguntas Frecuentes sobre Máquinas Expendedoras | Todo Vending CA",
    description:
      "Respuestas claras sobre costos, instalación, espacio, productos, pagos, mantenimiento y zonas de servicio de las máquinas expendedoras de Todo Vending CA.",
    summary:
      "Todas las preguntas frecuentes del sitio en una sola página: costo (gratis), espacio, electricidad, productos, pagos, mantenimiento, zonas, Café Oriente y cómo solicitar una máquina.",
    lastmod: LASTMOD,
    changefreq: "monthly",
    priority: 0.7,
    nav: true,
  },
  {
    path: "/vasos",
    label: "Encuesta de vasos",
    title: "¡Gracias por tu Café Oriente!",
    description: "Encuesta anónima de calidad de los vasos de Café Oriente.",
    summary: "Encuesta interna (no indexable).",
    lastmod: LASTMOD,
    changefreq: "yearly",
    priority: 0.1,
    static: true,
    hidden: true,
  },
];

export const NAV_ROUTES = ROUTES.filter((r) => r.nav);
export const SITEMAP_ROUTES = ROUTES.filter((r) => !r.hidden);

export function routeByPath(path: string): RouteDef | undefined {
  return ROUTES.find((r) => r.path === path);
}
