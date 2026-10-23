// Bloques de datos estructurados (schema.org) reutilizables entre páginas.
// Los datos del negocio viven en shared/site.ts; aquí solo se da forma.
import { SITE_URL, BUSINESS, CLIENTS, routeByPath } from "@shared/site";
import type { FAQ } from "@/content/faqs";

export { SITE_URL };
export const BUSINESS_EMAIL = BUSINESS.email;
export const BUSINESS_PHONE = BUSINESS.phone;
export const BUSINESS_PHONE_DISPLAY = BUSINESS.phoneDisplay;

export const ID = {
  organization: `${SITE_URL}/#organization`,
  localBusiness: `${SITE_URL}/#localbusiness`,
  website: `${SITE_URL}/#website`,
  cafeBrand: `${SITE_URL}/cafe-oriente#brand`,
  cafeService: `${SITE_URL}/cafe-oriente#service`,
};

const LOGO = `${SITE_URL}/logo.png`;
const OG = `${SITE_URL}/og-image-v2.jpg`;

const sameAs = [BUSINESS.instagram, BUSINESS.tiktok, `https://wa.me/${BUSINESS.whatsapp}`];

const areaServed = [
  { "@type": "City", name: "Lechería" },
  { "@type": "City", name: "Puerto La Cruz" },
  { "@type": "City", name: "Barcelona" },
  { "@type": "State", name: "Anzoátegui", containedInPlace: { "@type": "Country", name: "Venezuela" } },
];

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": ID.website,
  name: BUSINESS.name,
  alternateName: ["Todo Vending", "TodoVending"],
  url: `${SITE_URL}/`,
  description:
    "Empresa venezolana de máquinas expendedoras con instalación gratuita, reposición y mantenimiento 24/7 en Lechería, Anzoátegui.",
  inLanguage: "es-VE",
  publisher: { "@id": ID.organization },
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ID.organization,
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  alternateName: ["Todo Vending", "TodoVending", "TodoVending, C.A."],
  taxID: BUSINESS.rif,
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: LOGO, width: 512, height: 512 },
  image: OG,
  description:
    "Empresa venezolana de máquinas expendedoras (vending) con sede en Lechería, Anzoátegui. Instala máquinas de snacks, bebidas, café en grano y productos deportivos en empresas, clínicas, colegios y gimnasios, con instalación gratuita, reposición y mantenimiento incluidos.",
  foundingLocation: { "@type": "Place", name: "Lechería, Anzoátegui, Venezuela" },
  areaServed,
  brand: { "@id": ID.cafeBrand },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: BUSINESS.phone,
      email: BUSINESS.email,
      contactType: "sales",
      availableLanguage: ["Spanish"],
      areaServed: "VE",
    },
  ],
  sameAs,
  knowsAbout: [
    "Máquinas expendedoras",
    "Vending",
    "Máquinas de snacks",
    "Máquinas de bebidas",
    "Máquinas de café en grano",
    "Vending para gimnasios",
    "Instalación de máquinas expendedoras",
    "Mantenimiento de máquinas expendedoras",
  ],
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": ID.localBusiness,
  name: BUSINESS.name,
  image: OG,
  logo: LOGO,
  description:
    "Máquinas expendedoras en Lechería, Anzoátegui: instalación gratuita, reposición y mantenimiento 24/7 para empresas, clínicas, colegios y gimnasios.",
  url: `${SITE_URL}/`,
  telephone: BUSINESS.phone,
  email: BUSINESS.email,
  address: { "@type": "PostalAddress", ...BUSINESS.address },
  hasMap: BUSINESS.mapUrl,
  geo: { "@type": "GeoCoordinates", ...BUSINESS.geo },
  areaServed,
  // Horario comercial real. Las máquinas instaladas funcionan 24/7, pero ese
  // es un atributo del servicio, no del horario de atención.
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "08:00", closes: "12:00" },
  ],
  priceRange: "$$",
  currenciesAccepted: "VES, USD",
  paymentAccepted: "Pago Móvil, Tarjeta de débito, Tarjeta de crédito, Efectivo",
  sameAs,
  parentOrganization: { "@id": ID.organization },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de máquinas expendedoras de Todo Vending CA",
    itemListElement: [
      offer("Máquinas de snacks", "Máquina expendedora de snacks", "Snacks, galletas, chocolates y opciones saludables."),
      offer("Máquinas de bebidas frías", "Máquina expendedora de bebidas", "Refrescos, jugos, agua y bebidas energéticas siempre frías."),
      offer("Máquinas de café en grano (Café Oriente)", "Máquina expendedora de café", "Estación Bianchi LEI 400: espresso, capuchino, mocachino y más, en menos de 40 segundos."),
      offer("Vending deportivo", "Máquina expendedora para gimnasios", "Bebidas energéticas, barras de proteínas e hidratación."),
      offer("Instalación gratuita, reposición y mantenimiento", "Instalación de máquinas expendedoras", "Instalación sin costo, reposición de inventario y mantenimiento técnico incluidos."),
    ],
  },
};

