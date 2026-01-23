import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { motion } from "framer-motion";
import vendingMachineImage from "@assets/Gemini_Generated_Image_yew2n6yew2n6yew2_1769183883909.png";

const features = [
  { icon: Zap, text: "Tecnologia de Punta" },
  { icon: Shield, text: "Servicio Garantizado" },
  { icon: Clock, text: "Disponible 24/7" },
];

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden vending-grid"
      data-testid="section-hero"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <Badge className="mb-6" variant="secondary">
              Lecheria, Anzoategui
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Tu Solucion</span>
              <br />
              <span className="text-primary">Integral</span>
              <span className="text-foreground"> en</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Maquinas Vending
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Tecnologia, servicio y conveniencia. Transformamos tus espacios con soluciones 
              de vending personalizadas y de ultima generacion.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Badge variant="outline" className="py-2 px-4 gap-2">
                    <feature.icon className="h-4 w-4 text-primary" />
                    {feature.text}
                  </Badge>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="https://wa.me/+584146164177"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-hero-whatsapp"
              >
                <Button size="lg" className="w-full sm:w-auto gap-2 glow-primary" data-testid="button-hero-contact">
                  <SiWhatsapp className="h-5 w-5" />
                  Contactanos Ahora
                </Button>
              </a>
              <a href="#servicios" data-testid="link-hero-services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-hero-services">
                  Ver Servicios
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right content - Vending Machine Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              {/* Vending Machine Image */}
              <motion.img
                src={vendingMachineImage}
                alt="Maquinas Vending Todo Vending CA"
                className="w-auto max-w-lg h-auto max-h-[550px] object-contain drop-shadow-2xl"
                data-testid="img-hero-vending"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Decorative glowing elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-primary/30 rounded-full blur-2xl"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-28 h-28 bg-accent/30 rounded-full blur-2xl"
                animate={{ scale: [1.4, 1, 1.4], opacity: [0.5, 0.3, 0.5] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-1/2 -right-8 w-16 h-16 bg-primary/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <a href="#nosotros" className="text-muted-foreground hover:text-foreground transition-colors">
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </a>
      </motion.div>
    </section>
  );
}
