import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function CtaBand({ title = "¿Listo para una web que trabaje por ti?", text = "Te hacemos un diagnóstico gratis de tu presencia digital y te decimos exactamente qué necesitas, sin compromiso.", primary = { label: "Cotizar mi página web", href: "/contacto" } }: { title?: string; text?: string; primary?: { label: string; href: string } }) {
  return (
    <section className="container-x mt-24" aria-labelledby="cta-titulo">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-14 text-center text-white sm:px-12 lg:px-20">
        <div className="bg-glow absolute inset-0 opacity-90" aria-hidden="true" />
        <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" aria-hidden="true" />
        <div className="relative">
          <h2 id="cta-titulo" className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-300">{text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={primary.href} className="btn-primary !px-7 !py-3.5 text-base">
              {primary.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp !px-7 !py-3.5 text-base">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
