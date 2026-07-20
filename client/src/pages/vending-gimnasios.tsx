import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";
import { useSEO } from "@/lib/seo";
import {
  SITE_URL,
  BUSINESS_PHONE_DISPLAY,
  organizationSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/schema";

const faqs = [
  {
    question: "¿Qué productos tienen las máquinas expendedoras para gimnasios?",
    answer:
      "Bebidas energéticas, barras de proteínas, agua, suplementos deportivos y snacks saludables, pensados para antes y después del entrenamiento.",
  },
  {
    question: "¿Tiene costo instalar una máquina de vending deportivo en mi gimnasio?",
    answer:
      "No. La instalación es gratuita, al igual que la reposición y el mantenimiento. Todo Vending CA se encarga de todo el proceso.",
  },
  {
    question: "¿En qué gimnasios de Lechería ya tienen máquinas?",
    answer:
      "Actualmente Todo Vending CA tiene vending deportivo en Lion Gym y en la Cancha 3x3 del Parque Caribe, en Playa Cangrejo, Lechería.",
  },
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
      <main className="pt-24 md:pt-32">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <p className="text-sm text-primary font-semibold mb-2">VENDING DEPORTIVO</p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 max-w-3xl">
            Vending para Gimnasios en Anzoátegui
          </h1>
          <p className="speakable text-lg text-muted-foreground max-w-2xl mb-8">
            Máquinas expendedoras especializadas para gimnasios y centros deportivos, con
            bebidas energéticas, barras de proteínas y snacks saludables, instalación
            gratuita y reposición constante.
          </p>
          <a href="https://wa.me/584146164177" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <SiWhatsapp className="h-5 w-5" />
              Solicitar vending para mi gimnasio
            </Button>
          </a>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Hidratación y energía sin salir del gimnasio</h2>
          <p className="text-muted-foreground max-w-3xl mb-4">
            Después de entrenar, los atletas buscan opciones rápidas de hidratación y
            proteína, sin tener que salir del gimnasio ni pagar precios elevados. Las
            máquinas de vending deportivo de Todo Vending CA se surten con bebidas
            energéticas, barras de proteínas, agua y snacks pensados específicamente para
            ese momento, con reposición frecuente según el consumo real del gimnasio.
          </p>
          <p className="text-muted-foreground max-w-3xl">
            Para el gimnasio, el servicio no representa ningún costo ni gestión: Todo
            Vending CA instala, abastece y da mantenimiento a la máquina, y puede
            convertirse en una fuente adicional de comodidad para los miembros sin afectar
            la operación del negocio.
          </p>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Actualmente en</h2>
          <ul className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <li className="p-4 rounded-lg border bg-card">
              <strong>Lion Gym</strong> — Lechería. Bebidas energéticas, barras de proteínas y más.
            </li>
            <li className="p-4 rounded-lg border bg-card">
              <strong>Cancha 3x3 Parque Caribe</strong> — Playa Cangrejo, Lechería. Snacks, proteínas y bebidas refrescantes y energéticas.
            </li>
          </ul>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Preguntas frecuentes</h2>
          <div className="space-y-6 max-w-3xl">
            {faqs.map((f) => (
              <div key={f.question}>
                <h3 className="font-semibold text-foreground mb-1">{f.question}</h3>
                <p className="text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 border-t text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Tienes un gimnasio o centro deportivo?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Instalamos vending deportivo sin costo y sin compromisos.
          </p>
          <a href="https://wa.me/584146164177" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <SiWhatsapp className="h-5 w-5" />
              Escribir por WhatsApp: {BUSINESS_PHONE_DISPLAY}
            </Button>
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
