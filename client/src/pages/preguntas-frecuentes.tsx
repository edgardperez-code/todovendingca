import { PaginaApoyo } from "@/components/pagina-apoyo";
import { Etiqueta } from "@/components/vitrina/etiqueta";
import { SubpageCTA } from "@/components/subpage-cta";
import { FAQ_COMUNES } from "@/components/pagina-sector";
import { useSEO } from "@/lib/seo";
import { BUSINESS_PHONE_DISPLAY, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

// Todas las preguntas frecuentes en una página, por tema. Solo datos que ya
// publica el sitio (inicio, Café Oriente, Gift Cards). Zona: solo Lechería.
const GRUPOS: { id: string; titulo: string; preguntas: { question: string; answer: string }[] }[] = [
  {
    id: "servicio",
    titulo: "El servicio",
    preguntas: [
      ...FAQ_COMUNES,
      {
        question: "¿Quién abastece las máquinas?",
        answer:
          "Todo Vending CA se encarga de la reposición completa del inventario, con visitas según el consumo de cada ubicación.",
      },
      {
        question: "¿Quién repara o da mantenimiento a las máquinas?",
        answer:
          "Nuestro equipo técnico. El mantenimiento preventivo y las reparaciones están incluidos, sin costo adicional para el establecimiento.",
      },
      {
        question: "¿Cómo solicito una máquina?",
        answer: `Por WhatsApp al ${BUSINESS_PHONE_DISPLAY} o con el formulario de la página «Solicitar una máquina». Te contactamos para evaluar tu espacio y coordinar la instalación.`,
      },
    ],
  },
  {
    id: "productos",
    titulo: "Productos y pagos",
    preguntas: [
      {
        question: "¿Qué productos venden las máquinas?",
        answer:
          "Snacks, galletas, chocolates, bebidas frías, refrescos, jugos, agua, bebidas energéticas, barras de proteína y café en grano recién molido. La selección se adapta a cada ubicación.",
      },
      {
        question: "¿Puedo elegir los productos de la máquina de mi negocio?",
        answer:
          "Sí. Personalizamos la selección según las preferencias de quienes usan la máquina y la ajustamos con el tiempo según lo que más se consume.",
      },
      {
        question: "¿Qué formas de pago aceptan las máquinas?",
        answer: "Según la máquina, efectivo, tarjetas de débito y crédito y Pago Móvil.",
      },
    ],
  },
  {
    id: "cafe-oriente",
    titulo: "Café Oriente",
    preguntas: [
      {
        question: "¿Qué es Café Oriente?",
        answer:
          "Es la marca de café de Todo Vending CA: una estación automática Bianchi LEI 400 con molino integrado que muele el café en el momento de cada pedido. Nunca usa café instantáneo.",
      },
      {
        question: "¿Cuánto tarda una bebida de Café Oriente?",
        answer: "Menos de 40 segundos desde que haces el pedido.",
      },
      {
        question: "¿Cómo se paga en Café Oriente?",
        answer:
          "La estación funciona sin efectivo: tarjeta de débito, tarjeta de crédito, Pago Móvil y débito inmediato.",
      },
      {
        question: "¿Puedo tener una estación de Café Oriente en mi empresa?",
        answer:
          "Sí. La instalación es gratuita: Todo Vending CA instala la estación, la repone y le da mantenimiento, y la empresa solo aporta el espacio. Por ahora instalamos en Lechería.",
      },
    ],
  },
  {
    id: "gift-cards",
    titulo: "Gift Cards",
    preguntas: [
      {
        question: "¿Dónde puedo usar una Gift Card Todo Vending?",
        answer: "En las máquinas de Todo Vending CA y en Café Oriente.",
      },
      {
        question: "¿Cómo se pagan las Gift Cards?",
        answer:
          "El precio está en dólares y se paga en bolívares a la tasa oficial del BCV del día, con Débito Inmediato o Pago Móvil, sin crear una cuenta.",
      },
      {
        question: "¿Cuándo recibo la Gift Card?",
        answer:
          "En cuanto el banco confirma el pago, ves en pantalla un código por cada Gift Card que compraste, junto con tu comprobante.",
      },
    ],
  },
];

const TODAS = GRUPOS.flatMap((g) => g.preguntas);

export default function PreguntasFrecuentes() {
  useSEO({
    title: "Preguntas Frecuentes sobre Máquinas Expendedoras | Todo Vending CA",
    description:
      "Respuestas sobre el servicio de máquinas expendedoras de Todo Vending CA en Lechería: costo, requisitos, productos, pagos, Café Oriente y Gift Cards.",
    path: "/preguntas-frecuentes",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Preguntas frecuentes", path: "/preguntas-frecuentes" },
      ]),
      faqSchema(TODAS),
    ],
  });

  return (
    <PaginaApoyo
      etiqueta="Preguntas frecuentes"
      titulo={
        <>
          Todo lo que <em className="n">nos preguntan</em>
        </>
      }
      lead="Las dudas más comunes sobre el servicio, los productos, los pagos, Café Oriente y las Gift Cards, en un solo lugar."
    >
      <section className="v-sec v-sec--2">
        <div className="v-cont">
          <nav aria-label="Temas" className="vb-filtros" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
            {GRUPOS.map((g) => (
              <a key={g.id} className="v-btn v-btn--s" href={`#${g.id}`}>
                {g.titulo}
              </a>
            ))}
          </nav>
          {GRUPOS.map((g) => (
            <div key={g.id} id={g.id} className="va-grupo" style={{ scrollMarginTop: 110 }}>
              <Etiqueta>{g.titulo}</Etiqueta>
              <div className="va-faq">
                {g.preguntas.map((p) => (
                  <details key={p.question}>
                    <summary>{p.question}</summary>
                    <p>{p.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <SubpageCTA
        title="¿Te quedó alguna duda?"
        text="Escríbenos por WhatsApp y te respondemos."
        ctaText="Escribir por WhatsApp"
      />
    </PaginaApoyo>
  );
}
