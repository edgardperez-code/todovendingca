// Bloques de datos estructurados (schema.org) reutilizables entre páginas.
// Fuente de verdad de los datos del negocio: mantener sincronizado con llms.txt.

export const SITE_URL = "https://www.todovendingca.com";
export const BUSINESS_EMAIL = "todovendingca@gmail.com";
export const BUSINESS_PHONE = "+584146164177";
export const BUSINESS_PHONE_DISPLAY = "+58 414-616-4177";

// Coordenadas reales: Centro Comercial Venezuela, Local 11, calle Nueva Esparta, Lechería.
// Derivadas de https://maps.app.goo.gl/JuHxKWCBBZS8tYwS9 (resuelve a "Venezuela Mall").
export const BUSINESS_GEO = { latitude: 10.1784238, longitude: -64.691242 };
export const BUSINESS_MAP_URL = "https://maps.app.goo.gl/JuHxKWCBBZS8tYwS9";
export const BUSINESS_ADDRESS = {
  streetAddress: "Centro Comercial Venezuela, Local 11, Calle Nueva Esparta",
  addressLocality: "Lechería",
  addressRegion: "Anzoátegui",
  addressCountry: "VE",
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Todo Vending CA",
  alternateName: "Todo Vending",
  url: `${SITE_URL}/`,
  description:
    "Empresa venezolana de máquinas expendedoras con instalación gratuita, mantenimiento 24/7 y reposición incluida en Lechería, Anzoátegui.",
  inLanguage: "es",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Todo Vending CA",
  legalName: "Todo Vending, C.A.",
  alternateName: ["Todo Vending", "TodoVending"],
  url: `${SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/og-image.jpg`,
  description:
    "Empresa líder en soluciones de máquinas expendedoras en Venezuela. Ofrecemos snacks, bebidas, café, bebidas energéticas y barras de proteínas con instalación gratuita, mantenimiento y reposición incluida.",
  foundingLocation: { "@type": "Place", name: "Lechería, Anzoátegui, Venezuela" },
  areaServed: {
    "@type": "State",
    name: "Anzoátegui",
    containedInPlace: { "@type": "Country", name: "Venezuela" },
  },
  brand: { "@id": `${SITE_URL}/#cafeoriente` },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: BUSINESS_PHONE,
      contactType: "customer service",
      availableLanguage: ["Spanish"],
      areaServed: "VE",
    },
    {
      "@type": "ContactPoint",
      email: BUSINESS_EMAIL,
      contactType: "sales",
      availableLanguage: ["Spanish"],
    },
  ],
  sameAs: [
    "https://instagram.com/todovendingca",
    "https://tiktok.com/@todo.vending",
    "https://wa.me/584146164177",
  ],
  knowsAbout: [
    "Máquinas Expendedoras",
    "Vending Machines",
    "Snacks",
    "Bebidas",
    "Café",
    "Bebidas Energéticas",
    "Barras de Proteínas",
    "Mantenimiento de Máquinas Expendedoras",
    "Instalación de Máquinas Expendedoras",
  ],
};

// aggregateRating: activar cuando haya reseñas verificadas en Google Business Profile.
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#localbusiness`,
  name: "Todo Vending CA",
  image: `${SITE_URL}/og-image.jpg`,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Empresa líder en máquinas expendedoras en Venezuela. Instalación gratuita, mantenimiento 24/7 y reposición incluida en Lechería, Anzoátegui.",
  url: `${SITE_URL}/`,
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  address: { "@type": "PostalAddress", ...BUSINESS_ADDRESS },
  hasMap: BUSINESS_MAP_URL,
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS_GEO.latitude,
    longitude: BUSINESS_GEO.longitude,
  },
  areaServed: [
    { "@type": "City", name: "Lechería" },
    { "@type": "City", name: "Puerto La Cruz" },
    { "@type": "City", name: "Barcelona" },
    { "@type": "State", name: "Anzoátegui" },
  ],
  // Horario COMERCIAL real (atención al cliente). La disponibilidad 24/7 es de las
  // máquinas ya instaladas, no del negocio — se comunica como contenido, no como horario.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "08:00",
      closes: "12:00",
    },
  ],
  priceRange: "$$",
  currenciesAccepted: "VES, USD",
  paymentAccepted: "Cash, Credit Card, Debit Card, Mobile Payment",
  sameAs: [
    "https://instagram.com/todovendingca",
    "https://tiktok.com/@todo.vending",
    "https://wa.me/584146164177",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de Máquinas Expendedoras Todo Vending CA",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Máquinas de Snacks",
          serviceType: "Máquina Expendedora de Snacks",
          description: "Máquinas expendedoras de snacks, galletas, chocolates y opciones saludables",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Máquinas de Bebidas",
          serviceType: "Máquina Expendedora de Bebidas",
          description: "Máquinas expendedoras de bebidas frías: refrescos, jugos, agua y bebidas energéticas",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Máquinas de Café",
          serviceType: "Máquina Expendedora de Café",
          description: "Estaciones de café en grano recién molido: espresso, capuchino, mocachino y más (Café Oriente)",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Instalación Gratuita",
          serviceType: "Instalación de Máquinas Expendedoras",
          description: "Instalación profesional sin costo para el cliente",
        },
      },
    ],
  },
};

