// Dibujo a línea de la Wittern 3535 (la máquina de snacks) de la portada.
// GENERADO desde la maqueta aprobada (maquetas/a/index.html): el SVG se copió
// tal cual; solo cambian los nombres de atributo a JSX, los ids/clases (v-*) y
// los trazos que quedan fuera del gabinete, que siguen al tema (var(--tinta)).
// No lo edites a mano trazo por trazo: si cambia el dibujo, se regenera.
import type { ReactNode } from "react";
import { LogoTrazos } from "./logo";

// Anotaciones a la derecha del dibujo. "arriba" es la posición vertical (en %
// del alto del dibujo) donde termina la guía punteada correspondiente.
export interface NotaMaquina {
  arriba: string;
  titulo: string;
  detalle?: string;
}

export const NOTAS_MAQUINA: readonly NotaMaquina[] = [
  { arriba: "21.22%", titulo: "Pantalla de precio" },
  { arriba: "30.27%", titulo: "Pago", detalle: "Tarjeta y pago móvil" },
  { arriba: "38.65%", titulo: "Teclado", detalle: "Selección por código" },
  { arriba: "57.16%", titulo: "Nuestra ola", detalle: "Naranja y azul" },
  { arriba: "75.68%", titulo: "Gaveta de retiro" },
];

export interface MaquinaWitternProps {
  className?: string;
  /** Muestra las guías y anotaciones cuando hay ancho (700–999 px y ≥1280 px). */
  notas?: boolean;
  /** Cuadrícula de plano detrás del dibujo. */
  plano?: boolean;
  /** Texto del pie de figura; null lo quita. */
  pie?: ReactNode;
}

export function MaquinaWittern({
  className,
  notas = true,
  plano = true,
  pie = "Fig. 1 · Wittern 3535, nuestra máquina de snacks",
}: MaquinaWitternProps) {
  const clases = ["v-boceto", notas ? "v-boceto--notas" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <figure className={clases} data-testid="figura-maquina-wittern">
      {plano && <span className="v-plano" aria-hidden="true" />}
      <div className="v-boceto__d">
        <DibujoWittern />
        {notas && (
          <ol className="v-notas" aria-hidden="true">
            {NOTAS_MAQUINA.map((nota) => (
              <li key={nota.titulo} style={{ top: nota.arriba }}>
                <b>{nota.titulo}</b>
                {nota.detalle}
              </li>
            ))}
          </ol>
        )}
      </div>
      {pie != null && <figcaption>{pie}</figcaption>}
    </figure>
  );
}

