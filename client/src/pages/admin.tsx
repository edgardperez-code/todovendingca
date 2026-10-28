import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ErrorAdmin,
  MENSAJE_LIMITE,
  borrarClave,
  consulta,
  guardarClave,
  leerClaveGuardada,
  pedirAdmin,
} from "@/lib/admin-api";
import { formatoBs, formatoFechaHora, formatoUsd, metodoPagoLegible } from "@/lib/formato";
import { useSEO } from "@/lib/seo";
import { CLAVE_STOCK } from "@/lib/stock-tienda";
import { cn } from "@/lib/utils";
import { PRODUCTOS, buscarProducto } from "@shared/catalogo";
import {
  ESTADOS_CODIGO_INVENTARIO,
  MAX_CODIGOS_POR_CARGA,
  MAX_LARGO_CODIGO,
  type AnularCodigoResponse,
  type CargaInventarioResponse,
  type CodigoInventarioAdmin,
  type CodigosInventarioAdmin,
  type CompletarCodigosResponse,
  type ConteoInventario,
  type EstadoCodigoInventario,
  type ExpirarPedidoResponse,
  type PedidoAdmin,
  type ResumenAdmin,
  type SesionAdmin,
  type VentasAdmin,
} from "@shared/admin";
import {
  AlertTriangle,
  Boxes,
  CalendarDays,
  Clock,
  KeySquare,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  PackagePlus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  TimerOff,
} from "lucide-react";

// Panel del dueno: ventas, resumen e inventario de codigos de Gift Card.
//
// No aparece en el menu publico y es noindex. La pagina en si no protege nada:
// cada dato lo pide al servidor con la cabecera x-admin-key, y el servidor
// responde 401 sin la clave correcta.
//
// SSR: en el servidor y en el primer render del cliente no se sabe si hay una
// clave guardada (sessionStorage solo existe en el navegador), asi que los dos
// pintan el mismo "Cargando..." y la hidratacion coincide. La clave se lee en
// un efecto, despues de montar.

const giftCards = PRODUCTOS.filter((p) => p.esGiftCard);
const TAMANO_PAGINA = 50;

// === Contexto de sesion ===

interface SesionPanel {
  // Hace una llamada admin con la clave. Ante un 401 cierra la sesion (vuelve
  // a la pantalla de acceso) y lanza el error igual.
  pedir: <T>(ruta: string, opciones?: { metodo?: "GET" | "POST"; cuerpo?: unknown }) => Promise<T>;
  salir: () => void;
}

const SesionContext = createContext<SesionPanel | null>(null);

function useSesion(): SesionPanel {
  const valor = useContext(SesionContext);
  if (!valor) throw new Error("useSesion debe usarse dentro del panel");
  return valor;
}

function mensajeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Ocurrió un error inesperado.";
}

// === Etiquetas de estado ===

const ESTADOS_PEDIDO: Array<{ valor: string; etiqueta: string }> = [
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "pagado", etiqueta: "Pagado" },
  { valor: "fallido", etiqueta: "Fallido" },
  { valor: "expirado", etiqueta: "Expirado" },
  { valor: "error", etiqueta: "Error" },
];

const ESTILO_ESTADO_PEDIDO: Record<string, string> = {
  pendiente: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  pagado: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  fallido: "border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200",
  expirado: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-500/40 dark:bg-slate-500/10 dark:text-slate-300",
  error: "border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200",
};

function EstadoPedidoBadge({ estado }: { estado: string }) {
  const etiqueta = ESTADOS_PEDIDO.find((e) => e.valor === estado)?.etiqueta ?? estado;
  return (
    <Badge variant="outline" className={cn("font-medium", ESTILO_ESTADO_PEDIDO[estado])}>
      {etiqueta}
    </Badge>
  );
}

const ETIQUETA_ESTADO_CODIGO: Record<EstadoCodigoInventario, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  entregado: "Entregado",
  anulado: "Anulado",
};

const ESTILO_ESTADO_CODIGO: Record<EstadoCodigoInventario, string> = {
  disponible: ESTILO_ESTADO_PEDIDO.pagado,
  reservado: ESTILO_ESTADO_PEDIDO.pendiente,
  entregado: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200",
  anulado: ESTILO_ESTADO_PEDIDO.expirado,
};

function EstadoCodigoBadge({ estado }: { estado: EstadoCodigoInventario }) {
  return (
    <Badge variant="outline" className={cn("font-medium", ESTILO_ESTADO_CODIGO[estado])}>
      {ETIQUETA_ESTADO_CODIGO[estado] ?? estado}
    </Badge>
  );
}

const ETIQUETA_GIFT_CARD: Record<string, string> = {
  activa: "Activa",
  canjeada: "Canjeada",
  anulada: "Anulada",
  prueba: "Prueba",
};

function PruebaBadge() {
  return (
    <Badge
      variant="outline"
      className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
    >
      Prueba
    </Badge>
  );
}

function nombreProducto(productoId: string): string {
  return buscarProducto(productoId)?.nombre ?? productoId;
}

