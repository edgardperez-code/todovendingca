// Ubicaciones (diseño Vitrina): tipos de espacio como una bandeja de seis
// casillas con riel plateado, y la lista de ubicaciones actuales con contador LED.
import { ChipLed, Etiqueta, Icono, type NombreIcono } from "@/components/vitrina";

interface TipoDeEspacio {
  id: string;
  name: string;
  type: string;
  icon: NombreIcono;
  description: string;
}

const locationTypes: TipoDeEspacio[] = [
  {
    id: "1",
    name: "Centros empresariales",
    type: "Oficinas",
    icon: "edificio",
    description: "Las cafeterías y comedores suelen tener horarios limitados. Nuestras máquinas complementan perfectamente.",
  },
  {
    id: "2",
    name: "Clínicas y hospitales",
    type: "Salud",
    icon: "salud",
    description: "Esenciales para pacientes, familiares y personal en turnos largos, disponibles fuera de horario.",
  },
  {
    id: "3",
    name: "Universidades y colegios",
    type: "Educación",
    icon: "birrete",
    description: "Complementan cafeterías llenas en horas pico, ofreciendo opciones rápidas entre clases.",
  },
  {
    id: "4",
    name: "Gimnasios y deportivos",
    type: "Deportes",
    icon: "pesa",
    description: "Hidratación y snacks accesibles para después del entrenamiento, sin altos costos.",
  },
  {
    id: "5",
    name: "Centros comerciales",
    type: "Comercio",
    icon: "bolsa",
    description: "Reducen tiempos de espera y ofrecen variedad como complemento en áreas de alto tráfico.",
  },
  {
    id: "6",
    name: "Terminales de transporte",
    type: "Transporte",
    icon: "avion",
    description: "Ideales para viajeros con poco tiempo o presupuestos ajustados que necesitan opciones rápidas.",
  },
];

const currentLocations = [
  {
    name: "Clínica Anzoátegui",
    description: "Máquina de snacks y bebidas para pacientes, familiares y personal médico.",
    type: "Clínica",
  },
  {
    name: "Centro Empresarial Colón",
    description: "Snacks y bebidas preferidos para los profesionales del centro empresarial.",
    type: "Oficinas",
  },
  {
    name: "Centro Empresarial Oleus",
    description: "Soluciones de vending para profesionales y visitantes del centro empresarial.",
    type: "Oficinas",
  },
  {
    name: "Colegio Manglar",
    description: "Snacks y bebidas saludables para estudiantes y personal educativo.",
    type: "Educación",
  },
  {
    name: "Clínica Zambrano",
    description: "Opciones de snacks y bebidas disponibles las 24 horas para pacientes y visitantes.",
    type: "Clínica",
  },
  {
    name: "Lion Gym",
    description: "Gran variedad de bebidas energéticas, barras de proteínas y más para potenciar tus entrenamientos en Lechería.",
    type: "Deportes",
  },
  {
    name: "Cancha 3x3 Parque Caribe",
    description: "Snacks, barras de proteínas, bebidas refrescantes y energéticas en la cancha de básquet 3x3 del eje costero Playa Cangrejo, Lechería.",
    type: "Deportes",
  },
];

// Cómo se nombra cada tipo en el desglose: [uno, varios].
const NOMBRE_DE_TIPO: Record<string, [string, string]> = {
  "Clínica": ["Clínica", "Clínicas"],
  "Oficinas": ["Centro empresarial", "Centros empresariales"],
  "Educación": ["Colegio", "Colegios"],
  "Deportes": ["Espacio deportivo", "Espacios deportivos"],
};

// El contador y el desglose salen de la lista real, no de cifras escritas a mano.
const totalUbicaciones = currentLocations.length;
const desglosePorTipo = currentLocations.reduce<{ tipo: string; cuenta: number }[]>((lista, ubicacion) => {
  const fila = lista.find((f) => f.tipo === ubicacion.type);
  if (fila) fila.cuenta += 1;
  else lista.push({ tipo: ubicacion.type, cuenta: 1 });
  return lista;
}, []);

