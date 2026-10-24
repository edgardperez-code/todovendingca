import { Moon, ShieldCheck, Coffee } from "lucide-react";
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

const PATH = "/vending-para-clinicas";
const faqs = faqsFor("clinicas");
const crumbs = [
  { name: "Inicio", path: "/" },
  { name: "Vending para clínicas", path: PATH },
];
const clinicas = CLIENTS.filter((c) => c.type === "Clínica");

const razones = [
  {
    icon: Moon,
    title: "Cuando la cafetería cierra",
    text: "Pacientes, familiares y personal de guardia necesitan agua, un snack o un café a las 3 de la madrugada. La máquina está ahí las 24 horas, todos los días.",
  },
  {
    icon: ShieldCheck,
    title: "Higiene, sin manejar dinero",
    text: "Pagos con Pago Móvil, tarjetas o efectivo, productos sellados y limpieza a cargo de Todo Vending CA. Nadie del personal de la clínica maneja dinero ni inventario.",
  },
  {
    icon: Coffee,
    title: "Café en grano para el personal",
    text: "La estación Café Oriente muele el grano por taza y sirve capuchino, mocachino o café con leche en menos de 40 segundos. Ya está instalada en la Clínica Anzoátegui.",
  },
];

export default function VendingClinicas() {
  useSEO(
    seoFor(PATH, [
      organizationSchema,
      breadcrumbSchema(crumbs),
      webPageSchema(PATH),
      serviceSchema({
        path: PATH,
        name: "Vending para clínicas y hospitales",
        serviceType: "Máquinas expendedoras para clínicas",
        description:
          "Máquinas expendedoras 24 horas de snacks, bebidas y café en grano para clínicas y hospitales de Anzoátegui, con instalación gratuita, reposición y mantenimiento incluidos.",
        audience: "Clínicas, hospitales, centros de salud",
      }),
      faqSchema(faqs),
    ], { preloadImage: { href: "/cafe-oriente/assets/maquina-v1.webp" } }),
  );

  return (
    <PageShell waKey="clinicas" currentPath={PATH}>
      <SubpageHero
        eyebrow="Vending para clínicas y hospitales"
        title={
          <>
            Máquinas expendedoras para clínicas: <span className="mark-accent">24 horas</span>, sin costo para la clínica
          </>
        }
        lead="Todo Vending CA instala máquinas de snacks, bebidas y café en grano en clínicas y hospitales de Anzoátegui. Atienden a pacientes, familiares y personal de guardia cuando la cafetería está cerrada, y la instalación, la reposición y el mantenimiento son gratuitos."
        waKey="clinicas"
        waLabel="Pedir una máquina para mi clínica"
        breadcrumb={crumbs}
        image={{ src: "/cafe-oriente/assets/maquina-v1.webp", alt: "Estación de café Bianchi LEI 400 personalizada con la marca Café Oriente", width: 713, height: 1431 }}
      />

      <KeyFacts
        summary="Todo Vending CA ya opera máquinas expendedoras en la Clínica Anzoátegui y la Clínica Zambrano, en Lechería. La Clínica Anzoátegui cuenta además con una estación de café en grano Café Oriente. Las máquinas funcionan las 24 horas, aceptan Pago Móvil, tarjetas y efectivo, y no tienen costo para la institución."
        facts={[
          { value: "24/7", label: "En servicio" },
          { value: "$0", label: "Para la clínica" },
          { value: `${clinicas.length}`, label: "Clínicas en Lechería" },
          { value: "< 40 s", label: "Café en grano por taza" },
          { value: "0", label: "Efectivo en Café Oriente" },
        ]}
      />

      <section className="py-20 md:py-28" aria-labelledby="razones-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Por qué en una clínica"
            id="razones-titulo"
            title={
              <>
                Donde la espera es larga, <span className="mark-accent">una máquina ayuda</span>
              </>
            }
            lead="Una clínica no cierra. Su cafetería sí. Las máquinas de Todo Vending CA cubren ese hueco sin añadir trabajo al personal."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {razones.map((r) => (
              <li key={r.title} className="reveal card-soft p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-muted/50 py-20 md:py-28" aria-labelledby="clinicas-titulo">
        <div className="container">
          <SectionHeading
            eyebrow="Ya en servicio"
            id="clinicas-titulo"
            title="Clínicas de Lechería con máquinas de Todo Vending CA"
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {clinicas.map((c) => (
              <li key={c.name} className="reveal card-soft p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-orange">{c.type}</p>
                <h3 className="mt-1 text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepsBlock id="como-funciona-clinicas" />

      <FAQBlock items={faqs} title="Preguntas de clínicas y hospitales" waKey="clinicas" />

      <CTABand
        title="Una máquina en tu clínica, sin costo"
        text="Dinos en qué piso o sala quedaría y cuánta gente circula. Evaluamos sin compromiso y te proponemos snacks, bebidas o café."
        waKey="clinicas"
        waLabel="Pedir una máquina para mi clínica"
      />
    </PageShell>
  );
}
