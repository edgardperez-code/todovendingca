import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CtaBand } from "@/components/ui/cta-band";
import { PricingSection } from "@/components/site/home-sections";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";
import { services } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Servicios de diseño web, SEO, GEO e IAO",
  description:
    "Diseño de páginas web, landing pages, tiendas online, SEO, optimización para IA (GEO/IAO) y mantenimiento web desde $49. Agencia en Lechería, Venezuela.",
  path: "/servicios",
  keywords: ["servicios diseño web", "agencia web Venezuela", "SEO", "GEO", "IAO", "landing page", "tienda online", "mantenimiento web"],
});

export default function ServiciosPage() {
  return (
    <>
      <JsonLd data={services.map(serviceJsonLd)} />
      <section className="container-x pt-10">
        <Breadcrumbs items={[{ name: "Servicios", path: "/servicios" }]} />
        <SectionHeading as="h1" className="mt-6" eyebrow="Servicios" title="Servicios de diseño web y optimización para Google y para la IA" text="Un solo equipo para diseñar, publicar, posicionar y mantener tu presencia digital. Todos los servicios incluyen SEO, GEO e IAO: no vendemos la optimización por separado porque una web sin ella no sirve para captar clientes." />
      </section>
      <section className="container-x mt-14 space-y-6" aria-label="Lista de servicios">
        {services.map((s, i) => (
          <article key={s.slug} className={`card grid gap-8 p-7 lg:grid-cols-[1.1fr_0.9fr] lg:p-10 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-600 to-cyan-500 text-white"><ServiceIcon icon={s.icon} /></span>
              <h2 className="font-display mt-5 text-2xl font-extrabold text-ink-900 sm:text-3xl">{s.headline}</h2>
              <p className="mt-4 leading-7 text-ink-600">{s.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href={`/servicios/${s.slug}`} className="btn-primary">Ver servicio <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <span className="text-sm text-ink-500">Desde <strong className="text-ink-900">${s.priceFrom} USD</strong></span>
              </div>
            </div>
            <ul className="grid gap-3 self-center rounded-2xl bg-ink-50 p-6 sm:grid-cols-2 lg:grid-cols-1">
              {s.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-[15px] text-ink-700"><Check className="mt-1 h-4 w-4 shrink-0 text-electric-600" aria-hidden="true" />{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <PricingSection />
      <CtaBand />
    </>
  );
}
