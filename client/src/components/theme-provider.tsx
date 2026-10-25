import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
  // El tema que se ve de verdad: "system" ya resuelto con prefers-color-scheme.
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
});

// El tema inicial lo aplica un script inline en index.html antes de pintar,
// para que no haya parpadeo. Aquí solo se mantiene sincronizado.
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vending-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  // Hasta leer la preferencia guardada no se toca la clase: el script inline ya
  // la dejó bien, y aplicar "system" antes daba un destello oscuro a quien
  // había elegido claro con el teléfono en modo oscuro.
  const [leido, setLeido] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) as Theme | null;
      if (saved === "dark" || saved === "light") setThemeState(saved);
    } catch {}
    setResolvedTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setLeido(true);
  }, [storageKey]);

  useEffect(() => {
    if (!leido) return;
    const root = document.documentElement;
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
      setResolvedTheme(dark ? "dark" : "light");
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, leido]);

  const setTheme = (t: Theme) => {
    try {
      localStorage.setItem(storageKey, t);
    } catch {}
    setThemeState(t);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
