import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ testId = "button-theme-toggle" }: { testId?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // Se decide por el tema visible: con "system" y el teléfono en oscuro, el
  // primer toque tiene que pasar a claro, no "a oscuro" (que no cambiaba nada).
  const next = resolvedTheme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:text-white"
      aria-label={next === "dark" ? "Activar modo oscuro" : "Activar modo claro"}
      data-testid={testId}
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
