import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Ola } from "@/components/vitrina/ola";
import { CabeceraSeccion } from "@/components/vitrina/etiqueta";
import {
  EstilosSubpagina,
  BandejaSubpagina,
  ListaConCuenta,
  type SeleccionBandeja,
} from "@/components/vitrina/subpagina";
import { SubpageHero } from "@/components/subpage-hero";
import { SubpageFAQ } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

const faqs = [
  {
    question: "¿Cuánto cuesta poner una máquina expendedora en mi negocio en Lechería?",
    answer:
      "Nada. Todo Vending CA instala, abastece y da mantenimiento a la máquina sin ningún costo para el local. El modelo de negocio se sostiene con la venta de los productos, no con un cobro al establecimiento anfitrión.",
  },
  {
    question: "¿Qué necesito para instalar una máquina de vending en Lechería?",
    answer:
      "Solo un espacio de aproximadamente 1,5 m x 1 m con acceso a una toma eléctrica. El equipo de Todo Vending CA evalúa el lugar y recomienda el tipo de máquina más adecuado según el flujo de personas.",
  },
  {
    question: "¿En qué zonas de Lechería y Anzoátegui instalan máquinas?",
    answer:
      "Actualmente Todo Vending CA tiene máquinas operando en Lechería, con clientes en clínicas, centros empresariales, colegios y gimnasios, y presta servicio en toda la región: Lechería, Puerto La Cruz y Barcelona.",
  },
];

const clientes = [
  { nombre: "Clínica Anzoátegui", tipo: "Snacks y bebidas 24 horas" },
  { nombre: "Centro Empresarial Colón", tipo: "Oficinas" },
  { nombre: "Centro Empresarial Oleus", tipo: "Oficinas" },
  { nombre: "Colegio El Manglar", tipo: "Educación" },
  { nombre: "Clínica Zambrano", tipo: "Salud" },
  { nombre: "Lion Gym", tipo: "Vending deportivo" },
];

const ventajas: SeleccionBandeja[] = [
  { icono: "pin", titulo: "Vending local", texto: "Con sede en el Centro Comercial Venezuela, operamos directamente en la zona: reposición rápida y respuesta técnica inmediata." },
  { icono: "rayo", titulo: "Sin intermediarios", texto: "Trato directo con nuestro equipo, sin distribuidores externos. Esa cercanía mantiene las máquinas siempre abastecidas." },
  { icono: "escudo", titulo: "Para cada espacio", texto: "Oficinas, clínicas, colegios, gimnasios y comercios. Elegimos la máquina según el público de cada lugar." },
];

export default function MaquinasLecheria() {
  useSEO({
    title: "Máquinas Expendedoras en Lechería | Todo Vending CA",
    description:
      "Instalación gratuita de máquinas expendedoras en Lechería, Anzoátegui. Snacks, bebidas y café en grano con mantenimiento 24/7 y reposición incluida, sin costo para tu negocio.",
    path: "/maquinas-expendedoras-lecheria",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Máquinas Expendedoras en Lechería", path: "/maquinas-expendedoras-lecheria" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Máquinas Expendedoras en Lechería",
        serviceType: "Instalación de Máquinas Expendedoras",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "City", name: "Lechería" },
        description:
          "Instalación, reposición y mantenimiento de máquinas expendedoras de snacks, bebidas y café en Lechería, Anzoátegui, sin costo para el negocio anfitrión.",
      },
      faqSchema(faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background v-base">
      <EstilosSubpagina />
      <Header />
      {/* v-bajo-cabecera deja libre el alto de la cabecera fija; "contenido"
          es el destino del enlace "Saltar al contenido". */}
      <main id="contenido" className="v-bajo-cabecera">
        <SubpageHero
          chip="24/7"
          eyebrow="Lechería, Anzoátegui"
          titlePlain="Máquinas Expendedoras en"
          titleAccent="Lechería"
          lead="Todo Vending CA instala máquinas expendedoras de snacks, bebidas y café en grano en oficinas, clínicas, colegios y gimnasios de Lechería, con instalación gratuita y mantenimiento 24/7, sin ningún costo para el negocio."
          ctaText="Solicitar máquina en Lechería"
        />
        <Ola />

        <section className="v-sec v-sec--2">
          <div className="v-cont">
            <CabeceraSeccion
              etiqueta="Vending local"
              titulo={
                <>
                  Vending local, sin <em className="n">intermediarios</em>
                </>
              }
              lead="Instalamos en oficinas, clínicas, colegios, gimnasios y comercios de alto tráfico en toda la región oriental."
            />
            <BandejaSubpagina items={ventajas} etiqueta="Ventajas" />
          </div>
        </section>

        <section className="v-sec">
          <div className="v-cont">
            <ListaConCuenta
              etiqueta="Prueba social"
              titulo={
                <>
                  Clientes actuales en <em>la zona</em>
                </>
              }
              unidad="Clientes"
              items={clientes}
            />
          </div>
        </section>

        <SubpageFAQ items={faqs} />

        <SubpageCTA
          title="¿Tienes un espacio en Lechería?"
          text="Evaluamos tu local sin compromiso y te decimos qué tipo de máquina se adapta mejor."
          ctaText="Solicitar información"
        />
      </main>
      <Footer />
    </div>
  );
}
