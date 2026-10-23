import { brandOgImage } from "@/lib/og";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${site.name}: páginas web optimizadas para SEO, GEO e IA`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return brandOgImage({
    eyebrow: "Agencia de diseño web · Venezuela",
    title: "Páginas web que venden y que la IA recomienda",
    subtitle: "Diseño moderno, velocidad y optimización SEO, GEO e IAO desde el primer día.",
  });
}
