import type { PostInput, ProjectInput } from "@/lib/types";

// Proyectos reales del dueño. Las puntuaciones se calculan con la auditoría
// automática (no se inventan): quedan en null hasta que se ejecuta.
export const seedProjects: ProjectInput[] = [
  {
    slug: "todovendingca",
    name: "Todo Vending CA",
    url: "https://www.todovendingca.com",
    description:
      "Sitio corporativo para una empresa de máquinas expendedoras en Lechería, Anzoátegui. Renderizado en servidor (SSR), páginas por intención de búsqueda (empresas, gimnasios, Lechería), schema LocalBusiness y Organization, llms.txt para asistentes de IA, formulario de contacto con aviso por correo y botón de WhatsApp.",
    services: ["Diseño web", "SEO local", "GEO/IAO", "Desarrollo a medida"],
    imageUrl: "/portafolio/todovendingca.jpg",
    featured: true,
    launchedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    sortOrder: 1,
  },
  {
    slug: "cafe-oriente",
    name: "Café Oriente",
    url: "https://www.todovendingca.com/cafe-oriente",
    description:
      "Página de marca para una estación de café automática. Hero con video animado por scroll, menú interactivo de 10 bebidas con ingredientes expuestos a buscadores y a la IA mediante datos estructurados, sección para empresas con WhatsApp y encuesta de calidad conectada a base de datos.",
    services: ["Landing page", "Animación por scroll", "Datos estructurados", "GEO/IAO"],
    imageUrl: "/portafolio/cafe-oriente.jpg",
    featured: true,
    launchedAt: "2026-07-20T00:00:00.000Z",
    status: "published",
    sortOrder: 2,
  },
  {
    slug: "todowebdigital",
    name: "TodoWeb Digital",
    url: "https://www.todowebdigital.com",
    description:
      "Nuestro propio sitio: Next.js con renderizado en servidor, blog con artículos generados por IA desde el panel, portafolio con auditoría SEO/GEO automática, sitemap y feed dinámicos, llms.txt, imágenes Open Graph generadas al vuelo y datos estructurados completos.",
    services: ["Diseño web", "SEO", "GEO/IAO", "Blog con IA"],
    imageUrl: null,
    featured: true,
    launchedAt: "2026-10-23T00:00:00.000Z",
    status: "published",
    sortOrder: 3,
  },
];

