import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Building2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SubpageHero } from "@/components/subpage-hero";
import { SubpageFAQ } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

const faqs = [
  {
    question: "Cuanto cuesta el servicio de vending para mi empresa u oficina?",
    answer:
      "El servicio no tiene costo para la empresa: Todo Vending CA cubre la instalacion, la maquina, la reposicion de productos y el mantenimiento. No hay alquiler, cuota mensual ni compra de equipo.",
  },
  {
    question: "Que necesito para instalar vending en mi oficina o clinica?",
    answer:
      "Un espacio de aproximadamente 1,5 m x 1 m con acceso electrico. Evaluamos el trafico de personas y el horario del lugar para recomendar el tipo de maquina (snacks, bebidas o cafe).",
  },
  {
    question: "Puedo elegir los productos segun mis empleados o pacientes?",
    answer:
      "Si. La seleccion de productos se personaliza segun el perfil de cada empresa, clinica o institucion, y se ajusta con el tiempo segun lo que mas se consume.",
  },
];

const beneficios = [
  { icon: Wallet, title: "Cero inversion", desc: "Sin compra de equipo, sin alquiler, sin cuota mensual. Nada de costos para tu empresa." },
  { icon: Building2, title: "Imagen corporativa", desc: "Maquinas modernas que mejoran la experiencia en tus instalaciones y proyectan innovacion." },
  { icon: Sparkles, title: "Cero gestion", desc: "Nosotros reponemos, damos mantenimiento y resolvemos cualquier falla. Tu no te ocupas de nada." },
];

export default function VendingEmpresas() {
  useSEO({
    title: "Vending para Empresas y Oficinas | Todo Vending CA",
    description:
      "Máquinas expendedoras para empresas, oficinas y clínicas en Anzoátegui. Snacks, bebidas y café sin costo de instalación, con reposición y mantenimiento incluidos.",
    path: "/vending-para-empresas",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Vending para Empresas", path: "/vending-para-empresas" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Vending para Empresas y Oficinas",
        serviceType: "Servicio de Máquinas Expendedoras para Empresas",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "State", name: "Anzoátegui" },
        audience: { "@type": "Audience", audienceType: "Empresas, Oficinas, Clínicas" },
        description:
          "Instalación gratuita de máquinas expendedoras para empresas, centros empresariales y clínicas en Anzoátegui, con reposición y mantenimiento incluidos.",
      },
      faqSchema(faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SubpageHero
          eyebrow="Soluciones B2B"
          titlePlain="Vending para Empresas,"
          titleAccent="Oficinas y Clinicas"
          lead="Todo Vending CA instala maquinas expendedoras en empresas, centros empresariales y clinicas de Anzoategui, sin costo de instalacion ni cuotas mensuales, con reposicion y mantenimiento 24/7 incluidos."
          ctaText="Cotizar para mi empresa"
        />

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <Badge className="mb-4" variant="secondary">Un beneficio para tu equipo</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">Sin costo para</span>{" "}
                <span className="text-primary">tu empresa</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Las cafeterias y comedores tienen horarios limitados. Nuestras maquinas complementan ese
                servicio con acceso rapido a snacks, bebidas y cafe fuera de horario, sin que compres equipos ni
                contrates personal. En clinicas y hospitales es aun mas util: pacientes, familiares y personal
                en turnos largos necesitan opciones a cualquier hora.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {beneficios.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover-elevate group">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <b.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{b.title}</h3>
                      <p className="text-muted-foreground text-sm">{b.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4" variant="secondary">Prueba social</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">Empresas que ya</span>{" "}
                <span className="text-primary">confian en nosotros</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Clinica Anzoategui, Clinica Zambrano, Centro Empresarial Colon y Centro Empresarial Oleus
                ya cuentan con maquinas de Todo Vending CA en Lecheria.
              </p>
            </motion.div>
          </div>
        </section>

        <SubpageFAQ items={faqs} />

        <SubpageCTA
          title="Lleva vending a tu empresa"
          text="Cuentanos sobre tu espacio y coordinamos una evaluacion sin compromiso."
          ctaText="Cotizar para mi empresa"
        />
      </main>
      <Footer />
    </div>
  );
}
