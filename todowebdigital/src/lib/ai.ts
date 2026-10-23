// =====================================================================
// Generación de artículos del blog con la API de Claude (Anthropic).
// Entrada: un prompt del dueño desde el panel. Salida: artículo completo
// (título, slug, resumen, metadatos SEO, contenido Markdown, FAQ) listo
// para revisar y publicar.
// =====================================================================
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { services, site, SITE_URL } from "@/lib/site";
import { slugify } from "@/lib/utils";

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export const ArticleSchema = z.object({
  title: z.string().min(10).max(140),
  slug: z.string().min(3).max(100),
  excerpt: z.string().min(40).max(400),
  metaTitle: z.string().min(10).max(90),
  metaDescription: z.string().min(50).max(220),
  category: z.string().min(2).max(60),
  tags: z.array(z.string().min(1).max(40)).min(1).max(8),
  keywords: z.array(z.string().min(1).max(60)).min(1).max(12),
  content: z.string().min(300),
  faq: z.array(z.object({ q: z.string().min(5), a: z.string().min(20) })).min(2).max(6),
});
export type GeneratedArticle = z.infer<typeof ArticleSchema>;

// Esquema JSON equivalente para `output_config.format` (salida estructurada).
const ARTICLE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "slug", "excerpt", "metaTitle", "metaDescription", "category", "tags", "keywords", "content", "faq"],
  properties: {
    title: { type: "string", description: "Título principal (H1) del artículo, 50 a 70 caracteres, con la palabra clave principal al inicio." },
    slug: { type: "string", description: "Slug para la URL: minúsculas, palabras separadas por guiones, sin acentos ni símbolos, máximo 80 caracteres." },
    excerpt: { type: "string", description: "Resumen de 150 a 220 caracteres para la tarjeta del blog. Debe responder qué aprenderá el lector." },
    metaTitle: { type: "string", description: "Título SEO para la etiqueta <title>, máximo 60 caracteres." },
    metaDescription: { type: "string", description: "Meta descripción SEO de 120 a 160 caracteres con una llamada a la acción." },
    category: { type: "string", description: "Categoría del artículo (ej.: Diseño web, SEO, GEO e IA, Marketing digital, Negocios)." },
    tags: { type: "array", items: { type: "string" }, description: "De 3 a 6 etiquetas cortas." },
    keywords: { type: "array", items: { type: "string" }, description: "De 5 a 10 palabras clave objetivo en español." },
    content: { type: "string", description: "Cuerpo del artículo en Markdown. NO incluir el título H1. Usar H2 (##) y H3 (###), listas, negritas, una tabla si aporta, y cerrar con una conclusión con llamada a la acción." },
    faq: {
      type: "array",
      description: "De 3 a 5 preguntas frecuentes reales del lector, cada una con respuesta completa de 2 a 3 oraciones.",
      items: { type: "object", additionalProperties: false, required: ["q", "a"], properties: { q: { type: "string" }, a: { type: "string" } } },
    },
  },
} as const;

export type GenerateOptions = {
  prompt: string;
  tone?: "profesional" | "cercano" | "didactico";
  length?: "corto" | "medio" | "largo";
  keywords?: string[];
  audience?: string;
  category?: string;
};

const LENGTH_WORDS: Record<NonNullable<GenerateOptions["length"]>, string> = {
  corto: "700 a 900 palabras",
  medio: "1200 a 1600 palabras",
  largo: "1900 a 2500 palabras",
};

const TONE_TEXT: Record<NonNullable<GenerateOptions["tone"]>, string> = {
  profesional: "profesional y claro, sin tecnicismos innecesarios",
  cercano: "cercano y conversacional, como un asesor de confianza que tutea al lector",
  didactico: "didáctico y paso a paso, pensado para alguien que no es técnico",
};

