import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Zap, 
  Building, 
  Shield, 
  TrendingUp,
  Handshake
} from "lucide-react";
import { motion } from "framer-motion";

const valueProps = [
  {
    id: "1",
    title: "Satisfaccion Garantizada",
    description: "Ofrecemos soluciones que mejoran la comodidad y el bienestar de tus empleados, clientes o usuarios.",
    icon: Heart,
    highlight: true
  },
  {
    id: "2",
    title: "Eficiencia y Productividad",
    description: "Proporcionamos acceso rapido y facil a productos esenciales, ahorrando tiempo y aumentando la productividad.",
    icon: Zap,
    highlight: false
  },
  {
    id: "3",
    title: "Imagen Corporativa",
    description: "Proyectamos una imagen moderna e innovadora de tu empresa o institucion con tecnologia de punta.",
    icon: Building,
    highlight: false
  },
  {
    id: "4",
    title: "Tranquilidad Total",
    description: "Nos encargamos de todo, desde la instalacion hasta el mantenimiento, permitiendote concentrarte en tu actividad principal.",
    icon: Shield,
    highlight: true
  },
  {
    id: "5",
    title: "Generacion de Ingresos",
    description: "Ofrecemos modelos de negocio flexibles que pueden generar ingresos adicionales para tu negocio.",
    icon: TrendingUp,
    highlight: false
  },
  {
    id: "6",
    title: "Aliado Estrategico",
    description: "Nos convertimos en un socio que entiende tus necesidades y trabaja contigo para superarlas.",
    icon: Handshake,
    highlight: false
  }
];

export function ValuePropsSection() {
  return (
    <section
      id="propuesta"
      className="py-20 md:py-28"
      data-testid="section-value-props"
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
            Nuestra Propuesta
          </Badge>
          <h2 data-speakable className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Un</span>{" "}
            <span className="text-primary">Aliado Estrategico</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En Todo Vending CA, nos enfocamos en ser mas que un simple proveedor. 
            Somos una solucion integral que se convierte en tu aliado estrategico.
          </p>
        </motion.div>

        {/* Value Props Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`h-full hover-elevate group ${
                  prop.highlight 
                    ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" 
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    prop.highlight 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-primary/10 text-primary group-hover:bg-primary/20"
                  }`}>
                    <prop.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {prop.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {prop.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white overflow-hidden">
            <CardContent className="py-12 px-8 md:px-16 relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
              
              <div className="relative text-center max-w-3xl mx-auto">
                <div className="text-5xl text-primary mb-6">"</div>
                <p className="text-xl md:text-2xl font-medium mb-6 leading-relaxed">
                  Podemos transformar cada uno de tus espacios en una experiencia 
                  mas conveniente y placentera colocando una de nuestras maquinas.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold">TV</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Todo Vending CA</p>
                    <p className="text-sm text-gray-400">Lecheria, Anzoategui</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
