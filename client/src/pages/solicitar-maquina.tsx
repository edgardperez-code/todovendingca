import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { PaginaApoyo } from "@/components/pagina-apoyo";
import { CabeceraSeccion } from "@/components/vitrina/etiqueta";
import { Icono } from "@/components/vitrina/iconos";
import { apiRequest } from "@/lib/queryClient";
import { EnlaceInterno } from "@/lib/navegacion";
import { useSEO } from "@/lib/seo";
import { contactoConLimites } from "@shared/schema";
import { BUSINESS_PHONE_DISPLAY, organizationSchema, breadcrumbSchema } from "@/lib/schema";

// Formulario de solicitud de máquina. Usa el mismo /api/contact del inicio
// (guarda el mensaje y avisa por correo); aquí solo se arma un mensaje más
// completo con el tipo de espacio y el tráfico. Solo Lechería.
const TIPOS = [
  "Empresa u oficina",
  "Clínica u hospital",
  "Colegio o universidad",
  "Gimnasio o espacio deportivo",
  "Hotel o posada",
  "Centro comercial",
  "Industria o planta",
  "Otro",
];
const PERSONAS = ["Menos de 50", "Entre 50 y 150", "Entre 150 y 500", "Más de 500"];
const MAQUINAS = ["Snacks y bebidas", "Café (Café Oriente)", "Vending deportivo", "No sé, que me recomienden"];

const CSS_FORM = `
.sm-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 20px;background:var(--papel);border:1px solid var(--linea);border-radius:22px;padding:clamp(20px,3vw,36px)}
.sm-campo{display:flex;flex-direction:column;gap:6px}
.sm-campo--a{grid-column:1/-1}
.sm-campo label{font:500 11.5px/1.2 var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--tinta2)}
.sm-campo input,.sm-campo select,.sm-campo textarea{width:100%;min-height:50px;padding:12px 14px;border:1.5px solid var(--tinta3);border-radius:10px;background:var(--blanco);color:var(--tinta);font-size:16px}
.sm-campo textarea{min-height:110px;resize:vertical;line-height:1.5}
.sm-campo input:focus-visible,.sm-campo select:focus-visible,.sm-campo textarea:focus-visible{outline:none;border-color:#1F6FD6;box-shadow:0 0 0 4px rgba(31,111,214,.3)}
.sm-error{grid-column:1/-1;margin:0;color:hsl(var(--destructive));font-weight:600}
.sm-pie{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:14px}
.sm-pie small{color:var(--tinta2)}
.sm-ok{background:var(--papel);border:1px solid var(--linea);border-radius:22px;padding:clamp(24px,4vw,44px)}
.sm-ok h2{font-family:var(--font-display);font-weight:700;font-size:clamp(1.6rem,3vw,2.2rem);margin:0 0 10px}
.sm-ok p{color:var(--tinta2);margin:0 0 22px;max-width:60ch}
@media (max-width:640px){.sm-form{grid-template-columns:minmax(0,1fr)}}
`;

interface Datos {
  nombre: string;
  telefono: string;
  email: string;
  lugar: string;
  tipo: string;
  personas: string;
  maquina: string;
  direccion: string;
  comentarios: string;
}

const VACIO: Datos = {
  nombre: "",
  telefono: "",
  email: "",
  lugar: "",
  tipo: TIPOS[0],
  personas: PERSONAS[1],
  maquina: MAQUINAS[3],
  direccion: "",
  comentarios: "",
};

