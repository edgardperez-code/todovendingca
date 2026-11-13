// Servicios como vitrina: cada servicio es un producto en su bandeja (espiral,
// código y riel plateado) y, al lado, la columna de control con pantalla LED y
// teclado. Todo el contenido sale ya visible desde el servidor; el teclado y el
// resaltado son un extra que se activa al cargar el JavaScript.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Service } from "@shared/schema";
import {
  ColumnaControl,
  Etiqueta,
  Icono,
  PantallaLed,
  RielSeleccion,
  TecladoSeleccion,
  type NombreIcono,
  type TeclaSeleccion,
} from "@/components/vitrina";

// "corto" es el nombre que cabe en el riel plateado de la bandeja.
type Servicio = Service & { corto: string };

const services: Servicio[] = [
  {
    id: "1",
    title: "Máquinas de snacks",
    corto: "Snacks",
    description: "Amplia variedad de snacks, galletas, chocolates y opciones saludables para todos los gustos.",
    icon: "cookie",
    features: ["Marcas reconocidas", "Opciones saludables", "Productos frescos"],
  },
  {
    id: "2",
    title: "Máquinas de bebidas",
    corto: "Bebidas",
    description: "Refrescos, jugos, agua y bebidas energéticas siempre frías y listas para disfrutar.",
    icon: "droplets",
    features: ["Bebidas frías", "Gran variedad", "Precios accesibles"],
  },
  {
    id: "3",
    title: "Máquinas de café",
    corto: "Café",
    description: "Café gourmet recién preparado, cappuccino, chocolate caliente y más opciones calientes.",
    icon: "coffee",
    features: ["Café gourmet", "Preparación instantánea", "Múltiples sabores"],
  },
  {
    id: "4",
    title: "Instalación profesional",
    corto: "Instalación",
    description: "Instalamos las máquinas en tu ubicación sin ningún costo adicional para ti.",
    icon: "settings",
    features: ["Instalación gratuita", "Configuración incluida", "Capacitación"],
  },
  {
    id: "5",
    title: "Reposición de inventario",
    corto: "Reposición",
    description: "Mantenemos las máquinas siempre abastecidas con productos frescos y variados.",
    icon: "truck",
    features: ["Reposición regular", "Productos frescos", "Sin interrupciones"],
  },
  {
    id: "6",
    title: "Mantenimiento técnico",
    corto: "Mantenimiento",
    description: "Servicio de mantenimiento preventivo y correctivo para asegurar funcionamiento óptimo.",
    icon: "wrench",
    features: ["Soporte técnico", "Respuesta rápida", "Garantía total"],
  },
  {
    id: "7",
    title: "Pagos electrónicos",
    corto: "Pagos",
    description: "Sistemas de pago modernos incluyendo tarjetas, pago móvil y efectivo.",
    icon: "creditcard",
    features: ["Tarjetas", "Pago móvil", "Efectivo"],
  },
  {
    id: "8",
    title: "Monitoreo remoto",
    corto: "Monitoreo",
    description: "Vigilamos el funcionamiento de las máquinas en tiempo real para garantizar disponibilidad.",
    icon: "monitor",
    features: ["Tiempo real", "Alertas automáticas", "Control total"],
  },
];

const iconMap: Record<string, NombreIcono> = {
  cookie: "snack",
  droplets: "bebida",
  coffee: "cafe",
  settings: "instala",
  truck: "camion",
  wrench: "llave",
  creditcard: "tarjeta",
  monitor: "monitor",
};

// Las bandejas se arman solas: cuatro servicios por bandeja y los códigos como
// en una máquina real (10, 12, 14, 16 en la primera; 20, 22… en la segunda).
const POR_BANDEJA = 4;
const NOMBRES_BANDEJA = ["Máquinas", "Servicio"];

interface Casilla {
  servicio: Servicio;
  codigo: string;
}

const casillas: Casilla[] = services.map((servicio, i) => ({
  servicio,
  codigo: String((Math.floor(i / POR_BANDEJA) + 1) * 10 + (i % POR_BANDEJA) * 2),
}));

const bandejas: Casilla[][] = [];
for (let i = 0; i < casillas.length; i += POR_BANDEJA) {
  bandejas.push(casillas.slice(i, i + POR_BANDEJA));
}

const WHATSAPP =
  "https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio";

const REPOSO = { valor: "--", texto: "Elige un servicio" };

