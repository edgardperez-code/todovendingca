// Marco común de las páginas de apoyo (ubicaciones, cómo funciona, catálogo,
// preguntas frecuentes, solicitar máquina): cabecera, portada corta con rótulo,
// título y lead, el contenido de la página y el pie.
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Ola } from "@/components/vitrina/ola";
import { Etiqueta } from "@/components/vitrina/etiqueta";
import { EstilosSubpagina } from "@/components/vitrina/subpagina";

const CSS_APOYO = `
.va-hero{padding-block:clamp(36px,6vw,80px) clamp(28px,4vw,48px)}
.va-hero .v-lead{margin-top:22px;max-width:64ch}
.va-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:clamp(14px,2vw,24px);margin:0;padding:0;list-style:none}
.va-card{height:100%;border:1px solid var(--linea);border-radius:20px;padding:24px;background:var(--papel);color:var(--tinta)}
.va-card h3{font-family:var(--font-display);font-size:1.25rem;font-weight:700;letter-spacing:-.02em;line-height:1.2;margin:10px 0 8px}
.va-card p{margin:0;color:var(--tinta2);line-height:1.55}
.va-card .v-ic{width:34px;height:34px;color:var(--naranja)}
.va-chip{display:inline-block;font:500 11.5px/1.2 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--tinta2)}
.va-lista{margin:14px 0 0;padding-left:1.2em;list-style:disc;color:var(--tinta2);line-height:1.6}
.va-lista li::marker{color:var(--naranja)}
.va-pasos{margin:0;padding:0;list-style:none;display:grid;gap:clamp(14px,2vw,20px);counter-reset:paso}
.va-paso{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:start;border:1px solid var(--linea);border-radius:20px;padding:22px 24px;background:var(--papel)}
.va-paso__n{display:grid;place-items:center;width:46px;height:46px;border-radius:12px;background:var(--tinta);color:var(--papel);font:700 18px/1 var(--font-mono)}
.va-paso h3{font-family:var(--font-display);font-size:1.3rem;font-weight:700;margin:4px 0 6px}
.va-paso p{margin:0;color:var(--tinta2);line-height:1.6}
.va-grupo+.va-grupo{margin-top:clamp(36px,5vw,64px)}
.va-faq{border-top:1.5px solid var(--tinta);margin-top:18px}
.va-faq details{border-bottom:1px solid var(--linea);padding:18px 0}
.va-faq summary{cursor:pointer;font-family:var(--font-display);font-weight:700;font-size:1.12rem;list-style:none;display:flex;justify-content:space-between;gap:16px}
.va-faq summary::-webkit-details-marker{display:none}
.va-faq summary::after{content:"+";color:var(--naranja);font:700 1.4rem/1 var(--font-mono)}
.va-faq details[open] summary::after{content:"–"}
.va-faq details p{margin:12px 0 0;color:var(--tinta2);line-height:1.65;max-width:72ch}
.va-nota{margin-top:24px;color:var(--tinta2)}
.va-nota a{color:var(--azul);text-underline-offset:3px}
`;

export function PaginaApoyo({
  etiqueta,
  titulo,
  lead,
  children,
}: {
  etiqueta: string;
  titulo: ReactNode;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background v-base">
      <EstilosSubpagina />
      <style dangerouslySetInnerHTML={{ __html: CSS_APOYO }} />
      <Header />
      <main id="contenido" className="v-bajo-cabecera">
        <section className="va-hero">
          <div className="v-cont">
            <Etiqueta>{etiqueta}</Etiqueta>
            <h1 className="v-h1 vs-h1" data-speakable>
              {titulo}
            </h1>
            <p className="v-lead speakable">{lead}</p>
          </div>
        </section>
        <Ola />
        {children}
      </main>
      <Footer />
    </div>
  );
}
