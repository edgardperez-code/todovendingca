import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, FolderKanban, Inbox, Sparkles, XCircle } from "lucide-react";
import { getRepo } from "@/lib/db/repo";
import { aiConfigured, CLAUDE_MODEL } from "@/lib/ai";
import { formatDate } from "@/lib/utils";

export default async function PanelHome() {
  const repo = getRepo();
  const [stats, leads, posts] = await Promise.all([repo.stats(), repo.listLeads(5), repo.listPosts({ limit: 5 })]);
  const checks = [
    { ok: repo.kind === "postgres", label: "Base de datos Postgres", detail: repo.kind === "postgres" ? "Conectada" : "Usando archivo JSON temporal" },
    { ok: aiConfigured(), label: "Generación con IA (Claude)", detail: aiConfigured() ? `Modelo ${CLAUDE_MODEL}` : "Falta ANTHROPIC_API_KEY" },
    { ok: Boolean(process.env.RESEND_API_KEY), label: "Avisos por correo (Resend)", detail: process.env.RESEND_API_KEY ? "Configurado" : "Opcional: falta RESEND_API_KEY" },
    { ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL), label: "URL pública", detail: process.env.NEXT_PUBLIC_SITE_URL || "Usando valor por defecto" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink-900">Hola 👋</h1>
        <p className="mt-1 text-ink-600">Desde aquí publicas artículos con IA, gestionas el portafolio y revisas los contactos que llegan por la web.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Artículos publicados", value: `${stats.publishedPosts} / ${stats.posts}`, href: "/admin/articulos", icon: FileText },
          { label: "Proyectos en portafolio", value: stats.projects, href: "/admin/proyectos", icon: FolderKanban },
          { label: "Contactos recibidos", value: stats.leads, href: "/admin/leads", icon: Inbox },
        ].map((c) => (
          <Link key={c.label} href={c.href} className="card group flex items-center justify-between p-5 transition-all hover:-translate-y-0.5">
            <div>
              <p className="text-sm text-ink-500">{c.label}</p>
              <p className="font-display mt-1 text-3xl font-extrabold text-ink-900">{c.value}</p>
            </div>
            <c.icon className="h-8 w-8 text-electric-500" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <section className="rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow-light"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Blog con IA</p>
            <h2 className="font-display mt-3 text-2xl font-extrabold">Escribe un artículo nuevo con un solo prompt</h2>
            <p className="mt-1 text-sm text-ink-300">Describe el tema; Claude redacta el artículo completo con título SEO, resumen, palabras clave y preguntas frecuentes. Tú lo revisas y publicas.</p>
          </div>
          <Link href="/admin/articulos/nuevo" className="btn-primary shrink-0">Nuevo artículo <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold text-ink-900">Últimos contactos</h2><Link href="/admin/leads" className="text-sm font-semibold text-electric-700">Ver todos</Link></div>
          {leads.length === 0 ? <p className="mt-4 text-sm text-ink-500">Aún no hay contactos.</p> : (
            <ul className="mt-4 divide-y divide-ink-100">
              {leads.map((l) => (
                <li key={l.id} className="py-3 text-sm">
                  <p className="font-medium text-ink-900">{l.name} <span className="text-ink-400">· {l.service || "sin servicio"}</span></p>
                  <p className="line-clamp-1 text-ink-600">{l.message}</p>
                  <p className="text-xs text-ink-400">{formatDate(l.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold text-ink-900">Últimos artículos</h2><Link href="/admin/articulos" className="text-sm font-semibold text-electric-700">Ver todos</Link></div>
          {posts.length === 0 ? <p className="mt-4 text-sm text-ink-500">Aún no hay artículos.</p> : (
            <ul className="mt-4 divide-y divide-ink-100">
              {posts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/admin/articulos/${p.id}`} className="line-clamp-1 font-medium text-ink-900 hover:text-electric-700">{p.title}</Link>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-600"}`}>{p.status === "published" ? "Publicado" : "Borrador"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink-900">Estado de la configuración</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-3 rounded-xl bg-ink-50 p-3 text-sm">
              {c.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" aria-hidden="true" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />}
              <div><p className="font-medium text-ink-900">{c.label}</p><p className="text-ink-500">{c.detail}</p></div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
