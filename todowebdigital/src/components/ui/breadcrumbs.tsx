import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export function Breadcrumbs({ items, dark = false }: { items: { name: string; path: string }[]; dark?: boolean }) {
  const all = [{ name: "Inicio", path: "/" }, ...items];
  return (
    <nav aria-label="Ruta de navegación" className={dark ? "text-ink-300" : "text-ink-500"}>
      <JsonLd data={breadcrumbJsonLd(all)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {all.map((it, i) => {
          const last = i === all.length - 1;
          return (
            <li key={it.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />}
              {last ? (
                <span aria-current="page" className={dark ? "text-white" : "text-ink-900"}>{it.name}</span>
              ) : (
                <Link href={it.path} className="hover:underline">{it.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
