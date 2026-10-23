import { PageShell } from "@/components/layout/page-shell";
import { HeroHome, HERO_IMAGE, HERO_SRCSET, HERO_SIZES } from "@/components/blocks/hero-home";
import { KeyFacts } from "@/components/blocks/key-facts";
import { SectionHeading } from "@/components/blocks/section-heading";
import { ServiceCards, SegmentCards, BenefitGrid } from "@/components/blocks/cards";
import { StepsBlock } from "@/components/blocks/steps-block";
import { CafeOrienteFeature } from "@/components/blocks/cafe-oriente-feature";
import { ClientsStrip } from "@/components/blocks/clients-strip";
import { FAQBlock } from "@/components/blocks/faq-block";
import { ContactForm } from "@/components/blocks/contact-form";
import { faqsFor } from "@/content/faqs";
import { CLIENTS } from "@shared/site";
import { useSEO, seoFor } from "@/lib/seo";
import {
  websiteSchema,
  organizationSchema,
  localBusinessSchema,
  cafeOrienteBrandSchema,
  webPageSchema,
  clientsItemListSchema,
  homeHowToSchema,
  faqSchema,
  ID,
} from "@/lib/schema";

const PATH = "/";
const faqs = faqsFor("general", 7);

export default function Home() {
  useSEO(
    seoFor(PATH, [
      websiteSchema,
      organizationSchema,
      localBusinessSchema,
      cafeOrienteBrandSchema,
      webPageSchema(PATH, { mainEntity: { "@id": ID.localBusiness } }),
      clientsItemListSchema,
      homeHowToSchema,
      faqSchema(faqs),
    ], { preloadImage: { href: HERO_IMAGE, imagesrcset: HERO_SRCSET, imagesizes: HERO_SIZES } }),
  );

  return (
    <PageShell waKey="home" currentPath={PATH} testId="page-home">
      <HeroHome />

      <KeyFacts
        summary="Todo Vending CA es una empresa de máquinas expendedoras con sede en Lechería, estado Anzoátegui, Venezuela. Instala máquinas de snacks, bebidas frías, café en grano (Café Oriente) y productos deportivos en empresas, clínicas, colegios y gimnasios de Lechería, Puerto La Cruz y Barcelona. La instalación, la reposición y el mantenimiento son gratuitos para el negocio anfitrión."
        facts={[
          { value: "$0", label: "Costo de instalación" },
          { value: "24/7", label: "Máquinas en servicio" },
          { value: `${CLIENTS.length}`, label: "Ubicaciones activas" },
          { value: "< 40 s", label: "Café en grano por taza" },
          { value: "3", label: "Ciudades atendidas" },
        ]}
      />

      <section id="servicios" className="py-20 md:py-28" aria-labelledby="servicios-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Servicios"
            id="servicios-titulo"
            title={
              <>
                Todo lo que tu espacio necesita, <span className="mark-accent">en una sola máquina</span>
              </>
            }
            lead="Elegimos la máquina según el lugar y la gente que pasa por ahí. Luego nos encargamos de que nunca falte nada."
          />
          <div className="mt-12">
            <ServiceCards />
          </div>
        </div>
      </section>

      <StepsBlock />

      <CafeOrienteFeature />

      <section id="ubicaciones" className="py-20 md:py-28" aria-labelledby="ubicaciones-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Dónde funciona mejor"
            id="ubicaciones-titulo"
            title={
              <>
                Complementamos el servicio que ya tienes, <span className="mark-accent">no competimos con él</span>
              </>
            }
            lead="Comedores y cafetines cierran; la gente sigue necesitando algo rápido. Ahí entra una máquina de Todo Vending CA."
          />
          <div className="mt-12">
            <SegmentCards />
          </div>

          <div className="mt-16">
            <h3 className="reveal text-display-sm">Ubicaciones actuales en Lechería</h3>
            <p className="reveal mt-2 max-w-2xl text-muted-foreground">Clientes que ya tienen una máquina de Todo Vending CA en servicio.</p>
            <div className="mt-6">
              <ClientsStrip />
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="bg-muted/50 py-20 md:py-28" aria-labelledby="beneficios-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Por qué Todo Vending CA"
            id="beneficios-titulo"
            title={
              <>
                Un aliado local que <span className="mark-accent">se ocupa de todo</span>
              </>
            }
            lead="Sin inversión, sin gestión y con un equipo a pocos minutos de tu puerta."
          />
          <div className="mt-12">
            <BenefitGrid />
          </div>
        </div>
      </section>

      <FAQBlock
        items={faqs}
        title="Lo que todos preguntan antes de pedir una máquina"
        lead="Respuestas directas sobre costos, espacio, productos y mantenimiento."
        waKey="home"
      />

      <ContactForm />
    </PageShell>
  );
}
