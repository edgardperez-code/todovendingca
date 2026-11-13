import { Icono } from "@/components/vitrina/iconos";
import { Etiqueta } from "@/components/vitrina/etiqueta";

export type SubpageFAQItem = { question: string; answer: string };

// Preguntas frecuentes de subpágina con el MISMO diseño que la sección FAQ del
// inicio (maqueta Vitrina): título fijo a la izquierda y preguntas a la
// derecha. Son <details> nativos: se abren sin JavaScript y, al compartir
// name, solo queda una abierta. Necesita <EstilosSubpagina /> en la página.
export function SubpageFAQ({ items }: { items: SubpageFAQItem[] }) {
  return (
    <section id="faq" className="v-sec v-sec--2" data-testid="section-faq">
      <div className="v-cont vs-faq">
        <div className="vs-faq__izq">
          <Etiqueta>Preguntas frecuentes</Etiqueta>
          <h2 data-speakable className="v-h2">
            Resolvemos tus <em className="n">dudas</em>
          </h2>
          <small>¿Tienes más preguntas? Estamos aquí para ayudarte.</small>
          <a
            className="v-btn v-btn--s"
            href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            <Icono nombre="whatsapp" />
            Contactar por WhatsApp
          </a>
        </div>
        <div className="vs-preg">
          {items.map((faq, index) => (
            <details key={index} name="faq-subpagina" open={index === 0} data-testid={`faq-item-${index}`}>
              <summary><h3>{faq.question}</h3></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
