import type { Metadata } from "next";
import Link from "next/link";
import { Rss } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { PostCard } from "@/components/site/post-card";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/json-ld";
import { getRepo } from "@/lib/db/repo";
import { blogListJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Blog de diseño web, SEO, GEO e IA",
  description: "Guías prácticas para conseguir clientes con tu web: diseño, posicionamiento en Google (SEO), optimización para ChatGPT y Gemini (GEO e IAO) y marketing.",
  path: "/blog",
});

const PAGE_SIZE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ pagina?: string; categoria?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.pagina) || 1);
  const categoria = sp.categoria?.trim() || undefined;
  const repo = getRepo();
  const [posts, total, all] = await Promise.all([
    repo.listPosts({ status: "published", limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, category: categoria }),
    repo.countPosts({ status: "published", category: categoria }),
    repo.listPosts({ status: "published" }),
  ]);
  const categories = [...new Set(all.map((p) => p.category))].sort();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [first, ...rest] = posts;

  return (
    <>
      <JsonLd data={blogListJsonLd(all.slice(0, 20))} />
      <section className="container-x pt-10">
        <Breadcrumbs items={[{ name: "Blog", path: "/blog" }]} />
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading as="h1" eyebrow="Blog" title="Aprende a conseguir clientes con tu página web" text="Explicamos diseño web, SEO, GEO e inteligencia artificial sin tecnicismos, con ejemplos aplicables a negocios de Venezuela y Latinoamérica." />
          <a href="/feed.xml" className="btn-secondary self-start lg:self-auto"><Rss className="h-4 w-4" aria-hidden="true" /> Suscribirse (RSS)</a>
        </div>
        {categories.length > 1 && (
          <nav aria-label="Categorías" className="mt-8 flex flex-wrap gap-2">
            <Link href="/blog" className={`rounded-full px-4 py-2 text-sm font-medium ${!categoria ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"}`}>Todos</Link>
            {categories.map((c) => (
              <Link key={c} href={`/blog?categoria=${encodeURIComponent(c)}`} className={`rounded-full px-4 py-2 text-sm font-medium ${categoria?.toLowerCase() === c.toLowerCase() ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"}`}>{c}</Link>
            ))}
          </nav>
        )}
      </section>
      <section className="container-x mt-12" aria-label="Artículos">
        {posts.length === 0 ? (
          <p className="card p-10 text-center text-ink-600">Todavía no hay artículos publicados{categoria ? ` en "${categoria}"` : ""}. Vuelve pronto.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {page === 1 && !categoria && first ? <PostCard post={first} featured /> : first && <PostCard post={first} />}
            {rest.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={`/blog?pagina=${n}${categoria ? `&categoria=${encodeURIComponent(categoria)}` : ""}`} aria-current={n === page ? "page" : undefined} className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${n === page ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"}`}>{n}</Link>
            ))}
          </nav>
        )}
      </section>
      <CtaBand title="¿Quieres aplicar esto en tu negocio?" text="Te hacemos una auditoría gratis de tu web actual y te decimos qué cambiar primero." />
    </>
  );
}