export const cafeOrienteBrandSchema = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": `${SITE_URL}/#cafeoriente`,
  name: "Café Oriente",
  description:
    "Marca de café de Todo Vending CA: café premium en grano recién molido, servido por la estación automática Bianchi LEI 400 (Italia). Capuchino, café con leche, mocachino, latte de vainilla y más, listo en menos de 40 segundos, disponible 24/7 y 100% sin efectivo (Pago Móvil, débito y crédito).",
  url: `${SITE_URL}/cafe-oriente`,
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

export function faqSchema(items: { question: string; answer: string }[]) {
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

export const homeServicesItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Servicios de Todo Vending CA",
  description: "Lista completa de servicios de máquinas expendedoras ofrecidos por Todo Vending CA en Venezuela",
  url: `${SITE_URL}/#servicios`,
  numberOfItems: 8,
  itemListElement: [
    { position: 1, name: "Máquinas Expendedoras de Snacks", id: "service-snacks", serviceType: "Máquina Expendedora de Snacks", description: "Amplia variedad de snacks, galletas, chocolates y opciones saludables. Marcas reconocidas con productos frescos renovados periódicamente." },
    { position: 2, name: "Máquinas Expendedoras de Bebidas", id: "service-bebidas", serviceType: "Máquina Expendedora de Bebidas", description: "Refrescos, jugos, agua y bebidas energéticas siempre frías. Gran variedad de marcas a precios accesibles, disponibles las 24 horas." },
    { position: 3, name: "Máquinas Expendedoras de Café — Café Oriente", id: "service-cafe", serviceType: "Máquina Expendedora de Café", description: "Café premium en grano recién molido con la estación automática Bianchi LEI 400: capuchino, café con leche, mocachino, latte de vainilla y más, en menos de 40 segundos." },
    { position: 4, name: "Máquinas de Bebidas Energéticas y Proteínas", id: "service-energeticas", serviceType: "Máquina Expendedora para Gimnasio", description: "Bebidas energéticas, barras de proteínas y suplementos deportivos para gimnasios y centros deportivos en Lechería." },
    { position: 5, name: "Instalación Profesional Gratuita", id: "service-instalacion", serviceType: "Instalación de Máquinas Expendedoras", description: "Instalamos tu máquina expendedora sin ningún costo. Incluye configuración completa, capacitación y puesta en marcha. Sin compromisos." },
    { position: 6, name: "Reposición de Inventario", id: "service-reposicion", serviceType: "Reposición de Productos Vending", description: "Máquinas siempre abastecidas con productos frescos y variados. Visitas regulares según el consumo de cada ubicación, sin costo adicional." },
    { position: 7, name: "Mantenimiento Técnico 24/7", id: "service-mantenimiento", serviceType: "Mantenimiento de Máquinas Expendedoras", description: "Mantenimiento preventivo y correctivo 24/7 con respuesta rápida y garantía total, sin costo adicional." },
    { position: 8, name: "Monitoreo Remoto", id: "service-monitoreo", serviceType: "Monitoreo de Máquinas Expendedoras", description: "Vigilancia del funcionamiento de las máquinas en tiempo real con alertas automáticas para garantizar disponibilidad continua." },
  ].map((s) => ({
    "@type": "ListItem",
    position: s.position,
    item: {
      "@type": "Service",
      "@id": `${SITE_URL}/#${s.id}`,
      name: s.name,
      serviceType: s.serviceType,
      description: s.description,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "State", name: "Anzoátegui" },
      ...(s.id !== "service-monitoreo"
        ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Instalación gratuita", availability: "https://schema.org/InStock" } }
        : {}),
    },
  })),
};

