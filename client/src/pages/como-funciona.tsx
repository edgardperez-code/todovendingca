import { PaginaApoyo } from "@/components/pagina-apoyo";
import { CabeceraSeccion } from "@/components/vitrina/etiqueta";
import { Icono } from "@/components/vitrina/iconos";
import { BandejaSubpagina, type SeleccionBandeja } from "@/components/vitrina/subpagina";
import { SubpageFAQ } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { FAQ_COMUNES } from "@/components/pagina-sector";
import { EnlaceInterno } from "@/lib/navegacion";
import { useSEO } from "@/lib/seo";
import { SITE_URL, BUSINESS_PHONE_DISPLAY, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

const PASOS = [
  {
    nombre: "Nos escribes",
    texto: `Por WhatsApp al ${BUSINESS_PHONE_DISPLAY} o con el formulario de solicitud. Cuéntanos qué tipo de espacio tienes y cuántas personas pasan por ahí.`,
  },
  {
    nombre: "Evaluamos tu espacio",
    texto:
      "Revisamos el lugar contigo, sin compromiso, para recomendar el tipo de máquina: snacks y bebidas, café Café Oriente o vending deportivo.",
  },
  {
    nombre: "Elegimos los productos juntos",
    texto: "Definimos la selección según quienes van a usar la máquina: empleados, pacientes, estudiantes, huéspedes o deportistas.",
  },
  {
    nombre: "Instalamos sin costo",
    texto: "Llevamos la máquina, la instalamos y la dejamos funcionando. No pagas la máquina, ni la instalación, ni alquiler.",
  },
  {
    nombre: "Reponemos y mantenemos",
    texto:
      "Volvemos con regularidad para reponer productos según el consumo, y nos encargamos del mantenimiento y de cualquier reparación.",
  },
];

const REQUISITOS: SeleccionBandeja[] = [
  { icono: "instala", titulo: "Un espacio", texto: "Aproximadamente 1,5 m × 1 m, en un lugar de paso y bajo techo." },
  { icono: "rayo", titulo: "Una toma eléctrica", texto: "Cerca del lugar donde irá la máquina." },
  { icono: "pin", titulo: "Estar en Lechería", texto: "Por ahora instalamos máquinas en espacios de Lechería, Anzoátegui." },
];

const FAQS = [
  ...FAQ_COMUNES,
  {
    question: "¿Quién repone los productos y repara la máquina?",
    answer:
      "Todo Vending CA. Reponemos según el consumo de cada ubicación y nos encargamos del mantenimiento y las reparaciones, sin costo adicional.",
  },
  {
    question: "¿Puedo cambiar los productos después?",
    answer: "Sí. La selección se ajusta con el tiempo según lo que más se consume y lo que pidan quienes usan la máquina.",
  },
];

export default function ComoFunciona() {
  useSEO({
    title: "Cómo Tener una Máquina Expendedora Gratis en tu Negocio | Todo Vending CA",
    description:
      "Paso a paso para tener una máquina expendedora en tu negocio en Lechería: solicitud, evaluación del espacio, productos, instalación gratuita, reposición y mantenimiento.",
    path: "/como-funciona",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Cómo funciona", path: "/como-funciona" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Cómo tener una máquina expendedora gratis en tu negocio en Lechería",
        description: "Pasos para solicitar e instalar una máquina expendedora de Todo Vending CA en Lechería, Anzoátegui.",
        estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
        supply: REQUISITOS.map((r) => ({ "@type": "HowToSupply", name: `${r.titulo}: ${r.texto}` })),
        step: PASOS.map((p, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: p.nombre,
          text: p.texto,
          url: `${SITE_URL}/como-funciona#paso-${i + 1}`,
        })),
      },
      faqSchema(FAQS),
    ],
  });

  return (
    <PaginaApoyo
      etiqueta="Cómo funciona"
      titulo={
        <>
          Una máquina en tu negocio, <em className="n">sin costo</em>
        </>
      }
      lead="Tú pones el espacio y la toma eléctrica; nosotros ponemos la máquina, los productos, la instalación y el mantenimiento. Así funciona, paso a paso."
    >
      <section className="v-sec v-sec--2">
        <div className="v-cont">
          <CabeceraSeccion
            etiqueta="Paso a paso"
            titulo={
              <>
                Cinco pasos, <em>cero inversión</em>
              </>
            }
            lead="Desde que nos escribes hasta que la máquina está funcionando y la reponemos con regularidad."
          />
          <ol className="va-pasos">
            {PASOS.map((p, i) => (
              <li key={p.nombre} id={`paso-${i + 1}`} className="va-paso">
                <span className="va-paso__n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{p.nombre}</h3>
                  <p>{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="v-sec">
        <div className="v-cont">
          <CabeceraSeccion
            etiqueta="Lo que necesitas"
            titulo={
              <>
                Solo <em className="n">tres cosas</em>
              </>
            }
            lead="Si tienes esto, ya puedes tener una máquina expendedora."
          />
          <BandejaSubpagina items={REQUISITOS} etiqueta="Requisitos" />
          <div className="vs-hero__cta">
            <EnlaceInterno className="v-btn v-btn--p" href="/solicitar-maquina">
              Solicitar una máquina
              <Icono nombre="flecha" flecha />
            </EnlaceInterno>
            <EnlaceInterno className="v-btn v-btn--s" href="/catalogo-productos">
              Ver productos
            </EnlaceInterno>
          </div>
        </div>
      </section>

      <SubpageFAQ items={FAQS} />
      <SubpageCTA
        title="¿Empezamos?"
        text="Escríbenos por WhatsApp y coordinamos la evaluación de tu espacio."
        ctaText="Quiero una máquina"
      />
    </PaginaApoyo>
  );
}
