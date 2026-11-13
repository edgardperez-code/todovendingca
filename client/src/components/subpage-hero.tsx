import { EnlaceInterno } from "@/lib/navegacion";
import { Icono } from "@/components/vitrina/iconos";
import { ChipLed } from "@/components/vitrina/pantalla-led";
import { MaquinaWittern } from "@/components/vitrina/maquina-wittern";

// Portada compacta de subpágina con el lenguaje de la portada del inicio
// (diseño Vitrina): rótulo mono, h1 en dos colores, lead, WhatsApp y, en
// pantallas anchas, el boceto de la Wittern 3535.
// Necesita <EstilosSubpagina /> en la página (clases vs-*).
export function SubpageHero({
  eyebrow,
  titlePlain,
  titleAccent,
  lead,
  ctaText,
  chip,
}: {
  eyebrow: string;
  titlePlain: string;
  titleAccent: string;
  lead: string;
  ctaText: string;
  /** Texto de la etiqueta LED junto al rótulo (p. ej. "24/7"). Sin él va la ola corta. */
  chip?: string;
}) {
  return (
    <section className="vs-hero">
      <div className="v-cont vs-hero__grid">
        {/* Sin animación de entrada: es la primera pantalla y debe salir
            pintada desde el servidor. */}
        <div>
          <p className="vs-lugar">
            {chip ? <ChipLed>{chip}</ChipLed> : <i className="v-etq__o" aria-hidden="true" />}
            {eyebrow}
          </p>
          <h1 data-speakable className="v-h1 vs-h1">
            {titlePlain} <em className="n">{titleAccent}</em>
          </h1>
          <p className="speakable v-lead">{lead}</p>
          <div className="vs-hero__cta">
            <a
              className="v-btn v-btn--p"
              href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
            >
              <Icono nombre="whatsapp" />
              {ctaText}
            </a>
            <EnlaceInterno className="v-btn v-btn--s" href="/#servicios">
              Ver servicios
              <Icono nombre="flecha" flecha />
            </EnlaceInterno>
          </div>
        </div>
        <MaquinaWittern className="vs-hero__fig" notas={false} />
      </div>
    </section>
  );
}
