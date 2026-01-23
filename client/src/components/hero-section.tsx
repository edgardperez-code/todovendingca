import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { motion } from "framer-motion";

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

          {/* Right content - Vending Machine Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:flex justify-center"
          >
            <div className="relative">
              {/* Vending Machine SVG Illustration */}
              <div className="w-80 h-[500px] bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-700 dark:border-slate-600">
                {/* Machine top */}
                <div className="h-16 bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg tracking-wider">
                    TODO VENDING
                  </span>
                </div>
                
                {/* Display area with product slots */}
                <div className="p-4 bg-slate-200 dark:bg-slate-300 m-3 rounded-lg h-72">
                  <div className="grid grid-cols-3 gap-2 h-full">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="bg-white dark:bg-slate-100 rounded-md flex items-center justify-center shadow-inner"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                      >
                        <div
                          className={`w-8 h-12 rounded ${
                            i % 3 === 0
                              ? "bg-red-400"
                              : i % 3 === 1
                              ? "bg-blue-400"
                              : "bg-green-400"
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Keypad area */}
                <div className="mx-4 flex gap-3">
                  <div className="flex-1 bg-slate-700 rounded-lg p-3">
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div
                          key={num}
                          className="bg-slate-600 rounded text-center py-1 text-xs text-slate-300"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-16 bg-slate-600 rounded-lg flex items-center justify-center">
                    <div className="w-10 h-6 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">TAP</span>
                    </div>
                  </div>
                </div>

                {/* Pickup slot */}
                <div className="mx-4 mt-4 h-16 bg-slate-950 rounded-lg flex items-center justify-center border-2 border-slate-600">
                  <motion.div
                    className="text-slate-500 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Retire su producto aqui
                  </motion.div>
                </div>
              </div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-xl"
                animate={{ scale: [1.3, 1, 1.3] }}
                transition={{ duration: 5, repeat: Infinity }}
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
