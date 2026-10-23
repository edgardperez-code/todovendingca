import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { services, site, whatsappLink } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 bg-ink-950 text-ink-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric-500/60 to-transparent" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-5 max-w-sm text-sm leading-6 text-ink-400">{site.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp !px-4 !py-2 text-xs">
              WhatsApp
            </a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost-light !px-4 !py-2 text-xs" aria-label="Instagram de TodoWeb Digital">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg> Instagram
            </a>
          </div>
        </div>
        <nav aria-label="Servicios">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">Servicios</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/servicios/${s.slug}`} className="hover:text-white">{s.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Empresa">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">Empresa</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/portafolio" className="hover:text-white">Portafolio</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/nosotros" className="hover:text-white">Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
            <li><Link href="/privacidad" className="hover:text-white">Privacidad</Link></li>
            <li><Link href="/terminos" className="hover:text-white">Términos</Link></li>
            <li><a href="/llms.txt" className="hover:text-white">llms.txt</a></li>
          </ul>
        </nav>
        <address className="not-italic">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">Contacto</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" /><a href={`tel:${site.phone}`} className="hover:text-white">{site.phoneDisplay}</a></li>
            <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" /><a href={`mailto:${site.email}`} className="break-all hover:text-white">{site.email}</a></li>
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" /><span>{site.address.streetAddress}, {site.address.addressLocality}, {site.address.addressRegion}, Venezuela</span></li>
          </ul>
          <p className="mt-4 text-xs text-ink-500">Lun a Vie 8:00 a 17:00 · Sáb 8:00 a 12:00 (hora de Venezuela)</p>
        </address>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-6 text-xs text-ink-500 sm:flex-row sm:items-center">
          <p>© {year} {site.name} · {site.legalName}. Todos los derechos reservados.</p>
          <p>Antes <span className="text-ink-400">digital.todovendingca.com</span> · Ahora <Link href="/" className="text-ink-300 hover:text-white">{site.domain}</Link></p>
        </div>
      </div>
    </footer>
  );
}
