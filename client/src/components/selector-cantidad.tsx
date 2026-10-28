import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Control "- n +" para cantidades. No permite escribir: con topes de 10
// unidades los botones bastan y se evitan valores invalidos.
export function SelectorCantidad({
  valor,
  min = 1,
  max,
  onCambiar,
  etiqueta,
  deshabilitado = false,
  tamano = "default",
  testId,
}: {
  valor: number;
  min?: number;
  max: number;
  onCambiar: (valor: number) => void;
  // Texto para lectores de pantalla, p. ej. "Cantidad de Gift Cards".
  etiqueta: string;
  deshabilitado?: boolean;
  tamano?: "default" | "sm";
  testId?: string;
}) {
  const puedeBajar = !deshabilitado && valor > min;
  const puedeSubir = !deshabilitado && valor < max;
  const boton = tamano === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div
      role="group"
      aria-label={etiqueta}
      className="inline-flex items-center rounded-lg border bg-background"
      data-testid={testId}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("rounded-r-none", boton)}
        onClick={() => onCambiar(valor - 1)}
        disabled={!puedeBajar}
        aria-label="Restar una unidad"
        data-testid={testId ? `${testId}-menos` : undefined}
      >
        <Minus />
      </Button>
      <span
        className={cn(
          "min-w-10 px-2 text-center font-semibold tabular-nums text-foreground",
          tamano === "sm" ? "text-sm" : "text-base",
          deshabilitado && "text-muted-foreground",
        )}
        aria-live="polite"
        data-testid={testId ? `${testId}-valor` : undefined}
      >
        {valor}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("rounded-l-none", boton)}
        onClick={() => onCambiar(valor + 1)}
        disabled={!puedeSubir}
        aria-label="Sumar una unidad"
        data-testid={testId ? `${testId}-mas` : undefined}
      >
        <Plus />
      </Button>
    </div>
  );
}
