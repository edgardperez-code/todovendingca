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
    question: "¿Cuánto cuesta poner una máquina expendedora en mi negocio en Lechería?",
    answer:
      "Nada. Todo Vending CA instala, abastece y da mantenimiento a la máquina sin ningún costo para el local. El modelo de negocio se sostiene con la venta de los productos, no con un cobro al establecimiento anfitrión.",
  },
  {
    question: "¿Qué necesito para instalar una máquina de vending en Lechería?",
    answer:
      "Solo un espacio de aproximadamente 1,5 m × 1 m con acceso a una toma eléctrica. El equipo de Todo Vending CA evalúa el lugar y recomienda el tipo de máquina más adecuado según el flujo de personas.",
  },
  {
    question: "¿En qué zonas de Lechería y Anzoátegui instalan máquinas?",
    answer:
      "Actualmente Todo Vending CA tiene máquinas operando en Lechería, con clientes en clínicas, centros empresariales, colegios y gimnasios, y presta servicio en toda la región: Lechería, Puerto La Cruz y Barcelona.",
  },
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
      <main className="pt-24 md:pt-32">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <p className="text-sm text-primary font-semibold mb-2">LECHERÍA, ANZOÁTEGUI</p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 max-w-3xl">
            Máquinas Expendedoras en Lechería
          </h1>
          <p className="speakable text-lg text-muted-foreground max-w-2xl mb-8">
            Todo Vending CA instala máquinas expendedoras de snacks, bebidas y café en
            grano en oficinas, clínicas, colegios y gimnasios de Lechería, con instalación
            gratuita y mantenimiento 24/7, sin ningún costo para el negocio.
          </p>
          <a href="https://wa.me/584146164177" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <SiWhatsapp className="h-5 w-5" />
              Solicitar máquina en Lechería
            </Button>
          </a>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Vending local, sin intermediarios</h2>
          <p className="text-muted-foreground max-w-3xl mb-4">
            Con sede en el Centro Comercial Venezuela, en Lechería, Todo Vending CA opera
            directamente en la zona: visitas de reposición rápidas, respuesta técnica
            inmediata ante cualquier falla y trato directo con el equipo, sin pasar por
            intermediarios ni distribuidores externos. Esa cercanía es la diferencia entre
            una máquina que funciona todos los días y una que se queda vacía por semanas.
          </p>
          <p className="text-muted-foreground max-w-3xl">
            Instalamos en oficinas y centros empresariales, clínicas y hospitales,
            colegios y universidades, gimnasios y centros deportivos, y espacios
            comerciales de alto tráfico. Cada máquina se elige según el tipo de público:
            snacks y bebidas frías para oficinas, café en grano para turnos largos en
            clínicas, bebidas energéticas y proteínas para gimnasios.
          </p>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Clientes actuales en la zona</h2>
          <ul className="grid sm:grid-cols-2 gap-4 max-w-3xl">
            <li className="p-4 rounded-lg border bg-card"><strong>Clínica Anzoátegui</strong> — snacks y bebidas 24 horas</li>
            <li className="p-4 rounded-lg border bg-card"><strong>Centro Empresarial Colón</strong> — oficinas</li>
            <li className="p-4 rounded-lg border bg-card"><strong>Centro Empresarial Oleus</strong> — oficinas</li>
            <li className="p-4 rounded-lg border bg-card"><strong>Colegio El Manglar</strong> — educación</li>
            <li className="p-4 rounded-lg border bg-card"><strong>Clínica Zambrano</strong> — salud</li>
            <li className="p-4 rounded-lg border bg-card"><strong>Lion Gym</strong> — vending deportivo</li>
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
            ¿Tienes un espacio en Lechería?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Evaluamos tu local sin compromiso y te decimos qué tipo de máquina se adapta mejor.
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
