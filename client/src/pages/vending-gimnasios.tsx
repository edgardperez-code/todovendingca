import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Zap, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { SubpageHero } from "@/components/subpage-hero";
import { SubpageFAQ } from "@/components/subpage-faq";
import { SubpageCTA } from "@/components/subpage-cta";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

const faqs = [
  {
    question: "Que productos tienen las maquinas expendedoras para gimnasios?",
    answer:
      "Bebidas energeticas, barras de proteinas, agua, suplementos deportivos y snacks saludables, pensados para antes y despues del entrenamiento.",
  },
  {
    question: "Tiene costo instalar una maquina de vending deportivo en mi gimnasio?",
    answer:
      "No. La instalacion es gratuita, al igual que la reposicion y el mantenimiento. Todo Vending CA se encarga de todo el proceso.",
  },
  {
    question: "En que gimnasios de Lecheria ya tienen maquinas?",
    answer:
      "Actualmente Todo Vending CA tiene vending deportivo en Lion Gym y en la Cancha 3x3 del Parque Caribe, en Playa Cangrejo, Lecheria.",
  },
];

const productos = [
  { icon: Zap, title: "Bebidas energeticas", desc: "Energia rapida antes y durante el entrenamiento, siempre frias." },
  { icon: Dumbbell, title: "Barras de proteinas", desc: "Recuperacion muscular al alcance, sin salir del gimnasio." },
  { icon: Droplets, title: "Hidratacion y snacks", desc: "Agua, bebidas refrescantes y snacks saludables a precios accesibles." },
];

const ubicaciones = [
  { nombre: "Lion Gym", tipo: "Lecheria — bebidas energeticas, barras de proteinas y mas." },
  { nombre: "Cancha 3x3 Parque Caribe", tipo: "Playa Cangrejo, Lecheria — snacks, proteinas y bebidas energeticas." },
];

export default function VendingGimnasios() {
  useSEO({
    title: "Vending para Gimnasios | Bebidas Energéticas y Proteínas | Todo Vending CA",
    description:
      "Máquinas expendedoras para gimnasios en Anzoátegui: bebidas energéticas, barras de proteínas y snacks deportivos, con instalación gratuita y reposición incluida.",
    path: "/vending-gimnasios",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Vending para Gimnasios", path: "/vending-gimnasios" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Vending para Gimnasios",
        serviceType: "Máquina Expendedora para Gimnasio",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "State", name: "Anzoátegui" },
        audience: { "@type": "Audience", audienceType: "Gimnasios, Centros Deportivos, Deportistas" },
        description:
          "Máquinas expendedoras especializadas para gimnasios y centros deportivos: bebidas energéticas, barras de proteínas y suplementos, con instalación gratuita.",
      },
      faqSchema(faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SubpageHero
          eyebrow="Vending deportivo"
          titlePlain="Vending para Gimnasios en"
          titleAccent="Anzoategui"
          lead="Maquinas expendedoras especializadas para gimnasios y centros deportivos, con bebidas energeticas, barras de proteinas y snacks saludables, instalacion gratuita y reposicion constante."
          ctaText="Solicitar vending para mi gimnasio"
        />

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <Badge className="mb-4" variant="secondary">Hidratacion y energia</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">Sin salir del</span>{" "}
                <span className="text-primary">gimnasio</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Despues de entrenar, los atletas buscan hidratacion y proteina rapida. Nuestras maquinas de
                vending deportivo se surten con productos pensados para ese momento, con reposicion frecuente
                segun el consumo real del gimnasio, y sin costo ni gestion para el negocio.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {productos.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover-elevate group">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <p.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{p.title}</h3>
                      <p className="text-muted-foreground text-sm">{p.desc}</p>
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
                <span className="text-foreground">Actualmente</span>{" "}
                <span className="text-primary">en</span>
              </h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {ubicaciones.map((u, i) => (
                <motion.div
                  key={u.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover-elevate">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground mb-1">{u.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{u.tipo}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SubpageFAQ items={faqs} />

        <SubpageCTA
          title="Tienes un gimnasio o centro deportivo?"
          text="Instalamos vending deportivo sin costo y sin compromisos."
          ctaText="Solicitar Informacion"
        />
      </main>
      <Footer />
    </div>
  );
}
