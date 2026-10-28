import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  MAX_UNIDADES_POR_PEDIDO,
  buscarProducto,
  redondearUsd,
  type Producto,
} from "@shared/catalogo";
import type { ItemCarrito } from "@shared/tienda";

// Carrito de la tienda. Vive solo en el navegador (localStorage) porque la
// compra es sin registro: no hay cuenta donde guardarlo.
//
// SSR: el servidor y el primer render del cliente ven el carrito VACIO y con
// cargado=false. Lo guardado se lee en un useEffect, despues de hidratar; asi
// el HTML del servidor y el del cliente coinciden y no hay error de
// hidratacion. Los componentes que muestran cantidades esperan a `cargado`.
//
// Volver con "atras" (bfcache): el navegador puede restaurar la pagina tal
// como quedo en memoria, sin volver a montar nada. Ese carrito puede ser de
// antes de un pago hecho en otra navegacion (donde se vacio), asi que al
// restaurarse se vuelve a leer de localStorage.

const CLAVE_STORAGE = "tv-carrito-v1";

export interface LineaCarrito {
  producto: Producto;
  cantidad: number;
  subtotalUsd: number;
}

export interface ResultadoAgregar {
  // Unidades que de verdad entraron al carrito.
  agregadas: number;
  // true si se pidieron mas de las que cabian (tope por producto o por pedido).
  limitado: boolean;
}

export interface ValorCarrito {
  cargado: boolean;
  items: ItemCarrito[];
  lineas: LineaCarrito[];
  unidades: number;
  totalUsd: number;
  // Cuantas unidades mas de ese producto caben en el pedido.
  disponiblePara: (productoId: string) => number;
  agregar: (productoId: string, cantidad: number) => ResultadoAgregar;
  fijarCantidad: (productoId: string, cantidad: number) => void;
  quitar: (productoId: string) => void;
  vaciar: () => void;
  // Vuelve a leer lo guardado (sin escribir). La usa /carrito al restaurarse
  // desde el bfcache para tener el carrito al dia ANTES de desbloquear el pago.
  recargar: () => void;
}

const CarritoContext = createContext<ValorCarrito | null>(null);

// Limpia cualquier cosa que venga de localStorage (o de una accion) contra el
// catalogo: descarta productos que ya no existen, une repetidos y acota las
// cantidades al tope por producto y al tope total del pedido. Lo guardado lo
// pudo editar cualquiera, asi que nunca se usa sin pasar por aqui.
function sanear(entrada: unknown): ItemCarrito[] {
  if (!Array.isArray(entrada)) return [];
  const resultado: ItemCarrito[] = [];
  let total = 0;
  for (const crudo of entrada) {
    if (typeof crudo !== "object" || crudo === null) continue;
    const { productoId, cantidad } = crudo as Record<string, unknown>;
    if (typeof productoId !== "string" || typeof cantidad !== "number" || !Number.isFinite(cantidad)) {
      continue;
    }
    const producto = buscarProducto(productoId);
    if (!producto) continue;
    const previo = resultado.find((i) => i.productoId === productoId);
    const actual = previo?.cantidad ?? 0;
    const acotada = Math.min(
      actual + Math.floor(cantidad),
      producto.maxPorPedido,
      actual + (MAX_UNIDADES_POR_PEDIDO - total),
    );
    const sumadas = acotada - actual;
    if (sumadas <= 0) continue;
    if (previo) {
      previo.cantidad = acotada;
    } else {
      resultado.push({ productoId, cantidad: acotada });
    }
    total += sumadas;
  }
  return resultado;
}

function contarUnidades(items: ItemCarrito[]): number {
  return items.reduce((suma, i) => suma + i.cantidad, 0);
}

function calcularDisponible(items: ItemCarrito[], productoId: string): number {
  const producto = buscarProducto(productoId);
  if (!producto) return 0;
  const actual = items.find((i) => i.productoId === productoId)?.cantidad ?? 0;
  return Math.max(
    0,
    Math.min(producto.maxPorPedido - actual, MAX_UNIDADES_POR_PEDIDO - contarUnidades(items)),
  );
}

function leerGuardado(): ItemCarrito[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE_STORAGE);
    return crudo ? sanear(JSON.parse(crudo)) : [];
  } catch {
    // JSON corrupto o localStorage bloqueado: se empieza con el carrito vacio.
    return [];
  }
}

