// Piezas de las subpáginas (Lechería, Empresas, Gimnasios y la 404).
// La maqueta Vitrina solo dibuja el inicio; aquí se lleva su lenguaje a las
// subpáginas: la vitrina con bandeja y rieles (Servicios), la lista con
// contador LED (Ubicaciones), las preguntas (FAQ) y la gaveta (Contacto).
//
// Los estilos van en <EstilosSubpagina /> (una vez por página) con clases
// "vs-*": son CSS normal dentro de un <style>, no pasan por Tailwind, así que
// no se purgan y no hace falta tocar index.css.
import type { ReactNode } from "react";
import { Icono, type NombreIcono } from "./iconos";
import { Etiqueta } from "./etiqueta";
import { CifraLed } from "./pantalla-led";
import { RielSeleccion } from "./espiral";

const CSS_SUBPAGINA = `
/* ---------- portada de subpágina ---------- */
.vs-hero{position:relative;padding-block:clamp(36px,6vw,80px) clamp(56px,7vw,104px);overflow:clip}
.vs-hero__grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(32px,4vw,64px);align-items:center}
.vs-lugar{display:flex;flex-wrap:wrap;align-items:center;gap:12px;font:500 12.5px/1.3 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--tinta2);margin:0 0 26px}
.vs-h1{font-size:clamp(2.15rem,5vw,4rem);overflow-wrap:break-word}
.vs-hero .v-lead{margin-top:26px;font-size:clamp(1.08rem,1.45vw,1.28rem)}
.vs-hero__cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}
.vs-hero__fig.v-boceto{max-width:400px}
@media (max-width:999px){
  .vs-hero__grid{grid-template-columns:minmax(0,1fr)}
  .vs-hero__fig.v-boceto{display:none}
}
@media (max-width:560px){
  .vs-hero{padding-top:28px}
  .vs-lugar{margin-bottom:20px}
  .vs-hero .v-lead{margin-top:20px}
  .vs-hero__cta{gap:12px;margin-top:26px}
  .vs-hero__cta .v-btn{width:100%}
}

/* ---------- la vitrina: bandeja de tres selecciones ---------- */
.vs-vitrina{background:var(--gabinete);border:1px solid var(--gabinete-borde);padding:12px;border-radius:28px;box-shadow:0 50px 70px -50px rgba(var(--sombra-rgb),.6)}
/* El vidrio fija su propia tinta; en oscuro se apaga igual que el de Servicios del inicio. */
.vs-vidrio{--tinta:#15171A;--tinta2:#474C52;--linea:rgba(21,23,26,.13);position:relative;border-radius:17px;overflow:hidden;background:linear-gradient(180deg,#F9FAF8,#EDF0EE);color:#15171A}
.vs-vidrio::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:linear-gradient(112deg,transparent 0 30%,rgba(255,255,255,.75) 30% 34%,transparent 34% 36.5%,rgba(255,255,255,.55) 36.5% 37.6%,transparent 37.6%)}
.vs-bandeja{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding:0;list-style:none}
.vs-slot{position:relative;display:flex;flex-direction:column;border-right:1px solid var(--linea);transition:background-color .25s}
.vs-slot:last-child{border-right:0}
.vs-slot__c{flex:1;display:flex;flex-direction:column;padding:28px 22px 0}
.vs-slot__p{order:9;align-self:flex-start;position:relative;margin:auto 0 0 4px;padding-top:22px;line-height:0}
.vs-slot__p::after{content:"";position:absolute;left:50%;bottom:-2px;width:68px;height:24px;margin-left:-34px;background:var(--espiral) 50% 50%/68px 24px no-repeat;transition:transform .3s}
.vs-slot__ic.v-ic{width:56px;height:56px;margin-bottom:-3px;stroke-width:1.15;color:#15171A;transition:transform .35s cubic-bezier(.3,1.4,.5,1)}
.vs-slot h3{font-size:1.3rem;font-weight:700;letter-spacing:-.02em;line-height:1.1;margin:0 0 8px;color:#15171A}
.vs-slot p{margin:0;font-size:14.5px;line-height:1.5;color:#474C52}
.vs-slot:hover{background:rgba(255,255,255,.8)}
.dark .vs-vidrio{--tinta:#F3F1EB;--tinta2:#C6CACF;--linea:rgba(255,255,255,.13);background:linear-gradient(180deg,#23272D,#191C21);color:#F3F1EB}
.dark .vs-vidrio::before{opacity:.07}
.dark .vs-slot__ic.v-ic,.dark .vs-slot h3{color:#F3F1EB}
.dark .vs-slot p{color:#C6CACF}
.dark .vs-slot:hover{background:rgba(255,255,255,.06)}
.vs-slot:hover .vs-slot__ic{transform:translateY(-7px)}
.vs-slot:hover .vs-slot__p::after{transform:scaleX(.82)}
.vs-slot:hover .v-tag{background:var(--naranja);color:#15171A}
.vs-slot:hover .v-riel__testigo{background:var(--azul);box-shadow:0 0 0 3px rgba(31,111,214,.25)}
@media (max-width:780px){
  .vs-vitrina{padding:8px;border-radius:22px;margin-inline:calc(var(--pad)*-.5)}
  .vs-vidrio{border-radius:15px}
  .vs-vidrio::before{display:none}
  .vs-bandeja{grid-template-columns:minmax(0,1fr)}
  .vs-slot{border-right:0}
  .vs-slot__c{display:grid;grid-template-columns:54px minmax(0,1fr);column-gap:20px;align-items:start;padding:20px 18px 0}
  .vs-slot__p{order:0;grid-column:1;grid-row:1/3;align-self:end;margin:0 0 0 6px;padding-top:0}
  .vs-slot h3{grid-column:2;font-size:1.16rem;margin-bottom:5px}
  .vs-slot p{grid-column:2;font-size:14px;line-height:1.45;padding-bottom:18px}
  .vs-slot .v-riel{padding:0 18px;height:40px}
}

/* ---------- lista con contador LED ---------- */
.vs-act{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(24px,5vw,72px);align-items:start}
.vs-act__izq{position:sticky;top:104px}
.vs-act .v-h2{font-size:clamp(1.9rem,3.6vw,2.8rem)}
.vs-cuenta{display:inline-grid;grid-template-columns:auto auto;align-items:center;gap:14px;margin:26px 0 0;padding:10px 18px 10px 10px;border-radius:16px}
.vs-cuenta .v-led{padding:10px 12px 7px;font-size:2.3rem}
.vs-cuenta b{font:500 11px/1.3 var(--font-mono);letter-spacing:.1em;text-transform:uppercase}
.vs-lista{margin:0;padding:0;list-style:none;border-top:1.5px solid var(--tinta)}
.vs-lista li{position:relative;padding:18px 0 18px 28px;border-bottom:1px solid var(--linea)}
.vs-lista li::before{content:"";position:absolute;left:2px;top:25px;width:9px;height:9px;border-radius:50%;border:2px solid var(--azul);background:var(--papel)}
.vs-lista li:nth-child(even)::before{border-color:var(--naranja)}
.vs-lista h3{margin:0;font:700 1.14rem/1.2 var(--font-display);letter-spacing:-.015em}
.vs-lista p{margin:5px 0 0;font-size:14.5px;line-height:1.5;color:var(--tinta2);max-width:62ch}
@media (max-width:999px){
  .vs-act{grid-template-columns:minmax(0,1fr)}
  .vs-act__izq{position:static;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 24px;align-items:end}
  .vs-act__izq .v-etq{grid-column:1/-1}
  .vs-cuenta{margin-top:0}
}
@media (max-width:560px){
  .vs-act__izq{grid-template-columns:minmax(0,1fr)}
  .vs-cuenta{margin-top:20px;justify-self:start}
}

/* ---------- preguntas frecuentes ---------- */
.vs-faq{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(32px,6vw,96px);align-items:start}
.vs-faq__izq{position:sticky;top:104px}
.vs-faq__izq small{display:block;margin:24px 0 12px;font-size:15px;color:var(--tinta2)}
.vs-preg{border-top:1.5px solid var(--tinta)}
.vs-preg details{border-bottom:1px solid var(--linea2)}
.vs-preg summary{display:grid;grid-template-columns:minmax(0,1fr) 28px;gap:18px;align-items:center;min-height:44px;padding:20px 0;cursor:pointer;list-style:none;font:600 1.15rem/1.25 var(--font-display);letter-spacing:-.015em}
.vs-preg summary h3{font:inherit;letter-spacing:inherit;color:inherit;margin:0;text-wrap:wrap}
.vs-preg summary::-webkit-details-marker{display:none}
.vs-preg summary::after{content:"";width:28px;height:28px;border-radius:50%;border:1.5px solid var(--tinta);background:linear-gradient(var(--tinta),var(--tinta)) 50%/12px 1.5px no-repeat,linear-gradient(var(--tinta),var(--tinta)) 50%/1.5px 12px no-repeat;transition:transform .25s,background-color .2s}
.vs-preg details[open] summary::after{transform:rotate(45deg);background-color:var(--naranja);background-image:linear-gradient(#15171A,#15171A),linear-gradient(#15171A,#15171A)}
.vs-preg summary:hover{color:var(--azul-t)}
.vs-preg details[open] summary{color:var(--azul-t)}
.vs-preg p{margin:0;padding:0 46px 24px 0;color:var(--tinta2);max-width:68ch}
@media (max-width:899px){
  .vs-faq{grid-template-columns:minmax(0,1fr)}
  .vs-faq__izq{position:static}
  .vs-preg p{padding:0 0 22px}
}
@media (max-width:420px){ .vs-preg summary{font-size:1.04rem;gap:12px} }

/* ---------- llamada final: la gaveta ---------- */
/* Superficie siempre oscura: dentro, la tinta es clara en los dos temas. */
.vs-gaveta{--tinta:#F3F1EB;--tinta2:#C6CACF;background:var(--gabinete);border:1px solid var(--gabinete-borde);color:#fff;border-radius:36px;padding:14px;box-shadow:0 60px 80px -60px rgba(var(--sombra-rgb),.7)}
.vs-gaveta__in{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:clamp(22px,4vw,56px) clamp(22px,4vw,56px) calc(clamp(22px,4vw,56px) + 56px)}
.vs-gaveta__boca{display:flex;justify-content:space-around;padding-bottom:clamp(20px,3vw,36px);color:rgba(255,255,255,.4)}
.vs-gaveta__boca svg{width:34px;height:32px;fill:none;stroke:currentColor;stroke-width:1.3}
.vs-gaveta__g{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(24px,4vw,56px);align-items:center}
.vs-gaveta h2{font-size:clamp(1.7rem,3.4vw,2.6rem);color:#fff}
.vs-gaveta p{margin:14px 0 0;font-size:clamp(1.05rem,1.3vw,1.2rem);color:#C6CACF;max-width:52ch;text-wrap:pretty}
.vs-gaveta .v-ola{position:absolute;left:0;right:0;bottom:0}
@media (max-width:899px){
  .vs-gaveta{border-radius:28px;padding:10px;margin-inline:calc(var(--pad)*-.5)}
  .vs-gaveta__in{border-radius:19px}
  .vs-gaveta__g{grid-template-columns:minmax(0,1fr)}
  .vs-gaveta .v-btn{width:100%;padding-block:10px;line-height:1.15}
}

/* ---------- página 404 ---------- */
.vs-nf{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(32px,5vw,72px);align-items:center;min-height:min(62vh,640px)}
.vs-nf__panel{display:flex;flex-direction:column;gap:16px;width:100%;max-width:300px;margin-inline:auto;padding:20px 18px 0;border-radius:28px;overflow:hidden;box-shadow:inset 0 1px 0 #fff,0 50px 70px -50px rgba(var(--sombra-rgb),.5)}
.vs-nf__panel .v-pant__valor{font-size:56px}
.vs-nf__panel .v-ola{margin:4px -18px 0}
@media (max-width:899px){
  .vs-nf{grid-template-columns:minmax(0,1fr);min-height:0}
  .vs-nf__panel{order:-1;margin-inline:0;max-width:260px}
}

@media (prefers-reduced-motion:reduce){
  .vs-slot,.vs-slot__ic.v-ic,.vs-slot__p::after,.vs-preg summary::after{transition:none}
  .vs-slot:hover .vs-slot__ic,.vs-slot:hover .vs-slot__p::after{transform:none}
}
`;

