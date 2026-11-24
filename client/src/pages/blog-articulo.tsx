import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EstilosSubpagina } from "@/components/vitrina/subpagina";
import { SubpageFAQ } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { EstilosBlog, fechaLarga } from "@/components/blog-estilos";
import { EnlaceInterno } from "@/lib/navegacion";
import { useSEO } from "@/lib/seo";
import { useDatosIniciales } from "@/lib/datos-iniciales";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { conAnclas, indiceDeTitulos, markdownAHtml, type ArticuloPublico } from "@shared/blog";
import NotFound from "@/pages/not-found";

class NoEncontrado extends Error {}

async function cargarArticulo(slug: string): Promise<ArticuloPublico | null> {
  const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("No se pudo cargar el artículo");
  const cuerpo = (await res.json()) as { articulo?: ArticuloPublico };
  if (!cuerpo.articulo) throw new NoEncontrado();
  return cuerpo.articulo;
}

function urlAbsoluta(ruta: string | null): string | undefined {
  if (!ruta) return undefined;
  return ruta.startsWith("/") ? `${SITE_URL}${ruta}` : ruta;
}

export default function BlogArticulo({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const iniciales = useDatosIniciales();
  const precargado = iniciales?.articulo?.slug === slug ? iniciales.articulo.datos : undefined;
  // Lo precargado por el servidor manda (y no pasa por la cache de
  // react-query: en el servidor esa cache es una sola para todas las visitas y
  // mostraria datos viejos). Solo se pide a la API al navegar desde otra pagina.
  const consulta = useQuery({
    queryKey: ["/api/blog", slug],
    queryFn: () => cargarArticulo(slug),
    enabled: precargado === undefined,
    staleTime: 60_000,
  });
  const datos = precargado !== undefined ? precargado : consulta.data;

  if (datos === null) return <NotFound />;
  if (!datos) {
    return (
      <div className="min-h-screen bg-background v-base">
        <EstilosBlog />
        <Header />
        <main id="contenido" className="v-bajo-cabecera">
          <p className="vb-cargando">{consulta.isError ? "No pudimos cargar el artículo. Recarga la página." : "Cargando artículo…"}</p>
        </main>
        <Footer />
      </div>
    );
  }
  return <Vista a={datos} />;
}

function Vista({ a }: { a: ArticuloPublico }) {
  const indice = useMemo(() => indiceDeTitulos(a.contenido), [a.contenido]);
  const html = useMemo(
    () =>
      conAnclas(markdownAHtml(a.contenido), indice)
        .replace(/<table>/g, '<div class="vb-tabla"><table>')
        .replace(/<\/table>/g, "</table></div>"),
    [a.contenido, indice],
  );
  const url = `${SITE_URL}/blog/${a.slug}`;
  const faq = a.faq.map((p) => ({ question: p.q, answer: p.a }));
  const imagen = urlAbsoluta(a.imagenPortada);

  useSEO({
    title: `${a.metaTitulo || a.titulo} | Todo Vending CA`,
    description: a.metaDescripcion || a.resumen,
    path: `/blog/${a.slug}`,
    ogImage: imagen,
    ogType: "article",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: a.titulo, path: `/blog/${a.slug}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${url}#articulo`,
        mainEntityOfPage: url,
        headline: a.titulo,
        description: a.metaDescripcion || a.resumen,
        image: imagen ?? `${SITE_URL}/og-image.jpg`,
        datePublished: a.publicadoEn,
        dateModified: a.actualizadoEn,
        inLanguage: "es-VE",
        articleSection: a.categoria,
        keywords: a.palabrasClave.join(", "),
        wordCount: a.contenido.split(/\s+/).filter(Boolean).length,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        isPartOf: { "@id": `${SITE_URL}/blog#blog` },
      },
      ...(faq.length ? [faqSchema(faq)] : []),
    ],
  });

  return (
    <div className="min-h-screen bg-background v-base">
      <EstilosSubpagina />
      <EstilosBlog />
      <Header />
      <main id="contenido" className="v-bajo-cabecera">
        <article className="vb-art" data-testid="articulo-blog">
          <div className="v-cont">
            <nav aria-label="Migas de pan">
              <ol className="vb-migas">
                <li>
                  <EnlaceInterno href="/">Inicio</EnlaceInterno>
                </li>
                <li>
                  <EnlaceInterno href="/blog">Blog</EnlaceInterno>
                </li>
                <li aria-current="page">{a.categoria}</li>
              </ol>
            </nav>
            <h1 className="v-h1 vb-art__h1" data-speakable>
              {a.titulo}
            </h1>
            {a.resumen && <p className="v-lead vb-art__lead speakable">{a.resumen}</p>}
            <p className="vb-art__meta">
              <span>Por Todo Vending CA</span>
              {a.publicadoEn && <time dateTime={a.publicadoEn}>{fechaLarga(a.publicadoEn)}</time>}
              <span>{a.minutosLectura} min de lectura</span>
            </p>
            {a.imagenPortada && (
              <img className="vb-art__img" src={a.imagenPortada} alt={a.titulo} width={1200} height={630} decoding="async" />
            )}
            <div className="vb-cuerpo">
              <div className="vb-prosa" dangerouslySetInnerHTML={{ __html: html }} />
              {indice.length > 1 && (
                <nav className="vb-indice" aria-label="En este artículo">
                  <p>En este artículo</p>
                  <ol>
                    {indice.map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`}>{t.texto}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>
            {a.etiquetas.length > 0 && (
              <ul className="vb-etiquetas" aria-label="Etiquetas">
                {a.etiquetas.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        </article>
        {faq.length > 0 && <SubpageFAQ items={faq} />}
        <SubpageCTA
          title="Lleva una máquina a tu negocio"
          text="Instalación gratuita, reposición y mantenimiento incluidos. Escríbenos y coordinamos una evaluación sin compromiso."
          ctaText="Solicitar una máquina"
        />
      </main>
      <Footer />
    </div>
  );
}