// Estilos propios de la sección (prefijo sv-). Medidas y cortes de la maqueta.
// En oscuro el vidrio pasa a tinta de gabinete; el riel sigue plateado.
const ESTILOS = `
.sv-exhib{display:grid;grid-template-columns:minmax(0,1fr) 236px;gap:18px;align-items:stretch}
.sv-vitrina{background:var(--gabinete);border:1px solid var(--gabinete-borde);padding:12px;border-radius:28px;box-shadow:0 50px 70px -50px rgba(var(--sombra-rgb),.6)}
.sv-vidrio{--sv-vidrio:linear-gradient(180deg,#F9FAF8,#EDF0EE);--sv-brillo-a:rgba(255,255,255,.75);--sv-brillo-b:rgba(255,255,255,.55);--sv-sel:rgba(255,255,255,.8);position:relative;height:100%;display:flex;flex-direction:column;border-radius:17px;overflow:hidden;background:var(--sv-vidrio);color:var(--tinta)}
.dark .sv-vidrio{--sv-vidrio:linear-gradient(180deg,#23272D,#191C21);--sv-brillo-a:rgba(255,255,255,.05);--sv-brillo-b:rgba(255,255,255,.035);--sv-sel:rgba(255,255,255,.07)}
.sv-vidrio::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:linear-gradient(112deg,transparent 0 30%,var(--sv-brillo-a) 30% 34%,transparent 34% 36.5%,var(--sv-brillo-b) 36.5% 37.6%,transparent 37.6%)}
.sv-bandeja{position:relative;z-index:1;flex:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:0;padding:0;list-style:none}
.sv-slot{position:relative;display:flex;flex-direction:column;border-right:1px solid var(--linea);cursor:pointer;transition:background-color .25s}
.sv-slot:nth-child(4n){border-right:0}
.sv-slot__c{flex:1;display:flex;flex-direction:column;padding:28px 22px 0}
.sv-slot__p{order:9;align-self:flex-start;position:relative;margin:auto 0 0 4px;padding-top:22px;line-height:0}
.sv-slot__p::after{content:"";position:absolute;left:50%;bottom:-2px;width:68px;height:24px;margin-left:-34px;background:var(--espiral) 50% 50%/68px 24px no-repeat;transition:transform .5s cubic-bezier(.3,1.3,.5,1)}
.sv-slot__ic{width:56px;height:56px;margin-bottom:-3px;stroke-width:1.15;color:var(--tinta);transition:transform .35s cubic-bezier(.3,1.4,.5,1)}
.sv-slot h3{font-family:var(--font-display);font-weight:700;font-size:1.3rem;letter-spacing:-.02em;line-height:1.1;margin:0 0 8px;text-wrap:balance}
.sv-slot p{margin:0;font-size:14.5px;line-height:1.5;color:var(--tinta2)}
.sv-slot__f{margin:14px 0 0;padding:0;list-style:none;font:400 11.5px/1.7 var(--font-mono);color:var(--tinta2)}
.sv-slot__f li{display:block;padding-left:14px;position:relative}
.sv-slot__f li::before{content:"";position:absolute;left:0;top:.78em;width:7px;height:2px;background:var(--naranja)}
.sv-slot:nth-child(even) .sv-slot__f li::before{background:var(--azul)}
.sv-slot--sel{background:var(--sv-sel)}
.sv-slot--sel .sv-slot__ic{transform:translateY(-7px)}
.sv-slot--sel .sv-slot__p::after{transform:scaleX(.82)}
@media (hover:hover){
  .sv-slot:hover{background:var(--sv-sel)}
  .sv-slot:hover .sv-slot__ic{transform:translateY(-7px)}
  .sv-slot:hover .sv-slot__p::after{transform:scaleX(.82)}
  .sv-slot:hover .v-tag{background:var(--naranja);color:#15171A}
}
@media (pointer:coarse){
  .sv-slot .v-riel{height:40px}
}
@media (max-width:1199px){
  .sv-exhib{grid-template-columns:minmax(0,1fr)}
  .sv-bandeja{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sv-slot:nth-child(2n){border-right:0}
  .sv-slot .v-riel{height:40px}
}
@media (max-width:640px){
  .sv-vitrina{padding:8px;border-radius:22px;margin-inline:calc(var(--pad)*-.5)}
  .sv-vidrio{border-radius:15px}
  .sv-vidrio::before{display:none}
  .sv-bandeja{grid-template-columns:minmax(0,1fr)}
  .sv-slot{border-right:0}
  .sv-slot__c{display:grid;grid-template-columns:54px minmax(0,1fr);column-gap:20px;align-items:start;padding:20px 18px 0}
  .sv-slot__p{order:0;grid-column:1;grid-row:1/3;align-self:end;margin:0 0 0 6px;padding-top:0}
  .sv-slot h3{grid-column:2;font-size:1.16rem;margin-bottom:5px}
  .sv-slot p{grid-column:2;font-size:14px;line-height:1.45;padding-bottom:18px}
  .sv-slot__f{display:none}
  .sv-slot .v-riel{padding:0 18px}
  .sv-columna{margin-inline:calc(var(--pad)*-.5)}
}
@media (prefers-reduced-motion:reduce){
  .sv-slot,.sv-slot__ic,.sv-slot__p::after{transition:none}
}
`;

