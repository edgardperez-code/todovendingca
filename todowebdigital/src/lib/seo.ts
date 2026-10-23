import type { Metadata } from "next";
import { site, SITE_URL, services, type ServiceDef } from "@/lib/site";
import type { FaqItem, Post, Project } from "@/lib/types";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_URL = `${SITE_URL}/logo.png`;
export const DEFAULT_OG = `${SITE_URL}/opengraph-image`;

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type MetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noindex?: boolean;
  keywords?: string[];
  absoluteTitle?: boolean; // no añadir " | TodoWeb Digital"
};

// Metadata de Next para cada página: título, descripción, canonical, Open Graph,
// Twitter y robots. El título se completa con " | TodoWeb Digital" desde el layout.
export function buildMetadata(input: MetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image ? absoluteUrl(input.image) : undefined;
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: input.type ?? "website",
      url,
      title: input.title,
      description: input.description,
      siteName: site.name,
      locale: site.locale,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: input.title }] } : {}),
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime, tags: input.tags, authors: [SITE_URL] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      ...(image ? { images: [image] } : {}),
    },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } },
  };
}

// ----------------------------- JSON-LD -----------------------------
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    alternateName: ["TodoWeb", "Todo Web Digital", "TodoWebDigital.com"],
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
    image: DEFAULT_OG,
    description: site.description,
    foundingDate: String(site.foundedYear),
    email: site.email,
    telephone: site.phone,
    address: { "@type": "PostalAddress", ...site.address },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude },
    areaServed: site.areaServed.map((name) => ({ "@type": "Place", name })),
    priceRange: "$$",
    currenciesAccepted: "USD, VES, USDT",
    paymentAccepted: "Transferencia, Pago Móvil, Zelle, Binance Pay, Tarjeta",
    openingHoursSpecification: site.openingHours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
    contactPoint: [
      { "@type": "ContactPoint", telephone: site.phone, contactType: "sales", availableLanguage: ["Spanish", "English"], areaServed: "VE" },
      { "@type": "ContactPoint", email: site.email, contactType: "customer service", availableLanguage: ["Spanish"] },
    ],
    sameAs: [site.social.instagram, site.social.tiktok, `https://wa.me/${site.whatsapp}`, ...site.previousDomains.map((d) => `https://${d}`)],
    knowsAbout: [
      "Diseño de páginas web",
      "Desarrollo web",
      "Landing pages",
      "Tiendas online",
      "SEO",
      "SEO local",
      "GEO (Generative Engine Optimization)",
      "IAO / AIO (optimización para inteligencia artificial)",
      "Datos estructurados schema.org",
      "llms.txt",
      "Core Web Vitals",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de TodoWeb Digital",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, url: `${SITE_URL}/servicios/${s.slug}` },
        price: s.priceFrom,
        priceCurrency: "USD",
        priceSpecification: { "@type": "PriceSpecification", price: s.priceFrom, priceCurrency: "USD", minPrice: s.priceFrom },
      })),
    },
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    description: site.description,
    inLanguage: "es",
    publisher: { "@id": ORG_ID },
  };
}

export function serviceJsonLd(s: ServiceDef) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/servicios/${s.slug}#service`,
    name: s.name,
    serviceType: s.name,
    description: s.description,
    url: `${SITE_URL}/servicios/${s.slug}`,
    provider: { "@id": ORG_ID },
    areaServed: site.areaServed.map((name) => ({ "@type": "Place", name })),
    availableChannel: { "@type": "ServiceChannel", serviceUrl: `${SITE_URL}/contacto`, availableLanguage: "es" },
    offers: {
      "@type": "Offer",
      price: s.priceFrom,
      priceCurrency: "USD",
      priceSpecification: { "@type": "PriceSpecification", price: s.priceFrom, priceCurrency: "USD", minPrice: s.priceFrom },
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/servicios/${s.slug}`,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Incluye: ${s.name}`,
      itemListElement: s.features.map((f) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: f } })),
    },
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function blogPostingJsonLd(post: Post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: [post.coverImage ? absoluteUrl(post.coverImage) : DEFAULT_OG],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", "@id": ORG_ID, name: site.name, url: `${SITE_URL}/` },
    publisher: { "@id": ORG_ID },
    inLanguage: "es",
    articleSection: post.category,
    keywords: [...post.tags, ...post.keywords].join(", "),
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    timeRequired: `PT${post.readingMinutes}M`,
    isAccessibleForFree: true,
  };
}

export function blogListJsonLd(posts: Post[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: `Blog de ${site.name}`,
    url: `${SITE_URL}/blog`,
    description: "Guías prácticas sobre diseño web, SEO, GEO e inteligencia artificial para negocios que quieren más clientes.",
    publisher: { "@id": ORG_ID },
    inLanguage: "es",
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.publishedAt ?? p.createdAt })),
  };
}

export function portfolioJsonLd(projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/portafolio#list`,
    name: `Portafolio de ${site.name}`,
    description: "Páginas web creadas por TodoWeb Digital con su puntuación de optimización SEO y GEO.",
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/portafolio/${p.slug}`,
      name: p.name,
    })),
  };
}

export function projectJsonLd(p: Project) {
  const url = `${SITE_URL}/portafolio/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: p.name,
    url,
    description: p.description,
    image: p.imageUrl ? absoluteUrl(p.imageUrl) : DEFAULT_OG,
    creator: { "@id": ORG_ID },
    dateCreated: p.launchedAt ?? undefined,
    about: { "@type": "WebSite", url: p.url, name: p.name },
    keywords: p.services.join(", "),
    ...(p.auditScore != null
      ? {
          review: {
            "@type": "Review",
            author: { "@id": ORG_ID },
            name: "Auditoría SEO/GEO automática",
            reviewBody: `Puntuación global ${p.auditScore}/100 (SEO ${p.audit?.scores.seo ?? "-"}, GEO/IAO ${p.audit?.scores.geo ?? "-"}, rendimiento ${p.audit?.scores.performance ?? "-"}).`,
            reviewRating: { "@type": "Rating", ratingValue: p.auditScore, bestRating: 100, worstRating: 0 },
            datePublished: p.auditedAt ?? undefined,
          },
        }
      : {}),
  };
}

export function howToJsonLd(steps: { title: string; text: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cómo trabajamos en TodoWeb Digital: de la idea a una web que vende",
    description: "Proceso de 4 pasos para crear una página web optimizada para SEO, GEO e IAO.",
    totalTime: "P15D",
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
  };
}
