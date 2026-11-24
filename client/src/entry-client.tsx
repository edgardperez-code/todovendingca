import { hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import { DatosInicialesProvider, leerDatosDelNavegador } from "./lib/datos-iniciales";
import "./index.css";

hydrateRoot(
  document.getElementById("root")!,
  <DatosInicialesProvider datos={leerDatosDelNavegador()}>
    <Router>
      <App />
    </Router>
  </DatosInicialesProvider>,
);
