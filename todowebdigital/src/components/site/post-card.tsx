import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDate, isoDate } from "@/lib/utils";

const palettes = [
  "from-electric-600 via-cyan-500 to-lime-400",
  "from-ink-800 via-electric-700 to-cyan-500",
  "from-cyan-500 via-electric-500 to-ink-800",
  "from-lime-400 via-cyan-400 to-electric-600",
];

export function PostCover({ post, className = "" }: { post: Post; className?: string }) {
  const palette = palettes[post.title.length % palettes.length];
  if (post.coverImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={post.coverImage} alt="" className={`h-full w-full object-cover ${className}`} loading="lazy" decoding="async" />
    );
  }
  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${palette} ${className}`} aria-hidden="true">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute bottom-4 left-4 rounded-full bg-ink-950/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{post.category}</div>
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`card group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-glow)] ${featured ? "lg:col-span-2 lg:flex-row" : ""}`}>
      <Link href={`/blog/${post.slug}`} className={`block overflow-hidden ${featured ? "aspect-[16/10] lg:aspect-auto lg:w-1/2" : "aspect-[16/9]"}`} tabIndex={-1} aria-hidden="true">
        <PostCover post={post} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs font-medium text-ink-500">
          <span className="rounded-full bg-electric-500/10 px-2.5 py-1 text-electric-700">{post.category}</span>
          <time dateTime={isoDate(post.publishedAt ?? post.createdAt)}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.readingMinutes} min</span>
        </div>
        <h3 className={`font-display mt-3 font-bold text-ink-900 ${featured ? "text-2xl lg:text-3xl" : "text-xl"}`}>
          <Link href={`/blog/${post.slug}`} className="hover:text-electric-700">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-7 text-ink-600">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-electric-700">
          Leer artículo <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
