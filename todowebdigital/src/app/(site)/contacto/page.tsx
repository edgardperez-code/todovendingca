import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContactForm } from "@/components/site/contact-form";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ORG_ID } from "@/lib/seo";
import { services, site, SITE_URL, whatsappLink } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contacto: cotiza tu página web",
  description: `Pide una cotización o una auditoría gratis de tu sitio. WhatsApp ${site.phoneDisplay}, correo ${site.email}. Respondemos en menos de 24 horas hábiles.`,
  path: "/contacto",
});

type Props = { searchParams: Promise<{ servicio?: string; plan?: string }> };

export default async function ContactoPage({ searchParams }: Props) {
  const sp = await searchParams;
  const preselected = services.find((s) => s.slug === sp.servicio)?.name ?? (sp.plan ? `Plan ${sp.plan.charAt(0).toUpperCase()}${sp.plan.slice(1)}` : "");
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", "@id": `${SITE_URL}/contacto#contact`, url: `${SITE_URL}/contacto`, name: "Contacto TodoWeb Digital", mainEntity: { "@id": ORG_ID } }} />
      <section className="container-x pt-10">
        <Breadcrumbs items={[{ name: "Contacto", path: "/contacto" }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">Contacto</span>
            <h1 className="font-display mt-4 text-4xl font-extrabold leading-[1.1] text-ink-900 sm:text-5xl">Cuéntanos tu proyecto</h1>
            <p className="mt-5 text-lg leading-8 text-ink-600">Respondemos en menos de 24 horas hábiles con una propuesta clara: alcance, precio y fecha de entrega. Si ya tienes página, te enviamos su auditoría SEO/GEO gratis.</p>
            <ul className="mt-8 space-y-4 text-[15px]">
              <li className="flex gap-3"><MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" aria-hidden="true" /><div><p className="font-semibold text-ink-900">WhatsApp</p><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-electric-700 hover:underline">{site.phoneDisplay}</a><p className="text-sm text-ink-500">La vía más rápida en horario laboral.</p></div></li>
              <li className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" aria-hidden="true" /><div><p className="font-semibold text-ink-900">Teléfono</p><a href={`tel:${site.phone}`} className="text-electric-700 hover:underline">{site.phoneDisplay}</a></div></li>
              <li className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" aria-hidden="true" /><div><p className="font-semibold text-ink-900">Correo</p><a href={`mailto:${site.email}`} className="break-all text-electric-700 hover:underline">{site.email}</a></div></li>
              <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" aria-hidden="true" /><div><p className="font-semibold text-ink-900">Oficina</p><p className="text-ink-600">{site.address.streetAddress}, {site.address.addressLocality}, {site.address.addressRegion}, Venezuela</p></div></li>
              <li className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" aria-hidden="true" /><div><p className="font-semibold text-ink-900">Horario</p><p className="text-ink-600">Lunes a viernes 8:00 a 17:00 · Sábados 8:00 a 12:00</p></div></li>
            </ul>
          </div>
          <div className="card p-6 sm:p-8">
            <ContactForm preselectedService={preselected} />
          </div>
        </div>
      </section>
    </>
  );
}
