import { ArrowUpRight, Cookie, CupSoda, Coffee, Dumbbell, Wrench, CreditCard, Building2, Stethoscope, GraduationCap, ShoppingBag, Bus, Check } from "lucide-react";
import { SERVICES, SEGMENTS, BENEFITS } from "@/content/site-content";

const serviceIcons: Record<string, typeof Cookie> = {
  snacks: Cookie,
  bebidas: CupSoda,
  cafe: Coffee,
  deportivo: Dumbbell,
  servicio: Wrench,
  pagos: CreditCard,
};

export function ServiceCards() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => {
        const Icon = serviceIcons[s.id] ?? Cookie;
        const href = "href" in s ? s.href : undefined;
        const Wrapper = href ? "a" : "div";
        return (
          <li key={s.id} className="reveal">
            <Wrapper
              {...(href ? { href } : {})}
              className={`card-soft group flex h-full flex-col p-6 transition-transform ${href ? "hover:-translate-y-1" : ""}`}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 flex items-start justify-between gap-2 text-lg font-semibold">
                {s.title}
                {href && <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-brand-orange opacity-0 transition-opacity group-hover:opacity-100" />}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <li key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/80">
                    {t}
                  </li>
                ))}
              </ul>
            </Wrapper>
          </li>
        );
      })}
    </ul>
  );
}

const segmentIcons: Record<string, typeof Building2> = {
  empresas: Building2,
  clinicas: Stethoscope,
  gimnasios: Dumbbell,
  colegios: GraduationCap,
  comercios: ShoppingBag,
  transporte: Bus,
};

export function SegmentCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SEGMENTS.map((s) => {
        const Icon = segmentIcons[s.id] ?? Building2;
        const href = "href" in s ? s.href : undefined;
        const Wrapper = href ? "a" : "div";
        return (
          <li key={s.id} className="reveal">
            <Wrapper {...(href ? { href } : {})} className={`card-soft group flex h-full gap-4 p-5 transition-transform ${href ? "hover:-translate-y-1" : ""}`}>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="flex items-center gap-1.5 font-semibold">
                  {s.title}
                  {href && <ArrowUpRight className="h-4 w-4 text-brand-orange opacity-0 transition-opacity group-hover:opacity-100" />}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Wrapper>
          </li>
        );
      })}
    </ul>
  );
}

export function BenefitGrid({ items = BENEFITS }: { items?: ReadonlyArray<{ title: string; text: string }> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((b) => (
        <li key={b.title} className="reveal flex gap-3">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold">{b.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
