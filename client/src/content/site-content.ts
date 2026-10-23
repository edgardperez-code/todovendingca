// Contenido reutilizable del sitio (servicios, pasos, segmentos, beneficios).
// Todo en español con acentos: es lo que leen las personas, Google y la IA.

export const SERVICES = [
  {
    id: "snacks",
    title: "Máquinas de snacks",
    description: "Galletas, chocolates, snacks salados y opciones saludables de marcas reconocidas, con productos frescos renovados periódicamente.",
    tags: ["Marcas reconocidas", "Opciones saludables"],
  },
  {
    id: "bebidas",
    title: "Máquinas de bebidas frías",
    description: "Refrescos, jugos, agua y bebidas energéticas siempre frías, disponibles a cualquier hora a precios accesibles.",
    tags: ["Siempre frías", "24 horas"],
  },
  {
    id: "cafe",
    title: "Café en grano: Café Oriente",
    description: "Estación automática Bianchi LEI 400 con molino integrado: capuchino, mocachino, café con leche y 7 bebidas más, listas en menos de 40 segundos.",
    tags: ["Grano recién molido", "Sin efectivo"],
    href: "/cafe-oriente",
  },
  {
    id: "deportivo",
    title: "Vending deportivo",
    description: "Bebidas energéticas, barras de proteínas e hidratación para gimnasios y centros deportivos.",
    tags: ["Energéticas", "Proteínas"],
    href: "/vending-gimnasios",
  },
  {
    id: "servicio",
    title: "Instalación, reposición y mantenimiento",
    description: "Instalamos gratis, reponemos según el consumo y damos mantenimiento preventivo y correctivo. Tu negocio no gestiona nada.",
    tags: ["Sin costo", "Monitoreo remoto"],
  },
  {
    id: "pagos",
    title: "Pagos modernos",
    description: "Pago Móvil, tarjetas de débito y crédito y efectivo según el modelo. Menos manejo de dinero, más higiene y seguridad.",
    tags: ["Pago Móvil", "Tarjetas"],
  },
] as const;

export const STEPS = [
  {
    n: "01",
    title: "Nos escribes",
    text: "Por WhatsApp, correo o el formulario. Nos cuentas qué espacio tienes y cuánta gente pasa por ahí.",
  },
  {
    n: "02",
    title: "Evaluamos tu espacio",
    text: "Una visita sin compromiso para confirmar el lugar, la toma eléctrica y el tipo de máquina que conviene.",
  },
  {
    n: "03",
    title: "Instalamos sin costo",
    text: "Llevamos, configuramos y ponemos en marcha la máquina. Acordamos contigo la fecha.",
  },
  {
    n: "04",
    title: "Nosotros la atendemos",
    text: "Reposición, limpieza, mantenimiento y monitoreo remoto corren por Todo Vending CA, siempre.",
  },
] as const;

export const SEGMENTS = [
  {
    id: "empresas",
    title: "Empresas y oficinas",
    text: "Snacks, bebidas y café fuera del horario del comedor, sin que la empresa compre equipos ni contrate personal.",
    href: "/vending-para-empresas",
  },
  {
    id: "clinicas",
    title: "Clínicas y hospitales",
    text: "Opciones 24 horas para pacientes, familiares y personal de guardia cuando la cafetería está cerrada.",
    href: "/vending-para-clinicas",
  },
  {
    id: "gimnasios",
    title: "Gimnasios y deportivos",
    text: "Energéticas, proteínas e hidratación justo después del entrenamiento.",
    href: "/vending-gimnasios",
  },
  {
    id: "colegios",
    title: "Colegios y universidades",
    text: "Complementan cafetines llenos en horas pico con opciones rápidas entre clases.",
  },
  {
    id: "comercios",
    title: "Centros comerciales",
    text: "Variedad y rapidez en áreas de alto tráfico, como complemento a la oferta existente.",
  },
  {
    id: "transporte",
    title: "Terminales y espacios públicos",
    text: "Para quien tiene poco tiempo y necesita algo rápido a cualquier hora.",
  },
] as const;

export const BENEFITS = [
  { title: "Cero inversión", text: "Sin compra de equipo, sin alquiler, sin cuota mensual." },
  { title: "Cero gestión", text: "Reposición, mantenimiento y fallas las resolvemos nosotros." },
  { title: "Disponible 24/7", text: "Las máquinas atienden de noche, fines de semana y feriados." },
  { title: "Imagen que suma", text: "Equipos modernos que mejoran la experiencia de tu espacio." },
  { title: "Productos a medida", text: "La selección se adapta a tu equipo, clientes o pacientes." },
  { title: "Equipo local", text: "Con sede en Lechería: reposición rápida y respuesta técnica cercana." },
] as const;
