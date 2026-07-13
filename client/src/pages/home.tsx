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

export default function Home() {
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
