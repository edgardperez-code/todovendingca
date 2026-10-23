import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { BlogPreview, FaqSection, OptimizationExplainer, PortfolioPreview, PricingSection, ProcessSection, ServicesGrid, StatsStrip } from "@/components/site/home-sections";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/json-ld";
import { getRepo } from "@/lib/db/repo";
import { buildMetadata, faqJsonLd, howToJsonLd } from "@/lib/seo";
import { generalFaq, processSteps, site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  ...buildMetadata({
    title: `Diseño de páginas web con SEO, GEO e IA | ${site.name}`,
    description:
      "Agencia de diseño web en Venezuela. Páginas web, landing pages y tiendas online optimizadas para Google (SEO) y para ChatGPT, Gemini y Perplexity (GEO e IAO).",
    path: "/",
    image: "/opengraph-image",
  }),
  title: { absolute: `Diseño de páginas web con SEO, GEO e IA | ${site.name}` },
};

export default async function HomePage() {
  const repo = getRepo();
  const [projects, posts] = await Promise.all([
    repo.listProjects({ status: "published", featured: true, limit: 3 }),
    repo.listPosts({ status: "published", limit: 3 }),
  ]);
  const showcase = projects.find((p) => p.audit && !p.audit.error && p.auditScore != null) ?? null;

  return (
    <>
      <JsonLd data={[faqJsonLd(generalFaq), howToJsonLd(processSteps)]} />
      <Hero showcase={showcase} />
      <StatsStrip />
      <ServicesGrid />
      <OptimizationExplainer />
      <PortfolioPreview projects={projects} />
      <ProcessSection />
      <PricingSection />
      <BlogPreview posts={posts} />
      <FaqSection />
      <CtaBand />
    </>
  );
}