function nombreDeTipo(tipo: string, cuenta: number): string {
  const nombres = NOMBRE_DE_TIPO[tipo];
  if (!nombres) return tipo;
  return cuenta === 1 ? nombres[0] : nombres[1];
}

// Estilos propios de la sección (medidas y cortes de la maqueta).
const ESTILOS = `
.ubi-tipos{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));background:var(--blanco);border:1px solid var(--linea2);border-radius:20px;overflow:hidden;box-shadow:0 30px 50px -44px rgba(var(--sombra-rgb),.5)}
.ubi-tipo{display:flex;flex-direction:column;padding:26px 18px 0;border-right:1px solid var(--linea);transition:background-color .2s}
.ubi-tipo:last-child{border-right:0}
.ubi-tipo:hover{background:var(--papel2)}
.ubi-tipo .v-ic{width:30px;height:30px;stroke-width:1.3;color:var(--azul-t);margin-bottom:18px}
.ubi-tipo:nth-child(even) .v-ic{color:var(--naranja-h)}
.ubi-tipo h3{font-size:1.08rem;font-weight:700;line-height:1.14;letter-spacing:-.015em}
.ubi-tipo p{margin:9px 0 22px;font-size:14px;line-height:1.5;color:var(--tinta2)}
.ubi-tipo__r{display:flex;align-items:center;gap:8px;height:34px;margin:auto -18px 0;padding:0 18px;background:linear-gradient(180deg,var(--riel-a),var(--riel-b) 55%,var(--riel-c));border-top:1px solid var(--riel-borde);font:500 10.5px/1 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--sobre-plata)}
.ubi-tipo__r::before{content:"";width:7px;height:7px;flex:none;border-radius:50%;background:var(--azul)}
.ubi-tipo:nth-child(even) .ubi-tipo__r::before{background:var(--naranja)}
@media (max-width:1139px){
  .ubi-tipos{grid-template-columns:repeat(3,minmax(0,1fr))}
  .ubi-tipo:nth-child(3n){border-right:0}
  .ubi-tipo{padding-inline:22px}
  .ubi-tipo__r{margin-inline:-22px;padding-inline:22px}
}
@media (max-width:699px){
  .ubi-tipos{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ubi-tipo:nth-child(3n){border-right:1px solid var(--linea)}
  .ubi-tipo:nth-child(2n){border-right:0}
}
@media (max-width:479px){
  .ubi-tipos{grid-template-columns:minmax(0,1fr)}
  .ubi-tipo,.ubi-tipo:nth-child(3n){border-right:0}
  .ubi-tipo{display:grid;grid-template-columns:30px minmax(0,1fr);column-gap:16px;padding:20px 18px 0}
  .ubi-tipo .v-ic{grid-row:1/3;margin:2px 0 0}
  .ubi-tipo p{grid-column:2;margin:6px 0 18px}
  .ubi-tipo__r{grid-column:1/-1;margin:0 -18px;padding-inline:18px;height:30px}
}
.ubi-act{margin-top:clamp(56px,8vw,104px);display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(24px,5vw,72px);align-items:start}
.ubi-act__izq{position:sticky;top:104px}
.ubi-act h3{font-size:clamp(1.6rem,3vw,2.3rem)}
.ubi-cuenta{display:inline-grid;grid-template-columns:auto auto;align-items:center;gap:14px;margin-top:26px;padding:10px 18px 10px 10px;border-radius:16px}
.ubi-cuenta .v-led{padding:10px 12px 7px;font-size:2.3rem}
.ubi-cuenta b{font:500 11px/1.3 var(--font-mono);letter-spacing:.1em;text-transform:uppercase}
.ubi-act__r{margin-top:22px;border-top:1px solid var(--linea2);max-width:320px}
.ubi-act__r li{display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid var(--linea);font-size:14.5px;color:var(--tinta2)}
.ubi-act__r b{min-width:1.2em;font:600 13px/1 var(--font-mono);color:var(--azul-t)}
.ubi-lista{border-top:1.5px solid var(--tinta)}
.ubi-lista li{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 16px;align-items:baseline;padding:18px 0 18px 28px;border-bottom:1px solid var(--linea)}
.ubi-lista li::before{content:"";position:absolute;left:2px;top:25px;width:9px;height:9px;border-radius:50%;border:2px solid var(--azul);background:var(--papel)}
.ubi-lista li:nth-child(even)::before{border-color:var(--naranja)}
.ubi-lista h4{font:700 1.14rem/1.2 var(--font-display);letter-spacing:-.015em}
.ubi-cat{font:500 10.5px/1 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--tinta2);padding:5px 9px;border:1px solid var(--linea2);border-radius:999px;background:var(--papel2);white-space:nowrap}
.ubi-lista p{grid-column:1/-1;font-size:14.5px;line-height:1.5;color:var(--tinta2);max-width:62ch}
@media (max-width:999px){
  .ubi-act{grid-template-columns:minmax(0,1fr)}
  .ubi-act__izq{position:static;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 24px;align-items:end}
  .ubi-act__izq .v-etq{grid-column:1/-1}
  .ubi-cuenta{margin-top:0}
  .ubi-act__r{display:none}
}
@media (max-width:560px){
  .ubi-act__izq{grid-template-columns:minmax(0,1fr)}
  .ubi-cuenta{margin-top:20px;justify-self:start}
}
@media (max-width:359px){
  .ubi-lista li{grid-template-columns:minmax(0,1fr)}
  .ubi-cat{justify-self:start}
}
@media (prefers-reduced-motion:reduce){
  .ubi-tipo{transition:none}
}
`;

