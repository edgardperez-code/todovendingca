import { Plus } from "lucide-react";
import type { FaqItem } from "@/lib/types";

// Acordeón sin JavaScript (details/summary): accesible, indexable y rápido.
export function FaqList({ items, dark = false }: { items: FaqItem[]; dark?: boolean }) {
  return (
    <div className="divide-y divide-ink-200/80 rounded-2xl border border-ink-200 bg-white">
      {items.map((f, i) => (
        <details key={i} className="group px-5 py-4 sm:px-6" {...(i === 0 ? { open: true } : {})}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-ink-900 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="text-base sm:text-lg">{f.q}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-transform group-open:rotate-45 group-open:bg-electric-600 group-open:text-white group-open:border-electric-600">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </span>
          </summary>
          <p className={`mt-3 pr-10 text-[15px] leading-7 ${dark ? "text-ink-600" : "text-ink-600"}`}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