// Hoja de estilos de las subpáginas. Va una vez, al principio de la página.
export function EstilosSubpagina() {
  return <style dangerouslySetInnerHTML={{ __html: CSS_SUBPAGINA }} />;
}

export interface SeleccionBandeja {
  icono: NombreIcono;
  titulo: string;
  texto: string;
}

export interface BandejaSubpaginaProps {
  /** Tres selecciones (ventajas, beneficios, productos…). */
  items: readonly SeleccionBandeja[];
  /** Nombre accesible de la lista. */
  etiqueta: string;
  /** Código de la primera selección; las demás suben de dos en dos (10, 12, 14). */
  primerCodigo?: number;
}

// La vitrina de Servicios en pequeño: gabinete, vidrio y una bandeja con cada
// selección sobre su par de espirales y su riel con el código.
export function BandejaSubpagina({ items, etiqueta, primerCodigo = 10 }: BandejaSubpaginaProps) {
  return (
    <div className="vs-vitrina">
      <div className="vs-vidrio">
        <ul className="vs-bandeja" aria-label={etiqueta}>
          {items.map((item, i) => (
            <li className="vs-slot" key={item.titulo}>
              <div className="vs-slot__c">
                <span className="vs-slot__p" aria-hidden="true">
                  <Icono nombre={item.icono} className="vs-slot__ic" />
                </span>
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </div>
              <RielSeleccion codigo={primerCodigo + i * 2}>{""}</RielSeleccion>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export interface ListaConCuentaProps {
  etiqueta: ReactNode;
  /** Contenido del <h2>. */
  titulo: ReactNode;
  /** Qué se cuenta, en plural y con mayúscula inicial ("Clientes", "Ubicaciones"). */
  unidad: string;
  items: ReadonlyArray<{ nombre: string; tipo: string }>;
}

// La lista de "Nuestras ubicaciones actuales" de la maqueta: título y contador
// LED a la izquierda (el número sale del arreglo, no va escrito) y la lista a
// la derecha.
export function ListaConCuenta({ etiqueta, titulo, unidad, items }: ListaConCuentaProps) {
  const total = items.length;
  return (
    <div className="vs-act">
      <div className="vs-act__izq">
        <Etiqueta>{etiqueta}</Etiqueta>
        <h2 className="v-h2">{titulo}</h2>
        <p className="vs-cuenta v-plata">
          <CifraLed>
            <span aria-hidden="true">{String(total).padStart(2, "0")}</span>
          </CifraLed>
          <b aria-hidden="true">
            {unidad}
            <br />
            en la lista
          </b>
          <span className="sr-only">
            {total} {unidad.toLowerCase()} en la lista
          </span>
        </p>
      </div>
      <ol className="vs-lista">
        {items.map((item) => (
          <li key={item.nombre}>
            <h3>{item.nombre}</h3>
            <p>{item.tipo}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Las dos flechas de la boca de la gaveta de retiro (decorativas).
export function BocaGaveta() {
  return (
    <div className="vs-gaveta__boca" aria-hidden="true">
      <svg viewBox="0 0 34 32" focusable="false">
        <path d="M5,4 h24 v14 l-12,10 -12,-10z" />
      </svg>
      <svg viewBox="0 0 34 32" focusable="false">
        <path d="M5,4 h24 v14 l-12,10 -12,-10z" />
      </svg>
    </div>
  );
}
