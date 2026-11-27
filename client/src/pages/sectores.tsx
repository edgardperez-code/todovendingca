// Páginas por sector. Cada una es una configuración de <PaginaSector />.
// Regla de contenido: solo datos reales del negocio (instalación gratis,
// reposición y mantenimiento incluidos, espacio de 1,5 m × 1 m, pagos con
// efectivo, tarjeta o Pago Móvil) y solo Lechería como zona. Los clientes
// salen de la lista real de ubicaciones; los sectores sin clientes no muestran
// esa sección.
import { PaginaSector, FAQ_COMUNES, type ConfigSector } from "@/components/pagina-sector";
import { currentLocations } from "@/components/locations-section";

function clientesDeTipo(tipo: string) {
  return currentLocations.filter((u) => u.type === tipo).map((u) => ({ nombre: u.name, tipo: u.description }));
}

const clinicas: ConfigSector = {
  path: "/vending-clinicas",
  nombreCorto: "Vending para Clínicas",
  seo: {
    titulo: "Máquinas Expendedoras para Clínicas y Hospitales en Lechería | Todo Vending CA",
    descripcion:
      "Máquinas expendedoras para clínicas y hospitales en Lechería: snacks, bebidas y café 24/7 para pacientes, familiares y personal de guardia. Instalación gratuita.",
  },
  hero: {
    chip: "24/7",
    eyebrow: "Salud · Lechería",
    tituloPlano: "Vending para",
    tituloAcento: "clínicas y hospitales",
    lead: "En una clínica la gente espera a cualquier hora: pacientes, familiares y personal en turnos largos. Instalamos máquinas de snacks, bebidas y café sin costo para la clínica, y nos encargamos de la reposición y el mantenimiento.",
    cta: "Quiero una máquina para mi clínica",
  },
  servicio: {
    nombre: "Vending para clínicas y hospitales",
    audiencia: "Clínicas, hospitales y centros de salud",
    descripcion:
      "Instalación gratuita de máquinas expendedoras de snacks, bebidas y café en clínicas y hospitales de Lechería, con reposición y mantenimiento incluidos.",
  },
  beneficios: {
    etiqueta: "Pensado para la salud",
    titulo: (
      <>
        Opciones a <em className="n">cualquier hora</em>
      </>
    ),
    lead: "La cafetería cierra, las guardias no. Una máquina resuelve la comida rápida y el café de madrugada sin que la clínica contrate personal ni compre equipos.",
    items: [
      { icono: "salud", titulo: "Para guardias largas", texto: "Médicos, enfermeras y personal de turno encuentran café y algo de comer en cualquier momento." },
      { icono: "corazon", titulo: "Alivio para familiares", texto: "Quien acompaña a un paciente no tiene que salir de la clínica para comprar agua o un snack." },
      { icono: "llave", titulo: "Cero gestión", texto: "Reponemos, limpiamos y reparamos. La clínica solo aporta el espacio y la toma eléctrica." },
    ],
  },
  productos: {
    titulo: (
      <>
        Lo que más se necesita en una <em>sala de espera</em>
      </>
    ),
    lead: "Elegimos los productos con la clínica y los ajustamos según lo que más se consume.",
    items: [
      { icono: "bebida", titulo: "Agua y bebidas", texto: "Agua, jugos y refrescos fríos, lo primero que se busca en una espera." },
      { icono: "snack", titulo: "Snacks y opciones ligeras", texto: "Galletas, chocolates y alternativas más saludables, a elección de la clínica." },
      { icono: "cafe", titulo: "Café recién molido", texto: "Con Café Oriente, capuchino, café con leche y más, listos en menos de 40 segundos." },
    ],
  },
  clientes: clientesDeTipo("Clínica"),
  faqs: [
    FAQ_COMUNES[0],
    {
      question: "¿La clínica puede elegir qué productos se venden?",
      answer:
        "Sí. Definimos la selección junto con la clínica, por ejemplo con más agua y opciones ligeras, y la ajustamos con el tiempo según lo que más se consume.",
    },
    {
      question: "¿Cómo pagan los pacientes y familiares?",
      answer:
        "Según la máquina, con efectivo, tarjeta de débito o crédito y Pago Móvil. La estación de café Café Oriente funciona sin efectivo.",
    },
    FAQ_COMUNES[2],
  ],
  cta: {
    titulo: "Lleva vending a tu clínica",
    texto: "Cuéntanos sobre tu clínica y coordinamos una evaluación del espacio sin compromiso.",
  },
};