function guardar(items: ItemCarrito[]): void {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(CLAVE_STORAGE);
    } else {
      window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
    }
  } catch {
    // Sin almacenamiento el carrito funciona igual, solo que no sobrevive a
    // una recarga.
  }
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargado, setCargado] = useState(false);
  // Copia sincronica del estado: las acciones calculan sobre ella para que dos
  // clics seguidos (antes de que React vuelva a renderizar) no se pisen.
  const itemsRef = useRef<ItemCarrito[]>([]);
  const cargadoRef = useRef(false);

  // Cada cambio se escribe en localStorage en el acto (no en un efecto): asi,
  // si justo despues se navega o se recarga la pagina, el cambio ya quedo
  // guardado.
  const aplicar = useCallback((siguiente: ItemCarrito[], persistir: boolean) => {
    itemsRef.current = siguiente;
    setItems(siguiente);
    if (persistir) guardar(siguiente);
  }, []);

  useEffect(() => {
    let crudoInicial: string | null = null;
    try {
      crudoInicial = window.localStorage.getItem(CLAVE_STORAGE);
    } catch {
      crudoInicial = null;
    }
    const inicial = leerGuardado();
    // Si al sanear cambio algo (producto retirado, cantidad fuera de rango),
    // se guarda la version limpia.
    const limpio = inicial.length === 0 ? null : JSON.stringify(inicial);
    aplicar(inicial, limpio !== crudoInicial);
    cargadoRef.current = true;
    setCargado(true);

    // Otra pestana cambio el carrito: se refleja aqui sin volver a escribir.
    const alCambiarEnOtraPestana = (evento: StorageEvent) => {
      if (evento.key === CLAVE_STORAGE || evento.key === null) {
        aplicar(leerGuardado(), false);
      }
    };
    // Pagina restaurada desde el bfcache: lo de memoria puede estar viejo.
    const alMostrar = (evento: PageTransitionEvent) => {
      if (evento.persisted) aplicar(leerGuardado(), false);
    };
    window.addEventListener("storage", alCambiarEnOtraPestana);
    window.addEventListener("pageshow", alMostrar);
    return () => {
      window.removeEventListener("storage", alCambiarEnOtraPestana);
      window.removeEventListener("pageshow", alMostrar);
    };
  }, [aplicar]);

  // Por si una accion llegara antes del efecto de carga: se lee lo guardado
  // primero para no sobrescribirlo con el carrito vacio inicial.
  const itemsActuales = useCallback((): ItemCarrito[] => {
    if (!cargadoRef.current) {
      itemsRef.current = leerGuardado();
      cargadoRef.current = true;
      setCargado(true);
    }
    return itemsRef.current;
  }, []);

  const agregar = useCallback(
    (productoId: string, cantidad: number): ResultadoAgregar => {
      const actuales = itemsActuales();
      const pedidas = Math.max(0, Math.floor(cantidad));
      if (pedidas === 0 || !buscarProducto(productoId)) {
        return { agregadas: 0, limitado: pedidas > 0 };
      }
      const agregadas = Math.min(pedidas, calcularDisponible(actuales, productoId));
      if (agregadas > 0) {
        aplicar(sanear([...actuales, { productoId, cantidad: agregadas }]), true);
      }
      return { agregadas, limitado: agregadas < pedidas };
    },
    [aplicar, itemsActuales],
  );

  const quitar = useCallback(
    (productoId: string) => {
      const actuales = itemsActuales();
      aplicar(
        actuales.filter((i) => i.productoId !== productoId),
        true,
      );
    },
    [aplicar, itemsActuales],
  );

  const fijarCantidad = useCallback(
    (productoId: string, cantidad: number) => {
      const actuales = itemsActuales();
      const producto = buscarProducto(productoId);
      const deseada = Math.floor(cantidad);
      if (!producto || !Number.isFinite(deseada) || deseada <= 0) {
        quitar(productoId);
        return;
      }
      const otros = actuales.filter((i) => i.productoId !== productoId);
      const acotada = Math.min(
        deseada,
        producto.maxPorPedido,
        MAX_UNIDADES_POR_PEDIDO - contarUnidades(otros),
      );
      if (acotada <= 0) {
        quitar(productoId);
        return;
      }
      const existe = actuales.some((i) => i.productoId === productoId);
      // Se conserva la posicion de la linea para que no "salte" en la lista.
      const siguiente = existe
        ? actuales.map((i) => (i.productoId === productoId ? { productoId, cantidad: acotada } : i))
        : [...actuales, { productoId, cantidad: acotada }];
      aplicar(sanear(siguiente), true);
    },
    [aplicar, itemsActuales, quitar],
  );

  const vaciar = useCallback(() => {
    itemsActuales();
    aplicar([], true);
  }, [aplicar, itemsActuales]);

  const recargar = useCallback(() => {
    aplicar(leerGuardado(), false);
    if (!cargadoRef.current) {
      cargadoRef.current = true;
      setCargado(true);
    }
  }, [aplicar]);

  const disponiblePara = useCallback(
    (productoId: string) => calcularDisponible(items, productoId),
    [items],
  );

  const valor = useMemo<ValorCarrito>(() => {
    const lineas: LineaCarrito[] = [];
    for (const item of items) {
      const producto = buscarProducto(item.productoId);
      if (!producto) continue;
      lineas.push({
        producto,
        cantidad: item.cantidad,
        subtotalUsd: redondearUsd(producto.precioUsd * item.cantidad),
      });
    }
    return {
      cargado,
      items,
      lineas,
      unidades: contarUnidades(items),
      totalUsd: redondearUsd(lineas.reduce((suma, l) => suma + l.subtotalUsd, 0)),
      disponiblePara,
      agregar,
      fijarCantidad,
      quitar,
      vaciar,
      recargar,
    };
  }, [items, cargado, disponiblePara, agregar, fijarCantidad, quitar, vaciar, recargar]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): ValorCarrito {
  const valor = useContext(CarritoContext);
  if (!valor) {
    throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  }
  return valor;
}
