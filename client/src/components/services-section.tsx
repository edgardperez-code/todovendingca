import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  Cookie, 
  Droplets, 
  Settings, 
  Truck, 
  CreditCard,
  Wrench,
  Monitor
} from "lucide-react";
import { motion } from "framer-motion";
import type { Service } from "@shared/schema";

const services: Service[] = [
  {
    id: "1",
    title: "Maquinas de Snacks",
    description: "Amplia variedad de snacks, galletas, chocolates y opciones saludables para todos los gustos.",
    icon: "cookie",
    features: ["Marcas reconocidas", "Opciones saludables", "Productos frescos"]
  },
  {
    id: "2",
    title: "Maquinas de Bebidas",
    description: "Refrescos, jugos, agua y bebidas energeticas siempre frias y listas para disfrutar.",
    icon: "droplets",
    features: ["Bebidas frias", "Gran variedad", "Precios accesibles"]
  },
  {
    id: "3",
    title: "Maquinas de Cafe",
    description: "Cafe gourmet recien preparado, cappuccino, chocolate caliente y mas opciones calientes.",
    icon: "coffee",
    features: ["Cafe gourmet", "Preparacion instantanea", "Multiples sabores"]
  },
  {
    id: "4",
    title: "Instalacion Profesional",
    description: "Instalamos las maquinas en tu ubicacion sin ningun costo adicional para ti.",
    icon: "settings",
    features: ["Instalacion gratuita", "Configuracion incluida", "Capacitacion"]
  },
  {
    id: "5",
    title: "Reposicion de Inventario",
    description: "Mantenemos las maquinas siempre abastecidas con productos frescos y variados.",
    icon: "truck",
    features: ["Reposicion regular", "Productos frescos", "Sin interrupciones"]
  },
  {
    id: "6",
    title: "Mantenimiento Tecnico",
    description: "Servicio de mantenimiento preventivo y correctivo para asegurar funcionamiento optimo.",
    icon: "wrench",
    features: ["Soporte tecnico", "Respuesta rapida", "Garantia total"]
  },
  {
    id: "7",
    title: "Pagos Electronicos",
    description: "Sistemas de pago modernos incluyendo tarjetas, pago movil y efectivo.",
    icon: "creditcard",
    features: ["Tarjetas", "Pago movil", "Efectivo"]
  },
  {
    id: "8",
    title: "Monitoreo Remoto",
    description: "Vigilamos el funcionamiento de las maquinas en tiempo real para garantizar disponibilidad.",
    icon: "monitor",
    features: ["Tiempo real", "Alertas automaticas", "Control total"]
  }
];

const iconMap: Record<string, typeof Coffee> = {
  coffee: Coffee,
  cookie: Cookie,
  droplets: Droplets,
  settings: Settings,
  truck: Truck,
  creditcard: CreditCard,
  wrench: Wrench,
  monitor: Monitor
};

export function ServicesSection() {
  return (
    <section
      id="servicios"
      className="py-20 md:py-28"
      data-testid="section-services"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4" variant="secondary">
            Nuestros Servicios
          </Badge>
          <h2 data-speakable className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Soluciones</span>{" "}
            <span className="text-primary">Completas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ofrecemos un servicio integral que incluye desde la instalacion hasta 
            el mantenimiento, para que tu solo te preocupes por disfrutar.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Coffee;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover-elevate group">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {service.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm mb-4">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-primary/20">
            <CardContent className="py-8 px-6 md:px-12">
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
                Quieres una maquina en tus instalaciones?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Transforma tu espacio con la conveniencia y variedad de Todo Vending CA. 
                Instalacion gratuita y sin compromisos.
              </p>
              <a
                href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
              >
                <Badge className="text-base py-2 px-6 cursor-pointer">
                  Solicitar Informacion
                </Badge>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