export const homeFaqSchema = faqSchema([
  { question: "¿Tiene algún costo la instalación de las máquinas expendedoras?", answer: "No. Todo Vending CA cubre todos los gastos de instalación. La instalación es completamente gratuita y sin compromisos para el cliente." },
  { question: "¿Quién abastece las máquinas con productos?", answer: "Todo Vending CA se encarga de la reposición completa del inventario, asegurando que las máquinas estén siempre abastecidas con productos frescos según las preferencias de cada cliente." },
  { question: "¿Quién repara o realiza el mantenimiento de las máquinas?", answer: "El equipo técnico de Todo Vending CA realiza monitoreo constante y se encarga de cualquier reparación o mantenimiento necesario. El servicio está incluido sin costo adicional." },
  { question: "¿Qué tipos de productos pueden vender las máquinas?", answer: "Ofrecemos snacks, galletas, chocolates, bebidas frías, refrescos, jugos, agua, bebidas energéticas, barras de proteínas, café en grano recién molido, capuchino, chocolate caliente y opciones saludables. El inventario se adapta a las necesidades de cada ubicación." },
  { question: "¿Qué formas de pago aceptan las máquinas expendedoras?", answer: "Las máquinas de Todo Vending CA aceptan efectivo, tarjetas de débito y crédito, y Pago Móvil para mayor comodidad de los usuarios." },
  { question: "¿Cuánto espacio necesito para instalar una máquina expendedora?", answer: "Generalmente se necesita un área de aproximadamente 1,5 m x 1 m con acceso a toma eléctrica. El equipo de Todo Vending CA evalúa el espacio para recomendar la mejor opción." },
  { question: "¿Puedo elegir los productos que se venden en la máquina?", answer: "Sí. Todo Vending CA trabaja con cada cliente para personalizar la selección de productos según las preferencias de empleados, clientes o usuarios." },
  { question: "¿Cómo solicito una máquina expendedora para mi negocio?", answer: `Puedes contactar a Todo Vending CA vía WhatsApp al ${BUSINESS_PHONE_DISPLAY}, por email a ${BUSINESS_EMAIL} o llenar el formulario de contacto en www.todovendingca.com. El equipo se comunicará para evaluar el espacio y coordinar la instalación.` },
  { question: "¿Dónde opera Todo Vending CA?", answer: "Todo Vending CA está ubicado en el Centro Comercial Venezuela, Lechería, estado Anzoátegui, Venezuela, y presta servicio en Lechería, Puerto La Cruz, Barcelona y toda la región oriental de Venezuela." },
  { question: "¿Tienen máquinas expendedoras para gimnasios?", answer: "Sí. Todo Vending CA ofrece máquinas especializadas para gimnasios con bebidas energéticas, barras de proteínas y productos deportivos. Actualmente tiene máquinas en Lion Gym y en la Cancha 3x3 del Parque Caribe, en Lechería." },
]);

export const homeHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Cómo obtener una máquina expendedora gratis para tu negocio en Venezuela",
  description: "Proceso para solicitar e instalar una máquina expendedora de Todo Vending CA en tu empresa, clínica, gimnasio u oficina en Lechería, Anzoátegui.",
  totalTime: "P3D",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  supply: [
    { "@type": "HowToSupply", name: "Espacio disponible de 1,5 m x 1 m" },
    { "@type": "HowToSupply", name: "Toma eléctrica accesible" },
  ],
  step: [
    { "@type": "HowToStep", position: 1, name: "Contactar a Todo Vending CA", text: `Escribe por WhatsApp al ${BUSINESS_PHONE_DISPLAY}, envía un email a ${BUSINESS_EMAIL} o llena el formulario en todovendingca.com.`, url: `${SITE_URL}/#contacto` },
    { "@type": "HowToStep", position: 2, name: "Evaluación del espacio", text: "El equipo de Todo Vending CA visita o consulta sobre tu espacio para recomendar el tipo de máquina ideal según tu negocio y cantidad de personas.", url: `${SITE_URL}/#servicios` },
    { "@type": "HowToStep", position: 3, name: "Selección de productos", text: "Juntos eligen los snacks, bebidas, café u otros productos que mejor se adapten a los gustos de tus empleados o clientes.", url: `${SITE_URL}/#servicios` },
    { "@type": "HowToStep", position: 4, name: "Instalación gratuita", text: "El equipo técnico instala y configura la máquina completamente gratis. Sin costos ocultos ni compromisos.", url: `${SITE_URL}/#servicios` },
    { "@type": "HowToStep", position: 5, name: "Disfruta del servicio", text: "Todo Vending CA se encarga de la reposición y el mantenimiento continuo. Tú solo disfrutas del servicio sin preocupaciones.", url: `${SITE_URL}/#beneficios` },
  ],
};

export const homeWebPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: `${SITE_URL}/`,
  name: "Todo Vending CA — Máquinas Expendedoras en Venezuela",
  headline: "Máquinas Expendedoras en Venezuela con Instalación Gratuita",
  description: "Todo Vending CA es la empresa líder en máquinas expendedoras en Venezuela. Ofrecemos snacks, bebidas frías, café en grano, bebidas energéticas y barras de proteínas con instalación gratuita, mantenimiento 24/7 y reposición sin costo adicional en Lechería, Anzoátegui.",
  inLanguage: "es",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
  datePublished: "2025-01-01",
  dateModified: "2026-07-20",
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2", ".speakable"] },
  mainEntity: { "@id": `${SITE_URL}/#localbusiness` },
};
