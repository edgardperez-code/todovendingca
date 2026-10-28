import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useFormField,
} from "@/components/ui/form";
import { AvisoModoPrueba } from "@/components/aviso-modo-prueba";
import { GiftCardVisual } from "@/components/gift-card-visual";
import { SelectorCantidad } from "@/components/selector-cantidad";
import { SpidiAtribucion } from "@/components/spidi-atribucion";
import { useToast } from "@/hooks/use-toast";
import { useCarrito } from "@/lib/carrito";
import { useStock } from "@/lib/stock-tienda";
import { formatoUsd, textoUnidades } from "@/lib/formato";
import { useSEO } from "@/lib/seo";
import {
  avisoUltimoPedido,
  guardarUltimoPedido,
  leerUltimoPedido,
  urlResultadoPedido,
  type AvisoUltimoPedido,
  type UltimoPedido,
} from "@/lib/ultimo-pedido";
import {
  compradorSchema,
  type CheckoutRequest,
  type CheckoutResponse,
  type CodigoError,
  type Comprador,
  type ErrorResponse,
} from "@shared/tienda";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Gift,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from "lucide-react";

// "listo": se puede pagar. "enviando": POST /api/checkout en vuelo.
// "redirigiendo": el servidor ya devolvio payment_url y el navegador se esta
// yendo a SPIDI. En los dos ultimos el boton queda bloqueado: es requisito de
// certificacion de SPIDI y la defensa contra el doble cobro.
type EstadoEnvio = "listo" | "enviando" | "redirigiendo";

// Aviso sobre el ultimo pedido de este navegador que se muestra arriba del
// carrito. Se calcula en efectos (usa localStorage y la hora), nunca en el render.
interface AvisoPedido {
  tipo: AvisoUltimoPedido;
  pedido: UltimoPedido;
}

function leerAvisoPedido(): AvisoPedido | null {
  const pedido = leerUltimoPedido();
  const tipo = avisoUltimoPedido(pedido);
  return pedido && tipo ? { tipo, pedido } : null;
}

class ErrorCheckout extends Error {
  // true si el servidor respondio con un error claro ({ ok: false, error }) que
  // dice que el pedido de esa clave no se creo o fallo: el siguiente intento
  // debe usar una clave nueva.
  // false si no hubo respuesta (o no se pudo leer): quiza el pedido si se
  // creo, asi que el reintento reutiliza la misma clave de idempotencia y el
  // servidor devuelve el mismo pedido en vez de crear otro.
  // Tambien es false con los codigos de CODIGOS_CONSERVAN_CLAVE ("EN_PROCESO"
  // y "LIMITE"): esa respuesta no dice nada de como termino un intento
  // anterior con la misma clave, asi que no hay que soltarla.
  readonly definitivo: boolean;
  readonly codigo: CodigoError | null;

  constructor(mensaje: string, definitivo: boolean, codigo: CodigoError | null = null) {
    super(mensaje);
    this.name = "ErrorCheckout";
    this.definitivo = definitivo;
    this.codigo = codigo;
  }
}

// Los mensajes de compradorSchema (shared/tienda.ts) vienen sin tildes; aqui
// se muestran bien escritos sin tocar el contrato compartido.
const MENSAJES_CON_TILDE: Record<string, string> = {
  "Correo invalido": "Correo inválido",
  "Telefono invalido": "Teléfono inválido",
};

function MensajeCampo() {
  const { error, formMessageId } = useFormField();
  const mensaje = error?.message ? String(error.message) : "";
  if (!mensaje) return null;
  return (
    <p id={formMessageId} className="text-sm font-medium text-destructive">
      {MENSAJES_CON_TILDE[mensaje] ?? mensaje}
    </p>
  );
}

