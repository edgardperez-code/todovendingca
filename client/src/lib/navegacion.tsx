import { forwardRef, useEffect, useRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { Link, useLocation } from "wouter";

// Navegacion interna sin recargar la pagina.
//
// Antes los enlaces del menu eran <a href> normales: cada clic pedia la pagina
// entera al servidor y se veia un pestaneo. Con <Link> de wouter se cambia de
// ruta en el navegador y React solo repinta lo que cambia.
//
// Los enlaces "/#seccion" llevan al home y luego bajan a esa seccion. Si ya
// estas en el home, solo bajan (sin navegar).
//
// "/cafe-oriente" NO es ruta de React (Express sirve un HTML aparte), asi que
// sigue siendo un <a> normal en quien lo use.

// true si el usuario pidio menos movimiento en su sistema.
export function prefiereMenosMovimiento(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Baja suavemente hasta el elemento con ese id. Devuelve false si no existe
// (por ejemplo, la pagina aun no lo pinto).
export function desplazarASeccion(id: string, suave = true): boolean {
  if (!id) return false;
  const destino = document.getElementById(id);
  if (!destino) return false;
  destino.scrollIntoView({ behavior: suave && !prefiereMenosMovimiento() ? "smooth" : "auto", block: "start" });
  return true;
}

function separarHash(href: string): { ruta: string; id: string } {
  const posicion = href.indexOf("#");
  if (posicion === -1) return { ruta: href, id: "" };
  return { ruta: href.slice(0, posicion) || "/", id: decodeURIComponent(href.slice(posicion + 1)) };
}

type PropsEnlace = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

// <a> para rutas internas de React. Acepta "/ruta" y "/ruta#seccion".
export const EnlaceInterno = forwardRef<HTMLAnchorElement, PropsEnlace>(function EnlaceInterno(
  { href, onClick, ...resto },
  ref,
) {
  const [ubicacion] = useLocation();

  const alHacerClic = (evento: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(evento);
    if (evento.defaultPrevented) return;
    const { ruta, id } = separarHash(href);
    // Ya estas en esa pagina y el enlace apunta a una seccion: solo se baja.
    // Se anota el #seccion en la URL sin agregar otra entrada al historial.
    if (id && ruta === ubicacion && desplazarASeccion(id)) {
      evento.preventDefault();
      window.history.replaceState(window.history.state, "", `${ruta}#${encodeURIComponent(id)}`);
    } else if (!id && ruta === ubicacion) {
      // Misma pagina sin seccion (el logo estando en el home): se sube arriba
      // en vez de apilar una entrada repetida en el historial.
      evento.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(window.history.state, "", ruta);
    }
    // Si no, <Link> navega y GestorScroll baja a la seccion al pintar la ruta.
  };

  return <Link ref={ref} href={href} onClick={alHacerClic} {...resto} />;
});

// Ajusta el scroll al cambiar de ruta (va en App, una sola vez):
// - Ruta nueva sin #seccion: la pagina empieza arriba.
// - Ruta nueva con #seccion: baja a esa seccion cuando ya esta pintada.
// - Atras/adelante del navegador: no toca nada, el navegador restaura la
//   posicion que tenias.
// - La primera carga tampoco: el navegador ya resuelve el #seccion solo.
export function GestorScroll() {
  const [ubicacion] = useLocation();
  const primeraVez = useRef(true);
  // Ruta a la que llevo el ultimo atras/adelante (null si la ultima
  // navegacion fue un clic). Un atras que solo cambia el #seccion no cambia la
  // ruta; por eso cualquier navegacion nueva por clic (pushState) lo borra.
  const porHistorial = useRef<string | null>(null);

  useEffect(() => {
    const alVolver = () => {
      porHistorial.current = window.location.pathname;
    };
    const alNavegar = () => {
      porHistorial.current = null;
    };
    window.addEventListener("popstate", alVolver);
    // wouter emite "pushState" en window cada vez que navega.
    window.addEventListener("pushState", alNavegar);
    return () => {
      window.removeEventListener("popstate", alVolver);
      window.removeEventListener("pushState", alNavegar);
    };
  }, []);

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    const volvio = porHistorial.current === ubicacion;
    porHistorial.current = null;
    if (volvio) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) {
      // Se espera un cuadro para que la pagina nueva ya este en el DOM.
      const cuadro = window.requestAnimationFrame(() => {
        if (!desplazarASeccion(id)) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
      return () => window.cancelAnimationFrame(cuadro);
    }
    // "instant" a proposito: index.css pone scroll-behavior: smooth en <html> y
    // la pagina nueva no debe verse bajando desde donde quedo la anterior.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [ubicacion]);

  return null;
}
