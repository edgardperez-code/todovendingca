import { STEPS } from "@/content/site-content";
import { SectionHeading } from "./section-heading";

export function StepsBlock({ id = "como-funciona" }: { id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28" aria-labelledby={`${id}-titulo`}>
      <div className="container">
        <SectionHeading
          eyebrow="Cómo funciona"
          id={`${id}-titulo`}
          title={
            <>
              De tu mensaje a la máquina instalada, <span className="mark-accent">sin costo</span>
            </>
          }
          lead="Cuatro pasos. Tú pones el espacio; Todo Vending CA pone la máquina, los productos y el servicio."
        />
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="reveal card-soft relative p-6">
              <span className="font-display text-4xl font-semibold text-brand-orange/80">{s.n}</span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              {i < STEPS.length - 1 && (
                <span className="absolute right-0 top-1/2 hidden h-px w-5 translate-x-full bg-border lg:block" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
