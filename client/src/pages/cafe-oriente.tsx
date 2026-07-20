import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";
import { useSEO } from "@/lib/seo";
import {
  SITE_URL,
  BUSINESS_PHONE_DISPLAY,
  organizationSchema,
  cafeOrienteBrandSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/schema";

const bebidas = [
  { nombre: "Espresso", desc: "Extracción intensa y aromática, base de todas las demás bebidas." },
  { nombre: "Capuchino", desc: "Espresso con leche vaporizada y espuma cremosa." },
  { nombre: "Café con Leche", desc: "Suave y equilibrado, ideal para cualquier momento del día." },
  { nombre: "Mocachino", desc: "Espresso, leche y chocolate en un solo vaso." },
  { nombre: "Latte de Vainilla", desc: "Café con leche y un toque dulce de vainilla." },
  { nombre: "Café Marrón", desc: "El clásico venezolano: mitad café, mitad leche." },
  { nombre: "Chocolate Caliente", desc: "Para quienes prefieren una opción sin café." },
];

const faqs = [
  {
    question: "¿El café de Café Oriente es en grano o instantáneo?",
    answer:
      "Es 100% café en grano, molido al instante por el molino integrado de la estación Bianchi LEI 400. Nunca se usa café instantáneo: cada bebida se prepara desde el grano en el momento en que se pide.",
  },
  {
    question: "¿Cómo se paga un Café Oriente?",
    answer:
      "La estación es 100% sin efectivo: acepta Pago Móvil, tarjeta de débito y tarjeta de crédito. No recibe billetes ni monedas.",
  },
  {
    question: "¿Dónde puedo tomar un Café Oriente?",
    answer:
      "Café Oriente está disponible en las ubicaciones donde Todo Vending CA tiene máquinas de café instaladas en Lechería y Anzoátegui. Si quieres una estación en tu empresa, clínica u oficina, puedes solicitarla por WhatsApp.",
  },
];

export default function CafeOriente() {
  useSEO({
    title: "Café Oriente — Café en Grano Recién Molido | Todo Vending CA",
    description:
      "Café Oriente: máquina de café en grano Bianchi LEI 400, capuchino, café con leche, mocachino y más, listos en menos de 40 segundos. Disponible 24/7, 100% sin efectivo, en Anzoátegui.",
    path: "/cafe-oriente",
    jsonLd: [
      organizationSchema,
      cafeOrienteBrandSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Café Oriente", path: "/cafe-oriente" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Café Oriente",
        brand: { "@id": `${SITE_URL}/#cafeoriente` },
        category: "Café",
        description:
          "Café en grano recién molido servido por la estación automática Bianchi LEI 400, disponible en ubicaciones de Todo Vending CA en Lechería y Anzoátegui.",
        image: `${SITE_URL}/og-image.jpg`,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "0.50",
          availability: "https://schema.org/InStock",
        },
        hasMenu: {
          "@type": "Menu",
          name: "Menú Café Oriente",
          hasMenuSection: {
            "@type": "MenuSection",
            name: "Bebidas calientes",
            hasMenuItem: bebidas.map((b) => ({
              "@type": "MenuItem",
              name: b.nombre,
              description: b.desc,
            })),
          },
        },
      },
      faqSchema(faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 md:pt-32">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <p className="text-sm text-primary font-semibold mb-2">MARCA REGISTRADA</p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 max-w-3xl">
            Café Oriente — Café en Grano Recién Molido en Anzoátegui
          </h1>
          <p className="speakable text-lg text-muted-foreground max-w-2xl mb-8">
            El respiro que tu jornada necesita. Café premium en grano recién molido,
            servido por la estación automática Bianchi LEI 400 (Italia), disponible en
            empresas, clínicas y espacios de Todo Vending CA en Lechería, Anzoátegui.
          </p>
          <a href="https://wa.me/584146164177" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <SiWhatsapp className="h-5 w-5" />
              Solicitar Café Oriente para mi negocio
            </Button>
          </a>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Grano recién molido, nunca instantáneo</h2>
          <p className="text-muted-foreground max-w-3xl mb-4">
            La diferencia de Café Oriente frente a una máquina de vending tradicional es
            simple: el café se muele al momento. La estación Bianchi LEI 400, fabricada en
            Italia, tiene un molino integrado que procesa el grano justo antes de la
            extracción, en lugar de usar mezclas de café instantáneo o polvo soluble. El
            resultado es un café con el aroma y el cuerpo de una cafetería real, listo en
            menos de 40 segundos, sin filas ni espera.
          </p>
          <p className="text-muted-foreground max-w-3xl">
            La máquina está disponible 24 horas al día, los 7 días de la semana, lo que la
            hace ideal para turnos nocturnos en clínicas, oficinas con horario extendido o
            cualquier espacio donde el café de calidad no debería depender de un horario.
          </p>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Menú de bebidas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bebidas.map((b) => (
              <div key={b.nombre} className="p-5 rounded-xl border bg-card">
                <h3 className="font-semibold text-foreground mb-1">{b.nombre}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 border-t grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Lista en menos de 40 segundos</h3>
            <p className="text-sm text-muted-foreground">De grano a taza en tiempo récord, sin esperas.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Disponible 24/7</h3>
            <p className="text-sm text-muted-foreground">Autónoma y automática, opera incluso en turnos nocturnos.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">100% sin efectivo</h3>
            <p className="text-sm text-muted-foreground">Pago Móvil, débito y crédito, sin billetes ni monedas.</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Preguntas frecuentes sobre Café Oriente</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Quieres Café Oriente en tu negocio?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Instalación gratuita, sin compromisos. Escríbenos y evaluamos tu espacio.
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
