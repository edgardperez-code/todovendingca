import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Ola } from "@/components/vitrina/ola";
import { Etiqueta } from "@/components/vitrina/etiqueta";
import { EstilosSubpagina } from "@/components/vitrina/subpagina";
import { SubpageCTA } from "@/components/subpage-cta";
import { EstilosBlog, fechaLarga } from "@/components/blog-estilos";
import { EnlaceInterno } from "@/lib/navegacion";
import { useSEO } from "@/lib/seo";
import { useDatosIniciales } from "@/lib/datos-iniciales";
import { SITE_URL, organizationSchema, breadcrumbSchema } from "@/lib/schema";
import type { ArticuloResumen } from "@shared/blog";

async function cargarLista(): Promise<ArticuloResumen[]> {
  const res = await fetch("/api/blog", { credentials: "include" });
  if (!res.ok) throw new Error("No se pudo cargar el blog");
  const cuerpo = (await res.json()) as { articulos?: ArticuloResumen[] };
  return cuerpo.articulos ?? [];
}

export function TarjetaArticulo({ a }: { a: ArticuloResumen }) {
  return (
    <EnlaceInterno className="vb-card" href={`/blog/${a.slug}`} data-testid={`card-articulo-${a.slug}`}>
      {a.imagenPortada ? (
        <img className="vb-card__img" src={a.imagenPortada} alt="" loading="lazy" decoding="async" width={1200} height={630} />
      ) : (
        <div className="vb-card__ph" aria-hidden="true">
          {a.categoria}
        </div>
      )}
      <div className="vb-card__c">
        <span className="vb-cat">{a.categoria}</span>
        <h2>{a.titulo}</h2>
        <p>{a.resumen}</p>
        <span className="vb-meta">
          {fechaLarga(a.publicadoEn)} · {a.minutosLectura} min de lectura
        </span>
      </div>
    </EnlaceInterno>
  );
}

export default function Blog() {
  const iniciales = useDatosIniciales();
  // Igual que en blog-articulo: lo precargado por el servidor manda (la cache de
  // react-query en el servidor es compartida entre visitas).
  const precargada = iniciales?.lista;
  const consulta = useQuery({
    queryKey: ["/api/blog"],
    queryFn: cargarLista,
    enabled: precargada === undefined,
    staleTime: 60_000,
  });
  const articulos = precargada ?? consulta.data ?? [];
  const cargando = precargada === undefined && consulta.isPending;
  const [categoria, setCategoria] = useState<string | null>(null);
  const categorias = useMemo(() => Array.from(new Set(articulos.map((a) => a.categoria))), [articulos]);
  const visibles = categoria ? articulos.filter((a) => a.categoria === categoria) : articulos;

  useSEO({
    title: "Blog de Máquinas Expendedoras y Vending en Lechería | Todo Vending CA",
    description:
      "Guías prácticas sobre máquinas expendedoras, café en grano y vending para empresas, clínicas, colegios y gimnasios en Lechería, Anzoátegui, escritas por Todo Vending CA.",
    path: "/blog",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Blog", path: "/blog" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${SITE_URL}/blog#blog`,
        name: "Blog de Todo Vending CA",
        url: `${SITE_URL}/blog`,
        inLanguage: "es-VE",
        publisher: { "@id": `${SITE_URL}/#organization` },
        blogPost: articulos.slice(0, 20).map((a) => ({
          "@type": "BlogPosting",
          headline: a.titulo,
          url: `${SITE_URL}/blog/${a.slug}`,
          datePublished: a.publicadoEn,
        })),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background v-base">
      <EstilosSubpagina />
      <EstilosBlog />
      <Header />
      <main id="contenido" className="v-bajo-cabecera">
        <section className="vb-hero">
          <div className="v-cont">
            <Etiqueta>Blog</Etiqueta>
            <h1 className="v-h1 vs-h1" data-speakable>
              Todo sobre <em className="n">vending</em> en Lechería
            </h1>
            <p className="v-lead speakable">
              Guías prácticas para empresas, clínicas, colegios y gimnasios que quieren ofrecer snacks, bebidas y café a
              cualquier hora, sin invertir en equipos.
            </p>
            {categorias.length > 1 && (
              <div className="vb-filtros" role="group" aria-label="Filtrar por categoría">
                <button type="button" className="vb-filtro" aria-pressed={categoria === null} onClick={() => setCategoria(null)}>
                  Todos
                </button>
                {categorias.map((c) => (
                  <button key={c} type="button" className="vb-filtro" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
        <Ola />
        <section className="v-sec v-sec--2" aria-label="Artículos">
          <div className="v-cont">
            {cargando ? (
              <p className="vb-vacio">Cargando artículos…</p>
            ) : consulta.isError && articulos.length === 0 ? (
              <p className="vb-vacio">No pudimos cargar los artículos. Recarga la página en un momento.</p>
            ) : visibles.length === 0 ? (
              <p className="vb-vacio" data-testid="blog-vacio">
                Muy pronto publicaremos nuestros primeros artículos.
              </p>
            ) : (
              <ul className="vb-grid">
                {visibles.map((a) => (
                  <li key={a.slug}>
                    <TarjetaArticulo a={a} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <SubpageCTA
          title="¿Quieres una máquina en tu negocio?"
          text="La instalación es gratuita y nosotros nos encargamos de la reposición y el mantenimiento."
          ctaText="Solicitar una máquina"
        />
      </main>
      <Footer />
    </div>
  );
}
