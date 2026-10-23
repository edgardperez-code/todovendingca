import { brandOgImage } from "@/lib/og";
import { getRepo } from "@/lib/db/repo";
import { hostnameOf } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "Proyecto del portafolio de TodoWeb Digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getRepo().getProjectBySlug(slug);
  return brandOgImage({
    eyebrow: p ? `Portafolio · ${hostnameOf(p.url)}` : "Portafolio",
    title: p?.name ?? "Portafolio",
    subtitle: p?.description,
    badge: p?.auditScore != null ? `SEO ${p.auditScore}/100` : undefined,
  });
}
