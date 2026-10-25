import { Zap, Dumbbell, Droplets } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SubpageHero } from "@/components/blocks/subpage-hero";
import { KeyFacts } from "@/components/blocks/key-facts";
import { SectionHeading } from "@/components/blocks/section-heading";
import { StepsBlock } from "@/components/blocks/steps-block";
import { FAQBlock } from "@/components/blocks/faq-block";
import { CTABand } from "@/components/blocks/cta-band";
import { faqsFor } from "@/content/faqs";
import { CLIENTS } from "@shared/site";
import { useSEO, seoFor } from "@/lib/seo";
import { organizationSchema, breadcrumbSchema, serviceSchema, faqSchema, webPageSchema } from "@/lib/schema";
import { HERO_IMAGE, HERO_SRCSET } from "@/components/blocks/hero-home";

const PATH = "/vending-gimnasios";
const faqs = faqsFor("gimnasios");
const crumbs = [
  { name: "Inicio", path: "/" },
  { name: "Vending para gimnasios", path: PATH },
];
const gyms = CLIENTS.filter((c) => c.type === "Gimnasio" || c.type === "Deportes");

const productos = [
  { icon: Zap, title: "Bebidas energéticas", text: "Energía rápida antes y durante el entrenamiento, siempre frías." },
  { icon: Dumbbell, title: "Barras de proteínas", text: "Recuperación muscular al alcance, sin salir del gimnasio." },
  { icon: Droplets, title: "Hidratación y snacks", text: "Agua, bebidas refrescantes y snacks saludables a precios accesibles." },
];

export default function VendingGimnasios() {
  useSEO(
    seoFor(PATH, [
      organizationSchema,
      breadcrumbSchema(crumbs),
      webPageSchema(PATH),
      serviceSchema({
        path: PATH,
        name: "Vending deportivo para gimnasios",
        serviceType: "Máquinas expendedoras para gimnasios",
        description:
          "Máquinas expendedoras para gimnasios y centros deportivos en Anzoátegui con bebidas energéticas, barras de proteínas, agua y snacks saludables. Instalación gratuita y reposición incluida.",
        audience: "Gimnasios, centros deportivos, deportistas",
      }),
      faqSchema(faqs),
    ], { preloadImage: { href: HERO_IMAGE, imagesrcset: HERO_SRCSET, imagesizes: "(min-width: 1024px) 380px, 80vw" } }),
  );

  return (
    <PageShell waKey="gimnasios" currentPath={PATH}>
      <SubpageHero
        eyebrow="Vending deportivo"
        title={
          <>
            Vending para gimnasios: energéticas, proteínas e hidratación <span className="mark-accent">sin salir del gym</span>
          </>
        }
        lead="Todo Vending CA instala máquinas expendedoras especializadas en gimnasios y centros deportivos de Anzoátegui: bebidas energéticas, barras de proteínas, agua y snacks saludables, con instalación gratuita y reposición según el consumo real."
        waKey="gimnasios"
        waLabel="Pedir vending para mi gimnasio"
        breadcrumb={crumbs}
        image={{ src: HERO_IMAGE, srcSet: HERO_SRCSET, alt: "Máquina expendedora de bebidas y snacks para gimnasios", width: 720, height: 935 }}
      />

      <KeyFacts
        summary="El vending deportivo de Todo Vending CA ya funciona en Lion Gym y en la Cancha 3x3 del Parque Caribe, en Playa Cangrejo, Lechería. Las máquinas se surten con productos para antes y después del entrenamiento y no tienen costo ni gestión para el gimnasio."
        facts={[
          { value: "$0", label: "Para el gimnasio" },
          { value: `${gyms.length}`, label: "Espacios deportivos activos" },
          { value: "24/7", label: "Disponibilidad" },
          { value: "Frías", label: "Energéticas y agua" },
          { value: "Pago Móvil", label: "Tarjetas y efectivo" },
        ]}
      />

      <section className="py-20 md:py-28" aria-labelledby="productos-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Qué llevan"
            id="productos-titulo"
            title={
              <>
                Lo que el cuerpo pide <span className="mark-accent">después de entrenar</span>
              </>
            }
            lead="Reposición frecuente según lo que de verdad se consume en tu gimnasio, sin que tengas que ocuparte de nada."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {productos.map((p) => (
              <li key={p.title} className="reveal card-soft p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-muted/50 py-20 md:py-28" aria-labelledby="gyms-titulo">
        <div className="container">
          <SectionHeading eyebrow="Ya en servicio" id="gyms-titulo" title="Gimnasios y canchas con vending de Todo Vending CA" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {gyms.map((c) => (
              <li key={c.name} className="reveal card-soft p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-orange">{c.type}</p>
                <h3 className="mt-1 text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepsBlock id="como-funciona-gimnasios" />

      <FAQBlock items={faqs} title="Preguntas de gimnasios" waKey="gimnasios" />

      <CTABand
        title="¿Tienes un gimnasio o centro deportivo?"
        text="Instalamos vending deportivo sin costo y sin compromisos. Escríbenos y coordinamos la visita."
        waKey="gimnasios"
        waLabel="Pedir vending para mi gimnasio"
      />
    </PageShell>
  );
}
