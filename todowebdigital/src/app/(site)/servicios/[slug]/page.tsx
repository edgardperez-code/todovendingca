import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Package } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ServiceIcon } from "@/components/ui/service-icon";
import { FaqList } from "@/components/ui/faq-list";
import { CtaBand } from "@/components/ui/cta-band";
import { ProcessSection } from "@/components/site/home-sections";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { getService, services, whatsappLink } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return buildMetadata({
    title: `${s.name} desde $${s.priceFrom}`,
    description: s.description.slice(0, 155).replace(/\s+\S*$/, "") + ".",
    path: `/servicios/${s.slug}`,
    keywords: s.keywords,
  });
}

export default async function ServicioPage({ params }: Params) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== s.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={[serviceJsonLd(s), faqJsonLd(s.faq)]} />
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="bg-glow absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="container-x relative py-16 lg:py-20">
          <Breadcrumbs dark items={[{ name: "Servicios", path: "/servicios" }, { name: s.name, path: `/servicios/${s.slug}` }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-500 to-cyan-400 text-ink-950"><ServiceIcon icon={s.icon} className="h-7 w-7" /></span>
              <h1 className="font-display mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl">{s.headline}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-300">{s.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/contacto?servicio=${s.slug}`} className="btn-primary !px-7 !py-3.5 text-base">Cotizar este servicio <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <a href={whatsappLink(`Hola, me interesa el servicio de ${s.name}.`)} target="_blank" rel="noopener noreferrer" className="btn-ghost-light !px-7 !py-3.5 text-base">Preguntar por WhatsApp</a>
              </div>
            </div>
            <aside className="card-dark p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Inversión</p>
              <p className="mt-2 flex items-baseline gap-2"><span className="font-display text-5xl font-extrabold">${s.priceFrom}</span><span className="text-ink-300">USD · desde</span></p>
              <p className="mt-3 text-sm text-ink-300">Precio orientativo. La cotización final depende del alcance; la enviamos en menos de 24 horas.</p>
              <h2 className="mt-6 flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-lime-400" aria-hidden="true" /> Entregables</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-200">
                {s.deliverables.map((d) => <li key={d} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" aria-hidden="true" />{d}</li>)}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-x mt-20" aria-labelledby="incluye">
        <h2 id="incluye" className="font-display text-3xl font-extrabold text-ink-900">Qué incluye</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.features.map((f) => (
            <li key={f} className="card flex gap-3 p-5 text-[15px] text-ink-800"><Check className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" aria-hidden="true" />{f}</li>
          ))}
        </ul>
      </section>

      <ProcessSection />

      <section className="container-x mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="faq-servicio">
        <div>
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2 id="faq-servicio" className="font-display mt-4 text-3xl font-extrabold text-ink-900">Dudas habituales sobre {s.name.toLowerCase()}</h2>
        </div>
        <FaqList items={s.faq} />
      </section>

      <section className="container-x mt-24" aria-labelledby="otros">
        <h2 id="otros" className="font-display text-2xl font-extrabold text-ink-900">También te puede interesar</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/servicios/${o.slug}`} className="card group p-6 transition-all hover:-translate-y-1">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/10 text-electric-700"><ServiceIcon icon={o.icon} className="h-5 w-5" /></span>
              <h3 className="font-display mt-4 text-lg font-bold text-ink-900">{o.name}</h3>
              <p className="mt-1 text-sm text-ink-600">{o.short}</p>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand title={`¿Hablamos de tu proyecto de ${s.name.toLowerCase()}?`} />
    </>
  );
}