const colegios: ConfigSector = {
  path: "/vending-colegios",
  nombreCorto: "Vending para Colegios",
  seo: {
    titulo: "Máquinas Expendedoras para Colegios y Universidades en Lechería | Todo Vending CA",
    descripcion:
      "Máquinas expendedoras para colegios y universidades en Lechería, con productos elegidos junto con la institución. Instalación, reposición y mantenimiento sin costo.",
  },
  hero: {
    eyebrow: "Educación · Lechería",
    tituloPlano: "Vending para",
    tituloAcento: "colegios y universidades",
    lead: "Una máquina expendedora complementa la cafetería en las horas pico y fuera de horario. La institución decide qué productos se venden; nosotros instalamos sin costo, reponemos y damos mantenimiento.",
    cta: "Quiero una máquina para mi colegio",
  },
  servicio: {
    nombre: "Vending para colegios y universidades",
    audiencia: "Colegios, universidades e institutos educativos",
    descripcion:
      "Instalación gratuita de máquinas expendedoras en colegios y universidades de Lechería, con selección de productos acordada con la institución.",
  },
  beneficios: {
    etiqueta: "Pensado para la educación",
    titulo: (
      <>
        Menos colas en el <em className="n">recreo</em>
      </>
    ),
    lead: "En los recreos y cambios de clase la cafetería se llena. La máquina ofrece una opción rápida para estudiantes, docentes y representantes.",
    items: [
      { icono: "birrete", titulo: "La institución decide", texto: "Acordamos con el colegio qué productos se venden y cuáles no, para estudiantes y para personal." },
      { icono: "rayo", titulo: "Compra rápida", texto: "Una opción en segundos entre clases, sin quitarle clientes a la cafetería en lo que ella ya ofrece." },
      { icono: "llave", titulo: "Cero gestión", texto: "Reponemos, limpiamos y reparamos. El colegio solo aporta el espacio y la toma eléctrica." },
    ],
  },
  productos: {
    titulo: (
      <>
        Productos que el <em>colegio aprueba</em>
      </>
    ),
    lead: "La selección se arma con la institución y puede priorizar opciones más saludables.",
    items: [
      { icono: "bebida", titulo: "Agua y jugos", texto: "Bebidas frías para el recreo y las actividades deportivas." },
      { icono: "snack", titulo: "Snacks a elección", texto: "Galletas, snacks y opciones más saludables según lo que acuerde el colegio." },
      { icono: "cafe", titulo: "Café para el personal", texto: "En salas de profesores o universidades, café recién molido con Café Oriente." },
    ],
  },
  clientes: clientesDeTipo("Educación"),
  faqs: [
    FAQ_COMUNES[0],
    {
      question: "¿El colegio puede limitar los productos que se venden?",
      answer:
        "Sí. La selección se acuerda con la institución: puede pedir más opciones saludables o dejar fuera los productos que no quiera ofrecer a sus estudiantes.",
    },
    FAQ_COMUNES[1],
    FAQ_COMUNES[2],
  ],
  cta: {
    titulo: "Lleva vending a tu colegio",
    texto: "Cuéntanos sobre tu institución y coordinamos una evaluación del espacio sin compromiso.",
  },
};

