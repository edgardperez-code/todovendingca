import { MapPin, Zap, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SubpageHero } from "@/components/blocks/subpage-hero";
import { KeyFacts } from "@/components/blocks/key-facts";
import { SectionHeading } from "@/components/blocks/section-heading";
import { ClientsStrip } from "@/components/blocks/clients-strip";
import { StepsBlock } from "@/components/blocks/steps-block";
import { FAQBlock } from "@/components/blocks/faq-block";
import { CTABand } from "@/components/blocks/cta-band";
import { faqsFor } from "@/content/faqs";
import { BUSINESS, CLIENTS } from "@shared/site";
import { useSEO, seoFor } from "@/lib/seo";
import { organizationSchema, localBusinessSchema, breadcrumbSchema, serviceSchema, faqSchema, webPageSchema, ID } from "@/lib/schema";
import { HERO_IMAGE, HERO_SRCSET } from "@/components/blocks/hero-home";

const PATH = "/maquinas-expendedoras-lecheria";
const faqs = faqsFor("lecheria");
const crumbs = [
  { name: "Inicio", path: "/" },
  { name: "Máquinas expendedoras en Lechería", path: PATH },
];

const ventajas = [
  { icon: MapPin, title: "Sede en Lechería", text: "Estamos en el Centro Comercial Venezuela. Reposición rápida y respuesta técnica en la misma zona." },
  { icon: Zap, title: "Sin intermediarios", text: "Trato directo con nuestro equipo. Esa cercanía mantiene las máquinas siempre abastecidas." },
  { icon: ShieldCheck, title: "Para cada espacio", text: "Oficinas, clínicas, colegios, gimnasios y comercios. Elegimos la máquina según el público de cada lugar." },
];

export default function MaquinasLecheria() {
  useSEO(
    seoFor(PATH, [
      organizationSchema,
      localBusinessSchema,
      breadcrumbSchema(crumbs),
      webPageSchema(PATH, { mainEntity: { "@id": ID.localBusiness } }),
      serviceSchema({
        path: PATH,
        name: "Máquinas expendedoras en Lechería",
        serviceType: "Instalación de máquinas expendedoras",
        description:
          "Instalación gratuita, reposición y mantenimiento de máquinas expendedoras de snacks, bebidas y café en grano en Lechería, Puerto La Cruz y Barcelona, Anzoátegui.",
        audience: "Negocios, oficinas, clínicas, colegios y gimnasios de Lechería",
        area: [{ "@type": "City", name: "Lechería" }, { "@type": "City", name: "Puerto La Cruz" }, { "@type": "City", name: "Barcelona" }],
      }),
      faqSchema(faqs),
    ], { preloadImage: { href: HERO_IMAGE, imagesrcset: HERO_SRCSET, imagesizes: "(min-width: 1024px) 380px, 80vw" } }),
  );

  return (
    <PageShell waKey="lecheria" currentPath={PATH}>
      <SubpageHero
        eyebrow="Lechería, Anzoátegui"
        title={
          <>
            Máquinas expendedoras en Lechería, <span className="mark-accent">con equipo local</span>
          </>
        }
        lead="Todo Vending CA es una empresa de Lechería que instala máquinas de snacks, bebidas y café en grano en oficinas, clínicas, colegios y gimnasios de Lechería, Puerto La Cruz y Barcelona, con instalación gratuita y mantenimiento incluido."
        waKey="lecheria"
        waLabel="Solicitar máquina en Lechería"
        breadcrumb={crumbs}
        image={{ src: HERO_IMAGE, srcSet: HERO_SRCSET, alt: "Máquinas expendedoras de Todo Vending CA en Lechería, Anzoátegui", width: 720, height: 935 }}
      />

      <KeyFacts
        summary={`Todo Vending CA está en ${BUSINESS.address.streetAddress}, Lechería, estado Anzoátegui. Atiende Lechería, Puerto La Cruz y Barcelona con ${CLIENTS.length} ubicaciones activas en clínicas, centros empresariales, un colegio y gimnasios. Horario de atención: ${BUSINESS.hours}.`}
        facts={[
          { value: `${CLIENTS.length}`, label: "Ubicaciones en Lechería" },
          { value: "3", label: "Ciudades atendidas" },
          { value: "$0", label: "Costo de instalación" },
          { value: "L–V", label: "8:00 a 17:00" },
          { value: "Sáb", label: "8:00 a 12:00" },
        ]}
      />

      <section className="py-20 md:py-28" aria-labelledby="ventajas-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Vending local"
            id="ventajas-titulo"
            title={
              <>
                Cerca de tu negocio, <span className="mark-accent">no al otro lado del país</span>
              </>
            }
            lead="Una máquina abastecida depende de quién la atiende. Nuestro equipo está a minutos de cada ubicación."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {ventajas.map((v) => (
              <li key={v.title} className="reveal card-soft p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-muted/50 py-20 md:py-28" aria-labelledby="clientes-lech-titulo">
        <div className="container">
          <SectionHeading eyebrow="Ya en servicio" id="clientes-lech-titulo" title="Clientes actuales en Lechería" lead="Nombres reales de los lugares donde hoy hay una máquina de Todo Vending CA." />
          <div className="mt-10">
            <ClientsStrip />
          </div>
          <div className="reveal mt-10 card-soft flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Nuestra sede</p>
              <p className="text-sm text-muted-foreground">
                {BUSINESS.address.streetAddress}, {BUSINESS.address.addressLocality}, {BUSINESS.address.addressRegion}, Venezuela
              </p>
            </div>
            <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-navy h-11 px-5 text-sm">
              <MapPin className="h-4 w-4" />
              Ver en Google Maps
            </a>
          </div>
        </div>
      </section>

      <StepsBlock id="como-funciona-lecheria" />

      <FAQBlock items={faqs} title="Preguntas sobre vending en Lechería" waKey="lecheria" />

      <CTABand
        title="¿Tienes un espacio en Lechería, Puerto La Cruz o Barcelona?"
        text="Lo evaluamos sin compromiso y te decimos qué máquina se adapta mejor."
        waKey="lecheria"
        waLabel="Solicitar máquina"
      />
    </PageShell>
  );
}
