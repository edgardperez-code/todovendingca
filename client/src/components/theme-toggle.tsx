import { useTheme } from "@/components/theme-provider";
import { Icono } from "@/components/vitrina/iconos";

interface ThemeToggleProps {
  testId?: string;
}

// Selector de tema con el botón de icono del diseño Vitrina (44 px). El icono
// se elige por CSS (clase .dark en <html>), así el HTML del servidor vale para
// los dos temas y no hay salto al hidratar.
export function ThemeToggle({ testId = "button-theme-toggle" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className="v-icb"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      data-testid={testId}
    >
      <Icono nombre="sol" className="dark:hidden" />
      <Icono nombre="luna" className="hidden dark:block" />
      <span className="sr-only">Cambiar tema</span>
    </button>
  );
}
