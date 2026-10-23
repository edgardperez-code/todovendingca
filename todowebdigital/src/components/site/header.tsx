"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/servicios", label: "Servicios" },
  { href: "/portafolio", label: "Portafolio" },
  { href: "/blog", label: "Blog" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={cn("sticky top-0 z-50 transition-all", scrolled ? "border-b border-ink-200/70 bg-white/85 backdrop-blur-md" : "bg-transparent")}>
      <div className="container-x flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", active ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100 hover:text-ink-900")}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2.5">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
          </a>
          <Link href="/contacto" className="btn-primary !py-2.5">
            Cotizar mi web
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 lg:hidden"
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div id="menu-movil" className="border-t border-ink-200 bg-white lg:hidden">
          <nav aria-label="Principal móvil" className="container-x flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-4 py-3 text-base font-medium text-ink-800 hover:bg-ink-50">
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 px-2">
              <Link href="/contacto" className="btn-primary w-full">Cotizar mi web</Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Escribir por WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
