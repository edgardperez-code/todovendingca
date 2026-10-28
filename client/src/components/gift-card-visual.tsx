import { cn } from "@/lib/utils";

type Tamano = "sm" | "md" | "lg";

// Tamanos de texto por variante: la tarjeta mantiene la proporcion de una
// tarjeta fisica (85,6 x 54 mm) y el contenido escala con ella.
const estilos: Record<
  Tamano,
  { padding: string; logo: string; logoTexto: string; marca: string; etiqueta: string; monto: string; pie: string; chip: string }
> = {
  sm: {
    padding: "p-2",
    logo: "w-4 h-4 rounded-[3px]",
    logoTexto: "text-[6px]",
    marca: "hidden",
    etiqueta: "text-[6px] tracking-[0.15em]",
    monto: "text-lg",
    pie: "hidden",
    // En miniatura no cabe el chip: se oculta para que no se encime al monto.
    chip: "hidden",
  },
  md: {
    padding: "p-5",
    logo: "w-8 h-8 rounded-md",
    logoTexto: "text-xs",
    marca: "text-sm",
    etiqueta: "text-[10px] tracking-[0.25em]",
    monto: "text-5xl",
    pie: "text-[10px]",
    chip: "w-9 h-7 rounded-md",
  },
  lg: {
    padding: "p-6 md:p-8",
    logo: "w-10 h-10 rounded-md",
    logoTexto: "text-sm",
    marca: "text-base md:text-lg",
    etiqueta: "text-xs tracking-[0.3em]",
    monto: "text-6xl md:text-7xl",
    pie: "text-xs",
    chip: "w-11 h-8 rounded-md",
  },
};

// Dibujo de la Gift Card con los colores de la marca (primario a acento). Es
// solo decorativo: el precio que vale siempre sale del catalogo.
export function GiftCardVisual({
  montoUsd,
  tamano = "md",
  className,
}: {
  montoUsd: number;
  tamano?: Tamano;
  className?: string;
}) {
  const e = estilos[tamano];
  const monto = Number.isInteger(montoUsd) ? String(montoUsd) : montoUsd.toFixed(2);

  return (
    <div
      role="img"
      aria-label={`Gift Card Todo Vending de $${monto}`}
      className={cn(
        "relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl text-white shadow-2xl select-none",
        "bg-gradient-to-br from-primary via-primary to-accent",
        tamano === "sm" && "rounded-md shadow-md",
        className,
      )}
    >
      {/* Brillos y trama decorativa */}
      <div className="absolute -top-1/3 -right-1/4 w-3/4 aspect-square rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-1/2 -left-1/4 w-3/4 aspect-square rounded-full bg-accent/40 blur-2xl" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: tamano === "sm" ? "6px 6px" : "14px 14px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />

      <div className={cn("relative h-full flex flex-col justify-between", e.padding)}>
        {/* Marca y etiqueta */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn("bg-white flex items-center justify-center shadow-sm", e.logo)}>
              <span className={cn("font-bold text-primary leading-none", e.logoTexto)}>TV</span>
            </div>
            <span className={cn("font-semibold leading-tight", e.marca)}>
              Todo Vending <span className="text-white/80">CA</span>
            </span>
          </div>
          <span className={cn("font-semibold uppercase text-white/90", e.etiqueta)}>Gift Card</span>
        </div>

        {/* Chip */}
        <div
          className={cn(
            "bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 shadow-inner border border-amber-100/60",
            e.chip,
          )}
        />

        {/* Monto y pie */}
        <div className="flex items-end justify-between gap-2">
          <p className={cn("font-extrabold leading-none tracking-tight drop-shadow-md", e.monto)}>
            <span className="align-top text-[0.55em] mr-0.5">$</span>
            {monto}
          </p>
          <p className={cn("text-right text-white/85 leading-snug", e.pie)}>
            Snacks · Bebidas · Café
            <br />
            Todo Vending y Café Oriente
          </p>
        </div>
      </div>
    </div>
  );
}