export function ServicesSection() {
  // fijo: código del servicio señalado (clic o teclado). vista: el que está bajo
  // el cursor o con el foco. aviso: mensaje del teclado ("1_", "Código sin servicio").
  const [fijo, setFijo] = useState<string | null>(null);
  const [vista, setVista] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ valor: string; texto: string } | null>(null);
  const bufer = useRef("");
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pararReloj = () => {
    if (reloj.current !== null) {
      clearTimeout(reloj.current);
      reloj.current = null;
    }
  };

  useEffect(() => pararReloj, []);

  const elegir = (codigo: string | null) => {
    pararReloj();
    bufer.current = "";
    setAviso(null);
    setFijo(codigo);
  };

  const alTeclear = (tecla: TeclaSeleccion) => {
    pararReloj();
    if (tecla === "borrar") {
      elegir(null);
      return;
    }
    if (tecla === "siguiente") {
      const actual = casillas.findIndex((c) => c.codigo === fijo);
      elegir(casillas[(actual + 1) % casillas.length].codigo);
      return;
    }
    const marcado = bufer.current + tecla;
    if (marcado.length < 2) {
      bufer.current = marcado;
      setAviso({ valor: `${marcado}_`, texto: "Marca otro dígito" });
      return;
    }
    bufer.current = "";
    if (casillas.some((c) => c.codigo === marcado)) {
      elegir(marcado);
    } else {
      setAviso({ valor: marcado, texto: "Código sin servicio" });
      reloj.current = setTimeout(() => {
        reloj.current = null;
        setAviso(null);
      }, 1600);
    }
  };

  // Con el foco en el teclado de la columna también vale el teclado físico.
  const alPulsarTecla = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) {
      alTeclear(e.key as TeclaSeleccion);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      alTeclear("borrar");
    } else if (e.key === "#") {
      alTeclear("siguiente");
    }
  };

  // Manda lo que está bajo el cursor o el foco; si no, el aviso del teclado; si
  // no, el servicio señalado; y en reposo "--".
  const codigoMostrado = vista ?? (aviso ? null : fijo);
  const mostrada = codigoMostrado ? casillas.find((c) => c.codigo === codigoMostrado) : undefined;
  const pantalla = mostrada ? { valor: mostrada.codigo, texto: mostrada.servicio.title } : (aviso ?? REPOSO);

  return (
    <section id="servicios" className="v-sec" data-testid="section-services">
      <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />
      <div className="v-cont">
        <div className="v-cab-sec">
          <div>
            <Etiqueta>Nuestros servicios</Etiqueta>
            <h2 data-speakable className="v-h2">
              Soluciones <em className="n">completas</em>
            </h2>
          </div>
          <p className="v-lead">
            Ofrecemos un servicio integral que incluye desde la instalación hasta el mantenimiento, para que tú solo te
            preocupes por disfrutar.
          </p>
        </div>

        <div className="sv-exhib">
          <div className="sv-vitrina">
            <div className="sv-vidrio">
              {bandejas.map((bandeja, fila) => (
                <ul key={fila} className="sv-bandeja" aria-label={NOMBRES_BANDEJA[fila] ?? `Bandeja ${fila + 1}`}>
                  {bandeja.map(({ servicio, codigo }) => {
                    const sel = fijo === codigo;
                    return (
                      <li
                        key={servicio.id}
                        className={sel ? "sv-slot sv-slot--sel" : "sv-slot"}
                        data-testid={`card-service-${servicio.id}`}
                        onMouseEnter={() => setVista(codigo)}
                        onMouseLeave={() => setVista(null)}
                        onClick={() => {
                          elegir(sel ? null : codigo);
                          setVista(null);
                        }}
                      >
                        <div className="sv-slot__c">
                          <span className="sv-slot__p" aria-hidden="true">
                            <Icono nombre={iconMap[servicio.icon] ?? "cafe"} className="sv-slot__ic" />
                          </span>
                          <h3>{servicio.title}</h3>
                          <p>{servicio.description}</p>
                          <ul className="sv-slot__f">
                            {servicio.features.map((feature) => (
                              <li key={feature}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                        <RielSeleccion
                          codigo={codigo}
                          activo={sel}
                          boton={{
                            "aria-pressed": sel,
                            "aria-label": `Señalar ${servicio.title}, código ${codigo}`,
                            "data-testid": `button-service-${servicio.id}`,
                            onFocus: () => setVista(codigo),
                            onBlur: () => setVista(null),
                          }}
                        >
                          {servicio.corto}
                        </RielSeleccion>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </div>

          <ColumnaControl className="sv-columna" data-testid="panel-servicios">
            <PantallaLed
              rotulo="Selección"
              valor={pantalla.valor}
              texto={pantalla.texto}
              vivo
              data-testid="pantalla-servicios"
            />
            {/* Envoltorio sin caja propia: solo escucha el teclado físico. */}
            <div className="contents" onKeyDown={alPulsarTecla}>
              <TecladoSeleccion onTecla={alTeclear} />
            </div>
            <p className="v-columna__ayuda" aria-hidden="true">
              Marca un código (por ejemplo 1&nbsp;·&nbsp;4) o toca un servicio
            </p>
            <div className="v-columna__cta">
              <h3>¿Quieres una máquina en tus instalaciones?</h3>
              <p>
                Transforma tu espacio con la conveniencia y variedad de Todo Vending CA. Instalación gratuita y sin
                compromisos.
              </p>
              <a
                className="v-btn v-btn--p"
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-servicios-whatsapp"
              >
                Solicitar información
              </a>
            </div>
          </ColumnaControl>
        </div>
      </div>
    </section>
  );
}