// Solo el SVG (sin figura, notas ni pie), por si hace falta en otro marco.
export function DibujoWittern({ className }: { className?: string }) {
  return (
    <svg
      className={["v-maquina", className ?? ""].filter(Boolean).join(" ")}
      viewBox="0 0 600 740"
      role="img"
      aria-labelledby="v-maq-tit v-maq-desc"
    >
      <title id="v-maq-tit">Boceto de una máquina de snacks Wittern 3535 de Todo Vending CA</title>
      <desc id="v-maq-desc">
        Dibujo a línea: gabinete negro con frente de vidrio y seis bandejas de espirales con códigos de selección,
        columna de control plateada con el logo, pantalla de precio, pantalla de pago, teclado y la ola naranja y azul
        de la marca, y gaveta de retiro en la parte inferior.
      </desc>
        <defs>
        <linearGradient id="v-maq-plata" x1="0" x2="1"><stop offset="0" stopColor="#D5D9D7"/><stop offset=".3" stopColor="#F7F8F6"/><stop offset=".72" stopColor="#E4E7E5"/><stop offset="1" stopColor="#C6CBC9"/></linearGradient>
        <linearGradient id="v-maq-vid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E6E8E5"/><stop offset=".1" stopColor="#FBFBF8"/><stop offset="1" stopColor="#F1F2EF"/></linearGradient>
        <clipPath id="v-maq-vidrio"><rect x="70" y="70" width="312" height="436" rx="14"/></clipPath>
        <clipPath id="v-maq-col"><rect x="416" y="70" width="60" height="438" rx="15"/></clipPath>
        </defs>
        <ellipse cx="270" cy="724" rx="250" ry="9" fill="#15171A" opacity=".1"/>
        <path d="M22,40 H58 M40,22 V58 M482,40 H518 M500,22 V58 M22,690 H58 M40,672 V708 M482,690 H518 M500,672 V708" stroke="var(--tinta)" strokeWidth=".6" opacity=".5" fill="none"/>
        <path d="M62,688 l3,32 h9 l3,-32z M463,688 l3,32 h9 l3,-32z" fill="#17181C" stroke="var(--maq-borde)" strokeWidth="1"/>
        <path d="M44,41 v-6 h34 v6z M462,41 v-6 h34 v6z" fill="#17181C" stroke="var(--maq-borde)" strokeWidth="1"/>
        <rect x="40" y="40" width="460" height="650" rx="5" fill="#17181C" stroke="var(--maq-borde)" strokeWidth="1.6"/>
        <rect x="40" y="40" width="460" height="650" rx="5" fill="none" stroke="var(--maq-borde)" strokeWidth=".8" opacity=".4" transform="rotate(.35 270 365)"/>
        <rect x="47" y="47" width="446" height="636" rx="3" fill="none" stroke="#fff" strokeWidth=".7" opacity=".2"/>
        <path d="M47,523 H493" stroke="#fff" strokeWidth=".6" opacity=".14"/>
        <path d="M6,722 H556" stroke="var(--tinta)" strokeWidth=".8" opacity=".55"/>
        <path d="M14,722 l-6,7 M27,722 l-6,7 M40,722 l-6,7 M53,722 l-6,7 M66,722 l-6,7 M79,722 l-6,7 M92,722 l-6,7 M105,722 l-6,7 M118,722 l-6,7 M131,722 l-6,7 M144,722 l-6,7 M157,722 l-6,7 M170,722 l-6,7 M183,722 l-6,7 M196,722 l-6,7 M209,722 l-6,7 M222,722 l-6,7 M235,722 l-6,7 M248,722 l-6,7 M261,722 l-6,7 M274,722 l-6,7 M287,722 l-6,7 M300,722 l-6,7 M313,722 l-6,7 M326,722 l-6,7 M339,722 l-6,7 M352,722 l-6,7 M365,722 l-6,7 M378,722 l-6,7 M391,722 l-6,7 M404,722 l-6,7 M417,722 l-6,7 M430,722 l-6,7 M443,722 l-6,7 M456,722 l-6,7 M469,722 l-6,7 M482,722 l-6,7 M495,722 l-6,7 M508,722 l-6,7 M521,722 l-6,7 M534,722 l-6,7 M547,722 l-6,7 " stroke="var(--tinta)" strokeWidth=".5" opacity=".35"/>
        <rect x="52" y="392" width="9" height="20" rx="1.5" fill="#0C0D0F" stroke="#8A9096" strokeWidth=".9"/><circle cx="56.5" cy="402" r="1.7" fill="#8A9096"/>
        <rect x="67" y="67" width="318" height="442" rx="16" fill="#0C0D0F" stroke="#fff" strokeOpacity=".16" strokeWidth=".7"/>
        <rect x="70" y="70" width="312" height="436" rx="14" fill="url(#v-maq-vid)"/>
        <g clipPath="url(#v-maq-vidrio)">
        <path d="M220,60 L110,516 M248,60 L138,516" stroke="#fff" strokeWidth="15" opacity=".6"/>
        <path d="M89.5,95.8 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V153.0 H89.5Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M89.5,100.3 h42.6 M89.5,148.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="110.8" cy="118.7" rx="11.1" ry="7.0" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="101.4" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="98.7" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="122.2" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="119.4" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="83.5" y="155.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="90.0" y="161.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">10</text>
        <path d="M147.1,100.2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V153.0 H147.1Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M147.1,104.7 h42.6 M147.1,148.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="168.4" cy="121.2" rx="11.1" ry="7.0" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="159.0" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="156.3" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="179.8" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="177.0" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="141.1" y="155.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="147.6" y="161.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">12</text>
        <path d="M204.7,89.9 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V153.0 H204.7Z" fill="#F26A21" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M204.7,94.4 h42.6 M204.7,148.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="226.0" cy="115.2" rx="11.1" ry="7.0" fill="none" stroke="#F26A21" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="216.6" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="213.9" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="237.4" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="234.6" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="198.7" y="155.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="205.2" y="161.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">14</text>
        <path d="M262.3,101.7 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V153.0 H262.3Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M262.3,106.2 h42.6 M262.3,148.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="283.6" cy="122.1" rx="11.1" ry="6.9" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="274.2" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="271.5" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="295.0" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="292.2" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="256.3" y="155.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="262.8" y="161.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">16</text>
        <path d="M319.9,97.3 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V153.0 H319.9Z" fill="#1F6FD6" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M319.9,101.8 h42.6 M319.9,148.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="341.2" cy="119.5" rx="11.1" ry="7.0" fill="none" stroke="#1F6FD6" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="331.8" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="329.1" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="352.6" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="349.8" cy="145" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="313.9" y="155.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="320.4" y="161.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">18</text>
        <path d="M70,154 h312 M70,164 h312" stroke="#15171A" strokeWidth=".8" opacity=".7"/>
        <path d="M89.5,186.2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V233.0 H89.5Z" fill="#F26A21" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M89.5,190.7 h42.6 M89.5,228.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="110.8" cy="204.7" rx="11.1" ry="6.3" fill="none" stroke="#F26A21" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="101.4" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="98.7" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="122.2" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="119.4" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="83.5" y="235.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="90.0" y="241.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">20</text>
        <path d="M147.1,188.8 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V233.0 H147.1Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M147.1,193.3 h42.6 M147.1,228.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="168.4" cy="206.2" rx="11.1" ry="6.0" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="159.0" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="156.3" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="179.8" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="177.0" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="141.1" y="235.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="147.6" y="241.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">22</text>
        <path d="M204.7,182.2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V233.0 H204.7Z" fill="#1F6FD6" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M204.7,186.7 h42.6 M204.7,228.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="226.0" cy="202.4" rx="11.1" ry="6.9" fill="none" stroke="#1F6FD6" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="216.6" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="213.9" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="237.4" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="234.6" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="198.7" y="235.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="205.2" y="241.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">24</text>
        <ellipse cx="274.2" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="271.5" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="295.0" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="292.2" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="256.3" y="235.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="262.8" y="241.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">26</text>
        <path d="M319.9,184.8 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V233.0 H319.9Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M319.9,189.3 h42.6 M319.9,228.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="341.2" cy="203.9" rx="11.1" ry="6.5" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="331.8" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="329.1" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="352.6" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="349.8" cy="225" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="313.9" y="235.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="320.4" y="241.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">28</text>
        <path d="M70,234 h312 M70,244 h312" stroke="#15171A" strokeWidth=".8" opacity=".7"/>
        <path d="M89.5,267.0 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V307.0 H89.5Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M89.5,271.5 h42.6 M89.5,302.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="110.8" cy="282.6" rx="11.1" ry="5.5" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="101.4" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="98.7" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="122.2" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="119.4" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="83.5" y="309.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="90.0" y="315.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">30</text>
        <path d="M147.1,263.4 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V307.0 H147.1Z" fill="#1F6FD6" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M147.1,267.9 h42.6 M147.1,302.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="168.4" cy="280.6" rx="11.1" ry="5.9" fill="none" stroke="#1F6FD6" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="159.0" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="156.3" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="179.8" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="177.0" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="141.1" y="309.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="147.6" y="315.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">32</text>
        <path d="M204.7,276.6 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V307.0 H204.7Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M204.7,281.1 h42.6 M204.7,302.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="226.0" cy="288.2" rx="11.1" ry="4.2" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="216.6" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="213.9" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="237.4" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="234.6" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="198.7" y="309.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="205.2" y="315.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">34</text>
        <path d="M262.3,277.8 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V307.0 H262.3Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M262.3,282.3 h42.6 M262.3,302.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="283.6" cy="288.9" rx="11.1" ry="4.1" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="274.2" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="271.5" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="295.0" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="292.2" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="256.3" y="309.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="262.8" y="315.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">36</text>
        <path d="M319.9,264.6 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V307.0 H319.9Z" fill="#1F6FD6" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M319.9,269.1 h42.6 M319.9,302.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="341.2" cy="281.2" rx="11.1" ry="5.8" fill="none" stroke="#1F6FD6" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="331.8" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="329.1" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="352.6" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="349.8" cy="299" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="313.9" y="309.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="320.4" y="315.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">38</text>
        <path d="M70,308 h312 M70,318 h312" stroke="#15171A" strokeWidth=".8" opacity=".7"/>
        <rect x="88.3" y="338.7" width="16.1" height="34.3" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M88.3,342.7 h16.1 M88.3,369.0 h16.1 M96.4,347.7 v16.3" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="97.1" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="94.7" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="83.5" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="90.0" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">40</text>
        <rect x="117.1" y="333.5" width="16.1" height="39.5" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M117.1,337.5 h16.1 M117.1,369.0 h16.1 M125.2,342.5 v21.5" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="125.9" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="123.5" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="112.3" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="118.8" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">41</text>
        <rect x="145.9" y="336.6" width="16.1" height="36.4" rx="1.6" fill="#1F6FD6" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9"/>
        <path d="M145.9,340.6 h16.1 M145.9,369.0 h16.1 M154.0,345.6 v18.4" stroke="#1F6FD6" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="154.7" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="152.3" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="141.1" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="147.6" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">42</text>
        <rect x="174.7" y="340.8" width="16.1" height="32.2" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M174.7,344.8 h16.1 M174.7,369.0 h16.1 M182.8,349.8 v14.2" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="183.5" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="181.1" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="169.9" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="176.4" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">43</text>
        <rect x="203.5" y="334.5" width="16.1" height="38.5" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M203.5,338.5 h16.1 M203.5,369.0 h16.1 M211.6,343.5 v20.5" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="212.3" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="209.9" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="198.7" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="205.2" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">44</text>
        <rect x="232.3" y="337.6" width="16.1" height="35.4" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M232.3,341.6 h16.1 M232.3,369.0 h16.1 M240.4,346.6 v17.4" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="241.1" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="238.7" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="227.5" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="234.0" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">45</text>
        <rect x="261.1" y="336.6" width="16.1" height="36.4" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M261.1,340.6 h16.1 M261.1,369.0 h16.1 M269.2,345.6 v18.4" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="269.9" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="267.5" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="256.3" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="262.8" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">46</text>
        <rect x="289.9" y="333.5" width="16.1" height="39.5" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M289.9,337.5 h16.1 M289.9,369.0 h16.1 M298.0,342.5 v21.5" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="298.7" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="296.3" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="285.1" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="291.6" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">47</text>
        <rect x="318.7" y="335.6" width="16.1" height="37.4" rx="1.6" fill="#F26A21" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9"/>
        <path d="M318.7,339.6 h16.1 M318.7,369.0 h16.1 M326.8,344.6 v19.4" stroke="#F26A21" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="327.5" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="325.1" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="313.9" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="320.4" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">48</text>
        <rect x="347.5" y="341.8" width="16.1" height="31.2" rx="1.6" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9"/>
        <path d="M347.5,345.8 h16.1 M347.5,369.0 h16.1 M355.6,350.8 v13.2" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="356.3" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="353.9" cy="367" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="342.7" y="375.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="349.2" y="381.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">49</text>
        <path d="M70,374 h312 M70,384 h312" stroke="#15171A" strokeWidth=".8" opacity=".7"/>
        <ellipse cx="97.1" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="94.7" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="83.5" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="90.0" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">50</text>
        <ellipse cx="125.9" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="123.5" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="112.3" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="118.8" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">51</text>
        <path d="M147.1,401.4 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V404.4z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M145.9,404.4 q8.1,2.6 16.1,0 M145.9,415.4 q8.1,2.6 16.1,0" fill="none" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="154.7" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="152.3" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="141.1" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="147.6" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">52</text>
        <path d="M175.9,399.7 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V402.7z" fill="#F26A21" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M174.7,402.7 q8.1,2.6 16.1,0 M174.7,414.5 q8.1,2.6 16.1,0" fill="none" stroke="#F26A21" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="183.5" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="181.1" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="169.9" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="176.4" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">53</text>
        <path d="M204.7,405.0 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V408.0z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M203.5,408.0 q8.1,2.6 16.1,0 M203.5,417.1 q8.1,2.6 16.1,0" fill="none" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="212.3" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="209.9" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="198.7" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="205.2" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">54</text>
        <path d="M233.5,402.3 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V405.3z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M232.3,405.3 q8.1,2.6 16.1,0 M232.3,415.8 q8.1,2.6 16.1,0" fill="none" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="241.1" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="238.7" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="227.5" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="234.0" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">55</text>
        <path d="M262.3,399.7 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V402.7z" fill="#1F6FD6" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M261.1,402.7 q8.1,2.6 16.1,0 M261.1,414.5 q8.1,2.6 16.1,0" fill="none" stroke="#1F6FD6" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="269.9" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="267.5" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="256.3" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="262.8" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">56</text>
        <path d="M291.1,402.3 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V405.3z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M289.9,405.3 q8.1,2.6 16.1,0 M289.9,415.8 q8.1,2.6 16.1,0" fill="none" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="298.7" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="296.3" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="285.1" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="291.6" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">57</text>
        <path d="M319.9,406.7 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V409.7z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M318.7,409.7 q8.1,2.6 16.1,0 M318.7,417.9 q8.1,2.6 16.1,0" fill="none" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="327.5" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="325.1" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="313.9" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="320.4" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">58</text>
        <path d="M348.7,407.6 q6.9,-3.4 13.7,0 l1.2,3 V429.0 q-8.1,2.6 -16.1,0 V410.6z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M347.5,410.6 q8.1,2.6 16.1,0 M347.5,418.3 q8.1,2.6 16.1,0" fill="none" stroke="#15171A" strokeWidth=".6" opacity=".55"/>
        <ellipse cx="356.3" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="353.9" cy="425" rx="8.6" ry="6.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="342.7" y="433.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="349.2" y="439.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">59</text>
        <path d="M70,432 h312 M70,442 h312" stroke="#15171A" strokeWidth=".8" opacity=".7"/>
        <ellipse cx="101.4" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="98.7" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="122.2" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="119.4" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="83.5" y="491.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="90.0" y="497.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">60</text>
        <path d="M147.1,456.7 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V489.0 H147.1Z" fill="#1F6FD6" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M147.1,461.2 h42.6 M147.1,484.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="168.4" cy="469.1" rx="11.1" ry="4.5" fill="none" stroke="#1F6FD6" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="159.0" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="156.3" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="179.8" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="177.0" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="141.1" y="491.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="147.6" y="497.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">62</text>
        <ellipse cx="216.6" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="213.9" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="237.4" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="234.6" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="198.7" y="491.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="205.2" y="497.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">64</text>
        <path d="M262.3,460.2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V489.0 H262.3Z" fill="#fff" fillOpacity="0.85" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M262.3,464.7 h42.6 M262.3,484.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="283.6" cy="471.1" rx="11.1" ry="4.0" fill="none" stroke="#15171A" strokeWidth=".8" opacity="0.4"/>
        <ellipse cx="274.2" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="271.5" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="295.0" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="292.2" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="256.3" y="491.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="262.8" y="497.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">66</text>
        <path d="M319.9,457.6 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 l3.6,-2 l3.6,2 V489.0 H319.9Z" fill="#F26A21" fillOpacity="0.22" stroke="#15171A" strokeWidth=".9" strokeLinejoin="round"/>
        <path d="M319.9,462.1 h42.6 M319.9,484.5 h42.6" stroke="#15171A" strokeWidth=".55" opacity=".5"/>
        <ellipse cx="341.2" cy="469.6" rx="11.1" ry="4.3" fill="none" stroke="#F26A21" strokeWidth=".8" opacity="0.9"/>
        <ellipse cx="331.8" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="329.1" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/><ellipse cx="352.6" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#A4A9AD" strokeWidth=".7"/><ellipse cx="349.8" cy="481" rx="9.8" ry="8.5" fill="none" stroke="#6F757A" strokeWidth="1.15"/>
        <rect x="313.9" y="491.2" width="13" height="7.6" rx="1" fill="#15171A"/><text className="v-m-num" x="320.4" y="497.1" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">68</text>
        <path d="M70,490 h312 M70,500 h312" stroke="#15171A" strokeWidth=".8" opacity=".7"/>
        </g>
        <rect x="70" y="70" width="312" height="436" rx="14" fill="none" stroke="#15171A" strokeWidth="1.2"/>
        <rect x="416" y="70" width="60" height="438" rx="15" fill="url(#v-maq-plata)"/>
        <svg className="v-logo--mono" x="427" y="78" width="38" height="38" viewBox="0 0 96 96"><LogoTrazos /></svg>
        <path d="M420,131 q13,-5 27,-2.5 t25,-2.5 v6 q-12,3 -25,1 t-27,3z" fill="#F26A21"/>
        <text x="446" y="126.5" fontSize="6.4" textAnchor="middle" fill="#1A57B8" fontFamily="'Bricolage Grotesque',sans-serif" fontWeight="800" letterSpacing=".5">TODO</text><text x="446" y="134.5" fontSize="6.4" textAnchor="middle" fill="#1A57B8" fontFamily="'Bricolage Grotesque',sans-serif" fontWeight="800" letterSpacing=".2">VENDING CA</text>
        <rect x="424" y="148" width="44" height="19" rx="2.5" fill="#081217"/><g className="v-m-led" fill="#8FE9FF"><rect x="430" y="156" width="5" height="2.4"/><rect x="438" y="156" width="5" height="2.4"/><rect x="446" y="156" width="5" height="2.4"/><rect x="457" y="154" width="2.4" height="6.6"/></g>
        <rect x="437" y="175" width="18" height="18" rx="2" fill="#0C0D0F" opacity=".9"/><path d="M441,184 h10" stroke="#C9CDCB" strokeWidth="1.4"/>
        <rect x="425" y="202" width="42" height="46" rx="4" fill="#C3DC3B" stroke="#15171A" strokeWidth=".9"/><rect x="430" y="207" width="32" height="26" rx="1.5" fill="#EAF2FF" stroke="#15171A" strokeWidth=".7"/><path d="M436,220 l6,-6 5,5 4,-3 5,6" fill="none" stroke="#1F6FD6" strokeWidth="1.2"/><rect x="437" y="237.5" width="18" height="5" rx="2.5" fill="#15171A" opacity=".75"/>
        <circle cx="433" cy="266" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="446" cy="266" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="459" cy="266" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="433" cy="279" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="446" cy="279" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="459" cy="279" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="433" cy="292" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="446" cy="292" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="459" cy="292" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="433" cy="305" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="446" cy="305" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <circle cx="459" cy="305" r="4.4" fill="#15171A" stroke="#1F6FD6" strokeWidth="1.2"/>
        <rect x="429" y="322" width="34" height="38" rx="2.5" fill="#fff" fillOpacity=".85" stroke="#15171A" strokeWidth=".8"/><path d="M437,331 h18 v18 h-18z M437,340 h18 M446,331 v18" fill="none" stroke="#15171A" strokeWidth=".7" opacity=".7"/>
        <circle cx="436" cy="380" r="7" fill="#15171A"/><circle cx="456" cy="380" r="7" fill="#15171A"/><path d="M452,380 h8" stroke="#C9CDCB" strokeWidth="1.6"/>
        <g clipPath="url(#v-maq-col)"><path d="M414,402 Q430,398.4 446,402 T478,402 L478,412.8 Q462,416.40000000000003 446,412.8 T414,412.8Z" fill="#F26A21"/><path d="M414,412.5 Q430,408.9 446,412.5 T478,412.5 L478,423.3 Q462,426.90000000000003 446,423.3 T414,423.3Z" fill="#1F6FD6"/><path d="M414,423 Q430,419.4 446,423 T478,423 L478,433.8 Q462,437.40000000000003 446,433.8 T414,433.8Z" fill="#F26A21"/><path d="M414,433.5 Q430,429.9 446,433.5 T478,433.5 L478,444 Q462,447.6 446,444 T414,444Z" fill="#1F6FD6"/></g>
        <rect x="416" y="70" width="60" height="438" rx="15" fill="none" stroke="#15171A" strokeWidth="1.1"/>
        <rect x="92" y="540" width="290" height="80" rx="17" fill="#0D0E10" stroke="#8A9096" strokeWidth="1.2"/><rect x="100" y="548" width="274" height="64" rx="11" fill="none" stroke="#fff" strokeWidth=".7" opacity=".22"/>
        <path d="M154,568 h22 v12 l-11,9 -11,-9z" fill="none" stroke="#8A9096" strokeWidth="1.1"/>
        <path d="M298,568 h22 v12 l-11,9 -11,-9z" fill="none" stroke="#8A9096" strokeWidth="1.1"/>
        <rect x="431" y="586" width="30" height="26" rx="3" fill="#0D0E10" stroke="#8A9096" strokeWidth="1"/><rect x="438" y="594" width="16" height="11" rx="1.5" fill="none" stroke="#8A9096" strokeWidth=".7" opacity=".7"/>
        <g className="v-m-guias"><path d="M468,157 H500" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><path d="M502,157 H598" fill="none" stroke="var(--tinta)" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><circle cx="468" cy="157" r="2.6" fill="#15171A" stroke="#fff" strokeWidth=".9"/><path d="M467,224 H500" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><path d="M502,224 H598" fill="none" stroke="var(--tinta)" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><circle cx="467" cy="224" r="2.6" fill="#15171A" stroke="#fff" strokeWidth=".9"/><path d="M464,286 H500" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><path d="M502,286 H598" fill="none" stroke="var(--tinta)" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><circle cx="464" cy="286" r="2.6" fill="#15171A" stroke="#fff" strokeWidth=".9"/><path d="M473,423 H500" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><path d="M502,423 H598" fill="none" stroke="var(--tinta)" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><circle cx="473" cy="423" r="2.6" fill="#15171A" stroke="#fff" strokeWidth=".9"/><path d="M382,560 H500" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><path d="M502,560 H598" fill="none" stroke="var(--tinta)" strokeWidth=".8" strokeDasharray="1 3.2" strokeLinecap="round"/><circle cx="382" cy="560" r="2.6" fill="#15171A" stroke="#fff" strokeWidth=".9"/></g>
    </svg>
  );
}
