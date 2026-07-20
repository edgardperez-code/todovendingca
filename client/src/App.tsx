import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import CafeOriente from "@/pages/cafe-oriente";
import MaquinasLecheria from "@/pages/maquinas-expendedoras-lecheria";
import VendingEmpresas from "@/pages/vending-para-empresas";
import VendingGimnasios from "@/pages/vending-gimnasios";
import NotFound from "@/pages/not-found";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cafe-oriente" component={CafeOriente} />
      <Route path="/maquinas-expendedoras-lecheria" component={MaquinasLecheria} />
      <Route path="/vending-para-empresas" component={VendingEmpresas} />
      <Route path="/vending-gimnasios" component={VendingGimnasios} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vending-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