// crypto.randomUUID solo existe en contextos seguros (https o localhost); si
// falta, se arma un UUID v4 con getRandomValues, que esta en todos lados.
function generarClaveIdempotencia(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function esRespuestaCheckout(cuerpo: unknown): cuerpo is CheckoutResponse {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;
  const r = cuerpo as Record<string, unknown>;
  return (
    r.ok === true &&
    typeof r.pedidoId === "string" &&
    typeof r.clave === "string" &&
    typeof r.paymentUrl === "string"
  );
}

function esErrorResponse(cuerpo: unknown): cuerpo is ErrorResponse {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;
  const r = cuerpo as Record<string, unknown>;
  return r.ok === false && typeof r.error === "string" && r.error.length > 0;
}

const CODIGOS_ERROR: readonly CodigoError[] = ["EN_PROCESO", "LIMITE", "NO_DISPONIBLE", "SIN_STOCK"];

// Un codigo desconocido (servidor mas nuevo que esta pagina) se ignora.
function leerCodigoError(valor: unknown): CodigoError | null {
  return (CODIGOS_ERROR as readonly unknown[]).includes(valor) ? (valor as CodigoError) : null;
}

// Errores con los que se CONSERVA la clave de idempotencia para el reintento:
// - "EN_PROCESO": el pedido de esa clave existe y el servidor aun esta creando
//   su sesion en SPIDI; con la misma clave, el siguiente intento recibe esa
//   misma paymentUrl en vez de un pedido duplicado.
// - "LIMITE" (429): el limitador por IP freno la peticion antes de mirar la
//   clave, asi que no se creo nada. Pero un intento anterior con esa clave
//   pudo quedar en el aire (respuesta perdida o "EN_PROCESO") y haber creado el
//   pedido y su sesion: con una clave nueva, el intento de dentro de unos
//   minutos crearia un pedido y una sesion de SPIDI duplicados.
// Cualquier otro error claro del servidor si descarta la clave. "SIN_STOCK"
// (409) tambien: el servidor no creo el pedido porque no alcanzaron los
// codigos, y el siguiente intento (con otras cantidades) es un pedido nuevo.
const CODIGOS_CONSERVAN_CLAVE: readonly CodigoError[] = ["EN_PROCESO", "LIMITE"];

function conservaClave(codigo: CodigoError | null): boolean {
  return codigo !== null && CODIGOS_CONSERVAN_CLAVE.includes(codigo);
}

// Solo se redirige a una URL web real (nunca a "javascript:" u otro esquema).
function esUrlDePago(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// El navegador nunca manda precios: solo productos y cantidades. El servidor
// recalcula el total con el catalogo y crea la sesion de pago en SPIDI.
async function iniciarPago(datos: CheckoutRequest, claveIdempotencia: string): Promise<CheckoutResponse> {
  let respuesta: Response;
  try {
    respuesta = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "idempotency-key": claveIdempotencia },
      body: JSON.stringify(datos),
      credentials: "include",
    });
  } catch {
    throw new ErrorCheckout(
      "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
      false,
    );
  }

  let cuerpo: unknown = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }

  if (respuesta.ok && esRespuestaCheckout(cuerpo)) return cuerpo;
  if (esErrorResponse(cuerpo)) {
    const codigo = leerCodigoError(cuerpo.codigo);
    // "EN_PROCESO" y "LIMITE" no son definitivos: hay que conservar la clave
    // (ver CODIGOS_CONSERVAN_CLAVE).
    throw new ErrorCheckout(cuerpo.error, !conservaClave(codigo), codigo);
  }
  // Respuesta sin el formato esperado (p. ej. un 502 del proxy): no se sabe
  // si el pedido llego a crearse, asi que se conserva la clave.
  throw new ErrorCheckout(
    "El servidor no respondió como esperábamos. Intenta de nuevo en unos segundos.",
    false,
  );
}

