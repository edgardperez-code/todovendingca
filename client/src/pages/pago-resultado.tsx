import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvisoModoPrueba } from "@/components/aviso-modo-prueba";
import { SpidiAtribucion } from "@/components/spidi-atribucion";
import { useToast } from "@/hooks/use-toast";
import { useCarrito } from "@/lib/carrito";
import {
  formatoBs,
  formatoFechaHora,
  formatoTasa,
  formatoUsd,
  metodoPagoLegible,
} from "@/lib/formato";
import { useSEO } from "@/lib/seo";
import {
  borrarUltimoPedido,
  leerUltimoPedido,
  marcarUltimoPedidoPagado,
  urlResultadoPedido,
} from "@/lib/ultimo-pedido";
import {
  ESTADO_GIFT_CARD_PRUEBA,
  type EstadoPedido,
  type ErrorResponse,
  type PedidoPublico,
} from "@shared/tienda";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Printer,
  RefreshCw,
  SearchX,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

// Mientras el pedido esta pendiente se consulta cada 3 s. A los 10 minutos se
// deja de sondear (la sesion de SPIDI dura como mucho 20) y se ofrece
// reintentar a mano, para no dejar una pestana olvidada pegandole al servidor.
const INTERVALO_SONDEO_MS = 3000;
const LIMITE_SONDEO_MS = 10 * 60 * 1000;

const WHATSAPP = "584146164177";

const ESTADOS: readonly EstadoPedido[] = ["pendiente", "pagado", "fallido", "expirado", "error"];

interface Parametros {
  pedidoId: string;
  clave: string;
}

class PedidoNoEncontrado extends Error {
  constructor() {
    super("Pedido no encontrado");
    this.name = "PedidoNoEncontrado";
  }
}

function esPedidoPublico(cuerpo: unknown): cuerpo is PedidoPublico {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;
  const r = cuerpo as Record<string, unknown>;
  return (
    r.ok === true &&
    typeof r.id === "string" &&
    typeof r.numero === "string" &&
    typeof r.estado === "string" &&
    (ESTADOS as readonly string[]).includes(r.estado) &&
    Array.isArray(r.items) &&
    Array.isArray(r.giftCards) &&
    typeof r.totalUsd === "number"
  );
}

function esErrorResponse(cuerpo: unknown): cuerpo is ErrorResponse {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;
  const r = cuerpo as Record<string, unknown>;
  return r.ok === false && typeof r.error === "string" && r.error.length > 0;
}

// El servidor confirma el estado con SPIDI antes de responder: esta pagina
// nunca da un pago por bueno solo porque SPIDI redirigio hasta aqui.
async function consultarPedido({ pedidoId, clave }: Parametros): Promise<PedidoPublico> {
  const url = `/api/pedidos/${encodeURIComponent(pedidoId)}?${new URLSearchParams({ k: clave }).toString()}`;
  const respuesta = await fetch(url, { credentials: "include", cache: "no-store" });
  // Id inexistente o clave incorrecta: para el cliente es lo mismo.
  if ([400, 401, 403, 404].includes(respuesta.status)) throw new PedidoNoEncontrado();

  let cuerpo: unknown = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }
  if (respuesta.ok && esPedidoPublico(cuerpo)) return cuerpo;
  throw new Error(esErrorResponse(cuerpo) ? cuerpo.error : "No pudimos consultar tu pedido.");
}

