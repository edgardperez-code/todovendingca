import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ServicesSection } from "@/components/services-section";
import { CafeOrienteSection } from "@/components/cafe-oriente-section";
import { LocationsSection } from "@/components/locations-section";
import { ValuePropsSection } from "@/components/value-props-section";
import { FAQSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { useSEO } from "@/lib/seo";
import {
  websiteSchema,
  organizationSchema,
  localBusinessSchema,
  cafeOrienteBrandSchema,
  homeWebPageSchema,
  homeServicesItemListSchema,
  homeFaqSchema,
  homeHowToSchema,
} from "@/lib/schema";

export default function Home() {
  useSEO({
    title: "Máquinas Expendedoras en Venezuela | Todo Vending CA",
    description:
      "Todo Vending CA: máquinas expendedoras en Venezuela con instalación GRATUITA, mantenimiento 24/7 y reposición incluida. Snacks, bebidas, café en grano (Café Oriente), bebidas energéticas y barras de proteínas en Lechería, Puerto La Cruz y Barcelona, Anzoátegui.",
    path: "/",
    jsonLd: [
      websiteSchema,
      organizationSchema,
      localBusinessSchema,
      cafeOrienteBrandSchema,
      homeWebPageSchema,
      homeServicesItemListSchema,
      homeFaqSchema,
      homeHowToSchema,
    ],
  });

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <CafeOrienteSection />
        <LocationsSection />
        <ValuePropsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
