import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Code2, HeartHandshake, MapPin, Rocket, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ORG_ID } from "@/lib/seo";
import { site, SITE_URL } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Sobre nosotros: diseño web en Lechería",
  description:
    "TodoWeb Digital (antes digital.todovendingca.com) es la unidad de diseño web de Todo Vending, C.A., en Lechería, Venezuela. Webs rápidas y optimizadas para Google y la IA.",
  path: "/nosotros",
});

const values = [
  { icon: ShieldCheck, title: "Transparencia", text: "Precios publicados, plazos por escrito y una auditoría con puntuación que puedes verificar tú mismo." },
  { icon: Rocket, title: "Velocidad", text: "Entregamos rápido porque trabajamos con una base técnica propia ya probada, no empezamos de cero cada vez." },
  { icon: Code2, title: "Tecnología actual", text: "Renderizado en servidor, datos estructurados, llms.txt y Core Web Vitals en verde. Lo que recomiendan Google y los proveedores de IA, aplicado." },
  { icon: HeartHandshake, title: "Acompañamiento", text: "Hablamos tu idioma, no el de los programadores. Te explicamos qué hacemos y por qué, y seguimos contigo después del lanzamiento." },
];

export default function NosotrosPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${SITE_URL}/nosotros#about`,
          url: `${SITE_URL}/nosotros`,
          name: "Sobre TodoWeb Digital",
          mainEntity: { "@id": ORG_ID },
        }}
      />
      <section className="container-x pt-10">
        <Breadcrumbs items={[{ name: "Nosotros", path: "/nosotros" }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <SectionHeading as="h1" eyebrow="Nosotros" title="Hacemos páginas web porque primero las necesitamos para nuestro propio negocio" text="TodoWeb Digital nació dentro de Todo Vending, C.A., una empresa de máquinas expendedoras de Lechería, Anzoátegui. Cuando construimos nuestro sitio y el de nuestra marca de café, descubrimos que una web bien hecha, rápida y preparada para Google y para la inteligencia artificial traía clientes todos los días. Hoy hacemos lo mismo para otros negocios." />
          <aside className="card p-7">
            <h2 className="font-display text-lg font-bold text-ink-900">Datos verificables</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-ink-500">Marca</dt><dd className="font-medium text-ink-900">{site.name}</dd></div>
              <div><dt className="text-ink-500">Razón social</dt><dd className="font-medium text-ink-900">{site.legalName}</dd></div>
              <div><dt className="text-ink-500">Antes conocida como</dt><dd className="font-medium text-ink-900">digital.todovendingca.com</dd></div>
              <div><dt className="text-ink-500">Sede</dt><dd className="flex items-start gap-1.5 font-medium text-ink-900"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" aria-hidden="true" />{site.address.streetAddress}, {site.address.addressLocality}, {site.address.addressRegion}, Venezuela</dd></div>
              <div><dt className="text-ink-500">Cobertura</dt><dd className="font-medium text-ink-900">Toda Venezuela y Latinoamérica, en remoto</dd></div>
              <div><dt className="text-ink-500">Contacto</dt><dd className="font-medium text-ink-900">{site.phoneDisplay} · {site.email}</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="container-x mt-20" aria-labelledby="historia">
        <h2 id="historia" className="font-display text-3xl font-extrabold text-ink-900">Nuestra historia en tres pasos</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { year: "2024", title: "Un problema propio", text: "Todo Vending necesitaba una página que explicara el servicio de máquinas expendedoras y recibiera solicitudes de empresas. La construimos nosotros mismos con foco en velocidad y posicionamiento local." },
            { year: "2025", title: "Digital.TodoVendingca.com", text: "Las páginas de la empresa y de la marca Café Oriente empezaron a atraer consultas de otros negocios que querían algo igual. Nació la unidad digital bajo el subdominio digital.todovendingca.com." },
            { year: "2026", title: "TodoWeb Digital", text: "Relanzamos con nombre y dominio propios, www.todowebdigital.com, y con una especialidad clara: páginas web optimizadas para Google y para los asistentes de inteligencia artificial (SEO, GEO e IAO)." },
          ].map((s) => (
            <li key={s.year} className="card p-6">
              <span className="font-display text-4xl font-extrabold text-gradient">{s.year}</span>
              <h3 className="font-display mt-3 text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-ink-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x mt-20" aria-labelledby="valores">
        <h2 id="valores" className="font-display text-3xl font-extrabold text-ink-900">Cómo trabajamos</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {values.map((v) => (
            <article key={v.title} className="card flex gap-4 p-6">
              <v.icon className="h-7 w-7 shrink-0 text-electric-600" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">{v.title}</h3>
                <p className="mt-1 text-[15px] leading-7 text-ink-600">{v.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-x mt-20 rounded-3xl bg-ink-950 p-8 text-white lg:p-12" aria-labelledby="tecnologia">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <span className="eyebrow-light"><Award className="h-3.5 w-3.5" aria-hidden="true" /> Nuestra base técnica</span>
            <h2 id="tecnologia" className="font-display mt-4 text-3xl font-extrabold">Con qué construimos</h2>
            <p className="mt-4 leading-7 text-ink-300">Usamos tecnología moderna y de código abierto, la misma que emplean las grandes plataformas, para que tu sitio sea rápido, seguro y fácil de mantener. Y lo más importante: te entregamos el código y los accesos. La web es tuya.</p>
            <Link href="/portafolio" className="btn-ghost-light mt-6">Ver nuestros proyectos <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {["React y Next.js con renderizado en servidor", "Postgres para blogs, catálogos y formularios", "Datos estructurados schema.org", "llms.txt y permisos para rastreadores de IA", "Imágenes optimizadas (AVIF/WebP)", "Hosting con certificado SSL y copias de seguridad", "Google Search Console y Business Profile", "Medición de contactos (WhatsApp, formularios, anuncios)"].map((t) => (
              <li key={t} className="card-dark px-4 py-3 text-sm text-ink-200">{t}</li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand title="Conversemos sobre tu negocio" text="Cuéntanos qué vendes y a quién. Te decimos, sin costo, qué tipo de web te conviene y cuánto cuesta." />
    </>
  );
}
