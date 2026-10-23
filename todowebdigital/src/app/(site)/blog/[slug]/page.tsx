import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Markdown, extractHeadings } from "@/components/markdown";
import { PostCard, PostCover } from "@/components/site/post-card";
import { FaqList } from "@/components/ui/faq-list";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/json-ld";
import { getRepo } from "@/lib/db/repo";
import { blogPostingJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import { formatDate, isoDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getRepo().getPostBySlug(slug);
  if (!post || post.status !== "published") return { title: "Artículo no encontrado", robots: { index: false } };
  return buildMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    ...(post.coverImage ? { image: post.coverImage } : {}),
    absoluteTitle: true,
    type: "article",
    publishedTime: post.publishedAt ?? post.createdAt,
    modifiedTime: post.updatedAt,
    tags: post.tags,
    keywords: post.keywords,
  });
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const repo = getRepo();
  const post = await repo.getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();
  const related = (await repo.listPosts({ status: "published", limit: 4 })).filter((p) => p.id !== post.id).slice(0, 3);
  const headings = extractHeadings(post.content);

  return (
    <>
      <JsonLd data={[blogPostingJsonLd(post), ...(post.faq.length ? [faqJsonLd(post.faq)] : [])]} />
      <article>
        <header className="container-x pt-10">
          <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]} />
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <Link href={`/blog?categoria=${encodeURIComponent(post.category)}`} className="eyebrow">{post.category}</Link>
            <h1 className="font-display mt-5 text-3xl font-extrabold leading-[1.1] text-ink-900 sm:text-4xl lg:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg leading-8 text-ink-600">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" /><time dateTime={isoDate(post.publishedAt ?? post.createdAt)}>{formatDate(post.publishedAt ?? post.createdAt)}</time></span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{post.readingMinutes} min de lectura</span>
              <span>Por el equipo de TodoWeb Digital</span>
            </div>
          </div>
          <div className="mx-auto mt-10 aspect-[21/9] max-w-5xl overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
            <PostCover post={post} />
          </div>
        </header>

        <div className="container-x mt-12 grid gap-12 lg:grid-cols-[1fr_300px]">
          <div className="mx-auto w-full max-w-3xl lg:mx-0">
            <Markdown content={post.content} />
            {post.faq.length > 0 && (
              <section className="mt-14" aria-labelledby="faq-articulo">
                <h2 id="faq-articulo" className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">Preguntas frecuentes</h2>
                <div className="mt-6"><FaqList items={post.faq} /></div>
              </section>
            )}
            {post.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Etiquetas">
                {post.tags.map((t) => <li key={t} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">#{t}</li>)}
              </ul>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {headings.length > 2 && (
              <nav aria-label="Contenido del artículo" className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">En este artículo</p>
                <ol className="mt-3 space-y-2 text-sm">
                  {headings.map((h) => (
                    <li key={h.id}><a href={`#${h.id}`} className="text-ink-700 hover:text-electric-700">{h.text}</a></li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="rounded-2xl bg-ink-950 p-6 text-white">
              <Sparkles className="h-6 w-6 text-lime-400" aria-hidden="true" />
              <h2 className="font-display mt-3 text-lg font-bold">¿Tu web está lista para Google y para la IA?</h2>
              <p className="mt-2 text-sm text-ink-300">Te enviamos una auditoría gratis con puntuación SEO y GEO de tu página actual.</p>
              <Link href="/contacto" className="btn-primary mt-4 w-full">Pedir auditoría gratis <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a href={whatsappLink("Hola, leí un artículo del blog y quiero una auditoría de mi web.")} target="_blank" rel="noopener noreferrer" className="btn-ghost-light mt-2 w-full">WhatsApp</a>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-x mt-24" aria-labelledby="relacionados">
          <h2 id="relacionados" className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">Sigue leyendo</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
