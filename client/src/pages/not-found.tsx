import { PageShell } from "@/components/layout/page-shell";
import { ROUTES } from "@shared/site";

// No llama a useSEO a propósito: el servidor devuelve 404 cuando ninguna
// página registró SEO (ver server/render.ts).
export default function NotFound() {
  const pages = ROUTES.filter((r) => !r.hidden);
  return (
    <PageShell waKey="home">
      <section className="bg-grid pt-32 pb-20 md:pt-40">
        <div className="container max-w-2xl">
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-4 text-display-lg">Esta página no existe</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Puede que el enlace esté mal escrito o que hayamos movido la página. Estas son las secciones del sitio:
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {pages.map((r) => (
              <li key={r.path}>
                <a href={r.path} className="card-soft block p-4 font-medium transition-transform hover:-translate-y-0.5">
                  {r.path === "/" ? "Inicio" : r.title.split(" | ")[0]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
