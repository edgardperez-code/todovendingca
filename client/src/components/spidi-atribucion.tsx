import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Leyenda "Desarrollado por SPIDI" con el logotipo oficial. Es uno de los
// elementos obligatorios de la pantalla de pago que SPIDI revisa en la
// certificacion: va debajo del boton de pago y en el resultado.
//
// El logo se sirve desde /spidi-logo.png (client/public/). Hasta que se ponga
// el archivo oficial que entrega SPIDI, la imagen se oculta y queda el texto.
export function SpidiAtribucion({ className }: { className?: string }) {
  const [logoDisponible, setLogoDisponible] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Con SSR la imagen puede fallar ANTES de que React hidrate, y entonces
  // onError nunca llega a dispararse. Se revisa una vez al montar. (Por eso la
  // imagen no lleva loading="lazy": algunos navegadores marcan complete=true en
  // una imagen diferida que aun no cargo, y se ocultaria sin razon.)
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setLogoDisponible(false);
    }
  }, []);

  return (
    <div
      className={cn("flex items-center justify-center gap-2 text-xs text-muted-foreground", className)}
      data-testid="spidi-atribucion"
    >
      {logoDisponible && (
        <img
          ref={imgRef}
          src="/spidi-logo.png"
          alt="SPIDI"
          className="h-5 w-auto"
          decoding="async"
          onError={() => setLogoDisponible(false)}
        />
      )}
      <span>
        Desarrollado por <span className="font-semibold text-foreground">SPIDI</span>
      </span>
    </div>
  );
}
