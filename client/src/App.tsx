import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import MaquinasLecheria from "@/pages/maquinas-expendedoras-lecheria";
import VendingEmpresas from "@/pages/vending-para-empresas";
import VendingClinicas from "@/pages/vending-para-clinicas";
import VendingGimnasios from "@/pages/vending-gimnasios";
import PreguntasFrecuentes from "@/pages/preguntas-frecuentes";
import NotFound from "@/pages/not-found";

// /cafe-oriente y /vasos NO se enrutan aquí: son páginas estáticas con diseño
// propio (client/public/...) servidas directo por Express en server/routes.ts.
// Las rutas de abajo deben coincidir con shared/site.ts (ROUTES).
function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/maquinas-expendedoras-lecheria" component={MaquinasLecheria} />
      <Route path="/vending-para-empresas" component={VendingEmpresas} />
      <Route path="/vending-para-clinicas" component={VendingClinicas} />
      <Route path="/vending-gimnasios" component={VendingGimnasios} />
      <Route path="/preguntas-frecuentes" component={PreguntasFrecuentes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vending-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <AppRoutes />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
