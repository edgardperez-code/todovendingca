import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ServicesSection } from "@/components/services-section";
import { CafeOrienteSection } from "@/components/cafe-oriente-section";
import { GiftCardPromoSection } from "@/components/gift-card-promo-section";
import { LocationsSection } from "@/components/locations-section";
import { ValuePropsSection } from "@/components/value-props-section";
import { FAQSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { Ola } from "@/components/vitrina/ola";
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
    title: "Máquinas Expendedoras en Lechería, Anzoátegui | Todo Vending CA",
    description:
      "Todo Vending CA: máquinas expendedoras en Lechería, Anzoátegui, con instalación GRATUITA, mantenimiento 24/7 y reposición incluida. Snacks, bebidas, café en grano (Café Oriente), bebidas energéticas y barras de proteínas.",
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
    <div className="min-h-screen bg-background v-base" data-testid="page-home">
      <Header />
      {/* v-bajo-cabecera deja libre el alto de la cabecera fija; "contenido"
          es el destino del enlace "Saltar al contenido". */}
      <main id="contenido" className="v-bajo-cabecera">
        <HeroSection />
        {/* La ola de marca separa la portada del resto (maqueta Vitrina). */}
        <Ola />
        <AboutSection />
        <ServicesSection />
        <CafeOrienteSection />
        <GiftCardPromoSection />
        <LocationsSection />
        <ValuePropsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
