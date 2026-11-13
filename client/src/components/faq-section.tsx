// Preguntas frecuentes (diseño Vitrina): título fijo a la izquierda y la lista
// de preguntas a la derecha. Usa <details> nativo: se abre y se cierra sin
// JavaScript, y el atributo name hace que solo quede una abierta a la vez.
import { Etiqueta, Icono } from "@/components/vitrina";
import type { FAQItem } from "@shared/schema";

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "¿Tiene algún costo la instalación?",
    answer: "No, Todo Vending CA cubre todos los gastos de instalación en tu ubicación. La instalación es completamente gratuita y sin compromisos para ti."
  },
  {
    id: "2",
    question: "¿Quién abastece las máquinas con productos?",
    answer: "Nosotros nos encargamos de la reposición completa del inventario, asegurando que las máquinas estén siempre abastecidas con productos frescos y variados según tus preferencias."
  },
  {
    id: "3",
    question: "¿Quién repara o realiza el mantenimiento de las máquinas?",
    answer: "Nuestro equipo técnico realiza monitoreo constante y se encarga de cualquier reparación o mantenimiento necesario. El servicio de mantenimiento está incluido sin costo adicional."
  },
  {
    id: "4",
    question: "¿Qué tipos de productos pueden vender las máquinas?",
    answer: "Ofrecemos una amplia variedad: snacks, galletas, chocolates, bebidas frías, refrescos, jugos, agua, café gourmet, cappuccino, chocolate caliente y opciones saludables. Adaptamos el inventario según tus necesidades."
  },
  {
    id: "5",
    question: "¿Qué formas de pago aceptan las máquinas?",
    answer: "Nuestras máquinas cuentan con sistemas de pago modernos que aceptan efectivo, tarjetas de débito y crédito, y pago móvil para mayor comodidad de los usuarios."
  },
  {
    id: "6",
    question: "¿Cuánto espacio necesito para instalar una máquina?",
    answer: "El espacio requerido depende del tipo de máquina. Generalmente necesitas un área de aproximadamente 1.5 m x 1 m con acceso a toma eléctrica. Nuestro equipo evalúa tu espacio para recomendarte la mejor opción."
  },
  {
    id: "7",
    question: "¿Puedo elegir los productos que se venden en la máquina?",
    answer: "Absolutamente. Trabajamos contigo para personalizar la selección de productos según las preferencias de tus empleados, clientes o usuarios. Escuchamos tus sugerencias y las implementamos."
  },
  {
    id: "8",
    question: "¿Cómo solicito una máquina para mi negocio?",
    answer: "Es muy sencillo. Puedes contactarnos vía WhatsApp al +58 414-616-4177 o llenar el formulario de contacto en nuestra página. Nuestro equipo se comunicará contigo para evaluar tu espacio y coordinar la instalación."
  }
];

// Estilos propios de la sección (medidas y cortes de la maqueta).
const ESTILOS = `
.faq-g{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(32px,6vw,96px);align-items:start}
.faq-izq{position:sticky;top:104px}
.faq-izq .v-lead{margin:20px 0 28px}
.faq-izq small{display:block;margin-bottom:12px;font-size:15px;color:var(--tinta2)}
.faq-preg{border-top:1.5px solid var(--tinta)}
.faq-preg details{border-bottom:1px solid var(--linea2)}
.faq-preg summary{display:grid;grid-template-columns:minmax(0,1fr) 28px;gap:18px;align-items:center;padding:20px 0;cursor:pointer;list-style:none;font:600 1.15rem/1.25 var(--font-display);letter-spacing:-.015em;color:var(--tinta)}
.faq-preg summary h3{font:inherit;letter-spacing:inherit;color:inherit;margin:0;text-wrap:wrap}
.faq-preg summary::-webkit-details-marker{display:none}
.faq-preg summary::after{content:"";width:28px;height:28px;border-radius:50%;border:1.5px solid var(--tinta);background:linear-gradient(var(--tinta),var(--tinta)) 50%/12px 1.5px no-repeat,linear-gradient(var(--tinta),var(--tinta)) 50%/1.5px 12px no-repeat;transition:transform .25s,background-color .2s}
.faq-preg details[open] summary::after{transform:rotate(45deg);border-color:#15171A;background:linear-gradient(#15171A,#15171A) 50%/12px 1.5px no-repeat,linear-gradient(#15171A,#15171A) 50%/1.5px 12px no-repeat;background-color:var(--naranja)}
.faq-preg summary:hover{color:var(--azul-t)}
.faq-preg details[open] summary{color:var(--azul-t)}
.faq-preg p{padding:0 46px 24px 0;color:var(--tinta2);max-width:68ch}
@media (max-width:899px){
  .faq-g{grid-template-columns:minmax(0,1fr)}
  .faq-izq{position:static}
  .faq-preg p{padding:0 0 22px}
}
@media (max-width:420px){
  .faq-preg summary{font-size:1.04rem;gap:12px}
}
@media (prefers-reduced-motion:reduce){
  .faq-preg summary::after{transition:none}
}
`;

export function FAQSection() {
  return (
    <section id="faq" className="v-sec" data-testid="section-faq">
      <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />
      <div className="v-cont faq-g">
        {/* Título y llamada a WhatsApp */}
        <div className="faq-izq">
          <Etiqueta>Preguntas frecuentes</Etiqueta>
          <h2 data-speakable className="v-h2">
            Resolvemos tus <em className="n">dudas</em>
          </h2>
          <p className="v-lead">
            Descubre todo lo que necesitas saber sobre nuestros servicios de vending.
          </p>
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

        {/* Preguntas */}
        <div className="faq-preg">
          {faqs.map((faq, index) => (
            <details key={faq.id} name="faq" open={index === 0} data-testid={`faq-item-${index}`}>
              <summary><h3>{faq.question}</h3></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
