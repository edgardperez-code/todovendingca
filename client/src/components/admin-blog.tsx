// Pestaña "Blog" del panel /admin: lista de artículos, redacción con IA
// (Claude) y editor con vista previa. Lo que genera la IA se carga en el editor
// y NO se publica solo: hay que revisarlo y pulsar Publicar.
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { EstilosBlog } from "@/components/blog-estilos";
import {
  CATEGORIAS_BLOG,
  markdownAHtml,
  slugificar,
  slugificarEscribiendo,
  type Articulo,
  type ArticuloEntrada,
  type ArticuloGenerado,
  type GenerarArticulo,
} from "@shared/blog";
import { ArrowLeft, ExternalLink, FilePlus2, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

type Pedir = <T>(ruta: string, opciones?: { metodo?: "GET" | "POST" | "PUT" | "DELETE"; cuerpo?: unknown }) => Promise<T>;

const CLAVE_LISTA = ["admin", "articulos"] as const;

function mensajeError(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Ocurrió un error inesperado.";
}

function fechaCorta(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Caracas" });
}

const lista = (texto: string) =>
  texto
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

// Estado del editor: un artículo existente, uno nuevo (quizá generado por IA) o ninguno.
// version: el actualizadoEn del artículo al abrirlo (null si es nuevo); el
// servidor rechaza el guardado si otro lo cambió mientras tanto.
type Edicion = { id: string | null; version: string | null; datos: ArticuloEntrada; recuperado?: boolean } | null;

// === Cambios sin guardar ===
// El panel pregunta antes de "Salir" si el editor tiene cambios sin guardar.
let cambiosSinGuardar = false;
export function hayArticuloSinGuardar(): boolean {
  return cambiosSinGuardar;
}

// Respaldo en el navegador del artículo que se está editando: si la sesión
// vence (401), se pulsa "Salir" o se cierra la página, al volver se ofrece
// recuperarlo. Se borra al guardar o al descartar los cambios a propósito.
const CLAVE_RESPALDO = "tv-blog-respaldo";
interface Respaldo {
  id: string | null;
  version: string | null;
  datos: ArticuloEntrada;
  guardadoEn: string;
}
function leerRespaldo(): Respaldo | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE_RESPALDO);
    const r = crudo ? (JSON.parse(crudo) as Respaldo) : null;
    return r && r.datos && typeof r.datos.titulo === "string" ? r : null;
  } catch {
    return null;
  }
}
function escribirRespaldo(r: Respaldo | null) {
  try {
    if (r) window.localStorage.setItem(CLAVE_RESPALDO, JSON.stringify(r));
    else window.localStorage.removeItem(CLAVE_RESPALDO);
  } catch {
    // Almacenamiento lleno o bloqueado: el respaldo es solo una ayuda.
  }
}

const VACIO: ArticuloEntrada = {
  titulo: "",
  slug: "",
  resumen: "",
  contenido: "",
  categoria: "Guías",
  etiquetas: [],
  metaTitulo: null,
  metaDescripcion: null,
  palabrasClave: [],
  faq: [],
  imagenPortada: null,
  estado: "borrador",
  generadoConIa: false,
  prompt: null,
};

function deArticulo(a: Articulo): ArticuloEntrada {
  const { id: _i, minutosLectura: _m, publicadoEn: _p, creadoEn: _c, actualizadoEn: _u, ...datos } = a;
  return datos;
}

