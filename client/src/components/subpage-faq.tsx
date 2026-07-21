import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export type SubpageFAQItem = { question: string; answer: string };

// Bloque de Preguntas Frecuentes con el MISMO diseño que la seccion FAQ del
// home (acordeon, badges, animaciones). Se reutiliza en todas las subpaginas
// para mantener el diseño consistente.
export function SubpageFAQ({ items }: { items: SubpageFAQItem[] }) {
  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/30" data-testid="section-faq">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              Preguntas Frecuentes
            </Badge>
            <h2 data-speakable className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Resolvemos tus</span>{" "}
              <span className="text-primary">Dudas</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {items.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={String(index)}
                  className="bg-background rounded-xl border px-6 data-[state=open]:border-primary/30"
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Tienes mas preguntas? Estamos aqui para ayudarte.
            </p>
            <a
              href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
            >
              <Badge className="text-base py-2 px-6 cursor-pointer">
                Contactar por WhatsApp
              </Badge>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
