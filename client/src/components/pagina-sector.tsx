// Plantilla de las páginas por sector (clínicas, colegios, hoteles, centros
// comerciales, industrias). Mismo lenguaje que Empresas y Gimnasios: portada,
// bandejas de beneficios y productos, clientes reales (si los hay), preguntas
// frecuentes y llamada a la acción. Todo el contenido sale de la configuración
// de cada página (client/src/pages/sectores.tsx).
//
// Zona de servicio: solo Lechería. Ninguna página debe prometer otra ciudad.
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Ola } from "@/components/vitrina/ola";
import { CabeceraSeccion } from "@/components/vitrina/etiqueta";
import { Icono } from "@/components/vitrina/iconos";
import {
  EstilosSubpagina,
  BandejaSubpagina,
  ListaConCuenta,
  type SeleccionBandeja,
} from "@/components/vitrina/subpagina";
import { SubpageHero } from "@/components/subpage-hero";
import { SubpageFAQ, type SubpageFAQItem } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { EnlaceInterno } from "@/lib/navegacion";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

export interface ConfigSector {
  path: string;
  nombreCorto: string; // para las migas de pan ("Vending para Clínicas")
  seo: { titulo: string; descripcion: string };
  hero: { eyebrow: string; tituloPlano: string; tituloAcento: string; lead: string; cta: string; chip?: string };
  servicio: { nombre: string; audiencia: string; descripcion: string };
  beneficios: { etiqueta: string; titulo: ReactNode; lead: string; items: SeleccionBandeja[] };
  productos: { titulo: ReactNode; lead: string; items: SeleccionBandeja[] };
  // Clientes reales de este sector. Si no hay, la sección no aparece (nunca se inventan).
  clientes?: { nombre: string; tipo: string }[];
  faqs: SubpageFAQItem[];
  cta: { titulo: string; texto: string };
}

export function PaginaSector({ c }: { c: ConfigSector }) {
  useSEO({
    title: c.seo.titulo,
    description: c.seo.descripcion,
    path: c.path,
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: c.nombreCorto, path: c.path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: c.servicio.nombre,
        serviceType: "Servicio de máquinas expendedoras",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "City", name: "Lechería" },
        audience: { "@type": "Audience", audienceType: c.servicio.audiencia },
        description: c.servicio.descripcion,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Instalación gratuita y sin compromiso" },
      },
      faqSchema(c.faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background v-base">
      <EstilosSubpagina />
      <Header />
      <main id="contenido" className="v-bajo-cabecera">
        <SubpageHero
          chip={c.hero.chip}
          eyebrow={c.hero.eyebrow}
          titlePlain={c.hero.tituloPlano}
          titleAccent={c.hero.tituloAcento}
          lead={c.hero.lead}
          ctaText={c.hero.cta}
        />
        <Ola />

        <section className="v-sec v-sec--2">
          <div className="v-cont">
            <CabeceraSeccion etiqueta={c.beneficios.etiqueta} titulo={c.beneficios.titulo} lead={c.beneficios.lead} />
            <BandejaSubpagina items={c.beneficios.items} etiqueta="Beneficios" />
          </div>
        </section>

        <section className="v-sec">
          <div className="v-cont">
            <CabeceraSeccion etiqueta="Qué ponemos en la máquina" titulo={c.productos.titulo} lead={c.productos.lead} />
            <BandejaSubpagina items={c.productos.items} etiqueta="Productos" primerCodigo={20} />
            <p className="v-lead" style={{ marginTop: 28 }}>
              <EnlaceInterno href="/catalogo-productos">Ver el catálogo completo de productos</EnlaceInterno>
            </p>
          </div>
        </section>

        {c.clientes && c.clientes.length > 0 && (
          <section className="v-sec v-sec--2">
            <div className="v-cont">
              <ListaConCuenta
                etiqueta="Ya confían en nosotros"
                titulo={
                  <>
                    Clientes actuales del <em>sector</em>
                  </>
                }
                unidad="Clientes"
                items={c.clientes}
              />
            </div>
          </section>
        )}

        <section className="v-sec">
          <div className="v-cont">
            <CabeceraSeccion
              etiqueta="Cómo empezar"
              titulo={
                <>
                  Tres pasos y <em className="n">listo</em>
                </>
              }
              lead="Nos escribes, evaluamos tu espacio sin compromiso e instalamos la máquina sin costo. Después nos encargamos de la reposición y el mantenimiento. Por ahora atendemos espacios en Lechería."
            />
            <div className="vs-hero__cta">
              <EnlaceInterno className="v-btn v-btn--p" href="/solicitar-maquina">
                Solicitar una máquina
                <Icono nombre="flecha" flecha />
              </EnlaceInterno>
              <EnlaceInterno className="v-btn v-btn--s" href="/como-funciona">
                Ver cómo funciona
              </EnlaceInterno>
            </div>
          </div>
        </section>

        <SubpageFAQ items={c.faqs} />

        <SubpageCTA title={c.cta.titulo} text={c.cta.texto} ctaText={c.hero.cta} />
      </main>
      <Footer />
    </div>
  );
}

// Requisitos y preguntas que valen para cualquier sector.
export const FAQ_COMUNES: SubpageFAQItem[] = [
  {
    question: "¿Cuánto cuesta instalar la máquina?",
    answer:
      "Nada. Todo Vending CA instala la máquina sin costo y sin compromiso, y se encarga de la reposición de productos y del mantenimiento. No hay alquiler ni cuota mensual.",
  },
  {
    question: "¿Qué necesito para tener una máquina?",
    answer:
      "Un espacio de aproximadamente 1,5 m × 1 m con una toma eléctrica cerca. Evaluamos el lugar contigo para recomendar el tipo de máquina que mejor funciona.",
  },
  {
    question: "¿En qué zonas instalan máquinas?",
    answer: "Por ahora trabajamos en Lechería, estado Anzoátegui. Si tu espacio está en Lechería, escríbenos y coordinamos una evaluación.",
  },
];
