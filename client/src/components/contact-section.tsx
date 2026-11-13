// Contacto (diseño Vitrina): la gaveta de retiro de la máquina. Bloque de
// gabinete oscuro con los datos a la izquierda y el formulario, en papel, a la
// derecha. El envío (/api/contact), la validación y los avisos no cambian.
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { Etiqueta, Icono, type NombreIcono } from "@/components/vitrina";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";

const contactFormSchema = insertContactMessageSchema.extend({
  name: insertContactMessageSchema.shape.name.min(2, "El nombre debe tener al menos 2 caracteres"),
  email: insertContactMessageSchema.shape.email.email("Por favor ingresa un email valido"),
  message: insertContactMessageSchema.shape.message.min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type ContactFormData = InsertContactMessage;

interface DatoDeContacto {
  icon: NombreIcono;
  label: string;
  value: string;
  href: string | null;
  /** data-testid del enlace (los mismos de siempre, sin tildes). */
  testId: string | null;
}

const contactInfo: DatoDeContacto[] = [
  {
    icon: "tel",
    label: "Teléfono",
    value: "+58 414-616-4177",
    href: "tel:+584146164177",
    testId: "link-contact-telefono",
  },
  {
    icon: "correo",
    label: "Email",
    value: "todovendingca@gmail.com",
    href: "mailto:todovendingca@gmail.com",
    testId: "link-contact-email",
  },
  {
    icon: "pin",
    label: "Ubicación",
    value: "Lechería, Anzoátegui",
    href: null,
    testId: null,
  },
];

// Estilos propios de la sección (medidas y cortes de la maqueta). La gaveta es
// "máquina": sus colores no cambian con el tema; el formulario sí usa los
// tokens de papel y tinta.
const ESTILOS = `
.gav{background:var(--gabinete);color:var(--sobre-gabinete);border:1px solid var(--gabinete-borde);border-radius:36px;padding:14px;box-shadow:0 60px 80px -60px rgba(var(--sombra-rgb),.7)}
.gav__in{border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:clamp(22px,4vw,56px)}
.gav__boca{display:flex;justify-content:space-around;padding-bottom:clamp(20px,3vw,36px);color:rgba(255,255,255,.4)}
.gav__boca svg{width:34px;height:32px;fill:none;stroke:currentColor;stroke-width:1.3}
.gav__g{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(32px,5vw,72px);align-items:stretch}
.gav .v-etq{color:#B8BDC3}
.gav .v-h2{color:#fff}
.gav .v-h2 em.n{color:#FF9A5C}
.gav .v-lead{color:#C6CACF;margin-top:20px}
.gav-datos{margin-top:32px;border-top:1px solid rgba(255,255,255,.18)}
.gav-datos li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:0 14px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.18)}
.gav-datos .v-ic{width:22px;height:22px;grid-row:1/3;align-self:center;color:#FF9A5C}
.gav-datos small{padding-top:5px;font:500 11px/1.2 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:#A9AEB4}
.gav-datos a,.gav-datos b{display:block;padding:7px 0 9px;font-weight:600;font-size:1.06rem;line-height:1.5;color:#fff;text-decoration:none;overflow-wrap:anywhere}
.gav-datos a:hover{text-decoration:underline;text-underline-offset:4px}
.gav-redes{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.gav-redes p{flex-basis:100%;font-weight:600;font-size:15px}
.gav-redes a{display:inline-flex;align-items:center;gap:9px;min-height:46px;padding:0 16px;border:1px solid rgba(255,255,255,.35);border-radius:10px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;transition:background-color .15s,color .15s}
.gav-redes a:hover{background:#fff;color:#15171A}
.gav-redes a:first-of-type{border-color:#7FB2FF}
.gav-redes .v-ic{width:18px;height:18px}
.gav-aviso{margin-top:24px;padding:16px 18px;border-radius:14px;background:rgba(255,255,255,.07);font-size:14.5px;line-height:1.5;color:#C6CACF}
.gav-aviso strong{display:block;color:#fff;margin-bottom:3px}
.gav-form{--foco:#1F6FD6;display:flex;flex-direction:column;background:var(--papel);color:var(--tinta);border-radius:18px;padding:clamp(20px,3vw,36px)}
.dark .gav-form{--foco:#9CC4FF}
.gav-form h3{font-size:1.5rem;font-weight:700;line-height:1.02;letter-spacing:-.025em;margin-bottom:22px}
.gav-form form{flex:1;display:flex;flex-direction:column}
.gav-form__g{flex:1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:auto auto minmax(0,1fr);gap:16px}
.gav-campo{display:flex;flex-direction:column;gap:6px}
.gav-campo--a{grid-column:1/-1}
.gav-campo label{font:500 11.5px/1.2 var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--tinta2)}
.gav-campo input,.gav-campo textarea{width:100%;min-height:50px;padding:12px 14px;border:1.5px solid var(--tinta3);border-radius:10px;background:var(--blanco);color:var(--tinta);font-size:16px;transition:border-color .15s,box-shadow .15s}
.gav-campo textarea{flex:1;min-height:124px;resize:vertical;line-height:1.5}
.gav-campo input::placeholder,.gav-campo textarea::placeholder{color:var(--tinta3);opacity:1}
.gav-campo input:hover,.gav-campo textarea:hover{border-color:var(--tinta2)}
.gav-campo input:focus-visible,.gav-campo textarea:focus-visible{outline:none;border-color:var(--foco);box-shadow:0 0 0 4px color-mix(in srgb,var(--foco) 30%,transparent)}
.gav-campo input[aria-invalid="true"],.gav-campo textarea[aria-invalid="true"]{border-color:hsl(var(--destructive))}
.gav-campo__error{font-size:13.5px;line-height:1.4;font-weight:600}
.gav-form .v-btn{width:100%;margin-top:20px}
.gav-listo{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 0}
.gav-listo__ic{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--azul-velo);color:var(--azul-t);margin-bottom:16px}
.gav-listo__t{font-size:1.4rem;margin-bottom:8px}
.gav-listo__p{color:var(--tinta2);max-width:36ch}
.gav-listo .v-btn{width:auto}
@media (max-width:899px){
  .gav__g{grid-template-columns:minmax(0,1fr)}
  .gav{border-radius:28px;padding:10px;margin-inline:calc(var(--pad) * -.5)}
  .gav__in{border-radius:19px}
}
@media (max-width:520px){
  .gav-form__g{grid-template-columns:minmax(0,1fr);grid-template-rows:none}
}
@media (max-width:359px){
  .gav-datos a,.gav-datos b{font-size:.88rem}
  .gav-campo input,.gav-campo textarea{padding-left:11px;padding-right:11px}
}
@media (prefers-reduced-motion:reduce){
  .gav-redes a,.gav-campo input,.gav-campo textarea{transition:none}
}
`;

export function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Mensaje enviado!",
        description: "Nos pondremos en contacto contigo pronto.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <section id="contacto" className="v-sec v-sec--pegada" data-testid="section-contact">
      <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />
      <div className="v-cont">
        <div className="gav v-oscuro">
          <div className="gav__in">
            {/* Las dos flechas de la boca de la gaveta */}
            <div className="gav__boca" aria-hidden="true">
              <svg viewBox="0 0 34 32" focusable="false">
                <path d="M5,4 h24 v14 l-12,10 -12,-10z" />
              </svg>
              <svg viewBox="0 0 34 32" focusable="false">
                <path d="M5,4 h24 v14 l-12,10 -12,-10z" />
              </svg>
            </div>

            <div className="gav__g">
              {/* Datos de contacto */}
              <div>
                <Etiqueta>Contacto</Etiqueta>
                <h2 className="v-h2">
                  Hablemos de tu <em className="n">proyecto</em>
                </h2>
                <p className="v-lead">
                  Estamos listos para ayudarte a mejorar la experiencia en tu negocio con nuestras
                  soluciones de vending.
                </p>

                <ul className="gav-datos">
                  {contactInfo.map((info) => (
                    <li key={info.label}>
                      <Icono nombre={info.icon} />
                      <small>{info.label}</small>
                      {info.href ? (
                        <a href={info.href} data-testid={info.testId ?? undefined}>
                          {info.value}
                        </a>
                      ) : (
                        <b>{info.value}</b>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="gav-redes">
                  <p>Síguenos en redes</p>
                  <a
                    href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contactar por WhatsApp"
                  >
                    <Icono nombre="whatsapp" />
                    WhatsApp
                  </a>
                  <a href="https://instagram.com/todovendingca" target="_blank" rel="noopener noreferrer">
                    <Icono nombre="instagram" />
                    Instagram
                  </a>
                  <a href="https://tiktok.com/@todo.vending" target="_blank" rel="noopener noreferrer">
                    <Icono nombre="tiktok" />
                    TikTok
                  </a>
                </div>

                <p className="gav-aviso">
                  <strong>Instalación sin costo</strong>
                  Recuerda que la instalación de nuestras máquinas es completamente gratuita. Sin
                  compromisos, sin costos ocultos.
                </p>
              </div>

              {/* Formulario */}
              <div className="gav-form">
                <h3>Envíanos un mensaje</h3>
                {isSubmitted ? (
                  <div className="gav-listo" role="status">
                    <span className="gav-listo__ic" aria-hidden="true">
                      <CheckCircle className="w-8 h-8" />
                    </span>
                    <p className="v-tit gav-listo__t">¡Mensaje enviado!</p>
                    <p className="gav-listo__p">
                      Gracias por contactarnos. Nos pondremos en contacto contigo pronto.
                    </p>
                    <button type="button" className="v-btn" onClick={() => setIsSubmitted(false)}>
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <div className="gav-form__g">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="gav-campo space-y-0">
                              <FormLabel>Nombre *</FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  autoComplete="name"
                                  placeholder="Tu nombre"
                                  {...field}
                                  data-testid="input-name"
                                />
                              </FormControl>
                              <FormMessage className="gav-campo__error" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="gav-campo space-y-0">
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <input
                                  type="email"
                                  autoComplete="email"
                                  placeholder="tu@email.com"
                                  {...field}
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage className="gav-campo__error" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="gav-campo space-y-0">
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  inputMode="tel"
                                  autoComplete="tel"
                                  placeholder="+58 414-XXX-XXXX"
                                  {...field}
                                  value={field.value ?? ""}
                                  data-testid="input-phone"
                                />
                              </FormControl>
                              <FormMessage className="gav-campo__error" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem className="gav-campo space-y-0">
                              <FormLabel>Empresa</FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  autoComplete="organization"
                                  placeholder="Nombre de tu empresa"
                                  {...field}
                                  value={field.value ?? ""}
                                  data-testid="input-company"
                                />
                              </FormControl>
                              <FormMessage className="gav-campo__error" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="gav-campo gav-campo--a space-y-0">
                              <FormLabel>Mensaje *</FormLabel>
                              <FormControl>
                                <textarea
                                  placeholder="Cuéntanos sobre tu espacio y qué tipo de máquina te gustaría..."
                                  rows={4}
                                  {...field}
                                  data-testid="input-message"
                                />
                              </FormControl>
                              <FormMessage className="gav-campo__error" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <button
                        type="submit"
                        className="v-btn v-btn--p"
                        disabled={mutation.isPending}
                        data-testid="button-submit-contact"
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Icono nombre="enviar" />
                            Enviar mensaje
                          </>
                        )}
                      </button>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
