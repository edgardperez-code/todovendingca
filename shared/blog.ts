// Blog de Todo Vending CA: tipos, validacion y Markdown -> HTML compartidos por
// el servidor (API, SSR, sitemap, llms.txt, feed) y el cliente (paginas y panel).
// El HTML del articulo se calcula igual en los dos lados, asi la hidratacion
// coincide con lo que mando el servidor.
import { Marked } from "marked";
import { z } from "zod";

export type EstadoArticulo = "borrador" | "publicado";

export interface PreguntaFrecuente {
  q: string;
  a: string;
}

export interface Articulo {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string; // Markdown, sin el H1
  categoria: string;
  etiquetas: string[];
  metaTitulo: string | null;
  metaDescripcion: string | null;
  palabrasClave: string[];
  faq: PreguntaFrecuente[];
  imagenPortada: string | null;
  estado: EstadoArticulo;
  minutosLectura: number;
  generadoConIa: boolean;
  prompt: string | null;
  publicadoEn: string | null; // ISO
  creadoEn: string; // ISO
  actualizadoEn: string; // ISO
}

// Lo que ve el publico en /blog (sin el prompt ni el contenido completo).
export type ArticuloResumen = Pick<
  Articulo,
  "slug" | "titulo" | "resumen" | "categoria" | "etiquetas" | "imagenPortada" | "minutosLectura" | "publicadoEn" | "actualizadoEn"
>;

// Lo que ve el publico en /blog/:slug.
export type ArticuloPublico = Omit<Articulo, "id" | "prompt" | "generadoConIa" | "estado" | "creadoEn">;

export const CATEGORIAS_BLOG = [
  "Vending para empresas",
  "Café y bebidas",
  "Salud y bienestar",
  "Pagos y tecnología",
  "Negocios",
  "Guías",
] as const;

// "Máquinas en Lechería" -> "maquinas-en-lecheria"
export function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

// Igual que slugificar, pero mientras se escribe: deja un guion al final para
// que se pueda seguir escribiendo la palabra siguiente ("maquinas-" -> "maquinas-cafe").
// Al salir del campo se pasa por slugificar para quitarlo si quedó suelto.
export function slugificarEscribiendo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/g, "")
    .slice(0, 80);
}

export function minutosDeLectura(markdown: string): number {
  const palabras = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 220));
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const preguntaSchema = z.object({
  q: z.string().trim().min(3, "Cada pregunta necesita texto").max(300),
  a: z.string().trim().min(3, "Cada respuesta necesita texto").max(2000),
});

// Crear o editar un articulo desde el panel.
export const articuloEntradaSchema = z.object({
  titulo: z.string().trim().min(5, "El título es muy corto").max(160),
  slug: z
    .string()
    .trim()
    .min(3, "La URL es muy corta")
    .max(100)
    .regex(SLUG, "La URL solo admite minúsculas, números y guiones"),
  resumen: z.string().trim().max(500).default(""),
  contenido: z.string().max(100_000).default(""),
  categoria: z.string().trim().min(2).max(60).default("Guías"),
  etiquetas: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  metaTitulo: z.string().trim().max(90).nullable().default(null),
  metaDescripcion: z.string().trim().max(220).nullable().default(null),
  palabrasClave: z.array(z.string().trim().min(1).max(60)).max(15).default([]),
  faq: z.array(preguntaSchema).max(10).default([]),
  imagenPortada: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^(https:\/\/|\/)/.test(v), "La imagen debe ser una URL https o una ruta /…")
    .nullable()
    .default(null)
    .transform((v) => (v ? v : null)),
  estado: z.enum(["borrador", "publicado"]).default("borrador"),
  generadoConIa: z.boolean().default(false),
  prompt: z.string().max(4000).nullable().default(null),
});
export type ArticuloEntrada = z.infer<typeof articuloEntradaSchema>;

