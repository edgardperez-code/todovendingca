// Propuesta de valor: lista numerada a dos columnas y la cita sobre fondo de
// gabinete con la ola de la marca al pie.
import { Etiqueta, Icono, LogoTodoVending, Ola, type NombreIcono } from "@/components/vitrina";

const valueProps: Array<{ id: string; title: string; description: string; icon: NombreIcono }> = [
  {
    id: "1",
    title: "Satisfacción garantizada",
    description: "Ofrecemos soluciones que mejoran la comodidad y el bienestar de tus empleados, clientes o usuarios.",
    icon: "corazon",
  },
  {
    id: "2",
    title: "Eficiencia y productividad",
    description:
      "Proporcionamos acceso rápido y fácil a productos esenciales, ahorrando tiempo y aumentando la productividad.",
    icon: "rayo",
  },
  {
    id: "3",
    title: "Imagen corporativa",
    description: "Proyectamos una imagen moderna e innovadora de tu empresa o institución con tecnología de punta.",
    icon: "premio",
  },
  {
    id: "4",
    title: "Tranquilidad total",
    description:
      "Nos encargamos de todo, desde la instalación hasta el mantenimiento, permitiéndote concentrarte en tu actividad principal.",
    icon: "escudo",
  },
  {
    id: "5",
    title: "Generación de ingresos",
    description: "Ofrecemos modelos de negocio flexibles que pueden generar ingresos adicionales para tu negocio.",
    icon: "sube",
  },
  {
    id: "6",
    title: "Aliado estratégico",
    description: "Nos convertimos en un socio que entiende tus necesidades y trabaja contigo para superarlas.",
    icon: "aliado",
  },
];

// Estilos propios de la sección (prefijo pv-). Medidas y cortes de la maqueta.
const ESTILOS = `
.pv-valores{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(32px,6vw,88px);margin:0;padding:0;list-style:none}
.pv-valores>li{display:grid;grid-template-columns:38px minmax(0,1fr) 30px;gap:8px 14px;align-items:start;padding:26px 0 30px;border-top:1px solid var(--linea2)}
.pv-valores>li:nth-child(-n+2){border-top:1.5px solid var(--tinta)}
.pv-valores__n{padding-top:5px;font:600 12.5px/1 var(--font-mono);letter-spacing:.06em;color:var(--azul-t)}
.pv-valores>li:nth-child(even) .pv-valores__n{color:var(--naranja-t)}
.pv-valores h3{font-family:var(--font-display);font-weight:700;font-size:1.4rem;line-height:1.12;letter-spacing:-.02em;margin:0;text-wrap:balance}
.pv-valores p{grid-column:2;margin:0;font-size:15.5px;line-height:1.55;color:var(--tinta2);max-width:46ch}
.pv-valores__ic{grid-column:3;grid-row:1/3;width:28px;height:28px;stroke-width:1.3;color:var(--tinta3);transition:color .2s,transform .3s}
.pv-valores>li:hover .pv-valores__ic{color:var(--azul-t);transform:translateY(-2px)}
@media (max-width:799px){
  .pv-valores{grid-template-columns:minmax(0,1fr)}
  .pv-valores>li:nth-child(2){border-top:1px solid var(--linea2)}
  .pv-valores>li{padding:22px 0 24px}
  .pv-valores h3{font-size:1.25rem}
}
.pv-cita{margin:clamp(40px,6vw,72px) 0 0;position:relative;background:var(--gabinete);border:1px solid var(--gabinete-borde);color:var(--sobre-gabinete);border-radius:28px;overflow:hidden;padding:clamp(36px,6vw,72px) clamp(24px,6vw,80px) calc(clamp(36px,6vw,72px) + 44px)}
.pv-cita blockquote{margin:0;padding:0;border:0;max-width:24em;font:600 clamp(1.5rem,3.4vw,2.6rem)/1.14 var(--font-display);letter-spacing:-.025em;text-wrap:balance}
.pv-cita figcaption{margin-top:28px;display:flex;align-items:center;gap:12px;font-size:15px;line-height:1.6;color:var(--sobre-gabinete2)}
.pv-cita figcaption strong{display:block;color:var(--sobre-gabinete)}
.pv-cita__logo{width:46px;height:46px;flex:none}
.pv-cita__ola{position:absolute;left:0;right:0;bottom:0}
@media (prefers-reduced-motion:reduce){
  .pv-valores__ic{transition:none}
}
`;

export function ValuePropsSection() {
  return (
    <section id="propuesta" className="v-sec v-sec--2" data-testid="section-value-props">
      <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />
      <div className="v-cont">
        <div className="v-cab-sec">
          <div>
            <Etiqueta>Nuestra propuesta</Etiqueta>
            <h2 data-speakable className="v-h2">
              Un <em>aliado estratégico</em>
            </h2>
          </div>
          <p className="v-lead">
            En Todo Vending CA, nos enfocamos en ser más que un simple proveedor. Somos una solución integral que se
            convierte en tu aliado estratégico.
          </p>
        </div>

        <ol className="pv-valores">
          {valueProps.map((prop, i) => (
            <li key={prop.id} data-testid={`item-value-prop-${prop.id}`}>
              <span className="pv-valores__n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{prop.title}</h3>
              <Icono nombre={prop.icon} className="pv-valores__ic" />
              <p>{prop.description}</p>
            </li>
          ))}
        </ol>

        <figure className="pv-cita v-oscuro" data-testid="cita-propuesta">
          <blockquote>
            «Podemos transformar cada uno de tus espacios en una experiencia más conveniente y placentera colocando
            una de nuestras máquinas.»
          </blockquote>
          <figcaption>
            <LogoTodoVending className="pv-cita__logo" />
            <span>
              <strong>Todo Vending CA</strong>
              Lechería, Anzoátegui
            </span>
          </figcaption>
          <Ola alto={44} ancho={200} className="pv-cita__ola" />
        </figure>
      </div>
    </section>
  );
}
