import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import type { FAQItem } from "@shared/schema";

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "Tiene algun costo la instalacion?",
    answer: "No, Todo Vending CA cubre todos los gastos de instalacion en tu ubicacion. La instalacion es completamente gratuita y sin compromisos para ti."
  },
  {
    id: "2",
    question: "Quien abastece las maquinas con productos?",
    answer: "Nosotros nos encargamos de la reposicion completa del inventario, asegurando que las maquinas esten siempre abastecidas con productos frescos y variados segun tus preferencias."
  },
  {
    id: "3",
    question: "Quien repara o realiza el mantenimiento de las maquinas?",
    answer: "Nuestro equipo tecnico realiza monitoreo constante y se encarga de cualquier reparacion o mantenimiento necesario. El servicio de mantenimiento esta incluido sin costo adicional."
  },
  {
    id: "4",
    question: "Que tipos de productos pueden vender las maquinas?",
    answer: "Ofrecemos una amplia variedad: snacks, galletas, chocolates, bebidas frias, refrescos, jugos, agua, cafe gourmet, cappuccino, chocolate caliente, y opciones saludables. Adaptamos el inventario segun tus necesidades."
  },
  {
    id: "5",
    question: "Que formas de pago aceptan las maquinas?",
    answer: "Nuestras maquinas cuentan con sistemas de pago modernos que aceptan efectivo, tarjetas de debito y credito, y pago movil para mayor comodidad de los usuarios."
  },
  {
    id: "6",
    question: "Cuanto espacio necesito para instalar una maquina?",
    answer: "El espacio requerido depende del tipo de maquina. Generalmente necesitas un area de aproximadamente 1.5m x 1m con acceso a toma electrica. Nuestro equipo evalua tu espacio para recomendarte la mejor opcion."
  },
  {
    id: "7",
    question: "Puedo elegir los productos que se venden en la maquina?",
    answer: "Absolutamente. Trabajamos contigo para personalizar la seleccion de productos segun las preferencias de tus empleados, clientes o usuarios. Escuchamos tus sugerencias y las implementamos."
  },
  {
    id: "8",
    question: "Como solicito una maquina para mi negocio?",
    answer: "Es muy sencillo. Puedes contactarnos via WhatsApp al +58 414-616-4177 o llenar el formulario de contacto en nuestra pagina. Nuestro equipo se comunicara contigo para evaluar tu espacio y coordinar la instalacion."
  }
];

export function FAQSection() {
  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-muted/30"
      data-testid="section-faq"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
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
            <p className="text-muted-foreground">
              Descubre todo lo que necesitas saber sobre nuestros servicios de vending.
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
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

          {/* Bottom CTA */}
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