function offer(name: string, serviceType: string, description: string) {
  return {
    "@type": "Offer",
    itemOffered: { "@type": "Service", name, serviceType, description, provider: { "@id": ID.organization } },
  };
}

export const cafeOrienteBrandSchema = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": ID.cafeBrand,
  name: "Café Oriente",
  description:
    "Marca de café de Todo Vending CA: café en grano recién molido servido por la estación automática Bianchi LEI 400. Capuchino, mocachino, café con leche, latte de vainilla y más, en menos de 40 segundos, 24/7 y sin efectivo.",
  url: `${SITE_URL}/cafe-oriente`,
  logo: LOGO,
  slogan: "El respiro que tu jornada necesita",
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqSchema(items: Pick<FAQ, "question" | "answer">[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function webPageSchema(path: string, extra: Record<string, unknown> = {}) {
  const r = routeByPath(path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name: r?.title,
    description: r?.description,
    inLanguage: "es-VE",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.organization },
    publisher: { "@id": ID.organization },
    primaryImageOfPage: { "@type": "ImageObject", url: OG, width: 1200, height: 630 },
    dateModified: r?.lastmod,
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".speakable"] },
    ...extra,
  };
}

export function serviceSchema(opts: {
  path: string;
  name: string;
  serviceType: string;
  description: string;
  audience: string;
  area?: unknown;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${opts.path}#service`,
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    provider: { "@id": ID.organization },
    areaServed: opts.area ?? areaServed,
    audience: { "@type": "Audience", audienceType: opts.audience },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      description: "Instalación gratuita; reposición y mantenimiento incluidos. Sin alquiler ni cuota mensual para el negocio anfitrión.",
    },
  };
}

export const clientsItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Ubicaciones actuales de máquinas expendedoras de Todo Vending CA",
  numberOfItems: CLIENTS.length,
  itemListElement: CLIENTS.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    description: `${c.type}: ${c.note}`,
  })),
};

export const homeHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Cómo conseguir una máquina expendedora gratis para tu negocio en Anzoátegui",
  description:
    "Pasos para solicitar e instalar una máquina expendedora de Todo Vending CA en una empresa, clínica, colegio o gimnasio de Lechería, Puerto La Cruz o Barcelona.",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  supply: [
    { "@type": "HowToSupply", name: "Espacio de aproximadamente 1,5 m × 1 m" },
    { "@type": "HowToSupply", name: "Toma eléctrica accesible" },
  ],
  step: [
    { "@type": "HowToStep", position: 1, name: "Contactar a Todo Vending CA", text: `Escribe por WhatsApp al ${BUSINESS.phoneDisplay}, envía un correo a ${BUSINESS.email} o llena el formulario en www.todovendingca.com.`, url: `${SITE_URL}/#contacto` },
    { "@type": "HowToStep", position: 2, name: "Evaluación del espacio", text: "El equipo visita el lugar sin compromiso, confirma el espacio y la toma eléctrica y recomienda el tipo de máquina.", url: `${SITE_URL}/#como-funciona` },
    { "@type": "HowToStep", position: 3, name: "Instalación gratuita", text: "Todo Vending CA instala y configura la máquina sin costo en la fecha acordada.", url: `${SITE_URL}/#como-funciona` },
    { "@type": "HowToStep", position: 4, name: "Reposición y mantenimiento", text: "Todo Vending CA repone los productos y da mantenimiento continuo; el negocio no gestiona nada.", url: `${SITE_URL}/#servicios` },
  ],
};