export default function CarritoPage() {
  useSEO({
    title: "Tu carrito | Todo Vending CA",
    description: "Revisa tu carrito y paga tus Gift Cards Todo Vending en bolívares, sin registrarte.",
    path: "/carrito",
    noindex: true,
  });

  const { cargado, items, lineas, unidades, totalUsd, disponiblePara, fijarCantidad, quitar, recargar } =
    useCarrito();
  const { stockDe, recargar: recargarStock } = useStock();
  const { toast } = useToast();
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("listo");
  const [avisoPedido, setAvisoPedido] = useState<AvisoPedido | null>(null);
  // Candado sincronico: setState no es inmediato y un doble clic rapido podria
  // mandar dos peticiones antes de que el boton se vea deshabilitado.
  const enVueloRef = useRef(false);
  // true solo mientras POST /api/checkout esta en vuelo (estado "enviando").
  const peticionEnVueloRef = useRef(false);
  // Clave del intento anterior y los datos con que se mando. Se reutiliza solo
  // si ese intento no fue definitivo (sin respuesta, "EN_PROCESO" o "LIMITE") y
  // los datos no cambiaron: si el comprador cambia el carrito o sus datos, la
  // huella cambia y el intento lleva una clave nueva.
  const intentoRef = useRef<{ clave: string; huella: string } | null>(null);

  const form = useForm<Comprador>({
    resolver: zodResolver(compradorSchema),
    defaultValues: { nombre: "", email: "", telefono: "" },
  });

  // El scroll al cambiar de pagina lo maneja GestorScroll (lib/navegacion).
  useEffect(() => {
    setAvisoPedido(leerAvisoPedido());
  }, []);

  useEffect(() => {
    // Si el cliente vuelve con "atras" desde SPIDI, el navegador puede
    // restaurar esta pagina tal como quedo en memoria: boton bloqueado y un
    // carrito que quiza ya se pago (y vacio) en otra navegacion. Primero se
    // recargan el carrito y el ultimo pedido, y recien despues se desbloquea:
    // React aplica los cambios en un mismo render, asi que el boton nunca
    // queda habilitado sobre datos viejos.
    // La clave de idempotencia NO se descarta: si quedo una (intento sin
    // respuesta, "EN_PROCESO" o "LIMITE"), reusarla con los mismos datos
    // devuelve el mismo pedido (o su resultado, si ya se pago) en vez de crear otro.
    const alMostrar = (evento: PageTransitionEvent) => {
      if (!evento.persisted) return;
      recargar();
      setAvisoPedido(leerAvisoPedido());
      // Si la peticion seguia en vuelo, su respuesta (o su error) desbloquea.
      if (peticionEnVueloRef.current) return;
      enVueloRef.current = false;
      setEstadoEnvio("listo");
    };
    window.addEventListener("pageshow", alMostrar);
    return () => window.removeEventListener("pageshow", alMostrar);
  }, [recargar]);

  const bloqueado = estadoEnvio !== "listo";

  // Lineas que piden mas de lo que hay. Es solo un aviso con el stock que se
  // conoce (puede estar unos segundos viejo): lo que decide es la reserva del
  // checkout, que responde SIN_STOCK si no alcanzan.
  const excedidas = lineas.filter((l) => {
    const stock = stockDe(l.producto.id);
    return stock !== null && l.cantidad > stock;
  });
  const hayExcedidas = excedidas.length > 0;

  // Deja cada linea excedida en lo que queda (o la quita si no queda nada).
  const ajustarAlStock = () => {
    for (const linea of excedidas) {
      const stock = stockDe(linea.producto.id) ?? 0;
      if (stock <= 0) quitar(linea.producto.id);
      else fijarCantidad(linea.producto.id, stock);
    }
  };

  const onSubmit = async (comprador: Comprador) => {
    if (enVueloRef.current || items.length === 0) return;
    if (hayExcedidas) {
      toast({
        variant: "destructive",
        title: "No hay stock suficiente",
        description: "Ajusta las cantidades marcadas en tu carrito antes de pagar.",
      });
      return;
    }
    enVueloRef.current = true;
    setEstadoEnvio("enviando");

    const datos: CheckoutRequest = {
      items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
      comprador: {
        nombre: comprador.nombre,
        email: comprador.email,
        telefono: comprador.telefono ? comprador.telefono : undefined,
      },
    };
    const huella = JSON.stringify(datos);
    const anterior = intentoRef.current;
    const clave = anterior && anterior.huella === huella ? anterior.clave : generarClaveIdempotencia();
    intentoRef.current = { clave, huella };

    peticionEnVueloRef.current = true;
    try {
      const respuesta = await iniciarPago(datos, clave);
      peticionEnVueloRef.current = false;
      if (!esUrlDePago(respuesta.paymentUrl)) {
        throw new ErrorCheckout("Recibimos un enlace de pago no válido. Intenta de nuevo.", false);
      }
      guardarUltimoPedido({ pedidoId: respuesta.pedidoId, clave: respuesta.clave });
      // El pedido ya existe: un intento futuro (si el cliente vuelve) es otro
      // pedido y lleva su propia clave.
      intentoRef.current = null;
      // El boton sigue bloqueado hasta que el navegador deja esta pagina.
      setEstadoEnvio("redirigiendo");
      window.location.assign(respuesta.paymentUrl);
    } catch (error) {
      peticionEnVueloRef.current = false;
      const e =
        error instanceof ErrorCheckout
          ? error
          : new ErrorCheckout("Ocurrió un error inesperado. Intenta de nuevo.", false);
      // Solo un error definitivo descarta la clave; con "EN_PROCESO", "LIMITE"
      // o sin respuesta se conserva para que el reintento no duplique el pedido.
      if (e.definitivo) intentoRef.current = null;
      // Recien con la respuesta en la mano se desbloquea el boton.
      enVueloRef.current = false;
      setEstadoEnvio("listo");
      // Sin stock: se vuelve a leer para marcar en el carrito que linea no alcanza.
      if (e.codigo === "SIN_STOCK") recargarStock();
      toast(
        e.codigo === "EN_PROCESO"
          ? { title: "Tu pago se está preparando", description: e.message }
          : e.codigo === "SIN_STOCK"
            ? { variant: "destructive", title: "No hay stock suficiente", description: e.message }
            : { variant: "destructive", title: "No pudimos iniciar el pago", description: e.message },
      );
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-carrito">
      <Header />
      <main className="relative pt-28 md:pt-32 pb-20 md:pb-28">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link
                href="/gift-card"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Seguir comprando
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-foreground">Tu</span> <span className="text-primary">carrito</span>
              </h1>
            </div>

            <AvisoModoPrueba className="mb-6" />

            {avisoPedido?.tipo === "pagado" && (
              <Card className="mb-6 bg-primary/5 border-primary/20" data-testid="aviso-ultimo-pedido-pagado">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <p className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Tu último pedido ya está pagado.</span>
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href={urlResultadoPedido(avisoPedido.pedido)} data-testid="link-gift-cards-ultimo-pedido">
                      Ver mis Gift Cards
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {avisoPedido?.tipo === "pendiente" && (
              <Card className="mb-6 bg-primary/5 border-primary/20" data-testid="aviso-ultimo-pedido">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <p className="flex items-start gap-2 text-sm text-foreground">
                    <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>
                      Tienes un pago iniciado. Si ya pagaste, no vuelvas a pagar: revisa primero el estado
                      de tu pedido.
                    </span>
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href={urlResultadoPedido(avisoPedido.pedido)} data-testid="link-estado-ultimo-pedido">
                      Ver estado del pedido
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {!cargado ? (
              <CarritoCargando />
            ) : lineas.length === 0 ? (
              <CarritoVacio />
            ) : (
              <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Lineas del carrito */}
                <div className="lg:col-span-3 space-y-6">
                  <Card>
                    <CardContent className="p-5 md:p-6">
                      <ul className="divide-y">
                        {lineas.map((linea) => {
                          const { producto, cantidad, subtotalUsd } = linea;
                          const stock = stockDe(producto.id);
                          const excede = stock !== null && cantidad > stock;
                          const maximo = Math.min(cantidad + disponiblePara(producto.id), stock ?? Infinity);
                          return (
                            <li
                              key={producto.id}
                              className="flex gap-4 py-5 first:pt-0 last:pb-0"
                              data-testid={`linea-carrito-${producto.id}`}
                            >
                              <div className="w-24 sm:w-28 flex-shrink-0">
                                {producto.esGiftCard ? (
                                  <GiftCardVisual montoUsd={producto.precioUsd} tamano="sm" />
                                ) : (
                                  <div className="aspect-[1.586/1] rounded-md bg-muted flex items-center justify-center">
                                    <Gift className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h2 className="font-semibold text-foreground leading-snug">{producto.nombre}</h2>
                                    <p className="text-sm text-muted-foreground">
                                      {formatoUsd(producto.precioUsd)} c/u
                                    </p>
                                  </div>
                                  <p className="font-semibold text-foreground tabular-nums whitespace-nowrap">
                                    {formatoUsd(subtotalUsd)}
                                  </p>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                  <SelectorCantidad
                                    valor={cantidad}
                                    max={maximo}
                                    onCambiar={(n) => fijarCantidad(producto.id, n)}
                                    etiqueta={`Cantidad de ${producto.nombre}`}
                                    deshabilitado={bloqueado}
                                    tamano="sm"
                                    testId={`selector-cantidad-${producto.id}`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-muted-foreground"
                                    onClick={() => quitar(producto.id)}
                                    disabled={bloqueado}
                                    data-testid={`button-quitar-${producto.id}`}
                                  >
                                    <Trash2 />
                                    Quitar
                                  </Button>
                                </div>
                                {excede && (
                                  <p
                                    className="mt-2 flex items-start gap-2 text-sm text-destructive"
                                    role="alert"
                                    data-testid={`aviso-stock-${producto.id}`}
                                  >
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    {stock === 0
                                      ? "Sin stock: quita esta Gift Card para poder pagar."
                                      : `Solo ${stock === 1 ? "queda 1 disponible" : `quedan ${stock} disponibles`}. Baja la cantidad para poder pagar.`}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <Separator className="my-5" />

                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">
                          Total ({textoUnidades(unidades, "unidad", "unidades")})
                        </p>
                        <p className="text-2xl font-bold text-foreground tabular-nums" data-testid="text-total-usd">
                          {formatoUsd(totalUsd)}
                        </p>
                      </div>
                      <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                        <Banknote className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        El cobro se hace en bolívares a la tasa BCV del día del pago. Verás el monto exacto en
                        Bs en la página de pago antes de confirmar.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Datos del comprador y pago */}
                <div className="lg:col-span-2 lg:sticky lg:top-28">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">Tus datos</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Compra sin registro: solo los usamos para identificar tu compra y tu comprobante.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                          <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre y apellido *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Tu nombre"
                                    autoComplete="name"
                                    maxLength={100}
                                    {...field}
                                    disabled={bloqueado}
                                    data-testid="input-nombre"
                                  />
                                </FormControl>
                                <MensajeCampo />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correo electrónico *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    inputMode="email"
                                    placeholder="tu@correo.com"
                                    autoComplete="email"
                                    maxLength={200}
                                    {...field}
                                    disabled={bloqueado}
                                    data-testid="input-email"
                                  />
                                </FormControl>
                                <MensajeCampo />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="telefono"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Teléfono <span className="font-normal text-muted-foreground">(opcional)</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    inputMode="tel"
                                    placeholder="+58 414-XXX-XXXX"
                                    autoComplete="tel"
                                    maxLength={30}
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={bloqueado}
                                    data-testid="input-telefono"
                                  />
                                </FormControl>
                                <MensajeCampo />
                              </FormItem>
                            )}
                          />

                          <div className="rounded-lg bg-muted/50 p-4 flex items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">Total a pagar</span>
                            <span className="text-right">
                              <span className="block text-lg font-bold text-foreground tabular-nums">
                                {formatoUsd(totalUsd)}
                              </span>
                              <span className="block text-xs text-muted-foreground">en Bs a tasa BCV del día</span>
                            </span>
                          </div>

                          {hayExcedidas && (
                            <div
                              className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-3"
                              role="alert"
                              data-testid="aviso-stock-carrito"
                            >
                              <p className="flex items-start gap-2 text-sm text-destructive">
                                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                Algunas Gift Cards de tu carrito ya no tienen stock suficiente.
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={ajustarAlStock}
                                disabled={bloqueado}
                                data-testid="button-ajustar-stock"
                              >
                                Ajustar a lo disponible
                              </Button>
                            </div>
                          )}

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full gap-2 glow-primary"
                            disabled={bloqueado || hayExcedidas}
                            aria-busy={bloqueado}
                            data-testid="button-pagar"
                          >
                            {estadoEnvio === "enviando" ? (
                              <>
                                <Loader2 className="animate-spin" />
                                Preparando tu pago...
                              </>
                            ) : estadoEnvio === "redirigiendo" ? (
                              <>
                                <Loader2 className="animate-spin" />
                                Abriendo la página de pago...
                              </>
                            ) : (
                              <>
                                <Lock />
                                Pagar con Bs
                              </>
                            )}
                          </Button>
                          <p className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                            Pagas en la página segura de SPIDI con Débito Inmediato o Pago Móvil desde tu banco,
                            sin registrarte.
                          </p>
                          <SpidiAtribucion className="pt-1" />
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CarritoCargando() {
  return (
    <div className="grid lg:grid-cols-5 gap-8" aria-busy="true" aria-label="Cargando tu carrito">
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="w-28 aspect-[1.586/1] rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CarritoVacio() {
  return (
    <Card className="max-w-2xl mx-auto" data-testid="carrito-vacio">
      <CardContent className="py-14 px-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingCart className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Agrega Gift Cards Todo Vending de $10, $25 o $50 para regalar snacks, bebidas y café. Se paga en bolívares a tasa
          BCV del día.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/gift-card" data-testid="link-carrito-vacio-gift-card">
            <Gift className="h-4 w-4" />
            Ver Gift Cards
          </Link>
        </Button>
        <div className="mt-6">
          <Badge variant="secondary">Sin registro · Débito Inmediato o Pago Móvil</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
