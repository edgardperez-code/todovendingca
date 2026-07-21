import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { SubpageHero } from "@/components/subpage-hero";
import { SubpageFAQ } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

const faqs = [
  {
    question: "Cuanto cuesta poner una maquina expendedora en mi negocio en Lecheria?",
    answer:
      "Nada. Todo Vending CA instala, abastece y da mantenimiento a la maquina sin ningun costo para el local. El modelo de negocio se sostiene con la venta de los productos, no con un cobro al establecimiento anfitrion.",
  },
  {
    question: "Que necesito para instalar una maquina de vending en Lecheria?",
    answer:
      "Solo un espacio de aproximadamente 1,5 m x 1 m con acceso a una toma electrica. El equipo de Todo Vending CA evalua el lugar y recomienda el tipo de maquina mas adecuado segun el flujo de personas.",
  },
  {
    question: "En que zonas de Lecheria y Anzoategui instalan maquinas?",
    answer:
      "Actualmente Todo Vending CA tiene maquinas operando en Lecheria, con clientes en clinicas, centros empresariales, colegios y gimnasios, y presta servicio en toda la region: Lecheria, Puerto La Cruz y Barcelona.",
  },
];

const clientes = [
  { nombre: "Clinica Anzoategui", tipo: "Snacks y bebidas 24 horas" },
  { nombre: "Centro Empresarial Colon", tipo: "Oficinas" },
  { nombre: "Centro Empresarial Oleus", tipo: "Oficinas" },
  { nombre: "Colegio El Manglar", tipo: "Educacion" },
  { nombre: "Clinica Zambrano", tipo: "Salud" },
  { nombre: "Lion Gym", tipo: "Vending deportivo" },
];

const ventajas = [
  { icon: MapPin, title: "Vending local", desc: "Con sede en el Centro Comercial Venezuela, operamos directamente en la zona: reposicion rapida y respuesta tecnica inmediata." },
  { icon: Zap, title: "Sin intermediarios", desc: "Trato directo con nuestro equipo, sin distribuidores externos. Esa cercania mantiene las maquinas siempre abastecidas." },
  { icon: ShieldCheck, title: "Para cada espacio", desc: "Oficinas, clinicas, colegios, gimnasios y comercios. Elegimos la maquina segun el publico de cada lugar." },
];

export default function MaquinasLecheria() {
  useSEO({
    title: "Máquinas Expendedoras en Lechería | Todo Vending CA",
    description:
      "Instalación gratuita de máquinas expendedoras en Lechería, Anzoátegui. Snacks, bebidas y café en grano con mantenimiento 24/7 y reposición incluida, sin costo para tu negocio.",
    path: "/maquinas-expendedoras-lecheria",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Máquinas Expendedoras en Lechería", path: "/maquinas-expendedoras-lecheria" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Máquinas Expendedoras en Lechería",
        serviceType: "Instalación de Máquinas Expendedoras",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "City", name: "Lechería" },
        description:
          "Instalación, reposición y mantenimiento de máquinas expendedoras de snacks, bebidas y café en Lechería, Anzoátegui, sin costo para el negocio anfitrión.",
      },
      faqSchema(faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SubpageHero
          eyebrow="Lecheria, Anzoategui"
          titlePlain="Maquinas Expendedoras en"
          titleAccent="Lecheria"
          lead="Todo Vending CA instala maquinas expendedoras de snacks, bebidas y cafe en grano en oficinas, clinicas, colegios y gimnasios de Lecheria, con instalacion gratuita y mantenimiento 24/7, sin ningun costo para el negocio."
          ctaText="Solicitar maquina en Lecheria"
        />

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4" variant="secondary">Vending local</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">Vending local, sin</span>{" "}
                <span className="text-primary">intermediarios</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Instalamos en oficinas, clinicas, colegios, gimnasios y comercios de alto trafico en toda la region oriental.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {ventajas.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover-elevate group">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <v.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{v.title}</h3>
                      <p className="text-muted-foreground text-sm">{v.desc}</p>
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
              className="text-center mb-12"
            >
              <Badge className="mb-4" variant="secondary">Prueba social</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">Clientes actuales en</span>{" "}
                <span className="text-primary">la zona</span>
              </h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {clientes.map((c, i) => (
                <motion.div
                  key={c.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover-elevate">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground mb-1">{c.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{c.tipo}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SubpageFAQ items={faqs} />

        <SubpageCTA
          title="Tienes un espacio en Lecheria?"
          text="Evaluamos tu local sin compromiso y te decimos que tipo de maquina se adapta mejor."
          ctaText="Solicitar Informacion"
        />
      </main>
      <Footer />
    </div>
  );
}