export const seedPosts: PostInput[] = [
  {
    slug: "que-es-geo-y-por-que-tu-negocio-debe-aparecer-en-chatgpt",
    title: "Qué es GEO y por qué tu negocio debe aparecer en ChatGPT, Gemini y Perplexity",
    excerpt:
      "El GEO (Generative Engine Optimization) es la evolución del SEO para la era de la inteligencia artificial. Te explicamos qué es, en qué se diferencia del SEO tradicional y qué debe tener tu página web para que la IA la recomiende.",
    category: "GEO e IA",
    tags: ["GEO", "IAO", "SEO", "Inteligencia artificial"],
    keywords: ["qué es GEO", "Generative Engine Optimization", "aparecer en ChatGPT", "optimización para IA", "IAO"],
    metaTitle: "Qué es GEO (Generative Engine Optimization) y cómo aparecer en ChatGPT",
    metaDescription:
      "GEO es optimizar tu web para que ChatGPT, Gemini, Claude y Perplexity la citen y recomienden. Qué es, cómo se diferencia del SEO y qué necesita tu página.",
    status: "published",
    generatedByAi: false,
    publishedAt: "2026-10-20T12:00:00.000Z",
    faq: [
      { q: "¿GEO reemplaza al SEO?", a: "No. El SEO te posiciona en los resultados de Google; el GEO te hace aparecer en las respuestas generadas por IA. Un sitio bien construido trabaja para ambos." },
      { q: "¿Cuánto tarda el GEO en dar resultados?", a: "Los cambios técnicos (llms.txt, datos estructurados, permisos a rastreadores) se reflejan en semanas. Convertirse en fuente citada de forma consistente toma de 2 a 4 meses de contenido claro y verificable." },
      { q: "¿Qué es el archivo llms.txt?", a: "Es un archivo de texto en la raíz de tu dominio (tudominio.com/llms.txt) que resume tu negocio en lenguaje claro para los modelos de IA, igual que robots.txt orienta a los buscadores." },
    ],
    content: `Cada vez más personas ya no "googlean": le preguntan a ChatGPT, a Gemini o a Perplexity. Cuando alguien escribe *"¿qué agencia me recomiendas para hacer una página web en Venezuela?"*, el asistente no muestra diez enlaces azules: da **una respuesta** con dos o tres nombres. Si tu negocio no está en esa respuesta, para ese cliente no existes.

Eso es lo que resuelve el GEO.

## Qué es GEO (Generative Engine Optimization)

**GEO es el conjunto de prácticas que hacen que los motores de respuesta basados en inteligencia artificial entiendan, confíen y citen tu sitio web.** Mientras el SEO tradicional compite por posiciones en una lista de resultados, el GEO compite por ser **la fuente** de la respuesta que la IA redacta.

Los motores generativos (ChatGPT con búsqueda, Google AI Overviews y Gemini, Perplexity, Claude, Copilot) funcionan en dos pasos:

1. **Recuperan** páginas relevantes de la web, igual que un buscador.
2. **Sintetizan** una respuesta en lenguaje natural citando algunas de esas páginas.

El GEO trabaja en los dos pasos: que te recuperen y que te elijan para citar.

## GEO vs. SEO: en qué se parecen y en qué no

| Aspecto | SEO tradicional | GEO |
|---|---|---|
| Objetivo | Posición en la lista de resultados | Ser citado dentro de la respuesta |
| Métrica | Clics y posición media | Menciones, citas y recomendaciones |
| Contenido que gana | Palabras clave + enlaces | Respuestas directas, datos verificables, estructura clara |
| Señales técnicas | Velocidad, indexación, enlaces | Datos estructurados completos, llms.txt, permisos a rastreadores de IA |

La buena noticia: **casi todo lo que mejora el GEO también mejora el SEO.** Un sitio rápido, claro, bien estructurado y con datos verificables gana en ambos frentes.

## Qué es IAO y en qué se diferencia

**IAO (optimización para inteligencia artificial, en inglés AIO)** es el término paraguas. Incluye el GEO y además todo lo que ayuda a que cualquier sistema de IA lea tu presencia digital: la ficha de Google Business, los datos estructurados de tus productos, los archivos para rastreadores y la consistencia de tu nombre, dirección y teléfono en toda la web.

En la práctica, cuando en TodoWeb Digital decimos que una página está "optimizada para SEO, GEO e IAO", significa que está preparada para Google, para los asistentes de IA y para cualquier sistema automático que quiera entender tu negocio.

## Los 7 elementos de una página lista para la IA

### 1. Respuestas directas al inicio de cada sección

La IA extrae fragmentos. Si tu sección "Servicios" empieza con tres párrafos de introducción, no hay nada que citar. Empieza con la respuesta: *"Diseñamos páginas web corporativas desde $499, con entrega en 10 a 15 días hábiles."*

### 2. Datos estructurados (schema.org) completos

Los datos estructurados son etiquetas invisibles que describen tu negocio en un formato que las máquinas entienden sin ambigüedad: tipo de negocio, dirección, horario, servicios, precios, preguntas frecuentes. Un sitio con \`Organization\`, \`LocalBusiness\`, \`Service\` y \`FAQPage\` bien implementados tiene una ventaja enorme.

### 3. El archivo llms.txt

Así como \`robots.txt\` indica a los buscadores qué pueden rastrear, \`llms.txt\` resume tu negocio en texto plano para los modelos de lenguaje. Es gratis, se implementa en una hora y pocos competidores lo tienen.

### 4. Permisos correctos para los rastreadores de IA

Muchos sitios bloquean sin saberlo a **GPTBot** (OpenAI), **ClaudeBot** (Anthropic), **PerplexityBot** o **Google-Extended** en su \`robots.txt\`. Si los bloqueas, no puedes aparecer. Revisa tu archivo o pídenos una auditoría.

### 5. Preguntas frecuentes reales

Las secciones de preguntas y respuestas coinciden con la forma en que la gente le habla a la IA. Cada pregunta debe tener una respuesta completa en dos o tres oraciones, no un "contáctanos para más información".

### 6. Autoridad verificable

La IA prefiere fuentes que puede corroborar: nombre legal, dirección física, teléfono, redes sociales activas, reseñas y menciones en otros sitios. La consistencia de esos datos en toda la web es una señal fuerte.

### 7. Velocidad y HTML limpio

Los rastreadores de IA tienen presupuestos de tiempo. Un sitio que tarda 6 segundos o que solo muestra contenido después de ejecutar JavaScript pesado se queda fuera. El renderizado en servidor (SSR) resuelve esto.

## Cómo saber si tu sitio está listo

Hazte estas preguntas:

- ¿Tu página responde en la primera pantalla qué haces, para quién y dónde?
- ¿Tienes datos estructurados de tipo Organization o LocalBusiness?
- ¿Existe \`tudominio.com/llms.txt\`?
- ¿Tu \`robots.txt\` permite a GPTBot, ClaudeBot y PerplexityBot?
- ¿Tienes una sección de preguntas frecuentes con respuestas completas?

Si respondiste "no" o "no sé" a dos o más, tu sitio está perdiendo clientes que ya te buscan a través de la IA.

## Conclusión

El GEO no es una moda: es la consecuencia natural de que la gente cambie la forma de buscar. Las empresas que preparen su sitio hoy serán las que la IA recomiende mañana, y las que no, tendrán que pagar anuncios para compensar.

En TodoWeb Digital construimos cada página con SEO, GEO e IAO integrados desde el primer día, y auditamos gratis tu sitio actual para decirte exactamente qué le falta. [Solicita tu auditoría](/contacto) o conoce nuestro [servicio de GEO e IAO](/servicios/geo-iao-optimizacion-para-ia).`,
  },
];
