import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EnlaceInterno } from "@/lib/navegacion";
import { Icono } from "@/components/vitrina/iconos";
import { Etiqueta } from "@/components/vitrina/etiqueta";
import { PantallaLed } from "@/components/vitrina/pantalla-led";
import { Ola } from "@/components/vitrina/ola";
import { EstilosSubpagina } from "@/components/vitrina/subpagina";

// Página 404 con el diseño Vitrina: la pantalla de la columna marca un código
// que la máquina no tiene. No llama a useSEO a propósito: el servidor responde
// 404 (y pone el título y el noindex) justo cuando ninguna página lo llamó.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background v-base" data-testid="page-not-found">
      <EstilosSubpagina />
      <Header />
      <main id="contenido" className="v-bajo-cabecera">
        <section className="vs-hero">
          <div className="v-cont vs-nf">
            <div>
              <Etiqueta>Error 404</Etiqueta>
              <h1 className="v-h1 vs-h1">
                Página no <em className="n">encontrada</em>
              </h1>
              <p className="v-lead">La dirección que abriste no existe o cambió de lugar.</p>
              <div className="vs-hero__cta">
                <EnlaceInterno className="v-btn v-btn--p" href="/">
                  Volver al inicio
                </EnlaceInterno>
                <EnlaceInterno className="v-btn v-btn--s" href="/#servicios">
                  Ver servicios
                  <Icono nombre="flecha" flecha />
                </EnlaceInterno>
              </div>
            </div>
            <div className="vs-nf__panel v-plata" aria-hidden="true">
              <PantallaLed rotulo="Selección" valor="404" texto="Código sin servicio" />
              <Ola alto={62} ancho={236} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
