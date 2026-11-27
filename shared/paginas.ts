// Páginas de contenido del sitio (sectores y páginas de apoyo). Una sola lista
// para el pie de página, el sitemap y llms.txt: al crear una página nueva se
// agrega aquí y aparece en los tres lugares.

export type GrupoPagina = "sector" | "apoyo";

export interface PaginaSitio {
  path: string;
  nombre: string; // texto del enlace
  descripcion: string; // una línea para llms.txt
  grupo: GrupoPagina;
  actualizado: string; // AAAA-MM-DD, para el sitemap
}

export const PAGINAS_SITIO: readonly PaginaSitio[] = [
  {
    path: "/vending-clinicas",
    nombre: "Vending para clínicas",
    descripcion: "máquinas expendedoras para clínicas y hospitales: pacientes, familiares y personal de guardia, con instalación gratuita.",
    grupo: "sector",
    actualizado: "2026-11-24",
  },
  {
    path: "/vending-colegios",
    nombre: "Vending para colegios",
    descripcion: "máquinas expendedoras para colegios y universidades, con productos elegidos junto con la institución.",
    grupo: "sector",
    actualizado: "2026-11-24",
  },
  {
    path: "/vending-hoteles",
    nombre: "Vending para hoteles",
    descripcion: "máquinas expendedoras para hoteles y posadas: snacks, bebidas y café para huéspedes a cualquier hora.",
    grupo: "sector",
    actualizado: "2026-11-24",
  },
  {
    path: "/vending-centros-comerciales",
    nombre: "Vending para centros comerciales",
    descripcion: "máquinas expendedoras para centros comerciales y áreas de alto tráfico.",
    grupo: "sector",
    actualizado: "2026-11-24",
  },
  {
    path: "/vending-industrias",
    nombre: "Vending para industrias",
    descripcion: "máquinas expendedoras para industrias, plantas y galpones con turnos rotativos.",
    grupo: "sector",
    actualizado: "2026-11-24",
  },
  {
    path: "/ubicaciones",
    nombre: "Ubicaciones",
    descripcion: "dónde están hoy las máquinas de Todo Vending CA y en qué zona trabajamos (Lechería).",
    grupo: "apoyo",
    actualizado: "2026-11-24",
  },
  {
    path: "/como-funciona",
    nombre: "Cómo funciona",
    descripcion: "los pasos para tener una máquina expendedora gratis en tu negocio, desde la solicitud hasta la reposición.",
    grupo: "apoyo",
    actualizado: "2026-11-24",
  },
  {
    path: "/catalogo-productos",
    nombre: "Catálogo de productos",
    descripcion: "qué se vende en cada tipo de máquina: snacks, bebidas frías, café Café Oriente y vending deportivo.",
    grupo: "apoyo",
    actualizado: "2026-11-24",
  },
  {
    path: "/preguntas-frecuentes",
    nombre: "Preguntas frecuentes",
    descripcion: "todas las preguntas frecuentes sobre el servicio, los productos, los pagos, Café Oriente y las Gift Cards.",
    grupo: "apoyo",
    actualizado: "2026-11-24",
  },
  {
    path: "/solicitar-maquina",
    nombre: "Solicitar una máquina",
    descripcion: "formulario para pedir una máquina expendedora gratis para tu negocio en Lechería.",
    grupo: "apoyo",
    actualizado: "2026-11-24",
  },
];
