import { FlaskConical } from "lucide-react";
import { useModoPrueba } from "@/lib/config-tienda";
import { cn } from "@/lib/utils";

// Franja que avisa que la tienda esta en modo prueba (cobra contra un entorno de
// prueba de SPIDI: simulador, sandbox u otro). Va en /gift-card, /carrito y
// /pago/resultado.
//
// No se pinta en el SSR ni en el primer render del cliente (useModoPrueba aun
// no tiene datos): asi no rompe la hidratacion. Se imprime a proposito: un
// comprobante de prueba impreso debe seguir diciendo que es de prueba.
//
// `delPedido`: en la pagina de resultado, el modoPrueba del propio pedido. Si
// viene, decide solo el (aunque la config no haya llegado): un pago real no se
// rotula de prueba porque el servidor este ahora en modo prueba, y uno de
// prueba se rotula aunque el servidor ya este en produccion. Mientras el pedido
// no ha cargado (undefined), se usa la franja general del servidor.
export function AvisoModoPrueba({ delPedido, className }: { delPedido?: boolean; className?: string }) {
  const modoPruebaTienda = useModoPrueba();
  const mostrar = delPedido ?? modoPruebaTienda;
  if (!mostrar) return null;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900",
        "dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
        className,
      )}
      data-testid="aviso-modo-prueba"
    >
      <FlaskConical className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Modo de prueba:</strong> los pagos no son reales y las Gift Cards
        emitidas no sirven para canjear.
      </p>
    </div>
  );
}