// Gift Cards pagadas que se quedaron sin codigo (el pago llego cuando ya no
// quedaba stock): el equipo las entrega a mano. Se tolera un servidor viejo que
// no mande el campo.
function faltanCodigos(pedido: PedidoPublico): number {
  const n: unknown = pedido.faltanCodigos;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

// Se sigue consultando mientras el banco no confirma, y tambien si ya esta
// pagado pero los codigos aun no aparecen. Si el servidor ya dijo que faltan
// codigos por falta de stock, no tiene sentido seguir esperando: se entregan a mano.
function debeSondear(pedido: PedidoPublico): boolean {
  return (
    pedido.estado === "pendiente" ||
    (pedido.estado === "pagado" && pedido.giftCards.length === 0 && faltanCodigos(pedido) === 0)
  );
}

function enlaceWhatsApp(texto: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

// Solo se enlazan URLs web reales que vengan del servidor.
function esUrlWeb(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export default function PagoResultadoPage() {
  useSEO({
    title: "Resultado del pago | Todo Vending CA",
    description: "Estado de tu pago y tus códigos de Gift Card Todo Vending.",
    path: "/pago/resultado",
    noindex: true,
  });

  // undefined = todavia no se leyo la URL (SSR y primer render del cliente:
  // ambos muestran "Cargando" y la hidratacion coincide). null = no hay datos.
  const [parametros, setParametros] = useState<Parametros | null | undefined>(undefined);
  const [sondeoAgotado, setSondeoAgotado] = useState(false);
  // Cambia en cada "reintentar" para reiniciar el temporizador de 10 minutos.
  const [rondaSondeo, setRondaSondeo] = useState(0);
  const { cargado, vaciar } = useCarrito();
  const carritoVaciadoRef = useRef(false);

  // El scroll al cambiar de pagina lo maneja GestorScroll (lib/navegacion).
  useEffect(() => {
    // En SSR el servidor no ve la query, por eso se lee aqui y no en el render.
    const query = new URLSearchParams(window.location.search);
    const pedidoId = query.get("pedido");
    const clave = query.get("k");
    if (pedidoId && clave) {
      setParametros({ pedidoId, clave });
      return;
    }
    // Sin datos en la URL se usa el ultimo pedido de este navegador, y se deja
    // en la URL para que recargar o guardar el enlace funcione.
    const ultimo = leerUltimoPedido();
    if (ultimo) {
      window.history.replaceState(window.history.state, "", urlResultadoPedido(ultimo));
      setParametros({ pedidoId: ultimo.pedidoId, clave: ultimo.clave });
    } else {
      setParametros(null);
    }
  }, []);

  const consulta = useQuery({
    queryKey: ["/api/pedidos", parametros?.pedidoId ?? "", parametros?.clave ?? ""],
    queryFn: () => (parametros ? consultarPedido(parametros) : Promise.reject(new PedidoNoEncontrado())),
    enabled: !!parametros,
    staleTime: 0,
    refetchOnWindowFocus: true,
    // Un corte de red momentaneo no debe tumbar la pagina; un 404 si es final.
    retry: (fallos, error) => !(error instanceof PedidoNoEncontrado) && fallos < 2,
    refetchInterval: (query) => {
      const datos = query.state.data;
      if (sondeoAgotado || !datos) return false;
      return debeSondear(datos) ? INTERVALO_SONDEO_MS : false;
    },
  });

  useEffect(() => {
    if (!parametros || sondeoAgotado) return;
    const temporizador = window.setTimeout(() => setSondeoAgotado(true), LIMITE_SONDEO_MS);
    return () => window.clearTimeout(temporizador);
  }, [parametros, sondeoAgotado, rondaSondeo]);

  // Al confirmarse el pago se vacia el carrito UNA vez, y solo si este pedido
  // salio de este navegador (tv-ultimo-pedido): abrir un enlace viejo de otro
  // pedido no debe borrar un carrito nuevo. Se espera a que el carrito haya
  // cargado; si no, la carga desde localStorage lo volveria a llenar.
  // tv-ultimo-pedido no se borra: se marca pagado. Asi el comprador puede
  // volver a sus codigos aunque cierre la pestana, y la marca evita vaciar
  // otra vez el carrito (quiza ya con compras nuevas) en una visita posterior.
  const pedido = consulta.data;
  useEffect(() => {
    if (!pedido) return;
    const ultimo = leerUltimoPedido();
    const esDeEsteNavegador = ultimo !== null && ultimo.pedidoId === pedido.id;
    if (pedido.estado === "pagado") {
      if (!cargado || carritoVaciadoRef.current || ultimo === null || ultimo.pedidoId !== pedido.id) return;
      if (ultimo.pagado) return; // ya se vacio en una visita anterior
      carritoVaciadoRef.current = true;
      vaciar();
      marcarUltimoPedidoPagado(pedido.id);
    } else if (pedido.estado !== "pendiente" && esDeEsteNavegador) {
      // Fallido, expirado o error: ya no hay un pago en curso. El carrito se
      // conserva para volver a intentarlo.
      borrarUltimoPedido();
    }
  }, [pedido, cargado, vaciar]);

  const reintentar = () => {
    setSondeoAgotado(false);
    setRondaSondeo((n) => n + 1);
    void consulta.refetch();
  };

  let contenido: ReactNode;
  if (parametros === null) {
    contenido = <PedidoNoEncontradoVista />;
  } else if (parametros === undefined || (consulta.isPending && consulta.fetchStatus !== "idle")) {
    contenido = <Cargando />;
  } else if (!pedido) {
    contenido =
      consulta.error instanceof PedidoNoEncontrado ? (
        <PedidoNoEncontradoVista />
      ) : (
        <ErrorConsulta
          mensaje={consulta.error?.message ?? "No pudimos consultar tu pedido."}
          onReintentar={reintentar}
          reintentando={consulta.isFetching}
        />
      );
  } else if (pedido.estado === "pagado") {
    contenido = (
      <PagoExitoso
        pedido={pedido}
        esperandoCodigos={pedido.giftCards.length === 0 && faltanCodigos(pedido) === 0 && !sondeoAgotado}
      />
    );
  } else if (pedido.estado === "pendiente") {
    contenido = (
      <PagoPendiente
        pedido={pedido}
        agotado={sondeoAgotado}
        problemaConexion={consulta.isError}
        onReintentar={reintentar}
        reintentando={consulta.isFetching}
      />
    );
  } else {
    contenido = <PagoNoCompletado pedido={pedido} />;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-pago-resultado">
      <div className="print:hidden">
        <Header />
      </div>
      <main className="relative pt-28 md:pt-32 pb-20 md:pb-28 print:pt-0 print:pb-0">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none print:hidden" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Con el pedido cargado decide su propio modoPrueba (un pago real
                no se rotula de prueba por el modo actual del servidor, y uno de
                prueba se rotula aunque la config aun no haya llegado); mientras
                carga, la franja general de la tienda. */}
            {/* Esta pagina es de un pedido concreto: decide SOLO el pedido, nunca la
                franja general del servidor (un pago real no debe verse "de prueba"
                mientras carga o si la consulta falla). */}
            <AvisoModoPrueba delPedido={pedido ? pedido.modoPrueba : false} className="mb-8" />
            {contenido}
            <SpidiAtribucion className="mt-10" />
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

function EncabezadoEstado({
  icono,
  tono,
  titulo,
  children,
}: {
  icono: ReactNode;
  tono: "exito" | "espera" | "error";
  titulo: string;
  children?: ReactNode;
}) {
  const fondo =
    tono === "exito" ? "bg-primary/10 text-primary" : tono === "espera" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive";
  return (
    <div className="text-center mb-8">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 print:hidden ${fondo}`}>
        {icono}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{titulo}</h1>
      {children && <div className="text-muted-foreground max-w-xl mx-auto">{children}</div>}
    </div>
  );
}

function Cargando() {
  return (
    <div className="py-16" role="status" aria-live="polite" data-testid="resultado-cargando">
      <EncabezadoEstado icono={<Loader2 className="w-8 h-8 animate-spin" />} tono="espera" titulo="Consultando tu pedido">
        Un momento, por favor.
      </EncabezadoEstado>
    </div>
  );
}

function PedidoNoEncontradoVista() {
  return (
    <div data-testid="resultado-no-encontrado">
      <EncabezadoEstado icono={<SearchX className="w-8 h-8" />} tono="error" titulo="No encontramos tu pedido">
        Revisa que el enlace esté completo. Si pagaste y no ves tus códigos, escríbenos por WhatsApp y te
        ayudamos.
      </EncabezadoEstado>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="gap-2">
          <Link href="/gift-card">
            <Gift className="h-4 w-4" />
            Ver Gift Card
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2">
          <a
            href={enlaceWhatsApp("Hola, pagué una Gift Card y no encuentro mi pedido.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiWhatsapp className="h-4 w-4" />
            Escribir por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

function ErrorConsulta({
  mensaje,
  onReintentar,
  reintentando,
}: {
  mensaje: string;
  onReintentar: () => void;
  reintentando: boolean;
}) {
  return (
    <div data-testid="resultado-error-consulta">
      <EncabezadoEstado icono={<AlertCircle className="w-8 h-8" />} tono="error" titulo="No pudimos consultar tu pedido">
        {mensaje} Si ya pagaste, tu pago no se pierde: vuelve a consultar en unos segundos.
      </EncabezadoEstado>
      <div className="flex justify-center">
        <Button size="lg" className="gap-2" onClick={onReintentar} disabled={reintentando}>
          {reintentando ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Consultar de nuevo
        </Button>
      </div>
    </div>
  );
}

function PagoPendiente({
  pedido,
  agotado,
  problemaConexion,
  onReintentar,
  reintentando,
}: {
  pedido: PedidoPublico;
  agotado: boolean;
  problemaConexion: boolean;
  onReintentar: () => void;
  reintentando: boolean;
}) {
  return (
    <div data-testid="resultado-pendiente">
      {agotado ? (
        <EncabezadoEstado
          icono={<Clock className="w-8 h-8" />}
          tono="espera"
          titulo="Aún no tenemos la confirmación del banco"
        >
          Si ya pagaste, la confirmación puede tardar un poco más. No vuelvas a pagar: consulta de nuevo en
          unos minutos.
        </EncabezadoEstado>
      ) : (
        <div role="status" aria-live="polite">
          <EncabezadoEstado
            icono={<Loader2 className="w-8 h-8 animate-spin" />}
            tono="espera"
            titulo="Confirmando tu pago con el banco"
          >
            Esto suele tardar unos segundos. No cierres esta página.
          </EncabezadoEstado>
        </div>
      )}

      {problemaConexion && !agotado && (
        <p className="text-center text-sm text-muted-foreground mb-6">
          Tenemos problemas de conexión. Seguimos intentando...
        </p>
      )}

      <Card className="mb-6">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Pedido</p>
            <p className="font-semibold text-foreground">{pedido.numero}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-semibold text-foreground tabular-nums">{formatoUsd(pedido.totalUsd)}</p>
          </div>
        </CardContent>
      </Card>

      {agotado && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="gap-2" onClick={onReintentar} disabled={reintentando}>
            {reintentando ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Consultar de nuevo
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <a
              href={enlaceWhatsApp(`Hola, tengo una consulta sobre mi pedido ${pedido.numero} de Gift Card.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiWhatsapp className="h-4 w-4" />
              Escribir por WhatsApp
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

function PagoNoCompletado({ pedido }: { pedido: PedidoPublico }) {
  const titulo =
    pedido.estado === "expirado"
      ? "El tiempo para pagar se agotó"
      : pedido.estado === "error"
        ? "No pudimos iniciar el pago"
        : "El pago no se completó";

  return (
    <div data-testid="resultado-no-completado">
      <EncabezadoEstado icono={<XCircle className="w-8 h-8" />} tono="error" titulo={titulo}>
        Tu carrito sigue guardado: puedes intentarlo de nuevo cuando quieras.
      </EncabezadoEstado>

      <Card className="mb-6">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Pedido</span>
            <span className="font-semibold text-foreground">{pedido.numero}</span>
          </div>
          {pedido.motivo && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground">Motivo</span>
              <span className="text-right text-foreground" data-testid="text-motivo">
                {pedido.motivo}
              </span>
            </div>
          )}
          <p className="text-sm text-muted-foreground pt-1">
            Si tu banco te debitó el monto, escríbenos por WhatsApp con el número de pedido y lo revisamos.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="gap-2">
          <Link href="/carrito" data-testid="link-volver-carrito">
            <ShoppingCart className="h-4 w-4" />
            Volver al carrito
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2">
          <a
            href={enlaceWhatsApp(`Hola, tengo una consulta sobre mi pedido ${pedido.numero} de Gift Card.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiWhatsapp className="h-4 w-4" />
            Escribir por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

function BotonCopiar({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  const [copiado, setCopiado] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!copiado) return;
    const t = window.setTimeout(() => setCopiado(false), 2000);
    return () => window.clearTimeout(t);
  }, [copiado]);

  const copiar = async () => {
    try {
      // navigator.clipboard solo existe en contextos seguros (https).
      if (!navigator.clipboard) throw new Error("Portapapeles no disponible");
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      toast({
        variant: "destructive",
        title: "No se pudo copiar",
        description: "Selecciona el código y cópialo a mano.",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1 print:hidden"
      onClick={copiar}
      aria-label={etiqueta}
    >
      {copiado ? <Check className="text-primary" /> : <Copy />}
      {copiado ? "Copiado" : "Copiar"}
    </Button>
  );
}

function FilaComprobante({ etiqueta, valor, testId }: { etiqueta: string; valor: ReactNode; testId?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium text-foreground text-right break-all" data-testid={testId}>
        {valor}
      </dd>
    </div>
  );
}

function PagoExitoso({ pedido, esperandoCodigos }: { pedido: PedidoPublico; esperandoCodigos: boolean }) {
  const pago = pedido.pago;
  const metodo = metodoPagoLegible(pago?.metodo ?? null);
  const comprobanteUrl = pago?.comprobanteUrl && esUrlWeb(pago.comprobanteUrl) ? pago.comprobanteUrl : null;

  // Solo se muestran los datos que SPIDI reporto; los que faltan se omiten.
  const filasPago: Array<{ etiqueta: string; valor: string | null; testId: string }> = [
    { etiqueta: "Fecha del pago", valor: pago?.pagadoEn ? formatoFechaHora(pago.pagadoEn) : null, testId: "comprobante-fecha" },
    { etiqueta: "Monto pagado", valor: pago?.montoVes != null ? formatoBs(pago.montoVes) : null, testId: "comprobante-monto-bs" },
    { etiqueta: "Tasa BCV", valor: pago?.tasaBcvUsdVes != null ? formatoTasa(pago.tasaBcvUsdVes) : null, testId: "comprobante-tasa" },
    { etiqueta: "Método de pago", valor: metodo, testId: "comprobante-metodo" },
    { etiqueta: "Banco", valor: pago?.banco ?? null, testId: "comprobante-banco" },
    { etiqueta: "Referencia bancaria", valor: pago?.referenciaBancaria ?? null, testId: "comprobante-referencia" },
    {
      etiqueta: "N° de transacción SPIDI",
      valor: pago?.spidiTransaccionId != null ? String(pago.spidiTransaccionId) : null,
      testId: "comprobante-transaccion",
    },
  ];

  // Codigos emitidos para un pedido de prueba (TVP-, pago no real): se rotulan
  // para que nadie los guarde como si valieran.
  const esDePrueba = (estado: string) => estado === ESTADO_GIFT_CARD_PRUEBA;
  const hayCodigosDePrueba = pedido.giftCards.some((gc) => esDePrueba(gc.estado));
  const varios = pedido.giftCards.length > 1;
  const faltan = faltanCodigos(pedido);

  return (
    <div data-testid="resultado-pagado">
      <EncabezadoEstado
        icono={<CheckCircle2 className="w-8 h-8" />}
        tono="exito"
        titulo={pedido.modoPrueba ? "¡Pago de prueba confirmado!" : "¡Pago confirmado!"}
      >
        Gracias, {pedido.comprador.nombre}. Tu pedido {pedido.numero} está pagado.
      </EncabezadoEstado>

      {/* Codigos */}
      <Card className="mb-6 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {hayCodigosDePrueba
              ? varios
                ? "Tus códigos de prueba"
                : "Tu código de prueba"
              : varios
                ? "Tus códigos de Gift Card"
                : "Tu código de Gift Card"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {hayCodigosDePrueba
              ? "Se emitieron con un pago de prueba, que no es real: no sirven para canjear."
              : "Guarda o imprime estos códigos: los necesitarás para usar tus Gift Cards."}
          </p>
        </CardHeader>
        <CardContent>
          {faltan > 0 && (
            <div
              className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
              role="status"
              data-testid="aviso-faltan-codigos"
            >
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                {faltan === 1
                  ? "Una de tus Gift Cards se agotó justo mientras pagabas. Tu pago está registrado y te contactaremos por correo para entregártela en cuanto repongamos el stock."
                  : `${faltan} de tus Gift Cards se agotaron justo mientras pagabas. Tu pago está registrado y te contactaremos por correo para entregártelas en cuanto repongamos el stock.`}{" "}
                Si tienes dudas, escríbenos por WhatsApp con tu número de pedido {pedido.numero}.
              </p>
            </div>
          )}
          {pedido.giftCards.length === 0 && faltan > 0 ? null : pedido.giftCards.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              {esperandoCodigos && <Loader2 className="h-4 w-4 animate-spin" />}
              {esperandoCodigos
                ? "Estamos generando tus códigos..."
                : "Tus códigos aún no aparecen. Recarga la página en unos minutos o escríbenos por WhatsApp."}
            </p>
          ) : (
            <ul className="space-y-3" data-testid="lista-gift-cards">
              {pedido.giftCards.map((gc, i) => (
                <li
                  key={gc.codigo}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Gift Card {i + 1} · {formatoUsd(gc.montoUsd)}
                      </span>
                      {esDePrueba(gc.estado) && (
                        <span
                          className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
                          data-testid={`etiqueta-prueba-gift-card-${i}`}
                        >
                          De prueba · no se puede canjear
                        </span>
                      )}
                    </p>
                    <p
                      className="font-mono text-lg font-semibold tracking-wider text-foreground select-all break-all"
                      data-testid={`codigo-gift-card-${i}`}
                    >
                      {gc.codigo}
                    </p>
                  </div>
                  <BotonCopiar texto={gc.codigo} etiqueta={`Copiar código de la Gift Card ${i + 1}`} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Comprobante */}
      <Card className="mb-6" data-testid="comprobante">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Comprobante de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <FilaComprobante etiqueta="Pedido" valor={pedido.numero} testId="comprobante-pedido" />
            <FilaComprobante etiqueta="Comprador" valor={pedido.comprador.nombre} testId="comprobante-comprador" />
            <FilaComprobante etiqueta="Correo" valor={pedido.comprador.email} />
            {pedido.items.map((item) => (
              <FilaComprobante
                key={item.productoId}
                etiqueta={`${item.cantidad} × ${item.nombre}`}
                valor={formatoUsd(item.subtotalUsd)}
              />
            ))}
            <FilaComprobante
              etiqueta="Total"
              valor={<span className="text-base font-bold">{formatoUsd(pedido.totalUsd)}</span>}
              testId="comprobante-total-usd"
            />
            {filasPago
              .filter((f): f is { etiqueta: string; valor: string; testId: string } => f.valor !== null)
              .map((f) => (
                <FilaComprobante key={f.etiqueta} etiqueta={f.etiqueta} valor={f.valor} testId={f.testId} />
              ))}
          </dl>

          <Separator className="my-4 print:hidden" />

          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            {comprobanteUrl && (
              <Button asChild variant="outline" className="gap-2">
                <a href={comprobanteUrl} target="_blank" rel="noopener noreferrer" data-testid="link-comprobante-oficial">
                  <ExternalLink className="h-4 w-4" />
                  Ver comprobante oficial
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => window.print()}
              data-testid="button-imprimir"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <Button asChild size="lg" variant="outline" className="gap-2">
          <Link href="/gift-card">
            <Gift className="h-4 w-4" />
            Comprar otra Gift Card
          </Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
