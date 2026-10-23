import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiWhatsapp } from "react-icons/si";
import { waLink, WA_MESSAGES, type WaMessageKey } from "@shared/site";
import type { FAQ } from "@/content/faqs";
import { SectionHeading } from "./section-heading";

export function FAQBlock({
  items,
  title = "Preguntas frecuentes",
  lead,
  waKey = "faq",
  showAllLink = true,
  id = "faq",
}: {
  items: Pick<FAQ, "id" | "question" | "answer">[];
  title?: string;
  lead?: string;
  waKey?: WaMessageKey;
  showAllLink?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className="bg-muted/50 py-20 md:py-28" aria-labelledby={`${id}-titulo`}>
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Dudas resueltas" id={`${id}-titulo`} title={title} lead={lead} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href={waLink(WA_MESSAGES[waKey])} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-11 px-5 text-sm">
                <SiWhatsapp aria-hidden="true" className="h-4 w-4" />
                Pregúntanos por WhatsApp
              </a>
              {showAllLink && (
                <a href="/preguntas-frecuentes" className="btn-outline-ink h-11 px-5 text-sm">
                  Ver todas las preguntas
                </a>
              )}
            </div>
          </div>
          <div className="reveal lg:col-span-8">
            <Accordion type="single" collapsible className="space-y-3">
              {items.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="card-soft border px-5 data-[state=open]:border-brand-orange/40" data-testid={`faq-item-${faq.id}`}>
                  <AccordionTrigger className="py-4 text-left text-base font-semibold hover:no-underline">
                    <span itemProp="name">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
