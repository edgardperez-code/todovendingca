import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2, Sparkles, Zap } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import type { Project } from "@/lib/types";
import { hostnameOf } from "@/lib/utils";

export function Hero({ showcase }: { showcase: Project | null }) {
  const audit = showcase?.audit && !showcase.audit.error ? showcase.audit : null;
  const scores = audit ? audit.scores : { overall: 94, seo: 96, geo: 92, performance: 90 };
  const isExample = !audit;
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white" aria-labelledby="hero-titulo">
      <div className="bg-glow absolute inset-0" aria-hidden="true" />
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" aria-hidden="true" />
      <div className="container-x relative grid items-center gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div className="animate-fade-up">
          <span className="eyebrow-light">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Agencia de diseño web · Lechería, Venezuela
          </span>
          <h1 id="hero-titulo" className="font-display mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Páginas web que <span className="text-gradient">venden</span> y que la IA <span className="text-gradient">recomienda</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink-300">
            Diseñamos y desarrollamos sitios web modernos y rápidos, optimizados para <strong className="text-white">SEO</strong> (Google), <strong className="text-white">GEO</strong> (ChatGPT, Gemini, Perplexity) e <strong className="text-white">IAO</strong> (inteligencia artificial) desde el primer día. Para negocios de Venezuela y Latinoamérica que quieren más clientes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contacto" className="btn-primary !px-7 !py-3.5 text-base">
              Cotizar mi página web <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/portafolio" className="btn-ghost-light !px-7 !py-3.5 text-base">
              Ver sitios creados
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-300">
            {["Landing en 5 días", "Hosting y SSL incluidos", "Panel para editar tu web", "Auditoría SEO gratis"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-lime-400" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Mockup: ventana de navegador + panel de auditoría */}
        <div className="relative mx-auto w-full max-w-lg animate-fade-up [animation-delay:150ms]" aria-hidden="true">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-electric-500/30 via-cyan-400/20 to-lime-400/20 blur-2xl" />
          <div className="relative card-dark overflow-hidden rounded-3xl shadow-[var(--shadow-glow)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-lime-400/80" />
              <span className="ml-3 flex-1 truncate rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-ink-300">
                https://{showcase ? hostnameOf(showcase.url) : "www.tu-negocio.com"}
              </span>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <div className="h-3 w-24 rounded-full bg-cyan-400/60" />
                <div className="h-6 w-full rounded-lg bg-white/80" />
                <div className="h-6 w-4/5 rounded-lg bg-white/60" />
                <div className="h-3 w-full rounded-full bg-white/15" />
                <div className="h-3 w-5/6 rounded-full bg-white/15" />
                <div className="mt-4 flex gap-2">
                  <div className="h-9 w-28 rounded-full bg-electric-500" />
                  <div className="h-9 w-24 rounded-full border border-white/20" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-xl border border-white/10 bg-white/5" />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink-950/60 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Auditoría SEO/GEO{isExample ? " · ejemplo" : ""}</p>
                <div className="mt-2 flex justify-center"><ScoreRing score={scores.overall} size={92} dark /></div>
                <dl className="mt-3 space-y-1.5 text-left text-xs">
                  {[
                    ["SEO", scores.seo, Globe2],
                    ["GEO / IAO", scores.geo, Sparkles],
                    ["Velocidad", scores.performance, Zap],
                  ].map(([label, value, Icon]) => {
                    const I = Icon as typeof Globe2;
                    return (
                      <div key={label as string} className="flex items-center justify-between gap-3">
                        <dt className="inline-flex items-center gap-1.5 text-ink-300"><I className="h-3.5 w-3.5 text-cyan-300" /> {label as string}</dt>
                        <dd className="font-mono font-semibold text-white">{value as number}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 animate-float rounded-2xl border border-white/10 bg-ink-900/90 px-4 py-3 text-xs shadow-xl backdrop-blur sm:-left-10">
            <p className="font-semibold text-white">Legible por IA</p>
            <p className="text-ink-400">llms.txt · schema.org · robots</p>
          </div>
          <div className="absolute -right-3 -top-5 animate-float rounded-2xl border border-white/10 bg-ink-900/90 px-4 py-3 text-xs shadow-xl backdrop-blur [animation-delay:2s] sm:-right-8">
            <p className="font-semibold text-white">Carga &lt; 2 s</p>
            <p className="text-ink-400">Core Web Vitals en verde</p>
          </div>
        </div>
      </div>
    </section>
  );
}