function mensajeDe(d: Datos): string {
  return [
    "Solicitud de máquina expendedora (formulario /solicitar-maquina)",
    `Tipo de espacio: ${d.tipo}`,
    `Personas que pasan por día: ${d.personas}`,
    `Máquina de interés: ${d.maquina}`,
    `Dirección en Lechería: ${d.direccion.trim() || "(no indicada)"}`,
    d.comentarios.trim() ? `Comentarios: ${d.comentarios.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function SolicitarMaquina() {
  const [d, setD] = useState<Datos>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const enviar = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/contact", {
        name: d.nombre.trim(),
        email: d.email.trim(),
        phone: d.telefono.trim(),
        company: d.lugar.trim() || null,
        message: mensajeDe(d),
      }),
    onError: (e) =>
      setError(
        e instanceof Error && e.message.startsWith("429")
          ? `Enviaste varias solicitudes seguidas. Espera unos minutos o escríbenos por WhatsApp al ${BUSINESS_PHONE_DISPLAY}.`
          : e instanceof Error && e.message.startsWith("400")
            ? "Revisa tus datos: el correo o algún campo no es válido."
            : `No pudimos enviar la solicitud. Inténtalo de nuevo o escríbenos por WhatsApp al ${BUSINESS_PHONE_DISPLAY}.`,
      ),
  });

  useSEO({
    title: "Solicitar una Máquina Expendedora Gratis en Lechería | Todo Vending CA",
    description:
      "Pide una máquina expendedora para tu empresa, clínica, colegio, gimnasio u hotel en Lechería. Instalación gratuita, reposición y mantenimiento incluidos.",
    path: "/solicitar-maquina",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Solicitar una máquina", path: "/solicitar-maquina" },
      ]),
    ],
  });

  const campo = (k: keyof Datos) => ({
    value: d[k],
    onChange: (e: { target: { value: string } }) => setD((x) => ({ ...x, [k]: e.target.value })),
  });

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (d.nombre.trim().length < 2) return setError("Escribe tu nombre.");
    // La misma regla de correo que aplica el servidor.
    if (!contactoConLimites.shape.email.safeParse(d.email).success) return setError("Escribe un correo válido.");
    if (d.telefono.replace(/\D/g, "").length < 7) return setError("Escribe un teléfono para contactarte.");
    enviar.mutate();
  };

  const textoWhatsapp = encodeURIComponent(
    `Hola, soy ${d.nombre.trim() || "..."} y quiero una máquina expendedora para ${d.lugar.trim() || "mi negocio"} en Lechería.`,
  );

  return (
    <PaginaApoyo
      etiqueta="Solicitar una máquina"
      titulo={
        <>
          Pide tu máquina, <em className="n">es gratis</em>
        </>
      }
      lead="Cuéntanos sobre tu espacio y te contactamos para evaluarlo sin compromiso. La instalación, la reposición y el mantenimiento corren por nuestra cuenta. Por ahora atendemos espacios en Lechería."
    >
      <style dangerouslySetInnerHTML={{ __html: CSS_FORM }} />
      <section className="v-sec v-sec--2">
        <div className="v-cont">
          {enviar.isSuccess ? (
            <div className="sm-ok" role="status" data-testid="solicitud-enviada">
              <h2>¡Recibimos tu solicitud!</h2>
              <p>
                Te contactaremos pronto para coordinar la evaluación de tu espacio. Si quieres adelantar, escríbenos por
                WhatsApp.
              </p>
              <div className="vs-hero__cta" style={{ marginTop: 0 }}>
                <a
                  className="v-btn v-btn--p"
                  href={`https://wa.me/584146164177?text=${textoWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icono nombre="whatsapp" />
                  Escribir por WhatsApp
                </a>
                <EnlaceInterno className="v-btn v-btn--s" href="/como-funciona">
                  Ver cómo funciona
                </EnlaceInterno>
              </div>
            </div>
          ) : (
            <>
              <CabeceraSeccion
                etiqueta="Formulario"
                titulo={
                  <>
                    Cuéntanos sobre tu <em>espacio</em>
                  </>
                }
                lead="Toma un minuto. Los campos con * son obligatorios."
              />
              <form className="sm-form" onSubmit={alEnviar} noValidate data-testid="form-solicitar">
                <div className="sm-campo">
                  <label htmlFor="sm-nombre">Nombre *</label>
                  <input id="sm-nombre" autoComplete="name" maxLength={120} {...campo("nombre")} />
                </div>
                <div className="sm-campo">
                  <label htmlFor="sm-telefono">Teléfono / WhatsApp *</label>
                  <input id="sm-telefono" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} {...campo("telefono")} />
                </div>
                <div className="sm-campo">
                  <label htmlFor="sm-email">Correo *</label>
                  <input id="sm-email" type="email" autoComplete="email" maxLength={200} {...campo("email")} />
                </div>
                <div className="sm-campo">
                  <label htmlFor="sm-lugar">Nombre del lugar</label>
                  <input id="sm-lugar" autoComplete="organization" maxLength={160} placeholder="Empresa, clínica, colegio…" {...campo("lugar")} />
                </div>
                <div className="sm-campo">
                  <label htmlFor="sm-tipo">Tipo de espacio</label>
                  <select id="sm-tipo" {...campo("tipo")}>
                    {TIPOS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sm-campo">
                  <label htmlFor="sm-personas">Personas que pasan por día</label>
                  <select id="sm-personas" {...campo("personas")}>
                    {PERSONAS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sm-campo">
                  <label htmlFor="sm-maquina">Máquina de interés</label>
                  <select id="sm-maquina" {...campo("maquina")}>
                    {MAQUINAS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sm-campo">
                  <label htmlFor="sm-direccion">Dirección en Lechería</label>
                  <input id="sm-direccion" autoComplete="street-address" maxLength={300} {...campo("direccion")} />
                </div>
                <div className="sm-campo sm-campo--a">
                  <label htmlFor="sm-comentarios">Comentarios</label>
                  <textarea id="sm-comentarios" maxLength={3000} placeholder="Horario del lugar, productos que te gustaría, dudas…" {...campo("comentarios")} />
                </div>
                {error && (
                  <p className="sm-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="sm-pie">
                  <button type="submit" className="v-btn v-btn--p" disabled={enviar.isPending} data-testid="button-enviar-solicitud">
                    {enviar.isPending ? "Enviando…" : "Enviar solicitud"}
                    <Icono nombre="enviar" />
                  </button>
                  <small>
                    ¿Prefieres hablar ya?{" "}
                    <a href={`https://wa.me/584146164177?text=${textoWhatsapp}`} target="_blank" rel="noopener noreferrer">
                      Escríbenos por WhatsApp
                    </a>
                    .
                  </small>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </PaginaApoyo>
  );
}
