// Redaccion de articulos del blog con la API de Claude. El dueno escribe un
// tema desde /admin y Claude devuelve el articulo completo (titulo, URL,
// resumen, metadatos SEO, contenido en Markdown y preguntas frecuentes) para
// revisarlo en el editor antes de publicarlo. Nada se publica solo.
//
// Mismo enfoque que el blog de TodoWeb Digital: streaming (los articulos largos
// tardan), salida estructurada con esquema JSON y fallbacks del servidor por si
// el clasificador de seguridad rechaza por error.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { slugificar, type ArticuloGenerado, type GenerarArticulo } from "@shared/blog";

const MODELO = () => process.env.CLAUDE_MODEL?.trim() || "claude-opus-5-5";

export function iaConfigurada(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim() || process.env.ANTHROPIC_AUTH_TOKEN?.trim());
}

export class ErrorIa extends Error {
  constructor(
    mensaje: string,
    readonly status = 500,
  ) {
    super(mensaje);
    this.name = "ErrorIa";
  }
}

const respuestaSchema = z.object({
  titulo: z.string().min(10).max(160),
  slug: z.string().min(3).max(100),
  resumen: z.string().min(40).max(500),
  metaTitulo: z.string().min(10).max(90),
  metaDescripcion: z.string().min(50).max(220),
  categoria: z.string().min(2).max(60),
  etiquetas: z.array(z.string().min(1).max(40)).min(1).max(8),
  palabrasClave: z.array(z.string().min(1).max(60)).min(1).max(12),
  contenido: z.string().min(300),
  faq: z.array(z.object({ q: z.string().min(5), a: z.string().min(20) })).min(2).max(6),
});

const ESQUEMA_JSON = {
  type: "object",
  additionalProperties: false,
  required: ["titulo", "slug", "resumen", "metaTitulo", "metaDescripcion", "categoria", "etiquetas", "palabrasClave", "contenido", "faq"],
  properties: {
    titulo: { type: "string", description: "Título (H1) de 50 a 70 caracteres, con la palabra clave principal al inicio." },
    slug: { type: "string", description: "URL corta: minúsculas, palabras separadas por guiones, sin acentos ni símbolos, máximo 80 caracteres." },
    resumen: { type: "string", description: "Resumen de 150 a 220 caracteres para la tarjeta del blog: qué aprenderá el lector." },
    metaTitulo: { type: "string", description: "Título SEO para <title>, máximo 60 caracteres." },
    metaDescripcion: { type: "string", description: "Meta descripción de 120 a 160 caracteres con una llamada a la acción." },
    categoria: {
      type: "string",
      description:
        "Una de: Vending para empresas, Café y bebidas, Salud y bienestar, Pagos y tecnología, Negocios, Guías (o la categoría sugerida por el dueño).",
    },
    etiquetas: { type: "array", items: { type: "string" }, description: "De 3 a 6 etiquetas cortas." },
    palabrasClave: { type: "array", items: { type: "string" }, description: "De 5 a 10 palabras clave objetivo en español." },
    contenido: {
      type: "string",
      description:
        "Cuerpo en Markdown SIN el título H1. H2 (##) y H3 (###), listas, negritas, una tabla si aporta, y una conclusión con llamada a la acción.",
    },
    faq: {
      type: "array",
      description: "De 3 a 5 preguntas frecuentes reales del lector, cada una con respuesta completa de 2 o 3 oraciones.",
      items: { type: "object", additionalProperties: false, required: ["q", "a"], properties: { q: { type: "string" }, a: { type: "string" } } },
    },
  },
} as const;

const PALABRAS: Record<GenerarArticulo["extension"], string> = {
  corto: "700 a 900 palabras",
  medio: "1200 a 1600 palabras",
  largo: "1900 a 2500 palabras",
};

const TONOS: Record<GenerarArticulo["tono"], string> = {
  profesional: "profesional y claro, sin tecnicismos innecesarios",
  cercano: "cercano y conversacional, como un asesor de confianza que tutea al lector",
  didactico: "didáctico y paso a paso, pensado para alguien que nunca ha tenido una máquina expendedora",
};

