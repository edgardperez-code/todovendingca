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
    question: "¿Cuánto cuesta el servicio de vending para mi empresa u oficina?",
    answer:
      "El servicio no tiene costo para la empresa: Todo Vending CA cubre la instalación, la máquina, la reposición de productos y el mantenimiento. No hay alquiler, cuota mensual ni compra de equipo.",
  },
  {
    question: "¿Qué necesito para instalar vending en mi oficina o clínica?",
    answer:
      "Un espacio de aproximadamente 1,5 m × 1 m con acceso eléctrico. Evaluamos el tráfico de personas y el horario del lugar para recomendar el tipo de máquina (snacks, bebidas o café).",
  },
  {
    question: "¿Puedo elegir los productos según mis empleados o pacientes?",
    answer:
      "Sí. La selección de productos se personaliza según el perfil de cada empresa, clínica o institución, y se ajusta con el tiempo según lo que más se consume.",
  },
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
      <main className="pt-24 md:pt-32">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <p className="text-sm text-primary font-semibold mb-2">SOLUCIONES B2B</p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 max-w-3xl">
            Vending para Empresas, Oficinas y Clínicas
          </h1>
          <p className="speakable text-lg text-muted-foreground max-w-2xl mb-8">
            Todo Vending CA instala máquinas expendedoras en empresas, centros
            empresariales y clínicas de Anzoátegui, sin costo de instalación ni cuotas
            mensuales, con reposición y mantenimiento 24/7 incluidos.
          </p>
          <a href="https://wa.me/584146164177" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <SiWhatsapp className="h-5 w-5" />
              Cotizar para mi empresa
            </Button>
          </a>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Un beneficio para tu equipo, sin costo para tu empresa</h2>
          <p className="text-muted-foreground max-w-3xl mb-4">
            Las cafeterías y comedores de oficina suelen tener horarios limitados. Una
            máquina expendedora complementa ese servicio: da acceso rápido a snacks,
            bebidas y café fuera de esos horarios, sin que la empresa tenga que comprar
            equipos, contratar personal de reposición o asumir mantenimiento. Todo Vending
            CA se encarga de cada parte del proceso.
          </p>
          <p className="text-muted-foreground max-w-3xl">
            En clínicas y hospitales, el vending es aún más relevante: pacientes,
            familiares y personal en turnos largos necesitan opciones disponibles fuera del
            horario de la cafetería, incluidas madrugadas y fines de semana.
          </p>
        </section>

        <section className="container mx-auto px-4 py-12 border-t grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Cero inversión</h3>
            <p className="text-sm text-muted-foreground">Sin compra de equipo, sin alquiler, sin cuota mensual.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Imagen corporativa</h3>
            <p className="text-sm text-muted-foreground">Máquinas modernas que mejoran la experiencia en tus instalaciones.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Cero gestión</h3>
            <p className="text-sm text-muted-foreground">Nosotros reponemos, damos mantenimiento y resolvemos fallas.</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Clientes actuales</h2>
          <p className="text-muted-foreground max-w-3xl mb-4">
            Empresas y clínicas que ya confían en Todo Vending CA en Lechería:
            <strong> Clínica Anzoátegui</strong>, <strong>Clínica Zambrano</strong>,{" "}
            <strong>Centro Empresarial Colón</strong> y <strong>Centro Empresarial Oleus</strong>.
          </p>
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
            Lleva vending a tu empresa
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Cuéntanos sobre tu espacio y coordinamos una evaluación sin compromiso.
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
