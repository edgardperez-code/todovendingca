import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target, Award, Sparkles } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { motion } from "framer-motion";

const stats = [
  { value: "100%", label: "Satisfaccion", icon: Award },
  { value: "24/7", label: "Disponibilidad", icon: Target },
  { value: "0", label: "Costo Instalacion", icon: Sparkles },
];

export function AboutSection() {
  return (
    <section
      id="nosotros"
      className="py-20 md:py-28 bg-muted/30"
      data-testid="section-about"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              {/* Placeholder for company image - using gradient as visual */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Equipo Apasionado
                  </h3>
                  <p className="text-muted-foreground">
                    Por la innovacion y la calidad
                  </p>
                </div>
              </div>
              
              {/* Decorative border */}
              <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl" />
            </div>

            {/* Stats cards */}
            <div className="absolute -bottom-6 left-4 right-4 md:left-8 md:right-8">
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="bg-background/95 backdrop-blur-sm">
                      <CardContent className="p-3 md:p-4 text-center">
                        <stat.icon className="w-5 h-5 mx-auto text-primary mb-1" />
                        <div className="text-lg md:text-2xl font-bold text-primary">
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right content - Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:pl-8"
          >
            <Badge className="mb-4" variant="secondary">
              Sobre Nosotros
            </Badge>
            
            <h2 data-speakable className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-foreground">Quienes Somos en</span>
              <br />
              <span className="text-primary">Todo Vending CA</span>
            </h2>

            <div className="space-y-4 text-muted-foreground mb-8">
              <p className="text-lg">
                En Todo Vending CA, <strong className="text-foreground">no solo instalamos maquinas expendedoras, 
                creamos experiencias</strong>. Somos un equipo apasionado por la innovacion 
                y la calidad.
              </p>
              <p>
                Dedicados a transformar espacios con soluciones de vending personalizadas 
                y de ultima generacion. Nuestro objetivo es superar las expectativas de 
                nuestros clientes, ofreciendo comodidad, variedad y un servicio excepcional.
              </p>
              <p>
                Nos enfocamos en complementar los servicios existentes, no en competir con ellos. 
                Con Todo Vending CA, tendras una experiencia de vending sin preocupaciones.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge variant="outline" className="py-2 px-4">
                Instalacion Gratuita
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                Mantenimiento Incluido
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                Reposicion Garantizada
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ubicados en Lecheria</p>
                <p className="text-sm text-muted-foreground">
                  Estado Anzoategui, Venezuela
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
              >
                <Button size="lg" className="gap-2">
                  <SiWhatsapp className="h-5 w-5" />
                  Conoce Mas
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
