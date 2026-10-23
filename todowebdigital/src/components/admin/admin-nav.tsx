"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, FolderKanban, Gauge, Inbox, LayoutDashboard, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/panel", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/articulos", label: "Artículos del blog", icon: FileText },
  { href: "/admin/proyectos", label: "Portafolio", icon: FolderKanban },
  { href: "/admin/leads", label: "Contactos", icon: Inbox },
  { href: "/admin/auditoria", label: "Auditar una web", icon: Gauge },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }
  return (
    <nav aria-label="Panel" className="flex flex-1 flex-col gap-1 px-3 pb-4 lg:pt-2">
      <div className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href} className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium", active ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100")} aria-current={active ? "page" : undefined}>
              <it.icon className="h-4 w-4" aria-hidden="true" /> {it.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto hidden flex-col gap-1 pt-4 lg:flex">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-600 hover:bg-ink-100"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver sitio público</a>
        <button type="button" onClick={logout} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink-600 hover:bg-ink-100"><LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión</button>
      </div>
    </nav>
  );
}