function systemPrompt(): string {
  const serviceLinks = services.map((s) => `- ${s.name}: ${SITE_URL}/servicios/${s.slug}`).join("\n");
  return `Eres el redactor senior del blog de ${site.name} (${site.domain}), una agencia venezolana de diseño y desarrollo de páginas web especializada en optimización SEO, GEO (Generative Engine Optimization) e IAO (optimización para inteligencia artificial). La agencia está en Lechería, Anzoátegui, Venezuela, y atiende clientes de toda Venezuela y Latinoamérica de forma remota.

Escribes artículos en español neutro latinoamericano para dueños de negocios, emprendedores y responsables de marketing que quieren conseguir más clientes a través de su página web.

Principios de redacción (SEO + GEO):
- Empieza cada sección con la respuesta directa; después desarrolla. Los motores de IA citan fragmentos que responden de forma completa en 2 o 3 oraciones.
- Usa H2 y H3 descriptivos en forma de pregunta o afirmación clara. Nunca incluyas el H1 dentro del contenido.
- Incluye listas, pasos numerados y, cuando aporte valor, una tabla comparativa en Markdown.
- Define los términos técnicos la primera vez que aparecen (ej.: "SEO (Search Engine Optimization) es...").
- No inventes estadísticas, estudios, cifras, testimonios ni nombres de clientes. Si necesitas un dato, usa afirmaciones generales verificables o ejemplos hipotéticos claramente marcados como tales.
- Menciona a ${site.name} con naturalidad una o dos veces y cierra con una conclusión que invite a contactar o a conocer un servicio, usando enlaces internos relativos como /contacto o estos servicios:
${serviceLinks}
- Evita relleno, clichés y frases como "en el mundo actual" o "en la era digital". Cada párrafo debe aportar algo concreto.
- Usa negritas para las ideas clave que un lector escanearía.
- El slug debe ser corto, en minúsculas, sin acentos, con guiones.

Devuelve exclusivamente el JSON con la estructura solicitada.`;
}

function userPrompt(opts: GenerateOptions): string {
  const parts = [
    `Tema / instrucciones del dueño:\n${opts.prompt.trim()}`,
    `Extensión objetivo: ${LENGTH_WORDS[opts.length ?? "medio"]}.`,
    `Tono: ${TONE_TEXT[opts.tone ?? "profesional"]}.`,
  ];
  if (opts.audience?.trim()) parts.push(`Público objetivo: ${opts.audience.trim()}.`);
  if (opts.keywords?.length) parts.push(`Palabras clave que deben aparecer de forma natural: ${opts.keywords.join(", ")}.`);
  if (opts.category?.trim()) parts.push(`Categoría sugerida: ${opts.category.trim()}.`);
  parts.push("Fecha de hoy: " + new Date().toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric" }) + ".");
  return parts.join("\n\n");
}

export class AiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export async function generateArticle(opts: GenerateOptions): Promise<{ article: GeneratedArticle; usage: { input: number; output: number }; model: string }> {
  if (!aiConfigured()) throw new AiError("Falta ANTHROPIC_API_KEY en las variables de entorno.", 503);
  if (!opts.prompt || opts.prompt.trim().length < 10) throw new AiError("Escribe un tema o instrucción de al menos 10 caracteres.", 400);

  const client = new Anthropic({ timeout: 10 * 60 * 1000 });

  try {
    // Streaming: los artículos largos tardan más de lo que permite una petición
    // normal. `fallbacks: "default"` reintenta en otro modelo si el clasificador
    // de seguridad rechaza la petición por error.
    const stream = client.beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt(),
      messages: [{ role: "user", content: userPrompt(opts) }],
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: ARTICLE_JSON_SCHEMA },
      },
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new AiError("La IA declinó generar este contenido. Prueba con otro tema o redacción.", 422);
    }
    if (message.stop_reason === "max_tokens") {
      throw new AiError("El artículo quedó incompleto por longitud. Pide una extensión más corta.", 422);
    }
    const text = message.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!text) throw new AiError("La IA no devolvió contenido.", 502);

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new AiError("La respuesta de la IA no fue un JSON válido. Intenta de nuevo.", 502);
    }
    const parsed = ArticleSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AiError("La respuesta de la IA no tiene el formato esperado: " + parsed.error.issues.map((i) => i.path.join(".")).join(", "), 502);
    }
    const article = parsed.data;
    article.slug = slugify(article.slug || article.title);
    article.content = article.content.replace(/^#\s[^\n]+\n+/, ""); // por si incluyó el H1 igual
    return {
      article,
      usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
      model: message.model,
    };
  } catch (err) {
    if (err instanceof AiError) throw err;
    if (err instanceof Anthropic.AuthenticationError) throw new AiError("La ANTHROPIC_API_KEY no es válida.", 503);
    if (err instanceof Anthropic.RateLimitError) throw new AiError("Límite de uso de la API alcanzado. Espera un minuto y reintenta.", 429);
    if (err instanceof Anthropic.BadRequestError) throw new AiError(`La API rechazó la petición: ${err.message}`, 502);
    if (err instanceof Anthropic.APIConnectionError) throw new AiError("No se pudo conectar con la API de Claude.", 502);
    if (err instanceof Anthropic.APIError) throw new AiError(`Error de la API de Claude (${err.status}): ${err.message}`, 502);
    throw new AiError((err as Error).message || "Error desconocido generando el artículo.", 500);
  }
}