export function LocationsSection() {
  return (
    <section id="ubicaciones" className="v-sec" data-testid="section-locations">
      <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />
      <div className="v-cont">
        <div className="v-cab-sec">
          <div>
            <Etiqueta>Dónde estamos</Etiqueta>
            <h2 data-speakable className="v-h2">
              Complementando <em className="n">espacios</em>
            </h2>
          </div>
          <p className="v-lead">
            Nuestra filosofía se basa en complementar los servicios existentes, no en competir con ellos.
            Transformamos cada espacio en una experiencia más conveniente.
          </p>
        </div>

        {/* Tipos de espacio */}
        <ul className="ubi-tipos">
          {locationTypes.map((tipo) => (
            <li key={tipo.id} className="ubi-tipo">
              <Icono nombre={tipo.icon} />
              <h3>{tipo.name}</h3>
              <p>{tipo.description}</p>
              <span className="ubi-tipo__r">{tipo.type}</span>
            </li>
          ))}
        </ul>

        {/* Ubicaciones actuales */}
        <div className="ubi-act">
          <div className="ubi-act__izq">
            <p className="v-etq">
              <ChipLed>Aquí estamos</ChipLed>
            </p>
            <h3 className="v-tit">Nuestras ubicaciones actuales</h3>
            <p className="ubi-cuenta v-plata">
              <span className="v-led" aria-hidden="true">
                {String(totalUbicaciones).padStart(2, "0")}
              </span>
              <b aria-hidden="true">
                {totalUbicaciones === 1 ? "Ubicación" : "Ubicaciones"}
                <br />
                en la lista
              </b>
              <span className="sr-only">
                {totalUbicaciones} {totalUbicaciones === 1 ? "ubicación" : "ubicaciones"}
              </span>
            </p>
            <ul className="ubi-act__r" aria-label="Por tipo de espacio">
              {desglosePorTipo.map((fila) => (
                <li key={fila.tipo}>
                  <b>{fila.cuenta}</b>
                  {nombreDeTipo(fila.tipo, fila.cuenta)}
                </li>
              ))}
            </ul>
          </div>
          <ol className="ubi-lista">
            {currentLocations.map((ubicacion) => (
              <li key={ubicacion.name}>
                <h4>{ubicacion.name}</h4>
                <span className="ubi-cat">{ubicacion.type}</span>
                <p>{ubicacion.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
