import { brandOgImage } from "@/lib/og";
import { getRepo } from "@/lib/db/repo";

export const runtime = "nodejs";
export const alt = "Artículo del blog de TodoWeb Digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getRepo().getPostBySlug(slug);
  return brandOgImage({
    eyebrow: post ? `Blog · ${post.category}` : "Blog",
    title: post?.title ?? "Blog de TodoWeb Digital",
    subtitle: post?.excerpt,
    badge: post ? `${post.readingMinutes} min` : undefined,
  });
}
