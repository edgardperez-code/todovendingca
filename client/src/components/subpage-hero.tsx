import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Hero compacto para subpaginas, con el mismo estilo visual del home:
// gradiente sutil, badge "eyebrow", h1 en dos colores y CTA de WhatsApp.
export function SubpageHero({
  eyebrow,
  titlePlain,
  titleAccent,
  lead,
  ctaText,
}: {
  eyebrow: string;
  titlePlain: string;
  titleAccent: string;
  lead: string;
  ctaText: string;
}) {
  return (
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <Badge className="mb-6" variant="secondary">
            {eyebrow}
          </Badge>
          <h1 data-speakable className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-foreground">{titlePlain}</span>{" "}
            <span className="text-primary">{titleAccent}</span>
          </h1>
          <p className="speakable text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            {lead}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
            >
              <Button size="lg" className="w-full sm:w-auto gap-2 glow-primary">
                <SiWhatsapp className="h-5 w-5" />
                {ctaText}
              </Button>
            </a>
            <a href="/#servicios">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                Ver Servicios
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
