// Preguntas frecuentes del sitio. Una sola lista, reutilizada por página.
// Cada respuesta es autocontenida (nombra a Todo Vending CA y el lugar) para
// que buscadores y asistentes de IA puedan citarla sin contexto adicional.
import { BUSINESS } from "@shared/site";

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  topics: Array<"general" | "empresas" | "clinicas" | "gimnasios" | "lecheria" | "cafe">;
};

export const FAQS: FAQ[] = [
  {
    id: "costo",
    question: "¿Tiene algún costo la instalación de una máquina expendedora?",
    answer:
      "No. Todo Vending CA instala la máquina sin ningún costo para el negocio anfitrión: no hay compra de equipo, alquiler ni cuota mensual. El servicio se sostiene con la venta de los productos.",
    topics: ["general", "empresas", "clinicas", "gimnasios", "lecheria"],
  },
  {
    id: "abastece",
    question: "¿Quién abastece las máquinas con productos?",
    answer:
      "Todo Vending CA se encarga de la reposición completa del inventario con visitas regulares según el consumo de cada ubicación, para que la máquina esté siempre abastecida con productos frescos.",
    topics: ["general", "empresas", "clinicas"],
  },
  {
    id: "mantenimiento",
    question: "¿Quién repara o da mantenimiento a las máquinas?",
    answer:
      "El equipo técnico de Todo Vending CA monitorea las máquinas y realiza el mantenimiento preventivo y correctivo. Está incluido en el servicio, sin costo adicional para el negocio.",
    topics: ["general", "empresas", "clinicas", "lecheria"],
  },
  {
    id: "productos",
    question: "¿Qué productos pueden vender las máquinas?",
    answer:
      "Snacks, galletas, chocolates, bebidas frías, refrescos, jugos, agua, bebidas energéticas, barras de proteínas y café en grano recién molido (Café Oriente): capuchino, mocachino, café con leche, chocolate caliente y más. La selección se adapta a cada ubicación.",
    topics: ["general"],
  },
  {
    id: "pagos",
    question: "¿Qué formas de pago aceptan las máquinas expendedoras?",
    answer:
      "Las máquinas de Todo Vending CA aceptan Pago Móvil, tarjetas de débito y crédito y efectivo. La estación de café Café Oriente funciona 100 % sin efectivo.",
    topics: ["general", "clinicas"],
  },
  {
    id: "espacio",
    question: "¿Cuánto espacio necesito para instalar una máquina expendedora?",
    answer:
      "Generalmente un área de aproximadamente 1,5 m × 1 m con acceso a una toma eléctrica. El equipo de Todo Vending CA evalúa el espacio en una visita sin compromiso y recomienda el tipo de máquina adecuado.",
    topics: ["general", "empresas", "lecheria"],
  },
  {
    id: "elegir",
    question: "¿Puedo elegir los productos que se venden en la máquina?",
    answer:
      "Sí. Todo Vending CA personaliza la selección según el perfil de cada empresa, clínica, colegio o gimnasio, y la ajusta con el tiempo según lo que más se consume.",
    topics: ["general", "empresas", "gimnasios"],
  },
  {
    id: "solicitar",
    question: "¿Cómo solicito una máquina expendedora para mi negocio?",
    answer: `Escribe por WhatsApp al ${BUSINESS.phoneDisplay}, envía un correo a ${BUSINESS.email} o llena el formulario en www.todovendingca.com. Todo Vending CA coordina una visita para evaluar el espacio y acuerda contigo la fecha de instalación.`,
    topics: ["general", "lecheria"],
  },
  {
    id: "zonas",
    question: "¿Dónde opera Todo Vending CA?",
    answer:
      "Todo Vending CA tiene su sede en el Centro Comercial Venezuela, Lechería, estado Anzoátegui, y presta servicio en Lechería, Puerto La Cruz, Barcelona y el resto de la región oriental de Venezuela.",
    topics: ["general", "lecheria"],
  },
  {
    id: "gimnasios",
    question: "¿Tienen máquinas expendedoras para gimnasios?",
    answer:
      "Sí. Todo Vending CA ofrece vending deportivo con bebidas energéticas, barras de proteínas, agua y snacks saludables. Ya opera en Lion Gym y en la Cancha 3x3 del Parque Caribe, en Lechería.",
    topics: ["general", "gimnasios"],
  },
  {
    id: "cafe",
    question: "¿Qué es Café Oriente?",
    answer:
      "Café Oriente es la marca de café de Todo Vending CA: una estación automática Bianchi LEI 400 que muele café en grano en el momento del pedido y sirve 10 bebidas en menos de 40 segundos, 24 horas, sin efectivo. Para empresas y clínicas la instalación es gratuita.",
    topics: ["general", "cafe", "empresas", "clinicas"],
  },
  {
    id: "falla",
    question: "¿Qué pasa si la máquina falla o se queda sin productos?",
    answer:
      "Las máquinas de Todo Vending CA cuentan con monitoreo remoto. El equipo técnico, con sede en Lechería, atiende las fallas y repone los productos sin que el negocio tenga que gestionar nada.",
    topics: ["general", "empresas", "clinicas", "lecheria"],
  },
  {
    id: "ingresos",
    question: "¿La máquina genera ingresos para mi negocio?",
    answer:
      "El beneficio principal es un servicio sin costo para tu equipo, clientes o pacientes. Todo Vending CA también ofrece modelos flexibles que pueden generar ingresos adicionales para el establecimiento anfitrión; se conversan en la evaluación.",
    topics: ["general", "empresas"],
  },
  {
    id: "clinicas-24h",
    question: "¿Las máquinas funcionan de noche en clínicas y hospitales?",
    answer:
      "Sí. Las máquinas operan las 24 horas, los 7 días de la semana, de forma autónoma. En clínicas atienden a pacientes, familiares y personal en guardias nocturnas cuando la cafetería está cerrada.",
    topics: ["clinicas"],
  },
  {
    id: "gym-productos",
    question: "¿Qué productos tienen las máquinas para gimnasios?",
    answer:
      "Bebidas energéticas, barras de proteínas, agua, bebidas refrescantes y snacks saludables, pensados para antes y después del entrenamiento, con reposición frecuente según el consumo real del gimnasio.",
    topics: ["gimnasios"],
  },
  {
    id: "empresa-requisitos",
    question: "¿Qué necesita mi empresa u oficina para tener una máquina?",
    answer:
      "Un espacio de aproximadamente 1,5 m × 1 m con una toma eléctrica cercana y un flujo de personas que justifique la máquina. Todo Vending CA evalúa el tráfico y el horario del lugar para recomendar snacks, bebidas o café.",
    topics: ["empresas"],
  },
  {
    id: "plc-barcelona",
    question: "¿Instalan máquinas expendedoras en Puerto La Cruz y Barcelona?",
    answer:
      "Sí. Además de Lechería, Todo Vending CA instala y atiende máquinas en Puerto La Cruz, Barcelona y el resto del estado Anzoátegui, con reposición y servicio técnico desde su sede en Lechería.",
    topics: ["lecheria"],
  },
];

export function faqsFor(topic: FAQ["topics"][number], limit?: number): FAQ[] {
  const list = FAQS.filter((f) => f.topics.includes(topic));
  return limit ? list.slice(0, limit) : list;
}
