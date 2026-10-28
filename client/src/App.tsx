import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import MaquinasLecheria from "@/pages/maquinas-expendedoras-lecheria";
import VendingEmpresas from "@/pages/vending-para-empresas";
import VendingGimnasios from "@/pages/vending-gimnasios";
import GiftCard from "@/pages/gift-card";
import Carrito from "@/pages/carrito";
import PagoResultado from "@/pages/pago-resultado";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { CarritoProvider } from "@/lib/carrito";
import { GestorScroll } from "@/lib/navegacion";
import { MotionConfig } from "framer-motion";

// Nota: /cafe-oriente NO se enruta aqui. Es una pagina estatica con diseno
// propio (client/public/cafe-oriente/index.html) servida directo por Express
// en server/routes.ts, para preservar su diseno original exacto.
function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/maquinas-expendedoras-lecheria" component={MaquinasLecheria} />
      <Route path="/vending-para-empresas" component={VendingEmpresas} />
      <Route path="/vending-gimnasios" component={VendingGimnasios} />
      {/* Tienda: /carrito y /pago/resultado son noindex (ver useSEO). */}
      <Route path="/gift-card" component={GiftCard} />
      <Route path="/carrito" component={Carrito} />
      <Route path="/pago/resultado" component={PagoResultado} />
      {/* Panel del dueño: noindex y sin enlace en el menú público. */}
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vending-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* El carrito envuelve toda la app: el header muestra el contador. */}
          <CarritoProvider>
            {/* reducedMotion="user": con "reducir movimiento" activado en el
                sistema, framer-motion no mueve nada (solo cambia opacidades). */}
            <MotionConfig reducedMotion="user">
              <Toaster />
              <AppRoutes />
              {/* Pagina nueva arriba, o en su #seccion (ver lib/navegacion). */}
              <GestorScroll />
            </MotionConfig>
          </CarritoProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
