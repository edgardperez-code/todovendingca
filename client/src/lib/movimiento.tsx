import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type Ref } from "react";
import { motion as fm, useInView, type HTMLMotionProps, type TargetAndTransition } from "framer-motion";
import { prefiereMenosMovimiento } from "@/lib/navegacion";

// Animaciones "al aparecer en pantalla" que no dejan la pagina en blanco.
//
// El problema: con framer-motion, initial={{ opacity: 0 }} sale asi en el HTML
// del servidor. Hasta que carga el JavaScript, la seccion esta invisible y
// despues "aparece": eso se veia como un pestaneo, y si el JS tardaba, como
// una pagina vacia.
//
// La solucion: este `motion.div` se usa igual que el de framer-motion, pero si
// lleva whileInView + initial, el servidor lo pinta YA VISIBLE (initial={false}).
// Al montar en el navegador, solo lo que esta mas abajo de la pantalla se
// oculta al instante (nadie lo ve todavia) y se anima al llegar a el. Lo que ya
// se ve al cargar se queda quieto. Con "reducir movimiento" no se oculta nada.
//
// Lo demas (sin whileInView) pasa tal cual a framer-motion.

// useLayoutEffect avisa en el servidor; alli no hace falta.
const useEfectoAntesDePintar = typeof window === "undefined" ? useEffect : useLayoutEffect;

type PropsDiv = HTMLMotionProps<"div">;
type Objetivo = Exclude<PropsDiv["initial"], boolean | string | string[] | undefined>;

function esObjetivo(valor: PropsDiv["initial"]): valor is Objetivo {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function asignarRef<T>(ref: Ref<T> | undefined, valor: T | null): void {
  if (typeof ref === "function") ref(valor);
  else if (ref) (ref as { current: T | null }).current = valor;
}

type OpcionesVista = NonNullable<Parameters<typeof useInView>[1]>;

type Fase = "visible" | "oculto" | "entrando";

const DivRevelable = forwardRef<HTMLDivElement, PropsDiv & { initial: Objetivo; whileInView: TargetAndTransition }>(
  function DivRevelable({ initial, whileInView, viewport, ...resto }, refExterno) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [fase, setFase] = useState<Fase>("visible");
    const enVista = useInView(ref, {
      once: true,
      margin: viewport?.margin as OpcionesVista["margin"],
      amount: viewport?.amount ?? "some",
    });

    const unirRef = useCallback(
      (nodo: HTMLDivElement | null) => {
        ref.current = nodo;
        asignarRef(refExterno, nodo);
      },
      [refExterno],
    );

    useEfectoAntesDePintar(() => {
      const nodo = ref.current;
      if (!nodo || prefiereMenosMovimiento()) return;
      // Solo se oculta lo que esta por debajo de la pantalla al montar.
      if (nodo.getBoundingClientRect().top > window.innerHeight) setFase("oculto");
    }, []);

    useEffect(() => {
      if (fase === "oculto" && enVista) setFase("entrando");
    }, [fase, enVista]);

    // "oculto" va sin transicion (salto instantaneo, fuera de la vista);
    // "entrando" usa la transicion que cada seccion ya traia (prop transition).
    const animate: TargetAndTransition =
      fase === "oculto" ? { ...(initial as TargetAndTransition), transition: { duration: 0 } } : whileInView;

    return <fm.div ref={unirRef} initial={false} animate={animate} {...resto} />;
  },
);

const Div = forwardRef<HTMLDivElement, PropsDiv>(function Div(props, ref) {
  const { initial, whileInView } = props;
  if (esObjetivo(initial) && typeof whileInView === "object" && whileInView !== null && !Array.isArray(whileInView)) {
    return <DivRevelable ref={ref} {...props} initial={initial} whileInView={whileInView as TargetAndTransition} />;
  }
  return <fm.div ref={ref} {...props} />;
});

// Mismo uso que `motion` de framer-motion para los elementos de este sitio.
export const motion = {
  div: Div,
  img: fm.img,
};
