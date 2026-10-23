// Franja de datos clave: la "respuesta corta" de cada página.
// Está pensada para que una persona apurada, Google y un asistente de IA
// se lleven lo esencial en cinco segundos. El párrafo lleva la clase
// `speakable`, declarada en el schema WebPage.
export type Fact = { value: string; label: string };

export function KeyFacts({
  facts,
  summary,
  id = "resumen",
}: {
  facts: Fact[];
  summary: string;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="border-y border-border bg-muted/50">
      <div className="container py-8 md:py-10">
        <h2 id={`${id}-titulo`} className="sr-only">
          En resumen
        </h2>
        <p className="speakable reveal max-w-4xl text-base leading-relaxed text-foreground md:text-lg">{summary}</p>
        <dl className="reveal mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          {facts.map((f) => (
            <div key={f.label} className="border-l-2 border-brand-orange pl-4">
              <dt className="order-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{f.label}</dt>
              <dd className="order-1 font-display text-2xl font-semibold leading-none text-foreground md:text-3xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
