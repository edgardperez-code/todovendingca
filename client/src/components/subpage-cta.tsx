import { Icono } from "@/components/vitrina/iconos";
import { Ola } from "@/components/vitrina/ola";
import { BocaGaveta } from "@/components/vitrina/subpagina";

// Llamada final de subpágina: la gaveta de retiro de la máquina (el bloque de
// Contacto de la maqueta Vitrina) con el título, el texto y el WhatsApp.
// Necesita <EstilosSubpagina /> en la página (clases vs-*).
export function SubpageCTA({ title, text, ctaText }: { title: string; text: string; ctaText: string }) {
  return (
    <section className="v-sec">
      <div className="v-cont">
        <div className="vs-gaveta v-oscuro">
          <div className="vs-gaveta__in">
            <BocaGaveta />
            <div className="vs-gaveta__g">
              <div>
                <h2 className="v-tit">{title}</h2>
                <p>{text}</p>
              </div>
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
            </div>
            <Ola alto={44} ancho={200} />
          </div>
        </div>
      </div>
    </section>
  );
}