// "Gift Card $25" para tablas estrechas.
function nombreCorto(productoId: string): string {
  const producto = buscarProducto(productoId);
  if (!producto) return productoId;
  return `Gift Card ${Number.isInteger(producto.precioUsd) ? `$${producto.precioUsd}` : formatoUsd(producto.precioUsd)}`;
}

// === Pagina ===

export default function AdminPage() {
  useSEO({
    title: "Administración | Todo Vending CA",
    description: "Panel de administración de la tienda de Todo Vending CA.",
    path: "/admin",
    noindex: true,
  });

  const queryClient = useQueryClient();
  // undefined: aun no se leyo sessionStorage (SSR y primer render).
  const [clave, setClave] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setClave(leerClaveGuardada());
  }, []);

  const salir = useCallback(() => {
    borrarClave();
    setClave(null);
    // Que no quede nada del panel en memoria para quien use la pestana despues.
    queryClient.removeQueries({ queryKey: ["admin"] });
  }, [queryClient]);

  const entrar = useCallback((nueva: string) => {
    guardarClave(nueva);
    setClave(nueva);
  }, []);

  const sesion = useMemo<SesionPanel | null>(() => {
    if (!clave) return null;
    return {
      pedir: async <T,>(ruta: string, opciones?: { metodo?: "GET" | "POST"; cuerpo?: unknown }) => {
        try {
          return await pedirAdmin<T>(clave, ruta, opciones);
        } catch (error) {
          if (error instanceof ErrorAdmin && error.noAutorizado) salir();
          throw error;
        }
      },
      salir,
    };
  }, [clave, salir]);

  return (
    <div className="min-h-screen bg-muted/30" data-testid="page-admin">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">TV</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground leading-tight truncate">Todo Vending CA</p>
              <p className="text-xs text-muted-foreground leading-tight">Administración de la tienda</p>
            </div>
          </div>
          {sesion && (
            <Button variant="outline" size="sm" className="gap-2" onClick={salir} data-testid="button-admin-salir">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-10">
        {clave === undefined ? (
          <div className="flex justify-center py-24 text-muted-foreground" aria-busy="true">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="sr-only">Cargando...</span>
          </div>
        ) : sesion ? (
          <SesionContext.Provider value={sesion}>
            <Panel />
          </SesionContext.Provider>
        ) : (
          <Acceso onEntrar={entrar} />
        )}
      </main>
    </div>
  );
}

// === Acceso ===

function Acceso({ onEntrar }: { onEntrar: (clave: string) => void }) {
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const limpia = clave.trim();
    if (!limpia || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await pedirAdmin<SesionAdmin>(limpia, "/api/admin/sesion");
      setClave("");
      onEntrar(limpia);
    } catch (e) {
      if (e instanceof ErrorAdmin && e.noAutorizado) setError("Clave incorrecta.");
      else if (e instanceof ErrorAdmin && e.limite) setError(MENSAJE_LIMITE);
      else setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-6 md:mt-16">
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Acceso de administrador</CardTitle>
        <CardDescription>Escribe la clave de administrador para ver las ventas y el inventario.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clave-admin">Clave de administrador</Label>
            <Input
              id="clave-admin"
              type="password"
              autoComplete="current-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              disabled={enviando}
              autoFocus
              data-testid="input-clave-admin"
            />
          </div>
          {error && (
            <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </p>
          )}
          <Button type="submit" className="w-full gap-2" disabled={enviando || !clave.trim()} data-testid="button-entrar-admin">
            {enviando ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            Entrar
          </Button>
          <p className="text-xs text-muted-foreground">
            La clave se guarda solo en esta pestaña y se borra al cerrarla o al pulsar «Salir».
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// === Panel ===

function Panel() {
  const [pestana, setPestana] = useState("resumen");
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Panel de la tienda</h1>
      <Tabs value={pestana} onValueChange={setPestana}>
        <TabsList className="mb-6">
          <TabsTrigger value="resumen" data-testid="tab-resumen">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="ventas" data-testid="tab-ventas">
            Ventas
          </TabsTrigger>
          <TabsTrigger value="inventario" data-testid="tab-inventario">
            Inventario
          </TabsTrigger>
        </TabsList>
        <TabsContent value="resumen">
          <Resumen onIrA={setPestana} />
        </TabsContent>
        <TabsContent value="ventas">
          <Ventas />
        </TabsContent>
        <TabsContent value="inventario">
          <Inventario />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const CLAVE_RESUMEN = ["admin", "resumen"] as const;

function useResumen() {
  const { pedir } = useSesion();
  return useQuery({
    queryKey: CLAVE_RESUMEN,
    queryFn: () => pedir<ResumenAdmin>("/api/admin/resumen"),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

function ErrorCarga({ error, onReintentar }: { error: unknown; onReintentar: () => void }) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {mensajeError(error)}
        </p>
        <Button variant="outline" size="sm" className="gap-2" onClick={onReintentar}>
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}

// === Resumen ===

function Resumen({ onIrA }: { onIrA: (pestana: string) => void }) {
  const { data, error, isPending, refetch, isFetching } = useResumen();

  if (isPending) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!data) return <ErrorCarga error={error} onReintentar={() => void refetch()} />;

  const { ventas, inventario } = data;

  return (
    <div className="space-y-6">
      {ventas.sinCodigos > 0 && (
        <Card className="border-destructive bg-destructive/5" data-testid="alerta-sin-codigos">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-destructive">
                  {ventas.sinCodigos === 1
                    ? "1 pedido pagado está sin códigos"
                    : `${ventas.sinCodigos} pedidos pagados están sin códigos`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Se pagaron cuando no quedaba stock. Carga códigos en el inventario y entrégalos a mano al
                  comprador (en Ventas verás la marca «Faltan códigos»).
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onIrA("ventas")}>
              Ver ventas
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Ventas</h2>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          Actualizar
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaCifra
          icono={Sun}
          titulo="Hoy"
          valor={formatoUsd(ventas.totalUsdHoy)}
          detalle={ventas.pagadosHoy === 1 ? "1 pedido pagado" : `${ventas.pagadosHoy} pedidos pagados`}
          testId="cifra-hoy"
        />
        <TarjetaCifra
          icono={CalendarDays}
          titulo="Este mes"
          valor={formatoUsd(ventas.totalUsdMes)}
          detalle={ventas.pagadosMes === 1 ? "1 pedido pagado" : `${ventas.pagadosMes} pedidos pagados`}
          testId="cifra-mes"
        />
        <TarjetaCifra
          icono={Clock}
          titulo="Pendientes de pago"
          valor={String(ventas.pendientes)}
          detalle="Pedidos esperando que el comprador pague"
          testId="cifra-pendientes"
        />
        <TarjetaCifra
          icono={AlertTriangle}
          titulo="Pagados sin códigos"
          valor={String(ventas.sinCodigos)}
          detalle={ventas.sinCodigos > 0 ? "Requieren entrega manual" : "Todo entregado"}
          destacado={ventas.sinCodigos > 0}
          testId="cifra-sin-codigos"
        />
      </div>

      <h2 className="text-lg font-semibold text-foreground pt-2">Stock de Gift Cards</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {giftCards.map((producto) => (
          <TarjetaStock key={producto.id} productoId={producto.id} conteo={inventario[producto.id]} />
        ))}
      </div>
    </div>
  );
}

function TarjetaCifra({
  icono: Icono,
  titulo,
  valor,
  detalle,
  destacado = false,
  testId,
}: {
  icono: typeof Sun;
  titulo: string;
  valor: string;
  detalle: string;
  destacado?: boolean;
  testId: string;
}) {
  return (
    <Card className={cn(destacado && "border-destructive")} data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Icono className={cn("h-4 w-4", destacado ? "text-destructive" : "text-primary")} />
          {titulo}
        </div>
        <p className={cn("text-2xl font-bold tabular-nums", destacado ? "text-destructive" : "text-foreground")}>
          {valor}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{detalle}</p>
      </CardContent>
    </Card>
  );
}

const CONTEO_VACIO: ConteoInventario = { disponible: 0, reservado: 0, entregado: 0, anulado: 0 };

function TarjetaStock({
  productoId,
  conteo = CONTEO_VACIO,
  conAnulados = false,
}: {
  productoId: string;
  conteo?: ConteoInventario;
  conAnulados?: boolean;
}) {
  const sinStock = conteo.disponible === 0;
  const filas: Array<{ etiqueta: string; valor: number }> = [
    { etiqueta: "Reservados", valor: conteo.reservado },
    { etiqueta: "Entregados", valor: conteo.entregado },
  ];
  if (conAnulados) filas.push({ etiqueta: "Anulados", valor: conteo.anulado });

  return (
    <Card className={cn(sinStock && "border-destructive/50")} data-testid={`stock-${productoId}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="font-semibold text-foreground">{nombreCorto(productoId)}</p>
          {sinStock && <Badge variant="destructive">Sin stock</Badge>}
        </div>
        <p className={cn("text-3xl font-bold tabular-nums", sinStock ? "text-destructive" : "text-foreground")}>
          {conteo.disponible}
        </p>
        <p className="text-xs text-muted-foreground mb-3">disponibles para vender</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {filas.map((f) => (
            <div key={f.etiqueta} className="contents">
              <dt className="text-muted-foreground">{f.etiqueta}</dt>
              <dd className="text-right tabular-nums text-foreground">{f.valor}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

// === Ventas ===

const TODOS = "todos";

function Ventas() {
  const { pedir } = useSesion();
  const [estado, setEstado] = useState(TODOS);
  const [texto, setTexto] = useState("");
  const [buscar, setBuscar] = useState("");
  const [seleccionado, setSeleccionado] = useState<PedidoAdmin | null>(null);

  const consultaVentas = useInfiniteQuery<
    VentasAdmin,
    Error,
    InfiniteData<VentasAdmin, string | null>,
    readonly unknown[],
    string | null
  >({
    queryKey: ["admin", "ventas", estado, buscar],
    queryFn: ({ pageParam }) =>
      pedir<VentasAdmin>(
        `/api/admin/ventas${consulta({
          estado: estado === TODOS ? null : estado,
          buscar,
          limite: TAMANO_PAGINA,
          despues: pageParam,
        })}`,
      ),
    initialPageParam: null,
    getNextPageParam: (ultima) => ultima.siguiente,
    staleTime: 0,
  });

  const pedidos = consultaVentas.data?.pages.flatMap((p) => p.pedidos) ?? [];

  // El detalle abierto se mantiene al dia si la lista se vuelve a cargar
  // (por ejemplo, despues de reenviar el correo).
  const detalle = seleccionado ? (pedidos.find((p) => p.id === seleccionado.id) ?? seleccionado) : null;

  const enviarBusqueda = (evento: FormEvent) => {
    evento.preventDefault();
    setBuscar(texto.trim());
  };

  const limpiarBusqueda = () => {
    setTexto("");
    setBuscar("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-end">
          <div className="space-y-1.5 md:w-48">
            <Label htmlFor="filtro-estado">Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="filtro-estado" data-testid="select-filtro-estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {ESTADOS_PEDIDO.map((e) => (
                  <SelectItem key={e.valor} value={e.valor}>
                    {e.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <form onSubmit={enviarBusqueda} className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-venta">Buscar por número de pedido o correo exacto</Label>
            <div className="flex gap-2">
              <Input
                id="buscar-venta"
                type="search"
                placeholder="TV-261028-ABCDE o comprador@correo.com"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={200}
                data-testid="input-buscar-venta"
              />
              <Button type="submit" variant="secondary" className="gap-2" data-testid="button-buscar-venta">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
              {buscar && (
                <Button type="button" variant="ghost" onClick={limpiarBusqueda}>
                  Limpiar
                </Button>
              )}
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Actualizar ventas"
            onClick={() => void consultaVentas.refetch()}
            disabled={consultaVentas.isFetching}
          >
            <RefreshCw className={cn("h-4 w-4", consultaVentas.isFetching && "animate-spin")} />
          </Button>
        </CardContent>
      </Card>

      {consultaVentas.isPending ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : consultaVentas.isError && pedidos.length === 0 ? (
        <ErrorCarga error={consultaVentas.error} onReintentar={() => void consultaVentas.refetch()} />
      ) : pedidos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {buscar ? "No hay pedidos con ese número o correo." : "Todavía no hay pedidos con este filtro."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow
                    key={pedido.id}
                    className="cursor-pointer"
                    onClick={() => setSeleccionado(pedido)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSeleccionado(pedido);
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Ver el pedido ${pedido.numero}`}
                    data-testid={`fila-venta-${pedido.numero}`}
                  >
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {pedido.numero}
                        {pedido.modoPrueba && <PruebaBadge />}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatoFechaHora(pedido.creadoEn)}</TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium text-foreground">{pedido.comprador.nombre}</p>
                      <p className="text-muted-foreground text-xs">{pedido.comprador.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {pedido.items.map((i) => (
                        <p key={i.productoId} className="whitespace-nowrap">
                          {i.cantidad} × {nombreCorto(i.productoId)}
                        </p>
                      ))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium whitespace-nowrap">
                      {formatoUsd(pedido.totalUsd)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <EstadoPedidoBadge estado={pedido.estado} />
                        {pedido.faltanCodigos > 0 && (
                          <Badge variant="destructive" className="font-medium">
                            Faltan códigos
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {consultaVentas.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => void consultaVentas.fetchNextPage()}
            disabled={consultaVentas.isFetchingNextPage}
            className="gap-2"
            data-testid="button-cargar-mas-ventas"
          >
            {consultaVentas.isFetchingNextPage && <Loader2 className="animate-spin" />}
            Cargar más
          </Button>
        </div>
      )}
      {consultaVentas.isFetchNextPageError && (
        <p className="text-center text-sm text-destructive">{mensajeError(consultaVentas.error)}</p>
      )}

      <DetallePedido pedido={detalle} onCerrar={() => setSeleccionado(null)} onActualizado={setSeleccionado} />
    </div>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 text-sm">
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd className="text-foreground break-words">{children}</dd>
    </div>
  );
}

function DetallePedido({
  pedido,
  onCerrar,
  onActualizado,
}: {
  pedido: PedidoAdmin | null;
  onCerrar: () => void;
  // Recibe el pedido ya actualizado que devuelve el servidor. Sirve si el
  // pedido sale de la lista filtrada (por ejemplo, de "Pendiente" a
  // "Expirado") y el detalle sigue abierto.
  onActualizado: (pedido: PedidoAdmin) => void;
}) {
  const { pedir } = useSesion();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Resultado de "Completar códigos" del pedido abierto: se queda en el
  // detalle (el aviso flotante se va solo).
  const [resultadoCompletar, setResultadoCompletar] = useState<{
    pedidoId: string;
    mensaje: string;
    completo: boolean;
  } | null>(null);
  const [confirmarExpirar, setConfirmarExpirar] = useState(false);

  // Cambiar de pedido borra lo que se mostraba del anterior.
  const pedidoId = pedido?.id ?? null;
  useEffect(() => {
    setResultadoCompletar(null);
    setConfirmarExpirar(false);
  }, [pedidoId]);

  // Ventas, resumen, inventario y el stock de la pagina publica cambian a la vez.
  const refrescarTodo = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: CLAVE_STOCK });
  };

  const completar = useMutation({
    mutationFn: (id: string) =>
      pedir<CompletarCodigosResponse>(`/api/admin/pedidos/${encodeURIComponent(id)}/completar-codigos`, {
        metodo: "POST",
      }),
    onSuccess: (r, id) => {
      setResultadoCompletar({ pedidoId: id, mensaje: r.mensaje, completo: r.faltanCodigos === 0 });
      onActualizado(r.pedido);
      toast(
        r.faltanCodigos === 0
          ? { title: "Códigos completos", description: r.mensaje }
          : {
              title: r.entregados > 0 ? "Se entregó una parte de los códigos" : "No hay stock para completar",
              description: r.mensaje,
            },
      );
      refrescarTodo();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "No se pudieron completar los códigos", description: mensajeError(error) });
      // Un 409 suele decir que el pedido ya cambio: se vuelve a leer.
      refrescarTodo();
    },
  });

  const expirar = useMutation({
    mutationFn: (id: string) =>
      pedir<ExpirarPedidoResponse>(`/api/admin/pedidos/${encodeURIComponent(id)}/expirar`, { metodo: "POST" }),
    onSuccess: (r) => {
      onActualizado(r.pedido);
      toast({
        title:
          r.resultado === "expirado"
            ? "Pedido expirado"
            : r.resultado === "pagado"
              ? "El pedido ya estaba pagado"
              : "El pago ya había fallado",
        description: r.mensaje,
      });
      refrescarTodo();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "No se pudo expirar el pedido", description: mensajeError(error) });
      refrescarTodo();
    },
    onSettled: () => setConfirmarExpirar(false),
  });

  const reenviar = useMutation({
    mutationFn: (id: string) =>
      pedir<{ ok: true; numero: string; enviadoA: string }>(
        `/api/admin/pedidos/${encodeURIComponent(id)}/reenviar-correo`,
        { metodo: "POST" },
      ),
    onSuccess: (r) => {
      toast({ title: "Correo reenviado", description: `Se envió el correo del pedido ${r.numero} a ${r.enviadoA}.` });
      void queryClient.invalidateQueries({ queryKey: ["admin", "ventas"] });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "No se pudo reenviar el correo", description: mensajeError(error) });
    },
  });

  return (
    <Dialog open={pedido !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {pedido && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2 font-mono">
                {pedido.numero}
                <EstadoPedidoBadge estado={pedido.estado} />
                {pedido.modoPrueba && <PruebaBadge />}
              </DialogTitle>
              <DialogDescription>
                Creado el {formatoFechaHora(pedido.creadoEn)}
                {pedido.pagadoEn ? ` · Pagado el ${formatoFechaHora(pedido.pagadoEn)}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {pedido.modoPrueba && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                  Pedido de prueba: no entró dinero real y sus códigos (PRUEBA-) no se pueden canjear.
                </p>
              )}
              {pedido.faltanCodigos > 0 && (
                <p
                  className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {pedido.faltanCodigos === 1
                    ? "Falta 1 código por entregar: se pagó sin stock. Entrégalo a mano al comprador."
                    : `Faltan ${pedido.faltanCodigos} códigos por entregar: se pagó sin stock. Entrégalos a mano al comprador.`}
                </p>
              )}
              {/* Pedido real pagado sin todos sus codigos: con stock cargado, el
                  servidor los toma del inventario y le reenvia el correo. Los
                  de prueba (TVP-) no aplican: el servidor responde 409. */}
              {pedido.estado === "pagado" && pedido.faltanCodigos > 0 && !pedido.modoPrueba && (
                <div className="space-y-2">
                  <Button
                    className="gap-2"
                    onClick={() => completar.mutate(pedido.id)}
                    disabled={completar.isPending}
                    data-testid="button-completar-codigos"
                  >
                    {completar.isPending ? <Loader2 className="animate-spin" /> : <KeySquare />}
                    Completar códigos
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Toma del inventario los códigos que faltan y le reenvía el correo al comprador. Si no hay
                    disponibles, carga stock primero.
                  </p>
                </div>
              )}
              {resultadoCompletar && resultadoCompletar.pedidoId === pedido.id && (
                <p
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    resultadoCompletar.completo
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
                  )}
                  role="status"
                  data-testid="resultado-completar-codigos"
                >
                  {resultadoCompletar.mensaje}
                </p>
              )}
              {/* Pedido esperando pago: expirarlo cierra el enlace de pago y
                  devuelve sus codigos reservados al inventario. */}
              {pedido.estado === "pendiente" && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={() => setConfirmarExpirar(true)}
                    disabled={expirar.isPending}
                    data-testid="button-expirar-pedido"
                  >
                    {expirar.isPending ? <Loader2 className="animate-spin" /> : <TimerOff />}
                    Expirar pedido
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Cierra el enlace de pago y libera el stock que tenía reservado.
                  </p>
                </div>
              )}

              <section>
                <h3 className="font-semibold text-foreground mb-2">Comprador</h3>
                <dl className="space-y-1">
                  <Dato etiqueta="Nombre">{pedido.comprador.nombre}</Dato>
                  <Dato etiqueta="Correo">{pedido.comprador.email}</Dato>
                  <Dato etiqueta="Teléfono">{pedido.comprador.telefono || "—"}</Dato>
                </dl>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-2">Productos</h3>
                <ul className="space-y-1 text-sm">
                  {pedido.items.map((i) => (
                    <li key={i.productoId} className="flex justify-between gap-3">
                      <span>
                        {i.cantidad} × {i.nombre || nombreProducto(i.productoId)}
                      </span>
                      <span className="tabular-nums">{formatoUsd(i.precioUsd * i.cantidad)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-3 border-t pt-1 font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatoUsd(pedido.totalUsd)}</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-2">Pago</h3>
                {pedido.pago ? (
                  <dl className="space-y-1">
                    <Dato etiqueta="Método">{metodoPagoLegible(pedido.pago.metodo) ?? "—"}</Dato>
                    <Dato etiqueta="Banco">{pedido.pago.banco ?? "—"}</Dato>
                    <Dato etiqueta="Referencia">
                      <span className="font-mono">{pedido.pago.referenciaBancaria ?? "—"}</span>
                    </Dato>
                    <Dato etiqueta="Monto en Bs">
                      {pedido.pago.montoVes !== null ? formatoBs(pedido.pago.montoVes) : "—"}
                    </Dato>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin pago registrado.</p>
                )}
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-2">Códigos entregados</h3>
                {pedido.giftCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ninguno todavía.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {pedido.giftCards.map((g) => (
                      <li key={g.codigo} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2">
                        <span className="font-mono text-sm break-all">{g.codigo}</span>
                        <span className="flex items-center gap-2 text-sm">
                          <span className="tabular-nums">{formatoUsd(g.montoUsd)}</span>
                          <Badge variant="outline">{ETIQUETA_GIFT_CARD[g.estado] ?? g.estado}</Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-2">Correos</h3>
                <dl className="space-y-1">
                  <Dato etiqueta="Al comprador">
                    {pedido.correos.compradorEnviadoEn
                      ? `Enviado el ${formatoFechaHora(pedido.correos.compradorEnviadoEn)}`
                      : "No enviado"}
                  </Dato>
                  <Dato etiqueta="Aviso de venta">
                    {pedido.correos.avisoVentaEnviadoEn
                      ? `Enviado el ${formatoFechaHora(pedido.correos.avisoVentaEnviadoEn)}`
                      : "No enviado"}
                  </Dato>
                  <Dato etiqueta="Intentos">{pedido.correos.intentos}</Dato>
                </dl>
                {pedido.estado === "pagado" && (
                  <Button
                    variant="outline"
                    className="mt-3 gap-2"
                    onClick={() => reenviar.mutate(pedido.id)}
                    disabled={reenviar.isPending}
                    data-testid="button-reenviar-correo"
                  >
                    {reenviar.isPending ? <Loader2 className="animate-spin" /> : <Mail />}
                    Reenviar correo
                  </Button>
                )}
              </section>
            </div>
          </>
        )}
      </DialogContent>

      <AlertDialog
        open={confirmarExpirar && pedido !== null}
        onOpenChange={(abierto) => !abierto && !expirar.isPending && setConfirmarExpirar(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Expirar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              {pedido && (
                <>
                  Se cierra el enlace de pago del pedido{" "}
                  <span className="font-mono text-foreground">{pedido.numero}</span> y sus códigos reservados vuelven al
                  inventario. Si el comprador ya había pagado, se registra el pago en lugar de expirarlo.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={expirar.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={expirar.isPending}
              onClick={(e) => {
                // Se cierra al terminar la peticion (onSettled), no al hacer clic.
                e.preventDefault();
                if (pedido) expirar.mutate(pedido.id);
              }}
              data-testid="button-confirmar-expirar"
            >
              {expirar.isPending && <Loader2 className="animate-spin" />}
              Expirar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

// === Inventario ===

// Separa el texto pegado en codigos: uno por linea, sin espacios a los lados y
// sin lineas vacias. Lo mismo hace el servidor; aqui es solo para contar y
// avisar antes de enviar.
function separarCodigos(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function Inventario() {
  const { pedir } = useSesion();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const resumen = useResumen();

  const [productoCarga, setProductoCarga] = useState(giftCards[0]?.id ?? "");
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<(CargaInventarioResponse & { productoId: string }) | null>(null);

  const codigos = separarCodigos(texto);
  const largos = codigos.filter((c) => c.length > MAX_LARGO_CODIGO || /\s/.test(c)).length;
  const demasiados = codigos.length > MAX_CODIGOS_POR_CARGA;

  const actualizarTodo = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    // La pagina publica de la Gift Card usa este mismo cache si esta abierta.
    void queryClient.invalidateQueries({ queryKey: CLAVE_STOCK });
  };

  const cargar = useMutation({
    mutationFn: (datos: { productoId: string; codigos: string[] }) =>
      pedir<CargaInventarioResponse>("/api/admin/inventario", { metodo: "POST", cuerpo: datos }),
    onSuccess: (r, datos) => {
      setResultado({ ...r, productoId: datos.productoId });
      // Se limpia el cuadro solo si todo entro; si hubo rechazados, el dueno
      // puede revisar lo que pego.
      if (r.duplicados === 0 && r.invalidos === 0) setTexto("");
      actualizarTodo();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "No se pudieron agregar los códigos", description: mensajeError(error) });
    },
  });

  const enviarCarga = (evento: FormEvent) => {
    evento.preventDefault();
    if (!productoCarga || codigos.length === 0 || demasiados || cargar.isPending) return;
    setResultado(null);
    cargar.mutate({ productoId: productoCarga, codigos });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {resumen.isPending
          ? giftCards.map((p) => <Skeleton key={p.id} className="h-40 rounded-xl" />)
          : giftCards.map((producto) => (
              <TarjetaStock
                key={producto.id}
                productoId={producto.id}
                conteo={resumen.data?.inventario[producto.id]}
                conAnulados
              />
            ))}
      </div>
      {resumen.isError && !resumen.data && (
        <ErrorCarga error={resumen.error} onReintentar={() => void resumen.refetch()} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <PackagePlus className="h-5 w-5 text-primary" />
            Agregar códigos al inventario
          </CardTitle>
          <CardDescription>
            Pega los códigos reales que aceptan las máquinas, uno por línea. Cada código se vende una sola vez. Máximo{" "}
            {MAX_CODIGOS_POR_CARGA} por carga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviarCarga} className="space-y-4">
            <div className="space-y-1.5 sm:w-64">
              <Label htmlFor="producto-carga">Producto</Label>
              <Select value={productoCarga} onValueChange={setProductoCarga}>
                <SelectTrigger id="producto-carga" data-testid="select-producto-carga">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {giftCards.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="codigos-carga">Códigos</Label>
              <Textarea
                id="codigos-carga"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={8}
                spellCheck={false}
                autoComplete="off"
                className="font-mono text-sm"
                placeholder={"ABC123XYZ\nDEF456UVW\n..."}
                disabled={cargar.isPending}
                data-testid="textarea-codigos"
              />
              <p className={cn("text-xs", demasiados ? "text-destructive" : "text-muted-foreground")}>
                {codigos.length === 1 ? "1 código" : `${codigos.length} códigos`}
                {demasiados && ` · Son más de ${MAX_CODIGOS_POR_CARGA}: divídelos en varias cargas.`}
                {largos > 0 &&
                  ` · ${largos === 1 ? "1 parece inválido" : `${largos} parecen inválidos`} (más de ${MAX_LARGO_CODIGO} caracteres o con espacios).`}
              </p>
            </div>
            <Button
              type="submit"
              className="gap-2"
              disabled={!productoCarga || codigos.length === 0 || demasiados || cargar.isPending}
              data-testid="button-agregar-inventario"
            >
              {cargar.isPending ? <Loader2 className="animate-spin" /> : <PackagePlus />}
              Agregar al inventario
            </Button>
          </form>

          {resultado && (
            <div
              className="mt-4 rounded-lg border bg-muted/40 p-4 text-sm space-y-1"
              role="status"
              data-testid="resultado-carga"
            >
              <p className="font-semibold text-foreground">{nombreProducto(resultado.productoId)}</p>
              <p className="text-emerald-700 dark:text-emerald-300">
                {resultado.agregados === 1 ? "Se agregó 1 código." : `Se agregaron ${resultado.agregados} códigos.`}
              </p>
              {resultado.duplicados > 0 && (
                <p className="text-amber-700 dark:text-amber-300">
                  {resultado.duplicados === 1
                    ? "1 duplicado no se agregó (ya existía o estaba repetido)."
                    : `${resultado.duplicados} duplicados no se agregaron (ya existían o estaban repetidos).`}
                </p>
              )}
              {resultado.invalidos > 0 && (
                <p className="text-destructive">
                  {resultado.invalidos === 1
                    ? "1 código inválido no se agregó."
                    : `${resultado.invalidos} códigos inválidos no se agregaron.`}{" "}
                  Revisa que no tengan espacios, que no pasen de {MAX_LARGO_CODIGO} caracteres y que no empiecen por
                  PRUEBA-.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ListaCodigos />
    </div>
  );
}

function ListaCodigos() {
  const { pedir } = useSesion();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [producto, setProducto] = useState(TODOS);
  const [estado, setEstado] = useState(TODOS);
  const [porAnular, setPorAnular] = useState<CodigoInventarioAdmin | null>(null);

  const consultaCodigos = useInfiniteQuery<
    CodigosInventarioAdmin,
    Error,
    InfiniteData<CodigosInventarioAdmin, string | null>,
    readonly unknown[],
    string | null
  >({
    queryKey: ["admin", "codigos", producto, estado],
    queryFn: ({ pageParam }) =>
      pedir<CodigosInventarioAdmin>(
        `/api/admin/inventario/codigos${consulta({
          productoId: producto === TODOS ? null : producto,
          estado: estado === TODOS ? null : estado,
          limite: TAMANO_PAGINA,
          despues: pageParam,
        })}`,
      ),
    initialPageParam: null,
    getNextPageParam: (ultima) => ultima.siguiente,
    staleTime: 0,
  });

  const anular = useMutation({
    mutationFn: (id: string) =>
      pedir<AnularCodigoResponse>(`/api/admin/inventario/${encodeURIComponent(id)}/anular`, { metodo: "POST" }),
    onSuccess: () => {
      toast({ title: "Código anulado", description: "Ya no se venderá." });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: CLAVE_STOCK });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "No se pudo anular el código", description: mensajeError(error) });
      void queryClient.invalidateQueries({ queryKey: ["admin", "codigos"] });
    },
    onSettled: () => setPorAnular(null),
  });

  const codigos = consultaCodigos.data?.pages.flatMap((p) => p.codigos) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Boxes className="h-5 w-5 text-primary" />
          Códigos cargados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-1.5 sm:w-64">
            <Label htmlFor="filtro-producto">Producto</Label>
            <Select value={producto} onValueChange={setProducto}>
              <SelectTrigger id="filtro-producto" data-testid="select-filtro-producto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {giftCards.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:w-48">
            <Label htmlFor="filtro-estado-codigo">Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="filtro-estado-codigo" data-testid="select-filtro-estado-codigo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {ESTADOS_CODIGO_INVENTARIO.map((e) => (
                  <SelectItem key={e} value={e}>
                    {ETIQUETA_ESTADO_CODIGO[e]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Actualizar códigos"
            onClick={() => void consultaCodigos.refetch()}
            disabled={consultaCodigos.isFetching}
          >
            <RefreshCw className={cn("h-4 w-4", consultaCodigos.isFetching && "animate-spin")} />
          </Button>
        </div>

        {consultaCodigos.isPending ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : consultaCodigos.isError && codigos.length === 0 ? (
          <ErrorCarga error={consultaCodigos.error} onReintentar={() => void consultaCodigos.refetch()} />
        ) : codigos.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No hay códigos con este filtro.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cargado</TableHead>
                  <TableHead>Entregado</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codigos.map((c) => (
                  <TableRow key={c.id} data-testid={`fila-codigo-${c.id}`}>
                    <TableCell className="font-mono text-xs break-all">{c.codigo}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{nombreCorto(c.productoId)}</TableCell>
                    <TableCell>
                      <EstadoCodigoBadge estado={c.estado} />
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{c.pedidoNumero ?? "—"}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{formatoFechaHora(c.creadoEn)}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {c.entregadoEn ? formatoFechaHora(c.entregadoEn) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.estado === "disponible" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPorAnular(c)}
                          data-testid={`button-anular-${c.id}`}
                        >
                          Anular
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {consultaCodigos.hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => void consultaCodigos.fetchNextPage()}
              disabled={consultaCodigos.isFetchingNextPage}
              className="gap-2"
              data-testid="button-cargar-mas-codigos"
            >
              {consultaCodigos.isFetchingNextPage && <Loader2 className="animate-spin" />}
              Cargar más
            </Button>
          </div>
        )}
        {consultaCodigos.isFetchNextPageError && (
          <p className="text-center text-sm text-destructive">{mensajeError(consultaCodigos.error)}</p>
        )}
      </CardContent>

      <AlertDialog open={porAnular !== null} onOpenChange={(abierto) => !abierto && !anular.isPending && setPorAnular(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular este código?</AlertDialogTitle>
            <AlertDialogDescription>
              {porAnular && (
                <>
                  <span className="font-mono text-foreground break-all">{porAnular.codigo}</span> (
                  {nombreCorto(porAnular.productoId)}) dejará de venderse. Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={anular.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={anular.isPending}
              onClick={(e) => {
                // Se cierra al terminar la peticion (onSettled), no al hacer clic.
                e.preventDefault();
                if (porAnular) anular.mutate(porAnular.id);
              }}
              data-testid="button-confirmar-anular"
            >
              {anular.isPending && <Loader2 className="animate-spin" />}
              Anular código
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
