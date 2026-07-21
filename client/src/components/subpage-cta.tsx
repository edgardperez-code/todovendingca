import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// CTA final de subpagina, identico al bloque inferior de la seccion Servicios.
export function SubpageCTA({ title, text, ctaText }: { title: string; text: string; ctaText: string }) {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="py-8 px-6 md:px-12 text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">{title}</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{text}</p>
              <a
                href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
              >
                <Badge className="text-base py-2 px-6 cursor-pointer">{ctaText}</Badge>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
