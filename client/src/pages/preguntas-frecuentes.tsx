import { PageShell } from "@/components/layout/page-shell";
import { SubpageHero } from "@/components/blocks/subpage-hero";
import { FAQBlock } from "@/components/blocks/faq-block";
import { CTABand } from "@/components/blocks/cta-band";
import { FAQS } from "@/content/faqs";
import { useSEO, seoFor } from "@/lib/seo";
import { organizationSchema, breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";

const PATH = "/preguntas-frecuentes";
const crumbs = [
  { name: "Inicio", path: "/" },
  { name: "Preguntas frecuentes", path: PATH },
];

export default function PreguntasFrecuentes() {
  useSEO(seoFor(PATH, [organizationSchema, breadcrumbSchema(crumbs), webPageSchema(PATH), faqSchema(FAQS)]));

  return (
    <PageShell waKey="faq" currentPath={PATH}>
      <SubpageHero
        eyebrow="Preguntas frecuentes"
        title={
          <>
            Todo lo que necesitas saber <span className="mark-accent">antes de pedir una máquina</span>
          </>
        }
        lead="Costos, espacio, productos, pagos, mantenimiento, zonas de servicio y Café Oriente. Si tu pregunta no está aquí, escríbenos por WhatsApp y te respondemos."
        waKey="faq"
        waLabel="Preguntar por WhatsApp"
        breadcrumb={crumbs}
      />
      <FAQBlock items={FAQS} title={`${FAQS.length} respuestas directas`} lead="Las mismas respuestas que damos por WhatsApp, escritas para que se entiendan de una." waKey="faq" showAllLink={false} />
      <CTABand
        title="¿Lista tu duda? Pide la máquina"
        text="Instalación gratuita, reposición y mantenimiento incluidos. Solo necesitamos saber dónde quedaría."
        waKey="faq"
      />
    </PageShell>
  );
}