const hoteles: ConfigSector = {
  path: "/vending-hoteles",
  nombreCorto: "Vending para Hoteles",
  seo: {
    titulo: "Máquinas Expendedoras para Hoteles y Posadas en Lechería | Todo Vending CA",
    descripcion:
      "Máquinas expendedoras para hoteles y posadas en Lechería: snacks, bebidas y café para huéspedes a cualquier hora. Instalación, reposición y mantenimiento sin costo.",
  },
  hero: {
    chip: "24/7",
    eyebrow: "Turismo · Lechería",
    tituloPlano: "Vending para",
    tituloAcento: "hoteles y posadas",
    lead: "Tus huéspedes llegan tarde, salen temprano a la playa o simplemente quieren algo frío sin salir del hotel. Una máquina expendedora lo resuelve a cualquier hora, sin costo para el hotel.",
    cta: "Quiero una máquina para mi hotel",
  },
  servicio: {
    nombre: "Vending para hoteles y posadas",
    audiencia: "Hoteles, posadas y alojamientos turísticos",
    descripcion:
      "Instalación gratuita de máquinas expendedoras de snacks, bebidas y café en hoteles y posadas de Lechería, con reposición y mantenimiento incluidos.",
  },
  beneficios: {
    etiqueta: "Pensado para huéspedes",
    titulo: (
      <>
        Un servicio más, <em className="n">sin costo</em>
      </>
    ),
    lead: "Agua, bebidas, snacks y café disponibles cuando la recepción o el restaurante no pueden atender, sin que el hotel compre equipos ni maneje inventario.",
    items: [
      { icono: "sol", titulo: "A cualquier hora", texto: "Para el huésped que llega de madrugada o sale temprano, la máquina siempre está abierta." },
      { icono: "premio", titulo: "Mejor experiencia", texto: "Un detalle práctico que el huésped agradece y que no le cuesta nada al hotel." },
      { icono: "llave", titulo: "Cero gestión", texto: "Reponemos, limpiamos y reparamos. El hotel solo aporta el espacio y la toma eléctrica." },
    ],
  },
  productos: {
    titulo: (
      <>
        Lo que busca un <em>huésped</em>
      </>
    ),
    lead: "Armamos la selección con el hotel según el perfil de sus huéspedes.",
    items: [
      { icono: "bebida", titulo: "Agua y bebidas frías", texto: "Agua, refrescos y jugos para el calor de la costa." },
      { icono: "snack", titulo: "Snacks", texto: "Galletas, chocolates y snacks salados para cualquier momento." },
      { icono: "cafe", titulo: "Café de la mañana", texto: "Café en grano recién molido con Café Oriente, listo en menos de 40 segundos." },
    ],
  },
  faqs: [
    FAQ_COMUNES[0],
    {
      question: "¿Dónde conviene poner la máquina en un hotel?",
      answer:
        "Normalmente en un área común de paso, como el lobby, un pasillo o la zona de piscina, con una toma eléctrica cerca. Lo evaluamos juntos en la visita.",
    },
    {
      question: "¿Cómo pagan los huéspedes?",
      answer: "Según la máquina, con efectivo, tarjeta de débito o crédito y Pago Móvil.",
    },
    FAQ_COMUNES[2],
  ],
  cta: {
    titulo: "Lleva vending a tu hotel",
    texto: "Cuéntanos sobre tu hotel o posada y coordinamos una evaluación del espacio sin compromiso.",
  },
};

const centrosComerciales: ConfigSector = {
  path: "/vending-centros-comerciales",
  nombreCorto: "Vending para Centros Comerciales",
  seo: {
    titulo: "Máquinas Expendedoras para Centros Comerciales en Lechería | Todo Vending CA",
    descripcion:
      "Máquinas expendedoras para centros comerciales y áreas de alto tráfico en Lechería. Instalación gratuita, reposición y mantenimiento incluidos.",
  },
  hero: {
    eyebrow: "Comercio · Lechería",
    tituloPlano: "Vending para",
    tituloAcento: "centros comerciales",
    lead: "En pasillos, estacionamientos y áreas de espera pasa mucha gente con poco tiempo. Una máquina expendedora le ofrece agua, bebidas, snacks o café en segundos, sin costo de instalación para el centro comercial.",
    cta: "Quiero una máquina para mi centro comercial",
  },
  servicio: {
    nombre: "Vending para centros comerciales",
    audiencia: "Centros comerciales, galerías y áreas de alto tráfico",
    descripcion:
      "Instalación gratuita de máquinas expendedoras en centros comerciales de Lechería, con reposición y mantenimiento incluidos.",
  },
  beneficios: {
    etiqueta: "Pensado para el alto tráfico",
    titulo: (
      <>
        Compra en <em className="n">segundos</em>
      </>
    ),
    lead: "La máquina atiende a visitantes, trabajadores de los locales y personal de seguridad, incluso cuando los locales de comida están cerrados.",
    items: [
      { icono: "bolsa", titulo: "Para visitantes y locatarios", texto: "Una opción rápida para quien compra, quien trabaja en los locales y quien espera." },
      { icono: "rayo", titulo: "Sin colas", texto: "Complementa la feria de comida con lo básico: agua, bebidas y snacks al instante." },
      { icono: "llave", titulo: "Cero gestión", texto: "Reponemos, limpiamos y reparamos. El centro solo aporta el espacio y la toma eléctrica." },
    ],
  },
  productos: {
    titulo: (
      <>
        Lo básico, <em>siempre disponible</em>
      </>
    ),
    lead: "La selección se ajusta según el tráfico y lo que más se consume en cada punto.",
    items: [
      { icono: "bebida", titulo: "Agua y refrescos", texto: "Bebidas frías para el recorrido o la espera." },
      { icono: "snack", titulo: "Snacks", texto: "Galletas, chocolates y snacks salados de marcas reconocidas." },
      { icono: "cafe", titulo: "Café", texto: "Café en grano recién molido con Café Oriente, donde el espacio lo permita." },
    ],
  },
  faqs: [
    FAQ_COMUNES[0],
    {
      question: "¿Se puede instalar más de una máquina en el centro comercial?",
      answer:
        "Sí, si el tráfico lo justifica. En la evaluación vemos los puntos de más paso y recomendamos cuántas máquinas y de qué tipo.",
    },
    FAQ_COMUNES[1],
    FAQ_COMUNES[2],
  ],
  cta: {
    titulo: "Lleva vending a tu centro comercial",
    texto: "Cuéntanos sobre tu centro comercial y coordinamos una evaluación sin compromiso.",
  },
};