// Pedido de generacion con IA desde el panel.
export const generarArticuloSchema = z.object({
  prompt: z.string().trim().min(10, "Escribe un tema o instrucción de al menos 10 caracteres").max(4000),
  tono: z.enum(["profesional", "cercano", "didactico"]).default("cercano"),
  extension: z.enum(["corto", "medio", "largo"]).default("medio"),
  palabrasClave: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  publico: z.string().trim().max(200).default(""),
  categoria: z.string().trim().max(60).default(""),
});
export type GenerarArticulo = z.infer<typeof generarArticuloSchema>;

// Lo que devuelve la IA (se carga en el editor para revisarlo antes de guardar).
export interface ArticuloGenerado {
  titulo: string;
  slug: string;
  resumen: string;
  metaTitulo: string;
  metaDescripcion: string;
  categoria: string;
  etiquetas: string[];
  palabrasClave: string[];
  contenido: string;
  faq: PreguntaFrecuente[];
}

// === Markdown -> HTML ===
// El contenido lo escribe el dueno o la IA, pero igual no se deja pasar HTML
// crudo: se muestra como texto. Los enlaces externos abren en otra pestana.
function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

const marcado = new Marked({ gfm: true, breaks: false, async: false });
marcado.use({
  renderer: {
    html({ text }) {
      return escaparHtml(text);
    },
    link({ href, title, tokens }) {
      const texto = this.parser.parseInline(tokens);
      const seguro = /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href) ? href : "#";
      const externo = /^https?:\/\//i.test(seguro) && !/^https?:\/\/(www\.)?todovendingca\.com/i.test(seguro);
      const atributos = externo ? ' target="_blank" rel="noopener noreferrer"' : "";
      const titulo = title ? ` title="${escaparHtml(title)}"` : "";
      return `<a href="${escaparHtml(seguro)}"${titulo}${atributos}>${texto}</a>`;
    },
    image({ href, title, text }) {
      if (!/^(https:\/\/|\/)/i.test(href)) return escaparHtml(text);
      const titulo = title ? ` title="${escaparHtml(title)}"` : "";
      return `<img src="${escaparHtml(href)}" alt="${escaparHtml(text)}"${titulo} loading="lazy" decoding="async">`;
    },
  },
});

export function markdownAHtml(markdown: string): string {
  // Por si la IA o el dueno pusieron el H1: el titulo ya va en la pagina.
  const sinH1 = markdown.replace(/^\s*#\s[^\n]+\n+/, "");
  return marcado.parse(sinH1) as string;
}

// Titulos H2 del articulo, para el indice "En este artículo".
export function indiceDeTitulos(markdown: string): { id: string; texto: string }[] {
  const salida: { id: string; texto: string }[] = [];
  for (const linea of markdown.split("\n")) {
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(linea);
    if (m) {
      const texto = m[1].replace(/[*_`]/g, "");
      salida.push({ id: slugificar(texto), texto });
    }
  }
  return salida;
}

// Pone id a los H2 del HTML (para el indice), en el mismo orden que indiceDeTitulos.
export function conAnclas(html: string, indice: { id: string }[]): string {
  let i = 0;
  return html.replace(/<h2>/g, () => {
    const ancla = indice[i++];
    return ancla ? `<h2 id="${ancla.id}">` : "<h2>";
  });
}

export function aResumen(a: Articulo): ArticuloResumen {
  return {
    slug: a.slug,
    titulo: a.titulo,
    resumen: a.resumen,
    categoria: a.categoria,
    etiquetas: a.etiquetas,
    imagenPortada: a.imagenPortada,
    minutosLectura: a.minutosLectura,
    publicadoEn: a.publicadoEn,
    actualizadoEn: a.actualizadoEn,
  };
}

export function aPublico(a: Articulo): ArticuloPublico {
  const { id: _id, prompt: _p, generadoConIa: _g, estado: _e, creadoEn: _c, ...resto } = a;
  return resto;
}
