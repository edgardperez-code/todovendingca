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
    question: "¿Qué productos tienen las máquinas expendedoras para gimnasios?",
    answer:
      "Bebidas energéticas, barras de proteínas, agua, suplementos deportivos y snacks saludables, pensados para antes y después del entrenamiento.",
  },
  {
    question: "¿Tiene costo instalar una máquina de vending deportivo en mi gimnasio?",
    answer:
      "No. La instalación es gratuita, al igual que la reposición y el mantenimiento. Todo Vending CA se encarga de todo el proceso.",
  },
  {
    question: "¿En qué gimnasios de Lechería ya tienen máquinas?",
    answer:
      "Actualmente Todo Vending CA tiene vending deportivo en Lion Gym y en la Cancha 3x3 del Parque Caribe, en Playa Cangrejo, Lechería.",
  },
];

const productos: SeleccionBandeja[] = [
  { icono: "rayo", titulo: "Bebidas energéticas", texto: "Energía rápida antes y durante el entrenamiento, siempre frías." },
  { icono: "pesa", titulo: "Barras de proteínas", texto: "Recuperación muscular al alcance, sin salir del gimnasio." },
  { icono: "bebida", titulo: "Hidratación y snacks", texto: "Agua, bebidas refrescantes y snacks saludables a precios accesibles." },
];

const ubicaciones = [
  { nombre: "Lion Gym", tipo: "Lechería — bebidas energéticas, barras de proteínas y más." },
  { nombre: "Cancha 3x3 Parque Caribe", tipo: "Playa Cangrejo, Lechería — snacks, proteínas y bebidas energéticas." },
];

export default function VendingGimnasios() {
  useSEO({
    title: "Vending para Gimnasios | Bebidas Energéticas y Proteínas | Todo Vending CA",
    description:
      "Máquinas expendedoras para gimnasios en Lechería: bebidas energéticas, barras de proteínas y snacks deportivos, con instalación gratuita y reposición incluida.",
    path: "/vending-gimnasios",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Vending para Gimnasios", path: "/vending-gimnasios" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Vending para Gimnasios",
        serviceType: "Máquina Expendedora para Gimnasio",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "City", name: "Lechería" },
        audience: { "@type": "Audience", audienceType: "Gimnasios, Centros Deportivos, Deportistas" },
        description:
          "Máquinas expendedoras especializadas para gimnasios y centros deportivos: bebidas energéticas, barras de proteínas y suplementos, con instalación gratuita.",
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
          eyebrow="Vending deportivo"
          titlePlain="Vending para Gimnasios en"
          titleAccent="Lechería"
          lead="Máquinas expendedoras especializadas para gimnasios y centros deportivos, con bebidas energéticas, barras de proteínas y snacks saludables, instalación gratuita y reposición constante."
          ctaText="Solicitar vending para mi gimnasio"
        />
        <Ola />

        <section className="v-sec v-sec--2">
          <div className="v-cont">
            <CabeceraSeccion
              etiqueta="Hidratación y energía"
              titulo={
                <>
                  Sin salir del <em className="n">gimnasio</em>
                </>
              }
              lead="Después de entrenar, los atletas buscan hidratación y proteína rápida. Nuestras máquinas de vending deportivo se surten con productos pensados para ese momento, con reposición frecuente según el consumo real del gimnasio, y sin costo ni gestión para el negocio."
            />
            <BandejaSubpagina items={productos} etiqueta="Productos" />
          </div>
        </section>

        <section className="v-sec">
          <div className="v-cont">
            <ListaConCuenta
              etiqueta="Prueba social"
              titulo={
                <>
                  Actualmente <em>en</em>
                </>
              }
              unidad="Ubicaciones"
              items={ubicaciones}
            />
          </div>
        </section>

        <SubpageFAQ items={faqs} />

        <SubpageCTA
          title="¿Tienes un gimnasio o centro deportivo?"
          text="Instalamos vending deportivo sin costo y sin compromisos."
          ctaText="Solicitar información"
        />
      </main>
      <Footer />
    </div>
  );
}
