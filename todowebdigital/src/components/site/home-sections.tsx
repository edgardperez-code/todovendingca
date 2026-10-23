import Link from "next/link";
import { ArrowRight, Bot, Gauge, Globe2, ShieldCheck, Sparkles, Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceIcon } from "@/components/ui/service-icon";
import { ProjectCard } from "@/components/site/project-card";
import { PostCard } from "@/components/site/post-card";
import { FaqList } from "@/components/ui/faq-list";
import { generalFaq, plans, processSteps, services, stats, whatsappLink } from "@/lib/site";
import type { Post, Project } from "@/lib/types";

export function StatsStrip() {
  return (
    <section className="border-b border-ink-200 bg-white" aria-label="Cifras clave">
      <dl className="container-x grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <dd className="font-display text-3xl font-extrabold text-ink-900">{s.value}</dd>
            <dt className="mt-1 text-sm text-ink-500">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ServicesGrid() {
  return (
    <section className="container-x mt-24" aria-labelledby="servicios-titulo">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Servicios" title="Todo lo que tu negocio necesita para vender en internet" text="Desde una landing page hasta una tienda online. Cada proyecto se entrega con optimización SEO, GEO e IAO incluida, no como extra." />
        <Link href="/servicios" className="btn-secondary self-start lg:self-auto">
          Ver todos los servicios <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link key={s.slug} href={`/servicios/${s.slug}`} className="card group flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-600 to-cyan-500 text-white">
              <ServiceIcon icon={s.icon} />
            </span>
            <h3 className="font-display mt-5 text-xl font-bold text-ink-900">{s.name}</h3>
            <p className="mt-2 flex-1 text-[15px] leading-7 text-ink-600">{s.short}</p>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink-900">Desde ${s.priceFrom}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-electric-700 group-hover:underline">Ver detalles <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function OptimizationExplainer() {
  const pillars = [
    {
      icon: Globe2,
      name: "SEO",
      full: "Search Engine Optimization",
      text: "Aparecer en los primeros resultados de Google cuando alguien busca lo que vendes. Velocidad, estructura, palabras clave, datos estructurados y SEO local con Google Maps.",
    },
    {
      icon: Bot,
      name: "GEO",
      full: "Generative Engine Optimization",
      text: "Que ChatGPT, Gemini, Claude y Perplexity citen tu página en sus respuestas. Contenido claro en formato pregunta-respuesta, datos verificables y archivo llms.txt.",
    },
    {
      icon: Sparkles,
      name: "IAO",
      full: "Optimización para inteligencia artificial",
      text: "Preparar toda tu presencia digital para que la IA la entienda: schema.org completo, permisos a rastreadores de IA, fichas de negocio consistentes y contenido estructurado.",
    },
  ];
  return (
    <section className="relative mt-24 overflow-hidden bg-ink-950 py-24 text-white" aria-labelledby="optimizacion-titulo">
      <div className="bg-glow absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="container-x relative">
        <SectionHeading dark eyebrow="SEO + GEO + IAO" title="Una página web hoy tiene que convencer a dos lectores: a las personas y a la inteligencia artificial" text="Cada vez más clientes preguntan a un asistente de IA antes de buscar en Google. Construimos tu sitio para ganar en ambos canales a la vez." />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.name} className="card-dark p-7">
              <p.icon className="h-8 w-8 text-cyan-300" aria-hidden="true" />
              <h3 className="font-display mt-5 text-2xl font-extrabold">
                {p.name} <span className="block text-sm font-medium text-ink-400">{p.full}</span>
              </h3>
              <p className="mt-4 leading-7 text-ink-300">{p.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="card-dark p-7">
            <h3 className="font-display text-xl font-bold">Qué incluye cada sitio que entregamos</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Renderizado en servidor: el contenido llega listo a Google y a la IA",
                "Datos estructurados schema.org: Organization, Service, FAQ, Article",
                "Archivos llms.txt y llms-full.txt para modelos de IA",
                "robots.txt abierto a GPTBot, ClaudeBot, PerplexityBot y Google-Extended",
                "Sitemap y feed RSS automáticos",
                "Imágenes optimizadas y Core Web Vitals en verde",
                "Textos con respuestas directas y preguntas frecuentes",
                "Auditoría con puntuación 0-100 antes de publicar",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-sm leading-6 text-ink-200">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-lime-400" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-dark flex flex-col justify-between p-7">
            <div>
              <Gauge className="h-8 w-8 text-lime-400" aria-hidden="true" />
              <h3 className="font-display mt-5 text-xl font-bold">Medimos, no prometemos</h3>
              <p className="mt-3 leading-7 text-ink-300">
                Nuestra herramienta de auditoría revisa 35 puntos de SEO, GEO y rendimiento y los resume en una puntuación. La aplicamos a cada sitio que publicamos y la mostramos en el portafolio.
              </p>
            </div>
            <Link href="/portafolio" className="btn-ghost-light mt-6 self-start">
              Ver puntuaciones reales <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PortfolioPreview({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section className="container-x mt-24" aria-labelledby="portafolio-titulo">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Portafolio" title="Sitios que hemos creado, con su puntuación de optimización" text="Cada proyecto se audita con nuestra herramienta: SEO, GEO/IAO y velocidad en una escala de 0 a 100." />
        <Link href="/portafolio" className="btn-secondary self-start lg:self-auto">
          Ver todo el portafolio <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 3).map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="container-x mt-24" aria-labelledby="proceso-titulo">
      <SectionHeading eyebrow="Cómo trabajamos" title="De la idea a una web publicada en 4 pasos" text="Sin reuniones eternas ni tecnicismos. Tú nos cuentas tu negocio; nosotros nos encargamos del resto y te mantenemos al tanto por WhatsApp." align="center" />
      <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((s, i) => (
          <li key={s.title} className="card relative p-6">
            <span className="font-display text-5xl font-extrabold text-gradient">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display mt-3 text-lg font-bold text-ink-900">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-7 text-ink-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="container-x mt-24" aria-labelledby="planes-titulo" id="planes">
      <SectionHeading eyebrow="Planes y precios" title="Precios claros, sin sorpresas" text="Pago único. Hosting del primer año, certificado SSL y optimización SEO/GEO/IAO incluidos en todos los planes. Aceptamos bolívares, dólares y USDT." align="center" />
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <article key={p.id} className={`relative flex flex-col rounded-3xl p-8 ${p.highlight ? "bg-ink-950 text-white shadow-[var(--shadow-glow)]" : "card"}`}>
            {p.highlight && <span className="absolute -top-3 left-8 rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-ink-950">Más elegido</span>}
            <h3 className="font-display text-2xl font-extrabold">{p.name}</h3>
            <p className={`mt-1 text-sm ${p.highlight ? "text-ink-300" : "text-ink-500"}`}>{p.audience}</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-5xl font-extrabold">${p.price}</span>
              <span className={`text-sm ${p.highlight ? "text-ink-300" : "text-ink-500"}`}>USD · {p.period}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-[15px]">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className={`mt-1 h-4 w-4 shrink-0 ${p.highlight ? "text-lime-400" : "text-electric-600"}`} aria-hidden="true" />
                  <span className={p.highlight ? "text-ink-100" : "text-ink-700"}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href={`/contacto?plan=${p.id}`} className={`${p.highlight ? "btn-primary" : "btn-secondary"} mt-8 w-full`}>
              {p.cta}
            </Link>
          </article>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-ink-500">
        ¿Necesitas algo distinto? <a href={whatsappLink("Hola, quiero cotizar un proyecto web a medida.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-electric-700 hover:underline">Escríbenos por WhatsApp</a> y armamos una propuesta a tu medida.
      </p>
    </section>
  );
}

export function BlogPreview({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section className="container-x mt-24" aria-labelledby="blog-titulo">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Blog" title="Aprende a conseguir clientes con tu página web" text="Guías prácticas sobre diseño web, SEO, GEO e inteligencia artificial, explicadas para dueños de negocio." />
        <Link href="/blog" className="btn-secondary self-start lg:self-auto">
          Ver todos los artículos <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="container-x mt-24" aria-labelledby="faq-titulo">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading eyebrow="Preguntas frecuentes" title="Lo que todos preguntan antes de empezar" text="Si tu duda no está aquí, escríbenos por WhatsApp y te respondemos en minutos en horario laboral." />
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 text-sm text-ink-600">
            <ShieldCheck className="h-6 w-6 shrink-0 text-electric-600" aria-hidden="true" />
            El dominio y la página quedan a tu nombre. Siempre.
          </div>
        </div>
        <FaqList items={generalFaq} />
      </div>
    </section>
  );
}