const industrias: ConfigSector = {
  path: "/vending-industrias",
  nombreCorto: "Vending para Industrias",
  seo: {
    titulo: "Máquinas Expendedoras para Industrias y Plantas en Lechería | Todo Vending CA",
    descripcion:
      "Máquinas expendedoras para industrias, plantas y galpones con turnos rotativos en Lechería. Snacks, bebidas y café sin costo de instalación.",
  },
  hero: {
    chip: "24/7",
    eyebrow: "Industria · Lechería",
    tituloPlano: "Vending para",
    tituloAcento: "industrias y plantas",
    lead: "Los turnos de noche y de fin de semana también necesitan café y algo de comer. Instalamos máquinas expendedoras en plantas y galpones sin costo para la empresa, con reposición y mantenimiento incluidos.",
    cta: "Quiero una máquina para mi planta",
  },
  servicio: {
    nombre: "Vending para industrias y plantas",
    audiencia: "Industrias, plantas, galpones y almacenes",
    descripcion:
      "Instalación gratuita de máquinas expendedoras en industrias y plantas de Lechería, para trabajadores de todos los turnos.",
  },
  beneficios: {
    etiqueta: "Pensado para los turnos",
    titulo: (
      <>
        Para <em className="n">todos los turnos</em>
      </>
    ),
    lead: "El comedor tiene horario; la planta no. La máquina da a los trabajadores una opción a cualquier hora sin salir de las instalaciones.",
    items: [
      { icono: "sol", titulo: "Turnos rotativos", texto: "Café y comida rápida también en el turno de noche y los fines de semana." },
      { icono: "escudo", titulo: "Sin salir de la planta", texto: "Los trabajadores no tienen que dejar las instalaciones para comprar algo." },
      { icono: "llave", titulo: "Cero gestión", texto: "Reponemos, limpiamos y reparamos. La empresa solo aporta el espacio y la toma eléctrica." },
    ],
  },
  productos: {
    titulo: (
      <>
        Energía para la <em>jornada</em>
      </>
    ),
    lead: "Elegimos los productos con la empresa según los turnos y lo que más se consume.",
    items: [
      { icono: "cafe", titulo: "Café recién molido", texto: "Con Café Oriente, café en grano listo en menos de 40 segundos." },
      { icono: "bebida", titulo: "Agua e hidratación", texto: "Agua, bebidas frías y energéticas para jornadas largas." },
      { icono: "snack", titulo: "Snacks", texto: "Galletas, chocolates, snacks salados y barras de proteína." },
    ],
  },
  faqs: [
    FAQ_COMUNES[0],
    {
      question: "¿La máquina funciona en el turno de noche?",
      answer:
        "Sí. Las máquinas funcionan las 24 horas; la reposición la coordinamos con la empresa según los turnos y el consumo.",
    },
    FAQ_COMUNES[1],
    FAQ_COMUNES[2],
  ],
  cta: {
    titulo: "Lleva vending a tu planta",
    texto: "Cuéntanos sobre tu empresa y coordinamos una evaluación del espacio sin compromiso.",
  },
};

export function VendingClinicas() {
  return <PaginaSector c={clinicas} />;
}
export function VendingColegios() {
  return <PaginaSector c={colegios} />;
}
export function VendingHoteles() {
  return <PaginaSector c={hoteles} />;
}
export function VendingCentrosComerciales() {
  return <PaginaSector c={centrosComerciales} />;
}
export function VendingIndustrias() {
  return <PaginaSector c={industrias} />;
}