// Fijo (sin fechas ni datos variables) para que la cache de prompts funcione.
const SISTEMA = `Eres el redactor del blog de Todo Vending CA (www.todovendingca.com), una empresa venezolana de máquinas expendedoras (vending) con sede en Lechería, estado Anzoátegui.

Lo que hace la empresa (son los únicos datos del negocio que puedes afirmar):
- Instala máquinas de snacks, bebidas frías, café en grano (marca Café Oriente, con estación Bianchi LEI 400 y molino integrado) y vending deportivo (bebidas energéticas y barras de proteínas) en empresas, oficinas, clínicas, colegios, gimnasios y espacios públicos.
- La instalación es gratuita y sin compromiso; Todo Vending CA se encarga de la reposición del inventario y del mantenimiento técnico. El local solo aporta un espacio de unos 1,5 m × 1 m y una toma eléctrica.
- Las máquinas aceptan efectivo, tarjetas de débito y crédito y Pago Móvil.
- Por ahora trabaja solo en Lechería, estado Anzoátegui. No digas que atiende otras ciudades.
- Vende Gift Cards Todo Vending que se pagan en bolívares.
- Contacto: WhatsApp +58 414-616-4177.

Escribes en español de Venezuela, natural y claro, para dueños y gerentes de empresas, clínicas, colegios y gimnasios que evalúan poner una máquina expendedora, y para clientes que compran en las máquinas.

Reglas de redacción (SEO, GEO e IAO):
- Empieza cada sección con la respuesta directa y después desarrolla. Los buscadores con IA citan fragmentos que responden completos en 2 o 3 oraciones.
- H2 y H3 descriptivos, en forma de pregunta o afirmación clara. Nunca pongas el H1 dentro del contenido.
- Usa listas, pasos numerados y, si aporta, una tabla comparativa en Markdown.
- Define los términos técnicos la primera vez (por ejemplo: "vending es la venta automática de productos mediante máquinas").
- NO inventes estadísticas, estudios, precios, tasas de cambio, testimonios, nombres de clientes ni ubicaciones. Si necesitas un dato, usa afirmaciones generales verificables o ejemplos marcados claramente como hipotéticos.
- Menciona a Todo Vending CA con naturalidad una o dos veces. Cierra con una conclusión que invite a solicitar una máquina, usando enlaces internos relativos que existen: / (inicio), /vending-para-empresas, /vending-gimnasios, /maquinas-expendedoras-lecheria, /vending-clinicas, /vending-colegios, /como-funciona, /catalogo-productos, /solicitar-maquina, /cafe-oriente y /gift-card.
- Nada de relleno ni frases como "en el mundo actual" o "en la era digital". Cada párrafo aporta algo concreto.
- Negritas para las ideas clave que alguien leería por encima.

Devuelve solo el JSON con la estructura pedida.`;

function pedidoUsuario(o: GenerarArticulo): string {
  const partes = [
    `Tema e instrucciones del dueño:\n${o.prompt}`,
    `Extensión: ${PALABRAS[o.extension]}.`,
    `Tono: ${TONOS[o.tono]}.`,
  ];
  if (o.publico) partes.push(`Público: ${o.publico}.`);
  if (o.palabrasClave.length) partes.push(`Palabras clave que deben aparecer de forma natural: ${o.palabrasClave.join(", ")}.`);
  if (o.categoria) partes.push(`Categoría sugerida: ${o.categoria}.`);
  partes.push(`Fecha de hoy: ${new Date().toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric" })}.`);
  return partes.join("\n\n");
}

export async function generarArticulo(o: GenerarArticulo): Promise<{ articulo: ArticuloGenerado; modelo: string }> {
  if (!iaConfigurada()) throw new ErrorIa("Falta ANTHROPIC_API_KEY en las variables del servidor.", 503);

  const cliente = new Anthropic({ timeout: 10 * 60 * 1000 });
  try {
    const stream = cliente.beta.messages.stream({
      model: MODELO(),
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: pedidoUsuario(o) }],
      output_config: { effort: "high", format: { type: "json_schema", schema: ESQUEMA_JSON } },
    });
    const mensaje = await stream.finalMessage();

    if (mensaje.stop_reason === "refusal") {
      throw new ErrorIa("La IA no quiso redactar este tema. Prueba con otro enfoque o redacción.", 422);
    }
    if (mensaje.stop_reason === "max_tokens") {
      throw new ErrorIa("El artículo quedó incompleto por largo. Pide una extensión más corta.", 422);
    }
    const texto = mensaje.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!texto) throw new ErrorIa("La IA no devolvió contenido. Intenta de nuevo.", 502);

    let crudo: unknown;
    try {
      crudo = JSON.parse(texto);
    } catch {
      throw new ErrorIa("La respuesta de la IA no vino en el formato esperado. Intenta de nuevo.", 502);
    }
    const r = respuestaSchema.safeParse(crudo);
    if (!r.success) {
      throw new ErrorIa(`La respuesta de la IA vino incompleta (${r.error.issues.map((i) => i.path.join(".")).join(", ")}). Intenta de nuevo.`, 502);
    }
    const articulo: ArticuloGenerado = {
      ...r.data,
      slug: slugificar(r.data.slug || r.data.titulo),
      contenido: r.data.contenido.replace(/^\s*#\s[^\n]+\n+/, ""),
    };
    console.log(
      `[blog] Artículo generado con ${mensaje.model}: ${mensaje.usage.input_tokens} tokens de entrada, ${mensaje.usage.output_tokens} de salida`,
    );
    return { articulo, modelo: mensaje.model };
  } catch (error) {
    if (error instanceof ErrorIa) throw error;
    if (error instanceof Anthropic.AuthenticationError) throw new ErrorIa("La ANTHROPIC_API_KEY no es válida.", 503);
    if (error instanceof Anthropic.RateLimitError) throw new ErrorIa("Se alcanzó el límite de uso de la IA. Espera un minuto y reintenta.", 429);
    if (error instanceof Anthropic.BadRequestError) throw new ErrorIa(`La IA rechazó la petición: ${error.message}`, 502);
    if (error instanceof Anthropic.APIConnectionError) throw new ErrorIa("No se pudo conectar con la IA. Intenta de nuevo.", 502);
    if (error instanceof Anthropic.APIError) throw new ErrorIa(`Error de la IA (${error.status}). Intenta de nuevo.`, 502);
    throw new ErrorIa("Error inesperado generando el artículo.", 500);
  }
}
