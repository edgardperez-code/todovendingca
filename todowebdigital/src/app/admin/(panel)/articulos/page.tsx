import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { getRepo } from "@/lib/db/repo";
import { formatDate } from "@/lib/utils";

export default async function ArticulosPage() {
  const posts = await getRepo().listPosts();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Artículos del blog</h1>
          <p className="text-sm text-ink-500">{posts.length} artículos · {posts.filter((p) => p.status === "published").length} publicados</p>
        </div>
        <Link href="/admin/articulos/nuevo" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Nuevo artículo</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr><th className="px-5 py-3">Título</th><th className="hidden px-5 py-3 md:table-cell">Categoría</th><th className="hidden px-5 py-3 md:table-cell">Fecha</th><th className="px-5 py-3">Estado</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-ink-500">Todavía no hay artículos. <Link href="/admin/articulos/nuevo" className="font-semibold text-electric-700">Crea el primero con IA</Link>.</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50/60">
                <td className="px-5 py-3">
                  <Link href={`/admin/articulos/${p.id}`} className="font-medium text-ink-900 hover:text-electric-700">{p.title}</Link>
                  <p className="font-mono text-xs text-ink-400">/blog/{p.slug} {p.generatedByAi && <span className="ml-1 inline-flex items-center gap-0.5 text-electric-600"><Sparkles className="h-3 w-3" aria-hidden="true" /> IA</span>}</p>
                </td>
                <td className="hidden px-5 py-3 text-ink-600 md:table-cell">{p.category}</td>
                <td className="hidden px-5 py-3 text-ink-600 md:table-cell">{formatDate(p.publishedAt ?? p.updatedAt)}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-600"}`}>{p.status === "published" ? "Publicado" : "Borrador"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
