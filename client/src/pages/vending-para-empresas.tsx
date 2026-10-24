import { PageShell } from "@/components/layout/page-shell";
import { SubpageHero } from "@/components/blocks/subpage-hero";
import { KeyFacts } from "@/components/blocks/key-facts";
import { SectionHeading } from "@/components/blocks/section-heading";
import { BenefitGrid } from "@/components/blocks/cards";
import { StepsBlock } from "@/components/blocks/steps-block";
import { ClientsStrip } from "@/components/blocks/clients-strip";
import { FAQBlock } from "@/components/blocks/faq-block";
import { CTABand } from "@/components/blocks/cta-band";
import { faqsFor } from "@/content/faqs";
import { useSEO, seoFor } from "@/lib/seo";
import { organizationSchema, breadcrumbSchema, serviceSchema, faqSchema, webPageSchema } from "@/lib/schema";
import { HERO_IMAGE, HERO_SRCSET } from "@/components/blocks/hero-home";

const PATH = "/vending-para-empresas";
const faqs = faqsFor("empresas");
const crumbs = [
  { name: "Inicio", path: "/" },
  { name: "Vending para empresas", path: PATH },
];

const incluye = [
  { title: "Snacks y bebidas frías", text: "Marcas conocidas, opciones saludables y agua, siempre abastecidas." },
  { title: "Café en grano (Café Oriente)", text: "Capuchino, mocachino, café con leche y más, en menos de 40 segundos, sin efectivo." },
  { title: "Selección a medida", text: "Ajustamos los productos a lo que tu equipo consume de verdad." },
  { title: "Pagos sin caja chica", text: "Pago Móvil, tarjetas o efectivo: nadie en tu empresa maneja dinero ni lleva caja." },
  { title: "Monitoreo remoto", text: "Sabemos cuándo reponer antes de que alguien se quede sin su café." },
  { title: "Atención local", text: "Equipo con sede en Lechería; reposición y servicio técnico cercanos." },
];

export default function VendingEmpresas() {
  useSEO(
    seoFor(PATH, [
      organizationSchema,
      breadcrumbSchema(crumbs),
      webPageSchema(PATH),
      serviceSchema({
        path: PATH,
        name: "Vending para empresas y oficinas",
        serviceType: "Máquinas expendedoras para empresas",
        description:
          "Instalación gratuita de máquinas expendedoras de snacks, bebidas y café en grano en empresas, oficinas y centros empresariales de Anzoátegui, con reposición y mantenimiento incluidos.",
        audience: "Empresas, oficinas, centros empresariales",
      }),
      faqSchema(faqs),
    ], { preloadImage: { href: HERO_IMAGE, imagesrcset: HERO_SRCSET, imagesizes: "(min-width: 1024px) 380px, 80vw" } }),
  );

  return (
    <PageShell waKey="empresas" currentPath={PATH}>
      <SubpageHero
        eyebrow="Vending para empresas"
        title={
          <>
            Máquinas expendedoras para empresas y oficinas, <span className="mark-accent">sin costo</span> para tu empresa
          </>
        }
        lead="Todo Vending CA instala máquinas de snacks, bebidas y café en grano en empresas, oficinas y centros empresariales de Anzoátegui. Sin compra de equipo, sin alquiler ni cuota mensual: nosotros reponemos y damos mantenimiento."
        waKey="empresas"
        waLabel="Cotizar para mi empresa"
        breadcrumb={crumbs}
        image={{ src: HERO_IMAGE, srcSet: HERO_SRCSET, alt: "Máquinas expendedoras de snacks y bebidas para oficinas", width: 720, height: 935 }}
      />

      <KeyFacts
        summary="El vending de Todo Vending CA no tiene costo para la empresa: la máquina, la instalación, los productos y el mantenimiento corren por Todo Vending CA. La empresa aporta un espacio de aproximadamente 1,5 m × 1 m con una toma eléctrica. Ya funciona en el Centro Empresarial Colón y el Centro Empresarial Oleus, en Lechería."
        facts={[
          { value: "$0", label: "Para la empresa" },
          { value: "0", label: "Cuotas mensuales" },
          { value: "24/7", label: "Disponibilidad" },
          { value: "1,5 × 1 m", label: "Espacio aproximado" },
          { value: "2", label: "Centros empresariales activos" },
        ]}
      />

      <section className="py-20 md:py-28" aria-labelledby="incluye-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Qué incluye"
            id="incluye-titulo"
            title={
              <>
                Un beneficio para tu equipo que <span className="mark-accent">no pasa por tu presupuesto</span>
              </>
            }
            lead="Las cafeterías y comedores tienen horario. Tu gente, no. La máquina cubre el desayuno temprano, la tarde larga y el turno de noche."
          />
          <div className="mt-12">
            <BenefitGrid items={incluye} />
          </div>
        </div>
      </section>

      <StepsBlock id="como-funciona-empresas" />

      <section className="bg-muted/50 py-20 md:py-28" aria-labelledby="clientes-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Ya confían en nosotros"
            id="clientes-titulo"
            title="Empresas y espacios con máquinas de Todo Vending CA"
            lead="Clínicas, centros empresariales, un colegio y gimnasios en Lechería, Anzoátegui."
          />
          <div className="mt-10">
            <ClientsStrip />
          </div>
        </div>
      </section>

      <FAQBlock items={faqs} title="Preguntas de empresas y oficinas" waKey="empresas" />

      <CTABand
        title="Lleva vending a tu empresa"
        text="Cuéntanos dónde quedaría la máquina y cuánta gente trabaja ahí. Coordinamos una evaluación sin compromiso."
        waKey="empresas"
        waLabel="Cotizar para mi empresa"
      />
    </PageShell>
  );
}
