import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send, CheckCircle, Phone, Mail, MapPin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS, waLink, WA_MESSAGES } from "@shared/site";
import { SectionHeading } from "./section-heading";

const schema = z.object({
  name: z.string().min(2, "Escribe tu nombre"),
  email: z.string().email("Escribe un correo válido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)"),
  origen: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// Textos prellenados según de dónde viene la persona (?origen=...).
const ORIGEN_TEXT: Record<string, { company?: string; message: string }> = {
  "cafe-oriente": { message: "Quiero instalar una estación Café Oriente en mi empresa. " },
  clinicas: { message: "Quiero una máquina expendedora para mi clínica. " },
  gimnasios: { message: "Quiero vending deportivo para mi gimnasio. " },
  empresas: { message: "Quiero vending para mi empresa u oficina. " },
};

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", company: "", message: "", origen: "" },
  });

  // Lee ?origen= en el cliente: así el correo que recibe el dueño dice desde
  // qué página llegó el pedido (Café Oriente, clínicas, etc.).
  useEffect(() => {
    const origen = new URLSearchParams(window.location.search).get("origen");
    if (!origen) return;
    form.setValue("origen", origen);
    const pre = ORIGEN_TEXT[origen];
    if (pre && !form.getValues("message")) form.setValue("message", pre.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/contact", data),
    onSuccess: () => {
      setSent(true);
      form.reset();
      toast({ title: "Mensaje enviado", description: "Te respondemos lo antes posible." });
    },
    onError: () =>
      toast({
        title: "No pudimos enviar el mensaje",
        description: `Escríbenos por WhatsApp al ${BUSINESS.phoneDisplay}.`,
        variant: "destructive",
      }),
  });

  return (
    <section id="contacto" className="py-20 md:py-28" aria-labelledby="contacto-titulo">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Contacto"
              id="contacto-titulo"
              title={
                <>
                  Hablemos de tu <span className="mark-accent">espacio</span>
                </>
              }
              lead="Cuéntanos dónde quieres la máquina y cuánta gente pasa por ahí. Te decimos qué modelo conviene y coordinamos la visita."
            />
            <ul className="reveal mt-8 space-y-4 text-sm">
              <li>
                <a href={waLink(WA_MESSAGES.home)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-12 w-full px-6 text-base sm:w-auto">
                  <SiWhatsapp aria-hidden="true" className="h-5 w-5" />
                  Escribir por WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-orange" />
                <a href={`tel:${BUSINESS.phone}`} className="font-medium hover:text-brand-orange">{BUSINESS.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-orange" />
                <a href={`mailto:${BUSINESS.email}`} className="font-medium hover:text-brand-orange">{BUSINESS.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-brand-orange" />
                <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-brand-orange">
                  {BUSINESS.address.streetAddress}, {BUSINESS.address.addressLocality}, {BUSINESS.address.addressRegion}
                </a>
              </li>
              <li className="text-muted-foreground">{BUSINESS.hours}</li>
            </ul>
          </div>

          <div className="reveal lg:col-span-7">
            <div className="card-soft p-6 md:p-8">
              {sent ? (
                <div className="py-10 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-brand-orange" />
                  <h3 className="mt-4 text-xl font-semibold">Mensaje enviado</h3>
                  <p className="mt-2 text-muted-foreground">Gracias por escribirnos. Te contactamos para coordinar la evaluación.</p>
                  <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
                    <input type="hidden" {...form.register("origen")} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu nombre" autoComplete="name" className="h-11" {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="tu@correo.com" autoComplete="email" className="h-11" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono o WhatsApp</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+58 414-000-0000" autoComplete="tel" className="h-11" {...field} value={field.value ?? ""} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa o lugar</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre de tu empresa, clínica o gimnasio" autoComplete="organization" className="h-11" {...field} value={field.value ?? ""} data-testid="input-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje *</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="¿Qué tipo de máquina te interesa y dónde quedaría?" {...field} data-testid="input-message" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={mutation.isPending} data-testid="button-submit-contact">
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Enviar mensaje
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">Solo usamos tus datos para responderte. Sin boletines ni listas.</p>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
