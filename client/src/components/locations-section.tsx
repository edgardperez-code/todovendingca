import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Stethoscope, 
  GraduationCap, 
  Dumbbell, 
  ShoppingBag, 
  Plane,
  MapPin,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const locationTypes = [
  {
    id: "1",
    name: "Centros Empresariales",
    type: "Oficinas",
    icon: Building2,
    description: "Las cafeterias y comedores suelen tener horarios limitados. Nuestras maquinas complementan perfectamente.",
    color: "from-blue-500/20 to-blue-600/10"
  },
  {
    id: "2",
    name: "Clinicas y Hospitales",
    type: "Salud",
    icon: Stethoscope,
    description: "Esenciales para pacientes, familiares y personal en turnos largos, disponibles fuera de horario.",
    color: "from-red-500/20 to-red-600/10"
  },
  {
    id: "3",
    name: "Universidades y Colegios",
    type: "Educacion",
    icon: GraduationCap,
    description: "Complementan cafeterias llenas en horas pico, ofreciendo opciones rapidas entre clases.",
    color: "from-amber-500/20 to-amber-600/10"
  },
  {
    id: "4",
    name: "Gimnasios y Deportivos",
    type: "Deportes",
    icon: Dumbbell,
    description: "Hidratacion y snacks accesibles para despues del entrenamiento, sin altos costos.",
    color: "from-green-500/20 to-green-600/10"
  },
  {
    id: "5",
    name: "Centros Comerciales",
    type: "Comercio",
    icon: ShoppingBag,
    description: "Reducen tiempos de espera y ofrecen variedad como complemento en areas de alto trafico.",
    color: "from-purple-500/20 to-purple-600/10"
  },
  {
    id: "6",
    name: "Terminales de Transporte",
    type: "Transporte",
    icon: Plane,
    description: "Ideales para viajeros con poco tiempo o presupuestos ajustados que necesitan opciones rapidas.",
    color: "from-cyan-500/20 to-cyan-600/10"
  }
];

const currentLocations = [
  {
    name: "Clinica Anzoategui",
    description: "Maquina de snacks y bebidas para pacientes, familiares y personal medico.",
    type: "Clinica"
  },
  {
    name: "Centro Empresarial Colon",
    description: "Snacks y bebidas preferidos para los profesionales del centro empresarial.",
    type: "Oficinas"
  },
  {
    name: "Centro Empresarial Oleus",
    description: "Soluciones de vending para profesionales y visitantes del centro empresarial.",
    type: "Oficinas"
  },
  {
    name: "Colegio Manglar",
    description: "Snacks y bebidas saludables para estudiantes y personal educativo.",
    type: "Educacion"
  },
  {
    name: "Clinica Zambrano",
    description: "Opciones de snacks y bebidas disponibles las 24 horas para pacientes y visitantes.",
    type: "Clinica"
  },
  {
    name: "Lion Gym",
    description: "Gran variedad de Bebidas Energeticas, Barras de Proteinas y mas para potenciar tus entrenamientos en Lecheria.",
    type: "Deportes"
  },
  {
    name: "Cancha 3x3 Parque Caribe",
    description: "Snacks, Barras de Proteinas, Bebidas Refrescantes y Energeticas en la Cancha de Basquet 3x3 del eje costero Playa Cangrejo, Lecheria.",
    type: "Deportes"
  }
];

export function LocationsSection() {
  return (
    <section
      id="ubicaciones"
      className="py-20 md:py-28 bg-muted/30"
      data-testid="section-locations"
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
            Donde Estamos
          </Badge>
          <h2 data-speakable className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Complementando</span>{" "}
            <span className="text-primary">Espacios</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nuestra filosofia se basa en complementar los servicios existentes, 
            no en competir con ellos. Transformamos cada espacio en una experiencia 
            mas conveniente.
          </p>
        </motion.div>

        {/* Location Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {locationTypes.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover-elevate group overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${location.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <location.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {location.name}
                        </h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {location.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {location.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Current Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <Badge className="mb-2">Aqui Estamos</Badge>
            <h3 className="text-2xl font-bold text-foreground">
              Nuestras Ubicaciones Actuales
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {currentLocations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {location.name}
                          </h4>
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs mb-2">
                          {location.type}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {location.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