export function BlogAdmin({ pedir }: { pedir: Pedir }) {
  const [edicion, setEdicion] = useState<Edicion>(null);
  const [generando, setGenerando] = useState(false);
  const [abriendo, setAbriendo] = useState<string | null>(null);
  const [respaldo, setRespaldo] = useState<Respaldo | null>(null);
  const { toast } = useToast();
  // Se lee después de montar (localStorage no existe en el servidor).
  useEffect(() => {
    setRespaldo(leerRespaldo());
  }, []);
  const consulta = useQuery({
    queryKey: CLAVE_LISTA,
    queryFn: () => pedir<{ ok: true; iaConfigurada: boolean; articulos: Articulo[] }>("/api/admin/articulos"),
  });

  // Se abre la versión actual del servidor, no la copia de la lista (que puede
  // ser vieja si alguien lo editó en otra pestaña).
  // Solo hay un respaldo: abrir otro artículo con uno pendiente lo reemplazaría.
  const sustituirRespaldo = (): boolean => {
    if (!respaldo) return true;
    const ok = window.confirm(
      `Hay un artículo sin guardar («${respaldo.datos.titulo || "sin título"}»). Si abres otro, ese respaldo se perderá. ¿Continuar?`,
    );
    if (ok) {
      escribirRespaldo(null);
      setRespaldo(null);
    }
    return ok;
  };

  const abrir = async (id: string) => {
    if (abriendo || !sustituirRespaldo()) return;
    setAbriendo(id);
    try {
      const r = await pedir<{ ok: true; articulo: Articulo }>(`/api/admin/articulos/${id}`);
      setEdicion({ id, version: r.articulo.actualizadoEn, datos: deArticulo(r.articulo) });
    } catch (e) {
      toast({ variant: "destructive", title: "No se pudo abrir el artículo", description: mensajeError(e) });
    } finally {
      setAbriendo(null);
    }
  };

  if (edicion) {
    return (
      <Editor
        key={edicion.id ?? "nuevo"}
        pedir={pedir}
        edicion={edicion}
        onSalir={() => {
          setEdicion(null);
          setRespaldo(leerRespaldo());
        }}
      />
    );
  }
  if (generando) {
    return (
      <Generador
        pedir={pedir}
        iaConfigurada={consulta.data?.iaConfigurada}
        onCancelar={() => setGenerando(false)}
        onListo={(g, prompt) => {
          setGenerando(false);
          setEdicion({
            id: null,
            version: null,
            datos: {
              ...VACIO,
              ...g,
              metaTitulo: g.metaTitulo,
              metaDescripcion: g.metaDescripcion,
              generadoConIa: true,
              prompt,
            },
          });
        }}
      />
    );
  }

  const articulos = consulta.data?.articulos ?? [];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Artículos del blog</CardTitle>
            <CardDescription>
              Escribe un tema y la IA redacta el artículo; lo revisas y lo publicas en{" "}
              <a className="underline" href="/blog" target="_blank" rel="noopener noreferrer">
                /blog
              </a>
              .
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2" onClick={() => sustituirRespaldo() && setGenerando(true)} disabled={abriendo !== null} data-testid="button-generar-articulo">
              <Sparkles className="h-4 w-4" />
              Nuevo con IA
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => sustituirRespaldo() && setEdicion({ id: null, version: null, datos: VACIO })}
              disabled={abriendo !== null}
              data-testid="button-nuevo-articulo"
            >
              <FilePlus2 className="h-4 w-4" />
              En blanco
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {respaldo && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100" role="alert">
              <p>
                Hay un artículo sin guardar: <strong>«{respaldo.datos.titulo || "sin título"}»</strong> (
                {new Date(respaldo.guardadoEn).toLocaleString("es-VE", { timeZone: "America/Caracas" })}).
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    setEdicion({ id: respaldo.id, version: respaldo.version, datos: respaldo.datos, recuperado: true })
                  }
                  data-testid="button-recuperar-articulo"
                >
                  Recuperar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (!window.confirm("¿Descartar el artículo sin guardar? No se puede deshacer.")) return;
                    escribirRespaldo(null);
                    setRespaldo(null);
                  }}
                >
                  Descartar
                </Button>
              </div>
            </div>
          )}
          {consulta.isPending ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </p>
          ) : consulta.isError ? (
            <p className="text-sm text-destructive">{mensajeError(consulta.error)}</p>
          ) : articulos.length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="admin-blog-vacio">
              Todavía no hay artículos. Empieza con «Nuevo con IA».
            </p>
          ) : (
            <ul className="divide-y">
              {articulos.map((a) => (
                <FilaArticulo key={a.id} a={a} pedir={pedir} abriendo={abriendo === a.id} bloqueado={abriendo !== null} onEditar={() => abrir(a.id)} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilaArticulo({
  a,
  pedir,
  abriendo,
  bloqueado,
  onEditar,
}: {
  a: Articulo;
  pedir: Pedir;
  abriendo: boolean;
  bloqueado: boolean;
  onEditar: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [confirmar, setConfirmar] = useState(false);
  const borrar = useMutation({
    mutationFn: () => pedir(`/api/admin/articulos/${a.id}`, { metodo: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Artículo borrado" });
      qc.invalidateQueries({ queryKey: CLAVE_LISTA });
    },
    onError: (e) => toast({ variant: "destructive", title: "No se pudo borrar", description: mensajeError(e) }),
  });
  return (
    <li className="py-3 flex flex-col md:flex-row md:items-center gap-3 justify-between" data-testid={`fila-articulo-${a.slug}`}>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{a.titulo}</p>
        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
          <Badge variant={a.estado === "publicado" ? "default" : "secondary"}>{a.estado === "publicado" ? "Publicado" : "Borrador"}</Badge>
          {a.generadoConIa && <Badge variant="outline">IA</Badge>}
          <span>{a.categoria}</span>
          <span>· {a.estado === "publicado" ? `publicado ${fechaCorta(a.publicadoEn)}` : `editado ${fechaCorta(a.actualizadoEn)}`}</span>
          <span>· /blog/{a.slug}</span>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {a.estado === "publicado" && (
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Ver
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-1" onClick={onEditar} disabled={bloqueado}>
          {abriendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />} Editar
        </Button>
        <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={() => setConfirmar(true)} disabled={borrar.isPending}>
          <Trash2 className="h-4 w-4" /> Borrar
        </Button>
      </div>
      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              «{a.titulo}» se borrará para siempre y su dirección dejará de funcionar. Si solo quieres ocultarlo, edítalo y
              pásalo a borrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => borrar.mutate()}>Borrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

// === Generador con IA ===

const IDEAS = [
  "¿Cuánto cuesta poner una máquina expendedora en mi empresa en Lechería? (spoiler: la instalación es gratis)",
  "Máquina de café en grano vs. café instantáneo en la oficina: diferencias y cuál conviene",
  "Cómo pagar con Pago Móvil en una máquina expendedora, paso a paso",
  "Beneficios del vending en clínicas para pacientes, familiares y personal de turno",
  "Qué snacks y bebidas poner en la máquina expendedora de un colegio",
];

function Generador({
  pedir,
  iaConfigurada,
  onCancelar,
  onListo,
}: {
  pedir: Pedir;
  // undefined mientras se sabe (cargando o error): no se muestra el aviso.
  iaConfigurada: boolean | undefined;
  onCancelar: () => void;
  onListo: (g: ArticuloGenerado, prompt: string) => void;
}) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [tono, setTono] = useState<GenerarArticulo["tono"]>("cercano");
  const [extension, setExtension] = useState<GenerarArticulo["extension"]>("medio");
  const [palabras, setPalabras] = useState("");
  const [publico, setPublico] = useState("");
  const [categoria, setCategoria] = useState("");
  const generar = useMutation({
    mutationFn: (cuerpo: GenerarArticulo) =>
      pedir<{ ok: true; articulo: ArticuloGenerado }>("/api/admin/articulos/generar", { metodo: "POST", cuerpo }),
    onSuccess: (r) => {
      toast({ title: "Artículo redactado", description: "Revísalo y pulsa Publicar cuando esté listo." });
      onListo(r.articulo, prompt.trim());
    },
    onError: (e) => toast({ variant: "destructive", title: "No se pudo generar", description: mensajeError(e) }),
  });

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    generar.mutate({ prompt: prompt.trim(), tono, extension, palabrasClave: lista(palabras), publico: publico.trim(), categoria });
  };

  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" size="sm" className="w-fit gap-1 -ml-2 mb-2" onClick={onCancelar} disabled={generar.isPending}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Nuevo artículo con IA
        </CardTitle>
        <CardDescription>
          Cuéntale a la IA sobre qué escribir. Redacta título, URL, resumen, metadatos SEO, contenido y preguntas frecuentes.
          Tarda de 1 a 3 minutos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {iaConfigurada === false && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100" role="alert">
            La IA no está configurada en el servidor: falta la variable ANTHROPIC_API_KEY. Puedes escribir artículos «En
            blanco» mientras tanto.
          </p>
        )}
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-prompt">Tema e instrucciones</Label>
            <Textarea
              id="blog-prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej.: Escribe sobre los beneficios de tener una máquina de café en grano en una clínica. Menciona que la instalación es gratis y que se paga con Pago Móvil."
              data-testid="input-prompt-articulo"
            />
            <div className="flex flex-wrap gap-2">
              {IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  className="text-xs rounded-full border px-3 py-1 text-muted-foreground hover:bg-muted text-left"
                  onClick={() => setPrompt(idea)}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Tono</Label>
              <Select value={tono} onValueChange={(v) => setTono(v as GenerarArticulo["tono"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cercano">Cercano</SelectItem>
                  <SelectItem value="profesional">Profesional</SelectItem>
                  <SelectItem value="didactico">Didáctico (paso a paso)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Extensión</Label>
              <Select value={extension} onValueChange={(v) => setExtension(v as GenerarArticulo["extension"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corto">Corto (700–900 palabras)</SelectItem>
                  <SelectItem value="medio">Medio (1200–1600)</SelectItem>
                  <SelectItem value="largo">Largo (1900–2500)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoria || "auto"} onValueChange={(v) => setCategoria(v === "auto" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Que la elija la IA</SelectItem>
                  {CATEGORIAS_BLOG.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blog-palabras">Palabras clave (separadas por comas, opcional)</Label>
              <Input id="blog-palabras" value={palabras} onChange={(e) => setPalabras(e.target.value)} placeholder="máquinas expendedoras Lechería, vending clínicas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-publico">Público (opcional)</Label>
              <Input id="blog-publico" value={publico} onChange={(e) => setPublico(e.target.value)} placeholder="Gerentes de clínicas en Anzoátegui" />
            </div>
          </div>
          <Button type="submit" className="gap-2" disabled={generar.isPending || prompt.trim().length < 10 || iaConfigurada === false} data-testid="button-enviar-generar">
            {generar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generar.isPending ? "Redactando… (1 a 3 minutos)" : "Generar artículo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// === Editor ===

function Contador({ valor, ideal }: { valor: string; ideal: [number, number] }) {
  const n = valor.length;
  const ok = n >= ideal[0] && n <= ideal[1];
  return (
    <span className={ok ? "text-xs text-muted-foreground" : "text-xs text-amber-600"}>
      {n} caracteres (ideal {ideal[0]}–{ideal[1]})
    </span>
  );
}

function Editor({ pedir, edicion, onSalir }: { pedir: Pedir; edicion: NonNullable<Edicion>; onSalir: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [id, setId] = useState(edicion.id);
  const [version, setVersion] = useState(edicion.version);
  const [d, setD] = useState<ArticuloEntrada>(edicion.datos);
  // La URL sigue al título mientras no se edite a mano (y solo en artículos nuevos).
  const [slugManual, setSlugManual] = useState(edicion.id !== null || edicion.datos.slug !== "");
  const [etiquetas, setEtiquetas] = useState(edicion.datos.etiquetas.join(", "));
  const [palabras, setPalabras] = useState(edicion.datos.palabrasClave.join(", "));
  const vista = useMemo(() => markdownAHtml(d.contenido), [d.contenido]);

  // Cambios sin guardar: se compara con lo último guardado. Un artículo nuevo
  // (por ejemplo, el que acaba de redactar la IA) cuenta como sin guardar.
  const foto = (datos: ArticuloEntrada, et: string, pc: string) => JSON.stringify([datos, et, pc]);
  // Un respaldo recuperado cuenta como sin guardar hasta que se guarde.
  const [guardado, setGuardado] = useState(() =>
    edicion.id && !edicion.recuperado
      ? foto(edicion.datos, edicion.datos.etiquetas.join(", "), edicion.datos.palabrasClave.join(", "))
      : foto(VACIO, "", ""),
  );
  const sucio = foto(d, etiquetas, palabras) !== guardado;

  // Aviso para el botón "Salir" del panel.
  useEffect(() => {
    cambiosSinGuardar = sucio;
    return () => {
      cambiosSinGuardar = false;
    };
  }, [sucio]);

  // Respaldo en el navegador mientras haya cambios sin guardar (medio segundo
  // después de la última tecla, para no escribir en cada una).
  useEffect(() => {
    if (!sucio) return;
    const t = window.setTimeout(() => {
      escribirRespaldo({
        id,
        version,
        datos: { ...d, etiquetas: lista(etiquetas), palabrasClave: lista(palabras) },
        guardadoEn: new Date().toISOString(),
      });
    }, 500);
    return () => window.clearTimeout(t);
  }, [sucio, d, etiquetas, palabras, id, version]);

  // Cerrar o recargar la página con cambios sin guardar pide confirmación.
  useEffect(() => {
    if (!sucio) return;
    const avisar = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [sucio]);

  const volver = () => {
    if (sucio && !window.confirm("Tienes cambios sin guardar en este artículo. Si vuelves a la lista se perderán. ¿Volver igual?")) return;
    // Volver a propósito descarta los cambios: también el respaldo.
    escribirRespaldo(null);
    onSalir();
  };

  const cambiar = <K extends keyof ArticuloEntrada>(k: K, v: ArticuloEntrada[K]) => setD((x) => ({ ...x, [k]: v }));

  const guardar = useMutation({
    mutationFn: (estado: ArticuloEntrada["estado"]) => {
      const cuerpo: ArticuloEntrada = {
        ...d,
        estado,
        etiquetas: lista(etiquetas),
        palabrasClave: lista(palabras),
        metaTitulo: d.metaTitulo?.trim() || null,
        metaDescripcion: d.metaDescripcion?.trim() || null,
        faq: d.faq.filter((p) => p.q.trim() && p.a.trim()),
      };
      return id
        ? pedir<{ ok: true; articulo: Articulo }>(`/api/admin/articulos/${id}`, {
            metodo: "PUT",
            cuerpo: { ...cuerpo, versionEsperada: version },
          })
        : pedir<{ ok: true; articulo: Articulo }>("/api/admin/articulos", { metodo: "POST", cuerpo });
    },
    onSuccess: (r) => {
      const datos = deArticulo(r.articulo);
      const et = datos.etiquetas.join(", ");
      const pc = datos.palabrasClave.join(", ");
      setId(r.articulo.id);
      // Ya guardado: cambiar el título no mueve la URL (igual que al reabrirlo).
      setSlugManual(true);
      setVersion(r.articulo.actualizadoEn);
      setD(datos);
      setEtiquetas(et);
      setPalabras(pc);
      setGuardado(foto(datos, et, pc));
      escribirRespaldo(null);
      qc.invalidateQueries({ queryKey: CLAVE_LISTA });
      toast({
        title: r.articulo.estado === "publicado" ? "Artículo publicado" : "Borrador guardado",
        description: r.articulo.estado === "publicado" ? `Ya está en /blog/${r.articulo.slug}` : "No se ve en el sitio hasta que lo publiques.",
      });
    },
    onError: (e) => toast({ variant: "destructive", title: "No se pudo guardar", description: mensajeError(e) }),
  });

  const listo = d.titulo.trim().length >= 5 && d.slug.length >= 3;

  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" size="sm" className="w-fit gap-1 -ml-2 mb-2" onClick={volver}>
          <ArrowLeft className="h-4 w-4" /> Volver a la lista
        </Button>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {id ? "Editar artículo" : "Nuevo artículo"}
          <Badge variant={d.estado === "publicado" ? "default" : "secondary"}>{d.estado === "publicado" ? "Publicado" : "Borrador"}</Badge>
          {d.generadoConIa && <Badge variant="outline">Redactado con IA</Badge>}
        </CardTitle>
        {d.generadoConIa && (
          <CardDescription>
            Revisa los datos antes de publicar: la IA no inventa cifras a propósito, pero conviene leerlo completo.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {/* Mientras se guarda no se puede editar: así lo que devuelve el servidor
            no borra algo escrito durante el guardado. */}
        <fieldset disabled={guardar.isPending} className="space-y-5 min-w-0">
        {sucio && (
          <p className="text-xs text-amber-600" role="status">
            Hay cambios sin guardar.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="ed-titulo">Título</Label>
          <Input
            id="ed-titulo"
            value={d.titulo}
            onChange={(e) => {
              const titulo = e.target.value;
              setD((x) => ({ ...x, titulo, slug: slugManual ? x.slug : slugificar(titulo) }));
            }}
            data-testid="input-titulo-articulo"
          />
          <Contador valor={d.titulo} ideal={[40, 70]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ed-slug">Dirección (URL)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">/blog/</span>
            <Input
              id="ed-slug"
              value={d.slug}
              onChange={(e) => {
                setSlugManual(true);
                cambiar("slug", slugificarEscribiendo(e.target.value));
              }}
              onBlur={() => cambiar("slug", slugificar(d.slug))}
            />
          </div>
          {id && d.estado === "publicado" && (
            <span className="text-xs text-amber-600">Cambiar la URL de un artículo publicado rompe los enlaces que ya lo compartieron.</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ed-resumen">Resumen (sale en la tarjeta del blog)</Label>
          <Textarea id="ed-resumen" rows={2} value={d.resumen} onChange={(e) => cambiar("resumen", e.target.value)} />
          <Contador valor={d.resumen} ideal={[120, 220]} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={d.categoria} onValueChange={(v) => cambiar("categoria", v)} disabled={guardar.isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set([...CATEGORIAS_BLOG, d.categoria])).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ed-etiquetas">Etiquetas (separadas por comas)</Label>
            <Input id="ed-etiquetas" value={etiquetas} onChange={(e) => setEtiquetas(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ed-imagen">Imagen de portada (URL https o ruta /assets/…, opcional)</Label>
          <Input
            id="ed-imagen"
            value={d.imagenPortada ?? ""}
            onChange={(e) => cambiar("imagenPortada", e.target.value || null)}
            placeholder="/assets/maquina_vending_hero.webp"
          />
        </div>

        <div className="space-y-2">
          <Label>Contenido (Markdown: ## para subtítulos, **negritas**, - listas)</Label>
          <Tabs defaultValue="escribir">
            <TabsList>
              <TabsTrigger value="escribir">Escribir</TabsTrigger>
              <TabsTrigger value="vista">Vista previa</TabsTrigger>
            </TabsList>
            <TabsContent value="escribir">
              <Textarea
                rows={22}
                className="font-mono text-sm"
                value={d.contenido}
                onChange={(e) => cambiar("contenido", e.target.value)}
                data-testid="input-contenido-articulo"
              />
            </TabsContent>
            <TabsContent value="vista">
              <EstilosBlog />
              <div className="rounded-md border p-5 max-h-[640px] overflow-auto">
                <div className="vb-prosa" dangerouslySetInnerHTML={{ __html: vista }} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Preguntas frecuentes (salen al final y Google/las IAs las usan)</Label>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => cambiar("faq", [...d.faq, { q: "", a: "" }])}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
          {d.faq.map((p, i) => (
            <div key={i} className="rounded-md border p-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={p.q}
                  placeholder="Pregunta"
                  onChange={(e) => cambiar("faq", d.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Quitar pregunta" onClick={() => cambiar("faq", d.faq.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                rows={2}
                value={p.a}
                placeholder="Respuesta"
                onChange={(e) => cambiar("faq", d.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
              />
            </div>
          ))}
        </div>

        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">SEO (título y descripción para Google)</summary>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ed-meta-t">Título SEO (si se deja vacío, se usa el título)</Label>
              <Input id="ed-meta-t" value={d.metaTitulo ?? ""} onChange={(e) => cambiar("metaTitulo", e.target.value || null)} />
              <Contador valor={d.metaTitulo ?? ""} ideal={[30, 60]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ed-meta-d">Descripción SEO (si se deja vacía, se usa el resumen)</Label>
              <Textarea id="ed-meta-d" rows={2} value={d.metaDescripcion ?? ""} onChange={(e) => cambiar("metaDescripcion", e.target.value || null)} />
              <Contador valor={d.metaDescripcion ?? ""} ideal={[120, 160]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ed-palabras">Palabras clave (separadas por comas)</Label>
              <Input id="ed-palabras" value={palabras} onChange={(e) => setPalabras(e.target.value)} />
            </div>
          </div>
        </details>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button className="gap-2" disabled={!listo || guardar.isPending} onClick={() => guardar.mutate("publicado")} data-testid="button-publicar-articulo">
            {guardar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {d.estado === "publicado" ? "Guardar cambios" : "Publicar"}
          </Button>
          <Button variant="outline" disabled={!listo || guardar.isPending} onClick={() => guardar.mutate("borrador")} data-testid="button-borrador-articulo">
            {d.estado === "publicado" ? "Pasar a borrador (ocultar)" : "Guardar borrador"}
          </Button>
          {id && d.estado === "publicado" && (
            <Button asChild variant="ghost" className="gap-1">
              <a href={`/blog/${d.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Ver en el sitio
              </a>
            </Button>
          )}
        </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
