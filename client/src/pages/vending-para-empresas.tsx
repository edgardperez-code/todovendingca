import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Ola } from "@/components/vitrina/ola";
import { CabeceraSeccion } from "@/components/vitrina/etiqueta";
import { EstilosSubpagina, BandejaSubpagina, type SeleccionBandeja } from "@/components/vitrina/subpagina";
import { SubpageHero } from "@/components/subpage-hero";
import { SubpageFAQ } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

const faqs = [
  {
    question: "¿Cuánto cuesta el servicio de vending para mi empresa u oficina?",
    answer:
      "El servicio no tiene costo para la empresa: Todo Vending CA cubre la instalación, la máquina, la reposición de productos y el mantenimiento. No hay alquiler, cuota mensual ni compra de equipo.",
  },
  {
    question: "¿Qué necesito para instalar vending en mi oficina o clínica?",
    answer:
      "Un espacio de aproximadamente 1,5 m x 1 m con acceso eléctrico. Evaluamos el tráfico de personas y el horario del lugar para recomendar el tipo de máquina (snacks, bebidas o café).",
  },
  {
    question: "¿Puedo elegir los productos según mis empleados o pacientes?",
    answer:
      "Sí. La selección de productos se personaliza según el perfil de cada empresa, clínica o institución, y se ajusta con el tiempo según lo que más se consume.",
  },
];

const beneficios: SeleccionBandeja[] = [
  { icono: "regalo", titulo: "Cero inversión", texto: "Sin compra de equipo, sin alquiler, sin cuota mensual. Nada de costos para tu empresa." },
  { icono: "edificio", titulo: "Imagen corporativa", texto: "Máquinas modernas que mejoran la experiencia en tus instalaciones y proyectan innovación." },
  { icono: "llave", titulo: "Cero gestión", texto: "Nosotros reponemos, damos mantenimiento y resolvemos cualquier falla. Tú no te ocupas de nada." },
];

export default function VendingEmpresas() {
  useSEO({
    title: "Vending para Empresas y Oficinas | Todo Vending CA",
    description:
      "Máquinas expendedoras para empresas, oficinas y clínicas en Anzoátegui. Snacks, bebidas y café sin costo de instalación, con reposición y mantenimiento incluidos.",
    path: "/vending-para-empresas",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Vending para Empresas", path: "/vending-para-empresas" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Vending para Empresas y Oficinas",
        serviceType: "Servicio de Máquinas Expendedoras para Empresas",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "State", name: "Anzoátegui" },
        audience: { "@type": "Audience", audienceType: "Empresas, Oficinas, Clínicas" },
        description:
          "Instalación gratuita de máquinas expendedoras para empresas, centros empresariales y clínicas en Anzoátegui, con reposición y mantenimiento incluidos.",
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
          eyebrow="Soluciones B2B"
          titlePlain="Vending para Empresas,"
          titleAccent="Oficinas y Clínicas"
          lead="Todo Vending CA instala máquinas expendedoras en empresas, centros empresariales y clínicas de Anzoátegui, sin costo de instalación ni cuotas mensuales, con reposición y mantenimiento 24/7 incluidos."
          ctaText="Cotizar para mi empresa"
        />
        <Ola />

        <section className="v-sec v-sec--2">
          <div className="v-cont">
            <CabeceraSeccion
              etiqueta="Un beneficio para tu equipo"
              titulo={
                <>
                  Sin costo para <em className="n">tu empresa</em>
                </>
              }
              lead="Las cafeterías y comedores tienen horarios limitados. Nuestras máquinas complementan ese servicio con acceso rápido a snacks, bebidas y café fuera de horario, sin que compres equipos ni contrates personal. En clínicas y hospitales es aún más útil: pacientes, familiares y personal en turnos largos necesitan opciones a cualquier hora."
            />
            <BandejaSubpagina items={beneficios} etiqueta="Beneficios" />
          </div>
        </section>

        <section className="v-sec">
          <div className="v-cont">
            <CabeceraSeccion
              className="mb-0"
              etiqueta="Prueba social"
              titulo={
                <>
                  Empresas que ya <em>confían en nosotros</em>
                </>
              }
              lead="Clínica Anzoátegui, Clínica Zambrano, Centro Empresarial Colón y Centro Empresarial Oleus ya cuentan con máquinas de Todo Vending CA en Lechería."
            />
          </div>
        </section>

        <SubpageFAQ items={faqs} />

        <SubpageCTA
          title="Lleva vending a tu empresa"
          text="Cuéntanos sobre tu espacio y coordinamos una evaluación sin compromiso."
          ctaText="Cotizar para mi empresa"
        />
      </main>
      <Footer />
    </div>
  );
}
